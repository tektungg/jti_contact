export type TabKey = 'dosen' | 'admin' | 'pusat'

export interface Contact {
  id: string
  nama: string
  noWA: string
  jabatan: string
  ruang: string
  keperluan: string
}

export interface ContactData {
  dosen: Contact[]
  admin: Contact[]
  pusat: Contact[]
}

export interface RawDosenEntry {
  'No.'?: string | number
  NIP?: string
  Nama?: string
  'Nama Gelar'?: string
  'No. Telpon'?: string | number
  NoWA?: string | number
  Jabatan?: string
  Ruang?: string
  Keperluan?: string
}

export interface RawAdminEntry {
  'No.'?: string | number
  Jabatan?: string
  Nama?: string
  'Nama Lengkap'?: string
  Ruang?: string
  'No. Telpon'?: string | number
  NoWA?: string | number
  Keperluan?: string
}

export interface RawPusatEntry extends RawAdminEntry {
  'Nama Layanan'?: string
}

export interface RawContactsJSON {
  Dosen?: RawDosenEntry[]
  Admin?: RawAdminEntry[]
  Pusat?: RawPusatEntry[]
}
