// ─── VowOS Messaging — single source of truth for outbound bride communications ───
// Sends via the `send-message` edge function (SendGrid email / Twilio SMS) and
// logs every attempt to the `messages` table so the Communications hub shows a
// full conversation history per bride.

import { supabase } from '@/lib/supabase';
import { Appointment, Invoice, locationById, formatCents, formatDate } from '@/data/vowosData';

export type MessageChannel = 'sms' | 'email';
export type MessageKind = 'confirmation' | 'reschedule' | 'payment' | 'reminder' | 'general';

export interface MessageRecord {
  id: string;
  customer: string;
  channel: MessageChannel;
  toAddress: string;
  subject: string | null;
  body: string;
  kind: MessageKind;
  status: 'sent' | 'failed';
  error: string | null;
  createdAt: string;
}

const mapMessage = (r: any): MessageRecord => ({
  id: r.id,
  customer: r.customer,
  channel: r.channel,
  toAddress: r.to_address,
  subject: r.subject,
  body: r.body,
  kind: r.kind,
  status: r.status,
  error: r.error,
  createdAt: r.created_at,
});

/** Load the conversation log — optionally for one bride only. */
export async function fetchMessages(customer?: string): Promise<MessageRecord[]> {
  let q = supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(200);
  if (customer) q = q.eq('customer', customer);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map(mapMessage);
}

export interface SendMessageInput {
  channel: MessageChannel;
  to: string;
  subject?: string;
  body: string;
  html?: string;
  customer: string;
  kind: MessageKind;
}

/** Send through the edge function, then log to the messages table. */
export async function sendAndLogMessage(
  input: SendMessageInput,
): Promise<{ ok: boolean; error: string | null }> {
  let ok = false;
  let errMsg: string | null = null;
  try {
    const { data, error } = await supabase.functions.invoke('send-message', {
      body: {
        channel: input.channel,
        to: input.to,
        subject: input.subject,
        body: input.body,
        html: input.html,
      },
    });
    if (error) errMsg = error.message;
    else if (data?.ok) ok = true;
    else errMsg = data?.error || 'Unknown send failure';
  } catch (e: any) {
    errMsg = e?.message || 'Network error while sending';
  }

  await supabase.from('messages').insert({
    customer: input.customer,
    channel: input.channel,
    to_address: input.to,
    subject: input.subject ?? null,
    body: input.body,
    kind: input.kind,
    status: ok ? 'sent' : 'failed',
    error: errMsg,
  });

  return { ok, error: errMsg };
}

// ─── Template builders ───

export interface MessageTemplates {
  emailSubject: string;
  emailText: string;
  emailHtml: string;
  sms: string;
}

const emailShell = (title: string, bodyHtml: string, storeLine: string) => `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;background:#faf8f5;border-radius:16px">
  <p style="letter-spacing:3px;font-size:11px;color:#e11d48;text-transform:uppercase;margin:0">VowOS · Roberts Enterprises Bridal</p>
  <h2 style="color:#1c1917;margin:8px 0 16px">${title}</h2>
  <div style="color:#44403c;font-size:15px;line-height:1.6">${bodyHtml}</div>
  <p style="margin-top:24px;color:#78716c;font-size:12px">${storeLine}</p>
</div>`;

/** Booking confirmation for a new appointment. */
export function appointmentConfirmationTemplates(a: Appointment): MessageTemplates {
  const loc = locationById(a.location);
  const when = `${formatDate(a.date)} at ${a.time}`;
  return {
    emailSubject: `You're confirmed! ${a.type} on ${formatDate(a.date)} — ${loc.business}`,
    emailText: `Hi ${a.customer},\n\nYour ${a.type.toLowerCase()} is confirmed for ${when} with ${a.stylist} at ${loc.business}, ${loc.address}.\n\nBoutique hours: ${loc.hours}. Questions? Call ${loc.phone}.\n\nWe can't wait to see you!\n— ${loc.business}`,
    emailHtml: emailShell(
      'Your appointment is confirmed',
      `<p>Hi ${a.customer},</p>
       <p>Your <strong>${a.type}</strong> is confirmed for <strong>${when}</strong> with ${a.stylist}.</p>
       <p><strong>${loc.business}</strong><br/>${loc.address}<br/>${loc.hours}</p>
       <p>Questions or need to reschedule? Call <a href="tel:${loc.phone}">${loc.phone}</a>.</p>`,
      `${loc.business} · ${loc.address} · ${loc.phone}`,
    ),
    sms: `${loc.business}: Hi ${a.customer}! Your ${a.type.toLowerCase()} is confirmed for ${when} with ${a.stylist} at ${loc.address}. Reply STOP to opt out.`,
  };
}

