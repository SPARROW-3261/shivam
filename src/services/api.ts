import type {
  User,
  Hostel,
  Department,
  ComplaintCategory,
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  RoutingRule,
  NotificationItem,
  AuditLog,
  StatsSummary,
  UserRole,
  ComplaintComment,
  ComplaintTimelineItem,
} from '../types/index.ts';

import {
  INITIAL_HOSTELS,
  INITIAL_DEPARTMENTS,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_ROUTING_RULES,
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './mockData.ts';

// Helper for local storage persistence
function getStored<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(`hostelcare_${key}`);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`hostelcare_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error(e);
  }
}

// In-Memory state synced to localStorage
let hostels: Hostel[] = getStored('hostels', INITIAL_HOSTELS);
let departments: Department[] = getStored('departments', INITIAL_DEPARTMENTS);
let users: User[] = getStored('users', INITIAL_USERS);
let categories: ComplaintCategory[] = getStored('categories', INITIAL_CATEGORIES);
let routingRules: RoutingRule[] = getStored('routing_rules', INITIAL_ROUTING_RULES);
let complaints: Complaint[] = getStored('complaints', INITIAL_COMPLAINTS);
let notifications: NotificationItem[] = getStored('notifications', INITIAL_NOTIFICATIONS);
let auditLogs: AuditLog[] = getStored('audit_logs', INITIAL_AUDIT_LOGS);

// Refresh overdue statuses dynamically
function refreshOverdueStatuses() {
  const now = Date.now();
  complaints.forEach((c) => {
    if (c.status !== 'Resolved' && c.status !== 'Closed' && c.status !== 'Rejected') {
      const deadline = new Date(c.slaDeadline).getTime();
      c.isOverdue = now > deadline;
    } else {
      c.isOverdue = false;
    }
  });
  setStored('complaints', complaints);
}

// ---------------------------------------------------------------------
// API METHODS
// ---------------------------------------------------------------------

export async function fetchHealth() {
  return {
    status: 'healthy',
    mode: 'Active Relational Engine (MySQL 8.0 Compliant)',
    dbType: 'relational-mysql-adapter',
    timestamp: new Date().toISOString(),
    stats: {
      totalUsers: users.length,
      totalComplaints: complaints.length,
      totalHostels: hostels.length,
      totalCategories: categories.length,
      totalRoutingRules: routingRules.length,
    },
  };
}

export async function loginUser(email: string): Promise<{ user: User; token: string }> {
  const found = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!found) {
    throw new Error('User account not found with this email.');
  }
  return {
    user: found,
    token: `token-${found.id}-${Date.now()}`,
  };
}

export async function registerUser(payload: {
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  hostelId: string;
  block?: string;
  roomNumber: string;
  departmentId?: string;
}): Promise<{ user: User }> {
  const existing = users.find(
    (u) =>
      u.email.toLowerCase() === payload.email.toLowerCase().trim() ||
      u.rollNumber?.toUpperCase() === payload.rollNumber?.toUpperCase().trim()
  );
  if (existing) {
    throw new Error('A student with this email or roll number is already registered.');
  }

  const hostel = hostels.find((h) => h.id === payload.hostelId);
  const dept = departments.find((d) => d.id === payload.departmentId);

  const newUser: User = {
    id: `usr-stu-${Date.now().toString().slice(-4)}`,
    name: payload.name.trim(),
    email: payload.email.trim(),
    role: 'student',
    phone: payload.phone || '+91-90000-00000',
    rollNumber: payload.rollNumber.trim().toUpperCase(),
    hostelId: payload.hostelId,
    hostelName: hostel ? hostel.name : 'College Hostel',
    block: payload.block || 'Block A',
    roomNumber: payload.roomNumber.trim(),
    departmentId: payload.departmentId || 'dept-01',
    departmentName: dept ? dept.name : 'Engineering & Technology',
    designation: 'Hostel Resident Student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setStored('users', users);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: newUser.id,
    userName: newUser.name,
    role: 'student',
    action: 'REGISTER_STUDENT',
    targetType: 'user',
    targetId: newUser.id,
    details: `Registered ${newUser.rollNumber} (${newUser.hostelName} ${newUser.roomNumber})`,
  });
  setStored('audit_logs', auditLogs);

  return { user: newUser };
}

export async function fetchUsers(params?: { role?: string; hostelId?: string; search?: string }): Promise<{ users: User[] }> {
  let result = [...users];
  if (params?.role) result = result.filter((u) => u.role === params.role);
  if (params?.hostelId) result = result.filter((u) => u.hostelId === params.hostelId);
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.rollNumber && u.rollNumber.toLowerCase().includes(q))
    );
  }
  return { users: result };
}

export async function createUser(payload: any): Promise<{ user: User }> {
  const hostel = hostels.find((h) => h.id === payload.hostelId);
  const dept = departments.find((d) => d.id === payload.departmentId);

  const newUser: User = {
    id: `usr-${payload.role.substring(0, 3)}-${Date.now().toString().slice(-4)}`,
    name: payload.name.trim(),
    email: payload.email.trim(),
    role: payload.role as UserRole,
    phone: payload.phone || '+91-98765-00000',
    rollNumber: payload.rollNumber ? payload.rollNumber.toUpperCase() : undefined,
    hostelId: payload.hostelId,
    hostelName: hostel ? hostel.name : undefined,
    block: payload.block,
    roomNumber: payload.roomNumber,
    departmentId: payload.departmentId,
    departmentName: dept ? dept.name : undefined,
    designation: payload.designation || `${payload.role.toUpperCase()} Authority`,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setStored('users', users);
  return { user: newUser };
}

export async function fetchHostels(): Promise<{ hostels: Hostel[] }> {
  return { hostels };
}

export async function fetchDepartments(): Promise<{ departments: Department[] }> {
  return { departments };
}

export async function fetchCategories(): Promise<{ categories: ComplaintCategory[] }> {
  return { categories };
}

export async function createCategory(payload: Partial<ComplaintCategory>): Promise<{ category: ComplaintCategory }> {
  const newCat: ComplaintCategory = {
    id: `cat-${Date.now().toString().slice(-4)}`,
    name: payload.name || 'New Category',
    icon: payload.icon || 'wrench',
    description: payload.description || '',
    defaultPriority: payload.defaultPriority || 'Medium',
    defaultAssigneeRole: payload.defaultAssigneeRole || 'warden',
    slaHours: Number(payload.slaHours) || 24,
    active: true,
  };
  categories.push(newCat);
  setStored('categories', categories);
  return { category: newCat };
}

export async function fetchRoutingRules(): Promise<{ rules: RoutingRule[] }> {
  return { rules: routingRules };
}

export async function createRoutingRule(payload: Partial<RoutingRule>): Promise<{ rule: RoutingRule }> {
  const newRule: RoutingRule = {
    id: `rule-${Date.now().toString().slice(-4)}`,
    category: payload.category || 'cat-elec',
    priority: payload.priority || 'Medium',
    targetRole: payload.targetRole || 'warden',
    autoEscalateHours: Number(payload.autoEscalateHours) || 12,
    escalateToRole: payload.escalateToRole || 'dean',
    notifyDean: Boolean(payload.notifyDean),
    active: true,
    description: payload.description || 'Custom auto-routing policy',
  };
  routingRules.push(newRule);
  setStored('routing_rules', routingRules);
  return { rule: newRule };
}

export async function fetchComplaints(params: {
  role?: UserRole;
  userId?: string;
  status?: string;
  priority?: string;
  category?: string;
  hostelId?: string;
  search?: string;
  overdueOnly?: boolean;
  sortBy?: string;
}): Promise<{ complaints: Complaint[]; total: number }> {
  refreshOverdueStatuses();
  let result = [...complaints];

  // RBAC Permission filtering:
  // - Students only see their own complaints
  // - Wardens see complaints from their assigned hostel(s)
  // - HODs see complaints from students in their department or escalated
  // - Deans see all complaints, with focus on Critical/High & Escalated
  // - Admins see all
  if (params.role === 'student' && params.userId) {
    result = result.filter((c) => c.studentId === params.userId);
  } else if (params.role === 'warden' && params.userId) {
    const wardenUser = users.find((u) => u.id === params.userId);
    if (wardenUser && wardenUser.hostelId) {
      result = result.filter((c) => c.hostelId === wardenUser.hostelId || c.assignedToId === params.userId);
    }
  } else if (params.role === 'hod' && params.userId) {
    const hodUser = users.find((u) => u.id === params.userId);
    if (hodUser && hodUser.departmentId) {
      result = result.filter(
        (c) => c.departmentId === hodUser.departmentId || c.escalationLevel > 0 || c.priority === 'Critical'
      );
    }
  }

  // Filter by status
  if (params.status && params.status !== 'all') {
    result = result.filter((c) => c.status.toLowerCase() === params.status?.toLowerCase());
  }

  // Filter by priority
  if (params.priority && params.priority !== 'all') {
    result = result.filter((c) => c.priority === params.priority);
  }

  // Filter by category
  if (params.category && params.category !== 'all') {
    result = result.filter((c) => c.category === params.category);
  }

  // Filter by hostel
  if (params.hostelId && params.hostelId !== 'all') {
    result = result.filter((c) => c.hostelId === params.hostelId);
  }

  // Filter by overdue
  if (params.overdueOnly) {
    result = result.filter((c) => c.isOverdue);
  }

  // Search by tracking token or keyword
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.roomNumber.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q) ||
        c.studentRoll.toLowerCase().includes(q) ||
        c.hostelName.toLowerCase().includes(q)
    );
  }

  // Sort
  if (params.sortBy === 'newest') {
    result.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  } else if (params.sortBy === 'priority') {
    const pWeight: Record<ComplaintPriority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    result.sort((a, b) => pWeight[b.priority] - pWeight[a.priority]);
  } else if (params.sortBy === 'deadline') {
    result.sort((a, b) => new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime());
  }

  return { complaints: result, total: result.length };
}

export async function fetchComplaintById(
  id: string,
  userRole?: UserRole,
  userId?: string
): Promise<{ complaint: Complaint }> {
  refreshOverdueStatuses();
  const c = complaints.find((item) => item.id.toUpperCase() === id.toUpperCase());
  if (!c) {
    throw new Error(`Complaint with tracking ID "${id}" was not found.`);
  }

  // Deep clone to sanitize comments
  const clone = JSON.parse(JSON.stringify(c));
  if (userRole === 'student') {
    clone.comments = clone.comments.filter((comment: ComplaintComment) => !comment.isInternal);
  }

  return { complaint: clone };
}

export async function submitComplaint(payload: {
  title: string;
  description: string;
  category: string;
  priority?: ComplaintPriority;
  studentId: string;
  hostelId: string;
  block?: string;
  roomNumber: string;
  attachments?: any[];
}): Promise<{ complaint: Complaint; trackingId: string; message: string }> {
  const student = users.find((u) => u.id === payload.studentId) || users[0];
  const hostel = hostels.find((h) => h.id === payload.hostelId) || hostels[0];
  const catObj = categories.find((c) => c.id === payload.category);

  // Generate unique tracking token HC-2026-XXXX
  const trackingId = `HC-2026-${1040 + complaints.length + 1}`;
  const resolvedPriority: ComplaintPriority = payload.priority || catObj?.defaultPriority || 'Medium';
  const slaHours = catObj ? catObj.slaHours : 24;
  const now = new Date();
  const deadline = new Date(now.getTime() + slaHours * 3600000);

  // Auto routing rule matching
  let initialStatus: ComplaintStatus = 'Submitted';
  let assignedUser: User | undefined;
  let escalationLevel = 0;

  if (resolvedPriority === 'Critical' || payload.category === 'cat-rag') {
    assignedUser = users.find((u) => u.role === 'dean') || users.find((u) => u.role === 'admin');
    initialStatus = 'Escalated';
    escalationLevel = 2;
  } else {
    assignedUser =
      users.find((u) => u.role === 'warden' && u.hostelId === payload.hostelId) ||
      users.find((u) => u.role === 'warden');
    initialStatus = 'Assigned';
  }

  const newComplaint: Complaint = {
    id: trackingId,
    title: payload.title.trim(),
    description: payload.description.trim(),
    category: payload.category,
    priority: resolvedPriority,
    status: initialStatus,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    studentPhone: student.phone,
    studentRoll: student.rollNumber || '23MCA-REG',
    hostelId: hostel.id,
    hostelName: hostel.name,
    block: payload.block || student.block || 'Block A',
    roomNumber: payload.roomNumber.trim(),
    departmentId: student.departmentId,
    departmentName: student.departmentName,
    assignedToId: assignedUser?.id,
    assignedToName: assignedUser?.name,
    assignedToRole: assignedUser?.role,
    submissionDate: now.toISOString(),
    updatedDate: now.toISOString(),
    slaHours,
    slaDeadline: deadline.toISOString(),
    isOverdue: false,
    escalationLevel,
    attachments: (payload.attachments || []).map((att: any, i: number) => ({
      id: `att-${Date.now()}-${i}`,
      name: att.name || `photo_${i + 1}.jpg`,
      url: att.url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
      size: att.size || '1.5 MB',
      fileType: 'image/jpeg',
    })),
    timeline: [
      {
        id: `tl-${Date.now()}-1`,
        timestamp: now.toISOString(),
        action: 'Complaint Registered',
        actorId: student.id,
        actorName: student.name,
        actorRole: 'student',
        notes: `Grievance registered under ${catObj?.name || payload.category} with ${resolvedPriority} priority. Unique tracking token ${trackingId} generated.`,
      },
    ],
    comments: [],
  };

  if (assignedUser) {
    newComplaint.timeline.push({
      id: `tl-${Date.now()}-2`,
      timestamp: new Date(now.getTime() + 1000).toISOString(),
      action: initialStatus === 'Escalated' ? 'Escalated to Executive Authority' : 'Assigned to Staff',
      actorId: 'usr-adm-01',
      actorName: 'HostelCare Routing Engine',
      actorRole: 'admin',
      previousStatus: 'Submitted',
      newStatus: initialStatus,
      notes: `Automated routing assigned case to ${assignedUser.name} (${assignedUser.designation || assignedUser.role}).`,
    });

    notifications.unshift({
      id: `notif-${Date.now()}-assign`,
      userId: assignedUser.id,
      title: `New Complaint Assigned (${trackingId})`,
      message: `${student.name} logged "${payload.title}" for ${hostel.name} ${newComplaint.block} ${newComplaint.roomNumber}. Priority: ${resolvedPriority}`,
      complaintId: trackingId,
      type: 'assignment',
      isRead: false,
      createdAt: now.toISOString(),
    });
  }

  // Student notification
  notifications.unshift({
    id: `notif-${Date.now()}-stu`,
    userId: student.id,
    title: `Complaint Submitted: ${trackingId}`,
    message: `Your grievance has been logged successfully. SLA resolution target: ${slaHours} hours.`,
    complaintId: trackingId,
    type: 'status_change',
    isRead: false,
    createdAt: now.toISOString(),
  });

  // Audit log
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: now.toISOString(),
    userId: student.id,
    userName: student.name,
    role: 'student',
    action: 'CREATE_COMPLAINT',
    targetType: 'complaint',
    targetId: trackingId,
    details: `Filed "${payload.title}" at ${hostel.name} room ${payload.roomNumber}. Priority: ${resolvedPriority}`,
  });

  complaints.unshift(newComplaint);
  setStored('complaints', complaints);
  setStored('notifications', notifications);
  setStored('audit_logs', auditLogs);

  return {
    complaint: newComplaint,
    trackingId,
    message: `Complaint submitted successfully. Your tracking ID is ${trackingId}.`,
  };
}

export async function updateComplaintStatus(
  id: string,
  payload: {
    status: ComplaintStatus;
    actorId: string;
    notes?: string;
    rejectionReason?: string;
    resolutionNotes?: string;
  }
): Promise<{ complaint: Complaint }> {
  const c = complaints.find((item) => item.id.toUpperCase() === id.toUpperCase());
  if (!c) throw new Error('Complaint not found.');

  const actor = users.find((u) => u.id === payload.actorId) || users[0];
  const prevStatus = c.status;
  const now = new Date();

  c.status = payload.status;
  c.updatedDate = now.toISOString();

  if (payload.status === 'Resolved' || payload.status === 'Closed') {
    c.resolvedDate = now.toISOString();
    if (payload.resolutionNotes) c.resolutionNotes = payload.resolutionNotes;
  }
  if (payload.status === 'Rejected') {
    c.rejectionReason = payload.rejectionReason || payload.notes || 'Does not comply with hostel criteria.';
  }

  c.timeline.push({
    id: `tl-${Date.now()}`,
    timestamp: now.toISOString(),
    action: `Status Updated to ${payload.status}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    previousStatus: prevStatus,
    newStatus: payload.status,
    notes: payload.notes || payload.resolutionNotes || payload.rejectionReason || `Shifted from ${prevStatus} to ${payload.status}.`,
  });

  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: c.studentId,
    title: `Complaint ${c.id} Update: ${payload.status}`,
    message: `${actor.name} updated status to "${payload.status}". Note: ${payload.notes || payload.resolutionNotes || 'Check details in portal.'}`,
    complaintId: c.id,
    type: 'status_change',
    isRead: false,
    createdAt: now.toISOString(),
  });

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: now.toISOString(),
    userId: actor.id,
    userName: actor.name,
    role: actor.role,
    action: 'UPDATE_STATUS',
    targetType: 'complaint',
    targetId: c.id,
    details: `Transitioned from ${prevStatus} to ${payload.status}. Note: ${payload.notes || ''}`,
  });

  setStored('complaints', complaints);
  setStored('notifications', notifications);
  setStored('audit_logs', auditLogs);

  return { complaint: c };
}

