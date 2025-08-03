-- Create newsletter_subscribers table for coming soon page
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_newsletter_subscribers_updated_at 
    BEFORE UPDATE ON newsletter_subscribers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow inserts from ANY user (including anonymous) for newsletter signup
CREATE POLICY "Allow newsletter signups" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own email (if authenticated)
CREATE POLICY "Users can view own email" ON newsletter_subscribers
    FOR SELECT USING (auth.uid()::text = id::text);

-- Allow service role to view all (for admin purposes)
CREATE POLICY "Service role can view all" ON newsletter_subscribers
    FOR ALL USING (auth.role() = 'service_role'); 