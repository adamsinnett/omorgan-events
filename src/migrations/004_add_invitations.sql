-- Create invitations table for magic links
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes for better query performance
CREATE INDEX idx_invitations_event_id ON invitations(event_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

-- Add updated_at trigger
CREATE TRIGGER update_invitations_updated_at
    BEFORE UPDATE ON invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all invitations
CREATE POLICY "Admins can manage all invitations"
    ON invitations
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Allow users to view their own invitations
CREATE POLICY "Users can view their own invitations"
    ON invitations
    FOR SELECT
    TO authenticated
    USING (created_by = auth.jwt() ->> 'email');

-- Allow users to create invitations for their events
CREATE POLICY "Users can create invitations for their events"
    ON invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by = auth.jwt() ->> 'email' AND
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = invitations.event_id
            AND events.created_by = auth.jwt() ->> 'email'
        )
    );

-- Allow users to delete their own invitations
CREATE POLICY "Users can delete their own invitations"
    ON invitations
    FOR DELETE
    TO authenticated
    USING (created_by = auth.jwt() ->> 'email'); 