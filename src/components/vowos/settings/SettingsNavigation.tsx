import { ReactNode } from 'react';
import {
  Building,
  MapPin,
  Calendar,
  MousePointerClick,
  CreditCard,
  Receipt,
  Percent,
  Shirt,
  ShoppingBag,
  ArrowLeftRight,
  Scissors,
  MessageSquare,
  Zap,
  Bell,
  FileText,
  Plug,
  BarChart3,
  ShieldAlert,
  Database,
  History,
  Activity,
  Flag,
} from 'lucide-react';

export type SettingsTab =
  | 'organization'
  | 'locations'
  | 'scheduling'
  | 'booking'
  | 'payments'
  | 'sales'
  | 'commission'
  | 'inventory'
  | 'purchasing'
  | 'transfers'
  | 'alterations'
  | 'communications'
  | 'automations'
  | 'notifications'
  | 'documents'
  | 'integrations'
  | 'reporting'
  | 'security'
  | 'data'
  | 'audit'
  | 'system-health'
  | 'feature-flags';

export interface SettingsCategory {
  group: string;
  items: {
    id: SettingsTab;
    label: string;
    icon: typeof Building;
    roles: string[];
  }[];
}

export const SETTINGS_GROUPS: SettingsCategory[] = [
  {
    group: 'General & Stores',
    items: [
      { id: 'organization', label: 'Organization', icon: Building, roles: ['Owner'] },
      { id: 'locations', label: 'Locations', icon: MapPin, roles: ['Owner', 'Manager'] },
      { id: 'reporting', label: 'Reporting Settings', icon: BarChart3, roles: ['Owner', 'Manager'] },
    ],
  },
  {
    group: 'Scheduling & Booking',
    items: [
      { id: 'scheduling', label: 'Availability Rules', icon: Calendar, roles: ['Owner', 'Manager'] },
      { id: 'booking', label: 'Online Booking', icon: MousePointerClick, roles: ['Owner', 'Manager'] },
      { id: 'alterations', label: 'Alterations & Pickups', icon: Scissors, roles: ['Owner', 'Manager'] },
    ],
  },
  {
    group: 'Finance & Payments',
    items: [
      { id: 'payments', label: 'Payments & Taxes', icon: CreditCard, roles: ['Owner', 'Manager'] },
      { id: 'sales', label: 'Sales & Invoicing', icon: Receipt, roles: ['Owner', 'Manager'] },
      { id: 'commission', label: 'Commission Plans', icon: Percent, roles: ['Owner'] },
    ],
  },
  {
    group: 'Operations & Supply',
    items: [
      { id: 'inventory', label: 'Inventory Rules', icon: Shirt, roles: ['Owner', 'Manager'] },
      { id: 'purchasing', label: 'Purchasing & Vendor', icon: ShoppingBag, roles: ['Owner', 'Manager'] },
      { id: 'transfers', label: 'Store Transfers', icon: ArrowLeftRight, roles: ['Owner', 'Manager'] },
    ],
  },
  {
    group: 'Comms & Automation',
    items: [
      { id: 'communications', label: 'Channels & Twilio', icon: MessageSquare, roles: ['Owner', 'Manager'] },
      { id: 'automations', label: 'Automation Rules', icon: Zap, roles: ['Owner', 'Manager'] },
      { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['Owner', 'Manager', 'Stylist', 'Front Desk'] },
      { id: 'documents', label: 'Documents & Templates', icon: FileText, roles: ['Owner', 'Manager'] },
    ],
  },
  {
    group: 'System & Security',
    items: [
      { id: 'integrations', label: 'Integrations & AI', icon: Plug, roles: ['Owner'] },
      { id: 'security', label: 'Security Policy', icon: ShieldAlert, roles: ['Owner'] },
      { id: 'data', label: 'Data & Import', icon: Database, roles: ['Owner'] },
      { id: 'audit', label: 'Audit Log', icon: History, roles: ['Owner'] },
      { id: 'system-health', label: 'System Health', icon: Activity, roles: ['Owner'] },
      { id: 'feature-flags', label: 'Feature Flags', icon: Flag, roles: ['Owner'] },
    ],
  },
];

interface SettingsNavigationProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  userRole: string | null;
}

export function SettingsNavigation({
  activeTab,
  onTabChange,
  userRole = 'Stylist',
}: SettingsNavigationProps) {
  const role = userRole || 'Stylist';

  return (
    <nav className="space-y-6">
      {SETTINGS_GROUPS.map((group) => {
        // Filter items by role permission
        const visibleItems = group.items.filter((item) => item.roles.includes(role));
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.group} className="space-y-1.5">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {group.group}
            </h4>
            <div className="space-y-0.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      active
                        ? 'bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-rose-500' : 'text-stone-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
