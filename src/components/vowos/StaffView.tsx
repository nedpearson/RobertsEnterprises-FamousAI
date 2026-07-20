import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Check, Minus, UserCog, Users2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { useAuth, StaffRole, STAFF_ROLES, ROLE_DESCRIPTIONS, ROLE_BADGE_CLASSES, normalizeRole } from '@/contexts/AuthContext';
import { PageHeader, StatCard } from './ui';
import { NAV_ITEMS, VIEW_ACCESS } from './Sidebar';

interface StaffRow {
  id: string;
  name: string;
  role: StaffRole;
  created_at: string;
}

export default function StaffView() {
  const { profile, refreshProfile } = useAuth();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const isOwner = profile?.role === 'Owner';

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('id, name, role, created_at')
        .order('created_at', { ascending: true });
      if (!error && data) {
        setStaff(data.map((r) => ({ ...r, role: normalizeRole(r.role) })));
      }
      setLoading(false);
    })();
  }, []);

  const changeRole = async (id: string, role: StaffRole) => {
    const prev = staff.find((s) => s.id === id);
    if (!prev || prev.role === role) return;
    setSavingId(id);
    setStaff((list) => list.map((s) => (s.id === id ? { ...s, role } : s)));
    const { error } = await supabase.from('staff_profiles').update({ role }).eq('id', id);
    setSavingId(null);
    if (error) {
      setStaff((list) => list.map((s) => (s.id === id ? prev : s)));
      toast({ title: 'Could not change role', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Role updated', description: `${prev.name} is now ${role}.` });
    if (profile && id === profile.id) await refreshProfile();
  };

  const counts = useMemo(() => {
    const c: Record<StaffRole, number> = { Owner: 0, Manager: 0, Stylist: 0, 'Front Desk': 0 };
    staff.forEach((s) => (c[s.role] += 1));
    return c;
  }, [staff]);

  return (
    <div>
      <PageHeader
        title="Staff & Roles"
        subtitle="Manage team accounts and what each role can open across VowOS"
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Team Members" value={String(staff.length)} sub="Staff accounts on file" icon={<Users2 className="h-5 w-5" />} accent="rose" />
        <StatCard label="Owners" value={String(counts.Owner)} sub="Full access + role management" icon={<ShieldCheck className="h-5 w-5" />} accent="amber" />
        <StatCard label="Managers" value={String(counts.Manager)} sub="Run stores end-to-end" icon={<UserCog className="h-5 w-5" />} accent="violet" />
        <StatCard label="Floor Staff" value={String(counts.Stylist + counts['Front Desk'])} sub="Stylists + front desk" icon={<Users2 className="h-5 w-5" />} accent="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* Team directory */}
        <div className="xl:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 py-4">
              <h3 className="font-serif text-lg text-stone-900">Team Directory</h3>
              <p className="text-xs text-stone-500">
                {isOwner ? 'As Owner you can reassign anyone\'s role.' : 'Only Owners can change roles.'}
              </p>
            </div>
            {loading ? (
              <p className="px-5 py-10 text-center text-sm text-stone-400">Loading team…</p>
            ) : staff.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-stone-400">
                No staff accounts yet — new sign-ups appear here automatically.
              </p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {staff.map((s) => {
                  const initials = s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-stone-500 to-stone-700 text-sm font-semibold text-white">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-900">
                          {s.name}
                          {profile?.id === s.id && <span className="ml-2 text-xs text-stone-400">(you)</span>}
                        </p>
                        <p className="text-xs text-stone-500">Joined {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${ROLE_BADGE_CLASSES[s.role]}`}>
                        {s.role}
                      </span>
                      {isOwner && (
                        <select
                          value={s.role}
                          disabled={savingId === s.id}
                          onChange={(e) => changeRole(s.id, e.target.value as StaffRole)}
                          className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-700 focus:border-rose-400 focus:outline-none disabled:opacity-50"
                        >
                          {STAFF_ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Role descriptions */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {STAFF_ROLES.map((r) => (
              <div key={r} className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${ROLE_BADGE_CLASSES[r]}`}>
                  {r}
                </span>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">{ROLE_DESCRIPTIONS[r]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Permission matrix */}
        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 py-4">
              <h3 className="font-serif text-lg text-stone-900">Permission Matrix</h3>
              <p className="text-xs text-stone-500">Which sections each role can open.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    <th className="px-4 py-3">Section</th>
                    {STAFF_ROLES.map((r) => (
                      <th key={r} className="px-2 py-3 text-center">{r === 'Front Desk' ? 'Desk' : r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {NAV_ITEMS.map(({ key, label }) => (
                    <tr key={key} className="hover:bg-stone-50/60">
                      <td className="whitespace-nowrap px-4 py-2.5 text-stone-700">{label}</td>
                      {STAFF_ROLES.map((r) => (
                        <td key={r} className="px-2 py-2.5 text-center">
                          {VIEW_ACCESS[key].includes(r) ? (
                            <Check className="mx-auto h-4 w-4 text-emerald-500" />
                          ) : (
                            <Minus className="mx-auto h-4 w-4 text-stone-300" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
