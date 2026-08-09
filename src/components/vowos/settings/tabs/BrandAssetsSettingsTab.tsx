import { useEffect, useState } from 'react';
import { Loader2, Palette, Upload, Instagram, Twitter, Facebook } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { resolveEffectiveSetting, saveScopedSetting } from '@/lib/settings';
import { getActiveDataPlane } from '@/lib/supabase';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';

interface BrandAssetsSettings {
  logoUrl: string;
  secondaryLogoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: 'inter' | 'serif' | 'mono';
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
    pinterest: string;
  };
}

const DEFAULT_BRAND_SETTINGS: BrandAssetsSettings = {
  logoUrl: '',
  secondaryLogoUrl: '',
  primaryColor: '#e11d48', // rose-600
  secondaryColor: '#1c1917', // stone-900
  fontFamily: 'serif',
  socialLinks: {
    instagram: '',
    facebook: '',
    tiktok: '',
    pinterest: '',
  },
};

interface BrandAssetsSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function BrandAssetsSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: BrandAssetsSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [settings, setSettings] = useState<BrandAssetsSettings>(DEFAULT_BRAND_SETTINGS);
  const [dbSettings, setDbSettings] = useState<BrandAssetsSettings>(DEFAULT_BRAND_SETTINGS);

  const loadSettings = async () => {
    setLoading(true);
    const dataPlane = getActiveDataPlane();
    const result = await resolveEffectiveSetting<BrandAssetsSettings>(
      'brand_assets_settings',
      'brand_assets_settings',
      { dataPlane },
      DEFAULT_BRAND_SETTINGS
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
      await saveScopedSetting('brand_assets_settings', 'brand_assets_settings', settings, { dataPlane }, reason);
      
      setSaving(false);
      toast({
        title: 'Brand assets saved',
        description: 'Your brand configuration has been successfully updated.',
      });
      setDbSettings(settings);
      return true;
    } catch (err: any) {
      setSaving(false);
      toast({
        title: 'Could not save brand assets',
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
        <Loader2 className="h-4 w-4 animate-spin" /> Loading brand assets…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Visual Identity"
        description="Configure your boutique's logos, primary colors, and fonts."
        icon={<Palette className="h-5 w-5" />}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-stone-900">Primary Logo</h4>
            <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 transition-colors hover:border-stone-400">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Primary Logo" className="max-h-24 object-contain" />
              ) : (
                <>
                  <Upload className="mb-2 h-6 w-6 text-stone-400" />
                  <span className="text-xs text-stone-500">Upload primary logo</span>
                </>
              )}
            </div>
            <input
              type="text"
              placeholder="Or paste image URL"
              value={settings.logoUrl}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              className={inputCls}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-stone-900">Secondary / Monogram</h4>
            <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 transition-colors hover:border-stone-400">
              {settings.secondaryLogoUrl ? (
                <img src={settings.secondaryLogoUrl} alt="Secondary Logo" className="max-h-24 object-contain" />
              ) : (
                <>
                  <Upload className="mb-2 h-6 w-6 text-stone-400" />
                  <span className="text-xs text-stone-500">Upload secondary logo</span>
                </>
              )}
            </div>
            <input
              type="text"
              placeholder="Or paste image URL"
              value={settings.secondaryLogoUrl}
              onChange={(e) => setSettings({ ...settings, secondaryLogoUrl: e.target.value })}
              className={inputCls}
            />
          </div>

          <SettingsField label="Primary Accent Color">
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="h-10 w-12 rounded border border-stone-300 p-1"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className={`${inputCls} flex-1`}
              />
            </div>
          </SettingsField>

          <SettingsField label="Secondary Color">
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="h-10 w-12 rounded border border-stone-300 p-1"
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className={`${inputCls} flex-1`}
              />
            </div>
          </SettingsField>

          <SettingsField label="Document Typography" className="sm:col-span-2">
            <select
              value={settings.fontFamily}
              onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value as any })}
              className={inputCls}
            >
              <option value="serif">Elegant Serif (Playfair Display, Merriweather)</option>
              <option value="inter">Modern Sans-Serif (Inter, Helvetica)</option>
              <option value="mono">Technical Monospace (Roboto Mono)</option>
            </select>
          </SettingsField>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Social Media Links"
        description="Links configured here will automatically appear in your email footers and booking portals."
        icon={<Instagram className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Instagram URL">
            <input
              type="url"
              placeholder="https://instagram.com/yourboutique"
              value={settings.socialLinks.instagram}
              onChange={(e) => setSettings({
                ...settings,
                socialLinks: { ...settings.socialLinks, instagram: e.target.value }
              })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField label="TikTok URL">
            <input
              type="url"
              placeholder="https://tiktok.com/@yourboutique"
              value={settings.socialLinks.tiktok}
              onChange={(e) => setSettings({
                ...settings,
                socialLinks: { ...settings.socialLinks, tiktok: e.target.value }
              })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField label="Pinterest URL">
            <input
              type="url"
              placeholder="https://pinterest.com/yourboutique"
              value={settings.socialLinks.pinterest}
              onChange={(e) => setSettings({
                ...settings,
                socialLinks: { ...settings.socialLinks, pinterest: e.target.value }
              })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField label="Facebook URL">
            <input
              type="url"
              placeholder="https://facebook.com/yourboutique"
              value={settings.socialLinks.facebook}
              onChange={(e) => setSettings({
                ...settings,
                socialLinks: { ...settings.socialLinks, facebook: e.target.value }
              })}
              className={inputCls}
            />
          </SettingsField>
        </div>
      </SettingsCard>
    </div>
  );
}
