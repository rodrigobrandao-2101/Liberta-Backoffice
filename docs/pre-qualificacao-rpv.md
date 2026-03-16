# Especificação Técnica: Ferramenta de Pré-Qualificação de RPV

## Liberta Precatório — Backoffice Dashboard

**Versão:** 1.0
**Data:** 10/03/2026
**Autor:** Especificação gerada para implementação

---

## Índice

1. Resumo Executivo
2. Arquitetura do Sistema
3. Especificação do Frontend
4. Especificação do Backend (n8n)
5. Integração com APIs Externas
6. Modelo de Dados
7. Algoritmo de Classificação de Risco
8. Descrição dos Mockups de UI
9. Checklist de Implementação

---

## 1. Resumo Executivo

### 1.1 Contexto de Negócio

A Liberta Precatório adquire RPVs (Requisições de Pequeno Valor) de credores com desconto. Antes de fazer uma oferta, o time comercial (SDRs) precisa qualificar o crédito: confirmar que é de fato uma RPV, identificar o ente devedor, avaliar o estágio processual e estimar o risco da operação.

Atualmente, esse processo é feito manualmente via consulta ao portal do CNJ e planilhas internas, consumindo tempo e introduzindo erros de interpretação. A Ferramenta de Pré-Qualificação de RPV automatiza essa consulta e entrega ao SDR um cartão estruturado de qualificação com classificação de risco embutida.

### 1.2 Objetivo da Ferramenta

Criar uma nova página "Ferramentas" no dashboard existente que permita ao SDR:

1. Informar o número do processo **ou** o CPF do credor
2. Receber automaticamente os dados processuais relevantes
3. Visualizar um cartão de qualificação com todos os 9 campos mapeados
4. Obter uma classificação de risco calculada automaticamente (Baixo / Médio / Alto)

### 1.3 Benefícios Esperados

- Redução do tempo de qualificação de ~15 minutos para ~30 segundos
- Eliminação de erros de transcriação manual
- Padronização do critério de risco entre todos os SDRs
- Rastreabilidade das consultas realizadas

### 1.4 Escopo

**Incluído:**
- Página "Ferramentas" com sub-página "Pré-Qualificação de RPV"
- Dois fluxos de busca: por número de processo e por CPF
- Integração com DataJud (CNJ) via n8n
- Integração com Escavador via n8n
- Cartão de qualificação com classificação de risco
- Estados de loading, resultado, erro e seleção de processo (fluxo CPF)

**Excluído do escopo v1:**
- Salvamento automático da qualificação no Supabase
- Integração direta com Pipefy
- Histórico de consultas
- Exportação em PDF

---

## 2. Arquitetura do Sistema

### 2.1 Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER (Vercel)                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Dashboard React + Vite                          │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Página: /ferramentas/pre-qualificacao-rpv       │   │   │
│  │  │                                                  │   │   │
│  │  │  [Componente: PreQualificacaoRPV]                │   │   │
│  │  │    ├── SearchForm                                │   │   │
│  │  │    ├── ProcessoSelector (fluxo CPF)              │   │   │
│  │  │    ├── QualificacaoCard                          │   │   │
│  │  │    └── ErrorDisplay                              │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ POST (fetch)
                            │ JSON payload
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   n8n Cloud                                     │
│          (libertaprecatorio.app.n8n.cloud)                      │
│                                                                 │
│  Workflow A: pre-qualificacao-por-processo                      │
│  ┌──────────┐   ┌──────────┐   ┌───────────┐   ┌──────────┐   │
│  │ Webhook  │──▶│ Extrai   │──▶│  DataJud  │──▶│  Monta   │   │
│  │ Trigger  │   │ Tribunal │   │   API     │   │  JSON    │   │
│  └──────────┘   └──────────┘   └───────────┘   └────┬─────┘   │
│                                                      │         │
│  Workflow B: pre-qualificacao-por-cpf                │         │
│  ┌──────────┐   ┌──────────┐   ┌───────────┐        │         │
│  │ Webhook  │──▶│Escavador │──▶│  Filtra   │        │         │
│  │ Trigger  │   │   API    │   │  RPVs     │        │         │
│  └──────────┘   └──────────┘   └─────┬─────┘        │         │
│                                      │ retorna lista │         │
│                                      ▼               ▼         │
│                              (Frontend seleciona     │         │
│                               e chama Workflow A)   │         │
│                                                      ▼         │
│                                              Respond to        │
│                                               Webhook          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────┐
    │   DataJud    │ │  Escavador   │ │ Algoritmo│
    │  (CNJ API)   │ │  (API Priv.) │ │  de Risco│
    └──────────────┘ └──────────────┘ └──────────┘
```

### 2.2 Fluxo 1 — Busca por Número de Processo

```
SDR digita número    Frontend valida     Frontend chama
do processo         formato             n8n webhook A
     │                   │                    │
     ▼                   ▼                    ▼
┌─────────┐        ┌──────────┐        ┌──────────────┐
│ Input   │──────▶│  Regex   │──────▶ │ POST /webhook│
│ Processo│        │ CNJ fmt  │        │ /rpv-processo │
└─────────┘        └──────────┘        └──────┬───────┘
                                              │
                                              ▼
                                     ┌──────────────────┐
                                     │  n8n extrai      │
                                     │  código tribunal │
                                     │  do número       │
                                     └──────┬───────────┘
                                            │
                                            ▼
                                     ┌──────────────────┐
                                     │  POST DataJud    │
                                     │  /api_publica_   │
                                     │  {tribunal}/     │
                                     │  _search         │
                                     └──────┬───────────┘
                                            │
                                            ▼
                                     ┌──────────────────┐
                                     │  n8n mapeia e    │
                                     │  calcula risco   │
                                     └──────┬───────────┘
                                            │
                                            ▼
                                     ┌──────────────────┐
                                     │  Retorna JSON    │
                                     │  estruturado     │
                                     └──────┬───────────┘
                                            │
                                            ▼
                                   Frontend exibe cartão
```

### 2.3 Fluxo 2 — Busca por CPF

```
SDR digita CPF     Frontend valida     Frontend chama
do credor          formato CPF         n8n webhook B
     │                   │                    │
     ▼                   ▼                    ▼
┌─────────┐        ┌──────────┐        ┌──────────────┐
│ Input   │──────▶│ Regex    │──────▶ │ POST /webhook│
│   CPF   │        │ CPF fmt  │        │ /rpv-cpf     │
└─────────┘        └──────────┘        └──────┬───────┘
                                              │
                                              ▼
                                     ┌──────────────────┐
                                     │  n8n chama       │
                                     │  Escavador API   │
                                     │  com CPF         │
                                     └──────┬───────────┘
                                            │
                                            ▼
                                     ┌──────────────────┐
                                     │  n8n filtra      │
                                     │  processos RPV   │
                                     │  (classe/assunto)│
                                     └──────┬───────────┘
                                            │
                                            ▼
                                     ┌──────────────────┐
                                     │  Retorna lista   │
                                     │  de processos    │
                                     │  candidatos      │
                                     └──────┬───────────┘
                                            │
                                            ▼
                              ┌─────────────────────────┐
                              │  Frontend exibe lista   │
                              │  ProcessoSelector       │
                              │  SDR escolhe processo   │
                              └──────┬──────────────────┘
                                     │
                                     ▼
                              Chama Fluxo 1 com
                              número selecionado
```

### 2.4 Componentes de Infraestrutura

| Componente | Tecnologia | Responsabilidade |
|---|---|---|
| Frontend | React 19 + Vite | UI, validação de input, exibição |
| Hospedagem | Vercel | Servir o dashboard |
| Orquestrador | n8n Cloud | Chamar APIs externas, guardar chaves |
| DataJud | CNJ API pública | Dados processuais oficiais |
| Escavador | API privada | Busca de processos por CPF |
| Supabase | PostgreSQL | (v2) log de consultas |

---

## 3. Especificação do Frontend

### 3.1 Estrutura de Rotas

```
/                              → redireciona para /funil
/funil                         → FunilCompleto (existente)
/sdr                           → SDR (existente)
/comercial                     → Comercial (existente)
/ferramentas                   → Ferramentas (NOVO - índice)
/ferramentas/pre-qualificacao  → PreQualificacaoRPV (NOVO)
```

### 3.2 Arquitetura de Arquivos

```
src/
├── pages/
│   ├── Ferramentas.jsx              ← página índice (lista de ferramentas)
│   └── ferramentas/
│       └── PreQualificacaoRPV.jsx   ← página principal da ferramenta
│
├── components/
│   └── ferramentas/
│       └── pre-qualificacao/
│           ├── SearchForm.jsx        ← formulário de busca (toggle processo/CPF)
│           ├── ProcessoSelector.jsx  ← seletor de processo (fluxo CPF)
│           ├── QualificacaoCard.jsx  ← cartão de resultado
│           ├── RiscoBadge.jsx        ← badge colorido de risco
│           ├── CampoInfo.jsx         ← componente atômico de campo
│           └── ErrorDisplay.jsx      ← exibição de erros
│
├── hooks/
│   └── usePreQualificacao.js         ← lógica de estado e chamadas
│
└── services/
    └── preQualificacaoService.js     ← funções fetch para n8n
```

### 3.3 Página de Índice: Ferramentas.jsx

Página simples com cards de navegação para cada ferramenta disponível. Na v1, exibe apenas um card:

```
┌─────────────────────────────────────────────────────────┐
│  Ferramentas                                            │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ┌───────────────────────────────┐                      │
│  │  🔍  Pré-Qualificação de RPV │                      │
│  │                               │                      │
│  │  Consulte dados processuais   │                      │
│  │  por número de processo       │                      │
│  │  ou CPF do credor             │                      │
│  │                               │                      │
│  │  [Abrir Ferramenta →]         │                      │
│  └───────────────────────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

**Props:** nenhuma
**Estado:** nenhum
**Navegação:** usa `useNavigate` do react-router-dom

### 3.4 Página Principal: PreQualificacaoRPV.jsx

