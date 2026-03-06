# BLOCO 6 — FLUXO OPERACIONAL: DO CONTATO AO RECEBIMENTO

**Inteligência de Mercado RPV — Liberta Precatório**
*Última atualização: março/2026 | Documento de uso interno*

---

## Visão Geral

Este bloco descreve o **ciclo completo de uma operação de cessão de RPV** — da originação do lead até o recebimento do valor pelo banco. É o documento de integração dos Blocos 1 a 5: indica qual bloco consultar em cada etapa e quais critérios aplicar.

**Uma operação completa percorre 6 etapas:**

```
[1] ORIGINAÇÃO      → Como o lead chega até a Liberta
[2] TRIAGEM INICIAL → Qualify rápido: vale investigar?
[3] DUE DILIGENCE   → Verificação completa (Bloco 4)
[4] PRECIFICAÇÃO    → Deságio e TIR esperada (Bloco 3)
[5] CONTRATAÇÃO     → Assinatura e protocolo judicial
[6] MONITORAMENTO   → Acompanhamento até o recebimento
```

---

## ETAPA 1 — ORIGINAÇÃO DE LEADS

### 1.1 Canais de Originação

| Canal | Descrição | Perfil Típico de Crédito |
|-------|-----------|--------------------------|
| **Advogados parceiros** | Escritórios de advocacia previdenciária/trabalhista/tributária com portfólio de clientes prontos para ceder | Previdenciário, BPC/LOAS, trabalhista |
| **Indicação direta do cedente** | Credor que procura ativamente comprar liquidez | Qualquer natureza |
| **Plataformas de marketplace** | Plataformas digitais de cessão (Precato, Creditas Jurídico, etc.) | Diversificado |
| **Parceiros contábeis** | Escritórios de contabilidade com clientes com créditos tributários | Tributário PJ |
| **Rede de relacionamento** | Contatos de ex-funcionários, advogados amigos, indicações | Diversificado |

### 1.2 Como Estruturar Parcerias com Advogados

**Modelo de comissionamento recomendado:**
- Comissão sobre o deságio líquido: 10-20% do deságio retido pela Liberta
- Pagamento: após recebimento efetivo pelo banco (não na assinatura)
- Contrato de parceria: formaliza as regras de encaminhamento e comissão
- NDA (Acordo de Confidencialidade): protege as informações dos clientes

**Documentação:**
- Contrato de parceria com o advogado
- Nota fiscal de serviços do escritório (ISS devido)
- IRRF de 1,5% retido na fonte (art. 647, RIR)

### 1.3 Informações a Coletar no Primeiro Contato

Ao receber um lead (por qualquer canal), coletar:

| Informação | Por Quê |
|------------|---------|
| Nome completo do cedente | Identificação básica |
| CPF do cedente | Consulta de regularidade |
| Número do processo judicial | Verificação imediata no sistema do tribunal |
| Tribunal + vara/juízo | Define regras de protocolo (Bloco 4, Módulo 5) |
| Natureza do crédito | Define se é cessível e o perfil de risco (Bloco 2) |
| Fase processual atual | Define prazo residual e score (Bloco 3, Parte VI) |
| Valor estimado do crédito | Triagem de ticket mínimo |
| Contato do advogado | Verificação posterior da OAB |

---

## ETAPA 2 — TRIAGEM INICIAL (QUALIFY RÁPIDO)

> **Objetivo:** em menos de 15 minutos, determinar se o crédito merece uma due diligence completa.

### 2.1 Filtros de Rejeição Imediata

Rejeitar sem análise adicional se qualquer item for verdadeiro:

- [ ] Natureza previdenciária + TRF4 (RS/SC/PR) → IRDR 34 veda cessão
- [ ] Tese da Revisão da Vida Toda → superada nov/2025
- [ ] Processo não encontrado no tribunal (verificar em 2 minutos no e-proc/PJe)
- [ ] Ticket abaixo de R$ 5.000 (custo operacional inviável)
- [ ] Ente devedor em regime de recuperação fiscal sem histórico de pagamento de RPVs

### 2.2 Consulta Rápida ao Sistema do Tribunal

Com o número do processo em mãos:
1. Acessar o sistema do tribunal (e-proc para JF, PJe para TRT, e-SAJ/Projudi para TJ)
2. Confirmar: processo existe, cedente é parte autora, há sentença/acórdão favorável
3. Verificar fase atual: liquidação, expedição ou RPV já expedida?
4. Verificar se há movimentação recente (processo não paralisado)