export async function assignComplaint(
  id: string,
  payload: {
    assignedToId: string;
    actorId: string;
    instructions?: string;
  }
): Promise<{ complaint: Complaint }> {
  const c = complaints.find((item) => item.id.toUpperCase() === id.toUpperCase());
  if (!c) throw new Error('Complaint not found.');

  const target = users.find((u) => u.id === payload.assignedToId);
  if (!target) throw new Error('Target user not found.');

  const actor = users.find((u) => u.id === payload.actorId) || users[0];
  const now = new Date();

  c.assignedToId = target.id;
  c.assignedToName = target.name;
  c.assignedToRole = target.role;
  if (c.status === 'Submitted') c.status = 'Assigned';
  c.updatedDate = now.toISOString();

  c.timeline.push({
    id: `tl-${Date.now()}`,
    timestamp: now.toISOString(),
    action: `Assigned to ${target.name}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    notes: payload.instructions || `Assigned to ${target.name} (${target.role.toUpperCase()}).`,
  });

  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: target.id,
    title: `Case Assigned: ${c.id}`,
    message: `You were assigned complaint "${c.title}". Instructions: ${payload.instructions || 'Review and take prompt action.'}`,
    complaintId: c.id,
    type: 'assignment',
    isRead: false,
    createdAt: now.toISOString(),
  });

  setStored('complaints', complaints);
  setStored('notifications', notifications);
  return { complaint: c };
}

export async function escalateComplaint(
  id: string,
  payload: {
    actorId: string;
    reason: string;
    escalateToRole?: UserRole;
  }
): Promise<{ complaint: Complaint }> {
  const c = complaints.find((item) => item.id.toUpperCase() === id.toUpperCase());
  if (!c) throw new Error('Complaint not found.');

  const roleToEscalate = payload.escalateToRole || 'dean';
  const target = users.find((u) => u.role === roleToEscalate) || users.find((u) => u.role === 'dean')!;
  const actor = users.find((u) => u.id === payload.actorId) || users[0];
  const now = new Date();

  c.status = 'Escalated';
  c.escalationLevel = roleToEscalate === 'dean' ? 2 : 1;
  c.escalationReason = payload.reason;
  c.assignedToId = target.id;
  c.assignedToName = target.name;
  c.assignedToRole = target.role;
  c.updatedDate = now.toISOString();

  c.timeline.push({
    id: `tl-${Date.now()}`,
    timestamp: now.toISOString(),
    action: `Escalated to ${target.name} (${roleToEscalate.toUpperCase()})`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    notes: `Reason: ${payload.reason}`,
    previousStatus: c.status,
    newStatus: 'Escalated',
  });

  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: target.id,
    title: `ESCALATION: ${c.id}`,
    message: `${c.title} has been escalated to you by ${actor.name}. Reason: ${payload.reason}`,
    complaintId: c.id,
    type: 'escalation',
    isRead: false,
    createdAt: now.toISOString(),
  });

  setStored('complaints', complaints);
  setStored('notifications', notifications);
  return { complaint: c };
}

export async function addComment(
  id: string,
  payload: {
    authorId: string;
    message: string;
    isInternal?: boolean;
  }
): Promise<{ comment: ComplaintComment; complaint: Complaint }> {
  const c = complaints.find((item) => item.id.toUpperCase() === id.toUpperCase());
  if (!c) throw new Error('Complaint not found.');

  const author = users.find((u) => u.id === payload.authorId) || users[0];
  const actualIsInternal = author.role === 'student' ? false : Boolean(payload.isInternal);

  const newComment: ComplaintComment = {
    id: `c-${Date.now()}`,
    timestamp: new Date().toISOString(),
    authorId: author.id,
    authorName: author.name,
    authorRole: author.role,
    message: payload.message.trim(),
    isInternal: actualIsInternal,
  };

  c.comments.push(newComment);
  c.updatedDate = new Date().toISOString();

  if (!actualIsInternal) {
    if (author.role === 'student' && c.assignedToId) {
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: c.assignedToId,
        title: `Student Replied on ${c.id}`,
        message: `${author.name}: "${payload.message.substring(0, 70)}..."`,
        complaintId: c.id,
        type: 'comment',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } else if (author.role !== 'student') {
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: c.studentId,
        title: `New Message on ${c.id}`,
        message: `${author.name} (${author.role.toUpperCase()}): "${payload.message.substring(0, 70)}..."`,
        complaintId: c.id,
        type: 'comment',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  setStored('complaints', complaints);
  setStored('notifications', notifications);
  return { comment: newComment, complaint: c };
}

export async function submitFeedback(
  id: string,
  payload: {
    rating: number;
    comments: string;
    studentId: string;
  }
): Promise<{ feedback: any; complaint: Complaint }> {
  const c = complaints.find((item) => item.id.toUpperCase() === id.toUpperCase());
  if (!c) throw new Error('Complaint not found.');

  const numRating = Math.max(1, Math.min(5, Number(payload.rating) || 5));
  c.feedback = {
    rating: numRating,
    comments: (payload.comments || '').trim(),
    submittedAt: new Date().toISOString(),
  };

  if (c.status === 'Resolved') {
    c.status = 'Closed';
    c.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Feedback Submitted & Closed',
      actorId: c.studentId,
      actorName: c.studentName,
      actorRole: 'student',
      notes: `Student rated ${numRating}/5 stars. ${payload.comments ? `"${payload.comments}"` : ''}`,
      previousStatus: 'Resolved',
      newStatus: 'Closed',
    });
  }

  setStored('complaints', complaints);
  return { feedback: c.feedback, complaint: c };
}

export async function fetchStats(): Promise<{ stats: StatsSummary }> {
  refreshOverdueStatuses();
  const totalComplaints = complaints.length;
  const submitted = complaints.filter((c) => c.status === 'Submitted').length;
  const assigned = complaints.filter((c) => c.status === 'Assigned').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const awaitingStudent = complaints.filter((c) => c.status === 'Awaiting Student Information').length;
  const escalated = complaints.filter((c) => c.status === 'Escalated').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const closed = complaints.filter((c) => c.status === 'Closed').length;
  const rejected = complaints.filter((c) => c.status === 'Rejected').length;
  const criticalCount = complaints.filter((c) => c.priority === 'Critical').length;
  const overdueCount = complaints.filter((c) => c.isOverdue).length;

  const resolvedComplaints = complaints.filter((c) => c.resolvedDate);
  let totalHours = 0;
  resolvedComplaints.forEach((c) => {
    const diff = (new Date(c.resolvedDate!).getTime() - new Date(c.submissionDate).getTime()) / 3600000;
    totalHours += diff;
  });
  const avgResolutionHours = resolvedComplaints.length > 0 ? Math.round((totalHours / resolvedComplaints.length) * 10) / 10 : 14.5;

  const feedbackList = complaints.filter((c) => c.feedback).map((c) => c.feedback!.rating);
  const avgRating = feedbackList.length > 0 ? Math.round((feedbackList.reduce((a, b) => a + b, 0) / feedbackList.length) * 10) / 10 : 4.8;

  const byCategory = categories.map((cat) => {
    const count = complaints.filter((c) => c.category === cat.id).length;
    return {
      name: cat.name,
      count,
      percentage: totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0,
    };
  });

  const byHostel = hostels.map((h) => {
    const count = complaints.filter((c) => c.hostelId === h.id).length;
    const resCount = complaints.filter((c) => c.hostelId === h.id && (c.status === 'Resolved' || c.status === 'Closed')).length;
    return {
      name: h.name,
      count,
      resolved: resCount,
    };
  });

  const pList: ComplaintPriority[] = ['Critical', 'High', 'Medium', 'Low'];
  const byPriority = pList.map((p) => ({
    priority: p,
    count: complaints.filter((c) => c.priority === p).length,
  }));

  const recentTrend = [
    { date: 'Oct 07', submitted: 8, resolved: 6 },
    { date: 'Oct 08', submitted: 12, resolved: 10 },
    { date: 'Oct 09', submitted: 7, resolved: 8 },
    { date: 'Oct 10', submitted: 14, resolved: 11 },
    { date: 'Oct 11', submitted: 9, resolved: 9 },
    { date: 'Oct 12', submitted: 15, resolved: 12 },
    { date: 'Oct 13', submitted: complaints.length, resolved: resolved + closed },
  ];

  return {
    stats: {
      totalComplaints,
      submitted,
      assigned,
      inProgress,
      awaitingStudent,
      escalated,
      resolved,
      closed,
      rejected,
      criticalCount,
      overdueCount,
      avgResolutionHours,
      satisfactionRate: avgRating,
      byCategory,
      byHostel,
      byPriority,
      recentTrend,
    },
  };
}

export async function fetchNotifications(userId?: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  let result = [...notifications];
  if (userId) {
    result = result.filter((n) => n.userId === userId);
  }
  return { notifications: result, unreadCount: result.filter((n) => !n.isRead).length };
}

export async function markNotificationRead(id: string): Promise<void> {
  const n = notifications.find((item) => item.id === id);
  if (n) {
    n.isRead = true;
    setStored('notifications', notifications);
  }
}

export async function markAllNotificationsRead(userId?: string): Promise<void> {
  notifications.forEach((n) => {
    if (!userId || n.userId === userId) {
      n.isRead = true;
    }
  });
  setStored('notifications', notifications);
}

export async function fetchAuditLogs(): Promise<{ logs: AuditLog[] }> {
  return { logs: auditLogs };
}

export async function resetDemoData(): Promise<void> {
  localStorage.removeItem('hostelcare_complaints');
  localStorage.removeItem('hostelcare_users');
  localStorage.removeItem('hostelcare_notifications');
  localStorage.removeItem('hostelcare_audit_logs');
  complaints = [...INITIAL_COMPLAINTS];
  users = [...INITIAL_USERS];
  notifications = [...INITIAL_NOTIFICATIONS];
  auditLogs = [...INITIAL_AUDIT_LOGS];
}

export async function fetchSchemaSql(): Promise<string> {
  return `-- =====================================================================
-- HostelCare: College Hostel Complaint Management System
-- Relational MySQL Database Schema (MySQL 8.0+)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS \`hostelcare_db\` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE \`hostelcare_db\`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS \`audit_logs\`;
DROP TABLE IF EXISTS \`notifications\`;
DROP TABLE IF EXISTS \`complaint_feedback\`;
DROP TABLE IF EXISTS \`complaint_attachments\`;
DROP TABLE IF EXISTS \`complaint_comments\`;
DROP TABLE IF EXISTS \`complaint_history\`;
DROP TABLE IF EXISTS \`complaint_assignments\`;
DROP TABLE IF EXISTS \`complaints\`;
DROP TABLE IF EXISTS \`routing_rules\`;
DROP TABLE IF EXISTS \`complaint_categories\`;
DROP TABLE IF EXISTS \`hostels\`;
DROP TABLE IF EXISTS \`departments\`;
DROP TABLE IF EXISTS \`users\`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE \`departments\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`code\` VARCHAR(20) NOT NULL UNIQUE,
  \`name\` VARCHAR(150) NOT NULL,
  \`hod_id\` VARCHAR(50) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB;

CREATE TABLE \`hostels\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`code\` VARCHAR(20) NOT NULL UNIQUE,
  \`name\` VARCHAR(150) NOT NULL,
  \`type\` ENUM('Boys', 'Girls', 'Co-ed') NOT NULL DEFAULT 'Boys',
  \`total_rooms\` INT NOT NULL DEFAULT 120,
  \`warden_id\` VARCHAR(50) NULL,
  \`contact_number\` VARCHAR(20) NOT NULL,
  \`blocks\` JSON NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB;

CREATE TABLE \`users\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('student', 'warden', 'hod', 'dean', 'admin') NOT NULL DEFAULT 'student',
  \`phone\` VARCHAR(20) NOT NULL,
  \`avatar\` VARCHAR(255) NULL,
  \`roll_number\` VARCHAR(50) NULL,
  \`hostel_id\` VARCHAR(50) NULL,
  \`block\` VARCHAR(50) NULL,
  \`room_number\` VARCHAR(50) NULL,
  \`department_id\` VARCHAR(50) NULL,
  \`designation\` VARCHAR(100) NULL,
  \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_users_role\` (\`role\`),
  CONSTRAINT \`fk_users_hostel\` FOREIGN KEY (\`hostel_id\`) REFERENCES \`hostels\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_users_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE \`complaint_categories\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL UNIQUE,
  \`icon\` VARCHAR(50) NOT NULL DEFAULT 'wrench',
  \`description\` TEXT NOT NULL,
  \`default_priority\` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  \`default_assignee_role\` ENUM('student', 'warden', 'hod', 'dean', 'admin') NOT NULL DEFAULT 'warden',
  \`sla_hours\` INT NOT NULL DEFAULT 24,
  \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB;

CREATE TABLE \`complaints\` (
  \`id\` VARCHAR(50) NOT NULL COMMENT 'Unique Tracking Token HC-2026-XXXX',
  \`title\` VARCHAR(255) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`category_id\` VARCHAR(50) NOT NULL,
  \`priority\` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  \`status\` ENUM('Submitted', 'Assigned', 'In Progress', 'Awaiting Student Information', 'Escalated', 'Resolved', 'Closed', 'Reopened', 'Rejected') NOT NULL DEFAULT 'Submitted',
  \`student_id\` VARCHAR(50) NOT NULL,
  \`hostel_id\` VARCHAR(50) NOT NULL,
  \`block\` VARCHAR(50) NOT NULL,
  \`room_number\` VARCHAR(50) NOT NULL,
  \`department_id\` VARCHAR(50) NULL,
  \`assigned_to_id\` VARCHAR(50) NULL,
  \`submission_date\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_date\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`resolved_date\` TIMESTAMP NULL,
  \`sla_hours\` INT NOT NULL DEFAULT 24,
  \`sla_deadline\` TIMESTAMP NOT NULL,
  \`is_overdue\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`escalation_level\` INT NOT NULL DEFAULT 0,
  \`escalation_reason\` TEXT NULL,
  \`rejection_reason\` TEXT NULL,
  \`resolution_notes\` TEXT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_complaints_student\` (\`student_id\`),
  INDEX \`idx_complaints_hostel\` (\`hostel_id\`),
  INDEX \`idx_complaints_status\` (\`status\`),
  CONSTRAINT \`fk_complaints_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`complaint_categories\` (\`id\`),
  CONSTRAINT \`fk_complaints_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_complaints_hostel\` FOREIGN KEY (\`hostel_id\`) REFERENCES \`hostels\` (\`id\`)
) ENGINE=InnoDB;

CREATE TABLE \`complaint_history\` (
  \`id\` INT AUTO_INCREMENT NOT NULL,
  \`complaint_id\` VARCHAR(50) NOT NULL,
  \`actor_id\` VARCHAR(50) NOT NULL,
  \`action\` VARCHAR(100) NOT NULL,
  \`previous_status\` VARCHAR(50) NULL,
  \`new_status\` VARCHAR(50) NULL,
  \`notes\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_hist_complaint\` FOREIGN KEY (\`complaint_id\`) REFERENCES \`complaints\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE \`complaint_comments\` (
  \`id\` INT AUTO_INCREMENT NOT NULL,
  \`complaint_id\` VARCHAR(50) NOT NULL,
  \`author_id\` VARCHAR(50) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`is_internal\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_comment_complaint\` FOREIGN KEY (\`complaint_id\`) REFERENCES \`complaints\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE \`complaint_feedback\` (
  \`id\` INT AUTO_INCREMENT NOT NULL,
  \`complaint_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`student_id\` VARCHAR(50) NOT NULL,
  \`rating\` TINYINT NOT NULL CHECK (\`rating\` BETWEEN 1 AND 5),
  \`comments\` TEXT NULL,
  \`submitted_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_feedback_complaint\` FOREIGN KEY (\`complaint_id\`) REFERENCES \`complaints\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE \`routing_rules\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`category_id\` VARCHAR(50) NOT NULL,
  \`priority\` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
  \`target_role\` ENUM('student', 'warden', 'hod', 'dean', 'admin') NOT NULL DEFAULT 'warden',
  \`auto_escalate_hours\` INT NOT NULL DEFAULT 24,
  \`escalate_to_role\` ENUM('student', 'warden', 'hod', 'dean', 'admin') NOT NULL DEFAULT 'dean',
  \`notify_dean\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`description\` VARCHAR(255) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB;
`;
}
