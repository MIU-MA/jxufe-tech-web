import { createSafeMarkdown } from './markdown'

export interface WikiHeading {
  id: string
  text: string
  level: number
}

const md = createSafeMarkdown()

/** Build the article and its outline from the same tokens, including streamed Markdown. */
export function renderWikiMarkdown(content: string, prefix: string) {
  const tokens = md.parse(content, {})
  const headings: WikiHeading[] = []
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'wiki'
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    // The question is the page's h1. Generated top-level headings belong below it.
    if (token.type === 'heading_close' && token.tag === 'h1') token.tag = 'h2'
    if (token.type !== 'heading_open') continue
    const level = Math.max(2, Number(token.tag.slice(1)))
    token.tag = `h${level}`
    const id = `${safePrefix}-section-${headings.length + 1}`
    token.attrSet('id', id)
    token.attrSet('tabindex', '-1')
    const inline = tokens[index + 1]
    const text = (inline?.children ?? []).map(child => {
      if (child.type === 'text' || child.type === 'code_inline') return child.content
      if (child.type === 'softbreak' || child.type === 'hardbreak') return ' '
      if (child.type === 'image') return child.content
      return ''
    }).join('').trim()
    headings.push({ id, text: text || inline?.content || '', level })
  }
  return { html: md.renderer.render(tokens, md.options, {}), headings }
}
