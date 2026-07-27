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
  CalendarHeart,
  MessageSquare,
  FileSignature,
  Scissors,
  SlidersHorizontal,
  AlarmClock,
  LucideIcon
} from 'lucide-react';
import { StaffRole } from '@/contexts/AuthContext';

export type NavigationSectionId =
  | 'today'
  | 'clients'
  | 'gowns'
  | 'finance'
  | 'team'
  | 'insights'
  | 'admin'
  | 'external';

export type ViewKey =
  | 'dashboard' // Maps to Today
  | 'customers' // Brides
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

export interface NavigationSection {
  id: NavigationSectionId;
  label: string;
  order: number;
  defaultExpanded?: boolean;
}

export interface NavigationItem {
  id: ViewKey | 'booking';
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  href?: string;
  path: string;
  section: NavigationSectionId;
  allowedRoles: StaffRole[];
  badgeKey?: 'overdueInvoices' | 'pendingContracts' | 'unreadMessages' | 'alterationsDue' | 'delayedOrders' | 'inTransitTransfers';
  external?: boolean;
  openInNewTab?: boolean;
  mobilePriority?: number; // Lower number = higher priority for bottom nav bar
  searchKeywords: string[];
}

export const NAVIGATION_SECTIONS: NavigationSection[] = [
  { id: 'today', label: 'TODAY', order: 1, defaultExpanded: true },
  { id: 'clients', label: 'CLIENTS & SALES', order: 2, defaultExpanded: true },
  { id: 'gowns', label: 'GOWNS & OPERATIONS', order: 3, defaultExpanded: true },
  { id: 'finance', label: 'FINANCE', order: 4, defaultExpanded: false },
  { id: 'team', label: 'TEAM', order: 5, defaultExpanded: false },
  { id: 'insights', label: 'INSIGHTS', order: 6, defaultExpanded: false },
  { id: 'admin', label: 'ADMIN', order: 7, defaultExpanded: false },
  { id: 'external', label: 'EXTERNAL BUSINESS PAGE', order: 8, defaultExpanded: true },
];

