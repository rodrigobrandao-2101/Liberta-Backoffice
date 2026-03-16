import { useTheme } from '../ThemeContext.jsx'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import DateRangePicker from '../components/DateRangePicker'

const LOST_PHASES = ['PERDIDO - DUE INCONSISTENTE']
const CLOSED_PHASES = ['ANEXADO NOS AUTOS']

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

export default function Juridico() {
  const { theme } = useTheme()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date(); const start = new Date()
    start.setDate(end.getDate() - 30)
    return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  })
  const [hideTest, setHideTest] = useState(true)

  useEffect(() => { fetchEvents() }, [dateRange])

  async function fetchEvents() {
    setLoading(true)
    let q = supabase.from('juridico_events').select('*').eq('is_deleted', false).order('entered_at', { ascending: false })
    if (dateRange[0]) q = q.gte('entered_at', dateRange[0])
    if (dateRange[1]) q = q.lte('entered_at', dateRange[1] + 'T23:59:59')
    const { data } = await q.limit(2000)
    setEvents(data || [])
    setLoading(false)
  }

  const visible = hideTest ? events.filter(e => !(e.card_title || '').toLowerCase().includes('[teste]')) : events

  const latestByCard = {}
  visible.forEach(e => {
    if (!latestByCard[e.card_id] || e.entered_at > latestByCard[e.card_id].entered_at)
      latestByCard[e.card_id] = e
  })
  const latest = Object.values(latestByCard)

  const totalCards = latest.length
  const concluidos = latest.filter(e => e.phase_name === 'ANÁLISE JURÍDICA - CONCLUÍDA').length
  const anexados = latest.filter(e => CLOSED_PHASES.includes(e.phase_name)).length
  const perdidos = latest.filter(e => LOST_PHASES.includes(e.phase_name)).length
  const emAndamento = totalCards - concluidos - anexados - perdidos

  const currentPhaseMap = {}
  latest.forEach(e => { currentPhaseMap[e.phase_name] = (currentPhaseMap[e.phase_name] || 0) + 1 })

  const PHASE_ORDER = [
    'DUE INCONSISTENTE',
    'ANÁLISE JURÍDICA - FILA',
    'ANÁLISE JURÍDICA - EM ANDAMENTO',
    'ANÁLISE JURÍDICA -CONCLUÍDA',
    'ANEXAR NOS AUTOS DO PROCESSO',
    'ANEXADO NOS AUTOS',
    'PERDIDO - DUE INCONSISTENTE',
  ]
  const phaseData = PHASE_ORDER
    .filter(p => currentPhaseMap[p])
    .map(p => ({ name: p.length > 28 ? p.slice(0, 26) + '…' : p, count: currentPhaseMap[p] }))
  // append any phase not in the predefined order
  Object.entries(currentPhaseMap)
    .filter(([p]) => !PHASE_ORDER.includes(p))
    .forEach(([p, c]) => phaseData.push({ name: p.length > 28 ? p.slice(0, 26) + '…' : p, count: c }))

  const fmt = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
  const totalExec = visible.reduce((s, e) => s + (e.valor_total_executado || 0), 0)
  const totalCedido = visible.reduce((s, e) => s + (e.valor_cedido_rpv || 0), 0)

  const ttStyle = { background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textPrimary }

  const JURIDICO_FUNNEL = [
    { label: 'Due Inconsistente', phaseName: 'DUE INCONSISTENTE', color: '#f59e0b' },
    { label: 'Análise - Fila', phaseName: 'ANÁLISE JURÍDICA - FILA', color: '#6366f1' },
    { label: 'Em Andamento', phaseName: 'ANÁLISE JURÍDICA - EM ANDAMENTO', color: '#8b5cf6' },
    { label: 'Concluída', phaseName: 'ANÁLISE JURÍDICA - CONCLUÍDA', color: '#06b6d4' },
    { label: 'Anexar nos Autos', phaseName: 'ANEXAR NOS AUTOS DO PROCESSO', color: '#3b82f6' },
    { label: 'Anexado nos Autos', phaseName: 'ANEXADO NOS AUTOS', color: '#10b981' },
  ]

  const throughputMap = {}
  visible.forEach(e => {
    if (!throughputMap[e.phase_name]) throughputMap[e.phase_name] = new Set()
    throughputMap[e.phase_name].add(e.card_id)
  })

  const funnelSteps = JURIDICO_FUNNEL.map(s => ({
    ...s,
    count: (throughputMap[s.phaseName] || new Set()).size,
  }))
  const funnelMax = funnelSteps[0]?.count || 1

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary, marginBottom: 4 }}>Jurídico</h1>
          <p style={{ color: theme.textMuted, fontSize: 13 }}>Análise jurídica e anexação nos autos — pipe JURÍDICO.</p>
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
        <KPICard label="Cards Únicos" value={totalCards} sub="no período" accent="#10b981" />
        <KPICard label="Em Andamento" value={emAndamento} sub="análise em curso" accent="#6366f1" />
        <KPICard label="Análise Concluída" value={concluidos} sub="prontos para anexar" accent="#06b6d4" />
        <KPICard label="Anexados nos Autos" value={anexados} sub="concluídos" accent="#10b981" />
        <KPICard label="Perdidos" value={perdidos} sub="due inconsistente" accent="#ef4444" />
      </div>

      {(totalExec > 0 || totalCedido > 0) && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          <KPICard label="Vol. Total Executado" value={fmt(totalExec)} sub="soma dos eventos" accent="#8b5cf6" />
          <KPICard label="Vol. Cedido RPV" value={fmt(totalCedido)} sub="líquido cedente" accent="#3b82f6" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24 }}>
          <SectionTitle>Etapa Atual dos Cards ({latest.length})</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={phaseData} layout="vertical" barSize={14}>
              <XAxis type="number" stroke={theme.textFaint} tick={{ fill: theme.textSecondary, fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke={theme.textFaint} tick={{ fill: theme.textSecondary, fontSize: 10 }} width={160} />
              <Tooltip contentStyle={ttStyle} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24 }}>
          <SectionTitle>Cards por Comarca</SectionTitle>
          {(() => {
            const comarcaMap = {}
            latest.forEach(e => { if (e.comarca) comarcaMap[e.comarca] = (comarcaMap[e.comarca] || 0) + 1 })
            const comarcaData = Object.entries(comarcaMap).sort(([, a], [, b]) => b - a).slice(0, 10)
              .map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 20) + '…' : name, count }))
            if (comarcaData.length === 0) return <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', paddingTop: 80 }}>Sem dados de comarca</div>
            return (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={comarcaData} layout="vertical" barSize={14}>
                  <XAxis type="number" stroke={theme.textFaint} tick={{ fill: theme.textSecondary, fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke={theme.textFaint} tick={{ fill: theme.textSecondary, fontSize: 10 }} width={160} />
                  <Tooltip contentStyle={ttStyle} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          })()}
        </div>
      </div>

      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <SectionTitle>Funil de Conversão — Volume Histórico por Fase</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {funnelSteps.map((step, i) => {
            const prev = i > 0 ? funnelSteps[i - 1].count : null
            const conv = prev > 0 ? Math.round(step.count / prev * 100) : null
            const barW = funnelMax > 0 ? Math.round((step.count / funnelMax) * 100) : 0
            const convColor = conv === null ? theme.textMuted : conv >= 80 ? '#10b981' : conv >= 50 ? '#f59e0b' : '#ef4444'
            return (
              <div key={step.phaseName}>
                {conv !== null && (
                  <div style={{ paddingLeft: 8, marginBottom: 4, fontSize: 11, color: convColor, fontWeight: 600 }}>
                    ↓ {conv}% chegaram aqui
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 160, fontSize: 12, color: theme.textSecondary, textAlign: 'right', flexShrink: 0 }}>{step.label}</div>
                  <div style={{ flex: 1, height: 22, background: theme.bg, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${barW}%`, height: '100%', background: step.color, borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ width: 40, fontSize: 13, fontWeight: 700, color: step.color, textAlign: 'right', flexShrink: 0 }}>{step.count}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24 }}>
        <SectionTitle>Últimos Eventos ({visible.length})</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2d3748' }}>
                {['Card', 'Fase', 'Entrou', 'Saiu', 'Duração (dias)', 'Comarca', 'Nº Cumprimento', 'Vol. Executado'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: theme.textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.slice(0, 100).map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid #1a1f2e' }}>
                  <td style={{ padding: '9px 12px', color: theme.textSecondary, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.card_title}</td>
                  <td style={{ padding: '9px 12px', color: theme.textPrimary, whiteSpace: 'nowrap' }}>{e.phase_name}</td>
                  <td style={{ padding: '9px 12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{e.entered_at?.slice(0, 10)}</td>
                  <td style={{ padding: '9px 12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{e.exited_at?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '9px 12px', color: theme.textSecondary, textAlign: 'right' }}>{e.duration_minutes ? Math.round(e.duration_minutes / 60 / 24) : '—'}</td>
                  <td style={{ padding: '9px 12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{e.comarca || '—'}</td>
                  <td style={{ padding: '9px 12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{e.numero_cumprimento_sentenca || '—'}</td>
                  <td style={{ padding: '9px 12px', color: theme.textSecondary, textAlign: 'right', whiteSpace: 'nowrap' }}>{e.valor_total_executado ? fmt(e.valor_total_executado) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
