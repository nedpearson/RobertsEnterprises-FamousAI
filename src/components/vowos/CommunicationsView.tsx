import { useEffect, useMemo, useState } from 'react';
import {
  MessageSquare,
  Mail,
  Search,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  Link2,
  BellRing,
  Sparkles,
} from 'lucide-react';
import { Customer, formatCents, formatDate, locationById } from '@/data/vowosData';
import { useVowosData } from '@/contexts/VowosDataContext';
import { toast } from '@/components/ui/use-toast';
import { PageHeader, inputCls } from './ui';
import {
  MessageChannel,
  MessageKind,
  MessageRecord,
  fetchMessages,
  sendAndLogMessage,
  appointmentConfirmationTemplates,
  appointmentRescheduleTemplates,
  paymentLinkTemplates,
  reminderTemplates,
  isEmail,
  isPhone,
} from '@/lib/messaging';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function CommunicationsView() {
  const { brides, allAppointments, allInvoices, setAppointmentStatus } = useVowosData();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<MessageRecord[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [channel, setChannel] = useState<MessageChannel>('sms');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<MessageKind>('general');
  const [sending, setSending] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const contacts = useMemo(
    () =>
      brides.filter(
        (b) =>
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          b.email.toLowerCase().includes(query.toLowerCase()),
      ),
    [brides, query],
  );

  const selected: Customer | null = brides.find((b) => b.id === selectedId) ?? null;

  // Auto-select the first bride so the hub never opens empty
  useEffect(() => {
    if (!selectedId && brides.length > 0) setSelectedId(brides[0].id);
  }, [brides, selectedId]);

  // Pick the best default channel for the selected bride
  useEffect(() => {
    if (!selected) return;
    if (isPhone(selected.phone)) setChannel('sms');
    else if (isEmail(selected.email)) setChannel('email');
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadThread = async (name: string) => {
    setThreadLoading(true);
    setThread(await fetchMessages(name));
    setThreadLoading(false);
  };

  useEffect(() => {
    if (selected) loadThread(selected.name);
    else setThread([]);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Upcoming appointments awaiting confirmation (across all stores)
  const pendingConfirmations = useMemo(
    () =>
      allAppointments.filter(
        (a) => a.status === 'Pending' && a.date >= todayIso(),
      ),
    [allAppointments],
  );

  const nextApptFor = (name: string) =>
    allAppointments
      .filter((a) => a.customer === name && a.date >= todayIso() && a.status !== 'Cancelled' && a.status !== 'Completed')
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

  const openInvoiceFor = (name: string) =>
    allInvoices
      .filter((i) => i.customer === name && i.amountCents > i.paidCents)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null;

  const applyTemplate = (t: 'confirm' | 'reschedule' | 'payment' | 'reminder') => {
    if (!selected) return;
    if (t === 'payment') {
      const inv = openInvoiceFor(selected.name);
      if (!inv) {
        toast({ title: 'No open balance', description: `${selected.name} has no unpaid invoices.` });
        return;
      }
      const tpl = paymentLinkTemplates(inv);
      setKind('payment');
      setSubject(tpl.emailSubject);
      setBody(channel === 'sms' ? tpl.sms : tpl.emailText);
      return;
    }
    const appt = nextApptFor(selected.name);
    if (!appt) {
      toast({ title: 'No upcoming appointment', description: `Book ${selected.name} first, then send a ${t} message.` });
      return;
    }
    const tpl =
      t === 'confirm'
        ? appointmentConfirmationTemplates(appt)
        : t === 'reschedule'
          ? appointmentRescheduleTemplates(appt)
          : reminderTemplates(appt);
    setKind(t === 'confirm' ? 'confirmation' : t === 'reschedule' ? 'reschedule' : 'reminder');
    setSubject(tpl.emailSubject);
    setBody(channel === 'sms' ? tpl.sms : tpl.emailText);
  };

  const handleSend = async () => {
    if (!selected || !body.trim()) return;
    const to = channel === 'sms' ? selected.phone : selected.email;
    if (channel === 'sms' && !isPhone(to)) {
      toast({ title: 'No phone on file', description: `Add a phone number for ${selected.name} to text her.`, variant: 'destructive' });
      return;
    }
    if (channel === 'email' && !isEmail(to)) {
      toast({ title: 'No email on file', description: `Add an email address for ${selected.name} first.`, variant: 'destructive' });
      return;
    }
    setSending(true);
    const res = await sendAndLogMessage({
      channel,
      to,
      subject: channel === 'email' ? (subject || 'A note from your bridal boutique') : undefined,
      body: body.trim(),
      customer: selected.name,
      kind,
    });
    setSending(false);
    if (res.ok) {
      toast({ title: channel === 'sms' ? 'Text sent' : 'Email sent', description: `Delivered to ${to}.` });
    } else {
      toast({
        title: 'Send failed — logged to conversation',
        description: res.error ?? 'Unknown error',
        variant: 'destructive',
      });
    }
    setBody('');
    setSubject('');
    setKind('general');
    loadThread(selected.name);
  };

  /** One-click: send confirmation via every available channel + mark Confirmed. */
  const handleConfirmAppointment = async (apptId: string) => {
    const appt = allAppointments.find((a) => a.id === apptId);
    if (!appt) return;
    const bride = brides.find((b) => b.name === appt.customer);
    setConfirmingId(apptId);
    const tpl = appointmentConfirmationTemplates(appt);
    const results: string[] = [];
    if (bride && isEmail(bride.email)) {
      const r = await sendAndLogMessage({
        channel: 'email',
        to: bride.email,
        subject: tpl.emailSubject,
        body: tpl.emailText,
        html: tpl.emailHtml,
        customer: appt.customer,
        kind: 'confirmation',
      });
      results.push(r.ok ? 'email sent' : 'email failed');
    }
    if (bride && isPhone(bride.phone)) {
      const r = await sendAndLogMessage({
        channel: 'sms',
        to: bride.phone,
        body: tpl.sms,
        customer: appt.customer,
        kind: 'confirmation',
      });
      results.push(r.ok ? 'text sent' : 'text failed');
    }
    await setAppointmentStatus(appt.id, 'Confirmed');
    setConfirmingId(null);
    toast({
      title: 'Appointment confirmed',
      description:
        results.length > 0
          ? `${appt.customer} · ${formatDate(appt.date)} at ${appt.time} — ${results.join(' · ')}.`
          : `${appt.customer} confirmed. No email or phone on file, so no message was sent.`,
    });
    if (selected && selected.name === appt.customer) loadThread(appt.customer);
  };

  const templateChips: { key: 'confirm' | 'reschedule' | 'payment' | 'reminder'; label: string; icon: typeof CalendarCheck }[] = [
    { key: 'confirm', label: 'Confirm appointment', icon: CalendarCheck },
    { key: 'reschedule', label: 'Reschedule notice', icon: BellRing },
    { key: 'payment', label: 'Payment link', icon: Link2 },
    { key: 'reminder', label: 'Visit reminder', icon: Sparkles },
  ];

  return (
    <div>
      <PageHeader
        title="Communications"
        subtitle={`Text and email brides · ${pendingConfirmations.length} appointment${pendingConfirmations.length === 1 ? '' : 's'} awaiting confirmation`}
      />

      {/* Pending confirmations strip */}
      {pendingConfirmations.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <BellRing className="h-4 w-4" /> Awaiting confirmation — one click sends the confirmation and updates the calendar
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingConfirmations.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-amber-200 bg-white px-3 py-2 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-stone-800">{a.customer}</p>
                  <p className="text-[11px] text-stone-500">
                    {a.type} · {formatDate(a.date)} at {a.time} · {locationById(a.location).short}
                  </p>
                </div>
                <button
                  onClick={() => handleConfirmAppointment(a.id)}
                  disabled={confirmingId === a.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                >
                  {confirmingId === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Confirm &amp; notify
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact list */}
        <div className="rounded-2xl border border-stone-200/80 bg-white shadow-sm lg:col-span-1">
          <div className="border-b border-stone-100 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brides..."
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>
          <div className="max-h-[520px] divide-y divide-stone-100 overflow-y-auto">
            {contacts.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  selectedId === b.id ? 'bg-rose-50/70' : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-xs font-semibold text-white">
                  {b.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-800">{b.name}</p>
                  <p className="truncate text-[11px] text-stone-400">
                    {isPhone(b.phone) ? b.phone : 'no phone'} · {isEmail(b.email) ? b.email : 'no email'}
                  </p>
                </div>
              </button>
            ))}
            {contacts.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-stone-400">No brides match your search.</p>
            )}
          </div>
        </div>

        {/* Conversation + composer */}
        <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white shadow-sm lg:col-span-2">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-5 py-4">
                <div>
                  <p className="font-serif text-lg text-stone-900">{selected.name}</p>
                  <p className="text-xs text-stone-500">
                    {locationById(selected.location).short} · Wedding {formatDate(selected.weddingDate)}
                    {openInvoiceFor(selected.name) &&
                      ` · Balance ${formatCents(openInvoiceFor(selected.name)!.amountCents - openInvoiceFor(selected.name)!.paidCents)}`}
                  </p>
                </div>
                <div className="flex rounded-lg border border-stone-200 p-0.5">
                  {(['sms', 'email'] as MessageChannel[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setChannel(c)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                        channel === c ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {c === 'sms' ? <MessageSquare className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                      {c === 'sms' ? 'Text' : 'Email'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thread */}
              <div className="max-h-[300px] flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {threadLoading && (
                  <div className="py-8 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-rose-400" />
                  </div>
                )}
                {!threadLoading && thread.length === 0 && (
                  <p className="py-8 text-center text-sm text-stone-400">
                    No messages yet — start the conversation below.
                  </p>
                )}
                {!threadLoading &&
                  [...thread].reverse().map((m) => (
                    <div key={m.id} className="flex justify-end">
                      <div
                        className={`max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm shadow-sm ${
                          m.status === 'sent' ? 'bg-stone-900 text-white' : 'bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200'
                        }`}
                      >
                        {m.subject && <p className="mb-0.5 text-xs font-semibold opacity-80">{m.subject}</p>}
                        <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                        <p className={`mt-1.5 flex items-center gap-1 text-[10px] ${m.status === 'sent' ? 'text-stone-400' : 'text-rose-500'}`}>
                          {m.status === 'sent' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          {m.channel === 'sms' ? 'Text' : 'Email'} · {m.toAddress} ·{' '}
                          {new Date(m.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          {m.status === 'failed' && ' · failed'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Composer */}
              <div className="border-t border-stone-100 p-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {templateChips.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>
                {channel === 'email' && (
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className={`${inputCls} mb-2`}
                  />
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    placeholder={
                      channel === 'sms'
                        ? `Text ${selected.name.split(' ')[0]} at ${isPhone(selected.phone) ? selected.phone : '(no phone on file)'}...`
                        : `Email ${selected.name.split(' ')[0]} at ${isEmail(selected.email) ? selected.email : '(no email on file)'}...`
                    }
                    className={`${inputCls} resize-none`}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !body.trim()}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-rose-500 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-600 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-stone-400">
                  Every message is saved to the conversation log. Texts include opt-out language automatically when using templates.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
              <MessageSquare className="h-8 w-8 text-stone-300" />
              <p className="mt-3 text-sm text-stone-400">Select a bride to view her conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
