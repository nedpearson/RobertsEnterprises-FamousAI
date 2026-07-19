import {
  LayoutDashboard,
  Users,
  Sparkles,
  Shirt,
  CalendarDays,
  Receipt,
  PackageSearch,
  BarChart3,
  Gem,
  Lock,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export type ViewKey =
  | 'dashboard'
  | 'customers'
  | 'leads'
  | 'inventory'
  | 'appointments'
  | 'invoices'
  | 'purchases'
  | 'reports';

export const PUBLIC_VIEWS: ViewKey[] = ['dashboard'];

export const NAV_ITEMS: { key: ViewKey; label: string; icon: typeof Users }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'customers', label: 'Brides', icon: Users },
  { key: 'leads', label: 'Leads', icon: Sparkles },
  { key: 'inventory', label: 'Gown Inventory', icon: Shirt },
  { key: 'appointments', label: 'Appointments', icon: CalendarDays },
  { key: 'invoices', label: 'Invoices', icon: Receipt },
  { key: 'purchases', label: 'Purchase Orders', icon: PackageSearch },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar({
  view,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  onRequestSignIn,
}: {
  view: ViewKey;
  onNavigate: (v: ViewKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onRequestSignIn: () => void;
}) {
  const { session, profile, signOut } = useAuth();

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'G';

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-900/30">
          <Gem className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-serif text-lg leading-tight text-white">VowOS</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Roberts Enterprises</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          const locked = !session && !PUBLIC_VIEWS.includes(key);
          return (
            <button
              key={key}
              onClick={() => {
                onNavigate(key);
                onCloseMobile();
              }}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-rose-500/20 to-transparent text-rose-300 ring-1 ring-inset ring-rose-500/30'
                  : 'text-stone-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${active ? 'text-rose-400' : 'text-stone-500 group-hover:text-stone-300'}`} />
              {label}
              {locked && <Lock className="ml-auto h-3.5 w-3.5 text-stone-600" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        {session && profile ? (
          <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-600 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{profile.name}</p>
                <span
                  className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    profile.role === 'Owner'
                      ? 'bg-rose-500/20 text-rose-300 ring-1 ring-inset ring-rose-500/30'
                      : 'bg-violet-500/20 text-violet-300 ring-1 ring-inset ring-violet-500/30'
                  }`}
                >
                  {profile.role}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-700 text-sm font-semibold text-stone-300">
                G
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">Guest</p>
                <p className="truncate text-xs text-stone-400">Preview mode</p>
              </div>
            </div>
            <button
              onClick={() => {
                onCloseMobile();
                onRequestSignIn();
              }}
              className="mt-3 w-full rounded-lg bg-rose-500 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-600"
            >
              Staff Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-[#1c1a1f] lg:block">{nav}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-stone-900/60" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-[#1c1a1f] shadow-2xl">{nav}</aside>
        </div>
      )}
    </>
  );
}
