import { supabase } from '../../supabase.js'
import { formatRupiah } from '../../utils/format.js'
import { notifyDataChanged } from '../../utils/events.js'
import { canWrite, getOwnerId } from '../../utils/auth.js'
import { getLatestCompletedWednesday, isWednesday } from '../../utils/period.js'

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function weeklyView() {
  return `
    <section class="card">
      <h2>Input Weekly Check</h2>
      <p class="form-help">Jangan masukkan Piggy atau saldo akun Trading.</p>

      <form id="weeklyCheckForm">
        <input type="date" id="periodic_date" value="${getLatestCompletedWednesday()}" required />
        <input type="number" id="cash" placeholder="Cash" />
        <input type="number" id="dana" placeholder="Dana" />
        <input type="number" id="gopay" placeholder="Gopay / Seabank" />
        <input type="number" id="bca" placeholder="BCA / CIMB Niaga" />
        <input type="text" id="weekly_note" placeholder="Catatan weekly check" />
        <button type="submit">Simpan Weekly Check</button>
      </form>
    </section>

    <section class="card">
      <h2>Audit Balance Mingguan</h2>
      <button id="loadWeeklyAudit">Refresh Audit</button>
      <div id="weeklyAuditList"></div>
    </section>

    <section class="card">
      <h2>Rincian Uang Terhitung</h2>
      <button id="loadWeeklyRaw">Refresh Rincian</button>
      <div id="weeklyRawList"></div>
    </section>
  `
}

export async function loadWeeklyChecks() {
  await loadWeeklyAudit()
  await loadWeeklyRawChecks()
}

async function loadWeeklyAudit() {
  const weeklyAuditList = document.querySelector('#weeklyAuditList')

  const { data, error } = await supabase
    .from('periodic_summary')
    .select('*')
    .eq('owner_id', getOwnerId())
    .order('periodic_date', { ascending: false })

  if (error) {
    weeklyAuditList.innerHTML = `<p>Gagal ambil periodic audit: ${error.message}</p>`
    console.error(error)
    return
  }

  weeklyAuditList.innerHTML = data.map(item => {
    const hasActual = item.actual_real_balance !== null && item.actual_real_balance !== undefined
    const difference = hasActual ? Number(item.difference ?? 0) : null

    let status = hasActual ? 'Match' : 'Pending'
    let statusClass = hasActual ? 'status-match' : 'status-pending'

    if (hasActual && difference > 0) {
      status = 'Surplus'
      statusClass = 'status-surplus'
    }

    if (hasActual && difference < 0) {
      status = 'Defisit'
      statusClass = 'status-defisit'
    }

    return `
      <div class="item">
        <b>Periode: ${item.periodic_date}</b><br>
        Total Uang Terhitung: ${item.actual_total === null ? '-' : formatRupiah(item.actual_total)}
        <br>
        Saving yang Diaudit: ${formatRupiah(item.audited_saving)}
        <br>
        Balance Aktual: ${item.actual_real_balance === null ? '-' : formatRupiah(item.actual_real_balance)}
        <br>
        Balance Seharusnya: ${formatRupiah(item.data_balance)}
        <br>
        Selisih Balance: ${hasActual ? formatRupiah(item.difference) : '-'}
        <br>
        Status: <span class="status-badge ${statusClass}">${status}</span>
        <br><br>
        Balance Minggu Lalu: ${formatRupiah(item.previous_real_balance)}
        <br>
        Balance Masuk: ${formatRupiah(item.balance_allocation)}
        <br>
        Pengeluaran: ${formatRupiah(item.expense_usage)}
        <br>
        <small>Piggy dan Modal Trading tidak termasuk dalam audit.</small>
      </div>
    `
  }).join('')
}

