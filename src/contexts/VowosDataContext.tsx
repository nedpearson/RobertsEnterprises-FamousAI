import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import {
  Customer,
  Lead,
  LeadStage,
  LEAD_STAGES,
  Appointment,
  Invoice,
  PurchaseOrder,
  Gown,
  gownStatusForStock,
} from '@/data/vowosData';

// ─── Row mappers: database snake_case → app camelCase ───

const mapBride = (r: any): Customer => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  weddingDate: r.wedding_date,
  stylist: r.stylist,
  status: r.status,
  spendCents: r.spend_cents,
});

const mapLead = (r: any): Lead => ({
  id: r.id,
  name: r.name,
  email: r.email,
  source: r.source,
  budgetCents: r.budget_cents,
  weddingDate: r.wedding_date,
  stage: r.stage,
});

const mapAppointment = (r: any): Appointment => ({
  id: r.id,
  customer: r.customer,
  type: r.type,
  date: r.date,
  time: r.time,
  stylist: r.stylist,
  status: r.status,
});

const mapInvoice = (r: any): Invoice => ({
  id: r.id,
  customer: r.customer,
  description: r.description,
  amountCents: r.amount_cents,
  paidCents: r.paid_cents,
  dueDate: r.due_date,
  status: r.status,
});

const mapPo = (r: any): PurchaseOrder => ({
  id: r.id,
  vendor: r.vendor,
  items: r.items,
  amountCents: r.amount_cents,
  ordered: r.ordered,
  expectedDelivery: r.expected_delivery,
  status: r.status,
});

const mapGown = (r: any): Gown => ({
  id: r.id,
  name: r.name,
  designer: r.designer,
  style: r.style,
  size: r.size,
  color: r.color,
  priceCents: r.price_cents,
  stock: r.stock,
  status: r.status,
  image: r.image,
});


export interface NewBrideInput {
  name: string;
  email: string;
  phone: string;
  weddingDate: string;
  stylist: string;
}

export interface NewInvoiceInput {
  customer: string;
  description: string;
  amountCents: number;
  depositCents: number;
  dueDate: string;
}

export interface NewAppointmentInput {
  customer: string;
  type: Appointment['type'];
  date: string;
  time: string;
  stylist: string;
}

/** Fields staff can change when rescheduling an existing appointment. */
export interface AppointmentUpdateInput {
  type: Appointment['type'];
  date: string;
  time: string;
  stylist: string;
}

export interface GownInput {
  name: string;
  designer: string;
  style: string;
  size: string;
  color: string;
  priceCents: number;
  stock: number;
  image: string;
}

interface VowosDataContextType {
  brides: Customer[];
  leads: Lead[];
  appointments: Appointment[];
  invoices: Invoice[];
  purchaseOrders: PurchaseOrder[];
  gowns: Gown[];
  loading: boolean;
  refresh: () => Promise<void>;
  addBride: (input: NewBrideInput) => Promise<boolean>;
  advanceLead: (id: string) => Promise<void>;
  setAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  addAppointment: (input: NewAppointmentInput) => Promise<boolean>;
  updateAppointment: (id: string, input: AppointmentUpdateInput) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  addInvoice: (input: NewInvoiceInput) => Promise<boolean>;
  recordPayment: (id: string, paymentCents: number) => Promise<boolean>;
  markPoDelivered: (id: string) => Promise<void>;
  addGown: (input: GownInput) => Promise<boolean>;
  updateGown: (id: string, input: GownInput) => Promise<boolean>;
  adjustGownStock: (id: string, newStock: number) => Promise<boolean>;
}

const VowosDataContext = createContext<VowosDataContextType>({
  brides: [],
  leads: [],
  appointments: [],
  invoices: [],
  purchaseOrders: [],
  gowns: [],
  loading: true,
  refresh: async () => {},
  addBride: async () => false,
  advanceLead: async () => {},
  setAppointmentStatus: async () => {},
  addAppointment: async () => false,
  updateAppointment: async () => false,
  deleteAppointment: async () => false,
  addInvoice: async () => false,
  recordPayment: async () => false,
  markPoDelivered: async () => {},
  addGown: async () => false,
  updateGown: async () => false,
  adjustGownStock: async () => false,
});

export const useVowosData = () => useContext(VowosDataContext);


function dbErrorToast(action: string, message?: string) {
  toast({
    title: `Could not ${action}`,
    description: message || 'Please make sure you are signed in and try again.',
    variant: 'destructive',
  });
}

