-- ============================================================
-- MIGRAÇÃO 001 — Tabelas por pipe + suporte
-- Projeto: Liberta Precatório Backoffice
-- Data: 2026-03-11
-- ============================================================

-- ============================================================
-- TABELA: sdr_events
-- Pipe: SDR-COMERCIAL (306972940)
-- Fases: NÃO IDENTIFICADO | QUALIFICADO | DESQUALIFICADO
-- ============================================================
CREATE TABLE IF NOT EXISTS sdr_events (
  id                    BIGSERIAL PRIMARY KEY,
  card_id               TEXT        NOT NULL,
  card_title            TEXT,
  pipe_id               TEXT        NOT NULL DEFAULT '306972940',
  phase_name            TEXT        NOT NULL,
  phase_id              TEXT,
  entered_at            TIMESTAMPTZ,
  exited_at             TIMESTAMPTZ,
  duration_minutes      NUMERIC(10,2),
  -- Rastreabilidade
  source                TEXT        NOT NULL DEFAULT 'historical'
                          CHECK (source IN ('automation','webhook','historical','manual','correction')),
  event_id              TEXT,           -- SHA256 idempotência
  last_synced_at        TIMESTAMPTZ DEFAULT NOW(),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  -- Soft delete
  is_deleted            BOOLEAN     DEFAULT false,
  archived_at           TIMESTAMPTZ,
  -- Qualidade
  needs_review          BOOLEAN     DEFAULT false,
  review_reason         TEXT,
  -- Referência de correção
  supersedes_id         BIGINT      REFERENCES sdr_events(id),

  -- UNIQUE para idempotência
  CONSTRAINT sdr_events_unique UNIQUE (card_id, phase_id, entered_at)
);

CREATE INDEX IF NOT EXISTS sdr_events_card_id_idx    ON sdr_events (card_id);
CREATE INDEX IF NOT EXISTS sdr_events_phase_name_idx ON sdr_events (phase_name);
CREATE INDEX IF NOT EXISTS sdr_events_entered_at_idx ON sdr_events (entered_at);
CREATE INDEX IF NOT EXISTS sdr_events_synced_idx     ON sdr_events (last_synced_at);
CREATE INDEX IF NOT EXISTS sdr_events_active_idx     ON sdr_events (card_id) WHERE exited_at IS NULL;

-- ============================================================
-- TABELA: comercial_events
-- Pipe: COMERCIAL (306972949)
-- ============================================================
CREATE TABLE IF NOT EXISTS comercial_events (
  id                            BIGSERIAL PRIMARY KEY,
  card_id                       TEXT        NOT NULL,
  card_title                    TEXT,
  pipe_id                       TEXT        NOT NULL DEFAULT '306972949',
  phase_name                    TEXT        NOT NULL,
  phase_id                      TEXT,
  entered_at                    TIMESTAMPTZ,
  exited_at                     TIMESTAMPTZ,
  duration_minutes              NUMERIC(10,2),
  -- Campos financeiros (todos NUMERIC para precisão)
  valor_credito                 NUMERIC(15,2),
  valor_credito_considerado     NUMERIC(15,2),
  valor_proposta_cliente        NUMERIC(15,2),
  valor_renegociado             NUMERIC(15,2),
  valor_final_proposta          NUMERIC(15,2),
  valor_pago_cedente            NUMERIC(15,2),
  -- Campos qualitativos APRESENTAÇÃO
  cliente_aceitou_proposta_ini  TEXT,
  ja_recebeu_outra_proposta     TEXT,
  motivo_inseguranca            TEXT,
  rentabilidade_esperada        NUMERIC(8,4),   -- percentual
  -- Campos qualitativos ARREMATE
  proposta_alterada             TEXT,
  cliente_aceitou_proposta_cor  TEXT,
  -- Rastreabilidade
  source                        TEXT        NOT NULL DEFAULT 'historical'
                                  CHECK (source IN ('automation','webhook','historical','manual','correction')),
  event_id                      TEXT,
  last_synced_at                TIMESTAMPTZ DEFAULT NOW(),
  created_at                    TIMESTAMPTZ DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ DEFAULT NOW(),
  -- Soft delete
  is_deleted                    BOOLEAN     DEFAULT false,
  archived_at                   TIMESTAMPTZ,
  -- Qualidade
  needs_review                  BOOLEAN     DEFAULT false,
  review_reason                 TEXT,
  -- Referência de correção
  supersedes_id                 BIGINT      REFERENCES comercial_events(id),

  CONSTRAINT comercial_events_unique UNIQUE (card_id, phase_id, entered_at)
);

