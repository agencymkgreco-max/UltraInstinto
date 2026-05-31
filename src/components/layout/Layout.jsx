import { useState, useEffect } from 'react'
import { LayoutDashboard, Wallet, Target, CalendarDays, FileText, TrendingUp, Settings, LogOut, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { calculatePowerLevel, DBZ_LEVELS } from '../../lib/powerLevel'
import { useData } from '../../hooks/useData'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'finances', label: 'Finanzas', icon: Wallet },
  { id: 'goals', label: 'Mis Metas', icon: Target },
  { id: 'habits', label: 'Hábitos', icon: TrendingUp },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'notes', label: 'Notas', icon: FileText },
]

export default function Layout({ children, page, setPage }) {
  const { user, signOut } = useAuth()
  const { data: goals } = useData('goals', user?.id)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const power = calculatePowerLevel(goals)

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))
  }, [])

  return (
    <div className="app-layout">
      {!isOnline && <div className="offline-badge">⚡ Modo Offline</div>}

      <aside className="sidebar">
        {/* Logo */}
        <div className="mb-3" style={{ textAlign: 'center' }}>
          <h1 className="font-display" style={{ fontSize: '1rem', color: 'var(--ultra)', lineHeight: 1.3 }}>
            Ultra<br/>Instinto
          </h1>
          <p className="text-xs text-secondary mt-1">{user?.email?.split('@')[0]}</p>
        </div>

        {/* Nivel actual */}
        <div className="card mb-3" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem' }} className="float-anim">{power.level.icon}</div>
          <div style={{ fontSize: '0.75rem', color: power.level.color, fontWeight: 700, marginTop: '0.3rem' }}>
            {power.level.name}
          </div>
          <div className="power-bar-track mt-1">
            <div
              className="power-bar-fill"
              style={{
                width: `${power.progressToNext}%`,
                background: `linear-gradient(90deg, ${power.level.color}, ${power.nextLevel?.color || power.level.color})`
              }}
            />
          </div>
          <div className="text-xs text-secondary mt-1">{power.percentage}% hacia Ultra Instinto</div>
        </div>

        {/* Navegación */}
        <nav style={{ flex: 1 }}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'active' : ''}`}
              onClick={() => setPage(id)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
          <div className="flex items-center gap-1 mb-1" style={{ padding: '0 0.5rem' }}>
            {isOnline
              ? <><Wifi size={14} style={{ color: 'var(--success)' }} /><span className="text-xs text-secondary">Conectado</span></>
              : <><WifiOff size={14} style={{ color: 'var(--accent-gold)' }} /><span className="text-xs" style={{ color: 'var(--accent-gold)' }}>Offline</span></>
            }
          </div>
          <button className="nav-item" onClick={signOut}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  )
}
