import { useEffect, useState } from 'react';
import { Zap, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';
import { Switch } from '@/components/ui/switch';
import { fetchJsonSetting, saveJsonSetting, DEFAULT_AUTOMATIONS, AutomationRule } from '@/lib/settings';

interface AutomationsSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function AutomationsSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: AutomationsSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<AutomationRule[]>(DEFAULT_AUTOMATIONS);
  const [dbRules, setDbRules] = useState<AutomationRule[]>(DEFAULT_AUTOMATIONS);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState('7_days_before_appointment');

  const loadSettings = async () => {
    setLoading(true);
    const data = await fetchJsonSetting<AutomationRule[]>('automation_rules', DEFAULT_AUTOMATIONS);
    setRules(data);
    setDbRules(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, [resetTrigger]);

  const isDirty = JSON.stringify(rules) !== JSON.stringify(dbRules);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty]);

  const handleSave = async (reason?: string): Promise<boolean> => {
    const err = await saveJsonSetting('automation_rules', rules);
    if (reason && !err) {
      await saveJsonSetting('audit_last_change_reason', {
        tab: 'automations',
        reason,
        timestamp: new Date().toISOString(),
      });
    }

    if (err) {
      toast({
        title: 'Could not save automation rules',
        description: err,
        variant: 'destructive',
      });
      return false;
    } else {
      toast({
        title: 'Automation rules saved',
        description: 'Auto messaging guidelines have been updated.',
      });
      setDbRules(rules);
      return true;
    }
  };

  useEffect(() => {
    registerSaveRef(handleSave);
  }, [rules]);

  const addRule = () => {
    if (!newRuleName.trim()) return;
    setRules([
      ...rules,
      {
        id: Date.now().toString(),
        name: newRuleName.trim(),
        trigger: newRuleTrigger,
        delayHours: 0,
        templateId: '1',
        active: true,
      },
    ]);
    setNewRuleName('');
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, fields: Partial<AutomationRule>) => {
    setRules(rules.map((r) =>
      r.id === id ? { ...r, ...fields } : r
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading automation rules…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Durable Automation Rules"
        description="Establish trigger hooks for auto-sending text reminders or email checklists to customers."
        icon={<Zap className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Follow-up 3 days after appointment"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              className={`${inputCls} flex-1`}
            />
            <select
              value={newRuleTrigger}
              onChange={(e) => setNewRuleTrigger(e.target.value)}
              className={`${inputCls} w-52`}
            >
              <option value="7_days_before_appointment">7 Days Before</option>
              <option value="3_days_after_dnb">3 Days After DNB</option>
              <option value="fitting_scheduled">Fitting Scheduled</option>
              <option value="pickup_ready">Pickup Marked Ready</option>
            </select>
            <button
              onClick={addRule}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Rule
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-xl border border-stone-200 bg-white p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <input
                      type="text"
                      value={rule.name}
                      onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                      className="text-sm font-semibold text-stone-800 border-b border-transparent hover:border-stone-300 focus:border-stone-900 bg-transparent px-1 -mx-1 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.active}
                      onCheckedChange={(checked) => updateRule(rule.id, { active: checked })}
                      className="scale-90 data-[state=checked]:bg-rose-500"
                    />
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="text-stone-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-stone-100">
                  <SettingsField label="Delay (hours after trigger)">
                    <input
                      type="number"
                      value={rule.delayHours}
                      onChange={(e) => updateRule(rule.id, { delayHours: parseInt(e.target.value) || 0 })}
                      className={inputCls}
                      min="0"
                    />
                  </SettingsField>

                  <SettingsField label="Trigger Event Mode">
                    <select
                      value={rule.trigger}
                      onChange={(e) => updateRule(rule.id, { trigger: e.target.value })}
                      className={inputCls}
                    >
                      <option value="7_days_before_appointment">7 Days Before Appt</option>
                      <option value="3_days_after_dnb">3 Days After Did Not Buy</option>
                      <option value="fitting_scheduled">Fitting Booked</option>
                      <option value="pickup_ready">Pickup Marked Ready</option>
                    </select>
                  </SettingsField>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
