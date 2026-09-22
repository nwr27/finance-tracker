# Finance Tracker — React + Vite Migration & Redeploy

## Arsitektur paket ini
- React + Vite sebagai application shell (`main.jsx`, `App.jsx`).
- Navbar dan login sudah React native + CSS Modules.
- Setiap halaman sudah mempunyai wrapper `.jsx`.
- Logika Supabase lama dipertahankan di `src/legacy/pages/*.legacy.js` agar perilaku database tidak berubah saat migrasi pertama.
- `src/styles/global.css` masih dipakai sementara untuk style halaman legacy. CSS React baru memakai `*.module.css`.

## Instalasi lokal
1. Backup project lama.
2. Extract ZIP ini ke folder baru, misalnya `finance-tracker-react-vite`.
3. Buka terminal di folder tersebut.
4. Jalankan `npm install`.
5. Pastikan `.env` berisi variabel berikut (gunakan nilai milik project Anda):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_PASSCODE`
   - `VITE_VIEW_PASSCODE`
6. Jalankan `npm run dev`.
7. Buka URL localhost yang diberikan Vite.

## Checklist pengujian sebelum deploy
- Login full-access berhasil.
- Login view-only berhasil dan tombol tulis tersembunyi.
- Dashboard tampil dan Refresh bekerja.
- Expense: tambah, edit, hapus, pindah minggu.
- Income: tambah/edit/hapus sesuai fungsi lama.
- Weekly: input/edit/hapus dan audit tampil.
- Saving: saving dan saving use tampil/tersimpan.
- Logout bekerja.
- Jalankan `npm run build` dan pastikan tidak ada error.
- Opsional: `npm run preview` untuk menguji hasil production build.

## Redeploy Vercel — repository yang sama
1. Commit perubahan ke Git repository yang sudah terhubung ke Vercel.
2. Push ke branch production (biasanya `main`).
3. Vercel akan membuat deployment baru otomatis.
4. Di Vercel > Project > Settings > Environment Variables, pastikan empat `VITE_*` di atas tersedia untuk Production.
5. Jika Anda mengubah Environment Variables di Vercel, lakukan Redeploy karena nilai Vite dibaca saat build.
6. Build command: `npm run build`.
7. Output directory: `dist`.
8. Install command: `npm install` (default juga cukup).
9. Setelah deployment sukses, tes ulang login, Dashboard, Expense, Weekly, Income, dan Saving di URL production.

## Redeploy Vercel — project baru
1. Push folder ini ke repository Git baru.
2. Di Vercel pilih Add New > Project lalu import repository.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Tambahkan `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_PASSCODE`, `VITE_VIEW_PASSCODE` pada Environment Variables.
7. Deploy.

## Catatan keamanan
`VITE_*` dimasukkan ke bundle browser. Karena itu passcode frontend bukan mekanisme keamanan database yang kuat. Proteksi data tetap harus mengandalkan Supabase RLS/policy. Jangan pernah menaruh Supabase service-role key di variabel `VITE_*`.

## Tahap migrasi berikutnya
Setelah versi ini stabil, pindahkan satu halaman per tahap dari `src/legacy/pages/*.legacy.js` menjadi React native (state/effect/handler React). Pada tahap tersebut CSS halaman yang bersangkutan dipindahkan dari `global.css` ke `NamaHalaman.module.css`. Ini mengurangi risiko merusak seluruh finance tracker sekaligus.
