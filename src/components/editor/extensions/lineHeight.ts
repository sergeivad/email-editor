import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType
      unsetLineHeight: () => ReturnType
    }
  }
}

const BLOCK_TYPES = ['paragraph', 'heading'] as const

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        types: Array.from(BLOCK_TYPES),
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
            renderHTML: (attributes: Record<string, any>) => {
              const lineHeight = attributes.lineHeight as string | null | undefined
              if (!lineHeight) {
                return {}
              }

              return {
                style: `line-height: ${lineHeight}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }) =>
          BLOCK_TYPES.some((type) => commands.updateAttributes(type, { lineHeight })),
      unsetLineHeight:
        () =>
        ({ commands }) =>
          BLOCK_TYPES.some((type) => commands.updateAttributes(type, { lineHeight: null })),
    }
  },
})
