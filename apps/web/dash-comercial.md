# Dashboard Comercial — Mapa Completo

**Arquivo:** `src/pages/Comercial.jsx`
**Stack:** React 19 + Vite + Recharts + Supabase JS
**Modo atual:** `USE_MOCK = true` (55 cards simulados, 90 dias)

---

## Mapa Visual da Página

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER                                                             │
│  "Comercial — Negociação e propostas — pipe COMERCIAL"  [DateRange] │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────── TOPO DE FUNIL: SDR → COMERCIAL ──────────────────────┐
│  [Leads Qualificados SDR]  [Chegaram no Backlog]  [Taxa Qualif.→Backlog]     │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────── KPIs ROW 1 — VOLUME DE CARDS ─────────────────────┐
│  [Total de Negociações]  [Em Andamento]  [Stand By]  [Perdidos]  [Fechados]  │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────── KPIs ROW 2 — VOLUME FINANCEIRO ───────────────────┐
│  [Vol. Crédito] [Créd. Considerado] [Vol. Propostas] [Arrematadas] [Compra] │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────── BANNER: CONVERSÃO DE VOLUME (4 etapas inline) ─────────────────┐
│  Crédito → Considerado  │  Considerado → Propostas  │  Propostas → Arremates│
│  Arremates → Concluídas                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────── CARD: APRESENTAÇÃO — PROPOSTA INICIAL ───────────────────┐
│  Col 1: Decisão do Cliente    │ Col 2: Renegociação  │ Col 3: Rentabilidade  │
│  - SIM / NÃO / INSEGURO       │ - Negociou / N.neg.  │ - % anual esperada    │
│  - Já recebeu outra proposta? │ - Desconto médio     │ - % pós-renegociação  │
│                               │ - Motivo insegurança │ - Desejado vs Proposta│
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────── CARD: ARREMATE COMERCIAL ───────────────────────────┐
│  Col 1: Proposta Alterada?    │ Col 2: Variação Prop→Final │ Col 3: Vl Final │
│  - Sim/Não + %                │ - Δ médio %                │ - Média deals   │
│  - Aceitou a corrigida?       │ - Com redução/aumento      │ - Base vs Final │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────── GRID 2×2 FUNIS ─────────────────────────────────┐
│  Funil Histórico (cards que      │  Funil por Fase Atual                    │
│  já passaram por cada fase)      │  (cards atualmente em cada fase)         │
├──────────────────────────────────┼──────────────────────────────────────────┤
│  Tempo Médio por Fase            │  Tempos de Transição entre fases         │
│  (barra horizontal, toggle sort) │  (grid 2×2 com dias entre A→B)          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────── TABELA DE NEGOCIAÇÕES ──────────────────────────────┐
│  [dropdown: filtro por fase]                                                │
│  Cliente│Fase│Entrada Pipe│Entrada Fase│Dias│Créd.Consid│Proposta│Deságio  │
│         │    │            │            │    │           │        │Aceitou  │
│         │    │            │            │    │           │        │Vl.Final │
│         │    │            │            │    │           │        │ΔProp→Fin│
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────── MOTIVO DE PERDA ────────────────────────────────────┐
│  [Pizza chart] + legenda com % por motivo (1/3 da largura)                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Queries Supabase (produção)

As duas queries rodam em paralelo (`Promise.all`). Todo o processamento (KPIs, funis, médias, tabela) é feito em JavaScript no cliente com os dados brutos.

```js
// Query 1 — Pipe COMERCIAL (todos os eventos)
supabase
  .from('pipeline_events')
  .select('*')
  .eq('pipe_name', 'COMERCIAL')
  .gte('entered_at', dateRange[0] || '2000-01-01')
  .lte('entered_at', (dateRange[1] || '2099-12-31') + 'T23:59:59')
  .order('entered_at', { ascending: true })
  .limit(10000)

// Query 2 — SDR Qualificados (só card_id)
supabase
  .from('pipeline_events')
  .select('card_id')
  .eq('pipe_name', 'SDR-COMERCIAL')
  .eq('phase_name', 'QUALIFICADO')
  .gte('entered_at', dateRange[0] || '2000-01-01')
  .lte('entered_at', (dateRange[1] || '2099-12-31') + 'T23:59:59')
  .limit(10000)
```

---

## Detalhamento por Seção

---

### 1. Topo de Funil — SDR → Comercial

