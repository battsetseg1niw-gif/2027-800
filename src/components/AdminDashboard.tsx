import React, { useState, useMemo } from "react";
import {
  Shield,
  Upload,
  Sparkles,
  FileCheck,
  Send,
  Users,
  Key,
  MessageSquare,
  Plus,
  CheckCircle2,
  Trash2,
  Eye,
  AlertCircle,
  Copy,
  Check,
  FileUp,
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  Search,
  Download,
  Target,
  PieChart,
  BookOpen,
  Database,
} from "lucide-react";
import {
  Exam,
  Question,
  ActivationCode,
  NotificationItem,
  SupportTicket,
  UserProfile,
  ExamSubmission,
  ClassRoom,
} from "../types";
import { AdminContentManager } from "./AdminContentManager";
import { PreviousExamImport } from "./PreviousExamImport";
import { AdminUserManagement } from "./admin/AdminUserManagement";
import { AdminGlobalQuestionBank } from "./admin/AdminGlobalQuestionBank";
import { AdminRegionalReports } from "./admin/AdminRegionalReports";

interface AdminDashboardProps {
  exams: Exam[];
  questions?: Question[];
  users: UserProfile[];
  activationCodes: ActivationCode[];
  notifications: NotificationItem[];
  supportTickets: SupportTicket[];
  submissions?: ExamSubmission[];
  classes?: ClassRoom[];
  onPublishExam: (newExam: Exam) => void;
  onDeleteExam?: (examId: string) => void;
  onStartExam?: (exam: Exam, mode?: "mock" | "practice") => void;
  onGenerateActivationCode: (targetRole: "student" | "teacher") => ActivationCode;
  onSendNotification: (title: string, message: string, targetRole: "all" | "student" | "teacher") => void;
  onReplySupportTicket: (ticketId: string, replyText: string) => void;
  onToggleUserPremium: (userId: string) => void;
  onUpdateUserProfile?: (userId: string, updates: Partial<UserProfile>) => Promise<boolean> | void;
  onCreateOfficialMockExam?: (exam: Exam) => Promise<boolean> | void;
  onDeleteQuestion?: (questionId: string) => Promise<boolean> | void;
  onUpdateQuestion?: (question: Question) => Promise<boolean> | void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  exams,
  questions = [],
  users,
  activationCodes,
  notifications,
  supportTickets,
  submissions = [],
  classes = [],
  onPublishExam,
  onDeleteExam,
  onStartExam,
  onGenerateActivationCode,
  onSendNotification,
  onReplySupportTicket,
  onToggleUserPremium,
  onUpdateUserProfile,
  onCreateOfficialMockExam,
  onDeleteQuestion,
  onUpdateQuestion,
}) => {
  const [adminTab, setAdminTab] = useState<
    "overview" | "users" | "question-bank" | "regional-reports" | "content-manager" | "previous-exam-import" | "pdf-converter" | "activation-codes" | "broadcast" | "support"
  >("overview");

  // PDF / Exam Text AI Extraction state
  const [examTitle, setExamTitle] = useState("2026 оны ЭЕШ Шинэ Хувилбар");
  const [examYear, setExamYear] = useState(2026);
  const [examVariant, setExamVariant] = useState<"A" | "B" | "C" | "D" | "Mock">("Mock");
  const [rawExamText, setRawExamText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<Question[]>([]);
  const [extractSuccess, setExtractSuccess] = useState(false);

  // Broadcast state
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifRole, setNotifRole] = useState<"all" | "student" | "teacher">("all");

  // Code generator state
  const [selectedRoleForCode, setSelectedRoleForCode] = useState<"student" | "teacher">("student");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Support ticket reply modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Admin All Users Analytics states
  const [analyticsRoleFilter, setAnalyticsRoleFilter] = useState<"all" | "student" | "teacher" | "admin">("all");
  const [analyticsSearch, setAnalyticsSearch] = useState("");
  const [selectedUserProgress, setSelectedUserProgress] = useState<UserProfile | null>(null);

  // System Overview computed metrics
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalTeachers = users.filter((u) => u.role === "teacher").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalQuestionsInBank = useMemo(() => {
    const standaloneIds = new Set(questions.map((q) => q.id));
    let examCount = 0;
    exams.forEach((e) => {
      (e.questions || []).forEach((q) => {
        if (!standaloneIds.has(q.id)) {
          examCount++;
        }
      });
    });
    return questions.length + examCount;
  }, [exams, questions]);
  const totalExamsTaken = submissions.length;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // AI PDF & Text Extraction
  const handleAIExtract = async () => {
    setIsExtracting(true);
    setExtractSuccess(false);

    try {
      const res = await fetch("/api/ai/parse-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: rawExamText,
          examTitle,
          year: examYear,
        }),
      });
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions)) {
        const formatted: Question[] = data.questions.map((q: any, i: number) => ({
          id: `ext-q-${Date.now()}-${i + 1}`,
          questionNumber: q.questionNumber || i + 1,
          text: q.text || `Question ${i + 1}`,
          category: q.category || "Grammar",
          topic: q.topic || "Exam Topic",
          subtopic: q.subtopic || "Subtopic",
          difficulty: "Medium",
          options: q.options || [
            { id: "A", text: "Option A" },
            { id: "B", text: "Option B" },
            { id: "C", text: "Option C" },
            { id: "D", text: "Option D" },
            { id: "E", text: "Option E" },
          ],
          correctAnswer: q.correctAnswer || "B",
          explanation: q.explanation || "ЭЕШ-ийн зөв хариултын тайлбар.",
        }));

        setExtractedQuestions(formatted);
        setExtractSuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  // Publish Extracted Exam
  const handlePublishExam = () => {
    if (extractedQuestions.length === 0) return;

    const newExam: Exam = {
      id: `esh-${examYear}-${examVariant.toLowerCase()}-${Date.now()}`,
      title: `${examYear} оны ЭЕШ - Англи хэл (Хувилбар ${examVariant})`,
      year: examYear,
      variant: examVariant,
      type: examVariant === "Mock" ? "mock" : "past_paper",
      totalQuestions: extractedQuestions.length,
      durationMinutes: 80,
      questions: extractedQuestions,
      status: "published",
      createdBy: "usr-admin-1",
      createdByName: "SmartESH Админ",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onPublishExam(newExam);
    setExtractedQuestions([]);
    setExtractSuccess(false);
    setRawExamText("");
    alert("Тест амжилттай шалгагдаж, 2006–2026 сан болон Question Bank-д нийтлэгдлээ!");
  };

  const handleSendNotif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    onSendNotification(notifTitle.trim(), notifMessage.trim(), notifRole);
    setNotifTitle("");
    setNotifMessage("");
    alert("Мэдэгдэл бүх холбогдох хэрэглэгчдэд илгээгдлээ!");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>SmartESH Системийн Ерөнхий Админ Хэсэг</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Publish & Control Center</h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              PDF/Текст сорилыг AI-аар задалж дижитал болгох, Skill → Topic → Subtopic ангилах, Activation Code үүсгэх,
              гомдол хүсэлт шийдвэрлэх.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onGenerateActivationCode(selectedRoleForCode)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              <Key className="w-4 h-4" />
              <span>Шинэ Идэвхжүүлэх Код Үүсгэх</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Нийт хэрэглэгчид</div>
            <div className="text-2xl font-extrabold text-blue-300 mt-1">{users.length}</div>
            <div className="text-[10px] text-slate-300 mt-1">
              {totalStudents} сурагч • {totalTeachers} багш
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Асуултын сан</div>
            <div className="text-2xl font-extrabold text-purple-300 mt-1">{totalQuestionsInBank} асуулт</div>
            <div className="text-[10px] text-slate-300 mt-1">4 бүлэг, 2006–2026 сан</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Өгсөн нийт шалгалт</div>
            <div className="text-2xl font-extrabold text-emerald-300 mt-1">{totalExamsTaken} сорилт</div>
            <div className="text-[10px] text-slate-300 mt-1">OMR цаасан & Дижитал</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Идэвхжүүлэх код</div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">{activationCodes.length} код</div>
            <div className="text-[10px] text-slate-300 mt-1">365 хоногийн эрхтэй</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Гомдол хүсэлт</div>
            <div className="text-2xl font-extrabold text-rose-300 mt-1">{supportTickets.length} тикет</div>
            <div className="text-[10px] text-slate-300 mt-1">Хэрэглэгчийн дэмжлэг</div>
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-3 text-xs font-bold overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setAdminTab("overview")}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === "overview"
              ? "border-purple-600 text-purple-600 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Системийн тойм (Stats)</span>
        </button>

        <button
          onClick={() => setAdminTab("users")}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === "users"
              ? "border-purple-600 text-purple-600 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Хэрэглэгчийн удирдлага ({users.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("question-bank")}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === "question-bank"
              ? "border-purple-600 text-purple-600 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Асуултын нэгдсэн сан</span>
        </button>

        <button
          onClick={() => setAdminTab("regional-reports")}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === "regional-reports"
              ? "border-purple-600 text-purple-600 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Бүсийн тайлан</span>
        </button>

        <button
          onClick={() => setAdminTab("content-manager")}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === "content-manager"
              ? "border-purple-600 text-purple-600 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>ЭЕШ Шалгалтууд</span>
        </button>

        <button
          onClick={() => setAdminTab("previous-exam-import")}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === "previous-exam-import"
              ? "border-purple-600 text-purple-600 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>2026 Импорт</span>
        </button>

        <button
          onClick={() => setAdminTab("pdf-converter")}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === "pdf-converter"
              ? "border-purple-600 text-purple-600 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>PDF AI Хөрвүүлэгч</span>
        </button>

        <button
          onClick={() => setAdminTab("activation-codes")}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === "activation-codes"
              ? "border-purple-600 text-purple-600 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Кодууд ({activationCodes.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("broadcast")}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === "broadcast"
              ? "border-purple-600 text-purple-600 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Зарлал</span>
        </button>

        <button
          onClick={() => setAdminTab("support")}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            adminTab === "support"
              ? "border-purple-600 text-purple-600 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Дэмжлэг ({supportTickets.length})</span>
        </button>
      </div>

      {/* TAB 0: ALL USERS ANALYTICS & PROGRESS */}
      {adminTab === "overview" && (
        <div className="space-y-6">
          {/* Top Platform KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Нийт хэрэглэгчид</span>
                <span className="text-2xl font-black text-slate-900">{users.length}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {users.filter((u) => u.role === "student").length} сурагч • {users.filter((u) => u.role === "teacher").length} багш
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Нийт гүйцэтгэсэн шалгалт</span>
                <span className="text-2xl font-black text-slate-900">{submissions.length}</span>
                <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">
                  {submissions.filter((s) => s.source === "omr_paper").length} OMR цаасан • {submissions.filter((s) => s.source !== "omr_paper").length} Дижитал
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Системийн дундаж оноо</span>
                <span className="text-2xl font-black text-emerald-600">
                  {submissions.length > 0
                    ? Math.round(submissions.reduce((acc, s) => acc + s.scaledScore, 0) / submissions.length)
                    : 0}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">/ 800 ЭЕШ хуваарьт</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">Premium хэрэглэгчид</span>
                <span className="text-2xl font-black text-amber-600">
                  {users.filter((u) => u.isPremium).length}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {Math.round((users.filter((u) => u.isPremium).length / (users.length || 1)) * 100)}% идэвхжүүлэлт
                </span>
              </div>
            </div>
          </div>

          {/* 4 Skill Categories Mastery Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>Системийн хэмжээнд 4 бүлгийн чадамжийн дундаж</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Бүх сурагчдын гүйцэтгэсэн шалгалтуудаас тооцсон дүрмийн эзэмшлийн харьцаа
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {["Grammar", "Vocabulary", "Communication", "Reading"].map((category) => {
                let correct = 0;
                let total = 0;
                submissions.forEach((s) => {
                  if (s.categoryScores && s.categoryScores[category]) {
                    correct += s.categoryScores[category].correct;
                    total += s.categoryScores[category].total;
                  }
                });
                const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                const barColor =
                  pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : "bg-amber-500";

                return (
                  <div key={category} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-800">{category}</span>
                      <span className="text-slate-900 font-extrabold">{pct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>Зөв хариулт: {correct}</span>
                      <span>Нийт асуулт: {total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* School & Class Benchmarks */}
          {classes && classes.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>Сургууль, Ангиудын харьцуулсан үзүүлэлт</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => {
                  const classSubs = submissions.filter(
                    (s) => (s as any).classCode === cls.code || cls.studentIds?.includes(s.userId)
                  );
                  const classAvg =
                    classSubs.length > 0
                      ? Math.round(classSubs.reduce((a, b) => a + b.scaledScore, 0) / classSubs.length)
                      : 0;
                  const classMax =
                    classSubs.length > 0 ? Math.max(...classSubs.map((s) => s.scaledScore)) : 0;

                  return (
                    <div
                      key={cls.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{cls.name}</h4>
                          <span className="text-xs text-slate-500">
                            {cls.teacherName ? `Багш: ${cls.teacherName}` : cls.description || "SmartESH Анги"}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                          {cls.code}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Сурагч</span>
                          <span className="text-xs font-black text-slate-800">{cls.studentIds?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Дундаж оноо</span>
                          <span className="text-xs font-black text-emerald-600">{classAvg}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Дээд оноо</span>
                          <span className="text-xs font-black text-indigo-600">{classMax}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ALL USERS PROGRESS & ANALYTICS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span>Бүх хэрэглэгчдийн явц ба анализын нэгдсэн жагсаалт</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Сурагч ба багш нарын шалгалтын идэвх, эзэмшил, онооны өсөлтийн бүртгэл
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <button
                  onClick={() => {
                    const headers = ["ID,Нэр,Имэйл,Үүрэг,Сургууль,Анги,Өгсөн сорилт,Дундаж оноо,Дээд оноо,Premium"];
                    const rows = users.map((u) => {
                      const uSubs = submissions.filter((s) => s.userId === u.id || s.userName.toLowerCase() === u.name.toLowerCase());
                      const avg = uSubs.length > 0 ? Math.round(uSubs.reduce((a, b) => a + b.scaledScore, 0) / uSubs.length) : 0;
                      const max = uSubs.length > 0 ? Math.max(...uSubs.map((s) => s.scaledScore)) : 0;
                      return `"${u.id}","${u.name}","${u.email}","${u.role}","${u.school || ''}","${(u as any).classGrade || u.grade || ''}","${uSubs.length}","${avg}","${max}","${u.isPremium ? 'Тийм' : 'Үгүй'}"`;
                    });
                    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
                    const link = document.createElement("a");
                    link.setAttribute("href", encodeURI(csvContent));
                    link.setAttribute("download", `users_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV Экспорт</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
                {(["all", "student", "teacher", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setAnalyticsRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                      analyticsRoleFilter === r
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {r === "all" ? "Бүгд" : r === "student" ? "Сурагчид" : r === "teacher" ? "Багш нар" : "Админ"}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Нэр, имэйл, сургуулиар хайх..."
                  value={analyticsSearch}
                  onChange={(e) => setAnalyticsSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100/70 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Хэрэглэгч</th>
                    <th className="py-3 px-4">Сургууль / Анги</th>
                    <th className="py-3 px-4 text-center">Өгсөн сорилтууд</th>
                    <th className="py-3 px-4 text-center">Дундаж хуваарьт</th>
                    <th className="py-3 px-4 text-center">Дээд оноо</th>
                    <th className="py-3 px-4 text-center">Явцын төлөв</th>
                    <th className="py-3 px-4 text-center">Premium</th>
                    <th className="py-3 px-4 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users
                    .filter((u) => {
                      const matchesRole = analyticsRoleFilter === "all" || u.role === analyticsRoleFilter;
                      const matchesSearch =
                        analyticsSearch.trim() === "" ||
                        u.name.toLowerCase().includes(analyticsSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(analyticsSearch.toLowerCase()) ||
                        (u.school && u.school.toLowerCase().includes(analyticsSearch.toLowerCase()));
                      return matchesRole && matchesSearch;
                    })
                    .map((user) => {
                      const uSubs = submissions.filter(
                        (s) => s.userId === user.id || s.userName.toLowerCase() === user.name.toLowerCase()
                      );
                      const testsCount = uSubs.length;
                      const avgScore =
                        testsCount > 0
                          ? Math.round(uSubs.reduce((acc, s) => acc + s.scaledScore, 0) / testsCount)
                          : null;
                      const maxScore = testsCount > 0 ? Math.max(...uSubs.map((s) => s.scaledScore)) : null;
                      const omrCount = uSubs.filter((s) => s.source === "omr_paper").length;
                      const digitalCount = testsCount - omrCount;

                      let statusBadge = (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                          Эхлээгүй
                        </span>
                      );
                      if (testsCount >= 3) {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Идэвхтэй өсөлттэй ({testsCount})
                          </span>
                        );
                      } else if (testsCount > 0) {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            Суралцаж буй ({testsCount})
                          </span>
                        );
                      }

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-[11px] text-slate-500">{user.email}</div>
                            <span
                              className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "teacher"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div>{user.school || "—"}</div>
                            <div className="text-[11px] text-slate-500">
                              {(user as any).classGrade ? `${(user as any).classGrade}-р анги` : (user.grade || "")}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="font-extrabold text-slate-900">{testsCount}</div>
                            {testsCount > 0 && (
                              <div className="text-[10px] text-slate-500">
                                {omrCount > 0 && `${omrCount} OMR `}
                                {digitalCount > 0 && `${digitalCount} Диж`}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {avgScore !== null ? (
                              <span className="font-black text-emerald-600 text-sm">{avgScore}</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {maxScore !== null ? (
                              <span className="font-bold text-indigo-600">{maxScore}</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">{statusBadge}</td>
                          <td className="py-3 px-4 text-center">
                            {user.isPremium ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Premium
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                Free
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedUserProgress(user)}
                              className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors"
                            >
                              Явц харах
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PREVIOUS EXAM IMPORT (2026 ESH 4 VARIANTS A, B, C, D) */}
      {adminTab === "previous-exam-import" && (
        <PreviousExamImport
          onPublishExam={onPublishExam}
          existingExams={exams}
        />
      )}

      {/* TAB: CONTENT MANAGER (LESSONS, NEW EXAMS, PAST PAPERS, DAILY VOCAB) */}
      {adminTab === "content-manager" && (
        <AdminContentManager
          exams={exams}
          onPublishExam={onPublishExam}
          onDeleteExam={onDeleteExam}
          onStartExam={onStartExam}
          onSendNotification={onSendNotification}
        />
      )}

      {/* TAB 1: PDF CONVERTER & AI EXTRACTOR */}
      {adminTab === "pdf-converter" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  PDF / Шалгалтын текстийг Дижитал Тест болгон задлах (Gemini AI Extractor)
                </h3>
                <p className="text-xs text-slate-700 mt-0.5">
                  Цаасан болон PDF шалгалтын текстийг хуулж тавихад хиймэл оюун ухаан автоматаар асуулт, хариулт, түлхүүр,
                  монгол тайлбар, Skill → Topic → Subtopic болгон ангилна.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Шалгалтын гарчиг</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Он</label>
                <input
                  type="number"
                  value={examYear}
                  onChange={(e) => setExamYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Хувилбар</label>
                <select
                  value={examVariant}
                  onChange={(e) => setExamVariant(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="A">Хувилбар A</option>
                  <option value="B">Хувилбар B</option>
                  <option value="C">Хувилбар C</option>
                  <option value="D">Хувилбар D</option>
                  <option value="Mock">Mock Test</option>
                </select>
              </div>
            </div>

            {/* Paste or sample content */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Шалгалтын эх бичвэр (эсвэл PDF-ээс хуулсан текст)</label>
                <button
                  type="button"
                  onClick={() =>
                    setRawExamText(
                      `1. By the time the teacher entered, the students ________ all exercises.
A. have finished B. had finished C. will finish D. finishes E. were finished
Answer: B. Past perfect with by the time.

2. If she had studied harder, she ________ the examination.
A. passed B. will pass C. would have passed D. passes E. can pass
Answer: C. Third conditional structure.`
                    )
                  }
                  className="text-xs text-purple-600 font-bold hover:underline"
                >
                  Жишээ текст оруулах
                </button>
              </div>
              <textarea
                rows={6}
                value={rawExamText}
                onChange={(e) => setRawExamText(e.target.value)}
                placeholder="ЭЕШ-ийн асуултууд, хариултууд бүхий текстийг энд буулгана уу..."
                className="w-full p-3 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                disabled={isExtracting}
                onClick={handleAIExtract}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isExtracting ? "AI Боловсруулж байна..." : "AI-аар задалж бүтэцжүүлэх"}</span>
              </button>
            </div>
          </div>

          {/* AI REVIEW QUEUE & PUBLISH */}
          {extractedQuestions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-purple-200 shadow-md space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      AI Review Queue ({extractedQuestions.length} асуулт задлагдлаа)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    Асуулт тус бүрийн Skill → Topic → Subtopic ангилал болон зөв хариуг хянаад Publish хийнэ үү.
                  </p>
                </div>

                <button
                  id="btn-admin-publish-exam"
                  onClick={handlePublishExam}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Шалгалтыг Албан ёсоор Нийтлэх (Publish)</span>
                </button>
              </div>

              <div className="space-y-3">
                {extractedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">#{idx + 1}.</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {q.category}
                        </span>
                        <span className="text-[11px] text-slate-700 font-medium">
                          Сэдэв: <span className="text-slate-900 font-bold">{q.topic}</span>
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Зөв хариу: {q.correctAnswer}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium">{q.text}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg text-xs font-medium border ${
                            opt.id === q.correctAnswer
                              ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {opt.id}. {opt.text}
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-100 mt-2">
                      <span className="font-bold text-slate-800">Монгол тайлбар: </span>
                      {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVATION CODES */}
      {adminTab === "activation-codes" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Нэг удаагийн Идэвхжүүлэх Кодууд (Activation Codes)</h3>
              <p className="text-xs text-slate-700">
                Сурагч (20,000₮/жил) болон Багш (40,000₮/жил) эрхтэй 365 хоногийн нэг удаагийн код.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedRoleForCode}
                onChange={(e) => setSelectedRoleForCode(e.target.value as any)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
              >
                <option value="student">Сурагч (20,000₮)</option>
                <option value="teacher">Багш (40,000₮)</option>
              </select>

              <button
                id="btn-generate-code"
                onClick={() => onGenerateActivationCode(selectedRoleForCode)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Код үүсгэх</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-700">
                  <th className="pb-3 font-semibold">Идэвхжүүлэх код</th>
                  <th className="pb-3 font-semibold">Зориулалт</th>
                  <th className="pb-3 font-semibold">Үнэ</th>
                  <th className="pb-3 font-semibold">Хугацаа</th>
                  <th className="pb-3 font-semibold">Төлөв</th>
                  <th className="pb-3 font-semibold">Үүсгэсэн огноо</th>
                  <th className="pb-3 font-semibold text-right">Хуулах</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {activationCodes.map((ac) => (
                  <tr key={ac.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900">{ac.code}</td>
                    <td className="py-3 font-sans capitalize">
                      {ac.targetRole === "student" ? "🎓 Сурагч" : "👨‍🏫 Багш"}
                    </td>
                    <td className="py-3 font-sans">
                      {ac.targetRole === "student" ? "20,000₮" : "40,000₮"}
                    </td>
                    <td className="py-3 font-sans">{ac.durationDays} хоног</td>
                    <td className="py-3 font-sans">
                      {ac.isRedeemed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          Ашиглагдсан ({ac.redeemedByName || "Хэрэглэгч"})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Идэвхтэй (Ашиглагдаагүй)
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-sans text-slate-700">{ac.createdAt}</td>
                    <td className="py-3 text-right font-sans">
                      <button
                        onClick={() => handleCopy(ac.code, ac.id)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                      >
                        {copiedCodeId === ac.id ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Хууллаа
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Хуулах
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: USERS MANAGEMENT */}
      {adminTab === "users" && (
        <AdminUserManagement
          users={users}
          onToggleUserPremium={onToggleUserPremium}
          onUpdateUserProfile={onUpdateUserProfile || (() => {})}
          onViewUserProgress={(user) => setSelectedUserProgress(user)}
        />
      )}

      {/* TAB: GLOBAL QUESTION BANK */}
      {adminTab === "question-bank" && (
        <AdminGlobalQuestionBank
          questions={questions}
          exams={exams}
          onDeleteQuestion={onDeleteQuestion}
          onUpdateQuestion={onUpdateQuestion}
          onCreateOfficialMockExam={onCreateOfficialMockExam}
        />
      )}

      {/* TAB: REGIONAL REPORTS */}
      {adminTab === "regional-reports" && (
        <AdminRegionalReports users={users} submissions={submissions} />
      )}

      {/* TAB 4: BROADCAST NOTIFICATIONS */}
      {adminTab === "broadcast" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Бүх Хэрэглэгчдэд Зарлал Илгээх (Broadcast)</h3>
            <p className="text-xs text-slate-700">Шалгалтын зарлал, шинэ тестийн мэдэгдлийг бүх системд цацах</p>
          </div>

          <form onSubmit={handleSendNotif} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Мэдэгдлийн гарчиг</label>
              <input
                type="text"
                required
                placeholder="ж нь: 2026 оны ЭЕШ-ийн шинэ тест нэмэгдлээ"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Зорилтот бүлэг</label>
              <select
                value={notifRole}
                onChange={(e) => setNotifRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="all">Бүх хэрэглэгчид (Сурагч + Багш)</option>
                <option value="student">Зөвхөн Сурагчид</option>
                <option value="teacher">Зөвхөн Багш нар</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Дэлгэрэнгүй агуулга</label>
              <textarea
                rows={3}
                required
                placeholder="Мэдэгдлийн дэлгэрэнгүй мэдээлэл..."
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Нийтэд илгээх</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: SUPPORT TICKETS */}
      {adminTab === "support" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Гомдол хүсэлт & Хэрэглэгчийн Дэмжлэг</h3>
            <p className="text-xs text-slate-700">Төлбөр баталгаажуулалт болон хэрэглэгчдийн санал хүсэлт</p>
          </div>

          <div className="divide-y divide-slate-100">
            {supportTickets.map((tkt) => (
              <div key={tkt.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{tkt.subject}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {tkt.category}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tkt.status === "resolved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {tkt.status === "resolved" ? "Шийдвэрлэгдсэн" : "Нээлттэй"}
                  </span>
                </div>

                <p className="text-xs text-slate-800">{tkt.message}</p>
                <div className="text-[11px] text-slate-700 flex items-center justify-between">
                  <span>
                    Илгээсэн: {tkt.userName} ({tkt.userEmail}) • {tkt.createdAt}
                  </span>
                  {!tkt.reply ? (
                    <button
                      onClick={() => setSelectedTicket(tkt)}
                      className="text-xs text-purple-600 font-bold hover:underline"
                    >
                      Хариу бичих
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium">Хариулсан</span>
                  )}
                </div>

                {tkt.reply && (
                  <div className="bg-purple-50 p-2.5 rounded-xl text-xs text-purple-900 border border-purple-100 mt-1">
                    <span className="font-bold">Админы хариу: </span>
                    {tkt.reply}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reply Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">Хариу илгээх</h3>
                <p className="text-xs text-slate-700 font-medium">{selectedTicket.subject}</p>
                <textarea
                  rows={4}
                  placeholder="Хэрэглэгчид илгээх хариу мэдэгдэл..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Болих
                  </button>
                  <button
                    onClick={() => {
                      if (!replyMessage.trim()) return;
                      onReplySupportTicket(selectedTicket.id, replyMessage.trim());
                      setSelectedTicket(null);
                      setReplyMessage("");
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
                  >
                    Илгээх
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* USER PROGRESS DETAILS MODAL */}
      {selectedUserProgress && (() => {
        const userSubs = submissions.filter(
          (s) => s.userId === selectedUserProgress.id || s.userName.toLowerCase() === selectedUserProgress.name.toLowerCase()
        );
        const avgScore = userSubs.length > 0 ? Math.round(userSubs.reduce((a, b) => a + b.scaledScore, 0) / userSubs.length) : 0;
        const maxScore = userSubs.length > 0 ? Math.max(...userSubs.map((s) => s.scaledScore)) : 0;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">{selectedUserProgress.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        selectedUserProgress.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : selectedUserProgress.role === "teacher"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {selectedUserProgress.role}
                    </span>
                    {selectedUserProgress.isPremium && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedUserProgress.email} • {selectedUserProgress.school || "Сургууль тодорхойгүй"}{" "}
                    {(selectedUserProgress as any).classGrade || selectedUserProgress.grade ? `(${(selectedUserProgress as any).classGrade || selectedUserProgress.grade})` : ""}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUserProgress(null)}
                  className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Progress Summary Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-purple-700 block">Нийт сорилт</span>
                  <span className="text-xl font-black text-purple-900">{userSubs.length}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-700 block">Дундаж оноо</span>
                  <span className="text-xl font-black text-emerald-600">{avgScore}</span>
                  <span className="text-[9px] text-emerald-600 block">/ 800</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-blue-700 block">Дээд амжилт</span>
                  <span className="text-xl font-black text-blue-600">{maxScore}</span>
                  <span className="text-[9px] text-blue-600 block">/ 800</span>
                </div>
              </div>

              {/* Exam Submissions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Гүйцэтгэсэн шалгалтуудын түүх:</h4>
                {userSubs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                    Энэ хэрэглэгч хараахан шалгалт өгөөгүй байна.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {userSubs.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:bg-slate-100/70 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{sub.examTitle}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  sub.source === "omr_paper"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {sub.source === "omr_paper" ? "OMR Цаасан" : "Дижитал"}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{sub.submittedAt}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-emerald-600 block">
                              {sub.scaledScore} <span className="text-[10px] text-slate-400 font-normal">/ 800</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold block">
                              {sub.rawScore}/50 ({sub.percentage}%)
                            </span>
                          </div>
                        </div>

                        {/* Skill scores */}
                        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] bg-white p-2 rounded-xl border border-slate-200">
                          {Object.entries(sub.categoryScores).map(([cat, scoreVal]) => {
                            const score = scoreVal as { correct: number; total: number };
                            return (
                              <div key={cat}>
                                <span className="text-slate-400 block text-[9px] truncate">{cat}</span>
                                <span className="font-bold text-slate-700">
                                  {score?.correct ?? 0}/{score?.total ?? 0}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Weak topics */}
                        {sub.weakTopics && sub.weakTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center pt-1">
                            <span className="text-[10px] font-bold text-rose-600">Алдсан сэдэв:</span>
                            {sub.weakTopics.map((top, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-medium"
                              >
                                {top}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedUserProgress(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Хаах
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
