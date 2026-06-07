import './style.css'
import { navbar } from './components/Navbar.js'
import { dashboardView, loadDashboard, setupDashboardEvents } from './pages/Dashboard.js'
import { expenseView, loadExpenses, setupExpenseEvents } from './pages/Expense.js'
import { incomeView, loadIncomes, setupIncomeEvents } from './pages/Income.js'
import { weeklyView, loadWeeklyChecks, setupWeeklyEvents } from './pages/Weekly.js'
import { savingView, loadSavings, loadSavingUses, setupSavingEvents } from './pages/Saving.js'
import { historyView, loadHistory, setupHistoryEvents } from './pages/History.js'
import { isLoggedIn, login, logout } from './utils/auth.js'

const app = document.querySelector('#app')

function loginView() {
  return `
    <div class="container">
      <section class="card login-card">
        <h1>Finance Tracker</h1>
        <p>Masukkan passcode</p>

        <form id="loginForm">
          <input
            type="password"
            id="passcode"
            placeholder="••••"
            maxlength="4"
            inputmode="numeric"
            required
          />
        </form>

        <p id="loginError" class="login-error"></p>
      </section>
    </div>
  `
}

function getPageContent() {
  return document.querySelector('#page-content')
}

function showDashboard() {
  getPageContent().innerHTML = dashboardView()
  setupDashboardEvents()
  loadDashboard()
}

function showExpense() {
  getPageContent().innerHTML = expenseView()
  setupExpenseEvents()
  loadExpenses()
}

function showIncome() {
  getPageContent().innerHTML = incomeView()
  setupIncomeEvents()
  loadIncomes()
}

function showWeekly() {
  getPageContent().innerHTML = weeklyView()
  setupWeeklyEvents()
  loadWeeklyChecks()
}

function showSaving() {
  getPageContent().innerHTML = savingView()
  setupSavingEvents()
  loadSavings()
  loadSavingUses()
}

function showHistory() {
  getPageContent().innerHTML = historyView()
  setupHistoryEvents()
  loadHistory()
}

function setupRoutes() {
  const routes = {
    dashboard: showDashboard,
    expense: showExpense,
    income: showIncome,
    saving: showSaving,
    weekly: showWeekly,
    history: showHistory,
  }

  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page
      routes[page]()
    })
  })
}

function renderApp() {
  app.innerHTML = `
    <div class="container">
      <div class="app-header">
        <h1>Finance Tracker</h1>
        <button id="logoutBtn">Logout</button>
      </div>

      ${navbar()}

      <div id="page-content"></div>
    </div>
  `

  document.querySelector('#logoutBtn').addEventListener('click', () => {
    logout()
    renderLogin()
  })

  setupRoutes()
  showDashboard()
}

function renderLogin() {
  app.innerHTML = loginView()

  const passcodeInput = document.querySelector('#passcode')

  passcodeInput.focus()

  passcodeInput.addEventListener('input', () => {

    const passcode = passcodeInput.value

    if (passcode.length < 4) return

    const ok = login(passcode)

    if (!ok) {
      document.querySelector('#loginError').textContent =
        'Passcode salah'

      passcodeInput.value = ''

      setTimeout(() => {
        document.querySelector('#loginError').textContent = ''
      }, 1500)

      return
    }

    renderApp()
  })
}

if (isLoggedIn()) {
  renderApp()
} else {
  renderLogin()
}