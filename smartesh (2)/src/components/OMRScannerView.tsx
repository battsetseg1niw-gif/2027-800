import React, { useState, useMemo } from "react";
import {
  ScanLine,
  Upload,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  Award,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  Info,
  PlusCircle,
  Users,
  Check,
  Search,
  Save,
  Clock,
  HelpCircle,
  Layers,
  ChevronDown,
  Copy,
  Download,
  Filter,
  BookOpen,
  FileUp,
  CheckSquare,
} from "lucide-react";
import { Exam, OMRScanRecord, ExamSubmission, ClassRoom, UserProfile, Question, MistakeItem } from "../types";
import { LocalDatabaseStore } from "../lib/supabase";
import { OfficialOMRSheet } from "./OfficialOMRSheet";
import { OMRDebugUtility, ParseMismatch, ParsedQuestionItem } from "./OMRDebugUtility";

const SAMPLE_TAG_QUESTIONS_15 = `12-р ангийн Англи хэл - Tag Questions (15 Даалгавар)
Хувилбар A

1. He lives in Ulaanbaatar with his family, _________?
A) does he
B) doesn't he
C) isn't he
D) is he

2. You haven't sent the project proposal yet, _________?
A) haven't you
B) have you
C) did you
D) don't you

3. She was very happy with her exam score, _________?
A) wasn't she
B) was she
C) isn't she
D) didn't she

4. They won't arrive before midnight, _________?
A) will they
B) won't they
C) do they
D) are they

5. Let's practice English speaking together this evening, _________?
A) will we
B) shall we
C) don't we
D) do we

6. Nobody called me while I was away, _________?
A) did they
B) didn't they
C) did he
D) didn't he

7. You are coming to our study group tomorrow, _________?
A) are you
B) aren't you
C) do you
D) won't you

8. He can solve these physics problems easily, _________?
A) can he
B) can't he
C) does he
D) isn't he

9. There isn't any milk left in the fridge, _________?
A) is there
B) isn't there
C) is it
D) are there

10. You used to play basketball when you were in middle school, _________?
A) didn't you
B) did you
C) weren't you
D) don't you

11. She hardly ever complains about anything, _________?
A) does she
B) doesn't she
C) is she
D) isn't she

12. The train leaves at 8:00 AM every Monday, _________?
A) doesn't it
B) does it
C) isn't it
D) will it

13. You had already read this article before the class, _________?
A) hadn't you
B) had you
C) didn't you
D) haven't you

14. Open the window and let some fresh air in, _________?
A) will you
B) shall you
C) do you
D) don't you

15. I am responsible for organizing this event, _________?
A) am not I
B) aren't I
C) isn't I
D) don't I

Answers / Түлхүүр:
1-B, 2-B, 3-A, 4-A, 5-B, 6-A, 7-B, 8-B, 9-A, 10-A, 11-A, 12-A, 13-A, 14-A, 15-B`;

interface OMRScannerViewProps {
  exams: Exam[];
  currentUser: UserProfile;
  classes?: ClassRoom[];
  users?: UserProfile[];
  onNewSubmission: (sub: ExamSubmission) => void;
  onNewOMRScan: (scan: OMRScanRecord) => void;
  onCreateExam?: (exam: Exam) => void;
  preselectedExamId?: string;
}

