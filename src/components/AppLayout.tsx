import { useState } from 'react';
import { Menu, Search, LogIn, LogOut, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';
import Sidebar, { ViewKey, NAV_ITEMS, PUBLIC_VIEWS, canAccessView, VIEW_ACCESS } from '@/components/vowos/Sidebar';
import NotificationsBell from '@/components/vowos/NotificationsBell';
import AuthModal from '@/components/vowos/AuthModal';
import { useAuth, ROLE_BADGE_CLASSES } from '@/contexts/AuthContext';
import { useVowosData } from '@/contexts/VowosDataContext';
import { locationById } from '@/data/vowosData';
import { LocationSwitcher } from '@/components/vowos/LocationSelect';
import DashboardView from '@/components/vowos/DashboardView';
import CustomersView from '@/components/vowos/CustomersView';
import LeadsView from '@/components/vowos/LeadsView';
import InventoryView from '@/components/vowos/InventoryView';
import TransfersView from '@/components/vowos/TransfersView';
import AppointmentsView from '@/components/vowos/AppointmentsView';
import InvoicesView from '@/components/vowos/InvoicesView';
import PurchasesView from '@/components/vowos/PurchasesView';
import ReportsView from '@/components/vowos/ReportsView';
import LedgersView from '@/components/vowos/LedgersView';
import StaffView from '@/components/vowos/StaffView';
import CommunicationsView from '@/components/vowos/CommunicationsView';
import ContractsView from '@/components/vowos/ContractsView';
import AlterationsView from '@/components/vowos/AlterationsView';
import SettingsView from '@/components/vowos/SettingsView';



function LockedPanel({ label, onSignIn }: { label: string; onSignIn: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-lg">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-serif text-2xl text-stone-900">{label} is staff-only</h2>
      <p className="mt-2 max-w-sm text-sm text-stone-500">
        Sign in with your Roberts Enterprises staff account to manage {label.toLowerCase()}. The
        dashboard remains available as a preview for guests.
      </p>
      <button
        onClick={onSignIn}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-600"
      >
        <LogIn className="h-4 w-4" /> Staff Sign In
      </button>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-stone-400">
        <ShieldCheck className="h-3.5 w-3.5" /> Secured by Supabase authentication
      </p>
    </div>
  );
}

function RoleLockedPanel({ label, view, role }: { label: string; view: ViewKey; role: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-amber-300 bg-amber-50/40 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-serif text-2xl text-stone-900">{label} needs a higher role</h2>
      <p className="mt-2 max-w-sm text-sm text-stone-500">
        Your <span className="font-semibold">{role}</span> role doesn't include {label.toLowerCase()}.
        This section is open to: {VIEW_ACCESS[view].join(', ')}. Ask an Owner to adjust your role in
        Staff &amp; Roles.
      </p>
    </div>
  );
}

export default function AppLayout() {
  const [view, setView] = useState<ViewKey>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const { session, profile, loading, signOut } = useAuth();
  const { activeLocation } = useVowosData();

  const currentLabel = NAV_ITEMS.find((n) => n.key === view)?.label ?? 'Dashboard';
  const isGuestLocked = !session && !PUBLIC_VIEWS.includes(view);
  const role = session && profile ? profile.role : null;
  const isRoleLocked = !!role && !canAccessView(role, view);

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Sidebar
        view={view}
        onNavigate={setView}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onRequestSignIn={() => setAuthOpen(true)}
      />

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#faf8f5]/90 backdrop-blur">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-500">VowOS</p>
              <h2 className="text-sm font-semibold text-stone-800">{currentLabel}</h2>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Store / location switcher — scopes every view */}
              <LocationSwitcher />

              <button
                onClick={() => setView('customers')}
                className="hidden items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-400 transition-colors hover:border-stone-300 sm:flex"
              >
                <Search className="h-4 w-4" />
                Search brides...
              </button>

              {/* Live alerts: in-transit transfers, overdue invoices, delayed POs */}
              <NotificationsBell onNavigate={setView} />

              {/* Auth control */}
              {!loading && (
                session && profile ? (
                  <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white py-1 pl-1 pr-2 shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-600 text-xs font-semibold text-white">
                      {initials}
                    </div>
                    <div className="hidden leading-tight sm:block">
                      <p className="max-w-[120px] truncate text-xs font-semibold text-stone-800">{profile.name}</p>
                      <span className={`inline-flex rounded-full px-1.5 text-[10px] font-semibold uppercase tracking-wider ${ROLE_BADGE_CLASSES[profile.role]}`}>
                        {profile.role}
                      </span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="ml-1 rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                      aria-label="Sign out"
                      title="Sign out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-700"
                  >
                    <LogIn className="h-4 w-4" /> Sign In
                  </button>
                )
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Guest preview banner on the dashboard */}
          {!session && !loading && view === 'dashboard' && (
            <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-rose-600">
                <Lock className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-medium">You're viewing the dashboard in preview mode.</p>
              </div>
              <p className="text-xs text-rose-500/80 sm:flex-1">
                Sign in with a staff account to manage brides, inventory, invoices, and more.
              </p>
              <button
                onClick={() => setAuthOpen(true)}
                className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-600"
              >
                Staff Sign In
              </button>
            </div>
          )}

          {isGuestLocked ? (
            <LockedPanel label={currentLabel} onSignIn={() => setAuthOpen(true)} />
          ) : isRoleLocked ? (
            <RoleLockedPanel label={currentLabel} view={view} role={role!} />
          ) : (
            <>
              {view === 'dashboard' && <DashboardView onNavigate={setView} />}
              {view === 'customers' && <CustomersView />}
              {view === 'leads' && <LeadsView />}
              {view === 'inventory' && <InventoryView />}
              {view === 'transfers' && <TransfersView />}
              {view === 'appointments' && <AppointmentsView />}
              {view === 'communications' && <CommunicationsView />}
              {view === 'contracts' && <ContractsView />}
              {view === 'alterations' && <AlterationsView />}

              {view === 'invoices' && <InvoicesView />}
              {view === 'purchases' && <PurchasesView />}
              {view === 'reports' && <ReportsView />}
              {view === 'ledgers' && <LedgersView />}
              {view === 'staff' && <StaffView />}
              {view === 'settings' && <SettingsView />}

            </>
          )}

          <footer className="mt-10 border-t border-stone-200 pt-6 pb-4 text-center text-xs text-stone-400">
            VowOS — Bridal Retail Operating System · © 2026 Roberts Enterprises · I Do Bridal Couture
            + Proper & Company · Baton Rouge & Covington, LA ·{' '}
            {activeLocation === 'all' ? 'Viewing all locations' : `Viewing ${locationById(activeLocation).short}`}
          </footer>
        </main>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
