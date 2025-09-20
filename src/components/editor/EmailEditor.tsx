import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useAutoSave } from '../../hooks/useAutoSave'
import { sanitizeHtml, sanitizePasteHtml } from '../../utils/sanitize'
import { EditorToolbar } from './EditorToolbar'
import { HtmlView } from './HtmlView'
import { PreviewPane } from './PreviewPane'
import { FontSize } from './extensions/fontSize'
import { FontFamily } from './extensions/fontFamily'
import { BackgroundColor } from './extensions/backgroundColor'
import { LineHeight } from './extensions/lineHeight'
import { formatHtml } from '../../utils/formatHtml'
import { normalizeHexColor } from '../../utils/colors'
import { ALIGNMENTS, applyFormatting, captureFormatting, getActiveLineHeight } from './formatting'
import type { FormattingSnapshot, ViewMode } from './types'
import './EmailEditor.css'

type SelectionState = {
  color: string | null
  fontSize: string | null
  fontFamily: string | null
  align: 'left' | 'center' | 'right' | 'justify' | null
  backgroundColor: string | null
  lineHeight: string | null
}

const AUTOSAVE_STORAGE_KEY = 'wysiwyg-email-autosave'
const INITIAL_EMAIL_HTML = `
  <table role="presentation" width="100%" border="0" cellPadding="0" cellSpacing="0" style="max-width: 640px; margin: 0 auto; width: 100%;">
    <tr>
      <td style="padding: 32px; background-color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #374151;">
        <h2 style="margin-top: 0; font-size: 24px; color: #111827;">Добро пожаловать!</h2>
        <p style="margin: 0;">Начните набирать текст прямо здесь или вставьте контент из Google Docs.</p>
      </td>
    </tr>
  </table>
`

