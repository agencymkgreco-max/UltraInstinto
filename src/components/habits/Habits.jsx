import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { supabase } from '../../lib/db'
import { useAuth } from '../../hooks/useAuth'

const COLORES = [
  '#c4b5fd', '#06b6d4', '#f59e0b', '#10b981',
  '#ec4899', '#3b82f6', '#f97316', '#a78bfa',
  '#34d399', '#fb7185'
]

const DIAS = Array.from({ length: 31 }, (_, i) => i + 1)

export default function Habits() {
  const { user } = useAuth()
  const [habitos, setHabitos] = useState([])
  const [tracking, setTracking] = useState({}) // { habitoId_dia: true/false }
  const [showForm, setShowForm] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [loading, setLoading] = useState(true)

  // Cargar hábitos y tracking
  const cargarDatos = async () => {
    if (!user?.id) return
    setLoading(true)
    const { data: h } = await supabase.from('habitos').select('*').eq('user_id', user.id).order('created_at')
    setHabitos(h || [])

    const { data: t } = await supabase.from('habito_tracking').select('*')
      .in('habito_id', (h || []).map(x => x.id))
    const map = {}
    ;(t || []).forEach(item => { map[`${item.habito_id}_${item.dia}`] = { id: item.id, completado: item.completado } })
    setTracking(map)
    setLoading(false)
  }

  useEffect(() => { cargarDatos() }, [user?.id])

  const agregarHabito = async () => {
    if (!nuevoNombre.trim() || habitos.length >= 10) return
    const { data } = await supabase.from('habitos').insert({
      user_id: user.id,
      nombre: nuevoNombre.trim(),
      activo: true
    }).select().single()
    if (data) {
      // Crear los 31 días vacíos
      const rows = DIAS.map(dia => ({ habito_id: data.id, dia, completado: false }))
      await supabase.from('habito_tracking').insert(rows)
      setNuevoNombre('')
      setShowForm(false)
      cargarDatos()
    }
  }

  const toggleDia = async (habitoId, dia) => {
    const key = `${habitoId}_${dia}`
    const existing = tracking[key]

    if (existing) {
      const nuevoEstado = !existing.completado
      await supabase.from('habito_tracking').update({ completado: nuevoEstado }).eq('id', existing.id)
      setTracking(prev => ({ ...prev, [key]: { ...existing, completado: nuevoEstado } }))
    } else {
      const { data } = await supabase.from('habito_tracking').insert({ habito_id: habitoId, dia, completado: true }).select().single()
      if (data) setTracking(prev => ({ ...prev, [key]: { id: data.id, completado: true } }))
    }
  }

  const eliminarHabito = async (id) => {
    await supabase.from('habito_tracking').delete().eq('habito_id', id)
    await supabase.from('habitos').delete().eq('id', id)
    cargarDatos()
  }

  const getProgreso = (habitoId) => {
    const completos = DIAS.filter(d => tracking[`${habitoId}_${d}`]?.completado).length
    return { completos, pct: Math.round((completos / 31) * 100) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }} className="float-anim">📊</div>
        <p>Cargando hábitos...</p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 style={{ fontSize: '1.4rem' }}>📊 Tracker de Hábitos</h1>
          <p className="text-xs text-secondary mt-1">
            {habitos.length}/10 hábitos • Haz click en cada día para marcar
          </p>
        </div>
        {habitos.length < 10 && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Nuevo Hábito
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-3" style={{ borderColor: 'var(--border-glow)', background: 'rgba(124,58,237,0.08)' }}>
          <h3 className="mb-2" style={{ fontSize: '1rem' }}>¿Qué hábito quieres construir?</h3>
          <div className="flex gap-1">
            <input
              className="input"
              placeholder="Ej: Ejercicio diario, Lectura 30 min, Meditación..."
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarHabito()}
              autoFocus
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={agregarHabito}>Agregar</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <p className="text-xs text-secondary mt-1">Presiona Enter o haz click en Agregar</p>
        </div>
      )}

      {/* Sin hábitos */}
      {habitos.length === 0 && (
        <div className="card text-center" style={{ padding: '4rem 2rem', borderStyle: 'dashed' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
          <h3 className="mb-1" style={{ color: 'var(--ultra)' }}>¡Construye tu primer hábito!</h3>
          <p className="text-secondary text-sm mb-3">Los grandes cambios empiezan con un solo día marcado en verde.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Crear primer hábito
          </button>
        </div>
      )}

      {/* Tracker circular por hábito */}
      {habitos.map((habito, idx) => {
        const color = COLORES[idx % COLORES.length]
        const { completos, pct } = getProgreso(habito.id)
        return (
          <CircularTracker
            key={habito.id}
            habito={habito}
            color={color}
            tracking={tracking}
            onToggle={toggleDia}
            onDelete={eliminarHabito}
            completos={completos}
            pct={pct}
          />
        )
      })}
    </div>
  )
}