**Acesso rápido aos sistemas:**
- JEF/TRF: [eproc.trf[n].jus.br] ou [pje.jus.br]
- TRT: [pje.trt[n].jus.br]
- TJ: [esaj.tjsp.jus.br] (SP), [projudi.tjrs.jus.br] (RS), etc.
- Consulta nacional: [datajud.cnj.jus.br]

### 2.3 Cálculo do Score de Triagem

Aplicar o modelo de scoring do Bloco 3 (Parte VI):
- Score ≥ 65: prosseguir para due diligence
- Score 50-64: prosseguir com cautela adicional
- Score < 50: rejeitar ou exigir deságio acima de 30%
- BLOQUEIO em qualquer dimensão: rejeitar

### 2.4 Estimativa de Valor

Com as informações coletadas:
- Consultar tabela de tetos por ente (Bloco 1) para confirmar se é RPV ou precatório
- Estimar prazo residual por natureza/fase (Bloco 3, Parte II)
- Calcular range de deságio adequado (Bloco 3, seção 5.4)
- Fazer proposta inicial ao cedente/advogado

**Regra de bolso:**
```
Valor ofertado ao cedente = Valor de face × (1 - deságio)
                          × (1 - honorários do advogado)
                          × (1 - IR estimado)
```

---

## ETAPA 3 — DUE DILIGENCE COMPLETA

> Referência principal: **Bloco 4 — Due Diligence**

### 3.1 Sequência de Módulos

| Módulo | O Que Fazer | Tempo estimado |
|--------|-------------|----------------|
| Módulo 1 ou 2 | Due diligence do cedente (PF ou PJ) | 30-60 min |
| Módulo 3 | Due diligence do processo | 30-60 min |
| Módulo 4 | Due diligence do advogado | 15-30 min |
| Módulo 10 | Due diligence do ente devedor (se estadual/municipal) | 30 min |
| Checklist específico (6.1 a 6.5) | Checklist por natureza do crédito | 15-30 min |
| **Total** | — | **~2 a 3 horas** |

### 3.2 Documentos a Receber Antes da Assinatura

Exigir do advogado do cedente:
- [ ] Cópia da sentença/acórdão com certidão de trânsito em julgado
- [ ] Cópia do cálculo de liquidação homologado
- [ ] Certidão do juízo da execução (valor, fase, cessões anteriores, penhoras)
- [ ] Extrato da movimentação processual (print do sistema do tribunal)
- [ ] Cópia do contrato de honorários

Exigir do cedente:
- [ ] RG/CNH + CPF
- [ ] Comprovante de residência (máx. 3 meses)
- [ ] Certidão de casamento ou declaração de estado civil (se casado: anuência do cônjuge)

### 3.3 Verificações Críticas

| Verificação | Sistema | Criticidade |
|-------------|---------|-------------|
| Processo existe e partes conferem | e-proc/PJe/SEAD | Obrigatório |
| OAB do advogado ativa e sem suspensão | advogado.oab.org.br | Obrigatório |
| CPF do cedente regular | receita.fazenda.gov.br | Obrigatório |
| Sem cessão anterior nos autos | Certidão do juízo | Obrigatório |
| Sem penhora sobre o crédito | Sisbajud + certidão do juízo | Obrigatório |
| Saúde fiscal do ente (se Estado/Mun.) | SICONFI + Portal CNJ | Recomendado |

---

## ETAPA 4 — PRECIFICAÇÃO

> Referência principal: **Bloco 3, Partes V e VI**

### 4.1 Cálculo do Deságio Final

Após a due diligence completa:

```
1. Calcular o Score de Aquisição (Bloco 3, seção 6.2)
2. Identificar o range de deságio pelo Score (seção 6.3)
3. Ajustar pelo prazo residual estimado:
   - Prazo mais longo que o padrão: aumentar deságio
   - Prazo mais curto (ex: RPV já expedida): reduzir deságio
4. Considerar o valor de face corrigido (SELIC acumulada — Bloco 3, seção 3.2)
5. Deduzir: honorários do advogado + IR estimado + custos operacionais
6. Calcular o valor líquido a pagar ao cedente
```

### 4.2 Proposta ao Cedente

A proposta deve especificar:
- Valor de face do crédito (conforme cálculo de liquidação)
- Percentual de deságio
- Valor a ser pago ao cedente (líquido de honorários e IR)
- Prazo de pagamento ao cedente (D+? após assinatura/protocolo)
- Validade da proposta (ex: 5 dias úteis)

