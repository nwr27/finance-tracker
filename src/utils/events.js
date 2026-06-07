export function notifyDataChanged() {
  window.dispatchEvent(new Event('finance:data-changed'))
}

export function listenDataChanged(callback) {
  window.addEventListener('finance:data-changed', callback)
}