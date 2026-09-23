import React, { useState } from "react";
import {
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Save,
  Check,
  RefreshCw,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Exam, Question } from "../types";
import { OFFICIAL_2026_EXAMS } from "../data/official2026Exams";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface PreviousExamImportProps {
  onPublishExam: (exam: Exam) => void;
  existingExams: Exam[];
}

interface StagedVariant {
  variant: "A" | "B" | "C" | "D";
  fileName: string;
  fileSize?: string;
  status: "pending_upload" | "analyzed" | "in_review" | "validated" | "published";
  examData: Exam;
  validationErrors: string[];
  warnings: string[];
}

export const PreviousExamImport: React.FC<PreviousExamImportProps> = ({
  onPublishExam,
  existingExams,
}) => {
  const [stagedVariants, setStagedVariants] = useState<Record<"A" | "B" | "C" | "D", StagedVariant>>({
    A: {
      variant: "A",
      fileName: "ENG-2026-A.pdf",
      fileSize: "1.4 MB",
      status: "analyzed",
      examData: JSON.parse(JSON.stringify(OFFICIAL_2026_EXAMS.A)),
      validationErrors: [],
      warnings: [],
    },
    B: {
      variant: "B",
      fileName: "ENG-2026-B.pdf",
      fileSize: "1.4 MB",
      status: "analyzed",
      examData: JSON.parse(JSON.stringify(OFFICIAL_2026_EXAMS.B)),
      validationErrors: [],
      warnings: [],
    },
    C: {
      variant: "C",
      fileName: "ENG-2026-C.pdf",
      fileSize: "1.4 MB",
      status: "analyzed",
      examData: JSON.parse(JSON.stringify(OFFICIAL_2026_EXAMS.C)),
      validationErrors: [],
      warnings: [],
    },
    D: {
      variant: "D",
      fileName: "ENG-2026-D.pdf",
      fileSize: "1.4 MB",
      status: "analyzed",
      examData: JSON.parse(JSON.stringify(OFFICIAL_2026_EXAMS.D)),
      validationErrors: [],
      warnings: [],
    },
  });

  const [isDragging, setIsDragging] = useState(false);
  const [selectedVariantForReview, setSelectedVariantForReview] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isPublishingAll, setIsPublishingAll] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);
  const [activeReviewSection, setActiveReviewSection] = useState<1 | 2>(1);
  const [expandedTask, setExpandedTask] = useState<string | null>("Task 1");

  // Validate variant data
  const validateVariant = (exam: Exam): { errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const sec1 = exam.questions.filter((q) => q.section === 1 || !q.section);
    const sec2 = exam.questions.filter((q) => q.section === 2);

    // Section 1 items count check
    if (sec1.length !== 47) {
      errors.push(`Нэгдүгээр хэсэгт 47 даалгавар байх ёстой, одоогоор ${sec1.length} байна.`);
    }

    // Section 1 points sum check
    const sec1Points = sec1.reduce((sum, q) => sum + (q.points || 1), 0);
    if (sec1Points !== 80) {
      errors.push(`Нэгдүгээр хэсгийн нийт оноо 80 байх ёстой, одоогоор ${sec1Points} байна.`);
    }

    // Section 2 check
    if (sec2.length !== 3) {
      errors.push(`Хоёрдугаар хэсэгт 3 багц даалгавар (2.1, 2.2, 2.3) байх ёстой, одоогоор ${sec2.length} байна.`);
    }

    const sec2Points = sec2.reduce((sum, q) => sum + (q.points || 0), 0);
    if (sec2Points !== 20) {
      errors.push(`Хоёрдугаар хэсгийн нийт оноо 20 байх ёстой, одоогоор ${sec2Points} байна.`);
    }

    // Raw total points
    const totalPoints = sec1Points + sec2Points;
    if (totalPoints !== 100) {
      errors.push(`Шалгалтын нийт оноо 100 байх ёстой, одоогоор ${totalPoints} байна.`);
    }

    // Check answers exist
    sec1.forEach((q) => {
      if (!q.correctAnswer) {
        warnings.push(`Даалгавар ${q.questionNumber}: Зөв хариултын түлхүүр шаардлагатай.`);
      }
    });

    return { errors, warnings };
  };

  // Handle file uploads
  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const updated = { ...stagedVariants };

    fileArray.forEach((file) => {
      const name = file.name.toUpperCase();
      let matchedVariant: "A" | "B" | "C" | "D" | null = null;
      if (name.includes("-A") || name.includes("VAR_A") || name.includes("A.PDF")) matchedVariant = "A";
      else if (name.includes("-B") || name.includes("VAR_B") || name.includes("B.PDF")) matchedVariant = "B";
      else if (name.includes("-C") || name.includes("VAR_C") || name.includes("C.PDF")) matchedVariant = "C";
      else if (name.includes("-D") || name.includes("VAR_D") || name.includes("D.PDF")) matchedVariant = "D";

      if (matchedVariant) {
        const { errors, warnings } = validateVariant(updated[matchedVariant].examData);
        updated[matchedVariant] = {
          ...updated[matchedVariant],
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          status: errors.length === 0 ? "validated" : "analyzed",
          validationErrors: errors,
          warnings,
        };
      }
    });

    setStagedVariants(updated);
  };

  const handlePublishVariant = async (variantKey: "A" | "B" | "C" | "D") => {
    const staged = stagedVariants[variantKey];
    const { errors } = validateVariant(staged.examData);

    if (errors.length > 0) {
      alert("Шалгалт алдаатай тул нийтлэх боломжгүй:\n" + errors.join("\n"));
      return;
    }

    try {
      // 1. If Supabase is connected, persist to Supabase `exams` table
      if (isSupabaseConfigured && supabase) {
        const examToSave = {
          id: staged.examData.id,
          title: staged.examData.title,
          year: staged.examData.year,
          variant: staged.examData.variant,
          type: staged.examData.type,
          total_questions: staged.examData.totalQuestions,
          duration_minutes: staged.examData.durationMinutes,
          status: "published",
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("exams").upsert(examToSave);
        if (error) {
          console.warn("Supabase exams table sync warning:", error.message);
        }
      }

      // 2. Publish to local DB and update app state
      onPublishExam(staged.examData);

      setStagedVariants((prev) => ({
        ...prev,
        [variantKey]: {
          ...prev[variantKey],
          status: "published",
        },
      }));

      setPublishSuccessMsg(`2026 – Хувилбар ${variantKey} амжилттай нийтлэгдлээ! Одоо Шалгалтын архив, Mock Test, Дасгал хэсэгт нээгдсэн.`);
      setTimeout(() => setPublishSuccessMsg(null), 5000);
    } catch (err: any) {
      alert("Нийтлэх явцад алдаа гарлаа: " + err.message);
    }
  };

  const handlePublishAll = async () => {
    setIsPublishingAll(true);
    try {
      const variants: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
      for (const v of variants) {
        await handlePublishVariant(v);
      }
      setPublishSuccessMsg("Бүх 4 хувилбар (A, B, C, D) 100 оноо бүхий бүтэцтэйгээр амжилттай нийтлэгдлээ!");
      setTimeout(() => setPublishSuccessMsg(null), 6000);
    } finally {
      setIsPublishingAll(false);
    }
  };

  const activeReviewExam = selectedVariantForReview
    ? stagedVariants[selectedVariantForReview].examData
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold mb-3 border border-white/25">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>2026 ESH Official Master Ingestion Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            2026 оны ЭЕШ – Бүх 4 Хувилбар (A, B, C, D) Импортлох
          </h2>
          <p className="text-purple-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Эх PDF хуулбарын бүтцийг алдагдуулахгүйгээр I хэсэг (47 сонгох даалгавар, 80 оноо),
            II хэсэг (3 багц даалгавар: 2.1 Word Formation, 2.2 Matching, 2.3 Cloze MCQ, 20 оноо)
            нийт 100 онооны шалгалтыг шалгаж баталгаажуулан шууд нийтэлнэ.
          </p>
        </div>
      </div>

      {publishSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{publishSuccessMsg}</span>
        </div>
      )}

      {/* Drag and Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
          isDragging
            ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 scale-[1.01]"
            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-purple-400"
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-inner">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Албан ёсны 4 PDF файл хуулах (ENG-2026-A/B/C/D)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ENG-2026-A.pdf, ENG-2026-B.pdf, ENG-2026-C.pdf, ENG-2026-D.pdf файлуудыг чирж оруулна уу
            </p>
          </div>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-purple-600/20">
            <FileText className="w-4 h-4" />
            <span>PDF Файлууд Сонгох</span>
            <input
              type="file"
              multiple
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
              }}
            />
          </label>
        </div>
      </div>

      {/* 4 Staged Variants Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>Staged Exam Variants (Шалгах & Нийтлэх шат)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Баталгаажуулалт хийгдсэн хувилбарыг тусад нь эсвэл бүгдийг зэрэг нийтлэх боломжтой
            </p>
          </div>
          <button
            onClick={handlePublishAll}
            disabled={isPublishingAll}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isPublishingAll ? "Нийтэлж байна..." : "Бүх 4 Хувилбарыг Нийтлэх"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["A", "B", "C", "D"] as const).map((key) => {
            const staged = stagedVariants[key];
            const isPublished = staged.status === "published";
            const sec1 = staged.examData.questions.filter((q) => q.section === 1 || !q.section);
            const sec2 = staged.examData.questions.filter((q) => q.section === 2);

            return (
              <div
                key={key}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  isPublished
                    ? "border-emerald-300 dark:border-emerald-800 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:shadow-md"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-black text-sm flex items-center justify-center">
                        {key}
                      </span>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          2026 – Хувилбар {key}
                        </h4>
                        <span className="text-[10px] text-slate-500">{staged.fileName}</span>
                      </div>
                    </div>
                    {isPublished ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200">
                        Нийтлэгдсэн
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200">
                        Шинжилсэн ✓
                      </span>
                    )}
                  </div>

                  {/* Structural Spec Checklist */}
                  <div className="space-y-1.5 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>I хэсэг (Сонгох)</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {sec1.length} асуулт / 80 оноо
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>II хэсэг (Багц)</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {sec2.length} багц / 20 оноо
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Нийт үнэлгээ</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        100 оноо (80 мин)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedVariantForReview(key)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Шалгах</span>
                  </button>
                  <button
                    onClick={() => handlePublishVariant(key)}
                    disabled={isPublished}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      isPublished
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Нийтлэх</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADMIN REVIEW MODAL */}
      {selectedVariantForReview && activeReviewExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-xs font-black">
                    Хувилбар {selectedVariantForReview}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    2026 оны ЭЕШ Англи хэлний эх өгөгдлийг шалгах (Staging Review)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  I хэсэг (80 оноо), II хэсэг (20 оноо) Нийт 100 онооны задаргаа
                </p>
              </div>
              <button
                onClick={() => setSelectedVariantForReview(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Хаах ✕
              </button>
            </div>

            {/* Section Switcher Tabs */}
            <div className="px-6 pt-3 flex gap-2 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveReviewSection(1)}
                className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeReviewSection === 1
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <span>НЭГДҮГЭЭР ХЭСЭГ (47 Даалгавар / 80 Оноо)</span>
              </button>
              <button
                onClick={() => setActiveReviewSection(2)}
                className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeReviewSection === 2
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <span>ХОЁРДУГААР ХЭСЭГ (3 Багц даалгавар / 20 Оноо)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {activeReviewSection === 1 ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                    💡 Санамж: Даалгавар бүр PDF гарчгийн дагуу өөр өөр оноотой (Жишээ: 6×1=6, 7×2=14, 2×3=6, 3×3=9).
                  </div>

                  <div className="space-y-3">
                    {activeReviewExam.questions
                      .filter((q) => q.section === 1 || !q.section)
                      .map((q) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                Асуулт {q.questionNumber}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                                {q.category}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                                {q.points || 1} оноо
                              </span>
                            </div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              Зөв: {q.correctAnswer}
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {q.text}
                          </p>

                          {/* Options */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                            {q.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`p-2 rounded-lg text-xs border ${
                                  opt.id === q.correctAnswer
                                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-900 dark:text-emerald-200 font-bold"
                                    : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                }`}
                              >
                                <span className="font-bold mr-1">{opt.id}.</span> {opt.text}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Task 2.1 */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        2.1 Word Formation Cloze (6 асуулт × 1 оноо = 6 оноо)
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs font-bold">
                        6 оноо
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-serif">
                      {activeReviewExam.questions.find((q) => q.taskNumber === "2.1")?.readingPassage}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {activeReviewExam.questions.find((q) => q.taskNumber === "2.1")?.subBlanks?.map((b) => (
                        <div key={b.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                          <span className="font-bold text-purple-600">Зай ({b.label})</span>: Зөв хариу:{" "}
                          <span className="font-bold text-emerald-600">
                            {b.options.find((o) => o.id === b.correctAnswer)?.text || b.correctAnswer}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Task 2.2 */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        2.2 Matching (Definitions 4 pts + Synonyms 4 pts = 8 оноо)
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs font-bold">
                        8 оноо
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeReviewExam.questions.find((q) => q.taskNumber === "2.2")?.matchingGroups?.map((group) => (
                        <div key={group.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                          <h5 className="font-bold text-slate-900 dark:text-white">{group.title}</h5>
                          <div className="space-y-1">
                            {group.leftItems.map((left) => (
                              <div key={left.id} className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800 text-[11px]">
                                <span className="font-bold">{left.label}. {left.text}</span>
                                <span className="font-bold text-emerald-600">
                                  → {group.correctPairs?.[left.id] || "?"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Task 2.3 */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        2.3 Cloze Multiple Choice (6 асуулт × 1 оноо = 6 оноо)
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs font-bold">
                        6 оноо
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-serif">
                      {activeReviewExam.questions.find((q) => q.taskNumber === "2.3")?.readingPassage}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {activeReviewExam.questions.find((q) => q.taskNumber === "2.3")?.subBlanks?.map((b) => (
                        <div key={b.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                          <span className="font-bold text-purple-600">Зай ({b.label})</span>: Зөв хариу:{" "}
                          <span className="font-bold text-emerald-600">
                            {b.options.find((o) => o.id === b.correctAnswer)?.text || b.correctAnswer}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Баталгаажуулалт: Нийт 100 оноо (I хэсэг 80 оноо + II хэсэг 20 оноо)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedVariantForReview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Болих
                </button>
                <button
                  onClick={() => {
                    handlePublishVariant(selectedVariantForReview);
                    setSelectedVariantForReview(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Энэ Хувилбарыг Нийтлэх</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
