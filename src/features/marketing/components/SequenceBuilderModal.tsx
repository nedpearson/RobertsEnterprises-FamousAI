import React, { useState } from 'react';
import { Mail, MessageSquare, Plus, ArrowDown, Save, X, Clock, Users, PlayCircle, Settings, CheckCircle2 } from 'lucide-react';
import { Modal, btnPrimary } from '@/components/vowos/ui';

interface SequenceBuilderModalProps {
  open: boolean;
  onClose: () => void;
}

type StepType = 'email' | 'sms' | 'delay';

interface SequenceStep {
  id: string;
  type: StepType;
  title: string;
  content: string;
}

export function SequenceBuilderModal({ open, onClose }: SequenceBuilderModalProps) {
  const [sequenceName, setSequenceName] = useState('Post-Appointment Nurture (No Purchase)');
  const [steps, setSteps] = useState<SequenceStep[]>([
    { id: '1', type: 'delay', title: 'Wait 24 Hours', content: '24 hours after appointment' },
    { id: '2', type: 'email', title: 'Thank You Email', content: 'Subject: Thank you for visiting The Boutique! We loved having you...' },
    { id: '3', type: 'delay', title: 'Wait 3 Days', content: '3 days later' },
    { id: '4', type: 'sms', title: 'Follow-up SMS', content: '"Hi [Name], it was great meeting you! Do you have any questions about the gowns you loved?"' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addStep = (type: StepType) => {
    const newStep: SequenceStep = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: type === 'email' ? 'New Email' : type === 'sms' ? 'New SMS' : 'New Delay',
      content: type === 'delay' ? 'Wait 1 Day' : 'Draft content here...'
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal open={open} onClose={onClose} title="Sequence Builder" maxWidth="max-w-4xl">
      <div className="flex flex-col h-[70vh] bg-stone-50/50 -mx-6 -mb-6 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Sequence Name</label>
            <input 
              type="text" 
              value={sequenceName}
              onChange={(e) => setSequenceName(e.target.value)}
              className="font-serif text-2xl font-bold text-stone-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-[400px]"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors shadow-2xs">
              <Settings className="h-4 w-4" /> Trigger Settings
            </button>
            <button 
              onClick={handleSave}
              className={`${btnPrimary} py-2 px-6 shadow-sm`}
            >
              {isSaving ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Sequence</>}
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full space-y-4 relative pb-20">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-emerald-100 text-emerald-800 p-3 rounded-2xl shadow-sm border border-emerald-200 flex items-center gap-3">
              <PlayCircle className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider">Trigger Event</p>
                <p className="text-sm font-bold">Appointment Completed &amp; No Purchase</p>
              </div>
            </div>
          </div>

          {steps.map((step, index) => (
            <div key={step.id} className="relative flex flex-col items-center">
              {/* Connector Line */}
              {index > 0 && <div className="h-8 w-px bg-stone-300" />}

              <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-sm p-4 relative group hover:border-rose-300 hover:shadow-md transition-all">
                <button 
                  onClick={() => removeStep(step.id)}
                  className="absolute top-3 right-3 text-stone-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    step.type === 'email' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    step.type === 'sms' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {step.type === 'email' ? <Mail className="h-5 w-5" /> :
                     step.type === 'sms' ? <MessageSquare className="h-5 w-5" /> :
                     <Clock className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                      {step.type === 'email' ? 'Email Action' : step.type === 'sms' ? 'SMS Action' : 'Time Delay'}
                    </p>
                    <input 
                      type="text" 
                      value={step.title}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index].title = e.target.value;
                        setSteps(newSteps);
                      }}
                      className="font-bold text-stone-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full mb-2 text-sm"
                    />
                    <textarea 
                      value={step.content}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index].content = e.target.value;
                        setSteps(newSteps);
                      }}
                      className="w-full text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-lg p-2 focus:outline-none focus:border-rose-300 resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              {/* Connector arrow below */}
              {index === steps.length - 1 && (
                <>
                  <div className="h-8 w-px bg-stone-300" />
                  <ArrowDown className="h-4 w-4 text-stone-300" />
                </>
              )}
            </div>
          ))}

          <div className="flex justify-center gap-3 mt-8 pt-4">
            <button 
              onClick={() => addStep('email')}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-900 shadow-2xs transition-all"
            >
              <Mail className="h-4 w-4 text-blue-500" /> Add Email
            </button>
            <button 
              onClick={() => addStep('sms')}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-900 shadow-2xs transition-all"
            >
              <MessageSquare className="h-4 w-4 text-emerald-500" /> Add SMS
            </button>
            <button 
              onClick={() => addStep('delay')}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-900 shadow-2xs transition-all"
            >
              <Clock className="h-4 w-4 text-amber-500" /> Add Delay
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
