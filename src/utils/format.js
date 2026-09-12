import { isViewOnly } from './auth.js'

export function formatRupiah(value) {
  if (isViewOnly()) return '****'

  return `Rp${Number(value || 0).toLocaleString('id-ID')}`
}