Página que orquestra todos os sub-componentes. Usa o hook `usePreQualificacao` para gerenciar estado.

#### 3.4.1 Layout Geral

```
┌─────────────────────────────────────────────────────────┐
│  ← Ferramentas   /   Pré-Qualificação de RPV            │
│                                                         │
│  Pré-Qualificação de RPV                                │
│  Consulte dados processuais antes de abordar o credor   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  SearchForm                                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [ProcessoSelector — visível apenas no fluxo CPF]       │
│                                                         │
│  [QualificacaoCard — visível após resultado]            │
│                                                         │
│  [ErrorDisplay — visível em caso de erro]               │
└─────────────────────────────────────────────────────────┘
```

### 3.5 Componente: SearchForm.jsx

#### 3.5.1 Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Buscar por:  [● Número do Processo]  [○ CPF]           │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  0000000-00.0000.0.00.0000                       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  [        Consultar        ]                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.5.2 Especificação de Props

```javascript
SearchForm.propTypes = {
  onSubmitProcesso: PropTypes.func.isRequired,
  // (numeroProcesso: string) => void

  onSubmitCPF: PropTypes.func.isRequired,
  // (cpf: string) => void

  isLoading: PropTypes.bool.isRequired,
}
```

#### 3.5.3 Estado Interno

```javascript
const [modo, setModo] = useState('processo') // 'processo' | 'cpf'
const [valor, setValor] = useState('')
const [erro, setErro] = useState(null)
```

#### 3.5.4 Validação de Input

**Modo Processo — Formato CNJ:**
```
Padrão: NNNNNNN-DD.AAAA.J.TT.OOOO
Regex: /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/

Exemplos válidos:
  1234567-89.2023.8.26.0100
  0001234-56.2024.4.02.5001

Mensagem de erro: "Formato inválido. Use: 0000000-00.0000.0.00.0000"
```

**Modo CPF:**
```
Aceitar com ou sem máscara: 000.000.000-00 ou 00000000000
Regex sem máscara: /^\d{11}$/
Regex com máscara: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/

Normalização: remover pontos e traço antes de enviar
Validar dígitos verificadores (algoritmo padrão CPF)
Mensagem de erro: "CPF inválido"
```

#### 3.5.5 Comportamento ao Trocar de Modo

- Limpa o campo de input
- Limpa mensagem de erro interno
- NÃO limpa resultado anterior (responsabilidade do hook pai)

#### 3.5.6 Máscara de Input

**Processo:** aplicar máscara automaticamente enquanto o usuário digita
```
Entrada bruta: 12345678920238260100
Resultado:     1234567-89.2023.8.26.0100
```

**CPF:** aplicar máscara automaticamente
```
Entrada bruta: 12345678901
Resultado:     123.456.789-01
```

Implementar via `onChange` sem dependência de biblioteca externa.

### 3.6 Componente: ProcessoSelector.jsx

Visível apenas quando o fluxo CPF retorna uma lista de processos candidatos.

#### 3.6.1 Layout

```
┌─────────────────────────────────────────────────────────┐
│  Processos encontrados para CPF 123.456.789-01          │
│  Selecione o processo para consultar:                   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ○  1234567-89.2023.8.26.0100                    │  │
│  │     TJ-SP · Vara da Fazenda Pública              │  │
│  │     RPV · R$ 45.000,00                           │  │
│  ├───────────────────────────────────────────────────┤  │
│  │  ○  9876543-21.2022.4.03.6100                    │  │
│  │     TRF3 · 1ª Vara Federal de SP                 │  │
│  │     RPV · R$ 12.500,00                           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  [  Consultar Processo Selecionado  ]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.6.2 Especificação de Props

```javascript
ProcessoSelector.propTypes = {
  processos: PropTypes.arrayOf(PropTypes.shape({
    numero: PropTypes.string.isRequired,
    tribunal: PropTypes.string.isRequired,
    vara: PropTypes.string,
    classe: PropTypes.string,
    valor: PropTypes.number,
  })).isRequired,

  onSelect: PropTypes.func.isRequired,
  // (numeroProcesso: string) => void

  isLoading: PropTypes.bool.isRequired,
  cpf: PropTypes.string.isRequired,
}
```

#### 3.6.3 Estado Interno

```javascript
const [selecionado, setSelecionado] = useState(null)
```

Botão "Consultar" desabilitado até uma opção ser selecionada.

#### 3.6.4 Caso Vazio

Se `processos.length === 0`:
```
┌─────────────────────────────────────────────────────────┐
│  Nenhum processo RPV encontrado para este CPF.          │
│  Verifique se o CPF está correto ou tente buscar        │
│  diretamente pelo número do processo.                   │
└─────────────────────────────────────────────────────────┘
```

### 3.7 Componente: QualificacaoCard.jsx

Exibe o resultado da qualificação. É o componente mais rico da interface.

#### 3.7.1 Layout Completo

```
┌─────────────────────────────────────────────────────────────────┐
│  QUALIFICAÇÃO DE RPV                          [RISCO: MÉDIO ⚠️] │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  1234567-89.2023.8.26.0100                                      │
│                                                                 │
│  ┌─────────────────────────┬───────────────────────────────┐   │
│  │  TRIBUNAL               │  VARA                         │   │
│  │  TJ-SP                  │  3ª Vara da Fazenda Pública   │   │
│  └─────────────────────────┴───────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ENTE DEVEDOR (POLO PASSIVO)                            │   │
│  │  Município de São Paulo                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────┬───────────────────────────────┐   │
│  │  NATUREZA PROCESSUAL    │  VALOR                        │   │
│  │  RPV ✓                  │  R$ 45.230,00                 │   │
│  └─────────────────────────┴───────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MATÉRIAS                                               │   │
│  │  • Benefícios em Espécie · Auxílio-Doença              │   │
│  │  • Regime Geral de Previdência Social                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ÚLTIMA MOVIMENTAÇÃO                                    │   │
│  │  15/01/2026 — Expedição de RPV                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CLASSIFICAÇÃO DE RISCO                                 │   │
│  │                                                         │   │
│  │  Ente Devedor:    [● ALTO]   Municipal                  │   │
│  │  Etapa:           [● BAIXO]  Expedição/Pagamento        │   │
│  │  Penhoras:        [● BAIXO]  Nenhuma identificada       │   │
│  │  Valor vs Limite: [● OK]     Dentro do limite RPV       │   │
│  │                                                         │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  Risco Geral: ⚠️  MÉDIO                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [  Nova Consulta  ]     [  Copiar Dados  ]                     │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.7.2 Especificação de Props

```javascript
QualificacaoCard.propTypes = {
  dados: PropTypes.shape({
    // Campos básicos
    numeroProcesso: PropTypes.string.isRequired,
    tribunal: PropTypes.string.isRequired,
    vara: PropTypes.string,
    enteDevedor: PropTypes.string,
    naturezaProcessual: PropTypes.string.isRequired,
    isRPV: PropTypes.bool.isRequired,
    materias: PropTypes.arrayOf(PropTypes.string),
    valor: PropTypes.number,
    ultimaMovimentacao: PropTypes.shape({
      data: PropTypes.string,
      descricao: PropTypes.string,
    }),
    // Classificação de risco
    risco: PropTypes.shape({
      geral: PropTypes.oneOf(['baixo', 'medio', 'alto']).isRequired,
      enteDevedor: PropTypes.oneOf(['baixo', 'medio', 'alto']).isRequired,
      etapa: PropTypes.oneOf(['baixo', 'medio', 'alto']).isRequired,
      penhorasEBloqueios: PropTypes.oneOf(['baixo', 'alto']).isRequired,
      valorVsLimite: PropTypes.oneOf(['ok', 'risco']).isRequired,
      detalhes: PropTypes.shape({
        tipoEnte: PropTypes.string,
        descricaoEtapa: PropTypes.string,
        penhorasEncontradas: PropTypes.bool,
        valorRPV: PropTypes.number,
        limiteRPVAtual: PropTypes.number,
      }),
    }).isRequired,
  }).isRequired,

  onNovaConsulta: PropTypes.func.isRequired,
}
```

#### 3.7.3 Componente RiscoBadge.jsx

```javascript
// Props:
// nivel: 'baixo' | 'medio' | 'alto' | 'ok' | 'risco'
// size: 'sm' | 'md' | 'lg' (default: 'md')

// Cores:
// baixo → verde    (#16a34a, bg #dcfce7)
// medio → amarelo  (#ca8a04, bg #fef9c3)
// alto  → vermelho (#dc2626, bg #fee2e2)
// ok    → verde    (mesmo que baixo)
// risco → vermelho (mesmo que alto)

// Labels:
// baixo → "BAIXO"
// medio → "MÉDIO"
// alto  → "ALTO"
// ok    → "OK"
// risco → "RISCO"
```

#### 3.7.4 Comportamento do Campo "Natureza Processual"

- Se `isRPV === true`: exibir "RPV ✓" com ícone verde e texto da classe
- Se `isRPV === false`: exibir aviso em amarelo:
  ```
  ⚠️ ATENÇÃO: Este processo foi classificado como "{classe.nome}",
  não como RPV. Confirme antes de prosseguir.
  ```

#### 3.7.5 Botão "Copiar Dados"

Ao clicar, copia para o clipboard o seguinte texto formatado:

```
QUALIFICAÇÃO DE RPV — Liberta Precatório
Data da consulta: 10/03/2026 14:32

Processo: 1234567-89.2023.8.26.0100
Tribunal: TJ-SP
Vara: 3ª Vara da Fazenda Pública
Ente Devedor: Município de São Paulo
Natureza: RPV
Matérias: Benefícios em Espécie - Auxílio-Doença
Valor: R$ 45.230,00
Última Movimentação: 15/01/2026 - Expedição de RPV

RISCO: MÉDIO
- Ente Devedor: ALTO (Municipal)
- Etapa: BAIXO (Expedição/Pagamento)
- Penhoras: BAIXO (Nenhuma identificada)
- Valor vs Limite: OK (Dentro do limite)
```

