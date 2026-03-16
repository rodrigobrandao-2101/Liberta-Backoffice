import { useState, useEffect } from 'react'
import { useTheme } from '../ThemeContext.jsx'
import { supabase } from '../supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie } from 'recharts'
import DateRangePicker from '../components/DateRangePicker'

const USE_MOCK = false

const ACTIVE_PHASES = [
  'BACKLOG - COMERCIAL',
  'CLIENTE - APROVAÇÃO',
  'FORMULAÇÃO - PROPOSTA INICIAL',
  'APRESENTAÇÃO - PROPOSTA INICIAL',
  'AGUARDANDO DOCUMENTAÇÃO',
  'ENVIADO PARA COMPLIANCE - DUE',
  'COLETA DOCUMENTAL PARA RE-DUE',
  'ENVIADO PARA RE-DUE',
  'AGUARDANDO ANÁLISE JURÍDICA',
  'ANÁLISE JURÍDICA CONCLUÍDA',
  'ARREMATE COMERCIAL',
  'ELABORAÇÃO DO CONTRATO',
  'VALIDAÇÃO DO CONTRATO',
  'AGUARDANDO ASSINATURA',
  'CARTÓRIO EM AGENDAMENTO',
  'CARTÓRIO EM ANDAMENTO',
  'CARTÓRIO CONCLUÍDO',
  'AGUARDANDO PARA ANEXO NOS AUTOS',
  'ANEXADO NOS AUTOS',
]

const LOST_PHASES = [
  'PERDIDO - PROPOSTA INICIAL NEGADA',
  'PERDIDO - BARREIRA JURÍDICA',
  'PERDIDO - PROPOSTA CORRIGIDA NEGADA',
  'PERDIDO - DUE INCONSISTENTE',
]

// Fases que qualificam um card como "Proposta Arrematada" (pós-arremate, pré-Anexado)
const ARREMATADAS_PHASES = [
  'ELABORAÇÃO DO CONTRATO',
  'VALIDAÇÃO DO CONTRATO',
  'AGUARDANDO ASSINATURA',
  'CARTÓRIO EM AGENDAMENTO',
  'CARTÓRIO EM ANDAMENTO',
  'CARTÓRIO CONCLUÍDO',
  'AGUARDANDO PARA ANEXO NOS AUTOS',
]

const PHASE_COLORS = [
  '#475569', '#64748b', '#6366f1', '#7c3aed',
  '#f59e0b', '#f97316', '#fb923c', '#f43f5e',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6',
  '#10b981', '#14b8a6', '#84cc16', '#22c55e',
  '#a3e635', '#4ade80', '#34d399',
]

function generateMock() {
  const names = [
    'João Silva', 'Maria Souza', 'Carlos Lima', 'Ana Costa', 'Pedro Alves',
    'Fernanda Rocha', 'Lucas Mendes', 'Beatriz Nunes', 'Rafael Gomes', 'Juliana Pires',
    'Marcelo Teixeira', 'Camila Ferreira', 'Thiago Barbosa', 'Larissa Cardoso', 'Bruno Martins',
    'Priscila Oliveira', 'Diego Santos', 'Renata Castro', 'Gustavo Pereira', 'Vanessa Ribeiro',
    'Alexandre Cunha', 'Tatiane Moura', 'Fábio Correia', 'Daniela Lopes', 'Rodrigo Freitas',
    'Aline Carvalho', 'Eduardo Monteiro', 'Patrícia Vieira', 'Henrique Araujo', 'Sabrina Dias',
    'Leandro Barros', 'Cristiane Neves', 'Marcos Andrade', 'Simone Ramos', 'André Cavalcanti',
    'Kátia Borges', 'Ricardo Azevedo', 'Luciana Pinto', 'Felipe Moreira', 'Débora Campos',
  ]
  const events = []
  const today = new Date()

  for (let i = 0; i < 55; i++) {
    const cardId = `com-${2000 + i}`
    const name = names[i % names.length]
    const startDaysAgo = Math.floor(Math.random() * 90) + 1
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - startDaysAgo)

    const valorCredito = Math.round((80000 + Math.random() * 420000) / 5000) * 5000
    const valorProposta = Math.round(valorCredito * (0.68 + Math.random() * 0.12))
    const valorFinal = Math.round(valorProposta * (0.95 + Math.random() * 0.08))

    const rand = Math.random()
    let maxPhaseIdx
    if (rand < 0.18) maxPhaseIdx = 11           // 18% fechados
    else if (rand < 0.40) maxPhaseIdx = Math.floor(Math.random() * 3)       // early
    else maxPhaseIdx = Math.floor(Math.random() * 7) + 2  // mid/advanced

    // Deterministic + random: ~every 5th card is lost, plus 30% random chance
    const willBeLost = maxPhaseIdx < 11 && (i % 5 === 2 || Math.random() < 0.30)

    let currentDate = new Date(startDate)

    for (let p = 0; p <= maxPhaseIdx; p++) {
      const entered = new Date(currentDate)
      const daysIn = Math.floor(Math.random() * 12) + 1
      const exited = p < maxPhaseIdx ? new Date(currentDate.getTime() + daysIn * 86400000) : null

      const evt = {
        id: `${cardId}-p${p}`,
        card_id: cardId,
        card_title: name,
        pipe_name: 'COMERCIAL',
        phase_name: ACTIVE_PHASES[p],
        entered_at: entered.toISOString(),
        exited_at: exited?.toISOString() || null,
        duration_minutes: exited ? daysIn * 24 * 60 : null,
        valor_credito: valorCredito,
        valor_proposta_cliente: p >= 2 ? valorProposta : null,
        valor_final_proposta: p >= 7 ? valorFinal : null,
      }
      // ARREMATE COMERCIAL: campos específicos desta fase
      if (p === 7) {
        const altered = Math.random() > 0.38
        evt.proposta_alterada = altered
        if (altered) {
          evt.cliente_aceitou_proposta_corrigida = Math.random() > 0.22
        }
        // ~30% dos cards chegam ao arremate com valor já renegociado (vieram de inseguro+negociou)
        if (Math.random() > 0.7) {
          evt.valor_renegociado = Math.round(valorProposta * (0.91 + Math.random() * 0.1))
        }
      }
      // APRESENTAÇÃO - PROPOSTA INICIAL: campos específicos desta fase
      if (p === 3) {
        const r2 = Math.random()
        const decision = r2 < 0.48 ? 'SIM' : r2 < 0.68 ? 'NAO' : 'AINDA NAO (INSEGURO)'
        evt.cliente_aceitou_proposta_inicial = decision
        evt.rentabilidade_anual_esperada = Math.round((48 + Math.random() * 32) * 10) / 10
        evt.ja_recebeu_proposta = Math.random() > 0.62
        evt.valor_desejado_cliente = Math.round(valorCredito * (0.52 + Math.random() * 0.18))
        if (decision === 'AINDA NAO (INSEGURO)') {
          evt.conseguiu_negociar = Math.random() > 0.42
          const motivosList = ['Valor da proposta', 'Incerteza no processo', 'Precisa consultar familiar', 'Comparando com outra oferta']
          evt.motivo_inseguranca = motivosList[Math.floor(Math.random() * motivosList.length)]
          if (evt.conseguiu_negociar) {
            evt.rentabilidade_pos_renegociacao = Math.round((evt.rentabilidade_anual_esperada - 2 - Math.random() * 6) * 10) / 10
            evt.valor_renegociado = Math.round(valorProposta * (0.95 + Math.random() * 0.07))
          }
        }
      }
      events.push(evt)

      if (exited) currentDate = new Date(exited)
    }

    if (willBeLost) {
      const lostPhase = LOST_PHASES[i % LOST_PHASES.length]
      const lostDate = new Date(currentDate.getTime() + (Math.floor(Math.random() * 5) + 1) * 86400000)
      events.push({
        id: `${cardId}-lost`,
        card_id: cardId,
        card_title: name,
        pipe_name: 'COMERCIAL',
        phase_name: lostPhase,
        entered_at: lostDate.toISOString(),
        exited_at: null,
        duration_minutes: null,
        valor_credito: valorCredito,
        valor_proposta_cliente: maxPhaseIdx >= 2 ? valorProposta : null,
        valor_final_proposta: null,
      })
    }
  }

  return events.sort((a, b) => a.entered_at.localeCompare(b.entered_at))
}

