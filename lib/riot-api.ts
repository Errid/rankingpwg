import axios from 'axios'

const RIOT_API_KEY = process.env.RIOT_API_KEY

// Mapping de regiões do jogo para regional routing
const REGION_MAPPING: Record<string, string> = {
  br1: 'americas',
  br: 'americas',
  la1: 'americas',
  la2: 'americas',
  na1: 'americas',
  euw1: 'europe',
  eun1: 'europe',
  kr: 'asia',
  jp1: 'asia',
}

export interface RiotAccountData {
  puuid: string
  gameName: string
  tagLine: string
}

export interface RiotSummonerData {
  id: string
  accountId: string
  puuid: string
  name: string
  profileIconId: number
  revisionDate: number
  summonerLevel: number
}

export interface RiotRankData {
  leagueId: string
  queueType: string
  tier: string
  rank: string
  puuid: string
  leaguePoints: number
  wins: number
  losses: number
  veteran: boolean
}

export interface RiotChampionMastery {
  championId: number
  championLevel: number
  championPoints: number
  lastPlayTime: number
  chestGranted: boolean
  tokensEarned: number
}

export async function getAccountByTag(
  gameName: string,
  tagLine: string,
  region: string = 'br1'
): Promise<RiotAccountData> {
  try {
    const regionalRoute = REGION_MAPPING[region.toLowerCase()] || 'americas'
    const response = await axios.get(
      `https://${regionalRoute}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    )
    return response.data
  } catch (error: any) {
    const message = error.response?.status === 404
      ? `Invocador não encontrado: ${gameName}#${tagLine}`
      : `Failed to get account data: ${error.message}`
    throw new Error(message)
  }
}

export async function getSummonerByTag(
  gameName: string,
  tagLine: string,
  region: string = 'br1'
): Promise<RiotAccountData> {
  try {
    const account = await getAccountByTag(gameName, tagLine, region)
    return account
  } catch (error) {
    throw new Error(`Failed to get account data: ${error}`)
  }
}

export async function getRanksByPuuid(
  puuid: string,
  region: string = 'br1'
): Promise<RiotRankData[]> {
  try {
    const platformRoute = region.toLowerCase() === 'br' ? 'br1' : region.toLowerCase()
    const url = `https://${platformRoute}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`

    const response = await axios.get(url, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    })

    return response.data
  } catch (error) {
    throw new Error(`Failed to get rank data: ${error}`)
  }
}

export async function getRanksBySummonerId(
  summonerId: string,
  region: string = 'br1'
): Promise<RiotRankData[]> {
  throw new Error('Use getRanksByPuuid instead')
}

export const getRanks = getRanksByPuuid

export async function getPlayerRanks(
  gameName: string,
  tagLine: string,
  region: string = 'br1'
): Promise<RiotRankData[]> {
  try {
    const account = await getSummonerByTag(gameName, tagLine, region)
    const ranks = await getRanksByPuuid(account.puuid, region)
    return ranks
  } catch (error) {
    throw new Error(`Failed to get player ranks: ${error}`)
  }
}

// Busca os campeões mais jogados em uma fila específica (SoloQ ou Flex) usando o histórico de partidas
// queueId: 420 (SoloQ), 440 (Flex)
// matchCache: cache compartilhado entre chamadas para evitar re-fetch de matches já buscados
export async function getTopChampionsByQueue(
  puuid: string,
  region: string = 'br1',
  queueId: number,
  topN: number = 3,
  matchCache?: Map<string, any>
): Promise<{ championId: number; count: number }[]> {
  const regionalRoute = REGION_MAPPING[region.toLowerCase()] || 'americas'
  const cache = matchCache || new Map<string, any>()
  // Busca as últimas 10 partidas da fila
  const matchIdsUrl = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=${queueId}&count=10`
  try {
    const matchIdsRes = await axios.get(matchIdsUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    })
    const matchIds: string[] = matchIdsRes.data
    const championCounts: Record<number, number> = {}

    for (const matchId of matchIds) {
      try {
        let matchData: any
        // Usa cache se já buscou esse match antes
        if (cache.has(matchId)) {
          matchData = cache.get(matchId)
        } else {
          const matchUrl = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`
          const matchRes = await axios.get(matchUrl, {
            headers: { 'X-Riot-Token': RIOT_API_KEY },
          })
          matchData = matchRes.data
          cache.set(matchId, matchData)
          // Delay de 1.3s entre requests para respeitar rate limit (100 req/2min)
          await new Promise((resolve) => setTimeout(resolve, 1300))
        }
        const participant = matchData.info.participants.find((p: any) => p.puuid === puuid)
        if (participant) {
          const champId = participant.championId
          championCounts[champId] = (championCounts[champId] || 0) + 1
        }
      } catch (matchError: any) {
        if (matchError?.response?.status === 429) {
          // Rate limited - espera 10s e tenta de novo
          console.warn(`Rate limited no match ${matchId}, aguardando 10s...`)
          await new Promise((resolve) => setTimeout(resolve, 10000))
          try {
            const matchUrl = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`
            const matchRes = await axios.get(matchUrl, { headers: { 'X-Riot-Token': RIOT_API_KEY } })
            cache.set(matchId, matchRes.data)
            const participant = matchRes.data.info.participants.find((p: any) => p.puuid === puuid)
            if (participant) {
              championCounts[participant.championId] = (championCounts[participant.championId] || 0) + 1
            }
          } catch { /* ignora se falhar de novo */ }
        } else {
          console.warn(`Falha ao buscar match ${matchId}, pulando...`)
        }
        continue
      }
    }

    const sorted = Object.entries(championCounts)
      .map(([championId, count]) => ({ championId: Number(championId), count }))
      .sort((a, b) => b.count - a.count)
    return sorted.slice(0, topN)
  } catch (error) {
    console.error(`Failed to get top champions by queue: ${error}`)
    return [] // Retorna vazio ao invés de dar throw (não é crítico)
  }
}

// Retorna os campeões mais jogados (top N) por puuid
export async function getTopChampionMasteries(
  puuid: string,
  region: string = 'br1',
  topN: number = 3
): Promise<RiotChampionMastery[]> {
  const platformRoute = region.toLowerCase() === 'br' ? 'br1' : region.toLowerCase()
  const url = `https://${platformRoute}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`
  try {
    const response = await axios.get(url, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    })
    return response.data.slice(0, topN)
  } catch (error) {
    throw new Error(`Failed to get champion masteries: ${error}`)
  }
}

export function calculatePoints(tier: string, rank: string): number {
  const tierPoints = getTierPoints(tier)
  const divisionMultiplier = getDivisionMultiplier(rank)
  return tierPoints + divisionMultiplier
}

function getTierPoints(tier: string): number {
  const tierMap: Record<string, number> = {
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
  return tierMap[tier] || 0
}

function getDivisionMultiplier(rank: string): number {
  const divisionMap: Record<string, number> = {
    IV: 0,
    III: 1,
    II: 2,
    I: 3,
  }
  return (divisionMap[rank] || 0) * 50
}
