# Perbaikan Anomali Finance Tracker

## Aturan periode
Satu periode adalah Kamis sampai Rabu dan selalu diberi `periodic_date` tanggal Rabu penutup.

Contoh:
- 10–16 September 2026 -> `2026-09-16`
- 17–23 September 2026 -> `2026-09-23`

## Weekly Check
Weekly Check adalah audit penutupan periode. Input setelah seluruh transaksi hari Rabu selesai.
Isi saldo aktual yang benar-benar ada pada saat audit:
- Cash
- Dana
- GoPay
- BCA

`real_balance` adalah jumlah keempat saldo tersebut. Jangan memasukkan Weekly Check untuk periode yang belum selesai.

Jika Actual Balance belum ada, UI sekarang menampilkan:
- Actual Balance: `-`
- Difference: `-`
- Status: `Pending`

Match/Surplus/Defisit hanya ditampilkan setelah actual balance tersedia.

## Koreksi data 12 September 2026
Tanggal 12 September 2026 berada dalam periode 10–16 September, sehingga periodic date yang benar adalah `2026-09-16`, bukan `2026-09-09`.

Setelah memakai versi ini, buka Income -> PEMUTIHAN -> Edit. Pastikan tanggal tetap 2026-09-12 dan simpan kembali. Frontend akan menghitung `periodic_date` menjadi `2026-09-16`.

Setelah simpan, Refresh Income, Weekly, dan Dashboard. Pastikan data turunan/alokasi yang dibuat database ikut berada pada periode yang benar. Jika data turunan lama tidak berubah, jangan edit tabel secara acak; periksa trigger/function Supabase terlebih dahulu.

## Rupiah
Tampilan Rupiah dibulatkan ke Rupiah utuh agar nilai seperti Rp0,6 tidak muncul. Ini memperbaiki representasi UI, bukan mengubah histori angka di database.