### 4.3 Cálculo da TIR Esperada

Usar a tabela do Bloco 3 (seção 5.2) como referência:
- TIR mínima aceitável: CDI + 5% (~19% a.a. com SELIC a 14,25%)
- TIR alvo: CDI + 10-15% (~24-29% a.a.)
- Qualquer operação com TIR esperada abaixo de CDI: não fazer

---

## ETAPA 5 — CONTRATAÇÃO E PROTOCOLO JUDICIAL

### 5.1 Instrumento de Cessão

Elaborar o contrato com todos os elementos do Bloco 4 (Módulo 5.1):
- Qualificação completa cedente + cessionário
- Dados precisos do crédito cedido
- Valor e forma de pagamento
- Cláusulas de garantia e representação
- Cláusula resolutiva (para previdenciário fora TRF4)
- Reconhecimento de firmas em cartório (obrigatório)

### 5.2 Pagamento ao Cedente

**Regras:**
- Usar exclusivamente TED ou PIX para conta bancária em nome do cedente
- Nunca pagar em espécie (proibido acima de R$ 10.000 — COAF)
- Emitir comprovante de transferência e arquivar
- Fazer o pagamento somente após:
  - Instrumento assinado com firma reconhecida
  - Protocolo no tribunal confirmado (ou imediatamente antes, conforme acordado)

### 5.3 Protocolo no Tribunal

Verificar o procedimento específico do tribunal (Bloco 4, Módulo 5.2):

| Tribunal | Sistema | Procedimento |
|----------|---------|--------------|
| JEF/TRF | e-proc/PJe | Petição de cessão nos autos + documentos (Res. CJF 945/2025) |
| TRT | PJe-JT/SEAD | Conforme Provimento GP do TRT específico |
| TJ (precatório) | e-SAJ/Projudi | Notificação ao DEPRE do TJ |

**Prazo crítico:** a cessão deve ser protocolada ANTES da expedição da RPV pelo tribunal. Após a expedição, o nome do beneficiário já está na requisição e é necessário petição adicional para alteração.

### 5.4 Acompanhamento do Protocolo

Após o protocolo:
- [ ] Confirmar recebimento e autuação da petição no sistema
- [ ] Aguardar despacho do juiz da execução (homologação)
- [ ] Se houver pedido de esclarecimento ou diligência: responder em 5 dias úteis
- [ ] Após homologação: comunicar ao DEPRE/setor de RPV do tribunal para inclusão do cessionário

---

## ETAPA 6 — MONITORAMENTO ATÉ O RECEBIMENTO

### 6.1 Eventos a Monitorar

Após o protocolo e homologação, acompanhar mensalmente:

| Evento | Ação Esperada | Urgência |
|--------|---------------|----------|
| Decisão adversa em recurso | Acionar cláusula resolutiva se houver | Alta |
| Expedição da RPV | Confirmar que cessionário consta como beneficiário | Alta |
| Depósito pelo ente devedor | Verificar conta bancária indicada | Alta |
| Demora além de 60 dias | Petição de sequestro de verbas públicas | Média |
| Julgamento IRDR 34 no STJ | Revisar portfólio de previdenciários fora TRF4 | Alta |
| Mudança de SM (jan de cada ano) | Atualizar valores de teto no sistema | Baixa |

### 6.2 Alertas de Prazo

| Marco | Prazo Legal | Ação se Descumprido |
|-------|-------------|---------------------|
| Depósito pelo ente após expedição da RPV | 60 dias | Petição de sequestro (art. 100, §6°, CF) |
| Homologação da cessão pelo juiz | Sem prazo legal — típico: 30-60 dias | Acompanhar + peticionar se inerte |
| Resposta a diligência do juiz | Geralmente 5-15 dias (conforme despacho) | Responder no prazo ou perder prioridade |

### 6.3 Sequestro de Verbas — Quando e Como

Se o ente não depositar a RPV no prazo de 60 dias:

1. Peticionar nos autos requerendo o sequestro (art. 100, §6°, CF/88)
2. O juiz expede ordem de sequestro ao Banco do Brasil/CEF
3. O banco bloqueia o valor na conta do ente
4. O ente tem prazo para regularizar ou o valor é transferido para a conta do credor
5. Esse mecanismo torna o risco de inadimplência da RPV muito baixo na prática

### 6.4 Saque do Valor

