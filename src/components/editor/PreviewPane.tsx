import type { FC } from 'react'
import { sanitizeHtml } from '../../utils/sanitize'
import './EmailEditor.css'

interface PreviewPaneProps {
  html: string
}

export const PreviewPane: FC<PreviewPaneProps> = ({ html }) => {
  const sanitized = sanitizeHtml(html)

  return (
    <div className="email-editor__preview">
      <div className="email-editor__preview-canvas" dangerouslySetInnerHTML={{ __html: sanitized }} />
    </div>
  )
}