function CircularTracker({ habito, color, tracking, onToggle, onDelete, completos, pct }) {
  const size = 380
  const cx = size / 2
  const cy = size / 2

  // Arco de 270° (de -135° a 135°, bottom-left hasta bottom-right, pasando por arriba)
  const startAngle = -225 // grados desde 3 o'clock
  const totalAngle = 270
  const innerR = 80
  const outerR = 155
  const rings = 5 // número de filas de hábitos (usamos solo 1 pero reservamos espacio visual)

  // Generar las celdas del arco
  const segments = DIAS.map((dia, i) => {
    const angle = startAngle + (i / 31) * totalAngle
    const angleNext = startAngle + ((i + 1) / 31) * totalAngle
    const angleMid = (angle + angleNext) / 2

    const toRad = (deg) => (deg * Math.PI) / 180

    const x1i = cx + innerR * Math.cos(toRad(angle))
    const y1i = cy + innerR * Math.sin(toRad(angle))
    const x2i = cx + innerR * Math.cos(toRad(angleNext))
    const y2i = cy + innerR * Math.sin(toRad(angleNext))
    const x1o = cx + outerR * Math.cos(toRad(angle))
    const y1o = cy + outerR * Math.sin(toRad(angle))
    const x2o = cx + outerR * Math.cos(toRad(angleNext))
    const y2o = cy + outerR * Math.sin(toRad(angleNext))

    const largeArc = (totalAngle / 31) > 180 ? 1 : 0

    const pathD = [
      `M ${x1i} ${y1i}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 1 ${x2i} ${y2i}`,
      `L ${x2o} ${y2o}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 0 ${x1o} ${y1o}`,
      'Z'
    ].join(' ')

    // Posición del número
    const labelR = outerR + 16
    const labelX = cx + labelR * Math.cos(toRad(angleMid))
    const labelY = cy + labelR * Math.sin(toRad(angleMid))

    const key = `${habito.id}_${dia}`
    const completado = tracking[key]?.completado || false

    return { dia, pathD, labelX, labelY, completado }
  })

  return (
    <div className="card mb-3" style={{
      borderColor: `${color}33`,
      background: `radial-gradient(ellipse at top left, ${color}08 0%, transparent 60%)`,
      overflow: 'hidden'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center' }}>
        
        {/* Info + Stats */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: color, boxShadow: `0 0 8px ${color}`
            }} />
            <h3 style={{ color, fontSize: '1.1rem' }}>{habito.nombre}</h3>
            <button
              onClick={() => onDelete(habito.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginLeft: 'auto', padding: '0.3rem' }}
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Progreso */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="text-xs text-secondary">Progreso del mes</span>
              <span className="text-xs" style={{ color, fontWeight: 700 }}>{completos}/31 días</span>
            </div>
            <div className="power-bar-track">
              <div className="power-bar-fill" style={{
                width: `${pct}%`,
                background: color,
                boxShadow: pct > 0 ? `0 0 12px ${color}` : 'none'
              }} />
            </div>
          </div>

          {/* Stats rápidas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
            <div style={{ textAlign: 'center', padding: '0.6rem', borderRadius: '10px', background: `${color}10`, border: `1px solid ${color}22` }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color }}>
                {completos}
              </div>
              <div className="text-xs text-secondary">Logrados</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.6rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger)' }}>
                {DIAS.filter(d => tracking[`${habito.id}_${d}`]?.completado === false).length}
              </div>
              <div className="text-xs text-secondary">Pendientes</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {pct}%
              </div>
              <div className="text-xs text-secondary">Completado</div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex gap-2 mt-2" style={{ marginTop: '1rem' }}>
            <div className="flex items-center gap-1">
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: `${color}55`, border: `1px solid ${color}` }} />
              <span className="text-xs text-secondary">Completado</span>
            </div>
            <div className="flex items-center gap-1">
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }} />
              <span className="text-xs text-secondary">No completado</span>
            </div>
          </div>
        </div>

        {/* Tracker circular SVG */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
            {/* Anillo de fondo */}
            <circle cx={cx} cy={cy} r={innerR - 4} fill="var(--bg-base)" />

            {/* Centro - nombre/porcentaje */}
            <text x={cx} y={cy - 10} textAnchor="middle" fill={color} fontSize="22" fontWeight="800" fontFamily="'Exo 2', sans-serif">
              {pct}%
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontFamily="'Exo 2', sans-serif">
              completado
            </text>
            <text x={cx} y={cy + 26} textAnchor="middle" fill={color} fontSize="11" fontFamily="'Exo 2', sans-serif" opacity="0.7">
              {completos}/31
            </text>

            {/* Celdas del arco */}
            {segments.map(({ dia, pathD, labelX, labelY, completado }) => (
              <g key={dia} style={{ cursor: 'pointer' }} onClick={() => onToggle(habito.id, dia)}>
                <path
                  d={pathD}
                  fill={
                    completado
                      ? `${color}55`
                      : tracking[`${habito.id}_${dia}`]?.completado === false
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(255,255,255,0.03)'
                  }
                  stroke={
                    completado
                      ? color
                      : tracking[`${habito.id}_${dia}`]?.completado === false
                      ? 'rgba(239,68,68,0.4)'
                      : 'rgba(255,255,255,0.08)'
                  }
                  strokeWidth="1"
                  style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                />
                {/* Número del día */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={completado ? color : 'var(--text-secondary)'}
                  fontSize="9"
                  fontWeight={completado ? '700' : '400'}
                  fontFamily="'Exo 2', sans-serif"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {dia}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}
