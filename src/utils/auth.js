const PASSCODE = import.meta.env.VITE_APP_PASSCODE

export function isLoggedIn() {
  return localStorage.getItem('finance_passcode_ok') === 'true'
}

export function login(passcode) {
  if (passcode === PASSCODE) {
    localStorage.setItem('finance_passcode_ok', 'true')
    return true
  }

  return false
}

export function logout() {
  localStorage.removeItem('finance_passcode_ok')
}