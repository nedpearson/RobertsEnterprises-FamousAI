import { ReactNode } from 'react';
import { X } from 'lucide-react';

const BADGE_COLORS: Record<string, string> = {
  // universal statuses
  'In Stock': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Low Stock': 'bg-amber-50 text-amber-700 ring-amber-200',
  'On Order': 'bg-sky-50 text-sky-700 ring-sky-200',
  Active: 'bg-sky-50 text-sky-700 ring-sky-200',
  Purchased: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Alterations: 'bg-violet-50 text-violet-700 ring-violet-200',
  'Picked Up': 'bg-stone-100 text-stone-600 ring-stone-200',
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Partial: 'bg-amber-50 text-amber-700 ring-amber-200',
  Open: 'bg-sky-50 text-sky-700 ring-sky-200',
  Overdue: 'bg-rose-50 text-rose-700 ring-rose-200',
  Confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Completed: 'bg-stone-100 text-stone-600 ring-stone-200',
  Ordered: 'bg-sky-50 text-sky-700 ring-sky-200',
  'In Transit': 'bg-violet-50 text-violet-700 ring-violet-200',
  Delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Delayed: 'bg-rose-50 text-rose-700 ring-rose-200',
  New: 'bg-sky-50 text-sky-700 ring-sky-200',
  Contacted: 'bg-amber-50 text-amber-700 ring-amber-200',
  'Appointment Set': 'bg-violet-50 text-violet-700 ring-violet-200',
  Won: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export function StatusBadge({ status }: { status: string }) {
  const colors = BADGE_COLORS[status] || 'bg-stone-100 text-stone-600 ring-stone-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colors}`}>
      {status}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = 'rose',
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  accent?: 'rose' | 'emerald' | 'violet' | 'amber';
}) {
  const accents = {
    rose: 'bg-rose-50 text-rose-500',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
          <p className="mt-2 font-serif text-3xl text-stone-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-stone-500">{sub}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${accents[accent]}`}>{icon}</div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">{title}</h1>
        <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl text-stone-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputCls =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100';

export const btnPrimary =
  'inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300';

export const btnSecondary =
  'inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50';
