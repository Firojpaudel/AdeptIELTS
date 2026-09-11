import {
  loadQuestionAttempts,
  loadWritingSubmissions,
  loadSpeakingSessions,
  loadVocabCards,
  loadLearnerProfile,
  saveLearnerProfile,
  getActiveProfileId,
} from './storage';
import { getTursoClient } from './tursoClient';
import { LearnerProfile } from './types';

export interface StudyActivityEntry {
  id: string;
  date: string; // YYYY-MM-DD (local)
  time: string; // HH:MM
  type: 'question' | 'writing' | 'speaking' | 'vocab' | 'reading' | 'mock';
  title: string;
  durationMinutes: number;
  timestamp: string;
  meta?: string;
}

export interface DailyStudySummary {
  date: string; // YYYY-MM-DD
  totalEvents: number;
  totalMinutes: number;
  questions: number;
  writing: number;
  speaking: number;
  vocab: number;
  reading: number;
  mock: number;
  entries: StudyActivityEntry[];
}

export interface StreakMetrics {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  studiedToday: boolean;
  studiedYesterday: boolean;
  lastActiveDate: string | null;
}

export interface CalendarDayCell {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  hasStudied: boolean;
  summary: DailyStudySummary | null;
}

const STUDY_LOG_KEY = 'adept_ielts_study_log';

// Helper: Format local date string YYYY-MM-DD
export function formatLocalDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Helper: Parse YYYY-MM-DD to local Date
export function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Helper: Get scoped storage key
function getScopedKey(base: string, profileId?: string): string {
  const pid = profileId || getActiveProfileId();
  return `${base}_${pid}`;
}

