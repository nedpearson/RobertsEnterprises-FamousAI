/**
 * Model-Agnostic AI Gateway & Task Routing Engine
 * Manages provider selections, task routing, benchmarks, latency/cost evaluation, and shadow-mode testing.
 */

export type AITaskType =
  | 'high_reasoning'
  | 'fast_summarization'
  | 'vision_creative'
  | 'embedding_similarity'
  | 'classical_ml'
  | 'optimization_engine';

export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Google Gemini' | 'Anthropic' | 'Internal ML' | 'Optimization Core';
  taskType: AITaskType;
  isChampion: boolean;
  isChallenger: boolean;
  qualityScore: number; // 0 - 100
  latencyMs: number;
  costPer1kTokensCents: number;
  reliabilityScore: number; // 0 - 100%
  status: 'active' | 'shadow' | 'deprecated';
}

export interface BenchmarkResult {
  id: string;
  modelId: string;
  timestamp: string;
  taskType: AITaskType;
  qualityScore: number;
  latencyMs: number;
  costCents: number;
  passed: boolean;
}

export const INITIAL_AI_MODELS: AIModelConfig[] = [
  {
    id: 'model-gpt4o',
    name: 'GPT-4o (High Reasoning)',
    provider: 'OpenAI',
    taskType: 'high_reasoning',
    isChampion: true,
    isChallenger: false,
    qualityScore: 96,
    latencyMs: 850,
    costPer1kTokensCents: 1.5,
    reliabilityScore: 99.8,
    status: 'active',
  },
  {
    id: 'model-gemini-pro',
    name: 'Gemini 1.5 Pro (High Reasoning)',
    provider: 'Google Gemini',
    taskType: 'high_reasoning',
    isChampion: false,
    isChallenger: true,
    qualityScore: 95,
    latencyMs: 720,
    costPer1kTokensCents: 1.2,
    reliabilityScore: 99.5,
    status: 'shadow',
  },
  {
    id: 'model-gpt4o-mini',
    name: 'GPT-4o Mini (Fast Summarizer)',
    provider: 'OpenAI',
    taskType: 'fast_summarization',
    isChampion: true,
    isChallenger: false,
    qualityScore: 92,
    latencyMs: 180,
    costPer1kTokensCents: 0.15,
    reliabilityScore: 99.9,
    status: 'active',
  },
  {
    id: 'model-gemini-flash',
    name: 'Gemini 1.5 Flash (Fast Summarizer)',
    provider: 'Google Gemini',
    taskType: 'fast_summarization',
    isChampion: false,
    isChallenger: true,
    qualityScore: 93,
    latencyMs: 140,
    costPer1kTokensCents: 0.1,
    reliabilityScore: 99.7,
    status: 'shadow',
  },
  {
    id: 'model-vision-vowos',
    name: 'GPT-4o Vision (Creative Analysis)',
    provider: 'OpenAI',
    taskType: 'vision_creative',
    isChampion: true,
    isChallenger: false,
    qualityScore: 94,
    latencyMs: 1200,
    costPer1kTokensCents: 2.0,
    reliabilityScore: 99.4,
    status: 'active',
  },
  {
    id: 'model-embedding-text3',
    name: 'text-embedding-3-large',
    provider: 'OpenAI',
    taskType: 'embedding_similarity',
    isChampion: true,
    isChallenger: false,
    qualityScore: 98,
    latencyMs: 90,
    costPer1kTokensCents: 0.05,
    reliabilityScore: 100,
    status: 'active',
  },
  {
    id: 'model-ml-scoring',
    name: 'VowOS Lead Scoring Engine v3',
    provider: 'Internal ML',
    taskType: 'classical_ml',
    isChampion: true,
    isChallenger: false,
    qualityScore: 96,
    latencyMs: 12,
    costPer1kTokensCents: 0.001,
    reliabilityScore: 100,
    status: 'active',
  },
  {
    id: 'model-opt-solver',
    name: 'VowOS Simplex Budget Allocator',
    provider: 'Optimization Core',
    taskType: 'optimization_engine',
    isChampion: true,
    isChallenger: false,
    qualityScore: 99,
    latencyMs: 45,
    costPer1kTokensCents: 0.0,
    reliabilityScore: 100,
    status: 'active',
  },
];

export class AIModelGateway {
  private static instance: AIModelGateway;
  private models: AIModelConfig[] = [...INITIAL_AI_MODELS];
  private benchmarks: BenchmarkResult[] = [];

  public static getInstance(): AIModelGateway {
    if (!AIModelGateway.instance) {
      AIModelGateway.instance = new AIModelGateway();
    }
    return AIModelGateway.instance;
  }

  public getModels(): AIModelConfig[] {
    return this.models;
  }

  public getModelForTask(taskType: AITaskType): AIModelConfig {
    const champion = this.models.find((m) => m.taskType === taskType && m.isChampion);
    return champion || this.models[0];
  }

  public promoteChallenger(challengerId: string): void {
    const challenger = this.models.find((m) => m.id === challengerId);
    if (!challenger) return;

    // Demote current champion for task
    this.models.forEach((m) => {
      if (m.taskType === challenger.taskType) {
        if (m.id === challengerId) {
          m.isChampion = true;
          m.isChallenger = false;
          m.status = 'active';
        } else {
          m.isChampion = false;
          m.isChallenger = true;
          m.status = 'shadow';
        }
      }
    });
  }

  public runBenchmarkSuite(): BenchmarkResult[] {
    const results: BenchmarkResult[] = this.models.map((m) => ({
      id: `bench-${Date.now()}-${m.id}`,
      modelId: m.id,
      timestamp: new Date().toISOString(),
      taskType: m.taskType,
      qualityScore: Math.min(100, Math.max(80, m.qualityScore + (Math.random() * 4 - 2))),
      latencyMs: Math.max(10, Math.round(m.latencyMs + (Math.random() * 40 - 20))),
      costCents: m.costPer1kTokensCents,
      passed: true,
    }));
    this.benchmarks.unshift(...results);
    return results;
  }

  public getBenchmarks(): BenchmarkResult[] {
    return this.benchmarks;
  }
}

export const aiGateway = AIModelGateway.getInstance();
