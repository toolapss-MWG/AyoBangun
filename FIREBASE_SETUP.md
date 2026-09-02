# Setup Firebase Production

## 1. Buat project
Buat project Firebase lalu tambahkan Web App. Salin object `firebaseConfig`.

## 2. Authentication
Aktifkan provider Email/Password.

Aplikasi memetakan username ke email internal:
`admin` -> `admin@ayobangun.id`

Untuk bootstrap pertama:
1. Firebase Console > Authentication > Users > Add user.
2. Buat `owner@ayobangun.id` dengan password kuat.
3. Salin UID user tersebut.
4. Firestore > buat document `organizations/ayo-bangun-id/users/<UID>` dengan field:
   - id: `<UID>`
   - username: `owner`
   - name: `Owner Ayo Bangun`
   - role: `owner`
   - active: `true`
5. Login menggunakan username `owner` dan password Firebase tadi.

Setelah Owner aktif, menu User dapat memanggil Cloud Function `createAppUser` untuk menambah Admin/Mandor tanpa logout dari akun Owner.

## 3. Firestore dan Storage rules
Dari folder `firebase`:

```bash
firebase login
firebase use --add
firebase deploy --only firestore:rules,storage
```

## 4. Functions

```bash
cd firebase/functions
npm install
cd ..
firebase deploy --only functions
```

## 5. WhatsApp Cloud API
Set secret:

```bash
firebase functions:secrets:set WA_TOKEN
firebase functions:secrets:set WA_PHONE_NUMBER_ID
firebase deploy --only functions
```

Nomor tujuan di aplikasi gunakan format internasional tanpa `+`, contoh `6281234567890`.

## 6. Config pada aplikasi
Login Owner > Pengaturan > Firebase Config JSON, tempel object config dari Firebase Console.

Contoh format:

```json
{
  "apiKey": "...",
  "authDomain": "project.firebaseapp.com",
  "projectId": "project-id",
  "storageBucket": "project.firebasestorage.app",
  "messagingSenderId": "...",
  "appId": "..."
}
```

API key web Firebase tidak dianggap secret, tetapi keamanan data tetap bergantung pada Authentication dan Firestore/Storage Rules.
