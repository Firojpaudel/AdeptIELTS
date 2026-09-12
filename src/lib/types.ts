export type SkillType = 'reading' | 'listening' | 'writing' | 'speaking' | 'grammar' | 'vocabulary';

export type TestType = 'academic' | 'general';

export type QuestionType =
  | 'true_false_not_given'
  | 'yes_no_not_given'
  | 'matching_headings'
  | 'multiple_choice'
  | 'sentence_completion'
  | 'summary_completion'
  | 'diagram_labelling'
  | 'short_answer';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'upper_intermediate' | 'advanced';

export interface LearnerProfile {
  id: string;
  displayName: string;
  avatar: string;
  targetBand: number;
  currentEstimatedBand: number;
  testType: TestType;
  examDate: string; // YYYY-MM-DD
  availableDailyMinutes: number;
  skillBands: {
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
  };
  subskillMastery: Record<string, {
    attempts: number;
    correct: number;
    recentAccuracy: number;
    confidence: number;
    mastery: number; // 0..1
    lastPracticed: string;
  }>;
  streak: number;
  lastActiveDate: string;
  totalStudyMinutes: number;
  onboardingCompleted: boolean;
}

export interface Question {
  id: string;
  skill: SkillType;
  subskill: string;
  questionType: QuestionType;
  testType: TestType;
  difficulty: DifficultyLevel;
  targetBand: number;
  topic: string;
  passageId?: string;
  passageTitle?: string;
  passageText?: string;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  evidenceSpan?: string;
  explanation: string;
}

export interface QuestionAttempt {
  id: string;
  questionId: string;
  skill: SkillType;
  subskill: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  confidenceRating?: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface LexicalUpgrade {
  original: string;
  upgrade: string;
  context: string;
  category?: 'academic_vocabulary' | 'idiomatic_collocation' | 'precision_verb' | 'discourse_marker';
}

export interface SentenceCorrection {
  original: string;
  corrected: string;
  explanation: string;
  type?: 'grammar' | 'coherence' | 'lexical' | 'task_response' | 'fluency';
}

export interface WritingFeedback {
  estimated_band: number;
  criteria: {
    task_response: number;
    coherence: number;
    lexical_resource: number;
    grammar: number;
  };
  examiner_summary?: string;
  strengths: string[];
  what_went_right?: string[];
  what_went_wrong?: string[];
  issues: {
    quote?: string;
    problem: string;
    suggestion: string;
    criterion: 'task_response' | 'coherence' | 'lexical_resource' | 'grammar';
  }[];
  lexical_upgrades?: LexicalUpgrade[];
  sentence_corrections?: SentenceCorrection[];
  priority_actions: string[];
  rewrite_exercises: {
    original: string;
    instruction: string;
    model_revision: string;
  }[];
  examiner_model_answer?: string;
}

export interface WritingSubmission {
  id: string;
  taskType: 'task1' | 'task2';
  promptTitle: string;
  promptText: string;
  essayText: string;
  wordCount: number;
  timeSpentSeconds: number;
  timestamp: string;
  feedback?: WritingFeedback;
}

export interface SpeakingFeedback {
  estimated_band: number;
  criteria: {
    fluency_coherence: number;
    lexical_resource: number;
    grammatical_range: number;
    pronunciation: number;
  };
  examiner_summary?: string;
  strengths?: string[];
  what_went_right?: string[];
  what_went_wrong?: string[];
  observations: {
    fluency: string;
    vocabulary: string;
    grammar: string;
    pronunciation: string;
  };
  transcript_annotations: {
    snippet: string;
    type: 'grammar' | 'vocab' | 'fluency';
    comment: string;
  }[];
  lexical_upgrades?: LexicalUpgrade[];
  speech_flow_corrections?: SentenceCorrection[];
  targeted_drills: string[];
  examiner_model_answer?: string;
}

export interface SpeakingPrompt {
  id: string;
  part: 1 | 2 | 3;
  topic: string;
  prompt: string;
  bulletPoints?: string[];
  prepSeconds: number;
  preparationSeconds: number;
  talkSeconds: number;
  speakingSeconds: number;
  part3FollowUps?: string[];
  suggestedPhrases?: string[];
}

export interface SpeakingSession {
  id: string;
  part: 1 | 2 | 3;
  topic: string;
  prompt: string;
  bulletPoints?: string[];
  transcript: string;
  durationSeconds: number;
  timestamp: string;
  feedback?: SpeakingFeedback;
}

export interface VocabularyCard {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  collocations: string[];
  ieltsContext: string;
  topic: string;
  targetBand: number;
  repetitions: number;
  intervalDays: number;
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewed?: string;
}

export interface Lesson {
  id: string;
  skill: SkillType;
  title: string;
  category: string;
  estimatedMinutes: number;
  overview: string;
  keyTakeaways: string[];
  content: string[];
  checkQuestions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    rationale: string;
  }[];
}

export interface ResourceSection {
  title: string;
  content: string[];
  callout?: string;
  examples?: string[];
  keyRules?: string[];
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  url: string;
  skill: SkillType | 'all';
  level: string;
  type: string;
  authority: 'official' | 'official_provider' | 'trusted_education' | 'supplementary';
  usageMode: 'external_link' | 'permitted_embed' | 'licensed_content' | 'original_content' | 'reference_only';
  description: string;
  verifiedFree: boolean;
  readingTimeMinutes?: number;
  fullGuide?: {
    summary: string;
    sections: ResourceSection[];
    modelAnswer?: {
      prompt: string;
      response: string;
      examinerAnalysis: string;
    };
    actionChecklist?: string[];
  };
}

export interface IELTSBook {
  id: string;
  identifier: string;
  title: string;
  author: string;
  publisher: string;
  year?: number;
  skill: SkillType | 'all';
  category: string;
  level: string;
  downloads: string;
  description: string;
  pdfFileName?: string;
  quality?: 'vector_hd' | 'standard_ocr';
}

export interface AISettings {
  provider: 'groq' | 'gemini' | 'openrouter' | 'anthropic' | 'openai' | 'cloudflare' | 'offline_deterministic';
  apiKey: string;
  modelOverride?: string;
  workerUrl: string;
  tokenSavingMode: boolean; // enables aggressive prompt compression and deterministic caching
}

export interface ReadResourceRecord {
  id: string;
  userId: string;
  resourceId: string;
  resourceType: 'book' | 'guide' | 'lesson';
  title: string;
  completedAt: string;
}

export interface ExamScoreRecord {
  id: string;
  userId: string;
  examType: 'full_mock' | 'reading_test' | 'writing_task' | 'speaking_interview';
  overallBand: number;
  readingBand?: number;
  writingBand?: number;
  listeningBand?: number;
  speakingBand?: number;
  rawScore?: number;
  totalQuestions?: number;
  timeSpentSeconds?: number;
  details?: string;
  createdAt: string;
}
