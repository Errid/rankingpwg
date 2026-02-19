import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const queueType = request.nextUrl.searchParams.get('queue') || 'RANKED_SOLO_5x5'

    // Fetch players with their ranks
    const { data: players, error: playersError } = await supabaseAdmin
      .from('players')
      .select(`*,
        ranks!inner (
          id,
          queue_type,
          tier,
          rank,
          league_points,
          last_update
        )
      `)
      .eq('ranks.queue_type', queueType)

    if (playersError) {
      return NextResponse.json(
        { error: 'Failed to fetch ranking', details: playersError.message },
        { status: 500 }
      )
    }

    // Buscar champion_masteries separadamente (sem depender do FK do PostgREST)
    const playerIds = (players || []).map((p: any) => p.id)
    let championMap: Record<string, any[]> = {}

    if (playerIds.length > 0) {
      const { data: masteries, error: masteriesError } = await supabaseAdmin
        .from('champion_masteries')
        .select('player_id, champion_id, champion_level, champion_points, position, queue_type')
        .in('player_id', playerIds)
        .order('position', { ascending: true })

      if (!masteriesError && masteries) {
        for (const m of masteries) {
          if (!championMap[m.player_id]) championMap[m.player_id] = []
          championMap[m.player_id].push(m)
        }
      }
    }

    // Sort properly in JavaScript
    const tierOrder: { [key: string]: number } = {
      'CHALLENGER': 10,
      'GRANDMASTER': 9,
      'MASTER': 8,
      'DIAMOND': 7,
      'EMERALD': 6,
      'PLATINUM': 5,
      'GOLD': 4,
      'SILVER': 3,
      'BRONZE': 2,
      'IRON': 1,
    }

    const rankOrder: { [key: string]: number } = {
      'I': 4,
      'II': 3,
      'III': 2,
      'IV': 1,
    }

    const sorted = (players || []).sort((a: any, b: any) => {
      const aRank = a.ranks[0]
      const bRank = b.ranks[0]

      // Compare by tier
      const tierDiff = (tierOrder[bRank.tier] || 0) - (tierOrder[aRank.tier] || 0)
      if (tierDiff !== 0) return tierDiff

      // Compare by rank
      const rankDiff = (rankOrder[bRank.rank] || 0) - (rankOrder[aRank.rank] || 0)
      if (rankDiff !== 0) return rankDiff

      // Compare by league points
      return (bRank.league_points || 0) - (aRank.league_points || 0)
    })

    const ranking = sorted.map((player: any, index: number) => {
      const rankData = player.ranks[0]
      const playerMasteries = championMap[player.id] || []
      // Separa os campeões por queue_type
      const soloqChampions = playerMasteries
        .filter((c: any) => c.queue_type === 'RANKED_SOLO_5x5')
        .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
        .map((c: any) => ({
          championId: c.champion_id,
          championLevel: c.champion_level,
          championPoints: c.champion_points,
          position: c.position,
        }))
      const flexChampions = playerMasteries
        .filter((c: any) => c.queue_type === 'RANKED_FLEX_SR')
        .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
        .map((c: any) => ({
          championId: c.champion_id,
          championLevel: c.champion_level,
          championPoints: c.champion_points,
          position: c.position,
        }))
      return {
        position: index + 1,
        player: {
          id: player.id,
          nickname: player.nickname,
          tag: player.tag,
          region: player.region,
        },
        tier: rankData.tier,
        rank: rankData.rank,
        leaguePoints: rankData.league_points,
        lastUpdate: rankData.last_update,
        soloqChampions,
        flexChampions,
      }
    })

    return NextResponse.json({
      success: true,
      queue: queueType,
      total: ranking.length,
      data: ranking,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
