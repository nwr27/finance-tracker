export function navbar() {
  return `
    <button id="mobileMenuHandle" class="mobile-menu-handle">
      ☰
    </button>

    <div id="mobileMenuOverlay" class="mobile-menu-overlay hidden"></div>

    <nav id="sideNavbar" class="navbar side-navbar">
      <div class="side-navbar-header">
        <h2>Finance<br>Tracker</h2>
        <button id="closeMenuBtn" class="close-menu-btn">×</button>
      </div>

      <button data-page="dashboard">Dashboard</button>
      <button data-page="expense">Expense</button>
      <button data-page="weekly">Weekly</button>
      <button data-page="income">Income</button>
      <button data-page="saving">Saving</button>

      <button id="quickAddExpense" class="quick-add-nav-btn">
        +
      </button>
    </nav>
  `
}