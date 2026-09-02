# Deploy ke GitHub Pages

1. Buat repository baru, misalnya `ayo-bangun-contractor`.
2. Upload seluruh file dan folder repository ini, jangan hanya ZIP.
3. Pastikan branch utama bernama `main` atau `master`.
4. GitHub > Settings > Pages > Source: **GitHub Actions**.
5. Buka tab Actions dan tunggu workflow deploy selesai.
6. URL Pages akan tampil pada hasil workflow dan Settings > Pages.

Karena aplikasi memakai relative path, repository dapat memakai nama apa pun tanpa perlu mengubah kode.
