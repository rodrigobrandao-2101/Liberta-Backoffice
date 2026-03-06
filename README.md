# Liberta Backoffice

Sistema interno de dados e dashboards da Liberta Precatorio.

## Estrutura

```
backoffice/
├── dashboard/               # App React+Vite — deploy no Vercel
│   └── src/docs/            # Copia dos markdowns (gerada por sync-docs.sh)
└── inteligencia-mercado/    # Documentacao interna — EDITAR AQUI
```

## Regra dos markdowns

Edite sempre em `inteligencia-mercado/`. Depois rode o sync para o dashboard:

```bash
./sync-docs.sh
```

## Stack

- **Frontend:** React 19 + Vite + Recharts + react-router-dom
- **Backend:** Supabase (PostgreSQL)
- **Automacao:** n8n Cloud
- **CRM:** Pipefy
- **Deploy:** Vercel (pasta `dashboard/`)

## Deploy (Vercel)

| Configuracao    | Valor      |
|-----------------|------------|
| Root Directory  | `dashboard`|
| Build Command   | `npm run build` |
| Output Dir      | `dist`     |
| Framework       | Vite       |
