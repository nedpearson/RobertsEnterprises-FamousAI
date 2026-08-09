import React from 'react';
import { MapPin, Users, Building, Activity, Plus } from 'lucide-react';

export default function MarketExplorer() {
  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Sidebar: Market Candidates */}
      <div className="col-span-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-stone-900">Target Markets</h3>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        {/* Placeholder Candidates */}
        <div className="flex flex-col gap-3">
          <div className="cursor-pointer rounded-xl border border-rose-500 bg-rose-50 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-stone-900">Austin Metro</h4>
                <p className="text-xs text-stone-500">Texas, USA</p>
              </div>
              <span className="rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white">94/100</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-stone-600">
              <div className="flex items-center gap-1"><Users className="h-3 w-3" /> 2.2M Pop.</div>
              <div className="flex items-center gap-1"><Building className="h-3 w-3" /> 14 Competitors</div>
            </div>
          </div>
          
          <div className="cursor-pointer rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:bg-stone-50">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-stone-900">Nashville</h4>
                <p className="text-xs text-stone-500">Tennessee, USA</p>
              </div>
              <span className="rounded-full bg-amber-500 px-2 py-1 text-[10px] font-bold text-white">82/100</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-stone-600">
              <div className="flex items-center gap-1"><Users className="h-3 w-3" /> 1.9M Pop.</div>
              <div className="flex items-center gap-1"><Building className="h-3 w-3" /> 21 Competitors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area: Map & Details */}
      <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
          {/* MAP PLACEHOLDER */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Austin,TX&zoom=11&size=1200x800&style=feature:all|element:labels|visibility:off&style=feature:water|color:0xd4e4eb&style=feature:landscape|color:0xfaf8f5')] bg-cover bg-center opacity-60">
            <div className="rounded-2xl bg-white/90 p-6 text-center shadow-lg backdrop-blur-sm">
              <MapPin className="mx-auto h-8 w-8 text-rose-500" />
              <h3 className="mt-2 font-serif text-xl font-bold text-stone-900">Interactive Map Visualization</h3>
              <p className="mt-1 text-sm text-stone-500">Google Places & Census integration pending API keys.</p>
            </div>
          </div>
        </div>

        {/* Intelligence Panel */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h4 className="text-sm font-semibold text-stone-500">Median Income (Census)</h4>
            <p className="mt-2 text-3xl font-bold text-stone-900">$87,500</p>
            <p className="mt-1 text-xs text-emerald-600">+12% vs National Avg</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h4 className="text-sm font-semibold text-stone-500">Bridal Competitors (Places)</h4>
            <p className="mt-2 text-3xl font-bold text-stone-900">14</p>
            <p className="mt-1 text-xs text-amber-600">Moderate Saturation</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h4 className="text-sm font-semibold text-stone-500">First-Party Lead Demand</h4>
            <p className="mt-2 text-3xl font-bold text-stone-900">412</p>
            <p className="mt-1 text-xs text-emerald-600">Inquiries from this zip code</p>
          </div>
        </div>
      </div>
    </div>
  );
}
