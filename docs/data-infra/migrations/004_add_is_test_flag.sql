-- ============================================================
-- MIGRAÇÃO 004 — Flag is_test para cards de teste
-- Cards com "[teste]" no título são marcados automaticamente
-- pelo webhook v3. Dashboard usa is_test=false como padrão.
-- ============================================================

ALTER TABLE sdr_events          ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE comercial_events    ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE compliance_events   ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE juridico_events     ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE financeiro_events   ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

-- Índices para filtro rápido no dashboard
CREATE INDEX IF NOT EXISTS sdr_events_is_test_idx         ON sdr_events         (is_test);
CREATE INDEX IF NOT EXISTS comercial_events_is_test_idx   ON comercial_events   (is_test);
CREATE INDEX IF NOT EXISTS compliance_events_is_test_idx  ON compliance_events  (is_test);
CREATE INDEX IF NOT EXISTS juridico_events_is_test_idx    ON juridico_events    (is_test);
CREATE INDEX IF NOT EXISTS financeiro_events_is_test_idx  ON financeiro_events  (is_test);

-- Retroativo: marcar cards históricos que já têm [teste] no título
UPDATE sdr_events        SET is_test = true WHERE card_title ILIKE '%[teste]%';
UPDATE comercial_events  SET is_test = true WHERE card_title ILIKE '%[teste]%';
UPDATE compliance_events SET is_test = true WHERE card_title ILIKE '%[teste]%';
UPDATE juridico_events   SET is_test = true WHERE card_title ILIKE '%[teste]%';
UPDATE financeiro_events SET is_test = true WHERE card_title ILIKE '%[teste]%';
