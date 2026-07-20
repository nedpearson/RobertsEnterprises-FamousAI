import { useCallback, useEffect, useState } from 'react';
import { AlarmClock, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  TimeEntry,
  fetchOpenEntries,
  fetchTimeEntries,
  clockIn,
  clockOut,
  entryHours,
  fmtHours,
  localIsoDate,
  SUSPICIOUS_SHIFT_HOURS,
} from '@/lib/timeclock';

/**
 * Punch in/out bar for the signed-in team member, plus a live
 * "who's on the clock right now" strip for managers at a glance.
 */
export default function TimeClockCard() {
  const { profile, session } = useAuth();
  const [openEntries, setOpenEntries] = useState<TimeEntry[]>([]);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  const reload = useCallback(async () => {
    const today = localIsoDate(new Date());
    const [open, todays] = await Promise.all([fetchOpenEntries(), fetchTimeEntries(today, today)]);
    setOpenEntries(open);
    setTodayEntries(todays);
  }, []);

  useEffect(() => {
    reload();
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, [reload]);

  if (!session || !profile) return null;

  const myOpen = openEntries.find((e) => e.staffName === profile.name) ?? null;
  const myTodayHours =
    todayEntries.filter((e) => e.staffName === profile.name).reduce((s, e) => s + entryHours(e, now), 0) +
    // an open punch started before midnight still counts toward "today so far"
    (myOpen && !todayEntries.some((e) => e.id === myOpen.id) ? entryHours(myOpen, now) : 0);

  const handlePunch = async () => {
    setBusy(true);
    if (myOpen) {
      const worked = fmtHours(entryHours(myOpen, now));
      const err = await clockOut(myOpen.id);
      if (err) toast({ title: 'Could not clock out', description: err, variant: 'destructive' });
      else toast({ title: 'Clocked out', description: `${profile.name} · ${worked} this shift.` });
    } else {
      const err = await clockIn(profile.name);
      if (err) toast({ title: 'Could not clock in', description: err, variant: 'destructive' });
      else
        toast({
          title: 'Clocked in',
          description: `${profile.name} · ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. Have a great shift!`,
        });
    }
    await reload();
    setBusy(false);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-stone-200/80 bg-white px-5 py-3.5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            myOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-500'
          }`}
        >
          <AlarmClock className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">Time Clock</p>
          <p className="text-[11px] text-stone-500">
            {myOpen
              ? `On the clock since ${new Date(myOpen.clockIn).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · ${fmtHours(entryHours(myOpen, now))} so far`
              : myTodayHours > 0
                ? `Clocked out · ${fmtHours(myTodayHours)} worked today`
                : 'Not clocked in yet today'}
          </p>
        </div>
      </div>

      <button
        onClick={handlePunch}
        disabled={busy}
        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-60 ${
          myOpen ? 'bg-stone-800 hover:bg-stone-700' : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : myOpen ? <LogOut className="h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
        {myOpen ? 'Clock Out' : 'Clock In'}
      </button>

      {/* Who's working right now */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          On the clock now ({openEntries.length})
        </span>
        {openEntries.length === 0 && <span className="text-[11px] text-stone-400">Nobody clocked in</span>}
        {openEntries.map((e) => {
          const hrs = entryHours(e, now);
          const stale = hrs > SUSPICIOUS_SHIFT_HOURS;
          return (
            <span
              key={e.id}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${
                stale
                  ? 'bg-amber-50 text-amber-700 ring-amber-200'
                  : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              }`}
              title={
                stale
                  ? `${e.staffName} has been clocked in ${fmtHours(hrs)} — probably a forgotten clock-out (fix it in Reports › Hours & Time Clock)`
                  : `${e.staffName} clocked in at ${new Date(e.clockIn).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
              }
            >
              <span className={`h-1.5 w-1.5 rounded-full ${stale ? 'bg-amber-400' : 'animate-pulse bg-emerald-500'}`} />
              {e.staffName} · {fmtHours(hrs)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
