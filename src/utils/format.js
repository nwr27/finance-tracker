export function formatRupiah(value) {
  const number = Number(value ?? 0)
  return `Rp${Math.round(number).toLocaleString('id-ID')}`
}
