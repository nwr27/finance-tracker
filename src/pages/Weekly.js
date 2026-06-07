import { supabase } from '../supabase.js'
import { formatRupiah } from '../utils/format.js'
import { notifyDataChanged } from '../utils/events.js'

export function weeklyView() {
  return `
    <section class="card">
      <h2>Input Weekly Check</h2>

      <form id="weeklyCheckForm">
        <input type="date" id="periodic_date" required />
        <input type="number" id="cash" placeholder="Cash" value="0" />
        <input type="number" id="dana" placeholder="Dana" value="0" />
        <input type="number" id="gopay" placeholder="Gopay" value="0" />
        <input type="number" id="bca" placeholder="BCA" value="0" />
        <input type="text" id="weekly_note" placeholder="Catatan weekly check" />
        <button type="submit">Simpan Weekly Check</button>
      </form>
    </section>

    <section class="card">
      <h2>Weekly Audit</h2>
      <button id="loadWeeklyAudit">Refresh Audit</button>
      <div id="weeklyAuditList"></div>
    </section>

    <section class="card">
      <h2>Weekly Check Raw Data</h2>
      <button id="loadWeeklyRaw">Refresh Raw Data</button>
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
    .from('weekly_summary')
    .select('*')
    .order('periodic_date', { ascending: false })

  if (error) {
    weeklyAuditList.innerHTML = `<p>Gagal ambil weekly audit: ${error.message}</p>`
    console.error(error)
    return
  }

  weeklyAuditList.innerHTML = data.map(item => {
    const difference = Number(item.difference || 0)

    let status = 'Match'
    let statusClass = 'status-match'

    if (difference > 0) {
      status = 'Surplus'
      statusClass = 'status-surplus'
    }

    if (difference < 0) {
      status = 'Defisit'
      statusClass = 'status-defisit'
    }

    return `
      <div class="item">
        <b>Periode: ${item.periodic_date}</b><br>
        Real Balance: ${formatRupiah(item.real_balance)}
        <br>
        Data Balance: ${formatRupiah(item.data_balance)}
        <br>
        Difference: ${formatRupiah(item.difference)}
        <br>
        Status: <span class="status-badge ${statusClass}">${status}</span>
        <br><br>
        Expense Usage: ${formatRupiah(item.expense_usage)}
        <br>
        Balance Allocation: ${formatRupiah(item.balance_allocation)}
        <br>
        Realtime Save: ${formatRupiah(item.realtime_save)}
      </div>
    `
  }).join('')
}

async function loadWeeklyRawChecks() {
  const weeklyRawList = document.querySelector('#weeklyRawList')

  const { data, error } = await supabase
    .from('weekly_checks')
    .select('*')
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
      Gopay: ${formatRupiah(item.gopay)}
      <br>
      BCA: ${formatRupiah(item.bca)}
      <br>
      Real Balance: ${formatRupiah(item.real_balance)}
      <br>
      Note: ${item.note || '-'}
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
      const id = btn.dataset.deleteWeekly

      const confirmDelete = confirm('Yakin hapus weekly check ini?')
      if (!confirmDelete) return

      const { error } = await supabase
        .from('weekly_checks')
        .delete()
        .eq('id', id)

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

    const payload = {
      periodic_date: document.querySelector('#periodic_date').value,
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

      error = result.error
    } else {
      const result = await supabase
        .from('weekly_checks')
        .upsert(payload, { onConflict: 'periodic_date' })

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