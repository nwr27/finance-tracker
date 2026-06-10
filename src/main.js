import './style.css'
import { navbar } from './components/Navbar.js'
import { dashboardView, loadDashboard, setupDashboardEvents } from './pages/Dashboard.js'
import { expenseView, loadExpenses, setupExpenseEvents } from './pages/Expense.js'
import { incomeView, loadIncomes, setupIncomeEvents } from './pages/Income.js'
import { weeklyView, loadWeeklyChecks, setupWeeklyEvents } from './pages/Weekly.js'
import { savingView, loadSavings, loadSavingUses, setupSavingEvents } from './pages/Saving.js'
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

function setupRoutes() {
  const routes = {
    dashboard: showDashboard,
    expense: showExpense,
    income: showIncome,
    saving: showSaving,
    weekly: showWeekly,
  }

  const sideNavbar = document.querySelector('#sideNavbar')
  const menuHandle = document.querySelector('#mobileMenuHandle')
  const overlay = document.querySelector('#mobileMenuOverlay')
  const closeMenuBtn = document.querySelector('#closeMenuBtn')

  function openMenu() {
    sideNavbar.classList.add('open')
    overlay.classList.remove('hidden')
  }

  function closeMenu() {
    sideNavbar.classList.remove('open')
    overlay.classList.add('hidden')
  }

  const savedBottom = localStorage.getItem('menuHandleBottom')

  if (savedBottom) {
    menuHandle.style.bottom = `${savedBottom}%`
    menuHandle.dataset.bottom = savedBottom
  } else {
    menuHandle.style.bottom = '25%'
    menuHandle.dataset.bottom = '25'
  }

  let isPointerDown = false
  let isDragging = false
  let startY = 0
  let startBottom = 25

  menuHandle.addEventListener('pointerdown', (e) => {
    isPointerDown = true
    isDragging = false
    startY = e.clientY
    startBottom = Number(menuHandle.dataset.bottom || 25)

    menuHandle.setPointerCapture(e.pointerId)
  })

  menuHandle.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return

    const deltaY = startY - e.clientY

    if (Math.abs(deltaY) > 6) {
      isDragging = true
    }

    if (!isDragging) return

    const vh = window.innerHeight

    let newBottom = startBottom + (deltaY / vh) * 100
    newBottom = Math.max(6, Math.min(80, newBottom))

    menuHandle.style.bottom = `${newBottom}%`
    menuHandle.dataset.bottom = String(newBottom)
  })

  menuHandle.addEventListener('pointerup', () => {
    if (isDragging) {
      localStorage.setItem(
        'menuHandleBottom',
        menuHandle.dataset.bottom || '25'
      )
    } else {
      openMenu()
    }

    isPointerDown = false
    isDragging = false
  })

  overlay.addEventListener('click', closeMenu)
  closeMenuBtn.addEventListener('click', closeMenu)

  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('[data-page]')
        .forEach(item => item.classList.remove('active'))

      btn.classList.add('active')

      const page = btn.dataset.page
      routes[page]()

      closeMenu()
    })
  })
  document
    .querySelector('#quickAddExpense')
    ?.addEventListener('click', () => {

      closeMenu()

      showExpense()

      setTimeout(() => {

        document
          .querySelector('#toggleExpenseForm')
          ?.click()

      }, 100)

    })
}

function renderApp() {
  app.innerHTML = `
  <div class="container">
    ${navbar()}
    <div id="page-content"></div>
  </div>
`

  setupRoutes()
  document
    .querySelector('[data-page="dashboard"]')
    ?.classList.add('active')

  app.addEventListener('logout-request', () => {
    logout()
    renderLogin()
  })

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