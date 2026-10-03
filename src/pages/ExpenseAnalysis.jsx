import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase.js'
import { canWrite, getOwnerId } from '../utils/auth.js'
import { notifyDataChanged } from '../utils/events.js'
import { getPeriodEndWednesday } from '../utils/period.js'
import { formatRupiah } from '../utils/format.js'
import styles from './ExpenseAnalysis.module.css'

function normalizeCode(code) {
  return String(code || 'UNKNOWN').trim().toUpperCase()
}

function getClassification(code) {
  const normalized = normalizeCode(code)
  if (normalized === 'NMI') return 'nmi'
  if (normalized === 'FM') return 'fm'
  return 'personal'
}

function classificationLabel(value) {
  if (value === 'nmi') return 'NMI · Dana Talang'
  if (value === 'fm') return 'FM · Keluarga'
  if (value === 'personal') return 'Biaya Pribadi'
  return 'Semua Pengeluaran'
}

export default function ExpenseAnalysis() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [classification, setClassification] = useState('all')
  const [code, setCode] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadExpenses = useCallback(async () => {
    const ownerId = getOwnerId()
    if (!ownerId) return
    setLoading(true)
    setError('')
    const { data, error: queryError } = await supabase
      .from('expenses')
      .select('id,date_expense,expense_name,code,amount,periodic_date,created_at')
      .eq('owner_id', ownerId)
      .order('date_expense', { ascending: false })
      .order('created_at', { ascending: false })

    if (queryError) {
      setError(queryError.message)
      setExpenses([])
    } else {
      setExpenses(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadExpenses() }, [loadExpenses])
  useEffect(() => {
    const handler = () => loadExpenses()
    window.addEventListener('finance:data-changed', handler)
    return () => window.removeEventListener('finance:data-changed', handler)
  }, [loadExpenses])

  const codes = useMemo(() => [...new Set(expenses.map(item => normalizeCode(item.code)))].sort(), [expenses])

  const filtered = useMemo(() => expenses.filter(item => {
    const itemCode = normalizeCode(item.code)
    if (classification !== 'all' && getClassification(itemCode) !== classification) return false
    if (code !== 'all' && itemCode !== code) return false
    if (startDate && item.date_expense < startDate) return false
    if (endDate && item.date_expense > endDate) return false
    return true
  }), [expenses, classification, code, startDate, endDate])

  const stats = useMemo(() => {
    const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const nmi = filtered.filter(item => getClassification(item.code) === 'nmi').reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const fm = filtered.filter(item => getClassification(item.code) === 'fm').reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const personal = filtered.filter(item => getClassification(item.code) === 'personal').reduce((sum, item) => sum + Number(item.amount || 0), 0)
    return { total, nmi, fm, personal }
  }, [filtered])

  function chooseClassification(next) {
    setClassification(next)
    if (next === 'nmi') setCode('NMI')
    else if (next === 'fm') setCode('FM')
    else setCode('all')
  }


  function openEdit(item) {
    setEditing({
      id: item.id,
      date_expense: item.date_expense,
      expense_name: item.expense_name,
      code: normalizeCode(item.code),
      amount: item.amount,
    })
  }

  async function saveEdit(event) {
    event.preventDefault()
    if (!editing || !canWrite()) return
    setSaving(true)
    setError('')
    const { error: updateError } = await supabase
      .from('expenses')
      .update({
        date_expense: editing.date_expense,
        expense_name: editing.expense_name.trim(),
        code: normalizeCode(editing.code),
        amount: Number(editing.amount),
        periodic_date: getPeriodEndWednesday(editing.date_expense),
      })
      .eq('id', editing.id)
      .eq('owner_id', getOwnerId())

    setSaving(false)
    if (updateError) {
      setError(`Gagal update expense: ${updateError.message}`)
      return
    }
    setEditing(null)
    await loadExpenses()
    notifyDataChanged()
  }

  function resetFilters() {
    setClassification('all')
    setCode('all')
    setStartDate('')
    setEndDate('')
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div><h2>Analisis Expense</h2><p>Telusuri dana talang NMI, biaya keluarga, dan biaya pribadi.</p></div>
        <button onClick={loadExpenses}>Refresh</button>
      </div>

      <section className={styles.heroGrid}>
        <button className={`${styles.heroCard} ${classification === 'personal' ? styles.active : ''}`} onClick={() => chooseClassification('personal')}>
          <span>Biaya Saya</span><b>{formatRupiah(stats.personal)}</b><small>Selain NMI dan FM</small>
        </button>
        <button className={`${styles.heroCard} ${classification === 'nmi' ? styles.active : ''}`} onClick={() => chooseClassification('nmi')}>
          <span>Dana Talang NMI</span><b>{formatRupiah(stats.nmi)}</b><small>Expense dengan kode NMI</small>
        </button>
        <button className={`${styles.heroCard} ${classification === 'fm' ? styles.active : ''}`} onClick={() => chooseClassification('fm')}>
          <span>Biaya Keluarga</span><b>{formatRupiah(stats.fm)}</b><small>Expense dengan kode FM</small>
        </button>
        <button className={`${styles.heroCard} ${classification === 'all' ? styles.active : ''}`} onClick={() => chooseClassification('all')}>
          <span>Total Pengeluaran</span><b>{formatRupiah(stats.total)}</b><small>Seluruh expense pada filter</small>
        </button>
      </section>

      <section className={styles.card}>
        <div className={styles.filterHeader}><h3>Filter Transaksi</h3><button className={styles.secondary} onClick={resetFilters}>Reset</button></div>
        <div className={styles.filters}>
          <label>Klasifikasi<select value={classification} onChange={e => chooseClassification(e.target.value)}>
            <option value="all">Semua</option><option value="nmi">NMI · Dana Talang</option><option value="fm">FM · Keluarga</option><option value="personal">Biaya Pribadi</option>
          </select></label>
          <label>Kode<select value={code} onChange={e => setCode(e.target.value)}>
            <option value="all">Semua kode</option>{codes.map(item => <option key={item} value={item}>{item}</option>)}
          </select></label>
          <label>Dari<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
          <label>Sampai<input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.resultHeader}><div><h3>{classificationLabel(classification)}</h3><span>{filtered.length} transaksi</span></div><b>{formatRupiah(stats.total)}</b></div>
        {loading && <p>Memuat transaksi...</p>}
        {error && <p className={styles.error}>Gagal mengambil data: {error}</p>}
        {!loading && !error && filtered.length === 0 && <div className={styles.empty}>Tidak ada transaksi sesuai filter.</div>}
        <div className={styles.list}>
          {filtered.map(item => <div className={styles.row} key={item.id}>
            <div className={styles.date}>{new Date(`${item.date_expense}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div className={styles.main}><b>{item.expense_name}</b><span>{classificationLabel(getClassification(item.code))}</span></div>
            <span className={styles.code}>{normalizeCode(item.code)}</span>
            <b className={styles.amount}>{formatRupiah(item.amount)}</b>
            <button className={styles.editButton} onClick={() => openEdit(item)}>Edit</button>
          </div>)}
        </div>
      </section>

      {editing && <div className={styles.modalBackdrop} onMouseDown={e => e.target === e.currentTarget && setEditing(null)}>
        <form className={styles.editModal} onSubmit={saveEdit}>
          <div className={styles.modalHeader}><div><h3>Edit Expense</h3><span>Perubahan disimpan tanpa meninggalkan halaman Analisis.</span></div><button type="button" className={styles.closeButton} onClick={() => setEditing(null)}>✕</button></div>
          <label>Tanggal<input type="date" required value={editing.date_expense} onChange={e => setEditing(v => ({ ...v, date_expense: e.target.value }))} /></label>
          <label>Nama Pengeluaran<input type="text" required value={editing.expense_name} onChange={e => setEditing(v => ({ ...v, expense_name: e.target.value }))} /></label>
          <label>Kode<input type="text" required value={editing.code} onChange={e => setEditing(v => ({ ...v, code: e.target.value.toUpperCase() }))} /></label>
          <label>Nominal<input type="number" min="0" required value={editing.amount} onChange={e => setEditing(v => ({ ...v, amount: e.target.value }))} /></label>
          <div className={styles.modalActions}><button type="button" className={styles.secondary} onClick={() => setEditing(null)}>Batal</button><button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button></div>
        </form>
      </div>}
    </main>
  )
}