CREATE INDEX IF NOT EXISTS comercial_events_card_id_idx    ON comercial_events (card_id);
CREATE INDEX IF NOT EXISTS comercial_events_phase_name_idx ON comercial_events (phase_name);
CREATE INDEX IF NOT EXISTS comercial_events_entered_at_idx ON comercial_events (entered_at);
CREATE INDEX IF NOT EXISTS comercial_events_synced_idx     ON comercial_events (last_synced_at);
CREATE INDEX IF NOT EXISTS comercial_events_active_idx     ON comercial_events (card_id) WHERE exited_at IS NULL;

-- ============================================================
-- TABELA: compliance_events
-- Pipe: COMPLIANCE (306972971)
-- Fases: BACKLOG - COMPLIANCE | DUE CONCLUÍDA
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_events (
  id                        BIGSERIAL PRIMARY KEY,
  card_id                   TEXT        NOT NULL,
  card_title                TEXT,
  pipe_id                   TEXT        NOT NULL DEFAULT '306972971',
  phase_name                TEXT        NOT NULL,
  phase_id                  TEXT,
  entered_at                TIMESTAMPTZ,
  exited_at                 TIMESTAMPTZ,
  duration_minutes          NUMERIC(10,2),
  -- Campos específicos compliance
  tem_inconsistencia        TEXT,
  descricao_inconsistencia  TEXT,
  -- Rastreabilidade
  source                    TEXT        NOT NULL DEFAULT 'historical'
                              CHECK (source IN ('automation','webhook','historical','manual','correction')),
  event_id                  TEXT,
  last_synced_at            TIMESTAMPTZ DEFAULT NOW(),
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  -- Soft delete
  is_deleted                BOOLEAN     DEFAULT false,
  archived_at               TIMESTAMPTZ,
  -- Qualidade
  needs_review              BOOLEAN     DEFAULT false,
  review_reason             TEXT,
  supersedes_id             BIGINT      REFERENCES compliance_events(id),

  CONSTRAINT compliance_events_unique UNIQUE (card_id, phase_id, entered_at)
);

CREATE INDEX IF NOT EXISTS compliance_events_card_id_idx    ON compliance_events (card_id);
CREATE INDEX IF NOT EXISTS compliance_events_phase_name_idx ON compliance_events (phase_name);
CREATE INDEX IF NOT EXISTS compliance_events_entered_at_idx ON compliance_events (entered_at);
CREATE INDEX IF NOT EXISTS compliance_events_synced_idx     ON compliance_events (last_synced_at);
CREATE INDEX IF NOT EXISTS compliance_events_active_idx     ON compliance_events (card_id) WHERE exited_at IS NULL;

-- ============================================================
-- TABELA: juridico_events
-- Pipe: JURÍDICO (306972975)
-- ============================================================
CREATE TABLE IF NOT EXISTS juridico_events (
  id                        BIGSERIAL PRIMARY KEY,
  card_id                   TEXT        NOT NULL,
  card_title                TEXT,
  pipe_id                   TEXT        NOT NULL DEFAULT '306972975',
  phase_name                TEXT        NOT NULL,
  phase_id                  TEXT,
  entered_at                TIMESTAMPTZ,
  exited_at                 TIMESTAMPTZ,
  duration_minutes          NUMERIC(10,2),
  -- Campos específicos jurídico
  prazo_conclusao_analise   TEXT,
  -- Rastreabilidade
  source                    TEXT        NOT NULL DEFAULT 'historical'
                              CHECK (source IN ('automation','webhook','historical','manual','correction')),
  event_id                  TEXT,
  last_synced_at            TIMESTAMPTZ DEFAULT NOW(),
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  -- Soft delete
  is_deleted                BOOLEAN     DEFAULT false,
  archived_at               TIMESTAMPTZ,
  -- Qualidade
  needs_review              BOOLEAN     DEFAULT false,
  review_reason             TEXT,
  supersedes_id             BIGINT      REFERENCES juridico_events(id),

  CONSTRAINT juridico_events_unique UNIQUE (card_id, phase_id, entered_at)
);

CREATE INDEX IF NOT EXISTS juridico_events_card_id_idx    ON juridico_events (card_id);
CREATE INDEX IF NOT EXISTS juridico_events_phase_name_idx ON juridico_events (phase_name);
CREATE INDEX IF NOT EXISTS juridico_events_entered_at_idx ON juridico_events (entered_at);
CREATE INDEX IF NOT EXISTS juridico_events_synced_idx     ON juridico_events (last_synced_at);
CREATE INDEX IF NOT EXISTS juridico_events_active_idx     ON juridico_events (card_id) WHERE exited_at IS NULL;

