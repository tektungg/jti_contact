import type { TabKey } from '../types/contact'

interface Props {
  activeTab: TabKey
  counts: Record<TabKey, number>
  onTabChange: (tab: TabKey) => void
}

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'dosen', label: 'Dosen', emoji: '👨‍🏫' },
  { key: 'admin', label: 'Admin', emoji: '👩‍💼' },
  { key: 'pusat', label: 'Pusat', emoji: '🏢' },
]

export function TabNav({ activeTab, counts, onTabChange }: Props) {
  return (
    <div className="flex border-b border-gray-100" role="tablist" aria-label="Kategori kontak">
      {TABS.map(({ key, label, emoji }) => {
        const isActive = activeTab === key
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${key}`}
            id={`tab-${key}`}
            onClick={() => onTabChange(key)}
            className={`flex-1 px-4 py-4 text-sm md:text-base font-medium transition-all duration-200 border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
              isActive
                ? 'text-primary-500 border-primary-500 bg-primary-50/50'
                : 'text-gray-500 border-transparent hover:text-primary-500 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg" aria-hidden="true">{emoji}</span>
              <span>
                {label}{' '}
                <span className="hidden sm:inline">({counts[key]})</span>
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
