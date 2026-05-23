import { useState, useEffect, useCallback } from 'react'
import { supabase, getDB, saveOffline } from '../lib/db'

export const useData = (table, userId) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      if (isOnline) {
        const { data: rows, error } = await supabase.from(table).select('*').eq('user_id', userId).order('created_at', { ascending: false })
        if (!error && rows) {
          setData(rows)
          // Actualizar IDB con datos frescos
          const db = await getDB()
          for (const row of rows) await db.put(table, row)
        }
      } else {
        // Cargar desde IndexedDB
        const db = await getDB()
        const rows = await db.getAll(table)
        setData(rows.filter(r => r.user_id === userId))
      }
    } catch (e) {
      // Fallback a IndexedDB
      const db = await getDB()
      const rows = await db.getAll(table)
      setData(rows.filter(r => r.user_id === userId))
    } finally {
      setLoading(false)
    }
  }, [table, userId, isOnline])

  useEffect(() => { load() }, [load])

  const insert = async (item) => {
    const newItem = { ...item, user_id: userId, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    setData(prev => [newItem, ...prev])

    if (isOnline) {
      const { error } = await supabase.from(table).insert(newItem)
      if (error) await saveOffline(table, newItem)
    } else {
      await saveOffline(table, newItem)
    }
    return newItem
  }

  const update = async (id, updates) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    const updated = { ...data.find(r => r.id === id), ...updates, updated_at: new Date().toISOString() }

    if (isOnline) {
      const { error } = await supabase.from(table).update(updates).eq('id', id)
      if (error) await saveOffline(table, updated)
    } else {
      await saveOffline(table, updated)
    }
  }

  const remove = async (id) => {
    setData(prev => prev.filter(r => r.id !== id))

    if (isOnline) {
      await supabase.from(table).delete().eq('id', id)
    } else {
      await saveOffline(table, { id }, 'delete')
    }
  }

  return { data, loading, insert, update, remove, refresh: load, isOnline }
}
