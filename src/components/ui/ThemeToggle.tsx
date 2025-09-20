import type { FC } from 'react'
import clsx from 'clsx'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  label?: string
  onToggle: () => void
}

export const ThemeToggle: FC<ThemeToggleProps> = ({ theme, label, onToggle }) => {
  return (
    <button
      type="button"
      className={clsx('theme-toggle')}
      aria-label={label ?? 'Переключение темы'}
      onClick={onToggle}
    >
      <span>{theme === 'light' ? 'Светлая' : 'Темная'}</span>
    </button>
  )
}
