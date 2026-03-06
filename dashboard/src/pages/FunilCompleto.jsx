import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import DateRangePicker from '../components/DateRangePicker'

const PIPES = [
  'Liberta Precatórios',
  'SDR-COMERCIAL',
  'COMERCIAL',
  'COMPLIANCE',
  'JURIDICO',
  'FINANCEIRO',
]

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

function KPICard({ label, value, sub }) {
  return (
    <div style={{ background: '#1e2130', borderRadius: 12, padding: '20px 24px', flex: 1 }}>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9' }}>{value}</div>
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

export default function FunilCompleto() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [pipe, setPipe] = useState('all')
  const [dateRange, setDateRange] = useState(['', ''])

  useEffect(() => {
    fetchEvents()
  }, [pipe, dateRange])

  async function fetchEvents() {
    setLoading(true)
    let q = supabase.from('pipeline_events').select('*').order('entered_at', { ascending: false })
    if (pipe !== 'all') q = q.eq('pipe_name', pipe)
    if (dateRange[0]) q = q.gte('entered_at', dateRange[0])
    if (dateRange[1]) q = q.lte('entered_at', dateRange[1] + 'T23:59:59')
    const { data, error } = await q.limit(2000)
    if (!error) setEvents(data || [])
    setLoading(false)
  }

  const totalCards = new Set(events.map(e => e.card_id)).size
  const activeCards = new Set(events.filter(e => !e.exited_at).map(e => e.card_id)).size
  const totalCredit = events.reduce((s, e) => s + (e.valor_credito || 0), 0)
  const totalPaid = events.reduce((s, e) => s + (e.valor_pago_cedente || 0), 0)
  const totalProposals = events.reduce((s, e) => s + (e.valor_proposta_cliente || 0), 0)

  const dailyMap = {}
  events.forEach(e => {
    const day = e.entered_at?.slice(0, 10)
    if (!day) return
    dailyMap[day] = (dailyMap[day] || 0) + 1
  })
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, count]) => ({ date: date.slice(5), count }))

  const pipeMap = {}
  events.forEach(e => { pipeMap[e.pipe_name] = (pipeMap[e.pipe_name] || 0) + 1 })
  const pipeData = Object.entries(pipeMap).map(([name, count]) => ({ name: name.split(' ')[0], count }))

  const phaseMap = {}
  events.forEach(e => { phaseMap[e.phase_name] = (phaseMap[e.phase_name] || 0) + 1 })
  const phaseData = Object.entries(phaseMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, count }))

  const durationMap = {}
  const durationCount = {}
  events.forEach(e => {
    if (e.duration_minutes && e.duration_minutes > 0) {
      durationMap[e.phase_name] = (durationMap[e.phase_name] || 0) + e.duration_minutes
      durationCount[e.phase_name] = (durationCount[e.phase_name] || 0) + 1
    }
  })
  const durationData = Object.entries(durationMap)
    .map(([name, total]) => ({ name: name.length > 18 ? name.slice(0, 16) + '…' : name, avg: Math.round(total / durationCount[name] / 60 / 24) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)

  const fmt = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)

  const selectStyle = {
    background: '#1e2130', border: '1px solid #2d3748', color: '#e2e8f0',
    borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Funil Completo</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Visão geral de todos os pipes</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select value={pipe} onChange={e => setPipe(e.target.value)} style={selectStyle}>
            <option value="all">Todos os pipes</option>
            {PIPES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {loading && <div style={{ color: '#64748b', marginBottom: 24 }}>Carregando...</div>}

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <KPICard label="Cards Únicos" value={totalCards} sub={`${activeCards} ativos`} />
        <KPICard label="Volume de Crédito" value={fmt(totalCredit)} sub="soma dos eventos" />
        <KPICard label="Propostas Clientes" value={fmt(totalProposals)} sub="valor total" />
        <KPICard label="Pago ao Cedente" value={fmt(totalPaid)} sub="realizado" />
        <KPICard label="Total de Eventos" value={events.length} sub="registros na base" />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ background: '#1e2130', borderRadius: 12, padding: 24 }}>
          <SectionTitle>Entradas por Dia (últimos 14 dias)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData} barSize={20}>
              <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f1117', border: '1px solid #2d3748', color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#1e2130', borderRadius: 12, padding: 24 }}>
          <SectionTitle>Eventos por Pipe</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pipeData} barSize={28}>
              <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f1117', border: '1px solid #2d3748', color: '#e2e8f0' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {pipeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ background: '#1e2130', borderRadius: 12, padding: 24 }}>
          <SectionTitle>Top Fases por Volume</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={phaseData} layout="vertical" barSize={14}>
              <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} width={130} />
              <Tooltip contentStyle={{ background: '#0f1117', border: '1px solid #2d3748', color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#1e2130', borderRadius: 12, padding: 24 }}>
          <SectionTitle>Tempo Médio por Fase (dias)</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={durationData} layout="vertical" barSize={14}>
              <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} width={130} />
              <Tooltip contentStyle={{ background: '#0f1117', border: '1px solid #2d3748', color: '#e2e8f0' }} />
              <Bar dataKey="avg" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events table */}
      <div style={{ background: '#1e2130', borderRadius: 12, padding: 24 }}>
        <SectionTitle>Últimos Eventos ({events.length})</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2d3748' }}>
                {['Card', 'Pipe', 'Fase', 'Entrou', 'Saiu', 'Duração (dias)', 'Crédito', 'Pago'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 100).map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid #1a1f2e' }}>
                  <td style={{ padding: '9px 12px', color: '#94a3b8', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.card_title}</td>
                  <td style={{ padding: '9px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>{e.pipe_name}</td>
                  <td style={{ padding: '9px 12px', color: '#e2e8f0', whiteSpace: 'nowrap' }}>{e.phase_name}</td>
                  <td style={{ padding: '9px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>{e.entered_at?.slice(0, 10)}</td>
                  <td style={{ padding: '9px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>{e.exited_at?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '9px 12px', color: '#94a3b8', textAlign: 'right' }}>
                    {e.duration_minutes ? Math.round(e.duration_minutes / 60 / 24) : '—'}
                  </td>
                  <td style={{ padding: '9px 12px', color: '#94a3b8', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {e.valor_credito ? fmt(e.valor_credito) : '—'}
                  </td>
                  <td style={{ padding: '9px 12px', color: '#10b981', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {e.valor_pago_cedente ? fmt(e.valor_pago_cedente) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
