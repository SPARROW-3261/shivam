import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  Building,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import type { StatsSummary } from '../types/index.ts';
import { fetchStats } from '../services/api.ts';

export const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetchStats();
      setStats(res.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !stats) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3">Generating campus analytics reports...</p>
      </div>
    );
  }

  const maxCategoryCount = Math.max(...stats.byCategory.map((c) => c.count), 1);
  const maxHostelCount = Math.max(...stats.byHostel.map((h) => h.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Hostel Complaint Analytics & SLA Performance Report
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical metrics, resolution turnaround, and inter-hostel comparative benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Grievances</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalComplaints}</span>
            <span className="text-xs text-slate-500">this semester</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg Turnaround Time
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{stats.avgResolutionHours}h</span>
            <span className="text-xs text-emerald-700 font-semibold">vs 24h college SLA target</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              SLA Adherence Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.totalComplaints > 0
                ? Math.round(((stats.totalComplaints - stats.overdueCount) / stats.totalComplaints) * 100)
                : 100}
              %
            </span>
            <span className="text-xs text-emerald-700 font-semibold">resolved on time</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Student Satisfaction</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{stats.satisfactionRate} / 5</span>
            <span className="text-xs text-amber-700">⭐⭐⭐⭐⭐</span>
          </div>
        </div>
      </div>

      {/* Row 1: Complaint Breakdown by Category & Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown Horizontal Bars */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Complaint Volume by Category</h3>
            <span className="text-[11px] text-slate-500">Relative distribution</span>
          </div>

          <div className="space-y-3">
            {stats.byCategory.map((cat) => {
              const barWidth = Math.max(8, Math.round((cat.count / maxCategoryCount) * 100));
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="font-mono text-slate-500">
                      {cat.count} tickets ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Status Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Severity & Status Distribution</h3>

          {/* Priority visual cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <span className="text-[10px] uppercase font-bold text-red-700 block">Critical</span>
              <span className="text-xl font-black text-red-900">{stats.criticalCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">High</span>
              <span className="text-xl font-black text-amber-900">
                {stats.byPriority.find((p) => p.priority === 'High')?.count || 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Medium</span>
              <span className="text-xl font-black text-blue-900">
                {stats.byPriority.find((p) => p.priority === 'Medium')?.count || 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Low</span>
              <span className="text-xl font-black text-slate-900">
                {stats.byPriority.find((p) => p.priority === 'Low')?.count || 0}
              </span>
            </div>
          </div>

          {/* Status Breakdown Table */}
          <div className="pt-2 border-t border-slate-100">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-1.5 text-slate-600">Submitted & Pending Triage</td>
                  <td className="py-1.5 text-right font-mono font-bold text-slate-900">{stats.submitted}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-600">Assigned to Warden / Contractor</td>
                  <td className="py-1.5 text-right font-mono font-bold text-slate-900">{stats.assigned}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-600">Active Work In Progress</td>
                  <td className="py-1.5 text-right font-mono font-bold text-sky-700">{stats.inProgress}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-600">Escalated to HOD / Dean</td>
                  <td className="py-1.5 text-right font-mono font-bold text-red-700">{stats.escalated}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-600">Successfully Resolved</td>
                  <td className="py-1.5 text-right font-mono font-bold text-emerald-700">{stats.resolved}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-600">Closed with Student Feedback</td>
                  <td className="py-1.5 text-right font-mono font-bold text-slate-800">{stats.closed}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 2: Inter-Hostel Comparative Performance */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Hostel Comparison: Grievance Volume vs Resolutions</h3>
        <div className="space-y-3">
          {stats.byHostel.map((h) => {
            const barWidth = Math.max(10, Math.round((h.count / maxHostelCount) * 100));
            return (
              <div key={h.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800">{h.name}</span>
                  <span className="font-mono text-slate-500">
                    {h.count} total · <strong className="text-emerald-700">{h.resolved} resolved</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-700 h-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
