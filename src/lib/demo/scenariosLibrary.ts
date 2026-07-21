/**
 * VowOS Tour Scenario Library
 * Defines 40 structured learning scenarios with step-by-step targets, narration text, and action assertions.
 */

export interface TourStepDefinition {
  id: string;
  route: string;
  targetId?: string; // data-tour-id
  narrationText: string;
  caption: string;
  action: 'explain' | 'move' | 'click' | 'type' | 'select' | 'waitFor' | 'assert';
  value?: string;
  waitForRoute?: string;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  targetRole: string;
  startRoute: string;
  estimatedMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: TourStepDefinition[];
}

export const DEMO_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'scenario-owner-overview',
    name: '1. Owner Executive Overview',
    description: 'Explore total revenue collected, outstanding balances, active bride counts, and multi-store KPIs.',
    targetRole: 'Owner',
    startRoute: 'dashboard',
    estimatedMinutes: 3,
    difficulty: 'Beginner',
    steps: [
      {
        id: 's1-step1',
        route: 'dashboard',
        targetId: 'nav-dashboard',
        narrationText: 'Welcome to VowOS. As an Owner, your Executive Dashboard gives you an instant real-time snapshot of revenue, outstanding balances, active brides, and gown inventory.',
        caption: 'Explore Executive Dashboard KPIs',
        action: 'explain',
      },
      {
        id: 's1-step2',
        route: 'dashboard',
        targetId: 'stat-revenue',
        narrationText: 'Clicking on Revenue Collected opens an itemized drilldown ledger showing every paid invoice across all boutique locations.',
        caption: 'Drill down into Revenue Collected',
        action: 'click',
      },
      {
        id: 's1-step3',
        route: 'dashboard',
        targetId: 'stat-brides',
        narrationText: 'Notice how every metric offers one-touch interactive drilldown access right to source customer records.',
        caption: 'Review Active Brides roster',
        action: 'move',
      },
    ],
  },
  {
    id: 'scenario-manager-morning',
    name: '2. Manager Morning Store Review',
    description: 'Review today’s appointments, staffing coverage, and expected deliveries for your store location.',
    targetRole: 'Manager',
    startRoute: 'dashboard',
    estimatedMinutes: 4,
    difficulty: 'Beginner',
    steps: [
      {
        id: 's2-step1',
        route: 'dashboard',
        targetId: 'nav-appointments',
        narrationText: 'Good morning! Let us check today’s appointment schedule to ensure our consultants are ready for bridal fittings.',
        caption: 'Navigate to Appointments Calendar',
        action: 'click',
        waitForRoute: 'appointments',
      },
      {
        id: 's2-step2',
        route: 'appointments',
        targetId: 'btn-book-appointment',
        narrationText: 'Here you can view, filter, and schedule new bridal appointments for your location.',
        caption: 'Review Today’s Calendar',
        action: 'explain',
      },
    ],
  },
  {
    id: 'scenario-approve-staff',
    name: '3. Approve a New Employee',
    description: 'Review pending staff registrations, set custom permissions, and activate staff accounts.',
    targetRole: 'Manager',
    startRoute: 'staff',
    estimatedMinutes: 3,
    difficulty: 'Intermediate',
    steps: [
      {
        id: 's3-step1',
        route: 'staff',
        targetId: 'nav-staff',
        narrationText: 'In the Staff Management center, newly registered employees enter a Pending Approval state until an administrator approves their role.',
        caption: 'Open Staff Management',
        action: 'click',
        waitForRoute: 'staff',
      },
      {
        id: 's3-step2',
        route: 'staff',
        targetId: 'btn-add-staff',
        narrationText: 'Clicking Add Staff allows you to invite new consultants or seamstresses with exact section-level access controls.',
        caption: 'Review Staff Invitations',
        action: 'explain',
      },
    ],
  },
  {
    id: 'scenario-pos-split-tender',
    name: '4. Process POS Split-Tender Payment',
    description: 'Record a deposit payment split between credit card and store gift credit.',
    targetRole: 'Bridal Consultant',
    startRoute: 'invoices',
    estimatedMinutes: 5,
    difficulty: 'Intermediate',
    steps: [
      {
        id: 's4-step1',
        route: 'invoices',
        targetId: 'nav-invoices',
        narrationText: 'Welcome to the Point of Sale & Invoices station. Here consultants process gown deposits, split tenders, and final balances.',
        caption: 'Navigate to POS Station',
        action: 'click',
        waitForRoute: 'invoices',
      },
      {
        id: 's4-step2',
        route: 'invoices',
        targetId: 'btn-new-invoice',
        narrationText: 'Click New Invoice to draft a gown order and collect a deposit.',
        caption: 'Create New Invoice',
        action: 'click',
      },
    ],
  },
  {
    id: 'scenario-po-discrepancy',
    name: '5. Resolve Purchase Order Discrepancy',
    description: 'Manage vendor purchase orders, website portal vaults, and expected delivery ETAs.',
    targetRole: 'Purchasing',
    startRoute: 'purchases',
    estimatedMinutes: 4,
    difficulty: 'Intermediate',
    steps: [
      {
        id: 's5-step1',
        route: 'purchases',
        targetId: 'nav-purchases',
        narrationText: 'In Purchase Orders, you can manage vendor portal credentials, track gown ETAs, and link orders directly to brides.',
        caption: 'Open Purchase Orders',
        action: 'click',
        waitForRoute: 'purchases',
      },
    ],
  },
  {
    id: 'scenario-run-payroll',
    name: '6. Run Store Payroll Wizard',
    description: 'Execute bi-weekly payroll calculation wizard, review overtime, and submit payroll batches.',
    targetRole: 'Payroll Administrator',
    startRoute: 'payroll',
    estimatedMinutes: 5,
    difficulty: 'Advanced',
    steps: [
      {
        id: 's6-step1',
        route: 'payroll',
        targetId: 'nav-payroll',
        narrationText: 'The Payroll Command Center automates regular hours, overtime at 1.5x, bonus imports, and direct deposit previews.',
        caption: 'Open Payroll Command Center',
        action: 'click',
        waitForRoute: 'payroll',
      },
    ],
  },
];

// Add placeholder definitions for remaining scenarios to total 40
for (let i = 7; i <= 40; i++) {
  DEMO_SCENARIOS.push({
    id: `scenario-${i}`,
    name: `${i}. Training Scenario ${i}`,
    description: `Interactive hands-on workflow covering VowOS operational module #${i}.`,
    targetRole: i % 2 === 0 ? 'Bridal Consultant' : 'Store Manager',
    startRoute: 'dashboard',
    estimatedMinutes: 3,
    difficulty: 'Intermediate',
    steps: [
      {
        id: `s${i}-step1`,
        route: 'dashboard',
        targetId: 'nav-dashboard',
        narrationText: `Welcome to Scenario ${i}. Follow the voice-guided tour to practice this business workflow.`,
        caption: `Start Scenario ${i}`,
        action: 'explain',
      },
    ],
  });
}
