import { useRef, useEffect, useState } from "react";
import type { TabKey } from "../types/contact";

interface Props {
  activeTab: TabKey;
  counts: Record<TabKey, number>;
  onTabChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: JSX.Element }[] = [
  {
    key: "dosen",
    label: "Dosen",
    icon: (
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
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    key: "admin",
    label: "Admin",
    icon: (
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
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    key: "pusat",
    label: "Pusat",
    icon: (
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
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    key: "favorit",
    label: "Favorit",
    icon: (
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
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
];

export function TabNav({ activeTab, counts, onTabChange }: Props) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const activeTabs = TABS.filter(
    (tab) => tab.key !== "favorit" || counts.favorit > 0,
  );

  useEffect(() => {
    const idx = activeTabs.findIndex((t) => t.key === activeTab);
    const el = tabRefs.current[idx];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab, activeTabs.length]);

  return (
    <div
      className="px-2 pt-2 hidden md:block"
      role="tablist"
      aria-label="Kategori kontak"
    >
      <div className="relative flex bg-gray-100/80 rounded-xl p-1 gap-1">
        {/* Sliding indicator */}
        <div
          className="tab-indicator absolute h-[calc(100%-0.5rem)] rounded-lg bg-white shadow-md z-0 transition-all duration-300 ease-in-out"
          style={{
            left: indicator.left,
            width: indicator.width,
            top: "0.25rem",
          }}
        />

        {activeTabs.map(({ key, label, icon }, idx) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${key}`}
              id={`tab-${key}`}
              onClick={() => onTabChange(key)}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                isActive
                  ? "text-primary-600 "
                  : "text-gray-500 hover:text-gray-700 :text-gray-300"
              }`}
            >
              <span
                className={`transition-colors ${isActive ? "text-primary-500 " : "text-gray-400 "}`}
              >
                {icon}
              </span>
              <span>{label}</span>
              <span
                className={`hidden sm:inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-semibold rounded-full transition-colors ${
                  isActive
                    ? "bg-primary-100 text-primary-700 "
                    : "bg-gray-200/80 text-gray-500 "
                }`}
              >
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
