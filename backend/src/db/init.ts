import { runMigrations } from './migrate'
import { seedDemo } from './seedDemo'

export async function ensureSchema() {
  await runMigrations()
  // Optional demo seed; safe to run repeatedly. Avoid ending pool here.
  await seedDemo()
}
