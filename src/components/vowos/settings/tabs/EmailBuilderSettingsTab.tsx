import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Mail, LayoutTemplate, Send, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { resolveEffectiveSetting, saveScopedSetting } from '@/lib/settings';
import { getActiveDataPlane } from '@/lib/supabase';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  triggerEvent: string;
  active: boolean;
}

interface EmailBuilderSettings {
  defaultSenderEmail: string;
  defaultSenderName: string;
  templates: EmailTemplate[];
  brandColor: string;
  includeUnsubscribeLink: boolean;
}

const DEFAULT_EMAIL_SETTINGS: EmailBuilderSettings = {
  defaultSenderEmail: 'hello@robertsenterprises.com',
  defaultSenderName: 'Roberts Enterprises',
  brandColor: '#e11d48', // rose-600
  includeUnsubscribeLink: true,
  templates: [
    {
      id: '1',
      name: 'Welcome Series - Day 1',
      subject: 'Welcome to the family!',
      triggerEvent: 'lead_captured',
      bodyHtml: '<h1>Welcome, {{first_name}}!</h1><p>We are so excited to help you find your dream gown.</p>',
      active: true,
    },
    {
      id: '2',
      name: 'Appointment Reminder',
      subject: 'Reminder: Your Upcoming Bridal Consultation',
      triggerEvent: 'appointment_24h_reminder',
      bodyHtml: '<h1>See you soon, {{first_name}}!</h1><p>Your appointment is scheduled for {{appointment_date}} at {{appointment_time}}.</p>',
      active: true,
    }
  ],
};

