-- V5: Seed reference data for dropdown tables (fixed UUID format)
-- This migration populates the reference tables with initial data for
-- program management (with hierarchy), categories, and subjects.

-- Insert program management items (parent items first)
INSERT INTO program_management_items (id, name, parent_id, is_active, sort_order) VALUES
-- Top-level parents
('11111111-1111-1111-1111-111111111111', 'IT Services', NULL, true, 10),
('22222222-2222-2222-2222-222222222222', 'Human Resources', NULL, true, 20),
('33333333-3333-3333-3333-333333333333', 'Finance & Accounting', NULL, true, 30),
('44444444-4444-4444-4444-444444444444', 'Operations', NULL, true, 40),
('55555555-5555-5555-5555-555555555555', 'Customer Support', NULL, true, 50),

-- IT Services children
('11111111-1111-1111-1111-111111111112', 'Help Desk', '11111111-1111-1111-1111-111111111111', true, 10),
('11111111-1111-1111-1111-111111111113', 'Infrastructure', '11111111-1111-1111-1111-111111111111', true, 20),
('11111111-1111-1111-1111-111111111114', 'Software Development', '11111111-1111-1111-1111-111111111111', true, 30),
('11111111-1111-1111-1111-111111111115', 'Security', '11111111-1111-1111-1111-111111111111', true, 40),

-- Human Resources children
('22222222-2222-2222-2222-222222222223', 'Recruitment', '22222222-2222-2222-2222-222222222222', true, 10),
('22222222-2222-2222-2222-222222222224', 'Employee Relations', '22222222-2222-2222-2222-222222222222', true, 20),
('22222222-2222-2222-2222-222222222225', 'Benefits', '22222222-2222-2222-2222-222222222222', true, 30),
('22222222-2222-2222-2222-222222222226', 'Training & Development', '22222222-2222-2222-2222-222222222222', true, 40),

-- Finance & Accounting children
('33333333-3333-3333-3333-333333333334', 'Accounts Payable', '33333333-3333-3333-3333-333333333333', true, 10),
('33333333-3333-3333-3333-333333333335', 'Accounts Receivable', '33333333-3333-3333-3333-333333333333', true, 20),
('33333333-3333-3333-3333-333333333336', 'Payroll', '33333333-3333-3333-3333-333333333333', true, 30),
('33333333-3333-3333-3333-333333333337', 'Financial Reporting', '33333333-3333-3333-3333-333333333333', true, 40),

-- Operations children
('44444444-4444-4444-4444-444444444445', 'Facilities Management', '44444444-4444-4444-4444-444444444444', true, 10),
('44444444-4444-4444-4444-444444444446', 'Supply Chain', '44444444-4444-4444-4444-444444444444', true, 20),
('44444444-4444-4444-4444-444444444447', 'Quality Assurance', '44444444-4444-4444-4444-444444444444', true, 30),
('44444444-4444-4444-4444-444444444448', 'Project Management', '44444444-4444-4444-4444-444444444444', true, 40),

-- Customer Support children
('55555555-5555-5555-5555-555555555556', 'Technical Support', '55555555-5555-5555-5555-555555555555', true, 10),
('55555555-5555-5555-5555-555555555557', 'Customer Service', '55555555-5555-5555-5555-555555555555', true, 20),
('55555555-5555-5555-5555-555555555558', 'Account Management', '55555555-5555-5555-5555-555555555555', true, 30);

-- Insert category items
INSERT INTO category_items (id, name, is_active, sort_order) VALUES
('c0000001-0000-0000-0000-000000000001', 'Incident Report', true, 10),
('c0000001-0000-0000-0000-000000000002', 'Service Request', true, 20),
('c0000001-0000-0000-0000-000000000003', 'Information Request', true, 30),
('c0000001-0000-0000-0000-000000000004', 'Complaint', true, 40),
('c0000001-0000-0000-0000-000000000005', 'Consultation', true, 50),
('c0000001-0000-0000-0000-000000000006', 'Follow-up', true, 60),
('c0000001-0000-0000-0000-000000000007', 'Emergency', true, 70),
('c0000001-0000-0000-0000-000000000008', 'Routine Check', true, 80),
('c0000001-0000-0000-0000-000000000009', 'Training', true, 90),
('c0000001-0000-0000-0000-000000000010', 'Other', true, 100);

-- Insert subject items (fixed UUID format)
INSERT INTO subject_items (id, name, is_active, sort_order) VALUES
('b0000001-0000-0000-0000-000000000001', 'Password Reset', true, 10),
('b0000001-0000-0000-0000-000000000002', 'Software Installation', true, 20),
('b0000001-0000-0000-0000-000000000003', 'Hardware Issue', true, 30),
('b0000001-0000-0000-0000-000000000004', 'Network Connectivity', true, 40),
('b0000001-0000-0000-0000-000000000005', 'Email Setup', true, 50),
('b0000001-0000-0000-0000-000000000006', 'Printer Problems', true, 60),
('b0000001-0000-0000-0000-000000000007', 'System Access', true, 70),
('b0000001-0000-0000-0000-000000000008', 'Data Backup', true, 80),
('b0000001-0000-0000-0000-000000000009', 'Security Issue', true, 90),
('b0000001-0000-0000-0000-000000000010', 'Application Error', true, 100),
('b0000001-0000-0000-0000-000000000011', 'Account Setup', true, 110),
('b0000001-0000-0000-0000-000000000012', 'Permission Request', true, 120),
('b0000001-0000-0000-0000-000000000013', 'Policy Question', true, 130),
('b0000001-0000-0000-0000-000000000014', 'General Inquiry', true, 140),
('b0000001-0000-0000-0000-000000000015', 'Other', true, 150);

-- Add comments for documentation
COMMENT ON TABLE program_management_items IS 'Seeded with hierarchical program management structure';
COMMENT ON TABLE category_items IS 'Seeded with common call categories';
COMMENT ON TABLE subject_items IS 'Seeded with common call subjects';