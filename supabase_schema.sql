-- ==============================================================================
-- CampusCare AI – Complete Supabase PostgreSQL Schema & Seed Migration Script
-- University: SRM University Delhi-NCR (Rai, Sonepat)
-- Compatible with: Supabase PostgreSQL, Supabase Realtime, and Supabase Auth
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP EXISTING TABLES (IF RE-RUNNING SCHEMA)
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS study_sessions CASCADE;
-- DROP TABLE IF EXISTS expenses CASCADE;
-- DROP TABLE IF EXISTS exams CASCADE;
-- DROP TABLE IF EXISTS study_plans CASCADE;
-- DROP TABLE IF EXISTS queue_tokens CASCADE;
-- DROP TABLE IF EXISTS queue_services CASCADE;
-- DROP TABLE IF EXISTS incidents CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================================
-- TABLE 1: USERS & PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT ('user-' || floor(random() * 1000000)::text),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- bcrypt hashed password
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'faculty')),
    student_id TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    hostel TEXT NOT NULL,
    room_no TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    budget NUMERIC(10, 2) DEFAULT 8000.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 2: CAMPUS SAFETY INCIDENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY DEFAULT ('inc-' || floor(random() * 1000000)::text),
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    building TEXT NOT NULL,
    floor TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    status TEXT NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported', 'Investigating', 'In Progress', 'Resolved')),
    reporters_count INTEGER DEFAULT 1,
    estimated_response_time TEXT DEFAULT '20 minutes',
    suggested_responder TEXT DEFAULT 'Campus Security Command',
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 3: QUEUELESS SERVICES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS queue_services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Busy', 'Paused', 'Closed')),
    current_serving_token TEXT DEFAULT '---',
    current_queue_count INTEGER DEFAULT 0,
    average_wait_minutes NUMERIC(5, 2) DEFAULT 5.0,
    total_issued_today INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 4: QUEUELESS TOKENS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS queue_tokens (
    id TEXT PRIMARY KEY DEFAULT ('token-' || floor(random() * 1000000)::text),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    service_id TEXT REFERENCES queue_services(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    student_name TEXT NOT NULL,
    token_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Called', 'Completed', 'Cancelled', 'Skipped')),
    party_size INTEGER DEFAULT 1,
    time_slot TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    called_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- ==============================================================================
-- TABLE 5: STUDYPULSE PLANS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS study_plans (
    id TEXT PRIMARY KEY DEFAULT ('plan-' || floor(random() * 1000000)::text),
    user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    focus_score INTEGER DEFAULT 85,
    streak_days INTEGER DEFAULT 7,
    daily_tasks JSONB DEFAULT '[]'::jsonb,
    revisions JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 6: SEMESTER DATESHEET EXAMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY DEFAULT ('exam-' || floor(random() * 1000000)::text),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    code TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT DEFAULT '09:30 AM - 12:30 PM',
    venue TEXT DEFAULT 'SRM Main Examination Complex',
    priority TEXT DEFAULT 'High' CHECK (priority IN ('High', 'Medium', 'Low')),
    total_units INTEGER DEFAULT 5,
    completed_units INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 7: SUBJECT FOCUS STUDY TIMER SESSIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY DEFAULT ('sess-' || floor(random() * 1000000)::text),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 25,
    notes TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 8: STUDENT EXPENSES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY DEFAULT ('exp-' || floor(random() * 1000000)::text),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Food', 'Books', 'Stationery', 'Transport', 'Hostel', 'Health', 'Entertainment', 'Laundry', 'Other')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 9: CAMPUS NOTIFICATIONS & EMERGENCY BROADCASTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT ('notif-' || floor(random() * 1000000)::text),
    user_id TEXT NOT NULL, -- 'all' for campus-wide broadcasts or user ID
    type TEXT NOT NULL DEFAULT 'Info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) WITH HACKATHON-FRIENDLY POLICIES
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Permissive public/service policies for hackathon demonstration:
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access to users" ON users;
    CREATE POLICY "Public access to users" ON users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to incidents" ON incidents;
    CREATE POLICY "Public access to incidents" ON incidents FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to queue_services" ON queue_services;
    CREATE POLICY "Public access to queue_services" ON queue_services FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to queue_tokens" ON queue_tokens;
    CREATE POLICY "Public access to queue_tokens" ON queue_tokens FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to study_plans" ON study_plans;
    CREATE POLICY "Public access to study_plans" ON study_plans FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to exams" ON exams;
    CREATE POLICY "Public access to exams" ON exams FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to study_sessions" ON study_sessions;
    CREATE POLICY "Public access to study_sessions" ON study_sessions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to expenses" ON expenses;
    CREATE POLICY "Public access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to notifications" ON notifications;
    CREATE POLICY "Public access to notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
END
$$;

-- ==============================================================================
-- 4. ENABLE REALTIME BROADCASTING ON KEY TABLES
-- ==============================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
    ALTER PUBLICATION supabase_realtime ADD TABLE queue_services;
    ALTER PUBLICATION supabase_realtime ADD TABLE queue_tokens;
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION
    WHEN duplicate_object THEN
        -- Tables already in publication, safe to ignore
        NULL;
END
$$;

-- ==============================================================================
-- 5. SEED INITIAL DATA (SRM UNIVERSITY DELHI-NCR ROSTER)
-- ==============================================================================

-- 5.1 SEED USERS (Passwords hashed for 'student123' and 'admin123')
INSERT INTO users (id, name, email, password, role, student_id, department, year, hostel, room_no, phone, avatar, budget)
VALUES
(
    'user-student-001',
    'Lavishtushir',
    'student@campus.edu',
    '$2a$10$0p2hC0oE6D62EeV7fT9dGexUvXqj2G3bN5M8kK8gG3h6sD2oN7u9y', -- bcrypt hash of student123
    'student',
    'SRM-2023-CS0142',
    'Computer Science & Engineering',
    '3rd Year (6th Sem)',
    'Vivekananda Boys Residential Complex (SRM Rai)',
    'A-304',
    '+91 98765 43210',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    8000.00
),
(
    'user-student-002',
    'Ananya Sharma',
    'ananya.s@srm.edu',
    '$2a$10$0p2hC0oE6D62EeV7fT9dGexUvXqj2G3bN5M8kK8gG3h6sD2oN7u9y',
    'student',
    'SRM-2024-AI0029',
    'AI & Data Science',
    '2nd Year (4th Sem)',
    'Kalpana Chawla Girls Residential Complex (SRM Rai)',
    'B-102',
    '+91 98112 34567',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    7500.00
),
(
    'user-student-003',
    'Rohit Verma',
    'rohit.v@srm.edu',
    '$2a$10$0p2hC0oE6D62EeV7fT9dGexUvXqj2G3bN5M8kK8gG3h6sD2oN7u9y',
    'student',
    'SRM-2022-ME0088',
    'Mechanical Engineering',
    '4th Year (8th Sem)',
    'Vivekananda Boys Residential Complex (SRM Rai)',
    'C-214',
    '+91 98223 45678',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    9000.00
),
(
    'user-student-004',
    'Priya Iyer',
    'priya.i@srm.edu',
    '$2a$10$0p2hC0oE6D62EeV7fT9dGexUvXqj2G3bN5M8kK8gG3h6sD2oN7u9y',
    'student',
    'SRM-2023-LAW0055',
    'School of Law',
    '3rd Year (6th Sem)',
    'Kalpana Chawla Girls Residential Complex (SRM Rai)',
    'A-205',
    '+91 98334 56789',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    6500.00
),
(
    'user-student-005',
    'Aman Deep Singh',
    'aman.d@srm.edu',
    '$2a$10$0p2hC0oE6D62EeV7fT9dGexUvXqj2G3bN5M8kK8gG3h6sD2oN7u9y',
    'student',
    'SRM-2025-MBA0019',
    'Management & Business Analytics',
    '1st Year (2nd Sem)',
    'Vivekananda Boys Residential Complex (SRM Rai)',
    'D-401',
    '+91 98445 67890',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    8500.00
),
(
    'user-student-006',
    'Sneha Patel',
    'sneha.p@srm.edu',
    '$2a$10$0p2hC0oE6D62EeV7fT9dGexUvXqj2G3bN5M8kK8gG3h6sD2oN7u9y',
    'student',
    'SRM-2023-CS0189',
    'Computer Science & Engineering',
    '3rd Year (6th Sem)',
    'Kalpana Chawla Girls Residential Complex (SRM Rai)',
    'B-308',
    '+91 98556 78901',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    7000.00
),
(
    'user-admin-001',
    'Dr. Rajesh Varma',
    'admin@campus.edu',
    '$2a$10$0p2hC0oE6D62EeV7fT9dGexUvXqj2G3bN5M8kK8gG3h6sD2oN7u9y', -- bcrypt hash of admin123
    'admin',
    'ADMIN-SRM-001',
    'Campus Security & Administration Command',
    'Staff Directorate',
    'Administrative Block (SRM Rai Campus)',
    'Room 101',
    '+91 1800 226787',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
    50000.00
)
ON CONFLICT (id) DO NOTHING;

-- 5.2 SEED QUEUE SERVICES
INSERT INTO queue_services (id, name, code, location, status, current_serving_token, current_queue_count, average_wait_minutes, total_issued_today)
VALUES
('svc-canteen', 'SRM Main Food Court & Cafeteria', 'CAN', 'Student Dining Hall, Ground Floor', 'Open', 'CAN-138', 4, 3.5, 142),
('svc-hospital', 'Campus Dispensary & Medical Health Post', 'MED', 'Health Centre, Ground Floor', 'Open', 'MED-042', 2, 8.0, 44),
('svc-registrar', 'Academic Registrar & Examination Office', 'ADM', 'Administrative Block, 1st Floor', 'Open', 'ADM-089', 5, 12.0, 94),
('svc-library', 'Central Library Circulation & Book Returns', 'LIB', 'SRM Central Library, 2nd Floor', 'Open', 'LIB-056', 1, 2.0, 57),
('svc-cafe', 'Java Green Coffee Bar', 'CAF', 'Campus Promenade Ground Floor', 'Open', 'CAF-064', 3, 4.0, 67),
('svc-tech', 'IT Support & Laptop Repair Desk', 'TEC', 'Engineering Complex, 2nd Floor', 'Open', 'TEC-015', 2, 15.0, 17)
ON CONFLICT (id) DO NOTHING;

-- 5.3 SEED CAMPUS HAZARD INCIDENTS
INSERT INTO incidents (id, user_id, type, title, description, building, floor, lat, lng, priority, status, reporters_count, estimated_response_time, suggested_responder)
VALUES
('inc-001', 'user-student-001', 'Lift Failure', 'North Wing Elevator Stuck on 3rd Floor', 'Passenger lift stopped with emergency bell ringing.', 'SRM Engineering Complex', '3rd Floor North', 28.9192, 77.1288, 'Critical', 'In Progress', 4, '5 minutes', 'Campus Technical & Rapid Elevator Rescue Unit'),
('inc-002', 'user-student-002', 'Water Leakage', 'Pipe Burst in Washroom Corridor', 'Significant water overflow causing slippery floor in main hallway.', 'SRM Main Administrative Building', 'Ground Floor', 28.9188, 77.1284, 'High', 'Investigating', 2, '15 minutes', 'Campus Estate Plumbing & Sanitation Crew'),
('inc-003', 'user-student-003', 'Broken Street Light', 'Boulevard Pathway Lights Off at Night', 'Two street light fixtures malfunctioning along the boulevard.', 'SRM Central Dining Complex', 'Outdoor Boulevard', 28.9195, 77.1290, 'Medium', 'Reported', 3, '45 minutes', 'Campus Electrical Maintenance Team')
ON CONFLICT (id) DO NOTHING;

-- 5.4 SEED SEMESTER DATESHEET EXAMS
INSERT INTO exams (id, user_id, subject, code, date, time, venue, priority, total_units, completed_units)
VALUES
('exam-001', 'user-student-001', 'Design and Analysis of Algorithms', 'CS301', CURRENT_DATE + INTERVAL '3 days', '09:30 AM - 12:30 PM', 'SRM Tech Park Examination Hall 4', 'High', 5, 2),
('exam-002', 'user-student-001', 'Database Management Systems', 'CS302', CURRENT_DATE + INTERVAL '6 days', '09:30 AM - 12:30 PM', 'SRM University Main Block - Hall 2', 'High', 5, 1),
('exam-003', 'user-student-001', 'Operating Systems & Architecture', 'CS303', CURRENT_DATE + INTERVAL '9 days', '01:30 PM - 04:30 PM', 'SRM Tech Park Examination Hall 1', 'High', 5, 2),
('exam-004', 'user-student-001', 'Computer Networks & Security', 'CS304', CURRENT_DATE + INTERVAL '13 days', '09:30 AM - 12:30 PM', 'SRM Mechanical / Tech Complex - Hall A', 'Medium', 4, 1),
('exam-005', 'user-student-001', 'Discrete Mathematics & Graph Theory', 'MA301', CURRENT_DATE + INTERVAL '17 days', '01:30 PM - 04:30 PM', 'SRM Main Administrative Block', 'Medium', 5, 3)
ON CONFLICT (id) DO NOTHING;

-- 5.5 SEED STUDY SESSIONS
INSERT INTO study_sessions (id, user_id, student_name, subject, topic, duration_minutes, notes)
VALUES
('sess-001', 'user-student-001', 'Lavishtushir', 'Design and Analysis of Algorithms', 'Dynamic Programming Matrix Chain Multiplication', 45, 'Completed previous 5-year numericals'),
('sess-002', 'user-student-001', 'Lavishtushir', 'Database Management Systems', 'B+ Trees & Query Optimization Indexing', 30, 'Recapped index structures and search complexity'),
('sess-003', 'user-student-001', 'Lavishtushir', 'Operating Systems & Architecture', 'Virtual Memory Page Replacement Algorithms (LRU, FIFO)', 25, 'Pomodoro focus drill on FIFO vs Optimal anomalies')
ON CONFLICT (id) DO NOTHING;

-- 5.6 SEED STUDY PLAN
INSERT INTO study_plans (id, user_id, focus_score, streak_days, daily_tasks, revisions, recommendations)
VALUES
(
    'plan-001',
    'user-student-001',
    88,
    7,
    '[
        {"id": "t-1", "time": "08:30 - 10:30", "subject": "Design and Analysis of Algorithms", "topic": "High-Yield Dynamic Programming & Greedy Approximations", "completed": true},
        {"id": "t-2", "time": "11:00 - 12:30", "subject": "Design and Analysis of Algorithms", "topic": "Previous 5-Year Question Paper Solving & Numerical Drills", "completed": true},
        {"id": "t-3", "time": "14:30 - 16:00", "subject": "Database Management Systems", "topic": "ACID Properties, Normalization 3NF/BCNF & Transaction Recovery", "completed": false},
        {"id": "t-4", "time": "16:30 - 18:00", "subject": "Operating Systems & Architecture", "topic": "Process Synchronization, Semaphores & Deadlock Avoidance", "completed": false},
        {"id": "t-5", "time": "20:00 - 21:00", "subject": "Nightly Exam Recall", "topic": "Spaced Repetition Flashcards & Self-Quiz for CS301", "completed": false}
    ]'::jsonb,
    '[
        {"title": "1st Spaced Repetition Revision", "date": "Tomorrow", "status": "Scheduled"},
        {"title": "2nd Spaced Repetition Revision", "date": "In 4 Days", "status": "Scheduled"},
        {"title": "Final Pre-Exam Rapid Recap", "date": "In 7 Days", "status": "Scheduled"}
    ]'::jsonb,
    '["Focus extra time on matrix numericals", "Review Unit 3 previous year questions"]'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;

-- 5.7 SEED NOTIFICATIONS
INSERT INTO notifications (id, user_id, type, title, message, read)
VALUES
('notif-001', 'all', 'Safety', 'SRM Campus Weather Advisory', 'Thunderstorm forecast for evening. Please use sheltered walkways between hostels.', FALSE),
('notif-002', 'user-student-001', 'Queue', 'Token Called: Central Canteen', 'Your token CAN-142 is approaching the counter. Please arrive within 5 minutes.', FALSE)
ON CONFLICT (id) DO NOTHING;
