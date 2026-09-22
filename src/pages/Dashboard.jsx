import LegacyPage from './LegacyPage.jsx'
import { dashboardView, loadDashboard, setupDashboardEvents } from '../legacy/pages/Dashboard.legacy.js'
export default function Dashboard() {
  return <LegacyPage view={dashboardView} setup={setupDashboardEvents} load={loadDashboard} />
}
