import type { FC } from 'react'
import './EmailEditor.css'

interface HtmlViewProps {
  value: string
  onChange: (value: string) => void
  onCopy: () => void
  onApply: () => void
  copyStatus?: 'idle' | 'copied'
}

export const HtmlView: FC<HtmlViewProps> = ({ value, onChange, onCopy, onApply, copyStatus = 'idle' }) => {
  return (
    <div className="email-editor__html">
      <div className="email-editor__html-actions">
        <button type="button" onClick={onCopy}>
          {copyStatus === 'copied' ? 'HTML скопирован' : 'Копировать HTML'}
        </button>
        <button type="button" onClick={onApply}>
          Применить к редактору
        </button>
      </div>
      <textarea
        value={value}
        className="email-editor__html-textarea"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
