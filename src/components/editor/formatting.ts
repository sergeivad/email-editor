import type { Editor } from '@tiptap/react'
import { normalizeHexColor } from '../../utils/colors'
import type { FormattingSnapshot } from './types'

export const ALIGNMENTS: Array<'left' | 'center' | 'right' | 'justify'> = ['left', 'center', 'right', 'justify']
const HEADING_LEVELS: Array<1 | 2 | 3> = [1, 2, 3]

const getActiveHeadingLevel = (editor: Editor): 1 | 2 | 3 | null =>
  HEADING_LEVELS.find((level) => editor.isActive('heading', { level })) ?? null

export const getActiveLineHeight = (editor: Editor): string | null => {
  const parentLineHeight = editor.state.selection.$from.parent?.attrs?.lineHeight
  const normalizedParent =
    typeof parentLineHeight === 'string' && parentLineHeight.length > 0 ? parentLineHeight : null

  const headingLineHeight = editor.isActive('heading')
    ? ((editor.getAttributes('heading') as Record<string, string | null>)?.lineHeight ?? null)
    : null

  const paragraphLineHeight = editor.isActive('paragraph')
    ? ((editor.getAttributes('paragraph') as Record<string, string | null>)?.lineHeight ?? null)
    : null

  return normalizedParent ?? headingLineHeight ?? paragraphLineHeight ?? null
}

export const captureFormatting = (editor: Editor): FormattingSnapshot => {
  const textStyle = editor.getAttributes('textStyle') as Record<string, string>
  const headingLevel = getActiveHeadingLevel(editor)
  const blockType: FormattingSnapshot['blockType'] = headingLevel
    ? { type: 'heading', level: headingLevel }
    : editor.isActive('paragraph')
      ? { type: 'paragraph' }
      : null

  const align = ALIGNMENTS.find((alignment) => editor.isActive({ textAlign: alignment })) ?? null
  const linkAttributes = editor.getAttributes('link') as { href?: string }

  return {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    underline: editor.isActive('underline'),
    color: normalizeHexColor(textStyle?.color) ?? null,
    fontSize: (textStyle?.fontSize as string | undefined) ?? null,
    fontFamily: (textStyle?.fontFamily as string | undefined) ?? null,
    backgroundColor: normalizeHexColor(textStyle?.backgroundColor) ?? null,
    align,
    lineHeight: getActiveLineHeight(editor),
    link: linkAttributes?.href ?? null,
    blockType,
  }
}

export const applyFormatting = (editor: Editor, snapshot: FormattingSnapshot) => {
  const chain = editor.chain().focus()
  const currentHeadingLevel = getActiveHeadingLevel(editor)

  chain
    .unsetBold()
    .unsetItalic()
    .unsetUnderline()
    .unsetColor()
    .unsetFontSize()
    .unsetFontFamily()
    .unsetBackgroundColor()
    .unsetLink()
    .unsetTextAlign()
    .unsetLineHeight()

  if (snapshot.blockType?.type === 'heading') {
    if (currentHeadingLevel !== snapshot.blockType.level) {
      chain.setHeading({ level: snapshot.blockType.level })
    }
  } else if (snapshot.blockType?.type === 'paragraph') {
    if (!editor.isActive('paragraph')) {
      chain.setParagraph()
    }
  }

  if (snapshot.bold) {
    chain.setBold()
  }

  if (snapshot.italic) {
    chain.setItalic()
  }

  if (snapshot.underline) {
    chain.setUnderline()
  }

  if (snapshot.color) {
    chain.setColor(snapshot.color)
  }

  if (snapshot.fontSize) {
    chain.setFontSize(snapshot.fontSize)
  }

  if (snapshot.fontFamily) {
    chain.setFontFamily(snapshot.fontFamily)
  }

  if (snapshot.backgroundColor) {
    chain.setBackgroundColor(snapshot.backgroundColor)
  }

  if (snapshot.lineHeight) {
    chain.setLineHeight(snapshot.lineHeight)
  }

  if (snapshot.align) {
    chain.setTextAlign(snapshot.align)
  }

  if (snapshot.link) {
    chain.setLink({ href: snapshot.link, target: '_blank' })
  }

  chain.run()
}
