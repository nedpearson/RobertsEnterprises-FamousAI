import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Loader2, AlertTriangle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PurchaseOrder, formatCents, formatDate } from '@/data/vowosData';
import { toast } from '@/components/ui/use-toast';

export default function VendorPortal() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [params] = useSearchParams();
  const token = params.get('t') ?? '';

  const [vendorName, setVendorName] = useState<string>('');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Decode vendor name from vendorId for prototype purposes
      let decodedVendor = '';
      try {
        decodedVendor = atob(vendorId || '');
      } catch (e) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setVendorName(decodedVendor);

      // In a real app, we would validate the token against a vendors table.
      // For this prototype, we'll assume the token matches if it's "vowos-vendor-link"
      if (!token || token !== 'vowos-vendor-link') {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .ilike('vendor', decodedVendor)
        .order('expected_delivery', { ascending: true });

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setOrders(
        data.map((r: any) => ({
          id: r.id,
          vendor: r.vendor,
          items: r.items,
          amountCents: r.amount_cents,
          ordered: r.ordered,
          expectedDelivery: r.expected_delivery,
          status: r.status,
          location: r.location,
          assignedStaff: r.assigned_staff,
          assignedCustomer: r.assigned_customer,
          notes: r.notes,
        }))
      );
      setLoading(false);
    };
    load();
  }, [vendorId, token]);

  const handleUpdateStatus = async (id: string, status: PurchaseOrder['status']) => {
    const { error } = await supabase.from('purchase_orders').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'Error updating order', description: error.message, variant: 'destructive' });
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    toast({ title: 'Order updated', description: `Order ${id} marked as ${status}.` });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-stone-400" />
          <p className="mt-4 text-sm text-stone-500">Loading vendor portal...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-3xl border border-rose-200 shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
          <h2 className="mt-4 font-serif text-2xl text-stone-900">Portal Not Found</h2>
          <p className="mt-2 text-stone-500">
            This vendor link is invalid or expired. Please contact VowOS support.
          </p>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Archived');
  const pastOrders = orders.filter((o) => o.status === 'Delivered' || o.status === 'Archived');

  return (
    <div className="min-h-screen bg-[#faf8f5] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Brand header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 shadow-lg">
            <Package className="h-7 w-7 text-white" />
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
            VowOS Vendor Portal
          </p>
          <h1 className="mt-1 font-serif text-3xl text-stone-900">{vendorName}</h1>
        </div>

        {/* Action Required */}
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/60 px-6 py-4">
            <AlertCircle className="h-4 w-4 text-rose-500" />
            <h2 className="font-serif text-lg text-stone-900">Active Purchase Orders</h2>
            <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-xs font-bold text-stone-700">
              {activeOrders.length}
            </span>
          </div>
          <div className="divide-y divide-stone-100">
            {activeOrders.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-stone-500">
                No active orders at this time.
              </p>
            )}
            {activeOrders.map((o) => (
              <div key={o.id} className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-stone-900">{o.id}</h3>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${
                          o.status === 'Ordered'
                            ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                            : o.status === 'In Transit'
                            ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
                            : o.status === 'Delayed'
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200'
                            : 'bg-stone-100 text-stone-600 ring-1 ring-inset ring-stone-200'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600">{o.items}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 mt-2">
                      <span>Ordered: {formatDate(o.ordered)}</span>
                      <span className="font-medium text-stone-800">
                        Target Delivery: {formatDate(o.expectedDelivery)}
                      </span>
                      <span>Total: {formatCents(o.amountCents)}</span>
                      {o.assignedCustomer && (
                        <span className="text-violet-600">For Bride: {o.assignedCustomer}</span>
                      )}
                    </div>
                    {o.notes && (
                      <p className="text-xs text-stone-500 italic mt-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                        Notes: {o.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {o.status === 'Ordered' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'In Transit')}
                        className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-stone-700 transition-colors"
                      >
                        <Truck className="h-4 w-4" /> Mark Shipped
                      </button>
                    )}
                    {(o.status === 'Ordered' || o.status === 'In Transit') && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'Delayed')}
                        className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        <AlertTriangle className="h-4 w-4" /> Report Delay
                      </button>
                    )}
                    {o.status === 'Delayed' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'In Transit')}
                        className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-amber-600 transition-colors"
                      >
                        <Truck className="h-4 w-4" /> Mark Shipped Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Order History */}
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/60 px-6 py-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h2 className="font-serif text-lg text-stone-900">Past Orders</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {pastOrders.length === 0 && (
              <p className="px-6 py-6 text-sm text-stone-500">No completed orders found.</p>
            )}
            {pastOrders.map((o) => (
              <div key={o.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between opacity-80">
                <div>
                  <p className="text-sm font-medium text-stone-800">{o.id} · {o.items}</p>
                  <p className="text-xs text-stone-500">
                    Ordered: {formatDate(o.ordered)} · Delivered
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
