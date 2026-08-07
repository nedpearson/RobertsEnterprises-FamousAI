import { fetchJsonSetting, saveJsonSetting } from '@/lib/settings';

// ─── Interfaces ───

export interface Department {
  id: string;
  name: string;
  managerName?: string;
  locations?: string[]; // assigned location IDs
  costCenter?: string;
  active: boolean;
}

export interface JobTitle {
  id: string;
  name: string;
  active: boolean;
}

export interface CompensationProfile {
  employeeId: string;
  employeeName: string;
  type: 'hourly' | 'salary' | 'hourly_plus_commission' | 'salary_plus_commission';
  payFrequency?: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  hourlyRate: number; // in cents
  salaryAmount: number; // in cents
  commissionRate: number; // in percentage, e.g. 10 for 10%
  drawAmount: number; // in cents, draw against commission
  effectiveDate: string; // YYYY-MM-DD
  reason?: string;
}

export interface LeavePolicy {
  id: string;
  name: string; // Vacation, Sick, PTO
  accrualRate: number; // hours earned per worked hour (or per period)
  maxBalance: number; // in hours
  carryoverLimit: number; // in hours
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  policyId: string;
  policyName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  hours: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approvedBy?: string;
}

export interface LeaveBalance {
  employeeId: string;
  policyId: string;
  balanceHours: number;
}

export interface Deduction {
  id: string;
  employeeId: string;
  employeeName: string;
  code: string; // pre_tax_health, garnishment, child_support, child_support_401k
  type: 'pre_tax' | 'after_tax';
  amountCents: number;
  fixed: boolean; // if false, it is a percentage
  percentValue?: number; // e.g. 5 for 5%
  goalAmount?: number; // limits total deductions
  remainingBalance?: number;
}

export interface Reimbursement {
  id: string;
  employeeId: string;
  employeeName: string;
  locationId: string;
  date: string;
  category: 'mileage' | 'travel' | 'meals' | 'supplies' | 'other';
  amountCents: number;
  purpose: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvedBy?: string;
}

export interface Bonus {
  id: string;
  employeeId: string;
  employeeName: string;
  locationId: string;
  type: 'one_time' | 'store_performance' | 'commission_bonus' | 'holiday' | 'referral';
  amountCents: number;
  reason: string;
  payrollPeriodId?: string; // locked to a specific payroll run
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedBy: string;
  approvedBy?: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actorName: string;
  action: string;
  details: string;
  ipAddress?: string;
}
export interface TimeEntry {
  id: string;
  businessId: string;
  employeeId: string;
  employeeName: string;
  clockIn: string; // YYYY-MM-DDTHH:mm:ssZ
  clockOut?: string; 
  originalLocationId: string;
  status: 'active' | 'completed' | 'voided' | 'corrected';
  source: 'web' | 'mobile' | 'manager' | 'api';
  approved: boolean;
  approvedBy?: string;
  notes?: string;
}

export interface TimeEntrySegment {
  id: string;
  timeEntryId: string;
  businessId: string;
  employeeId: string;
  locationId: string;
  departmentId: string;
  startAt: string;
  endAt?: string;
  paidMinutes: number;
  unpaidMinutes: number;
}

export interface TimeEntryCorrection {
  id: string;
  timeEntryId: string;
  requestedBy: string; // employee or manager
  requestedAt: string;
  type: 'missed_in' | 'missed_out' | 'wrong_time' | 'wrong_location' | 'other';
  proposedClockIn?: string;
  proposedClockOut?: string;
  proposedLocationId?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface OfficialPayrollPeriod {
  id: string;
  businessId: string;
  name: string; // e.g. "July 16 - July 31, 2026"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  payDate: string; // YYYY-MM-DD
  payFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'custom';
  status: 'draft' | 'reviewing' | 'approved' | 'posted' | 'provider_submitted' | 'reconciled' | 'failed' | 'voided';
  eligiblePayGroups?: string[];
  totalGrossCents?: number;
  totalNetCents?: number;
  totalEmployerCostCents?: number;
  employeeCount?: number;
  createdBy?: string;
  approvedBy?: string;
  postedAt?: string;
  providerStatus?: 'simulated' | 'connected' | 'healthy' | 'syncing' | 'failed';
}

// ─── Default Configurations ───

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'sales', name: 'Sales', managerName: 'nedpearson', locations: ['north', 'south'], costCenter: 'CC-101', active: true },
  { id: 'alterations', name: 'Alterations', managerName: 'nedpearson', locations: ['north'], costCenter: 'CC-202', active: true },
  { id: 'management', name: 'Management', managerName: 'nedpearson', locations: ['north', 'south'], costCenter: 'CC-303', active: true },
  { id: 'inventory', name: 'Inventory & Receiving', managerName: 'nedpearson', locations: ['north', 'south'], costCenter: 'CC-404', active: true }
];

const DEFAULT_JOB_TITLES: JobTitle[] = [
  { id: 'consultant', name: 'Bridal Consultant', active: true },
  { id: 'stylist', name: 'Stylist / Sales Associate', active: true },
  { id: 'seamstress', name: 'Seamstress / Tailor', active: true },
  { id: 'manager', name: 'Store Manager', active: true },
  { id: 'desk', name: 'Front Desk Coordinator', active: true }
];

const DEFAULT_COMPENSATION_PROFILES: CompensationProfile[] = [
  { employeeId: 'nedpearson', employeeName: 'nedpearson', type: 'salary', payFrequency: 'semimonthly', hourlyRate: 0, salaryAmount: 12000000, commissionRate: 5, drawAmount: 0, effectiveDate: '2026-01-01', reason: 'Initial setup' }
];

