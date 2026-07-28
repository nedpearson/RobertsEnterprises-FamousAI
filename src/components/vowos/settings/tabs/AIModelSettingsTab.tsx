import { useState } from 'react';
import { Cpu, Sparkles, CheckCircle2, RefreshCw, Zap, ShieldCheck, DollarSign, Award, Layers } from 'lucide-react';
import { aiGateway, AIModelConfig, AITaskType, BenchmarkResult } from '@/features/ai/modelGateway';
import { toast } from '@/components/ui/use-toast';
import { btnPrimary, btnSecondary } from '@/components/vowos/ui';

const TASK_LABELS: Record<AITaskType, { label: string; desc: string }> = {
  high_reasoning: { label: 'High Reasoning', desc: 'Campaign diagnosis, strategic growth recommendations, budget explanations' },
  fast_summarization: { label: 'Fast Summarization', desc: 'Lead categorization, source normalization, note summaries' },
  vision_creative: { label: 'Vision Creative', desc: 'Ad creative evaluation, product photo scoring' },
  embedding_similarity: { label: 'Embedding & Similarity', desc: 'Duplicate detection, knowledge retrieval' },
  classical_ml: { label: 'Classical ML', desc: 'Lead scoring, appointment probability, no-show risk' },
  optimization_engine: { label: 'Optimization Engine', desc: 'Constrained budget allocation & spend pacing' },
};

export default function AIModelSettingsTab() {
  const [models, setModels] = useState<AIModelConfig[]>(aiGateway.getModels());
  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>(aiGateway.getBenchmarks());
  const [runningBench, setRunningBench] = useState(false);

  const handleRunBenchmark = () => {
    setRunningBench(true);
    setTimeout(() => {
      const res = aiGateway.runBenchmarkSuite();
      setBenchmarks(res);
      setRunningBench(false);
      toast({
        title: 'Benchmark Suite Complete',
        description: 'Evaluated 8 task-specific AI models against VowOS accuracy test suite.',
      });
    }, 1200);
  };

  const handlePromote = (modelId: string, modelName: string) => {
    aiGateway.promoteChallenger(modelId);
    setModels([...aiGateway.getModels()]);
    toast({
      title: 'Model Promoted to Active Champion',
      description: `${modelName} is now the primary active model for its task routing.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">AI Model Gateway & Task Routing Management</h3>
            <p className="text-xs text-stone-500">
              Configure task routing, benchmark quality vs latency, and manage Champion/Challenger models safely.
            </p>
          </div>
        </div>

        <button onClick={handleRunBenchmark} disabled={runningBench} className={btnPrimary}>
          {runningBench ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {runningBench ? 'Running Benchmark...' : 'Run Benchmark Suite'}
        </button>
      </div>

      {/* Model Roster by Task Type */}
      <div className="space-y-4">
        {Object.entries(TASK_LABELS).map(([taskKey, { label, desc }]) => {
          const taskModels = models.filter((m) => m.taskType === taskKey);
          return (
            <div key={taskKey} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-rose-500" /> {label} Task Routing
                  </h4>
                  <p className="text-xs text-stone-500">{desc}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {taskModels.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-4 transition-all ${
                      m.isChampion
                        ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-400/30'
                        : 'border-stone-200 bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-stone-900">{m.name}</p>
                          {m.isChampion && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <Award className="h-3 w-3" /> Champion
                            </span>
                          )}
                          {m.isChallenger && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              Challenger (Shadow)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">Provider: {m.provider}</p>
                      </div>

                      {m.isChallenger && (
                        <button
                          onClick={() => handlePromote(m.id, m.name)}
                          className="rounded-lg bg-stone-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
                        >
                          Promote
                        </button>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-stone-200/60 pt-3 text-center">
                      <div>
                        <p className="text-[10px] text-stone-400 font-medium">Quality Score</p>
                        <p className="text-xs font-bold text-stone-800">{m.qualityScore}/100</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400 font-medium">Latency</p>
                        <p className="text-xs font-bold text-stone-800">{m.latencyMs} ms</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400 font-medium">Cost / 1k Tokens</p>
                        <p className="text-xs font-bold text-stone-800">${m.costPer1kTokensCents.toFixed(3)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Benchmark Results History */}
      {benchmarks.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Recent Benchmark Execution Log
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-2">Model ID</th>
                  <th className="px-3 py-2">Task</th>
                  <th className="px-3 py-2">Quality</th>
                  <th className="px-3 py-2">Latency</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {benchmarks.slice(0, 8).map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/50">
                    <td className="px-3 py-2 font-mono text-stone-700">{b.modelId}</td>
                    <td className="px-3 py-2 font-medium text-stone-800">{b.taskType}</td>
                    <td className="px-3 py-2 font-bold text-stone-900">{b.qualityScore.toFixed(1)}/100</td>
                    <td className="px-3 py-2 text-stone-600">{b.latencyMs} ms</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Passed
                      </span>
                    </td>
                    <td className="px-3 py-2 text-stone-400">{b.timestamp.slice(11, 19)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
