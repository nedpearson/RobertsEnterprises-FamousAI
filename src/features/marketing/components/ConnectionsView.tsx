import { useState } from 'react';
import {
  MarketingProvider,
  MarketingConnection,
} from '../types/marketingTypes';
import { getMarketingConnections, connectProviderOAuth, disconnectProviderOAuth } from '../api/marketingApi';
import { Modal, btnPrimary, btnSecondary } from '@/components/vowos/ui';
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Lock, Radio } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ConnectionsView() {
  const [connections, setConnections] = useState<MarketingConnection[]>(getMarketingConnections());
  const [activeOAuthProvider, setActiveOAuthProvider] = useState<MarketingProvider | null>(null);
  const [oauthStep, setOauthStep] = useState<1 | 2 | 3>(1);
  const [businessNameInput, setBusinessNameInput] = useState('');

  const handleStartOAuth = (provider: MarketingProvider) => {
    setActiveOAuthProvider(provider);
    setOauthStep(1);
    setBusinessNameInput(
      provider === 'meta'
        ? 'Roberts Enterprises Meta Business Suite'
        : provider === 'google'
        ? 'Roberts Enterprises Google Ads Account'
        : provider === 'tiktok'
        ? 'Proper & Co. TikTok Ads Center'
        : provider === 'pinterest'
        ? 'I Do Bridal Pinterest Business'
        : 'Roberts Enterprises LinkedIn Company'
    );
  };

  const handleSimulateProviderAuth = () => {
    setOauthStep(2);
    setTimeout(() => {
      if (activeOAuthProvider) {
        const updated = connectProviderOAuth(activeOAuthProvider, businessNameInput);
        setConnections(getMarketingConnections());
        setOauthStep(3);
        toast({
          title: `${activeOAuthProvider.toUpperCase()} Connection Successful!`,
          description: `Authorization tokens granted for ${updated.externalBusinessName}.`,
        });
      }
    }, 1200);
  };

  const handleDisconnect = (provider: MarketingProvider) => {
    disconnectProviderOAuth(provider);
    setConnections(getMarketingConnections());
    toast({ title: `${provider.toUpperCase()} Disconnected`, description: 'Access token revoked.' });
  };

  const PROVIDER_TITLES: Record<MarketingProvider, string> = {
    meta: 'Meta Business Suite (Facebook & Instagram)',
    google: 'Google Ads & Analytics 4',
    tiktok: 'TikTok Business Center & Ads',
    pinterest: 'Pinterest Business & Product Catalog',
    linkedin: 'LinkedIn Campaign Manager',
    shopify: 'Shopify E-Commerce Store Connection',
    klaviyo: 'Klaviyo Email & SMS Marketing Platform',
    call_tracking: 'CallRail & Dynamic Phone Call Tracking',
    web_forms: 'VowOS Unified Web Form Ingestion API',
  };

  return (
    <div className="space-y-6 select-none max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Secure Marketing Platform Connections</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Connect Meta, Google, TikTok &amp; Pinterest via official OAuth redirect flows. VowOS never requests or stores platform passwords.
          </p>
        </div>
      </div>

      {/* Security Rule Card */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 text-xs text-rose-900 space-y-1">
        <div className="flex items-center gap-2 font-bold text-rose-800">
          <Lock className="h-4 w-4 text-rose-600" /> VowOS Strict Authentication &amp; Privacy Rule
        </div>
        <p className="text-rose-700 leading-relaxed">
          VowOS connects to marketing platforms strictly via official OAuth authorization codes. All access tokens are encrypted using AES-256 server-side encryption. VowOS never collects, logs, or transmits your Facebook, Instagram, Google, TikTok, or Pinterest passwords.
        </p>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((conn) => {
          const isConnected = conn.status === 'connected';
          return (
            <div
              key={conn.provider}
              className={`rounded-2xl border p-5 shadow-2xs space-y-4 transition-all ${
                isConnected ? 'border-stone-200 bg-white' : 'border-stone-200 bg-stone-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-sm">{PROVIDER_TITLES[conn.provider]}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isConnected ? 'Active & Synced' : 'Disconnected'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {isConnected ? conn.externalBusinessName : 'No active OAuth connection.'}
                  </p>
                </div>
              </div>

              {/* Connected Details */}
              {isConnected && (
                <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Token Health:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {conn.tokenHealth}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Granted Scopes:</span>
                    <span className="font-bold text-stone-800">{conn.grantedScopes.length} Scopes Approved</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Connected Accounts:</span>
                    <span className="font-bold text-stone-800">{conn.accounts.length} Active Accounts</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handleDisconnect(conn.provider)}
                      className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      Disconnect
                    </button>
                    <button
                      onClick={() => handleStartOAuth(conn.provider)}
                      className="rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
                    >
                      Reconnect OAuth
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleStartOAuth(conn.provider)}
                    className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Connect {conn.provider.toUpperCase()}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Official OAuth Simulator Modal */}
      {activeOAuthProvider && (
        <Modal
          open={true}
          onClose={() => setActiveOAuthProvider(null)}
          title={`Official OAuth Connection — ${activeOAuthProvider.toUpperCase()}`}
        >
          <div className="space-y-5 max-w-lg select-none">
            {oauthStep === 1 && (
              <div className="space-y-4">
                <div className="rounded-xl bg-stone-900 p-4 text-white space-y-2">
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                    Step 1: Provider OAuth Redirect Simulation
                  </p>
                  <h4 className="font-bold text-sm text-white">
                    Authorization requested for {activeOAuthProvider.toUpperCase()}
                  </h4>
                  <p className="text-xs text-stone-300">
                    You will be redirected to {activeOAuthProvider.toUpperCase()}’s secure website to verify your identity and approve VowOS scopes.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="block font-bold text-stone-700">Business / Ad Account Name</label>
                  <input
                    type="text"
                    value={businessNameInput}
                    onChange={(e) => setBusinessNameInput(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2.5 font-bold text-stone-900 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setActiveOAuthProvider(null)} className={btnSecondary}>
                    Cancel
                  </button>
                  <button onClick={handleSimulateProviderAuth} className={btnPrimary}>
                    Authorize on {activeOAuthProvider.toUpperCase()} Site →
                  </button>
                </div>
              </div>
            )}

            {oauthStep === 2 && (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-rose-500 mx-auto" />
                <h4 className="font-bold text-stone-900 text-sm">Exchanging OAuth Authorization Code...</h4>
                <p className="text-xs text-stone-500">Exchanging secure authorization code for encrypted tokens on {activeOAuthProvider.toUpperCase()} graph API.</p>
              </div>
            )}

            {oauthStep === 3 && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-stone-900 text-base">Connection Verified &amp; Health Checked!</h4>
                <p className="text-xs text-stone-600">
                  VowOS has received valid OAuth access tokens for <span className="font-bold">{businessNameInput}</span>. Token status is <span className="font-bold text-emerald-600">Healthy</span>.
                </p>
                <button
                  onClick={() => setActiveOAuthProvider(null)}
                  className="w-full rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
                >
                  Return to Marketing Command Center
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
