import { supabase } from '../supabase.js'
import { formatRupiah } from '../utils/format.js'

export function expenseView() {
  return `
    <section class="card">
      <h2>Input Expense</h2>

      <form id="expenseForm">
        <input type="date" id="date_expense" required />
        <input type="text" id="expense_name" placeholder="Nama pengeluaran" required />
        <input type="text" id="code" placeholder="Kode, contoh ED/TP/HL" />
        <input type="number" id="amount" placeholder="Nominal" required />
        <button type="submit">Simpan Expense</button>
      </form>
    </section>

    <section class="card">
      <h2>Data Expense</h2>
      <button id="loadExpense">Refresh Data</button>
      <div id="expenseList"></div>
    </section>
  `
}

export async function loadExpenses() {
  const expenseList = document.querySelector('#expenseList')

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date_expense', { ascending: false })

  if (error) {
    expenseList.innerHTML = `<p>Gagal ambil data: ${error.message}</p>`
    console.error(error)
    return
  }

  expenseList.innerHTML = data.map(item => `
    <div class="item">
      <b>${item.expense_name}</b><br>
      ${item.date_expense} | ${item.code || '-'} | ${formatRupiah(item.amount)}
      <br>
      Periodic: ${item.periodic_date || '-'}
    </div>
  `).join('')
}

export function setupExpenseEvents() {
  const expenseForm = document.querySelector('#expenseForm')
  const loadExpense = document.querySelector('#loadExpense')

  expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const payload = {
      date_expense: document.querySelector('#date_expense').value,
      expense_name: document.querySelector('#expense_name').value,
      code: document.querySelector('#code').value,
      amount: Number(document.querySelector('#amount').value),
    }

    const { error } = await supabase
      .from('expenses')
      .insert(payload)

    if (error) {
      alert('Gagal simpan expense: ' + error.message)
      console.error(error)
      return
    }

    alert('Expense berhasil disimpan')
    expenseForm.reset()
    loadExpenses()
  })

  loadExpense.addEventListener('click', loadExpenses)
}