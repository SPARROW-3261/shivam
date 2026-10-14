-- =====================================================================
-- HostelCare: Seed Data for MySQL
-- Suitable for demoing college hostel workflows across all 5 roles
-- =====================================================================

USE `hostelcare_db`;

-- 1. HOSTELS SEED
INSERT INTO `hostels` (`id`, `code`, `name`, `type`, `total_rooms`, `contact_number`, `blocks`) VALUES
('hst-01', 'H-NIL', 'Nilgiri Boys Hostel', 'Boys', 180, '+91-98765-43210', '["Block A", "Block B", "Block C"]'),
('hst-02', 'H-VIN', 'Vindhya Boys Hostel', 'Boys', 160, '+91-98765-43211', '["Block 1", "Block 2"]'),
('hst-03', 'H-ARA', 'Aravali Boys Hostel', 'Boys', 140, '+91-98765-43212', '["Block East", "Block West"]'),
('hst-04', 'H-KCH', 'Kalpana Chawla Girls Hostel', 'Girls', 210, '+91-98765-43213', '["Wing A", "Wing B", "Wing C", "Wing D"]'),
('hst-05', 'H-SAR', 'Sarojini Naidu Girls Hostel', 'Girls', 190, '+91-98765-43214', '["Main Wing", "Annex Block"]');

-- 2. DEPARTMENTS SEED
INSERT INTO `departments` (`id`, `code`, `name`) VALUES
('dept-01', 'MCA-CS', 'Department of Computer Science & MCA'),
('dept-02', 'ECE', 'Department of Electronics & Communication'),
('dept-03', 'MECH', 'Department of Mechanical Engineering'),
('dept-04', 'CIVIL', 'Department of Civil Engineering');

