-- ==========================================
-- Supabase RLS Policies for Smart Attendance
-- ==========================================

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Note: In this architecture, the Node.js backend uses the 'service_role' key
-- (via the DATABASE_URL) to interact with Supabase. The service_role bypasses RLS by default.
-- However, it is best practice to explicitly lock down public/anon access.
-- The policies below ensure that NO anonymous or authenticated web client can directly 
-- access the data via the Supabase Data API. Data is ONLY accessible via the Node backend.

-- Policy: Restrict all access for users table
CREATE POLICY "Deny all access to users from public"
ON users FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

-- Policy: Restrict all access for branches table
CREATE POLICY "Deny all access to branches from public"
ON branches FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

-- Policy: Restrict all access for subjects table
CREATE POLICY "Deny all access to subjects from public"
ON subjects FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

-- Policy: Restrict all access for sessions table
CREATE POLICY "Deny all access to sessions from public"
ON sessions FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

-- Policy: Restrict all access for attendance table
CREATE POLICY "Deny all access to attendance from public"
ON attendance FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

-- Optional: Since the backend uses postgres connection string passing through pg pool,
-- it authenticates as the postgres role (which has postgres superuser privileges and bypasses RLS entirely).
-- Thus, keeping RLS enabled and strictly blocking anon/auth web clients is highly secure and perfectly maintains
-- your Node API functionality without requiring policy complexity.
