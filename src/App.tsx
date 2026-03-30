import {
  useReducer,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";
import type { Contact, ContactData, TabKey } from "./types/contact";
import type { RawContactsJSON } from "./types/contact";
import { mapContacts } from "./utils/mapContacts";
import { useDebounce } from "./hooks/useDebounce";
import { useFavorites } from "./hooks/useFavorites";
import { SearchBar } from "./components/SearchBar";
import { TabNav } from "./components/TabNav";
import { ContactCard } from "./components/ContactCard";
import { Pagination } from "./components/Pagination";
import { SkeletonGrid } from "./components/SkeletonCard";
import { ToastContainer, showToast } from "./components/Toast";
import { ContactDrawer } from "./components/ContactDrawer";
import { BackToTop } from "./components/BackToTop";
import { BottomNav } from "./components/BottomNav";

const ITEMS_PER_PAGE = 9;

type SortMode = "default" | "az" | "za";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface AppState {
  contacts: ContactData;
  activeTab: TabKey;
  currentPage: Record<TabKey, number>;
  searchInput: string;
  isLoading: boolean;
  sortMode: SortMode;
}

type AppAction =
  | { type: "LOAD_SUCCESS"; payload: ContactData }
  | { type: "LOAD_ERROR" }
  | { type: "SET_TAB"; payload: TabKey }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_PAGE"; tab: TabKey; page: number }
  | { type: "SET_SORT"; payload: SortMode }
  | { type: "EXCEL_LOADED"; payload: ContactData };

const emptyContacts: ContactData = { dosen: [], admin: [], pusat: [] };
const defaultPage: Record<TabKey, number> = {
  dosen: 1,
  admin: 1,
  pusat: 1,
  favorit: 1,
};

const initialState: AppState = {
  contacts: emptyContacts,
  activeTab: "dosen",
  currentPage: defaultPage,
  searchInput: "",
  isLoading: true,
  sortMode: "default",
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return { ...state, contacts: action.payload, isLoading: false };

    case "LOAD_ERROR":
      return { ...state, isLoading: false };

    case "SET_TAB":
      return { ...state, activeTab: action.payload };

    case "SET_SEARCH":
      return {
        ...state,
        searchInput: action.payload,
        currentPage: defaultPage,
      };

    case "SET_PAGE":
      return {
        ...state,
        currentPage: { ...state.currentPage, [action.tab]: action.page },
      };

    case "SET_SORT":
      return { ...state, sortMode: action.payload, currentPage: defaultPage };

    case "EXCEL_LOADED":
      return {
        ...state,
        contacts: action.payload,
        currentPage: defaultPage,
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Default fallback data
// ---------------------------------------------------------------------------

function makeDefaultContacts(): ContactData {
  return {
    dosen: [
      {
        id: "dosen_1",
        nama: "Dr. Ahmad Rizki, M.Kom",
        noWA: "081234567890",
        jabatan: "Dosen",
        ruang: "",
        keperluan: "",
      },
      {
        id: "dosen_2",
        nama: "Prof. Siti Nurhaliza, Ph.D",
        noWA: "081234567891",
        jabatan: "Dosen",
        ruang: "",
        keperluan: "",
      },
    ],
    admin: [
      {
        id: "admin_1",
        nama: "Andi Setiawan",
        noWA: "081234567896",
        jabatan: "Admin",
        ruang: "",
        keperluan: "",
      },
    ],
    pusat: [
      {
        id: "pusat_1",
        nama: "Pusat Akademik",
        noWA: "081234567800",
        jabatan: "Layanan",
        ruang: "",
        keperluan: "",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

function sortContacts(contacts: Contact[], mode: SortMode): Contact[] {
  if (mode === "default") return contacts;
  return [...contacts].sort((a, b) => {
    const cmp = a.nama.localeCompare(b.nama, "id");
    return mode === "az" ? cmp : -cmp;
  });
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();
  const [drawerContact, setDrawerContact] = useState<Contact | null>(null);

  // Load contacts.json on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}contacts.json`);
        if (!res.ok) throw new Error("Network error");
        const json: RawContactsJSON = await res.json();

        const payload: ContactData = {
          dosen: mapContacts(
            (json.Dosen ?? []) as Record<string, unknown>[],
            "dosen",
          ),
          admin: mapContacts(
            (json.Admin ?? []) as Record<string, unknown>[],
            "admin",
          ),
          pusat: mapContacts(
            (json.Pusat ?? []) as Record<string, unknown>[],
            "pusat",
          ),
        };
        dispatch({ type: "LOAD_SUCCESS", payload });
      } catch {
        dispatch({ type: "LOAD_SUCCESS", payload: makeDefaultContacts() });
      }
    }
    load();
  }, []);

  // Redirect from favorit tab if no favorites left
  useEffect(() => {
    if (state.activeTab === "favorit" && favorites.size === 0) {
      dispatch({ type: "SET_TAB", payload: "dosen" });
    }
  }, [state.activeTab, favorites.size]);

  // Debounce search
  const debouncedSearch = useDebounce(state.searchInput, 300);

  // Multi-field search + sort
  const filteredContacts = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase();
    let list: Contact[] = [];
    if (state.activeTab === "favorit") {
      const allContacts = [
        ...state.contacts.dosen,
        ...state.contacts.admin,
        ...state.contacts.pusat,
      ];
      list = allContacts.filter((c) => favorites.has(c.id));
    } else {
      list = state.contacts[state.activeTab];
    }

    const filtered = keyword
      ? list.filter(
          (c) =>
            c.nama.toLowerCase().includes(keyword) ||
            c.jabatan.toLowerCase().includes(keyword) ||
            c.ruang.toLowerCase().includes(keyword),
        )
      : list;
    return sortContacts(filtered, state.sortMode);
  }, [
    state.contacts,
    state.activeTab,
    debouncedSearch,
    state.sortMode,
    favorites,
  ]);

  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);
  const page = state.currentPage[state.activeTab];
  const paginatedContacts = filteredContacts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const counts: Record<TabKey, number> = useMemo(() => {
    const allContacts = [
      ...state.contacts.dosen,
      ...state.contacts.admin,
      ...state.contacts.pusat,
    ];
    const favoritCount = allContacts.filter((c) => favorites.has(c.id)).length;

    return {
      dosen: state.contacts.dosen.length,
      admin: state.contacts.admin.length,
      pusat: state.contacts.pusat.length,
      favorit: favoritCount,
    };
  }, [state.contacts, favorites]);

  const totalContacts = counts.dosen + counts.admin + counts.pusat;

  // Scroll to grid top on page change
  const handlePageChange = useCallback(
    (p: number) => {
      dispatch({ type: "SET_PAGE", tab: state.activeTab, page: p });
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [state.activeTab],
  );

  // Excel upload handler
  const handleExcelUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

        const result: ContactData = { dosen: [], admin: [], pusat: [] };

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet) as Record<
            string,
            unknown
          >[];
          if (rows.length === 0) return;

          const lower = sheetName.toLowerCase();
          let category: TabKey = "dosen";
          if (lower.includes("admin") || lower.includes("staff")) {
            category = "admin";
          } else if (
            lower.includes("pusat") ||
            lower.includes("center") ||
            lower.includes("layanan") ||
            lower.includes("service")
          ) {
            category = "pusat";
          }

          const mapped = mapContacts(rows, category, result[category].length);
          result[category] = [...result[category], ...mapped];
        });

        dispatch({ type: "EXCEL_LOADED", payload: result });
        showToast(
          `Data dimuat! Dosen: ${result.dosen.length}, Admin: ${result.admin.length}, Pusat: ${result.pusat.length}`,
          "success",
        );
      } catch {
        showToast(
          "Gagal memuat file Excel. Pastikan format file benar.",
          "error",
        );
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [],
  );

  const SORT_OPTIONS: { value: SortMode; label: string }[] = [
    { value: "default", label: "Default" },
    { value: "az", label: "A → Z" },
    { value: "za", label: "Z → A" },
  ];

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-slate-50 via-purple-50/50 to-blue-50/30 pb-16 md:pb-0">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 text-white py-10 px-4">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary-400/15 rounded-full blur-2xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          <img
            src={`${import.meta.env.BASE_URL}icon_jti_polinema.png`}
            alt="Logo Jurusan Teknologi Informasi Polinema"
            width={285}
            height={133}
            className="mx-auto mb-5 drop-shadow-2xl"
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
            Direktori Kontak
          </h1>
          <p className="text-primary-200 text-lg mb-3">
            Jurusan Teknologi Informasi - Polinema
          </p>
          {!state.isLoading && totalContacts > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-primary-100">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {totalContacts} kontak tersedia
            </div>
          )}
          <p className="text-primary-300/70 text-sm max-w-xl mx-auto mt-3">
            Daftar kontak dosen, admin, dan pusat layanan. Data berdasarkan
            Excel terbaru, namun mungkin ada nomor yang sudah tidak aktif.
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8 -mt-5">
        {/* Search & Contribution Card */}
        <div className="glass-strong rounded-2xl shadow-xl shadow-black/5 border border-white/60 p-6 mb-6">
          <SearchBar
            value={state.searchInput}
            onChange={(v) => dispatch({ type: "SET_SEARCH", payload: v })}
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://github.com/tektungg/jti_contact?tab=contributing-ov-file"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-primary-600 border-2 border-primary-200/60 rounded-xl font-medium hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Panduan Kontribusi
            </a>

            <label
              htmlFor="excel-input"
              className="hidden items-center gap-2 px-5 py-2.5 text-primary-600 border-2 border-primary-200/60 rounded-xl font-medium hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200 cursor-pointer"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
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

        {/* Tabs + Content */}
        <div
          ref={gridRef}
          className="glass-strong rounded-2xl shadow-xl shadow-black/5 border border-white/60 overflow-hidden"
        >
          <TabNav
            activeTab={state.activeTab}
            counts={counts}
            onTabChange={(tab) => dispatch({ type: "SET_TAB", payload: tab })}
          />

          <div className="p-4 md:p-6">
            {/* Sort bar */}
            {!state.isLoading && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {filteredContacts.length} kontak
                  {debouncedSearch && (
                    <span>
                      {" "}
                      untuk "
                      <span className="font-medium text-gray-700">
                        {debouncedSearch}
                      </span>
                      "
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  <select
                    value={state.sortMode}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_SORT",
                        payload: e.target.value as SortMode,
                      })
                    }
                    aria-label="Urutkan kontak"
                    className="text-sm bg-transparent text-gray-600 border-none focus:outline-none focus:ring-0 cursor-pointer pr-6"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {state.isLoading ? (
              <SkeletonGrid />
            ) : paginatedContacts.length === 0 ? (
              <div className="text-center py-16 fade-in">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-600">
                  Tidak ada kontak ditemukan
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Coba ubah kata kunci pencarian
                </p>
              </div>
            ) : (
              <div
                id={`tabpanel-${state.activeTab}`}
                role="tabpanel"
                aria-labelledby={`tab-${state.activeTab}`}
              >
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedContacts.map((contact, i) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      index={i}
                      isFavorite={isFavorite(contact.id)}
                      onToggleFavorite={toggleFavorite}
                      onOpenDrawer={setDrawerContact}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={filteredContacts.length}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/60 shadow-sm text-gray-500 text-sm">
            <svg
              className="w-4 h-4 text-whatsapp"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Klik tombol "Hubungi" untuk membuka chat WhatsApp
          </div>
          <p className="mt-4 text-xs text-gray-400">
            &copy; 2024 JTI Polinema. Dibuat dengan ❤️ untuk kemudahan
            komunikasi.
          </p>
        </footer>
      </main>

      {/* Contact Detail Drawer */}
      <ContactDrawer
        contact={drawerContact}
        isFavorite={drawerContact ? isFavorite(drawerContact.id) : false}
        onClose={() => setDrawerContact(null)}
        onToggleFavorite={toggleFavorite}
      />

      {/* Toast notifications */}
      <ToastContainer />

      {/* Back to top */}
      <BackToTop />

      {/* Mobile bottom nav */}
      <BottomNav
        activeTab={state.activeTab}
        counts={counts}
        onTabChange={(tab) => dispatch({ type: "SET_TAB", payload: tab })}
      />
    </div>
  );
}