// Load explicit study log from local storage
export function loadStudyLog(profileId?: string): StudyActivityEntry[] {
  try {
    const raw = localStorage.getItem(getScopedKey(STUDY_LOG_KEY, profileId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Save explicit study log
export function saveStudyLog(entries: StudyActivityEntry[], profileId?: string): void {
  try {
    localStorage.setItem(getScopedKey(STUDY_LOG_KEY, profileId), JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save study log', e);
  }
}

// Log a single study activity (from practice, writing, speaking, vocab, reading, or mock)
export function logStudyEvent(
  type: 'question' | 'writing' | 'speaking' | 'vocab' | 'reading' | 'mock',
  title: string,
  durationMinutes: number = 2,
  meta?: string,
  profileId?: string
): void {
  const pid = profileId || getActiveProfileId();
  if (!pid) return;

  const now = new Date();
  const dateStr = formatLocalDate(now);
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const entry: StudyActivityEntry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: dateStr,
    time: timeStr,
    type,
    title,
    durationMinutes: Math.max(1, durationMinutes),
    timestamp: now.toISOString(),
    meta,
  };

  const existing = loadStudyLog(pid);
  existing.unshift(entry);
  saveStudyLog(existing.slice(0, 500), pid);

  // Sync to Turso Edge Database asynchronously
  const turso = getTursoClient();
  if (turso) {
    turso.execute({
      sql: `INSERT OR REPLACE INTO reading_history (id, user_id, resource_id, resource_type, title, completed_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'));`,
      args: [entry.id, pid, `activity-${type}`, type, title],
    }).catch(() => {});
  }

  // Recalculate streak and update profile
  recalculateAndSaveStreak(pid);
}

// Gather all activities across the app and compile a day-by-day activity map
export function compileStudyActivityMap(profileId?: string): Record<string, DailyStudySummary> {
  const pid = profileId || getActiveProfileId();
  const map: Record<string, DailyStudySummary> = {};

  const ensureSummary = (dateStr: string): DailyStudySummary => {
    if (!map[dateStr]) {
      map[dateStr] = {
        date: dateStr,
        totalEvents: 0,
        totalMinutes: 0,
        questions: 0,
        writing: 0,
        speaking: 0,
        vocab: 0,
        reading: 0,
        mock: 0,
        entries: [],
      };
    }
    return map[dateStr];
  };

  // 1. Explicit Study Log Entries
  const logs = loadStudyLog(pid);
  for (const log of logs) {
    if (!log.date) continue;
    const s = ensureSummary(log.date);
    s.totalEvents += 1;
    s.totalMinutes += log.durationMinutes || 2;
    if (log.type === 'question') s.questions += 1;
    else if (log.type === 'writing') s.writing += 1;
    else if (log.type === 'speaking') s.speaking += 1;
    else if (log.type === 'vocab') s.vocab += 1;
    else if (log.type === 'reading') s.reading += 1;
    else if (log.type === 'mock') s.mock += 1;
    s.entries.push(log);
  }

  // 2. Question Attempts
  const attempts = loadQuestionAttempts(pid);
  for (const att of attempts) {
    const d = att.timestamp ? formatLocalDate(new Date(att.timestamp)) : '';
    if (d) {
      const s = ensureSummary(d);
      // Avoid double counting if already in logs
      const alreadyInLogs = s.entries.some(e => e.id === att.id);
      if (!alreadyInLogs) {
        s.totalEvents += 1;
        s.questions += 1;
        s.totalMinutes += Math.round((att.timeSpentSeconds || 45) / 60) || 1;
        s.entries.push({
          id: att.id,
          date: d,
          time: new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'question',
          title: `Practice Drill: ${att.skill.toUpperCase()} (${att.subskill.replace(/_/g, ' ')})`,
          durationMinutes: Math.round((att.timeSpentSeconds || 45) / 60) || 1,
          timestamp: att.timestamp,
          meta: att.isCorrect ? 'Correct' : 'Needs Review',
        });
      }
    }
  }

  // 3. Writing Submissions
  const writings = loadWritingSubmissions(pid);
  for (const w of writings) {
    const d = w.timestamp ? formatLocalDate(new Date(w.timestamp)) : '';
    if (d) {
      const s = ensureSummary(d);
      const alreadyInLogs = s.entries.some(e => e.id === w.id);
      if (!alreadyInLogs) {
        s.totalEvents += 1;
        s.writing += 1;
        const mins = Math.round((w.timeSpentSeconds || 1200) / 60) || 20;
        s.totalMinutes += mins;
        s.entries.push({
          id: w.id,
          date: d,
          time: new Date(w.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'writing',
          title: `Essay: ${w.promptTitle} (${w.wordCount} words)`,
          durationMinutes: mins,
          timestamp: w.timestamp,
          meta: w.feedback ? `Band ${w.feedback.estimated_band.toFixed(1)}` : 'Submitted',
        });
      }
    }
  }

  // 4. Speaking Sessions
  const speakings = loadSpeakingSessions(pid);
  for (const sp of speakings) {
    const d = sp.timestamp ? formatLocalDate(new Date(sp.timestamp)) : '';
    if (d) {
      const s = ensureSummary(d);
      const alreadyInLogs = s.entries.some(e => e.id === sp.id);
      if (!alreadyInLogs) {
        s.totalEvents += 1;
        s.speaking += 1;
        const mins = Math.round((sp.durationSeconds || 180) / 60) || 3;
        s.totalMinutes += mins;
        s.entries.push({
          id: sp.id,
          date: d,
          time: new Date(sp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'speaking',
          title: `Speaking Drill Part ${sp.part}: ${sp.topic}`,
          durationMinutes: mins,
          timestamp: sp.timestamp,
          meta: sp.feedback ? `Band ${sp.feedback.estimated_band.toFixed(1)}` : 'Recorded',
        });
      }
    }
  }

  // 5. Vocabulary Cards (reviews)
  const cards = loadVocabCards(pid);
  for (const c of cards) {
    if (c.lastReviewed) {
      const d = c.lastReviewed;
      const s = ensureSummary(d);
      const alreadyLogged = s.entries.some(e => e.id === `vocab-${c.id}`);
      if (!alreadyLogged) {
        s.totalEvents += 1;
        s.vocab += 1;
        s.totalMinutes += 1;
        s.entries.push({
          id: `vocab-${c.id}`,
          date: d,
          time: '12:00',
          type: 'vocab',
          title: `Vocabulary Review: "${c.word}" (${c.repetitions} reps)`,
          durationMinutes: 1,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // Sort entries inside each day by timestamp descending
  Object.values(map).forEach(summary => {
    summary.entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  });

  return map;
}

// Calculate streak statistics based on activity map
export function computeStreakMetrics(activityMap: Record<string, DailyStudySummary>): StreakMetrics {
  const dates = Object.keys(activityMap)
    .filter(d => activityMap[d].totalEvents > 0)
    .sort(); // Ascending

  const totalActiveDays = dates.length;
  if (totalActiveDays === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      studiedToday: false,
      studiedYesterday: false,
      lastActiveDate: null,
    };
  }

  const todayStr = formatLocalDate(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterdayDate);

  const studiedToday = dates.includes(todayStr);
  const studiedYesterday = dates.includes(yesterdayStr);
  const lastActiveDate = dates[dates.length - 1];

  // Calculate Longest Streak in history
  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = parseLocalDate(dates[i - 1]);
    const curr = parseLocalDate(dates[i]);
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentRun += 1;
      if (currentRun > longestStreak) longestStreak = currentRun;
    } else if (diffDays > 1) {
      currentRun = 1;
    }
  }

  // Calculate Current Active Streak
  // If studied today, start from today and walk backwards.
  // If studied yesterday, streak is alive! Walk backwards starting from yesterday.
  // If neither today nor yesterday, streak is broken = 0.
  let currentStreak = 0;

  if (studiedToday || studiedYesterday) {
    let checkDate = studiedToday ? new Date() : yesterdayDate;
    currentStreak = 0;

    while (true) {
      const checkStr = formatLocalDate(checkDate);
      if (dates.includes(checkStr)) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays,
    studiedToday,
    studiedYesterday,
    lastActiveDate,
  };
}

// Recalculate streak and update LearnerProfile
export function recalculateAndSaveStreak(profileId?: string): StreakMetrics {
  const pid = profileId || getActiveProfileId();
  const profile = loadLearnerProfile(pid);
  const map = compileStudyActivityMap(pid);
  const metrics = computeStreakMetrics(map);

  if (profile) {
    const updated: LearnerProfile = {
      ...profile,
      streak: metrics.currentStreak,
      lastActiveDate: metrics.lastActiveDate || profile.lastActiveDate || formatLocalDate(),
    };
    saveLearnerProfile(updated);
  }

  return metrics;
}

// Generate complete calendar grid (35 or 42 cells) for any month
export function getMonthCalendarGrid(
  year: number,
  monthIndex: number, // 0 = Jan, 8 = Sep, 11 = Dec
  activityMap: Record<string, DailyStudySummary>
): CalendarDayCell[] {
  const todayStr = formatLocalDate(new Date());
  const cells: CalendarDayCell[] = [];

  // First day of target month
  const firstDay = new Date(year, monthIndex, 1);
  // Total days in target month
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  // Day of week for 1st of month: 0 (Sun) to 6 (Sat)
  // We want Monday as day 0: 0=Mon, 1=Tue, ..., 6=Sun
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

  // Total days in previous month
  const prevMonthTotalDays = new Date(year, monthIndex, 0).getDate();

  // 1. Fill leading days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevDate = new Date(year, monthIndex - 1, dayNum);
    const dateStr = formatLocalDate(prevDate);
    const summary = activityMap[dateStr] || null;

    cells.push({
      date: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture: prevDate > new Date(),
      hasStudied: Boolean(summary && summary.totalEvents > 0),
      summary,
    });
  }

  // 2. Fill days of current month
  for (let day = 1; day <= totalDays; day++) {
    const currDate = new Date(year, monthIndex, day);
    const dateStr = formatLocalDate(currDate);
    const summary = activityMap[dateStr] || null;

    cells.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isFuture: currDate > new Date(),
      hasStudied: Boolean(summary && summary.totalEvents > 0),
      summary,
    });
  }

  // 3. Fill trailing days from next month to complete standard 35 or 42 grid
  const remainingCells = (cells.length <= 35 ? 35 : 42) - cells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextDate = new Date(year, monthIndex + 1, day);
    const dateStr = formatLocalDate(nextDate);
    const summary = activityMap[dateStr] || null;

    cells.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture: nextDate > new Date(),
      hasStudied: Boolean(summary && summary.totalEvents > 0),
      summary,
    });
  }

  return cells;
}
