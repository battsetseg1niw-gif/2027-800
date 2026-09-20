import React, { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Play,
  BookOpen,
  Award,
  CheckCircle2,
  ChevronRight,
  Layers,
  Sparkles,
  HelpCircle,
  Tag,
  Wand2,
  RefreshCw,
} from "lucide-react";
import { Exam, Question, QuestionCategory, ClassRoom, UserProfile } from "../types";
import { CustomTestBuilder } from "./CustomTestBuilder";
import { PracticeTestView } from "./PracticeTestView";
import { db } from "../lib/supabase";

interface ExamArchiveViewProps {
  exams: Exam[];
  currentUser: UserProfile;
  classes?: ClassRoom[];
  initialTab?: "exams" | "weekly-mock" | "practice-test" | "custom-builder";
  dedicatedView?: "past-papers" | "weekly-mock" | "practice-test" | "custom-builder";
  onStartExam: (exam: Exam, mode?: "mock" | "practice") => void;
  onOpenLearningCenter: () => void;
  onAssignToClass?: (assignmentData: {
    title: string;
    classId: string;
    exam: Exam;
    dueDate: string;
    timeLimitMinutes: number;
  }) => void;
  onPrintOMR?: (exam: Exam) => void;
  onUpdateExams?: () => void;
}

export const ExamArchiveView: React.FC<ExamArchiveViewProps> = ({
  exams,
  currentUser,
  classes = [],
  initialTab = "exams",
  dedicatedView,
  onStartExam,
  onOpenLearningCenter,
  onAssignToClass,
  onPrintOMR,
  onUpdateExams,
}) => {
  const resolvedTab =
    dedicatedView === "past-papers"
      ? "exams"
      : dedicatedView === "weekly-mock"
      ? "weekly-mock"
      : dedicatedView === "practice-test"
      ? "practice-test"
      : dedicatedView === "custom-builder"
      ? "custom-builder"
      : initialTab;

  const [activeTab, setActiveTab] = useState<"exams" | "weekly-mock" | "practice-test" | "custom-builder">(
    resolvedTab
  );

  React.useEffect(() => {
    if (dedicatedView) {
      if (dedicatedView === "past-papers") setActiveTab("exams");
      else if (dedicatedView === "weekly-mock") setActiveTab("weekly-mock");
      else if (dedicatedView === "practice-test") setActiveTab("practice-test");
      else if (dedicatedView === "custom-builder") setActiveTab("custom-builder");
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [dedicatedView, initialTab]);

  if (dedicatedView === "practice-test") {
    return (
      <PracticeTestView
        exams={exams}
        currentUser={currentUser}
        onStartExam={onStartExam}
        onOpenLearningCenter={onOpenLearningCenter}
      />
    );
  }

  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedVariant, setSelectedVariant] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered exams for Past Papers
  const pastPapers = exams.filter((e) => e.type === "past_paper" || !e.type);
  const filteredPastPapers = pastPapers.filter((exam) => {
    if (selectedYear !== "all" && exam.year.toString() !== selectedYear) return false;
    if (selectedVariant !== "all" && exam.variant !== selectedVariant) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return exam.title.toLowerCase().includes(q) || exam.year.toString().includes(q);
    }
    return true;
  });

  // Mock tests (Weekly mock archive + current)
  const mockExams = exams.filter((e) => e.type === "mock");
  const latestMock = mockExams[0] || null;
  const previousMocks = mockExams.slice(1);

  // Practice tests
  const practiceExams = exams.filter((e) => e.type === "practice" || e.type === "diagnostic");

  // Extract all questions across all exams for Question Bank in Practice Test
  const allQuestions: { question: Question; examTitle: string; examYear: number }[] = [];
  exams.forEach((ex) => {
    ex.questions.forEach((q) => {
      allQuestions.push({
        question: q,
        examTitle: ex.title,
        examYear: ex.year,
      });
    });
  });

  const filteredQuestions = allQuestions.filter((item) => {
    if (selectedCategory !== "all" && item.question.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.question.text.toLowerCase().includes(q) ||
        item.question.topic?.toLowerCase().includes(q) ||
        item.question.subtopic?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Unique years
  const availableYears = Array.from(new Set(exams.map((e) => Number(e.year)))).sort((a: number, b: number) => b - a);

  return (
    <div className="space-y-8 pb-16">
      {/* Header (Only shown when not in dedicated practice-test view to avoid double hero banners) */}
      {dedicatedView !== "practice-test" && (
        <div
          className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl ${
            dedicatedView === "weekly-mock"
              ? "bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900"
              : "bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold">
                {dedicatedView === "weekly-mock" ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>2026 Оны ЭЕШ Жишиг Сорилт</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5 text-blue-300" />
                    <span>Монгол улсын Англи хэлний ЭЕШ Архив (2006–2026)</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {dedicatedView === "weekly-mock"
                  ? "7 Хоног Бүрийн Албан Ёсны Mock Тестүүд"
                  : "2006–2026 Оны ЭЕШ Сан (Past Papers)"}
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                {dedicatedView === "weekly-mock"
                  ? "ЭЕШ-д бэлтгэхэд зориулан 7 хоног бүр нийтлэгддэг шинэ жишиг шалгалт болон өмнөх mock сорилуудын архив. Цагийн менежмент, бодит шалгалтын хурдаа сорино уу."
                  : "2006 оноос 2026 оны албан ёсны ЭЕШ-ийн A, B, C, D хувилбарууд. Хувилбар болон оноор шүүж дижиталаар ажиллана."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/10 text-center">
                <div className="text-[10px] text-slate-300 font-bold uppercase">
                  {dedicatedView === "weekly-mock"
                    ? "Mock Шалгалт"
                    : "Нийт Шалгалт"}
                </div>
                <div className="text-2xl font-black text-blue-300">
                  {dedicatedView === "weekly-mock"
                    ? mockExams.length
                    : filteredPastPapers.length}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/10 text-center">
                <div className="text-[10px] text-slate-300 font-bold uppercase">Нийт Асуулт</div>
                <div className="text-2xl font-black text-amber-300">
                  {dedicatedView === "weekly-mock"
                    ? mockExams.reduce((sum, e) => sum + e.totalQuestions, 0)
                    : filteredPastPapers.reduce((sum, e) => sum + e.totalQuestions, 0)}
                  +
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs (Only shown when not in dedicated single view mode) */}
      {!dedicatedView && (
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("exams")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "exams"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-700 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>ЭЕШ Сан (2006–2026) ({filteredPastPapers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("weekly-mock")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "weekly-mock"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-700 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>7 хоногийн Mock тестүүд ({mockExams.length})</span>
          </button>
        </div>
      )}

      {/* Search & Filters (for past papers) */}
      {activeTab === "exams" && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Шалгалт хайх (ж нь: 2024, Хувилбар A)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
              <Filter className="w-3.5 h-3.5" />
              <span>Шүүлтүүр:</span>
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Бүх он (2006–2026)</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr} он
                </option>
              ))}
            </select>

            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Бүх хувилбар</option>
              <option value="A">Хувилбар A</option>
              <option value="B">Хувилбар B</option>
              <option value="C">Хувилбар C</option>
              <option value="D">Хувилбар D</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 1: PAST PAPERS (2006-2026) */}
      {activeTab === "exams" && (
        <div className="space-y-6">
          {/* Quick Variant Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
              <span className="text-slate-500 mr-1 text-[11px]">Хувилбар:</span>
              <button
                onClick={() => setSelectedVariant("all")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  selectedVariant === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Бүгд ({pastPapers.length})
              </button>
              {(["A", "B", "C", "D"] as const).map((v) => {
                const count = pastPapers.filter((p) => p.variant === v).length;
                return (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-1.5 rounded-xl transition-colors ${
                      selectedVariant === v
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    Хувилбар {v} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                ✓ 50 асуулт, 80 мин бүрэн цахимжсан
              </span>
            </div>
          </div>

          {filteredPastPapers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPastPapers.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-600 text-white shadow-xs">
                          {exam.year}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Хувилбар {exam.variant}
                        </span>
                      </div>

                      <span className="text-xs text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-700" />
                        <span>{exam.durationMinutes} мин</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {exam.title}
                    </h3>

                    <div className="text-xs text-slate-700 space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <span>Нийт асуулт:</span>
                        <span className="font-semibold text-slate-800">{exam.totalQuestions} тест</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ЭЕШ Стандарт:</span>
                        <span className="font-semibold text-emerald-600">800 онооны систем</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      id={`btn-exam-mock-${exam.id}`}
                      onClick={() => onStartExam(exam, "mock")}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Mock Test (80 мин)</span>
                    </button>

                    <button
                      id={`btn-exam-practice-${exam.id}`}
                      onClick={() => onStartExam(exam, "practice")}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Practice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Сонгосон шүүлтүүрт тохирох шалгалт олдсонгүй
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Шүүлтүүрээ цэвэрлэх эсвэл доорх товчийг дарж 2006–2026 оны бүх 84 шалгалтыг бүрэн сэргээнэ үү.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedYear("all");
                    setSelectedVariant("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Бүх шүүлтүүрийг цэвэрлэх
                </button>
                <button
                  onClick={() => {
                    db.resetToDefaultExams();
                    window.location.reload();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Бүх 2006–2026 оныг (84 шалгалт) сэргээж ачаалах</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEEKLY MOCK TESTS (ACTIVE + PREVIOUS MOCKS ARCHIVE) */}
      {activeTab === "weekly-mock" && (
        <div className="space-y-8">
          {/* Latest Weekly Mock Banner */}
          {latestMock ? (
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>ЭНЭ ДОЛОО ХОНОГИЙН АЛБАН ЁСНЫ MOCK ТЕСТ</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{latestMock.title}</h2>
                <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                  Боловсролын Үнэлгээний Төвийн стандартын дагуу 50 асуулт, 80 минутын хугацаатай бүрэн сорилт. 
                  Гүйцэтгэсний дараа улсын чансаа болон алдааны дэлгэрэнгүй шинжилгээ шууд гарна.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => onStartExam(latestMock, "mock")}
                    className="px-6 py-3 rounded-2xl bg-white text-indigo-950 font-black text-xs hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-indigo-950" />
                    <span>Шалгалт өгөх (Mock 80 мин)</span>
                  </button>
                  <button
                    onClick={() => onStartExam(latestMock, "practice")}
                    className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors"
                  >
                    <span>Дасгал горимоор турших</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-purple-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Шинэ 7 хоногийн mock тест удахгүй нийтлэгдэнэ</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Админ болон багш нар долоо хоног бүрийн шинэ сорилыг оруулмагц бүх сурагчдад автоматаар мэдэгдэл очно.
              </p>
            </div>
          )}

          {/* Previous Mock Tests List ("Өмнөх mock тестүүд нь байж байна") */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Өмнөх 7 хоногийн Mock тестүүд ({previousMocks.length > 0 ? previousMocks.length : mockExams.length})
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Өмнөх долоо хоногуудад зохион байгуулагдсан mock тестүүд хадгалагдан үлдсэн тул хүссэн үедээ дахин ажиллах боломжтой.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(previousMocks.length > 0 ? previousMocks : mockExams).map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {m.year} оны Mock
                      </span>
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{m.durationMinutes} мин</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{m.title}</h4>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Асуултууд:</span>
                        <span className="font-semibold text-slate-800">{m.totalQuestions} тест</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Огноо:</span>
                        <span className="text-slate-500">{m.createdAt || "2026 он"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onStartExam(m, "mock")}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Шалгалт өгөх</span>
                    </button>
                    <button
                      onClick={() => onStartExam(m, "practice")}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                    >
                      <span>Дасгал</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRACTICE TESTS & QUESTION BANK */}
      {activeTab === "practice-test" && (
        <PracticeTestView
          exams={exams}
          currentUser={currentUser}
          onStartExam={onStartExam}
          onOpenLearningCenter={onOpenLearningCenter}
          onUpdateExams={onUpdateExams}
        />
      )}

      {/* TAB 3: CUSTOM TEST & ASSIGNMENT BUILDER (Mixing Years & Topics) */}
      {activeTab === "custom-builder" && (
        <CustomTestBuilder
          exams={exams}
          currentUser={currentUser}
          classes={classes}
          onStartExam={onStartExam}
          onAssignToClass={onAssignToClass}
          onPrintOMR={onPrintOMR}
        />
      )}
    </div>
  );
};
