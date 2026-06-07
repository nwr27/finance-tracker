import { formatRupiah } from '../utils/format.js'

export function summaryCard(label, value, type = 'money') {
  const displayValue = type === 'date' ? value : formatRupiah(value)

  return `
    <div class="summary-card">
      <span>${label}</span>
      <b>${displayValue}</b>
    </div>
  `
}