import { useState } from 'react'
import { Plus, Trash2, Pin, Download, Search } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { useAuth } from '../../hooks/useAuth'

export default function Notes() {
  const { user } = useAuth()
  const { data: notes, insert, update, remove } = useData('notes', user?.id)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', content: '', tags: '', pinned: false })

  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.pinned - a.pinned)

  const handleSave = async () => {
    if (!form.title) return
    const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    if (editing) {
      await update(editing, { ...form, tags })
      setEditing(null)
    } else {
      await insert({ ...form, tags })
    }
    setForm({ title: '', content: '', tags: '', pinned: false })
    setShowForm(false)
  }

  const startEdit = (note) => {
    setForm({ title: note.title, content: note.content, tags: (note.tags || []).join(', '), pinned: note.pinned })
    setEditing(note.id)
    setShowForm(true)
  }

  const downloadNote = (note) => {
    const text = `# ${note.title}\n\n${note.content}\n\nEtiquetas: ${(note.tags || []).join(', ')}\nFecha: ${new Date(note.created_at).toLocaleDateString('es-MX')}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${note.title}.txt`; a.click()
  }

  const downloadAll = () => {
    const text = notes.map(n => `# ${n.title}\n\n${n.content}\n\n---\n`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'todas-mis-notas.txt'; a.click()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h1 style={{ fontSize: '1.4rem' }}>📝 Notas</h1>
        <div className="flex gap-1">
          <button className="btn btn-ghost" onClick={downloadAll}><Download size={15} /> Exportar</button>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: '', content: '', tags: '', pinned: false }) }}>
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-3" style={{ borderColor: 'var(--border-glow)' }}>
          <h3 className="mb-2">{editing ? 'Editar Nota' : 'Nueva Nota'}</h3>
          <div className="mb-1">
            <label className="text-xs text-secondary">Título</label>
            <input className="input" placeholder="Título de la nota..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="mb-1">
            <label className="text-xs text-secondary">Contenido</label>
            <textarea className="input" placeholder="Escribe aquí tus ideas, pensamientos, planes..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} style={{ minHeight: '150px' }} />
          </div>
          <div className="mb-2">
            <label className="text-xs text-secondary">Etiquetas (separadas por coma)</label>
            <input className="input" placeholder="ideas, trabajo, personal..." value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
          </div>
          <div className="flex items-center gap-1 mb-2">
            <input type="checkbox" id="pin" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))} style={{ accentColor: 'var(--accent-gold)' }} />
            <label htmlFor="pin" className="text-sm" style={{ cursor: 'pointer', color: 'var(--accent-gold)' }}>📌 Fijar nota</label>
          </div>
          <div className="flex gap-1">
            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Actualizar' : 'Guardar'}</button>
            <button className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null) }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Búsqueda */}
      <div className="relative mb-3">
        <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input className="input" placeholder="Buscar notas..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.2rem' }} />
      </div>

      <div className="grid-2">
        {filtered.length === 0 && (
          <div className="card text-center text-secondary" style={{ gridColumn: '1/-1', padding: '2rem' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</p>
            <p>Sin notas todavía. ¡Crea tu primera!</p>
          </div>
        )}
        {filtered.map(note => (
          <div key={note.id} className="card" style={{
            borderColor: note.pinned ? 'rgba(245,158,11,0.4)' : 'var(--border)',
            cursor: 'pointer', position: 'relative'
          }} onClick={() => startEdit(note)}>
            {note.pinned && <Pin size={14} style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', color: 'var(--accent-gold)', fill: 'var(--accent-gold)' }} />}
            <h3 className="mb-1" style={{ paddingRight: note.pinned ? '1.5rem' : 0 }}>{note.title}</h3>
            <p className="text-sm text-secondary" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
              {note.content}
            </p>
            {note.tags?.length > 0 && (
              <div className="flex gap-1 mt-1" style={{ flexWrap: 'wrap' }}>
                {note.tags.map(tag => (
                  <span key={tag} className="badge" style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-purple)', fontSize: '0.7rem' }}>#{tag}</span>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-secondary">{new Date(note.created_at).toLocaleDateString('es-MX')}</span>
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => downloadNote(note)}>
                  <Download size={12} />
                </button>
                <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem' }} onClick={() => remove(note.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