const fmt = n => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
const fmtK = fmt

// Pipefy retorna strings ("Sim"/"Não") — mock usa boolean. Normalizar os dois.
const isSim = v => v === true || (typeof v === 'string' && /^s(im)?$/i.test(v.trim()))
const isNao = v => v === false || (typeof v === 'string' && /^n(ão|ao)?$/i.test(v.trim()))

function KPICard({ label, value, sub, accent }) {
  const { theme } = useTheme()
  return (
    <div style={{ background: theme.cardBg, borderRadius: 12, padding: '18px 22px', flex: 1, minWidth: 0, borderTop: `3px solid ${accent || theme.border}` }}>
      <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent || theme.textPrimary }}>{value}</div>
      {sub && <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }) {
  const { theme } = useTheme()
  return <h2 style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>{children}</h2>
}


export default function Comercial() {
  const { theme } = useTheme()
  const ttStyle = { background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: 12 }
  const [dateRange, setDateRange] = useState(() => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 14); return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)] })
  const [events, setEvents] = useState([])
  const [sdrRawEvents, setSdrRawEvents] = useState([])
  const [sdrMockCount, setSdrMockCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [durSortByTime, setDurSortByTime] = useState(false)
  const [tablePhaseFilter, setTablePhaseFilter] = useState('all')
  const [hideTest, setHideTest] = useState(true)
  const [funnelDrill, setFunnelDrill] = useState(null)          // label da fase expandida
  const [funnelExclusions, setFunnelExclusions] = useState(() => {
    try {
      const saved = localStorage.getItem('funnel_exclusions_comercial')
      if (!saved) return {}
      const parsed = JSON.parse(saved)
      return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, new Set(v)]))
    } catch { return {} }
  })
  const [cardHistory, setCardHistory] = useState(null)          // { cardId, title }

  useEffect(() => {
    try {
      const serializable = Object.fromEntries(Object.entries(funnelExclusions).map(([k, v]) => [k, [...v]]))
      localStorage.setItem('funnel_exclusions_comercial', JSON.stringify(serializable))
    } catch {}
  }, [funnelExclusions])

  useEffect(() => { fetchData() }, [dateRange])

  async function fetchData() {
    setLoading(true)
    if (USE_MOCK) {
      let mock = generateMock()
      if (dateRange[0]) mock = mock.filter(e => e.entered_at >= dateRange[0])
      if (dateRange[1]) mock = mock.filter(e => e.entered_at <= dateRange[1] + 'T23:59:59')
      setEvents(mock)
      // Mock: ~2.5x o total no backlog chegou como qualificados no SDR
      setSdrMockCount(Math.round(mock.filter(e => e.phase_name === 'BACKLOG - COMERCIAL').length * 2.5))
      setSdrRawEvents([])
      setLoading(false)
      return
    }
    setSdrMockCount(null)
    const [comRes, sdrRes] = await Promise.all([
      supabase.from('comercial_events').select('*').eq('is_deleted', false).order('entered_at', { ascending: true })
        .gte('entered_at', dateRange[0] || '2000-01-01')
        .lte('entered_at', (dateRange[1] || '2099-12-31') + 'T23:59:59')
        .limit(10000),
      supabase.from('sdr_events').select('card_id, is_test, nome_completo, card_title').eq('is_deleted', false).eq('phase_name', 'QUALIFICADO')
        .gte('entered_at', dateRange[0] || '2000-01-01')
        .lte('entered_at', (dateRange[1] || '2099-12-31') + 'T23:59:59')
        .limit(10000),
    ])
    // Normalizar: valor_credito_considerado → valor_credito (nome usado nos cálculos)
    setEvents((comRes.data || []).map(e => ({ ...e, valor_credito: e.valor_credito_considerado ?? e.valor_credito })))
    setSdrRawEvents(sdrRes.data || [])
    setLoading(false)
  }

  // ── Filtro de cards de teste ──────────────────────────────────────────────
  const visibleEvents = hideTest
    ? events.filter(e => !e.is_test && !(e.card_title || '').toLowerCase().includes('[teste]'))
    : events

  // ── SDR qualificados (respeita hideTest) ──────────────────────────────────
  const sdrQualificados = sdrMockCount != null
    ? sdrMockCount
    : (() => {
        const arr = hideTest
          ? sdrRawEvents.filter(e => !e.is_test && !(e.card_title || '').toLowerCase().includes('[teste]') && !(e.nome_completo || '').toLowerCase().includes('[teste]'))
          : sdrRawEvents
        return new Set(arr.map(e => e.card_id)).size
      })()

  // ── SDR → Backlog funnel ──────────────────────────────────────────────────
  const noBacklog = new Set(visibleEvents.filter(e => e.phase_name === 'BACKLOG - COMERCIAL').map(e => e.card_id)).size
  const taxaSDRtoComercial = sdrQualificados > 0 ? Math.round(noBacklog / sdrQualificados * 100) : 0

  // ── Current phase per card — preferir exited_at=null (fase ativa) ──────────
  const latestEvent = {}
  const firstEntryByCard = {}
  visibleEvents.forEach(e => {
    const cur = latestEvent[e.card_id]
    if (!cur) {
      latestEvent[e.card_id] = e
    } else {
      const eCurrent = !e.exited_at
      const curCurrent = !cur.exited_at
      if (eCurrent && !curCurrent) {
        latestEvent[e.card_id] = e           // e é fase ativa, substituir
      } else if (eCurrent === curCurrent && e.entered_at > cur.entered_at) {
        latestEvent[e.card_id] = e           // mesmo status, pegar mais recente
      }
    }
    if (!firstEntryByCard[e.card_id] || e.entered_at < firstEntryByCard[e.card_id]) {
      firstEntryByCard[e.card_id] = e.entered_at
    }
  })
  const latestEvents = Object.values(latestEvent)

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const total       = latestEvents.length
  const fechados    = latestEvents.filter(e => e.phase_name === 'ANEXADO NOS AUTOS').length
  const perdidos    = latestEvents.filter(e => LOST_PHASES.includes(e.phase_name)).length
  const standBy     = latestEvents.filter(e => e.phase_name === 'CLIENTE - APROVAÇÃO').length
  const emAndamento = total - fechados - perdidos - standBy
  const taxaFechamento = total > 0 ? Math.round(fechados / total * 100) : 0

  // Financial — pick max per card
  const creditByCard = {}, proposalByCard = {}, finalByCard = {}, renegByCard = {}
  visibleEvents.forEach(e => {
    if (e.valor_credito) creditByCard[e.card_id] = Math.max(creditByCard[e.card_id] || 0, e.valor_credito)
    if (e.valor_proposta_cliente) proposalByCard[e.card_id] = Math.max(proposalByCard[e.card_id] || 0, e.valor_proposta_cliente)
    if (e.valor_final_proposta) finalByCard[e.card_id] = Math.max(finalByCard[e.card_id] || 0, e.valor_final_proposta)
    if (e.valor_renegociado) renegByCard[e.card_id] = Math.max(renegByCard[e.card_id] || 0, e.valor_renegociado)
  })
  const volCredito  = Object.values(creditByCard).reduce((s, v) => s + v, 0)
  // Crédito considerado = crédito dos cards que chegaram na fase de formulação (têm proposta)
  const creditConsiderado = {}
  visibleEvents.forEach(e => {
    if (e.valor_proposta_cliente && e.valor_credito)
      creditConsiderado[e.card_id] = Math.max(creditConsiderado[e.card_id] || 0, e.valor_credito)
  })
  const volCreditoConsiderado = Object.values(creditConsiderado).reduce((s, v) => s + v, 0)
  const volProposta = Object.values(proposalByCard).reduce((s, v) => s + v, 0)
  // Propostas Arrematadas: somente cards cuja fase atual é pós-Arremate e pré-Anexado (não perdidos)
  const arrematadosCards = latestEvents.filter(e => ARREMATADAS_PHASES.includes(e.phase_name))
  const volFechado  = arrematadosCards.reduce((s, e) => s + (finalByCard[e.card_id] || 0), 0)
  const nArrematados = arrematadosCards.length
  // Compra Efetiva: somente ANEXADO NOS AUTOS
  const volFinalFechados = latestEvents
    .filter(e => e.phase_name === 'ANEXADO NOS AUTOS')
    .reduce((s, e) => s + (finalByCard[e.card_id] || 0), 0)
  const ticketMedio = fechados > 0 ? volFinalFechados / fechados : 0

  // ── APRESENTAÇÃO - PROPOSTA INICIAL analytics ────────────────────────────
  const apresentEvents = visibleEvents.filter(e => e.phase_name === 'APRESENTAÇÃO - PROPOSTA INICIAL')
  const apresentByCard = {}
  apresentEvents.forEach(e => {
    if (!apresentByCard[e.card_id] || e.entered_at > apresentByCard[e.card_id].entered_at)
      apresentByCard[e.card_id] = e
  })
  const apresentData = Object.values(apresentByCard)
  const nApresent = apresentData.length

  const decSim     = apresentData.filter(e => e.cliente_aceitou_proposta_inicial === 'SIM').length
  const decNao     = apresentData.filter(e => e.cliente_aceitou_proposta_inicial === 'NAO').length
  const decInseguro = apresentData.filter(e => e.cliente_aceitou_proposta_inicial?.includes('INSEGURO')).length

  const inseguroCards = apresentData.filter(e => e.cliente_aceitou_proposta_inicial?.includes('INSEGURO'))
  const negSim = inseguroCards.filter(e => isSim(e.conseguiu_negociar)).length
  const negNao = inseguroCards.filter(e => isNao(e.conseguiu_negociar)).length

  const motivoMap = {}
  inseguroCards.forEach(e => {
    if (e.motivo_inseguranca) motivoMap[e.motivo_inseguranca] = (motivoMap[e.motivo_inseguranca] || 0) + 1
  })
  const motivoData = Object.entries(motivoMap).sort((a, b) => b[1] - a[1]).slice(0, 4)

  const descontoVals = inseguroCards.filter(e => isSim(e.conseguiu_negociar) && e.valor_proposta_cliente > 0 && e.valor_renegociado > 0)
  const descontoMedio = descontoVals.length > 0
    ? descontoVals.reduce((s, e) => s + (e.valor_proposta_cliente - e.valor_renegociado) / e.valor_proposta_cliente * 100, 0) / descontoVals.length
    : null

  const rentVals = apresentData.filter(e => e.rentabilidade_anual_esperada > 0)
  const rentMedia = rentVals.length > 0 ? rentVals.reduce((s, e) => s + e.rentabilidade_anual_esperada, 0) / rentVals.length : null
  const rentPosVals = apresentData.filter(e => e.rentabilidade_pos_renegociacao > 0)
  const rentPosMedia = rentPosVals.length > 0 ? rentPosVals.reduce((s, e) => s + e.rentabilidade_pos_renegociacao, 0) / rentPosVals.length : null

  const jaSimCount = apresentData.filter(e => isSim(e.ja_recebeu_proposta)).length
  const jaNaoCount = apresentData.filter(e => isNao(e.ja_recebeu_proposta)).length
  const valorDesejadoList = apresentData.filter(e => e.valor_desejado_cliente > 0)
  const valorDesejadoMedio = valorDesejadoList.length > 0 ? valorDesejadoList.reduce((s, e) => s + e.valor_desejado_cliente, 0) / valorDesejadoList.length : null
  const propMediaList = apresentData.filter(e => e.valor_proposta_cliente > 0)
  const propMedia = propMediaList.length > 0 ? propMediaList.reduce((s, e) => s + e.valor_proposta_cliente, 0) / propMediaList.length : null

  // ── ARREMATE COMERCIAL analytics ─────────────────────────────────────────
  const arrEvents = visibleEvents.filter(e => e.phase_name === 'ARREMATE COMERCIAL')
  const arrByCard = {}
  arrEvents.forEach(e => {
    if (!arrByCard[e.card_id] || e.entered_at > arrByCard[e.card_id].entered_at)
      arrByCard[e.card_id] = e
  })
  const arrData = Object.values(arrByCard)
  const nArremate = arrData.length

  const arrAlterada    = arrData.filter(e => isSim(e.proposta_alterada)).length
  const arrNaoAlterada = arrData.filter(e => isNao(e.proposta_alterada)).length
  const arrAlteradaCards = arrData.filter(e => isSim(e.proposta_alterada))
  const arrAceitouCorrigida    = arrAlteradaCards.filter(e => isSim(e.cliente_aceitou_proposta_corrigida)).length
  const arrNaoAceitouCorrigida = arrAlteradaCards.filter(e => isNao(e.cliente_aceitou_proposta_corrigida)).length

  // Comparação: valor_final_proposta vs base (renegociado se existir, senão proposta_cliente)
  const arrDeltaVals = arrData.filter(e => {
    const base = e.valor_renegociado || e.valor_proposta_cliente
    return base > 0 && e.valor_final_proposta > 0
  }).map(e => {
    const base = e.valor_renegociado || e.valor_proposta_cliente
    return { delta: (e.valor_final_proposta - base) / base * 100, base, final: e.valor_final_proposta, usedReneg: !!e.valor_renegociado }
  })
  const arrDeltaMedio    = arrDeltaVals.length > 0 ? arrDeltaVals.reduce((s, v) => s + v.delta, 0) / arrDeltaVals.length : null
  const arrAvgBase       = arrDeltaVals.length > 0 ? arrDeltaVals.reduce((s, v) => s + v.base,  0) / arrDeltaVals.length : null
  const arrFinalList     = arrData.filter(e => e.valor_final_proposta > 0)
  const arrAvgFinal      = arrFinalList.length > 0 ? arrFinalList.reduce((s, e) => s + e.valor_final_proposta, 0) / arrFinalList.length : null
  const arrComReneg      = arrDeltaVals.filter(v => v.usedReneg).length
  const arrReducao       = arrDeltaVals.filter(v => v.delta < -0.5).length
  const arrAumento       = arrDeltaVals.filter(v => v.delta > 0.5).length

  // ── Funnel: cards per current phase ──────────────────────────────────────
  const phaseCounts = {}
  latestEvents.forEach(e => { phaseCounts[e.phase_name] = (phaseCounts[e.phase_name] || 0) + 1 })
  const funnelActive = ACTIVE_PHASES.map((p, i) => ({
    fullName: p, count: phaseCounts[p] || 0, color: PHASE_COLORS[i], lost: false,
  })).filter(d => d.count > 0)
  const funnelLost = LOST_PHASES.map(p => ({
    fullName: p, count: phaseCounts[p] || 0, color: '#ef4444', lost: true,
  })).filter(d => d.count > 0)
  const funnelData = [...funnelActive, ...funnelLost]

  // ── Lost breakdown ────────────────────────────────────────────────────────
  const lostData = LOST_PHASES.map(p => ({
    name: p.replace('PERDIDO - ', ''),
    count: latestEvents.filter(e => e.phase_name === p).length,
  })).filter(d => d.count > 0)

  // ── Historical throughput funnel (cards that ever passed through each phase) ─
  const throughputMap = {}
  const cardTitleMap = {}
  visibleEvents.forEach(e => {
    if (!throughputMap[e.phase_name]) throughputMap[e.phase_name] = new Set()
    throughputMap[e.phase_name].add(e.card_id)
    if (!cardTitleMap[e.card_id]) cardTitleMap[e.card_id] = e.card_title
  })

  // SDR cards for drill-down (prioriza nome_completo)
  const sdrFilteredForDrill = hideTest
    ? sdrRawEvents.filter(e => !e.is_test && !(e.card_title || '').toLowerCase().includes('[teste]') && !(e.nome_completo || '').toLowerCase().includes('[teste]'))
    : sdrRawEvents
  const sdrDrillCards = [...new Map(sdrFilteredForDrill.map(e => [e.card_id, { id: e.card_id, title: e.nome_completo || e.card_title || e.card_id }])).values()]

  // Helper: cards de uma fase do funil
  function funnelStepCards(phaseName) {
    if (!phaseName) return sdrDrillCards
    const ids = throughputMap[phaseName]
    if (!ids) return []
    return [...ids].map(id => ({ id, title: cardTitleMap[id] || id }))
  }
  function funnelStepCount(label, phaseName) {
    const excl = funnelExclusions[label]
    const cards = funnelStepCards(phaseName)
    if (!excl) return cards.length
    return cards.filter(c => !excl.has(c.id)).length
  }
  function toggleExclusion(label, cardId) {
    setFunnelExclusions(prev => {
      const s = new Set(prev[label] || [])
      if (s.has(cardId)) s.delete(cardId); else s.add(cardId)
      return { ...prev, [label]: s }
    })
  }

  const FUNNEL_STEPS = [
    { label: 'Backlog Comercial',        phaseName: 'BACKLOG - COMERCIAL',             color: '#7c3aed' },
    { label: 'Cliente - Aprovação',      phaseName: 'CLIENTE - APROVAÇÃO',             color: '#6366f1' },
    { label: 'Formulação - Proposta',    phaseName: 'FORMULAÇÃO - PROPOSTA INICIAL',   color: '#4f46e5' },
    { label: 'Apresentação - Proposta',  phaseName: 'APRESENTAÇÃO - PROPOSTA INICIAL', color: '#3b82f6' },
    { label: 'Aguardando Documentação',  phaseName: 'AGUARDANDO DOCUMENTAÇÃO',         color: '#0ea5e9' },
    { label: 'Compliance - DUE',         phaseName: 'ENVIADO PARA COMPLIANCE - DUE',   color: '#06b6d4' },
    { label: 'Ag. Análise Jurídica',     phaseName: 'AGUARDANDO ANÁLISE JURÍDICA',     color: '#0284c7' },
    { label: 'Análise Jurídica',         phaseName: 'ANÁLISE JURÍDICA CONCLUÍDA',      color: '#14b8a6' },
    { label: 'Arremate Comercial',       phaseName: 'ARREMATE COMERCIAL',              color: '#10b981' },
    { label: 'Validação Contrato',       phaseName: 'VALIDAÇÃO DO CONTRATO',           color: '#22c55e' },
    { label: 'Cartório',                 phaseName: 'CARTÓRIO EM AGENDAMENTO',         color: '#84cc16' },
    { label: 'Aguardando Anexo',         phaseName: 'AGUARDANDO PARA ANEXO NOS AUTOS', color: '#a3e635' },
    { label: 'Anexado nos Autos',        phaseName: 'ANEXADO NOS AUTOS',               color: '#f59e0b' },
  ].map(s => ({ ...s, count: funnelStepCount(s.label, s.phaseName) }))

  // ── Daily entries ─────────────────────────────────────────────────────────
  const dailyMap = {}
  visibleEvents.forEach(e => {
    const day = e.entered_at?.slice(0, 10)
    if (day && !LOST_PHASES.includes(e.phase_name)) dailyMap[day] = (dailyMap[day] || 0) + 1
  })
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([d, count]) => ({ date: d.slice(8) + '/' + d.slice(5, 7), count }))

  // ── Avg duration per phase ────────────────────────────────────────────────
  const durMap = {}, durCount = {}
  visibleEvents.forEach(e => {
    if (e.duration_minutes > 0) {
      durMap[e.phase_name] = (durMap[e.phase_name] || 0) + e.duration_minutes
      durCount[e.phase_name] = (durCount[e.phase_name] || 0) + 1
    }
  })
  const durationData = [...ACTIVE_PHASES, ...LOST_PHASES]
    .filter(p => durMap[p])
    .map(p => {
      const avgMin = durMap[p] / durCount[p]
      return {
        name: p.length > 22 ? p.slice(0, 20) + '…' : p,
        fullName: p,
        dias: Math.floor(avgMin / 60 / 24),
        horas: Math.floor((avgMin % (60 * 24)) / 60),
        color: ACTIVE_PHASES.includes(p) ? PHASE_COLORS[ACTIVE_PHASES.indexOf(p)] : '#ef4444',
        lost: !ACTIVE_PHASES.includes(p),
      }
    })

  // ── Phase transition times ────────────────────────────────────────────────
  const cardPhaseEntry = {}
  visibleEvents.forEach(e => {
    if (!cardPhaseEntry[e.card_id]) cardPhaseEntry[e.card_id] = {}
    if (!cardPhaseEntry[e.card_id][e.phase_name] || e.entered_at < cardPhaseEntry[e.card_id][e.phase_name])
      cardPhaseEntry[e.card_id][e.phase_name] = e.entered_at
  })
  function avgHours(fromPhase, toPhase) {
    const diffs = []
    Object.values(cardPhaseEntry).forEach(phases => {
      if (phases[fromPhase] && phases[toPhase]) {
        const diff = (new Date(phases[toPhase]) - new Date(phases[fromPhase])) / 3600000
        if (diff > 0) diffs.push(diff)
      }
    })
    return diffs.length > 0 ? diffs.reduce((s, v) => s + v, 0) / diffs.length : null
  }
  function fmtHours(h) {
    if (h == null) return '—'
    const hrs = Math.round(h)
    const days = (h / 24).toFixed(1)
    return `${hrs}h (${days}d)`
  }
  const TRANSITIONS = [
    { label: 'Backlog → Formulação',       from: 'BACKLOG - COMERCIAL',                  to: 'FORMULAÇÃO - PROPOSTA INICIAL' },
    { label: 'Formulação → Apresentação',  from: 'FORMULAÇÃO - PROPOSTA INICIAL',         to: 'APRESENTAÇÃO - PROPOSTA INICIAL' },
    { label: 'Apresentação → Análise Jur.',from: 'APRESENTAÇÃO - PROPOSTA INICIAL',       to: 'ANÁLISE JURÍDICA CONCLUÍDA' },
    { label: 'Análise Jur. → Arremate',    from: 'ANÁLISE JURÍDICA CONCLUÍDA',            to: 'ARREMATE COMERCIAL' },
    { label: 'Arremate → Ag. Anexo',       from: 'ARREMATE COMERCIAL',                    to: 'AGUARDANDO PARA ANEXO NOS AUTOS' },
    { label: 'Ag. Anexo → Anexado',        from: 'AGUARDANDO PARA ANEXO NOS AUTOS',       to: 'ANEXADO NOS AUTOS' },
    { label: null },
    { label: 'Backlog → Anexado (total)',  from: 'BACKLOG - COMERCIAL',                   to: 'ANEXADO NOS AUTOS', summary: true },
    { label: 'Apresentação → Anexado',     from: 'APRESENTAÇÃO - PROPOSTA INICIAL',       to: 'ANEXADO NOS AUTOS', summary: true },
  ].map(t => t.label === null ? t : { ...t, horas: avgHours(t.from, t.to) })

  // ── Recent deals table ────────────────────────────────────────────────────
  const recentDeals = latestEvents
    .sort((a, b) => b.entered_at.localeCompare(a.entered_at))
    .slice(0, 50)
    .map(e => {
      const firstISO = firstEntryByCard[e.card_id] || e.entered_at
      const diasNoPipe = Math.round((Date.now() - new Date(firstISO)) / 86400000)
      const fmtDate = d => d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4)
      const credConsid = creditConsiderado[e.card_id] || 0
      const proposta   = proposalByCard[e.card_id] || 0
      const reneg      = renegByCard[e.card_id] || 0
      const final      = finalByCard[e.card_id] || 0
      const desagio    = credConsid > 0 && proposta > 0 ? (proposta / credConsid - 1) * 100 : null
      const diffFinal  = proposta > 0 && final > 0 ? { reais: final - proposta, pct: (final / proposta - 1) * 100 } : null
      const aceitou    = apresentByCard[e.card_id]?.cliente_aceitou_proposta_inicial || null
      return {
        name: e.card_title,
        phase: e.phase_name,
        lost: LOST_PHASES.includes(e.phase_name),
        date: fmtDate(e.entered_at),
        pipeDate: fmtDate(firstISO),
        diasNoPipe,
        credConsid,
        proposta,
        desagio,
        aceitou,
        reneg,
        final,
        diffFinal,
      }
    })

  const phaseColorMap = {}
  ACTIVE_PHASES.forEach((p, i) => { phaseColorMap[p] = PHASE_COLORS[i] })
  LOST_PHASES.forEach(p => { phaseColorMap[p] = '#ef4444' })

  return (
    <div style={{ padding: '32px 40px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary, marginBottom: 4 }}>Comercial</h1>
          <p style={{ color: theme.textMuted, fontSize: 13 }}>Negociação e propostas — pipe COMERCIAL</p>
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

      {/* ── Topo de Funil: SDR → Comercial ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Topo de Funil — SDR → Comercial
        </div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
          <KPICard
            label="Leads Qualificados (SDR)"
            value={sdrQualificados}
            sub="saíram do SDR como qualificados"
            accent="#8b5cf6"
          />
          <KPICard
            label="Chegaram no Backlog"
            value={noBacklog}
            sub="entraram no pipe comercial"
            accent="#6366f1"
          />
          <KPICard
            label="Taxa Qualificado → Backlog"
            value={`${taxaSDRtoComercial}%`}
            sub="conversão SDR para comercial"
            accent={taxaSDRtoComercial >= 50 ? '#06b6d4' : taxaSDRtoComercial >= 25 ? '#0ea5e9' : '#3b82f6'}
          />
          <div style={{ flex: 2 }} />
        </div>
      </div>

      {/* ── KPIs row 1 ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <KPICard label="Total de Negociações" value={total} sub="cards únicos no período" accent="#6366f1" />
        <KPICard label="Em Andamento" value={emAndamento} sub="fases ativas" accent="#3b82f6" />
        <KPICard label="Cliente - Aprovação" value={standBy} sub="aguardando aprovação" accent="#64748b" />
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: '18px 22px', flex: 1, minWidth: 0, borderTop: '3px solid #ef4444' }}>
          <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 6 }}>Perdidos</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{perdidos}</div>
              <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>saíram do pipeline</div>
            </div>
            <div style={{ width: 1, height: 36, background: theme.border, flexShrink: 0 }} />
            <div>
              {(() => { const tx = total > 0 ? Math.round(perdidos / total * 100) : 0; const c = tx <= 15 ? '#22c55e' : tx <= 30 ? '#f59e0b' : '#ef4444'; return (<><div style={{ fontSize: 18, fontWeight: 700, color: c }}>{tx}%</div><div style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>tx. perdidos</div></>); })()}
            </div>
          </div>
        </div>
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: '18px 22px', flex: 1, minWidth: 0, borderTop: '3px solid #22c55e' }}>
          <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 6 }}>Fechados</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{fechados}</div>
              <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>anexado nos autos</div>
            </div>
            <div style={{ width: 1, height: 36, background: theme.border, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{taxaFechamento}%</div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>tx. fechamento</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPIs row 2 ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: '18px 22px', flex: 1, borderTop: '3px solid #8b5cf6' }}>
          <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Volume de Crédito</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>{fmtK(volCredito)}</div>
          <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2, marginBottom: 10 }}>volume total</div>
          <div style={{ display: 'flex', borderTop: '1px solid #2d3748', paddingTop: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#a78bfa' }}>{Object.values(creditByCard).length}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>deals</div>
            </div>
            <div style={{ width: 1, background: theme.border, margin: '0 12px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#a78bfa' }}>{Object.values(creditByCard).length > 0 ? fmtK(volCredito / Object.values(creditByCard).length) : '—'}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>valor médio / deal</div>
            </div>
          </div>
        </div>
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: '18px 22px', flex: 1, borderTop: '3px solid #0ea5e9' }}>
          <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Crédito Considerado</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0ea5e9' }}>{fmtK(volCreditoConsiderado)}</div>
          <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2, marginBottom: 10 }}>volume total</div>
          <div style={{ display: 'flex', borderTop: '1px solid #2d3748', paddingTop: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#38bdf8' }}>{Object.values(creditConsiderado).length}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>deals</div>
            </div>
            <div style={{ width: 1, background: theme.border, margin: '0 12px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#38bdf8' }}>{Object.values(creditConsiderado).length > 0 ? fmtK(volCreditoConsiderado / Object.values(creditConsiderado).length) : '—'}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>valor médio / deal</div>
            </div>
          </div>
        </div>
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: '18px 22px', flex: 1, borderTop: '3px solid #6366f1' }}>
          <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Volume de Propostas</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#6366f1' }}>{fmtK(volProposta)}</div>
          <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2, marginBottom: 10 }}>volume total</div>
          <div style={{ display: 'flex', borderTop: '1px solid #2d3748', paddingTop: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#818cf8' }}>{Object.values(proposalByCard).length}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>deals</div>
            </div>
            <div style={{ width: 1, background: theme.border, margin: '0 12px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#818cf8' }}>{Object.values(proposalByCard).length > 0 ? fmtK(volProposta / Object.values(proposalByCard).length) : '—'}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>valor médio / deal</div>
            </div>
          </div>
        </div>
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: '18px 22px', flex: 1, borderTop: '3px solid #f59e0b' }}>
          <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Propostas Arrematadas</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{fmtK(volFechado)}</div>
          <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2, marginBottom: 10 }}>pós-arremate, aguardando anexo</div>
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #2d3748', paddingTop: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fbbf24' }}>{nArrematados}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>deals</div>
            </div>
            <div style={{ width: 1, background: theme.border, margin: '0 12px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fbbf24' }}>{nArrematados > 0 ? fmtK(volFechado / nArrematados) : '—'}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>valor médio / deal</div>
            </div>
          </div>
        </div>
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: '18px 22px', flex: 1, borderTop: '3px solid #22c55e' }}>
          <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Compra Efetiva</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{fmtK(volFinalFechados)}</div>
          <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2, marginBottom: 10 }}>volume total</div>
          <div style={{ display: 'flex', borderTop: '1px solid #2d3748', paddingTop: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#34d399' }}>{fechados}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>deals</div>
            </div>
            <div style={{ width: 1, background: theme.border, margin: '0 12px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#34d399' }}>{fmtK(ticketMedio)}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>valor médio / deal</div>
            </div>
          </div>
        </div>
      </div>



      {/* ── APRESENTAÇÃO - PROPOSTA INICIAL ── */}
      {nApresent > 0 && (
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Apresentação — Proposta Inicial</h2>
            <p style={{ color: '#475569', fontSize: 12, marginTop: 4, marginBottom: 0 }}>{nApresent} cards chegaram a esta fase</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>

            {/* Coluna 1: Decisão do cliente */}
            <div style={{ paddingRight: 24 }}>
              <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Decisão do Cliente</div>
              {[
                { label: 'Aceitou a proposta',   count: decSim,      color: '#22c55e' },
                { label: 'Recusou a proposta',   count: decNao,      color: '#ef4444' },
                { label: 'Ainda não (inseguro)', count: decInseguro, color: '#f59e0b' },
              ].map((item, i) => {
                const pct = nApresent > 0 ? Math.round(item.count / nApresent * 100) : 0
                return (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: theme.textSecondary }}>{item.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: item.color }}>
                        {item.count} <span style={{ fontSize: 10, color: '#475569', fontWeight: 400 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 6, background: theme.cardBg2, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
              {(jaSimCount + jaNaoCount) > 0 && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #2d3748' }}>
                  <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Já recebeu outra proposta?</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, background: theme.cardBg2, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{jaSimCount}</div>
                      <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>Sim</div>
                    </div>
                    <div style={{ flex: 1, background: theme.cardBg2, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: theme.textMuted }}>{jaNaoCount}</div>
                      <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>Não</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna 2: Renegociação */}
            <div style={{ borderLeft: '1px solid #2d3748', paddingLeft: 24, paddingRight: 24 }}>
              <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                Renegociação <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({decInseguro} inseguros)</span>
              </div>
              {decInseguro === 0
                ? <div style={{ color: '#475569', fontSize: 12 }}>Nenhum inseguro no período</div>
                : <>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      <div style={{ flex: 1, background: theme.cardBg2, borderRadius: 8, padding: '10px 12px', textAlign: 'center', borderTop: '2px solid #22c55e' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{negSim}</div>
                        <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>negociou</div>
                        <div style={{ fontSize: 10, color: '#475569' }}>{decInseguro > 0 ? Math.round(negSim / decInseguro * 100) : 0}%</div>
                      </div>
                      <div style={{ flex: 1, background: theme.cardBg2, borderRadius: 8, padding: '10px 12px', textAlign: 'center', borderTop: '2px solid #ef4444' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>{negNao}</div>
                        <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>não negociou</div>
                        <div style={{ fontSize: 10, color: '#475569' }}>{decInseguro > 0 ? Math.round(negNao / decInseguro * 100) : 0}%</div>
                      </div>
                    </div>
                    {descontoMedio != null && (
                      <div style={{ background: theme.cardBg2, borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: theme.textMuted }}>Desconto médio negociado</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>-{descontoMedio.toFixed(1)}%</span>
                      </div>
                    )}
                    {motivoData.length > 0 && (
                      <>
                        <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Motivo da insegurança</div>
                        {motivoData.map(([motivo, count], i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                            <div style={{ width: 6, height: 6, borderRadius: 2, background: '#f59e0b', flexShrink: 0 }} />
                            <div style={{ flex: 1, fontSize: 11, color: theme.textSecondary, lineHeight: 1.3 }}>{motivo}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', flexShrink: 0 }}>{count}</div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
              }
            </div>

            {/* Coluna 3: Rentabilidade e valores */}
            <div style={{ borderLeft: '1px solid #2d3748', paddingLeft: 24 }}>
              <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Rentabilidade</div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>Esperada (média)</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>
                    {rentMedia != null ? `${rentMedia.toFixed(1)}%` : '—'}
                  </div>
                </div>
                {rentPosMedia != null && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>Pós-Renegociação</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6', lineHeight: 1 }}>
                      {rentPosMedia.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
              {(valorDesejadoMedio != null || propMedia != null) && (
                <div style={{ paddingTop: 14, borderTop: '1px solid #2d3748' }}>
                  <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Valor: Desejado vs Proposta</div>
                  {valorDesejadoMedio != null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: theme.textMuted }}>Desejado pelo cliente</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary }}>{fmtK(valorDesejadoMedio)}</span>
                    </div>
                  )}
                  {propMedia != null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: theme.textMuted }}>Proposta apresentada</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>{fmtK(propMedia)}</span>
                    </div>
                  )}
                  {valorDesejadoMedio != null && propMedia != null && (() => {
                    const diff = Math.round((propMedia / valorDesejadoMedio - 1) * 100)
                    const c = diff >= 0 ? '#22c55e' : '#f59e0b'
                    return (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#475569' }}>
                        Diferença: <span style={{ color: c, fontWeight: 700 }}>{diff >= 0 ? '+' : ''}{diff}%</span>
                        <span style={{ color: '#334155', marginLeft: 6 }}>{diff >= 0 ? 'acima do desejado' : 'abaixo do desejado'}</span>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── ARREMATE COMERCIAL ── */}
      {nArremate > 0 && (
        <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Arremate Comercial</h2>
            <p style={{ color: '#475569', fontSize: 12, marginTop: 4, marginBottom: 0 }}>{nArremate} cards chegaram a esta fase</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>

            {/* Coluna 1: Proposta alterada */}
            <div style={{ paddingRight: 24 }}>
              <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Proposta Precisou ser Alterada</div>
              {[
                { label: 'Sim, foi alterada', count: arrAlterada,    color: '#f59e0b' },
                { label: 'Não foi alterada',  count: arrNaoAlterada, color: '#6366f1' },
              ].map((item, i) => {
                const pct = nArremate > 0 ? Math.round(item.count / nArremate * 100) : 0
                return (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: theme.textSecondary }}>{item.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: item.color }}>
                        {item.count} <span style={{ fontSize: 10, color: '#475569', fontWeight: 400 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 6, background: theme.cardBg2, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
              {arrAlterada > 0 && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #2d3748' }}>
                  <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Dos {arrAlterada} alterados — aceitou a corrigida?
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, background: theme.cardBg2, borderRadius: 8, padding: '10px 12px', textAlign: 'center', borderTop: '2px solid #22c55e' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{arrAceitouCorrigida}</div>
                      <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>aceitou</div>
                      <div style={{ fontSize: 10, color: '#475569' }}>{arrAlterada > 0 ? Math.round(arrAceitouCorrigida / arrAlterada * 100) : 0}%</div>
                    </div>
                    <div style={{ flex: 1, background: theme.cardBg2, borderRadius: 8, padding: '10px 12px', textAlign: 'center', borderTop: '2px solid #ef4444' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>{arrNaoAceitouCorrigida}</div>
                      <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>recusou</div>
                      <div style={{ fontSize: 10, color: '#475569' }}>{arrAlterada > 0 ? Math.round(arrNaoAceitouCorrigida / arrAlterada * 100) : 0}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna 2: Ajuste de valor */}
            <div style={{ borderLeft: '1px solid #2d3748', paddingLeft: 24, paddingRight: 24 }}>
              <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                Variação: Proposta → Final
              </div>
              {arrDeltaMedio != null ? (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>Variação média</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: arrDeltaMedio <= 0 ? '#22c55e' : '#f59e0b', lineHeight: 1 }}>
                      {arrDeltaMedio >= 0 ? '+' : ''}{arrDeltaMedio.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>
                      {arrDeltaMedio <= 0 ? 'redução média na proposta' : 'aumento médio na proposta'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <div style={{ flex: 1, background: theme.cardBg2, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#22c55e' }}>{arrReducao}</div>
                      <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>com redução</div>
                    </div>
                    <div style={{ flex: 1, background: theme.cardBg2, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>{arrAumento}</div>
                      <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>com aumento</div>
                    </div>
                    <div style={{ flex: 1, background: theme.cardBg2, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: theme.textMuted }}>{arrDeltaVals.length - arrReducao - arrAumento}</div>
                      <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>sem variação</div>
                    </div>
                  </div>
                  {arrComReneg > 0 && (
                    <div style={{ fontSize: 10, color: '#475569', paddingTop: 10, borderTop: '1px solid #2d3748' }}>
                      <span style={{ color: '#6366f1', fontWeight: 700 }}>{arrComReneg}</span> cards usaram valor renegociado como base
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: '#475569', fontSize: 12 }}>Sem dados de valor suficientes</div>
              )}
            </div>

            {/* Coluna 3: Valores finais */}
            <div style={{ borderLeft: '1px solid #2d3748', paddingLeft: 24 }}>
              <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Valor Final da Proposta</div>
              {arrAvgFinal != null && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>Média dos deals</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#10b981', lineHeight: 1 }}>{fmtK(arrAvgFinal)}</div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>{arrFinalList.length} deals com valor final</div>
                </div>
              )}
              {arrAvgBase != null && arrAvgFinal != null && (
                <div style={{ paddingTop: 14, borderTop: '1px solid #2d3748' }}>
                  <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Comparativo de Base</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: theme.textMuted }}>Proposta base (média)</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary }}>{fmtK(arrAvgBase)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: theme.textMuted }}>Valor final (média)</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{fmtK(arrAvgFinal)}</span>
                  </div>
                  {(() => {
                    const diff = Math.round((arrAvgFinal / arrAvgBase - 1) * 100)
                    const c = diff <= 0 ? '#22c55e' : '#f59e0b'
                    return (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#475569' }}>
                        Variação: <span style={{ color: c, fontWeight: 700 }}>{diff >= 0 ? '+' : ''}{diff}%</span>
                        <span style={{ color: '#334155', marginLeft: 6 }}>{diff <= 0 ? 'redução vs proposta' : 'aumento vs proposta'}</span>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Funils lado a lado ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

      {/* Funil Histórico - esquerda */}
      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
        <SectionTitle>Funil de Conversão — Volume Histórico por Fase</SectionTitle>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {FUNNEL_STEPS.map((step, i) => {
            const maxCount = FUNNEL_STEPS[0].count || 1
            const widthPct = Math.max((step.count / maxCount) * 100, 6)
            const prev = i > 0 ? FUNNEL_STEPS[i - 1].count : null
            const conv = prev != null && prev > 0 ? Math.round(step.count / prev * 100) : null
            const convColor = conv == null ? '#475569' : conv >= 70 ? '#22c55e' : conv >= 40 ? '#f59e0b' : '#ef4444'
            const isOpen = funnelDrill === step.label
            const drillCards = funnelStepCards(step.phaseName)
            const excl = funnelExclusions[step.label] || new Set()
            return (
              <div key={i}>
                <div
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minHeight: 22, cursor: 'pointer' }}
                  onClick={() => setFunnelDrill(v => v === step.label ? null : step.label)}
                >
                  {/* Label */}
                  <div style={{ width: 140, flexShrink: 0, fontSize: 9, color: isOpen ? step.color : theme.textSecondary, textAlign: 'right', lineHeight: 1.3, fontWeight: isOpen ? 700 : 400 }}>
                    {step.label}
                  </div>
                  {/* Barra */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', height: '100%' }}>
                    <div style={{ width: `${widthPct}%`, background: step.color, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, minHeight: 22, transition: 'width 0.6s ease', opacity: isOpen ? 1 : 0.85 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{step.count}</span>
                    </div>
                  </div>
                  {/* Conv % */}
                  <div style={{ width: 38, flexShrink: 0, fontSize: 10, fontWeight: 600, color: convColor, textAlign: 'left' }}>
                    {conv != null ? `↓${conv}%` : ''}
                  </div>
                </div>
                {/* Drill-down */}
                {isOpen && (() => {
                  const nextStep = FUNNEL_STEPS[i + 1]
                  const nextIds = nextStep?.phaseName ? throughputMap[nextStep.phaseName] : null
                  return (
                    <div style={{ marginLeft: 148, marginRight: 46, marginBottom: 6, background: '#0f1420', borderRadius: 8, padding: '10px 12px', border: `1px solid ${step.color}44` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {drillCards.length} cards {nextIds ? '— 🟢 avançou · 🔴 não avançou' : ''}
                        </div>
                        {excl.size > 0 && (
                          <span onClick={e => { e.stopPropagation(); setFunnelExclusions(p => ({ ...p, [step.label]: new Set() })) }} style={{ fontSize: 10, color: '#475569', cursor: 'pointer', textDecoration: 'underline' }}>
                            limpar {excl.size} exclusão{excl.size > 1 ? 'ões' : ''}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {drillCards.map(c => {
                          const isExcluded = excl.has(c.id)
                          const advanced = nextIds ? nextIds.has(c.id) : null
                          const borderColor = isExcluded ? '#7f1d1d' : advanced === true ? '#16a34a' : advanced === false ? '#991b1b' : step.color + '66'
                          const nameColor = isExcluded ? '#ef4444' : advanced === true ? '#4ade80' : advanced === false ? '#f87171' : theme.textPrimary
                          return (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 0, background: isExcluded ? '#1a0a0a' : '#1e2130', border: `1px solid ${borderColor}`, borderRadius: 6, overflow: 'hidden', opacity: isExcluded ? 0.5 : 1 }}>
                              {/* Nome */}
                              <span style={{ fontSize: 11, color: nameColor, textDecoration: isExcluded ? 'line-through' : 'none', padding: '3px 6px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {c.title}
                              </span>
                              {/* Botão ℹ */}
                              <span
                                onClick={e => { e.stopPropagation(); setCardHistory({ cardId: c.id, title: c.title }) }}
                                title="Ver histórico de fases"
                                style={{ padding: '3px 5px', color: '#475569', cursor: 'pointer', fontSize: 11, lineHeight: 1, borderLeft: '1px solid #2d3748' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                              >ℹ</span>
                              {/* Botão × */}
                              <span
                                onClick={e => { e.stopPropagation(); toggleExclusion(step.label, c.id) }}
                                title={isExcluded ? 'Restaurar' : 'Excluir desta fase'}
                                style={{ padding: '3px 6px', color: isExcluded ? '#ef4444' : '#475569', cursor: 'pointer', fontSize: 13, fontWeight: 700, lineHeight: 1, borderLeft: '1px solid #2d3748' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={e => e.currentTarget.style.color = isExcluded ? '#ef4444' : '#475569'}
                              >×</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </div>
      </div>
      {/* Funil Cards por Fase - direita */}
      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24 }}>
        <SectionTitle>Funil — Cards por Fase Atual</SectionTitle>
        {funnelData.length === 0
          ? <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Sem dados</div>
          : (() => {
              const maxCount = Math.max(...funnelData.map(f => f.count))
              const firstLostIdx = funnelData.findIndex(d => d.lost)
              return funnelData.map((d, i) => (
                <div key={i}>
                  {i === firstLostIdx && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 12px' }}>
                      <div style={{ flex: 1, height: 1, background: theme.border }} />
                      <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Perdidos</span>
                      <div style={{ flex: 1, height: 1, background: theme.border }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 200, fontSize: 11, color: d.lost ? '#fca5a5' : theme.textSecondary, textAlign: 'right', flexShrink: 0 }}>{d.fullName}</div>
                    <div style={{ flex: 1, height: 24, background: theme.cardBg2, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${maxCount > 0 ? (d.count / maxCount) * 100 : 0}%`, background: d.color, borderRadius: 4, transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                        {(d.count / maxCount) * 100 > 15 && <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{d.count}</span>}
                      </div>
                    </div>
                    <div style={{ width: 32, fontSize: 12, fontWeight: 700, color: d.color, textAlign: 'right', flexShrink: 0 }}>{d.count}</div>
                  </div>
                </div>
              ))
            })()}
      </div>
      </div>

      {/* ── Tempo Médio por Fase ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Tempo Médio por Fase</h2>
          <button
            onClick={() => setDurSortByTime(v => !v)}
            style={{ background: durSortByTime ? '#6366f1' : theme.cardBg2, border: '1px solid ' + (durSortByTime ? '#6366f1' : theme.border), color: durSortByTime ? '#fff' : theme.textSecondary, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
          >
            {durSortByTime ? '↕ Tempo' : '↕ Fase'}
          </button>
        </div>
        {durationData.length === 0
          ? <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>Sem dados</div>
          : [...durationData]
              .sort((a, b) => durSortByTime ? (b.dias * 60 + b.horas) - (a.dias * 60 + a.horas) : 0)
              .map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #1a1f2e' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 11, color: d.lost ? '#fca5a5' : theme.textSecondary, lineHeight: 1.3 }}>{d.fullName}</div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.dias}d </span>
                    <span style={{ fontSize: 11, color: theme.textMuted }}>{d.horas}h</span>
                  </div>
                </div>
              ))
        }
      </div>
      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
        <SectionTitle>Tempos de Transição</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridAutoRows: '1fr', gap: 8, flex: 1 }}>
          {TRANSITIONS.map((t, i) => {
            if (t.label === null) return null
            const allHours = TRANSITIONS.filter(x => x.label && x.horas != null && !x.summary).map(x => x.horas)
            const max = allHours.length ? Math.max(...allHours) : 1
            const accent = t.summary ? '#f59e0b' : t.horas == null ? '#475569' : t.horas <= max * 0.33 ? '#22c55e' : t.horas <= max * 0.66 ? '#f59e0b' : '#ef4444'
            return (
              <div key={i} style={{ background: theme.cardBg2, borderRadius: 8, padding: '10px 12px', borderTop: `2px solid ${accent}` }}>
                <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 4, lineHeight: 1.3 }}>{t.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: accent, lineHeight: 1 }}>
                  {fmtHours(t.horas)}
                </div>
                {t.horas != null && !t.summary && (
                  <div style={{ marginTop: 6, height: 2, background: theme.cardBg, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max((t.horas / max) * 100, 4)}%`, background: accent, borderRadius: 2 }} />
                  </div>
                )}
                {t.summary && <div style={{ fontSize: 9, color: theme.textMuted, marginTop: 3 }}>jornada completa</div>}
              </div>
            )
          })}
        </div>
      </div>
      </div>

      {/* ── Tabela de negociações ── */}
      {(() => {
        const tableDeals = tablePhaseFilter === 'all' ? recentDeals : recentDeals.filter(r => r.phase === tablePhaseFilter)
        const allPhases = [...new Set(recentDeals.map(r => r.phase))].sort()
        return (
      <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Todas as Negociações ({tableDeals.length})</div>
          <select
            value={tablePhaseFilter}
            onChange={e => setTablePhaseFilter(e.target.value)}
            style={{ background: theme.cardBg2, border: `1px solid ${theme.border}`, color: theme.textPrimary, borderRadius: 8, padding: '6px 10px', fontSize: 12, outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">Todas as fases</option>
            {allPhases.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 322 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                {['Cliente', 'Fase Atual', 'Entrada no Pipe', 'Entrada na Fase', 'Dias', 'Créd. Consid.', 'Proposta', 'Deságio', 'Aceitou', 'Valor Final', 'Δ Proposta→Final'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', color: theme.textMuted, fontWeight: 600, textAlign: 'left', background: theme.cardBg, position: 'sticky', top: 0, zIndex: 2, borderBottom: '1px solid #2d3748', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableDeals.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1f2e', opacity: row.lost ? 0.7 : 1 }}>
                  <td style={{ padding: '7px 10px', color: row.lost ? theme.textSecondary : theme.textPrimary }}>{row.name}</td>
                  <td style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>
                    <span style={{ background: `${phaseColorMap[row.phase]}22`, color: phaseColorMap[row.phase], padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                      {row.phase}
                    </span>
                  </td>
                  <td style={{ padding: '7px 10px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{row.pipeDate}</td>
                  <td style={{ padding: '7px 10px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{row.date}</td>
                  <td style={{ padding: '7px 10px', color: row.diasNoPipe > 90 ? '#f59e0b' : row.diasNoPipe > 30 ? theme.textSecondary : theme.textMuted, fontWeight: row.diasNoPipe > 90 ? 600 : 400, whiteSpace: 'nowrap' }}>
                    {row.diasNoPipe}d
                  </td>
                  <td style={{ padding: '7px 10px', color: '#a5b4fc', whiteSpace: 'nowrap' }}>{row.credConsid ? fmt(row.credConsid) : '—'}</td>
                  <td style={{ padding: '7px 10px', color: '#818cf8', whiteSpace: 'nowrap' }}>{row.proposta ? fmt(row.proposta) : '—'}</td>
                  <td style={{ padding: '7px 10px', whiteSpace: 'nowrap', color: row.desagio == null ? '#475569' : row.desagio < 0 ? '#22c55e' : '#f59e0b', fontWeight: row.desagio != null ? 600 : 400 }}>
                    {row.desagio == null ? '—' : `${row.desagio >= 0 ? '+' : ''}${row.desagio.toFixed(1)}%`}
                  </td>
                  <td style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>
                    {row.aceitou == null ? <span style={{ color: '#475569' }}>—</span>
                      : row.aceitou === 'SIM' ? <span style={{ color: '#22c55e', fontWeight: 600 }}>SIM</span>
                      : row.aceitou === 'NAO' ? <span style={{ color: '#ef4444', fontWeight: 600 }}>NÃO</span>
                      : <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 11 }}>INSEGURO</span>}
                  </td>
                  <td style={{ padding: '7px 10px', color: '#34d399', whiteSpace: 'nowrap' }}>{row.final ? fmt(row.final) : '—'}</td>
                  <td style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>
                    {row.diffFinal == null ? <span style={{ color: '#475569' }}>—</span> : (
                      <span style={{ color: row.diffFinal.reais <= 0 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                        {row.diffFinal.reais >= 0 ? '+' : ''}{fmt(row.diffFinal.reais)} ({row.diffFinal.pct >= 0 ? '+' : ''}{row.diffFinal.pct.toFixed(1)}%)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        )
      })()}

      {/* ── Perdas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>

        <div style={{ background: theme.cardBg, borderRadius: 12, padding: 24 }}>
          <SectionTitle>Motivo de Perda</SectionTitle>
          {lostData.length === 0
            ? <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', paddingTop: 60 }}>Sem perdas</div>
            : (() => {
                const totalLost = lostData.reduce((s, d) => s + d.count, 0)
                const PIE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#dc2626']
                const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                  const RADIAN = Math.PI / 180
                  const r = innerRadius + (outerRadius - innerRadius) * 0.55
                  const x = cx + r * Math.cos(-midAngle * RADIAN)
                  const y = cy + r * Math.sin(-midAngle * RADIAN)
                  const pct = Math.round(lostData[index].count / totalLost * 100)
                  return pct >= 8 ? (
                    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
                      {pct}%
                    </text>
                  ) : null
                }
                return (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <ResponsiveContainer width="55%" height={200}>
                      <PieChart>
                        <Pie data={lostData} dataKey="count" nameKey="name" cx="50%" cy="50%"
                          outerRadius={88} labelLine={false} label={renderLabel}>
                          {lostData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={ttStyle} formatter={(v, name) => [`${v} (${Math.round(v / totalLost * 100)}%)`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {lostData.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                          <div style={{ flex: 1, fontSize: 11, color: theme.textSecondary, lineHeight: 1.3 }}>{d.name}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: PIE_COLORS[i % PIE_COLORS.length] }}>
                            {Math.round(d.count / totalLost * 100)}%
                          </div>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid #2d3748', marginTop: 4, paddingTop: 6, fontSize: 11, color: theme.textMuted }}>
                        Total: {totalLost} perdidos
                      </div>
                    </div>
                  </div>
                )
              })()
          }
        </div>
      </div>


      {/* ── Modal histórico de fases do card ── */}
      {cardHistory && (
      <div
        onClick={() => setCardHistory(null)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: '#1a1f2e', border: '1px solid #2d3748', borderRadius: 12, padding: 24, width: 480, maxHeight: '80vh', overflow: 'auto' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>{cardHistory.title}</div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>Histórico de fases no pipe Comercial</div>
            </div>
            <span onClick={() => setCardHistory(null)} style={{ color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</span>
          </div>
          {visibleEvents
            .filter(e => e.card_id === cardHistory.cardId)
            .sort((a, b) => (a.entered_at || '').localeCompare(b.entered_at || ''))
            .map((e, idx) => {
              const isActive = !e.exited_at
              const dias = e.duration_minutes ? Math.round(e.duration_minutes / 60 / 24) : null
              return (
                <div key={idx} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid #1e2a3a' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: isActive ? '#f59e0b' : '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: isActive ? '#f59e0b' : '#e2e8f0', fontSize: 12, fontWeight: 600 }}>{e.phase_name}{isActive ? ' ← atual' : ''}</div>
                    <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
                      Entrou: {e.entered_at?.slice(0, 10)}
                      {e.exited_at ? ` · Saiu: ${e.exited_at.slice(0, 10)}` : ''}
                      {dias != null ? ` · ${dias}d` : ''}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
      )}
    </div>
  )
}
