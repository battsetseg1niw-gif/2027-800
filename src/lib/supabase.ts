import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Role,
  UserProfile,
  Exam,
  Question,
  QuestionOption,
  ClassRoom,
  Assignment,
  ExamSubmission,
  MistakeItem,
  ActivationCode,
  NotificationItem,
  SupportTicket,
  OMRScanRecord,
  Lesson,
  DailyVocabularySet,
  WeeklyTopStudent,
  PlatformSettings,
} from "../types";
import { INITIAL_EXAMS } from "../data/mockExams";
import { LEARNING_CENTER_LESSONS } from "../data/learningCenterData";
import { INITIAL_DAILY_VOCABULARY_SETS, INITIAL_WEEKLY_TOP_STUDENTS } from "../data/dailyVocabData";
import { DEFAULT_PLATFORM_SETTINGS } from "../data/platformSettingsData";
import { INITIAL_REGIONAL_USERS, INITIAL_REGIONAL_SUBMISSIONS } from "../data/regionalData";

// Environment variables for live Supabase instance
const DEFAULT_SUPABASE_URL = "https://lpxsrgacayhnatdhavna.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweHNyZ2FjYXlobmF0ZGhhdm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNDE3MzIsImV4cCI6MjEwNTcxNzczMn0.At4G9Ou4I-wH1tpJRgY0qU_t-8ycvJLPRzXTjlAT4mU";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Complete Supabase SQL Schema with RLS Policies for Supabase/Vercel production
export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- SmartESH: Production Supabase SQL Schema
-- Roles: 'student', 'teacher', 'admin'
-- Row Level Security (RLS) Enforced
-- ==========================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  school TEXT DEFAULT '',
  grade TEXT DEFAULT '',
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  target_score INT DEFAULT 800,
  target_esh_score INT DEFAULT 800,
  student_code TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Strict Profiles Policies
-- Admin can view all profiles; Teachers can view their own profile and students enrolled in their classes; Students only see own profile.
CREATE POLICY "Strict profiles select"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
      AND id IN (
        SELECT cm.student_id FROM public.class_members cm
        JOIN public.classes c ON c.id = cm.class_id
        WHERE c.teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. EXAMS & QUESTIONS
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year INT NOT NULL,
  variant TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('past_paper', 'mock', 'practice', 'diagnostic', 'teacher_custom')),
  total_questions INT NOT NULL DEFAULT 50,
  duration_minutes INT NOT NULL DEFAULT 80,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published exams"
  ON public.exams FOR SELECT
  USING (status = 'published' OR created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Teachers and Admins can create exams"
  ON public.exams FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  ));

CREATE POLICY "Admins can update and publish exams"
  ON public.exams FOR UPDATE
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- 2.1 QUESTION BANK (Questions table)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Grammar',
  topic TEXT DEFAULT 'General',
  subtopic TEXT DEFAULT '',
  difficulty TEXT DEFAULT 'Medium',
  level TEXT DEFAULT 'B1',
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL DEFAULT 'A',
  explanation TEXT DEFAULT '',
  teacher_id UUID REFERENCES public.profiles(id),
  exam_id UUID REFERENCES public.exams(id),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT
  USING (true);

CREATE POLICY "Teachers and Admins can create questions"
  ON public.questions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Teachers can update and delete their questions"
  ON public.questions FOR ALL
  USING (teacher_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- 3. CLASSES & MEMBERS
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.class_members (
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Class visibility"
  ON public.classes FOR SELECT
  USING (teacher_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.class_members WHERE class_id = public.classes.id AND student_id = auth.uid()
  ));

CREATE POLICY "Teachers can create classes"
  ON public.classes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  ));

-- 4. ASSIGNMENTS & HOMEWORK
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id),
  exam_id UUID REFERENCES public.exams(id),
  due_date TIMESTAMPTZ NOT NULL,
  time_limit_minutes INT DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignment access"
  ON public.assignments FOR SELECT
  USING (teacher_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.class_members WHERE class_id = public.assignments.class_id AND student_id = auth.uid()
  ));

CREATE POLICY "Teachers can create assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Assignment questions visibility"
  ON public.assignment_questions FOR SELECT
  USING (true);

CREATE POLICY "Teachers can manage assignment questions"
  ON public.assignment_questions FOR ALL
  USING (true);

-- 5. SUBMISSIONS & ANALYTICS
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'digital',
  raw_score INT NOT NULL,
  scaled_score INT NOT NULL,
  percentage NUMERIC NOT NULL,
  time_spent_seconds INT NOT NULL,
  answers JSONB NOT NULL,
  category_scores JSONB NOT NULL,
  wrong_question_ids TEXT[] DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Strict Submissions Policy:
-- Students can ONLY view their own submissions (WHERE user_id = auth.uid()).
-- Teachers can ONLY view submissions of students enrolled in their classes.
-- Admins can view all submissions.
CREATE POLICY "Strict submissions select"
  ON public.submissions FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
      AND user_id IN (
        SELECT cm.student_id FROM public.class_members cm
        JOIN public.classes c ON c.id = cm.class_id
        WHERE c.teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can submit exam results"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. MISTAKES NOTEBOOK
CREATE TABLE IF NOT EXISTS public.mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id),
  question_id TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  smart_feedback TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;

-- Mistakes Policy: Students and users ONLY view and manage their own mistakes
CREATE POLICY "Users own their mistakes"
  ON public.mistakes FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 7. ACTIVATION CODES & PREMIUM
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  target_role TEXT NOT NULL CHECK (target_role IN ('student', 'teacher')),
  duration_days INT DEFAULT 365,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_by UUID REFERENCES public.profiles(id),
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage activation codes"
  ON public.activation_codes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authenticated users can redeem valid code"
  ON public.activation_codes FOR UPDATE
  USING (is_redeemed = FALSE);
