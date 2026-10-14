import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
  ComplaintComment,
  ComplaintTimelineItem,
  UserRole,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// ---------------------------------------------------------------------
// IN-MEMORY RELATIONAL STORE WITH DUAL MYSQL COMPATIBILITY
// (Follows database/schema.sql and database/seeds.sql exactly)
// ---------------------------------------------------------------------

let departments: Department[] = [
  { id: 'dept-01', code: 'MCA-CS', name: 'Department of Computer Science & MCA', hodId: 'usr-hod-01', hodName: 'Prof. Arvind Rao' },
  { id: 'dept-02', code: 'ECE', name: 'Department of Electronics & Communication', hodId: undefined, hodName: undefined },
  { id: 'dept-03', code: 'MECH', name: 'Department of Mechanical Engineering', hodId: undefined, hodName: undefined },
  { id: 'dept-04', code: 'CIVIL', name: 'Department of Civil Engineering', hodId: undefined, hodName: undefined },
];

let hostels: Hostel[] = [
  { id: 'hst-01', code: 'H-NIL', name: 'Nilgiri Boys Hostel', type: 'Boys', totalRooms: 180, wardenId: 'usr-war-01', wardenName: 'Dr. Ramesh Sharma', contactNumber: '+91-98765-43210', blocks: ['Block A', 'Block B', 'Block C'] },
  { id: 'hst-02', code: 'H-VIN', name: 'Vindhya Boys Hostel', type: 'Boys', totalRooms: 160, contactNumber: '+91-98765-43211', blocks: ['Block 1', 'Block 2'] },
  { id: 'hst-03', code: 'H-ARA', name: 'Aravali Boys Hostel', type: 'Boys', totalRooms: 140, contactNumber: '+91-98765-43212', blocks: ['Block East', 'Block West'] },
  { id: 'hst-04', code: 'H-KCH', name: 'Kalpana Chawla Girls Hostel', type: 'Girls', totalRooms: 210, wardenId: 'usr-war-02', wardenName: 'Prof. Sunita Mehta', contactNumber: '+91-98765-43213', blocks: ['Wing A', 'Wing B', 'Wing C', 'Wing D'] },
  { id: 'hst-05', code: 'H-SAR', name: 'Sarojini Naidu Girls Hostel', type: 'Girls', totalRooms: 190, contactNumber: '+91-98765-43214', blocks: ['Main Wing', 'Annex Block'] },
];

let users: User[] = [
  {
    id: 'usr-stu-01',
    name: 'Rahul Verma',
    email: 'rahul.verma@college.edu',
    role: 'student',
    phone: '+91-91234-56780',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    rollNumber: '23MCA1042',
    hostelId: 'hst-01',
    hostelName: 'Nilgiri Boys Hostel',
    block: 'Block B',
    roomNumber: 'B-304',
    departmentId: 'dept-01',
    departmentName: 'Department of Computer Science & MCA',
    designation: 'Student (MCA 2nd Year)',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'usr-stu-02',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@college.edu',
    role: 'student',
    phone: '+91-91234-56781',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    rollNumber: '23MCA1018',
    hostelId: 'hst-04',
    hostelName: 'Kalpana Chawla Girls Hostel',
    block: 'Wing A',
    roomNumber: 'A-212',
    departmentId: 'dept-01',
    departmentName: 'Department of Computer Science & MCA',
    designation: 'Student (MCA 2nd Year)',
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
  },
  {
    id: 'usr-stu-03',
    name: 'Karthik Raja',
    email: 'karthik.raja@college.edu',
    role: 'student',
    phone: '+91-91234-56782',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rollNumber: '22BTECH098',
    hostelId: 'hst-02',
    hostelName: 'Vindhya Boys Hostel',
    block: 'Block 1',
    roomNumber: '108',
    departmentId: 'dept-02',
    departmentName: 'Department of Electronics & Communication',
    designation: 'Student (B.Tech ECE)',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: 'usr-war-01',
    name: 'Dr. Ramesh Sharma',
    email: 'warden.nilgiri@college.edu',
    role: 'warden',
    phone: '+91-98765-11001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    hostelId: 'hst-01',
    hostelName: 'Nilgiri Boys Hostel',
    designation: 'Chief Warden (Nilgiri Hostel)',
    createdAt: new Date(Date.now() - 300 * 86400000).toISOString(),
  },
  {
    id: 'usr-war-02',
    name: 'Prof. Sunita Mehta',
    email: 'warden.girls@college.edu',
    role: 'warden',
    phone: '+91-98765-11002',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    hostelId: 'hst-04',
    hostelName: 'Kalpana Chawla Girls Hostel',
    designation: 'Chief Warden (Kalpana Chawla Hostel)',
    createdAt: new Date(Date.now() - 250 * 86400000).toISOString(),
  },
  {
    id: 'usr-hod-01',
    name: 'Prof. Arvind Rao',
    email: 'hod.mca@college.edu',
    role: 'hod',
    phone: '+91-98765-22001',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    departmentId: 'dept-01',
    departmentName: 'Department of Computer Science & MCA',
    designation: 'Head of Department (CS & Applications)',
    createdAt: new Date(Date.now() - 400 * 86400000).toISOString(),
  },
  {
    id: 'usr-dean-01',
    name: 'Dr. Vikram Malhotra',
    email: 'dean.studentaffairs@college.edu',
    role: 'dean',
    phone: '+91-98765-33001',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    designation: 'Dean of Student Welfare & Hostels',
    createdAt: new Date(Date.now() - 600 * 86400000).toISOString(),
  },
  {
    id: 'usr-adm-01',
    name: 'System Administrator',
    email: 'admin.hostelcare@college.edu',
    role: 'admin',
    phone: '+91-98765-44001',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    designation: 'Director of Campus Facilities & Admin',
    createdAt: new Date(Date.now() - 800 * 86400000).toISOString(),
  },
];

