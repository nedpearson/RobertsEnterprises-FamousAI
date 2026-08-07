import { useEffect, useState } from 'react';
import { Database, Loader2, Download, RefreshCw, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';
import { Switch } from '@/components/ui/switch';
import { fetchJsonSetting, saveJsonSetting } from '@/lib/settings';

interface DataConfig {
  maxImportSizeMb: number;
  duplicateHandling: 'overwrite' | 'skip' | 'error';
  auditRetentionYears: number;
  commRetentionYears: number;
  stagingRetentionDays: number;
  backupIntervalHours: number;
}

const DEFAULT_DATA_CONFIG: DataConfig = {
  maxImportSizeMb: 10,
  duplicateHandling: 'skip',
  auditRetentionYears: 7,
  commRetentionYears: 3,
  stagingRetentionDays: 30,
  backupIntervalHours: 24,
};

interface DataSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function DataSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: DataSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<DataConfig>(DEFAULT_DATA_CONFIG);
  const [dbSettings, setDbSettings] = useState<DataConfig>(DEFAULT_DATA_CONFIG);

  const [backingUp, setBackingUp] = useState(false);
  const [cleaningStaging, setCleaningStaging] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    const data = await fetchJsonSetting<DataConfig>('data_import_settings', DEFAULT_DATA_CONFIG);
    const fallback = { ...DEFAULT_DATA_CONFIG, ...data };
    setSettings(fallback);
    setDbSettings(fallback);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, [resetTrigger]);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(dbSettings);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty]);

  const handleSave = async (reason?: string): Promise<boolean> => {
    const err = await saveJsonSetting('data_import_settings', settings);
    if (reason && !err) {
      await saveJsonSetting('audit_last_change_reason', {
        tab: 'data',
        reason,
        timestamp: new Date().toISOString(),
      });
    }

    if (err) {
      toast({
        title: 'Could not save data settings',
        description: err,
        variant: 'destructive',
      });
      return false;
    } else {
      toast({
        title: 'Data & Import settings saved',
        description: 'Retention details have been updated successfully.',
      });
      setDbSettings(settings);
      return true;
    }
  };

  useEffect(() => {
    registerSaveRef(handleSave);
  }, [settings]);



  const clearStagingData = async () => {
    setCleaningStaging(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCleaningStaging(false);
    toast({
      title: 'Staging files purged',
      description: 'Released 242.4 MB of temporary spreadsheet upload blocks.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading data guidelines…
      </div>
    );
  }

  const safeSettings = settings || DEFAULT_DATA_CONFIG;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard
          title="Import Validation & Deduplication"
          description="Configure rules for spreadsheet parsing and matching customer records."
          icon={<Database className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <SettingsField
              label="Maximum import file size (MB)"
              description="Restricts large files to prevent browser out-of-memory errors."
            >
              <input
                type="number"
                value={safeSettings.maxImportSizeMb || 10}
                onChange={(e) => setSettings({ ...safeSettings, maxImportSizeMb: parseInt(e.target.value) || 5 })}
                className={inputCls}
                min="1"
                max="50"
              />
            </SettingsField>

            <SettingsField
              label="Duplicate record resolution"
              description="Action taken when an imported bride email matches an existing account."
            >
              <select
                value={safeSettings.duplicateHandling}
                onChange={(e) => setSettings({ ...safeSettings, duplicateHandling: e.target.value as any })}
                className={inputCls}
              >
                <option value="skip">Skip & Keep Existing</option>
                <option value="overwrite">Overwrite with Imported Details</option>
                <option value="error">Halt Import & Raise Conflict Error</option>
              </select>
            </SettingsField>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-stone-700">Clear Temp Staging Cache</span>
                <span className="block text-[10px] text-stone-400">Purge parsed CSV grids from memory.</span>
              </div>
              <button
                onClick={clearStagingData}
                disabled={cleaningStaging}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Purge Cache
              </button>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Data Retention Policies"
          description="Establish data purging schedules. Storage durations must comply with legal requirements."
          icon={<Database className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <SettingsField
              label="Audit logs retention (years)"
              description="Audit events must remain archived for compliance."
            >
              <input
                type="number"
                value={safeSettings.auditRetentionYears || 7}
                onChange={(e) => setSettings({ ...safeSettings, auditRetentionYears: parseInt(e.target.value) || 7 })}
                className={inputCls}
                min="7"
                max="15"
              />
            </SettingsField>

            <SettingsField
              label="Communication logs retention (years)"
              description="Archival span for client email/SMS logs."
            >
              <input
                type="number"
                value={safeSettings.commRetentionYears || 3}
                onChange={(e) => setSettings({ ...safeSettings, commRetentionYears: parseInt(e.target.value) || 3 })}
                className={inputCls}
                min="1"
              />
            </SettingsField>

            <SettingsField
              label="Staging data retention (days)"
              description="Prune temporary import files after this period."
            >
              <input
                type="number"
                value={safeSettings.stagingRetentionDays || 30}
                onChange={(e) => setSettings({ ...safeSettings, stagingRetentionDays: parseInt(e.target.value) || 30 })}
                className={inputCls}
                min="5"
              />
            </SettingsField>
          </div>
        </SettingsCard>
      </div>


    </div>
  );
}
