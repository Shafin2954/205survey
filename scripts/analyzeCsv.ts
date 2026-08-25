// Batch-analyzes a Tally CSV export through the same scoring engine the live
// site uses, so archetype distribution can be sanity-checked offline.
//
// Usage: npx tsx scripts/analyzeCsv.ts ["path/to/export.csv"]
// Defaults to the CSV committed at the project root.

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { mapCsvRows } from '../lib/mapTally';
import { computeSurveyResult } from '../lib/scoring';

function findDefaultCsv(): string {
  const root = join(__dirname, '..');
  const match = readdirSync(root).find((f) => f.toLowerCase().endsWith('.csv'));
  if (!match) {
    throw new Error('No CSV file found in project root. Pass a path explicitly.');
  }
  return join(root, match);
}

function main() {
  const path = process.argv[2] ? join(process.cwd(), process.argv[2]) : findDefaultCsv();
  console.log(`Reading: ${path}\n`);

  const csvText = readFileSync(path, 'utf-8');
  const rows = mapCsvRows(csvText);
  console.log(`Parsed ${rows.length} submission(s).\n`);

  const distribution: Record<string, number> = {};
  const flagged: Array<{ index: number; archetypeId: string; reason: string }> = [];

  rows.forEach((answers, i) => {
    const result = computeSurveyResult(answers);
    distribution[result.archetype.id] = (distribution[result.archetype.id] ?? 0) + 1;

    if (result.isEnigma || result.isUntouchable) {
      flagged.push({ index: i, archetypeId: result.archetype.id, reason: result.matchedReason });
    }
  });

  console.log('--- Archetype distribution ---');
  Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([id, count]) => {
      console.log(`${id.padEnd(24)} ${count}`);
    });

  if (flagged.length > 0) {
    console.log('\n--- Flagged rows (enigma / untouchable) ---');
    flagged.forEach((f) => console.log(`row ${f.index}: ${f.archetypeId} — ${f.reason}`));
  }
}

main();
