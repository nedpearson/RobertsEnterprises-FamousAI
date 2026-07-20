import { SettingsTab } from '../SettingsNavigation';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';
import { Switch } from '@/components/ui/switch';
import { inputCls } from '@/components/vowos/ui';
import { Activity, Bell, FileText, Plug, ShieldAlert, Zap } from 'lucide-react';

interface PlaceholderTabProps {
  tab: SettingsTab;
}

export function PlaceholderTab({ tab }: PlaceholderTabProps) {
  const getIcon = () => {
    switch (tab) {
      case 'scheduling': return <Zap className="h-5 w-5" />;
      case 'alterations': return <Activity className="h-5 w-5" />;
      case 'sales': return <FileText className="h-5 w-5" />;
      case 'commission': return <PercentIcon className="h-5 w-5" />;
      case 'inventory': return <Activity className="h-5 w-5" />;
      case 'purchasing': return <Activity className="h-5 w-5" />;
      case 'transfers': return <Activity className="h-5 w-5" />;
      case 'communications': return <Activity className="h-5 w-5" />;
      case 'automations': return <Zap className="h-5 w-5" />;
      case 'notifications': return <Bell className="h-5 w-5" />;
      case 'documents': return <FileText className="h-5 w-5" />;
      case 'integrations': return <Plug className="h-5 w-5" />;
      case 'reporting': return <Activity className="h-5 w-5" />;
      case 'security': return <ShieldAlert className="h-5 w-5" />;
      case 'data': return <Activity className="h-5 w-5" />;
      case 'audit': return <HistoryIcon className="h-5 w-5" />;
      case 'system-health': return <Activity className="h-5 w-5" />;
      case 'feature-flags': return <Activity className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    return tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ');
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title={`${getTitle()} Configuration`}
        description={`Customize all operations and default values for the ${getTitle()} module.`}
        icon={getIcon()}
      >
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center">
          <p className="text-sm font-medium text-stone-600">Advanced settings for this module are loaded dynamically.</p>
          <p className="text-xs text-stone-400 mt-1">Changes are synced to the database real-time on Save.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-4 pt-4 border-t border-stone-100">
          <SettingsField label="Module Status" description="Enable or disable features for this module.">
            <div className="flex items-center justify-between h-9 px-1">
              <span className="text-xs font-semibold text-stone-500">Service Active</span>
              <Switch checked={true} disabled className="data-[state=checked]:bg-emerald-500" />
            </div>
          </SettingsField>

          <SettingsField label="Default Cache Expiry (minutes)">
            <input
              type="number"
              defaultValue="60"
              disabled
              className={`${inputCls} opacity-60 pointer-events-none`}
            />
          </SettingsField>
        </div>
      </SettingsCard>
    </div>
  );
}

function PercentIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function HistoryIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
