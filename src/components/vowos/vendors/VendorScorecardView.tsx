import React from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Star, Award, ShieldAlert, FileText, ChevronRight } from 'lucide-react';

export function VendorScorecardView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Top Performing Vendor</h4>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">Justin Alexander</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+18% Sell-through</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Average Margin</h4>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">62.4%</p>
          <p className="text-xs text-stone-500 mt-2">Target: 60.0%</p>
        </div>

        <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Late Deliveries</h4>
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">4 POs</p>
          <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +2 this quarter
          </p>
        </div>

        <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Avg Lead Time</h4>
            <ShieldCheck className="h-5 w-5 text-blue-500" />
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">14 Weeks</p>
          <p className="text-xs text-stone-500 mt-2">Across all active vendors</p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <h3 className="font-serif text-lg font-bold text-stone-900">Vendor Scorecards</h3>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Download PDF Report</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-medium">Vendor</th>
                <th className="px-6 py-3 font-medium">Overall Score</th>
                <th className="px-6 py-3 font-medium">Sell-Through</th>
                <th className="px-6 py-3 font-medium">Margin</th>
                <th className="px-6 py-3 font-medium">On-Time %</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              
              {/* Vendor 1 */}
              <tr className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-600">JA</div>
                    <div>
                      <p className="font-bold text-stone-900">Justin Alexander</p>
                      <p className="text-xs text-stone-500">Bridal & Accessories</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-stone-900">9.4</span>
                    <span className="text-xs text-stone-400">/ 10</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
                    <TrendingUp className="h-3 w-3" /> 82%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-stone-900">65.2%</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-stone-900">98%</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-stone-400 hover:text-stone-600"><ChevronRight className="h-5 w-5" /></button>
                </td>
              </tr>

              {/* Vendor 2 */}
              <tr className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-600">ML</div>
                    <div>
                      <p className="font-bold text-stone-900">Martina Liana</p>
                      <p className="text-xs text-stone-500">Bridal Couture</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-stone-900">8.8</span>
                    <span className="text-xs text-stone-400">/ 10</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
                    <TrendingUp className="h-3 w-3" /> 75%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-stone-900">61.5%</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-stone-900">92%</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-stone-400 hover:text-stone-600"><ChevronRight className="h-5 w-5" /></button>
                </td>
              </tr>

              {/* Vendor 3 - Needs Attention */}
              <tr className="hover:bg-stone-50 transition-colors bg-rose-50/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-600">MB</div>
                    <div>
                      <p className="font-bold text-stone-900 flex items-center gap-2">Madi Lane <ShieldAlert className="h-3 w-3 text-rose-500" /></p>
                      <p className="text-xs text-stone-500">Bridal</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-stone-900">6.2</span>
                    <span className="text-xs text-stone-400">/ 10</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-xs font-bold">
                    <TrendingDown className="h-3 w-3" /> 41%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-stone-900">58.0%</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-rose-600">65%</span>
                  <p className="text-[10px] text-rose-500 mt-0.5">3 POs delayed &gt; 4 weeks</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-stone-400 hover:text-stone-600"><ChevronRight className="h-5 w-5" /></button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
