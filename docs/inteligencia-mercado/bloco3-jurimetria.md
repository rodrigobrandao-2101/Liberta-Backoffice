# BLOCO 3 — JURIMETRIA: VOLUME, PRAZOS E RETORNO POR NATUREZA DE CRÉDITO

**Inteligência de Mercado RPV — Liberta Precatório**
*Última atualização: março/2026 | Documento de uso interno*

---

## Como Ler Este Documento

Este bloco quantifica o mercado de RPVs sob três dimensões:

1. **Volume** — quantos processos existem, por natureza, em cada tribunal
2. **Prazo** — quanto tempo leva da entrada do processo até o dinheiro na conta do cedente
3. **Retorno** — qual a correção monetária no período + impacto no modelo de negócio

A combinação das três dimensões permite calcular o **custo efetivo de capital** por tipo de aquisição e comparar a RPV com outras alternativas de investimento.

---

## PARTE I — VOLUME DE MERCADO

### 1.1 Visão Geral do Judiciário Brasileiro (CNJ, 2024)

| Segmento | Processos em tramitação | Novos processos/ano | Processos julgados/ano |
|----------|--------------------------|---------------------|------------------------|
| Justiça Federal | ~30 milhões total | ~6M | ~6M |
| └─ Previdenciário | 5,2 milhões (set/2024) | 2,5 milhões | 2,2 milhões |
| └─ Tributário | expressivo (sem dado isolado) | — | — |
| Justiça do Trabalho | ~14 milhões em estoque | 2,1 milhões | 4 milhões |
| Justiça Estadual | ~80 milhões | ~30M | ~30M |

Fonte: CNJ — Justiça em Números 2024

### 1.2 Previdenciário — Detalhamento

**Fatos relevantes (CNJ/CJF 2024-2025):**
- 5,2 milhões de processos previdenciários ativos na Justiça Federal (set/2024)
- Representa 23% de todo o estoque do Judiciário brasileiro
- 1 em cada 6 novos benefícios concedidos em 2023 foi resultado de ação judicial
- CJF 2025: R$ 2,6 bilhões pagos a 172.818 segurados em 128.064 processos
- Valor médio por processo (CJF 2025): R$ 2,6 bi / 128.064 = aprox. R$ 20.300 por beneficiário
- 86% dos pagamentos federais de RPV são de natureza previdenciária e assistencial

**Distribuição estimada por natureza de processo:**

| Natureza | Volume estimado no estoque | Participação |
|----------|---------------------------|---------------|
| Benefício por incapacidade (B31/B91) | ~2,0 milhões | ~38% |
| BPC/LOAS (assistencial) | ~1,0 milhão | ~19% |
| Aposentadorias diversas (especial, rural, etc.) | ~900 mil | ~17% |
| Pensão por morte | ~600 mil | ~12% |
| Revisões de benefício | ~400 mil | ~8% |
| Salário-maternidade rural | ~300 mil | ~6% |

Estimativas baseadas em dados parciais CNJ e relatórios CJF.

### 1.3 Trabalhista — Detalhamento

**Fatos relevantes (CNJ 2024):**
- 2,1 milhões de novas ações em 2024 — maior número desde a Reforma Trabalhista (2017)
- 4 milhões de processos julgados em 2024 (+14,3% vs 2023)
- Estoque ativo estimado: ~10-14 milhões de processos
- TRT-BA sozinho pagou R$ 4,2 bilhões a trabalhadores em 2024
- Cada TRT tem teto de RPV próprio (ver Bloco 1 — tetos estaduais)

**Principais temas de litígio (estimativa de participação):**

| Tema | Participação aprox. |
|------|----------------------|
| Horas extras / banco de horas | ~25% |
| Verbas rescisórias / FGTS | ~20% |
| Dano moral (assédio, acidente) | ~15% |
| Equiparação salarial / desvio de função | ~12% |
| Vínculo empregatício (PJ → CLT) | ~10% |
| Demais | ~18% |

### 1.4 Servidor Público — Detalhamento

- Volume nacional estimado: 300–500 mil processos ativos na JF + JE
- TRF1 (MG, BA, Norte/Nordeste/CO): maior concentração de servidores federais com ações de quintos, VPNI, adicionais
- TJ-SP: maior volume de servidores estaduais do Brasil, mas teto de RPV estadual muito baixo (~R$ 15.566)
- Perfil de prazo: semelhante ao previdenciário — 24 a 48 meses para casos sem recurso relevante

