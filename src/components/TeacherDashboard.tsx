import React, { useState } from "react";
import {
  Users,
  PlusCircle,
  FileText,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  Sparkles,
  BarChart2,
  Layers,
  Copy,
  Check,
  Search,
  Target,
  TrendingUp,
  PieChart,
  HelpCircle,
  Activity,
  Eye,
} from "lucide-react";
import { ClassRoom, Assignment, Exam, ExamSubmission, UserProfile, OMRScanRecord } from "../types";

interface TeacherDashboardProps {
  currentUser: UserProfile;
  classes: ClassRoom[];
  assignments: Assignment[];
  exams: Exam[];
  submissions: ExamSubmission[];
  omrScans: OMRScanRecord[];
  onCreateClass: (name: string, description: string) => ClassRoom;
  onCreateAssignment: (
    title: string,
    classId: string,
    examId: string,
    dueDate: string,
    timeLimitMinutes: number
  ) => Assignment;
  onCreateCustomTest: (title: string, questionsCount: number) => Exam;
  onVerifyOMRScan: (scanId: string, verifiedAnswers: Record<number, string>) => void;
  onExportExcel: (classId: string) => void;
  onOpenOMR?: () => void;
  onOpenCustomBuilder?: () => void;
  onOpenQuestionBank?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  classes,
  assignments,
  exams,
  submissions,
  omrScans,
  onCreateClass,
  onCreateAssignment,
  onCreateCustomTest,
  onVerifyOMRScan,
  onExportExcel,
  onOpenOMR,
  onOpenCustomBuilder,
  onOpenQuestionBank,
}) => {
  const [activeTab, setActiveTab] = useState<"classes" | "assignments" | "analytics" | "omr-review">("classes");

  // Create class modal state
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDesc, setNewClassDesc] = useState("");

  // Create assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignClassId, setAssignClassId] = useState(classes[0]?.id || "");
  const [assignExamId, setAssignExamId] = useState(exams[0]?.id || "");
  const [assignDueDate, setAssignDueDate] = useState("2026-04-15");
  const [assignTimeLimit, setAssignTimeLimit] = useState(80);

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Teacher Detailed Analytics states
  const [selectedAnalyticsClass, setSelectedAnalyticsClass] = useState<string>("all");
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState("");
  const [selectedStudentSubmission, setSelectedStudentSubmission] = useState<ExamSubmission | null>(null);
  const [isGeneratingClassAi, setIsGeneratingClassAi] = useState(false);
  const [classAiDiagnostics, setClassAiDiagnostics] = useState<any | null>(null);

  const handleGenerateClassAiDiagnostics = async () => {
    setIsGeneratingClassAi(true);
    try {
      const activeClass = classes.find((c) => c.id === selectedAnalyticsClass);
      const filteredSubs =
        selectedAnalyticsClass === "all"
          ? submissions
          : submissions.filter((s) => s.classId === selectedAnalyticsClass);

      const res = await fetch("/api/ai/class-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: activeClass ? activeClass.name : "Бүх ангиуд",
          submissionsCount: filteredSubs.length,
          submissions: filteredSubs.map((s) => ({
            studentName: s.userName,
            rawScore: s.rawScore,
            scaledScore: s.scaledScore,
            categoryScores: s.categoryScores,
            weakTopics: s.weakTopics || [],
            source: s.source,
          })),
        }),
      });
      const data = await res.json();
      if (data.success && data.diagnostics) {
        setClassAiDiagnostics(data.diagnostics);
      }
    } catch (e) {
      console.error("Failed to generate class AI diagnostics:", e);
    } finally {
      setIsGeneratingClassAi(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    onCreateClass(newClassName.trim(), newClassDesc.trim());
    setNewClassName("");
    setNewClassDesc("");
    setShowCreateClassModal(false);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignClassId || !assignExamId) return;
    onCreateAssignment(assignTitle.trim(), assignClassId, assignExamId, assignDueDate, assignTimeLimit);
    setShowAssignModal(false);
    setAssignTitle("");
  };

  // Pending OMR scans needing teacher verification
  const pendingOMRScans = omrScans.filter((s) => s.status === "pending_verification");

  return (
    <div className="space-y-8 pb-16">
      {/* Teacher Portal Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Багшийн Удирдлагын Төв</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Багш {currentUser.name}
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Ангиуддаа 2006–2026 оны ЭЕШ тестийн сангаас даалгавар өгөх, өөрийн сорилт үүсгэх, сурагчдын бодит үр дүнг Excel-ээр татах.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-teacher-create-class"
              onClick={() => setShowCreateClassModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Шинэ анги үүсгэх</span>
            </button>

            <button
              id="btn-teacher-assign-test"
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Тест даалгавар өгөх</span>
            </button>

            {(onOpenQuestionBank || onOpenCustomBuilder) && (
              <button
                onClick={onOpenQuestionBank || onOpenCustomBuilder}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
                title="Шинэ тест оруулах, сан удирдах, сэдвээр тест холих, 50-60 асуулттай бүрэн шалгалт бүтээх"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>Тест оруулах & Сан</span>
              </button>
            )}

            {onOpenOMR && (
              <button
                onClick={onOpenOMR}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                title="Цаасан шалгалт системд оруулж 6 оронтой кодтой OMR хуудас хэвлэх"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>OMR Хуудас хэвлэх & Скан</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Нийт ангиуд</div>
            <div className="text-2xl font-extrabold text-emerald-300 mt-1">{classes.length} анги</div>
            <div className="text-[10px] text-slate-400 mt-1">Идэвхтэй бүлгүүд</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Нийт даалгавар</div>
            <div className="text-2xl font-extrabold text-blue-300 mt-1">{assignments.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">Хуваарилсан шалгалтууд</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Сурагчдын ирүүлсэн ажил</div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">{submissions.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">Дижитал + OMR шалгалт</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">OMR Хянах дараалал</div>
            <div className="text-2xl font-extrabold text-purple-300 mt-1">{pendingOMRScans.length} хуудас</div>
            <div className="text-[10px] text-purple-300 mt-1">Эргэлзээтэй хариултууд</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab("classes")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "classes"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-700 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Ангиуд & Элсэлтийн кодууд ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("assignments")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "assignments"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-700 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Даалгаврууд ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "analytics"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-700 hover:text-slate-800"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Ангийн Бодит Analytics & Excel тайлан</span>
        </button>

        <button
          onClick={() => setActiveTab("omr-review")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "omr-review"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-700 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>OMR Эргэлзээтэй хариулт хянах ({pendingOMRScans.length})</span>
        </button>
      </div>

      {/* TAB 1: CLASSES */}
      {activeTab === "classes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => {
            const classSubmissions = submissions.filter((s) => cls.studentIds.includes(s.userId));
            const avgScore =
              classSubmissions.length > 0
                ? Math.round(
                    classSubmissions.reduce((acc, curr) => acc + curr.scaledScore, 0) / classSubmissions.length
                  )
                : 660;

            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{cls.name}</h3>
                    <p className="text-xs text-slate-700 mt-0.5">{cls.description || "Тайлбар оруулаагүй"}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <span className="font-mono font-bold text-xs text-emerald-800">{cls.code}</span>
                    <button
                      onClick={() => handleCopyCode(cls.code)}
                      title="Код хуулах"
                      className="text-emerald-700 hover:text-emerald-900"
                    >
                      {copiedCode === cls.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-700 font-bold uppercase">Сурагчид</div>
                    <div className="text-lg font-extrabold text-slate-900 mt-0.5">{cls.studentIds.length}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-700 font-bold uppercase">Дундаж ЭЕШ</div>
                    <div className="text-lg font-extrabold text-emerald-600 mt-0.5">{avgScore}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-700 font-bold uppercase">Даалгавар</div>
                    <div className="text-lg font-extrabold text-blue-600 mt-0.5">
                      {assignments.filter((a) => a.classId === cls.id).length}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setAssignClassId(cls.id);
                      setShowAssignModal(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                  >
                    Даалгавар оноох
                  </button>
                  <button
                    onClick={() => onExportExcel(cls.id)}
                    className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel татах</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS */}
      {activeTab === "assignments" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Бүх өгсөн даалгаврууд</h3>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Шинэ даалгавар</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {assignments.map((asg) => (
              <div key={asg.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {asg.className}
                    </span>
                    <span className="text-xs text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-700" />
                      <span>{asg.timeLimitMinutes} минут</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{asg.title}</h4>
                  <div className="text-xs text-slate-700 flex items-center gap-3">
                    <span>Сонгосон тест: {asg.examTitle}</span>
                    <span>•</span>
                    <span>Дуусах: {asg.dueDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onExportExcel(asg.classId)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Үр дүн татах (Excel)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CLASS ANALYTICS & EXCEL */}
      {activeTab === "analytics" && (() => {
        // Analytics calculations
        const filteredSubmissions = submissions.filter((sub) => {
          if (selectedAnalyticsClass !== "all" && sub.classId !== selectedAnalyticsClass) return false;
          if (analyticsSearchQuery.trim()) {
            const q = analyticsSearchQuery.toLowerCase();
            const matchName = sub.userName.toLowerCase().includes(q);
            const matchReg = (sub.studentRegNo || "").toLowerCase().includes(q);
            const matchExam = sub.examTitle.toLowerCase().includes(q);
            if (!matchName && !matchReg && !matchExam) return false;
          }
          return true;
        });

        const totalSubsCount = filteredSubmissions.length;
        const omrSubsCount = filteredSubmissions.filter((s) => s.source === "omr_paper").length;
        const digitalSubsCount = totalSubsCount - omrSubsCount;

        const avgScaledScore =
          totalSubsCount > 0
            ? Math.round(filteredSubmissions.reduce((acc, s) => acc + s.scaledScore, 0) / totalSubsCount)
            : 0;

        const maxScaledScore =
          totalSubsCount > 0 ? Math.max(...filteredSubmissions.map((s) => s.scaledScore)) : 0;

        const passingCount = filteredSubmissions.filter((s) => s.scaledScore >= 600).length;
        const passRate = totalSubsCount > 0 ? Math.round((passingCount / totalSubsCount) * 100) : 0;

        // Domain Category Averages
        const catStats = {
          Grammar: { correct: 0, total: 0 },
          Vocabulary: { correct: 0, total: 0 },
          Communication: { correct: 0, total: 0 },
          Reading: { correct: 0, total: 0 },
        };

        filteredSubmissions.forEach((sub) => {
          (Object.keys(catStats) as (keyof typeof catStats)[]).forEach((key) => {
            if (sub.categoryScores && sub.categoryScores[key]) {
              catStats[key].correct += sub.categoryScores[key].correct;
              catStats[key].total += sub.categoryScores[key].total;
            }
          });
        });

        const grammarPct =
          catStats.Grammar.total > 0
            ? Math.round((catStats.Grammar.correct / catStats.Grammar.total) * 100)
            : 0;
        const vocabPct =
          catStats.Vocabulary.total > 0
            ? Math.round((catStats.Vocabulary.correct / catStats.Vocabulary.total) * 100)
            : 0;
        const commPct =
          catStats.Communication.total > 0
            ? Math.round((catStats.Communication.correct / catStats.Communication.total) * 100)
            : 0;
        const readingPct =
          catStats.Reading.total > 0
            ? Math.round((catStats.Reading.correct / catStats.Reading.total) * 100)
            : 0;

        // Score distribution brackets
        const bracket700Plus = filteredSubmissions.filter((s) => s.scaledScore >= 700).length;
        const bracket600To699 = filteredSubmissions.filter(
          (s) => s.scaledScore >= 600 && s.scaledScore < 700
        ).length;
        const bracket500To599 = filteredSubmissions.filter(
          (s) => s.scaledScore >= 500 && s.scaledScore < 600
        ).length;
        const bracketBelow500 = filteredSubmissions.filter((s) => s.scaledScore < 500).length;

        // Systematic weak topics aggregation
        const topicErrorCounts: Record<string, number> = {};
        filteredSubmissions.forEach((sub) => {
          if (sub.weakTopics && Array.isArray(sub.weakTopics)) {
            sub.weakTopics.forEach((t) => {
              topicErrorCounts[t] = (topicErrorCounts[t] || 0) + 1;
            });
          }
        });
        const sortedWeakTopics = Object.entries(topicErrorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        return (
          <div className="space-y-6">
            {/* Filter & Action Toolbar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Анги сонгох:</label>
                  <select
                    value={selectedAnalyticsClass}
                    onChange={(e) => setSelectedAnalyticsClass(e.target.value)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                  >
                    <option value="all">Бүх ангиуд (Нийт {classes.length})</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Сурагч, регистр хайх..."
                    value={analyticsSearchQuery}
                    onChange={(e) => setAnalyticsSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none w-48 sm:w-60"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleGenerateClassAiDiagnostics}
                  disabled={isGeneratingClassAi || filteredSubmissions.length === 0}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>{isGeneratingClassAi ? "AI Шинжилж байна..." : "AI Ангийн Нэгдсэн Дүгнэлт"}</span>
                </button>

                <button
                  onClick={() => onExportExcel(selectedAnalyticsClass)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Excel татах (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">Шалгалт өгсөн тоо</span>
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-slate-900">{totalSubsCount}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="text-purple-700 font-bold">Цаасан: {omrSubsCount}</span>
                  <span>•</span>
                  <span className="text-blue-700 font-bold">Дижитал: {digitalSubsCount}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">Ангийн дундаж оноо</span>
                  <Award className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  {avgScaledScore} <span className="text-xs font-semibold text-slate-400">/ 800</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Түүхий дундаж:{" "}
                  <strong className="text-slate-700">
                    {totalSubsCount > 0
                      ? (
                          filteredSubmissions.reduce((acc, s) => acc + s.rawScore, 0) /
                          totalSubsCount
                        ).toFixed(1)
                      : 0}
                    /50
                  </strong>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">Босго давсан (600+)</span>
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-indigo-600">
                  {passRate}%{" "}
                  <span className="text-xs font-semibold text-slate-400">({passingCount}/{totalSubsCount})</span>
                </div>
                <div className="text-[11px] text-slate-500">Улсын Их Сургуулиудын ерөнхий босго</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">Ангийн Дээд Оноо</span>
                  <Target className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600">
                  {maxScaledScore} <span className="text-xs font-semibold text-slate-400">/ 800</span>
                </div>
                <div className="text-[11px] text-slate-500">ЭЕШ 2026 стандартын дагуу</div>
              </div>
            </div>

            {/* AI Diagnostics Report Card (if generated) */}
            {classAiDiagnostics && (
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-indigo-700/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">
                        Gemini AI: Ангийн Системчилсэн Дүгнэлт & Зөвлөмж
                      </h3>
                      <p className="text-xs text-indigo-200">
                        Сурагчдын бодит гүйцэтгэл, дүрмийн алдаанууд дээр хийсэн шинжилгээ
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-indigo-400/20 text-indigo-300 font-bold border border-indigo-400/30">
                    AI Шинжилгээ
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10 text-xs sm:text-sm leading-relaxed text-indigo-100">
                  <strong className="text-amber-300 block mb-1">Ерөнхий дүгнэлт:</strong>
                  {classAiDiagnostics.summary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-300 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Нийтлэг Системийн Цоорхой:</span>
                    </div>
                    <ul className="space-y-1.5 text-rose-100 list-disc list-inside leading-relaxed">
                      {(classAiDiagnostics.systemicWeaknesses || []).map((w: string, idx: number) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Хүчтэй Эзэмшсэн Чадварууд:</span>
                    </div>
                    <ul className="space-y-1.5 text-emerald-100 list-disc list-inside leading-relaxed">
                      {(classAiDiagnostics.classStrengths || []).map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Target className="w-4 h-4 text-amber-400" />
                      <span>Багшид зориулсан 7 хоногийн төлөвлөгөө:</span>
                    </div>
                    <ul className="space-y-1.5 text-indigo-100 list-disc list-inside leading-relaxed">
                      {(classAiDiagnostics.recommendedReviewPlan || []).map((p: string, idx: number) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Middle Section: 4 Skills Mastery & Score Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 4 Skill Area Mastery */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Чадварын эзэмшил (4 Үндсэн Хэсгээр)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Зөв хариултын хувь</span>
                </div>

                <div className="space-y-3.5 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>1. Grammar (Хэлзүйн дүрэм)</span>
                      <span className="text-emerald-700">{grammarPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${grammarPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>2. Vocabulary (Үгийн сан, Collocations)</span>
                      <span className="text-blue-700">{vocabPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${vocabPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>3. Communication (Өдөр тутмын харилцан яриа)</span>
                      <span className="text-purple-700">{commPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${commPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>4. Reading (Эх бичвэр ойлгох, дүгнэх)</span>
                      <span className="text-amber-700">{readingPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-amber-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${readingPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Distribution & Top Weak Topics */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Онооны түвшний тархалт & Алдааны Матриц
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">800 масштаб</span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-base font-black text-emerald-700">{bracket700Plus}</div>
                    <div className="text-[10px] font-bold text-emerald-900">700 - 800</div>
                    <div className="text-[9px] text-emerald-600">Онц сайн</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="text-base font-black text-blue-700">{bracket600To699}</div>
                    <div className="text-[10px] font-bold text-blue-900">600 - 699</div>
                    <div className="text-[9px] text-blue-600">Сайн</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="text-base font-black text-amber-700">{bracket500To599}</div>
                    <div className="text-[10px] font-bold text-amber-900">500 - 599</div>
                    <div className="text-[9px] text-amber-600">Дундаж</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                    <div className="text-base font-black text-rose-700">{bracketBelow500}</div>
                    <div className="text-[10px] font-bold text-rose-900">&lt; 500</div>
                    <div className="text-[9px] text-rose-600">Давтлага</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Ангийн хамгийн түгээмэл алдаж буй сэдвүүд:</span>
                  </div>
                  {sortedWeakTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {sortedWeakTopics.map(([topic, count], idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium flex items-center gap-1.5"
                        >
                          <strong>{topic}</strong>
                          <span className="bg-rose-200/80 px-1.5 py-0.2 rounded-md text-[10px] font-bold">
                            {count} алдаа
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Одоогоор алдаатай сэдэв бүртгэгдээгүй байна.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Student Submissions Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Сурагчдын Нарийвчилсан Үнэлгээний Хүснэгт ({filteredSubmissions.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Сурагч бүрийн цаасан (OMR) болон дижитал шалгалтын үр дүн, 4 бүлгийн оноо ба сэдвийн алдаа
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-700 bg-slate-50">
                      <th className="p-3 font-bold">Сурагч</th>
                      <th className="p-3 font-bold">Шалгалтын нэр</th>
                      <th className="p-3 font-bold">Хэлбэр</th>
                      <th className="p-3 font-bold">Grammar</th>
                      <th className="p-3 font-bold">Vocabulary</th>
                      <th className="p-3 font-bold">Communication</th>
                      <th className="p-3 font-bold">Reading</th>
                      <th className="p-3 font-bold">Түүхий</th>
                      <th className="p-3 font-bold text-right">Хуваарьт</th>
                      <th className="p-3 font-bold text-center">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-500">
                          Шалгалт бүртгэгдээгүй эсвэл хайлтад тохирох сурагч олдсонгүй.
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-slate-900">
                            {sub.userName}
                            {sub.studentRegNo && (
                              <span className="block text-[10px] text-slate-500 font-mono font-normal">
                                {sub.studentRegNo}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-700 max-w-[180px] truncate">{sub.examTitle}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.source === "omr_paper"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {sub.source === "omr_paper" ? "Цаасан (OMR)" : "Дижитал"}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-700">
                            {sub.categoryScores.Grammar.correct}/{sub.categoryScores.Grammar.total}
                          </td>
                          <td className="p-3 font-medium text-slate-700">
                            {sub.categoryScores.Vocabulary.correct}/{sub.categoryScores.Vocabulary.total}
                          </td>
                          <td className="p-3 font-medium text-slate-700">
                            {sub.categoryScores.Communication.correct}/{sub.categoryScores.Communication.total}
                          </td>
                          <td className="p-3 font-medium text-slate-700">
                            {sub.categoryScores.Reading.correct}/{sub.categoryScores.Reading.total}
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {sub.rawScore}/50 ({sub.percentage}%)
                          </td>
                          <td className="p-3 font-extrabold text-emerald-600 text-sm text-right">
                            {sub.scaledScore} / 800
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setSelectedStudentSubmission(sub)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                              title="Сурагчийн AI нарийвчилсан шинжилгээг харах"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Шинжилгээ</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 4: OMR VERIFICATION QUEUE */}
      {activeTab === "omr-review" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Цаасан Answer Sheet: Эргэлзээтэй хариултыг хянах
              </h3>
              <p className="text-xs text-slate-700">
                OMR сканнер бүдэг эсвэл давхар тэмдэглэгээтэй асуултуудыг багшийн хяналтад зориулан тусад нь тэмдэглэдэг.
              </p>
            </div>
          </div>

          {pendingOMRScans.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-700 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-700">Хянагдаагүй OMR хуудас байхгүй байна</p>
              <p className="text-slate-700 text-[11px]">Бүх сканнердсан хариултын хуудсууд амжилттай баталгаажсан.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOMRScans.map((scan) => (
                <div key={scan.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        Регистр: {scan.studentRegNo} ({scan.studentName || "Сурагч"})
                      </span>
                      <span className="text-xs text-slate-700 ml-2">Шалгалт: {scan.examId} (Хувилбар {scan.variant})</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-800">
                      Хянах шаардлагатай
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {Object.entries(scan.scannedAnswers)
                      .filter(([_, val]) => (val as any)?.ambiguous)
                      .map(([qNum, val]) => {
                        const item = val as any;
                        return (
                          <div key={qNum} className="p-2.5 rounded-lg bg-white border border-amber-300">
                            <div className="font-bold text-slate-800">Асуулт #{qNum}</div>
                            <div className="text-[11px] text-slate-700 mt-1">
                              Танигдсан: <span className="font-bold text-amber-700">{item?.answer}</span> (Найдвартай байдал:{" "}
                              {Math.round((item?.confidence || 0) * 100)}%)
                            </div>
                            <div className="mt-2 flex gap-1">
                              {(["A", "B", "C", "D", "E"] as const).map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    onVerifyOMRScan(scan.id, { [Number(qNum)]: opt });
                                  }}
                                  className="flex-1 py-1 rounded bg-slate-100 hover:bg-emerald-600 hover:text-white text-[10px] font-bold transition-colors"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE CLASS MODAL */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Шинэ анги үүсгэх</h3>
              <button
                onClick={() => setShowCreateClassModal(false)}
                className="text-slate-700 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-700">
              Анги үүсмэгц 6 оронтой давтагдашгүй элсэлтийн код (ж нь: <code>ESH-8842</code>) автоматаар үүснэ.
            </p>

            <form onSubmit={handleCreateClassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ангийн нэр</label>
                <input
                  type="text"
                  required
                  placeholder="ж нь: 12А Анги - ЭЕШ 800 бүлэг"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Зорилго / Тайлбар</label>
                <textarea
                  rows={2}
                  placeholder="ж нь: ЭЕШ-д 700+ оноо зорилтот эрчимжүүлсэн бэлтгэл"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Анги үүсгэх
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TEST MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Шалгалт Даалгавар болгон өгөх</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-700 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Даалгаврын нэр</label>
                <input
                  type="text"
                  required
                  placeholder="ж нь: 2024 оны ЭЕШ Хувилбар А - 7 хоногийн сорилт"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Сонгох анги</label>
                  <select
                    value={assignClassId}
                    onChange={(e) => setAssignClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Хугацааны хязгаар</label>
                  <select
                    value={assignTimeLimit}
                    onChange={(e) => setAssignTimeLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={40}>40 минут (Хагас сорилт)</option>
                    <option value={80}>80 минут (Бүрэн ЭЕШ хугацаа)</option>
                    <option value={100}>100 минут (Уртасгасан)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Сонгох тест (2006–2026 Сангаас)</label>
                <select
                  value={assignExamId}
                  onChange={(e) => setAssignExamId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      [{ex.year}] {ex.title} ({ex.totalQuestions} асуулт)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Дуусах эцсийн хугацаа</label>
                <input
                  type="date"
                  required
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Ангид оноох
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT INDIVIDUAL DIAGNOSTIC MODAL */}
      {selectedStudentSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedStudentSubmission.userName}
                  </h3>
                  {selectedStudentSubmission.studentRegNo && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedStudentSubmission.studentRegNo}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      selectedStudentSubmission.source === "omr_paper"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedStudentSubmission.source === "omr_paper" ? "Цаасан OMR Шалгалт" : "Дижитал Шалгалт"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Шалгалт: <strong>{selectedStudentSubmission.examTitle}</strong> •{" "}
                  {selectedStudentSubmission.submittedAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentSubmission(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Score Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 block">Хуваарьт Оноо</span>
                <span className="text-xl font-black text-emerald-600">
                  {selectedStudentSubmission.scaledScore}
                </span>
                <span className="text-[9px] text-emerald-700 block">/ 800 оноо</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 block">Түүхий Оноо</span>
                <span className="text-xl font-black text-blue-600">
                  {selectedStudentSubmission.rawScore}
                </span>
                <span className="text-[9px] text-blue-700 block">/ 50 асуулт</span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] font-bold text-purple-800 block">Гүйцэтгэл</span>
                <span className="text-xl font-black text-purple-600">
                  {selectedStudentSubmission.percentage}%
                </span>
                <span className="text-[9px] text-purple-700 block">Нийт харьцаа</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-800 block">Зарцуулсан Хугацаа</span>
                <span className="text-xl font-black text-slate-700">
                  {Math.round(selectedStudentSubmission.timeSpentSeconds / 60)}
                </span>
                <span className="text-[9px] text-slate-500 block">минут</span>
              </div>
            </div>

            {/* 4 Skill Category Scores */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900">4 Бүлгийн Эзэмшлийн Задргаа:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries(selectedStudentSubmission.categoryScores).map(([cat, scoreVal]) => {
                  const score = scoreVal as { correct: number; total: number };
                  const total = score?.total ?? 0;
                  const correct = score?.correct ?? 0;
                  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                  return (
                    <div key={cat} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 block text-[11px] truncate">{cat}</span>
                      <div className="flex justify-between items-baseline">
                        <span className="font-extrabold text-slate-900">
                          {correct}/{total}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Diagnostics Advice */}
            {selectedStudentSubmission.aiAnalysis && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Багшийн Зөвлөмж & Дүгнэлт:</span>
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed whitespace-pre-line">
                  {selectedStudentSubmission.aiAnalysis}
                </p>
              </div>
            )}

            {/* Weak Topics */}
            {selectedStudentSubmission.weakTopics && selectedStudentSubmission.weakTopics.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Сурагчийн Алдсан Гол Сэдвүүд (Давтах шаардлагатай):</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudentSubmission.weakTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedStudentSubmission(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
