import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Sparkles,
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  Send,
  Save,
  Clock,
  HelpCircle,
  Volume2,
  AlertCircle,
  Check,
  Search,
  ArrowRight,
  RefreshCw,
  Bell,
  Play,
  Filter,
  FileUp,
} from "lucide-react";
import { Exam, Question, Lesson, DailyVocabularySet, DailyVocabularyItem } from "../types";
import { db } from "../lib/supabase";
import { PdfExamIngestionStudio } from "./PdfExamIngestionStudio";
import { ManualExamEditor } from "./ManualExamEditor";

interface AdminContentManagerProps {
  exams: Exam[];
  onPublishExam: (newExam: Exam) => void;
  onDeleteExam?: (examId: string) => void;
  onStartExam?: (exam: Exam, mode?: "mock" | "practice") => void;
  onSendNotification?: (title: string, message: string, targetRole: "all" | "student" | "teacher") => void;
}

export const AdminContentManager: React.FC<AdminContentManagerProps> = ({
  exams,
  onPublishExam,
  onDeleteExam,
  onStartExam,
  onSendNotification,
}) => {
  const [subTab, setSubTab] = useState<
    "past-papers" | "weekly-mock" | "practice-tests" | "lessons" | "daily-vocab" | "pdf-uploader"
  >("past-papers");

  // TOAST NOTIFICATIONS
  const [toastMsg, setToastMsg] = useState<{ text: string; success: boolean } | null>(null);
  const showToast = (text: string, success = true) => {
    setToastMsg({ text, success });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // ==========================================
  // 1. PAST PAPERS (2006–2026) STATE
  // ==========================================
  const [pastYear, setPastYear] = useState(2025);
  const [pastVariant, setPastVariant] = useState<"A" | "B" | "C" | "D">("A");
  const [pastDuration, setPastDuration] = useState(80);
  const [pastPassage, setPastPassage] = useState(
    "The Mongolian saiga antelope (Saiga tatarica mongolica) is a critically endangered subspecies endemic to western Mongolia. Conservation efforts in recent years have demonstrated promising outcomes in habitat restoration and anti-poaching patrol monitoring. However, extreme winters (dzud) and forage shortages continue to pose substantial threats to the remaining herds."
  );
  const [pastPaperQuestions, setPastPaperQuestions] = useState<Question[]>(() =>
    generateStandard50Questions(2025, "A")
  );

  function generateStandard50Questions(year: number, variant: string): Question[] {
    return Array.from({ length: 50 }).map((_, idx) => {
      const qNum = idx + 1;
      const isGrammar = qNum <= 15;
      const isVocab = qNum > 15 && qNum <= 28;
      const isComm = qNum > 28 && qNum <= 37;
      const isReading = qNum > 37;

      const cat: "Grammar" | "Vocabulary" | "Communication" | "Reading" = isGrammar
        ? "Grammar"
        : isVocab
        ? "Vocabulary"
        : isComm
        ? "Communication"
        : "Reading";

      return {
        id: `past-esh-${year}-${variant}-q${qNum}`,
        questionNumber: qNum,
        text: isGrammar
          ? `[Grammar Q${qNum}] Select the correct grammatical structure to complete the sentence.`
          : isVocab
          ? `[Vocabulary Q${qNum}] Identify the word or phrase that best fits the contextual meaning.`
          : isComm
          ? `[Communication Q${qNum}] Choose the most appropriate conversational response.`
          : `[Reading Q${qNum}] Based on paragraph ${Math.min(3, Math.ceil((qNum - 37) / 4))}, what is directly stated?`,
        category: cat,
        topic: `${year} ЭЕШ Хувилбар ${variant} - ${cat}`,
        subtopic: `Question ${qNum}`,
        difficulty: (qNum % 3 === 0 ? "Hard" : qNum % 2 === 0 ? "Medium" : "Easy") as any,
        options: [
          { id: "A", text: `Option A (${cat})` },
          { id: "B", text: `Option B (${cat})` },
          { id: "C", text: `Option C (${cat})` },
          { id: "D", text: `Option D (${cat})` },
          { id: "E", text: `Option E (${cat})` },
        ],
        correctAnswer: (["A", "B", "C", "D", "E"][idx % 5] as any),
        explanation: `${year} оны ЭЕШ-ийн албан ёсны түлхүүр: Асуулт №${qNum} нь ${cat} чиглэлийн стандарт даалгавар юм.`,
      };
    });
  }

  const handleReloadPastTemplate = () => {
    setPastPaperQuestions(generateStandard50Questions(pastYear, pastVariant));
    showToast(`${pastYear} оны Хувилбар ${pastVariant}-н 50 тестийн загвар ачаалагдлаа.`);
  };

  const handlePublishPastPaper = () => {
    const title = `${pastYear} оны ЭЕШ Англи хэл (Хувилбар ${pastVariant})`;
    const pastExam: Exam = {
      id: `past-esh-${pastYear}-${pastVariant.toLowerCase()}`,
      title,
      year: pastYear,
      type: "past_paper",
      variant: pastVariant,
      durationMinutes: pastDuration,
      totalQuestions: pastPaperQuestions.length,
      readingPassage: pastPassage.trim() || undefined,
      questions: pastPaperQuestions,
      status: "published",
      createdBy: "admin",
      createdAt: new Date().toISOString(),
    };

    onPublishExam(pastExam);
    showToast(`"${title}" 2006–2026 ЭЕШ-ийн санд амжилттай нийтлэгдлээ!`);
  };

  // ==========================================
  // 2. WEEKLY MOCK TEST STATE & NOTIFICATION
  // ==========================================
  const existingMocks = exams.filter((e) => e.type === "mock");
  const [mockTitle, setMockTitle] = useState(
    `2026 7 хоногийн Mock Тест #${existingMocks.length + 1}`
  );
  const [mockDuration, setMockDuration] = useState(80);
  const [mockPassage, setMockPassage] = useState(
    "Artificial intelligence models have transformed modern language pedagogy. By assessing nuanced grammar patterns, lexical diversity, and reading comprehension levels in real-time, digital tutors provide immediate, hyper-personalized diagnostics to candidates preparing for high-stakes national matriculation exams."
  );
  const [mockQuestions, setMockQuestions] = useState<Question[]>(() =>
    generateStandard50Questions(2026, "Mock")
  );
  const [isGeneratingMockAi, setIsGeneratingMockAi] = useState(false);

  const handleAddMockQuestion = () => {
    const num = mockQuestions.length + 1;
    const newQ: Question = {
      id: `mock-q-${Date.now()}-${num}`,
      questionNumber: num,
      text: `Mock Question ${num}: Choose the best alternative.`,
      category: "Grammar",
      topic: "Mock Focus",
      subtopic: "General Rule",
      difficulty: "Medium",
      options: [
        { id: "A", text: "Choice A" },
        { id: "B", text: "Choice B" },
        { id: "C", text: "Choice C" },
        { id: "D", text: "Choice D" },
        { id: "E", text: "Choice E" },
      ],
      correctAnswer: "B",
      explanation: "ЭЕШ стандарт зөв хариултын дүрмийн тайлбар",
    };
    setMockQuestions([...mockQuestions, newQ]);
  };

  const handlePublishWeeklyMock = () => {
    if (!mockTitle.trim()) {
      showToast("7 хоногийн Mock тестийн нэрийг оруулна уу!", false);
      return;
    }

    const newMockExam: Exam = {
      id: `weekly-mock-${Date.now()}`,
      title: mockTitle.trim(),
      year: 2026,
      type: "mock",
      variant: "Mock",
      durationMinutes: mockDuration,
      totalQuestions: mockQuestions.length,
      readingPassage: mockPassage.trim() || undefined,
      questions: mockQuestions,
      status: "published",
      createdBy: "admin",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    // 1. Publish exam
    onPublishExam(newMockExam);

    // 2. Broadcast notification to teachers and students
    const notifTitle = `🚨 Шинэ 7 хоногийн Mock тест нийтлэгдлээ: ${mockTitle}`;
    const notifMsg = `ЭЕШ 2026-д зориулсан 7 хоногийн шинэ Mock тест нээгдлээ. 80 минутын сорилоо өгч улсын эрэмбэ болон алдааны шинжилгээгээ аваарай!`;

    if (onSendNotification) {
      onSendNotification(notifTitle, notifMsg, "all");
    }
    db.broadcastNotification(notifTitle, notifMsg, "all");

    showToast(
      `"${newMockExam.title}" амжилттай нийтлэгдэж, бүх сурагч болон багш нарт мэдэгдэл илгээгдлээ!`
    );

    // Reset with incremented title
    setMockTitle(`2026 7 хоногийн Mock Тест #${existingMocks.length + 2}`);
  };

  // ==========================================
  // 3. PRACTICE TESTS (Нэмэлт дасгал даалгавар) STATE
  // ==========================================
  const existingPractice = exams.filter((e) => e.type === "practice" || e.type === "diagnostic");
  const [practiceTitle, setPracticeTitle] = useState("Үйлт Үг & Цагуудын Нэмэлт Дасгал (Verb Tenses Practice)");
  const [practiceCategory, setPracticeCategory] = useState<
    "Grammar" | "Vocabulary" | "Communication" | "Reading"
  >("Grammar");
  const [practiceDuration, setPracticeDuration] = useState(30);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([
    {
      id: "pq-1",
      questionNumber: 1,
      text: "By the time the teacher arrived, the students _______ the assignment.",
      category: "Grammar",
      topic: "Past Perfect vs Past Simple",
      subtopic: "Sequence of Tenses",
      difficulty: "Medium",
      options: [
        { id: "A", text: "have finished" },
        { id: "B", text: "had finished" },
        { id: "C", text: "finish" },
        { id: "D", text: "were finishing" },
      ],
      correctAnswer: "B",
      explanation: "Өнгөрсөнд болсон хоёр үйлдлийн түрүүлж болсон дээр Past Perfect (had + V3) ашиглана.",
    },
    {
      id: "pq-2",
      questionNumber: 2,
      text: "If she _______ more diligently, she would have passed the examination.",
      category: "Grammar",
      topic: "Third Conditional",
      subtopic: "Past Unreal Condition",
      difficulty: "Hard",
      options: [
        { id: "A", text: "studied" },
        { id: "B", text: "studies" },
        { id: "C", text: "had studied" },
        { id: "D", text: "would study" },
      ],
      correctAnswer: "C",
      explanation: "Гуравдугаар төрлийн нөхцөлт өгүүлбэрийн If-clause нь Past Perfect (had studied) бүтэцтэй байна.",
    },
  ]);

  const handleAddPracticeQuestion = () => {
    const num = practiceQuestions.length + 1;
    setPracticeQuestions([
      ...practiceQuestions,
      {
        id: `pq-${Date.now()}-${num}`,
        questionNumber: num,
        text: `Practice Question ${num}: Fill in the blank with the appropriate choice.`,
        category: practiceCategory,
        topic: `${practiceCategory} Focus`,
        subtopic: "Practice Drill",
        difficulty: "Medium",
        options: [
          { id: "A", text: "Option A" },
          { id: "B", text: "Option B" },
          { id: "C", text: "Option C" },
          { id: "D", text: "Option D" },
        ],
        correctAnswer: "A",
        explanation: "Зөв хариултын тайлбар",
      },
    ]);
  };

  const handlePublishPracticeTest = () => {
    if (!practiceTitle.trim()) {
      showToast("Дасгал тестийн гарчгийг оруулна уу!", false);
      return;
    }

    const newPracticeExam: Exam = {
      id: `practice-drill-${Date.now()}`,
      title: practiceTitle.trim(),
      year: 2026,
      type: "practice",
      variant: "A",
      durationMinutes: practiceDuration,
      totalQuestions: practiceQuestions.length,
      questions: practiceQuestions,
      status: "published",
      createdBy: "admin",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onPublishExam(newPracticeExam);
    showToast(`"${newPracticeExam.title}" нэмэлт дасгал даалгаврын санд нэмэгдлээ!`);
    setPracticeTitle("");
  };

  // ==========================================
  // 4. LESSONS STATE (Learning Center)
  // ==========================================
  const [lessonsList, setLessonsList] = useState<Lesson[]>(() => db.getLessons());
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [lessonAiTopic, setLessonAiTopic] = useState("");
  const [isGeneratingLessonAi, setIsGeneratingLessonAi] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonCategory, setLessonCategory] = useState<
    "Grammar" | "Vocabulary" | "Phrasal Verbs" | "Reading" | "Idioms"
  >("Grammar");
  const [lessonDifficulty, setLessonDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">(
    "Intermediate"
  );
  const [lessonMinutes, setLessonMinutes] = useState(25);
  const [lessonContent, setLessonContent] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonTakeaways, setLessonTakeaways] = useState<string[]>([""]);

  const handleAiGenerateLesson = async () => {
    if (!lessonAiTopic.trim()) {
      showToast("Хичээлийн сэдвийг оруулна уу", false);
      return;
    }
    setIsGeneratingLessonAi(true);
    try {
      const res = await fetch("/api/ai/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: lessonAiTopic,
          category: lessonCategory,
          difficulty: lessonDifficulty,
        }),
      });
      const data = await res.json();
      if (data.success && data.lesson) {
        setLessonTitle(data.lesson.title || lessonAiTopic);
        setLessonContent(data.lesson.content || "");
        if (data.lesson.keyTakeaways) {
          setLessonTakeaways(data.lesson.keyTakeaways);
        }
        showToast("Хиймэл оюунаар хичээлийн онол амжилттай үүслээ!");
      } else {
        showToast("Хичээл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.", false);
      }
    } catch (err) {
      console.warn("AI lesson error:", err);
      showToast("Сүлжээний алдаа", false);
    } finally {
      setIsGeneratingLessonAi(false);
    }
  };

  const handleSaveLesson = () => {
    if (!lessonTitle.trim() || !lessonContent.trim()) {
      showToast("Хичээлийн гарчиг болон онолыг бөглөнө үү", false);
      return;
    }

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      track: lessonCategory,
      order: lessonsList.length + 1,
      title: lessonTitle.trim(),
      description: lessonTitle.trim(),
      isFree: true,
      durationMinutes: lessonMinutes,
      summaryRule: lessonTitle.trim(),
      detailedContent: lessonContent,
      content: lessonContent,
      category: lessonCategory,
      difficulty: lessonDifficulty,
      videoUrl: lessonVideoUrl.trim() || undefined,
      keyTakeaways: lessonTakeaways.filter((t) => t.trim().length > 0),
      quizQuestions: [
        {
          question: `Sample question on ${lessonTitle}`,
          options: [
            { id: "A", text: "Option A" },
            { id: "B", text: "Option B" },
            { id: "C", text: "Option C" },
            { id: "D", text: "Option D" },
          ],
          correctAnswer: "A",
          explanation: `Зөв хариулт: Тухайн дүрмийн дагуу Option A зөв байна.`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    db.addLesson(newLesson);
    setLessonsList(db.getLessons());
    setIsCreatingLesson(false);
    setLessonTitle("");
    setLessonContent("");
    setLessonTakeaways([""]);
    showToast(`"${newLesson.title}" хичээл амжилттай хадгалагдлаа!`);
  };

  // ==========================================
  // 5. DAILY VOCABULARY ADMIN STATE
  // ==========================================
  const [vocabList, setVocabList] = useState<DailyVocabularySet[]>(() => db.getDailyVocabSets());
  const [todayVocabTheme, setTodayVocabTheme] = useState("ЭЕШ 2026 Түгээмэл Академик Үгс");
  const [isGeneratingVocabAi, setIsGeneratingVocabAi] = useState(false);

  const handleAdminGenerateDailyWords = async () => {
    setIsGeneratingVocabAi(true);
    try {
      const res = await fetch("/api/ai/generate-daily-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: todayVocabTheme, level: "High Frequency", count: 10 }),
      });
      const data = await res.json();
      if (data.success && data.words && data.words.length > 0) {
        const newSet: DailyVocabularySet = {
          id: `vocab-admin-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          theme: todayVocabTheme,
          words: data.words,
          source: "teacher",
          createdByName: "Админ / Англи хэлний багш",
          createdAt: new Date().toISOString(),
        };
        db.saveDailyVocabSet(newSet);
        setVocabList(db.getDailyVocabSets());
        showToast("Өдрийн 10 үг амжилттай үүсэж бүх сурагчдад нийтлэгдлээ!");
      } else {
        showToast("Үг үүсгэхэд алдаа гарлаа", false);
      }
    } catch (err) {
      console.warn(err);
      showToast("Сүлжээний алдаа", false);
    } finally {
      setIsGeneratingVocabAi(false);
    }
  };

  // Past papers list in exams
  const publishedPastPapers = exams.filter((e) => e.type === "past_paper" || !e.type);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in ${
            toastMsg.success
              ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
              : "bg-rose-50 text-rose-900 border border-rose-300"
          }`}
        >
          {toastMsg.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Main Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setSubTab("past-papers")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === "past-papers"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Өмнөх оны тестүүд (2006–2026)</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
            {publishedPastPapers.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab("weekly-mock")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === "weekly-mock"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Bell className="w-4 h-4 text-amber-300" />
          <span>7 хоног бүрийн Mock тест оруулах & Мэдэгдэл</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
            {existingMocks.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab("practice-tests")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === "practice-tests"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Нэмэлт дасгал даалгавар (Practice Tests)</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
            {existingPractice.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab("lessons")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === "lessons"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Хичээлүүд (Learning Center)</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
            {lessonsList.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab("daily-vocab")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === "daily-vocab"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Өдрийн 10 үг</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
            {vocabList.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab("pdf-uploader")}
          className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            subTab === "pdf-uploader"
              ? "bg-slate-800 text-white shadow-xs"
              : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileUp className="w-3.5 h-3.5" />
          <span>PDF Студи (Нэмэлт)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 0: PDF EXAM INGESTION STUDIO (4 VARIANTS & ALL TESTS)              */}
      {/* ========================================================================= */}
      {subTab === "pdf-uploader" && (
        <PdfExamIngestionStudio
          exams={exams}
          onPublishExam={onPublishExam}
          onStartExam={onStartExam}
          onSendNotification={onSendNotification}
        />
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 1: PAST PAPERS (2006-2026) INGESTION & MANAGEMENT                 */}
      {/* ========================================================================= */}
      {subTab === "past-papers" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Manual Exam Typing & Editing Studio for Past Papers */}
          <ManualExamEditor
            initialExamType="past_paper"
            defaultYear={pastYear}
            defaultVariant={pastVariant}
            onSaveExam={(newExam) => {
              onPublishExam(newExam);
              showToast(`"${newExam.title}" 2006–2026 ЭЕШ-ийн санд амжилттай хадгалагдаж нийтлэгдлээ!`);
            }}
            onPreviewExam={(exam) => {
              if (onStartExam) onStartExam(exam, "mock");
            }}
          />

          {/* Published Past Papers Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-slate-900">
                  Архивт нийтлэгдсэн өмнөх оны тестүүд ({publishedPastPapers.length})
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Сурагч, багш нарын "ЭЕШ Сан (2006–2026)" цэсэнд шууд харагдаж буй шалгалтууд
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Он</th>
                    <th className="px-4 py-3">Хувилбар</th>
                    <th className="px-4 py-3">Шалгалтын нэр</th>
                    <th className="px-4 py-3">Асуулт</th>
                    <th className="px-4 py-3">Хугацаа</th>
                    <th className="px-4 py-3 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {publishedPastPapers.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-black text-blue-600">{exam.year}</td>
                      <td className="px-4 py-3 font-bold">{exam.variant}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{exam.title}</td>
                      <td className="px-4 py-3">{exam.totalQuestions} тест</td>
                      <td className="px-4 py-3">{exam.durationMinutes} мин</td>
                      <td className="px-4 py-3 text-right">
                        {onDeleteExam && (
                          <button
                            onClick={() => {
                              if (confirm(`"${exam.title}" шалгалтыг устгах уу?`)) {
                                onDeleteExam(exam.id);
                                showToast(`"${exam.title}" устгагдлаа.`);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Устгах"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: WEEKLY MOCK TEST CREATION & NOTIFICATION                        */}
      {/* ========================================================================= */}
      {subTab === "weekly-mock" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Manual Exam Typing & Editing Studio for Weekly Mock */}
          <ManualExamEditor
            initialExamType="mock"
            defaultYear={2026}
            onSaveExam={(newExam, sendNotification) => {
              onPublishExam(newExam);
              if (sendNotification && onSendNotification) {
                onSendNotification(
                  `Шинэ 7 хоногийн Mock Тест нийтлэгдлээ!`,
                  `2026 оны ЭЕШ-ийн шинэ жишиг шалгалт: "${newExam.title}" нийтлэгдлээ. 80 минутын хугацаатай бодит сорилоор өөрийгөө шалгаарай!`,
                  "all"
                );
              }
              showToast(`"${newExam.title}" 7 хоногийн mock санд амжилттай нийтлэгдэж, мэдэгдэл илгээгдлээ!`);
            }}
            onPreviewExam={(exam) => {
              if (onStartExam) onStartExam(exam, "mock");
            }}
          />

          {/* Previous Weekly Mocks Archive ("Өмнөх mock тестүүд нь байж байна") */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h4 className="text-base font-black text-slate-900">
                Өмнөх 7 хоногийн Mock тестүүдийн архив ({existingMocks.length})
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Өмнөх бүх долоо хоногийн mock тестүүд системд бүрэн хадгалагдан үлдсэн байна.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingMocks.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-black">
                        Mock Тест
                      </span>
                      <span className="text-xs text-slate-500">{m.durationMinutes} мин</span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-900">{m.title}</h5>
                    <div className="text-[11px] text-slate-500">
                      Нийт: <strong>{m.totalQuestions} асуулт</strong> • Огноо: {m.createdAt || "2026"}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 font-bold">Нийтлэгдсэн</span>
                    {onDeleteExam && (
                      <button
                        onClick={() => {
                          if (confirm(`"${m.title}" mock сорилыг устгах уу?`)) {
                            onDeleteExam(m.id);
                            showToast(`"${m.title}" устгагдлаа.`);
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: PRACTICE TESTS (Нэмэлт дасгал даалгавар)                      */}
      {/* ========================================================================= */}
      {subTab === "practice-tests" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Manual Exam Typing & Editing Studio for Practice Tests */}
          <ManualExamEditor
            initialExamType="practice"
            defaultYear={2026}
            onSaveExam={(newExam) => {
              onPublishExam(newExam);
              showToast(`"${newExam.title}" нэмэлт дасгалын санд амжилттай нийтлэгдлээ!`);
            }}
            onPreviewExam={(exam) => {
              if (onStartExam) onStartExam(exam, "practice");
            }}
          />

          {/* Published Practice Tests Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-base font-black text-slate-900">
              Нийтлэгдсэн нэмэлт дасгал даалгаврууд ({existingPractice.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingPractice.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3 text-xs"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                      Practice Drill
                    </span>
                    <h5 className="font-bold text-slate-900 mt-1.5">{p.title}</h5>
                    <p className="text-slate-500 mt-0.5">{p.totalQuestions} дасгал • {p.durationMinutes} мин</p>
                  </div>
                  {onDeleteExam && (
                    <div className="pt-2 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => {
                          if (confirm(`"${p.title}" дасгалыг устгах уу?`)) {
                            onDeleteExam(p.id);
                            showToast(`"${p.title}" устгагдлаа.`);
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: LESSONS (Learning Center)                                      */}
      {/* ========================================================================= */}
      {subTab === "lessons" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-purple-50/60 p-5 rounded-2xl border border-purple-100">
            <div>
              <h3 className="text-base font-black text-purple-950">Learning Center - Хичээлийн удирдлага</h3>
              <p className="text-xs text-purple-800/80 mt-0.5">
                Grammar, Vocabulary, Phrasal Verbs, Reading-ийн системчилсэн хичээлүүд нэмж, баяжуулах боломжтой.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingLesson(!isCreatingLesson)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingLesson ? "Жагсаалт харах" : "Шинэ хичээл нэмэх"}</span>
            </button>
          </div>

          {/* CREATE LESSON FORM */}
          {isCreatingLesson && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Шинэ хичээл үүсгэх</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={lessonAiTopic}
                    onChange={(e) => setLessonAiTopic(e.target.value)}
                    placeholder="AI-аар бэлтгэх сэдэв..."
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs w-48 sm:w-64"
                  />
                  <button
                    disabled={isGeneratingLessonAi}
                    onClick={handleAiGenerateLesson}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingLessonAi ? "Үүсгэж байна..." : "AI туслах"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Гарчиг</label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="Хичээлийн гарчиг..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ангилал</label>
                  <select
                    value={lessonCategory}
                    onChange={(e) => setLessonCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                  >
                    <option value="Grammar">Grammar</option>
                    <option value="Vocabulary">Vocabulary</option>
                    <option value="Phrasal Verbs">Phrasal Verbs</option>
                    <option value="Reading">Reading</option>
                    <option value="Idioms">Idioms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Түвшин</label>
                  <select
                    value={lessonDifficulty}
                    onChange={(e) => setLessonDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Дэлгэрэнгүй онол, дүрмийн тайлбар
                </label>
                <textarea
                  rows={6}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Хичээлийн бүрэн онолыг энд бичнэ..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCreatingLesson(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
                >
                  Болих
                </button>
                <button
                  onClick={handleSaveLesson}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Хадгалах</span>
                </button>
              </div>
            </div>
          )}

          {/* Lessons List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessonsList.map((ls) => (
              <div
                key={ls.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    {ls.category}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-2">{ls.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{ls.summaryRule}</p>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  {ls.durationMinutes} мин • Түвшин: {ls.difficulty}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: DAILY VOCABULARY MANAGEMENT                                    */}
      {/* ========================================================================= */}
      {subTab === "daily-vocab" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-black text-slate-900">Өдөр тутам цээжлэх 10 үг удирдах</h4>
              <p className="text-xs text-slate-700 mt-0.5">
                Багш эсвэл хиймэл оюунаар өдөр бүрийн 10 үгийг сонгон бэлтгэж нийтлэх
              </p>
            </div>
            <button
              disabled={isGeneratingVocabAi}
              onClick={handleAdminGenerateDailyWords}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingVocabAi ? "animate-spin" : ""}`} />
              <span>{isGeneratingVocabAi ? "AI Үүсгэж байна..." : "AI-аар өнөөдрийн 10 үг нийтлэх"}</span>
            </button>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
            <label className="block text-xs font-bold text-amber-950">Сэдэв / Чиглэл сонгох</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={todayVocabTheme}
                onChange={(e) => setTodayVocabTheme(e.target.value)}
                placeholder="Жишээ: ЭЕШ 2026 Academic Collocations & Phrasal Verbs..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-amber-200 text-xs text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Current Sets List */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Системд бүртгэлтэй үгийн багцууд ({vocabList.length})
            </h5>
            <div className="space-y-3">
              {vocabList.map((st) => (
                <div key={st.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{st.theme}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {st.source === "ai" ? "✨ AI" : "Багш"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{st.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {st.words.map((w) => (
                      <span
                        key={w.id}
                        className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-800"
                      >
                        {w.word} ({w.definitionMn})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
