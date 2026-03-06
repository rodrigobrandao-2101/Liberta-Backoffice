import { useState, useRef, useEffect } from 'react'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS_SHORT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

// Date utils (no external deps)
const sod = d => { const r = new Date(d); r.setHours(0, 0, 0, 0); return r }
const eod = d => { const r = new Date(d); r.setHours(23, 59, 59, 999); return r }
const addD = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const som = d => new Date(d.getFullYear(), d.getMonth(), 1)
const eom = d => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString()
const inRange = (d, s, e) => d && s && e && d >= s && d <= e

const PRESETS = [
  { label: 'Hoje', key: 'hoje' },
  { label: 'Ontem', key: 'ontem' },
  { label: 'Este mês', key: 'este-mes' },
  {
    label: 'Últimos 7 dias', key: 'group', sub: [
      { label: 'Últimos 7 dias', key: 'u7' },
      { label: 'Últimos 14 dias', key: 'u14' },
      { label: 'Últimos 28 dias', key: 'u28' },
      { label: 'Últimos 30 dias', key: 'u30' },
      { label: 'Semana passada (começa no domingo)', key: 'w-sun' },
      { label: 'Semana passada (começa na segunda-feira)', key: 'w-mon' },
      { label: 'Mês passado', key: 'last-month' },
      { label: 'Trimestre passado', key: 'last-quarter' },
      { label: 'Ano passado', key: 'last-year' },
    ]
  },
]

function calcRange(key) {
  const t = sod(new Date()), te = eod(new Date())
  switch (key) {
    case 'hoje': return [t, te]
    case 'ontem': { const d = addD(t, -1); return [d, eod(d)] }
    case 'este-mes': return [som(t), eom(t)]
    case 'u7': return [addD(t, -6), te]
    case 'u14': return [addD(t, -13), te]
    case 'u28': return [addD(t, -27), te]
    case 'u30': return [addD(t, -29), te]
    case 'w-sun': { const d = addD(t, -(t.getDay() + 7)); return [d, eod(addD(d, 6))] }
    case 'w-mon': { const d = addD(t, -(t.getDay() === 0 ? 6 : t.getDay() - 1) - 7); return [d, eod(addD(d, 6))] }
    case 'last-month': { const d = new Date(t.getFullYear(), t.getMonth() - 1, 1); return [d, eom(d)] }
    case 'last-quarter': {
      const q = Math.floor(t.getMonth() / 3)
      const sm = ((q - 1 + 4) % 4) * 3
      const y = q === 0 ? t.getFullYear() - 1 : t.getFullYear()
      const s = new Date(y, sm, 1)
      return [s, eom(new Date(y, sm + 2, 1))]
    }
    case 'last-year': { const y = t.getFullYear() - 1; return [new Date(y, 0, 1), new Date(y, 11, 31, 23, 59, 59, 999)] }
    default: return [null, null]
  }
}

function daysGrid(year, month) {
  const fd = new Date(year, month, 1).getDay()
  const dm = new Date(year, month + 1, 0).getDate()
  const g = []
  for (let i = 0; i < fd; i++) g.push(null)
  for (let d = 1; d <= dm; d++) g.push(new Date(year, month, d))
  return g
}

