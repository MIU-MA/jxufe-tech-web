const ADMIN_TOKEN_KEY = 'admin_token'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function adminLogout(message = '登录已过期，请重新登录'): void {
  if (!isBrowser()) return
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  sessionStorage.setItem('admin-logout-msg', message)
  window.location.reload()
}

export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(path, init)
  if (res.status === 401) {
    adminLogout()
    throw new Error('登录已过期，请重新登录')
  }
  return res
}

export function decodeJwtExp(token: string): number | null {
  try {
    const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/')
    if (!base64) return null
    const payload = JSON.parse(atob(base64))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}
