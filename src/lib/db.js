import { createClient } from '@supabase/supabase-js'
import { openDB } from 'idb'

// ── Supabase ──────────────────────────────────────────────────
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
)

// ── IndexedDB (offline) ───────────────────────────────────────
const DB_NAME = 'ultrainstinto-offline'
const DB_VERSION = 1

const STORES = ['goals', 'wallets', 'transactions', 'budget_rules', 'agenda_items', 'notes', 'sync_queue']

export const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      STORES.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' })
        }
      })
    }
  })
}

// ── Helper: guarda en IDB y encola sincronización ─────────────
export const saveOffline = async (store, data, action = 'upsert') => {
  const db = await getDB()
  const item = { ...data, _pendingSync: true, _action: action, _timestamp: Date.now() }
  await db.put(store, item)
  // Encolar para sync cuando vuelva el internet
  await db.put('sync_queue', { id: `${store}_${data.id}_${Date.now()}`, store, data, action })
  return item
}

// ── Sincronizar cola offline con Supabase ─────────────────────
export const syncOfflineQueue = async () => {
  const db = await getDB()
  const queue = await db.getAll('sync_queue')
  if (queue.length === 0) return

  for (const item of queue) {
    try {
      const { store, data, action } = item
      const tableName = store

      if (action === 'upsert') {
        await supabase.from(tableName).upsert(data)
      } else if (action === 'delete') {
        await supabase.from(tableName).delete().eq('id', data.id)
      }

      await db.delete('sync_queue', item.id)

      // Marcar como sincronizado en IDB
      const stored = await db.get(store, data.id)
      if (stored) {
        stored._pendingSync = false
        await db.put(store, stored)
      }
    } catch (e) {
      console.warn('Sync failed for item:', item.id, e)
    }
  }
}

// Escuchar cuando vuelve el internet
window.addEventListener('online', () => {
  console.log('🔄 Reconectado - sincronizando datos offline...')
  syncOfflineQueue()
})
