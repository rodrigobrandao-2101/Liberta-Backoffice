import { useTheme } from '../ThemeContext.jsx'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../supabase'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'
import DateRangePicker from '../components/DateRangePicker'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

const fmt    = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n || 0)
const fmtDec = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)
const fmtN   = (n) => new Intl.NumberFormat('pt-BR').format(n || 0)
const fmtPct = (n) => `${(n || 0).toFixed(2)}%`

function KPICard({ label, value, sub, sub2, color }) {
  const { theme } = useTheme()
  return (
    <div style={{ background: theme.cardBg, borderRadius: 12, padding: '18px 22px', flex: 1, minWidth: 0 }}>
      <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || theme.textPrimary, lineHeight: 1.2 }}>{value}</div>
      {sub  && <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>{sub}</div>}
      {sub2 && <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>{sub2}</div>}
    </div>
  )
}

function SectionTitle({ children }) {
  const { theme } = useTheme()
  return (
    <h2 style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
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

function RankingBadge({ value }) {
  if (!value || value === 'UNKNOWN') return <span style={{ color: '#475569', fontSize: 10 }}>—</span>
  const map = {
    ABOVE_AVERAGE: { label: 'Acima', color: '#22c55e', bg: '#22c55e18' },
    AVERAGE:       { label: 'Médio', color: '#f59e0b', bg: '#f59e0b18' },
    BELOW_AVERAGE: { label: 'Abaixo', color: '#ef4444', bg: '#ef444418' },
  }
  const m = map[value] || { label: value, color: '#64748b', bg: '#64748b18' }
  return (
    <span style={{ background: m.bg, color: m.color, padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
      {m.label}
    </span>
  )
}

function MiniMetric({ label, value, color }) {
  const { theme } = useTheme()
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || theme.textPrimary }}>{value}</div>
      <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

export default function MetaAds() {
  const { theme } = useTheme()
  const [dateRange, setDateRange] = useState(() => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 14); return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)] })
  const [insights, setInsights] = useState([])
  const [placement, setPlacement] = useState([])
  const [demo, setDemo] = useState([])
  const [loading, setLoading] = useState(true)
  const [campaignFilter, setCampaignFilter] = useState('all')

  useEffect(() => { fetchAll() }, [dateRange])

  async function fetchAll() {
    setLoading(true)
    const [ins, plc, dem] = await Promise.all([fetchInsights(), fetchPlacement(), fetchDemo()])
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

  // ── KPIs principais ──────────────────────────────────────────────────────
  const totalSpend       = filtered.reduce((s, r) => s + (r.spend || 0), 0)
  const totalImpressions = filtered.reduce((s, r) => s + (r.impressions || 0), 0)
  const totalReach       = filtered.reduce((s, r) => s + (r.reach || 0), 0)
  const totalClicks      = filtered.reduce((s, r) => s + (r.clicks || 0), 0)
  const totalConversas   = filtered.reduce((s, r) => s + (r.messaging_conversations_started || 0), 0)
  const totalLeads       = filtered.reduce((s, r) => s + (r.leads || 0), 0)
  const avgCTR           = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgCPM           = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0
  const costPerConversa  = totalConversas > 0 ? totalSpend / totalConversas : 0
  const costPerLead      = totalLeads > 0 ? totalSpend / totalLeads : 0
  const frequency        = totalReach > 0 ? totalImpressions / totalReach : 0

  // ── Métricas de mensageria ────────────────────────────────────────────────
  const totalNewConnections = filtered.reduce((s, r) => s + (r.new_messaging_connections || 0), 0)
  const totalFirstReply     = filtered.reduce((s, r) => s + (r.messaging_first_reply || 0), 0)
  const replyRate           = totalConversas > 0 ? (totalFirstReply / totalConversas) * 100 : 0
  const costPerNewConn      = totalNewConnections > 0 ? totalSpend / totalNewConnections : 0

  // ── Quality rankings (último estado por anúncio) ──────────────────────────
  const latestByAd = {}
  filtered.forEach(r => {
    if (!latestByAd[r.ad_id] || r.date > latestByAd[r.ad_id].date) latestByAd[r.ad_id] = r
  })
  const latestAds = Object.values(latestByAd)
  const rankCount = (field, val) => latestAds.filter(r => r[field] === val).length
  const qualityAbove = rankCount('quality_ranking', 'ABOVE_AVERAGE')
  const qualityBelow = rankCount('quality_ranking', 'BELOW_AVERAGE')
  const engAbove     = rankCount('engagement_rate_ranking', 'ABOVE_AVERAGE')
  const convAbove    = rankCount('conversion_rate_ranking', 'ABOVE_AVERAGE')

  // ── Gráficos diários ──────────────────────────────────────────────────────
  const dailyMap = {}
  filtered.forEach(r => {
    const d = r.date?.slice(0, 10)
    if (!d) return
    if (!dailyMap[d]) dailyMap[d] = { date: d, spend: 0, conversas: 0, impressions: 0, clicks: 0, newConn: 0 }
    dailyMap[d].spend       += r.spend || 0
    dailyMap[d].conversas   += r.messaging_conversations_started || 0
    dailyMap[d].impressions += r.impressions || 0
    dailyMap[d].clicks      += r.clicks || 0
    dailyMap[d].newConn     += r.new_messaging_connections || 0
  })
  const eventDaysM = Object.keys(dailyMap).sort()
  const rangeStartM = dateRange[0] || eventDaysM[0]
  const rangeEndM   = dateRange[1] || eventDaysM[eventDaysM.length - 1]
  const allDaysM = []
  if (rangeStartM && rangeEndM) {
    const cur = new Date(rangeStartM + 'T00:00:00')
    const last = new Date(rangeEndM + 'T00:00:00')
    while (cur <= last) { allDaysM.push(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1) }
  }
  const dailyData = allDaysM.map(d => {
    const r = dailyMap[d] || { date: d, spend: 0, conversas: 0, impressions: 0, clicks: 0, newConn: 0 }
    const spend = Math.round((r.spend || 0) * 100) / 100
    return {
      ...r, date: d.slice(5), spend,
      cpConv:  r.conversas > 0 ? Math.round(spend / r.conversas * 100) / 100 : null,
      cpNewConn: r.newConn > 0 ? Math.round(spend / r.newConn * 100) / 100 : null,
    }
  })

  // ── Por campanha ──────────────────────────────────────────────────────────
  const campMap = {}
  filtered.forEach(r => {
    const c = r.campaign_name || 'Sem nome'
    if (!campMap[c]) campMap[c] = { name: c.length > 22 ? c.slice(0, 20) + '…' : c, spend: 0, conversas: 0, impressions: 0, leads: 0, newConn: 0 }
    campMap[c].spend       += r.spend || 0
    campMap[c].conversas   += r.messaging_conversations_started || 0
    campMap[c].impressions += r.impressions || 0
    campMap[c].leads       += r.leads || 0
    campMap[c].newConn     += r.new_messaging_connections || 0
  })
  const campData = Object.values(campMap).sort((a, b) => b.spend - a.spend)
    .map(c => ({ ...c, cpc: c.conversas > 0 ? c.spend / c.conversas : 0, cpnc: c.newConn > 0 ? c.spend / c.newConn : 0 }))

  // ── Funil de vídeo ────────────────────────────────────────────────────────
  const v25 = filtered.reduce((s, r) => s + (r.video_watch_25 || 0), 0)
  const v50 = filtered.reduce((s, r) => s + (r.video_watch_50 || 0), 0)
  const v75 = filtered.reduce((s, r) => s + (r.video_watch_75 || 0), 0)
  const vTP = filtered.reduce((s, r) => s + (r.video_thruplay || 0), 0)
  const thruPlayRate = v25 > 0 ? (vTP / v25) * 100 : 0
  const videoFunnel = [
    { name: '25%',      value: v25, pct: 100 },
    { name: '50%',      value: v50, pct: v25 > 0 ? Math.round(v50 / v25 * 100) : 0 },
    { name: '75%',      value: v75, pct: v25 > 0 ? Math.round(v75 / v25 * 100) : 0 },
    { name: 'ThruPlay', value: vTP, pct: v25 > 0 ? Math.round(vTP / v25 * 100) : 0 },
  ]

  // ── Placement ─────────────────────────────────────────────────────────────
  const filtPlc = campaignFilter === 'all' ? placement : placement.filter(r => r.campaign_name === campaignFilter)
  const plcMap = {}
  filtPlc.forEach(r => {
    const p = r.publisher_platform || 'outros'
    if (!plcMap[p]) plcMap[p] = { name: p, spend: 0, impressions: 0, clicks: 0, conversas: 0 }
    plcMap[p].spend       += r.spend || 0
    plcMap[p].impressions += r.impressions || 0
    plcMap[p].clicks      += r.clicks || 0
    plcMap[p].conversas   += r.messaging_conversations_started || 0
  })
  const plcData = Object.values(plcMap).sort((a, b) => b.spend - a.spend)

  // ── Demo: faixa etária + gênero ───────────────────────────────────────────
  const filtDemo = campaignFilter === 'all' ? demo : demo.filter(r => r.campaign_name === campaignFilter)

  const ageMap = {}
  filtDemo.forEach(r => {
    const a = r.age || '?'
    if (!ageMap[a]) ageMap[a] = { age: a, spend: 0, impressions: 0, clicks: 0, conversas: 0, newConn: 0 }
    ageMap[a].spend       += r.spend || 0
    ageMap[a].impressions += r.impressions || 0
    ageMap[a].clicks      += r.clicks || 0
    ageMap[a].conversas   += r.messaging_conversations_started || 0
    ageMap[a].newConn     += r.new_messaging_connections || 0
  })
  const ageData = Object.values(ageMap).sort((a, b) => a.age.localeCompare(b.age))

  const genderMap = {}
  filtDemo.forEach(r => {
    const g = r.gender || 'unknown'
    if (!genderMap[g]) genderMap[g] = { gender: g, spend: 0, impressions: 0, clicks: 0, conversas: 0, newConn: 0 }
    genderMap[g].spend       += r.spend || 0
    genderMap[g].impressions += r.impressions || 0
    genderMap[g].clicks      += r.clicks || 0
    genderMap[g].conversas   += r.messaging_conversations_started || 0
    genderMap[g].newConn     += r.new_messaging_connections || 0
  })
  const genderData = Object.values(genderMap).sort((a, b) => b.spend - a.spend)
  const genderLabels = { male: 'Masculino', female: 'Feminino', unknown: 'Desconhecido' }
  const genderColors = { male: '#3b82f6', female: '#ec4899', unknown: '#64748b' }
  const totalGenderSpend = genderData.reduce((s, g) => s + g.spend, 0)

  // ── Por anúncio ───────────────────────────────────────────────────────────
  const adMap = {}
  filtered.forEach(r => {
    const id = r.ad_id
    if (!adMap[id]) adMap[id] = {
      ad_id: id, ad_name: r.ad_name, campaign_name: r.campaign_name,
      spend: 0, impressions: 0, clicks: 0, conversas: 0, leads: 0,
      newConn: 0, quality_ranking: null, engagement_rate_ranking: null, conversion_rate_ranking: null,
    }
    adMap[id].spend       += r.spend || 0
    adMap[id].impressions += r.impressions || 0
    adMap[id].clicks      += r.clicks || 0
    adMap[id].conversas   += r.messaging_conversations_started || 0
    adMap[id].leads       += r.leads || 0
    adMap[id].newConn     += r.new_messaging_connections || 0
    // pegar último ranking
    if (!adMap[id]._lastDate || r.date > adMap[id]._lastDate) {
      adMap[id]._lastDate = r.date
      adMap[id].quality_ranking = r.quality_ranking
      adMap[id].engagement_rate_ranking = r.engagement_rate_ranking
      adMap[id].conversion_rate_ranking = r.conversion_rate_ranking
    }
  })
  const adData = Object.values(adMap).sort((a, b) => b.spend - a.spend)
  const bestAdIdx  = adData.findIndex(a => a.conversas === Math.max(...adData.map(x => x.conversas)))

  const ttStyle  = { background: theme.pageBg, border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: 12 }
  const axisProps = { stroke: theme.textFaint, tick: { fill: theme.textMuted, fontSize: 11 } }
  const selectStyle = { background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textPrimary, borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', cursor: 'pointer' }

  return (
    <div style={{ padding: '32px 40px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
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

      {/* ── KPIs Row 1 ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <KPICard label="Investimento"   value={fmt(totalSpend)}           sub={`${fmtN(filtered.length)} registros`} />
        {/* Conversas */}
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: '18px 22px', flex: 1, minWidth: 0 }}>
          <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Conversas</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#10b981', lineHeight: 1.2 }}>{fmtN(totalConversas)}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#10b981', opacity: 0.75 }}>{fmtDec(costPerConversa)}<span style={{ fontSize: 10, fontWeight: 400, color: theme.textMuted, marginLeft: 3 }}>/ conv.</span></span>
          </div>
        </div>
        {/* Novas Conexões */}
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: '18px 22px', flex: 1, minWidth: 0 }}>
          <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Novas Conexões</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#06b6d4', lineHeight: 1.2 }}>{fmtN(totalNewConnections)}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#06b6d4', opacity: 0.75 }}>{fmtDec(costPerNewConn)}<span style={{ fontSize: 10, fontWeight: 400, color: theme.textMuted, marginLeft: 3 }}>/ con.</span></span>
          </div>
        </div>
      </div>


      {/* ── Gráficos diários ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
        <Card>
          <SectionTitle>Investimento por Dia</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData} barSize={14}>
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={v => `R$${v}`} />
              <Tooltip contentStyle={ttStyle} formatter={v => fmt(v)} />
              <Bar dataKey="spend" fill="#6366f1" radius={[4,4,0,0]} name="Investimento" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle>Conversas &amp; Novas Conexões por Dia</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={ttStyle} />
              <Line type="monotone" dataKey="conversas" stroke="#10b981" strokeWidth={2} dot={false} name="Conversas" />
              <Line type="monotone" dataKey="newConn"   stroke="#06b6d4" strokeWidth={2} dot={false} name="Novas Conexões" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10, color: '#10b981' }}>— Conversas</span>
            <span style={{ fontSize: 10, color: '#06b6d4' }}>- - Novas Conexões</span>
          </div>
        </Card>
        <Card>
          <SectionTitle>Custo por Conversa / Conexão por Dia</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={v => `R$${v}`} />
              <Tooltip contentStyle={ttStyle} formatter={v => v != null ? fmtDec(v) : '—'} />
              <Line type="monotone" dataKey="cpConv"    stroke="#10b981" strokeWidth={2} dot={false} name="R$/Conversa"  connectNulls />
              <Line type="monotone" dataKey="cpNewConn" stroke="#06b6d4" strokeWidth={2} dot={false} name="R$/Conexão" strokeDasharray="4 2" connectNulls />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10, color: '#10b981' }}>— R$/Conversa</span>
            <span style={{ fontSize: 10, color: '#06b6d4' }}>- - R$/Conexão</span>
          </div>
        </Card>
      </div>

      {/* ── Por campanha ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <Card>
          <SectionTitle>Investimento por Campanha</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={campData} layout="vertical" barSize={14}>
              <XAxis type="number" {...axisProps} tickFormatter={v => `R$${v}`} />
              <YAxis type="category" dataKey="name" {...axisProps} width={150} />
              <Tooltip contentStyle={ttStyle} formatter={v => fmt(v)} />
              <Bar dataKey="spend" radius={[0,4,4,0]} name="Investimento">
                {campData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle>Conversas &amp; Novas Conexões por Campanha</SectionTitle>
          <div style={{ flex: 1 }}>
            {campData.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12, color: theme.textSecondary }}>{c.name}</div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{fmtN(c.conversas)}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted }}>conv.</div>
                </div>
                <div style={{ width: 1, height: 28, background: theme.border }} />
                <div style={{ textAlign: 'right', minWidth: 70 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{c.cpc > 0 ? fmtDec(c.cpc) : '—'}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted }}>/conv.</div>
                </div>
                <div style={{ width: 1, height: 28, background: theme.border }} />
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#818cf8' }}>{fmtN(c.newConn)}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted }}>novas con.</div>
                </div>
                <div style={{ width: 1, height: 28, background: theme.border }} />
                <div style={{ textAlign: 'right', minWidth: 70 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{c.cpnc > 0 ? fmtDec(c.cpnc) : '—'}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted }}>/con.</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Plataforma + Funil de Vídeo ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <Card>
          <SectionTitle>Investimento por Plataforma</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={plcData} barSize={32}>
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={v => `R$${v}`} />
              <Tooltip contentStyle={ttStyle} formatter={v => fmt(v)} />
              <Bar dataKey="spend" radius={[4,4,0,0]} name="Investimento">
                {plcData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* mini-tabela de plataforma */}
          <div style={{ marginTop: 12, borderTop: `1px solid ${theme.border}`, paddingTop: 10 }}>
            {plcData.map((p, i) => {
              const ctr = p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0
              const cpc = p.conversas > 0 ? p.spend / p.conversas : 0
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 11, color: theme.textSecondary }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>{fmtPct(ctr)} CTR</div>
                  <div style={{ width: 1, height: 14, background: theme.border }} />
                  <div style={{ fontSize: 11, color: '#10b981' }}>{cpc > 0 ? fmtDec(cpc) : '—'}/conv</div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle>Funil de Vídeo</SectionTitle>
          {v25 > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {videoFunnel.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 56, fontSize: 11, color: theme.textMuted, textAlign: 'right', flexShrink: 0 }}>{step.name}</div>
                    <div style={{ flex: 1, height: 24, background: theme.cardBg2 || '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${step.pct}%`,
                        background: ['#818cf8','#a78bfa','#c084fc','#e879f9'][i],
                        borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8, transition: 'width 0.6s ease',
                      }}>
                        {step.pct > 12 && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{fmtN(step.value)}</span>}
                      </div>
                    </div>
                    <div style={{ width: 42, fontSize: 11, fontWeight: 700, color: ['#818cf8','#a78bfa','#c084fc','#e879f9'][i], textAlign: 'right', flexShrink: 0 }}>
                      {step.pct}%
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Taxa de ThruPlay</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#e879f9', marginTop: 2 }}>{thruPlayRate.toFixed(1)}%</div>
                  <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>dos que viram 25% viram até o fim</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: theme.textMuted }}>Avg. assistido</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: theme.textSecondary, marginTop: 2 }}>
                    {filtered.length > 0 ? Math.round(filtered.reduce((s,r) => s + (r.video_avg_time_watched || 0), 0) / filtered.filter(r => r.video_avg_time_watched > 0).length || 0) : 0}s
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted, fontSize: 13 }}>
              Sem dados de vídeo no período
            </div>
          )}
        </Card>
      </div>

      {/* ── Faixa Etária + Gênero ── */}
      {(ageData.length > 0 || genderData.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>

          {/* Faixa etária */}
          {ageData.length > 0 && (
            <Card>
              <SectionTitle>Faixa Etária — Investimento &amp; Conversas</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ageData} barSize={22}>
                    <XAxis dataKey="age" {...axisProps} />
                    <YAxis {...axisProps} tickFormatter={v => `R$${v}`} />
                    <Tooltip contentStyle={ttStyle} formatter={v => fmt(v)} />
                    <Bar dataKey="spend" fill="#f59e0b" radius={[4,4,0,0]} name="Investimento" />
                  </BarChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ageData} barSize={22}>
                    <XAxis dataKey="age" {...axisProps} />
                    <YAxis {...axisProps} />
                    <Tooltip contentStyle={ttStyle} />
                    <Bar dataKey="conversas" fill="#10b981" radius={[4,4,0,0]} name="Conversas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* tabela por faixa */}
              <div style={{ marginTop: 12, borderTop: `1px solid ${theme.border}`, paddingTop: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 1fr 1fr', gap: 4, marginBottom: 6 }}>
                  {['Faixa', 'Invest.', 'Impressões', 'Conversas', 'R$/Conv.', 'CTR'].map(h => (
                    <div key={h} style={{ fontSize: 9, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h === 'Faixa' ? 'left' : 'right' }}>{h}</div>
                  ))}
                </div>
                {ageData.map((a, i) => {
                  const ctr = a.impressions > 0 ? (a.clicks / a.impressions) * 100 : 0
                  const cpConv = a.conversas > 0 ? a.spend / a.conversas : null
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 1fr 1fr', gap: 4, padding: '5px 0', borderBottom: `1px solid ${theme.border}` }}>
                      <div style={{ fontSize: 11, color: theme.textPrimary }}>{a.age}</div>
                      <div style={{ fontSize: 11, color: '#f59e0b', textAlign: 'right' }}>{fmt(a.spend)}</div>
                      <div style={{ fontSize: 11, color: theme.textMuted, textAlign: 'right' }}>{fmtN(a.impressions)}</div>
                      <div style={{ fontSize: 11, color: '#10b981', textAlign: 'right', fontWeight: 600 }}>{fmtN(a.conversas)}</div>
                      <div style={{ fontSize: 11, color: '#10b981', textAlign: 'right', fontWeight: 600 }}>{cpConv != null ? fmtDec(cpConv) : '—'}</div>
                      <div style={{ fontSize: 11, color: theme.textSecondary, textAlign: 'right' }}>{fmtPct(ctr)}</div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Gênero */}
          {genderData.length > 0 && (
            <Card>
              <SectionTitle>Gênero</SectionTitle>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={genderData} dataKey="spend" nameKey="gender" cx="50%" cy="50%" outerRadius={70} labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                      const RADIAN = Math.PI / 180
                      const r = innerRadius + (outerRadius - innerRadius) * 0.55
                      const x = cx + r * Math.cos(-midAngle * RADIAN)
                      const y = cy + r * Math.sin(-midAngle * RADIAN)
                      const pct = totalGenderSpend > 0 ? Math.round(genderData[index].spend / totalGenderSpend * 100) : 0
                      return pct >= 8 ? (
                        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>{pct}%</text>
                      ) : null
                    }}>
                    {genderData.map((g, i) => <Cell key={i} fill={genderColors[g.gender] || COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={ttStyle} formatter={(v, name) => [fmt(v), genderLabels[name] || name]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {genderData.map((g, i) => {
                  const pct = totalGenderSpend > 0 ? Math.round(g.spend / totalGenderSpend * 100) : 0
                  const color = genderColors[g.gender] || COLORS[i]
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                          <span style={{ fontSize: 12, color: theme.textSecondary }}>{genderLabels[g.gender] || g.gender}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>{fmt(g.spend)} <span style={{ color: theme.textMuted, fontWeight: 400 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: 10, color: theme.textMuted }}>{fmtN(g.impressions)} imp.</span>
                        <span style={{ fontSize: 10, color: '#10b981' }}>{fmtN(g.conversas)} conv.</span>
                        {g.conversas > 0 && <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>{fmtDec(g.spend / g.conversas)}/conv.</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Tabela de anúncios ── */}
      <Card>
        <SectionTitle>Performance por Anúncio ({adData.length}) {bestAdIdx >= 0 && <span style={{ color: '#10b981', fontWeight: 400 }}>— ★ destaque: mais conversas</span>}</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                {['Anúncio', 'Campanha', 'Invest.', 'Impressões', 'Cliques', 'CTR', 'Conversas', 'C/Conv.', 'Novas Con.', 'Leads', 'Qualidade', 'Engaj.', 'Convers.'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Anúncio' || h === 'Campanha' ? 'left' : 'right', padding: '9px 10px', color: theme.textMuted, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adData.slice(0, 50).map((ad, i) => {
                const ctr  = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
                const cpconv = ad.conversas > 0 ? ad.spend / ad.conversas : 0
                const isBest = i === bestAdIdx
                return (
                  <tr key={i} style={{
                    borderBottom: `1px solid ${theme.border}`,
                    borderLeft: isBest ? '3px solid #10b981' : '3px solid transparent',
                    background: isBest ? '#10b98108' : 'transparent',
                  }}>
                    <td style={{ padding: '8px 10px', color: theme.textPrimary, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isBest && <span style={{ color: '#10b981', marginRight: 4 }}>★</span>}
                      {ad.ad_name}
                    </td>
                    <td style={{ padding: '8px 10px', color: theme.textMuted, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.campaign_name}</td>
                    <td style={{ padding: '8px 10px', color: theme.textSecondary, textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(ad.spend)}</td>
                    <td style={{ padding: '8px 10px', color: theme.textMuted,      textAlign: 'right' }}>{fmtN(ad.impressions)}</td>
                    <td style={{ padding: '8px 10px', color: theme.textMuted,      textAlign: 'right' }}>{fmtN(ad.clicks)}</td>
                    <td style={{ padding: '8px 10px', color: theme.textSecondary,  textAlign: 'right' }}>{fmtPct(ctr)}</td>
                    <td style={{ padding: '8px 10px', color: '#10b981', textAlign: 'right', fontWeight: 600 }}>{fmtN(ad.conversas)}</td>
                    <td style={{ padding: '8px 10px', color: '#f59e0b', textAlign: 'right' }}>{cpconv > 0 ? fmtDec(cpconv) : '—'}</td>
                    <td style={{ padding: '8px 10px', color: '#06b6d4', textAlign: 'right' }}>{fmtN(ad.newConn)}</td>
                    <td style={{ padding: '8px 10px', color: theme.accentText,     textAlign: 'right' }}>{fmtN(ad.leads)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}><RankingBadge value={ad.quality_ranking} /></td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}><RankingBadge value={ad.engagement_rate_ranking} /></td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}><RankingBadge value={ad.conversion_rate_ranking} /></td>
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
