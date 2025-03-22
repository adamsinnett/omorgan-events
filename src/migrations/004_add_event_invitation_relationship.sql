-- Add foreign key constraint to invitations table
ALTER TABLE invitations
ADD CONSTRAINT fk_event
FOREIGN KEY (event_id)
REFERENCES events(id)
ON DELETE CASCADE;

-- Add comment to help Hasura understand the relationship
COMMENT ON CONSTRAINT fk_event ON invitations IS '@foreignKey (event_id) REFERENCES events (id)';

-- Add relationship comment to events table
COMMENT ON TABLE events IS '@name "events" @foreignKey (id) REFERENCES invitations (event_id)'; 