import React, { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, AlertCircle, Loader2, CheckCircle2, ChevronRight, Calculator, Clock } from 'lucide-react';
import { Modal, btnPrimary } from '@/components/vowos/ui';

interface PredictiveScheduleEngineProps {
  open: boolean;
  onClose: () => void;
}

export function PredictiveScheduleEngine({ open, onClose }: PredictiveScheduleEngineProps) {
  const [step, setStep] = useState<'analyzing' | 'results' | 'optimizing' | 'success'>('analyzing');

  useEffect(() => {
    if (open) {
      setStep('analyzing');
      setTimeout(() => setStep('results'), 2800);
    }
  }, [open]);

  const handleOptimize = () => {
    setStep('optimizing');
    setTimeout(() => setStep('success'), 2500);
  };

  const renderContent = () => {
    switch (step) {
      case 'analyzing':
        return (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="bg-white p-6 rounded-full shadow-2xl relative border border-stone-100">
                <Calculator className="h-12 w-12 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h3 className="mt-8 font-serif text-2xl font-bold text-stone-900">Predicting Foot Traffic...</h3>
            <p className="mt-2 text-stone-500 text-center max-w-sm">Correlating upcoming appointments, local events, and active marketing spend against scheduled labor.</p>
          </div>
        );

      case 'results':
        return (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-start gap-4">
              <div className="bg-rose-600 rounded-full p-2 text-white shadow-sm mt-1">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-rose-900">Labor Inefficiencies Detected</h3>
                <p className="text-sm text-rose-800 mt-2">
                  This week's schedule has <strong>2 critical mismatches</strong> between scheduled staff and predicted foot traffic. Fixing these will save $320 in unnecessary labor costs and prevent weekend burnout.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Schedule Adjustments</h4>
              
              <div className="border border-stone-200 rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-3 border-b border-stone-100 pb-3">
                  <div>
                    <h5 className="font-bold text-stone-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-rose-500" /> Over-staffed: Tuesday AM
                    </h5>
                    <p className="text-xs text-stone-500 mt-1">4 Stylists Scheduled • 1 Appointment Booked</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Potential Savings</p>
                    <p className="font-serif font-bold text-emerald-600">+$120.00</p>
                  </div>
                </div>
                
                <div className="bg-stone-50 rounded-lg p-3 border border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase">AI Recommendation</p>
                    <p className="text-xs font-bold text-stone-900 mt-1">Ask Megan R. or Lauren T. if they want the morning off.</p>
                  </div>
                  <button className="text-[10px] font-bold bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-stone-50">Send Offer</button>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-3 border-b border-stone-100 pb-3">
                  <div>
                    <h5 className="font-bold text-stone-900 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" /> Under-staffed: Saturday PM
                    </h5>
                    <p className="text-xs text-stone-500 mt-1">3 Stylists Scheduled • 9 Appointments Booked</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Risk Level</p>
                    <p className="font-serif font-bold text-rose-600">High</p>
                  </div>
                </div>
                
                <div className="bg-stone-50 rounded-lg p-3 border border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase">AI Recommendation</p>
                    <p className="text-xs font-bold text-stone-900 mt-1">Call in 1 float stylist or enable "Double Booking" mode.</p>
                  </div>
                  <button className="text-[10px] font-bold bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-stone-50">Request Cover</button>
                </div>
              </div>

            </div>

            <button 
              onClick={handleOptimize}
              className={`${btnPrimary} w-full justify-center py-3 mt-4 text-sm`}
            >
              Auto-Optimize Schedule
            </button>
          </div>
        );

      case 'optimizing':
        return (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <h3 className="mt-8 font-serif text-xl font-bold text-stone-900">Adjusting Schedule...</h3>
            <p className="mt-2 text-sm text-stone-500">Sending SMS offers to staff and updating shift blocks.</p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-500 text-center">
            <div className="bg-emerald-100 p-4 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
            <h3 className="mt-6 font-serif text-2xl font-bold text-stone-900">Optimization Complete</h3>
            <p className="mt-2 text-stone-600 max-w-sm">
              Staff have been notified of shift opportunities. The calendar will automatically update when they accept.
            </p>
            <button 
              onClick={onClose}
              className={`${btnPrimary} w-full justify-center py-3 mt-8 text-sm`}
            >
              Back to Payroll View
            </button>
          </div>
        );
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Predictive Schedule Engine" size="lg">
      <div className="flex flex-col min-h-[500px]">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 -mt-4 -mx-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold">Predictive Labor Engine</h2>
              <p className="text-xs text-stone-300 mt-0.5">Match staffing levels to actual predicted foot traffic.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-2 pb-4">
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
}
