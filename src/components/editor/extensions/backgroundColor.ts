import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    backgroundColor: {
      setBackgroundColor: (backgroundColor: string) => ReturnType
      unsetBackgroundColor: () => ReturnType
    }
  }
}

export const BackgroundColor = Extension.create({
  name: 'backgroundColor',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.style.backgroundColor || null,
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) {
                return {}
              }

              return {
                style: `background-color: ${attributes.backgroundColor}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setBackgroundColor:
        (backgroundColor: string) =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', { backgroundColor })
            .run(),
      unsetBackgroundColor:
        () =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', { backgroundColor: null })
            .removeEmptyTextStyle()
            .run(),
    }
  },
})
