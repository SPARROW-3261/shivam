import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Users,
  GitBranch,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { Complaint, StatsSummary, AuditLog } from '../types/index.ts';
import { fetchStats, fetchAuditLogs, fetchComplaints, resetDemoData } from '../services/api.ts';
import { StatusBadge, PriorityBadge } from '../components/common/Badge.tsx';

interface AdminDashboardProps {
  onOpenComplaint: (complaint: Complaint) => void;
  onNavigate: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenComplaint,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes, compsRes] = await Promise.all([
        fetchStats(),
        fetchAuditLogs(),
        fetchComplaints({ role: 'admin' }),
      ]);
      setStats(statsRes.stats);
      setAuditLogs(logsRes.logs || []);
      setRecentComplaints(compsRes.complaints?.slice(0, 5) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (confirm('Reset database to default seed data? All custom entries will be restored to initial sample state.')) {
      await resetDemoData();
      await loadAdminData();
      alert('Database restored to default demo state.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white rounded">
              SUPER ADMINISTRATOR
            </span>
            <span className="text-xs text-slate-300">· Campus Facilities & Grievance Control</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">HostelCare Control Center</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time campus SLA monitoring, automated routing rule engines, audit logs, and master user directory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Reset to initial seed data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>
          <button
            onClick={() => onNavigate('routing')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            SLA & Routing Rules
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Grievances</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.totalComplaints}</span>
              <span className="text-xs text-slate-500">across 5 hostels</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress / Assigned</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.inProgress + stats.assigned}</span>
              <span className="text-xs text-sky-700">active dispatch</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Resolution SLA</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.avgResolutionHours}h</span>
              <span className="text-xs text-emerald-700">turnaround time</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Critical & Overdue</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.criticalCount + stats.overdueCount}</span>
              <span className="text-xs text-red-600 font-semibold">elevated urgency</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Row: Recent Live Complaints + Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Complaints Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Complaints Feed</h3>
            <button
              onClick={() => onNavigate('complaints')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 px-4">Token</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Hostel</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="py-2.5 px-4 max-w-xs truncate font-medium text-slate-800">{c.title}</td>
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                      {c.hostelName?.split(' ')[0]} ({c.roomNumber})
                    </td>
                    <td className="py-2.5 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onOpenComplaint(c)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs Stream */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">System Audit Trail</h3>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              LIVE
            </span>
          </div>

          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-blue-800 uppercase">{log.action}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] leading-snug">{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>
                    By: {log.userName} ({log.role})
                  </span>
                  <span className="font-mono">{log.targetId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
