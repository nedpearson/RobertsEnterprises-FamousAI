import {
  MarketingProvider,
  MarketingBrand,
  MarketingConnection,
  MarketingCampaign,
  MarketingContentPost,
  MarketingCreative,
  MarketingAudience,
  MarketingBudget,
  VendorCoopClaim,
  MarketingAttributionTouch,
  MarketingAutomationRule,
  MarketingMetricsSummary,
} from '../types/marketingTypes';

const CONNECTIONS_STORAGE_KEY = 'vowos_marketing_connections_v1';
const CAMPAIGNS_STORAGE_KEY = 'vowos_marketing_campaigns_v1';
const CONTENT_STORAGE_KEY = 'vowos_marketing_content_v1';
const CREATIVES_STORAGE_KEY = 'vowos_marketing_creatives_v1';
const BUDGETS_STORAGE_KEY = 'vowos_marketing_budgets_v1';
const EMERGENCY_PAUSE_KEY = 'vowos_marketing_emergency_pause_v1';

// Initial Connections
const INITIAL_CONNECTIONS: MarketingConnection[] = [
  {
    id: 'conn-meta',
    provider: 'meta',
    status: 'connected',
    externalBusinessId: 'meta_biz_8819402',
    externalBusinessName: 'Roberts Enterprises (Meta Business Suite)',
    connectedAt: '2026-05-10T10:00:00Z',
    lastVerifiedAt: new Date().toISOString(),
    grantedScopes: ['ads_management', 'pages_read_engagement', 'instagram_basic', 'ads_read', 'catalog_management'],
    tokenHealth: 'Healthy',
    accounts: [
      {
        id: 'acc-meta-ad1',
        connectionId: 'conn-meta',
        accountType: 'ad_account',
        externalAccountId: 'act_102938475',
        externalAccountName: 'I Do Bridal Couture — Primary Ad Account',
        brand: 'ido',
        locations: ['ido-br', 'ido-cov'],
        active: true,
      },
      {
        id: 'acc-meta-ad2',
        connectionId: 'conn-meta',
        accountType: 'ad_account',
        externalAccountId: 'act_998877665',
        externalAccountName: 'Proper & Co. — Ecommerce Ad Account',
        brand: 'proper',
        locations: ['pc-br', 'pc-cov'],
        active: true,
      },
      {
        id: 'acc-meta-page1',
        connectionId: 'conn-meta',
        accountType: 'page',
        externalAccountId: 'page_445566778',
        externalAccountName: 'I Do Bridal Couture Facebook Page',
        brand: 'ido',
        locations: ['ido-br', 'ido-cov'],
        active: true,
      },
      {
        id: 'acc-meta-ig1',
        connectionId: 'conn-meta',
        accountType: 'instagram_prof',
        externalAccountId: 'ig_99221144',
        externalAccountName: '@idobridalcouture (Instagram)',
        brand: 'ido',
        locations: ['ido-br', 'ido-cov'],
        active: true,
      },
    ],
  },
  {
    id: 'conn-google',
    provider: 'google',
    status: 'connected',
    externalBusinessId: 'g_ads_77492019',
    externalBusinessName: 'Roberts Enterprises Google Ads Manager',
    connectedAt: '2026-06-01T14:30:00Z',
    lastVerifiedAt: new Date().toISOString(),
    grantedScopes: ['https://www.googleapis.com/auth/adwords', 'https://www.googleapis.com/auth/analytics.readonly'],
    tokenHealth: 'Healthy',
    accounts: [
      {
        id: 'acc-g-ad1',
        connectionId: 'conn-google',
        accountType: 'ad_account',
        externalAccountId: '882-991-0023',
        externalAccountName: 'Roberts Enterprises — Google Search & Local Ads',
        brand: 'ido',
        locations: ['ido-br', 'ido-cov'],
        active: true,
      },
    ],
  },
  {
    id: 'conn-tiktok',
    provider: 'tiktok',
    status: 'connected',
    externalBusinessId: 'tt_biz_3391029',
    externalBusinessName: 'Proper & Co. TikTok Business Center',
    connectedAt: '2026-06-15T09:15:00Z',
    lastVerifiedAt: new Date().toISOString(),
    grantedScopes: ['user.info.basic', 'video.publish', 'ad.management'],
    tokenHealth: 'Healthy',
    accounts: [
      {
        id: 'acc-tt-ad1',
        connectionId: 'conn-tiktok',
        accountType: 'ad_account',
        externalAccountId: 'tt_act_776655',
        externalAccountName: 'Proper & Co. TikTok Ads Account',
        brand: 'proper',
        locations: ['pc-br', 'pc-cov'],
        active: true,
      },
    ],
  },
  {
    id: 'conn-shopify',
    provider: 'shopify',
    status: 'connected',
    externalBusinessId: 'shopify_proper_co',
    externalBusinessName: 'Proper & Co. Shopify Store',
    connectedAt: '2026-04-01T10:00:00Z',
    lastVerifiedAt: new Date().toISOString(),
    grantedScopes: ['read_products', 'read_orders', 'read_customers'],
    tokenHealth: 'Healthy',
    accounts: [],
  },
  {
    id: 'conn-klaviyo',
    provider: 'klaviyo',
    status: 'connected',
    externalBusinessId: 'klaviyo_org_881',
    externalBusinessName: 'I Do Bridal & Proper & Co. Klaviyo Account',
    connectedAt: '2026-05-01T12:00:00Z',
    lastVerifiedAt: new Date().toISOString(),
    grantedScopes: ['campaigns:read', 'lists:read', 'profiles:read'],
    tokenHealth: 'Healthy',
    accounts: [],
  },
  {
    id: 'conn-call-tracking',
    provider: 'call_tracking',
    status: 'connected',
    externalBusinessId: 'ct_metrics_551',
    externalBusinessName: 'Baton Rouge & Covington CallRail Dynamics',
    connectedAt: '2026-06-10T14:00:00Z',
    lastVerifiedAt: new Date().toISOString(),
    grantedScopes: ['calls:read', 'numbers:read'],
    tokenHealth: 'Healthy',
    accounts: [],
  },
  {
    id: 'conn-web-forms',
    provider: 'web_forms',
    status: 'connected',
    externalBusinessId: 'vowos_web_ingest',
    externalBusinessName: 'VowOS Unified Web Form Ingestion API',
    connectedAt: '2026-01-01T00:00:00Z',
    lastVerifiedAt: new Date().toISOString(),
    grantedScopes: ['forms:write', 'leads:ingest'],
    tokenHealth: 'Healthy',
    accounts: [],
  },
  {
    id: 'conn-pinterest',
    provider: 'pinterest',
    status: 'connected',
    externalBusinessId: 'pin_biz_554433',
    externalBusinessName: 'I Do Bridal Pinterest Business',
    connectedAt: '2026-06-20T11:00:00Z',
    lastVerifiedAt: new Date().toISOString(),
    grantedScopes: ['ads:read', 'ads:write', 'boards:read', 'pins:write'],
    tokenHealth: 'Healthy',
    accounts: [
      {
        id: 'acc-pin-ad1',
        connectionId: 'conn-pinterest',
        accountType: 'ad_account',
        externalAccountId: 'pin_act_12345',
        externalAccountName: 'I Do Bridal — Pinterest Inspiration Ads',
        brand: 'ido',
        locations: ['ido-br', 'ido-cov'],
        active: true,
      },
    ],
  },
  {
    id: 'conn-linkedin',
    provider: 'linkedin',
    status: 'disconnected',
    externalBusinessId: '',
    externalBusinessName: '',
    connectedAt: '',
    lastVerifiedAt: '',
    grantedScopes: [],
    tokenHealth: 'Expired',
    accounts: [],
  },
];

