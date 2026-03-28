import type { Contact, TabKey } from '../types/contact'

type RawRow = Record<string, unknown>

/**
 * Maps a raw array of rows (from contacts.json or Excel) to Contact objects.
 * Eliminates the 3× duplicated mapping pattern from the original script.js.
 */
export function mapContacts(
  rows: RawRow[],
  category: TabKey,
  startIdx: number = 0,
): Contact[] {
  return rows
    .map((row, idx): Contact => {
      // Name field: Dosen prefers "Nama Gelar", others prefer "Nama"
      let nama = ''
      if (category === 'dosen') {
        nama =
          str(row['Nama Gelar']) ||
          str(row['Nama']) ||
          str(row['nama']) ||
          str(row['Name']) ||
          str(row['name'])
      } else {
        nama =
          str(row['Nama']) ||
          str(row['nama']) ||
          str(row['Name']) ||
          str(row['name']) ||
          str(row['Nama Lengkap']) ||
          str(row['Nama Layanan']) ||
          str(row['Full Name'])
      }

      // Phone field: many possible column names (from Excel uploads)
      const noWA =
        str(row['No. Telpon']) ||
        str(row['No Telpon']) ||
        str(row['NoWA']) ||
        str(row['noWA']) ||
        str(row['No WA']) ||
        str(row['No. WA']) ||
        str(row['NoWhatsApp']) ||
        str(row['No WhatsApp']) ||
        str(row['WhatsApp']) ||
        str(row['Telepon']) ||
        str(row['telepon']) ||
        str(row['Phone']) ||
        str(row['phone']) ||
        str(row['No Telepon']) ||
        str(row['HP']) ||
        str(row['hp']) ||
        str(row['NOWA']) ||
        str(row['TELEPON'])

      const jabatan = str(row['Jabatan']) || str(row['jabatan'])
      const ruang = str(row['Ruang']) || str(row['ruang'])
      const keperluan = (str(row['Keperluan']) || str(row['keperluan'])).replace(
        /\r\n/g,
        '\n',
      )

      return {
        id: `${category}_${startIdx + idx + 1}`,
        nama,
        noWA,
        jabatan,
        ruang,
        keperluan,
      }
    })
    .filter((c) => c.nama.length > 0 && c.noWA.length > 0)
}

function str(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}
