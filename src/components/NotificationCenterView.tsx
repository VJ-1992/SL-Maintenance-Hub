import React, { useState } from 'react';
import { CentralNotification, Vehicle } from '../types';
import { 
  Bell, 
  CheckCircle, 
  ShieldAlert, 
  Calendar, 
  Wrench, 
  FileText, 
  Disc, 
  TrendingDown, 
  X,
  Check,
  AlertTriangle,
  Clock,
  Filter
} from 'lucide-react';

interface NotificationCenterViewProps {
  notifications: CentralNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<CentralNotification[]>>;
  vehicles: Vehicle[];
}

export default function NotificationCenterView({
  notifications,
  setNotifications,
  vehicles
}: NotificationCenterViewProps) {
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [vehicleFilter, setVehicleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Predefined list of notification types for filtering
  const notificationTypes = [
    'All',
    'Service Due',
    'Service Overdue',
    'Insurance Expiry',
    'Fitness Expiry',
    'Permit Expiry',
    'Tyre Replacement Due',
    'Low Tread Depth',
    'Low Air Pressure',
    'Retread Due',
    'Warranty Expiry'
  ];

  // Toggle single notification status as read/unread
  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, isRead: !notif.isRead } : notif
    ));
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  // Clear read notifications
  const handleClearRead = () => {
    if (window.confirm("Are you sure you want to remove all read alerts?")) {
      setNotifications(prev => prev.filter(notif => !notif.isRead));
    }
  };

  // Get icon for specific alert category
  const getAlertIcon = (type: string, severity: string) => {
    const className = severity === 'high' ? 'text-red-500' : severity === 'medium' ? 'text-amber-500' : 'text-blue-500';
    switch (type) {
      case 'Service Due':
      case 'Service Overdue':
        return <Wrench size={18} className={className} />;
      case 'Insurance Expiry':
      case 'Fitness Expiry':
      case 'Permit Expiry':
        return <FileText size={18} className={className} />;
      case 'Tyre Replacement Due':
      case 'Low Tread Depth':
      case 'Low Air Pressure':
      case 'Retread Due':
        return <Disc size={18} className={className} />;
      case 'Warranty Expiry':
        return <Clock size={18} className={className} />;
      default:
        return <Bell size={18} className={className} />;
    }
  };

  // Filtered notifications logic
  const filteredNotifications = notifications.filter(n => {
    const matchesType = typeFilter === 'All' || n.type === typeFilter;
    const matchesVehicle = vehicleFilter === 'All' || n.truckNumber === vehicleFilter;
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.truckNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesVehicle && matchesSearch;
  });

  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-slate-900 bg-clip-text text-transparent dark:text-white tracking-tight">
            Central Notification Center
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Monitor real-time maintenance due events, regulatory compliance, and tyre warranty exspiries.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.every(n => n.isRead)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <Check size={14} />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={handleClearRead}
            disabled={notifications.every(n => !n.isRead)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 text-xs font-bold rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
          >
            <X size={14} />
            <span>Clear Read</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Text Search */}
          <div className="w-full lg:flex-1 relative">
            <Bell className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search alerts by truck no., title, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            {/* Filter by Category */}
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Alert Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 p-2 text-xs rounded-xl font-medium focus:outline-none"
              >
                {notificationTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Filter by Vehicle */}
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Vehicle:</span>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 p-2 text-xs rounded-xl font-mono font-bold focus:outline-none"
              >
                <option value="All">All Trucks</option>
                {vehicles.map(v => (
                  <option key={v.truckNumber} value={v.truckNumber}>{v.truckNumber}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Info stats */}
        <div className="flex flex-wrap gap-2.5 items-center justify-between text-[11px] text-slate-400 font-bold uppercase border-t border-slate-50 pt-3">
          <div className="flex gap-4">
            <span>Filtered Total: <strong className="text-slate-800 font-mono">{filteredNotifications.length}</strong></span>
            <span>Unread: <strong className="text-blue-600 font-mono">{unreadCount}</strong></span>
          </div>
          <div className="flex items-center space-x-1 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Connected to Local Firestore Index</span>
          </div>
        </div>
      </div>

      {/* Notifications Registry List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <CheckCircle size={44} className="mx-auto text-green-500 mb-3" />
          <p className="text-base font-bold text-slate-800">No active alerts match filters</p>
          <p className="text-xs text-slate-500 mt-1">Excellent! All vehicle services and regulatory renewals are up to date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notif => {
            const severityColor = 
              notif.severity === 'high' 
                ? 'border-l-red-500 bg-red-50/20' 
                : notif.severity === 'medium'
                  ? 'border-l-amber-500 bg-amber-50/10'
                  : 'border-l-blue-500 bg-blue-50/5';
            
            return (
              <div
                key={notif.id}
                className={`p-4 bg-white rounded-xl border border-slate-100 border-l-4 shadow-sm flex items-start justify-between gap-4 transition hover:shadow-md ${severityColor} ${notif.isRead ? 'opacity-65' : ''}`}
                id={`notif-card-${notif.id}`}
              >
                <div className="flex gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 mt-0.5 shadow-sm shrink-0">
                    {getAlertIcon(notif.type, notif.severity)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm">
                        {notif.truckNumber}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        notif.severity === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : notif.severity === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {notif.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">
                        {notif.date}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 mt-1.5 text-sm">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl font-medium">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <button
                    onClick={() => handleToggleRead(notif.id)}
                    className={`p-1.5 rounded-lg border transition ${
                      notif.isRead 
                        ? 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600' 
                        : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                    }`}
                    title={notif.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    <Check size={14} className={notif.isRead ? 'stroke-[2.5]' : 'stroke-[3]'} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Point 11: Future Automation Ready Integration Sheet */}
      <div className="bg-slate-900 text-slate-150 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
          <ShieldAlert className="text-blue-400" size={18} />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">
            Point 11: Unified Automation API & Webhook Dispatcher
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          The Preventive Maintenance system is fully architected for instant, automatic multi-channel message dispatching. You can toggle automated notifications via REST triggers below:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* WhatsApp */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">WhatsApp Alerts</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">Ready</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">Dispatches due metrics to drivers & supervisors via Twilio WhatsApp API.</p>
            <div className="text-[10px] bg-slate-900 p-1.5 rounded font-mono text-slate-400 text-center select-all">
              /api/v1/trigger/whatsapp
            </div>
          </div>

          {/* Email */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">Email Alerts</span>
              <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold uppercase">Ready</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">Sends beautiful maintenance HTML summary digests to directors via SendGrid.</p>
            <div className="text-[10px] bg-slate-900 p-1.5 rounded font-mono text-slate-400 text-center select-all">
              /api/v1/trigger/email
            </div>
          </div>

          {/* SMS */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">SMS Alerts</span>
              <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-bold uppercase">Ready</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">Sends urgent SMS triggers to drivers containing workshops addresses and routes.</p>
            <div className="text-[10px] bg-slate-900 p-1.5 rounded font-mono text-slate-400 text-center select-all">
              /api/v1/trigger/sms
            </div>
          </div>

          {/* Mobile Push */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">Mobile Push</span>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase">Ready</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">Triggers real-time alerts to the drivers' custom mobile app via FCM.</p>
            <div className="text-[10px] bg-slate-900 p-1.5 rounded font-mono text-slate-400 text-center select-all">
              /api/v1/trigger/push
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
