import { useState, useEffect } from 'react';
import { Menu, Search, LogIn, LogOut, Lock, ShieldCheck, ShieldAlert, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import Sidebar, { ViewKey, NAV_ITEMS, PUBLIC_VIEWS, canAccessView, VIEW_ACCESS } from '@/components/vowos/Sidebar';
import NotificationsBell from '@/components/vowos/NotificationsBell';
import AuthModal from '@/components/vowos/AuthModal';
import { useAuth, ROLE_BADGE_CLASSES } from '@/contexts/AuthContext';
import { useVowosData } from '@/contexts/VowosDataContext';
import { locationById } from '@/data/vowosData';
import { LocationSwitcher } from '@/components/vowos/LocationSelect';
import { VowosErrorBoundary } from '@/components/vowos/ErrorBoundary';
import Breadcrumbs from '@/components/vowos/Breadcrumbs';
import CommandPaletteModal from '@/components/vowos/CommandPaletteModal';
import MobileNavigation from '@/components/vowos/MobileNavigation';
import { NAVIGATION_ITEMS } from '@/lib/navigation/navigationRegistry';
import { getStoredCompactSidebar } from '@/lib/navigation/userPreferences';
import { fetchMessages } from '@/lib/messaging';

import { DemoModeBanner } from '@/components/demo/DemoModeBanner';
import { DemoCursorOverlay } from '@/components/demo/DemoCursorOverlay';
import { TourControlBar } from '@/components/demo/TourControlBar';
import { DemoLauncherModal } from '@/components/demo/DemoLauncherModal';
import TrainingCenterView from '@/features/training/components/TrainingCenterView';
import { VirtualCursorOverlay } from '@/features/training/components/VirtualCursorOverlay';

import DashboardView from '@/components/vowos/DashboardView';
import CustomersView from '@/components/vowos/CustomersView';
import LeadsView from '@/components/vowos/LeadsView';
import InventoryView from '@/components/vowos/InventoryView';
import TransfersView from '@/components/vowos/TransfersView';
import { CombinedOperationsCalendar } from '@/pages/scheduling/CombinedOperationsCalendar';
import EmployeeScheduleCalendar from '@/pages/scheduling/EmployeeScheduleCalendar';
import InvoicesView from '@/components/vowos/InvoicesView';
import PurchasesView from '@/components/vowos/PurchasesView';
import ReportsView from '@/components/vowos/ReportsView';
import LedgersView from '@/components/vowos/LedgersView';
import StaffView from '@/components/vowos/StaffView';
import CommunicationsView from '@/components/vowos/CommunicationsView';
import ContractsView from '@/components/vowos/ContractsView';
import AlterationsView from '@/components/vowos/AlterationsView';
import SettingsView from '@/components/vowos/settings/SettingsShell';
import PayrollView from '@/components/vowos/payroll/PayrollView';
import TimeClockView from '@/components/vowos/TimeClockView';
import OnlineStorePage from '@/features/proper-commerce/pages/OnlineStorePage';
import MarketingPage from '@/features/marketing/pages/MarketingPage';
import BridePortalView from '@/features/bride-portal/BridePortalView';
import ConsultantFittingRoomView from '@/features/fitting-room/ConsultantFittingRoomView';



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
  const isRoleLocked = !!role && !canAccessView(role, view, profile?.id);

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [compactSidebar, setCompactSidebar] = useState(() => getStoredCompactSidebar());

  const [headerMessages, setHeaderMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchMessages().then(setHeaderMessages).catch(() => {});
  }, []);

  const unreadMessagesCount = (headerMessages || []).filter(
    (c) => c.direction === 'inbound' || c.status === 'failed'
  ).length;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Sidebar
        view={view}
        onNavigate={setView}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onRequestSignIn={() => setAuthOpen(true)}
        isCompact={compactSidebar}
        onToggleCompact={() => setCompactSidebar(!compactSidebar)}
      />

      <div className={`flex flex-col transition-all duration-200 ${compactSidebar ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <DemoModeBanner />
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
              {/* Launch Demo Button */}
              <button
                data-tour-id="btn-launch-demo"
                onClick={() => setDemoModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold px-3 py-1.5 text-xs shadow-sm transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" /> Launch Demo
              </button>

              {/* Store / location switcher — scopes every view */}
              <div data-tour-id="header-location-select">
                <LocationSwitcher />
              </div>

              {/* Global Search / Command Palette button */}
              <button
                data-tour-id="header-search-brides"
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-400 transition-colors hover:border-stone-300 sm:flex shadow-2xs"
              >
                <Search className="h-3.5 w-3.5 text-stone-400" />
                <span>Search brides, gowns, orders...</span>
                <kbd className="ml-1 rounded border border-stone-200 bg-stone-50 px-1 py-0.5 text-[9px] font-medium text-stone-500">
                  Ctrl K
                </kbd>
              </button>

              {/* Global Communications Header Button */}
              <button
                onClick={() => setView('communications')}
                className="relative flex items-center justify-center h-9 w-9 rounded-lg border border-stone-200 bg-white text-stone-600 hover:text-stone-900 transition-colors shadow-2xs"
                title="Client Communications Inbox"
              >
                <MessageSquare className="h-4 w-4" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* Live alerts: in-transit transfers, overdue invoices, delayed POs */}
              <div data-tour-id="header-notifications">
                <NotificationsBell onNavigate={setView} />
              </div>

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

        <main className="px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8">
          <Breadcrumbs view={view} onNavigate={setView} />

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
            <VowosErrorBoundary>
              {view === 'dashboard' && <DashboardView onNavigate={setView} />}
              {view === 'customers' && <CustomersView />}
              {view === 'leads' && <LeadsView onNavigate={(v) => setView(v as ViewKey)} />}
              {view === 'inventory' && <InventoryView />}
              {view === 'transfers' && <TransfersView />}
              {view === 'appointments' && <CombinedOperationsCalendar />}
              {view === 'communications' && <CommunicationsView />}
              {view === 'contracts' && <ContractsView />}
              {view === 'alterations' && <AlterationsView />}

              {view === 'invoices' && <InvoicesView />}
              {view === 'purchases' && <PurchasesView />}
              {view === 'reports' && <ReportsView />}
              {view === 'ledgers' && <LedgersView />}
              {view === 'staff' && <StaffView />}
              {view === 'schedules' && <EmployeeScheduleCalendar />}
              {view === 'settings' && <SettingsView />}
              {view === 'payroll' && <PayrollView />}
              {view === 'timeclock' && <TimeClockView />}
              {view === 'training' && <TrainingCenterView onNavigate={setView} />}
              {view === 'onlinestore' && <OnlineStorePage />}
              {view === 'marketing' && <MarketingPage />}
              {view === 'bride-portal' && <BridePortalView />}
              {view === 'fitting-room' && <ConsultantFittingRoomView />}
            </VowosErrorBoundary>
          )}

          <DemoLauncherModal open={demoModalOpen} onClose={() => setDemoModalOpen(false)} onNavigateNeeded={setView} />
          <CommandPaletteModal open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onNavigate={setView} />
          <DemoCursorOverlay />
          <VirtualCursorOverlay />
          <TourControlBar onNavigateNeeded={setView} />

          <footer className="mt-10 border-t border-stone-200 pt-6 pb-4 text-center text-xs text-stone-400">
            VowOS — Bridal Retail Operating System · © 2026 Roberts Enterprises · I Do Bridal Couture
            + Proper & Company · Baton Rouge & Covington, LA ·{' '}
            {activeLocation === 'all' ? 'Viewing all locations' : `Viewing ${locationById(activeLocation).short}`}
          </footer>
        </main>
      </div>

      {/* Role-aware mobile navigation bar and More drawer */}
      <MobileNavigation view={view} onNavigate={setView} onRequestSignIn={() => setAuthOpen(true)} />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
