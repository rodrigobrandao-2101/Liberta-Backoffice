# Roadmap — Infraestrutura de Dados Liberta Precatório

> Objetivo: infraestrutura de dados confiável, auditável e escalável para suportar
> operações de cessão de crédito na casa de milhões de reais por mês.
>
> Iniciado em: 2026-03-11
> Última atualização: 2026-03-13
> Status geral: 🟡 Em progresso

---

## Princípios Técnicos Não Negociáveis

- **Eventos são imutáveis** — nunca UPDATE, só INSERT. O passado não muda.
- **Idempotência em tudo** — toda operação deve ser segura para executar N vezes.
- **Nunca deletar dados** — soft delete apenas (`is_deleted`, `archived_at`).
- **UTC no banco, UTC-3 no dashboard** — timezone consistente em toda a stack.
- **Fonte de verdade = Pipefy** — DB é espelho confiável, não fonte primária.
- **Falha deve ser visível** — nenhum erro silencioso. Tudo logado e alertado.

---

## Etapa 1 — Foundation: Schema Supabase

> Status: ✅ Concluído em 2026-03-12

### 1.1 Tabelas de eventos por pipe (append-only)
- [x] Criar `sdr_events`
- [x] Criar `comercial_events`
- [x] Criar `compliance_events`
- [x] Criar `juridico_events`
- [x] Criar `financeiro_events`
- [ ] Verificar `meta_ads_insights` — pendente (não crítico agora)

### 1.2 Schema de cada tabela
- [x] Colunas de identificação: `card_id`, `card_title`, `pipe_id`, `phase_name`, `phase_id`
- [x] Timestamps: `entered_at TIMESTAMPTZ`, `exited_at TIMESTAMPTZ`, `duration_minutes`
- [x] Campos financeiros por pipe — todos `NUMERIC(15,2)`
- [x] Campos qualitativos por pipe
- [x] Rastreabilidade: `source`, `event_id`, `last_synced_at`, `created_at`, `updated_at`
- [x] Soft delete: `is_deleted BOOLEAN DEFAULT false`, `archived_at TIMESTAMPTZ`
- [x] Flag de qualidade: `needs_review BOOLEAN DEFAULT false`, `review_reason TEXT`
- [x] Referência de correção: `supersedes_id BIGINT`
- [x] Migração 002: 3 fases novas + vários campos descobertos via varredura Pipefy

### 1.3 Constraints e índices
- [x] UNIQUE constraint `(card_id, phase_id, entered_at)` em todas as tabelas
- [x] Índices em `card_id`, `phase_name`, `entered_at`, `last_synced_at`
- [x] Índice parcial em `exited_at IS NULL`

### 1.4 Tabelas de suporte
- [x] `webhook_queue`, `webhook_errors` (DLQ), `field_history`, `sync_log`, `data_quality_alerts`

### 1.5 Segurança
- [x] Row Level Security (RLS) ativado em todas as 10 tabelas
- [x] Policies RLS: service_role (full) + anon (read-only nas tabelas de eventos)
- [ ] PITR (Point-in-Time Recovery) — requer plano pago ⚠️
- [ ] Confirmar backup automático diário — requer plano pago ⚠️

### 1.6 Campos adicionais — comercial_events (migração 2026-03-13)
- [x] `cliente_aceitou_proposta_inicial TEXT`
- [x] `ja_recebeu_proposta TEXT`
- [x] `conseguiu_negociar TEXT`
- [x] `motivo_inseguranca TEXT`
- [x] `rentabilidade_anual_esperada NUMERIC`
- [x] `rentabilidade_pos_renegociacao NUMERIC`
- [x] `valor_desejado_cliente NUMERIC`
- [x] `proposta_alterada TEXT`
- [x] `cliente_aceitou_proposta_corrigida TEXT`

### 1.7 Campos adicionais — sdr_events (migração 2026-03-13)
- [x] `telefone TEXT`, `analise_ia TEXT` adicionados ao schema
- [x] Mapeamento completo de todos os 14 campos do pipe SDR no workflow de carga e webhook

---

## Etapa 2 — Cargas Históricas por Pipe

> Status: ✅ Concluído em 2026-03-13

| Pipe | Workflow n8n | Eventos | Cards únicos |
|------|-------------|---------|-------------|
| SDR-COMERCIAL | `mTcLuNYgq6dEtgPC` | 441 | 145 (re-carga com todos os campos 2026-03-13) |
| COMERCIAL | `zf8LyWswrjExlyDT` | 169 | 19 |
| COMPLIANCE | `LAgCp2LtAg0IvSH9` | 50 | 10 |
| JURÍDICO | `xTecIuqufdg13I30` | 56 | 10 |
| FINANCEIRO | `iIfhMkdTlSWdzHen` | 3 | 1 |

