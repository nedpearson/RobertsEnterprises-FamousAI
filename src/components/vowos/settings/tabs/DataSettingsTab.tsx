import { useEffect, useState } from 'react';
import { Database, Loader2 } from 'lucide-react';
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
}

const DEFAULT_DATA_CONFIG: DataConfig = {
  maxImportSizeMb: 10,
  duplicateHandling: 'skip',
  auditRetentionYears: 7, // IRS & compliance require 7 years
  commRetentionYears: 3,
  stagingRetentionDays: 30,
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

  const loadSettings = async () => {
    setLoading(true);
    const data = await fetchJsonSetting<DataConfig>('data_import_settings', DEFAULT_DATA_CONFIG);
    setSettings(data);
    setDbSettings(data);
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading data guidelines…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Import Validation & Deduplication"
        description="Configure rules for spreadsheet parsing and matching customer records."
        icon={<Database className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField
            label="Maximum import file size (MB)"
            description="Restricts large files to prevent browser out-of-memory errors."
          >
            <input
              type="number"
              value={settings.maxImportSizeMb}
              onChange={(e) => setSettings({ ...settings, maxImportSizeMb: parseInt(e.target.value) || 5 })}
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
              value={settings.duplicateHandling}
              onChange={(e) => setSettings({ ...settings, duplicateHandling: e.target.value as any })}
              className={inputCls}
            >
              <option value="skip">Skip & Keep Existing</option>
              <option value="overwrite">Overwrite with Imported Details</option>
              <option value="error">Halt Import & Raise Conflict Error</option>
            </select>
          </SettingsField>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Data Retention Policies"
        description="Establish data purging schedules. Storage durations must comply with legal requirements."
        icon={<Database className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField
            label="Audit logs retention (years)"
            description="Audit events must remain archived for compliance."
          >
            <input
              type="number"
              value={settings.auditRetentionYears}
              onChange={(e) => setSettings({ ...settings, auditRetentionYears: parseInt(e.target.value) || 7 })}
              className={inputCls}
              min="7" // Block reducing below IRS requirement
              max="15"
            />
          </SettingsField>

          <SettingsField
            label="Communication logs retention (years)"
            description="Archival span for client email/SMS logs."
          >
            <input
              type="number"
              value={settings.commRetentionYears}
              onChange={(e) => setSettings({ ...settings, commRetentionYears: parseInt(e.target.value) || 3 })}
              className={inputCls}
              min="1"
            />
          </SettingsField>

          <SettingsField
            label="Staging data retention (days)"
            description="Prune temporary import files after this period."
            className="sm:col-span-2"
          >
            <input
              type="number"
              value={settings.stagingRetentionDays}
              onChange={(e) => setSettings({ ...settings, stagingRetentionDays: parseInt(e.target.value) || 30 })}
              className={inputCls}
              min="5"
            />
          </SettingsField>
        </div>
      </SettingsCard>
    </div>
  );
}
