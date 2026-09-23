import LegacyPage from './LegacyPage.jsx'
import { savingView, loadSavings, loadSavingUses, setupSavingEvents } from '../legacy/pages/Saving.legacy.js'
const load = async () => { await loadSavings(); await loadSavingUses() }
export default function Saving({ currentUser }) {
  return <LegacyPage view={savingView} setup={setupSavingEvents} load={load} currentUser={currentUser} />
}