-- 3. USERS SEED (Students, Wardens, HOD, Dean, Admin)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `avatar`, `roll_number`, `hostel_id`, `block`, `room_number`, `department_id`, `designation`) VALUES
('usr-stu-01', 'Rahul Verma', 'rahul.verma@college.edu', '$2a$10$7Z/Yw...demo', 'student', '+91-91234-56780', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', '23MCA1042', 'hst-01', 'Block B', 'B-304', 'dept-01', 'Student (MCA 2nd Year)'),
('usr-stu-02', 'Ananya Sharma', 'ananya.sharma@college.edu', '$2a$10$7Z/Yw...demo', 'student', '+91-91234-56781', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '23MCA1018', 'hst-04', 'Wing A', 'A-212', 'dept-01', 'Student (MCA 2nd Year)'),
('usr-stu-03', 'Karthik Raja', 'karthik.raja@college.edu', '$2a$10$7Z/Yw...demo', 'student', '+91-91234-56782', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '22BTECH098', 'hst-02', 'Block 1', '108', 'dept-02', 'Student (B.Tech ECE)'),

('usr-war-01', 'Dr. Ramesh Sharma', 'warden.nilgiri@college.edu', '$2a$10$7Z/Yw...demo', 'warden', '+91-98765-11001', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', NULL, 'hst-01', NULL, NULL, NULL, 'Chief Warden (Nilgiri Hostel)'),
('usr-war-02', 'Prof. Sunita Mehta', 'warden.girls@college.edu', '$2a$10$7Z/Yw...demo', 'warden', '+91-98765-11002', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', NULL, 'hst-04', NULL, NULL, NULL, 'Chief Warden (Kalpana Chawla Hostel)'),

('usr-hod-01', 'Prof. Arvind Rao', 'hod.mca@college.edu', '$2a$10$7Z/Yw...demo', 'hod', '+91-98765-22001', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', NULL, NULL, NULL, NULL, 'dept-01', 'Head of Department (CS & Applications)'),

('usr-dean-01', 'Dr. Vikram Malhotra', 'dean.studentaffairs@college.edu', '$2a$10$7Z/Yw...demo', 'dean', '+91-98765-33001', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', NULL, NULL, NULL, NULL, NULL, 'Dean of Student Welfare & Hostels'),

('usr-adm-01', 'System Administrator', 'admin.hostelcare@college.edu', '$2a$10$7Z/Yw...demo', 'admin', '+91-98765-44001', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', NULL, NULL, NULL, NULL, NULL, 'Director of Campus Facilities & Admin');

-- 4. COMPLAINT CATEGORIES SEED
INSERT INTO `complaint_categories` (`id`, `name`, `icon`, `description`, `default_priority`, `default_assignee_role`, `sla_hours`) VALUES
('cat-elec', 'Electricity & Power', 'zap', 'Power cuts, MCB tripping, loose wiring, non-functional switches or ceiling fans, corridor bulbs.', 'Medium', 'warden', 12),
('cat-water', 'Water Supply & Plumbing', 'droplet', 'Overhead tank shortage, geyser failure, leaking taps, clogged washroom drains, flush cistern defects.', 'Medium', 'warden', 12),
('cat-clean', 'Cleanliness & Hygiene', 'sparkles', 'Room deep cleaning, corridor garbage accumulation, washroom disinfection, foul smell, pest control.', 'Low', 'warden', 24),
('cat-mess', 'Mess Food & Dining', 'utensils', 'Meal hygiene, foreign particles in food, delayed dinner timings, water cooler filter replacement.', 'High', 'warden', 8),
('cat-wifi', 'Wi-Fi & Internet Connectivity', 'wifi', 'Hostel Wi-Fi router offline, LAN port physical damage, high packet loss, captive portal authentication errors.', 'Medium', 'warden', 16),
('cat-room', 'Room Maintenance & Carpentry', 'home', 'Damaged door lock, cracked window glass pane, broken study table/chair, cupboard latch broken.', 'Low', 'warden', 48),
('cat-facil', 'Hostel Facilities & Gym', 'building', 'Gym equipment breakdown, washing machine drum error, TV lounge AC not cooling, lift malfunction.', 'Medium', 'warden', 24),
('cat-safe', 'Safety, Security & Discipline', 'shield-alert', 'Unauthorized outsider entry, late-night noise disturbance, broken boundary fence, security guard absence.', 'High', 'dean', 4),
('cat-rag', 'Anti-Ragging Incident (Zero Tolerance)', 'alert-triangle', 'Urgent reporting of harassment, physical intimidation, abusive behavior, or ragging activities.', 'Critical', 'dean', 2);

-- 5. ROUTING RULES SEED
INSERT INTO `routing_rules` (`id`, `category_id`, `priority`, `target_role`, `auto_escalate_hours`, `escalate_to_role`, `notify_dean`, `description`) VALUES
('rule-01', 'cat-rag', 'Critical', 'dean', 2, 'dean', TRUE, 'Zero tolerance Anti-Ragging complaints immediately alert Dean and Campus Proctor.'),
('rule-02', 'cat-safe', 'High', 'warden', 4, 'dean', TRUE, 'Hostel safety issues auto-escalate to Dean if unaddressed within 4 hours.'),
('rule-03', 'cat-mess', 'High', 'warden', 8, 'dean', FALSE, 'Mess food hygiene issues route to Chief Warden and escalate if unresolved in 8 hours.'),
('rule-04', 'cat-elec', 'Medium', 'warden', 12, 'warden', FALSE, 'Electrical issues route to Hostel Maintenance Supervisor with 12 hour SLA.'),
('rule-05', 'cat-water', 'Medium', 'warden', 12, 'warden', FALSE, 'Plumbing & water supply issues routed to Hostel Plumber with 12 hour turnaround.');

-- 6. SAMPLE COMPLAINTS SEED
INSERT INTO `complaints` (`id`, `title`, `description`, `category_id`, `priority`, `status`, `student_id`, `hostel_id`, `block`, `room_number`, `department_id`, `assigned_to_id`, `submission_date`, `sla_hours`, `sla_deadline`, `is_overdue`, `escalation_level`) VALUES
('HC-2026-1041', 'Room ceiling fan capacitor dead - making clicking noise', 'The ceiling fan in room B-304 stopped rotating yesterday night. It emits a loud humming/clicking buzz whenever the regulator switch is turned on.', 'cat-elec', 'Medium', 'In Progress', 'usr-stu-01', 'hst-01', 'Block B', 'B-304', 'dept-01', 'usr-war-01', NOW() - INTERVAL 18 HOUR, 12, NOW() - INTERVAL 6 HOUR, TRUE, 0),

('HC-2026-1042', 'Water cooler 2nd floor filter leaking contaminated brownish water', 'The main drinking water cooler near washroom block B has an active leak at the base, and water coming from tap #2 has a yellowish tint.', 'cat-water', 'High', 'Assigned', 'usr-stu-01', 'hst-01', 'Block B', 'Floor 2 Lobby', 'dept-01', 'usr-war-01', NOW() - INTERVAL 5 HOUR, 12, NOW() + INTERVAL 7 HOUR, FALSE, 0),

('HC-2026-1043', 'Uncooked rice and spoiled paneer served in Thursday dinner', 'Over 20 students from Block A and B noticed that the paneer gravy had a sour smell and the rice was undercooked. Needs immediate inspection of mess kitchen pantry.', 'cat-mess', 'Critical', 'Escalated', 'usr-stu-01', 'hst-01', 'Block B', 'Mess Hall 1', 'dept-01', 'usr-dean-01', NOW() - INTERVAL 10 HOUR, 8, NOW() - INTERVAL 2 HOUR, TRUE, 2),

('HC-2026-1044', 'Access point router offline in Wing A - No Wi-Fi signal', 'Hostel Wi-Fi SSID "CAMPUS-WIFI-KCH" is unreachable in rooms 210 to 220. Link light on the ceiling Cisco router is continuously blinking red.', 'cat-wifi', 'Medium', 'Resolved', 'usr-stu-02', 'hst-04', 'Wing A', 'A-212', 'dept-01', 'usr-war-02', NOW() - INTERVAL 30 HOUR, 16, NOW() - INTERVAL 14 HOUR, FALSE, 0),

('HC-2026-1045', 'Window latch broken, rattling violently during heavy winds', 'The exterior glass window lock mechanism has snapped. During evening rains, water seeps into the study desk area and wind opens the frame violently.', 'cat-room', 'Low', 'Submitted', 'usr-stu-03', 'hst-02', 'Block 1', '108', 'dept-02', 'usr-war-01', NOW() - INTERVAL 2 HOUR, 48, NOW() + INTERVAL 46 HOUR, FALSE, 0);
