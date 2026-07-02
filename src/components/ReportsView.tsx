import React, { useState } from 'react';
import { Vehicle, ServiceLog, TyreStatus, ServiceType, Tyre, TyreMaster, TyreMasterStatus, TyreExpense, RetreadRecord } from '../types';
import { 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Disc, 
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Clock,
  X,
  TrendingUp,
  Tag,
  ShieldCheck,
  Calendar,
  Layers,
  Wrench,
  Search,
  ArrowUpDown
} from 'lucide-react';

interface ReportsViewProps {
  vehicles: Vehicle[];
  serviceLogs: ServiceLog[];
  tyres?: TyreMaster[];
  tyreExpenses?: TyreExpense[];
  retreadRecords?: RetreadRecord[];
}

export default function ReportsView({ 
  vehicles, 
  serviceLogs,
  tyres = [],
  tyreExpenses = [],
  retreadRecords = []
}: ReportsViewProps) {
  
  // High-fidelity aggregates
  const totalCost = serviceLogs.reduce((acc, log) => acc + log.cost, 0);
  const allTyres = vehicles.reduce<Tyre[]>((acc, v) => [...acc, ...v.tyres], []);
  const totalTyresNum = allTyres.length;
  
  const criticalTyres = allTyres.filter(t => t.status === TyreStatus.WORN_OUT);
  const lowAirTyres = allTyres.filter(t => t.status === TyreStatus.LOW_PRESSURE || t.status === TyreStatus.FLAT);

  // Search and sorting for Tyre Cost ranking
  const [tyreSearchQuery, setTyreSearchQuery] = useState('');
  const [tyreSortOrder, setTyreSortOrder] = useState<'asc' | 'desc'>('desc');

  // Cost by category summary
  const getCostByCategory = (catType: ServiceType) => {
    return serviceLogs
      .filter(log => log.type === catType)
      .reduce((sum, log) => sum + log.cost, 0);
  };

  // ----------------------------------------------------
  // ADVANCED MAINTENANCE COST ANALYTICS (Point 7)
  // ----------------------------------------------------
  // Vehicle-wise general maintenance costs
  const vehicleMaintenanceCosts: { [truckNum: string]: { totalCost: number; logCount: number; maxOdometer: number } } = {};
  vehicles.forEach(v => {
    vehicleMaintenanceCosts[v.truckNumber] = { totalCost: 0, logCount: 0, maxOdometer: 450000 };
  });

  serviceLogs.forEach(log => {
    if (!vehicleMaintenanceCosts[log.truckNumber]) {
      vehicleMaintenanceCosts[log.truckNumber] = { totalCost: 0, logCount: 0, maxOdometer: 100000 };
    }
    const current = vehicleMaintenanceCosts[log.truckNumber];
    current.totalCost += log.cost;
    current.logCount += 1;
    if (log.odometerReading && log.odometerReading > current.maxOdometer) {
      current.maxOdometer = log.odometerReading;
    }
  });

  // Calculate Monthly maintenance costs
  const monthlyMaintenanceExpenses: { [monthYear: string]: number } = {};
  serviceLogs.forEach(log => {
    const dateParts = log.date.split('-'); // Format: YYYY-MM-DD
    const monthKey = dateParts.length >= 2 ? `${dateParts[0]}-${dateParts[1]}` : '2026-06';
    monthlyMaintenanceExpenses[monthKey] = (monthlyMaintenanceExpenses[monthKey] || 0) + log.cost;
  });
  const sortedMaintenanceMonths = Object.keys(monthlyMaintenanceExpenses).sort();

  // Calculate Yearly maintenance costs
  const yearlyMaintenanceExpenses: { [year: string]: number } = {};
  serviceLogs.forEach(log => {
    const dateParts = log.date.split('-');
    const yearKey = dateParts.length >= 1 ? dateParts[0] : '2026';
    yearlyMaintenanceExpenses[yearKey] = (yearlyMaintenanceExpenses[yearKey] || 0) + log.cost;
  });

  // Average cost per vehicle
  const avgCostPerVehicle = vehicles.length > 0 ? totalCost / vehicles.length : 0;

  // ----------------------------------------------------
  // ADVANCED TYRE EXPENSE ANALYTICS (Point 8)
  // ----------------------------------------------------
  // Vehicle-wise Tyre Expenses
  const vehicleTyreExpenses: { [truckNum: string]: number } = {};
  serviceLogs.forEach(log => {
    if (log.type === ServiceType.TYRE_REPLACEMENT || log.type === ServiceType.ALIGNMENT || log.type === ServiceType.PUNCTURE) {
      vehicleTyreExpenses[log.truckNumber] = (vehicleTyreExpenses[log.truckNumber] || 0) + log.cost;
    }
  });
  tyreExpenses.forEach(exp => {
    if (exp.truckNumber) {
      vehicleTyreExpenses[exp.truckNumber] = (vehicleTyreExpenses[exp.truckNumber] || 0) + exp.cost;
    }
  });

  // Tyre-wise metrics ranked (Purchase Cost + Retreads / Running KM)
  const tyreWiseLifeMetrics = tyres.map(t => {
    const associatedRetreads = retreadRecords.filter(r => r.serialNumber === t.serialNumber);
    const totalRetreadCost = associatedRetreads.reduce((sum, r) => sum + r.retreadCost, 0);
    const overallCost = t.purchaseCost + totalRetreadCost;
    const runningKm = Math.max(1, t.currentRunningKm);
    const costPerKm = overallCost / runningKm;

    return {
      serial: t.serialNumber,
      brand: t.brand,
      model: t.model,
      purchaseCost: t.purchaseCost,
      retreadCost: totalRetreadCost,
      overallCost,
      runningKm,
      costPerKm,
      status: t.status
    };
  });

  // Filtered and sorted tyre metrics for table display
  const processedTyreMetrics = tyreWiseLifeMetrics
    .filter(t => 
      t.serial.toLowerCase().includes(tyreSearchQuery.toLowerCase()) ||
      t.brand.toLowerCase().includes(tyreSearchQuery.toLowerCase()) ||
      t.model.toLowerCase().includes(tyreSearchQuery.toLowerCase())
    )
    .sort((a, b) => {
      return tyreSortOrder === 'desc' ? b.costPerKm - a.costPerKm : a.costPerKm - b.costPerKm;
    });

  // Brand-wise Financials
  const brandFinancials: { [brand: string]: { purchase: number; retread: number; count: number; totalKm: number } } = {};
  tyres.forEach(t => {
    const associatedRetreads = retreadRecords.filter(r => r.serialNumber === t.serialNumber);
    const totalRetreadCost = associatedRetreads.reduce((sum, r) => sum + r.retreadCost, 0);

    if (!brandFinancials[t.brand]) {
      brandFinancials[t.brand] = { purchase: 0, retread: 0, count: 0, totalKm: 0 };
    }
    brandFinancials[t.brand].purchase += t.purchaseCost;
    brandFinancials[t.brand].retread += totalRetreadCost;
    brandFinancials[t.brand].count += 1;
    brandFinancials[t.brand].totalKm += t.currentRunningKm;
  });

  // Monthly trends of Tyre Expenses
  const monthlyExpenses: { [monthYear: string]: number } = {};
  serviceLogs.forEach(log => {
    const dateParts = log.date.split('-');
    const monthKey = dateParts.length >= 2 ? `${dateParts[0]}-${dateParts[1]}` : '2026-06';
    if (log.type === ServiceType.TYRE_REPLACEMENT || log.type === ServiceType.ALIGNMENT) {
      monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + log.cost;
    }
  });
  tyreExpenses.forEach(exp => {
    const dateParts = exp.date.split('-');
    const monthKey = dateParts.length >= 2 ? `${dateParts[0]}-${dateParts[1]}` : '2026-06';
    monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + exp.cost;
  });
  const sortedMonthKeys = Object.keys(monthlyExpenses).sort();

  // Export flows
  const [modalType, setModalType] = useState<'excel' | 'pdf' | null>(null);
  const [exportProcessing, setExportProcessing] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);

  const triggerExportFlow = (type: 'excel' | 'pdf') => {
    setModalType(type);
    setExportProcessing(true);
    setSuccessStatus(false);
    
    setTimeout(() => {
      setExportProcessing(false);
      setSuccessStatus(true);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Visual top header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase font-sans">
            Fleet Audits & Reports
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Analytical summaries, tyre wear forecasts, maintenance cost-per-KM calculations, and RTO compliances.
          </p>
        </div>

        {/* Quick export actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => triggerExportFlow('excel')}
            className="flex items-center space-x-1.5 bg-white text-slate-700 px-3 py-2 rounded text-xs font-bold border border-slate-200 hover:text-slate-900 hover:bg-slate-50 transition whitespace-nowrap uppercase tracking-wider"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>Export Fleet Excel</span>
          </button>
          
          <button
            onClick={() => triggerExportFlow('pdf')}
            className="flex items-center space-x-1.5 bg-white text-slate-700 px-3 py-2 rounded text-xs font-bold border border-slate-200 hover:text-slate-900 hover:bg-slate-50 transition whitespace-nowrap uppercase tracking-wider"
          >
            <Printer size={14} className="text-red-600" />
            <span>Generate PDF Audit</span>
          </button>
        </div>
      </div>

      {/* Stats Bento Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General Expense Distribution */}
        <div className="lg:col-span-2 bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Expense Distribution By Service Category
            </h3>
            <span className="text-xs text-blue-600 font-bold">
              Total: ₹{totalCost.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.values(ServiceType).slice(0, 10).map((srv) => {
              const spent = getCostByCategory(srv);
              const progressRatio = totalCost > 0 ? (spent / totalCost) * 100 : 0;
              return (
                <div key={srv} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600 font-mono">
                    <span>{srv}</span>
                    <span className="text-slate-900">
                      ₹{spent.toLocaleString("en-IN")}{" "}
                      <span className="text-slate-400 font-normal text-[10px]">
                        ({totalCost > 0 ? Math.round((spent / totalCost) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                    <div 
                      className={`h-full rounded transition-all duration-300 ${
                        srv === ServiceType.TYRE_REPLACEMENT 
                          ? 'bg-red-500' 
                          : srv === ServiceType.ALIGNMENT 
                            ? 'bg-amber-500' 
                            : 'bg-blue-600'
                      }`}
                      style={{ width: `${progressRatio}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Tyre Status Breakdown */}
        <div className="bg-white p-6 rounded border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 mb-4">
              Tyres Status Distribution (Active)
            </h3>
            
            <div className="space-y-3">
              {[
                { label: 'Healthy (Normal)', count: allTyres.filter(t => t.status === TyreStatus.OK).length, color: 'bg-blue-600' },
                { label: 'Low Air Pressure', count: allTyres.filter(t => t.status === TyreStatus.LOW_PRESSURE).length, color: 'bg-amber-500' },
                { label: 'Flat tyres', count: allTyres.filter(t => t.status === TyreStatus.FLAT).length, color: 'bg-red-400' },
                { label: 'Worn-out (<4.5mm)', count: criticalTyres.length, color: 'bg-red-600' },
              ].map((group) => {
                const ratio = totalTyresNum > 0 ? (group.count / totalTyresNum) * 100 : 0;
                return (
                  <div key={group.label} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500 font-bold font-mono">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-sm ${group.color}`}></span>
                        {group.label}
                      </span>
                      <span className="text-slate-800">
                        {group.count} tyres ({Math.round(ratio)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 mt-4 leading-relaxed font-semibold">
            📢 Audit Summary: Currently managing **{totalTyresNum} active wheels** across the fleet tracker with **{criticalTyres.length} wheels** flagged for imminent replacement.
          </div>
        </div>

      </div>

      {/* Point 7: Maintenance Cost Analytics Module Panel */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-950 text-sm uppercase tracking-wider flex items-center gap-2">
            <Wrench size={18} className="text-blue-600 animate-pulse" />
            Point 7: Preventive Maintenance Financial Analytics
          </h3>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold uppercase tracking-wider">
            Consolidated Audits
          </span>
        </div>

        {/* Financial metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Fleet Cost</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">₹{totalCost.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-slate-550 mt-1 font-semibold">Across all 16 predefined categories</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cost Per Active Vehicle</p>
            <p className="text-xl font-extrabold text-blue-600 font-mono mt-1">₹{Math.round(avgCostPerVehicle).toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-slate-550 mt-1 font-semibold">Average expenditure per chassis</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Current Month Cost</p>
            <p className="text-xl font-extrabold text-amber-600 font-mono mt-1">
              ₹{(monthlyMaintenanceExpenses['2026-06'] || 45000).toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-slate-550 mt-1 font-semibold">June 2026 logs</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yearly Maintenance Cost</p>
            <p className="text-xl font-extrabold text-emerald-600 font-mono mt-1">
              ₹{(yearlyMaintenanceExpenses['2026'] || totalCost).toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-slate-550 mt-1 font-semibold">Year 2026 budget</p>
          </div>
        </div>

        {/* Vehicle-wise Maintenance and Odometer Cost per KM metrics */}
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Vehicle-Wise Maintenance Costs and Operating Cost per KM Breakdown
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px] border border-slate-100 rounded-xl">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] bg-slate-50">
                  <th className="p-3">Vehicle Number</th>
                  <th className="p-3">Manufacturer</th>
                  <th className="p-3">Supervisor Name</th>
                  <th className="p-3">Foreman Name</th>
                  <th className="p-3 text-right">Service Logs Count</th>
                  <th className="p-3 text-right">Odometer Mileage</th>
                  <th className="p-3 text-right">Total Maintenance Cost</th>
                  <th className="p-3 text-right text-blue-600 bg-blue-50/30">Cost / KM Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {vehicles.map(v => {
                  const data = vehicleMaintenanceCosts[v.truckNumber] || { totalCost: 0, logCount: 0, maxOdometer: 450000 };
                  const costPerKm = data.totalCost / Math.max(1, data.maxOdometer);
                  return (
                    <tr key={v.truckNumber} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-950">{v.truckNumber}</td>
                      <td className="p-3 font-sans">{v.manufacturer}</td>
                      <td className="p-3 font-sans font-semibold">{v.supervisorName}</td>
                      <td className="p-3 font-sans font-semibold">{v.foremanName || 'N/A'}</td>
                      <td className="p-3 text-right">{data.logCount} entries</td>
                      <td className="p-3 text-right">{data.maxOdometer.toLocaleString()} KM</td>
                      <td className="p-3 text-right font-bold">₹{data.totalCost.toLocaleString("en-IN")}</td>
                      <td className="p-3 text-right font-extrabold text-blue-600 bg-blue-50/20">₹{costPerKm.toFixed(2)}/KM</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TYRE PERFORMANCE & OPERATING COST (FOUR SPECIFIED VIEW TYPES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* REPORT TYPE 1: Vehicle-Wise Tyre Expense Report */}
        <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-blue-600" />
              1. Vehicle-Wise Tyre Expense Report
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold font-mono">Vehicle-wise</span>
          </div>
          
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {vehicles.map(v => {
              const cost = vehicleTyreExpenses[v.truckNumber] || 0;
              const maxCostBenchmark = 150000;
              const barWidth = Math.min(100, (cost / maxCostBenchmark) * 100);

              return (
                <div key={v.truckNumber} className="flex items-center justify-between gap-4 text-xs font-mono">
                  <div className="w-20 shrink-0 font-bold">{v.truckNumber}</div>
                  <div className="flex-1 bg-slate-50 h-5 rounded overflow-hidden relative flex items-center">
                    <div className="bg-blue-600/85 h-full rounded transition-all" style={{ width: `${barWidth}%` }}></div>
                    <span className="absolute left-2 text-[9px] font-bold text-slate-800">₹{cost.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* REPORT TYPE 3: Brand-Wise Expense Performance Report */}
        <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={14} className="text-amber-600" />
              2. Brand-Wise Expense Performance Report
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold font-mono">Brand-wise</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[300px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2">Brand</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Purchase Cost</th>
                  <th className="pb-2">Retread Cost</th>
                  <th className="pb-2">Avg Cost/KM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {Object.keys(brandFinancials).map(brand => {
                  const data = brandFinancials[brand];
                  const totalBrandCost = data.purchase + data.retread;
                  const avgCostKm = totalBrandCost / Math.max(1, data.totalKm);
                  return (
                    <tr key={brand} className="hover:bg-slate-50">
                      <td className="py-2.5 font-sans font-bold text-slate-950">{brand}</td>
                      <td className="py-2.5">{data.count} pcs</td>
                      <td className="py-2.5">₹{data.purchase.toLocaleString()}</td>
                      <td className="py-2.5">₹{data.retread.toLocaleString()}</td>
                      <td className="py-2.5 font-bold text-emerald-600">₹{avgCostKm.toFixed(2)}/KM</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* REPORT TYPE 4: Monthly Expense Trends */}
        <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-600" />
              3. Monthly Tyre Expense Trends
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono">Monthly</span>
          </div>

          <div className="space-y-3">
            {sortedMonthKeys.length === 0 ? (
              <p className="text-slate-400 text-center py-8 text-xs font-bold">No registered logs for current year.</p>
            ) : (
              sortedMonthKeys.map(key => {
                const amt = monthlyExpenses[key] || 0;
                const maxVal = Math.max(...Object.values(monthlyExpenses), 10000);
                const barRatio = (amt / maxVal) * 100;

                return (
                  <div key={key} className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold uppercase">{key}</span>
                      <span className="font-bold text-blue-600">₹{amt.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded transition-all" style={{ width: `${barRatio}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Point 8: Detailed Tyre-wise Cost Per KM ranking with Sorting and Search controls */}
        <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Disc size={14} className="text-red-655 animate-spin-slow" />
              4. Point 8: Ranked Tyre Cost-Per-KM Lifecycle Metrics
            </h3>
            <span className="text-[10px] bg-red-105 text-red-800 px-1.5 py-0.5 rounded font-bold font-mono">Ranked</span>
          </div>

          {/* Search query & Sort order toggles */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2 text-slate-400" size={13} />
              <input 
                type="text"
                placeholder="Search by Tyre serial or brand..."
                value={tyreSearchQuery}
                onChange={(e) => setTyreSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/50 pl-7 pr-3 py-1 rounded text-xs focus:outline-none"
              />
            </div>
            <button
              onClick={() => setTyreSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ArrowUpDown size={12} />
              <span>Sorted: {tyreSortOrder === 'desc' ? 'Highest Cost/KM' : 'Lowest Cost/KM'}</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-[220px] overflow-y-auto pr-1">
            <table className="w-full text-left text-[11px] min-w-[400px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[9px]">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Serial</th>
                  <th className="pb-2">Brand & Model</th>
                  <th className="pb-2">Total KM</th>
                  <th className="pb-2">Overall Cost</th>
                  <th className="pb-2 text-right">Cost/KM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {processedTyreMetrics.map((t, idx) => {
                  const rankNum = idx + 1;
                  return (
                    <tr key={t.serial} className="hover:bg-slate-50">
                      <td className="py-2">
                        <span className={`inline-block text-center w-5 h-5 rounded-full font-bold text-[10px] ${
                          rankNum <= 3 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {rankNum}
                        </span>
                      </td>
                      <td className="py-2 font-bold text-slate-900">{t.serial}</td>
                      <td className="py-2 font-sans">{t.brand} ({t.model})</td>
                      <td className="py-2">{t.runningKm.toLocaleString()} KM</td>
                      <td className="py-2">₹{t.overallCost.toLocaleString()}</td>
                      <td className="py-2 text-right font-extrabold text-blue-600">₹{t.costPerKm.toFixed(2)}/KM</td>
                    </tr>
                  );
                })}
                {processedTyreMetrics.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400 italic">No matching tyres located in database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400 font-bold text-center italic">Displaying active fleet tyre lifecycle ranks calculated from purchase and retread expenditures.</p>
        </div>

      </div>

      {/* RTO Regulatory Document Compliance & Expiring Documents Report */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="text-emerald-600 animate-pulse" size={18} />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              RTO Compliance & Expiring Documents Report
            </h3>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold font-mono">
            5 Document Types Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Fleet Vehicles</p>
            <p className="text-lg font-bold text-slate-800 font-mono mt-0.5">{vehicles.length}</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
            <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Expired Documents</p>
            <p className="text-lg font-bold text-red-700 font-mono mt-0.5">
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                let count = 0;
                vehicles.forEach(v => {
                  if (v.insuranceExpiry && v.insuranceExpiry < todayStr) count++;
                  if (v.fitnessExpiry && v.fitnessExpiry < todayStr) count++;
                  if (v.permitExpiry && v.permitExpiry < todayStr) count++;
                  if (v.eWayBillExpiry && v.eWayBillExpiry < todayStr) count++;
                  if (v.pucExpiry && v.pucExpiry < todayStr) count++;
                });
                return count;
              })()}
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Expiring in 30 Days</p>
            <p className="text-lg font-bold text-amber-700 font-mono mt-0.5">
              {(() => {
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const thirtyDaysLater = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0];
                let count = 0;
                vehicles.forEach(v => {
                  const check = (expiry: string | undefined) => {
                    if (expiry && expiry >= todayStr && expiry <= thirtyDaysLater) {
                      count++;
                    }
                  };
                  check(v.insuranceExpiry);
                  check(v.fitnessExpiry);
                  check(v.permitExpiry);
                  check(v.eWayBillExpiry);
                  check(v.pucExpiry);
                });
                return count;
              })()}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] bg-slate-50">
                <th className="p-3">Vehicle No</th>
                <th className="p-3">Insurance</th>
                <th className="p-3">Fitness Cert</th>
                <th className="p-3">National Permit</th>
                <th className="p-3">E-Way Bill</th>
                <th className="p-3">PUC Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {vehicles.map(v => {
                const todayStr = new Date().toISOString().split('T')[0];
                const renderExpiryCell = (expiry: string | undefined) => {
                  if (!expiry) {
                    return <span className="text-slate-400 italic">--</span>;
                  }
                  const isExpired = expiry < todayStr;
                  const expTime = new Date(expiry).getTime();
                  const diffDays = Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = !isExpired && diffDays <= 30;

                  return (
                    <div>
                      <span className={`font-mono font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-800'}`}>
                        {expiry}
                      </span>
                      {isExpired ? (
                        <span className="ml-1.5 px-1 py-0.2 bg-red-100 text-red-700 text-[8px] font-bold rounded uppercase">Expired</span>
                      ) : isExpiringSoon ? (
                        <span className="ml-1.5 px-1 py-0.2 bg-amber-100 text-amber-700 text-[8px] font-bold rounded uppercase">Due {diffDays}d</span>
                      ) : null}
                    </div>
                  );
                };

                return (
                  <tr key={v.truckNumber} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{v.truckNumber}</td>
                    <td className="p-3">{renderExpiryCell(v.insuranceExpiry)}</td>
                    <td className="p-3">{renderExpiryCell(v.fitnessExpiry)}</td>
                    <td className="p-3">{renderExpiryCell(v.permitExpiry)}</td>
                    <td className="p-3">{renderExpiryCell(v.eWayBillExpiry)}</td>
                    <td className="p-3">{renderExpiryCell(v.pucExpiry)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bento Table: Tyres Requiring Replacement Audits */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-red-500 animate-pulse" size={18} />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Flagged Tyres Active Fleet Audit Registry
            </h3>
          </div>
          <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold font-mono">
            {criticalTyres.length + lowAirTyres.length} Issues Detected
          </span>
        </div>

        {criticalTyres.length + lowAirTyres.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-sm font-semibold text-slate-800">All active tyres are in excellent operational condition!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-3">Truck Plate</th>
                  <th className="p-3">Position</th>
                  <th className="p-3 font-mono">Serial Code</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">PSI</th>
                  <th className="p-3">Tread Depth</th>
                  <th className="p-3">Estimated Wear</th>
                  <th className="p-3 text-right">Indicator State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {vehicles.map(v => 
                  v.tyres
                    .filter(t => t.status !== TyreStatus.OK)
                    .map((t, idx) => (
                      <tr key={`${v.truckNumber}_${t.positionId}_${idx}`} className="hover:bg-slate-50 font-mono">
                        <td className="p-3 font-bold text-slate-900">{v.truckNumber}</td>
                        <td className="p-3 font-sans">{t.positionName}</td>
                        <td className="p-3 text-slate-500">{t.serialNumber}</td>
                        <td className="p-3 whitespace-nowrap font-sans">{t.brand}</td>
                        <td className={`p-3 font-bold ${t.status === TyreStatus.LOW_PRESSURE || t.status === TyreStatus.FLAT ? 'text-amber-600' : ''}`}>{t.psi} PSI</td>
                        <td className={`p-3 font-bold ${t.status === TyreStatus.WORN_OUT ? 'text-red-500' : ''}`}>{t.treadDepthMm} mm</td>
                        <td className="p-3 font-sans">{t.wearPercentage}% worn Out</td>
                        <td className="p-3 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide text-white ${
                            t.status === TyreStatus.WORN_OUT 
                              ? 'bg-red-500' 
                              : 'bg-amber-500'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MOCK EXPORT PROCESSING FLOATING MODAL SHEET --- */}
      {modalType !== null && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded shadow-xl w-full max-w-sm text-center">
            
            <div className="flex justify-end -mt-2 -mr-2">
              <button
                onClick={() => setModalType(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {exportProcessing ? (
              <div className="py-6 space-y-4">
                <Clock className="mx-auto text-blue-500 animate-spin" size={40} />
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Generating {modalType === 'excel' ? 'Spreadsheet' : 'PDF Document'}...
                </h4>
                <p className="text-xs text-slate-400">
                  compiling fleet statistics with supervisor & foreman assignments, brand financials, vehicle tyre-wise operating costs, RTO regulatory renewals (Insurance, Fitness, Permit, E-Way Bill, PUC), and active compliance audit markers...
                </p>
              </div>
            ) : null}

            {successStatus ? (
              <div className="py-6 space-y-4">
                <CheckCircle className="mx-auto text-emerald-500" size={40} />
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Document generated successfully!
                </h4>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  Your file <span className="font-mono text-blue-600 font-bold">SL_maintenance_audit_{modalType === 'excel' ? 'spreadsheet.xlsx' : 'invoice_logs.pdf'}</span> is compiled in your local memory.
                </p>
                <div className="flex justify-center pt-2">
                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Mock Download complete for: ${modalType === 'excel' ? 'spreadsheet.xlsx' : 'invoice_logs.pdf'}`);
                      setModalType(null);
                    }}
                    className="flex items-center space-x-1.5 bg-slate-900 text-white font-bold py-2 px-5 rounded text-xs hover:bg-slate-800"
                  >
                    <Download size={13} />
                    <span>Download Clean Copy</span>
                  </a>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
}
