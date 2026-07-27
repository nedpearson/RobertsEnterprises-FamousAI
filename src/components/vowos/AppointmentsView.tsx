import { useState } from 'react';
import {
  CalendarDays, CalendarPlus, CalendarRange, Check, Copy, ExternalLink, LayoutList, Loader2,
  Pencil, Printer, QrCode, Trash2, Search, Wallet, CreditCard,
} from 'lucide-react';
import {
  Appointment,
  formatDate,
  budgetLabel,
  bookingPageUrl,
  qrImageUrl,
  BOOKING_FEE_CENTS,
  formatCents,
} from '@/data/vowosData';
import { useVowosData } from '@/contexts/VowosDataContext';
import { toast } from '@/components/ui/use-toast';
import { PageHeader, StatusBadge, Modal, btnPrimary, btnSecondary } from './ui';
import BookAppointmentModal from './BookAppointmentModal';
import BridalIdentity from './BridalIdentity';
import { LocationBadge } from './LocationSelect';


const TYPE_COLORS: Record<string, string> = {
  'Bridal Consultation': 'bg-rose-100 text-rose-600',
  Fitting: 'bg-violet-100 text-violet-600',
  Alterations: 'bg-amber-100 text-amber-600',
  Pickup: 'bg-emerald-100 text-emerald-600',
  Accessories: 'bg-sky-100 text-sky-600',
};

const FEE_LABEL = formatCents(BOOKING_FEE_CENTS);

