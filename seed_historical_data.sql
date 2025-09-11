-- Add comprehensive historical data for all users
-- This will supplement the existing 5 records for Josh from today

-- Add today's calls for other users
INSERT INTO call_entries (
    id, datatech_email, datatech_name, start_time, end_time, is_inbound, is_agent,
    program_management_parent_id, program_management_child_id, category_id, subject_id,
    comments, created_at, updated_at
) VALUES
    -- Asimov's calls for today (2025-09-11)
    (gen_random_uuid(), 'asimov@wostmann.com', 'Asimov',
     '2025-09-11 08:30:00-08:00'::timestamptz, '2025-09-11 08:45:00-08:00'::timestamptz,
     true, false, '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333337',
     'c0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000010', 'Application error resolved',
     '2025-09-11 08:30:00-08:00'::timestamptz, '2025-09-11 08:45:00-08:00'::timestamptz),
    
    (gen_random_uuid(), 'asimov@wostmann.com', 'Asimov',
     '2025-09-11 13:15:00-08:00'::timestamptz, '2025-09-11 13:18:00-08:00'::timestamptz,
     false, false, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222225',
     'c0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000007', NULL,
     '2025-09-11 13:15:00-08:00'::timestamptz, '2025-09-11 13:18:00-08:00'::timestamptz),
    
    -- Seldon's calls for today
    (gen_random_uuid(), 'seldon@wostmann.com', 'Seldon',
     '2025-09-11 09:00:00-08:00'::timestamptz, '2025-09-11 09:12:00-08:00'::timestamptz,
     true, false, '55555555-5555-5555-5555-555555555555', NULL,
     'c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000012', 'Permission request approved',
     '2025-09-11 09:00:00-08:00'::timestamptz, '2025-09-11 09:12:00-08:00'::timestamptz),
    
    (gen_random_uuid(), 'seldon@wostmann.com', 'Seldon',
     '2025-09-11 14:45:00-08:00'::timestamptz, '2025-09-11 14:50:00-08:00'::timestamptz,
     true, false, '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444448',
     'c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000013', NULL,
     '2025-09-11 14:45:00-08:00'::timestamptz, '2025-09-11 14:50:00-08:00'::timestamptz),
    
    -- Mule's calls for today
    (gen_random_uuid(), 'mule@wostmann.com', 'Mule',
     '2025-09-11 10:00:00-08:00'::timestamptz, '2025-09-11 10:25:00-08:00'::timestamptz,
     false, false, '22222222-2222-2222-2222-222222222222', NULL,
     'c0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000009', 'Security incident resolved',
     '2025-09-11 10:00:00-08:00'::timestamptz, '2025-09-11 10:25:00-08:00'::timestamptz);

