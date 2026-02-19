export type QueueType = 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' | 'RANKED_FLEX_TT'

export interface Player {
  id: string
  nickname: string
  tag: string
  region: string
  created_at: string
}

export interface Rank {
  id: string
  player_id: string
  queue_type: string
  tier: string
  rank: string
  points: number
  last_update: string
}

export interface PlayerWithRanks extends Player {
  ranks: Rank[]
}

export interface RankingEntry {
  position: number
  player: Player
  tier: string
  rank: string
  points: number
  division: number
  lastUpdate: string
}

export const TIER_POINTS: Record<string, number> = {
  IRON: 0,
  BRONZE: 200,
  SILVER: 400,
  GOLD: 700,
  PLATINUM: 1000,
  EMERALD: 1300,
  DIAMOND: 1600,
  MASTER: 2000,
  GRANDMASTER: 2500,
  CHALLENGER: 3000,
}

export const DIVISION_MULTIPLIER = 50

export const TIER_COLORS: Record<string, string> = {
  IRON: 'text-gray-400',
  BRONZE: 'text-orange-600',
  SILVER: 'text-gray-300',
  GOLD: 'text-yellow-400',
  PLATINUM: 'text-cyan-400',
  EMERALD: 'text-green-400',
  DIAMOND: 'text-blue-400',
  MASTER: 'text-purple-400',
  GRANDMASTER: 'text-red-500',
  CHALLENGER: 'text-pink-500',
}

export const TIER_BG_COLORS: Record<string, string> = {
  IRON: 'bg-gray-700 border-gray-600',
  BRONZE: 'bg-orange-900 border-orange-700',
  SILVER: 'bg-gray-600 border-gray-500',
  GOLD: 'bg-yellow-900 border-yellow-700',
  PLATINUM: 'bg-cyan-900 border-cyan-700',
  EMERALD: 'bg-green-900 border-green-700',
  DIAMOND: 'bg-blue-900 border-blue-700',
  MASTER: 'bg-purple-900 border-purple-700',
  GRANDMASTER: 'bg-red-900 border-red-700',
  CHALLENGER: 'bg-pink-900 border-pink-700',
}

export const MEDALS = ['🥇', '🥈', '🥉']