### 3.8 Componente: ErrorDisplay.jsx

#### 3.8.1 Tipos de Erro e Layouts

**Erro: Processo não encontrado**
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  Processo Não Encontrado                            │
│                                                         │
│  O processo 1234567-89.2023.8.26.0100 não foi          │
│  localizado no DataJud.                                 │
│                                                         │
│  Verifique se:                                          │
│  • O número do processo está correto                    │
│  • O tribunal é o correto (extraído: TJ-SP)            │
│  • O processo não é sigiloso                           │
│                                                         │
│  [Tentar Novamente]                                     │
└─────────────────────────────────────────────────────────┘
```

**Erro: API indisponível**
```
┌─────────────────────────────────────────────────────────┐
│  🔴  Serviço Temporariamente Indisponível               │
│                                                         │
│  Não foi possível consultar o DataJud no momento.      │
│  Aguarde alguns instantes e tente novamente.            │
│                                                         │
│  [Tentar Novamente]                                     │
└─────────────────────────────────────────────────────────┘
```

**Erro: Timeout**
```
┌─────────────────────────────────────────────────────────┐
│  ⏱️  Consulta Expirou                                   │
│                                                         │
│  A consulta demorou mais do que o esperado.             │
│  Tente novamente.                                       │
│                                                         │
│  [Tentar Novamente]                                     │
└─────────────────────────────────────────────────────────┘
```

#### 3.8.2 Especificação de Props

```javascript
ErrorDisplay.propTypes = {
  erro: PropTypes.shape({
    tipo: PropTypes.oneOf([
      'processo_nao_encontrado',
      'cpf_nao_encontrado',
      'api_indisponivel',
      'timeout',
      'formato_invalido',
      'erro_desconhecido',
    ]).isRequired,
    mensagem: PropTypes.string,
    detalhes: PropTypes.object,
  }).isRequired,

  onTentarNovamente: PropTypes.func.isRequired,
}
```

### 3.9 Hook: usePreQualificacao.js

Centraliza toda a lógica de estado e comunicação.

#### 3.9.1 Interface do Hook

```javascript
function usePreQualificacao() {
  return {
    // Estado
    status,          // 'idle' | 'loading_processo' | 'loading_cpf'
                     //   | 'aguardando_selecao' | 'resultado' | 'erro'
    resultado,       // QualificacaoData | null
    processosListaCPF, // ProcessoItem[] | null (fluxo CPF)
    erro,            // ErroData | null
    cpfAtual,        // string | null (para exibir no ProcessoSelector)

    // Ações
    buscarPorProcesso,  // (numeroProcesso: string) => Promise<void>
    buscarPorCPF,       // (cpf: string) => Promise<void>
    selecionarProcesso, // (numeroProcesso: string) => Promise<void>
    limpar,             // () => void (volta para idle)
  }
}
```

#### 3.9.2 Máquina de Estados

```
                    ┌─────────────────────┐
                    │        idle         │◀──────────────┐
                    └─────────┬───────────┘               │
                              │                           │
               ┌──────────────┴──────────────┐            │
               │                             │            │
    buscarPorProcesso()          buscarPorCPF()            │
               │                             │            │
               ▼                             ▼            │
    ┌──────────────────┐        ┌──────────────────────┐   │
    │ loading_processo │        │     loading_cpf      │   │
    └─────────┬────────┘        └──────────┬───────────┘   │
              │                            │               │
      ┌───────┴───────┐            ┌───────┴────────┐      │
      │               │            │                │      │
  sucesso           erro       sem_processos     lista_ok  │
      │               │            │                │      │
      ▼               ▼            ▼                ▼      │
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐│
│resultado │  │   erro   │  │   erro   │  │aguardando_    ││
└────┬─────┘  └────┬─────┘  └──────────┘  │selecao        ││
     │             │                      └──────┬────────┘│
     │             │                             │         │
     │        onTentarNovamente()         selecionarProcesso()
     │             │                             │         │
     │             ▼                             ▼         │
     │            idle                  loading_processo   │
     │                                          │          │
     │                                     (volta para)    │
     │                                   sucesso/erro      │
     │                                                     │
     └────────────────────── limpar() ────────────────────┘
```

### 3.10 Serviço: preQualificacaoService.js

```javascript
const N8N_BASE_URL = 'https://libertaprecatorio.app.n8n.cloud'
const TIMEOUT_MS = 30000 // 30 segundos

// Fluxo 1: por número de processo
async function consultarPorProcesso(numeroProcesso) {
  // POST /webhook/rpv-processo
  // Body: { numeroProcesso }
  // Returns: QualificacaoData
}

// Fluxo 2 etapa 1: por CPF
async function consultarPorCPF(cpf) {
  // POST /webhook/rpv-cpf
  // Body: { cpf }
  // Returns: { processos: ProcessoItem[] }
}

// Tratamento de erros HTTP:
// 404 → tipo: 'processo_nao_encontrado'
// 408 ou AbortController timeout → tipo: 'timeout'
// 503, 502 → tipo: 'api_indisponivel'
// outros → tipo: 'erro_desconhecido'
```

### 3.11 Estados de Loading

Durante o loading, exibir skeleton/spinner centralizado:

```
┌─────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────┐ │
│  │  🔍 Consultando DataJud...                        │ │
│  │                                                    │ │
│  │  [████████████████████░░░░░░░░░░░░] 65%           │ │
│  │                                                    │ │
│  │  Isso pode levar até 30 segundos.                  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

Usar barra de progresso animada (CSS `@keyframes`) sem percentual real (é estético).

### 3.12 Navegação no Sidebar Existente

Adicionar no componente de navegação lateral (Sidebar/Nav existente):

```
[ícone] Ferramentas
         └─ Pré-Qualificação RPV
```

Usar `NavLink` do react-router-dom para highlight ativo.

---

## 4. Especificação do Backend (n8n)

### 4.1 Workflow A: "RPV — Consulta por Processo"

**ID sugerido de nomenclatura:** `rpv-consulta-processo`
**Webhook path:** `rpv-processo`
**Método:** POST

#### 4.1.1 Nós do Workflow

```
[Webhook] → [Extrair Tribunal] → [HTTP: DataJud] → [IF: Encontrou?]
                                                         │
                                           ┌─────────────┴──────────────┐
                                         sim                           não
                                           │                            │
                                    [Mapear Campos]            [Respond: 404]
                                           │
                                    [Calcular Risco]
                                           │
                                    [Respond: Sucesso]
```

#### 4.1.2 Nó 1: Webhook Trigger

```json
{
  "name": "Webhook RPV Processo",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2.1,
  "webhookId": "rpv-processo",
  "parameters": {
    "path": "rpv-processo",
    "httpMethod": "POST",
    "responseMode": "responseNode",
    "options": {
      "allowedOrigins": "*"
    }
  }
}
```

**Payload esperado:**
```json
{
  "numeroProcesso": "1234567-89.2023.8.26.0100"
}
```

#### 4.1.3 Nó 2: Extrair Código do Tribunal (Code Node)

O número do processo CNJ tem a seguinte estrutura:
```
NNNNNNN - DD . AAAA . J . TT . OOOO
                       │   ││
                       │   │└── Origem (comarca/seção)
                       │   └─── Tribunal (2 dígitos)
                       └─────── Segmento de Justiça
```

**Segmento de Justiça:**
```
1 = STF
2 = CNJ
3 = STJ
4 = Justiça Federal (TRF)
5 = Trabalhista (TRT)
6 = Eleitoral (TRE)
7 = Militar (STM)
8 = Estadual (TJ)
9 = Militar Estadual
```

**Código JavaScript para o Code Node:**

```javascript
// Input: items[0].json.numeroProcesso
// Exemplo: "1234567-89.2023.8.26.0100"

const numero = $input.item.json.numeroProcesso;

// Remover formatação e extrair segmentos
// Formato: NNNNNNN-DD.AAAA.J.TT.OOOO
const regex = /^(\d{7})-(\d{2})\.(\d{4})\.(\d)\.(\d{2})\.(\d{4})$/;
const match = numero.match(regex);

if (!match) {
  throw new Error('Número de processo em formato inválido: ' + numero);
}

const [, nnnnnnn, dd, aaaa, j, tt, oooo] = match;

const segmento = parseInt(j);
const codigoTribunal = parseInt(tt);

// Mapear para código da API DataJud
function resolverCodigoDataJud(segmento, codigoTribunal) {
  const mapa = {
    // Justiça Federal
    4: {
      1: 'trf1', 2: 'trf2', 3: 'trf3', 4: 'trf4', 5: 'trf5', 6: 'trf6'
    },
    // Trabalhista
    5: {
      1: 'trt1', 2: 'trt2', 3: 'trt3', 4: 'trt4', 5: 'trt5',
      6: 'trt6', 7: 'trt7', 8: 'trt8', 9: 'trt9', 10: 'trt10',
      11: 'trt11', 12: 'trt12', 13: 'trt13', 14: 'trt14', 15: 'trt15',
      16: 'trt16', 17: 'trt17', 18: 'trt18', 19: 'trt19', 20: 'trt20',
      21: 'trt21', 22: 'trt22', 23: 'trt23', 24: 'trt24'
    },
    // Estadual
    8: {
      1: 'tjal', 2: 'tjam', 3: 'tjap', 4: 'tjba', 5: 'tjce',
      6: 'tjdf', 7: 'tjes', 8: 'tjgo', 9: 'tjma', 10: 'tjmt',
      11: 'tjms', 12: 'tjmg', 13: 'tjpa', 14: 'tjpb', 15: 'tjpr',
      16: 'tjpe', 17: 'tjpi', 18: 'tjrj', 19: 'tjrn', 20: 'tjrs',
      21: 'tjro', 22: 'tjrr', 23: 'tjsc', 24: 'tjse', 25: 'tjsp',
      26: 'tjto', 27: 'tjac'
    }
  };

  if (segmento === 1) return 'stf';
  if (segmento === 3) return 'stj';

  return mapa[segmento]?.[codigoTribunal] ?? null;
}

const codigoDataJud = resolverCodigoDataJud(segmento, codigoTribunal);

if (!codigoDataJud) {
  throw new Error(`Tribunal não mapeado: segmento ${segmento}, código ${codigoTribunal}`);
}

// Nomear o tribunal para exibição
const nomeTribunal = codigoDataJud.toUpperCase().replace('TJ', 'TJ-').replace('TRF', 'TRF ').replace('TRT', 'TRT ');

return {
  numeroProcesso: numero,
  codigoDataJud,
  nomeTribunalExibicao: nomeTribunal,
  segmento,
  codigoTribunal,
};
```

