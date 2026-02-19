'use client'

import { TIER_COLORS, TIER_BG_COLORS, MEDALS } from '@/lib/types'
import { championIdToName } from '@/lib/championNames'

interface RankingEntry {
  position: number
  player: {
    id: string
    nickname: string
    tag: string
    region: string
  }
  tier: string
  rank: string
  leaguePoints: number
  lastUpdate: string
  soloqChampions?: { championId: number; position: number }[]
  flexChampions?: { championId: number; position: number }[]
}

interface RankingTableProps {
  data: RankingEntry[]
  isLoading: boolean
  activeTab: 'solo' | 'flex'
}

export default function RankingTable({ data, isLoading, activeTab }: RankingTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-4xl">⚙️</div>
          <p className="text-slate-400">Carregando ranking...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Nenhum jogador encontrado</p>
      </div>
    )
  }

  const lastPosition = data.length

  return (
    <div className="space-y-3">
      {data.map((entry) => {
        const medal = entry.position <= 3 ? MEDALS[entry.position - 1] : null
        const tierColor = TIER_COLORS[entry.tier] || 'text-slate-400'
        const tierBgColor = TIER_BG_COLORS[entry.tier] || 'bg-slate-700 border-slate-600'
        const isLastPlace = entry.position === lastPosition
        const isFirstPlace = entry.position === 1

        return (
          <div key={entry.player.id}>
            {/* Coroa e título para o primeiro lugar */}
            {isFirstPlace && (
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-3xl animate-bounce">👑</span>
                <span className="text-2xl font-bold text-yellow-400 animate-pulse">
                  O MENOS PIOR DO GRUPO
                </span>
                <span className="text-3xl animate-bounce">👑</span>
              </div>
            )}

            {/* Setas e título para o último lugar */}
            {isLastPlace && (
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-3xl animate-bounce">👇</span>
                <span className="text-2xl font-bold text-red-400 animate-pulse">
                  PIORZINHO DO GRUPO
                </span>
                <span className="text-3xl animate-bounce">👇</span>
              </div>
            )}

            <div
              className={`card p-6 flex items-center justify-between transition-colors ${
                isFirstPlace
                  ? 'border-yellow-500/50 bg-yellow-950/20 hover:border-yellow-500 animate-pulse'
                  : isLastPlace
                  ? 'border-red-500/50 bg-red-950/20 hover:border-red-500 animate-pulse'
                  : 'hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-center min-w-[60px]">
                  {isFirstPlace && <span className="text-4xl">👑</span>}
                  {isLastPlace && <span className="text-4xl">💀</span>}
                  {!isFirstPlace && medal && !isLastPlace && (
                    <span className="text-3xl">{medal}</span>
                  )}
                  {!medal && !isLastPlace && !isFirstPlace && (
                    <div className="text-xl font-bold text-slate-500">#{entry.position}</div>
                  )}
                  {medal && !isFirstPlace && !isLastPlace && (
                    <div className="text-xl font-bold text-accent">#{entry.position}</div>
                  )}
                  {isFirstPlace && (
                    <div className="text-xl font-bold text-yellow-400">#{entry.position}</div>
                  )}
                  {isLastPlace && (
                    <div className="text-xl font-bold text-red-400">#{entry.position}</div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white">
                      {entry.player.nickname}
                    </h3>
                    <span className="text-sm text-slate-400">#{entry.player.tag}</span>
                    <span className="gamer-badge text-xs">
                      {entry.player.region.toUpperCase()}
                    </span>
                  </div>
                  {/* Campeões mais jogados na fila ativa */}
                  {(() => {
                    const champions = activeTab === 'solo' ? entry.soloqChampions : entry.flexChampions
                    const label = activeTab === 'solo' ? 'SoloQ' : 'Flex'
                    const labelColor = activeTab === 'solo' ? 'text-cyan-400' : 'text-pink-400'
                    return (
                      <div className="flex items-center gap-1 mt-2">
                        <span className={`text-xs ${labelColor} font-medium`}>Top {label}:</span>
                        {champions && champions.length > 0 ? (
                          champions.map((champ) => {
                            const name = championIdToName(champ.championId)
                            return (
                              <img
                                key={champ.championId}
                                src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${name}.png`}
                                alt={name}
                                title={name}
                                className="w-7 h-7 rounded-full border border-slate-600 bg-slate-900"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                            )
                          })
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className={`gamer-badge ${tierBgColor} ${tierColor}`}>
                  {entry.tier} {entry.rank}
                </div>

                <div className="text-right min-w-[100px]">
                  <div className={`text-2xl font-bold ${isFirstPlace ? 'text-yellow-400' : isLastPlace ? 'text-red-400' : 'text-accent'}`}>
                    {entry.leaguePoints}
                  </div>
                  <div className="text-xs text-slate-500">LP</div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
