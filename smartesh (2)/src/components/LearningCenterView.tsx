import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Lock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Play,
  ChevronRight,
  Award,
  Crown,
  Filter,
  AlertTriangle,
  Lightbulb,
  Table,
  RefreshCw,
  FileText,
  HelpCircle,
  Clock,
} from "lucide-react";
import { Lesson, UserProfile } from "../types";
import { initialLessons } from "../data/learningCenterData";
import { db } from "../lib/supabase";

interface LearningCenterViewProps {
  currentUser?: UserProfile | null;
  onOpenPremium: () => void;
}

export const LearningCenterView: React.FC<LearningCenterViewProps> = ({
  currentUser,
  onOpenPremium,
}) => {
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = db.getLessons();
    return saved && saved.length > 0 ? saved : initialLessons;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState(false);
  const [dynamicAiQuestions, setDynamicAiQuestions] = useState<any[] | null>(null);
  const [aiQuizNotice, setAiQuizNotice] = useState<string | null>(null);
  const [quizSeconds, setQuizSeconds] = useState(0);

  useEffect(() => {
    const loaded = db.getLessons();
    if (loaded && loaded.length > 0) {
      setLessons(loaded);
    }
  }, []);

  useEffect(() => {
    if (!activeLesson || showQuizResult) return;
    const interval = setInterval(() => {
      setQuizSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeLesson, showQuizResult]);

  const formatQuizTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const filteredLessons = lessons.filter((l) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "Grammar") return l.track === "Grammar" || l.category === "Grammar";
    if (selectedCategory === "Vocabulary") return l.track === "Vocabulary" || l.category === "Vocabulary";
    if (selectedCategory === "Phrasal Verbs") return l.track === "Phrasal Verbs" || l.track === "Idioms" || l.category === "Phrasal Verbs" || l.category === "Idioms";
    if (selectedCategory === "Communication") return l.track === "Communication" || l.category === "Communication";
    if (selectedCategory === "Reading") return l.track === "Reading" || l.category === "Reading";
    return l.track === selectedCategory || l.category === selectedCategory;
  });

  const handleOpenLesson = (lesson: Lesson) => {
    if (lesson.isLocked && !currentUser?.isPremium) {
      onOpenPremium();
      return;
    }
    setActiveLesson(lesson);
    setQuizAnswers({});
    setQuizSeconds(0);
    setShowQuizResult(false);
    setDynamicAiQuestions(null);
    setAiQuizNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectQuizOption = (qIdx: number, optId: string) => {
    if (showQuizResult) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optId }));
  };

  // AI 10-Question Quiz Generator
  const handleGenerateAiQuiz = async () => {
    if (!activeLesson) return;
    setIsGeneratingAiQuiz(true);
    setAiQuizNotice(null);

    try {
      const res = await fetch("/api/ai/generate-lesson-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: activeLesson.title,
          category: activeLesson.track,
          lessonTitle: activeLesson.title,
          summaryRule: activeLesson.summaryRule,
          detailedContent: activeLesson.detailedContent,
          count: 10,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setDynamicAiQuestions(data.questions);
        setQuizAnswers({});
        setShowQuizResult(false);
        setAiQuizNotice(
          data.source === "gemini"
            ? "Gemini AI тус сэдвийн дагуу 10 цоо шинэ сорилтыг амжилттай боловсрууллаа!"
            : "Тус сэдвийн дагуу 10 сорилтыг амжилттай шинэчиллээ!"
        );
      }
    } catch (err) {
      console.error("AI quiz generation error:", err);
      setAiQuizNotice("AI шалгалт үүсгэхэд алдаа гарлаа. Стандарт тест ашиглана уу.");
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  const currentQuestions =
    dynamicAiQuestions ||
    activeLesson?.quizQuestions ||
    [];

  // Calculate score
  const correctCount = currentQuestions.reduce((acc, q, idx) => {
    return quizAnswers[idx] === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>SmartESH Сургалтын Төв (Learning Center)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ЭЕШ Англи хэлний Дүрэм, Үгийн сан & Аргачлалын Нэгдсэн Сан
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Монгол хэлээр маш нарийвчлан тайлбарласан 12 цаг, идэвхгүй хэв, нөхцөлт өгүүлбэрүүд, төрөлжсөн үгийн сан,
              Phrasal verbs, Reading аргачлал болон хичээл бүрийн төгсгөлд AI 10-асуулт сорилт!
            </p>
          </div>

          {!currentUser?.isPremium && (
            <button
              onClick={onOpenPremium}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all shrink-0"
            >
              <Crown className="w-4 h-4" />
              <span>Бүх Дэлгэрэнгүй Хичээлийг Нээх</span>
            </button>
          )}
        </div>
      </div>

      {/* Main View: Active Lesson Reader OR Lesson Catalog */}
      {activeLesson ? (
        /* Active Lesson Detail View */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-8 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <button
              onClick={() => setActiveLesson(null)}
              className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1.5 transition-colors"
            >
              ← Бүх хичээлүүдийн жагсаалт руу буцах
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {activeLesson.track}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {activeLesson.durationMinutes} мин унших
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {activeLesson.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">{activeLesson.description}</p>
          </div>

          {/* Quick Summary Card */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 sm:p-5 rounded-2xl flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                Шалгалтын Гол Дүрэм & Зүй Тогтол:
              </h4>
              <p className="text-xs sm:text-sm font-medium text-emerald-950 leading-relaxed">
                {activeLesson.summaryRule}
              </p>
            </div>
          </div>

          {/* Detailed Content / Explanations */}
          <div className="space-y-6 text-slate-800 text-sm leading-relaxed bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 font-sans">
            <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-200 pb-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Дэлгэрэнгүй Онол, Бүтэц ба Жишээнүүд:</span>
            </div>
            {activeLesson.detailedContent.split("\n\n").map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line leading-relaxed text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Structured Tables if present */}
          {activeLesson.tables && activeLesson.tables.length > 0 && (
            <div className="space-y-4">
              {activeLesson.tables.map((tbl, tIdx) => (
                <div key={tIdx} className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
                  <div className="bg-slate-800 text-white px-4 py-3 flex items-center gap-2 font-bold text-xs sm:text-sm">
                    <Table className="w-4 h-4 text-emerald-400" />
                    <span>{tbl.title}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-800">
                          {tbl.headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-3 font-extrabold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {tbl.rows.map((r, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                            {r.map((cell, cIdx) => (
                              <td key={cIdx} className="p-3 whitespace-pre-line">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sample Reading Passage if present */}
          {activeLesson.samplePassage && (
            <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-sm">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>{activeLesson.samplePassage.title}</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-indigo-100 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line shadow-inner">
                {activeLesson.samplePassage.text}
              </div>
              {activeLesson.samplePassage.translation && (
                <div className="text-xs text-slate-700 bg-indigo-100/50 p-3.5 rounded-xl border border-indigo-200/60 leading-relaxed">
                  <strong className="text-indigo-900 block mb-1">Монгол тайлбар ба задлан шинжилгээ:</strong>
                  {activeLesson.samplePassage.translation}
                </div>
              )}
            </div>
          )}

          {/* Tips and Exam Traps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLesson.tips && activeLesson.tips.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Шалгалтын Алтан Зөвлөмжүүд (Exam Tips):</span>
                </div>
                <ul className="space-y-1.5 text-xs text-amber-950 list-disc list-inside">
                  {activeLesson.tips.map((t, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeLesson.examTrapAlerts && activeLesson.examTrapAlerts.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Төөрөгдүүлэгч Занга & Анхаарах Зүйлс:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-rose-950 list-disc list-inside">
                  {activeLesson.examTrapAlerts.map((trap, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {trap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 10-Question End-of-Lesson Quiz with AI Generator */}
          <div className="pt-8 border-t border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold">
                    Хичээлийн Сорилт ({currentQuestions.length} асуулт)
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  {dynamicAiQuestions
                    ? "Gemini AI-аар үүсгэсэн шинэ 10 сорилт дээр ажиллаж байна."
                    : "Хичээлийн агуулгыг бататгах 10 асуулт бүхий шалгалт."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Live Running Quiz Timer */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-emerald-400 font-mono font-bold text-xs border border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{formatQuizTime(quizSeconds)}</span>
                </div>

                <button
                  onClick={handleGenerateAiQuiz}
                  disabled={isGeneratingAiQuiz}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>{isGeneratingAiQuiz ? "Боловсруулж байна..." : "AI Шалгалт Боловсруулах"}</span>
                </button>

                {!showQuizResult ? (
                  <button
                    onClick={() => setShowQuizResult(true)}
                    disabled={Object.keys(quizAnswers).length === 0}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Дүнг Шалгах
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowQuizResult(false);
                      setQuizAnswers({});
                      setQuizSeconds(0);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Дахин Өгөх</span>
                  </button>
                )}
              </div>
            </div>

            {aiQuizNotice && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-xl flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{aiQuizNotice}</span>
              </div>
            )}

            {/* Quiz Result Banner */}
            {showQuizResult && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg shadow">
                    {Math.round((correctCount / currentQuestions.length) * 100)}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-emerald-950 text-sm">
                        Та {currentQuestions.length} асуултаас {correctCount} зөв хариуллаа!
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-white/80 text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{formatQuizTime(quizSeconds)}</span>
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {correctCount >= 8
                        ? "Маш сайн! Та тус сэдвийн дүрмийг өндөр түвшинд эзэмшсэн байна."
                        : "Зарим асуулт дээр алдаа гарлаа. Доорх монгол тайлбаруудыг анхааралтай уншиж алдаагаа засна уу."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowQuizResult(false);
                    setQuizAnswers({});
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  Дахин турших
                </button>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              {currentQuestions.map((q, idx) => {
                const isSelected = quizAnswers[idx] !== undefined;
                const isCorrect = quizAnswers[idx] === q.correctAnswer;

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      showQuizResult
                        ? isCorrect
                          ? "border-emerald-300 bg-emerald-50/20"
                          : "border-rose-300 bg-rose-50/20"
                        : "border-slate-200 bg-white"
                    } space-y-3`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold text-sm text-slate-900 whitespace-pre-line">
                        {idx + 1}. {q.question}
                      </div>
                      {showQuizResult && (
                        <div className="shrink-0">
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Зөв
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 text-xs font-bold bg-rose-100 px-2 py-0.5 rounded-md">
                              <XCircle className="w-3.5 h-3.5" /> Буруу
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt: any) => {
                        const isChosen = quizAnswers[idx] === opt.id;
                        const isThisCorrect = q.correctAnswer === opt.id;

                        let style = "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";
                        if (showQuizResult) {
                          if (isThisCorrect) {
                            style = "border-emerald-500 bg-emerald-100/70 text-emerald-950 font-bold";
                          } else if (isChosen && !isThisCorrect) {
                            style = "border-rose-400 bg-rose-100/70 text-rose-950 line-through";
                          } else {
                            style = "border-slate-200 bg-slate-50 text-slate-400 opacity-70";
                          }
                        } else if (isChosen) {
                          style = "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20";
                        }

                        return (
                          <button
                            key={opt.id}
                            disabled={showQuizResult}
                            onClick={() => handleSelectQuizOption(idx, opt.id)}
                            className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${style}`}
                          >
                            <span>
                              <strong>{opt.id}.</strong> {opt.text}
                            </span>
                            {showQuizResult && isThisCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {showQuizResult && (
                      <div className="text-xs text-slate-700 bg-slate-100/80 p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-900 block">
                          Зөв хариу: {q.correctAnswer}
                        </span>
                        <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Catalog of Lessons */
        <div className="space-y-6">
          {/* Category Filter Tabs */}
          <div className="flex border-b border-slate-200 gap-2 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto pb-1">
            {[
              { id: "all", label: `Бүх Хичээлүүд (${initialLessons.length})` },
              { id: "Grammar", label: "Дүрэм (Grammar)" },
              { id: "Vocabulary", label: "Үгийн сан (Vocabulary)" },
              { id: "Phrasal Verbs", label: "Хэллэг үйл үгс (Phrasal)" },
              { id: "Communication", label: "Харилцан яриа (Communication)" },
              { id: "Reading", label: "Унших аргачлал (Reading)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`pb-3 border-b-2 transition-colors whitespace-nowrap px-2 ${
                  selectedCategory === cat.id
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => {
              const isLocked = lesson.isLocked && !currentUser?.isPremium;

              return (
                <div
                  key={lesson.id}
                  onClick={() => handleOpenLesson(lesson)}
                  className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-lg ${
                    isLocked
                      ? "border-slate-200 opacity-85 hover:border-amber-300"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {lesson.track}
                      </span>
                      {isLocked ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Premium
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          Нээлттэй
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 line-clamp-2 leading-snug">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      ⏱ {lesson.durationMinutes} минут • 10 асуулт сорил
                    </span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 group">
                      Үзэх <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
