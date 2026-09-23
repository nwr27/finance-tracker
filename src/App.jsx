import { useState } from 'react'
import styles from './App.module.css'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Expense from './pages/Expense.jsx'
import Income from './pages/Income.jsx'
import Saving from './pages/Saving.jsx'
import Weekly from './pages/Weekly.jsx'
import { getCurrentUser, isLoggedIn, login, logout } from './utils/auth.js'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())
  const [page, setPage] = useState('dashboard')
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [error, setError] = useState('')
  const [quickAddToken, setQuickAddToken] = useState(0)

  function handlePasscode(e) {
    const value = e.target.value
    if (value.length < 4) return
    if (!login(value)) {
      setError('Passcode salah')
      e.target.value = ''
      setTimeout(() => setError(''), 1500)
      return
    }
    setCurrentUser(getCurrentUser())
    setLoggedIn(true)
  }

  function handleLogout() {
    logout()
    setCurrentUser(null)
    setLoggedIn(false)
    setPage('dashboard')
  }

  if (!loggedIn) {
    return (
      <div className={styles.loginShell}>
        <section className={styles.loginCard}>
          <h1>Finance Tracker</h1>
          <p>Masukkan passcode</p>
          <input autoFocus type="password" placeholder="••••" maxLength="4" inputMode="numeric" onInput={handlePasscode} />
          <p className={styles.loginError}>{error}</p>
        </section>
      </div>
    )
  }

  const pages = {
    dashboard: <Dashboard onLogout={handleLogout} />,
    expense: <Expense quickAddToken={quickAddToken} />,
    income: <Income />,
    saving: <Saving />,
    weekly: <Weekly />,
  }

  return (
    <div className={styles.appContainer}>
      <Navbar
        page={page}
        currentUser={currentUser}
        onNavigate={setPage}
        onQuickExpense={() => { setPage('expense'); setQuickAddToken(v => v + 1) }}
      />
      {pages[page]}
    </div>
  )
}
