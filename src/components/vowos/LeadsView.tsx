import { useState } from 'react';
import { ArrowRight, Sparkles, Loader2, ChevronRight, UserPlus, Phone, Mail } from 'lucide-react';
import { LEAD_STAGES, LeadStage, Lead, formatCents, formatDate } from '@/data/vowosData';
import { useVowosData } from '@/contexts/VowosDataContext';
import { PageHeader } from './ui';
import Lead360Modal from './Lead360Modal';
import BookAppointmentModal from './BookAppointmentModal';

const STAGE_STYLES: Record<LeadStage, { dot: string; header: string }> = {
  New: { dot: 'bg-sky-400', header: 'text-sky-700' },
  Contacted: { dot: 'bg-amber-400', header: 'text-amber-700' },
  'Appointment Set': { dot: 'bg-violet-400', header: 'text-violet-700' },
  Won: { dot: 'bg-emerald-400', header: 'text-emerald-700' },
};

export default function LeadsView({ onNavigate }: { onNavigate?: (view: string, id?: string) => void }) {
  const { leads: list, loading, advanceLead } = useVowosData();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [bookLead, setBookLead] = useState<{ name: string; email: string } | null>(null);

  const pipelineValue = list.filter((l) => l.stage !== 'Won').reduce((s, l) => s + l.budgetCents, 0);

  return (
    <div>
      <PageHeader
        title="Lead Pipeline"
        subtitle={`${list.length} leads · ${formatCents(pipelineValue)} in open pipeline value · Click any lead to open Lead 360 Source Drilldown`}
      />

      {loading ? (
        <div className="flex flex-col items-center rounded-2xl border border-stone-200/80 bg-white py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
          <p className="mt-3 text-sm text-stone-500">Loading pipeline...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {LEAD_STAGES.map((stage) => {
            const stageLeads = list.filter((l) => l.stage === stage);
            const style = STAGE_STYLES[stage];
            return (
              <div key={stage} className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-3">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  <h3 className={`text-sm font-semibold ${style.header}`}>{stage}</h3>
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-stone-500 ring-1 ring-stone-200">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {stageLeads.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => setSelectedLead(l)}
                      className="rounded-xl border border-stone-200/70 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-rose-400 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-stone-900 group-hover:text-rose-600 transition-colors flex items-center gap-1">
                          {l.name} <ChevronRight className="h-3.5 w-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                        </p>
                        <Sparkles className="h-4 w-4 flex-shrink-0 text-rose-400" />
                      </div>
                      <p className="mt-0.5 text-xs text-stone-400">{l.email}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
                        <span>Budget {formatCents(l.budgetCents)}</span>
                        <span>{formatDate(l.weddingDate)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600">{l.source}</span>
                        {stage !== 'Won' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              advanceLead(l.id);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                          >
                            Advance <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="rounded-xl border border-dashed border-stone-200 py-6 text-center text-xs text-stone-400">
                      No leads in this stage
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead 360 Source Drilldown Modal */}
      {selectedLead && (
        <Lead360Modal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onNavigateToBride={(brideId) => {
            sessionStorage.setItem('vowos_target_bride_id', brideId);
            if (onNavigate) onNavigate('customers');
          }}
          onBookAppointment={(name, email) => {
            setBookLead({ name, email });
          }}
        />
      )}

      {/* Book Appointment Modal for Lead */}
      {bookLead && (
        <BookAppointmentModal
          open={true}
          onClose={() => setBookLead(null)}
          defaultName={bookLead.name}
          defaultEmail={bookLead.email}
        />
      )}
    </div>
  );
}
