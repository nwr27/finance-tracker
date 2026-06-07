import './style.css'
import { navbar } from './components/Navbar.js'
import { dashboardView, loadDashboard, setupDashboardEvents } from './pages/Dashboard.js'
import { expenseView, loadExpenses, setupExpenseEvents } from './pages/Expense.js'
import { incomeView, loadIncomes, setupIncomeEvents } from './pages/Income.js'
import { weeklyView, loadWeeklyChecks, setupWeeklyEvents } from './pages/Weekly.js'
import { savingView, loadSavings, setupSavingEvents } from './pages/Saving.js'
import { historyView, loadHistory, setupHistoryEvents } from './pages/History.js'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="container">
    <h1>Finance Tracker</h1>

    ${navbar()}

    <div id="page-content"></div>
  </div>
`

const pageContent = document.querySelector('#page-content')

function showDashboard() {
  pageContent.innerHTML = dashboardView()
  setupDashboardEvents()
  loadDashboard()
}

function showExpense() {
  pageContent.innerHTML = expenseView()
  setupExpenseEvents()
  loadExpenses()
}

function showIncome() {
  pageContent.innerHTML = incomeView()
  setupIncomeEvents()
  loadIncomes()
}

function showWeekly() {
  pageContent.innerHTML = weeklyView()
  setupWeeklyEvents()
  loadWeeklyChecks()
}

function showSaving() {
  pageContent.innerHTML = savingView()
  setupSavingEvents()
  loadSavings()
}

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
function showHistory() {
  pageContent.innerHTML = historyView()
  setupHistoryEvents()
  loadHistory()
}

showDashboard()