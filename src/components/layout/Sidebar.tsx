import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Search,
  Users,
  GitBranch,
  BarChart3,
  Database,
  User,
  LogOut,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  mobileMenuOpen: boolean;
  closeMobileMenu: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  mobileMenuOpen,
  closeMobileMenu,
}) => {
  const { currentUser, role, logout } = useAuth();

  const handleNav = (page: string) => {
    onNavigate(page);
    closeMobileMenu();
  };

  const navItems = [
    {
      id: 'dashboard',
      label: role === 'student' ? 'My Dashboard' : `${role.toUpperCase()} Dashboard`,
      icon: LayoutDashboard,
      roles: ['student', 'warden', 'hod', 'dean', 'admin'],
    },
    {
      id: 'submit-complaint',
      label: 'Lodge Complaint',
      icon: PlusCircle,
      highlight: true,
      roles: ['student', 'admin'],
    },
    {
      id: 'complaints',
      label: role === 'student' ? 'My Complaints' : 'Complaints Central',
      icon: FileText,
      roles: ['student', 'warden', 'hod', 'dean', 'admin'],
    },
    {
      id: 'public-tracker',
      label: 'Live Tracking ID Lookup',
      icon: Search,
      roles: ['student', 'warden', 'hod', 'dean', 'admin'],
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      roles: ['admin', 'dean'],
    },
    {
      id: 'routing',
      label: 'Category & SLA Routing',
      icon: GitBranch,
      roles: ['admin', 'dean', 'warden'],
    },
    {
      id: 'reports',
      label: 'Analytics & Reports',
      icon: BarChart3,
      roles: ['warden', 'hod', 'dean', 'admin'],
    },
    {
      id: 'database',
      label: 'MySQL Schema & Setup',
      icon: Database,
      badge: 'SQL',
      roles: ['student', 'warden', 'hod', 'dean', 'admin'],
    },
    {
      id: 'profile',
      label: 'Profile & Settings',
      icon: User,
      roles: ['student', 'warden', 'hod', 'dean', 'admin'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      {/* College Identity Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">CAMPUS HOSTEL</h2>
            <p className="text-[10px] text-slate-400">Grievance & Redressal Cell</p>
          </div>
        </div>

        {/* Current User Badge in Sidebar */}
        <div className="mt-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-600"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-blue-400 capitalize font-medium truncate">
              {currentUser.designation || currentUser.role}
            </p>
            {currentUser.roomNumber && (
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser.hostelName?.split(' ')[0]} · {currentUser.roomNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 my-2 rounded-lg text-xs font-bold text-white shadow transition-all ${
                  isActive
                    ? 'bg-blue-600 shadow-blue-500/20 ring-2 ring-blue-400/40'
                    : 'bg-blue-700 hover:bg-blue-600 shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4 text-white" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold border-l-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/40">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Emergency Notice Footer */}
      <div className="p-3 border-t border-slate-800">
        <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/50 text-[11px] text-red-200">
          <div className="flex items-center gap-1.5 font-bold text-red-300 mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Anti-Ragging Helpline</span>
          </div>
          <p className="text-[10px] text-red-300/80">Toll-Free: 1800-180-5522</p>
          <p className="text-[10px] text-red-300/80">Proctor Desk: +91-98765-33001</p>
        </div>

        <button
          onClick={logout}
          className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Account / Reset</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={closeMobileMenu}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
