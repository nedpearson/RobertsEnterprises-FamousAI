import { useEffect, useState } from 'react';
import { Loader2, LayoutDashboard, MonitorSmartphone, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { resolveEffectiveSetting, saveScopedSetting } from '@/lib/settings';
import { getActiveDataPlane } from '@/lib/supabase';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';

interface ClientPortalSettings {
  enableClientPortal: boolean;
  welcomeMessage: string;
  allowInvoicePayments: boolean;
  allowInspirationUploads: boolean;
  allowAppointmentRescheduling: boolean;
  headerImageUrl: string;
}

const DEFAULT_PORTAL_SETTINGS: ClientPortalSettings = {
  enableClientPortal: true,
  welcomeMessage: 'Welcome to your personalized bridal portal! Here you can view your upcoming appointments, track your gown status, and share your wedding inspiration with our stylists.',
  allowInvoicePayments: true,
  allowInspirationUploads: true,
  allowAppointmentRescheduling: false,
  headerImageUrl: '',
};

interface ClientPortalSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function ClientPortalSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: ClientPortalSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [settings, setSettings] = useState<ClientPortalSettings>(DEFAULT_PORTAL_SETTINGS);
  const [dbSettings, setDbSettings] = useState<ClientPortalSettings>(DEFAULT_PORTAL_SETTINGS);

  const loadSettings = async () => {
    setLoading(true);
    const dataPlane = getActiveDataPlane();
    const result = await resolveEffectiveSetting<ClientPortalSettings>(
      'client_portal_settings',
      'client_portal_settings',
      { dataPlane },
      DEFAULT_PORTAL_SETTINGS
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
      await saveScopedSetting('client_portal_settings', 'client_portal_settings', settings, { dataPlane }, reason);
      
      setSaving(false);
      toast({
        title: 'Portal settings saved',
        description: 'Your client portal configuration has been updated.',
      });
      setDbSettings(settings);
      return true;
    } catch (err: any) {
      setSaving(false);
      toast({
        title: 'Could not save portal settings',
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
        <Loader2 className="h-4 w-4 animate-spin" /> Loading portal settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Client Portal Configuration"
        description="Provide brides with a branded, self-serve dashboard to track their journey."
        icon={<MonitorSmartphone className="h-5 w-5" />}
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-stone-200 p-4 bg-stone-50">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">Enable Client Portal</h4>
              <p className="text-sm text-stone-500">Allow brides to log into a secure area using their email address.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enableClientPortal: !settings.enableClientPortal })}
              className={`mt-3 sm:mt-0 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                settings.enableClientPortal ? 'bg-rose-500' : 'bg-stone-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.enableClientPortal ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <SettingsField label="Welcome Dashboard Message">
            <textarea
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              className={`${inputCls} min-h-[100px] font-medium text-stone-700`}
              disabled={!settings.enableClientPortal}
            />
          </SettingsField>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Portal Banner Image</h4>
            <div className="flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 transition-colors hover:border-stone-400 overflow-hidden relative">
              {settings.headerImageUrl ? (
                <>
                  <img src={settings.headerImageUrl} alt="Portal Header" className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-semibold shadow-sm">
                      Banner Image Active
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="mb-2 h-6 w-6 text-stone-400" />
                  <span className="text-xs text-stone-500">Upload a beautiful header image (e.g. your storefront)</span>
                </>
              )}
            </div>
            <input
              type="url"
              placeholder="Or paste image URL"
              value={settings.headerImageUrl}
              onChange={(e) => setSettings({ ...settings, headerImageUrl: e.target.value })}
              className={inputCls}
              disabled={!settings.enableClientPortal}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Feature Toggles"
        description="Control what information and actions are available to the bride when she logs in."
        icon={<LayoutDashboard className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <div>
              <h5 className="font-semibold text-stone-900 text-sm">Invoice Payments</h5>
              <p className="text-xs text-stone-500 mt-1">Allow brides to view and pay outstanding balances securely online.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, allowInvoicePayments: !settings.allowInvoicePayments })}
              disabled={!settings.enableClientPortal}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                settings.allowInvoicePayments ? 'bg-rose-500' : 'bg-stone-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.allowInvoicePayments ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <div>
              <h5 className="font-semibold text-stone-900 text-sm">Inspiration Uploads</h5>
              <p className="text-xs text-stone-500 mt-1">Allow brides to upload moodboards, Pinterest screenshots, or venue photos.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, allowInspirationUploads: !settings.allowInspirationUploads })}
              disabled={!settings.enableClientPortal}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                settings.allowInspirationUploads ? 'bg-rose-500' : 'bg-stone-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.allowInspirationUploads ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h5 className="font-semibold text-stone-900 text-sm">Self-Service Rescheduling</h5>
              <p className="text-xs text-stone-500 mt-1">Allow brides to cancel and reschedule appointments within the portal.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, allowAppointmentRescheduling: !settings.allowAppointmentRescheduling })}
              disabled={!settings.enableClientPortal}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                settings.allowAppointmentRescheduling ? 'bg-rose-500' : 'bg-stone-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.allowAppointmentRescheduling ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