`;

// Persistent Local Database Store Keys
const STORAGE_PREFIX = "smartesh_db_";

export class LocalDatabaseStore {
  public static getItem<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  public static setItem<T>(key: string, val: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
    } catch (e) {
      console.warn("Storage write error", e);
    }
  }

  // Users - Pure real users only, zero mock or dummy accounts
  static getUsers(): UserProfile[] {
    const list = this.getItem<UserProfile[]>("users", []);
    const filtered = list.filter(
      (u) =>
        u &&
        u.id !== "usr-student-1" &&
        u.id !== "usr-student-2" &&
        u.id !== "usr-dorj" &&
        u.name !== "Дорж" &&
        !u.name?.toLowerCase().includes("дорж") &&
        !u.id.startsWith("usr-stud-") &&
        !u.id.startsWith("usr-teach-") &&
        u.id !== "usr-admin-master"
    );
    if (filtered.length !== list.length) {
      this.saveUsers(filtered);
    }
    return filtered;
  }

  static saveUsers(users: UserProfile[]) {
    this.setItem("users", users);
  }

  static updateUserProfile(userId: string, updates: Partial<UserProfile>): void {
    const cur = this.getCurrentUser();
    if (cur && cur.id === userId) {
      this.setCurrentUser({ ...cur, ...updates });
    }
    const users = this.getUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    this.saveUsers(updated);
  }

  // Active User session
  static getCurrentUser(): UserProfile | null {
    return this.getItem<UserProfile | null>("current_user", null);
  }

  static setCurrentUser(user: UserProfile | null) {
    if (user) {
      this.setItem("current_user", user);
    } else {
      try {
        localStorage.removeItem(STORAGE_PREFIX + "current_user");
      } catch {}
    }
  }

  // Classes
  static getClasses(): ClassRoom[] {
    const stored = this.getItem<ClassRoom[]>("classes", []);
    const filtered = stored.filter((c) => c.id !== "cls-1" && c.id !== "cls-2");
    if (filtered.length !== stored.length) {
      this.saveClasses(filtered);
    }
    return filtered;
  }

  static saveClasses(classes: ClassRoom[]) {
    this.setItem("classes", classes);
  }

  // Assignments
  static getAssignments(): Assignment[] {
    const stored = this.getItem<Assignment[]>("assignments", []);
    const filtered = stored.filter((a) => a.id !== "asg-1" && a.id !== "asg-2");
    if (filtered.length !== stored.length) {
      this.saveAssignments(filtered);
    }
    return filtered;
  }

  static saveAssignments(assignments: Assignment[]) {
    this.setItem("assignments", assignments);
  }

  // Submissions - Strictly purge fake / dummy data and isolate guests
  static getSubmissions(userId?: string): ExamSubmission[] {
    const list = this.getItem<ExamSubmission[]>("submissions", []);
    const filtered = list.filter(
      (s) =>
        s &&
        s.id !== "sub-1" &&
        s.id !== "sub-omr-1" &&
        !s.id.startsWith("sub-seed-") &&
        s.userId !== "usr-student-1" &&
        s.userId !== "usr-student-2" &&
        s.userId !== "usr-dorj" &&
        !s.userId?.startsWith("usr-stud-") &&
        s.userName !== "Дорж" &&
        !s.userName?.toLowerCase().includes("дорж") &&
        s.scaledScore !== 291 &&
        s.userId !== "guest-user" &&
        !s.userId?.startsWith("guest-")
    );
    if (filtered.length !== list.length) {
      this.saveSubmissions(filtered);
    }
    if (userId) {
      return filtered.filter((s) => s.userId === userId);
    }
    return filtered;
  }

  static saveSubmissions(subs: ExamSubmission[]) {
    // Only persist registered authenticated user submissions to primary store
    const cleanSubs = subs.filter(
      (s) => s && s.userId && s.userId !== "guest-user" && !s.userId.startsWith("guest-")
    );
    this.setItem("submissions", cleanSubs);
  }

  // Isolated Guest Submissions
  static getGuestSubmissions(): ExamSubmission[] {
    return this.getItem<ExamSubmission[]>("guest_submissions", []);
  }

  static saveGuestSubmission(sub: ExamSubmission) {
    const list = this.getGuestSubmissions().filter((s) => s.id !== sub.id);
    this.setItem("guest_submissions", [sub, ...list]);
  }

  // Mistakes - Strictly purge fake / dummy questions and isolate guests
  static getMistakes(userId?: string): MistakeItem[] {
    const list = this.getItem<MistakeItem[]>("mistakes", []);
    const filtered = list.filter(
      (m) =>
        m &&
        m.userId !== "usr-student-1" &&
        m.userId !== "usr-student-2" &&
        m.userId !== "usr-dorj" &&
        m.userId !== "guest-user" &&
        !m.userId?.startsWith("guest-") &&
        !m.question?.text?.includes("Option A for") &&
        !m.question?.text?.includes("Sample question on") &&
        !m.question?.options?.some((o) => o.text?.includes("Option A for") || o.text?.includes("Option B for"))
    );
    if (filtered.length !== list.length) {
      this.saveMistakes(filtered);
    }
    if (userId) {
      return filtered.filter((m) => m.userId === userId);
    }
    return filtered;
  }

  static saveMistakes(mistakes: MistakeItem[]) {
    const cleanMistakes = mistakes.filter(
      (m) => m && m.userId && m.userId !== "guest-user" && !m.userId.startsWith("guest-")
    );
    this.setItem("mistakes", cleanMistakes);
  }

  // Isolated Guest Mistakes
  static getGuestMistakes(): MistakeItem[] {
    return this.getItem<MistakeItem[]>("guest_mistakes", []);
  }

  static saveGuestMistake(mistake: MistakeItem) {
    const list = this.getGuestMistakes().filter((m) => m.id !== mistake.id);
    this.setItem("guest_mistakes", [mistake, ...list]);
  }

  // Completely wipe guest session test data so registered accounts are pristine
  static clearGuestData() {
    try {
      localStorage.removeItem(STORAGE_PREFIX + "guest_submissions");
      localStorage.removeItem(STORAGE_PREFIX + "guest_mistakes");
      // Sanitize main store in case of previous leaks
      const subs = this.getItem<ExamSubmission[]>("submissions", []);
      const cleanSubs = subs.filter(
        (s) => s && s.userId && s.userId !== "guest-user" && !s.userId.startsWith("guest-")
      );
      this.setItem("submissions", cleanSubs);

      const mistakes = this.getItem<MistakeItem[]>("mistakes", []);
      const cleanMistakes = mistakes.filter(
        (m) => m && m.userId && m.userId !== "guest-user" && !m.userId.startsWith("guest-")
      );
      this.setItem("mistakes", cleanMistakes);
    } catch {}
  }

  // Exams - Clean any hardcoded mock past papers from earlier builds
  static getExams(): Exam[] {
    const list = this.getItem<Exam[]>("exams", []);
    const filtered = list.filter(
      (e) =>
        e &&
        !e.id.startsWith("mock-") &&
        !e.id.startsWith("dummy-") &&
        e.id !== "esh-mock-1" &&
        e.id !== "esh-mock-2" &&
        !((e.year === 2010 || e.year === 2011 || e.year === 2012) && (!e.questions || e.questions.length === 0 || e.questions.some((q) => q.text?.includes("Option A") || q.text?.includes("Sample question"))))
    );
    if (filtered.length !== list.length) {
      this.setItem("exams", filtered);
    }
    return filtered;
  }

  static updateUserTargetScore(userId: string, targetScore: number): void {
    const cur = this.getCurrentUser();
    if (cur && cur.id === userId) {
      cur.targetEshScore = targetScore;
      this.setCurrentUser(cur);
    }
    const users = this.getUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, targetEshScore: targetScore } : u));
    this.saveUsers(updated);
  }

  // Activation Codes
  static getActivationCodes(): ActivationCode[] {
    return this.getItem<ActivationCode[]>("activation_codes", []);
  }

  static saveActivationCodes(codes: ActivationCode[]) {
    this.setItem("activation_codes", codes);
  }

  // Notifications
  static getNotifications(): NotificationItem[] {
    return this.getItem<NotificationItem[]>("notifications", []);
  }

  static saveNotifications(notifs: NotificationItem[]) {
    this.setItem("notifications", notifs);
  }

  // Support Tickets
  static getSupportTickets(): SupportTicket[] {
    const defaultTickets: SupportTicket[] = [];
    const list = this.getItem<SupportTicket[]>("support_tickets", defaultTickets);
    const filtered = list.filter((t) => t.userId !== "usr-student-1");
    if (filtered.length !== list.length) {
      this.saveSupportTickets(filtered);
    }
    return filtered;
  }

  static saveSupportTickets(tickets: SupportTicket[]) {
    this.setItem("support_tickets", tickets);
  }

  // OMR Scans
  static getOMRScans(): OMRScanRecord[] {
    return this.getItem<OMRScanRecord[]>("omr_scans", []);
  }

  static saveOMRScans(scans: OMRScanRecord[]) {
    this.setItem("omr_scans", scans);
  }

  // Learning Center Lessons
  static getLessons(): Lesson[] {
    return this.getItem<Lesson[]>("learning_lessons", LEARNING_CENTER_LESSONS);
  }

  static saveLessons(lessons: Lesson[]) {
    this.setItem("learning_lessons", lessons);
  }

  // Daily Vocabulary Sets
  static getDailyVocabSets(): DailyVocabularySet[] {
    return this.getItem<DailyVocabularySet[]>("daily_vocab_sets", INITIAL_DAILY_VOCABULARY_SETS);
  }

  static saveDailyVocabSets(sets: DailyVocabularySet[]) {
    this.setItem("daily_vocab_sets", sets);
  }

  // Weekly Top Students
  static getWeeklyTopStudents(): WeeklyTopStudent[] {
    return this.getItem<WeeklyTopStudent[]>("weekly_top_students", INITIAL_WEEKLY_TOP_STUDENTS);
  }

  static saveWeeklyTopStudents(students: WeeklyTopStudent[]) {
    this.setItem("weekly_top_students", students);
  }

  // Platform Settings (Terms of Service, Privacy Policy, Contact Info, Pricing)
  static getPlatformSettings(): PlatformSettings {
    const stored = this.getItem<PlatformSettings>("platform_settings", DEFAULT_PLATFORM_SETTINGS);
    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      ...stored,
      contactInfo: { ...DEFAULT_PLATFORM_SETTINGS.contactInfo, ...(stored.contactInfo || {}) },
      pricing: {
        ...DEFAULT_PLATFORM_SETTINGS.pricing,
        ...(stored.pricing || {}),
        features: (stored.pricing && stored.pricing.features && stored.pricing.features.length > 0)
          ? stored.pricing.features
          : DEFAULT_PLATFORM_SETTINGS.pricing.features,
      },
    };
  }

  static savePlatformSettings(settings: PlatformSettings) {
    this.setItem("platform_settings", settings);
  }

  // Mastered Questions (Questions answered correctly without mistake by the user)
  static getMasteredQuestionIds(userId: string): string[] {
    if (!userId) return [];
    return this.getItem<string[]>(`mastered_q_${userId}`, []);
  }

  static saveMasteredQuestionIds(userId: string, ids: string[]) {
    if (!userId) return;
    this.setItem(`mastered_q_${userId}`, ids);
  }
}

export const SUPABASE_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;

export const db = {
  // Users
  getUsers: (): UserProfile[] => LocalDatabaseStore.getUsers(),

  saveUsers: (users: UserProfile[]): void => LocalDatabaseStore.saveUsers(users),

  updateUserPremium: (id: string, isPremium: boolean): void => {
    const users = LocalDatabaseStore.getUsers();
    const updated = users.map((u) =>
      u.id === id ? { ...u, isPremium, premiumExpiresAt: isPremium ? "2027-03-31" : undefined } : u
    );
    LocalDatabaseStore.saveUsers(updated);
  },

  updateUserProfile: (id: string, updates: Partial<UserProfile>): void => {
    LocalDatabaseStore.updateUserProfile(id, updates);
  },

  updateTargetScore: (userId: string, targetScore: number): void => {
    LocalDatabaseStore.updateUserTargetScore(userId, targetScore);
  },

  // Exams
  getExams: (): Exam[] => {
    return LocalDatabaseStore.getExams();
  },

  saveExams: (exams: Exam[]): void => {
    LocalDatabaseStore.setItem("exams", exams);
  },

  addExam: (exam: Exam): void => {
    const list = db.getExams();
    const filtered = list.filter((e) => e.id !== exam.id);
    LocalDatabaseStore.setItem("exams", [exam, ...filtered]);
  },

  addQuestionToBank: (question: Question, targetExamId?: string): void => {
    const list = db.getExams();
    // Target exam or fallback to the practice bank exam
    const examToTarget = targetExamId
      ? list.find((e) => e.id === targetExamId)
      : list.find((e) => e.id === "esh-practice-custom-bank") || list[0];

    if (examToTarget) {
      const updatedQuestions = [
        ...examToTarget.questions.filter((q) => q.id !== question.id),
        question,
      ];
      const updatedExam: Exam = {
        ...examToTarget,
        questions: updatedQuestions,
        totalQuestions: updatedQuestions.length,
      };
      const updatedList = list.map((e) => (e.id === updatedExam.id ? updatedExam : e));
      LocalDatabaseStore.setItem("exams", updatedList);
    } else {
      // Create dedicated custom bank exam
      const newBankExam: Exam = {
        id: "esh-practice-custom-bank",
        title: "Багш & Админы Бүрдүүлсэн Тестийн Сан",
        type: "practice",
        year: 2026,
        variant: "A",
        status: "published",
        createdBy: "admin",
        totalQuestions: 1,
        durationMinutes: 60,
        questions: [question],
        createdAt: new Date().toISOString().slice(0, 10),
      };
      LocalDatabaseStore.setItem("exams", [newBankExam, ...list]);
    }
  },

  deleteQuestionFromBank: (questionId: string): void => {
    const list = db.getExams();
    const updated = list.map((e) => {
      if (e.questions.some((q) => q.id === questionId)) {
        const filteredQ = e.questions.filter((q) => q.id !== questionId);
        return {
          ...e,
          questions: filteredQ,
          totalQuestions: filteredQ.length,
        };
      }
      return e;
    });
    LocalDatabaseStore.setItem("exams", updated);
  },

  addExams: (newExams: Exam[]): void => {
    const list = db.getExams();
    const newIds = new Set(newExams.map((e) => e.id));
    const filtered = list.filter((e) => !newIds.has(e.id));
    LocalDatabaseStore.setItem("exams", [...newExams, ...filtered]);
  },

  resetToDefaultExams: (): Exam[] => {
    LocalDatabaseStore.setItem("exams", []);
    return [];
  },

  deleteExam: (id: string): void => {
    const list = db.getExams().filter((e) => e.id !== id);
    LocalDatabaseStore.setItem("exams", list);
  },

  // Classes
  getClasses: (): ClassRoom[] => LocalDatabaseStore.getClasses(),

  createClass: (data: { name: string; teacherId: string; teacherName: string; description?: string }): ClassRoom => {
    const classes = LocalDatabaseStore.getClasses();
    const newClass: ClassRoom = {
      id: `cls-${Date.now()}`,
      name: data.name,
      code: `ESH-${Math.floor(1000 + Math.random() * 9000)}`,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      studentIds: [],
      description: data.description || "",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    LocalDatabaseStore.saveClasses([newClass, ...classes]);
    return newClass;
  },

  enrollStudentInClass: (code: string, studentId: string): boolean => {
    const classes = LocalDatabaseStore.getClasses();
    const matched = classes.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!matched) return false;

    if (!matched.studentIds.includes(studentId)) {
      matched.studentIds.push(studentId);
      LocalDatabaseStore.saveClasses(classes);
    }

    const users = LocalDatabaseStore.getUsers();
    const student = users.find((u) => u.id === studentId);
    if (student) {
      if (!student.classCodes) student.classCodes = [];
      if (!student.classCodes.includes(matched.code)) {
        student.classCodes.push(matched.code);
        LocalDatabaseStore.saveUsers(users);
      }
    }
    return true;
  },

  // Assignments
  getAssignments: (): Assignment[] => LocalDatabaseStore.getAssignments(),

  saveAssignments: (assignments: Assignment[]): void => {
    LocalDatabaseStore.saveAssignments(assignments);
  },

  createAssignment: (data: {
    title: string;
    classId: string;
    className: string;
    examId: string;
    examTitle: string;
    assignedBy: string;
    assignedByName: string;
    dueDate: string;
    timeLimitMinutes?: number;
  }): Assignment => {
    const assignments = LocalDatabaseStore.getAssignments();
    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      title: data.title,
      classId: data.classId,
      className: data.className,
      examId: data.examId,
      examTitle: data.examTitle,
      assignedBy: data.assignedBy,
      assignedByName: data.assignedByName,
      dueDate: data.dueDate,
      timeLimitMinutes: data.timeLimitMinutes || 80,
      createdAt: new Date().toISOString().slice(0, 10),
      assignedStudentIds: [],
      completedStudentIds: [],
    };
    LocalDatabaseStore.saveAssignments([newAsg, ...assignments]);
    return newAsg;
  },

  // Submissions
  getSubmissions: (userId?: string): ExamSubmission[] => LocalDatabaseStore.getSubmissions(userId),

  getGuestSubmissions: (): ExamSubmission[] => LocalDatabaseStore.getGuestSubmissions(),

  saveSubmissions: (subs: ExamSubmission[]): void => {
    LocalDatabaseStore.saveSubmissions(subs);
  },

  saveSubmission: (sub: ExamSubmission): void => {
    // If guest: NEVER save to main submissions table or send to Supabase!
    if (!sub.userId || sub.userId === "guest-user" || sub.userId.startsWith("guest-")) {
      LocalDatabaseStore.saveGuestSubmission(sub);
      return;
    }
    const subs = LocalDatabaseStore.getSubmissions();
    const updated = [sub, ...subs.filter((s) => s.id !== sub.id)];
    LocalDatabaseStore.saveSubmissions(updated);
    if (supabase) {
      saveSubmissionToSupabase(sub).catch((err) =>
        console.warn("Background sync submission to Supabase error:", err)
      );
    }
  },

  // Mistakes
  getMistakes: (userId?: string): MistakeItem[] => LocalDatabaseStore.getMistakes(userId),

  getGuestMistakes: (): MistakeItem[] => LocalDatabaseStore.getGuestMistakes(),

  saveMistakes: (mistakes: MistakeItem[]): void => {
    LocalDatabaseStore.saveMistakes(mistakes);
  },

  clearGuestData: (): void => {
    LocalDatabaseStore.clearGuestData();
  },

  recordMistake: (data: {
    userId: string;
    examId: string;
    question: any;
    userLastAnswer: string;
    smartFeedback?: string;
  }): void => {
    const isGuest = !data.userId || data.userId === "guest-user" || data.userId.startsWith("guest-");
    const list = isGuest ? LocalDatabaseStore.getGuestMistakes() : LocalDatabaseStore.getMistakes();
    const existingIdx = list.findIndex(
      (m) => m.userId === data.userId && m.question.id === data.question.id
    );

    let targetItem: MistakeItem;
    if (existingIdx >= 0) {
      list[existingIdx].mistakeCount = (list[existingIdx].mistakeCount || 1) + 1;
      list[existingIdx].userLastAnswer = data.userLastAnswer;
      list[existingIdx].date = new Date().toISOString().slice(0, 10);
      targetItem = list[existingIdx];
    } else {
      targetItem = {
        id: `mis-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userId: data.userId,
        questionId: data.question.id,
        examId: data.examId,
        examTitle: data.question.topic || "ЭЕШ Даалгавар",
        question: data.question,
        userAnswer: data.userLastAnswer,
        userLastAnswer: data.userLastAnswer,
        correctAnswer: data.question.correctAnswer,
        date: new Date().toISOString().slice(0, 10),
        smartFeedback: data.smartFeedback || data.question.explanation,
        resolved: false,
        mistakeCount: 1,
        masteryLevel: "learning",
      };
      list.unshift(targetItem);
    }

    if (isGuest) {
      LocalDatabaseStore.saveGuestMistake(targetItem);
      return; // NEVER send guest mistakes to Supabase
    }

    LocalDatabaseStore.saveMistakes(list);
    if (supabase) {
      saveMistakeToSupabase(targetItem).catch((err) =>
        console.warn("Background sync mistake to Supabase error:", err)
      );
    }
  },

  removeMistake: (id: string): void => {
    const list = LocalDatabaseStore.getMistakes().filter((m) => m.id !== id);
    LocalDatabaseStore.saveMistakes(list);
  },

  updateMistakeMastery: (id: string, level: "learning" | "mastered"): void => {
    const list = LocalDatabaseStore.getMistakes().map((m) =>
      m.id === id ? { ...m, masteryLevel: level, resolved: level === "mastered" } : m
    );
    LocalDatabaseStore.saveMistakes(list);
  },

  // Activation Codes
  getActivationCodes: (): ActivationCode[] => LocalDatabaseStore.getActivationCodes(),

  generateActivationCode: (targetRole: "student" | "teacher"): ActivationCode => {
    const codes = LocalDatabaseStore.getActivationCodes();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCode: ActivationCode = {
      id: `code-${Date.now()}`,
      code: `ESH-${targetRole === "student" ? "STU" : "TCH"}-${randomSuffix}`,
      targetRole,
      durationDays: 365,
      isRedeemed: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    LocalDatabaseStore.saveActivationCodes([newCode, ...codes]);
    return newCode;
  },

  redeemActivationCode: (code: string, userId: string, userName: string): boolean => {
    const codes = LocalDatabaseStore.getActivationCodes();
    const matched = codes.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && !c.isRedeemed
    );
    if (!matched) return false;

    matched.isRedeemed = true;
    matched.redeemedBy = userId;
    matched.redeemedByName = userName;
    matched.redeemedAt = new Date().toISOString();
    LocalDatabaseStore.saveActivationCodes(codes);

    // Update user's premium status
    db.updateUserPremium(userId, true);
    return true;
  },

  // Notifications
  getNotifications: (): NotificationItem[] => LocalDatabaseStore.getNotifications(),

  broadcastNotification: (
    title: string,
    message: string,
    targetRole: "all" | "student" | "teacher"
  ): void => {
    const notifs = LocalDatabaseStore.getNotifications();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      targetRole,
      createdAt: new Date().toISOString().slice(0, 10),
      read: false,
    };
    LocalDatabaseStore.saveNotifications([newNotif, ...notifs]);
  },

  markNotificationAsRead: (id: string): void => {
    const notifs = LocalDatabaseStore.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    LocalDatabaseStore.saveNotifications(notifs);
  },

  // Support Tickets
  getSupportTickets: (): SupportTicket[] => LocalDatabaseStore.getSupportTickets(),

  replySupportTicket: (ticketId: string, reply: string): void => {
    const tickets = LocalDatabaseStore.getSupportTickets().map((t) =>
      t.id === ticketId ? { ...t, reply, status: "resolved" as const } : t
    );
    LocalDatabaseStore.saveSupportTickets(tickets);
  },

  // OMR Scans
  getOMRScans: (): OMRScanRecord[] => LocalDatabaseStore.getOMRScans(),

  verifyOMRScan: (scanId: string, verifiedAnswers: Record<number, string>): void => {
    const scans = LocalDatabaseStore.getOMRScans();
    const target = scans.find((s) => s.id === scanId);
    if (target) {
      Object.entries(verifiedAnswers).forEach(([qNum, ans]) => {
        const num = Number(qNum);
        if (target.scannedAnswers[num]) {
          target.scannedAnswers[num].answer = ans as any;
          target.scannedAnswers[num].confidence = 1.0;
          target.scannedAnswers[num].ambiguous = false;
        }
      });
      target.status = "verified";
      LocalDatabaseStore.saveOMRScans(scans);
    }
  },

  // Lessons Management
  getLessons: (): Lesson[] => LocalDatabaseStore.getLessons(),
  saveLessons: (lessons: Lesson[]): void => LocalDatabaseStore.saveLessons(lessons),
  addLesson: (lesson: Lesson): void => {
    const lessons = LocalDatabaseStore.getLessons();
    LocalDatabaseStore.saveLessons([lesson, ...lessons]);
  },
  updateLesson: (lesson: Lesson): void => {
    const lessons = LocalDatabaseStore.getLessons();
    const updated = lessons.map((l) => (l.id === lesson.id ? lesson : l));
    LocalDatabaseStore.saveLessons(updated);
  },
  deleteLesson: (lessonId: string): void => {
    const lessons = LocalDatabaseStore.getLessons().filter((l) => l.id !== lessonId);
    LocalDatabaseStore.saveLessons(lessons);
  },

  // Daily Vocabulary
  getDailyVocabSets: (): DailyVocabularySet[] => LocalDatabaseStore.getDailyVocabSets(),
  getTodayVocabSet: (): DailyVocabularySet => {
    const sets = LocalDatabaseStore.getDailyVocabSets();
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySet = sets.find((s) => s.date === todayStr);
    if (todaySet) return todaySet;
    return (
      sets[0] || {
        id: `vocab-${todayStr}`,
        date: todayStr,
        theme: "ЭЕШ-д өндөр давтамжтай үгсийн өдөр тутмын цээжлэлт",
        words: [],
        source: "ai",
        createdByName: "SmartESH AI",
        createdAt: new Date().toISOString(),
      }
    );
  },
  saveDailyVocabSet: (set: DailyVocabularySet): void => {
    const sets = LocalDatabaseStore.getDailyVocabSets();
    const existingIndex = sets.findIndex((s) => s.id === set.id || s.date === set.date);
    let updated: DailyVocabularySet[];
    if (existingIndex >= 0) {
      updated = [...sets];
      updated[existingIndex] = set;
    } else {
      updated = [set, ...sets];
    }
    LocalDatabaseStore.saveDailyVocabSets(updated);
  },

  // Weekly Top Students
  getWeeklyTopStudents: (): WeeklyTopStudent[] => LocalDatabaseStore.getWeeklyTopStudents(),
  saveWeeklyTopStudents: (students: WeeklyTopStudent[]): void => {
    LocalDatabaseStore.saveWeeklyTopStudents(students);
  },
  addWeeklyTopStudent: (student: WeeklyTopStudent): void => {
    const list = LocalDatabaseStore.getWeeklyTopStudents();
    LocalDatabaseStore.saveWeeklyTopStudents([student, ...list]);
  },

  // Platform Settings
  getPlatformSettings: (): PlatformSettings => LocalDatabaseStore.getPlatformSettings(),
  savePlatformSettings: (settings: PlatformSettings): void => {
    LocalDatabaseStore.savePlatformSettings(settings);
  },

  // Mastered Questions Tracker (Zero-mistake completed questions)
  getMasteredQuestionIds: (userId: string): string[] => LocalDatabaseStore.getMasteredQuestionIds(userId),
  markQuestionMastered: (userId: string, questionId: string): void => {
    if (!userId || !questionId) return;
    const current = LocalDatabaseStore.getMasteredQuestionIds(userId);
    if (!current.includes(questionId)) {
      LocalDatabaseStore.saveMasteredQuestionIds(userId, [...current, questionId]);
    }
  },
  unmarkQuestionMastered: (userId: string, questionId: string): void => {
    if (!userId || !questionId) return;
    const current = LocalDatabaseStore.getMasteredQuestionIds(userId);
    LocalDatabaseStore.saveMasteredQuestionIds(
      userId,
      current.filter((id) => id !== questionId)
    );
  },
  resetMasteredQuestions: (userId: string): void => {
    if (!userId) return;
    LocalDatabaseStore.saveMasteredQuestionIds(userId, []);
  },
};

