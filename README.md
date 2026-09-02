# Ayo Bangun.ID Contractor

Aplikasi manajemen proyek konstruksi berbasis PWA yang dapat langsung dijalankan sebagai website GitHub Pages dan di-install pada Android melalui browser. Aplikasi dibuat untuk Owner, Admin, dan beberapa Mandor dengan hak akses berbeda.

## Langsung jalan setelah upload ke GitHub

Repository ini tidak memerlukan proses build untuk versi web. `index.html` berada di root dan seluruh asset memakai relative path.

1. Upload seluruh isi folder ini ke repository GitHub.
2. Buka **Settings > Pages**.
3. Pada **Build and deployment**, pilih **GitHub Actions**.
4. Push ke `main` atau `master`.
5. Workflow `.github/workflows/pages.yml` akan mempublikasikan aplikasi.

Aplikasi juga dapat dibuka lokal dengan web server sederhana, misalnya `python -m http.server 8080`.

## Login lokal awal

- Owner: `owner` / `AYOBANGUN#2026`
- Admin: `admin` / `0000`
- Mandor: `mandor1` / `1234`

**Wajib ganti password default sebelum penggunaan operasional.** Akun ini hanya bootstrap mode lokal.

## Fitur

- Multi-project, data mengikuti project aktif
- Role Owner, Admin, Mandor
- Master katalog material konstruksi lengkap dan editable
- Stok masuk dan stock opname
- Input pemakaian material oleh Mandor
- Approval stok/pemakaian oleh Admin/Owner
- Absensi tenaga kerja editable semua user
- Target harian/mingguan, volume, bobot dan progress pekerjaan
- Kendala pekerjaan dan corrective action
- Laporan harian
- Kirim laporan ke WhatsApp
- RAB / anggaran
- Permintaan pembelian
- Supplier
- Alat dan inventaris
- K3 / HSE
- Audit log
- Backup/restore JSON
- PWA offline cache
- Firebase realtime sync lintas perangkat
- Firebase Cloud Function untuk pembuatan user Firebase dan pengiriman WhatsApp terjadwal

## Firebase

Aplikasi langsung bekerja tanpa Firebase memakai penyimpanan lokal perangkat. Agar data sinkron lintas HP:

1. Buat Firebase project.
2. Aktifkan Authentication Email/Password, Firestore, Storage dan Functions.
3. Deploy `firebase/firestore.rules` dan `firebase/storage.rules`.
4. Deploy folder `firebase/functions`.
5. Masuk sebagai Owner pada aplikasi lokal, buka **Pengaturan**, lalu tempel Firebase Web App config JSON.
6. Buat akun Auth Owner pertama sesuai panduan `docs/FIREBASE_SETUP.md`.

Jangan membuat Firestore rules public untuk produksi.

## WhatsApp otomatis

Tombol **Kirim** selalu dapat membuka WhatsApp dengan laporan terisi otomatis. Untuk pengiriman tanpa interaksi, deploy Firebase Function dan set secret `WA_TOKEN` serta `WA_PHONE_NUMBER_ID` dari Meta WhatsApp Cloud API. Pengiriman otomatis membutuhkan akun WhatsApp Business/Cloud API yang sah.

## Android

Aplikasi adalah PWA installable. Di Android buka URL GitHub Pages pada Chrome, pilih **Install app / Tambahkan ke layar utama**. Tampilan akan berjalan standalone seperti aplikasi. Data Firebase tetap sinkron antar perangkat.

## Struktur

- `index.html` entry point
- `styles.css` UI responsive navy/gold Ayo Bangun.ID
- `js/app.js` UI dan workflow
- `js/store.js` data lokal, CRUD, audit
- `js/firebase.js` Firebase Auth, Firestore realtime, Storage, Functions
- `js/catalog.js` master material dan work type
- `firebase/` rules dan Cloud Functions
- `.github/workflows/pages.yml` deployment GitHub Pages
- `assets/` logo dan PWA icons

## Catatan produksi

Sebelum dipakai untuk data proyek nyata, lakukan pengujian user acceptance, backup, validasi rule Firebase, dan pengaturan akun Owner yang tidak memakai password default. Aplikasi tidak menyimpan password Firebase di source code.

## APK Android otomatis dari GitHub Actions

Repository juga menyertakan `android-app/`, yaitu wrapper Android native WebView untuk aplikasi yang sama. Workflow `.github/workflows/android-apk.yml` membangun APK debug setiap push ke `main`/`master`.

Setelah workflow selesai, buka **Actions > Build Android APK > Artifacts** dan unduh `Ayo-Bangun-ID-Contractor-debug-apk`. Untuk distribusi publik/Play Store, buat signing key release sendiri dan jangan simpan private key langsung di repository.
