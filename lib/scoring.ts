import { ARCHETYPES, BADGES } from './archetypes';
import { Archetype, Badge, ScoringResult, SurveyAnswers } from './types';

export interface ScoringOptions {
  budgetingThreshold?: number; // default 3.0 (swappable with sample median)
  impulseThreshold?: number; // default 3.0 (swappable with sample median)
}

function parseLikert(val: unknown): number | null {
  if (typeof val === 'number' && val >= 1 && val <= 5) return val;
  if (typeof val === 'string') {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 5) return num;
  }
  return null;
}

export function computeSurveyResult(
  answers: SurveyAnswers,
  options?: ScoringOptions
): ScoringResult {
  const budgetThreshold = options?.budgetingThreshold ?? 3.4;
  const impulseThreshold = options?.impulseThreshold ?? 2.8;

  // 1. Budgeting Score items (Q45..Q53 straight, Q54 reverse)
  const budgetStraightKeys: Array<keyof SurveyAnswers> = [
    'q45', 'q46', 'q47', 'q48', 'q49', 'q50', 'q51', 'q52', 'q53'
  ];
  let budgetSum = 0;
  let budgetAnswered = 0;

  for (const k of budgetStraightKeys) {
    const parsed = parseLikert(answers[k]);
    if (parsed !== null) {
      budgetSum += parsed;
      budgetAnswered++;
    }
  }

  // Q54 is reverse scored: 6 - score
  const q54Raw = parseLikert(answers.q54);
  if (q54Raw !== null) {
    budgetSum += (6 - q54Raw);
    budgetAnswered++;
  }

  const isBudgetingValid = budgetAnswered >= 6;
  const budgetingScore = isBudgetingValid ? Number((budgetSum / budgetAnswered).toFixed(2)) : null;

  // 2. Online Impulse Score items (Q59..Q64 straight)
  const impulseKeys: Array<keyof SurveyAnswers> = [
    'q59', 'q60', 'q61', 'q62', 'q63', 'q64'
  ];
  let impulseSum = 0;
  let impulseAnswered = 0;

  for (const k of impulseKeys) {
    const parsed = parseLikert(answers[k]);
    if (parsed !== null) {
      impulseSum += parsed;
      impulseAnswered++;
    }
  }

  const isImpulseValid = impulseAnswered >= 4;
  const impulseScore = isImpulseValid ? Number((impulseSum / impulseAnswered).toFixed(2)) : null;

  // 3. Q57 Gate Check ("Never" shops online)
  const isNeverOnlineShopper = answers.q57?.trim().toLowerCase() === 'never';

  // 4. Badges (Missing safe)
  const badges: Badge[] = [];
  if (answers.q31?.trim().toLowerCase() === 'yes') {
    badges.push(BADGES['safety-net']);
  }
  if (
    answers.q23 === 'Regularly' ||
    answers.q23 === 'Occasionally' ||
    answers.q23?.toLowerCase().includes('regularly') ||
    answers.q23?.toLowerCase().includes('occasionally')
  ) {
    badges.push(BADGES['secret-shopper']);
  }
  if (
    answers.q65 === 'Yes, I use it more than planned' ||
    answers.q65?.toLowerCase().includes('more than planned')
  ) {
    badges.push(BADGES['emi-enthusiast']);
  }

  // Calculate completion percentage
  const totalKeys = Object.keys(answers).length;
  const totalAnswered = Object.values(answers).filter(v => v !== undefined && v !== null && v !== '').length;
  const completionPercentage = Math.min(100, Math.round((totalAnswered / 78) * 100));

  // Determine Archetype
  let matchedArchetype: Archetype;
  let matchedReason = '';

  // Gate 1: Q57 = "Never" -> Untouchable
  if (isNeverOnlineShopper) {
    matchedArchetype = { ...ARCHETYPES['untouchable'] };
    if (isBudgetingValid && budgetingScore !== null && budgetingScore >= budgetThreshold) {
      matchedArchetype.subLine = '...and your budgeting discipline is strong too, which frankly feels unfair.';
    }
    matchedReason = 'Never shops online (Q57 Gate)';
    return {
      archetype: matchedArchetype,
      budgetingScore,
      impulseScore: null,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: 0,
      isBudgetingValid,
      isImpulseValid: false,
      isUntouchable: true,
      isEnigma: false,
      matchedReason,
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // Gate 2: Score Validity Check (Fallback: The Enigma)
  if (!isBudgetingValid || (!isNeverOnlineShopper && !isImpulseValid)) {
    return {
      archetype: ARCHETYPES['enigma'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: true,
      matchedReason: 'Skipped Likert items below minimum threshold for scoring',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // Safe non-null scores for subsequent evaluation
  const bScore = budgetingScore!;
  const iScore = impulseScore!;

  // 5. Tier 1: Contradiction Hidden Types (Strict Priority Order)
  const q53 = parseLikert(answers.q53);
  const q54 = parseLikert(answers.q54);
  const q45 = parseLikert(answers.q45);
  const q46 = parseLikert(answers.q46);
  const q48 = parseLikert(answers.q48);

  // 1. Delusional CFO: High confidence (Q53 >= 4) AND runs out of money (Q54 >= 4)
  if (q53 !== null && q53 >= 4 && q54 !== null && q54 >= 4) {
    return {
      archetype: ARCHETYPES['delusional-cfo'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Contradiction: Confident in money management but runs out before month-end (Q53 & Q54)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 2. Humble Menace: Thinks they spend less than peers (Q73 = Less than most) but Impulse >= 4.0
  if (
    answers.q73?.toLowerCase().includes('less than most') &&
    iScore >= 4.0
  ) {
    return {
      archetype: ARCHETYPES['humble-menace'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Contradiction: Thinks they spend less than peers but has extreme impulse score (Q73 & Impulse >= 4.0)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 3. The Theorist: Makes a budget (Q45 >= 4) but does not stick (Q46 <= 2) and does not track (Q48 <= 2)
  if (
    q45 !== null && q45 >= 4 &&
    q46 !== null && q46 <= 2 &&
    q48 !== null && q48 <= 2
  ) {
    return {
      archetype: ARCHETYPES['theorist'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Contradiction: Makes budget plans but never sticks or tracks daily spending (Q45, Q46, Q48)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 6. Tier 2: Lifestyle Hidden Types (Strict Priority Order)

  // 4. The Family Pillar: Supports family (Q31 = Yes) on bottom 2 income brackets (Q34 below 5,000 BDT)
  if (
    answers.q31?.trim().toLowerCase() === 'yes' &&
    (answers.q34?.includes('Below ৳2,000') || answers.q34?.includes('৳2,000–4,999') || answers.q34?.toLowerCase().includes('below ৳2,000') || answers.q34?.toLowerCase().includes('2,000'))
  ) {
    return {
      archetype: ARCHETYPES['family-pillar'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Lifestyle: Supports family on tight personal budget under ৳5,000 (Q31 & Q34)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 5. The Hustler: >= 3 income sources (Q33)
  if (Array.isArray(answers.q33) && answers.q33.length >= 3) {
    return {
      archetype: ARCHETYPES['hustler'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Lifestyle: 3+ independent income sources (Q33)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 6. The Bank of Friends: Frequently lends without tracking who owes whom (Q43)
  if (
    answers.q43?.includes("don't always track who owes whom") ||
    answers.q43?.toLowerCase().includes('frequently')
  ) {
    return {
      archetype: ARCHETYPES['bank-of-friends'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Lifestyle: Frequently lends money to friends without tracking (Q43)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 7. The Window Shopper: Follows deal pages daily/occasionally (Q67) but makes 0 unplanned buys (Q68 = 0)
  if (
    (answers.q67?.includes('Yes, daily') || answers.q67?.includes('Yes, occasionally')) &&
    (answers.q68 === '0' || answers.q68 === '০' || answers.q68?.includes('0'))
  ) {
    return {
      archetype: ARCHETYPES['window-shopper'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Lifestyle: Follows deal pages but makes 0 unplanned purchases (Q67 & Q68)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 8. The Cart Monk: Adds to cart and waits, which stops buying (Q66)
  if (answers.q66?.includes('stops me from buying')) {
    return {
      archetype: ARCHETYPES['cart-monk'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Lifestyle: Uses cart-waiting technique to prevent impulse buying (Q66)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 9. The Payday Phenomenon: Spends significantly more right after money arrives (Q37) and runs out (Q54 >= 4)
  if (
    answers.q37?.includes('Significantly more') &&
    q54 !== null && q54 >= 4
  ) {
    return {
      archetype: ARCHETYPES['pay-day-phenomenon'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Lifestyle: Spends significantly more after receiving money and runs out (Q37 & Q54)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 10. The Copycat: Influenced by seeing friends/classmates with items (Q72) with high impulse
  if (
    answers.q72?.includes('Seeing someone I know has it') &&
    iScore >= 3.5
  ) {
    return {
      archetype: ARCHETYPES['copycat'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Lifestyle: Buys when peers have items (Q72 & high impulse)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 11. The Cash Purist: Only uses cash (Q40 = ["Cash"])
  if (
    Array.isArray(answers.q40) &&
    answers.q40.length === 1 &&
    answers.q40[0]?.trim().toLowerCase() === 'cash'
  ) {
    return {
      archetype: ARCHETYPES['cash-purist'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Lifestyle: Operates exclusively with physical cash notes (Q40)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 12. The Survivor: Session jam / exam delay disrupted budget (Q28) and education cost is a strain (Q27 >= 4)
  const q27 = parseLikert(answers.q27);
  if (
    answers.q28?.includes('disrupted my budget significantly') &&
    q27 !== null && q27 >= 4
  ) {
    return {
      archetype: ARCHETYPES['survivor'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Lifestyle: Session jam disrupted budget under education cost strain (Q28 & Q27)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 13. Bonus: The Cash Hoarder (Saves >25% or >50% every month)
  if (
    answers.q41 === 'Yes, every month' &&
    (answers.q42?.includes('26–50%') || answers.q42?.includes('More than 50%'))
  ) {
    return {
      archetype: ARCHETYPES['cash-hoarder'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Bonus: Consistently saves >25% of all income every month (Q41 & Q42)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 14. Bonus: The Son of King (High budget/income handled entirely by family)
  if (
    (answers.q34?.includes('৳20,000') || answers.q29?.includes('৳1,50,000')) &&
    (answers.q21?.includes('Entirely my family') || answers.q21?.includes('Mostly my family'))
  ) {
    return {
      archetype: ARCHETYPES['son-of-king'],
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: 'Bonus: High financial cushion with family managing spending decisions (Q34/Q29 & Q21)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // 7. Base 2x2 Grid Fallback
  const isHighBudget = bScore >= budgetThreshold;
  const isHighImpulse = iScore >= impulseThreshold;

  if (isHighBudget && !isHighImpulse) {
    matchedArchetype = ARCHETYPES['hishabi'];
    matchedReason = `Base 2×2: High Budgeting (${bScore} ≥ ${budgetThreshold}) & Low Impulse (${iScore} < ${impulseThreshold})`;
  } else if (isHighBudget && isHighImpulse) {
    matchedArchetype = ARCHETYPES['plan-then-panic'];
    matchedReason = `Base 2×2: High Budgeting (${bScore} ≥ ${budgetThreshold}) & High Impulse (${iScore} ≥ ${impulseThreshold})`;
  } else if (!isHighBudget && isHighImpulse) {
    matchedArchetype = ARCHETYPES['2am-checkout'];
    matchedReason = `Base 2×2: Low Budgeting (${bScore} < ${budgetThreshold}) & High Impulse (${iScore} ≥ ${impulseThreshold})`;
  } else {
    matchedArchetype = ARCHETYPES['ghost-spender'];
    matchedReason = `Base 2×2: Low Budgeting (${bScore} < ${budgetThreshold}) & Low Impulse (${iScore} < ${impulseThreshold})`;
  }

  return {
    archetype: matchedArchetype,
    budgetingScore,
    impulseScore,
    budgetingAnsweredCount: budgetAnswered,
    impulseAnsweredCount: impulseAnswered,
    isBudgetingValid,
    isImpulseValid,
    isUntouchable: false,
    isEnigma: false,
    matchedReason,
    badges,
    answersSummary: { totalAnswered, completionPercentage },
  };
}