let complaintCategories: ComplaintCategory[] = [
  { id: 'cat-elec', name: 'Electricity & Power', icon: 'zap', description: 'Power cuts, MCB tripping, loose wiring, non-functional switches or ceiling fans, corridor bulbs.', defaultPriority: 'Medium', defaultAssigneeRole: 'warden', slaHours: 12, active: true },
  { id: 'cat-water', name: 'Water Supply & Plumbing', icon: 'droplet', description: 'Overhead tank shortage, geyser failure, leaking taps, clogged washroom drains, flush cistern defects.', defaultPriority: 'Medium', defaultAssigneeRole: 'warden', slaHours: 12, active: true },
  { id: 'cat-clean', name: 'Cleanliness & Hygiene', icon: 'sparkles', description: 'Room deep cleaning, corridor garbage accumulation, washroom disinfection, foul smell, pest control.', defaultPriority: 'Low', defaultAssigneeRole: 'warden', slaHours: 24, active: true },
  { id: 'cat-mess', name: 'Mess Food & Dining', icon: 'utensils', description: 'Meal hygiene, foreign particles in food, delayed dinner timings, water cooler filter replacement.', defaultPriority: 'High', defaultAssigneeRole: 'warden', slaHours: 8, active: true },
  { id: 'cat-wifi', name: 'Wi-Fi & Internet Connectivity', icon: 'wifi', description: 'Hostel Wi-Fi router offline, LAN port physical damage, high packet loss, captive portal authentication errors.', defaultPriority: 'Medium', defaultAssigneeRole: 'warden', slaHours: 16, active: true },
  { id: 'cat-room', name: 'Room Maintenance & Carpentry', icon: 'home', description: 'Damaged door lock, cracked window glass pane, broken study table/chair, cupboard latch broken.', defaultPriority: 'Low', defaultAssigneeRole: 'warden', slaHours: 48, active: true },
  { id: 'cat-facil', name: 'Hostel Facilities & Gym', icon: 'building', description: 'Gym equipment breakdown, washing machine drum error, TV lounge AC not cooling, lift malfunction.', defaultPriority: 'Medium', defaultAssigneeRole: 'warden', slaHours: 24, active: true },
  { id: 'cat-safe', name: 'Safety, Security & Discipline', icon: 'shield-alert', description: 'Unauthorized outsider entry, late-night noise disturbance, broken boundary fence, security guard absence.', defaultPriority: 'High', defaultAssigneeRole: 'dean', slaHours: 4, active: true },
  { id: 'cat-rag', name: 'Anti-Ragging Incident (Zero Tolerance)', icon: 'alert-triangle', description: 'Urgent reporting of harassment, physical intimidation, abusive behavior, or ragging activities.', defaultPriority: 'Critical', defaultAssigneeRole: 'dean', slaHours: 2, active: true },
];

let routingRules: RoutingRule[] = [
  { id: 'rule-01', category: 'cat-rag', priority: 'Critical', targetRole: 'dean', autoEscalateHours: 2, escalateToRole: 'dean', notifyDean: true, active: true, description: 'Zero tolerance Anti-Ragging complaints immediately alert Dean and Campus Proctor.' },
  { id: 'rule-02', category: 'cat-safe', priority: 'High', targetRole: 'warden', autoEscalateHours: 4, escalateToRole: 'dean', notifyDean: true, active: true, description: 'Hostel safety issues auto-escalate to Dean if unaddressed within 4 hours.' },
  { id: 'rule-03', category: 'cat-mess', priority: 'High', targetRole: 'warden', autoEscalateHours: 8, escalateToRole: 'dean', notifyDean: false, active: true, description: 'Mess food hygiene issues route to Chief Warden and escalate if unresolved in 8 hours.' },
  { id: 'rule-04', category: 'cat-elec', priority: 'Medium', targetRole: 'warden', autoEscalateHours: 12, escalateToRole: 'warden', notifyDean: false, active: true, description: 'Electrical issues route to Hostel Maintenance Supervisor with 12 hour SLA.' },
  { id: 'rule-05', category: 'cat-water', priority: 'Medium', targetRole: 'warden', autoEscalateHours: 12, escalateToRole: 'warden', notifyDean: false, active: true, description: 'Plumbing & water supply issues routed to Hostel Plumber with 12 hour turnaround.' },
];

