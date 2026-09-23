import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  AlertCircle,
  AlertTriangle,
  Play,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  BookOpen,
  ArrowRight,
  Flame,
  FileText,
  ChevronRight,
  Compass,
  Layers,
  X,
} from "lucide-react";
import { UserProfile, Exam, Assignment, ExamSubmission, MistakeItem, ClassRoom, StudentBadge } from "../types";
import { DailyVocabularyWidget } from "./DailyVocabularyWidget";
import { WeeklyTopStudentsWidget } from "./WeeklyTopStudentsWidget";
import { StudentMilestoneBadges } from "./StudentMilestoneBadges";
import { calculateStudentBadges } from "../lib/badgeEngine";

interface StudentDashboardProps {
  currentUser: UserProfile;
  exams: Exam[];
  assignments: Assignment[];
  submissions: ExamSubmission[];
  mistakes: MistakeItem[];
  classes: ClassRoom[];
  badges?: StudentBadge[];
  onStartExam: (exam: Exam, mode?: "mock" | "practice" | "diagnostic") => void;
  onOpenMistakes: () => void;
  onJoinClass: (code: string) => boolean;
  onStartWeakTopicPractice: (topicName: string) => void;
  onOpenLearningCenter: () => void;
  onOpenArchive: () => void;
  onOpenCustomTest?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  exams,
  assignments,
  submissions,
  mistakes,
  classes,
  badges: externalBadges,
  onStartExam,
  onOpenMistakes,
  onJoinClass,
  onStartWeakTopicPractice,
  onOpenLearningCenter,
  onOpenArchive,
  onOpenCustomTest,
}) => {
  const [classCodeInput, setClassCodeInput] = useState("");
  const [joinMsg, setJoinMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [selectedAiReportSub, setSelectedAiReportSub] = useState<ExamSubmission | null>(null);

  // Strictly filter to current student's performance data
  const mySubmissions = useMemo(
    () => submissions.filter((s) => s.userId === currentUser.id),
    [submissions, currentUser.id]
  );
  const myMistakes = useMemo(
    () => mistakes.filter((m) => m.userId === currentUser.id),
    [mistakes, currentUser.id]
  );

  // Compute student milestone badges dynamically from real performance
  const studentBadges = useMemo(() => {
    if (externalBadges && externalBadges.length > 0) {
      return externalBadges;
    }
    return calculateStudentBadges(currentUser.id, mySubmissions, myMistakes, currentUser);
  }, [externalBadges, currentUser.id, mySubmissions, myMistakes, currentUser]);

  const unlockedBadgesCount = studentBadges.filter((b) => b.isUnlocked).length;

  // Identify latest submission with AI analysis for current student
  const latestAiSubmission = mySubmissions.find((s) => s.aiAnalysis);

  // Calculate student metrics from real submissions
  const totalSubmissions = mySubmissions.length;
  const hasSubmissions = totalSubmissions > 0;
  const averageScaledScore = hasSubmissions
    ? Math.round(mySubmissions.reduce((acc, curr) => acc + curr.scaledScore, 0) / totalSubmissions)
    : 0;

  const targetScore = currentUser.targetEshScore || 720;
  const scoreGap = targetScore - averageScaledScore;

  // Real display name: use profile name or email prefix, never mock names
  const emailPrefix = (currentUser.email || "").split("@")[0] || "";
  const studentDisplayName =
    currentUser.name &&
    currentUser.name.trim() &&
    currentUser.name !== "Хэрэглэгч" &&
    currentUser.name !== "Google Хэрэглэгч" &&
    currentUser.name !== "Зочин сурагч"
      ? currentUser.name.trim()
      : (emailPrefix || "Сурагч");

  const studentDisplayCode =
    currentUser.studentCode && currentUser.studentCode !== "104829"
      ? currentUser.studentCode
      : (currentUser.id ? currentUser.id.slice(0, 6).toUpperCase() : "000000");

  // Identify weak topics from real mistakes
  const topicCounts: Record<string, { count: number; category: string }> = {};
  myMistakes.forEach((m) => {
    const key = m.question?.topic || "General Grammar";
    if (!topicCounts[key]) {
      topicCounts[key] = { count: 0, category: m.question?.category || "Grammar" };
    }
    topicCounts[key].count += 1;
  });

  const weakTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([topic, data]) => ({ topic, category: data.category, count: data.count }));

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim()) return;
    const ok = onJoinClass(classCodeInput.trim().toUpperCase());
    if (ok) {
      setJoinMsg({ text: "Ангид амжилттай элслээ!", success: true });
      setClassCodeInput("");
    } else {
      setJoinMsg({ text: "Ангийн код олдсонгүй эсвэл өмнө нь элссэн байна.", success: false });
    }
    setTimeout(() => setJoinMsg(null), 4000);
  };

  const diagnosticExam = exams.find((e) => e.type === "diagnostic");
  const latestMock = exams.find((e) => e.type === "mock");

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Personalized Diagnostic Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold flex-wrap">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-300" />
                <span>ЭЕШ 2026 Хувийн бэлтгэл</span>
              </div>
              <span className="text-white/40">•</span>
              <span className="text-amber-200">
                Сурагчийн код: <strong className="font-mono text-white bg-amber-500/30 px-2 py-0.5 rounded border border-amber-400/40 text-xs">{studentDisplayCode}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Сайн байна уу, {studentDisplayName}?
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Англи хэлний ЭЕШ-д бэлтгэх бодит сорилтуудаа ажиллаж, алдаагаа Smart Feedback болон AI заавраар засаарай.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {diagnosticExam && (
              <button
                id="btn-start-diagnostic"
                onClick={() => onStartExam(diagnosticExam, "diagnostic")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Түвшин Тогтоох Сорилт</span>
              </button>
            )}

            {latestMock && (
              <button
                id="btn-start-mock"
                onClick={() => onStartExam(latestMock, "mock")}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>2026 Mock Test эхлэх</span>
              </button>
            )}

            {onOpenCustomTest && (
              <button
                id="btn-start-custom-mixed"
                onClick={onOpenCustomTest}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Layers className="w-4 h-4 text-purple-200" />
                <span>Холимог тест үүсгэх</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Diagnostic Study Plan Progress */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Дундаж оноо</div>
            <div className="text-2xl font-extrabold text-blue-300 mt-1">
              {hasSubmissions ? `${averageScaledScore} / 800` : "0 / 800"}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {hasSubmissions ? "Сүүлийн шалгалтуудаас" : "Шалгалт өгөөгүй"}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Зорилтот оноо</div>
            <div className="text-2xl font-extrabold text-emerald-300 mt-1">{targetScore}</div>
            <div className="text-[10px] text-emerald-400 mt-1">
              {hasSubmissions
                ? (scoreGap > 0 ? `${scoreGap} онооны зөрүүтэй` : "Зорилтодоо хүрсэн!")
                : "Хүрэх ЭЕШ оноо"}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Шалгалт өгсөн</div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">{totalSubmissions} удаа</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {hasSubmissions ? "Цаасан + Дижитал нийлээд" : "Одоогоор өгөөгүй"}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Алдааны тэмдэглэл</div>
            <div className="text-2xl font-extrabold text-rose-300 mt-1">{myMistakes.length} асуулт</div>
            <div className="text-[10px] text-rose-400 mt-1">
              {myMistakes.length > 0 ? "Бататгах шаардлагатай" : "Алдаа байхгүй"}
            </div>
          </div>

          <div
            onClick={() => {
              const el = document.getElementById("student-milestone-badges-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-white/5 hover:bg-white/10 transition-colors cursor-pointer rounded-2xl p-4 border border-amber-400/30 group"
          >
            <div className="text-[11px] text-amber-200 font-medium flex items-center justify-between">
              <span>Амжилтын тэмдэгт</span>
              <Award className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              {unlockedBadgesCount} <span className="text-xs text-amber-200/80 font-normal">/ {studentBadges.length}</span>
            </div>
            <div className="text-[10px] text-amber-300 mt-1 flex items-center gap-1">
              <span>Зорилтууд үзэх</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT MILESTONE BADGES SYSTEM */}
      <div id="student-milestone-badges-section">
        <StudentMilestoneBadges
          badges={studentBadges}
          onOpenExamList={onOpenArchive}
          onOpenMistakes={onOpenMistakes}
          onOpenLearningCenter={onOpenLearningCenter}
        />
      </div>


      {/* AI Analysis & Topic Recommendations Card */}
      {latestAiSubmission && latestAiSubmission.aiAnalysis && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Хиймэл Оюуны (AI) Шалгалтын Дэлгэрэнгүй Шинжилгээ
                </h2>
              </div>
              <p className="text-xs text-indigo-200">
                Багшийн сканнердсан цаасан OMR шалгалтын дүн ба таны хувийн сул тал, давтах сэдвүүд
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-indigo-300 font-bold uppercase">ЭЕШ Хуваарьт оноо</div>
                <div className="text-2xl font-black text-amber-300">
                  {latestAiSubmission.scaledScore} / 800
                </div>
              </div>
              <div className="text-right pl-3 border-l border-white/10">
                <div className="text-[10px] text-indigo-300 font-bold uppercase">Түүхий оноо</div>
                <div className="text-2xl font-black text-emerald-400">
                  {latestAiSubmission.rawScore} / 50
                </div>
              </div>
            </div>
          </div>

          {/* Exam Info Tag */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-white">Шалгалт:</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/10 font-bold text-white">
              {latestAiSubmission.examTitle}
            </span>
            <span>•</span>
            <span className="text-slate-400">Огноо: {latestAiSubmission.submittedAt.slice(0, 10)}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {latestAiSubmission.source === "omr_paper" ? "Цаасан OMR шалгалт" : "Дижитал шалгалт"}
            </span>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed">
            {latestAiSubmission.aiAnalysis.summary}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Сайн эзэмшсэн чадварууд ({latestAiSubmission.aiAnalysis.strengths.length})</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {latestAiSubmission.aiAnalysis.strengths.map((st, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Алдаж буй сул талууд ({latestAiSubmission.aiAnalysis.weaknesses.length})</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {latestAiSubmission.aiAnalysis.weaknesses.map((wk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Topics with Direct Practice CTA */}
          {latestAiSubmission.aiAnalysis.recommendedTopics?.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    🎯 AI Зөвлөмж: Одоо давтах шаардлагатай сэдвүүд
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Товч дээр дарж шууд бэлтгэл хийх боломжтой
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {latestAiSubmission.aiAnalysis.recommendedTopics.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs">{item.topic}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            item.priority === "high" || item.priority === ("High" as any)
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {item.priority === "high" || item.priority === ("High" as any)
                            ? "Яаралтай давтах"
                            : "Анхаарах"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{item.reason}</p>
                      {item.suggestedAction && (
                        <div className="text-[11px] text-indigo-300">
                          💡 {item.suggestedAction}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onStartWeakTopicPractice(item.topic)}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Энэ сэдвийг одоо давтах (Smart Practice)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DAILY 10 VOCABULARY REMINDER & PRACTICE WIDGET */}
      <DailyVocabularyWidget
        currentUser={currentUser}
        onOpenLearningCenter={onOpenLearningCenter}
      />

      {/* Grid: Assignments & Join Class */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Teacher Assignments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Багшаас өгсөн даалгаврууд</h2>
            </div>
            <span className="text-xs font-semibold text-slate-700">{assignments.length} даалгавар</span>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-700 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Одоогоор идэвхтэй даалгавар байхгүй байна</h3>
              <p className="text-xs text-slate-700 max-w-md mx-auto">
                Багшийн өгсөн ангийн кодоор ангидаа элссэнээр багшаас оноосон шалгалтууд энд харагдана.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {assignments.map((asg) => {
                const targetExam = exams.find((e) => e.id === asg.examId) || exams[0];
                return (
                  <div
                    key={asg.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {asg.className}
                        </span>
                        <span className="text-xs text-slate-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-700" />
                          <span>{asg.timeLimitMinutes} минут</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{asg.title}</h3>
                      <div className="text-xs text-slate-700 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-700" />
                        <span>Дуусах хугацаа: {asg.dueDate}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartExam(targetExam, "mock")}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Даалгавар ажиллах</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Weak Topics & Smart Practice Booster */}
          <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl p-6 border border-amber-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Сул сэдвийг тодорхойлох & Smart Practice
                </h3>
              </div>
              {myMistakes.length > 0 && (
                <button
                  onClick={onOpenMistakes}
                  className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                >
                  <span>Алдааны дэвтэр</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-800">
              Таны хийсэн шалгалтууд дээрх буруу хариултуудад дүн шинжилгээ хийж, хамгийн их алдсан сэдвүүдийг тодорхойлно.
            </p>

            {weakTopics.length === 0 ? (
              <div className="bg-white/90 rounded-2xl p-6 border border-amber-200/60 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Одоогоор алдаа бүртгэгдээгүй байна</h4>
                  <p className="text-[11px] text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                    Та Англи хэлний ЭЕШ-ийн сорилт ажиллаж эхэлснээр таны алдсан асуултуудад систем дүн шинжилгээ хийж, сул сэдвүүдийг автоматаар энд ялгаж өгнө.
                  </p>
                </div>
                {diagnosticExam && (
                  <button
                    onClick={() => onStartExam(diagnosticExam, "diagnostic")}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Эхний сорилтоо ажиллах</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {weakTopics.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-3.5 border border-amber-200/60 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                        {item.topic}
                      </h4>
                      <p className="text-[11px] text-rose-700 mt-1 font-medium">{item.count} алдаа бүртгэгдсэн</p>
                    </div>

                    <button
                      onClick={() => onStartWeakTopicPractice(item.topic)}
                      className="mt-3 w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Smart Practice</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Join Class & Quick Actions */}
        <div className="space-y-6">
          {/* Join Classroom Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Ангид элсэх (Кодоор)</h3>
            </div>
            <p className="text-xs text-slate-800">
              Багшийнхаа өгсөн 6 оронтой ангийн кодыг (ж нь: <code>ESH-8842</code>) оруулж элсээрэй.
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Код: ESH-XXXX"
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono tracking-wider border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                />
              </div>

              {joinMsg && (
                <div
                  className={`text-xs p-2 rounded-lg font-medium flex items-center gap-1.5 ${
                    joinMsg.success ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                  }`}
                >
                  {joinMsg.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{joinMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Ангид нэгдэх
              </button>
            </form>

            {/* Enrolled classes */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Миний ангиуд ({classes.length})
              </div>
              {classes.length === 0 ? (
                <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                  Одоогоор нэгдсэн анги байхгүй байна. Багшаас өгсөн кодыг оруулан ангидаа нэгдээрэй.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {classes.map((cls) => (
                    <div key={cls.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="font-bold text-slate-900">{cls.name}</div>
                      <div className="text-[11px] text-slate-700 flex items-center justify-between mt-1">
                        <span>{cls.teacherName}</span>
                        <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {cls.code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Mixed Test Builder Shortcut */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-800/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Өмнөх онуудаар тест холих</h3>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              2006–2026 онуудын өмнөх шалгалтын асуултуудыг өөртөө тохируулан хольж, сонгосон сэдвүүдээрээ хувийн тест үүсгэн ажиллаарай.
            </p>
            <button
              id="student-dash-custom-builder-btn"
              onClick={onOpenCustomTest || onOpenArchive}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Холимог тест үүсгэгч рүү очих</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Learning Center Shortcut */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Learning Center</h3>
            </div>
            <p className="text-xs text-slate-800">
              Grammar, Vocabulary, Phrasal Verbs, Idioms, Reading-ийн системчилсэн 18+ хичээл.
            </p>
            <button
              onClick={onOpenLearningCenter}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Хичээлүүд үзэх</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* WEEKLY TOP & MOST IMPROVED STUDENTS LEADERBOARD */}
      <WeeklyTopStudentsWidget currentUser={currentUser} />

      {/* Recent Submissions List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Сүүлийн шалгалтын түүх & Бодит оноо</h3>
            <p className="text-xs text-slate-700">Дижитал болон цаасан OMR шалгалтын үр дүн</p>
          </div>
          <button
            onClick={onOpenArchive}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Бүх шалгалтууд</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-700">Одоогоор өгсөн шалгалт байхгүй байна. Дээрх сорилтуудаас сонгон эхлүүлнэ үү.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-700">
                  <th className="pb-3 font-semibold">Шалгалт</th>
                  <th className="pb-3 font-semibold">Төрөл</th>
                  <th className="pb-3 font-semibold">Огноо</th>
                  <th className="pb-3 font-semibold">Түүхий оноо</th>
                  <th className="pb-3 font-semibold">ЭЕШ Хуваарьт оноо</th>
                  <th className="pb-3 font-semibold">Хугацаа</th>
                  <th className="pb-3 font-semibold text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mySubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80">
                    <td className="py-3 font-semibold text-slate-900">{sub.examTitle}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.source === "omr_paper"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {sub.source === "omr_paper" ? "Цаасан (OMR)" : "Дижитал"}
                      </span>
                    </td>
                    <td className="py-3 text-slate-700">{sub.submittedAt.slice(0, 10)}</td>
                    <td className="py-3 font-medium text-slate-700">
                      {sub.rawScore} / 50 ({sub.percentage}%)
                    </td>
                    <td className="py-3 font-bold text-blue-600 text-sm">{sub.scaledScore} / 800</td>
                    <td className="py-3 text-slate-700">{Math.round(sub.timeSpentSeconds / 60)} мин</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sub.aiAnalysis && (
                          <button
                            onClick={() => setSelectedAiReportSub(sub)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors flex items-center gap-1 border border-indigo-200"
                            title="AI Дэлгэрэнгүй тайлан үзэх"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>AI Дүгнэлт</span>
                          </button>
                        )}
                        <button
                          onClick={onOpenMistakes}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                        >
                          Дэлгэрэнгүй
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Full AI Analysis Report View for any submission */}
      {selectedAiReportSub && selectedAiReportSub.aiAnalysis && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Хиймэл Оюуны (AI) Шалгалтын Тайлан
                  </h3>
                  <p className="text-[11px] text-slate-700">
                    {selectedAiReportSub.examTitle} ({selectedAiReportSub.submittedAt.slice(0, 10)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAiReportSub(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scores Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="text-[10px] font-bold text-slate-700 uppercase">ЭЕШ Хуваарьт оноо</div>
                <div className="text-2xl font-black text-indigo-600 mt-0.5">
                  {selectedAiReportSub.scaledScore} / 800
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="text-[10px] font-bold text-slate-700 uppercase">Түүхий оноо</div>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">
                  {selectedAiReportSub.rawScore} / 50
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
                <div className="text-[10px] font-bold text-slate-700 uppercase">Төрөл</div>
                <div className="text-xs font-bold text-slate-800 mt-2">
                  {selectedAiReportSub.source === "omr_paper" ? "Цаасан (OMR)" : "Дижитал шалгалт"}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ерөнхий дүгнэлт:</h4>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                {selectedAiReportSub.aiAnalysis.summary}
              </div>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Давуу талууд ({selectedAiReportSub.aiAnalysis.strengths.length})</span>
                </div>
                <ul className="space-y-1 text-slate-700 text-[11px]">
                  {selectedAiReportSub.aiAnalysis.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Сайжруулах талууд ({selectedAiReportSub.aiAnalysis.weaknesses.length})</span>
                </div>
                <ul className="space-y-1 text-slate-700 text-[11px]">
                  {selectedAiReportSub.aiAnalysis.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Topics */}
            {selectedAiReportSub.aiAnalysis.recommendedTopics?.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>🎯 Зөвлөмжит давтах сэдвүүд:</span>
                </h4>

                <div className="space-y-2">
                  {selectedAiReportSub.aiAnalysis.recommendedTopics.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rec.topic}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              rec.priority === "high" || rec.priority === ("High" as any)
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {rec.priority === "high" || rec.priority === ("High" as any)
                              ? "Яаралтай давтах"
                              : "Анхаарах"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-snug">{rec.reason}</p>
                        {rec.suggestedAction && (
                          <div className="text-[11px] text-indigo-700 font-medium">
                            💡 {rec.suggestedAction}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedAiReportSub(null);
                          onStartWeakTopicPractice(rec.topic);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Давтах</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAiReportSub(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
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
