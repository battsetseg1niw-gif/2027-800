export type Role = "student" | "teacher" | "admin";

export type QuestionCategory = "Grammar" | "Vocabulary" | "Communication" | "Reading";

export interface QuestionOption {
  id: "A" | "B" | "C" | "D" | "E";
  text: string;
}

export type QuestionType = "multiple_choice" | "matching" | "fill_blank" | "drag_drop";

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface BlankItem {
  id: string;
  blankIndex: number;
  correctAnswer: string;
  acceptedAnswers?: string[];
  placeholder?: string;
  options?: string[]; // Optional dropdown/word-bank options
}

export interface DragItem {
  id: string;
  text: string;
}

export interface DropZone {
  id: string;
  label: string;
  correctItemIds: string[];
}

export interface Question {
  id: string;
  questionNumber: number;
  text: string;
  type?: QuestionType; // Defaults to "multiple_choice"
  category: QuestionCategory;
  topic: string;
  subtopic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  options: QuestionOption[];
  correctAnswer: "A" | "B" | "C" | "D" | "E" | string;
  explanation: string; // Mongolian pedagogical explanation
  readingPassage?: string; // For reading comprehension
  imageUrl?: string; // Diagram, photo, table, or chart image
  audioUrl?: string; // Audio listening task
  attachmentName?: string;
  attachmentType?: "image" | "audio" | "document";
  // Type-specific data
  matchingPairs?: MatchingPair[]; // For "matching"
  blanks?: BlankItem[]; // For "fill_blank" / completing
  dragItems?: DragItem[]; // For "drag_drop"
  dropZones?: DropZone[]; // For "drag_drop"
}

export interface Exam {
  id: string;
  title: string;
  year: number;
  variant: "A" | "B" | "C" | "D" | "Diagnostic" | "Mock";
  type: "past_paper" | "mock" | "practice" | "diagnostic" | "teacher_custom";
  totalQuestions: number;
  durationMinutes: number; // usually 80 min for ESH
  readingPassage?: string; // Overall reading passage for the exam
  questions: Question[];
  status: "draft" | "review" | "published";
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  studentCode?: string; // 6-digit student code (e.g. 104829)
  school?: string;
  grade?: string;
  classCodes?: string[]; // IDs of classes joined
  isPremium: boolean;
  premiumExpiresAt?: string;
  joinedAt: string;
  targetEshScore?: number; // target out of 800
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string; // 6-digit alphanumeric e.g. ESH-8842
  teacherId: string;
  teacherName: string;
  description: string;
  studentIds: string[];
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  classId: string;
  className: string;
  teacherId?: string;
  assignedBy?: string;
  assignedByName?: string;
  examId: string;
  examTitle: string;
  dueDate: string;
  timeLimitMinutes: number;
  assignedStudentIds?: string[]; // empty array means entire class
  completedStudentIds?: string[];
  createdAt: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  examType?: Exam["type"];
  userId: string;
  userName: string;
  studentRegNo?: string;
  studentCode?: string; // 6-digit student code
  source: "digital" | "omr_paper";
  answers: Record<number, "A" | "B" | "C" | "D" | "E" | string>;
  rawScore: number; // e.g. 42 / 50
  percentage: number;
  scaledScore: number; // Mongolian ESH standard 200 - 800
  timeSpentSeconds: number;
  categoryScores: {
    Grammar: { correct: number; total: number };
    Vocabulary: { correct: number; total: number };
    Communication: { correct: number; total: number };
    Reading: { correct: number; total: number };
  };
  wrongQuestionIds?: string[];
  submittedAt: string;
  reviewedByTeacher?: boolean;
  aiAnalysis?: OMRAnalysisReport;
}

export interface OMRAnalysisReport {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: {
    topic: string;
    subtopic?: string;
    priority: "High" | "Medium" | "Low";
    reason: string;
    suggestedAction: string;
  }[];
  detailedQuestionFeedback?: Record<number, {
    topic: string;
    status: "correct" | "incorrect";
    chosenAnswer: string;
    correctAnswer: string;
    explanation: string;
  }>;
}

export interface MistakeItem {
  id: string;
  userId: string;
  questionId: string;
  examId: string;
  examTitle: string;
  question: Question;
  userAnswer?: string;
  userLastAnswer?: string;
  correctAnswer?: string;
  date: string;
  smartFeedback?: string;
  resolved: boolean;
  mistakeCount?: number;
  masteryLevel?: "learning" | "mastered";
}

