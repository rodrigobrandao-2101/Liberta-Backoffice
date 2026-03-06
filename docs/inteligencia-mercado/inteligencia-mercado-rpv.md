# Inteligência de Mercado — RPV (Requisição de Pequeno Valor)
## Liberta Precatório — Documento Interno

> **Escopo:** Este documento mapeia toda a legislação, jurisprudência, particularidades por tribunal e dados de mercado relativos a RPVs no Brasil. Serve como base para construção de regras de negócio, análise de risco e estratégia comercial.
> **Última atualização:** Março de 2026

---

## ÍNDICE

1. [Fundamentos Jurídicos](#1-fundamentos-jurídicos)
2. [RPV — Conceito, Tetos e Regras Gerais](#2-rpv--conceito-tetos-e-regras-gerais)
3. [Tetos de RPV por Ente Federativo](#3-tetos-de-rpv-por-ente-federativo)
4. [Classificação por Natureza do Crédito](#4-classificação-por-natureza-do-crédito)
5. [Regras Especiais — Superpreferência e Multiplicadores](#5-regras-especiais--superpreferência-e-multiplicadores)
6. [Resolução CNJ nº 303/2019 e Emendas](#6-resolução-cnj-nº-3032019-e-emendas)
7. [Particularidades por Tribunal](#7-particularidades-por-tribunal)
8. [Mapa de Matérias — Tipos de Crédito que Geram RPV](#8-mapa-de-matérias--tipos-de-crédito-que-geram-rpv)
9. [Cessão de Crédito — Legislação, Vedações e Jurisprudência](#9-cessão-de-crédito--legislação-vedações-e-jurisprudência)
10. [Dados de Mercado — Jurimetria](#10-dados-de-mercado--jurimetria)
11. [Alertas de Risco por Tipo de Crédito](#11-alertas-de-risco-por-tipo-de-crédito)
12. [Fontes e Referências](#12-fontes-e-referências)

---

## 1. FUNDAMENTOS JURÍDICOS

### Base Constitucional

| Norma | Conteúdo | Relevância para RPV |
|-------|---------|-------------------|
| **Art. 100, CF/88** | Regime geral dos pagamentos da Fazenda Pública por sentença judicial | Base do sistema — precatório é a regra; RPV é exceção de pequeno valor |
| **Art. 100, §3º, CF/88** | Define o regime de RPV — dispensa de precatório para valores abaixo do teto | **Fundamento direto da RPV** |
| **Art. 87, ADCT** | Tetos subsidiários de RPV por ente (60/40/30 SM) até que cada ente edite lei própria | Aplica-se onde não há lei local |
| **EC nº 62/2009** | Reestruturação do regime de precatórios | Criou regime especial; consolidou RPV |
| **EC nº 113/2021** | Alterou índice de correção (fim da SELIC como juros; IPCA-E + 6% a.a. para créditos em geral) | Impacta valor dos créditos cedidos |
| **EC nº 114/2021** | Superpreferência alimentar para idosos, deficientes e doentes graves | Impacta ordem de pagamento de precatórios (não RPV diretamente) |

### Base Legal Infraconstitucional

| Norma | Conteúdo |
|-------|---------|
| **Lei 10.259/2001** | Juizados Especiais Federais — fixa teto RPV federal em 60 SM |
| **Lei 12.153/2009** | Juizados Especiais da Fazenda Pública (Estados e Municípios) |
| **Lei 9.099/1995** | Juizados Especiais Cíveis — base dos JEFs |
| **CPC, arts. 534–537** | Cumprimento de sentença contra a Fazenda Pública |
| **Lei 8.213/1991, art. 114** | **CRÍTICO:** Proíbe cessão de créditos previdenciários — fundamento da vedação |
| **Lei 9.494/1997** | Restrições à concessão de liminares contra a Fazenda Pública |

### Resoluções e Normas Administrativas

| Norma | Conteúdo |
|-------|---------|
| **Resolução CNJ nº 303/2019** | Regula gestão, expedição, correção e procedimentos de precatórios e RPVs |
| **Resolução CNJ nº 327/2020** | Primeira emenda à 303/2019 |
| **Resolução CNJ nº 365/2021** | Adapta à EC 113/2021 — novos índices |
| **Resolução CNJ nº 448/2022** | Ajustes operacionais — SisPreq |
| **Resolução CNJ nº 613/2025** | Emenda mais recente — cálculos com data-base a partir de set/2025 |
| **SisPreq (Sistema Nacional de Precatórios)** | Sistema do CNJ para gestão unificada; implementação progressiva nos tribunais |

---

## 2. RPV — CONCEITO, TETOS E REGRAS GERAIS

### O que é RPV

A Requisição de Pequeno Valor (RPV) é a forma de pagamento judicial de dívidas do Poder Público **abaixo do teto definido em lei** pelo ente devedor. Diferente do precatório, **não entra em fila cronológica** — o ente tem prazo de **60 dias** para pagar após a expedição da requisição.

### Comparativo RPV × Precatório

| Critério | RPV | Precatório |
|---------|-----|-----------|
| Valor | Abaixo do teto | Acima do teto |
| Prazo de pagamento | **60 dias** após expedição | Exercício seguinte (fila cronológica) |
| Fila | **Não tem fila** | Sim (cronológica por data de apresentação) |
| Liquidez | **Alta** | Baixa a média |
| Transferência | Possível | Possível |
| Risco de calote | **Muito baixo** (curto prazo) | Maior (depende de orçamento do ente) |
| Atrativo para cessão | **Alta liquidez** | Depende do ente e da fila |

### Regra Geral de Teto (ADCT, art. 87) — Ausência de Lei Própria

| Ente | Teto |
|------|------|
| União | 60 salários mínimos |
| Estados e DF | 40 salários mínimos |
| Municípios | 30 salários mínimos |

> **Importante:** O STF (Tema 792) decidiu que **entes podem reduzir** o teto por lei própria (respeitando capacidade financeira e proporcionalidade), mas **não podem aumentá-lo** acima dos limites do ADCT.

---

## 3. TETOS DE RPV POR ENTE FEDERATIVO

### União Federal

| Ente Devedor | Teto RPV | Base Legal |
|-------------|---------|-----------|
| União (INSS, Receita, demais autarquias federais) | **60 salários mínimos** | Lei 10.259/2001 |

Em 2025: salário mínimo = R$ 1.518,00 → **teto federal ≈ R$ 91.080,00**

### Estados e Distrito Federal

> ⚠️ **Atenção operacional:** Vários estados têm **lei própria reduzindo o teto**, às vezes de forma expressiva. Sempre verificar a lei estadual vigente antes de avaliar um crédito estadual.

| Estado | Teto RPV | Observação |
|--------|---------|-----------|
| **São Paulo** | ~R$ 15.566 (440 UFESP) | Lei própria em UFESP — muito abaixo dos 40 SM do ADCT. ⚠️ UFESP é atualizada em janeiro de cada ano — verificar valor vigente de 2026 antes de calcular teto |
| **Pará** | 30 SM (≈ R$ 45.540) | Reduziu de 40 para 30 SM — Lei Estadual nº 11.091/2025 |
| **Minas Gerais** | 40 SM (≈ R$ 60.720) | Segue ADCT. Estado em regime de recuperação fiscal (LRF) — monitorar capacidade de pagamento |
| **Rio de Janeiro** | A verificar — lei própria | ⚠️ Histórico severo de inadimplência em precatórios. Verificar legislação estadual e situação de caixa antes de operar |
| **Goiás** | 40 SM (≈ R$ 60.720) | ⚠️ Estado em Regime de Recuperação Fiscal (RRF) — restrições severas de gastos. Monitorar se há atraso ou suspensão de pagamentos de RPV |
| **Bahia** | 40 SM (≈ R$ 60.720) | Regra ADCT |
| **Rio Grande do Sul** | 40 SM (≈ R$ 60.720) | Regra ADCT (⚠️ IRDR 34 — atenção para créditos previdenciários). Crise fiscal após catástrofe climática de 2024 — verificar situação do ente devedor para créditos estaduais |
| **Paraná** | 40 SM (≈ R$ 60.720) | Regra ADCT (⚠️ IRDR 34) |
| **Santa Catarina** | 40 SM (≈ R$ 60.720) | Regra ADCT (⚠️ IRDR 34) |
| **Demais estados** | 40 SM (≈ R$ 60.720) | Verificar se há lei própria |

> 📌 **Regra prática:** Sempre verificar a lei estadual do ente devedor. O teto do ADCT (40 SM) só se aplica na **ausência** de lei estadual própria.

### Municípios

| Situação | Teto RPV |
|---------|---------|
| Sem lei própria | 30 SM (≈ R$ 45.540) |
| Com lei própria | Conforme a lei — pode ser menor (ex: Município de SP usa UFESP, valor muito reduzido) |

> ⚠️ **Municípios são o maior ponto de atenção:** São mais de 5.500 municípios, muitos com leis próprias, índices locais e capacidade fiscal variável. Risco de inadimplência é significativamente maior que União e Estados de grande porte.

---

## 4. CLASSIFICAÇÃO POR NATUREZA DO CRÉDITO

A natureza do crédito é fundamental para:
1. Definir a **ordem de prioridade** de pagamento (no caso de precatórios)
2. Determinar se a **cessão é permitida** (créditos previdenciários têm restrições graves)
3. Avaliar o **perfil de risco** do crédito

### Natureza Alimentar

Definida pelo art. 100, §1º CF. Compreendem:
- Salários, vencimentos, proventos, pensões e complementações
- Benefícios previdenciários (INSS)
- Indenizações por **morte ou invalidez** fundadas em responsabilidade civil
- Créditos trabalhistas

**Para RPV:** A natureza alimentar não altera o prazo de 60 dias (RPV já tem liquidez imediata). Porém, identifica se o crédito está sujeito à vedação de cessão (previdenciário = art. 114 da Lei 8.213/91).

### Natureza Comum

Todos os demais:
- Restituições tributárias
- Desapropriações
- Indenizações patrimoniais (dano material puro)
- Indenizações por responsabilidade civil não enquadradas como alimentares

---

## 5. REGRAS ESPECIAIS — SUPERPREFERÊNCIA E MULTIPLICADORES

### Super RPV (Triplicidade)

Credores com direitos preferenciais podem receber RPV em valor **até o triplo** do teto normal:

| Beneficiário | Condição | Multiplicador |
|-------------|---------|--------------|
| Idoso | ≥ 60 anos | Até 3× o teto |
| Pessoa com deficiência | Comprovada | Até 3× o teto |
| Portador de doença grave | Comprovada | Até 3× o teto |

**Base legal:** Art. 100, §2º CF; Resolução CNJ 303/2019.

**Exemplo (União):** Teto normal = 60 SM. Com superpreferência → até 180 SM em RPV (≈ R$ 273.240 em 2025).

> ⚠️ **Impacto operacional:** RPVs com multiplicador têm valor significativamente maior — oportunidade de ticket maior, mas exige verificação do requisito habilitante (laudo médico, certidão de nascimento, etc.).

### A "Zona 60–180 SM" — Super RPV vs. Precatório com Prioridade

Um ponto técnico importante que gera confusão operacional:

| Faixa de Valor (União) | Instrumento | Prazo de Pagamento | Observação |
|------------------------|-------------|-------------------|-----------|
| Até 60 SM (≈ R$ 91 mil) | RPV normal | 60 dias corridos | Regra geral |
| Entre 60 SM e 180 SM (com superpreferência) | **RPV pela triplicidade** | 60 dias corridos | O teto triplicado **é RPV**, não precatório |
| Acima de 180 SM (com superpreferência) ou acima de 60 SM (sem) | Precatório alimentar preferencial | Exercício seguinte, com prioridade máxima | Fila separada mas NÃO é 60 dias |

> ⚠️ **Impacto comercial:** Créditos na faixa 60–180 SM de beneficiários com superpreferência (idoso, deficiente, doente grave) têm **liquidez de RPV** (60 dias) mas **ticket médio 2–3× maior**. São os créditos mais atrativos do mercado — maior margem sem sacrificar a liquidez. Verifique sempre o requisito habilitante (laudo médico, certidão de nascimento) antes de precificar.

> 📌 **Validar estratégia comercial:** Confirme com o jurídico se a empresa trata esses créditos como RPV (habilitação direta) ou como precatório expedito. O procedimento de habilitação é diferente — o requerimento de superpreferência deve constar na petição de habilitação.

### Crédito Superpreferencial (EC 114/2021) — Só Precatório

O quíntuplo (5×) se referia a regime especial de precatórios durante vigência da EC 62/2009. Para RPV, o limite é o **triplo** (3×).

---

## 6. RESOLUÇÃO CNJ Nº 303/2019 E EMENDAS

### O que é

A Resolução CNJ nº 303, de 18 de dezembro de 2019, é a **norma administrativa central** que regula toda a gestão operacional de precatórios e RPVs no âmbito do Poder Judiciário brasileiro. Todos os tribunais devem adequar seus regulamentos internos a ela.

### Principais Dispositivos Relevantes

#### Expedição da RPV
- Expedida pelo **juízo da execução** ao tribunal competente em formato padronizado
- Deve conter: ente devedor, valor, natureza (alimentar/comum), dados do credor e do advogado, conta bancária para pagamento
- Adoção de **sistema eletrônico** obrigatória (SisPreq em implementação progressiva)

#### Correção Monetária e Juros
| Período | Índice |
|---------|--------|
| Até agosto/2025 | Regido pela Resolução CNJ 303/2019 original (IPCA-E + 6% a.a. para créditos em geral pós-EC 113) |
| A partir de setembro/2025 | Resolução CNJ 613/2025 — novos critérios de data-base |

**Para créditos previdenciários:** INPC + juros previdenciários (geralmente 0,5% ao mês = 6% a.a.)

#### Prazo de Pagamento da RPV
- Ente devedor tem **60 dias** após a expedição da RPV para pagamento
- O prazo corre da **intimação do ente**, não da expedição
- Descumprimento do prazo: sequestro de verbas públicas (art. 100, §6º CF)

> **Detalhe técnico crítico — Dias Corridos vs. Dias Úteis:**
>
> Para a **Fazenda Federal (União/INSS)**, o prazo de 60 dias é expressamente **dias corridos** (art. 17 da Lei 10.259/2001). Não há margem para interpretação.
>
> Para **Estados e Municípios**, o art. 100, §3º CF não especifica a contagem. Alguns entes tentam argumentar aplicação do CPC (dias úteis), o que estenderia o prazo efetivo para ~84 dias. A **jurisprudência majoritária rejeita** esse argumento — o prazo de 60 dias do art. 100 CF é constitucional e conta em dias corridos. Mas o risco de contestação existe, especialmente em municípios menores, e deve entrar no cálculo de TIR em cenário pessimista.
>
> **Impacto no cálculo de rentabilidade:** Diferença de ~24 dias no prazo = diferença de ~0,3–0,4 pontos percentuais na TIR anualizada. Modelar sempre com 60 dias corridos como base e 84 dias úteis como stress test.

#### Retenção de IR na Fonte (RRA) — Impacto no Fluxo de Caixa

**Atenção operacional:** Ao receber o pagamento da RPV, **o ente devedor retém IR na fonte** antes de depositar o valor líquido. A alíquota efetiva pode ser de **3% a 27,5%** dependendo do valor total e do método de cálculo (RRA ou tabela progressiva normal).

| Situação | Retenção Típica | Impacto para a Liberta |
|---------|----------------|----------------------|
| Crédito tributário (restituição de PIS/COFINS, ICMS) | Geralmente sem retenção | ✅ Fluxo integral |
| Crédito alimentar (servidor, benefício) — com RRA | ~3–15% retido na fonte | ⚠️ Valor líquido chega menor |
| Crédito alimentar sem aplicação de RRA | 27,5% na faixa mais alta | ⚠️ Retenção severa |

> **Regra RRA (Rendimentos Recebidos Acumulados):** Divide o valor total pelo número de meses a que se refere o crédito (mínimo 12 meses), aplica a tabela progressiva sobre a parcela mensal equivalente e multiplica pelo número de meses. Resulta em alíquota efetiva muito menor que a progressiva direta. É **direito do contribuinte** — o advogado deve requerer expressamente nos autos.
>
> **Impacto no deságio:** O valor líquido que chega à conta do cessionário (Liberta) é o valor bruto **menos a retenção de IR**. O cedente é quem sofre a retenção — se a cessão foi pelo valor líquido esperado, a Liberta recebe o bruto e repassou ao cedente menos. Mas se o contrato foi calculado sobre o valor bruto, a retenção **reduz a rentabilidade efetiva**. **Clareza contratual sobre base de cálculo (bruto ou líquido) é essencial.**

#### Sequestro de Verbas por Descumprimento
Mecanismo constitucional: se o ente não pagar a RPV no prazo de 60 dias, o credor pode requerer **sequestro da conta bancária do ente** para satisfação do crédito. Isso torna o risco de inadimplência da RPV muito baixo.

#### Fracionamento
- É **vedado** o fracionamento do crédito para enquadrá-lo como RPV (art. 100, §8º CF)
- Exceção: superpreferência alimentar — permite fracionamento até o triplo do teto para pagamento prioritário

### Emendas à Resolução 303/2019

| Resolução | Ano | Alteração Principal |
|-----------|-----|-------------------|
| 327/CNJ | 2020 | Ajustes operacionais pós-EC 62 |
| 365/CNJ | 2021 | Adapta índices à EC 113/2021 (IPCA-E + juros) |
| 390/CNJ | 2021 | Disposições complementares |
| 431/CNJ | 2021 | Ajustes pós-EC 114/2021 (superpreferência) |
| 438/CNJ | 2021 | Normas complementares |
| 448/CNJ | 2022 | Integração com SisPreq |
| 482/CNJ | 2022 | Aperfeiçoamentos operacionais |
| 613/CNJ | 2025 | Nova regra de data-base (cálculos a partir de set/2025) |

---

## 7. PARTICULARIDADES POR TRIBUNAL

### Justiça Federal — TRFs (Créditos contra a União)

| Tribunal | Região | Estados | Particularidade |
|---------|--------|---------|----------------|
| **TRF1** | 1ª Região | AC, AM, AP, BA, DF, GO, MA, MG, MT, PA, PI, RO, RR, TO | Maior volume de processos previdenciários do país |
| **TRF2** | 2ª Região | ES, RJ | Rio de Janeiro concentra expressivo volume de créditos tributários e de servidores |
| **TRF3** | 3ª Região | MS, SP | São Paulo = maior volume absoluto de créditos tributários federais |
| **TRF4** | 4ª Região | PR, RS, SC | ⚠️ **IRDR 34** — vedação à cessão de créditos previdenciários vigente |
| **TRF5** | 5ª Região | AL, CE, PB, PE, RN, SE | Alto volume de previdenciário (BPC/LOAS dominante) |
| **TRF6** | 6ª Região | MG | Criado em 2022; desafogou o TRF1 em MG |

#### JEF — Juizado Especial Federal
- Competência: causas até **60 SM** contra a União (= teto da RPV federal)
- Praticamente toda RPV federal nasce no JEF
- Turmas Recursais (não TRF) julgam recursos de JEF — rito mais rápido
- Grande maioria dos processos: **previdenciário e assistencial**

### Justiça Estadual — TJs (Créditos contra Estados e Municípios)

| Tribunal | UF | Particularidades Relevantes |
|---------|----|-----------------------------|
| **TJSP** | SP | Teto RPV estadual = ~R$15.566 (UFESP) — muito baixo. Volume altíssimo de servidores e tributário |
| **TJRJ** | RJ | Estado com histórico de inadimplência grave em precatórios. RPV tem prazo respeitado |
| **TJMG** | MG | Grande volume de servidores estaduais. Teto 40 SM |
| **TJRS** | RS | ⚠️ IRDR 34 (TRF4 — só para créditos FEDERAIS previdenciários). Crise fiscal do Estado |
| **TJPR** | PR | Regular. Tempo médio de pagamento de RPV caiu para ~70 dias em 2024 |
| **TJBA** | BA | Regular. Volume relevante de saúde pública |
| **TJCE**, **TJPE**, **TJMA** | NE | Alto volume BPC/LOAS estadual, desapropriação |

#### JEFP — Juizado Especial da Fazenda Pública (Lei 12.153/2009)
- Competência: causas até **60 SM** (ou teto do estado/município, se menor) contra estados e municípios
- Não existe em todos os estados — onde não existe, usa-se vara de fazenda pública comum
- Rito simplificado; sem custas em 1ª instância
- Sem reexame necessário até 40 SM

### Justiça do Trabalho (Créditos Trabalhistas Contra Ente Público)

- TRTs (24 regionais)
- Créditos trabalhistas de servidores **celetistas** contra entes públicos viram RPV/precatório na JT
- Rito de execução específico
- Sequestro de verbas por descumprimento do prazo da RPV também se aplica

---

## 8. MAPA DE MATÉRIAS — TIPOS DE CRÉDITO QUE GERAM RPV

> Os créditos abaixo estão ordenados por **relevância para cessão** — combinando volume de mercado, liquidez e perfil de risco.

---

### 8.1 PREVIDENCIÁRIO (INSS) — Alto Volume | Atenção Máxima na Cessão

**Ente devedor:** INSS (autarquia federal)
**Tribunal:** JEF / TRF
**Natureza:** Alimentar
**Teto:** 60 SM (federal)

> ⚠️ **RISCO CRÍTICO:** Art. 114 da Lei 8.213/91 proíbe cessão de créditos previdenciários. IRDR 34/TRF4 vedou a cessão no âmbito do TRF4. STJ pode generalizar a vedação para todo o país via recursos repetitivos. **Consultar seção 9 antes de operar nesta categoria.**

| Tipo de Processo | Discussão |
|----------------|-----------|
| Concessão de benefício negado administrativamente | Aposentadoria, pensão, auxílio-doença, BPC/LOAS |
| Revisão do valor do benefício | Correção da RMI, índices de reajuste |
| Aposentadoria especial | Reconhecimento de atividade insalubre/perigosa |
| Tempo rural | Trabalho rural não reconhecido pelo INSS |
| Conversão de tempo especial em comum | Equiparação de períodos |
| Pensão por morte | Dependência econômica contestada |
| Salário-maternidade | Negado administrativamente |
| Auxílio-acidente | Sequela não reconhecida |
| BPC/LOAS | Deficiente ou idoso hipossuficiente com benefício negado |
| Auxílio-doença | Alta precoce indevida |
| Acréscimo de 25% | Aposentado por invalidez que necessita de cuidador |
| Diferenças de reajuste | IRSM, INPC, índices históricos |

---

### 8.2 TRIBUTÁRIO FEDERAL — Alto Valor | Cessão Permitida

**Ente devedor:** União (Receita Federal)
**Tribunal:** JF / TRF
**Natureza:** Comum (maioria)
**Teto:** 60 SM (federal)

| Tipo de Processo | Discussão | Volume |
|----------------|-----------|--------|
| Exclusão do ICMS da base PIS/COFINS | Tese do "século" — RE 574.706 STF | ⭐⭐⭐⭐⭐ |
| FGTS — expurgos inflacionários | Planos Verão e Collor | ⭐⭐⭐⭐ |
| Contribuições sobre verbas indenizatórias | INSS patronal indevido | ⭐⭐⭐ |
| Restituição de IR retido indevidamente | Rendimentos acumulados (RRA) | ⭐⭐⭐ |
| Crédito-prêmio IPI exportação | Decreto-Lei 491/69 | ⭐⭐ |
| Contribuições Sistema S | SESC, SENAI, SESI, SEBRAE | ⭐⭐ |
| Exclusão ISS da base PIS/COFINS | Seguindo a tese do ICMS | ⭐⭐⭐ |
| CSLL | Questões diversas de base de cálculo | ⭐⭐ |
| IOF | Cobranças indevidas em operações financeiras | ⭐ |
| Planos econômicos — contas bancárias | Correção monetária (Bresser, Verão, Collor) | ⭐⭐ |

---

### 8.3 SERVIDOR PÚBLICO FEDERAL — Volume Médio | Cessão Permitida

**Ente devedor:** União e autarquias federais
**Tribunal:** JF / TRF (para servidores estatutários)
**Natureza:** Alimentar
**Teto:** 60 SM (federal)

| Tipo de Processo | Discussão |
|----------------|-----------|
| Quintos/décimos de função comissionada | Incorporação de função de confiança |
| Revisão geral anual não concedida | Art. 37, X CF — reposição da inflação |
| Gratificações incorporadas | GDATA, GDASST, GDPST, diversas |
| Adicional de insalubridade/periculosidade | Não pago ou calculado incorretamente |
| Progressão/promoção negada | Remuneração das diferenças |
| VPNI | Vantagem Pessoal Nominalmente Identificada |
| Anistiado político | Reparação econômica — Lei 10.559/02 |
| Licença-prêmio convertida em pecúnia | Não gozada |
| Reintegração com salários do período | Exoneração ilegal |

---

### 8.4 SERVIDOR PÚBLICO ESTADUAL — Volume Alto | Cessão Permitida

**Ente devedor:** Estados
**Tribunal:** TJ estadual / JEFP
**Natureza:** Alimentar
**Teto:** Teto estadual (verificar lei própria)

Mesmas matérias que servidor federal, aplicadas ao regime estadual. **São Paulo** tem volume altíssimo mas teto de RPV muito baixo (~R$15.566). Estados como MG, BA, RS têm teto em 40 SM.

---

### 8.5 SERVIDOR PÚBLICO MUNICIPAL — Volume Médio | Atenção ao Risco Fiscal

**Ente devedor:** Municípios
**Tribunal:** TJ estadual / JEFP
**Natureza:** Alimentar
**Teto:** Teto municipal (verificar lei própria; padrão = 30 SM)

> ⚠️ **Risco:** Municípios pequenos podem ter dificuldade fiscal para honrar o prazo de 60 dias. Mesmo com a possibilidade de sequestro, a operação pode se complicar em municípios com caixa crítico.

---

### 8.6 RESPONSABILIDADE CIVIL DO ESTADO — Volume Médio | Cessão Permitida

**Ente devedor:** União, Estados, Municípios
**Tribunal:** Conforme o ente
**Natureza:** Alimentar (morte/invalidez) ou Comum (demais)

| Tipo de Processo |
|----------------|
| Morte por omissão/ação de agente público |
| Invalidez causada por agente público |
| Erro médico em hospital público |
| Preso morto ou agredido no sistema prisional |
| Acidente em obra ou via pública |
| Prisão indevida / violência policial |
| Tratamento médico negado (saúde pública) |
| Omissão de socorro — SAMU, UPA |

---

### 8.7 TRIBUTÁRIO ESTADUAL — Volume Médio | Cessão Permitida

**Ente devedor:** Estados
**Tribunal:** TJ estadual
**Natureza:** Comum

| Tipo de Processo |
|----------------|
| ICMS — créditos extemporâneos, substituição tributária indevida |
| IPVA — cobranças com base de cálculo incorreta |
| ITCMD — alíquotas progressivas antes de regulamentação |

---

### 8.8 TRIBUTÁRIO MUNICIPAL — Volume Médio | Atenção ao Ente

**Ente devedor:** Municípios
**Tribunal:** TJ estadual
**Natureza:** Comum

| Tipo de Processo |
|----------------|
| IPTU — progressividade inconstitucional (pré-EC 29/2000) |
| ISS — base de cálculo indevida ou serviços não tributáveis |
| ITBI — base de cálculo superior ao valor de mercado |

---

### 8.9 SAÚDE PÚBLICA — Volume Crescente

**Ente devedor:** Estados e Municípios (majoritariamente)
**Tribunal:** TJ estadual / JEFP
**Natureza:** Alimentar

| Tipo de Processo |
|----------------|
| Fornecimento de medicamento de alto custo negado pelo SUS |
| Internação em UTI negada pelo sistema público |
| Cirurgia negada com dano ao paciente |
| Tratamento oncológico negado |
| Home care negado |

---

### 8.10 DESAPROPRIAÇÃO — Volume Específico | Natureza Comum

**Ente devedor:** União (INCRA), Estados, Municípios
**Tribunal:** JF (INCRA) ou TJ estadual
**Natureza:** Comum

| Tipo de Processo |
|----------------|
| Desapropriação por utilidade pública (DL 3.365/41) |
| Desapropriação por interesse social — reforma agrária |
| Desapropriação indireta (apossamento sem processo) |
| Desapropriação para fins urbanísticos |
| Desapropriação para unidades de conservação ambiental |
| Servidão administrativa |

> **Atenção STF Tema 865:** Complementação de desapropriação pode ou não exigir precatório — analisar caso a caso.

---

## 9. CESSÃO DE CRÉDITO — LEGISLAÇÃO, VEDAÇÕES E JURISPRUDÊNCIA

> Esta é a seção **mais crítica** para o negócio da Liberta. Define o que pode e o que não pode ser comprado.

### Regra Geral — Cessão de Crédito é Permitida

O Código Civil (arts. 286–298) permite a cessão de créditos como regra geral. O credor pode transferir seu direito a terceiro mediante instrumento de cessão, independentemente da anuência do devedor (basta notificá-lo).

**Para RPVs:** A cessão é operacionalmente simples — o cessionário é habilitado nos autos e recebe o pagamento diretamente.

### Vedação Específica — Créditos Previdenciários

#### Fundamento Legal
**Art. 114 da Lei nº 8.213/1991:**
> *"Salvo quanto a prestações já vencidas e não pagas, o direito às prestações previdenciárias é inalienável, impenhorável e não pode ser objeto de garantia ou cessão."*

#### Jurisprudência Consolidada

| Decisão | Conteúdo | Impacto |
|---------|---------|---------|
| **STF — Tema 361** | Cessão de crédito não altera a **natureza** do crédito (alimentar continua alimentar mesmo após a cessão) | Cessão válida, mas natureza mantida |
| **STJ — Entendimento histórico** | Nulidade da cessão de crédito previdenciário com base no art. 114 da Lei 8.213/91 | ⚠️ Vedação |
| **TRF4 — IRDR 34** (julgado 26/11/2025) | **Proibida** a cessão de créditos de origem previdenciária — precatório ou RPV — no âmbito da 4ª Região (RS, SC, PR) | ⚠️ **Vedação** nos estados do Sul |
| **STJ — Recursos Repetitivos (pendente)** | Min. Moura Ribeiro afetou a questão ao sistema de repetitivos (out/2025) — suspensão de processos até julgamento | ⚠️ **Risco nacional** — aguardar |

#### Mapa de Risco — Cessão de Crédito Previdenciário

| Região/Tribunal | Situação Atual | Risco |
|----------------|---------------|-------|
| TRF4 (RS, SC, PR) | **Proibida** — IRDR 34 em vigor | 🔴 ALTO |
| TRF1, 2, 3, 5, 6 | Sem vedação expressa local — mas art. 114 existe | 🟡 MÉDIO |
| TJs estaduais (créditos estaduais) | Art. 114 não se aplica (é lei federal para INSS) | 🟢 BAIXO |
| **Todo o país** | STJ pode generalizar a vedação via repetitivos | 🟠 EM OBSERVAÇÃO |

#### Conclusão Operacional para Créditos Previdenciários

1. **TRF4 (RS, SC, PR):** Não operar cessão de créditos previdenciários enquanto o IRDR 34 estiver vigente.
2. **Demais regiões:** Operar com cautela — analisar se o juízo local admite a cessão. Risco de reversal pelo STJ.
3. **Monitorar:** O julgamento do STJ nos repetitivos pode definir a regra nacional. Se proibir, impacto severo no segmento previdenciário.

### Estratégias de Contorno — Zona Cinzenta Jurídica

#### Tese da "Entrega do Crédito" — Contrato de Investimento ou Mandato com Proveito Econômico

Diante da vedação do art. 114 e do IRDR 34, algumas empresas do setor estão estruturando a operação **não como cessão de crédito**, mas como **contrato de investimento com mandato** ou **gestão de crédito com proveito econômico**. A lógica é:

- O credor **não cede** o crédito (para não incidir no art. 114)
- O credor **outorga procuração irrevogável** à empresa para receber o pagamento
- A empresa adianta ao credor um valor (equivalente ao preço da cessão)
- Quando o pagamento é recebido pela procuração, o adiantamento é quitado e o saldo (se houver) é repassado

| Aspecto | Cessão Tradicional | Mandato/Investimento |
|---------|-------------------|---------------------|
| Transferência de titularidade | Sim — habilitação do cessionário nos autos | Não — cedente permanece nos autos |
| Risco do art. 114 | Direto | Mitigado (forma distinta) |
| Risco de anulação judicial | Presente | Menor — não há cessão formal |
| Risco operacional | Baixo após habilitação | Maior — o pagamento vai para o cedente |
| Risco de morte/incapacidade do cedente | Baixo | **Alto** — procuração se extingue |
| Reconhecimento jurisprudencial | Consolidado | Ainda incerto — poucos precedentes |

> ⚠️ **Avaliação de risco:** Esta estrutura é **zona cinzenta jurídica**. Pode ser questionada pelos tribunais como fraude à vedação do art. 114 (art. 166 CC — negócio jurídico com objeto ilícito indireto). O TRF4 já demonstrou postura restritiva; é razoável supor que rejeitaria essa estrutura também.
>
> **Recomendação:** Não adotar sem parecer jurídico específico e sem cláusulas robustas de proteção ao adiantamento (hipoteca, garantia pessoal, seguro). Monitorar o julgamento do STJ — se confirmar a vedação nacional da cessão, a pressão por estruturas alternativas vai aumentar e a jurisprudência sobre elas se consolidará mais rapidamente.

#### Bloqueio Sistêmico no TRF4 — e-proc

> ⚠️ **Alerta operacional (TRF4, fim de 2025):** O sistema processual eletrônico do TRF4 (**e-proc**) passou a **bloquear automaticamente** a troca de titularidade em requisições de origem previdenciária. Mesmo que um juízo de 1ª instância aceite a habilitação do cessionário, o sistema rejeita a alteração da conta bancária. Isso significa que **o pagamento vai para o cedente**, não para a Liberta — eliminando a segurança operacional da cessão mesmo nos casos em que o juízo local seja favorável à cessão.
>
> **Consequência prática:** No âmbito do TRF4, a cessão de crédito previdenciário está bloqueada tanto juridicamente (IRDR 34) quanto operacionalmente (e-proc). **Não há caminho funcional para cessar esse tipo de crédito na 4ª Região.**

### O Que Pode Ser Cedido Sem Restrição Legal

| Tipo de Crédito | Cessão |
|----------------|--------|
| Tributário (restituição de tributos) | ✅ Permitida |
| Servidor público — diferenças salariais, gratificações | ✅ Permitida |
| Responsabilidade civil do Estado | ✅ Permitida |
| Desapropriação | ✅ Permitida |
| Saúde pública (fornecimento de medicamento) | ✅ Permitida |
| Trabalhista (servidor celetista) | ✅ Permitida |
| **Previdenciário (INSS)** | ⚠️ **Questionável / Vedada em alguns tribunais** |

### Procedimento Operacional da Cessão

1. Instrumento particular ou público de cessão assinado entre cedente e cessionário
2. Notificação do ente devedor (não exige anuência — apenas ciência)
3. Habilitação do cessionário nos autos (petição ao juízo com o instrumento)
4. Troca da conta bancária para recebimento (intimação ao contador/setor financeiro do tribunal)
5. Pagamento realizado diretamente ao cessionário

---

## 10. DADOS DE MERCADO — JURIMETRIA

### Tamanho do Mercado

| Métrica | Valor | Fonte |
|---------|-------|-------|
| Dívida total de precatórios (Brasil) | **R$ 310,9 bilhões** | Mapa Anual CNJ, dez/2024 |
| Precatórios inscritos para 2025 (União) | **R$ 70,7 bilhões** | SOF/MPO, 2024 |
| Precatórios antecipados pela União em 2024 | R$ 30,1 bilhões | Agência Brasil, fev/2024 |
| Mercado de cessão (precatórios até R$5M + RPVs) | **~R$ 60 bilhões/ano** | Estimativa de mercado |
| Cessões intermediadas pela Precato (fintech) | R$ 286M (2024) → R$ 600M (meta 2025) | Diário do Comércio |

### Volume de RPVs Federais (Justiça Federal)

| Período | Valor Pago | Processos | Beneficiários |
|---------|-----------|-----------|--------------|
| Dez/2023 | R$ 2,2 bi | 101 mil | 132 mil |
| Jan–Mar/2024 (TRF6 apenas) | R$ 708 mi | — | — |
| Jun/2024 | R$ 2,4 bi | 163 mil | 208 mil |
| Nov/2024 | — | 163 mil | 205 mil |
| Estimativa anual 2024 | **~R$ 9–12 bi** | ~600 mil | ~800 mil |

### Composição das RPVs Federais por Matéria

| Matéria | Participação | Notas |
|---------|-------------|-------|
| **Previdenciário e Assistencial** | **~86%** | Dominante absoluto em quantidade |
| Tributário federal | ~8% | Maior valor médio por processo |
| Servidor federal | ~4% | |
| Demais | ~2% | |

### Crescimento e Tendência

- Volume de precatórios federais cresce **~18% ao ano** (2023→2024)
- Judicialização da saúde: crescimento acelerado (Estado e Município)
- Teses tributárias novas surgem periodicamente no STF/STJ — criam ondas de novos processos
- Previdenciário: reforma da previdência (EC 103/2019) gerou nova onda de ações sobre regras de transição

### Oportunidade — "Resíduos" de Precatórios Convertidos em RPV

As ECs 113 e 114/2021 alteraram as regras de atualização e correção de precatórios, e o regime de parcelamento da EC 62/2009 gerou cortes orçamentários ao longo de anos. O resultado foi a criação de **"resíduos"** — diferença entre o valor original do precatório e o que foi efetivamente pago em parcelas anteriores.

**Por que isso importa:** Esses resíduos, quando calculados e atualizados, **podem ficar abaixo do teto de RPV** do ente devedor. Se isso ocorrer, o credor pode requerer a **conversão do saldo residual em RPV**, saindo da fila de precatórios e ganhando liquidez imediata (60 dias).

| Cenário | Situação |
|---------|---------|
| Precatório original: R$ 500 mil | Na fila há 6 anos |
| Parcelas já recebidas: R$ 480 mil | Resíduo atualizado: R$ 42 mil |
| Teto RPV do ente: 60 SM ≈ R$ 91 mil | ✅ Resíduo abaixo do teto → pode virar RPV |

> **Estratégia de originação ("pesca em aquário"):** Credores com precatórios antigos e parcialmente pagos raramente sabem desta possibilidade. Advogados que acompanham precatórios de longa data são os melhores canais de acesso a esses créditos. **Volume estimado:** centenas de milhões em resíduos elegíveis no mercado, pouco explorados.

### Tempo de Expedição — O Fator Oculto que Destrói a TIR

O prazo de 60 dias para pagamento é conhecido. O que frequentemente não é modelado é o **tempo entre o trânsito em julgado e a expedição da RPV** — o "limbo processual".

| Etapa | O que acontece | Controle da Liberta |
|-------|---------------|---------------------|
| Trânsito em julgado | Sentença definitiva | Nenhum |
| Liquidação/Cálculo | Contador judicial elabora memória de cálculo | Monitorar |
| Intimação do ente devedor para pagar ou impugnar | Pode haver impugnação → novo prazo | Monitorar |
| Expedição da RPV pelo juízo | **Aqui começa o prazo de 60 dias** | Monitorar |
| Pagamento pelo ente | 60 dias da expedição | Monitorar/Sequestro |

**Estimativas de tempo de expedição por tribunal:**

| Tribunal | Tempo Médio Trânsito→Expedição | Risco TIR |
|---------|-------------------------------|----------|
| TRF4 (PR, SC, RS) | 3–8 meses | 🟡 Médio |
| TRF3 (SP, MS) | 6–12 meses | 🟠 Alto |
| **TRF1** | **8–18 meses** | 🔴 **Muito Alto** |
| TRF2 (RJ, ES) | 6–12 meses | 🟠 Alto |
| TRF5 (Nordeste) | 4–10 meses | 🟠 Alto |
| TRF6 (MG) | 4–8 meses | 🟡 Médio |
| TJs estaduais (SP, MG) | 3–8 meses | 🟡 Médio |

> ⚠️ **Impacto na TIR:** Em um crédito no TRF1 com 18 meses de limbo + 60 dias de pagamento = 20 meses de capital comprometido. Se o deságio negociado foi para um prazo esperado de 10 meses, a TIR real cai pela metade. **A modelagem de precificação deve usar o tempo total desde o pagamento ao cedente até o recebimento, não apenas os 60 dias de prazo de pagamento da RPV.**
>
> **Proteção contratual:** Considere cláusula de ajuste de preço em função do tempo efetivo de recebimento, ou precificar com margem de segurança suficiente para absorver o limbo máximo esperado por tribunal.

### Dados por Estado (Precatórios Estaduais)

| Estado | Dívida em Precatórios | Observação |
|--------|----------------------|-----------|
| São Paulo | R$ 33,5 bilhões (273 mil credores) | Maior devedor estadual |
| Rio de Janeiro | Histórico de inadimplência | Monitorar capacidade de pagamento |
| Minas Gerais | Relevante | Regime de recuperação fiscal |
| Demais | Variável | Verificar situação fiscal do ente |

---

## 11. ALERTAS DE RISCO POR TIPO DE CRÉDITO

### Matriz de Risco para Aquisição de RPVs

| Tipo de Crédito | Volume | Liquidez | Risco Cessão | Risco Ente | Score Geral |
|----------------|--------|---------|-------------|-----------|------------|
| Previdenciário — INSS | ⭐⭐⭐⭐⭐ | 🟢 Alta | 🔴 Alto (vedação) | 🟢 Baixo | ⚠️ Monitorar |
| Tributário Federal | ⭐⭐⭐⭐ | 🟢 Alta | 🟢 Baixo | 🟢 Baixo | ✅ Favorável |
| Servidor Federal | ⭐⭐⭐ | 🟢 Alta | 🟢 Baixo | 🟢 Baixo | ✅ Favorável |
| Servidor Estadual (SP) | ⭐⭐⭐⭐ | 🟢 Alta | 🟢 Baixo | 🟡 Médio (teto baixo) | 🟡 Avaliar teto |
| Servidor Estadual (outros) | ⭐⭐⭐ | 🟢 Alta | 🟢 Baixo | 🟡 Médio | ✅ Favorável |
| Servidor Municipal | ⭐⭐⭐ | 🟡 Média | 🟢 Baixo | 🟠 Médio-Alto | 🟡 Avaliar município |
| Resp. Civil — União | ⭐⭐ | 🟢 Alta | 🟢 Baixo | 🟢 Baixo | ✅ Favorável |
| Resp. Civil — Estado/Mun. | ⭐⭐ | 🟡 Média | 🟢 Baixo | 🟡 Variável | 🟡 Avaliar ente |
| Tributário Estadual | ⭐⭐ | 🟢 Alta | 🟢 Baixo | 🟡 Médio | ✅ Favorável |
| Tributário Municipal | ⭐⭐ | 🟡 Média | 🟢 Baixo | 🟠 Médio-Alto | 🟡 Avaliar município |
| Saúde Pública | ⭐⭐⭐ | 🟡 Média | 🟢 Baixo | 🟠 Variável | 🟡 Avaliar ente |
| Desapropriação | ⭐ | 🟢 Alta | 🟢 Baixo | 🟡 Médio | ✅ Favorável |

### Principais Alertas

#### 🔴 ALERTA CRÍTICO — Crédito Previdenciário
- **IRDR 34/TRF4:** Proibida cessão no Sul do país (RS, SC, PR)
- **STJ:** Em vias de generalizar para todo o Brasil via repetitivos
- **Recomendação:** Não operar enquanto o julgamento do STJ não for concluído, ou operar com proteção contratual específica (cláusula de resolução se a cessão for invalidada)

#### 🟠 ALERTA IMPORTANTE — Municípios Pequenos
- Capacidade fiscal variável
- Mesmo com sequestro possível, o processo de cobrança pode ser lento
- Verificar situação fiscal do município antes de adquirir
- Preferir municípios com receita própria sólida (acima de 50 mil habitantes como referência inicial)

#### 🟡 ALERTA — São Paulo (Estado e Município)
- Teto de RPV muito baixo (~R$15.566 em 2024)
- Tickets menores = mais operações para o mesmo volume financeiro
- Volume altíssimo de processos compensa o teto baixo em escala

#### 🟡 ALERTA — EC 113/2021 e Índices de Correção
- Créditos com data-base anterior a 2021 usam SELIC ou TR — verificar cálculo
- Créditos pós-2021 usam IPCA-E + 6% a.a.
- A Resolução CNJ 613/2025 altera regras de data-base — conferir cálculos nos processos novos

---

## 12. FONTES E REFERÊNCIAS

### Legislação
- [Art. 100, CF/88 — STF](https://portal.stf.jus.br/constituicao-supremo/artigo.asp?abrirBase=CF&abrirArtigo=100)
- [Art. 87, ADCT — Planalto](https://www.planalto.gov.br/ccivil_03/constituicao/adct.htm)
- [Resolução CNJ nº 303/2019](https://atos.cnj.jus.br/atos/detalhar/3130)
- [EC nº 113/2021](https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc113.htm)
- [EC nº 114/2021](https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc114.htm)
- [Lei 10.259/2001 — JEF](https://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10259.htm)
- [Lei 12.153/2009 — JEFP](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12153.htm)
- [Lei 8.213/91, art. 114 — INSS](https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm)

### Jurisprudência e Normas
- [STF — Tema 792 (teto RPV)](https://portal.stf.jus.br/jurisprudenciaRepercussao/tema.asp?num=792)
- [STF — Tema 361 (natureza do crédito após cessão)](https://portal.stf.jus.br/jurisprudenciaRepercussao/tema.asp?num=361)
- [TRF4 — IRDR 34 (cessão previdenciária)](https://www.trf4.jus.br/trf4/controlador.php?acao=noticia_visualizar&id_noticia=29803)
- [O art. 100 da CF após as EC 113 e 114 — Migalhas](https://www.migalhas.com.br/depeso/357846/o-art-100-da-cf-apos-as-ec-113-e-114)
- [IRDR 34 — Análise Cescon Barrieu](https://cesconbarrieu.com.br/cessao-de-precatorio-previdenciario-irdr-34-do-trf4-veda-transferencia-e-stj-pode-afetar-tema-aos-repetitivos/)

### Dados de Mercado
- [CNJ — Portal de Precatórios](https://www.cnj.jus.br/programas-e-acoes/precatorios/)
- [CJF — Precatórios e RPVs](https://www.cjf.jus.br/publico/rpvs_precatorios/)
- [Mapa Anual de Precatórios 2024 — TRF6](https://portal.trf6.jus.br/rpv-e-precatorios/mapa-anual-de-precatorios-2/mapa-anual-de-precatorios-2024/)
- [Precatórios inscritos 2025 — Ministério do Planejamento](https://www.gov.br/planejamento/pt-br/assuntos/noticias/2024/maio/precatorios-inscritos-para-2025-somam-r-707-bilhoes)
- [RPV por estado em 2025 — LCbank](https://requisicaodepequenovalor.com.br/qual-valor-da-rpv-do-seu-estado-em-2025/)

### Para Atualização Periódica
- [FONAPREC — Fórum Nacional de Precatórios — CNJ](https://www.cnj.jus.br/programas-e-acoes/precatorios/forum-nacional-de-precatorios-fonaprec/legislacao-e-documentos/)
- [AASP — Tabela de Índices (Resolução CNJ 303/2019)](https://www.aasp.org.br/produtos-servicos/indices-economicos/indices-judiciais/tabela-resolucao-cnj-no-303-2019/)
- [SisPreq — Sistema Nacional de Precatórios](https://www.cnj.jus.br/sistemas/precatorios/)

---

*Documento elaborado com base em pesquisa de legislação, jurisprudência e fontes oficiais. Deve ser revisado periodicamente, especialmente quanto ao julgamento do STJ sobre cessão de créditos previdenciários (repetitivos em andamento em 2026).*
