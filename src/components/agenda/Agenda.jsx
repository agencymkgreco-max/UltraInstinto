import { useState } from 'react'
import { Plus, Trash2, CheckCircle, Circle, Calendar } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { useAuth } from '../../hooks/useAuth'

const TYPES = [
  { value: 'tarea', label: '✅ Tarea', color: 'var(--accent-blue)' },
  { value: 'evento', label: '📅 Evento', color: 'var(--accent-purple)' },
  { value: 'recordatorio', label: '🔔 Recordatorio', color: 'var(--accent-gold)' },
]
const PRIORITIES = [
  { value: 'alta', label: '🔴 Alta' },
  { value: 'media', label: '🟡 Media' },
  { value: 'baja', label: '🟢 Baja' },
]

export default function Agenda() {
  const { user } = useAuth()
  const { data: items, insert, update, remove } = useData('agenda_items', user?.id)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('hoy')
  const [form, setForm] = useState({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '', type: 'tarea', priority: 'media' })

  const today = new Date().toISOString().split('T')[0]

  const filtered = items.filter(i => {
    if (filter === 'hoy') return i.date === today
    if (filter === 'semana') {
      const d = new Date(i.date)
      const now = new Date()
      const diff = (d - now) / (1000 * 60 * 60 * 24)
      return diff >= -1 && diff <= 7
    }
    if (filter === 'pendientes') return !i.completed
    return true
  })

  const handleAdd = async () => {
    if (!form.title || !form.date) return
    await insert(form)
    setForm({ title: '', description: '', date: today, time: '', type: 'tarea', priority: 'media' })
    setShowForm(false)
  }

  const toggle = (item) => update(item.id, { completed: !item.completed })

  const priorityColor = { alta: 'var(--danger)', media: 'var(--accent-gold)', baja: 'var(--success)' }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h1 style={{ fontSize: '1.4rem' }}>📅 Agenda</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Agregar
        </button>
      </div>

      {showForm && (
        <div className="card mb-3" style={{ borderColor: 'var(--border-glow)' }}>
          <h3 className="mb-2">Nuevo Elemento</h3>
          <div className="mb-1">
            <label className="text-xs text-secondary">Título</label>
            <input className="input" placeholder="¿Qué tienes que hacer?" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="grid-2 mb-1">
            <div>
              <label className="text-xs text-secondary">Tipo</label>
              <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-secondary">Prioridad</label>
              <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2 mb-1">
            <div>
              <label className="text-xs text-secondary">Fecha</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-secondary">Hora (opcional)</label>
              <input className="input" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
            </div>
          </div>
          <div className="mb-2">
            <label className="text-xs text-secondary">Notas</label>
            <input className="input" placeholder="Detalles adicionales..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="flex gap-1">
            <button className="btn btn-primary" onClick={handleAdd}>Guardar</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-1 mb-3">
        {['hoy', 'semana', 'pendientes', 'todos'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.length === 0 && (
          <div className="card text-center text-secondary" style={{ padding: '2rem' }}>
            <Calendar size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p>Sin elementos para esta vista</p>
          </div>
        )}
        {filtered.sort((a, b) => a.completed - b.completed).map(item => {
          const type = TYPES.find(t => t.value === item.type)
          return (
            <div key={item.id} className="card flex items-center gap-2"
              style={{ padding: '1rem', opacity: item.completed ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <button onClick={() => toggle(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                {item.completed
                  ? <CheckCircle size={22} style={{ color: 'var(--success)' }} />
                  : <Circle size={22} style={{ color: priorityColor[item.priority] }} />}
              </button>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-1">
                  <span style={{ fontWeight: 500, textDecoration: item.completed ? 'line-through' : 'none' }}>{item.title}</span>
                  <span className="badge text-xs" style={{ background: `${type?.color}22`, color: type?.color }}>{type?.label.split(' ')[0]}</span>
                </div>
                <div className="text-xs text-secondary">{item.date}{item.time ? ` a las ${item.time}` : ''} {item.description && `• ${item.description}`}</div>
              </div>
              <button className="btn btn-danger" style={{ padding: '0.3rem', flexShrink: 0 }} onClick={() => remove(item.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