**Correções aplicadas (2026-03-13):**
- Field IDs corrigidos: `rentabilidade_anual_esperada_p_s_negocia_o_inicial`, `qual_valor_desejado_pelo_cliente`
- Nomes de colunas corrigidos no transform_events
- Upsert alterado de `ignore-duplicates` para `merge-duplicates` para enriquecer dados existentes
- Carga rerodada após correções

**Pendente SDR (2026-03-13):**
- Workflow SDR atualizado com mapeamento completo (14 campos) + merge-duplicates
- Aguardando migração SQL (1.7) para rodar re-carga e popular `telefone`, `analise_ia` e demais campos históricos

---

## Etapa 3 — Webhook Tempo Real

> Status: ✅ Concluído em 2026-03-13
>
> Workflow: `GhxunpykVzXvdtiO` — ativo em `/webhook/pipefy-realtime`
> Testado ponta a ponta: SDR ✅ COMERCIAL ✅ is_test ✅ card.delete ✅

- [x] Endpoint POST `/webhook/pipefy-realtime`
- [x] Resposta imediata 200 ao Pipefy
- [x] Roteamento por `pipe_id` → tabela correta
- [x] Extração de campos por pipe (todos os 5 pipes)
- [x] SDR: todos os 14 campos mapeados incluindo `telefone` e `analise_ia`
- [x] Upsert idempotente: `ON CONFLICT (card_id, phase_id, entered_at) DO NOTHING`
- [x] Fechamento de fase anterior: atualiza `exited_at` + `duration_minutes`
- [x] `is_test` detectado via `card_title` e `nome_completo`
- [x] **Soft delete**: `card.delete` → `PATCH is_deleted=true, archived_at=now()` em todas as tabelas
- [x] DLQ: erro → inserir em `webhook_errors` com payload completo
- [x] 5 webhooks Pipefy apontando para este endpoint

**Pendente:**
- [ ] Verificar se webhooks Pipefy estão subscritos ao evento `card.delete` (além de `card.move`)

---

## Etapa 4 — Reconciliação

> Status: ✅ Concluído em 2026-03-13
>
> Workflow 15min: `ZlFm9LKiHiS0O4pI` — ativo
> Workflow Deep Sync: `LZYChaDplVz235Gf` — ativo, dispara 01h Brasília

- [x] Scheduled trigger: a cada 15 minutos, `America/Sao_Paulo`
- [x] Compara contagem de cards por fase Pipefy vs DB na janela de 2h
- [x] Re-sincroniza cards ausentes com `source: 'reconciliation'`
- [x] Reprocessa `webhook_errors` com `attempts < 3`
- [x] Resultado registrado no `sync_log`
- [x] **Deep Sync diário (01h Brasília)** — cards sem atualização há 48h+
  - Busca `exited_at IS NULL AND is_deleted = false AND last_synced_at < NOW() - 48h`
  - Card existe → upsert todas as fases + `last_synced_at = NOW()`
  - Card não encontrado → `is_deleted=true, archived_at=now()`
  - PERMISSION_DENIED → `needs_review=true` (não deleta)
  - Rate limit: 200ms entre requests Pipefy
- [ ] Testes formais (4.5): pausar webhook → mover card → aguardar 15min → confirmar

---

## Etapa 5 — Dashboard

> Status: 🟡 Funcional, refinamentos em andamento
>
> Stack: React 19 + Vite + Recharts + Supabase JS
> Projeto: `/Users/n8n-mcp/backoffice/apps/web/`

### Páginas
- [x] **SDR** — KPIs, funil qualificado/desqualificado, linha diária, breakdown, tabela de conferência backlog
- [x] **Comercial** — funil histórico com drill-down, KPIs financeiros, Apresentação analytics, Arremate analytics, tempo por fase, tabela de negociações, motivo de perda
- [x] **Compliance** — KPIs, distribuição por fase, taxa de inconsistência
- [x] **Jurídico** — KPIs, fases, comarca, timeline
- [x] **Financeiro** — KPIs, pagamentos por dia, tabela de eventos

