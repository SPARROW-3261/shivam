import React from 'react';
import type { ComplaintPriority, ComplaintStatus } from '../../types/index.ts';

interface StatusBadgeProps {
  status: ComplaintStatus;
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true, className = '' }) => {
  let dotColor = 'bg-slate-400';
  let textColor = 'text-slate-700';
  let bgColor = 'bg-slate-100/70 border-slate-200';

  switch (status) {
    case 'Submitted':
      dotColor = 'bg-blue-400';
      textColor = 'text-blue-800';
      bgColor = 'bg-blue-50/80 border-blue-200';
      break;
    case 'Assigned':
      dotColor = 'bg-indigo-500';
      textColor = 'text-indigo-800';
      bgColor = 'bg-indigo-50/80 border-indigo-200';
      break;
    case 'In Progress':
      dotColor = 'bg-sky-500 animate-pulse';
      textColor = 'text-sky-800';
      bgColor = 'bg-sky-50/80 border-sky-200';
      break;
    case 'Awaiting Student Information':
      dotColor = 'bg-amber-500';
      textColor = 'text-amber-800';
      bgColor = 'bg-amber-50/80 border-amber-200';
      break;
    case 'Escalated':
      dotColor = 'bg-red-500 animate-ping';
      textColor = 'text-red-900';
      bgColor = 'bg-red-50 border-red-200 font-semibold';
      break;
    case 'Resolved':
      dotColor = 'bg-emerald-500';
      textColor = 'text-emerald-800';
      bgColor = 'bg-emerald-50/80 border-emerald-200';
      break;
    case 'Closed':
      dotColor = 'bg-slate-400';
      textColor = 'text-slate-700';
      bgColor = 'bg-slate-100 border-slate-200';
      break;
    case 'Reopened':
      dotColor = 'bg-orange-500';
      textColor = 'text-orange-800';
      bgColor = 'bg-orange-50/80 border-orange-200';
      break;
    case 'Rejected':
      dotColor = 'bg-rose-500';
      textColor = 'text-rose-800';
      bgColor = 'bg-rose-50/80 border-rose-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded border ${bgColor} ${textColor} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {status === 'Escalated' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>
      )}
      {status}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  let dotColor = 'bg-slate-400';
  let textColor = 'text-slate-700';
  let bgColor = 'bg-slate-50 border-slate-200';

  switch (priority) {
    case 'Low':
      dotColor = 'bg-slate-400';
      textColor = 'text-slate-600';
      bgColor = 'bg-slate-50 border-slate-200';
      break;
    case 'Medium':
      dotColor = 'bg-blue-500';
      textColor = 'text-blue-700';
      bgColor = 'bg-blue-50 border-blue-200';
      break;
    case 'High':
      dotColor = 'bg-amber-500';
      textColor = 'text-amber-800 font-semibold';
      bgColor = 'bg-amber-50 border-amber-200';
      break;
    case 'Critical':
      dotColor = 'bg-red-600';
      textColor = 'text-red-900 font-bold';
      bgColor = 'bg-red-100/80 border-red-300';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${bgColor} ${textColor} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {priority}
    </span>
  );
};
