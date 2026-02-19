-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname TEXT NOT NULL,
  tag TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(nickname, tag)
);

-- Create Ranks table
CREATE TABLE IF NOT EXISTS ranks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  queue_type TEXT NOT NULL CHECK (queue_type IN ('RANKED_SOLO_5x5', 'RANKED_FLEX_SR', 'RANKED_FLEX_TT')),
  tier TEXT NOT NULL DEFAULT 'IRON',
  rank TEXT NOT NULL DEFAULT 'IV',
  points INTEGER NOT NULL DEFAULT 0,
  league_points INTEGER NOT NULL DEFAULT 0,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_id, queue_type)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ranks_player_id ON ranks(player_id);
CREATE INDEX IF NOT EXISTS idx_ranks_queue_type ON ranks(queue_type);
CREATE INDEX IF NOT EXISTS idx_ranks_points ON ranks(points DESC);
CREATE INDEX IF NOT EXISTS idx_ranks_league_points ON ranks(league_points DESC);
CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at);

-- Insert initial players
INSERT INTO players (nickname, tag, region) VALUES
  ('errid', 'errid', 'BR'),
  ('sneagles', '000', 'BR'),
  ('Mega', 'sad', 'BR'),
  ('DIDs', 'br1', 'BR')
ON CONFLICT (nickname, tag) DO NOTHING;

-- Insert initial ranks for players
INSERT INTO ranks (player_id, queue_type, tier, rank, points, last_update)
SELECT
  p.id,
  q.queue,
  'GOLD',
  'II',
  750,
  now()
FROM players p
CROSS JOIN (VALUES ('RANKED_SOLO_5x5'), ('RANKED_FLEX_SR')) AS q(queue)
WHERE NOT EXISTS (
  SELECT 1 FROM ranks WHERE ranks.player_id = p.id AND ranks.queue_type = q.queue
);

-- Add Row Level Security (RLS) if desired
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;

-- Create public policies (allow read, restrict write)
CREATE POLICY "Players are publicly readable" ON players
  FOR SELECT
  USING (true);

CREATE POLICY "Ranks are publicly readable" ON ranks
  FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert players" ON players
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update players" ON players
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can insert ranks" ON ranks
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update ranks" ON ranks
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