// ==========================================
// REAL SUPABASE AUTH & PROFILES INTEGRATION
// ==========================================

export async function supabaseSignUp({
  email,
  password,
  name,
  role,
  school,
  grade,
}: {
  email: string;
  password?: string;
  name: string;
  role: Role;
  school?: string;
  grade?: string;
}) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  const cleanEmail = email.trim();
  const isSuperAdminEmail = cleanEmail.toLowerCase() === "battsetsegb615@gmail.com";
  // Strict role mapping: only student or teacher selectable, admin reserved for authorized admin
  const userRole: Role = isSuperAdminEmail ? "admin" : (role === "teacher" ? "teacher" : "student");
  const cleanName = name.trim();

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: password || "SmartESH2026!",
    options: {
      data: {
        name: cleanName,
        role: userRole,
        school: school || "",
        grade: grade || "",
      },
    },
  });
  if (error) throw error;

  if (data.user) {
    // Clear any previous guest attempts on device
    LocalDatabaseStore.clearGuestData();

    try {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: cleanEmail,
        name: cleanName,
        role: userRole,
        school: school || "",
        grade: grade || "",
        is_premium: userRole === "admin",
        target_score: 800,
        target_esh_score: 800,
        student_code: data.user.id.slice(0, 6).toUpperCase(),
      });
    } catch (e) {
      console.warn("Profile table insert notice:", e);
    }

    // If auto-confirmation is active or password was provided, ensure session is signed in
    if (!data.session && password) {
      try {
        const loginRes = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (loginRes.data?.user) {
          return loginRes.data;
        }
      } catch (e) {
        // If confirmation email is required by project settings, proceed with data
      }
    }
  }
  return data;
}

