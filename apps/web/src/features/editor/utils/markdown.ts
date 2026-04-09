import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: true,
})

export function deriveDocumentTitle(markdown: string): string {
  const lines = markdown.split(/\r?\n/)

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      continue
    }

    const matched = trimmedLine.match(/^#\s+(.+)$/)

    if (!matched) {
      return '未命名文档'
    }

    const title = matched[1]?.trim()
    return title || '未命名文档'
  }

  return '未命名文档'
}

export function renderMarkdownHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown) as string

  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  })
}
