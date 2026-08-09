import React from 'react';
import { Mail, Phone, CalendarCheck, Clock, CheckCircle } from 'lucide-react';

export default function FranchisePipeline() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-stone-900">Franchise Candidate CRM</h3>
        <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-700">
          Add Candidate
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1000px] h-full">
          {/* Column: Leads */}
          <div className="flex w-1/4 flex-col rounded-xl bg-stone-100 p-3">
            <h4 className="mb-3 font-semibold text-stone-700">New Leads (2)</h4>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm cursor-grab">
                <h5 className="font-bold text-stone-900">Jessica Alba</h5>
                <p className="text-xs text-stone-500">Interest: Kiosk Program</p>
                <div className="mt-3 flex gap-2">
                  <button className="flex flex-1 items-center justify-center rounded bg-stone-100 p-1.5 text-stone-600 hover:bg-stone-200"><Mail className="h-4 w-4" /></button>
                  <button className="flex flex-1 items-center justify-center rounded bg-stone-100 p-1.5 text-stone-600 hover:bg-stone-200"><Phone className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Column: Application Review */}
          <div className="flex w-1/4 flex-col rounded-xl bg-stone-100 p-3">
            <h4 className="mb-3 font-semibold text-stone-700">Application Under Review (1)</h4>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm cursor-grab">
                <h5 className="font-bold text-stone-900">David Smith Group</h5>
                <p className="text-xs text-stone-500">Capital: $500k Liquid</p>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <Clock className="h-3 w-3" /> Background Check Pending
                </div>
              </div>
            </div>
          </div>

          {/* Column: Discovery Day */}
          <div className="flex w-1/4 flex-col rounded-xl bg-stone-100 p-3">
            <h4 className="mb-3 font-semibold text-stone-700">Discovery Day (1)</h4>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm cursor-grab border-l-4 border-l-rose-500">
                <h5 className="font-bold text-stone-900">Amanda Reynolds</h5>
                <p className="text-xs text-stone-500">Interest: Flagship Store</p>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase text-stone-600 bg-stone-100 px-2 py-1 rounded">
                  <CalendarCheck className="h-3 w-3" /> Scheduled Oct 15
                </div>
              </div>
            </div>
          </div>

          {/* Column: FDD Disclosure */}
          <div className="flex w-1/4 flex-col rounded-xl bg-stone-100 p-3">
            <h4 className="mb-3 font-semibold text-stone-700">FDD 14-Day Wait (1)</h4>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm cursor-grab border-l-4 border-l-emerald-500">
                <h5 className="font-bold text-stone-900">Rivera Holdings LLC</h5>
                <p className="text-xs text-stone-500">Target: Miami Metro</p>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                  <CheckCircle className="h-3 w-3" /> Clears Tomorrow
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
