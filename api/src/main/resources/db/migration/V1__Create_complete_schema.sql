-- V1: Complete Schema for Task-Subject Model
-- This migration creates the entire database schema from scratch
-- Replaces the old Department/Category/Subject model with Task-Subject many-to-many model

-- ============================================================================
-- TASK ENTITIES TABLE (replacing program_management_items)
-- ============================================================================
CREATE TABLE task_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SUBJECT ENTITIES TABLE (new structure, different from old subject_items)
-- ============================================================================
CREATE TABLE subject_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TASK-SUBJECT RELATIONSHIPS (Junction Table for Many-to-Many)
-- ============================================================================
CREATE TABLE task_subject_relationships (
    task_id UUID NOT NULL REFERENCES task_entities(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subject_entities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, subject_id)
);

-- ============================================================================
-- CALL ENTRIES TABLE (Updated structure)
-- ============================================================================
CREATE TABLE call_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    datatech_name VARCHAR(255) NOT NULL,
    datatech_email VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    
    -- Boolean fields (required, no nulls allowed)
    is_inbound BOOLEAN NOT NULL DEFAULT false,
    is_agent BOOLEAN NOT NULL DEFAULT false,
    
    -- Foreign key references to new tables
    task_id UUID REFERENCES task_entities(id),
    subject_id UUID REFERENCES subject_entities(id),
    
    -- Free text field
    comments TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: If subject is selected, it must be valid for the selected task
    -- This will be enforced at the application layer
    CONSTRAINT chk_task_subject_validity CHECK (
        subject_id IS NULL OR task_id IS NOT NULL
    )
);

-- ============================================================================
-- REPORT RUNS TABLE (UNCHANGED - Preserved as-is)
-- ============================================================================
CREATE TABLE report_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    report_type VARCHAR(50) NOT NULL,
    parameters JSONB,
    result_url VARCHAR(500),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT report_runs_status_check CHECK (
        status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')
    )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Task entities indexes
CREATE INDEX idx_task_entities_active ON task_entities(is_active, sort_order);
CREATE INDEX idx_task_entities_name ON task_entities(name);

-- Subject entities indexes
CREATE INDEX idx_subject_entities_active ON subject_entities(is_active, sort_order);
CREATE INDEX idx_subject_entities_name ON subject_entities(name);

-- Task-Subject relationship indexes
CREATE INDEX idx_task_subject_task_id ON task_subject_relationships(task_id);
CREATE INDEX idx_task_subject_subject_id ON task_subject_relationships(subject_id);

-- Call entries indexes
CREATE INDEX idx_call_entries_datatech_email ON call_entries(datatech_email);
CREATE INDEX idx_call_entries_start_time ON call_entries(start_time);
CREATE INDEX idx_call_entries_created_at ON call_entries(created_at);
CREATE INDEX idx_call_entries_task_id ON call_entries(task_id);
CREATE INDEX idx_call_entries_subject_id ON call_entries(subject_id);
CREATE INDEX idx_call_entries_date_range ON call_entries(start_time, end_time);

-- Report runs indexes (unchanged)
CREATE INDEX idx_report_runs_requested_by ON report_runs(requested_by);
CREATE INDEX idx_report_runs_status ON report_runs(status);
CREATE INDEX idx_report_runs_created_at ON report_runs(created_at);
CREATE INDEX idx_report_runs_user_status ON report_runs(requested_by, status);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE task_entities IS 'Reference table for tasks (e.g., IFQ, GAF, Crab, etc.)';
COMMENT ON TABLE subject_entities IS 'Reference table for subjects that can be associated with tasks';
COMMENT ON TABLE task_subject_relationships IS 'Junction table defining which subjects are available for each task';
COMMENT ON TABLE call_entries IS 'Main table for call log entries with task and optional subject references';
COMMENT ON TABLE report_runs IS 'Tracks asynchronous report generation requests and results';

