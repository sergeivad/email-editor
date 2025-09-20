export type ViewMode = 'design' | 'html' | 'preview'

export type FormattingSnapshot = {
  bold: boolean
  italic: boolean
  underline: boolean
  color?: string | null
  fontSize?: string | null
  fontFamily?: string | null
  align?: 'left' | 'center' | 'right' | 'justify' | null
  backgroundColor?: string | null
  lineHeight?: string | null
  link?: string | null
  blockType?:
    | { type: 'paragraph' }
    | { type: 'heading'; level: 1 | 2 | 3 }
    | null
}

export type ExportFormat = 'html' | 'text'
