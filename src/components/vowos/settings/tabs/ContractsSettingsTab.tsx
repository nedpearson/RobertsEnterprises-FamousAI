import { useEffect, useState } from 'react';
import { Loader2, FileSignature, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { resolveEffectiveSetting, saveScopedSetting } from '@/lib/settings';
import { getActiveDataPlane } from '@/lib/supabase';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';

interface ContractClause {
  id: string;
  title: string;
  content: string;
  isRequired: boolean;
}

interface ContractsSettings {
  requireSignatureBeforeOrder: boolean;
  requireSignatureBeforePickup: boolean;
  enablePregnancyClause: boolean;
  standardTerms: string;
  customClauses: ContractClause[];
}

const DEFAULT_CONTRACT_SETTINGS: ContractsSettings = {
  requireSignatureBeforeOrder: true,
  requireSignatureBeforePickup: true,
  enablePregnancyClause: false,
  standardTerms: 'All sales are final. No refunds, exchanges, or store credit will be issued under any circumstances once a deposit is paid. Alterations are a separate service and are not included in the price of the gown.',
  customClauses: [
    {
      id: 'sizing',
      title: 'Sizing Liability Waiver',
      content: 'I acknowledge that I am ordering a size smaller than my stylist recommended. I understand that the boutique is not responsible if the gown does not fit upon arrival.',
      isRequired: false,
    }
  ],
};

interface ContractsSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function ContractsSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: ContractsSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [settings, setSettings] = useState<ContractsSettings>(DEFAULT_CONTRACT_SETTINGS);
  const [dbSettings, setDbSettings] = useState<ContractsSettings>(DEFAULT_CONTRACT_SETTINGS);

  const loadSettings = async () => {
    setLoading(true);
    const dataPlane = getActiveDataPlane();
    const result = await resolveEffectiveSetting<ContractsSettings>(
      'contracts_settings',
      'contracts_settings',
      { dataPlane },
      DEFAULT_CONTRACT_SETTINGS
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
      await saveScopedSetting('contracts_settings', 'contracts_settings', settings, { dataPlane }, reason);
      
      setSaving(false);
      toast({
        title: 'Contract settings saved',
        description: 'Your legal terms and signature requirements have been updated.',
      });
      setDbSettings(settings);
      return true;
    } catch (err: any) {
      setSaving(false);
      toast({
        title: 'Could not save contract settings',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    registerSaveRef(handleSave);
  }, [settings, registerSaveRef]);

  const addClause = () => {
    const newId = 'clause_' + Math.random().toString(36).substr(2, 9);
    setSettings({
      ...settings,
      customClauses: [
        ...settings.customClauses,
        { id: newId, title: 'New Custom Clause', content: '', isRequired: false }
      ]
    });
  };

  const updateClause = (id: string, updates: Partial<ContractClause>) => {
    setSettings({
      ...settings,
      customClauses: settings.customClauses.map(c => c.id === id ? { ...c, ...updates } : c)
    });
  };

  const removeClause = (id: string) => {
    setSettings({
      ...settings,
      customClauses: settings.customClauses.filter(c => c.id !== id)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading contract settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="E-Signature Requirements"
        description="Enforce legally binding digital signatures before allowing critical pipeline actions."
        icon={<FileSignature className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-stone-200 p-4">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">Require Signature for Ordering</h4>
              <p className="text-sm text-stone-500">Prevent moving an order to 'Placed with Designer' unless the bridal contract is e-signed.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, requireSignatureBeforeOrder: !settings.requireSignatureBeforeOrder })}
              className={`mt-3 sm:mt-0 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                settings.requireSignatureBeforeOrder ? 'bg-rose-500' : 'bg-stone-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.requireSignatureBeforeOrder ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-stone-200 p-4">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">Require Signature for Final Pickup</h4>
              <p className="text-sm text-stone-500">Require a 'Merchandise Acceptance' signature before marking a gown as Picked Up.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, requireSignatureBeforePickup: !settings.requireSignatureBeforePickup })}
              className={`mt-3 sm:mt-0 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                settings.requireSignatureBeforePickup ? 'bg-rose-500' : 'bg-stone-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.requireSignatureBeforePickup ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Standard Terms & Conditions"
        description="This text will appear on all invoices, receipts, and standard contracts."
      >
        <textarea
          value={settings.standardTerms}
          onChange={(e) => setSettings({ ...settings, standardTerms: e.target.value })}
          className={`${inputCls} min-h-[150px] font-medium leading-relaxed`}
          placeholder="Enter your boutique's standard legal language regarding refunds, exchanges, and alterations..."
        />
      </SettingsCard>

      <SettingsCard
        title="Custom Liability Waivers"
        description="Create specific clauses that staff can optionally append to a contract when special circumstances arise."
        icon={<AlertCircle className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Available Clauses</h4>
            <button
              onClick={addClause}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add Clause
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-stone-50 p-3 border border-stone-200">
            <div>
              <h5 className="font-semibold text-stone-900 text-sm">Pregnancy / Anticipated Weight Fluctuation Clause</h5>
              <p className="text-xs text-stone-500 mt-1">Pre-built system clause protecting the boutique if sizing changes drastically.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enablePregnancyClause: !settings.enablePregnancyClause })}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.enablePregnancyClause ? 'bg-rose-500' : 'bg-stone-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.enablePregnancyClause ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="space-y-3">
            {settings.customClauses.map((clause) => (
              <div key={clause.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm relative">
                <button
                  onClick={() => removeClause(clause.id)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="space-y-4 pr-8">
                  <SettingsField label="Clause Title">
                    <input
                      type="text"
                      value={clause.title}
                      onChange={(e) => updateClause(clause.id, { title: e.target.value })}
                      className={inputCls}
                    />
                  </SettingsField>
                  <SettingsField label="Legal Text">
                    <textarea
                      value={clause.content}
                      onChange={(e) => updateClause(clause.id, { content: e.target.value })}
                      className={`${inputCls} min-h-[80px] text-sm`}
                    />
                  </SettingsField>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`req_${clause.id}`}
                      checked={clause.isRequired}
                      onChange={(e) => updateClause(clause.id, { isRequired: e.target.checked })}
                      className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor={`req_${clause.id}`} className="text-sm font-medium text-stone-700">
                      Force this clause to be required on EVERY new contract (Global Clause)
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
