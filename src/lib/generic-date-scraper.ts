import "server-only";

export interface FoundDate {
  date: Date;
  snippet: string;
}

const GERMAN_MONTHS: Record<string, number> = {
  Januar: 0, Februar: 1, "März": 2, Maerz: 2, April: 3, Mai: 4, Juni: 5,
  Juli: 6, August: 7, September: 8, Oktober: 9, November: 10, Dezember: 11,
  // Abkürzungen, wie sie auf vielen Seiten statt der vollen Monatsnamen stehen
  Jan: 0, Feb: 1, "Mär": 2, Mrz: 2, Apr: 3, Jun: 5, Jul: 6, Aug: 7,
  Sep: 8, Sept: 8, Okt: 9, Nov: 10, Dez: 11,
};

const ENGLISH_MONTHS: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Jun: 5, Jul: 6, Aug: 7,
  Sep: 8, Sept: 8, Oct: 9, Nov: 10, Dec: 11,
};

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function snippetAround(text: string, index: number, matchLength: number): string {
  const start = Math.max(0, index - 60);
  const end = Math.min(text.length, index + matchLength + 60);
  const snippet = text.slice(start, end).trim();
  return (start > 0 ? "…" : "") + snippet + (end < text.length ? "…" : "");
}

/**
 * Sucht heuristisch nach Datumsangaben in beliebigem Seitentext (Deutsch/
 * Englisch, verschiedene Formate) und liefert sie mit umgebendem Textkontext
 * als Snippet zurück. Bewusst grob - Ergebnisse landen immer als Entwurf zur
 * manuellen Prüfung, nie automatisch veröffentlicht.
 */
export function findDatesInHtml(html: string): FoundDate[] {
  const text = stripHtml(html);
  const found: FoundDate[] = [];

  const germanMonthPattern = Object.keys(GERMAN_MONTHS).join("|");
  const englishMonthPattern = Object.keys(ENGLISH_MONTHS).join("|");

  const patterns: Array<{ regex: RegExp; toDate: (m: RegExpExecArray) => Date | null }> = [
    {
      // "15. September 2026"
      regex: new RegExp(`(\\d{1,2})\\.\\s*(${germanMonthPattern})\\s+(\\d{4})`, "g"),
      toDate: (m) => {
        const month = GERMAN_MONTHS[m[2]];
        return new Date(Date.UTC(Number(m[3]), month, Number(m[1])));
      },
    },
    {
      // "15 September 2026"
      regex: new RegExp(`(\\d{1,2})\\s+(${englishMonthPattern})\\s+(\\d{4})`, "g"),
      toDate: (m) => {
        const month = ENGLISH_MONTHS[m[2]];
        return new Date(Date.UTC(Number(m[3]), month, Number(m[1])));
      },
    },
    {
      // "September 15, 2026" or "September 15 2026"
      regex: new RegExp(`(${englishMonthPattern})\\s+(\\d{1,2}),?\\s+(\\d{4})`, "g"),
      toDate: (m) => {
        const month = ENGLISH_MONTHS[m[1]];
        return new Date(Date.UTC(Number(m[3]), month, Number(m[2])));
      },
    },
    {
      // ISO "2026-09-15"
      regex: /(\d{4})-(\d{2})-(\d{2})/g,
      toDate: (m) => new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))),
    },
    {
      // Numerisch "15.09.2026"
      regex: /(\d{1,2})\.(\d{1,2})\.(\d{4})/g,
      toDate: (m) => new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]))),
    },
  ];

  for (const { regex, toDate } of patterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text))) {
      const date = toDate(match);
      if (!date || Number.isNaN(date.getTime())) continue;
      found.push({ date, snippet: snippetAround(text, match.index, match[0].length) });
    }
  }

  return found;
}
