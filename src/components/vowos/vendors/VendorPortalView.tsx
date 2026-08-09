import React, { useState } from 'react';
import { PageHeader, btnPrimary } from '../ui';
import { Network, Handshake, Star, Building2, ChevronRight, MessageSquare, Briefcase } from 'lucide-react';
import { VendorScorecardView } from './VendorScorecardView';
import { B2BNegotiationRoom } from './B2BNegotiationRoom';

export default function VendorPortalView() {
  const [activeTab, setActiveTab] = useState<'scorecards' | 'negotiation' | 'directory'>('scorecards');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Connect OS"
        subtitle="AI-Powered Supply Chain & Negotiation"
        action={
          <div className="flex items-center gap-2">
            <button className={`${btnPrimary} flex items-center gap-2`}>
              <Network className="h-4 w-4" /> Sync Vendor Catalogs
            </button>
          </div>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-stone-200 gap-1">
        {[
          { key: 'scorecards', label: 'Vendor Scorecards', icon: Star },
          { key: 'negotiation', label: 'B2B Negotiation Room', icon: Handshake },
          { key: 'directory', label: 'Vendor Directory', icon: Building2 },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === t.key 
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' 
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {activeTab === 'scorecards' && <VendorScorecardView />}
        {activeTab === 'negotiation' && <B2BNegotiationRoom />}
        {activeTab === 'directory' && (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
            <div className="bg-stone-100 p-4 rounded-full mb-4">
              <Briefcase className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Vendor Directory</h3>
            <p className="text-stone-500 mt-2 max-w-md">
              Manage your 14 active vendors, sync API keys for live catalog updates, and review contract terms.
            </p>
            <button className={`${btnPrimary} mt-6`}>Import Vendor List</button>
          </div>
        )}
      </div>

    </div>
  );
}
