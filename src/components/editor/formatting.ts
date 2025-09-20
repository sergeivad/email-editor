import type { Editor } from '@tiptap/react'
import { normalizeHexColor } from '../../utils/colors'
import type { FormattingSnapshot } from './types'

export const ALIGNMENTS: Array<'left' | 'center' | 'right' | 'justify'> = ['left', 'center', 'right', 'justify']

export const captureFormatting = (editor: Editor): FormattingSnapshot => {
  const textStyle = editor.getAttributes('textStyle') as Record<string, string>

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
    link: linkAttributes?.href ?? null,
  }
}

export const applyFormatting = (editor: Editor, snapshot: FormattingSnapshot) => {
  const chain = editor.chain().focus()

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

  if (snapshot.align) {
    chain.setTextAlign(snapshot.align)
  }

  if (snapshot.link) {
    chain.setLink({ href: snapshot.link, target: '_blank' })
  }

  chain.run()
}