### 1.5 Tributário Federal — Detalhamento

- Tese do Século: R$ 346 bilhões já compensados até dez/2024 (IBET)
- Maioria é via compensação administrativa (PER/DCOMP) — não gera RPV
- RPV tributária: empresa sem débitos federais para compensar que pede restituição em espécie
- Público: micro, pequenas e médias empresas (PME) do Lucro Presumido
- Sem dados agregados de volume de RPVs tributárias especificamente

### 1.6 Saúde Pública — Crescimento Acelerado

- CNJ: judicialização de saúde cresceu 130% em 10 anos (2012–2022)
- Estimativa atual: ~1,5 milhão de ações de saúde em tramitação (JE + JF)
- Estados e Municípios respondem pela maioria das condenações
- Alto custo médio das condenações (medicamentos oncológicos, doenças raras)
- Tendência: crescimento contínuo por envelhecimento populacional + restrições orçamentárias do SUS

---

## PARTE II — MAPEAMENTO DE PRAZOS POR NATUREZA

### 2.1 Fluxo Geral — Da Negativa Administrativa ao Recebimento

```
[1] Negativa administrativa (INSS/Receita/Empregador)
         |
         v
[2] Ajuizamento da ação
         |
         v
[3] Sentença de 1ª instância
         |
         v
[4] Trânsito em julgado (sem recurso ou após recursos)
         |
         v
[5] Liquidação / cálculo do valor devido
         |
         v
[6] Expedição da RPV pelo tribunal
         |
         v
[7] Depósito pelo ente devedor (prazo: 60 dias)
         |
         v
[8] Saque pelo beneficiário / cessionário (48h após apresentação de docs)
```

Cada fase tem duração variável conforme a natureza do crédito, o tribunal e o estoque de processos.

---

### 2.2 Previdenciário — Prazos por Fase (Justiça Federal / JEF)

**Dados CNJ 2024 para ações previdenciárias:**

| Métrica | Valor (CNJ 2024) |
|---------|------------------|
| Tempo médio — processos pendentes | 746 dias (~2 anos) |
| Tempo médio — processos julgados | 336 dias (~11 meses) |
| Tempo médio — processos encerrados | 394 dias (~13 meses) |
| Tempo médio — fase de conhecimento (1ª inst.) | 1 a 3 anos (varia por TRF) |

**Estimativa prática de prazo total (da negativa ao recebimento):**

| Fase | Duração estimada | Observações |
|------|------------------|--------------|
| Ajuizamento até sentença 1ª instância | 12 a 30 meses | JEF: 8-18m; Vara Federal comum: 18-36m |
| Recursos (TRF + STJ/STF) | 0 a 48 meses | Casos simples: sem recurso relevante |
| Liquidação (cálculo do débito) | 2 a 8 meses | Depende da complexidade do cálculo |
| Expedição da RPV | 1 a 4 meses | Pós-trânsito em julgado e liquidação |
| Depósito pelo INSS (prazo legal) | até 60 dias | INSS paga em lotes mensais |
| Saque no banco | 48h pós-apresentação | Sem alvará necessário |
| **TOTAL ESTIMADO (caso simples)** | **24 a 48 meses** | JEF, sem recurso |
| **TOTAL ESTIMADO (caso complexo)** | **48 a 96 meses** | Com recursos até STJ |

**Por tipo de benefício:**

| Tipo de Benefício | Prazo Total Estimado | Observação |
|-------------------|----------------------|-------------|
| BPC/LOAS (assistencial) | 18 a 36 meses | JEF — critério de miserabilidade — provas rápidas |
| Benefício por incapacidade (B31) | 24 a 48 meses | Depende de perícia judicial |
| Salário-maternidade rural | 18 a 30 meses | TRF1: instrução concentrada acelera |
| Aposentadoria especial | 36 a 72 meses | Cálculo complexo — recurso frequente do INSS |
| Pensão por morte | 24 a 48 meses | Depende da prova de dependência econômica |
| Revisão do Buraco Negro | 30 a 60 meses | Cálculo complexo, mas INSS não recorre muito |
| Reconhecimento tempo rural | 24 a 48 meses | Instrução documental complexa; TRF1 tem rito concentrado |

