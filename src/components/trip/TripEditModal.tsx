import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TripHistoryRecord } from '../../types';

interface TripEditModalProps {
  trip: TripHistoryRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTrip: TripHistoryRecord) => void;
}

export default function TripEditModal({
  trip,
  isOpen,
  onClose,
  onSave
}: TripEditModalProps) {
  const [fromLocation, setFromLocation] = useState(trip.fromLocation);
  const [toLocation, setToLocation] = useState(trip.toLocation);
  const [driver, setDriver] = useState(trip.driver);
  const [driverMobile, setDriverMobile] = useState(trip.driverMobile || '');
  const [supervisorName, setSupervisorName] = useState(trip.supervisorName || trip.supervisor || '');
  const [foremanName, setForemanName] = useState(trip.foremanName || '');
  const [party, setParty] = useState(trip.party || '');
  const [startDate, setStartDate] = useState(trip.startDate || '');
  const [endDate, setEndDate] = useState(trip.endDate || '');
  const [currentOdometer, setCurrentOdometer] = useState(trip.currentOdometer || 0);
  const [endingOdometer, setEndingOdometer] = useState(trip.endingOdometer || 0);
  const [remarks, setRemarks] = useState(trip.remarks || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...trip,
      fromLocation,
      toLocation,
      driver,
      driverName: driver,
      driverMobile: driverMobile.trim() || undefined,
      supervisor: supervisorName.trim() || undefined,
      supervisorName: supervisorName.trim() || undefined,
      foremanName: foremanName.trim() || undefined,
      party: party.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      currentOdometer: Number(currentOdometer) || undefined,
      endingOdometer: Number(endingOdometer) || undefined,
      remarks: remarks.trim() || undefined,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Trip Dispatch Record
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Edit Trip ID: {trip.tripId}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  From (Origin)
                </label>
                <input
                  type="text"
                  required
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  To (Destination)
                </label>
                <input
                  type="text"
                  required
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  required
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Driver Mobile
                </label>
                <input
                  type="text"
                  value={driverMobile}
                  onChange={(e) => setDriverMobile(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Foreman Name
                </label>
                <input
                  type="text"
                  value={foremanName}
                  onChange={(e) => setForemanName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Trip Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Trip End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Start Odometer (km)
                </label>
                <input
                  type="number"
                  value={currentOdometer}
                  onChange={(e) => setCurrentOdometer(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Ending Odometer (km)
                </label>
                <input
                  type="number"
                  value={endingOdometer}
                  onChange={(e) => setEndingOdometer(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Trip Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks about cargo, condition..."
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer animate-none"
              >
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
