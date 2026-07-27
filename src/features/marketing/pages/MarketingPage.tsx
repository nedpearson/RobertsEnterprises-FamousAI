import { useState } from 'react';
import MarketingOverview from '../components/MarketingOverview';
import ConnectionsView from '../components/ConnectionsView';
import CampaignsManager from '../components/CampaignsManager';
import CampaignWizardModal from '../components/CampaignWizardModal';
import ContentCalendarView from '../components/ContentCalendarView';
import CreativeStudioView from '../components/CreativeStudioView';
import BudgetCenterView from '../components/BudgetCenterView';
import AttributionView from '../components/AttributionView';
import AutomationsView from '../components/AutomationsView';
import MarketingReportsView from '../components/MarketingReportsView';
import ApprovalsView from '../components/ApprovalsView';
import MarketingSettingsView from '../components/MarketingSettingsView';
import AICommandCenterView from '../../marketing-ai/command-center/AICommandCenterView';
import MarketingCopilotView from '../../marketing-ai/assistant/MarketingCopilotView';
import RecommendationsView from '../../marketing-ai/recommendations/RecommendationsView';
import BudgetOptimizerView from '../../marketing-ai/budget-optimizer/BudgetOptimizerView';
import ExperimentsView from '../../marketing-ai/experiments/ExperimentsView';
import CreativeIntelligenceView from '../../marketing-ai/creative-intelligence/CreativeIntelligenceView';
import CompetitorTrendsView from '../../marketing-ai/competitors/CompetitorTrendsView';
import GovernanceView from '../../marketing-ai/governance/GovernanceView';
import {
  TrendingUp,
  Megaphone,
  Calendar,
  Image,
  DollarSign,
  Users,
  Zap,
  BarChart3,
  CheckCircle2,
  Radio,
  Settings,
  PlusCircle,
  Filter,
  Sparkles,
  Bot,
  Cpu,
  Layers,
  Eye,
  ShieldCheck
} from 'lucide-react';

export type MarketingTab =
  | 'overview'
  | 'ai-overview'
  | 'ai-copilot'
  | 'ai-recommendations'
  | 'ai-budget-optimizer'
  | 'ai-experiments'
  | 'ai-creative'
  | 'ai-competitors'
  | 'ai-governance'
  | 'campaigns'
  | 'content'
  | 'creatives'
  | 'prospecting'
  | 'audiences'
  | 'leads'
  | 'budget'
  | 'attribution'
  | 'automations'
  | 'reports'
  | 'approvals'
  | 'connections'
  | 'settings';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<MarketingTab>('ai-overview');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);

  const TABS: { id: MarketingTab; label: string; icon: any }[] = [
    { id: 'ai-overview', label: 'AI Command Center', icon: Sparkles },
    { id: 'ai-copilot', label: 'AI Copilot', icon: Bot },
    { id: 'ai-recommendations', label: 'AI Recommendations', icon: Sparkles },
    { id: 'ai-budget-optimizer', label: 'Digital Twin & Optimizer', icon: Cpu },
    { id: 'ai-experiments', label: 'A/B & Bandit Experiments', icon: Layers },
    { id: 'ai-creative', label: 'Creative Intelligence', icon: Image },
    { id: 'ai-competitors', label: 'Competitor & Trend Radar', icon: Eye },
    { id: 'ai-governance', label: 'AI Governance & Kill Switch', icon: ShieldCheck },
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'content', label: 'Content Calendar', icon: Calendar },
    { id: 'prospecting', label: 'AI Prospecting', icon: Users },
    { id: 'budget', label: 'Budget Center', icon: DollarSign },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'connections', label: 'Connections', icon: Radio },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Brand/Location Scoping Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-stone-900">Marketing Command Center</h1>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
              Cross-Platform Growth Hub
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Centralized management of Meta, Google Ads, TikTok, Pinterest &amp; organic content for Roberts Enterprises.
          </p>
        </div>

        {/* Global Brand & Location Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs bg-white border border-stone-200 rounded-xl p-1.5 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-stone-400 ml-1" />
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-transparent font-bold text-stone-800 focus:outline-none text-xs"
            >
              <option value="all">All Brands (I Do + Proper)</option>
              <option value="ido">I Do Bridal Couture</option>
              <option value="proper">Proper &amp; Co. Boutique</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-white border border-stone-200 rounded-xl p-1.5 shadow-2xs">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-transparent font-bold text-stone-800 focus:outline-none text-xs"
            >
              <option value="all">All Locations (BR + Cov)</option>
              <option value="ido-br">I Do · Baton Rouge</option>
              <option value="ido-cov">I Do · Covington</option>
              <option value="pc-br">Proper &amp; Co · Baton Rouge</option>
              <option value="pc-cov">Proper &amp; Co · Covington</option>
            </select>
          </div>

          <button
            onClick={() => setShowCampaignWizard(true)}
            className="rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Build Campaign
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-stone-200/80">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-xs font-bold transition-all rounded-xl ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Renderer */}
      <div>
        {activeTab === 'ai-overview' && (
          <AICommandCenterView
            brandFilter={brandFilter}
            onNavigateTab={(tab: string) => setActiveTab(tab as MarketingTab)}
          />
        )}
        {activeTab === 'ai-copilot' && <MarketingCopilotView brandFilter={brandFilter} />}
        {activeTab === 'ai-recommendations' && <RecommendationsView brandFilter={brandFilter} />}
        {activeTab === 'ai-budget-optimizer' && <BudgetOptimizerView brandFilter={brandFilter} />}
        {activeTab === 'ai-experiments' && <ExperimentsView />}
        {activeTab === 'ai-creative' && <CreativeIntelligenceView />}
        {activeTab === 'ai-competitors' && <CompetitorTrendsView brandFilter={brandFilter} />}
        {activeTab === 'ai-governance' && <GovernanceView />}
        {activeTab === 'overview' && (
          <MarketingOverview
            brandFilter={brandFilter}
            locationFilter={locationFilter}
            onNavigateTab={setActiveTab}
            onOpenCampaignWizard={() => setShowCampaignWizard(true)}
          />
        )}
        {activeTab === 'connections' && <ConnectionsView />}
        {activeTab === 'campaigns' && (
          <CampaignsManager
            brandFilter={brandFilter}
            onOpenWizard={() => setShowCampaignWizard(true)}
          />
        )}
        {activeTab === 'content' && <ContentCalendarView />}
        {activeTab === 'creatives' && <CreativeStudioView />}
        {activeTab === 'budget' && <BudgetCenterView brandFilter={brandFilter} locationFilter={locationFilter} />}
        {activeTab === 'attribution' && <AttributionView />}
        {activeTab === 'automations' && <AutomationsView />}
        {activeTab === 'prospecting' && <AIProspectingView brandFilter={brandFilter} />}
        {activeTab === 'reports' && <MarketingReportsView />}
        {activeTab === 'approvals' && <ApprovalsView />}
        {activeTab === 'settings' && <MarketingSettingsView />}
      </div>

      {/* Campaign Wizard Modal */}
      {showCampaignWizard && (
        <CampaignWizardModal
          onClose={() => setShowCampaignWizard(false)}
          onCampaignCreated={() => setActiveTab('campaigns')}
        />
      )}
    </div>
  );
}
