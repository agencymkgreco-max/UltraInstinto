import { BookOpen, TrendingUp, Target, CalendarDays, Wallet } from 'lucide-react'
import { useBibleVerse } from '../../hooks/useBibleVerse'
import { useData } from '../../hooks/useData'
import { useAuth } from '../../hooks/useAuth'
import { calculatePowerLevel, formatPowerNumber, DBZ_LEVELS } from '../../lib/powerLevel'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard({ setPage }) {
  const { user } = useAuth()
  const { verse, loading: verseLoading } = useBibleVerse()
  const { data: goals } = useData('goals', user?.id)
  const { data: wallets } = useData('wallets', user?.id)
  const { data: transactions } = useData('transactions', user?.id)
  const { data: agenda } = useData('agenda_items', user?.id)

  const power = calculatePowerLevel(goals)
  const totalBalance = wallets.reduce((s, w) => s + (w.balance || 0), 0)

  const today = new Date().toISOString().split('T')[0]
  const todayItems = agenda.filter(a => a.date === today && !a.completed)

  // Últimos 5 gastos
  const recentExpenses = transactions.filter(t => t.type === 'gasto').slice(0, 5)

  // Pie chart de wallets
  const walletColors = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ec4899']

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className={`font-display ${power.level.level === 11 ? 'ultra-glow' : ''}`}
            style={{ color: power.level.color, fontSize: '1.5rem' }}>
            {power.level.icon} {power.level.name}
          </h1>
          <p className="text-secondary text-sm">Nivel de Poder: {formatPowerNumber(power.percentage)}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-secondary">{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>
      </div>

      {/* Versículo del día */}
      <div className="card card-glow mb-3" style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
        borderColor: 'rgba(124,58,237,0.4)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px', fontSize: '6rem',
          opacity: 0.04, fontFamily: 'serif'
        }}>✞</div>
        <div className="flex items-center gap-1 mb-1">
          <BookOpen size={16} style={{ color: 'var(--ultra)' }} />
          <span className="text-xs" style={{ color: 'var(--ultra)', fontWeight: 700, letterSpacing: '0.1em' }}>
            PALABRA DEL DÍA
          </span>
        </div>
        {verseLoading ? (
          <div className="text-secondary text-sm">Cargando versículo...</div>
        ) : verse ? (
          <>
            <p style={{ fontStyle: 'italic', lineHeight: 1.7, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              "{verse.text}"
            </p>
            <p className="text-sm text-gold mt-1" style={{ fontWeight: 600 }}>— {verse.reference}</p>
          </>
        ) : null}
      </div>

      {/* Stats rápidas */}
      <div className="grid-3 mb-3">
        <div className="card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
          <div className="flex items-center gap-1 mb-1">
            <Wallet size={16} style={{ color: 'var(--success)' }} />
            <span className="text-xs text-secondary">BALANCE TOTAL</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)' }}>
            ${totalBalance.toLocaleString('es-MX')}
          </div>
          <div className="text-xs text-secondary mt-1">{wallets.length} billeteras</div>
        </div>

        <div className="card" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
          <div className="flex items-center gap-1 mb-1">
            <Target size={16} style={{ color: 'var(--ultra)' }} />
            <span className="text-xs text-secondary">METAS ACTIVAS</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ultra)' }}>{goals.length}</div>
          <div className="text-xs text-secondary mt-1">{goals.filter(g => g.completed).length} completadas</div>
        </div>

        <div className="card" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
          <div className="flex items-center gap-1 mb-1">
            <CalendarDays size={16} style={{ color: 'var(--accent-gold)' }} />
            <span className="text-xs text-secondary">HOY</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{todayItems.length}</div>
          <div className="text-xs text-secondary mt-1">pendientes hoy</div>
        </div>
      </div>

      <div className="grid-2 mb-3">
        {/* Power Level visual */}
        <div className="card">
          <h3 className="mb-2 text-secondary text-sm" style={{ letterSpacing: '0.1em' }}>CAMINO AL ULTRA INSTINTO</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DBZ_LEVELS.map(lvl => (
              <div key={lvl.level} className="flex items-center gap-1">
                <span style={{ fontSize: '0.8rem', width: '1.2rem' }}>{lvl.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="power-bar-track">
                    <div className="power-bar-fill" style={{
                      width: power.percentage >= lvl.minPower ? '100%' : `${(power.percentage / lvl.minPower) * 100}%`,
                      background: lvl.color,
                      opacity: power.percentage >= lvl.minPower ? 1 : 0.3
                    }} />
                  </div>
                </div>
                <span className="text-xs" style={{ color: power.level.level >= lvl.level ? lvl.color : 'var(--text-secondary)', width: '4rem', fontSize: '0.65rem' }}>
                  {lvl.name.split(' ').pop()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución wallets */}
        <div className="card">
          <h3 className="mb-2 text-secondary text-sm" style={{ letterSpacing: '0.1em' }}>MIS BILLETERAS</h3>
          {wallets.length === 0 ? (
            <div className="text-center text-secondary text-sm" style={{ paddingTop: '2rem' }}>
              <p>Sin billeteras aún</p>
              <button className="btn btn-ghost mt-1" style={{ fontSize: '0.8rem' }} onClick={() => setPage('finances')}>
                + Agregar
              </button>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={wallets} dataKey="balance" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={25}>
                    {wallets.map((_, i) => <Cell key={i} fill={walletColors[i % walletColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString('es-MX')}`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              {wallets.map((w, i) => (
                <div key={w.id} className="flex justify-between text-sm">
                  <span style={{ color: walletColors[i % walletColors.length] }}>{w.icon} {w.name}</span>
                  <span style={{ fontWeight: 600 }}>${Number(w.balance).toLocaleString('es-MX')}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Últimos gastos */}
      {recentExpenses.length > 0 && (
        <div className="card">
          <h3 className="mb-2 text-secondary text-sm" style={{ letterSpacing: '0.1em' }}>ÚLTIMOS GASTOS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentExpenses.map(t => (
              <div key={t.id} className="flex justify-between items-center" style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(239,68,68,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{t.description || t.category}</div>
                  <div className="text-xs text-secondary">{t.category} • {t.date}</div>
                </div>
                <div className="text-danger" style={{ fontWeight: 700 }}>-${Number(t.amount).toLocaleString('es-MX')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
