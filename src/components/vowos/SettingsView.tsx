// ─── Settings — payment processing & card surcharges ───
// The 3% credit / 4% Amex card fees live here. Rates are stored in
// app_settings and enforced server-side by the create-payment edge function,
// so the booking page and invoice pay page always charge the saved rates.

import { useEffect, useState } from 'react';
import { CreditCard, Loader2, Save, ShieldCheck, Percent } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  SurchargeSettings,
  DEFAULT_SURCHARGE,
  fetchSurchargeSettings,
  saveSurchargeSettings,
} from '@/lib/payments';
import { BOOKING_FEE_CENTS, formatCents } from '@/data/vowosData';
import { PageHeader, inputCls, btnPrimary } from './ui';

const labelCls = 'mb-1 block text-xs font-medium uppercase tracking-wider text-stone-500';

export default function SettingsView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(DEFAULT_SURCHARGE.enabled);
  const [creditPct, setCreditPct] = useState(String(DEFAULT_SURCHARGE.creditPct));
  const [amexPct, setAmexPct] = useState(String(DEFAULT_SURCHARGE.amexPct));

  useEffect(() => {
    fetchSurchargeSettings().then((s) => {
      setEnabled(s.enabled);
      setCreditPct(String(s.creditPct));
      setAmexPct(String(s.amexPct));
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const credit = parseFloat(creditPct);
    const amex = parseFloat(amexPct);
    if (!Number.isFinite(credit) || credit < 0 || credit > 10) {
      toast({ title: 'Invalid credit card rate', description: 'Enter a percentage between 0 and 10.', variant: 'destructive' });
      return;
    }
    if (!Number.isFinite(amex) || amex < 0 || amex > 10) {
      toast({ title: 'Invalid Amex rate', description: 'Enter a percentage between 0 and 10.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const s: SurchargeSettings = { enabled, creditPct: credit, amexPct: amex };
    const err = await saveSurchargeSettings(s);
    setSaving(false);
    if (err) {
      toast({ title: 'Could not save payment settings', description: err, variant: 'destructive' });
    } else {
      toast({
        title: 'Payment settings saved',
        description: enabled
          ? `Cards now add ${credit}% (${amex}% for American Express) at checkout.`
          : 'Card surcharges are turned off — cards are charged the exact amount.',
      });
    }
  };

  const example = (pct: number) => formatCents(BOOKING_FEE_CENTS + Math.round((BOOKING_FEE_CENTS * pct) / 100));

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Payment processing rules applied to every online card payment"
      />

      <div className="max-w-2xl space-y-6">
        {/* Card surcharge settings */}
        <form onSubmit={handleSave} className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-stone-900">Card processing fees</h2>
              <p className="text-xs text-stone-500">
                Added on top of the amount due whenever a bride pays by card — booking fees and invoices.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading settings…
            </div>
          ) : (
            <>
              <label className="mt-5 flex items-center justify-between rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
                <span>
                  <span className="block text-sm font-medium text-stone-800">Charge a card surcharge</span>
                  <span className="block text-xs text-stone-500">
                    When off, cards are charged the exact amount with no added fee.
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => setEnabled((v) => !v)}
                  className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-stone-300'}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-[22px]' : 'left-0.5'}`}
                  />
                </button>
              </label>

              <div className={`mt-4 grid gap-4 sm:grid-cols-2 ${enabled ? '' : 'pointer-events-none opacity-50'}`}>
                <div>
                  <label className={labelCls} htmlFor="credit-pct">Credit / debit cards (%)</label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      id="credit-pct"
                      type="number" min="0" max="10" step="0.1"
                      value={creditPct}
                      onChange={(e) => setCreditPct(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-stone-400">
                    Visa, Mastercard, Discover &amp; all other non-Amex cards.
                  </p>
                </div>
                <div>
                  <label className={labelCls} htmlFor="amex-pct">American Express (%)</label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      id="amex-pct"
                      type="number" min="0" max="10" step="0.1"
                      value={amexPct}
                      onChange={(e) => setAmexPct(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-stone-400">
                    Amex is detected automatically from the card number.
                  </p>
                </div>
              </div>

              {enabled && (
                <div className="mt-4 rounded-xl bg-rose-50/70 p-3.5 text-xs leading-relaxed text-rose-800 ring-1 ring-rose-100">
                  Example on the {formatCents(BOOKING_FEE_CENTS)} booking fee: a Visa is charged{' '}
                  <span className="font-semibold">{example(parseFloat(creditPct) || 0)}</span>, an American
                  Express is charged <span className="font-semibold">{example(parseFloat(amexPct) || 0)}</span>.
                </div>
              )}

              <div className="mt-5 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[11px] text-stone-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Rates are enforced server-side — changes apply to the
                  next payment instantly.
                </p>
                <button type="submit" disabled={saving} className={btnPrimary}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving…' : 'Save Settings'}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Booking fee info */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg text-stone-900">Booking fee</h2>
          <p className="mt-1 text-sm text-stone-600">
            Every appointment carries a flat{' '}
            <span className="font-semibold text-stone-900">{formatCents(BOOKING_FEE_CENTS)}</span> reservation
            fee, charged online when the bride books (card surcharge applies) or collected at check-in for
            staff bookings. It is always credited toward her purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
