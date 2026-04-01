-- Supabase/Postgres version of schema.sql
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/uyrkpbnxiwkjpcpubhlt/sql

-- Enable extensions first (in Supabase dashboard SQL Editor)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- BRANCHES
CREATE TABLE branches (
    branch_id   SERIAL PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    department  VARCHAR(100) NOT NULL
);

-- USERS
CREATE TABLE users (
    user_id   SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    email     VARCHAR(100) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    role      TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin','faculty','student')),
    branch_id INTEGER REFERENCES branches(branch_id),
    semester  INTEGER
);

-- SUBJECTS
CREATE TABLE subjects (
    subject_id   SERIAL PRIMARY KEY,
    subject_name VARCHAR(150) NOT NULL,
    subject_code VARCHAR(20)  NOT NULL,
    uid          INTEGER NOT NULL,
    branch_id    INTEGER NOT NULL REFERENCES branches(branch_id),
    total_classes INTEGER DEFAULT 0
);

-- SESSIONS
CREATE TABLE sessions (
    session_id   SERIAL PRIMARY KEY,
    subject_id   INTEGER NOT NULL REFERENCES subjects(subject_id),
    faculty_id   INTEGER NOT NULL REFERENCES users(user_id),
qr_token     TEXT NOT NULL UNIQUE,
    qr_token_hash TEXT NOT NULL,
    start_time   TIMESTAMP NOT NULL,
    expiry_time  TIMESTAMP NOT NULL,
    is_active    BOOLEAN DEFAULT TRUE
);

-- ATTENDANCE
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    session_id    INTEGER NOT NULL REFERENCES sessions(session_id),
    student_id    INTEGER NOT NULL REFERENCES users(user_id),
    status        TEXT DEFAULT 'absent' CHECK (status IN ('present','absent')),
    scan_time     TIMESTAMP,
    UNIQUE (session_id, student_id)
);

-- Insert branches
INSERT INTO branches (branch_name, department) VALUES
('Computer Science Engineering', 'Engineering'),
('Electronics & Communication',  'Engineering'),
('Mechanical Engineering',       'Engineering');

-- Insert users (ALL passwords: plaintext "abc", bcrypt 12 rounds)
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

-- Subjects
INSERT INTO subjects (subject_name, subject_code, uid, branch_id, total_classes) VALUES
('Data Structures',         'CS301', 2, 1, 40),
('Operating Systems',       'CS302', 2, 1, 35),
('Computer Networks',       'CS303', 3, 1, 38),
('Database Management',     'CS304', 3, 1, 42),
('Digital Electronics',     'EC301', 4, 2, 44),
('Signals & Systems',       'EC302', 4, 2, 40),
('Thermodynamics',          'ME301', 2, 3, 45),
('Fluid Mechanics',         'ME302', 2, 3, 40);

-- Sample sessions/attendance (optional, simplified)
INSERT INTO sessions (subject_id, faculty_id, qr_token, qr_token_hash, start_time, expiry_time, is_active) VALUES
CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day', false);

-- Check
SELECT 'branches' AS table_name, COUNT(*) AS count FROM branches UNION ALL
SELECT 'users', COUNT(*) FROM users UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects;

