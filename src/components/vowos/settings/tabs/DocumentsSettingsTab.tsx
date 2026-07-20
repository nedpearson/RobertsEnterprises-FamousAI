import { useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';
import { fetchJsonSetting, saveJsonSetting } from '@/lib/settings';

interface DocumentConfig {
  quoteHeader: string;
  invoiceFooter: string;
  receiptTerms: string;
  activeLogoUrl: string;
}

const DEFAULT_DOC_CONFIG: DocumentConfig = {
  quoteHeader: 'Bridal Gown Quote - Valid for 30 Days',
  invoiceFooter: 'All deposits are non-refundable. Final balance is due before alterations.',
  receiptTerms: 'Final Sale. Thank you for shopping with Roberts Enterprises.',
  activeLogoUrl: 'https://robertsenterprises.com/logo.png',
};

interface DocumentsSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function DocumentsSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: DocumentsSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<DocumentConfig>(DEFAULT_DOC_CONFIG);
  const [dbSettings, setDbSettings] = useState<DocumentConfig>(DEFAULT_DOC_CONFIG);

  const loadSettings = async () => {
    setLoading(true);
    const data = await fetchJsonSetting<DocumentConfig>('document_settings', DEFAULT_DOC_CONFIG);
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
    const err = await saveJsonSetting('document_settings', settings);
    if (reason && !err) {
      await saveJsonSetting('audit_last_change_reason', {
        tab: 'documents',
        reason,
        timestamp: new Date().toISOString(),
      });
    }

    if (err) {
      toast({
        title: 'Could not save document templates',
        description: err,
        variant: 'destructive',
      });
      return false;
    } else {
      toast({
        title: 'Document templates saved',
        description: 'Receipt and Quote footers have been updated.',
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
        <Loader2 className="h-4 w-4 animate-spin" /> Loading document templates…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Document Design & Typography"
        description="Establish custom headers, footers, and active logos for printed receipts and PDFs."
        icon={<FileText className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField
            label="Active Logo URL"
            description="URL pointing to the boutique logo file."
            className="sm:col-span-2"
          >
            <input
              type="text"
              value={settings.activeLogoUrl}
              onChange={(e) => setSettings({ ...settings, activeLogoUrl: e.target.value })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField
            label="Default Quote Title"
            description="Header printed on customer quotes."
            className="sm:col-span-2"
          >
            <input
              type="text"
              value={settings.quoteHeader}
              onChange={(e) => setSettings({ ...settings, quoteHeader: e.target.value })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField
            label="Invoice footer terms"
            description="Disclosures displayed at bottom of customer invoice printouts."
            className="sm:col-span-2"
          >
            <textarea
              value={settings.invoiceFooter}
              onChange={(e) => setSettings({ ...settings, invoiceFooter: e.target.value })}
              className={`${inputCls} min-h-[80px] py-2`}
            />
          </SettingsField>

          <SettingsField
            label="Receipt terms & agreements"
            description="Standard closing guidelines displayed at checkouts."
            className="sm:col-span-2"
          >
            <textarea
              value={settings.receiptTerms}
              onChange={(e) => setSettings({ ...settings, receiptTerms: e.target.value })}
              className={`${inputCls} min-h-[80px] py-2`}
            />
          </SettingsField>
        </div>
      </SettingsCard>
    </div>
  );
}