#### 4.1.4 Nó 3: HTTP Request — DataJud

```json
{
  "name": "Consultar DataJud",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "parameters": {
    "method": "POST",
    "url": "=https://api-publica.datajud.cnj.jus.br/api_publica_{{ $json.codigoDataJud }}/_search",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "=APIKey {{ $vars.DATAJUD_API_KEY }}"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyContentType": "json",
    "jsonBody": "={{ JSON.stringify({ query: { match: { numeroProcesso: $('Extrair Tribunal').item.json.numeroProcesso } } }) }}"
  }
}
```

**Nota:** A chave da API DataJud deve ser armazenada em variável de ambiente do n8n (`DATAJUD_API_KEY`), nunca hardcoded.

#### 4.1.5 Nó 4: IF — Processo Encontrado

```json
{
  "name": "Processo Encontrado?",
  "type": "n8n-nodes-base.if",
  "parameters": {
    "conditions": {
      "options": { "caseSensitive": true },
      "conditions": [
        {
          "leftValue": "={{ $json.hits.total.value }}",
          "rightValue": 0,
          "operator": { "type": "number", "operation": "gt" }
        }
      ]
    }
  }
}
```

#### 4.1.6 Nó 5: Code — Mapear Campos (branch TRUE)

```javascript
// Input: resposta da API DataJud
const hit = $input.item.json.hits.hits[0]._source;
const tribunalInfo = $('Extrair Tribunal').item.json;

// --- Campo 1: Número do Processo ---
const numeroProcesso = hit.numeroProcesso;

// --- Campo 2: Tribunal ---
const tribunal = tribunalInfo.nomeTribunalExibicao || hit.tribunal?.nome || '';

// --- Campo 3: Vara (orgaoJulgador) ---
const vara = hit.orgaoJulgador?.nome || '';

// --- Campo 4: Ente Devedor (polo passivo) ---
// Partes do processo: encontrar polo passivo que seja ente governamental
const partes = hit.partes || [];
const poloPassivo = partes.filter(p => p.polo === 'PASSIVO');

// Priorizar pessoa jurídica de direito público
const enteDevedor = poloPassivo.find(p =>
  p.nome.match(/munic[ií]pio|estado|uni[aã]o|autarquia|inss|prev|fazenda/i)
)?.nome || poloPassivo[0]?.nome || 'Não identificado';

// --- Campo 5: Natureza Processual ---
const classePrincipal = hit.classe?.nome || '';
const classeId = hit.classe?.codigo || 0;

// IDs de classe RPV no CNJ (lista não exaustiva - expandir conforme necessário)
const CLASSES_RPV = [
  'Requisição de Pequeno Valor (RPV)',
  'RPV',
  'Cumprimento de Sentença contra a Fazenda Pública',
  // Adicionar mais conforme encontrado na prática
];

// Identificar se é RPV pelo nome da classe ou pela presença de assunto RPV
const isRPVPorClasse = CLASSES_RPV.some(c =>
  classePrincipal.toLowerCase().includes('rpv') ||
  classePrincipal.toLowerCase().includes('pequeno valor')
);

const isRPV = isRPVPorClasse;

// --- Campo 6: Matérias ---
const assuntos = (hit.assuntos || []).map(a => a.nome).filter(Boolean);

// --- Campo 7: Valor ---
const valor = hit.valorCausa || 0;

// --- Campo 8: Última Movimentação ---
const movimentos = hit.movimentos || [];
const ultimaMovimentacao = movimentos.length > 0 ? {
  data: movimentos[0].dataHora?.split('T')[0] || '',
  descricao: movimentos[0].nome || '',
} : null;

// --- Campo 9: Dados para Classificação de Risco ---
// (calculado no próximo nó)

return {
  numeroProcesso,
  tribunal,
  vara,
  enteDevedor,
  naturezaProcessual: classePrincipal,
  isRPV,
  materias: assuntos,
  valor,
  ultimaMovimentacao,
  // Dados brutos para cálculo de risco
  _raw: {
    partes,
    movimentos,
    assuntos: hit.assuntos || [],
  }
};
```

#### 4.1.7 Nó 6: Code — Calcular Risco

```javascript
const dados = $input.item.json;

// ====================================
// CLASSIFICAÇÃO DE RISCO
// ====================================

// 1. RISCO — ENTE DEVEDOR
// Federal = baixo, Estadual = medio, Municipal = alto
const nomeEnte = (dados.enteDevedor || '').toLowerCase();

let riscoEnteDevedor, tipoEnte;

if (
  nomeEnte.includes('união federal') ||
  nomeEnte.includes('fazenda nacional') ||
  nomeEnte.includes('inss') ||
  nomeEnte.includes('prev') ||
  nomeEnte.includes('federal')
) {
  riscoEnteDevedor = 'baixo';
  tipoEnte = 'Federal';
} else if (
  nomeEnte.includes('estado') ||
  nomeEnte.includes('governo do estado') ||
  nomeEnte.includes('estadual')
) {
  riscoEnteDevedor = 'medio';
  tipoEnte = 'Estadual';
} else if (
  nomeEnte.includes('munic') ||
  nomeEnte.includes('prefeitura') ||
  nomeEnte.includes('câmara municipal')
) {
  riscoEnteDevedor = 'alto';
  tipoEnte = 'Municipal';
} else {
  riscoEnteDevedor = 'medio'; // padrão conservador
  tipoEnte = 'Não identificado';
}

// 2. RISCO — ETAPA PROCESSUAL (última movimentação)
const descMovimento = (dados.ultimaMovimentacao?.descricao || '').toLowerCase();

let riscoEtapa, descricaoEtapa;

const MOVIMENTOS_BAIXO = [
  'expedi', 'pagamento', 'precatório pago', 'rpv pago', 'requisição paga',
  'transferência', 'depósito judicial'
];
const MOVIMENTOS_MEDIO = [
  'trânsito em julgado', 'certidão', 'baixa', 'arquivamento',
  'extinção', 'cumprimento'
];
const MOVIMENTOS_ALTO = [
  'recurso', 'agravo', 'apelação', 'embargos', 'suspensão',
  'liminar', 'contestação', 'impugnação', 'exceção'
];

if (MOVIMENTOS_BAIXO.some(m => descMovimento.includes(m))) {
  riscoEtapa = 'baixo';
  descricaoEtapa = 'Expedição/Pagamento';
} else if (MOVIMENTOS_ALTO.some(m => descMovimento.includes(m))) {
  riscoEtapa = 'alto';
  descricaoEtapa = 'Em recurso';
} else if (MOVIMENTOS_MEDIO.some(m => descMovimento.includes(m))) {
  riscoEtapa = 'medio';
  descricaoEtapa = 'Trânsito em julgado';
} else {
  riscoEtapa = 'medio'; // padrão conservador
  descricaoEtapa = dados.ultimaMovimentacao?.descricao || 'Não identificado';
}

// 3. RISCO — PENHORAS E BLOQUEIOS
const movimentos = dados._raw?.movimentos || [];
const KEYWORDS_PENHORA = [
  'penhora', 'bloqueio', 'sequestro', 'arresto',
  'constrição', 'indisponibilidade'
];

const penhorasEncontradas = movimentos.some(m =>
  KEYWORDS_PENHORA.some(kw => (m.nome || '').toLowerCase().includes(kw))
);

const riscoPenhoras = penhorasEncontradas ? 'alto' : 'baixo';

// 4. RISCO — VALOR vs LIMITE RPV
// Limite RPV 2026: 60 salários mínimos
// Salário mínimo 2026: R$ 1.518,00
// Limite = R$ 91.080,00
const SALARIO_MINIMO_2026 = 1518.00;
const LIMITE_RPV_SALARIOS = 60;
const limiteRPVAtual = SALARIO_MINIMO_2026 * LIMITE_RPV_SALARIOS;

const riscoValor = dados.valor > limiteRPVAtual ? 'risco' : 'ok';

// 5. CÁLCULO DO RISCO GERAL
// Regras de composição:
// - Qualquer fator ALTO → risco geral = ALTO
// - Dois ou mais MÉDIO → risco geral = ALTO
// - Um MÉDIO + sem ALTO → risco geral = MÉDIO
// - Todos BAIXO/OK → risco geral = BAIXO
// - Valor acima do limite → no mínimo MÉDIO

const fatores = [riscoEnteDevedor, riscoEtapa, riscoPenhoras];
const contagemAlto = fatores.filter(f => f === 'alto').length;
const contagemMedio = fatores.filter(f => f === 'medio').length;

let riscoGeral;

if (contagemAlto >= 1 || contagemMedio >= 2) {
  riscoGeral = 'alto';
} else if (contagemMedio === 1 || riscoValor === 'risco') {
  riscoGeral = 'medio';
} else {
  riscoGeral = 'baixo';
}

// Remover dados brutos do output
const { _raw, ...dadosLimpos } = dados;

return {
  ...dadosLimpos,
  risco: {
    geral: riscoGeral,
    enteDevedor: riscoEnteDevedor,
    etapa: riscoEtapa,
    penhorasEBloqueios: riscoPenhoras,
    valorVsLimite: riscoValor,
    detalhes: {
      tipoEnte,
      descricaoEtapa,
      penhorasEncontradas,
      valorRPV: dados.valor,
      limiteRPVAtual,
    }
  }
};
```

