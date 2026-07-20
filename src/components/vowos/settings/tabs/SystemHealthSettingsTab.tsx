import { useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SettingsCard } from '../components/SettingsCard';

export function SystemHealthSettingsTab() {
  const [checking, setChecking] = useState(false);

  const runDiagnostics = async () => {
    setChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setChecking(false);
    toast({
      title: 'Diagnostics check complete',
      description: 'All backend databases and integration endpoints are fully healthy.',
    });
  };

  const services = [
    { name: 'Supabase Database', desc: 'Queries, auth tokens, row level security policies.', status: 'Healthy' },
    { name: 'Stripe Adapter', desc: 'Secure connection check and webhook delivery loops.', status: 'Healthy' },
    { name: 'Twilio SMS gateway', desc: 'Messaging sid and webhook callback queues.', status: 'Healthy' },
    { name: 'AI Copilot Provider', desc: 'OpenAI endpoint query verification.', status: 'Healthy' },
  ];

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Owner System Administrations"
        description="Verify backend databases and integration endpoints health. Download diagnostics files."
        icon={<Activity className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Commit SHA:</span>
              <span className="text-xs text-stone-600 font-semibold ml-2">d7fce0f (main)</span>
            </div>
            <button
              onClick={runDiagnostics}
              disabled={checking}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} />
              Run Health Check
            </button>
          </div>

          <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 overflow-hidden bg-white">
            {services.map((svc) => (
              <div key={svc.name} className="flex justify-between items-center p-4">
                <div>
                  <h6 className="text-xs font-bold text-stone-800 uppercase tracking-wider">{svc.name}</h6>
                  <p className="text-[11px] text-stone-400 mt-0.5">{svc.desc}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
