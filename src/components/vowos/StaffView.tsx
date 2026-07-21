import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Check, Minus, UserCog, Users2, UserPlus, Trash2, Search, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { useAuth, StaffRole, STAFF_ROLES, ROLE_DESCRIPTIONS, ROLE_BADGE_CLASSES, normalizeRole } from '@/contexts/AuthContext';
import { PageHeader, StatCard, Modal, inputCls, btnPrimary, btnSecondary } from './ui';
import { NAV_ITEMS, VIEW_ACCESS, ViewKey } from './Sidebar';
import { fetchJsonSetting, saveJsonSetting } from '@/lib/settings';
import { Switch } from '@/components/ui/switch';

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
  const [filter, setFilter] = useState('');
  
  // Add Staff Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<StaffRole>('Stylist');
  const [addingStaff, setAddingStaff] = useState(false);

  // User-specific customizable permission state
  const [userPermissions, setUserPermissions] = useState<Record<string, ViewKey[]>>({});
  const [matrixMode, setMatrixMode] = useState<'per-user' | 'role-defaults'>('per-user');

  const isOwner = profile?.role === 'Owner';

  const loadStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('id, name, role, created_at')
      .order('created_at', { ascending: true });
    if (!error && data) {
      setStaff(data.map((r) => ({ ...r, role: normalizeRole(r.role) })));
    }
    
    // Load custom user-specific permission matrix
    const permissionsMap = await fetchJsonSetting<Record<string, ViewKey[]>>('custom_user_permissions', {});
    setUserPermissions(permissionsMap);
    localStorage.setItem('vowos_user_permissions', JSON.stringify(permissionsMap));
    setLoading(false);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const toggleUserPermission = async (staffId: string, staffName: string, staffRole: StaffRole, viewKey: ViewKey) => {
    if (!isOwner) {
      toast({ title: 'Authorization Blocked', description: 'Only Owners can modify custom user permissions.', variant: 'destructive' });
      return;
    }

    let currentList = userPermissions[staffId];
    if (!currentList) {
      currentList = NAV_ITEMS.filter((item) => VIEW_ACCESS[item.key].includes(staffRole)).map((item) => item.key);
    }

    const hasAccess = currentList.includes(viewKey);
    const updatedList = hasAccess
      ? currentList.filter((k) => k !== viewKey)
      : [...currentList, viewKey];

    const newMap = { ...userPermissions, [staffId]: updatedList };
    setUserPermissions(newMap);
    localStorage.setItem('vowos_user_permissions', JSON.stringify(newMap));
    await saveJsonSetting('custom_user_permissions', newMap);

    const sectionLabel = NAV_ITEMS.find((n) => n.key === viewKey)?.label ?? viewKey;
    toast({
      title: hasAccess ? 'Access Revoked' : 'Access Granted',
      description: `${hasAccess ? 'Disabled' : 'Enabled'} access to ${sectionLabel} for ${staffName}.`,
    });
  };

  const resetUserPermissions = async (staffId: string, staffName: string) => {
    if (!isOwner) return;
    const newMap = { ...userPermissions };
    delete newMap[staffId];
    setUserPermissions(newMap);
    localStorage.setItem('vowos_user_permissions', JSON.stringify(newMap));
    await saveJsonSetting('custom_user_permissions', newMap);
    toast({
      title: 'Permissions Reset',
      description: `Reset section access for ${staffName} to default role baseline.`,
    });
  };

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

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim() || !addPassword.trim()) {
      toast({ title: 'Missing parameters', description: 'Please fill in name, email and password.', variant: 'destructive' });
      return;
    }

    setAddingStaff(true);

    try {
      // 1. Create a non-persist session client using same endpoints to prevent logging the current owner out.
      const supabaseUrl = 'https://klzzdgqxahglnifuwgke.databasepad.com';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQxNTgzN2FjLWZkM2QtNGJhZS04YTE4LWM1OWVkZTViMzgxZSJ9.eyJwcm9qZWN0SWQiOiJrbHp6ZGdxeGFoZ2xuaWZ1d2drZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg0NTAzNzgzLCJleHAiOjIwOTk4NjM3ODMsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.-E5LJCHH9pneroAOuCwd5B-iZFGyJDqS56Bk_fggF-k';
      const inviteClient = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });

      // 2. Perform the guest registration
      const { data, error } = await inviteClient.auth.signUp({
        email: addEmail.trim(),
        password: addPassword.trim(),
        options: {
          data: {
            name: addName.trim(),
            role: addRole,
          },
        },
      });

      if (error) {
        toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
        setAddingStaff(false);
        return;
      }

      if (data?.user) {
        // 3. Upsert their profile using our main owner credentials
        const { error: profileErr } = await supabase.from('staff_profiles').upsert({
          id: data.user.id,
          name: addName.trim(),
          role: addRole,
        });

        if (profileErr) {
          toast({ title: 'Profile creation failed', description: profileErr.message, variant: 'destructive' });
        } else {
          toast({ title: 'Staff registered successfully', description: `${addName.trim()} created as ${addRole}.` });
          loadStaff();
          // Reset form
          setAddName('');
          setAddEmail('');
          setAddPassword('');
          setAddRole('Stylist');
          setShowAddModal(false);
        }
      }
    } catch (err: any) {
      toast({ title: 'Unexpected error occurred', description: err.message || '', variant: 'destructive' });
    } finally {
      setAddingStaff(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (profile?.id === id) {
      toast({ title: 'Operation blocked', description: 'You cannot delete your own administrative account.', variant: 'destructive' });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${name}? This will revoke their access to VowOS.`)) return;

    const { error } = await supabase.from('staff_profiles').delete().eq('id', id);
    if (error) {
      toast({ title: 'Could not delete staff member', description: error.message, variant: 'destructive' });
      return;
    }

    setStaff((list) => list.filter((s) => s.id !== id));
    toast({ title: 'Staff deleted', description: `${name} has been removed from VowOS.` });
  };

  const counts = useMemo(() => {
    const c: Record<StaffRole, number> = { Owner: 0, Manager: 0, Stylist: 0, 'Front Desk': 0 };
    staff.forEach((s) => (c[s.role] += 1));
    return c;
  }, [staff]);

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.role.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Staff & Roles"
        subtitle="Manage team accounts and what each role can open across VowOS"
        action={
          isOwner && (
            <button onClick={() => setShowAddModal(true)} className={btnPrimary}>
              <UserPlus className="h-4 w-4" /> Add Staff Member
            </button>
          )
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Team Members" value={String(staff.length)} sub="Staff accounts on file" icon={<Users2 className="h-5 w-5" />} accent="rose" />
        <StatCard label="Owners" value={String(counts.Owner)} sub="Full access + role management" icon={<ShieldCheck className="h-5 w-5" />} accent="amber" />
        <StatCard label="Managers" value={String(counts.Manager)} sub="Run stores end-to-end" icon={<UserCog className="h-5 w-5" />} accent="violet" />
        <StatCard label="Floor Staff" value={String(counts.Stylist + counts['Front Desk'])} sub="Stylists + front desk" icon={<Users2 className="h-5 w-5" />} accent="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* Team directory */}
        <div className="xl:col-span-3 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg text-stone-900">Team Directory</h3>
                <p className="text-xs text-stone-500">
                  {isOwner ? "As Owner you can reassign anyone's role." : 'Only Owners can change roles.'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial md:w-64">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search staff directory..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={`${inputCls} pl-9 h-8 py-1 text-xs`}
                  />
                </div>
                {isOwner && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className={`${btnPrimary} h-8 py-1 text-xs font-semibold shrink-0`}
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Add Staff
                  </button>
                )}
              </div>
            </div>
            {loading ? (
              <p className="px-5 py-10 text-center text-sm text-stone-400">Loading team…</p>
            ) : filteredStaff.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-stone-400">
                No matching staff accounts found.
              </p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {filteredStaff.map((s) => {
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
                        <div className="flex items-center gap-2">
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
                          {profile?.id !== s.id && (
                            <button
                              onClick={() => handleDeleteStaff(s.id, s.name)}
                              className="text-stone-400 hover:text-red-600 p-1.5 border border-stone-200 bg-stone-50/50 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Role descriptions */}
          <div className="grid gap-3 sm:grid-cols-2">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 px-5 py-4 gap-3">
              <div>
                <h3 className="font-serif text-lg text-stone-900">Permission Matrix</h3>
                <p className="text-xs text-stone-500">
                  {matrixMode === 'per-user'
                    ? 'Customize section permissions for each staff member individually.'
                    : 'Default access baseline for standard roles.'}
                </p>
              </div>

              {/* Mode Toggle Switcher */}
              <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs font-medium self-start sm:self-auto">
                <button
                  onClick={() => setMatrixMode('per-user')}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    matrixMode === 'per-user'
                      ? 'bg-white font-semibold text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Per Staff Member
                </button>
                <button
                  onClick={() => setMatrixMode('role-defaults')}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    matrixMode === 'role-defaults'
                      ? 'bg-white font-semibold text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Role Defaults
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    <th className="px-4 py-3 min-w-[140px]">Section</th>
                    {matrixMode === 'per-user' ? (
                      staff.map((s) => {
                        const hasCustom = !!userPermissions[s.id];
                        return (
                          <th key={s.id} className="px-3 py-3 text-center min-w-[150px]">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-semibold text-stone-800 normal-case text-xs truncate max-w-[130px]" title={s.name}>
                                {s.name}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${ROLE_BADGE_CLASSES[s.role]}`}>
                                  {s.role}
                                </span>
                                {hasCustom && (
                                  <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">
                                    Custom
                                  </span>
                                )}
                              </div>
                              {hasCustom && isOwner && (
                                <button
                                  onClick={() => resetUserPermissions(s.id, s.name)}
                                  className="mt-1 text-[10px] text-stone-400 underline hover:text-stone-600 normal-case"
                                  title="Reset to role default"
                                >
                                  Reset Default
                                </button>
                              )}
                            </div>
                          </th>
                        );
                      })
                    ) : (
                      STAFF_ROLES.map((r) => (
                        <th key={r} className="px-2 py-3 text-center">{r === 'Front Desk' ? 'Desk' : r}</th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {NAV_ITEMS.map(({ key, label }) => (
                    <tr key={key} className="hover:bg-stone-50/60">
                      <td className="whitespace-nowrap px-4 py-2.5 text-stone-700 font-medium">{label}</td>
                      {matrixMode === 'per-user' ? (
                        staff.map((s) => {
                          const isAllowed = userPermissions[s.id]
                            ? userPermissions[s.id].includes(key)
                            : VIEW_ACCESS[key].includes(s.role);
                          const isDisabled = !isOwner || s.role === 'Owner';

                          return (
                            <td key={s.id} className="px-3 py-2.5 text-center">
                              <div className="flex justify-center">
                                <Switch
                                  checked={isAllowed}
                                  disabled={isDisabled}
                                  onCheckedChange={() => toggleUserPermission(s.id, s.name, s.role, key)}
                                  className="data-[state=checked]:bg-emerald-500 scale-90"
                                />
                              </div>
                            </td>
                          );
                        })
                      ) : (
                        STAFF_ROLES.map((r) => (
                          <td key={r} className="px-2 py-2.5 text-center">
                            {VIEW_ACCESS[key].includes(r) ? (
                              <Check className="mx-auto h-4 w-4 text-emerald-500" />
                            ) : (
                              <Minus className="mx-auto h-4 w-4 text-stone-300" />
                            )}
                          </td>
                        ))
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Register Team Member">
        <form onSubmit={handleAddStaff} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Full Name</label>
            <input
              type="text"
              required
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className={inputCls}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Email Address</label>
            <input
              type="email"
              required
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              placeholder="e.g. eleanor@robertsenterprises.com"
              className={inputCls}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Password</label>
            <input
              type="password"
              required
              value={addPassword}
              onChange={(e) => setAddPassword(e.target.value)}
              placeholder="e.g. minimum 8 characters"
              className={inputCls}
              minLength={8}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">System Access Role</label>
            <select
              value={addRole}
              onChange={(e) => setAddRole(e.target.value as StaffRole)}
              className={inputCls}
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className={btnSecondary}
              disabled={addingStaff}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={btnPrimary}
              disabled={addingStaff}
            >
              {addingStaff ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Registering…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
