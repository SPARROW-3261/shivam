import React, { useState } from 'react';
import {
  Building,
  GraduationCap,
  Shield,
  UserCheck,
  CheckCircle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register, switchRole, demoUsers } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Register fields
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [hostelId, setHostelId] = useState('hst-01');
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials or pick a demo persona below.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        rollNumber,
        hostelId,
        roomNumber,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (roleToSelect: UserRole) => {
    switchRole(roleToSelect);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 bg-blue-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Building className="w-6 h-6" />
        </div>
        <h2 className="mt-3 text-2xl font-black text-slate-900 tracking-tight">HostelCare</h2>
        <p className="text-xs text-slate-500 mt-1">College Hostel Complaint & Redressal Portal</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-colors ${
                tab === 'login'
                  ? 'border-blue-700 text-blue-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-colors ${
                tab === 'register'
                  ? 'border-blue-700 text-blue-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Student Registration
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">College Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul.verma@college.edu"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm transition-colors"
              >
                {loading ? 'Authenticating...' : 'Sign In to HostelCare'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Student Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Roll / Registration Number *</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="23MCA1042"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hostel</label>
                  <select
                    value={hostelId}
                    onChange={(e) => setHostelId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="hst-01">Nilgiri Boys Hostel</option>
                    <option value="hst-02">Vindhya Boys Hostel</option>
                    <option value="hst-03">Aravali Boys Hostel</option>
                    <option value="hst-04">Kalpana Chawla Girls</option>
                    <option value="hst-05">Sarojini Naidu Girls</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Room Number *</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="B-304"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">College Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul.verma@college.edu"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm transition-colors"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
          )}

          {/* Quick Demo Persona One-Click Access */}
          <div className="pt-4 border-t border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              1-Click Demo Login Personas
            </span>
            <div className="grid grid-cols-1 gap-2">
              {[
                { role: 'student', label: 'Student: Rahul Verma', desc: 'Nilgiri Hostel, Room B-304 (MCA)' },
                { role: 'warden', label: 'Warden: Dr. Ramesh Sharma', desc: 'Chief Warden, Nilgiri Boys Hostel' },
                { role: 'hod', label: 'HOD: Prof. Arvind Rao', desc: 'Department Head, CS & MCA' },
                { role: 'dean', label: 'Dean: Dr. Vikram Malhotra', desc: 'Dean Student Welfare & Hostels' },
                { role: 'admin', label: 'Admin: System Administrator', desc: 'Campus Facilities Master Admin' },
              ].map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleDemoSelect(p.role as UserRole)}
                  className="p-2.5 text-left rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-slate-800 block text-xs group-hover:text-blue-900">
                      {p.label}
                    </span>
                    <span className="text-[10px] text-slate-500">{p.desc}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
