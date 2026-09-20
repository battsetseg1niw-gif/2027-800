import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Layers,
  FileText,
  Image as ImageIcon,
  SlidersHorizontal,
  EyeOff,
  Eye,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Award,
  Check,
  HelpCircle,
  Clock,
  BookOpen,
  Volume2,
  Edit3,
} from "lucide-react";
import { Exam, Question, QuestionCategory, QuestionType, UserProfile } from "../types";
import { db } from "../lib/supabase";
import { TeacherQuestionBankManager } from "./TeacherQuestionBankManager";

interface PracticeTestViewProps {
  exams: Exam[];
  currentUser: UserProfile;
  onStartExam: (exam: Exam, mode?: "mock" | "practice") => void;
  onOpenLearningCenter?: () => void;
  onUpdateExams?: () => void;
}

export const PracticeTestView: React.FC<PracticeTestViewProps> = ({
  exams,
  currentUser,
  onStartExam,
  onOpenLearningCenter,
  onUpdateExams = () => {},
}) => {
  // Check if role is teacher or admin
  const isTeacherOrAdmin = currentUser?.role === "teacher" || currentUser?.role === "admin";
  const [teacherViewMode, setTeacherViewMode] = useState<"manage" | "student_preview">(
    isTeacherOrAdmin ? "manage" : "student_preview"
  );

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [hideMastered, setHideMastered] = useState<boolean>(true);

  // View presentation mode: "focus" (one by one) or "list" (interactive cards list)
  const [practiceMode, setPracticeMode] = useState<"focus" | "list">("focus");
  const [activeFocusIndex, setActiveFocusIndex] = useState<number>(0);

  // Mastered questions state
  const [masteredQuestionIds, setMasteredQuestionIds] = useState<string[]>(() => {
    return db.getMasteredQuestionIds(currentUser?.id || "student");
  });

  // Keep track of student's answers & checked states in current interactive practice
  // key: question.id -> { selected: string, isChecked: boolean, isCorrect: boolean }
  const [userAnswers, setUserAnswers] = useState<
    Record<
      string,
      {
        selected: string;
        isChecked: boolean;
        isCorrect: boolean;
      }
    >
  >({});

  // Refresh mastered questions when currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      setMasteredQuestionIds(db.getMasteredQuestionIds(currentUser.id));
    }
  }, [currentUser?.id]);

  // Extract all questions across all exams
  const allQuestionsWithExam = useMemo(() => {
    const list: { question: Question; examTitle: string; examYear: number }[] = [];
    const seenIds = new Set<string>();

    exams.forEach((ex) => {
      ex.questions.forEach((q) => {
        const uniqueKey = q.id || `${ex.id}-${q.questionNumber}`;
        if (!seenIds.has(uniqueKey)) {
          seenIds.add(uniqueKey);
          list.push({
            question: { ...q, id: uniqueKey },
            examTitle: ex.title,
            examYear: ex.year,
          });
        }
      });
    });
    return list;
  }, [exams]);

  // Extract available topics based on selected category
  const availableTopics = useMemo(() => {
    const topics = new Set<string>();
    allQuestionsWithExam.forEach((item) => {
      if (selectedCategory === "all" || item.question.category === selectedCategory) {
        if (item.question.topic && item.question.topic.trim()) {
          topics.add(item.question.topic.trim());
        }
      }
    });
    return Array.from(topics).sort();
  }, [allQuestionsWithExam, selectedCategory]);

  // Reset topic if not present in new category
  useEffect(() => {
    if (selectedTopic !== "all" && !availableTopics.includes(selectedTopic)) {
      setSelectedTopic("all");
    }
  }, [availableTopics, selectedTopic]);

  // Filter questions according to student's chosen criteria
  const { eligibleQuestions, totalMatchingBeforeMastered, masteredMatchingCount } = useMemo(() => {
    let countMatching = 0;
    let countMastered = 0;
    const eligible: { question: Question; examTitle: string; examYear: number }[] = [];

    allQuestionsWithExam.forEach((item) => {
      const q = item.question;

      // Category filter
      if (selectedCategory !== "all" && q.category !== selectedCategory) {
        return;
      }

      // Format/Type filter
      if (selectedType !== "all") {
        if (selectedType === "image") {
          if (!q.imageUrl) return;
        } else if (q.type !== selectedType && (selectedType !== "multiple_choice" || q.type)) {
          return;
        }
      }

      // Topic filter
      if (selectedTopic !== "all" && q.topic !== selectedTopic) {
        return;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchText = q.text.toLowerCase().includes(query);
        const matchTopic = q.topic?.toLowerCase().includes(query);
        const matchSubtopic = q.subtopic?.toLowerCase().includes(query);
        const matchExplanation = q.explanation?.toLowerCase().includes(query);
        if (!matchText && !matchTopic && !matchSubtopic && !matchExplanation) {
          return;
        }
      }

      countMatching++;
      const isMastered = masteredQuestionIds.includes(q.id);
      if (isMastered) {
        countMastered++;
      }

      // If hideMastered is ON, exclude mastered questions
      if (hideMastered && isMastered) {
        return;
      }

      eligible.push(item);
    });

    return {
      eligibleQuestions: eligible,
      totalMatchingBeforeMastered: countMatching,
      masteredMatchingCount: countMastered,
    };
  }, [
    allQuestionsWithExam,
    selectedCategory,
    selectedType,
    selectedTopic,
    searchQuery,
    hideMastered,
    masteredQuestionIds,
  ]);

  // Limit questions to student's chosen count (e.g. 5, 10, 15, 20, etc.)
  const displayedQuestions = useMemo(() => {
    if (selectedCount === 0 || selectedCount >= eligibleQuestions.length) {
      return eligibleQuestions;
    }
    return eligibleQuestions.slice(0, selectedCount);
  }, [eligibleQuestions, selectedCount]);

  // Reset focus index if it exceeds length
  useEffect(() => {
    if (activeFocusIndex >= displayedQuestions.length && displayedQuestions.length > 0) {
      setActiveFocusIndex(0);
    }
  }, [displayedQuestions.length, activeFocusIndex]);

  // Handle student selecting an option (WITHOUT showing answer yet)
  const handleSelectOption = (questionId: string, optionId: string) => {
    const existing = userAnswers[questionId];
    if (existing?.isChecked) {
      // If already checked, cannot reselect unless retrying
      return;
    }
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected: optionId,
        isChecked: false,
        isCorrect: false,
      },
    }));
  };

  // Handle student checking their answer
  const handleCheckAnswer = (q: Question) => {
    const current = userAnswers[q.id];
    if (!current || !current.selected) return;

    const isCorrect = current.selected === q.correctAnswer;

    setUserAnswers((prev) => ({
      ...prev,
      [q.id]: {
        selected: current.selected,
        isChecked: true,
        isCorrect,
      },
    }));

    if (isCorrect) {
      // Mark as mastered without mistakes!
      db.markQuestionMastered(currentUser.id, q.id);
      setMasteredQuestionIds((prev) =>
        prev.includes(q.id) ? prev : [...prev, q.id]
      );
    } else {
      // Unmark from mastered if it was previously mastered
      db.unmarkQuestionMastered(currentUser.id, q.id);
      setMasteredQuestionIds((prev) => prev.filter((id) => id !== q.id));

      // Record to Mistake Notebook
      db.recordMistake({
        userId: currentUser.id,
        examId: "practice-test",
        question: q,
        userLastAnswer: current.selected,
        smartFeedback: q.explanation || "ЭЕШ-ийн зөв хариултын дүрэм ба тайлбар.",
      });
    }
  };

  // Reset answer for a question to try again
  const handleRetryQuestion = (questionId: string) => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  // Reset all mastered history if student wants a completely fresh start
  const handleResetMastered = () => {
    if (
      window.confirm(
        "Та өөрийн алдаагүй зөв хийсэн тестүүдийн бүртгэлийг шинэчилж, бүх тестийг дахин дасгалд оруулахдаа итгэлтэй байна уу?"
      )
    ) {
      db.resetMasteredQuestions(currentUser.id);
      setMasteredQuestionIds([]);
      setUserAnswers({});
    }
  };

  // Launch a standard ExamRunner practice session with the current filtered & selected questions
  const handleLaunchPracticeExam = () => {
    if (displayedQuestions.length === 0) return;

    const customExam: Exam = {
      id: `practice-${Date.now()}`,
      title: `Дасгал Сорилт (${selectedCategory === "all" ? "Бүх сэдэв" : selectedCategory} - ${displayedQuestions.length} асуулт)`,
      year: 2026,
      variant: "Mock",
      type: "practice",
      totalQuestions: displayedQuestions.length,
      durationMinutes: Math.max(10, Math.round(displayedQuestions.length * 1.6)),
      questions: displayedQuestions.map((item, idx) => ({
        ...item.question,
        questionNumber: idx + 1,
      })),
      status: "published",
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onStartExam(customExam, "practice");
  };

  // Count current session stats
  const answersList = Object.values(userAnswers) as Array<{
    selected: string;
    isChecked: boolean;
    isCorrect: boolean;
  }>;
  const checkedAnswers = answersList.filter((a) => a.isChecked);
  const correctCount = checkedAnswers.filter((a) => a.isCorrect).length;
  const incorrectCount = checkedAnswers.filter((a) => !a.isCorrect).length;

  // If teacher or admin, and in management mode, render the Question Bank Studio!
  if (isTeacherOrAdmin && teacherViewMode === "manage") {
    return (
      <TeacherQuestionBankManager
        exams={exams}
        currentUser={currentUser}
        onUpdateExams={onUpdateExams}
        onSwitchToStudentView={() => setTeacherViewMode("student_preview")}
        onStartExam={onStartExam}
      />
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Return to Teacher Management Banner (If viewing as preview) */}
      {isTeacherOrAdmin && teacherViewMode === "student_preview" && (
        <div className="bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                {currentUser?.role === "admin" ? "Админы горим" : "Багшийн горим"}:
              </span>{" "}
              <span className="text-xs font-semibold text-amber-950">
                Та одоогоор сурагчийн дасгал хийх харагдацаар үзэж байна.
              </span>
            </div>
          </div>
          <button
            onClick={() => setTeacherViewMode("manage")}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Тест оруулах & Сан удирдах руу буцах</span>
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="rounded-3xl p-6 sm:p-8 text-white shadow-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-cyan-300" />
              <span>Сурагчийн Бие Даасан Дасгалын Систем</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Нэмэлт Дасгал Даалгавар (Practice Tests)
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Тестийнхээ хэлбэр, сэдэв, асуултын тоог өөрөө сонгон ажиллана.
              Зөв хариуг урьдчилан заахгүй бөгөөд таны алдаагүй зөв хийсэн тестүүд
              автоматаар хадгалагдан цаашид давтагдахгүй.
            </p>
          </div>

          {/* Mastered & Remaining Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-3.5 border border-white/10 text-center">
              <div className="text-[10px] text-slate-300 font-bold uppercase flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-emerald-400" />
                <span>Эзэмшсэн (Зөв)</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {masteredQuestionIds.length}
              </div>
              <div className="text-[10px] text-emerald-200 mt-0.5">Алдаагүй тест</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-3.5 border border-white/10 text-center">
              <div className="text-[10px] text-slate-300 font-bold uppercase flex items-center justify-center gap-1">
                <BookOpen className="w-3 h-3 text-cyan-400" />
                <span>Үлдсэн дасгал</span>
              </div>
              <div className="text-2xl font-black text-cyan-300 mt-1">
                {Math.max(0, allQuestionsWithExam.length - masteredQuestionIds.length)}
              </div>
              <div className="text-[10px] text-cyan-200 mt-0.5">Нийт сан</div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur rounded-2xl p-3.5 border border-white/10 text-center flex flex-col justify-center">
              <div className="text-[10px] text-slate-300 font-bold uppercase">Одоогийн багц</div>
              <div className="text-2xl font-black text-amber-300 mt-1">
                {displayedQuestions.length}
              </div>
              <div className="text-[10px] text-amber-200 mt-0.5">Ажиллах тест</div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration & Filter Hub ("Сурагчид тестээ өөрөө хэлбэрээ тоогоо сонгоод ажилладаг байх") */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Дасгалын тохиргоо (Хэлбэр, сэдэв, тоо сонгох)
            </h2>
          </div>

          {/* Mastered Filter Toggle */}
          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
            <button
              onClick={() => setHideMastered(!hideMastered)}
              className="flex items-center gap-2 text-xs font-bold text-slate-800"
              title="Алдаагүй зөв хийсэн тестүүдийг хасаж, зөвхөн шинэ болон алдсан тестүүдийг харуулах"
            >
              {hideMastered ? (
                <EyeOff className="w-4 h-4 text-emerald-600" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" />
              )}
              <span>Алдаагүй зөв хийсэн тестийг дахиж гаргахгүй:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] ${
                  hideMastered
                    ? "bg-emerald-100 text-emerald-800 font-bold"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {hideMastered ? "Идэвхтэй" : "Унтраасан"}
              </span>
            </button>

            {masteredQuestionIds.length > 0 && (
              <button
                onClick={handleResetMastered}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 border-l pl-3 transition-colors"
                title="Эзэмшсэн бүх тестийн түүхийг цэвэрлэж бүх тестээр дахин дасгал хийх"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Шинэчлэх</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Category Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>1. Ангилал сонгох (Category):</span>
            <span className="text-[11px] text-slate-400 font-normal">ЭЕШ-ийн үндсэн 4 бүлэг</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: "all", label: "Бүх ангилал", count: allQuestionsWithExam.length },
              { id: "Grammar", label: "Grammar (Дүрэм)", count: allQuestionsWithExam.filter((q) => q.question.category === "Grammar").length },
              { id: "Vocabulary", label: "Vocabulary (Үгийн сан)", count: allQuestionsWithExam.filter((q) => q.question.category === "Vocabulary").length },
              { id: "Communication", label: "Communication (Яриа)", count: allQuestionsWithExam.filter((q) => q.question.category === "Communication").length },
              { id: "Reading", label: "Reading (Эх унших)", count: allQuestionsWithExam.filter((q) => q.question.category === "Reading").length },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedCategory === cat.id
                    ? "border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-xs font-bold truncate">{cat.label}</span>
                <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                  {cat.count} тест
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Format / Question Type Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>2. Тестийн хэлбэр / Төрөл (Format):</span>
            <span className="text-[11px] text-slate-400 font-normal">Хүссэн даалгаврын төрлөө сонгоно</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Бүх хэлбэр" },
              { id: "multiple_choice", label: "Олон сонголттой (Multiple choice)" },
              { id: "matching", label: "Багана хослуулах (Matching)" },
              { id: "fill_blank", label: "Өгүүлбэр нөхөх (Fill-in-blanks)" },
              { id: "drag_drop", label: "Чирч ангилах (Drag & Drop)" },
              { id: "image", label: "Зурагт тест (Diagram/Image)" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedType === t.id
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Topic & Question Count */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Topic Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              3. Сэдэв (Topic):
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="all">Бүх сэдэв ({availableTopics.length} сэдэв)</option>
              {availableTopics.map((tp) => (
                <option key={tp} value={tp}>
                  {tp}
                </option>
              ))}
            </select>
          </div>

          {/* Question Count Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              4. Ажиллах тестийн тоо:
            </label>
            <div className="flex items-center gap-1.5">
              {[5, 10, 15, 20, 30, 50].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedCount(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    selectedCount === num
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setSelectedCount(0)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCount === 0
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                title="Бүх тохирсон тестүүдийг ажиллах"
              >
                Бүгд
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Түлхүүр үгээр хайх:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Үг, дүрэм, сэдэв хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Олдсон: <strong className="text-slate-900">{eligibleQuestions.length}</strong> дасгал
              {hideMastered && masteredMatchingCount > 0 && (
                <span className="text-emerald-700 font-semibold ml-1">
                  ({masteredMatchingCount} эзэмшсэн тест хасагдсан)
                </span>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setPracticeMode("focus")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  practiceMode === "focus"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Нэг нэгээр төвлөрөх</span>
              </button>
              <button
                onClick={() => setPracticeMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  practiceMode === "list"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Жагсаалтаар ажиллах</span>
              </button>
            </div>

            {/* Launch Practice Exam in ExamRunner */}
            <button
              onClick={handleLaunchPracticeExam}
              disabled={displayedQuestions.length === 0}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Шалгалт хэлбэрээр эхлүүлэх ({displayedQuestions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Session Progress Stats if student has started answering */}
      {checkedAnswers.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800">
              Одоогийн ажилласан үр дүн:
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> {correctCount} Зөв
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-bold flex items-center gap-1">
                <XCircle className="w-3 h-3" /> {incorrectCount} Алдсан
              </span>
              <span className="text-slate-500 font-medium">
                (Үлдсэн: {Math.max(0, displayedQuestions.length - checkedAnswers.length)})
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Зөв хариулсан дасгалууд автоматаар <strong>Эзэмшсэн</strong> төлөвт шилжлээ.
          </div>
        </div>
      )}

      {/* No questions found state */}
      {displayedQuestions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {hideMastered && masteredMatchingCount > 0
              ? "Баяр хүргэе! Та энэ ангиллын бүх тестийг алдаагүй зөв хийж бүрэн эзэмшсэн байна."
              : "Тохирох дасгал олдсонгүй"}
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            {hideMastered && masteredMatchingCount > 0
              ? `Энэ сонголтоор нийт ${masteredMatchingCount} асуулт байгаа бөгөөд та бүгдийг нь алдаагүй хийсэн тул шүүгдсэн байна. Та дахин давтахыг хүсвэл 'Алдаагүй зөв хийсэн тестийг дахиж гаргахгүй' сонголтыг унтрааж эсвэл шинэчилж болно.`
              : "Та шүүлтүүрийн тохиргоо эсвэл хайлтын үгээ өөрчлөөд дахин оролдоно уу."}
          </p>
          {hideMastered && masteredMatchingCount > 0 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setHideMastered(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Бүх асуултуудыг харах
              </button>
              <button
                onClick={handleResetMastered}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Түүх шинэчлэх
              </button>
            </div>
          )}
        </div>
      ) : practiceMode === "focus" ? (
        /* MODE A: FOCUS MODE (One Question At A Time) */
        <div className="space-y-4">
          {/* Stepper Header */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">
                Асуулт {activeFocusIndex + 1} / {displayedQuestions.length}
              </span>
              <div className="w-32 sm:w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${((activeFocusIndex + 1) / displayedQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveFocusIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeFocusIndex === 0}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                title="Өмнөх асуулт"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>
              <button
                onClick={() =>
                  setActiveFocusIndex((prev) =>
                    Math.min(displayedQuestions.length - 1, prev + 1)
                  )
                }
                disabled={activeFocusIndex === displayedQuestions.length - 1}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                title="Дараагийн асуулт"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {/* Current Question Card */}
          {displayedQuestions[activeFocusIndex] && (
            <InteractivePracticeCard
              key={displayedQuestions[activeFocusIndex].question.id}
              item={displayedQuestions[activeFocusIndex]}
              index={activeFocusIndex}
              userState={userAnswers[displayedQuestions[activeFocusIndex].question.id]}
              onSelectOption={(optId) =>
                handleSelectOption(displayedQuestions[activeFocusIndex].question.id, optId)
              }
              onCheckAnswer={() =>
                handleCheckAnswer(displayedQuestions[activeFocusIndex].question)
              }
              onRetry={() =>
                handleRetryQuestion(displayedQuestions[activeFocusIndex].question.id)
              }
              onNext={
                activeFocusIndex < displayedQuestions.length - 1
                  ? () => setActiveFocusIndex((prev) => prev + 1)
                  : undefined
              }
            />
          )}

          {/* Question Dots Grid */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap gap-1.5 items-center justify-center">
            {displayedQuestions.map((item, idx) => {
              const state = userAnswers[item.question.id];
              const isCurrent = idx === activeFocusIndex;
              let dotBg = "bg-slate-100 text-slate-700 hover:bg-slate-200";

              if (isCurrent) {
                dotBg = "bg-blue-600 text-white ring-2 ring-blue-400 font-black";
              } else if (state?.isChecked) {
                dotBg = state.isCorrect
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-red-500 text-white font-bold";
              } else if (state?.selected) {
                dotBg = "bg-amber-100 text-amber-900 border border-amber-300 font-bold";
              }

              return (
                <button
                  key={item.question.id}
                  onClick={() => setActiveFocusIndex(idx)}
                  className={`w-8 h-8 rounded-xl text-xs flex items-center justify-center transition-all ${dotBg}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* MODE B: LIST MODE (Interactive Cards in a list) */
        <div className="space-y-5">
          {displayedQuestions.map((item, idx) => (
            <InteractivePracticeCard
              key={item.question.id}
              item={item}
              index={idx}
              userState={userAnswers[item.question.id]}
              onSelectOption={(optId) => handleSelectOption(item.question.id, optId)}
              onCheckAnswer={() => handleCheckAnswer(item.question)}
              onRetry={() => handleRetryQuestion(item.question.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Interactive Practice Card Component (DOES NOT SHOW ANSWER DIRECTLY!)
interface InteractivePracticeCardProps {
  item: { question: Question; examTitle: string; examYear: number };
  index: number;
  userState?: {
    selected: string;
    isChecked: boolean;
    isCorrect: boolean;
  };
  onSelectOption: (optionId: string) => void;
  onCheckAnswer: () => void;
  onRetry: () => void;
  onNext?: () => void;
}

const InteractivePracticeCard: React.FC<InteractivePracticeCardProps> = ({
  item,
  index,
  userState,
  onSelectOption,
  onCheckAnswer,
  onRetry,
  onNext,
}) => {
  const q = item.question;
  const isChecked = userState?.isChecked || false;
  const isCorrect = userState?.isCorrect || false;
  const selectedOption = userState?.selected || "";

  return (
    <div
      className={`bg-white rounded-3xl p-6 sm:p-7 border-2 shadow-xs space-y-5 transition-all ${
        isChecked
          ? isCorrect
            ? "border-emerald-300 bg-emerald-50/20"
            : "border-red-300 bg-red-50/20"
          : "border-slate-200"
      }`}
    >
      {/* Top Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl">
            №{index + 1}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              q.category === "Grammar"
                ? "bg-blue-100 text-blue-800"
                : q.category === "Vocabulary"
                ? "bg-emerald-100 text-emerald-800"
                : q.category === "Communication"
                ? "bg-amber-100 text-amber-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {q.category}
          </span>
          {q.type && q.type !== "multiple_choice" && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {q.type === "matching"
                ? "Хослуулах"
                : q.type === "fill_blank"
                ? "Өгүүлбэр нөхөх"
                : "Чирч ангилах"}
            </span>
          )}
          {q.topic && (
            <span className="text-xs text-slate-600 font-medium">
              Сэдэв: <span className="font-semibold text-slate-800">{q.topic}</span>
            </span>
          )}
          {q.subtopic && (
            <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {q.subtopic}
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Эх сурвалж: <strong className="text-slate-700">{item.examTitle}</strong>
        </span>
      </div>

      {/* Reading Passage if attached */}
      {q.readingPassage && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1.5 leading-relaxed font-serif">
          <div className="font-bold text-slate-900 font-sans text-xs flex items-center gap-1.5 pb-1 border-b border-slate-200">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Эх унших хэсэг (Reading Passage)</span>
          </div>
          <p className="whitespace-pre-line">{q.readingPassage}</p>
        </div>
      )}

      {/* Image Attachment if attached */}
      {q.imageUrl && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>Хавсаргасан зураг / Диаграмм:</span>
          </div>
          <img
            src={q.imageUrl}
            alt="Даалгаврын зураг"
            className="max-h-64 w-auto max-w-full rounded-xl object-contain mx-auto border border-slate-200 shadow-2xs bg-white"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Question Text */}
      <div className="font-semibold text-slate-900 text-base sm:text-lg leading-relaxed">
        {q.text}
      </div>

      {/* Matching Columns if type === "matching" */}
      {q.type === "matching" && q.matchingPairs && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
          <div className="text-xs font-black text-indigo-950 uppercase flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Хослуулах өгөгдөл (Matching Columns)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-indigo-100">
              <div className="font-bold text-slate-900 border-b pb-1">Багана А:</div>
              {q.matchingPairs.map((p) => (
                <div key={p.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                  {p.left}
                </div>
              ))}
            </div>
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-indigo-100">
              <div className="font-bold text-slate-900 border-b pb-1">Багана Б:</div>
              {q.matchingPairs.map((p) => (
                <div key={p.id} className="p-2 rounded-lg bg-indigo-50/50 border border-indigo-100 font-medium text-slate-800">
                  {p.right}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fill in Blanks if type === "fill_blank" */}
      {q.type === "fill_blank" && q.blanks && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
          <div className="text-xs font-black text-amber-950 uppercase flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-700" />
            <span>Нөхөх байршлууд (Fill in the blanks)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {q.blanks.map((b) => (
              <div key={b.id} className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-1">
                <div className="font-bold text-amber-900">Байршил [{b.blankIndex}]</div>
                <div className="text-slate-600 font-mono text-[11px]">
                  {isChecked ? `Зөв: ${b.correctAnswer}` : "Тохирох үгийг сонгоно"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drag & Drop Display if type === "drag_drop" */}
      {q.type === "drag_drop" && q.dragItems && q.dropZones && (
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
          <div className="text-xs font-black text-purple-950 uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span>Ангилах бүлгүүд</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-700 self-center">Элементүүд:</span>
            {q.dragItems.map((item) => (
              <span key={item.id} className="px-3 py-1 rounded-xl bg-white border-2 border-purple-300 text-purple-900 font-bold text-xs">
                {item.text}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {q.dropZones.map((zone) => (
              <div key={zone.id} className="p-3 rounded-xl bg-white border-2 border-dashed border-purple-300 text-xs space-y-1.5">
                <div className="font-bold text-purple-950">{zone.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {zone.correctItemIds.map((cId) => {
                    const dragItem = q.dragItems?.find((d) => d.id === cId);
                    return (
                      <span key={cId} className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-semibold text-[11px]">
                        {isChecked ? "✓ " : ""}{dragItem?.text || cId}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Options List - DOES NOT REVEAL ANSWERS PREMATURELY! */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>Хариултаа сонгоно уу:</span>
          {!isChecked && selectedOption && (
            <span className="text-blue-600 font-semibold">Сонгосон: {selectedOption}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {q.options.map((opt) => {
            const isThisSelected = selectedOption === opt.id;
            const isThisCorrect = opt.id === q.correctAnswer;

            // Compute styling dynamically based on student action
            let optionStyle =
              "border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-slate-50";

            if (isChecked) {
              if (isThisCorrect) {
                // Highlight actual correct answer in green
                optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
              } else if (isThisSelected && !isCorrect) {
                // Highlight student's incorrect choice in red
                optionStyle = "border-red-500 bg-red-50 text-red-950 font-bold ring-2 ring-red-500/20";
              } else {
                optionStyle = "border-slate-200 bg-slate-50/50 text-slate-400 opacity-60";
              }
            } else if (isThisSelected) {
              // Selected by user before checking
              optionStyle =
                "border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20 shadow-2xs";
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isChecked}
                onClick={() => onSelectOption(opt.id)}
                className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isChecked && isThisCorrect
                        ? "bg-emerald-600 text-white"
                        : isChecked && isThisSelected && !isCorrect
                        ? "bg-red-600 text-white"
                        : isThisSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="leading-snug">{opt.text}</span>
                </div>

                {/* Feedback Icons */}
                {isChecked && isThisCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                {isChecked && isThisSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Evaluation Feedback Banner & Action Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {!isChecked ? (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onCheckAnswer}
              disabled={!selectedOption}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Шалгах (Хариу баталгаажуулах)</span>
            </button>
            {!selectedOption && (
              <span className="text-[11px] text-slate-600 italic">
                Сонголтоо дарж шалгана уу
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {isCorrect ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Баяр хүргэе! Алдаагүй зөв хийсэн тул эзэмшсэн төлөвт орлоо.</span>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-xl bg-red-100 text-red-900 font-bold text-xs flex items-center gap-1.5 border border-red-300">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Хариулт буруу байна. Алдааны дэвтэрт бүртгэлээ.</span>
              </div>
            )}

            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Дахин оролдох</span>
            </button>

            {onNext && (
              <button
                onClick={onNext}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
              >
                <span>Дараагийн тест</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Explanation - ONLY SHOWN AFTER CHECKING! */}
      {isChecked && q.explanation && (
        <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-800">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Монгол тайлбар & Дүрмийн дүгнэлт:</span>
          </div>
          <p className="leading-relaxed pl-5">{q.explanation}</p>
        </div>
      )}
    </div>
  );
};
