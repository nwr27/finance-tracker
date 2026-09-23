# Anangi App

Aplikasi pribadi untuk mencatat, mengalokasikan, dan mengevaluasi keuangan secara harian dan mingguan.

## Pedoman Penggunaan

### 1. Pencatatan Harian

Catat setiap transaksi sesuai tanggal transaksi sebenarnya.

- **Income** → setiap uang masuk.
- **Expense** → setiap pengeluaran.
- **Saving** → penggunaan atau perpindahan uang dari tabungan.

Jangan menunda atau menggabungkan transaksi jika data aslinya tersedia.

---

### 2. Periode Keuangan

Satu periode keuangan berlangsung:

**Kamis → Rabu**

Contoh:

`Kamis 10 Sep → Rabu 16 Sep`

- **Kamis** = awal periode baru.
- **Rabu** = akhir periode dan Weekly Check.

---

### 3. Weekly Check

Setiap Rabu, setelah semua transaksi hari tersebut dicatat:

1. Cek saldo aktual.
2. Input saldo aktual ke menu **Weekly**.
3. Bandingkan dengan saldo berdasarkan data aplikasi.
4. Periksa `Difference`.

Target:

`Difference = Rp0`

Jika terdapat selisih, periksa kembali transaksi minggu tersebut sebelum melanjutkan periode berikutnya.

---

### 4. Auto Allocation Income

Jika Income menggunakan `auto`:

| Alokasi | Persentase |
|---|---:|
| Available Balance | 30% |
| Nest Egg | 30% |
| Wedding | 30% |
| Umrah | 10% |

Total = **100%**

---

### 5. Prinsip Utama

**Catat harian → Audit setiap Rabu → Mulai periode baru setiap Kamis.**

Jangan mengedit `balance_allocations` atau `savings_ledger` secara manual karena data tersebut diproses otomatis oleh sistem.