function fmtDate(d) {
  if (!d) return '—'
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function btnLabel(s, e) {
  if (!s && !e) return 'Selecionar período'
  if (s && !e) return fmtDate(s)
  return `${fmtDate(s)} – ${fmtDate(e)}`
}

const navBtn = {
  background: 'none', border: '1px solid #334155', color: '#94a3b8',
  borderRadius: 4, padding: '1px 8px', cursor: 'pointer', fontSize: 15, lineHeight: 1.4,
}

function Cal({ title, ym, onNav, rangeStart, rangeEnd, selecting, hovered, onDayClick, onDayHover }) {
  const { y, m } = ym
  const grid = daysGrid(y, m)
  const today = sod(new Date())

  const effStart = selecting && hovered && hovered < rangeStart ? hovered : rangeStart
  const effEnd = selecting && hovered ? (hovered < rangeStart ? rangeStart : hovered) : rangeEnd

  return (
    <div style={{ flex: 1 }}>
      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
        <button onClick={() => onNav(-1)} style={navBtn}>‹</button>
        <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13, minWidth: 110, textAlign: 'center' }}>
          {MONTHS_SHORT[m]}. DE {y}
        </span>
        <button onClick={() => onNav(1)} style={navBtn}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 32px)', justifyContent: 'center' }}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, color: '#475569', padding: '3px 0' }}>{w}</div>
        ))}
      </div>
      <div style={{ color: '#475569', fontSize: 11, margin: '2px 0 2px 2px' }}>{MONTHS_SHORT[m]}.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 32px)', justifyContent: 'center' }}>
        {grid.map((day, i) => {
          if (!day) return <div key={i} />
          const isToday = sameDay(day, today)
          const isStart = sameDay(day, effStart)
          const isEnd = sameDay(day, effEnd)
          const inR = inRange(day, effStart, effEnd)
          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              onMouseEnter={() => onDayHover(day)}
              style={{
                textAlign: 'center', fontSize: 12, lineHeight: '28px', height: 28,
                borderRadius: (isStart || isEnd) ? 14 : 0,
                background: (isStart || isEnd) ? '#4f46e5' : (inR ? '#1e3a5f' : 'transparent'),
                color: (isStart || isEnd) ? '#fff' : (isToday ? '#a5b4fc' : '#cbd5e1'),
                cursor: 'pointer',
                outline: isToday && !(isStart || isEnd) ? '1px solid #4f46e5' : 'none',
                outlineOffset: '-1px',
              }}
            >
              {day.getDate()}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DateRangePicker({ value, onChange }) {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [presetOpen, setPresetOpen] = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const [pStart, setPStart] = useState(value?.[0] ? new Date(value[0]) : null)
  const [pEnd, setPEnd] = useState(value?.[1] ? new Date(value[1]) : null)
  const [selecting, setSelecting] = useState(false)
  const [hovered, setHovered] = useState(null)
  const [leftYM, setLeftYM] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [rightYM, setRightYM] = useState({ y: today.getFullYear(), m: (today.getMonth() + 1) % 12 })
  const ref = useRef(null)

  useEffect(() => {
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false); setPresetOpen(false); setSubOpen(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function applyPreset(key) {
    const [s, e] = calcRange(key)
    setPStart(s); setPEnd(e); setSelecting(false)
    setPresetOpen(false); setSubOpen(false)
    if (s) setLeftYM({ y: s.getFullYear(), m: s.getMonth() })
  }

  function handleDayClick(day) {
    if (!selecting) {
      setPStart(sod(day)); setPEnd(null); setSelecting(true)
    } else {
      const s = sod(day) < pStart ? sod(day) : pStart
      const e = sod(day) < pStart ? eod(pStart) : eod(day)
      setPStart(s); setPEnd(e); setSelecting(false); setHovered(null)
    }
  }

  function handleApply() {
    onChange([
      pStart ? pStart.toISOString().slice(0, 10) : '',
      pEnd ? pEnd.toISOString().slice(0, 10) : '',
    ])
    setOpen(false); setPresetOpen(false)
  }

  function handleCancel() {
    setPStart(value?.[0] ? new Date(value[0]) : null)
    setPEnd(value?.[1] ? new Date(value[1]) : null)
    setSelecting(false); setOpen(false); setPresetOpen(false)
  }

  function navCal(side, dir) {
    const fn = prev => {
      let m = prev.m + dir, y = prev.y
      if (m > 11) { m = 0; y++ }
      if (m < 0) { m = 11; y-- }
      return { y, m }
    }
    if (side === 'L') setLeftYM(fn); else setRightYM(fn)
  }

  const dispStart = value?.[0] ? new Date(value[0]) : null
  const dispEnd = value?.[1] ? new Date(value[1]) : null

  const menuItemStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 14px', fontSize: 13, color: '#cbd5e1', cursor: 'pointer',
    position: 'relative',
  }

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      <button
        onClick={() => { setOpen(o => !o); setPresetOpen(false) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: open ? '#252b3d' : '#1e2130',
          border: '1px solid #2d3748', color: '#e2e8f0',
          borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer',
        }}
      >
        {btnLabel(dispStart, dispEnd)}
        <span style={{ color: '#64748b', fontSize: 10 }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 1000,
          background: '#1a1f2e', border: '1px solid #2d3748', borderRadius: 12,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)', padding: 20, width: 600,
        }}>
          {/* Preset selector */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, position: 'relative' }}>
            <button
              onClick={() => { setPresetOpen(o => !o); setSubOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: presetOpen ? '#2d3748' : '#252b3d',
                border: '1px solid #2d3748', color: '#e2e8f0',
                borderRadius: 8, padding: '7px 12px', fontSize: 13, cursor: 'pointer',
              }}
            >
              Período automático <span style={{ fontSize: 10, color: '#64748b' }}>▼</span>
            </button>

            {presetOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 20,
                background: '#1a1f2e', border: '1px solid #2d3748', borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)', minWidth: 200, overflow: 'visible',
              }}>
                {PRESETS.map(p => (
                  <div
                    key={p.key}
                    onClick={() => p.key !== 'group' && applyPreset(p.key)}
                    onMouseEnter={e => { e.currentTarget.style.background = '#252b3d'; p.key === 'group' && setSubOpen(true) }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    style={menuItemStyle}
                  >
                    <span>{p.label}</span>
                    {p.key === 'group' && (
                      <>
                        <span style={{ fontSize: 10, color: '#64748b' }}>▶</span>
                        {subOpen && (
                          <div style={{
                            position: 'absolute', right: '100%', top: 0, marginRight: 4, zIndex: 30,
                            background: '#1a1f2e', border: '1px solid #2d3748', borderRadius: 8,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)', minWidth: 270,
                          }}>
                            {p.sub.map(s => (
                              <div
                                key={s.key}
                                onClick={e => { e.stopPropagation(); applyPreset(s.key) }}
                                onMouseEnter={e => e.currentTarget.style.background = '#252b3d'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                style={menuItemStyle}
                              >
                                {s.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendars */}
          <div style={{ display: 'flex', gap: 20 }}>
            <Cal
              title="Data de início"
              ym={leftYM}
              onNav={d => navCal('L', d)}
              rangeStart={pStart} rangeEnd={pEnd}
              selecting={selecting} hovered={hovered}
              onDayClick={handleDayClick}
              onDayHover={d => selecting && setHovered(d)}
            />
            <div style={{ width: 1, background: '#2d3748', alignSelf: 'stretch' }} />
            <Cal
              title="Data de término"
              ym={rightYM}
              onNav={d => navCal('R', d)}
              rangeStart={pStart} rangeEnd={pEnd}
              selecting={selecting} hovered={hovered}
              onDayClick={handleDayClick}
              onDayHover={d => selecting && setHovered(d)}
            />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid #2d3748' }}>
            <button
              onClick={handleCancel}
              style={{ padding: '7px 16px', borderRadius: 8, background: 'transparent', border: '1px solid #2d3748', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              style={{ padding: '7px 20px', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
