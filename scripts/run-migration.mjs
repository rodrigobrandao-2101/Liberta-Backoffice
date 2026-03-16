/**
 * Executa a migração 001 no Supabase via Management API
 * Uso: node scripts/run-migration.mjs
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jfclxizmtdsxatwsxznb.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'jfclxizmtdsxatwsxznb'

// Lê o arquivo SQL
const sqlPath = join(__dirname, '../docs/data-infra/migrations/001_create_pipe_tables.sql')
const sql = readFileSync(sqlPath, 'utf-8')

async function runMigration() {
  console.log('🚀 Executando migração 001...')
  console.log(`   Projeto: ${PROJECT_REF}`)
  console.log(`   SQL: ${sqlPath}`)
  console.log('')

  // Tenta via Management API (api.supabase.com)
  // Nota: requer access token da conta supabase.com (não o service_role do projeto)
  // Alternativa: via PostgREST com função exec_sql

  // Estratégia: dividir SQL em statements individuais e executar via RPC
  // Para isso, precisamos criar a função exec_sql primeiro via fetch direto ao banco

  // Abordagem 1: Supabase Management API
  const mgmtUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`

  // Dividir em statements (separar por ; ignorando strings)
  const statements = sql
    .split(/;(\s*\n)/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`📋 Total de statements: ${statements.length}`)
  console.log('')

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    if (!stmt || stmt.length < 3) continue

    const preview = stmt.substring(0, 60).replace(/\n/g, ' ')
    process.stdout.write(`[${i+1}/${statements.length}] ${preview}... `)

    try {
      const res = await fetch(mgmtUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: stmt })
      })

      if (res.ok) {
        console.log('✅')
        successCount++
      } else {
        const body = await res.text()
        // Ignorar "already exists" errors (idempotente)
        if (body.includes('already exists') || body.includes('duplicate')) {
          console.log('⚠️  já existe (OK)')
          successCount++
        } else {
          console.log(`❌ ${res.status}: ${body.substring(0, 100)}`)
          errorCount++
        }
      }
    } catch (err) {
      console.log(`❌ ERRO: ${err.message}`)
      errorCount++
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 100))
  }

  console.log('')
  console.log(`✅ Concluído: ${successCount} OK, ${errorCount} erros`)
}

runMigration().catch(console.error)