**Variação por TRF (tempo médio até sentença 1ª instância):**

| TRF | Estados | Tempo médio estimado | Observação |
|-----|---------|----------------------|------------|
| TRF1 | MG, BA, MT, GO, AC, RO, RR, AP, AM, PA, MA, PI, TO, DF | 24–36 meses | Maior volume — mais lento |
| TRF2 | RJ, ES | 18–30 meses | Médio |
| TRF3 | SP, MS | 20–32 meses | Médio-lento — maior cidade do país |
| TRF4 | RS, SC, PR | 12–24 meses | Mais rápido historicamente — mas IRDR 34 para previdenciário |
| TRF5 | AL, CE, PB, PE, RN, SE | 18–30 meses | Médio — demandas rurais concentradas |
| TRF6 | MG (novo) | 18–30 meses | Em fase de estruturação desde 2022 |

---

### 2.3 Trabalhista — Prazos por Fase (Justiça do Trabalho)

**Dados CNJ 2024:**

| Métrica | Valor |
|---------|-------|
| Tempo médio fase de conhecimento (1ª inst.) | 163 dias (~5,5 meses) — CNJ 2024 |
| Recurso ao TRT (fase recursal) | 6 a 18 meses adicionais |
| Recurso de revista ao TST | 12 a 36 meses adicionais |
| Fase de liquidação | 3 a 12 meses |
| Expedição da RPV (TRT) | 1 a 3 meses |
| Depósito pelo devedor | até 60 dias |

**Estimativa prática total:**

| Cenário | Prazo Total | Observação |
|---------|-------------|-------------|
| Caso simples (sem recurso relevante) | 18 a 30 meses | Pequena empresa sem PGR/Defesa |
| Caso com recurso ao TRT | 24 a 42 meses | Recurso ordinário — frequente |
| Caso com Recurso de Revista ao TST | 48 a 84 meses | Grandes empresas sistematicamente recorrem |

**Diferença prática para cessão:**
- No trabalhista, a maioria dos credores já tem sentença ou acórdão transitado — o risco de mérito está resolvido
- O prazo relevante para a cessão é o da fase de execução/expedição de RPV: tipicamente 6 a 18 meses adicionais

---

### 2.4 Servidor Público — Prazos por Fase

| Fase | Duração estimada | Observação |
|------|------------------|------------|
| 1ª instância (JF ou TJ) | 18 a 36 meses | Similar ao previdenciário |
| Recursos (TRF/TJ + STJ) | 0 a 48 meses | Ente público frequentemente recorre em valores altos |
| Liquidação | 3 a 12 meses | Cálculo pode ser complexo (retroativos + carreiras) |
| Expedição e recebimento | 2 a 5 meses | — |
| **TOTAL (caso simples)** | **24 a 48 meses** | — |
| **TOTAL (caso com recurso)** | **48 a 84 meses** | — |

---

### 2.5 Tributário Federal — Prazos por Via

| Via | Descrição | Prazo Total |
|-----|-----------|-------------|
| Administrativa (PER/DCOMP) | Pedido de compensação eletrônica | 15 dias a 24 meses (depende de fila RFB) |
| Habilitação judicial | Reconhecimento judicial + habilitação na RFB | 6 a 18 meses após trânsito em julgado |
| Restituição em espécie (via SEFIN) | Pedido de devolução de valores | 90 dias a 2 anos |
| Ação judicial de restituição | Quando RFB nega administrativamente | 3 a 8 anos total |
| **RPV tributária federal** | Empresa sem débito para compensar | Incluída nos prazos acima |

---

### 2.6 Procedimento RPV — Do Depósito ao Saque

Fase final idêntica para todas as naturezas, pós-expedição:

| Passo | Prazo | Responsável |
|-------|-------|-------------|
| Expedição da RPV pelo tribunal | 1 a 4 meses pós-liquidação | Tribunal |
| Notificação do ente devedor | Imediata pós-expedição | Tribunal |
| Depósito pelo ente devedor | Até 60 dias (art. 100, CF/88) | União / INSS / Estado / Município |
| Abertura de conta bancária para saque | Automática | Banco do Brasil / CEF |
| Saque pelo beneficiário/cessionário | 48h após apresentar docs | Cedente ou cessionário |
| Documentos necessários | ID + CPF + comprovante residência (orig. e cópia) | — |
| Necessidade de alvará judicial | NÃO (regra geral) | — |

