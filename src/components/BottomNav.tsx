import type { TabKey } from "../types/contact";

interface Props {
  activeTab: TabKey;
  counts: Record<TabKey, number>;
  onTabChange: (tab: TabKey) => void;
}

const TABS: {
  key: TabKey;
  label: string;
  icon: (active: boolean) => JSX.Element;
}[] = [
  {
    key: "dosen",
    label: "Dosen",
    icon: (a) => (
      <svg
        className="w-5 h-5"
        fill={a ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={a ? 0 : 1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    key: "admin",
    label: "Admin",
    icon: (a) => (
      <svg
        className="w-5 h-5"
        fill={a ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={a ? 0 : 1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    key: "pusat",
    label: "Pusat",
    icon: (a) => (
      <svg
        className="w-5 h-5"
        fill={a ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={a ? 0 : 1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    key: "favorit",
    label: "Favorit",
    icon: (a) => (
      <svg
        className="w-5 h-5"
        fill={a ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={a ? 0 : 1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
];

export function BottomNav({ activeTab, counts, onTabChange }: Props) {
  const activeTabs = TABS.filter(
    (tab) => tab.key !== "favorit" || counts.favorit > 0,
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {activeTabs.map(({ key, label, icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? "text-primary-500" : "text-gray-400"
              }`}
            >
              {icon(isActive)}
              <span className="text-[10px] font-medium">
                {label}
                <span className="ml-0.5 text-[9px] opacity-70">
                  {counts[key]}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
