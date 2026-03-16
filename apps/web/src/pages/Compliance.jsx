import { useTheme } from '../ThemeContext.jsx'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import DateRangePicker from '../components/DateRangePicker'

const PHASES = [
  'BACKLOG - COMPLIANCE',
  'DUE CONCLUÍDA',
]

function TruncatedCell({ value, color, maxWidth = 180 }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  if (!value) return <span style={{ color: '#475569' }}>—</span>
  return (
    <span style={{ position: 'relative' }}>
      <span
        style={{ color, maxWidth, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom', cursor: 'default' }}
        onMouseEnter={e => { setPos({ x: e.clientX, y: e.clientY }); setShowTooltip(true) }}
        onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {value}
      </span>
      {showTooltip && (
        <div style={{
          position: 'fixed', left: pos.x + 12, top: pos.y + 12,
          background: '#1e2533', border: '1px solid #3d4a5c', borderRadius: 8,
          padding: '8px 12px', fontSize: 12, color: '#e2e8f0',
          maxWidth: 320, wordBreak: 'break-word', zIndex: 9999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)', lineHeight: 1.5,
          pointerEvents: 'none'
        }}>
          {value}
        </div>
      )}
    </span>
  )
}

function KPICard({ label, value, sub, accent }) {
  const { theme } = useTheme()
  return (
    <div style={{ background: theme.cardBg, borderRadius: 12, padding: '20px 24px', flex: 1, borderTop: `3px solid ${accent || theme.border}` }}>
      <div style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || theme.textPrimary }}>{value}</div>
      {sub && <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }) {
  const { theme } = useTheme()
  return (
    <h2 style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
      {children}
    </h2>
  )
}

