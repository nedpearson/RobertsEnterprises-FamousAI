import React from 'react';
import { FileText, Download, ShieldCheck, Clock, UploadCloud, FileSignature } from 'lucide-react';

export default function FDDDocumentManager() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-6">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900">Current Franchise Disclosure Document</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
              <ShieldCheck className="h-3 w-3" /> Active & Compliant
            </span>
          </div>
          
          <div className="flex items-center gap-4 rounded-lg border border-stone-100 bg-stone-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-stone-900">FDD_2026_TheBoutique_V2.pdf</h4>
              <p className="text-xs text-stone-500">Issued: Jan 15, 2026 • Valid until: Mar 31, 2027</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium border border-stone-200 text-stone-700 hover:bg-stone-50 shadow-xs">
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-stone-200 bg-stone-50 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-stone-900">Operations Playbooks</h3>
            <button className="text-sm font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1">
              <UploadCloud className="h-4 w-4" /> Upload New
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            <div className="flex items-center justify-between p-4 hover:bg-stone-50">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-stone-400" />
                <div>
                  <p className="font-medium text-stone-900">Store Buildout Guidelines</p>
                  <p className="text-xs text-stone-500">Updated 2 months ago</p>
                </div>
              </div>
              <button className="text-stone-400 hover:text-stone-600"><Download className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-stone-50">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-stone-400" />
                <div>
                  <p className="font-medium text-stone-900">Bridal Stylist Training Manual</p>
                  <p className="text-xs text-stone-500">Updated 1 week ago</p>
                </div>
              </div>
              <button className="text-stone-400 hover:text-stone-600"><Download className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-stone-50">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-stone-400" />
                <div>
                  <p className="font-medium text-stone-900">Local Marketing Playbook</p>
                  <p className="text-xs text-stone-500">Updated 6 months ago</p>
                </div>
              </div>
              <button className="text-stone-400 hover:text-stone-600"><Download className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full space-y-6 lg:w-1/3">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-stone-900">Recent Signatures</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600">
                <FileSignature className="h-3 w-3" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900">FDD Receipt Acknowledged</p>
                <p className="text-xs text-stone-500">Rivera Holdings LLC</p>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-stone-400"><Clock className="h-3 w-3" /> 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600">
                <FileSignature className="h-3 w-3" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900">Franchise Agreement Signed</p>
                <p className="text-xs text-stone-500">Emily Chen (Austin)</p>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-stone-400"><Clock className="h-3 w-3" /> 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
