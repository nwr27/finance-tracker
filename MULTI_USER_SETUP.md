# Multi User — NANA & MEYSA

## 1. Supabase
Jalankan `MULTI_USER_FINAL_SQL.sql` di SQL Editor setelah migration owner_id + view/function multi-user yang sudah dilakukan.

## 2. Local `.env`
Tambahkan:

```env
VITE_NANA_PASSCODE=1234
VITE_MEYSA_PASSCODE=0000
```

`VITE_APP_PASSCODE` dan `VITE_VIEW_PASSCODE` sudah tidak digunakan. Login hanya memakai NANA dan MEYSA.

## 3. Vercel
Di Project > Settings > Environment Variables tambahkan:

- `VITE_NANA_PASSCODE` = passcode NANA
- `VITE_MEYSA_PASSCODE` = passcode MEYSA

Lalu redeploy. Tidak perlu membuat project Vercel baru.

## 4. Perilaku aplikasi
- NANA menyimpan/membaca `owner_id = nana`
- MEYSA menyimpan/membaca `owner_id = meysa`
- Nama user aktif tampil di Navbar setelah menu Saving.
- Dashboard, Expense, Weekly, Income, Saving difilter berdasarkan user aktif.
- INSERT membawa `owner_id` user aktif.
- UPDATE/DELETE juga dibatasi dengan `owner_id` user aktif.

## Catatan keamanan
Login ini tetap passcode frontend sederhana, bukan Supabase Auth. `VITE_*` tersedia pada bundle browser, sehingga pemisahan ini cocok untuk aplikasi pribadi sederhana tetapi bukan batas keamanan database yang kuat terhadap pengguna teknis/malicious.
