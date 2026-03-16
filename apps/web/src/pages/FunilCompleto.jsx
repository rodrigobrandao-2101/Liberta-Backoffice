import { useTheme } from '../ThemeContext.jsx'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import DateRangePicker from '../components/DateRangePicker'

const fmt = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n || 0)
const pct = (a, b) => b > 0 ? Math.round(a / b * 100) : 0

const LOST_COMERCIAL = ['PERDIDO - PROPOSTA INICIAL NEGADA', 'PERDIDO - BARREIRA JURÍDICA', 'PERDIDO - PROPOSTA CORRIGIDA NEGADA', 'PERDIDO - DUE INCONSISTENTE']
const CLOSED_COMERCIAL = ['ANEXADO NOS AUTOS']

function latestByCardFn(events) {
  const map = {}
  events.forEach(e => {
    if (!map[e.card_id] || e.entered_at > map[e.card_id].entered_at) map[e.card_id] = e
  })
  return Object.values(map)
}

function isTestCard(e) {
  return (e.card_title || '').toLowerCase().includes('[teste]') ||
         (e.nome_completo || '').toLowerCase().includes('[teste]')
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatRow({ label, value, accent, sub }) {
  const { theme } = useTheme()
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: `1px solid ${theme.border}` }}>
      <span style={{ fontSize: 12, color: theme.textSecondary }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: accent || theme.textPrimary }}>
        {value}{sub && <span style={{ fontSize: 11, fontWeight: 400, color: theme.textMuted, marginLeft: 4 }}>{sub}</span>}
      </span>
    </div>
  )
}