---

## PARTE III — ÍNDICES DE CORREÇÃO MONETÁRIA

### 3.1 Regra Atual de Correção das RPVs Federais

**Marco normativo vigente (março/2026):**

| Norma | Regra |
|-------|-------|
| EC 113/2021 (desde 09/12/2021) | SELIC como único índice de correção e juros moratórios nos precatórios e RPVs federais |
| Resolução CJF 945/2025 | Reafirma SELIC como índice de atualização das RPVs federais |
| Lei 14.905/2024 (desde 30/08/2024) | IPCA para correção + SELIC para juros de mora em relações civis gerais |
| EC 136/2025 | IPCA para precatórios estaduais/municipais (ago/2025) e federais (set/2025) |

**Na prática — o que incide em cada RPV:**

| Natureza do Crédito | Índice de Correção Monetária | Juros de Mora |
|--------------------|---------------------------------|---------------|
| Previdenciário federal | SELIC (acumulada desde competência do crédito) | Incluso na SELIC (EC 113) |
| Trabalhista | SELIC (desde março/2024 — STF Tema 1.191) | 1% a.m. (CLT, art. 883) até 2021; SELIC após |
| Tributário federal (restituição) | SELIC (art. 161, CTN) | Idem |
| Assistencial BPC/LOAS | SELIC | Incluso na SELIC |
| Precatório (qualquer) | IPCA (desde set/2025) | Juros simples 2% a.a. após expedição |

**Taxas SELIC históricas relevantes:**

| Período | SELIC acumulada anual |
|---------|-----------------------|
| 2020 | 2,75% a.a. |
| 2021 | 9,25% a.a. |
| 2022 | 13,75% a.a. |
| 2023 | 11,75% a.a. |
| 2024 | 12,25% a.a. |
| 2025 | ~14,75% a.a. (previsão encerramento) |
| 2026 | ~14,25% a.a. (previsão) |

Fonte: Banco Central do Brasil

### 3.2 Impacto da Correção no Valor do Crédito

**Simulação — RPV previdenciária de R$ 40.000 com correção SELIC:**

| Período do crédito | Valor original (débito inicial) | Fator SELIC acumulado | Valor na expedição |
|--------------------|---------------------------------|-----------------------|--------------------|
| 24 meses (2024-2026) | R$ 40.000 | ~1,30 (aprox.) | ~R$ 52.000 |
| 36 meses (2023-2026) | R$ 40.000 | ~1,45 (aprox.) | ~R$ 58.000 |
| 48 meses (2022-2026) | R$ 40.000 | ~1,65 (aprox.) | ~R$ 66.000 |

O credor muitas vezes subestima o valor real do crédito corrigido — oportunidade para a Liberta apresentar o valor atualizado e justificar o deságio.

### 3.3 Impacto da SELIC Alta no Mercado de RPVs

Com SELIC a ~14,75% a.a. (2025), há dois efeitos opostos:

| Efeito | Descrição | Impacto para a Liberta |
|--------|-----------|------------------------|
| Crédito mais valioso | SELIC corre a favor no crédito — valor corrigido cresce mais rápido | Positivo: RPV adquirida hoje vale mais no recebimento |
| Custo de oportunidade maior | CDI alto aumenta a exigência de TIR mínima | Negativo: o deságio necessário para superar o CDI aumenta |
| Credor mais pressionado | SELIC alta = crédito imobiliário/pessoal mais caro = cedente mais ansioso para receber | Positivo: maior receptividade a propostas |

**Conclusão:** SELIC alta favorece a Liberta desde que o deságio praticado seja calibrado adequadamente (ver Parte V).

---

## PARTE IV — TAXAS DE ÊXITO (PROBABILIDADE DE PROCEDÊNCIA)

### 4.1 Previdenciário

Não há estatísticas oficiais consolidadas de taxa de êxito por tipo de benefício. Os dados disponíveis indicam:

