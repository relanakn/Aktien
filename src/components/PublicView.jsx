import { Logo, SparkLine } from './Logo'
import { nf, zahl, UP, DOWN } from '../utils'

// ── Flip card for one stock position ──
function AktieKarte({ s, variante }) {
  if (variante === 'karten') {
    return (
      <div className="flip-wrap" onClick={s.toggle}>
        <div className={`flip-inner${s.offen ? ' flipped' : ''}`} style={{ minHeight: 180 }}>
          <div className="flip-face card blueprint" style={{ gridArea: '1/1', padding: 16, gap: 0 }}>
            <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22 }}>{s.ticker}</div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 1 }}>{s.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22 }}>{s.kursTxt}</div>
                <div style={{ fontSize: 13, color: s.wocheFarbe }}>{s.wocheTxt}</div>
              </div>
            </div>
            <SparkLine vals={s.spark} color={s.wocheFarbe} width={120} height={24} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <span className={`tag ${s.risikoKlasse}`}>{s.risiko}</span>
              <span style={{ fontSize: 11, opacity: 0.6 }}>{s.sektor}</span>
              <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', marginLeft: 'auto' }}>Details ↻</span>
            </div>
          </div>
          <div className="flip-back card blueprint" style={{
            gridArea: '1/1', padding: 16, gap: 0,
            background: 'var(--panel-bg)', color: 'var(--panel-fg)',
            borderColor: 'transparent', justifyContent: 'flex-start'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19 }}>{s.ticker}</div>
              <div style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6 }}>{s.seiteLabel}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px', paddingBottom: 11, marginBottom: 11, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              <div><div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.55 }}>KGV</div><div style={{ fontFamily: 'var(--font-heading)', fontSize: 17 }}>{s.kgvTxt}</div></div>
              <div><div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.55 }}>Marktkap.</div><div style={{ fontFamily: 'var(--font-heading)', fontSize: 17 }}>{s.mcap}</div></div>
              <div><div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.55 }}>Sektor</div><div style={{ fontSize: 12 }}>{s.sektor}</div></div>
              <div><div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.55 }}>Börse</div><div style={{ fontSize: 12 }}>{s.boerse}</div></div>
            </div>
            <div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.55, marginBottom: 5 }}>Kurzbegründung</div>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, opacity: 0.95 }}>{s.these}</p>
            <div style={{ marginTop: 'auto', paddingTop: 10, fontSize: 9.5, letterSpacing: '0.06em', opacity: 0.5 }}>{s.quelle}</div>
          </div>
        </div>
      </div>
    )
  }

  if (variante === 'split') {
    return (
      <div className="flip-wrap" onClick={s.toggle}>
        <div className={`flip-inner${s.offen ? ' flipped' : ''}`} style={{ minHeight: 106 }}>
          <div className="flip-face card blueprint" style={{ gridArea: '1/1', minHeight: 106, padding: '13px 15px', gap: 0, flexDirection: 'row', alignItems: 'center' }}>
            <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 21 }}>{s.ticker}</span>
                <span style={{ fontSize: 12.5, opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              </div>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.45, marginTop: 2 }}>{s.sektor}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 7 }}>
                <span className={`tag ${s.risikoKlasse}`} style={{ fontSize: 10, padding: '2px 8px' }}>{s.risiko}</span>
                <span style={{ fontSize: 11, opacity: 0.55 }}>KGV {s.kgvTxt}</span>
                <span style={{ fontSize: 11, opacity: 0.55 }}>{s.mcap}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, paddingLeft: 12 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, lineHeight: 1 }}>{s.kursTxt}</div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: s.wocheFarbe }}>{s.wocheTxt}</div>
              <SparkLine vals={s.spark} color={s.wocheFarbe} width={86} height={20} />
            </div>
          </div>
          <div className="flip-back card blueprint" style={{
            gridArea: '1/1', padding: '13px 15px', gap: 5,
            background: 'var(--panel-bg)', color: 'var(--panel-fg)',
            borderColor: 'transparent', justifyContent: 'flex-start'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{s.ticker}</span>
              <span style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.6 }}>{s.seiteLabel}</span>
            </div>
            <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.45, opacity: 0.95 }}>{s.these}</p>
            <p style={{ margin: 0, fontSize: 10.5, lineHeight: 1.45, opacity: 0.65 }}>{s.detailKurz}</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Liste: compact card on mobile, table row on desktop ──
  return (
    <>
      {/* Mobile card (shown only on small screens via inline style toggle) */}
      <tr
        onClick={s.toggle}
        style={{ cursor: 'pointer', background: s.offen ? 'color-mix(in srgb, var(--color-text) 4%, transparent)' : undefined }}
      >
        <td style={{ padding: '10px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 17 }}>{s.ticker}</span>
            <span style={{ fontSize: 12.5, opacity: 0.6 }}>{s.name}</span>
          </div>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.45, marginTop: 2 }}>{s.sektor}</div>
        </td>
        <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'var(--font-heading)', fontSize: 17, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {s.kursTxt}
          {s.istLive && <span className="live-dot" style={{ fontSize: 8, color: 'var(--color-accent)', marginLeft: 4 }}>●</span>}
        </td>
        <td className="table-mobile-hide" style={{ padding: '10px 8px', textAlign: 'right', color: s.wocheFarbe, fontVariantNumeric: 'tabular-nums' }}>{s.wocheTxt}</td>
        <td className="table-mobile-hide" style={{ padding: '10px 8px', textAlign: 'right', opacity: 0.7 }}>{s.kgvTxt}</td>
        <td className="table-mobile-hide" style={{ padding: '10px 8px' }}>
          <SparkLine vals={s.spark} color={s.wocheFarbe} width={80} height={18} />
        </td>
        <td className="table-mobile-hide" style={{ padding: '10px 8px' }}>
          <span className={`tag ${s.risikoKlasse}`}>{s.risiko}</span>
        </td>
        <td style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--color-accent)', fontSize: 11 }}>{s.offen ? '▲' : '▼'}</td>
      </tr>
      {s.offen && (
        <tr>
          <td colSpan={7} style={{ padding: 0 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16,
              padding: '16px 16px 20px',
              background: 'var(--panel-bg)', color: 'var(--panel-fg)'
            }}>
              <div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.55, marginBottom: 5 }}>Kurzbegründung</div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>{s.these}</p>
                {s.detail && <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: 1.5, opacity: 0.75 }}>{s.detail}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', alignContent: 'start' }}>
                <div><div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.55, marginBottom: 3 }}>KGV</div><div style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>{s.kgvTxt}</div></div>
                <div><div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.55, marginBottom: 3 }}>Marktkap.</div><div style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>{s.mcap}</div></div>
                <div><div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.55, marginBottom: 3 }}>Woche</div><div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: s.wocheFarbe }}>{s.wocheTxt}</div></div>
                <div><div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.55, marginBottom: 3 }}>ISIN</div><div style={{ fontSize: 12 }}>{s.isin || '—'}</div></div>
                <div style={{ gridColumn: '1/-1' }}>
                  <div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: 3 }}>Kursquelle</div>
                  <div style={{ fontSize: 11.5, opacity: 0.6 }}>{s.quelle}</div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main public view ──
