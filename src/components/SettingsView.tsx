import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Database, 
  Check, 
  Sliders, 
  Volume2, 
  ShieldCheck, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle, 
  Info,
  Clock,
  Disc,
  AlertTriangle,
  Server
} from 'lucide-react';
import { Vehicle } from '../types';

interface SettingsViewProps {
  vehicles: Vehicle[];
  onSeedDatabase?: () => Promise<void>;
  isSeeding?: boolean;
}

export default function SettingsView({ vehicles, onSeedDatabase, isSeeding = false }: SettingsViewProps) {
  // Load configuration thresholds from localStorage or use defaults
  const [thresholds, setThresholds] = useState(() => {
    try {
      const stored = localStorage.getItem('sl_settings_thresholds');
      return stored ? JSON.parse(stored) : {
        minPsi: 100,
        maxPsi: 125,
        minTreadDepth: 4.5,
        regulatoryLeadDays: 15,
        autoArchiveLogs: true,
        notificationFrequency: 'immediate',
        allowPushNotifications: true,
        backupFrequency: 'weekly'
      };
    } catch {
      return {
        minPsi: 100,
        maxPsi: 125,
        minTreadDepth: 4.5,
        regulatoryLeadDays: 15,
        autoArchiveLogs: true,
        notificationFrequency: 'immediate',
        allowPushNotifications: true,
        backupFrequency: 'weekly'
      };
    }
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'thresholds' | 'notifications' | 'database'>('thresholds');

  useEffect(() => {
    localStorage.setItem('sl_settings_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setThresholds(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : val
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sl_settings_thresholds', JSON.stringify(thresholds));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="text-blue-600 animate-spin-slow" size={24} />
          <span>System Settings & Configuration</span>
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Customize system thresholds, notification preferences, alert lead timers, and manage local database indexes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side Menu (4 columns) */}
        <div className="md:col-span-4 space-y-2">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-sm space-y-1.5">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Settings Categories</h3>

            {/* Threshold Settings */}
            <button
              onClick={() => setActiveTab('thresholds')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'thresholds'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sliders size={16} />
              <span>Safety & Warning Thresholds</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bell size={16} />
              <span>Notification Preferences</span>
            </button>

            {/* User Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User size={16} />
              <span>User Profile Card</span>
            </button>

            {/* Database maintenance */}
            <button
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'database'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Database size={16} />
              <span>Database Maintenance</span>
            </button>
          </div>

          {/* Connected Status Card */}
          <div className="bg-slate-900 text-slate-100 p-4.5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
            <h4 className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Server size={12} />
              <span>Firestore Server Health</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-350">
              <div className="flex justify-between font-mono text-[10px] border-b border-slate-800 pb-1.5">
                <span>Database:</span>
                <span className="text-white font-bold select-all truncate max-w-[120px]">ai-studio-slmaintenancehub-1844193d-b1cc-457d-a254-b6aeb83162d7</span>
              </div>
              <div className="flex justify-between font-mono text-[10px] pt-0.5">
                <span>Active Channels:</span>
                <span className="text-emerald-400 font-bold">10 Live Indices</span>
              </div>
              <div className="flex justify-between font-mono text-[10px] pt-0.5">
                <span>App Version:</span>
                <span className="text-slate-400">v2.5.0-v22</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Settings Pane (8 columns) */}
        <div className="md:col-span-8">
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between h-full min-h-[420px]">
            {/* Tab Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {activeTab === 'thresholds' && "Safety & Alert Threshold Limits"}
                  {activeTab === 'notifications' && "Notification Delivery Triggers"}
                  {activeTab === 'profile' && "Administrator Profile Details"}
                  {activeTab === 'database' && "Database Diagnostics & Restoration"}
                </h3>
                <p className="text-xs text-slate-450 font-bold uppercase tracking-wider mt-0.5">
                  {activeTab === 'thresholds' && "Configures critical warning indicators for Tyres and Permits"}
                  {activeTab === 'notifications' && "Toggle SMS, WhatsApp, and REST Webhook pipelines"}
                  {activeTab === 'profile' && "Verify currently authenticated operator account details"}
                  {activeTab === 'database' && "Synchronize, re-seed, or clear database state references"}
                </p>
              </div>

              {saveSuccess && (
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-bounce">
                  <CheckCircle size={14} />
                  <span>Saved!</span>
                </span>
              )}
            </div>

            {/* Tab Content Body */}
            <div className="p-6 flex-1 space-y-5">
              
              {/* 1. THRESHOLDS CASE */}
              {activeTab === 'thresholds' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PSI Warning Minimum */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 space-y-1.5">
                      <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">
                        Min Tyre Pressure Warning (PSI)
                      </label>
                      <input
                        type="number"
                        name="minPsi"
                        min="50"
                        max="110"
                        value={thresholds.minPsi}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-250 p-2 rounded-lg font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-[10px] text-slate-450">
                        Tyre pressure lower than this triggers "Low Pressure" visual alarm indices.
                      </p>
                    </div>

                    {/* PSI Maximum */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 space-y-1.5">
                      <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">
                        Max Tyre Pressure Warning (PSI)
                      </label>
                      <input
                        type="number"
                        name="maxPsi"
                        min="115"
                        max="140"
                        value={thresholds.maxPsi}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-250 p-2 rounded-lg font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-[10px] text-slate-450">
                        Tyres above this threshold trigger "Overpressurized" alerts. Normal target is 115 PSI.
                      </p>
                    </div>

                    {/* Tread Depth Warning */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 space-y-1.5">
                      <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">
                        Min Tread Depth Limit (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="minTreadDepth"
                        min="1"
                        max="8"
                        value={thresholds.minTreadDepth}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-250 p-2 rounded-lg font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-[10px] text-slate-450">
                        Remaining tread depth lower than this (e.g. 4.5 mm) triggers "Worn-out" replacement warnings.
                      </p>
                    </div>

                    {/* Regulatory Lead Days */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 space-y-1.5">
                      <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">
                        Regulatory Expiry Lead Alert (Days)
                      </label>
                      <input
                        type="number"
                        name="regulatoryLeadDays"
                        min="5"
                        max="60"
                        value={thresholds.regulatoryLeadDays}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-250 p-2 rounded-lg font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-[10px] text-slate-450">
                        Number of advance days to start showing alerts for Insurance, Fitness, and PUC expirations.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 mt-2">
                    <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={16} />
                    <div className="text-[11px] text-amber-800 leading-snug">
                      <strong>Note on System Realignment:</strong> Updating these thresholds dynamically impacts calculations inside the <strong>Tyre Management View</strong> and <strong>Notification Center Views</strong> instantly. Adjust values carefully based on regional transport guidelines.
                    </div>
                  </div>
                </div>
              )}

              {/* 2. NOTIFICATIONS CASE */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="space-y-3.5">
                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                      <div>
                        <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide">Allow Push Notifications</span>
                        <span className="text-[11px] text-slate-400">Enables in-app browser alert indicators and banners.</span>
                      </div>
                      <input
                        type="checkbox"
                        name="allowPushNotifications"
                        checked={thresholds.allowPushNotifications}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                    </div>

                    {/* Notification Frequency */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Alert Compilation Frequency
                      </label>
                      <select
                        name="notificationFrequency"
                        value={thresholds.notificationFrequency}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 p-2 text-xs rounded-lg font-bold"
                      >
                        <option value="immediate">Real-time / Instant dispatch</option>
                        <option value="daily">Daily digest summary at 8:00 AM</option>
                        <option value="weekly">Weekly composite fleet health report</option>
                      </select>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Determines how frequently WhatsApp/Email alerts compile and dispatch to supervisors.
                      </span>
                    </div>

                    {/* Auto Archive */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                      <div>
                        <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide">Auto-Archive Completed Service Logs</span>
                        <span className="text-[11px] text-slate-400">Moves service log notifications to history once completed.</span>
                      </div>
                      <input
                        type="checkbox"
                        name="autoArchiveLogs"
                        checked={thresholds.autoArchiveLogs}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. USER PROFILE CASE */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-150">
                    <div className="w-14 h-14 bg-blue-100 border border-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl">
                      VJ
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Vijay Kashyap</h4>
                      <p className="text-xs text-slate-450 font-bold uppercase tracking-wider font-mono">Fleet Operations Director</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">kashyapvijay59@gmail.com</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs font-medium text-slate-600">
                    <div className="p-3 bg-white border border-slate-150 rounded-xl flex justify-between items-center">
                      <span>Operator Authority Level:</span>
                      <strong className="text-slate-800">Master Administrator</strong>
                    </div>
                    <div className="p-3 bg-white border border-slate-150 rounded-xl flex justify-between items-center">
                      <span>Auth Provider:</span>
                      <strong className="font-mono text-slate-800">Firebase Auth (Google Account)</strong>
                    </div>
                    <div className="p-3 bg-white border border-slate-150 rounded-xl flex justify-between items-center">
                      <span>Account Status:</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded font-mono uppercase">
                        Verified Operator
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. DATABASE RESTORATION CASE */}
              {activeTab === 'database' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Server size={14} className="text-slate-500" />
                      <span>Diagnostics & Reseed Operations</span>
                    </h4>
                    
                    <p className="text-xs text-slate-500 leading-relaxed">
                      If you're testing the application and need to restore initial vehicles, tyre assets, service logs, and mock alert presets inside your Firestore Database, you can trigger a seed reinitialization.
                    </p>

                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-[11px] text-amber-800 flex gap-2">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <span>This will safely seed preset vehicles and notifications without deleting your existing Firestore collections.</span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onSeedDatabase}
                        disabled={isSeeding}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold rounded-xl shadow transition"
                      >
                        <RefreshCw size={14} className={isSeeding ? 'animate-spin' : ''} />
                        <span>{isSeeding ? "Seeding Database..." : "Seed Presets to Firestore"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px] text-slate-450 font-medium">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span>Fleet Vehicles Registered:</span>
                      <strong className="text-slate-800 font-mono">{vehicles.length}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span>Total Active Tyre Assets:</span>
                      <strong className="text-slate-800 font-mono">
                        {vehicles.reduce((acc, curr) => acc + (curr.tyresCount || 0), 0)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Save Buttons at bottom */}
            {activeTab !== 'database' && activeTab !== 'profile' && (
              <div className="p-4.5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-1.5"
                >
                  <Check size={14} className="stroke-[2.5]" />
                  <span>Save Configuration</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
