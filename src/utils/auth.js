const PASSCODE = import.meta.env.VITE_APP_PASSCODE
const VIEW_PASSCODE = import.meta.env.VITE_VIEW_PASSCODE

export function isLoggedIn() {
  return localStorage.getItem('finance_passcode_ok') === 'true'
}

export function login(passcode) {
  if (passcode === PASSCODE) {
    localStorage.setItem('finance_passcode_ok', 'true')
    localStorage.setItem('finance_access_mode', 'full')
    return true
  }

  if (passcode === VIEW_PASSCODE) {
    localStorage.setItem('finance_passcode_ok', 'true')
    localStorage.setItem('finance_access_mode', 'view')
    return true
  }

  return false
}

export function logout() {
  localStorage.removeItem('finance_passcode_ok')
  localStorage.removeItem('finance_access_mode')
}

export function getAccessMode() {
  return localStorage.getItem('finance_access_mode') || 'view'
}

export function isViewOnly() {
  return getAccessMode() === 'view'
}

export function canWrite() {
  return isLoggedIn() && !isViewOnly()
}
