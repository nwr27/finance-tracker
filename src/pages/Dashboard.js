import { supabase } from '../supabase.js'
import { summaryCard } from '../components/SummaryCard.js'
import { listenDataChanged } from '../utils/events.js'
import { formatRupiah } from '../utils/format.js'

let weeklyPage = 0
const WEEKLY_PAGE_SIZE = 2

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
        <div>
          <h3>Weekly Summary</h3>
          <small>2 periode per halaman</small>
        </div>

        <div class="weekly-nav">
          <button id="weeklyPrev">←</button>
          <button id="weeklyNext">→</button>
        </div>
      </div>

      <div id="weeklySummary"></div>

    </section>

    <div id="codeStatsModal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Persentase Pengeluaran per Kode</h3>
          <button id="closeCodeStats">✕</button>
        </div>

        <div id="codeStatsContent"></div>
      </div>
    </div>
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

  const topCode = await getTopExpenseCode()

  realtimeSummary.innerHTML = `
    <div class="hero-grid">
      <div class="hero-card">
        <span>Available Balance</span>
        <b>${formatRupiah(data.realtime_balance)}</b>
      </div>

      <div class="hero-card">
        <span>Total Save (BCA)</span>
        <b>${formatRupiah(data.realtime_save - data.trading)}</b>
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

      <button id="showCodeStats" class="summary-card clickable-card code-card">
        <span>${topCode.code}</span>
        <b>${formatRupiah(topCode.total)}</b>
      </button>
    </div>
  `

  setupCodeStatsButton()
}

async function getTopExpenseCode() {
  const { data, error } = await supabase
    .from('expenses')
    .select('code, amount')

  if (error || !data || data.length === 0) {
    return {
      code: 'Code',
      total: 0,
    }
  }

  const grouped = {}

  data.forEach(item => {
    const code = item.code || 'UNKNOWN'
    grouped[code] = (grouped[code] || 0) + Number(item.amount || 0)
  })

  const sorted = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])

  return {
    code: sorted[0][0],
    total: sorted[0][1],
  }
}

function setupCodeStatsButton() {
  document
    .querySelector('#showCodeStats')
    ?.addEventListener('click', async () => {
      document
        .querySelector('#codeStatsModal')
        .classList.remove('hidden')

      await loadCodeStatistics()
    })
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

  const from = weeklyPage * WEEKLY_PAGE_SIZE
  const to = from + WEEKLY_PAGE_SIZE - 1

  const { data, error } = await supabase
    .from('periodic_summary')
    .select('*')
    .order('periodic_date', { ascending: false })
    .range(from, to)

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

  document
    .querySelector('#closeCodeStats')
    .addEventListener('click', () => {
      document
        .querySelector('#codeStatsModal')
        .classList.add('hidden')
    })
  document
    .querySelector('#weeklyPrev')
    ?.addEventListener('click', async () => {

      if (weeklyPage > 0) {
        weeklyPage--
        await loadWeeklySummary()
      }

    })

  document
    .querySelector('#weeklyNext')
    ?.addEventListener('click', async () => {

      weeklyPage++
      await loadWeeklySummary()

    })

  listenDataChanged(loadDashboard)
}

async function loadCodeStatistics() {
  const content = document.querySelector('#codeStatsContent')

  const { data, error } = await supabase
    .from('expenses')
    .select('code, amount')

  if (error) {
    content.innerHTML = `<p>${error.message}</p>`
    return
  }

  const totalExpense = data.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )

  const grouped = {}

  data.forEach(item => {
    const code = item.code || 'UNKNOWN'
    grouped[code] = (grouped[code] || 0) + Number(item.amount || 0)
  })

  const sorted = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])

  content.innerHTML = sorted.map(([code, total]) => {
    const percentage =
      totalExpense > 0
        ? ((total / totalExpense) * 100).toFixed(1)
        : '0.0'

    return `
      <div class="code-stat-row">
        <div>
          <b>${code}</b>
        </div>

        <div>
          ${formatRupiah(total)}
        </div>

        <div>
          ${percentage}%
        </div>
      </div>
    `
  }).join('')
}