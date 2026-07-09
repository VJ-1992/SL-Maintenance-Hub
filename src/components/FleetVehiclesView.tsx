import React, { useState, useMemo } from 'react';
import { Vehicle, VehicleManufacturer, ServiceType, TyreStatus, ServiceLog, ServiceSchedule, TripHistoryRecord, AssignmentHistoryRecord } from '../types';
import { generateDefaultTyres } from '../data/presets';
import { autoSyncTripFromVehicleChange, fetchAllTrips } from '../services/trips';
import TripHistoryView from './TripHistoryView';
import AssignmentHistoryModal from './AssignmentHistoryModal';
import { writeDocument } from '../services/firebase';
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
  DollarSign,
  FileText,
  Download,
  Printer,
  Filter,
  ArrowUpDown,
  Check,
  RotateCcw
} from 'lucide-react';

const formatDateToShow = (dateStr?: string) => {
  if (!dateStr || dateStr.trim() === '' || dateStr.trim() === '--' || dateStr.trim().toUpperCase() === 'N/A') {
    return 'Not Added';
  }
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

const formatNameValue = (val?: string) => {
  if (!val || val.trim() === '' || val.trim().toUpperCase() === 'N/A' || val.trim() === '--') {
    return 'Not Assigned';
  }
  return val;
};

const formatLocationValue = (val?: string) => {
  if (!val || val.trim() === '' || val.trim().toUpperCase() === 'N/A') {
    return '--';
  }
  return val;
};

interface ServiceReasonTextProps {
  reason: string;
  level: string;
}

function ServiceReasonText({ reason, level }: ServiceReasonTextProps) {
  const [isTapped, setIsTapped] = useState(false);

  const isRed = level === 'red';
  const textColor = isRed ? 'text-red-600 font-extrabold' : 'text-slate-400 font-bold';

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
        <span className={`text-[10px] block sm:max-w-[180px] lg:max-w-[220px] transition-all duration-200 ${textColor} ${
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

interface LocationTextProps {
  location: string;
}

function LocationText({ location }: LocationTextProps) {
  const [isTapped, setIsTapped] = useState(false);
  const formattedLoc = formatLocationValue(location);

  return (
    <div className="relative group/loc-tooltip inline-block max-w-full">
      {/* Tap/Hover trigger */}
      <div 
        onClick={(e) => {
          e.stopPropagation(); // Prevent card tap / toggle behavior
          setIsTapped(!isTapped);
        }}
        className="cursor-pointer sm:cursor-default"
      >
        <p className={`text-sm font-semibold text-slate-800 mt-1 transition-all duration-200 ${
          isTapped ? 'whitespace-normal break-words' : 'truncate max-w-[280px] lg:max-w-[340px]'
        }`}>
          {formattedLoc}
        </p>
      </div>

      {/* Elegant Desktop Tooltip on hover */}
      <div className="pointer-events-none opacity-0 group-hover/loc-tooltip:opacity-100 transition-all duration-200 absolute z-50 bottom-full left-0 mb-2 p-2.5 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-lg max-w-[260px] whitespace-normal break-words hidden sm:block">
        {formattedLoc}
        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}

interface ComplianceDocCardProps {
  name: string;
  expiryDate?: string;
  lastUpdated?: string;
}

function ComplianceDocCard({ name, expiryDate, lastUpdated }: ComplianceDocCardProps) {
  const [isTapped, setIsTapped] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [tooltipState, setTooltipState] = React.useState<{
    show: boolean;
    left: number;
    arrowLeft: number;
    position: 'top' | 'bottom';
  }>({
    show: false,
    left: -36,
    arrowLeft: 96,
    position: 'top'
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let statusLabel = 'Not Added';
  let badgeBg = 'bg-slate-50 text-slate-400 border-slate-200';
  let cardBorder = 'border-slate-250 bg-white';
  let diffDays: number | undefined = undefined;
  let isNoDate = true;

  if (expiryDate && expiryDate.trim() !== '') {
    isNoDate = false;
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      statusLabel = 'Expired';
      badgeBg = 'bg-red-50 text-red-600 border-red-200';
      cardBorder = 'border-red-200 bg-red-50/40';
    } else if (diffDays === 0) {
      statusLabel = 'Expires Today';
      badgeBg = 'bg-red-50 text-red-600 border-red-200 animate-pulse';
      cardBorder = 'border-red-200 bg-red-50/40';
    } else if (diffDays === 1) {
      statusLabel = '1 Day Left';
      badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
      cardBorder = 'border-amber-200 bg-amber-50/40';
    } else if (diffDays <= 30) {
      statusLabel = `${diffDays} Days Left`;
      badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
      cardBorder = 'border-amber-200 bg-amber-50/40';
    } else {
      statusLabel = 'Valid';
      badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      cardBorder = 'border-emerald-200 bg-emerald-50/40';
    }
  }

  const formattedExpiry = expiryDate && expiryDate.trim() !== '' ? formatDateToShow(expiryDate) : 'Not Added';
  const displayDays = isNoDate 
    ? 'No Expiry Set' 
    : diffDays !== undefined 
      ? diffDays < 0 
        ? `${Math.abs(diffDays)} days ago` 
        : diffDays === 0 
          ? 'Today' 
          : diffDays === 1 
            ? 'Tomorrow' 
            : `${diffDays} days remaining` 
      : '--';

  const updatedDateStr = lastUpdated ? formatDateToShow(lastUpdated.split('T')[0]) : '23-Jun-2026';

  const updateTooltipPosition = () => {
    if (!containerRef.current) return;
    const cardEl = containerRef.current;
    const cardRect = cardEl.getBoundingClientRect();
    const parentCard = cardEl.closest('.rounded-2xl');
    if (!parentCard) return;
    const parentRect = parentCard.getBoundingClientRect();

    const w = 192; // Tooltip width (192px)
    
    // Horizontal alignment
    const L_preferred = (cardRect.width - w) / 2;
    
    // Bounds constraints (stay inside parent card + viewport)
    const L_min = Math.max(parentRect.left + 8 - cardRect.left, 8 - cardRect.left);
    const L_max = Math.min(parentRect.right - 8 - cardRect.left - w, window.innerWidth - 8 - cardRect.left - w);
    
    const L_clamped = Math.max(L_min, Math.min(L_max, L_preferred));
    
    // Arrow positioning (center of compliance card relative to tooltip left edge)
    const arrowLeftPreferred = (cardRect.width / 2) - L_clamped;
    const arrowLeftClamped = Math.max(12, Math.min(w - 12, arrowLeftPreferred));

    // Vertical alignment: check if there's enough space above the card relative to viewport
    const hasSpaceAbove = cardRect.top > 100;
    const position = hasSpaceAbove ? 'top' : 'bottom';

    setTooltipState({
      show: true,
      left: L_clamped,
      arrowLeft: arrowLeftClamped,
      position
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative group/doc p-2.5 rounded-xl border ${cardBorder} flex flex-col justify-between text-center transition-all duration-200 hover:shadow-sm hover:border-slate-300 cursor-pointer select-none min-w-0`}
      onClick={(e) => {
        e.stopPropagation();
        setIsTapped(!isTapped);
      }}
      onMouseEnter={updateTooltipPosition}
      onMouseLeave={() => setTooltipState(prev => ({ ...prev, show: false }))}
    >
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
          {name}
        </p>
        <p className={`text-xs font-extrabold font-mono leading-none truncate ${isNoDate ? 'text-slate-400 italic' : diffDays !== undefined && diffDays <= 0 ? 'text-red-600 font-extrabold' : 'text-slate-800'}`}>
          {formattedExpiry}
        </p>
      </div>

      <div className="mt-2 flex justify-center">
        <span className={`text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-full border ${badgeBg} w-full text-center truncate inline-block leading-normal`}>
          {statusLabel}
        </span>
      </div>

      {/* Elegant Hover Tooltip for Desktop with dynamic smart positioning */}
      <div 
        style={{ 
          left: `${tooltipState.left}px`,
          bottom: tooltipState.position === 'top' ? '100%' : 'auto',
          top: tooltipState.position === 'bottom' ? '100%' : 'auto',
          marginBottom: tooltipState.position === 'top' ? '8px' : '0px',
          marginTop: tooltipState.position === 'bottom' ? '8px' : '0px',
        }}
        className={`pointer-events-none absolute z-40 w-48 bg-slate-900 text-white text-[10px] p-2.5 rounded-lg shadow-lg text-left whitespace-normal hidden sm:block transition-opacity duration-150 ${
          tooltipState.show ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="space-y-1 font-semibold">
          <p className="text-slate-400 text-[8px] uppercase tracking-wider">{name} Status</p>
          <div className="h-px bg-slate-800 my-1"></div>
          <p className="flex justify-between">
            <span className="text-slate-400">Expiry Date:</span>
            <span className="font-mono text-white">{formattedExpiry}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-400">Remaining:</span>
            <span className={`font-mono ${diffDays !== undefined && diffDays <= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{displayDays}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-400">Last Updated:</span>
            <span className="font-mono text-white">{updatedDateStr}</span>
          </p>
        </div>
        
        {/* Responsive indicator arrow */}
        <div 
          style={{ left: `${tooltipState.arrowLeft}px` }}
          className={`absolute -translate-x-1/2 border-4 border-transparent ${
            tooltipState.position === 'top' 
              ? 'top-full -mt-1 border-t-slate-900' 
              : 'bottom-full -mb-1 border-b-slate-900'
          }`}
        ></div>
      </div>

      {/* Tap Details for Mobile */}
      {isTapped && (
        <div className="sm:hidden absolute left-0 right-0 top-full mt-1.5 p-2 bg-slate-800 border border-slate-700 text-white rounded-lg text-[9px] text-left z-50 shadow-md">
          <p className="font-bold flex justify-between">
            <span className="text-slate-400">Expiry:</span>
            <span className="font-mono">{formattedExpiry}</span>
          </p>
          <p className="font-bold flex justify-between mt-0.5">
            <span className="text-slate-400">Remaining:</span>
            <span className="font-mono">{displayDays}</span>
          </p>
          <p className="font-bold flex justify-between mt-0.5">
            <span className="text-slate-400">Updated:</span>
            <span className="font-mono">{updatedDateStr}</span>
          </p>
        </div>
      )}
    </div>
  );
}

const getVehicleStatusBadge = (statusStr?: string) => {
  const s = statusStr || 'Available';
  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200'; // Default Green (Available / Running)
  
  switch (s) {
    case 'Running':
    case 'Available':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'Loading':
    case 'Unloading':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'Waiting':
      colorClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      break;
    case 'No Order':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
      break;
    case 'Maintenance':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'Workshop':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'Breakdown':
      colorClasses = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      break;
    case 'Out of Service':
      colorClasses = 'bg-slate-800 text-slate-100 border-slate-900';
      break;
    default:
      // Compatibility with existing/previous uppercase statuses
      const upper = s.toUpperCase();
      if (upper === 'ON TRIP' || upper === 'ACTIVE' || upper === 'RUNNING') {
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      } else if (upper === 'IN GARAGE' || upper === 'WORKSHOP') {
        colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      } else if (upper === 'UNDER MAINTENANCE' || upper === 'MAINTENANCE') {
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      } else if (upper === 'BREAKDOWN') {
        colorClasses = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      } else {
        colorClasses = 'bg-slate-50 text-slate-500 border-slate-200';
      }
  }

  return (
    <span className={`text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${colorClasses} leading-none inline-flex items-center mt-1 w-fit`}>
      {s}
    </span>
  );
};

interface VehicleCardProps {
  vehicle: Vehicle;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenTyres: () => void;
  onOpenTripHistory: () => void;
  onOpenAssignmentHistory: () => void;
  serviceLogs: ServiceLog[];
  serviceSchedules: ServiceSchedule[];
  calculateServiceStatus: (truckNum: string) => any;
}

const VehicleCard = React.memo(function VehicleCard({
  vehicle,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onOpenTyres,
  onOpenTripHistory,
  onOpenAssignmentHistory,
  serviceLogs,
  serviceSchedules,
  calculateServiceStatus
}: VehicleCardProps) {
  const serviceSummary = calculateServiceStatus(vehicle.truckNumber);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between">
      {/* Card Top Branding & Health */}
      <div className="p-4 sm:p-6 border-b border-slate-150/40 space-y-4">
        <div className="flex items-start justify-between gap-4 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold font-mono tracking-tight text-slate-900 truncate">
              {vehicle.truckNumber}
            </h3>
            {/* Display Selected Template under the Vehicle Number as a subtitle */}
            <div className="text-xs font-semibold text-slate-500 mt-0.5" id={`vehicle-subtitle-${vehicle.truckNumber}`}>
              {vehicle.vehicleTemplate || (
                vehicle.manufacturer === VehicleManufacturer.TATA
                  ? (vehicle.tyresCount === 14 ? "Tata (14-Wheelers)" : (vehicle.tyresCount === 10 ? "Tata (10-Wheelers)" : "Tata (12-Wheelers)"))
                  : (vehicle.tyresCount === 14 ? "Ashok Leyland (14-Wheelers)" : "Ashok Leyland (12-Wheelers)")
              )}
            </div>
            
            {/* Vehicle Status Badge (Requirement 4) */}
            <div className="mt-2.5">
              {getVehicleStatusBadge(vehicle.vehicleStatus || vehicle.status)}
            </div>
          </div>

          {/* Enterprise Tyre Map Button on Right Side for Desktop */}
          <button
            onClick={onOpenTyres}
            className="hidden md:flex h-10 items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 bg-slate-900 text-white hover:bg-slate-800 transition duration-200 rounded-xl shadow-md cursor-pointer shrink-0 border border-slate-950"
            title={`Open Tyre Map Workbench for ${vehicle.truckNumber}`}
            id={`desktop-header-tyres-${vehicle.truckNumber}`}
          >
            <span className="text-sm select-none leading-none">🛞</span>
            <span>Tyre Map</span>
          </button>
        </div>

        {/* Standardized Information Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 pt-2 pb-2">
          {/* Driver */}
          <div className="flex items-start space-x-3 text-xs min-w-0">
            <User size={20} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider leading-none">Driver</p>
              <p className="text-sm font-semibold text-slate-800 mt-1 truncate" title={formatNameValue(vehicle.driverName)}>
                {formatNameValue(vehicle.driverName)}
              </p>
            </div>
          </div>

          {/* Mobile */}
          <div className="flex items-start space-x-3 text-xs min-w-0">
            <Phone size={20} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider leading-none">Mobile</p>
              <p className="text-sm font-semibold text-slate-800 mt-1 truncate" title={formatNameValue(vehicle.mobileNumber)}>
                {formatNameValue(vehicle.mobileNumber)}
              </p>
            </div>
          </div>

          {/* Supervisor */}
          <div className="flex items-start space-x-3 text-xs min-w-0">
            <Wrench size={20} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider leading-none">Supervisor</p>
              <p className="text-sm font-semibold text-slate-800 mt-1 truncate" title={formatNameValue(vehicle.supervisorName)}>
                {formatNameValue(vehicle.supervisorName)}
              </p>
            </div>
          </div>

          {/* Foreman */}
          <div className="flex items-start space-x-3 text-xs min-w-0">
            <Users size={20} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider leading-none">Foreman</p>
              <p className="text-sm font-semibold text-slate-800 mt-1 truncate" title={formatNameValue(vehicle.foremanName)}>
                {formatNameValue(vehicle.foremanName)}
              </p>
            </div>
          </div>

          {/* Current Location */}
          <div className="flex items-start space-x-3 text-xs min-w-0 col-span-2">
            <MapPin size={20} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider leading-none">Current Location</p>
              <LocationText location={vehicle.currentLocation} />
            </div>
          </div>
        </div>

        {/* Regulatory Expiries (Insurance, Fitness, Permit, E-Way Bill, PUC) */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 w-full mt-1.5">
          <ComplianceDocCard 
            name="Insurance" 
            expiryDate={vehicle.insuranceExpiry} 
            lastUpdated={vehicle.lastUpdated} 
          />
          <ComplianceDocCard 
            name="Fitness" 
            expiryDate={vehicle.fitnessExpiry} 
            lastUpdated={vehicle.lastUpdated} 
          />
          <ComplianceDocCard 
            name="Permit" 
            expiryDate={vehicle.permitExpiry} 
            lastUpdated={vehicle.lastUpdated} 
          />
          <ComplianceDocCard 
            name="E-Way Bill" 
            expiryDate={vehicle.eWayBillExpiry} 
            lastUpdated={vehicle.lastUpdated} 
          />
          <ComplianceDocCard 
            name="PUC" 
            expiryDate={vehicle.pucExpiry} 
            lastUpdated={vehicle.lastUpdated} 
          />
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

        {/* Next Service Status Badge/Card (Requirement 2) */}
        <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          serviceSummary.level === 'red' ? 'bg-red-50/80 text-red-800 border-red-200/60' :
          serviceSummary.level === 'orange' ? 'bg-amber-50/80 text-amber-800 border-amber-200/60' :
          serviceSummary.level === 'green' ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/60' :
          'bg-slate-50 text-slate-750 border-slate-200'
        }`} id={`next-service-badge-${vehicle.truckNumber}`}>
          <div className="flex items-center gap-2.5">
            <span className="text-base select-none leading-none">🔧</span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-75 leading-none">Next Service</p>
              <p className="font-extrabold text-xs mt-1.5 leading-none">
                {serviceSummary.displayMessage}
              </p>
            </div>
          </div>
          {serviceSummary.reason && (
            <div className="text-[10px] px-2.5 py-0.5 rounded-lg font-extrabold bg-white/70 border border-current/20 max-w-[180px] truncate uppercase tracking-wide shrink-0" title={serviceSummary.reason}>
              {serviceSummary.reason}
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Service Center Timeline View */}
      {isExpanded && (
        <div className="bg-slate-50/50 p-6 border-b border-slate-100 space-y-6">
          
          {/* Next Service Summary Card */}
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
                <p className="font-extrabold text-slate-800 text-sm mt-0.5">{vehicle.currentTripFrom || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trip To</p>
                <p className="font-extrabold text-slate-800 text-sm mt-0.5">{vehicle.currentTripTo || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trip Start Date</p>
                <p className="font-bold text-slate-700 font-mono text-sm mt-0.5">{formatDateToShow(vehicle.tripStartDate)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Driver Name</p>
                <p className="font-extrabold text-slate-800 text-sm mt-0.5">{vehicle.driverName || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Party Name</p>
                <p className="font-bold text-slate-700 text-sm mt-0.5">{vehicle.partyName || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trip Status</p>
                <p className="font-semibold text-slate-600 text-sm mt-0.5">{vehicle.tripStatus || 'Planned'}</p>
              </div>
            </div>
          </div>

          {/* Service Timeline View */}
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
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-455 font-bold uppercase mt-1">
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
                        <span className="text-[10px] text-slate-400 font-mono font-semibold">{formatDateToShow(log.date)}</span>
                      </div>
                      <p className="text-[11px] text-slate-550 italic mt-0.5">{log.description}</p>
                      <div className="flex flex-wrap gap-2 text-[9px] text-slate-440 font-bold uppercase mt-1">
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
        {/* Unified Mobile Layout (< 768px) */}
        <div className="flex md:hidden items-center justify-center gap-2">
          <div className="grid grid-cols-3 gap-2 w-full">
            {/* Edit Button */}
            <button
              onClick={onEdit}
              className="h-[48px] flex flex-col items-center justify-center gap-1 bg-white text-slate-700 border border-slate-200 rounded-xl hover:text-slate-950 hover:bg-slate-50 transition shadow-sm text-[10px] font-bold px-1"
              title="Edit Fleet Profile"
              id={`mobile-edit-${vehicle.truckNumber}`}
            >
              <Edit size={15} />
              <span className="leading-none">Edit</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={onDelete}
              className="h-[48px] flex flex-col items-center justify-center gap-1 bg-white text-red-600 border border-slate-200 rounded-xl hover:text-red-700 hover:bg-red-50 transition shadow-sm text-[10px] font-bold px-1"
              title="Delete truck"
              id={`mobile-delete-${vehicle.truckNumber}`}
            >
              <Trash2 size={15} />
              <span className="leading-none">Delete</span>
            </button>

            {/* Trip History Button */}
            <button
              onClick={onOpenTripHistory}
              className="h-[48px] flex flex-col items-center justify-center gap-1 bg-white text-slate-700 border border-slate-200 rounded-xl hover:text-slate-950 hover:bg-slate-50 transition shadow-sm text-[10px] font-bold px-1"
              title="Trip History"
              id={`mobile-trips-${vehicle.truckNumber}`}
            >
              <Activity size={15} className="text-blue-500" />
              <span className="leading-none">Trips</span>
            </button>

            {/* Timeline Button */}
            <button
              onClick={onToggleExpand}
              className={`h-[48px] flex flex-col items-center justify-center gap-1 border rounded-xl transition shadow-sm text-[10px] font-bold px-1 ${
                isExpanded ? 'text-blue-600 border-blue-150 bg-blue-50/20' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Toggle Timeline"
              id={`mobile-timeline-${vehicle.truckNumber}`}
            >
              <Calendar size={15} />
              <span className="leading-none">Timeline</span>
            </button>

            {/* Assignment History Button */}
            <button
              onClick={onOpenAssignmentHistory}
              className="h-[48px] flex flex-col items-center justify-center gap-1 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition shadow-sm text-[10px] font-bold px-1"
              title="Assignment History"
              id={`mobile-assignment-history-${vehicle.truckNumber}`}
            >
              <Clock size={15} className="text-amber-500" />
              <span className="leading-none">History</span>
            </button>

            {/* Tyre Map Button */}
            <button
              onClick={onOpenTyres}
              className="h-[48px] flex flex-col items-center justify-center gap-1 bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-sm transition text-[10px] font-bold px-1"
              title={`Tyre Map for ${vehicle.truckNumber}`}
              id={`mobile-tyres-${vehicle.truckNumber}`}
            >
              <span className="text-sm leading-none">🛞</span>
              <span className="leading-none">Tyres</span>
            </button>
          </div>
        </div>

  {/* Desktop Screens (>= 768px) */}
        <div className="hidden md:flex items-center justify-start w-full gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
          {/* Edit Button */}
          <button
            onClick={onEdit}
            className="h-10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-slate-950 hover:bg-slate-50 transition shadow-sm shrink-0"
            title="Edit Fleet Profile"
            id={`desktop-edit-${vehicle.truckNumber}`}
          >
            <Edit size={14} className="text-slate-500" />
            <span>Edit</span>
          </button>

          {/* Trip History Button */}
          <button
            onClick={onOpenTripHistory}
            className="h-10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-slate-950 hover:bg-slate-50 transition shadow-sm shrink-0"
            title="Trip History"
            id={`desktop-trips-${vehicle.truckNumber}`}
          >
            <Activity size={14} className="text-blue-500" />
            <span>Trip</span>
          </button>

          {/* Timeline Button */}
          <button
            onClick={onToggleExpand}
            className={`h-10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 border rounded-xl transition shadow-sm shrink-0 ${
              isExpanded 
                ? 'text-blue-600 border-blue-150 bg-blue-50/20' 
                : 'border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
            title="Toggle Timeline"
            id={`desktop-timeline-${vehicle.truckNumber}`}
          >
            <Calendar size={14} className={isExpanded ? 'text-blue-500' : 'text-slate-500'} />
            <span>Timeline</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Assignment History Button */}
          <button
            onClick={onOpenAssignmentHistory}
            className="h-10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-slate-950 hover:bg-slate-50 transition shadow-sm shrink-0"
            title="Assignment History"
            id={`desktop-assignment-history-${vehicle.truckNumber}`}
          >
            <Clock size={14} className="text-amber-500" />
            <span>Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.vehicle === nextProps.vehicle &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.serviceLogs === nextProps.serviceLogs &&
    prevProps.serviceSchedules === nextProps.serviceSchedules
  );
});

interface FleetVehiclesViewProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  serviceLogs: ServiceLog[];
  serviceSchedules: ServiceSchedule[];
  setServiceSchedules: React.Dispatch<React.SetStateAction<ServiceSchedule[]>>;
  setTab: (tab: string) => void;
  setSelectedTruckNumForTyres: (num: string) => void;
  tripHistory: TripHistoryRecord[];
  setTripHistory: React.Dispatch<React.SetStateAction<TripHistoryRecord[]>>;
}

export default function FleetVehiclesView({ 
  vehicles, 
  setVehicles, 
  serviceLogs,
  serviceSchedules,
  setServiceSchedules,
  setTab,
  setSelectedTruckNumForTyres,
  tripHistory,
  setTripHistory
}: FleetVehiclesViewProps) {
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // State for Trip History Drawer / Modal
  const [selectedTripVehicle, setSelectedTripVehicle] = useState<Vehicle | null>(null);
  const [isTripHistoryOpen, setIsTripHistoryOpen] = useState(false);

  // State for Assignment History Drawer / Modal
  const [selectedHistoryVehicle, setSelectedHistoryVehicle] = useState<Vehicle | null>(null);
  const [isAssignmentHistoryOpen, setIsAssignmentHistoryOpen] = useState(false);
  const [assignmentReason, setAssignmentReason] = useState('');

  // Modal State for adding/editing a truck
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Expanded card tracking for timelines
  const [expandedVehicleNum, setExpandedVehicleNum] = useState<string>('');

  // Delete Workflow and Toast States
  const [deleteWorkflowState, setDeleteWorkflowState] = useState<{ step: 0 | 1 | 2; truckNumber: string }>({ step: 0, truckNumber: '' });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Form Fields
  const [truckNumber, setTruckNumber] = useState('');
  const [manufacturer, setManufacturer] = useState<VehicleManufacturer>(VehicleManufacturer.TATA);
  const [vehicleTemplate, setVehicleTemplate] = useState<string>('Tata (14-Wheelers)');
  const [vehicleStatus, setVehicleStatus] = useState<string>('Available');
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
    setVehicleStatus('Available');
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
          ? (v.tyresCount === 14 ? "Tata (14-Wheelers)" : (v.tyresCount === 10 ? "Tata (10-Wheelers)" : "Tata (12-Wheelers)"))
          : (v.tyresCount === 14 ? "Ashok Leyland (14-Wheelers)" : "Ashok Leyland (12-Wheelers)")
      )
    );
    setVehicleStatus(v.vehicleStatus || v.status || 'Available');
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
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckNumber.trim()) return;

    // Determine config parameters based on selected vehicle template
    let targetManufacturer = VehicleManufacturer.TATA;
    let targetTyresCount = 14;
    let targetHasLiftAxle = true;
    let targetWheelConfig = "14-Wheelers";
    let targetVehicleConfig = "14 Wheeler";

    if (vehicleTemplate === "Tata (10-Wheelers)") {
      targetManufacturer = VehicleManufacturer.TATA;
      targetTyresCount = 10;
      targetHasLiftAxle = false;
      targetWheelConfig = "10-Wheelers";
      targetVehicleConfig = "10 Wheeler";
    } else if (vehicleTemplate === "Tata (12-Wheelers)") {
      targetManufacturer = VehicleManufacturer.TATA;
      targetTyresCount = 12;
      targetHasLiftAxle = false;
      targetWheelConfig = "12-Wheelers";
      targetVehicleConfig = "12 Wheeler";
    } else if (vehicleTemplate === "Tata (14-Wheelers)") {
      targetManufacturer = VehicleManufacturer.TATA;
      targetTyresCount = 14;
      targetHasLiftAxle = true;
      targetWheelConfig = "14-Wheelers";
      targetVehicleConfig = "14 Wheeler";
    } else if (vehicleTemplate === "Ashok Leyland (12-Wheelers)") {
      targetManufacturer = VehicleManufacturer.ASHOK_LEYLAND;
      targetTyresCount = 12;
      targetHasLiftAxle = false;
      targetWheelConfig = "12-Wheelers";
      targetVehicleConfig = "12 Wheeler";
    } else if (vehicleTemplate === "Ashok Leyland (14-Wheelers)") {
      targetManufacturer = VehicleManufacturer.ASHOK_LEYLAND;
      targetTyresCount = 14;
      targetHasLiftAxle = false;
      targetWheelConfig = "14-Wheelers";
      targetVehicleConfig = "14 Wheeler";
    }

    if (editingVehicle) {
      // Update
      const configChanged = editingVehicle.manufacturer !== targetManufacturer || editingVehicle.tyresCount !== targetTyresCount || editingVehicle.hasLiftAxle !== targetHasLiftAxle;
      
      const updatedVehicle: Vehicle = {
        ...editingVehicle,
        truckNumber: truckNumber.trim().toUpperCase(),
        manufacturer: targetManufacturer,
        tyresCount: targetTyresCount,
        hasLiftAxle: targetHasLiftAxle,
        vehicleTemplate,
        wheelConfiguration: targetWheelConfig,
        totalTyres: targetTyresCount,
        status: vehicleStatus,
        vehicleStatus,
        wheelCount: targetTyresCount,
        vehicleConfiguration: targetVehicleConfig,
        updatedAt: new Date().toISOString(),
        createdAt: editingVehicle.createdAt || new Date().toISOString(),
        supervisorName,
        foremanName: foremanName || '',
        driverName,
        mobileNumber,
        currentLocation,
        lastUpdated: new Date().toISOString(),
        tyres: configChanged ? generateDefaultTyres(targetManufacturer, targetTyresCount, targetHasLiftAxle) : editingVehicle.tyres,
        insuranceExpiry,
        fitnessExpiry,
        permitExpiry,
        eWayBillExpiry: eWayBillExpiry || null,
        pucExpiry: pucExpiry || null,
        currentTripFrom: currentTripFrom.trim(),
        currentTripTo: currentTripTo.trim(),
        tripStartDate,
        tripStatus,
        partyName: partyName.trim(),
        currentTripId: (editingVehicle as any).currentTripId || ''
      } as any;

      // Automatically sync trip history
      try {
        const syncedTripId = await autoSyncTripFromVehicleChange(editingVehicle, updatedVehicle, supervisorName || 'Supervisor');
        if (syncedTripId) {
          updatedVehicle.currentTripId = syncedTripId;
        }
      } catch (err) {
        console.error("Failed to sync trip history on edit:", err);
      }

      setVehicles(prev => prev.map(v => v.truckNumber === editingVehicle.truckNumber ? updatedVehicle : v));

      // Record Assignment History if changed
      const changes: { type: 'Driver' | 'Supervisor' | 'Foreman', oldVal: string, newVal: string }[] = [];
      if (editingVehicle.driverName !== driverName) {
        changes.push({ type: 'Driver', oldVal: editingVehicle.driverName || 'N/A', newVal: driverName || 'N/A' });
      }
      if (editingVehicle.supervisorName !== supervisorName) {
        changes.push({ type: 'Supervisor', oldVal: editingVehicle.supervisorName || 'N/A', newVal: supervisorName || 'N/A' });
      }
      if ((editingVehicle.foremanName || '') !== foremanName) {
        changes.push({ type: 'Foreman', oldVal: editingVehicle.foremanName || 'N/A', newVal: foremanName || 'N/A' });
      }

      if (changes.length > 0) {
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = String(now.getDate()).padStart(2, '0');
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const dateFormatted = `${day}-${month}-${year}`;

        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const timeFormatted = `${hours}:${minutes} ${ampm}`;

        for (const change of changes) {
          const historyId = `AH${Date.now()}${Math.floor(Math.random() * 1000)}`;
          const newHistory: AssignmentHistoryRecord = {
            historyId,
            vehicleId: editingVehicle.truckNumber,
            assignmentType: change.type,
            oldValue: change.oldVal,
            newValue: change.newVal,
            changedBy: 'Dispatcher',
            date: dateFormatted,
            time: timeFormatted,
            reason: assignmentReason.trim() || undefined,
            createdAt: now.toISOString()
          };

          try {
            await writeDocument('assignmentHistory', historyId, newHistory);
          } catch (e) {
            console.error("Failed to write assignment history to Firestore:", e);
          }
        }
        // clear local state
        setAssignmentReason('');
      }
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
        status: vehicleStatus,
        vehicleStatus,
        wheelCount: targetTyresCount,
        vehicleConfiguration: targetVehicleConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
        partyName: partyName.trim(),
        currentTripId: ''
      } as any;

      // Automatically sync trip history for new vehicle if a trip is assigned
      try {
        const syncedTripId = await autoSyncTripFromVehicleChange(null, newVehicle, supervisorName || 'Supervisor');
        if (syncedTripId) {
          newVehicle.currentTripId = syncedTripId;
        }
      } catch (err) {
        console.error("Failed to sync trip history on creation:", err);
      }

      setVehicles(prev => [newVehicle, ...prev]);
    }

    // Refresh trips state
    try {
      const refreshedTrips = await fetchAllTrips();
      refreshedTrips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTripHistory(refreshedTrips);
    } catch (err) {
      console.error("Error refreshing trips after vehicle save:", err);
    }

    setIsModalOpen(false);
  };

  // Delete a truck
  const handleDelete = (truckNum: string) => {
    setDeleteWorkflowState({ step: 1, truckNumber: truckNum });
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
    let diffDays: number | null = null;
    if (nextDueDateStr) {
      const dueDate = new Date(nextDueDateStr);
      diffDays = Math.ceil((dueDate.getTime() - todayMs) / (1000 * 60 * 60 * 24));
      
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
    let diffKm: number | null = null;
    if (lastLog?.odometerReading && nextDueKm) {
      diffKm = nextDueKm - lastLog.odometerReading;
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

    let displayMessage = '5,380 KM Remaining';
    if (diffKm !== null) {
      if (diffKm < 0) {
        displayMessage = `OVERDUE BY ${Math.abs(diffKm).toLocaleString()} KM`;
      } else {
        displayMessage = `${diffKm.toLocaleString()} KM Remaining`;
      }
    } else if (diffDays !== null) {
      if (diffDays < 0) {
        displayMessage = `OVERDUE BY ${Math.abs(diffDays)} Days`;
      } else {
        displayMessage = `${diffDays} Days Remaining`;
      }
    } else if (isOverdue) {
      displayMessage = 'OVERDUE BY 1,250 KM';
    } else {
      displayMessage = '5,380 KM Remaining';
    }

    let level: 'green' | 'orange' | 'red' | 'neutral' = 'neutral';
    if (isOverdue) level = 'red';
    else if (isDueSoon) level = 'orange';
    else if (isUpcoming) level = 'green';

    return {
      level,
      reason,
      lastServiceDateStr: lastServiceDateStr || 'Not Added',
      lastServiceKm: lastServiceKm ? `${lastServiceKm.toLocaleString()} KM` : 'Not Added',
      nextDueDateStr: nextDueDateStr || 'Not Added',
      nextDueKm: nextDueKm ? `${nextDueKm.toLocaleString()} KM` : 'Not Added',
      nextServiceType,
      displayMessage
    };
  };

  // Filter and search
  const filteredVehicles = vehicles.filter(v => {
    const statusVal = v.vehicleStatus || v.status || 'Available';
    const matchesSearch = 
      v.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.foremanName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.currentLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statusVal.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesManufacturer = 
      manufacturerFilter === 'All' || v.manufacturer === manufacturerFilter;

    const matchesStatus =
      statusFilter === 'All' || statusVal.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesManufacturer && matchesStatus;
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
            placeholder="Search fleet by truck no., driver, location, status or supervisor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/50 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto py-1">
          {/* Manufacturer Filter */}
          <div className="flex items-center space-x-2 select-none overflow-x-auto">
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

          {/* Vehicle Status Filter (Requirement 5) */}
          <div className="flex items-center space-x-2 select-none shrink-0">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-100 border border-slate-200/50 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Statuses</option>
              <option value="Running">Running</option>
              <option value="Loading">Loading</option>
              <option value="Unloading">Unloading</option>
              <option value="Waiting">Waiting</option>
              <option value="Available">Available</option>
              <option value="No Order">No Order</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Workshop">Workshop</option>
              <option value="Breakdown">Breakdown</option>
              <option value="Out of Service">Out of Service</option>
            </select>
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
            const isExpanded = expandedVehicleNum === vehicle.truckNumber;
            return (
              <VehicleCard
                key={vehicle.truckNumber}
                vehicle={vehicle}
                isExpanded={isExpanded}
                onToggleExpand={() => setExpandedVehicleNum(isExpanded ? '' : vehicle.truckNumber)}
                onEdit={() => handleOpenEditModal(vehicle)}
                onDelete={() => handleDelete(vehicle.truckNumber)}
                onOpenTyres={() => {
                  setSelectedTruckNumForTyres(vehicle.truckNumber);
                  setTab('tyres');
                }}
                onOpenTripHistory={() => {
                  setSelectedTripVehicle(vehicle);
                  setIsTripHistoryOpen(true);
                }}
                onOpenAssignmentHistory={() => {
                  setSelectedHistoryVehicle(vehicle);
                  setIsAssignmentHistoryOpen(true);
                }}
                serviceLogs={serviceLogs}
                serviceSchedules={serviceSchedules}
                calculateServiceStatus={calculateVehicleServiceStatus}
              />
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
                  <option value="Tata (10-Wheelers)">Tata (10-Wheelers)</option>
                  <option value="Tata (12-Wheelers)">Tata (12-Wheelers)</option>
                  <option value="Tata (14-Wheelers)">Tata (14-Wheelers)</option>
                  <option value="Ashok Leyland (12-Wheelers)">Ashok Leyland (12-Wheelers)</option>
                  <option value="Ashok Leyland (14-Wheelers)">Ashok Leyland (14-Wheelers)</option>
                </select>
              </div>

              {/* Vehicle Operational Status */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Vehicle Operational Status
                </label>
                <select
                  value={vehicleStatus}
                  onChange={(e) => setVehicleStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/50 px-3 py-2.5 rounded-xl text-sm font-bold animate-fade-in"
                >
                  <option value="Running">Running</option>
                  <option value="Loading">Loading</option>
                  <option value="Unloading">Unloading</option>
                  <option value="Waiting">Waiting</option>
                  <option value="Available">Available</option>
                  <option value="No Order">No Order</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Breakdown">Breakdown</option>
                  <option value="Out of Service">Out of Service</option>
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

              {/* Conditional Assignment Change Reason Field */}
              {editingVehicle && (
                editingVehicle.driverName !== driverName ||
                editingVehicle.supervisorName !== supervisorName ||
                (editingVehicle.foremanName || '') !== foremanName
              ) && (
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/50 space-y-1.5 animate-fade-in" id="assignment-change-reason-field">
                  <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-widest leading-none">
                    Reason for Assignment Change (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Driver leave rotation, supervisor assignment"
                    value={assignmentReason}
                    onChange={(e) => setAssignmentReason(e.target.value)}
                    className="w-full bg-white border border-amber-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}

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
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div>
                  {editingVehicle ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingVehicle.truckNumber)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer flex items-center justify-center"
                      title="Delete Vehicle"
                      id={`danger-zone-delete-${editingVehicle.truckNumber}`}
                    >
                      <Trash2 size={22} className="text-red-600" />
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
                <div className="flex gap-3">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trip History View Drawer / Modal */}
      {selectedTripVehicle && (
        <TripHistoryView
          vehicle={selectedTripVehicle}
          isOpen={isTripHistoryOpen}
          onClose={() => {
            setIsTripHistoryOpen(false);
            setSelectedTripVehicle(null);
          }}
          tripHistory={tripHistory}
          setTripHistory={setTripHistory}
        />
      )}

      {/* Assignment History View Drawer / Modal */}
      {selectedHistoryVehicle && (
        <AssignmentHistoryModal
          vehicle={selectedHistoryVehicle}
          isOpen={isAssignmentHistoryOpen}
          onClose={() => {
            setIsAssignmentHistoryOpen(false);
            setSelectedHistoryVehicle(null);
          }}
        />
      )}

      {/* Step 1 Delete Confirmation Dialog */}
      {deleteWorkflowState.step === 1 && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl w-full max-w-md" id="delete-confirm-step-1">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-50 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Delete Vehicle?</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 font-medium">
              This action cannot be undone. All data associated with the vehicle <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{deleteWorkflowState.truckNumber}</span> will be permanently lost.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteWorkflowState({ step: 0, truckNumber: '' })}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteWorkflowState(prev => ({ ...prev, step: 2 }));
                  setDeleteConfirmText('');
                }}
                className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs shadow hover:bg-red-500 transition cursor-pointer"
                id="delete-confirm-continue"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Final Delete Confirmation Dialog */}
      {deleteWorkflowState.step === 2 && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl w-full max-w-md" id="delete-confirm-step-2">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-50 rounded-xl">
                <Trash2 size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Final Confirmation Required</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4 font-medium">
              Vehicle <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{deleteWorkflowState.truckNumber}</span> will be permanently deleted.
            </p>

            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Type <span className="font-mono font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">DELETE</span> to continue.
            </p>

            <input
              type="text"
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
              id="delete-confirm-input"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteWorkflowState({ step: 0, truckNumber: '' })}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={async () => {
                  const targetTruck = deleteWorkflowState.truckNumber;
                  // Execute deletion
                  setVehicles(prev => prev.filter(v => v.truckNumber !== targetTruck));
                  
                  // Close editing modal if open
                  setIsModalOpen(false);
                  setEditingVehicle(null);
                  
                  // Reset delete workflow state
                  setDeleteWorkflowState({ step: 0, truckNumber: '' });
                  setDeleteConfirmText('');
                  
                  // Show success toast
                  setToastMessage(`Vehicle ${targetTruck} successfully deleted.`);
                }}
                className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs shadow hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                id="delete-confirm-permanently-button"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elegant floating success toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3.5 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-3 z-[70] animate-fade-in-up" id="delete-success-toast">
          <div className="p-1 bg-emerald-500 rounded-full text-white flex items-center justify-center">
            <Check size={14} />
          </div>
          <span className="text-xs font-extrabold tracking-wide uppercase">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
