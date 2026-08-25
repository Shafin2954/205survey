import { mapCsvRows, mapTallyPayload } from './mapTally';

function runTests() {
  console.log('--- TALLY MAPPER TESTS ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${detail || ''}`);
      failed++;
    }
  }

  // ===== CSV PATH =====

  // A small CSV mimicking the real Tally export shape:
  //  - metadata columns first
  //  - a multi-select (Q33) with its boolean option columns immediately after
  //  - a Likert column (Q45)
  //  - a multi-select (Q56) — the one test_csv.ts used to drop
  //  - a free-text column (Q77) containing a quoted comma AND an embedded newline
  //  - a Q38-style multi-select whose boolean columns are pushed to the END,
  //    preceded by a duplicate "(2)" combined column, matching the real export
  const header = [
    '"Submission ID"', '"Respondent ID"', '"Submitted at"', '"Do you agree to participate?"',
    '"Q1. Test question?"',
    '"Q33. Where does your money come from?"',
    '"Q33. Where does your money come from? (Allowance from parents/family)"',
    '"Q33. Where does your money come from? (Part-time job)"',
    '"Q45. I set a budget for my monthly expenses."',
    '"Q56. When money runs short before the month ends, what do you usually do?"',
    '"Q56. When money runs short before the month ends, what do you usually do? (Ask family for extra)"',
    '"Q56. When money runs short before the month ends, what do you usually do? (Use savings)"',
    '"Q77. What was the last thing you bought online?"',
    '"Q38. spending categories?"',
    '"Q38. spending categories? (2)"',
    '"Q38. spending categories? (Food and groceries)"',
    '"Q38. spending categories? (Rent)"',
  ].join(',');

  const quotedFreeText = '"He said ""hi"", then bought food, groceries\nand more."';

  const row = [
    '"S1"', '"R1"', '"2026-01-01"', '"I agree"',
    '"Yes"',
    '"Allowance from parents/family, Part-time job"', '"true"', '"true"',
    '"4"',
    '"Use savings"', '"false"', '"true"',
    quotedFreeText,
    '"Food and groceries, Rent"', '"Food and groceries, Rent"', '"true"', '"true"',
  ].join(',');

  const csv = '﻿' + header + '\n' + row + '\n';
  const parsed = mapCsvRows(csv);

  assert(parsed.length === 1, 'CSV: parses exactly one data row', `Got ${parsed.length}`);
  const a = parsed[0];

  assert(a.q1 === 'Yes', 'CSV: BOM stripped, single-select column mapped', `q1=${JSON.stringify(a.q1)}`);
  assert(
    Array.isArray(a.q33) && a.q33.length === 2 && a.q33.includes('Allowance from parents/family') && a.q33.includes('Part-time job'),
    'CSV: Q33 multi-select built from boolean columns',
    JSON.stringify(a.q33)
  );
  assert(a.q45 === 4, 'CSV: Likert digit coerced to number', `q45=${JSON.stringify(a.q45)} (${typeof a.q45})`);
  assert(
    Array.isArray(a.q56) && a.q56.length === 1 && a.q56[0] === 'Use savings',
    'CSV: Q56 comes out as an array (regression: old test_csv.ts dropped this key)',
    JSON.stringify(a.q56)
  );
  assert(
    typeof a.q77 === 'string' && a.q77.includes('"hi"') && a.q77.includes(',') && a.q77.includes('\n'),
    'CSV: quoted field with embedded comma+newline+escaped quote parsed intact',
    JSON.stringify(a.q77)
  );
  assert(
    Array.isArray(a.q38) && a.q38.length === 2 && a.q38.includes('Food and groceries') && a.q38.includes('Rent'),
    'CSV: Q38 multi-select built from trailing boolean block, "(2)" duplicate ignored',
    JSON.stringify(a.q38)
  );
  assert(!('submissionid' in a) && !('respondentid' in a), 'CSV: metadata columns produce no stray keys');

  // ===== LIVE POSTMESSAGE PATH =====

  const livePayload = {
    event: 'Tally.FormSubmitted',
    payload: {
      respondentId: 'R2',
      fields: [
        { title: 'Q1. Test question?', type: 'INPUT_TEXT', answer: { value: 'Yes' } },
        {
          title: 'Q33. Where does your money come from?',
          type: 'CHECKBOXES',
          answer: { value: ['Allowance from parents/family', 'Part-time job'] },
        },
        { title: 'Q45. I set a budget for my monthly expenses.', type: 'RATING', answer: { value: '4' } },
        { title: 'Q8. Gender', type: 'MULTIPLE_CHOICE', answer: { value: ['Male'] } },
        { title: 'Q99. Unrecognized field shape', type: 'WEIRD', answer: { value: { nested: true } } },
        { title: 'Do you agree to participate?', type: 'MULTIPLE_CHOICE', answer: { value: 'Yes' } },
      ],
    },
  };

  const live = mapTallyPayload(livePayload);

  assert(live.answers.q1 === 'Yes', 'Live: single-value field mapped', JSON.stringify(live.answers.q1));
  assert(
    Array.isArray(live.answers.q33) && live.answers.q33!.length === 2,
    'Live: array-valued checkbox field mapped to string[]',
    JSON.stringify(live.answers.q33)
  );
  assert(live.answers.q45 === 4, 'Live: Likert string coerced to number', JSON.stringify(live.answers.q45));
  assert((live.answers as any).q8 === 'Male', 'Live: single-select array-of-one unwrapped to scalar', JSON.stringify((live.answers as any).q8));
  assert(!('q0' in live.answers) && Object.keys(live.answers).every((k) => k !== 'consent'), 'Live: consent question not mapped to a q-key');
  assert(live.unmapped.length === 1 && live.unmapped[0].title.startsWith('Q99'), 'Live: unrecognized value shape recorded in unmapped, not silently dropped', JSON.stringify(live.unmapped));

  // Parse-failure fallback: TallyEmbed calls onSubmitted(null) when it can't parse the message.
  const nullResult = mapTallyPayload(null);
  assert(Object.keys(nullResult.answers).length === 0 && nullResult.unmapped.length === 0, 'Live: null payload yields empty answers, no crash');

  console.log(`\n${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
