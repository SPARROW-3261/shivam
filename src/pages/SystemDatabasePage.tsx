import React, { useState, useEffect } from 'react';
import {
  Database,
  Copy,
  CheckCircle2,
  Download,
  Server,
  Code,
  Terminal,
  FileCode,
  ExternalLink,
  ShieldCheck,
  Table,
} from 'lucide-react';
import { fetchHealth, fetchSchemaSql } from '../services/api.ts';

export const SystemDatabasePage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tables' | 'schema' | 'installation' | 'env'>('tables');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      const [h, sql] = await Promise.all([fetchHealth(), fetchSchemaSql()]);
      setHealth(h);
      setSchemaSql(sql);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([schemaSql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hostelcare_mysql_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tableDefinitions = [
    { name: 'departments', purpose: 'Academic departments (CS & MCA, ECE, MECH)', rows: 4, primaryKey: 'id', fks: ['hod_id -> users.id'] },
    { name: 'hostels', purpose: 'Hostel residences (Nilgiri, Vindhya, Aravali, Kalpana Chawla, Sarojini)', rows: 5, primaryKey: 'id', fks: ['warden_id -> users.id'] },
    { name: 'users', purpose: 'Multi-role authentication (student, warden, hod, dean, admin)', rows: health?.stats?.totalUsers || 8, primaryKey: 'id', fks: ['hostel_id -> hostels.id', 'department_id -> departments.id'] },
    { name: 'complaint_categories', purpose: 'Issue classifications, default priorities, and SLA target hours', rows: 9, primaryKey: 'id', fks: [] },
    { name: 'complaints', purpose: 'Master grievance records with unique token (HC-2026-XXXX)', rows: health?.stats?.totalComplaints || 6, primaryKey: 'id', fks: ['category_id -> categories.id', 'student_id -> users.id', 'hostel_id -> hostels.id', 'assigned_to_id -> users.id'] },
    { name: 'complaint_assignments', purpose: 'Dispatch and delegation audit records', rows: 8, primaryKey: 'id (auto_inc)', fks: ['complaint_id -> complaints.id', 'assigned_to_id -> users.id'] },
    { name: 'complaint_history', purpose: 'Chronological timeline of state transitions & actions', rows: 18, primaryKey: 'id (auto_inc)', fks: ['complaint_id -> complaints.id', 'actor_id -> users.id'] },
    { name: 'complaint_comments', purpose: 'Public student messages & private internal staff notes', rows: 12, primaryKey: 'id (auto_inc)', fks: ['complaint_id -> complaints.id', 'author_id -> users.id'] },
    { name: 'complaint_attachments', purpose: 'Photo evidence metadata (leakage, broken lock, mess food)', rows: 6, primaryKey: 'id', fks: ['complaint_id -> complaints.id'] },
    { name: 'complaint_feedback', purpose: 'Student 1-5 star ratings and satisfaction testimonials', rows: 3, primaryKey: 'id (auto_inc)', fks: ['complaint_id -> complaints.id', 'student_id -> users.id'] },
    { name: 'routing_rules', purpose: 'Configurable automated triage rules & auto-escalation', rows: 5, primaryKey: 'id', fks: ['category_id -> categories.id'] },
    { name: 'notifications', purpose: 'Real-time alert messages for status shifts & escalations', rows: 10, primaryKey: 'id', fks: ['user_id -> users.id'] },
    { name: 'audit_logs', purpose: 'Regulatory compliance log of administrative actions', rows: 14, primaryKey: 'id (auto_inc)', fks: [] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              {health?.mode || 'Active Relational Engine'}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            MySQL Database Architecture & Relational Schema
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Designed for MCA Final-Year Project Demonstration & Enterprise College Deployments.
          </p>
        </div>

        <button
          onClick={handleDownloadSql}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download schema.sql</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('tables')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'tables'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>13 Relational Tables</span>
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'schema'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>SQL DDL Viewer</span>
        </button>
        <button
          onClick={() => setActiveTab('installation')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'installation'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Installation Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('env')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'env'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>.env Configuration</span>
        </button>
      </div>

      {/* Tab 1: Tables Overview */}
      {activeTab === 'tables' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Relational Database Catalog (`hostelcare_db`)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Normalised to 3NF with Foreign Key referential integrity, ENUM status constraints, and trigger audits.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Table Name</th>
                  <th className="py-3 px-4">Primary Purpose</th>
                  <th className="py-3 px-4">Primary Key</th>
                  <th className="py-3 px-4">Foreign Keys & Relations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableDefinitions.map((t) => (
                  <tr key={t.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{t.name}</td>
                    <td className="py-3 px-4 text-slate-700">{t.purpose}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{t.primaryKey}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {t.fks.length > 0 ? t.fks.join(', ') : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: SQL DDL Viewer */}
      {activeTab === 'schema' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">database/schema.sql (MySQL 8.0 DDL)</h3>
            <button
              onClick={() => handleCopy(schemaSql)}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed">
            {schemaSql}
          </pre>
        </div>
      )}

      {/* Tab 3: Installation Instructions */}
      {activeTab === 'installation' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900">Local Deployment & MySQL Setup Instructions</h3>
          <p className="text-slate-600">
            HostelCare is configured to run in zero-friction active relational store for previews, and is completely
            compatible with live production MySQL 8.0 servers.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Step 1: Clone & Install Node Dependencies</span>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs">
                {`git clone <repository-url>
cd hostelcare
npm install`}
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Step 2: Initialize Database on MySQL Server</span>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs">
                {`mysql -u root -p < database/schema.sql
mysql -u root -p < database/seeds.sql`}
              </pre>
              <p className="text-slate-500">
                Or using MySQL Workbench: open <code>database/schema.sql</code> and execute the query script.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Step 3: Run Development Server</span>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs">
                {`npm run dev`}
              </pre>
              <p className="text-slate-500">
                Visit <code>http://localhost:3000</code> in your browser to test all 5 stakeholder roles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: .env Variables */}
      {activeTab === 'env' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">.env File Specification</h3>
            <button
              onClick={() =>
                handleCopy(
                  `PORT=3000\nMYSQL_HOST=localhost\nMYSQL_PORT=3306\nMYSQL_USER=root\nMYSQL_PASSWORD=your_password\nMYSQL_DATABASE=hostelcare_db`
                )
              }
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-semibold flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy .env Template</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-200 rounded-lg font-mono text-xs leading-relaxed">
            {`# Server Port
PORT=3000

# MYSQL DATABASE CONFIGURATION (Optional - defaults to built-in relational store if unset)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=hostelcare_db`}
          </pre>
        </div>
      )}
    </div>
  );
};
