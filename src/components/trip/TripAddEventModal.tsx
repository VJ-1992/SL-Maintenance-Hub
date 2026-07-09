import React, { useState } from 'react';
import { X, Check, Clipboard } from 'lucide-react';
import { TripHistoryRecord, TripTimelineEvent } from '../../types';

interface TripAddEventModalProps {
  trip: TripHistoryRecord;
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (newEvent: TripTimelineEvent) => void;
  supervisorName?: string;
}

const QUICK_TEMPLATES = [
  { label: 'Fuel Filled', category: 'Operational', text: 'Refueled 200 Litres at HP Petrol Pump.' },
  { label: 'Tyre Puncture', category: 'Maintenance', text: 'Tyre puncture detected on Rear-Left Inner.' },
  { label: 'Breakdown', category: 'Maintenance', text: 'Mechanical breakdown. Waiting for technician.' },
  { label: 'Repair Completed', category: 'Maintenance', text: 'Minor repairs completed. Vehicle cleared.' },
  { label: 'Crew Change', category: 'Personnel', text: 'Driver shift transition complete.' },
  { label: 'Police Check', category: 'Compliance', text: 'State border regulatory police checking completed.' },
  { label: 'Loading Started', category: 'Loading', text: 'Cargo loading initiated at primary warehouse.' },
  { label: 'Loading Completed', category: 'Loading', text: 'Cargo securely loaded. Documents received.' },
  { label: 'Reached Delivery Point', category: 'Delivery', text: 'Vehicle reached unloading destination.' },
  { label: 'Delivery Completed', category: 'Delivery', text: 'Consignment unloaded. Signed copy received.' },
  { label: 'Reached Destination', category: 'Delivery', text: 'Arrived safely at ultimate terminal.' },
  { label: 'Trip Closed', category: 'Operational', text: 'Trip closed by supervisor. Invoicing ready.' }
];

export default function TripAddEventModal({
  trip,
  isOpen,
  onClose,
  onAddEvent,
  supervisorName = 'Supervisor'
}: TripAddEventModalProps) {
  const [eventName, setEventName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [category, setCategory] = useState('Operational');

  if (!isOpen) return null;

  const handleTemplateClick = (title: string, cat: string, text: string) => {
    setEventName(title);
    setCategory(cat);
    setRemarks(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const eventObj: TripTimelineEvent = {
      eventName: `[${category}] ${eventName.trim()}`,
      date: today,
      time,
      user: supervisorName,
      remarks: remarks.trim() || 'Logged manually by supervisor.'
    };

    onAddEvent(eventObj);
    
    // Clear state & close
    setEventName('');
    setRemarks('');
    setCategory('Operational');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
      {/* Centered Modal Desktop / Bottom Sheet Mobile */}
      <div 
        className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Trip ID: {trip.tripId}
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Log Custom Event / Update Status
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content - Naturally scrollable */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Quick templates chips */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Quick Event Templates (Tap to Fill)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.label}
                  type="button"
                  onClick={() => handleTemplateClick(tmpl.label, tmpl.category, tmpl.text)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold transition-all duration-150 border uppercase cursor-pointer ${
                    eventName === tmpl.label
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Event Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                >
                  <option value="Operational">Operational Update</option>
                  <option value="Maintenance">Maintenance / Repair</option>
                  <option value="Compliance">Compliance Check</option>
                  <option value="Loading">Cargo Loading / Unloading</option>
                  <option value="Delivery">Consignment Delivery</option>
                  <option value="Personnel">Crew / Driver Transition</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fuel Filled"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Event Description & Remarks
              </label>
              <textarea
                placeholder="Describe details: location, quantity, receipts, delay reasons..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer"
              >
                Save Event & Notify
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
