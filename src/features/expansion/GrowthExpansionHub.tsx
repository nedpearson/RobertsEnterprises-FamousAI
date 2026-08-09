import React, { useState } from 'react';
import { useTenantEntitlements } from '@/hooks/useTenantEntitlements';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, Calculator, FileCheck, Landmark, Building, Briefcase } from 'lucide-react';

import MarketExplorer from './MarketExplorer';
import FinancialModelerView from './FinancialModelerView';
import FranchiseCommandCenter from './FranchiseCommandCenter';
import FranchisePipeline from './FranchisePipeline';
import FDDDocumentManager from './FDDDocumentManager';
import { EntitlementGuard } from '@/components/vowos/guards/EntitlementGuard';

export default function GrowthExpansionHub() {
  const [activeTab, setActiveTab] = useState('readiness');
  const { can } = useTenantEntitlements();

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Franchise & Expansion Intelligence</h2>
          <p className="text-sm text-stone-500">Assess market viability, model financials, and manage your franchise network.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="readiness" className="flex items-center gap-2">
            <Building className="h-4 w-4" /> Expansion Readiness
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <Map className="h-4 w-4" /> Market Explorer
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" /> Financial Pro Forma
          </TabsTrigger>
          
          {can('franchise.core') && (
            <>
              <TabsTrigger value="pipeline" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Candidates
              </TabsTrigger>
              <TabsTrigger value="fdd" className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" /> Document Control
              </TabsTrigger>
              <TabsTrigger value="franchisees" className="flex items-center gap-2">
                <Landmark className="h-4 w-4" /> Franchise Command
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="readiness" className="flex-1">
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-stone-900">Expansion Readiness Score</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-stone-500">Based on historic sales, capacity, and lead volume.</p>
                <div className="text-4xl font-extrabold text-emerald-600">87 / 100</div>
                <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">Highly Ready for Expansion</p>
              </div>
            </div>
            
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-stone-100 bg-stone-50 p-4">
                <h4 className="text-sm font-bold text-stone-700">Financial Health</h4>
                <p className="mt-1 text-xs text-stone-500">Net margin exceeds 20% benchmark.</p>
              </div>
              <div className="rounded-lg border border-stone-100 bg-stone-50 p-4">
                <h4 className="text-sm font-bold text-stone-700">Brand Saturation</h4>
                <p className="mt-1 text-xs text-stone-500">High volume of out-of-state leads.</p>
              </div>
              <div className="rounded-lg border border-stone-100 bg-stone-50 p-4">
                <h4 className="text-sm font-bold text-stone-700">Operations</h4>
                <p className="mt-1 text-xs text-stone-500">Playbooks and training are digitized.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="market" className="flex-1 h-full min-h-[600px]">
          <MarketExplorer />
        </TabsContent>

        <TabsContent value="financials" className="flex-1">
          <FinancialModelerView />
        </TabsContent>

        {can('franchise.core') && (
          <>
            <TabsContent value="pipeline" className="flex-1">
              <FranchisePipeline />
            </TabsContent>

            <TabsContent value="fdd" className="flex-1">
              <FDDDocumentManager />
            </TabsContent>

            <TabsContent value="franchisees" className="flex-1">
              <FranchiseCommandCenter />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
