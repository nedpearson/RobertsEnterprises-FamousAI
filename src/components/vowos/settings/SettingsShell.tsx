import { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '../ui';
import { SettingsNavigation, SettingsTab } from './SettingsNavigation';
import { StickySaveBar } from './components/StickySaveBar';
import { OrgSettingsTab } from './tabs/OrganizationSettings';
import { LocationSettingsTab } from './tabs/LocationSettings';
import { PaymentsSettingsTab } from './tabs/PaymentsSettings';
import { BookingSettingsTab } from './tabs/BookingSettings';
import { PlaceholderTab } from './tabs/PlaceholderTab';
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
      default:
        // Clear save fn for placeholder tabs
        saveFnRef.current = null;
        return <PlaceholderTab tab={activeTab} />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'organization': return 'Organization Settings';
      case 'locations': return 'Location Configuration';
      case 'payments': return 'Payments & Taxes';
      case 'booking': return 'Online Booking';
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