// Initial Campaigns
const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'camp-001',
    name: 'Fall 2026 Bridal Consultation Appointments Drive',
    description: 'Targeting newly engaged brides in Baton Rouge & Covington area for 1-on-1 bridal fitting appointments.',
    brand: 'ido',
    locations: ['ido-br', 'ido-cov'],
    objective: 'bridal_appointments',
    providers: ['meta', 'google', 'pinterest'],
    status: 'active',
    approvalStatus: 'approved',
    plannedBudgetCents: 250000, // $2,500.00
    approvedBudgetCents: 250000,
    actualSpendCents: 184500, // $1,845.00
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    targetAudience: 'Engaged Women 22-38, 50-mile radius around Baton Rouge & Covington',
    destinationUrl: 'https://robertsenterprises.bridgebox.ai/#booking',
    utmSource: 'facebook_instagram',
    utmMedium: 'cpc',
    utmCampaign: 'fall_bridal_consultations_2026',
    createdBy: 'Ramsey Roberts',
    approvedBy: 'Ramsey Roberts',
    createdAt: '2026-06-25T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'camp-002',
    name: 'Proper & Co. New Arrivals & Ready-to-Ship Promo',
    description: 'Promoting Proper & Co. boutique footwear, veil accessories, and cocktail dresses for online & store sales.',
    brand: 'proper',
    locations: ['pc-br', 'pc-cov'],
    objective: 'promote_new_arrivals',
    providers: ['meta', 'tiktok'],
    status: 'active',
    approvalStatus: 'approved',
    plannedBudgetCents: 150000, // $1,500.00
    approvedBudgetCents: 150000,
    actualSpendCents: 98000, // $980.00
    startDate: '2026-07-05',
    endDate: '2026-08-05',
    targetAudience: 'Style-conscious shoppers, cart abandoners & website retargeting',
    destinationUrl: 'https://properandcompany.myshopify.com',
    utmSource: 'meta_tiktok',
    utmMedium: 'social_paid',
    utmCampaign: 'proper_new_arrivals_q3',
    createdBy: 'Marketing Manager',
    approvedBy: 'Ramsey Roberts',
    createdAt: '2026-07-02T14:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'camp-003',
    name: 'Ines Di Santo Exclusive Trunk Show Announcement',
    description: 'Special weekend trunk show event promotion for Baton Rouge boutique featuring the new couture collection.',
    brand: 'ido',
    locations: ['ido-br'],
    objective: 'trunk_show',
    providers: ['meta', 'pinterest'],
    status: 'review',
    approvalStatus: 'pending',
    plannedBudgetCents: 100000, // $1,000.00
    approvedBudgetCents: 100000,
    actualSpendCents: 0,
    startDate: '2026-08-10',
    endDate: '2026-08-17',
    targetAudience: 'High-intent luxury bridal shoppers, Pinterest wedding board pinners',
    destinationUrl: 'https://robertsenterprises.bridgebox.ai/#trunkshow',
    utmSource: 'pinterest_meta',
    utmMedium: 'event_ad',
    utmCampaign: 'ines_di_santo_trunkshow_2026',
    vendorCoopId: 'coop-ines-01',
    createdBy: 'Marketing Manager',
    createdAt: '2026-07-20T11:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

