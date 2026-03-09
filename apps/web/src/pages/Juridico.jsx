import { useTheme } from '../ThemeContext.jsx'
import { useState } from 'react'
import DateRangePicker from '../components/DateRangePicker'

export default function Juridico() {
  const { theme } = useTheme()
  const [dateRange, setDateRange] = useState(['', ''])
  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary, marginBottom: 4 }}>Jurídico</h1>
          <p style={{ color: theme.textMuted, fontSize: 13 }}>Análise jurídica e anexação nos autos — pipe JURÍDICO.</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, background: theme.cardBg, borderRadius: 16, border: '1px dashed #10b98140' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🚧</div>
          <div style={{ color: '#10b981', fontWeight: 600, fontSize: 15 }}>Em construção</div>
          <div style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>Visualizações em breve</div>
        </div>
      </div>
    </div>
  )
}
