-- Migration script to add new fields to requests table
-- Run this in your Neon database console

-- Add new columns if they don't exist
ALTER TABLE requests
ADD COLUMN IF NOT EXISTS project_type TEXT,
ADD COLUMN IF NOT EXISTS budget TEXT,
ADD COLUMN IF NOT EXISTS start_date TEXT;

-- Update any existing rows to have default values
UPDATE requests
SET
    project_type = 'N/A' WHERE project_type IS NULL,
    budget = 'N/A' WHERE budget IS NULL,
    start_date = 'N/A' WHERE start_date IS NULL;
