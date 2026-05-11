import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { execSync } from 'child_process'
import { config } from 'dotenv'

const repoRoot = resolve(__dirname, '../../../')
config({ path: join(repoRoot, 'apps/web/.env.local') })
config({ path: join(repoRoot, '.env.local') })

const migrationsDir = resolve(__dirname, '../migrations')

const getMigrationFiles = (): string[] =>
  readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

const run = async () => {
  const files = getMigrationFiles()

  if (files.length === 0) {
    console.log('No migration files found in', migrationsDir)
    process.exit(0)
  }

  console.log('Running migrations via Supabase CLI (--linked)...\n')

  try {
    for (const file of files) {
      const filePath = join(migrationsDir, file)
      console.log(`Running migration: ${file}`)
      execSync(`npx supabase db query --linked -f "${filePath}"`, {
        cwd: repoRoot,
        stdio: 'pipe',
      })
      console.log(`  Done.`)
    }

    console.log(`\nAll ${files.length} migration(s) applied successfully.`)
  } catch (err: any) {
    console.error('\nMigration failed:', err.stderr?.toString() || err.message)
    process.exit(1)
  }
}

run()