COMMENT ON COLUMN call_entries.task_id IS 'Reference to the task being worked on';
COMMENT ON COLUMN call_entries.subject_id IS 'Optional reference to a specific subject within the task';
COMMENT ON COLUMN call_entries.is_inbound IS 'Boolean flag: true for inbound calls, false for outbound calls';
COMMENT ON COLUMN call_entries.is_agent IS 'Boolean flag: true if call involves an agent, false otherwise';

-- ============================================================================
-- INITIAL DATA (Tasks and Subjects)
-- ============================================================================

-- Insert Tasks
INSERT INTO task_entities (id, name, sort_order, is_active) VALUES
('11111111-1111-1111-1111-000000000001', 'IFQ', 10, true),
('11111111-1111-1111-1111-000000000002', 'GAF', 20, true),
('11111111-1111-1111-1111-000000000003', 'Crab', 30, true),
('11111111-1111-1111-1111-000000000004', 'CIS Logbooks', 40, true),
('11111111-1111-1111-1111-000000000005', 'eFISH', 50, true),
('11111111-1111-1111-1111-000000000006', 'eLandings', 60, true),
('11111111-1111-1111-1111-000000000007', 'Redirect', 70, true),
('11111111-1111-1111-1111-000000000008', 'Other Groundfish', 80, true);

-- Insert Subjects
INSERT INTO subject_entities (id, name, sort_order, is_active) VALUES
('22222222-2222-2222-2222-000000000001', 'Redline', 10, true),
('22222222-2222-2222-2222-000000000002', 'MLR', 20, true),
('22222222-2222-2222-2222-000000000003', 'PNOL', 30, true),
('22222222-2222-2222-2222-000000000004', 'VAR', 40, true),
('22222222-2222-2222-2222-000000000005', 'Departure Report', 50, true),
('22222222-2222-2222-2222-000000000006', 'OLE Request', 60, true),
('22222222-2222-2222-2222-000000000007', 'IPHC Vessel Clearance', 70, true),
('22222222-2222-2222-2222-000000000008', 'VMS Check out', 80, true),
('22222222-2222-2222-2222-000000000009', 'USCG Requests', 90, true),
('22222222-2222-2222-2222-000000000010', 'IPHC Staff', 100, true),
('22222222-2222-2222-2222-000000000011', 'Other', 110, true);

-- Insert Task-Subject Relationships
-- IFQ has 10 subjects (all except "Other")
INSERT INTO task_subject_relationships (task_id, subject_id) VALUES
('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000001'), -- IFQ -> Redline
('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000002'), -- IFQ -> MLR
('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000003'), -- IFQ -> PNOL
('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000004'), -- IFQ -> VAR
('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000005'), -- IFQ -> Departure Report
('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000006'), -- IFQ -> OLE Request
('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000007'), -- IFQ -> IPHC Vessel Clearance
('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000008'), -- IFQ -> VMS Check out
('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000009'), -- IFQ -> USCG Requests
('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000010'); -- IFQ -> IPHC Staff

-- GAF has 3 subjects
INSERT INTO task_subject_relationships (task_id, subject_id) VALUES
('11111111-1111-1111-1111-000000000002', '22222222-2222-2222-2222-000000000001'), -- GAF -> Redline
('11111111-1111-1111-1111-000000000002', '22222222-2222-2222-2222-000000000006'), -- GAF -> OLE Request
('11111111-1111-1111-1111-000000000002', '22222222-2222-2222-2222-000000000002'); -- GAF -> MLR

-- Crab has 4 subjects
INSERT INTO task_subject_relationships (task_id, subject_id) VALUES
('11111111-1111-1111-1111-000000000003', '22222222-2222-2222-2222-000000000001'), -- Crab -> Redline
('11111111-1111-1111-1111-000000000003', '22222222-2222-2222-2222-000000000002'), -- Crab -> MLR
('11111111-1111-1111-1111-000000000003', '22222222-2222-2222-2222-000000000011'), -- Crab -> Other
('11111111-1111-1111-1111-000000000003', '22222222-2222-2222-2222-000000000006'); -- Crab -> OLE Request

-- CIS Logbooks, eFISH, eLandings, Redirect, and Other Groundfish have no subjects
-- (No entries in task_subject_relationships for these tasks)

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================