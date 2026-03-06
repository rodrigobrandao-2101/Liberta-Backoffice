import { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = {
  dark: {
    pageBg:       '#0f1117',
    sidebarBg:    '#0b0e17',
    sidebarBorder:'#1e2130',
    cardBg:       '#1e2130',
    cardBg2:      '#13151f',
    border:       '#1e2130',
    textPrimary:  '#f1f5f9',
    textSecondary:'#94a3b8',
    textMuted:    '#64748b',
    textFaint:    '#334155',
    accent:       '#6366f1',
    accentText:   '#a5b4fc',
    accentBorder: '#6366f1',
    navActive:    '#1e2130',
    inputBg:      '#1e2130',
    inputBorder:  '#334155',
  },
  light: {
    pageBg:       '#f1f5f9',
    sidebarBg:    '#ffffff',
    sidebarBorder:'#e2e8f0',
    cardBg:       '#ffffff',
    cardBg2:      '#f8fafc',
    border:       '#e2e8f0',
    textPrimary:  '#0f172a',
    textSecondary:'#475569',
    textMuted:    '#94a3b8',
    textFaint:    '#cbd5e1',
    accent:       '#6366f1',
    accentText:   '#4f46e5',
    accentBorder: '#6366f1',
    navActive:    '#eef2ff',
    inputBg:      '#f8fafc',
    inputBorder:  '#e2e8f0',
  },
}

const ThemeContext = createContext({ theme: THEMES.dark, isDark: true, toggle: () => {} })

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light'
  })

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  const theme = isDark ? THEMES.dark : THEMES.light

  // Aplica as variáveis CSS globalmente para override de componentes
  useEffect(() => {
    const root = document.documentElement
    Object.entries(theme).forEach(([key, val]) => {
      root.style.setProperty(`--${key}`, val)
    })
    root.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark, theme])

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