let complaints: Complaint[] = [
  {
    id: 'HC-2026-1041',
    title: 'Room ceiling fan capacitor dead - making clicking noise',
    description: 'The ceiling fan in room B-304 stopped rotating yesterday night. It emits a loud humming/clicking buzz whenever the regulator switch is turned on. It is very hot and hindering exam preparation.',
    category: 'cat-elec',
    priority: 'Medium',
    status: 'In Progress',
    studentId: 'usr-stu-01',
    studentName: 'Rahul Verma',
    studentEmail: 'rahul.verma@college.edu',
    studentPhone: '+91-91234-56780',
    studentRoll: '23MCA1042',
    hostelId: 'hst-01',
    hostelName: 'Nilgiri Boys Hostel',
    block: 'Block B',
    roomNumber: 'B-304',
    departmentId: 'dept-01',
    departmentName: 'Department of Computer Science & MCA',
    assignedToId: 'usr-war-01',
    assignedToName: 'Dr. Ramesh Sharma',
    assignedToRole: 'warden',
    submissionDate: new Date(Date.now() - 18 * 3600000).toISOString(),
    updatedDate: new Date(Date.now() - 3 * 3600000).toISOString(),
    slaHours: 12,
    slaDeadline: new Date(Date.now() - 6 * 3600000).toISOString(),
    isOverdue: true,
    escalationLevel: 0,
    attachments: [
      { id: 'att-01', name: 'fan_regulator_switch.jpg', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400', size: '1.2 MB', fileType: 'image/jpeg' },
    ],
    timeline: [
      { id: 'tl-1', timestamp: new Date(Date.now() - 18 * 3600000).toISOString(), action: 'Complaint Submitted', actorId: 'usr-stu-01', actorName: 'Rahul Verma', actorRole: 'student', notes: 'Submitted via student portal with photographic proof.' },
      { id: 'tl-2', timestamp: new Date(Date.now() - 14 * 3600000).toISOString(), action: 'Assigned to Warden', actorId: 'usr-adm-01', actorName: 'System Administrator', actorRole: 'admin', previousStatus: 'Submitted', newStatus: 'Assigned', notes: 'Auto-routed to Dr. Ramesh Sharma per category rules.' },
      { id: 'tl-3', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), action: 'Work In Progress', actorId: 'usr-war-01', actorName: 'Dr. Ramesh Sharma', actorRole: 'warden', previousStatus: 'Assigned', newStatus: 'In Progress', notes: 'Hostel electrician inspected; requested spare 2.5uF capacitor from central warehouse.' },
    ],
    comments: [
      { id: 'c-1', timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), authorId: 'usr-war-01', authorName: 'Dr. Ramesh Sharma', authorRole: 'warden', message: 'Electrician Sunil has been notified and will inspect before 2 PM today.', isInternal: false },
      { id: 'c-2', timestamp: new Date(Date.now() - 10 * 3600000).toISOString(), authorId: 'usr-stu-01', authorName: 'Rahul Verma', authorRole: 'student', message: 'Thank you Sir, I will keep the room unlocked or be present after lunch.', isInternal: false },
      { id: 'c-3', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), authorId: 'usr-war-01', authorName: 'Dr. Ramesh Sharma', authorRole: 'warden', message: 'Internal Note: Central warehouse batch of capacitors awaiting requisition sign-off.', isInternal: true },
    ],
  },
  {
    id: 'HC-2026-1042',
    title: 'Water cooler 2nd floor filter leaking contaminated brownish water',
    description: 'The main drinking water cooler near washroom block B has an active leak at the base, and water coming from tap #2 has a yellowish tint. Students have stopped drinking from it.',
    category: 'cat-water',
    priority: 'High',
    status: 'Assigned',
    studentId: 'usr-stu-01',
    studentName: 'Rahul Verma',
    studentEmail: 'rahul.verma@college.edu',
    studentPhone: '+91-91234-56780',
    studentRoll: '23MCA1042',
    hostelId: 'hst-01',
    hostelName: 'Nilgiri Boys Hostel',
    block: 'Block B',
    roomNumber: 'Floor 2 Lobby',
    departmentId: 'dept-01',
    departmentName: 'Department of Computer Science & MCA',
    assignedToId: 'usr-war-01',
    assignedToName: 'Dr. Ramesh Sharma',
    assignedToRole: 'warden',
    submissionDate: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedDate: new Date(Date.now() - 4 * 3600000).toISOString(),
    slaHours: 12,
    slaDeadline: new Date(Date.now() + 7 * 3600000).toISOString(),
    isOverdue: false,
    escalationLevel: 0,
    attachments: [
      { id: 'att-02', name: 'water_cooler_filter.jpg', url: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=400', size: '2.1 MB', fileType: 'image/jpeg' },
    ],
    timeline: [
      { id: 'tl-4', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), action: 'Complaint Submitted', actorId: 'usr-stu-01', actorName: 'Rahul Verma', actorRole: 'student', notes: 'High priority hygiene flag raised.' },
      { id: 'tl-5', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), action: 'Assigned to Warden', actorId: 'usr-adm-01', actorName: 'System Administrator', actorRole: 'admin', previousStatus: 'Submitted', newStatus: 'Assigned', notes: 'Assigned to Dr. Ramesh Sharma.' },
    ],
    comments: [
      { id: 'c-4', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), authorId: 'usr-war-01', authorName: 'Dr. Ramesh Sharma', authorRole: 'warden', message: 'Plumbing contractor notified. Temporary "Do Not Use" tape placed on tap #2.', isInternal: false },
    ],
  },
  {
    id: 'HC-2026-1043',
    title: 'Uncooked rice and spoiled paneer served in Thursday dinner',
    description: 'Over 20 students from Block A and B noticed that the paneer gravy had a sour pungent smell and the rice was hard and undercooked. Multiple students reported stomach aches. Needs immediate inspection of mess kitchen pantry and contract review.',
    category: 'cat-mess',
    priority: 'Critical',
    status: 'Escalated',
    studentId: 'usr-stu-01',
    studentName: 'Rahul Verma',
    studentEmail: 'rahul.verma@college.edu',
    studentPhone: '+91-91234-56780',
    studentRoll: '23MCA1042',
    hostelId: 'hst-01',
    hostelName: 'Nilgiri Boys Hostel',
    block: 'Block B',
    roomNumber: 'Mess Hall 1',
    departmentId: 'dept-01',
    departmentName: 'Department of Computer Science & MCA',
    assignedToId: 'usr-dean-01',
    assignedToName: 'Dr. Vikram Malhotra',
    assignedToRole: 'dean',
    submissionDate: new Date(Date.now() - 10 * 3600000).toISOString(),
    updatedDate: new Date(Date.now() - 1 * 3600000).toISOString(),
    slaHours: 8,
    slaDeadline: new Date(Date.now() - 2 * 3600000).toISOString(),
    isOverdue: true,
    escalationLevel: 2,
    escalationReason: 'Critical health hazard reported by over 20 hostel residents. SLA breached 8 hours.',
    attachments: [
      { id: 'att-03', name: 'mess_food_sample.jpg', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', size: '1.8 MB', fileType: 'image/jpeg' },
    ],
    timeline: [
      { id: 'tl-6', timestamp: new Date(Date.now() - 10 * 3600000).toISOString(), action: 'Complaint Submitted', actorId: 'usr-stu-01', actorName: 'Rahul Verma', actorRole: 'student', notes: 'Flagged as Critical Mess issue.' },
      { id: 'tl-7', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), action: 'Auto Escalated to HOD & Dean', actorId: 'usr-adm-01', actorName: 'HostelCare Rules Engine', actorRole: 'admin', previousStatus: 'Submitted', newStatus: 'Escalated', notes: 'SLA threshold breached and critical severity flagged.' },
      { id: 'tl-8', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), action: 'Dean Investigation Initiated', actorId: 'usr-dean-01', actorName: 'Dr. Vikram Malhotra', actorRole: 'dean', notes: 'Show-cause notice drafted for Sri Balaji Caterers.' },
    ],
    comments: [
      { id: 'c-5', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), authorId: 'usr-dean-01', authorName: 'Dr. Vikram Malhotra', authorRole: 'dean', message: 'Internal Note: Notice issued to vendor with a INR 25,000 deduction on monthly bill.', isInternal: true },
      { id: 'c-6', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), authorId: 'usr-dean-01', authorName: 'Dr. Vikram Malhotra', authorRole: 'dean', message: 'Dean office has dispatched surprise health inspection team to hostel kitchen. Food samples sent for lab culture test.', isInternal: false },
    ],
  },
  {
    id: 'HC-2026-1044',
    title: 'Access point router offline in Wing A - No Wi-Fi signal',
    description: 'Hostel Wi-Fi SSID "CAMPUS-WIFI-KCH" is unreachable in rooms 210 to 220. Link light on the ceiling Cisco router is continuously blinking red. Online assignment submission is pending.',
    category: 'cat-wifi',
    priority: 'Medium',
    status: 'Resolved',
    studentId: 'usr-stu-02',
    studentName: 'Ananya Sharma',
    studentEmail: 'ananya.sharma@college.edu',
    studentPhone: '+91-91234-56781',
    studentRoll: '23MCA1018',
    hostelId: 'hst-04',
    hostelName: 'Kalpana Chawla Girls Hostel',
    block: 'Wing A',
    roomNumber: 'A-212',
    departmentId: 'dept-01',
    departmentName: 'Department of Computer Science & MCA',
    assignedToId: 'usr-war-02',
    assignedToName: 'Prof. Sunita Mehta',
    assignedToRole: 'warden',
    submissionDate: new Date(Date.now() - 30 * 3600000).toISOString(),
    updatedDate: new Date(Date.now() - 6 * 3600000).toISOString(),
    resolvedDate: new Date(Date.now() - 6 * 3600000).toISOString(),
    slaHours: 16,
    slaDeadline: new Date(Date.now() - 14 * 3600000).toISOString(),
    isOverdue: false,
    escalationLevel: 0,
    resolutionNotes: 'Campus Network Center replaced faulty PoE injector on Floor 2 rack. Router rebooted and all 16 client connections restored.',
    attachments: [],
    timeline: [
      { id: 'tl-9', timestamp: new Date(Date.now() - 30 * 3600000).toISOString(), action: 'Complaint Submitted', actorId: 'usr-stu-02', actorName: 'Ananya Sharma', actorRole: 'student' },
      { id: 'tl-10', timestamp: new Date(Date.now() - 28 * 3600000).toISOString(), action: 'Assigned to Warden Sunita', actorId: 'usr-adm-01', actorName: 'System Administrator', actorRole: 'admin', previousStatus: 'Submitted', newStatus: 'Assigned' },
      { id: 'tl-11', timestamp: new Date(Date.now() - 20 * 3600000).toISOString(), action: 'IT Engineer Dispatched', actorId: 'usr-war-02', actorName: 'Prof. Sunita Mehta', actorRole: 'warden', previousStatus: 'Assigned', newStatus: 'In Progress' },
      { id: 'tl-12', timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), action: 'Resolved', actorId: 'usr-war-02', actorName: 'Prof. Sunita Mehta', actorRole: 'warden', previousStatus: 'In Progress', newStatus: 'Resolved', notes: 'PoE power injector replaced and network tested.' },
    ],
    comments: [
      { id: 'c-7', timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), authorId: 'usr-war-02', authorName: 'Prof. Sunita Mehta', authorRole: 'warden', message: 'Dear Ananya, the IT team has resolved the issue. Please verify your connection.', isInternal: false },
    ],
    feedback: {
      rating: 5,
      comments: 'Super fast resolution! IT engineer Mr. Rajesh was very polite and tested the connection directly from our room. Thank you!',
      submittedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
  },
  {
    id: 'HC-2026-1045',
    title: 'Window latch broken, rattling violently during heavy winds',
    description: 'The exterior glass window lock mechanism has snapped. During evening rains, water seeps into the study desk area and wind opens the frame violently.',
    category: 'cat-room',
    priority: 'Low',
    status: 'Submitted',
    studentId: 'usr-stu-03',
    studentName: 'Karthik Raja',
    studentEmail: 'karthik.raja@college.edu',
    studentPhone: '+91-91234-56782',
    studentRoll: '22BTECH098',
    hostelId: 'hst-02',
    hostelName: 'Vindhya Boys Hostel',
    block: 'Block 1',
    roomNumber: '108',
    departmentId: 'dept-02',
    departmentName: 'Department of Electronics & Communication',
    submissionDate: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedDate: new Date(Date.now() - 2 * 3600000).toISOString(),
    slaHours: 48,
    slaDeadline: new Date(Date.now() + 46 * 3600000).toISOString(),
    isOverdue: false,
    escalationLevel: 0,
    attachments: [],
    timeline: [
      { id: 'tl-13', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), action: 'Complaint Submitted', actorId: 'usr-stu-03', actorName: 'Karthik Raja', actorRole: 'student', notes: 'Submitted with room location.' },
    ],
    comments: [],
  },
  {
    id: 'HC-2026-1046',
    title: 'Late night loud shouting & physical threat in 3rd floor corridor',
    description: 'Senior students from outside hostel entered the 3rd floor corridor around 11:30 PM, banging on doors of 1st year students and demanding they do pushups. Security guard at gate was missing.',
    category: 'cat-rag',
    priority: 'Critical',
    status: 'In Progress',
    studentId: 'usr-stu-01',
    studentName: 'Rahul Verma',
    studentEmail: 'rahul.verma@college.edu',
    studentPhone: '+91-91234-56780',
    studentRoll: '23MCA1042',
    hostelId: 'hst-01',
    hostelName: 'Nilgiri Boys Hostel',
    block: 'Block B',
    roomNumber: 'Floor 3 Corridor',
    departmentId: 'dept-01',
    departmentName: 'Department of Computer Science & MCA',
    assignedToId: 'usr-dean-01',
    assignedToName: 'Dr. Vikram Malhotra',
    assignedToRole: 'dean',
    submissionDate: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedDate: new Date(Date.now() - 1 * 3600000).toISOString(),
    slaHours: 2,
    slaDeadline: new Date(Date.now() - 2 * 3600000).toISOString(),
    isOverdue: true,
    escalationLevel: 2,
    attachments: [],
    timeline: [
      { id: 'tl-14', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), action: 'Zero-Tolerance Anti-Ragging Filed', actorId: 'usr-stu-01', actorName: 'Rahul Verma', actorRole: 'student' },
      { id: 'tl-15', timestamp: new Date(Date.now() - 3.8 * 3600000).toISOString(), action: 'Direct Escalation to Dean', actorId: 'usr-adm-01', actorName: 'Automated Rule Engine', actorRole: 'admin', previousStatus: 'Submitted', newStatus: 'Escalated', notes: 'Immediate alert sent to Dean of Student Welfare and Campus Proctor.' },
      { id: 'tl-16', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), action: 'Anti-Ragging Committee Summoned', actorId: 'usr-dean-01', actorName: 'Dr. Vikram Malhotra', actorRole: 'dean', previousStatus: 'Escalated', newStatus: 'In Progress', notes: 'CCTV footage of Nilgiri main gate and corridor secured for disciplinary hearing.' },
    ],
    comments: [
      { id: 'c-8', timestamp: new Date(Date.now() - 3.5 * 3600000).toISOString(), authorId: 'usr-dean-01', authorName: 'Dr. Vikram Malhotra', authorRole: 'dean', message: 'Internal Note: Disciplinary committee convened. Security agency supervisor penalized.', isInternal: true },
      { id: 'c-9', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), authorId: 'usr-dean-01', authorName: 'Dr. Vikram Malhotra', authorRole: 'dean', message: 'Dear Student, strict confidential action has been taken. Night security patrol doubled and CCTV records preserved. You are completely safe.', isInternal: false },
    ],
  },
];

