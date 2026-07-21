import React, { useState } from 'react';
import { useDemo } from '@/lib/demo/demoContext';
import { PageHeader, btnPrimary, btnSecondary } from '../vowos/ui';
import { GraduationCap, Play, CheckCircle2, Trophy, BookOpen, Sparkles, Award } from 'lucide-react';
import { ViewKey } from '../vowos/Sidebar';

export default function TrainingCenterView({ onNavigate }: { onNavigate?: (v: ViewKey) => void }) {
  const { scenarios, startScenario } = useDemo();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'All' | 'Owner' | 'Manager' | 'Bridal Consultant' | 'Payroll Administrator'>('All');

  const filteredScenarios = selectedRoleFilter === 'All'
    ? scenarios
    : scenarios.filter((s) => s.targetRole.toLowerCase().includes(selectedRoleFilter.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="VowOS Training Center & Certification"
        subtitle="Role-based guided paths, hands-on scenario practice, and interactive certification."
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 100% Isolated Demo Environment
            </span>
          </div>
        }
      />

      {/* Progress Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Completed Scenarios</p>
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-stone-900">12 / {scenarios.length}</p>
          <div className="mt-3 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-[30%]" />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Role Path</p>
            <GraduationCap className="h-5 w-5 text-rose-500" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-stone-900">Bridal Consultant</p>
          <p className="mt-1 text-xs text-stone-500">10 Scenarios · 4 Completed</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Training Certification</p>
            <Award className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-emerald-600">Level 2 Certified</p>
          <p className="mt-1 text-xs text-stone-500">Issued July 2026 · Valid</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Voice Narration</p>
            <Sparkles className="h-5 w-5 text-violet-500" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-stone-900">ElevenLabs TTS</p>
          <p className="mt-1 text-xs text-stone-500">Synchronized Guided Tours</p>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {(['All', 'Owner', 'Manager', 'Bridal Consultant', 'Payroll Administrator'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRoleFilter(r)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              selectedRoleFilter === r
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map((sc) => (
          <div
            key={sc.id}
            className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:border-rose-300 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                  {sc.targetRole}
                </span>
                <span className="text-[10px] text-stone-400 font-medium">{sc.estimatedMinutes} mins · {sc.difficulty}</span>
              </div>
              <h3 className="mt-3 font-serif text-base font-bold text-stone-900">{sc.name}</h3>
              <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">{sc.description}</p>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-[11px] text-stone-400">{sc.steps.length} Guided Steps</span>
              <button
                onClick={() => startScenario(sc.id, 'watch', onNavigate as any)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-600 transition-colors shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-white" /> Start Tour
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
