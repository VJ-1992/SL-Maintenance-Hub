import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Truck, 
  Play, 
  CheckCircle, 
  Compass, 
  Users, 
  Phone, 
  Search, 
  TrendingUp, 
  Navigation, 
  Calendar, 
  Clock, 
  AlertCircle,
  PlusCircle,
  X,
  Map,
  Layers,
  Activity,
  Check
} from 'lucide-react';
import { Vehicle } from '../types';

interface TripRoute {
  vehicleNo: string;
  driverName: string;
  mobileNumber: string;
  fromCity: string;
  toCity: string;
  startDate: string;
  status: 'Planned' | 'In Transit' | 'Reached Destination' | 'Completed';
  currentLocation: string;
  progressPercent: number; // e.g., 0 to 100
  estimatedArrival: string;
  speedKmph: number;
  cargoType: string;
}

const INITIAL_TRIPS: TripRoute[] = [
  {
    vehicleNo: 'RJ14GR0952',
    driverName: 'Rakesh Yadav',
    mobileNumber: '+91 98290 12345',
    fromCity: 'Panipat, HR',
    toCity: 'Chennai, TN',
    startDate: '2026-06-24',
    status: 'In Transit',
    currentLocation: 'Nagpur, MH',
    progressPercent: 55,
    estimatedArrival: '2026-07-10',
    speedKmph: 52,
    cargoType: 'Industrial Castings'
  },
  {
    vehicleNo: 'RJ14GP0981',
    driverName: 'Karan Johar',
    mobileNumber: '+91 94140 54321',
    fromCity: 'Jaipur, RJ',
    toCity: 'Mumbai, MH',
    startDate: '2026-06-25',
    status: 'Planned',
    currentLocation: 'Jaipur Depot',
    progressPercent: 0,
    estimatedArrival: '2026-07-08',
    speedKmph: 0,
    cargoType: 'Automobile Tyres'
  },
  {
    vehicleNo: 'RJ14GQ0122',
    driverName: 'Baldev Singh',
    mobileNumber: '+91 91145 67890',
    fromCity: 'Delhi NCR',
    toCity: 'Kolkata, WB',
    startDate: '2026-06-21',
    status: 'Reached Destination',
    currentLocation: 'Kolkata Port',
    progressPercent: 100,
    estimatedArrival: 'Completed',
    speedKmph: 0,
    cargoType: 'Steel Coils'
  },
  {
    vehicleNo: 'RJ14GB4511',
    driverName: 'Narender Kumar',
    mobileNumber: '+91 93144 88770',
    fromCity: 'Ludhiana, PB',
    toCity: 'Hyderabad, TS',
    startDate: '2026-06-23',
    status: 'In Transit',
    currentLocation: 'Jhansi, UP',
    progressPercent: 35,
    estimatedArrival: '2026-07-12',
    speedKmph: 48,
    cargoType: 'Textiles'
  }
];

interface LiveTrackingViewProps {
  vehicles: Vehicle[];
  setVehicles?: React.Dispatch<React.SetStateAction<Vehicle[]>>;
}