Quando o depósito for efetuado:
- O tribunal ou o banco notifica o beneficiário (cessionário)
- Apresentar documentos na agência: RG, CPF, comprovante de residência (cessionário ou representante)
- Prazo para disponibilização: 48h após apresentação dos documentos
- Não é necessário alvará judicial (regra geral para RPVs)
- Para valores acima de R$ 15.000: verificar se o banco exige agendamento

### 6.5 Registro Contábil do Recebimento

Após o saque, registrar conforme o Bloco 5 (Módulo 7.1):
- Dar baixa no ativo "Créditos Judiciais a Receber"
- Reconhecer a "Receita de Cessão de Créditos"
- Registrar o IRRF retido como crédito a recuperar ou despesa
- Atualizar o mapa de portfólio (RPV encerrada)

---

## SUMÁRIO — RESPONSABILIDADES POR ETAPA

| Etapa | Quem Executa | Bloco de Referência | Tempo Típico |
|-------|--------------|---------------------|--------------|
| 1. Originação | Comercial | — | Contínuo |
| 2. Triagem inicial | Comercial / Jurídico | Blocos 2, 3 | 15-30 min |
| 3. Due diligence | Jurídico | Bloco 4 | 2-3 horas |
| 4. Precificação | Financeiro / Comercial | Bloco 3 | 30-60 min |
| 5. Contratação | Jurídico | Blocos 4 e 5 | 1-3 dias |
| 6. Monitoramento | Operacional | Blocos 1, 3, 4 | Contínuo |

---

## CHECKLIST MASTER — OPERAÇÃO COMPLETA

Use este checklist como controle de qualidade de cada operação:

### Triagem
- [ ] Natureza identificada (Bloco 2) — não é previdenciário no TRF4
- [ ] Processo verificado no sistema do tribunal
- [ ] Score calculado ≥ 50
- [ ] Ticket adequado (≥ R$ 10.000 recomendado)

### Due Diligence
- [ ] CPF do cedente regular (Receita Federal)
- [ ] OAB do advogado ativa e sem suspensão
- [ ] Trânsito em julgado confirmado (certidão)
- [ ] Sem cessão anterior nos autos (certidão do juízo)
- [ ] Sem penhora sobre o crédito (Sisbajud)
- [ ] Cálculo de liquidação auditado
- [ ] Honorários do advogado verificados e deduzidos
- [ ] Saúde fiscal do ente avaliada (se estadual/municipal)

### Precificação
- [ ] Deságio calculado com base no score e prazo
- [ ] TIR esperada ≥ CDI + 5%
- [ ] Valor líquido ao cedente calculado (face - deságio - honorários - IR)
- [ ] Proposta formal enviada ao cedente

### Contratação
- [ ] Instrumento de cessão elaborado com todos os elementos obrigatórios
- [ ] Cláusula resolutiva incluída (se previdenciário fora TRF4)
- [ ] Reconhecimento de firmas em cartório
- [ ] Cônjuge assinou (se cedente casado em regime de comunhão)
- [ ] KYC do cedente documentado (COAF)
- [ ] Pagamento feito por TED/PIX rastreável
- [ ] Petição de cessão protocolada no tribunal

### Monitoramento
- [ ] Homologação da cessão pelo juiz confirmada
- [ ] Cessionário incluído como beneficiário na RPV
- [ ] Depósito pelo ente verificado dentro de 60 dias
- [ ] Saque realizado e registrado contabilmente

---

## RÉGUA DE ATUALIZAÇÃO — O QUE REVISAR E QUANDO

| Informação | Frequência de Revisão | Fonte |
|------------|-----------------------|-------|
| Salário Mínimo (tetos de RPV) | Anual (janeiro) | Decreto anual SM |
| SELIC atual | Mensal (Copom) | Banco Central |
| Índices fiscais estaduais (UFESP, UFEMG, etc.) | Anual (jan/fev) | SEFAZ de cada estado |
| UPF/MT (Mato Grosso) | Mensal | SEFAZ-MT / TJMT |
| Julgamento IRDR 34 no STJ | Semanal (monitorar notícias) | STJ, JOTA, ConJur |
| Leis municipais de teto de RPV | Contínuo (antes de operar em novo município) | Câmara Municipal |
| Novas teses tributárias (STF/STJ) | Trimestral | JOTA, Migalhas, IBET |
| Índices de correção (SELIC/IPCA para precatórios) | Mensal | CJF, CNJ |
| Saúde fiscal de entes devedores frequentes | Semestral | SICONFI |

---

*Documento de uso interno — Liberta Precatório*
*Manual operacional integrado — consolida os Blocos 1 a 5 em um fluxo de trabalho*
