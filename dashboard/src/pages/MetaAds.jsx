import { useState } from 'react'
import DateRangePicker from '../components/DateRangePicker'

export default function MetaAds() {
  const [dateRange, setDateRange] = useState(['', ''])
  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Meta Ads</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Visualizações de campanhas e leads de tráfego pago.</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, background: '#1e2130', borderRadius: 16, border: '1px dashed #ec489940' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🚧</div>
          <div style={{ color: '#ec4899', fontWeight: 600, fontSize: 15 }}>Em construção</div>
          <div style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>Visualizações em breve</div>
        </div>
      </div>
    </div>
  )
}