### Funcionalidades transversais
- [x] `DateRangePicker` — calendário duplo, presets, sem datas futuras, posicionamento correto
- [x] Toggle `[teste]` — oculta/exibe cards de teste em todas as métricas
- [x] Filtro `is_deleted = false` em todas as queries — cards deletados somem do dash
- [x] **Funil drill-down** — clicar numa fase mostra todos os cards; verde = avançou, vermelho = não avançou
- [x] **Exclusão de card do funil** — botão × por card, persiste no localStorage
- [x] **Modal histórico** — botão ℹ mostra todas as fases do card ordenadas
- [x] Timezone UTC → UTC-3 (Brasília) na exibição de datas (`fmtDT`)
- [x] **Tabela SDR — Conferência Backlog Comercial** — lista qualificados com telefone, processo, data/hora e se chegou no backlog

### Pendente
- [ ] Badge "Atualizado há X min" no topo de cada página
- [ ] Deploy no Vercel
- [x] Tabela SDR: `telefone`, `nome_completo` e `numero_processo` populados após migração + re-carga histórica

---

## Etapa 6 — Qualidade e Auditoria

> Status: ⬜ Pendente

- [ ] Validação de regras de negócio (`valor_final ≤ valor_credito`, valores não negativos, etc.)
- [ ] Evento marcado `needs_review=true` se violar regra
- [ ] Resumo diário 08h no Slack: X cards movimentados, Y fechamentos, Z valor total
- [ ] Página de status no dashboard (último sync por pipe, erros pendentes)
- [ ] Badge de frescor nos dashboards (alerta se > 1h sem atualização)

---

## Etapa 7 — Segurança e Ambiente

> Status: ⬜ Pendente

- [ ] **⚠️ Revogar e gerar nova chave Anthropic** — foi exposta no histórico de chat
- [ ] Verificar se webhooks Pipefy validam HMAC secret
- [ ] Rotação de API keys em calendário de 90 dias
- [ ] Criar projeto Supabase separado para staging
- [ ] Completar `ARCHITECTURE.md`, `SCHEMA.md`, `RUNBOOK.md`

---

## Registro de Decisões Técnicas

| Data | Decisão | Motivo |
|---|---|---|
| 2026-03-11 | Tabelas separadas por pipe | Evitar contaminação cruzada |
| 2026-03-11 | Eventos imutáveis (append-only) | Auditoria e rastreabilidade financeira |
| 2026-03-11 | Webhook geral para todos os pipes | Dados ricos em tempo real sem automações por fase |
| 2026-03-11 | Reconciliação 15min + deep sync diário | Máximo 15min de defasagem em casos extremos |
| 2026-03-11 | UTC no banco, UTC-3 no dashboard | Consistência e evitar bugs de timezone |
| 2026-03-12 | RLS com service_role + anon | Dashboard interno sem multi-usuário |
| 2026-03-13 | Soft delete via webhook card.delete | Cards deletados no Pipefy somem do dashboard automaticamente |
| 2026-03-13 | Exclusões do funil no localStorage | Persistência sem mudança de schema — client-only |
| 2026-03-13 | UPSERT merge-duplicates na carga histórica | Enriquecer registros existentes com campos novos |
| 2026-03-13 | Mapeamento completo SDR (14 campos) | Tabela de conferência backlog precisa de nome, telefone, processo |

---

## Problemas Conhecidos e Resolvidos

| Data | Problema | Causa | Solução |
|---|---|---|---|
| 2026-03-11 | SDR: 142 → 68 cards | DELETE em massa + `first: 30` | Paginação completa, nunca deletar |
| 2026-03-11 | Valores financeiros errados | parseValue não tratava formato BR | Reescrever com split/join |
| 2026-03-11 | Upsert não atualizava valores | Sem UNIQUE constraint | Adicionar constraint |
| 2026-03-13 | Apresentação/Arremate mostrando 0 | Field IDs errados + INSERT ignore-duplicates | Corrigir IDs + mudar para merge-duplicates |
| 2026-03-13 | Cards deletados aparecendo no dash | Sem filtro is_deleted nas queries | Adicionar `.eq('is_deleted', false)` em todas as queries |
| 2026-03-13 | Modal fora do JSX root | Dois elementos irmãos no return sem Fragment | Mover modal para dentro do div raiz |
| 2026-03-13 | Datas no dash em UTC em vez de UTC-3 | `fmtDT` fatiava string ISO sem converter timezone | Subtrair 3h usando `Date.getTime()` |
| 2026-03-13 | SDR: nome_completo/telefone/processo vazios | Carga histórica mapeava só `valor_credito` | Atualizar workflow com 14 campos + re-carga merge-duplicates |
