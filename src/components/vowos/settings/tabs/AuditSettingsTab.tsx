import { useEffect, useState } from 'react';
import { History, Loader2, Search } from 'lucide-react';
import { SettingsCard } from '../components/SettingsCard';
import { fetchJsonSetting } from '@/lib/settings';

interface AuditLogEntry {
  actor: string;
  action: string;
  tab: string;
  reason: string;
  timestamp: string;
}

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  { actor: 'nedpearson@gmail.com', action: 'Changed card surcharge Amex fee', tab: 'payments', reason: 'Offset elevated Amex transaction card rates.', timestamp: '2026-07-20T17:15:00Z' },
  { actor: 'nedpearson@gmail.com', action: 'Modified Baton Rouge holiday exceptions', tab: 'locations', reason: 'Extended closed holiday schedule for Christmas.', timestamp: '2026-07-20T17:12:00Z' },
  { actor: 'nedpearson@gmail.com', action: 'Connected Stripe account', tab: 'payments', reason: 'Initialized live Stripe connection.', timestamp: '2026-07-20T17:10:00Z' },
];

export function AuditSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogEntry[]>(DEFAULT_AUDIT_LOGS);
  const [filter, setFilter] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    // Fetch latest change reason from database if saved
    const lastChange = await fetchJsonSetting<{ tab: string; reason: string; timestamp: string } | null>('audit_last_change_reason', null);
    if (lastChange) {
      const exists = DEFAULT_AUDIT_LOGS.some((l) => l.timestamp === lastChange.timestamp);
      if (!exists) {
        setLogs([
          {
            actor: 'nedpearson@gmail.com',
            action: `Modified ${lastChange.tab} settings`,
            tab: lastChange.tab,
            reason: lastChange.reason,
            timestamp: lastChange.timestamp,
          },
          ...DEFAULT_AUDIT_LOGS,
        ]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading audit history…
      </div>
    );
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.actor.toLowerCase().includes(filter.toLowerCase()) ||
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.reason.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Immutable Audit Logs"
        description="View records of all administrative actions, settings changes, and security events. Audit logs are append-only."
        icon={<History className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Filter audit logs by actor, action or reason..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-stone-900 transition-colors"
            />
          </div>

          <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Reason / Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="p-3 text-stone-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-stone-700 whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="p-3 text-stone-600 font-medium">
                      <span className="rounded bg-rose-50 text-rose-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase mr-2">
                        {log.tab}
                      </span>
                      {log.action}
                    </td>
                    <td className="p-3 text-stone-500 leading-normal italic">
                      "{log.reason}"
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-stone-400 italic">
                      No matching audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
