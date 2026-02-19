-- Create champion_masteries table (if not exists)
CREATE TABLE IF NOT EXISTS champion_masteries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  queue_type TEXT NOT NULL CHECK (queue_type IN ('RANKED_SOLO_5x5', 'RANKED_FLEX_SR')),
  champion_id INTEGER NOT NULL,
  champion_name TEXT,
  champion_level INTEGER,
  champion_points INTEGER,
  position INTEGER NOT NULL DEFAULT 1,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_id, queue_type, position)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_champion_masteries_player_id ON champion_masteries(player_id);
CREATE INDEX IF NOT EXISTS idx_champion_masteries_queue_type ON champion_masteries(queue_type);

-- Enable RLS
ALTER TABLE champion_masteries ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Champion masteries are publicly readable" ON champion_masteries
  FOR SELECT
  USING (true);

-- Allow service role to manage data
CREATE POLICY "Service role can manage champion masteries" ON champion_masteries
  FOR ALL
  USING (true)
  WITH CHECK (true);
