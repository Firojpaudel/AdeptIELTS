import { LearnerProfile, QuestionAttempt, VocabularyCard } from './types';

/**
 * Calculates mastery score (0..1) as per Blueprint Specification:
 * mastery = 0.45 * recent_accuracy + 0.25 * overall_accuracy + 0.15 * consistency + 0.15 * confidence
 */
export function calculateMastery(
  attempts: number,
  correct: number,
  recentAccuracy: number,
  confidence: number // 0..1 (low: 0.33, med: 0.66, high: 1.0)
): number {
  if (attempts === 0) return 0.5; // neutral baseline

  const overallAccuracy = correct / attempts;
  
  // Consistency heuristic: higher if sample size > 5 and variance between overall and recent is low
  const consistency = Math.max(0, 1 - Math.abs(recentAccuracy - overallAccuracy));

  const score =
    0.45 * recentAccuracy +
    0.25 * overallAccuracy +
    0.15 * consistency +
    0.15 * confidence;

  return Math.min(1, Math.max(0, Number(score.toFixed(3))));
}

export interface Recommendation {
  id: string;
  type: 'remediation' | 'spaced_review' | 'weakness_drill' | 'lesson' | 'timed_challenge';
  skill: 'reading' | 'listening' | 'writing' | 'speaking' | 'grammar' | 'vocabulary';
  subskill: string;
  title: string;
  reason: string;
  priority: 'urgent' | 'high' | 'normal';
  targetMinutes: number;
}

/**
 * Selects next optimal activity using priority rules from 06_LEARNING_ENGINE.md
 */
export function getRecommendedActivities(
  profile: LearnerProfile,
  attempts: QuestionAttempt[],
  vocabCards: VocabularyCard[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. Check for repeated recent errors (last 10 attempts)
  const recentAttempts = attempts.slice(-10);
  const errorMap: Record<string, { errors: number; skill: any }> = {};
  for (const att of recentAttempts) {
    if (!att.isCorrect) {
      if (!errorMap[att.subskill]) {
        errorMap[att.subskill] = { errors: 0, skill: att.skill };
      }
      errorMap[att.subskill].errors++;
    }
  }

  for (const [subskill, data] of Object.entries(errorMap)) {
    if (data.errors >= 2) {
      recommendations.push({
        id: `rec-err-${subskill}`,
        type: 'remediation',
        skill: data.skill,
        subskill,
        title: `Remediate: ${formatSubskillName(subskill)}`,
        reason: `${data.errors} recent mistakes detected. Target the underlying misconception now.`,
        priority: 'urgent',
        targetMinutes: 10,
      });
    }
  }

  // 2. Check for overdue Vocabulary Spaced Review
  const today = new Date().toISOString().split('T')[0];
  const overdueCards = vocabCards.filter(c => c.nextReviewDate <= today);
  if (overdueCards.length > 0) {
    recommendations.push({
      id: 'rec-vocab-review',
      type: 'spaced_review',
      skill: 'vocabulary',
      subskill: 'collocations',
      title: `Spaced Review: ${overdueCards.length} Vocabulary Items`,
      reason: 'Scheduled memory retention window open. Review now to consolidate long-term recall.',
      priority: 'high',
      targetMinutes: Math.min(15, overdueCards.length * 1.5),
    });
  }

  // 3. Check for lowest subskill mastery
  const masteryEntries = Object.entries(profile.subskillMastery);
  masteryEntries.sort((a, b) => a[1].mastery - b[1].mastery);

  if (masteryEntries.length > 0 && masteryEntries[0][1].mastery < 0.65) {
    const [weakestSubskill, stats] = masteryEntries[0];
    const skill = getSkillForSubskill(weakestSubskill);
    recommendations.push({
      id: `rec-mastery-${weakestSubskill}`,
      type: 'weakness_drill',
      skill,
      subskill: weakestSubskill,
      title: `Target Weakness: ${formatSubskillName(weakestSubskill)}`,
      reason: `Current mastery is ${Math.round(stats.mastery * 100)}%. Targeted drill to bridge gap toward Band ${profile.targetBand}.`,
      priority: 'high',
      targetMinutes: 15,
    });
  }

  // 4. Default high-yield recommendations if empty
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-default-writing',
      type: 'timed_challenge',
      skill: 'writing',
      subskill: 'task2_argument',
      title: 'Writing Task 2: Academic Essay Builder',
      reason: 'Frequent practice of Task Response and Cohesion is the fastest driver of overall band growth.',
      priority: 'normal',
      targetMinutes: 25,
    });
    recommendations.push({
      id: 'rec-default-reading',
      type: 'timed_challenge',
      skill: 'reading',
      subskill: 'true_false_not_given',
      title: 'Reading Speed & TFNG Precision Set',
      reason: 'Keep reading comprehension and evidence location sharp under strict timed conditions.',
      priority: 'normal',
      targetMinutes: 15,
    });
  }

  return recommendations;
}

/**
 * Spaced Repetition interval scheduler:
 * Intervals: 1 day -> 3 days -> 7 days -> 14 days -> 30 days
 */
export function getNextReviewDate(
  currentInterval: number,
  quality: 'again' | 'hard' | 'good' | 'easy'
): { interval: number; nextDate: string } {
  let nextInterval = currentInterval;

  switch (quality) {
    case 'again':
      nextInterval = 1;
      break;
    case 'hard':
      nextInterval = Math.max(1, Math.round(currentInterval * 1.2));
      break;
    case 'good':
      if (currentInterval === 0 || currentInterval === 1) nextInterval = 3;
      else if (currentInterval <= 3) nextInterval = 7;
      else if (currentInterval <= 7) nextInterval = 14;
      else nextInterval = 30;
      break;
    case 'easy':
      if (currentInterval <= 1) nextInterval = 4;
      else if (currentInterval <= 3) nextInterval = 10;
      else if (currentInterval <= 7) nextInterval = 21;
      else nextInterval = 45;
      break;
  }

  const d = new Date();
  d.setDate(d.getDate() + nextInterval);
  return {
    interval: nextInterval,
    nextDate: d.toISOString().split('T')[0],
  };
}

function formatSubskillName(subskill: string): string {
  return subskill
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getSkillForSubskill(subskill: string): any {
  if (subskill.includes('tfng') || subskill.includes('heading') || subskill.includes('reading') || subskill.includes('summary')) return 'reading';
  if (subskill.includes('listening') || subskill.includes('audio')) return 'listening';
  if (subskill.includes('task1') || subskill.includes('task2') || subskill.includes('essay') || subskill.includes('writing')) return 'writing';
  if (subskill.includes('speaking') || subskill.includes('fluency')) return 'speaking';
  if (subskill.includes('vocab')) return 'vocabulary';
  return 'grammar';
}
