import { useEffect, useState } from 'react';
import { Loader2, GitMerge, GripVertical, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { resolveEffectiveSetting, saveScopedSetting } from '@/lib/settings';
import { getActiveDataPlane } from '@/lib/supabase';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
  staleDaysAlert: number;
}

interface PipelineSettings {
  stages: PipelineStage[];
  requireContractBeforeMeasurements: boolean;
  requirePaymentBeforeOrdering: boolean;
}

const DEFAULT_PIPELINE_SETTINGS: PipelineSettings = {
  stages: [
    { id: 'lead', name: 'New Lead', color: '#64748b', isSystem: true, staleDaysAlert: 3 },
    { id: 'consultation', name: 'Initial Consultation', color: '#0ea5e9', isSystem: false, staleDaysAlert: 7 },
    { id: 'said_yes', name: 'Said Yes To The Dress!', color: '#e11d48', isSystem: false, staleDaysAlert: 2 },
    { id: 'measurements', name: 'Awaiting Measurements', color: '#f59e0b', isSystem: false, staleDaysAlert: 14 },
    { id: 'ordered', name: 'Ordered from Designer', color: '#8b5cf6', isSystem: false, staleDaysAlert: 0 },
    { id: 'arrived', name: 'Gown Arrived / QA', color: '#10b981', isSystem: false, staleDaysAlert: 3 },
    { id: 'fittings', name: 'Alterations / Fittings', color: '#ec4899', isSystem: false, staleDaysAlert: 0 },
    { id: 'picked_up', name: 'Picked Up', color: '#22c55e', isSystem: true, staleDaysAlert: 0 },
  ],
  requireContractBeforeMeasurements: true,
  requirePaymentBeforeOrdering: true,
};

interface PipelineSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function PipelineSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: PipelineSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [settings, setSettings] = useState<PipelineSettings>(DEFAULT_PIPELINE_SETTINGS);
  const [dbSettings, setDbSettings] = useState<PipelineSettings>(DEFAULT_PIPELINE_SETTINGS);

  const loadSettings = async () => {
    setLoading(true);
    const dataPlane = getActiveDataPlane();
    const result = await resolveEffectiveSetting<PipelineSettings>(
      'pipeline_settings',
      'pipeline_settings',
      { dataPlane },
      DEFAULT_PIPELINE_SETTINGS
    );
    setSettings(result.value);
    setDbSettings(result.value);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, [resetTrigger]);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(dbSettings);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = async (reason?: string): Promise<boolean> => {
    setSaving(true);
    try {
      const dataPlane = getActiveDataPlane();
      await saveScopedSetting('pipeline_settings', 'pipeline_settings', settings, { dataPlane }, reason);
      
      setSaving(false);
      toast({
        title: 'Pipeline settings saved',
        description: 'Your sales workflow has been updated.',
      });
      setDbSettings(settings);
      return true;
    } catch (err: any) {
      setSaving(false);
      toast({
        title: 'Could not save pipeline settings',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    registerSaveRef(handleSave);
  }, [settings, registerSaveRef]);

  const updateStage = (id: string, updates: Partial<PipelineStage>) => {
    setSettings({
      ...settings,
      stages: settings.stages.map(s => s.id === id ? { ...s, ...updates } : s),
    });
  };

  const removeStage = (id: string) => {
    setSettings({
      ...settings,
      stages: settings.stages.filter(s => s.id !== id || s.isSystem),
    });
  };

  const addStage = () => {
    const newId = 'custom_' + Math.random().toString(36).substr(2, 9);
    // Insert before the final Picked Up stage if it exists
    const pickedUpIdx = settings.stages.findIndex(s => s.id === 'picked_up');
    const newStages = [...settings.stages];
    const newStage: PipelineStage = {
      id: newId,
      name: 'New Custom Stage',
      color: '#cbd5e1',
      isSystem: false,
      staleDaysAlert: 0
    };
    
    if (pickedUpIdx >= 0) {
      newStages.splice(pickedUpIdx, 0, newStage);
    } else {
      newStages.push(newStage);
    }
    
    setSettings({ ...settings, stages: newStages });
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newStages = [...settings.stages];
      [newStages[index - 1], newStages[index]] = [newStages[index], newStages[index - 1]];
      setSettings({ ...settings, stages: newStages });
    } else if (direction === 'down' && index < settings.stages.length - 1) {
      const newStages = [...settings.stages];
      [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
      setSettings({ ...settings, stages: newStages });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading pipeline settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Custom Sales Pipeline"
        description="Define the exact workflow stages your brides go through from first contact to gown pickup."
        icon={<GitMerge className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Workflow Stages</h4>
            <button
              onClick={addStage}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add Stage
            </button>
          </div>

          <div className="space-y-2">
            {settings.stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-2 shadow-sm transition-all hover:border-stone-300">
                <div className="flex flex-col gap-1 text-stone-400">
                  <button onClick={() => moveStage(index, 'up')} disabled={index === 0} className="hover:text-stone-700 disabled:opacity-30">
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => moveStage(index, 'down')} disabled={index === settings.stages.length - 1} className="hover:text-stone-700 disabled:opacity-30">
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <input
                  type="color"
                  value={stage.color}
                  onChange={(e) => updateStage(stage.id, { color: e.target.value })}
                  className="h-8 w-8 rounded cursor-pointer shrink-0"
                />
                
                <input
                  type="text"
                  value={stage.name}
                  onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                  disabled={stage.isSystem}
                  className={`${inputCls} flex-1 font-semibold disabled:bg-stone-50 disabled:text-stone-500`}
                />
                
                <div className="w-32 shrink-0">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={stage.staleDaysAlert}
                      onChange={(e) => updateStage(stage.id, { staleDaysAlert: parseInt(e.target.value) || 0 })}
                      className={`${inputCls} pr-12 text-right`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs text-stone-400 font-medium">
                      days
                    </div>
                  </div>
                </div>

                <div className="w-8 flex justify-center shrink-0">
                  {!stage.isSystem && (
                    <button
                      onClick={() => removeStage(stage.id)}
                      className="text-stone-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-500 mt-2">
            * Set 'days' to 0 to disable stale alerts for that specific stage. System stages cannot be renamed or deleted.
          </p>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Workflow Guardrails"
        description="Enforce required actions before a bride can be moved to specific stages in the pipeline."
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-stone-200 p-4">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">Require Contract for Measurements</h4>
              <p className="text-sm text-stone-500">Prevent moving to 'Awaiting Measurements' if the Bridal Contract is not signed.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, requireContractBeforeMeasurements: !settings.requireContractBeforeMeasurements })}
              className={`mt-3 sm:mt-0 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                settings.requireContractBeforeMeasurements ? 'bg-rose-500' : 'bg-stone-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.requireContractBeforeMeasurements ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-stone-200 p-4">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">Require Payment for Ordering</h4>
              <p className="text-sm text-stone-500">Prevent moving to 'Ordered from Designer' if a 50% deposit hasn't been collected.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, requirePaymentBeforeOrdering: !settings.requirePaymentBeforeOrdering })}
              className={`mt-3 sm:mt-0 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                settings.requirePaymentBeforeOrdering ? 'bg-rose-500' : 'bg-stone-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.requirePaymentBeforeOrdering ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