// Initial Content Posts
const INITIAL_CONTENT: MarketingContentPost[] = [
  {
    id: 'post-101',
    brand: 'ido',
    location: 'ido-br',
    provider: 'meta',
    postType: 'image',
    caption: 'Behind the scenes at I Do Bridal Couture Baton Rouge ✨ Every fitting suite is prepared for our weekend brides. Book your private appointment online today! #IDoBridal #BatonRougeBridal #LouisianaBride',
    mediaUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
    scheduledAt: '2026-07-28T16:00:00Z',
    status: 'scheduled',
    approvalStatus: 'approved',
    createdBy: 'Social Media Coordinator',
  },
  {
    id: 'post-102',
    brand: 'proper',
    location: 'pc-br',
    postType: 'carousel',
    provider: 'tiktok',
    caption: 'Unboxing the new Proper & Co. satin bridal heels & pearl veils 🤍 Now available in Baton Rouge & online! #ProperAndCo #BridalStyle #ShopBatonRouge',
    mediaUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    scheduledAt: '2026-07-29T18:30:00Z',
    status: 'scheduled',
    approvalStatus: 'approved',
    createdBy: 'Social Media Coordinator',
  },
];

// Initial Creatives
const INITIAL_CREATIVES: MarketingCreative[] = [
  {
    id: 'cr-201',
    name: 'Luxury Fitting Room Suite Photo',
    brand: 'ido',
    creativeType: 'image',
    headline: 'Find Your Dream Gown at I Do Bridal Couture',
    primaryText: 'Experience Louisiana’s premier bridal salon in Baton Rouge & Covington.',
    description: 'Private fitting suites & personal stylist guidance.',
    callToAction: 'Book Appointment',
    destinationUrl: 'https://robertsenterprises.bridgebox.ai/#booking',
    mediaAssetUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
    aspectRatio: '1:1',
    approvalStatus: 'approved',
    hasBridePhotoConsent: false,
    createdAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 'cr-202',
    name: 'Proper Accessories Carousel Reel',
    brand: 'proper',
    creativeType: 'carousel',
    headline: 'Elevate Your Wedding Day Details',
    primaryText: 'Explore handcrafted veils, shoes, and jewelry at Proper & Co.',
    description: 'Free shipping on orders over $150.',
    callToAction: 'Shop Now',
    destinationUrl: 'https://properandcompany.myshopify.com',
    mediaAssetUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    aspectRatio: '9:16',
    approvalStatus: 'approved',
    hasBridePhotoConsent: false,
    createdAt: '2026-07-01T14:20:00Z',
  },
];