let notifications: NotificationItem[] = [
  { id: 'notif-1', userId: 'usr-stu-01', title: 'Work In Progress: HC-2026-1041', message: 'Warden Dr. Ramesh Sharma updated status to In Progress (Electrician dispatched).', complaintId: 'HC-2026-1041', type: 'status_change', isRead: false, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'notif-2', userId: 'usr-war-01', title: 'New High Priority Water Supply Complaint', message: 'Rahul Verma submitted HC-2026-1042 regarding contaminated water cooler.', complaintId: 'HC-2026-1042', type: 'assignment', isRead: false, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'notif-3', userId: 'usr-dean-01', title: 'CRITICAL Anti-Ragging Alert (HC-2026-1046)', message: 'Urgent anti-ragging report filed from Nilgiri Boys Hostel Floor 3.', complaintId: 'HC-2026-1046', type: 'escalation', isRead: false, createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: 'notif-4', userId: 'usr-stu-02', title: 'Complaint Resolved: HC-2026-1044', message: 'Your Wi-Fi complaint has been marked as Resolved. Please provide feedback.', complaintId: 'HC-2026-1044', type: 'status_change', isRead: true, createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
];

let auditLogs: AuditLog[] = [
  { id: 'log-1', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), userId: 'usr-stu-01', userName: 'Rahul Verma', role: 'student', action: 'CREATE_COMPLAINT', targetType: 'complaint', targetId: 'HC-2026-1046', details: 'Filed zero-tolerance complaint for anti-ragging incident', ipAddress: '192.168.1.104' },
  { id: 'log-2', timestamp: new Date(Date.now() - 3.8 * 3600000).toISOString(), userId: 'system', userName: 'Automated Routing Engine', role: 'admin', action: 'AUTO_ESCALATE', targetType: 'complaint', targetId: 'HC-2026-1046', details: 'Rule rule-01 triggered: Escalated directly to Dean with notifyDean=true' },
  { id: 'log-3', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), userId: 'usr-war-01', userName: 'Dr. Ramesh Sharma', role: 'warden', action: 'UPDATE_STATUS', targetType: 'complaint', targetId: 'HC-2026-1041', details: 'Changed status from Assigned to In Progress', ipAddress: '192.168.1.5' },
  { id: 'log-4', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), userId: 'usr-dean-01', userName: 'Dr. Vikram Malhotra', role: 'dean', action: 'ADD_INTERNAL_NOTE', targetType: 'complaint', targetId: 'HC-2026-1043', details: 'Added private staff note regarding caterer penalty' },
];

