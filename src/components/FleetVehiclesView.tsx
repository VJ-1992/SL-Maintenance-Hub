import React, { useState } from 'react';
import { Vehicle, VehicleManufacturer, ServiceType, TyreStatus, ServiceLog, ServiceSchedule } from '../types';
import { generateDefaultTyres } from '../data/presets';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Wrench, 
  Disc, 
  User, 
  Users,
  Phone, 
  MapPin, 
  AlertTriangle, 
  X,
  FileCheck,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Map,
  ShieldCheck,
  Activity,
  DollarSign
} from 'lucide-react';

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

interface ServiceReasonTextProps {
  reason: string;
}

function ServiceReasonText({ reason }: ServiceReasonTextProps) {
  const [isTapped, setIsTapped] = useState(false);

  return (
    <div className="relative group/tooltip inline-block max-w-full">
      {/* Tap/Hover trigger */}
      <div 
        onClick={(e) => {
          e.stopPropagation(); // Prevent card tap / toggle behavior
          setIsTapped(!isTapped);
        }}
        className="cursor-pointer sm:cursor-default"
      >
        <span className={`text-[10px] text-slate-400 font-bold block sm:max-w-[180px] lg:max-w-[220px] transition-all duration-200 ${
          isTapped ? 'whitespace-normal break-words' : 'truncate'
        }`}>
          {reason}
        </span>
      </div>

      {/* Elegant Desktop Tooltip on hover */}
      <div className="pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute z-50 bottom-full right-0 mb-2 p-2.5 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg max-w-[240px] whitespace-normal break-words hidden sm:block">
        {reason}
        <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}

interface FleetVehiclesViewProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  serviceLogs: ServiceLog[];
  serviceSchedules: ServiceSchedule[];
  setServiceSchedules: React.Dispatch<React.SetStateAction<ServiceSchedule[]>>;
  setTab: (tab: string) => void;
  setSelectedTruckNumForTyres: (num: string) => void;
}

