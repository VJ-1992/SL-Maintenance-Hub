import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit, UserPlus, MapPin, Plus, CheckCircle, FileText, Share2, Copy, Check, XCircle, Trash } from 'lucide-react';
import { TripHistoryRecord } from '../../types';

interface TripActionsMenuProps {
  trip: TripHistoryRecord;
  onEdit: () => void;
  onAssignDriver: () => void;
  onUpdateLocation: () => void;
  onAddEvent: () => void;
  onUploadPOD: () => void;
  onUploadDocs: () => void;
  onGeneratePDF: () => void;
  onWhatsAppShare: () => void;
  onDuplicate: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function TripActionsMenu({
  trip,
  onEdit,
  onAssignDriver,
  onUpdateLocation,
  onAddEvent,
  onUploadPOD,
  onUploadDocs,
  onGeneratePDF,
  onWhatsAppShare,
  onDuplicate,
  onComplete,
  onCancel,
  onDelete
}: TripActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition duration-150 cursor-pointer"
        aria-label="Actions"
      >
        <MoreVertical size={16} className="stroke-[2.2]" />
      </button>

      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div className="md:hidden fixed inset-0 bg-slate-900/10 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100 md:block fixed md:absolute bottom-4 md:bottom-auto left-4 md:left-auto right-4 md:right-0">
            {/* Mobile Header indicator */}
            <div className="md:hidden px-4 py-2 bg-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Trip ID: {trip.tripId} Actions
              </span>
              <button onClick={() => setIsOpen(false)} className="text-xs font-bold text-slate-400">
                Close
              </button>
            </div>

            <div className="py-1">
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onEdit); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition duration-150"
              >
                <Edit size={14} className="text-slate-400" />
                Edit Trip Details
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onAssignDriver); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition duration-150"
              >
                <UserPlus size={14} className="text-slate-400" />
                Assign / Change Driver
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onUpdateLocation); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition duration-150"
              >
                <MapPin size={14} className="text-slate-400" />
                Update Location
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onAddEvent); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition duration-150"
              >
                <Plus size={14} className="text-slate-400" />
                Add Dispatch Event
              </button>
            </div>

            <div className="py-1">
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onUploadPOD); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition duration-150"
              >
                <CheckCircle size={14} className="text-blue-500" />
                Upload POD / Proof
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onUploadDocs); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition duration-150"
              >
                <FileText size={14} className="text-slate-400" />
                LR / Invoice / Documents
              </button>
            </div>

            <div className="py-1">
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onGeneratePDF); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition duration-150"
              >
                <FileText size={14} className="text-slate-400" />
                Generate PDF Report
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onWhatsAppShare); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition duration-150"
              >
                <Share2 size={14} className="text-slate-400" />
                Share via WhatsApp
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onDuplicate); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition duration-150"
              >
                <Copy size={14} className="text-slate-400" />
                Duplicate Trip
              </button>
            </div>

            <div className="py-1">
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onComplete); }}
                className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-xs font-bold text-emerald-600 flex items-center gap-2.5 transition duration-150"
              >
                <Check size={14} className="stroke-[2.5]" />
                Mark as Completed
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onCancel); }}
                className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-xs font-bold text-amber-600 flex items-center gap-2.5 transition duration-150"
              >
                <XCircle size={14} />
                Cancel Trip
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); triggerAction(onDelete); }}
                className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-2.5 transition duration-150"
              >
                <Trash size={14} />
                Delete (Admin Only)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
