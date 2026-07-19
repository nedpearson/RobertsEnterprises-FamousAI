import { useState } from 'react';
import { CalendarDays, Check } from 'lucide-react';
import { appointments as seed, Appointment, formatDate } from '@/data/vowosData';
import { PageHeader, StatusBadge } from './ui';

const TYPE_COLORS: Record<string, string> = {
  'Bridal Consultation': 'bg-rose-100 text-rose-600',
  Fitting: 'bg-violet-100 text-violet-600',
  Alterations: 'bg-amber-100 text-amber-600',
  Pickup: 'bg-emerald-100 text-emerald-600',
  Accessories: 'bg-sky-100 text-sky-600',
};

export default function AppointmentsView() {
  const [list, setList] = useState<Appointment[]>(seed);

  const update = (id: string, status: Appointment['status']) =>
    setList((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const days = Array.from(new Set(list.map((a) => a.date))).sort();

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle={`${list.filter((a) => a.status !== 'Completed').length} upcoming this week · ${list.filter((a) => a.status === 'Pending').length} awaiting confirmation`}
      />

      <div className="space-y-6">
        {days.map((day) => (
          <div key={day}>
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-rose-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-600">{formatDate(day)}</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {list
                .filter((a) => a.date === day)
                .map((a) => (
                  <div key={a.id} className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TYPE_COLORS[a.type]}`}>{a.type}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="mt-3 font-serif text-lg text-stone-900">{a.customer}</p>
                    <p className="mt-0.5 text-sm text-stone-500">
                      {a.time} · with {a.stylist}
                    </p>
                    <div className="mt-4 flex gap-2">
                      {a.status === 'Pending' && (
                        <button
                          onClick={() => update(a.id, 'Confirmed')}
                          className="flex-1 rounded-lg bg-stone-900 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-700"
                        >
                          Confirm
                        </button>
                      )}
                      {a.status === 'Confirmed' && (
                        <button
                          onClick={() => update(a.id, 'Completed')}
                          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-stone-300 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50"
                        >
                          <Check className="h-3.5 w-3.5" /> Mark Completed
                        </button>
                      )}
                      {a.status === 'Completed' && (
                        <p className="flex-1 py-1.5 text-center text-xs text-stone-400">Visit complete</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
