#!/usr/bin/env python3
"""
Relana Weekly – Automatische Content-Generierung
Wird jeden Montag via GitHub Actions ausgeführt.
"""

import json
import os
import requests
import yfinance as yf
from datetime import datetime, timedelta
import anthropic

# ──────────────────────────────────────────────────────
# Hilfsfunktionen
# ──────────────────────────────────────────────────────

MONATE_DE = {
    1: "Januar", 2: "Februar", 3: "März", 4: "April",
    5: "Mai", 6: "Juni", 7: "Juli", 8: "August",
    9: "September", 10: "Oktober", 11: "November", 12: "Dezember"
}

def iso_kw(date: datetime) -> int:
    return date.isocalendar()[1]

def fmt_de(value: float, dezimalstellen: int = 2) -> str:
    """Zahl im deutschen Format: 26.137 statt 26,137"""
    s = f"{value:,.{dezimalstellen}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")

def richtung(delta_pct: float) -> str:
    if delta_pct > 0.1:
        return "up"
    elif delta_pct < -0.1:
        return "down"
    return "flat"

def datum_de(date: datetime) -> str:
    """Gibt z.B. '24. August 2026' zurück"""
    return f"{date.day}. {MONATE_DE[date.month]} {date.year}"

def wochentag_de(date: datetime) -> str:
    tage = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    return tage[date.weekday()]

# ──────────────────────────────────────────────────────
# Marktdaten holen
# ──────────────────────────────────────────────────────

def hole_makro() -> list[dict]:
    """Holt aktuelle Marktdaten via yfinance und frankfurter.dev."""
    ergebnisse = []

    symbole = [
        ("^GDAXI",    "DAX",          "5 Handelstage", "punkte"),
        ("^STOXX50E", "Euro Stoxx 50", "5 Handelstage", "punkte"),
        ("BZ=F",      "Öl (Brent)",   "$/Barrel",       "preis"),
    ]

    for symbol, label, notiz, fmt in symbole:
        try:
            hist = yf.Ticker(symbol).history(period="7d")
            if len(hist) < 2:
                print(f"   ⚠ Zu wenig Daten für {label}")
                continue
            aktuell  = hist["Close"].iloc[-1]
            vorwoche = hist["Close"].iloc[0]
            delta    = (aktuell - vorwoche) / vorwoche * 100

            wert_str = fmt_de(aktuell, 0) if fmt == "punkte" else f"{aktuell:.2f} $"
            sign     = "+" if delta >= 0 else ""
            delta_str = f"{sign}{fmt_de(delta, 1)} %"

            ergebnisse.append({
                "label":    label,
                "wert":     wert_str,
                "delta":    delta_str,
                "richtung": richtung(delta),
                "notiz":    notiz
            })
            print(f"   ✓ {label}: {wert_str} ({delta_str})")
        except Exception as e:
            print(f"   ⚠ {label} nicht geladen: {e}")

    # EUR/USD via frankfurter.dev
    try:
        heute = datetime.now().strftime("%Y-%m-%d")
        letzte_woche = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        r_heute     = requests.get(f"https://api.frankfurter.dev/{heute}?from=USD&to=EUR",         timeout=10)
        r_vorwoche  = requests.get(f"https://api.frankfurter.dev/{letzte_woche}?from=USD&to=EUR",  timeout=10)
        if r_heute.ok and r_vorwoche.ok:
            rate     = r_heute.json()["rates"]["EUR"]
            rate_vw  = r_vorwoche.json()["rates"]["EUR"]
            delta    = (rate - rate_vw) / rate_vw * 100
            sign     = "+" if delta >= 0 else ""
            ergebnisse.insert(2, {
                "label":    "EUR/USD",
                "wert":     fmt_de(rate, 4),
                "delta":    f"{sign}{fmt_de(delta, 1)} %",
                "richtung": richtung(delta),
                "notiz":    "Wochenbasis"
            })
            print(f"   ✓ EUR/USD: {fmt_de(rate, 4)}")
    except Exception as e:
        print(f"   ⚠ EUR/USD nicht geladen: {e}")

    return ergebnisse


