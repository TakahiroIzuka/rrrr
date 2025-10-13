-- Create services table
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL
);

-- Add index on code for faster lookups
CREATE INDEX idx_services_code ON services(code);
