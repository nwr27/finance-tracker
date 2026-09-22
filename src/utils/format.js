import { isViewOnly } from './auth.js'

export function formatRupiah(value) {
  if (isViewOnly()) return '****'

  const number = Number(value ?? 0)
  return `Rp${Math.round(number).toLocaleString('id-ID')}`
}
