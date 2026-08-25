export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface SurveyAnswers {
  // Section A
  q1?: string; // Enrolled student (Yes/No)
  q2?: string; // Institution type
  q3?: string; // University name
  q4?: string; // Level of study
  q5?: string; // Campus city/district
  q6?: string; // Field of study

  // Section B
  q7?: string | number; // Age
  q8?: string; // Gender
  q9?: string; // Grew up location
  q10?: string; // Parent education
  q11?: string; // Father occupation
  q12?: string; // Mother occupation
  q13?: string; // Siblings count
  q14?: string; // Birth order

  // Section C
  q15?: string; // Living arrangement
  q16?: string; // Hall attachment
  q17?: string; // Moved away
  q18?: string; // Room share count
  q19?: string; // Living duration
  q20?: string; // Meal source
  q21?: string; // Spending decider
  q22?: string; // Family asks spending frequency
  q23?: string; // Hide purchases from family (Regularly / Occasionally / No...)
  q24?: string; // Monthly living cost
  q25?: string; // Living away changed necessary vs optional

  // Section D
  q26?: string; // Tuition cost
  q27?: LikertValue | number; // Education cost strain (1..5)
  q28?: string; // Session jam disrupted budget

  // Section E
  q29?: string; // Household income
  q30?: string | number; // Dependents count
  q31?: string; // Supports family financially (Yes/No)
  q32?: string; // Family support amount

  // Section F
  q33?: string[]; // Income sources (array)
  q34?: string; // Monthly available money
  q35?: string; // Predictability of amount
  q36?: string; // Accommodation paid from Q34 or separate
  q37?: string; // Spend more right after receiving money

  // Section G
  q38?: string[]; // Top 3 spending categories
  q39?: string; // Portion to non-essentials
  q40?: string[]; // Payment methods (Cash, bKash, etc.)
  q41?: string; // Keep money aside as savings
  q42?: string; // Share saved (1-10%, 11-25%, 26-50%, >50%)
  q43?: string; // Lending with friends (Yes frequently and don't track...)
  q44?: string; // Peer pressure spending

  // Section H: Budgeting Discipline (Q45..Q54)
  q45?: LikertValue | number; // Set budget
  q46?: LikertValue | number; // Stick to budget
  q47?: LikertValue | number; // Compare prices
  q48?: LikertValue | number; // Track daily spending
  q49?: LikertValue | number; // Money for emergencies
  q50?: LikertValue | number; // Pay bills on time
  q51?: LikertValue | number; // Plan spending in advance
  q52?: LikertValue | number; // Avoid borrowing
  q53?: LikertValue | number; // Confident managing money
  q54?: LikertValue | number; // Run out before month ends (reverse-scored)
  q55?: string; // ৳500 spending accuracy
  q56?: string[]; // Short of money action

  // Section I: Online Impulse Buying (Q57..Q73)
  q57?: string; // Online shopping frequency (Never / ...)
  q58?: string[]; // Online shopping platforms
  q59?: LikertValue | number; // Buy online without planning
  q60?: LikertValue | number; // Flash sales urgency
  q61?: LikertValue | number; // Late night orders
  q62?: LikertValue | number; // Free delivery adds extra items
  q63?: LikertValue | number; // Regret online purchases
  q64?: LikertValue | number; // Social media influences
  q65?: string; // BNPL/installment use
  q66?: string; // Add to cart and wait
  q67?: string; // Follow deal pages
  q68?: string; // Unplanned online purchases count per month
  q69?: string; // Average unplanned spend per order
  q70?: string[]; // Categories impulse bought
  q71?: string; // Daily time scrolling shopping apps
  q72?: string; // Peer vs Ad influence
  q73?: string; // Spend more/less/same compared to friends

  // Section J & K
  q74?: LikertValue | number; // Stressed about money
  q75?: LikertValue | number; // Family background influences spending
  q76?: string; // Windfall ৳5,000 action
  q77?: string; // Last bought online text
  q78?: string; // Additional context
}

export type ArchetypeTier = 'base' | 'contradiction' | 'lifestyle' | 'special' | 'bonus';

export interface Archetype {
  id: string;
  name: string;
  banglaName: string;
  tagline: string;
  banglaTagline: string;
  blurb: string;
  shareLine: string;
  accentColor: string;
  imagePath: string;
  tier: ArchetypeTier;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Special';
  subLine?: string;
  isDignified?: boolean; // Respectful tone, no mockery (e.g. Family Pillar, Survivor)
}

export interface Badge {
  id: string;
  name: string;
  banglaName: string;
  icon: string;
  description: string;
}

export interface ScoringResult {
  archetype: Archetype;
  budgetingScore: number | null;
  impulseScore: number | null;
  budgetingAnsweredCount: number;
  impulseAnsweredCount: number;
  isBudgetingValid: boolean;
  isImpulseValid: boolean;
  isUntouchable: boolean;
  isEnigma: boolean;
  matchedReason: string;
  badges: Badge[];
  answersSummary: {
    totalAnswered: number;
    completionPercentage: number;
  };
}