def hole_news() -> list[str]:
    """Holt aktuelle Marktmeldungen von Finnhub (optional)."""
    key = os.environ.get("FINNHUB_API_KEY", "")
    if not key:
        return []
    try:
        r = requests.get(
            "https://finnhub.io/api/v1/news",
            params={"category": "general", "token": key},
            timeout=10
        )
        if r.ok:
            schlagzeilen = [item["headline"] for item in r.json()[:15]]
            print(f"   ✓ {len(schlagzeilen)} Meldungen geladen")
            return schlagzeilen
    except Exception as e:
        print(f"   ⚠ Finnhub-News nicht geladen: {e}")
    return []

# ──────────────────────────────────────────────────────
# Claude: Content generieren
# ──────────────────────────────────────────────────────

SEKTOREN_NAMEN = [
    "Technologie", "Halbleiter", "Gesundheit", "Finanzen", "Energie",
    "Konsumgüter", "Industrie", "Telekommunikation", "Grundstoffe", "Immobilien"
]

def generiere_content(makro: list, news: list, datum: datetime) -> dict:
    """Ruft Claude auf, um Editorial, Thema, Sektoren und Termine zu generieren."""
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    kw     = iso_kw(datum)
    montag = datum - timedelta(days=datum.weekday())

    # Terminzeilen für die Woche vorbereiten
    termine_vorlage = "\n".join(
        f'  {{"tag": "{wochentag_de(montag + timedelta(i))}, {(montag + timedelta(i)).day}.{(montag + timedelta(i)).month}.", '
        f'"titel": "HIER EREIGNIS EINTRAGEN", "typ": "Makro"}}'
        for i in range(5)
    )

    makro_text = "\n".join(f"- {m['label']}: {m['wert']} ({m['delta']})" for m in makro)
    news_text  = "\n".join(f"- {h}" for h in news) if news else "- Keine Finnhub-Meldungen verfügbar"

    sektoren_vorlage = ",\n    ".join(
        f'{{"name": "{n}", "woche": 0.0}}' for n in SEKTOREN_NAMEN
    )

    prompt = f"""Du bist Chefredakteur des deutschen Börsenbriefs "relana weekly", Ausgabe KW {kw}/{datum.year}.

AKTUELLE MARKTDATEN (diese Woche):
{makro_text}

AKTUELLE MARKTNACHRICHTEN:
{news_text}

WOCHE: {datum_de(montag)} bis {datum_de(montag + timedelta(4))}

Erstelle den vollständigen wöchentlichen Inhalt. Antworte NUR mit validem JSON, kein Text davor oder danach:

{{
  "editorial": {{
    "titel": "Max. 8 Wörter, prägnanter Titel",
    "absaetze": [
      "Absatz 1: Rückblick auf die vergangene Woche, wichtigstes Ereignis, Marktreaktion (4-5 Sätze)",
      "Absatz 2: Ausblick auf diese Woche – was steht an, wo sind die wichtigen Entscheidungen (3-4 Sätze)",
      "Absatz 3: Kurzes Fazit oder Einschätzung (1-2 Sätze)"
    ]
  }},
  "thema": {{
    "kicker": "SCHWERPUNKT",
    "titel": "Titel des Hauptthemas dieser Woche (max. 10 Wörter)",
    "text": "Einleitungstext: Warum ist dieses Thema gerade relevant? (2-3 Sätze)",
    "punkte": [
      "Kernpunkt 1 mit konkreten Zahlen oder Fakten (1-2 Sätze)",
      "Kernpunkt 2 mit Einschätzung (1-2 Sätze)",
      "Kernpunkt 3 mit Ausblick (1-2 Sätze)"
    ]
  }},
  "sektoren": [
    {sektoren_vorlage}
  ],
  "termine": [
{termine_vorlage}
  ]
}}

REGELN:
- Schreibe auf professionellem Deutsch wie ein erfahrener Finanzredakteur
- editorial.absaetze: Array mit 2-3 Strings, jeder Absatz ist ein langer Satz-Block
- sektoren.woche: Dezimalzahl OHNE %-Zeichen, z.B. 1.2 oder -0.8 (basierend auf den Nachrichten schätzen)
- termine.typ: nur einer von "Makro", "Zahlen", "Zinsen", "Geopolitik"
- Nenne bei Terminen echte, typische Ereignisse für diese Wochentage (Earnings, EZB, Fed, PMI, etc.)
"""

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=3000,
        messages=[{"role": "user", "content": prompt}]
    )

    antwort = message.content[0].text.strip()

    # Markdown-Codeblöcke entfernen falls Claude sie hinzufügt
    if "```json" in antwort:
        antwort = antwort.split("```json")[1].split("```")[0].strip()
    elif antwort.startswith("```"):
        antwort = antwort.split("```")[1].split("```")[0].strip()

    return json.loads(antwort)

