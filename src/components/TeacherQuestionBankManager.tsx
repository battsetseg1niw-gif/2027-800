import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Copy,
  Save,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Layers,
  FileText,
  Upload,
  Eye,
  AlertCircle,
  HelpCircle,
  Check,
  ChevronDown,
  X,
  RefreshCw,
  Award,
  ArrowRight,
} from "lucide-react";
import { Exam, Question, QuestionCategory, QuestionType, QuestionOption, UserProfile, ClassRoom } from "../types";
import { db } from "../lib/supabase";
import { EXAM_DIAGRAM_PRESETS } from "../data/examDiagramPresets";
import { ManualExamEditor } from "./ManualExamEditor";
import { CustomTestBuilder } from "./CustomTestBuilder";

interface TeacherQuestionBankManagerProps {
  exams: Exam[];
  currentUser: UserProfile;
  classes?: ClassRoom[];
  onUpdateExams: () => void;
  onSwitchToStudentView: () => void;
  onStartExam?: (exam: Exam, mode?: "mock" | "practice") => void;
  onAssignToClass?: (assignmentData: {
    title: string;
    classId: string;
    exam: Exam;
    dueDate: string;
    timeLimitMinutes: number;
  }) => void;
  onPrintOMR?: (exam: Exam) => void;
}

const COMMON_TOPICS = [
  "Verb Tenses & Aspects",
  "Past Simple vs Past Continuous",
  "Present Perfect vs Past Simple",
  "Conditionals (Type 1, 2, 3, Mixed)",
  "Passive Voice",
  "Reported Speech",
  "Modal Verbs (Obligation & Probability)",
  "Prepositions of Place & Time",
  "Relative Clauses (who, which, whose)",
  "Phrasal Verbs & Idioms",
  "Gerunds and Infinitives",
  "Adjectives & Adverbial Comparison",
  "Articles & Quantifiers",
  "Synonyms & Antonyms",
  "Word Formation (Prefixes & Suffixes)",
  "Reading Comprehension (Main Idea & Details)",
  "Everyday Communication & Dialogue",
];

