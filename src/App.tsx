import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { EmailEditor } from './components/editor/EmailEditor'
import { ThemeToggle } from './components/ui/ThemeToggle'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'wysiwyg-email-theme'

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const updateHeaderHeight = () => {
      const header = headerRef.current
      if (!header) {
        return
      }

      const height = header.getBoundingClientRect().height
      document.documentElement.style.setProperty('--app-header-height', `${height}px`)
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)

    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
    }
  }, [])

  const themeLabel = useMemo(() => (theme === 'light' ? 'Светлая тема' : 'Темная тема'), [theme])

  return (
    <div className="app-shell">
      <header className="app-header" ref={headerRef}>
        <div className="app-header__brand">
          <h1 className="app-header__title">EMAIL BUILDER</h1>
          <p className="app-header__subtitle">Визуальный редактор EMAIL писем</p>
        </div>
        <div className="app-header__actions">
          <ThemeToggle
            theme={theme}
            label={themeLabel}
            onToggle={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
          />
        </div>
      </header>
      <main className="app-main">
        <section className="app-main__body">
          <EmailEditor theme={theme} />
        </section>
      </main>
    </div>
  )
}

export default App
