export type UserRole = 'student' | 'warden' | 'hod' | 'dean' | 'admin';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Submitted'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Student Information'
  | 'Escalated'
  | 'Resolved'
  | 'Closed'
  | 'Reopened'
  | 'Rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  rollNumber?: string;
  hostelId?: string;
  hostelName?: string;
  roomNumber?: string;
  block?: string;
  departmentId?: string;
  departmentName?: string;
  designation?: string;
  createdAt: string;
}

export interface Hostel {
  id: string;
  name: string;
  code: string;
  type: 'Boys' | 'Girls' | 'Co-ed';
  totalRooms: number;
  wardenId?: string;
  wardenName?: string;
  contactNumber: string;
  blocks: string[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hodId?: string;
  hodName?: string;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultPriority: ComplaintPriority;
  defaultAssigneeRole: UserRole;
  slaHours: number;
  active: boolean;
}

export interface ComplaintAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
  fileType: string;
}

export interface ComplaintTimelineItem {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  notes?: string;
  previousStatus?: ComplaintStatus;
  newStatus?: ComplaintStatus;
}

export interface ComplaintComment {
  id: string;
  timestamp: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  message: string;
  isInternal: boolean; // if true, visible only to Staff (warden, hod, dean, admin)
}

export interface ComplaintFeedback {
  rating: number; // 1 to 5
  comments: string;
  submittedAt: string;
}

export interface Complaint {
  id: string; // e.g. HC-2026-1041
  title: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentRoll: string;
  hostelId: string;
  hostelName: string;
  block: string;
  roomNumber: string;
  departmentId?: string;
  departmentName?: string;
  assignedToId?: string;
  assignedToName?: string;
  assignedToRole?: UserRole;
  submissionDate: string;
  updatedDate: string;
  resolvedDate?: string;
  slaHours: number;
  slaDeadline: string;
  isOverdue: boolean;
  escalationLevel: number; // 0 = None, 1 = Escalated to Warden/HOD, 2 = Escalated to Dean
  escalationReason?: string;
  rejectionReason?: string;
  resolutionNotes?: string;
  attachments: ComplaintAttachment[];
  timeline: ComplaintTimelineItem[];
  comments: ComplaintComment[];
  feedback?: ComplaintFeedback;
}

export interface RoutingRule {
  id: string;
  category: string;
  priority: ComplaintPriority;
  targetRole: UserRole;
  autoEscalateHours: number;
  escalateToRole: UserRole;
  notifyDean: boolean;
  active: boolean;
  description: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  complaintId?: string;
  type: 'status_change' | 'assignment' | 'escalation' | 'comment' | 'feedback' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress?: string;
}

export interface StatsSummary {
  totalComplaints: number;
  submitted: number;
  assigned: number;
  inProgress: number;
  awaitingStudent: number;
  escalated: number;
  resolved: number;
  closed: number;
  rejected: number;
  criticalCount: number;
  overdueCount: number;
  avgResolutionHours: number;
  satisfactionRate: number;
  byCategory: { name: string; count: number; percentage: number }[];
  byHostel: { name: string; count: number; resolved: number }[];
  byPriority: { priority: ComplaintPriority; count: number }[];
  recentTrend: { date: string; submitted: number; resolved: number }[];
}
