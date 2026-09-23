const NANA_PASSCODE = import.meta.env.VITE_NANA_PASSCODE
const MEYSA_PASSCODE = import.meta.env.VITE_MEYSA_PASSCODE

const USERS = {
  nana: { id: 'nana', name: 'NANA' },
  meysa: { id: 'meysa', name: 'MEYSA' },
}

export function isLoggedIn() {
  return Boolean(getCurrentUser())
}

export function login(passcode) {
  let user = null

  if (passcode === NANA_PASSCODE) user = USERS.nana
  else if (passcode === MEYSA_PASSCODE) user = USERS.meysa

  if (!user) return false

  localStorage.setItem('finance_passcode_ok', 'true')
  localStorage.setItem('finance_user', JSON.stringify(user))
  localStorage.removeItem('finance_access_mode')
  return true
}

export function logout() {
  localStorage.removeItem('finance_passcode_ok')
  localStorage.removeItem('finance_user')
  localStorage.removeItem('finance_access_mode')
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('finance_user')
    if (!raw) return null
    const user = JSON.parse(raw)
    return USERS[user?.id] || null
  } catch {
    return null
  }
}

export function getOwnerId() {
  return getCurrentUser()?.id || null
}

export function canWrite() {
  return isLoggedIn()
}
