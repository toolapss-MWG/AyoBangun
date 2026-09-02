# Security Notes

- Ganti semua password lokal default.
- Untuk produksi, gunakan Firebase Authentication dan rules pada folder `firebase`.
- Jangan mengubah Firestore menjadi public read/write.
- Simpan WhatsApp Cloud API token sebagai Firebase Functions secret, bukan di JavaScript browser.
- Lakukan backup berkala dan review Audit Log.
- Batasi akun Owner dan gunakan password unik yang kuat.
