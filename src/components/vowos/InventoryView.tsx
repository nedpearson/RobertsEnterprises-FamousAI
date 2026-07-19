import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { gowns, formatCents } from '@/data/vowosData';
import { PageHeader, StatusBadge, inputCls } from './ui';

export default function InventoryView() {
  const [query, setQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('All');

  const styles = useMemo(() => ['All', ...Array.from(new Set(gowns.map((g) => g.style)))], []);

  const filtered = gowns.filter(
    (g) =>
      (styleFilter === 'All' || g.style === styleFilter) &&
      (g.name.toLowerCase().includes(query.toLowerCase()) || g.designer.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div>
      <PageHeader
        title="Gown Inventory"
        subtitle={`${gowns.length} styles · ${gowns.reduce((s, g) => s + g.stock, 0)} pieces on the floor`}
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
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-stone-300 py-16 text-center text-stone-500">
            No gowns match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
