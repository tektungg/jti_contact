import { useReducer, useMemo, useCallback, useRef, useEffect } from 'react'
import type { ContactData, TabKey } from './types/contact'
import type { RawContactsJSON } from './types/contact'
import { mapContacts } from './utils/mapContacts'
import { useDebounce } from './hooks/useDebounce'
import { SearchBar } from './components/SearchBar'
import { TabNav } from './components/TabNav'
import { ContactCard } from './components/ContactCard'
import { Pagination } from './components/Pagination'
import { ErrorModal } from './components/ErrorModal'

const ITEMS_PER_PAGE = 9

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface AppState {
  contacts: ContactData
  activeTab: TabKey
  currentPage: Record<TabKey, number>
  searchInput: string
  modalMessage: string | null
  isLoading: boolean
}

type AppAction =
  | { type: 'LOAD_SUCCESS'; payload: ContactData }
  | { type: 'LOAD_ERROR' }
  | { type: 'SET_TAB'; payload: TabKey }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_PAGE'; tab: TabKey; page: number }
  | { type: 'SHOW_MODAL'; message: string }
  | { type: 'CLOSE_MODAL' }
  | { type: 'EXCEL_LOADED'; payload: ContactData }

const emptyContacts: ContactData = { dosen: [], admin: [], pusat: [] }
const defaultPage: Record<TabKey, number> = { dosen: 1, admin: 1, pusat: 1 }

