-- Add premium purchase fields for Keşif features
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS keşif_lifetime BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS keşif_uses JSONB DEFAULT '{}'::jsonb;

-- Add single-use purchases for features
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS sinastry_single_use BOOLEAN DEFAULT false;

-- Track individual feature uses
-- JSON structure: {"career": 1, "relationship": 1, "city": 1, "karmic": 1, "lineage": 1, "monthly_1": 1, "monthly_6": 1, "monthly_12": 1, "shadow": 1, "light": 1}
