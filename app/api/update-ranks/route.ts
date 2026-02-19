import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSummonerByTag, getRanksByPuuid, calculatePoints, getTopChampionsByQueue } from '@/lib/riot-api'

export async function POST(request: NextRequest) {
  try {
    // Get all players from database
    const { data: players, error: fetchError } = await supabaseAdmin
      .from('players')
      .select('*')

    if (fetchError || !players) {
      return NextResponse.json(
        { error: 'Failed to fetch players', details: fetchError?.message },
        { status: 500 }
      )
    }

    const results = []
    const errors = []

    for (const player of players) {
      try {
        // Buscar dados REAIS da Riot API (sem fallback para simulados)

        const account = await getSummonerByTag(player.nickname, player.tag, player.region || 'br1')
        const riotRanks = await getRanksByPuuid(account.puuid, player.region || 'br1')

        // Buscar os 3 campeões mais jogados POR FILA (SoloQ e Flex separados)
        // Usa cache compartilhado para evitar re-fetch de matches duplicados
        try {
          const matchCache = new Map<string, any>()

          // Limpar registros antigos
          await supabaseAdmin.from('champion_masteries')
            .delete()
            .eq('player_id', player.id)

          // SoloQ (queueId 420)
          const topSoloq = await getTopChampionsByQueue(account.puuid, player.region || 'br1', 420, 3, matchCache)
          for (let i = 0; i < topSoloq.length; i++) {
            await supabaseAdmin.from('champion_masteries').insert({
              player_id: player.id,
              queue_type: 'RANKED_SOLO_5x5',
              champion_id: topSoloq[i].championId,
              champion_level: null,
              champion_points: topSoloq[i].count,
              position: i + 1,
              last_update: new Date().toISOString(),
            })
          }

          // Flex (queueId 440)
          const topFlex = await getTopChampionsByQueue(account.puuid, player.region || 'br1', 440, 3, matchCache)
          for (let i = 0; i < topFlex.length; i++) {
            await supabaseAdmin.from('champion_masteries').insert({
              player_id: player.id,
              queue_type: 'RANKED_FLEX_SR',
              champion_id: topFlex[i].championId,
              champion_level: null,
              champion_points: topFlex[i].count,
              position: i + 1,
              last_update: new Date().toISOString(),
            })
          }

          console.log(`✅ Campeões salvos para ${player.nickname}: SoloQ=${topSoloq.length}, Flex=${topFlex.length}`)
        } catch (champError) {
          console.error(`Erro ao buscar campeões por fila para ${player.nickname}:`, champError)
          // Não é crítico, continua com o update de ranks
        }

        // Update or create rank entries
        for (const riotRank of riotRanks) {
          // Calcular pontos para ranking (tier + divisão)
          const rankingPoints = calculatePoints(riotRank.tier, riotRank.rank)
          // LP é armazenado separadamente
          const leaguePoints = riotRank.leaguePoints

          // Check if rank entry exists
          const { data: existingRank, error: checkError } = await supabaseAdmin
            .from('ranks')
            .select('id')
            .eq('player_id', player.id)
            .eq('queue_type', riotRank.queueType)
            .single()

          if (checkError && checkError.code !== 'PGRST116') {
            console.error(`❌ Erro ao verificar rank:`, checkError.message)
            throw checkError
          }

          if (existingRank) {
            // Update existing
            const { error: updateError } = await supabaseAdmin
              .from('ranks')
              .update({
                tier: riotRank.tier,
                rank: riotRank.rank,
                points: rankingPoints,
                league_points: leaguePoints,
                last_update: new Date().toISOString(),
              })
              .eq('id', existingRank.id)
            
            if (updateError) {
              console.error(`❌ Erro ao atualizar rank para ${player.nickname}#${player.tag}:`, updateError.message)
              throw updateError
            }
          } else {
            // Create new
            const { error: insertError } = await supabaseAdmin.from('ranks').insert({
              player_id: player.id,
              queue_type: riotRank.queueType,
              tier: riotRank.tier,
              rank: riotRank.rank,
              points: rankingPoints,
              league_points: leaguePoints,
              last_update: new Date().toISOString(),
            })
            
            if (insertError) {
              console.error(`❌ Erro ao inserir rank para ${player.nickname}#${player.tag}:`, insertError.message)
              throw insertError
            }
          }

          results.push({
            player: `${player.nickname}#${player.tag}`,
            queue: riotRank.queueType,
            tier: riotRank.tier,
            rank: riotRank.rank,
            leaguePoints: leaguePoints,
            status: 'updated',
          })
        }
      } catch (error: any) {
        errors.push({
          player: `${player.nickname}#${player.tag}`,
          error: error.message || String(error),
        })
      }

      // Delay entre players para evitar rate limit da Riot API (2.5s)
      await new Promise((resolve) => setTimeout(resolve, 2500))
    }

    return NextResponse.json({
      success: true,
      totalProcessed: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
