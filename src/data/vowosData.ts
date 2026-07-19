// ─── VowOS by Roberts Enterprises — Shared Data Module ───
// Single source of truth for all business data used across views.

export const HERO_IMAGE =
  'https://d64gsuwffb70l.cloudfront.net/6a5d5dc9d84ad34d886e72c1_1784503896604_2a0f57cd.jpg';

export const GOWN_IMAGES = [
  'https://d64gsuwffb70l.cloudfront.net/6a5d5dc9d84ad34d886e72c1_1784503869512_b4807712.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a5d5dc9d84ad34d886e72c1_1784503877855_0889809c.png',
  'https://d64gsuwffb70l.cloudfront.net/6a5d5dc9d84ad34d886e72c1_1784503871967_2d2bb3f7.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a5d5dc9d84ad34d886e72c1_1784503875934_d2041c7e.png',
  'https://d64gsuwffb70l.cloudfront.net/6a5d5dc9d84ad34d886e72c1_1784503877190_65ca17a3.png',
  'https://d64gsuwffb70l.cloudfront.net/6a5d5dc9d84ad34d886e72c1_1784503874335_c57ead2c.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a5d5dc9d84ad34d886e72c1_1784503876513_c986a2b7.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a5d5dc9d84ad34d886e72c1_1784503880714_6e806d03.png',
];

export interface Gown {
  id: string;
  name: string;
  designer: string;
  style: string;
  size: string;
  color: string;
  priceCents: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'On Order';
  image: string;
}

export const gowns: Gown[] = [
  { id: 'G-1001', name: 'Seraphina', designer: 'Maggie Sottero', style: 'A-Line', size: '8', color: 'Ivory', priceCents: 289900, stock: 3, status: 'In Stock', image: GOWN_IMAGES[0] },
  { id: 'G-1002', name: 'Elowen', designer: 'Pronovias', style: 'Mermaid', size: '10', color: 'Champagne', priceCents: 345000, stock: 2, status: 'In Stock', image: GOWN_IMAGES[1] },
  { id: 'G-1003', name: 'Aurelia', designer: 'Essense of Australia', style: 'Ballgown', size: '6', color: 'Ivory/Nude', priceCents: 412500, stock: 1, status: 'Low Stock', image: GOWN_IMAGES[2] },
  { id: 'G-1004', name: 'Celestine', designer: 'Stella York', style: 'Sheath', size: '12', color: 'Pearl', priceCents: 198000, stock: 4, status: 'In Stock', image: GOWN_IMAGES[3] },
  { id: 'G-1005', name: 'Isadora', designer: 'Morilee', style: 'Fit & Flare', size: '8', color: 'Ivory', priceCents: 265000, stock: 0, status: 'On Order', image: GOWN_IMAGES[4] },
  { id: 'G-1006', name: 'Vivienne', designer: 'Allure Bridals', style: 'A-Line', size: '14', color: 'Blush', priceCents: 312000, stock: 2, status: 'In Stock', image: GOWN_IMAGES[5] },
  { id: 'G-1007', name: 'Odette', designer: 'Justin Alexander', style: 'Trumpet', size: '10', color: 'Ivory/Silver', priceCents: 378500, stock: 1, status: 'Low Stock', image: GOWN_IMAGES[6] },
  { id: 'G-1008', name: 'Rosalind', designer: 'Casablanca Bridal', style: 'Ballgown', size: '6', color: 'Champagne', priceCents: 295000, stock: 3, status: 'In Stock', image: GOWN_IMAGES[7] },
];

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  weddingDate: string;
  stylist: string;
  status: 'Active' | 'Purchased' | 'Alterations' | 'Picked Up';
  spendCents: number;
}

