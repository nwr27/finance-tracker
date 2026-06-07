import { supabase } from '../supabase.js'
import { summaryCard } from '../components/SummaryCard.js'

export function dashboardView() {
  return `
    <section class="card">
      <h2>Dashboard Summary</h2>

      <div class="top-actions">
        <button id="loadSummary">Refresh Summary</button>
      </div>

      <div id="summaryList"></div>
    </section>
  `
}

export async function loadDashboard() {
  const summaryList = document.querySelector('#summaryList')

  const { data, error } = await supabase
    .from('weekly_summary')
    .select('*')
    .order('periodic_date', { ascending: false })

  if (error) {
    summaryList.innerHTML = `<p>Gagal ambil summary: ${error.message}</p>`
    console.error(error)
    return
  }

  summaryList.innerHTML = data.map(item => `
    <div class="summary-grid">
      ${summaryCard('Periode', item.periodic_date, 'date')}
      ${summaryCard('Real Balance', item.real_balance)}
      ${summaryCard('Expense Usage', item.expense_usage)}
      ${summaryCard('Balance Allocation', item.balance_allocation)}
      ${summaryCard('Realtime Balance', item.realtime_balance)}
      ${summaryCard('Realtime Save', item.realtime_save)}
      ${summaryCard('Nest Egg', item.nest_egg)}
      ${summaryCard('Wedding', item.wedding)}
      ${summaryCard('Umrah', item.umrah)}
      ${summaryCard('Piggy', item.piggy)}
      ${summaryCard('Trading', item.trading)}
    </div>
  `).join('')
}

export function setupDashboardEvents() {
  document.querySelector('#loadSummary').addEventListener('click', loadDashboard)
}