export interface Lesson {
  id: string;
  track: "Grammar" | "Vocabulary" | "Communication" | "Reading" | "Phrasal Verbs" | "Idioms" | string;
  category?: string;
  order: number;
  title: string;
  description: string;
  isFree: boolean; // First 2 per track are free, 3+ require Premium
  isLocked?: boolean;
  durationMinutes: number;
  summaryRule: string;
  detailedContent: string;
  content?: string;
  rulesTable?: { rule: string; example: string; note: string }[];
  tables?: { title: string; headers: string[]; rows: string[][] }[];
  vocabularyItems?: {
    word: string;
    pos?: string;
    mongolian: string;
    example: string;
    synonyms?: string[];
    antonyms?: string[];
    collocations?: string[];
  }[];
  tips?: string[];
  examTrapAlerts?: string[];
  samplePassage?: {
    title: string;
    text: string;
    translation?: string;
    passageAnalysis?: string;
  };
  practiceQuestions?: Question[];
  quizQuestions?: { question: string; options: { id: string; text: string }[]; correctAnswer: string; explanation: string }[];
  difficulty?: "Easy" | "Medium" | "Hard";
  videoUrl?: string;
  keyTakeaways?: string[];
  createdAt?: string;
}

export interface ActivationCode {
  id: string;
  code: string; // e.g. ESH-STU-8821
  targetRole: "student" | "teacher";
  durationDays: number; // 365
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedByName?: string;
  redeemedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  targetRole: "all" | "student" | "teacher";
  createdAt: string;
  read: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  category: "complaint" | "suggestion" | "payment" | "general";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  reply?: string;
}

export interface OMRScanRecord {
  id: string;
  examId: string;
  examTitle?: string;
  studentRegNo?: string;
  studentCode?: string; // 6-digit student code
  studentName?: string;
  variant: string;
  scannedAnswers: Record<number, { answer: string; confidence: number; ambiguous: boolean }>;
  verifiedAnswers?: Record<number, string>;
  status: "pending_verification" | "verified";
  scannedAt: string;
  score?: number;
  scaledScore?: number;
  aiAnalysis?: OMRAnalysisReport;
}

export interface DailyVocabularyItem {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "phrasal_verb" | "idiom";
  definitionMn: string;
  definitionEn: string;
  exampleSentence: string;
  exampleTranslation: string;
  synonyms?: string[];
  frequency?: "essential" | "high" | "advanced";
  topic?: string;
}

export interface DailyVocabularySet {
  id: string;
  date: string; // YYYY-MM-DD
  theme: string;
  words: DailyVocabularyItem[];
  source: "ai" | "admin" | "teacher";
  createdByName?: string;
  classId?: string;
  createdAt: string;
}

export interface WeeklyTopStudent {
  id: string;
  userId: string;
  name: string;
  school: string;
  grade: string;
  scoreGain: number; // e.g. +140
  currentScore: number; // e.g. 780
  testsCompletedThisWeek: number;
  accuracyRate: number; // e.g. 94%
  streakDays: number;
  highlightTag: string; // "Шилдэг ахиц", "Шилдэг оноо", "Идэвхтэй сурагч", "1-р байр"
  avatarUrl?: string;
  weekRange: string;
}

export interface ContactInfo {
  phone: string;
  phone2?: string;
  email: string;
  supportEmail: string;
  address: string;
  workingHours: string;
  facebook: string;
  telegram: string;
  hotline: string;
}

export interface PlanFeatureItem {
  id: string;
  name: string;
  studentIncluded: boolean;
  teacherIncluded: boolean;
  studentBadge?: string;
  teacherBadge?: string;
  isHighlight?: boolean;
}

export interface PricingSettings {
  studentYearlyPrice: number;
  teacherYearlyPrice: number;
  durationDays: number;
  studentPlanName: string;
  teacherPlanName: string;
  studentPlanDescription: string;
  teacherPlanDescription: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  paymentInstructions: string;
  facebookUrl: string;
  features: PlanFeatureItem[];
}

export interface PlatformSettings {
  platformName: string;
  examYear: number;
  termsOfService: string;
  privacyPolicy: string;
  contactInfo: ContactInfo;
  pricing: PricingSettings;
  announcement?: string;
  updatedAt: string;
}