const initialState: AppState = {
  contacts: emptyContacts,
  activeTab: 'dosen',
  currentPage: defaultPage,
  searchInput: '',
  modalMessage: null,
  isLoading: true,
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { ...state, contacts: action.payload, isLoading: false }

    case 'LOAD_ERROR':
      return { ...state, isLoading: false }

    case 'SET_TAB':
      return { ...state, activeTab: action.payload }

    case 'SET_SEARCH':
      return {
        ...state,
        searchInput: action.payload,
        currentPage: defaultPage,
      }

    case 'SET_PAGE':
      return {
        ...state,
        currentPage: { ...state.currentPage, [action.tab]: action.page },
      }

    case 'SHOW_MODAL':
      return { ...state, modalMessage: action.message }

    case 'CLOSE_MODAL':
      return { ...state, modalMessage: null }

    case 'EXCEL_LOADED':
      return {
        ...state,
        contacts: action.payload,
        currentPage: defaultPage,
        modalMessage:
          `Data berhasil dimuat!\n\nDosen: ${action.payload.dosen.length} kontak\nAdmin: ${action.payload.admin.length} kontak\nPusat: ${action.payload.pusat.length} kontak`,
      }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Default fallback data
// ---------------------------------------------------------------------------

function makeDefaultContacts(): ContactData {
  return {
    dosen: [
      { id: 'dosen_1', nama: 'Dr. Ahmad Rizki, M.Kom', noWA: '081234567890', jabatan: 'Dosen', ruang: '', keperluan: '' },
      { id: 'dosen_2', nama: 'Prof. Siti Nurhaliza, Ph.D', noWA: '081234567891', jabatan: 'Dosen', ruang: '', keperluan: '' },
    ],
    admin: [
      { id: 'admin_1', nama: 'Andi Setiawan', noWA: '081234567896', jabatan: 'Admin', ruang: '', keperluan: '' },
    ],
    pusat: [
      { id: 'pusat_1', nama: 'Pusat Akademik', noWA: '081234567800', jabatan: 'Layanan', ruang: '', keperluan: '' },
    ],
  }
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load contacts.json on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}contacts.json`)
        if (!res.ok) throw new Error('Network error')
        const json: RawContactsJSON = await res.json()

        const payload: ContactData = {
          dosen: mapContacts(
            (json.Dosen ?? []) as Record<string, unknown>[],
            'dosen',
          ),
          admin: mapContacts(
            (json.Admin ?? []) as Record<string, unknown>[],
            'admin',
          ),
          pusat: mapContacts(
            (json.Pusat ?? []) as Record<string, unknown>[],
            'pusat',
          ),
        }
        dispatch({ type: 'LOAD_SUCCESS', payload })
      } catch {
        dispatch({ type: 'LOAD_SUCCESS', payload: makeDefaultContacts() })
      }
    }
    load()
  }, [])

  // Debounce search for performance
  const debouncedSearch = useDebounce(state.searchInput, 300)

  // Derived: filtered + paginated contacts for the active tab
  const filteredContacts = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase()
    return keyword
      ? state.contacts[state.activeTab].filter((c) =>
          c.nama.toLowerCase().includes(keyword),
        )
      : state.contacts[state.activeTab]
  }, [state.contacts, state.activeTab, debouncedSearch])

  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE)
  const page = state.currentPage[state.activeTab]
  const paginatedContacts = filteredContacts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  const counts: Record<TabKey, number> = useMemo(
    () => ({
      dosen: state.contacts.dosen.length,
      admin: state.contacts.admin.length,
      pusat: state.contacts.pusat.length,
    }),
    [state.contacts],
  )

  // Excel upload handler
  const handleExcelUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const XLSX = await import('xlsx')
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })

        const result: ContactData = { dosen: [], admin: [], pusat: [] }

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[]
          if (rows.length === 0) return

          const lower = sheetName.toLowerCase()
          let category: TabKey = 'dosen'
          if (lower.includes('admin') || lower.includes('staff')) {
            category = 'admin'
          } else if (
            lower.includes('pusat') ||
            lower.includes('center') ||
            lower.includes('layanan') ||
            lower.includes('service')
          ) {
            category = 'pusat'
          }

          const mapped = mapContacts(rows, category, result[category].length)
          result[category] = [...result[category], ...mapped]
        })

        dispatch({ type: 'EXCEL_LOADED', payload: result })
      } catch {
        dispatch({ type: 'SHOW_MODAL', message: 'Gagal memuat file Excel. Pastikan format file benar.' })
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [],
  )

  return (
    <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-primary-500 text-white py-8 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto text-center">
          <img
            src={`${import.meta.env.BASE_URL}icon_jti_polinema.png`}
            alt="Logo Jurusan Teknologi Informasi Polinema"
            width={285}
            height={133}
            className="mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Direktori Kontak</h1>
          <p className="text-purple-200 text-lg mb-2">
            Jurusan Teknologi Informasi - Polinema
          </p>
          <p className="text-purple-300/80 text-sm max-w-xl mx-auto">
            Daftar kontak dosen, admin, dan pusat layanan. Data berdasarkan Excel
            terbaru, namun mungkin ada nomor yang sudah tidak aktif.
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8 -mt-4">
        {/* Search & Contribution Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-primary-500/5 p-6 mb-6">
          <SearchBar
            value={state.searchInput}
            onChange={(v) => dispatch({ type: 'SET_SEARCH', payload: v })}
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://github.com/tektungg/jti_contact?tab=contributing-ov-file"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-primary-500 border-2 border-primary-500/20 rounded-xl font-medium hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Panduan Kontribusi - Update Kontak
            </a>

            <label
              htmlFor="excel-input"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-primary-500 border-2 border-primary-500/20 rounded-xl font-medium hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Excel
              <input
                ref={fileInputRef}
                id="excel-input"
                type="file"
                accept=".xlsx,.xls"
                className="sr-only"
                onChange={handleExcelUpload}
                aria-label="Upload file Excel untuk mengganti data kontak"
              />
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl shadow-primary-500/5 overflow-hidden">
          <TabNav
            activeTab={state.activeTab}
            counts={counts}
            onTabChange={(tab) => dispatch({ type: 'SET_TAB', payload: tab })}
          />

          <div className="p-4 md:p-6">
            {state.isLoading ? (
              <div className="text-center py-12 text-gray-400">
                <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-3" aria-label="Memuat data..." role="status" />
                <p>Memuat data kontak...</p>
              </div>
            ) : paginatedContacts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 fade-in">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">Tidak ada kontak ditemukan</p>
                <p className="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian</p>
              </div>
            ) : (
              <div
                id={`tabpanel-${state.activeTab}`}
                role="tabpanel"
                aria-labelledby={`tab-${state.activeTab}`}
                className="fade-in"
              >
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedContacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                </div>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={filteredContacts.length}
                  onPageChange={(p) =>
                    dispatch({ type: 'SET_PAGE', tab: state.activeTab, page: p })
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-gray-500 text-sm">
            <svg className="w-4 h-4 text-whatsapp" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Klik tombol "Hubungi" untuk membuka chat WhatsApp
          </div>
          <p className="mt-4 text-xs text-gray-400">
            &copy; 2024 JTI Polinema. Dibuat dengan ❤️ untuk kemudahan komunikasi.
          </p>
        </footer>
      </main>

      {/* Modal (replaces alert()) */}
      <ErrorModal
        message={state.modalMessage}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
      />
    </div>
  )
}
