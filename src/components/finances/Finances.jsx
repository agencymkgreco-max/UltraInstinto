import { useState } from 'react'
import { Plus, Trash2, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Download, Edit2, Check, X } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { useAuth } from '../../hooks/useAuth'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CATEGORIES_GASTO = ['Comida', 'Renta', 'Transporte', 'Salud', 'Ropa', 'Entretenimiento', 'Servicios', 'Otro']
const CATEGORIES_INGRESO = ['Salario', 'Freelance', 'Negocio', 'Inversión', 'Regalo', 'Otro']
const ICONS = ['💳', '🏦', '💵', '💰', '🏧', '📱', '🐷']
const TIPOS_BILLETERA = ['Efectivo', 'Cuenta Bancaria', 'Tarjeta de Crédito', 'Billetera Digital', 'Otro']

export default function Finances() {
  const { user } = useAuth()
  const { data: wallets, insert: addWallet, update: updateWallet, remove: removeWallet } = useData('wallets', user?.id)
  const { data: transactions, insert: addTx, remove: removeTx } = useData('transactions', user?.id)
  const { data: budget, insert: addBudget, remove: removeBudget } = useData('budget_rules', user?.id)
  const [tab, setTab] = useState('resumen')
  const [txForm, setTxForm] = useState({ type: 'gasto', amount: '', category: '', description: '', source: '', wallet_id: '', date: new Date().toISOString().split('T')[0] })
  const [walletForm, setWalletForm] = useState({ name: '', balance: '', icon: '💳', tipo: 'Efectivo' })
  const [budgetForm, setBudgetForm] = useState({ name: '', percentage: '', color: '#7c3aed' })
  const [showTxForm, setShowTxForm] = useState(false)
  const [showWalletForm, setShowWalletForm] = useState(false)
  const [editingWallet, setEditingWallet] = useState(null) // { id, balance }

  const totalBalance = wallets.reduce((s, w) => s + (Number(w.balance) || 0), 0)
  const totalIngresos = transactions.filter(t => t.type === 'ingreso').reduce((s, t) => s + Number(t.amount), 0)
  const totalGastos = transactions.filter(t => t.type === 'gasto').reduce((s, t) => s + Number(t.amount), 0)

  // Gastos por categoría para gráfica
  const gastosPorCat = CATEGORIES_GASTO.map(cat => ({
    name: cat,
    total: transactions.filter(t => t.type === 'gasto' && t.category === cat).reduce((s, t) => s + Number(t.amount), 0)
  })).filter(c => c.total > 0)

  const handleAddTx = async () => {
    if (!txForm.amount || !txForm.category) return
    
    // Agregar la transacción
    await addTx({
      ...txForm,
      amount: Number(txForm.amount)
    })

    // Si es gasto y tiene wallet_id, restar del saldo
    if (txForm.type === 'gasto' && txForm.wallet_id) {
      const wallet = wallets.find(w => w.id === txForm.wallet_id)
      if (wallet) {
        const nuevoBalance = Number(wallet.balance) - Number(txForm.amount)
        await updateWallet(txForm.wallet_id, { balance: nuevoBalance })
      }
    }

    // Si es ingreso y tiene wallet_id, sumar al saldo
    if (txForm.type === 'ingreso' && txForm.wallet_id) {
      const wallet = wallets.find(w => w.id === txForm.wallet_id)
      if (wallet) {
        const nuevoBalance = Number(wallet.balance) + Number(txForm.amount)
        await updateWallet(txForm.wallet_id, { balance: nuevoBalance })
      }
    }

    setTxForm({ type: 'gasto', amount: '', category: '', description: '', source: '', wallet_id: '', date: new Date().toISOString().split('T')[0] })
    setShowTxForm(false)
  }

  const handleAddWallet = async () => {
    if (!walletForm.name || !walletForm.balance) return
    await addWallet({
      ...walletForm,
      balance: Number(walletForm.balance)
    })
    setWalletForm({ name: '', balance: '', icon: '💳', tipo: 'Efectivo' })
    setShowWalletForm(false)
  }

  const handleEditWallet = async (walletId) => {
    if (editingWallet.id === walletId) {
      await updateWallet(walletId, { balance: Number(editingWallet.balance) })
      setEditingWallet(null)
    } else {
      const wallet = wallets.find(w => w.id === walletId)
      setEditingWallet({ id: walletId, balance: wallet.balance })
    }
  }

  const exportData = () => {
    const data = { wallets, transactions, budget, exportDate: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `finanzas-${new Date().toLocaleDateString('es-MX')}.json`
    a.click()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h1 style={{ fontSize: '1.4rem' }}>💰 Finanzas</h1>
        <button className="btn btn-ghost" onClick={exportData}><Download size={15} /> Exportar</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {['resumen', 'transacciones', 'billeteras', 'presupuesto'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* RESUMEN */}
      {tab === 'resumen' && (
        <>
          <div className="grid-3 mb-3">
            <div className="card" style={{ borderColor: 'rgba(16,185,129,0.4)' }}>
              <div className="text-xs text-secondary mb-1">BALANCE TOTAL</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)' }}>${totalBalance.toLocaleString('es-MX')}</div>
            </div>
            <div className="card" style={{ borderColor: 'rgba(59,130,246,0.4)' }}>
              <div className="text-xs text-secondary mb-1">INGRESOS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-blue)' }}>+${totalIngresos.toLocaleString('es-MX')}</div>
            </div>
            <div className="card" style={{ borderColor: 'rgba(239,68,68,0.4)' }}>
              <div className="text-xs text-secondary mb-1">GASTOS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)' }}>-${totalGastos.toLocaleString('es-MX')}</div>
            </div>
          </div>
          {gastosPorCat.length > 0 && (
            <div className="card">
              <h3 className="mb-2">Gastos por categoría</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={gastosPorCat}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} formatter={v => `$${Number(v).toLocaleString('es-MX')}`} />
                  <Bar dataKey="total" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* TRANSACCIONES */}
      {tab === 'transacciones' && (
        <>
          <button className="btn btn-primary mb-3" onClick={() => setShowTxForm(!showTxForm)}>
            <Plus size={16} /> Nueva Transacción
          </button>
          {showTxForm && (
            <div className="card mb-3" style={{ borderColor: 'var(--border-glow)' }}>
              <h3 className="mb-2">Registrar Movimiento</h3>
              <div className="grid-2 mb-1">
                <div>
                  <label className="text-xs text-secondary">Tipo</label>
                  <select className="input" value={txForm.type} onChange={e => setTxForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="gasto">💸 Gasto</option>
                    <option value="ingreso">💵 Ingreso</option>
                    <option value="transferencia">🔄 Transferencia</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-secondary">Monto (MXN)</label>
                  <input className="input" type="number" placeholder="0.00" value={txForm.amount} onChange={e => setTxForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2 mb-1">
                <div>
                  <label className="text-xs text-secondary">Categoría</label>
                  <select className="input" value={txForm.category} onChange={e => setTxForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Selecciona...</option>
                    {(txForm.type === 'ingreso' ? CATEGORIES_INGRESO : CATEGORIES_GASTO).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-secondary">Billetera</label>
                  <select className="input" value={txForm.wallet_id} onChange={e => setTxForm(p => ({ ...p, wallet_id: e.target.value }))}>
                    <option value="">Ninguna</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-1">
                <label className="text-xs text-secondary">Descripción / Origen</label>
                <input className="input" placeholder="¿De dónde vino o en qué se gastó?" value={txForm.description} onChange={e => setTxForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="mb-2">
                <label className="text-xs text-secondary">Fecha</label>
                <input className="input" type="date" value={txForm.date} onChange={e => setTxForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="flex gap-1">
                <button className="btn btn-primary" onClick={handleAddTx}>Guardar</button>
                <button className="btn btn-ghost" onClick={() => setShowTxForm(false)}>Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {transactions.length === 0 && <div className="card text-center text-secondary">Sin transacciones registradas</div>}
            {transactions.map(t => (
              <div key={t.id} className="card flex justify-between items-center" style={{ padding: '1rem' }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: t.type === 'ingreso' ? 'rgba(16,185,129,0.15)' : t.type === 'gasto' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)' }}>
                    {t.type === 'ingreso' ? <ArrowUpRight size={18} style={{ color: 'var(--success)' }} />
                     : t.type === 'gasto' ? <ArrowDownLeft size={18} style={{ color: 'var(--danger)' }} />
                     : <ArrowLeftRight size={18} style={{ color: 'var(--accent-purple)' }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{t.description || t.category}</div>
                    <div className="text-xs text-secondary">{t.category} • {t.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: 700, color: t.type === 'ingreso' ? 'var(--success)' : t.type === 'gasto' ? 'var(--danger)' : 'var(--accent-purple)' }}>
                    {t.type === 'gasto' ? '-' : '+'}${Number(t.amount).toLocaleString('es-MX')}
                  </span>
                  <button className="btn btn-danger" style={{ padding: '0.3rem' }} onClick={() => removeTx(t.id)}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* BILLETERAS */}
      {tab === 'billeteras' && (
        <>
          <button className="btn btn-primary mb-3" onClick={() => setShowWalletForm(!showWalletForm)}>
            <Plus size={16} /> Nueva Billetera
          </button>
          {showWalletForm && (
            <div className="card mb-3" style={{ borderColor: 'var(--border-glow)' }}>
              <h3 className="mb-2">Agregar Billetera</h3>
              <div className="grid-2 mb-1">
                <div>
                  <label className="text-xs text-secondary">Nombre</label>
                  <input className="input" placeholder="BBVA, Efectivo..." value={walletForm.name} onChange={e => setWalletForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-secondary">Balance inicial</label>
                  <input className="input" type="number" placeholder="0.00" value={walletForm.balance} onChange={e => setWalletForm(p => ({ ...p, balance: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2 mb-1">
                <div>
                  <label className="text-xs text-secondary">Tipo de Billetera</label>
                  <select className="input" value={walletForm.tipo} onChange={e => setWalletForm(p => ({ ...p, tipo: e.target.value }))}>
                    {TIPOS_BILLETERA.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-secondary">Ícono</label>
                  <div className="flex gap-1" style={{ flexWrap: 'wrap', marginTop: '0.3rem' }}>
                    {ICONS.map(icon => (
                      <button key={icon} onClick={() => setWalletForm(p => ({ ...p, icon }))}
                        style={{ fontSize: '1.2rem', padding: '0.3rem', borderRadius: '8px', border: `2px solid ${walletForm.icon === icon ? 'var(--accent-purple)' : 'transparent'}`, background: 'var(--bg-base)', cursor: 'pointer' }}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="btn btn-primary" onClick={handleAddWallet}>Guardar</button>
                <button className="btn btn-ghost" onClick={() => setShowWalletForm(false)}>Cancelar</button>
              </div>
            </div>
          )}
          <div className="grid-2">
            {wallets.map(w => (
              <div key={w.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.8rem' }}>{w.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{w.name}</div>
                      <div className="text-xs text-secondary">{w.tipo}</div>
                    </div>
                  </div>
                  <button className="btn btn-danger" style={{ padding: '0.3rem' }} onClick={() => removeWallet(w.id)}><Trash2 size={13} /></button>
                </div>

                {/* Editar saldo */}
                {editingWallet?.id === w.id ? (
                  <div className="flex gap-1 mb-2">
                    <input 
                      className="input" 
                      type="number" 
                      value={editingWallet.balance}
                      onChange={e => setEditingWallet(p => ({ ...p, balance: e.target.value }))}
                      style={{ flex: 1 }}
                    />
                    <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={() => handleEditWallet(w.id)}>
                      <Check size={16} />
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => setEditingWallet(null)}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem' }}>
                      ${Number(w.balance).toLocaleString('es-MX')}
                    </div>
                    <button className="btn btn-ghost" style={{ padding: '0.3rem' }} onClick={() => handleEditWallet(w.id)}>
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {wallets.length === 0 && (
              <div className="card text-center text-secondary" style={{ gridColumn: '1/-1' }}>
                Sin billeteras. ¡Crea una para empezar!
              </div>
            )}
          </div>
        </>
      )}

      {/* PRESUPUESTO */}
      {tab === 'presupuesto' && (
        <>
          <div className="card mb-3" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
            <div className="text-xs text-secondary mb-1">💡 REGLA 50/30/20 SUGERIDA</div>
            <p className="text-sm">50% Necesidades • 30% Deseos • 20% Ahorros e Inversión</p>
          </div>
          <div className="card mb-3">
            <h3 className="mb-2">Agregar Categoría</h3>
            <div className="grid-2 mb-1">
              <div>
                <label className="text-xs text-secondary">Nombre</label>
                <input className="input" placeholder="Necesidades, Ahorro..." value={budgetForm.name} onChange={e => setBudgetForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-secondary">% del ingreso</label>
                <input className="input" type="number" placeholder="50" value={budgetForm.percentage} onChange={e => setBudgetForm(p => ({ ...p, percentage: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={async () => { if (!budgetForm.name) return; await addBudget(budgetForm); setBudgetForm({ name: '', percentage: '', color: '#7c3aed' }) }}>
              <Plus size={15} /> Agregar
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {budget.map(b => (
              <div key={b.id} className="card flex justify-between items-center">
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontWeight: 600 }}>{b.name}</span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{b.percentage}%</span>
                  </div>
                  <div className="power-bar-track">
                    <div className="power-bar-fill" style={{ width: `${b.percentage}%`, background: b.color || 'var(--accent-purple)' }} />
                  </div>
                  {totalIngresos > 0 && <div className="text-xs text-secondary mt-1">
                    = ${((totalIngresos * b.percentage) / 100).toLocaleString('es-MX')} de tus ingresos
                  </div>}
                </div>
                <button className="btn btn-danger" style={{ padding: '0.3rem', marginLeft: '1rem' }} onClick={() => removeBudget(b.id)}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