| KPI | Cálculo | Dado de origem |
|-----|---------|----------------|
| Leads Qualificados (SDR) | `COUNT(DISTINCT card_id)` onde pipe=SDR e fase=QUALIFICADO | `pipeline_events`, pipe `SDR-COMERCIAL` |
| Chegaram no Backlog | `COUNT(DISTINCT card_id)` com fase=`BACKLOG - COMERCIAL` | `pipeline_events`, pipe `COMERCIAL` |
| Taxa Qualif.→Backlog | `backlog / SDR_qualificados × 100` | Calculado a partir dos dois acima |

---

### 2. KPIs Row 1 — Volume de Cards

Todos partem do **último evento por card** (`latestEvent` = evento com maior `entered_at` por `card_id`).

| KPI | Cálculo |
|-----|---------|
| Total de Negociações | `COUNT(DISTINCT card_id)` no pipe COMERCIAL |
| Em Andamento | `total − fechados − perdidos − standBy` |
| Cliente - Stand By | cards com fase atual = `CLIENTE - STAND BY` |
| Perdidos | cards com fase atual ∈ `LOST_PHASES` (4 fases de PERDIDO) |
| Taxa Perdidos | `perdidos / total × 100` — verde ≤15%, amarelo ≤30%, vermelho >30% |
| Fechados | cards com fase atual = `ANEXADO NOS AUTOS` |
| Taxa Fechamento | `fechados / total × 100` |

**Fases ativas (`ACTIVE_PHASES`):**
- BACKLOG - COMERCIAL
- CLIENTE - STAND BY
- FORMULAÇÃO - PROPOSTA INICIAL
- APRESENTAÇÃO - PROPOSTA INICIAL
- AGUARDANDO DOCUMENTAÇÃO
- ENVIADO PARA COMPLIANCE - DUE
- ANÁLISE JURÍDICA CONCLUÍDA
- ARREMATE COMERCIAL
- CONTRATO ENVIADO PARA ASSINATURA
- CARTÓRIO EM AGENDAMENTO
- AGUARDANDO PARA ANEXO NOS AUTOS
- ANEXADO NOS AUTOS

**Fases de perda (`LOST_PHASES`):**
- PERDIDO - PROPOSTA INICIAL NEGADA
- PERDIDO - BARREIRA JURÍDICA
- PERDIDO - PROPOSTA CORRIGIDA NEGADA
- PERDIDO - DUE INCONSISTENTE

---

### 3. KPIs Row 2 — Volume Financeiro

Todos usam **max por card** (evita duplicar quando um card tem múltiplos eventos com o mesmo campo).

| KPI (cor) | Campo no evento | Cálculo |
|-----------|----------------|---------|
| Volume de Crédito (roxo) | `valor_credito` | `SUM(max(valor_credito) por card)` — todos os cards |
| Crédito Considerado (azul) | `valor_credito` | `SUM(max(valor_credito))` apenas dos cards que têm `valor_proposta_cliente` (chegaram à Formulação) |
| Volume de Propostas (índigo) | `valor_proposta_cliente` | `SUM(max(valor_proposta_cliente) por card)` |
| Propostas Arrematadas (amarelo) | `valor_final_proposta` | `SUM(max(valor_final_proposta) por card)` — todos que chegaram ao Arremate |
| Compra Efetiva (verde) | `valor_final_proposta` | `SUM(valor_final_proposta)` apenas dos cards com fase atual = `ANEXADO NOS AUTOS` |

Cada card também mostra: `n° deals` e `valor médio / deal`.

---

### 4. Conversão de Volume

Banner com 4 etapas sequenciais mostrando `%`, mini barra e `R$ from → R$ to`.

| Etapa | Fórmula |
|-------|---------|
| Crédito → Considerado | `volCreditoConsiderado / volCredito × 100` |
| Considerado → Propostas | `volProposta / volCreditoConsiderado × 100` |
| Propostas → Arremates | `volFechado / volProposta × 100` |
| Arremates → Concluídas | `volFinalFechados / volFechado × 100` |

---

### 5. Apresentação — Proposta Inicial

Fonte: eventos com `phase_name = 'APRESENTAÇÃO - PROPOSTA INICIAL'`, **1 por card** (último `entered_at`).

**Coluna 1 — Decisão do Cliente**

| Métrica | Campo | Cálculo |
|---------|-------|---------|
| Aceitou | `cliente_aceitou_proposta_inicial = 'SIM'` | count + % de nApresent |
| Recusou | `= 'NAO'` | count + % |
| Inseguro | `contains 'INSEGURO'` | count + % |
| Já recebeu outra proposta? | `ja_recebeu_proposta` | count Sim / Não |

**Coluna 2 — Renegociação** (só dos inseguros)