/** Open a printable card with the booking QR code for the fitting-room counter. */
function printBookingQr(url: string) {
  const w = window.open('', '_blank', 'width=480,height=640');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>Book Your Visit — QR Code</title>
    <style>
      body { font-family: Georgia, 'Times New Roman', serif; text-align: center; padding: 48px 24px; color: #1c1917; }
      .kicker { font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #e11d48; }
      h1 { font-size: 26px; margin: 8px 0 4px; }
      p { font-size: 13px; color: #57534e; margin: 4px 0; }
      img { margin: 24px auto; display: block; border: 1px solid #e7e5e4; border-radius: 16px; padding: 12px; }
      .url { font-size: 11px; color: #a8a29e; word-break: break-all; }
    </style></head><body>
    <p class="kicker">I Do Bridal Couture · Proper &amp; Company</p>
    <h1>Scan to Book Your Visit</h1>
    <p>Tell us what you're looking for and your budget — a flat ${FEE_LABEL} booking fee reserves your private suite and is credited toward your purchase.</p>
    <img src="${qrImageUrl(url, 320)}" width="320" height="320" alt="Booking QR code" />
    <p class="url">${url}</p>
    <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 400); };<\/script>
    </body></html>`);
  w.document.close();
}

type ViewMode = 'calendar' | 'list';

export default function AppointmentsView() {
  const { appointments: list, brides = [], loading, setAppointmentStatus, deleteAppointment } = useVowosData();
  const [view, setView] = useState<ViewMode>('calendar');
  const [bookOpen, setBookOpen] = useState(false);
  const [bookDefaults, setBookDefaults] = useState<{ date?: string; stylist?: string } | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const bookUrl = bookingPageUrl();

  const days = Array.from(new Set(list.map((a) => a.date))).sort();

  /** Open the booking modal, optionally prefilled from a calendar cell. */
  const openBooking = (defaults?: { date?: string; stylist?: string }) => {
    setBookDefaults(defaults ?? null);
    setBookOpen(true);
  };

  const copyBookingLink = async () => {
    try {
      await navigator.clipboard.writeText(bookUrl);
      toast({ title: 'Booking link copied', description: bookUrl });
    } catch {
      toast({ title: 'Could not copy', description: bookUrl, variant: 'destructive' });
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelling) return;
    setDeleting(true);
    await setAppointmentStatus(cancelling.id, 'Cancelled');
    setDeleting(false);
    toast({
      title: 'Appointment cancelled',
      description: `${cancelling.customer} · ${cancelling.type} on ${formatDate(cancelling.date)} at ${cancelling.time} moved to the Cancellations ledger.`,
    });
    setCancelling(null);
  };

  const handleRemove = async (a: Appointment) => {
    const ok = await deleteAppointment(a.id);
    if (ok) {
      toast({ title: 'Appointment removed', description: `${a.customer}'s cancelled visit was deleted permanently.` });
    }
  };

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle={`${list.filter((a) => a.status !== 'Completed' && a.status !== 'Cancelled').length} upcoming this week · ${list.filter((a) => a.status === 'Pending').length} awaiting confirmation`}

        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* Calendar / list toggle */}
            <div data-tour-id="calendar-view-switcher" className="flex overflow-hidden rounded-lg border border-stone-200 bg-white">
              <button
                onClick={() => setView('calendar')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                  view === 'calendar' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'
                }`}
                title="Bride calendar with team coverage"
              >
                <CalendarRange className="h-3.5 w-3.5" /> Calendar
              </button>
              <button
                onClick={() => setView('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                  view === 'list' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'
                }`}
                title="Card list by day"
              >
                <LayoutList className="h-3.5 w-3.5" /> List
              </button>
            </div>
            <button data-tour-id="btn-booking-qr" onClick={() => setQrOpen(true)} className={btnSecondary}>
              <QrCode className="h-4 w-4" /> Booking QR
            </button>
            <button data-tour-id="btn-book-appointment" onClick={() => openBooking()} className={btnPrimary}>
              <CalendarPlus className="h-4 w-4" /> Book Appointment
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center rounded-2xl border border-stone-200/80 bg-white py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
          <p className="mt-3 text-sm text-stone-500">Loading appointments...</p>
        </div>
      ) : view === 'calendar' ? (
        <div className="space-y-3">
          <CoverageCalendar onBook={openBooking} onEdit={setEditing} />
          <p className="text-xs text-stone-400">
            Every team member shares this calendar so managers can confirm each bride's appointment is
            covered. Click any cell to book a bride with that stylist, or click an appointment to
            reschedule or reassign it.
          </p>
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
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TYPE_COLORS[a.type]}`}>{a.type}</span>
                          <LocationBadge id={a.location} />
                        </div>
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
                            onClick={() => (a.status === 'Cancelled' ? handleRemove(a) : setCancelling(a))}
                            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                            title={a.status === 'Cancelled' ? 'Delete permanently' : 'Cancel appointment'}
                            aria-label={`${a.status === 'Cancelled' ? 'Delete' : 'Cancel'} appointment for ${a.customer}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                        </div>
                      </div>
                      <div className="mt-3">
                        <BridalIdentity
                          customer={brides.find((b) => b.name.toLowerCase() === a.customer.toLowerCase()) || { name: a.customer }}
                          size="md"
                          showName
                        />
                      </div>
                      <p className="mt-0.5 text-sm text-stone-500">
                        {a.time} · with {a.stylist}
                      </p>
                      {(a.lookingFor || a.budgetCents > 0) && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                          {a.lookingFor && (
                            <span className="inline-flex items-center gap-1">
                              <Search className="h-3 w-3 text-stone-400" /> {a.lookingFor}
                            </span>
                          )}
                          {a.budgetCents > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Wallet className="h-3 w-3 text-stone-400" /> {budgetLabel(a.budgetCents)}
                            </span>
                          )}
                        </div>
                      )}
                      {a.status !== 'Cancelled' && (
                        <span
                          className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            a.feePaid
                              ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                          }`}
                        >
                          <CreditCard className="h-3 w-3" />
                          {a.feePaid ? `${FEE_LABEL} fee paid` : `${FEE_LABEL} fee due at check-in`}
                        </span>
                      )}

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
                        {a.status === 'Cancelled' && (
                          <p className="flex-1 py-1.5 text-center text-xs text-rose-400">
                            Cancelled — tracked in Ledgers · Cancellations
                          </p>
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

      {/* Book new appointment (calendar cells prefill date + stylist) */}
      <BookAppointmentModal
        open={bookOpen}
        onClose={() => {
          setBookOpen(false);
          setBookDefaults(null);
        }}
        defaults={bookDefaults}
      />

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
              This will mark{' '}
              <span className="font-semibold text-stone-900">{cancelling.customer}</span>
              &rsquo;s {cancelling.type.toLowerCase()} with {cancelling.stylist} on{' '}
              <span className="font-medium text-stone-900">
                {formatDate(cancelling.date)} at {cancelling.time}
              </span>{' '}
              as <span className="font-semibold text-rose-600">Cancelled</span>. It stays in the
              Cancellations ledger for win-back follow-ups and can be deleted permanently later.
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

      {/* Booking QR code — print for the counter, mirrors, or marketing cards */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Scan-to-Book QR Code">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-stone-600">
            Brides scan this code to open the online booking page — it asks what they're looking
            for and their budget, and collects the flat{' '}
            <span className="font-semibold text-stone-900">{FEE_LABEL} booking fee</span> up front.
            Print it for the front counter, fitting-room mirrors, or bridal-show cards.
          </p>
          <div className="flex justify-center">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <img
                src={qrImageUrl(bookUrl, 260)}
                alt="QR code linking to the booking page"
                width={260}
                height={260}
                className="h-64 w-64"
              />
            </div>
          </div>
          <p className="break-all rounded-lg bg-stone-50 px-3 py-2 text-center text-[11px] text-stone-500 ring-1 ring-stone-200">
            {bookUrl}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => printBookingQr(bookUrl)} className={`${btnSecondary} justify-center`}>
              <Printer className="h-4 w-4" /> Print
            </button>
            <button type="button" onClick={copyBookingLink} className={`${btnSecondary} justify-center`}>
              <Copy className="h-4 w-4" /> Copy Link
            </button>
            <a
              href={bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnSecondary} justify-center`}
            >
              <ExternalLink className="h-4 w-4" /> Open Page
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
