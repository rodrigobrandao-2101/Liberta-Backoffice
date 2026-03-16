import { useTheme } from '../ThemeContext.jsx'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import DateRangePicker from '../components/DateRangePicker'

const USE_MOCK = false

const PHASE_TABS = ['TODOS', 'NAO IDENTIFICADO', 'QUALIFICADO', 'DESQUALIFICADO']

const PHASE_COLORS = {
  'NAO IDENTIFICADO': '#f59e0b',
  'QUALIFICADO': '#10b981',
  'DESQUALIFICADO': '#ef4444',
}

function generateMock() {
  const phases = ['NÃO IDENTIFICADO', 'QUALIFICADO', 'DESQUALIFICADO']
  const names = ['João Silva', 'Maria Souza', 'Carlos Lima', 'Ana Costa', 'Pedro Alves',
    'Fernanda Rocha', 'Lucas Mendes', 'Beatriz Nunes', 'Rafael Gomes', 'Juliana Pires',
    'Marcelo Teixeira', 'Camila Ferreira', 'Thiago Barbosa', 'Larissa Cardoso', 'Bruno Martins',
    'Priscila Oliveira', 'Diego Santos', 'Renata Castro', 'Gustavo Pereira', 'Vanessa Ribeiro',
    'Alexandre Cunha', 'Tatiane Moura', 'Fábio Correia', 'Daniela Lopes', 'Rodrigo Freitas',
    'Aline Carvalho', 'Eduardo Monteiro', 'Patrícia Vieira', 'Henrique Araujo', 'Sabrina Dias']
  const events = []
  const today = new Date()
  let cardCounter = 1000

  for (let i = 0; i < 31; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - (30 - i))
    const dailyLeads = Math.floor(Math.random() * 6) + 1

    for (let j = 0; j < dailyLeads; j++) {
      const cardId = `card-${cardCounter++}`
      const name = names[Math.floor(Math.random() * names.length)]
      const enteredAt = new Date(date)
      enteredAt.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60))

      // Todos entram em NÃO IDENTIFICADO
      const exitedAt = new Date(enteredAt)
      exitedAt.setHours(exitedAt.getHours() + Math.floor(Math.random() * 48) + 1)

      events.push({
        id: `${cardId}-nao`,
        card_id: cardId,
        card_title: name,
        pipe_name: 'SDR-COMERCIAL',
        phase_name: 'NÃO IDENTIFICADO',
        entered_at: enteredAt.toISOString(),
        exited_at: exitedAt.toISOString(),
        duration_minutes: Math.floor((exitedAt - enteredAt) / 60000),
      })

      // 60% avança para QUALIFICADO ou DESQUALIFICADO
      const rand = Math.random()
      if (rand < 0.38) {
        const nextEntered = new Date(exitedAt)
        events.push({
          id: `${cardId}-qual`,
          card_id: cardId,
          card_title: name,
          pipe_name: 'SDR-COMERCIAL',
          phase_name: 'QUALIFICADO',
          entered_at: nextEntered.toISOString(),
          exited_at: null,
          duration_minutes: null,
        })
      } else if (rand < 0.60) {
        const nextEntered = new Date(exitedAt)
        events.push({
          id: `${cardId}-desq`,
          card_id: cardId,
          card_title: name,
          pipe_name: 'SDR-COMERCIAL',
          phase_name: 'DESQUALIFICADO',
          entered_at: nextEntered.toISOString(),
          exited_at: null,
          duration_minutes: null,
        })
      }
    }
  }
  return events
}

