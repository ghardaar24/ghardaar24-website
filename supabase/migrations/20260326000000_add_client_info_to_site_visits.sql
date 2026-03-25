-- Add client name and mobile number to site_visits
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS client_mobile TEXT;

-- Create index on client_mobile for quick lookups of repeat visitors
CREATE INDEX IF NOT EXISTS idx_site_visits_client_mobile ON site_visits(client_mobile) WHERE client_mobile IS NOT NULL;
