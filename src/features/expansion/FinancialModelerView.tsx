import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, HelpCircle } from 'lucide-react';

export default function FinancialModelerView() {
  const [rent, setRent] = useState(12000);
  const [buildout, setBuildout] = useState(250000);
  const [inventory, setInventory] = useState(150000);
  const [projectedSales, setProjectedSales] = useState(1200000);
  const [cogsPercent, setCogsPercent] = useState(45);
  
  const initialInvestment = buildout + inventory + 50000; // + working capital
  const annualRent = rent * 12;
  const grossProfit = projectedSales * (1 - (cogsPercent / 100));
  const operatingExpenses = annualRent + 180000 + 40000; // rent + payroll + marketing
  const netIncome = grossProfit - operatingExpenses;
  const roi = (netIncome / initialInvestment) * 100;
  const paybackPeriod = initialInvestment / netIncome;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Inputs */}
      <div className="w-full rounded-2xl border border-stone-200 bg-white p-6 lg:w-1/3">
        <div className="mb-6 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-stone-700" />
          <h3 className="text-lg font-bold text-stone-900">Assumptions</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700">Monthly Rent Estimate</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-500">$</span>
              <input 
                type="number" 
                value={rent}
                onChange={(e) => setRent(Number(e.target.value))}
                className="block w-full rounded-md border-stone-300 pl-7 text-sm focus:border-rose-500 focus:ring-rose-500" 
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-stone-700">Buildout / Renovation</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-500">$</span>
              <input 
                type="number" 
                value={buildout}
                onChange={(e) => setBuildout(Number(e.target.value))}
                className="block w-full rounded-md border-stone-300 pl-7 text-sm focus:border-rose-500 focus:ring-rose-500" 
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">Opening Inventory</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-500">$</span>
              <input 
                type="number" 
                value={inventory}
                onChange={(e) => setInventory(Number(e.target.value))}
                className="block w-full rounded-md border-stone-300 pl-7 text-sm focus:border-rose-500 focus:ring-rose-500" 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <label className="text-sm font-medium text-stone-700">Projected Year 1 Sales</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-500">$</span>
              <input 
                type="number" 
                value={projectedSales}
                onChange={(e) => setProjectedSales(Number(e.target.value))}
                className="block w-full rounded-md border-stone-300 pl-7 text-sm focus:border-rose-500 focus:ring-rose-500" 
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">Average COGS %</label>
            <div className="relative mt-1">
              <input 
                type="number" 
                value={cogsPercent}
                onChange={(e) => setCogsPercent(Number(e.target.value))}
                className="block w-full rounded-md border-stone-300 pr-7 text-sm focus:border-rose-500 focus:ring-rose-500" 
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-500">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-stone-900 p-6 text-white shadow-lg">
            <h4 className="text-sm font-medium text-stone-400">Initial Investment</h4>
            <p className="mt-2 text-3xl font-bold">${initialInvestment.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-lg">
            <h4 className="text-sm font-medium text-emerald-100">Projected Net Income (Yr 1)</h4>
            <p className="mt-2 text-3xl font-bold">${netIncome.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h4 className="text-sm font-medium text-stone-500">Payback Period</h4>
            <p className="mt-2 text-3xl font-bold text-stone-900">
              {paybackPeriod > 0 ? `${paybackPeriod.toFixed(1)} Years` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900">Year 1 Pro Forma P&L</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-600">Gross Sales</span>
              <span className="font-semibold text-stone-900">${projectedSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-600">Cost of Goods Sold ({cogsPercent}%)</span>
              <span className="text-rose-600">-${(projectedSales * (cogsPercent/100)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-2 bg-stone-50 p-2 rounded">
              <span className="font-bold text-stone-900">Gross Profit</span>
              <span className="font-bold text-emerald-600">${grossProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-2 pt-2">
              <span className="text-stone-600">Annual Rent</span>
              <span className="text-stone-900">-${annualRent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-600">Payroll (Est.)</span>
              <span className="text-stone-900">-$180,000</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-600">Marketing & Operations</span>
              <span className="text-stone-900">-$40,000</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-bold text-stone-900 text-lg">Net Income</span>
              <span className="font-bold text-emerald-600 text-lg">${netIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
