import LegacyPage from './LegacyPage.jsx'
import { weeklyView, loadWeeklyChecks, setupWeeklyEvents } from '../legacy/pages/Weekly.legacy.js'
export default function Weekly() {
  return <LegacyPage view={weeklyView} setup={setupWeeklyEvents} load={loadWeeklyChecks} />
}
