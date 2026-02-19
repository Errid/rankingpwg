'use client'

interface HeaderProps {
  onRefresh: () => void
  isLoading: boolean
}

export default function Header({ onRefresh, isLoading }: HeaderProps) {
  return (
    <header className="bg-secondary border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">⚔️</span>
          <div>
            <h1 className="text-3xl font-bold text-white">PWG Ranking</h1>
            <p className="text-sm text-slate-400">League of Legends Friends ELO</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`btn-primary flex items-center gap-2 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>
    </header>
  )
}
