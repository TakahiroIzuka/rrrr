-- Add prefecture_id column to clinics table
ALTER TABLE clinics
ADD COLUMN prefecture_id INTEGER;

-- Add foreign key constraint to prefectures table
ALTER TABLE clinics
ADD CONSTRAINT fk_clinics_prefecture
FOREIGN KEY (prefecture_id)
REFERENCES prefectures(id)
ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_clinics_prefecture_id ON clinics(prefecture_id);