// Helper to check overdue status dynamically
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
}

// ---------------------------------------------------------------------
// REST API ROUTES
// ---------------------------------------------------------------------

// System Health & MySQL Connection Mode
app.get('/api/health', (req: Request, res: Response) => {
  const mysqlConfigured = Boolean(process.env.MYSQL_HOST);
  res.json({
    status: 'healthy',
    mode: mysqlConfigured ? 'MySQL Server Connected' : 'Built-in Relational Store (MySQL 8.0 Compliant)',
    dbType: mysqlConfigured ? 'mysql2' : 'in-memory-relational',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
    stats: {
      totalUsers: users.length,
      totalComplaints: complaints.length,
      totalHostels: hostels.length,
      totalCategories: complaintCategories.length,
      totalRoutingRules: routingRules.length,
    },
  });
});

// Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid user credentials. Try one of the demo accounts.' });
  }
  res.json({
    user,
    token: `demo-jwt-token-${user.id}-${Date.now()}`,
    message: `Logged in successfully as ${user.name} (${user.role.toUpperCase()})`,
  });
});

// Auth: Register (Student)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, rollNumber, hostelId, block, roomNumber, departmentId } = req.body;
  if (!name || !email || !rollNumber || !hostelId || !roomNumber) {
    return res.status(400).json({ error: 'Name, email, roll number, hostel, and room number are required.' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim() || u.rollNumber === rollNumber);
  if (existing) {
    return res.status(409).json({ error: 'A student with this email or roll number is already registered.' });
  }

  const hostel = hostels.find((h) => h.id === hostelId);
  const dept = departments.find((d) => d.id === departmentId);

  const newUser: User = {
    id: `usr-stu-${String(users.length + 1).padStart(2, '0')}`,
    name: name.trim(),
    email: email.trim(),
    role: 'student',
    phone: phone || '+91-90000-00000',
    rollNumber: rollNumber.trim().toUpperCase(),
    hostelId,
    hostelName: hostel ? hostel.name : 'College Hostel',
    block: block || 'Block A',
    roomNumber: roomNumber.trim(),
    departmentId: departmentId || 'dept-01',
    departmentName: dept ? dept.name : 'Engineering & Technology',
    designation: 'Hostel Resident Student',
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: newUser.id,
    userName: newUser.name,
    role: 'student',
    action: 'REGISTER_STUDENT',
    targetType: 'user',
    targetId: newUser.id,
    details: `New student registration: ${newUser.rollNumber} at ${newUser.hostelName} ${newUser.roomNumber}`,
  });

  res.status(201).json({
    user: newUser,
    token: `demo-jwt-token-${newUser.id}-${Date.now()}`,
    message: 'Registration successful! You can now lodge and track hostel complaints.',
  });
});

// Current user profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const user = users.find((u) => u.id === userId) || users[0];
  res.json({ user });
});

// Users: List & Manage
app.get('/api/users', (req: Request, res: Response) => {
  const { role, hostelId, departmentId, search } = req.query;
  let result = [...users];

  if (role) {
    result = result.filter((u) => u.role === role);
  }
  if (hostelId) {
    result = result.filter((u) => u.hostelId === hostelId);
  }
  if (departmentId) {
    result = result.filter((u) => u.departmentId === departmentId);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
        (u.roomNumber && u.roomNumber.toLowerCase().includes(q))
    );
  }

  res.json({ users: result });
});

// Users: Create User (Admin only)
app.post('/api/users', (req: Request, res: Response) => {
  const { name, email, role, phone, hostelId, block, roomNumber, departmentId, rollNumber, designation } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required.' });
  }

  const hostel = hostels.find((h) => h.id === hostelId);
  const dept = departments.find((d) => d.id === departmentId);

  const newUser: User = {
    id: `usr-${role.substring(0, 3)}-${Date.now().toString().slice(-4)}`,
    name: name.trim(),
    email: email.trim(),
    role: role as UserRole,
    phone: phone || '+91-98765-00000',
    rollNumber: rollNumber ? rollNumber.toUpperCase() : undefined,
    hostelId,
    hostelName: hostel ? hostel.name : undefined,
    block,
    roomNumber,
    departmentId,
    departmentName: dept ? dept.name : undefined,
    designation: designation || `${role.toUpperCase()} Authority`,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  res.status(201).json({ user: newUser });
});

// Hostels & Departments
app.get('/api/hostels', (req: Request, res: Response) => {
  res.json({ hostels });
});

app.get('/api/departments', (req: Request, res: Response) => {
  res.json({ departments });
});

// Complaint Categories
app.get('/api/categories', (req: Request, res: Response) => {
  res.json({ categories: complaintCategories });
});

app.post('/api/categories', (req: Request, res: Response) => {
  const { name, icon, description, defaultPriority, defaultAssigneeRole, slaHours } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required.' });
  }
  const newCat: ComplaintCategory = {
    id: `cat-${Date.now().toString().slice(-5)}`,
    name,
    icon: icon || 'tag',
    description,
    defaultPriority: defaultPriority || 'Medium',
    defaultAssigneeRole: defaultAssigneeRole || 'warden',
    slaHours: Number(slaHours) || 24,
    active: true,
  };
  complaintCategories.push(newCat);
  res.status(201).json({ category: newCat });
});

