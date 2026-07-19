import { useMemo, useState, FormEvent } from 'react';

import { Search, UserPlus, CheckCircle2 } from 'lucide-react';
import { customers as seedCustomers, Customer, formatCents, formatDate, teamMembers } from '@/data/vowosData';
import { PageHeader, StatusBadge, Modal, inputCls, btnPrimary } from './ui';

const STATUS_FILTERS = ['All', 'Active', 'Purchased', 'Alterations', 'Picked Up'] as const;

export default function CustomersView() {
  const [list, setList] = useState<Customer[]>(seedCustomers);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', weddingDate: '', stylist: teamMembers[0], smsOptIn: true });

  const filtered = useMemo(
    () =>
      list.filter(
        (c) =>
          (filter === 'All' || c.status === filter) &&
          (c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase())),
      ),
    [list, query, filter],
  );

  const handleAdd = async (e: FormEvent) => {

    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      await fetch('https://famous.ai/api/crm/6a5d5dc9d84ad34d886e72c1/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone || undefined,
          sms_opt_in: form.smsOptIn === true,
          source: 'contact-form',
          tags: ['bride', 'vowos-customer'],
        }),
      });
    } catch {
      // non-blocking
    }
    const newCustomer: Customer = {
      id: `C-${2000 + list.length + 1}`,
      name: form.name,
      email: form.email,
      phone: form.phone || '—',
      weddingDate: form.weddingDate || '2027-06-01',
      stylist: form.stylist,
      status: 'Active',
      spendCents: 0,
    };
    setList([newCustomer, ...list]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setModalOpen(false);
      setForm({ name: '', email: '', phone: '', weddingDate: '', stylist: teamMembers[0], smsOptIn: true });
    }, 1200);
  };

  return (
    <div>
      <PageHeader
        title="Brides"
        subtitle={`${list.length} brides in your book · ${list.filter((c) => c.status === 'Active').length} actively shopping`}
        action={
          <button onClick={() => setModalOpen(true)} className={btnPrimary}>
            <UserPlus className="h-4 w-4" /> Add Bride
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brides..."
            className={`${inputCls} pl-9`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-100 text-sm">
            <thead className="bg-stone-50/70">
              <tr>
                {['Bride', 'Contact', 'Wedding Date', 'Stylist', 'Status', 'Spend'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-rose-50/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-rose-200 text-xs font-semibold text-rose-600">
                        {c.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">{c.name}</p>
                        <p className="text-xs text-stone-400">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-stone-700">{c.email}</p>
                    <p className="text-xs text-stone-400">{c.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-stone-700">{formatDate(c.weddingDate)}</td>
                  <td className="px-5 py-3.5 text-stone-700">{c.stylist}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3.5 font-medium text-stone-800">
                    {c.spendCents > 0 ? formatCents(c.spendCents) : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-stone-500">
                    No brides match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Bride">
        {saved ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="mt-3 font-medium text-stone-800">Bride added successfully</p>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Full name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="jane@email.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Phone number (optional)</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="(555) 000-0000" />
            </div>
            <label className="flex items-start gap-2 text-xs text-stone-500">
              <input
                type="checkbox"
                checked={form.smsOptIn}
                onChange={(e) => setForm({ ...form, smsOptIn: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-rose-500 focus:ring-rose-300"
              />
              Text me appointment updates. Msg & data rates may apply. Reply STOP to unsubscribe.
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600">Wedding date</label>
                <input type="date" value={form.weddingDate} onChange={(e) => setForm({ ...form, weddingDate: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600">Stylist</label>
                <select value={form.stylist} onChange={(e) => setForm({ ...form, stylist: e.target.value })} className={inputCls}>
                  {teamMembers.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={saving} className={`${btnPrimary} w-full justify-center disabled:opacity-60`}>
              {saving ? 'Saving...' : 'Add Bride'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