| Métrica | Campo | Cálculo |
|---------|-------|---------|
| Negociou | `conseguiu_negociar = true` | count + % de inseguros |
| Não negociou | `conseguiu_negociar = false` | count + % |
| Desconto médio | `(valor_proposta_cliente − valor_renegociado) / valor_proposta_cliente × 100` | média dos que negociaram |
| Motivo da insegurança | `motivo_inseguranca` | top 4 por frequência |

**Coluna 3 — Rentabilidade**

| Métrica | Campo | Cálculo |
|---------|-------|---------|
| Rentabilidade esperada | `rentabilidade_anual_esperada` | média de todos com valor |
| Pós-renegociação | `rentabilidade_pos_renegociacao` | média dos que têm |
| Desejado pelo cliente | `valor_desejado_cliente` | média |
| Proposta apresentada | `valor_proposta_cliente` | média |
| Diferença | `(proposta_média / desejado_médio − 1) × 100` | calculado |

---

### 6. Arremate Comercial

Fonte: eventos com `phase_name = 'ARREMATE COMERCIAL'`, 1 por card (último `entered_at`).

**Coluna 1 — Proposta Alterada**

| Métrica | Campo | Cálculo |
|---------|-------|---------|
| Sim, foi alterada | `proposta_alterada = true` | count + % de nArremate |
| Não foi alterada | `proposta_alterada = false` | count + % |
| Aceitou a corrigida | `cliente_aceitou_proposta_corrigida = true` | count + % dos alterados |
| Recusou a corrigida | `= false` | count + % dos alterados |

**Coluna 2 — Variação Proposta → Final**

Base de cálculo: se tem `valor_renegociado`, usa como base; senão usa `valor_proposta_cliente`.

| Métrica | Cálculo |
|---------|---------|
| Variação média | `média de (valor_final − base) / base × 100` |
| Com redução | cards onde delta < -0.5% |
| Com aumento | cards onde delta > +0.5% |
| Sem variação | restantes |
| Cards com renegociado como base | count |

**Coluna 3 — Valor Final**

| Métrica | Campo | Cálculo |
|---------|-------|---------|
| Média dos deals | `valor_final_proposta` | média de todos com valor |
| Proposta base (média) | base calculada acima | média |
| Variação final vs base | `(avgFinal / avgBase − 1) × 100` | calculado |

---

### 7. Funil Histórico (grid 2×2, esquerda cima)

13 etapas, da qualificação no SDR até Anexado nos Autos.

**Dado:** `COUNT(DISTINCT card_id)` que **já passou** por cada fase (throughput acumulado, não fase atual).

A % entre etapas = `count[i] / count[i-1] × 100`. Verde ≥70%, amarelo ≥40%, vermelho <40%.

| Etapa | Fase |
|-------|------|
| 1 | Leads Qualificados (SDR) |
| 2 | Backlog Comercial |
| 3 | Cliente - Stand By |
| 4 | Formulação - Proposta |
| 5 | Apresentação - Proposta |
| 6 | Aguardando Documentação |
| 7 | Compliance - DUE |
| 8 | Análise Jurídica |
| 9 | Arremate Comercial |
| 10 | Contrato Assinatura |
| 11 | Cartório |
| 12 | Aguardando Anexo |
| 13 | Anexado nos Autos |

---

### 8. Funil por Fase Atual (grid 2×2, direita cima)

Mesmas fases, mas usando **fase atual** de cada card (`latestEvent`).

Inclui divisor visual "PERDIDOS" separando fases ativas das fases de perda. Barra horizontal proporcional ao máximo entre todas as fases.

---

### 9. Tempo Médio por Fase (grid 2×2, esquerda baixo)

| Dado | Campo | Cálculo |
|------|-------|---------|
| Tempo médio em cada fase | `duration_minutes` | média por fase → converte para dias + horas |

Toggle "↕ Fase / ↕ Tempo" ordena por posição no pipeline ou por duração decrescente.
Fases de perda aparecem em vermelho claro.

---

### 10. Tempos de Transição (grid 2×2, direita baixo)

6 transições específicas + 2 sumários:

| Transição | Tipo |
|-----------|------|
| Backlog → Formulação | normal |
| Formulação → Apresentação | normal |
| Apresentação → Análise Jurídica | normal |
| Análise Jurídica → Arremate | normal |
| Arremate → Aguardando Anexo | normal |
| Aguardando Anexo → Anexado | normal |
| Backlog → Anexado (total) | sumário (jornada completa) |
| Apresentação → Anexado | sumário (jornada completa) |

