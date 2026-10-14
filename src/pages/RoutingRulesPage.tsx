import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  PlusCircle,
  Clock,
  ShieldAlert,
  CheckCircle,
  Sliders,
  AlertTriangle,
  Zap,
  Droplet,
  Utensils,
  Wifi,
  Sparkles,
} from 'lucide-react';
import type { ComplaintCategory, RoutingRule, UserRole } from '../types/index.ts';
import { fetchCategories, fetchRoutingRules, createRoutingRule } from '../services/api.ts';

export const RoutingRulesPage: React.FC = () => {
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);

  // New Rule Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('cat-elec');
  const [priority, setPriority] = useState<any>('Medium');
  const [targetRole, setTargetRole] = useState<UserRole>('warden');
  const [autoEscalateHours, setAutoEscalateHours] = useState('12');
  const [escalateToRole, setEscalateToRole] = useState<UserRole>('dean');
  const [notifyDean, setNotifyDean] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadRulesData();
  }, []);

  const loadRulesData = async () => {
    setLoading(true);
    try {
      const [catsRes, rulesRes] = await Promise.all([fetchCategories(), fetchRoutingRules()]);
      setCategories(catsRes.categories || []);
      setRules(rulesRes.rules || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRoutingRule({
        category: categoryId,
        priority,
        targetRole,
        autoEscalateHours: Number(autoEscalateHours),
        escalateToRole,
        notifyDean,
        description,
      });
      setModalOpen(false);
      setDescription('');
      loadRulesData();
      alert('Routing rule activated successfully.');
    } catch (err: any) {
      alert(err.message || 'Error creating rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Complaint Categories & Automated Routing Rules
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure SLA turnaround targets, default triage authorities, and auto-escalation thresholds.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Routing Policy</span>
        </button>
      </div>

      {/* Categories SLA Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Configured Complaint Categories & SLA Policies</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  {cat.slaHours}h SLA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{cat.description}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>Default: <strong className="text-slate-800">{cat.defaultPriority}</strong></span>
                <span>Assignee: <strong className="uppercase text-blue-800">{cat.defaultAssigneeRole}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routing Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Automated Triage & Escalation Engine</h3>
            <p className="text-xs text-slate-500">Rules applied in order during complaint ingestion</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Policy ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Trigger Priority</th>
                <th className="py-3 px-4">Initial Triage</th>
                <th className="py-3 px-4">Auto-Escalation Window</th>
                <th className="py-3 px-4">Escalate Target</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{rule.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {categories.find((c) => c.id === rule.category)?.name || rule.category}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{rule.priority}</td>
                  <td className="py-3 px-4 uppercase text-blue-800 font-bold">{rule.targetRole}</td>
                  <td className="py-3 px-4 text-slate-700 font-mono">After {rule.autoEscalateHours} Hours</td>
                  <td className="py-3 px-4 uppercase text-red-800 font-bold">
                    {rule.escalateToRole}
                    {rule.notifyDean && <span className="ml-1 text-[10px] text-red-600 block">(Dean Alert)</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Routing Policy</h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure automated routing and escalation rule when complaints are lodged.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Target</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="warden">Warden</option>
                    <option value="dean">Dean</option>
                    <option value="hod">HOD</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Auto-Escalate (Hours)</label>
                  <input
                    type="number"
                    value={autoEscalateHours}
                    onChange={(e) => setAutoEscalateHours(e.target.value)}
                    min="1"
                    max="168"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Escalate To</label>
                  <select
                    value={escalateToRole}
                    onChange={(e) => setEscalateToRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="dean">Dean</option>
                    <option value="hod">HOD</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notifyDean"
                  checked={notifyDean}
                  onChange={(e) => setNotifyDean(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="notifyDean" className="text-slate-700 font-medium cursor-pointer">
                  Send immediate executive SMS / priority alert to Dean Office
                </label>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Policy Purpose</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Critical water contamination immediate escalation"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-2xs"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