interface EmailBuilderSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function EmailBuilderSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: EmailBuilderSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [settings, setSettings] = useState<EmailBuilderSettings>(DEFAULT_EMAIL_SETTINGS);
  const [dbSettings, setDbSettings] = useState<EmailBuilderSettings>(DEFAULT_EMAIL_SETTINGS);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    const dataPlane = getActiveDataPlane();
    const result = await resolveEffectiveSetting<EmailBuilderSettings>(
      'email_builder_settings',
      'email_builder_settings',
      { dataPlane },
      DEFAULT_EMAIL_SETTINGS
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
      await saveScopedSetting('email_builder_settings', 'email_builder_settings', settings, { dataPlane }, reason);
      
      setSaving(false);
      toast({
        title: 'Email settings saved',
        description: 'Email templates and global settings have been successfully updated.',
      });
      setDbSettings(settings);
      return true;
    } catch (err: any) {
      setSaving(false);
      toast({
        title: 'Could not save email settings',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    registerSaveRef(handleSave);
  }, [settings, registerSaveRef]);

  const addTemplate = () => {
    const newId = Math.random().toString();
    setSettings({
      ...settings,
      templates: [
        ...settings.templates,
        {
          id: newId,
          name: 'New Email Template',
          subject: 'Your Subject Here',
          triggerEvent: 'manual',
          bodyHtml: '<p>Write your email content here.</p>',
          active: false,
        },
      ],
    });
    setSelectedTemplateId(newId);
  };

  const removeTemplate = (id: string) => {
    setSettings({
      ...settings,
      templates: settings.templates.filter(t => t.id !== id),
    });
    if (selectedTemplateId === id) {
      setSelectedTemplateId(null);
    }
  };

  const updateTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    setSettings({
      ...settings,
      templates: settings.templates.map(t => t.id === id ? { ...t, ...updates } : t),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading email builder settings…
      </div>
    );
  }

  const selectedTemplate = settings.templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Global Email Configuration"
        description="Set your default sender profile and brand styling."
        icon={<Mail className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Default Sender Name" description="The name that appears in the recipient's inbox.">
            <input
              type="text"
              value={settings.defaultSenderName}
              onChange={(e) => setSettings({ ...settings, defaultSenderName: e.target.value })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField label="Default Sender Email" description="The address emails are sent from (must be verified).">
            <input
              type="email"
              value={settings.defaultSenderEmail}
              onChange={(e) => setSettings({ ...settings, defaultSenderEmail: e.target.value })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField label="Brand Accent Color (Hex)" description="Primary color used for buttons and highlights.">
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.brandColor}
                onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                className="h-10 w-12 rounded border border-stone-300 p-1"
              />
              <input
                type="text"
                value={settings.brandColor}
                onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                className={`${inputCls} flex-1`}
              />
            </div>
          </SettingsField>

          <div className="flex items-center justify-between rounded-lg border border-stone-200 p-4 mt-1">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">Unsubscribe Link</h4>
              <p className="text-sm text-stone-500">Append CAN-SPAM compliant unsubscribe footer.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, includeUnsubscribeLink: !settings.includeUnsubscribeLink })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                settings.includeUnsubscribeLink ? 'bg-rose-500' : 'bg-stone-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.includeUnsubscribeLink ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Email Templates & Automation"
        description="Design your branded email sequences and map them to specific events."
        icon={<LayoutTemplate className="h-5 w-5" />}
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Template List */}
          <div className="w-full md:w-1/3 space-y-4">
            <button
              onClick={addTemplate}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-stone-300 bg-stone-50 py-3 text-sm font-semibold text-stone-600 hover:border-stone-400 hover:text-stone-900 transition-colors"
            >
              <Plus className="h-4 w-4" /> Create Template
            </button>
            <div className="space-y-2">
              {settings.templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedTemplateId === template.id
                      ? 'border-rose-200 bg-rose-50'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-stone-900 text-sm truncate">{template.name}</h5>
                    <div className={`h-2 w-2 rounded-full ${template.active ? 'bg-green-500' : 'bg-stone-300'}`} />
                  </div>
                  <p className="text-xs text-stone-500 mt-1 truncate">Trigger: {template.triggerEvent}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Builder Area */}
          <div className="w-full md:w-2/3">
            {selectedTemplate ? (
              <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h3 className="font-semibold text-stone-900">Edit Template</h3>
                  <button
                    onClick={() => removeTemplate(selectedTemplate.id)}
                    className="text-stone-400 hover:text-red-500 p-1"
                    title="Delete Template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <SettingsField label="Internal Name">
                    <input
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) => updateTemplate(selectedTemplate.id, { name: e.target.value })}
                      className={inputCls}
                    />
                  </SettingsField>

                  <SettingsField label="Email Subject">
                    <input
                      type="text"
                      value={selectedTemplate.subject}
                      onChange={(e) => updateTemplate(selectedTemplate.id, { subject: e.target.value })}
                      className={inputCls}
                    />
                  </SettingsField>

                  <SettingsField label="Automation Trigger Event">
                    <select
                      value={selectedTemplate.triggerEvent}
                      onChange={(e) => updateTemplate(selectedTemplate.id, { triggerEvent: e.target.value })}
                      className={inputCls}
                    >
                      <option value="manual">Manual Send Only</option>
                      <option value="lead_captured">Lead Captured</option>
                      <option value="appointment_booked">Appointment Booked</option>
                      <option value="appointment_24h_reminder">24h Appointment Reminder</option>
                      <option value="gown_purchased">Gown Purchased</option>
                      <option value="alterations_ready">Alterations Ready for Pickup</option>
                    </select>
                  </SettingsField>

                  <div className="flex items-center justify-between mt-2">
                    <label className="text-sm font-semibold text-stone-700">Status</label>
                    <button
                      onClick={() => updateTemplate(selectedTemplate.id, { active: !selectedTemplate.active })}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        selectedTemplate.active ? 'bg-green-500' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          selectedTemplate.active ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <SettingsField label="HTML Content Editor" description="Supports {{first_name}}, {{appointment_date}}, etc.">
                    <textarea
                      value={selectedTemplate.bodyHtml}
                      onChange={(e) => updateTemplate(selectedTemplate.id, { bodyHtml: e.target.value })}
                      className={`${inputCls} min-h-[200px] font-mono text-xs p-3`}
                    />
                  </SettingsField>

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                    <button className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50">
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800">
                      <Send className="h-3.5 w-3.5" /> Send Test
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
                <LayoutTemplate className="mb-3 h-8 w-8 text-stone-400" />
                <h3 className="text-sm font-semibold text-stone-900">No Template Selected</h3>
                <p className="mt-1 text-sm text-stone-500">Select a template from the list to edit, or create a new one.</p>
              </div>
            )}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
