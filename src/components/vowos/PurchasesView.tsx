import { useState } from 'react';
import { PackageSearch, Truck, CheckCircle2 } from 'lucide-react';
import { purchaseOrders as seed, PurchaseOrder, formatCents, formatDate } from '@/data/vowosData';
import { PageHeader, StatusBadge, StatCard } from './ui';

export default function PurchasesView() {
  const [list, setList] = useState<PurchaseOrder[]>(seed);

  const markDelivered = (id: string) =>
    setList((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Delivered' } : p)));

  const inTransit = list.filter((p) => p.status === 'In Transit' || p.status === 'Ordered');
  const openValue = list.filter((p) => p.status !== 'Delivered').reduce((s, p) => s + p.amountCents, 0);

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        subtitle="Track special orders, restocks, and vendor deliveries"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Open Orders" value={String(list.filter((p) => p.status !== 'Delivered').length)} icon={<PackageSearch className="h-5 w-5" />} accent="violet" />
        <StatCard label="In Transit" value={String(inTransit.length)} icon={<Truck className="h-5 w-5" />} accent="amber" />
        <StatCard label="Open PO Value" value={formatCents(openValue)} icon={<CheckCircle2 className="h-5 w-5" />} accent="emerald" />
      </div>

      <div className="space-y-3">
        {list.map((po) => (
          <div key={po.id} className="flex flex-col gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500">
              <PackageSearch className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-stone-800">{po.id}</p>
                <StatusBadge status={po.status} />
              </div>
              <p className="mt-0.5 truncate text-sm text-stone-600">{po.items}</p>
              <p className="text-xs text-stone-400">
                {po.vendor} · Ordered {formatDate(po.ordered)} · ETA {formatDate(po.expectedDelivery)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-serif text-lg text-stone-900">{formatCents(po.amountCents)}</p>
              {po.status !== 'Delivered' ? (
                <button
                  onClick={() => markDelivered(po.id)}
                  className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-stone-700"
                >
                  Mark Delivered
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Received
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
