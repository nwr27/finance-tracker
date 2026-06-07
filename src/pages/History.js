import { supabase } from '../supabase.js'
import { formatRupiah } from '../utils/format.js'

export function historyView() {
  return `
    <section class="card">
      <h2>Transaction History</h2>
      <button id="loadHistory">Refresh History</button>
      <div id="historyList"></div>
    </section>
  `
}

export async function loadHistory() {
  const historyList = document.querySelector('#historyList')

  const { data, error } = await supabase
    .from('transaction_history')
    .select('*')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

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