import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../ThemeContext.jsx'

const API_BASE = (import.meta.env.VITE_TETO_RPV_API_URL || 'http://localhost:8001') + '/api/v1'

const LEVEL_LABELS = { federal: 'Federal', state: 'Estado', municipal: 'Município' }

function formatBRL(value) {
  if (value == null) return '—'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(d) {
  if (!d) return 'atual'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

function confidenceBadge(confidence) {
  const map = { verified: '✅ Verificado', ai_sourced: '🤖 Pesquisado por IA', unknown: '❓ Não verificado' }
  return map[confidence] || confidence
}

function parseBRL(text) {
  const cleaned = text.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const val = parseFloat(cleaned)
  return isNaN(val) ? null : val
}

// ── Consulta Tab ──────────────────────────────────────────────────────────────

function ConsultaTab({ theme }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [creditoInput, setCreditoInput] = useState('')
  const [classificacao, setClassificacao] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`${API_BASE}/jurisdictions?q=${encodeURIComponent(query)}&limit=5`)
        if (r.ok) setSuggestions(await r.json())
      } catch { setSuggestions([]) }
    }, 300)
  }, [query])

  async function doSearch(q) {
    if (!q.trim()) return
    setLoading(true); setResult(null); setError(null); setClassificacao(null)
    setSuggestions([])
    try {
      const r = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`)
      const data = await r.json()
      if (data.status === 'researching') {
        setLoading(false)
        setPolling(true)
        await pollJob(data.job_id, q)
        return
      }
      setResult(data)
    } catch (e) {
      setError('Não foi possível conectar à API. Verifique se o backend está rodando.')
    } finally { setLoading(false) }
  }

  async function pollJob(jobId) {
    for (let i = 0; i < 60; i++) {
      await new Promise(res => setTimeout(res, 2000))
      try {
        const r = await fetch(`${API_BASE}/research-status/${jobId}`)
        const data = await r.json()
        if (data.status === 'completed') { setResult({ status: 'found', ...data }); setPolling(false); return }
        if (data.status === 'failed') { setError(`Pesquisa falhou: ${data.error || 'erro desconhecido'}`); setPolling(false); return }
      } catch { }
    }
    setError('Tempo limite excedido. Tente novamente.'); setPolling(false)
  }

  function calcular() {
    const vigente = result?.ceilings?.find(c => !c.valid_until)
    if (!vigente?.brl_equivalent) return
    const valor = parseBRL(creditoInput)
    if (!valor || valor <= 0) return
    const teto = vigente.brl_equivalent
    setClassificacao({ valor, teto, isRPV: valor <= teto, vigente })
  }

  const s = { card: { background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: 20, marginBottom: 16 } }

  return (
    <div>
      {/* Search */}
      <div style={s.card}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 12 }}>Consultar jurisdição</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch(query)}
            placeholder="Município, estado ou 'Federal'..."
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.cardBorder}`, background: theme.inputBg || theme.pageBg, color: theme.textPrimary, fontSize: 13, outline: 'none' }}
          />
          <button
            onClick={() => doSearch(query)}
            disabled={loading || polling}
            style={{ padding: '8px 20px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            {loading ? 'Buscando...' : 'Consultar'}
          </button>
        </div>

        {/* Autocomplete */}
        {suggestions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {suggestions.map(s => (
              <button key={s.id} onClick={() => { setQuery(s.name); doSearch(s.name) }}
                style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${theme.cardBorder}`, background: theme.navActive, color: theme.textSecondary, fontSize: 12, cursor: 'pointer' }}>
                {s.name}{s.uf ? ` (${s.uf})` : ''} · {LEVEL_LABELS[s.level] || s.level}
              </button>
            ))}
          </div>
        )}

        {polling && (
          <div style={{ marginTop: 12, fontSize: 13, color: theme.textMuted }}>
            🔍 Pesquisando legislação via IA... isso pode levar até 60 segundos.
          </div>
        )}
      </div>

      {error && (
        <div style={{ ...s.card, borderColor: '#ef4444', color: '#ef4444', fontSize: 13 }}>{error}</div>
      )}

      {/* Results */}
      {result && (
        <>
          {result.status === 'found' && (
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>
                    {result.jurisdiction.name}{result.jurisdiction.uf ? ` (${result.jurisdiction.uf})` : ''}
                  </div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                    {LEVEL_LABELS[result.jurisdiction.level]} · {confidenceBadge(result.jurisdiction.data_confidence)}
                  </div>
                </div>
              </div>

              {/* Teto vigente destacado */}
              {result.ceilings?.find(c => !c.valid_until) && (() => {
                const v = result.ceilings.find(c => !c.valid_until)
                return (
                  <div style={{ background: theme.navActive, borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 4 }}>TETO VIGENTE</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#6366f1' }}>{formatBRL(v.brl_equivalent)}</div>
                    <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>{v.ceiling_description}</div>
                    <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>
                      {v.legislation_name} · vigente desde {formatDate(v.valid_from)}
                      {v.legislation_url && <> · <a href={v.legislation_url} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>ver lei ↗</a></>}
                    </div>
                  </div>
                )
              })()}

              {/* Histórico de tetos */}
              {result.ceilings?.length > 1 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 8 }}>HISTÓRICO</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${theme.cardBorder}` }}>
                          {['Vigência', 'Teto', 'Equivalente R$', 'Legislação', 'Confiança'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: theme.textMuted, fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.ceilings.map((c, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${theme.cardBorder}` }}>
                            <td style={{ padding: '6px 8px', color: theme.textSecondary }}>{formatDate(c.valid_from)} → {formatDate(c.valid_until)}</td>
                            <td style={{ padding: '6px 8px', color: theme.textSecondary }}>{c.ceiling_description}</td>
                            <td style={{ padding: '6px 8px', color: theme.textSecondary }}>{formatBRL(c.brl_equivalent)}</td>
                            <td style={{ padding: '6px 8px', color: theme.textSecondary }}>
                              {c.legislation_url
                                ? <a href={c.legislation_url} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>{c.legislation_name} ↗</a>
                                : c.legislation_name}
                            </td>
                            <td style={{ padding: '6px 8px', color: theme.textMuted }}>{confidenceBadge(c.confidence)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {result.status === 'ambiguous' && (
            <div style={s.card}>
              <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 12 }}>
                Encontramos {result.candidates?.length} jurisdições. Selecione uma:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.candidates?.map(c => (
                  <button key={c.id} onClick={() => { setQuery(c.name); doSearch(c.name) }}
                    style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${theme.cardBorder}`, background: theme.navActive, color: theme.textSecondary, fontSize: 13, cursor: 'pointer' }}>
                    {c.name}{c.uf ? ` (${c.uf})` : ''} — {LEVEL_LABELS[c.level] || c.level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result.status === 'not_found' && (
            <div style={{ ...s.card, color: theme.textMuted, fontSize: 13 }}>
              Jurisdição não encontrada. Verifique o nome e tente novamente.
            </div>
          )}

          {/* Calculadora de enquadramento */}
          {result.status === 'found' && result.ceilings?.find(c => !c.valid_until)?.brl_equivalent && (
            <div style={s.card}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 12 }}>
                Calcular enquadramento — {result.jurisdiction.name}
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  value={creditoInput}
                  onChange={e => { setCreditoInput(e.target.value); setClassificacao(null) }}
                  onKeyDown={e => e.key === 'Enter' && calcular()}
                  placeholder="Ex: 85.000,00"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.cardBorder}`, background: theme.inputBg || theme.pageBg, color: theme.textPrimary, fontSize: 13, outline: 'none' }}
                />
                <button onClick={calcular}
                  style={{ padding: '8px 16px', borderRadius: 8, background: theme.navActive, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}`, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Calcular
                </button>
              </div>

              {classificacao && (
                <div style={{ borderRadius: 8, padding: 16, background: classificacao.isRPV ? '#16a34a22' : '#ef444422', border: `1px solid ${classificacao.isRPV ? '#16a34a' : '#ef4444'}` }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: classificacao.isRPV ? '#16a34a' : '#ef4444', marginBottom: 8 }}>
                    {classificacao.isRPV ? '✅ RPV — Requisição de Pequeno Valor' : '❌ PRECATÓRIO — Supera o teto de RPV'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Valor do crédito', value: formatBRL(classificacao.valor) },
                      { label: 'Teto RPV vigente', value: formatBRL(classificacao.teto) },
                      { label: 'Diferença', value: formatBRL(Math.abs(classificacao.teto - classificacao.valor)) },
                    ].map(m => (
                      <div key={m.label} style={{ background: theme.cardBg, borderRadius: 6, padding: '8px 12px' }}>
                        <div style={{ fontSize: 11, color: theme.textMuted }}>{m.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary, marginTop: 2 }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Dashboard Tab ─────────────────────────────────────────────────────────────

function DashboardTab({ theme }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [triggering, setTriggering] = useState(false)
  const [triggerResult, setTriggerResult] = useState(null)

  async function loadStats() {
    setLoading(true); setError(null)
    try {
      const r = await fetch(`${API_BASE}/admin/stats`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setStats(await r.json())
    } catch (e) { setError('Não foi possível conectar à API.') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadStats() }, [])

  async function triggerStateResearch() {
    setTriggering(true); setTriggerResult(null)
    try {
      const r = await fetch(`${API_BASE}/admin/trigger-state-research`, { method: 'POST' })
      setTriggerResult(await r.json())
    } catch { setTriggerResult({ error: 'Erro ao disparar pesquisa.' }) }
    finally { setTriggering(false) }
  }

  const s = { card: { background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: 20, marginBottom: 16 } }
  const kpiStyle = { background: theme.navActive, borderRadius: 8, padding: '12px 16px', textAlign: 'center' }

  if (loading) return <div style={{ color: theme.textMuted, fontSize: 13, padding: 20 }}>Carregando...</div>
  if (error) return <div style={{ color: '#ef4444', fontSize: 13, padding: 20 }}>{error}</div>
  if (!stats) return null

  return (
    <div>
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>Métricas de uso</div>
          <button onClick={loadStats} style={{ fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>↻ Atualizar</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Total pesquisas', value: stats.total_searches },
            { label: 'Concluídas', value: stats.completed },
            { label: 'Falhas', value: stats.failed },
            { label: 'Jurisdições com dados', value: stats.jurisdictions_researched },
          ].map(m => (
            <div key={m.label} style={kpiStyle}>
              <div style={{ fontSize: 11, color: theme.textMuted }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: theme.textPrimary, marginTop: 4 }}>{m.value ?? '—'}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Tokens consumidos', value: stats.total_tokens?.toLocaleString('pt-BR') },
            { label: 'Custo total estimado', value: `US$ ${(stats.total_cost_usd || 0).toFixed(4)}` },
          ].map(m => (
            <div key={m.label} style={kpiStyle}>
              <div style={{ fontSize: 11, color: theme.textMuted }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, marginTop: 4 }}>{m.value ?? '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pesquisa em massa */}
      <div style={s.card}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 8 }}>Pesquisa em massa — estados</div>
        <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 12 }}>
          Dispara pesquisa via IA para todos os estados sem dados. ~$0.003 por estado.
        </div>
        <button onClick={triggerStateResearch} disabled={triggering}
          style={{ padding: '8px 16px', borderRadius: 8, background: theme.navActive, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}`, cursor: 'pointer', fontSize: 13 }}>
          {triggering ? 'Disparando...' : 'Pesquisar todos os estados'}
        </button>
        {triggerResult && (
          <div style={{ marginTop: 12, fontSize: 13, color: theme.textSecondary }}>
            {triggerResult.error
              ? <span style={{ color: '#ef4444' }}>{triggerResult.error}</span>
              : `${triggerResult.triggered} pesquisas disparadas · ${triggerResult.skipped} já tinham dados`}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Histórico Tab ─────────────────────────────────────────────────────────────

function HistoricoTab({ theme }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/admin/history`)
      .then(r => r.json())
      .then(setItems)
      .catch(() => setError('Não foi possível conectar à API.'))
      .finally(() => setLoading(false))
  }, [])

  const s = { card: { background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: 20 } }

  if (loading) return <div style={{ color: theme.textMuted, fontSize: 13, padding: 20 }}>Carregando...</div>
  if (error) return <div style={{ color: '#ef4444', fontSize: 13, padding: 20 }}>{error}</div>

  return (
    <div style={s.card}>
      <div style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 16 }}>
        Jurisdições pesquisadas ({items.length})
      </div>
      {items.length === 0
        ? <div style={{ fontSize: 13, color: theme.textMuted }}>Nenhuma jurisdição pesquisada ainda.</div>
        : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.cardBorder}` }}>
                  {['Jurisdição', 'UF', 'Nível', 'Teto Vigente', 'Equivalente R$', 'Legislação', 'Confiança', 'Última Pesquisa'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: theme.textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${theme.cardBorder}` }}>
                    <td style={{ padding: '6px 8px', color: theme.textPrimary, fontWeight: 500 }}>{item.jurisdiction_name}</td>
                    <td style={{ padding: '6px 8px', color: theme.textSecondary }}>{item.uf || '—'}</td>
                    <td style={{ padding: '6px 8px', color: theme.textSecondary }}>{LEVEL_LABELS[item.level] || item.level}</td>
                    <td style={{ padding: '6px 8px', color: theme.textSecondary }}>{item.teto_vigente || '—'}</td>
                    <td style={{ padding: '6px 8px', color: theme.textSecondary }}>{formatBRL(item.valor_brl)}</td>
                    <td style={{ padding: '6px 8px', color: theme.textSecondary }}>
                      {item.legislation_url
                        ? <a href={item.legislation_url} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>{item.legislation_name} ↗</a>
                        : item.legislation_name || '—'}
                    </td>
                    <td style={{ padding: '6px 8px', color: theme.textMuted }}>{confidenceBadge(item.confidence)}</td>
                    <td style={{ padding: '6px 8px', color: theme.textMuted, whiteSpace: 'nowrap' }}>
                      {item.last_researched ? new Date(item.last_researched).toLocaleString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TetoRPV() {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('consulta')

  const tabs = [
    { id: 'consulta', label: 'Consulta' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'historico', label: 'Histórico' },
  ]

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: theme.textPrimary }}>Teto RPV</div>
        <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 4 }}>
          Consulta de tetos de Requisição de Pequeno Valor por jurisdição
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${theme.cardBorder}`, marginBottom: 24 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 20px', fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? '#6366f1' : theme.textMuted,
              background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -1, transition: 'all 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'consulta' && <ConsultaTab theme={theme} />}
      {activeTab === 'dashboard' && <DashboardTab theme={theme} />}
      {activeTab === 'historico' && <HistoricoTab theme={theme} />}
    </div>
  )
}
