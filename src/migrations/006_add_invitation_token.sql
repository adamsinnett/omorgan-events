-- Add invitation_token column to attendees table
ALTER TABLE attendees
ADD COLUMN invitation_token TEXT;

-- Add foreign key constraint to link attendees to invitations
ALTER TABLE attendees
ADD CONSTRAINT attendees_invitation_token_fkey
FOREIGN KEY (invitation_token)
REFERENCES invitations(token)
ON DELETE SET NULL;

-- Add unique constraint to ensure one attendee per invitation
ALTER TABLE attendees
ADD CONSTRAINT attendees_invitation_token_unique
UNIQUE (invitation_token);

-- Add index for faster lookups
CREATE INDEX attendees_invitation_token_idx ON attendees(invitation_token);

-- Add comment to explain the column's purpose
COMMENT ON COLUMN attendees.invitation_token IS 'Links the attendee to their invitation token for persistent access'; 