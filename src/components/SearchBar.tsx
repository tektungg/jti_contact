interface Props {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative max-w-md mx-auto mb-6">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari kontak berdasarkan nama..."
        aria-label="Cari kontak berdasarkan nama"
        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all duration-200"
      />
    </div>
  )
}
