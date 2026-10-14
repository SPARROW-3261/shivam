-- =====================================================================
-- HostelCare: College Hostel Complaint Management System
-- Relational MySQL Database Schema (MySQL 8.0+)
-- Designed for MCA Final-Year Project Demonstration & Production
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `hostelcare_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `hostelcare_db`;

-- Drop existing tables in reverse dependency order
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `complaint_feedback`;
DROP TABLE IF EXISTS `complaint_attachments`;
DROP TABLE IF EXISTS `complaint_comments`;
DROP TABLE IF EXISTS `complaint_history`;
DROP TABLE IF EXISTS `complaint_assignments`;
DROP TABLE IF EXISTS `complaints`;
DROP TABLE IF EXISTS `routing_rules`;
DROP TABLE IF EXISTS `complaint_categories`;
DROP TABLE IF EXISTS `hostels`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `departments` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `hod_id` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. HOSTELS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `hostels` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `type` ENUM('Boys', 'Girls', 'Co-ed') NOT NULL DEFAULT 'Boys',
  `total_rooms` INT NOT NULL DEFAULT 120,
  `warden_id` VARCHAR(50) NULL,
  `contact_number` VARCHAR(20) NOT NULL,
  `blocks` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. USERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'warden', 'hod', 'dean', 'admin') NOT NULL DEFAULT 'student',
  `phone` VARCHAR(20) NOT NULL,
  `avatar` VARCHAR(255) NULL,
  `roll_number` VARCHAR(50) NULL,
  `hostel_id` VARCHAR(50) NULL,
  `block` VARCHAR(50) NULL,
  `room_number` VARCHAR(50) NULL,
  `department_id` VARCHAR(50) NULL,
  `designation` VARCHAR(100) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`),
  CONSTRAINT `fk_users_hostel` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. COMPLAINT CATEGORIES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `complaint_categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `icon` VARCHAR(50) NOT NULL DEFAULT 'wrench',
  `description` TEXT NOT NULL,
  `default_priority` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  `default_assignee_role` ENUM('student', 'warden', 'hod', 'dean', 'admin') NOT NULL DEFAULT 'warden',
  `sla_hours` INT NOT NULL DEFAULT 24,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. COMPLAINTS MASTER TABLE
-- ---------------------------------------------------------------------
CREATE TABLE `complaints` (
  `id` VARCHAR(50) NOT NULL COMMENT 'Unique Tracking Token, e.g. HC-2026-1041',
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `priority` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  `status` ENUM(
    'Submitted',
    'Assigned',
    'In Progress',
    'Awaiting Student Information',
    'Escalated',
    'Resolved',
    'Closed',
    'Reopened',
    'Rejected'
  ) NOT NULL DEFAULT 'Submitted',
  `student_id` VARCHAR(50) NOT NULL,
  `hostel_id` VARCHAR(50) NOT NULL,
  `block` VARCHAR(50) NOT NULL,
  `room_number` VARCHAR(50) NOT NULL,
  `department_id` VARCHAR(50) NULL,
  `assigned_to_id` VARCHAR(50) NULL,
  `submission_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resolved_date` TIMESTAMP NULL,
  `sla_hours` INT NOT NULL DEFAULT 24,
  `sla_deadline` TIMESTAMP NOT NULL,
  `is_overdue` BOOLEAN NOT NULL DEFAULT FALSE,
  `escalation_level` INT NOT NULL DEFAULT 0,
  `escalation_reason` TEXT NULL,
  `rejection_reason` TEXT NULL,
  `resolution_notes` TEXT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_complaints_student` (`student_id`),
  INDEX `idx_complaints_hostel` (`hostel_id`),
  INDEX `idx_complaints_status` (`status`),
  CONSTRAINT `fk_complaints_category` FOREIGN KEY (`category_id`) REFERENCES `complaint_categories` (`id`),
  CONSTRAINT `fk_complaints_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_complaints_hostel` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`),
  CONSTRAINT `fk_complaints_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaints_assigned_user` FOREIGN KEY (`assigned_to_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. COMPLAINT ASSIGNMENTS
-- ---------------------------------------------------------------------
CREATE TABLE `complaint_assignments` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `complaint_id` VARCHAR(50) NOT NULL,
  `assigned_by_id` VARCHAR(50) NOT NULL,
  `assigned_to_id` VARCHAR(50) NOT NULL,
  `instructions` TEXT NULL,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_assign_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. COMPLAINT HISTORY (Timeline audit)
-- ---------------------------------------------------------------------
CREATE TABLE `complaint_history` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `complaint_id` VARCHAR(50) NOT NULL,
  `actor_id` VARCHAR(50) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `previous_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hist_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. COMPLAINT COMMENTS
-- ---------------------------------------------------------------------
CREATE TABLE `complaint_comments` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `complaint_id` VARCHAR(50) NOT NULL,
  `author_id` VARCHAR(50) NOT NULL,
  `message` TEXT NOT NULL,
  `is_internal` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_comment_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. COMPLAINT ATTACHMENTS
-- ---------------------------------------------------------------------
CREATE TABLE `complaint_attachments` (
  `id` VARCHAR(50) NOT NULL,
  `complaint_id` VARCHAR(50) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_url` TEXT NOT NULL,
  `file_size` VARCHAR(50) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_attach_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. COMPLAINT FEEDBACK
-- ---------------------------------------------------------------------
CREATE TABLE `complaint_feedback` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `complaint_id` VARCHAR(50) NOT NULL UNIQUE,
  `student_id` VARCHAR(50) NOT NULL,
  `rating` TINYINT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comments` TEXT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_feedback_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. ROUTING RULES
-- ---------------------------------------------------------------------
CREATE TABLE `routing_rules` (
  `id` VARCHAR(50) NOT NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `priority` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
  `target_role` ENUM('student', 'warden', 'hod', 'dean', 'admin') NOT NULL DEFAULT 'warden',
  `auto_escalate_hours` INT NOT NULL DEFAULT 24,
  `escalate_to_role` ENUM('student', 'warden', 'hod', 'dean', 'admin') NOT NULL DEFAULT 'dean',
  `notify_dean` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `description` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE `notifications` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `complaint_id` VARCHAR(50) NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'system',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_user` (`user_id`, `is_read`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 13. AUDIT LOGS
-- ---------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(50) NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(50) NOT NULL,
  `target_id` VARCHAR(50) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
