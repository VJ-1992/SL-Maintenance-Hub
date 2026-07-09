import React, { useState, useMemo } from 'react';
import { Vehicle, TripHistoryRecord, TripTimelineEvent, DeliveryPoint } from '../types';
import { 
  X, Search, ArrowUpDown, Download, Printer, Activity, Clock, MapPin, Plus, 
  Check, Edit, User, Calendar, FileText, ChevronDown, ChevronUp, Upload, 
  Trash2, ArrowLeft, Briefcase, Layers, Map, Truck, Info, Phone, Navigation,
  PlusCircle, CheckCircle, AlertCircle, Share2, Copy
} from 'lucide-react';
import { writeDocument, removeDocument } from '../services/firebase';

// Import our custom sub-components
import TripDriverPanel from './trip/TripDriverPanel';
import TripActionsMenu from './trip/TripActionsMenu';
import TripAddEventModal from './trip/TripAddEventModal';
import TripLogDeliveryModal from './trip/TripLogDeliveryModal';
import TripEditModal from './trip/TripEditModal';
import TripDocumentsSection from './trip/TripDocumentsSection';
import TripCreateModal from './trip/TripCreateModal';

interface TripHistoryViewProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  tripHistory: TripHistoryRecord[];
  setTripHistory: React.Dispatch<React.SetStateAction<TripHistoryRecord[]>>;
}