#### 4.1.8 Nó 7: Respond to Webhook — Sucesso

```json
{
  "name": "Responder Sucesso",
  "type": "n8n-nodes-base.respondToWebhook",
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ JSON.stringify({ sucesso: true, dados: $json }) }}",
    "options": {
      "responseCode": 200,
      "responseHeaders": {
        "entries": [
          { "name": "Content-Type", "value": "application/json" },
          { "name": "Access-Control-Allow-Origin", "value": "*" }
        ]
      }
    }
  }
}
```

#### 4.1.9 Nó 8: Respond to Webhook — 404 (branch FALSE do IF)

```json
{
  "name": "Responder 404",
  "type": "n8n-nodes-base.respondToWebhook",
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ JSON.stringify({ sucesso: false, erro: { tipo: 'processo_nao_encontrado', mensagem: 'Processo não encontrado no DataJud' } }) }}",
    "options": {
      "responseCode": 404
    }
  }
}
```

### 4.2 Workflow B: "RPV — Consulta por CPF"

**ID sugerido de nomenclatura:** `rpv-consulta-cpf`
**Webhook path:** `rpv-cpf`
**Método:** POST

#### 4.2.1 Nós do Workflow

```
[Webhook] → [Normalizar CPF] → [HTTP: Escavador] → [IF: Encontrou?]
                                                          │
                                            ┌─────────────┴──────────────┐
                                           sim                          não
                                            │                            │
                                   [Filtrar RPVs]               [Respond: 404]
                                            │
                                   [Mapear Lista]
                                            │
                                   [Respond: 200 + lista]
```

#### 4.2.2 Nó 1: Webhook Trigger

```json
{
  "name": "Webhook RPV CPF",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2.1,
  "webhookId": "rpv-cpf",
  "parameters": {
    "path": "rpv-cpf",
    "httpMethod": "POST",
    "responseMode": "responseNode",
    "options": {}
  }
}
```

**Payload esperado:**
```json
{
  "cpf": "12345678901"
}
```

#### 4.2.3 Nó 2: Normalizar CPF (Code Node)

```javascript
const cpf = $input.item.json.cpf.replace(/\D/g, ''); // remove pontos e traço

if (cpf.length !== 11) {
  throw new Error('CPF deve ter 11 dígitos');
}

return { cpf };
```

#### 4.2.4 Nó 3: HTTP Request — Escavador

**Nota:** A URL e o formato exato da API do Escavador devem ser confirmados com o fornecedor. A estrutura abaixo é baseada na API pública documentada do Escavador.

```json
{
  "name": "Consultar Escavador",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "parameters": {
    "method": "GET",
    "url": "=https://api.escavador.com/api/v2/pessoas/busca",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "=Bearer {{ $vars.ESCAVADOR_API_KEY }}"
        },
        {
          "name": "X-Api-Version",
          "value": "2"
        }
      ]
    },
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        {
          "name": "cpf",
          "value": "={{ $json.cpf }}"
        },
        {
          "name": "q",
          "value": "processos"
        }
      ]
    }
  }
}
```

**Atenção:** O endpoint e os parâmetros exatos da API do Escavador devem ser verificados na documentação oficial. A chave deve ser armazenada em `$vars.ESCAVADOR_API_KEY`.

#### 4.2.5 Nó 4: Code — Filtrar e Mapear Processos RPV

```javascript
// A estrutura da resposta do Escavador varia por endpoint
// Adaptar conforme a resposta real da API

const resposta = $input.item.json;

// Extrai lista de processos da resposta do Escavador
// (estrutura a adaptar conforme documentação real)
const todosProcessos = resposta.processos || resposta.items || [];

// Filtrar processos que parecem ser RPV
// Critérios: classe contém "RPV" ou "Pequeno Valor",
//            ou assuntos incluem RPV,
//            ou fase inclui "Requisição"
const INDICADORES_RPV = [
  'rpv',
  'pequeno valor',
  'requisição de pequeno valor',
  'cumprimento de sentença contra fazenda',
];

const processosRPV = todosProcessos.filter(proc => {
  const classe = (proc.classe || proc.tipo || '').toLowerCase();
  const assuntos = (proc.assuntos || []).join(' ').toLowerCase();
  const titulo = (proc.titulo || '').toLowerCase();

  return INDICADORES_RPV.some(ind =>
    classe.includes(ind) || assuntos.includes(ind) || titulo.includes(ind)
  );
});

// Mapear para o formato esperado pelo frontend
const processosFormatados = processosRPV.map(proc => ({
  numero: proc.numero_cnj || proc.numero || '',
  tribunal: proc.tribunal || '',
  vara: proc.orgao_julgador || proc.vara || '',
  classe: proc.classe || '',
  valor: proc.valor || 0,
}));

return {
  processos: processosFormatados,
  total: processosFormatados.length,
};
```

#### 4.2.6 Nó 5: Respond — Lista de Processos

```json
{
  "name": "Responder Lista",
  "type": "n8n-nodes-base.respondToWebhook",
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ JSON.stringify({ sucesso: true, dados: $json }) }}",
    "options": { "responseCode": 200 }
  }
}
```

### 4.3 Variáveis de Ambiente do n8n

As seguintes variáveis devem ser configuradas em Settings > Variables no n8n Cloud:

| Variável | Valor | Uso |
|---|---|---|
| `DATAJUD_API_KEY` | Chave da API DataJud (CNJ) | Autenticação no DataJud |
| `ESCAVADOR_API_KEY` | Chave da API Escavador | Autenticação no Escavador |

---

## 5. Integração com APIs Externas

### 5.1 API DataJud (CNJ)

#### 5.1.1 Informações Gerais

- **Base URL:** `https://api-publica.datajud.cnj.jus.br`
- **Documentação:** `https://datajud-wiki.cnj.jus.br/`
- **Autenticação:** API Key via header `Authorization: APIKey {chave}`
- **Obtenção da chave:** Cadastro em `https://datajud-wiki.cnj.jus.br/api-publica/acesso`
- **Rate limit:** Verificar na documentação atual do CNJ (historicamente 60 req/min)
- **Formato:** Elasticsearch-like (POST com query DSL)

#### 5.1.2 Endpoint de Busca por Número

```
POST https://api-publica.datajud.cnj.jus.br/api_publica_{tribunal}/_search
```

Onde `{tribunal}` é o código em minúsculas: `tjsp`, `trf3`, `trt15`, etc.

**Request Headers:**
```
Authorization: APIKey {DATAJUD_API_KEY}
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": {
    "match": {
      "numeroProcesso": "1234567-89.2023.8.26.0100"
    }
  }
}
```

**Estrutura da Response (simplificada):**
```json
{
  "_shards": { "total": 1, "successful": 1, "failed": 0 },
  "hits": {
    "total": { "value": 1, "relation": "eq" },
    "hits": [
      {
        "_id": "abc123",
        "_source": {
          "id": "abc123",
          "numeroProcesso": "1234567-89.2023.8.26.0100",
          "dataAjuizamento": "2023-03-15T00:00:00",
          "tribunal": {
            "sigla": "TJSP",
            "nome": "Tribunal de Justiça de São Paulo"
          },
          "orgaoJulgador": {
            "codigo": "123",
            "nome": "3ª Vara da Fazenda Pública de São Paulo",
            "codigoMunicipioIBGE": "3550308"
          },
          "classe": {
            "codigo": 1,
            "nome": "Requisição de Pequeno Valor (RPV)"
          },
          "assuntos": [
            {
              "codigo": 8836,
              "nome": "Benefícios em Espécie",
              "codigoPai": 8814
            },
            {
              "codigo": 8858,
              "nome": "Auxílio-Doença Previdenciário",
              "codigoPai": 8836
            }
          ],
          "valorCausa": 45230.00,
          "partes": [
            {
              "nome": "João da Silva",
              "tipo": "Advogado",
              "polo": "ATIVO",
              "documento": "123.456.789-01"
            },
            {
              "nome": "Município de São Paulo",
              "tipo": "Pessoa Jurídica",
              "polo": "PASSIVO"
            }
          ],
          "movimentos": [
            {
              "codigo": 246,
              "nome": "Expedição de Requisição de Pequeno Valor - RPV",
              "dataHora": "2026-01-15T10:30:00",
              "complementosTabelados": []
            },
            {
              "codigo": 848,
              "nome": "Prolação de Sentença de Mérito",
              "dataHora": "2025-06-20T14:00:00"
            }
          ]
        }
      }
    ]
  }
}
```

#### 5.1.3 Mapeamento de Tribunais — Tabela Completa

**Justiça Estadual (segmento 8):**

| Código TT | Sigla API DataJud | Nome |
|---|---|---|
| 01 | tjal | TJ-AL |
| 02 | tjam | TJ-AM |
| 03 | tjap | TJ-AP |
| 04 | tjba | TJ-BA |
| 05 | tjce | TJ-CE |
| 06 | tjdft | TJ-DFT |
| 07 | tjes | TJ-ES |
| 08 | tjgo | TJ-GO |
| 09 | tjma | TJ-MA |
| 10 | tjmt | TJ-MT |
| 11 | tjms | TJ-MS |
| 12 | tjmg | TJ-MG |
| 13 | tjpa | TJ-PA |
| 14 | tjpb | TJ-PB |
| 15 | tjpr | TJ-PR |
| 16 | tjpe | TJ-PE |
| 17 | tjpi | TJ-PI |
| 18 | tjrj | TJ-RJ |
| 19 | tjrn | TJ-RN |
| 20 | tjrs | TJ-RS |
| 21 | tjro | TJ-RO |
| 22 | tjrr | TJ-RR |
| 23 | tjsc | TJ-SC |
| 24 | tjse | TJ-SE |
| 25 | tjsp | TJ-SP |
| 26 | tjto | TJ-TO |
| 27 | tjac | TJ-AC |

**Justiça Federal (segmento 4):**