-- ============================================================
-- TABELA: financeiro_events
-- Pipe: FINANCEIRO (306972979)
-- Fases: PAGAMENTO LIBERADO | PAGAMENTO REALIZADO
-- ============================================================
CREATE TABLE IF NOT EXISTS financeiro_events (
  id                    BIGSERIAL PRIMARY KEY,
  card_id               TEXT        NOT NULL,
  card_title            TEXT,
  pipe_id               TEXT        NOT NULL DEFAULT '306972979',
  phase_name            TEXT        NOT NULL,
  phase_id              TEXT,
  entered_at            TIMESTAMPTZ,
  exited_at             TIMESTAMPTZ,
  duration_minutes      NUMERIC(10,2),
  -- Campo financeiro principal
  valor_pago_cedente    NUMERIC(15,2),
  -- Rastreabilidade
  source                TEXT        NOT NULL DEFAULT 'historical'
                          CHECK (source IN ('automation','webhook','historical','manual','correction')),
  event_id              TEXT,
  last_synced_at        TIMESTAMPTZ DEFAULT NOW(),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  -- Soft delete
  is_deleted            BOOLEAN     DEFAULT false,
  archived_at           TIMESTAMPTZ,
  -- Qualidade
  needs_review          BOOLEAN     DEFAULT false,
  review_reason         TEXT,
  supersedes_id         BIGINT      REFERENCES financeiro_events(id),

  CONSTRAINT financeiro_events_unique UNIQUE (card_id, phase_id, entered_at)
);

CREATE INDEX IF NOT EXISTS financeiro_events_card_id_idx    ON financeiro_events (card_id);
CREATE INDEX IF NOT EXISTS financeiro_events_phase_name_idx ON financeiro_events (phase_name);
CREATE INDEX IF NOT EXISTS financeiro_events_entered_at_idx ON financeiro_events (entered_at);
CREATE INDEX IF NOT EXISTS financeiro_events_synced_idx     ON financeiro_events (last_synced_at);
CREATE INDEX IF NOT EXISTS financeiro_events_active_idx     ON financeiro_events (card_id) WHERE exited_at IS NULL;