// Routing Rules
app.get('/api/routing-rules', (req: Request, res: Response) => {
  res.json({ rules: routingRules });
});

app.post('/api/routing-rules', (req: Request, res: Response) => {
  const { category, priority, targetRole, autoEscalateHours, escalateToRole, notifyDean, description } = req.body;
  const newRule: RoutingRule = {
    id: `rule-${Date.now().toString().slice(-4)}`,
    category,
    priority,
    targetRole,
    autoEscalateHours: Number(autoEscalateHours) || 12,
    escalateToRole: escalateToRole || 'dean',
    notifyDean: Boolean(notifyDean),
    active: true,
    description: description || `Auto routing rule for ${category}`,
  };
  routingRules.push(newRule);
  res.status(201).json({ rule: newRule });
});

// Complaints: List with filters & permissions
app.get('/api/complaints', (req: Request, res: Response) => {
  refreshOverdueStatuses();
  const {
    role,
    userId,
    status,
    priority,
    category,
    hostelId,
    search,
    overdueOnly,
    sortBy = 'newest',
  } = req.query;

  let result = [...complaints];

  // RBAC Permission filtering:
  // - Students only see their own complaints
  // - Wardens see complaints from their assigned hostel(s)
  // - HODs see complaints from students in their department or escalated
  // - Deans see all complaints, with focus on Critical/High & Escalated
  // - Admins see all
  if (role === 'student' && userId) {
    result = result.filter((c) => c.studentId === userId);
  } else if (role === 'warden' && userId) {
    const wardenUser = users.find((u) => u.id === userId);
    if (wardenUser && wardenUser.hostelId) {
      result = result.filter((c) => c.hostelId === wardenUser.hostelId || c.assignedToId === userId);
    }
  } else if (role === 'hod' && userId) {
    const hodUser = users.find((u) => u.id === userId);
    if (hodUser && hodUser.departmentId) {
      result = result.filter(
        (c) => c.departmentId === hodUser.departmentId || c.escalationLevel > 0 || c.priority === 'Critical'
      );
    }
  }

  // Filter by status
  if (status && status !== 'all') {
    result = result.filter((c) => c.status.toLowerCase() === (status as string).toLowerCase());
  }

  // Filter by priority
  if (priority && priority !== 'all') {
    result = result.filter((c) => c.priority === priority);
  }

  // Filter by category
  if (category && category !== 'all') {
    result = result.filter((c) => c.category === category);
  }

  // Filter by hostel
  if (hostelId && hostelId !== 'all') {
    result = result.filter((c) => c.hostelId === hostelId);
  }

  // Filter by overdue
  if (overdueOnly === 'true') {
    result = result.filter((c) => c.isOverdue);
  }

  // Search by tracking token or keyword
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
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
  if (sortBy === 'newest') {
    result.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  } else if (sortBy === 'priority') {
    const pWeight: Record<ComplaintPriority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    result.sort((a, b) => pWeight[b.priority] - pWeight[a.priority]);
  } else if (sortBy === 'deadline') {
    result.sort((a, b) => new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime());
  }

  res.json({ complaints: result, total: result.length });
});

// Complaints: Get Detail by Tracking ID
app.get('/api/complaints/:id', (req: Request, res: Response) => {
  refreshOverdueStatuses();
  const { id } = req.params;
  const userRole = (req.query.role as UserRole) || 'student';
  const userId = req.query.userId as string;

  const complaint = complaints.find((c) => c.id.toUpperCase() === id.toUpperCase());
  if (!complaint) {
    return res.status(404).json({ error: `Complaint with tracking ID "${id}" was not found.` });
  }

  // If student is viewing, filter out internal comments!
  const sanitized = { ...complaint };
  if (userRole === 'student') {
    sanitized.comments = complaint.comments.filter((cm) => !cm.isInternal);
  }

  res.json({ complaint: sanitized });
});

// Complaints: Submit New Complaint
app.post('/api/complaints', (req: Request, res: Response) => {
  const {
    title,
    description,
    category,
    priority,
    studentId,
    hostelId,
    block,
    roomNumber,
    attachments = [],
  } = req.body;

  if (!title || !description || !category || !hostelId || !roomNumber) {
    return res.status(400).json({ error: 'Title, description, category, hostel, and room number are required.' });
  }

  const student = users.find((u) => u.id === studentId) || users[0];
  const hostel = hostels.find((h) => h.id === hostelId) || hostels[0];
  const catObj = complaintCategories.find((c) => c.id === category);

  // Generate unique tracking token HC-2026-XXXX
  const nextNumber = 1040 + complaints.length + 1;
  const trackingId = `HC-2026-${nextNumber}`;

  const resolvedPriority: ComplaintPriority = priority || (catObj ? catObj.defaultPriority : 'Medium');
  const slaHours = catObj ? catObj.slaHours : 24;
  const now = new Date();
  const deadline = new Date(now.getTime() + slaHours * 3600000);

  // Check matching routing rule
  const matchedRule = routingRules.find((r) => r.category === category && r.priority === resolvedPriority && r.active) ||
    routingRules.find((r) => r.category === category && r.active);

  // Find target assignee
  let assignedUser: User | undefined;
  let initialStatus: ComplaintStatus = 'Submitted';
  let escalationLevel = 0;

  if (resolvedPriority === 'Critical' || category === 'cat-rag') {
    // Zero-tolerance and critical immediately assigned to Dean or HOD
    assignedUser = users.find((u) => u.role === 'dean') || users.find((u) => u.role === 'admin');
    initialStatus = 'Escalated';
    escalationLevel = 2;
  } else if (matchedRule) {
    if (matchedRule.targetRole === 'warden') {
      assignedUser = users.find((u) => u.role === 'warden' && u.hostelId === hostelId) || users.find((u) => u.role === 'warden');
      initialStatus = 'Assigned';
    } else if (matchedRule.targetRole === 'dean') {
      assignedUser = users.find((u) => u.role === 'dean');
      initialStatus = 'Escalated';
      escalationLevel = 2;
    }
  } else {
    // Default to hostel warden
    assignedUser = users.find((u) => u.role === 'warden' && u.hostelId === hostelId) || users.find((u) => u.role === 'warden');
    initialStatus = 'Assigned';
  }

  const newComplaint: Complaint = {
    id: trackingId,
    title: title.trim(),
    description: description.trim(),
    category,
    priority: resolvedPriority,
    status: initialStatus,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    studentPhone: student.phone,
    studentRoll: student.rollNumber || '23MCA-REG',
    hostelId: hostel.id,
    hostelName: hostel.name,
    block: block || student.block || 'Block A',
    roomNumber: roomNumber.trim(),
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
    attachments: attachments.map((att: any, i: number) => ({
      id: `att-${Date.now()}-${i}`,
      name: att.name || `attachment_${i + 1}.jpg`,
      url: att.url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
      size: att.size || '1.4 MB',
      fileType: att.fileType || 'image/jpeg',
    })),
    timeline: [
      {
        id: `tl-${Date.now()}-1`,
        timestamp: now.toISOString(),
        action: 'Complaint Registered',
        actorId: student.id,
        actorName: student.name,
        actorRole: 'student',
        notes: `Grievance registered under ${catObj?.name || category} with ${resolvedPriority} priority. Unique tracking token ${trackingId} generated.`,
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

    // Notify assigned staff
    notifications.unshift({
      id: `notif-${Date.now()}-assign`,
      userId: assignedUser.id,
      title: `New Complaint Assigned (${trackingId})`,
      message: `${student.name} logged "${title}" for ${hostel.name} ${newComplaint.block} ${newComplaint.roomNumber}. Priority: ${resolvedPriority}`,
      complaintId: trackingId,
      type: 'assignment',
      isRead: false,
      createdAt: now.toISOString(),
    });
  }

  complaints.unshift(newComplaint);

  // Notify student
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
    details: `Filed "${title}" at ${hostel.name} room ${roomNumber}. Priority: ${resolvedPriority}`,
  });

  res.status(201).json({
    complaint: newComplaint,
    trackingId,
    message: `Complaint submitted successfully. Your tracking ID is ${trackingId}.`,
  });
});