-- Historical data for September 2025 (excluding today)
INSERT INTO call_entries (
    id, datatech_email, datatech_name, start_time, end_time, is_inbound, is_agent,
    program_management_parent_id, program_management_child_id, category_id, subject_id,
    comments, created_at, updated_at
) VALUES
    -- Josh - September 10
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-09-10 09:15:00-08:00'::timestamptz, '2025-09-10 09:22:30-08:00'::timestamptz,
     true, false, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222225',
     'c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'Password reset completed',
     '2025-09-10 09:15:00-08:00'::timestamptz, '2025-09-10 09:22:30-08:00'::timestamptz),
    
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-09-10 11:30:00-08:00'::timestamptz, '2025-09-10 11:45:15-08:00'::timestamptz,
     false, false, '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333336',
     'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003', NULL,
     '2025-09-10 11:30:00-08:00'::timestamptz, '2025-09-10 11:45:15-08:00'::timestamptz),
    
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-09-10 14:20:00-08:00'::timestamptz, '2025-09-10 14:35:00-08:00'::timestamptz,
     true, false, '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444447',
     'c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000002', 'Software installation assistance',
     '2025-09-10 14:20:00-08:00'::timestamptz, '2025-09-10 14:35:00-08:00'::timestamptz),
    
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-09-10 15:45:00-08:00'::timestamptz, '2025-09-10 15:52:00-08:00'::timestamptz,
     true, false, '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555557',
     'c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000012', NULL,
     '2025-09-10 15:45:00-08:00'::timestamptz, '2025-09-10 15:52:00-08:00'::timestamptz),
    
    -- Asimov - September 10
    (gen_random_uuid(), 'asimov@wostmann.com', 'Asimov',
     '2025-09-10 10:15:00-08:00'::timestamptz, '2025-09-10 10:28:00-08:00'::timestamptz,
     true, false, '22222222-2222-2222-2222-222222222222', NULL,
     'c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000004', 'Network connectivity issues resolved',
     '2025-09-10 10:15:00-08:00'::timestamptz, '2025-09-10 10:28:00-08:00'::timestamptz),
    
    (gen_random_uuid(), 'asimov@wostmann.com', 'Asimov',
     '2025-09-10 13:30:00-08:00'::timestamptz, '2025-09-10 13:35:00-08:00'::timestamptz,
     false, false, '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333337',
     'c0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000007', NULL,
     '2025-09-10 13:30:00-08:00'::timestamptz, '2025-09-10 13:35:00-08:00'::timestamptz),
    
    -- Seldon - September 10
    (gen_random_uuid(), 'seldon@wostmann.com', 'Seldon',
     '2025-09-10 11:00:00-08:00'::timestamptz, '2025-09-10 11:08:00-08:00'::timestamptz,
     true, false, '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444448',
     'c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000005', 'Email setup completed',
     '2025-09-10 11:00:00-08:00'::timestamptz, '2025-09-10 11:08:00-08:00'::timestamptz),
    
    -- Mule - September 10
    (gen_random_uuid(), 'mule@wostmann.com', 'Mule',
     '2025-09-10 14:00:00-08:00'::timestamptz, '2025-09-10 14:12:00-08:00'::timestamptz,
     true, false, '55555555-5555-5555-5555-555555555555', NULL,
     'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003', 'Hardware issue diagnosed',
     '2025-09-10 14:00:00-08:00'::timestamptz, '2025-09-10 14:12:00-08:00'::timestamptz);

-- Add more historical data for August 2025 (sample days)
INSERT INTO call_entries (
    id, datatech_email, datatech_name, start_time, end_time, is_inbound, is_agent,
    program_management_parent_id, program_management_child_id, category_id, subject_id,
    comments, created_at, updated_at
) VALUES
    -- Josh - August 30
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-08-30 08:45:00-08:00'::timestamptz, '2025-08-30 09:05:00-08:00'::timestamptz,
     true, false, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222225',
     'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000010', 'Critical application error fixed',
     '2025-08-30 08:45:00-08:00'::timestamptz, '2025-08-30 09:05:00-08:00'::timestamptz),
    
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-08-30 13:20:00-08:00'::timestamptz, '2025-08-30 13:28:00-08:00'::timestamptz,
     false, false, '33333333-3333-3333-3333-333333333333', NULL,
     'c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000001', NULL,
     '2025-08-30 13:20:00-08:00'::timestamptz, '2025-08-30 13:28:00-08:00'::timestamptz),
    
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-08-30 15:10:00-08:00'::timestamptz, '2025-08-30 15:25:00-08:00'::timestamptz,
     true, false, '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444447',
     'c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', 'New software deployment support',
     '2025-08-30 15:10:00-08:00'::timestamptz, '2025-08-30 15:25:00-08:00'::timestamptz),
    
    -- Asimov - August 29
    (gen_random_uuid(), 'asimov@wostmann.com', 'Asimov',
     '2025-08-29 09:30:00-08:00'::timestamptz, '2025-08-29 09:42:00-08:00'::timestamptz,
     true, false, '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333336',
     'c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000004', NULL,
     '2025-08-29 09:30:00-08:00'::timestamptz, '2025-08-29 09:42:00-08:00'::timestamptz),
    
    (gen_random_uuid(), 'asimov@wostmann.com', 'Asimov',
     '2025-08-29 14:15:00-08:00'::timestamptz, '2025-08-29 14:20:00-08:00'::timestamptz,
     false, false, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222225',
     'c0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000007', 'Routine system check completed',
     '2025-08-29 14:15:00-08:00'::timestamptz, '2025-08-29 14:20:00-08:00'::timestamptz),
    
    -- Seldon - August 28
    (gen_random_uuid(), 'seldon@wostmann.com', 'Seldon',
     '2025-08-28 10:45:00-08:00'::timestamptz, '2025-08-28 11:02:00-08:00'::timestamptz,
     true, false, '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555557',
     'c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000012', 'Account permissions updated',
     '2025-08-28 10:45:00-08:00'::timestamptz, '2025-08-28 11:02:00-08:00'::timestamptz),
    
    -- Mule - August 27
    (gen_random_uuid(), 'mule@wostmann.com', 'Mule',
     '2025-08-27 11:30:00-08:00'::timestamptz, '2025-08-27 11:38:00-08:00'::timestamptz,
     true, false, '44444444-4444-4444-4444-444444444444', NULL,
     'c0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000003', NULL,
     '2025-08-27 11:30:00-08:00'::timestamptz, '2025-08-27 11:38:00-08:00'::timestamptz);

