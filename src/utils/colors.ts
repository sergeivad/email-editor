const HEX_COLOR = /^#(?:[0-9a-f]{3}){1,2}$/i
const RGB_COLOR = /^rgba?\(([^)]+)\)$/i

const expandHex = (value: string) =>
  value.length === 4
    ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase()
    : value.toLowerCase()

const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)))

const channelToInt = (token: string) => {
  const trimmed = token.trim()
  if (trimmed.endsWith('%')) {
    const percent = Number.parseFloat(trimmed.slice(0, -1))
    if (Number.isNaN(percent)) {
      return null
    }
    return clamp((percent / 100) * 255)
  }

  const num = Number.parseFloat(trimmed)
  if (Number.isNaN(num)) {
    return null
  }
  return clamp(num)
}

const rgbaToHex = (value: string) => {
  const match = RGB_COLOR.exec(value)
  if (!match) {
    return null
  }

  const parts = match[1].split(',')
  if (parts.length < 3) {
    return null
  }

  const [rToken, gToken, bToken, aToken] = parts.map((part) => part.trim())
  const r = channelToInt(rToken)
  const g = channelToInt(gToken)
  const b = channelToInt(bToken)

  if (r === null || g === null || b === null) {
    return null
  }

  if (typeof aToken !== 'undefined') {
    const alpha = Number.parseFloat(aToken)
    if (Number.isNaN(alpha) || alpha <= 0) {
      return null
    }
  }

  const toHex = (channel: number) => channel.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export const normalizeHexColor = (value?: string | null): string | null => {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (trimmed.toLowerCase() === 'transparent') {
    return null
  }

  if (HEX_COLOR.test(trimmed)) {
    return expandHex(trimmed)
  }

  return rgbaToHex(trimmed)
}
