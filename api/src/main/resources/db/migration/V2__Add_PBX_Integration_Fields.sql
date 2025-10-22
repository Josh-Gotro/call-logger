-- Add PBX integration fields to call_entries table
ALTER TABLE call_entries
    ADD COLUMN phone_number VARCHAR(50),
    ADD COLUMN pbx_call_id VARCHAR(100),
    ADD COLUMN is_pbx_originated BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN pbx_data_received_at TIMESTAMP WITH TIME ZONE;

-- Create index on pbx_call_id for faster lookups
CREATE INDEX idx_call_entries_pbx_call_id ON call_entries(pbx_call_id);

-- Create index on is_pbx_originated for filtering PBX calls
CREATE INDEX idx_call_entries_is_pbx_originated ON call_entries(is_pbx_originated);

-- Create call_group_alerts table
CREATE TABLE call_group_alerts (
    id UUID PRIMARY KEY,
    call_group_id VARCHAR(100) NOT NULL,
    call_group_name VARCHAR(255),
    alert_type VARCHAR(50) NOT NULL,
    alert_message TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for call_group_alerts
CREATE INDEX idx_call_group_alerts_group_id ON call_group_alerts(call_group_id);
CREATE INDEX idx_call_group_alerts_is_active ON call_group_alerts(is_active);
CREATE INDEX idx_call_group_alerts_created_at ON call_group_alerts(created_at DESC);

-- Add comment to document PBX integration
COMMENT ON COLUMN call_entries.phone_number IS 'Phone number from PBX system (caller or recipient)';
COMMENT ON COLUMN call_entries.pbx_call_id IS 'Unique identifier from 3CX phone system';
COMMENT ON COLUMN call_entries.is_pbx_originated IS 'Flag indicating call was automatically logged from PBX';
COMMENT ON COLUMN call_entries.pbx_data_received_at IS 'Timestamp when PBX data was received by API';
COMMENT ON TABLE call_group_alerts IS 'Alerts for call groups with no assigned users during business hours';
