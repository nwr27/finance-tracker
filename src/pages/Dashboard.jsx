import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { formatRupiah } from '../utils/format.js'
import styles from './Dashboard.module.css'

function SummaryCard({ label, value, className = '' }) {
  return (
    <div className={`${styles.summaryCard} ${className}`}>
      <span>{label}</span>
      <b>{value === null || value === undefined ? '-' : formatRupiah(value)}</b>
    </div>
  )
}

function DifferenceCard({ value, actualValue }) {
  const hasActual = actualValue !== null && actualValue !== undefined
  if (!hasActual) return <SummaryCard label="Difference" value={null} className={styles.diffPending} />
  const number = Number(value ?? 0)
  const stateClass = number > 0 ? styles.diffSurplus : number < 0 ? styles.diffDefisit : styles.diffMatch
  return <SummaryCard label="Difference" value={number} className={stateClass} />
}

export default function Dashboard({ onLogout }) {
  const [summary, setSummary] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [weeklyOffset, setWeeklyOffset] = useState(0)
  const [topCode, setTopCode] = useState({ code: 'Code', total: 0 })
  const [codeStats, setCodeStats] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [weeklyError, setWeeklyError] = useState('')

  const loadRealtimeSummary = useCallback(async () => {
    setSummaryError('')
    const [{ data, error }, expensesResult] = await Promise.all([
      supabase.from('realtime_summary').select('*').single(),
      supabase.from('expenses').select('code, amount'),
    ])

    if (error) {
      console.error(error)
      setSummaryError(`Gagal ambil realtime summary: ${error.message}`)
      return
    }

    setSummary(data)
    const expenses = expensesResult.data || []
    const grouped = expenses.reduce((acc, item) => {
      const code = item.code || 'UNKNOWN'
      acc[code] = (acc[code] || 0) + Number(item.amount || 0)
      return acc
    }, {})
    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1])
    setTopCode(sorted.length ? { code: sorted[0][0], total: sorted[0][1] } : { code: 'Code', total: 0 })
  }, [])

  const loadWeeklySummary = useCallback(async () => {
    setWeeklyError('')
    const { data, error } = await supabase
      .from('periodic_summary')
      .select('*')
      .order('periodic_date', { ascending: false })
      .range(weeklyOffset, weeklyOffset)

    if (error) {
      console.error(error)
      setWeeklyError(`Gagal ambil weekly summary: ${error.message}`)
      return
    }
    setWeekly(data?.[0] || null)
  }, [weeklyOffset])

  const refresh = useCallback(async () => {
    await Promise.all([loadRealtimeSummary(), loadWeeklySummary()])
  }, [loadRealtimeSummary, loadWeeklySummary])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const handleDataChanged = () => refresh()
    window.addEventListener('finance:data-changed', handleDataChanged)
    return () => window.removeEventListener('finance:data-changed', handleDataChanged)
  }, [refresh])

  async function openCodeStats() {
    setModalOpen(true)
    const { data, error } = await supabase.from('expenses').select('code, amount')
    if (error) {
      setCodeStats([{ code: 'ERROR', total: 0, percentage: error.message }])
      return
    }
    const totalExpense = (data || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const grouped = (data || []).reduce((acc, item) => {
      const code = item.code || 'UNKNOWN'
      acc[code] = (acc[code] || 0) + Number(item.amount || 0)
      return acc
    }, {})
    setCodeStats(Object.entries(grouped).sort((a, b) => b[1] - a[1]).map(([code, total]) => ({
      code,
      total,
      percentage: totalExpense > 0 ? `${((total / totalExpense) * 100).toFixed(1)}%` : '0.0%',
    })))
  }

  return (
    <main className={styles.page}>
      <section className={styles.dashboardHeader}><h2>Finance Tracker</h2></section>

      <section className={styles.card}>
        <div className={`${styles.sectionTitleRow} ${styles.dashboardMainTitle}`}>
          <h3>Ringkasan Utama</h3>
          <div className={styles.dashboardActions}>
            <button onClick={refresh}>Refresh</button>
            <button onClick={onLogout}>Logout</button>
          </div>
        </div>

        {summaryError && <p>{summaryError}</p>}
        {summary && <>
          <div className={styles.heroGrid}>
            <div className={styles.heroCard}><span>Available Balance</span><b>{formatRupiah(summary.realtime_balance)}</b></div>
            <div className={styles.heroCard}><span>Total Save (BCA)</span><b>{formatRupiah(summary.realtime_save - summary.trading)}</b></div>
            <div className={styles.heroCard}><span>Trading</span><b>{formatRupiah(summary.trading)}</b></div>
          </div>

          <h3 className={styles.subTitle}>Saving Detail</h3>
          <div className={styles.summaryGrid}>
            <SummaryCard label="Nest Egg" value={summary.nest_egg} />
            <SummaryCard label="Wedding" value={summary.wedding} />
            <SummaryCard label="Umrah" value={summary.umrah} />
            <SummaryCard label="Piggy" value={summary.piggy} />
            <SummaryCard label="BCA + Trading" value={summary.realtime_save} />
            <SummaryCard label="Total Expense" value={summary.total_expense} />
            <SummaryCard label="Balance Allocation" value={summary.total_balance_allocation} />
            <button className={`${styles.summaryCard} ${styles.clickableCard}`} onClick={openCodeStats}>
              <span>{topCode.code}</span><b>{formatRupiah(topCode.total)}</b>
            </button>
          </div>
        </>}
      </section>

      <section className={`${styles.card} ${styles.weeklySummaryCard}`}>
        <div className={styles.sectionTitleRow}>
          <h3>Weekly Summary</h3>
          <div className={styles.weeklyNav}>
            <button onClick={() => setWeeklyOffset(v => Math.max(0, v - 1))} disabled={weeklyOffset === 0}>↑</button>
            <button onClick={() => setWeeklyOffset(v => v + 1)}>↓</button>
          </div>
        </div>
        {weeklyError && <p>{weeklyError}</p>}
        {!weeklyError && !weekly && <p>Belum ada data weekly summary.</p>}
        {weekly && <div className={styles.weeklyCard}>
          <div className={styles.weeklyCardHeader}><h4>{weekly.periodic_date}</h4><span>Periode</span></div>
          <div className={styles.weeklyGrid}>
            <SummaryCard label="Previous Actual Balance" value={weekly.previous_real_balance} />
            <SummaryCard label="Balance Allocation" value={weekly.balance_allocation} />
            <SummaryCard label="Expense Usage" value={weekly.expense_usage} />
            <SummaryCard label="Realtime Save" value={weekly.realtime_save} />
            <SummaryCard label="Data Balance" value={weekly.data_balance} />
            <SummaryCard label="Actual Balance" value={weekly.actual_real_balance} />
            <DifferenceCard value={weekly.difference} actualValue={weekly.actual_real_balance} />
          </div>
        </div>}
      </section>

      {modalOpen && <div className={styles.modal} onMouseDown={e => e.target === e.currentTarget && setModalOpen(false)}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}><h3>Persentase Pengeluaran per Kode</h3><button onClick={() => setModalOpen(false)}>✕</button></div>
          {codeStats.map(item => <div className={styles.codeStatRow} key={item.code}>
            <div><b>{item.code}</b></div><div>{formatRupiah(item.total)}</div><div>{item.percentage}</div>
          </div>)}
        </div>
      </div>}
    </main>
  )
}
