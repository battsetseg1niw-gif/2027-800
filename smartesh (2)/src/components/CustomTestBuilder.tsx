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
  Zap,
} from "lucide-react";
import { Exam, Question, QuestionCategory, ClassRoom, UserProfile } from "../types";
import { Language } from "../lib/i18n";

interface CustomTestBuilderProps {
  exams: Exam[];
  currentUser: UserProfile;
  classes?: ClassRoom[];
  language?: Language;
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
  categoryLabelMn: string;
  categoryLabelEn: string;
  color: string;
  topics: { id: string; labelMn: string; labelEn: string; keywords: string[] }[];
}[] = [
  {
    category: "Grammar",
    categoryLabelMn: "Дүрэм (Grammar)",
    categoryLabelEn: "Grammar",
    color: "blue",
    topics: [
      {
        id: "tenses",
        labelMn: "Цагууд (Tenses & Aspect)",
        labelEn: "Tenses & Aspect",
        keywords: ["tense", "past", "present", "future", "perfect", "continuous"],
      },
      {
        id: "conditionals",
        labelMn: "Нөхцөлт өгүүлбэр (Conditionals & Wish)",
        labelEn: "Conditionals & Wish",
        keywords: ["conditional", "if", "wish", "had had", "would have"],
      },
      {
        id: "passive",
        labelMn: "Идэвхгүй хэв (Passive Voice)",
        labelEn: "Passive Voice",
        keywords: ["passive", "by", "was done", "been shown", "is known"],
      },
      {
        id: "reported_speech",
        labelMn: "Хөндлөнгийн яриа (Reported Speech)",
        labelEn: "Reported Speech",
        keywords: ["reported", "told", "said", "asked if", "whether"],
      },
      {
        id: "modals",
        labelMn: "Баймж үйл үг (Modal Verbs)",
        labelEn: "Modal Verbs",
        keywords: ["modal", "can", "could", "must", "should", "ought", "might"],
      },
      {
        id: "relative_clauses",
        labelMn: "Тодотгол гишүүн (Relative Clauses)",
        labelEn: "Relative Clauses",
        keywords: ["relative", "who", "which", "that", "whose", "where"],
      },
      {
        id: "prepositions",
        labelMn: "Угтвар үг, холбоос (Prepositions & Conjunctions)",
        labelEn: "Prepositions & Conjunctions",
        keywords: ["preposition", "conjunction", "in", "on", "at", "although", "despite"],
      },
      {
        id: "articles_quantifiers",
        labelMn: "Ялгац гишүүн, тоо хэмжээ (Articles & Quantifiers)",
        labelEn: "Articles & Quantifiers",
        keywords: ["article", "quantifier", "a", "the", "much", "many", "few", "little"],
      },
      {
        id: "subject_verb",
        labelMn: "Эзэн бие ба үйл үгийн зохицол (Subject-Verb Agreement)",
        labelEn: "Subject-Verb Agreement",
        keywords: ["agreement", "neither", "either", "each", "everyone"],
      },
      {
        id: "gerund_infinitive",
        labelMn: "Герунд & Инфинитив (Gerund & Infinitive)",
        labelEn: "Gerund & Infinitive",
        keywords: ["gerund", "infinitive", "enjoy", "stop", "remember"],
      },
    ],
  },
  {
    category: "Vocabulary",
    categoryLabelMn: "Үгийн сан (Vocabulary)",
    categoryLabelEn: "Vocabulary",
    color: "emerald",
    topics: [
      {
        id: "phrasal_verbs",
        labelMn: "Хэлц үйл үгс (Phrasal Verbs)",
        labelEn: "Phrasal Verbs",
        keywords: ["phrasal", "put off", "look up", "carry out", "give up"],
      },
      {
        id: "idioms",
        labelMn: "Хэлц үг & Зүйр цэцэн үг (Idioms & Expressions)",
        labelEn: "Idioms & Expressions",
        keywords: ["idiom", "expression", "piece of cake", "once in a blue moon"],
      },
      {
        id: "collocations",
        labelMn: "Холбоо үгс (Collocations)",
        labelEn: "Collocations",
        keywords: ["collocation", "reach an agreement", "make a decision", "heavy rain"],
      },
      {
        id: "word_formation",
        labelMn: "Үг бүтээх ёс (Word Formation & Affixes)",
        labelEn: "Word Formation & Affixes",
        keywords: ["formation", "suffix", "prefix", "un-", "dis-", "-tion", "-ment"],
      },
      {
        id: "confusing_words",
        labelMn: "Андуурагддаг үгс (Confusing Words)",
        labelEn: "Confusing Words",
        keywords: ["confusing", "affect", "effect", "lay", "lie", "accept", "except"],
      },
      {
        id: "synonyms_antonyms",
        labelMn: "Ойролцоо & Эсрэг утга (Synonyms & Antonyms)",
        labelEn: "Synonyms & Antonyms",
        keywords: ["synonym", "antonym", "closest in meaning", "opposite"],
      },
    ],
  },
  {
    category: "Communication",
    categoryLabelMn: "Харилцан яриа (Communication)",
    categoryLabelEn: "Communication",
    color: "amber",
    topics: [
      {
        id: "social_expressions",
        labelMn: "Мэндчилгээ, эелдэг харилцаа (Social Expressions)",
        labelEn: "Social Expressions",
        keywords: ["social", "polite", "pardon", "pleasure", "welcome"],
      },
      {
        id: "dialogue_completion",
        labelMn: "Харилцан яриа гүйцээх (Dialogue Completion)",
        labelEn: "Dialogue Completion",
        keywords: ["dialogue", "conversation", "response", "reply"],
      },
      {
        id: "requests_offers",
        labelMn: "Хүсэлт, тусламж санал болгох (Requests & Offers)",
        labelEn: "Requests & Offers",
        keywords: ["request", "offer", "would you mind", "shall i"],
      },
    ],
  },
  {
    category: "Reading",
    categoryLabelMn: "Эх уншиж ойлгох (Reading Comprehension)",
    categoryLabelEn: "Reading Comprehension",
    color: "purple",
    topics: [
      {
        id: "main_idea",
        labelMn: "Гол санаа & Зорилго (Main Idea & Tone)",
        labelEn: "Main Idea & Tone",
        keywords: ["main idea", "purpose", "author", "tone", "title"],
      },
      {
        id: "detail_facts",
        labelMn: "Баримт мэдээлэл олох (Detail & Factual Questions)",
        labelEn: "Detail & Factual Questions",
        keywords: ["detail", "true", "false", "according to", "mentioned"],
      },
      {
        id: "inference",
        labelMn: "Далд утга & Дүгнэлт (Inference & Implication)",
        labelEn: "Inference & Implication",
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
  language = "mn",
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

  const handleSelectAllTopics = () => {
    const allIds = CURRICULUM_TOPICS.flatMap((c) => c.topics.map((t) => t.id));
    setSelectedTopicIds(allIds);
  };

  // Quick Presets
  const applyPreset = (presetKey: "all-21" | "recent-5" | "hard" | "phrasal-dialogue") => {
    if (presetKey === "all-21") {
      setSelectedYears(ALL_YEARS);
      setSelectedTopicIds([]);
      setDifficulty("All");
      setQuestionCount(40);
      setCustomTitle(
        language === "en"
          ? "2006–2026 Full 21-Year Mixed Benchmark"
          : "2006–2026 Бүх 21 жилийн холимог жишиг тест"
      );
    } else if (presetKey === "recent-5") {
      setSelectedYears([2026, 2025, 2024, 2023, 2022]);
      setSelectedTopicIds(["tenses", "conditionals", "phrasal_verbs", "collocations", "word_formation"]);
      setDifficulty("All");
      setQuestionCount(25);
      setCustomTitle(
        language === "en"
          ? "2022–2026 Grammar & Vocab Drill"
          : "2022–2026 Сүүлийн 5 оны Дүрэм & Үгийн сангийн сорилт"
      );
    } else if (presetKey === "hard") {
      setSelectedYears(ALL_YEARS);
      setSelectedTopicIds(["conditionals", "passive", "phrasal_verbs", "inference", "synonyms_antonyms"]);
      setDifficulty("Hard");
      setQuestionCount(20);
      setCustomTitle(
        language === "en"
          ? "High Difficulty Mixed Challenge"
          : "Хүнд түвшний холимог сорилт (Hard Challenge)"
      );
    } else if (presetKey === "phrasal-dialogue") {
      setSelectedYears(ALL_YEARS);
      setSelectedTopicIds(["phrasal_verbs", "idioms", "social_expressions", "dialogue_completion"]);
      setDifficulty("All");
      setQuestionCount(15);
      setCustomTitle(
        language === "en"
          ? "Phrasal Verbs & Communication Drill"
          : "Хэлц үйл үг & Харилцан ярианы холимог сорилт"
      );
    }
  };

  // Extract all questions from selected years matching selected topics
  const matchingPool = useMemo(() => {
    const pool: Question[] = [];
    const chosenKeywords = CURRICULUM_TOPICS.flatMap((c) =>
      c.topics.filter((t) => selectedTopicIds.includes(t.id)).flatMap((t) => t.keywords)
    );

    const relevantExams = (exams || []).filter((e) => selectedYears.includes(e.year));

    relevantExams.forEach((exam) => {
      (exam.questions || []).forEach((q) => {
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
  const buildExamObject = (examType: "practice" | "mock" = "practice"): Exam => {
    // Shuffle or pick random sample from pool
    const shuffled = [...matchingPool].sort(() => 0.5 - Math.random());
    const finalQuestions = (shuffled.length > 0 ? shuffled : exams[0]?.questions || [])
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

    const defaultTitleMn =
      examType === "mock"
        ? `ЭЕШ Холимог шалгалт (${yearsLabel} он, ${finalQuestions.length} асуулт)`
        : `ЭЕШ Сэдэвчилсэн дасгал (${yearsLabel} он, ${finalQuestions.length} асуулт)`;

    const defaultTitleEn =
      examType === "mock"
        ? `Mixed Mock Exam (${yearsLabel}, ${finalQuestions.length} Qs)`
        : `Custom Practice Drill (${yearsLabel}, ${finalQuestions.length} Qs)`;

    const title =
      customTitle.trim() ||
      (language === "en" ? defaultTitleEn : defaultTitleMn);

    return {
      id: `custom-exam-${Date.now()}`,
      title,
      year: selectedYears[0] || 2026,
      variant: "Mock",
      type: examType,
      totalQuestions: finalQuestions.length,
      durationMinutes: Math.max(15, Math.round(finalQuestions.length * 1.6)),
      questions: finalQuestions,
      status: "published",
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString().slice(0, 10),
    };
  };

  // 1. Action: Student or Teacher Start Practice Mode
  const handleStartPractice = () => {
    const exam = buildExamObject("practice");
    onStartExam(exam, "practice");
  };

  // 2. Action: Student or Teacher Start Mock Mode
  const handleStartMock = () => {
    const exam = buildExamObject("mock");
    onStartExam(exam, "mock");
  };

  // 3. Action: Teacher Assigns to Class
  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAssignToClass || !assignClassId) return;

    const exam = buildExamObject("mock");
    onAssignToClass({
      title: exam.title,
      classId: assignClassId,
      exam,
      dueDate: assignDueDate,
      timeLimitMinutes: assignTimeLimit,
    });
    setShowAssignModal(false);
  };

  // 4. Action: Print OMR Sheet for this test
  const handlePrintOMRSheet = () => {
    if (!onPrintOMR) return;
    const exam = buildExamObject("mock");
    onPrintOMR(exam);
  };

  const isTeacherOrAdmin = currentUser.role === "teacher" || currentUser.role === "admin";

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>
                {language === "en"
                  ? "Smart Custom Mixed Test Generator"
                  : "Ухаалаг Даалгавар & Холимог Тест Үүсгэгч"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === "en"
                ? "Custom Mixed Test Builder"
                : "Өмнөх онуудаар тест холих & тохируулах"}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {language === "en"
                ? "Mix and match real exam questions from 2006–2026. Choose grammar rules, vocabulary topics, reading skills, question counts, and difficulty to run a personalized test."
                : "2006–2026 онуудын өмнөх шалгалтын материалуудыг хүссэнээрээ хольж, дүрэм (Tenses, Conditionals, Passive...), үгийн сан (Phrasal Verbs, Collocations...), харилцан яриа зэрэг сэдвүүдээс сонгон хувийн тестээ үүсгэн ажиллаарай."}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15 text-center min-w-[200px]">
            <div className="text-[11px] text-slate-300 font-bold uppercase">
              {language === "en" ? "Matching Questions" : "Сонголтонд таарах сан"}
            </div>
            <div className="text-3xl font-black text-amber-300 mt-0.5">
              {matchingPool.length}{" "}
              <span className="text-xs text-white/70 font-normal">
                {language === "en" ? "questions" : "асуулт"}
              </span>
            </div>
            <div className="text-[10px] text-slate-300 mt-1">
              {language === "en" ? (
                <>
                  Will draw <strong className="text-white font-bold">{Math.min(questionCount, matchingPool.length)}</strong> questions
                </>
              ) : (
                <>
                  Үүнээс <strong className="text-white font-bold">{Math.min(questionCount, matchingPool.length)}</strong> асуулт сонгогдоно
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-200">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === "en" ? "Quick Presets (1-Click)" : "⚡ Түргэн сонголтууд (Нэг товшилтоор)"}:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset("all-21")}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all"
            >
              🎯 {language === "en" ? "Full 21-Year Mixed (40 Qs)" : "Бүх 21 жилийн холимог жишиг (40 асуулт)"}
            </button>
            <button
              type="button"
              onClick={() => applyPreset("recent-5")}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all"
            >
              📚 {language === "en" ? "Recent 5 Years Grammar & Vocab (25 Qs)" : "2022–2026 Дүрэм & Үгийн сан (25 асуулт)"}
            </button>
            <button
              type="button"
              onClick={() => applyPreset("hard")}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-semibold text-amber-200 transition-all"
            >
              🔥 {language === "en" ? "High Difficulty Challenge (20 Qs)" : "Хүнд түвшний холимог сорилт (20 асуулт)"}
            </button>
            <button
              type="button"
              onClick={() => applyPreset("phrasal-dialogue")}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all"
            >
              💬 {language === "en" ? "Phrasal Verbs & Dialogue (15 Qs)" : "Хэлц үйл үг & Харилцан яриа (15 асуулт)"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Year Selection & Granular Topics */}
        <div className="lg:col-span-2 space-y-8">
          {/* STEP 1: Year Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-extrabold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === "en"
                    ? "Select & Mix Exam Years (2006–2026)"
                    : "Онууд сонгох / холих (2006–2026)"}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAllYears}
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                >
                  {language === "en" ? "All (2006–2026)" : "Бүгд (2006–2026)"}
                </button>
                <button
                  type="button"
                  onClick={handleSelectLast5Years}
                  className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold transition-colors"
                >
                  {language === "en" ? "Last 5 Years" : "Сүүлийн 5 жил"}
                </button>
                <button
                  type="button"
                  onClick={handleSelectLast10Years}
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                >
                  {language === "en" ? "Last 10 Years" : "Сүүлийн 10 жил"}
                </button>
                <button
                  type="button"
                  onClick={handleClearYears}
                  className="px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-semibold transition-colors"
                >
                  {language === "en" ? "Clear" : "Цэвэрлэх"}
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
                        : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {language === "en" ? "Selected: " : "Сонгогдсон: "}
              <strong className="text-slate-800 dark:text-slate-200">
                {selectedYears.length} {language === "en" ? "years" : "жил"}
              </strong>{" "}
              ({selectedYears.slice(0, 5).join(", ")}
              {selectedYears.length > 5
                ? language === "en"
                  ? ` and ${selectedYears.length - 5} more...`
                  : ` болон бусад ${selectedYears.length - 5} он...`
                : ""})
            </p>
          </div>

          {/* STEP 2: Topic Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === "en"
                    ? "Select English Grammar, Vocabulary & Skills"
                    : "Англи хэлний Дүрэм, Үгийн сан, Сэдвүүд сонгох"}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAllTopics}
                  className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold transition-colors"
                >
                  {language === "en" ? "Select All Topics" : "Бүх сэдвийг сонгох"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTopicIds([])}
                  className="px-2.5 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-semibold transition-colors"
                >
                  {language === "en" ? "Clear" : "Цэвэрлэх"}
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
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {language === "en" ? group.categoryLabelEn : group.categoryLabelMn}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          ({groupSelectedCount}/{group.topics.length})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCategoryTopics(group.category)}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {isAllGroupSelected
                          ? language === "en"
                            ? "Deselect"
                            : "Сонголтыг цуцлах"
                          : language === "en"
                          ? "Select All"
                          : "Бүгдийг сонгох"}
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
                                  ? "bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold"
                                  : group.category === "Vocabulary"
                                  ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold"
                                  : group.category === "Communication"
                                  ? "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold"
                                  : "bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700 font-bold"
                                : "bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            <span>{language === "en" ? t.labelEn : t.labelMn}</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 sticky top-24 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === "en" ? "Test Configuration" : "Сорилтын тохиргоо"}
              </h3>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === "en" ? "Custom Title (Optional):" : "Сорилтын нэр (Нэмэлт):"}
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={
                  language === "en"
                    ? "e.g., Grade 12: Conditionals & Tenses Drill"
                    : "Жишээ: 12-р анги: Conditionals & Tenses сорилт"
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {language === "en" ? "Question Count:" : "Асуултын тоо:"}
                </span>
                <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                  {questionCount} {language === "en" ? "questions" : "асуулт"}
                </span>
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
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === "en" ? "Difficulty Level:" : "Хэцүү байдлын түвшин:"}
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(["All", "Easy", "Medium", "Hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition-colors ${
                      difficulty === diff
                        ? "bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-600 text-white"
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {diff === "All" ? (language === "en" ? "All" : "Бүгд") : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated time */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{language === "en" ? "Estimated Time:" : "Зөвлөмжит хугацаа:"}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.max(15, Math.round(questionCount * 1.6))} {language === "en" ? "mins" : "минут"}
              </span>
            </div>

            {/* Launch Buttons for Student */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                id="btn-custom-start-practice"
                onClick={handleStartPractice}
                disabled={matchingPool.length === 0}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {language === "en"
                    ? `Practice Mode (Instant Feedback, ${Math.min(questionCount, matchingPool.length)} Qs)`
                    : `Дасгал горимд эхлэх (Тайлбартай, ${Math.min(questionCount, matchingPool.length)} асуулт)`}
                </span>
              </button>

              <button
                type="button"
                id="btn-custom-start-mock"
                onClick={handleStartMock}
                disabled={matchingPool.length === 0}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-indigo-200" />
                <span>
                  {language === "en"
                    ? `Mock Exam Mode (Timed & 800 Scale Graded)`
                    : `Шалгалт горимд эхлэх (Цагтай, оноо бодогдоно)`}
                </span>
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
                    <span>{language === "en" ? "Assign to Class" : "Ангид даалгавар болгон оноох"}</span>
                  </button>

                  {onPrintOMR && (
                    <button
                      type="button"
                      onClick={handlePrintOMRSheet}
                      disabled={matchingPool.length === 0}
                      className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{language === "en" ? "Print OMR Sheet" : "Хариултын хуудас (OMR) хэвлэх"}</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === "en" ? "Assign to Class" : "Ангид даалгавар болгож оноох"}
                </h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === "en" ? "Target Class:" : "Оноох анги:"}
                </label>
                <select
                  value={assignClassId}
                  onChange={(e) => setAssignClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (Код: {cls.code} • {cls.studentIds.length} сурагч)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === "en" ? "Due Date:" : "Хугацаа дуусах огноо:"}
                </label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === "en" ? "Time Limit (minutes):" : "Хугацаа (минутаар):"}
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={assignTimeLimit}
                  onChange={(e) => setAssignTimeLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
                {language === "en"
                  ? `Students will receive this custom test with ${Math.min(questionCount, matchingPool.length)} selected questions.`
                  : `Сурагчдын систем дээр энэхүү ${Math.min(questionCount, matchingPool.length)} асуулттай хувийн сорилт даалгавар хэлбэрээр автоматаар очно.`}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {language === "en" ? "Cancel" : "Болих"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  {language === "en" ? "Confirm & Send" : "Оноох"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
