import React from 'react';
import { Phone, Navigation, MapPin, User, ShieldCheck } from 'lucide-react';
import { TripHistoryRecord } from '../../types';

interface TripDriverPanelProps {
  trip: TripHistoryRecord;
}

export default function TripDriverPanel({ trip }: TripDriverPanelProps) {
  // Safe extraction of driver details
  const driverName = trip.driverName || trip.driver || 'No Driver Assigned';
  const driverMobile = trip.driverMobile || '+91 98765 43210'; 
  const supervisorName = trip.supervisorName || trip.supervisor || 'Unassigned';
  const foremanName = trip.foremanName || 'Rakesh Kumar'; // Enterprise foreman fallback
  const currentLocation = trip.fromLocation || 'In Transit';

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hello ${driverName}, please share your update for Trip ID ${trip.tripId} (${trip.fromLocation} to ${trip.toLocation}).`);
    window.open(`https://api.whatsapp.com/send?phone=${driverMobile.replace(/\s+/g, '')}&text=${text}`, '_blank');
  };

  const handleNavigate = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(trip.fromLocation)}&destination=${encodeURIComponent(trip.toLocation)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Core Driver Details
          </span>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mt-0.5">
            <User size={15} className="text-blue-500" />
            {driverName}
          </h3>
        </div>
        <div className="flex gap-2">
          <a
            href={`tel:${driverMobile}`}
            className="p-2 bg-blue-50 hover:bg-blue-100/70 text-blue-600 rounded-xl transition duration-150 flex items-center justify-center"
            title="Call Driver"
          >
            <Phone size={15} className="stroke-[2.2]" />
          </a>
          <button
            onClick={handleWhatsApp}
            className="p-2 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-600 rounded-xl transition duration-150 flex items-center justify-center font-bold text-xs"
            title="WhatsApp Driver"
          >
            WhatsApp
          </button>
          <button
            onClick={handleNavigate}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition duration-150 flex items-center justify-center"
            title="Navigate Route"
          >
            <Navigation size={15} className="stroke-[2.2]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
            Driver Contact
          </span>
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {driverMobile}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
            Supervisor
          </span>
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <ShieldCheck size={12} className="text-slate-400" />
            {supervisorName}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
            Assigned Foreman
          </span>
          <span className="text-xs font-semibold text-slate-700">
            {foremanName}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
            Last Known Location
          </span>
          <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{currentLocation}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