async function loadWeeklyRawChecks() {
  const weeklyRawList = document.querySelector('#weeklyRawList')

  const { data, error } = await supabase
    .from('weekly_checks')
    .select('*')
    .eq('owner_id', getOwnerId())
    .order('periodic_date', { ascending: false })

  if (error) {
    weeklyRawList.innerHTML = `<p>Gagal ambil raw weekly check: ${error.message}</p>`
    console.error(error)
    return
  }

  weeklyRawList.innerHTML = data.map(item => `
    <div class="item">
      <b>Periode: ${item.periodic_date}</b><br>
      Cash: ${formatRupiah(item.cash)}
      <br>
      Dana: ${formatRupiah(item.dana)}
      <br>
      Gopay / Seabank: ${formatRupiah(item.gopay)}
      <br>
      BCA / CIMB Niaga: ${formatRupiah(item.bca)}
      <br>
      Total Uang Terhitung: ${formatRupiah(item.real_balance)}
      <br>
      Catatan: ${item.note || '-'}
      <br><br>

      <button class="edit-btn" data-edit-weekly="${item.id}">
        Edit
      </button>

      <button class="danger-btn" data-delete-weekly="${item.id}">
        Hapus
      </button>
    </div>
  `).join('')

  document.querySelectorAll('[data-edit-weekly]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.editWeekly

      const { data, error } = await supabase
        .from('weekly_checks')
        .select('*')
        .eq('id', id)
        .eq('owner_id', getOwnerId())
        .single()

      if (error) {
        alert('Gagal ambil weekly check: ' + error.message)
        console.error(error)
        return
      }

      document.querySelector('#periodic_date').value = data.periodic_date
      document.querySelector('#cash').value = data.cash
      document.querySelector('#dana').value = data.dana
      document.querySelector('#gopay').value = data.gopay
      document.querySelector('#bca').value = data.bca
      document.querySelector('#weekly_note').value = data.note || ''

      document.querySelector('#weeklyCheckForm').dataset.editId = id
    })
  })

  document.querySelectorAll('[data-delete-weekly]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!canWrite()) return

      const id = btn.dataset.deleteWeekly

      const confirmDelete = confirm('Yakin hapus weekly check ini?')
      if (!confirmDelete) return

      const { error } = await supabase
        .from('weekly_checks')
        .delete()
        .eq('id', id)
        .eq('owner_id', getOwnerId())

      if (error) {
        alert('Gagal hapus weekly check: ' + error.message)
        console.error(error)
        return
      }

      alert('Weekly check berhasil dihapus')

      loadWeeklyChecks()
      notifyDataChanged()
    })
  })
}

export function setupWeeklyEvents() {
  const weeklyCheckForm = document.querySelector('#weeklyCheckForm')
  const loadWeeklyAuditBtn = document.querySelector('#loadWeeklyAudit')
  const loadWeeklyRawBtn = document.querySelector('#loadWeeklyRaw')

  weeklyCheckForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    if (!canWrite()) return

    const periodicDate = document.querySelector('#periodic_date').value

    if (!isWednesday(periodicDate)) {
      alert('Weekly Check harus menggunakan tanggal Rabu sebagai penutup periode Kamis–Rabu.')
      return
    }

    const payload = {
      owner_id: getOwnerId(),
      periodic_date: periodicDate,
      cash: Number(document.querySelector('#cash').value || 0),
      dana: Number(document.querySelector('#dana').value || 0),
      gopay: Number(document.querySelector('#gopay').value || 0),
      bca: Number(document.querySelector('#bca').value || 0),
      note: document.querySelector('#weekly_note').value,
    }

    const editId = weeklyCheckForm.dataset.editId

    let error

    if (editId) {
      const result = await supabase
        .from('weekly_checks')
        .update(payload)
        .eq('id', editId)
        .eq('owner_id', getOwnerId())

      error = result.error
    } else {
      const result = await supabase
        .from('weekly_checks')
        .upsert(payload, { onConflict: 'owner_id,periodic_date' })

      error = result.error
    }

    if (error) {
      alert('Gagal simpan weekly check: ' + error.message)
      console.error(error)
      return
    }

    alert('Weekly check berhasil disimpan')

    weeklyCheckForm.reset()
    delete weeklyCheckForm.dataset.editId

    loadWeeklyChecks()
    notifyDataChanged()
  })

  loadWeeklyAuditBtn.addEventListener('click', loadWeeklyAudit)
  loadWeeklyRawBtn.addEventListener('click', loadWeeklyRawChecks)
}