export default function FleetVehiclesView({ 
  vehicles, 
  setVehicles, 
  serviceLogs,
  serviceSchedules,
  setServiceSchedules,
  setTab,
  setSelectedTruckNumForTyres 
}: FleetVehiclesViewProps) {
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('All');

  // Modal State for adding/editing a truck
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Expanded card tracking for timelines
  const [expandedVehicleNum, setExpandedVehicleNum] = useState<string>('');

  // Form Fields
  const [truckNumber, setTruckNumber] = useState('');
  const [manufacturer, setManufacturer] = useState<VehicleManufacturer>(VehicleManufacturer.TATA);
  const [vehicleTemplate, setVehicleTemplate] = useState<string>('Tata (14-Wheelers)');
  const [supervisorName, setSupervisorName] = useState('Mustak');
  const [foremanName, setForemanName] = useState('Ramesh');
  const [driverName, setDriverName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Jaipur, RJ');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [fitnessExpiry, setFitnessExpiry] = useState('');
  const [permitExpiry, setPermitExpiry] = useState('');
  const [eWayBillExpiry, setEWayBillExpiry] = useState('');
  const [pucExpiry, setPucExpiry] = useState('');
  const [currentTripFrom, setCurrentTripFrom] = useState('');
  const [currentTripTo, setCurrentTripTo] = useState('');
  const [tripStartDate, setTripStartDate] = useState('');
  const [tripStatus, setTripStatus] = useState<'Planned' | 'In Transit' | 'Reached Destination' | 'Completed'>('Planned');
  const [partyName, setPartyName] = useState('');

  // Get unique supervisor names for auto-suggestion
  const supervisorSuggestions = Array.from(new Set([
    ...vehicles.map(v => v.supervisorName),
    "Mustak", "Ajru", "Irshad", "Imtiyaz", "Sachin"
  ].filter(Boolean)));

  // Get unique foreman names for auto-suggestion
  const foremanSuggestions = Array.from(new Set([
    ...vehicles.map(v => v.foremanName || ''),
    "Ramesh", "Suresh", "Karan", "Vijay"
  ].filter(Boolean)));

  // Open modal for adding a new truck
  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setTruckNumber('');
    setManufacturer(VehicleManufacturer.TATA);
    setVehicleTemplate('Tata (14-Wheelers)');
    setSupervisorName('Mustak');
    setForemanName('Ramesh');
    setDriverName('');
    setMobileNumber('');
    setCurrentLocation('Jaipur, RJ');
    setInsuranceExpiry(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]); // 30 days hence
    setFitnessExpiry(new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().split('T')[0]);  // 90 days hence
    setPermitExpiry(new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString().split('T')[0]); // 180 days hence
    setEWayBillExpiry('');
    setPucExpiry('');
    setCurrentTripFrom('');
    setCurrentTripTo('');
    setTripStartDate(new Date().toISOString().split('T')[0]);
    setTripStatus('Planned');
    setPartyName('');
    setIsModalOpen(true);
  };

  // Open modal for editing an existing truck
  const handleOpenEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setTruckNumber(v.truckNumber);
    setManufacturer(v.manufacturer);
    setVehicleTemplate(
      v.vehicleTemplate || (
        v.manufacturer === VehicleManufacturer.TATA
          ? (v.tyresCount === 14 ? "Tata (14-Wheelers)" : "Tata (12-Wheelers)")
          : (v.tyresCount === 14 ? "Ashok Leyland (14-Wheelers)" : "Ashok Leyland (12-Wheelers)")
      )
    );
    setSupervisorName(v.supervisorName);
    setForemanName(v.foremanName || '');
    setDriverName(v.driverName);
    setMobileNumber(v.mobileNumber);
    setCurrentLocation(v.currentLocation);
    setInsuranceExpiry(v.insuranceExpiry || '');
    setFitnessExpiry(v.fitnessExpiry || '');
    setPermitExpiry(v.permitExpiry || '');
    setEWayBillExpiry(v.eWayBillExpiry || '');
    setPucExpiry(v.pucExpiry || '');
    setCurrentTripFrom(v.currentTripFrom || '');
    setCurrentTripTo(v.currentTripTo || '');
    setTripStartDate(v.tripStartDate || '');
    setTripStatus(v.tripStatus || 'Planned');
    setPartyName(v.partyName || '');
    setIsModalOpen(true);
  };

  // Save changes (Add new or Update existing)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckNumber.trim()) return;

    // Determine config parameters based on selected vehicle template
    let targetManufacturer = VehicleManufacturer.TATA;
    let targetTyresCount = 14;
    let targetHasLiftAxle = true;
    let targetWheelConfig = "14-Wheelers";

    if (vehicleTemplate === "Tata (12-Wheelers)") {
      targetManufacturer = VehicleManufacturer.TATA;
      targetTyresCount = 12;
      targetHasLiftAxle = false;
      targetWheelConfig = "12-Wheelers";
    } else if (vehicleTemplate === "Ashok Leyland (14-Wheelers)") {
      targetManufacturer = VehicleManufacturer.ASHOK_LEYLAND;
      targetTyresCount = 14;
      targetHasLiftAxle = false;
      targetWheelConfig = "14-Wheelers";
    } else if (vehicleTemplate === "Ashok Leyland (12-Wheelers)") {
      targetManufacturer = VehicleManufacturer.ASHOK_LEYLAND;
      targetTyresCount = 12;
      targetHasLiftAxle = false;
      targetWheelConfig = "12-Wheelers";
    }

    if (editingVehicle) {
      // Update
      setVehicles(prev => prev.map(v => {
        if (v.truckNumber === editingVehicle.truckNumber) {
          const configChanged = v.manufacturer !== targetManufacturer || v.tyresCount !== targetTyresCount || v.hasLiftAxle !== targetHasLiftAxle;
          return {
            ...v,
            truckNumber: truckNumber.trim().toUpperCase(),
            manufacturer: targetManufacturer,
            tyresCount: targetTyresCount,
            hasLiftAxle: targetHasLiftAxle,
            vehicleTemplate,
            wheelConfiguration: targetWheelConfig,
            totalTyres: targetTyresCount,
            supervisorName,
            foremanName: foremanName || '',
            driverName,
            mobileNumber,
            currentLocation,
            lastUpdated: new Date().toISOString(),
            tyres: configChanged ? generateDefaultTyres(targetManufacturer, targetTyresCount, targetHasLiftAxle) : v.tyres,
            insuranceExpiry,
            fitnessExpiry,
            permitExpiry,
            eWayBillExpiry: eWayBillExpiry || null,
            pucExpiry: pucExpiry || null,
            currentTripFrom: currentTripFrom.trim(),
            currentTripTo: currentTripTo.trim(),
            tripStartDate,
            tripStatus,
            partyName: partyName.trim()
          };
        }
        return v;
      }));
    } else {
      // Add new
      if (vehicles.some(v => v.truckNumber.toUpperCase() === truckNumber.trim().toUpperCase())) {
        alert("This Vehicle number already exists in the SL fleet!");
        return;
      }

      const newVehicle: Vehicle = {
        truckNumber: truckNumber.trim().toUpperCase(),
        manufacturer: targetManufacturer,
        tyresCount: targetTyresCount,
        hasLiftAxle: targetHasLiftAxle,
        vehicleTemplate,
        wheelConfiguration: targetWheelConfig,
        totalTyres: targetTyresCount,
        supervisorName,
        foremanName: foremanName || 'Ramesh',
        driverName: driverName || "N/A",
        mobileNumber: mobileNumber || "N/A",
        currentLocation: currentLocation || "Jaipur, RJ",
        lastUpdated: new Date().toISOString(),
        tyres: generateDefaultTyres(targetManufacturer, targetTyresCount, targetHasLiftAxle),
        insuranceExpiry,
        fitnessExpiry,
        permitExpiry,
        eWayBillExpiry: eWayBillExpiry || null,
        pucExpiry: pucExpiry || null,
        currentTripFrom: currentTripFrom.trim(),
        currentTripTo: currentTripTo.trim(),
        tripStartDate,
        tripStatus,
        partyName: partyName.trim()
      };

      setVehicles(prev => [newVehicle, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Delete a truck
  const handleDelete = (truckNum: string) => {
    const confirmed = window.confirm(`Are you sure you want to remove truck ${truckNum} from the SL Maintenance Hub?`);
    if (confirmed) {
      setVehicles(prev => prev.filter(v => v.truckNumber !== truckNum));
    }
  };

  // Helper: Calculate alert status levels for vehicle service (Point 4)
  const calculateVehicleServiceStatus = (truckNum: string) => {
    const truckLogs = serviceLogs.filter(log => log.truckNumber === truckNum);
    const truckSchedules = serviceSchedules.filter(s => s.truckNumber === truckNum && s.status === 'Upcoming');

    const lastLog = truckLogs[0]; // Sort order is newest first usually
    const lastServiceDateStr = lastLog?.date;
    const lastServiceKm = lastLog?.odometerReading || 0;

    let nextDueDateStr = '';
    let nextDueKm = 0;
    let nextServiceType = 'General Maintenance';

    if (truckSchedules.length > 0) {
      // Find closest upcoming schedule
      const sortedSchedules = [...truckSchedules].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      const nextSched = sortedSchedules[0];
      nextDueDateStr = nextSched.dueDate || '';
      nextDueKm = nextSched.dueKm || 0;
      nextServiceType = nextSched.serviceType;
    } else if (lastLog?.nextServiceDueDate || lastLog?.nextServiceDueKm) {
      nextDueDateStr = lastLog.nextServiceDueDate || '';
      nextDueKm = lastLog.nextServiceDueKm || 0;
      nextServiceType = lastLog.type;
    }

    // Default dates & intervals if nothing is logged yet
    const today = new Date();
    const todayMs = today.getTime();

    let isOverdue = false;
    let isDueSoon = false;
    let isUpcoming = false;
    let reason = 'All services are current';

    // 1. Time check
    if (nextDueDateStr) {
      const dueDate = new Date(nextDueDateStr);
      const diffDays = Math.ceil((dueDate.getTime() - todayMs) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        isOverdue = true;
        reason = `Service Overdue by ${Math.abs(diffDays)} Days`;
      } else if (diffDays <= 15) {
        isDueSoon = true;
        reason = `Due soon in ${diffDays} Days`;
      } else if (diffDays <= 30) {
        isUpcoming = true;
        reason = `Upcoming in ${diffDays} Days`;
      }
    }

    // 2. Odometer / KM check
    if (lastLog?.odometerReading && nextDueKm) {
      const diffKm = nextDueKm - lastLog.odometerReading;
      if (diffKm < 0) {
        isOverdue = true;
        reason = `Odometer Limit Overdue by ${Math.abs(diffKm).toLocaleString()} KM`;
      } else if (diffKm <= 5000) {
        isDueSoon = true;
        reason = `Due soon at next ${diffKm.toLocaleString()} KM`;
      } else if (diffKm <= 10000) {
        isUpcoming = true;
        reason = `Upcoming at next ${diffKm.toLocaleString()} KM`;
      }
    }

    // 3. Long unserviced check (90 days limit since last logged service)
    if (lastServiceDateStr) {
      const lastDate = new Date(lastServiceDateStr);
      const daysSinceLast = Math.ceil((todayMs - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLast > 90 && !isOverdue) {
        isOverdue = true;
        reason = `No recorded maintenance for ${daysSinceLast} Days (Limit 90 Days)`;
      }
    } else {
      isOverdue = true;
      reason = 'No logged service history (Schedule Urgent General Inspection)';
    }

    let level: 'green' | 'orange' | 'red' | 'neutral' = 'neutral';
    if (isOverdue) level = 'red';
    else if (isDueSoon) level = 'orange';
    else if (isUpcoming) level = 'green';

    return {
      level,
      reason,
      lastServiceDateStr: lastServiceDateStr || 'N/A',
      lastServiceKm: lastServiceKm ? `${lastServiceKm.toLocaleString()} KM` : 'N/A',
      nextDueDateStr: nextDueDateStr || 'N/A',
      nextDueKm: nextDueKm ? `${nextDueKm.toLocaleString()} KM` : 'N/A',
      nextServiceType
    };
  };

  // Filter and search
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.foremanName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.currentLocation.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesManufacturer = 
      manufacturerFilter === 'All' || v.manufacturer === manufacturerFilter;

    return matchesSearch && matchesManufacturer;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-slate-900 bg-clip-text text-transparent dark:text-white tracking-tight">
            Fleet Vehicles Hub
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Monitor truck parameters, active tyre blueprints, insurance/fitness expiries, and live timeline logs.
          </p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold shadow-sm hover:bg-blue-500 transition"
        >
          <Plus size={18} />
          <span>Add Fleet Vehicle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search fleet by truck no., driver, location or supervisor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/50 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto py-1 select-none">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0">Manufacturer:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 flex-nowrap shrink-0 overflow-x-auto space-x-1 items-center">
            {['All', VehicleManufacturer.TATA, VehicleManufacturer.ASHOK_LEYLAND].map((manType) => (
              <button
                key={manType}
                onClick={() => setManufacturerFilter(manType)}
                className={`px-3.5 py-1.5 text-xs rounded-lg transition font-bold whitespace-nowrap inline-flex items-center justify-center shrink-0 ${
                  manufacturerFilter === manType
                    ? 'bg-white text-slate-900 shadow font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {manType}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Vehicles */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl">
          <AlertTriangle size={40} className="mx-auto text-amber-500 mb-3" />
          <p className="text-lg font-bold text-slate-800">No vehicles found</p>
          <p className="text-sm text-slate-500 mt-1">Try refining your search text or adding a new truck.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVehicles.map(vehicle => {
            const lowOrWornTyres = vehicle.tyres.filter(t => t.status !== TyreStatus.OK);
            const serviceSummary = calculateVehicleServiceStatus(vehicle.truckNumber);
            const isExpanded = expandedVehicleNum === vehicle.truckNumber;

            // Check if any regulatory documents are expired (Point 9 status indicators)
            const todayStr = new Date().toISOString().split('T')[0];
            const isInsuranceExpired = vehicle.insuranceExpiry && vehicle.insuranceExpiry < todayStr;
            const isFitnessExpired = vehicle.fitnessExpiry && vehicle.fitnessExpiry < todayStr;
            const isPermitExpired = vehicle.permitExpiry && vehicle.permitExpiry < todayStr;
            const isEWayBillExpired = vehicle.eWayBillExpiry && vehicle.eWayBillExpiry < todayStr;
            const isPucExpired = vehicle.pucExpiry && vehicle.pucExpiry < todayStr;

            return (
              <div 
                key={vehicle.truckNumber}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                {/* Card Top Branding & Health */}
                <div className="p-4 sm:p-6 border-b border-slate-150/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 w-full min-w-0">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold font-mono tracking-tight text-slate-900 truncate">
                        {vehicle.truckNumber}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs text-slate-500 font-semibold">
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 leading-none inline-flex items-center border ${
                          vehicle.manufacturer === VehicleManufacturer.TATA 
                            ? 'bg-blue-50/80 text-blue-700 border-blue-200/50' 
                            : 'bg-amber-50/80 text-amber-700 border-amber-200/50'
                        }`}>
                          {vehicle.manufacturer}
                        </span>
                        <span className="text-slate-300 select-none">|</span>
                        <span className="whitespace-nowrap shrink-0 font-medium text-slate-600 text-xs">
                          {vehicle.tyresCount} Tyres
                        </span>
                        {vehicle.hasLiftAxle === true && (
                          <>
                            <span className="text-slate-300 select-none">|</span>
                            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200/50 font-bold px-2 py-1 rounded-md whitespace-nowrap shrink-0 uppercase tracking-widest leading-none inline-flex items-center">
                              Lift Axle
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Alerts Status Badge & Service Status Reason Container */}
                    <div className="flex flex-row items-center sm:flex-col sm:items-end gap-2 sm:gap-1 shrink-0 mt-2 sm:mt-0 w-full sm:w-auto">
                      {serviceSummary.level === 'red' && (
                        <span className="bg-red-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 animate-pulse whitespace-nowrap shrink-0">
                          <AlertTriangle size={10} />
                          Overdue
                        </span>
                      )}
                      {serviceSummary.level === 'orange' && (
                        <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 whitespace-nowrap shrink-0">
                          <Clock size={10} />
                          Due Soon
                        </span>
                      )}
                      {serviceSummary.level === 'green' && (
                        <span className="bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 whitespace-nowrap shrink-0">
                          <FileCheck size={10} />
                          Upcoming
                        </span>
                      )}
                      {serviceSummary.level === 'neutral' && (
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap shrink-0">
                          Current
                        </span>
                      )}
                      
                      <ServiceReasonText reason={serviceSummary.reason} />
                    </div>
                  </div>

                  {/* Driver & Mobile row */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <User size={14} className="text-slate-400" />
                      <div className="overflow-hidden">
                        <p className="text-slate-400 uppercase font-bold text-[9px] tracking-wider leading-none">Driver</p>
                        <p className="font-bold text-slate-800 truncate mt-0.5">{vehicle.driverName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <Phone size={14} className="text-slate-400" />
                      <div className="overflow-hidden">
                        <p className="text-slate-400 uppercase font-bold text-[9px] tracking-wider leading-none">Mobile</p>
                        <p className="font-semibold text-slate-700 truncate mt-0.5">{vehicle.mobileNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Supervisor Name & Foreman Name */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <Wrench size={14} className="text-slate-400" />
                      <div className="overflow-hidden">
                        <p className="text-slate-400 uppercase font-bold text-[9px] tracking-wider leading-none">Supervisor</p>
                        <p className="font-bold text-slate-800 truncate mt-0.5">{vehicle.supervisorName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <Users size={14} className="text-slate-400" />
                      <div className="overflow-hidden">
                        <p className="text-slate-400 uppercase font-bold text-[9px] tracking-wider leading-none">Foreman</p>
                        <p className="font-bold text-slate-800 truncate mt-0.5">{vehicle.foremanName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Current location */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <MapPin size={14} className="text-slate-400" />
                      <div className="overflow-hidden">
                        <p className="text-slate-400 uppercase font-bold text-[9px] tracking-wider leading-none">Last Location</p>
                        <p className="font-semibold text-slate-700 truncate mt-0.5">{vehicle.currentLocation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Regulatory Expiries (Insurance, Fitness, Permit, E-Way Bill, PUC) */}
                  <div className="bg-slate-50 p-1.5 sm:p-2.5 rounded-xl border border-slate-100 grid grid-cols-5 gap-1 text-center">
                    <div>
                      <p className="text-[7px] sm:text-[8px] text-slate-450 font-bold uppercase tracking-wider truncate">Insurance</p>
                      <p className={`text-[9px] sm:text-[11px] font-bold font-mono mt-0.5 ${isInsuranceExpired ? 'text-red-600' : 'text-slate-700'}`}>
                        {vehicle.insuranceExpiry || '--'}
                      </p>
                      {isInsuranceExpired && <span className="text-[7px] sm:text-[8px] bg-red-100 text-red-700 px-1 rounded uppercase font-bold block mt-0.5">Expired</span>}
                    </div>
                    <div>
                      <p className="text-[7px] sm:text-[8px] text-slate-450 font-bold uppercase tracking-wider truncate">Fitness</p>
                      <p className={`text-[9px] sm:text-[11px] font-bold font-mono mt-0.5 ${isFitnessExpired ? 'text-red-600' : 'text-slate-700'}`}>
                        {vehicle.fitnessExpiry || '--'}
                      </p>
                      {isFitnessExpired && <span className="text-[7px] sm:text-[8px] bg-red-100 text-red-700 px-1 rounded uppercase font-bold block mt-0.5">Expired</span>}
                    </div>
                    <div>
                      <p className="text-[7px] sm:text-[8px] text-slate-450 font-bold uppercase tracking-wider truncate">Permit</p>
                      <p className={`text-[9px] sm:text-[11px] font-bold font-mono mt-0.5 ${isPermitExpired ? 'text-red-600' : 'text-slate-700'}`}>
                        {vehicle.permitExpiry || '--'}
                      </p>
                      {isPermitExpired && <span className="text-[7px] sm:text-[8px] bg-red-100 text-red-700 px-1 rounded uppercase font-bold block mt-0.5">Expired</span>}
                    </div>
                    <div>
                      <p className="text-[7px] sm:text-[8px] text-slate-450 font-bold uppercase tracking-wider truncate">E-Way Bill</p>
                      <p className={`text-[9px] sm:text-[11px] font-bold font-mono mt-0.5 ${isEWayBillExpired ? 'text-red-600' : 'text-slate-700'}`}>
                        {vehicle.eWayBillExpiry || '--'}
                      </p>
                      {isEWayBillExpired && <span className="text-[7px] sm:text-[8px] bg-red-100 text-red-700 px-1 rounded uppercase font-bold block mt-0.5">Expired</span>}
                    </div>
                    <div>
                      <p className="text-[7px] sm:text-[8px] text-slate-450 font-bold uppercase tracking-wider truncate">PUC</p>
                      <p className={`text-[9px] sm:text-[11px] font-bold font-mono mt-0.5 ${isPucExpired ? 'text-red-600' : 'text-slate-700'}`}>
                        {vehicle.pucExpiry || '--'}
                      </p>
                      {isPucExpired && <span className="text-[7px] sm:text-[8px] bg-red-100 text-red-700 px-1 rounded uppercase font-bold block mt-0.5">Expired</span>}
                    </div>
                  </div>

                  {/* Current Trip Summary for Fleet Vehicle Card */}
                  {vehicle.currentTripFrom && vehicle.currentTripTo && (
                    <div className="bg-blue-50/40 p-3 rounded-xl border border-blue-100/50 space-y-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-blue-800 font-extrabold uppercase tracking-wider flex items-center gap-1">
                          <Map size={12} className="text-blue-600" />
                          Current Trip
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          vehicle.tripStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          vehicle.tripStatus === 'Reached Destination' ? 'bg-purple-100 text-purple-800' :
                          vehicle.tripStatus === 'In Transit' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {vehicle.tripStatus || 'Planned'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Current Route</p>
                          <p className="font-extrabold text-slate-800 text-xs">
                            {vehicle.currentTripFrom} → {vehicle.currentTripTo}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Trip Started</p>
                          <p className="font-bold text-slate-700 font-mono text-xs">
                            {formatDateToShow(vehicle.tripStartDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapsible Service Center Timeline View (Point 3 / 6) */}
                {isExpanded && (
                  <div className="bg-slate-50/50 p-6 border-b border-slate-100 space-y-6">
                    
                    {/* Point 6: Next Service Summary Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-3">
                      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                        <Activity className="text-blue-600" size={15} />
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Next Service Summary Card
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Last Service Date</p>
                          <p className="font-bold text-slate-700 font-mono">{serviceSummary.lastServiceDateStr}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Last Service KM</p>
                          <p className="font-bold text-slate-700 font-mono">{serviceSummary.lastServiceKm}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Next Due Date</p>
                          <p className="font-extrabold text-blue-600 font-mono">{serviceSummary.nextDueDateStr}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Next Due KM Limit</p>
                          <p className="font-extrabold text-blue-600 font-mono">{serviceSummary.nextDueKm}</p>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[8px] text-slate-450 font-bold uppercase">Target Service Requirement</p>
                          <p className="font-bold text-slate-800 text-[11px] mt-0.5">{serviceSummary.nextServiceType}</p>
                        </div>
                      </div>
                    </div>

                    {/* Current Trip Details Section inside Expanded Profile */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center space-x-2">
                          <Map className="text-blue-600" size={16} />
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                            Current Trip Details
                          </h4>
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          vehicle.tripStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          vehicle.tripStatus === 'Reached Destination' ? 'bg-purple-100 text-purple-800' :
                          vehicle.tripStatus === 'In Transit' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {vehicle.tripStatus || 'Planned'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trip From</p>
                          <p className="font-extrabold text-slate-800 text-sm mt-0.5">{vehicle.currentTripFrom || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trip To</p>
                          <p className="font-extrabold text-slate-800 text-sm mt-0.5">{vehicle.currentTripTo || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trip Start Date</p>
                          <p className="font-bold text-slate-700 font-mono text-sm mt-0.5">{formatDateToShow(vehicle.tripStartDate)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Driver Name</p>
                          <p className="font-extrabold text-slate-800 text-sm mt-0.5">{vehicle.driverName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Party Name</p>
                          <p className="font-bold text-slate-700 text-sm mt-0.5">{vehicle.partyName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trip Status</p>
                          <p className="font-semibold text-slate-600 text-sm mt-0.5">{vehicle.tripStatus || 'Planned'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Point 3: Service Timeline View */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Activity size={13} className="text-emerald-500" />
                        Vehicle Lifecycle Service Timeline
                      </h4>

                      <div className="relative pl-5 border-l-2 border-slate-200 space-y-4">
                        
                        {/* Upcoming Events */}
                        {serviceSchedules
                          .filter(s => s.truckNumber === vehicle.truckNumber && s.status === 'Upcoming')
                          .map(sched => (
                            <div key={sched.id} className="relative">
                              <span className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-4 ring-blue-100 flex items-center justify-center animate-pulse"></span>
                              <div className="text-xs">
                                <span className="font-bold text-blue-600">Upcoming Schedule: {sched.serviceType}</span>
                                <div className="flex flex-wrap gap-2 text-[10px] text-slate-450 font-bold uppercase mt-1">
                                  {sched.dueDate && <span>Date: {sched.dueDate}</span>}
                                  {sched.dueKm && <span>Odo: {sched.dueKm.toLocaleString()} KM</span>}
                                  {sched.workshop && <span className="text-slate-600 font-sans font-medium lowercase">at {sched.workshop}</span>}
                                </div>
                              </div>
                            </div>
                        ))}

                        {/* Completed Events */}
                        {serviceLogs
                          .filter(log => log.truckNumber === vehicle.truckNumber)
                          .map(log => (
                            <div key={log.id} className="relative">
                              <span className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100 flex items-center justify-center"></span>
                              <div className="text-xs">
                                <div className="flex justify-between items-start">
                                  <span className="font-bold text-slate-700">{log.type} Completed</span>
                                  <span className="text-[10px] text-slate-400 font-mono font-semibold">{log.date}</span>
                                </div>
                                <p className="text-[11px] text-slate-550 italic mt-0.5">{log.description}</p>
                                <div className="flex flex-wrap gap-2 text-[9px] text-slate-400 font-bold uppercase mt-1">
                                  <span>Cost: ₹{log.cost.toLocaleString()}</span>
                                  {log.odometerReading && <span>Odo: {log.odometerReading.toLocaleString()} KM</span>}
                                  {log.workshop && <span className="lowercase font-sans font-medium text-slate-500">at {log.workshop}</span>}
                                </div>
                              </div>
                            </div>
                        ))}

                        {/* Empty timeline state */}
                        {serviceSchedules.filter(s => s.truckNumber === vehicle.truckNumber && s.status === 'Upcoming').length === 0 &&
                         serviceLogs.filter(log => log.truckNumber === vehicle.truckNumber).length === 0 && (
                          <p className="text-xs text-slate-400 italic">No historical or upcoming service events tracked.</p>
                        )}

                      </div>
                    </div>

                  </div>
                )}

                {/* Operations Actions Footer */}
                <div className="bg-slate-50 p-4 px-6 border-t border-slate-100">
                  {/* Option 1: Very Small Screens (< 480px) */}
                  <div className="flex min-[480px]:hidden items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(vehicle)}
                      className="h-10 w-10 flex items-center justify-center bg-white text-slate-600 border border-slate-200 rounded-xl hover:text-slate-950 hover:bg-slate-50 transition shadow-sm"
                      title="Edit Fleet Profile"
                    >
                      <span className="text-base">✏️</span>
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.truckNumber)}
                      className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-red-50 transition shadow-sm text-red-500"
                      title="Delete truck"
                    >
                      <span className="text-base">🗑️</span>
                    </button>
                    <button
                      onClick={() => setExpandedVehicleNum(isExpanded ? '' : vehicle.truckNumber)}
                      className={`h-10 w-10 flex items-center justify-center border rounded-xl transition shadow-sm ${
                        isExpanded ? 'text-blue-600 border-blue-100 bg-blue-50/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                      title="Toggle Timeline"
                    >
                      <span className="text-base">📅</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTruckNumForTyres(vehicle.truckNumber);
                        setTab('tyres');
                      }}
                      className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-sm transition"
                      title={`Tyre Map (${vehicle.truckNumber} • ${vehicle.manufacturer} • ${vehicle.tyresCount}-Wheeler)`}
                    >
                      <span className="text-lg">🛞</span>
                    </button>
                  </div>

                  {/* Option 2: Medium/Mobile Screens (>= 480px and < 768px) */}
                  <div className="hidden min-[480px]:flex md:hidden flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(vehicle)}
                        className="h-10 w-10 flex items-center justify-center bg-white text-slate-600 border border-slate-200 rounded-xl hover:text-slate-950 hover:bg-slate-50 transition shadow-sm"
                        title="Edit Fleet Profile"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.truckNumber)}
                        className="h-10 w-10 flex items-center justify-center bg-white text-red-500 border border-slate-200 rounded-xl hover:text-red-700 hover:bg-red-50 transition shadow-sm"
                        title="Delete truck"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => setExpandedVehicleNum(isExpanded ? '' : vehicle.truckNumber)}
                        className={`h-10 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 bg-white border border-slate-200 rounded-xl transition shadow-sm ${
                          isExpanded ? 'text-blue-600 border-blue-100 bg-blue-50/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span>Timeline</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTruckNumForTyres(vehicle.truckNumber);
                        setTab('tyres');
                      }}
                      className="h-10 w-full max-w-[280px] flex items-center justify-center gap-2 text-xs bg-slate-900 text-white hover:bg-slate-800 font-bold px-4 rounded-xl shadow-sm transition"
                      title={`Tyre Map for ${vehicle.truckNumber}`}
                    >
                      <span className="text-base">🛞</span>
                      <span>Tyre Map</span>
                    </button>
                  </div>

                  {/* Option 3: Desktop Screens (>= 768px) */}
                  <div className="hidden md:flex justify-between items-center w-full gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(vehicle)}
                        className="h-10 w-10 flex items-center justify-center bg-white text-slate-600 border border-slate-200 rounded-xl hover:text-slate-950 hover:bg-slate-50 transition shadow-sm"
                        title="Edit Fleet Profile"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.truckNumber)}
                        className="h-10 w-10 flex items-center justify-center bg-white text-red-500 border border-slate-200 rounded-xl hover:text-red-700 hover:bg-red-50 transition shadow-sm"
                        title="Delete truck"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => setExpandedVehicleNum(isExpanded ? '' : vehicle.truckNumber)}
                        className={`h-10 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 bg-white border border-slate-200 rounded-xl transition shadow-sm ${
                          isExpanded ? 'text-blue-600 border-blue-100 bg-blue-50/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span>Timeline</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTruckNumForTyres(vehicle.truckNumber);
                        setTab('tyres');
                      }}
                      className="h-10 flex items-center gap-2 text-xs bg-slate-900 text-white hover:bg-slate-800 font-bold px-4 rounded-xl shadow-sm transition"
                      title={`Open Tyre Map Workbench for ${vehicle.truckNumber}`}
                    >
                      <span className="text-sm">🛞</span>
                      <span>Tyre Map</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ADD / EDIT FLOATING MODAL DIALOG --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingVehicle ? "Edit Fleet Vehicle Profile" : "Register New Fleet Vehicle"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Truck Number */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Truck Number / Plate ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RJ14GR0952"
                  value={truckNumber}
                  onChange={(e) => setTruckNumber(e.target.value)}
                  disabled={editingVehicle !== null}
                  className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-sm uppercase disabled:opacity-50 font-mono font-bold"
                />
              </div>

              {/* Manufacturer Custom Template selector */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Vehicle Manufacturer Template (Tyre Setup)
                </label>
                <select
                  value={vehicleTemplate}
                  onChange={(e) => setVehicleTemplate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2.5 rounded-xl text-sm font-bold"
                >
                  <option value="Tata (14-Wheelers)">Tata (14-Wheelers)</option>
                  <option value="Tata (12-Wheelers)">Tata (12-Wheelers)</option>
                  <option value="Ashok Leyland (14-Wheelers)">Ashok Leyland (14-Wheelers)</option>
                  <option value="Ashok Leyland (12-Wheelers)">Ashok Leyland (12-Wheelers)</option>
                </select>
              </div>

              {/* Driver & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Driver Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rakesh Yadav"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Driver Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98290 12345"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              {/* Supervisor Name & Foreman Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    list="fleet-supervisors-list"
                    className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <datalist id="fleet-supervisors-list">
                    {supervisorSuggestions.map(opt => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Foreman Name
                  </label>
                  <input
                    type="text"
                    required
                    value={foremanName}
                    onChange={(e) => setForemanName(e.target.value)}
                    placeholder="Enter Foreman Name"
                    list="fleet-foremen-list"
                    className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <datalist id="fleet-foremen-list">
                    {foremanSuggestions.map(opt => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Current Location / Station */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Current Location / Station
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jaipur, RJ"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-sm"
                />
              </div>

              {/* Point 9 Regulatory Expiry Dates */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/40 space-y-3">
                <p className="text-xs font-bold text-slate-750 uppercase tracking-wide border-b border-slate-200 pb-1">
                  Point 9: RTO Regulatory Compliance Renewals
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Insurance Expiry
                    </label>
                    <input
                      type="date"
                      required
                      value={insuranceExpiry}
                      onChange={(e) => setInsuranceExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Fitness Expiry
                    </label>
                    <input
                      type="date"
                      required
                      value={fitnessExpiry}
                      onChange={(e) => setFitnessExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Permit Expiry
                    </label>
                    <input
                      type="date"
                      required
                      value={permitExpiry}
                      onChange={(e) => setPermitExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      E-Way Bill Expiry
                    </label>
                    <input
                      type="date"
                      value={eWayBillExpiry}
                      onChange={(e) => setEWayBillExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      PUC Expiry
                    </label>
                    <input
                      type="date"
                      value={pucExpiry}
                      onChange={(e) => setPucExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Current Trip Details Section */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-150/50 space-y-3">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wide border-b border-blue-200 pb-1 flex items-center gap-1.5">
                  <Map size={14} className="text-blue-600" />
                  Current Trip Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Trip From
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Panipat"
                      value={currentTripFrom}
                      onChange={(e) => setCurrentTripFrom(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Trip To
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai"
                      value={currentTripTo}
                      onChange={(e) => setCurrentTripTo(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Trip Start Date
                    </label>
                    <input
                      type="date"
                      value={tripStartDate}
                      onChange={(e) => setTripStartDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Trip Status
                    </label>
                    <select
                      value={tripStatus}
                      onChange={(e) => setTripStatus(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      <option value="Planned">Planned</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Reached Destination">Reached Destination</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Party Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Balaji Logistics"
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
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
                  {editingVehicle ? "Save Changes" : "Register and Generate Tyres"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
