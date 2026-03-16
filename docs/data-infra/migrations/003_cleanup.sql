-- ============================================================
-- MIGRAÇÃO 003 — Limpeza pós-varredura Pipefy 2026-03-12
-- ============================================================

-- Remover campo que não existe no pipe COMERCIAL
-- valor_pago_cedente era do pipe legado (Liberta Precatórios)
-- No pipe novo, o campo equivalente é valor_final_da_proposta (herdado do ARREMATE)
ALTER TABLE comercial_events DROP COLUMN IF EXISTS valor_pago_cedente;
