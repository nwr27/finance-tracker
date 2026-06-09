export function navbar() {
  return `
    <nav class="navbar">

      <button data-page="dashboard">
        Dashboard
      </button>

      <button data-page="expense">
        Expense
      </button>

      <button data-page="weekly">
        Weekly
      </button>

      <button data-page="income">
        Income
      </button>

      <button data-page="saving">
        Saving
      </button>

    </nav>
  `
}