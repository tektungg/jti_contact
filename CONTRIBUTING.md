# Panduan Kontribusi

Terima kasih atas minat Anda untuk berkontribusi pada Direktori Kontak JTI Polinema! 🎉

## Cara Berkontribusi

### 1. Fork Repository
Klik tombol **Fork** di pojok kanan atas halaman repository ini untuk membuat salinan ke akun GitHub Anda.

### 2. Clone Repository
```bash
git clone https://github.com/username-anda/jti_contact.git
cd jti_contact
```

### 3. Buat Branch Baru
```bash
git checkout -b update-contact-nama-dosen
```

### 4. Edit File `contacts.json`

File ini berisi data kontak dalam format JSON. Struktur datanya:

```json
{
  "dosen": [
    {
      "name": "Nama Dosen",
      "phone": "628123456789"
    }
  ],
  "admin": [...],
  "pusat": [...]
}
```

**⚠️ Penting:**
- Nomor telepon harus dalam format **628xxx** (tanpa spasi, strip, atau tanda kurung)
- Pastikan format JSON valid (gunakan JSON validator jika perlu)
- Hanya ubah data yang **benar-benar perlu diperbarui**

### 5. Commit Perubahan
```bash
git add contacts.json
git commit -m "update: nomor telepon [Nama Dosen]"
```

**Format commit message yang baik:**
- `update: nomor telepon Pak/Bu [Nama]` - untuk update nomor
- `add: kontak baru [Nama]` - untuk tambah kontak baru
- `fix: koreksi nama [Nama Lama] menjadi [Nama Baru]` - untuk perbaikan

### 6. Push ke GitHub
```bash
git push origin update-contact-nama-dosen
```

### 7. Buat Pull Request
1. Buka repository Anda di GitHub
2. Klik tombol **Compare & pull request**
3. Berikan deskripsi perubahan yang jelas:
   ```
   ## Perubahan
   - Update nomor telepon Pak/Bu [Nama]
   - Alasan: Nomor lama sudah tidak aktif

   ## Sumber Informasi
   [Opsional: Dari mana Anda mendapat informasi nomor baru]
   ```
4. Klik **Create pull request**

## Jenis Kontribusi yang Diterima

✅ **Diterima:**
- Update nomor telepon yang sudah tidak aktif
- Perbaikan typo pada nama
- Penambahan kontak dosen/admin/pusat baru
- Perbaikan format nomor telepon

❌ **Tidak Diterima:**
- Perubahan kode HTML/CSS/JS tanpa diskusi terlebih dahulu
- Data yang tidak terverifikasi
- Spam atau informasi palsu

## Verifikasi Data

Sebelum mengirim Pull Request, pastikan:
- ✅ Nomor telepon yang baru sudah diverifikasi
- ✅ Format JSON valid (bisa dicek di [jsonlint.com](https://jsonlint.com))
- ✅ Nomor dalam format `628xxx` (tanpa spasi/strip)
- ✅ Tidak ada duplikasi data

## Review Process

1. Maintainer akan me-review Pull Request Anda
2. Jika ada yang perlu diperbaiki, Anda akan diberitahu via komentar
3. Setelah approved, perubahan akan di-merge
4. Website akan otomatis terupdate (jika menggunakan GitHub Pages)

## Butuh Bantuan?

Jika ada pertanyaan atau kesulitan:
1. Buat **Issue** di repository ini
2. Jelaskan masalah yang dihadapi dengan detail
3. Tim maintainer akan membantu Anda

---

**Catatan Privasi:**
Data kontak yang ada di repository ini bersifat publik. Pastikan data yang Anda tambahkan memang diperuntukkan untuk konsumsi publik dan tidak melanggar privasi.

Terima kasih atas kontribusi Anda! 🙏
