const ITEMS_PER_PAGE = 9

interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, totalItems, onPageChange }: Props) {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems)

  const pageNumbers: (number | '...')[] = []
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i)
  } else if (currentPage <= 3) {
    pageNumbers.push(1, 2, 3, 4, '...', totalPages)
  } else if (currentPage >= totalPages - 2) {
    pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
  } else {
    pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
  }

  const btnBase =
    'w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-200'
  const btnInactive =
    'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
  const btnActive =
    'bg-primary-500 border-primary-500 text-white font-medium'
  const btnDisabled =
    'border-gray-200 text-gray-300 cursor-not-allowed'

  return (
    <nav
      className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      aria-label="Navigasi halaman"
    >
      <div className="text-sm text-gray-500">
        Menampilkan{' '}
        <span className="font-medium text-gray-700">{startItem}–{endItem}</span>{' '}
        dari{' '}
        <span className="font-medium text-gray-700">{totalItems}</span> kontak
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
          className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pageNumbers.map((num, idx) =>
          num === '...' ? (
            <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              aria-label={`Halaman ${num}`}
              aria-current={num === currentPage ? 'page' : undefined}
              className={`${btnBase} ${num === currentPage ? btnActive : btnInactive}`}
            >
              {num}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Halaman berikutnya"
          className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
