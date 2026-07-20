import { useState } from 'react';
import { CalendarDays, CalendarPlus, Check, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Appointment, formatDate } from '@/data/vowosData';
import { useVowosData } from '@/contexts/VowosDataContext';
import { toast } from '@/components/ui/use-toast';
import { PageHeader, StatusBadge, Modal, btnPrimary, btnSecondary } from './ui';
import BookAppointmentModal from './BookAppointmentModal';

const TYPE_COLORS: Record<string, string> = {
  'Bridal Consultation': 'bg-rose-100 text-rose-600',
  Fitting: 'bg-violet-100 text-violet-600',
  Alterations: 'bg-amber-100 text-amber-600',
  Pickup: 'bg-emerald-100 text-emerald-600',
  Accessories: 'bg-sky-100 text-sky-600',
};

export default function AppointmentsView() {
  const { appointments: list, loading, setAppointmentStatus, deleteAppointment } = useVowosData();
  const [bookOpen, setBookOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const days = Array.from(new Set(list.map((a) => a.date))).sort();

  const handleConfirmCancel = async () => {
    if (!cancelling) return;
    setDeleting(true);
    const ok = await deleteAppointment(cancelling.id);
    setDeleting(false);
    if (ok) {
      toast({
        title: 'Appointment cancelled',
        description: `${cancelling.customer} · ${cancelling.type} on ${formatDate(cancelling.date)} at ${cancelling.time} was removed.`,
      });
      setCancelling(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle={`${list.filter((a) => a.status !== 'Completed').length} upcoming this week · ${list.filter((a) => a.status === 'Pending').length} awaiting confirmation`}
        action={
          <button onClick={() => setBookOpen(true)} className={btnPrimary}>
            <CalendarPlus className="h-4 w-4" /> Book Appointment
          </button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center rounded-2xl border border-stone-200/80 bg-white py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
          <p className="mt-3 text-sm text-stone-500">Loading appointments...</p>
        </div>
      ) : (
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
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={a.status} />
                          <button
                            onClick={() => setEditing(a)}
                            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                            title="Edit appointment"
                            aria-label={`Edit appointment for ${a.customer}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setCancelling(a)}
                            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                            title="Cancel appointment"
                            aria-label={`Cancel appointment for ${a.customer}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 font-serif text-lg text-stone-900">{a.customer}</p>
                      <p className="mt-0.5 text-sm text-stone-500">
                        {a.time} · with {a.stylist}
                      </p>
                      <div className="mt-4 flex gap-2">
                        {a.status === 'Pending' && (
                          <button
                            onClick={() => setAppointmentStatus(a.id, 'Confirmed')}
                            className="flex-1 rounded-lg bg-stone-900 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-700"
                          >
                            Confirm
                          </button>
                        )}
                        {a.status === 'Confirmed' && (
                          <button
                            onClick={() => setAppointmentStatus(a.id, 'Completed')}
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
          {days.length === 0 && (
            <p className="rounded-2xl border border-dashed border-stone-200 py-12 text-center text-sm text-stone-400">
              No appointments on the books yet.
            </p>
          )}
        </div>
      )}

      {/* Book new appointment */}
      <BookAppointmentModal open={bookOpen} onClose={() => setBookOpen(false)} />

      {/* Edit / reschedule an existing appointment */}
      <BookAppointmentModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        appointment={editing}
      />

      {/* Cancel confirmation */}
      <Modal
        open={cancelling !== null}
        onClose={() => (deleting ? undefined : setCancelling(null))}
        title="Cancel Appointment?"
      >
        {cancelling && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-stone-600">
              This will permanently remove{' '}
              <span className="font-semibold text-stone-900">{cancelling.customer}</span>
              &rsquo;s {cancelling.type.toLowerCase()} with {cancelling.stylist} on{' '}
              <span className="font-medium text-stone-900">
                {formatDate(cancelling.date)} at {cancelling.time}
              </span>{' '}
              from the schedule. This can&rsquo;t be undone.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCancelling(null)}
                disabled={deleting}
                className={`${btnSecondary} disabled:opacity-60`}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {deleting ? 'Cancelling…' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
