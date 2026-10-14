import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  ArrowRight,
  ShieldAlert,
  Zap,
  Droplet,
  Utensils,
  Wifi,
  Sparkles,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { Complaint } from '../types/index.ts';
import { fetchComplaints } from '../services/api.ts';
import { StatusBadge, PriorityBadge } from '../components/common/Badge.tsx';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
  onOpenComplaint: (complaint: Complaint) => void;
  onOpenTracker: (id: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenComplaint,
  onOpenTracker,
}) => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadMyComplaints();
  }, [currentUser.id]);

  const loadMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetchComplaints({ role: 'student', userId: currentUser.id });
      setComplaints(res.complaints || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = complaints.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Closed' && c.status !== 'Rejected'
  ).length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const overdueCount = complaints.filter((c) => c.isOverdue).length;

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') {
      return (
        matchesSearch &&
        (c.status === 'Submitted' || c.status === 'Assigned' || c.status === 'In Progress' || c.status === 'Escalated')
      );
    }
    if (statusFilter === 'resolved') {
      return matchesSearch && (c.status === 'Resolved' || c.status === 'Closed');
    }
    return matchesSearch && c.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-800 text-blue-200 rounded border border-blue-700 font-mono">
              ROLL NO: {currentUser.rollNumber || '23MCA1042'}
            </span>
            <span className="text-xs text-blue-200">· {currentUser.departmentName}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {currentUser.name}</h1>
          <p className="mt-1 text-sm text-slate-300 leading-relaxed">
            Hostel Residence: <strong className="text-white">{currentUser.hostelName}</strong> ({currentUser.block},{' '}
            Room {currentUser.roomNumber}). Lodge and monitor all room, mess, and facility issues with full transparency.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('submit-complaint')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-white"
            >
              <PlusCircle className="w-4 h-4" />
              Lodge New Complaint
            </button>
            <button
              onClick={() => onNavigate('public-tracker')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors"
            >
              <Search className="w-4 h-4" />
              Track by Token
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Grievances</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{activeCount}</span>
            <span className="text-xs text-slate-500">in process</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{inProgressCount}</span>
            <span className="text-xs text-sky-700">staff deployed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resolved & Closed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{resolvedCount}</span>
            <span className="text-xs text-emerald-700">successfully fixed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue / SLA Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{overdueCount}</span>
            <span className="text-xs text-red-600 font-medium">auto-escalated</span>
          </div>
        </div>
      </div>

      {/* Quick Category Launchers */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Quick Issue Categories</h3>
            <p className="text-xs text-slate-500">Click to file a specific complaint immediately</p>
          </div>
          <button
            onClick={() => onNavigate('submit-complaint')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { id: 'cat-elec', name: 'Electricity', icon: Zap, color: 'text-amber-600 bg-amber-50' },
            { id: 'cat-water', name: 'Plumbing & Water', icon: Droplet, color: 'text-blue-600 bg-blue-50' },
            { id: 'cat-mess', name: 'Mess & Food', icon: Utensils, color: 'text-orange-600 bg-orange-50' },
            { id: 'cat-wifi', name: 'Wi-Fi & Network', icon: Wifi, color: 'text-indigo-600 bg-indigo-50' },
            { id: 'cat-clean', name: 'Hygiene & Clean', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'cat-rag', name: 'Anti-Ragging', icon: ShieldAlert, color: 'text-red-600 bg-red-50' },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onNavigate('submit-complaint')}
                className="p-3 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 transition-all group"
              >
                <div className={`w-7 h-7 rounded-md ${cat.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-blue-700">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400">File report</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* My Complaints Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">My Registered Complaints</h3>
            <p className="text-xs text-slate-500">Track real-time progress and technician status</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {['all', 'active', 'resolved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                    statusFilter === tab
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search my complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Complaints List / Table */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2">Loading your complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Complaints Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't filed any complaints matching this filter.
            </p>
            <button
              onClick={() => onNavigate('submit-complaint')}
              className="mt-4 px-4 py-2 bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-blue-800 transition-colors"
            >
              Lodge a Complaint
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Issue Details</th>
                  <th className="py-3 px-4">Hostel / Room</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Window</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <button
                        onClick={() => onOpenTracker(c.id)}
                        className="text-blue-700 hover:underline flex items-center gap-1 font-mono text-xs"
                      >
                        {c.id}
                      </button>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                      <p className="text-slate-500 text-[11px] truncate">{c.description}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {c.block} · {c.roomNumber}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {c.isOverdue ? (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                        </span>
                      ) : (
                        <span>{c.slaHours}h target</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenComplaint(c)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                        >
                          View Details
                        </button>
                        {c.status === 'Resolved' && !c.feedback && (
                          <button
                            onClick={() => onOpenComplaint(c)}
                            className="px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 flex items-center gap-1"
                            title="Rate resolution"
                          >
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Rate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
