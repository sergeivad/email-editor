const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

const BLOCK_ELEMENTS = new Set([
  'html',
  'head',
  'body',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'td',
  'th',
  'div',
  'section',
  'article',
  'header',
  'footer',
  'main',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'nav',
])

const isStandaloneTag = (tagName: string) => VOID_ELEMENTS.has(tagName.toLowerCase())

const getTagName = (line: string): string | null => {
  const match = /^<\/?\s*([a-zA-Z0-9:-]+)/.exec(line)
  return match ? match[1] : null
}

const isBlockElement = (line: string) => {
  const tagName = getTagName(line)
  return tagName ? BLOCK_ELEMENTS.has(tagName.toLowerCase()) : false
}

const normalizeWhitespace = (html: string) =>
  html
    .replace(/>\s+</g, '><')
    .replace(/\r?\n/g, '')
    .trim()

export const formatHtml = (html: string): string => {
  const normalized = normalizeWhitespace(html)
  if (!normalized) {
    return ''
  }

  const rawLines = normalized.replace(/></g, '>\n<').split('\n')
  let indentLevel = 0
  const indentString = '  '

  const formattedLines = rawLines
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((line) => {
      const isClosing = /^<\//.test(line)
      const isSelfClosing = /\/>$/.test(line)
      const tagName = getTagName(line)
      const treatAsBlock = tagName ? isBlockElement(`<${tagName}>`) : false
      const standalone = tagName ? isStandaloneTag(tagName) : false
      const shouldDedent = isClosing && indentLevel > 0

      if (shouldDedent) {
        indentLevel -= 1
      }

      const prefix = indentString.repeat(indentLevel)
      const outputLine = `${prefix}${line}`

      if (!isClosing && !isSelfClosing && !standalone && treatAsBlock) {
        indentLevel += 1
      }

      return outputLine
    })

  return formattedLines.join('\n')
}
