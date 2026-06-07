import { supabase } from '../supabase.js'
import { formatRupiah } from '../utils/format.js'
import { notifyDataChanged } from '../utils/events.js'

export function incomeView() {
  return `
    <section class="card">
      <h2>Input Income</h2>

      <form id="incomeForm">
        <input type="date" id="date_income" required />
        <input type="number" id="amount_income" placeholder="Nominal income" required />
        <input type="text" id="note_income" placeholder="Catatan income" />

        <select id="allocation_type" required>
          <option value="">Pilih alokasi</option>
          <option value="auto">Auto</option>
          <option value="balance">Balance</option>
          <option value="nest_egg">Nest Egg</option>
          <option value="wedding">Wedding</option>
          <option value="umrah">Umrah</option>
          <option value="piggy">Piggy</option>
          <option value="trading">Trading</option>
        </select>

        <button type="submit">Simpan Income</button>
      </form>
    </section>

    <section class="card">
      <h2>Data Income</h2>
      <button id="loadIncome">Refresh Data</button>
      <div id="incomeList"></div>
    </section>
  `
}

export async function loadIncomes() {
  const incomeList = document.querySelector('#incomeList')

  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .order('date_income', { ascending: false })

  if (error) {
    incomeList.innerHTML = `<p>Gagal ambil income: ${error.message}</p>`
    console.error(error)
    return
  }

  incomeList.innerHTML = data.map(item => `
  <div class="item">
    <b>${item.note || 'Income'}</b><br>
    ${item.date_income} | ${item.allocation_type} | ${formatRupiah(item.amount)}
    <br>
    Periodic: ${item.periodic_date || '-'}
    <br><br>
    <button class="edit-btn" data-edit-income="${item.id}">
      Edit
    </button>
    <button class="danger-btn" data-delete-income="${item.id}">
      Hapus
    </button>
  </div>
`).join('')

  document.querySelectorAll('[data-delete-income]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteIncome

      const confirmDelete = confirm(
        'Yakin hapus income ini? Allocation dan saving ledger terkait juga akan terhapus.'
      )

      if (!confirmDelete) return

      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id)

      if (error) {
        alert('Gagal hapus income: ' + error.message)
        console.error(error)
        return
      }

      alert('Income berhasil dihapus')
      loadIncomes()
    })
  })
  document.querySelectorAll('[data-edit-income]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.editIncome

      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert('Gagal ambil income: ' + error.message)
        console.error(error)
        return
      }

      document.querySelector('#date_income').value = data.date_income
      document.querySelector('#amount_income').value = data.amount
      document.querySelector('#note_income').value = data.note || ''
      document.querySelector('#allocation_type').value = data.allocation_type

      document.querySelector('#incomeForm').dataset.editId = id
    })
  })
}

export function setupIncomeEvents() {
  const incomeForm = document.querySelector('#incomeForm')
  const loadIncome = document.querySelector('#loadIncome')

  incomeForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const payload = {
      date_income: document.querySelector('#date_income').value,
      amount: Number(document.querySelector('#amount_income').value),
      note: document.querySelector('#note_income').value,
      allocation_type: document.querySelector('#allocation_type').value,
    }

    const editId = incomeForm.dataset.editId

    let error

    if (editId) {
      const result = await supabase
        .from('incomes')
        .update(payload)
        .eq('id', editId)

      error = result.error
    } else {
      const result = await supabase
        .from('incomes')
        .insert(payload)

      error = result.error
    }

    if (error) {
      alert('Gagal simpan income: ' + error.message)
      console.error(error)
      return
    }

    alert('Income berhasil disimpan')
    incomeForm.reset()
    delete incomeForm.dataset.editId
    loadIncomes()
    notifyDataChanged()
  })

  loadIncome.addEventListener('click', loadIncomes)
}