import React, { useState } from 'react';
import { Handshake, MessageSquare, FileText, Send, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { btnPrimary } from '@/components/vowos/ui';

export function B2BNegotiationRoom() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Analyzing Justin Alexander Q3 performance... You have a 9.4 overall scorecard and 82% sell-through. You are in a strong position to negotiate a 2% discount on bulk stock orders for Q1.',
      time: '10:00 AM'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setInput('');
    
    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Based on your request, I've drafted an email to the Justin Alexander rep highlighting your strong Q3 sell-through rate and requesting a 2% discount on the upcoming 15-piece stock order. Would you like me to send it?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDraft: true
      }]);
    }, 1500);
  };

  return (
    <div className="flex h-[600px] bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-500">
      
      {/* Sidebar - Active Negotiations */}
      <div className="w-1/3 border-r border-stone-100 bg-stone-50 flex flex-col">
        <div className="p-4 border-b border-stone-200">
          <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <Handshake className="h-5 w-5 text-indigo-500" /> Active Negotiations
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Active Item */}
          <div className="bg-white border border-indigo-200 p-3 rounded-xl shadow-sm cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-stone-900 text-sm">Justin Alexander</h4>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-xs text-stone-500">Q1 Bulk Stock Discount</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <Sparkles className="h-3 w-3" /> Strong Leverage (82% ST)
            </div>
          </div>

          {/* Pending Item */}
          <div className="bg-white border border-stone-200 p-3 rounded-xl shadow-sm cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-stone-900 text-sm">Madi Lane</h4>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">Drafting</span>
            </div>
            <p className="text-xs text-stone-500">Delivery Delay Compensation</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-600">
              <AlertCircle className="h-3 w-3" /> 4 POs Late
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h3 className="font-bold text-stone-900">Justin Alexander - Q1 Bulk Order</h3>
            <p className="text-xs text-stone-500">AI Negotiation Assistant</p>
          </div>
          <button className="text-xs font-bold text-stone-500 bg-white border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors">
            View Scorecard
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className="shrink-0">
                  {msg.sender === 'ai' ? (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-stone-800 flex items-center justify-center text-white text-xs font-bold">
                      ME
                    </div>
                  )}
                </div>
                
                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-stone-900 text-white rounded-tr-sm' 
                      : 'bg-stone-50 border border-stone-200 text-stone-800 rounded-tl-sm'
                  }`}>
                    {msg.text}
                    
                    {msg.isDraft && (
                      <div className="mt-4 bg-white border border-indigo-100 rounded-xl p-4 text-stone-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-indigo-600">
                          <FileText className="h-4 w-4" />
                          <h5 className="font-bold text-xs uppercase tracking-wider">Draft Email</h5>
                        </div>
                        <p className="text-xs text-stone-600 italic">
                          "Hi [Rep Name],<br/><br/>
                          We're finalizing our Q1 stock orders and Justin Alexander remains a top performer for us. In Q3, we achieved an 82% sell-through rate on your styles.<br/><br/>
                          Given this volume, we'd like to request a 2% bulk discount on our upcoming 15-piece order. Let me know if this works so we can get the PO submitted.<br/><br/>
                          Best,<br/>
                          Roberts Enterprises"
                        </p>
                        <div className="mt-4 flex gap-2">
                          <button className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm">
                            <Send className="h-3 w-3" /> Send to Rep
                          </button>
                          <button className="text-xs font-bold bg-white border border-stone-200 text-stone-600 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors shadow-sm">
                            Edit Draft
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1">{msg.time}</span>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-stone-100 bg-white">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask the AI to draft an email, analyze leverage, or suggest terms..."
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button 
              onClick={handleSend}
              className="bg-indigo-600 text-white h-12 w-12 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
