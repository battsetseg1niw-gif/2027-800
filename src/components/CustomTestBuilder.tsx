import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  Sliders,
  Play,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BookOpen,
  Filter,
  Check,
  Award,
  Clock,
  Send,
} from "lucide-react";
import { Exam, Question, QuestionCategory, ClassRoom, UserProfile } from "../types";

interface CustomTestBuilderProps {
  exams: Exam[];
  currentUser: UserProfile;
  classes?: ClassRoom[];
  onStartExam: (exam: Exam, mode?: "practice" | "mock") => void;
  onAssignToClass?: (assignmentData: {
    title: string;
    classId: string;
    exam: Exam;
    dueDate: string;
    timeLimitMinutes: number;
  }) => void;
  onPrintOMR?: (exam: Exam) => void;
}

// Granular topic structure for ESH
const CURRICULUM_TOPICS: {
  category: QuestionCategory;
  categoryLabel: string;
  color: string;
  topics: { id: string; label: string; keywords: string[] }[];
}[] = [
  {
    category: "Grammar",
    categoryLabel: "Дүрэм (Grammar)",
    color: "blue",
    topics: [
      {
        id: "tenses",
        label: "Цагууд (Tenses & Aspect)",
        keywords: ["tense", "past", "present", "future", "perfect", "continuous"],
      },
      {
        id: "conditionals",
        label: "Нөхцөлт өгүүлбэр (Conditionals & Wish)",
        keywords: ["conditional", "if", "wish", "had had", "would have"],
      },
      {
        id: "passive",
        label: "Идэвхгүй хэв (Passive Voice)",
        keywords: ["passive", "by", "was done", "completed", "constructed"],
      },
      {
        id: "reported_speech",
        label: "Хөндлөнгийн яриа (Reported Speech)",
        keywords: ["reported", "indirect", "said that", "asked whether"],
      },
      {
        id: "modals",
        label: "Баймж үйл үг (Modal Verbs)",
        keywords: ["modal", "can", "could", "must", "should", "ought", "might"],
      },
      {
        id: "relative_clauses",
        label: "Тодотгол гишүүн (Relative Clauses)",
        keywords: ["relative", "who", "which", "that", "whose", "where"],
      },
      {
        id: "prepositions",
        label: "Угтвар үг, холбоос (Prepositions & Conjunctions)",
        keywords: ["preposition", "conjunction", "in", "on", "at", "although", "despite"],
      },
      {
        id: "articles_quantifiers",
        label: "Ялгац гишүүн, тоо хэмжээ (Articles & Quantifiers)",
        keywords: ["article", "quantifier", "a", "the", "much", "many", "few", "little"],
      },
      {
        id: "subject_verb",
        label: "Эзэн бие ба үйл үгийн зохицол (Subject-Verb Agreement)",
        keywords: ["agreement", "neither", "either", "each", "everyone"],
      },
      {
        id: "gerund_infinitive",
        label: "Герунд & Инфинитив (Gerund & Infinitive)",
        keywords: ["gerund", "infinitive", "enjoy", "stop", "remember"],
      },
    ],
  },
  {
    category: "Vocabulary",
    categoryLabel: "Үгийн сан (Vocabulary)",
    color: "emerald",
    topics: [
      {
        id: "phrasal_verbs",
        label: "Хэлц үйл үгс (Phrasal Verbs)",
        keywords: ["phrasal", "put off", "look up", "carry out", "give up"],
      },
      {
        id: "idioms",
        label: "Хэлц үг & Зүйр цэцэн үг (Idioms & Expressions)",
        keywords: ["idiom", "expression", "piece of cake", "once in a blue moon"],
      },
      {
        id: "collocations",
        label: "Холбоо үгс (Collocations)",
        keywords: ["collocation", "reach an agreement", "make a decision", "heavy rain"],
      },
      {
        id: "word_formation",
        label: "Үг бүтээх ёс (Word Formation & Affixes)",
        keywords: ["formation", "suffix", "prefix", "un-", "dis-", "-tion", "-ment"],
      },
      {
        id: "confusing_words",
        label: "Андуурагддаг үгс (Confusing Words)",
        keywords: ["confusing", "affect", "effect", "lay", "lie", "accept", "except"],
      },
      {
        id: "synonyms_antonyms",
        label: "Ойролцоо & Эсрэг утга (Synonyms & Antonyms)",
        keywords: ["synonym", "antonym", "closest in meaning", "opposite"],
      },
    ],
  },
  {
    category: "Communication",
    categoryLabel: "Харилцан яриа (Communication)",
    color: "amber",
    topics: [
      {
        id: "social_expressions",
        label: "Мэндчилгээ, эелдэг харилцаа (Social Expressions)",
        keywords: ["social", "polite", "pardon", "pleasure", "welcome"],
      },
      {
        id: "dialogue_completion",
        label: "Харилцан яриа гүйцээх (Dialogue Completion)",
        keywords: ["dialogue", "conversation", "response", "reply"],
      },
      {
        id: "requests_offers",
        label: "Хүсэлт, тусламж санал болгох (Requests & Offers)",
        keywords: ["request", "offer", "would you mind", "shall i"],
      },
    ],
  },
  {
    category: "Reading",
    categoryLabel: "Эх уншиж ойлгох (Reading Comprehension)",
    color: "purple",
    topics: [
      {
        id: "main_idea",
        label: "Гол санаа & Зорилго (Main Idea & Tone)",
        keywords: ["main idea", "purpose", "author", "tone", "title"],
      },
      {
        id: "detail_facts",
        label: "Баримт мэдээлэл олох (Detail & Factual Questions)",
        keywords: ["detail", "true", "false", "according to", "mentioned"],
      },
      {
        id: "inference",
        label: "Далд утга & Дүгнэлт (Inference & Implication)",
        keywords: ["infer", "imply", "conclude", "suggests"],
      },
    ],
  },
];

