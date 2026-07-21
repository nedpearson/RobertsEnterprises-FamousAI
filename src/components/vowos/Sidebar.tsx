import {
  LayoutDashboard,
  Users,
  Sparkles,
  Shirt,
  ArrowLeftRight,
  CalendarDays,
  Receipt,
  PackageSearch,
  BarChart3,
  BookOpenText,
  ShieldCheck,
  Gem,
  Lock,
  LogOut,
  CalendarHeart,
  ExternalLink,
  MessageSquare,
  FileSignature,
  Scissors,
  SlidersHorizontal,
  AlarmClock,
} from 'lucide-react';
import { useAuth, StaffRole, ROLE_BADGE_CLASSES } from '@/contexts/AuthContext';


export type ViewKey =
  | 'dashboard'
  | 'customers'
  | 'leads'
  | 'inventory'
  | 'transfers'
  | 'appointments'
  | 'communications'
  | 'contracts'
  | 'alterations'
  | 'invoices'
  | 'purchases'
  | 'reports'
  | 'ledgers'
  | 'staff'
  | 'settings'
  | 'payroll'
  | 'timeclock'
  | 'training';

export const PUBLIC_VIEWS: ViewKey[] = ['dashboard', 'training'];

export const NAV_ITEMS: { key: ViewKey; label: string; icon: typeof Users }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'customers', label: 'Brides', icon: Users },
  { key: 'leads', label: 'Leads', icon: Sparkles },
  { key: 'inventory', label: 'Gown Inventory', icon: Shirt },
  { key: 'transfers', label: 'Store Transfers', icon: ArrowLeftRight },
  { key: 'appointments', label: 'Appointments', icon: CalendarDays },
  { key: 'timeclock', label: 'Time Clock & Kiosk', icon: AlarmClock },
  { key: 'communications', label: 'Communications', icon: MessageSquare },
  { key: 'contracts', label: 'Contracts', icon: FileSignature },
  { key: 'alterations', label: 'Alterations', icon: Scissors },
  { key: 'invoices', label: 'Invoices', icon: Receipt },
  { key: 'purchases', label: 'Purchase Orders', icon: PackageSearch },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'ledgers', label: 'Ledgers', icon: BookOpenText },
  { key: 'staff', label: 'Staff & Roles', icon: ShieldCheck },
  { key: 'payroll', label: 'Payroll & Workforce', icon: Gem },
  { key: 'training', label: 'Training Center', icon: BookOpenText },
  { key: 'settings', label: 'Settings', icon: SlidersHorizontal },
];

// ─── Role-based access matrix ───
// Owner: everything. Manager: everything except staff management.
// Stylist: styling floor tools. Front Desk: front-of-house tools.
export const VIEW_ACCESS: Record<ViewKey, StaffRole[]> = {
  dashboard: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
  customers: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
  leads: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
  inventory: ['Owner', 'Manager', 'Stylist'],
  transfers: ['Owner', 'Manager', 'Stylist'],
  appointments: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
  timeclock: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
  communications: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
  contracts: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
  alterations: ['Owner', 'Manager', 'Stylist'],
  invoices: ['Owner', 'Manager', 'Front Desk'],
  purchases: ['Owner', 'Manager'],
  reports: ['Owner', 'Manager'],
  ledgers: ['Owner', 'Manager'],
  staff: ['Owner'],
  settings: ['Owner', 'Manager'],
  payroll: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
  training: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
};




/** Can a (possibly signed-out) user open a view? */
export function canAccessView(role: StaffRole | null, view: ViewKey, staffId?: string | null): boolean {
  if (PUBLIC_VIEWS.includes(view)) return true;
  if (!role) return false;
  if (role === 'Owner') return true;

  if (staffId && typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem('vowos_user_permissions');
      if (cached) {
        const map = JSON.parse(cached);
        if (map && map[staffId] !== undefined) {
          return map[staffId].includes(view);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  return VIEW_ACCESS[view]?.includes(role) ?? false;
}

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
  const role: StaffRole | null = session && profile ? profile.role : null;

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

      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 pb-2">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          const locked = !canAccessView(role, key, profile?.id);
          // Hide staff management entirely from non-owners who are signed in
          if (key === 'staff' && role && role !== 'Owner') return null;
          return (
            <button
              key={key}
              data-tour-id={`nav-${key}`}
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

        {/* Public bride booking page */}
        <a
          href="/book"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-rose-500/30 px-3 py-2.5 text-sm font-medium text-rose-300/90 transition-all hover:bg-rose-500/10 hover:text-rose-200"
        >
          <CalendarHeart className="h-[18px] w-[18px] text-rose-400" />
          Bride Booking Page
          <ExternalLink className="ml-auto h-3.5 w-3.5 text-rose-400/60" />
        </a>
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
                  className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${ROLE_BADGE_CLASSES[profile.role]}`}
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