// Initial Vendor Co-op Claims
const INITIAL_VENDOR_CLAIMS: VendorCoopClaim[] = [
  {
    id: 'coop-ines-01',
    vendorName: 'Ines Di Santo',
    programName: 'Fall 2026 Co-Op Ad Fund',
    brand: 'ido',
    approvedAmountCents: 50000, // $500.00
    actualSpendCents: 45000,
    claimStatus: 'submitted',
    reimbursementCents: 50000,
    deadlineDate: '2026-08-31',
    notes: '50% matching vendor fund for trunk show social advertising.',
  },
];

// Initial Attribution Touches
const INITIAL_ATTRIBUTION: MarketingAttributionTouch[] = [
  {
    id: 'touch-1',
    customerName: 'Whitney Guidry',
    provider: 'meta',
    campaignName: 'Fall 2026 Bridal Consultation Appointments Drive',
    utmSource: 'facebook_instagram',
    utmMedium: 'cpc',
    occurredAt: '2026-07-12T11:20:00Z',
    appointmentBooked: true,
    saleAmountCents: 345000, // $3,450.00
    channelType: 'In-Store Boutique',
  },
  {
    id: 'touch-2',
    customerName: 'Lauren Boudreaux',
    provider: 'google',
    campaignName: 'Baton Rouge Local Search Campaign',
    utmSource: 'google',
    utmMedium: 'search',
    occurredAt: '2026-07-15T15:45:00Z',
    appointmentBooked: true,
    saleAmountCents: 280000, // $2,800.00
    channelType: 'In-Store Boutique',
  },
  {
    id: 'touch-3',
    customerName: 'Claire Duplechain',
    provider: 'tiktok',
    campaignName: 'Proper & Co. New Arrivals & Ready-to-Ship Promo',
    utmSource: 'tiktok',
    utmMedium: 'social_paid',
    occurredAt: '2026-07-18T19:10:00Z',
    appointmentBooked: false,
    saleAmountCents: 42000, // $420.00
    channelType: 'Online Shopify',
  },
];

// API Functions
export function getMarketingConnections(): MarketingConnection[] {
  try {
    const raw = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CONNECTIONS;
  } catch {
    return INITIAL_CONNECTIONS;
  }
}

export function saveMarketingConnections(conns: MarketingConnection[]) {
  localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(conns));
}

export function connectProviderOAuth(provider: MarketingProvider, businessName: string): MarketingConnection {
  const list = getMarketingConnections();
  const existing = list.find((c) => c.provider === provider);
  const updatedToken = `oauth_token_${provider}_${Math.random().toString(36).slice(2, 10)}`;

  const updatedConn: MarketingConnection = {
    id: existing?.id || `conn-${provider}`,
    provider,
    status: 'connected',
    externalBusinessId: `${provider}_biz_${Math.floor(100000 + Math.random() * 900000)}`,
    externalBusinessName: businessName || `${provider.toUpperCase()} Authorized Business Account`,
    connectedAt: existing?.connectedAt || new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    grantedScopes: ['ads_management', 'analytics_read', 'catalog_write', 'lead_form_read'],
    tokenHealth: 'Healthy',
    accounts: [
      {
        id: `acc-${provider}-1`,
        connectionId: existing?.id || `conn-${provider}`,
        accountType: 'ad_account',
        externalAccountId: `act_${Math.floor(100000 + Math.random() * 900000)}`,
        externalAccountName: `Roberts Enterprises — ${provider.toUpperCase()} Ad Account`,
        brand: 'ido',
        locations: ['ido-br', 'ido-cov'],
        active: true,
      },
    ],
  };

  const nextList = list.filter((c) => c.provider !== provider).concat(updatedConn);
  saveMarketingConnections(nextList);
  return updatedConn;
}

