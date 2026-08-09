import { useState } from 'react';
import { MarketingContentPost } from '../types/marketingTypes';
import { getMarketingContentPosts, createContentPost } from '../api/marketingApi';
import { Calendar as CalendarIcon, Plus, CheckCircle2, Video, Sparkles, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { Modal, btnPrimary, btnSecondary, inputCls } from '@/components/vowos/ui';
import { toast } from '@/components/ui/use-toast';

export default function ContentCalendarView() {
  const [posts, setPosts] = useState<MarketingContentPost[]>(getMarketingContentPosts());
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAiCopilot, setShowAiCopilot] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const [captionInput, setCaptionInput] = useState('');
  const [providerInput, setProviderInput] = useState<'meta' | 'tiktok' | 'pinterest'>('meta');

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiFocus, setAiFocus] = useState('');

  const handleCreatePost = () => {
    if (!captionInput.trim()) return;
    createContentPost({ caption: captionInput, provider: providerInput });
    setPosts(getMarketingContentPosts());
    setShowNewModal(false);
    setShowAiCopilot(false);
    setCaptionInput('');
    toast({ title: 'Post Scheduled!', description: 'Social content post added to calendar.' });
  };

  const generateContent = () => {
    if (!aiFocus.trim()) return;
    setAiGenerating(true);
    setTimeout(() => {
      let generated = '';
      if (providerInput === 'tiktok') {
        generated = `POV: You just found the perfect dress ✨\n\nThe details on this ${aiFocus} gown are absolutely unreal. Tap the link in our bio to book your private fitting.\n\n#WeddingDress #BrideToBe #2026Bride #${aiFocus.replace(/\s+/g, '')}`;
      } else if (providerInput === 'pinterest') {
        generated = `Obsessed with the intricate details of the ${aiFocus} collection. Pin this to your dream wedding board and visit I Do Bridal Couture to try it on in person.\n\n#BridalStyle #WeddingInspiration #${aiFocus.replace(/\s+/g, '')}`;
      } else {
        generated = `Say yes to ${aiFocus} 🤍\n\nWe are swooning over the new arrivals. Which neckline is your favorite? Let us know in the comments below!\n\nBook your bridal appointment at the link in bio.\n\n#IDoBridalCouture #BridalBoutique #${aiFocus.replace(/\s+/g, '')}`;
      }
      setCaptionInput(generated);
      setAiGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-5 select-none max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Social Content Engine</h2>
          <p className="text-xs text-stone-500">Plan, schedule, and generate organic posts across Instagram, TikTok &amp; Pinterest.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 rounded-lg p-1 border border-stone-200">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setShowAiCopilot(true)}
            className="rounded-xl bg-violet-100 border border-violet-200 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="h-4 w-4" /> AI Co-Pilot
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Manual Post
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => (
            <div key={p.id} className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-bold uppercase text-[10px] text-stone-700">
                  {p.provider}
                </span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {new Date(p.scheduledAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-3">
                <img src={p.mediaUrl} alt="Post media" className="h-20 w-20 rounded-xl object-cover border border-stone-200 flex-shrink-0" />
                <p className="text-xs text-stone-700 leading-relaxed line-clamp-4 whitespace-pre-wrap">{p.caption}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <h3 className="font-bold text-stone-900 text-sm text-center mb-6">Instagram &amp; TikTok Grid Preview</h3>
            <div className="grid grid-cols-3 gap-1 md:gap-3">
              {posts.map((p) => (
                <div key={p.id} className="aspect-square relative group rounded-xl overflow-hidden cursor-pointer">
                  <img src={p.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                    <p className="text-white text-[10px] md:text-xs font-medium line-clamp-4">{p.caption}</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/40 backdrop-blur rounded p-1">
                    {p.provider === 'tiktok' ? <Video className="h-3 w-3 text-white" /> : <LayoutGrid className="h-3 w-3 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Copilot Modal */}
      <Modal open={showAiCopilot} onClose={() => setShowAiCopilot(false)} title="AI Content Co-Pilot" size="md">
        <div className="space-y-5 select-none -mt-2">
          <div className="bg-violet-50 border border-violet-100 p-4 rounded-xl flex items-start gap-3 text-violet-900 text-sm">
            <Sparkles className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
            <p><strong>Let AI write your next viral post.</strong> Select a platform and tell us what you're featuring (e.g., "Monique Lhuillier Fall 2026"), and we'll generate the caption, hashtags, and hooks.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-stone-700">Platform Optimized For</label>
              <select value={providerInput} onChange={(e) => setProviderInput(e.target.value as any)} className={inputCls}>
                <option value="meta">Instagram / Facebook (Visual, Engagement)</option>
                <option value="tiktok">TikTok (Trendy, Hook-driven)</option>
                <option value="pinterest">Pinterest (Inspirational, SEO Keywords)</option>
              </select>
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-stone-700">Feature Focus (Designer / Style)</label>
              <input value={aiFocus} onChange={(e) => setAiFocus(e.target.value)} placeholder="e.g. Ines Di Santo ballgowns" className={inputCls} />
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button onClick={generateContent} disabled={!aiFocus.trim() || aiGenerating} className={`${btnSecondary} border-violet-200 text-violet-700 hover:bg-violet-50 disabled:opacity-50 w-full justify-center`}>
              {aiGenerating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {aiGenerating ? 'Generating magic...' : 'Generate Copy & Hashtags'}
            </button>
          </div>

          <div className="space-y-1.5 text-xs pt-2">
            <label className="block font-bold text-stone-700">Generated Caption</label>
            <textarea
              rows={6}
              value={captionInput}
              onChange={(e) => setCaptionInput(e.target.value)}
              placeholder="Your generated content will appear here..."
              className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs font-medium text-stone-900 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button onClick={() => setShowAiCopilot(false)} className={btnSecondary}>Cancel</button>
            <button onClick={handleCreatePost} disabled={!captionInput.trim()} className={btnPrimary}>Schedule to Calendar</button>
          </div>
        </div>
      </Modal>

      {/* Standard Manual Modal */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Schedule New Organic Post">
        <div className="space-y-4 select-none">
          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-stone-700">Platform</label>
            <select value={providerInput} onChange={(e) => setProviderInput(e.target.value as any)} className={inputCls}>
              <option value="meta">Meta (Instagram / Facebook)</option>
              <option value="tiktok">TikTok</option>
              <option value="pinterest">Pinterest</option>
            </select>
          </div>
          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-stone-700">Post Caption &amp; Hashtags</label>
            <textarea rows={5} value={captionInput} onChange={(e) => setCaptionInput(e.target.value)} placeholder="Write your post caption..." className={`${inputCls} resize-none`} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNewModal(false)} className={btnSecondary}>Cancel</button>
            <button onClick={handleCreatePost} className={btnPrimary}>Schedule Post</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
