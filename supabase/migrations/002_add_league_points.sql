-- Add league_points column to ranks table to store LP separately
ALTER TABLE ranks ADD COLUMN IF NOT EXISTS league_points INTEGER NOT NULL DEFAULT 0;

-- Create separate index for league_points
CREATE INDEX IF NOT EXISTS idx_ranks_league_points ON ranks(league_points DESC);

-- Create composite index for proper ranking order (tier → rank → league_points)
CREATE INDEX IF NOT EXISTS idx_ranks_tier_rank_order ON ranks(
  tier,
  CASE 
    WHEN rank = 'I' THEN 1
    WHEN rank = 'II' THEN 2
    WHEN rank = 'III' THEN 3
    WHEN rank = 'IV' THEN 4
    ELSE 5
  END,
  league_points DESC
);
