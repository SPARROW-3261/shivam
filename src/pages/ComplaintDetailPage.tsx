import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Shield,
  Send,
  Lock,
  MessageSquare,
  FileText,
  Printer,
  Star,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { Complaint, ComplaintPriority, ComplaintStatus, UserRole } from '../types/index.ts';
import {
  fetchComplaintById,
  updateComplaintStatus,
  assignComplaint,
  escalateComplaint,
  addComment,
  submitFeedback,
  fetchUsers,
} from '../services/api.ts';
import { StatusBadge, PriorityBadge } from '../components/common/Badge.tsx';

interface ComplaintDetailPageProps {
  complaintId: string;
  onBack: () => void;
  onRefreshList?: () => void;
}

export const ComplaintDetailPage: React.FC<ComplaintDetailPageProps> = ({
  complaintId,
  onBack,
  onRefreshList,
}) => {
  const { currentUser, role } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workflow Action State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>('In Progress');
  const [statusNotes, setStatusNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Escalation Modal
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalateToRole, setEscalateToRole] = useState<UserRole>('dean');

  // Assignee Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignInstructions, setAssignInstructions] = useState('');

  // Comment Thread State
  const [activeCommentTab, setActiveCommentTab] = useState<'public' | 'internal'>('public');
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Student Feedback State
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [complaintId, role, currentUser.id]);

  const loadComplaint = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchComplaintById(complaintId, role, currentUser.id);
      setComplaint(res.complaint);
      setSelectedStatus(res.complaint.status);
    } catch (err: any) {
      setError(err.message || 'Failed to load complaint dossier.');
    } finally {
      setLoading(false);
    }
  };

  const loadStaffMembers = async () => {
    try {
      const res = await fetchUsers();
      const staff = res.users.filter((u: any) => u.role !== 'student');
      setStaffList(staff);
      if (staff.length > 0) setSelectedStaffId(staff[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setUpdatingStatus(true);
    try {
      const res = await updateComplaintStatus(complaint.id, {
        status: selectedStatus,
        actorId: currentUser.id,
        notes: statusNotes,
        rejectionReason: selectedStatus === 'Rejected' ? rejectionReason : undefined,
        resolutionNotes: selectedStatus === 'Resolved' || selectedStatus === 'Closed' ? resolutionNotes : undefined,
      });
      setComplaint(res.complaint);
      setStatusModalOpen(false);
      setStatusNotes('');
      setResolutionNotes('');
      setRejectionReason('');
      if (onRefreshList) onRefreshList();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !escalationReason.trim()) return;
    try {
      const res = await escalateComplaint(complaint.id, {
        actorId: currentUser.id,
        reason: escalationReason,
        escalateToRole,
      });
      setComplaint(res.complaint);
      setEscalateModalOpen(false);
      setEscalationReason('');
      if (onRefreshList) onRefreshList();
    } catch (err: any) {
      alert(err.message || 'Error escalating complaint');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !selectedStaffId) return;
    try {
      const res = await assignComplaint(complaint.id, {
        assignedToId: selectedStaffId,
        actorId: currentUser.id,
        instructions: assignInstructions,
      });
      setComplaint(res.complaint);
      setAssignModalOpen(false);
      setAssignInstructions('');
      if (onRefreshList) onRefreshList();
    } catch (err: any) {
      alert(err.message || 'Error assigning staff');
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !commentInput.trim()) return;
    setSubmittingComment(true);
    try {
      const isInternal = activeCommentTab === 'internal' && role !== 'student';
      const res = await addComment(complaint.id, {
        authorId: currentUser.id,
        message: commentInput,
        isInternal,
      });
      setComplaint(res.complaint);
      setCommentInput('');
    } catch (err: any) {
      alert(err.message || 'Error posting comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setSubmittingFeedback(true);
    try {
      const res = await submitFeedback(complaint.id, {
        rating,
        comments: feedbackComment,
        studentId: currentUser.id,
      });
      setComplaint(res.complaint);
      setFeedbackSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Error submitting feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const isStaff = role !== 'student';

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3">Loading complaint dossier...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-900">Unable to load complaint</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
        >
          Return to List
        </button>
      </div>
    );
  }

  const visibleComments = complaint.comments.filter((c) => {
    if (role === 'student') return !c.isInternal;
    if (activeCommentTab === 'internal') return c.isInternal;
    return !c.isInternal;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top back button & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-900 text-white rounded">
                {complaint.id}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 mt-1">{complaint.title}</h1>
          </div>
        </div>

        {/* Action Controls for Staff */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Slip</span>
          </button>

          {isStaff && (
            <>
              <button
                onClick={() => {
                  loadStaffMembers();
                  setAssignModalOpen(true);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-300 transition-colors"
              >
                Reassign
              </button>
              <button
                onClick={() => setEscalateModalOpen(true)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
              >
                Escalate
              </button>
              <button
                onClick={() => setStatusModalOpen(true)}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
              >
                Update Status
              </button>
            </>
          )}
        </div>
      </div>

      {/* SLA & Critical Alert Notice */}
      {complaint.isOverdue && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>SLA Overdue:</strong> Target window of {complaint.slaHours} hours has lapsed. Case escalated for
              immediate campus intervention.
            </span>
          </div>
          <span className="font-mono text-[11px] text-red-700 font-bold">DEADLINE BREACHED</span>
        </div>
      )}

      {/* Grid: Details & Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column: Complaint & Location Dossier */}
        <div className="md:col-span-2 space-y-5">
          {/* Main Description */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Grievance Narrative</h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>

            {/* If resolution notes exist */}
            {complaint.resolutionNotes && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <span className="font-bold block mb-0.5">Official Resolution Summary:</span>
                <p>{complaint.resolutionNotes}</p>
              </div>
            )}

            {/* If rejected */}
            {complaint.rejectionReason && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
                <span className="font-bold block mb-0.5">Rejection Reason:</span>
                <p>{complaint.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Evidence / Attachments Gallery */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Photographic Evidence ({complaint.attachments.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {complaint.attachments.map((att) => (
                  <div key={att.id} className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                    <img src={att.url} alt={att.name} className="w-full h-32 object-cover" />
                    <div className="p-2 text-[11px]">
                      <span className="font-medium text-slate-800 block truncate">{att.name}</span>
                      <span className="text-slate-400 text-[10px]">{att.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Status Timeline */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              Progress Audit Trail & Timeline
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {complaint.timeline.map((step, idx) => (
                <div key={step.id} className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-2xs" />
                  <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{step.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(step.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Actor: <strong>{step.actorName}</strong> ({step.actorRole.toUpperCase()})
                    </p>
                    {step.notes && (
                      <p className="text-xs text-slate-700 mt-1.5 bg-white p-2 rounded border border-slate-200">
                        {step.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Communication / Discussion Thread */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                Communication Thread
              </h3>

              {isStaff && (
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveCommentTab('public')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      activeCommentTab === 'public'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Public (Student + Staff)
                  </button>
                  <button
                    onClick={() => setActiveCommentTab('internal')}
                    className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                      activeCommentTab === 'internal'
                        ? 'bg-amber-100 text-amber-900 shadow-2xs'
                        : 'text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <Lock className="w-3 h-3 text-amber-700" />
                    Internal Staff Notes
                  </button>
                </div>
              )}
            </div>

            {/* Comment Messages list */}
            <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
              {visibleComments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  {activeCommentTab === 'internal'
                    ? 'No internal staff notes recorded yet.'
                    : 'No messages yet. Send a message to communicate with student or staff.'}
                </p>
              ) : (
                visibleComments.map((cm) => (
                  <div
                    key={cm.id}
                    className={`p-3 rounded-lg border text-xs ${
                      cm.isInternal
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : cm.authorRole === 'student'
                        ? 'bg-blue-50/50 border-blue-200 text-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{cm.authorName}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">({cm.authorRole})</span>
                        {cm.isInternal && (
                          <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded">
                            INTERNAL NOTE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(cm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{cm.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add message input */}
            <form onSubmit={handlePostComment} className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                placeholder={
                  activeCommentTab === 'internal'
                    ? 'Write internal note (hidden from student)...'
                    : 'Type official message or query...'
                }
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentInput.trim()}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Location, Student, Assignee & Feedback */}
        <div className="space-y-5">
          {/* Student Profile Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Student & Resident Info</h3>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {complaint.studentName[0]}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">{complaint.studentName}</span>
                <span className="text-[11px] font-mono text-blue-700 font-semibold">{complaint.studentRoll}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Hostel:</span>
                <span className="font-medium text-slate-800">{complaint.hostelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Block & Room:</span>
                <span className="font-mono font-medium text-slate-800">
                  {complaint.block} · {complaint.roomNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-medium text-slate-800">{complaint.studentPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-medium text-slate-800 truncate max-w-[140px]">{complaint.studentEmail}</span>
              </div>
            </div>
          </div>

          {/* Assigned Authority Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Authority</h3>
            {complaint.assignedToName ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {complaint.assignedToName[0]}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{complaint.assignedToName}</span>
                    <span className="text-[10px] uppercase font-semibold text-indigo-700">
                      {complaint.assignedToRole}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Unassigned</p>
            )}

            <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-500">
              <div className="flex justify-between">
                <span>SLA Target:</span>
                <span className="font-semibold text-slate-800">{complaint.slaHours} Hours</span>
              </div>
              <div className="flex justify-between">
                <span>Logged Date:</span>
                <span>{new Date(complaint.submissionDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Student Satisfaction Rating & Feedback Card */}
          {(complaint.status === 'Resolved' || complaint.status === 'Closed') && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Student Resolution Feedback
              </h3>

              {complaint.feedback ? (
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                  <div className="flex items-center gap-1 mb-1 text-amber-600 font-bold">
                    {'⭐'.repeat(complaint.feedback.rating)}
                    <span className="ml-1 text-slate-800 font-semibold">({complaint.feedback.rating}/5 Stars)</span>
                  </div>
                  <p className="text-amber-900 italic">"{complaint.feedback.comments}"</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    Submitted on {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              ) : role === 'student' ? (
                <form onSubmit={handleSendFeedback} className="space-y-3">
                  <p className="text-xs text-slate-600">How satisfied are you with the technician's resolution?</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-xl transition-transform hover:scale-110 ${
                          star <= rating ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-700">{rating} of 5</span>
                  </div>

                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Optional review note..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Satisfaction Rating'}
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 italic">Awaiting student review and feedback.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Update Complaint Status</h3>
            <p className="text-xs text-slate-500 mb-4">
              Shifting complaint status updates the live tracking timeline and alerts the student.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">New Status *</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Awaiting Student Information">Awaiting Student Information</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="Reopened">Reopened</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {selectedStatus === 'Resolved' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Resolution Notes (Required) *
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe what was repaired/replaced and technician name..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    required
                  />
                </div>
              )}

              {selectedStatus === 'Rejected' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Rejection Reason (Required) *
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specify why this cannot be processed..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Timeline Audit Note</label>
                <input
                  type="text"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Electrician visited; awaiting spare parts"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-2xs"
                >
                  {updatingStatus ? 'Updating...' : 'Confirm Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESCALATE MODAL */}
      {escalateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Escalate Complaint</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Escalate this complaint to higher collegiate authority (Dean / HOD) with formal reason.
            </p>

            <form onSubmit={handleEscalate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Escalate To</label>
                <select
                  value={escalateToRole}
                  onChange={(e) => setEscalateToRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="dean">Dean of Student Welfare</option>
                  <option value="hod">Department Head (HOD)</option>
                  <option value="admin">Chief Campus Proctor / Admin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Formal Escalation *
                </label>
                <textarea
                  rows={3}
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="e.g. Unresolved for >24 hours with persistent student disruption..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEscalateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-2xs"
                >
                  Submit Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Assign to Staff / Authority</h3>
            <p className="text-xs text-slate-500 mb-4">
              Assign this ticket to a specific warden, technician, or faculty supervisor.
            </p>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Assignee *</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.designation || st.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder="e.g. Please visit room B-304 before 3 PM today..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-2xs"
                >
                  Assign Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
