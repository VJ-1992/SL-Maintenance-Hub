import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, AssignmentHistoryRecord } from '../types';
import { 
  X, 
  Search, 
  ArrowLeft, 
  User, 
  Wrench, 
  Users, 
  Clock, 
  Calendar, 
  FileText, 
  AlertCircle,
  Filter
} from 'lucide-react';
import { fetchCollection } from '../services/firebase';

interface AssignmentHistoryModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignmentHistoryModal({
  vehicle,
  isOpen,
  onClose
}: AssignmentHistoryModalProps) {
  const [history, setHistory] = useState<AssignmentHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Driver' | 'Supervisor' | 'Foreman'>('All');

  // Load history records from Firestore
  useEffect(() => {
    if (!isOpen) return;

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const allHistory = await fetchCollection<AssignmentHistoryRecord>('assignmentHistory');
        // Filter history by current vehicle's truckNumber
        const filtered = allHistory.filter(h => h.vehicleId === vehicle.truckNumber);
        // Sort newest first
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setHistory(filtered);
      } catch (err) {
        console.error("Failed to fetch assignment history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [isOpen, vehicle.truckNumber]);

  // Filtered and searched records memo
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesFilter = filterType === 'All' || item.assignmentType === filterType;
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.oldValue.toLowerCase().includes(q) ||
        item.newValue.toLowerCase().includes(q) ||
        item.changedBy.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [history, filterType, searchQuery]);

  if (!isOpen) return null;

  // Render icon based on assignment type
  const getAssignmentIcon = (type: 'Driver' | 'Supervisor' | 'Foreman') => {
    switch (type) {
      case 'Driver':
        return <User size={16} className="text-blue-600" />;
      case 'Supervisor':
        return <Wrench size={16} className="text-emerald-600" />;
      case 'Foreman':
        return <Users size={16} className="text-amber-600" />;
    }
  };

  // Render badge colors based on assignment type
  const getBadgeStyles = (type: 'Driver' | 'Supervisor' | 'Foreman') => {
    switch (type) {
      case 'Driver':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'Supervisor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Foreman':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs md:backdrop-blur-sm animate-fade-in">
      {/* Semi-transparent backdrop for desktop that closes on click */}
      <div 
        className="hidden md:block absolute inset-0" 
        onClick={onClose}
        id="assignment-history-backdrop"
      />

      {/* Drawer Container: Full screen on mobile, right panel on desktop */}
      <div 
        className="relative w-full h-full md:w-[500px] lg:w-[540px] bg-slate-50 shadow-2xl flex flex-col border-l border-slate-100 z-50 animate-slide-in-right overflow-hidden"
        id="assignment-history-container"
      >
        {/* Header Section */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Back button on mobile only */}
            <button 
              onClick={onClose}
              className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-xl text-slate-600 transition"
              id="assignment-history-back-btn"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h3 className="font-bold text-slate-900 text-base md:text-lg" id="assignment-history-title">
                Assignment History
              </h3>
              <p className="text-xs text-slate-400 font-extrabold font-mono uppercase tracking-wider" id="assignment-history-truck-num">
                Vehicle: {vehicle.truckNumber}
              </p>
            </div>
          </div>

          {/* Close button on desktop only */}
          <button 
            onClick={onClose}
            className="hidden md:flex p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition"
            id="assignment-history-close-btn"
          >
            <X size={20} />
          </button>
        </header>

        {/* Filters and Search Workspace Area */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex flex-col gap-3 shrink-0">
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or changed by..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
              id="assignment-history-search-input"
            />
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1" id="assignment-history-type-filters">
            {(['All', 'Driver', 'Supervisor', 'Foreman'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition border shrink-0 ${
                  filterType === type
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id={`assignment-history-filter-${type.toLowerCase()}`}
              >
                {type === 'All' ? 'All Roles' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6" id="assignment-history-timeline-scroll">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold uppercase tracking-wider font-mono">Loading history records...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-100" id="assignment-history-empty-state">
              <AlertCircle size={36} className="text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-800">
                {history.length === 0 
                  ? 'No assignment changes have been recorded.' 
                  : 'No matching history records found.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {history.length === 0 
                  ? 'Changes made to Driver, Supervisor, or Foreman on this vehicle profile will be audited here.'
                  : 'Try adjusting your search criteria or filter type.'}
              </p>
            </div>
          ) : (
            /* Vertical Timeline Audit Log */
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6" id="assignment-history-timeline">
              {filteredHistory.map((item, index) => (
                <div key={item.historyId} className="relative group" id={`timeline-item-${item.historyId}`}>
                  {/* Circular Timeline Indicator */}
                  <span className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 border-white ring-4 ring-slate-100 flex items-center justify-center transition group-hover:scale-115 ${
                    item.assignmentType === 'Driver' ? 'bg-blue-50' : 
                    item.assignmentType === 'Supervisor' ? 'bg-emerald-50' : 'bg-amber-50'
                  }`}>
                    {getAssignmentIcon(item.assignmentType)}
                  </span>

                  {/* Audit Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getBadgeStyles(item.assignmentType)}`}>
                        {item.assignmentType} Assignment
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-1">
                        <Calendar size={10} />
                        {item.date} • {item.time}
                      </span>
                    </div>

                    {/* Left to Right Assignment Change Display */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 my-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Previous Value</p>
                        <p className="font-semibold text-slate-500 truncate" title={item.oldValue}>{item.oldValue || 'None'}</p>
                      </div>
                      <div className="text-slate-400 font-bold text-sm">➔</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-blue-500 font-bold uppercase tracking-wider">New Assigned</p>
                        <p className="font-bold text-slate-800 truncate" title={item.newValue}>{item.newValue || 'None'}</p>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-2 pt-2 border-t border-slate-100/60">
                      <span>Changed By: <span className="text-slate-700">{item.changedBy}</span></span>
                      {item.createdAt && (
                        <span className="font-mono text-slate-350">{new Date(item.createdAt).toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})}</span>
                      )}
                    </div>

                    {/* Change Reason Block */}
                    {item.reason && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100/60 flex items-start gap-1.5 text-[11px] text-slate-550 italic bg-amber-50/20 p-2 rounded-lg border border-amber-100/30">
                        <FileText size={12} className="text-amber-500 shrink-0 mt-0.5" />
                        <span className="font-medium">
                          <strong className="font-bold uppercase tracking-wide text-[9px] text-amber-800 not-italic mr-1.5">Reason:</strong>
                          "{item.reason}"
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