| Código TT | Sigla API DataJud | Região |
|---|---|---|
| 01 | trf1 | TRF 1ª Região (Norte/Centro-Oeste/Nordeste) |
| 02 | trf2 | TRF 2ª Região (RJ/ES) |
| 03 | trf3 | TRF 3ª Região (SP/MS) |
| 04 | trf4 | TRF 4ª Região (Sul) |
| 05 | trf5 | TRF 5ª Região (Nordeste) |
| 06 | trf6 | TRF 6ª Região (MG) |

**Justiça Trabalhista (segmento 5):**

| Código TT | Sigla API DataJud |
|---|---|
| 01–24 | trt1–trt24 |

#### 5.1.4 Tratamento de Erros DataJud

| Código HTTP | Significado | Ação no n8n |
|---|---|---|
| 200 + hits=0 | Processo não encontrado | Retornar erro tipo `processo_nao_encontrado` |
| 400 | Query malformada | Log + retornar erro genérico |
| 401 | API Key inválida | Alerta urgente ao admin (n8n notification) |
| 404 | Índice do tribunal não existe | Retornar erro `tribunal_nao_disponivel` |
| 429 | Rate limit atingido | Retry com backoff, depois erro `api_indisponivel` |
| 500/503 | Erro do servidor CNJ | Retornar erro `api_indisponivel` |

### 5.2 API Escavador

#### 5.2.1 Informações Gerais

- **Base URL:** `https://api.escavador.com/api/v2`
- **Documentação:** Verificar com o fornecedor
- **Autenticação:** Bearer Token via header `Authorization: Bearer {chave}`
- **Tipo:** API privada — requer contrato/plano ativo

#### 5.2.2 Endpoint de Busca por CPF

**Nota:** A estrutura exata da API do Escavador deve ser confirmada com a documentação do plano contratado. O padrão abaixo é baseado na documentação pública disponível:

```
GET https://api.escavador.com/api/v2/processos/numero
```

ou (dependendo do plano):

```
POST https://api.escavador.com/api/v2/pessoas/busca-cpf
```

**Headers:**
```
Authorization: Bearer {ESCAVADOR_API_KEY}
X-Api-Version: 2
Content-Type: application/json
```

**Body esperado (verificar com Escavador):**
```json
{
  "cpf": "12345678901"
}
```

**Response esperada:**
```json
{
  "itens": [
    {
      "numero_cnj": "1234567-89.2023.8.26.0100",
      "tribunal": "TJSP",
      "tipo": "Requisição de Pequeno Valor (RPV)",
      "orgao_julgador": "3ª Vara da Fazenda",
      "valor": 45230.00,
      "data_distribuicao": "2023-03-15",
      "partes": [...]
    }
  ],
  "total": 1
}
```

**Ação necessária antes da implementação:** Verificar a documentação atual do Escavador para confirmar o endpoint correto, os parâmetros e a estrutura exata da resposta.

---

## 6. Modelo de Dados

### 6.1 Input — Fluxo por Processo

```typescript
interface InputPorProcesso {
  numeroProcesso: string;
  // Formato: "NNNNNNN-DD.AAAA.J.TT.OOOO"
  // Exemplo: "1234567-89.2023.8.26.0100"
}
```

### 6.2 Input — Fluxo por CPF

```typescript
interface InputPorCPF {
  cpf: string;
  // Formato: 11 dígitos sem máscara
  // Exemplo: "12345678901"
}
```

### 6.3 Output — Lista de Processos (resposta do Workflow B)

```typescript
interface ListaProcessosResponse {
  sucesso: true;
  dados: {
    processos: ProcessoItem[];
    total: number;
  };
}

interface ProcessoItem {
  numero: string;       // "1234567-89.2023.8.26.0100"
  tribunal: string;     // "TJ-SP"
  vara: string;         // "3ª Vara da Fazenda Pública"
  classe: string;       // "RPV"
  valor: number;        // 45230.00
}
```

### 6.4 Output — Qualificação Completa (resposta do Workflow A)

```typescript
interface QualificacaoResponse {
  sucesso: true;
  dados: QualificacaoData;
}

interface QualificacaoData {
  // Campo 1
  numeroProcesso: string;

  // Campo 2
  tribunal: string;

  // Campo 3
  vara: string | null;

  // Campo 4
  enteDevedor: string | null;

  // Campo 5
  naturezaProcessual: string;
  isRPV: boolean;

  // Campo 6
  materias: string[];

  // Campo 7
  valor: number | null;

  // Campo 8
  ultimaMovimentacao: {
    data: string;          // "2026-01-15"
    descricao: string;     // "Expedição de RPV"
  } | null;

  // Campo 9
  risco: {
    geral: 'baixo' | 'medio' | 'alto';
    enteDevedor: 'baixo' | 'medio' | 'alto';
    etapa: 'baixo' | 'medio' | 'alto';
    penhorasEBloqueios: 'baixo' | 'alto';
    valorVsLimite: 'ok' | 'risco';
    detalhes: {
      tipoEnte: string;                // "Municipal"
      descricaoEtapa: string;          // "Expedição/Pagamento"
      penhorasEncontradas: boolean;
      valorRPV: number;
      limiteRPVAtual: number;          // calculado: salário mínimo × 60
    };
  };
}
```

### 6.5 Output — Erro

```typescript
interface ErroResponse {
  sucesso: false;
  erro: {
    tipo:
      | 'processo_nao_encontrado'
      | 'cpf_nao_encontrado'
      | 'tribunal_nao_disponivel'
      | 'api_indisponivel'
      | 'timeout'
      | 'formato_invalido'
      | 'erro_desconhecido';
    mensagem: string;
    detalhes?: Record<string, unknown>;
  };
}
```

---

## 7. Algoritmo de Classificação de Risco

### 7.1 Fatores de Risco

O algoritmo avalia quatro fatores independentes e combina os resultados.

#### 7.1.1 Fator 1 — Ente Devedor

| Classificação | Nível | Critério |
|---|---|---|
| Federal | BAIXO | União Federal, INSS, Previdência, Forças Armadas, autarquias federais |
| Estadual | MÉDIO | Governo do Estado, Fazenda Estadual, autarquias estaduais |
| Municipal | ALTO | Prefeitura, Câmara Municipal, autarquias municipais |
| Não identificado | MÉDIO | Default conservador |

**Lógica de identificação:** análise textual do nome do polo passivo via keywords. Usar lista expansível de termos (ver Seção 4.1.7).

**Limitação conhecida:** alguns entes não são identificáveis apenas por nome. Em versões futuras, cruzar com banco de CNPJ do governo para confirmar esfera.

#### 7.1.2 Fator 2 — Etapa Processual

| Etapa | Nível | Movimentos Associados |
|---|---|---|
| Expedição/Pagamento | BAIXO | Expedição de RPV, Pagamento, Transferência, Depósito Judicial |
| Trânsito em Julgado | MÉDIO | Trânsito em julgado, Certidão, Extinção com mérito, Arquivamento |
| Em Recurso | ALTO | Recurso, Agravo, Apelação, Embargos, Suspensão, Liminar |
| Não identificado | MÉDIO | Default conservador |

#### 7.1.3 Fator 3 — Penhoras e Bloqueios

| Situação | Nível | Critério |
|---|---|---|
| Sem penhoras | BAIXO | Nenhum movimento relacionado encontrado |
| Com penhoras | ALTO | Qualquer ocorrência de: penhora, bloqueio, sequestro, arresto, constrição |

**Verificação:** busca textual nos nomes de todos os movimentos registrados.

#### 7.1.4 Fator 4 — Valor vs Limite RPV

| Situação | Nível | Critério |
|---|---|---|
| Dentro do limite | OK | `valor ≤ salário_mínimo × 60` |
| Acima do limite | RISCO | `valor > salário_mínimo × 60` |

**Limite 2026:** R$ 1.518,00 × 60 = **R$ 91.080,00**

Quando acima do limite, há risco de reclassificação do processo como precatório comum, não RPV.

### 7.2 Composição do Risco Geral

```
Entrada: riscoEnte, riscoEtapa, riscoPenhoras (cada um: 'baixo'|'medio'|'alto')
         riscoValor: 'ok'|'risco'

Regras (em ordem de prioridade):

1. Se qualquer fator = 'alto'         → Risco Geral = ALTO
2. Se 2 ou mais fatores = 'medio'     → Risco Geral = ALTO
3. Se riscoValor = 'risco'            → Risco Geral = no mínimo MÉDIO
4. Se exatamente 1 fator = 'medio'    → Risco Geral = MÉDIO
5. Todos os fatores = 'baixo' e valor OK → Risco Geral = BAIXO
```

**Visualização da matriz:**

```
Ente\Etapa  BAIXO     MÉDIO     ALTO
BAIXO       BAIXO     MÉDIO     ALTO
MÉDIO       MÉDIO     ALTO      ALTO
ALTO        ALTO      ALTO      ALTO

(+ ajuste por penhoras e valor acima do limite)
```

### 7.3 Limitações e Premissas

1. **Análise textual de movimentos:** a identificação de etapa e penhoras é baseada em keywords no texto dos movimentos do DataJud. Não há análise semântica profunda. A lista de keywords deve ser expandida com o uso.

2. **Identificação do ente devedor:** baseada em análise textual do nome. Funcionará bem para 90% dos casos comuns. Casos atípicos (consórcios, fundos, etc.) serão classificados como "Médio" por default.

3. **Limite RPV:** atualizar anualmente conforme novo salário mínimo. Armazenar `SALARIO_MINIMO` e `LIMITE_RPV_SALARIOS` como constantes no Code Node para fácil atualização.

4. **Histórico de penhoras:** o DataJud retorna movimentos, mas não necessariamente o estado atual. Uma penhora pode ter sido levantada. A ferramenta sinaliza a ocorrência histórica, não o estado atual.

---

## 8. Descrição dos Mockups de UI

### 8.1 Estado Inicial (idle)