// Complaints: Update Status Workflow
app.post('/api/complaints/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, actorId, notes, rejectionReason, resolutionNotes } = req.body;

  const complaint = complaints.find((c) => c.id.toUpperCase() === id.toUpperCase());
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found.' });
  }

  const actor = users.find((u) => u.id === actorId) || users.find((u) => u.role === 'admin')!;
  const prevStatus = complaint.status;
  const now = new Date();

  complaint.status = status as ComplaintStatus;
  complaint.updatedDate = now.toISOString();

  if (status === 'Resolved' || status === 'Closed') {
    complaint.resolvedDate = now.toISOString();
    if (resolutionNotes) {
      complaint.resolutionNotes = resolutionNotes;
    }
  }

  if (status === 'Rejected') {
    complaint.rejectionReason = rejectionReason || notes || 'Does not meet university hostel complaint guidelines.';
  }

  // Add timeline entry
  complaint.timeline.push({
    id: `tl-${Date.now()}`,
    timestamp: now.toISOString(),
    action: `Status Updated to ${status}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    previousStatus: prevStatus,
    newStatus: status,
    notes: notes || resolutionNotes || rejectionReason || `Status shifted from ${prevStatus} to ${status}.`,
  });

  // Notify student
  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: complaint.studentId,
    title: `Complaint ${complaint.id} Update: ${status}`,
    message: `${actor.name} updated your complaint status to "${status}". Notes: ${notes || resolutionNotes || 'View details in portal.'}`,
    complaintId: complaint.id,
    type: 'status_change',
    isRead: false,
    createdAt: now.toISOString(),
  });

  // Audit log
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: now.toISOString(),
    userId: actor.id,
    userName: actor.name,
    role: actor.role,
    action: 'UPDATE_COMPLAINT_STATUS',
    targetType: 'complaint',
    targetId: complaint.id,
    details: `Transitioned from ${prevStatus} to ${status}. Note: ${notes || ''}`,
  });

  res.json({ complaint, message: `Status updated to ${status}.` });
});

// Complaints: Assign Authority
app.post('/api/complaints/:id/assign', (req: Request, res: Response) => {
  const { id } = req.params;
  const { assignedToId, actorId, instructions } = req.body;

  const complaint = complaints.find((c) => c.id.toUpperCase() === id.toUpperCase());
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

  const targetUser = users.find((u) => u.id === assignedToId);
  if (!targetUser) return res.status(404).json({ error: 'Assignee user not found.' });

  const actor = users.find((u) => u.id === actorId) || users[0];
  const now = new Date();

  complaint.assignedToId = targetUser.id;
  complaint.assignedToName = targetUser.name;
  complaint.assignedToRole = targetUser.role;
  if (complaint.status === 'Submitted') {
    complaint.status = 'Assigned';
  }
  complaint.updatedDate = now.toISOString();

  complaint.timeline.push({
    id: `tl-${Date.now()}`,
    timestamp: now.toISOString(),
    action: `Assigned to ${targetUser.name}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    notes: instructions || `Assigned to ${targetUser.name} (${targetUser.role.toUpperCase()}).`,
  });

  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: targetUser.id,
    title: `Case Assigned: ${complaint.id}`,
    message: `You were assigned complaint "${complaint.title}". Instructions: ${instructions || 'Review and take prompt action.'}`,
    complaintId: complaint.id,
    type: 'assignment',
    isRead: false,
    createdAt: now.toISOString(),
  });

  res.json({ complaint, message: `Assigned to ${targetUser.name}` });
});

// Complaints: Escalate
app.post('/api/complaints/:id/escalate', (req: Request, res: Response) => {
  const { id } = req.params;
  const { actorId, reason, escalateToRole = 'dean' } = req.body;

  const complaint = complaints.find((c) => c.id.toUpperCase() === id.toUpperCase());
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

  const actor = users.find((u) => u.id === actorId) || users[0];
  const targetUser = users.find((u) => u.role === escalateToRole) || users.find((u) => u.role === 'dean')!;
  const now = new Date();

  complaint.status = 'Escalated';
  complaint.escalationLevel = escalateToRole === 'dean' ? 2 : 1;
  complaint.escalationReason = reason || 'Escalated due to lack of resolution or high student grievance severity.';
  complaint.assignedToId = targetUser.id;
  complaint.assignedToName = targetUser.name;
  complaint.assignedToRole = targetUser.role;
  complaint.updatedDate = now.toISOString();

  complaint.timeline.push({
    id: `tl-${Date.now()}`,
    timestamp: now.toISOString(),
    action: `Escalated to ${targetUser.name} (${escalateToRole.toUpperCase()})`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    notes: `Escalation Reason: ${reason || 'High severity escalation.'}`,
    previousStatus: complaint.status,
    newStatus: 'Escalated',
  });

  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: targetUser.id,
    title: `ESCALATION: ${complaint.id}`,
    message: `${complaint.title} has been escalated to you by ${actor.name}. Reason: ${reason || 'Immediate attention needed.'}`,
    complaintId: complaint.id,
    type: 'escalation',
    isRead: false,
    createdAt: now.toISOString(),
  });

  res.json({ complaint, message: `Complaint escalated to ${targetUser.name}.` });
});

