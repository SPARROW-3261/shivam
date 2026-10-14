import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  Wifi,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { Complaint } from '../types/index.ts';
import { fetchComplaints } from '../services/api.ts';
import { StatusBadge, PriorityBadge } from '../components/common/Badge.tsx';

interface HODDashboardProps {
  onOpenComplaint: (complaint: Complaint) => void;
  onNavigate: (page: string) => void;
}

export const HODDashboard: React.FC<HODDashboardProps> = ({
  onOpenComplaint,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartmentGrievances();
  }, [currentUser.id]);

  const loadDepartmentGrievances = async () => {
    setLoading(true);
    try {
      const res = await fetchComplaints({ role: 'hod', userId: currentUser.id });
      setComplaints(res.complaints || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const escalatedCases = complaints.filter((c) => c.status === 'Escalated' || c.escalationLevel > 0);
  const wifiIssues = complaints.filter((c) => c.category === 'cat-wifi');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-700 text-indigo-100 rounded">
              DEPARTMENT HEAD OVERVIEW
            </span>
            <span className="text-xs text-slate-300">· {currentUser.departmentName}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{currentUser.name}</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Monitoring hostel living conditions, Wi-Fi connectivity, and student welfare grievances affecting{' '}
            <strong>MCA & CS Department Students</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigate('reports')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          Department Analytics
        </button>
      </div>

      {/* 3 Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Department Student Issues
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{complaints.length}</span>
            <span className="text-xs text-slate-500">logged by MCA students</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Department Escalations
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{escalatedCases.length}</span>
            <span className="text-xs text-red-600 font-semibold">needs HOD intervention</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Wi-Fi / Academic Disruptions
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{wifiIssues.length}</span>
            <span className="text-xs text-indigo-700">exam & lab impact</span>
          </div>
        </div>
      </div>

      {/* Escalated & Academic Impact Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Student Grievances</h3>
            <p className="text-xs text-slate-500">Filtered for Computer Science & MCA students</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2">Loading department student tickets...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No active grievances for this department.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Student & Roll</th>
                  <th className="py-3 px-4">Hostel / Room</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{c.studentName}</span>
                      <span className="text-[11px] font-mono text-slate-500">{c.studentRoll}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.hostelName?.split(' ')[0]} · {c.roomNumber}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-800">{c.title}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenComplaint(c)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded border border-indigo-200 transition-colors"
                      >
                        Review & Endorse
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