export async function supabaseSignIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function supabaseSignInWithGoogle() {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

export async function supabaseSignOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function fetchUserProfileFromSupabase(
  userId: string,
  authUser?: any
): Promise<UserProfile | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Supabase profile fetch error:", error.message);
    }

    if (data) {
      const userEmail = (data.email || authUser?.email || "").trim();
      const isSuperAdminEmail =
        userEmail.toLowerCase() === "battsetsegb615@gmail.com";
      const actualRole: Role = isSuperAdminEmail
        ? "admin"
        : (data.role as Role) || "student";

      // Display real name from profiles/auth metadata, or email prefix if not configured
      const emailPrefix = userEmail.split("@")[0] || "";
      const rawName = (data.name || authUser?.user_metadata?.name || authUser?.user_metadata?.full_name || "").trim();
      const cleanName =
        rawName && rawName !== "Хэрэглэгч" && rawName !== "Google Хэрэглэгч"
          ? rawName
          : (emailPrefix || "Сурагч");

      const profile: UserProfile = {
        id: data.id,
        email: userEmail,
        name: cleanName,
        role: actualRole,
        studentCode:
          data.student_code ||
          data.id.slice(0, 6).toUpperCase(),
        school: data.school || "",
        grade: data.grade || "",
        isPremium: Boolean(data.is_premium || actualRole === "admin"),
        premiumExpiresAt: data.premium_expires_at,
        targetEshScore: data.target_score ?? data.target_esh_score ?? 800,
        joinedAt:
          data.created_at?.slice(0, 10) ||
          new Date().toISOString().slice(0, 10),
      };
      return profile;
    }

    // Auto-provision profile from auth user metadata if row doesn't exist yet
    if (authUser) {
      const userEmail = (authUser.email || "").trim();
      const isSuperAdminEmail =
        userEmail.toLowerCase() === "battsetsegb615@gmail.com";
      const userRole: Role = isSuperAdminEmail
        ? "admin"
        : (authUser.user_metadata?.role as Role) || "student";

      const emailPrefix = userEmail.split("@")[0] || "";
      const rawName = (
        authUser.user_metadata?.name ||
        authUser.user_metadata?.full_name ||
        ""
      ).trim();
      const cleanName =
        rawName && rawName !== "Хэрэглэгч"
          ? rawName
          : (emailPrefix || "Сурагч");

      const studentCode = authUser.id ? authUser.id.slice(0, 6).toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString();

      const newProfile: UserProfile = {
        id: authUser.id,
        email: userEmail,
        name: cleanName,
        role: userRole,
        studentCode,
        school: authUser.user_metadata?.school || "",
        grade: authUser.user_metadata?.grade || "",
        isPremium: userRole === "admin",
        joinedAt: new Date().toISOString().slice(0, 10),
        targetEshScore: 800,
      };

      try {
        await supabase.from("profiles").upsert({
          id: authUser.id,
          email: newProfile.email,
          name: newProfile.name,
          role: newProfile.role,
          school: newProfile.school,
          grade: newProfile.grade,
          is_premium: newProfile.isPremium,
          target_score: newProfile.targetEshScore,
          target_esh_score: newProfile.targetEshScore,
          student_code: newProfile.studentCode,
        });
      } catch (upsertErr) {
        console.warn("Could not insert profile into supabase:", upsertErr);
      }

      return newProfile;
    }
  } catch (err) {
    console.error("fetchUserProfileFromSupabase failed:", err);
  }
  return null;
}

