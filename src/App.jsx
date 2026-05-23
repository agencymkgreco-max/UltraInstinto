import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import Dashboard from './components/dashboard/Dashboard'
import Finances from './components/finances/Finances'
import Goals from './components/goals/Goals'
import Agenda from './components/agenda/Agenda'
import Notes from './components/notes/Notes'
import Login from './pages/Login'
import './index.css'

function App() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div className="float-anim" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✨</div>
        <div className="text-secondary">Cargando Ultra Instinto...</div>
      </div>
    </div>
  )

  if (!user) return <Login />

  const pages = {
    dashboard: <Dashboard setPage={setPage} />,
    finances: <Finances />,
    goals: <Goals />,
    agenda: <Agenda />,
    notes: <Notes />,
  }

  return (
    <Layout page={page} setPage={setPage}>
      {pages[page] || pages.dashboard}
    </Layout>
  )
}

export default function Root() {
  return <AuthProvider><App /></AuthProvider>
}