-- ============================================================
-- TABELA: webhook_queue
-- Fila de processamento assíncrono de webhooks
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_queue (
  id              BIGSERIAL PRIMARY KEY,
  payload         JSONB       NOT NULL,
  source          TEXT        NOT NULL CHECK (source IN ('automation','general')),
  pipe_id         TEXT,
  card_id         TEXT,
  event_type      TEXT,                          -- card.move, card.field_update, etc.
  status          TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','done','error','dead')),
  attempts        INTEGER     DEFAULT 0,
  last_error      TEXT,
  next_retry_at   TIMESTAMPTZ DEFAULT NOW(),
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS webhook_queue_status_idx       ON webhook_queue (status, next_retry_at) WHERE status IN ('pending','error');
CREATE INDEX IF NOT EXISTS webhook_queue_card_id_idx      ON webhook_queue (card_id);

-- ============================================================
-- TABELA: webhook_errors  (Dead Letter Queue — retenção 90 dias)
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_errors (
  id              BIGSERIAL PRIMARY KEY,
  queue_id        BIGINT      REFERENCES webhook_queue(id),
  payload         JSONB       NOT NULL,
  error_message   TEXT,
  attempts        INTEGER,
  resolved        BOOLEAN     DEFAULT false,
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS webhook_errors_resolved_idx ON webhook_errors (resolved, created_at) WHERE resolved = false;

-- ============================================================
-- TABELA: field_history
-- Versionamento de campos financeiros (qual valor estava em cada momento)
-- ============================================================
CREATE TABLE IF NOT EXISTS field_history (
  id              BIGSERIAL PRIMARY KEY,
  card_id         TEXT        NOT NULL,
  pipe_id         TEXT        NOT NULL,
  field_name      TEXT        NOT NULL,
  old_value       TEXT,
  new_value       TEXT,
  changed_at      TIMESTAMPTZ DEFAULT NOW(),
  source          TEXT        NOT NULL CHECK (source IN ('automation','webhook','historical','manual','correction')),
  event_ref_id    BIGINT                         -- referência ao evento na tabela do pipe
);

CREATE INDEX IF NOT EXISTS field_history_card_idx      ON field_history (card_id, field_name);
CREATE INDEX IF NOT EXISTS field_history_changed_idx   ON field_history (changed_at);

-- ============================================================
-- TABELA: sync_log
-- Audit trail de todas as operações de sincronização
-- ============================================================
CREATE TABLE IF NOT EXISTS sync_log (
  id              BIGSERIAL PRIMARY KEY,
  operation       TEXT        NOT NULL,          -- 'historical_load', 'reconciliation_quick', 'reconciliation_deep', 'manual'
  pipe_id         TEXT,
  status          TEXT        NOT NULL CHECK (status IN ('running','success','error','partial')),
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  cards_processed INTEGER     DEFAULT 0,
  events_inserted INTEGER     DEFAULT 0,
  events_updated  INTEGER     DEFAULT 0,
  events_skipped  INTEGER     DEFAULT 0,
  errors_count    INTEGER     DEFAULT 0,
  notes           TEXT,
  metadata        JSONB
);

CREATE INDEX IF NOT EXISTS sync_log_operation_idx ON sync_log (operation, started_at);
CREATE INDEX IF NOT EXISTS sync_log_pipe_idx      ON sync_log (pipe_id, started_at);

-- ============================================================
-- TABELA: data_quality_alerts
-- Anomalias detectadas automaticamente
-- ============================================================
CREATE TABLE IF NOT EXISTS data_quality_alerts (
  id              BIGSERIAL PRIMARY KEY,
  alert_type      TEXT        NOT NULL,          -- 'business_rule_violation', 'orphan_card', 'count_mismatch', etc.
  severity        TEXT        NOT NULL DEFAULT 'warning'
                    CHECK (severity IN ('info','warning','critical')),
  pipe_id         TEXT,
  card_id         TEXT,
  description     TEXT        NOT NULL,
  details         JSONB,
  resolved        BOOLEAN     DEFAULT false,
  resolved_at     TIMESTAMPTZ,
  resolved_by     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dqa_unresolved_idx ON data_quality_alerts (resolved, severity, created_at) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS dqa_card_idx       ON data_quality_alerts (card_id, created_at);

-- ============================================================
-- FUNÇÃO: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at
CREATE OR REPLACE TRIGGER sdr_events_updated_at
  BEFORE UPDATE ON sdr_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER comercial_events_updated_at
  BEFORE UPDATE ON comercial_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER compliance_events_updated_at
  BEFORE UPDATE ON compliance_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER juridico_events_updated_at
  BEFORE UPDATE ON juridico_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER financeiro_events_updated_at
  BEFORE UPDATE ON financeiro_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE sdr_events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercial_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE juridico_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_queue         ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_errors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_history         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_alerts   ENABLE ROW LEVEL SECURITY;

-- Policy padrão: service_role tem acesso total
-- anon e authenticated podem ler (para o dashboard)
CREATE POLICY "service_role_all_sdr"       ON sdr_events          FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_comercial" ON comercial_events     FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_compliance"ON compliance_events    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_juridico"  ON juridico_events      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_financeiro"ON financeiro_events    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_wq"        ON webhook_queue        FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_we"        ON webhook_errors       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_fh"        ON field_history        FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_sl"        ON sync_log             FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_dqa"       ON data_quality_alerts  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Dashboard (anon key) pode ler todas as tabelas de eventos e alerts
CREATE POLICY "anon_read_sdr"       ON sdr_events         FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_comercial" ON comercial_events    FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_compliance"ON compliance_events   FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_juridico"  ON juridico_events     FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_financeiro"ON financeiro_events   FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_sync_log"  ON sync_log            FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_dqa"       ON data_quality_alerts FOR SELECT TO anon USING (true);

-- ============================================================
-- COMENTÁRIOS (documentação no banco)
-- ============================================================
COMMENT ON TABLE sdr_events         IS 'Eventos do pipe SDR-COMERCIAL (306972940). Append-only.';
COMMENT ON TABLE comercial_events   IS 'Eventos do pipe COMERCIAL (306972949). Append-only.';
COMMENT ON TABLE compliance_events  IS 'Eventos do pipe COMPLIANCE (306972971). Append-only.';
COMMENT ON TABLE juridico_events    IS 'Eventos do pipe JURÍDICO (306972975). Append-only.';
COMMENT ON TABLE financeiro_events  IS 'Eventos do pipe FINANCEIRO (306972979). Append-only.';
COMMENT ON TABLE webhook_queue      IS 'Fila de processamento assíncrono. Processador deve fazer polling em status=pending.';
COMMENT ON TABLE webhook_errors     IS 'Dead letter queue. Retenção 90 dias. Eventos que falharam após 3 tentativas.';
COMMENT ON TABLE field_history      IS 'Versionamento de campos financeiros. 1 linha por mudança de valor.';
COMMENT ON TABLE sync_log           IS 'Audit trail de operações de sincronização (histórica, reconciliação, manual).';
COMMENT ON TABLE data_quality_alerts IS 'Anomalias detectadas: violação de regra de negócio, card órfão, divergência de contagem.';

COMMENT ON COLUMN sdr_events.source IS 'automation=Pipefy automation, webhook=webhook geral, historical=carga histórica, manual=inserção manual, correction=corrige evento anterior';
COMMENT ON COLUMN sdr_events.event_id IS 'SHA256(card_id + phase_id + entered_at_truncado_por_minuto) — chave de idempotência';
COMMENT ON COLUMN sdr_events.supersedes_id IS 'Se este evento corrige outro, referencia o evento original';
