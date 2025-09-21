import DOMPurify from 'dompurify'

const ALLOWED_STYLES = new Set([
  'color',
  'background-color',
  'font-size',
  'font-family',
  'font-weight',
  'font-style',
  'text-decoration',
  'text-align',
  'line-height',
  'letter-spacing',
  'padding',
  'margin',
  'display',
])

const ALLOWED_TAGS = [
  'a',
  'b',
  'br',
  'blockquote',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]

const ALLOWED_ATTR = [
  'href',
  'target',
  'rel',
  'style',
  'src',
  'alt',
  'title',
  'width',
  'height',
  'align',
  'valign',
  'border',
  'cellpadding',
  'cellspacing',
  'role',
  'aria-label',
]

let hooksInitialized = false

const isStructuralChild = (node: Element) =>
  node.matches('img, table, iframe, svg, video, audio')

const isEmptyParagraph = (node: Element) => {
  if (node.tagName.toLowerCase() !== 'p') {
    return false
  }

  if (node.childElementCount === 0) {
    const text = node.textContent?.replace(/\u00a0/g, '').trim() ?? ''
    return text.length === 0
  }

  const structuralChild = Array.from(node.children).find((child) => isStructuralChild(child as Element))
  if (structuralChild) {
    return false
  }

  const textContent = node.textContent?.replace(/\u00a0/g, '').trim() ?? ''
  if (textContent.length > 0) {
    return false
  }

  const hasContentfulDescendant = Array.from(node.querySelectorAll('*')).some((child) => {
    if (child.matches('br')) {
      return false
    }

    if (isStructuralChild(child)) {
      return true
    }

    const text = child.textContent?.replace(/\u00a0/g, '').trim() ?? ''
    return text.length > 0
  })

  return !hasContentfulDescendant
}

const ensureHooks = () => {
  if (hooksInitialized || typeof window === 'undefined') {
    return
  }

  DOMPurify.addHook('afterSanitizeElements', (node) => {
    if (node instanceof Element && isEmptyParagraph(node)) {
      node.remove()
    }
  })

  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    if (data.attrName === 'style') {
      const safeRules = data.attrValue
        .split(';')
        .map((rule) => rule.trim())
        .filter(Boolean)
        .map((rule) => {
          const [property, rawValue] = rule.split(':')
          if (!property || !rawValue) {
            return null
          }

          const propName = property.trim().toLowerCase()
          if (!ALLOWED_STYLES.has(propName)) {
            return null
          }

          const value = rawValue.trim()
          return `${propName}: ${value}`
        })
        .filter(Boolean)
        .join('; ')

      if (safeRules.length > 0) {
        data.attrValue = safeRules
        return
      }

      data.keepAttr = false
    }

    if (data.attrName === 'class') {
      data.keepAttr = false
    }

    if (data.attrName === 'href') {
      const value = data.attrValue || ''
      const isSafeLink = /^(https?:|mailto:)/i.test(value)
      if (!isSafeLink) {
        data.keepAttr = false
      }
    }

    if (data.attrName === 'src') {
      const value = data.attrValue || ''
      const isSafeSrc = /^(https?:|cid:|data:image\/)/i.test(value)
      if (!isSafeSrc) {
        data.keepAttr = false
      }
    }
  })

  hooksInitialized = true
}

export const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    return html
  }

  ensureHooks()
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'style', 'meta'],
    FORBID_ATTR: ['onerror', 'onclick'],
    KEEP_CONTENT: true,
  })
}

export const sanitizePasteHtml = (html: string): string => sanitizeHtml(html)