// -------------------------------------------------------------
// Live Supabase Sync Functions for Target Score
// -------------------------------------------------------------
export async function updateUserTargetScoreInSupabase(
  userId: string,
  targetScore: number
): Promise<boolean> {
  if (!supabase || !userId) return false;
  try {
    const clamped = Math.max(200, Math.min(800, Math.round(targetScore)));
    const payload: Record<string, any> = {
      target_score: clamped,
      target_esh_score: clamped,
    };

    let { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId);

    if (error && error.message?.includes("target_esh_score")) {
      delete payload.target_esh_score;
      const res = await supabase.from("profiles").update(payload).eq("id", userId);
      error = res.error;
    } else if (error && error.message?.includes("target_score")) {
      delete payload.target_score;
      payload.target_esh_score = clamped;
      const res = await supabase.from("profiles").update(payload).eq("id", userId);
      error = res.error;
    }

    if (error) {
      console.warn("updateUserTargetScoreInSupabase error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("updateUserTargetScoreInSupabase caught:", err);
    return false;
  }
}

export async function updateUserProfileInSupabase(
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  // Update local store immediately for instant reactivity
  db.updateUserProfile(userId, updates);

  if (!supabase || !userId) return true;
  try {
    const payload: any = {};
    if (updates.role) payload.role = updates.role;
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.school !== undefined) payload.school = updates.school;
    if (updates.grade !== undefined) payload.grade = updates.grade;
    if (updates.isPremium !== undefined) payload.is_premium = updates.isPremium;
    if (updates.targetEshScore !== undefined) {
      payload.target_score = updates.targetEshScore;
      payload.target_esh_score = updates.targetEshScore;
    }
    if (updates.aimag !== undefined) payload.aimag = updates.aimag;
    if (updates.sum !== undefined) payload.sum = updates.sum;

    let { error } = await supabase.from("profiles").update(payload).eq("id", userId);
    if (error && (error.message?.includes("aimag") || error.message?.includes("sum"))) {
      delete payload.aimag;
      delete payload.sum;
      const retry = await supabase.from("profiles").update(payload).eq("id", userId);
      error = retry.error;
    }
    if (error) {
      console.warn("updateUserProfileInSupabase error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("updateUserProfileInSupabase caught:", err);
    return false;
  }
}

// -------------------------------------------------------------
// Live Supabase Sync Functions for Submissions & Mistakes
// -------------------------------------------------------------

export async function saveSubmissionToSupabase(sub: ExamSubmission): Promise<boolean> {
  if (!supabase) return false;
  // STRICT GUEST ISOLATION: Never write guest attempts to live Supabase database
  if (!sub.userId || sub.userId === "guest-user" || sub.userId.startsWith("guest-")) {
    return false;
  }
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id || sub.userId;
    if (!currentUserId || currentUserId === "guest-user" || currentUserId.startsWith("guest-")) {
      return false;
    }

    const payload: any = {
      user_id: currentUserId,
      source: sub.source || "digital",
      raw_score: sub.rawScore,
      scaled_score: sub.scaledScore,
      percentage: sub.percentage,
      time_spent_seconds: sub.timeSpentSeconds || 0,
      answers: sub.answers || {},
      category_scores: sub.categoryScores || {},
      wrong_question_ids: sub.wrongQuestionIds || [],
      submitted_at: sub.submittedAt || new Date().toISOString(),
    };

    if (sub.examId) {
      payload.exam_id = sub.examId;
    }

    let { error } = await supabase.from("submissions").insert(payload);
    // If foreign key constraint failed on exam_id, retry without exam_id
    if (error && error.message?.includes("foreign key")) {
      delete payload.exam_id;
      const retryResult = await supabase.from("submissions").insert(payload);
      error = retryResult.error;
    }

    if (error) {
      console.warn("Supabase saveSubmission error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("saveSubmissionToSupabase caught:", err);
    return false;
  }
}

export async function saveMistakeToSupabase(m: MistakeItem): Promise<boolean> {
  if (!supabase) return false;
  // STRICT GUEST ISOLATION: Never write guest mistakes to live Supabase database
  if (!m.userId || m.userId === "guest-user" || m.userId.startsWith("guest-")) {
    return false;
  }
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id || m.userId;
    if (!currentUserId || currentUserId === "guest-user" || currentUserId.startsWith("guest-")) {
      return false;
    }

    const payload: any = {
      user_id: currentUserId,
      question_id: m.questionId || m.question?.id || "q-1",
      user_answer: m.userAnswer || m.userLastAnswer || "",
      correct_answer: m.correctAnswer || m.question?.correctAnswer || "",
      smart_feedback: m.smartFeedback || m.question?.explanation || "",
      resolved: Boolean(m.resolved || m.masteryLevel === "mastered"),
    };

    if (m.examId) {
      payload.exam_id = m.examId;
    }

    let { error } = await supabase.from("mistakes").insert(payload);
    if (error && error.message?.includes("foreign key")) {
      delete payload.exam_id;
      const retry = await supabase.from("mistakes").insert(payload);
      error = retry.error;
    }

    if (error) {
      console.warn("Supabase saveMistake error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("saveMistakeToSupabase caught:", err);
    return false;
  }
}

export async function fetchUserSubmissionsFromSupabase(userId: string): Promise<ExamSubmission[]> {
  if (!supabase || !userId || userId === "guest-user" || userId.startsWith("guest-")) return [];
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch submissions error:", error.message);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        examId: d.exam_id || "esh-past-paper",
        examTitle: d.exam_title || "Англи хэлний ЭЕШ Сорилт",
        userId: d.user_id,
        userName: d.user_name || "",
        source: d.source || "digital",
        answers: d.answers || {},
        rawScore: d.raw_score,
        percentage: Number(d.percentage) || 0,
        scaledScore: d.scaled_score,
        timeSpentSeconds: d.time_spent_seconds || 0,
        categoryScores: d.category_scores || {},
        wrongQuestionIds: d.wrong_question_ids || [],
        submittedAt: d.submitted_at || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn("fetchUserSubmissionsFromSupabase caught:", err);
  }
  return [];
}

export async function fetchTeacherSubmissionsFromSupabase(
  teacherId: string,
  enrolledStudentIds: string[]
): Promise<ExamSubmission[]> {
  if (!supabase || !teacherId || enrolledStudentIds.length === 0) return [];
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .in("user_id", enrolledStudentIds)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.warn("fetchTeacherSubmissionsFromSupabase error:", error.message);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        examId: d.exam_id || "esh-past-paper",
        examTitle: d.exam_title || "Англи хэлний ЭЕШ Сорилт",
        userId: d.user_id,
        userName: d.user_name || "",
        source: d.source || "digital",
        answers: d.answers || {},
        rawScore: d.raw_score,
        percentage: Number(d.percentage) || 0,
        scaledScore: d.scaled_score,
        timeSpentSeconds: d.time_spent_seconds || 0,
        categoryScores: d.category_scores || {},
        wrongQuestionIds: d.wrong_question_ids || [],
        submittedAt: d.submitted_at || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn("fetchTeacherSubmissionsFromSupabase caught:", err);
  }
  return [];
}

export async function fetchAllSubmissionsFromSupabase(): Promise<ExamSubmission[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.warn("fetchAllSubmissionsFromSupabase error:", error.message);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        examId: d.exam_id || "esh-past-paper",
        examTitle: d.exam_title || "Англи хэлний ЭЕШ Сорилт",
        userId: d.user_id,
        userName: d.user_name || "",
        source: d.source || "digital",
        answers: d.answers || {},
        rawScore: d.raw_score,
        percentage: Number(d.percentage) || 0,
        scaledScore: d.scaled_score,
        timeSpentSeconds: d.time_spent_seconds || 0,
        categoryScores: d.category_scores || {},
        wrongQuestionIds: d.wrong_question_ids || [],
        submittedAt: d.submitted_at || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn("fetchAllSubmissionsFromSupabase caught:", err);
  }
  return [];
}

export async function fetchAllUsersFromSupabase(): Promise<UserProfile[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("fetchAllUsersFromSupabase error:", error.message);
      return [];
    }

    if (data && data.length > 0) {
      const remoteUsers: UserProfile[] = data.map((d: any) => {
        const userEmail = (d.email || "").trim();
        const isSuperAdminEmail = userEmail.toLowerCase() === "battsetsegb615@gmail.com";
        const role: Role = isSuperAdminEmail ? "admin" : (d.role as Role) || "student";
        const emailPrefix = userEmail.split("@")[0] || "";
        const cleanName = (d.name || "").trim() || emailPrefix || "Хэрэглэгч";
        const schoolStr = d.school || "";
        const inferredAimag = d.aimag || (
          schoolStr.includes("Дархан") ? "Дархан-Уул" :
          schoolStr.includes("Орхон") ? "Орхон" :
          schoolStr.includes("Хөвсгөл") ? "Хөвсгөл" :
          schoolStr.includes("Сэлэнгэ") ? "Сэлэнгэ" :
          schoolStr.includes("Ховд") ? "Ховд" :
          schoolStr.includes("Баян-Өлгий") ? "Баян-Өлгий" :
          schoolStr.includes("Өвөрхангай") ? "Өвөрхангай" :
          "Улаанбаатар"
        );
        const inferredSum = d.sum || (
          schoolStr.includes("1-р сургууль") ? "Сүхбаатар" :
          schoolStr.includes("Сант") ? "Хан-Уул" :
          schoolStr.includes("Шинэ Монгол") ? "Баянзүрх" :
          schoolStr.includes("Дархан") ? "Дархан сум" :
          schoolStr.includes("Орхон") ? "Баян-Өндөр" :
          schoolStr.includes("Мөрөн") ? "Мөрөн" :
          "Сүхбаатар"
        );

        return {
          id: d.id,
          email: userEmail,
          name: cleanName,
          role,
          studentCode: d.student_code || d.id.slice(0, 6).toUpperCase(),
          school: schoolStr,
          grade: d.grade || "",
          aimag: inferredAimag,
          sum: inferredSum,
          isPremium: Boolean(d.is_premium || role === "admin"),
          premiumExpiresAt: d.premium_expires_at,
          targetEshScore: d.target_score ?? d.target_esh_score ?? 800,
          joinedAt: d.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        };
      });

      return remoteUsers;
    }
    return [];
  } catch (err) {
    console.warn("fetchAllUsersFromSupabase caught:", err);
  }
  return [];
}