# ──────────────────────────────────────────────────────
# Hauptprogramm
# ──────────────────────────────────────────────────────

def main():
    jetzt  = datetime.now()
    kw     = iso_kw(jetzt)
    montag = jetzt - timedelta(days=jetzt.weekday())
    freitag = montag + timedelta(days=4)

    print("=" * 50)
    print("Relana Weekly – Automatisches Update")
    print(f"KW {kw}/{jetzt.year}: {montag.strftime('%d.%m.')} – {freitag.strftime('%d.%m.%Y')}")
    print("=" * 50)

    # Aktuelle data.json laden
    pfad = "public/data.json"
    with open(pfad, "r", encoding="utf-8") as f:
        daten = json.load(f)

    # 1. Marktdaten holen
    print("\n1. Marktdaten werden geladen ...")
    makro = hole_makro()
    if makro:
        daten["makro"] = makro
    else:
        print("   Verwende Bestandsdaten aus data.json")
        makro = daten.get("makro", [])

    # 2. News holen
    print("\n2. Nachrichten werden geladen ...")
    news = hole_news()
    if not news:
        print("   ℹ Kein FINNHUB_API_KEY gesetzt – Claude arbeitet ohne News-Feed")

    # 3. Content mit Claude generieren
    print("\n3. Content wird mit Claude generiert ...")
    generiert = generiere_content(makro, news, jetzt)

    daten["editorial"] = {
        **generiert["editorial"],
        "signatur": daten["editorial"].get("signatur", "— Relana")  # Signatur beibehalten
    }
    daten["thema"]    = generiert["thema"]
    daten["sektoren"] = generiert["sektoren"]
    daten["termine"]  = generiert["termine"]
    print("   ✓ Editorial, Thema, Sektoren und Termine generiert")

    # 4. Ausgabe-Metadaten aktualisieren
    daten["ausgabe"]["nummer"]           += 1
    daten["ausgabe"]["kalenderwoche"]     = f"KW {kw} / {jetzt.year}"
    daten["ausgabe"]["datum"]             = f"{montag.strftime('%d.%m.')} – {freitag.strftime('%d.%m.%Y')}"
    daten["ausgabe"]["redaktionsschluss"] = f"Montag, {datum_de(montag)}, {jetzt.strftime('%H:%M')} MESZ"
    daten["ausgabe"]["kursstand"]         = jetzt.strftime("%d.%m.%Y, %H:%M Uhr")

    # 5. Datei speichern
    with open(pfad, "w", encoding="utf-8") as f:
        json.dump(daten, f, ensure_ascii=False, indent=2)

    print(f"\n✓ {pfad} erfolgreich aktualisiert!")
    print(f"  Ausgabe #{daten['ausgabe']['nummer']}, {daten['ausgabe']['kalenderwoche']}")

if __name__ == "__main__":
    main()
