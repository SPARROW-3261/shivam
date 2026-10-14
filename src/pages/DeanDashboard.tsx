import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Building,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { Complaint } from '../types/index.ts';
import { fetchComplaints } from '../services/api.ts';
import { StatusBadge, PriorityBadge } from '../components/common/Badge.tsx';

interface DeanDashboardProps {
  onOpenComplaint: (complaint: Complaint) => void;
  onNavigate: (page: string) => void;
}

export const DeanDashboard: React.FC<DeanDashboardProps> = ({
  onOpenComplaint,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeanData();
  }, [currentUser.id]);

  const loadDeanData = async () => {
    setLoading(true);
    try {
      const res = await fetchComplaints({ role: 'dean' });
      setComplaints(res.complaints || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const antiRaggingComplaints = complaints.filter((c) => c.category === 'cat-rag');
  const criticalComplaints = complaints.filter((c) => c.priority === 'Critical');
  const escalatedComplaints = complaints.filter((c) => c.status === 'Escalated');
  const overdueCount = complaints.filter((c) => c.isOverdue).length;

  return (
    <div className="space-y-6">
      {/* Dean Executive Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-700 text-white rounded">
              EXECUTIVE DEAN OFFICE
            </span>
            <span className="text-xs text-slate-300">· Student Welfare & Campus Hostels</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{currentUser.name}</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Campus-wide authority for student discipline, anti-ragging compliance, mess caterer quality assurance, and
            inter-hostel SLA enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            University Analytics
          </button>
        </div>
      </div>

      {/* Critical Ticker if Anti-Ragging exists */}
      {antiRaggingComplaints.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shrink-0 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-red-900 text-sm">
                ACTIVE ANTI-RAGGING INCIDENT REPORT ({antiRaggingComplaints.length} Registered)
              </p>
              <p className="text-red-700 mt-0.5">
                Zero-tolerance statutory protocol active. Immediate campus disciplinary hearing convened.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenComplaint(antiRaggingComplaints[0])}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-2xs"
          >
            Immediate Action
          </button>
        </div>
      )}

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Critical Severity</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{criticalComplaints.length}</span>
            <span className="text-xs text-red-600 font-semibold">safety / mess / ragging</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dean Escalations</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{escalatedComplaints.length}</span>
            <span className="text-xs text-amber-700">awaiting executive ruling</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">SLA Overdue Across Hostels</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{overdueCount}</span>
            <span className="text-xs text-rose-700">target breached</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Campus Resolution Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">92.4%</span>
            <span className="text-xs text-emerald-700">satisfaction: 4.8 / 5</span>
          </div>
        </div>
      </div>

      {/* Escalated & Critical Issues Roster */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Priority & Escalated Dossiers</h3>
            <p className="text-xs text-slate-500">Requiring Dean & Chief Proctor sign-off</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="inline-block w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2">Loading executive roster...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Tracking Token</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Hostel / Location</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {complaints
                  .filter((c) => c.priority === 'Critical' || c.status === 'Escalated' || c.isOverdue)
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.id}</td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                        <p className="text-slate-500 text-[11px] truncate">{c.description}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-medium block">{c.hostelName}</span>
                        <span className="text-[11px] text-slate-500">{c.roomNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {c.studentName} ({c.studentRoll})
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenComplaint(c)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded border border-red-200 transition-colors"
                        >
                          Executive Action
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