export default function LiveTrackingView({ vehicles, setVehicles }: LiveTrackingViewProps) {
  const [trips, setTrips] = useState<TripRoute[]>(() => {
    try {
      const stored = localStorage.getItem('sl_trips');
      return stored ? JSON.parse(stored) : INITIAL_TRIPS;
    } catch {
      return INITIAL_TRIPS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTrip, setSelectedTrip] = useState<TripRoute | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for dispatching a new trip
  const [newTripData, setNewTripData] = useState({
    vehicleNo: '',
    driverName: '',
    mobileNumber: '',
    fromCity: '',
    toCity: '',
    startDate: new Date().toISOString().split('T')[0],
    cargoType: '',
    estimatedArrival: ''
  });

  // Keep selected trip updated if trips change
  useEffect(() => {
    if (selectedTrip) {
      const updated = trips.find(t => t.vehicleNo === selectedTrip.vehicleNo);
      if (updated) setSelectedTrip(updated);
    }
  }, [trips]);

  // Save trips to local storage
  useEffect(() => {
    localStorage.setItem('sl_trips', JSON.stringify(trips));
  }, [trips]);

  const handleStatusChange = (vehicleNo: string, newStatus: TripRoute['status']) => {
    setTrips(prev => prev.map(t => {
      if (t.vehicleNo === vehicleNo) {
        let progress = t.progressPercent;
        let speed = t.speedKmph;
        let loc = t.currentLocation;

        if (newStatus === 'Planned') {
          progress = 0;
          speed = 0;
          loc = `${t.fromCity} Depot`;
        } else if (newStatus === 'Reached Destination' || newStatus === 'Completed') {
          progress = 100;
          speed = 0;
          loc = t.toCity;
        } else if (newStatus === 'In Transit') {
          progress = progress === 0 || progress === 100 ? 15 : progress;
          speed = 50;
          loc = `En route near Jhansi`;
        }

        return {
          ...t,
          status: newStatus,
          progressPercent: progress,
          speedKmph: speed,
          currentLocation: loc
        };
      }
      return t;
    }));

    // If vehicles list exists, also sync trip info inside vehicle object
    if (setVehicles) {
      setVehicles(prev => prev.map(v => {
        if (v.truckNumber === vehicleNo) {
          return {
            ...v,
            tripStatus: newStatus
          };
        }
        return v;
      }));
    }
  };

  const handleProgressChange = (vehicleNo: string, value: number) => {
    setTrips(prev => prev.map(t => {
      if (t.vehicleNo === vehicleNo) {
        let status = t.status;
        let loc = t.currentLocation;
        let speed = t.speedKmph;

        if (value === 0) {
          status = 'Planned';
          speed = 0;
          loc = `${t.fromCity} Depot`;
        } else if (value === 100) {
          status = 'Reached Destination';
          speed = 0;
          loc = t.toCity;
        } else {
          status = 'In Transit';
          speed = speed === 0 ? 55 : speed;
          loc = `Interstate Highway Path (${value}% traversed)`;
        }

        return {
          ...t,
          progressPercent: value,
          status,
          currentLocation: loc,
          speedKmph: speed
        };
      }
      return t;
    }));
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripData.vehicleNo || !newTripData.fromCity || !newTripData.toCity || !newTripData.driverName) {
      alert("Please fill in all required fields!");
      return;
    }

    // Check if vehicle is already on a trip
    const vehicleOnTrip = trips.find(t => t.vehicleNo === newTripData.vehicleNo && (t.status === 'In Transit' || t.status === 'Planned'));
    if (vehicleOnTrip) {
      alert(`Vehicle ${newTripData.vehicleNo} is currently active on another trip! Please complete it first.`);
      return;
    }

    const newTrip: TripRoute = {
      vehicleNo: newTripData.vehicleNo,
      driverName: newTripData.driverName,
      mobileNumber: newTripData.mobileNumber || '+91 99999 88888',
      fromCity: newTripData.fromCity,
      toCity: newTripData.toCity,
      startDate: newTripData.startDate,
      status: 'Planned',
      currentLocation: `${newTripData.fromCity} Depot`,
      progressPercent: 0,
      estimatedArrival: newTripData.estimatedArrival || 'TBD',
      speedKmph: 0,
      cargoType: newTripData.cargoType || 'General Freight'
    };

    setTrips(prev => [newTrip, ...prev]);
    setIsModalOpen(false);

    // Sync to vehicle if setVehicles is available
    if (setVehicles) {
      setVehicles(prev => prev.map(v => {
        if (v.truckNumber === newTripData.vehicleNo) {
          return {
            ...v,
            currentTripFrom: newTripData.fromCity,
            currentTripTo: newTripData.toCity,
            tripStartDate: newTripData.startDate,
            tripStatus: 'Planned',
            driverName: newTripData.driverName,
            mobileNumber: newTripData.mobileNumber || v.mobileNumber
          };
        }
        return v;
      }));
    }
  };

  const handleSelectVehicle = (truckNo: string) => {
    const selectedVeh = vehicles.find(v => v.truckNumber === truckNo);
    if (selectedVeh) {
      setNewTripData(prev => ({
        ...prev,
        vehicleNo: truckNo,
        driverName: selectedVeh.driverName || '',
        mobileNumber: selectedVeh.mobileNumber || ''
      }));
    }
  };

  // Filters
  const filteredTrips = trips.filter(t => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesSearch = 
      t.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fromCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.toCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.currentLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const activeDispatches = trips.filter(t => t.status === 'In Transit').length;
  const plannedTrips = trips.filter(t => t.status === 'Planned').length;
  const reachedTrips = trips.filter(t => t.status === 'Reached Destination').length;
  const avgSpeed = trips.filter(t => t.status === 'In Transit').reduce((acc, curr) => acc + curr.speedKmph, 0) / (activeDispatches || 1);

  // Set default selected trip
  useEffect(() => {
    if (filteredTrips.length > 0 && !selectedTrip) {
      setSelectedTrip(filteredTrips[0]);
    }
  }, [filteredTrips]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="text-blue-600 animate-spin-slow" size={24} />
            <span>Active Trip & Fleet Live Tracking</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Monitor real-time interstate trip logistics, progress indexes, transit metrics, and update dispatch orders.
          </p>
        </div>

        <button
          onClick={() => {
            setNewTripData({
              vehicleNo: vehicles[0]?.truckNumber || '',
              driverName: vehicles[0]?.driverName || '',
              mobileNumber: vehicles[0]?.mobileNumber || '',
              fromCity: '',
              toCity: '',
              startDate: new Date().toISOString().split('T')[0],
              cargoType: '',
              estimatedArrival: ''
            });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition shrink-0"
        >
          <PlusCircle size={16} className="stroke-[2.5]" />
          <span>Dispatch New Trip</span>
        </button>
      </div>

      {/* Transit Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Dispatches */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100/50 relative">
            <Truck size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">In Transit</p>
            <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">{activeDispatches} Trucks</p>
          </div>
        </div>

        {/* Planned Trips */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100/50">
            <Play size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Planned / Scheduled</p>
            <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">{plannedTrips} Trips</p>
          </div>
        </div>

        {/* Reached Destinations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/50">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed / Reached</p>
            <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">{reachedTrips} Dispatches</p>
          </div>
        </div>

        {/* Average Speed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600 border border-purple-100/50">
            <Navigation size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Avg Fleet Speed</p>
            <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">{Math.round(avgSpeed)} km/h</p>
          </div>
        </div>
      </div>

      {/* Main Panel - Map Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hand: Active Trip Selector (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers size={16} className="text-slate-400" />
              <span>Active Dispatches Log</span>
            </h3>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-450" size={14} />
                <input
                  type="text"
                  placeholder="Filter by Truck, Driver, City..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-8.5 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Trip Status:</span>
                <div className="flex gap-1.5">
                  {['All', 'In Transit', 'Planned', 'Reached Destination'].map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2 py-0.5 rounded transition text-[10px] ${
                        statusFilter === st 
                          ? 'bg-slate-900 text-white font-bold' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'Reached Destination' ? 'Reached' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trip Rows */}
            <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
              {filteredTrips.length === 0 ? (
                <div className="text-center py-8 text-slate-400 italic text-xs">
                  No matching trips active
                </div>
              ) : (
                filteredTrips.map(trip => (
                  <div
                    key={trip.vehicleNo}
                    onClick={() => setSelectedTrip(trip)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      selectedTrip?.vehicleNo === trip.vehicleNo
                        ? 'bg-blue-50/50 border-blue-200 shadow-sm ring-1 ring-blue-150'
                        : 'bg-white border-slate-150 hover:bg-slate-50/80 hover:border-slate-250'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[11px] bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm">
                          {trip.vehicleNo}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          trip.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          trip.status === 'Planned' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {trip.status}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                        <span>{trip.fromCity}</span>
                        <span className="text-slate-400">➔</span>
                        <span>{trip.toCity}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-450 font-medium">
                        <span className="font-semibold text-slate-600">{trip.driverName}</span>
                        <span>•</span>
                        <span>{trip.cargoType}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {trip.status === 'In Transit' && (
                        <div className="text-xs font-mono font-bold text-blue-600 flex items-center justify-end gap-1">
                          <Activity size={10} className="animate-pulse" />
                          <span>{trip.speedKmph} km/h</span>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono font-semibold mt-1">
                        Progress: {trip.progressPercent}%
                      </div>
                      <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden mt-1.5 ml-auto">
                        <div 
                          className={`h-full ${trip.status === 'Reached Destination' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${trip.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Hand: Visual Transit Path Simulation Card (7 Columns) */}
        <div className="lg:col-span-7">
          {selectedTrip ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between h-full min-h-[460px]">
              {/* Header */}
              <div className="p-4.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm">
                      {selectedTrip.vehicleNo}
                    </span>
                    <span className="text-xs font-bold text-slate-500">Live Tracker Stage</span>
                  </div>
                  <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">
                    {selectedTrip.fromCity} TO {selectedTrip.toCity} • Dispatched {selectedTrip.startDate}
                  </p>
                </div>

                {/* Speed indicator */}
                {selectedTrip.status === 'In Transit' && (
                  <div className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-xl flex items-center space-x-2">
                    <Navigation className="animate-pulse stroke-[2.5]" size={14} />
                    <span className="font-mono font-bold text-xs">{selectedTrip.speedKmph} km/h GPS Speed</span>
                  </div>
                )}
              </div>

              {/* HIGH FIDELITY TRANSIT ROAD SIMULATION (SVG canvas element) */}
              <div className="p-6 bg-slate-950 flex flex-col justify-center items-center relative min-h-[190px] overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>

                {/* Map Grid Labels */}
                <div className="absolute top-3 left-4 text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Map size={10} className="text-blue-500" />
                  <span>GPS Tracking Route: NH-48 / AH-43 Simulator</span>
                </div>

                <div className="absolute bottom-3 right-4 text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                  Ping: <span className="text-emerald-400 font-bold">14ms</span> (Telco: Jio 5G)
                </div>

                {/* Route Path SVG */}
                <div className="w-full max-w-lg relative mt-4">
                  {/* Road Path Line */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full relative">
                    {/* Active Route Colored path */}
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${selectedTrip.progressPercent}%` }}
                    />

                    {/* Source Anchor */}
                    <div className="absolute -left-1 -top-2 w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-md">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                    </div>

                    {/* Destination Anchor */}
                    <div className="absolute -right-1 -top-2 w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-md">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    </div>

                    {/* Moving Truck Pin */}
                    <div 
                      className="absolute -top-6 -translate-x-1/2 transition-all duration-300 flex flex-col items-center"
                      style={{ left: `${selectedTrip.progressPercent}%` }}
                    >
                      {/* Floating location label */}
                      <div className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap mb-1">
                        {selectedTrip.status === 'Planned' ? 'Loading' : 
                         selectedTrip.status === 'Reached Destination' ? 'Reached' : 
                         selectedTrip.currentLocation}
                      </div>

                      {/* Animated Pin */}
                      <div className="bg-blue-500 border border-blue-400 text-white p-1 rounded-full shadow-lg relative">
                        <Truck size={14} className="stroke-[2.5]" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white"></span>
                      </div>
                    </div>
                  </div>

                  {/* Route City Labels */}
                  <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold font-mono">
                    <span className="text-left leading-tight">
                      <strong className="text-white block">{selectedTrip.fromCity}</strong>
                      (Source Depot)
                    </span>
                    <span className="text-right leading-tight">
                      <strong className="text-white block">{selectedTrip.toCity}</strong>
                      (Consignment Destination)
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Action Panel */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/20 space-y-4">
                {/* Information Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Driver Contact</p>
                    <p className="text-slate-800 font-bold mt-1 flex items-center gap-1.5">
                      <Users size={12} className="text-slate-400" />
                      {selectedTrip.driverName}
                    </p>
                    <a href={`tel:${selectedTrip.mobileNumber}`} className="text-blue-600 hover:underline font-mono mt-0.5 inline-block">
                      {selectedTrip.mobileNumber}
                    </a>
                  </div>

                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Cargo & Weight</p>
                    <p className="text-slate-800 font-bold mt-1">
                      {selectedTrip.cargoType}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Approx. 28 Metric Tons</p>
                  </div>

                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Est. Arrival Date</p>
                    <p className="text-slate-800 font-bold mt-1 flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      {selectedTrip.estimatedArrival}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {selectedTrip.status === 'In Transit' ? 'Tracking in real-time' : 'Awaiting start'}
                    </p>
                  </div>
                </div>

                {/* Adjust Progress Slider (Highly Interactive) */}
                {selectedTrip.status !== 'Completed' && (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-2 shadow-xs">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Activity size={12} className="text-blue-500" />
                        <span>Interactive GPS Progress Simulator</span>
                      </span>
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {selectedTrip.progressPercent}% Travelled
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedTrip.progressPercent}
                      onChange={(e) => handleProgressChange(selectedTrip.vehicleNo, Number(e.target.value))}
                      className="w-full accent-blue-600 bg-slate-100 h-2 rounded-lg appearance-none cursor-ew-resize"
                    />

                    <p className="text-[10px] text-slate-450 font-medium">
                      Drag the slider above to simulate cellular location pings along the national highway network.
                    </p>
                  </div>
                )}

                {/* Dispatch Status Controls */}
                <div className="border-t border-slate-100/80 pt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">
                    Update Order Status:
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedTrip.vehicleNo, 'Planned')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                        selectedTrip.status === 'Planned'
                          ? 'bg-amber-500 text-white border-amber-600 shadow'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Hold / Planned
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedTrip.vehicleNo, 'In Transit')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                        selectedTrip.status === 'In Transit'
                          ? 'bg-blue-600 text-white border-blue-700 shadow'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      In Transit
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedTrip.vehicleNo, 'Reached Destination')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                        selectedTrip.status === 'Reached Destination'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Reached Destination
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center p-12 text-center h-full min-h-[460px]">
              <Compass size={48} className="text-slate-300 animate-spin-slow mb-4" />
              <p className="text-base font-bold text-slate-800">No active dispatch selected</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Please select an active dispatch trip from the left sidebar panel to load its route tracking system.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dispatch Order Creation Modal Dialouge */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                Dispatch Order Creation
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleDispatchSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Select Vehicle */}
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Select Vehicle for Dispatch *
                  </label>
                  <select
                    name="vehicleNo"
                    required
                    value={newTripData.vehicleNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewTripData(prev => ({ ...prev, vehicleNo: val }));
                      handleSelectVehicle(val);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 text-sm rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">-- Choose Truck --</option>
                    {vehicles.map(v => (
                      <option key={v.truckNumber} value={v.truckNumber}>
                        {v.truckNumber} ({v.manufacturer} • {v.tyresCount} Whl)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Driver Info */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTripData.driverName}
                    onChange={(e) => setNewTripData(prev => ({ ...prev, driverName: e.target.value }))}
                    placeholder="Rakesh Yadav"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                {/* Driver Phone */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Driver Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTripData.mobileNumber}
                    onChange={(e) => setNewTripData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    placeholder="+91 98290 12345"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* From City */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    From (Source Hub) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTripData.fromCity}
                    onChange={(e) => setNewTripData(prev => ({ ...prev, fromCity: e.target.value }))}
                    placeholder="e.g. Panipat, HR"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                {/* To City */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    To (Destination) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTripData.toCity}
                    onChange={(e) => setNewTripData(prev => ({ ...prev, toCity: e.target.value }))}
                    placeholder="e.g. Chennai, TN"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                {/* Cargo Type */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Cargo Commodity Type
                  </label>
                  <input
                    type="text"
                    value={newTripData.cargoType}
                    onChange={(e) => setNewTripData(prev => ({ ...prev, cargoType: e.target.value }))}
                    placeholder="e.g. Industrial Castings"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                {/* Est Arrival */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Est. Arrival (Date/Days)
                  </label>
                  <input
                    type="text"
                    value={newTripData.estimatedArrival}
                    onChange={(e) => setNewTripData(prev => ({ ...prev, estimatedArrival: e.target.value }))}
                    placeholder="e.g. 2026-07-10 or 3 Days"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition"
                >
                  Confirm Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
