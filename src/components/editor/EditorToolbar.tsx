import type { ChangeEvent, FC, MouseEvent, ReactNode } from 'react'
import clsx from 'clsx'
import type { Editor } from '@tiptap/react'

import bulletListIcon from '../../assets/icons/UL.png'
import orderedListIcon from '../../assets/icons/OL.png'
import undoIcon from '../../assets/icons/UNDO.png'
import redoIcon from '../../assets/icons/REDO.svg'
import linkIcon from '../../assets/icons/LINK.png'
import unlinkIcon from '../../assets/icons/UNLINK.png'
import copyHtmlIcon from '../../assets/icons/HTML.png'
import boldIcon from '../../assets/icons/BOLD.png'
import italicIcon from '../../assets/icons/ITALIC.png'
import underlineIcon from '../../assets/icons/UNDERLINE.png'
import strikeIcon from '../../assets/icons/STRIKE.png'
import alignLeftIcon from '../../assets/icons/LEFT.png'
import alignCenterIcon from '../../assets/icons/CENTER.png'
import alignRightIcon from '../../assets/icons/RIGHT.png'
import imageIcon from '../../assets/icons/IMAGE.png'

type Alignment = 'left' | 'center' | 'right' | 'justify'

const FONT_FAMILY_OPTIONS = [
  { label: 'Системный', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times', value: 'Times New Roman, serif' },
  { label: 'Roboto', value: 'Roboto, Helvetica, sans-serif' },
]

const FONT_SIZE_OPTIONS = [
  { label: 'Размер', value: '' },
  { label: '12 px', value: '12px' },
  { label: '14 px', value: '14px' },
  { label: '16 px', value: '16px' },
  { label: '18 px', value: '18px' },
  { label: '20 px', value: '20px' },
  { label: '24 px', value: '24px' },
  { label: '28 px', value: '28px' },
]

const LINE_HEIGHT_OPTIONS = [
  { label: 'Интерлиньяж', value: '' },
  { label: '1.0', value: '1' },
  { label: '1.2', value: '1.2' },
  { label: '1.5', value: '1.5' },
  { label: '1.75', value: '1.75' },
  { label: '2.0', value: '2' },
  { label: '2.5', value: '2.5' },
]

interface SelectionState {
  color: string | null
  fontSize: string | null
  fontFamily: string | null
  align: Alignment | null
  backgroundColor: string | null
  lineHeight: string | null
}

interface EditorToolbarProps {
  editor: Editor | null
  selectionState: SelectionState
  onCopyFormatting: () => void
  onApplyFormatting: () => void
  hasFormattingSnapshot: boolean
  onClearFormatting: () => void
  onCopyHtml: () => void
  copyLabel: string
}

const preventLosingFocus = (event: MouseEvent<HTMLButtonElement>) => {
  event.preventDefault()
}

const isValidUrl = (value: string) => /^(https?:\/\/|mailto:)/i.test(value)

const isValidImageSource = (value: string) => /^(https?:\/\/|cid:|data:image\/)/i.test(value)

const Icon = ({ children }: { children: ReactNode }) => (
  <span className="editor-toolbar__icon" aria-hidden="true">
    {children}
  </span>
)

const AlignIcon = ({ variant }: { variant: Alignment }) => {
  const alignIconMap: Partial<Record<Alignment, string>> = {
    left: alignLeftIcon,
    center: alignCenterIcon,
    right: alignRightIcon,
  }

  const asset = alignIconMap[variant]

  if (asset) {
    return (
      <Icon>
        <img src={asset} alt="" />
      </Icon>
    )
  }

  const x = {
    left: [4, 14],
    center: [6, 12],
    right: [8, 16],
    justify: [4, 16],
  }[variant]

  return (
    <Icon>
      <svg viewBox="0 0 20 20" focusable="false">
        <rect x="4" y="4" width="12" height="2" rx="1" fill="currentColor" />
        <rect x={x[0]} y="9" width={x[1] - x[0]} height="2" rx="1" fill="currentColor" />
        <rect x="4" y="14" width="12" height="2" rx="1" fill="currentColor" />
      </svg>
    </Icon>
  )
}

const BoldIcon = () => (
  <Icon>
    <img src={boldIcon} alt="" />
  </Icon>
)

const ItalicIcon = () => (
  <Icon>
    <img src={italicIcon} alt="" />
  </Icon>
)

const UnderlineIcon = () => (
  <Icon>
    <img src={underlineIcon} alt="" />
  </Icon>
)

const StrikeIcon = () => (
  <Icon>
    <img src={strikeIcon} alt="" />
  </Icon>
)

const ImageIcon = () => (
  <Icon>
    <img src={imageIcon} alt="" />
  </Icon>
)

const LinkIcon = () => (
  <Icon>
    <img src={linkIcon} alt="" />
  </Icon>
)

const BulletListIcon = () => (
  <Icon>
    <img src={bulletListIcon} alt="" />
  </Icon>
)

const OrderedListIcon = () => (
  <Icon>
    <img src={orderedListIcon} alt="" />
  </Icon>
)

const CopyHtmlIcon = () => (
  <Icon>
    <img src={copyHtmlIcon} alt="" />
  </Icon>
)

const UnlinkIcon = () => (
  <Icon>
    <img src={unlinkIcon} alt="" />
  </Icon>
)

const UndoIcon = () => (
  <Icon>
    <img src={undoIcon} alt="" />
  </Icon>
)

const RedoIcon = () => (
  <Icon>
    <img src={redoIcon} alt="" />
  </Icon>
)

export const EditorToolbar: FC<EditorToolbarProps> = ({
  editor,
  selectionState,
  onCopyFormatting,
  onApplyFormatting,
  hasFormattingSnapshot,
  onClearFormatting,
  onCopyHtml,
  copyLabel,
}) => {
  if (!editor) {
    return null
  }

  const execute = () => editor.chain().focus()

  const handleFontSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (!value) {
      execute().unsetFontSize().run()
      return
    }
    execute().setFontSize(value).run()
  }

  const handleLineHeightChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (!value) {
      execute().unsetLineHeight().run()
      return
    }
    execute().setLineHeight(value).run()
  }

  const handleFontFamilyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (!value) {
      execute().unsetFontFamily().run()
      return
    }
    execute().setFontFamily(value).run()
  }

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!value) {
      execute().unsetColor().run()
      return
    }
    execute().setColor(value).run()
  }

  const handleBackgroundColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!value) {
      execute().unsetBackgroundColor().run()
      return
    }
    execute().setBackgroundColor(value).run()
  }

  const handleLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Введите адрес ссылки', previous ?? 'https://')
    if (url === null) {
      return
    }

    const trimmed = url.trim()
    if (trimmed.length === 0) {
      execute().unsetLink().run()
      return
    }

    if (!isValidUrl(trimmed)) {
      window.alert('Используйте ссылки, начинающиеся с https://, http:// или mailto:')
      return
    }

    execute()
      .extendMarkRange('link')
      .setLink({ href: trimmed, target: '_blank', rel: 'noopener noreferrer' })
      .run()
  }

  const handleImage = () => {
    const src = window.prompt('Введите ссылку на изображение (https, cid или base64)', 'https://')
    if (!src) {
      return
    }

    const trimmed = src.trim()
    if (!isValidImageSource(trimmed)) {
      window.alert('Укажите корректный источник изображения (https://, cid:, data:image/)')
      return
    }

    const alt = window.prompt('Альтернативный текст изображения', '') ?? ''

    execute()
      .setImage({ src: trimmed, alt: alt.trim() })
      .run()
  }

  const handleAlignment = (align: Alignment) => {
    execute().setTextAlign(align).run()
  }

  const backgroundColorValue =
    selectionState.backgroundColor && selectionState.backgroundColor !== 'transparent'
      ? selectionState.backgroundColor
      : '#ffffff'

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Панель форматирования">
      <div className="editor-toolbar__group">
        <button
          type="button"
          className={clsx('editor-toolbar__btn', editor.isActive('bold') && 'is-active')}
          onMouseDown={preventLosingFocus}
          onClick={() => execute().toggleBold().run()}
          aria-label="Жирный"
        >
          <BoldIcon />
        </button>
        <button
          type="button"
          className={clsx('editor-toolbar__btn', editor.isActive('italic') && 'is-active')}
          onMouseDown={preventLosingFocus}
          onClick={() => execute().toggleItalic().run()}
          aria-label="Курсив"
        >
          <ItalicIcon />
        </button>
        <button
          type="button"
          className={clsx('editor-toolbar__btn', editor.isActive('underline') && 'is-active')}
          onMouseDown={preventLosingFocus}
          onClick={() => execute().toggleUnderline().run()}
          aria-label="Подчеркнутый"
        >
          <UnderlineIcon />
        </button>
        <button
          type="button"
          className={clsx('editor-toolbar__btn', editor.isActive('strike') && 'is-active')}
          onMouseDown={preventLosingFocus}
          onClick={() => execute().toggleStrike().run()}
          aria-label="Зачеркнутый"
        >
          <StrikeIcon />
        </button>
      </div>

      <div className="editor-toolbar__group">
        <select
          className="editor-toolbar__select"
          value={selectionState.fontFamily ?? ''}
          onChange={handleFontFamilyChange}
          aria-label="Выбор шрифта"
        >
          {FONT_FAMILY_OPTIONS.map((option) => (
            <option key={option.value || 'default'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="editor-toolbar__select"
          value={selectionState.fontSize ?? ''}
          onChange={handleFontSizeChange}
          aria-label="Размер шрифта"
        >
          {FONT_SIZE_OPTIONS.map((option) => (
            <option key={option.value || 'default'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="editor-toolbar__select"
          value={selectionState.lineHeight ?? ''}
          onChange={handleLineHeightChange}
          aria-label="Межстрочный интервал"
        >
          {LINE_HEIGHT_OPTIONS.map((option) => (
            <option key={option.value || 'default'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="editor-toolbar__color">
          <span className="sr-only">Цвет текста</span>
          <input
            type="color"
            value={selectionState.color ?? '#111827'}
            onChange={handleColorChange}
            title="Цвет текста"
          />
        </label>
        <label className="editor-toolbar__color">
          <span className="sr-only">Фон текста</span>
          <input
            type="color"
            value={backgroundColorValue}
            onChange={handleBackgroundColorChange}
            title="Фон текста"
          />
        </label>
      </div>

      <div className="editor-toolbar__group">
        <button
          type="button"
          className={clsx('editor-toolbar__btn', editor.isActive('bulletList') && 'is-active')}
          onMouseDown={preventLosingFocus}
          onClick={() => execute().toggleBulletList().run()}
          aria-label="Маркированный список"
        >
          <BulletListIcon />
        </button>
        <button
          type="button"
          className={clsx('editor-toolbar__btn', editor.isActive('orderedList') && 'is-active')}
          onMouseDown={preventLosingFocus}
          onClick={() => execute().toggleOrderedList().run()}
          aria-label="Нумерованный список"
        >
          <OrderedListIcon />
        </button>
      </div>

      <div className="editor-toolbar__group">
        <button
          type="button"
          className={clsx('editor-toolbar__btn', selectionState.align === 'left' && 'is-active')}
          onMouseDown={preventLosingFocus}
          onClick={() => handleAlignment('left')}
          aria-label="Выровнять по левому краю"
        >
          <AlignIcon variant="left" />
        </button>
        <button
          type="button"
          className={clsx('editor-toolbar__btn', selectionState.align === 'center' && 'is-active')}
          onMouseDown={preventLosingFocus}
          onClick={() => handleAlignment('center')}
          aria-label="Центрировать"
        >
          <AlignIcon variant="center" />
        </button>
        <button
          type="button"
          className={clsx('editor-toolbar__btn', selectionState.align === 'right' && 'is-active')}
          onMouseDown={preventLosingFocus}
          onClick={() => handleAlignment('right')}
          aria-label="Выровнять по правому краю"
        >
          <AlignIcon variant="right" />
        </button>
      </div>

      <div className="editor-toolbar__group">
        <button
          type="button"
          className={clsx('editor-toolbar__btn', editor.isActive('link') && 'is-active')}
          onMouseDown={preventLosingFocus}
          onClick={handleLink}
          aria-label="Добавить ссылку"
        >
          <LinkIcon />
        </button>
        <button
          type="button"
          className="editor-toolbar__btn"
          onMouseDown={preventLosingFocus}
          onClick={() => execute().unsetLink().run()}
          aria-label="Удалить ссылку"
        >
          <UnlinkIcon />
        </button>
        <button
          type="button"
          className="editor-toolbar__btn"
          onMouseDown={preventLosingFocus}
          onClick={handleImage}
          aria-label="Вставить изображение"
        >
          <ImageIcon />
        </button>
      </div>

      <div className="editor-toolbar__group">
        <button
          type="button"
          className="editor-toolbar__btn editor-toolbar__btn--with-icon"
          onMouseDown={preventLosingFocus}
          onClick={onCopyHtml}
          aria-label="Copy HTML"
        >
          <CopyHtmlIcon />
          <span className="editor-toolbar__btn-label">{copyLabel}</span>
        </button>
        <span className="editor-toolbar__divider" aria-hidden="true" />
        <button
          type="button"
          className={clsx('editor-toolbar__btn', hasFormattingSnapshot && 'is-active')}
          onMouseDown={preventLosingFocus}
          onClick={onCopyFormatting}
          aria-label="Скопировать форматирование"
        >
          Copy
        </button>
        <button
          type="button"
          className="editor-toolbar__btn"
          onMouseDown={preventLosingFocus}
          onClick={onApplyFormatting}
          aria-label="Применить форматирование"
          disabled={!hasFormattingSnapshot}
        >
          Apply
        </button>
        <button
          type="button"
          className="editor-toolbar__btn"
          onMouseDown={preventLosingFocus}
          onClick={() => {
            onClearFormatting()
            execute()
              .unsetAllMarks()
              .unsetFontSize()
              .unsetFontFamily()
              .unsetBackgroundColor()
              .unsetLineHeight()
              .unsetTextAlign()
              .run()
          }}
          aria-label="Очистить форматирование"
        >
          Clear
        </button>
      </div>

      <div className="editor-toolbar__group">
        <button
          type="button"
          className="editor-toolbar__btn"
          onMouseDown={preventLosingFocus}
          onClick={() => execute().undo().run()}
          aria-label="Отменить"
        >
          <UndoIcon />
        </button>
        <button
          type="button"
          className="editor-toolbar__btn"
          onMouseDown={preventLosingFocus}
          onClick={() => execute().redo().run()}
          aria-label="Повторить"
        >
          <RedoIcon />
        </button>
      </div>
    </div>
  )
}
