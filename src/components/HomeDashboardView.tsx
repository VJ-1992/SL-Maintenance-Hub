import React from 'react';
import { motion } from 'motion/react';
import { 
  Truck, 
  Disc, 
  Wrench, 
  BarChart3, 
  Bell, 
  Users, 
  Compass, 
  Settings,
  LayoutDashboard,
  ClipboardList,
  Package,
  ArrowRight
} from 'lucide-react';
import { Vehicle, ServiceLog, TyreMaster, ServiceSchedule, CentralNotification } from '../types';

interface HomeDashboardViewProps {
  vehicles: Vehicle[];
  serviceLogs: ServiceLog[];
  serviceSchedules: ServiceSchedule[];
  notifications: CentralNotification[];
  setTab: (tab: string) => void;
  tyres: TyreMaster[];
}

export default function HomeDashboardView({
  setTab,
}: HomeDashboardViewProps) {
  // Beautiful minimal system module launcher definitions
  const modules = [
    {
      id: 'dashboard',
      name: 'Operations Overview',
      icon: LayoutDashboard,
      color: 'text-sky-600 bg-sky-50/70 border-sky-100/50 hover:bg-sky-50 hover:border-sky-300 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900',
    },
    {
      id: 'fleet',
      name: 'Fleet Vehicles',
      icon: Truck,
      color: 'text-blue-600 bg-blue-50/70 border-blue-100/50 hover:bg-blue-50 hover:border-blue-300 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900',
    },
    {
      id: 'tyres',
      name: 'Tyre Management',
      icon: Disc,
      color: 'text-emerald-600 bg-emerald-50/70 border-emerald-100/50 hover:bg-emerald-50 hover:border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900',
    },
    {
      id: 'service',
      name: 'Service & Maintenance',
      icon: Wrench,
      color: 'text-amber-600 bg-amber-50/70 border-amber-100/50 hover:bg-amber-50 hover:border-amber-300 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900',
    },
    {
      id: 'reports',
      name: 'Reports & Expenses',
      icon: BarChart3,
      color: 'text-indigo-600 bg-indigo-50/70 border-indigo-100/50 hover:bg-indigo-50 hover:border-indigo-300 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900',
    },
    {
      id: 'parties',
      name: 'Party Directory',
      icon: Users,
      color: 'text-teal-600 bg-teal-50/70 border-teal-100/50 hover:bg-teal-50 hover:border-teal-300 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900',
    },
    {
      id: 'tracking',
      name: 'Trip History',
      icon: ClipboardList,
      color: 'text-violet-600 bg-violet-50/70 border-violet-100/50 hover:bg-violet-50 hover:border-violet-300 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900',
    },
    {
      id: 'tracking',
      name: 'Live GPS Tracking',
      icon: Compass,
      color: 'text-cyan-600 bg-cyan-50/70 border-cyan-100/50 hover:bg-cyan-50 hover:border-cyan-300 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900',
    },
    {
      id: 'tyres',
      name: 'Tyre Inventory',
      icon: Package,
      color: 'text-rose-600 bg-rose-50/70 border-rose-100/50 hover:bg-rose-50 hover:border-rose-300 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      color: 'text-red-600 bg-red-50/70 border-red-100/50 hover:bg-red-50 hover:border-red-300 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900',
    },
    {
      id: 'settings',
      name: 'Hub Settings',
      icon: Settings,
      color: 'text-slate-600 bg-slate-50/70 border-slate-200/50 hover:bg-slate-100 hover:border-slate-350 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
    }
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-8 py-4 sm:py-6 max-w-5xl mx-auto selection:bg-blue-600 selection:text-white">
      {/* Dynamic Greetings & Header Details */}
      <div className="flex flex-col space-y-1 select-none">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Enterprise Logistics Command
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
          Welcome back, Administrator
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {currentDate}
        </p>
      </div>

      {/* Elegant Module Grid (4-5 columns on Desktop, 2 on Mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <motion.button
              key={`${mod.id}-${index}`}
              onClick={() => setTab(mod.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 12px 20px -10px rgba(148, 163, 184, 0.25)"
              }}
              whileTap={{ scale: 0.97 }}
              className={`w-full aspect-square bg-white border border-slate-200/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${mod.color}`}
            >
              <div className="p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon size={32} className="stroke-[1.8]" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm tracking-tight leading-tight group-hover:text-slate-900 transition-colors">
                {mod.name}
              </h3>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