/** Reschedule notice when an appointment is moved (calendar already updated). */
export function appointmentRescheduleTemplates(a: Appointment): MessageTemplates {
  const loc = locationById(a.location);
  const when = `${formatDate(a.date)} at ${a.time}`;
  return {
    emailSubject: `Updated: your ${a.type.toLowerCase()} is now ${formatDate(a.date)} — ${loc.business}`,
    emailText: `Hi ${a.customer},\n\nYour ${a.type.toLowerCase()} has been rescheduled to ${when} with ${a.stylist} at ${loc.business}, ${loc.address}.\n\nOur calendar has been updated — no action needed. Questions? Call ${loc.phone}.\n\n— ${loc.business}`,
    emailHtml: emailShell(
      'Your appointment has been rescheduled',
      `<p>Hi ${a.customer},</p>
       <p>Your <strong>${a.type}</strong> now takes place on <strong>${when}</strong> with ${a.stylist}.</p>
       <p><strong>${loc.business}</strong><br/>${loc.address}<br/>${loc.hours}</p>
       <p>Our calendar is already updated — no action needed. Questions? Call <a href="tel:${loc.phone}">${loc.phone}</a>.</p>`,
      `${loc.business} · ${loc.address} · ${loc.phone}`,
    ),
    sms: `${loc.business}: Hi ${a.customer}, your ${a.type.toLowerCase()} moved to ${when} with ${a.stylist}. Our calendar is updated. Questions? ${loc.phone}`,
  };
}

/** Secure hosted payment page URL for an invoice. */
export function paymentLinkUrl(inv: Invoice): string {
  return `${window.location.origin}/pay/${inv.id}?t=${inv.payToken}`;
}

/** Payment request with hosted pay link. */
export function paymentLinkTemplates(inv: Invoice): MessageTemplates {
  const loc = locationById(inv.location);
  const balance = formatCents(inv.amountCents - inv.paidCents);
  const url = paymentLinkUrl(inv);
  return {
    emailSubject: `Payment link for invoice ${inv.id} — balance ${balance}`,
    emailText: `Hi ${inv.customer},\n\nHere is your secure payment link for invoice ${inv.id} (${inv.description}).\nBalance due: ${balance} · Due ${formatDate(inv.dueDate)}\n\nPay online: ${url}\n\nThank you!\n— ${loc.business}`,
    emailHtml: emailShell(
      'Your payment link is ready',
      `<p>Hi ${inv.customer},</p>
       <p>Invoice <strong>${inv.id}</strong> — ${inv.description}</p>
       <p>Balance due: <strong>${balance}</strong> · Due ${formatDate(inv.dueDate)}</p>
       <p style="margin:20px 0"><a href="${url}" style="background:#e11d48;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px">Pay ${balance} securely</a></p>
       <p>Or copy this link: <a href="${url}">${url}</a></p>`,
      `${loc.business} · ${loc.address} · ${loc.phone}`,
    ),
    sms: `${loc.business}: Hi ${inv.customer}, your balance of ${balance} on invoice ${inv.id} is due ${formatDate(inv.dueDate)}. Pay securely here: ${url}`,
  };
}

/** Gentle reminder for an upcoming visit. */
export function reminderTemplates(a: Appointment): MessageTemplates {
  const loc = locationById(a.location);
  const when = `${formatDate(a.date)} at ${a.time}`;
  return {
    emailSubject: `See you soon — ${a.type.toLowerCase()} on ${formatDate(a.date)}`,
    emailText: `Hi ${a.customer},\n\nJust a friendly reminder about your ${a.type.toLowerCase()} on ${when} with ${a.stylist} at ${loc.business}, ${loc.address}.\n\nSee you soon!\n— ${loc.business}`,
    emailHtml: emailShell(
      'A friendly reminder',
      `<p>Hi ${a.customer},</p>
       <p>We're looking forward to your <strong>${a.type}</strong> on <strong>${when}</strong> with ${a.stylist}.</p>
       <p><strong>${loc.business}</strong><br/>${loc.address}</p>`,
      `${loc.business} · ${loc.address} · ${loc.phone}`,
    ),
    sms: `${loc.business}: Reminder — ${a.customer}, your ${a.type.toLowerCase()} is ${when} with ${a.stylist}. See you soon!`,
  };
}

/** True when the string looks like a usable email address. */
export const isEmail = (s: string) => /.+@.+\..+/.test(s || '');
/** True when the string has at least 10 digits (usable phone). */
export const isPhone = (s: string) => ((s || '').replace(/[^\d]/g, '').length >= 10);
