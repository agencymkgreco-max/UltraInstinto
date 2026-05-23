-- =============================================
-- ULTRA INSTINTO - Supabase Schema
-- Ejecuta esto en el SQL Editor de Supabase
-- =============================================

-- Habilitar RLS (Row Level Security)
-- Cada usuario solo ve sus propios datos

-- METAS (Goals) - Define tu Ultra Instinto
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('dinero', 'estetica', 'personal', 'espiritual')),
  target_value NUMERIC,        -- Meta final (ej: 100000 pesos, 80kg)
  current_value NUMERIC DEFAULT 0,
  unit TEXT,                   -- 'MXN', 'kg', '%', etc
  is_main_goal BOOLEAN DEFAULT false, -- La meta Ultra Instinto
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BILLETERA - Dónde está tu dinero y de dónde vino
CREATE TABLE wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,          -- "BBVA", "Efectivo", "Caja ahorro"
  balance NUMERIC DEFAULT 0,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT '💳',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACCIONES - Todos los movimientos de dinero
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('ingreso', 'gasto', 'transferencia')),
  amount NUMERIC NOT NULL,
  category TEXT,               -- "Trabajo", "Freelance", "Comida", "Renta"...
  source TEXT,                 -- De dónde vino el dinero
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRESUPUESTO - Cómo divides tu dinero (regla del 50/30/20 o la tuya)
CREATE TABLE budget_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,          -- "Necesidades", "Ahorros", "Ocio"
  percentage NUMERIC,          -- % del ingreso
  fixed_amount NUMERIC,        -- O monto fijo
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AGENDA - Eventos y tareas
CREATE TABLE agenda_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  type TEXT CHECK (type IN ('evento', 'tarea', 'recordatorio')),
  completed BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('alta', 'media', 'baja')) DEFAULT 'media',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTAS
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRESO DIARIO - Historial para gráficas
CREATE TABLE daily_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  total_balance NUMERIC DEFAULT 0,
  power_level INTEGER DEFAULT 0,  -- Nivel DBZ calculado
  notes TEXT,
  UNIQUE(user_id, date)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

-- Políticas: usuario solo ve sus datos
CREATE POLICY "own_goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_wallets" ON wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_budget" ON budget_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_agenda" ON agenda_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_notes" ON notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_progress" ON daily_progress FOR ALL USING (auth.uid() = user_id);
