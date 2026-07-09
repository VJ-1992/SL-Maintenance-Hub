import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Wrench, 
  Disc, 
  BarChart3, 
  User, 
  X, 
  Bell, 
  Users, 
  Compass, 
  Settings,
  Home
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  unreadNotificationsCount?: number;
}

export default function Sidebar({ 
  currentTab, 
  setTab, 
  isOpen, 
  setIsOpen,
  unreadNotificationsCount = 0 
}: SidebarProps) {
  const menuItems = [
    { id: 'home', name: 'Home Dashboard', icon: Home },
    { id: 'dashboard', name: 'Operations Overview', icon: LayoutDashboard },
    { id: 'fleet', name: 'Fleet Vehicles', icon: Truck },
    { id: 'service', name: 'Service Logs', icon: Wrench },
    { id: 'tyres', name: 'Tyre Management', icon: Disc },
    { id: 'notifications', name: 'Notification Center', icon: Bell },
    { id: 'reports', name: 'Reports & Expenses', icon: BarChart3 },
    { id: 'parties', name: 'Party Directory', icon: Users },
    { id: 'tracking', name: 'Live Tracking', icon: Compass },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Close Button when Sidebar is Open */}
      {isOpen && (
        <div className="md:hidden fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition duration-150 flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200/60 text-slate-800 flex flex-col z-40 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Branding & Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white font-bold flex items-center justify-center shadow-sm">
              <Truck size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-[15px] tracking-tight text-slate-900 uppercase">
                SL Maintenance
              </h1>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase block mt-0.5">
                Enterprise Hub
              </span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="mt-4 flex items-center space-x-2 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Cloud Live Session</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl transition duration-150 group font-semibold text-xs uppercase tracking-wider ${
                  isActive
                    ? 'bg-blue-50/70 text-blue-600 border border-blue-100/50'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950 border border-transparent'
                }`}
              >
                <Icon
                  size={16}
                  className={`transition duration-150 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {item.id === 'tyres' && (
                  <span className="ml-auto text-[8px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-extrabold px-1.5 py-0.5 rounded-md shrink-0">
                    SPARES
                  </span>
                )}
                {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                  <span className="ml-auto text-[9px] bg-red-500 text-white font-extrabold px-2 py-0.5 rounded-full shrink-0">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Info Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/40">
          <div className="flex items-center space-x-3 p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-xs">
            <div className="bg-slate-100 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border border-slate-200/80 shrink-0">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate leading-none">Administrator</p>
              <p className="text-[10px] text-slate-400 truncate mt-1">kashyapvijay59@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Screen overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}
    </>
  );
}