export const customers: Customer[] = [
  { id: 'C-2001', name: 'Emily Hartwell', email: 'emily.h@email.com', phone: '(555) 201-4432', weddingDate: '2026-10-17', stylist: 'Dana R.', status: 'Alterations', spendCents: 412500 },
  { id: 'C-2002', name: 'Sofia Marchetti', email: 'sofia.m@email.com', phone: '(555) 318-9921', weddingDate: '2026-11-07', stylist: 'Priya K.', status: 'Purchased', spendCents: 345000 },
  { id: 'C-2003', name: 'Grace Okafor', email: 'grace.o@email.com', phone: '(555) 442-1180', weddingDate: '2027-01-23', stylist: 'Dana R.', status: 'Active', spendCents: 0 },
  { id: 'C-2004', name: 'Hannah Lindqvist', email: 'hannah.l@email.com', phone: '(555) 605-7714', weddingDate: '2026-09-12', stylist: 'Marcus T.', status: 'Picked Up', spendCents: 289900 },
  { id: 'C-2005', name: 'Amara Delgado', email: 'amara.d@email.com', phone: '(555) 733-2098', weddingDate: '2026-12-05', stylist: 'Priya K.', status: 'Purchased', spendCents: 378500 },
  { id: 'C-2006', name: 'Chloe Bennett', email: 'chloe.b@email.com', phone: '(555) 824-6651', weddingDate: '2027-03-14', stylist: 'Dana R.', status: 'Active', spendCents: 0 },
  { id: 'C-2007', name: 'Naomi Tanaka', email: 'naomi.t@email.com', phone: '(555) 917-3345', weddingDate: '2026-08-29', stylist: 'Marcus T.', status: 'Alterations', spendCents: 312000 },
  { id: 'C-2008', name: 'Isabella Fontaine', email: 'isabella.f@email.com', phone: '(555) 108-5567', weddingDate: '2027-02-20', stylist: 'Priya K.', status: 'Active', spendCents: 0 },
];

export type LeadStage = 'New' | 'Contacted' | 'Appointment Set' | 'Won';
export const LEAD_STAGES: LeadStage[] = ['New', 'Contacted', 'Appointment Set', 'Won'];

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  budgetCents: number;
  weddingDate: string;
  stage: LeadStage;
}

export const leads: Lead[] = [
  { id: 'L-3001', name: 'Maya Whitfield', email: 'maya.w@email.com', source: 'Instagram', budgetCents: 300000, weddingDate: '2027-05-08', stage: 'New' },
  { id: 'L-3002', name: 'Zoe Castellano', email: 'zoe.c@email.com', source: 'The Knot', budgetCents: 450000, weddingDate: '2026-12-19', stage: 'Contacted' },
  { id: 'L-3003', name: 'Lily Andersson', email: 'lily.a@email.com', source: 'Referral', budgetCents: 250000, weddingDate: '2027-04-10', stage: 'Appointment Set' },
  { id: 'L-3004', name: 'Ava Nakamura', email: 'ava.n@email.com', source: 'Google', budgetCents: 380000, weddingDate: '2027-06-26', stage: 'New' },
  { id: 'L-3005', name: 'Ruby Okonkwo', email: 'ruby.o@email.com', source: 'Bridal Expo', budgetCents: 520000, weddingDate: '2026-11-28', stage: 'Appointment Set' },
  { id: 'L-3006', name: 'Elena Vasquez', email: 'elena.v@email.com', source: 'Instagram', budgetCents: 275000, weddingDate: '2027-08-14', stage: 'Contacted' },
  { id: 'L-3007', name: 'Charlotte Reyes', email: 'charlotte.r@email.com', source: 'Referral', budgetCents: 410000, weddingDate: '2027-03-27', stage: 'Won' },
];

export interface Invoice {
  id: string;
  customer: string;
  description: string;
  amountCents: number;
  paidCents: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Open' | 'Overdue';
}

export const invoices: Invoice[] = [
  { id: 'INV-4021', customer: 'Emily Hartwell', description: 'Aurelia gown + veil', amountCents: 447500, paidCents: 447500, dueDate: '2026-06-15', status: 'Paid' },
  { id: 'INV-4022', customer: 'Sofia Marchetti', description: 'Elowen gown', amountCents: 345000, paidCents: 172500, dueDate: '2026-08-01', status: 'Partial' },
  { id: 'INV-4023', customer: 'Amara Delgado', description: 'Odette gown + alterations', amountCents: 424500, paidCents: 212250, dueDate: '2026-09-10', status: 'Partial' },
  { id: 'INV-4024', customer: 'Naomi Tanaka', description: 'Vivienne gown', amountCents: 312000, paidCents: 312000, dueDate: '2026-05-20', status: 'Paid' },
  { id: 'INV-4025', customer: 'Hannah Lindqvist', description: 'Seraphina gown + accessories', amountCents: 334900, paidCents: 334900, dueDate: '2026-04-30', status: 'Paid' },
  { id: 'INV-4026', customer: 'Charlotte Reyes', description: 'Custom order deposit', amountCents: 205000, paidCents: 0, dueDate: '2026-07-05', status: 'Overdue' },
  { id: 'INV-4027', customer: 'Chloe Bennett', description: 'Bridal accessories', amountCents: 68500, paidCents: 0, dueDate: '2026-08-15', status: 'Open' },
];

