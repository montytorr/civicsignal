import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const createServerClient = (url: string, serviceRoleKey: string) =>
  createClient<Database>(url, serviceRoleKey)

export const createBrowserClient = (url: string, anonKey: string) =>
  createClient<Database>(url, anonKey)
