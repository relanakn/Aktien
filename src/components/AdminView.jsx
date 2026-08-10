import { Logo } from './Logo'
import { klon, zahl, normalisiere, kurve, LEERE_POSITION, nf } from '../utils'

// ── Reusable label+input pair for draft editing ──
function Feld({ label, pfad, setzeWert, multiline, style }) {
  const id = pfad.replace(/\./g, '-')
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55 }}>{label}</span>
      {multiline
        ? <textarea id={id} className="input" onChange={e => setzeWert(pfad, e.target.value)} defaultValue={undefined} value={zahl} style={{ minHeight: 80, fontSize: 13.5, lineHeight: 1.55 }} />
        : <input id={id} className="input" onChange={e => setzeWert(pfad, e.target.value)} />
      }
    </label>
  )
}

// ── A controlled text input bound to a draft path ──
function DraftInput({ label, value, onChange, style }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55 }}>{label}</span>
      <input className="input" value={value ?? ''} onChange={onChange} />
    </label>
  )
}

function DraftTextarea({ label, value, onChange, style, minHeight = 80 }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55 }}>{label}</span>
      <textarea className="input" value={value ?? ''} onChange={onChange} style={{ minHeight, fontSize: 13.5, lineHeight: 1.55 }} />
    </label>
  )
}

