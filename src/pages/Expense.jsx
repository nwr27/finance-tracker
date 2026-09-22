import LegacyPage from './LegacyPage.jsx'
import { expenseView, loadExpenses, setupExpenseEvents } from '../legacy/pages/Expense.legacy.js'
export default function Expense({ quickAddToken }) {
  return <LegacyPage view={expenseView} setup={setupExpenseEvents} load={loadExpenses} quickAddToken={quickAddToken} />
}
