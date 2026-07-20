import { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '../ui';
import { SettingsNavigation, SettingsTab } from './SettingsNavigation';
import { StickySaveBar } from './components/StickySaveBar';
import { OrgSettingsTab } from './tabs/OrganizationSettings';
import { LocationSettingsTab } from './tabs/LocationSettings';
import { PaymentsSettingsTab } from './tabs/PaymentsSettings';
import { BookingSettingsTab } from './tabs/BookingSettings';
import { AvailabilityRulesTab } from './tabs/AvailabilityRulesTab';
import { AlterationsSettingsTab } from './tabs/AlterationsSettingsTab';
import { SalesSettingsTab } from './tabs/SalesSettingsTab';
import { CommissionSettingsTab } from './tabs/CommissionSettingsTab';
import { InventorySettingsTab } from './tabs/InventorySettingsTab';
import { PurchasingSettingsTab } from './tabs/PurchasingSettingsTab';
import { TransfersSettingsTab } from './tabs/TransfersSettingsTab';
import { CommunicationsSettingsTab } from './tabs/CommunicationsSettingsTab';
import { AutomationsSettingsTab } from './tabs/AutomationsSettingsTab';
import { NotificationsSettingsTab } from './tabs/NotificationsSettingsTab';
import { DocumentsSettingsTab } from './tabs/DocumentsSettingsTab';
import { IntegrationsSettingsTab } from './tabs/IntegrationsSettingsTab';
import { ReportingSettingsTab } from './tabs/ReportingSettingsTab';
import { SecuritySettingsTab } from './tabs/SecuritySettingsTab';
import { DataSettingsTab } from './tabs/DataSettingsTab';
import { AuditSettingsTab } from './tabs/AuditSettingsTab';
import { SystemHealthSettingsTab } from './tabs/SystemHealthSettingsTab';
import { FeatureFlagsSettingsTab } from './tabs/FeatureFlagsSettingsTab';
import { Search } from 'lucide-react';
import { inputCls } from '../ui';

export default function SettingsShell() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('organization');
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Ref to hold the save function of the active tab
  const saveFnRef = useRef<(() => Promise<boolean>) | null>(null);

  const registerSaveFn = (fn: () => Promise<boolean>) => {
    saveFnRef.current = fn;
  };

  const handleTabChange = (tab: SettingsTab) => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Discard changes?')) {
        setIsDirty(false);
        setActiveTab(tab);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const handleSave = async (reason?: string) => {
    if (saveFnRef.current) {
      setSaving(true);
      const ok = await saveFnRef.current(reason);
      setSaving(false);
      if (ok) {
        setIsDirty(false);
      }
    }
  };

  const handleCancel = () => {
    // Increment resetTrigger to trigger a reload in the active tab
    setResetTrigger((prev) => prev + 1);
    setIsDirty(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'organization':
        return (
          <OrgSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'locations':
        return (
          <LocationSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'payments':
        return (
          <PaymentsSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'booking':
        return (
          <BookingSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'scheduling':
        return (
          <AvailabilityRulesTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'alterations':
        return (
          <AlterationsSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'sales':
        return (
          <SalesSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'commission':
        return (
          <CommissionSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'inventory':
        return (
          <InventorySettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'purchasing':
        return (
          <PurchasingSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'transfers':
        return (
          <TransfersSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'communications':
        return (
          <CommunicationsSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'automations':
        return (
          <AutomationsSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'notifications':
        return (
          <NotificationsSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'documents':
        return (
          <DocumentsSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'integrations':
        return (
          <IntegrationsSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'reporting':
        return (
          <ReportingSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'security':
        return (
          <SecuritySettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'data':
        return (
          <DataSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      case 'audit':
        saveFnRef.current = null;
        return <AuditSettingsTab />;
      case 'system-health':
        saveFnRef.current = null;
        return <SystemHealthSettingsTab />;
      case 'feature-flags':
        return (
          <FeatureFlagsSettingsTab
            onDirtyChange={setIsDirty}
            registerSaveRef={registerSaveFn}
            resetTrigger={resetTrigger}
          />
        );
      default:
        saveFnRef.current = null;
        return null;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'organization': return 'Organization Settings';
      case 'locations': return 'Location Configuration';
      case 'payments': return 'Payments & Taxes';
      case 'booking': return 'Online Booking';
      case 'scheduling': return 'Availability Rules';
      case 'alterations': return 'Alterations & Pickups';
      case 'sales': return 'Sales & Invoicing';
      case 'commission': return 'Commission Plans';
      case 'inventory': return 'Inventory Rules';
      case 'purchasing': return 'Purchasing & Vendor';
      case 'transfers': return 'Store Transfers';
      case 'communications': return 'Channels & Twilio';
      case 'automations': return 'Automation Rules';
      case 'notifications': return 'Notifications';
      case 'documents': return 'Documents & Templates';
      case 'integrations': return 'Integrations & AI';
      case 'reporting': return 'Reporting Settings';
      case 'security': return 'Security Policy';
      case 'data': return 'Data & Import';
      case 'audit': return 'Audit Log';
      case 'system-health': return 'System Health';
      case 'feature-flags': return 'Feature Flags';
      default:
        return activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ');
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'organization': return 'Manage corporate settings and primary parameters.';
      case 'locations': return 'Configure storefront boutiques, individual operating hours and holidays.';
      case 'payments': return 'Control payment methods, card processing surcharges, and tax jurisdictions.';
      case 'booking': return 'Establish availability noticed, booking limits, and intake questions.';
      case 'scheduling': return 'Set up default durations, cooldown buffers, and booking thresholds.';
      case 'alterations': return 'Define alterations pricing, fitting schedules, and pickup templates.';
      case 'sales': return 'Configure numbering formats, discount guidelines, and standard terms.';
      case 'commission': return 'Establish tiered commission rates andGoal-based bonuses.';
      case 'inventory': return 'Manage SKU formats, barcode symbologies, and stock targets.';
      case 'purchasing': return 'Configure designer lead times, contacts, and purchase orders.';
      case 'transfers': return 'Set store transfer rules, approval thresholds, and packaging parameters.';
      case 'communications': return 'Expose Twilio SID, verify webhook loops, and configure channels.';
      case 'automations': return 'Manage automated triggers for SMS followups and client reminders.';
      case 'notifications': return 'Define default staff category and location notification preferences.';
      case 'documents': return 'Configure layouts, terms of sale, and typography of PDF outputs.';
      case 'integrations': return 'Link third party services and configure OpenAI models.';
      case 'reporting': return 'Configure fiscal calendar start dates and cost visibility guidelines.';
      case 'security': return 'Establish password complexities, lockout limits, and session lifespan.';
      case 'data': return 'Manage data retention limits and spreadsheet import matching.';
      case 'audit': return 'Timeline of setting changes, actors, and reasons.';
      case 'system-health': return 'Monitor database connection state, integration adapters, and run checks.';
      case 'feature-flags': return 'Enable experimental rollouts for testing new features.';
      default:
        return 'Manage and configure VowOS platform options.';
    }
  };

  // Determine if active tab is sensitive
  const isSensitiveTab = ['organization', 'payments', 'security', 'integrations'].includes(activeTab);

  return (
    <div className="min-h-screen bg-stone-50/50 pb-24">
      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
        
        {/* Left Column: Settings Navigation Menu */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputCls} pl-9`}
            />
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
            <SettingsNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
              userRole={profile?.role || 'Stylist'}
            />
          </div>
        </div>

        {/* Right Column: Settings Tab Content */}
        <div className="flex-1 space-y-6">
          <PageHeader
            title={getTabTitle()}
            subtitle={getTabSubtitle()}
          />
          {renderTabContent()}
        </div>
      </div>

      <StickySaveBar
        show={isDirty}
        saving={saving}
        onSave={handleSave}
        onCancel={handleCancel}
        isSensitive={isSensitiveTab}
      />
    </div>
  );
}
