import React, { useState, useEffect } from 'react';
import { X, Truck, User, Phone, ShieldCheck, MapPin } from 'lucide-react';
import { Vehicle, TripHistoryRecord } from '../../types';

interface TripCreateModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newTrip: TripHistoryRecord) => void;
}

export default function TripCreateModal({
  vehicle,
  isOpen,
  onClose,
  onCreate
}: TripCreateModalProps) {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverMobile, setDriverMobile] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [foremanName, setForemanName] = useState('');
  const [party, setParty] = useState('');
  const [startDate, setStartDate] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState<number>(0);
  const [remarks, setRemarks] = useState('');

  // Auto-fill values on open from vehicle profile
  useEffect(() => {
    if (isOpen && vehicle) {
      setFromLocation(vehicle.currentTripFrom || 'Ludhiana');
      setToLocation(vehicle.currentTripTo || 'Chennai');
      setDriverName(vehicle.driverName || '');
      setDriverMobile(vehicle.mobileNumber || '');
      setSupervisorName(vehicle.supervisorName || '');
      setForemanName(vehicle.foremanName || '');
      setParty(vehicle.partyName || '');
      setStartDate(new Date().toISOString().split('T')[0]);
      setCurrentOdometer(0);
      setRemarks('');
    }
  }, [isOpen, vehicle]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTripId = `TRIP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTrip: TripHistoryRecord = {
      tripId: newTripId,
      vehicleNumber: vehicle.truckNumber,
      driver: driverName.trim(),
      driverName: driverName.trim(),
      driverMobile: driverMobile.trim(),
      supervisor: supervisorName.trim(),
      supervisorName: supervisorName.trim(),
      foremanName: foremanName.trim(),
      party: party.trim() || undefined,
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      startDate: startDate || new Date().toISOString().split('T')[0],
      status: 'Scheduled',
      currentOdometer: Number(currentOdometer) || undefined,
      remarks: remarks.trim() || undefined,
      timeline: [
        {
          eventName: 'Trip Created & Assigned',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().substring(0, 5),
          user: supervisorName.trim() || 'System',
          remarks: `New route scheduled from ${fromLocation.trim()} to ${toLocation.trim()}.`
        }
      ],
      deliveryPoints: [
        {
          id: `DP-${Math.floor(1000 + Math.random() * 9000)}`,
          location: toLocation.trim(),
          date: startDate || new Date().toISOString().split('T')[0],
          time: '18:00',
          status: 'Pending'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onCreate(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Enterprise Fleet Dispatch
            </span>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Truck size={16} className="text-blue-600" />
              Schedule New Trip (Vehicle: {vehicle.truckNumber})
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition">
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Route Section */}
            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-3">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Route Details
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    From (Origin)
                  </label>
                  <input
                    type="text"
                    required
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    To (Destination)
                  </label>
                  <input
                    type="text"
                    required
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Assignments Section */}
            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-3">
              <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider block">
                Personnel Assignments (Auto-filled from Vehicle Profile)
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User size={11} className="text-slate-400" />
                    Driver Name
                  </label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Phone size={11} className="text-slate-400" />
                    Driver Mobile
                  </label>
                  <input
                    type="text"
                    required
                    value={driverMobile}
                    onChange={(e) => setDriverMobile(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-slate-400" />
                    Supervisor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User size={11} className="text-slate-400" />
                    Foreman Name
                  </label>
                  <input
                    type="text"
                    value={foremanName}
                    onChange={(e) => setForemanName(e.target.value)}
                    placeholder="e.g. Rakesh Kumar"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Logistics & Date Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Party Name
                </label>
                <input
                  type="text"
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  placeholder="e.g. Balaji Logistics"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Trip Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Start Odometer (km)
                </label>
                <input
                  type="number"
                  value={currentOdometer}
                  onChange={(e) => setCurrentOdometer(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                Trip Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks about cargo, load condition, special instructions..."
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
              >
                Schedule & Save Trip
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