export function disconnectProviderOAuth(provider: MarketingProvider) {
  const list = getMarketingConnections();
  const nextList = list.map((c) => (c.provider === provider ? { ...c, status: 'disconnected' as const, tokenHealth: 'Expired' as const } : c));
  saveMarketingConnections(nextList);
}

export function getMarketingCampaigns(): MarketingCampaign[] {
  try {
    const raw = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CAMPAIGNS;
  } catch {
    return INITIAL_CAMPAIGNS;
  }
}

export function saveMarketingCampaigns(camps: MarketingCampaign[]) {
  localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(camps));
}

export function createCampaign(data: Partial<MarketingCampaign>): MarketingCampaign {
  const list = getMarketingCampaigns();
  const newCamp: MarketingCampaign = {
    id: `camp-${Date.now()}`,
    name: data.name || 'New Marketing Campaign',
    description: data.description || '',
    brand: data.brand || 'ido',
    locations: data.locations || ['ido-br'],
    objective: data.objective || 'bridal_appointments',
    providers: data.providers || ['meta'],
    status: 'draft',
    approvalStatus: 'pending',
    plannedBudgetCents: data.plannedBudgetCents || 100000,
    approvedBudgetCents: data.approvedBudgetCents || 100000,
    actualSpendCents: 0,
    startDate: data.startDate || new Date().toISOString().slice(0, 10),
    endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    targetAudience: data.targetAudience || 'Target local audience',
    destinationUrl: data.destinationUrl || 'https://robertsenterprises.bridgebox.ai',
    utmSource: data.providers?.join('_') || 'meta',
    utmMedium: 'cpc',
    utmCampaign: (data.name || 'campaign').toLowerCase().replace(/\s+/g, '_'),
    createdBy: 'Ramsey Roberts',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const nextList = [newCamp, ...list];
  saveMarketingCampaigns(nextList);
  return newCamp;
}

export function updateCampaignStatus(id: string, status: MarketingCampaign['status']) {
  const list = getMarketingCampaigns();
  const nextList = list.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c));
  saveMarketingCampaigns(nextList);
}

export function getEmergencyPauseStatus(): boolean {
  return localStorage.getItem(EMERGENCY_PAUSE_KEY) === 'true';
}

export function setEmergencyPauseStatus(paused: boolean) {
  localStorage.setItem(EMERGENCY_PAUSE_KEY, String(paused));
  
  if (paused) {
    // 1. Update frontend state
    const list = getMarketingCampaigns();
    const nextList = list.map((c) => (c.status === 'active' ? { ...c, status: 'paused' as const } : c));
    saveMarketingCampaigns(nextList);
    
    // 2. Queue durable job on the backend to enforce this in real external APIs
    fetch('http://localhost:8080/api/campaigns/pause-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand: 'Proper & Company' })
    }).catch(err => console.error('Failed to queue emergency pause job', err));
  }
}

export function getMarketingContentPosts(): MarketingContentPost[] {
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CONTENT;
  } catch {
    return INITIAL_CONTENT;
  }
}

export function saveMarketingContentPosts(posts: MarketingContentPost[]) {
  localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(posts));
}

export function createContentPost(post: Partial<MarketingContentPost>): MarketingContentPost {
  const list = getMarketingContentPosts();
  const newPost: MarketingContentPost = {
    id: `post-${Date.now()}`,
    brand: post.brand || 'ido',
    location: post.location || 'ido-br',
    provider: post.provider || 'meta',
    postType: post.postType || 'image',
    caption: post.caption || '',
    mediaUrl: post.mediaUrl || 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
    scheduledAt: post.scheduledAt || new Date().toISOString(),
    status: 'scheduled',
    approvalStatus: 'approved',
    createdBy: 'Social Media Coordinator',
  };
  saveMarketingContentPosts([newPost, ...list]);
  return newPost;
}

