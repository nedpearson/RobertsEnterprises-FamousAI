import React from 'react';
import { X, Receipt, Printer, Mail, Link2, CreditCard, Calendar, User, Package } from 'lucide-react';
import { Invoice, formatCents, formatDate, locationById } from '@/data/vowosData';
import { Modal, StatusBadge, btnPrimary } from './ui';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onPay: () => void;
  onLink: () => void;
}

export default function InvoiceDetailModal({ invoice, open, onClose, onPay, onLink }: InvoiceDetailModalProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  useEffect(() => {
    if (open && invoice && invoice.id.length > 20) {
      supabase.from('payment_schedules').select('*').eq('invoice_id', invoice.id).order('created_at').then(({data}) => {
        if (data) setSchedules(data);
      });
    } else {
      setSchedules([]);
    }
  }, [open, invoice]);
  if (!invoice) return null;

  const balance = invoice.amountCents - invoice.paidCents;
  const isPaid = balance <= 0;
  
  // Generate realistic mock line items based on the invoice description
  const isGown = invoice.description.toLowerCase().includes('gown') || invoice.description.toLowerCase().includes('monique') || invoice.description.toLowerCase().includes('ines');
  
  const lineItems = isGown 
    ? [
        { id: 1, desc: invoice.description || 'Bridal Gown', qty: 1, amountCents: Math.round(invoice.amountCents * 0.85) },
        { id: 2, desc: 'Rush Production Fee', qty: 1, amountCents: Math.round(invoice.amountCents * 0.1) },
        { id: 3, desc: 'Shipping & Handling', qty: 1, amountCents: Math.round(invoice.amountCents * 0.05) },
      ]
    : [
        { id: 1, desc: invoice.description || 'Services Rendered', qty: 1, amountCents: invoice.amountCents }
      ];

  // Generate mock payment history
  const payments = invoice.paidCents > 0 ? [
    { id: 'pay-1', date: invoice.dueDate, method: 'Credit Card ending in 4242', amountCents: invoice.paidCents }
  ] : [];

  return (
    <Modal open={open} onClose={onClose} title={`Invoice #${invoice.id}`}>
      <div className="space-y-6">
        
        {/* Header Summary */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-serif text-stone-900">{formatCents(invoice.amountCents)}</h3>
            <p className="text-sm text-stone-500 mt-1">
              Billed to <span className="font-medium text-stone-800">{invoice.customer}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={invoice.status} />
            <span className="text-xs text-stone-500">
              Due {formatDate(invoice.dueDate)}
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
          {!isPaid && (
            <button onClick={onPay} className={btnPrimary}>
              <CreditCard className="w-4 h-4" /> Record Payment
            </button>
          )}
          {!isPaid && (
            <button onClick={onLink} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">
              <Link2 className="w-4 h-4" /> Payment Link
            </button>
          )}
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">
            <Mail className="w-4 h-4" /> Email Receipt
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        {/* Line Items */}
        <div>
          <h4 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-stone-400" /> Line Items
          </h4>
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-xs text-stone-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Description</th>
                  <th className="px-4 py-2 font-medium text-right">Qty</th>
                  <th className="px-4 py-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {lineItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-stone-800">{item.desc}</td>
                    <td className="px-4 py-3 text-right text-stone-600">{item.qty}</td>
                    <td className="px-4 py-3 text-right font-medium text-stone-900">{formatCents(item.amountCents)}</td>
                  </tr>
                ))}
                <tr className="bg-stone-50/50">
                  <td colSpan={2} className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Subtotal</td>
                  <td className="px-4 py-3 text-right font-semibold text-stone-900">{formatCents(invoice.amountCents)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Staged Payments Schedule */}
        {schedules.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-stone-900 mb-3">Staged Payment Schedule</h4>
            <div className="border border-stone-200 rounded-xl divide-y divide-stone-100">
              {schedules.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <p className="font-medium text-stone-800">{s.stage_name}</p>
                    <p className="text-xs text-stone-500">Due: {formatDate(s.due_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-stone-900">{formatCents(s.amount_cents)}</p>
                    <span className={\	ext-xs font-semibold \\}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment History */}
        <div>
          <h4 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-stone-400" /> Payment History
          </h4>
          {payments.length > 0 ? (
            <div className="rounded-xl border border-stone-200 divide-y divide-stone-100">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <p className="font-medium text-stone-800">{formatCents(p.amountCents)}</p>
                    <p className="text-xs text-stone-500">{p.method}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status="Paid" />
                    <p className="text-xs text-stone-500 mt-1">{formatDate(p.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-200 p-6 text-center text-sm text-stone-500">
              No payments recorded yet.
            </div>
          )}
        </div>
        
        {/* Balance Summary */}
        <div className="rounded-xl bg-stone-900 text-white p-4 flex items-center justify-between">
          <span className="font-medium">Total Balance Due</span>
          <span className="text-xl font-serif">{formatCents(balance)}</span>
        </div>

      </div>
    </Modal>
  );
}