```
╔═══════════════════════════════════════════════════════════════╗
║  ← Ferramentas                                                ║
║                                                               ║
║  Pré-Qualificação de RPV                                      ║
║  Consulte dados processuais antes de abordar o credor        ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │                                                         │  ║
║  │  Buscar por:                                            │  ║
║  │  ┌─────────────────────┐  ┌─────────────────────────┐  │  ║
║  │  │ ● Número do Processo│  │ ○  CPF do Credor        │  │  ║
║  │  └─────────────────────┘  └─────────────────────────┘  │  ║
║  │                                                         │  ║
║  │  ┌─────────────────────────────────────────────────┐   │  ║
║  │  │  Ex: 0001234-56.2024.8.26.0100                  │   │  ║
║  │  └─────────────────────────────────────────────────┘   │  ║
║  │                                                         │  ║
║  │  ┌─────────────────────────────────────────────────┐   │  ║
║  │  │              Consultar                          │   │  ║
║  │  └─────────────────────────────────────────────────┘   │  ║
║  │  (botão desabilitado — cinza)                           │  ║
║  └─────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════╝
```

**Características:**
- Botão "Consultar" desabilitado (cinza)
- Campo com placeholder informativo
- Radio buttons para escolher modo

### 8.2 Estado de Loading — Fluxo Processo

```
╔═══════════════════════════════════════════════════════════════╗
║  ← Ferramentas                                                ║
║                                                               ║
║  Pré-Qualificação de RPV                                      ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  Número do Processo  ●           CPF  ○                 │  ║
║  │  ┌─────────────────────────────────────────────────┐   │  ║
║  │  │  1234567-89.2023.8.26.0100                      │   │  ║
║  │  └─────────────────────────────────────────────────┘   │  ║
║  │  [Consultando...] (botão desabilitado + spinner)        │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │                                                         │  ║
║  │     🔍 Consultando DataJud...                           │  ║
║  │                                                         │  ║
║  │     ████████████████████░░░░░░░░░░░░  (animado)        │  ║
║  │                                                         │  ║
║  │     Isso pode levar até 30 segundos.                   │  ║
║  │                                                         │  ║
║  └─────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════╝
```

### 8.3 Estado de Loading — Fluxo CPF (etapa 1)

```
╔═══════════════════════════════════════════════════════════════╗
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  Número do Processo  ○           CPF  ●                 │  ║
║  │  ┌─────────────────────────────────────────────────┐   │  ║
║  │  │  123.456.789-01                                 │   │  ║
║  │  └─────────────────────────────────────────────────┘   │  ║
║  │  [Buscando processos...] (desabilitado + spinner)       │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │                                                         │  ║
║  │     🔍 Buscando processos no Escavador...               │  ║
║  │                                                         │  ║
║  │     ████████████░░░░░░░░░░░░░░░░░░  (animado)          │  ║
║  │                                                         │  ║
║  └─────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════╝
```

### 8.4 Estado de Seleção de Processo (fluxo CPF)

```
╔═══════════════════════════════════════════════════════════════╗
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  [formulário acima — sem loading]                       │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  2 processos RPV encontrados para CPF 123.456.789-01    │  ║
║  │  Selecione o processo que deseja qualificar:            │  ║
║  │                                                         │  ║
║  │  ┌─────────────────────────────────────────────────┐   │  ║
║  │  │ ○  1234567-89.2023.8.26.0100                    │   │  ║
║  │  │    TJ-SP  ·  3ª Vara da Fazenda Pública         │   │  ║
║  │  │    RPV  ·  R$ 45.230,00                         │   │  ║
║  │  ├─────────────────────────────────────────────────┤   │  ║
║  │  │ ○  9876543-21.2022.4.03.6100                    │   │  ║
║  │  │    TRF3  ·  1ª Vara Federal de SP               │   │  ║
║  │  │    RPV  ·  R$ 12.500,00                         │   │  ║
║  │  └─────────────────────────────────────────────────┘   │  ║
║  │                                                         │  ║
║  │  [  Consultar Processo Selecionado  ]                   │  ║
║  │  (botão desabilitado até selecionar)                    │  ║
║  └─────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════╝
```

### 8.5 Estado de Resultado — Risco Baixo

```
╔═══════════════════════════════════════════════════════════════╗
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  QUALIFICAÇÃO DE RPV                  ✅ RISCO: BAIXO   │  ║
║  │  ═══════════════════════════════════════════════════    │  ║
║  │                                                         │  ║
║  │  1234567-89.2023.8.26.0100                              │  ║
║  │                                                         │  ║
║  │  ┌─────────────────────┬───────────────────────────┐   │  ║
║  │  │ TRIBUNAL            │ VARA                      │   │  ║
║  │  │ TRF3                │ 1ª Vara Federal de SP     │   │  ║
║  │  └─────────────────────┴───────────────────────────┘   │  ║
║  │                                                         │  ║
║  │  ┌─────────────────────────────────────────────────┐   │  ║
║  │  │ ENTE DEVEDOR (POLO PASSIVO)                     │   │  ║
║  │  │ Instituto Nacional do Seguro Social - INSS      │   │  ║
║  │  └─────────────────────────────────────────────────┘   │  ║
║  │                                                         │  ║
║  │  ┌─────────────────────┬───────────────────────────┐   │  ║
║  │  │ NATUREZA PROCESSUAL │ VALOR                     │   │  ║
║  │  │ ✓ RPV               │ R$ 12.500,00              │   │  ║
║  │  └─────────────────────┴───────────────────────────┘   │  ║
║  │                                                         │  ║
║  │  ┌─────────────────────────────────────────────────┐   │  ║
║  │  │ MATÉRIAS                                        │   │  ║
║  │  │ • Benefícios em Espécie                        │   │  ║
║  │  │ • Aposentadoria por Invalidez                  │   │  ║
║  │  └─────────────────────────────────────────────────┘   │  ║
║  │                                                         │  ║
║  │  ┌─────────────────────────────────────────────────┐   │  ║
║  │  │ ÚLTIMA MOVIMENTAÇÃO                             │   │  ║
║  │  │ 10/01/2026 — Expedição de Requisição de        │   │  ║
║  │  │              Pequeno Valor - RPV               │   │  ║
║  │  └─────────────────────────────────────────────────┘   │  ║
║  │                                                         │  ║
║  │  ┌─────────────────────────────────────────────────┐   │  ║
║  │  │ CLASSIFICAÇÃO DE RISCO                          │   │  ║
║  │  │                                                 │   │  ║
║  │  │  Ente Devedor:   [✅ BAIXO]   Federal           │   │  ║
║  │  │  Etapa:          [✅ BAIXO]   Expedição/Pag.    │   │  ║
║  │  │  Penhoras:       [✅ BAIXO]   Nenhuma           │   │  ║
║  │  │  Valor (R$12.5k) [✅ OK]      Dentro do limite  │   │  ║
║  │  │                                                 │   │  ║
║  │  │  ─────────────────────────────────────────     │   │  ║
║  │  │  Risco Geral: ✅ BAIXO                          │   │  ║
║  │  └─────────────────────────────────────────────────┘   │  ║
║  │                                                         │  ║
║  │  [Nova Consulta]              [Copiar Dados]            │  ║
║  └─────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════╝
```

### 8.6 Estado de Resultado — Risco Alto

```
╔═══════════════════════════════════════════════════════════════╗
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  QUALIFICAÇÃO DE RPV                  🔴 RISCO: ALTO    │  ║
║  │  ═══════════════════════════════════════════════════    │  ║
║  │  ...                                                    │  ║
║  │                                                         │  ║
║  │  ┌─────────────────────────────────────────────────┐   │  ║
║  │  │ ⚠️  ATENÇÃO: Este processo foi classificado     │   │  ║
║  │  │    como "Cumprimento de Sentença contra a       │   │  ║
║  │  │    Fazenda Pública", não como RPV. Confirme     │   │  ║
║  │  │    antes de prosseguir.                         │   │  ║
║  │  └─────────────────────────────────────────────────┘   │  ║
║  │  ...                                                    │  ║
║  │  ┌─────────────────────────────────────────────────┐   │  ║
║  │  │ CLASSIFICAÇÃO DE RISCO                          │   │  ║
║  │  │                                                 │   │  ║
║  │  │  Ente Devedor:   [🔴 ALTO]    Municipal         │   │  ║
║  │  │  Etapa:          [🔴 ALTO]    Em recurso        │   │  ║
║  │  │  Penhoras:       [🔴 ALTO]    Penhora encontr.  │   │  ║
║  │  │  Valor (R$45k):  [✅ OK]      Dentro do limite  │   │  ║
║  │  │                                                 │   │  ║
║  │  │  ─────────────────────────────────────────     │   │  ║
║  │  │  Risco Geral: 🔴 ALTO                           │   │  ║
║  │  └─────────────────────────────────────────────────┘   │  ║
║  └─────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════╝
```

### 8.7 Estado de Erro — Processo Não Encontrado

```
╔═══════════════════════════════════════════════════════════════╗
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  [formulário — campos preenchidos, botão habilitado]    │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  ⚠️  Processo Não Encontrado                            │  ║
║  │  ─────────────────────────────────────────────────────  │  ║
║  │                                                         │  ║
║  │  O processo 1234567-89.2023.8.26.0100 não foi          │  ║
║  │  localizado no DataJud para o tribunal TJ-SP.           │  ║
║  │                                                         │  ║
║  │  Verifique se:                                          │  ║
║  │  • O número do processo está digitado corretamente      │  ║
║  │  • O processo não é sigiloso (acesso restrito)         │  ║
║  │  • O processo pertence ao tribunal identificado (TJ-SP) │  ║
║  │                                                         │  ║
║  │  [Tentar Novamente]                                     │  ║
║  └─────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════╝
```

### 8.8 Paleta de Cores

