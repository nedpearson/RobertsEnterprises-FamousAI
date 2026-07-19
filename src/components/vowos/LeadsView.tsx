import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { leads as seedLeads, Lead, LEAD_STAGES, LeadStage, formatCents, formatDate } from '@/data/vowosData';
import { PageHeader } from './ui';

const STAGE_STYLES: Record<LeadStage, { dot: string; header: string }> = {
  New: { dot: 'bg-sky-400', header: 'text-sky-700' },
  Contacted: { dot: 'bg-amber-400', header: 'text-amber-700' },
  'Appointment Set': { dot: 'bg-violet-400', header: 'text-violet-700' },
  Won: { dot: 'bg-emerald-400', header: 'text-emerald-700' },
};

export default function LeadsView() {
  const [list, setList] = useState<Lead[]>(seedLeads);

  const advance = (id: string) => {
    setList((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const idx = LEAD_STAGES.indexOf(l.stage);
        return idx < LEAD_STAGES.length - 1 ? { ...l, stage: LEAD_STAGES[idx + 1] } : l;
      }),
    );
  };

  const pipelineValue = list.filter((l) => l.stage !== 'Won').reduce((s, l) => s + l.budgetCents, 0);

  return (
    <div>
      <PageHeader
        title="Lead Pipeline"
        subtitle={`${list.length} leads · ${formatCents(pipelineValue)} in open pipeline value`}
      />

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
                  <div key={l.id} className="rounded-xl border border-stone-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-stone-800">{l.name}</p>
                      <Sparkles className="h-4 w-4 flex-shrink-0 text-rose-300" />
                    </div>
                    <p className="mt-0.5 text-xs text-stone-400">{l.email}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
                      <span>Budget {formatCents(l.budgetCents)}</span>
                      <span>{formatDate(l.weddingDate)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500">{l.source}</span>
                      {stage !== 'Won' && (
                        <button
                          onClick={() => advance(l.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-50"
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
    </div>
  );
}
