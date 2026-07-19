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

export interface NewBrideInput {
  name: string;
  email: string;
  phone: string;
  weddingDate: string;
  stylist: string;
}

interface VowosDataContextType {
  brides: Customer[];
  leads: Lead[];
  appointments: Appointment[];
  invoices: Invoice[];
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  refresh: () => Promise<void>;
  addBride: (input: NewBrideInput) => Promise<boolean>;
  advanceLead: (id: string) => Promise<void>;
  setAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  recordPayment: (id: string) => Promise<void>;
  markPoDelivered: (id: string) => Promise<void>;
}

const VowosDataContext = createContext<VowosDataContextType>({
  brides: [],
  leads: [],
  appointments: [],
  invoices: [],
  purchaseOrders: [],
  loading: true,
  refresh: async () => {},
  addBride: async () => false,
  advanceLead: async () => {},
  setAppointmentStatus: async () => {},
  recordPayment: async () => {},
  markPoDelivered: async () => {},
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
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [bridesRes, leadsRes, apptsRes, invRes, poRes] = await Promise.all([
      supabase.from('brides').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: true }),
      supabase.from('appointments').select('*').order('date', { ascending: true }),
      supabase.from('invoices').select('*').order('due_date', { ascending: true }),
      supabase.from('purchase_orders').select('*').order('expected_delivery', { ascending: true }),
    ]);
    if (!bridesRes.error && bridesRes.data) setBrides(bridesRes.data.map(mapBride));
    if (!leadsRes.error && leadsRes.data) setLeads(leadsRes.data.map(mapLead));
    if (!apptsRes.error && apptsRes.data) setAppointments(apptsRes.data.map(mapAppointment));
    if (!invRes.error && invRes.data) setInvoices(invRes.data.map(mapInvoice));
    if (!poRes.error && poRes.data) setPurchaseOrders(poRes.data.map(mapPo));
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

  const recordPayment = useCallback(
    async (id: string) => {
      const prevInv = invoices.find((i) => i.id === id);
      if (!prevInv) return;
      setInvoices((prev) =>
        prev.map((i) => (i.id === id ? { ...i, paidCents: i.amountCents, status: 'Paid' as const } : i)),
      );
      const { error } = await supabase
        .from('invoices')
        .update({ paid_cents: prevInv.amountCents, status: 'Paid' })
        .eq('id', id);
      if (error) {
        dbErrorToast('record payment', error.message);
        setInvoices((prev) => prev.map((i) => (i.id === id ? prevInv : i)));
      }
    },
    [invoices],
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

  return (
    <VowosDataContext.Provider
      value={{
        brides,
        leads,
        appointments,
        invoices,
        purchaseOrders,
        loading,
        refresh,
        addBride,
        advanceLead,
        setAppointmentStatus,
        recordPayment,
        markPoDelivered,
      }}
    >
      {children}
    </VowosDataContext.Provider>
  );
};
