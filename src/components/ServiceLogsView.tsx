import React, { useState } from 'react';
import { ServiceLog, Vehicle, ServiceType, ServiceSchedule, CentralNotification } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Wrench, 
  Calendar, 
  DollarSign, 
  Truck, 
  User, 
  X,
  FileText,
  MapPin,
  ClipboardList
} from 'lucide-react';

interface ServiceLogsViewProps {
  serviceLogs: ServiceLog[];
  setServiceLogs: React.Dispatch<React.SetStateAction<ServiceLog[]>>;
  vehicles: Vehicle[];
  serviceSchedules: ServiceSchedule[];
  setServiceSchedules: React.Dispatch<React.SetStateAction<ServiceSchedule[]>>;
  notifications: CentralNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<CentralNotification[]>>;
}

export default function ServiceLogsView({ 
  serviceLogs, 
  setServiceLogs, 
  vehicles,
  serviceSchedules,
  setServiceSchedules,
  notifications,
  setNotifications
}: ServiceLogsViewProps) {
  
  // Search parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [truckNumber, setTruckNumber] = useState(vehicles[0]?.truckNumber || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<ServiceType>(ServiceType.GENERAL);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState<number>(8500);
  const [odometerReading, setOdometerReading] = useState<number>(450000);
  const [supervisorName, setSupervisorName] = useState('Mustak');
  const [workshop, setWorkshop] = useState('Jaipur Central Workshop');
  const [remarks, setRemarks] = useState('');
  const [setNextServiceTrigger, setSetNextServiceTrigger] = useState(true);
  const [nextServiceDays, setNextServiceDays] = useState('30');
  const [nextServiceKmAdd, setNextServiceKmAdd] = useState('10000');

  // Get unique supervisor names for auto-suggestion
  const supervisorSuggestions = Array.from(new Set([
    ...serviceLogs.map(log => log.supervisorName),
    ...vehicles.map(v => v.supervisorName),
    "Mustak", "Ajru", "Irshad", "Imtiyaz", "Sachin"
  ].filter(Boolean)));

  // Open modal
  const handleOpenAddModal = () => {
    setTruckNumber(vehicles[0]?.truckNumber || '');
    setDate(new Date().toISOString().split('T')[0]);
    setType(ServiceType.ENGINE_OIL);
    setDescription('');
    setCost(8500);
    setOdometerReading(vehicles[0] ? 450000 : 100000);
    setSupervisorName('Mustak');
    setWorkshop('Jaipur Central Workshop');
    setRemarks('');
    setSetNextServiceTrigger(true);
    setNextServiceDays('30');
    setNextServiceKmAdd('10000');
    setIsModalOpen(true);
  };

  // Save new manually logged maintenance service
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckNumber) return;

    let nextServiceDueDate: string | undefined = undefined;
    let nextServiceDueKm: number | undefined = undefined;

    if (setNextServiceTrigger) {
      // Calculate next due date
      const days = parseInt(nextServiceDays) || 30;
      const baseDate = new Date(date);
      baseDate.setDate(baseDate.getDate() + days);
      nextServiceDueDate = baseDate.toISOString().split('T')[0];

      // Calculate next due KM
      const kmAdd = parseInt(nextServiceKmAdd) || 10000;
      nextServiceDueKm = odometerReading + kmAdd;
    }

    const logId = `LOG_${Date.now()}`;
    const newLog: ServiceLog = {
      id: logId,
      truckNumber,
      date,
      type,
      description,
      cost,
      odometerReading,
      supervisorName,
      workshop,
      remarks,
      nextServiceDueDate,
      nextServiceDueKm,
      
      // Phase 2 compatibility keys
      vehicleNo: truckNumber,
      serviceDate: date,
      odometer: odometerReading,
      serviceType: type,
      serviceCost: cost,
      nextServiceDate: nextServiceDueDate,
      nextServiceKM: nextServiceDueKm
    };

    setServiceLogs(prev => [newLog, ...prev]);

    // Update schedules: Mark any active schedules for this vehicle & type as Completed
    setServiceSchedules(prev => {
      const updated = prev.map(sched => {
        if (sched.truckNumber === truckNumber && sched.serviceType === type && sched.status === 'Upcoming') {
          return { ...sched, status: 'Completed' as const };
        }
        return sched;
      });

      if (setNextServiceTrigger) {
        const newSched: ServiceSchedule = {
          id: `SCH_${Date.now()}`,
          truckNumber,
          serviceType: type,
          dueDate: nextServiceDueDate,
          dueKm: nextServiceDueKm,
          status: 'Upcoming',
          createdDate: date,
          workshop
        };
        return [newSched, ...updated];
      }
      return updated;
    });

    // Create notifications for this scheduled maintenance service (Point 4)
    if (setNextServiceTrigger) {
      const newNotif: CentralNotification = {
        id: `NOT_${Date.now()}`,
        truckNumber,
        type: 'Service Due',
        title: `${type} Due for ${truckNumber}`,
        message: `${type} is scheduled for ${nextServiceDueDate} or at ${nextServiceDueKm?.toLocaleString()} KM. Workshop: ${workshop}.`,
        date,
        isRead: false,
        severity: 'medium'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Remove a log
  const handleDeleteLog = (id: string, cost: number) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete this log entry of ₹${cost.toLocaleString()}?`);
    if (isConfirmed) {
      setServiceLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  // Filters computed list
  const filteredLogs = serviceLogs.filter(log => {
    const matchesSearch = 
      log.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.workshop && log.workshop.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesType = 
      serviceTypeFilter === 'All' || log.type === serviceTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Visual top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-slate-900 bg-clip-text text-transparent dark:text-white tracking-tight">
            Preventive Maintenance & Service Logs
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Register and manage fleet maintenance cycles, calculate next dues automatically, and audit costs.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold shadow-sm hover:bg-blue-500 transition"
        >
          <Plus size={18} />
          <span>Manual Service Entry</span>
        </button>
      </div>

      {/* Direct Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search logs by truck no., description, supervisor name, workshop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/50 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Service:</span>
          <select
            value={serviceTypeFilter}
            onChange={(e) => setServiceTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 p-2 text-xs rounded-xl font-medium focus:outline-none"
          >
            <option value="All">All Services</option>
            {Object.values(ServiceType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid displaying the list of maintenance activities complete */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl">
          <FileText size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-lg font-bold text-slate-800">No matching logs registered</p>
          <p className="text-sm text-slate-500 mt-1">Refine your search tags or add a new manual entry.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase bg-slate-50/50">
                <th className="p-4 px-6">Truck Number</th>
                <th className="p-4">Date</th>
                <th className="p-4">Service Type</th>
                <th className="p-4">Job details</th>
                <th className="p-4">Odometer</th>
                <th className="p-4 text-right">Cost</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.map(log => {
                const associatedTruck = vehicles.find(v => v.truckNumber === log.truckNumber);
                return (
                  <tr key={log.id} className="hover:bg-slate-50/30">
                    {/* Truck No */}
                    <td className="p-4 px-6 font-bold font-mono text-slate-900">
                      <div>
                        {log.truckNumber}
                        <span className="text-[10px] font-sans font-medium text-slate-400 block mt-0.5">
                          {associatedTruck?.manufacturer || "Tata"} • {log.supervisorName}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-500 font-medium whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Calendar size={13} className="text-slate-400" />
                        {log.date}
                      </span>
                    </td>

                    {/* Service Category */}
                    <td className="p-4 whitespace-nowrap font-bold text-blue-600 text-xs">
                      {log.type}
                    </td>

                    {/* Description */}
                    <td className="p-4 text-slate-600 max-w-xs text-xs font-medium">
                      <p className="font-semibold text-slate-800">{log.description}</p>
                      {log.remarks && (
                        <p className="text-[10px] text-slate-550 mt-1 italic">
                          <strong>Remarks:</strong> {log.remarks}
                        </p>
                      )}
                      
                      {/* Workshop & Next Due badges */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {log.workshop && (
                          <span className="inline-flex items-center gap-0.5 font-bold text-[9px] uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            <MapPin size={9} />
                            {log.workshop}
                          </span>
                        )}
                        {log.nextServiceDueDate && (
                          <span className="inline-flex items-center gap-0.5 font-bold text-[9px] uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">
                            <Calendar size={9} />
                            Due: {log.nextServiceDueDate}
                          </span>
                        )}
                        {log.nextServiceDueKm && (
                          <span className="inline-flex items-center gap-0.5 font-bold text-[9px] uppercase px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded font-mono">
                            <Truck size={9} />
                            Due: {log.nextServiceDueKm.toLocaleString()} KM
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Odometer */}
                    <td className="p-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                      {log.odometerReading ? `${log.odometerReading.toLocaleString()} km` : "N/A"}
                    </td>

                    {/* Cost */}
                    <td className="p-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      ₹{log.cost.toLocaleString("en-IN")}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <button 
                        onClick={() => handleDeleteLog(log.id, log.cost)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                        title="Delete log"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- POPUP ADD MANUAL ENTRY LOG MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-lg text-slate-900">
                Register Manual Service Entry
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl transition text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Select Truck */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Fleet Vehicle No.
                </label>
                <select
                  required
                  value={truckNumber}
                  onChange={(e) => {
                    const num = e.target.value;
                    setTruckNumber(num);
                    // Match current odometer reading
                    const lastLog = serviceLogs.find(l => l.truckNumber === num);
                    if (lastLog && lastLog.odometerReading) {
                      setOdometerReading(lastLog.odometerReading + 10000);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2.5 rounded-xl text-sm font-mono font-bold focus:outline-none"
                >
                  <option value="" disabled>Choose active truck...</option>
                  {vehicles.map(v => (
                    <option key={v.truckNumber} value={v.truckNumber}>
                      {v.truckNumber} ({v.manufacturer})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service logs date / Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Service Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Service Cost (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Service Type / Odometer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Service Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ServiceType)}
                    className="w-full bg-slate-50 border border-slate-200/50 px-2 py-2.5 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    {Object.values(ServiceType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    value={odometerReading}
                    onChange={(e) => setOdometerReading(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Workshop and Remarks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Service Workshop
                  </label>
                  <input
                    type="text"
                    required
                    value={workshop}
                    onChange={(e) => setWorkshop(e.target.value)}
                    placeholder="e.g. Jaipur Main Workshop"
                    className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Supervisor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    placeholder="Enter Supervisor Name"
                    list="supervisors-list"
                    className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <datalist id="supervisors-list">
                    {supervisorSuggestions.map(opt => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Job description note */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Job Description / Details
                </label>
                <textarea
                  required
                  placeholder="Describe parts replaced, tyre alignment metrics, balancing logs etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Audit Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Audit Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Oil filter and drain plug gasket replaced"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Next Due Configurator (Point 1) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/40 space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="setNextServiceTrigger"
                    checked={setNextServiceTrigger}
                    onChange={(e) => setSetNextServiceTrigger(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-550 h-4 w-4"
                  />
                  <label htmlFor="setNextServiceTrigger" className="text-xs font-bold text-slate-700">
                    Schedule Next Service Due (Preventive Alert)
                  </label>
                </div>

                {setNextServiceTrigger && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Due Interval Days
                      </label>
                      <select
                        value={nextServiceDays}
                        onChange={(e) => setNextServiceDays(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs"
                      >
                        <option value="15">15 Days</option>
                        <option value="30">30 Days</option>
                        <option value="45">45 Days</option>
                        <option value="60">60 Days</option>
                        <option value="90">90 Days</option>
                        <option value="180">180 Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Due Interval KM
                      </label>
                      <select
                        value={nextServiceKmAdd}
                        onChange={(e) => setNextServiceKmAdd(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs"
                      >
                        <option value="5000">+5,000 KM</option>
                        <option value="10000">+10,000 KM</option>
                        <option value="15000">+15,000 KM</option>
                        <option value="20000">+20,000 KM</option>
                      </select>
                    </div>

                    {/* Calculated live summary */}
                    <div className="col-span-2 text-[10px] bg-blue-50 text-blue-850 p-2.5 rounded-lg font-medium border border-blue-100">
                      <div className="flex justify-between">
                        <span>Next Date: <strong>{(() => {
                          const days = parseInt(nextServiceDays) || 30;
                          const baseDate = new Date(date);
                          baseDate.setDate(baseDate.getDate() + days);
                          return baseDate.toISOString().split('T')[0];
                        })()}</strong></span>
                        <span>Next KM: <strong>{(odometerReading + (parseInt(nextServiceKmAdd) || 10000)).toLocaleString()} KM</strong></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit panel actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded text-xs shadow hover:bg-blue-500 active:scale-95 transition"
                >
                  Save Service Entry
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
