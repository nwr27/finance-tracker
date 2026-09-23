import LegacyPage from './LegacyPage.jsx'
import { incomeView, loadIncomes, setupIncomeEvents } from '../legacy/pages/Income.legacy.js'
export default function Income({ currentUser }) {
  return <LegacyPage view={incomeView} setup={setupIncomeEvents} load={loadIncomes} currentUser={currentUser} />
}
