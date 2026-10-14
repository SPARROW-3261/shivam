import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Building,
  User,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { Complaint, ComplaintPriority, ComplaintStatus } from '../types/index.ts';
import { fetchComplaints, fetchCategories, fetchHostels } from '../services/api.ts';
import { StatusBadge, PriorityBadge } from '../components/common/Badge.tsx';

interface ComplaintsListPageProps {
  onOpenComplaint: (complaint: Complaint) => void;
  onOpenTracker: (id: string) => void;
}

export const ComplaintsListPage: React.FC<ComplaintsListPageProps> = ({
  onOpenComplaint,
  onOpenTracker,
}) => {
  const { currentUser, role } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [hostels, setHostels] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [hostelFilter, setHostelFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadData();
  }, [role, currentUser.id, statusFilter, priorityFilter, categoryFilter, hostelFilter, overdueOnly, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compsRes, catsRes, hstsRes] = await Promise.all([
        fetchComplaints({
          role,
          userId: currentUser.id,
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
          hostelId: hostelFilter,
          overdueOnly,
          sortBy,
          search,
        }),
        fetchCategories(),
        fetchHostels(),
      ]);
      setComplaints(compsRes.complaints || []);
      setCategories(catsRes.categories || []);
      setHostels(hstsRes.hostels || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Export CSV
  const handleExportCSV = () => {
    if (complaints.length === 0) return;
    const headers = [
      'Tracking ID',
      'Title',
      'Category',
      'Priority',
      'Status',
      'Hostel',
      'Block',
      'Room',
      'Student Name',
      'Student Roll',
      'Submission Date',
      'Assigned To',
      'Overdue',
    ];
    const rows = complaints.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.status,
      `"${c.hostelName}"`,
      c.block,
      c.roomNumber,
      `"${c.studentName}"`,
      c.studentRoll,
      c.submissionDate,
      `"${c.assignedToName || 'Unassigned'}"`,
      c.isOverdue ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HostelCare_Complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusTabs = [
    { id: 'all', label: 'All' },
    { id: 'Submitted', label: 'Submitted' },
    { id: 'Assigned', label: 'Assigned' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Escalated', label: 'Escalated' },
    { id: 'Resolved', label: 'Resolved' },
    { id: 'Closed', label: 'Closed' },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {role === 'student' ? 'My Hostel Complaints' : 'University Complaints Central'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'student'
              ? 'View tracking, notes, and progress for your registered issues'
              : `Managing grievances across campus hostels (${role.toUpperCase()} permissions)`}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        {/* Status Tab Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-blue-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => setOverdueOnly(!overdueOnly)}
            className={`ml-auto px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              overdueOnly
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Overdue Only
          </button>
        </div>

        {/* Dropdown Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Search */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search tracking ID, student, room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>
          </div>

          {/* Priority */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Hostel */}
          <div>
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Hostels</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="deadline">Sort: SLA Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2">Loading complaints dataset...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <p className="font-semibold text-slate-800 text-sm">No Complaints Match This Filter</p>
            <p className="mt-1 text-slate-500">Try broadening your search or resetting status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Tracking Token</th>
                  <th className="py-3 px-4">Subject & Description</th>
                  <th className="py-3 px-4">Hostel / Location</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <button
                        onClick={() => onOpenTracker(c.id)}
                        className="text-blue-700 hover:underline flex items-center gap-1 font-mono text-xs"
                      >
                        {c.id}
                      </button>
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {new Date(c.submissionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                      <p className="text-slate-500 text-[11px] truncate">{c.description}</p>
                      {c.isOverdue && (
                        <span className="text-[10px] font-bold text-red-600 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" /> SLA Target Breached
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-800 font-medium block truncate max-w-[130px]">
                        {c.hostelName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {c.block} · {c.roomNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-800 font-medium block truncate max-w-[120px]">
                        {c.studentName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{c.studentRoll}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {c.assignedToName ? (
                        <div>
                          <span className="font-medium text-slate-800 block truncate max-w-[120px]">
                            {c.assignedToName}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {c.assignedToRole}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onOpenComplaint(c)}
                        className="px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                      >
                        Dossier
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
