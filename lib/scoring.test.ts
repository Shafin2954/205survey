import { computeSurveyResult } from './scoring';
import { SurveyAnswers } from './types';

function runTests() {
  console.log('--- HEURISTIC SCORING ENGINE TESTS ---\n');
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

  // Shared minimal valid Likert answers (needed to pass Enigma gate)
  const validBase: Partial<SurveyAnswers> = {
    q45: 3, q46: 3, q47: 3, q48: 3, q49: 3, q50: 3, q51: 3, q52: 3, q53: 3, q54: 3,
    q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
  };

  // ===== HARD GATES =====

  // Test: Untouchable (Q57 = "Never")
  const res1 = computeSurveyResult({
    ...validBase,
    q57: 'Never',
  });
  assert(res1.archetype.id === 'untouchable' && res1.isUntouchable, 'Untouchable gate', `Got ${res1.archetype.id}`);

  // Test: Enigma (insufficient budgeting answers)
  const res2 = computeSurveyResult({
    q45: 5, q46: 4,
    q59: 5, q60: 5, q61: 5, q62: 5,
  });
  assert(res2.archetype.id === 'enigma' && res2.isEnigma, 'Enigma gate (low budgeting count)', `Got ${res2.archetype.id}`);

  // ===== HEURISTIC ARCHETYPES =====

  // Test: 2AM Checkout Warrior
  const res3 = computeSurveyResult({
    ...validBase,
    q61: 5, q59: 5, q60: 5, // High impulse signals
    q57: 'Several times a week',
    q58: ['Daraz'],
    q38: ['Online shopping', 'Food and groceries', 'Transport'],
    q71: 'Over an hour',
    q45: 1, // No budget
  });
  assert(res3.archetype.id === '2am-checkout', '2AM Checkout heuristic', `Got ${res3.archetype.id} (${res3.matchedReason})`);

  // Test: Window Shopper
  const res4 = computeSurveyResult({
    ...validBase,
    q59: 1, q60: 1, q61: 1, q62: 1, q63: 1, q64: 1, // Very low impulse
    q67: 'Yes, daily',
    q68: '0',
    q66: 'Yes, and it usually stops me from buying',
    q71: '30–60 minutes',
  });
  assert(res4.archetype.id === 'window-shopper', 'Window Shopper heuristic', `Got ${res4.archetype.id} (${res4.matchedReason})`);

  // Test: Cart Monk
  const res5 = computeSurveyResult({
    ...validBase,
    q59: 1, q60: 2, q61: 1, q62: 2, q63: 1, q64: 1,
    q66: 'Yes, and it usually stops me from buying',
    q47: 5,
    q46: 4,
    q57: '1–3 times a month',
  });
  assert(res5.archetype.id === 'cart-monk', 'Cart Monk heuristic', `Got ${res5.archetype.id} (${res5.matchedReason})`);

  // Test: Son of King (রাজার ব্যাটা)
  const res6 = computeSurveyResult({
    ...validBase,
    q54: 1, // Never runs out
    q21: 'Mostly my family',
    q29: '৳1,50,000 and above',
    q34: '৳20,000 and above',
    q33: ['Allowance from parents/family'],
    q36: 'Paid separately by family',
    q74: 1,
    q27: 1,
  });
  assert(res6.archetype.id === 'son-of-king', 'Son of King heuristic', `Got ${res6.archetype.id} (${res6.matchedReason})`);

  // Test: Bank of Friends
  const res7 = computeSurveyResult({
    ...validBase,
    q43: "Yes, frequently, and I don't always track who owes whom",
    q56: ['Borrow from a friend'],
    q44: 'Yes, frequently',
    q38: ['Eating out with friends', 'Food and groceries', 'Transport'],
  });
  assert(res7.archetype.id === 'bank-of-friends', 'Bank of Friends heuristic', `Got ${res7.archetype.id} (${res7.matchedReason})`);

  // Test: The Hishabi
  const res8 = computeSurveyResult({
    ...validBase,
    q45: 5, q46: 5, q47: 5, q48: 5, q49: 5, q50: 5, q51: 5, q52: 5, q53: 5, q54: 1,
    q59: 1, q60: 1, q61: 1, q62: 1, q63: 1, q64: 1,
    q55: 'Yes',
    q41: 'Yes, every month',
    q37: 'I spend uniformly throughout the month',
  });
  assert(res8.archetype.id === 'hishabi', 'Hishabi heuristic', `Got ${res8.archetype.id} (${res8.matchedReason})`);

  // Test: Delusional CFO
  const res9 = computeSurveyResult({
    ...validBase,
    q53: 5, q54: 5, // Confident AND runs out
    q73: 'Less than most',
    q48: 1, // Doesn't track
    q59: 4, // Some impulse
  });
  assert(res9.archetype.id === 'delusional-cfo', 'Delusional CFO heuristic', `Got ${res9.archetype.id} (${res9.matchedReason})`);

  // Test: Humble Menace
  const res10 = computeSurveyResult({
    ...validBase,
    q73: 'Less than most',
    q59: 5, q60: 4, q61: 5, q62: 4, q63: 4, q64: 5, // High impulse avg
    q39: 'More than half',
    q23: 'Regularly',
  });
  assert(res10.archetype.id === 'humble-menace', 'Humble Menace heuristic', `Got ${res10.archetype.id} (${res10.matchedReason})`);

  // Test: Family Pillar
  const res11 = computeSurveyResult({
    ...validBase,
    q31: 'Yes',
    q34: 'Below ৳2,000',
    q27: 5,
    q29: 'Below ৳15,000',
    q76: 'Give it to family',
    q74: 5,
  });
  assert(res11.archetype.id === 'family-pillar', 'Family Pillar heuristic', `Got ${res11.archetype.id} (${res11.matchedReason})`);

  // Test: Hustler
  const res12 = computeSurveyResult({
    ...validBase,
    q33: ['Private tuition (teaching students)', 'Part-time job', 'Freelancing / online work'],
    q56: ['Take extra tuition or work'],
    q21: 'Entirely me',
  });
  assert(res12.archetype.id === 'hustler', 'Hustler heuristic', `Got ${res12.archetype.id} (${res12.matchedReason})`);

  // Test: Payday Phenomenon
  const res13 = computeSurveyResult({
    ...validBase,
    q37: 'Significantly more',
    q54: 5, // Runs out
    q41: 'No',
    q39: 'More than half',
    q38: ['Eating out with friends', 'Food and groceries', 'Clothes and personal care'],
  });
  assert(res13.archetype.id === 'pay-day-phenomenon', 'Payday Phenomenon heuristic', `Got ${res13.archetype.id} (${res13.matchedReason})`);



  // Test: Cash Hoarder
  const res15 = computeSurveyResult({
    ...validBase,
    q59: 1, q60: 1, q61: 1, q62: 1, q63: 1, q64: 1,
    q54: 1,
    q41: 'Yes, every month',
    q42: 'More than 50%',
    q76: 'Put all of it in savings',
    q39: 'Almost none',
    q49: 5,
  });
  assert(res15.archetype.id === 'cash-hoarder', 'Cash Hoarder heuristic', `Got ${res15.archetype.id} (${res15.matchedReason})`);

  // Test: Ghost Spender fallback (no strong signals for anything fun)
  const res16 = computeSurveyResult({
    q45: 2, q46: 2, q47: 2, q48: 1, q49: 2, q50: 2, q51: 2, q52: 2, q53: 2, q54: 4,
    q59: 2, q60: 2, q61: 2, q62: 2, q63: 2, q64: 2,
    q55: 'No idea and I avoid checking',
  });
  assert(res16.archetype.id === 'ghost-spender', 'Ghost Spender heuristic', `Got ${res16.archetype.id} (${res16.matchedReason})`);

  // ===== BADGES =====
  const resBadges = computeSurveyResult({
    ...validBase,
    q31: 'Yes',
    q23: 'Occasionally',
    q65: 'Yes, I use it more than planned',
  });
  assert(
    resBadges.badges.length === 3 &&
    resBadges.badges.some(b => b.id === 'safety-net') &&
    resBadges.badges.some(b => b.id === 'secret-shopper') &&
    resBadges.badges.some(b => b.id === 'emi-enthusiast'),
    'All 3 Badges correctly awarded',
    `Got ${resBadges.badges.map(b => b.id).join(', ')}`
  );

  console.log(`\n--- TEST SUMMARY: ${passed} passed, ${failed} failed ---`);
}

runTests();
