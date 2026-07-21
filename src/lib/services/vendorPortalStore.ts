import { fetchJsonSetting, saveJsonSetting } from '@/lib/settings';

export interface VendorPortal {
  id: string;
  name: string;
  brand: string;
  portalUrl: string;
  username: string;
  password?: string;
  dealerId: string;
  repName: string;
  repPhone: string;
  repEmail: string;
  avgLeadTimeDays: number;
  notes?: string;
}

const DEFAULT_VENDOR_PORTALS: VendorPortal[] = [
  {
    id: 'v-justin-alexander',
    name: 'Justin Alexander Retailer Portal',
    brand: 'Justin Alexander',
    portalUrl: 'https://portal.justinalexander.com',
    username: 'ramsey@robertsenterprises.com',
    password: 'JA_Roberts_2026!Secure',
    dealerId: 'JA-LA-0491',
    repName: 'Clara Vance',
    repPhone: '(504) 555-0192',
    repEmail: 'clara.vance@justinalexander.com',
    avgLeadTimeDays: 42,
    notes: 'Primary supplier for I Do Bridal Couture Covington & Baton Rouge.',
  },
  {
    id: 'v-pronovias',
    name: 'Pronovias Group B2B Ordering',
    brand: 'Pronovias',
    portalUrl: 'https://b2b.pronoviasgroup.com',
    username: 'purchasing@robertsenterprises.com',
    password: 'PRN_Couture_9928#Pass',
    dealerId: 'PRN-US-8821',
    repName: 'Mateo Rossi',
    repPhone: '(305) 555-0144',
    repEmail: 'm.rossi@pronovias.es',
    avgLeadTimeDays: 50,
    notes: 'Barcelona factory orders. Require custom measurements on all special orders.',
  },
  {
    id: 'v-essense',
    name: 'Essense of Australia & Martina Liana',
    brand: 'Essense of Australia',
    portalUrl: 'https://retailers.essensedesigns.com',
    username: 'orders@idobridalcouture.com',
    password: 'Essense_Retailer_2026$',
    dealerId: 'ESS-9912',
    repName: 'Hannah Brooks',
    repPhone: '(913) 555-0812',
    repEmail: 'hannah@essensedesigns.com',
    avgLeadTimeDays: 38,
    notes: 'Rush delivery available for 15% surcharge.',
  },
  {
    id: 'v-morilee',
    name: 'Morilee Madeline Gardner Direct',
    brand: 'Morilee',
    portalUrl: 'https://direct.morilee.com',
    username: 'ramsey@properandco.com',
    password: 'Morilee_Proper_7712!',
    dealerId: 'MOR-LA-7712',
    repName: 'Jennifer Leigh',
    repPhone: '(212) 555-0988',
    repEmail: 'j.leigh@morilee.com',
    avgLeadTimeDays: 35,
    notes: 'Trunk show sample discounts apply automatically.',
  },
  {
    id: 'v-veilco',
    name: 'Veil & Co. Accessory Atelier',
    brand: 'Veil & Co.',
    portalUrl: 'https://wholesale.veilco.com',
    username: 'accessories@robertsenterprises.com',
    password: 'Veil_Accessories_2026',
    dealerId: 'VCO-1092',
    repName: 'Marcus Sterling',
    repPhone: '(404) 555-0319',
    repEmail: 'marcus@veilco.com',
    avgLeadTimeDays: 14,
    notes: 'Veils, tiaras, and bridal jewelry fast-track delivery.',
  },
];

export async function getVendorPortals(): Promise<VendorPortal[]> {
  const data = await fetchJsonSetting<VendorPortal[]>('vendor_portals_vault', DEFAULT_VENDOR_PORTALS);
  if (!data || data.length === 0) {
    await saveJsonSetting('vendor_portals_vault', DEFAULT_VENDOR_PORTALS);
    return DEFAULT_VENDOR_PORTALS;
  }
  return data;
}

export async function saveVendorPortal(portal: VendorPortal): Promise<VendorPortal[]> {
  const current = await getVendorPortals();
  const existingIdx = current.findIndex((p) => p.id === portal.id);
  let updated: VendorPortal[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = portal;
  } else {
    updated = [...current, portal];
  }

  await saveJsonSetting('vendor_portals_vault', updated);
  return updated;
}

export async function deleteVendorPortal(portalId: string): Promise<VendorPortal[]> {
  const current = await getVendorPortals();
  const updated = current.filter((p) => p.id !== portalId);
  await saveJsonSetting('vendor_portals_vault', updated);
  return updated;
}