// ── One position row in the positions tab ──
function AdminPositionRow({ seite, i, entwurf, setzeWert, raus, ruecke, adminOffen, toggleAdminOffen, BUY, SELL }) {
  const s = entwurf[seite][i]
  const key = seite + i
  const offen = !!adminOffen[key]
  const w = zahl(s.woche)
  const wocheFarbe = w > 0.05 ? 'var(--sig-up)' : w < -0.05 ? 'var(--sig-down)' : 'var(--sig-flat)'
  const pfx = `${seite}.${i}`

  return (
    <div className="blueprint" style={{ padding: 0 }}>
      <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
      {/* Row header */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '30px 1fr 130px 108px 96px 34px 34px 34px', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}
        onClick={() => toggleAdminOffen(key)}
      >
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, opacity: 0.45 }}>{String(i + 1).padStart(2, '0')}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 19 }}>{s.ticker || '—'}</span>
          <span style={{ fontSize: 13, opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
        </div>
        <div style={{ fontSize: 13.5, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{zahl(s.kurs).toFixed(2).replace('.', ',')} €</div>
        <div style={{ fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: wocheFarbe }}>
          {(w > 0 ? '+' : '') + w.toFixed(1).replace('.', ',')} %
        </div>
        <div style={{ fontSize: 11, opacity: 0.5 }}>{s.fh ? `live · ${s.fh}` : 'manuell'}</div>
        <button className="btn btn-ghost btn-icon" onClick={e => { e.stopPropagation(); ruecke(seite, i, -1) }} title="nach oben" style={{ fontSize: 11 }}>▲</button>
        <button className="btn btn-ghost btn-icon" onClick={e => { e.stopPropagation(); ruecke(seite, i, 1) }} title="nach unten" style={{ fontSize: 11 }}>▼</button>
        <div style={{ textAlign: 'center', color: 'var(--color-accent)', fontSize: 12 }}>{offen ? '▲' : '▼'}</div>
      </div>

      {/* Expanded fields */}
      {offen && (
        <div style={{ padding: '4px 16px 18px', borderTop: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1.4fr 1fr 1fr', gap: '12px 14px', paddingTop: 14 }}>
            <DraftInput label="Ticker"  value={s.ticker}  onChange={e => setzeWert(`${pfx}.ticker`, e.target.value)} />
            <DraftInput label="Name"    value={s.name}    onChange={e => setzeWert(`${pfx}.name`, e.target.value)} />
            <DraftInput label="Börse"   value={s.boerse}  onChange={e => setzeWert(`${pfx}.boerse`, e.target.value)} />
            <DraftInput label="ISIN"    value={s.isin}    onChange={e => setzeWert(`${pfx}.isin`, e.target.value)} />
            <DraftInput label="Kurs (€)" value={s.kurs}  onChange={e => setzeWert(`${pfx}.kurs`, e.target.value)} />
            <DraftInput label="Woche %" value={s.woche}  onChange={e => setzeWert(`${pfx}.woche`, e.target.value)} />
            <DraftInput label="KGV"     value={s.kgv}    onChange={e => setzeWert(`${pfx}.kgv`, e.target.value)} />
            <DraftInput label="Marktkap." value={s.mcap} onChange={e => setzeWert(`${pfx}.mcap`, e.target.value)} />
            <DraftInput label="Sektor"  value={s.sektor} onChange={e => setzeWert(`${pfx}.sektor`, e.target.value)} />
            <DraftInput label="Region"  value={s.region} onChange={e => setzeWert(`${pfx}.region`, e.target.value)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55 }}>Risiko</span>
              <select className="input" value={s.risiko} onChange={e => setzeWert(`${pfx}.risiko`, e.target.value)}>
                <option value="niedrig">niedrig</option>
                <option value="mittel">mittel</option>
                <option value="hoch">hoch</option>
              </select>
            </div>
            <DraftInput label="Finnhub-Symbol" value={s.fh} onChange={e => setzeWert(`${pfx}.fh`, e.target.value)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55 }}>FH Währung</span>
              <select className="input" value={s.fhWaehrung || ''} onChange={e => setzeWert(`${pfx}.fhWaehrung`, e.target.value)}>
                <option value="">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <DraftTextarea label="Kurzbegründung (These)" value={s.these} onChange={e => setzeWert(`${pfx}.these`, e.target.value)} minHeight={72} />
          <DraftTextarea label="Detail" value={s.detail} onChange={e => setzeWert(`${pfx}.detail`, e.target.value)} minHeight={56} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55 }}>Sparkline-Werte (kommagetrennt)</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <input className="input" value={s.spark ?? ''} onChange={e => setzeWert(`${pfx}.spark`, e.target.value)} style={{ fontFamily: 'monospace', fontSize: 12 }} />
              <button
                className="btn btn-secondary"
                style={{ fontSize: 11, padding: '5px 11px', whiteSpace: 'nowrap' }}
                onClick={() => {
                  const neu = kurve(zahl(s.kurs), zahl(s.woche)).join(', ')
                  setzeWert(`${pfx}.spark`, neu)
                }}
              >Neu generieren</button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
            <button className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--sig-down)' }} onClick={() => raus(seite, i)}>
              Position entfernen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main admin view ──
export default function AdminView(props) {
  const {
    entwurf, dirty, archiv, frei, adminTab, adminMeldung,
    codeEingabe, codeFehler,
    setModus, setAdminTab, setAdminMeldung,
    setCodeEingabe, codeTaste,
    speichern, veroeffentlichen, verwerfen, vorschau, neueAusgabe,
    entwurfHerunterladen, jsonHochladen,
    anmelden, abmelden,
    setzeWert, raus, rein, ruecke,
    adminOffen, toggleAdminOffen,
    BUY, SELL
  } = props

  // Login screen
  if (!frei) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'grid', placeItems: 'center', padding: 40 }}>
        <div className="blueprint" style={{ width: 'min(420px, 100%)', padding: '34px 32px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
          <Logo size={40} style={{ marginBottom: 18 }} />
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 6 }}>Redaktion</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 30, lineHeight: 1.08, marginBottom: 8 }}>Anmelden</div>
          <p style={{ margin: '0 0 20px', fontSize: 13, lineHeight: 1.55, opacity: 0.62 }}>
            Hier pflegst du die Ausgabe der Woche. Der Code sitzt in der Umgebungsvariable und schützt vor Neugierigen.
          </p>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55 }}>Zugangscode</span>
            <input
              className="input" type="password"
              value={codeEingabe} onChange={setCodeEingabe} onKeyDown={codeTaste}
              placeholder="••••••" autoFocus
            />
          </label>
          {codeFehler && <div style={{ fontSize: 12, color: 'var(--sig-down)', marginBottom: 14 }}>Code stimmt nicht.</div>}
          <div style={{ display: 'flex', gap: 9 }}>
            <button className="btn btn-primary" onClick={anmelden} style={{ flex: 1 }}>Anmelden</button>
            <button className="btn btn-ghost" onClick={() => setModus('ausgabe')}>Zurück</button>
          </div>
        </div>
      </div>
    )
  }

  if (!entwurf) return null

  const e = entwurf

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* ── Admin header ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--kopf-bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 'auto' }}>
            <Logo size={34} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 21, lineHeight: 1.05 }}>
                Redaktion · Ausgabe {e.ausgabe?.nummer}
              </div>
              <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55 }}>
                {dirty ? 'Ungesicherte Änderungen' : 'Entwurf gesichert'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-ghost" onClick={neueAusgabe} style={{ fontSize: 12, padding: '5px 11px' }} title="Ausgabennummer und Datumsangaben auf die kommende Woche setzen">
              Neue Woche
            </button>
            <button className="btn btn-ghost" onClick={verwerfen} style={{ fontSize: 12, padding: '5px 11px' }}>Verwerfen</button>
            <button className="btn btn-secondary" onClick={vorschau} style={{ fontSize: 12, padding: '5px 11px' }}>Vorschau</button>
            <button className="btn btn-secondary" onClick={speichern} style={{ fontSize: 12, padding: '5px 11px' }}>Entwurf sichern</button>
            <button className="btn btn-primary" onClick={veroeffentlichen} style={{ fontSize: 12, padding: '5px 13px' }}>Veröffentlichen</button>
            <button className="btn btn-ghost" onClick={abmelden} style={{ fontSize: 12, padding: '5px 11px' }}>Abmelden</button>
            <button className="btn btn-secondary btn-icon" onClick={() => setModus('ausgabe')} aria-label="Redaktion verlassen" title="Redaktion verlassen">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="seg">
            {[
              { id: 'ausgabe', label: 'Ausgabe & Kommentar' },
              { id: 'positionen', label: 'Positionen' },
              { id: 'markt', label: 'Markt & Termine' },
              { id: 'datei', label: 'Datei & Archiv' },
            ].map(tab => (
              <button key={tab.id} className={`seg-opt${adminTab === tab.id ? ' active' : ''}`} onClick={() => setAdminTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
          {adminMeldung && (
            <div style={{ fontSize: 12, padding: '5px 11px', border: '1px solid var(--color-accent)', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)' }}>
              {adminMeldung}
            </div>
          )}
        </div>
        <div style={{ height: 1, background: 'var(--kopf-linie)' }} />
      </header>

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px 40px 72px' }}>

        {/* ── Tab: Ausgabe & Kommentar ── */}
        {adminTab === 'ausgabe' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 36, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* Kopfdaten */}
              <div className="blueprint" style={{ padding: '22px 24px' }}>
                <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
                <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 }}>Kopfdaten der Ausgabe</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 16px' }}>
                  <DraftInput label="Nummer" value={e.ausgabe?.nummer} onChange={ev => setzeWert('ausgabe.nummer', ev.target.value)} />
                  <DraftInput label="Kalenderwoche" value={e.ausgabe?.kalenderwoche} onChange={ev => setzeWert('ausgabe.kalenderwoche', ev.target.value)} />
                  <DraftInput label="Zeitraum" value={e.ausgabe?.datum} onChange={ev => setzeWert('ausgabe.datum', ev.target.value)} />
                  <DraftInput label="Redaktionsschluss" value={e.ausgabe?.redaktionsschluss} onChange={ev => setzeWert('ausgabe.redaktionsschluss', ev.target.value)} style={{ gridColumn: 'span 2' }} />
                  <DraftInput label="Kursstand" value={e.ausgabe?.kursstand} onChange={ev => setzeWert('ausgabe.kursstand', ev.target.value)} />
                </div>
              </div>

              {/* Marktkommentar */}
              <div className="blueprint" style={{ padding: '22px 24px' }}>
                <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginRight: 'auto' }}>Marktkommentar</div>
                  <div style={{ fontSize: 11, opacity: 0.5 }}>{(e.editorial?.absaetze || []).join(' ').length} Zeichen</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '14px 16px', marginBottom: 18 }}>
                  <DraftInput label="Überschrift" value={e.editorial?.titel} onChange={ev => setzeWert('editorial.titel', ev.target.value)} />
                  <DraftInput label="Signatur" value={e.editorial?.signatur} onChange={ev => setzeWert('editorial.signatur', ev.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(e.editorial?.absaetze || []).map((t, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '26px 1fr 32px', gap: 10, alignItems: 'start' }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--color-accent)', paddingTop: 9 }}>{String(i + 1).padStart(2, '0')}</div>
                      <textarea
                        className="input" value={t ?? ''} onChange={ev => setzeWert(`editorial.absaetze.${i}`, ev.target.value)}
                        style={{ minHeight: 96, fontSize: 13.5, lineHeight: 1.55 }}
                      />
                      <button className="btn btn-ghost btn-icon" onClick={() => raus('editorial.absaetze', i)} aria-label="Absatz entfernen">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn btn-secondary" onClick={() => rein('editorial.absaetze', '')} style={{ marginTop: 14, fontSize: 12, padding: '5px 11px' }}>
                  Absatz hinzufügen
                </button>
              </div>
            </div>

            {/* Thema der Woche */}
            <div className="blueprint" style={{ padding: '22px 24px' }}>
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 }}>Thema der Woche</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <DraftInput label="Kicker" value={e.thema?.kicker} onChange={ev => setzeWert('thema.kicker', ev.target.value)} />
                <DraftInput label="Titel" value={e.thema?.titel} onChange={ev => setzeWert('thema.titel', ev.target.value)} />
                <DraftTextarea label="Text" value={e.thema?.text} onChange={ev => setzeWert('thema.text', ev.target.value)} minHeight={150} />
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 7 }}>Stichpunkte</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(e.thema?.punkte || []).map((t, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 32px', gap: 8, alignItems: 'start' }}>
                        <textarea className="input" value={t ?? ''} onChange={ev => setzeWert(`thema.punkte.${i}`, ev.target.value)} style={{ minHeight: 56, fontSize: 12.5, lineHeight: 1.5 }} />
                        <button className="btn btn-ghost btn-icon" onClick={() => raus('thema.punkte', i)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-secondary" onClick={() => rein('thema.punkte', '')} style={{ marginTop: 10, fontSize: 12, padding: '5px 11px' }}>
                    Stichpunkt hinzufügen
                  </button>
                </div>
                <DraftTextarea label="Disclaimer" value={e.disclaimer} onChange={ev => setzeWert('disclaimer', ev.target.value)} minHeight={80} />
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Positionen ── */}
        {adminTab === 'positionen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
            {[
              { seite: 'buys', titel: 'Kaufempfehlungen', farbe: BUY },
              { seite: 'sells', titel: 'Verkaufsempfehlungen', farbe: SELL }
            ].map(g => (
              <div key={g.seite}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, paddingBottom: 11, marginBottom: 16, borderBottom: `2px solid ${g.farbe}` }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26 }}>{g.titel}</div>
                  <div style={{ fontSize: 12, opacity: 0.55, marginRight: 'auto' }}>
                    {(e[g.seite] || []).length} Positionen · Zeile anklicken zum Aufklappen
                  </div>
                  <button className="btn btn-secondary" onClick={() => rein(g.seite, LEERE_POSITION)} style={{ fontSize: 12, padding: '5px 11px' }}>
                    Position hinzufügen
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(e[g.seite] || []).map((_, i) => (
                    <AdminPositionRow
                      key={i} seite={g.seite} i={i} entwurf={e}
                      setzeWert={setzeWert} raus={raus} ruecke={ruecke}
                      adminOffen={adminOffen} toggleAdminOffen={toggleAdminOffen}
                      BUY={BUY} SELL={SELL}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Markt & Termine ── */}
        {adminTab === 'markt' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

            {/* Makro */}
            <div className="blueprint" style={{ padding: '22px 24px' }}>
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 }}>Makrodaten</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(e.makro || []).map((m, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 32px', gap: '8px 10px', alignItems: 'end', borderBottom: '1px solid var(--color-divider)', paddingBottom: 12 }}>
                    <DraftInput label="Label" value={m.label} onChange={ev => setzeWert(`makro.${i}.label`, ev.target.value)} />
                    <DraftInput label="Wert" value={m.wert} onChange={ev => setzeWert(`makro.${i}.wert`, ev.target.value)} />
                    <DraftInput label="Delta" value={m.delta} onChange={ev => setzeWert(`makro.${i}.delta`, ev.target.value)} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55 }}>Richtung</span>
                      <select className="input" value={m.richtung || 'flat'} onChange={ev => setzeWert(`makro.${i}.richtung`, ev.target.value)}>
                        <option value="up">up</option>
                        <option value="down">down</option>
                        <option value="flat">flat</option>
                      </select>
                    </div>
                    <button className="btn btn-ghost btn-icon" style={{ alignSelf: 'end' }} onClick={() => raus('makro', i)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                    </button>
                    <DraftInput label="Notiz" value={m.notiz} onChange={ev => setzeWert(`makro.${i}.notiz`, ev.target.value)} style={{ gridColumn: '1/-1' }} />
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary" onClick={() => rein('makro', { label: '', wert: '', delta: '', richtung: 'flat', notiz: '' })} style={{ marginTop: 12, fontSize: 12, padding: '5px 11px' }}>
                Makrokennzahl hinzufügen
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Sektoren */}
              <div className="blueprint" style={{ padding: '22px 24px' }}>
                <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
                <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 }}>Sektoren</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(e.sektoren || []).map((k, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 32px', gap: 8, alignItems: 'end' }}>
                      <DraftInput label="Sektor" value={k.name} onChange={ev => setzeWert(`sektoren.${i}.name`, ev.target.value)} />
                      <DraftInput label="Woche %" value={k.woche} onChange={ev => setzeWert(`sektoren.${i}.woche`, ev.target.value)} />
                      <button className="btn btn-ghost btn-icon" style={{ alignSelf: 'end' }} onClick={() => raus('sektoren', i)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn btn-secondary" onClick={() => rein('sektoren', { name: '', woche: '0' })} style={{ marginTop: 12, fontSize: 12, padding: '5px 11px' }}>
                  Sektor hinzufügen
                </button>
              </div>

              {/* Termine */}
              <div className="blueprint" style={{ padding: '22px 24px' }}>
                <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
                <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 }}>Termine der Woche</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(e.termine || []).map((t, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 100px 32px', gap: 8, alignItems: 'end' }}>
                      <DraftInput label="Tag" value={t.tag} onChange={ev => setzeWert(`termine.${i}.tag`, ev.target.value)} />
                      <DraftInput label="Titel" value={t.titel} onChange={ev => setzeWert(`termine.${i}.titel`, ev.target.value)} />
                      <DraftInput label="Typ" value={t.typ} onChange={ev => setzeWert(`termine.${i}.typ`, ev.target.value)} />
                      <button className="btn btn-ghost btn-icon" style={{ alignSelf: 'end' }} onClick={() => raus('termine', i)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn btn-secondary" onClick={() => rein('termine', { tag: '', titel: '', typ: 'Zahlen' })} style={{ marginTop: 12, fontSize: 12, padding: '5px 11px' }}>
                  Termin hinzufügen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Datei & Archiv ── */}
        {adminTab === 'datei' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

            {/* Datei-Aktionen */}
            <div className="blueprint" style={{ padding: '22px 24px' }}>
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 }}>Datei</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, opacity: 0.7 }}>
                  Lade die aktuelle Ausgabe als <code>data.json</code> herunter, bearbeite sie extern und lade sie wieder hoch.
                  Die hochgeladene Datei landet direkt im Entwurf.
                </p>
                <button className="btn btn-secondary" onClick={entwurfHerunterladen}>
                  Entwurf als data.json herunterladen
                </button>
                <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                  JSON-Datei hochladen
                  <input type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={jsonHochladen} />
                </label>
              </div>
            </div>

            {/* Archiv */}
            <div className="blueprint" style={{ padding: '22px 24px' }}>
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 }}>Archiv (letzte 12 Ausgaben)</div>
              {(!archiv || archiv.length === 0)
                ? <p style={{ margin: 0, fontSize: 13, opacity: 0.55 }}>Noch keine Ausgaben veröffentlicht.</p>
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {archiv.map(a => (
                      <div key={a.nummer} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px auto', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--color-divider)' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>#{a.nummer}</div>
                        <div>
                          <div style={{ fontSize: 13.5 }}>{a.kw}</div>
                          <div style={{ fontSize: 11, opacity: 0.5 }}>{a.zeit}</div>
                        </div>
                        <button
                          className="btn btn-ghost"
                          style={{ fontSize: 11, padding: '3px 8px' }}
                          onClick={() => props.ladArchiviertesEntwurf(a)}
                        >
                          In Entwurf laden
                        </button>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
