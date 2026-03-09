import { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTheme } from '../ThemeContext.jsx'
import { useSearchParams } from 'react-router-dom'

import docGeral  from '../docs/inteligencia-mercado-rpv.md?raw'
import docBloco0 from '../docs/bloco0-glossario.md?raw'
import docBloco1 from '../docs/bloco1-tetos-rpv-por-ente.md?raw'
import docBloco2 from '../docs/bloco2-teses-por-natureza.md?raw'
import docBloco3 from '../docs/bloco3-jurimetria.md?raw'
import docBloco4 from '../docs/bloco4-due-diligence.md?raw'
import docBloco5 from '../docs/bloco5-tributacao-estruturacao.md?raw'
import docBloco6 from '../docs/bloco6-fluxo-operacional.md?raw'

const DOCS = {
  geral:  docGeral,
  bloco0: docBloco0,
  bloco1: docBloco1,
  bloco2: docBloco2,
  bloco3: docBloco3,
  bloco4: docBloco4,
  bloco5: docBloco5,
  bloco6: docBloco6,
}

function parseIntoSections(markdown) {
  const lines = markdown.split('\n')
  const intro = []
  const sections = []
  let current = null

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current)
      current = { heading: line.slice(3).trim(), content: [] }
    } else if (current) {
      current.content.push(line)
    } else {
      intro.push(line)
    }
  }
  if (current) sections.push(current)

  return { intro: intro.join('\n'), sections }
}

export default function InteligenciaMercado() {
  const [searchParams] = useSearchParams()
  const { theme } = useTheme()
  const activeDoc = searchParams.get('doc') || 'geral'
  const content = DOCS[activeDoc] || DOCS.geral

  const { intro, sections } = useMemo(() => parseIntoSections(content), [content])
  const [openSections, setOpenSections] = useState(() => new Set(sections.map((_, i) => i)))

  // Reset open sections when doc changes
  useMemo(() => {
    setOpenSections(new Set(sections.map((_, i) => i)))
  }, [activeDoc])

  function toggle(i) {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const mdComponents = useMdComponents()

  return (
    <div style={{
      padding: '40px 48px 80px',
      maxWidth: 1200,
      background: theme.pageBg,
      transition: 'background 0.2s',
      minHeight: '100vh',
    }}>
      {/* Intro (h1 + lead text) — sempre visível */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {intro}
      </ReactMarkdown>

      {/* Seções colapsáveis por h2 */}
      {sections.map((section, i) => {
        const isOpen = openSections.has(i)
        return (
          <div key={i} style={{ marginBottom: 2 }}>
            {/* Header clicável */}
            <button
              onClick={() => toggle(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${theme.border}`,
                padding: '14px 0',
                cursor: 'pointer',
                marginTop: 20,
                textAlign: 'left',
              }}
            >
              <span style={{
                fontSize: 16,
                color: theme.textMuted,
                flexShrink: 0,
                transition: 'transform 0.2s, color 0.2s',
                display: 'inline-block',
                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                lineHeight: 1,
              }}>
                ▾
              </span>
              <h2 style={{
                fontSize: 18,
                fontWeight: 700,
                color: theme.textPrimary,
                margin: 0,
                lineHeight: 1.3,
                transition: 'color 0.2s',
              }}>
                {section.heading}
              </h2>
            </button>

            {/* Conteúdo da seção */}
            {isOpen && (
              <div style={{ paddingTop: 8 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {section.content.join('\n')}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function useMdComponents() {
  return {
    h1: ({ children }) => (
      <h1 style={{
        fontSize: 26, fontWeight: 700,
        color: 'var(--textPrimary)',
        marginBottom: 8, marginTop: 0, lineHeight: 1.3,
        borderBottom: '1px solid var(--border)', paddingBottom: 16,
        transition: 'color 0.2s, border-color 0.2s',
      }}>{children}</h1>
    ),
    h3: ({ children }) => (
      <h3 style={{
        fontSize: 15, fontWeight: 600,
        color: 'var(--accentText)',
        marginTop: 24, marginBottom: 8, lineHeight: 1.3,
        transition: 'color 0.2s',
      }}>{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 style={{
        fontSize: 13, fontWeight: 600,
        color: 'var(--textSecondary)',
        marginTop: 20, marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.05em',
        transition: 'color 0.2s',
      }}>{children}</h4>
    ),
    p: ({ children }) => (
      <p style={{
        fontSize: 14, color: 'var(--textSecondary)',
        lineHeight: 1.75, marginBottom: 14, marginTop: 0,
        transition: 'color 0.2s',
      }}>{children}</p>
    ),
    ul: ({ children }) => (
      <ul style={{ paddingLeft: 20, marginBottom: 14, marginTop: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol style={{ paddingLeft: 20, marginBottom: 14, marginTop: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</ol>
    ),
    li: ({ children }) => (
      <li style={{ fontSize: 14, color: 'var(--textSecondary)', lineHeight: 1.6, transition: 'color 0.2s' }}>{children}</li>
    ),
    strong: ({ children }) => (
      <strong style={{ color: 'var(--textPrimary)', fontWeight: 600, transition: 'color 0.2s' }}>{children}</strong>
    ),
    em: ({ children }) => (
      <em style={{ color: 'var(--accentText)', fontStyle: 'normal', fontWeight: 500, transition: 'color 0.2s' }}>{children}</em>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{
        borderLeft: '3px solid var(--accent)',
        margin: '16px 0',
        color: 'var(--textMuted)',
        background: 'var(--cardBg2)',
        padding: '12px 16px',
        borderRadius: '0 6px 6px 0',
        transition: 'background 0.2s, color 0.2s',
      }}>{children}</blockquote>
    ),
    code: ({ inline, children }) => inline ? (
      <code style={{
        background: 'var(--cardBg)',
        color: 'var(--accentText)',
        padding: '1px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace',
        transition: 'background 0.2s, color 0.2s',
      }}>{children}</code>
    ) : (
      <pre style={{
        background: 'var(--cardBg2)',
        border: '1px solid var(--border)',
        borderRadius: 8, padding: '16px 20px', overflowX: 'auto', marginBottom: 16,
        transition: 'background 0.2s, border-color 0.2s',
      }}>
        <code style={{ color: 'var(--textSecondary)', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.7 }}>{children}</code>
      </pre>
    ),
    table: ({ children }) => (
      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead style={{ background: 'var(--cardBg2)', transition: 'background 0.2s' }}>{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr style={{ borderBottom: '1px solid var(--border)', transition: 'border-color 0.2s' }}>{children}</tr>
    ),
    th: ({ children }) => (
      <th style={{
        padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600,
        color: 'var(--textMuted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
        transition: 'color 0.2s',
      }}>{children}</th>
    ),
    td: ({ children }) => (
      <td style={{
        padding: '9px 14px', color: 'var(--textSecondary)', fontSize: 13, lineHeight: 1.5, verticalAlign: 'top',
        transition: 'color 0.2s',
      }}>{children}</td>
    ),
    hr: () => (
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0', transition: 'border-color 0.2s' }} />
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
        {children}
      </a>
    ),
  }
}
