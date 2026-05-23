// Sistema de niveles Dragon Ball Z
// El progreso hacia tus metas define tu nivel de poder

export const DBZ_LEVELS = [
  { level: 1,  name: 'Humano Común',      minPower: 0,    color: '#6b7280', icon: '🧑' },
  { level: 2,  name: 'Luchador Z',         minPower: 5,    color: '#10b981', icon: '💪' },
  { level: 3,  name: 'Guerrero Z',         minPower: 10,   color: '#10b981', icon: '⚔️' },
  { level: 4,  name: 'Súper Humano',       minPower: 20,   color: '#3b82f6', icon: '🌟' },
  { level: 5,  name: 'Namekiano',          minPower: 30,   color: '#22c55e', icon: '🟢' },
  { level: 6,  name: 'Super Saiyan',       minPower: 40,   color: '#fbbf24', icon: '⚡' },
  { level: 7,  name: 'Super Saiyan 2',     minPower: 55,   color: '#f59e0b', icon: '⚡⚡' },
  { level: 8,  name: 'Super Saiyan 3',     minPower: 70,   color: '#f97316', icon: '🔥' },
  { level: 9,  name: 'Super Saiyan God',   minPower: 80,   color: '#ef4444', icon: '🔴' },
  { level: 10, name: 'Super Saiyan Blue',  minPower: 90,   color: '#06b6d4', icon: '💙' },
  { level: 11, name: 'Ultra Instinto',     minPower: 100,  color: '#c4b5fd', icon: '✨' },
]

// Calcula el nivel basado en el progreso de tus metas (0-100%)
export const calculatePowerLevel = (goals = []) => {
  if (goals.length === 0) return { level: DBZ_LEVELS[0], percentage: 0 }

  const totalProgress = goals.reduce((acc, goal) => {
    if (!goal.target_value || goal.target_value === 0) return acc
    const progress = Math.min((goal.current_value / goal.target_value) * 100, 100)
    return acc + progress
  }, 0)

  const avgProgress = totalProgress / goals.length

  const currentLevel = [...DBZ_LEVELS]
    .reverse()
    .find(l => avgProgress >= l.minPower) || DBZ_LEVELS[0]

  const nextLevel = DBZ_LEVELS.find(l => l.minPower > avgProgress)

  return {
    level: currentLevel,
    nextLevel,
    percentage: Math.round(avgProgress),
    progressToNext: nextLevel
      ? Math.round(((avgProgress - currentLevel.minPower) / (nextLevel.minPower - currentLevel.minPower)) * 100)
      : 100
  }
}

// Formato de número de poder al estilo DBZ
export const formatPowerNumber = (percentage) => {
  const base = 1000
  const multiplier = Math.pow(10, percentage / 10)
  return Math.round(base * multiplier).toLocaleString()
}
