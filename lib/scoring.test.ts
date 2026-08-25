import { computeSurveyResult } from './scoring';
import { SurveyAnswers } from './types';

function runTests() {
  console.log('--- STARTING SCORING ENGINE TESTS ---');
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

  // Test 1: Base Grid - The Hishabi (High Budgeting, Low Impulse)
  const hishabiAnswers: SurveyAnswers = {
    q45: 5, q46: 5, q47: 5, q48: 5, q49: 5, q50: 5, q51: 5, q52: 5, q53: 5, q54: 1, // Budget score: 5.0
    q59: 1, q60: 1, q61: 1, q62: 1, q63: 1, q64: 1, // Impulse score: 1.0
  };
  const res1 = computeSurveyResult(hishabiAnswers);
  assert(res1.archetype.id === 'hishabi', 'The Hishabi base detection', `Got ${res1.archetype.id}`);

  // Test 2: Base Grid - Plan-Then-Panic (High Budgeting, High Impulse)
  const panicAnswers: SurveyAnswers = {
    q45: 4, q46: 4, q47: 4, q48: 4, q49: 4, q50: 4, q51: 4, q52: 4, q53: 2, q54: 2, // Budget score: 4.0
    q59: 4, q60: 5, q61: 4, q62: 5, q63: 4, q64: 5, // Impulse score: 4.5
  };
  const res2 = computeSurveyResult(panicAnswers);
  assert(res2.archetype.id === 'plan-then-panic', 'Plan-Then-Panic base detection', `Got ${res2.archetype.id}`);

  // Test 3: Base Grid - 2AM Checkout Warrior (Low Budgeting, High Impulse)
  const warriorAnswers: SurveyAnswers = {
    q45: 1, q46: 1, q47: 2, q48: 1, q49: 2, q50: 2, q51: 1, q52: 2, q53: 2, q54: 5, // Budget score: 1.4
    q59: 5, q60: 5, q61: 5, q62: 5, q63: 5, q64: 5, // Impulse score: 5.0
  };
  const res3 = computeSurveyResult(warriorAnswers);
  assert(res3.archetype.id === '2am-checkout', '2AM Checkout Warrior base detection', `Got ${res3.archetype.id}`);

  // Test 4: Base Grid - Ghost Spender (Low Budgeting, Low Impulse)
  const ghostAnswers: SurveyAnswers = {
    q45: 2, q46: 2, q47: 2, q48: 2, q49: 2, q50: 2, q51: 2, q52: 2, q53: 2, q54: 4, // Budget score: 2.0
    q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2, // Impulse score: 2.0
  };
  const res4 = computeSurveyResult(ghostAnswers);
  assert(res4.archetype.id === 'ghost-spender', 'Ghost Spender base detection', `Got ${res4.archetype.id}`);

  // Test 5: Q57 = "Never" Gate -> The Untouchable
  const untouchableAnswers: SurveyAnswers = {
    q57: 'Never',
    q45: 5, q46: 5, q47: 5, q48: 5, q49: 5, q50: 5, q51: 5, q52: 5, q53: 5, q54: 1,
  };
  const res5 = computeSurveyResult(untouchableAnswers);
  assert(res5.archetype.id === 'untouchable' && res5.isUntouchable, 'The Untouchable Q57 gate', `Got ${res5.archetype.id}`);

  // Test 6: Fallback - The Enigma (Insufficient budgeting answers)
  const enigmaAnswers1: SurveyAnswers = {
    q45: 5, q46: 4, // only 2 items answered
    q59: 5, q60: 5, q61: 5, q62: 5,
  };
  const res6 = computeSurveyResult(enigmaAnswers1);
  assert(res6.archetype.id === 'enigma' && res6.isEnigma, 'The Enigma fallback for low budgeting count', `Got ${res6.archetype.id}`);

  // Test 7: Delusional CFO (Q53 >= 4 && Q54 >= 4)
  const cfoAnswers: SurveyAnswers = {
    q45: 4, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3,
    q53: 5, q54: 5, // Confident & runs out
    q59: 3, q60: 3, q61: 3, q62: 3, q63: 3, q64: 3,
  };
  const res7 = computeSurveyResult(cfoAnswers);
  assert(res7.archetype.id === 'delusional-cfo', 'Delusional CFO trigger', `Got ${res7.archetype.id}`);

  // Test 8: Humble Menace (Q73 = Less than most && Impulse >= 4.0)
  const menaceAnswers: SurveyAnswers = {
    q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
    q59: 5, q60: 4, q61: 5, q62: 4, q63: 4, q64: 4, // Impulse >= 4.0
    q73: 'Less than most',
  };
  const res8 = computeSurveyResult(menaceAnswers);
  assert(res8.archetype.id === 'humble-menace', 'Humble Menace trigger', `Got ${res8.archetype.id}`);

  // Test 9: Family Pillar (Q31 = Yes && Q34 in bottom brackets)
  const pillarAnswers: SurveyAnswers = {
    q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
    q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
    q31: 'Yes',
    q34: 'Below ৳2,000',
  };
  const res9 = computeSurveyResult(pillarAnswers);
  assert(res9.archetype.id === 'family-pillar', 'Family Pillar trigger', `Got ${res9.archetype.id}`);

  // Test 10: Hustler (Q33 >= 3 income sources)
  const hustlerAnswers: SurveyAnswers = {
    q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
    q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
    q33: ['Private tuition', 'Part-time job', 'Freelancing / online work'],
  };
  const res10 = computeSurveyResult(hustlerAnswers);
  assert(res10.archetype.id === 'hustler', 'Hustler trigger', `Got ${res10.archetype.id}`);

  // Test 11: Badges check
  const badgeAnswers: SurveyAnswers = {
    q45: 5, q46: 5, q47: 5, q48: 5, q49: 5, q50: 5, q51: 5, q52: 5, q53: 5, q54: 1,
    q59: 1, q60: 1, q61: 1, q62: 1, q63: 1, q64: 1,
    q31: 'Yes', // Family's safety net
    q23: 'Occasionally', // Low-key secret shopper
    q65: 'Yes, I use it more than planned', // EMI Enthusiast
  };
  const res11 = computeSurveyResult(badgeAnswers);
  assert(
    res11.badges.length === 3 &&
    res11.badges.some(b => b.id === 'safety-net') &&
    res11.badges.some(b => b.id === 'secret-shopper') &&
    res11.badges.some(b => b.id === 'emi-enthusiast'),
    'All 3 Badges correctly awarded',
    `Got ${res11.badges.map(b => b.id).join(', ')}`
  );

  console.log(`\nTEST SUMMARY: ${passed} passed, ${failed} failed.`);
}

runTests();
