-- V3: Drop and recreate schema with reference tables and enhanced structure
-- This migration recreates the database schema from scratch with proper boolean types,
-- reference tables for dropdown data, and hierarchical program management support.

-- Drop existing tables (order matters due to foreign keys)
DROP TABLE IF EXISTS call_entries CASCADE;
DROP TABLE IF EXISTS report_runs CASCADE;

-- Create reference tables for dropdown data
CREATE TABLE program_management_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES program_management_items(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE category_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subject_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced call_entries table with proper foreign keys and boolean types
CREATE TABLE call_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    datatech_name VARCHAR(255) NOT NULL,
    datatech_email VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    
    -- Boolean fields (required, no nulls allowed)
    is_inbound BOOLEAN NOT NULL DEFAULT false,
    is_agent BOOLEAN NOT NULL DEFAULT false,
    
    -- Foreign key references to lookup tables
    program_management_parent_id UUID REFERENCES program_management_items(id),
    program_management_child_id UUID REFERENCES program_management_items(id),
    category_id UUID REFERENCES category_items(id),
    subject_id UUID REFERENCES subject_items(id),
    
    comments TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_program_management_hierarchy CHECK (
        -- If child is selected, parent must also be selected
        (program_management_child_id IS NULL OR program_management_parent_id IS NOT NULL)
    )
);

-- Recreate report_runs table with enhanced structure
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

-- Create indexes for performance optimization
-- Call entries indexes
CREATE INDEX idx_call_entries_datatech_email ON call_entries(datatech_email);
CREATE INDEX idx_call_entries_start_time ON call_entries(start_time);
CREATE INDEX idx_call_entries_created_at ON call_entries(created_at);
CREATE INDEX idx_call_entries_program_parent ON call_entries(program_management_parent_id);
CREATE INDEX idx_call_entries_category ON call_entries(category_id);
CREATE INDEX idx_call_entries_date_range ON call_entries(start_time, end_time);

-- Program management hierarchy index
CREATE INDEX idx_program_mgmt_parent_id ON program_management_items(parent_id);
CREATE INDEX idx_program_mgmt_active ON program_management_items(is_active);

-- Reference table indexes for active items
CREATE INDEX idx_category_items_active ON category_items(is_active, sort_order);
CREATE INDEX idx_subject_items_active ON subject_items(is_active, sort_order);

-- Report runs indexes
CREATE INDEX idx_report_runs_requested_by ON report_runs(requested_by);
CREATE INDEX idx_report_runs_status ON report_runs(status);
CREATE INDEX idx_report_runs_created_at ON report_runs(created_at);
CREATE INDEX idx_report_runs_user_status ON report_runs(requested_by, status);

-- Comments for documentation
COMMENT ON TABLE program_management_items IS 'Hierarchical lookup table for program management options';
COMMENT ON TABLE category_items IS 'Lookup table for call categories';
COMMENT ON TABLE subject_items IS 'Lookup table for call subjects';
COMMENT ON TABLE call_entries IS 'Main table for call log entries with foreign key references to lookup tables';
COMMENT ON COLUMN call_entries.is_inbound IS 'Boolean flag: true for inbound calls, false for outbound calls';
COMMENT ON COLUMN call_entries.is_agent IS 'Boolean flag: true if call involves an agent, false otherwise';
COMMENT ON CONSTRAINT chk_program_management_hierarchy ON call_entries IS 'Ensures hierarchical consistency: child requires parent';