import { useMemo, useState, ReactNode } from 'react';

import { Download } from 'lucide-react';
import {
  invoices,
  purchaseOrders,
  appointments,
  leads,
  customers,
  revenueByMonth,
  formatCents,
  formatDate,
} from '@/data/vowosData';
import { PageHeader, StatusBadge, btnSecondary } from './ui';

type TabKey = 'revenue' | 'open-orders' | 'deliveries' | 'bookings' | 'follow-ups';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'open-orders', label: 'Open Orders' },
  { key: 'deliveries', label: 'Expected Deliveries' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'follow-ups', label: 'Follow-Ups' },
];

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsView() {
  const [tab, setTab] = useState<TabKey>('revenue');

  const openOrders = invoices.filter((i) => i.status !== 'Paid');
  const pendingDeliveries = purchaseOrders.filter((p) => p.status !== 'Delivered');
  const followUps = leads.filter((l) => l.stage === 'New' || l.stage === 'Contacted');
  const maxRev = Math.max(...revenueByMonth.map((m) => m.revenue));
  const totalRev = revenueByMonth.reduce((s, m) => s + m.revenue, 0);

  const exportData = useMemo(() => {
    switch (tab) {
      case 'revenue':
        return { name: 'revenue.csv', rows: [['Month', 'Revenue'], ...revenueByMonth.map((m) => [m.month, m.revenue])] };
      case 'open-orders':
        return { name: 'open-orders.csv', rows: [['Invoice', 'Customer', 'Amount', 'Balance', 'Due', 'Status'], ...openOrders.map((i) => [i.id, i.customer, i.amountCents / 100, (i.amountCents - i.paidCents) / 100, i.dueDate, i.status])] };
      case 'deliveries':
        return { name: 'expected-deliveries.csv', rows: [['PO', 'Vendor', 'Items', 'ETA', 'Status'], ...pendingDeliveries.map((p) => [p.id, p.vendor, p.items, p.expectedDelivery, p.status])] };
      case 'bookings':
        return { name: 'bookings.csv', rows: [['ID', 'Customer', 'Type', 'Date', 'Time', 'Stylist', 'Status'], ...appointments.map((a) => [a.id, a.customer, a.type, a.date, a.time, a.stylist, a.status])] };
      case 'follow-ups':
      default:
        return { name: 'follow-ups.csv', rows: [['Lead', 'Email', 'Source', 'Budget', 'Stage'], ...followUps.map((l) => [l.name, l.email, l.source, l.budgetCents / 100, l.stage])] };
    }

  }, [tab, openOrders, pendingDeliveries, followUps]);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Bridal retail analytics across sales, orders, and follow-ups"
        action={
          <button onClick={() => downloadCsv(exportData.name, exportData.rows)} className={btnSecondary}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-stone-200 pb-px">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'border-rose-500 text-rose-600' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'revenue' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="font-serif text-lg text-stone-900">Six-Month Revenue Trend</h2>
            <p className="mb-6 text-xs text-stone-500">Total {formatCents(totalRev * 100)} across the period</p>
            <div className="flex h-56 items-end gap-4">
              {revenueByMonth.map((m) => (
                <div key={m.month} className="group flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-stone-600">${(m.revenue / 1000).toFixed(1)}k</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-stone-800 to-stone-500 transition-colors group-hover:from-rose-600 group-hover:to-rose-400"
                    style={{ height: `${(m.revenue / maxRev) * 100}%` }}
                  />
                  <span className="text-xs text-stone-500">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Average sale', value: formatCents(Math.round(invoices.reduce((s, i) => s + i.amountCents, 0) / invoices.length)) },
              { label: 'Conversion rate', value: `${Math.round((leads.filter((l) => l.stage === 'Won').length / leads.length) * 100)}% of leads` },
              { label: 'Repeat & referral brides', value: `${customers.filter((c) => c.status !== 'Active').length} this season` },
              { label: 'Best month', value: 'July — $71.4k' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{s.label}</p>
                <p className="mt-1 font-serif text-2xl text-stone-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'open-orders' && (
        <ReportTable
          headers={['Invoice', 'Customer', 'Amount', 'Balance', 'Due', 'Status']}
          rows={openOrders.map((i) => [i.id, i.customer, formatCents(i.amountCents), formatCents(i.amountCents - i.paidCents), formatDate(i.dueDate), <StatusBadge key={i.id} status={i.status} />])}
        />
      )}

      {tab === 'deliveries' && (
        <ReportTable
          headers={['PO', 'Vendor', 'Items', 'ETA', 'Status']}
          rows={pendingDeliveries.map((p) => [p.id, p.vendor, p.items, formatDate(p.expectedDelivery), <StatusBadge key={p.id} status={p.status} />])}
        />
      )}

      {tab === 'bookings' && (
        <ReportTable
          headers={['ID', 'Customer', 'Type', 'Date', 'Time', 'Stylist', 'Status']}
          rows={appointments.map((a) => [a.id, a.customer, a.type, formatDate(a.date), a.time, a.stylist, <StatusBadge key={a.id} status={a.status} />])}
        />
      )}

      {tab === 'follow-ups' && (
        <ReportTable
          headers={['Lead', 'Email', 'Source', 'Budget', 'Stage']}
          rows={followUps.map((l) => [l.name, l.email, l.source, formatCents(l.budgetCents), <StatusBadge key={l.id} status={l.stage} />])}
        />
      )}
    </div>
  );
}

function ReportTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-100 text-sm">
          <thead className="bg-stone-50/70">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((r, i) => (
              <tr key={i} className="transition-colors hover:bg-rose-50/40">
                {r.map((cell, j) => (
                  <td key={j} className="px-5 py-3.5 text-stone-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-5 py-10 text-center text-stone-500">
                  Nothing to report — you're all caught up.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
