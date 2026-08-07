import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useVowosData } from '@/contexts/VowosDataContext';
import { useDeviceMode } from '@/contexts/DeviceModeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { fetchActions, ActionCenterRecord, updateActionStatus } from '@/lib/services/actionCenterService';
import { ShieldCheck, AlertCircle, Clock, CheckCircle2, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case 'Critical': return <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">Critical</span>;
    case 'High': return <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 ring-1 ring-inset ring-orange-600/20">High</span>;
    case 'Medium': return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">Medium</span>;
    case 'Low': return <span className="inline-flex items-center rounded-full bg-stone-50 px-2 py-1 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-500/20">Low</span>;
    default: return <span className="inline-flex items-center rounded-full bg-stone-50 px-2 py-1 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-500/20">{priority}</span>;
  }
}

export default function ActionCenter() {
  const { session, profile } = useAuth();
  const { activeBusinessId, activeLocation } = useVowosData();
  const { isDesktopModeOverride } = useDeviceMode();
  const isMobileViewport = useIsMobile();
  const showMobileView = isMobileViewport && !isDesktopModeOverride;
  const navigate = useNavigate();

  const [actions, setActions] = useState<ActionCenterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionCenterRecord | null>(null);

  useEffect(() => {
    if (!activeBusinessId) return;
    setLoading(true);
    fetchActions(activeBusinessId, activeLocation)
      .then(data => {
        setActions(data);
        setError(false);
        setSelectedAction(prev => {
          if (data.length > 0 && !prev) return data[0];
          if (data.length === 0) return null;
          return prev;
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [activeBusinessId, activeLocation]);

  const handleActionClick = (action: ActionCenterRecord) => {
    if (showMobileView) {
      // On mobile, maybe open full screen overlay or just deep link immediately if there's only one action
      navigate(action.deep_link);
    } else {
      setSelectedAction(action);
    }
  };

  const markComplete = async (actionId: string) => {
    const success = await updateActionStatus(actionId, 'Completed');
    if (success) {
      setActions(actions.filter(a => a.id !== actionId));
      if (selectedAction?.id === actionId) {
        setSelectedAction(null);
      }
    }
  };

  if (!profile || (profile.role !== 'Owner' && profile.role !== 'Manager')) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <ShieldCheck className="h-12 w-12 text-stone-300" />
        <h2 className="mt-4 text-xl font-semibold text-stone-900">Permission Denied</h2>
        <p className="mt-2 text-sm text-stone-500">You do not have permission to view the Action Center.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="mt-4 text-xl font-semibold text-stone-900">We could not load the Action Center.</h2>
        <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm text-white">Retry</button>
      </div>
    );
  }

  const urgentCount = actions.filter(a => a.priority === 'Critical').length;
  const dueTodayCount = actions.filter(a => a.due_at && new Date(a.due_at).toDateString() === new Date().toDateString()).length;
  const myActionsCount = actions.filter(a => a.assigned_user_id === profile.id).length;
  const approvalCount = actions.filter(a => a.requires_approval).length;

  const content = (
    <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
      {/* Left Column (Categories) - Desktop only */}
      {!showMobileView && (
        <div className="w-64 border-r border-stone-200 bg-white/50 p-4 overflow-y-auto">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Views</h3>
          <ul className="space-y-1">
            <li><button className="flex w-full items-center justify-between rounded-md bg-stone-100 px-3 py-2 text-sm font-medium text-stone-900"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-rose-500" /> Urgent</span> {urgentCount > 0 && <span className="text-xs text-rose-600">{urgentCount}</span>}</button></li>
            <li><button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"><span className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Due Today</span> {dueTodayCount > 0 && <span className="text-xs text-amber-600">{dueTodayCount}</span>}</button></li>
            <li><button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50">My Actions {myActionsCount > 0 && <span className="text-xs font-bold">{myActionsCount}</span>}</button></li>
            <li><button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50">Approvals {approvalCount > 0 && <span className="text-xs font-bold">{approvalCount}</span>}</button></li>
          </ul>
        </div>
      )}

      {/* Center Column (Action List) */}
      <div className={`${showMobileView ? 'w-full' : 'w-1/2 max-w-lg border-r'} border-stone-200 bg-white flex flex-col overflow-hidden`}>
        {loading ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-stone-300" />
          </div>
        ) : actions.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            <h3 className="mt-4 text-lg font-semibold text-stone-900">You're All Caught Up</h3>
            <p className="mt-2 text-sm text-stone-500">There are no open actions for the selected business, location, and filters.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {actions.map(action => (
              <div 
                key={action.id} 
                onClick={() => handleActionClick(action)}
                className={`cursor-pointer rounded-xl border p-4 transition-colors ${selectedAction?.id === action.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-stone-200 bg-white hover:border-stone-300 shadow-sm'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-2 mb-2">
                    <PriorityBadge priority={action.priority} />
                    {action.ai_generated && <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/20">AI Recommended</span>}
                  </div>
                  <span className="text-xs text-stone-400">{action.source_module}</span>
                </div>
                <h4 className="font-semibold text-stone-900 mb-1">{action.title}</h4>
                {action.description && <p className="text-sm text-stone-500 line-clamp-2 mb-3">{action.description}</p>}
                
                {showMobileView && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                    <button onClick={(e) => { e.stopPropagation(); navigate(action.deep_link); }} className="flex items-center text-sm font-medium text-indigo-600">
                      Resolve <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); markComplete(action.id); }} className="text-sm font-medium text-stone-500 hover:text-stone-700">
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column (Details) - Desktop only */}
      {!showMobileView && (
        <div className="flex-1 bg-[#faf8f5] overflow-y-auto">
          {selectedAction ? (
            <div className="p-8 max-w-2xl mx-auto">
              <div className="flex gap-2 mb-4">
                <PriorityBadge priority={selectedAction.priority} />
                <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-800">{selectedAction.status}</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">{selectedAction.title}</h2>
              <p className="text-stone-600 mb-8">{selectedAction.description}</p>

              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4">Action Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <dt className="text-xs font-medium text-stone-500">Source</dt>
                    <dd className="mt-1 text-sm text-stone-900 capitalize">{selectedAction.source_module} / {selectedAction.source_record_type}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-stone-500">Impact</dt>
                    <dd className="mt-1 text-sm text-stone-900">{selectedAction.operational_impact || 'Standard'}</dd>
                  </div>
                  {selectedAction.due_at && (
                    <div>
                      <dt className="text-xs font-medium text-stone-500">Due</dt>
                      <dd className="mt-1 text-sm text-stone-900">{new Date(selectedAction.due_at).toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="flex gap-3 mt-8 border-t border-stone-200 pt-6">
                <button 
                  onClick={() => navigate(selectedAction.deep_link)}
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  Open Record to Resolve
                </button>
                <button 
                  onClick={() => markComplete(selectedAction.id)}
                  className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 hover:bg-stone-50"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <p className="text-stone-500 text-center max-w-sm">Select an action from the queue to view details and resolution steps.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col -mx-4 -my-6 sm:-mx-6 sm:-my-6 lg:-mx-8 lg:-my-8">
      {!showMobileView && (
        <div className="flex items-center justify-between px-8 py-5 border-b border-stone-200 bg-white">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 font-serif">Action Center</h1>
            <p className="text-sm text-stone-500 mt-1">Urgent tasks, approvals, exceptions, and follow-ups across your business.</p>
          </div>
          <div className="flex gap-4">
            {/* Top metrics */}
            <div className="text-center px-4 border-r border-stone-200"><p className="text-2xl font-bold text-rose-600">{urgentCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Critical</p></div>
            <div className="text-center px-4 border-r border-stone-200"><p className="text-2xl font-bold text-amber-600">{dueTodayCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Due Today</p></div>
            <div className="text-center px-4"><p className="text-2xl font-bold text-stone-900">{myActionsCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Mine</p></div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {content}
      </div>
    </div>
  );
}
