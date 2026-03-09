import { Routes, Route, NavLink, useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { useTheme } from './ThemeContext.jsx'
import logoSvg from './assets/logo.svg'
import FunilCompleto from './pages/FunilCompleto'
import MetaAds from './pages/MetaAds'
import SDR from './pages/SDR'
import Comercial from './pages/Comercial'
import Compliance from './pages/Compliance'
import Juridico from './pages/Juridico'
import Financeiro from './pages/Financeiro'
import InteligenciaMercado from './pages/InteligenciaMercado'
import TetoRPV from './pages/TetoRPV'

const DASHBOARD_ROUTES = ['/', '/meta-ads', '/sdr', '/comercial', '/compliance', '/juridico', '/financeiro']

const NAV = [
  {
    label: 'Dashboard', icon: '◈',
    children: [
      { label: 'Funil Completo', to: '/' },
      { label: 'Meta Ads',       to: '/meta-ads' },
      { label: 'SDR',            to: '/sdr' },
      { label: 'Comercial',      to: '/comercial' },
      { label: 'Compliance',     to: '/compliance' },
      { label: 'Jurídico',       to: '/juridico' },
      { label: 'Financeiro',     to: '/financeiro' },
    ],
  },
  { divider: true },
  {
    label: 'Ferramentas', to: '/ferramentas', icon: '◆',
    children: [
      { label: 'Teto RPV', to: '/teto-rpv' },
    ],
  },
  { divider: true },
  {
    label: 'Inteligência de Mercado', to: '/inteligencia-mercado', icon: '◆',
    children: [
      { label: 'Visão Geral',                  doc: 'geral' },
      { label: 'Glossário de Termos',           doc: 'bloco0' },
      { label: 'Tetos por Ente',     doc: 'bloco1' },
      { label: 'Teses',              doc: 'bloco2' },
      { label: 'Jurimetria',         doc: 'bloco3' },
      { label: 'Due Diligence',      doc: 'bloco4' },
      { label: 'Tributação',         doc: 'bloco5' },
      { label: 'Fluxo Operacional',  doc: 'bloco6' },
    ],
  },
]

export default function App() {
  const { theme, isDark, toggle } = useTheme()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const isIntelActive = location.pathname === '/inteligencia-mercado'
  const activeDoc = searchParams.get('doc') || 'geral'

  function isDropdownActive(item) {
    if (item.to === '/inteligencia-mercado') return isIntelActive
    if (item.label === 'Dashboard') return DASHBOARD_ROUTES.includes(location.pathname)
    return item.children?.some(c => c.to && location.pathname === c.to)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.pageBg, transition: 'background 0.2s' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        minWidth: 220,
        background: theme.sidebarBg,
        borderRight: `1px solid ${theme.sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
        overflowY: 'auto',
        transition: 'background 0.2s, border-color 0.2s',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px' }}>
          <img
            src={logoSvg}
            alt="Liberta Precatório"
            style={{
              width: '100%',
              maxWidth: 160,
              display: 'block',
              filter: isDark ? 'brightness(0) invert(1)' : 'none',
              opacity: isDark ? 0.9 : 1,
              transition: 'filter 0.2s, opacity 0.2s',
            }}
          />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {NAV.map((item, i) => {
            if (item.divider) {
              return (
                <div key={i} style={{ margin: '8px 20px', borderTop: `1px solid ${theme.sidebarBorder}`, transition: 'border-color 0.2s' }} />
              )
            }

            // Item com filhos (dropdown)
            if (item.children) {
              const isActive = isDropdownActive(item)
              const isIntel = item.to === '/inteligencia-mercado'
              return (
                <div key={item.to}>
                  {/* Item pai */}
                  <button
                    onClick={() => isIntel ? navigate(`${item.to}?doc=geral`) : navigate(item.children[0].to ?? item.to)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 20px', width: '100%',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? theme.accentText : theme.textMuted,
                      background: 'transparent',
                      borderLeft: isActive ? `2px solid ${theme.accentBorder}` : '2px solid transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 10, opacity: 0.6 }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 9, opacity: 0.5 }}>{isActive ? '▾' : '▸'}</span>
                  </button>

                  {/* Filhos — visíveis quando na rota */}
                  {isActive && (
                    <div style={{ paddingBottom: 4 }}>
                      {item.children.map(child => {
                        const isChildActive = child.doc ? activeDoc === child.doc : location.pathname === child.to
                        return (
                          <button
                            key={child.doc || child.to}
                            onClick={() => child.doc ? setSearchParams({ doc: child.doc }) : navigate(child.to)}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '7px 20px 7px 38px',
                              fontSize: 12,
                              fontWeight: isChildActive ? 600 : 400,
                              color: isChildActive ? theme.accentText : theme.textMuted,
                              background: isChildActive ? theme.navActive : 'transparent',
                              borderLeft: isChildActive ? `2px solid ${theme.accentBorder}` : '2px solid transparent',
                              border: 'none', cursor: 'pointer',
                              transition: 'all 0.15s',
                              lineHeight: 1.4,
                            }}
                          >
                            {child.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Item normal
            const isOverview = item.to === '/'
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={isOverview}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 20px', fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? theme.accentText : theme.textMuted,
                  background: isActive ? theme.navActive : 'transparent',
                  borderLeft: isActive ? `2px solid ${theme.accentBorder}` : '2px solid transparent',
                  textDecoration: 'none', transition: 'all 0.15s', cursor: 'pointer',
                })}
              >
                <span style={{ fontSize: 10, opacity: 0.6 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 20px 16px', borderTop: `1px solid ${theme.sidebarBorder}`, transition: 'border-color 0.2s' }}>
          {/* Toggle dark/light */}
          <button
            onClick={toggle}
            title={isDark ? 'Mudar para Light Mode' : 'Mudar para Dark Mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              background: theme.navActive,
              border: `1px solid ${theme.sidebarBorder}`,
              borderRadius: 8,
              padding: '7px 12px',
              cursor: 'pointer',
              marginBottom: 10,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <span style={{ fontSize: 14 }}>{isDark ? '☀️' : '🌙'}</span>
            <span style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 500, transition: 'color 0.2s' }}>
              {isDark ? 'Light mode' : 'Dark mode'}
            </span>
          </button>
          <div style={{ fontSize: 11, color: theme.textFaint, transition: 'color 0.2s' }}>Pipefy · n8n · Supabase</div>
        </div>
      </aside>

      {/* Content */}
      <main style={{ marginLeft: 220, flex: 1, minWidth: 0, minHeight: '100vh', background: theme.pageBg, overflowX: 'hidden', transition: 'background 0.2s' }}>
        <Routes>
          <Route path="/" element={<FunilCompleto />} />
          <Route path="/meta-ads" element={<MetaAds />} />
          <Route path="/sdr" element={<SDR />} />
          <Route path="/comercial" element={<Comercial />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/juridico" element={<Juridico />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/inteligencia-mercado" element={<InteligenciaMercado />} />
          <Route path="/teto-rpv" element={<TetoRPV />} />
        </Routes>
      </main>
    </div>
  )
}
