import { useEffect, useState } from 'react';
import { Plug, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';
import { Switch } from '@/components/ui/switch';
import { fetchJsonSetting, saveJsonSetting, DEFAULT_AI_SETTINGS, AISettings } from '@/lib/settings';

interface IntegrationsSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function IntegrationsSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: IntegrationsSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [dbSettings, setDbSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);

  const loadSettings = async () => {
    setLoading(true);
    const data = await fetchJsonSetting<AISettings>('ai_settings', DEFAULT_AI_SETTINGS);
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
    const err = await saveJsonSetting('ai_settings', settings);
    if (reason && !err) {
      await saveJsonSetting('audit_last_change_reason', {
        tab: 'integrations',
        reason,
        timestamp: new Date().toISOString(),
      });
    }

    if (err) {
      toast({
        title: 'Could not save integrations settings',
        description: err,
        variant: 'destructive',
      });
      return false;
    } else {
      toast({
        title: 'Integrations & AI settings saved',
        description: 'Third party tools have been configured successfully.',
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
        <Loader2 className="h-4 w-4 animate-spin" /> Loading external adapters…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Third-Party Connections"
        description="Verify overall health and webhook adapters for linked services."
        icon={<Plug className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Stripe Payments</h5>
              <p className="text-[11px] text-stone-400 mt-0.5">Checkout sessions, reservation deposits, and payouts.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
              Connected
            </span>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Twilio Gateway</h5>
              <p className="text-[11px] text-stone-400 mt-0.5">Automated SMS schedules, followups, and quiet hours.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
              Connected
            </span>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Machine Learning & Copilot Settings"
        description="Establish data protection filters and usage cost limits for OpenAI matches."
        icon={<Sparkles className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField
            label="Enable AI Stylist matching"
            description="Power stylist assignment suggestions using machine learning parameters."
            className="sm:col-span-2"
          >
            <div className="flex items-center justify-between h-9 px-1">
              <span className="text-xs text-stone-500 font-medium font-serif italic">Matched stylists automatically</span>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                className="data-[state=checked]:bg-rose-500"
              />
            </div>
          </SettingsField>

          <SettingsField label="AI Provider Endpoint">
            <select
              value={settings.provider}
              onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
              className={inputCls}
            >
              <option value="openai">OpenAI (GPT Models)</option>
              <option value="anthropic">Anthropic (Claude Models)</option>
              <option value="gemini">Google (Gemini Models)</option>
            </select>
          </SettingsField>

          <SettingsField label="AI Model Name">
            <input
              type="text"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField
            label="Temperature Controls"
            description="Controls creativity vs deterministic responses (0.0 - 1.0)."
          >
            <input
              type="number"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) || 0 })}
              className={inputCls}
              min="0"
              max="1"
              step="0.1"
            />
          </SettingsField>

          <SettingsField
            label="Monthly AI Cost Limit ($)"
            description="Budget boundary before AI suggestions get auto-disabled."
          >
            <input
              type="number"
              value={(settings.costLimitCents / 100).toFixed(0)}
              onChange={(e) => setSettings({ ...settings, costLimitCents: Math.round(parseFloat(e.target.value) * 100) || 0 })}
              className={inputCls}
              min="0"
            />
          </SettingsField>

          <div className="sm:col-span-2 rounded-xl bg-amber-50/50 border border-amber-200/60 p-4 flex items-start gap-3 mt-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h6 className="text-xs font-semibold text-amber-800">Security Safeguard</h6>
              <p className="text-[11px] text-amber-700/80 mt-1 leading-relaxed">
                AI settings will never allow machine learning endpoints to bypass deterministic business policies,
                financial constraints, invoice approvals, or user roles.
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
