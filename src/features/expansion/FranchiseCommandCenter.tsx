import React from 'react';
import { Landmark, Users, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export default function FranchiseCommandCenter() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500">
            <Landmark className="h-4 w-4" />
            <h4 className="text-sm font-semibold">Active Locations</h4>
          </div>
          <p className="mt-2 text-3xl font-bold text-stone-900">12</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500">
            <Users className="h-4 w-4" />
            <h4 className="text-sm font-semibold">Franchisees</h4>
          </div>
          <p className="mt-2 text-3xl font-bold text-stone-900">9</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500">
            <FileText className="h-4 w-4" />
            <h4 className="text-sm font-semibold">YTD Royalties</h4>
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-600">$412,500</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-rose-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-4 w-4" />
            <h4 className="text-sm font-semibold">Compliance Alerts</h4>
          </div>
          <p className="mt-2 text-3xl font-bold text-rose-600">2</p>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-stone-200 bg-stone-50 px-6 py-4">
          <h3 className="text-lg font-bold text-stone-900">Franchisee Roster</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-white text-xs uppercase text-stone-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Franchisee</th>
                <th className="px-6 py-4 font-semibold">Territory</th>
                <th className="px-6 py-4 font-semibold">Royalties YTD</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 font-medium text-stone-900">The Boutique - Dallas</td>
                <td className="px-6 py-4">Sarah Jenkins</td>
                <td className="px-6 py-4">North Dallas Exclusive</td>
                <td className="px-6 py-4 font-medium text-stone-900">$84,200</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Compliant
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 font-medium text-stone-900">The Boutique - Houston</td>
                <td className="px-6 py-4">Marcus Reed</td>
                <td className="px-6 py-4">Houston Metro</td>
                <td className="px-6 py-4 font-medium text-stone-900">$61,050</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase text-rose-700">
                    <AlertTriangle className="h-3 w-3" /> Insurance Expiring
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 font-medium text-stone-900">The Boutique - Austin</td>
                <td className="px-6 py-4">Emily Chen</td>
                <td className="px-6 py-4">Austin City Center</td>
                <td className="px-6 py-4 font-medium text-stone-900">$92,400</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Compliant
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