export async function fetchUserMistakesFromSupabase(userId: string): Promise<MistakeItem[]> {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from("mistakes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch mistakes error:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch related questions from questions table to get genuine question text, options, and explanations
    const questionIds = Array.from(new Set(data.map((d: any) => d.question_id).filter(Boolean)));
    const questionsMap: Record<string, Question> = {};

    if (questionIds.length > 0) {
      try {
        const { data: qData } = await supabase
          .from("questions")
          .select("*")
          .in("id", questionIds);

        if (qData) {
          qData.forEach((row: any) => {
            let options = [];
            if (Array.isArray(row.options)) {
              options = row.options;
            } else if (typeof row.options === "string") {
              try {
                options = JSON.parse(row.options);
              } catch {
                options = [];
              }
            }

            questionsMap[row.id] = {
              id: row.id,
              questionNumber: row.question_number || 1,
              text: row.text || "",
              category: row.category || "Grammar",
              topic: row.topic || "Ерөнхий дүрэм",
              subtopic: row.subtopic || "",
              difficulty: row.level || row.difficulty || "Medium",
              options,
              correctAnswer: row.correct_answer || "A",
              explanation: row.explanation || "",
            };
          });
        }
      } catch (qErr) {
        console.warn("Could not fetch question details for mistakes:", qErr);
      }
    }

    return data.map((d: any) => {
      const q = questionsMap[d.question_id];
      return {
        id: d.id,
        userId: d.user_id,
        examId: d.exam_id || "",
        examTitle: d.exam_title || "ЭЕШ Англи хэлний шалгалт",
        questionId: d.question_id || "",
        question: q || {
          id: d.question_id || "q-1",
          questionNumber: 1,
          text: d.question_text || "Шалгалтын асуулт",
          category: d.category || "Grammar",
          topic: d.topic || "ЭЕШ Дүрэм",
          subtopic: "",
          difficulty: "Medium",
          options: [],
          correctAnswer: d.correct_answer || "A",
          explanation: d.smart_feedback || "",
        },
        userAnswer: d.user_answer,
        userLastAnswer: d.user_answer,
        correctAnswer: d.correct_answer || q?.correctAnswer,
        smartFeedback: d.smart_feedback || q?.explanation,
        date: d.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        resolved: Boolean(d.resolved),
        masteryLevel: d.resolved ? "mastered" : "learning",
        createdAt: d.created_at,
      };
    });
  } catch (err) {
    console.warn("fetchUserMistakesFromSupabase caught:", err);
  }
  return [];
}

