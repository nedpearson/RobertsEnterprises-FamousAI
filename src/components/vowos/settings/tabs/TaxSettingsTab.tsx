import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Calculator, Settings2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { resolveEffectiveSetting, saveScopedSetting } from '@/lib/settings';
import { getActiveDataPlane } from '@/lib/supabase';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';

interface TaxJurisdiction {
  id: string;
  name: string;
  ratePercentage: number;
  active: boolean;
}

interface TaxSettings {
  taxInclusivePricing: boolean;
  defaultTaxRatePercentage: number;
  jurisdictions: TaxJurisdiction[];
  taxCalculationEngine: 'internal' | 'avalara' | 'taxjar';
}

const DEFAULT_TAX_SETTINGS: TaxSettings = {
  taxInclusivePricing: false,
  defaultTaxRatePercentage: 8.5,
  jurisdictions: [
    { id: '1', name: 'State Sales Tax', ratePercentage: 6.0, active: true },
    { id: '2', name: 'City/Local Tax', ratePercentage: 2.5, active: true },
  ],
  taxCalculationEngine: 'internal',
};

interface TaxSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function TaxSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: TaxSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [settings, setSettings] = useState<TaxSettings>(DEFAULT_TAX_SETTINGS);
  const [dbSettings, setDbSettings] = useState<TaxSettings>(DEFAULT_TAX_SETTINGS);
  
  const [newJurName, setNewJurName] = useState('');
  const [newJurRate, setNewJurRate] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    const dataPlane = getActiveDataPlane();
    const result = await resolveEffectiveSetting<TaxSettings>(
      'tax_settings',
      'tax_settings',
      { dataPlane },
      DEFAULT_TAX_SETTINGS
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
      await saveScopedSetting('tax_settings', 'tax_settings', settings, { dataPlane }, reason);
      
      setSaving(false);
      toast({
        title: 'Tax settings saved',
        description: 'Tax configurations have been successfully updated.',
      });
      setDbSettings(settings);
      return true;
    } catch (err: any) {
      setSaving(false);
      toast({
        title: 'Could not save tax settings',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    registerSaveRef(handleSave);
  }, [settings, registerSaveRef]);

  const addJurisdiction = () => {
    if (!newJurName.trim() || !newJurRate) return;
    const rate = parseFloat(newJurRate);
    if (isNaN(rate)) {
      toast({ title: 'Invalid rate', variant: 'destructive' });
      return;
    }

    setSettings({
      ...settings,
      jurisdictions: [
        ...settings.jurisdictions,
        { id: Math.random().toString(), name: newJurName.trim(), ratePercentage: rate, active: true },
      ],
    });
    setNewJurName('');
    setNewJurRate('');
  };

  const removeJurisdiction = (id: string) => {
    setSettings({
      ...settings,
      jurisdictions: settings.jurisdictions.filter(j => j.id !== id),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading tax settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Global Tax Configuration"
        description="Set your primary tax engine and pricing display preferences."
        icon={<Settings2 className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField
            label="Tax Engine"
            description="Select the engine used to calculate taxes on invoices."
          >
            <select
              value={settings.taxCalculationEngine}
              onChange={(e) => setSettings({ ...settings, taxCalculationEngine: e.target.value as any })}
              className={inputCls}
            >
              <option value="internal">Internal (Manual Rates)</option>
              <option value="avalara">Avalara AvaTax</option>
              <option value="taxjar">Stripe Tax (TaxJar)</option>
            </select>
          </SettingsField>

          <SettingsField
            label="Default Tax Rate (%)"
            description="The fallback rate applied if specific jurisdictions are not matched."
          >
            <input
              type="number"
              step="0.01"
              value={settings.defaultTaxRatePercentage}
              onChange={(e) => setSettings({ ...settings, defaultTaxRatePercentage: parseFloat(e.target.value) || 0 })}
              className={inputCls}
              disabled={settings.taxCalculationEngine !== 'internal'}
            />
          </SettingsField>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-stone-200 p-4">
          <div>
            <h4 className="text-sm font-semibold text-stone-900">Tax-Inclusive Pricing</h4>
            <p className="text-sm text-stone-500">Show catalog prices with taxes already included (common in VAT regions).</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, taxInclusivePricing: !settings.taxInclusivePricing })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
              settings.taxInclusivePricing ? 'bg-rose-500' : 'bg-stone-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.taxInclusivePricing ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </SettingsCard>

      {settings.taxCalculationEngine === 'internal' && (
        <SettingsCard
          title="Manual Tax Jurisdictions"
          description="Define the specific tax lines that make up your total tax rate."
          icon={<Calculator className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="e.g. County Sales Tax"
                value={newJurName}
                onChange={(e) => setNewJurName(e.target.value)}
                className={`${inputCls} flex-1`}
              />
              <input
                type="number"
                placeholder="Rate (%)"
                value={newJurRate}
                onChange={(e) => setNewJurRate(e.target.value)}
                className={`${inputCls} w-28 text-right`}
                step="0.01"
              />
              <button
                onClick={addJurisdiction}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            <div className="divide-y divide-stone-100 rounded-xl border border-stone-200/80 bg-white">
              {settings.jurisdictions.map((jur) => (
                <div key={jur.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-stone-800">{jur.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-stone-400">Rate</span>
                      <input
                        type="number"
                        value={jur.ratePercentage}
                        onChange={(e) => {
                          const rate = parseFloat(e.target.value) || 0;
                          setSettings({
                            ...settings,
                            jurisdictions: settings.jurisdictions.map(j => j.id === jur.id ? { ...j, ratePercentage: rate } : j),
                          });
                        }}
                        className={`${inputCls} w-24 text-right py-1 text-xs`}
                        step="0.01"
                      />
                      <span className="text-xs text-stone-400">%</span>
                    </div>

                    <button
                      onClick={() => removeJurisdiction(jur.id)}
                      className="text-stone-400 hover:text-red-500 p-1 pl-2 border-l border-stone-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {settings.jurisdictions.length === 0 && (
                <div className="p-4 text-center text-sm text-stone-500">
                  No tax jurisdictions configured. Only the default rate will apply.
                </div>
              )}
            </div>
          </div>
        </SettingsCard>
      )}
    </div>
  );
}
