/*
# Create internships table (single-tenant, no auth)

1. New Tables
- `internships`
- `id` (uuid, primary key) — serves as the Application ID
- `student_name` (text, not null) — required student name
- `student_email` (text, not null) — required, must be valid email
- `department` (text, not null) — student's department
- `company_name` (text, not null) — required company name
- `internship_role` (text, not null) — required role
- `location` (text) — internship location
- `duration` (text, not null) — required duration (e.g. "3 months")
- `stipend` (numeric, default 0) — must be numeric
- `application_date` (date, not null) — date application was submitted
- `application_status` (text, not null, default 'Applied') — one of: Applied, Shortlisted, Interview, Selected, Rejected, Completed
- `skills_required` (text) — comma-separated skills
- `remarks` (text) — additional notes
- `created_at` (timestamptz, default now())

2. Constraints
- CHECK constraint on `application_status` to restrict to valid status values.
- CHECK constraint on `student_email` to enforce basic email format.

3. Indexes
- Index on `application_status` for filter queries.
- Index on `application_date` for sort queries.
- Index on `company_name` for search queries.

4. Security
- Enable RLS on `internships`.
- Allow anon + authenticated full CRUD because the data is intentionally shared/public (no-auth app).
*/

CREATE TABLE IF NOT EXISTS internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  student_email text NOT NULL,
  department text NOT NULL,
  company_name text NOT NULL,
  internship_role text NOT NULL,
  location text DEFAULT '',
  duration text NOT NULL,
  stipend numeric DEFAULT 0,
  application_date date NOT NULL DEFAULT CURRENT_DATE,
  application_status text NOT NULL DEFAULT 'Applied'
    CHECK (application_status IN ('Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Completed')),
  skills_required text DEFAULT '',
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_email CHECK (student_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(application_status);
CREATE INDEX IF NOT EXISTS idx_internships_date ON internships(application_date);
CREATE INDEX IF NOT EXISTS idx_internships_company ON internships(company_name);

ALTER TABLE internships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_internships" ON internships;
CREATE POLICY "anon_select_internships" ON internships FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_internships" ON internships;
CREATE POLICY "anon_insert_internships" ON internships FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_internships" ON internships;
CREATE POLICY "anon_update_internships" ON internships FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_internships" ON internships;
CREATE POLICY "anon_delete_internships" ON internships FOR DELETE
  TO anon, authenticated USING (true);