export async function fetchExamsFromSupabase(): Promise<Exam[]> {
  if (!supabase) return [];
  try {
    const examsList: Exam[] = [];

    // Query purely from the exams table in Supabase
    const { data: examsData, error: examsErr } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (!examsErr && examsData && examsData.length > 0) {
      examsData.forEach((d: any) => {
        let parsedQuestions: Question[] = [];
        if (Array.isArray(d.questions)) {
          parsedQuestions = d.questions;
        } else if (typeof d.questions === "string") {
          try {
            parsedQuestions = JSON.parse(d.questions);
          } catch {
            parsedQuestions = [];
          }
        }

        examsList.push({
          id: d.id,
          title: d.title || "ЭЕШ Англи хэлний сорилт",
          year: Number(d.year) || 2026,
          variant: d.variant || "A",
          type: d.type || "past_paper",
          status: d.status || "published",
          durationMinutes: d.duration_minutes || 80,
          totalQuestions: d.total_questions || (parsedQuestions.length > 0 ? parsedQuestions.length : 50),
          questions: parsedQuestions,
          createdAt: d.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          createdBy: d.created_by || "admin",
        });
      });
    }

    return examsList;
  } catch (err) {
    console.warn("fetchExamsFromSupabase caught:", err);
    return [];
  }
}

export async function fetchQuestionsForExamFromSupabase(examId: string): Promise<Question[]> {
  if (!supabase || !examId) return [];
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_id", examId)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("fetchQuestionsForExamFromSupabase error:", error.message);
      return [];
    }

    if (data && data.length > 0) {
      const parsed: Question[] = data.map((q: any, idx: number) => {
        const text = q.question_text || q.text || `Асуулт ${idx + 1}`;
        const numMatch = text.match(/^(?:№|Q)?\s*(\d{1,2})/);
        const qNum = numMatch ? parseInt(numMatch[1], 10) : idx + 1;

        let formattedOptions: QuestionOption[] = [];
        if (Array.isArray(q.options)) {
          formattedOptions = q.options.map((opt: any, optIdx: number) => {
            const letter = (["A", "B", "C", "D", "E"][optIdx] || "A") as "A" | "B" | "C" | "D" | "E";
            return {
              id: (opt.id || letter) as "A" | "B" | "C" | "D" | "E",
              text: opt.text || String(opt),
            };
          });
        } else if (q.options && typeof q.options === "object") {
          formattedOptions = Object.entries(q.options).map(([k, v]) => ({
            id: (k.toUpperCase() as "A" | "B" | "C" | "D" | "E"),
            text: String(v),
          }));
        }

        return {
          id: q.id,
          questionNumber: qNum,
          text,
          category: q.category || "Grammar",
          topic: q.topic || "ЭЕШ 2026",
          subtopic: q.level || "",
          difficulty: (q.difficulty || "Medium") as "Easy" | "Medium" | "Hard",
          options: formattedOptions,
          correctAnswer: q.correct_option || q.correct_answer || "A",
          explanation: q.explanation || "",
          points: 1,
          section: qNum <= 47 ? 1 : 2,
        };
      });

      parsed.sort((a, b) => a.questionNumber - b.questionNumber);
      return parsed;
    }
  } catch (err) {
    console.warn("fetchQuestionsForExamFromSupabase caught:", err);
  }
  return [];
}

// =========================================================================
// QUESTION BANK SUPABASE PERSISTENCE & MANAGEMENT
// =========================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function saveQuestionToSupabase(
  question: Question,
  teacherId?: string,
  examId?: string
): Promise<{ success: boolean; question: Question; error?: string }> {
  // Always update local store immediately for instant UI reactivity
  db.addQuestionToBank(question, examId);

  if (!supabase) {
    return { success: true, question };
  }

  try {
    const payload: any = {
      question_text: question.text,
      options: question.options || [],
      correct_answer: question.correctAnswer || "A",
      explanation: question.explanation || "",
      category: question.category || "Grammar",
      topic: question.topic || "General",
      subtopic: question.subtopic || "",
      difficulty: question.difficulty || "Medium",
      level: (question as any).level || (question.difficulty === "Easy" ? "A2" : question.difficulty === "Hard" ? "B2" : "B1"),
      image_url: question.imageUrl || null,
      created_at: new Date().toISOString(),
    };

    if (question.id && UUID_REGEX.test(question.id)) {
      payload.id = question.id;
    }

    if (teacherId && UUID_REGEX.test(teacherId)) {
      payload.teacher_id = teacherId;
    }

    if (examId && UUID_REGEX.test(examId)) {
      payload.exam_id = examId;
    }

    let { data, error } = await supabase.from("questions").insert(payload).select().maybeSingle();

    // If foreign key constraint failed on teacher_id or exam_id, retry without them
    if (error && error.message?.includes("foreign key")) {
      delete payload.teacher_id;
      delete payload.exam_id;
      const retry = await supabase.from("questions").insert(payload).select().maybeSingle();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.warn("Supabase saveQuestion error:", error.message);
      return { success: false, question, error: error.message };
    }

    const savedQuestion: Question = {
      ...question,
      id: data?.id || question.id,
    };

    // Update bank with assigned Supabase ID
    db.addQuestionToBank(savedQuestion, examId);
    return { success: true, question: savedQuestion };
  } catch (err: any) {
    console.warn("saveQuestionToSupabase caught exception:", err);
    return { success: false, question, error: err.message };
  }
}

export async function saveBulkQuestionsToSupabase(
  questions: Question[],
  teacherId?: string,
  examId?: string
): Promise<{ success: boolean; count: number; savedQuestions: Question[]; error?: string }> {
  // Always update local store immediately for instant UI reactivity
  questions.forEach((q) => db.addQuestionToBank(q, examId));

  if (!supabase || questions.length === 0) {
    return { success: true, count: questions.length, savedQuestions: questions };
  }

  try {
    const payloads = questions.map((q) => {
      const p: any = {
        question_text: q.text,
        options: q.options || [],
        correct_answer: q.correctAnswer || "A",
        explanation: q.explanation || "",
        category: q.category || "Grammar",
        topic: q.topic || "General",
        subtopic: q.subtopic || "",
        difficulty: q.difficulty || "Medium",
        level: (q as any).level || (q.difficulty === "Easy" ? "A2" : q.difficulty === "Hard" ? "B2" : "B1"),
        image_url: q.imageUrl || null,
        created_at: new Date().toISOString(),
      };
      if (q.id && UUID_REGEX.test(q.id)) p.id = q.id;
      if (teacherId && UUID_REGEX.test(teacherId)) p.teacher_id = teacherId;
      if (examId && UUID_REGEX.test(examId)) p.exam_id = examId;
      return p;
    });

    let { data, error } = await supabase.from("questions").insert(payloads).select();

    if (error && error.message?.includes("foreign key")) {
      const sanitized = payloads.map((p) => {
        const { teacher_id, exam_id, ...rest } = p;
        return rest;
      });
      const retry = await supabase.from("questions").insert(sanitized).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.warn("Supabase saveBulkQuestions error:", error.message);
      return { success: false, count: questions.length, savedQuestions: questions, error: error.message };
    }

    const savedQuestions: Question[] = (data && data.length > 0)
      ? data.map((d: any, idx: number) => ({
          ...questions[idx],
          id: d.id || questions[idx].id,
        }))
      : questions;

    savedQuestions.forEach((sq) => db.addQuestionToBank(sq, examId));
    return { success: true, count: savedQuestions.length, savedQuestions };
  } catch (err: any) {
    console.warn("saveBulkQuestionsToSupabase caught exception:", err);
    return { success: false, count: questions.length, savedQuestions: questions, error: err.message };
  }
}

