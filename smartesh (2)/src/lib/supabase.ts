import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Role,
  UserProfile,
  Exam,
  Question,
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

// Environment variables for live Supabase instance
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

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
  target_esh_score INT DEFAULT 650,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  ));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

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

-- 4. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id),
  exam_id UUID NOT NULL REFERENCES public.exams(id),
  due_date TIMESTAMPTZ NOT NULL,
  time_limit_minutes INT DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignment access"
  ON public.assignments FOR SELECT
  USING (teacher_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.class_members WHERE class_id = public.assignments.class_id AND student_id = auth.uid()
  ));

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

CREATE POLICY "Students see own submissions, Teachers see class submissions"
  ON public.submissions FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  ));

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

CREATE POLICY "Users own their mistakes"
  ON public.mistakes FOR ALL
  USING (user_id = auth.uid());

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

  // Users
  static getUsers(): UserProfile[] {
    const defaultUsers: UserProfile[] = [
      {
        id: "usr-admin-1",
        email: "battsetsegb615@gmail.com",
        name: "Батцэцэг (Super Admin)",
        role: "admin",
        school: "SmartESH Төв",
        grade: "Системийн Ерөнхий Админ (Эзэмшигч)",
        isPremium: true,
        premiumExpiresAt: "2030-12-31",
        joinedAt: "2025-01-01",
      },
      {
        id: "usr-teacher-1",
        email: "teacher@smartesh.mn",
        name: "Оюунцэцэг Багш",
        role: "teacher",
        school: "Улаанбаатар 1-р сургууль",
        grade: "Англи хэлний ахлах багш",
        classCodes: [],
        isPremium: true,
        premiumExpiresAt: "2027-02-01",
        joinedAt: "2025-09-01",
      },
    ];
    const stored = this.getItem<UserProfile[]>("users", defaultUsers);
    // Guarantee admin and teacher roles always exist in the store, and filter out old mock students
    const filtered = stored.filter(
      (u) => !u.id.startsWith("usr-student-")
    );
    let modified = false;
    const adminIndex = filtered.findIndex((u) => u.role === "admin");
    if (adminIndex === -1) {
      filtered.unshift(defaultUsers[0]);
      modified = true;
    } else {
      filtered[adminIndex].isPremium = true;
      if (filtered[adminIndex].email?.trim().toLowerCase() === "battsetsegb615@gmail.com") {
        filtered[adminIndex].role = "admin";
      }
    }
    const teacherIndex = filtered.findIndex((u) => u.role === "teacher");
    if (teacherIndex === -1) {
      filtered.push(defaultUsers[1]);
      modified = true;
    }
    if (modified || filtered.length !== stored.length) {
      this.saveUsers(filtered);
    }
    return filtered;
  }

  static saveUsers(users: UserProfile[]) {
    this.setItem("users", users);
  }

  // Active User session
  static getCurrentUser(): UserProfile {
    const defaultUser = this.getUsers()[0];
    return this.getItem<UserProfile>("current_user", defaultUser);
  }

  static setCurrentUser(user: UserProfile) {
    this.setItem("current_user", user);
  }

  // Classes
  static getClasses(): ClassRoom[] {
    const stored = this.getItem<ClassRoom[]>("classes", []);
    // Filter out old mock classes
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
    // Filter out old mock assignments
    const filtered = stored.filter((a) => a.id !== "asg-1" && a.id !== "asg-2");
    if (filtered.length !== stored.length) {
      this.saveAssignments(filtered);
    }
    return filtered;
  }

  static saveAssignments(assignments: Assignment[]) {
    this.setItem("assignments", assignments);
  }

  // Submissions
  static getSubmissions(): ExamSubmission[] {
    const list = this.getItem<ExamSubmission[]>("submissions", []);
    // Remove legacy fake mock submissions from any previous seeds
    const filtered = list.filter(
      (s) => s.id !== "sub-1" && s.id !== "sub-omr-1" && s.userId !== "usr-student-1"
    );
    if (filtered.length !== list.length) {
      this.saveSubmissions(filtered);
    }
    return filtered;
  }

  static saveSubmissions(subs: ExamSubmission[]) {
    this.setItem("submissions", subs);
  }

  // Mistakes
  static getMistakes(): MistakeItem[] {
    const list = this.getItem<MistakeItem[]>("mistakes", []);
    const filtered = list.filter((m) => m.userId !== "usr-student-1");
    if (filtered.length !== list.length) {
      this.saveMistakes(filtered);
    }
    return filtered;
  }

  static saveMistakes(mistakes: MistakeItem[]) {
    this.setItem("mistakes", mistakes);
  }

  // Activation Codes
  static getActivationCodes(): ActivationCode[] {
    const defaultCodes: ActivationCode[] = [
      {
        id: "code-1",
        code: "ESH-STU-8812",
        targetRole: "student",
        durationDays: 365,
        isRedeemed: false,
        createdAt: "2026-03-01",
      },
      {
        id: "code-2",
        code: "ESH-STU-9943",
        targetRole: "student",
        durationDays: 365,
        isRedeemed: false,
        createdAt: "2026-03-05",
      },
      {
        id: "code-3",
        code: "ESH-TCH-4410",
        targetRole: "teacher",
        durationDays: 365,
        isRedeemed: false,
        createdAt: "2026-03-08",
      },
      {
        id: "code-4",
        code: "ESH-STU-DEMO",
        targetRole: "student",
        durationDays: 365,
        isRedeemed: false,
        createdAt: "2026-03-10",
      },
    ];
    return this.getItem<ActivationCode[]>("activation_codes", defaultCodes);
  }

  static saveActivationCodes(codes: ActivationCode[]) {
    this.setItem("activation_codes", codes);
  }

  // Notifications
  static getNotifications(): NotificationItem[] {
    const defaultNotifications: NotificationItem[] = [
      {
        id: "notif-1",
        title: "2026 оны ЭЕШ-ийн шинэ Mock Test нэмэгдлээ",
        message: "Боловсролын Үнэлгээний Төвийн 2026 оны стандартад нийцсэн шинэ сорилтууд системд нийтлэгдлээ.",
        targetRole: "all",
        createdAt: "2026-03-12",
        read: false,
      },
      {
        id: "notif-2",
        title: "Шинэ сорилт хуваарилагдлаа",
        message: "Багшийн даалгавар хэсэгт 2024 оны ЭЕШ-ийн сорилт нэмэгдсэн байна.",
        targetRole: "student",
        createdAt: "2026-03-14",
        read: false,
      },
      {
        id: "notif-3",
        title: "Цаасан Answer Sheet OMR модуль шинэчлэгдлээ",
        message: "Шалгалтын цаасан хуудсыг утсаараа зураг дарж оруулаад хиймэл оюунаар шууд оноо тооцох боломжтой боллоо.",
        targetRole: "all",
        createdAt: "2026-03-15",
        read: true,
      },
    ];
    return this.getItem<NotificationItem[]>("notifications", defaultNotifications);
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

  // Exams
  getExams: (): Exam[] => {
    const stored = LocalDatabaseStore.getItem<Exam[]>("exams", INITIAL_EXAMS);
    // If stored exams list is missing the 84 past papers (e.g. from an earlier build), auto-supplement them!
    const pastPaperCount = (stored || []).filter((e) => e.type === "past_paper").length;
    if (!stored || stored.length < 80 || pastPaperCount < 80) {
      const existingIds = new Set((stored || []).map((e) => e.id));
      const merged = [...(stored || [])];
      for (const def of INITIAL_EXAMS) {
        if (!existingIds.has(def.id)) {
          merged.push(def);
          existingIds.add(def.id);
        }
      }
      LocalDatabaseStore.setItem("exams", merged);
      return merged;
    }
    return stored;
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
    LocalDatabaseStore.setItem("exams", INITIAL_EXAMS);
    return INITIAL_EXAMS;
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
  getSubmissions: (): ExamSubmission[] => LocalDatabaseStore.getSubmissions(),

  saveSubmissions: (subs: ExamSubmission[]): void => {
    LocalDatabaseStore.saveSubmissions(subs);
  },

  saveSubmission: (sub: ExamSubmission): void => {
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
  getMistakes: (): MistakeItem[] => LocalDatabaseStore.getMistakes(),

  recordMistake: (data: {
    userId: string;
    examId: string;
    question: any;
    userLastAnswer: string;
    smartFeedback?: string;
  }): void => {
    const list = LocalDatabaseStore.getMistakes();
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
    return sets[0] || INITIAL_DAILY_VOCABULARY_SETS[0];
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
  const isSuperAdminEmail = email.trim().toLowerCase() === "battsetsegb615@gmail.com";
  const userRole = isSuperAdminEmail ? "admin" : role;

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: password || "SmartESH2026!",
    options: {
      data: {
        name,
        role: userRole,
        school: school || "",
        grade: grade || "",
      },
    },
  });
  if (error) throw error;

  if (data.user) {
    try {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: email.trim(),
        name,
        role: userRole,
        school: school || "",
        grade: grade || "",
        is_premium: userRole === "admin",
        target_esh_score: 650,
      });
    } catch (e) {
      console.warn("Profile table insert notice:", e);
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
        targetEshScore: data.target_esh_score || 720,
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
        targetEshScore: 720,
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
// Live Supabase Sync Functions for Submissions & Mistakes
// -------------------------------------------------------------

export async function saveSubmissionToSupabase(sub: ExamSubmission): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id || sub.userId;

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
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id || m.userId;

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
  if (!supabase || !userId) return [];
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

