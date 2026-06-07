import { supabase } from '../supabase.js'
import { summaryCard } from '../components/SummaryCard.js'
import { listenDataChanged } from '../utils/events.js'
import { formatRupiah } from '../utils/format.js'

export function dashboardView() {
  return `
    <section class="dashboard-header">
      <h2>Dashboard</h2>
      <button id="loadRealtimeSummary">Refresh</button>
    </section>

    <section class="card">
      <h3>Ringkasan Utama</h3>
      <div id="realtimeSummary"></div>
    </section>

    <section class="card">
      <div class="section-title-row">
        <h3>Weekly Summary Terbaru</h3>
        <small>Menampilkan 4 periode terakhir</small>
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
        <span>Available Balance</span>
        <b>${formatRupiah(data.realtime_balance)}</b>
      </div>

      <div class="hero-card">
        <span>Total Save (BCA)</span>
        <b>${formatRupiah(data.realtime_save-data.trading)}</b>
      </div>

      <div class="hero-card">
        <span>Trading</span>
        <b>${formatRupiah(data.trading)}</b>
      </div>
    </div>

    <h3 class="sub-title">Saving Detail</h3>

    <div class="summary-grid">
      ${summaryCard('Nest Egg', data.nest_egg)}
      ${summaryCard('Wedding', data.wedding)}
      ${summaryCard('Umrah', data.umrah)}
      ${summaryCard('Piggy', data.piggy)}
      ${summaryCard('BCA + Trading', data.realtime_save)}
      ${summaryCard('Total Expense', data.total_expense)}
      ${summaryCard('Balance Allocation', data.total_balance_allocation)}
    </div>
  `
}

function differenceCard(value) {

  const num = Number(value || 0)

  let cls = 'diff-match'

  if (num > 0) cls = 'diff-surplus'
  if (num < 0) cls = 'diff-defisit'

  return `
    <div class="summary-card ${cls}">
      <span>Difference</span>
      <b>${formatRupiah(num)}</b>
    </div>
  `
}

async function loadWeeklySummary() {
  const weeklySummary = document.querySelector('#weeklySummary')

  const { data, error } = await supabase
    .from('periodic_summary')
    .select('*')
    .order('periodic_date', { ascending: false })
    .limit(4)

  if (error) {
    weeklySummary.innerHTML = `<p>Gagal ambil weekly summary: ${error.message}</p>`
    console.error(error)
    return
  }

  weeklySummary.innerHTML = data.map(item => `
    <div class="weekly-card">
      <div class="weekly-card-header">
        <h4>${item.periodic_date}</h4>
        <span>Periode</span>
      </div>

      <div class="weekly-grid">
        ${summaryCard('Previous Actual Balance', item.previous_real_balance)}
        ${summaryCard('Balance Allocation', item.balance_allocation)}
        ${summaryCard('Expense Usage', item.expense_usage)}
        ${summaryCard('Realtime Save', item.realtime_save)}
        ${summaryCard('Data Balance', item.data_balance)}
        ${summaryCard('Actual Balance', item.actual_real_balance)}
        ${differenceCard(item.difference)}
      </div>
    </div>
  `).join('')
}

export function setupDashboardEvents() {
  document
    .querySelector('#loadRealtimeSummary')
    .addEventListener('click', loadDashboard)

  listenDataChanged(loadDashboard)
}