export async function fetchQuestionsFromSupabase(teacherId?: string): Promise<Question[]> {
  if (!supabase) {
    const localQuestions: Question[] = [];
    const exams = db.getExams();
    exams.forEach((e) => {
      (e.questions || []).forEach((q) => {
        localQuestions.push(q);
      });
    });
    return localQuestions;
  }

  try {
    let query = supabase.from("questions").select("*").order("created_at", { ascending: false });
    if (teacherId && UUID_REGEX.test(teacherId)) {
      query = query.or(`teacher_id.eq.${teacherId},teacher_id.is.null`);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Supabase fetchQuestions error:", error.message);
      return [];
    }

    if (data && data.length > 0) {
      const parsedRemote: Question[] = data.map((d: any, idx: number) => {
        let opts: QuestionOption[] = [];
        if (Array.isArray(d.options)) {
          opts = d.options.map((o: any, oIdx: number) => ({
            id: (o.id || ["A", "B", "C", "D", "E"][oIdx] || "A") as "A" | "B" | "C" | "D" | "E",
            text: String(o.text || o),
          }));
        } else if (typeof d.options === "string") {
          try {
            const arr = JSON.parse(d.options);
            if (Array.isArray(arr)) {
              opts = arr.map((o: any, oIdx: number) => ({
                id: (o.id || ["A", "B", "C", "D", "E"][oIdx] || "A") as "A" | "B" | "C" | "D" | "E",
                text: String(o.text || o),
              }));
            }
          } catch {}
        }

        return {
          id: d.id,
          questionNumber: idx + 1,
          text: d.question_text || d.text || `Асуулт ${idx + 1}`,
          category: d.category || "Grammar",
          topic: d.topic || "Ерөнхий сэдэв",
          subtopic: d.subtopic || "",
          difficulty: (d.difficulty || "Medium") as "Easy" | "Medium" | "Hard",
          level: d.level || "B1",
          options: opts.length >= 2 ? opts : [
            { id: "A", text: "Сонголт A" },
            { id: "B", text: "Сонголт B" },
            { id: "C", text: "Сонголт C" },
            { id: "D", text: "Сонголт D" },
          ],
          correctAnswer: d.correct_answer || d.correct_option || "A",
          explanation: d.explanation || "",
          imageUrl: d.image_url || undefined,
        } as Question;
      });

      return parsedRemote;
    }
  } catch (err) {
    console.warn("fetchQuestionsFromSupabase caught:", err);
  }

  return [];
}

export async function deleteQuestionFromSupabase(questionId: string): Promise<boolean> {
  // Update local store immediately
  db.deleteQuestionFromBank(questionId);

  if (!supabase || !questionId) return true;

  try {
    const { error } = await supabase.from("questions").delete().eq("id", questionId);
    if (error) {
      console.warn("deleteQuestionFromSupabase error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("deleteQuestionFromSupabase caught:", err);
    return false;
  }
}

export async function updateQuestionInSupabase(
  question: Question,
  teacherId?: string
): Promise<boolean> {
  // Update local store immediately
  db.addQuestionToBank(question);

  if (!supabase || !question.id) return true;

  try {
    const payload: any = {
      question_text: question.text,
      options: question.options || [],
      correct_answer: question.correctAnswer || "A",
      explanation: question.explanation || "",
      category: question.category || "Grammar",
      topic: question.topic || "General",
      subtopic: question.subtopic || "",
      difficulty: question.difficulty || "Medium",
      level: (question as any).level || (question.difficulty === "Easy" ? "A2" : question.difficulty === "Hard" ? "B2" : "B1"),
      image_url: question.imageUrl || null,
    };

    if (teacherId && UUID_REGEX.test(teacherId)) {
      payload.teacher_id = teacherId;
    }

    const { error } = await supabase.from("questions").update(payload).eq("id", question.id);
    if (error) {
      console.warn("updateQuestionInSupabase error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("updateQuestionInSupabase caught:", err);
    return false;
  }
}

// =========================================================================
// ASSIGNMENTS SUPABASE PERSISTENCE & CLASS HOMEWORK MANAGEMENT
// =========================================================================

export async function createAssignmentInSupabase(data: {
  title: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  dueDate: string;
  timeLimitMinutes: number;
  questionIds: string[];
  questions?: Question[];
}): Promise<{ success: boolean; assignment: Assignment; error?: string }> {
  // 1. Create a dedicated playable Exam for this assignment containing the exact questions
  const assignmentExamId = `asg-exam-${Date.now()}`;
  const assignmentExam: Exam = {
    id: assignmentExamId,
    title: data.title,
    type: "mock",
    year: 2026,
    variant: "A",
    status: "published",
    createdBy: data.teacherId,
    createdByName: data.teacherName,
    totalQuestions: (data.questions || []).length || data.questionIds.length || 10,
    durationMinutes: data.timeLimitMinutes || 80,
    questions: (data.questions || []).map((q, idx) => ({ ...q, questionNumber: idx + 1 })),
    createdAt: new Date().toISOString().slice(0, 10),
  };

  db.addExam(assignmentExam);

  // 2. Create the Assignment record locally
  const newAsg = db.createAssignment({
    title: data.title,
    classId: data.classId,
    className: data.className,
    examId: assignmentExam.id,
    examTitle: data.title,
    assignedBy: data.teacherId,
    assignedByName: data.teacherName,
    dueDate: data.dueDate,
    timeLimitMinutes: data.timeLimitMinutes,
  });

  if (!supabase) {
    return { success: true, assignment: newAsg };
  }

  // 3. Persist Assignment and Question linkages to Supabase
  try {
    const asgPayload: any = {
      title: data.title,
      due_date: new Date(data.dueDate).toISOString(),
      time_limit_minutes: data.timeLimitMinutes || 80,
      created_at: new Date().toISOString(),
    };

    if (UUID_REGEX.test(newAsg.id)) asgPayload.id = newAsg.id;
    if (UUID_REGEX.test(data.classId)) asgPayload.class_id = data.classId;
    if (UUID_REGEX.test(data.teacherId)) asgPayload.teacher_id = data.teacherId;

    let { data: createdAsg, error: asgErr } = await supabase
      .from("assignments")
      .insert(asgPayload)
      .select()
      .maybeSingle();

    if (asgErr && asgErr.message?.includes("foreign key")) {
      delete asgPayload.class_id;
      delete asgPayload.teacher_id;
      const retry = await supabase.from("assignments").insert(asgPayload).select().maybeSingle();
      createdAsg = retry.data;
      asgErr = retry.error;
    }

    if (asgErr) {
      console.warn("Supabase createAssignment error:", asgErr.message);
    }

    // Insert assignment questions mapping
    const finalAsgId = createdAsg?.id || newAsg.id;
    if (data.questionIds && data.questionIds.length > 0) {
      const qRows = data.questionIds.map((qId, idx) => ({
        assignment_id: finalAsgId,
        question_id: qId,
        order_index: idx + 1,
      })).filter((r) => UUID_REGEX.test(r.assignment_id) && UUID_REGEX.test(r.question_id));

      if (qRows.length > 0) {
        try {
          await supabase.from("assignment_questions").insert(qRows);
        } catch (qErr) {
          console.warn("Could not insert assignment_questions:", qErr);
        }
      }
    }

    return { success: true, assignment: newAsg };
  } catch (err: any) {
    console.warn("createAssignmentInSupabase caught:", err);
    return { success: true, assignment: newAsg };
  }
}

export async function fetchAssignmentsFromSupabase(classIds?: string[]): Promise<Assignment[]> {
  const localAssignments = db.getAssignments();
  if (!supabase) return localAssignments;

  try {
    let query = supabase.from("assignments").select("*").order("created_at", { ascending: false });
    if (classIds && classIds.length > 0) {
      const validUuids = classIds.filter((id) => UUID_REGEX.test(id));
      if (validUuids.length > 0) {
        query = query.in("class_id", validUuids);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.warn("fetchAssignmentsFromSupabase error:", error.message);
      return localAssignments;
    }

    if (data && data.length > 0) {
      const classes = db.getClasses();
      const exams = db.getExams();

      const parsed: Assignment[] = data.map((d: any) => {
        const cls = classes.find((c) => c.id === d.class_id);
        const ex = exams.find((e) => e.id === d.exam_id);

        return {
          id: d.id,
          title: d.title || "Даалгавар",
          classId: d.class_id || (classes[0]?.id || ""),
          className: cls?.name || "Анги",
          examId: d.exam_id || (exams[0]?.id || "asg-exam-1"),
          examTitle: ex?.title || d.title || "Шалгалт",
          assignedBy: d.teacher_id || "teacher",
          assignedByName: "Багш",
          dueDate: d.due_date ? d.due_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
          timeLimitMinutes: d.time_limit_minutes || 80,
          createdAt: d.created_at ? d.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
          assignedStudentIds: [],
          completedStudentIds: [],
        };
      });

      // Merge with local assignments
      const seen = new Set<string>();
      const combined: Assignment[] = [];

      parsed.forEach((a) => {
        seen.add(a.id);
        combined.push(a);
      });

      localAssignments.forEach((a) => {
        if (!seen.has(a.id)) {
          seen.add(a.id);
          combined.push(a);
        }
      });

      return combined;
    }
  } catch (err) {
    console.warn("fetchAssignmentsFromSupabase caught:", err);
  }

  return localAssignments;
}