**Cálculo:** para cada card que passou pelas duas fases, `entered_at[destino] − entered_at[origem]` em dias. Média de todos.

**Cor:** verde ≤33% do máximo, amarelo ≤66%, vermelho >66%. Sumários sempre em amarelo.

---

### 11. Tabela de Negociações

Top 50 cards ordenados por `entered_at` mais recente (fase atual). Dropdown filtra por fase. Scroll horizontal e vertical interno (maxHeight 322px).

| Coluna | Origem | Observação |
|--------|--------|------------|
| Cliente | `card_title` | — |
| Fase Atual | fase do `latestEvent` | badge colorido por fase |
| Entrada no Pipe | `min(entered_at)` do card | — |
| Entrada na Fase | `entered_at` do `latestEvent` | — |
| Dias no Pipe | `(hoje − entrada_no_pipe) / 86400` | amarelo >90d, cinza médio >30d |
| Créd. Consid. | `creditConsiderado[card_id]` | apenas se chegou à Formulação |
| Proposta | `max(valor_proposta_cliente)` | — |
| Deságio | `(proposta / crédito_consid − 1) × 100` | verde se negativo (proposta < crédito) |
| Aceitou | `cliente_aceitou_proposta_inicial` | do evento de Apresentação |
| Valor Final | `max(valor_final_proposta)` | — |
| Δ Proposta→Final | `(valor_final − proposta)` em R$ e % | verde se redução (comprou barato) |

---

### 12. Motivo de Perda

Fonte: `latestEvent` dos cards em fases `LOST_PHASES`.

| Categoria | Fase |
|-----------|------|
| PROPOSTA INICIAL NEGADA | PERDIDO - PROPOSTA INICIAL NEGADA |
| BARREIRA JURÍDICA | PERDIDO - BARREIRA JURÍDICA |
| PROPOSTA CORRIGIDA NEGADA | PERDIDO - PROPOSTA CORRIGIDA NEGADA |
| DUE INCONSISTENTE | PERDIDO - DUE INCONSISTENTE |

Pizza chart com % internos (oculto se <8%) + legenda lateral com % e total de perdidos.

---

## Campos do Banco de Dados Utilizados

Tabela: `pipeline_events`

| Campo | Tipo | Usado em |
|-------|------|---------|
| `card_id` | string | chave de agrupamento em toda a página |
| `card_title` | string | nome do cliente na tabela |
| `pipe_name` | string | filtro principal (`COMERCIAL` / `SDR-COMERCIAL`) |
| `phase_name` | string | fase atual, funis, filtros |
| `entered_at` | ISO timestamp | latestEvent, firstEntry, ordenação |
| `exited_at` | ISO timestamp | referência (não usado diretamente no front) |
| `duration_minutes` | number | Tempo Médio por Fase |
| `valor_credito` | number | Volume de Crédito, Crédito Considerado |
| `valor_proposta_cliente` | number | Volume de Propostas, Apresentação col 3 |
| `valor_final_proposta` | number | Arremate, Compra Efetiva |
| `valor_renegociado` | number | Arremate col 2, Apresentação col 2 |
| `cliente_aceitou_proposta_inicial` | string | Apresentação col 1, tabela |
| `ja_recebeu_proposta` | boolean | Apresentação col 1 |
| `conseguiu_negociar` | boolean | Apresentação col 2 |
| `motivo_inseguranca` | string | Apresentação col 2 |
| `rentabilidade_anual_esperada` | number | Apresentação col 3 |
| `rentabilidade_pos_renegociacao` | number | Apresentação col 3 |
| `valor_desejado_cliente` | number | Apresentação col 3 |
| `proposta_alterada` | boolean | Arremate col 1 |
| `cliente_aceitou_proposta_corrigida` | boolean | Arremate col 1 |

---

## Dados do Mock (USE_MOCK = true)

- 55 cards gerados aleatoriamente
- Janela de 90 dias a partir de hoje
- Valores de crédito: R$80k – R$500k
- Valor proposta: 68%–80% do crédito
- Valor final: 95%–103% da proposta
- ~18% fechados, ~30% early-stage, resto mid/advanced
- ~30% de probabilidade de perda (exceto fechados)
- Campos da fase APRESENTAÇÃO (p=3): `cliente_aceitou`, `rentabilidade`, `ja_recebeu`, `valor_desejado`, renegociação
- Campos da fase ARREMATE (p=7): `proposta_alterada`, `cliente_aceitou_corrigida`, `valor_renegociado`
- SDR mock = `COUNT(cards no Backlog) × 2.5`