export const TeacherQuestionBankManager: React.FC<TeacherQuestionBankManagerProps> = ({
  exams,
  currentUser,
  classes = [],
  onUpdateExams,
  onSwitchToStudentView,
  onStartExam,
  onAssignToClass,
  onPrintOMR,
}) => {
  // Main view modes
  const [activeTab, setActiveTab] = useState<"compose" | "browse" | "bulk" | "mixer" | "full_exam">("compose");

  // Success / notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --------------------------------------------------------------------------
  // QUESTION FORM STATE
  // --------------------------------------------------------------------------
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [category, setCategory] = useState<QuestionCategory>("Grammar");
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [topic, setTopic] = useState<string>("Verb Tenses & Aspects");
  const [customTopic, setCustomTopic] = useState<string>("");
  const [level, setLevel] = useState<"A2" | "B1" | "B2">("B1");
  const [text, setText] = useState<string>("");
  const [passage, setPassage] = useState<string>("");
  const [showPassageField, setShowPassageField] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>("");

  // Options
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: "A", text: "" },
    { id: "B", text: "" },
    { id: "C", text: "" },
    { id: "D", text: "" },
    { id: "E", text: "" },
  ]);
  const [correctOptionId, setCorrectOptionId] = useState<string>("A");

  // Diagram / Image
  const [selectedDiagramPreset, setSelectedDiagramPreset] = useState<string>("");
  const [customImageUrl, setCustomImageUrl] = useState<string>("");
  const [showDiagramPicker, setShowDiagramPicker] = useState<boolean>(false);

  // Target exam
  const [targetExamId, setTargetExamId] = useState<string>("esh-practice-custom-bank");

  // --------------------------------------------------------------------------
  // BROWSE / FILTER STATE
  // --------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [browseCategory, setBrowseCategory] = useState<string>("all");
  const [browseTopic, setBrowseTopic] = useState<string>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // BULK IMPORT STATE
  // --------------------------------------------------------------------------
  const [bulkInputText, setBulkInputText] = useState<string>("");

  // Extract all questions in database
  const allBankQuestions = useMemo(() => {
    const list: { question: Question; examId: string; examTitle: string; examYear: number }[] = [];
    const seen = new Set<string>();

    exams.forEach((ex) => {
      ex.questions.forEach((q) => {
        const qId = q.id || `${ex.id}-${q.questionNumber}`;
        if (!seen.has(qId)) {
          seen.add(qId);
          list.push({
            question: { ...q, id: qId },
            examId: ex.id,
            examTitle: ex.title,
            examYear: ex.year,
          });
        }
      });
    });
    return list;
  }, [exams]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { Grammar: 0, Vocabulary: 0, Communication: 0, Reading: 0, withImage: 0 };
    allBankQuestions.forEach((item) => {
      const cat = item.question.category;
      if (counts[cat as keyof typeof counts] !== undefined) {
        counts[cat as keyof typeof counts]++;
      }
      if (item.question.imageUrl) {
        counts.withImage++;
      }
    });
    return counts;
  }, [allBankQuestions]);

  // Filtered browse questions
  const filteredBrowseQuestions = useMemo(() => {
    return allBankQuestions.filter((item) => {
      const q = item.question;
      if (browseCategory !== "all" && q.category !== browseCategory) return false;
      if (browseTopic !== "all" && q.topic !== browseTopic) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const mText = q.text.toLowerCase().includes(query);
        const mTopic = q.topic?.toLowerCase().includes(query);
        const mExp = q.explanation?.toLowerCase().includes(query);
        if (!mText && !mTopic && !mExp) return false;
      }
      return true;
    });
  }, [allBankQuestions, browseCategory, browseTopic, searchQuery]);

  // Insert blank space marker
  const handleInsertBlank = () => {
    setText((prev) => prev + " _______ ");
  };

  // Populate sample question for quick testing
  const handleFillSample = () => {
    setCategory("Grammar");
    setQuestionType("multiple_choice");
    setTopic("Verb Tenses & Aspects");
    setLevel("B1");
    setText("By the time the rescue team arrived, the mountaineers _______ for over 18 hours in freezing temperatures.");
    setOptions([
      { id: "A", text: "are waiting" },
      { id: "B", text: "had been waiting" },
      { id: "C", text: "have waited" },
      { id: "D", text: "will wait" },
      { id: "E", text: "waited" },
    ]);
    setCorrectOptionId("B");
    setExplanation("By the time + Past Simple заасан үед өнгөрсөнд тодорхой хугацаанд үргэлжилсэн үйлдлийг заах тул Past Perfect Continuous (had been + V-ing) цаг хэрэглэнэ.");
    setSelectedDiagramPreset("preset-tenses-timeline");
    setCustomImageUrl("");
  };

  // Reset form
  const handleResetForm = () => {
    setEditingQuestionId(null);
    setText("");
    setPassage("");
    setShowPassageField(false);
    setExplanation("");
    setOptions([
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
      { id: "D", text: "" },
      { id: "E", text: "" },
    ]);
    setCorrectOptionId("A");
    setSelectedDiagramPreset("");
    setCustomImageUrl("");
    setShowDiagramPicker(false);
  };

  // Edit existing question
  const handleEditQuestion = (item: { question: Question; examId: string }) => {
    const q = item.question;
    setEditingQuestionId(q.id);
    setCategory(q.category || "Grammar");
    setQuestionType(q.type || "multiple_choice");
    setTopic(q.topic || "Verb Tenses & Aspects");
    setLevel((q.difficulty as any) || "B1");
    setText(q.text || "");
    setPassage(q.readingPassage || "");
    setShowPassageField(Boolean(q.readingPassage));
    setExplanation(q.explanation || "");

    if (q.options && q.options.length > 0) {
      setOptions(q.options);
      setCorrectOptionId(q.correctAnswer || q.options[0].id);
    }

    if (q.imageUrl) {
      const isPreset = EXAM_DIAGRAM_PRESETS.some((p) => p.dataUrl === q.imageUrl);
      if (isPreset) {
        const found = EXAM_DIAGRAM_PRESETS.find((p) => p.dataUrl === q.imageUrl);
        setSelectedDiagramPreset(found?.id || "");
        setCustomImageUrl("");
      } else {
        setSelectedDiagramPreset("");
        setCustomImageUrl(q.imageUrl);
      }
    } else {
      setSelectedDiagramPreset("");
      setCustomImageUrl("");
    }

    setTargetExamId(item.examId);
    setActiveTab("compose");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Duplicate question
  const handleDuplicateQuestion = (q: Question) => {
    setEditingQuestionId(null);
    setCategory(q.category || "Grammar");
    setQuestionType(q.type || "multiple_choice");
    setTopic(q.topic || "Verb Tenses & Aspects");
    setLevel((q.difficulty as any) || "B1");
    setText(q.text + " (Хувилбар 2)");
    setPassage(q.readingPassage || "");
    setShowPassageField(Boolean(q.readingPassage));
    setExplanation(q.explanation || "");
    setOptions(q.options || []);
    setCorrectOptionId(q.correctAnswer || "A");
    setActiveTab("compose");
    showToast("Асуултыг хуулж засварлагчид орууллаа. Өөрчлөөд хадгална уу.");
  };

  // Delete question
  const handleDeleteQuestion = (questionId: string) => {
    db.deleteQuestionFromBank(questionId);
    onUpdateExams();
    setDeleteConfirmId(null);
    showToast("Асуулт сангаас амжилттай устгагдлаа.");
  };

  // Save question handler
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      showToast("Асуултын текстийг оруулна уу!", "error");
      return;
    }

    const filledOptions = options.filter((o) => o.text.trim() !== "");
    if (filledOptions.length < 2) {
      showToast("Дор хаяж 2 сонголтын текстийг бөглөнө үү!", "error");
      return;
    }

    // Determine final image URL
    let finalImageUrl: string | undefined = undefined;
    if (selectedDiagramPreset) {
      const preset = EXAM_DIAGRAM_PRESETS.find((p) => p.id === selectedDiagramPreset);
      if (preset) finalImageUrl = preset.dataUrl;
    } else if (customImageUrl.trim()) {
      finalImageUrl = customImageUrl.trim();
    }

    const effectiveTopic = customTopic.trim() ? customTopic.trim() : topic;

    const questionToSave: Question = {
      id: editingQuestionId || `custom-q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      questionNumber: 1,
      category,
      type: questionType,
      topic: effectiveTopic,
      subtopic: effectiveTopic,
      difficulty: level === "A2" ? "Easy" : level === "B1" ? "Medium" : "Hard",
      text: text.trim(),
      readingPassage: showPassageField && passage.trim() ? passage.trim() : undefined,
      options: options.map((opt) => ({
        id: opt.id as "A" | "B" | "C" | "D" | "E",
        text: opt.text.trim() || `(Хоосон)`,
      })),
      correctAnswer: correctOptionId,
      explanation: explanation.trim() || "Тайлбар оруулаагүй байна.",
      imageUrl: finalImageUrl,
    };

    // Save into database
    db.addQuestionToBank(questionToSave, targetExamId);
    onUpdateExams();

    showToast(
      editingQuestionId
        ? "Тестийн асуулт амжилттай шинэчлэгдлээ!"
        : "Шинэ тест асуултын санд амжилттай нэмэгдлээ!"
    );

    handleResetForm();
  };

  // Bulk import parser
  const handleParseBulk = () => {
    if (!bulkInputText.trim()) {
      showToast("Хуулах тестүүдээ оруулна уу!", "error");
      return;
    }

    // Simple line-by-line block parser
    const blocks = bulkInputText.split(/\n\s*\n/).filter((b) => b.trim().length > 0);
    let addedCount = 0;

    blocks.forEach((block, idx) => {
      const lines = block.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length >= 3) {
        const questionLine = lines[0].replace(/^\d+[\.\)]\s*/, "");
        const parsedOptions: QuestionOption[] = [];
        let detectedAnswer = "A";
        let parsedExplanation = "";

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const optMatch = line.match(/^([A-E])[\.\)]\s*(.*)/i);
          if (optMatch) {
            const optLetter = optMatch[1].toUpperCase();
            let optContent = optMatch[2];
            if (optContent.endsWith("*")) {
              optContent = optContent.slice(0, -1).trim();
              detectedAnswer = optLetter;
            }
            parsedOptions.push({ id: optLetter, text: optContent });
          } else if (line.toLowerCase().startsWith("answer:") || line.toLowerCase().startsWith("хариу:")) {
            const ansChar = line.split(":")[1]?.trim()?.toUpperCase()?.[0];
            if (ansChar && ["A", "B", "C", "D", "E"].includes(ansChar)) {
              detectedAnswer = ansChar;
            }
          } else if (line.toLowerCase().startsWith("explanation:") || line.toLowerCase().startsWith("тайлбар:")) {
            parsedExplanation = line.split(":")[1]?.trim() || "";
          }
        }

        if (parsedOptions.length >= 2) {
          const newQ: Question = {
            id: `bulk-q-${Date.now()}-${idx}`,
            questionNumber: idx + 1,
            category,
            type: "multiple_choice",
            topic: topic || "Bulk Import",
            subtopic: topic || "Bulk Import",
            difficulty: "Medium",
            text: questionLine,
            options: parsedOptions.map((o) => ({
              id: o.id as "A" | "B" | "C" | "D" | "E",
              text: o.text,
            })),
            correctAnswer: detectedAnswer,
            explanation: parsedExplanation || "Тайлбар оруулаагүй байна.",
          };
          db.addQuestionToBank(newQ, targetExamId);
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      onUpdateExams();
      setBulkInputText("");
      showToast(`${addedCount} тест амжилттай импортлогдож санд нэмэгдлээ!`);
      setActiveTab("browse");
    } else {
      showToast("Тестүүдийг таньж чадсангүй. Загварын дагуу шалгана уу.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-emerald-900/95 text-white border-emerald-600 shadow-emerald-900/20"
              : "bg-red-900/95 text-white border-red-600 shadow-red-900/20"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-300" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Studio Banner & Role Badge */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>
                {currentUser?.role === "admin"
                  ? "Админы Тестийн Сангийн Төв"
                  : "Багшийн Тест Оруулах & Сан Бүрдүүлэх Төв"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Тест Оруулах & Тестийн Сан (Question Bank)
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              ЭЕШ-ын Англи хэлний 4 үндсэн бүлэгт (Grammar, Vocabulary, Communication, Reading) шинэ даалгавар,
              диаграмм зураг хавсарган нэмэх, сангийн асуултуудыг засах, болон сурагчдын дасгал сорилыг удирдах хэсэг.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/10 text-center min-w-[90px]">
              <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Нийт Сан</div>
              <div className="text-2xl font-black text-amber-300">{allBankQuestions.length}</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/10 text-center min-w-[90px]">
              <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Дүрэм (Grammar)</div>
              <div className="text-2xl font-black text-blue-300">{categoryCounts.Grammar}</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/10 text-center min-w-[90px]">
              <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Үгийн сан</div>
              <div className="text-2xl font-black text-emerald-300">{categoryCounts.Vocabulary}</div>
            </div>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("compose")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "compose"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Шинэ тест оруулах (Compose)</span>
            </button>

            <button
              onClick={() => setActiveTab("browse")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "browse"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Сангийн жагсаалт & Засах ({allBankQuestions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("bulk")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "bulk"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Багцаар хуулах (Bulk Import)</span>
            </button>

            <button
              onClick={() => setActiveTab("mixer")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "mixer"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Сэдвээр тест холих (Topic Mixer)</span>
            </button>

            <button
              onClick={() => setActiveTab("full_exam")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "full_exam"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Бүтэн шалгалт үүсгэх (50-60 тест)</span>
            </button>
          </div>

          {/* Student View Toggle Button */}
          <button
            onClick={onSwitchToStudentView}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all flex items-center gap-2 shadow-md cursor-pointer ml-auto"
            title="Сурагч энэ дасгалыг хэрхэн харж ажиллахыг турших"
          >
            <Eye className="w-4 h-4" />
            <span>Сурагчийн нүдээр турших (Practice Mode)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COMPOSE / EDIT SINGLE QUESTION */}
      {/* ========================================================================= */}
      {activeTab === "compose" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <span>{editingQuestionId ? "Асуултыг засах горим" : "Шинэ Асуулт Зохиох & Санд Нэмэх"}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Асуулт, сонголтууд, дүрмийн монгол тайлбар болон зураг/диаграммаа оруулна уу.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFillSample}
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Жишээ тестээр дүүргэх</span>
              </button>

              {editingQuestionId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Цуцлах
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveQuestion} className="space-y-6">
            {/* Row 1: Category, Type, Difficulty, Target Exam */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Ангилал (Category):
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as QuestionCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Grammar">Grammar (Дүрэм)</option>
                  <option value="Vocabulary">Vocabulary (Үгийн сан)</option>
                  <option value="Communication">Communication (Харилцан яриа)</option>
                  <option value="Reading">Reading (Эх унших)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. Даалгаврын төрөл:
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="multiple_choice">Олон сонголттой (Multiple choice)</option>
                  <option value="matching">Багана холбох (Matching)</option>
                  <option value="fill_blank">Өгүүлбэр нөхөх (Fill-in-blanks)</option>
                  <option value="drag_drop">Чирч ангилах (Drag & Drop)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3. Түвшин (CEFR Level):
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(["A2", "B1", "B2"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-black transition-colors cursor-pointer text-center ${
                        level === lvl
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  4. Хадгалах сорилт:
                </label>
                <select
                  value={targetExamId}
                  onChange={(e) => setTargetExamId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="esh-practice-custom-bank">⭐ Багш & Админы Бүрдүүлсэн Сан</option>
                  {exams.slice(0, 10).map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} ({ex.year} он)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Topic & Subtopic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                5. Сэдэв (Topic):
              </label>
              <div className="space-y-2">
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {COMMON_TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Эсвэл өөр шинэ сэдвийн нэр бичих..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  {customTopic && (
                    <button
                      type="button"
                      onClick={() => setCustomTopic("")}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Цэвэрлэх
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Reading Context / Passage (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  6. Холбогдох эх бичвэр / Диалоги (Passage/Context) - Сонголттой:
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassageField(!showPassageField)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {showPassageField ? "Эх бичвэрийг нуух" : "+ Эх бичвэр / контекст нэмэх"}
                </button>
              </div>

              {showPassageField && (
                <textarea
                  rows={4}
                  placeholder="Эх унших даалгавар эсвэл харилцан ярианы эх бичвэрийг энд бичнэ үү..."
                  value={passage}
                  onChange={(e) => setPassage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed font-mono"
                />
              )}
            </div>

            {/* Row 4: Question Text & Blank Insert Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  7. Асуултын үндсэн эх бичвэр (Question Text) * :
                </label>
                <button
                  type="button"
                  onClick={handleInsertBlank}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>+ Хоосон зай нэмэх (_______)</span>
                </button>
              </div>
              <textarea
                rows={3}
                required
                placeholder="Жишээ: By the time she arrived, the train _______ already."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Row 5: Options (A, B, C, D, E) & Correct Radio Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  8. Хариултын сонголтууд (Зөв хариуг сонгож тэмдэглэнэ үү):
                </label>
                <span className="text-[11px] text-emerald-600 font-bold">
                  ✓ Зөв хариулт: [ {correctOptionId} ]
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {options.map((opt) => {
                  const isCorrect = correctOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setCorrectOptionId(opt.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20"
                          : "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                            isCorrect ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {isCorrect ? "ЗӨВ ХАРИУ" : "Сонгох"}
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder={`Сонголт ${opt.id}...`}
                        value={opt.text}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOptions((prev) =>
                            prev.map((o) => (o.id === opt.id ? { ...o, text: val } : o))
                          );
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 6: Diagram / Image Attachment */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">
                    9. Зураг / Диаграмм хавсаргах (SVG Preset эсвэл URL):
                  </span>
                </div>

                {(selectedDiagramPreset || customImageUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDiagramPreset("");
                      setCustomImageUrl("");
                    }}
                    className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Зургийг арилгах
                  </button>
                )}
              </div>

              {/* Preset selection chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {EXAM_DIAGRAM_PRESETS.map((preset) => {
                  const isSelected = selectedDiagramPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedDiagramPreset(preset.id);
                        setCustomImageUrl("");
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/80 shadow-2xs ring-1 ring-blue-600"
                          : "border-slate-200 bg-white hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-[11px] font-black text-slate-900 truncate">
                        {preset.title.split("(")[0]}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">{preset.category}</div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Image URL input */}
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Эсвэл өөрийн зургийн веб холбоос (URL) оруулах: https://..."
                  value={customImageUrl}
                  onChange={(e) => {
                    setCustomImageUrl(e.target.value);
                    if (e.target.value) setSelectedDiagramPreset("");
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Image Preview Box */}
              {(selectedDiagramPreset || customImageUrl) && (
                <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Зургийн урьдчилсан харагдац:
                  </div>
                  <div className="max-h-48 overflow-hidden rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100">
                    <img
                      src={
                        selectedDiagramPreset
                          ? EXAM_DIAGRAM_PRESETS.find((p) => p.id === selectedDiagramPreset)?.dataUrl
                          : customImageUrl
                      }
                      alt="Diagram Preview"
                      className="max-h-48 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Row 7: Mongolian Explanation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                10. Дүрмийн тайлбар & Зөвлөгөө (Сурагч алдахад гарах тайлбар):
              </label>
              <textarea
                rows={2}
                placeholder="Жишээ: Өнгөрсөн цагт болсон үйлдлийг заах тул Past Simple цагийн V2 хэлбэрийг сонгоно..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Submit & Reset actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Хадгалмагц тестийн санд нэмэгдэж сурагчдын дасгал, хувилбарт автоматаар орно.
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Цэвэрлэх
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingQuestionId ? "Өөрчлөлтийг хадгалах" : "Тестийн санд хадгалах"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BROWSE & MANAGE BANK QUESTIONS */}
      {/* ========================================================================= */}
      {activeTab === "browse" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Тестийн Сангийн Жагсаалт ({filteredBrowseQuestions.length} асуулт)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Сангийн асуултуудыг шүүж үзэх, засах, хуулах болон устгах удирдлага.
              </p>
            </div>

            <button
              onClick={() => {
                handleResetForm();
                setActiveTab("compose");
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Шинэ асуулт нэмэх</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Асуултын текст, сэдэв, тайлбараас хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-1 overflow-x-auto">
              {["all", "Grammar", "Vocabulary", "Communication", "Reading"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBrowseCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    browseCategory === cat
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat === "all" ? "Бүгд" : cat}
                </button>
              ))}
            </div>

            {/* Topic Filter */}
            <select
              value={browseTopic}
              onChange={(e) => setBrowseTopic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">Бүх сэдэв ({COMMON_TOPICS.length})</option>
              {COMMON_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Questions List */}
          {filteredBrowseQuestions.length > 0 ? (
            <div className="space-y-4">
              {filteredBrowseQuestions.slice(0, 50).map((item, idx) => {
                const q = item.question;
                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-3"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            q.category === "Grammar"
                              ? "bg-blue-100 text-blue-700"
                              : q.category === "Vocabulary"
                              ? "bg-emerald-100 text-emerald-700"
                              : q.category === "Communication"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {q.category}
                        </span>

                        {q.topic && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                            {q.topic}
                          </span>
                        )}

                        {q.difficulty && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                            {q.difficulty}
                          </span>
                        )}

                        {q.imageUrl && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>Диаграммтай</span>
                          </span>
                        )}
                      </div>

                      {/* Actions: Edit, Duplicate, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditQuestion(item)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Асуултыг засах"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateQuestion(q)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Хуулах (Duplicate)"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {deleteConfirmId === q.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Устгах уу?
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                            >
                              Цуцлах
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(q.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Устгах"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Passage (if any) */}
                    {q.readingPassage && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 italic">
                        {q.readingPassage}
                      </div>
                    )}

                    {/* Question Text */}
                    <div className="text-sm font-bold text-slate-900 leading-snug">
                      {q.text}
                    </div>

                    {/* Diagram preview (if any) */}
                    {q.imageUrl && (
                      <div className="max-h-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 max-w-sm">
                        <img
                          src={q.imageUrl}
                          alt="Question Diagram"
                          className="max-h-36 object-contain mx-auto"
                        />
                      </div>
                    )}

                    {/* Options list with correct highlighted */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
                      {q.options?.map((opt) => {
                        const isCorrect = q.correctAnswer === opt.id;
                        return (
                          <div
                            key={opt.id}
                            className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
                              isCorrect
                                ? "bg-emerald-100/90 text-emerald-900 font-bold border border-emerald-300"
                                : "bg-white text-slate-700 border border-slate-200"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                                isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span className="truncate">{opt.text}</span>
                            {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-700 ml-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-800">Тайлбар:</strong> {q.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredBrowseQuestions.length > 50 && (
                <div className="text-center py-4 text-xs font-bold text-slate-500">
                  Эхний 50 асуултыг харуулав. Дэлгэрэнгүй харахын тулд дээрх шүүлтүүр ашиглана уу.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700">Илэрц олдсонгүй</div>
              <p className="text-xs text-slate-500">Шүүлтүүрээ өөрчлөх эсвэл шинэ тест нэмнэ үү.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BULK IMPORT */}
      {/* ========================================================================= */}
      {activeTab === "bulk" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Текстээр багцаар хуулж оруулах (Bulk Text Ingestion)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Word, PDF эсвэл файлаас олон асуултыг нэг дор хуулж сандаа нэмэх боломжтой.
            </p>
          </div>

          {/* Sample Format */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Зөвлөмжит бичлэгийн загвар (Асуулт бүрийг хоосон мөрөөр тусгаарлана):</span>
            </div>
            <pre className="font-mono text-[11px] bg-white p-3 rounded-xl border border-blue-200 text-slate-800 overflow-x-auto">
{`1. She _______ to London three times this year.
A. goes
B. has been*
C. went
D. is going
Answer: B
Explanation: This year хугацаанд давтагдсан туршлагыг Present Perfect-ээр илэрхийлнэ.

2. If I had known the truth, I _______ you immediately.
A. will tell
B. would have told*
C. told
D. tell
Answer: B
Explanation: Third conditional өнгөрсөнд болоогүй зүйлийн харамсал: would have + V3.`}
            </pre>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Хуулах тестүүдээ энд буулгана уу:
            </label>
            <textarea
              rows={12}
              value={bulkInputText}
              onChange={(e) => setBulkInputText(e.target.value)}
              placeholder="Дээрх загварын дагуу тестүүдээ энд Paste хийнэ үү..."
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() =>
                setBulkInputText(`1. By the time we arrived, the movie _______.
A. already started
B. had already started*
C. starts
D. will start
Answer: B
Explanation: Past Perfect цаг.

2. I am interested _______ learning foreign languages.
A. on
B. in*
C. at
D. with
Answer: B
Explanation: Interested in гэсэн тогтмол хэллэг.`)
              }
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Жишээ текст оруулах
            </button>

            <button
              onClick={handleParseBulk}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Багцаар санд оруулах</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TOPIC & YEAR MIXER (Custom Test Builder) */}
      {/* ========================================================================= */}
      {activeTab === "mixer" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Онууд & Сэдвүүдийг хольж тусгай тест үүсгэх</span>
              </h2>
              <p className="text-xs text-slate-500">
                2006–2026 оны материалууд болон грамматик, үгийн сангийн сэдвүүдээс сонгон өөрийн тоогоор сорилт үүсгэх.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("compose")}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Буцах
            </button>
          </div>

          <CustomTestBuilder
            exams={exams}
            currentUser={currentUser}
            classes={classes}
            onStartExam={onStartExam || (() => {})}
            onAssignToClass={onAssignToClass}
            onPrintOMR={onPrintOMR}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FULL EXAM CREATOR (50-60 Questions) */}
      {/* ========================================================================= */}
      {activeTab === "full_exam" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900">
                Бүтэн Шалгалт & Оны Материал Үүсгэгч (50-60 даалгавар)
              </h2>
              <p className="text-xs text-slate-500">
                ЭЕШ-ын стандарт 80 минутын хугацаатай, A4 хуудсанд бүрэн таарах албан ёсны шалгалт бүтээх.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("compose")}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Буцах
            </button>
          </div>

          <ManualExamEditor
            initialExamType="practice"
            defaultYear={2026}
            defaultVariant="A"
            onSaveExam={(newExam) => {
              db.addExam(newExam);
              onUpdateExams();
              showToast(`"${newExam.title}" шалгалт амжилттай хадгалагдлаа!`);
              setActiveTab("browse");
            }}
            onCancel={() => setActiveTab("compose")}
          />
        </div>
      )}
    </div>
  );
};
