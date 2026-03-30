interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative max-w-lg mx-auto mb-6">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-primary-300 "
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari nama, jabatan, atau ruang..."
        aria-label="Cari kontak berdasarkan nama, jabatan, atau ruang"
        className="w-full pl-12 pr-10 py-3.5 bg-surface-50 border-2 border-gray-100 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-400 :border-primary-500 focus:bg-white :bg-gray-800 focus:shadow-lg focus:shadow-primary-500/10 transition-all duration-300"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Hapus pencarian"
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 :text-gray-300 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
