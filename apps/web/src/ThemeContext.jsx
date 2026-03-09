import { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = {
  dark: {
    pageBg:        '#031e2d',
    sidebarBg:     '#042537',
    sidebarBorder: '#0a3d55',
    cardBg:        '#063348',
    cardBg2:       '#042537',
    border:        '#0a3d55',
    textPrimary:   '#e8f4f8',
    textSecondary: '#7fb5cc',
    textMuted:     '#4a7d96',
    textFaint:     '#1e4d63',
    accent:        '#145a4e',
    accentText:    '#2db89a',
    accentBorder:  '#1a7263',
    navActive:     '#0a3d55',
    inputBg:       '#042537',
    inputBorder:   '#0a3d55',
  },
  light: {
    pageBg:        '#f0f7f9',
    sidebarBg:     '#ffffff',
    sidebarBorder: '#c8dfe8',
    cardBg:        '#ffffff',
    cardBg2:       '#f4f9fb',
    border:        '#c8dfe8',
    textPrimary:   '#053043',
    textSecondary: '#2a6080',
    textMuted:     '#5a8fa8',
    textFaint:     '#a8ccd8',
    accent:        '#145a4e',
    accentText:    '#145a4e',
    accentBorder:  '#145a4e',
    navActive:     '#e0f0ec',
    inputBg:       '#f4f9fb',
    inputBorder:   '#c8dfe8',
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
