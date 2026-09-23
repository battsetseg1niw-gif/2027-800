import React, { useState, useMemo } from "react";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Search,
  Copy,
  Check,
  Edit3,
  HelpCircle,
  Upload,
  Info,
  Send,
  Plus,
  Trash2,
  Brain,
  ShieldCheck,
  CheckCheck,
  Award,
  BookOpen,
  Calendar,
} from "lucide-react";

export interface ParseMismatch {
  questionNumber: number;
  expected: string;
  actual: string;
  severity: "error" | "warning" | "info";
  reason: string;
}

export interface ParsedQuestionItem {
  questionNumber: number;
  text: string;
  category: string;
  topic: string;
  subtopic: string;
  correctAnswer: string;
  confidence: number;
  isAmbiguous: boolean;
  explanation: string;
  options?: Array<{ id: string; text: string }>;
  rawSnippet?: string;
}

export interface OMRDebugUtilityProps {
  rawOcrText: string;
  onRawOcrTextChange: (text: string) => void;
  aiQuestionsList: ParsedQuestionItem[];
  onAiQuestionsChange: (questions: ParsedQuestionItem[]) => void;
  answerKeys: Record<number, string>;
  onAnswerKeyChange: (keys: Record<number, string>) => void;
  parseMismatches: ParseMismatch[];
  isAnalyzing: boolean;
  analysisStep: string;
  onReanalyze: (rawText?: string) => void;
  onSaveExam: () => void;
  examTitle: string;
  onExamTitleChange: (title: string) => void;
  examVariant: "A" | "B" | "C" | "D";
  onExamVariantChange: (variant: "A" | "B" | "C" | "D") => void;
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
  onFileUpload: (file: File) => void;
  pdfFileName: string;
  onLoadPreset: (type: "tag_questions_15" | "esh_2024_50" | "short_quiz_10") => void;
  examCategory?: "past_paper" | "mock" | "practice";
  onExamCategoryChange?: (cat: "past_paper" | "mock" | "practice") => void;
  examYear?: number;
  onExamYearChange?: (year: number) => void;
}

