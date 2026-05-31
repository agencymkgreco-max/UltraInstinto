import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { useAuth } from '../../hooks/useAuth'

const COLORES = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#f97316', '#8b5cf6', '#06b6d4', '#14b8a6']

export default function Habits() {
  const { user } = useAuth()
  const { data: habitos, insert: addHabito, remove: removeHabito } = useData('habitos', user?.id)
  const { data: tracking, update: updateTracking } = useData('habito_tracking', user?.id)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', activo: true })

  const handleAddHabito = async () => {
    if (!form.nombre) return
    const nuevoHabito = await addHabito(form)
    
    // Crear entradas de tracking para 31 días
    if (nuevoHabito) {
      for (let dia = 1; dia <= 31; dia++) {
        const trackId = `${nuevoHabito.id}_${dia}`
        // Insertamos usando la tabla habito_tracking
        await addHabito({ 
          habito_id: nuevoHabito.id, 
          dia, 
          completado: false,
          id: trackId 
        })
      }
    }
    
    setForm({ nombre: '', descripcion: '', activo: true })
    setShowForm(false)
  }

  const toggleDia = async (habitoId, dia, currentState) => {
    const trackingItem = tracking.find(t => t.habito_id === habitoId && t.dia === dia)
    if (trackingItem) {
      await updateTracking(trackingItem.id, { completado: !currentState })
    }
  }

  const getHabitoProgress = (habitoId) => {
    const items = tracking.filter(t => t.habito_id === habitoId)
    if (items.length === 0) return 0
    const completados = items.filter(t => t.completado).length
    return Math.round((completados / items.length) * 100)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h1 style={{ fontSize: '1.4rem' }}>📊 Hábitos</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Nuevo Hábito
        </button>
      </div>

      {showForm && (
        <div className="card mb-3" style={{ borderColor: 'var(--border-glow)' }}>
          <h3 className="mb-2">Crear Nuevo Hábito</h3>
          <div className="mb-2">
            <label className="text-xs text-secondary">Nombre del Hábito</label>
            <input 
              className="input" 
              placeholder="Ej: Ejercicio, Meditación, Lectura..." 
              value={form.nombre} 
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} 
            />
          </div>
          <div className="mb-2">
            <label className="text-xs text-secondary">Descripción (opcional)</label>
            <textarea 
              className="input" 
              placeholder="¿Por qué es importante este hábito?" 
              value={form.descripcion} 
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              style={{ minHeight: '80px' }}
            />
          </div>
          <div className="flex gap-1">
            <button className="btn btn-primary" onClick={handleAddHabito}>Guardar Hábito</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {habitos.length === 0 ? (
        <div className="card text-center text-secondary" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
          <p>No tienes hábitos registrados aún</p>
          <p className="text-sm mt-1">Crea tu primer hábito y comienza a rastrear tu progreso</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {habitos.map((habito, idx) => {
            const progress = getHabitoProgress(habito.id)
            const diasCompletos = tracking.filter(t => t.habito_id === habito.id && t.completado).length

            return (
              <div key={habito.id} className="card">
                {/* Header del hábito */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 style={{ color: COLORES[idx % COLORES.length], marginBottom: '0.3rem' }}>
                      {habito.nombre}
                    </h3>
                    {habito.descripcion && (
                      <p className="text-xs text-secondary">{habito.descripcion}</p>
                    )}
                  </div>
                  <button className="btn btn-danger" style={{ padding: '0.3rem' }} onClick={() => removeHabito(habito.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Progreso */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-secondary">Progreso</span>
                    <span style={{ fontWeight: 700, color: COLORES[idx % COLORES.length] }}>
                      {diasCompletos}/31 días • {progress}%
                    </span>
                  </div>
                  <div className="power-bar-track">
                    <div 
                      className="power-bar-fill"
                      style={{
                        width: `${progress}%`,
                        background: COLORES[idx % COLORES.length],
                        boxShadow: progress > 0 ? `0 0 15px ${COLORES[idx % COLORES.length]}` : 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Grid de 31 días */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '0.4rem'
                }}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => {
                    const trackingItem = tracking.find(t => t.habito_id === habito.id && t.dia === dia)
                    const isComplete = trackingItem?.completado || false

                    return (
                      <button
                        key={dia}
                        onClick={() => toggleDia(habito.id, dia, isComplete)}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '8px',
                          border: `2px solid ${isComplete ? COLORES[idx % COLORES.length] : 'var(--border)'}`,
                          background: isComplete ? `${COLORES[idx % COLORES.length]}22` : 'var(--bg-base)',
                          color: isComplete ? COLORES[idx % COLORES.length] : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.boxShadow = isComplete ? `0 0 10px ${COLORES[idx % COLORES.length]}` : 'none'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        {dia}
                        {isComplete && <span style={{ position: 'absolute', fontSize: '0.6rem' }}>✓</span>}
                      </button>
                    )
                  })}
                </div>

                {/* Leyenda */}
                <div className="flex gap-2 mt-3" style={{ fontSize: '0.75rem', justifyContent: 'center' }}>
                  <div className="flex items-center gap-1">
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background: `${COLORES[idx % COLORES.length]}22`,
                      border: `2px solid ${COLORES[idx % COLORES.length]}`
                    }} />
                    <span className="text-secondary">Completado</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background: 'var(--bg-base)',
                      border: '2px solid var(--border)'
                    }} />
                    <span className="text-secondary">Pendiente</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
