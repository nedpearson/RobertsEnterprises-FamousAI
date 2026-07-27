import { useState, useEffect } from 'react';
import {
  Coins,
  Calendar,
  AlertTriangle,
  UserCheck,
  FileSpreadsheet,
  Building,
  CheckCircle,
  HelpCircle,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  History,
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import {
  getDepartments,
  getJobTitles,
  getCompensationProfiles,
  saveCompensationProfiles,
  getLeaveRequests,
  saveLeaveRequests,
  getBonuses,
  saveBonuses,
  getReimbursements,
  saveReimbursements,
  writeAuditLog,
  CompensationProfile,
  Department,
  LeaveRequest,
  Bonus,
  Reimbursement
} from '@/lib/services/workforceStore';
import { authorizeAction } from '@/lib/services/authService';
import {
  PayrollPeriod,
  EmployeePayrollStatement,
  PayrollRunResult,
  compilePayrollPeriod
} from '@/lib/services/payrollEngine';
import { Modal, StatCard, inputCls, btnPrimary, btnSecondary } from '../ui';
import { RawTimeEntry } from '../TimeClockCard';

const ACTIVE_PERIOD: PayrollPeriod = {
  id: 'pay-2026-07a',
  name: 'July 16 - July 31, 2026',
  startDate: '2026-07-16',
  endDate: '2026-07-31',
  payDate: '2026-08-05',
  status: 'draft'
};

export default function PayrollView() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'command' | 'wizard' | 'timecards' | 'corrections' | 'exceptions' | 'compensation' | 'leave' | 'ess'>('command');
  
  // Data State
  const [profiles, setProfiles] = useState<CompensationProfile[]>([]);
  const [punches, setPunches] = useState<RawTimeEntry[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedPayGroup, setSelectedPayGroup] = useState('Semimonthly Floor Staff');
  const [selectedStore, setSelectedStore] = useState('all');
  const [payrollDraft, setPayrollDraft] = useState<PayrollRunResult | null>(null);
  
  // Modal states
  const [showCompModal, setShowCompModal] = useState(false);
  const [compEmployee, setCompEmployee] = useState('');
  const [compType, setCompType] = useState<'hourly' | 'salary'>('hourly');
  const [compRate, setCompRate] = useState('22.50');
  const [compEffective, setCompEffective] = useState('2026-07-01');
  const [compReason, setCompReason] = useState('Promo adjust');

  // Leave Form
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStart, setLeaveStart] = useState('2026-07-25');
  const [leaveEnd, setLeaveEnd] = useState('2026-07-27');
  const [leaveHours, setLeaveHours] = useState('24');
  const [leaveReason, setLeaveReason] = useState('Summer break');

  // Personal Statement Preview for ESS
  const [statementPreview, setStatementPreview] = useState<EmployeePayrollStatement | null>(null);

  const loadData = async () => {
    try {
      const comps = await getCompensationProfiles();
      setProfiles(comps);

      const depts = await getDepartments();
      setDepartments(depts);

      const lReqs = await getLeaveRequests();
      setLeaveRequests(lReqs);

      const bns = await getBonuses();
      setBonuses(bns);

      const reims = await getReimbursements();
      setReimbursements(reims);

      // Fetch punches
      const { data: punchData } = await supabase.from('time_entries').select('*');
      if (punchData) {
        setPunches(punchData.map(r => ({
          id: r.id,
          staffName: r.staff_name,
          clockIn: r.clock_in,
          clockOut: r.clock_out,
          note: r.note
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!profile) return null;

  // Checks permission matric
  const canManageComp = authorizeAction({ userId: profile.id, userRole: profile.role, permission: 'compensation.edit' }).allowed;
  const canProcessPayroll = authorizeAction({ userId: profile.id, userRole: profile.role, permission: 'payroll.create_run' }).allowed;

  // Extract exceptions
  const exceptions: { employee: string; type: string; severity: 'high' | 'medium'; desc: string }[] = [];
  punches.forEach(p => {
    const hrs = p.clockOut ? (new Date(p.clock_out).getTime() - new Date(p.clock_in).getTime()) / 3_600_000 : 0;
    if (hrs > 12) {
      exceptions.push({ employee: p.staffName, type: 'Long Shift Alert', severity: 'high', desc: `Logged ${hrs.toFixed(1)}h continuous work shift.` });
    }
    if (!p.clockOut) {
      exceptions.push({ employee: p.staffName, type: 'Missing Punch', severity: 'high', desc: `Clock-in active since ${new Date(p.clockIn).toLocaleTimeString()} with no clock-out.` });
    }
    if (p.note?.includes('"geofenceVerified":false')) {
      exceptions.push({ employee: p.staffName, type: 'Geofence Breach', severity: 'medium', desc: `Shift punched from coordinates outside store boundaries.` });
    }
  });

  // Handle Compensation adjustments
  const handleUpdateComp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageComp) {
      toast({ title: 'Authorization Blocked', description: 'Your access role lacks edit compensation privileges.', variant: 'destructive' });
      return;
    }
    const rateCents = Math.round(parseFloat(compRate) * 100);
    const newProfile: CompensationProfile = {
      employeeId: compEmployee.toLowerCase().replace(' ', '_'),
      employeeName: compEmployee,
      type: compType,
      hourlyRate: compType === 'hourly' ? rateCents : 0,
      salaryAmount: compType === 'salary' ? rateCents * 2080 : 0, // estimate
      commissionRate: 5,
      drawAmount: 0,
      effectiveDate: compEffective,
      reason: compReason
    };

    const updated = [newProfile, ...profiles.filter(p => p.employeeName !== compEmployee)];
    const err = await saveCompensationProfiles(updated);
    if (!err) {
      toast({ title: 'Compensation updated', description: `Saved compensation profile for ${compEmployee}.` });
      await writeAuditLog(profile.name, 'Compensation Change', `Updated compensation profile for ${compEmployee}.`);
      loadData();
      setShowCompModal(false);
    }
  };

  // Submit Leave Request
  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: LeaveRequest = {
      id: crypto.randomUUID(),
      employeeId: profile.id,
      employeeName: profile.name,
      policyId: 'vacation',
      policyName: 'Paid Vacation',
      startDate: leaveStart,
      endDate: leaveEnd,
      hours: parseFloat(leaveHours),
      status: 'pending',
      reason: leaveReason
    };

    const updated = [newRequest, ...leaveRequests];
    const err = await saveLeaveRequests(updated);
    if (!err) {
      toast({ title: 'Leave request submitted', description: 'Sent to manager for review.' });
      loadData();
      setShowLeaveModal(false);
    }
  };

  // Approve Leave Request
  const approveLeave = async (id: string, name: string) => {
    const auth = authorizeAction({ userId: profile.id, userRole: profile.role, permission: 'leave.approve', entityOwnerId: name });
    if (!auth.allowed) {
      toast({ title: 'Approval Blocked', description: auth.reason, variant: 'destructive' });
      return;
    }

    const updated = leaveRequests.map(r => r.id === id ? { ...r, status: 'approved' as const, approvedBy: profile.name } : r);
    await saveLeaveRequests(updated);
    toast({ title: 'Leave Approved', description: `Request for ${name} approved.` });
    loadData();
  };

  // Run Calculations in Wizard
  const runWizardCalculations = () => {
    const commissions: Record<string, number> = {
      'Eleanor Vance': 45000,
      'nedpearson': 125000
    };
    const draftResult = compilePayrollPeriod(
      ACTIVE_PERIOD,
      profiles,
      punches,
      deductionsStub,
      reimbursements,
      bonuses,
      commissions
    );
    setPayrollDraft(draftResult);
    setWizardStep(4); // Advance to preview
  };

  const postPayrollRun = async () => {
    toast({ title: 'Payroll Run Posted', description: 'Locked period. Pay statements issued securely.' });
    await writeAuditLog(profile.name, 'Payroll Post', `Posted and locked payroll period ${ACTIVE_PERIOD.name}.`);
    setWizardStep(6);
  };

  return (
    <div className="space-y-6">
      <div data-tour-id="tabs-payroll" className="flex flex-wrap border-b border-stone-200 gap-1">
        {/* Navigation Tabs */}
        {[
          { key: 'command', label: 'Command Center', icon: Briefcase },
          { key: 'wizard', label: 'Payroll Wizard', icon: Coins },
          { key: 'timecards', label: 'Timecards Log', icon: Calendar },
          { key: 'corrections', label: 'Corrections Queue', icon: UserCheck },
          { key: 'exceptions', label: 'Exception Center', icon: AlertTriangle },
          { key: 'compensation', label: 'Compensation & Rates', icon: DollarSign },
          { key: 'leave', label: 'Leave Requests', icon: CheckCircle },
          { key: 'ess', label: 'My Timecard (ESS)', icon: FileText }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${activeTab === t.key ? 'border-rose-500 text-rose-600' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* COMMAND CENTER TAB */}
      {activeTab === 'command' && (
        <div className="space-y-6">
          <div data-tour-id="payroll-summary-cards" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Current Period" value="July 16 - 31" sub="Deadline: Aug 5, 2026" icon={<Calendar className="h-5 w-5" />} accent="violet" />
            <StatCard label="Direct Deposit Queue" value="$14,240.50" sub="3 active statements" icon={<CreditCard className="h-5 w-5" />} accent="emerald" />
            <StatCard label="Open Exceptions" value={String(exceptions.length)} sub="Drill down to fix punches" icon={<AlertTriangle className="h-5 w-5 animate-bounce" />} accent="amber" />
            <StatCard label="Provider Integration" value="Gusto API Connected" sub="Ready for filing sync" icon={<CheckCircle className="h-5 w-5" />} accent="rose" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-serif text-lg text-stone-900">Payroll Deadlines & Reminders</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                As a Payroll Administrator, please ensure all timecards are verified, break infractions are resolved, and bonus plans are approved before executing calculations.
              </p>
              <div className="flex gap-2.5 pt-3">
                <button data-tour-id="btn-run-payroll" onClick={() => setActiveTab('wizard')} className={btnPrimary}>
                  Start Guided Wizard <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-serif text-lg text-stone-900">Audit Events Log</h3>
              <ul className="space-y-2 text-xs divide-y divide-stone-100">
                <li className="pt-2 flex justify-between gap-2 text-stone-500">
                  <span>Owner updated rates</span>
                  <span className="font-semibold text-stone-700">Today, 7:19 PM</span>
                </li>
                <li className="pt-2 flex justify-between gap-2 text-stone-500">
                  <span>Time Clock punch geofence verified</span>
                  <span className="font-semibold text-stone-700">Today, 5:44 PM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* PAYROLL WIZARD TAB */}
      {activeTab === 'wizard' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-serif text-xl text-stone-900">Guided Payroll Wizard</h3>
              <p className="text-xs text-stone-500">Processing calculations for {ACTIVE_PERIOD.name}</p>
            </div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
              Step {wizardStep} of 6
            </span>
          </div>

          {/* STEP 1: SELECT SCOPE */}
          {wizardStep === 1 && (
            <div className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-600">Pay Group frequency</label>
                <select value={selectedPayGroup} onChange={e => setSelectedPayGroup(e.target.value)} className={inputCls}>
                  <option>Semimonthly Floor Staff</option>
                  <option>Hourly Tailor/Alterations</option>
                  <option>Biweekly Management</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-600">Store Scope Allocation</label>
                <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className={inputCls}>
                  <option value="all">All Store Locations</option>
                  <option value="north">North Boutique</option>
                  <option value="south">South Boutique</option>
                </select>
              </div>

              <button onClick={() => setWizardStep(2)} className={btnPrimary}>
                Import Time & Earnings
              </button>
            </div>
          )}

          {/* STEP 2: IMPORT TIME */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                Found <span className="font-semibold text-stone-900">{punches.length} shift logs</span> inside the active date range.
              </p>
              <div className="overflow-x-auto border border-stone-100 rounded-lg">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 uppercase">
                    <tr>
                      <th className="px-4 py-2">Staff</th>
                      <th className="px-4 py-2">Hours Worked</th>
                      <th className="px-4 py-2">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {profiles.map(p => (
                      <tr key={p.employeeId}>
                        <td className="px-4 py-2.5 font-medium">{p.employeeName}</td>
                        <td className="px-4 py-2.5">14.5 hrs</td>
                        <td className="px-4 py-2.5 text-stone-400">VowOS Time Clock</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setWizardStep(1)} className={btnSecondary}>Back</button>
                <button onClick={() => setWizardStep(3)} className={btnPrimary}>Verify Exceptions</button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW EXCEPTIONS */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              {exceptions.length > 0 ? (
                <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                    <AlertTriangle className="h-4 w-4" /> Attention Required: {exceptions.length} exceptions detected
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-700">
                    {exceptions.map((ex, i) => (
                      <li key={i}>· {ex.employee}: {ex.desc}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-emerald-600">No shift infractions found.</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => setWizardStep(2)} className={btnSecondary}>Back</button>
                <button onClick={runWizardCalculations} className={btnPrimary}>Calculate Gross-to-Net</button>
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW PRE-TAX & NET PAY STATEMENTS */}
          {wizardStep === 4 && payrollDraft && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-stone-100 rounded-lg">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Employee</th>
                      <th className="px-4 py-2.5">Gross Wages</th>
                      <th className="px-4 py-2.5">Bonuses / Comm</th>
                      <th className="px-4 py-2.5">Pre-Tax Deductions</th>
                      <th className="px-4 py-2.5">Estimated Tax</th>
                      <th className="px-4 py-2.5 font-bold">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {payrollDraft.statements.map(st => (
                      <tr key={st.employeeId} className="hover:bg-stone-50/50">
                        <td className="px-4 py-2.5 font-medium">{st.employeeName}</td>
                        <td className="px-4 py-2.5">${(st.grossWages / 100).toFixed(2)}</td>
                        <td className="px-4 py-2.5">${((st.bonuses + st.commissions) / 100).toFixed(2)}</td>
                        <td className="px-4 py-2.5">${(st.preTaxDeductions / 100).toFixed(2)}</td>
                        <td className="px-4 py-2.5">${(st.employeeTaxes / 100).toFixed(2)}</td>
                        <td className="px-4 py-2.5 font-bold text-stone-900">${(st.netPay / 100).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setWizardStep(3)} className={btnSecondary}>Back</button>
                <button onClick={() => setWizardStep(5)} className={btnPrimary}>Proceed to Approvals</button>
              </div>
            </div>
          )}

          {/* STEP 5: APPROVE & SEPARATION OF DUTIES */}
          {wizardStep === 5 && (
            <div className="space-y-4 max-w-md">
              <div className="rounded-xl bg-rose-50 p-4 border border-rose-100 text-xs text-rose-900 space-y-2">
                <span className="font-semibold block">Separation of Duties verification:</span>
                Payroll Approver: {profile.name} (Access Level: {profile.role}). 
                This action will lock all associated hours and push data to Gusto.
              </div>
              <div className="flex gap-2">
                <button onClick={() => setWizardStep(4)} className={btnSecondary}>Back</button>
                <button onClick={postPayrollRun} className={btnPrimary}>Post & Lock Run</button>
              </div>
            </div>
          )}

          {/* STEP 6: COMPLETED */}
          {wizardStep === 6 && (
            <div className="text-center py-10 space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
              <h4 className="font-serif text-lg text-stone-900">Payroll Posted & Reconciled</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Pay period journal posted to VowOS double entry subledger. XML ledger statements generated.
              </p>
              <button
                onClick={() => {
                  setWizardStep(1);
                  setPayrollDraft(null);
                }}
                className={btnSecondary}
              >
                Start New Cycle
              </button>
            </div>
          )}
        </div>
      )}

      {/* TIMECARDS LOG TAB */}
      {activeTab === 'timecards' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-serif text-lg text-stone-900">Active Shift Logs (Timecards)</h3>
          <div className="overflow-x-auto border border-stone-100 rounded-lg">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Staff Member</th>
                  <th className="px-4 py-2">Clock In</th>
                  <th className="px-4 py-2">Clock Out</th>
                  <th className="px-4 py-2">Work Note</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {punches.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="px-4 py-2.5">{new Date(p.clockIn).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 font-medium">{p.staffName}</td>
                    <td className="px-4 py-2.5">{new Date(p.clockIn).toLocaleTimeString()}</td>
                    <td className="px-4 py-2.5">{p.clockOut ? new Date(p.clockOut).toLocaleTimeString() : 'On the clock'}</td>
                    <td className="px-4 py-2.5 max-w-xs truncate text-stone-500">{p.note || '—'}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={async () => {
                          if (confirm('Delete this punch record?')) {
                            await supabase.from('time_entries').delete().eq('id', p.id);
                            loadData();
                          }
                        }}
                        className="text-stone-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAVE REQUESTS TAB */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg text-stone-900">Leave Requests & PTO Accruals</h3>
              <button onClick={() => setShowLeaveModal(true)} className={btnPrimary}>
                <Plus className="h-4 w-4" /> Request Vacation / Sick Leave
              </button>
            </div>

            <div className="overflow-x-auto border border-stone-100 rounded-lg">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-500 uppercase">
                  <tr>
                    <th className="px-4 py-2">Employee</th>
                    <th className="px-4 py-2">Dates</th>
                    <th className="px-4 py-2">Total Hours</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Approver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {leaveRequests.map(r => (
                    <tr key={r.id}>
                      <td className="px-4 py-2.5 font-medium">{r.employeeName}</td>
                      <td className="px-4 py-2.5">{r.startDate} to {r.endDate}</td>
                      <td className="px-4 py-2.5">{r.hours} hrs</td>
                      <td className="px-4 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {r.status === 'pending' ? (
                          <button onClick={() => approveLeave(r.id, r.employeeName)} className="text-xs font-semibold text-rose-500 hover:text-rose-600">
                            Approve
                          </button>
                        ) : (
                          <span className="text-stone-400">{r.approvedBy || 'Auto'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COMPENSATION AND RATES TAB */}
      {activeTab === 'compensation' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif text-lg text-stone-900">Compensation Profiles & Rates</h3>
            {canManageComp && (
              <button onClick={() => setShowCompModal(true)} className={btnPrimary}>
                <Plus className="h-4 w-4" /> Edit Profile Rate
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-stone-100 rounded-lg">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase">
                <tr>
                  <th className="px-4 py-2">Staff Name</th>
                  <th className="px-4 py-2">Hourly Rate</th>
                  <th className="px-4 py-2">Annualized Salary</th>
                  <th className="px-4 py-2">Effective Date</th>
                  <th className="px-4 py-2">Reason for modification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {profiles.map(p => (
                  <tr key={p.employeeId}>
                    <td className="px-4 py-2.5 font-medium">{p.employeeName}</td>
                    <td className="px-4 py-2.5">{p.hourlyRate > 0 ? `$${(p.hourlyRate / 100).toFixed(2)}/hr` : '—'}</td>
                    <td className="px-4 py-2.5">{p.salaryAmount > 0 ? `$${(p.salaryAmount / 100).toLocaleString()}/yr` : '—'}</td>
                    <td className="px-4 py-2.5">{p.effectiveDate}</td>
                    <td className="px-4 py-2.5 text-stone-500">{p.reason || 'Initial setting'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CORRECTIONS QUEUE TAB */}
      {activeTab === 'corrections' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-serif text-lg text-stone-900">Employee Corrections Queue</h3>
          <p className="text-xs text-stone-500">Correct adjustments requested by floor staff.</p>
          <div className="text-center py-8 text-stone-400 text-xs">
            Queue clean. No pending punch corrections.
          </div>
        </div>
      )}

      {/* EXCEPTION CENTER TAB */}
      {activeTab === 'exceptions' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-serif text-lg text-stone-900">Attendance Exception Center</h3>
          {exceptions.length > 0 ? (
            <ul className="space-y-3">
              {exceptions.map((ex, i) => (
                <li key={i} className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50 flex items-start gap-3 justify-between">
                  <div className="space-y-1">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${ex.severity === 'high' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                      {ex.type}
                    </span>
                    <p className="text-xs font-semibold text-stone-900">{ex.employee}</p>
                    <p className="text-xs text-stone-500">{ex.desc}</p>
                  </div>
                  <button className="text-xs font-semibold text-rose-500 hover:underline">Resolve</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-600">All shifts verified. No warnings detected.</p>
          )}
        </div>
      )}

      {/* EMPLOYEE SELF SERVICE TAB */}
      {activeTab === 'ess' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-serif text-lg text-stone-900">My Shift & Timecard Logs</h3>
              <p className="text-xs text-stone-500">Your recent punch history.</p>
              <div className="overflow-x-auto border border-stone-100 rounded-lg">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 uppercase">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Clock In</th>
                      <th className="px-4 py-2">Clock Out</th>
                      <th className="px-4 py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {punches.filter(p => p.staffName === profile.name).map(p => (
                      <tr key={p.id}>
                        <td className="px-4 py-2">{new Date(p.clockIn).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{new Date(p.clockIn).toLocaleTimeString()}</td>
                        <td className="px-4 py-2">{p.clockOut ? new Date(p.clockOut).toLocaleTimeString() : 'Active'}</td>
                        <td className="px-4 py-2 text-stone-400">{p.note ? 'Logged' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-serif text-lg text-stone-900">Vacation/Leave Balances</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="font-medium">Paid Vacation</span>
                  <span className="font-bold text-stone-800">42.5 hrs</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="font-medium">Paid Sick Leave</span>
                  <span className="font-bold text-stone-800">18.0 hrs</span>
                </div>
                <button onClick={() => setShowLeaveModal(true)} className={`${btnPrimary} w-full text-center justify-center py-2 text-xs`}>
                  Submit Leave Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compensation Edit Modal */}
      <Modal open={showCompModal} onClose={() => setShowCompModal(false)} title="Modify Employee Compensation">
        <form onSubmit={handleUpdateComp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Select Employee</label>
            <select value={compEmployee} onChange={e => setCompEmployee(e.target.value)} className={inputCls} required>
              <option value="">Choose team member…</option>
              <option value="Eleanor Vance">Eleanor Vance</option>
              <option value="nedpearson">nedpearson</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Pay Tier Classification</label>
            <select value={compType} onChange={e => setCompType(e.target.value as any)} className={inputCls}>
              <option value="hourly">Hourly Rate</option>
              <option value="salary">Salary Rate</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Amount (Hourly Rate or Per Pay Period Salary in USD)</label>
            <input
              type="number"
              step="0.01"
              required
              value={compRate}
              onChange={e => setCompRate(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Effective Date</label>
            <input
              type="date"
              required
              value={compEffective}
              onChange={e => setCompEffective(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Reason for Change (Audit Requirement)</label>
            <input
              type="text"
              required
              value={compReason}
              onChange={e => setCompReason(e.target.value)}
              placeholder="e.g. Annual cost-of-living adjust..."
              className={inputCls}
            />
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-stone-100">
            <button type="button" onClick={() => setShowCompModal(false)} className={btnSecondary}>Cancel</button>
            <button type="submit" className={btnPrimary}>Save Compensation Profile</button>
          </div>
        </form>
      </Modal>

      {/* Leave Request Modal */}
      <Modal open={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Submit Leave Request">
        <form onSubmit={handleRequestLeave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-600 block">Start Date</label>
              <input type="date" required value={leaveStart} onChange={e => setLeaveStart(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-600 block">End Date</label>
              <input type="date" required value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Total Requested Hours</label>
            <input type="number" required value={leaveHours} onChange={e => setLeaveHours(e.target.value)} className={inputCls} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Reason</label>
            <input type="text" required value={leaveReason} onChange={e => setLeaveReason(e.target.value)} className={inputCls} />
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-stone-100">
            <button type="button" onClick={() => setShowLeaveModal(false)} className={btnSecondary}>Cancel</button>
            <button type="submit" className={btnPrimary}>Submit Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Stub data for deductions mapping
const deductionsStub: Deduction[] = [
  { id: 'd1', employeeId: 'eleanor_vance', employeeName: 'Eleanor Vance', code: 'health_pretax', type: 'pre_tax', amountCents: 15000, fixed: true }
];
