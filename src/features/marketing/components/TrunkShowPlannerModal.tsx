import React, { useState, useEffect } from 'react';
import { CalendarDays, BarChart3, Mail, MessageSquare, TrendingUp, Sparkles, Loader2, Target, CheckCircle2, Facebook, Video, MapPin, Search } from 'lucide-react';
import { Modal, btnPrimary } from '@/components/vowos/ui';

interface TrunkShowPlannerModalProps {
  open: boolean;
  onClose: () => void;
}

export function TrunkShowPlannerModal({ open, onClose }: TrunkShowPlannerModalProps) {
  const [step, setStep] = useState<'analysis' | 'recommendation' | 'generation' | 'ready'>('analysis');

  useEffect(() => {
    if (open) {
      setStep('analysis');
      setTimeout(() => setStep('recommendation'), 2500);
    }
  }, [open]);

  const handleGenerateCampaign = () => {
    setStep('generation');
    setTimeout(() => setStep('ready'), 3500);
  };

  const renderContent = () => {
    switch (step) {
      case 'analysis':
        return (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="bg-white p-6 rounded-full shadow-2xl relative border border-stone-100">
                <BarChart3 className="h-12 w-12 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h3 className="mt-8 font-serif text-2xl font-bold text-stone-900">Analyzing Sales Data...</h3>
            <p className="mt-2 text-stone-500">Reviewing last 12 months of bridal sales, designer performance, and lead flow.</p>
          </div>
        );

      case 'recommendation':
        return (
          <div className="animate-in fade-in duration-500">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4 mb-6">
              <div className="bg-blue-600 rounded-full p-2 text-white shadow-sm mt-1">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-blue-900">AI Recommendation: Monique Lhuillier</h3>
                <p className="text-sm text-blue-800 mt-2">
                  Based on a <strong>34% increase</strong> in inquiries for luxury floral lace and a <strong>92% sell-through rate</strong> on Monique Lhuillier last quarter, hosting a trunk show in late October will maximize Q4 revenue.
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100 text-center">
                    <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Est. Revenue</p>
                    <p className="font-serif text-xl font-bold text-emerald-600">$45,000</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100 text-center">
                    <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Target Audience</p>
                    <p className="font-serif text-xl font-bold text-blue-600">214 Brides</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerateCampaign}
              className={`${btnPrimary} w-full justify-center py-4 text-base shadow-lg`}
            >
              Generate Full Marketing Campaign <Sparkles className="h-4 w-4 ml-2" />
            </button>
          </div>
        );

      case 'generation':
        return (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <h3 className="mt-8 font-serif text-xl font-bold text-stone-900">Drafting Campaign Assets...</h3>
            <div className="mt-4 space-y-2 text-sm text-stone-500">
              <p className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Identifying high-value past leads</p>
              <p className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Writing VIP SMS invitations</p>
              <p className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Designing Facebook Ad copy</p>
              <p className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Generating TikTok Video scripts</p>
              <p className="flex items-center gap-2 animate-pulse"><Target className="h-4 w-4" /> Optimizing Google & Pinterest Ads...</p>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Campaign Assets Generated & Saved to Marketing Dashboard!
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Card */}
              <div className="border border-stone-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-stone-900 font-bold mb-3 border-b border-stone-100 pb-2">
                  <Mail className="h-4 w-4 text-rose-500" /> Announcement Email
                </div>
                <div className="text-xs space-y-2">
                  <p><strong>Subject:</strong> 🥂 You're Invited: Exclusive Monique Lhuillier Trunk Show</p>
                  <p className="text-stone-600 line-clamp-3">
                    Dear [Bride], we noticed you favorited several luxury lace gowns during your last visit. We are thrilled to invite you to our exclusive Monique Lhuillier Fall 2026 Trunk Show. For one weekend only...
                  </p>
                </div>
                <button className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800">Edit Email</button>
              </div>

              {/* SMS Card */}
              <div className="border border-stone-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-stone-900 font-bold mb-3 border-b border-stone-100 pb-2">
                  <MessageSquare className="h-4 w-4 text-emerald-500" /> VIP SMS Invite
                </div>
                <div className="text-xs space-y-2">
                  <p className="text-stone-600">
                    "Hi [Name], Ramsey from I Do Bridal here! We're hosting a Monique Lhuillier Trunk Show Oct 24-26. I immediately thought of your Pinterest board. Tap to book a VIP fitting: [Link]"
                  </p>
                  <p className="text-[10px] text-stone-400 font-bold">TARGET: 45 'Warm' Leads</p>
                </div>
                <button className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800">Edit SMS</button>
              </div>

              {/* Facebook Ad Card */}
              <div className="border border-stone-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-stone-900 font-bold mb-3 border-b border-stone-100 pb-2">
                  <Facebook className="h-4 w-4 text-blue-600" /> Facebook & Instagram Ads
                </div>
                <div className="text-xs space-y-2 flex flex-col gap-2">
                  <img src="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=200" alt="Ad Creative" className="w-full h-24 object-cover rounded-lg" />
                  <div>
                    <p><strong>Headline:</strong> Say Yes to Monique Lhuillier 💍</p>
                    <p className="text-stone-600 mt-1 line-clamp-2">
                      For one weekend only, shop the unreleased Fall 2026 collection...
                    </p>
                    <p className="text-[10px] text-stone-400 font-bold mt-2">AUDIENCE: Engaged Women, 50mi</p>
                  </div>
                </div>
              </div>

              {/* TikTok Card */}
              <div className="border border-stone-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-stone-900 font-bold mb-3 border-b border-stone-100 pb-2">
                  <Video className="h-4 w-4 text-stone-900" /> TikTok Script & Brief
                </div>
                <div className="text-xs space-y-2">
                  <p><strong>Hook (0-3s):</strong> "POV: You found the perfect floral lace gown." (Show quick zoom on lace detail)</p>
                  <p className="text-stone-600">
                    <strong>Body (3-10s):</strong> Quick transitions showing 3 different Monique Lhuillier gowns on mannequins. Text overlay: "Trunk Show This Weekend Only".
                  </p>
                  <p className="text-[10px] text-stone-400 font-bold mt-2">AUDIO: Trending acoustic cover</p>
                </div>
                <button className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800">Edit Script</button>
              </div>

              {/* Pinterest Card */}
              <div className="border border-stone-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-stone-900 font-bold mb-3 border-b border-stone-100 pb-2">
                  <MapPin className="h-4 w-4 text-red-600" /> Pinterest Promoted Pin
                </div>
                <div className="text-xs space-y-2">
                  <p><strong>Pin Title:</strong> 2026 Luxury Bridal Trends: Monique Lhuillier</p>
                  <p className="text-stone-600">
                    Discover the ultimate romantic lace and dramatic silhouettes. Book your exclusive trunk show fitting in Baton Rouge.
                  </p>
                  <p className="text-[10px] text-stone-400 font-bold mt-2">KEYWORDS: Bridal Gowns, Lace Wedding Dress</p>
                </div>
              </div>

              {/* Google Ads Card */}
              <div className="border border-stone-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-stone-900 font-bold mb-3 border-b border-stone-100 pb-2">
                  <Search className="h-4 w-4 text-blue-500" /> Google Search Ads
                </div>
                <div className="text-xs space-y-2">
                  <p><strong>H1:</strong> Monique Lhuillier Trunk Show | <strong>H2:</strong> I Do Bridal Couture</p>
                  <p className="text-stone-600">
                    Shop the unreleased Fall 2026 collection this weekend. Exclusive discounts and VIP fittings. Book your appointment today!
                  </p>
                  <p className="text-[10px] text-stone-400 font-bold mt-2">KEYWORDS: Monique Lhuillier near me, Designer bridal</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <button onClick={onClose} className={`${btnPrimary} w-full justify-center`}>Go to Marketing Dashboard</button>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Smart Trunk Show Planner">
      <div className="flex flex-col min-h-[500px]">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 -mt-4 -mx-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold">AI Trunk Show Planner</h2>
              <p className="text-xs text-stone-300 mt-0.5">Data-driven event curation & campaign generation.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-2">
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
}
