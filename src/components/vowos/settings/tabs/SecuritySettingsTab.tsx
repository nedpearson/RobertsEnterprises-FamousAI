import { useEffect, useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';
import { Switch } from '@/components/ui/switch';
import { fetchJsonSetting, saveJsonSetting, DEFAULT_SECURITY_SETTINGS, SecuritySettings } from '@/lib/settings';

interface SecuritySettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function SecuritySettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: SecuritySettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SECURITY_SETTINGS);
  const [dbSettings, setDbSettings] = useState<SecuritySettings>(DEFAULT_SECURITY_SETTINGS);

  const loadSettings = async () => {
    setLoading(true);
    const data = await fetchJsonSetting<SecuritySettings>('security_settings', DEFAULT_SECURITY_SETTINGS);
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
    const err = await saveJsonSetting('security_settings', settings);
    if (reason && !err) {
      await saveJsonSetting('audit_last_change_reason', {
        tab: 'security',
        reason,
        timestamp: new Date().toISOString(),
      });
    }

    if (err) {
      toast({
        title: 'Could not save security settings',
        description: err,
        variant: 'destructive',
      });
      return false;
    } else {
      toast({
        title: 'Security policy updated',
        description: 'Authentication parameters have been saved successfully.',
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
        <Loader2 className="h-4 w-4 animate-spin" /> Loading credentials policy…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Authentication & Session Policies"
        description="Establish baseline password complexities, lockout limits, and idle timeouts."
        icon={<ShieldAlert className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField
            label="Minimum password length"
            description="Shortest password allowed for staff registration."
          >
            <input
              type="number"
              value={settings.minPasswordLength}
              onChange={(e) => setSettings({ ...settings, minPasswordLength: parseInt(e.target.value) || 8 })}
              className={inputCls}
              min="8"
              max="32"
            />
          </SettingsField>

          <SettingsField
            label="Require password complexity"
            description="Forces passwords to contain upper/lowercase, numbers, and symbols."
          >
            <div className="flex items-center justify-between h-9 px-1">
              <span className="text-xs text-stone-500 font-medium">Strong complexity required</span>
              <Switch
                checked={settings.requireComplexity}
                onCheckedChange={(checked) => setSettings({ ...settings, requireComplexity: checked })}
                className="data-[state=checked]:bg-rose-500"
              />
            </div>
          </SettingsField>

          <SettingsField
            label="Failed login lockout attempts"
            description="Number of attempts before the account gets temporarily locked."
          >
            <input
              type="number"
              value={settings.lockoutAttempts}
              onChange={(e) => setSettings({ ...settings, lockoutAttempts: parseInt(e.target.value) || 5 })}
              className={inputCls}
              min="3"
              max="10"
            />
          </SettingsField>

          <SettingsField
            label="Lockout duration (minutes)"
            description="Time locked accounts must wait before re-trying."
          >
            <input
              type="number"
              value={settings.lockoutDurationMinutes}
              onChange={(e) => setSettings({ ...settings, lockoutDurationMinutes: parseInt(e.target.value) || 15 })}
              className={inputCls}
              min="5"
            />
          </SettingsField>

          <SettingsField
            label="Maximum session duration (hours)"
            description="How long a logged-in user can remain active before being forced to log in again."
          >
            <input
              type="number"
              value={(settings.sessionDurationMinutes / 60).toFixed(0)}
              onChange={(e) => setSettings({ ...settings, sessionDurationMinutes: (parseInt(e.target.value) || 2) * 60 })}
              className={inputCls}
              min="1"
              max="24"
            />
          </SettingsField>

          <SettingsField
            label="Enforce Multi-Factor Authentication (MFA)"
            description="Force owners and managers to enroll in TOTP verification."
          >
            <div className="flex items-center justify-between h-9 px-1">
              <span className="text-xs text-stone-500 font-medium">MFA mandatory for admin roles</span>
              <Switch
                checked={settings.mfaRequired}
                onCheckedChange={(checked) => setSettings({ ...settings, mfaRequired: checked })}
                className="data-[state=checked]:bg-rose-500"
              />
            </div>
          </SettingsField>

          <SettingsField
            label="Idle timeout warning (minutes)"
            description="Lock browser screen after inactivity."
            className="sm:col-span-2"
          >
            <input
              type="number"
              value={settings.idleTimeoutMinutes}
              onChange={(e) => setSettings({ ...settings, idleTimeoutMinutes: parseInt(e.target.value) || 15 })}
              className={inputCls}
              min="5"
            />
          </SettingsField>
        </div>
      </SettingsCard>
    </div>
  );
}
