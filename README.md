# ✨ Ultra Instinto - Tu Vida al Siguiente Nivel

App personal con finanzas, metas DBZ, agenda y notas. PWA con soporte offline.

## Stack
- **React 18** + Vite
- **Supabase** (base de datos + autenticación)
- **IndexedDB** (offline via idb)
- **PWA** (instalable como app nativa)
- **Recharts** (gráficas)

---

## ⚡ Setup Rápido

### 1. Clonar y dependencias
```bash
git clone https://github.com/tu-usuario/ultrainstinto.git
cd ultrainstinto
npm install
```

### 2. Configurar Supabase
1. Ve a [supabase.com](https://supabase.com) → Nuevo proyecto
2. En el **SQL Editor**, pega y ejecuta el contenido de `supabase-schema.sql`
3. Ve a **Settings → API** y copia tu `URL` y `anon key`

### 3. Variables de entorno
```bash
cp .env.example .env
# Edita .env con tus credenciales de Supabase
```

### 4. Correr en local
```bash
npm run dev
```

### 5. Build para producción
```bash
npm run build
```

---

## 🚀 Deploy (Vercel / Netlify)

**Vercel:**
```bash
npx vercel
# Agrega las variables de entorno en el dashboard de Vercel
```

**Netlify:**
```bash
npm run build
# Arrastra la carpeta dist/ a netlify.com
```

---

## 📱 Instalar como App (PWA)
- En Chrome/Edge: botón "Instalar" en la barra de direcciones
- En iOS Safari: Compartir → "Añadir a pantalla de inicio"

---

## 🎯 Sistema de Niveles DBZ

| Nivel | Nombre | Progreso |
|-------|--------|----------|
| 1 | Humano Común | 0% |
| 6 | Super Saiyan | 40% |
| 8 | Super Saiyan 3 | 70% |
| 10 | Super Saiyan Blue | 90% |
| 11 | **Ultra Instinto** | **100%** |

El nivel sube conforme completas el % de tus metas definidas.

---

## 📁 Estructura

```
src/
├── components/
│   ├── dashboard/    → Dashboard con versículo + resumen
│   ├── finances/     → Billeteras, gastos, presupuesto
│   ├── goals/        → Metas con niveles DBZ
│   ├── agenda/       → Calendario y tareas
│   ├── notes/        → Notas con búsqueda y export
│   └── layout/       → Sidebar
├── hooks/
│   ├── useAuth.js    → Autenticación Supabase
│   ├── useData.js    → CRUD online/offline
│   └── useBibleVerse.js → Versículo diario RVR
└── lib/
    ├── db.js         → Supabase + IndexedDB
    └── powerLevel.js → Lógica de niveles DBZ
```