export default function Compliance() {
  const { theme } = useTheme()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date(); const start = new Date()
    start.setDate(end.getDate() - 30)
    return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  })
  const [hideTest, setHideTest] = useState(true)
  const [incFilter, setIncFilter] = useState('todos')

  useEffect(() => { fetchEvents() }, [dateRange])

  async function fetchEvents() {
    setLoading(true)
    let q = supabase.from('compliance_events').select('*').eq('is_deleted', false).order('entered_at', { ascending: false })
    if (dateRange[0]) q = q.gte('entered_at', dateRange[0])
    if (dateRange[1]) q = q.lte('entered_at', dateRange[1] + 'T23:59:59')
    const { data } = await q.limit(2000)
    setEvents(data || [])
    setLoading(false)
  }

  const visible = hideTest ? events.filter(e => !(e.card_title || '').toLowerCase().includes('[teste]')) : events

  const totalCards = new Set(visible.map(e => e.card_id)).size
  const dueConcluida = visible.filter(e => e.phase_name === 'DUE CONCLUÍDA')
  const comInconsistencia = dueConcluida.filter(e => e.tem_inconsistencia && e.tem_inconsistencia.toLowerCase() !== 'não' && e.tem_inconsistencia.toLowerCase() !== 'nao').length
  const semInconsistencia = dueConcluida.filter(e => !e.tem_inconsistencia || e.tem_inconsistencia.toLowerCase() === 'não' || e.tem_inconsistencia.toLowerCase() === 'nao').length
  const taxaInconsistencia = dueConcluida.length > 0 ? Math.round(comInconsistencia / dueConcluida.length * 100) : 0

  const latestByCard = {}
  visible.forEach(e => {
    if (!latestByCard[e.card_id] || e.entered_at > latestByCard[e.card_id].entered_at)
      latestByCard[e.card_id] = e
  })
  const latestCards = Object.values(latestByCard)

  const phaseMap = {}
  latestCards.forEach(e => { phaseMap[e.phase_name] = (phaseMap[e.phase_name] || 0) + 1 })
  const phaseData = Object.entries(phaseMap).sort(([, a], [, b]) => b - a).map(([name, count]) => ({ name, count }))

  // Tempo médio por fase (em dias)
  const PHASE_ORDER = ['BACKLOG - COMPLIANCE', 'AGUARDANDO DUE', 'DUE EM ANDAMENTO', 'DUE CONCLUÍDA']
  const phaseDurMap = {}
  visible.forEach(e => {
    if (!e.duration_minutes) return
    if (!phaseDurMap[e.phase_name]) phaseDurMap[e.phase_name] = []
    phaseDurMap[e.phase_name].push(e.duration_minutes)
  })

  // Para DUE CONCLUÍDA: tempo total desde entrada no BACKLOG até entrada na DUE CONCLUÍDA
  const backlogEntryByCard = {}
  const dueConcEntryByCard = {}
  visible.forEach(e => {
    if (e.phase_name === 'BACKLOG - COMPLIANCE') {
      if (!backlogEntryByCard[e.card_id] || e.entered_at < backlogEntryByCard[e.card_id])
        backlogEntryByCard[e.card_id] = e.entered_at
    }
    if (e.phase_name === 'DUE CONCLUÍDA') {
      if (!dueConcEntryByCard[e.card_id] || e.entered_at < dueConcEntryByCard[e.card_id])
        dueConcEntryByCard[e.card_id] = e.entered_at
    }
  })
  const totalTimeMins = []
  Object.keys(dueConcEntryByCard).forEach(cardId => {
    if (backlogEntryByCard[cardId]) {
      const diff = (new Date(dueConcEntryByCard[cardId]) - new Date(backlogEntryByCard[cardId])) / 60000
      if (diff > 0) totalTimeMins.push(diff)
    }
  })
  const avgTotal = totalTimeMins.length > 0 ? totalTimeMins.reduce((a, b) => a + b, 0) / totalTimeMins.length : null

  const fmtDias = (mins) => {
    if (!mins && mins !== 0) return '—'
    const d = mins / 60 / 24
    if (d < 1) return `${Math.round(mins / 60)}h`
    return `${d.toFixed(1)}d`
  }

  const tempoData = PHASE_ORDER.map(phase => {
    if (phase === 'DUE CONCLUÍDA') {
      return { name: phase, dias: avgTotal ? parseFloat((avgTotal / 60 / 24).toFixed(1)) : 0, label: fmtDias(avgTotal), isTotalTime: true }
    }
    const mins = phaseDurMap[phase]
    const avg = mins && mins.length > 0 ? mins.reduce((a, b) => a + b, 0) / mins.length : null
    return { name: phase, dias: avg ? parseFloat((avg / 60 / 24).toFixed(1)) : 0, label: fmtDias(avg) }
  })

  const ttStyle = { background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textPrimary }

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary, marginBottom: 4 }}>Compliance</h1>
          <p style={{ color: theme.textMuted, fontSize: 13 }}>Due diligence e análise de inconsistências — pipe COMPLIANCE.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setHideTest(h => !h)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, background: hideTest ? theme.cardBg : '#fef3c7', color: hideTest ? theme.textMuted : '#92400e', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: hideTest ? theme.textFaint : '#f59e0b', display: 'inline-block' }} />
            {hideTest ? 'Ocultar testes' : 'Ver testes'}
          </button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {loading && <div style={{ color: theme.textMuted, marginBottom: 24 }}>Carregando...</div>}

      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <KPICard label="Cards Únicos" value={totalCards} sub="no período" accent="#8b5cf6" />
        <KPICard label="Due Concluída" value={dueConcluida.length} sub="análises finalizadas" accent="#6366f1" />
        <KPICard label="Com Inconsistência" value={comInconsistencia} sub={`${taxaInconsistencia}% das dues`} accent="#ef4444" />
        <KPICard label="Sem Inconsistência" value={semInconsistencia} sub={dueConcluida.length > 0 ? `${100 - taxaInconsistencia}% das dues` : 'due limpa'} accent="#10b981" />
      </div>

      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <SectionTitle style={{ marginBottom: 0 }}>Due Concluída — Detalhes ({dueConcluida.length})</SectionTitle>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['todos', 'Todos'], ['com', 'Com Inconsistência'], ['sem', 'Sem Inconsistência']].map(([val, label]) => (
              <button key={val} onClick={() => setIncFilter(val)} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${incFilter === val ? (val === 'com' ? '#ef4444' : val === 'sem' ? '#10b981' : theme.border) : theme.border}`, background: incFilter === val ? (val === 'com' ? 'rgba(239,68,68,0.15)' : val === 'sem' ? 'rgba(16,185,129,0.15)' : theme.cardBg) : 'transparent', color: incFilter === val ? (val === 'com' ? '#ef4444' : val === 'sem' ? '#10b981' : theme.textPrimary) : theme.textMuted, fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 440 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2d3748' }}>
                {['Card', 'Inconsistência?', 'O que é', 'Doc faltando', 'Doc com dívida/processo', 'Data'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: theme.textMuted, fontWeight: 600, whiteSpace: 'nowrap', position: 'sticky', top: 0, background: theme.cardBg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dueConcluida.filter(e => {
                const hasInc = e.tem_inconsistencia && e.tem_inconsistencia.toLowerCase() !== 'não' && e.tem_inconsistencia.toLowerCase() !== 'nao'
                if (incFilter === 'com') return hasInc
                if (incFilter === 'sem') return !hasInc
                return true
              }).slice(0, 50).map(e => {
                const hasInc = e.tem_inconsistencia && e.tem_inconsistencia.toLowerCase() !== 'não' && e.tem_inconsistencia.toLowerCase() !== 'nao'
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid #1a1f2e' }}>
                    <td style={{ padding: '8px 12px', color: theme.textSecondary, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.card_title}</td>
                    <td style={{ padding: '8px 12px', color: hasInc ? '#ef4444' : '#10b981', whiteSpace: 'nowrap', fontWeight: 600 }}>{e.tem_inconsistencia || '—'}</td>
                    <td style={{ padding: '8px 12px', color: theme.textMuted, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.descricao_inconsistencia || '—'}</td>
                    <td style={{ padding: '8px 12px' }}><TruncatedCell value={e.doc_faltando} color="#f59e0b" /></td>
                    <td style={{ padding: '8px 12px' }}><TruncatedCell value={e.doc_divida_processo} color="#ef4444" /></td>
                    <td style={{ padding: '8px 12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{e.entered_at?.slice(0, 10)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24 }}>
          <SectionTitle>Etapa Atual dos Cards</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={phaseData} layout="vertical" barSize={18}>
              <XAxis type="number" stroke={theme.textFaint} tick={{ fill: theme.textSecondary, fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke={theme.textFaint} tick={{ fill: theme.textSecondary, fontSize: 10 }} width={160} />
              <Tooltip contentStyle={ttStyle} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                {phaseData.map((_, i) => <Cell key={i} fill={['#8b5cf6', '#6366f1', '#10b981', '#ef4444'][i % 4]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24 }}>
          <SectionTitle>Tempo Médio por Fase</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {tempoData.map(({ name, dias, label, isTotalTime }) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: isTotalTime ? '#10b981' : theme.textSecondary }}>
                    {name}{isTotalTime ? ' (backlog → concluída)' : ''}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isTotalTime ? '#10b981' : theme.textPrimary }}>{label}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: theme.border, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 3,
                    background: isTotalTime ? '#10b981' : '#8b5cf6',
                    width: dias > 0 ? `${Math.min(100, (dias / Math.max(...tempoData.map(t => t.dias), 1)) * 100)}%` : '0%',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
