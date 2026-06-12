import { useI18n } from 'vue-i18n'

type SupportedLocale = 'zh' | 'en'

const isClient = typeof window !== 'undefined'

export function useLocale() {
  const { locale } = useI18n()

  const setLocale = (l: SupportedLocale) => {
    locale.value = l
    if (isClient) {
      localStorage.setItem('locale', l)
      document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en'
    }
  }

  const toggleLocale = () => {
    setLocale(locale.value === 'zh' ? 'en' : 'zh')
  }

  return { locale, setLocale, toggleLocale }
}

export function getInitialLocale(): SupportedLocale {
  if (!isClient) return 'zh'
  const saved = localStorage.getItem('locale') as SupportedLocale | null
  if (saved === 'zh' || saved === 'en') return saved
  return navigator.language.startsWith('en') ? 'en' : 'zh'
}
