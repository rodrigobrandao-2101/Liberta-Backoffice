import { useTheme } from '../ThemeContext.jsx'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../supabase'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import DateRangePicker from '../components/DateRangePicker'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

function KPICard({ label, value, sub, color }) {
  const { theme } = useTheme()
  return (
    <div style={{ background: theme.cardBg, borderRadius: 12, padding: '20px 24px', flex: 1, minWidth: 0 }}>
      <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || theme.textPrimary, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }) {
  const { theme } = useTheme()
  return (
    <h2 style={{ color: theme.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
      {children}
    </h2>
  )
}

function Card({ children, style }) {
  const { theme } = useTheme()
  return (
    <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, ...style }}>
      {children}
    </div>
  )
}

const fmt = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n || 0)
const fmtN = (n) => new Intl.NumberFormat('pt-BR').format(n || 0)
const fmtPct = (n) => `${(n || 0).toFixed(2)}%`

export default function MetaAds() {
  const { theme } = useTheme()
  const [dateRange, setDateRange] = useState(['', ''])
  const [insights, setInsights] = useState([])
  const [placement, setPlacement] = useState([])
  const [demo, setDemo] = useState([])
  const [loading, setLoading] = useState(true)
  const [campaignFilter, setCampaignFilter] = useState('all')

  useEffect(() => {
    fetchAll()
  }, [dateRange])

  async function fetchAll() {
    setLoading(true)
    const [ins, plc, dem] = await Promise.all([
      fetchInsights(),
      fetchPlacement(),
      fetchDemo(),
    ])
    setInsights(ins)
    setPlacement(plc)
    setDemo(dem)
    setLoading(false)
  }

  async function fetchInsights() {
    let q = supabase.from('meta_insights_daily').select('*').order('date', { ascending: true })
    if (dateRange[0]) q = q.gte('date', dateRange[0])
    if (dateRange[1]) q = q.lte('date', dateRange[1])
    const { data } = await q.limit(5000)
    return data || []
  }

  async function fetchPlacement() {
    let q = supabase.from('meta_insights_placement').select('*')
    if (dateRange[0]) q = q.gte('date', dateRange[0])
    if (dateRange[1]) q = q.lte('date', dateRange[1])
    const { data } = await q.limit(5000)
    return data || []
  }

  async function fetchDemo() {
    let q = supabase.from('meta_insights_demo').select('*')
    if (dateRange[0]) q = q.gte('date', dateRange[0])
    if (dateRange[1]) q = q.lte('date', dateRange[1])
    const { data } = await q.limit(5000)
    return data || []
  }

  const campaigns = useMemo(() => [...new Set(insights.map(r => r.campaign_name))].filter(Boolean), [insights])

  const filtered = useMemo(() =>
    campaignFilter === 'all' ? insights : insights.filter(r => r.campaign_name === campaignFilter),
    [insights, campaignFilter]
  )

  // KPIs
  const totalSpend = filtered.reduce((s, r) => s + (r.spend || 0), 0)
  const totalImpressions = filtered.reduce((s, r) => s + (r.impressions || 0), 0)
  const totalReach = filtered.reduce((s, r) => s + (r.reach || 0), 0)
  const totalClicks = filtered.reduce((s, r) => s + (r.clicks || 0), 0)
  const totalConversas = filtered.reduce((s, r) => s + (r.messaging_conversations_started || 0), 0)
  const totalLeads = filtered.reduce((s, r) => s + (r.leads || 0), 0)
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgCPM = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0
  const costPerConversa = totalConversas > 0 ? totalSpend / totalConversas : 0

  // Gráfico: gasto + conversas por dia
  const dailyMap = {}
  filtered.forEach(r => {
    const d = r.date?.slice(0, 10)
    if (!d) return
    if (!dailyMap[d]) dailyMap[d] = { date: d, spend: 0, conversas: 0, impressions: 0, clicks: 0 }
    dailyMap[d].spend += r.spend || 0
    dailyMap[d].conversas += r.messaging_conversations_started || 0
    dailyMap[d].impressions += r.impressions || 0
    dailyMap[d].clicks += r.clicks || 0
  })
  const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date))
    .map(r => ({ ...r, date: r.date.slice(5), spend: Math.round(r.spend * 100) / 100 }))

  // Por campanha
  const campMap = {}
  filtered.forEach(r => {
    const c = r.campaign_name || 'Sem nome'
    if (!campMap[c]) campMap[c] = { name: c.length > 20 ? c.slice(0, 18) + '…' : c, spend: 0, conversas: 0, impressions: 0 }
    campMap[c].spend += r.spend || 0
    campMap[c].conversas += r.messaging_conversations_started || 0
    campMap[c].impressions += r.impressions || 0
  })
  const campData = Object.values(campMap).sort((a, b) => b.spend - a.spend)

  // Video funnel
  const v25 = filtered.reduce((s, r) => s + (r.video_watch_25 || 0), 0)
  const v50 = filtered.reduce((s, r) => s + (r.video_watch_50 || 0), 0)
  const v75 = filtered.reduce((s, r) => s + (r.video_watch_75 || 0), 0)
  const vTP = filtered.reduce((s, r) => s + (r.video_thruplay || 0), 0)
  const videoFunnel = [
    { name: '25%', value: v25 },
    { name: '50%', value: v50 },
    { name: '75%', value: v75 },
    { name: 'ThruPlay', value: vTP },
  ]

  // Placement (filtrado por campanha se necessário)
  const filtPlc = campaignFilter === 'all' ? placement : placement.filter(r => r.campaign_name === campaignFilter)
  const plcMap = {}
  filtPlc.forEach(r => {
    const p = r.publisher_platform || 'outros'
    if (!plcMap[p]) plcMap[p] = { name: p, spend: 0, impressions: 0, clicks: 0 }
    plcMap[p].spend += r.spend || 0
    plcMap[p].impressions += r.impressions || 0
    plcMap[p].clicks += r.clicks || 0
  })
  const plcData = Object.values(plcMap).sort((a, b) => b.spend - a.spend)

  // Demo (filtrado por campanha se necessário)
  const filtDemo = campaignFilter === 'all' ? demo : demo.filter(r => r.campaign_name === campaignFilter)
  const ageMap = {}
  filtDemo.forEach(r => {
    const a = r.age || '?'
    if (!ageMap[a]) ageMap[a] = { age: a, spend: 0, impressions: 0, clicks: 0, conversas: 0 }
    ageMap[a].spend += r.spend || 0
    ageMap[a].impressions += r.impressions || 0
    ageMap[a].clicks += r.clicks || 0
    ageMap[a].conversas += r.messaging_conversations_started || 0
  })
  const ageData = Object.values(ageMap).sort((a, b) => a.age.localeCompare(b.age))

  // Por anúncio
  const adMap = {}
  filtered.forEach(r => {
    const id = r.ad_id
    if (!adMap[id]) adMap[id] = { ad_name: r.ad_name, campaign_name: r.campaign_name, spend: 0, impressions: 0, clicks: 0, conversas: 0, leads: 0 }
    adMap[id].spend += r.spend || 0
    adMap[id].impressions += r.impressions || 0
    adMap[id].clicks += r.clicks || 0
    adMap[id].conversas += r.messaging_conversations_started || 0
    adMap[id].leads += r.leads || 0
  })
  const adData = Object.values(adMap).sort((a, b) => b.spend - a.spend)

  const tooltipStyle = { background: theme.pageBg, border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: 12 }
  const axisProps = { stroke: theme.textFaint, tick: { fill: theme.textMuted, fontSize: 11 } }

  const selectStyle = {
    background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textPrimary,
    borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>Meta Ads</h1>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>Performance de campanhas de tráfego pago</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)} style={selectStyle}>
            <option value="all">Todas as campanhas</option>
            {campaigns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {loading && <div style={{ color: theme.textMuted, marginBottom: 24, fontSize: 13 }}>Carregando...</div>}

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <KPICard label="Investimento" value={fmt(totalSpend)} sub={`${fmtN(filtered.length)} registros`} />
        <KPICard label="Impressões" value={fmtN(totalImpressions)} sub={`CPM ${fmt(avgCPM)}`} />
        <KPICard label="Alcance" value={fmtN(totalReach)} sub={`Freq ${totalReach > 0 ? (totalImpressions / totalReach).toFixed(2) : '—'}`} />
        <KPICard label="Cliques" value={fmtN(totalClicks)} sub={`CTR ${fmtPct(avgCTR)}`} color={theme.accentText} />
        <KPICard label="Conversas" value={fmtN(totalConversas)} sub={`Custo ${fmt(costPerConversa)}`} color="#10b981" />
        <KPICard label="Leads" value={fmtN(totalLeads)} sub="ação de lead" />
      </div>

      {/* Gasto + Conversas por dia */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <Card>
          <SectionTitle>Investimento por Dia</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData} barSize={14}>
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={v => `R$${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => fmt(v)} />
              <Bar dataKey="spend" fill="#6366f1" radius={[4, 4, 0, 0]} name="Investimento" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Conversas Iniciadas por Dia</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="conversas" stroke="#10b981" strokeWidth={2} dot={false} name="Conversas" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Por campanha + por plataforma */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <Card>
          <SectionTitle>Investimento por Campanha</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={campData} layout="vertical" barSize={14}>
              <XAxis type="number" {...axisProps} tickFormatter={v => `R$${v}`} />
              <YAxis type="category" dataKey="name" {...axisProps} width={140} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => fmt(v)} />
              <Bar dataKey="spend" radius={[0, 4, 4, 0]} name="Investimento">
                {campData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Conversas por Campanha</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={campData} layout="vertical" barSize={14}>
              <XAxis type="number" {...axisProps} />
              <YAxis type="category" dataKey="name" {...axisProps} width={140} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="conversas" fill="#10b981" radius={[0, 4, 4, 0]} name="Conversas" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Plataforma + Funil de Vídeo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <Card>
          <SectionTitle>Investimento por Plataforma</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={plcData} barSize={28}>
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={v => `R$${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => fmt(v)} />
              <Bar dataKey="spend" radius={[4, 4, 0, 0]} name="Investimento">
                {plcData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Funil de Vídeo</SectionTitle>
          {v25 > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={videoFunnel} barSize={40}>
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => fmtN(v)} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Visualizações">
                  {videoFunnel.map((_, i) => <Cell key={i} fill={['#818cf8', '#a78bfa', '#c084fc', '#e879f9'][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textFaint, fontSize: 13 }}>
              Sem dados de vídeo no período
            </div>
          )}
        </Card>
      </div>

      {/* Faixa etária */}
      {ageData.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <SectionTitle>Investimento por Faixa Etária</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ageData} barSize={28}>
                <XAxis dataKey="age" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={v => `R$${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => fmt(v)} />
                <Bar dataKey="spend" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Investimento" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ageData} barSize={28}>
                <XAxis dataKey="age" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="conversas" fill="#10b981" radius={[4, 4, 0, 0]} name="Conversas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Tabela de anúncios */}
      <Card>
        <SectionTitle>Performance por Anúncio ({adData.length})</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                {['Anúncio', 'Campanha', 'Investimento', 'Impressões', 'Cliques', 'CTR', 'Conversas', 'Leads'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: theme.textMuted, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adData.slice(0, 50).map((ad, i) => {
                const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: '9px 12px', color: theme.textPrimary, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.ad_name}</td>
                    <td style={{ padding: '9px 12px', color: theme.textMuted, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.campaign_name}</td>
                    <td style={{ padding: '9px 12px', color: theme.textSecondary, textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(ad.spend)}</td>
                    <td style={{ padding: '9px 12px', color: theme.textMuted, textAlign: 'right' }}>{fmtN(ad.impressions)}</td>
                    <td style={{ padding: '9px 12px', color: theme.textMuted, textAlign: 'right' }}>{fmtN(ad.clicks)}</td>
                    <td style={{ padding: '9px 12px', color: theme.textSecondary, textAlign: 'right' }}>{fmtPct(ctr)}</td>
                    <td style={{ padding: '9px 12px', color: '#10b981', textAlign: 'right', fontWeight: 600 }}>{fmtN(ad.conversas)}</td>
                    <td style={{ padding: '9px 12px', color: theme.accentText, textAlign: 'right' }}>{fmtN(ad.leads)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