function PipeCard({ title, color, icon, stats, financial }) {
  const { theme } = useTheme()
  return (
    <div style={{ background: theme.cardBg, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: color, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>{title}</span>
      </div>
      <div style={{ padding: '12px 20px 16px', flex: 1 }}>
        {stats.map((s, i) => <StatRow key={i} {...s} />)}
        {financial && (
          <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            {financial.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < financial.length - 1 ? 6 : 0 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>{f.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: f.accent || '#94a3b8' }}>{f.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FlowStep({ label, count, color, pctVal, isFirst }) {
  const { theme } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
      {!isFirst && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px', flexShrink: 0 }}>
          <div style={{ color: '#334155', fontSize: 18 }}>→</div>
          {pctVal != null && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{pctVal}%</div>}
        </div>
      )}
      <div style={{ flex: 1, background: theme.cardBg, borderRadius: 10, padding: '12px 16px', borderTop: `3px solid ${color}`, minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color }}>{count}</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function FunilCompleto() {
  const { theme } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hideTest, setHideTest] = useState(true)
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date(); const start = new Date()
    start.setDate(end.getDate() - 30)
    return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  })

  useEffect(() => { fetchAll() }, [dateRange])

  async function fetchAll() {
    setLoading(true)
    const tables = ['sdr_events', 'comercial_events', 'compliance_events', 'juridico_events', 'financeiro_events']
    const results = await Promise.all(tables.map(t => {
      let q = supabase.from(t).select('*').eq('is_deleted', false)
      if (dateRange[0]) q = q.gte('entered_at', dateRange[0])
      if (dateRange[1]) q = q.lte('entered_at', dateRange[1] + 'T23:59:59')
      return q.limit(5000).then(({ data }) => data || [])
    }))
    setData(results)
    setLoading(false)
  }

  if (!data && !loading) return null

  // ── Filtro teste ──────────────────────────────────────────────────────────
  const [sdrRaw, comRaw, cmpRaw, jurRaw, finRaw] = (data || [[], [], [], [], []])
  const filter = (arr) => hideTest ? arr.filter(e => !isTestCard(e)) : arr
  const sdr = filter(sdrRaw)
  const com = filter(comRaw)
  const cmp = filter(cmpRaw)
  const jur = filter(jurRaw)
  const fin = filter(finRaw)

  // ── SDR ───────────────────────────────────────────────────────────────────
  const sdrLatest = latestByCardFn(sdr)
  const sdrTotal = sdrLatest.length
  const sdrQual = sdrLatest.filter(e => e.phase_name === 'QUALIFICADO').length
  const sdrDesq = sdrLatest.filter(e => e.phase_name === 'DESQUALIFICADO').length
  const sdrAtend = sdrLatest.filter(e => e.phase_name === 'EM ATENDIMENTO').length

  // ── COMERCIAL ─────────────────────────────────────────────────────────────
  const comLatest = latestByCardFn(com)
  const comTotal = comLatest.length
  const comFechados = comLatest.filter(e => CLOSED_COMERCIAL.includes(e.phase_name)).length
  const comPerdidos = comLatest.filter(e => LOST_COMERCIAL.includes(e.phase_name)).length
  const comAndamento = comTotal - comFechados - comPerdidos
  const comVolCredito = (() => { const m = {}; com.forEach(e => { if (e.valor_credito_considerado) m[e.card_id] = Math.max(m[e.card_id] || 0, e.valor_credito_considerado) }); return Object.values(m).reduce((a, b) => a + b, 0) })()
  const comVolFinal = (() => { const m = {}; com.forEach(e => { if (e.valor_final_proposta) m[e.card_id] = Math.max(m[e.card_id] || 0, e.valor_final_proposta) }); return Object.values(m).reduce((a, b) => a + b, 0) })()
  const comVolFechado = comLatest.filter(e => CLOSED_COMERCIAL.includes(e.phase_name)).reduce((s, e) => { const m = {}; com.forEach(ev => { if (ev.card_id === e.card_id && ev.valor_final_proposta) m[ev.card_id] = Math.max(m[ev.card_id] || 0, ev.valor_final_proposta) }); return s + (m[e.card_id] || 0) }, 0)

  // ── COMPLIANCE ────────────────────────────────────────────────────────────
  const cmpLatest = latestByCardFn(cmp)
  const cmpTotal = cmpLatest.length
  const cmpDueConcluida = cmp.filter(e => e.phase_name === 'DUE CONCLUÍDA')
  const cmpComInc = cmpDueConcluida.filter(e => e.tem_inconsistencia && !['não','nao'].includes((e.tem_inconsistencia || '').toLowerCase())).length
  const cmpSemInc = cmpDueConcluida.length - cmpComInc

  // ── JURÍDICO ──────────────────────────────────────────────────────────────
  const jurLatest = latestByCardFn(jur)
  const jurTotal = jurLatest.length
  const jurAnexados = jurLatest.filter(e => e.phase_name === 'ANEXADO NOS AUTOS').length
  const jurPerdidos = jurLatest.filter(e => e.phase_name === 'PERDIDO - DUE INCONSISTENTE').length
  const jurAndamento = jurTotal - jurAnexados - jurPerdidos
  const jurVolExec = (() => { const m = {}; jur.forEach(e => { if (e.valor_total_executado) m[e.card_id] = Math.max(m[e.card_id] || 0, e.valor_total_executado) }); return Object.values(m).reduce((a, b) => a + b, 0) })()

  // ── FINANCEIRO ────────────────────────────────────────────────────────────
  const finLatest = latestByCardFn(fin)
  const finTotal = finLatest.length
  const finRealizado = finLatest.filter(e => e.phase_name === 'PAGAMENTO REALIZADO').length
  const finLiberado = finLatest.filter(e => e.phase_name === 'PAGAMENTO LIBERADO').length
  const finVolReal = (() => { const m = {}; fin.forEach(e => { if (e.valor_final_da_proposta) m[e.card_id] = Math.max(m[e.card_id] || 0, e.valor_final_da_proposta) }); return Object.values(m).filter((_, i) => finLatest.filter(e => e.phase_name === 'PAGAMENTO REALIZADO')[i]).reduce((a, b) => a + b, 0) })()
  const finVolTotal = (() => { const m = {}; fin.forEach(e => { if (e.valor_final_da_proposta) m[e.card_id] = Math.max(m[e.card_id] || 0, e.valor_final_da_proposta) }); return Object.values(m).reduce((a, b) => a + b, 0) })()

  // ── Fluxo pipeline ────────────────────────────────────────────────────────
  const flowSteps = [
    { label: 'SDR Qualificados', count: sdrQual, color: '#6366f1' },
    { label: 'Comercial', count: comTotal, color: '#8b5cf6' },
    { label: 'Compliance', count: cmpTotal, color: '#06b6d4' },
    { label: 'Jurídico', count: jurTotal, color: '#f59e0b' },
    { label: 'Financeiro', count: finTotal, color: '#10b981' },
  ]

  return (
    <div style={{ padding: '32px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary, marginBottom: 4 }}>Visão Geral do Pipeline</h1>
          <p style={{ color: theme.textMuted, fontSize: 13 }}>Resumo consolidado de todos os pipes — SDR → Comercial → Compliance → Jurídico → Financeiro</p>
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

      {/* Pipeline flow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
        {flowSteps.map((step, i) => (
          <FlowStep
            key={step.label}
            {...step}
            isFirst={i === 0}
            pctVal={i > 0 ? pct(step.count, flowSteps[i - 1].count) : null}
          />
        ))}
      </div>

      {/* Pipe cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        <PipeCard
          title="SDR — COMERCIAL"
          color="#6366f1"
          icon="📋"
          stats={[
            { label: 'Total de leads', value: sdrTotal },
            { label: 'Em atendimento', value: sdrAtend, accent: '#f59e0b' },
            { label: 'Qualificados', value: sdrQual, accent: '#10b981', sub: `${pct(sdrQual, sdrTotal)}%` },
            { label: 'Desqualificados', value: sdrDesq, accent: '#ef4444', sub: `${pct(sdrDesq, sdrTotal)}%` },
          ]}
        />

        <PipeCard
          title="COMERCIAL"
          color="#8b5cf6"
          icon="🤝"
          stats={[
            { label: 'Total de negociações', value: comTotal },
            { label: 'Em andamento', value: comAndamento, accent: '#6366f1' },
            { label: 'Fechados', value: comFechados, accent: '#10b981', sub: `${pct(comFechados, comTotal)}%` },
            { label: 'Perdidos', value: comPerdidos, accent: '#ef4444', sub: `${pct(comPerdidos, comTotal)}%` },
          ]}
          financial={[
            { label: 'Vol. Crédito', value: fmt(comVolCredito), accent: '#8b5cf6' },
            { label: 'Vol. Proposta', value: fmt(comVolFinal), accent: '#a78bfa' },
          ]}
        />

        <PipeCard
          title="COMPLIANCE"
          color="#06b6d4"
          icon="🔍"
          stats={[
            { label: 'Total de cards', value: cmpTotal },
            { label: 'Due Concluída', value: cmpDueConcluida.length, accent: '#06b6d4', sub: `${pct(cmpDueConcluida.length, cmpTotal)}%` },
            { label: 'Com inconsistência', value: cmpComInc, accent: '#ef4444', sub: cmpDueConcluida.length > 0 ? `${pct(cmpComInc, cmpDueConcluida.length)}%` : '' },
            { label: 'Sem inconsistência', value: cmpSemInc, accent: '#10b981', sub: cmpDueConcluida.length > 0 ? `${pct(cmpSemInc, cmpDueConcluida.length)}%` : '' },
          ]}
        />

        <PipeCard
          title="JURÍDICO"
          color="#f59e0b"
          icon="⚖️"
          stats={[
            { label: 'Total de cards', value: jurTotal },
            { label: 'Em andamento', value: jurAndamento, accent: '#f59e0b' },
            { label: 'Anexados nos autos', value: jurAnexados, accent: '#10b981', sub: `${pct(jurAnexados, jurTotal)}%` },
            { label: 'Perdidos', value: jurPerdidos, accent: '#ef4444', sub: `${pct(jurPerdidos, jurTotal)}%` },
          ]}
          financial={[
            { label: 'Vol. Executado', value: fmt(jurVolExec), accent: '#fbbf24' },
          ]}
        />

        <PipeCard
          title="FINANCEIRO"
          color="#10b981"
          icon="💰"
          stats={[
            { label: 'Total de cards', value: finTotal },
            { label: 'Aguardando pagamento', value: finLiberado, accent: '#f59e0b' },
            { label: 'Pagamento realizado', value: finRealizado, accent: '#10b981', sub: `${pct(finRealizado, finTotal)}%` },
          ]}
          financial={[
            { label: 'Vol. Realizado', value: fmt(finVolTotal), accent: '#10b981' },
          ]}
        />
      </div>

      {/* Financial summary row */}
      <div style={{ background: theme.cardBg, borderRadius: 14, padding: '20px 28px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Resumo Financeiro Consolidado</div>
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { label: 'Crédito em negociação', value: fmt(comVolCredito), color: '#8b5cf6', sub: 'Comercial' },
            { label: 'Propostas formuladas', value: fmt(comVolFinal), color: '#a78bfa', sub: 'Comercial' },
            { label: 'Vol. executado jurídico', value: fmt(jurVolExec), color: '#f59e0b', sub: 'Jurídico' },
            { label: 'Volume realizado', value: fmt(finVolTotal), color: '#10b981', sub: 'Financeiro' },
            { label: 'Taxa de fechamento', value: `${pct(comFechados, comTotal)}%`, color: comFechados > 0 ? '#10b981' : '#ef4444', sub: 'Fechados / Comercial' },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ flex: 1, padding: '0 20px', borderLeft: i > 0 ? `1px solid ${theme.border}` : 'none' }}>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>{item.sub}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.value}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
