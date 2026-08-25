import { ARCHETYPES, BADGES } from './archetypes';
import { Archetype, Badge, ScoringResult, SurveyAnswers } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseLikert(val: unknown): number | null {
  if (typeof val === 'number' && val >= 1 && val <= 5) return val;
  if (typeof val === 'string') {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 5) return num;
  }
  return null;
}

/** Case-insensitive substring check (null-safe). */
function includes(val: string | undefined | null, sub: string): boolean {
  if (!val) return false;
  return val.toLowerCase().includes(sub.toLowerCase());
}

/** Check if val exactly equals one of the candidates (case-insensitive, trimmed). */
function isOneOf(val: string | undefined | null, ...candidates: string[]): boolean {
  if (!val) return false;
  const v = val.trim().toLowerCase();
  return candidates.some(c => c.toLowerCase() === v);
}

/** Check if an array-type answer includes an item (case-insensitive substring). */
function arrayIncludes(arr: string[] | undefined | null, sub: string): boolean {
  if (!Array.isArray(arr)) return false;
  return arr.some(item => item.toLowerCase().includes(sub.toLowerCase()));
}

/** Count how many of the given substrings appear in the array. */
function arrayCountMatches(arr: string[] | undefined | null, subs: string[]): number {
  if (!Array.isArray(arr)) return 0;
  let count = 0;
  for (const sub of subs) {
    if (arr.some(item => item.toLowerCase().includes(sub.toLowerCase()))) count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Rarity & Tier ordering for tie-breaking
// ---------------------------------------------------------------------------

const RARITY_ORDER: Record<string, number> = {
  'Special': 5,
  'Legendary': 4,
  'Rare': 3,
  'Uncommon': 2,
  'Common': 1,
};

const TIER_ORDER: Record<string, number> = {
  'contradiction': 4,
  'lifestyle': 3,
  'bonus': 2,
  'base': 1,
  'special': 0,
};

// ---------------------------------------------------------------------------
// Signal scoring for each archetype
// ---------------------------------------------------------------------------

interface ArchetypeScore {
  id: string;
  points: number;
  minimum: number;
  hardRequirementMet: boolean; // If false, archetype cannot trigger even if points are high
}

function score2amCheckout(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  const q61 = parseLikert(a.q61);
  if (q61 !== null && q61 >= 4) pts += 3;

  const q59 = parseLikert(a.q59);
  if (q59 !== null && q59 >= 4) pts += 2;

  const q60 = parseLikert(a.q60);
  if (q60 !== null && q60 >= 4) pts += 2;

  if (isOneOf(a.q57, 'Several times a week', 'Almost daily')) pts += 3;
  else if (isOneOf(a.q57, 'About once a week')) pts += 1;

  if (arrayIncludes(a.q58, 'Daraz')) pts += 1;
  if (arrayIncludes(a.q38, 'Online shopping')) pts += 2;

  if (isOneOf(a.q71, '30–60 minutes', 'Over an hour', '30-60 minutes')) pts += 2;

  const q45 = parseLikert(a.q45);
  if (q45 !== null && q45 <= 2) pts += 1;

  const q63 = parseLikert(a.q63);
  if (q63 !== null && q63 >= 4) pts += 1;

  const q62 = parseLikert(a.q62);
  if (q62 !== null && q62 >= 4) pts += 1;

  return { id: '2am-checkout', points: pts, minimum: 6, hardRequirementMet: true };
}

function scoreWindowShopper(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  if (isOneOf(a.q67, 'Yes, daily')) pts += 4;
  else if (isOneOf(a.q67, 'Yes, occasionally')) pts += 2;

  if (isOneOf(a.q68, '0', '০')) pts += 4;
  else if (includes(a.q68, '1–2') || includes(a.q68, '1-2')) pts += 1;

  const q59 = parseLikert(a.q59);
  const q71scrolls = isOneOf(a.q71, '15–30 minutes', '15-30 minutes', '30–60 minutes', '30-60 minutes', 'Over an hour');
  if (q71scrolls && q59 !== null && q59 <= 2) pts += 3;

  // Low impulse overall
  const impulseAvg = computeImpulseAvg(a);
  if (impulseAvg !== null && impulseAvg <= 2.0) pts += 2;

  if (includes(a.q66, 'stops me from buying')) pts += 2;

  const q47 = parseLikert(a.q47);
  if (q47 !== null && q47 >= 4) pts += 1;

  return { id: 'window-shopper', points: pts, minimum: 6, hardRequirementMet: true };
}

function scoreCartMonk(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  if (includes(a.q66, 'stops me from buying')) pts += 5;
  else if (includes(a.q66, 'buy it anyway later')) pts += 2;

  const q47 = parseLikert(a.q47);
  if (q47 !== null && q47 >= 4) pts += 2;

  const q59 = parseLikert(a.q59);
  if (q59 !== null && q59 <= 2) pts += 2;

  if (isOneOf(a.q57, '1–3 times a month', '1-3 times a month', 'Less than once a month')) pts += 1;

  const q46 = parseLikert(a.q46);
  if (q46 !== null && q46 >= 4) pts += 1;

  const q63 = parseLikert(a.q63);
  if (q63 !== null && q63 <= 2) pts += 1;

  return { id: 'cart-monk', points: pts, minimum: 5, hardRequirementMet: true };
}

function scoreSonOfKing(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  if (isOneOf(a.q21, 'Mostly my family', 'Entirely my family')) pts += 4;

  if (includes(a.q29, '1,50,000') || includes(a.q29, '80,000')) pts += 3;

  if (includes(a.q34, '20,000') || includes(a.q34, '12,000')) pts += 3;

  // Money from parents only (no earned income)
  if (Array.isArray(a.q33)) {
    const earnedSources = ['tuition', 'part-time', 'freelanc', 'business', 'content creation'];
    const hasEarned = a.q33.some(s => earnedSources.some(e => s.toLowerCase().includes(e)));
    const hasFamily = a.q33.some(s => s.toLowerCase().includes('parent') || s.toLowerCase().includes('family') || s.toLowerCase().includes('allowance'));
    if (hasFamily && !hasEarned && a.q33.length <= 2) pts += 3;
    if (hasFamily && !hasEarned) pts += 2; // even with remittance
  }

  if (isOneOf(a.q36, 'Paid separately by family')) pts += 2;

  const q54 = parseLikert(a.q54);
  if (q54 !== null && q54 <= 2) pts += 2;

  const q74 = parseLikert(a.q74);
  if (q74 !== null && q74 <= 2) pts += 1;

  const q27 = parseLikert(a.q27);
  if (q27 !== null && q27 <= 2) pts += 1;

  if (isOneOf(a.q76, 'Buy something I\'ve been wanting', 'Spend it with friends')) pts += 1;

  return { id: 'son-of-king', points: pts, minimum: 7, hardRequirementMet: true };
}

function scoreBankOfFriends(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  if (includes(a.q43, "don't always track who owes whom") || includes(a.q43, 'frequently')) pts += 5;
  else if (includes(a.q43, 'careful track')) pts += 2;

  if (arrayIncludes(a.q56, 'Borrow from a friend')) pts += 2;

  if (isOneOf(a.q44, 'Yes, frequently')) pts += 2;
  else if (includes(a.q44, 'Sometimes')) pts += 1;

  if (arrayIncludes(a.q38, 'Eating out with friends')) pts += 1;
  if (arrayIncludes(a.q38, 'Gifts')) pts += 1;

  if (!isOneOf(a.q41, 'Yes, every month')) pts += 1;

  return { id: 'bank-of-friends', points: pts, minimum: 5, hardRequirementMet: true };
}

function scoreHishabi(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  const q45 = parseLikert(a.q45);
  if (q45 !== null && q45 >= 4) pts += 3;

  const q46 = parseLikert(a.q46);
  if (q46 !== null && q46 >= 4) pts += 3;

  const q48 = parseLikert(a.q48);
  if (q48 !== null && q48 >= 4) pts += 2;

  const q47 = parseLikert(a.q47);
  if (q47 !== null && q47 >= 4) pts += 1;

  const q51 = parseLikert(a.q51);
  if (q51 !== null && q51 >= 4) pts += 2;

  if (isOneOf(a.q55, 'Yes')) pts += 3;

  if (isOneOf(a.q41, 'Yes, every month')) pts += 2;

  const q52 = parseLikert(a.q52);
  if (q52 !== null && q52 >= 4) pts += 1;

  const q59 = parseLikert(a.q59);
  if (q59 !== null && q59 <= 2) pts += 1;

  if (includes(a.q37, 'uniformly')) pts += 1;

  return { id: 'hishabi', points: pts, minimum: 7, hardRequirementMet: true };
}

function scorePlanThenPanic(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  const q45 = parseLikert(a.q45);
  if (q45 !== null && q45 >= 4) pts += 3;

  const q46 = parseLikert(a.q46);
  if (q46 !== null && q46 <= 2) pts += 3;

  const q54 = parseLikert(a.q54);
  if (q54 !== null && q54 >= 4) pts += 2;

  const q51 = parseLikert(a.q51);
  if (q51 !== null && q51 >= 3) pts += 1;

  const q59 = parseLikert(a.q59);
  if (q59 !== null && q59 >= 3) pts += 2;

  const q60 = parseLikert(a.q60);
  if (q60 !== null && q60 >= 3) pts += 1;

  if (includes(a.q55, '1,000') || includes(a.q55, 'Roughly')) pts += 1;

  if (isOneOf(a.q37, 'Somewhat more')) pts += 1;

  return { id: 'plan-then-panic', points: pts, minimum: 6, hardRequirementMet: true };
}

function scoreGhostSpender(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  const q48 = parseLikert(a.q48);
  if (q48 !== null && q48 <= 2) pts += 3;

  const q45 = parseLikert(a.q45);
  if (q45 !== null && q45 <= 2) pts += 2;

  if (includes(a.q55, 'No idea until I check') || includes(a.q55, 'No idea and I avoid')) pts += 4;

  const q54 = parseLikert(a.q54);
  if (q54 !== null && q54 >= 3) pts += 2;

  // Not impulsive — money just disappears
  const q59 = parseLikert(a.q59);
  const q60 = parseLikert(a.q60);
  if (q59 !== null && q59 <= 3 && q60 !== null && q60 <= 3) pts += 2;

  if (isOneOf(a.q39, 'About half', 'More than half')) pts += 2;

  if (includes(a.q35, 'unpredictable') || includes(a.q35, 'Changes a lot')) pts += 1;

  if (arrayIncludes(a.q56, 'Cut back and manage')) pts += 1;

  return { id: 'ghost-spender', points: pts, minimum: 5, hardRequirementMet: true };
}

function scoreDelusionalCFO(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  const q53 = parseLikert(a.q53);
  if (q53 !== null && q53 >= 4) pts += 4;

  const q54 = parseLikert(a.q54);
  if (q54 !== null && q54 >= 4) pts += 4;

  if (includes(a.q73, 'Less than most')) pts += 3;

  const q48 = parseLikert(a.q48);
  if (q48 !== null && q48 <= 2) pts += 2;

  const q59 = parseLikert(a.q59);
  if (q59 !== null && q59 >= 3) pts += 1;

  if (!isOneOf(a.q55, 'Yes')) pts += 1;

  if (includes(a.q37, 'Significantly more') || includes(a.q37, 'Somewhat more')) pts += 1;

  return { id: 'delusional-cfo', points: pts, minimum: 7, hardRequirementMet: true };
}

function scoreHumbleMenace(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  if (includes(a.q73, 'Less than most')) pts += 4;

  const impulseAvg = computeImpulseAvg(a);
  if (impulseAvg !== null && impulseAvg >= 3.5) pts += 4;
  else if (impulseAvg !== null && impulseAvg >= 3.0) pts += 2;

  const q59 = parseLikert(a.q59);
  if (q59 !== null && q59 >= 4) pts += 2;

  if (isOneOf(a.q39, 'About half', 'More than half')) pts += 2;

  if (isOneOf(a.q23, 'Regularly', 'Occasionally')) pts += 2;

  const q63 = parseLikert(a.q63);
  if (q63 !== null && q63 >= 3) pts += 1;

  const q64 = parseLikert(a.q64);
  if (q64 !== null && q64 >= 4) pts += 1;

  return { id: 'humble-menace', points: pts, minimum: 6, hardRequirementMet: true };
}



function scoreFamilyPillar(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;
  const supportsFamily = a.q31?.trim().toLowerCase() === 'yes';

  if (supportsFamily) pts += 5;

  if (includes(a.q34, 'Below') || includes(a.q34, '2,000–4,999') || includes(a.q34, '2,000-4,999')) pts += 3;
  else if (includes(a.q34, '5,000–7,999') || includes(a.q34, '5,000-7,999')) pts += 1;

  const q27 = parseLikert(a.q27);
  if (q27 !== null && q27 >= 4) pts += 2;

  if (includes(a.q29, 'Below') || includes(a.q29, '15,000–29,999') || includes(a.q29, '15,000-29,999')) pts += 2;

  const q30 = typeof a.q30 === 'number' ? a.q30 : parseInt(String(a.q30), 10);
  if (!isNaN(q30) && q30 >= 4) pts += 1;

  if (isOneOf(a.q76, 'Give it to family')) pts += 2;

  if (isOneOf(a.q41, 'Yes, when I can', 'I try but it doesn\'t last')) pts += 1;

  const q74 = parseLikert(a.q74);
  if (q74 !== null && q74 >= 4) pts += 1;

  return { id: 'family-pillar', points: pts, minimum: 7, hardRequirementMet: supportsFamily };
}

function scoreHustler(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  const sourceCount = Array.isArray(a.q33) ? a.q33.length : 0;
  if (sourceCount >= 3) pts += 5;
  else if (sourceCount === 2) pts += 2;

  // Count earned income sources
  const earnedKeywords = ['tuition', 'part-time', 'freelanc', 'business', 'content creation'];
  const earnedCount = arrayCountMatches(a.q33, earnedKeywords);
  if (earnedCount >= 2) pts += 2;
  if (earnedCount >= 1) pts += 3;

  if (arrayIncludes(a.q56, 'Take extra tuition') || arrayIncludes(a.q56, 'extra tuition or work')) pts += 2;

  if (isOneOf(a.q21, 'Entirely me')) pts += 1;

  if (includes(a.q35, 'unpredictable') || includes(a.q35, 'Changes a lot')) pts += 1;

  return { id: 'hustler', points: pts, minimum: 6, hardRequirementMet: true };
}

function scorePaydayPhenomenon(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  if (includes(a.q37, 'Significantly more')) pts += 5;
  else if (includes(a.q37, 'Somewhat more')) pts += 2;

  const q54 = parseLikert(a.q54);
  if (q54 !== null && q54 >= 4) pts += 3;
  else if (q54 !== null && q54 === 3) pts += 1;

  if (isOneOf(a.q41, 'I try but it doesn\'t last', 'No')) pts += 2;

  if (includes(a.q35, 'unpredictable') || includes(a.q35, 'Changes a lot')) pts += 1;

  if (isOneOf(a.q39, 'About half', 'More than half')) pts += 1;

  if (arrayIncludes(a.q38, 'Eating out with friends')) pts += 1;

  return { id: 'pay-day-phenomenon', points: pts, minimum: 6, hardRequirementMet: true };
}



function scoreCashPurist(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  const hasCash = arrayIncludes(a.q40, 'Cash');
  if (Array.isArray(a.q40) && a.q40.length === 1 && hasCash) pts += 6;
  else if (Array.isArray(a.q40) && a.q40.length === 2 && hasCash) pts += 2;

  if (isOneOf(a.q57, 'Never')) pts += 3;
  else if (isOneOf(a.q57, 'Less than once a month')) pts += 1;

  if (includes(a.q65, 'never used installment')) pts += 2;

  const q64 = parseLikert(a.q64);
  if (q64 !== null && q64 <= 2) pts += 1;

  if (isOneOf(a.q9, 'Rural (village)', 'Rural')) pts += 1;

  return { id: 'cash-purist', points: pts, minimum: 6, hardRequirementMet: hasCash };
}

function scoreSurvivor(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  if (includes(a.q28, 'disrupted my budget significantly')) pts += 5;

  const q27 = parseLikert(a.q27);
  if (q27 !== null && q27 >= 4) pts += 3;

  if (includes(a.q29, 'Below') || includes(a.q29, '15,000–29,999') || includes(a.q29, '15,000-29,999')) pts += 2;

  if (includes(a.q34, 'Below') || includes(a.q34, '2,000–4,999') || includes(a.q34, '2,000-4,999')) pts += 2;

  const q74 = parseLikert(a.q74);
  if (q74 !== null && q74 >= 4) pts += 2;

  if (arrayIncludes(a.q56, 'Ask family for extra')) pts += 1;
  if (arrayIncludes(a.q56, 'Delay a payment')) pts += 1;

  if (includes(a.q35, 'unpredictable') || includes(a.q35, 'Changes a lot')) pts += 1;

  return { id: 'survivor', points: pts, minimum: 6, hardRequirementMet: true };
}

function scoreCashHoarder(a: SurveyAnswers): ArchetypeScore {
  let pts = 0;

  if (isOneOf(a.q41, 'Yes, every month')) pts += 4;

  if (includes(a.q42, '26–50%') || includes(a.q42, '26-50%') || includes(a.q42, 'More than 50%')) pts += 4;
  else if (includes(a.q42, '11–25%') || includes(a.q42, '11-25%')) pts += 1;

  if (isOneOf(a.q76, 'Put all of it in savings')) pts += 3;

  if (isOneOf(a.q39, 'Almost none')) pts += 2;

  const q54 = parseLikert(a.q54);
  if (q54 !== null && q54 <= 2) pts += 2;

  const q59 = parseLikert(a.q59);
  if (q59 !== null && q59 <= 2) pts += 1;

  const q49 = parseLikert(a.q49);
  if (q49 !== null && q49 >= 4) pts += 1;

  return { id: 'cash-hoarder', points: pts, minimum: 6, hardRequirementMet: true };
}

// ---------------------------------------------------------------------------
// Compute impulse average (reused in multiple scorers)
// ---------------------------------------------------------------------------

function computeImpulseAvg(a: SurveyAnswers): number | null {
  const keys: Array<keyof SurveyAnswers> = ['q59', 'q60', 'q61', 'q62', 'q63', 'q64'];
  let sum = 0;
  let count = 0;
  for (const k of keys) {
    const v = parseLikert(a[k]);
    if (v !== null) { sum += v; count++; }
  }
  return count >= 4 ? Number((sum / count).toFixed(2)) : null;
}

function computeBudgetAvg(a: SurveyAnswers): { score: number | null; answered: number } {
  const straightKeys: Array<keyof SurveyAnswers> = [
    'q45', 'q46', 'q47', 'q48', 'q49', 'q50', 'q51', 'q52', 'q53'
  ];
  let sum = 0;
  let answered = 0;

  for (const k of straightKeys) {
    const v = parseLikert(a[k]);
    if (v !== null) { sum += v; answered++; }
  }

  // Q54 is reverse scored
  const q54 = parseLikert(a.q54);
  if (q54 !== null) { sum += (6 - q54); answered++; }

  const valid = answered >= 6;
  return { score: valid ? Number((sum / answered).toFixed(2)) : null, answered };
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

export interface ScoringOptions {
  budgetingThreshold?: number;
  impulseThreshold?: number;
}

export function computeSurveyResult(
  answers: SurveyAnswers,
  options?: ScoringOptions
): ScoringResult {
  const budgetThreshold = options?.budgetingThreshold ?? 3.4;
  const impulseThreshold = options?.impulseThreshold ?? 2.8;

  // --- Compute raw scores (still useful for display & fallback) ---
  const budget = computeBudgetAvg(answers);
  const budgetingScore = budget.score;
  const budgetAnswered = budget.answered;
  const isBudgetingValid = budgetAnswered >= 6;

  const impulseKeys: Array<keyof SurveyAnswers> = ['q59', 'q60', 'q61', 'q62', 'q63', 'q64'];
  let impulseAnswered = 0;
  for (const k of impulseKeys) {
    if (parseLikert(answers[k]) !== null) impulseAnswered++;
  }
  const isImpulseValid = impulseAnswered >= 4;
  const impulseScore = computeImpulseAvg(answers);

  // --- Badges (unchanged) ---
  const badges: Badge[] = [];
  if (answers.q31?.trim().toLowerCase() === 'yes') {
    badges.push(BADGES['safety-net']);
  }
  if (
    isOneOf(answers.q23, 'Regularly', 'Occasionally') ||
    includes(answers.q23, 'regularly') ||
    includes(answers.q23, 'occasionally')
  ) {
    badges.push(BADGES['secret-shopper']);
  }
  if (
    includes(answers.q65, 'more than planned')
  ) {
    badges.push(BADGES['emi-enthusiast']);
  }

  // --- Completion ---
  const totalAnswered = Object.values(answers).filter(v => v !== undefined && v !== null && v !== '').length;
  const completionPercentage = Math.min(100, Math.round((totalAnswered / 78) * 100));

  // --- HARD GATE 1: Untouchable (Q57 = "Never") ---
  const isNeverOnlineShopper = answers.q57?.trim().toLowerCase() === 'never';
  if (isNeverOnlineShopper) {
    const arch = { ...ARCHETYPES['untouchable'] };
    if (isBudgetingValid && budgetingScore !== null && budgetingScore >= budgetThreshold) {
      arch.subLine = '...and your budgeting discipline is strong too, which frankly feels unfair.';
    }
    return {
      archetype: arch,
      budgetingScore,
      impulseScore: null,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: 0,
      isBudgetingValid,
      isImpulseValid: false,
      isUntouchable: true,
      isEnigma: false,
      matchedReason: 'Never shops online (Q57 Gate)',
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // --- HARD GATE 2: Enigma (insufficient answers) ---
  if (!isBudgetingValid || !isImpulseValid) {
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

  // --- HEURISTIC SCORING: All archetypes compete simultaneously ---
  const allScores: ArchetypeScore[] = [
    scoreDelusionalCFO(answers),
    scoreHumbleMenace(answers),
    scoreFamilyPillar(answers),
    scoreHustler(answers),
    scoreBankOfFriends(answers),
    scoreWindowShopper(answers),
    scoreCartMonk(answers),
    scorePaydayPhenomenon(answers),
    scoreCashPurist(answers),
    scoreSurvivor(answers),
    scoreCashHoarder(answers),
    scoreSonOfKing(answers),
    score2amCheckout(answers),
    scorePlanThenPanic(answers),
    scoreGhostSpender(answers),
    scoreHishabi(answers),
  ];

  // Filter: only archetypes that meet minimum AND hard requirements
  const qualifying = allScores.filter(s => s.points >= s.minimum && s.hardRequirementMet);

  // Sort by points desc, then rarity desc, then tier desc
  qualifying.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const archA = ARCHETYPES[a.id];
    const archB = ARCHETYPES[b.id];
    const rarityDiff = (RARITY_ORDER[archB.rarity] || 0) - (RARITY_ORDER[archA.rarity] || 0);
    if (rarityDiff !== 0) return rarityDiff;
    return (TIER_ORDER[archB.tier] || 0) - (TIER_ORDER[archA.tier] || 0);
  });

  if (qualifying.length > 0) {
    const winner = qualifying[0];
    const arch = ARCHETYPES[winner.id];
    return {
      archetype: arch,
      budgetingScore,
      impulseScore,
      budgetingAnsweredCount: budgetAnswered,
      impulseAnsweredCount: impulseAnswered,
      isBudgetingValid,
      isImpulseValid,
      isUntouchable: false,
      isEnigma: false,
      matchedReason: `Heuristic match: ${arch.name} (${winner.points} pts, min ${winner.minimum})`,
      badges,
      answersSummary: { totalAnswered, completionPercentage },
    };
  }

  // --- FALLBACK: Base 2×2 grid ---
  const bScore = budgetingScore!;
  const iScore = impulseScore!;
  const isHighBudget = bScore >= budgetThreshold;
  const isHighImpulse = iScore >= impulseThreshold;

  let matchedArchetype: Archetype;
  let matchedReason: string;

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
