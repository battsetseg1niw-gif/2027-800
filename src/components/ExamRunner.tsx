import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  Flag,
  Sparkles,
  BookOpen,
  X,
  RotateCcw,
  Award,
  Flame,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Check,
  XCircle,
  HelpCircle,
  BarChart3,
  TrendingUp,
  SlidersHorizontal,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  Minimize2,
  Layers,
  ListFilter,
  Image as ImageIcon,
  FileText,
  Music,
} from "lucide-react";
import { Exam, Question, ExamSubmission } from "../types";

interface ExamRunnerProps {
  exam: Exam;
  mode: "mock" | "practice" | "diagnostic";
  userId: string;
  userName: string;
  onFinish: (submission: ExamSubmission) => void;
  onExit: () => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  exam,
  mode,
  userId,
  userName,
  onFinish,
  onExit,
}) => {
  // Compute default exam duration in minutes: 80 min for 50 questions standard, or based on exam
  const defaultMinutes =
    exam.durationMinutes && exam.durationMinutes > 0
      ? exam.durationMinutes
      : exam.totalQuestions
      ? Math.max(15, Math.ceil(exam.totalQuestions * 1.6))
      : 80;

  const totalAllocatedSeconds = defaultMinutes * 60;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(totalAllocatedSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [smartFeedbackMap, setSmartFeedbackMap] = useState<Record<number, string>>({});
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<number | null>(null);

  // Additional UX features: font size, filter in review mode, speech
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xl">("normal");
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect" | "flagged" | "unanswered">("all");
  const [reviewViewMode, setReviewViewMode] = useState<"list" | "stepper">("list");
  const [reviewStepperIdx, setReviewStepperIdx] = useState(0);
  const [timeWarningToast, setTimeWarningToast] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState<ExamSubmission | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen detection and synchronization
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (e) {
      console.warn("Fullscreen request failed or restricted by browser:", e);
      setIsFullscreen((prev) => !prev);
    }
  };

  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<any>(null);
  const warning5mFired = useRef(false);
  const warning1mFired = useRef(false);

  // Load autosaved progress if available
  useEffect(() => {
    const saved = localStorage.getItem(`autosave_exam_${exam.id}_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.currentIdx !== undefined) setCurrentIdx(parsed.currentIdx);
        if (parsed.timeLeftSeconds !== undefined && parsed.timeLeftSeconds > 5) {
          setTimeLeftSeconds(parsed.timeLeftSeconds);
        }
        if (parsed.elapsedSeconds !== undefined) {
          setElapsedSeconds(parsed.elapsedSeconds);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [exam.id, userId]);

  // Active Timer Interval - Runs in ALL modes
  useEffect(() => {
    if (isSubmitted || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      setTimeLeftSeconds((prev) => {
        // Countdown
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }

        // Warnings at 5 minutes and 1 minute
        if (prev === 300 && !warning5mFired.current) {
          warning5mFired.current = true;
          setTimeWarningToast("Анхаар: Шалгалтын хугацаа дуусахад 5 минут үлдлээ!");
          setTimeout(() => setTimeWarningToast(null), 5000);
        } else if (prev === 60 && !warning1mFired.current) {
          warning1mFired.current = true;
          setTimeWarningToast("Анхаар: Сүүлийн 1 минут үлдлээ! Хариултуудаа нягтална уу.");
          setTimeout(() => setTimeWarningToast(null), 6000);
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSubmitted, isPaused]);

  // Periodic autosave
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      localStorage.setItem(
        `autosave_exam_${exam.id}_${userId}`,
        JSON.stringify({
          answers,
          currentIdx,
          timeLeftSeconds,
          elapsedSeconds,
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [answers, currentIdx, timeLeftSeconds, elapsedSeconds, isSubmitted, exam.id, userId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted || isPaused || showConfirmModal) return;

      if (e.key === "ArrowRight") {
        setCurrentIdx((prev) => Math.min(exam.totalQuestions - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentIdx((prev) => Math.max(0, prev - 1));
      } else if (["a", "b", "c", "d", "e"].includes(e.key.toLowerCase())) {
        const optionKey = e.key.toUpperCase();
        const currentQ = exam.questions[currentIdx];
        if (currentQ) {
          const opt = currentQ.options.find((o) => o.id === optionKey);
          if (opt) {
            handleSelectAnswer(currentQ.questionNumber, optionKey);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIdx, isSubmitted, isPaused, showConfirmModal, exam.questions, exam.totalQuestions]);

  // Autosave to localStorage on answer change
  const handleSelectAnswer = (qNumber: number, optionId: string) => {
    if (isSubmitted) return;
    const nextAnswers = { ...answers, [qNumber]: optionId };
    setAnswers(nextAnswers);
    localStorage.setItem(
      `autosave_exam_${exam.id}_${userId}`,
      JSON.stringify({
        answers: nextAnswers,
        currentIdx,
        timeLeftSeconds,
        elapsedSeconds,
      })
    );
  };

  const handleToggleFlag = (qNumber: number) => {
    setFlagged((prev) => ({ ...prev, [qNumber]: !prev[qNumber] }));
  };

  const handleAutoSubmit = () => {
    setTimeWarningToast("Шалгалтын цаг дууслаа! Шалгалтыг автоматаар илгээж байна...");
    setTimeout(() => {
      handleSubmit();
    }, 1200);
  };

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitted(true);
    setShowConfirmModal(false);

    // Calculate score
    let rawScore = 0;
    const catScores: Record<string, { correct: number; total: number }> = {
      Grammar: { correct: 0, total: 0 },
      Vocabulary: { correct: 0, total: 0 },
      Communication: { correct: 0, total: 0 },
      Reading: { correct: 0, total: 0 },
    };

    exam.questions.forEach((q) => {
      const cat = q.category || "Grammar";
      if (!catScores[cat]) catScores[cat] = { correct: 0, total: 0 };
      catScores[cat].total += 1;

      if (answers[q.questionNumber] === q.correctAnswer) {
        rawScore += 1;
        catScores[cat].correct += 1;
      }
    });

    const percentage = Math.round((rawScore / (exam.totalQuestions || 1)) * 100);
    // ESH scale formula: 200 + (rawScore / total) * 600
    const scaledScore = Math.min(
      800,
      Math.round(200 + (rawScore / (exam.totalQuestions || 1)) * 600)
    );
    const finalTimeSpent = elapsedSeconds > 0 ? elapsedSeconds : Math.round((Date.now() - startTimeRef.current) / 1000);

    const submission: ExamSubmission = {
      id: `sub-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      userId,
      userName,
      answers,
      rawScore,
      percentage,
      scaledScore,
      timeSpentSeconds: finalTimeSpent,
      submittedAt: new Date().toISOString(),
      categoryScores: catScores as any,
      source: "digital",
    };

    setSubmissionData(submission);
    localStorage.removeItem(`autosave_exam_${exam.id}_${userId}`);
    onFinish(submission);
  };

  // Request Smart Feedback for a question
  const fetchSmartFeedback = async (q: Question) => {
    const userAnswer = answers[q.questionNumber] || "Not answered";
    setIsLoadingFeedback(q.questionNumber);

    try {
      const res = await fetch("/api/ai/smart-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: q.text,
          options: q.options,
          userAnswer,
          correctAnswer: q.correctAnswer,
          category: q.category,
          topic: q.topic,
        }),
      });
      const data = await res.json();
      if (data.feedback) {
        setSmartFeedbackMap((prev) => ({ ...prev, [q.questionNumber]: data.feedback }));
      }
    } catch (e) {
      console.error(e);
      setSmartFeedbackMap((prev) => ({
        ...prev,
        [q.questionNumber]: q.explanation || "ЭЕШ-ийн зөв хариулт ба дүрэм.",
      }));
    } finally {
      setIsLoadingFeedback(null);
    }
  };

  // Web Speech Pronunciation
  const handleSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/_+/g, "blank");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const currentQ = exam.questions[currentIdx] || exam.questions[0];

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.min(100, Math.round((answeredCount / (exam.totalQuestions || 1)) * 100));
  const timeProgressPercent = Math.max(0, Math.min(100, Math.round((timeLeftSeconds / totalAllocatedSeconds) * 100)));

  // Accurate breakdown counts for review
  const correctCount = exam.questions.filter((q) => answers[q.questionNumber] === q.correctAnswer).length;
  const incorrectCount = exam.questions.filter((q) => answers[q.questionNumber] && answers[q.questionNumber] !== q.correctAnswer).length;
  const unansweredCount = exam.questions.filter((q) => !answers[q.questionNumber]).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;

  // Filtered questions in review mode
  const filteredQuestions = exam.questions.filter((q) => {
    if (!isSubmitted || reviewFilter === "all") return true;
    const isAns = Boolean(answers[q.questionNumber]);
    const isCorr = answers[q.questionNumber] === q.correctAnswer;
    const isFlg = Boolean(flagged[q.questionNumber]);

    if (reviewFilter === "correct") return isAns && isCorr;
    if (reviewFilter === "incorrect") return isAns && !isCorr;
    if (reviewFilter === "unanswered") return !isAns;
    if (reviewFilter === "flagged") return isFlg;
    return true;
  });

  const handleSetReviewFilter = (filter: "all" | "correct" | "incorrect" | "flagged" | "unanswered") => {
    setReviewFilter(filter);
    setReviewStepperIdx(0);
  };

  return (
    <div
      className={`w-full mx-auto space-y-6 pb-20 transition-all ${
        isFullscreen
          ? "max-w-none px-4 sm:px-10 py-4 bg-slate-50 min-h-screen"
          : "max-w-6xl px-2 sm:px-0"
      }`}
    >
      {/* Time Warning Toast Banner */}
      {timeWarningToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-xl border border-rose-400 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-bounce">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{timeWarningToast}</span>
          <button
            onClick={() => setTimeWarningToast(null)}
            className="ml-2 hover:opacity-80 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Bar: Exam Title, Live Running Timer, Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-20 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!isSubmitted && answeredCount > 0) {
                if (window.confirm("Шалгалтаас гарах уу? Таны сонголтууд автоматаар хадгалагдсан байгаа.")) {
                  onExit();
                }
              } else {
                onExit();
              }
            }}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="Гарах"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1">
              {exam.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <span className="font-semibold text-blue-600">
                {mode === "mock" ? "Mock Test горим" : mode === "diagnostic" ? "Түвшин тогтоох" : "Practice горим"}
              </span>
              <span>•</span>
              <span>
                Хариулсан: <strong>{answeredCount}</strong> / {exam.totalQuestions} ({progressPercent}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* FONT SIZE CONTROLS */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setFontSize("normal")}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                fontSize === "normal" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Хэвийн үсгийн хэмжээ"
            >
              A
            </button>
            <button
              onClick={() => setFontSize("large")}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                fontSize === "large" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Том үсгийн хэмжээ"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize("xl")}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                fontSize === "xl" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Маш том үсгийн хэмжээ"
            >
              A++
            </button>
          </div>

          {/* ACTIVE RUNNING TIMER (Runs in ALL Modes) */}
          {!isSubmitted && (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm border shadow-xs transition-all ${
                  timeLeftSeconds < 300
                    ? "bg-rose-50 text-rose-600 border-rose-300 ring-2 ring-rose-200 animate-pulse"
                    : timeLeftSeconds < 600
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-slate-900 text-white border-slate-800"
                }`}
              >
                <Clock className={`w-4 h-4 ${timeLeftSeconds < 300 ? "text-rose-600 animate-spin" : "text-blue-400"}`} />
                <div className="flex flex-col text-left">
                  <span className="leading-tight">
                    {formatTime(timeLeftSeconds)}
                  </span>
                  <span className="text-[9px] font-sans opacity-75 font-normal leading-none hidden sm:inline">
                    {timeLeftSeconds < 300 ? "Яаравчилна уу!" : "Үлдсэн хугацаа"}
                  </span>
                </div>
              </div>

              {/* Pause / Resume Button (For Practice Mode) */}
              {mode === "practice" && (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isPaused
                      ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                  title={isPaused ? "Үргэлжлүүлэх" : "Түр зогсоох"}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isPaused ? "Үргэлжлүүлэх" : "Зогсоох"}</span>
                </button>
              )}
            </div>
          )}

          {/* FULLSCREEN TOGGLE BUTTON */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isFullscreen
                ? "bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-200"
                : "text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
            title={isFullscreen ? "Энгийн хэмжээ рүү буцах (Esc)" : "Бүтэн дэлгэцийн горимд шилжих"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-blue-700" /> : <Maximize2 className="w-4 h-4 text-slate-600" />}
            <span className="hidden md:inline">{isFullscreen ? "Жижигрүүлэх" : "Бүтэн дэлгэц"}</span>
          </button>

          {/* SUBMIT / RETURN BUTTON */}
          {!isSubmitted ? (
            <button
              id="btn-submit-exam"
              onClick={() => setShowConfirmModal(true)}
              className="px-4 sm:px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Дуусгах & Илгээх</span>
            </button>
          ) : (
            <button
              onClick={onExit}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <span>Самбар луу буцах</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar under header */}
      {!isSubmitted && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            title={`Асуултын явц: ${answeredCount}/${exam.totalQuestions}`}
          />
        </div>
      )}

      {/* PAUSE OVERLAY (PRACTICE MODE) */}
      {isPaused && !isSubmitted && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-8 text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Pause className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-amber-950">Шалгалт түр зогссон байна</h3>
            <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
              Та дасгалаа түр завсарлаад үргэлжлүүлэх боломжтой. Цаг зогссон бөгөөд асуултын хариултууд бүрэн хадгалагдсан.
            </p>
          </div>
          <button
            onClick={() => setIsPaused(false)}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Шалгалтыг үргэлжлүүлэх</span>
          </button>
        </div>
      )}

      {/* POST-SUBMISSION PERFORMANCE SCORECARD BANNER */}
      {isSubmitted && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-2xl font-black leading-none">
                  {submissionData?.scaledScore || Math.min(800, Math.round(200 + (Object.keys(answers).length / (exam.totalQuestions || 1)) * 600))}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">ЭЕШ Оноо</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">Шалгалтын гүйцэтгэлийн тайлан</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Амжилттай хадгалагдлаа
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Та нийт <strong>{exam.totalQuestions}</strong> асуултаас{" "}
                  <strong className="text-emerald-600 font-bold">{submissionData?.rawScore || 0}</strong> асуултад зөв хариуллаа ({submissionData?.percentage || 0}%).
                  Буруу хариулсан асуултууд таны <strong>Алдааны дэвтэрт</strong> автоматаар бүртгэгдсэн.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setAnswers({});
                  setFlagged({});
                  setTimeLeftSeconds(totalAllocatedSeconds);
                  setElapsedSeconds(0);
                  warning5mFired.current = false;
                  warning1mFired.current = false;
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Дахин өгөх</span>
              </button>
              <button
                onClick={onExit}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Самбар луу буцах</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-700 font-bold block">Зарцуулсан хугацаа</span>
              <span className="text-lg font-extrabold text-slate-900 mt-1 block">
                {formatTime(submissionData?.timeSpentSeconds || elapsedSeconds)}
              </span>
              <span className="text-[10px] text-slate-700">
                Стандарт: {defaultMinutes} минут
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-700 font-bold block">Дундаж хурд</span>
              <span className="text-lg font-extrabold text-slate-900 mt-1 block">
                {Math.round((submissionData?.timeSpentSeconds || elapsedSeconds) / (exam.totalQuestions || 1))} сек
              </span>
              <span className="text-[10px] text-slate-700">
                1 асуулт тутамд
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-700 font-bold block">Зөв / Буруу</span>
              <span className="text-lg font-extrabold text-slate-900 mt-1 block flex items-center gap-2">
                <span className="text-emerald-600">{submissionData?.rawScore || 0}</span>
                <span className="text-slate-300">/</span>
                <span className="text-rose-600">{(exam.totalQuestions || 0) - (submissionData?.rawScore || 0)}</span>
              </span>
              <span className="text-[10px] text-slate-700">
                Зөв ба Буруу хариулт
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-700 font-bold block">Гүйцэтгэлийн түвшин</span>
              <span className="text-lg font-extrabold text-blue-600 mt-1 block">
                {(submissionData?.scaledScore || 0) >= 700
                  ? "Шилдэг (A+)"
                  : (submissionData?.scaledScore || 0) >= 600
                  ? "Өндөр (A)"
                  : (submissionData?.scaledScore || 0) >= 500
                  ? "Дундаж (B)"
                  : "Бататгах шаардлагатай"}
              </span>
              <span className="text-[10px] text-slate-700">
                Монгол ЭЕШ зэрэглэл
              </span>
            </div>
          </div>

          {/* Category Progress */}
          {submissionData?.categoryScores && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
                Сэдэв тус бүрийн амжилт (Category Breakdown)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(submissionData.categoryScores).map(([cat, score]: [string, any]) => {
                  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
                  return (
                    <div key={cat} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-800">{cat}</span>
                        <span className="font-extrabold text-blue-600">{score.correct}/{score.total} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-600" : "bg-rose-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review Filter Tabs & View Mode Switcher */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
                <ListFilter className="w-3.5 h-3.5" />
                <span>Шүүлтүүр:</span>
              </span>
              {[
                { id: "all", label: `Бүх асуулт (${exam.totalQuestions})` },
                { id: "incorrect", label: `Буруу (${incorrectCount})`, highlight: "rose" },
                { id: "correct", label: `Зөв (${correctCount})`, highlight: "emerald" },
                { id: "unanswered", label: `Хариулаагүй (${unansweredCount})`, highlight: "slate" },
                { id: "flagged", label: `Эргэлзсэн (${flaggedCount})`, highlight: "amber" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSetReviewFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    reviewFilter === f.id
                      ? f.highlight === "rose"
                        ? "bg-rose-600 text-white shadow-xs scale-105"
                        : f.highlight === "emerald"
                        ? "bg-emerald-600 text-white shadow-xs scale-105"
                        : "bg-slate-900 text-white shadow-xs scale-105"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* View Mode Switcher in Review */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setReviewViewMode("list")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  reviewViewMode === "list"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Жагсаалтаар харах ({filteredQuestions.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setReviewViewMode("stepper")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  reviewViewMode === "stepper"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>Нэг нэгээр шалгах</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container: Question & Bubble Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Card or Review List */}
        <div className="lg:col-span-2 space-y-4">
          {/* ========================================================================= */}
          {/* 1. REVIEW MODE: EXPANDED LIST VIEW */}
          {/* ========================================================================= */}
          {isSubmitted && reviewViewMode === "list" && (
            <div className="space-y-6">
              {filteredQuestions.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    {reviewFilter === "incorrect"
                      ? "Баяр хүргэе! Та энэ шалгалтад буруу хариулсан асуулт алга байна! 🎉"
                      : reviewFilter === "unanswered"
                      ? "Та шалгалтын бүх асуултад бүрэн хариулсан байна."
                      : reviewFilter === "flagged"
                      ? "Эргэлзээтэй гэж тэмдэглэсэн асуулт байхгүй байна."
                      : "Энэ шүүлтүүрт харгалзах асуулт олдсонгүй."}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Шалгалтын бусад асуултуудыг харахын тулд дээрх шүүлтүүрээс "Бүх асуулт" гэснийг сонгоно уу.
                  </p>
                  <button
                    onClick={() => handleSetReviewFilter("all")}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Бүх асуултыг харах
                  </button>
                </div>
              ) : (
                filteredQuestions.map((q, fIdx) => {
                  const isAns = Boolean(answers[q.questionNumber]);
                  const isCorr = answers[q.questionNumber] === q.correctAnswer;
                  const isFlg = Boolean(flagged[q.questionNumber]);

                  // Reading passage: strictly only on Reading questions (category Reading or Q38-50)
                  const isReadingQ =
                    q.category === "Reading" ||
                    Boolean(q.readingPassage) ||
                    (q.questionNumber >= 38 && q.questionNumber <= 50);

                  const activePassage = isReadingQ
                    ? q.readingPassage ||
                      exam.readingPassage ||
                      exam.questions.find((item) => item.category === "Reading" && item.readingPassage)?.readingPassage
                    : null;

                  return (
                    <div
                      key={`${q.id || 'q'}-${q.questionNumber}-${fIdx}`}
                      id={`review-card-${q.questionNumber}`}
                      className={`bg-white rounded-3xl p-6 sm:p-7 border-2 shadow-xs space-y-5 scroll-mt-28 transition-all ${
                        !isAns
                          ? "border-slate-200"
                          : isCorr
                          ? "border-emerald-200 bg-emerald-50/10"
                          : "border-rose-200 bg-rose-50/10"
                      }`}
                    >
                      {/* Card Header with Question Number, Category and Status Badge */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center border border-blue-100">
                            {q.questionNumber}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {q.category}
                          </span>
                          {q.type && q.type !== "multiple_choice" && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                              {q.type === "matching" ? "Хослуулах" : q.type === "fill_blank" ? "Нөхөх" : "Чирэх"}
                            </span>
                          )}
                          {q.topic && (
                            <span className="text-xs text-slate-600 font-medium">
                              Сэдэв: <span className="font-semibold text-slate-800">{q.topic}</span>
                            </span>
                          )}
                          {isFlg && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                              <Flag className="w-3 h-3 text-amber-700" />
                              <span>Эргэлзсэн</span>
                            </span>
                          )}
                        </div>

                        {/* Result Badge */}
                        <div>
                          {isCorr ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Зөв хариулсан (+1 оноо)</span>
                            </span>
                          ) : isAns ? (
                            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Буруу (Таны сонголт: {answers[q.questionNumber]})</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                              <span>Хариулаагүй (Зөв хариулт нь: {q.correctAnswer})</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reading Passage ONLY for reading questions */}
                      {isReadingQ && activePassage && (
                        <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-5 mb-2 shadow-xs">
                          <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/70 mb-2.5">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-amber-900" />
                              <span className="text-xs font-black uppercase text-amber-950">
                                Унших дасгалын эх бичвэр (Reading Passage)
                              </span>
                            </div>
                            <button
                              onClick={() => handleSpeak(activePassage)}
                              className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Сонсох</span>
                            </button>
                          </div>
                          <div className="font-serif text-slate-800 text-sm leading-relaxed whitespace-pre-line bg-white/90 p-3.5 rounded-xl border border-amber-200/60">
                            {activePassage}
                          </div>
                        </div>
                      )}

                      {/* Image Attachment Display if present */}
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
                          {q.attachmentName && (
                            <div className="text-[11px] text-center text-slate-500 font-medium">
                              Файл: {q.attachmentName}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Question Text */}
                      <div className="font-semibold text-slate-900 text-base sm:text-lg leading-relaxed">
                        {q.text}
                      </div>

                      {/* Matching Columns if Matching Type */}
                      {q.type === "matching" && q.matchingPairs && (
                        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                          <div className="text-xs font-black text-indigo-950 uppercase flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-indigo-600" />
                            <span>Хослуулах өгөгдөл (Matching Columns)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                              <div className="font-bold text-slate-900 border-b pb-1">Багана А:</div>
                              {q.matchingPairs.map((p) => (
                                <div key={p.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                                  {p.left}
                                </div>
                              ))}
                            </div>
                            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
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

                      {/* Fill in Blanks if Fill Blank Type */}
                      {q.type === "fill_blank" && q.blanks && (
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                          <div className="text-xs font-black text-amber-950 uppercase flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-amber-700" />
                            <span>Нөхөх байршлууд (Blanks to complete)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            {q.blanks.map((b) => (
                              <div key={b.id} className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-1">
                                <div className="font-bold text-amber-900">Байршил [{b.blankIndex}]:</div>
                                <div className="text-slate-800 font-mono font-bold bg-amber-50 px-2 py-1 rounded border border-amber-100 text-center">
                                  Зөв: {b.correctAnswer}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Drag & Drop Display if Drag Drop Type */}
                      {q.type === "drag_drop" && q.dragItems && q.dropZones && (
                        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                          <div className="text-xs font-black text-purple-950 uppercase flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-purple-700" />
                            <span>Чирэх / Ангилах бүлгүүд</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-bold text-slate-700 self-center">Элементүүд:</span>
                            {q.dragItems.map((item) => (
                              <span key={item.id} className="px-3 py-1 rounded-xl bg-white border-2 border-purple-300 text-purple-900 font-bold text-xs shadow-2xs">
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
                                    const item = q.dragItems?.find((d) => d.id === cId);
                                    return (
                                      <span key={cId} className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-semibold text-[11px]">
                                        ✓ {item?.text || cId}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Options List */}
                      <div className="space-y-2.5">
                        {q.options.map((opt) => {
                          const isSelected = answers[q.questionNumber] === opt.id;
                          const isCorrect = q.correctAnswer === opt.id;

                          let borderStyle = "border-slate-200 bg-white text-slate-700";
                          if (isCorrect) {
                            borderStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/30";
                          } else if (isSelected && !isCorrect) {
                            borderStyle = "border-rose-400 bg-rose-50 text-rose-950 line-through font-semibold";
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${borderStyle}`}
                            >
                              <div
                                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isCorrect
                                    ? "bg-emerald-600 text-white"
                                    : isSelected
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {opt.id}
                              </div>
                              <span className="flex-1 text-sm">{opt.text}</span>
                              {isCorrect && (
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Зөв хариулт</span>
                                </span>
                              )}
                              {isSelected && !isCorrect && (
                                <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Таны сонгосон хариулт</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation & Smart Feedback */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Дүрмийн зөв хариултын тайлбар:</span>
                          </div>
                          {!smartFeedbackMap[q.questionNumber] && (
                            <button
                              disabled={isLoadingFeedback === q.questionNumber}
                              onClick={() => fetchSmartFeedback(q)}
                              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              {isLoadingFeedback === q.questionNumber
                                ? "AI тайлбар бичиж байна..."
                                : "AI тайлбар харах"}
                            </button>
                          )}
                        </div>
                        <p className="text-slate-700">
                          {smartFeedbackMap[q.questionNumber] ||
                            q.explanation ||
                            `Зөв хариулт: ${q.correctAnswer}. Энэ асуулт нь ЭЕШ-ийн ${q.category} ангиллын дүрэмд хамаарна.`}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. STEPPER MODE (DURING EXAM OR STEPPER REVIEW) */}
          {/* ========================================================================= */}
          {(!isSubmitted || reviewViewMode === "stepper") && (
            (() => {
              const activeQ = isSubmitted
                ? filteredQuestions[reviewStepperIdx] || filteredQuestions[0] || currentQ
                : currentQ;

              if (isSubmitted && filteredQuestions.length === 0) {
                return (
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-black text-slate-900">
                      {reviewFilter === "incorrect"
                        ? "Баяр хүргэе! Та энэ шалгалтад буруу хариулсан асуулт алга байна! 🎉"
                        : "Энэ шүүлтүүрт харгалзах асуулт олдсонгүй."}
                    </h4>
                    <button
                      onClick={() => handleSetReviewFilter("all")}
                      className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      Бүх асуултыг харах
                    </button>
                  </div>
                );
              }

              // Reading passage: strictly only on Reading questions (category Reading or Q38-50)
              const isReadingQ =
                activeQ.category === "Reading" ||
                Boolean(activeQ.readingPassage) ||
                (activeQ.questionNumber >= 38 && activeQ.questionNumber <= 50);

              const activePassage = isReadingQ
                ? activeQ.readingPassage ||
                  exam.readingPassage ||
                  exam.questions.find((item) => item.category === "Reading" && item.readingPassage)?.readingPassage
                : null;

              return (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center border border-blue-100">
                        {activeQ.questionNumber}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {activeQ.category}
                      </span>
                      {activeQ.topic && (
                        <span className="text-xs text-slate-700 font-medium">
                          Сэдэв: <span className="font-semibold text-slate-800">{activeQ.topic}</span>
                        </span>
                      )}
                      {isSubmitted && (
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            answers[activeQ.questionNumber] === activeQ.correctAnswer
                              ? "bg-emerald-100 text-emerald-800"
                              : answers[activeQ.questionNumber]
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {answers[activeQ.questionNumber] === activeQ.correctAnswer
                            ? "✅ Зөв"
                            : answers[activeQ.questionNumber]
                            ? `❌ Буруу (Таны сонголт: ${answers[activeQ.questionNumber]})`
                            : "⚪ Хариулаагүй"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Pronunciation Voice Button */}
                      <button
                        onClick={() => handleSpeak(activeQ.text)}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          isSpeaking
                            ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                            : "text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                        title="Асуултыг англи дуудлагаар сонсох"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="hidden sm:inline">Сонсох</span>
                      </button>

                      {/* Flag for Review */}
                      {!isSubmitted && (
                        <button
                          onClick={() => handleToggleFlag(activeQ.questionNumber)}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            flagged[activeQ.questionNumber]
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : "text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                          title="Эргэлзээтэй асуултыг тэмдэглэх"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Эргэлзээтэй</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* READING PASSAGE - ONLY SHOWN ON READING QUESTIONS (CATEGORY READING OR Q38-50) */}
                  {isReadingQ && activePassage && (
                    <div className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-5 sm:p-6 mb-2 shadow-xs transition-all animate-in fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-amber-200/80 mb-3 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 shadow-xs">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950 block">
                              Унших дасгалын эх бичвэр (Reading Passage)
                            </span>
                            <span className="text-[11px] text-amber-800 font-medium">
                              Дараах эхийг анхааралтай уншиж, холбогдох асуултуудад хариулна уу
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSpeak(activePassage)}
                          className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/90 hover:bg-amber-200 rounded-xl transition-colors border border-amber-300 cursor-pointer"
                          title="Эхийг дуут аудио хэлбэрээр сонсох"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Эхийг сонсох</span>
                        </button>
                      </div>

                      <div className="font-serif text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line select-text bg-white/90 p-4 sm:p-5 rounded-xl border border-amber-200/70 shadow-xs">
                        {activePassage}
                      </div>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-900 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Унших дасгалын эх нь зөвхөн холбогдох унших хэсгийн асуултуудын дээр харагдаж байна.</span>
                      </div>
                    </div>
                  )}

                  {/* Question Text with dynamic font size */}
                  <div
                    className={`font-medium text-slate-900 leading-relaxed ${
                      fontSize === "xl"
                        ? "text-xl sm:text-2xl"
                        : fontSize === "large"
                        ? "text-lg sm:text-xl"
                        : "text-base sm:text-lg"
                    }`}
                  >
                    {activeQ.text}
                  </div>

                  {/* Image Attachment Display if present */}
                  {activeQ.imageUrl && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                          <span>Хавсаргасан зураг / Диаграмм:</span>
                        </div>
                        {activeQ.attachmentName && (
                          <span className="text-[11px] text-slate-500 font-normal">
                            {activeQ.attachmentName}
                          </span>
                        )}
                      </div>
                      <img
                        src={activeQ.imageUrl}
                        alt="Даалгаврын зураг"
                        className="max-h-80 w-auto max-w-full rounded-xl object-contain mx-auto border border-slate-200 shadow-xs bg-white"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Matching Columns if Matching Type */}
                  {activeQ.type === "matching" && activeQ.matchingPairs && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                      <div className="text-xs font-black text-indigo-950 uppercase flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          <span>Хослуулах өгөгдөл (Matching Columns)</span>
                        </div>
                        <span className="text-[11px] text-indigo-700 font-semibold normal-case">
                          Багана А ба Багана Б-г тохируулан доороос зөв харгалзааг сонгоно уу
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-2 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                          <div className="font-bold text-slate-900 border-b pb-1.5 flex items-center justify-between">
                            <span>Багана А (Асуулт / Нэр томьёо)</span>
                          </div>
                          {activeQ.matchingPairs.map((p) => (
                            <div key={p.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                              {p.left}
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                          <div className="font-bold text-slate-900 border-b pb-1.5 flex items-center justify-between">
                            <span>Багана Б (Тодорхойлолт / Харгалзах утга)</span>
                          </div>
                          {activeQ.matchingPairs.map((p) => (
                            <div key={p.id} className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 font-medium text-slate-800">
                              {p.right}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fill in Blanks if Fill Blank Type */}
                  {activeQ.type === "fill_blank" && activeQ.blanks && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                      <div className="text-xs font-black text-amber-950 uppercase flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-amber-700" />
                          <span>Өгүүлбэр нөхөх даалгавар (Fill in the blanks)</span>
                        </div>
                        <span className="text-[11px] text-amber-800 font-semibold normal-case">
                          Цэгийн оронд тохирох хувилбарыг доорх сонголтоос хийнэ үү
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        {activeQ.blanks.map((b) => (
                          <div key={b.id} className="p-3 rounded-xl bg-white border border-amber-200 space-y-1">
                            <div className="font-bold text-amber-900">Байршил [{b.blankIndex}]</div>
                            {isSubmitted ? (
                              <div className="text-slate-800 font-mono font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200 text-center">
                                Зөв: {b.correctAnswer}
                              </div>
                            ) : (
                              <div className="text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200 text-center">
                                Тохирох үгийг сонгоно уу
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drag & Drop Display if Drag Drop Type */}
                  {activeQ.type === "drag_drop" && activeQ.dragItems && activeQ.dropZones && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                      <div className="text-xs font-black text-purple-950 uppercase flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-purple-700" />
                          <span>Чирэх / Ангилах даалгавар (Categorization)</span>
                        </div>
                        <span className="text-[11px] text-purple-800 font-semibold normal-case">
                          Өгөгдлийг зөв бүлэгт харгалзуулсан хувилбарыг сонгоно уу
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">Үгсийн сан:</span>
                        {activeQ.dragItems.map((item) => (
                          <span key={item.id} className="px-3 py-1 rounded-xl bg-white border-2 border-purple-300 text-purple-900 font-bold text-xs shadow-2xs">
                            {item.text}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                        {activeQ.dropZones.map((zone) => (
                          <div key={zone.id} className="p-3.5 rounded-xl bg-white border-2 border-dashed border-purple-300 space-y-2">
                            <div className="font-bold text-purple-950">{zone.label}</div>
                            <div className="flex flex-wrap gap-1.5">
                              {zone.correctItemIds.map((cId) => {
                                const item = activeQ.dragItems?.find((d) => d.id === cId);
                                return (
                                  <span key={cId} className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-semibold text-[11px]">
                                    {isSubmitted ? "✓ " : ""}{item?.text || cId}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Options List */}
                  <div className="space-y-3">
                    {activeQ.options.map((opt) => {
                      const isSelected = answers[activeQ.questionNumber] === opt.id;
                      const isCorrect = activeQ.correctAnswer === opt.id;

                      let borderStyle = "border-slate-200 hover:border-slate-300 bg-white";
                      if (isSubmitted) {
                        if (isCorrect) {
                          borderStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-400/30";
                        } else if (isSelected && !isCorrect) {
                          borderStyle = "border-rose-400 bg-rose-50 text-rose-950 line-through";
                        }
                      } else if (isSelected) {
                        borderStyle = "border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs";
                      }

                      return (
                        <button
                          key={opt.id}
                          disabled={isSubmitted}
                          onClick={() => handleSelectAnswer(activeQ.questionNumber, opt.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${borderStyle}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                              isSelected
                                ? isSubmitted && !isCorrect
                                ? "bg-rose-600 text-white"
                                : "bg-blue-600 text-white"
                                : isSubmitted && isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {opt.id}
                          </div>
                          <span
                            className={`font-medium flex-1 ${
                              fontSize === "xl"
                                ? "text-base sm:text-lg"
                                : fontSize === "large"
                                ? "text-sm sm:text-base"
                                : "text-sm"
                            }`}
                          >
                            {opt.text}
                          </span>
                          {isSubmitted && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          {isSubmitted && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Smart Feedback section when submitted */}
                  {isSubmitted && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold text-slate-900">
                            Smart Feedback & Монгол тайлбар
                          </span>
                        </div>
                        {!smartFeedbackMap[activeQ.questionNumber] && (
                          <button
                            disabled={isLoadingFeedback === activeQ.questionNumber}
                            onClick={() => fetchSmartFeedback(activeQ)}
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>
                              {isLoadingFeedback === activeQ.questionNumber
                                ? "AI дүн шинжилгээ хийж байна..."
                                : "AI тайлбар авах"}
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                        {smartFeedbackMap[activeQ.questionNumber] ? (
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900">Зөв хариултын дүрмийн шинжилгээ:</p>
                            <p>{smartFeedbackMap[activeQ.questionNumber]}</p>
                          </div>
                        ) : (
                          <p>{activeQ.explanation || "ЭЕШ-ийн зөв хариулт ба дүрмийн тайлбар."}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    {isSubmitted ? (
                      <>
                        <button
                          disabled={reviewStepperIdx === 0}
                          onClick={() => setReviewStepperIdx((prev) => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Өмнөх</span>
                        </button>

                        <span className="text-xs text-slate-700 font-semibold">
                          Шүүгдсэн: {reviewStepperIdx + 1} / {filteredQuestions.length}
                        </span>

                        <button
                          disabled={reviewStepperIdx >= filteredQuestions.length - 1}
                          onClick={() =>
                            setReviewStepperIdx((prev) =>
                              Math.min(filteredQuestions.length - 1, prev + 1)
                            )
                          }
                          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Дараах</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          disabled={currentIdx === 0}
                          onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Өмнөх асуулт</span>
                        </button>

                        <span className="text-xs text-slate-700 font-semibold">
                          {currentIdx + 1} / {exam.totalQuestions}
                        </span>

                        <button
                          disabled={currentIdx === exam.totalQuestions - 1}
                          onClick={() =>
                            setCurrentIdx((prev) => Math.min(exam.totalQuestions - 1, prev + 1))
                          }
                          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Дараах асуулт</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Right Col: Bubble Grid Sheet */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 sticky top-28">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Хариултын хуудас (OMR Grid)</h3>
              <span className="text-xs text-slate-700 font-medium">
                {isSubmitted
                  ? `${correctCount} зөв / ${incorrectCount} буруу`
                  : `${answeredCount} / ${exam.totalQuestions} бөглөсөн`}
              </span>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 text-[10px] text-slate-700 pt-1 pb-2 border-b border-slate-100">
              {isSubmitted ? (
                <>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Зөв</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Буруу</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span>Хариулаагүй</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>Бөглөсөн</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-300" />
                    <span>Хоосон</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Эргэлзээтэй</span>
                  </div>
                </>
              )}
            </div>

            {/* Bubble Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[480px] overflow-y-auto pr-1">
              {exam.questions.map((q, idx) => {
                const isSelected = Boolean(answers[q.questionNumber]);
                const isCurrent = isSubmitted
                  ? reviewViewMode === "stepper"
                    ? filteredQuestions[reviewStepperIdx]?.questionNumber === q.questionNumber
                    : false
                  : currentIdx === idx;
                const isFlagged = Boolean(flagged[q.questionNumber]);
                const isMatchFilter = filteredQuestions.some((fq) => fq.questionNumber === q.questionNumber);

                let cellStyle = "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
                if (isSubmitted) {
                  const isCorrect = answers[q.questionNumber] === q.correctAnswer;
                  if (isCorrect) {
                    cellStyle = "bg-emerald-500 text-white border-emerald-600 shadow-2xs";
                  } else if (isSelected) {
                    cellStyle = "bg-rose-500 text-white border-rose-600 shadow-2xs";
                  } else {
                    cellStyle = "bg-slate-200 text-slate-700 border-slate-300";
                  }

                  if (!isMatchFilter) {
                    cellStyle += " opacity-30 hover:opacity-100";
                  }
                } else if (isCurrent) {
                  cellStyle = "ring-2 ring-blue-600 ring-offset-2 bg-blue-50 text-blue-700 font-bold";
                } else if (isFlagged) {
                  cellStyle = "bg-amber-100 text-amber-900 border-amber-300 font-bold";
                } else if (isSelected) {
                  cellStyle = "bg-blue-600 text-white border-blue-700 font-bold";
                }

                return (
                  <button
                    key={`${q.id || 'q'}-${q.questionNumber}-${idx}`}
                    onClick={() => {
                      if (isSubmitted) {
                        if (reviewViewMode === "list") {
                          const targetCard = document.getElementById(`review-card-${q.questionNumber}`);
                          if (targetCard) {
                            targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
                          } else {
                            // If not in current filter, reset filter to all and scroll
                            handleSetReviewFilter("all");
                            setTimeout(() => {
                              document
                                .getElementById(`review-card-${q.questionNumber}`)
                                ?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }, 50);
                          }
                        } else {
                          const matchIdx = filteredQuestions.findIndex(
                            (fq) => fq.questionNumber === q.questionNumber
                          );
                          if (matchIdx !== -1) {
                            setReviewStepperIdx(matchIdx);
                          } else {
                            handleSetReviewFilter("all");
                            const allIdx = exam.questions.findIndex(
                              (eq) => eq.questionNumber === q.questionNumber
                            );
                            setReviewStepperIdx(Math.max(0, allIdx));
                          }
                        }
                      } else {
                        setCurrentIdx(idx);
                      }
                    }}
                    className={`h-10 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${cellStyle}`}
                  >
                    <span>{q.questionNumber}</span>
                    {answers[q.questionNumber] && !isSubmitted && (
                      <span className="text-[9px] opacity-80 leading-none">
                        {answers[q.questionNumber]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-extrabold text-slate-900">Шалгалтыг дуусгах уу?</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Та нийт <strong>{exam.totalQuestions}</strong> асуултаас{" "}
              <strong>{answeredCount}</strong> асуултад хариулсан байна. Үлдсэн хугацаа:{" "}
              <strong className="text-blue-600 font-mono">{formatTime(timeLeftSeconds)}</strong>.
              Дуусгаснаар оноо шууд бодогдож, ЭЕШ хуваарьт оноо болон алдааны дүн шинжилгээ гарна.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Үргэлжлүүлэн ажиллах
              </button>
              <button
                id="btn-confirm-submit"
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Тийм, дуусгах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
