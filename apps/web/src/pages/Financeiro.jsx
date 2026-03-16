import { useTheme } from '../ThemeContext.jsx'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import DateRangePicker from '../components/DateRangePicker'

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

export default function Financeiro() {
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
    let q = supabase.from('financeiro_events').select('*').eq('is_deleted', false).order('entered_at', { ascending: false })
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
  const liberados = visible.filter(e => e.phase_name === 'PAGAMENTO LIBERADO').length
  const realizados = latest.filter(e => e.phase_name === 'PAGAMENTO REALIZADO').length

  const finalByCard = {}
  visible.forEach(e => {
    if (e.valor_final_da_proposta)
      finalByCard[e.card_id] = Math.max(finalByCard[e.card_id] || 0, e.valor_final_da_proposta)
  })
  const volTotal = Object.values(finalByCard).reduce((s, v) => s + v, 0)
  const volRealizado = latest
    .filter(e => e.phase_name === 'PAGAMENTO REALIZADO')
    .reduce((s, e) => s + (finalByCard[e.card_id] || 0), 0)
  const ticketMedio = realizados > 0 ? volRealizado / realizados : 0

  const fmt = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)

  // Pagamentos por dia (fase PAGAMENTO REALIZADO)
  const dailyMap = {}
  visible.filter(e => e.phase_name === 'PAGAMENTO REALIZADO').forEach(e => {
    const day = e.entered_at?.slice(0, 10)
    if (!day) return
    if (!dailyMap[day]) dailyMap[day] = { count: 0, valor: 0 }
    dailyMap[day].count++
    dailyMap[day].valor += e.valor_final_da_proposta || 0
  })
  const allDays = []
  if (dateRange[0] && dateRange[1]) {
    const cur = new Date(dateRange[0] + 'T00:00:00')
    const last = new Date(dateRange[1] + 'T00:00:00')
    while (cur <= last) { allDays.push(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1) }
  }
  const dailyData = allDays.slice(-14).map(d => ({
    date: d.slice(8) + '/' + d.slice(5, 7),
    valor: Math.round((dailyMap[d]?.valor || 0) / 1000),
    pagamentos: dailyMap[d]?.count || 0,
  }))

  const ttStyle = { background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textPrimary }

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary, marginBottom: 4 }}>Financeiro</h1>
          <p style={{ color: theme.textMuted, fontSize: 13 }}>Pagamentos liberados e realizados — pipe FINANCEIRO.</p>
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
        <KPICard label="Cards Únicos" value={totalCards} sub="no período" accent="#3b82f6" />
        <KPICard label="Pagamento Liberado" value={liberados} sub="aguardando realização" accent="#f59e0b" />
        <KPICard label="Pagamento Realizado" value={realizados} sub="concluídos" accent="#10b981" />
        <KPICard label="Volume Realizado" value={fmt(volRealizado)} sub={realizados > 0 ? `ticket médio ${fmt(ticketMedio)}` : 'sem realizados'} accent="#10b981" />
        <KPICard label="Volume Total (pipe)" value={fmt(volTotal)} sub="todos os cards" accent="#3b82f6" />
      </div>

      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <SectionTitle>Pagamentos Realizados por Dia — R$ mil (últimos 14 dias)</SectionTitle>
        {dailyData.every(d => d.valor === 0)
          ? <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', paddingTop: 60 }}>Sem pagamentos realizados no período</div>
          : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData} barSize={20}>
                <XAxis dataKey="date" stroke={theme.textFaint} tick={{ fill: theme.textSecondary, fontSize: 11 }} />
                <YAxis stroke={theme.textFaint} tick={{ fill: theme.textSecondary, fontSize: 11 }} />
                <Tooltip contentStyle={ttStyle} formatter={(v) => [`R$ ${v}k`, 'Valor']} />
                <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )
        }
      </div>

      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24 }}>
        <SectionTitle>Todos os Eventos ({visible.length})</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2d3748' }}>
                {['Card', 'Fase', 'Entrou', 'Saiu', 'Duração (dias)', 'Valor Final da Proposta'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: theme.textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.slice(0, 100).map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid #1a1f2e' }}>
                  <td style={{ padding: '9px 12px', color: theme.textSecondary, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.card_title}</td>
                  <td style={{ padding: '9px 12px', color: e.phase_name === 'PAGAMENTO REALIZADO' ? '#10b981' : theme.textPrimary, whiteSpace: 'nowrap', fontWeight: e.phase_name === 'PAGAMENTO REALIZADO' ? 600 : 400 }}>{e.phase_name}</td>
                  <td style={{ padding: '9px 12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{e.entered_at?.slice(0, 10)}</td>
                  <td style={{ padding: '9px 12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{e.exited_at?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '9px 12px', color: theme.textSecondary, textAlign: 'right' }}>{e.duration_minutes ? Math.round(e.duration_minutes / 60 / 24) : '—'}</td>
                  <td style={{ padding: '9px 12px', color: '#10b981', textAlign: 'right', whiteSpace: 'nowrap' }}>{e.valor_final_da_proposta ? fmt(e.valor_final_da_proposta) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
