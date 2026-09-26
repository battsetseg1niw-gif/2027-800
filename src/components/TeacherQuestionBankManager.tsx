import React, { useState, useMemo, useEffect } from "react";
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
  Square,
  CheckSquare,
  Send,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";
import { Exam, Question, QuestionCategory, QuestionType, QuestionOption, UserProfile, ClassRoom } from "../types";
import {
  db,
  saveQuestionToSupabase,
  saveBulkQuestionsToSupabase,
  fetchQuestionsFromSupabase,
  deleteQuestionFromSupabase,
  updateQuestionInSupabase,
  createAssignmentInSupabase,
} from "../lib/supabase";
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
  // SUPABASE QUESTION BANK PERSISTENCE STATE
  // --------------------------------------------------------------------------
  const [remoteQuestions, setRemoteQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);

  const loadQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const qs = await fetchQuestionsFromSupabase(currentUser?.id);
      if (qs && qs.length > 0) {
        setRemoteQuestions(qs);
      }
    } catch (err) {
      console.warn("fetchQuestionsFromSupabase error:", err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // --------------------------------------------------------------------------
  // BROWSE / FILTER / MULTI-SELECT STATE
  // --------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [browseCategory, setBrowseCategory] = useState<string>("all");
  const [browseTopic, setBrowseTopic] = useState<string>("all");
  const [browseLevel, setBrowseLevel] = useState<string>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // --------------------------------------------------------------------------
  // CREATE ASSIGNMENT MODAL STATE
  // --------------------------------------------------------------------------
  const [showAssignmentModal, setShowAssignmentModal] = useState<boolean>(false);
  const [asgTitle, setAsgTitle] = useState<string>("");
  const [asgClassId, setAsgClassId] = useState<string>(classes[0]?.id || "");
  const [asgDueDate, setAsgDueDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [asgTimeLimit, setAsgTimeLimit] = useState<number>(45);
  const [isSubmittingAsg, setIsSubmittingAsg] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // BULK IMPORT & AI PARSER STATE
  // --------------------------------------------------------------------------
  const [bulkInputText, setBulkInputText] = useState<string>("");
  const [isParsingAi, setIsParsingAi] = useState<boolean>(false);
  const [bulkParsedQuestions, setBulkParsedQuestions] = useState<
    {
      id: string;
      question_text: string;
      options: { id: string; text: string }[];
      correct_answer: string;
      explanation: string;
      category: QuestionCategory;
      topic: string;
      cefr_level: "A2" | "B1" | "B2";
    }[]
  >([]);

  // Extract all questions in database (merging remote Supabase questions and exams)
  const allBankQuestions = useMemo(() => {
    const list: { question: Question; examId: string; examTitle: string; examYear: number }[] = [];
    const seen = new Set<string>();

    // 1. Add questions fetched directly from Supabase questions table
    remoteQuestions.forEach((q) => {
      if (q && q.id && !seen.has(q.id)) {
        seen.add(q.id);
        list.push({
          question: q,
          examId: (q as any).examId || "esh-practice-custom-bank",
          examTitle: "Тестийн Сан",
          examYear: 2026,
        });
      }
    });

    // 2. Add questions from exams
    (exams || []).forEach((ex) => {
      (ex.questions || []).forEach((q) => {
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
  }, [remoteQuestions, exams]);

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

  // Filtered browse questions with Category, Topic, CEFR Level, and Search
  const filteredBrowseQuestions = useMemo(() => {
    return allBankQuestions.filter((item) => {
      const q = item.question;
      if (browseCategory !== "all" && q.category !== browseCategory) return false;
      if (browseTopic !== "all" && q.topic !== browseTopic) return false;
      if (browseLevel !== "all") {
        const qLvl = (q as any).level || (q.difficulty === "Easy" ? "A2" : q.difficulty === "Hard" ? "B2" : "B1");
        if (qLvl !== browseLevel) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const mText = q.text.toLowerCase().includes(query);
        const mTopic = q.topic?.toLowerCase().includes(query);
        const mExp = q.explanation?.toLowerCase().includes(query);
        if (!mText && !mTopic && !mExp) return false;
      }
      return true;
    });
  }, [allBankQuestions, browseCategory, browseTopic, browseLevel, searchQuery]);

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
  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestionFromSupabase(questionId);
    onUpdateExams();
    setDeleteConfirmId(null);
    setSelectedQuestionIds((prev) => prev.filter((id) => id !== questionId));
    await loadQuestions();
    showToast("Асуулт сангаас амжилттай устгагдлаа.");
  };

  // Save single question handler
  const handleSaveQuestion = async (e: React.FormEvent) => {
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
      level,
      text: text.trim(),
      readingPassage: showPassageField && passage.trim() ? passage.trim() : undefined,
      options: options.map((opt) => ({
        id: opt.id as "A" | "B" | "C" | "D" | "E",
        text: opt.text.trim() || `(Хоосон)`,
      })),
      correctAnswer: correctOptionId,
      explanation: explanation.trim() || "Тайлбар оруулаагүй байна.",
      imageUrl: finalImageUrl,
    } as any;

    if (editingQuestionId) {
      await updateQuestionInSupabase(questionToSave, currentUser.id);
    } else {
      await saveQuestionToSupabase(questionToSave, currentUser.id, targetExamId);
    }

    onUpdateExams();
    await loadQuestions();

    showToast(
      editingQuestionId
        ? "Тестийн асуулт амжилттай шинэчлэгдлээ!"
        : "Шинэ тест Supabase тестийн санд амжилттай хадгалагдлаа!"
    );

    handleResetForm();
  };

  // AI-Powered Bulk Ingestion using Gemini API
  const handleParseBulkAi = async () => {
    if (!bulkInputText.trim()) {
      showToast("Хуулах тестүүдээ оруулна уу!", "error");
      return;
    }

    setIsParsingAi(true);
    try {
      const res = await fetch("/api/ai/parse-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: bulkInputText,
          defaultCategory: category,
          defaultLevel: level,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setBulkParsedQuestions(data.questions);
        showToast(`AI ${data.questions.length} асуултыг амжилттай цэвэрлэж таньлаа. Урьдчилан хянаад санд хадгална уу.`);
      } else {
        showToast(data.error || "Тестүүдийг задлан таньж чадсангүй.", "error");
      }
    } catch (err: any) {
      console.warn("AI Bulk Parse error:", err);
      handleParseBulkRegex();
    } finally {
      setIsParsingAi(false);
    }
  };

  // Local Regex Parser (instant preview)
  const handleParseBulkRegex = () => {
    if (!bulkInputText.trim()) {
      showToast("Хуулах тестүүдээ оруулна уу!", "error");
      return;
    }

    const blocks = bulkInputText.split(/\n\s*\n/).filter((b) => b.trim().length > 0);
    const parsedList: any[] = [];

    blocks.forEach((block, idx) => {
      const lines = block.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length >= 2) {
        const questionLine = lines[0].replace(/^(?:№|Q|Question)?\s*\d+[\.\)\:]\s*/i, "");
        const parsedOptions: { id: string; text: string }[] = [];
        let detectedAnswer = "A";
        let parsedExplanation = "";

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const optMatch = line.match(/^([A-Ea-e])[\.\)\:\-\]]\s*(.*)/i);
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
          parsedList.push({
            id: `bulk-q-${Date.now()}-${idx + 1}`,
            question_text: questionLine,
            options: parsedOptions,
            correct_answer: detectedAnswer,
            explanation: parsedExplanation || "Дүрмийн тайлбар оруулаагүй байна.",
            category,
            topic: topic || "Bulk Import",
            cefr_level: level,
          });
        }
      }
    });

    if (parsedList.length > 0) {
      setBulkParsedQuestions(parsedList);
      showToast(`${parsedList.length} асуулт танигдлаа. Хянаад хадгална уу.`);
    } else {
      showToast("Тестүүдийг таньж чадсангүй. Загварын дагуу шалгана уу.", "error");
    }
  };

  // Save All Previewed Questions to Supabase
  const handleSaveAllPreviewedToBank = async () => {
    if (bulkParsedQuestions.length === 0) {
      showToast("Хадгалах тест байхгүй байна.", "error");
      return;
    }

    const questionsToSave: Question[] = bulkParsedQuestions.map((q, idx) => ({
      id: q.id.startsWith("bulk-") || q.id.startsWith("gemini-") || q.id.startsWith("parsed-")
        ? `custom-q-${Date.now()}-${idx}`
        : q.id,
      questionNumber: idx + 1,
      category: q.category,
      type: "multiple_choice",
      topic: q.topic,
      subtopic: q.topic,
      difficulty: q.cefr_level === "A2" ? "Easy" : q.cefr_level === "B1" ? "Medium" : "Hard",
      level: q.cefr_level,
      text: q.question_text.trim(),
      options: q.options.map((o) => ({
        id: o.id as "A" | "B" | "C" | "D" | "E",
        text: o.text.trim(),
      })),
      correctAnswer: q.correct_answer,
      explanation: q.explanation || "Тайлбар оруулаагүй байна.",
    } as any));

    const result = await saveBulkQuestionsToSupabase(questionsToSave, currentUser.id, targetExamId);
    onUpdateExams();
    await loadQuestions();

    showToast(`${result.count || questionsToSave.length} тест Supabase тестийн санд амжилттай хадгалагдлаа!`);
    setBulkParsedQuestions([]);
    setBulkInputText("");
    setActiveTab("browse");
  };

  // Multi-select helpers
  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedQuestionIds.length === filteredBrowseQuestions.length && filteredBrowseQuestions.length > 0) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredBrowseQuestions.map((item) => item.question.id));
    }
  };

  // Create Assignment handler
  const handleConfirmCreateAssignment = async () => {
    if (!asgTitle.trim()) {
      showToast("Даалгаврын нэрийг оруулна уу!", "error");
      return;
    }
    if (!asgClassId) {
      showToast("Зорилтот ангийг сонгоно уу!", "error");
      return;
    }
    if (selectedQuestionIds.length === 0) {
      showToast("Дор хаяж 1 асуулт сонгоно уу!", "error");
      return;
    }

    setIsSubmittingAsg(true);
    try {
      const selectedQuestions = allBankQuestions
        .filter((item) => selectedQuestionIds.includes(item.question.id))
        .map((item) => item.question);

      const targetClass = (classes || []).find((c) => c.id === asgClassId);

      await createAssignmentInSupabase({
        title: asgTitle.trim(),
        classId: asgClassId,
        className: targetClass?.name || "Анги",
        teacherId: currentUser.id,
        teacherName: currentUser.name || "Багш",
        dueDate: asgDueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        timeLimitMinutes: asgTimeLimit || 45,
        questionIds: selectedQuestionIds,
        questions: selectedQuestions,
      });

      onUpdateExams();
      showToast(`"${asgTitle}" даалгавар ${targetClass?.name || "анги"}-д амжилттай хуваарилагдаж хадгалагдлаа!`);
      setShowAssignmentModal(false);
      setSelectedQuestionIds([]);
      setAsgTitle("");
    } catch (err: any) {
      showToast(`Даалгавар үүсгэхэд алдаа гарлаа: ${err.message}`, "error");
    } finally {
      setIsSubmittingAsg(false);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Асуулт, сэдэв, тайлбараас хайх..."
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
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    browseCategory === cat
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat === "all" ? "Бүгд" : cat}
                </button>
              ))}
            </div>

            {/* CEFR Level Filter */}
            <div className="flex gap-1 overflow-x-auto">
              {["all", "A2", "B1", "B2"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setBrowseLevel(lvl)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    browseLevel === lvl
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {lvl === "all" ? "Түвшин: Бүгд" : lvl}
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

          {/* Multi-Select & Create Assignment Toolbar */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
              >
                {selectedQuestionIds.length > 0 && selectedQuestionIds.length === filteredBrowseQuestions.length ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {selectedQuestionIds.length === filteredBrowseQuestions.length && filteredBrowseQuestions.length > 0
                    ? "Бүх сонголтыг цуцлах"
                    : `Бүгдийг сонгох (${filteredBrowseQuestions.length})`}
                </span>
              </button>

              {selectedQuestionIds.length > 0 && (
                <span className="text-xs font-extrabold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                  {selectedQuestionIds.length} асуулт сонгогдсон
                </span>
              )}

              <button
                type="button"
                onClick={loadQuestions}
                disabled={isLoadingQuestions}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
                title="Supabase сангаас шинэчлэх"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuestions ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>

            {selectedQuestionIds.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAssignmentModal(true)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                <span>Даалгавар үүсгэж ангид түгээх ({selectedQuestionIds.length})</span>
              </button>
            )}
          </div>

          {/* Questions List */}
          {filteredBrowseQuestions.length > 0 ? (
            <div className="space-y-4">
              {filteredBrowseQuestions.slice(0, 50).map((item, idx) => {
                const q = item.question;
                const isSelected = selectedQuestionIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      isSelected
                        ? "border-blue-400 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Multi-Select Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleSelectQuestion(q.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Сонгох"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600 fill-blue-50" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </button>

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
      {/* TAB 3: BULK IMPORT WITH GEMINI AI & INTERACTIVE PREVIEW */}
      {/* ========================================================================= */}
      {activeTab === "bulk" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>Текстээр багцаар хуулж оруулах (Bulk Text Ingestion)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                PDF эсвэл Word-оос текстээ хуулаад Gemini AI-аар автоматаар цэвэрлүүлж, урьдчилан хянаад Supabase сандаа хадгална.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Файл оруулах (.txt)</span>
                <input
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.file || e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const content = evt.target?.result as string;
                        if (content) setBulkInputText(content);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Sample Format Info */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
            <div className="font-bold flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <span>AI Ухаалаг задлагчийн чадвар (Smart Text Cleanup):</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setBulkInputText(`1. She _______ to London three times this year.
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
Explanation: Third conditional өнгөрсөнд болоогүй зүйлийн харамсал: would have + V3.

3. By the time the movie ended, it _______ heavily outside.
A. had been raining*
B. was rained
C. rains
D. has rained
Answer: A
Explanation: Past Perfect Continuous цаг.`)
                }
                className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                Жишээ текст буулгах
              </button>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              PDF-ээс хуулах үед мөр тасарсан, сул зай алдагдсан, эсвэл А, B, C үсгүүд жигд бус байсан ч Gemini AI автоматаар цэгцэлж,
              Монгол тайлбар болон CEFR түвшинг нөхөж бүттэцтэй JSON болгон хөрвүүлнэ.
            </p>
          </div>

          {/* Textarea Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Хуулах тестүүдээ энд буулгана уу:
              </label>
              {bulkInputText && (
                <button
                  type="button"
                  onClick={() => setBulkInputText("")}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Цэвэрлэх
                </button>
              )}
            </div>

            <textarea
              rows={10}
              value={bulkInputText}
              onChange={(e) => setBulkInputText(e.target.value)}
              placeholder="PDF эсвэл Word-оос олон асуулт бүхий текстийг энд Paste хийнэ үү..."
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Action Buttons: AI Parser vs Regex Parser */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isParsingAi || !bulkInputText.trim()}
                onClick={handleParseBulkAi}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-indigo-600/25 transition-all cursor-pointer flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                {isParsingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Gemini AI задлан шинжилж байна...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>✨ AI Ухаалаг задлагч (Gemini Clean)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isParsingAi || !bulkInputText.trim()}
                onClick={handleParseBulkRegex}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Шууд энгийн дүрэмт задлагчаар задлах"
              >
                <span>⚡ Энгийн задлагч (Fast Regex)</span>
              </button>
            </div>

            {bulkParsedQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleSaveAllPreviewedToBank}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>💾 Бүгдийг санд хадгалах ({bulkParsedQuestions.length})</span>
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* INTERACTIVE PREVIEW & EDIT LIST BEFORE SAVING */}
          {/* ========================================================================= */}
          {bulkParsedQuestions.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div>
                  <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Урьдчилсан Хяналт & Засвар ({bulkParsedQuestions.length} асуулт бэлэн)</span>
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Асуулт тус бүрийн текстийг засах, зөв хариултыг өөрчлөх эсвэл хүсээгүй асуултыг устгах боломжтой.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkParsedQuestions([])}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Жагсаалтыг цэвэрлэх
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAllPreviewedToBank}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Бүгдийг санд хадгалах ({bulkParsedQuestions.length})</span>
                  </button>
                </div>
              </div>

              {/* Cards for each parsed question */}
              <div className="space-y-4">
                {bulkParsedQuestions.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 shadow-xs space-y-4 transition-colors"
                  >
                    {/* Header: Number, Category, Level, Delete button */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                          {qIdx + 1}
                        </span>

                        <select
                          value={q.category}
                          onChange={(e) => {
                            const val = e.target.value as QuestionCategory;
                            setBulkParsedQuestions((prev) =>
                              prev.map((item, idx) => (idx === qIdx ? { ...item, category: val } : item))
                            );
                          }}
                          className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                        >
                          <option value="Grammar">Grammar</option>
                          <option value="Vocabulary">Vocabulary</option>
                          <option value="Communication">Communication</option>
                          <option value="Reading">Reading</option>
                        </select>

                        <select
                          value={q.cefr_level}
                          onChange={(e) => {
                            const val = e.target.value as "A2" | "B1" | "B2";
                            setBulkParsedQuestions((prev) =>
                              prev.map((item, idx) => (idx === qIdx ? { ...item, cefr_level: val } : item))
                            );
                          }}
                          className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                        >
                          <option value="A2">A2 (Easy)</option>
                          <option value="B1">B1 (Medium)</option>
                          <option value="B2">B2 (Hard)</option>
                        </select>

                        <input
                          type="text"
                          value={q.topic}
                          placeholder="Сэдвийн нэр..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setBulkParsedQuestions((prev) =>
                              prev.map((item, idx) => (idx === qIdx ? { ...item, topic: val } : item))
                            );
                          }}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 min-w-[160px]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setBulkParsedQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Энэ асуултыг хасах"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question text textarea */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Асуултын текст:
                      </label>
                      <textarea
                        rows={2}
                        value={q.question_text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBulkParsedQuestions((prev) =>
                            prev.map((item, idx) => (idx === qIdx ? { ...item, question_text: val } : item))
                          );
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Options list with correct selector */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                        <span>Хариултууд (Зөв хариуг товшиж тэмдэглэнэ үү):</span>
                        <span className="text-emerald-600 font-extrabold">✓ Зөв хариу: [{q.correct_answer}]</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {q.options.map((opt) => {
                          const isCorrect = q.correct_answer === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => {
                                setBulkParsedQuestions((prev) =>
                                  prev.map((item, idx) =>
                                    idx === qIdx ? { ...item, correct_answer: opt.id } : item
                                  )
                                );
                              }}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                                isCorrect
                                  ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                                  : "border-slate-200 bg-slate-50 hover:bg-white"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                                  isCorrect ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                                }`}
                              >
                                {opt.id}
                              </span>

                              <input
                                type="text"
                                value={opt.text}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBulkParsedQuestions((prev) =>
                                    prev.map((item, idx) =>
                                      idx === qIdx
                                        ? {
                                            ...item,
                                            options: item.options.map((o) =>
                                              o.id === opt.id ? { ...o, text: val } : o
                                            ),
                                          }
                                        : item
                                    )
                                  );
                                }}
                                className="w-full bg-transparent border-0 text-xs font-medium text-slate-900 focus:outline-hidden p-0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Монгол тайлбар:
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        placeholder="Сурагч алдахад гарах зөвлөгөө тайлбар..."
                        onChange={(e) => {
                          const val = e.target.value;
                          setBulkParsedQuestions((prev) =>
                            prev.map((item, idx) => (idx === qIdx ? { ...item, explanation: val } : item))
                          );
                        }}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom save button */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveAllPreviewedToBank}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Бүх {bulkParsedQuestions.length} асуултыг санд хадгалах</span>
                </button>
              </div>
            </div>
          )}
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

      {/* ========================================================================= */}
      {/* CREATE & ASSIGN HOMEWORK MODAL */}
      {/* ========================================================================= */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Даалгавар Түгээх (Create Assignment)</h3>
                  <p className="text-xs text-slate-500">Сонгосон {selectedQuestionIds.length} асуултаар ангид даалгавар оноох</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignmentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Даалгаврын нэр (Assignment Title) * :
                </label>
                <input
                  type="text"
                  required
                  placeholder="Жишээ: Grammar Unit 1 Test"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Зорилтот анги (Target Class) * :
                </label>
                {classes.length > 0 ? (
                  <select
                    value={asgClassId}
                    onChange={(e) => setAsgClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="">-- Анги сонгох --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} (Код: {cls.code}) — {cls.studentIds.length} сурагчтай
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    Та одоогоор анги үүсгээгүй байна. "Багшийн Удирдлагын Төв" дээрээс эхлээд анги үүсгэнэ үү.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. Дуусах хугацаа (Due Date) * :
                  </label>
                  <input
                    type="date"
                    required
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4. Хугацааны хязгаар (минут):
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={asgTimeLimit}
                    onChange={(e) => setAsgTimeLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Энэ даалгавар нь Supabase-ийн <strong>assignments</strong> ба <strong>assignment_questions</strong> хүснэгтэд хадгалагдаж,
                  сонгосон ангийн сурагчдын dashboard дээр шууд харагдах болно.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAssignmentModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Болих
              </button>

              <button
                type="button"
                disabled={isSubmittingAsg || !asgTitle.trim() || !asgClassId}
                onClick={handleConfirmCreateAssignment}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmittingAsg ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Түгээж байна...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Даалгавар түгээх</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
