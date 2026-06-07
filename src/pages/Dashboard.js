import { supabase } from '../supabase.js'
import { summaryCard } from '../components/SummaryCard.js'
import { listenDataChanged } from '../utils/events.js'

export function dashboardView() {
  return `
    <section class="card">
      <h2>Realtime Summary</h2>

      <div class="top-actions">
        <button id="loadRealtimeSummary">Refresh Realtime</button>
      </div>

      <div id="realtimeSummary"></div>
    </section>

    <section class="card">
      <h2>Weekly Summary</h2>

      <div class="top-actions">
        <button id="loadWeeklySummary">Refresh Weekly</button>
      </div>

      <div id="weeklySummary"></div>
    </section>
  `
}

export async function loadDashboard() {
  await loadRealtimeSummary()
  await loadWeeklySummary()
}

async function loadRealtimeSummary() {
  const realtimeSummary = document.querySelector('#realtimeSummary')

  const { data, error } = await supabase
    .from('realtime_summary')
    .select('*')
    .single()

  if (error) {
    realtimeSummary.innerHTML = `<p>Gagal ambil realtime summary: ${error.message}</p>`
    console.error(error)
    return
  }

  realtimeSummary.innerHTML = `
    <div class="hero-grid">
      <div class="hero-card">
        <span>Balance Saat Ini</span>
        <b>Rp${Number(data.realtime_balance || 0).toLocaleString('id-ID')}</b>
      </div>

      <div class="hero-card">
        <span>Total Save</span>
        <b>Rp${Number(data.realtime_save || 0).toLocaleString('id-ID')}</b>
      </div>

      <div class="hero-card">
        <span>Trading</span>
        <b>Rp${Number(data.trading || 0).toLocaleString('id-ID')}</b>
      </div>
    </div>

    <h3>Saving Detail</h3>

    <div class="summary-grid">
      ${summaryCard('Nest Egg', data.nest_egg)}
      ${summaryCard('Wedding', data.wedding)}
      ${summaryCard('Umrah', data.umrah)}
      ${summaryCard('Piggy', data.piggy)}
      ${summaryCard('Total Expense', data.total_expense)}
      ${summaryCard('Balance Allocation', data.total_balance_allocation)}
    </div>
  `
}

async function loadWeeklySummary() {
  const weeklySummary = document.querySelector('#weeklySummary')

  const { data, error } = await supabase
    .from('weekly_summary')
    .select('*')
    .order('periodic_date', { ascending: false })

  if (error) {
    weeklySummary.innerHTML = `<p>Gagal ambil weekly summary: ${error.message}</p>`
    console.error(error)
    return
  }

  weeklySummary.innerHTML = data.map(item => `
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
  document
    .querySelector('#loadRealtimeSummary')
    .addEventListener('click', loadRealtimeSummary)

  document
    .querySelector('#loadWeeklySummary')
    .addEventListener('click', loadWeeklySummary)
  listenDataChanged(loadDashboard)
}