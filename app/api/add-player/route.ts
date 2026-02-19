import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nickname, tag, region = 'BR' } = body

    // Validação básica
    if (!nickname || !tag) {
      return NextResponse.json(
        { error: 'Nickname e tag são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato (nickname e tag não vazias)
    if (nickname.trim().length === 0 || tag.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nickname e tag não podem estar vazios' },
        { status: 400 }
      )
    }

    // Verificar se player já existe
    const { data: existingPlayer, error: checkError } = await supabaseAdmin
      .from('players')
      .select('id')
      .eq('nickname', nickname)
      .eq('tag', tag)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = not found, que é esperado
      console.error('Erro ao verificar player:', checkError.message)
      throw checkError
    }

    if (existingPlayer) {
      return NextResponse.json(
        { error: `Player ${nickname}#${tag} já existe` },
        { status: 409 }
      )
    }

    // Inserir novo player
    const { data: newPlayerArray, error: insertPlayerError } = await supabaseAdmin
      .from('players')
      .insert({
        nickname: nickname.trim(),
        tag: tag.trim(),
        region: region.toUpperCase(),
      })
      .select()

    if (insertPlayerError) {
      console.error('Erro ao inserir player:', insertPlayerError.message)
      throw insertPlayerError
    }

    const newPlayer = newPlayerArray?.[0]
    if (!newPlayer) {
      throw new Error('Falha ao criar player')
    }

    // Criar ranks iniciais (SOLO e FLEX)
    const { error: insertRanksError } = await supabaseAdmin
      .from('ranks')
      .insert([
        {
          player_id: newPlayer.id,
          queue_type: 'RANKED_SOLO_5x5',
          tier: 'IRON',
          rank: 'IV',
          points: 0,
          league_points: 0,
          last_update: new Date().toISOString(),
        },
        {
          player_id: newPlayer.id,
          queue_type: 'RANKED_FLEX_SR',
          tier: 'IRON',
          rank: 'IV',
          points: 0,
          league_points: 0,
          last_update: new Date().toISOString(),
        },
      ])

    if (insertRanksError) {
      console.error('Erro ao inserir ranks:', insertRanksError.message)
      throw insertRanksError
    }

    return NextResponse.json({
      success: true,
      message: `Player ${nickname}#${tag} adicionado com sucesso! Clique em "Atualizar" para sincronizar dados reais da Riot API.`,
      player: newPlayer,
    })
  } catch (error) {
    console.error('Erro ao adicionar player:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar player', details: String(error) },
      { status: 500 }
    )
  }
}

