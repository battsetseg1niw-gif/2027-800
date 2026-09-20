import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
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
        id: "usr-student-1",
        email: "student@smartesh.mn",
        name: "Баярсайхан Т.",
        role: "student",
        studentCode: "104829",
        school: "1-р лаборатори сургууль",
        grade: "12-р анги",
        classCodes: ["ESH-8842"],
        isPremium: false,
        joinedAt: "2026-01-15",
        targetEshScore: 720,
      },
      {
        id: "usr-student-2",
        email: "anudari@smartesh.mn",
        name: "Анударь М.",
        role: "student",
        studentCode: "104830",
        school: "1-р лаборатори сургууль",
        grade: "12-р анги",
        classCodes: ["ESH-8842"],
        isPremium: true,
        joinedAt: "2026-01-20",
        targetEshScore: 780,
      },
      {
        id: "usr-student-3",
        email: "temuulen@smartesh.mn",
        name: "Тэмүүлэн Б.",
        role: "student",
        studentCode: "104831",
        school: "1-р лаборатори сургууль",
        grade: "12-р анги",
        classCodes: ["ESH-8842"],
        isPremium: true,
        joinedAt: "2026-01-25",
        targetEshScore: 740,
      },
      {
        id: "usr-student-4",
        email: "enkhjin@smartesh.mn",
        name: "Энхжин С.",
        role: "student",
        studentCode: "104832",
        school: "1-р лаборатори сургууль",
        grade: "12-р анги",
        classCodes: ["ESH-8842"],
        isPremium: false,
        joinedAt: "2026-02-01",
        targetEshScore: 690,
      },
      {
        id: "usr-student-5",
        email: "khuslen@smartesh.mn",
        name: "Хүслэн Д.",
        role: "student",
        studentCode: "104833",
        school: "1-р лаборатори сургууль",
        grade: "12-р анги",
        classCodes: ["ESH-8842"],
        isPremium: false,
        joinedAt: "2026-02-05",
        targetEshScore: 710,
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
    ];
    const stored = this.getItem<UserProfile[]>("users", defaultUsers);
    // Guarantee admin and teacher roles always exist in the store, and ensure super admin email is matched
    let modified = false;
    const adminIndex = stored.findIndex((u) => u.role === "admin");
    if (adminIndex >= 0) {
      if (stored[adminIndex].email !== "battsetsegb615@gmail.com") {
        stored[adminIndex].email = "battsetsegb615@gmail.com";
        stored[adminIndex].name = "Батцэцэг (Super Admin)";
        modified = true;
      }
    } else {
      stored.push(defaultUsers[2]);
      modified = true;
    }
    defaultUsers.forEach((def) => {
      if (!stored.some((u) => u.id === def.id || (u.role === def.role && def.role === "admin"))) {
        stored.push(def);
        modified = true;
      }
    });
    if (modified) {
      this.setItem("users", stored);
    }
    return stored;
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
    const defaultClasses: ClassRoom[] = [
      {
        id: "cls-1",
        name: "12А Анги - ЭЕШ 800 Бүлэг",
        code: "ESH-8842",
        teacherId: "usr-teacher-1",
        teacherName: "Оюунцэцэг Багш",
        description: "2026 оны ЭЕШ-д 700+ оноо зорилтот эрчимжүүлсэн анги",
        studentIds: ["usr-student-1", "usr-student-2", "usr-student-3"],
        createdAt: "2026-02-01",
      },
      {
        id: "cls-2",
        name: "12Б Анги - Дүрмийн эрчимжүүлсэн анги",
        code: "ESH-5519",
        teacherId: "usr-teacher-1",
        teacherName: "Оюунцэцэг Багш",
        description: "Grammar & Vocabulary суурийг бэхжүүлэх тусгай бүлэг",
        studentIds: ["usr-student-1"],
        createdAt: "2026-02-15",
      },
    ];
    return this.getItem<ClassRoom[]>("classes", defaultClasses);
  }

  static saveClasses(classes: ClassRoom[]) {
    this.setItem("classes", classes);
  }

  // Assignments
  static getAssignments(): Assignment[] {
    const defaultAssignments: Assignment[] = [
      {
        id: "asg-1",
        title: "2024 оны ЭЕШ - Хувилбар A (Бүрэн тест)",
        classId: "cls-1",
        className: "12А Анги - ЭЕШ 800 Бүлэг",
        teacherId: "usr-teacher-1",
        examId: "esh-2024-a",
        examTitle: "ЭЕШ 2024 - Хувилбар A (Албан ёсны)",
        dueDate: "2026-09-30",
        timeLimitMinutes: 80,
        assignedStudentIds: [],
        createdAt: "2026-03-01",
      },
      {
        id: "asg-2",
        title: "Grammar Mastery: Conditionals & Tenses",
        classId: "cls-1",
        className: "12А Анги - ЭЕШ 800 Бүлэг",
        teacherId: "usr-teacher-1",
        examId: "esh-mock-2026-1",
        examTitle: "SmartESH Mock Test 2026 #1",
        dueDate: "2026-10-15",
        timeLimitMinutes: 40,
        assignedStudentIds: [],
        createdAt: "2026-03-05",
      },
    ];
    return this.getItem<Assignment[]>("assignments", defaultAssignments);
  }

  static saveAssignments(assignments: Assignment[]) {
    this.setItem("assignments", assignments);
  }

  // Submissions
  static getSubmissions(): ExamSubmission[] {
    const defaultSubmissions: ExamSubmission[] = [
      {
        id: "sub-1",
        examId: "esh-2024-a",
        examTitle: "ЭЕШ 2024 - Хувилбар A (Албан ёсны)",
        examType: "past_paper",
        userId: "usr-student-1",
        userName: "Баярсайхан Т.",
        source: "digital",
        answers: { 1: "B", 2: "C", 3: "A", 4: "B", 5: "B" },
        rawScore: 42,
        percentage: 84,
        scaledScore: 685,
        timeSpentSeconds: 3840,
        categoryScores: {
          Grammar: { correct: 18, total: 20 },
          Vocabulary: { correct: 12, total: 15 },
          Communication: { correct: 5, total: 5 },
          Reading: { correct: 7, total: 10 },
        },
        wrongQuestionIds: ["q-vocab-4", "q-read-8"],
        submittedAt: "2026-03-10T14:30:00Z",
      },
      {
        id: "sub-omr-1",
        examId: "esh-2023-a",
        examTitle: "ЭЕШ 2023 - Хувилбар A",
        examType: "past_paper",
        userId: "usr-student-1",
        userName: "Баярсайхан Т.",
        studentCode: "104829",
        studentRegNo: "104829",
        source: "omr_paper",
        answers: { 1: "A", 2: "B", 3: "D" },
        rawScore: 39,
        percentage: 78,
        scaledScore: 640,
        timeSpentSeconds: 4800,
        categoryScores: {
          Grammar: { correct: 16, total: 20 },
          Vocabulary: { correct: 11, total: 15 },
          Communication: { correct: 4, total: 5 },
          Reading: { correct: 8, total: 10 },
        },
        wrongQuestionIds: ["q-grammar-3"],
        submittedAt: "2026-03-12T10:15:00Z",
        reviewedByTeacher: true,
        aiAnalysis: {
          summary: "Сурагч Баярсайхан Т. цаасан OMR шалгалтаар 50 асуултаас 39 зөв хариулж, ЭЕШ-ийн 640 хуваарьт оноо авлаа. Эх унших чадвар болон харилцан ярианы хэсгүүдэд маш сайн гүйцэтгэл үзүүлсэн боловч дүрмийн хэсэгт 'Conditionals (Нөхцөлт өгүүлбэр)' болон 'Past Perfect' сэдвүүд дээр эргэлзэж алдсан байна.",
          strengths: [
            "Reading Comprehension эхийн гол агуулга ба зохиогчийн санааг 80% зөв тодорхойлсон",
            "Communication хэсгийн өдөр тутмын болон албаны харилцааны хэллэгийг 100% зөв сонгосон",
          ],
          weaknesses: [
            "Conditionals дүрэм дээр If + had + V3 бүтцийг Would + V1-тэй хольж андуурсан",
            "Phrasal Verbs-ийн салаа утгуудыг контекстоос ялгахад анхаарах шаардлагатай",
          ],
          recommendedTopics: [
            {
              topic: "Conditionals (Нөхцөлт өгүүлбэр)",
              subtopic: "Type 2 & Type 3 ялгаа",
              priority: "High",
              reason: "Шалгалтын 2 ба 12-р асуултууд дээр хоёуланд нь алдсан. Дүрмийн бүтцээ дахин бататгах шаардлагатай.",
              suggestedAction: "Learning Center-ийн 'Conditionals' хичээлийг үзэж, 15 тестийг ажиллах.",
            },
            {
              topic: "Phrasal Verbs (Хэллэг үйл үг)",
              subtopic: "Turn down / Turn up / Look forward to",
              priority: "Medium",
              reason: "Үгийн баялгийн хэсэгт 1 асуулт дээр эргэлзэж алдсан.",
              suggestedAction: "ЭЕШ-д хамгийн их давтагддаг 30 хэллэг үйл үгийг бататгах.",
            },
          ],
        },
      },
    ];
    return this.getItem<ExamSubmission[]>("submissions", defaultSubmissions);
  }

  static saveSubmissions(subs: ExamSubmission[]) {
    this.setItem("submissions", subs);
  }

  // Mistakes
  static getMistakes(): MistakeItem[] {
    return this.getItem<MistakeItem[]>("mistakes", []);
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
        title: "Багш даалгавар өглөө",
        message: "Оюунцэцэг багш 12А ангид '2024 оны ЭЕШ - Хувилбар A' даалгаврыг 9-р сарын 30-ны хугацаатай өглөө.",
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
    const defaultTickets: SupportTicket[] = [
      {
        id: "tkt-1",
        userId: "usr-student-1",
        userName: "Баярсайхан Т.",
        userEmail: "student@smartesh.mn",
        subject: "QPay төлбөр шалгах хүсэлт",
        message: "Би QPay-ээр 20,000₮ шилжүүлсэн, баримтын дугаар #88412. Идэвхжүүлэх кодоо авъя.",
        category: "payment",
        status: "resolved",
        createdAt: "2026-03-10",
        reply: "Таны төлбөр баталгаажлаа. Таны идэвхжүүлэх код: ESH-STU-8812. Амжилт хүсье!",
      },
    ];
    return this.getItem<SupportTicket[]>("support_tickets", defaultTickets);
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

  saveSubmission: (sub: ExamSubmission): void => {
    const subs = LocalDatabaseStore.getSubmissions();
    LocalDatabaseStore.saveSubmissions([sub, ...subs]);
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

    if (existingIdx >= 0) {
      list[existingIdx].mistakeCount = (list[existingIdx].mistakeCount || 1) + 1;
      list[existingIdx].userLastAnswer = data.userLastAnswer;
      list[existingIdx].date = new Date().toISOString().slice(0, 10);
    } else {
      list.unshift({
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
      });
    }
    LocalDatabaseStore.saveMistakes(list);
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
