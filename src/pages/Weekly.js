import { supabase } from '../supabase.js'
import { formatRupiah } from '../utils/format.js'
import { notifyDataChanged } from '../utils/events.js'

export function weeklyView() {
  return `
    <section class="card">
      <h2>Weekly Check</h2>

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
      <h2>Data Weekly Check</h2>
      <button id="loadWeekly">Refresh Data</button>
      <div id="weeklyList"></div>
    </section>
  `
}

export async function loadWeeklyChecks() {
  const weeklyList = document.querySelector('#weeklyList')

  const { data, error } = await supabase
    .from('weekly_checks')
    .select('*')
    .order('periodic_date', { ascending: false })

  if (error) {
    weeklyList.innerHTML = `<p>Gagal ambil weekly check: ${error.message}</p>`
    console.error(error)
    return
  }

  weeklyList.innerHTML = data.map(item => `
    <div class="item">
      <b>Periode: ${item.periodic_date}</b><br>
      Cash: ${formatRupiah(item.cash)} |
      Dana: ${formatRupiah(item.dana)} |
      Gopay: ${formatRupiah(item.gopay)} |
      BCA: ${formatRupiah(item.bca)}
      <br>
      Real Balance: ${formatRupiah(item.real_balance)}
      <br>
      Note: ${item.note || '-'}
    </div>
  `).join('')
}

export function setupWeeklyEvents() {
  const weeklyCheckForm = document.querySelector('#weeklyCheckForm')
  const loadWeekly = document.querySelector('#loadWeekly')

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

    const { error } = await supabase
      .from('weekly_checks')
      .upsert(payload, { onConflict: 'periodic_date' })

    if (error) {
      alert('Gagal simpan weekly check: ' + error.message)
      console.error(error)
      return
    }

    alert('Weekly check berhasil disimpan')
    weeklyCheckForm.reset()
    loadWeeklyChecks()
    notifyDataChanged()
  })

  loadWeekly.addEventListener('click', loadWeeklyChecks)
}