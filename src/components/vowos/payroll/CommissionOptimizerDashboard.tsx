import React, { useState } from 'react';
import { Trophy, TrendingUp, Target, DollarSign, ArrowRight, Zap, Users } from 'lucide-react';
import { Modal, btnPrimary } from '@/components/vowos/ui';

interface CommissionOptimizerDashboardProps {
  open: boolean;
  onClose: () => void;
}

export function CommissionOptimizerDashboard({ open, onClose }: CommissionOptimizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities'>('overview');

  return (
    <Modal open={open} onClose={onClose} title="Commission Optimizer" size="lg">
      <div className="flex flex-col min-h-[550px]">
        {/* Header Section */}
        <div className="bg-stone-900 text-white p-6 -mt-4 -mx-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 p-2 rounded-xl backdrop-blur border border-amber-500/30">
                <Trophy className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold">Commission & Incentive Optimizer</h2>
                <p className="text-xs text-stone-300 mt-0.5">Real-time projections & target tracking.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Current Tier</p>
              <div className="flex items-center gap-1.5 mt-1 bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-sm font-bold text-white">Tier 2 (4.5%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 mb-6 gap-6 px-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'overview' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-800'}`}
          >
            My Performance
          </button>
          <button 
            onClick={() => setActiveTab('opportunities')}
            className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'opportunities' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-800'}`}
          >
            Next-Tier Opportunities <span className="ml-1 bg-rose-100 text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full">3</span>
          </button>
        </div>

        <div className="flex-1 px-2 overflow-y-auto pb-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Progress to Next Tier */}
              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="text-stone-900 font-bold flex items-center gap-2">
                      <Target className="h-4 w-4 text-stone-400" /> Progress to Tier 3 (5.5%)
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">You are $4,250 away from unlocking your next bonus tier.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-bold text-amber-600">$20,750</p>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">/ $25,000 Goal</p>
                  </div>
                </div>
                <div className="h-3 w-full bg-stone-100 rounded-full mt-4 overflow-hidden border border-stone-200/60">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: '83%' }}></div>
                </div>
              </div>

              {/* Commission Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl text-center">
                  <div className="inline-flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full h-8 w-8 mb-2">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-stone-500 uppercase">Earned MTD</p>
                  <p className="font-serif text-xl font-bold text-stone-900 mt-1">$933.75</p>
                </div>
                <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl text-center">
                  <div className="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full h-8 w-8 mb-2">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-stone-500 uppercase">Projected End of Month</p>
                  <p className="font-serif text-xl font-bold text-stone-900 mt-1">$1,450.00</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-900 text-sm">
                <Zap className="h-5 w-5 text-amber-500 shrink-0" />
                <p>
                  <strong>AI Insight:</strong> Closing just 2 of these highly-engaged leads before Friday will bump you into Tier 3 (5.5% commission rate).
                </p>
              </div>

              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-6 mb-2">High-Probability Leads</h4>
              
              <div className="space-y-3">
                {/* Lead 1 */}
                <div className="border border-stone-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-stone-100 h-10 w-10 rounded-full flex items-center justify-center text-stone-500 font-bold">
                      SJ
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-sm">Sarah Jenkins</p>
                      <p className="text-xs text-stone-500 mt-0.5">Had 2nd fitting • Favorited $2,800 Gown</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1">
                    Send SMS <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Lead 2 */}
                <div className="border border-stone-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-stone-100 h-10 w-10 rounded-full flex items-center justify-center text-stone-500 font-bold">
                      MR
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-sm">Megan Reynolds</p>
                      <p className="text-xs text-stone-500 mt-0.5">Opened last 3 emails • Budget: $3,500</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1">
                    Send SMS <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Lead 3 */}
                <div className="border border-stone-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between opacity-75">
                  <div className="flex items-center gap-4">
                    <div className="bg-stone-100 h-10 w-10 rounded-full flex items-center justify-center text-stone-500 font-bold">
                      LT
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-sm">Lauren Thompson</p>
                      <p className="text-xs text-stone-500 mt-0.5">Appointment tomorrow • High intent</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold border border-stone-200 text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-stone-100">
          <button onClick={onClose} className={`${btnPrimary} w-full justify-center`}>Back to Dashboard</button>
        </div>
      </div>
    </Modal>
  );
}
