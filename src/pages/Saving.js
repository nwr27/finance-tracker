import { supabase } from '../supabase.js'
import { formatRupiah } from '../utils/format.js'

export function savingView() {
  return `
    <section class="card">
      <h2>Saving Use</h2>

      <form id="savingUseForm">
        <input type="date" id="date_use" required />

        <select id="from_save" required>
          <option value="">Ambil dari saving</option>
          <option value="nest_egg">Nest Egg</option>
          <option value="wedding">Wedding</option>
          <option value="umrah">Umrah</option>
          <option value="piggy">Piggy</option>
          <option value="trading">Trading</option>
        </select>

        <select id="to_target" required>
          <option value="">Tujuan</option>
          <option value="balance">Balance</option>
        </select>

        <input type="number" id="amount_use" placeholder="Nominal" required />
        <input type="text" id="note_use" placeholder="Catatan" />

        <button type="submit">Simpan Saving Use</button>
      </form>
    </section>

    <section class="card">
      <h2>Saving Ledger</h2>
      <button id="loadSaving">Refresh Data</button>
      <div id="savingList"></div>
    </section>
  `
}

export async function loadSavings() {
  const savingList = document.querySelector('#savingList')

  const { data, error } = await supabase
    .from('savings_ledger')
    .select('*')
    .order('date_save', { ascending: false })

  if (error) {
    savingList.innerHTML = `<p>Gagal ambil saving: ${error.message}</p>`
    console.error(error)
    return
  }

  savingList.innerHTML = data.map(item => `
    <div class="item">
      <b>${item.type_save}</b><br>
      ${item.date_save} | ${formatRupiah(item.amount)}
      <br>
      Note: ${item.note || '-'}
      <br>
      Periodic: ${item.periodic_date || '-'}
    </div>
  `).join('')
}

export function setupSavingEvents() {
  const savingUseForm = document.querySelector('#savingUseForm')
  const loadSaving = document.querySelector('#loadSaving')

  savingUseForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const payload = {
      date_use: document.querySelector('#date_use').value,
      from_save: document.querySelector('#from_save').value,
      to_target: document.querySelector('#to_target').value,
      amount: Number(document.querySelector('#amount_use').value),
      note: document.querySelector('#note_use').value,
    }

    const { error } = await supabase
      .from('saving_uses')
      .insert(payload)

    if (error) {
      alert('Gagal simpan saving use: ' + error.message)
      console.error(error)
      return
    }

    alert('Saving use berhasil disimpan')
    savingUseForm.reset()
    loadSavings()
  })

  loadSaving.addEventListener('click', loadSavings)
}