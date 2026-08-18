import { Router } from 'express';
import { supabase } from '../../index';
import { resolveStore, findOrCreateCustomer } from './publicIntake';
import { randomUUID } from 'crypto';

const rateLimits = new Map<string, { count: number; expires: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimits.get(ip);
  if (!record || record.expires < now) {
    rateLimits.set(ip, { count: 1, expires: now + 60000 });
    return false;
  }
  record.count++;
  return record.count > 10;
}

export const publicSchedulingRouter = Router();

// Public endpoint to submit a booking
publicSchedulingRouter.post('/book', async (req, res) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    if (rateLimited(ip)) return res.status(429).json({ error: 'Too many requests' });

    const { 
      name, email, phone, smsOptIn, weddingDate, store, type, 
      lookingFor, budgetCents, date, time, paymentIntentId, totalCents, brandLabel, surchargeCents, surchargePct 
    } = req.body;

    if (!name || !email || !store || !date || !time) {
      return res.status(400).json({ error: 'Missing required booking details' });
    }

    // Resolve store
    const resolved = await resolveStore(supabase, store);
    
    // Find or create customer
    const customerId = await findOrCreateCustomer(supabase, resolved, {
      name, email, phone, smsOptIn, weddingDate, store
    } as any);

    const requestNotes = [];
    if (type) requestNotes.push('Type: ' + type);
    if (lookingFor) requestNotes.push('Looking for: ' + lookingFor);
    if (budgetCents) requestNotes.push('Budget: $' + (budgetCents / 100).toFixed(2));
    if (paymentIntentId) requestNotes.push('Stripe Ref: ' + paymentIntentId);
    if (totalCents) requestNotes.push('Total Charged: $' + (totalCents / 100).toFixed(2));

    const apptId = randomUUID();
    
    // 1) Create the appointment request
    const { error: apptErr } = await supabase.from('appointments').insert({
      id: apptId,
      business_id: resolved.businessId,
      location_id: resolved.locationId,
      customer_id: customerId,
      customer_name: name.trim(),
      customer_email: email.trim(),
      customer_phone: phone?.trim(),
      date,
      time,
      status: 'PENDING',
      notes: requestNotes.join('\n')
    });

    if (apptErr) {
      console.error('Failed to insert appointment:', apptErr);
      return res.status(500).json({ error: 'Failed to create appointment.' });
    }

    // 2) Log a lead
    await supabase.from('leads').insert({
      id: randomUUID(),
      business_id: resolved.businessId,
      location_id: resolved.locationId,
      customer_id: customerId,
      name: name.trim(),
      email: email.trim(),
      source: 'Booking Page',
      stage: 'Appointment Set'
    });

    res.json({ success: true, appointmentId: apptId, store: resolved.locationId || store, date, time });
  } catch (err: any) {
    console.error('Booking error:', err);
    res.status(500).json({ error: err.message });
  }
});
