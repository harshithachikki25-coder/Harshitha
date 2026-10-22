import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Users,
  MessageSquare,
  Database,
  GraduationCap,
  ChevronRight,
  X,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'event-analytics'
  | 'department-analytics'
  | 'participation'
  | 'feedback'
  | 'dataset-explorer'
  | 'about';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  totalEventsCount: number;
  isDemoData: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  totalEventsCount,
  isDemoData,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'event-analytics' as NavTab, label: 'Event Analytics', icon: CalendarCheck },
    { id: 'department-analytics' as NavTab, label: 'Department Analytics', icon: Building2 },
    { id: 'participation' as NavTab, label: 'Participation Analysis', icon: Users },
    { id: 'feedback' as NavTab, label: 'Feedback Analysis', icon: MessageSquare },
    { id: 'dataset-explorer' as NavTab, label: 'Dataset Explorer', icon: Database },
    { id: 'about' as NavTab, label: 'About Project', icon: GraduationCap },
  ];

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-68 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Project Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-white whitespace-nowrap">
                Campus Events
              </div>
              <div className="text-[11px] text-slate-400">B.Tech Analytics Project</div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dataset Status Banner */}
        <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="font-medium text-slate-200">Active Dataset</span>
            <span
              className={`text-[10px] uppercase font-semibold tracking-wider ${
                isDemoData ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {isDemoData ? 'Demo Data' : 'Custom CSV'}
            </span>
          </div>
          <div className="text-slate-400 text-[11px]">
            {totalEventsCount.toLocaleString()} events loaded
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
              </button>
            );
          })}
        </div>

        {/* Project Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="text-slate-300 font-medium">B.Tech Major Project</div>
          <div className="text-slate-400 mt-0.5">Academic Year 2025–2026</div>
        </div>
      </aside>
    </>
  );
};
