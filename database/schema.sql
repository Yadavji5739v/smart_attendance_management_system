CREATE DATABASE IF NOT EXISTS smart_attendance;
USE smart_attendance;

-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS attendance;
-- DROP TABLE IF EXISTS alerts;
-- DROP TABLE IF EXISTS sessions;
-- DROP TABLE IF EXISTS subjects;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS branches;
-- SET FOREIGN_KEY_CHECKS = 1;


-- BRANCHES (branch_id, branch_name, department)
CREATE TABLE branches (
    branch_id   INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    department  VARCHAR(100) NOT NULL
);

-- USERS (user_id, name, email, password, semester)
CREATE TABLE users (
    user_id   INT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    email     VARCHAR(100) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    role      ENUM('admin','faculty','student') NOT NULL DEFAULT 'student',
    branch_id INT,
    semester  INT,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

-- SUBJECTS (subject_name, subject_code, uid, total_classes)
CREATE TABLE subjects (
    subject_id   INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(150) NOT NULL,
    subject_code VARCHAR(20)  NOT NULL,
    uid          INT NOT NULL,
    branch_id    INT NOT NULL,
    total_classes INT DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

-- SESSIONS
CREATE TABLE sessions (
    session_id   INT AUTO_INCREMENT PRIMARY KEY,
    subject_id   INT NOT NULL,
    faculty_id   INT NOT NULL,
    qr_token     VARCHAR(255) NOT NULL UNIQUE,
    qr_token_hash VARCHAR(255) NOT NULL,
    start_time   DATETIME NOT NULL,
    expiry_time  DATETIME NOT NULL,
    is_active    BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    FOREIGN KEY (faculty_id) REFERENCES users(user_id)
);

-- ATTENDANCE
CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id    INT NOT NULL,
    student_id    INT NOT NULL,
    status        ENUM('present','absent') DEFAULT 'absent',
    scan_time     DATETIME,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    FOREIGN KEY (student_id) REFERENCES users(user_id),
    UNIQUE KEY unique_att (session_id, student_id)
);

-- ── BRANCHES ─────────────────────────────────────────────────
INSERT INTO branches (branch_name, department) VALUES
('Computer Science Engineering', 'Engineering'),
('Electronics & Communication',  'Engineering'),
('Mechanical Engineering',       'Engineering');

-- ── USERS (password = abc) ────────────────────────────────────
INSERT INTO users (name, email, password, role, branch_id, semester) VALUES
('Admin User',      'admin@college.edu',   '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'admin',   NULL, NULL),
('Dr. Rahul Verma', 'rahul@college.edu',   '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'faculty', 1,    NULL),
('Dr. Priya Singh', 'priya@college.edu',   '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'faculty', 1,    NULL),
('Dr. Amit Sharma', 'amit@college.edu',    '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'faculty', 2,    NULL),
('Arjun Sharma',    'cs21001@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 1,    5),
('Priya Patel',     'cs21002@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 1,    5),
('Rohit Mehta',     'cs21003@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 1,    5),
('Sneha Gupta',     'cs21004@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 1,    5),
('Karan Singh',     'cs21005@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 1,    5),
('Ananya Roy',      'cs21006@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 1,    5),
('Vikash Kumar',    'cs21007@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 1,    5),
('Riya Shah',       'cs21008@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 1,    5),
('Amit Khanna',     'ec21001@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 2,    5),
('Ritu Saxena',     'ec21002@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 2,    5),
('Varun Malhotra',  'ec21003@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 2,    5),
('Simran Kaur',     'ec21004@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 2,    5),
('Suresh Tiwari',   'me21001@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 3,    5),
('Deepa Rawat',     'me21002@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 3,    5),
('Gaurav Mishra',   'me21003@college.edu', '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', 3,    5);

-- ── SUBJECTS ─────────────────────────────────────────────────
INSERT INTO subjects (subject_name, subject_code, uid, branch_id, total_classes) VALUES
('Data Structures',         'CS301', 2, 1, 40),
('Operating Systems',       'CS302', 2, 1, 35),
('Computer Networks',       'CS303', 3, 1, 38),
('Database Management',     'CS304', 3, 1, 42),
('Digital Electronics',     'EC301', 4, 2, 44),
('Signals & Systems',       'EC302', 4, 2, 40),
('Thermodynamics',          'ME301', 2, 3, 45),
('Fluid Mechanics',         'ME302', 2, 3, 40);

-- ── SESSIONS ─────────────────────────────────────────────────
INSERT INTO sessions (subject_id, faculty_id, qr_token, qr_token_hash, start_time, expiry_time, is_active) VALUES
(1, 2, UUID(), SHA2(UUID(),256), '2025-01-10 09:00:00', '2025-01-10 09:10:00', 0),
(1, 2, UUID(), SHA2(UUID(),256), '2025-01-13 09:00:00', '2025-01-13 09:10:00', 0),
(2, 2, UUID(), SHA2(UUID(),256), '2025-01-10 11:00:00', '2025-01-10 11:10:00', 0),
(2, 2, UUID(), SHA2(UUID(),256), '2025-01-14 11:00:00', '2025-01-14 11:10:00', 0),
(3, 3, UUID(), SHA2(UUID(),256), '2025-01-11 10:00:00', '2025-01-11 10:10:00', 0),
(3, 3, UUID(), SHA2(UUID(),256), '2025-01-16 10:00:00', '2025-01-16 10:10:00', 0),
(4, 3, UUID(), SHA2(UUID(),256), '2025-01-12 14:00:00', '2025-01-12 14:10:00', 0),
(5, 4, UUID(), SHA2(UUID(),256), '2025-01-10 09:00:00', '2025-01-10 09:10:00', 0),
(6, 4, UUID(), SHA2(UUID(),256), '2025-01-11 11:00:00', '2025-01-11 11:10:00', 0),
(7, 2, UUID(), SHA2(UUID(),256), '2025-01-10 09:00:00', '2025-01-10 09:10:00', 0),
(8, 2, UUID(), SHA2(UUID(),256), '2025-01-12 11:00:00', '2025-01-12 11:10:00', 0);

-- ── ATTENDANCE ────────────────────────────────────────────────
INSERT INTO attendance (session_id, student_id, status, scan_time) VALUES
(1,(SELECT user_id FROM users WHERE email='cs21001@college.edu'),'present','2025-01-10 09:02:00'),
(1,(SELECT user_id FROM users WHERE email='cs21002@college.edu'),'present','2025-01-10 09:03:00'),
(1,(SELECT user_id FROM users WHERE email='cs21003@college.edu'),'absent', NULL),
(1,(SELECT user_id FROM users WHERE email='cs21004@college.edu'),'present','2025-01-10 09:04:00'),
(1,(SELECT user_id FROM users WHERE email='cs21005@college.edu'),'absent', NULL),
(1,(SELECT user_id FROM users WHERE email='cs21006@college.edu'),'present','2025-01-10 09:05:00'),
(1,(SELECT user_id FROM users WHERE email='cs21007@college.edu'),'present','2025-01-10 09:06:00'),
(1,(SELECT user_id FROM users WHERE email='cs21008@college.edu'),'absent', NULL),
(2,(SELECT user_id FROM users WHERE email='cs21001@college.edu'),'present','2025-01-13 09:02:00'),
(2,(SELECT user_id FROM users WHERE email='cs21002@college.edu'),'absent', NULL),
(2,(SELECT user_id FROM users WHERE email='cs21003@college.edu'),'present','2025-01-13 09:03:00'),
(2,(SELECT user_id FROM users WHERE email='cs21004@college.edu'),'present','2025-01-13 09:04:00'),
(2,(SELECT user_id FROM users WHERE email='cs21005@college.edu'),'absent', NULL),
(2,(SELECT user_id FROM users WHERE email='cs21006@college.edu'),'absent', NULL),
(2,(SELECT user_id FROM users WHERE email='cs21007@college.edu'),'present','2025-01-13 09:05:00'),
(2,(SELECT user_id FROM users WHERE email='cs21008@college.edu'),'present','2025-01-13 09:06:00'),
(3,(SELECT user_id FROM users WHERE email='cs21001@college.edu'),'present','2025-01-10 11:02:00'),
(3,(SELECT user_id FROM users WHERE email='cs21002@college.edu'),'present','2025-01-10 11:03:00'),
(3,(SELECT user_id FROM users WHERE email='cs21003@college.edu'),'absent', NULL),
(3,(SELECT user_id FROM users WHERE email='cs21004@college.edu'),'absent', NULL),
(3,(SELECT user_id FROM users WHERE email='cs21005@college.edu'),'absent', NULL),
(3,(SELECT user_id FROM users WHERE email='cs21006@college.edu'),'present','2025-01-10 11:04:00'),
(3,(SELECT user_id FROM users WHERE email='cs21007@college.edu'),'present','2025-01-10 11:05:00'),
(3,(SELECT user_id FROM users WHERE email='cs21008@college.edu'),'present','2025-01-10 11:06:00'),
(4,(SELECT user_id FROM users WHERE email='cs21001@college.edu'),'present','2025-01-14 11:02:00'),
(4,(SELECT user_id FROM users WHERE email='cs21002@college.edu'),'absent', NULL),
(4,(SELECT user_id FROM users WHERE email='cs21003@college.edu'),'absent', NULL),
(4,(SELECT user_id FROM users WHERE email='cs21004@college.edu'),'present','2025-01-14 11:03:00'),
(4,(SELECT user_id FROM users WHERE email='cs21005@college.edu'),'absent', NULL),
(4,(SELECT user_id FROM users WHERE email='cs21006@college.edu'),'present','2025-01-14 11:04:00'),
(4,(SELECT user_id FROM users WHERE email='cs21007@college.edu'),'present','2025-01-14 11:05:00'),
(4,(SELECT user_id FROM users WHERE email='cs21008@college.edu'),'absent', NULL),
(5,(SELECT user_id FROM users WHERE email='cs21001@college.edu'),'present','2025-01-11 10:02:00'),
(5,(SELECT user_id FROM users WHERE email='cs21002@college.edu'),'present','2025-01-11 10:03:00'),
(5,(SELECT user_id FROM users WHERE email='cs21003@college.edu'),'present','2025-01-11 10:04:00'),
(5,(SELECT user_id FROM users WHERE email='cs21004@college.edu'),'absent', NULL),
(5,(SELECT user_id FROM users WHERE email='cs21005@college.edu'),'absent', NULL),
(5,(SELECT user_id FROM users WHERE email='cs21006@college.edu'),'absent', NULL),
(5,(SELECT user_id FROM users WHERE email='cs21007@college.edu'),'present','2025-01-11 10:05:00'),
(5,(SELECT user_id FROM users WHERE email='cs21008@college.edu'),'present','2025-01-11 10:06:00'),
(6,(SELECT user_id FROM users WHERE email='cs21001@college.edu'),'present','2025-01-16 10:02:00'),
(6,(SELECT user_id FROM users WHERE email='cs21002@college.edu'),'absent', NULL),
(6,(SELECT user_id FROM users WHERE email='cs21003@college.edu'),'present','2025-01-16 10:03:00'),
(6,(SELECT user_id FROM users WHERE email='cs21004@college.edu'),'present','2025-01-16 10:04:00'),
(6,(SELECT user_id FROM users WHERE email='cs21005@college.edu'),'absent', NULL),
(6,(SELECT user_id FROM users WHERE email='cs21006@college.edu'),'present','2025-01-16 10:05:00'),
(6,(SELECT user_id FROM users WHERE email='cs21007@college.edu'),'absent', NULL),
(6,(SELECT user_id FROM users WHERE email='cs21008@college.edu'),'present','2025-01-16 10:06:00'),
(7,(SELECT user_id FROM users WHERE email='cs21001@college.edu'),'present','2025-01-12 14:02:00'),
(7,(SELECT user_id FROM users WHERE email='cs21002@college.edu'),'absent', NULL),
(7,(SELECT user_id FROM users WHERE email='cs21003@college.edu'),'absent', NULL),
(7,(SELECT user_id FROM users WHERE email='cs21004@college.edu'),'present','2025-01-12 14:03:00'),
(7,(SELECT user_id FROM users WHERE email='cs21005@college.edu'),'absent', NULL),
(7,(SELECT user_id FROM users WHERE email='cs21006@college.edu'),'present','2025-01-12 14:04:00'),
(7,(SELECT user_id FROM users WHERE email='cs21007@college.edu'),'present','2025-01-12 14:05:00'),
(7,(SELECT user_id FROM users WHERE email='cs21008@college.edu'),'absent', NULL),
(8,(SELECT user_id FROM users WHERE email='ec21001@college.edu'),'present','2025-01-10 09:02:00'),
(8,(SELECT user_id FROM users WHERE email='ec21002@college.edu'),'present','2025-01-10 09:03:00'),
(8,(SELECT user_id FROM users WHERE email='ec21003@college.edu'),'absent', NULL),
(8,(SELECT user_id FROM users WHERE email='ec21004@college.edu'),'present','2025-01-10 09:04:00'),
(9,(SELECT user_id FROM users WHERE email='ec21001@college.edu'),'present','2025-01-11 11:02:00'),
(9,(SELECT user_id FROM users WHERE email='ec21002@college.edu'),'absent', NULL),
(9,(SELECT user_id FROM users WHERE email='ec21003@college.edu'),'present','2025-01-11 11:03:00'),
(9,(SELECT user_id FROM users WHERE email='ec21004@college.edu'),'absent', NULL),
(10,(SELECT user_id FROM users WHERE email='me21001@college.edu'),'present','2025-01-10 09:02:00'),
(10,(SELECT user_id FROM users WHERE email='me21002@college.edu'),'present','2025-01-10 09:03:00'),
(10,(SELECT user_id FROM users WHERE email='me21003@college.edu'),'absent', NULL),
(11,(SELECT user_id FROM users WHERE email='me21001@college.edu'),'present','2025-01-12 11:02:00'),
(11,(SELECT user_id FROM users WHERE email='me21002@college.edu'),'absent', NULL),
(11,(SELECT user_id FROM users WHERE email='me21003@college.edu'),'present','2025-01-12 11:03:00');

-- FINAL CHECK
SELECT 'branches'  AS t, COUNT(*) AS total FROM branches
UNION ALL SELECT 'users',      COUNT(*) FROM users
UNION ALL SELECT 'subjects',   COUNT(*) FROM subjects
UNION ALL SELECT 'sessions',   COUNT(*) FROM sessions
UNION ALL SELECT 'attendance', COUNT(*) FROM attendance;
```

---

You should see:
```
branches   → 3
users      → 19
subjects   → 8
sessions   → 11
attendance → 64