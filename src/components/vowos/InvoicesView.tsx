import { useMemo, useState } from 'react';
import { Search, Receipt } from 'lucide-react';
import { invoices as seed, Invoice, formatCents, formatDate } from '@/data/vowosData';
import { PageHeader, StatusBadge, inputCls } from './ui';

const FILTERS = ['All', 'Paid', 'Partial', 'Open', 'Overdue'] as const;

export default function InvoicesView() {
  const [list, setList] = useState<Invoice[]>(seed);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const filtered = useMemo(
    () =>
      list.filter(
        (i) =>
          (filter === 'All' || i.status === filter) &&
          (i.customer.toLowerCase().includes(query.toLowerCase()) || i.id.toLowerCase().includes(query.toLowerCase())),
      ),
    [list, query, filter],
  );

  const recordPayment = (id: string) =>
    setList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, paidCents: i.amountCents, status: 'Paid' } : i)),
    );

  const outstanding = list.reduce((s, i) => s + (i.amountCents - i.paidCents), 0);

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${list.length} invoices · ${formatCents(outstanding)} outstanding`}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search invoices..." className={`${inputCls} pl-9`} />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-100 text-sm">
            <thead className="bg-stone-50/70">
              <tr>
                {['Invoice', 'Customer', 'Amount', 'Balance', 'Due', 'Status', ''].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((inv) => {
                const balance = inv.amountCents - inv.paidCents;
                return (
                  <tr key={inv.id} className="transition-colors hover:bg-rose-50/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-stone-300" />
                        <div>
                          <p className="font-medium text-stone-800">{inv.id}</p>
                          <p className="text-xs text-stone-400">{inv.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-stone-700">{inv.customer}</td>
                    <td className="px-5 py-3.5 font-medium text-stone-800">{formatCents(inv.amountCents)}</td>
                    <td className={`px-5 py-3.5 font-medium ${balance > 0 ? 'text-amber-600' : 'text-stone-400'}`}>
                      {balance > 0 ? formatCents(balance) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-stone-700">{formatDate(inv.dueDate)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {balance > 0 && (
                        <button
                          onClick={() => recordPayment(inv.id)}
                          className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-700"
                        >
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-stone-500">
                    No invoices match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