| Elemento | Cor | Hex |
|---|---|---|
| Risco BAIXO — texto | Verde escuro | `#16a34a` |
| Risco BAIXO — background | Verde claro | `#dcfce7` |
| Risco MÉDIO — texto | Amarelo escuro | `#ca8a04` |
| Risco MÉDIO — background | Amarelo claro | `#fef9c3` |
| Risco ALTO — texto | Vermelho escuro | `#dc2626` |
| Risco ALTO — background | Vermelho claro | `#fee2e2` |
| Aviso (não é RPV) | Âmbar | `#d97706` / `#fffbeb` |
| Botão primário | Índigo | `#4f46e5` |
| Borda de card | Cinza | `#e5e7eb` |
| Background do card | Branco | `#ffffff` |
| Loading bar | Índigo claro | `#a5b4fc` |

---

## 9. Checklist de Implementação

### Fase 0 — Preparação

- [ ] **0.1** Obter e testar chave de API do DataJud (CNJ)
  - Acessar `https://datajud-wiki.cnj.jus.br/api-publica/acesso`
  - Testar com curl: `curl -X POST https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search -H "Authorization: APIKey {chave}" -H "Content-Type: application/json" -d '{"query":{"match":{"numeroProcesso":"NUMERO_REAL"}}}'`
- [ ] **0.2** Confirmar com Escavador o endpoint exato para busca por CPF
  - Documentação, plano contratado, exemplos de response
- [ ] **0.3** Adicionar variáveis no n8n Cloud:
  - `DATAJUD_API_KEY` → Settings > Variables
  - `ESCAVADOR_API_KEY` → Settings > Variables

### Fase 1 — Workflow A: Consulta por Processo

- [ ] **1.1** Criar workflow `rpv-consulta-processo` no n8n Cloud
- [ ] **1.2** Adicionar nó Webhook Trigger (path: `rpv-processo`, POST, responseMode: responseNode)
- [ ] **1.3** Adicionar nó Code "Extrair Tribunal" com o algoritmo de mapeamento de código CNJ → tribunal DataJud
- [ ] **1.4** Adicionar nó HTTP Request para DataJud com autenticação via `$vars.DATAJUD_API_KEY`
- [ ] **1.5** Adicionar nó IF "Processo Encontrado?" verificando `hits.total.value > 0`
- [ ] **1.6** Adicionar nó Code "Mapear Campos" no branch TRUE do IF
- [ ] **1.7** Adicionar nó Code "Calcular Risco" após mapeamento
- [ ] **1.8** Adicionar nó Respond to Webhook "Sucesso" (HTTP 200 + JSON estruturado)
- [ ] **1.9** Adicionar nó Respond to Webhook "Não Encontrado" (HTTP 404 + JSON de erro) no branch FALSE
- [ ] **1.10** Testar o workflow com ao menos 3 números de processo reais:
  - [ ] Um processo TJ-SP
  - [ ] Um processo TRF
  - [ ] Um processo inválido/inexistente
- [ ] **1.11** Ativar o workflow

### Fase 2 — Workflow B: Consulta por CPF

- [ ] **2.1** Criar workflow `rpv-consulta-cpf` no n8n Cloud
- [ ] **2.2** Adicionar nó Webhook Trigger (path: `rpv-cpf`, POST)
- [ ] **2.3** Adicionar nó Code "Normalizar CPF"
- [ ] **2.4** Adicionar nó HTTP Request para Escavador com autenticação
- [ ] **2.5** Adicionar nó IF "Processos Encontrados?"
- [ ] **2.6** Adicionar nó Code "Filtrar e Mapear RPVs" no branch TRUE
- [ ] **2.7** Adicionar nó Respond "Lista de Processos" (HTTP 200)
- [ ] **2.8** Adicionar nó Respond "CPF Não Encontrado" (HTTP 404) no branch FALSE
- [ ] **2.9** Testar o workflow com CPF real que tenha processos no Escavador
- [ ] **2.10** Ativar o workflow

### Fase 3 — Frontend: Serviço e Hook

- [ ] **3.1** Criar arquivo `src/services/preQualificacaoService.js`
  - [ ] Função `consultarPorProcesso(numeroProcesso)`
  - [ ] Função `consultarPorCPF(cpf)`
  - [ ] Tratamento de erros por código HTTP
  - [ ] AbortController com timeout de 30 segundos
- [ ] **3.2** Criar arquivo `src/hooks/usePreQualificacao.js`
  - [ ] Máquina de estados (idle → loading → resultado/erro)
  - [ ] Função `buscarPorProcesso`
  - [ ] Função `buscarPorCPF`
  - [ ] Função `selecionarProcesso`
  - [ ] Função `limpar`

### Fase 4 — Frontend: Componentes

- [ ] **4.1** Criar `src/components/ferramentas/pre-qualificacao/RiscoBadge.jsx`
  - [ ] Props: nivel, size
  - [ ] Cores corretas por nível
  - [ ] Labels em português

- [ ] **4.2** Criar `src/components/ferramentas/pre-qualificacao/CampoInfo.jsx`
  - [ ] Props: label, value, className
  - [ ] Componente atômico reutilizável

- [ ] **4.3** Criar `src/components/ferramentas/pre-qualificacao/SearchForm.jsx`
  - [ ] Toggle Processo/CPF
  - [ ] Input com máscara automática
  - [ ] Validação de formato Processo (regex CNJ)
  - [ ] Validação de formato CPF (regex + dígitos verificadores)
  - [ ] Botão desabilitado quando vazio ou inválido
  - [ ] Estado de loading no botão

- [ ] **4.4** Criar `src/components/ferramentas/pre-qualificacao/ProcessoSelector.jsx`
  - [ ] Lista de radio buttons de processos
  - [ ] Exibição de tribunal, vara, classe e valor
  - [ ] Botão "Consultar" desabilitado até seleção
  - [ ] Estado vazio (sem processos RPV)

- [ ] **4.5** Criar `src/components/ferramentas/pre-qualificacao/QualificacaoCard.jsx`
  - [ ] Layout de grid com todos os 9 campos
  - [ ] Seção de classificação de risco com badges individuais e risco geral
  - [ ] Aviso para processos que não são RPV
  - [ ] Botão "Nova Consulta"
  - [ ] Botão "Copiar Dados" com formatação texto

- [ ] **4.6** Criar `src/components/ferramentas/pre-qualificacao/ErrorDisplay.jsx`
  - [ ] Layout por tipo de erro
  - [ ] Mensagens orientadas para ação do usuário
  - [ ] Botão "Tentar Novamente"

### Fase 5 — Frontend: Páginas

- [ ] **5.1** Criar `src/pages/ferramentas/PreQualificacaoRPV.jsx`
  - [ ] Importar e usar `usePreQualificacao`
  - [ ] Renderização condicional por status
  - [ ] Breadcrumb (Ferramentas > Pré-Qualificação de RPV)
  - [ ] Loading state com barra de progresso animada

- [ ] **5.2** Criar `src/pages/Ferramentas.jsx`
  - [ ] Card da ferramenta com link para `/ferramentas/pre-qualificacao`

- [ ] **5.3** Atualizar `src/App.jsx` (ou arquivo de rotas)
  - [ ] Adicionar rota `/ferramentas`
  - [ ] Adicionar rota `/ferramentas/pre-qualificacao`

- [ ] **5.4** Atualizar componente de navegação lateral
  - [ ] Adicionar item "Ferramentas" no menu
  - [ ] Adicionar sub-item "Pré-Qualificação RPV"
  - [ ] Highlight de item ativo com `NavLink`

### Fase 6 — Testes de Ponta a Ponta

- [ ] **6.1** Fluxo completo Processo → Resultado (processo INSS, risco baixo esperado)
- [ ] **6.2** Fluxo completo Processo → Resultado (processo municipal, risco alto esperado)
- [ ] **6.3** Fluxo CPF → Seleção → Resultado
- [ ] **6.4** Fluxo com número de processo inválido (validação frontend)
- [ ] **6.5** Fluxo com CPF inválido (validação frontend)
- [ ] **6.6** Fluxo com processo não encontrado (erro 404 da API)
- [ ] **6.7** Fluxo com API DataJud lenta (testar timeout de 30s)
- [ ] **6.8** Verificar funcionamento do botão "Copiar Dados"
- [ ] **6.9** Verificar responsividade da página em telas menores (1280px, 1440px)

### Fase 7 — Deploy

- [ ] **7.1** Confirmar que a URL base do n8n está correta em `preQualificacaoService.js`
- [ ] **7.2** Confirmar que os webhooks estão ativos no n8n Cloud
- [ ] **7.3** Deploy no Vercel via push para branch principal
- [ ] **7.4** Testar em produção com processo real

---

### Dependências Críticas

Antes de iniciar o desenvolvimento, as seguintes dependências externas DEVEM estar resolvidas:

1. **Chave de API DataJud:** sem ela, o Workflow A não funciona. Obter em `https://datajud-wiki.cnj.jus.br/api-publica/acesso`.

2. **Documentação e chave da API Escavador:** a estrutura do Workflow B depende da resposta real da API. Confirmar com o fornecedor antes de codificar o nó de filtro de RPVs.

3. **Número de processo real para teste:** ter ao menos um processo RPV real (com número CNJ correto) para validar o mapeamento de tribunais e o retorno do DataJud antes de implementar a UI.

---

### Critical Files for Implementation

- `/Users/n8n-mcp/dashboard/src/App.jsx` - Arquivo de rotas para adicionar as novas rotas `/ferramentas` e `/ferramentas/pre-qualificacao`
- `/Users/n8n-mcp/dashboard/src/pages/Comercial.jsx` - Padrão de página existente a seguir (estrutura, imports, uso de hooks, layout)
- `/Users/n8n-mcp/dashboard/src/components/DateRangePicker.jsx` - Padrão de componente existente (estrutura JSX, estado interno, props)
- `/Users/n8n-mcp/dashboard/src/pages/ferramentas/PreQualificacaoRPV.jsx` - Arquivo principal a criar (orquestração de todos os sub-componentes)
- `/Users/n8n-mcp/dashboard/src/services/preQualificacaoService.js` - Arquivo de serviço a criar (comunicação com n8n webhooks)
