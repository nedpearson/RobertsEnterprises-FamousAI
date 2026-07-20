// ─── VowOS Payments — shared Stripe + surcharge settings module ───
// Single source of truth for the Stripe client, the configurable card
// surcharge rates (3% credit / 4% Amex by default, editable in Settings),
// and surcharge math used by the booking page, invoice pay page, and reports.

import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';

/** Connected Stripe account for Roberts Enterprises (Connect mode). */
export const STRIPE_ACCOUNT_ID = 'acct_1Tv5qwHBbeH9ngcA';

const STRIPE_PUBLISHABLE_KEY =
  'pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY, {
  stripeAccount: STRIPE_ACCOUNT_ID,
});

// ─── Surcharge settings (persisted in app_settings, enforced server-side) ───

export interface SurchargeSettings {
  /** Master switch — when off, no surcharge is added to any card. */
  enabled: boolean;
  /** Percent added for Visa / Mastercard / Discover and all non-Amex cards. */
  creditPct: number;
  /** Percent added for American Express cards. */
  amexPct: number;
}

export const DEFAULT_SURCHARGE: SurchargeSettings = { enabled: true, creditPct: 3, amexPct: 4 };

export async function fetchSurchargeSettings(): Promise<SurchargeSettings> {
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['surcharge_enabled', 'surcharge_credit_pct', 'surcharge_amex_pct']);
  const of = (key: string) => data?.find((r) => r.key === key)?.value;
  return {
    enabled: (of('surcharge_enabled') ?? 'on') !== 'off',
    creditPct: Math.max(0, parseFloat(of('surcharge_credit_pct') ?? '') || DEFAULT_SURCHARGE.creditPct),
    amexPct: Math.max(0, parseFloat(of('surcharge_amex_pct') ?? '') || DEFAULT_SURCHARGE.amexPct),
  };
}

export async function saveSurchargeSettings(s: SurchargeSettings): Promise<string | null> {
  const now = new Date().toISOString();
  const { error } = await supabase.from('app_settings').upsert([
    { key: 'surcharge_enabled', value: s.enabled ? 'on' : 'off', updated_at: now },
    { key: 'surcharge_credit_pct', value: String(s.creditPct), updated_at: now },
    { key: 'surcharge_amex_pct', value: String(s.amexPct), updated_at: now },
  ]);
  return error ? error.message : null;
}

/** Is this Stripe card brand an American Express card? */
export function isAmexBrand(brand: string | null | undefined): boolean {
  const b = (brand ?? '').toLowerCase();
  return b === 'amex' || b === 'american express';
}

/** Surcharge percent that applies to a detected card brand. */
export function surchargePctFor(brand: string | null | undefined, s: SurchargeSettings): number {
  if (!s.enabled) return 0;
  return isAmexBrand(brand) ? s.amexPct : s.creditPct;
}

/** Surcharge in cents for a base amount + detected brand. */
export function surchargeCentsFor(baseCents: number, brand: string | null | undefined, s: SurchargeSettings): number {
  return Math.round((baseCents * surchargePctFor(brand, s)) / 100);
}

/** Friendly display name for a Stripe card brand id. */
export function cardBrandLabel(brand: string | null | undefined): string {
  const map: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
  };
  return map[(brand ?? '').toLowerCase()] ?? 'card';
}
