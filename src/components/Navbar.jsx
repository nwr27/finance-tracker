import { useRef, useState } from 'react'
import styles from './Navbar.module.css'

const items = [
  ['dashboard', 'Dashboard'],
  ['expense', 'Expense'],
  ['weekly', 'Weekly'],
  ['income', 'Income'],
  ['saving', 'Saving'],
]

export default function Navbar({ page, onNavigate, onQuickExpense, viewOnly }) {
  const [open, setOpen] = useState(false)
  const handleRef = useRef(null)
  const drag = useRef({ down: false, moved: false, startY: 0, startBottom: 25 })

  function pointerDown(e) {
    const saved = Number(localStorage.getItem('menuHandleBottom') || 25)
    drag.current = { down: true, moved: false, startY: e.clientY, startBottom: saved }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function pointerMove(e) {
    if (!drag.current.down) return
    const deltaY = drag.current.startY - e.clientY
    if (Math.abs(deltaY) > 6) drag.current.moved = true
    if (!drag.current.moved) return
    const next = Math.max(6, Math.min(80, drag.current.startBottom + (deltaY / window.innerHeight) * 100))
    handleRef.current.style.bottom = `${next}%`
    handleRef.current.dataset.bottom = String(next)
  }

  function pointerUp() {
    if (drag.current.moved) {
      localStorage.setItem('menuHandleBottom', handleRef.current.dataset.bottom || '25')
    } else {
      setOpen(true)
    }
    drag.current.down = false
  }

  function navigate(next) {
    onNavigate(next)
    setOpen(false)
  }

  const savedBottom = localStorage.getItem('menuHandleBottom') || '25'

  return (
    <>
      <button
        ref={handleRef}
        className={styles.handle}
        style={{ bottom: `${savedBottom}%` }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        aria-label="Buka menu"
      >☰</button>

      <div
        className={`${styles.overlay} ${open ? '' : styles.overlayHidden}`}
        onClick={() => setOpen(false)}
      />

      <nav className={`${styles.navbar} ${open ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2>Finance<br />Tracker</h2>
          <button className={styles.close} onClick={() => setOpen(false)}>×</button>
        </div>

        {items.map(([key, label]) => (
          <button
            key={key}
            className={page === key ? styles.active : ''}
            onClick={() => navigate(key)}
          >{label}</button>
        ))}

        {!viewOnly && (
          <button className={styles.quickAdd} onClick={() => { setOpen(false); onQuickExpense() }}>+</button>
        )}
      </nav>
    </>
  )
}
