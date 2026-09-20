import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Save,
  Play,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  Bell,
  X,
  UploadCloud,
} from "lucide-react";
import { Exam, Question, QuestionCategory, QuestionOption } from "../types";

interface ManualExamEditorProps {
  initialExamType?: "past_paper" | "mock" | "practice";
  defaultYear?: number;
  defaultVariant?: "A" | "B" | "C" | "D";
  onSaveExam: (exam: Exam, sendNotification?: boolean) => void;
  onPreviewExam?: (exam: Exam) => void;
  onCancel?: () => void;
}

export const ManualExamEditor: React.FC<ManualExamEditorProps> = ({
  initialExamType = "past_paper",
  defaultYear = 2026,
  defaultVariant = "A",
  onSaveExam,
  onPreviewExam,
  onCancel,
}) => {
  const [examType, setExamType] = useState<"past_paper" | "mock" | "practice">(initialExamType);
  const [year, setYear] = useState<number>(defaultYear);
  const [variant, setVariant] = useState<"A" | "B" | "C" | "D">((defaultVariant as any) || "A");
  const [title, setTitle] = useState<string>(() => {
    if (initialExamType === "past_paper") {
      return `${defaultYear} оны ЭЕШ - Англи хэл (Хувилбар ${defaultVariant})`;
    } else if (initialExamType === "mock") {
      return `${defaultYear} оны 7 хоногийн Mock Тест #${Math.floor(Math.random() * 8) + 1}`;
    } else {
      return "Нэмэлт дасгал сорилт - Grammar & Vocabulary";
    }
  });
  const [durationMinutes, setDurationMinutes] = useState<number>(
    initialExamType === "practice" ? 30 : 80
  );
  const [readingPassage, setReadingPassage] = useState<string>("");
  const [sendNotification, setSendNotification] = useState<boolean>(initialExamType === "mock");

  // Bulk paste modal
  const [showBulkPasteModal, setShowBulkPasteModal] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>("");

  // Questions state
  const [questions, setQuestions] = useState<Question[]>(() =>
    generateStandardInitialQuestions(initialExamType, defaultYear, defaultVariant)
  );

  // Active expanded question for editing or compact view
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  function generateStandardInitialQuestions(
    type: string,
    yr: number,
    v: string
  ): Question[] {
    const count = type === "practice" ? 10 : 50;
    return Array.from({ length: count }).map((_, idx) => {
      const qNum = idx + 1;
      const isGrammar = qNum <= 15;
      const isVocab = qNum > 15 && qNum <= 28;
      const isComm = qNum > 28 && qNum <= 37;
      const isReading = qNum > 37;

      const cat: QuestionCategory = isGrammar
        ? "Grammar"
        : isVocab
        ? "Vocabulary"
        : isComm
        ? "Communication"
        : "Reading";

      const defaultAnswers: ("A" | "B" | "C" | "D" | "E")[] = ["A", "B", "C", "D", "E"];

      return {
        id: `q-manual-${Date.now()}-${idx + 1}`,
        questionNumber: qNum,
        text: isGrammar
          ? `Choose the correct item to complete the sentence (Question ${qNum}).`
          : isVocab
          ? `Select the most appropriate word to fit the context (Question ${qNum}).`
          : isComm
          ? `Select the most suitable response in the dialogue (Question ${qNum}).`
          : `According to the reading passage, what is mentioned in paragraph ${Math.min(3, Math.ceil((qNum - 37) / 4))}?`,
        category: cat,
        topic: isGrammar ? "Verb Tenses" : isVocab ? "Synonyms" : isComm ? "Everyday Dialogues" : "Reading Comprehension",
        subtopic: `Section ${cat}`,
        difficulty: (qNum % 3 === 0 ? "Hard" : qNum % 2 === 0 ? "Medium" : "Easy") as any,
        options: [
          { id: "A", text: "Сонголт A" },
          { id: "B", text: "Сонголт B" },
          { id: "C", text: "Сонголт C" },
          { id: "D", text: "Сонголт D" },
          { id: "E", text: "Сонголт E" },
        ],
        correctAnswer: defaultAnswers[idx % 5],
        explanation: `Асуулт №${qNum}: Зөв хариултын тайлбар болон дүрмийн үндэслэлийг энд бичнэ.`,
      };
    });
  }

  // Update title when type, year or variant changes if not custom edited
  const handleTypeChange = (newType: "past_paper" | "mock" | "practice") => {
    setExamType(newType);
    if (newType === "past_paper") {
      setTitle(`${year} оны ЭЕШ - Англи хэл (Хувилбар ${variant})`);
      setDurationMinutes(80);
      setSendNotification(false);
    } else if (newType === "mock") {
      setTitle(`${year} оны 7 хоногийн Mock Тест`);
      setDurationMinutes(80);
      setSendNotification(true);
    } else {
      setTitle(`${year} оны Нэмэлт дасгал сорилт`);
      setDurationMinutes(30);
      setSendNotification(false);
    }
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    if (examType === "past_paper") {
      setTitle(`${newYear} оны ЭЕШ - Англи хэл (Хувилбар ${variant})`);
    }
  };

  const handleVariantChange = (newVariant: "A" | "B" | "C" | "D") => {
    setVariant(newVariant);
    if (examType === "past_paper") {
      setTitle(`${year} оны ЭЕШ - Англи хэл (Хувилбар ${newVariant})`);
    }
  };

  // Question manipulation
  const handleAddQuestion = () => {
    const nextNum = questions.length + 1;
    const isGrammar = nextNum <= 15;
    const isVocab = nextNum > 15 && nextNum <= 28;
    const isComm = nextNum > 28 && nextNum <= 37;
    const cat: QuestionCategory = isGrammar
      ? "Grammar"
      : isVocab
      ? "Vocabulary"
      : isComm
      ? "Communication"
      : "Reading";

    const newQ: Question = {
      id: `q-manual-${Date.now()}-${nextNum}`,
      questionNumber: nextNum,
      text: "",
      category: cat,
      topic: "",
      subtopic: "",
      difficulty: "Medium",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
        { id: "E", text: "" },
      ],
      correctAnswer: "A",
      explanation: "",
    };

    setQuestions([...questions, newQ]);
    setActiveQuestionId(newQ.id);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions
      .filter((q) => q.id !== id)
      .map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    setQuestions(updated);
  };

  const handleDuplicateQuestion = (index: number) => {
    const target = questions[index];
    const duplicated: Question = {
      ...target,
      id: `q-dup-${Date.now()}`,
      questionNumber: index + 2,
    };
    const updated = [
      ...questions.slice(0, index + 1),
      duplicated,
      ...questions.slice(index + 1),
    ].map((q, idx) => ({ ...q, questionNumber: idx + 1 }));

    setQuestions(updated);
  };

  const handleUpdateQuestion = (index: number, patch: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...patch };
    setQuestions(updated);
  };

  const handleUpdateOption = (qIndex: number, optId: "A" | "B" | "C" | "D" | "E", text: string) => {
    const updated = [...questions];
    const q = updated[qIndex];
    const newOptions = q.options.map((opt) => (opt.id === optId ? { ...opt, text } : opt));
    updated[qIndex] = { ...q, options: newOptions };
    setQuestions(updated);
  };

  // Bulk text parser (Quick paste multiple questions)
  const handleParseBulkText = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    const parsedQuestions: Question[] = [];
    let currentQ: Partial<Question> | null = null;

    lines.forEach((line) => {
      // Check question number like "1." or "№1" or "Question 1"
      const qMatch = line.match(/^(?:№|\bQuestion\b)?\s*(\d+)[\.\)\:]\s*(.*)/i);
      if (qMatch) {
        if (currentQ && currentQ.text) {
          parsedQuestions.push(finalizeParsedQuestion(currentQ, parsedQuestions.length + 1));
        }
        currentQ = {
          questionNumber: parseInt(qMatch[1], 10),
          text: qMatch[2] || "",
          options: [],
          correctAnswer: "A",
          explanation: "",
          category: "Grammar",
        };
        return;
      }

      // Check options like A) ... B) ... C) ...
      const optMatch = line.match(/^([A-EА-Е])[\.\)\:]\s*(.*)/i);
      if (optMatch && currentQ) {
        const id = (optMatch[1].toUpperCase() === "А" ? "A" : optMatch[1].toUpperCase() === "В" ? "B" : optMatch[1].toUpperCase()) as any;
        if (!currentQ.options) currentQ.options = [];
        currentQ.options.push({ id, text: optMatch[2] || "" });
        return;
      }

      // Check Answer
      const ansMatch = line.match(/^(?:Answer|Хариу|Зөв|Ans|Key)\s*[:\-\s]*([A-EА-Е])/i);
      if (ansMatch && currentQ) {
        const ans = ansMatch[1].toUpperCase() === "А" ? "A" : ansMatch[1].toUpperCase() === "В" ? "B" : ansMatch[1].toUpperCase();
        currentQ.correctAnswer = ans as any;
        return;
      }

      // Check Explanation
      const expMatch = line.match(/^(?:Explanation|Тайлбар|Exp)\s*[:\-\s]*(.*)/i);
      if (expMatch && currentQ) {
        currentQ.explanation = expMatch[1];
        return;
      }

      // If just text and we have currentQ, append to question text or explanation
      if (currentQ) {
        if (!currentQ.options || currentQ.options.length === 0) {
          currentQ.text += " " + line;
        } else {
          currentQ.explanation = (currentQ.explanation ? currentQ.explanation + " " : "") + line;
        }
      }
    });

    if (currentQ && currentQ.text) {
      parsedQuestions.push(finalizeParsedQuestion(currentQ, parsedQuestions.length + 1));
    }

    if (parsedQuestions.length > 0) {
      setQuestions(parsedQuestions);
      setShowBulkPasteModal(false);
      setBulkText("");
      alert(`${parsedQuestions.length} асуулт амжилттай хөрвүүлэгдэн шивэгдлээ!`);
    } else {
      alert("Асуултын бүтэц олдсонгүй. Жишээ: '1. Question... A) ... B) ... Ans: B' форматыг ашиглана уу.");
    }
  };

  function finalizeParsedQuestion(raw: Partial<Question>, num: number): Question {
    const opts: QuestionOption[] = raw.options && raw.options.length >= 2
      ? raw.options
      : [
          { id: "A", text: "Сонголт A" },
          { id: "B", text: "Сонголт B" },
          { id: "C", text: "Сонголт C" },
          { id: "D", text: "Сонголт D" },
        ];

    const isGrammar = num <= 15;
    const isVocab = num > 15 && num <= 28;
    const isComm = num > 28 && num <= 37;
    const cat: QuestionCategory = isGrammar
      ? "Grammar"
      : isVocab
      ? "Vocabulary"
      : isComm
      ? "Communication"
      : "Reading";

    return {
      id: `q-parsed-${Date.now()}-${num}`,
      questionNumber: num,
      text: raw.text?.trim() || `Асуулт №${num}`,
      category: raw.category || cat,
      topic: raw.topic || (cat === "Grammar" ? "English Grammar" : "Vocabulary"),
      subtopic: raw.subtopic || `Part ${cat}`,
      difficulty: "Medium",
      options: opts,
      correctAnswer: (raw.correctAnswer as any) || "A",
      explanation: raw.explanation?.trim() || `Асуулт №${num}-ийн албан ёсны зөв хариулт: ${raw.correctAnswer || "A"}.`,
    };
  }

  // Construct Final Exam Object
  const buildExamObject = (): Exam => {
    return {
      id:
        examType === "past_paper"
          ? `past-esh-${year}-${variant.toLowerCase()}`
          : examType === "mock"
          ? `mock-weekly-${Date.now()}`
          : `practice-${Date.now()}`,
      title: title.trim() || `${year} оны ЭЕШ Шалгалт`,
      year,
      variant: examType === "past_paper" ? variant : "Mock",
      type: examType,
      durationMinutes,
      totalQuestions: questions.length,
      readingPassage: readingPassage.trim() || undefined,
      questions,
      status: "published",
      createdBy: "admin",
      createdByName: "Админ",
      createdAt: new Date().toISOString(),
    };
  };

  const handleSave = () => {
    if (questions.length === 0) {
      alert("Ядаж 1 асуулт оруулна уу!");
      return;
    }
    const exam = buildExamObject();
    onSaveExam(exam, sendNotification);
  };

  const handlePreview = () => {
    if (questions.length === 0) {
      alert("Шалгахад ядаж 1 асуулт оруулна уу!");
      return;
    }
    const exam = buildExamObject();
    if (onPreviewExam) {
      onPreviewExam(exam);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-8 animate-in fade-in">
      {/* Top Header & Type Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>ГАРААР ШИВЖ ОРУУЛАХ СТУДИ</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Шалгалт & Сорилтыг Гараар Шивж Нийтлэх
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Админ бүх асуулт, сонголтууд, зөв хариултын түлхүүр болон монгол тайлбарыг гараараа нарийн шивж, системд шууд ажиллахаар нийтэлнэ.
          </p>
        </div>

        {/* Type selector buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold self-start lg:self-auto">
          <button
            onClick={() => handleTypeChange("past_paper")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              examType === "past_paper"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Өмнөх оны ЭЕШ (2006–2026)</span>
          </button>

          <button
            onClick={() => handleTypeChange("mock")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              examType === "mock"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>7 хоногийн Mock тест</span>
          </button>

          <button
            onClick={() => handleTypeChange("practice")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              examType === "practice"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Нэмэлт дасгал (Practice)</span>
          </button>
        </div>
      </div>

      {/* Exam Meta Info Form */}
      <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>1. Шалгалтын Үндсэн Мэдээлэл</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Шалгалтын гарчиг
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жишээ: 2026 оны ЭЕШ - Хувилбар A..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ЭЕШ Он (2006–2026)
            </label>
            <select
              value={year}
              onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {Array.from({ length: 21 }, (_, i) => 2026 - i).map((y) => (
                <option key={y} value={y}>
                  {y} он
                </option>
              ))}
            </select>
          </div>

          {examType === "past_paper" ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Хувилбар (Variant)
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(["A", "B", "C", "D"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleVariantChange(v)}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      variant === v
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Үргэлжлэх хугацаа (минут)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 80)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Optional Reading passage */}
        <div className="pt-2">
          <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Эх бичвэр (Reading Passage - Сонголттой)</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Унших дасгалын асуултууд дээр харагдах нийтлэг эх
            </span>
          </label>
          <textarea
            rows={3}
            value={readingPassage}
            onChange={(e) => setReadingPassage(e.target.value)}
            placeholder="Хэрэв тус шалгалтад унших эх бичвэр байгаа бол энд оруулна уу..."
            className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none font-serif"
          />
        </div>

        {/* Mock Notification toggle */}
        {examType === "mock" && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-indigo-600" />
              <div>
                <div className="text-xs font-bold text-indigo-950">
                  Багш болон сурагчдад шууд мэдэгдэл илгээх
                </div>
                <div className="text-[11px] text-indigo-700">
                  Нийтэлсэн даруйд хэрэглэгчдийн хонх мэдэгдэлд очиж, өмнөх mock архивт орно.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Questions Section Header & Fast Tools */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>2. Асуултуудын Жагсаалт</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                {questions.length} асуулт
              </span>
            </h3>
            <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500">
              <span className="text-blue-600 font-bold">Grammar (1-15)</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">Vocab (16-28)</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">Comm (29-37)</span>
              <span>•</span>
              <span className="text-purple-600 font-bold">Reading (38-50)</span>
            </div>
          </div>

          {/* Quick tool buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkPasteModal(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-purple-200"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Текстээр хуулж оруулах</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setQuestions(generateStandardInitialQuestions(examType, year, variant));
                alert(`50 асуултын стандарт бүтэц үүсгэгдлээ. Та асуулт бүрийн текстийг засна уу.`);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>50 тестийн загвар ачаалах</span>
            </button>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Асуулт нэмэх</span>
            </button>
          </div>
        </div>

        {/* Questions Editor List */}
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isExpanded = activeQuestionId === q.id || questions.length <= 10 || idx < 3;
            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Question Item Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      №{q.questionNumber}
                    </span>

                    <select
                      value={q.category}
                      onChange={(e) =>
                        handleUpdateQuestion(idx, { category: e.target.value as any })
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Grammar">Grammar (Дүрэм)</option>
                      <option value="Vocabulary">Vocabulary (Үгийн сан)</option>
                      <option value="Communication">Communication (Харилцан яриа)</option>
                      <option value="Reading">Reading (Эх унших)</option>
                    </select>

                    <input
                      type="text"
                      value={q.topic}
                      onChange={(e) => handleUpdateQuestion(idx, { topic: e.target.value })}
                      placeholder="Сэдэв (ж нь: Conditionals, Phrasal Verbs)..."
                      className="hidden sm:block px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 w-48 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(idx)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Хувилах (Duplicate)"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Устгах"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Text Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Асуултын өгүүлбэр / Даалгаврын текст:
                  </label>
                  <textarea
                    rows={2}
                    value={q.text}
                    onChange={(e) => handleUpdateQuestion(idx, { text: e.target.value })}
                    placeholder="Жишээ: If she ________ harder, she would have passed the exam."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-medium leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Options and Correct Answer Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Сонголтууд ба Зөв хариулт (Зөв хариултыг дугуйлж сонгоно уу):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {q.options.map((opt) => {
                      const isCorrect = q.correctAnswer === opt.id;
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                            isCorrect
                              ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400"
                              : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQuestion(idx, { correctAnswer: opt.id as any })
                            }
                            className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 transition-all ${
                              isCorrect
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-200"
                            }`}
                            title={`Сонголт ${opt.id}-г зөв хариултаар тохируулах`}
                          >
                            {opt.id}
                          </button>

                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleUpdateOption(idx, opt.id, e.target.value)}
                            placeholder={`Сонголт ${opt.id}...`}
                            className="w-full bg-transparent text-xs text-slate-900 font-medium focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mongolian Explanation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Монгол тайлбар (Сурагч буруу хийхэд эсвэл хариугаа шалгахад харагдана):
                  </label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => handleUpdateQuestion(idx, { explanation: e.target.value })}
                    placeholder="Жишээ: Third conditional бүтэц нь 'If + had + V3' байдаг тул had studied зөв."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Add question bottom shortcut */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="px-6 py-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 font-bold text-xs flex items-center gap-2 transition-all w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Шинэ асуулт нэмэх (№{questions.length + 1})</span>
          </button>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black">
            {questions.length}
          </div>
          <div>
            <div className="text-xs font-black">
              {title}
            </div>
            <div className="text-[11px] text-slate-300">
              {examType === "past_paper"
                ? `${year} он • Хувилбар ${variant}`
                : examType === "mock"
                ? "7 хоногийн албан ёсны сорилт"
                : "Нэмэлт дасгал сорилт"} • {durationMinutes} минут
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-bold transition-colors"
            >
              Болих
            </button>
          )}

          {onPreviewExam && (
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Шууд туршиж шалгах</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Шалгалтын Санд Нийтлэх</span>
          </button>
        </div>
      </div>

      {/* Bulk Paste Modal */}
      {showBulkPasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Текстээр багцаар нь хуулж оруулах
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Word, текст файл эсвэл PDF-ээс хуулсан асуултуудаа шууд энд нааж оруулаарай.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkPasteModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Асуултуудын текст (Жишээ формат):
              </label>
              <textarea
                rows={10}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`1. She ________ to the library yesterday.
A) go
B) went
C) gone
D) going
Answer: B
Explanation: Өнгөрсөн цагийн өгүүлбэр тул went зөв.

2. Which word means 'substantial'?
A) small
B) significant
C) tiny
D) narrow
Answer: B
Explanation: Significant нь substantial гэдэгтэй ижил утгатай.`}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBulkPasteModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={handleParseBulkText}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Асуултуудыг Хөрвүүлж Оруулах</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
