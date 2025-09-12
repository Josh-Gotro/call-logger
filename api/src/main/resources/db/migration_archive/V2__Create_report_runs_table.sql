-- Create report_runs table for tracking report generation
CREATE TABLE report_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    report_type VARCHAR(50) NOT NULL,  -- 'LIVE', 'ASYNC_USER', 'ASYNC_TEAM', etc.
    parameters JSONB,  -- Store report filters and parameters as JSON
    result_url VARCHAR(500),  -- URL to download completed report
    error_message TEXT,  -- Store error details if status is FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index on requested_by for user-specific queries
CREATE INDEX idx_report_runs_requested_by ON report_runs (requested_by);

-- Create index on status for filtering active reports
CREATE INDEX idx_report_runs_status ON report_runs (status);

-- Create index on created_at for chronological sorting
CREATE INDEX idx_report_runs_created_at ON report_runs (created_at);

-- Create composite index for user + status queries
CREATE INDEX idx_report_runs_user_status ON report_runs (requested_by, status);