const DEFAULT_LEAVE_POLICIES: LeavePolicy[] = [
  { id: 'vacation', name: 'Paid Vacation', accrualRate: 0.04, maxBalance: 120, carryoverLimit: 40 },
  { id: 'sick', name: 'Paid Sick Leave', accrualRate: 0.02, maxBalance: 80, carryoverLimit: 24 }
];

// ─── Persistence Functions ───

export async function getDepartments(): Promise<Department[]> {
  return fetchJsonSetting<Department[]>('workforce_departments', DEFAULT_DEPARTMENTS);
}

export async function saveDepartments(list: Department[]): Promise<string | null> {
  return saveJsonSetting<Department[]>('workforce_departments', list);
}

export async function getJobTitles(): Promise<JobTitle[]> {
  return fetchJsonSetting<JobTitle[]>('workforce_job_titles', DEFAULT_JOB_TITLES);
}

export async function saveJobTitles(list: JobTitle[]): Promise<string | null> {
  return saveJsonSetting<JobTitle[]>('workforce_job_titles', list);
}

export async function getCompensationProfiles(): Promise<CompensationProfile[]> {
  return fetchJsonSetting<CompensationProfile[]>('employee_compensation', DEFAULT_COMPENSATION_PROFILES);
}

export async function saveCompensationProfiles(list: CompensationProfile[]): Promise<string | null> {
  return saveJsonSetting<CompensationProfile[]>('employee_compensation', list);
}

export async function getLeavePolicies(): Promise<LeavePolicy[]> {
  return fetchJsonSetting<LeavePolicy[]>('leave_policies', DEFAULT_LEAVE_POLICIES);
}

export async function saveLeavePolicies(list: LeavePolicy[]): Promise<string | null> {
  return saveJsonSetting<LeavePolicy[]>('leave_policies', list);
}

export async function getLeaveRequests(): Promise<LeaveRequest[]> {
  return fetchJsonSetting<LeaveRequest[]>('leave_requests', []);
}

export async function saveLeaveRequests(list: LeaveRequest[]): Promise<string | null> {
  return saveJsonSetting<LeaveRequest[]>('leave_requests', list);
}

export async function getLeaveBalances(): Promise<LeaveBalance[]> {
  return fetchJsonSetting<LeaveBalance[]>('leave_balances', []);
}

export async function saveLeaveBalances(list: LeaveBalance[]): Promise<string | null> {
  return saveJsonSetting<LeaveBalance[]>('leave_balances', list);
}

export async function getDeductions(): Promise<Deduction[]> {
  return fetchJsonSetting<Deduction[]>('employee_deductions', []);
}

export async function saveDeductions(list: Deduction[]): Promise<string | null> {
  return saveJsonSetting<Deduction[]>('employee_deductions', list);
}

export async function getReimbursements(): Promise<Reimbursement[]> {
  return fetchJsonSetting<Reimbursement[]>('employee_reimbursements', []);
}

export async function saveReimbursements(list: Reimbursement[]): Promise<string | null> {
  return saveJsonSetting<Reimbursement[]>('employee_reimbursements', list);
}

export async function getBonuses(): Promise<Bonus[]> {
  return fetchJsonSetting<Bonus[]>('employee_bonuses', []);
}

export async function saveBonuses(list: Bonus[]): Promise<string | null> {
  return saveJsonSetting<Bonus[]>('employee_bonuses', list);
}

export async function getAuditLogs(): Promise<AuditLogRecord[]> {
  return fetchJsonSetting<AuditLogRecord[]>('workforce_audit_logs', []);
}

export async function writeAuditLog(actorName: string, action: string, details: string): Promise<void> {
  try {
    const list = await getAuditLogs();
    const newLog: AuditLogRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      actorName,
      action,
      details
    };
    await saveJsonSetting<AuditLogRecord[]>('workforce_audit_logs', [newLog, ...list].slice(0, 1000));
  } catch (err) {
    console.error('Error writing audit log:', err);
  }
}

export async function getTimeEntries(): Promise<TimeEntry[]> {
  return fetchJsonSetting<TimeEntry[]>('workforce_time_entries', []);
}

export async function saveTimeEntries(list: TimeEntry[]): Promise<string | null> {
  return saveJsonSetting<TimeEntry[]>('workforce_time_entries', list);
}

export async function getTimeEntrySegments(): Promise<TimeEntrySegment[]> {
  return fetchJsonSetting<TimeEntrySegment[]>('workforce_time_segments', []);
}

export async function saveTimeEntrySegments(list: TimeEntrySegment[]): Promise<string | null> {
  return saveJsonSetting<TimeEntrySegment[]>('workforce_time_segments', list);
}

export async function getTimeEntryCorrections(): Promise<TimeEntryCorrection[]> {
  return fetchJsonSetting<TimeEntryCorrection[]>('workforce_time_corrections', []);
}

export async function saveTimeEntryCorrections(list: TimeEntryCorrection[]): Promise<string | null> {
  return saveJsonSetting<TimeEntryCorrection[]>('workforce_time_corrections', list);
}

export async function getOfficialPayrollPeriods(): Promise<OfficialPayrollPeriod[]> {
  return fetchJsonSetting<OfficialPayrollPeriod[]>('workforce_payroll_periods', []);
}

export async function saveOfficialPayrollPeriods(list: OfficialPayrollPeriod[]): Promise<string | null> {
  return saveJsonSetting<OfficialPayrollPeriod[]>('workforce_payroll_periods', list);
}
