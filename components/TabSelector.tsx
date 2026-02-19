'use client'

interface TabSelectorProps {
  activeTab: 'solo' | 'flex'
  onChange: (tab: 'solo' | 'flex') => void
}

export default function TabSelector({ activeTab, onChange }: TabSelectorProps) {
  return (
    <div className="flex gap-2 mb-8">
      <button
        onClick={() => onChange('solo')}
        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
          activeTab === 'solo'
            ? 'bg-accent text-white shadow-lg shadow-blue-500/50'
            : 'bg-secondary text-slate-400 border border-slate-700 hover:border-slate-600'
        }`}
      >
        Solo/Duo
      </button>
      <button
        onClick={() => onChange('flex')}
        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
          activeTab === 'flex'
            ? 'bg-accent text-white shadow-lg shadow-blue-500/50'
            : 'bg-secondary text-slate-400 border border-slate-700 hover:border-slate-600'
        }`}
      >
        Flex
      </button>
    </div>
  )
}
