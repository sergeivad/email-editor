import { useEffect, useRef } from 'react'
import './App.css'
import { EmailEditor } from './components/editor/EmailEditor'

function App() {
  const headerRef = useRef<HTMLElement | null>(null)

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

  return (
    <div className="app-shell">
      <header className="app-header" ref={headerRef}>
        <div className="app-header__brand">
          <h1 className="app-header__title">EMAIL BUILDER</h1>
          <p className="app-header__subtitle">Визуальный редактор EMAIL писем</p>
        </div>
      </header>
      <main className="app-main">
        <section className="app-main__body">
          <EmailEditor />
        </section>
      </main>
    </div>
  )
}

export default App
