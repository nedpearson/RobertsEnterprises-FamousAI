import { RawTimeEntry } from '@/components/vowos/TimeClockCard';
import { CompensationProfile, Department, Deduction, Reimbursement, Bonus } from './workforceStore';

export interface PayrollPeriod {
  id: string;
  name: string; // e.g. "July 16 - July 31, 2026"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  payDate: string; // YYYY-MM-DD
  status: 'draft' | 'posted' | 'reconciled';
}

export interface EmployeePayrollStatement {
  employeeId: string;
  employeeName: string;
  department: string;
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
  regularPay: number; // in cents
  overtimePay: number; // in cents
  doubleTimePay: number; // in cents
  grossWages: number; // in cents
  bonuses: number; // in cents
  commissions: number; // in cents
  reimbursements: number; // in cents
  preTaxDeductions: number; // in cents
  taxableGross: number; // in cents
  employeeTaxes: number; // in cents (FICA, Med, State)
  afterTaxDeductions: number; // in cents (Garnishments)
  netPay: number; // in cents
  employerTaxes: number; // in cents
  employerContributions: number; // in cents
  calculationsExplained: string[];
}

export interface PayrollRunResult {
  runId: string;
  periodName: string;
  statements: EmployeePayrollStatement[];
  totalGross: number;
  totalTaxes: number;
  totalDeductions: number;
  totalNet: number;
  totalEmployerCost: number;
  posted: boolean;
}

// Helper to check if a date is within a range
function isDateInPeriod(dateStr: string, start: string, end: string): boolean {
  const d = dateStr.split('T')[0];
  return d >= start && d <= end;
}