// Available years 2006 to 2026
const ALL_YEARS = Array.from({ length: 21 }, (_, i) => 2026 - i);

export const CustomTestBuilder: React.FC<CustomTestBuilderProps> = ({
  exams,
  currentUser,
  classes = [],
  onStartExam,
  onAssignToClass,
  onPrintOMR,
}) => {
  // 1. Selected Years State
  const [selectedYears, setSelectedYears] = useState<number[]>([2026, 2025, 2024, 2023, 2022]);

  // 2. Selected Topics State (topic ids)
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([
    "tenses",
    "conditionals",
    "phrasal_verbs",
    "collocations",
  ]);

  // 3. Question Count & Difficulty
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");

  // Custom title
  const [customTitle, setCustomTitle] = useState("");

  // Teacher assignment state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignClassId, setAssignClassId] = useState(classes[0]?.id || "");
  const [assignDueDate, setAssignDueDate] = useState("2026-04-15");
  const [assignTimeLimit, setAssignTimeLimit] = useState(30);

  // Year quick select helpers
  const handleSelectAllYears = () => setSelectedYears(ALL_YEARS);
  const handleSelectLast5Years = () => setSelectedYears([2026, 2025, 2024, 2023, 2022]);
  const handleSelectLast10Years = () => setSelectedYears(ALL_YEARS.slice(0, 10));
  const handleClearYears = () => setSelectedYears([]);

  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter((y) => y !== year));
    } else {
      setSelectedYears([...selectedYears, year].sort((a, b) => b - a));
    }
  };

  // Topic toggle helpers
  const toggleTopic = (topicId: string) => {
    if (selectedTopicIds.includes(topicId)) {
      setSelectedTopicIds(selectedTopicIds.filter((t) => t !== topicId));
    } else {
      setSelectedTopicIds([...selectedTopicIds, topicId]);
    }
  };

  const handleSelectAllTopics = () => {
    const all = CURRICULUM_TOPICS.flatMap((c) => c.topics.map((t) => t.id));
    setSelectedTopicIds(all);
  };

  const handleSelectCategoryTopics = (cat: QuestionCategory) => {
    const group = CURRICULUM_TOPICS.find((c) => c.category === cat);
    if (!group) return;
    const catTopicIds = group.topics.map((t) => t.id);
    const allSelected = catTopicIds.every((id) => selectedTopicIds.includes(id));

    if (allSelected) {
      setSelectedTopicIds(selectedTopicIds.filter((id) => !catTopicIds.includes(id)));
    } else {
      setSelectedTopicIds(Array.from(new Set([...selectedTopicIds, ...catTopicIds])));
    }
  };

  // Extract all questions from selected years matching selected topics
  const matchingPool = useMemo(() => {
    const pool: Question[] = [];
    const chosenKeywords = CURRICULUM_TOPICS.flatMap((c) =>
      c.topics.filter((t) => selectedTopicIds.includes(t.id)).flatMap((t) => t.keywords)
    );

    const relevantExams = exams.filter((e) => selectedYears.includes(e.year));

    relevantExams.forEach((exam) => {
      exam.questions.forEach((q) => {
        // Difficulty filter
        if (difficulty !== "All" && q.difficulty !== difficulty) return;

        // Check if question matches selected topics
        if (selectedTopicIds.length === 0) {
          pool.push(q);
          return;
        }

        const textLower = (q.text + " " + (q.topic || "") + " " + (q.subtopic || "")).toLowerCase();
        const matches = chosenKeywords.some((kw) => textLower.includes(kw.toLowerCase()));

        if (matches) {
          pool.push(q);
        }
      });
    });

    return pool;
  }, [exams, selectedYears, selectedTopicIds, difficulty]);

  // Generate the custom exam object
  const buildExamObject = (): Exam => {
    // Shuffle or pick random sample from pool
    const shuffled = [...matchingPool].sort(() => 0.5 - Math.random());
    const finalQuestions = (shuffled.length > 0 ? shuffled : exams[0].questions)
      .slice(0, Math.min(questionCount, shuffled.length || 20))
      .map((q, idx) => ({
        ...q,
        id: `custom-q-${idx + 1}-${Date.now()}`,
        questionNumber: idx + 1,
      }));

    const yearsLabel =
      selectedYears.length === ALL_YEARS.length
        ? "2006–2026"
        : selectedYears.length <= 3
        ? selectedYears.join(", ")
        : `${selectedYears[selectedYears.length - 1]}–${selectedYears[0]}`;

    const title =
      customTitle.trim() ||
      `ЭЕШ Сэдэвчилсэн сорилт (${yearsLabel} он, ${finalQuestions.length} асуулт)`;

    return {
      id: `custom-exam-${Date.now()}`,
      title,
      year: selectedYears[0] || 2026,
      variant: "Mock",
      type: "practice",
      totalQuestions: finalQuestions.length,
      durationMinutes: Math.max(15, Math.round(finalQuestions.length * 1.6)),
      questions: finalQuestions,
      status: "published",
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString().slice(0, 10),
    };
  };

  // 1. Action: Student or Teacher Start Practice
  const handleStartPractice = () => {
    const exam = buildExamObject();
    onStartExam(exam, "practice");
  };

  // 2. Action: Teacher Assigns to Class
  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAssignToClass || !assignClassId) return;

    const exam = buildExamObject();
    onAssignToClass({
      title: exam.title,
      classId: assignClassId,
      exam,
      dueDate: assignDueDate,
      timeLimitMinutes: assignTimeLimit,
    });
    setShowAssignModal(false);
  };

  // 3. Action: Print OMR Sheet for this test
  const handlePrintOMRSheet = () => {
    if (!onPrintOMR) return;
    const exam = buildExamObject();
    onPrintOMR(exam);
  };

  const isTeacherOrAdmin = currentUser.role === "teacher" || currentUser.role === "admin";

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Smart Custom Test & Assignment Generator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ухаалаг Даалгавар & Сорилт Үүсгэгч
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              2006–2026 онуудын материалыг хүссэнээрээ хольж, дүрэм (Tenses, Conditionals, Passive...), үгийн сан (Phrasal Verbs, Collocations...), харилцан яриа зэрэг сэдвүүдээс сонгон хүссэн асуултын тоогоороо тест үүсгэн ажиллаарай.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15 text-center min-w-[200px]">
            <div className="text-[11px] text-slate-300 font-bold uppercase">Сонголтонд таарах сан</div>
            <div className="text-3xl font-black text-amber-300 mt-0.5">
              {matchingPool.length} <span className="text-xs text-white/70 font-normal">асуулт</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-1">
              Үүнээс <strong className="text-white font-bold">{questionCount}</strong> асуулт сонгогдоно
            </div>
          </div>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Year Selection & Granular Topics */}
        <div className="lg:col-span-2 space-y-8">
          {/* STEP 1: Year Selector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Онууд сонгох / холих (2006–2026)
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAllYears}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Бүгд (2006–2026)
                </button>
                <button
                  type="button"
                  onClick={handleSelectLast5Years}
                  className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors"
                >
                  Сүүлийн 5 жил
                </button>
                <button
                  type="button"
                  onClick={handleSelectLast10Years}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Сүүлийн 10 жил
                </button>
                <button
                  type="button"
                  onClick={handleClearYears}
                  className="px-2 py-1 rounded hover:bg-rose-50 text-rose-600 font-semibold transition-colors"
                >
                  Цэвэрлэх
                </button>
              </div>
            </div>

            {/* Year Chips Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {ALL_YEARS.map((yr) => {
                const isSelected = selectedYears.includes(yr);
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => toggleYear(yr)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all border ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-700">
              Сонгогдсон: <strong className="text-slate-800">{selectedYears.length} жил</strong> (
              {selectedYears.slice(0, 5).join(", ")}
              {selectedYears.length > 5 ? ` болон бусад ${selectedYears.length - 5} он...` : ""})
            </p>
          </div>

          {/* STEP 2: Topic Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Англи хэлний Дүрэм & Үгийн сан, Сэдвүүд сонгох
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAllTopics}
                  className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors"
                >
                  Бүх сэдвийг сонгох
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTopicIds([])}
                  className="px-2.5 py-1 rounded hover:bg-rose-50 text-rose-600 font-semibold transition-colors"
                >
                  Цэвэрлэх
                </button>
              </div>
            </div>

            {/* Category Groups */}
            <div className="space-y-6">
              {CURRICULUM_TOPICS.map((group) => {
                const groupSelectedCount = group.topics.filter((t) =>
                  selectedTopicIds.includes(t.id)
                ).length;
                const isAllGroupSelected = groupSelectedCount === group.topics.length;

                return (
                  <div key={group.category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            group.category === "Grammar"
                              ? "bg-blue-600"
                              : group.category === "Vocabulary"
                              ? "bg-emerald-600"
                              : group.category === "Communication"
                              ? "bg-amber-600"
                              : "bg-purple-600"
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900">
                          {group.categoryLabel}
                        </span>
                        <span className="text-[11px] text-slate-700 font-medium">
                          ({groupSelectedCount}/{group.topics.length})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCategoryTopics(group.category)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        {isAllGroupSelected ? "Сонголтыг цуцлах" : "Бүгдийг сонгох"}
                      </button>
                    </div>

                    {/* Topic Chips */}
                    <div className="flex flex-wrap gap-2">
                      {group.topics.map((t) => {
                        const isSelected = selectedTopicIds.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleTopic(t.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                              isSelected
                                ? group.category === "Grammar"
                                  ? "bg-blue-50 text-blue-800 border-blue-300 font-bold"
                                  : group.category === "Vocabulary"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                                  : group.category === "Communication"
                                  ? "bg-amber-50 text-amber-800 border-amber-300 font-bold"
                                  : "bg-purple-50 text-purple-800 border-purple-300 font-bold"
                                : "bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Test Parameters & Launch Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900">Сорилтын тохиргоо</h3>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Сорилтын нэр (Нэмэлт):</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Жишээ: 12-р анги: Conditionals & Tenses сорилт"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Асуултын тоо:</span>
                <span className="font-black text-blue-600 text-sm">{questionCount} асуулт</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20, 25, 30, 40, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      questionCount === num
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Хэцүү байдлын түвшин:</label>
              <div className="grid grid-cols-4 gap-1">
                {(["All", "Easy", "Medium", "Hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition-colors ${
                      difficulty === diff
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {diff === "All" ? "Бүгд" : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated time */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Зөвлөмжит хугацаа:</span>
              </div>
              <span className="font-bold text-slate-900">
                {Math.max(15, Math.round(questionCount * 1.6))} минут
              </span>
            </div>

            {/* Launch Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleStartPractice}
                disabled={matchingPool.length === 0}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Сорилтыг эхлэх ({questionCount} асуулт)</span>
              </button>

              {isTeacherOrAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(true)}
                    disabled={matchingPool.length === 0 || classes.length === 0}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Ангид даалгавар болгон оноох</span>
                  </button>

                  {onPrintOMR && (
                    <button
                      type="button"
                      onClick={handlePrintOMRSheet}
                      disabled={matchingPool.length === 0}
                      className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Хариултын хуудас (OMR) хэвлэх</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Ангид даалгавар болгож оноох</h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Оноох анги:</label>
                <select
                  value={assignClassId}
                  onChange={(e) => setAssignClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (Код: {cls.code} • {cls.studentIds.length} сурагч)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Хугацаа дуусах огноо:</label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Шалгалтын үргэлжлэх хугацаа (минут):</label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={assignTimeLimit}
                  onChange={(e) => setAssignTimeLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                <p className="font-bold">Мэдээлэл:</p>
                <p>
                  Энэ даалгавар тухайн ангийн бүх сурагчдын хянах самбарт нэн тэргүүнд харагдаж, сурагчид өгч дууссаны дараа дүн таны хянах самбарт шууд нэгтгэгдэнэ.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Цуцлах
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  Даалгавар илгээх
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
