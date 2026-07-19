import { DollarSign, Users, CalendarDays, Shirt, ArrowRight } from 'lucide-react';
import { gowns, revenueByMonth, formatCents, formatDate, HERO_IMAGE } from '@/data/vowosData';
import { useVowosData } from '@/contexts/VowosDataContext';
import { StatCard, StatusBadge } from './ui';
import { ViewKey } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardView({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  const { session, profile } = useAuth();
  const { brides: customers, invoices, appointments, purchaseOrders } = useVowosData();
  const totalRevenue = invoices.reduce((s, i) => s + i.paidCents, 0);
  const outstanding = invoices.reduce((s, i) => s + (i.amountCents - i.paidCents), 0);
  const upcoming = appointments.filter((a) => a.status !== 'Completed').slice(0, 5);
  const maxRev = Math.max(...revenueByMonth.map((m) => m.revenue));
  const watchList = purchaseOrders.filter((p) => p.status !== 'Delivered');

  const firstName = profile?.name?.split(' ')[0];
  const greeting = session && firstName ? `Good evening, ${firstName}` : 'Welcome to Roberts Enterprises';


  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg">
        <img src={HERO_IMAGE} alt="Roberts Enterprises bridal boutique" className="h-52 w-full object-cover sm:h-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1a1f]/90 via-[#1c1a1f]/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-rose-300">Sunday, July 19, 2026</p>
          <h1 className="mt-2 max-w-lg font-serif text-3xl leading-tight text-white sm:text-4xl">
            {greeting}
          </h1>

          <p className="mt-2 max-w-md text-sm text-stone-300">
            {upcoming.length} appointments this week · {watchList.length} orders in transit · July revenue up 21%
          </p>
          <button
            onClick={() => onNavigate('appointments')}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600"
          >
            View schedule <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue Collected" value={formatCents(totalRevenue)} sub="Fiscal YTD" icon={<DollarSign className="h-5 w-5" />} accent="emerald" />
        <StatCard label="Outstanding Balance" value={formatCents(outstanding)} sub={`${invoices.filter((i) => i.status !== 'Paid').length} open invoices`} icon={<DollarSign className="h-5 w-5" />} accent="amber" />
        <StatCard label="Active Brides" value={String(customers.length)} sub={`${customers.filter((c) => c.status === 'Active').length} shopping now`} icon={<Users className="h-5 w-5" />} accent="rose" />
        <StatCard label="Gowns In Stock" value={String(gowns.reduce((s, g) => s + g.stock, 0))} sub={`${gowns.filter((g) => g.status === 'Low Stock').length} low-stock styles`} icon={<Shirt className="h-5 w-5" />} accent="violet" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Revenue chart */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm xl:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg text-stone-900">Monthly Revenue</h2>
              <p className="text-xs text-stone-500">Last six months</p>
            </div>
            <button onClick={() => onNavigate('reports')} className="text-sm font-medium text-rose-500 hover:text-rose-600">
              Full report
            </button>
          </div>
          <div className="flex h-48 items-end gap-3 sm:gap-5">
            {revenueByMonth.map((m) => (
              <div key={m.month} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-stone-600 opacity-0 transition-opacity group-hover:opacity-100">
                  ${(m.revenue / 1000).toFixed(1)}k
                </span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-rose-500 to-rose-300 transition-all group-hover:from-rose-600 group-hover:to-rose-400"
                  style={{ height: `${(m.revenue / maxRev) * 100}%` }}
                />
                <span className="text-xs text-stone-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg text-stone-900">Upcoming Appointments</h2>
            <CalendarDays className="h-5 w-5 text-stone-400" />
          </div>
          <ul className="divide-y divide-stone-100">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-xs font-semibold text-rose-500">
                  {a.customer.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-800">{a.customer}</p>
                  <p className="text-xs text-stone-500">
                    {a.type} · {formatDate(a.date)} at {a.time}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
          <button
            onClick={() => onNavigate('appointments')}
            className="mt-2 w-full rounded-lg border border-stone-200 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
          >
            View all appointments
          </button>
        </div>
      </div>

      {/* Delivery watch */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-stone-900">Delivery Watch</h2>
            <p className="text-xs text-stone-500">Special orders and restocks in the pipeline</p>
          </div>
          <button onClick={() => onNavigate('purchases')} className="text-sm font-medium text-rose-500 hover:text-rose-600">
            All purchase orders
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {watchList.slice(0, 4).map((po) => (
            <div key={po.id} className="rounded-xl border border-stone-100 bg-stone-50/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-stone-500">{po.id}</p>
                <StatusBadge status={po.status} />
              </div>
              <p className="mt-2 truncate text-sm font-medium text-stone-800">{po.items}</p>
              <p className="mt-1 text-xs text-stone-500">
                {po.vendor} · ETA {formatDate(po.expectedDelivery)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
