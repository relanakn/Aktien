// ── Number formatting ──
export const nf = (v, d) =>
  Number(v).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d })

// ── Deep clone ──
export const klon = o => JSON.parse(JSON.stringify(o))

// ── Safe number parse (handles German decimals) ──
export const zahl = x => {
  if (typeof x === 'number') return isNaN(x) ? 0 : x
  const n = parseFloat(String(x == null ? '' : x).replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

// ── Signal colors ──
export const UP   = 'var(--sig-up)'
export const DOWN = 'var(--sig-down)'
export const FLAT = 'var(--sig-flat)'
export const BUY  = 'var(--sig-buy)'
export const SELL = 'var(--sig-sell)'

// ── Generate a plausible sparkline ending at `jetzt` with weekly change ──
export function kurve(jetzt, wochePct) {
  const start = jetzt / (1 + zahl(wochePct) / 100) || jetzt
  const p = []
  for (let i = 0; i < 14; i++) {
    const t = i / 13
    const basis = start + (jetzt - start) * t
    const rausch = basis * (Math.sin(i * 1.7) * 0.006 + Math.cos(i * 2.3) * 0.004)
    p.push(Number((i === 13 ? jetzt : basis + rausch).toFixed(2)))
  }
  return p
}

// ── SVG polyline points string from value array ──
export function sparkPoints(vals) {
  if (!vals || vals.length < 2) return ''
  const min = Math.min(...vals), max = Math.max(...vals), r = (max - min) || 1
  return vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * 110
    const y = 23 - ((v - min) / r) * 20
    return x.toFixed(1) + ',' + y.toFixed(1)
  }).join(' ')
}

// ── Normalize raw draft → published data ──
export function normalisiere(roh) {
  const d = klon(roh)
  d.ausgabe.nummer = zahl(d.ausgabe.nummer);
  ['buys', 'sells'].forEach(seite => {
    d[seite] = (d[seite] || []).map(s => {
      const o = { ...s, kurs: zahl(s.kurs), woche: zahl(s.woche), kgv: zahl(s.kgv) }
      const werte = (typeof s.spark === 'string'
        ? s.spark.split(/[;,\s]+/)
        : (s.spark || [])).map(zahl).filter(v => v > 0)
      o.spark = werte.length >= 2 ? werte : kurve(o.kurs, o.woche)
      return o
    })
  })
  d.sektoren = (d.sektoren || []).map(k => ({ ...k, woche: zahl(k.woche) }))
  return d
}

// ── Convert published data back to editable draft (numbers as strings) ──
export function zuEntwurf(d) {
  const e = klon(d);
  ['buys', 'sells'].forEach(seite => {
    e[seite] = (e[seite] || []).map(s => ({
      ...s,
      spark: Array.isArray(s.spark) ? s.spark.join(', ') : (s.spark || '')
    }))
  })
  return e
}

// ── ISO week number ──
export function isoKW(dt) {
  const t = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return { kw: Math.ceil(((t - start) / 86400000 + 1) / 7), jahr: t.getUTCFullYear() }
}

// ── localStorage helpers ──
export const lese = key => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : null } catch { return null }
}
export const schreibe = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* quota */ }
}

// ── Storage keys ──
export const LS_ENTWURF = 'relana.weekly.entwurf'
export const LS_PUB     = 'relana.weekly.ausgabe'
export const LS_ARCHIV  = 'relana.weekly.archiv'
export const LS_FREI    = 'relana.weekly.freigabe'
export const LS_SCHEMA  = 'relana.weekly.schema'

// ── Empty position template ──
export const LEERE_POSITION = {
  ticker: 'NEU', name: 'Neue Position', boerse: 'XETRA', isin: '', sektor: '', region: 'Europa',
  kurs: '0', woche: '0', kgv: '0', mcap: '', risiko: 'mittel', fh: '', fhWaehrung: '',
  these: '', detail: '', spark: ''
}