export const OMRScannerView: React.FC<OMRScannerViewProps> = ({
  exams,
  currentUser,
  classes = [],
  users = [],
  onNewSubmission,
  onNewOMRScan,
  onCreateExam,
  preselectedExamId,
}) => {
  // Top level active tab: "prepare-print" | "scan-grade" | "scan-history" | "pdf-debugger"
  const [activeTab, setActiveTab] = useState<"prepare-print" | "scan-grade" | "scan-history" | "pdf-debugger">("prepare-print");

  // Selected Exam for OMR
  const [selectedExamId, setSelectedExamId] = useState<string>(
    preselectedExamId || exams[0]?.id || ""
  );
  const [selectedVariant, setSelectedVariant] = useState<"A" | "B" | "C" | "D">("A");

  // Class & Student Pre-fill settings for printing
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "none");
  const [printMode, setPrintMode] = useState<"blank" | "single_student" | "batch_class">("blank");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // New Paper Exam Registration Modal/Form
  const [showNewExamModal, setShowNewExamModal] = useState(false);
  const [examCreationMode, setExamCreationMode] = useState<"pdf_ai" | "manual">("pdf_ai");
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamCategory, setNewExamCategory] = useState<"past_paper" | "mock" | "practice">("past_paper");
  const [newExamYear, setNewExamYear] = useState<number>(2024);
  const [newExamVariant, setNewExamVariant] = useState<"A" | "B" | "C" | "D">("A");
  const [newExamQCount, setNewExamQCount] = useState<number>(50);
  const [pdfFileName, setPdfFileName] = useState<string>("12_Angi_ESH_Uulirlyn_Sorilt_2026.pdf");
  const [rawOcrText, setRawOcrText] = useState<string>("");
  const [pdfFileBase64, setPdfFileBase64] = useState<string | null>(null);
  const [parseMismatches, setParseMismatches] = useState<ParseMismatch[]>([]);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState<boolean>(false);
  const [pdfAnalysisStep, setPdfAnalysisStep] = useState<string>("");
  const [aiQuestionsList, setAiQuestionsList] = useState<ParsedQuestionItem[]>([]);
  const [filterAmbiguousOnly, setFilterAmbiguousOnly] = useState<boolean>(false);
  const [expandedExplanationQ, setExpandedExplanationQ] = useState<number | null>(null);
  const [copiedRosterMsg, setCopiedRosterMsg] = useState<string | null>(null);

  const [newExamAnswerKey, setNewExamAnswerKey] = useState<Record<number, string>>(() => {
    const key: Record<number, string> = {};
    const choices = ["A", "B", "C", "D", "E"];
    for (let i = 1; i <= 50; i++) {
      key[i] = choices[(i * 2) % 5];
    }
    return key;
  });

  // Scan & Grade State
  const [scanStudentCode, setScanStudentCode] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<OMRScanRecord | null>(null);
  const [teacherOverrides, setTeacherOverrides] = useState<Record<number, string>>({});
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Local scanned history list
  const [scannedHistory, setScannedHistory] = useState<OMRScanRecord[]>([]);

  // Current active exam object
  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Selected Class details
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Enrolled students in the selected class with guaranteed 6-digit codes
  const classStudents = useMemo(() => {
    if (selectedClassId === "none") return [];
    const cls = classes.find((c) => c.id === selectedClassId);
    if (!cls) return [];
    const found = users.filter((u) => cls.studentIds.includes(u.id) || (u.classCodes && u.classCodes.includes(cls.code)));
    return found.map((u, idx) => ({
      ...u,
      studentCode: u.studentCode && u.studentCode.length === 6 ? u.studentCode : (u.id ? u.id.replace(/\D/g, "").padEnd(6, "0").slice(0, 6) : `${100000 + idx}`),
    }));
  }, [selectedClassId, classes, users]);

  // Selected student for single pre-fill
  const selectedStudent = useMemo(() => {
    if (printMode === "single_student" && selectedStudentId) {
      return classStudents.find((u) => u.id === selectedStudentId) || users.find((u) => u.id === selectedStudentId);
    }
    return null;
  }, [printMode, selectedStudentId, classStudents, users]);

  // Real-time matched student for scanning
  const matchedStudent = useMemo(() => {
    if (!scanStudentCode || scanStudentCode.length < 6) return null;
    return classStudents.find((u) => u.studentCode === scanStudentCode.trim()) || users.find((u) => u.studentCode === scanStudentCode.trim());
  }, [scanStudentCode, classStudents, users]);

  // File upload handler for OMR sheet photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Dedicated File Upload handler for PDFs, text files, etc.
  const handlePdfFileUpload = (file: File) => {
    setPdfFileName(file.name);
    if (!newExamTitle) {
      setNewExamTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const textReader = new FileReader();
      textReader.onload = () => {
        const text = textReader.result as string;
        setRawOcrText(text);
        handleAnalyzePdfKeys(text, undefined, file.name.replace(/\.[^/.]+$/, ""));
      };
      textReader.readAsText(file);
    } else {
      const b64Reader = new FileReader();
      b64Reader.onload = () => {
        const b64 = b64Reader.result as string;
        setPdfFileBase64(b64);
        handleAnalyzePdfKeys(undefined, undefined, file.name.replace(/\.[^/.]+$/, ""), b64);
      };
      b64Reader.readAsDataURL(file);
    }
  };

  // Load Sample Presets for Testing
  const handleLoadPreset = (type: "tag_questions_15" | "esh_2024_50" | "short_quiz_10") => {
    if (type === "tag_questions_15") {
      const title = "12-р анги - Tag Questions (15 Даалгавар)";
      setPdfFileName("Tag_Questions_15_Test.pdf");
      setNewExamTitle(title);
      setNewExamVariant("A");
      setNewExamQCount(15);
      setRawOcrText(SAMPLE_TAG_QUESTIONS_15);
      handleAnalyzePdfKeys(SAMPLE_TAG_QUESTIONS_15, 15, title, null);
    } else if (type === "esh_2024_50") {
      const title = "ЭЕШ 2024 Англи хэл (Хувилбар A)";
      setPdfFileName("ESH_English_2024_A.pdf");
      setNewExamTitle(title);
      setNewExamVariant("A");
      setNewExamQCount(50);
      handleAnalyzePdfKeys("", 50, title, null);
    } else {
      const title = "Англи хэлний түргэн сорил (10 Даалгавар)";
      setPdfFileName("Short_English_Quiz_10.pdf");
      setNewExamTitle(title);
      setNewExamVariant("A");
      setNewExamQCount(10);
      handleAnalyzePdfKeys("", 10, title, null);
    }
  };

  // AI PDF Exam Key Generator & OCR Inspector
  const handleAnalyzePdfKeys = async (
    overrideContent?: string,
    overrideQCount?: number,
    overrideTitle?: string,
    overridePdfB64?: string | null
  ) => {
    setIsAnalyzingPdf(true);
    setPdfAnalysisStep("PDF баримтыг задлан OCR текстийг татаж байна...");

    try {
      const contentToUse = overrideContent !== undefined ? overrideContent : rawOcrText;
      const countToUse = overrideQCount || newExamQCount;
      const titleToUse = overrideTitle || newExamTitle.trim() || "Шалгалтын сорилт";
      const b64ToUse = overridePdfB64 !== undefined ? overridePdfB64 : pdfFileBase64;

      setTimeout(() => {
        setPdfAnalysisStep("Асуулт тус бүрийн бүтэц, сонголтууд & зөв хариултыг AI шинжилж байна...");
      }, 500);

      const res = await fetch("/api/exam/ai-solve-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleToUse,
          totalQuestions: countToUse,
          variant: newExamVariant,
          rawContent: contentToUse,
          pdfBase64: b64ToUse,
          fileName: pdfFileName,
        }),
      });

      const data = await res.json();
      if (data.rawOcrText) {
        setRawOcrText(data.rawOcrText);
      }
      if (data.detectedQuestionsCount && data.detectedQuestionsCount > 0) {
        setNewExamQCount(data.detectedQuestionsCount);
      }
      if (data.questions && Array.isArray(data.questions)) {
        setAiQuestionsList(data.questions);
        const newKey: Record<number, string> = {};
        data.questions.forEach((q: any) => {
          newKey[q.questionNumber] = q.correctAnswer;
        });
        setNewExamAnswerKey(newKey);
      }
      if (data.parseMismatches && Array.isArray(data.parseMismatches)) {
        setParseMismatches(data.parseMismatches);
      } else {
        setParseMismatches([]);
      }
    } catch (e: any) {
      console.error(e);
      alert("AI түлхүүр танихад алдаа гарлаа: " + (e?.message || "Стандарт түлхүүрүүд бэлтгэгдлээ."));
    } finally {
      setIsAnalyzingPdf(false);
      setPdfAnalysisStep("");
    }
  };

  // Run OMR Scan and Request AI Student Analysis
  const handleRunScan = async () => {
    setIsScanning(true);
    setSavedSuccessMsg(null);

    try {
      const studentName = matchedStudent ? matchedStudent.name : "Сурагч";
      const studentCode = scanStudentCode.trim() || (matchedStudent?.studentCode) || "";
      const total = currentExam.totalQuestions || 50;

      const res = await fetch("/api/omr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: uploadedPreview,
          examId: currentExam.id,
          variant: selectedVariant,
          studentCode,
          totalQuestions: total,
          studentName,
        }),
      });

      const data = await res.json();
      if (data.detectedAnswers) {
        let rawCorrect = 0;
        const mistakesList: any[] = [];

        for (let i = 1; i <= total; i++) {
          const q = currentExam.questions[i - 1];
          const correctAns = q ? q.correctAnswer : "A";
          const scannedAns = data.detectedAnswers[i]?.answer;

          if (scannedAns && scannedAns === correctAns) {
            rawCorrect++;
          } else {
            mistakesList.push({
              qNum: i,
              category: q?.category || (i <= 22 ? "Grammar" : i <= 36 ? "Vocabulary" : i <= 42 ? "Communication" : "Reading"),
              topic: q?.topic || (i <= 22 ? "Grammar Structure" : "Vocabulary"),
              subtopic: q?.subtopic || "",
              chosenAnswer: scannedAns || "-",
              correctAnswer: correctAns,
              questionText: q?.text || `Асуулт ${i}`,
            });
          }
        }

        const scaled = Math.round(200 + (rawCorrect / total) * 600);

        // Fetch in-depth AI Student Analysis
        let aiReport = undefined;
        try {
          const aiRes = await fetch("/api/omr/analyze-student", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentName,
              studentCode,
              examTitle: currentExam.title,
              variant: selectedVariant,
              rawScore: rawCorrect,
              totalQuestions: total,
              scaledScore: scaled,
              mistakes: mistakesList,
              categoryScores: {
                Grammar: { correct: Math.round(rawCorrect * 0.45), total: 22 },
                Vocabulary: { correct: Math.round(rawCorrect * 0.3), total: 14 },
                Communication: { correct: Math.round(rawCorrect * 0.12), total: 6 },
                Reading: { correct: Math.round(rawCorrect * 0.13), total: 8 },
              },
            }),
          });
          const aiData = await aiRes.json();
          if (aiData.analysis) {
            aiReport = aiData.analysis;
          }
        } catch (e) {
          console.warn("AI analysis fetch error:", e);
        }

        const newScanRecord: OMRScanRecord = {
          id: `omr-scan-${Date.now()}`,
          examId: currentExam.id,
          examTitle: currentExam.title,
          studentCode,
          studentName,
          variant: selectedVariant,
          scannedAnswers: data.detectedAnswers,
          status: Object.values(data.detectedAnswers).some((v: any) => v.ambiguous)
            ? "pending_verification"
            : "verified",
          scannedAt: new Date().toISOString(),
          score: rawCorrect,
          scaledScore: scaled,
          aiAnalysis: aiReport,
        };

        setScanResult(newScanRecord);
        setTeacherOverrides({});
        onNewOMRScan(newScanRecord);
        setScannedHistory((prev) => [newScanRecord, ...prev]);
      }
    } catch (err) {
      console.error(err);
      alert("OMR скан хийхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsScanning(false);
    }
  };

  // Confirm and Save Final Submission for Student
  const handleSaveVerifiedSubmission = () => {
    if (!scanResult) return;

    const total = currentExam.totalQuestions || 50;
    const finalAnswers: Record<number, string> = {};
    let finalScore = 0;
    const wrongQuestionIds: string[] = [];

    const catScores: {
      Grammar: { correct: number; total: number };
      Vocabulary: { correct: number; total: number };
      Communication: { correct: number; total: number };
      Reading: { correct: number; total: number };
      [key: string]: { correct: number; total: number };
    } = {
      Grammar: { correct: 0, total: 0 },
      Vocabulary: { correct: 0, total: 0 },
      Communication: { correct: 0, total: 0 },
      Reading: { correct: 0, total: 0 },
    };

    for (let i = 1; i <= total; i++) {
      const ans = teacherOverrides[i] || scanResult.scannedAnswers[i]?.answer || "A";
      finalAnswers[i] = ans;

      const q = currentExam.questions[i - 1];
      const correctAns = q ? q.correctAnswer : "A";
      const cat = q?.category || "Grammar";
      if (!catScores[cat]) {
        catScores[cat] = { correct: 0, total: 0 };
      }
      catScores[cat].total++;

      if (ans === correctAns) {
        finalScore++;
        catScores[cat].correct++;
      } else if (q) {
        wrongQuestionIds.push(q.id);
      }
    }

    const percentage = Math.round((finalScore / total) * 100);
    const scaledScore = Math.round(200 + (finalScore / total) * 600);

    const submission: ExamSubmission = {
      id: `sub-omr-${Date.now()}`,
      examId: currentExam.id,
      examTitle: `${currentExam.title} (Цаасан OMR Шалгалт)`,
      userId: matchedStudent ? matchedStudent.id : currentUser.id,
      userName: matchedStudent ? matchedStudent.name : "Сурагч",
      studentCode: scanResult.studentCode,
      answers: finalAnswers,
      rawScore: finalScore,
      percentage,
      scaledScore,
      timeSpentSeconds: 4800,
      submittedAt: new Date().toISOString(),
      categoryScores: catScores,
      wrongQuestionIds,
      source: "omr_paper",
      aiAnalysis: scanResult.aiAnalysis,
      reviewedByTeacher: true,
    };

    onNewSubmission(submission);

    // Save wrong questions to student's mistake notebook in LocalDatabaseStore
    try {
      const existingMistakes = LocalDatabaseStore.getMistakes();
      const newMistakes: MistakeItem[] = [];
      for (let i = 1; i <= total; i++) {
        const ans = finalAnswers[i];
        const q = currentExam.questions[i - 1];
        if (q && ans !== q.correctAnswer) {
          newMistakes.push({
            id: `mst-${Date.now()}-${i}`,
            userId: submission.userId,
            examId: currentExam.id,
            examTitle: currentExam.title,
            questionId: q.id,
            question: q,
            userAnswer: ans,
            correctAnswer: q.correctAnswer,
            date: new Date().toISOString().slice(0, 10),
            resolved: false,
            mistakeCount: 1,
            masteryLevel: "learning",
          });
        }
      }
      if (newMistakes.length > 0) {
        LocalDatabaseStore.saveMistakes([...newMistakes, ...existingMistakes]);
      }
    } catch (e) {
      console.warn("Could not save mistakes to database:", e);
    }

    setSavedSuccessMsg(
      `Сурагч ${submission.userName} (Код: ${submission.studentCode})-ийн шалгалтын дүн & AI шинжилгээ амжилттай баталгаажиж, сурагчийн талбарт нийтлэгдлээ!`
    );
  };

  // Save New Paper Exam (created either manually or via AI PDF upload or from Debug Utility)
  const handleSaveNewExam = (e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const finalTitle = newExamTitle.trim() || `Англи хэлний шалгалт (${newExamQCount} даалгавар)`;
    if (!onCreateExam) return;

    const questions: Question[] = [];
    for (let i = 1; i <= newExamQCount; i++) {
      const correct = newExamAnswerKey[i] || "A";
      const aiQ = aiQuestionsList.find((q) => q.questionNumber === i);

      const resolvedOptions =
        aiQ?.options && aiQ.options.length > 0
          ? aiQ.options
          : [
              { id: "A", text: "Сонголт A" },
              { id: "B", text: "Сонголт B" },
              { id: "C", text: "Сонголт C" },
              { id: "D", text: "Сонголт D" },
              { id: "E", text: "Сонголт E" },
            ];

      questions.push({
        id: `paper-q-${i}-${Date.now()}`,
        questionNumber: i,
        text: aiQ?.text || `Асуулт ${i}: (${aiQ?.topic || "Цаасан шалгалтын даалгавар"})`,
        category:
          (aiQ?.category as any) ||
          (i <= 22 ? "Grammar" : i <= 36 ? "Vocabulary" : i <= 42 ? "Communication" : "Reading"),
        topic:
          aiQ?.topic ||
          (i <= 22
            ? "Grammar Structure"
            : i <= 36
            ? "Vocabulary in Context"
            : i <= 42
            ? "Dialogue & Everyday English"
            : "Reading Comprehension"),
        subtopic: aiQ?.subtopic || `Section ${i <= 22 ? "1" : i <= 36 ? "2" : i <= 42 ? "3" : "4"}`,
        difficulty: i % 3 === 0 ? "Hard" : i % 2 === 0 ? "Medium" : "Easy",
        options: resolvedOptions,
        correctAnswer: correct,
        explanation: aiQ?.explanation || `Шалгалтын албан ёсны түлхүүр: ${correct}`,
      });
    }

    const created: Exam = {
      id: `exam-${newExamCategory}-${newExamYear}-${newExamVariant.toLowerCase()}-${Date.now()}`,
      title: finalTitle,
      year: newExamYear,
      variant: newExamVariant,
      type: newExamCategory,
      totalQuestions: newExamQCount,
      durationMinutes: 80,
      questions,
      status: "published",
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onCreateExam(created);
    setSelectedExamId(created.id);
    setSelectedVariant(newExamVariant);
    setShowNewExamModal(false);
    setActiveTab("scan-grade");
    setSavedSuccessMsg(
      `Шалгалт "${created.title}" (${newExamQCount} даалгавар, ${newExamYear} он) амжилттай цахим шалгалт болон системд бүртгэгдлээ! Сурагчид цахимаар өгөх боломжтой ба багш OMR хуудсыг хэвлэн сканнердаж болно.`
    );
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // Guard for Student role
  if (currentUser.role === "student") {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Багш & Админы Удирдлагын Хэсэг</h2>
        <p className="text-sm text-slate-700 leading-relaxed max-w-md mx-auto">
          Цаасан шалгалт бэлтгэх, OMR хуудас хэвлэх болон сканнердан автоматаар шалгах боломж нь зөвхөн Багш болон Админ эрхэд нээлттэй.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
              <ScanLine className="w-3.5 h-3.5 text-indigo-300" />
              <span>Монгол улсын ЭЕШ OMR Цаасан Шалгалтын Систем</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Цаасан Шалгалт Оруулах & OMR Хуудас Хэвлэх, Сканнердах
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Багш, админ нар цаасаар авах шалгалтаа системд бүртгэн, 6 оронтой кодтой хариултын хуудсаа шууд хэвлэн авч, шалгалтын дараа зураг оруулан 1 секундын дотор шалгаж дүнг системд нэгтгэнэ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNewExamModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Шинэ Цаасан Шалгалт Бүртгэх</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Хариултын хуудас хэвлэх</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold print:hidden">
        <button
          onClick={() => setActiveTab("prepare-print")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "prepare-print"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-700 hover:text-slate-800"
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>1. Шалгалт бэлтгэх & OMR Хуудас хэвлэх</span>
        </button>

        <button
          onClick={() => setActiveTab("scan-grade")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "scan-grade"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-700 hover:text-slate-800"
          }`}
        >
          <ScanLine className="w-4 h-4" />
          <span>2. Бөглөсөн хуудас сканнердах & Автоматаар дүгнэх</span>
        </button>

        <button
          onClick={() => setActiveTab("scan-history")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "scan-history"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-700 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. Сканнердсан хуудсуудын түүх ({scannedHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pdf-debugger")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "pdf-debugger"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-700 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>4. 🔍 PDF & OCR Түлхүүр оношилгоо (Debug Utility)</span>
          {parseMismatches.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
              {parseMismatches.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PREPARE EXAM & PRINT ANSWER SHEET */}
      {/* ========================================================================= */}
      {activeTab === "prepare-print" && (
        <div className="space-y-8">
          {/* Controls Panel (Hidden in Print) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Шалгалт & Хариултын Хуудасны Тохиргоо
                </h3>
                <p className="text-xs text-slate-700">
                  Сурагчдаас Регистрийн дугаар асуухгүй, 6 оронтой тусгай кодоор дугуйлуулах стандарт загвар
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewExamModal(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Өөр шинэ шалгалт бүртгэх үү?</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Select Exam */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Шалгалт сонгох:</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      [{ex.year}] {ex.title} ({ex.totalQuestions} асуулт)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Variant */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Шалгалтын хувилбар:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["A", "B", "C", "D"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                        selectedVariant === v
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      Хувилбар {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Print Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Хуудасны хэлбэр:</label>
                <select
                  value={printMode}
                  onChange={(e) => setPrintMode(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="blank">Хоосон хуудас (Сурагч өөрөө кодоо бөглөнө)</option>
                  <option value="single_student">Нэг сурагчийн нэр, кодоор бөглөх</option>
                  <option value="batch_class">Ангийн бүх сурагчдаар багцалж хэвлэх</option>
                </select>
              </div>
            </div>

            {/* If Single Student or Batch class is chosen */}
            {printMode !== "blank" && (
              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-indigo-950">Анги сонгох:</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setSelectedStudentId("");
                    }}
                    className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.code})
                      </option>
                    ))}
                  </select>
                </div>

                {printMode === "single_student" && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-950">Сурагч сонгох:</label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Сурагч сонгох --</option>
                      {classStudents.map((stu) => (
                        <option key={stu.id} value={stu.id}>
                          {stu.name} {stu.studentCode ? `(Код: ${stu.studentCode})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* 6-DIGIT STUDENT CODE CLASS ROSTER PANEL */}
            {selectedClassId !== "none" && classStudents.length > 0 && (
              <div className="p-5 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-indigo-50/80 rounded-2xl border border-indigo-200/80 space-y-3.5 print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {selectedClass?.name || "Сонгосон анги"} — Сурагчдын 6 оронтой OMR код
                      </h4>
                      <p className="text-[11px] text-slate-700">
                        Нийт {classStudents.length} сурагчид 6 оронтой код автоматаар олгогдсон тул Регистрийн дугаар асуухгүй, уг кодоор шалгалт авна.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const text = `${selectedClass?.name || "Анги"} OMR Кодын жагсаалт:\n` +
                          classStudents.map((s) => `${s.studentCode} | ${s.name} (${s.grade || "12-р анги"})`).join("\n");
                        navigator.clipboard.writeText(text);
                        setCopiedRosterMsg("Жагсаалт хуулагдлаа!");
                        setTimeout(() => setCopiedRosterMsg(null), 3000);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedRosterMsg || "Кодуудыг хуулах"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrintMode("batch_class");
                        setTimeout(() => window.print(), 200);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Бүх сурагчдаар хэвлэх</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {classStudents.map((stu) => {
                    const isSelected = selectedStudentId === stu.id;
                    return (
                      <div
                        key={stu.id}
                        onClick={() => {
                          setPrintMode("single_student");
                          setSelectedStudentId(stu.id);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-white text-slate-800 border-indigo-100 hover:border-indigo-300 hover:shadow-2xs"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold truncate">{stu.name}</div>
                          <div className={`text-[10px] ${isSelected ? "text-indigo-200" : "text-slate-700"}`}>
                            {stu.grade || "12-р анги"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg ${
                            isSelected ? "bg-indigo-800 text-white" : "bg-indigo-100 text-indigo-900 border border-indigo-200"
                          }`}>
                            {stu.studentCode}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* OFFICIAL HIGH-RESOLUTION PRINTABLE & DOWNLOADABLE ANSWER SHEET */}
          <OfficialOMRSheet
            examTitle={currentExam.title}
            variant={selectedVariant}
            studentName={selectedStudent?.name || ""}
            studentCode={selectedStudent?.studentCode || ""}
            totalQuestions={currentExam.totalQuestions || 50}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCAN & AUTO-GRADE */}
      {/* ========================================================================= */}
      {activeTab === "scan-grade" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Upload & Student Code Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">1. Хуудас & Сурагчийн код</h3>

              {/* Student Code Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>Сурагчийн 6 оронтой код:</span>
                  {matchedStudent && (
                    <span className="text-emerald-600 font-bold">✓ {matchedStudent.name}</span>
                  )}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={scanStudentCode}
                  onChange={(e) => setScanStudentCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Жишээ: 123456"
                  className="w-full px-3 py-2 text-sm font-mono font-bold tracking-widest text-center border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-700">
                  {matchedStudent
                    ? `Танигдсан: ${matchedStudent.name} • ${matchedStudent.grade || "12-р анги"} (${matchedStudent.school || "Сургууль"})`
                    : "6 оронтой кодыг оруулахад систем сурагчийг автоматаар танина."}
                </p>
              </div>

              {/* Exam & Variant Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Шалгалт сонгох:</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      [{ex.year}] {ex.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Хувилбар:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["A", "B", "C", "D"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                        selectedVariant === v
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  2. Бөглөсөн OMR хуудасны зураг
                </label>

                <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50">
                  <Camera className="w-8 h-8 text-indigo-500 mb-2" />
                  <span className="text-xs font-bold text-slate-800">Камераар авах / Зураг оруулах</span>
                  <span className="text-[10px] text-slate-700 mt-0.5">JPG, PNG, WebP форматаар</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadedPreview && (
                  <div className="p-2 rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={uploadedPreview}
                      alt="OMR Scanned preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <p className="text-[10px] text-slate-700 mt-1 text-center font-bold">
                      Зураг амжилттай бэлэн боллоо
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                disabled={isScanning}
                onClick={handleRunScan}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                <ScanLine className="w-4 h-4" />
                <span>{isScanning ? "OMR Уншиж байна..." : "OMR Сканнердах & Оноо бодох"}</span>
              </button>
            </div>
          </div>

          {/* Right 2 Columns: Scan Results & Detailed Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {savedSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{savedSuccessMsg}</span>
              </div>
            )}

            {scanResult ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 animate-in fade-in">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-base font-bold text-slate-900">Скан Амжилттай Дууслаа</h3>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">
                      Сурагчийн код:{" "}
                      <span className="font-mono font-bold text-slate-900">{scanResult.studentCode}</span>{" "}
                      ({scanResult.studentName}) • Хувилбар {scanResult.variant}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-700 font-bold uppercase">ЭЕШ Хуваарьт оноо</div>
                      <div className="text-2xl font-black text-indigo-600">
                        {scanResult.scaledScore} / 800
                      </div>
                    </div>
                    <div className="text-right pl-3 border-l border-slate-200">
                      <div className="text-[10px] text-slate-700 font-bold uppercase">Түүхий оноо</div>
                      <div className="text-2xl font-black text-emerald-600">
                        {scanResult.score} / {currentExam.totalQuestions || 50}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ambiguity notice */}
                {scanResult.status === "pending_verification" && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 space-y-1">
                      <p className="font-bold">Эргэлзээтэй тэмдэглэгээ (Бүдэг/Давхар будалт) илэрлээ</p>
                      <p>
                        Доорх шар өнгөөр тэмдэглэгдсэн асуултууд дээр дарж багш та зөв хариултыг баталгаажуулах боломжтой.
                      </p>
                    </div>
                  </div>
                )}

                {/* 50 Questions Detailed Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      50 Асуултын Сканнерын Үр Дүн & Баталгаажуулалт
                    </h4>
                    <span className="text-[11px] text-slate-700">
                      (Ногоон = Зөв, Улаан = Буруу, Шар = Эргэлзээтэй)
                    </span>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {Array.from({ length: currentExam.totalQuestions || 50 }).map((_, i) => {
                      const qNum = i + 1;
                      const scanned = scanResult.scannedAnswers[qNum];
                      const q = currentExam.questions[i];
                      const correctAns = q ? q.correctAnswer : "A";
                      const currentAns = teacherOverrides[qNum] || scanned?.answer || "-";
                      const isCorrect = currentAns === correctAns;
                      const isAmbiguous = scanned?.ambiguous && !teacherOverrides[qNum];

                      return (
                        <div
                          key={qNum}
                          className={`p-2 rounded-xl text-center border text-xs relative group cursor-pointer transition-all ${
                            isAmbiguous
                              ? "bg-amber-100 border-amber-300 text-amber-950 font-bold"
                              : isCorrect
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                              : "bg-rose-50 border-rose-200 text-rose-950 font-bold"
                          }`}
                          onClick={() => {
                            // Quick toggle answer on click
                            const next = currentAns === "A" ? "B" : currentAns === "B" ? "C" : currentAns === "C" ? "D" : currentAns === "D" ? "E" : "A";
                            setTeacherOverrides({ ...teacherOverrides, [qNum]: next });
                          }}
                          title={`Асуулт ${qNum}: Сканнердсан: ${currentAns}, Зөв түлхүүр: ${correctAns}. Дараад засах боломжтой.`}
                        >
                          <div className="text-[10px] text-slate-700">{qNum}</div>
                          <div className="text-sm font-black mt-0.5">{currentAns}</div>
                          <div className="text-[9px] text-slate-700">Түлхүүр: {correctAns}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Detailed Analysis Card */}
                {scanResult.aiAnalysis && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-slate-50 to-blue-50/70 border border-indigo-200/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-xs">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Хиймэл Оюун Ухааны (AI) Дэлгэрэнгүй Шинжилгээ
                          </h4>
                          <p className="text-[10px] text-slate-700">
                            Сурагчийн алдааны загвар, сул тал & цаашид давтах сэдвийн зөвлөмж
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        AI Анализ Бэлэн
                      </span>
                    </div>

                    {/* Executive Summary */}
                    <div className="text-xs text-slate-800 leading-relaxed bg-white/90 p-3 rounded-xl border border-indigo-100/60 shadow-2xs">
                      {scanResult.aiAnalysis.summary}
                    </div>

                    {/* Strengths and Weaknesses Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Strengths */}
                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/60 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Давуу талууд ({scanResult.aiAnalysis.strengths.length})</span>
                        </div>
                        <ul className="space-y-1 text-slate-700 text-[11px]">
                          {scanResult.aiAnalysis.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/60 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Сайжруулах талууд ({scanResult.aiAnalysis.weaknesses.length})</span>
                        </div>
                        <ul className="space-y-1 text-slate-700 text-[11px]">
                          {scanResult.aiAnalysis.weaknesses.map((weak, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-rose-500 mt-0.5">•</span>
                              <span>{weak}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recommended Topics for Review */}
                    {scanResult.aiAnalysis.recommendedTopics?.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span>🎯 Давтах шаардлагатай сэдвүүд (Сурагчийн талбарт харагдана):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {scanResult.aiAnalysis.recommendedTopics.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 truncate max-w-[180px]">{item.topic}</span>
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    item.priority === "high"
                                      ? "bg-rose-100 text-rose-800"
                                      : item.priority === "medium"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {item.priority === "high" ? "Яаралтай давтах" : "Анхаарах"}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-700 leading-snug">{item.reason}</p>
                              <div className="text-[10px] font-medium text-indigo-600 pt-0.5">
                                💡 {item.suggestedAction}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Save Confirmation Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-700">
                    Үр дүнг баталгаажуулан сурагчийн түүхэнд бүртгэх үү?
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveVerifiedSubmission}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Дүнг Системд Хадгалах</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <ScanLine className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">Бөглөсөн OMR хуудсаа сканнердаарай</h4>
                <p className="text-xs text-slate-700 max-w-sm mx-auto">
                  Зүүн талын цонхонд сурагчийн 6 оронтой кодыг оруулан, бөглөсөн цаасан хуудасны зургийг оруулахад систем автоматаар шалгана.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SCANNED SHEETS LOG / ARCHIVE */}
      {/* ========================================================================= */}
      {activeTab === "scan-history" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Сканнердсан Цаасан Хуудсуудын Түүх
              </h3>
              <p className="text-xs text-slate-700">
                Камераар шалгасан бүх цаасан шалгалтын архивын жагсаалт
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Нийт: {scannedHistory.length} хуудас
            </span>
          </div>

          {scannedHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-700 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs">Одоогоор сканнердсан хуудас бүртгэгдээгүй байна.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Сурагчийн код</th>
                    <th className="py-2.5 px-3">Сурагчийн нэр</th>
                    <th className="py-2.5 px-3">Шалгалт</th>
                    <th className="py-2.5 px-3">Хувилбар</th>
                    <th className="py-2.5 px-3">Оноо</th>
                    <th className="py-2.5 px-3">Хуваарьт (800)</th>
                    <th className="py-2.5 px-3">Төлөв</th>
                    <th className="py-2.5 px-3">Огноо</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scannedHistory.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {scan.studentCode}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">{scan.studentName}</td>
                      <td className="py-3 px-3 text-slate-700 max-w-xs truncate">{scan.examTitle}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">Хувилбар {scan.variant}</td>
                      <td className="py-3 px-3 font-black text-emerald-600">{scan.score}</td>
                      <td className="py-3 px-3 font-black text-indigo-600">{scan.scaledScore}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Баталгаажсан
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {new Date(scan.scannedAt).toLocaleDateString("mn-MN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PDF & OCR DEBUGGING UTILITY */}
      {/* ========================================================================= */}
      {activeTab === "pdf-debugger" && (
        <OMRDebugUtility
          rawOcrText={rawOcrText}
          onRawOcrTextChange={setRawOcrText}
          aiQuestionsList={aiQuestionsList}
          onAiQuestionsChange={setAiQuestionsList}
          answerKeys={newExamAnswerKey}
          onAnswerKeyChange={setNewExamAnswerKey}
          parseMismatches={parseMismatches}
          isAnalyzing={isAnalyzingPdf}
          analysisStep={pdfAnalysisStep}
          onReanalyze={(text) => handleAnalyzePdfKeys(text)}
          onSaveExam={() => handleSaveNewExam()}
          examTitle={newExamTitle}
          onExamTitleChange={setNewExamTitle}
          examVariant={newExamVariant}
          onExamVariantChange={setNewExamVariant}
          questionCount={newExamQCount}
          onQuestionCountChange={(count) => setNewExamQCount(count)}
          onFileUpload={handlePdfFileUpload}
          pdfFileName={pdfFileName}
          onLoadPreset={handleLoadPreset}
          examCategory={newExamCategory}
          onExamCategoryChange={setNewExamCategory}
          examYear={newExamYear}
          onExamYearChange={setNewExamYear}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER NEW PAPER EXAM INTO SYSTEM (PDF + AI OR MANUAL) */}
      {/* ========================================================================= */}
      {showNewExamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Шинэ Цаасан Шалгалт & Түлхүүр Бүртгэх
                  </h3>
                  <p className="text-[11px] text-slate-700">
                    Шалгалтын PDF оруулан хиймэл оюунаар зөв түлхүүрүүд үүсгэх эсвэл гараар тохируулах
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewExamModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setExamCreationMode("pdf_ai")}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  examCreationMode === "pdf_ai"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>PDF Оруулах & AI Түлхүүр Үүсгэх (Зөвлөмжит)</span>
              </button>
              <button
                type="button"
                onClick={() => setExamCreationMode("manual")}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  examCreationMode === "manual"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Гараар түлхүүр оруулах</span>
              </button>
            </div>

            <form onSubmit={handleSaveNewExam} className="space-y-5 text-xs">
              {/* Common Details */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700">Шалгалтын гарчиг / нэр:</label>
                  <input
                    type="text"
                    required
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    placeholder="Жишээ: 12-р ангийн ЭЕШ сорилт (2026) - Хувилбар A"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Ангилал:</label>
                  <select
                    value={newExamCategory}
                    onChange={(e) => setNewExamCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="past_paper">📘 Өмнөх оны ЭЕШ</option>
                    <option value="mock">⚡ 7 хоногийн Mock</option>
                    <option value="practice">🎯 Нэмэлт дасгал</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Он:</label>
                  <select
                    value={newExamYear}
                    onChange={(e) => setNewExamYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                      <option key={y} value={y}>
                        {y} он
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PDF + AI SECTION */}
              {examCreationMode === "pdf_ai" && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
                        <FileUp className="w-4 h-4 text-indigo-600" />
                        <span>Шалгалтын PDF / Материал оруулах</span>
                      </h4>
                      <p className="text-[11px] text-slate-700">
                        Шалгалтынхаа PDF файлыг сонгоход Gemini AI асуулт бүрийн түлхүүр & сэдвийг автоматаар бэлтгэнэ.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPdfFileName("12_Angi_ESH_Uulirlyn_Sorilt_2026.pdf");
                        if (!newExamTitle) {
                          setNewExamTitle("12-р ангийн ЭЕШ жишиг сорилт 2026");
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 shadow-2xs transition-colors self-start sm:self-auto"
                    >
                      📄 Жишээ PDF файл бэлтгэх
                    </button>
                  </div>

                  {/* Drop zone / file selector */}
                  <div className="p-4 bg-white rounded-xl border border-dashed border-indigo-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{pdfFileName}</div>
                        <div className="text-[10px] text-slate-700">Формат: PDF, DOCX, TXT • 50 даалгавар</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors">
                        <span>Өөр файл сонгох</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handlePdfFileUpload(file);
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleAnalyzePdfKeys()}
                        disabled={isAnalyzingPdf}
                        className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {isAnalyzingPdf ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>AI Түлхүүр бодож байна...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI-аар Зөв Түлхүүрийг Үүсгэх</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowNewExamModal(false);
                          setActiveTab("pdf-debugger");
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl border border-amber-300 flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        <span>🔍 Оношилгооны хэрэгсэлд нээх</span>
                      </button>
                    </div>
                  </div>

                  {/* Processing banner */}
                  {isAnalyzingPdf && (
                    <div className="p-3 bg-white rounded-xl border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                      <span className="font-medium">{pdfAnalysisStep || "AI Шалгалтын хуудсыг шинжилж байна..."}</span>
                    </div>
                  )}

                  {/* AI Generated Review Section with Ambiguity Warnings */}
                  {aiQuestionsList.length > 0 && !isAnalyzingPdf && (
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-indigo-200 shadow-2xs">
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Нийт {aiQuestionsList.length} асуултын түлхүүр амжилттай үүслээ</span>
                          </div>
                          <p className="text-[11px] text-slate-700 mt-0.5">
                            Эргэлзээтэй гэж үзсэн асуултыг шар өнгөөр тодруулсан бөгөөд багш та гараар дарж шууд засах боломжтой.
                          </p>
                        </div>

                        {/* Ambiguous filter button */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setFilterAmbiguousOnly(false)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                              !filterAmbiguousOnly
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            Бүх {aiQuestionsList.length}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFilterAmbiguousOnly(true)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                              filterAmbiguousOnly
                                ? "bg-amber-500 text-white"
                                : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Эргэлзээтэй ({aiQuestionsList.filter((q) => q.isAmbiguous || q.confidence < 0.85).length})</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive Questions Table */}
                      <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                        {aiQuestionsList
                          .filter((q) => !filterAmbiguousOnly || (q.isAmbiguous || q.confidence < 0.85))
                          .map((q) => {
                            const qNum = q.questionNumber;
                            const currentVal = newExamAnswerKey[qNum] || q.correctAnswer;
                            const isAmbiguous = q.isAmbiguous || q.confidence < 0.85;

                            return (
                              <div
                                key={qNum}
                                className={`p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors ${
                                  isAmbiguous ? "bg-amber-50/60" : ""
                                }`}
                              >
                                <div className="space-y-0.5 min-w-0 pr-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-slate-900">№{qNum}.</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                                      {q.category}
                                    </span>
                                    <span className="text-[10px] text-slate-700 font-medium">
                                      {q.topic}
                                    </span>
                                    {isAmbiguous && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 flex items-center gap-0.5">
                                        <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                                        <span>Эргэлзээтэй / Багш хянах</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-700 truncate max-w-md">
                                    {q.text}
                                  </div>
                                  {expandedExplanationQ === qNum && (
                                    <div className="text-[10px] text-indigo-900 bg-indigo-50/80 p-2 rounded-lg mt-1 border border-indigo-100">
                                      💡 AI Шалтгаан: {q.explanation} (Итгэл: {Math.round(q.confidence * 100)}%)
                                    </div>
                                  )}
                                </div>

                                {/* Answer Selection Buttons (A, B, C, D, E) */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedExplanationQ(expandedExplanationQ === qNum ? null : qNum)
                                    }
                                    className="p-1 rounded hover:bg-slate-200 text-slate-700"
                                    title="Тайлбар үзэх"
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                  </button>

                                  {(["A", "B", "C", "D", "E"] as const).map((opt) => {
                                    const isChosen = currentVal === opt;
                                    return (
                                      <button
                                        key={`${qNum}-${opt}`}
                                        type="button"
                                        onClick={() =>
                                          setNewExamAnswerKey({
                                            ...newExamAnswerKey,
                                            [qNum]: opt,
                                          })
                                        }
                                        className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                                          isChosen
                                            ? "bg-indigo-600 text-white shadow-xs"
                                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MANUAL KEY ENTRY SECTION */}
              {examCreationMode === "manual" && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-900">
                      Зөв хариултын түлхүүр ({newExamQCount} асуулт):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = ["A", "B", "C", "D", "E"];
                        const newKey: Record<number, string> = {};
                        for (let i = 1; i <= newExamQCount; i++) {
                          newKey[i] = sample[Math.floor(Math.random() * 5)];
                        }
                        setNewExamAnswerKey(newKey);
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      Санамсаргүй түлхүүр үүсгэх
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {Array.from({ length: newExamQCount }).map((_, idx) => {
                        const qNum = idx + 1;
                        const current = newExamAnswerKey[qNum] || "A";
                        return (
                          <div
                            key={qNum}
                            className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200"
                          >
                            <span className="font-bold text-slate-700">{qNum}.</span>
                            <select
                              value={current}
                              onChange={(e) =>
                                setNewExamAnswerKey({
                                  ...newExamAnswerKey,
                                  [qNum]: e.target.value,
                                })
                              }
                              className="px-1.5 py-0.5 font-bold text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                              <option value="E">E</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewExamModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Цуцлах
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Шалгалтыг Системд Бүртгэх & OMR Хуудас Бэлтгэх</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
