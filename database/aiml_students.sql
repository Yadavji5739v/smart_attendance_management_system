-- ============================================================
-- BFCET AIML 6th Sem - Students & Branch Setup
-- Password for ALL users: abc
-- Run this in Supabase SQL Editor
-- ============================================================

-- STEP 1: Add AIML Branch (if not already there)
INSERT INTO branches (branch_name, department) 
SELECT 'AIML (Artificial Intelligence & Machine Learning)', 'Engineering'
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE branch_name = 'AIML (Artificial Intelligence & Machine Learning)');

-- STEP 2: Link Subjects to Faculty (Nancy, Sunil, etc.) 
-- Nancy needs her subjects to show up in her dashboard!
-- This assumes they are already in your 'users' table.
INSERT INTO subjects (subject_name, subject_code, branch_id, uid, total_classes)
SELECT 'Software Engineering', 'SE', b.branch_id, u.user_id, 40
FROM branches b, users u WHERE b.branch_name = 'AIML (Artificial Intelligence & Machine Learning)' AND u.email = 'sunil@college.edu';

INSERT INTO subjects (subject_name, subject_code, branch_id, uid, total_classes)
SELECT 'Data Structures & Algorithms', 'DSA-TT', b.branch_id, u.user_id, 35
FROM branches b, users u WHERE b.branch_name = 'AIML (Artificial Intelligence & Machine Learning)' AND u.email = 'nancy@college.edu';

INSERT INTO subjects (subject_name, subject_code, branch_id, uid, total_classes)
SELECT 'Natural Language Processing', 'NLP', b.branch_id, u.user_id, 38
FROM branches b, users u WHERE b.branch_name = 'AIML (Artificial Intelligence & Machine Learning)' AND u.email = 'aman@college.edu';

INSERT INTO subjects (subject_name, subject_code, branch_id, uid, total_classes)
SELECT 'Deep Learning', 'DL', b.branch_id, u.user_id, 42
FROM branches b, users u WHERE b.branch_name = 'AIML (Artificial Intelligence & Machine Learning)' AND u.email = 'aman@college.edu';

-- STEP 3: Insert Students using UIDs as emails
-- Range: 23131001 to 23131070 | Skipped: 039, 046
INSERT INTO users (name, email, password, role, branch_id, semester)
SELECT name, email, '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', (SELECT branch_id FROM branches WHERE branch_name = 'AIML (Artificial Intelligence & Machine Learning)'), 6
FROM (VALUES
    ('AARIF HUSAIN', '23131001@college.edu'), ('ABHISHEK SHARMA', '23131002@college.edu'), ('AMAN KUMAR', '23131003@college.edu'),
    ('ANMOL SINGLA', '23131004@college.edu'), ('ANSH PATAVDI', '23131005@college.edu'), ('BANTU', '23131006@college.edu'),
    ('DALWINDER SINGH', '23131007@college.edu'), ('DILEEP SINGH', '23131008@college.edu'), ('DIYA', '23131009@college.edu'),
    ('FATEH SINGH', '23131010@college.edu'), ('GAGANDEEP KAUR', '23131011@college.edu'), ('GEETA RANI', '23131012@college.edu'),
    ('GOPAL KISHAN', '23131013@college.edu'), ('GOVIND SINGH', '23131014@college.edu'), ('GURKAMAL SINGH', '23131015@college.edu'),
    ('HARBHAJAN SINGH GURU', '23131016@college.edu'), ('HARISH KUMAR', '23131017@college.edu'), ('HARPREET SINGH', '23131018@college.edu'),
    ('HIMANSHU', '23131019@college.edu'), ('JASPREET KAUR', '23131020@college.edu'), ('KAMAL KUMAR', '23131021@college.edu'),
    ('KAMALPREET KAUR', '23131022@college.edu'), ('KASHISH GUPTA', '23131023@college.edu'), ('KHUSHPREET', '23131024@college.edu'),
    ('KIRANJEET', '23131025@college.edu'), ('KOMAL KAUR', '23131026@college.edu'), ('KOMALPREET KAUR', '23131027@college.edu'),
    ('KULDEEP SINGH', '23131028@college.edu'), ('KUNDAN KUMAR', '23131029@college.edu'), ('LAKHWINDER SINGH', '23131030@college.edu'),
    ('LOVEKARAN', '23131031@college.edu'), ('LOVEPREET SINGH', '23131032@college.edu'), ('MANJIT NAGAR', '23131033@college.edu'),
    ('MEHAK BANSAL', '23131034@college.edu'), ('MRIGNAKSHI PRIYA', '23131035@college.edu'), ('MYCLE', '23131036@college.edu'),
    ('NAVJOT KAUR', '23131037@college.edu'), ('NAVNEET KAUR', '23131038@college.edu'),
    -- UID 039 skipped
    ('NIKHIL GARG', '23131040@college.edu'), ('PRABHJOT KAUR', '23131041@college.edu'), ('RAMANDEEP SINGH', '23131042@college.edu'),
    ('RAVI KUMAR YADAV', '23131043@college.edu'), ('RISHAB KUMAR', '23131044@college.edu'), ('SAMRIDH GROVER', '23131045@college.edu'),
    -- UID 046 skipped
    ('SANDEEP KAUR', '23131047@college.edu'), ('SANDEEP SINGH', '23131048@college.edu'), ('SANJU MANLHOTRA', '23131049@college.edu'),
    ('SARTHAK SHARMA', '23131050@college.edu'), ('SATJOT SINGH', '23131051@college.edu'), ('SHIVAM KUMAR', '23131052@college.edu'),
    ('SHRUTI SHUKLA', '23131053@college.edu'), ('SMAYARA', '23131054@college.edu'), ('SUNAINA', '23131055@college.edu'),
    ('Anshul Singla', '23131056@college.edu'), ('Jai Sharma', '23131057@college.edu'), ('Kale Sakshi Rohidas', '23131058@college.edu'),
    ('Pinanshu Goyal', '23131059@college.edu')
) AS s(name, email) ON CONFLICT (email) DO NOTHING;
