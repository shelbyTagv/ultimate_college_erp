-- Ultimate College of Technology – Seed Data
-- Run after schema.sql. User accounts are created by backend seed (password hashing).

-- Forms 1–6
INSERT INTO forms (id, name, display_order) VALUES
('f1111111-1111-1111-1111-111111111101', 'Form 1', 1),
('f1111111-1111-1111-1111-111111111102', 'Form 2', 2),
('f1111111-1111-1111-1111-111111111103', 'Form 3', 3),
('f1111111-1111-1111-1111-111111111104', 'Form 4', 4),
('f1111111-1111-1111-1111-111111111105', 'Form 5', 5),
('f1111111-1111-1111-1111-111111111106', 'Form 6', 6)
ON CONFLICT (name) DO NOTHING;

-- Streams per form (A, B for each)
INSERT INTO streams (id, name, form_id) 
SELECT uuid_generate_v4(), 'A', id FROM forms WHERE name = 'Form 1'
UNION ALL SELECT uuid_generate_v4(), 'B', id FROM forms WHERE name = 'Form 1'
UNION ALL SELECT uuid_generate_v4(), 'A', id FROM forms WHERE name = 'Form 2'
UNION ALL SELECT uuid_generate_v4(), 'B', id FROM forms WHERE name = 'Form 2'
UNION ALL SELECT uuid_generate_v4(), 'A', id FROM forms WHERE name = 'Form 3'
UNION ALL SELECT uuid_generate_v4(), 'B', id FROM forms WHERE name = 'Form 3'
UNION ALL SELECT uuid_generate_v4(), 'A', id FROM forms WHERE name = 'Form 4'
UNION ALL SELECT uuid_generate_v4(), 'B', id FROM forms WHERE name = 'Form 4'
UNION ALL SELECT uuid_generate_v4(), 'A', id FROM forms WHERE name = 'Form 5'
UNION ALL SELECT uuid_generate_v4(), 'B', id FROM forms WHERE name = 'Form 5'
UNION ALL SELECT uuid_generate_v4(), 'A', id FROM forms WHERE name = 'Form 6'
UNION ALL SELECT uuid_generate_v4(), 'B', id FROM forms WHERE name = 'Form 6'
ON CONFLICT DO NOTHING;

-- Academic year 2025
INSERT INTO academic_years (id, name, start_date, end_date, is_current) VALUES
('a1111111-1111-1111-1111-111111111111', '2025', '2025-01-13', '2025-12-05', true)
ON CONFLICT DO NOTHING;

-- Terms 2025 (use valid UUIDs: hex digits 0-9,a-f only; 't' invalid -> use 'e')
INSERT INTO terms (id, academic_year_id, name, start_date, end_date) VALUES
('e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Term 1', '2025-01-13', '2025-04-04'),
('e1111111-1111-1111-1111-111111111112', 'a1111111-1111-1111-1111-111111111111', 'Term 2', '2025-04-28', '2025-08-01'),
('e1111111-1111-1111-1111-111111111113', 'a1111111-1111-1111-1111-111111111111', 'Term 3', '2025-09-08', '2025-12-05')
ON CONFLICT DO NOTHING;

-- Subjects
INSERT INTO subjects (id, name, code, is_examinable) VALUES
(uuid_generate_v4(), 'Mathematics', 'MATH', true),
(uuid_generate_v4(), 'English Language', 'ENG', true),
(uuid_generate_v4(), 'Shona', 'SHONA', true),
(uuid_generate_v4(), 'Physical Science', 'PHY', true),
(uuid_generate_v4(), 'Biology', 'BIO', true),
(uuid_generate_v4(), 'Geography', 'GEO', true),
(uuid_generate_v4(), 'History', 'HIST', true),
(uuid_generate_v4(), 'Commerce', 'COMM', true),
(uuid_generate_v4(), 'Accounts', 'ACC', true),
(uuid_generate_v4(), 'Computer Science', 'COMP', true),
(uuid_generate_v4(), 'Literature in English', 'LIT', true)
ON CONFLICT (name) DO NOTHING;

-- Classes for 2025 (Form 1A, 1B, 2A, ... 6A, 6B)
INSERT INTO classes (id, academic_year_id, form_id, stream_id, name)
SELECT uuid_generate_v4(), 'a1111111-1111-1111-1111-111111111111', f.id, s.id, f.name || ' ' || s.name
FROM forms f
JOIN streams s ON s.form_id = f.id
ON CONFLICT (academic_year_id, form_id, stream_id) DO NOTHING;

-- Sample news/events
INSERT INTO news_events (title, content, event_date, is_published) VALUES
('School Opening 2025', 'Term 1 begins 13 January 2025. All students must be in full uniform.', '2025-01-13', true),
('ZIMSEC Registration', 'Form 4 and Form 6 candidates: registration deadline 28 February 2025.', '2025-02-28', true),
('Sports Day', 'Annual inter-house sports day. All parents welcome.', '2025-03-15', true);

-- Fee structure 2025 (per form, same for all streams for simplicity)
-- One row per (academic_year_id, form_id, stream_id); stream_id NULL = applies to all streams for that form
INSERT INTO fee_structures (academic_year_id, form_id, stream_id, amount, description)
SELECT 'a1111111-1111-1111-1111-111111111111', f.id, NULL, 1200.00, 'Tuition ' || f.name
FROM forms f
ON CONFLICT (academic_year_id, form_id, stream_id) DO NOTHING;
