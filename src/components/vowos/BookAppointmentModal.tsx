import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarPlus, Loader2 } from 'lucide-react';
import { Appointment, teamMembers } from '@/data/vowosData';
import { useVowosData, NewAppointmentInput } from '@/contexts/VowosDataContext';
import { toast } from '@/components/ui/use-toast';
import { Modal, inputCls, btnPrimary, btnSecondary } from './ui';

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
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { brides, leads, appointments, addAppointment } = useVowosData();

  const [brideChoice, setBrideChoice] = useState('');
  const [customName, setCustomName] = useState('');
  const [type, setType] = useState<Appointment['type']>('Bridal Consultation');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [stylist, setStylist] = useState(teamMembers[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const customerName = brideChoice === OTHER ? customName.trim() : brideChoice;

  const conflict = useMemo(() => {
    if (!date || !time || !stylist) return null;
    return (
      appointments.find(
        (a) =>
          a.stylist === stylist && a.date === date && a.time === time && a.status !== 'Completed',
      ) || null
    );
  }, [appointments, date, time, stylist]);

  const reset = () => {
    setBrideChoice('');
    setCustomName('');
    setType('Bridal Consultation');
    setDate('');
    setTime('');
    setStylist(teamMembers[0]);
    setError('');
  };

  const handleClose = () => {
    reset();
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
    const input: NewAppointmentInput = { customer: customerName, type, date, time, stylist };
    const ok = await addAppointment(input);
    setSaving(false);
    if (ok) {
      toast({
        title: 'Appointment booked',
        description: `${customerName} · ${type} with ${stylist} at ${time}.`,
      });
      handleClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Book Appointment">
      <form onSubmit={handleSubmit} className="space-y-4">
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
              has {conflict.customer} ({conflict.type}) at {conflict.time} on this date. You can
              still book, but consider another time or stylist.
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
            ) : (
              <CalendarPlus className="h-4 w-4" />
            )}
            {saving ? 'Booking…' : conflict ? 'Book Anyway' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