export const EmailEditor = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('design')
  const [htmlContent, setHtmlContent] = useState<string>(() => sanitizeHtml(INITIAL_EMAIL_HTML))
  const [htmlDraft, setHtmlDraft] = useState<string>('')
  const [selectionState, setSelectionState] = useState<SelectionState>({
    color: '#111827',
    fontSize: '',
    fontFamily: '',
    align: 'left',
    backgroundColor: 'transparent',
    lineHeight: '',
  })
  const [formatSnapshot, setFormatSnapshot] = useState<FormattingSnapshot | null>(null)
  const [autosaveTimestamp, setAutosaveTimestamp] = useState<number | null>(null)
  const [hasCopiedTop, setHasCopiedTop] = useState(false)
  const [hasCopiedInHtmlView, setHasCopiedInHtmlView] = useState(false)
  const [showFormattingToast, setShowFormattingToast] = useState(false)
  const previousViewModeRef = useRef<ViewMode>('design')
  const hasLoadedInitialRef = useRef(false)
  const formattingToastTimerRef = useRef<number | null>(null)

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          bulletList: {
            keepMarks: true,
          },
          orderedList: {
            keepMarks: true,
          },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          validate: (href) => /^(https?:\/\/|mailto:)/i.test(href ?? ''),
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
        TextStyle,
        Color.configure({ types: ['textStyle'] }),
        FontSize,
        FontFamily,
        BackgroundColor,
        LineHeight,
        TextAlign.configure({
          types: ['heading', 'paragraph', 'image'],
        }),
        Image.configure({
          allowBase64: true,
          HTMLAttributes: {
            style: 'display: block; max-width: 100%; height: auto;',
          },
        }),
        Placeholder.configure({
          placeholder: 'Начните писать письмо или вставьте контент из Google Docs…',
        }),
      ],
      content: sanitizeHtml(INITIAL_EMAIL_HTML),
      editorProps: {
        attributes: {
          class: 'email-editor__editable',
          spellcheck: 'false',
        },
        transformPastedHTML: (html) => sanitizePasteHtml(html),
      },
      onUpdate: ({ editor: instance }) => {
        const sanitized = sanitizeHtml(instance.getHTML())
        setHtmlContent(sanitized)
      },
    },
    [],
  )

  useAutoSave(htmlContent, AUTOSAVE_STORAGE_KEY, 1200, () => setAutosaveTimestamp(Date.now()))

  useEffect(() => {
    if (!editor || hasLoadedInitialRef.current || typeof window === 'undefined') {
      return
    }

    const savedFromStorage = window.localStorage.getItem(AUTOSAVE_STORAGE_KEY)
    const safeContent = savedFromStorage ? sanitizeHtml(savedFromStorage) : sanitizeHtml(INITIAL_EMAIL_HTML)

    editor.commands.setContent(safeContent, { emitUpdate: true })
    setHtmlContent(safeContent)
    setHtmlDraft(formatHtml(safeContent))
    hasLoadedInitialRef.current = true
  }, [editor])

  useEffect(() => {
    if (!editor) {
      return
    }

    const updateSelection = () => {
      const textStyle = editor.getAttributes('textStyle') as Record<string, string>
      const color = normalizeHexColor(textStyle?.color) ?? '#111827'
      const fontSize = textStyle?.fontSize ?? ''
      const fontFamily = textStyle?.fontFamily ?? ''
      const backgroundColor = normalizeHexColor(textStyle?.backgroundColor) ?? 'transparent'
      const align = ALIGNMENTS.find((alignment) => editor.isActive({ textAlign: alignment })) ?? null
      const lineHeight = getActiveLineHeight(editor) ?? ''

      setSelectionState({
        color,
        fontSize,
        fontFamily,
        align,
        backgroundColor,
        lineHeight,
      })
    }

    editor.on('selectionUpdate', updateSelection)
    editor.on('transaction', updateSelection)

    updateSelection()

    return () => {
      editor.off('selectionUpdate', updateSelection)
      editor.off('transaction', updateSelection)
    }
  }, [editor])

  const applyHtmlDraftToEditor = useCallback(() => {
    if (!editor) {
      return
    }

    const sanitized = sanitizeHtml(htmlDraft)
    editor.commands.setContent(sanitized, { emitUpdate: true })
    setHtmlContent(sanitized)
    setHtmlDraft(formatHtml(sanitized))
  }, [editor, htmlDraft])

  useEffect(() => {
    if (viewMode === 'html' && previousViewModeRef.current !== 'html') {
      setHtmlDraft(formatHtml(htmlContent))
    }

    if (viewMode === 'design' && previousViewModeRef.current === 'html') {
      applyHtmlDraftToEditor()
    }

    previousViewModeRef.current = viewMode
  }, [viewMode, htmlContent, applyHtmlDraftToEditor])

  useEffect(() => {
    if (viewMode !== 'html') {
      setHasCopiedInHtmlView(false)
    }
  }, [viewMode])

  useEffect(() => {
    return () => {
      if (formattingToastTimerRef.current) {
        window.clearTimeout(formattingToastTimerRef.current)
      }
    }
  }, [])

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const handleCopyHtml = async (source: 'toolbar' | 'htmlView' = 'toolbar') => {
    try {
      const formatted = formatHtml(htmlContent)
      await navigator.clipboard.writeText(formatted)
      if (source === 'toolbar') {
        setHasCopiedTop(true)
        window.setTimeout(() => setHasCopiedTop(false), 1600)
      } else {
        setHasCopiedInHtmlView(true)
        window.setTimeout(() => setHasCopiedInHtmlView(false), 1600)
      }
    } catch (error) {
      console.error('Не удалось скопировать HTML', error)
    }
  }

  const handleCopyFormatting = () => {
    if (!editor) {
      return
    }

    const snapshot = captureFormatting(editor)
    setFormatSnapshot(snapshot)
    setShowFormattingToast(true)

    if (formattingToastTimerRef.current) {
      window.clearTimeout(formattingToastTimerRef.current)
    }

    formattingToastTimerRef.current = window.setTimeout(() => {
      setShowFormattingToast(false)
      formattingToastTimerRef.current = null
    }, 5000)
  }

  const handleApplyFormatting = () => {
    if (!editor || !formatSnapshot) {
      return
    }

    applyFormatting(editor, formatSnapshot)
  }

  const clearFormattingSnapshot = () => {
    setFormatSnapshot(null)
    setShowFormattingToast(false)
    if (formattingToastTimerRef.current) {
      window.clearTimeout(formattingToastTimerRef.current)
      formattingToastTimerRef.current = null
    }
  }

  const autosaveLabel = useMemo(() => {
    if (!autosaveTimestamp) {
      return 'Автосохранение готово'
    }

    const date = new Date(autosaveTimestamp)
    return `Сохранено в ${date.toLocaleTimeString('ru-RU')}`
  }, [autosaveTimestamp])

  const dismissFormattingToast = () => {
    setShowFormattingToast(false)
    if (formattingToastTimerRef.current) {
      window.clearTimeout(formattingToastTimerRef.current)
      formattingToastTimerRef.current = null
    }
  }

  const modeButtons: Array<{ label: string; value: ViewMode }> = [
    { label: 'Визуально', value: 'design' },
    { label: 'HTML', value: 'html' },
    { label: 'Предпросмотр', value: 'preview' },
  ]

  return (
    <div className="email-editor">

      {viewMode === 'design' && (
        <>
          <EditorToolbar
            editor={editor}
            selectionState={selectionState}
            hasFormattingSnapshot={Boolean(formatSnapshot)}
            onCopyFormatting={handleCopyFormatting}
            onApplyFormatting={handleApplyFormatting}
            onClearFormatting={clearFormattingSnapshot}
            onCopyHtml={() => handleCopyHtml('toolbar')}
            copyLabel={hasCopiedTop ? 'HTML copied' : 'Copy HTML'}
          />
          <div className="email-editor__canvas">
            <div className="email-editor__canvas-scroll">
              <EditorContent editor={editor} />
            </div>
          </div>
        </>
      )}

      {viewMode === 'html' && (
        <HtmlView
          value={htmlDraft}
          onChange={setHtmlDraft}
          onCopy={() => handleCopyHtml('htmlView')}
          copyStatus={hasCopiedInHtmlView ? 'copied' : 'idle'}
          onApply={applyHtmlDraftToEditor}
        />
      )}

      {viewMode === 'preview' && (
        <PreviewPane html={htmlContent} />
      )}

      <footer className="email-editor__footer">
        <span>{autosaveLabel}</span>
        <div className="email-editor__mode-switcher" role="tablist" aria-label="Режим редактора">
          {modeButtons.map((button) => (
            <button
              key={button.value}
              type="button"
              role="tab"
              aria-selected={viewMode === button.value}
              className={viewMode === button.value ? 'is-active' : ''}
              onClick={() => handleViewModeChange(button.value)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </footer>

      {showFormattingToast && (
        <div className="email-editor__toast" role="status" aria-live="polite">
          <span>Форматирование скопировано — выделите текст и нажмите Apply</span>
          <button type="button" aria-label="Закрыть уведомление" onClick={dismissFormattingToast}>
            ×
          </button>
        </div>
      )}
    </div>
  )
}
