import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Wrench, 
  Disc, 
  BarChart3, 
  ShieldAlert,
  User,
  Menu,
  X,
  Bell
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
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet', name: 'Fleet Vehicles', icon: Truck },
    { id: 'service', name: 'Service Logs', icon: Wrench },
    { id: 'tyres', name: 'Tyre Management', icon: Disc },
    { id: 'notifications', name: 'Notification Center', icon: Bell },
    { id: 'reports', name: 'Reports', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile Close Button when Sidebar is Open */}
      {isOpen && (
        <div className="md:hidden fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition duration-150 flex items-center justify-center border border-slate-850"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col z-40 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Branding & Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white font-bold flex items-center justify-center">
              <Truck size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-blue-400 uppercase">
                SL Maintenance
              </h1>
              <span className="text-[10px] opacity-65 font-bold tracking-widest uppercase">
                Fleet Hub v4.0.2
              </span>
            </div>
          </div>
          
          {/* Admin Tag */}
          <div className="mt-4 flex items-center space-x-2 bg-slate-800/60 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-[11px] text-blue-400 font-medium">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span>ADMIN MODE ACTIVE</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
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
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition duration-150 group font-medium text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white opacity-70 hover:opacity-100'
                }`}
              >
                <Icon
                  size={18}
                  className={`transition duration-150 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span>{item.name}</span>
                {item.id === 'tyres' && (
                  <span className="ml-auto text-[9px] bg-blue-400 text-blue-950 font-bold px-1.5 rounded">
                    NEW
                  </span>
                )}
                {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                  <span className="ml-auto text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3 p-2 bg-slate-800/30 rounded-xl">
            <div className="bg-slate-800 w-9 h-9 rounded-full flex items-center justify-center text-slate-300 font-bold border border-slate-700">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[10px] text-slate-400 truncate">kashyapvijay59@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Screen overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}
    </>
  );
}
