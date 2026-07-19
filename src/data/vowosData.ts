// ─── VowOS by Roberts Enterprises — Shared Data Module ───
// Types, static catalog data, and formatting helpers.
// Business records (brides, leads, appointments, invoices, purchase orders)
// now live in database tables and are loaded via VowosDataContext.

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

export interface Invoice {
  id: string;
  customer: string;
  description: string;
  amountCents: number;
  paidCents: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Open' | 'Overdue';
}

export interface Appointment {
  id: string;
  customer: string;
  type: 'Bridal Consultation' | 'Fitting' | 'Alterations' | 'Pickup' | 'Accessories';
  date: string;
  time: string;
  stylist: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
}

export interface PurchaseOrder {
  id: string;
  vendor: string;
  items: string;
  amountCents: number;
  ordered: string;
  expectedDelivery: string;
  status: 'Ordered' | 'In Transit' | 'Delivered' | 'Delayed';
}

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
