import React from 'react';
import { Vehicle, ServiceLog, TyreMaster, TyreInspection, ServiceSchedule, CentralNotification } from '../types';

const formatDateToShow = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day}-${months[monthIndex]}-${year}`;
    }
  }
  return dateStr;
};

import { 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Truck, 
  MapPin, 
  ArrowRight,
  Wrench,
  Clock,
  AlertCircle,
  Calendar,
  Bell,
  TrendingUp,
  ClipboardList
} from 'lucide-react';

interface DashboardViewProps {
  vehicles: Vehicle[];
  serviceLogs: ServiceLog[];
  setTab: (tab: string) => void;
  setSelectedTruckNumForTyres: (num: string) => void;
  tyres?: TyreMaster[];
  tyreInspections?: TyreInspection[];
  serviceSchedules?: ServiceSchedule[];
  notifications?: CentralNotification[];
  setNotifications?: React.Dispatch<React.SetStateAction<CentralNotification[]>>;
}

export default function DashboardView({ 
  vehicles, 
  serviceLogs, 
  setTab,
  setSelectedTruckNumForTyres,
  tyres = [],
  tyreInspections = [],
  serviceSchedules = [],
  notifications = [],
  setNotifications
}: DashboardViewProps) {
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 1. FLEET SUMMARY STATS
  const totalVehicles = vehicles.length;
  const inTransitVehicles = vehicles.filter(v => v.tripStatus === 'In Transit').length;
  const completedTrips = vehicles.filter(v => v.tripStatus === 'Completed').length;
  const vehiclesUnderMaintenanceCount = vehicles.filter(v => 
    serviceSchedules.some(s => s.truckNumber === v.truckNumber && s.status === 'In Progress')
  ).length;

  // 2. VEHICLES UNDER MAINTENANCE
  const activeMaintenanceSchedules = serviceSchedules.filter(s => s.status === 'In Progress');

  // 3. SERVICE DUE ALERTS (Upcoming schedules, not overdue)
  const serviceDueSchedules = serviceSchedules.filter(s => 
    s.status === 'Upcoming' && (!s.dueDate || s.dueDate >= todayStr)
  );

  // 4. OVERDUE MAINTENANCE ALERTS
  const overdueSchedules = serviceSchedules.filter(s => 
    s.status === 'Upcoming' && s.dueDate && s.dueDate < todayStr
  );

  // RTO Expiries
  const expiredVehiclesList: { truckNumber: string; document: string; expDate: string }[] = [];
  vehicles.forEach(v => {
    if (v.insuranceExpiry && v.insuranceExpiry < todayStr) {
      expiredVehiclesList.push({ truckNumber: v.truckNumber, document: 'Insurance', expDate: v.insuranceExpiry });
    }
    if (v.fitnessExpiry && v.fitnessExpiry < todayStr) {
      expiredVehiclesList.push({ truckNumber: v.truckNumber, document: 'Fitness Certificate', expDate: v.fitnessExpiry });
    }
    if (v.permitExpiry && v.permitExpiry < todayStr) {
      expiredVehiclesList.push({ truckNumber: v.truckNumber, document: 'National Permit', expDate: v.permitExpiry });
    }
  });

  // 5. MONTHLY MAINTENANCE COST
  // Calculate expenditure per month for 2026
  const months_2026 = ['01', '02', '03', '04', '05', '06'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const monthlyCostsMap = months_2026.map(m => {
    const cost = serviceLogs
      .filter(log => log.date.startsWith(`2026-${m}`))
      .reduce((sum, log) => sum + log.cost, 0);
    return cost;
  });

  const currentMonthCost = monthlyCostsMap[5]; // June 2026
  const previousMonthCost = monthlyCostsMap[4]; // May 2026
  const totalYearlyCost = serviceLogs.reduce((sum, log) => sum + log.cost, 0);

  // 6. RECENT MAINTENANCE ACTIVITY
  const recentLogs = [...serviceLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // 7. NOTIFICATIONS
  const recentNotifications = [...notifications]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  const handleMarkAsRead = (id: string) => {
    if (setNotifications) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkAllAsRead = () => {
    if (setNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
            Fleet Operations & Maintenance Dashboard
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Real-time transport fleet oversight, service tracking, and operational expenses.
          </p>
        </div>
        <div className="text-xs bg-blue-50 border border-blue-200 text-blue-700 font-bold px-3 py-1.5 rounded flex items-center gap-2 shadow-sm font-mono">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>SYSTEM DISPATCH ACTIVE</span>
        </div>
      </div>

      {/* 1. FLEET SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Vehicles */}
        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Fleet Vehicles</span>
            <span className="p-1.5 bg-slate-50 text-slate-600 rounded">
              <Truck size={14} />
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalVehicles}</span>
            <span className="text-xs text-slate-500 font-medium">Trucks registered</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded mt-3 overflow-hidden">
            <div className="bg-slate-900 h-full rounded" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Vehicles In Transit */}
        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-blue-600">Active In-Transit</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
              <Truck size={14} className="animate-pulse" />
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-bold font-mono text-blue-600">{inTransitVehicles}</span>
            <span className="text-xs text-slate-500 font-medium">On Trip</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded mt-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded" 
              style={{ width: `${totalVehicles > 0 ? (inTransitVehicles / totalVehicles) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Vehicles Under Maintenance Card */}
        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-amber-600">Under Maintenance</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded">
              <Wrench size={14} />
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-bold font-mono text-amber-600">{vehiclesUnderMaintenanceCount}</span>
            <span className="text-xs text-slate-500 font-medium">Active workshop jobs</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded" 
              style={{ width: `${totalVehicles > 0 ? (vehiclesUnderMaintenanceCount / totalVehicles) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Monthly Cost Summary Card */}
        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-emerald-600">Monthly Expenses</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
              <DollarSign size={14} />
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-xl font-bold font-mono text-emerald-600">₹{currentMonthCost.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 font-semibold font-mono">June 2026</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded" 
              style={{ width: `${totalYearlyCost > 0 ? (currentMonthCost / totalYearlyCost) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Grid of Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2. VEHICLES UNDER MAINTENANCE PANEL */}
          <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <Wrench className="text-amber-600" size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Vehicles Under Maintenance ({activeMaintenanceSchedules.length} Active Jobs)
              </h3>
            </div>
            {activeMaintenanceSchedules.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded border border-slate-100">
                <CheckCircle size={28} className="mx-auto mb-2 text-emerald-600" />
                <p className="text-xs font-bold text-slate-800 uppercase">No active maintenance jobs</p>
                <p className="text-[11px] text-slate-400 mt-1">All fleet vehicles are operational on the road.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeMaintenanceSchedules.map(schedule => {
                  const veh = vehicles.find(v => v.truckNumber === schedule.truckNumber);
                  return (
                    <div key={schedule.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-slate-900 text-xs">{schedule.truckNumber}</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-extrabold uppercase">
                          In Progress
                        </span>
                      </div>
                      <div className="text-xs text-slate-700">
                        <span className="font-bold text-blue-600 uppercase">{schedule.serviceType}</span>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Workshop: {schedule.workshop || 'N/A'}</p>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-200/60 pt-2">
                        <span>Due: {schedule.dueDate || 'Odo Limit'}</span>
                        <span>Supervisor Name: {veh?.supervisorName || 'N/A'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. & 4. SERVICE DUE & OVERDUE MAINTENANCE ALERTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* OVERDUE MAINTENANCE ALERTS (CRITICAL) */}
            <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <AlertTriangle className="text-red-600" size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Overdue Maintenance Alerts ({overdueSchedules.length + expiredVehiclesList.length})
                </h3>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {overdueSchedules.length === 0 && expiredVehiclesList.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 border border-slate-100 rounded bg-slate-50">
                    <CheckCircle size={24} className="mx-auto mb-1 text-emerald-600" />
                    <p className="text-[11px] font-bold text-slate-700 uppercase">No overdue schedules</p>
                  </div>
                ) : (
                  <>
                    {/* Overdue Schedules */}
                    {overdueSchedules.map(s => (
                      <div key={s.id} className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold font-mono text-slate-900">{s.truckNumber}</span>
                          <span className="text-[9px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded uppercase">
                            OVERDUE
                          </span>
                        </div>
                        <p className="font-bold text-red-700">{s.serviceType}</p>
                        <p className="text-[10px] text-slate-400">Scheduled Date: {formatDateToShow(s.dueDate)}</p>
                      </div>
                    ))}

                    {/* Expired RTO Compliances */}
                    {expiredVehiclesList.map((item, idx) => (
                      <div key={idx} className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold font-mono text-slate-900">{item.truckNumber}</span>
                          <span className="text-[9px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded uppercase">
                            EXPIRED RTO
                          </span>
                        </div>
                        <p className="font-bold text-amber-800">{item.document}</p>
                        <p className="text-[10px] text-slate-400">Expiry Date: {formatDateToShow(item.expDate)}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* SERVICE DUE ALERTS (UPCOMING) */}
            <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Calendar className="text-blue-600" size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Service Due Alerts ({serviceDueSchedules.length})
                </h3>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {serviceDueSchedules.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 border border-slate-100 rounded bg-slate-50">
                    <ClipboardList size={24} className="mx-auto mb-1 text-slate-300" />
                    <p className="text-[11px] font-bold text-slate-500 uppercase">No upcoming due services</p>
                  </div>
                ) : (
                  serviceDueSchedules.map(s => (
                    <div key={s.id} className="p-3 bg-blue-50/40 border border-blue-100 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold font-mono text-slate-900">{s.truckNumber}</span>
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded uppercase">
                          UPCOMING
                        </span>
                      </div>
                      <p className="font-bold text-blue-700">{s.serviceType}</p>
                      <p className="text-[10px] text-slate-400">Due Date: {formatDateToShow(s.dueDate)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* 6. RECENT MAINTENANCE ACTIVITY TIMELINE */}
          <div className="bg-white border border-slate-200 p-5 rounded shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ClipboardList className="text-slate-800" size={16} />
                <h3 className="font-bold text-slate-900 uppercase tracking-tight text-xs">
                  Recent Maintenance Activity Logs
                </h3>
              </div>
              <button 
                onClick={() => setTab('service')}
                className="text-[10px] font-extrabold text-blue-600 uppercase hover:underline"
              >
                Go to Logs
              </button>
            </div>

            <div className="space-y-4">
              {recentLogs.map(log => (
                <div key={log.id} className="relative pl-4 border-l-2 border-slate-200 py-1 space-y-1">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-slate-900 font-mono mr-2">{log.truckNumber}</span>
                      <span className="text-slate-400 font-mono">•</span>
                      <span className="text-blue-600 font-bold ml-2">{log.type}</span>
                    </div>
                    <span className="bg-slate-100 text-slate-800 font-mono font-bold px-2 py-0.5 rounded-full text-[10px]">
                      ₹{log.cost.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{log.description}</p>
                  <div className="text-[9.5px] text-slate-400 font-mono uppercase flex items-center justify-between">
                    <span>Supervisor Name: {log.supervisorName}</span>
                    <span>Date: {formatDateToShow(log.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width on desktop) */}
        <div className="space-y-6">
          
          {/* 5. MONTHLY MAINTENANCE COST (EXPENDITURES) */}
          <div className="bg-white border border-slate-200 p-5 rounded shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <TrendingUp className="text-emerald-600" size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Monthly Maintenance Cost
              </h3>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Month Cost</span>
                <p className="text-xl font-bold font-mono text-emerald-700 mt-1">₹{currentMonthCost.toLocaleString()}</p>
                <span className="text-[9px] text-slate-500 font-semibold font-mono">June 2026</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">vs May 2026</span>
                <span className={`text-[10px] font-bold font-mono inline-block px-1.5 py-0.5 rounded mt-1 ${
                  currentMonthCost > previousMonthCost ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {currentMonthCost > previousMonthCost ? '+' : ''}
                  {(((currentMonthCost - previousMonthCost) / Math.max(1, previousMonthCost)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Pure CSS/Tailwind bar chart for monthly logs */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Historical Expense Benchmarks (2026)</span>
              <div className="flex justify-between items-end h-32 pt-4 px-2">
                {monthlyCostsMap.map((cost, idx) => {
                  const maxCost = Math.max(...monthlyCostsMap, 1);
                  const barHeightRatio = (cost / maxCost) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 space-y-2 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-6 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition duration-150 font-mono z-10 whitespace-nowrap shadow">
                        ₹{cost.toLocaleString()}
                      </div>
                      <div className="w-6 bg-slate-100 rounded-t-sm h-24 flex items-end">
                        <div 
                          className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all rounded-t-sm" 
                          style={{ height: `${barHeightRatio}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">{monthNames[idx]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 7. SYSTEM NOTIFICATIONS CENTER */}
          <div className="bg-white border border-slate-200 p-5 rounded shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="text-blue-600" size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Recent Notifications
                </h3>
              </div>
              <button 
                onClick={handleMarkAllAsRead}
                className="text-[10px] text-slate-400 hover:text-blue-600 font-bold uppercase transition"
              >
                Mark all read
              </button>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {recentNotifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400 italic text-xs">
                  No active notifications.
                </div>
              ) : (
                recentNotifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg border text-xs relative transition ${
                      notification.isRead 
                        ? 'bg-slate-50/50 border-slate-200 text-slate-500' 
                        : 'bg-blue-50/40 border-blue-200 text-slate-900 shadow-sm font-medium'
                    }`}
                  >
                    {!notification.isRead && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`px-1 rounded text-[9px] font-extrabold uppercase ${
                        notification.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {notification.type}
                      </span>
                      <span className="font-mono text-slate-900 font-bold">{notification.truckNumber}</span>
                    </div>
                    <h4 className="font-bold text-slate-850 text-[11px] mb-0.5">{notification.title}</h4>
                    <p className="text-[10.5px] text-slate-500 leading-normal">{notification.message}</p>
                    
                    <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-200/50">
                      <span className="text-[9px] text-slate-400 font-mono">{formatDateToShow(notification.date)}</span>
                      {!notification.isRead && (
                        <button 
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-[9px] text-blue-600 font-bold uppercase hover:underline"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
