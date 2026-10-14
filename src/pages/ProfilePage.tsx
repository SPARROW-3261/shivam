import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Bell,
  Shield,
  Key,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const ProfilePage: React.FC = () => {
  const { currentUser, role, notifications, markAllRead } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">User Profile & Notification Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Campus credential information, allocated accommodation, and SMS/Email alert preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left: Avatar & Identity Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center space-y-3">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={currentUser.name}
            className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-blue-600 shadow-xs"
          />
          <div>
            <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-[11px] font-bold uppercase rounded bg-blue-100 text-blue-800">
              {currentUser.role}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{currentUser.phone}</span>
            </div>
            {currentUser.hostelName && (
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{currentUser.hostelName}</span>
              </div>
            )}
            {currentUser.roomNumber && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">Room:</span>
                <span className="font-mono font-bold text-slate-800">{currentUser.block} · {currentUser.roomNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Academic & Preferences */}
        <div className="md:col-span-2 space-y-5">
          {/* Official Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Institutional Allocation Record
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Department</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {currentUser.departmentName || 'Administrative & Facilities Staff'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">University Identifier</span>
                <span className="font-mono font-bold text-blue-900 block mt-0.5">
                  {currentUser.rollNumber || currentUser.id}
                </span>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <form onSubmit={handleSavePreferences} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-700" />
              Alert Dispatch Channels
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <div>
                  <span className="font-semibold text-slate-900 block">Email Alerts on Status Shifts</span>
                  <span className="text-slate-500 text-[11px]">
                    Receive instant notification when electrician/warden updates your ticket.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <div>
                  <span className="font-semibold text-slate-900 block">Critical SMS Alerts</span>
                  <span className="text-slate-500 text-[11px]">
                    Receive emergency alerts for anti-ragging actions or immediate room repairs.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="rounded border-slate-300"
                />
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saved && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Preferences Saved!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-2xs transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
