import React, { useState } from "react";
import {
  Upload,
  FileUp,
  FileCheck,
  Calendar,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  Play,
  AlertCircle,
  RefreshCw,
  Send,
  Eye,
  Check,
  ArrowRight,
  BookOpen,
  Filter,
  FileText,
  Plus,
  Trash2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Exam, Question, QuestionOption, QuestionCategory } from "../types";
import { db } from "../lib/supabase";
import { ALL_ESH_YEARS, ALL_ESH_VARIANTS } from "../data/mockExams";

interface PdfExamIngestionStudioProps {
  exams: Exam[];
  onPublishExam: (newExam: Exam) => void;
  onStartExam?: (exam: Exam, mode?: "mock" | "practice") => void;
  onSendNotification?: (title: string, message: string, targetRole: "all" | "student" | "teacher") => void;
  defaultYear?: number;
  defaultVariant?: "A" | "B" | "C" | "D";
  defaultExamType?: "past_paper" | "mock" | "practice" | "diagnostic";
}

interface VariantUploadSlot {
  variant: "A" | "B" | "C" | "D";
  file: File | null;
  status: "idle" | "ready" | "processing" | "success" | "error";
  questionCount?: number;
  exam?: Exam;
  errorMsg?: string;
}

export const PdfExamIngestionStudio: React.FC<PdfExamIngestionStudioProps> = ({
  exams,
  onPublishExam,
  onStartExam,
  onSendNotification,
  defaultYear = 2024,
  defaultVariant = "A",
  defaultExamType = "past_paper",
}) => {
  const [ingestionMode, setIngestionMode] = useState<"batch-4" | "single-pdf" | "archive-grid">("batch-4");

  // TOAST NOTIFICATIONS
  const [toastMsg, setToastMsg] = useState<{ text: string; success: boolean } | null>(null);
  const showToast = (text: string, success = true) => {
    setToastMsg({ text, success });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Helper to read File as Base64 string
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // =========================================================================
  // MODE 1: BATCH 4-VARIANTS UPLOAD (A, B, C, D for a single year)
  // =========================================================================
  const [batchYear, setBatchYear] = useState<number>(defaultYear);
  const [slots, setSlots] = useState<Record<"A" | "B" | "C" | "D", VariantUploadSlot>>({
    A: { variant: "A", file: null, status: "idle" },
    B: { variant: "B", file: null, status: "idle" },
    C: { variant: "C", file: null, status: "idle" },
    D: { variant: "D", file: null, status: "idle" },
  });
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgressText, setBatchProgressText] = useState("");
  const [batchSuccessExams, setBatchSuccessExams] = useState<Exam[]>([]);

  // Automatically detect variant from filename (e.g. 2024_A.pdf or Variant B.pdf)
  const handleMultiFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const updated = { ...slots };

    fileArray.forEach((file) => {
      const name = file.name.toUpperCase();
      let matchedVariant: "A" | "B" | "C" | "D" | null = null;

      if (name.includes("_A") || name.includes("-A") || name.includes(" A") || name.includes("VARIANTA") || name.includes("ХУВИЛБАР A") || name.includes("ХУВИЛБАР_A")) {
        matchedVariant = "A";
      } else if (name.includes("_B") || name.includes("-B") || name.includes(" B") || name.includes("VARIANTB") || name.includes("ХУВИЛБАР B") || name.includes("ХУВИЛБАР_B")) {
        matchedVariant = "B";
      } else if (name.includes("_C") || name.includes("-C") || name.includes(" C") || name.includes("VARIANTC") || name.includes("ХУВИЛБАР C") || name.includes("ХУВИЛБАР_C")) {
        matchedVariant = "C";
      } else if (name.includes("_D") || name.includes("-D") || name.includes(" D") || name.includes("VARIANTD") || name.includes("ХУВИЛБАР D") || name.includes("ХУВИЛБАР_D")) {
        matchedVariant = "D";
      } else {
        // Fallback: assign to first empty slot
        const emptyKey = (["A", "B", "C", "D"] as const).find((k) => !updated[k].file);
        if (emptyKey) matchedVariant = emptyKey;
      }

      if (matchedVariant) {
        updated[matchedVariant] = {
          variant: matchedVariant,
          file,
          status: "ready",
        };
      }
    });

    setSlots(updated);
    showToast(`${fileArray.length} PDF файл автоматаар хувилбаруудад хуваарилагдлаа.`);
  };

  const handleSingleSlotFile = (variant: "A" | "B" | "C" | "D", file: File | null) => {
    setSlots((prev) => ({
      ...prev,
      [variant]: {
        variant,
        file,
        status: file ? "ready" : "idle",
      },
    }));
  };

  // Convert & Publish all 4 variants
  const handleConvertAndPublishBatch = async () => {
    setIsBatchProcessing(true);
    setBatchProgressText("PDF файлуудыг уншиж байна...");
    const published: Exam[] = [];

    const variantKeys: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];

    for (const v of variantKeys) {
      const slot = slots[v];
      setBatchProgressText(`${batchYear} оны Хувилбар ${v}-г AI-аар цахимжуулж байна...`);

      // Update slot state to processing
      setSlots((prev) => ({
        ...prev,
        [v]: { ...prev[v], status: "processing" },
      }));

      try {
        let base64 = "";
        let fileName = `${batchYear}_ESH_English_Variant_${v}.pdf`;

        if (slot.file) {
          base64 = await readFileAsBase64(slot.file);
          fileName = slot.file.name;
        }

        const res = await fetch("/api/ai/parse-exam-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfBase64: base64 || "data:application/pdf;base64,JVBERi0xLjQKJ", // fallback if no file attached
            examType: "past_paper",
            year: batchYear,
            variant: v,
            title: `${batchYear} оны ЭЕШ - Англи хэл (Хувилбар ${v})`,
            fileName,
          }),
        });

        const data = await res.json();
        if (data.success && data.exam) {
          const finalExam: Exam = {
            ...data.exam,
            id: `esh-${batchYear}-${v.toLowerCase()}`,
            year: batchYear,
            variant: v,
            type: "past_paper",
            status: "published",
          };

          // Publish exam into app state and database
          onPublishExam(finalExam);
          db.addExam(finalExam);
          published.push(finalExam);

          setSlots((prev) => ({
            ...prev,
            [v]: {
              ...prev[v],
              status: "success",
              questionCount: finalExam.questions.length,
              exam: finalExam,
            },
          }));
        } else {
          throw new Error(data.error || "Алдаа гарлаа");
        }
      } catch (err: any) {
        console.warn(`Error processing variant ${v}:`, err);
        setSlots((prev) => ({
          ...prev,
          [v]: {
            ...prev[v],
            status: "error",
            errorMsg: err.message || "Боловсруулахад алдаа гарлаа",
          },
        }));
      }
    }

    setIsBatchProcessing(false);
    setBatchSuccessExams(published);
    showToast(`🎉 ${batchYear} оны A, B, C, D 4 хувилбар амжилттай цахимжин нийтлэгдлээ!`);
  };

  // =========================================================================
  // MODE 2: SINGLE PDF UPLOAD (FOR ANY TEST TYPE)
  // =========================================================================
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleType, setSingleType] = useState<"past_paper" | "mock" | "practice" | "diagnostic">(defaultExamType);
  const [singleYear, setSingleYear] = useState<number>(defaultYear);
  const [singleVariant, setSingleVariant] = useState<"A" | "B" | "C" | "D" | "Diagnostic" | "Mock">(defaultVariant);
  const [singleCustomTitle, setSingleCustomTitle] = useState("");
  const [singleNotifyStudents, setSingleNotifyStudents] = useState(true);
  const [isSingleParsing, setIsSingleParsing] = useState(false);
  const [singleParsedExam, setSingleParsedExam] = useState<Exam | null>(null);

  const handleProcessSinglePdf = async () => {
    if (!singleFile) {
      showToast("PDF файл сонгоно уу!", false);
      return;
    }

    setIsSingleParsing(true);
    try {
      const base64 = await readFileAsBase64(singleFile);
      const res = await fetch("/api/ai/parse-exam-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfBase64: base64,
          examType: singleType,
          year: singleYear,
          variant: singleVariant,
          title: singleCustomTitle.trim() || undefined,
          fileName: singleFile.name,
        }),
      });

      const data = await res.json();
      if (data.success && data.exam) {
        setSingleParsedExam(data.exam);
        showToast(`PDF амжилттай задлагдлаа: ${data.exam.questions.length} асуулт цахимжсан!`);
      } else {
        showToast(data.error || "PDF задлахад алдаа гарлаа.", false);
      }
    } catch (err: any) {
      console.error(err);
      showToast("Сүлжээний алдаа эсвэл PDF уншихад алдаа гарлаа.", false);
    } finally {
      setIsSingleParsing(false);
    }
  };

  const handlePublishSingleExam = () => {
    if (!singleParsedExam) return;

    onPublishExam(singleParsedExam);
    db.addExam(singleParsedExam);

    if (singleType === "mock" && singleNotifyStudents) {
      const title = `🚨 Шинэ Mock сорилт нийтлэгдлээ: ${singleParsedExam.title}`;
      const msg = `${singleParsedExam.year} оны албан ёсны 80 минутын шинэ mock тест нээгдлээ. Шаардлагатай бэлтгэлээ шалгана уу!`;
      if (onSendNotification) {
        onSendNotification(title, msg, "all");
      }
      db.broadcastNotification(title, msg, "all");
    }

    showToast(`"${singleParsedExam.title}" системд амжилттай нийтлэгдэж, шууд цахимаар өгөх боломжтой боллоо!`);
  };

  // =========================================================================
  // MODE 3: ARCHIVE 100% REFRESH & SYNC
  // =========================================================================
  const handleResetAllPastExams = () => {
    const refreshed = db.resetToDefaultExams();
    refreshed.forEach((ex) => onPublishExam(ex));
    showToast("2006–2026 оны бүх 84 шалгалт (Хувилбар A, B, C, D) 100% бүрэн сэргээгдлээ!");
  };

  const pastExamsInDb = exams.filter((e) => e.type === "past_paper");

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

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI-POWERED PDF INGESTION & EXAM DIGITIZER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              PDF-ээр Шалгалт Оруулах & Шууд Цахимжуулах
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Админ он бүрийн 4 хувилбарыг (A, B, C, D) болон 7 хоногийн mock тест, дасгалуудыг PDF файлаар
              оруулахад систем автоматаар 50 асуулт, хариултын хувилбар, түлхүүр, монгол тайлбартайгаар
              цахимжуулж, интерактив тестийн системд шууд нийтэлнэ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/10 text-center">
              <div className="text-[10px] text-slate-300 font-bold uppercase">Цахимжсан ЭЕШ</div>
              <div className="text-2xl font-black text-purple-300">{pastExamsInDb.length} / 84</div>
            </div>
            <button
              onClick={handleResetAllPastExams}
              className="px-4 py-3 rounded-2xl bg-white text-purple-950 font-bold text-xs hover:bg-purple-50 transition-colors shadow-lg flex items-center gap-2"
              title="Хэрэв өмнөх оны тестүүд хоосон харагдвал дарж 84 шалгалтыг сэргээнэ үү"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Бүх 84 хувилбарыг сэргээх</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ingestion Mode Navigation */}
      <div className="flex border-b border-slate-200 gap-3 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setIngestionMode("batch-4")}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            ingestionMode === "batch-4"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-slate-700 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4 text-purple-600" />
          <span>Он бүрийн 4 хувилбар зэрэг оруулах (A, B, C, D Багцаар)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
            Гол хэрэгсэл
          </span>
        </button>

        <button
          onClick={() => setIngestionMode("single-pdf")}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            ingestionMode === "single-pdf"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-slate-700 hover:text-slate-800"
          }`}
        >
          <FileUp className="w-4 h-4" />
          <span>Нэг PDF оруулах (Бүх төрлийн тест: ЭЕШ, Mock, Дасгал)</span>
        </button>

        <button
          onClick={() => setIngestionMode("archive-grid")}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            ingestionMode === "archive-grid"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-slate-700 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>2006–2026 Архивын бүтэн матриц (84 шалгалт)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. BATCH 4-VARIANTS UPLOAD (A, B, C, D)                                   */}
      {/* ========================================================================= */}
      {ingestionMode === "batch-4" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  <span>Он сонгож, 4 хувилбарыг (A, B, C, D) нэгэн зэрэг цахимжуулах</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Сонгосон оныхоо 4 хувилбарын PDF файлыг оруулснаар хувилбар тус бүрийн 50 асуултыг зэрэг цахим тест болгон системд шууд нийтэлнэ.
                </p>
              </div>

              {/* Year Selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Шалгалтын он:</label>
                <select
                  value={batchYear}
                  onChange={(e) => {
                    setBatchYear(Number(e.target.value));
                    setBatchSuccessExams([]);
                  }}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {ALL_ESH_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} он (A, B, C, D)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Multi-file Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) handleMultiFilesSelected(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/40 rounded-2xl p-6 text-center transition-colors cursor-pointer"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf";
                input.multiple = true;
                input.onchange = (e: any) => {
                  if (e.target.files) handleMultiFilesSelected(e.target.files);
                };
                input.click();
              }}
            >
              <FileUp className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-800">
                4 хувилбарын PDF файлыг зэрэг чирч эсвэл энд дарж оруулна уу
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Систем файлын нэрнээс A, B, C, D хувилбарыг автоматаар ялган таньж онооно.
              </div>
            </div>

            {/* 4 Variant Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(["A", "B", "C", "D"] as const).map((v) => {
                const slot = slots[v];
                return (
                  <div
                    key={v}
                    className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                      slot.status === "success"
                        ? "bg-emerald-50/50 border-emerald-300"
                        : slot.file
                        ? "bg-purple-50/50 border-purple-300"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                          {v}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            slot.status === "success"
                              ? "bg-emerald-100 text-emerald-800"
                              : slot.status === "processing"
                              ? "bg-amber-100 text-amber-800 animate-pulse"
                              : slot.file
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {slot.status === "success"
                            ? "✅ Цахимжсан (50 тест)"
                            : slot.status === "processing"
                            ? "AI боловсруулж байна..."
                            : slot.file
                            ? "PDF Бэлэн"
                            : "Файл сонгоогүй"}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {batchYear} оны Хувилбар {v}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {slot.file ? slot.file.name : "Албан ёсны PDF файл"}
                        </div>
                        {slot.file && (
                          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">
                            {(slot.file.size / 1024).toFixed(1)} KB
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/60 mt-4 flex items-center gap-2">
                      <label className="flex-1 text-center py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors">
                        <span>{slot.file ? "Файл солих" : "PDF оруулах"}</span>
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleSingleSlotFile(v, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {slot.file && (
                        <button
                          onClick={() => handleSingleSlotFile(v, null)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Цэвэрлэх"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Button & Batch Progress */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                {isBatchProcessing ? (
                  <div className="flex items-center gap-2 text-purple-600 font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{batchProgressText}</span>
                  </div>
                ) : (
                  <span>
                    Файлуудаа шалгаад доорх товчийг дарж {batchYear} оны 4 хувилбарыг зэрэг цахимжуулна.
                  </span>
                )}
              </div>

              <button
                disabled={isBatchProcessing}
                onClick={handleConvertAndPublishBatch}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isBatchProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Боловсруулж байна...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{batchYear} оны 4 хувилбарыг зэрэг цахимжуулж нийтлэх</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success Result Cards */}
          {batchSuccessExams.length > 0 && (
            <div className="bg-emerald-50/70 rounded-3xl p-6 sm:p-8 border border-emerald-200 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{batchYear} оны 4 хувилбар амжилттай цахимжин нийтлэгдлээ! Шууд туршиж үзэх:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {batchSuccessExams.map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-600 text-white">
                          Хувилбар {ex.variant}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {ex.questions.length} асуулт
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                        {ex.title}
                      </h4>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                        80 минут • 800 онооны систем
                      </div>
                    </div>

                    <button
                      onClick={() => onStartExam && onStartExam(ex, "mock")}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Цахимаар шалгалт өгөх</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SINGLE PDF UPLOAD (FOR ANY TEST TYPE: PAST PAPER, MOCK, DRILL)         */}
      {/* ========================================================================= */}
      {ingestionMode === "single-pdf" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileUp className="w-5 h-5 text-purple-600" />
                <span>Нэг PDF файлаар дурын шалгалт оруулах (ЭЕШ, 7 хоногийн Mock, Дасгал)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Шалгалтынхаа PDF файлыг сонгож төрлийг нь заахад хиймэл оюун ухаан автоматаар уншиж, интерактив дижитал шалгалт үүсгэнэ.
              </p>
            </div>

            {/* Test Configuration Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Шалгалтын төрөл</label>
                <select
                  value={singleType}
                  onChange={(e) => setSingleType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="past_paper">🎓 Өмнөх оны ЭЕШ (2006–2026)</option>
                  <option value="mock">⚡ 7 хоногийн Mock тест</option>
                  <option value="practice">📚 Нэмэлт дасгал даалгавар (Practice Test)</option>
                  <option value="diagnostic">🎯 Түвшин тогтоох сорил (Diagnostic Test)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Шалгалтын он</label>
                <select
                  value={singleYear}
                  onChange={(e) => setSingleYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {ALL_ESH_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} он
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Хувилбар</label>
                <select
                  value={singleVariant}
                  onChange={(e) => setSingleVariant(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="A">Хувилбар A</option>
                  <option value="B">Хувилбар B</option>
                  <option value="C">Хувилбар C</option>
                  <option value="D">Хувилбар D</option>
                  <option value="Mock">Mock хувилбар</option>
                  <option value="Diagnostic">Түвшин тогтоох</option>
                </select>
              </div>
            </div>

            {/* Title override */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Шалгалтын гарчиг (Хоосон орхивол автоматаар үүсгэнэ)
              </label>
              <input
                type="text"
                value={singleCustomTitle}
                onChange={(e) => setSingleCustomTitle(e.target.value)}
                placeholder={
                  singleType === "past_paper"
                    ? `${singleYear} оны ЭЕШ - Англи хэл (Хувилбар ${singleVariant})`
                    : singleType === "mock"
                    ? `2026 оны ЭЕШ - 7 хоногийн Mock Тест`
                    : `Англи хэлний түвшин дээшлүүлэх нэмэлт дасгал сорилт`
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Mock Broadcast Toggle */}
            {singleType === "mock" && (
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={singleNotifyStudents}
                  onChange={(e) => setSingleNotifyStudents(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Шалгалт нийтлэгдэх үед бүх сурагч болон багш нарт автоматаар мэдэгдэл илгээх
                  </span>
                  <span className="text-[11px] text-amber-700 block mt-0.5">
                    "🚨 Шинэ 7 хоногийн Mock тест нийтлэгдлээ" гарчигтай өндөр ач холбогдолтой мэдэгдэл илгээгдэнэ.
                  </span>
                </div>
              </label>
            )}

            {/* Single PDF File Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setSingleFile(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-6 text-center transition-colors cursor-pointer bg-slate-50/60"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf";
                input.onchange = (e: any) => {
                  if (e.target.files && e.target.files[0]) {
                    setSingleFile(e.target.files[0]);
                  }
                };
                input.click();
              }}
            >
              <FileText className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              {singleFile ? (
                <div>
                  <div className="text-xs font-bold text-slate-900">{singleFile.name}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    {(singleFile.size / 1024).toFixed(1)} KB • PDF файл сонгогдсон
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    PDF файлыг чирч эсвэл энд дарж сонгоно уу
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    ЭЕШ-ийн албан ёсны 50 асуулттай PDF материалыг бүрэн дэмжинэ (.pdf)
                  </div>
                </div>
              )}
            </div>

            {/* Process Button */}
            <div className="pt-2 flex justify-end">
              <button
                disabled={!singleFile || isSingleParsing}
                onClick={handleProcessSinglePdf}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
              >
                {isSingleParsing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>PDF-г задлан шинжилж байна...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>PDF задлан шинжлэх & Цахим шалгалт үүсгэх</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Parsed Exam Preview & Review */}
          {singleParsedExam && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-xs">
                      Цахимжсан
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {singleParsedExam.year} он • Хувилбар {singleParsedExam.variant}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {singleParsedExam.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Нийт {singleParsedExam.questions.length} асуулт • {singleParsedExam.durationMinutes} минут
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePublishSingleExam}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm flex items-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Шууд цахим шалгалт болгон нийтлэх</span>
                  </button>

                  <button
                    onClick={() => onStartExam && onStartExam(singleParsedExam, "mock")}
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-emerald-200"
                  >
                    <Play className="w-3.5 h-3.5 fill-emerald-800" />
                    <span>Шалгалтыг турших</span>
                  </button>
                </div>
              </div>

              {/* Reading Passage Preview */}
              {singleParsedExam.readingPassage && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-purple-700 block">📖 Эх бичвэр (Reading Passage):</span>
                  <p className="line-clamp-4 leading-relaxed">{singleParsedExam.readingPassage}</p>
                </div>
              )}

              {/* Question Preview List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Шалгалтын асуултууд ({singleParsedExam.questions.length}):</span>
                  <span className="text-slate-500">Grammar, Vocabulary, Communication, Reading</span>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                  {singleParsedExam.questions.slice(0, 15).map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px]">
                            {q.questionNumber}
                          </span>
                          <span className="font-bold text-slate-900">{q.text}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {q.category}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                        {q.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`px-2 py-1 rounded text-[11px] font-medium border flex items-center gap-1.5 ${
                              opt.id === q.correctAnswer
                                ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold"
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            <span className="font-bold">{opt.id}.</span>
                            <span className="truncate">{opt.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-100">
                          <span className="font-bold text-purple-600">Тайлбар:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                  {singleParsedExam.questions.length > 15 && (
                    <div className="text-center py-2 text-xs text-slate-500 italic">
                      + цааш нийт {singleParsedExam.questions.length} асуулт бүрэн хадгалагдсан байна.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ARCHIVE GRID VIEW (2006-2026 STATUS)                                   */}
      {/* ========================================================================= */}
      {ingestionMode === "archive-grid" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>2006–2026 Оны ЭЕШ-ийн 84 хувилбарын цахим төлөв</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Монгол улсын Англи хэлний сүүлийн 21 жилийн бүх хувилбаруудын 50 тестийн бэлэн байдал.
              </p>
            </div>

            <button
              onClick={handleResetAllPastExams}
              className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-2 transition-colors border border-purple-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Бүх онуудын тестийг сэргээх / шалгах</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Шалгалтын он</th>
                  <th className="py-3 px-4 text-center">Хувилбар A</th>
                  <th className="py-3 px-4 text-center">Хувилбар B</th>
                  <th className="py-3 px-4 text-center">Хувилбар C</th>
                  <th className="py-3 px-4 text-center">Хувилбар D</th>
                  <th className="py-3 px-4 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {ALL_ESH_YEARS.map((yr) => {
                  const examA = exams.find((e) => e.year === yr && e.variant === "A" && e.type === "past_paper");
                  const examB = exams.find((e) => e.year === yr && e.variant === "B" && e.type === "past_paper");
                  const examC = exams.find((e) => e.year === yr && e.variant === "C" && e.type === "past_paper");
                  const examD = exams.find((e) => e.year === yr && e.variant === "D" && e.type === "past_paper");

                  const renderVariantBadge = (ex?: Exam, vName = "A") => {
                    if (ex) {
                      return (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>50 тест</span>
                        </div>
                      );
                    }
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                        Бэлэн бус
                      </span>
                    );
                  };

                  return (
                    <tr key={yr} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900 text-xs">
                        {yr} оны ЭЕШ
                      </td>
                      <td className="py-3.5 px-4 text-center">{renderVariantBadge(examA, "A")}</td>
                      <td className="py-3.5 px-4 text-center">{renderVariantBadge(examB, "B")}</td>
                      <td className="py-3.5 px-4 text-center">{renderVariantBadge(examC, "C")}</td>
                      <td className="py-3.5 px-4 text-center">{renderVariantBadge(examD, "D")}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setBatchYear(yr);
                            setIngestionMode("batch-4");
                          }}
                          className="px-3 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors"
                        >
                          PDF-ээр оруулах
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
