# Anangi - Perbaikan Presentasi Audit

Perubahan utama:
- Dashboard: Available Balance -> Balance Tersedia.
- Dashboard: Total Save -> Total Saving.
- Dashboard: Trading -> Modal Trading (nilai pembukuan modal/deposit, bukan nilai pasar akun trading).
- Dashboard: Save + Trading -> Saving Diaudit (Nest Egg + Wedding + Umrah; Piggy dan Trading dikecualikan).
- Weekly Summary memakai istilah Total Uang Terhitung, Saving yang Diaudit, Balance Aktual, Balance Seharusnya, Balance Minggu Lalu, Balance Masuk, Pengeluaran, dan Selisih Balance.
- Weekly Check menjelaskan bahwa Piggy dan saldo akun Trading tidak dimasukkan.
- Raw Weekly Check: Real Balance -> Total Uang Terhitung.

Catatan: Supabase harus sudah mengeluarkan `piggy` dan `trading` dari `audited_saving` pada view `weekly_summary` dan `periodic_summary`.