export const NAVIGATION_ITEMS: NavigationItem[] = [
  // TODAY
  {
    id: 'dashboard',
    label: 'Today',
    shortLabel: 'Today',
    icon: LayoutDashboard,
    path: '/today',
    section: 'today',
    allowedRoles: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
    mobilePriority: 1,
    searchKeywords: ['dashboard', 'today', 'overview', 'kpi', 'alerts', 'command center'],
  },

  // CLIENTS & SALES
  {
    id: 'customers',
    label: 'Brides',
    shortLabel: 'Brides',
    icon: Users,
    path: '/brides',
    section: 'clients',
    allowedRoles: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
    mobilePriority: 2,
    searchKeywords: ['bride', 'customers', 'clients', 'profiles', 'wedding', 'bride 360'],
  },
  {
    id: 'leads',
    label: 'Leads',
    shortLabel: 'Leads',
    icon: Sparkles,
    path: '/leads',
    section: 'clients',
    allowedRoles: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
    mobilePriority: 10,
    searchKeywords: ['leads', 'prospects', 'inquiries', 'consultations', 'pipeline'],
  },
  {
    id: 'appointments',
    label: 'Appointments',
    shortLabel: 'Schedule',
    icon: CalendarDays,
    path: '/appointments',
    section: 'clients',
    allowedRoles: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
    mobilePriority: 3,
    searchKeywords: ['appointments', 'schedule', 'calendar', 'fittings', 'consultation', 'booking'],
  },
  {
    id: 'contracts',
    label: 'Contracts',
    shortLabel: 'Contracts',
    icon: FileSignature,
    path: '/contracts',
    section: 'clients',
    allowedRoles: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
    badgeKey: 'pendingContracts',
    mobilePriority: 11,
    searchKeywords: ['contracts', 'agreements', 'signatures', 'pending contracts', 'legal'],
  },

  // GOWNS & OPERATIONS
  {
    id: 'inventory',
    label: 'Gown Inventory',
    shortLabel: 'Inventory',
    icon: Shirt,
    path: '/inventory',
    section: 'gowns',
    allowedRoles: ['Owner', 'Manager', 'Stylist'],
    mobilePriority: 4,
    searchKeywords: ['gowns', 'inventory', 'dresses', 'sample gowns', 'styles', 'stock'],
  },
  {
    id: 'alterations',
    label: 'Alterations',
    shortLabel: 'Fittings',
    icon: Scissors,
    path: '/alterations',
    section: 'gowns',
    allowedRoles: ['Owner', 'Manager', 'Stylist'],
    badgeKey: 'alterationsDue',
    mobilePriority: 5,
    searchKeywords: ['alterations', 'fittings', 'seamstress', 'tailoring', 'modifications', 'fitting queue'],
  },
  {
    id: 'transfers',
    label: 'Store Transfers',
    shortLabel: 'Transfers',
    icon: ArrowLeftRight,
    path: '/transfers',
    section: 'gowns',
    allowedRoles: ['Owner', 'Manager', 'Stylist'],
    badgeKey: 'inTransitTransfers',
    mobilePriority: 12,
    searchKeywords: ['transfers', 'interstore', 'locations', 'baton rouge', 'covington', 'transit'],
  },
  {
    id: 'purchases',
    label: 'Purchase Orders',
    shortLabel: 'Orders',
    icon: PackageSearch,
    path: '/purchases',
    section: 'gowns',
    allowedRoles: ['Owner', 'Manager'],
    badgeKey: 'delayedOrders',
    mobilePriority: 13,
    searchKeywords: ['purchase orders', 'po', 'vendors', 'designers', 'special orders', 'ordering'],
  },

  // FINANCE
  {
    id: 'invoices',
    label: 'Invoices',
    shortLabel: 'POS / Pay',
    icon: Receipt,
    path: '/invoices',
    section: 'finance',
    allowedRoles: ['Owner', 'Manager', 'Front Desk'],
    badgeKey: 'overdueInvoices',
    mobilePriority: 6,
    searchKeywords: ['invoices', 'pos', 'payments', 'balances', 'due', 'receipts', 'billing'],
  },
  {
    id: 'ledgers',
    label: 'Ledgers',
    shortLabel: 'Ledgers',
    icon: BookOpenText,
    path: '/ledgers',
    section: 'finance',
    allowedRoles: ['Owner', 'Manager'],
    mobilePriority: 14,
    searchKeywords: ['ledgers', 'accounting', 'journal', 'transactions', 'financials', 'auditing'],
  },

  // TEAM
  {
    id: 'timeclock',
    label: 'Time Clock & Kiosk',
    shortLabel: 'Clock In',
    icon: AlarmClock,
    path: '/timeclock',
    section: 'team',
    allowedRoles: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
    mobilePriority: 7,
    searchKeywords: ['time clock', 'kiosk', 'clock in', 'clock out', 'shifts', 'hours', 'attendance'],
  },
  {
    id: 'staff',
    label: 'Team & Permissions',
    shortLabel: 'Team',
    icon: ShieldCheck,
    path: '/team',
    section: 'team',
    allowedRoles: ['Owner'],
    mobilePriority: 15,
    searchKeywords: ['staff', 'team', 'roles', 'permissions', 'users', 'access control'],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    shortLabel: 'Payroll',
    icon: Gem,
    path: '/payroll',
    section: 'team',
    allowedRoles: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
    mobilePriority: 16,
    searchKeywords: ['payroll', 'commissions', 'tips', 'wages', 'workforce', 'payouts'],
  },
  {
    id: 'training',
    label: 'Training Center',
    shortLabel: 'Training',
    icon: BookOpenText,
    path: '/training',
    section: 'team',
    allowedRoles: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
    mobilePriority: 17,
    searchKeywords: ['training', 'demo', 'scenarios', 'tutorials', 'guided tour', 'learning'],
  },

  // INSIGHTS
  {
    id: 'reports',
    label: 'Insights & Reports',
    shortLabel: 'Insights',
    icon: BarChart3,
    path: '/reports',
    section: 'insights',
    allowedRoles: ['Owner', 'Manager'],
    mobilePriority: 8,
    searchKeywords: ['reports', 'analytics', 'insights', 'sales goals', 'conversion', 'revenue'],
  },

  // ADMIN
  {
    id: 'settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: SlidersHorizontal,
    path: '/settings',
    section: 'admin',
    allowedRoles: ['Owner', 'Manager'],
    mobilePriority: 18,
    searchKeywords: ['settings', 'configuration', 'store setup', 'notifications', 'taxes', 'system'],
  },

  // EXTERNAL
  {
    id: 'booking',
    label: 'View Online Booking Page',
    shortLabel: 'Booking Page',
    icon: CalendarHeart,
    path: '/book',
    section: 'external',
    allowedRoles: ['Owner', 'Manager', 'Stylist', 'Front Desk'],
    external: true,
    openInNewTab: true,
    mobilePriority: 19,
    searchKeywords: ['online booking', 'public page', 'bride booking', 'client schedule link'],
  },
];

/** Map view key to canonical path */
export const VIEW_TO_PATH: Record<ViewKey, string> = {
  dashboard: '/today',
  customers: '/brides',
  leads: '/leads',
  inventory: '/inventory',
  transfers: '/transfers',
  appointments: '/appointments',
  communications: '/communications',
  contracts: '/contracts',
  alterations: '/alterations',
  invoices: '/invoices',
  purchases: '/purchases',
  reports: '/reports',
  ledgers: '/ledgers',
  staff: '/team',
  settings: '/settings',
  payroll: '/payroll',
  timeclock: '/timeclock',
  training: '/training',
};

/** Map path to view key */
export const PATH_TO_VIEW: Record<string, ViewKey> = {
  '/today': 'dashboard',
  '/dashboard': 'dashboard', // Legacy alias
  '/brides': 'customers',
  '/customers': 'customers', // Legacy alias
  '/leads': 'leads',
  '/inventory': 'inventory',
  '/transfers': 'transfers',
  '/appointments': 'appointments',
  '/communications': 'communications',
  '/contracts': 'contracts',
  '/alterations': 'alterations',
  '/invoices': 'invoices',
  '/purchases': 'purchases',
  '/reports': 'reports',
  '/ledgers': 'ledgers',
  '/team': 'staff',
  '/staff': 'staff', // Legacy alias
  '/settings': 'settings',
  '/payroll': 'payroll',
  '/timeclock': 'timeclock',
  '/training': 'training',
};
