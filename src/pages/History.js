import { supabase } from '../supabase.js'
import { formatRupiah } from '../utils/format.js'

export function historyView() {
  return `
    <section class="card">
      <h2>Transaction History</h2>

      <div class="filter-row">
        <input type="date" id="historyStartDate" />
        <input type="date" id="historyEndDate" />
        <select id="historyType">
          <option value="">Semua Tipe</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="saving_use">Saving Use</option>
        </select>
        <button id="loadHistory">Filter</button>
      </div>

      <div id="historyList"></div>
    </section>
  `
}

export async function loadHistory() {
  const historyList = document.querySelector('#historyList')
  const startDate = document.querySelector('#historyStartDate').value
  const endDate = document.querySelector('#historyEndDate').value
  const type = document.querySelector('#historyType').value

  let query = supabase
    .from('transaction_history')
    .select('*')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (startDate) {
    query = query.gte('transaction_date', startDate)
  }

  if (endDate) {
    query = query.lte('transaction_date', endDate)
  }

  if (type) {
    query = query.eq('transaction_type', type)
  }

  const { data, error } = await query

  if (error) {
    historyList.innerHTML = `<p>Gagal ambil history: ${error.message}</p>`
    console.error(error)
    return
  }

  historyList.innerHTML = data.map(item => `
    <div class="item">
      <b>${item.title}</b><br>
      ${item.transaction_date} | ${item.transaction_type} | ${item.category || '-'}
      <br>
      ${formatRupiah(item.amount)}
      <br>
      Periodic: ${item.periodic_date || '-'}
    </div>
  `).join('')
}

export function setupHistoryEvents() {
  document
    .querySelector('#loadHistory')
    .addEventListener('click', loadHistory)
}