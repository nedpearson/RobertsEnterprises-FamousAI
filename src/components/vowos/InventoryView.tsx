import { useMemo, useState } from 'react';
import {
  Search, Plus, Pencil, PackagePlus, Loader2, ArrowLeftRight, AlertTriangle, Boxes, DollarSign, TrendingUp,
} from 'lucide-react';
import {
  Gown,
  GOWN_STYLES,
  GOWN_CATEGORIES,
  formatCents,
  locationById,
  marginPct,
} from '@/data/vowosData';
import { useVowosData } from '@/contexts/VowosDataContext';
import { PageHeader, StatusBadge, inputCls, btnPrimary } from './ui';
import { GownFormModal, AdjustStockModal } from './GownModals';
import { TransferModal } from './TransfersView';
import { LocationBadge } from './LocationSelect';

const CONDITION_BADGE: Record<string, string> = {
  New: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Sample: 'bg-sky-50 text-sky-700 ring-sky-200',
  Consignment: 'bg-violet-50 text-violet-700 ring-violet-200',
  Clearance: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export default function InventoryView() {
  const { gowns, loading, activeLocation } = useVowosData();
  const [query, setQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingGown, setEditingGown] = useState<Gown | null>(null);
  const [stockGown, setStockGown] = useState<Gown | null>(null);
  const [transferGown, setTransferGown] = useState<Gown | null>(null);

  const styles = useMemo(
    () => ['All', ...Array.from(new Set([...GOWN_STYLES, ...gowns.map((g) => g.style)]))],
    [gowns],
  );
  const categories = useMemo(
    () => ['All', ...Array.from(new Set([...GOWN_CATEGORIES, ...gowns.map((g) => g.category)]))],
    [gowns],
  );

  const q = query.toLowerCase();
  const filtered = gowns.filter(
    (g) =>
      (styleFilter === 'All' || g.style === styleFilter) &&
      (categoryFilter === 'All' || g.category === categoryFilter) &&
      (!lowStockOnly || g.stock <= g.reorderPoint) &&
      (g.name.toLowerCase().includes(q) ||
        g.designer.toLowerCase().includes(q) ||
        g.sku.toLowerCase().includes(q) ||
        g.vendor.toLowerCase().includes(q) ||
        g.color.toLowerCase().includes(q)),
  );

  // ── Inventory valuation across the current scope ──
  const stats = useMemo(() => {
    const units = gowns.reduce((s, g) => s + g.stock, 0);
    const retail = gowns.reduce((s, g) => s + g.stock * g.priceCents, 0);
    const cost = gowns.reduce((s, g) => s + g.stock * g.costCents, 0);
    const lowStock = gowns.filter((g) => g.stock <= g.reorderPoint).length;
    return { units, retail, cost, profit: retail - cost, lowStock };
  }, [gowns]);

  const scopeLabel =
    activeLocation === 'all' ? 'across all four stores' : `at ${locationById(activeLocation).short}`;

  const openAdd = () => {
    setEditingGown(null);
    setFormOpen(true);
  };

  const openEdit = (g: Gown) => {
    setEditingGown(g);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Gown Inventory"
        subtitle={`${gowns.length} styles · ${stats.units} pieces ${scopeLabel}`}
        action={
          <button onClick={openAdd} className={btnPrimary}>
            <Plus className="h-4 w-4" />
            Add Gown
          </button>
        }
      />

      {/* Valuation strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Units on hand', value: String(stats.units), icon: Boxes, tone: 'text-stone-700' },
          { label: 'Retail value', value: formatCents(stats.retail), icon: DollarSign, tone: 'text-stone-700' },
          { label: 'Cost value', value: formatCents(stats.cost), icon: DollarSign, tone: 'text-stone-700' },
          {
            label: 'Potential profit',
            value: `${formatCents(stats.profit)}${stats.retail > 0 ? ` · ${marginPct(stats.cost, stats.retail)}%` : ''}`,
            icon: TrendingUp,
            tone: 'text-emerald-600',
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
              <s.icon className="h-3.5 w-3.5 text-stone-400" /> {s.label}
            </p>
            <p className={`mt-1 font-serif text-xl ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, designer, SKU, vendor, color…"
              className={`${inputCls} pl-9`}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`${inputCls} sm:w-52`}
            aria-label="Filter by category"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
            ))}
          </select>
          <button
            onClick={() => setLowStockOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
              lowStockOnly
                ? 'bg-amber-500 text-white'
                : 'bg-white text-amber-700 ring-1 ring-amber-300 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Reorder needed ({stats.lowStock})
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {styles.map((s) => (
            <button
              key={s}
              onClick={() => setStyleFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                styleFilter === s ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && gowns.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 py-16 text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading inventory...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((g) => {
            const margin = g.costCents > 0 ? marginPct(g.costCents, g.priceCents) : null;
            const needsReorder = g.stock <= g.reorderPoint;
            return (
              <div key={g.id} className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                  <img
                    src={g.image}
                    alt={`${g.name} by ${g.designer}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                    <StatusBadge status={g.status} />
                    {needsReorder && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                        <AlertTriangle className="h-3 w-3" /> Reorder
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <LocationBadge id={g.location} className="bg-white/90 shadow-sm" />
                  </div>
                  <span
                    className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${CONDITION_BADGE[g.condition] ?? 'bg-stone-100 text-stone-600 ring-stone-200'}`}
                  >
                    {g.condition}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg text-stone-900">{g.name}</h3>
                      <p className="text-xs text-stone-500">{g.designer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-stone-900">{formatCents(g.priceCents)}</p>
                      {g.msrpCents > 0 && g.msrpCents !== g.priceCents && (
                        <p className="text-[10px] text-stone-400">MSRP {formatCents(g.msrpCents)}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-stone-500">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5">{g.category}</span>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5">{g.style}</span>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5">Size {g.size}</span>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5">{g.color}</span>
                  </div>

                  {/* Cost / margin strip */}
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-stone-50 px-2.5 py-1.5 text-[11px] ring-1 ring-stone-100">
                    <span className="text-stone-500">
                      Cost {g.costCents > 0 ? formatCents(g.costCents) : '—'}
                    </span>
                    {margin !== null && (
                      <span className={`font-semibold ${margin >= 50 ? 'text-emerald-600' : margin >= 35 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {margin}% margin
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-stone-400">
                    {g.stock > 0 ? `${g.stock} in stock` : 'Special order'} · SKU {g.sku || g.id}
                    {g.vendor && g.vendor !== g.designer ? ` · ${g.vendor}` : ''}
                  </p>
                  {g.notes && <p className="mt-1 truncate text-[11px] italic text-stone-400" title={g.notes}>“{g.notes}”</p>}
                  <div className="mt-3 flex gap-2 border-t border-stone-100 pt-3">
                    <button
                      onClick={() => openEdit(g)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setStockGown(g)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
                    >
                      <PackagePlus className="h-3.5 w-3.5" />
                      Stock
                    </button>
                    <button
                      onClick={() => setTransferGown(g)}
                      disabled={g.stock <= 0}
                      title={g.stock <= 0 ? 'No stock available to transfer' : 'Transfer to another store'}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1.5 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                      Transfer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-stone-300 py-16 text-center text-stone-500">
              No gowns match your filters {scopeLabel}.
            </p>
          )}
        </div>
      )}

      <GownFormModal open={formOpen} gown={editingGown} onClose={() => setFormOpen(false)} />
      <AdjustStockModal gown={stockGown} onClose={() => setStockGown(null)} />
      <TransferModal open={!!transferGown} gown={transferGown} onClose={() => setTransferGown(null)} />
    </div>
  );
}
