import { useMemo, useState } from 'react';
import { Search, Plus, Pencil, PackagePlus, Loader2 } from 'lucide-react';
import { Gown, GOWN_STYLES, formatCents } from '@/data/vowosData';
import { useVowosData } from '@/contexts/VowosDataContext';
import { PageHeader, StatusBadge, inputCls, btnPrimary } from './ui';
import { GownFormModal, AdjustStockModal } from './GownModals';

export default function InventoryView() {
  const { gowns, loading } = useVowosData();
  const [query, setQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editingGown, setEditingGown] = useState<Gown | null>(null);
  const [stockGown, setStockGown] = useState<Gown | null>(null);

  const styles = useMemo(
    () => ['All', ...Array.from(new Set([...GOWN_STYLES, ...gowns.map((g) => g.style)]))],
    [gowns],
  );

  const filtered = gowns.filter(
    (g) =>
      (styleFilter === 'All' || g.style === styleFilter) &&
      (g.name.toLowerCase().includes(query.toLowerCase()) || g.designer.toLowerCase().includes(query.toLowerCase())),
  );

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
        subtitle={`${gowns.length} styles · ${gowns.reduce((s, g) => s + g.stock, 0)} pieces on the floor`}
        action={
          <button onClick={openAdd} className={btnPrimary}>
            <Plus className="h-4 w-4" />
            Add Gown
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or designer..."
            className={`${inputCls} pl-9`}
          />
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
          {filtered.map((g) => (
            <div key={g.id} className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                <img
                  src={g.image}
                  alt={`${g.name} by ${g.designer}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <StatusBadge status={g.status} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-lg text-stone-900">{g.name}</h3>
                    <p className="text-xs text-stone-500">{g.designer}</p>
                  </div>
                  <p className="font-medium text-stone-900">{formatCents(g.priceCents)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-stone-500">
                  <span className="rounded-full bg-stone-100 px-2 py-0.5">{g.style}</span>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5">Size {g.size}</span>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5">{g.color}</span>
                </div>
                <p className="mt-3 text-xs text-stone-400">
                  {g.stock > 0 ? `${g.stock} in stock · ${g.id}` : `Special order · ${g.id}`}
                </p>
                <div className="mt-3 flex gap-2 border-t border-stone-100 pt-3">
                  <button
                    onClick={() => openEdit(g)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setStockGown(g)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
                  >
                    <PackagePlus className="h-3.5 w-3.5" />
                    Adjust Stock
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-stone-300 py-16 text-center text-stone-500">
              No gowns match your filters.
            </p>
          )}
        </div>
      )}

      <GownFormModal open={formOpen} gown={editingGown} onClose={() => setFormOpen(false)} />
      <AdjustStockModal gown={stockGown} onClose={() => setStockGown(null)} />
    </div>
  );
}
