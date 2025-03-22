-- Enable Hasura GraphQL API
CREATE SCHEMA IF NOT EXISTS hdb_catalog;

-- Create Hasura metadata tables
CREATE TABLE IF NOT EXISTS hdb_catalog.hdb_version (
    version INTEGER NOT NULL,
    upgraded_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (version)
);

-- Create table metadata table
CREATE TABLE IF NOT EXISTS hdb_catalog.hdb_table_metadata (
    table_schema TEXT NOT NULL,
    table_name TEXT NOT NULL,
    comment TEXT,
    is_enum BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (table_schema, table_name)
);

-- Create relationship metadata table
CREATE TABLE IF NOT EXISTS hdb_catalog.hdb_relationship_metadata (
    table_schema TEXT NOT NULL,
    table_name TEXT NOT NULL,
    rel_name TEXT NOT NULL,
    rel_type TEXT NOT NULL,
    rel_def JSONB NOT NULL,
    PRIMARY KEY (table_schema, table_name, rel_name)
);

-- Create permission metadata table
CREATE TABLE IF NOT EXISTS hdb_catalog.hdb_permission_metadata (
    table_schema TEXT NOT NULL,
    table_name TEXT NOT NULL,
    role_name TEXT NOT NULL,
    perm_type TEXT NOT NULL,
    perm_def JSONB NOT NULL,
    PRIMARY KEY (table_schema, table_name, role_name, perm_type)
);

-- Insert initial version
INSERT INTO hdb_catalog.hdb_version (version) VALUES (1)
ON CONFLICT (version) DO NOTHING;

-- Create Hasura metadata
INSERT INTO hdb_catalog.hdb_table_metadata (table_schema, table_name, comment, is_enum)
VALUES 
    ('public', 'events', 'Events table', false),
    ('public', 'attendees', 'Event attendees table', false),
    ('public', 'messages', 'Event messages table', false),
    ('public', 'reactions', 'Message reactions table', false),
    ('public', 'invitations', 'Event invitations table', false)
ON CONFLICT (table_schema, table_name) DO NOTHING;

-- Set up relationships
INSERT INTO hdb_catalog.hdb_relationship_metadata (table_schema, table_name, rel_name, rel_type, rel_def)
VALUES
    -- Events to Attendees
    ('public', 'events', 'attendees', 'array', '{"foreign_key_constraint_on": "attendees.event_id"}'),
    -- Events to Messages
    ('public', 'events', 'messages', 'array', '{"foreign_key_constraint_on": "messages.event_id"}'),
    -- Events to Invitations
    ('public', 'events', 'invitations', 'array', '{"foreign_key_constraint_on": "invitations.event_id"}'),
    -- Messages to Reactions
    ('public', 'messages', 'reactions', 'array', '{"foreign_key_constraint_on": "reactions.message_id"}'),
    -- Messages to Parent Messages (self-referential)
    ('public', 'messages', 'parent', 'object', '{"foreign_key_constraint_on": "messages.parent_id"}'),
    ('public', 'messages', 'replies', 'array', '{"foreign_key_constraint_on": "messages.parent_id"}')
ON CONFLICT (table_schema, table_name, rel_name) DO NOTHING;

-- Set up permissions (basic setup, can be modified through Hasura Console)
INSERT INTO hdb_catalog.hdb_permission_metadata (table_schema, table_name, role_name, perm_type, perm_def)
VALUES
    -- Events permissions
    ('public', 'events', 'admin', 'select', '{"filter": {}}'),
    ('public', 'events', 'admin', 'insert', '{"check": {}}'),
    ('public', 'events', 'admin', 'update', '{"check": {}}'),
    ('public', 'events', 'admin', 'delete', '{"check": {}}'),
    ('public', 'events', 'user', 'select', '{"filter": {"is_private": {"_eq": false}}}'),
    ('public', 'events', 'user', 'insert', '{"check": {"created_by": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'events', 'user', 'update', '{"check": {"created_by": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'events', 'user', 'delete', '{"check": {"created_by": {"_eq": "X-Hasura-User-Email"}}}'),
    
    -- Attendees permissions
    ('public', 'attendees', 'admin', 'select', '{"filter": {}}'),
    ('public', 'attendees', 'admin', 'insert', '{"check": {}}'),
    ('public', 'attendees', 'admin', 'update', '{"check": {}}'),
    ('public', 'attendees', 'admin', 'delete', '{"check": {}}'),
    ('public', 'attendees', 'user', 'select', '{"filter": {"email": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'attendees', 'user', 'insert', '{"check": {"email": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'attendees', 'user', 'update', '{"check": {"email": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'attendees', 'user', 'delete', '{"check": {"email": {"_eq": "X-Hasura-User-Email"}}}'),
    
    -- Messages permissions
    ('public', 'messages', 'admin', 'select', '{"filter": {}}'),
    ('public', 'messages', 'admin', 'insert', '{"check": {}}'),
    ('public', 'messages', 'admin', 'update', '{"check": {}}'),
    ('public', 'messages', 'admin', 'delete', '{"check": {}}'),
    ('public', 'messages', 'user', 'select', '{"filter": {}}'),
    ('public', 'messages', 'user', 'insert', '{"check": {"created_by": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'messages', 'user', 'update', '{"check": {"created_by": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'messages', 'user', 'delete', '{"check": {"created_by": {"_eq": "X-Hasura-User-Email"}}}'),
    
    -- Reactions permissions
    ('public', 'reactions', 'admin', 'select', '{"filter": {}}'),
    ('public', 'reactions', 'admin', 'insert', '{"check": {}}'),
    ('public', 'reactions', 'admin', 'update', '{"check": {}}'),
    ('public', 'reactions', 'admin', 'delete', '{"check": {}}'),
    ('public', 'reactions', 'user', 'select', '{"filter": {}}'),
    ('public', 'reactions', 'user', 'insert', '{"check": {"user_email": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'reactions', 'user', 'update', '{"check": {"user_email": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'reactions', 'user', 'delete', '{"check": {"user_email": {"_eq": "X-Hasura-User-Email"}}}'),

    -- Invitations permissions
    ('public', 'invitations', 'admin', 'select', '{"filter": {}}'),
    ('public', 'invitations', 'admin', 'insert', '{"check": {}}'),
    ('public', 'invitations', 'admin', 'update', '{"check": {}}'),
    ('public', 'invitations', 'admin', 'delete', '{"check": {}}'),
    ('public', 'invitations', 'user', 'select', '{"filter": {"created_by": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'invitations', 'user', 'insert', '{"check": {"created_by": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'invitations', 'user', 'update', '{"check": {"created_by": {"_eq": "X-Hasura-User-Email"}}}'),
    ('public', 'invitations', 'user', 'delete', '{"check": {"created_by": {"_eq": "X-Hasura-User-Email"}}}')
ON CONFLICT (table_schema, table_name, role_name, perm_type) DO NOTHING;

-- Create relationships
ALTER TABLE attendees
ADD CONSTRAINT attendees_event_id_fkey
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE messages
ADD CONSTRAINT messages_event_id_fkey
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE messages
ADD CONSTRAINT messages_parent_id_fkey
FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE CASCADE;

ALTER TABLE reactions
ADD CONSTRAINT reactions_message_id_fkey
FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

ALTER TABLE invitations
ADD CONSTRAINT invitations_event_id_fkey
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_attendees_event_id ON attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_messages_event_id ON messages(event_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_email ON reactions(user_email);
CREATE INDEX IF NOT EXISTS idx_invitations_event_id ON invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at); 