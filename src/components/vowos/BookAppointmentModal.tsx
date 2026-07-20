import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarPlus, Loader2, Pencil } from 'lucide-react';
import { Appointment, LocationId, locationById, teamMembers } from '@/data/vowosData';
import { useVowosData, NewAppointmentInput } from '@/contexts/VowosDataContext';
import { toast } from '@/components/ui/use-toast';
import { Modal, inputCls, btnPrimary, btnSecondary } from './ui';
import { LocationSelect } from './LocationSelect';

const APPOINTMENT_TYPES: Appointment['type'][] = [
  'Bridal Consultation',
  'Fitting',
  'Alterations',
  'Pickup',
  'Accessories',
];

/** Salon hours: 9:00 AM – 5:30 PM in 30-minute slots, matching "1:30 PM" formatting. */
const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let mins = 9 * 60; mins <= 17 * 60 + 30; mins += 30) {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    slots.push(`${h12}:${String(m).padStart(2, '0')} ${period}`);
  }
  return slots;
})();

const OTHER = '__other__';

const labelCls = 'mb-1 block text-xs font-medium uppercase tracking-wider text-stone-500';

export default function BookAppointmentModal({
  open,
  onClose,
  appointment,
}: {
  open: boolean;
  onClose: () => void;
  /** When provided, the modal becomes an edit/reschedule form for this appointment. */
  appointment?: Appointment | null;
}) {
  const {
    brides,
    leads,
    allAppointments,
    activeLocation,
    addAppointment,
    updateAppointment,
  } = useVowosData();
  const isEdit = Boolean(appointment);

  const [brideChoice, setBrideChoice] = useState('');
  const [customName, setCustomName] = useState('');
  const [type, setType] = useState<Appointment['type']>('Bridal Consultation');
  const [location, setLocation] = useState<LocationId>('ido-br');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [stylist, setStylist] = useState(teamMembers[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill the form when opening in edit mode; reset for booking mode
  useEffect(() => {
    if (!open) return;
    if (appointment) {
      setBrideChoice('');
      setCustomName('');
      setType(appointment.type);
      setLocation(appointment.location);
      setDate(appointment.date);
      // Existing times should always be one of our slots, but keep whatever it is
      setTime(appointment.time);
      setStylist(appointment.stylist);
    } else {
      setBrideChoice('');
      setCustomName('');
      setType('Bridal Consultation');
      // Book into the store the staffer is currently viewing
      setLocation(activeLocation === 'all' ? 'ido-br' : activeLocation);
      setDate('');
      setTime('');
      setStylist(teamMembers[0]);
    }
    setError('');
  }, [open, appointment, activeLocation]);

  const customerName = isEdit
    ? appointment!.customer
    : brideChoice === OTHER
      ? customName.trim()
      : brideChoice;

  // A stylist can only be in one place at a time, so check across every store.
  const conflict = useMemo(() => {
    if (!date || !time || !stylist) return null;
    return (
      allAppointments.find(
        (a) =>
          a.stylist === stylist &&
          a.date === date &&
          a.time === time &&
          a.status !== 'Completed' &&
          a.id !== appointment?.id, // an appointment never conflicts with itself
      ) || null
    );
  }, [allAppointments, date, time, stylist, appointment]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      setError(brideChoice === OTHER ? "Please type the lead's name." : 'Please choose a bride.');
      return;
    }
    if (!date) {
      setError('Please pick a date.');
      return;
    }
    if (!time) {
      setError('Please pick a time.');
      return;
    }
    setError('');
    setSaving(true);
    let ok: boolean;
    if (isEdit) {
      ok = await updateAppointment(appointment!.id, { type, date, time, stylist, location });
    } else {
      const input: NewAppointmentInput = {
        customer: customerName,
        type,
        date,
        time,
        stylist,
        location,
      };
      ok = await addAppointment(input);
    }
    setSaving(false);
    if (ok) {
      toast({
        title: isEdit ? 'Appointment updated' : 'Appointment booked',
        description: `${customerName} · ${type} with ${stylist} at ${time} — ${locationById(location).short}.`,
      });
      handleClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit Appointment' : 'Book Appointment'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEdit ? (
          <div>
            <span className={labelCls}>Bride</span>
            <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">
              {appointment!.customer}
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="ba-bride" className={labelCls}>
              Bride
            </label>
            <select
              id="ba-bride"
              value={brideChoice}
              onChange={(e) => setBrideChoice(e.target.value)}
              className={inputCls}
            >
              <option value="">Choose a bride…</option>
              {brides.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} · {b.stylist}
                </option>
              ))}
              <option value={OTHER}>Someone else (lead / walk-in)…</option>
            </select>
            {brideChoice === OTHER && (
              <>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Type the lead's name"
                  list="ba-lead-names"
                  className={`${inputCls} mt-2`}
                  autoFocus
                />
                <datalist id="ba-lead-names">
                  {leads.map((l) => (
                    <option key={l.id} value={l.name} />
                  ))}
                </datalist>
              </>
            )}
          </div>
        )}

        <div>
          <label htmlFor="ba-location" className={labelCls}>
            Store location
          </label>
          <LocationSelect id="ba-location" value={location} onChange={setLocation} />
          <p className="mt-1 text-[11px] text-stone-400">
            {locationById(location).address} · {locationById(location).hours}
          </p>
        </div>

        <div>
          <label htmlFor="ba-type" className={labelCls}>
            Appointment type
          </label>
          <select
            id="ba-type"
            value={type}
            onChange={(e) => setType(e.target.value as Appointment['type'])}
            className={inputCls}
          >
            {APPOINTMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ba-date" className={labelCls}>
              Date
            </label>
            <input
              id="ba-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="ba-time" className={labelCls}>
              Time
            </label>
            <select
              id="ba-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputCls}
            >
              <option value="">Pick a time…</option>
              {/* Keep a non-standard existing time selectable when editing */}
              {time && !TIME_SLOTS.includes(time) && <option value={time}>{time}</option>}
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="ba-stylist" className={labelCls}>
            Stylist
          </label>
          <select
            id="ba-stylist"
            value={stylist}
            onChange={(e) => setStylist(e.target.value)}
            className={inputCls}
          >
            {/* Keep a stylist no longer on the roster selectable when editing */}
            {stylist && !teamMembers.includes(stylist) && (
              <option value={stylist}>{stylist}</option>
            )}
            {teamMembers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {conflict && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            <p className="text-xs leading-relaxed text-amber-800">
              <span className="font-semibold">Scheduling conflict:</span> {conflict.stylist} already
              has {conflict.customer} ({conflict.type}) at {conflict.time} on this date at{' '}
              {locationById(conflict.location).short}. You can still {isEdit ? 'save' : 'book'}, but
              consider another time or stylist.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={handleClose} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={`${btnPrimary} disabled:opacity-60`}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <CalendarPlus className="h-4 w-4" />
            )}
            {saving
              ? isEdit
                ? 'Saving…'
                : 'Booking…'
              : conflict
                ? isEdit
                  ? 'Save Anyway'
                  : 'Book Anyway'
                : isEdit
                  ? 'Save Changes'
                  : 'Book Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
