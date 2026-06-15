import { ref, watchEffect } from 'vue'

const THEME_KEY = 'jxufe-theme'

const isClient = typeof window !== 'undefined'

function getStoredTheme(): 'light' | 'dark' | null {
  if (!isClient) return null
  return localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null
}

function getSystemTheme(): 'light' | 'dark' {
  if (!isClient) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(t: 'light' | 'dark') {
  if (isClient) {
    document.documentElement.classList.toggle('dark', t === 'dark')
  }
}

// 首次加载：localStorage > 系统偏好 > light
const theme = ref<'light' | 'dark'>(
  getStoredTheme() ?? getSystemTheme()
)

applyTheme(theme.value)

// 客户端：监听系统偏好变化
if (isClient) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      theme.value = e.matches ? 'dark' : 'light'
    }
  })
}

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watchEffect(() => {
    if (isClient) {
      localStorage.setItem(THEME_KEY, theme.value)
    }
    applyTheme(theme.value)
  })

  return { theme, toggleTheme }
}
