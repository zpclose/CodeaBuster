# Migrasi Storage: Firebase → Cloudflare R2

> Dokumentasi lengkap proses migrasi storage foto dan video dari Firebase Storage ke Cloudflare R2 yang dilakukan pada **15 Agustus 2026**.

---

## Latar Belakang

Proyek CodeaBuster awalnya menggunakan **dua Firebase project** yang berjalan berdampingan:

- **`studio-8281963604-c316a`** — project utama untuk Auth dan Firestore (semua data)
- **`studio-8681629558-68f05`** — project khusus untuk Firebase Storage (foto dan video)

Pemisahan ini sebenarnya sudah bagus dari sisi arsitektur. Namun masalah muncul ketika **billing account Firebase tiba-tiba terkunci** karena status *closed*. Akibatnya, seluruh akses ke Firebase Storage diblokir — foto-foto yang sudah diupload tidak bisa diakses, dan upload baru tidak bisa dilakukan.

Error yang muncul:
```
{
  "error": {
    "code": 402,
    "message": "The billing account for the owning project is disabled in state closed"
  }
}
```

Dari kejadian ini, muncul keputusan untuk **memindahkan storage ke platform yang lebih stabil dan lebih hemat**: Cloudflare R2.

---

## Mengapa Cloudflare R2?

Sebelum memutuskan, dilakukan perbandingan antara Firebase Storage dan Cloudflare R2:

| Fitur | Firebase Storage | Cloudflare R2 |
|---|---|---|
| Free storage | 5 GB | **10 GB** |
| Biaya egress (download) | $0.12/GB | **Gratis selamanya** |
| Butuh billing aktif | Ya (Blaze plan) | Ya, tapi free tier lebih besar |
| Ketergantungan satu vendor | Ya | Tidak |

Keunggulan utama R2 adalah **egress gratis** — setiap kali foto dibuka oleh pengunjung website, Firebase menghitung biaya. R2 tidak. Untuk website yang banyak menampilkan gambar, ini perbedaan yang signifikan dalam jangka panjang.

---

## Strategi Migrasi

Keputusan yang diambil adalah **hybrid migration** — hanya memindahkan storage, bukan seluruh infrastruktur Firebase. Firestore dan Firebase Auth tetap dipakai karena sudah stabil dan tidak menimbulkan biaya berlebih.

Alasannya sederhana:
- Migrasi storage = **2 file** yang perlu diubah
- Migrasi seluruh Firebase = berminggu-minggu pengerjaan dengan risiko besar

---

## Proses Migrasi

### 1. Aktivasi Billing Firebase

Langkah pertama adalah mengaktifkan kembali billing Firebase agar foto-foto lama bisa diakses dan didownload untuk dipindahkan. Tanpa ini, file di Storage tidak bisa diambil sama sekali.

### 2. Setup Cloudflare R2

Di Cloudflare Dashboard:
1. Aktifkan R2 Object Storage
2. Buat bucket baru bernama `codeabuster-storage`
3. Aktifkan **Public Development URL** untuk akses publik
4. Buat **API Token** dengan permission *Object Read & Write*
5. Catat: `Account ID`, `Access Key ID`, `Secret Access Key`, `Public URL`

### 3. Script Migrasi Otomatis

Dibuat script Node.js di `scripts/migrate-storage-to-r2.mjs` yang melakukan:

1. **List semua file** langsung dari Firebase Storage bucket menggunakan Admin SDK
2. **Generate signed URL** untuk setiap file agar bisa didownload
3. **Download** setiap file dari Firebase Storage
4. **Upload** ke Cloudflare R2 dengan path yang sama
5. **Update URL** di seluruh koleksi Firestore secara otomatis
6. **Skip file yang sudah ada** di R2 — aman dijalankan ulang kalau terputus

Koleksi Firestore yang URL-nya diupdate:

| Koleksi | Field |
|---|---|
| `images` | `imageUrl` |
| `team-members` | `imageUrl` |
| `network-partners` | `imageUrl` |
| `page-images` | `imageUrl` |
| `achievements` | `thumbnailUrl`, `curatorImageUrl` |

### 4. Konfigurasi Diperlukan untuk Script

Dua file service account Firebase diperlukan:

- `firebase-service-account.json` — dari project utama (`studio-8281963604-c316a`) untuk akses Firestore
- `firebase-storage-service-account.json` — dari project storage (`studio-8681629558-68f05`) untuk akses Storage bucket

> ⚠️ Kedua file ini **tidak boleh di-commit ke git**. Sudah ditambahkan ke `.gitignore`.

### 5. Menjalankan Script

