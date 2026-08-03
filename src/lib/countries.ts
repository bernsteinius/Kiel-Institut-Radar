// Bekannte Orte, die in den Quellen dieser App als reine Stadt (ohne
// Land-Suffix) auftauchen - Land direkt nachschlagbar statt geraten.
const LOCATION_COUNTRY_MAP: Record<string, string> = {
  "Frankfurt am Main": "Deutschland",
  Kiel: "Deutschland",
  "Kiel Institut für Weltwirtschaft": "Deutschland",
  München: "Deutschland",
  Berlin: "Deutschland",
  "Washington, D.C.": "USA",
  Shanghai: "China",
};

// Für Orte im Format "Stadt, Land" (z.B. von NATO, IWF/Weltbank, G7/G20,
// manuell gepflegten Quellen) reicht es, das letzte Komma-Segment gegen
// bekannte Ländernamen zu prüfen - so funktioniert es auch für Kombinationen,
// die nicht einzeln in LOCATION_COUNTRY_MAP stehen.
const KNOWN_COUNTRY_NAMES = new Set([
  "Deutschland", "Germany",
  "USA", "United States", "United States of America",
  "Schweiz", "Switzerland",
  "Belgien", "Belgium",
  "Thailand",
  "Frankreich", "France",
  "Vereinigtes Königreich", "United Kingdom", "UK",
  "Italien", "Italy",
  "Polen", "Poland",
  "Niederlande", "Netherlands",
  "Österreich", "Austria",
  "Spanien", "Spain",
  "China",
  "Japan",
  "Kanada", "Canada",
  "Türkei", "Turkey", "Türkiye",
  "Kasachstan", "Kazakhstan",
  "Kirgisistan", "Kyrgyzstan",
]);

/**
 * Land für einen Termin ermitteln: direkt von der Quelle übernehmen, wenn
 * vorhanden (explicitCountry, z.B. von der NATO-API), sonst aus dem Ort
 * herleiten - erst per Lookup bekannter Einzelstädte, dann per
 * Komma-Suffix-Heuristik ("Stadt, Land").
 */
export function resolveCountry(
  location: string | null | undefined,
  explicitCountry?: string | null
): string | undefined {
  if (explicitCountry) return explicitCountry;
  if (!location) return undefined;

  if (LOCATION_COUNTRY_MAP[location]) {
    return LOCATION_COUNTRY_MAP[location];
  }

  const lastCommaIdx = location.lastIndexOf(",");
  if (lastCommaIdx !== -1) {
    const candidate = location.slice(lastCommaIdx + 1).trim();
    if (KNOWN_COUNTRY_NAMES.has(candidate)) {
      return candidate;
    }
  }

  return undefined;
}