export const VowosDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brides, setBrides] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [gowns, setGowns] = useState<Gown[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [bridesRes, leadsRes, apptsRes, invRes, poRes, gownsRes] = await Promise.all([
      supabase.from('brides').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: true }),
      supabase.from('appointments').select('*').order('date', { ascending: true }),
      supabase.from('invoices').select('*').order('due_date', { ascending: true }),
      supabase.from('purchase_orders').select('*').order('expected_delivery', { ascending: true }),
      supabase.from('gowns').select('*').order('id', { ascending: true }),
    ]);
    if (!bridesRes.error && bridesRes.data) setBrides(bridesRes.data.map(mapBride));
    if (!leadsRes.error && leadsRes.data) setLeads(leadsRes.data.map(mapLead));
    if (!apptsRes.error && apptsRes.data) setAppointments(apptsRes.data.map(mapAppointment));
    if (!invRes.error && invRes.data) setInvoices(invRes.data.map(mapInvoice));
    if (!poRes.error && poRes.data) setPurchaseOrders(poRes.data.map(mapPo));
    if (!gownsRes.error && gownsRes.data) setGowns(gownsRes.data.map(mapGown));
    setLoading(false);
  }, []);


  useEffect(() => {
    refresh();
    // Keep data fresh across staff sessions: refetch when the tab regains focus
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  // ─── Mutations (optimistic UI + database persistence) ───

  const addBride = useCallback(
    async (input: NewBrideInput): Promise<boolean> => {
      const maxNum = brides.reduce((max, b) => {
        const m = /^C-(\d+)$/.exec(b.id);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
      }, 2000);
      const newBride: Customer = {
        id: `C-${maxNum + 1}`,
        name: input.name,
        email: input.email,
        phone: input.phone || '—',
        weddingDate: input.weddingDate || '2027-06-01',
        stylist: input.stylist,
        status: 'Active',
        spendCents: 0,
      };
      const { error } = await supabase.from('brides').insert({
        id: newBride.id,
        name: newBride.name,
        email: newBride.email,
        phone: newBride.phone,
        wedding_date: newBride.weddingDate,
        stylist: newBride.stylist,
        status: newBride.status,
        spend_cents: newBride.spendCents,
      });
      if (error) {
        dbErrorToast('add bride', error.message);
        return false;
      }
      setBrides((prev) => [newBride, ...prev]);
      return true;
    },
    [brides],
  );

  const advanceLead = useCallback(
    async (id: string) => {
      const lead = leads.find((l) => l.id === id);
      if (!lead) return;
      const idx = LEAD_STAGES.indexOf(lead.stage);
      if (idx >= LEAD_STAGES.length - 1) return;
      const nextStage: LeadStage = LEAD_STAGES[idx + 1];
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage: nextStage } : l)));
      const { error } = await supabase.from('leads').update({ stage: nextStage }).eq('id', id);
      if (error) {
        dbErrorToast('advance lead', error.message);
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage: lead.stage } : l)));
      }
    },
    [leads],
  );

  const setAppointmentStatus = useCallback(
    async (id: string, status: Appointment['status']) => {
      const prevAppt = appointments.find((a) => a.id === id);
      if (!prevAppt) return;
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) {
        dbErrorToast('update appointment', error.message);
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: prevAppt.status } : a)));
      }
    },
    [appointments],
  );

  /** Convert "1:30 PM" style times to minutes-since-midnight for schedule sorting. */
  const timeToMinutes = (t: string): number => {
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim());
    if (!m) return 0;
    let h = parseInt(m[1], 10) % 12;
    if (m[3].toUpperCase() === 'PM') h += 12;
    return h * 60 + parseInt(m[2], 10);
  };

  const addAppointment = useCallback(
    async (input: NewAppointmentInput): Promise<boolean> => {
      const maxNum = appointments.reduce((max, a) => {
        const m = /(\d+)$/.exec(a.id);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
      }, 5000);
      const newAppt: Appointment = {
        id: `A-${maxNum + 1}`,
        customer: input.customer,
        type: input.type,
        date: input.date,
        time: input.time,
        stylist: input.stylist,
        status: 'Confirmed',
      };
      const { error } = await supabase.from('appointments').insert({
        id: newAppt.id,
        customer: newAppt.customer,
        type: newAppt.type,
        date: newAppt.date,
        time: newAppt.time,
        stylist: newAppt.stylist,
        status: newAppt.status,
      });
      if (error) {
        dbErrorToast('book appointment', error.message);
        return false;
      }
      setAppointments((prev) =>
        [...prev, newAppt].sort(
          (a, b) => a.date.localeCompare(b.date) || timeToMinutes(a.time) - timeToMinutes(b.time),
        ),
      );
      return true;
    },
    [appointments],
  );

  const updateAppointment = useCallback(
    async (id: string, input: AppointmentUpdateInput): Promise<boolean> => {
      const prevAppt = appointments.find((a) => a.id === id);
      if (!prevAppt) return false;
      const updated: Appointment = { ...prevAppt, ...input };
      // Optimistic update, re-sorted so it lands in the right day/time slot
      setAppointments((prev) =>
        prev
          .map((a) => (a.id === id ? updated : a))
          .sort(
            (a, b) => a.date.localeCompare(b.date) || timeToMinutes(a.time) - timeToMinutes(b.time),
          ),
      );
      const { error } = await supabase
        .from('appointments')
        .update({
          type: updated.type,
          date: updated.date,
          time: updated.time,
          stylist: updated.stylist,
        })
        .eq('id', id);
      if (error) {
        dbErrorToast('update appointment', error.message);
        setAppointments((prev) =>
          prev
            .map((a) => (a.id === id ? prevAppt : a))
            .sort(
              (a, b) =>
                a.date.localeCompare(b.date) || timeToMinutes(a.time) - timeToMinutes(b.time),
            ),
        );
        return false;
      }
      return true;
    },
    [appointments],
  );

  const deleteAppointment = useCallback(
    async (id: string): Promise<boolean> => {
      const prevAppt = appointments.find((a) => a.id === id);
      if (!prevAppt) return false;
      // Optimistic removal so the schedule and dashboard update instantly
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) {
        dbErrorToast('cancel appointment', error.message);
        setAppointments((prev) =>
          [...prev, prevAppt].sort(
            (a, b) => a.date.localeCompare(b.date) || timeToMinutes(a.time) - timeToMinutes(b.time),
          ),
        );
        return false;
      }
      return true;
    },
    [appointments],
  );

  /** Add a payment amount to the matching bride's lifetime spend (by name). */
  const bumpBrideSpend = useCallback(
    async (customerName: string, deltaCents: number) => {
      if (deltaCents <= 0) return;
      const bride = brides.find((b) => b.name === customerName);
      if (!bride) return; // invoice customer isn't a tracked bride — skip silently
      const newSpend = bride.spendCents + deltaCents;
      setBrides((prev) => prev.map((b) => (b.id === bride.id ? { ...b, spendCents: newSpend } : b)));
      const { error } = await supabase.from('brides').update({ spend_cents: newSpend }).eq('id', bride.id);
      if (error) {
        // Roll back the local spend bump; the invoice payment itself already succeeded
        setBrides((prev) =>
          prev.map((b) => (b.id === bride.id ? { ...b, spendCents: bride.spendCents } : b)),
        );
        dbErrorToast("update bride's spend total", error.message);
      }
    },
    [brides],
  );

  const addInvoice = useCallback(
    async (input: NewInvoiceInput): Promise<boolean> => {
      const maxNum = invoices.reduce((max, i) => {
        const m = /(\d+)$/.exec(i.id);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
      }, 5000);
      const deposit = Math.max(0, Math.min(input.depositCents, input.amountCents));
      const status: Invoice['status'] =
        deposit >= input.amountCents ? 'Paid' : deposit > 0 ? 'Partial' : 'Open';
      const newInvoice: Invoice = {
        id: `INV-${maxNum + 1}`,
        customer: input.customer,
        description: input.description,
        amountCents: input.amountCents,
        paidCents: deposit,
        dueDate: input.dueDate,
        status,
      };
      const { error } = await supabase.from('invoices').insert({
        id: newInvoice.id,
        customer: newInvoice.customer,
        description: newInvoice.description,
        amount_cents: newInvoice.amountCents,
        paid_cents: newInvoice.paidCents,
        due_date: newInvoice.dueDate,
        status: newInvoice.status,
      });
      if (error) {
        dbErrorToast('create invoice', error.message);
        return false;
      }
      setInvoices((prev) =>
        [...prev, newInvoice].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      );
      if (deposit > 0) await bumpBrideSpend(newInvoice.customer, deposit);
      return true;
    },
    [invoices, bumpBrideSpend],
  );

  const recordPayment = useCallback(
    async (id: string, paymentCents: number): Promise<boolean> => {
      const prevInv = invoices.find((i) => i.id === id);
      if (!prevInv || paymentCents <= 0) return false;
      const balance = prevInv.amountCents - prevInv.paidCents;
      const payment = Math.min(paymentCents, balance);
      const newPaid = prevInv.paidCents + payment;
      const newStatus: Invoice['status'] = newPaid >= prevInv.amountCents ? 'Paid' : 'Partial';
      setInvoices((prev) =>
        prev.map((i) => (i.id === id ? { ...i, paidCents: newPaid, status: newStatus } : i)),
      );
      const { error } = await supabase
        .from('invoices')
        .update({ paid_cents: newPaid, status: newStatus })
        .eq('id', id);
      if (error) {
        dbErrorToast('record payment', error.message);
        setInvoices((prev) => prev.map((i) => (i.id === id ? prevInv : i)));
        return false;
      }
      await bumpBrideSpend(prevInv.customer, payment);
      return true;
    },
    [invoices, bumpBrideSpend],
  );

  const markPoDelivered = useCallback(
    async (id: string) => {
      const prevPo = purchaseOrders.find((p) => p.id === id);
      if (!prevPo) return;
      setPurchaseOrders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'Delivered' as const } : p)),
      );
      const { error } = await supabase.from('purchase_orders').update({ status: 'Delivered' }).eq('id', id);
      if (error) {
        dbErrorToast('mark delivered', error.message);
        setPurchaseOrders((prev) => prev.map((p) => (p.id === id ? prevPo : p)));
      }
    },
    [purchaseOrders],
  );

  // ─── Gown inventory mutations ───

  const addGown = useCallback(
    async (input: GownInput): Promise<boolean> => {
      const maxNum = gowns.reduce((max, g) => {
        const m = /^G-(\d+)$/.exec(g.id);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
      }, 1000);
      const newGown: Gown = {
        id: `G-${maxNum + 1}`,
        name: input.name,
        designer: input.designer,
        style: input.style,
        size: input.size,
        color: input.color,
        priceCents: input.priceCents,
        stock: input.stock,
        status: gownStatusForStock(input.stock),
        image: input.image,
      };
      const { error } = await supabase.from('gowns').insert({
        id: newGown.id,
        name: newGown.name,
        designer: newGown.designer,
        style: newGown.style,
        size: newGown.size,
        color: newGown.color,
        price_cents: newGown.priceCents,
        stock: newGown.stock,
        status: newGown.status,
        image: newGown.image,
      });
      if (error) {
        dbErrorToast('add gown', error.message);
        return false;
      }
      setGowns((prev) => [...prev, newGown].sort((a, b) => a.id.localeCompare(b.id)));
      return true;
    },
    [gowns],
  );

  const updateGown = useCallback(
    async (id: string, input: GownInput): Promise<boolean> => {
      const prevGown = gowns.find((g) => g.id === id);
      if (!prevGown) return false;
      const updated: Gown = {
        ...prevGown,
        ...input,
        status: gownStatusForStock(input.stock),
      };
      setGowns((prev) => prev.map((g) => (g.id === id ? updated : g)));
      const { error } = await supabase
        .from('gowns')
        .update({
          name: updated.name,
          designer: updated.designer,
          style: updated.style,
          size: updated.size,
          color: updated.color,
          price_cents: updated.priceCents,
          stock: updated.stock,
          status: updated.status,
          image: updated.image,
        })
        .eq('id', id);
      if (error) {
        dbErrorToast('update gown', error.message);
        setGowns((prev) => prev.map((g) => (g.id === id ? prevGown : g)));
        return false;
      }
      return true;
    },
    [gowns],
  );

  const adjustGownStock = useCallback(
    async (id: string, newStock: number): Promise<boolean> => {
      const prevGown = gowns.find((g) => g.id === id);
      if (!prevGown) return false;
      const stock = Math.max(0, Math.round(newStock));
      const status = gownStatusForStock(stock);
      setGowns((prev) => prev.map((g) => (g.id === id ? { ...g, stock, status } : g)));
      const { error } = await supabase.from('gowns').update({ stock, status }).eq('id', id);
      if (error) {
        dbErrorToast('adjust stock', error.message);
        setGowns((prev) => prev.map((g) => (g.id === id ? prevGown : g)));
        return false;
      }
      return true;
    },
    [gowns],
  );

  return (
    <VowosDataContext.Provider
      value={{
        brides,
        leads,
        appointments,
        invoices,
        purchaseOrders,
        gowns,
        loading,
        refresh,
        addBride,
        advanceLead,
        setAppointmentStatus,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addInvoice,
        recordPayment,
        markPoDelivered,
        addGown,
        updateGown,
        adjustGownStock,
      }}
    >
      {children}
    </VowosDataContext.Provider>
  );
};