export const OMRDebugUtility: React.FC<OMRDebugUtilityProps> = ({
  rawOcrText,
  onRawOcrTextChange,
  aiQuestionsList,
  onAiQuestionsChange,
  answerKeys,
  onAnswerKeyChange,
  parseMismatches,
  isAnalyzing,
  analysisStep,
  onReanalyze,
  onSaveExam,
  examTitle,
  onExamTitleChange,
  examVariant,
  onExamVariantChange,
  questionCount,
  onQuestionCountChange,
  onFileUpload,
  pdfFileName,
  onLoadPreset,
  examCategory = "past_paper",
  onExamCategoryChange,
  examYear = 2024,
  onExamYearChange,
}) => {
  const [viewMode, setViewMode] = useState<"formatted" | "edit">("formatted");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterMismatchOnly, setFilterMismatchOnly] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);
  const [batchKeyInput, setBatchKeyInput] = useState<string>("");
  const [showBatchKeyBox, setShowBatchKeyBox] = useState<boolean>(false);
  const [activeQuestionInspect, setActiveQuestionInspect] = useState<number | null>(null);

  // Editing state per question
  const [editingQuestionNum, setEditingQuestionNum] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{
    text: string;
    category: string;
    topic: string;
    options: Array<{ id: string; text: string }>;
    explanation: string;
  } | null>(null);

  // Manual verification tracking (teacher checked questions)
  const [verifiedSet, setVerifiedSet] = useState<Set<number>>(new Set());

  // Single Question AI Analysis state
  const [aiAnalyzingQuestionNum, setAiAnalyzingQuestionNum] = useState<number | null>(null);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<
    Record<
      number,
      {
        recommendedAnswer: string;
        explanation: string;
        confidence?: number;
        ruleTopic?: string;
      }
    >
  >({});

  // Batch AI Audit state
  const [isBatchAuditing, setIsBatchAuditing] = useState(false);
  const [batchAuditSummary, setBatchAuditSummary] = useState<string | null>(null);

  // Split lines for line-numbered view
  const rawLines = useMemo(() => {
    return rawOcrText ? rawOcrText.split(/\r?\n/) : [];
  }, [rawOcrText]);

  // Copy raw OCR text to clipboard
  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawOcrText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  // Quick apply batch key string (e.g. "1B 2B 3A 4A..." or "B, B, A, A, B...")
  const handleApplyBatchKeys = () => {
    if (!batchKeyInput.trim()) return;
    const newKeys = { ...answerKeys };
    const clean = batchKeyInput.trim();

    // Check if it's format "1A 2B" or "1-A 2-B"
    const pairRegex = /([0-9]{1,2})\s*[\.:\-=\)]\s*([A-Ea-e])/g;
    let match;
    let foundPairs = 0;
    while ((match = pairRegex.exec(clean)) !== null) {
      const qNum = parseInt(match[1], 10);
      const opt = match[2].toUpperCase();
      if (qNum >= 1 && qNum <= questionCount) {
        newKeys[qNum] = opt;
        foundPairs++;
      }
    }

    // If no pairs found, parse sequential letters (e.g. "A B C D E" or "ABCDE")
    if (foundPairs === 0) {
      const letters = clean.replace(/[^A-Ea-e]/g, "").toUpperCase();
      for (let i = 0; i < letters.length && i < questionCount; i++) {
        newKeys[i + 1] = letters[i];
      }
    }

    onAnswerKeyChange(newKeys);

    // Update in aiQuestionsList as well
    const updated = aiQuestionsList.map((item) => {
      const key = newKeys[item.questionNumber];
      return key ? { ...item, correctAnswer: key } : item;
    });
    onAiQuestionsChange(updated);

    setShowBatchKeyBox(false);
    setBatchKeyInput("");
  };

  // Toggle single question verified status
  const handleToggleVerified = (qNum: number) => {
    setVerifiedSet((prev) => {
      const next = new Set(prev);
      if (next.has(qNum)) {
        next.delete(qNum);
      } else {
        next.add(qNum);
      }
      return next;
    });
  };

  // Mark all questions as verified
  const handleVerifyAll = () => {
    const all = new Set<number>();
    for (let i = 1; i <= questionCount; i++) {
      all.add(i);
    }
    setVerifiedSet(all);
  };

  // Start editing a specific question
  const handleStartEdit = (q: ParsedQuestionItem) => {
    setEditingQuestionNum(q.questionNumber);
    setEditFormData({
      text: q.text,
      category: q.category || "Grammar",
      topic: q.topic || "English Structure",
      options: q.options && q.options.length > 0
        ? [...q.options]
        : [
            { id: "A", text: "Сонголт A" },
            { id: "B", text: "Сонголт B" },
            { id: "C", text: "Сонголт C" },
            { id: "D", text: "Сонголт D" },
          ],
      explanation: q.explanation || "",
    });
  };

  // Save changes to the edited question
  const handleSaveEdit = (qNum: number) => {
    if (!editFormData) return;
    const updated = aiQuestionsList.map((item) => {
      if (item.questionNumber === qNum) {
        return {
          ...item,
          text: editFormData.text,
          category: editFormData.category,
          topic: editFormData.topic,
          options: editFormData.options,
          explanation: editFormData.explanation,
        };
      }
      return item;
    });
    onAiQuestionsChange(updated);
    setEditingQuestionNum(null);
    setEditFormData(null);
    // Auto-mark as verified since teacher personally edited it
    setVerifiedSet((prev) => new Set(prev).add(qNum));
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingQuestionNum(null);
    setEditFormData(null);
  };

  // Single Question AI Grammar & Answer Analysis
  const handleRunAiExplainQuestion = async (q: ParsedQuestionItem) => {
    setAiAnalyzingQuestionNum(q.questionNumber);
    try {
      const res = await fetch("/api/exam/ai-explain-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionNumber: q.questionNumber,
          text: q.text,
          options: q.options || [],
          currentAnswer: answerKeys[q.questionNumber] || q.correctAnswer || "A",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAnalysisResults((prev) => ({
          ...prev,
          [q.questionNumber]: {
            recommendedAnswer: data.recommendedAnswer,
            explanation: data.explanation,
            confidence: data.confidence,
            ruleTopic: data.ruleTopic,
          },
        }));
        // Auto open inspection view to see explanation
        setActiveQuestionInspect(q.questionNumber);
      }
    } catch (e) {
      console.warn("AI explain failed:", e);
    } finally {
      setAiAnalyzingQuestionNum(null);
    }
  };

  // Apply AI recommended answer to the question
  const handleApplyAiRecommendedAnswer = (qNum: number) => {
    const aiRes = aiAnalysisResults[qNum];
    if (!aiRes) return;
    onAnswerKeyChange({
      ...answerKeys,
      [qNum]: aiRes.recommendedAnswer,
    });
    const updated = aiQuestionsList.map((item) => {
      if (item.questionNumber === qNum) {
        return {
          ...item,
          correctAnswer: aiRes.recommendedAnswer,
          explanation: aiRes.explanation,
          topic: aiRes.ruleTopic || item.topic,
        };
      }
      return item;
    });
    onAiQuestionsChange(updated);
    setVerifiedSet((prev) => new Set(prev).add(qNum));
  };

  // Run Batch AI Audit for entire exam
  const handleRunBatchAudit = async () => {
    setIsBatchAuditing(true);
    setBatchAuditSummary(null);
    try {
      const payload = aiQuestionsList.map((q) => ({
        questionNumber: q.questionNumber,
        text: q.text,
        options: q.options,
        correctAnswer: answerKeys[q.questionNumber] || q.correctAnswer || "A",
      }));

      const res = await fetch("/api/exam/ai-batch-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examTitle,
          questions: payload,
        }),
      });
      const data = await res.json();
      if (data.success && data.verifiedQuestions) {
        setBatchAuditSummary(data.summary || "Бүх асуултын түлхүүр дүрмийн дагуу шалгагдлаа.");
        // If there are corrections or suggestions, apply them
        const newKeys = { ...answerKeys };
        data.verifiedQuestions.forEach((vq: any) => {
          if (vq.correctAnswer) {
            newKeys[vq.questionNumber] = vq.correctAnswer;
          }
          if (vq.recommendedAnswer) {
            setAiAnalysisResults((prev) => ({
              ...prev,
              [vq.questionNumber]: {
                recommendedAnswer: vq.recommendedAnswer,
                explanation: vq.explanation || "AI дүрмийн дагуу баталгаажсан.",
              },
            }));
          }
        });
        onAnswerKeyChange(newKeys);
      }
    } catch (e: any) {
      console.warn("Batch audit error:", e);
      setBatchAuditSummary("AI шинжилгээ хийхэд холболтын саатал гарлаа. Гараар шалгана уу.");
    } finally {
      setIsBatchAuditing(false);
    }
  };

  // Mismatch mappings
  const mismatchMap = useMemo(() => {
    const map = new Map<number, ParseMismatch>();
    parseMismatches.forEach((m) => {
      map.set(m.questionNumber, m);
    });
    return map;
  }, [parseMismatches]);

  const errorCount = parseMismatches.filter((m) => m.severity === "error").length;
  const warningCount = parseMismatches.filter((m) => m.severity === "warning").length;

  // Filtered questions for the right panel
  const displayedQuestions = useMemo(() => {
    let list = aiQuestionsList;
    if (list.length === 0) {
      list = [];
      for (let i = 1; i <= questionCount; i++) {
        list.push({
          questionNumber: i,
          text: `Асуулт ${i}`,
          category: i <= 22 ? "Grammar" : i <= 36 ? "Vocabulary" : i <= 42 ? "Communication" : "Reading",
          topic: "General English",
          subtopic: "Standard Usage",
          correctAnswer: answerKeys[i] || "A",
          confidence: 0.9,
          isAmbiguous: false,
          explanation: "Зөв хариуг багш тохируулж болно.",
          options: [
            { id: "A", text: "Сонголт A" },
            { id: "B", text: "Сонголт B" },
            { id: "C", text: "Сонголт C" },
            { id: "D", text: "Сонголт D" },
          ],
        });
      }
    }

    return list.filter((q) => {
      if (filterMismatchOnly) {
        return mismatchMap.has(q.questionNumber) || q.isAmbiguous;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          q.text.toLowerCase().includes(term) ||
          q.topic.toLowerCase().includes(term) ||
          q.questionNumber.toString() === term ||
          (q.options && q.options.some((o) => o.text.toLowerCase().includes(term)))
        );
      }
      return true;
    });
  }, [aiQuestionsList, questionCount, filterMismatchOnly, searchTerm, mismatchMap, answerKeys]);

  const verifiedCount = verifiedSet.size;
  const verifiedPercent = Math.round((verifiedCount / questionCount) * 100);

  return (
    <div className="space-y-6" id="omr-debug-utility-root">
      {/* Top Banner & Destination Digital Exam Setup */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>PDF Тест Оруулах & Цахим Шалгалт Болгох Студи</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              PDF-ээс Цахим Шалгалт Үүсгэх & Зөв Хариулт Давхар Хянах
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Өмнөх оны ЭЕШ, Мок шалгалт эсвэл дасгал сорилын PDF материалыг хуулан цахим шалгалт болгон хувиргана. Асуулт, сонголтуудыг засах, зөв хариуг гараар тохируулах болон хиймэл оюунаар дүрмийн шинжилгээ хийлгэж давхар шалгана.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600">Шуурхай загварууд:</span>
            <button
              type="button"
              onClick={() => onLoadPreset("tag_questions_15")}
              className="px-3 py-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl border border-amber-300 shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span>🏷️ Tag Questions (15 тест)</span>
            </button>
            <button
              type="button"
              onClick={() => onLoadPreset("esh_2024_50")}
              className="px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl border border-indigo-200 shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span>📘 ЭЕШ 2024 Англи хэл (50 тест)</span>
            </button>
          </div>
        </div>

        {/* Exam Metadata & Digitalization Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Шалгалтын ангилал</span>
            </label>
            <select
              value={examCategory}
              onChange={(e) => onExamCategoryChange && onExamCategoryChange(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="past_paper">📘 Өмнөх оны ЭЕШ (Архив)</option>
              <option value="mock">⚡ 7 хоногийн Mock шалгалт</option>
              <option value="practice">🎯 Нэмэлт дасгал сорилт</option>
            </select>
          </div>

          {/* Year */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Хичээлийн он</span>
            </label>
            <select
              value={examYear}
              onChange={(e) => onExamYearChange && onExamYearChange(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                <option key={y} value={y}>
                  {y} он
                </option>
              ))}
            </select>
          </div>

          {/* Exam Title */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-bold text-slate-700">Шалгалтын Нэр (Гарчиг)</label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => onExamTitleChange(e.target.value)}
              placeholder="Жишээ: ЭЕШ 2024 Англи хэл - Хувилбар A"
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Variant and Count */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Хувилбар</label>
              <select
                value={examVariant}
                onChange={(e) => onExamVariantChange(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="A">Хувилбар A</option>
                <option value="B">Хувилбар B</option>
                <option value="C">Хувилбар C</option>
                <option value="D">Хувилбар D</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Даалгавар</label>
              <select
                value={questionCount}
                onChange={(e) => onQuestionCountChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10 тест</option>
                <option value={15}>15 тест</option>
                <option value={20}>20 тест</option>
                <option value={30}>30 тест</option>
                <option value={40}>40 тест</option>
                <option value={50}>50 тест (ЭЕШ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Toolbar: File upload, AI batch check, Batch key drawer, Publish button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Upload PDF / File */}
            <label className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>{pdfFileName ? `Файл: ${pdfFileName}` : "PDF / Текст Оруулах"}</span>
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(file);
                }}
                className="hidden"
              />
            </label>

            {/* Run AI Batch Review */}
            <button
              type="button"
              onClick={handleRunBatchAudit}
              disabled={isBatchAuditing}
              className="px-3.5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl shadow-xs flex items-center gap-2 transition-all"
            >
              {isBatchAuditing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Шинжилж байна...</span>
                </>
              ) : (
                <>
                  <Brain className="w-3.5 h-3.5" />
                  <span>Бүх асуултыг AI-аар хянах</span>
                </>
              )}
            </button>

            {/* Batch Key Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowBatchKeyBox(!showBatchKeyBox)}
              className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Шуурхай түлхүүр оруулах (1A 2B...)</span>
            </button>

            {/* Verify All Button */}
            <button
              type="button"
              onClick={handleVerifyAll}
              className="px-3 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300 flex items-center gap-1.5 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Бүгдийг баталгаажуулах</span>
            </button>
          </div>

          {/* Action: Publish as Digital Exam */}
          <button
            type="button"
            onClick={onSaveExam}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Цахим Шалгалт Болгон Системд Нийтлэх</span>
          </button>
        </div>

        {/* Batch Key Input Drawer */}
        {showBatchKeyBox && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Шуурхай түлхүүр оруулах хэсэг (Batch Key Input)</span>
              </h4>
              <span className="text-[11px] text-indigo-700">
                Жишээ: &quot;1A 2B 3C...&quot; эсвэл цуваа &quot;ABCDABCD...&quot;
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={batchKeyInput}
                onChange={(e) => setBatchKeyInput(e.target.value)}
                placeholder="1B 2D 3A 4C 5A 6E 7B 8C..."
                className="flex-1 px-3 py-2 text-xs font-mono font-medium rounded-xl border border-indigo-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleApplyBatchKeys}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Хэрэгжүүлэх</span>
              </button>
            </div>
          </div>
        )}

        {/* AI Batch Summary if present */}
        {batchAuditSummary && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Brain className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-purple-950">AI Шинжилгээний Дүгнэлт:</h4>
                <p className="text-xs text-purple-800 mt-0.5 leading-relaxed">{batchAuditSummary}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBatchAuditSummary(null)}
              className="text-purple-600 hover:text-purple-900 text-xs font-bold"
            >
              Хаах
            </button>
          </div>
        )}

        {/* Status & Verification Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Багшийн хяналт баталгаажуулалт: {verifiedCount} / {questionCount} асуулт</span>
            </span>
            <span className={verifiedPercent === 100 ? "text-emerald-600" : "text-indigo-600"}>
              {verifiedPercent}% баталгаажсан
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                verifiedPercent === 100 ? "bg-emerald-500" : "bg-indigo-600"
              }`}
              style={{ width: `${verifiedPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analysis Loading State */}
      {isAnalyzing && (
        <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center gap-4 animate-pulse">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-indigo-950">
              Хиймэл Оюун Ухаан Шалгалтын PDF-г задлан шинжилж байна...
            </h4>
            <p className="text-xs text-indigo-700">{analysisStep || "Асуулт, сонголтууд болон түлхүүрийг гарган авч байна."}</p>
          </div>
        </div>
      )}

      {/* Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: RAW TEXT / OCR INSPECTOR (5 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col h-[780px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>PDF Эх Текст & OCR Уншилт</span>
              </h3>
              <p className="text-[11px] text-slate-600">
                {rawLines.length} мөр бичвэр танигдсан
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyRaw}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1 transition-colors"
                title="Бүх текстийг хуулах"
              >
                {copiedRaw ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRaw ? "Хуулагдлаа" : "Хуулах"}</span>
              </button>

              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setViewMode("formatted")}
                  className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                    viewMode === "formatted"
                      ? "bg-white text-indigo-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Мөрөөр
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                    viewMode === "edit"
                      ? "bg-white text-indigo-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Засах
                </button>
              </div>
            </div>
          </div>

          {/* Raw Text Viewer */}
          <div className="flex-1 overflow-auto mt-3 font-mono text-[11px] bg-slate-950 text-slate-200 p-3 rounded-2xl border border-slate-800">
            {viewMode === "edit" ? (
              <textarea
                value={rawOcrText}
                onChange={(e) => onRawOcrTextChange(e.target.value)}
                placeholder="PDF эсвэл шалгалтын текстийг энд буулгаж болно..."
                className="w-full h-full bg-transparent text-slate-100 font-mono text-xs focus:outline-hidden resize-none"
              />
            ) : (
              <div className="space-y-1">
                {rawLines.length === 0 ? (
                  <div className="text-slate-500 italic p-4 text-center">
                    Баримтын эх бичвэр одоогоор уншигдаагүй байна. Дээрх &apos;Туршилтын баримт&apos; товч дарж эсвэл PDF файл оруулна уу.
                  </div>
                ) : (
                  rawLines.map((line, idx) => {
                    const isQuestionStart = /^\s*(?:№|Q|Question)?\s*[0-9]{1,2}[\.\)\-:]/i.test(line);
                    const isOptionLine = /^\s*[\(\[]?[A-E][\.\)\:\]]/i.test(line);
                    const isKeyLine = /^(?:answers?|keys?|хариу|түлхүүр)/i.test(line);

                    return (
                      <div
                        key={`raw-line-${idx}`}
                        className={`flex items-start gap-2.5 py-0.5 px-1 rounded-sm hover:bg-slate-800/80 transition-colors ${
                          isQuestionStart
                            ? "bg-indigo-950/60 text-indigo-300 font-bold border-l-2 border-indigo-500"
                            : isOptionLine
                            ? "text-emerald-300"
                            : isKeyLine
                            ? "bg-amber-950/60 text-amber-300 font-bold"
                            : "text-slate-300"
                        }`}
                      >
                        <span className="w-8 text-right text-slate-600 select-none text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="break-all whitespace-pre-wrap flex-1">{line || " "}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="pt-3 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Цэнхэр = Даалгавар, Ногоон = Сонголтууд</span>
            </span>
            {viewMode === "edit" && (
              <button
                type="button"
                onClick={() => onReanalyze(rawOcrText)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
              >
                Текстийг дахин задлах
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: QUESTION STRUCTURE, OPTIONS, EDIT & AI REVIEW (7 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col h-[780px]">
          {/* Header & Filter Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Асуултууд & Зөв Хариултын Хяналт</h3>
              <p className="text-[11px] text-slate-600">
                Хариултын түлхүүрийг 1 товшилтоор сонгож, асуулт сонголтыг засах, AI дүрмийн тайлбар харах
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterMismatchOnly(!filterMismatchOnly)}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition-all ${
                  filterMismatchOnly
                    ? "bg-amber-100 text-amber-900 border-amber-300 shadow-2xs"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                Зөвхөн анхааруулга ({warningCount + errorCount})
              </button>
            </div>
          </div>

          {/* Search bar inside structure */}
          <div className="py-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Даалгаврын дугаар эсвэл сэдвээр хайх..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Question Items List */}
          <div className="flex-1 overflow-auto space-y-3 pr-1">
            {displayedQuestions.map((q) => {
              const qNum = q.questionNumber;
              const activeKey = answerKeys[qNum] || q.correctAnswer || "A";
              const mismatch = mismatchMap.get(qNum);
              const isWarning = mismatch || q.isAmbiguous || (q.confidence && q.confidence < 0.8);
              const isInspected = activeQuestionInspect === qNum;
              const isEditing = editingQuestionNum === qNum;
              const isVerified = verifiedSet.has(qNum);
              const aiInsight = aiAnalysisResults[qNum];
              const isAiAnalyzing = aiAnalyzingQuestionNum === qNum;

              return (
                <div
                  key={`debug-q-${qNum}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    isVerified
                      ? "border-emerald-300 bg-emerald-50/20 shadow-2xs"
                      : isWarning
                      ? "border-amber-300 bg-amber-50/40"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  {/* Card Header & Controls */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {qNum}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                          {q.category} • {q.topic}
                        </span>

                        {/* Verified Pill Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleVerified(qNum)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                            isVerified
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isVerified ? "Баталгаажсан" : "Баталгаажуулах"}</span>
                        </button>

                        {isWarning && !isVerified && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>{mismatch ? mismatch.actual : "Нягтлах шаардлагатай"}</span>
                          </span>
                        )}
                      </div>

                      {/* Question Text (Editable or View) */}
                      {isEditing && editFormData ? (
                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] font-bold text-slate-600">Асуултын текст засах:</label>
                          <textarea
                            value={editFormData.text}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, text: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs font-semibold text-slate-900 border border-indigo-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            rows={2}
                          />

                          {/* Editable Options */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-slate-600">Сонголтууд (A-E):</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextId = String.fromCharCode(65 + editFormData.options.length);
                                  if (editFormData.options.length < 5) {
                                    setEditFormData({
                                      ...editFormData,
                                      options: [
                                        ...editFormData.options,
                                        { id: nextId, text: `Сонголт ${nextId}` },
                                      ],
                                    });
                                  }
                                }}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Сонголт нэмэх</span>
                              </button>
                            </div>

                            <div className="space-y-1">
                              {editFormData.options.map((opt, optIdx) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <span className="w-6 font-mono font-bold text-xs text-slate-700">
                                    {opt.id})
                                  </span>
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => {
                                      const newOpts = [...editFormData.options];
                                      newOpts[optIdx] = { ...opt, text: e.target.value };
                                      setEditFormData({ ...editFormData, options: newOpts });
                                    }}
                                    className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                                  />
                                  {editFormData.options.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newOpts = editFormData.options.filter(
                                          (_, i) => i !== optIdx
                                        );
                                        setEditFormData({ ...editFormData, options: newOpts });
                                      }}
                                      className="p-1 text-slate-400 hover:text-red-600"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Save / Cancel Edit Controls */}
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(qNum)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Хадгалах</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                            >
                              Болих
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-slate-800 pt-1 leading-relaxed">
                          {q.text}
                        </div>
                      )}

                      {/* Display Options list */}
                      {!isEditing && q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                          {q.options.map((opt) => {
                            const isCorrectOpt = activeKey === opt.id;
                            return (
                              <button
                                key={`opt-item-${qNum}-${opt.id}`}
                                type="button"
                                onClick={() => {
                                  onAnswerKeyChange({
                                    ...answerKeys,
                                    [qNum]: opt.id,
                                  });
                                  const updated = aiQuestionsList.map((item) =>
                                    item.questionNumber === qNum
                                      ? { ...item, correctAnswer: opt.id }
                                      : item
                                  );
                                  onAiQuestionsChange(updated);
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 font-medium border text-left transition-all ${
                                  isCorrectOpt
                                    ? "bg-emerald-100 text-emerald-950 border-emerald-400 font-bold shadow-2xs ring-1 ring-emerald-400"
                                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                <span className={`font-mono font-black ${isCorrectOpt ? "text-emerald-700" : "text-slate-500"}`}>
                                  {opt.id})
                                </span>
                                <span className="truncate flex-1">{opt.text}</span>
                                {isCorrectOpt && (
                                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right side: Key Pill Selector & Action buttons */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Зөв түлхүүр
                      </span>
                      {/* Answer Key Selector Pills */}
                      <div className="flex gap-1">
                        {(["A", "B", "C", "D", "E"] as const).map((opt) => {
                          const isSelected = activeKey === opt;
                          return (
                            <button
                              key={`debug-pill-${qNum}-${opt}`}
                              type="button"
                              onClick={() => {
                                onAnswerKeyChange({
                                  ...answerKeys,
                                  [qNum]: opt,
                                });
                                const updated = aiQuestionsList.map((item) =>
                                  item.questionNumber === qNum
                                    ? { ...item, correctAnswer: opt }
                                    : item
                                );
                                onAiQuestionsChange(updated);
                              }}
                              className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                                isSelected
                                  ? "bg-emerald-600 text-white shadow-xs scale-105"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Tool Action Buttons: Edit, AI Analyze, Explanation Toggle */}
                      <div className="flex items-center gap-1 mt-1">
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(q)}
                            className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center gap-1"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>Засах</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRunAiExplainQuestion(q)}
                          disabled={isAiAnalyzing}
                          className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-md flex items-center gap-1"
                          title="Хиймэл оюунаар асуултыг шинжлүүлж, зөв хариуг батлах"
                        >
                          {isAiAnalyzing ? (
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Brain className="w-2.5 h-2.5 text-purple-600" />
                          )}
                          <span>AI Шинжилгээ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveQuestionInspect(isInspected ? null : qNum)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                          title="Тайлбар харах / хаах"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation Banner if analyzed */}
                  {aiInsight && (
                    <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-purple-950">
                        <span className="flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-purple-600" />
                          <span>AI Зөвлөмж: Зөв хариу нь &quot;{aiInsight.recommendedAnswer}&quot;</span>
                        </span>
                        {activeKey !== aiInsight.recommendedAnswer && (
                          <button
                            type="button"
                            onClick={() => handleApplyAiRecommendedAnswer(qNum)}
                            className="px-2 py-0.5 text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-2xs"
                          >
                            Энэ түлхүүрийг сонгох ({aiInsight.recommendedAnswer})
                          </button>
                        )}
                      </div>
                      <p className="text-purple-900 leading-relaxed">{aiInsight.explanation}</p>
                    </div>
                  )}

                  {/* Collapsible Explanation & Rule Details */}
                  {isInspected && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>Асуултын дүрмийн тайлбар & Үндэслэл:</span>
                        <span className="text-[10px] font-mono text-emerald-700">
                          Итгэлцэл: {Math.round((q.confidence || 0.95) * 100)}%
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                      {q.rawSnippet && (
                        <div className="pt-2 text-[10px] text-slate-400 font-mono">
                          OCR хэсэг: &ldquo;{q.rawSnippet}&rdquo;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Баталгаажсан: <span className="font-bold text-slate-900">{verifiedCount}</span> / {questionCount}
            </div>

            <button
              type="button"
              onClick={onSaveExam}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Шалгалтыг Баталгаажуулж Хадгалах</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
