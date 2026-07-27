import { useState } from 'react';
import { Save, Mic, PhoneCall, Volume2, ShieldCheck, Activity, BookOpen, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { btnPrimary } from '@/components/vowos/ui';
import { toast } from '@/components/ui/use-toast';

export default function AIVoiceSettingsView() {
  const [isActive, setIsActive] = useState(false);
  const [greeting, setGreeting] = useState("Hello! You've reached I Do Bridal Couture. I'm Chloe, your virtual bridal concierge. How can I assist you today?");
  const [voicePersona, setVoicePersona] = useState('chloe-luxury');
  const [handleAppointments, setHandleAppointments] = useState(true);
  const [afterHoursOnly, setAfterHoursOnly] = useState(true);
  const [fallbackNumber, setFallbackNumber] = useState('225-555-0199');

  const handleSave = () => {
    toast({
      title: 'AI Voice Configuration Saved',
      description: 'Your Twilio and OpenAI settings have been synchronized.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Mic className="h-5 w-5 text-rose-600" /> AI Voice Receptionist
          </h2>
          <p className="text-xs text-stone-500 mt-1">Configure your 24/7 conversational AI concierge powered by Twilio and GPT-4o.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
             <Activity className="h-3 w-3" /> {isActive ? 'System Active' : 'System Paused'}
          </span>
          <button 
             onClick={() => setIsActive(!isActive)}
             className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isActive ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'}`}
          >
             {isActive ? 'Pause Agent' : 'Activate Agent'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Behavior Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
             <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 text-sm">
               <Volume2 className="h-4 w-4 text-stone-400" /> Agent Persona &amp; Greeting
             </h3>
             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Select Voice Persona</label>
                  <select 
                    value={voicePersona}
                    onChange={(e) => setVoicePersona(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                  >
                     <option value="chloe-luxury">Chloe (Young, Luxury, Enthusiastic)</option>
                     <option value="eleanor-refined">Eleanor (Mature, Refined, Calm)</option>
                     <option value="james-professional">James (Professional, Concierge)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Initial Greeting Message</label>
                  <textarea 
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none min-h-[80px]"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">This is exactly what the AI will say when answering the phone.</p>
                </div>
             </div>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
             <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 text-sm">
               <ShieldCheck className="h-4 w-4 text-stone-400" /> Routing &amp; Capabilities
             </h3>
             
             <div className="space-y-4">
               <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/50 cursor-pointer hover:bg-stone-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={afterHoursOnly}
                    onChange={(e) => setAfterHoursOnly(e.target.checked)}
                    className="mt-1 border-stone-300 rounded text-rose-600 focus:ring-rose-600"
                  />
                  <div>
                    <span className="block text-sm font-bold text-stone-900">After-Hours Only Mode</span>
                    <span className="block text-xs text-stone-500 mt-0.5">When checked, the AI will only answer calls outside of your configured store hours. When unchecked, it answers all calls first.</span>
                  </div>
               </label>

               <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/50 cursor-pointer hover:bg-stone-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={handleAppointments}
                    onChange={(e) => setHandleAppointments(e.target.checked)}
                    className="mt-1 border-stone-300 rounded text-rose-600 focus:ring-rose-600"
                  />
                  <div>
                    <span className="block text-sm font-bold text-stone-900">Autonomous Appointment Booking</span>
                    <span className="block text-xs text-stone-500 mt-0.5">Allow the AI to check calendar availability and book/reschedule fittings directly into VowOS.</span>
                  </div>
               </label>
               
               <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Human Fallback Routing Number</label>
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-stone-400" />
                    <input 
                      type="text" 
                      value={fallbackNumber}
                      onChange={(e) => setFallbackNumber(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none max-w-[200px]"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">If the caller asks to speak to a human or the AI cannot handle the request, it will seamlessly transfer the call here.</p>
               </div>
             </div>
          </div>
          
          <div className="flex justify-end">
            <button onClick={handleSave} className={`${btnPrimary} flex items-center gap-1.5`}>
              <Save className="h-4 w-4" /> Save Configuration
            </button>
          </div>
        </div>

        {/* Right Column: Knowledge Base & Status */}
        <div className="space-y-6">
           <div className="rounded-2xl border border-stone-200/80 bg-stone-900 p-5 shadow-sm text-stone-100">
             <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
               <BookOpen className="h-4 w-4 text-rose-400" /> Knowledge Base Sync
             </h3>
             <p className="text-xs text-stone-400 mb-4 leading-relaxed">
               The AI Agent automatically reads your current active inventory, designer list, store hours, and pricing logic from VowOS to answer caller questions accurately.
             </p>
             <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-300">Inventory Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Synced</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-300">Calendar Availability</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Live</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-300">FAQ Documents</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 14 Docs</span>
                </div>
             </div>
             <button className="w-full mt-5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold text-white flex items-center justify-center gap-1.5 border border-white/5">
                Manage Custom FAQs
             </button>
           </div>
           
           <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
             <h3 className="font-bold text-rose-900 mb-2 flex items-center gap-2 text-sm">
               <Key className="h-4 w-4 text-rose-600" /> Twilio Integration
             </h3>
             <p className="text-xs text-rose-700/80 mb-4">
               A valid Twilio Account SID and API Key are required to provision phone numbers and route calls.
             </p>
             <button className="text-xs font-bold text-rose-700 underline hover:text-rose-800">
               Manage API Keys &rarr;
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}
