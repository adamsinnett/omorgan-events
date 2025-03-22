-- Create admin users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create index for email lookups
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Add updated_at trigger
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial admin user (password will be set through the application)
INSERT INTO admin_users (email, password_hash)
VALUES ('admin@example.com', 'placeholder_hash')
ON CONFLICT (email) DO NOTHING; 