| Indicador | Valor |
|-----------|-------|
| Taxa de administrativos deferidos pelo INSS (B31) | ~35-45% |
| Taxa de êxito judicial em benefícios por incapacidade | Estimada em 55-70% |
| Diferença pericial admin × judicial | +35,3 pontos percentuais de êxito quando há perícia judicial (CNJ) |
| Benefícios concedidos judicialmente / total | 1 em cada 6 (dados 2023) |

**Prática do mercado de cessão:**
- A cessão normalmente ocorre após a sentença favorável em 1ª instância
- O risco de mérito já está resolvido (processo na fase de liquidação ou recursal)
- O risco residual é: reversão em recurso (baixo em benefício de incapacidade — INSS perde ~70% dos recursos)
- Risco mais relevante: demora adicional por recurso INSS até STJ/STF

### 4.2 Trabalhista

| Indicador | Valor |
|-----------|-------|
| Taxa média de êxito em ações trabalhistas (TRT) | ~60-75% (parcial ou total) |
| Acordos antes da sentença | ~30-40% dos casos |
| Taxa de reforma em 2ª instância (TRT) | ~30-40% (parcial) |
| Taxa de reforma no TST | ~15-25% |

**Prática:** Maioria das cessões trabalhistas ocorre após sentença ou acórdão — mérito praticamente definido.

### 4.3 Tributário

| Indicador | Valor |
|-----------|-------|
| Taxa de êxito em teses consolidadas (Tese do Século, ISS, etc.) | ~95-99% (tese assentada) |
| Taxa de êxito em teses em formação | Muito variável — risco alto |
| Taxa de deferimento PER/DCOMP após trânsito em julgado | ~85-90% |

**Prática:** O risco de mérito em teses tributárias consolidadas é próximo de zero. O risco é operacional: cálculo incorreto dos créditos, perda de prazo prescricional, glosa parcial pela RFB.

### 4.4 Servidor Público

| Indicador | Valor estimado |
|-----------|----------------|
| Taxa de êxito em ações de servidor (JF/JE) | ~60-80% (parcial ou total) |
| Ente recorre na maioria dos casos? | Sim — Fazenda Pública recorre sistematicamente |
| Taxa de reforma em 2ª instância | ~25-40% (parcial — redução do valor) |

---

## PARTE V — MODELO DE RETORNO PARA CESSÃO DE RPV

### 5.1 Lógica de Precificação

A Liberta compra o crédito do cedente com desconto (deságio) sobre o valor de face. O retorno depende de:

```
Retorno bruto = (Valor recebido - Valor pago) / Valor pago
Prazo de espera = Meses entre pagamento ao cedente e recebimento pelo tribunal
TIR = Taxa interna de retorno anualizada
```

### 5.2 Simulação de Retorno por Prazo de Espera

**Exemplo: RPV de R$ 50.000 de face, com deságio de 15% (pagamento de R$ 42.500 ao cedente):**

| Prazo de espera | Valor recebido (com SELIC) | Retorno bruto | TIR anualizada |
|-----------------|---------------------------|----------------|----------------|
| 6 meses | R$ 53.500 (SELIC 7%) | R$ 11.000 (25,9%) | ~58% a.a. |
| 12 meses | R$ 57.500 (SELIC 15%) | R$ 15.000 (35,3%) | ~35% a.a. |
| 18 meses | R$ 60.000 (SELIC 22%) | R$ 17.500 (41,2%) | ~27% a.a. |
| 24 meses | R$ 62.500 (SELIC 30%) | R$ 20.000 (47,1%) | ~24% a.a. |
| 36 meses | R$ 67.500 (SELIC 45%) | R$ 25.000 (58,8%) | ~20% a.a. |

*SELIC acumulada estimada: 14% a.a. em 2025-2026*

**Observações:**
- Quanto maior o prazo de espera, maior o valor absoluto recebido (SELIC corre a favor)
- Mas quanto maior o prazo, menor a TIR (capital imobilizado por mais tempo)
- O ponto ótimo está no equilíbrio entre deságio oferecido e prazo real de espera

### 5.3 Custo de Capital de Referência

Para avaliar se a operação é viável, comparar a TIR com alternativas de mercado:

