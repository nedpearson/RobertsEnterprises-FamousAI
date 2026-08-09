import { useEffect, useState } from 'react';
import { Loader2, Gift, Users, HandHeart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { resolveEffectiveSetting, saveScopedSetting } from '@/lib/settings';
import { getActiveDataPlane } from '@/lib/supabase';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';

interface LoyaltySettings {
  enableReferralProgram: boolean;
  referralRewardType: 'fixed_discount' | 'percentage_discount' | 'store_credit' | 'free_accessory';
  referralRewardValue: number;
  enableBridalPartyPerks: boolean;
  bridalPartyDiscountPercent: number;
  bridalPartyMinGownValue: number;
}

const DEFAULT_LOYALTY_SETTINGS: LoyaltySettings = {
  enableReferralProgram: true,
  referralRewardType: 'store_credit',
  referralRewardValue: 100,
  enableBridalPartyPerks: true,
  bridalPartyDiscountPercent: 15,
  bridalPartyMinGownValue: 1500,
};

interface LoyaltySettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function LoyaltySettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: LoyaltySettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [settings, setSettings] = useState<LoyaltySettings>(DEFAULT_LOYALTY_SETTINGS);
  const [dbSettings, setDbSettings] = useState<LoyaltySettings>(DEFAULT_LOYALTY_SETTINGS);

  const loadSettings = async () => {
    setLoading(true);
    const dataPlane = getActiveDataPlane();
    const result = await resolveEffectiveSetting<LoyaltySettings>(
      'loyalty_settings',
      'loyalty_settings',
      { dataPlane },
      DEFAULT_LOYALTY_SETTINGS
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
      await saveScopedSetting('loyalty_settings', 'loyalty_settings', settings, { dataPlane }, reason);
      
      setSaving(false);
      toast({
        title: 'Loyalty settings saved',
        description: 'Your referral and bridal party perks have been updated.',
      });
      setDbSettings(settings);
      return true;
    } catch (err: any) {
      setSaving(false);
      toast({
        title: 'Could not save loyalty settings',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    registerSaveRef(handleSave);
  }, [settings, registerSaveRef]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading loyalty settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Bride Referral Program"
        description="Reward your past brides for sending new brides to your boutique."
        icon={<HandHeart className="h-5 w-5" />}
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-stone-200 p-4">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">Enable Referral Program</h4>
              <p className="text-sm text-stone-500">Automatically generate a unique referral link for every bride who purchases a gown.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enableReferralProgram: !settings.enableReferralProgram })}
              className={`mt-3 sm:mt-0 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                settings.enableReferralProgram ? 'bg-rose-500' : 'bg-stone-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.enableReferralProgram ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {settings.enableReferralProgram && (
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField label="Reward Type">
                <select
                  value={settings.referralRewardType}
                  onChange={(e) => setSettings({ ...settings, referralRewardType: e.target.value as any })}
                  className={inputCls}
                >
                  <option value="store_credit">Store Credit (Gift Card)</option>
                  <option value="fixed_discount">Fixed Dollar Discount</option>
                  <option value="percentage_discount">Percentage Discount</option>
                  <option value="free_accessory">Free Accessory Coupon</option>
                </select>
              </SettingsField>

              {settings.referralRewardType !== 'free_accessory' && (
                <SettingsField label={settings.referralRewardType === 'percentage_discount' ? 'Discount %' : 'Reward Value ($)'}>
                  <input
                    type="number"
                    min="1"
                    value={settings.referralRewardValue}
                    onChange={(e) => setSettings({ ...settings, referralRewardValue: parseFloat(e.target.value) || 0 })}
                    className={inputCls}
                  />
                </SettingsField>
              )}
            </div>
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Bridal Party Perks"
        description="Offer automatic discounts to bridesmaids and mothers of the bride when the bride buys her gown here."
        icon={<Users className="h-5 w-5" />}
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-stone-200 p-4">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">Enable Bridal Party Discounts</h4>
              <p className="text-sm text-stone-500">Automatically link the bridal party to the bride's order to apply group discounts.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enableBridalPartyPerks: !settings.enableBridalPartyPerks })}
              className={`mt-3 sm:mt-0 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                settings.enableBridalPartyPerks ? 'bg-rose-500' : 'bg-stone-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.enableBridalPartyPerks ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {settings.enableBridalPartyPerks && (
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField
                label="Bridal Party Discount (%)"
                description="Percentage off bridesmaid and mothers' dresses."
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.bridalPartyDiscountPercent}
                  onChange={(e) => setSettings({ ...settings, bridalPartyDiscountPercent: parseInt(e.target.value) || 0 })}
                  className={inputCls}
                />
              </SettingsField>

              <SettingsField
                label="Minimum Gown Value ($)"
                description="The bride's gown must cost at least this much to unlock the bridal party discount."
              >
                <input
                  type="number"
                  min="0"
                  value={settings.bridalPartyMinGownValue}
                  onChange={(e) => setSettings({ ...settings, bridalPartyMinGownValue: parseInt(e.target.value) || 0 })}
                  className={inputCls}
                />
              </SettingsField>
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}