export function getMarketingCreatives(): MarketingCreative[] {
  try {
    const raw = localStorage.getItem(CREATIVES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CREATIVES;
  } catch {
    return INITIAL_CREATIVES;
  }
}

export function getVendorCoopClaims(): VendorCoopClaim[] {
  return INITIAL_VENDOR_CLAIMS;
}

export function getAttributionTouches(): MarketingAttributionTouch[] {
  return INITIAL_ATTRIBUTION;
}

export function getMarketingMetricsSummary(brandFilter: string = 'all', locationFilter: string = 'all'): MarketingMetricsSummary {
  const campaigns = getMarketingCampaigns();
  const filtered = campaigns.filter((c) => {
    if (brandFilter !== 'all' && c.brand !== brandFilter) return false;
    if (locationFilter !== 'all' && !c.locations.includes(locationFilter as any)) return false;
    return true;
  });

  const totalApproved = filtered.reduce((s, c) => s + c.approvedBudgetCents, 0);
  const actualSpend = filtered.reduce((s, c) => s + c.actualSpendCents, 0);
  const activeCount = filtered.filter((c) => c.status === 'active').length;
  const pendingApprovals = filtered.filter((c) => c.approvalStatus === 'pending').length;

  const attributedRev = 667000; // $6,670.00
  const shopifyRev = 142000; // $1,420.00
  const inStoreRev = 525000; // $5,250.00

  const roas = actualSpend > 0 ? Number((attributedRev / actualSpend).toFixed(2)) : 3.62;

  return {
    totalApprovedBudgetCents: totalApproved,
    actualSpendCents: actualSpend,
    remainingBudgetCents: Math.max(0, totalApproved - actualSpend),
    spendPacingPct: totalApproved > 0 ? Math.round((actualSpend / totalApproved) * 100) : 0,
    activeCampaignsCount: activeCount,
    pendingApprovalsCount: pendingApprovals,
    leadsGeneratedCount: 38,
    costPerLeadCents: actualSpend > 0 ? Math.round(actualSpend / 38) : 7434, // ~$74.34
    appointmentsBookedCount: 14,
    costPerAppointmentCents: actualSpend > 0 ? Math.round(actualSpend / 14) : 20178, // ~$201.78
    attributedRevenueCents: attributedRev,
    roasMultiplier: roas,
    marketingEfficiencyRatioPct: 18.5,
    shopifyRevenueCents: shopifyRev,
    inStoreRevenueCents: inStoreRev,
    emergencyPauseActive: getEmergencyPauseStatus(),
  };
}

// AI Prospecting Mocks
import { DiscoveredLead, OutreachDraft } from '../types/marketingTypes';

const MOCK_LEADS: DiscoveredLead[] = [
  {
    id: 'lead_1',
    source: 'reddit',
    author: 'u/BatonRougeBride27',
    content: 'Just got engaged over the weekend! Where are the best places in BR or Covington to look for modern bridal gowns?',
    intentScore: 'High',
    discoveredAt: new Date(Date.now() - 3600000).toISOString(),
    url: 'https://reddit.com/r/batonrouge',
    brand: 'ido'
  },
  {
    id: 'lead_2',
    source: 'tiktok',
    author: '@summer_style_louisiana',
    content: 'Looking for some cute linen sets for a bachelorette trip to 30A next month, any local boutique recs?',
    intentScore: 'High',
    discoveredAt: new Date(Date.now() - 7200000).toISOString(),
    url: 'https://tiktok.com',
    brand: 'proper'
  }
];

export function getDiscoveredLeads(brandFilter: string = 'all'): DiscoveredLead[] {
  if (brandFilter === 'all') return MOCK_LEADS;
  return MOCK_LEADS.filter(l => l.brand === brandFilter);
}

export function generateMockOutreach(leadId: string): Promise<OutreachDraft> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: `draft_${Date.now()}`,
        leadId,
        draftContent: "Hi there! Congratulations! We saw you're looking for outfits in the area. We have exactly that style at our boutique. We'd love to host you whenever you're ready!",
        generatedAt: new Date().toISOString(),
        status: 'pending_approval'
      });
    }, 1500);
  });
}