export default function PublicView(props) {
  const {
    data, schema, ansicht, meldung, live, stand, laden,
    importOffen, importText, importErgebnis,
    setModus, setSchema, setAnsicht,
    setImportOffen, setImportText, setImportErgebnis,
    importUebernehmen, aktualisieren,
    buildAktie, BUY, SELL, UP, DOWN
  } = props

  const d = data
  const maxAbs = Math.max(...d.sektoren.map(k => Math.abs(zahl(k.woche)))) || 1

  const gruppen = [
    { label: 'Kaufen', langLabel: 'Kaufen', unter: `${d.buys.length} Positionen · Aufbauen oder aufstocken`, farbe: BUY, splitPad: '0 30px 0 0', rows: d.buys.map(s => buildAktie(s, 'buy')) },
    { label: 'Verkaufen', langLabel: 'Verkaufen', unter: `${d.sells.length} Positionen · Reduzieren oder auflösen`, farbe: SELL, splitPad: '0 0 0 30px', rows: d.sells.map(s => buildAktie(s, 'sell')) }
  ]

  const sektoren = d.sektoren.map(k => {
    const w = zahl(k.woche)
    const pct = (Math.abs(w) / maxAbs) * 48
    return { name: k.name, txt: (w > 0 ? '+' : '') + w.toFixed(1).replace('.', ',') + ' %', farbe: w >= 0 ? UP : DOWN, left: w >= 0 ? '50%' : (50 - pct) + '%', width: pct + '%' }
  })

  const liveTicker  = [...d.buys, ...d.sells].filter(s => s.fhWaehrung === 'USD').map(s => s.ticker).join(', ')
  const stummTicker = [...d.buys, ...d.sells].filter(s => s.fhWaehrung !== 'USD').map(s => s.ticker).join(', ')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* ── Sticky header ── */}
      <header className="no-print" style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--kopf-bg)' }}>
        <div className="pub-header-inner">
          {/* Brand */}
          <div className="pub-header-brand" style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 'auto' }}>
            <Logo size={40} />
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, lineHeight: 1.05 }}>
                Relanas Aktien-Weekly
              </div>
              <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                #{d.ausgabe.nummer} · {d.ausgabe.kalenderwoche}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pub-header-actions">
            {/* View selector */}
            <div className="seg no-print">
              {[
                { id: 'liste',  label: 'Liste' },
                { id: 'karten', label: 'Karten' },
                { id: 'split',  label: 'Split' },
              ].map(v => (
                <button key={v.id} className={`seg-opt${ansicht === v.id ? ' active' : ''}`} onClick={() => setAnsicht(v.id)}>
                  {v.label}
                </button>
              ))}
            </div>

            <button className="btn btn-secondary no-print btn-hide-xs" onClick={() => setSchema(s => s === 'nacht' ? 'tageslicht' : 'nacht')} style={{ fontSize: 12, padding: '5px 11px' }}>
              {schema === 'nacht' ? '☀' : '☾'}
            </button>

            <button className="btn btn-secondary no-print btn-hide-xs" onClick={() => { setImportOffen(true); props.setMeldung('') }} style={{ fontSize: 12, padding: '5px 11px' }}>
              Kurse
            </button>

            <button className="btn btn-secondary no-print" onClick={aktualisieren} disabled={laden} style={{ fontSize: 12, padding: '5px 11px' }}>
              {laden ? '…' : '↻'}
            </button>

            <button className="btn btn-ghost no-print" onClick={() => setModus('admin')} style={{ fontSize: 12 }}>
              Admin
            </button>
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--kopf-linie)' }} />
      </header>

      <main className="pub-main">

        {meldung && (
          <div style={{ padding: '10px 14px', margin: '16px 0 0', border: '1px solid var(--color-accent)', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', fontSize: 13 }}>
            {meldung}
          </div>
        )}

        {/* ── Editorial ── */}
        <section className="editorial-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 6 }}>
              Marktkommentar · {d.ausgabe.datum}
            </div>
            <div style={{ fontSize: 11, opacity: 0.45, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              RS: {d.ausgabe.redaktionsschluss}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.45 }}>{d.editorial.signatur}</div>
          </div>
          <div>
            <h1 style={{ lineHeight: 1.05, margin: '0 0 18px', maxWidth: '20ch' }}>{d.editorial.titel}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: '66ch' }}>
              {(d.editorial.absaetze || []).map((t, i) => (
                <p key={i} style={{ margin: 0, fontSize: 15, lineHeight: 1.62 }}>{t}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ── Thema ── */}
        <section className="thema-grid">
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 6 }}>{d.thema.kicker}</div>
            <h2 style={{ lineHeight: 1.08, margin: '0 0 14px', maxWidth: '22ch' }}>{d.thema.titel}</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, maxWidth: '62ch', margin: 0 }}>{d.thema.text}</p>
          </div>
          {d.thema.punkte?.length > 0 && (
            <div className="blueprint" style={{ padding: '18px 20px', alignSelf: 'start' }}>
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 12 }}>Kernpunkte</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {d.thema.punkte.map((t, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '0 10px', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--color-accent)' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Makro ── */}
        {d.makro?.length > 0 && (
          <section className="makro-row">
            {d.makro.map((m, i) => (
              <div key={i} className="blueprint" style={{ flex: '1 1 130px', minWidth: 110, padding: '12px 14px' }}>
                <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
                <div style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, lineHeight: 1 }}>{m.wert}</div>
                {m.delta && (
                  <div style={{ fontSize: 12, color: m.richtung === 'up' ? UP : m.richtung === 'down' ? DOWN : 'var(--sig-flat)', marginTop: 3 }}>
                    {m.richtung === 'up' ? '▲ ' : m.richtung === 'down' ? '▼ ' : '· '}{m.delta}
                  </div>
                )}
                {m.notiz && <div style={{ fontSize: 10.5, opacity: 0.5, marginTop: 3 }}>{m.notiz}</div>}
              </div>
            ))}
          </section>
        )}

        {/* ── Kursstand bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 0 0', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.55, flexWrap: 'wrap' }}>
          <span style={{ marginRight: 'auto' }}>
            {live.length > 0 && <span style={{ color: 'var(--color-accent)', opacity: 1 }} className="live-dot">● </span>}
            Kursstand: {stand ? stand + ' Uhr' : d.ausgabe.kursstand}
          </span>
          {live.length > 0 && <span>{live.length}/{d.buys.length + d.sells.length} live</span>}
        </div>

        {/* ── Positionen ── */}
        <section style={{ padding: '14px 0 0' }}>
          <h2 style={{ margin: '0 0 20px' }}>Empfehlungen</h2>

          {/* Liste */}
          {ansicht === 'liste' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {gruppen.map(g => (
                <div key={g.label}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid ${g.farbe}`, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22 }}>{g.langLabel}</span>
                    <span style={{ fontSize: 12, opacity: 0.55, marginLeft: 'auto' }}>{g.unter}</span>
                  </div>
                  <table className="table" style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th style={{ textAlign: 'right' }}>Kurs</th>
                        <th className="table-mobile-hide" style={{ textAlign: 'right' }}>Woche</th>
                        <th className="table-mobile-hide" style={{ textAlign: 'right', width: 60 }}>KGV</th>
                        <th className="table-mobile-hide" style={{ width: 96 }}>Chart</th>
                        <th className="table-mobile-hide" style={{ width: 80 }}>Risiko</th>
                        <th style={{ width: 32 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.rows.map(s => <AktieKarte key={s.key} s={s} variante="liste" />)}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Karten */}
          {ansicht === 'karten' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {gruppen.map(g => (
                <div key={g.label}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14, paddingBottom: 8, borderBottom: `2px solid ${g.farbe}`, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22 }}>{g.langLabel}</span>
                    <span style={{ fontSize: 12, opacity: 0.55, marginLeft: 'auto' }}>{g.unter}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                    {g.rows.map(s => <AktieKarte key={s.key} s={s} variante="karten" />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Split — stacks vertically on mobile */}
          {ansicht === 'split' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 0, overflowX: 'auto' }}>
              {gruppen.map(g => (
                <div key={g.label} style={{ padding: '0 0 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14, paddingBottom: 8, borderBottom: `2px solid ${g.farbe}`, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22 }}>{g.langLabel}</span>
                    <span style={{ fontSize: 12, opacity: 0.55, marginLeft: 'auto' }}>{g.unter}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {g.rows.map(s => <AktieKarte key={s.key} s={s} variante="split" />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Sektoren + Termine ── */}
        <section className="sektoren-termine-grid">
          <div>
            <h3 style={{ margin: '0 0 3px' }}>Sektoren dieser Woche</h3>
            <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 18 }}>Kursveränderung europäischer Sektorindizes, 5 Handelstage</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sektoren.map((k, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 58px', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: '1px solid color-mix(in srgb, var(--color-text) 7%, transparent)' }}>
                  <div style={{ fontSize: 12, letterSpacing: '0.03em' }}>{k.name}</div>
                  <div style={{ position: 'relative', height: 14 }}>
                    <div style={{ position: 'absolute', left: '50%', top: -4, bottom: -4, width: 1, background: 'var(--color-divider)' }} />
                    <div style={{ position: 'absolute', top: 1, height: 12, background: k.farbe, left: k.left, width: k.width }} />
                  </div>
                  <div style={{ fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: k.farbe }}>{k.txt}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ margin: '0 0 3px' }}>Termine der Woche</h3>
            <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 18 }}>Was den Kurs bewegen kann</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(d.termine || []).map((t, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr auto', alignItems: 'baseline', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--color-divider)' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14 }}>{t.tag}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.4 }}>{t.titel}</div>
                  <span className="tag tag-outline" style={{ fontSize: 10, padding: '2px 7px' }}>{t.typ}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Disclaimer ── */}
        <section style={{ padding: '0 0 48px' }}>
          <div className="blueprint" style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'minmax(120px,140px) 1fr', gap: '14px 20px', alignItems: 'start' }}>
            <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', paddingTop: 2 }}>Kursdaten</div>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.65, opacity: 0.68 }}>
              Realtime-Kurse von Finnhub, nur US-notierte Titel{liveTicker ? ` (${liveTicker})` : ''}.
              {stummTicker && ` Stichtagskurs für ${stummTicker}.`}
            </p>
            <div style={{ gridColumn: '1/-1', height: 1, background: 'var(--color-divider)' }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', paddingTop: 2 }}>Disclaimer</div>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.65, opacity: 0.68 }}>{d.disclaimer}</p>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid var(--color-divider)', background: 'var(--fuss-bg)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, letterSpacing: '0.07em', textTransform: 'uppercase', opacity: 0.5, flexWrap: 'wrap' }}>
          <span style={{ marginRight: 'auto' }}>Relanas Aktien-Weekly · #{d.ausgabe.nummer} · {d.ausgabe.kalenderwoche}</span>
          <span>Alle Kurse in Euro</span>
        </div>
      </footer>

      {/* ── Import dialog ── */}
      {importOffen && (
        <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', padding: 16, background: 'color-mix(in srgb, var(--color-neutral-900) 55%, transparent)', zIndex: 999 }}>
          <div className="blueprint" style={{ width: 'min(540px, 100%)', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--color-bg)' }}>
            <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22 }}>Kurse einfügen</div>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>Zeilen aus einer Kurstabelle einfügen. Jede Zeile, die Ticker, Name oder ISIN einer Position enthält, wird erkannt.</p>
            <textarea
              className="input"
              style={{ minHeight: 140, fontFamily: 'monospace', fontSize: 12 }}
              placeholder={"z.B.\nAAPL Apple Inc. 192,30 +1,2%\nSAP SE 182,00 -0,5%"}
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            {importErgebnis && <div style={{ fontSize: 12.5, color: 'var(--color-accent)' }}>{importErgebnis}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => { setImportOffen(false); setImportErgebnis('') }}>Abbrechen</button>
              <button className="btn btn-primary" onClick={importUebernehmen}>Übernehmen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