function KPICard({ label, value, sub, accent }) {
  const { theme } = useTheme()
  return (
    <div style={{
      background: theme.cardBg, borderRadius: 12, padding: '20px 24px', flex: 1,
      borderTop: accent ? `3px solid ${accent}` : `3px solid ${theme.border}`,
    }}>
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

function ConvRates({ n, conversas, novasCon, total }) {
  const { theme } = useTheme()
  const fmt = (a, b) => b > 0 ? `${(a / b * 100).toFixed(2)}%` : '—'
  const rows = [
    { label: '/ conversas', value: fmt(n, conversas), color: '#10b981' },
    { label: '/ novas con.', value: fmt(n, novasCon),  color: '#06b6d4' },
    { label: '/ total leads', value: fmt(n, total),    color: '#6366f1' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
          <span style={{ color: theme.textMuted, fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
          <span style={{ color: r.color, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function SDR() {
  const { theme } = useTheme()
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date(); start.setDate(end.getDate() - 14)
    return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  })
  const [activePhase, setActivePhase] = useState('TODOS')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [metaRows, setMetaRows] = useState([])
  const [hideTest, setHideTest] = useState(true)
  const [comercialBacklog, setComercialBacklog] = useState([])

  useEffect(() => { fetchData() }, [dateRange])

  async function fetchData() {
    setLoading(true)
    if (USE_MOCK) {
      let mock = generateMock()
      if (dateRange[0]) mock = mock.filter(e => e.entered_at >= dateRange[0])
      if (dateRange[1]) mock = mock.filter(e => e.entered_at <= dateRange[1] + 'T23:59:59')
      setEvents(mock)
      setLoading(false)
      return
    }
    let q = supabase
      .from('sdr_events')
      .select('*')
      .eq('is_deleted', false)
      .order('entered_at', { ascending: true })
    if (dateRange[0]) q = q.gte('entered_at', dateRange[0] + 'T00:00:00-03:00')
    if (dateRange[1]) q = q.lte('entered_at', dateRange[1] + 'T23:59:59-03:00')

    let mq = supabase
      .from('meta_insights_daily')
      .select('date, messaging_conversations_started, new_messaging_connections')
    if (dateRange[0]) mq = mq.gte('date', dateRange[0])
    if (dateRange[1]) mq = mq.lte('date', dateRange[1])

    const bq = supabase
      .from('comercial_events')
      .select('card_title, entered_at')
      .eq('is_deleted', false)
      .eq('phase_name', 'BACKLOG - COMERCIAL')
      .limit(2000)

    const [{ data }, { data: mRows }, { data: bRows }] = await Promise.all([q.limit(5000), mq.limit(5000), bq])
    setEvents(data || [])
    setMetaRows(mRows || [])
    setComercialBacklog(bRows || [])
    setLoading(false)
  }

  // ── Meta Ads agregados ────────────────────────────────────────────────────
  const dailyMeta = {}
  metaRows.forEach(r => {
    const d = r.date?.slice(0, 10)
    if (!d) return
    if (!dailyMeta[d]) dailyMeta[d] = { conversas: 0, novasCon: 0 }
    dailyMeta[d].conversas += r.messaging_conversations_started || 0
    dailyMeta[d].novasCon  += r.new_messaging_connections || 0
  })
  const metaStats = {
    conversas: metaRows.reduce((s, r) => s + (r.messaging_conversations_started || 0), 0),
    novasCon:  metaRows.reduce((s, r) => s + (r.new_messaging_connections || 0), 0),
  }

  // ── Filtro de cards de teste ──────────────────────────────────────────────
  // SDR: card_title é telefone — checar is_test (DB), nome_completo e card_title
  const visibleEvents = hideTest
    ? events.filter(e => !e.is_test && !(e.card_title || '').toLowerCase().includes('[teste]') && !(e.nome_completo || '').toLowerCase().includes('[teste]'))
    : events

  // ── KPIs (always over all events in date range) ───────────────────────────
  const allCardIds = new Set(visibleEvents.map(e => e.card_id))
  const qualIds = new Set(visibleEvents.filter(e => e.phase_name === 'QUALIFICADO').map(e => e.card_id))
  const desqIds = new Set(visibleEvents.filter(e => e.phase_name === 'DESQUALIFICADO').map(e => e.card_id))
  const naoIds = new Set(visibleEvents.filter(e => e.phase_name === 'NAO IDENTIFICADO').map(e => e.card_id))
  const emAnalise = new Set([...naoIds].filter(id => !qualIds.has(id) && !desqIds.has(id)))

  const total = allCardIds.size
  const qual = qualIds.size
  const desq = desqIds.size
  const taxa = total > 0 ? Math.round(qual / total * 100) : 0

  // ── Filtered events for charts ────────────────────────────────────────────
  const filtered = activePhase === 'TODOS'
    ? visibleEvents
    : visibleEvents.filter(e => e.phase_name === activePhase)

  // Daily entries — 3 series: todos, qualificado, desqualificado
  // "Todos" = novos leads únicos por dia (primeiro evento do card)
  const firstEventByCard = {}
  visibleEvents.forEach(e => {
    if (!e.entered_at) return
    if (!firstEventByCard[e.card_id] || e.entered_at < firstEventByCard[e.card_id]) {
      firstEventByCard[e.card_id] = e.entered_at
    }
  })
  const dailyAll = {}
  Object.values(firstEventByCard).forEach(date => {
    const day = date?.slice(0, 10)
    if (day) dailyAll[day] = (dailyAll[day] || 0) + 1
  })

  const dailyQual = {}, dailyDesq = {}, dailyNao = {}
  visibleEvents.forEach(e => {
    const day = e.entered_at?.slice(0, 10)
    if (!day) return
    if (e.phase_name === 'QUALIFICADO')      dailyQual[day] = (dailyQual[day] || 0) + 1
    if (e.phase_name === 'DESQUALIFICADO')   dailyDesq[day] = (dailyDesq[day] || 0) + 1
    if (e.phase_name === 'NAO IDENTIFICADO') dailyNao[day]  = (dailyNao[day]  || 0) + 1
  })
  const eventDays = [...new Set([...Object.keys(dailyAll), ...Object.keys(dailyQual), ...Object.keys(dailyDesq)])].sort()
  const rangeStart = dateRange[0] || eventDays[0]
  const rangeEnd   = dateRange[1] || eventDays[eventDays.length - 1]
  const allDays = []
  if (rangeStart && rangeEnd) {
    const cur = new Date(rangeStart + 'T00:00:00')
    const last = new Date(rangeEnd + 'T00:00:00')
    while (cur <= last) {
      allDays.push(cur.toISOString().slice(0, 10))
      cur.setDate(cur.getDate() + 1)
    }
  }
  const dailyData = allDays.map(day => ({
    date: day.slice(8) + '/' + day.slice(5, 7),
    todos: dailyAll[day] || 0,
    qualificado: dailyQual[day] || 0,
    desqualificado: dailyDesq[day] || 0,
  }))
  const pct = (n, d) => d > 0 ? `${Math.round(n / d * 100)}%` : '—'

  // Formatação condicional: red→yellow→green (invert=false) ou green→yellow→red (invert=true)
  function taxaColor(pctStr, invert = false) {
    if (!pctStr || pctStr === '—') return theme.textMuted
    const raw = parseInt(pctStr)
    if (isNaN(raw)) return theme.textMuted
    let v = raw / 100
    if (invert) v = 1 - v
    const red = [239, 68, 68], yel = [245, 158, 11], grn = [16, 185, 129]
    const c = v <= 0.5
      ? red.map((ch, i) => Math.round(ch + (yel[i] - ch) * (v * 2)))
      : yel.map((ch, i) => Math.round(ch + (grn[i] - ch) * ((v - 0.5) * 2)))
    return `rgb(${c[0]},${c[1]},${c[2]})`
  }
  const tableData = allDays.map(day => {
    const t = dailyAll[day] || 0
    const q = dailyQual[day] || 0
    const d = dailyDesq[day] || 0
    const a = dailyNao[day] || 0
    const brDate = day.slice(8) + '/' + day.slice(5, 7) + '/' + day.slice(0, 4)
    return { date: brDate, iso: day, todos: t, analise: a, txAnalise: pct(a, t), qual: q, txQual: pct(q, t), desq: d, txDesq: pct(d, t) }
  }).reverse()

  // ── Qualificados × Backlog Comercial ─────────────────────────────────────
  // Cruzamento por nome_completo (SDR) ↔ card_title (Comercial)
  const backlogByName = {}
  comercialBacklog.forEach(r => {
    const key = (r.card_title || '').trim().toLowerCase()
    if (key) backlogByName[key] = r.entered_at
  })

  const qualRows = []
  const seenQualCards = {}
  ;[...visibleEvents].reverse().forEach(e => {
    if (e.phase_name !== 'QUALIFICADO') return
    if (seenQualCards[e.card_id]) return
    seenQualCards[e.card_id] = true
    const nomeLower = (e.nome_completo || '').trim().toLowerCase()
    const backlogAt = backlogByName[nomeLower] || null
    qualRows.push({
      data: e.entered_at?.slice(0, 10),
      nomeCompleto: e.nome_completo || '—',
      telefone: e.card_title || '—',
      numeroProcesso: e.numero_processo || '—',
      dataHoraQual: e.entered_at,
      noBacklog: !!backlogAt,
      dataHoraBacklog: backlogAt || null,
    })
  })
  qualRows.sort((a, b) => (b.dataHoraQual || '').localeCompare(a.dataHoraQual || ''))

  const desqRows = []
  const seenDesqCards = {}
  ;[...visibleEvents].reverse().forEach(e => {
    if (e.phase_name !== 'DESQUALIFICADO') return
    if (seenDesqCards[e.card_id]) return
    seenDesqCards[e.card_id] = true
    desqRows.push({
      data: e.entered_at?.slice(0, 10),
      nomeCompleto: e.nome_completo || '—',
      telefone: e.card_title || '—',
      numeroProcesso: e.numero_processo || '—',
      qualificado: e.todos_os_campos_acima_s_o_de_um_lead_qualificado || '—',
      motivo: e.motivo_desqualificado || '—',
      dataHoraDesq: e.entered_at,
    })
  })
  desqRows.sort((a, b) => (b.dataHoraDesq || '').localeCompare(a.dataHoraDesq || ''))

  function fmtDT(iso) {
    if (!iso) return '—'
    const brt = new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(brt.getUTCDate())}/${pad(brt.getUTCMonth() + 1)}/${brt.getUTCFullYear()} ${pad(brt.getUTCHours())}:${pad(brt.getUTCMinutes())}`
  }

  // Phase distribution
  const phaseMap = {}
  visibleEvents.forEach(e => {
    if (e.phase_name) phaseMap[e.phase_name] = (phaseMap[e.phase_name] || 0) + 1
  })
  const phaseData = Object.entries(phaseMap).map(([name, count]) => ({
    name, count, color: PHASE_COLORS[name] || '#6366f1',
  }))

  // Funnel
  const funnelData = [
    { name: 'Total Leads', value: total, color: '#6366f1' },
    { name: 'Em Análise', value: emAnalise.size, color: '#f59e0b' },
    { name: 'Qualificados', value: qual, color: '#10b981' },
    { name: 'Desqualificados', value: desq, color: '#ef4444' },
  ]

  // ── Styles ────────────────────────────────────────────────────────────────
  const tabStyle = active => ({
    padding: '7px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
    background: active ? '#4f46e5' : 'transparent',
    color: active ? '#fff' : theme.textMuted,
    border: 'none', fontWeight: active ? 600 : 400,
    whiteSpace: 'nowrap',
  })

  const ttStyle = { background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textPrimary }

  return (
    <div style={{ padding: '32px 40px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary, marginBottom: 4 }}>SDR</h1>
          <p style={{ color: theme.textMuted, fontSize: 13 }}>Qualificação de leads — pipe SDR-COMERCIAL</p>
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

      {/* ── KPIs ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {/* Meta Ads — card unificado */}
        <div style={{ flex: 2, background: theme.cardBg, borderRadius: 12, padding: '20px 24px', borderTop: '3px solid #10b981' }}>
          <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Meta Ads</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#10b981' }}>{metaStats.conversas}</div>
              <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>Conversas iniciadas</div>
            </div>
            <div style={{ width: 1, background: '#2d3748', alignSelf: 'stretch' }} />
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#06b6d4' }}>{metaStats.novasCon}</div>
              <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>Novas conexões</div>
            </div>
          </div>
        </div>
        <KPICard label="Total de Leads" value={total} sub="cards únicos no período" accent="#6366f1" />

        {/* Em Análise — card unificado */}
        <div style={{ flex: 2, background: theme.cardBg, borderRadius: 12, padding: '20px 24px', borderTop: '3px solid #f59e0b' }}>
          <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Em Análise</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#f59e0b' }}>{emAnalise.size}</div>
              <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>sem decisão</div>
            </div>
            <div style={{ width: 1, background: '#2d3748', alignSelf: 'stretch' }} />
            <ConvRates n={emAnalise.size} conversas={metaStats.conversas} novasCon={metaStats.novasCon} total={total} />
          </div>
        </div>

        {/* Qualificados — card unificado */}
        <div style={{ flex: 2, background: theme.cardBg, borderRadius: 12, padding: '20px 24px', borderTop: '3px solid #10b981' }}>
          <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Qualificados</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#10b981' }}>{qual}</div>
              <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>qualificados</div>
            </div>
            <div style={{ width: 1, background: '#2d3748', alignSelf: 'stretch' }} />
            <ConvRates n={qual} conversas={metaStats.conversas} novasCon={metaStats.novasCon} total={total} />
          </div>
        </div>

        {/* Desqualificados — card unificado */}
        <div style={{ flex: 2, background: theme.cardBg, borderRadius: 12, padding: '20px 24px', borderTop: '3px solid #ef4444' }}>
          <div style={{ color: theme.textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Desqualificados</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#ef4444' }}>{desq}</div>
              <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>perdidos</div>
            </div>
            <div style={{ width: 1, background: '#2d3748', alignSelf: 'stretch' }} />
            <ConvRates n={desq} conversas={metaStats.conversas} novasCon={metaStats.novasCon} total={total} />
          </div>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div style={{ marginBottom: 24 }}>
        {/* Entradas por dia */}
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24 }}>
          <SectionTitle>Entradas por Dia</SectionTitle>
          {dailyData.length === 0
            ? <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', paddingTop: 80 }}>Sem dados no período</div>
            : (
              <>
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={dailyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <XAxis dataKey="date" stroke={theme.textFaint} tick={{ fill: theme.textSecondary, fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis stroke={theme.textFaint} tick={{ fill: theme.textSecondary, fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={ttStyle} />
                    <Line type="monotone" dataKey="todos" stroke="#6366f1" strokeWidth={2} dot={false} name="Todos" />
                    <Line type="monotone" dataKey="qualificado" stroke="#10b981" strokeWidth={2} dot={false} name="Qualificado" />
                    <Line type="monotone" dataKey="desqualificado" stroke="#ef4444" strokeWidth={2} dot={false} name="Desqualificado" />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 10 }}>
                  {[
                    { color: '#6366f1', label: 'Todos' },
                    { color: '#10b981', label: 'Qualificado' },
                    { color: '#ef4444', label: 'Desqualificado' },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: 12, color: theme.textSecondary }}>{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </div>

      </div>

{/* ── Tabela diária ── */}
      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, marginTop: 24 }}>
        <SectionTitle>Breakdown Diário</SectionTitle>
        {(() => {
          const tTodos   = tableData.reduce((s, r) => s + r.todos, 0)
          const tAnalise = tableData.reduce((s, r) => s + r.analise, 0)
          const tQual    = tableData.reduce((s, r) => s + r.qual, 0)
          const tDesq    = tableData.reduce((s, r) => s + r.desq, 0)
          const thStyle = (align) => ({ padding: '10px 14px', color: theme.textMuted, fontWeight: 600, textAlign: align, whiteSpace: 'nowrap', background: theme.cardBg, position: 'sticky', top: 0, zIndex: 2, borderBottom: '1px solid #2d3748' })
          const tfStyle = (color) => ({ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color, background: '#16192a', position: 'sticky', bottom: 0, zIndex: 2, borderTop: '2px solid #2d3748', whiteSpace: 'nowrap' })
          return (
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 322 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Data', 'Conversas', 'Novas Con.', 'Leads', 'Em Análise', 'Tx Análise', 'Qualificados', 'Tx Qualificados', 'Desqualificados', 'Tx Desqualificados'].map(h => (
                      <th key={h} style={thStyle(h === 'Data' ? 'left' : 'center')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(row => {
                    const conv  = dailyMeta[row.iso]?.conversas || 0
                    const novas = dailyMeta[row.iso]?.novasCon  || 0
                    return (
                      <tr key={row.date} style={{ borderBottom: '1px solid #1a1f2e' }}>
                        <td style={{ padding: '9px 14px', color: theme.textSecondary }}>{row.date}</td>
                        <td style={{ padding: '9px 14px', color: '#10b981', textAlign: 'center' }}>{conv || '—'}</td>
                        <td style={{ padding: '9px 14px', color: '#06b6d4', textAlign: 'center' }}>{novas || '—'}</td>
                        <td style={{ padding: '9px 14px', color: '#a5b4fc', textAlign: 'center', fontWeight: 600 }}>{row.todos}</td>
                        <td style={{ padding: '9px 14px', color: '#fbbf24', textAlign: 'center' }}>{row.analise}</td>
                        <td style={{ padding: '9px 14px', color: theme.textMuted, textAlign: 'center' }}>{row.txAnalise}</td>
                        <td style={{ padding: '9px 14px', color: '#34d399', textAlign: 'center' }}>{row.qual}</td>
                        <td style={{ padding: '9px 14px', color: taxaColor(row.txQual, false), textAlign: 'center', fontWeight: 600 }}>{row.txQual}</td>
                        <td style={{ padding: '9px 14px', color: '#f87171', textAlign: 'center' }}>{row.desq}</td>
                        <td style={{ padding: '9px 14px', color: taxaColor(row.txDesq, true), textAlign: 'center', fontWeight: 600 }}>{row.txDesq}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ ...tfStyle(theme.textPrimary), textAlign: 'left' }}>Total</td>
                    <td style={tfStyle('#10b981')}>{metaStats.conversas}</td>
                    <td style={tfStyle('#06b6d4')}>{metaStats.novasCon}</td>
                    <td style={tfStyle('#a5b4fc')}>{tTodos}</td>
                    <td style={tfStyle('#fbbf24')}>{tAnalise}</td>
                    <td style={tfStyle(theme.textMuted)}>{pct(tAnalise, tTodos)}</td>
                    <td style={tfStyle('#34d399')}>{tQual}</td>
                    <td style={tfStyle(taxaColor(pct(tQual, tTodos), false))}>{pct(tQual, tTodos)}</td>
                    <td style={tfStyle('#f87171')}>{tDesq}</td>
                    <td style={tfStyle(taxaColor(pct(tDesq, tTodos), true))}>{pct(tDesq, tTodos)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        })()}
      </div>

      {/* ── Qualificados × Backlog Comercial ── */}
      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            Cliente Qualificado — Conferência Backlog Comercial
          </h2>
          <p style={{ color: '#475569', fontSize: 12, marginTop: 4, marginBottom: 0 }}>{qualRows.length} leads qualificados no período</p>
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 400 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Data', 'Nome Completo', 'Telefone', 'Nº Processo', 'Qualificado', 'Data/Hora Qualificação', 'No Backlog', 'Data/Hora Backlog'].map(h => (
                  <th key={h} style={{ padding: '9px 12px', color: theme.textMuted, fontWeight: 600, textAlign: 'left', background: theme.cardBg, position: 'sticky', top: 0, zIndex: 2, borderBottom: '1px solid #2d3748', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {qualRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1f2e' }}>
                  <td style={{ padding: '8px 12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{row.data || '—'}</td>
                  <td style={{ padding: '8px 12px', color: theme.textPrimary, whiteSpace: 'nowrap' }}>{row.nomeCompleto}</td>
                  <td style={{ padding: '8px 12px', color: theme.textSecondary, whiteSpace: 'nowrap' }}>{row.telefone}</td>
                  <td style={{ padding: '8px 12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{row.numeroProcesso}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ background: '#05301e', color: '#10b981', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>SIM</span>
                  </td>
                  <td style={{ padding: '8px 12px', color: theme.textSecondary, whiteSpace: 'nowrap' }}>{fmtDT(row.dataHoraQual)}</td>
                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                    {row.noBacklog
                      ? <span style={{ background: '#05301e', color: '#10b981', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>SIM</span>
                      : <span style={{ background: '#2d0a0a', color: '#ef4444', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>NÃO</span>}
                  </td>
                  <td style={{ padding: '8px 12px', color: row.noBacklog ? '#10b981' : '#475569', whiteSpace: 'nowrap' }}>{fmtDT(row.dataHoraBacklog)}</td>
                </tr>
              ))}
              {qualRows.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#475569' }}>Nenhum lead qualificado no período</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Desqualificados — Motivo ── */}
      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            Cliente Desqualificado — Motivo
          </h2>
          <p style={{ color: '#475569', fontSize: 12, marginTop: 4, marginBottom: 0 }}>{desqRows.length} leads desqualificados no período</p>
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 400 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Data', 'Nome Completo', 'Telefone', 'Nº Processo', 'Qualificado', 'Motivo Desqualificado'].map(h => (
                  <th key={h} style={{ padding: '9px 12px', color: theme.textMuted, fontWeight: 600, textAlign: 'left', background: theme.cardBg, position: 'sticky', top: 0, zIndex: 2, borderBottom: '1px solid #2d3748', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {desqRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1f2e' }}>
                  <td style={{ padding: '8px 12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{row.data || '—'}</td>
                  <td style={{ padding: '8px 12px', color: theme.textPrimary, whiteSpace: 'nowrap' }}>{row.nomeCompleto}</td>
                  <td style={{ padding: '8px 12px', color: theme.textSecondary, whiteSpace: 'nowrap' }}>{row.telefone}</td>
                  <td style={{ padding: '8px 12px', color: theme.textMuted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.numeroProcesso}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ background: '#2d0a0a', color: '#ef4444', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>NÃO</span>
                  </td>
                  <td style={{ padding: '8px 12px', color: '#fbbf24', whiteSpace: 'nowrap' }}>{row.motivo}</td>
                </tr>
              ))}
              {desqRows.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#475569' }}>Nenhum lead desqualificado no período</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