export interface Appointment {
  id: string;
  customer: string;
  type: 'Bridal Consultation' | 'Fitting' | 'Alterations' | 'Pickup' | 'Accessories';
  date: string;
  time: string;
  stylist: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
}

export const appointments: Appointment[] = [
  { id: 'A-5001', customer: 'Grace Okafor', type: 'Bridal Consultation', date: '2026-07-21', time: '10:00 AM', stylist: 'Dana R.', status: 'Confirmed' },
  { id: 'A-5002', customer: 'Emily Hartwell', type: 'Alterations', date: '2026-07-21', time: '1:30 PM', stylist: 'Marcus T.', status: 'Confirmed' },
  { id: 'A-5003', customer: 'Lily Andersson', type: 'Bridal Consultation', date: '2026-07-22', time: '11:00 AM', stylist: 'Priya K.', status: 'Pending' },
  { id: 'A-5004', customer: 'Sofia Marchetti', type: 'Fitting', date: '2026-07-23', time: '3:00 PM', stylist: 'Priya K.', status: 'Confirmed' },
  { id: 'A-5005', customer: 'Naomi Tanaka', type: 'Alterations', date: '2026-07-24', time: '10:30 AM', stylist: 'Marcus T.', status: 'Pending' },
  { id: 'A-5006', customer: 'Hannah Lindqvist', type: 'Pickup', date: '2026-07-24', time: '2:00 PM', stylist: 'Dana R.', status: 'Confirmed' },
  { id: 'A-5007', customer: 'Ruby Okonkwo', type: 'Bridal Consultation', date: '2026-07-25', time: '12:00 PM', stylist: 'Dana R.', status: 'Pending' },
  { id: 'A-5008', customer: 'Amara Delgado', type: 'Fitting', date: '2026-07-26', time: '4:00 PM', stylist: 'Priya K.', status: 'Confirmed' },
];

export interface PurchaseOrder {
  id: string;
  vendor: string;
  items: string;
  amountCents: number;
  ordered: string;
  expectedDelivery: string;
  status: 'Ordered' | 'In Transit' | 'Delivered' | 'Delayed';
}

export const purchaseOrders: PurchaseOrder[] = [
  { id: 'PO-7101', vendor: 'Morilee', items: 'Isadora gown (sz 8) — special order', amountCents: 145000, ordered: '2026-06-28', expectedDelivery: '2026-08-15', status: 'In Transit' },
  { id: 'PO-7102', vendor: 'Pronovias', items: 'Elowen restock ×2', amountCents: 310000, ordered: '2026-07-02', expectedDelivery: '2026-08-30', status: 'Ordered' },
  { id: 'PO-7103', vendor: 'Essense of Australia', items: 'Aurelia (sz 10) custom ivory', amountCents: 205000, ordered: '2026-06-10', expectedDelivery: '2026-07-25', status: 'In Transit' },
  { id: 'PO-7104', vendor: 'Veil & Co.', items: 'Cathedral veils ×6, tiaras ×4', amountCents: 84000, ordered: '2026-06-20', expectedDelivery: '2026-07-18', status: 'Delivered' },
  { id: 'PO-7105', vendor: 'Justin Alexander', items: 'Odette restock ×1', amountCents: 189000, ordered: '2026-05-30', expectedDelivery: '2026-07-10', status: 'Delayed' },
];

export const revenueByMonth = [
  { month: 'Feb', revenue: 42300 },
  { month: 'Mar', revenue: 51800 },
  { month: 'Apr', revenue: 47600 },
  { month: 'May', revenue: 63200 },
  { month: 'Jun', revenue: 58900 },
  { month: 'Jul', revenue: 71400 },
];

export const teamMembers = ['Dana R.', 'Priya K.', 'Marcus T.'];

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
