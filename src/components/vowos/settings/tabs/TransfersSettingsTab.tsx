import { useEffect, useState } from 'react';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';
import { Switch } from '@/components/ui/switch';
import { fetchJsonSetting, saveJsonSetting, DEFAULT_TRANSFER_SETTINGS, TransferSettings } from '@/lib/settings';

interface TransfersSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function TransfersSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: TransfersSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<TransferSettings>(DEFAULT_TRANSFER_SETTINGS);
  const [dbSettings, setDbSettings] = useState<TransferSettings>(DEFAULT_TRANSFER_SETTINGS);

  const loadSettings = async () => {
    setLoading(true);
    const data = await fetchJsonSetting<TransferSettings>('transfer_settings', DEFAULT_TRANSFER_SETTINGS);
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
    const err = await saveJsonSetting('transfer_settings', settings);
    if (reason && !err) {
      await saveJsonSetting('audit_last_change_reason', {
        tab: 'transfers',
        reason,
        timestamp: new Date().toISOString(),
      });
    }

    if (err) {
      toast({
        title: 'Could not save transfer settings',
        description: err,
        variant: 'destructive',
      });
      return false;
    } else {
      toast({
        title: 'Transfer rules saved',
        description: 'Store transfer parameters have been updated successfully.',
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
        <Loader2 className="h-4 w-4 animate-spin" /> Loading transfer protocols…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Inter-Location Transfer Rules"
        description="Establish inventory safety stock caps, transit guidelines, and transfer gate authorizations."
        icon={<ArrowLeftRight className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField
            label="Enable store transfers"
            description="Allow logistics personnel to transfer sample gowns between store boutiques."
          >
            <div className="flex items-center justify-between h-9 px-1">
              <span className="text-xs text-stone-500 font-medium">Inter-store transfers permitted</span>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                className="data-[state=checked]:bg-rose-500"
              />
            </div>
          </SettingsField>

          <SettingsField
            label="Manager approval required"
            description="Require authorized manager signoff before packing a transfer request."
          >
            <div className="flex items-center justify-between h-9 px-1">
              <span className="text-xs text-stone-500 font-medium">Approval gates active</span>
              <Switch
                checked={settings.approvalRequired}
                onCheckedChange={(checked) => setSettings({ ...settings, approvalRequired: checked })}
                className="data-[state=checked]:bg-rose-500"
              />
            </div>
          </SettingsField>

          <SettingsField
            label="Manager approval threshold ($)"
            description="Transfers with item value above this require explicit manager authorization."
          >
            <input
              type="number"
              value={(settings.approvalThresholdCents / 100).toFixed(2)}
              onChange={(e) => setSettings({ ...settings, approvalThresholdCents: Math.round(parseFloat(e.target.value) * 100) || 0 })}
              className={inputCls}
              min="0"
              step="0.01"
            />
          </SettingsField>

          <SettingsField
            label="Minimum source safety stock (units)"
            description="Do not recommend source location if stock drops below this limit."
          >
            <input
              type="number"
              value={settings.minSourceStock}
              onChange={(e) => setSettings({ ...settings, minSourceStock: parseInt(e.target.value) || 0 })}
              className={inputCls}
              min="0"
            />
          </SettingsField>

          <SettingsField
            label="Expected transit duration (days)"
            description="Default days allowed in transit before flags mark a transfer overdue."
          >
            <input
              type="number"
              value={settings.transitDaysDefault}
              onChange={(e) => setSettings({ ...settings, transitDaysDefault: parseInt(e.target.value) || 1 })}
              className={inputCls}
              min="1"
            />
          </SettingsField>

          <SettingsField
            label="Enforce package tracking number"
            description="Require shipping carrier label or tracking number before shipping."
          >
            <div className="flex items-center justify-between h-9 px-1">
              <span className="text-xs text-stone-500 font-medium">Tracking identifier mandatory</span>
              <Switch
                checked={settings.trackingRequired}
                onCheckedChange={(checked) => setSettings({ ...settings, trackingRequired: checked })}
                className="data-[state=checked]:bg-rose-500"
              />
            </div>
          </SettingsField>

          <SettingsField
            label="Enforce barcode scan on receive"
            description="Require intake clerks to scan item barcode tags to finalize receipt."
            className="sm:col-span-2"
          >
            <div className="flex items-center justify-between h-9 px-1">
              <span className="text-xs text-stone-500 font-medium">Strict receipt barcode verification</span>
              <Switch
                checked={settings.scanRequired}
                onCheckedChange={(checked) => setSettings({ ...settings, scanRequired: checked })}
                className="data-[state=checked]:bg-rose-500"
              />
            </div>
          </SettingsField>
        </div>
      </SettingsCard>
    </div>
  );
}
