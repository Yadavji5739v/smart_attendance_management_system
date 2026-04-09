-- ============================================================
-- BFCET AIML 6th Sem - Students & Branch Setup
-- Password for ALL users: abc
-- Run this in Supabase SQL Editor
-- ============================================================

--- 1. Remove old student records for AIML branch (safety cleanup)
DELETE FROM users 
WHERE role = 'student' 
AND branch_id = (SELECT branch_id FROM branches WHERE branch_name LIKE 'AIML%' LIMIT 1);

-- 2. Insert Students with Name-based emails
INSERT INTO users (name, email, password, role, branch_id, semester)
SELECT name, email, '$2a$12$udaA2oOFkeEwYSfeflXk1OtesWjza/OJZr.z63HxxNwU.BKN0MyJu', 'student', (SELECT branch_id FROM branches WHERE branch_name LIKE 'AIML%' LIMIT 1), 6
FROM (VALUES
    ('AARIF HUSAIN', 'aarif@college.edu'), ('ABHISHEK SHARMA', 'abhishek@college.edu'), ('AMAN KUMAR', 'aman@college.edu'),
    ('ANMOL SINGLA', 'anmol@college.edu'), ('ANSH PATAVDI', 'ansh@college.edu'), ('BANTU', 'bantu@college.edu'),
    ('DALWINDER SINGH', 'dalwinder@college.edu'), ('DILEEP SINGH', 'dileep@college.edu'), ('DIYA', 'diya@college.edu'),
    ('FATEH SINGH', 'fateh@college.edu'), ('GAGANDEEP KAUR', 'gagandeep@college.edu'), ('GEETA RANI', 'geeta@college.edu'),
    ('GOPAL KISHAN', 'gopal@college.edu'), ('GOVIND SINGH', 'govind@college.edu'), ('GURKAMAL SINGH', 'gurkamal@college.edu'),
    ('HARBHAJAN SINGH GURU', 'harbhajan@college.edu'), ('HARISH KUMAR', 'harish@college.edu'), ('HARPREET SINGH', 'harpreet@college.edu'),
    ('HIMANSHU', 'himanshu@college.edu'), ('JASPREET KAUR', 'jaspreet@college.edu'), ('KAMAL KUMAR', 'kamal@college.edu'),
    ('KAMALPREET KAUR', 'kamalpreet@college.edu'), ('KASHISH GUPTA', 'kashish@college.edu'), ('KHUSHPREET', 'khushpreet@college.edu'),
    ('KIRANJEET', 'kiranjeet@college.edu'), ('KOMAL KAUR', 'komal@college.edu'), ('KOMALPREET KAUR', 'komalpreet@college.edu'),
    ('KULDEEP SINGH', 'kuldeep@college.edu'), ('KUNDAN KUMAR', 'kundan@college.edu'), ('LAKHWINDER SINGH', 'lakhwinder@college.edu'),
    ('LOVEKARAN', 'lovekaran@college.edu'), ('LOVEPREET SINGH', 'lovepreet@college.edu'), ('MANJIT NAGAR', 'manjit@college.edu'),
    ('MEHAK BANSAL', 'mehak@college.edu'), ('MRIGNAKSHI PRIYA', 'mrignakshi@college.edu'), ('MYCLE', 'mycle@college.edu'),
    ('NAVJOT KAUR', 'navjot@college.edu'), ('NAVNEET KAUR', 'navneet@college.edu'), ('NIKHIL GARG', 'nikhil@college.edu'),
    ('PRABHJOT KAUR', 'prabhjot@college.edu'), ('RAMANDEEP SINGH', 'ramandeep@college.edu'), ('RAVI KUMAR YADAV', 'ravi@college.edu'),
    ('RISHAB KUMAR', 'rishab@college.edu'), ('SAMRIDH GROVER', 'samridh@college.edu'), 
    ('SANDEEP KAUR', 'sandeep.k@college.edu'), ('SANDEEP SINGH', 'sandeep.s@college.edu'), 
    ('SANJU MANLHOTRA', 'sanju@college.edu'), ('SARTHAK SHARMA', 'sarthak@college.edu'), ('SATJOT SINGH', 'satjot@college.edu'),
    ('SHIVAM KUMAR', 'shivam@college.edu'), ('SHRUTI SHUKLA', 'shruti@college.edu'), ('SMAYARA', 'smayara@college.edu'),
    ('SUNAINA', 'sunaina@college.edu'), ('Anshul Singla', 'anshul@college.edu'), ('Jai Sharma', 'jai@college.edu'),
    ('Kale Sakshi Rohidas', 'kale@college.edu'), ('Pinanshu Goyal', 'pinanshu@college.edu')
) AS s(name, email)
ON CONFLICT (email) DO NOTHING;