| Alternativa | Retorno estimado 2025-2026 |
|-------------|---------------------------|
| CDI (pós-fixado) | ~14,25% a.a. |
| Tesouro IPCA+ 2029 | ~8% + IPCA (~14-16% nominal) |
| CRI/CRA AA (12 meses) | ~15-17% a.a. |
| FIDCs AA- (12 meses) | ~18-22% a.a. |
| **RPV previdenciária (prazo 18m)** | **~27% a.a. estimado** |
| **RPV trabalhista (prazo 12m)** | **~35% a.a. estimado** |

O mercado de RPVs oferece retorno superior ao mercado de crédito convencional — justificado pelo risco jurídico (IRDR 34, recurso em andamento) e pelo risco de liquidez (prazo de espera variável).

### 5.4 Deságio Adequado por Natureza e Prazo

Referência de mercado para deságio (percentual pago ao cedente sobre o valor de face):

| Natureza | Prazo estimado | Deságio de mercado típico | Retorno da compradora |
|----------|----------------|---------------------------|-----------------------|
| Trabalhista (pós-sentença, sem recurso) | 12-18 meses | 10-18% de deságio | 30-45% a.a. |
| BPC/LOAS pós-sentença | 12-24 meses | 15-22% de deságio | 25-40% a.a. |
| Previdenciário pós-sentença (fora TRF4) | 18-36 meses | 18-28% de deságio | 20-35% a.a. |
| Tributário restituição PJ | 12-36 meses | 12-20% de deságio | 25-40% a.a. |
| Servidor público pós-sentença | 18-36 meses | 15-25% de deságio | 20-35% a.a. |
| Saúde pública pós-sentença | 12-30 meses | 15-22% de deságio | 22-38% a.a. |
| Previdenciário com recurso pendente (alto risco) | 36-60 meses | 30-45% de deságio | 18-28% a.a. |

*Deságio = (1 - valor pago ao cedente / valor de face). Cedente recebe menos por receber antes.*

---

## PARTE VI — MODELO DE SCORING PARA PRECIFICAÇÃO

O scoring transforma variáveis qualitativas em um número que orienta o deságio e a decisão de compra.

### 6.1 Variáveis do Score

Cada operação recebe pontos em 5 dimensões:

| Dimensão | Peso | O Que Avalia |
|----------|------|--------------|
| Risco de cessão | 25% | Natureza do crédito + tribunal (TRF4 = bloqueio) |
| Fase processual | 25% | Distância até o recebimento (RPV expedida > liquidação > sentença) |
| Risco de reversão | 20% | Recurso pendente, probabilidade de reforma |
| Risco do ente devedor | 15% | União < Estado solvente < Município grande < Município pequeno |
| Perfil do cedente | 15% | Documentação limpa, sem penhoras, OAB ativo |

### 6.2 Tabela de Pontuação

**Dimensão 1 — Risco de Cessão (0 a 25 pts)**

| Situação | Pontos |
|----------|--------|
| Tributário (PJ) | 25 |
| Trabalhista | 22 |
| BPC/LOAS (assistencial) | 20 |
| Servidor público | 20 |
| Saúde pública | 18 |
| Responsabilidade civil do Estado | 18 |
| Previdenciário (fora TRF4) | 12 |
| Previdenciário (TRF4) | 0 — BLOQUEIO |

**Dimensão 2 — Fase Processual (0 a 25 pts)**

| Fase | Pontos |
|------|--------|
| RPV expedida — aguardando depósito | 25 |
| Liquidação concluída — aguardando expedição | 20 |
| Liquidação em andamento | 14 |
| Trânsito em julgado — sem liquidação | 8 |
| Acórdão favorável — pendente trânsito | 4 |
| Apenas sentença de 1ª instância | 2 |

**Dimensão 3 — Risco de Reversão (0 a 20 pts)**

| Situação | Pontos |
|----------|--------|
| Tese consolidada em RG/repetitivo | 20 |
| Sem recurso pendente, tese pacificada | 18 |
| Recurso pendente no TRF/TJ (baixo risco) | 12 |
| Recurso pendente no STJ/TST | 6 |
| Recurso com risco real de reversão total | 0 — BLOQUEIO |

**Dimensão 4 — Risco do Ente Devedor (0 a 15 pts)**