```bash
npm install firebase-admin @aws-sdk/client-s3 node-fetch
node scripts/migrate-storage-to-r2.mjs
```

Output script yang berhasil:
```
============================================================
  MIGRASI FIREBASE STORAGE → CLOUDFLARE R2
============================================================
→ Listing semua file dari Firebase Storage bucket...
✓ Ditemukan XX file di Storage bucket
→ Mengambil download URL untuk semua file...
→ [1/XX] Upload: images/foto-1.jpg
✓ [1/XX] Upload berhasil → https://pub-xxx.r2.dev/images/foto-1.jpg
...
============================================================
  SELESAI
============================================================
```

---

## Perubahan Kode

Setelah migrasi data berhasil, kode aplikasi diupdate agar **upload baru juga masuk ke R2**, bukan Firebase lagi.

### File yang Diubah

**`src/lib/storage-utils.ts`**
Sebelumnya berisi logika upload ke Firebase Storage. Sekarang memanggil API route `/api/storage/upload` yang meneruskan file ke R2.

**`src/lib/standalone-storage.ts`**
Sebelumnya inisialisasi Firebase Storage app terpisah. Sekarang juga menggunakan API route yang sama.

**`src/firebase/config.ts`**
Dihapus: `storageConfig` (konfigurasi project storage Firebase yang sudah tidak dipakai).

**`src/firebase/index.ts`**
Dihapus: semua import Firebase Storage SDK, fungsi `getStorageApp()`, dan inisialisasi storage app.

**`src/lib/content-utils.ts`**
Semua pemanggilan `deleteObject` Firebase diganti dengan `deleteImage` dari R2.

**`src/app/admin/content/images/page.tsx`**
Halaman admin manajemen gambar — upload dan delete diganti dari Firebase Storage ke R2.

### File yang Dibuat

**`src/app/api/storage/upload/route.ts`**
API route server-side untuk upload file ke R2. Menerima `multipart/form-data`, validasi tipe dan ukuran file, lalu upload ke bucket R2 menggunakan AWS S3 SDK.

**`src/app/api/storage/delete/route.ts`**
API route server-side untuk menghapus file dari R2 berdasarkan path.

### Environment Variables

Ditambahkan di Vercel Dashboard dan `.env.local`:

```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=codeabuster-storage
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

---

## Pembersihan (Cleanup)

Setelah migrasi selesai, dilakukan pembersihan menyeluruh:

**File dihapus:**
- `.tmp` — file sementara tidak berguna
- `deploy-trigger.txt` — sudah tidak diperlukan
- `tailwind.config copy.ts` — duplikat config
- `vercel.bak` — backup lama
- `scripts/migrate-result.json` — hasil migrasi sudah tidak diperlukan

**Bonus — Security Headers:**
Isi `vercel.bak` ternyata berisi konfigurasi security headers yang belum aktif. Headers ini dipindahkan ke `vercel.json` yang aktif, sehingga sekarang website memiliki proteksi:
- `Strict-Transport-Security` — paksa HTTPS
- `X-Frame-Options` — cegah clickjacking
- `X-XSS-Protection` — proteksi XSS
- `X-Content-Type-Options` — cegah MIME sniffing
- `Referrer-Policy` — kontrol referrer header
- `Permissions-Policy` — batasi akses kamera, mikrofon, geolokasi

---

## Hasil Akhir

| Aspek | Sebelum | Sesudah |
|---|---|---|
| Storage provider | Firebase Storage | Cloudflare R2 |
| Biaya egress | $0.12/GB | **Gratis** |
| Ketergantungan billing Firebase | Ya (Storage) | Tidak |
| Firebase yang masih dipakai | Auth + Firestore + Storage | Auth + Firestore saja |
| Security headers | Tidak aktif | Aktif |

---

## Hal yang Masih Perlu Dilakukan (Manual)

- [ ] **Revoke GitHub Personal Access Token** yang digunakan saat proses migrasi di [github.com/settings/tokens](https://github.com/settings/tokens)
- [ ] **Hapus semua file di Firebase Storage** (`studio-8681629558-68f05`) untuk menghindari biaya storage yang tidak perlu

---

## Catatan Penting

- File `firebase-service-account.json` dan `firebase-storage-service-account.json` **jangan pernah di-commit ke git**
- File `.env.local` dan `.env.production` juga **jangan di-commit** — sudah ada di `.gitignore`
- Script migrasi di `scripts/migrate-storage-to-r2.mjs` boleh dijalankan ulang kapan saja — file yang sudah ada di R2 akan di-skip otomatis
- Kalau suatu saat perlu migrasi ulang atau tambah bucket baru, cukup update `CONFIG` di script tersebut