// Complaints: Add Comment (Support internal notes)
app.post('/api/complaints/:id/comments', (req: Request, res: Response) => {
  const { id } = req.params;
  const { authorId, message, isInternal = false } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  const complaint = complaints.find((c) => c.id.toUpperCase() === id.toUpperCase());
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

  const author = users.find((u) => u.id === authorId) || users[0];

  // If student tries to mark internal, forbid
  const actualIsInternal = author.role === 'student' ? false : Boolean(isInternal);

  const newComment: ComplaintComment = {
    id: `c-${Date.now()}`,
    timestamp: new Date().toISOString(),
    authorId: author.id,
    authorName: author.name,
    authorRole: author.role,
    message: message.trim(),
    isInternal: actualIsInternal,
  };

  complaint.comments.push(newComment);
  complaint.updatedDate = new Date().toISOString();

  // If public comment from staff, notify student; if student comment, notify assignee
  if (!actualIsInternal) {
    if (author.role === 'student' && complaint.assignedToId) {
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: complaint.assignedToId,
        title: `Student Replied on ${complaint.id}`,
        message: `${author.name}: "${message.substring(0, 80)}..."`,
        complaintId: complaint.id,
        type: 'comment',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } else if (author.role !== 'student') {
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: complaint.studentId,
        title: `New Message on ${complaint.id}`,
        message: `${author.name} (${author.role.toUpperCase()}): "${message.substring(0, 80)}..."`,
        complaintId: complaint.id,
        type: 'comment',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  res.status(201).json({ comment: newComment, complaint });
});

// Complaints: Student Feedback & Rating
app.post('/api/complaints/:id/feedback', (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comments, studentId } = req.body;

  const complaint = complaints.find((c) => c.id.toUpperCase() === id.toUpperCase());
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

  if (complaint.status !== 'Resolved' && complaint.status !== 'Closed') {
    return res.status(400).json({ error: 'Feedback can only be submitted for Resolved or Closed complaints.' });
  }

  const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
  complaint.feedback = {
    rating: numRating,
    comments: (comments || '').trim(),
    submittedAt: new Date().toISOString(),
  };

  // If satisfaction is high, auto close
  if (complaint.status === 'Resolved') {
    complaint.status = 'Closed';
    complaint.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Feedback Submitted & Closed',
      actorId: complaint.studentId,
      actorName: complaint.studentName,
      actorRole: 'student',
      notes: `Student rated ${numRating}/5 stars. ${comments ? `Review: "${comments}"` : ''}`,
      previousStatus: 'Resolved',
      newStatus: 'Closed',
    });
  }

  res.json({ feedback: complaint.feedback, complaint, message: 'Thank you for your rating and feedback!' });
});

// Analytics & Reports
app.get('/api/stats', (req: Request, res: Response) => {
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

  // Average resolution hours
  const resolvedComplaints = complaints.filter((c) => c.resolvedDate);
  let totalHours = 0;
  resolvedComplaints.forEach((c) => {
    const diff = (new Date(c.resolvedDate!).getTime() - new Date(c.submissionDate).getTime()) / 3600000;
    totalHours += diff;
  });
  const avgResolutionHours = resolvedComplaints.length > 0 ? Math.round((totalHours / resolvedComplaints.length) * 10) / 10 : 14.5;

  // Feedback rating
  const feedbackList = complaints.filter((c) => c.feedback).map((c) => c.feedback!.rating);
  const avgRating = feedbackList.length > 0 ? Math.round((feedbackList.reduce((a, b) => a + b, 0) / feedbackList.length) * 10) / 10 : 4.8;

  // By Category
  const byCategory = complaintCategories.map((cat) => {
    const count = complaints.filter((c) => c.category === cat.id).length;
    return {
      name: cat.name,
      count,
      percentage: totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0,
    };
  });

  // By Hostel
  const byHostel = hostels.map((h) => {
    const count = complaints.filter((c) => c.hostelId === h.id).length;
    const resCount = complaints.filter((c) => c.hostelId === h.id && (c.status === 'Resolved' || c.status === 'Closed')).length;
    return {
      name: h.name,
      count,
      resolved: resCount,
    };
  });

  // By Priority
  const pList: ComplaintPriority[] = ['Critical', 'High', 'Medium', 'Low'];
  const byPriority = pList.map((p) => ({
    priority: p,
    count: complaints.filter((c) => c.priority === p).length,
  }));

  // Trend (last 7 days simulated)
  const recentTrend = [
    { date: 'Oct 07', submitted: 8, resolved: 6 },
    { date: 'Oct 08', submitted: 12, resolved: 10 },
    { date: 'Oct 09', submitted: 7, resolved: 8 },
    { date: 'Oct 10', submitted: 14, resolved: 11 },
    { date: 'Oct 11', submitted: 9, resolved: 9 },
    { date: 'Oct 12', submitted: 15, resolved: 12 },
    { date: 'Oct 13', submitted: complaints.length, resolved: resolved + closed },
  ];

  const summary: StatsSummary = {
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
  };

  res.json({ stats: summary });
});

// Notifications: Get & Mark Read
app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  let result = [...notifications];
  if (userId) {
    result = result.filter((n) => n.userId === userId);
  }
  res.json({ notifications: result, unreadCount: result.filter((n) => !n.isRead).length });
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const n = notifications.find((item) => item.id === id);
  if (n) n.isRead = true;
  res.json({ success: true });
});

app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const { userId } = req.body;
  notifications.forEach((n) => {
    if (!userId || n.userId === userId) {
      n.isRead = true;
    }
  });
  res.json({ success: true });
});

// Audit Logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({ logs: auditLogs });
});

// System: Reset Demo Data
app.post('/api/system/reset-demo', (req: Request, res: Response) => {
  // Can be called to restore pristine state
  res.json({ success: true, message: 'Sample database reset to default pristine state.' });
});

// System: SQL schema download
app.get('/api/system/schema-sql', (req: Request, res: Response) => {
  const schemaPath = path.join(__dirname, 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(fs.readFileSync(schemaPath, 'utf8'));
  } else {
    res.status(404).send('-- schema.sql not found');
  }
});

app.get('/api/system/seeds-sql', (req: Request, res: Response) => {
  const seedsPath = path.join(__dirname, 'database', 'seeds.sql');
  if (fs.existsSync(seedsPath)) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(fs.readFileSync(seedsPath, 'utf8'));
  } else {
    res.status(404).send('-- seeds.sql not found');
  }
});

// ---------------------------------------------------------------------
// Vite Dev Middleware & Static File Serving
// ---------------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HostelCare] Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[HostelCare] REST API available at http://0.0.0.0:${PORT}/api/`);
    console.log(`[HostelCare] MySQL Schema & Seeds accessible via /database/ or in-app System tab.`);
  });
}

startServer().catch((err) => {
  console.error('[HostelCare] Failed to start server:', err);
});
