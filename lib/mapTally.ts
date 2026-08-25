import { SurveyAnswers } from './types';

// ---------------------------------------------------------------------------
// Shared knowledge about the questionnaire, sourced from lib/types.ts and
// v3_questionnaire_reference.md. Keep in sync with SurveyAnswers.
// ---------------------------------------------------------------------------

/** q-keys whose SurveyAnswers type is string[] (multi-select checkboxes). */
const MULTI_SELECT_KEYS = new Set([
  'q33', 'q38', 'q40', 'q56', 'q58', 'q70',
]);

/** q-keys whose SurveyAnswers type is LikertValue | number (1..5 scale). */
const LIKERT_KEYS = new Set([
  'q27',
  'q45', 'q46', 'q47', 'q48', 'q49', 'q50', 'q51', 'q52', 'q53', 'q54',
  'q59', 'q60', 'q61', 'q62', 'q63', 'q64',
  'q74', 'q75',
]);

const LIKERT_LABELS: Record<string, number> = {
  'strongly disagree': 1,
  'disagree': 2,
  'neutral': 3,
  'agree': 4,
  'strongly agree': 5,
};

/** Extracts the q-number from a Tally field/column title. Returns null for
 * non-question columns (consent question, Tally metadata). */
function titleToKey(title: string): string | null {
  const m = title.trim().match(/^Q(\d+)\b/i);
  if (!m) return null;
  return `q${m[1]}`;
}

function coerceLikert(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (/^[1-5]$/.test(trimmed)) return Number(trimmed);
  const byLabel = LIKERT_LABELS[trimmed.toLowerCase()];
  if (byLabel) return byLabel;
  return undefined;
}

function assignScalar(answers: Record<string, unknown>, key: string, raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return;
  if (LIKERT_KEYS.has(key)) {
    const v = coerceLikert(trimmed);
    if (v !== undefined) answers[key] = v;
    return;
  }
  answers[key] = trimmed;
}

function pushMultiSelect(answers: Record<string, unknown>, key: string, label: string) {
  const trimmed = label.trim();
  if (!trimmed) return;
  const existing = answers[key] as string[] | undefined;
  if (existing) {
    existing.push(trimmed);
  } else {
    answers[key] = [trimmed];
  }
}

// ---------------------------------------------------------------------------
// Live path: Tally.FormSubmitted postMessage payload
// ---------------------------------------------------------------------------

export interface MapTallyResult {
  answers: SurveyAnswers;
  /** Fields we could not confidently map, kept for the /result?debug=1 view. */
  unmapped: Array<{ title: string; raw: unknown }>;
}

interface TallyFieldLike {
  title?: string;
  label?: string;
  key?: string;
  type?: string;
  options?: Array<{ id?: string; text?: string; label?: string; value?: string }>;
  answer?: { value?: unknown; raw?: unknown; options?: TallyFieldLike['options'] };
  value?: unknown;
}

/** Resolves a possibly option-id value against a field's options list, falling
 * back to the raw value itself when no match is found (it may already be the
 * human-readable label). */
function resolveOptionText(item: unknown, options: TallyFieldLike['options']): string {
  const str = String(item);
  if (!options || options.length === 0) return str;
  const match = options.find(
    (o) => o.id === str || o.value === str
  );
  if (match) return match.text || match.label || str;
  return str;
}

export function mapTallyPayload(payload: unknown): MapTallyResult {
  const answers: Record<string, unknown> = {};
  const unmapped: Array<{ title: string; raw: unknown }> = [];

  // The postMessage payload can arrive in a few shapes depending on Tally's
  // version / embed vs. webhook style. Try each in order:
  //   { event, payload: { fields } }  — widget postMessage (documented shape)
  //   { fields }                      — payload already unwrapped
  //   { data: { fields } }            — webhook-style
  const candidates = [
    (payload as any)?.payload?.fields,
    (payload as any)?.fields,
    (payload as any)?.data?.fields,
  ];
  const fields: TallyFieldLike[] = candidates.find((f) => Array.isArray(f)) ?? [];

  for (const field of fields) {
    const title = field.title ?? field.label ?? '';
    const key = titleToKey(title);
    if (!key) continue; // consent question / not a Q-numbered field

    const options = field.options ?? field.answer?.options;
    const rawValue = field.answer?.value ?? field.answer?.raw ?? field.value;

    if (rawValue === undefined || rawValue === null || rawValue === '') continue;

    if (MULTI_SELECT_KEYS.has(key)) {
      let items: unknown[];
      if (Array.isArray(rawValue)) {
        items = rawValue;
      } else if (typeof rawValue === 'string' && rawValue.includes(',')) {
        items = rawValue.split(',');
      } else {
        items = [rawValue];
      }
      for (const item of items) {
        pushMultiSelect(answers, key, resolveOptionText(item, options));
      }
      continue;
    }

    if (typeof rawValue === 'string') {
      assignScalar(answers, key, rawValue);
    } else if (typeof rawValue === 'number') {
      answers[key] = rawValue;
    } else if (Array.isArray(rawValue) && rawValue.length === 1) {
      // Single-select fields sometimes arrive as a one-element array of option id/text.
      assignScalar(answers, key, resolveOptionText(rawValue[0], options));
    } else {
      unmapped.push({ title, raw: rawValue });
    }
  }

  return { answers: answers as SurveyAnswers, unmapped };
}

// ---------------------------------------------------------------------------
// Batch path: Tally CSV export
// ---------------------------------------------------------------------------

/** RFC4180-ish CSV parser: handles quoted fields, escaped "" quotes, and
 * embedded newlines/commas inside quoted fields (needed for Q77/Q78 free text). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }

  // Last field/row (file may or may not end with a trailing newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

interface CsvColumnInfo {
  qKey: string;
  /** For multi-select boolean columns: the option label extracted from the header. */
  optionLabel: string | null;
}

function classifyHeader(header: string): CsvColumnInfo | null {
  const qKey = titleToKey(header);
  if (!qKey) return null;

  if (MULTI_SELECT_KEYS.has(qKey)) {
    const firstParen = header.indexOf('(');
    const lastParen = header.lastIndexOf(')');
    if (firstParen !== -1 && lastParen > firstParen) {
      return { qKey, optionLabel: header.slice(firstParen + 1, lastParen).trim() };
    }
    // Combined/summary column (no trailing "(option)") — handled separately.
    return { qKey, optionLabel: null };
  }

  return { qKey, optionLabel: null };
}

export function mapCsvRows(csvText: string): SurveyAnswers[] {
  // Strip UTF-8 BOM if present.
  const clean = csvText.charCodeAt(0) === 0xfeff ? csvText.slice(1) : csvText;
  const rows = parseCsv(clean);
  if (rows.length === 0) return [];

  const header = rows[0];
  const columns = header.map(classifyHeader);

  const result: SurveyAnswers[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.every((c) => c.trim() === '')) continue;

    const answers: Record<string, unknown> = {};

    for (let c = 0; c < columns.length; c++) {
      const info = columns[c];
      if (!info) continue;
      const raw = row[c] ?? '';

      if (MULTI_SELECT_KEYS.has(info.qKey)) {
        if (info.optionLabel === null) continue; // skip combined/summary column
        const normalized = raw.trim().toLowerCase();
        if (normalized === 'true') {
          pushMultiSelect(answers, info.qKey, info.optionLabel);
        }
        // "false" (or blank) => option not selected, nothing to do.
        continue;
      }

      assignScalar(answers, info.qKey, raw);
    }

    result.push(answers as SurveyAnswers);
  }

  return result;
}
