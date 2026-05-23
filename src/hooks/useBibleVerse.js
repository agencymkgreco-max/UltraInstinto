import { useState, useEffect } from 'react'

// Versículos predefinidos RVR como fallback offline
const FALLBACK_VERSES = [
  { text: 'Todo lo puedo en Cristo que me fortalece.', reference: 'Filipenses 4:13' },
  { text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.', reference: 'Jeremías 29:11' },
  { text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.', reference: 'Proverbios 3:5' },
  { text: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.', reference: 'Mateo 6:33' },
  { text: 'El que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.', reference: 'Filipenses 1:6' },
  { text: 'Esfuérzate y sé valiente; no temas ni desmayes.', reference: 'Josué 1:9' },
  { text: 'Pon en manos del Señor todo lo que haces, y tus proyectos se realizarán.', reference: 'Proverbios 16:3' },
  { text: 'Jehová es mi pastor; nada me faltará.', reference: 'Salmos 23:1' },
  { text: 'No te conformes a este siglo, sino transfórmate por medio de la renovación de tu entendimiento.', reference: 'Romanos 12:2' },
  { text: 'Y todo lo que hagáis, hacedlo de corazón, como para el Señor.', reference: 'Colosenses 3:23' },
  { text: 'El Señor te bendiga y te guarde.', reference: 'Números 6:24' },
  { text: 'Encomienda al Señor tu camino; confía en él, y él actuará.', reference: 'Salmos 37:5' },
]

// Referencias para usar con la API de bible-api.com (versión RVR1960)
const VERSE_REFS = [
  'philippians 4:13', 'jeremiah 29:11', 'proverbs 3:5-6',
  'matthew 6:33', 'joshua 1:9', 'proverbs 16:3',
  'psalms 23:1', 'romans 12:2', 'colossians 3:23',
  'psalms 37:5', 'isaiah 40:31', 'romans 8:28',
]

export const useBibleVerse = () => {
  const [verse, setVerse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVerse = async () => {
      // Usar el día del año para rotar versículos de forma determinista
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
      const fallback = FALLBACK_VERSES[dayOfYear % FALLBACK_VERSES.length]

      // Si hay caché de hoy, usarlo
      const cached = localStorage.getItem('daily_verse')
      const cachedDate = localStorage.getItem('daily_verse_date')
      const today = new Date().toDateString()

      if (cached && cachedDate === today) {
        setVerse(JSON.parse(cached))
        setLoading(false)
        return
      }

      try {
        const ref = VERSE_REFS[dayOfYear % VERSE_REFS.length]
        const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=rvr1960`)
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        const v = {
          text: data.text.replace(/\n/g, ' ').trim(),
          reference: data.reference
        }
        setVerse(v)
        localStorage.setItem('daily_verse', JSON.stringify(v))
        localStorage.setItem('daily_verse_date', today)
      } catch {
        setVerse(fallback)
      } finally {
        setLoading(false)
      }
    }

    fetchVerse()
  }, [])

  return { verse, loading }
}