| Ente | Pontos |
|------|--------|
| União Federal (INSS, RFB) | 15 |
| Estado solvente (GO, PR, SC, ES, MG) | 13 |
| Estado médio risco (RJ, RS, BA, AM) | 9 |
| Município grande (> 500 mil hab.) | 10 |
| Município médio (100-500 mil hab.) | 7 |
| Município pequeno (< 100 mil hab.) | 3 |
| Estado/Município em recuperação fiscal | 1 |

**Dimensão 5 — Perfil do Cedente (0 a 15 pts)**

| Situação | Pontos |
|----------|--------|
| CPF regular + OAB ativo + sem penhoras + documentação completa | 15 |
| CPF regular + OAB ativo + 1 pendência menor | 10 |
| CPF regular + OAB ativo + 2+ pendências | 5 |
| Qualquer irregularidade grave (penhora, CPF irregular, OAB suspensa) | 0 — BLOQUEIO |

### 6.3 Interpretação do Score e Deságio Recomendado

| Score Total | Classificação | Deságio Recomendado | Ação |
|-------------|---------------|---------------------|------|
| 80-100 | Excelente | 8–14% | Operar com agilidade |
| 65-79 | Bom | 14–20% | Operar com cláusulas de proteção |
| 50-64 | Médio | 20–28% | Operar com due diligence reforçada |
| 35-49 | Fraco | 28–35% | Avaliar caso a caso — exigir garantias |
| 0-34 | Ruim | >35% ou rejeitar | Recomendar rejeição |
| BLOQUEIO | — | — | Rejeição automática |

### 6.4 Exemplo de Aplicação

**Caso: RPV previdenciária (fora TRF4), em liquidação, TRF3 (SP), INSS devedor, cedente limpo**

| Dimensão | Pontos |
|----------|--------|
| Risco de cessão: previdenciário fora TRF4 | 12 |
| Fase: liquidação em andamento | 14 |
| Risco de reversão: sem recurso, tese pacificada | 18 |
| Ente devedor: União/INSS | 15 |
| Perfil cedente: limpo | 15 |
| **TOTAL** | **74** |

Score 74 → Classificação **Bom** → **Deságio recomendado: 14–20%**

---

## PARTE VII — RISCOS OPERACIONAIS E FATORES DE DEMORA

### 7.1 Fatores que Aumentam o Prazo Além do Previsto

| Fator | Impacto no prazo | Mitigação |
|-------|------------------|------------|
| Recurso do INSS ao TRF | +12 a 24 meses | Verificar histórico do INSS de recorrer em casos similares |
| Recurso do INSS ao STJ/STF | +24 a 60 meses | Teses já pacificadas têm menos chance de recurso útil |
| Cálculo de liquidação contestado | +6 a 18 meses | Cálculo bem feito reduz impugnação |
| Expedição bloqueada por determinação judicial | Varia | Cláusula contratual de proteção |
| IRDR 34 — bloqueio de cessão | Indeterminado | NÃO operar previdenciário no TRF4 até STJ decidir |
| Mudança de teto da RPV pós-cessão | Zero a 3 meses | Monitorar SM anualmente |

### 7.2 Riscos de Reversão de Mérito

| Natureza | Risco de reversão | Observação |
|----------|-------------------|-------------|
| BPC/LOAS pós-sentença | Baixo (~5-10%) | INSS perde a maioria dos recursos |
| Incapacidade (B31) pós-sentença | Baixo-médio (~10-20%) | Recurso do INSS frequente mas pouco eficaz |
| Tributário — tese consolidada | Muito baixo (~2-5%) | Tese assentada em repetitivo/RG |
| Trabalhista pós-sentença | Baixo (~10-15%) | TRT pode reformar parcialmente |
| Revisão do Buraco Negro | Baixo (<5%) | Tese consolidada, sem decadência |
| Aposentadoria especial | Médio (~20-30%) | INSS recorre sistematicamente; cálculo complexo |
| Servidor público | Baixo-médio (~15-25%) | Ente recorre, mas reforma parcial é mais comum |

### 7.3 Riscos de Estrutura do Contrato de Cessão

Para cada operação, verificar:

- [x] Cessão formalizada por escritura pública ou instrumento particular com firma reconhecida
- [x] Protocolo da cessão no tribunal competente (procedimento específico por TRT/TRF)
- [x] Verificação de penhoras ou bloqueios sobre o crédito (sisbajud, renajud)
- [x] Conformidade com Resolução CJF 945/2025 (novas regras de cessão)
- [x] Cláusula resolutiva em caso de decisão STJ adversa (previdenciário fora TRF4)
- [x] Verificação de IR na fonte: RPVs têm retenção de IR dependendo da natureza
- [x] PSS (contribuição previdenciária do servidor) em créditos de servidores públicos

---

## PARTE VIII — SÍNTESE OPERACIONAL

### 8.1 Ranking de Atratividade — Visão Integrada

| # | Natureza | Prazo (meses) | TIR estimada | Risco cessão | Atratividade |
|---|----------|---------------|--------------|--------------|--------------|
| 1 | Trabalhista — pós-sentença sem recurso | 12-18 | 30-45% a.a. | Baixo | Alta |
| 2 | BPC/LOAS — pós-sentença | 12-24 | 25-40% a.a. | Baixo-médio | Alta |
| 3 | Tributário PJ — tese consolidada | 12-24 | 25-40% a.a. | Baixo | Alta |
| 4 | Servidor público — pós-sentença | 18-36 | 20-35% a.a. | Baixo | Alta |
| 5 | Saúde pública — pós-sentença | 12-30 | 22-38% a.a. | Baixo | Alta |
| 6 | Prev. (fora TRF4) — incapacidade pós-sentença | 18-36 | 20-35% a.a. | Médio (STJ) | Média |
| 7 | Prev. (fora TRF4) — Buraco Negro | 24-48 | 18-30% a.a. | Médio (STJ) | Média |
| 8 | Prev. (fora TRF4) — com recurso pendente | 36-60 | 15-25% a.a. | Alto (STJ) | Baixa |
| 9 | Prev. TRF4 (RS/SC/PR) | Indefinido | — | Muito alto | SUSPENSA |

### 8.2 Benchmarks Rápidos para Triagem de Ofertas

**Previdenciário (fora TRF4):**
- Prazo estimado conservador: 24 meses pós-cessão
- Deságio mínimo para TIR > CDI+5% (~19%): ~12% de deságio
- Deságio alvo para TIR > 25%: ~18-22%

**Trabalhista:**
- Prazo estimado conservador: 15 meses pós-cessão
- Deságio mínimo para TIR > CDI+5%: ~9% de deságio
- Deságio alvo para TIR > 30%: ~15-18%

**BPC/LOAS:**
- Prazo estimado conservador: 18 meses pós-cessão
- Deságio alvo para TIR > 25%: ~16-20%

**Servidor público:**
- Prazo estimado conservador: 24 meses pós-cessão
- Deságio alvo para TIR > 22%: ~15-20%

---

## FONTES E REFERÊNCIAS

- CNJ — Justiça em Números 2024: [cnj.jus.br](https://www.cnj.jus.br/wp-content/uploads/2025/02/justica-em-numeros-2024.pdf)
- CNJ — Judicialização Previdenciária 2024: [cnj.jus.br](https://www.cnj.jus.br/judicializacao-de-beneficios-previdenciarios-cresce-no-brasil/)
- CJF — Cronograma de Desembolso 2025: [cjf.jus.br](https://www.cjf.jus.br/cjf/noticias/2025/maio/cjf-comunica-a-publicacao-do-cronograma-de-desembolso-mensal-da-justica-federal)
- CJF — Pagamentos RPV 2025: R$ 2,6 bilhões a 172.818 segurados
- IBET — Tese do Século R$ 346 bilhões: [ibet.com.br](https://www.ibet.com.br/tese-do-seculo-ja-custou-r-346-bilhoes-a-uniao/)
- EC 113/2021: SELIC para precatórios e RPVs
- Resolução CJF 945/2025: novas regras de cessão de RPVs
- Banco Central do Brasil — histórico SELIC
- TST — Relatório Geral Estatística JT 2024
- TRF4 — IRDR 34 (26/11/2025) + STJ REsp 2217137/RS

---

*Documento de uso interno — Liberta Precatório*
*Para uso conjunto com Bloco 1 (Tetos por Ente) e Bloco 2 (Teses por Natureza)*
