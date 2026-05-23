import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handle = async () => {
    setError(''); setLoading(true)
    const fn = mode === 'login' ? signIn : signUp
    const { error: err } = await fn(email, password)
    setLoading(false)
    if (err) setError(err.message)
    else if (mode === 'register') setSuccess('¡Revisa tu correo para confirmar tu cuenta!')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '1rem'
    }}>
      {/* Fondo */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div className="text-center mb-3">
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }} className="float-anim">✨</div>
          <h1 className="font-display ultra-glow" style={{ color: 'var(--ultra)', fontSize: '1.6rem', marginBottom: '0.3rem' }}>
            Ultra Instinto
          </h1>
          <p className="text-secondary text-sm">Tu camino al próximo nivel comienza aquí</p>
        </div>

        <div className="card card-glow">
          {/* Tabs */}
          <div className="flex mb-3" style={{ background: 'var(--bg-base)', borderRadius: '10px', padding: '4px' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} className="btn"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', justifyContent: 'center',
                  background: mode === m ? 'var(--accent-purple)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--text-secondary)' }}>
                {m === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            ))}
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.7rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--danger)' }}>{error}</div>}
          {success && <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '0.7rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--success)' }}>{success}</div>}

          <div className="mb-2">
            <label className="text-xs text-secondary">Correo Electrónico</label>
            <input className="input mt-1" type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="text-xs text-secondary">Contraseña</label>
            <input className="input mt-1" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()} />
          </div>

          <button className="btn btn-primary w-full" onClick={handle} disabled={loading}
            style={{ justifyContent: 'center', padding: '0.8rem', fontSize: '1rem' }}>
            {loading ? '⚡ Cargando...' : mode === 'login' ? '⚡ Entrar' : '🌟 Crear Cuenta'}
          </button>

          <p className="text-center text-xs text-secondary mt-2">
            Tus datos se guardan offline automáticamente ☁️
          </p>
        </div>
      </div>
    </div>
  )
}
