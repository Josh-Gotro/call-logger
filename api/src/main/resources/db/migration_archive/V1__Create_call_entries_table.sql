-- Create call_entries table for logging call details
CREATE TABLE call_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    datatech_name VARCHAR(255) NOT NULL,
    datatech_email VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    is_inbound VARCHAR(20),  -- 'yes', 'no', or null for neutral state
    program_management VARCHAR(100),
    category VARCHAR(100),
    subject VARCHAR(100),
    is_agent VARCHAR(20),  -- 'yes', 'no', or null for neutral state
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on datatech_email for faster user-specific queries
CREATE INDEX idx_call_entries_datatech_email ON call_entries (datatech_email);

-- Create index on start_time for date range queries
CREATE INDEX idx_call_entries_start_time ON call_entries (start_time);

-- Create index on program_management for filtering
CREATE INDEX idx_call_entries_program_management ON call_entries (program_management);

-- Create index on created_at for general sorting
CREATE INDEX idx_call_entries_created_at ON call_entries (created_at);