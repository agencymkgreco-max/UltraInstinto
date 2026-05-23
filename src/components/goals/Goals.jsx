import { useState } from 'react'
import { Plus, Trash2, CheckCircle, Star } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { useAuth } from '../../hooks/useAuth'
import { calculatePowerLevel, DBZ_LEVELS, formatPowerNumber } from '../../lib/powerLevel'

const CATEGORIES = [
  { value: 'dinero', label: '💰 Dinero / Finanzas', color: '#f59e0b' },
  { value: 'estetica', label: '💪 Estética Corporal', color: '#06b6d4' },
  { value: 'personal', label: '🎯 Meta Personal', color: '#7c3aed' },
  { value: 'espiritual', label: '✝️ Espiritual', color: '#c4b5fd' },
]

export default function Goals() {
  const { user } = useAuth()
  const { data: goals, insert, update, remove } = useData('goals', user?.id)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'personal', target_value: '', current_value: '', unit: 'MXN', is_main_goal: false })
  const [editing, setEditing] = useState(null) // { id, current_value }

  const power = calculatePowerLevel(goals)

  const handleAdd = async () => {
    if (!form.title || !form.target_value) return
    await insert(form)
    setForm({ title: '', description: '', category: 'personal', target_value: '', current_value: '', unit: 'MXN', is_main_goal: false })
    setShowForm(false)
  }

  const handleUpdateProgress = async (goal) => {
    await update(goal.id, { current_value: Number(editing.value), updated_at: new Date().toISOString() })
    setEditing(null)
  }

  const getProgress = (g) => {
    if (!g.target_value) return 0
    return Math.min((g.current_value / g.target_value) * 100, 100)
  }

  return (
    <div>
      {/* Power Level Hero */}
      <div className="card card-glow mb-3" style={{
        background: `linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))`,
        textAlign: 'center', padding: '2rem'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }} className="float-anim">{power.level.icon}</div>
        <h2 className={`font-display ${power.level.level === 11 ? 'ultra-glow' : ''}`}
          style={{ color: power.level.color, marginBottom: '0.3rem' }}>
          {power.level.name}
        </h2>
        <div className="text-secondary text-sm mb-2">
          Nivel de Poder: <strong style={{ color: power.level.color }}>{formatPowerNumber(power.percentage)}</strong>
        </div>
        <div className="power-bar-track" style={{ maxWidth: '400px', margin: '0 auto', height: '12px' }}>
          <div className="power-bar-fill" style={{
            width: `${power.progressToNext}%`,
            background: `linear-gradient(90deg, ${power.level.color}, ${power.nextLevel?.color || power.level.color})`,
            boxShadow: `0 0 15px ${power.level.color}`
          }} />
        </div>
        {power.nextLevel && (
          <p className="text-xs text-secondary mt-1">
            {power.progressToNext}% hacia {power.nextLevel.icon} {power.nextLevel.name}
          </p>
        )}
        {power.level.level === 11 && (
          <p className="text-sm mt-2" style={{ color: 'var(--ultra)' }}>
            ✨ ¡Has alcanzado el Ultra Instinto! ¡Sigue más allá!
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mb-3">
        <h1 style={{ fontSize: '1.4rem' }}>🎯 Mis Metas</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Nueva Meta
        </button>
      </div>

      {showForm && (
        <div className="card mb-3" style={{ borderColor: 'var(--border-glow)' }}>
          <h3 className="mb-2">Definir Meta</h3>
          <div className="mb-1">
            <label className="text-xs text-secondary">Nombre de tu meta</label>
            <input className="input" placeholder="Ej: Ganar $50,000/mes, Llegar a 75kg..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="mb-1">
            <label className="text-xs text-secondary">Descripción (opcional)</label>
            <input className="input" placeholder="¿Por qué es importante esta meta?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid-2 mb-1">
            <div>
              <label className="text-xs text-secondary">Categoría</label>
              <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-secondary">Unidad</label>
              <input className="input" placeholder="MXN, kg, %, km..." value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
            </div>
          </div>
          <div className="grid-2 mb-1">
            <div>
              <label className="text-xs text-secondary">Valor Meta (Ultra Instinto)</label>
              <input className="input" type="number" placeholder="100000" value={form.target_value} onChange={e => setForm(p => ({ ...p, target_value: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-secondary">Progreso Actual</label>
              <input className="input" type="number" placeholder="0" value={form.current_value} onChange={e => setForm(p => ({ ...p, current_value: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center gap-1 mb-2">
            <input type="checkbox" id="main" checked={form.is_main_goal} onChange={e => setForm(p => ({ ...p, is_main_goal: e.target.checked }))} style={{ accentColor: 'var(--accent-gold)' }} />
            <label htmlFor="main" className="text-sm" style={{ color: 'var(--accent-gold)', cursor: 'pointer' }}>
              ⭐ Esta es mi meta principal (Ultra Instinto)
            </label>
          </div>
          <div className="flex gap-1">
            <button className="btn btn-primary" onClick={handleAdd}>Guardar Meta</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {goals.length === 0 && (
          <div className="card text-center text-secondary" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
            <p>Define tu primera meta y comienza tu camino al Ultra Instinto</p>
          </div>
        )}
        {goals.map(g => {
          const progress = getProgress(g)
          const cat = CATEGORIES.find(c => c.value === g.category)
          const dbzLevel = [...DBZ_LEVELS].reverse().find(l => progress >= l.minPower) || DBZ_LEVELS[0]

          return (
            <div key={g.id} className="card" style={{ borderColor: g.is_main_goal ? 'rgba(245,158,11,0.5)' : 'var(--border)' }}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {g.is_main_goal && <Star size={16} style={{ color: 'var(--accent-gold)', fill: 'var(--accent-gold)' }} />}
                  <span style={{ fontSize: '1.2rem' }}>{dbzLevel.icon}</span>
                  <div>
                    <h3>{g.title}</h3>
                    {g.description && <p className="text-xs text-secondary">{g.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="badge" style={{ background: `${cat?.color}22`, color: cat?.color }}>{cat?.label.split(' ')[0]}</span>
                  <button className="btn btn-danger" style={{ padding: '0.3rem' }} onClick={() => remove(g.id)}><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-secondary mb-1">
                  <span style={{ color: dbzLevel.color }}>{dbzLevel.name}</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="power-bar-track" style={{ height: '10px' }}>
                  <div className="power-bar-fill" style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${dbzLevel.color}, ${cat?.color || dbzLevel.color})`,
                    boxShadow: progress > 80 ? `0 0 10px ${dbzLevel.color}` : 'none'
                  }} />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span style={{ color: 'var(--accent-gold)' }}>{Number(g.current_value).toLocaleString('es-MX')} {g.unit}</span>
                  <span className="text-secondary">Meta: {Number(g.target_value).toLocaleString('es-MX')} {g.unit}</span>
                </div>
              </div>

              {/* Update progress */}
              {editing?.id === g.id ? (
                <div className="flex gap-1">
                  <input className="input" type="number" value={editing.value} onChange={e => setEditing(p => ({ ...p, value: e.target.value }))} style={{ flex: 1 }} placeholder="Nuevo progreso..." />
                  <button className="btn btn-primary" onClick={() => handleUpdateProgress(g)}>✓</button>
                  <button className="btn btn-ghost" onClick={() => setEditing(null)}>✕</button>
                </div>
              ) : (
                <button className="btn btn-ghost" style={{ fontSize: '0.8rem', width: '100%' }}
                  onClick={() => setEditing({ id: g.id, value: g.current_value })}>
                  📊 Actualizar Progreso
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
