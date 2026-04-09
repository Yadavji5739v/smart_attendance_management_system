-- ============================================================
-- BFCET AIML 6th Sem - Students & Branch Setup
-- Password for ALL users: abc
-- Run this in Supabase SQL Editor
-- ============================================================

-- STEP 1: Add AIML Branch (if not already there)
INSERT INTO branches (branch_name, department) 
SELECT 'AIML (Artificial Intelligence & Machine Learning)', 'Engineering'
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE branch_name = 'AIML (Artificial Intelligence & Machine Learning)');

-- STEP 2: Link Subjects to Faculty (Sunil, Nancy, etc.)
INSERT INTO subjects (subject_name, subject_code, branch_id, uid, total_classes)
SELECT 'Software Engineering', 'SE', b.branch_id, u.user_id, 40
FROM branches b, users u WHERE b.branch_name = 'AIML (Artificial Intelligence & Machine Learning)' AND u.email = 'sunil@college.edu';

INSERT INTO subjects (subject_name, subject_code, branch_id, uid, total_classes)
SELECT 'Data Structures & Algorithms', 'DSA-TT', b.branch_id, u.user_id, 35
FROM branches b, users u WHERE b.branch_name = 'AIML (Artificial Intelligence & Machine Learning)' AND u.email = 'nancy@college.edu';

-- STEP 3: Insert Students using UID@ format
INSERT INTO users (name, email, password, role, branch_id, semester)
SELECT name, email, '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', (SELECT branch_id FROM branches WHERE branch_name = 'AIML (Artificial Intelligence & Machine Learning)'), 6
FROM (VALUES
    ('AARIF HUSAIN', '23131001@'), ('ABHISHEK SHARMA', '23131002@'), ('AMAN KUMAR', '23131003@'),
    ('ANMOL SINGLA', '23131004@'), ('ANSH PATAVDI', '23131005@'), ('BANTU', '23131006@'),
    ('DALWINDER SINGH', '23131007@'), ('DILEEP SINGH', '23131008@'), ('DIYA', '23131009@'),
    ('FATEH SINGH', '23131010@'), ('GAGANDEEP KAUR', '23131011@'), ('GEETA RANI', '23131012@'),
    ('GOPAL KISHAN', '23131013@'), ('GOVIND SINGH', '23131014@'), ('GURKAMAL SINGH', '23131015@'),
    ('HARBHAJAN SINGH GURU', '23131016@'), ('HARISH KUMAR', '23131017@'), ('HARPREET SINGH', '23131018@'),
    ('HIMANSHU', '23131019@'), ('JASPREET KAUR', '23131020@'), ('KAMAL KUMAR', '23131021@'),
    ('KAMALPREET KAUR', '23131022@'), ('KASHISH GUPTA', '23131023@'), ('KHUSHPREET', '23131024@'),
    ('KIRANJEET', '23131025@'), ('KOMAL KAUR', '23131026@'), ('KOMALPREET KAUR', '23131027@'),
    ('KULDEEP SINGH', '23131028@'), ('KUNDAN KUMAR', '23131029@'), ('LAKHWINDER SINGH', '23131030@'),
    ('LOVEKARAN', '23131031@'), ('LOVEPREET SINGH', '23131032@'), ('MANJIT NAGAR', '23131033@'),
    ('MEHAK BANSAL', '23131034@'), ('MRIGNAKSHI PRIYA', '23131035@'), ('MYCLE', '23131036@'),
    ('NAVJOT KAUR', '23131037@'), ('NAVNEET KAUR', '23131038@'),
    -- SKIP 039
    ('NIKHIL GARG', '23131040@'), ('PRABHJOT KAUR', '23131041@'), ('RAMANDEEP SINGH', '23131042@'),
    ('RAVI KUMAR YADAV', '23131043@'), ('RISHAB KUMAR', '23131044@'), ('SAMRIDH GROVER', '23131045@'),
    -- SKIP 046
    ('SANDEEP KAUR', '23131047@'), ('SANDEEP SINGH', '23131048@'), ('SANJU MANLHOTRA', '23131049@'),
    ('SARTHAK SHARMA', '23131050@'), ('SATJOT SINGH', '23131051@'), ('SHIVAM KUMAR', '23131052@'),
    ('SHRUTI SHUKLA', '23131053@'), ('SMAYARA', '23131054@'), ('SUNAINA', '23131055@'),
    ('Anshul Singla', '23131056@'), ('Jai Sharma', '23131057@'), ('Kale Sakshi Rohidas', '23131058@'),
    ('Pinanshu Goyal', '23131059@')
) AS s(name, email) ON CONFLICT (email) DO NOTHING;
