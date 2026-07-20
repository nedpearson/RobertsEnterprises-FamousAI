import { useEffect, useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';
import { Switch } from '@/components/ui/switch';
import { fetchJsonSetting, saveJsonSetting, DEFAULT_FEATURE_FLAGS, FeatureFlag } from '@/lib/settings';

interface FeatureFlagsSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function FeatureFlagsSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: FeatureFlagsSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FeatureFlag[]>(DEFAULT_FEATURE_FLAGS);
  const [dbFlags, setDbFlags] = useState<FeatureFlag[]>(DEFAULT_FEATURE_FLAGS);

  const loadSettings = async () => {
    setLoading(true);
    const data = await fetchJsonSetting<FeatureFlag[]>('feature_flags', DEFAULT_FEATURE_FLAGS);
    setFlags(data);
    setDbFlags(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, [resetTrigger]);

  const isDirty = JSON.stringify(flags) !== JSON.stringify(dbFlags);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty]);

  const handleSave = async (reason?: string): Promise<boolean> => {
    const err = await saveJsonSetting('feature_flags', flags);
    if (reason && !err) {
      await saveJsonSetting('audit_last_change_reason', {
        tab: 'feature-flags',
        reason,
        timestamp: new Date().toISOString(),
      });
    }

    if (err) {
      toast({
        title: 'Could not save feature flags',
        description: err,
        variant: 'destructive',
      });
      return false;
    } else {
      toast({
        title: 'Feature flags updated',
        description: 'Staged releases rules updated successfully.',
      });
      setDbFlags(flags);
      return true;
    }
  };

  useEffect(() => {
    registerSaveRef(handleSave);
  }, [flags]);

  const updateFlag = (id: string, checked: boolean) => {
    setFlags(
      flags.map((f) => (f.id === id ? { ...f, enabled: checked } : f))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading staged rollouts…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Feature Rollouts & Staging Flags"
        description="Enable or disable experimental features for selected stores and stylists."
        icon={<Flag className="h-5 w-5" />}
      >
        <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white overflow-hidden">
          {flags.map((flag) => (
            <div key={flag.id} className="flex justify-between items-center p-4">
              <div>
                <h6 className="text-xs font-bold text-stone-800 uppercase tracking-wider">{flag.name}</h6>
                <p className="text-[11px] text-stone-400 mt-0.5">{flag.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] text-stone-400 font-bold bg-stone-50 border border-stone-200 px-1.5 py-0.5 rounded">
                  Rollout: {flag.rolloutPct}%
                </span>
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={(checked) => updateFlag(flag.id, checked)}
                  className="data-[state=checked]:bg-rose-500"
                />
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