export default function TripHistoryView({
  vehicle,
  isOpen,
  onClose,
  tripHistory,
  setTripHistory
}: TripHistoryViewProps) {
  // Mobile / Responsive Layout state
  const [activeMobileView, setActiveMobileView] = useState<'list' | 'details'>('list');

  // Filters & Search query states
  const [searchTerm, setSearchTerm] = useState('');
  const [chipFilter, setChipFilter] = useState<'All' | 'Scheduled' | 'Running' | 'Completed' | 'Cancelled' | 'Delayed' | "Today's Trips" | 'This Week' | 'This Month'>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Active selected trip state
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Floating Modal states
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isLogDeliveryOpen, setIsLogDeliveryOpen] = useState(false);
  const [activeDpToLog, setActiveDpToLog] = useState<DeliveryPoint | null>(null);
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [isUpdateLocationOpen, setIsUpdateLocationOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);

  // States for adding a new delivery point (within details panel)
  const [isAddingDeliveryPoint, setIsAddingDeliveryPoint] = useState(false);
  const [dpLocation, setDpLocation] = useState('');
  const [dpRemarks, setDpRemarks] = useState('');

  // Driver/Personnel Assignment quick edit states
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverMobile, setNewDriverMobile] = useState('');
  const [newSupervisorName, setNewSupervisorName] = useState('');
  const [newForemanName, setNewForemanName] = useState('');
  // Location Update quick state
  const [updateLocText, setUpdateLocText] = useState('');

  if (!isOpen) return null;

  // 1. FILTER & SORT TRIPS FOR THIS VEHICLE
  const vehicleTrips = useMemo(() => {
    let filtered = tripHistory.filter(t => t.vehicleNumber === vehicle.truckNumber);

    // Filter by global Search Queries
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(t => {
        const matchesTripId = t.tripId.toLowerCase().includes(q);
        const matchesDriver = t.driver.toLowerCase().includes(q);
        const matchesRoute = t.fromLocation.toLowerCase().includes(q) || t.toLocation.toLowerCase().includes(q);
        const matchesParty = t.party ? t.party.toLowerCase().includes(q) : false;
        
        // Search intermediate delivery points
        const matchesDeliveryPoints = t.deliveryPoints 
          ? t.deliveryPoints.some(dp => 
              dp.location.toLowerCase().includes(q) || 
              (dp.receiverName && dp.receiverName.toLowerCase().includes(q)) ||
              (dp.invoiceNumber && dp.invoiceNumber.toLowerCase().includes(q)) ||
              (dp.podNumber && dp.podNumber.toLowerCase().includes(q))
            )
          : false;

        return matchesTripId || matchesDriver || matchesRoute || matchesParty || matchesDeliveryPoints;
      });
    }

    // Filter by visual Chip Filter Categories
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date();
    
    if (chipFilter === 'Scheduled') {
      filtered = filtered.filter(t => t.status === 'Scheduled');
    } else if (chipFilter === 'Running') {
      filtered = filtered.filter(t => ['Running', 'Dispatched', 'Loading', 'Partial Delivery', 'Final Delivery'].includes(t.status));
    } else if (chipFilter === 'Completed') {
      filtered = filtered.filter(t => t.status === 'Completed');
    } else if (chipFilter === 'Cancelled') {
      filtered = filtered.filter(t => t.status === 'Cancelled');
    } else if (chipFilter === 'Delayed') {
      // Scheduled or Running, and start date is in the past
      filtered = filtered.filter(t => 
        ['Scheduled', 'Running', 'Dispatched', 'Loading'].includes(t.status) && 
        t.startDate && t.startDate < todayStr
      );
    } else if (chipFilter === "Today's Trips") {
      filtered = filtered.filter(t => t.startDate === todayStr || t.createdAt.split('T')[0] === todayStr);
    } else if (chipFilter === 'This Week') {
      filtered = filtered.filter(t => {
        if (!t.startDate) return false;
        const tripDate = new Date(t.startDate);
        const diffTime = Math.abs(today.getTime() - tripDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      });
    } else if (chipFilter === 'This Month') {
      filtered = filtered.filter(t => {
        if (!t.startDate) return false;
        const tripDate = new Date(t.startDate);
        return tripDate.getMonth() === today.getMonth() && tripDate.getFullYear() === today.getFullYear();
      });
    }

    // Sort Order
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [tripHistory, vehicle.truckNumber, searchTerm, chipFilter, sortOrder]);

  // Determine current active trip selection
  const activeTrip = useMemo(() => {
    if (selectedTripId) {
      const trip = vehicleTrips.find(t => t.tripId === selectedTripId);
      if (trip) return trip;
    }
    return vehicleTrips[0] || null;
  }, [vehicleTrips, selectedTripId]);

  // Handle selecting a card
  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setActiveMobileView('details');
  };

  // 2. SMART TRIP STATUS AUTO CALCULATOR
  const recalculateSmartStatus = (trip: TripHistoryRecord): TripHistoryRecord['status'] => {
    if (trip.status === 'Cancelled') return 'Cancelled';
    if (trip.status === 'Completed') return 'Completed';

    const dps = trip.deliveryPoints || [];
    if (dps.length === 0) {
      const lastEvent = trip.timeline && trip.timeline.length > 0 
        ? trip.timeline[trip.timeline.length - 1].eventName.toLowerCase() 
        : '';
      
      if (lastEvent.includes('loading completed') || lastEvent.includes('running')) {
        return 'Running';
      }
      if (lastEvent.includes('loading started') || lastEvent.includes('loading')) {
        return 'Loading';
      }
      if (lastEvent.includes('dispatched')) {
        return 'Dispatched';
      }
      return trip.status || 'Scheduled';
    }

    const allDeliveredOrSkipped = dps.every(dp => dp.status === 'Delivered' || dp.status === 'Skipped');
    const anyDeliveredOrReached = dps.some(dp => dp.status === 'Delivered' || dp.status === 'Reached');

    if (allDeliveredOrSkipped) {
      return 'Final Delivery';
    } else if (anyDeliveredOrReached) {
      return 'Partial Delivery';
    } else {
      // Check last events
      const names = trip.timeline.map(e => e.eventName.toLowerCase());
      if (names.some(n => n.includes('loading completed'))) return 'Running';
      if (names.some(n => n.includes('loading started'))) return 'Loading';
      if (names.some(n => n.includes('dispatched'))) return 'Dispatched';
      return 'Scheduled';
    }
  };

  // 3. PERSIST TRIP MODIFICATION (LOCAL STATE & FIRESTORE)
  const saveTripUpdate = async (updatedTrip: TripHistoryRecord) => {
    // Run smart status calculator
    updatedTrip.status = recalculateSmartStatus(updatedTrip);
    updatedTrip.updatedAt = new Date().toISOString();

    // Update state
    const nextHistory = tripHistory.map(t => t.tripId === updatedTrip.tripId ? updatedTrip : t);
    setTripHistory(nextHistory);

    // Sync to Firestore
    try {
      await writeDocument('tripHistory', updatedTrip.tripId, updatedTrip);
    } catch (e) {
      console.error("Failed to sync updated trip to Firestore:", e);
    }
  };

  // 4. ACTION TRIGGERS
  const handleAddNewTrip = () => {
    setIsCreateTripOpen(true);
  };

  const handleCreateTripSubmit = async (newTrip: TripHistoryRecord) => {
    const nextHistory = [newTrip, ...tripHistory];
    setTripHistory(nextHistory);
    setSelectedTripId(newTrip.tripId);
    setActiveMobileView('details');

    try {
      await writeDocument('tripHistory', newTrip.tripId, newTrip);
    } catch (e) {
      console.error("Firestore write failure on create trip:", e);
    }
  };

  const handleDuplicateTrip = async (trip: TripHistoryRecord) => {
    const cloneId = `TRIP-${Math.floor(100000 + Math.random() * 900000)}`;
    const cloned: TripHistoryRecord = {
      ...trip,
      tripId: cloneId,
      status: 'Scheduled',
      timeline: [
        {
          eventName: 'Trip Cloned / Re-scheduled',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().substring(0, 5),
          user: vehicle.supervisorName || 'System',
          remarks: `Duplicated from Trip ID ${trip.tripId}`
        }
      ],
      deliveryPoints: (trip.deliveryPoints || []).map(dp => ({
        ...dp,
        id: `DP-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Pending',
        receiverName: undefined,
        receiverMobile: undefined,
        receiverSignature: undefined,
        proofPhoto: undefined,
        deliveryRemarks: undefined,
        deliveryTime: undefined
      })),
      documents: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTripHistory([cloned, ...tripHistory]);
    setSelectedTripId(cloneId);
    setActiveMobileView('details');

    try {
      await writeDocument('tripHistory', cloneId, cloned);
    } catch (e) {
      console.error("Firestore write failure on duplicate trip:", e);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm(`Are you sure you want to delete Trip ID ${tripId}? This is administrative and irreversible.`)) return;

    const nextHistory = tripHistory.filter(t => t.tripId !== tripId);
    setTripHistory(nextHistory);
    setSelectedTripId(null);
    setActiveMobileView('list');

    try {
      await removeDocument('tripHistory', tripId);
    } catch (e) {
      console.error("Firestore delete failure on trip:", e);
    }
  };

  // Add event callback from modal
  const handleAddTimelineEvent = (newEvent: TripTimelineEvent) => {
    if (!activeTrip) return;
    const updated = {
      ...activeTrip,
      timeline: [...(activeTrip.timeline || []), newEvent]
    };
    saveTripUpdate(updated);
  };

  // Save delivery point results
  const handleSaveDeliveryPoint = (updatedDp: DeliveryPoint) => {
    if (!activeTrip || !activeTrip.deliveryPoints) return;
    const dps = activeTrip.deliveryPoints.map(dp => dp.id === updatedDp.id ? updatedDp : dp);
    
    // Auto-record a timeline update
    const eventName = updatedDp.status === 'Delivered' 
      ? `Delivery Completed: ${updatedDp.location}` 
      : `${updatedDp.status}: ${updatedDp.location}`;

    const newEvent: TripTimelineEvent = {
      eventName: `[Delivery] ${eventName}`,
      date: updatedDp.date,
      time: updatedDp.deliveryTime || updatedDp.time,
      user: 'Consignee',
      remarks: updatedDp.deliveryRemarks || `Logged delivery proof and digital signature at ${updatedDp.location}.`
    };

    const updatedTrip = {
      ...activeTrip,
      deliveryPoints: dps,
      timeline: [...(activeTrip.timeline || []), newEvent]
    };

    saveTripUpdate(updatedTrip);
  };

  // Add delivery point inline in details
  const handleAddDpInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip || !dpLocation.trim()) return;

    const newDp: DeliveryPoint = {
      id: `DP-${Math.floor(1000 + Math.random() * 9000)}`,
      location: dpLocation.trim(),
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      status: 'Pending'
    };

    const updated = {
      ...activeTrip,
      deliveryPoints: [...(activeTrip.deliveryPoints || []), newDp]
    };

    saveTripUpdate(updated);
    setDpLocation('');
    setIsAddingDeliveryPoint(false);
  };

  const handleRemoveDp = (dpId: string) => {
    if (!activeTrip || !activeTrip.deliveryPoints) return;
    if (!confirm("Are you sure you want to remove this delivery point?")) return;

    const updated = {
      ...activeTrip,
      deliveryPoints: activeTrip.deliveryPoints.filter(dp => dp.id !== dpId)
    };
    saveTripUpdate(updated);
  };

  const handleOpenAssignDriver = (trip: TripHistoryRecord) => {
    setSelectedTripId(trip.tripId);
    setNewDriverName(trip.driverName || trip.driver || '');
    setNewDriverMobile(trip.driverMobile || '');
    setNewSupervisorName(trip.supervisorName || trip.supervisor || '');
    setNewForemanName(trip.foremanName || '');
    setIsAssignDriverOpen(true);
  };

  // Assign Driver Modal Submit
  const handleAssignDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip || !newDriverName.trim()) return;

    const newEvent: TripTimelineEvent = {
      eventName: '[Personnel] Crew Assignments Updated',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      user: vehicle.supervisorName || 'System',
      remarks: `Updated crew on Trip ID ${activeTrip.tripId}. Driver: ${newDriverName.trim()} (${newDriverMobile.trim() || 'N/A'}). Supervisor: ${newSupervisorName.trim() || 'N/A'}. Foreman: ${newForemanName.trim() || 'N/A'}.`
    };

    const updated = {
      ...activeTrip,
      driver: newDriverName.trim(),
      driverName: newDriverName.trim(),
      driverMobile: newDriverMobile.trim() || undefined,
      supervisor: newSupervisorName.trim() || undefined,
      supervisorName: newSupervisorName.trim() || undefined,
      foremanName: newForemanName.trim() || undefined,
      timeline: [...(activeTrip.timeline || []), newEvent]
    };

    saveTripUpdate(updated);
    setIsAssignDriverOpen(false);
    setNewDriverName('');
    setNewDriverMobile('');
    setNewSupervisorName('');
    setNewForemanName('');
  };

  // Update Location Modal Submit
  const handleUpdateLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip || !updateLocText.trim()) return;

    const newEvent: TripTimelineEvent = {
      eventName: `[Location] Reached ${updateLocText.trim()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      user: 'Driver',
      remarks: `Manual current location pinged by driver.`
    };

    const updated = {
      ...activeTrip,
      timeline: [...(activeTrip.timeline || []), newEvent]
    };

    saveTripUpdate(updated);
    setIsUpdateLocationOpen(false);
    setUpdateLocText('');
  };

  // Share via WhatsApp trigger
  const handleWhatsAppShare = (trip: TripHistoryRecord) => {
    const text = `*SL FLEET DISPATCH - TRIP UPDATE*\n` +
      `---------------------------------\n` +
      `*Trip ID:* ${trip.tripId}\n` +
      `*Vehicle:* ${trip.vehicleNumber}\n` +
      `*Route:* ${trip.fromLocation} ➔ ${trip.toLocation}\n` +
      `*Driver:* ${trip.driver}\n` +
      `*Smart Status:* ${trip.status}\n` +
      `*Remarks:* ${trip.remarks || 'No remarks.'}\n` +
      `---------------------------------`;
    
    // Copy to Clipboard
    navigator.clipboard.writeText(text);
    alert("WhatsApp dispatch message summary copied to clipboard! Opening WhatsApp share link...");
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Generate detailed print/PDF
  const handlePrintPDF = (trip: TripHistoryRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const timelineHtml = getUnifiedTimeline(trip).map(ev => `
      <div class="timeline-item">
        <div class="timeline-time">${ev.date} ${ev.time}</div>
        <div class="timeline-details">
          <strong>${ev.title}</strong> (${ev.user})
          ${ev.remarks ? `<p class="remarks">${ev.remarks}</p>` : ''}
        </div>
      </div>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Fleet Dispatch Report - ${trip.tripId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            h1 { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 5px; }
            .header { border-b: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
            .badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase; display: inline-block; }
            .Completed { bg-color: #dcfce7; color: #15803d; }
            .Running { bg-color: #dbeafe; color: #1e40af; }
            .Scheduled { bg-color: #f1f5f9; color: #334155; }
            .Cancelled { bg-color: #fee2e2; color: #b91c1c; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; background: #fafafa; }
            .card h3 { margin-top: 0; font-size: 13px; text-transform: uppercase; color: #64748b; tracking-wider: 0.05em; }
            .timeline-item { border-left: 2px solid #3b82f6; padding-left: 15px; margin-bottom: 15px; position: relative; }
            .timeline-time { font-size: 11px; color: #94a3b8; font-weight: bold; }
            .remarks { font-size: 11px; color: #475569; margin: 4px 0 0 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SL FLEET DISPATCH ENTERPRISE REPORT</h1>
            <div>Generated on ${new Date().toLocaleDateString()} &nbsp;|&nbsp; <strong>Trip ID:</strong> ${trip.tripId}</div>
          </div>
          <div class="grid">
            <div class="card">
              <h3>Trip details</h3>
              <div><strong>Vehicle:</strong> ${trip.vehicleNumber}</div>
              <div><strong>Driver:</strong> ${trip.driver}</div>
              <div><strong>Route:</strong> ${trip.fromLocation} &rarr; ${trip.toLocation}</div>
              <div><strong>Current Smart Status:</strong> <span class="badge ${trip.status}">${trip.status}</span></div>
            </div>
            <div class="card">
              <h3>Unloading delivery points</h3>
              ${(trip.deliveryPoints || []).map(dp => `
                <div style="margin-bottom: 10px;">
                  <strong>${dp.location}</strong> - <span class="badge ${dp.status}">${dp.status}</span>
                  ${dp.receiverName ? `<div style="font-size: 11px; color: #64748b;">Rcvr: ${dp.receiverName} (${dp.receiverMobile || ''})</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
          <h2>Unified Chronological Timeline</h2>
          <div style="margin-top: 20px;">
            ${timelineHtml}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // 5. UNIFIED CHRONOLOGICAL TIMELINE GENERATOR
  const getUnifiedTimeline = (trip: TripHistoryRecord) => {
    const list: Array<{
      id: string;
      title: string;
      date: string;
      time: string;
      user: string;
      remarks?: string;
      icon: 'Created' | 'Driver' | 'Location' | 'Delivery' | 'Fuel' | 'Tyre' | 'Repair' | 'Completed' | 'Cancelled' | 'Custom' | 'Skipped';
    }> = [];

    // Trip Creation Baseline
    list.push({
      id: 'created',
      title: 'Trip Dispatched / Created',
      date: trip.createdAt.split('T')[0] || trip.startDate || new Date().toISOString().split('T')[0],
      time: trip.createdAt.split('T')[1]?.substring(0, 5) || '08:00',
      user: trip.supervisor || 'System',
      remarks: `Dispatch route scheduled: ${trip.fromLocation} to ${trip.toLocation}. Starting odometer: ${trip.currentOdometer || 0} km.`,
      icon: 'Created'
    });

    // Custom events
    (trip.timeline || []).forEach((ev, i) => {
      let icon: any = 'Custom';
      const name = ev.eventName.toLowerCase();
      if (name.includes('fuel')) icon = 'Fuel';
      else if (name.includes('puncture') || name.includes('tyre') || name.includes('tire')) icon = 'Tyre';
      else if (name.includes('breakdown') || name.includes('repair') || name.includes('mechanic')) icon = 'Repair';
      else if (name.includes('dispatched')) icon = 'Location';
      else if (name.includes('driver') || name.includes('crew')) icon = 'Driver';
      else if (name.includes('completed') || name.includes('closed')) icon = 'Completed';
      else if (name.includes('cancel')) icon = 'Cancelled';

      list.push({
        id: `ev-${i}`,
        title: ev.eventName,
        date: ev.date,
        time: ev.time,
        user: ev.user || 'Supervisor',
        remarks: ev.remarks,
        icon
      });
    });

    // Delivery point logs
    (trip.deliveryPoints || []).forEach((dp) => {
      if (dp.status === 'Delivered') {
        list.push({
          id: `dp-del-${dp.id}`,
          title: `Cargo Delivered • ${dp.location}`,
          date: dp.date,
          time: dp.deliveryTime || dp.time,
          user: 'Consignee',
          remarks: `Invoice: ${dp.invoiceNumber || 'N/A'}. POD: ${dp.podNumber || 'N/A'}. Receiver: ${dp.receiverName || 'N/A'} (${dp.receiverMobile || 'N/A'}). GPS: ${dp.gpsLocation || 'N/A'}. Remarks: ${dp.deliveryRemarks || dp.remarks || 'None.'}`,
          icon: 'Delivery'
        });
      } else if (dp.status === 'Reached') {
        list.push({
          id: `dp-reach-${dp.id}`,
          title: `Arrived at Terminal • ${dp.location}`,
          date: dp.date,
          time: dp.deliveryTime || dp.time,
          user: 'Driver',
          remarks: `GPS Lat/Long Coordinates: ${dp.gpsLocation || 'N/A'}. Ready for unloading.`,
          icon: 'Location'
        });
      } else if (dp.status === 'Skipped') {
        list.push({
          id: `dp-skip-${dp.id}`,
          title: `Bypassed Delivery Point • ${dp.location}`,
          date: dp.date,
          time: dp.deliveryTime || dp.time,
          user: 'Supervisor',
          remarks: `Point bypassed. Reason/Remarks: ${dp.deliveryRemarks || dp.remarks || 'None.'}`,
          icon: 'Skipped'
        });
      }
    });

    // Sort ascending
    list.sort((a, b) => {
      const timeA = `${a.date}T${a.time}`;
      const timeB = `${b.date}T${b.time}`;
      return new Date(timeA).getTime() - new Date(timeB).getTime();
    });

    return list;
  };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-40 flex flex-col h-full animate-in fade-in duration-200">
      
      {/* 1. COMPACT FIXED HEADER */}
      <header className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-blue-600/10 p-2 rounded-xl text-blue-600 flex items-center justify-center shrink-0">
            <Truck size={18} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Enterprise Fleet Dispatch: {vehicle.truckNumber}
            </h2>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              {vehicle.manufacturer || 'Heavy Cargo Transit'} • Driver: {vehicle.driverName || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNewTrip}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} className="stroke-[2.5]" />
            New Trip
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition"
          >
            <X size={18} className="stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* 2. BODY WORKSPACE SPLIT PANELS */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* LEFT PANEL: FILTERS + DISPATCH LIST */}
        <aside className={`${
          activeMobileView === 'list' ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-[350px] lg:w-[380px] shrink-0 border-r border-slate-200 bg-white h-full overflow-hidden`}>
          
          {/* SEARCH & FILTERS CONTROLS */}
          <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Trips (Driver, Route, Invoice...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-semibold pl-9 pr-4 py-2 rounded-xl border border-slate-200/80 focus:border-blue-400 focus:outline-none transition"
              />
            </div>

            {/* Quick Filter Categories Chips */}
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar select-none">
              {(['All', 'Scheduled', 'Running', 'Completed', 'Cancelled', 'Delayed'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setChipFilter(cat)}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase shrink-0 transition border cursor-pointer ${
                    chipFilter === cat
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* TRIPS LIST */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {vehicleTrips.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-bold space-y-1">
                <Truck size={32} className="mx-auto text-slate-200" />
                <p>No dispatch records found</p>
                <p className="text-[10px] font-medium text-slate-350">Try adjusting your filters or create a new trip</p>
              </div>
            ) : (
              vehicleTrips.map(trip => {
                const isSelected = activeTrip?.tripId === trip.tripId;
                const dateStr = trip.startDate ? new Date(trip.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'No Date';
                
                return (
                  <div
                    key={trip.tripId}
                    onClick={() => handleSelectTrip(trip.tripId)}
                    className={`p-3.5 rounded-xl cursor-pointer transition flex justify-between items-start mb-1.5 ${
                      isSelected 
                        ? 'bg-blue-50/50 border border-blue-200/60 shadow-xs' 
                        : 'border border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-slate-400 font-mono">
                          {trip.tripId}
                        </span>
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                          trip.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                          trip.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                          ['Running', 'Partial Delivery', 'Final Delivery'].includes(trip.status) ? 'bg-blue-50 text-blue-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-extrabold text-slate-700 truncate uppercase">
                        {trip.fromLocation} ➔ {trip.toLocation}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">
                        Dr: {trip.driver} {trip.party ? `| ${trip.party}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[9px] font-extrabold text-slate-400 font-mono">
                        {dateStr}
                      </span>
                      {/* Action trigger menu inside card */}
                      <TripActionsMenu
                        trip={trip}
                        onEdit={() => { setSelectedTripId(trip.tripId); setIsEditTripOpen(true); }}
                        onAssignDriver={() => handleOpenAssignDriver(trip)}
                        onUpdateLocation={() => { setSelectedTripId(trip.tripId); setIsUpdateLocationOpen(true); }}
                        onAddEvent={() => { setSelectedTripId(trip.tripId); setIsAddEventOpen(true); }}
                        onUploadPOD={() => { setSelectedTripId(trip.tripId); if (trip.deliveryPoints?.[0]) { setActiveDpToLog(trip.deliveryPoints[0]); setIsLogDeliveryOpen(true); } else { alert("Please add an unloading point first."); } }}
                        onUploadDocs={() => { setSelectedTripId(trip.tripId); }}
                        onGeneratePDF={() => handlePrintPDF(trip)}
                        onWhatsAppShare={() => handleWhatsAppShare(trip)}
                        onDuplicate={() => handleDuplicateTrip(trip)}
                        onComplete={() => {
                          const updated = {
                            ...trip,
                            status: 'Completed' as const,
                            endDate: new Date().toISOString().split('T')[0],
                            timeline: [...(trip.timeline || []), {
                              eventName: 'Trip Completed',
                              date: new Date().toISOString().split('T')[0],
                              time: new Date().toTimeString().substring(0, 5),
                              user: vehicle.supervisorName || 'System',
                              remarks: 'Trip successfully closed by supervisor.'
                            }]
                          };
                          saveTripUpdate(updated);
                        }}
                        onCancel={() => {
                          const updated = {
                            ...trip,
                            status: 'Cancelled' as const,
                            timeline: [...(trip.timeline || []), {
                              eventName: 'Trip Cancelled',
                              date: new Date().toISOString().split('T')[0],
                              time: new Date().toTimeString().substring(0, 5),
                              user: vehicle.supervisorName || 'System',
                              remarks: 'Trip cancelled.'
                            }]
                          };
                          saveTripUpdate(updated);
                        }}
                        onDelete={() => handleDeleteTrip(trip.tripId)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT PANEL: TRIP DETAILED DISPATCH WORKSPACE */}
        <main className={`${
          activeMobileView === 'details' ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col h-full overflow-hidden bg-slate-50/60 pb-0`}>
          
          {activeTrip ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Detailed Header Control / Title bar with Back button on mobile */}
              <div className="px-5 py-3.5 bg-white border-b border-slate-200/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setActiveMobileView('list')}
                    className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="min-w-0">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">
                      Active Dispatch Workspace • {activeTrip.tripId}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase truncate">
                      {activeTrip.fromLocation} ➔ {activeTrip.toLocation}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    activeTrip.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    activeTrip.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    Status: {activeTrip.status}
                  </span>
                </div>
              </div>

              {/* DETAILS WRAPPER - SINGLE STREAM FLOW (NO NESTED SCROLLING) */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                
                {/* 1. PROGRESS BAR / LIVE ROUTE STEPS */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-3.5">
                    Live Progress Tracker
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 select-none">
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      Pickup ✔
                    </span>
                    {(activeTrip.deliveryPoints || []).map((dp, idx) => (
                      <React.Fragment key={dp.id}>
                        <span className="text-slate-300">➔</span>
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                          dp.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                          dp.status === 'Reached' ? 'bg-blue-50 text-blue-600' :
                          dp.status === 'Skipped' ? 'bg-slate-100 text-slate-400 line-through' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {dp.location} {
                            dp.status === 'Delivered' ? '✔' :
                            dp.status === 'Reached' ? '⏳' :
                            dp.status === 'Skipped' ? '✖' : '⏳'
                          }
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* 2. DRIVER INTEGRATION PANEL */}
                <TripDriverPanel trip={activeTrip} />

                {/* 3. MULTI-POINT UNLOADING TERMINALS */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Intermediate Unloading points
                      </span>
                      <h3 className="text-sm font-bold text-slate-800">
                        Multi-Point Delivery Logs
                      </h3>
                    </div>
                    
                    {!isAddingDeliveryPoint && (
                      <button
                        onClick={() => setIsAddingDeliveryPoint(true)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-extrabold uppercase transition"
                      >
                        + Add Point
                      </button>
                    )}
                  </div>

                  {/* Inline Form to Add Delivery Point */}
                  {isAddingDeliveryPoint && (
                    <form onSubmit={handleAddDpInline} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                          New Unloading Point
                        </span>
                        <button onClick={() => setIsAddingDeliveryPoint(false)} className="text-xs font-bold text-red-500 hover:underline">
                          Cancel
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Jaipur Warehouse"
                          value={dpLocation}
                          onChange={(e) => setDpLocation(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                        />
                        <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-extrabold rounded-lg text-xs uppercase shadow-sm">
                          Save
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Delivery points List */}
                  <div className="divide-y divide-slate-100">
                    {(!activeTrip.deliveryPoints || activeTrip.deliveryPoints.length === 0) ? (
                      <div className="py-4 text-center text-xs text-slate-400 font-semibold">
                        No intermediate unloading points added.
                      </div>
                    ) : (
                      activeTrip.deliveryPoints.map((dp, index) => (
                        <div key={dp.id} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                              <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 h-5 w-5 rounded-full flex items-center justify-center font-mono">
                                {index + 1}
                              </span>
                              {dp.location}
                            </h4>
                            
                            {dp.receiverName ? (
                              <div className="text-[10px] text-slate-400 font-bold grid grid-cols-2 gap-x-4 gap-y-0.5 max-w-md">
                                <div>Receiver: <span className="text-slate-600 font-semibold">{dp.receiverName}</span></div>
                                <div>Invoice: <span className="text-slate-600 font-mono">{dp.invoiceNumber || 'N/A'}</span></div>
                                <div>POD: <span className="text-slate-600 font-mono">{dp.podNumber || 'N/A'}</span></div>
                                <div>GPS: <span className="text-slate-600 font-mono">{dp.gpsLocation || 'N/A'}</span></div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 font-medium">Pending consignee verification and signature.</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                              dp.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              dp.status === 'Reached' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                              dp.status === 'Skipped' ? 'bg-slate-100 text-slate-500' :
                              'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                              {dp.status}
                            </span>

                            <button
                              onClick={() => { setActiveDpToLog(dp); setIsLogDeliveryOpen(true); }}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-extrabold uppercase transition cursor-pointer"
                            >
                              Log Log
                            </button>
                            
                            <button
                              onClick={() => handleRemoveDp(dp.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                              title="Delete point"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. CHRONOLOGICAL TIMELINE */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Chronological Ledger
                      </span>
                      <h3 className="text-sm font-bold text-slate-800">
                        Auto-Generated Dispatch Timeline
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsAddEventOpen(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-extrabold uppercase transition cursor-pointer"
                    >
                      + Add Event
                    </button>
                  </div>

                  <div className="relative border-l border-slate-200 pl-4 space-y-5 py-2 ml-2">
                    {getUnifiedTimeline(activeTrip).map((item) => (
                      <div key={item.id} className="relative group">
                        {/* Bullet Icon marker */}
                        <div className="absolute -left-[23px] top-0.5 bg-white border border-blue-500 h-3 w-3 rounded-full flex items-center justify-center">
                          <div className="h-1 w-1 bg-blue-500 rounded-full" />
                        </div>
                        
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-extrabold text-slate-400 font-mono">
                              {item.date} {item.time}
                            </span>
                            <span className="text-[9px] font-bold text-blue-600 px-1.5 py-0.5 bg-blue-50/50 rounded uppercase tracking-wider">
                              {item.user}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800">
                            {item.title}
                          </h4>
                          {item.remarks && (
                            <p className="text-[10px] text-slate-500 font-medium bg-slate-50/50 p-2 rounded-lg border border-slate-100/50 max-w-2xl">
                              {item.remarks}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. DOCUMENTS STORAGE SECTION */}
                <TripDocumentsSection
                  trip={activeTrip}
                  onUpdateDocuments={(docs) => {
                    const updated = {
                      ...activeTrip,
                      documents: docs
                    };
                    saveTripUpdate(updated);
                  }}
                />

              </div>

              {/* 3. STICKY QUICK ACTION BAR (At Bottom of Details) */}
              <div className="bg-white border-t border-slate-200/80 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 shrink-0 sticky bottom-0 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                <div className="grid grid-cols-3 gap-2 w-full sm:flex sm:w-auto">
                  <button
                    onClick={() => setIsEditTripOpen(true)}
                    className="h-11 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => setIsUpdateLocationOpen(true)}
                    className="h-11 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                  >
                    <MapPin size={14} />
                    Location
                  </button>
                  <button
                    onClick={() => setIsAddEventOpen(true)}
                    className="h-11 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                  >
                    <Plus size={14} />
                    Event
                  </button>
                </div>

                <div className={`grid gap-2 w-full ${activeTrip.status !== 'Completed' ? 'grid-cols-2' : 'grid-cols-1'} sm:flex sm:w-auto`}>
                  <button
                    onClick={() => handleWhatsAppShare(activeTrip)}
                    className="h-11 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                  >
                    <Share2 size={14} />
                    Share
                  </button>
                  
                  {activeTrip.status !== 'Completed' && (
                    <button
                      onClick={() => {
                        const updated = {
                          ...activeTrip,
                          status: 'Completed' as const,
                          endDate: new Date().toISOString().split('T')[0],
                          timeline: [...(activeTrip.timeline || []), {
                            eventName: 'Trip Completed',
                            date: new Date().toISOString().split('T')[0],
                            time: new Date().toTimeString().substring(0, 5),
                            user: vehicle.supervisorName || 'System',
                            remarks: 'Trip closed at terminal warehouse.'
                          }]
                        };
                        saveTripUpdate(updated);
                      }}
                      className="h-11 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
                    >
                      Complete Trip
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <Truck size={48} className="text-slate-200 animate-pulse" />
              <p className="text-xs font-bold">Select a Trip Dispatch Record</p>
              <p className="text-[10px]">Choose from the left-hand panel or create a new scheduled route</p>
            </div>
          )}
        </main>
      </div>

      {/* 3. EXTRA MODAL POPUPS INTEGRATION */}
      
      {/* Edit Trip Modal */}
      {isEditTripOpen && activeTrip && (
        <TripEditModal
          trip={activeTrip}
          isOpen={isEditTripOpen}
          onClose={() => setIsEditTripOpen(false)}
          onSave={(updated) => saveTripUpdate(updated)}
        />
      )}

      {/* Create New Trip Modal */}
      {isCreateTripOpen && (
        <TripCreateModal
          vehicle={vehicle}
          isOpen={isCreateTripOpen}
          onClose={() => setIsCreateTripOpen(false)}
          onCreate={handleCreateTripSubmit}
        />
      )}

      {/* Add Custom Event Modal */}
      {isAddEventOpen && activeTrip && (
        <TripAddEventModal
          trip={activeTrip}
          isOpen={isAddEventOpen}
          onClose={() => setIsAddEventOpen(false)}
          onAddEvent={handleAddTimelineEvent}
          supervisorName={vehicle.supervisorName}
        />
      )}

      {/* Log delivery point / Upload Proof and Sign Canvas Modal */}
      {isLogDeliveryOpen && activeTrip && activeDpToLog && (
        <TripLogDeliveryModal
          trip={activeTrip}
          dpPoint={activeDpToLog}
          isOpen={isLogDeliveryOpen}
          onClose={() => { setIsLogDeliveryOpen(false); setActiveDpToLog(null); }}
          onSaveDelivery={handleSaveDeliveryPoint}
        />
      )}

      {/* Quick Change Driver Modal */}
      {isAssignDriverOpen && activeTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assign / Change Crew & Dispatch
              </h3>
              <button onClick={() => setIsAssignDriverOpen(false)} className="text-slate-400">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleAssignDriverSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Driver Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gurpreet Singh"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Driver Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={newDriverMobile}
                  onChange={(e) => setNewDriverMobile(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vijay"
                  value={newSupervisorName}
                  onChange={(e) => setNewSupervisorName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Foreman Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sachin"
                  value={newForemanName}
                  onChange={(e) => setNewForemanName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setIsAssignDriverOpen(false)} className="px-4 py-1.5 bg-slate-100 rounded-lg text-xs font-bold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer">
                  Save Assignments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Update Current Location Modal */}
      {isUpdateLocationOpen && activeTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Update Current Location Ping
              </h3>
              <button onClick={() => setIsUpdateLocationOpen(false)} className="text-slate-400">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleUpdateLocationSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Current City / Checkpoint Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ambala Toll Gate"
                  value={updateLocText}
                  onChange={(e) => setUpdateLocText(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsUpdateLocationOpen(false)} className="px-4 py-1.5 bg-slate-100 rounded-lg text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs">
                  Log Location Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
