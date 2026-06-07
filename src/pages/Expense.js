import { supabase } from '../supabase.js'
import { formatRupiah } from '../utils/format.js'
import { notifyDataChanged } from '../utils/events.js'

let currentWeekStart = getWednesdayStart(new Date())

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

function getWednesdayStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day - 3 + 7) % 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function getDayName(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { weekday: 'long' })
}

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
      <div class="expense-header">
        <div>
          <h2>Expense Mingguan</h2>
          <p id="expensePeriodLabel"></p>
        </div>

        <button id="loadExpense">Refresh</button>
      </div>

      <div class="week-nav">
        <button id="prevWeek">← Prev Week</button>
        <button id="thisWeek">This Week</button>
        <button id="nextWeek">Next Week →</button>
      </div>

      <div id="expenseSummary"></div>
      <div id="expenseList"></div>
    </section>
  `
}

export async function loadExpenses() {
  const expenseList = document.querySelector('#expenseList')
  const expenseSummary = document.querySelector('#expenseSummary')
  const expensePeriodLabel = document.querySelector('#expensePeriodLabel')

  const start = currentWeekStart
  const end = addDays(start, 6)

  const startText = formatDate(start)
  const endText = formatDate(end)

  expensePeriodLabel.textContent = `${startText} sampai ${endText}`

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('date_expense', startText)
    .lte('date_expense', endText)
    .order('date_expense', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    expenseList.innerHTML = `<p>Gagal ambil data: ${error.message}</p>`
    console.error(error)
    return
  }

  const totalWeek = data.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalTransaction = data.length
  const averageDaily = totalWeek / 7

  expenseSummary.innerHTML = `
    <div class="summary-grid">
      <div class="summary-card">
        <span>Total Minggu Ini</span>
        <b>${formatRupiah(totalWeek)}</b>
      </div>

      <div class="summary-card">
        <span>Jumlah Transaksi</span>
        <b>${totalTransaction}</b>
      </div>

      <div class="summary-card">
        <span>Rata-rata Harian</span>
        <b>${formatRupiah(averageDaily)}</b>
      </div>
    </div>
  `

  const grouped = data.reduce((acc, item) => {
    if (!acc[item.date_expense]) acc[item.date_expense] = []
    acc[item.date_expense].push(item)
    return acc
  }, {})

  const html = Object.entries(grouped).map(([date, items]) => {
    const dailyTotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0)

    return `
      <div class="day-group">
        <div class="day-header">
          <div>
            <h3>${getDayName(date)}</h3>
            <span>${date}</span>
          </div>
          <b>${formatRupiah(dailyTotal)}</b>
        </div>

        ${items.map(item => `
          <div class="expense-row">
            <div>
              <b>${item.expense_name}</b>
              <span>${item.code || '-'} • Periodic ${item.periodic_date || '-'}</span>
            </div>

            <div class="expense-row-right">
              <b>${formatRupiah(item.amount)}</b>
              <div>
                <button class="edit-btn small-btn" data-edit-expense="${item.id}">Edit</button>
                <button class="danger-btn small-btn" data-delete-expense="${item.id}">Hapus</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }).join('')

  expenseList.innerHTML = html || `<p>Tidak ada expense pada periode ini.</p>`

  setupExpenseItemEvents()
}

function setupExpenseItemEvents() {
  document.querySelectorAll('[data-delete-expense]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteExpense

      const confirmDelete = confirm('Yakin hapus expense ini?')
      if (!confirmDelete) return

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) {
        alert('Gagal hapus expense: ' + error.message)
        console.error(error)
        return
      }

      alert('Expense berhasil dihapus')
      loadExpenses()
      notifyDataChanged()
    })
  })

  document.querySelectorAll('[data-edit-expense]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.editExpense

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert('Gagal ambil data expense: ' + error.message)
        return
      }

      document.querySelector('#date_expense').value = data.date_expense
      document.querySelector('#expense_name').value = data.expense_name
      document.querySelector('#code').value = data.code || ''
      document.querySelector('#amount').value = data.amount

      document.querySelector('#expenseForm').dataset.editId = id

      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  })
}

export function setupExpenseEvents() {
  const expenseForm = document.querySelector('#expenseForm')
  const loadExpense = document.querySelector('#loadExpense')
  const prevWeek = document.querySelector('#prevWeek')
  const thisWeek = document.querySelector('#thisWeek')
  const nextWeek = document.querySelector('#nextWeek')

  expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const payload = {
      date_expense: document.querySelector('#date_expense').value,
      expense_name: document.querySelector('#expense_name').value,
      code: document.querySelector('#code').value,
      amount: Number(document.querySelector('#amount').value),
    }

    const editId = expenseForm.dataset.editId

    let error

    if (editId) {
      const result = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', editId)

      error = result.error
    } else {
      const result = await supabase
        .from('expenses')
        .insert(payload)

      error = result.error
    }

    if (error) {
      alert('Gagal simpan expense: ' + error.message)
      console.error(error)
      return
    }

    alert('Expense berhasil disimpan')

    currentWeekStart = getWednesdayStart(new Date(payload.date_expense))

    expenseForm.reset()
    delete expenseForm.dataset.editId

    loadExpenses()
    notifyDataChanged()
  })

  loadExpense.addEventListener('click', loadExpenses)

  prevWeek.addEventListener('click', () => {
    currentWeekStart = addDays(currentWeekStart, -7)
    loadExpenses()
  })

  thisWeek.addEventListener('click', () => {
    currentWeekStart = getWednesdayStart(new Date())
    loadExpenses()
  })

  nextWeek.addEventListener('click', () => {
    currentWeekStart = addDays(currentWeekStart, 7)
    loadExpenses()
  })
}