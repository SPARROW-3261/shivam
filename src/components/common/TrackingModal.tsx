import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  Shield,
  MapPin,
  Calendar,
  User as UserIcon,
} from 'lucide-react';
import type { Complaint } from '../../types/index.ts';
import { fetchComplaintById } from '../../services/api.ts';
import { StatusBadge, PriorityBadge } from './Badge.tsx';

interface TrackingModalProps {
  complaintId: string | null;
  onClose: () => void;
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  complaintId,
  onClose,
  onSelectComplaint,
}) => {
  const [searchId, setSearchId] = useState(complaintId || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (complaintId) {
      setSearchId(complaintId);
      loadComplaint(complaintId);
    }
  }, [complaintId]);

  const loadComplaint = async (idToFind: string) => {
    if (!idToFind.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchComplaintById(idToFind.trim());
      setComplaint(res.complaint);
    } catch (err: any) {
      setError(err.message || 'Complaint not found with this tracking ID.');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      loadComplaint(searchId.trim().toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-base font-bold tracking-tight">HostelCare Grievance Tracker</h3>
            </div>
            <p className="text-xs text-slate-400">Live real-time college resolution tracking</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar inside Modal */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g., HC-2026-1041, HC-2026-1042)..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {/* Quick Demo ID chips */}
          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span>Try IDs:</span>
            {['HC-2026-1041', 'HC-2026-1042', 'HC-2026-1043', 'HC-2026-1044', 'HC-2026-1046'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchId(id);
                  loadComplaint(id);
                }}
                className="text-xs font-mono text-blue-700 hover:underline bg-white px-2 py-0.5 rounded border border-slate-200"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-xs text-slate-600">Retrieving official complaint record...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Complaint Not Found</p>
                <p className="mt-0.5 text-red-700">{error}</p>
                <p className="mt-2 text-slate-600">
                  Please verify the token number from your submission receipt or check your dashboard.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && complaint && (
            <div className="space-y-6">
              {/* Header card */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-900 text-white rounded">
                      {complaint.id}
                    </span>
                    <StatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                  <span className="text-xs text-slate-500">
                    Logged: {new Date(complaint.submissionDate).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="mt-3 text-base font-bold text-slate-900">{complaint.title}</h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{complaint.description}</p>

                {/* Location Grid */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hostel</span>
                    <span className="font-medium text-slate-800">{complaint.hostelName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Room / Area</span>
                    <span className="font-medium text-slate-800 font-mono">
                      {complaint.block} · {complaint.roomNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Student</span>
                    <span className="font-medium text-slate-800">
                      {complaint.studentName} ({complaint.studentRoll})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned To</span>
                    <span className="font-medium text-slate-800">
                      {complaint.assignedToName || 'Unassigned / Pending'}
                    </span>
                  </div>
                </div>

                {/* SLA target bar */}
                <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Resolution Target SLA:</span>
                    <span className="font-semibold text-slate-900">{complaint.slaHours} Hours</span>
                  </div>
                  {complaint.isOverdue ? (
                    <span className="text-xs font-bold text-red-600">SLA Overdue</span>
                  ) : (
                    <span className="text-xs text-emerald-700 font-medium">Within Target Window</span>
                  )}
                </div>
              </div>

              {/* Status Audit Timeline */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Status Audit & Progress Timeline
                </h5>
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                  {complaint.timeline.map((step, idx) => (
                    <div key={step.id} className="relative flex items-start gap-3 pl-1">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-xs">
                        {idx + 1}
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{step.action}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(step.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          By: {step.actorName} ({step.actorRole.toUpperCase()})
                        </p>
                        {step.notes && (
                          <p className="text-xs text-slate-700 mt-1.5 bg-slate-50 p-2 rounded border border-slate-100">
                            {step.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Feedback if provided */}
              {complaint.feedback && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                  <span className="font-semibold text-amber-900 block mb-1">
                    Student Rating: {'⭐'.repeat(complaint.feedback.rating)} ({complaint.feedback.rating}/5)
                  </span>
                  <p className="text-amber-800 italic">"{complaint.feedback.comments}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <div className="flex items-center gap-2">
            {complaint && onSelectComplaint && (
              <button
                onClick={() => {
                  onSelectComplaint(complaint);
                  onClose();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
              >
                Open Full Dossier
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
