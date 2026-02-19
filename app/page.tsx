'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import TabSelector from '@/components/TabSelector'
import RankingTable from '@/components/RankingTable'
import AddPlayerForm from '@/components/AddPlayerForm'

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

export default function Home() {
  const [activeTab, setActiveTab] = useState<'solo' | 'flex'>('solo')
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const queueMap = {
    solo: 'RANKED_SOLO_5x5',
    flex: 'RANKED_FLEX_SR',
  }

  const fetchRanking = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const queue = queueMap[activeTab]
      const response = await fetch(`/api/ranking?queue=${queue}`)
      const data = await response.json()

      if (data.success) {
        setRanking(data.data)
      } else {
        setError(data.error || 'Erro ao carregar ranking')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/update-ranks', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        // Após atualizar, busca o ranking novamente
        await fetchRanking()
      } else {
        setError('Erro ao atualizar ranking')
      }
    } catch (err) {
      setError('Erro ao atualizar ranking')
      console.error(err)
    }
  }

  useEffect(() => {
    fetchRanking()
  }, [activeTab])

  return (
    <div className="min-h-screen bg-gamer-gradient">
      <Header onRefresh={handleRefresh} isLoading={isLoading} />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Ranking</h2>
            <TabSelector activeTab={activeTab} onChange={setActiveTab} />
          </div>
          <AddPlayerForm onPlayerAdded={fetchRanking} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <RankingTable data={ranking} isLoading={isLoading} activeTab={activeTab} />

        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-sm text-slate-500 text-center">
            Última atualização: {ranking[0]?.lastUpdate
              ? new Date(ranking[0].lastUpdate).toLocaleString('pt-BR')
              : 'Nunca'
            }
          </p>
        </div>
      </main>
    </div>
  )
}
