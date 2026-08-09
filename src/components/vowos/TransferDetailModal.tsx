import React from 'react';
import { ArrowRight, Truck, Store, MapPin, Package, ClipboardCheck, ArrowLeftRight } from 'lucide-react';
import { Transfer, formatDate, locationById } from '@/data/vowosData';
import { Modal, StatusBadge, LocationBadge } from './ui';

interface TransferDetailModalProps {
  transfer: Transfer | null;
  open: boolean;
  onClose: () => void;
}

export default function TransferDetailModal({ transfer, open, onClose }: TransferDetailModalProps) {
  if (!transfer) return null;

  const isReceived = transfer.status === 'Received';
  const fromLocation = locationById(transfer.from);
  const toLocation = locationById(transfer.to);

  // Mock audit logs
  const auditLogs = [
    { time: transfer.requested || '2026-08-01T09:00:00Z', event: 'Transfer Initiated', user: 'Ramsey Sims', icon: ArrowLeftRight },
    { time: transfer.requested || '2026-08-01T10:30:00Z', event: 'Packed & Ready for Courier', user: 'Inventory Team', icon: Package },
    { time: transfer.requested || '2026-08-01T11:15:00Z', event: 'Picked up by VowOS Private Courier', user: 'Courier Service', icon: Truck },
  ];

  if (isReceived) {
    auditLogs.push({ time: transfer.received || '2026-08-02T14:20:00Z', event: 'Received and Restocked', user: 'Store Manager', icon: ClipboardCheck });
  }

  return (
    <Modal open={open} onClose={onClose} title="Transfer Details" size="max-w-2xl">
      <div className="space-y-6">
        
        {/* Header summary */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif text-stone-900">{transfer.id}</h3>
            <p className="text-sm text-stone-500 mt-1">Requested {formatDate(transfer.requested)}</p>
          </div>
          <StatusBadge status={transfer.status} />
        </div>

        {/* Route Map */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 flex items-center justify-between relative overflow-hidden">
          {/* Decorative background line */}
          <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-stone-200 -translate-y-1/2 z-0 hidden sm:block"></div>
          
          {/* From Node */}
          <div className="flex flex-col items-center z-10 w-1/3 text-center">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center mb-2 shadow-sm">
              <Store className="w-5 h-5 text-stone-500" />
            </div>
            <p className="font-semibold text-stone-900 text-sm">{fromLocation.business}</p>
            <p className="text-xs text-stone-500">{fromLocation.city}</p>
          </div>
          
          {/* Center Icon */}
          <div className="flex flex-col items-center z-10 w-1/3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isReceived ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600 animate-pulse'}`}>
              <Truck className="w-5 h-5" />
            </div>
            <p className={`text-xs font-semibold mt-2 ${isReceived ? 'text-emerald-600' : 'text-violet-600'}`}>
              {isReceived ? 'Delivered' : 'In Transit'}
            </p>
          </div>
          
          {/* To Node */}
          <div className="flex flex-col items-center z-10 w-1/3 text-center">
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 shadow-sm ${isReceived ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200'}`}>
              <MapPin className={`w-5 h-5 ${isReceived ? 'text-emerald-500' : 'text-stone-400'}`} />
            </div>
            <p className="font-semibold text-stone-900 text-sm">{toLocation.business}</p>
            <p className="text-xs text-stone-500">{toLocation.city}</p>
          </div>
        </div>

        {/* Item Information */}
        <div>
          <h4 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-stone-400" /> Transferred Item
          </h4>
          <div className="rounded-xl border border-stone-200 p-4 flex items-center justify-between">
            <div>
              <p className="font-serif text-lg text-stone-900">{transfer.gownName}</p>
              <p className="text-sm text-stone-500">Qty: {transfer.qty}</p>
            </div>
            <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-semibold">
              GOWN TRANSFER
            </span>
          </div>
          {transfer.note && (
            <p className="mt-2 text-sm italic text-stone-500 bg-stone-50 p-3 rounded-lg border border-stone-100">
              "{transfer.note}"
            </p>
          )}
        </div>

        {/* Audit Log */}
        <div>
          <h4 className="text-sm font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-stone-400" /> Tracking & Audit Log
          </h4>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-stone-200 before:to-transparent">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="relative flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow shrink-0 z-10 text-stone-500">
                  <log.icon className="w-4 h-4" />
                </div>
                <div className="ml-4 flex-1 bg-white p-3 rounded-lg border border-stone-200 shadow-sm flex justify-between items-center">
                  <div>
                    <h5 className="font-semibold text-stone-900 text-sm">{log.event}</h5>
                    <p className="text-xs text-stone-500 mt-0.5">By {log.user}</p>
                  </div>
                  <span className="text-xs text-stone-400">{formatDate(log.time)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Modal>
  );
}
