export const DEMO_USER = {
  id: 'cmq6lkxbf0000g6gvz1u5sah7',
  name: 'Alex',
  email: 'alex@spendwise.com',
  password: 'demo1234',
}

export function login(email: string, password: string): boolean {
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    localStorage.setItem('spendwise_user', JSON.stringify(DEMO_USER))
    return true
  }
  return false
}

export function logout() {
  localStorage.removeItem('spendwise_user')
}

export function getUser() {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem('spendwise_user')
  return data ? JSON.parse(data) : null
}

export function isLoggedIn(): boolean {
  return !!getUser()
}