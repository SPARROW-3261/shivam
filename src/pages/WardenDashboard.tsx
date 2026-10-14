import React, { useState, useEffect } from 'react';
import {
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Droplet,
  Search,
  Filter,
  ArrowRight,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { Complaint } from '../types/index.ts';
import { fetchComplaints } from '../services/api.ts';
import { StatusBadge, PriorityBadge } from '../components/common/Badge.tsx';

interface WardenDashboardProps {
  onOpenComplaint: (complaint: Complaint) => void;
  onNavigate: (page: string) => void;
}

export const WardenDashboard: React.FC<WardenDashboardProps> = ({
  onOpenComplaint,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'assigned' | 'all'>('assigned');

  useEffect(() => {
    loadWardenData();
  }, [currentUser.id, filterType]);

  const loadWardenData = async () => {
    setLoading(true);
    try {
      const res = await fetchComplaints({
        role: 'warden',
        userId: currentUser.id,
        hostelId: filterType === 'assigned' ? currentUser.hostelId : undefined,
      });
      setComplaints(res.complaints || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pendingElectrical = complaints.filter((c) => c.category === 'cat-elec' && c.status !== 'Resolved').length;
  const pendingPlumbing = complaints.filter((c) => c.category === 'cat-water' && c.status !== 'Resolved').length;
  const overdueCount = complaints.filter((c) => c.isOverdue).length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Warden Header Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-700 text-blue-100 rounded">
              CHIEF WARDEN PORTAL
            </span>
            <span className="text-xs text-slate-300">· {currentUser.hostelName || 'Assigned Hostels'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{currentUser.name}</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Managing resident maintenance requests, plumbing/electrical work orders, and mess inspections for{' '}
            <strong>{currentUser.hostelName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('complaints')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            All Hostel Tickets
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Work Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{complaints.length - resolvedCount}</span>
            <span className="text-xs text-slate-500">open cases</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Electrical Queue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{pendingElectrical}</span>
            <span className="text-xs text-amber-700">fan/wiring/switches</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Plumbing & Water</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{pendingPlumbing}</span>
            <span className="text-xs text-sky-700">leakages/coolers</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue / SLA Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{overdueCount}</span>
            <span className="text-xs text-red-600 font-semibold">needs immediate visit</span>
          </div>
        </div>
      </div>

      {/* Actionable Complaints Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Hostel Repair & Inspection Queue</h3>
            <p className="text-xs text-slate-500">Prioritized by SLA target deadline</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType(filterType === 'assigned' ? 'all' : 'assigned')}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              Showing: {filterType === 'assigned' ? `${currentUser.hostelName?.split(' ')[0]} Only` : 'All Campus Hostels'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2">Loading warden queue...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No complaints logged for your hostel at this time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Room & Student</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">
                        {c.block} · Room {c.roomNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {c.studentName} ({c.studentRoll})
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                      <p className="text-slate-500 text-[11px] truncate">{c.description}</p>
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.isOverdue ? (
                        <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Breached
                        </span>
                      ) : (
                        <span className="text-xs">{c.slaHours} Hours</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenComplaint(c)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded border border-blue-200 transition-colors"
                      >
                        Manage & Dispatch
                      </button>
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
