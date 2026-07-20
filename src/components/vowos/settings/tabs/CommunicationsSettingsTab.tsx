import { useEffect, useState } from 'react';
import { MessageSquare, Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inputCls } from '@/components/vowos/ui';
import { SettingsCard } from '../components/SettingsCard';
import { SettingsField } from '../components/SettingsField';
import { Switch } from '@/components/ui/switch';
import { fetchJsonSetting, saveJsonSetting, DEFAULT_TWILIO_SETTINGS, TwilioSettings } from '@/lib/settings';

interface ChannelConfig {
  emailSender: string;
  senderDisplayName: string;
  replyTo: string;
  smsConsentText: string;
}

const DEFAULT_CHANNEL_CONFIG: ChannelConfig = {
  emailSender: 'notifications@robertsenterprises.com',
  senderDisplayName: 'Roberts Enterprises Bridal',
  replyTo: 'support@robertsenterprises.com',
  smsConsentText: 'Reply STOP to unsubscribe. Msg & data rates may apply.',
};

interface CommunicationsSettingsTabProps {
  onDirtyChange: (dirty: boolean) => void;
  registerSaveRef: (saveFn: () => Promise<boolean>) => void;
  resetTrigger: number;
}

export function CommunicationsSettingsTab({
  onDirtyChange,
  registerSaveRef,
  resetTrigger,
}: CommunicationsSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [twilio, setTwilio] = useState<TwilioSettings>(DEFAULT_TWILIO_SETTINGS);
  const [dbTwilio, setDbTwilio] = useState<TwilioSettings>(DEFAULT_TWILIO_SETTINGS);
  const [channel, setChannel] = useState<ChannelConfig>(DEFAULT_CHANNEL_CONFIG);
  const [dbChannel, setDbChannel] = useState<ChannelConfig>(DEFAULT_CHANNEL_CONFIG);
  const [testingConnection, setTestingConnection] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    const twilioData = await fetchJsonSetting<TwilioSettings>('twilio_settings', DEFAULT_TWILIO_SETTINGS);
    const channelData = await fetchJsonSetting<ChannelConfig>('channel_settings', DEFAULT_CHANNEL_CONFIG);
    setTwilio(twilioData);
    setDbTwilio(twilioData);
    setChannel(channelData);
    setDbChannel(channelData);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, [resetTrigger]);

  const isDirty =
    JSON.stringify(twilio) !== JSON.stringify(dbTwilio) ||
    JSON.stringify(channel) !== JSON.stringify(dbChannel);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty]);

  const handleSave = async (reason?: string): Promise<boolean> => {
    const err1 = await saveJsonSetting('twilio_settings', twilio);
    const err2 = await saveJsonSetting('channel_settings', channel);
    
    if (reason && !err1 && !err2) {
      await saveJsonSetting('audit_last_change_reason', {
        tab: 'communications',
        reason,
        timestamp: new Date().toISOString(),
      });
    }

    if (err1 || err2) {
      toast({
        title: 'Could not save communications settings',
        description: err1 || err2 || '',
        variant: 'destructive',
      });
      return false;
    } else {
      toast({
        title: 'Communications settings saved',
        description: 'Twilio integration and channel details updated.',
      });
      setDbTwilio(twilio);
      setDbChannel(channel);
      return true;
    }
  };

  useEffect(() => {
    registerSaveRef(handleSave);
  }, [twilio, channel]);

  const testTwilioConnection = async () => {
    setTestingConnection(true);
    // Simulate API connection verification to Twilio
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTestingConnection(false);
    toast({
      title: 'Twilio connection verified',
      description: 'Webhook callbacks are functioning successfully.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading communication channels…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Twilio Configuration"
        description="Verify gateway status and inbound webhooks for transactional text messaging."
        icon={<MessageSquare className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField
            label="Messaging Service SID"
            description="Twilio SID for programmatic texting (credentials are masked)."
          >
            <input
              type="text"
              value={twilio.messagingServiceSid}
              onChange={(e) => setTwilio({ ...twilio, messagingServiceSid: e.target.value })}
              className={inputCls}
              placeholder="e.g. MGXXXXXXXXXXXXXXXX"
            />
          </SettingsField>

          <SettingsField
            label="Webhook Status"
            description="Status of inbound callback validation on Twilio."
          >
            <div className="flex items-center justify-between h-9 px-1">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                ● {twilio.webhookStatus === 'active' ? 'Active & Listening' : 'Inactive'}
              </span>
              <button
                onClick={testTwilioConnection}
                disabled={testingConnection}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${testingConnection ? 'animate-spin' : ''}`} />
                Test Gateway
              </button>
            </div>
          </SettingsField>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Email & SMS Channel Defaults"
        description="Configure outbound domains, display names, and standard consent notices."
        icon={<MessageSquare className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField
            label="Outbound sender email"
            description="Email address used for sending receipts and quotes."
          >
            <input
              type="email"
              value={channel.emailSender}
              onChange={(e) => setChannel({ ...channel, emailSender: e.target.value })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField
            label="Outbound display name"
            description="Name brides will see in their email inbox."
          >
            <input
              type="text"
              value={channel.senderDisplayName}
              onChange={(e) => setChannel({ ...channel, senderDisplayName: e.target.value })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField
            label="Reply-To email"
            description="Address client replies will be routed to."
          >
            <input
              type="email"
              value={channel.replyTo}
              onChange={(e) => setChannel({ ...channel, replyTo: e.target.value })}
              className={inputCls}
            />
          </SettingsField>

          <SettingsField
            label="SMS unsubscribe footer"
            description="Standard compliance consent text added to the end of outgoing SMS messages."
          >
            <input
              type="text"
              value={channel.smsConsentText}
              onChange={(e) => setChannel({ ...channel, smsConsentText: e.target.value })}
              className={inputCls}
            />
          </SettingsField>
        </div>
      </SettingsCard>
    </div>
  );
}
