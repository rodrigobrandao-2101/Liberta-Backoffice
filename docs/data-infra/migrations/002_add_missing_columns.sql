-- ============================================================
-- MIGRAÇÃO 002 — Colunas descobertas na varredura 2026-03-12
-- ============================================================

-- comercial_events: campos novos descobertos via API
ALTER TABLE comercial_events ADD COLUMN IF NOT EXISTS valor_final_dos_honorarios   TEXT;
ALTER TABLE comercial_events ADD COLUMN IF NOT EXISTS barreira_juridica             TEXT;
ALTER TABLE comercial_events ADD COLUMN IF NOT EXISTS valor_total_executado         NUMERIC(15,2);
ALTER TABLE comercial_events ADD COLUMN IF NOT EXISTS valor_cedido_rpv              NUMERIC(15,2);
ALTER TABLE comercial_events ADD COLUMN IF NOT EXISTS valor_honorarios_contratuais  NUMERIC(15,2);

-- financeiro_events: valor_pago_cedente não existe no pipe novo
-- Campo correto é valor_final_da_proposta (herdado do COMERCIAL/ARREMATE)
ALTER TABLE financeiro_events RENAME COLUMN valor_pago_cedente TO valor_final_da_proposta;

-- juridico_events: campos financeiros deste pipe
ALTER TABLE juridico_events ADD COLUMN IF NOT EXISTS valor_total_executado         NUMERIC(15,2);
ALTER TABLE juridico_events ADD COLUMN IF NOT EXISTS valor_cedido_rpv              NUMERIC(15,2);
ALTER TABLE juridico_events ADD COLUMN IF NOT EXISTS valor_honorarios_contratuais  NUMERIC(15,2);
ALTER TABLE juridico_events ADD COLUMN IF NOT EXISTS comarca                       TEXT;
ALTER TABLE juridico_events ADD COLUMN IF NOT EXISTS numero_cumprimento_sentenca   TEXT;
ALTER TABLE juridico_events ADD COLUMN IF NOT EXISTS oficio_rpv                    TEXT;
ALTER TABLE juridico_events ADD COLUMN IF NOT EXISTS oficio_requisitorio           TEXT;
