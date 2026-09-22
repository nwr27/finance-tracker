function parseLocalDate(value) {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Siklus finance: Kamis -> Rabu. Semua transaksi dipetakan ke Rabu penutup periode.
export function getPeriodEndWednesday(value) {
  const date = parseLocalDate(value)
  const day = date.getDay() // 0 Minggu ... 3 Rabu
  const daysUntilWednesday = (3 - day + 7) % 7
  date.setDate(date.getDate() + daysUntilWednesday)
  return formatLocalDate(date)
}

// Weekly check adalah audit penutupan, jadi di luar hari Rabu default ke Rabu yang SUDAH selesai.
export function getLatestCompletedWednesday(value = new Date()) {
  const date = parseLocalDate(value)
  const day = date.getDay()
  const daysSinceWednesday = (day - 3 + 7) % 7
  date.setDate(date.getDate() - daysSinceWednesday)
  return formatLocalDate(date)
}

export function isWednesday(value) {
  return parseLocalDate(value).getDay() === 3
}