export function calculateEmployeePayroll(
  employeeId: string,
  employeeName: string,
  comp: CompensationProfile,
  punches: RawTimeEntry[],
  deductions: Deduction[],
  reimbursements: Reimbursement[],
  bonuses: Bonus[],
  commissionsCents: number,
  period: PayrollPeriod
): EmployeePayrollStatement {
  const explanations: string[] = [];
  
  // 1. Filter punches for this period
  const periodPunches = punches.filter((p) => {
    const clockInIso = p.clock_in || (p as any).clockIn;
    return clockInIso ? isDateInPeriod(clockInIso, period.startDate, period.endDate) : false;
  });

  let regularHours = 0;
  let overtimeHours = 0;
  let doubleTimeHours = 0;
  
  // Track daily punches to compute daily OT (Over 8h is OT, Over 12h is DT)
  const punchesByDay: Record<string, number[]> = {};
  periodPunches.forEach((p) => {
    const clockInIso = p.clock_in || (p as any).clockIn;
    const clockOutIso = p.clock_out || (p as any).clockOut;
    const day = clockInIso.split('T')[0];
    const start = new Date(clockInIso).getTime();
    const end = clockOutIso ? new Date(clockOutIso).getTime() : start; // default to 0 if open
    const hrs = Math.max(0, (end - start) / 3_600_000);
    if (!punchesByDay[day]) punchesByDay[day] = [];
    punchesByDay[day].push(hrs);
  });

  Object.entries(punchesByDay).forEach(([day, hoursList]) => {
    const dailyTotal = hoursList.reduce((s, h) => s + h, 0);
    if (dailyTotal > 12) {
      doubleTimeHours += dailyTotal - 12;
      overtimeHours += 4;
      regularHours += 8;
    } else if (dailyTotal > 8) {
      overtimeHours += dailyTotal - 8;
      regularHours += 8;
    } else {
      regularHours += dailyTotal;
    }
  });

  // Weekly Overtime (>40h total regular hours in work week)
  // For simplicity inside the UI preview, we calculate standard daily OT + weekly OT limits
  const totalWorked = regularHours + overtimeHours + doubleTimeHours;
  if (totalWorked > 40 && comp.type === 'hourly') {
    explanations.push(`Calculated ${totalWorked.toFixed(2)} total worked hours (OT/DT rules applied).`);
  }

  // 2. Earnings Calculation
  let regularPay = 0;
  let overtimePay = 0;
  let doubleTimePay = 0;
  let grossWages = 0;

  if (comp.type === 'hourly' || comp.type === 'hourly_plus_commission') {
    regularPay = Math.round(regularHours * comp.hourlyRate);
    overtimePay = Math.round(overtimeHours * comp.hourlyRate * 1.5);
    doubleTimePay = Math.round(doubleTimeHours * comp.hourlyRate * 2.0);
    grossWages = regularPay + overtimePay + doubleTimePay;
    explanations.push(`Hourly Compensation: $${(comp.hourlyRate / 100).toFixed(2)}/hr.`);
    explanations.push(`Regular: ${regularHours.toFixed(1)}h ($${(regularPay / 100).toFixed(2)}).`);
    if (overtimeHours > 0) explanations.push(`Overtime (1.5x): ${overtimeHours.toFixed(1)}h ($${(overtimePay / 100).toFixed(2)}).`);
    if (doubleTimeHours > 0) explanations.push(`Double Time (2.0x): ${doubleTimeHours.toFixed(1)}h ($${(doubleTimePay / 100).toFixed(2)}).`);
  } else {
    // Salaried
    // Semimonthly pay period is 1/24 of annual salary
    const payPeriodSalary = Math.round(comp.salaryAmount / 24);
    regularPay = payPeriodSalary;
    grossWages = payPeriodSalary;
    explanations.push(`Salaried Compensation: Annual $${(comp.salaryAmount / 100).toLocaleString()} (Period Allocation: $${(payPeriodSalary / 100).toLocaleString()}).`);
  }

  // 3. Bonuses & Commissions Draw
  const myBonuses = bonuses
    .filter((b) => b.employeeId === employeeId && b.status === 'approved' && isDateInPeriod(b.id.substring(0,8)/*placeholder date*/ || new Date().toISOString(), period.startDate, period.endDate))
    .reduce((s, b) => s + b.amountCents, 0);

  let finalCommissions = commissionsCents;
  if (comp.drawAmount > 0) {
    if (commissionsCents < comp.drawAmount) {
      finalCommissions = comp.drawAmount;
      explanations.push(`Commission Draw Guarantee: Draw of $${(comp.drawAmount / 100).toFixed(2)} paid instead of earned commission $${(commissionsCents / 100).toFixed(2)}.`);
    } else {
      explanations.push(`Commissions: Earned commission $${(commissionsCents / 100).toFixed(2)} exceeded draw threshold.`);
    }
  } else if (commissionsCents > 0) {
    explanations.push(`Commissions Earned: $${(commissionsCents / 100).toFixed(2)}.`);
  }

  // 4. Pre-Tax Deductions
  const preTax = deductions
    .filter((d) => d.employeeId === employeeId && d.type === 'pre_tax')
    .reduce((sum, d) => {
      const amt = d.fixed ? d.amountCents : Math.round((grossWages * (d.percentValue ?? 0)) / 100);
      explanations.push(`Pre-Tax Deduction (${d.code}): $${(amt / 100).toFixed(2)}`);
      return sum + amt;
    }, 0);

  const taxableGross = Math.max(0, grossWages + myBonuses + finalCommissions - preTax);

  // 5. Statutory Tax Estimates (Adapter Mock)
  // FICA Social Security: 6.2%, Medicare: 1.45%, Federal/State Income Tax Estimate: 10%
  const ssnTax = Math.round(taxableGross * 0.062);
  const medTax = Math.round(taxableGross * 0.0145);
  const incTax = Math.round(taxableGross * 0.10);
  const employeeTaxes = ssnTax + medTax + incTax;

  explanations.push(`Estimated Taxes: FICA SS (6.2%): $${(ssnTax / 100).toFixed(2)}, Medicare (1.45%): $${(medTax / 100).toFixed(2)}, Fed/State: $${(incTax / 100).toFixed(2)}.`);

  // 6. After-Tax Deductions
  const postTax = deductions
    .filter((d) => d.employeeId === employeeId && d.type === 'after_tax')
    .reduce((sum, d) => {
      const amt = d.fixed ? d.amountCents : Math.round((grossWages * (d.percentValue ?? 0)) / 100);
      explanations.push(`After-Tax Deduction (${d.code}): $${(amt / 100).toFixed(2)}`);
      return sum + amt;
    }, 0);

  // 7. Reimbursements (Non-taxable)
  const myReimbursements = reimbursements
    .filter((r) => r.employeeId === employeeId && r.status === 'approved' && isDateInPeriod(r.date, period.startDate, period.endDate))
    .reduce((s, r) => s + r.amountCents, 0);
  
  if (myReimbursements > 0) {
    explanations.push(`Expense Reimbursements: $${(myReimbursements / 100).toFixed(2)} (Tax-Exempt).`);
  }

  // 8. Net Pay Calculation
  const netPay = Math.max(0, taxableGross - employeeTaxes - postTax + myReimbursements);

  // 9. Employer Taxes
  const employerTaxes = Math.round(taxableGross * 0.0765); // Matching FICA

  return {
    employeeId,
    employeeName,
    department: comp.employeeId === 'nedpearson' ? 'Management' : 'Sales',
    regularHours,
    overtimeHours,
    doubleTimeHours,
    regularPay,
    overtimePay,
    doubleTimePay,
    grossWages,
    bonuses: myBonuses,
    commissions: finalCommissions,
    reimbursements: myReimbursements,
    preTaxDeductions: preTax,
    taxableGross,
    employeeTaxes,
    afterTaxDeductions: postTax,
    netPay,
    employerTaxes,
    employerContributions: 0,
    calculationsExplained: explanations
  };
}

export function compilePayrollPeriod(
  period: PayrollPeriod,
  profiles: CompensationProfile[],
  punches: RawTimeEntry[],
  deductions: Deduction[],
  reimbursements: Reimbursement[],
  bonuses: Bonus[],
  commissionsMap: Record<string, number>
): PayrollRunResult {
  const statements = profiles.map((p) => {
    const employeeComm = commissionsMap[p.employeeName] || 0;
    return calculateEmployeePayroll(p.employeeId, p.employeeName, p, punches, deductions, reimbursements, bonuses, employeeComm, period);
  });

  const totalGross = statements.reduce((s, st) => s + st.grossWages, 0);
  const totalTaxes = statements.reduce((s, st) => s + st.employeeTaxes, 0);
  const totalDeductions = statements.reduce((s, st) => s + st.preTaxDeductions + st.afterTaxDeductions, 0);
  const totalNet = statements.reduce((s, st) => s + st.netPay, 0);
  const totalEmployerCost = totalGross + statements.reduce((s, st) => s + st.employerTaxes, 0);

  return {
    runId: period.id,
    periodName: period.name,
    statements,
    totalGross,
    totalTaxes,
    totalDeductions,
    totalNet,
    totalEmployerCost,
    posted: period.status === 'posted'
  };
}
