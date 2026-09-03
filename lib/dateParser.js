const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const MONTH_ABBR = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/**
 * Parses free text like "thursday, september 3rd" or "sep 3, 2027".
 * Weekday names are ignored — only used for readability by the person typing.
 * Returns a Date, or null if nothing usable was found.
 */
export function parseNaturalDate(rawInput, referenceDate = new Date()) {
  if (!rawInput || typeof rawInput !== "string") return null;

  const input = rawInput.trim().toLowerCase();
  const monthPattern = [...MONTH_NAMES, ...MONTH_ABBR].join("|");

  const regex = new RegExp(
    `\\b(${monthPattern})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?:,?\\s*(\\d{4}))?`,
    "i"
  );

  const match = input.match(regex);
  if (!match) return null;

  const [, monthToken, dayToken, yearToken] = match;

  let monthIndex = MONTH_NAMES.indexOf(monthToken);
  if (monthIndex === -1) monthIndex = MONTH_ABBR.indexOf(monthToken);
  if (monthIndex === -1) return null;

  const day = parseInt(dayToken, 10);
  if (day < 1 || day > 31) return null;

  let year = yearToken ? parseInt(yearToken, 10) : referenceDate.getFullYear();
  let candidate = new Date(year, monthIndex, day);

  // No year given and the date's already passed this year? Assume next year.
  if (!yearToken) {
    const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    if (candidate < today) {
      year += 1;
      candidate = new Date(year, monthIndex, day);
    }
  }

  // Rejects invalid dates like "february 30" instead of silently rolling over.
  if (candidate.getMonth() !== monthIndex || candidate.getDate() !== day) return null;

  return candidate;
}

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatFriendly(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
