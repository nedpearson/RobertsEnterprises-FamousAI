import { useEffect, useState } from 'react';
import { Loader2, Star, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { resolveEffectiveSetting, saveScopedSetting } from '@/lib/settings';
import { getActiveDataPlane } from '@/lib/supabase';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';

interface ReputationSettings {
  autoRequestReviews: boolean;
  minInternalRatingForRequest: number; // e.g. 4 or 5
  delayHoursAfterPickup: number;
  googleReviewLink: string;
  yelpReviewLink: string;
  theKnotReviewLink: string;
  weddingWireReviewLink: string;
  smsTemplate: string;
}

const DEFAULT_REPUTATION_SETTINGS: ReputationSettings = {
  autoRequestReviews: true,
  minInternalRatingForRequest: 5,
  delayHoursAfterPickup: 24,
  googleReviewLink: '',
  yelpReviewLink: '',
  theKnotReviewLink: '',
  weddingWireReviewLink: '',
  smsTemplate: 'Hi {{first_name}}, thank you for choosing {{boutique_name}} for your special day! If you loved your experience, we would be incredibly grateful if you left us a review: {{review_link}}',
};

interface ReputationSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function ReputationSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: ReputationSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [settings, setSettings] = useState<ReputationSettings>(DEFAULT_REPUTATION_SETTINGS);
  const [dbSettings, setDbSettings] = useState<ReputationSettings>(DEFAULT_REPUTATION_SETTINGS);

  const loadSettings = async () => {
    setLoading(true);
    const dataPlane = getActiveDataPlane();
    const result = await resolveEffectiveSetting<ReputationSettings>(
      'reputation_settings',
      'reputation_settings',
      { dataPlane },
      DEFAULT_REPUTATION_SETTINGS
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
      await saveScopedSetting('reputation_settings', 'reputation_settings', settings, { dataPlane }, reason);
      
      setSaving(false);
      toast({
        title: 'Reputation settings saved',
        description: 'Your automated review requests and links have been updated.',
      });
      setDbSettings(settings);
      return true;
    } catch (err: any) {
      setSaving(false);
      toast({
        title: 'Could not save reputation settings',
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
        <Loader2 className="h-4 w-4 animate-spin" /> Loading reputation settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Review Platforms"
        description="Connect your business profiles to direct brides to the right places."
        icon={<LinkIcon className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Google My Business Review Link">
            <input
              type="url"
              placeholder="https://g.page/r/.../review"
              value={settings.googleReviewLink}
              onChange={(e) => setSettings({ ...settings, googleReviewLink: e.target.value })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField label="Yelp Business Page">
            <input
              type="url"
              placeholder="https://yelp.com/biz/..."
              value={settings.yelpReviewLink}
              onChange={(e) => setSettings({ ...settings, yelpReviewLink: e.target.value })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField label="The Knot Storefront URL">
            <input
              type="url"
              placeholder="https://theknot.com/marketplace/..."
              value={settings.theKnotReviewLink}
              onChange={(e) => setSettings({ ...settings, theKnotReviewLink: e.target.value })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField label="WeddingWire Storefront URL">
            <input
              type="url"
              placeholder="https://weddingwire.com/biz/..."
              value={settings.weddingWireReviewLink}
              onChange={(e) => setSettings({ ...settings, weddingWireReviewLink: e.target.value })}
              className={inputCls}
            />
          </SettingsField>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Automated Requests"
        description="Configure rules for automatically asking for a review after successful gown pickups."
        icon={<Star className="h-5 w-5" />}
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-stone-200 p-4">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">Enable Automated Review Requests</h4>
              <p className="text-sm text-stone-500">Automatically send an SMS requesting a review after a gown is marked 'Picked Up'.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoRequestReviews: !settings.autoRequestReviews })}
              className={`mt-3 sm:mt-0 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                settings.autoRequestReviews ? 'bg-rose-500' : 'bg-stone-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.autoRequestReviews ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {settings.autoRequestReviews && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingsField
                  label="Minimum Internal Rating Trigger"
                  description="Only request a review if the staff marked the experience as at least this many stars."
                >
                  <select
                    value={settings.minInternalRatingForRequest}
                    onChange={(e) => setSettings({ ...settings, minInternalRatingForRequest: parseInt(e.target.value) })}
                    className={inputCls}
                  >
                    <option value={5}>5 Stars Only (Recommended)</option>
                    <option value={4}>4 Stars or higher</option>
                    <option value={3}>3 Stars or higher</option>
                    <option value={1}>Send to all pickups</option>
                  </select>
                </SettingsField>

                <SettingsField
                  label="Delay After Pickup (Hours)"
                  description="Wait this many hours after the pickup time before sending the text."
                >
                  <input
                    type="number"
                    min="1"
                    value={settings.delayHoursAfterPickup}
                    onChange={(e) => setSettings({ ...settings, delayHoursAfterPickup: parseInt(e.target.value) || 24 })}
                    className={inputCls}
                  />
                </SettingsField>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-stone-900">
                  <MessageCircle className="h-4 w-4 text-stone-400" />
                  SMS Message Template
                </h4>
                <textarea
                  value={settings.smsTemplate}
                  onChange={(e) => setSettings({ ...settings, smsTemplate: e.target.value })}
                  className={`${inputCls} min-h-[100px] bg-white`}
                />
                <p className="mt-2 text-xs text-stone-500">
                  Available tags: <code className="bg-stone-200 px-1 py-0.5 rounded">{{first_name}}</code>, <code className="bg-stone-200 px-1 py-0.5 rounded">{{boutique_name}}</code>, <code className="bg-stone-200 px-1 py-0.5 rounded">{{review_link}}</code>
                </p>
              </div>
            </>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}