-- Add July data (sample)
INSERT INTO call_entries (
    id, datatech_email, datatech_name, start_time, end_time, is_inbound, is_agent,
    program_management_parent_id, program_management_child_id, category_id, subject_id,
    comments, created_at, updated_at
) VALUES
    -- Josh - July 31
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-07-31 09:00:00-08:00'::timestamptz, '2025-07-31 09:18:00-08:00'::timestamptz,
     true, false, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222225',
     'c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', NULL,
     '2025-07-31 09:00:00-08:00'::timestamptz, '2025-07-31 09:18:00-08:00'::timestamptz),
    
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-07-31 14:30:00-08:00'::timestamptz, '2025-07-31 14:42:00-08:00'::timestamptz,
     false, false, '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333337',
     'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000010', 'Database maintenance completed',
     '2025-07-31 14:30:00-08:00'::timestamptz, '2025-07-31 14:42:00-08:00'::timestamptz),
    
    -- Josh - July 30
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-07-30 10:15:00-08:00'::timestamptz, '2025-07-30 10:28:00-08:00'::timestamptz,
     true, false, '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444448',
     'c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000005', NULL,
     '2025-07-30 10:15:00-08:00'::timestamptz, '2025-07-30 10:28:00-08:00'::timestamptz),
    
    -- Asimov - July 29
    (gen_random_uuid(), 'asimov@wostmann.com', 'Asimov',
     '2025-07-29 11:45:00-08:00'::timestamptz, '2025-07-29 12:05:00-08:00'::timestamptz,
     true, false, '22222222-2222-2222-2222-222222222222', NULL,
     'c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', 'Server maintenance coordination',
     '2025-07-29 11:45:00-08:00'::timestamptz, '2025-07-29 12:05:00-08:00'::timestamptz),
    
    -- Seldon - July 28
    (gen_random_uuid(), 'seldon@wostmann.com', 'Seldon',
     '2025-07-28 13:20:00-08:00'::timestamptz, '2025-07-28 13:32:00-08:00'::timestamptz,
     false, false, '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555557',
     'c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000012', NULL,
     '2025-07-28 13:20:00-08:00'::timestamptz, '2025-07-28 13:32:00-08:00'::timestamptz);

