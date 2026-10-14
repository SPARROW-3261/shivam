import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  ShieldAlert,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { ComplaintCategory, ComplaintPriority, Hostel } from '../types/index.ts';
import { fetchCategories, fetchHostels, submitComplaint } from '../services/api.ts';

interface SubmitComplaintPageProps {
  onSuccess: (complaintId: string) => void;
  onNavigate: (page: string) => void;
}

export const SubmitComplaintPage: React.FC<SubmitComplaintPageProps> = ({
  onSuccess,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('cat-elec');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [hostelId, setHostelId] = useState(currentUser.hostelId || 'hst-01');
  const [block, setBlock] = useState(currentUser.block || 'Block B');
  const [roomNumber, setRoomNumber] = useState(currentUser.roomNumber || 'B-304');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; url: string; size: string }[]>([]);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [catsRes, hstsRes] = await Promise.all([fetchCategories(), fetchHostels()]);
      setCategories(catsRes.categories || []);
      setHostels(hstsRes.hostels || []);
      if (currentUser.hostelId) {
        setHostelId(currentUser.hostelId);
      } else if (hstsRes.hostels?.length) {
        setHostelId(hstsRes.hostels[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCategoryChange = (catId: string) => {
    setCategory(catId);
    const selected = categories.find((c) => c.id === catId);
    if (selected) {
      setPriority(selected.defaultPriority);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === category);

  const handleAddSampleAttachment = (type: string) => {
    if (type === 'leak') {
      setAttachments((prev) => [
        ...prev,
        {
          name: 'water_leak_washroom.jpg',
          url: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=600',
          size: '1.8 MB',
        },
      ]);
    } else if (type === 'electrical') {
      setAttachments((prev) => [
        ...prev,
        {
          name: 'tripped_switch_board.jpg',
          url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
          size: '2.4 MB',
        },
      ]);
    } else {
      setAttachments((prev) => [
        ...prev,
        {
          name: 'incident_evidence_photo.jpg',
          url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
          size: '1.2 MB',
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !roomNumber.trim()) {
      setError('Please fill out all required fields (title, description, room number).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitComplaint({
        title,
        description,
        category,
        priority,
        studentId: currentUser.id,
        hostelId,
        block,
        roomNumber,
        attachments,
      });

      setSubmittedId(res.trackingId);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (submittedId) {
      navigator.clipboard.writeText(submittedId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Lodge Official Hostel Grievance</h1>
        <p className="text-xs text-slate-500 mt-1">
          Every submission is cryptographically assigned a unique Tracking ID and logged into the university hostel
          audit trail.
        </p>
      </div>

      {submittedId ? (
        <div className="p-8 bg-white rounded-2xl border border-emerald-200 shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Complaint Registered Successfully!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your grievance has been auto-assigned per university routing rules with a target resolution SLA of{' '}
            <strong>{selectedCategoryObj?.slaHours || 24} hours</strong>.
          </p>

          <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-sm mx-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              YOUR UNIQUE TRACKING TOKEN
            </span>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-black text-blue-900 tracking-wider">{submittedId}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                title="Copy tracking token"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && <span className="text-[11px] text-emerald-700 font-semibold block mt-1">Copied to clipboard!</span>}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onSuccess(submittedId)}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              View Complaint Dossier & Timeline
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={() => {
                setSubmittedId(null);
                setTitle('');
                setDescription('');
                setAttachments([]);
              }}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
            >
              Lodge Another Complaint
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {category === 'cat-rag' && (
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-800 text-sm">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <span>CONFIDENTIAL: Anti-Ragging Direct Escalation Protocol Active</span>
              </div>
              <p className="text-red-700 leading-relaxed">
                Under the Supreme Court and UGC Anti-Ragging Regulations, this report immediately alerts the Dean of
                Student Welfare, Chief Proctor, and Campus Security with <strong>2-hour SLA urgency</strong>. Your
                identity remains strictly protected.
              </p>
            </div>
          )}

          {/* 1. Category */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                1. Select Complaint Category *
              </label>
              {selectedCategoryObj && (
                <span className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  SLA Target: {selectedCategoryObj.slaHours} Hours
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{cat.slaHours}h SLA</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">{cat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Priority */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              2. Urgency & Priority Level *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(
                [
                  { level: 'Low', desc: 'Minor cosmetic repair, 48h SLA' },
                  { level: 'Medium', desc: 'Standard room maintenance, 16h SLA' },
                  { level: 'High', desc: 'Severe water/mess failure, 8h SLA' },
                  { level: 'Critical', desc: 'Safety/Ragging risk, 2h SLA' },
                ] as const
              ).map((p) => {
                const isSelected = priority === p.level;
                return (
                  <button
                    key={p.level}
                    type="button"
                    onClick={() => setPriority(p.level)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold block">{p.level}</span>
                    <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Location */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              3. Location & Room Details *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Hostel</label>
                <select
                  value={hostelId}
                  onChange={(e) => setHostelId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Block / Wing</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="e.g. Block B, Wing A"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Room / Exact Area *</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. B-304, 2nd Floor Washroom"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* 4. Subject & Description */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              4. Complaint Subject & Elaboration *
            </label>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Concise Subject / Summary *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Geyser not heating water in 3rd floor washroom"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Detailed Description & Impact *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide precise details: When did this start? What is the impact? Any specific sounds or odors? Mention if technician needs to visit during specific hours..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                required
              />
            </div>
          </div>

          {/* 5. Photo Evidence */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                5. Attachments / Evidence (Optional)
              </label>
              <span className="text-[11px] text-slate-500">Add photos to expedite resolution</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Quick Attach Demo Photo:</span>
              <button
                type="button"
                onClick={() => handleAddSampleAttachment('leak')}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
              >
                + Water Leak Photo
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleAttachment('electrical')}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
              >
                + Electrical Switch Photo
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleAttachment('food')}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
              >
                + Mess Food Photo
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {attachments.map((att, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={att.url} alt="preview" className="w-8 h-8 rounded object-cover shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 truncate block">{att.name}</span>
                        <span className="text-[10px] text-slate-500">{att.size}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering Complaint...</span>
                </>
              ) : (
                <>
                  <span>Submit & Generate Tracking ID</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
