import type { Contact } from "../types/contact";
import { openWhatsApp } from "../utils/whatsapp";
import { sanitizePhone } from "../utils/security";
import { showToast } from "./Toast";

interface Props {
  contact: Contact;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onOpenDrawer?: (contact: Contact) => void;
}

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-sky-600",
  "from-fuchsia-500 to-purple-600",
  "from-lime-500 to-green-600",
];

function getInitials(name: string): string {
  const parts = name
    .replace(/^(Dr\.|Prof\.|Ir\.|Drs\.|Dra\.)\s*/gi, "")
    .split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0]?.substring(0, 2).toUpperCase() ?? "?";
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getBadgeStyle(jabatan: string): string {
  const j = jabatan.toLowerCase();
  if (j.includes("kaprodi") || j.includes("ketua"))
    return "bg-blue-50 text-blue-700 ring-blue-600/20 ";
  if (j.includes("sekretaris") || j.includes("sekjur"))
    return "bg-amber-50 text-amber-700 ring-amber-600/20 ";
  if (j.includes("kepala") || j.includes("kajur"))
    return "bg-rose-50 text-rose-700 ring-rose-600/20 ";
  if (j.includes("koordinator"))
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 ";
  if (j.includes("admin") || j.includes("staff"))
    return "bg-slate-50 text-slate-700 ring-slate-600/20 ";
  if (j.includes("layanan") || j.includes("pusat"))
    return "bg-cyan-50 text-cyan-700 ring-cyan-600/20 ";
  return "bg-purple-50 text-purple-700 ring-purple-600/20 ";
}

function copyPhone(phone: string) {
  navigator.clipboard.writeText(phone).then(
    () => showToast("Nomor berhasil disalin!", "success"),
    () => showToast("Gagal menyalin nomor", "error"),
  );
}

export function ContactCard({
  contact,
  index = 0,
  isFavorite,
  onToggleFavorite,
  onOpenDrawer,
}: Props) {
  const initials = getInitials(contact.nama);
  const avatarColor = getAvatarColor(contact.nama);
  const badgeStyle = contact.jabatan ? getBadgeStyle(contact.jabatan) : "";

  return (
    <div
      className="card-stagger group relative bg-white/80 glass-strong border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:shadow-primary-400/15 :shadow-primary-500/10 hover:border-primary-300 :border-primary-600 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onOpenDrawer?.(contact)}
    >
      <div className="flex flex-col h-full">
        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(contact.id);
            }}
            aria-label={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 :bg-gray-700 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-colors ${isFavorite ? "text-amber-400 fill-amber-400" : "text-gray-300 group-hover:text-amber-300"}`}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        )}

        {/* Header: Avatar + Name */}
        <div className="flex items-start gap-3.5 mb-3 pr-8">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary-500/10 flex-shrink-0`}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-base leading-snug group-hover:text-primary-600 :text-primary-400 transition-colors">
              {contact.nama}
            </h3>
            {contact.jabatan && (
              <span
                className={`inline-flex items-center mt-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset ${badgeStyle}`}
              >
                {contact.jabatan}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-1.5 mb-4 pl-[3.25rem]">
          {contact.ruang && (
            <div className="flex items-center gap-2 text-sm text-gray-500 ">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{contact.ruang}</span>
            </div>
          )}

          <div
            className="flex items-center gap-2 text-sm text-gray-500 group/phone"
            onClick={(e) => {
              e.stopPropagation();
              copyPhone(contact.noWA);
            }}
            title="Klik untuk menyalin nomor"
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="font-medium text-gray-600 group-hover/phone:text-primary-500 transition-colors cursor-pointer">
              {contact.noWA}
            </span>
            <svg
              className="w-3 h-3 text-gray-300 opacity-0 group-hover/phone:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>

          {contact.keperluan && (
            <p
              className="text-xs text-gray-400 italic leading-relaxed line-clamp-2"
              title={contact.keperluan}
            >
              {contact.keperluan}
            </p>
          )}
        </div>

        {/* WhatsApp Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openWhatsApp(sanitizePhone(contact.noWA));
          }}
          aria-label={`Hubungi ${contact.nama} via WhatsApp`}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-whatsapp to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98]"
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Hubungi
        </button>
      </div>
    </div>
  );
}
