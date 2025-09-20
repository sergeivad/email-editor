import { sanitizeHtml } from './sanitize'

export const buildEmailHtmlDocument = (contentHtml: string): string => {
  const sanitized = sanitizeHtml(contentHtml)
  return `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email шаблон</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f5f8;">
    <center style="width:100%; background-color:#f4f5f8;">
      <table role="presentation" border="0" cellPadding="0" cellSpacing="0" width="100%" style="margin:0; padding:24px 0; width:100%;">
        <tr>
          <td align="center">
            ${sanitized}
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>`
}

export const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  window.URL.revokeObjectURL(link.href)
  document.body.removeChild(link)
}
