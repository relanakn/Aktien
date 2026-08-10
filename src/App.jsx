import { useState, useEffect, useRef, useCallback } from 'react'
import {
  klon, zahl, normalisiere, zuEntwurf, isoKW, lese, schreibe,
  kurve, UP, DOWN, FLAT, BUY, SELL,
  LS_ENTWURF, LS_PUB, LS_ARCHIV, LS_FREI, LS_SCHEMA, LEERE_POSITION
} from './utils'
import PublicView from './components/PublicView'
import AdminView from './components/AdminView'

const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE ?? 'relana'

// ── Detect admin route: URL hash contains "redaktion" ──
function isAdminRoute() {
  return (location.hash || '').toLowerCase().includes('redaktion')
}

export default function App() {
  const [schema, setSchema]               = useState(() => lese(LS_SCHEMA) || 'nacht')
  const [modus, setModus]                 = useState(() => isAdminRoute() ? 'admin' : 'ausgabe')
  const [data, setData]                   = useState(null)
  const [entwurf, setEntwurf]             = useState(null)
  const [dirty, setDirty]                 = useState(false)
  const [archiv, setArchiv]               = useState(() => lese(LS_ARCHIV) || [])
  const [frei, setFrei]                   = useState(() => lese(LS_FREI) === true)
  const [meldung, setMeldung]             = useState('')
  const [adminMeldung, setAdminMeldung]   = useState('')
  const [adminTab, setAdminTab]           = useState('ausgabe')
  const [ansicht, setAnsicht]             = useState('liste')
  const [offen, setOffen]                 = useState({})
  const [adminOffen, setAdminOffen]       = useState({})
  const [kurse, setKurse]                 = useState({})
  const [wochen, setWochen]               = useState({})
  const [tage, setTage]                   = useState({})
  const [live, setLive]                   = useState([])
  const [stand, setStand]                 = useState(null)
  const [laden, setLaden]                 = useState(false)
  const [importOffen, setImportOffen]     = useState(false)
  const [importText, setImportText]       = useState('')
  const [importErgebnis, setImportErgebnis] = useState('')
  const [codeEingabe, setCodeEingabe]     = useState('')
  const [codeFehler, setCodeFehler]       = useState(false)

  const taktRef = useRef(null)

  // ── Apply theme to <html> ──
  useEffect(() => {
    if (schema === 'nacht') document.documentElement.setAttribute('data-theme', 'nacht')
    else document.documentElement.removeAttribute('data-theme')
    schreibe(LS_SCHEMA, schema)
  }, [schema])

  // ── Load data.json on mount ──
  useEffect(() => {
    fetch('/data.json?v=' + Date.now())
      .then(r => r.json())
      .then(d => uebernimm(d))
      .catch(() => {
        const pub = lese(LS_PUB)
        if (pub) uebernimm(pub)
        else setMeldung('data.json konnte nicht geladen werden.')
      })
  }, [])

  function uebernimm(basis) {
    const pub = lese(LS_PUB)
    const d = normalisiere(pub || basis)
    const rohEntwurf = lese(LS_ENTWURF)
    const e = rohEntwurf ? rohEntwurf : zuEntwurf(d)
    setData(d)
    setEntwurf(e)
    setDirty(false)
    setArchiv(lese(LS_ARCHIV) || [])
  }

  // ── Finnhub live fetch ──
  const finnhubKey = () => (import.meta.env.VITE_FINNHUB_KEY || '').trim()

  const holeFinnhub = useCallback(async (still) => {
    if (!data || !finnhubKey() || laden) return
    if (!still) setLaden(true)
    const alle = [...data.buys, ...data.sells].filter(s => s.fh)
    let fx = null
    try {
      const r = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR')
      const j = await r.json()
      if (j?.rates?.EUR) fx = j.rates.EUR
    } catch {}
    const newKurse = { ...kurse }, newWochen = { ...wochen }, newTage = { ...tage }
    const newLive = []
    await Promise.all(alle.map(async s => {
      try {
        const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(s.fh)}&token=${encodeURIComponent(finnhubKey())}`)
        const j = await r.json()
        const c = Number(j?.c)
        if (!c) return
        const inEuro = s.fhWaehrung === 'USD' ? (fx ? c * fx : null) : c
        if (inEuro == null) return
        newKurse[s.ticker] = inEuro
        if (typeof j.dp === 'number') newTage[s.ticker] = j.dp
        newLive.push(s.ticker)
      } catch {}
    }))
    setLaden(false)
    setKurse(newKurse)
    setTage(newTage)
    setLive(newLive)
    setStand(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    if (!newLive.length) setMeldung('Finnhub hat keine Kurse geliefert — API-Schlüssel prüfen.')
  }, [data, laden, kurse, wochen, tage])

  // ── Start polling tick ──
  useEffect(() => {
    clearInterval(taktRef.current)
    if (!finnhubKey()) return
    taktRef.current = setInterval(() => {
      if (!document.hidden) holeFinnhub(true)
    }, 60_000)
    return () => clearInterval(taktRef.current)
  }, [holeFinnhub])

  // ── Admin: save draft ──
  function speichern() {
    schreibe(LS_ENTWURF, entwurf)
    setDirty(false)
    setAdminMeldung('Entwurf gesichert.')
  }

  // ── Admin: publish ──
  function veroeffentlichen() {
    const d = normalisiere(entwurf)
    schreibe(LS_PUB, d)
    schreibe(LS_ENTWURF, entwurf)
    const newArchiv = [
      { nummer: d.ausgabe.nummer, kw: d.ausgabe.kalenderwoche, zeit: new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), daten: d }
    ].concat((archiv || []).filter(a => a.nummer !== d.ausgabe.nummer)).slice(0, 12)
    schreibe(LS_ARCHIV, newArchiv)
    setData(d)
    setArchiv(newArchiv)
    setDirty(false)
    setModus('ausgabe')
    setMeldung('')
    setAdminMeldung('')
    setKurse({})
    setWochen({})
  }

  // ── Admin: discard draft ──
  function verwerfen() {
    setEntwurf(zuEntwurf(data))
    setDirty(false)
    setAdminMeldung('Entwurf auf die veröffentlichte Ausgabe zurückgesetzt.')
  }

  // ── Admin: preview draft ──
  function vorschau() {
    setData(normalisiere(entwurf))
    setModus('ausgabe')
    setMeldung('Vorschau des Entwurfs — noch nicht veröffentlicht.')
  }

  // ── Admin: new issue ──
  function neueAusgabe() {
    const e = klon(entwurf)
    const heute = new Date()
    const mo = new Date(heute); mo.setDate(heute.getDate() - ((heute.getDay() + 6) % 7) + 7)
    const fr = new Date(mo); fr.setDate(mo.getDate() + 4)
    const { kw, jahr } = isoKW(mo)
    const tag = dt => dt.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
    e.ausgabe.nummer = zahl(e.ausgabe.nummer) + 1
    e.ausgabe.kalenderwoche = `KW ${kw} / ${jahr}`
    e.ausgabe.datum = `${tag(mo)} – ${tag(fr)}`
    e.ausgabe.redaktionsschluss = `Montag, ${tag(mo)} ${mo.getFullYear()}, 08:00 MESZ`;
    ['buys', 'sells'].forEach(seite => {
      e[seite] = (e[seite] || []).map(s => {
        const w = (typeof s.spark === 'string' ? s.spark.split(/[;,\s]+/) : (s.spark || [])).map(zahl).filter(v => v > 0)
        const neu = w.length >= 2 ? [...w.slice(1), zahl(s.kurs)] : kurve(zahl(s.kurs), zahl(s.woche))
        return { ...s, spark: neu.join(', ') }
      })
    })
    setEntwurf(e)
    setDirty(true)
    setAdminTab('ausgabe')
    setAdminMeldung(`Ausgabe ${e.ausgabe.nummer} angelegt — Kommentar, Thema und Positionen jetzt überarbeiten.`)
  }

  // ── Admin: download draft as JSON ──
  function entwurfHerunterladen() {
    const d = normalisiere(entwurf)
    const url = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a'); a.href = url; a.download = 'data.json'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  // ── Admin: load archived issue into draft ──
  function ladArchiviertesEntwurf(a) {
    setEntwurf(zuEntwurf(normalisiere(a.daten)))
    setDirty(true)
    setAdminMeldung(`Ausgabe ${a.nummer} in den Entwurf geladen.`)
  }

  // ── Admin: upload JSON ──
  function jsonHochladen(e) {
    const datei = e.target.files?.[0]; if (!datei) return
    const leser = new FileReader()
    leser.onload = () => {
      try {
        const roh = JSON.parse(leser.result)
        setEntwurf(zuEntwurf(normalisiere(roh)))
        setDirty(true)
        setAdminMeldung('JSON übernommen — prüfen und dann veröffentlichen.')
      } catch { setAdminMeldung('Die Datei ist kein gültiges JSON.') }
    }
    leser.readAsText(datei)
  }

  // ── Admin: login ──
  function anmelden() {
    if (codeEingabe.trim() === ADMIN_CODE) {
      schreibe(LS_FREI, true)
      setFrei(true)
      setCodeFehler(false)
      setCodeEingabe('')
    } else {
      setCodeFehler(true)
    }
  }

  // ── Admin: logout ──
  function abmelden() {
    schreibe(LS_FREI, false)
    setFrei(false)
    setModus('ausgabe')
  }

  // ── Generic draft field setter ──
  function setzeWert(pfad, wert) {
    setEntwurf(prev => {
      const e = klon(prev)
      const teile = pfad.split('.')
      let o = e
      for (let i = 0; i < teile.length - 1; i++) {
        // Handle numeric indices for arrays
        const k = isNaN(teile[i]) ? teile[i] : parseInt(teile[i], 10)
        o = o[k]
      }
      const lastKey = isNaN(teile[teile.length - 1]) ? teile[teile.length - 1] : parseInt(teile[teile.length - 1], 10)
      o[lastKey] = wert
      return e
    })
    setDirty(true)
    setAdminMeldung('')
  }

  function listeAendern(pfad, fn) {
    setEntwurf(prev => {
      const e = klon(prev)
      const teile = pfad.split('.')
      let o = e
      for (let i = 0; i < teile.length - 1; i++) o = o[teile[i]]
      const k = teile[teile.length - 1]
      o[k] = fn(o[k] || [])
      return e
    })
    setDirty(true)
    setAdminMeldung('')
  }

  function raus(pfad, i) { listeAendern(pfad, a => a.filter((_, j) => j !== i)) }
  function rein(pfad, wert) { listeAendern(pfad, a => [...a, klon(wert)]) }
  function ruecke(pfad, i, um) {
    listeAendern(pfad, a => {
      const j = i + um
      if (j < 0 || j >= a.length) return a
      const n = [...a]; const t = n[i]; n[i] = n[j]; n[j] = t; return n
    })
  }

  // ── Paste import: parse price table lines ──
  function importUebernehmen() {
    if (!data) return
    const alle = [...data.buys, ...data.sells]
    const newKurse = { ...kurse }, newWochen = { ...wochen }
    const treffer = [], fehlt = []

    importText.split(/\r?\n/).forEach(z => {
      if (!z.trim()) return
      const L = z.toUpperCase()
      const s = alle.find(a => a.isin && L.includes(a.isin.toUpperCase()))
            || alle.find(a => L.includes(a.name.toUpperCase()))
            || alle.find(a => new RegExp('(^|[^A-Z0-9])' + a.ticker.toUpperCase() + '([^A-Z0-9]|$)').test(L))
      if (!s) return

      const toks = []
      const re = /([+-]?\d{1,3}(?:\.\d{3})+,\d+|[+-]?\d+,\d+|[+-]?\d+(?:\.\d+)?)\s*(%)?/g
      let m
      while ((m = re.exec(z)) !== null) {
        const roh = m[1]
        const wert = parseFloat(roh.replace(/\./g, '').replace(',', '.'))
        if (!isNaN(wert)) toks.push({ wert, pct: !!m[2], dez: /,/.test(roh) })
      }
      const iPct = toks.findIndex(t => t.pct)
      const vorPct = iPct === -1 ? toks : toks.slice(0, iPct)
      const kands = (vorPct.filter(t => t.dez && !t.pct).length ? vorPct : toks).filter(t => t.dez && !t.pct)
      const kurs = kands.length ? kands[kands.length - 1].wert : null
      const woche = iPct === -1 ? null : toks[iPct].wert
      if (kurs === null) return
      newKurse[s.ticker] = kurs
      if (woche !== null) newWochen[s.ticker] = woche
      if (!treffer.includes(s.ticker)) treffer.push(s.ticker)
    })
    alle.forEach(s => { if (!treffer.includes(s.ticker)) fehlt.push(s.ticker) })

    if (!treffer.length) {
      setImportErgebnis('Keine Position erkannt. Name, Ticker oder ISIN muss in der eingefügten Zeile enthalten sein.')
      return
    }
    // Sync imported prices into draft
    if (entwurf) {
      const e = klon(entwurf);
      ['buys', 'sells'].forEach(seite => (e[seite] || []).forEach(s => {
        if (newKurse[s.ticker] != null) s.kurs = String(newKurse[s.ticker])
        if (newWochen[s.ticker] != null) s.woche = String(newWochen[s.ticker])
      }))
      setEntwurf(e)
      setDirty(true)
    }
    setKurse(newKurse)
    setWochen(newWochen)
    setStand(new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }))
    setImportErgebnis(
      `${treffer.length} von ${alle.length} Kursen übernommen: ${treffer.join(', ')}.` +
      (fehlt.length ? ` Ohne Treffer: ${fehlt.join(', ')}.` : '')
    )
  }

  // ── Toggle flip card ──
  function toggleOffen(key) {
    setOffen(o => ({ ...o, [key]: !o[key] }))
  }
  function toggleAdminOffen(key) {
    setAdminOffen(o => ({ ...o, [key]: !o[key] }))
  }

  // ── Build row data for a stock position ──
  function buildAktie(s, seite) {
    const key = `${seite}:${s.ticker}`
    const liveKurs = kurse[s.ticker]
    const istLive = live.includes(s.ticker)
    const kurs = liveKurs ?? s.kurs
    const tag = tage[s.ticker]
    const w = istLive && typeof tag === 'number' ? tag : (wochen[s.ticker] ?? s.woche)
    const liveKurve = liveKurs != null ? [...s.spark.slice(1), liveKurs] : s.spark
    const farbe = w > 0.05 ? UP : w < -0.05 ? DOWN : FLAT
    const risikoKlasse = s.risiko === 'niedrig' ? 'tag-neutral' : s.risiko === 'mittel' ? 'tag-accent' : 'tag-outline'
    return {
      key, ticker: s.ticker, name: s.name, boerse: s.boerse, sektor: s.sektor, region: s.region,
      isin: s.isin, these: s.these, detail: s.detail, mcap: s.mcap, risiko: s.risiko,
      risikoKlasse, farbe, seiteLabel: seite === 'buy' ? 'Kaufempfehlung' : 'Verkaufsempfehlung',
      seiteFarbe: seite === 'buy' ? BUY : SELL,
      kursNum: kurs,
      kursTxt: `${(kurs < 100 ? kurs.toFixed(2) : kurs.toFixed(2)).replace('.', ',')} €`,
      wocheTxt: (w > 0 ? '▲ +' : w < 0 ? '▼ ' : '· ') + w.toFixed(1).replace('.', ',') + ' %',
      wocheFarbe: farbe, kgvTxt: s.kgv ? s.kgv.toFixed(1).replace('.', ',') : '—',
      spark: liveKurve, istLive,
      liveMarke: istLive ? '● live' : '',
      quelle: istLive ? (s.fhWaehrung === 'USD' ? `Finnhub · ${s.fh} (USD → €)` : `Finnhub · ${s.fh}`) : 'data.json · Stichtag',
      detailKurz: s.detail.length > 150 ? s.detail.slice(0, 148).replace(/\s+\S*$/, '') + ' …' : s.detail,
      offen: !!offen[key],
      toggle: () => toggleOffen(key)
    }
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--color-bg)' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--color-accent)' }}>
          {meldung || 'Lade…'}
        </div>
      </div>
    )
  }

  const sharedProps = {
    data, entwurf, dirty, archiv, frei, modus, schema, ansicht,
    offen, adminOffen, kurse, wochen, tage, live, stand, laden,
    importOffen, importText, importErgebnis,
    meldung, adminMeldung, adminTab,
    codeEingabe, codeFehler,
    UP, DOWN, FLAT, BUY, SELL,
    // Actions
    setModus, setSchema, setAnsicht, setAdminTab,
    setMeldung, setAdminMeldung,
    setImportOffen, setImportText, setImportErgebnis,
    setCodeEingabe: e => { setCodeEingabe(e.target.value); setCodeFehler(false) },
    speichern, veroeffentlichen, verwerfen, vorschau, neueAusgabe,
    entwurfHerunterladen, jsonHochladen,
    anmelden: () => anmelden(),
    abmelden,
    ladArchiviertesEntwurf,
    codeTaste: e => { if (e.key === 'Enter') anmelden() },
    importUebernehmen,
    aktualisieren: () => holeFinnhub(false),
    buildAktie,
    // Draft editing
    setzeWert, raus, rein, ruecke,
    toggleAdminOffen,
  }

  return modus === 'admin'
    ? <AdminView {...sharedProps} />
    : <PublicView {...sharedProps} />
}
