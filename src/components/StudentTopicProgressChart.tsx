import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  Activity,
  Sparkles,
  Award,
  BookOpen,
  Target,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { ExamSubmission } from "../types";

interface StudentTopicProgressChartProps {
  submissions: ExamSubmission[];
  targetScore?: number;
  onStartExam?: () => void;
}

type ChartViewType = "timeline" | "radar" | "breakdown";

const TOPIC_CONFIG = {
  Grammar: {
    label: "Grammar (Дүрэм)",
    color: "#6366f1", // Indigo
    strokeColor: "#4f46e5",
    gradientFrom: "#6366f1",
    gradientTo: "#818cf8",
    bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  Vocabulary: {
    label: "Vocabulary (Үгийн сан)",
    color: "#10b981", // Emerald
    strokeColor: "#059669",
    gradientFrom: "#10b981",
    gradientTo: "#34d399",
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Reading: {
    label: "Reading (Эх унших)",
    color: "#0284c7", // Sky blue
    strokeColor: "#0369a1",
    gradientFrom: "#0284c7",
    gradientTo: "#38bdf8",
    bgClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  Communication: {
    label: "Communication (Харилцан яриа)",
    color: "#f59e0b", // Amber
    strokeColor: "#d97706",
    gradientFrom: "#f59e0b",
    gradientTo: "#fbbf24",
    bgClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export const StudentTopicProgressChart: React.FC<StudentTopicProgressChartProps> = ({
  submissions,
  targetScore = 800,
  onStartExam,
}) => {
  const [viewType, setViewType] = useState<ChartViewType>("timeline");
  const [activeTopics, setActiveTopics] = useState<Record<string, boolean>>({
    Grammar: true,
    Vocabulary: true,
    Reading: true,
    Communication: true,
  });

  // Sort submissions chronologically (oldest to newest)
  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );
  }, [submissions]);

  // Timeline dataset for Line/Area chart
  const timelineData = useMemo(() => {
    return sortedSubmissions.map((sub, idx) => {
      const g = sub.categoryScores?.Grammar;
      const v = sub.categoryScores?.Vocabulary;
      const r = sub.categoryScores?.Reading;
      const c = sub.categoryScores?.Communication;

      const grammarPct = g && g.total > 0 ? Math.round((g.correct / g.total) * 100) : 0;
      const vocabPct = v && v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
      const readingPct = r && r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0;
      const commPct = c && c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0;

      const dateStr = sub.submittedAt ? sub.submittedAt.slice(5, 10) : `#${idx + 1}`;
      const shortTitle = sub.examTitle
        ? sub.examTitle.length > 16
          ? sub.examTitle.slice(0, 16) + "…"
          : sub.examTitle
        : `Тест ${idx + 1}`;

      return {
        name: `#${idx + 1} (${dateStr})`,
        examTitle: sub.examTitle || `Тест #${idx + 1}`,
        fullDate: sub.submittedAt ? sub.submittedAt.slice(0, 10) : "",
        scaledScore: sub.scaledScore || 0,
        rawScore: sub.rawScore || 0,
        Grammar: grammarPct,
        Vocabulary: vocabPct,
        Reading: readingPct,
        Communication: commPct,
        averagePct: Math.round((grammarPct + vocabPct + readingPct + commPct) / 4),
      };
    });
  }, [sortedSubmissions]);

  // Overall aggregate mastery per topic across all tests
  const aggregateData = useMemo(() => {
    const totals = {
      Grammar: { correct: 0, total: 0 },
      Vocabulary: { correct: 0, total: 0 },
      Reading: { correct: 0, total: 0 },
      Communication: { correct: 0, total: 0 },
    };

    sortedSubmissions.forEach((sub) => {
      if (sub.categoryScores) {
        if (sub.categoryScores.Grammar) {
          totals.Grammar.correct += sub.categoryScores.Grammar.correct || 0;
          totals.Grammar.total += sub.categoryScores.Grammar.total || 0;
        }
        if (sub.categoryScores.Vocabulary) {
          totals.Vocabulary.correct += sub.categoryScores.Vocabulary.correct || 0;
          totals.Vocabulary.total += sub.categoryScores.Vocabulary.total || 0;
        }
        if (sub.categoryScores.Reading) {
          totals.Reading.correct += sub.categoryScores.Reading.correct || 0;
          totals.Reading.total += sub.categoryScores.Reading.total || 0;
        }
        if (sub.categoryScores.Communication) {
          totals.Communication.correct += sub.categoryScores.Communication.correct || 0;
          totals.Communication.total += sub.categoryScores.Communication.total || 0;
        }
      }
    });

    return [
      {
        subject: "Grammar",
        topicName: "Дүрэм",
        mastery:
          totals.Grammar.total > 0
            ? Math.round((totals.Grammar.correct / totals.Grammar.total) * 100)
            : 0,
        correct: totals.Grammar.correct,
        total: totals.Grammar.total,
        fullMark: 100,
        color: TOPIC_CONFIG.Grammar.color,
      },
      {
        subject: "Vocabulary",
        topicName: "Үгийн сан",
        mastery:
          totals.Vocabulary.total > 0
            ? Math.round((totals.Vocabulary.correct / totals.Vocabulary.total) * 100)
            : 0,
        correct: totals.Vocabulary.correct,
        total: totals.Vocabulary.total,
        fullMark: 100,
        color: TOPIC_CONFIG.Vocabulary.color,
      },
      {
        subject: "Reading",
        topicName: "Эх унших",
        mastery:
          totals.Reading.total > 0
            ? Math.round((totals.Reading.correct / totals.Reading.total) * 100)
            : 0,
        correct: totals.Reading.correct,
        total: totals.Reading.total,
        fullMark: 100,
        color: TOPIC_CONFIG.Reading.color,
      },
      {
        subject: "Communication",
        topicName: "Харилцан яриа",
        mastery:
          totals.Communication.total > 0
            ? Math.round((totals.Communication.correct / totals.Communication.total) * 100)
            : 0,
        correct: totals.Communication.correct,
        total: totals.Communication.total,
        fullMark: 100,
        color: TOPIC_CONFIG.Communication.color,
      },
    ];
  }, [sortedSubmissions]);

  const toggleTopic = (topic: string) => {
    setActiveTopics((prev) => ({
      ...prev,
      [topic]: !prev[topic],
    }));
  };

  // Custom Tooltip for Timeline
  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[210px] space-y-2">
          <div className="border-b border-slate-800 pb-1.5">
            <div className="font-bold text-white text-xs">{dataPoint.examTitle}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>{dataPoint.fullDate || label}</span>
              <span className="font-mono text-emerald-400 font-bold">
                ЭЕШ: {dataPoint.scaledScore} / 800
              </span>
            </div>
          </div>
          <div className="space-y-1.5 pt-0.5">
            {payload.map((entry: any, i: number) => {
              const key = entry.dataKey as keyof typeof TOPIC_CONFIG;
              const cfg = TOPIC_CONFIG[key];
              if (!cfg) return null;
              return (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span>{cfg.label.split(" ")[0]}</span>
                  </span>
                  <span className="font-mono font-bold text-white">{entry.value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // If no submissions exist, display a clean empty state
  if (sortedSubmissions.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Англи хэлний 4 чадварын ахиц & Шинжилгээ
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Grammar, Vocabulary, Reading, Communication-ийн гүйцэтгэлийг шалгалтын түүхээр харуулна
            </p>
          </div>
        </div>

        {/* Clean Empty State */}
        <div className="py-12 px-6 text-center rounded-2xl bg-gradient-to-b from-slate-50/80 to-indigo-50/20 border border-slate-100 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100/60 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Activity className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900">
              Одоогоор ахицын график зурахад шалгалтын дата үүсээгүй байна
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Та эхний шалгалт эсвэл түвшин тогтоох сорилтоо ажиллаж дуусмагц систем Grammar,
              Vocabulary, Reading, Communication чадваруудын гүйцэтгэлийг Recharts графикаар автоматаар
              зурж өгнө.
            </p>
          </div>
          {onStartExam && (
            <button
              onClick={onStartExam}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Шалгалт өгч эхлэх</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header with View Switches */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Англи хэлний 4 чадварын ахиц & Шинжилгээ
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {sortedSubmissions.length} шалгалт дээр үндэслэв
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Grammar, Vocabulary, Reading, Communication сэдвүүдийн амжилтын хувийг бодит түүхээр
            харуулна.
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start lg:self-center">
          <button
            onClick={() => setViewType("timeline")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewType === "timeline"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Хугацааны ахиц</span>
          </button>
          <button
            onClick={() => setViewType("radar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewType === "radar"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Чадварын радар</span>
          </button>
          <button
            onClick={() => setViewType("breakdown")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewType === "breakdown"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Баганан харьцуулалт</span>
          </button>
        </div>
      </div>

      {/* 4 Topic Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {aggregateData.map((item) => {
          const cfg = TOPIC_CONFIG[item.subject as keyof typeof TOPIC_CONFIG];
          const isSelected = activeTopics[item.subject];

          return (
            <div
              key={item.subject}
              onClick={() => toggleTopic(item.subject)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-slate-50/80 border-slate-300 shadow-xs"
                  : "bg-white border-slate-100 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span>{item.subject}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">{item.topicName}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900">{item.mastery}%</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {item.correct}/{item.total} зөв
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.mastery}%`,
                    backgroundColor: cfg.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Interactive Recharts Chart Area */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-50/50 border border-slate-200">
        {viewType === "timeline" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Шалгалт тус бүрийн сэдвийн эзэмшил (%)</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  (Дээд картууд дээр дарж сэдвүүдийг нууж/харуулж болно)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-indigo-500 inline-block" /> Grammar
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" /> Vocabulary
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-sky-500 inline-block" /> Reading
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-amber-500 inline-block" /> Communication
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorGrammar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TOPIC_CONFIG.Grammar.color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={TOPIC_CONFIG.Grammar.color} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVocab" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={TOPIC_CONFIG.Vocabulary.color}
                        stopOpacity={0.2}
                      />
                      <stop offset="95%" stopColor={TOPIC_CONFIG.Vocabulary.color} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TOPIC_CONFIG.Reading.color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={TOPIC_CONFIG.Reading.color} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={TOPIC_CONFIG.Communication.color}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={TOPIC_CONFIG.Communication.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomTimelineTooltip />} />

                  {activeTopics.Grammar && (
                    <Area
                      type="monotone"
                      dataKey="Grammar"
                      stroke={TOPIC_CONFIG.Grammar.color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorGrammar)"
                      dot={{ r: 4, fill: TOPIC_CONFIG.Grammar.color }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {activeTopics.Vocabulary && (
                    <Area
                      type="monotone"
                      dataKey="Vocabulary"
                      stroke={TOPIC_CONFIG.Vocabulary.color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorVocab)"
                      dot={{ r: 4, fill: TOPIC_CONFIG.Vocabulary.color }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {activeTopics.Reading && (
                    <Area
                      type="monotone"
                      dataKey="Reading"
                      stroke={TOPIC_CONFIG.Reading.color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorReading)"
                      dot={{ r: 4, fill: TOPIC_CONFIG.Reading.color }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {activeTopics.Communication && (
                    <Area
                      type="monotone"
                      dataKey="Communication"
                      stroke={TOPIC_CONFIG.Communication.color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorComm)"
                      dot={{ r: 4, fill: TOPIC_CONFIG.Communication.color }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewType === "radar" && (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Англи хэлний 4 чадварын тэнцвэр (Spider / Radar Chart)</span>
              <span className="text-[11px] text-slate-500 font-normal">Хамгийн дээд: 100%</span>
            </div>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="75%"
                  data={aggregateData}
                >
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 12, fill: "#334155", fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    stroke="#cbd5e1"
                  />
                  <Radar
                    name="Миний дундаж эзэмшил"
                    dataKey="mastery"
                    stroke="#4f46e5"
                    fill="#6366f1"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, "Амжилтын хувь"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewType === "breakdown" && (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Сэдэв тус бүрийн нийт зөв хариулсан харьцаа & амжилт</span>
              <span className="text-[11px] text-slate-500 font-normal">Нийт тестүүдийн нийлбэр</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={aggregateData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="subject"
                    tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% (${item.payload.correct} / ${item.payload.total} зөв)`,
                      "Эзэмшил",
                    ]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="mastery"
                    radius={[8, 8, 0, 0]}
                    fill="#6366f1"
                    barSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Helpful pedagogical insights footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            ЭЕШ-ийн бодит шалгалтад Grammar 40%, Vocabulary 30%, Reading 20%, Communication 10%
            орчим жин эзэлдэг.
          </span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-indigo-700 shrink-0">
          <span>Зорилтот оноо: {targetScore}</span>
        </div>
      </div>
    </div>
  );
};
