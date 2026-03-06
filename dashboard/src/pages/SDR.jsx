import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import DateRangePicker from '../components/DateRangePicker'

const USE_MOCK = true //← mude para false quando o banco tiver dados reais

const PHASE_TABS = ['TODOS', 'NÃO IDENTIFICADO', 'QUALIFICADO', 'DESQUALIFICADO']

const PHASE_COLORS = {
  'NÃO IDENTIFICADO': '#f59e0b',
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
  return (
    <div style={{
      background: '#1e2130', borderRadius: 12, padding: '20px 24px', flex: 1,
      borderTop: accent ? `3px solid ${accent}` : '3px solid #2d3748',
    }}>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || '#f1f5f9' }}>{value}</div>
      {sub && <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
      {children}
    </h2>
  )
}

export default function SDR() {
  const [dateRange, setDateRange] = useState(['', ''])
  const [activePhase, setActivePhase] = useState('TODOS')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

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
      .from('pipeline_events')
      .select('*')
      .eq('pipe_name', 'SDR-COMERCIAL')
      .order('entered_at', { ascending: true })
    if (dateRange[0]) q = q.gte('entered_at', dateRange[0])
    if (dateRange[1]) q = q.lte('entered_at', dateRange[1] + 'T23:59:59')
    const { data } = await q.limit(5000)
    setEvents(data || [])
    setLoading(false)
  }

  // ── KPIs (always over all events in date range) ───────────────────────────
  const allCardIds = new Set(events.map(e => e.card_id))
  const qualIds = new Set(events.filter(e => e.phase_name === 'QUALIFICADO').map(e => e.card_id))
  const desqIds = new Set(events.filter(e => e.phase_name === 'DESQUALIFICADO').map(e => e.card_id))
  const naoIds = new Set(events.filter(e => e.phase_name === 'NÃO IDENTIFICADO').map(e => e.card_id))
  const emAnalise = new Set([...naoIds].filter(id => !qualIds.has(id) && !desqIds.has(id)))

  const total = allCardIds.size
  const qual = qualIds.size
  const desq = desqIds.size
  const taxa = total > 0 ? Math.round(qual / total * 100) : 0

  // ── Filtered events for charts ────────────────────────────────────────────
  const filtered = activePhase === 'TODOS'
    ? events
    : events.filter(e => e.phase_name === activePhase)

  // Daily entries — 3 series: todos, qualificado, desqualificado
  const dailyAll = {}, dailyQual = {}, dailyDesq = {}, dailyNao = {}
  events.forEach(e => {
    const day = e.entered_at?.slice(0, 10)
    if (!day) return
    dailyAll[day] = (dailyAll[day] || 0) + 1
    if (e.phase_name === 'QUALIFICADO')    dailyQual[day] = (dailyQual[day] || 0) + 1
    if (e.phase_name === 'DESQUALIFICADO') dailyDesq[day] = (dailyDesq[day] || 0) + 1
    if (e.phase_name === 'NÃO IDENTIFICADO') dailyNao[day] = (dailyNao[day] || 0) + 1
  })
  const allDays = [...new Set([...Object.keys(dailyAll), ...Object.keys(dailyQual), ...Object.keys(dailyDesq)])].sort()
  const dailyData = allDays.map(day => ({
    date: day.slice(8) + '/' + day.slice(5, 7),
    todos: dailyAll[day] || 0,
    qualificado: dailyQual[day] || 0,
    desqualificado: dailyDesq[day] || 0,
  }))
  const pct = (n, d) => d > 0 ? `${Math.round(n / d * 100)}%` : '—'

  // Formatação condicional: red→yellow→green (invert=false) ou green→yellow→red (invert=true)
  function taxaColor(pctStr, invert = false) {
    if (!pctStr || pctStr === '—') return '#64748b'
    const raw = parseInt(pctStr)
    if (isNaN(raw)) return '#64748b'
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
    return { date: brDate, todos: t, analise: a, txAnalise: pct(a, t), qual: q, txQual: pct(q, t), desq: d, txDesq: pct(d, t) }
  }).reverse()

  // Phase distribution
  const phaseMap = {}
  events.forEach(e => {
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
    color: active ? '#fff' : '#64748b',
    border: 'none', fontWeight: active ? 600 : 400,
    whiteSpace: 'nowrap',
  })

  const ttStyle = { background: '#0f1117', border: '1px solid #2d3748', color: '#e2e8f0' }

  return (
    <div style={{ padding: '32px 40px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>SDR</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Qualificação de leads — pipe SDR-COMERCIAL</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

{loading && <div style={{ color: '#64748b', marginBottom: 24 }}>Carregando...</div>}

      {/* ── KPIs ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <KPICard label="Total de Leads" value={total} sub="cards únicos no período" accent="#6366f1" />
        <KPICard label="Em Análise" value={emAnalise.size} sub="ainda sem decisão" accent="#f59e0b" />
        <KPICard label="Taxa em Análise" value={`${total > 0 ? Math.round(emAnalise.size / total * 100) : 0}%`} sub="em análise / total de leads" />
        <KPICard label="Qualificados" value={qual} sub={`${taxa}% de conversão`} accent="#10b981" />
        <KPICard label="Taxa de Qualificação" value={`${taxa}%`} sub="qualificados / total de leads" />
        <KPICard label="Desqualificados" value={desq} sub="leads perdidos" accent="#ef4444" />
        <KPICard label="Taxa de Desqualificação" value={`${total > 0 ? Math.round(desq / total * 100) : 0}%`} sub="desqualificados / total de leads" />
      </div>

      {/* ── Charts row ── */}
      <div style={{ marginBottom: 24 }}>
        {/* Entradas por dia */}
        <div style={{ background: '#1e2130', borderRadius: 12, padding: 24 }}>
          <SectionTitle>Entradas por Dia</SectionTitle>
          {dailyData.length === 0
            ? <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', paddingTop: 80 }}>Sem dados no período</div>
            : (
              <>
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={dailyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
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
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </div>

      </div>

{/* ── Tabela diária ── */}
      <div style={{ background: '#1e2130', borderRadius: 12, padding: 24, marginTop: 24 }}>
        <SectionTitle>Breakdown Diário</SectionTitle>
        {(() => {
          const tTodos   = tableData.reduce((s, r) => s + r.todos, 0)
          const tAnalise = tableData.reduce((s, r) => s + r.analise, 0)
          const tQual    = tableData.reduce((s, r) => s + r.qual, 0)
          const tDesq    = tableData.reduce((s, r) => s + r.desq, 0)
          const thStyle = (align) => ({ padding: '10px 14px', color: '#64748b', fontWeight: 600, textAlign: align, whiteSpace: 'nowrap', background: '#1e2130', position: 'sticky', top: 0, zIndex: 2, borderBottom: '1px solid #2d3748' })
          const tfStyle = (color) => ({ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color, background: '#16192a', position: 'sticky', bottom: 0, zIndex: 2, borderTop: '2px solid #2d3748', whiteSpace: 'nowrap' })
          return (
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 322 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Data', 'Todos', 'Em Análise', 'Tx Análise', 'Qualificados', 'Tx Qualificados', 'Desqualificados', 'Tx Desqualificados'].map(h => (
                      <th key={h} style={thStyle(h === 'Data' ? 'left' : 'center')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(row => (
                    <tr key={row.date} style={{ borderBottom: '1px solid #1a1f2e' }}>
                      <td style={{ padding: '9px 14px', color: '#94a3b8' }}>{row.date}</td>
                      <td style={{ padding: '9px 14px', color: '#a5b4fc', textAlign: 'center', fontWeight: 600 }}>{row.todos}</td>
                      <td style={{ padding: '9px 14px', color: '#fbbf24', textAlign: 'center' }}>{row.analise}</td>
                      <td style={{ padding: '9px 14px', color: '#64748b', textAlign: 'center' }}>{row.txAnalise}</td>
                      <td style={{ padding: '9px 14px', color: '#34d399', textAlign: 'center' }}>{row.qual}</td>
                      <td style={{ padding: '9px 14px', color: taxaColor(row.txQual, false), textAlign: 'center', fontWeight: 600 }}>{row.txQual}</td>
                      <td style={{ padding: '9px 14px', color: '#f87171', textAlign: 'center' }}>{row.desq}</td>
                      <td style={{ padding: '9px 14px', color: taxaColor(row.txDesq, true), textAlign: 'center', fontWeight: 600 }}>{row.txDesq}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ ...tfStyle('#f1f5f9'), textAlign: 'left' }}>Total</td>
                    <td style={tfStyle('#a5b4fc')}>{tTodos}</td>
                    <td style={tfStyle('#fbbf24')}>{tAnalise}</td>
                    <td style={tfStyle('#64748b')}>{pct(tAnalise, tTodos)}</td>
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

    </div>
  )
}