-- Add some June data
INSERT INTO call_entries (
    id, datatech_email, datatech_name, start_time, end_time, is_inbound, is_agent,
    program_management_parent_id, program_management_child_id, category_id, subject_id,
    comments, created_at, updated_at
) VALUES
    -- Josh - June 28
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-06-28 08:30:00-08:00'::timestamptz, '2025-06-28 08:45:00-08:00'::timestamptz,
     true, false, '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333336',
     'c0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000001', 'Monthly password reset',
     '2025-06-28 08:30:00-08:00'::timestamptz, '2025-06-28 08:45:00-08:00'::timestamptz),
    
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-06-28 15:20:00-08:00'::timestamptz, '2025-06-28 15:35:00-08:00'::timestamptz,
     false, false, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222225',
     'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003', 'End-of-month system backup verification',
     '2025-06-28 15:20:00-08:00'::timestamptz, '2025-06-28 15:35:00-08:00'::timestamptz),
    
    -- Asimov - June 27
    (gen_random_uuid(), 'asimov@wostmann.com', 'Asimov',
     '2025-06-27 10:00:00-08:00'::timestamptz, '2025-06-27 10:15:00-08:00'::timestamptz,
     true, false, '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444447',
     'c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000007', NULL,
     '2025-06-27 10:00:00-08:00'::timestamptz, '2025-06-27 10:15:00-08:00'::timestamptz),
    
    -- Earlier months - sample data
    -- Josh - May 15
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-05-15 09:30:00-08:00'::timestamptz, '2025-05-15 09:50:00-08:00'::timestamptz,
     true, false, '22222222-2222-2222-2222-222222222222', NULL,
     'c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000004', 'Spring network maintenance',
     '2025-05-15 09:30:00-08:00'::timestamptz, '2025-05-15 09:50:00-08:00'::timestamptz),
    
    -- Josh - April 10
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-04-10 11:15:00-08:00'::timestamptz, '2025-04-10 11:32:00-08:00'::timestamptz,
     false, false, '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333337',
     'c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000002', NULL,
     '2025-04-10 11:15:00-08:00'::timestamptz, '2025-04-10 11:32:00-08:00'::timestamptz),
    
    -- Josh - March 20
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-03-20 14:00:00-08:00'::timestamptz, '2025-03-20 14:25:00-08:00'::timestamptz,
     true, false, '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555557',
     'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000010', 'Quarterly system review',
     '2025-03-20 14:00:00-08:00'::timestamptz, '2025-03-20 14:25:00-08:00'::timestamptz),
    
    -- Josh - February 14
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-02-14 10:45:00-08:00'::timestamptz, '2025-02-14 11:08:00-08:00'::timestamptz,
     true, false, '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444448',
     'c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000005', 'Valentine day email system maintenance',
     '2025-02-14 10:45:00-08:00'::timestamptz, '2025-02-14 11:08:00-08:00'::timestamptz),
    
    -- Josh - January 15
    (gen_random_uuid(), 'josh.gauthreaux@wostmann.com', 'Gauthreaux',
     '2025-01-15 13:30:00-08:00'::timestamptz, '2025-01-15 13:55:00-08:00'::timestamptz,
     false, false, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222225',
     'c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', 'New year system updates',
     '2025-01-15 13:30:00-08:00'::timestamptz, '2025-01-15 13:55:00-08:00'::timestamptz),
    
    -- Asimov - January 8
    (gen_random_uuid(), 'asimov@wostmann.com', 'Asimov',
     '2025-01-08 09:20:00-08:00'::timestamptz, '2025-01-08 09:35:00-08:00'::timestamptz,
     true, false, '33333333-3333-3333-3333-333333333333', NULL,
     'c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000003', 'First week of year hardware check',
     '2025-01-08 09:20:00-08:00'::timestamptz, '2025-01-08 09:35:00-08:00'::timestamptz),
    
    -- Seldon - January 3
    (gen_random_uuid(), 'seldon@wostmann.com', 'Seldon',
     '2025-01-03 11:00:00-08:00'::timestamptz, '2025-01-03 11:12:00-08:00'::timestamptz,
     true, false, '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555557',
     'c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000007', 'Post-holiday system access verification',
     '2025-01-03 11:00:00-08:00'::timestamptz, '2025-01-03 11:12:00-08:00'::timestamptz),
    
    -- Mule - January 2
    (gen_random_uuid(), 'mule@wostmann.com', 'Mule',
     '2025-01-02 14:30:00-08:00'::timestamptz, '2025-01-02 14:45:00-08:00'::timestamptz,
     false, false, '22222222-2222-2222-2222-222222222222', NULL,
     'c0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000002', 'New year follow-up on previous issues',
     '2025-01-02 14:30:00-08:00'::timestamptz, '2025-01-02 14:45:00-08:00'::timestamptz);