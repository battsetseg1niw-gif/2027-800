import React, { useRef, useState, useEffect } from "react";
import {
  Printer,
  Download,
  CheckCircle2,
  FileDown,
  Sparkles,
  Info,
  RefreshCw,
  Eye,
  Check,
  Award,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface OfficialOMRSheetProps {
  examTitle?: string;
  variant?: "A" | "B" | "C" | "D";
  studentName?: string;
  studentCode?: string;
  totalQuestions?: number;
  className?: string;
  onClose?: () => void;
}

export const OfficialOMRSheet: React.FC<OfficialOMRSheetProps> = ({
  examTitle = "ЭЕШ АНГЛИ ХЭЛНИЙ АЛБАН ЁСНЫ ШАЛГАЛТ",
  variant = "A",
  studentName = "",
  studentCode = "104829",
  totalQuestions = 60,
  className = "",
  onClose,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<"A" | "B" | "C" | "D">(variant);
  const [codeDigits, setCodeDigits] = useState(studentCode ? studentCode.padEnd(7, "0").slice(0, 7) : "1048290");
  const [sheetQuestionCount, setSheetQuestionCount] = useState<50 | 60>(totalQuestions <= 50 ? 50 : 60);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  useEffect(() => {
    if (variant) setSelectedVariant(variant);
  }, [variant]);

  useEffect(() => {
    if (studentCode) {
      setCodeDigits(studentCode.padEnd(7, "0").slice(0, 7));
    }
  }, [studentCode]);

  useEffect(() => {
    if (totalQuestions) {
      setSheetQuestionCount(totalQuestions <= 50 ? 50 : 60);
    }
  }, [totalQuestions]);

  const sheetRef = useRef<HTMLDivElement>(null);

  // High-Resolution Direct Download as PNG using Canvas
  const handleDownloadImage = async () => {
    setIsGeneratingDownload(true);
    try {
      // Create high-resolution canvas matching standard A4 ratio (1240 x 1754 px at ~150DPI)
      const width = 1240;
      const height = 1754;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context not available");

      // White A4 background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // 1. Four Corner Optical Registration Fiducial Markers (for scanners / cameras)
      const fiducialSize = 26;
      ctx.fillStyle = "#000000";
      ctx.fillRect(24, 24, fiducialSize, fiducialSize); // Top-Left
      ctx.fillRect(width - 24 - fiducialSize, 24, fiducialSize, fiducialSize); // Top-Right
      ctx.fillRect(24, height - 24 - fiducialSize, fiducialSize, fiducialSize); // Bottom-Left
      ctx.fillRect(width - 24 - fiducialSize, height - 24 - fiducialSize, fiducialSize, fiducialSize); // Bottom-Right

      // 2. Left Optical Timing Blocks
      const timingCount = 52;
      const blockH = 14;
      const blockW = 16;
      const startY = 70;
      const stepY = (height - 140) / timingCount;
      for (let i = 0; i < timingCount; i++) {
        ctx.fillRect(24, startY + i * stepY, blockW, blockH);
      }

      // 3. Right vertical barcode placeholder
      const rightColX = width - 68;
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(rightColX, 260, 42, 1180);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.save();
      ctx.translate(rightColX + 26, 420);
      ctx.rotate(Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillText("SMARTESH ОПТИК СИСТЕМИЙН ХЯНАЛТЫН ТАЛБАР", 420, 0);
      ctx.restore();

      // 4. HEADER: SmartESH Logo and Official Title
      const contentLeft = 60;
      const contentRight = width - 80;

      // SmartESH Emblem Left
      ctx.fillStyle = "#1e3a8a";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(contentLeft, 48, 56, 56, 12) : ctx.rect(contentLeft, 48, 56, 56);
      ctx.fill();

      // Inner icon symbol
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("S", contentLeft + 28, 85);

      // SmartESH Brand Text
      ctx.textAlign = "left";
      ctx.fillStyle = "#1e3a8a";
      ctx.font = "900 26px sans-serif";
      ctx.fillText("SmartESH", contentLeft + 68, 74);
      ctx.fillStyle = "#475569";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("ЭЕШ-ЫН УХААЛАГ ЦАХИМ СИСТЕМ", contentLeft + 68, 94);

      // Center Title
      ctx.textAlign = "center";
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 30px sans-serif";
      ctx.fillText("Х А Р И У Л Т Ы Н   Х У У Д А С", width / 2 + 30, 72);
      ctx.fillStyle = "#2563eb";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("МОНГОЛ УЛСЫН ЭЕШ СТАНДАРТ OMR ХУУДАС (ОПТИК УНШИГЧИД ЗОРИУЛСАН)", width / 2 + 30, 95);

      // Top Right QR / Barcode box
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(contentRight - 110, 48, 110, 56);
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SMARTESH-OMR", contentRight - 55, 70);
      ctx.fillText("ID: 2026-" + selectedVariant, contentRight - 55, 86);

      // Divider Line
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(contentLeft, 118);
      ctx.lineTo(contentRight, 118);
      ctx.stroke();

      // 5. TOP SECTION: Student Code (Left) | Variant Selection (Center) | Instructions (Right)
      const topSecY = 135;

      // ==========================================
      // A. СУРАГЧИЙН КОД (Student Code - 7 Digits)
      // ==========================================
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("СУРАГЧИЙН КОД:", contentLeft, topSecY + 12);

      const sBoxW = 28;
      const sBoxH = 28;
      const sStartX = contentLeft;
      const sStartY = topSecY + 22;

      // Top Write-in Boxes
      for (let c = 0; c < 7; c++) {
        const bx = sStartX + c * (sBoxW + 6);
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1.8;
        ctx.strokeRect(bx, sStartY, sBoxW, sBoxH);
        ctx.fillStyle = "#0f172a";
        ctx.font = "900 17px monospace";
        ctx.textAlign = "center";
        ctx.fillText(codeDigits[c] || "", bx + sBoxW / 2, sStartY + 20);
      }

      // Horizontal Oval Bubbles for Digits 0 to 9
      const sOvalW = 12; // radiusX
      const sOvalH = 7.5; // radiusY (Horizontal oval!)
      const bubbleStartY = sStartY + sBoxH + 16;
      const bubbleStepY = 22;

      for (let c = 0; c < 7; c++) {
        const bx = sStartX + c * (sBoxW + 6) + sBoxW / 2;
        const currentDigit = parseInt(codeDigits[c], 10);

        for (let d = 0; d < 10; d++) {
          const by = bubbleStartY + d * bubbleStepY;
          const isFilled = !isNaN(currentDigit) && currentDigit === d;

          ctx.beginPath();
          ctx.ellipse(bx, by, sOvalW, sOvalH, 0, 0, Math.PI * 2);

          if (isFilled) {
            ctx.fillStyle = "#0f172a";
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.font = "900 10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(String(d), bx, by + 3.5);
          } else {
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(String(d), bx, by + 3.5);
          }
        }
      }

      // ==========================================
      // B. ШАЛГАЛТЫН ХУВИЛБАР (Variant A, B, C, D)
      // ==========================================
      const variantStartX = contentLeft + 260;
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("ШАЛГАЛТЫН ХУВИЛБАР:", variantStartX, topSecY + 12);

      const variants: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
      const vBoxY = topSecY + 28;
      const vOvalW = 16;
      const vOvalH = 10;

      variants.forEach((v, idx) => {
        const vx = variantStartX + 24 + idx * 46;
        const isSelected = selectedVariant === v;

        ctx.beginPath();
        ctx.ellipse(vx, vBoxY + 16, vOvalW, vOvalH, 0, 0, Math.PI * 2);

        if (isSelected) {
          ctx.fillStyle = "#0f172a";
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "900 13px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(v, vx, vBoxY + 20.5);
        } else {
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "#0f172a";
          ctx.font = "900 13px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(v, vx, vBoxY + 20.5);
        }
      });

      // Quick Instruction underneath Variant
      ctx.fillStyle = "#475569";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Та өөрийн шалгалтын хувилбарыг дээрх зууван нүдэнд тод будна уу.", variantStartX, topSecY + 80);

      // ==========================================
      // C. БУДАХ САХИМ ЗААВАР (Instructions Box)
      // ==========================================
      const instBoxX = variantStartX;
      const instBoxY = topSecY + 105;
      const instBoxW = contentRight - instBoxX;
      const instBoxH = 195;

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(instBoxX, instBoxY, instBoxW, instBoxH);

      // Box Header
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(instBoxX, instBoxY, instBoxW, 26);
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("САНАМЖ & ЗӨВ БУДАХ ЗААВАР", instBoxX + 10, instBoxY + 17);

      ctx.fillStyle = "#334155";
      ctx.font = "11px sans-serif";
      ctx.fillText("1. Зөвхөн 2B зөөлөн балын харандаагаар зууван нүдийг бүрэн дүүргэж будна.", instBoxX + 10, instBoxY + 48);
      ctx.fillText("2. Үзэг, тосон бал, баллуур ашиглахдаа цаасыг урахгүй, цэвэр арчина уу.", instBoxX + 10, instBoxY + 70);
      ctx.fillText("3. Нугалж, үрчийлгэж болохгүй (Машин автоматаар уншина).", instBoxX + 10, instBoxY + 92);

      // Correct vs Incorrect horizontal oval examples
      const exY = instBoxY + 130;
      // Correct
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("Зөв будах:", instBoxX + 12, exY);
      ctx.beginPath();
      ctx.ellipse(instBoxX + 90, exY - 4, 14, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("●", instBoxX + 90, exY);

      // Incorrect
      ctx.textAlign = "left";
      ctx.fillStyle = "#0f172a";
      ctx.fillText("Буруу:", instBoxX + 130, exY);

      // X mark inside oval
      ctx.beginPath();
      ctx.ellipse(instBoxX + 185, exY - 4, 14, 8, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = "#dc2626";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✕", instBoxX + 185, exY);

      // Half filled
      ctx.beginPath();
      ctx.ellipse(instBoxX + 225, exY - 4, 14, 8, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#dc2626";
      ctx.stroke();
      ctx.fillStyle = "#dc2626";
      ctx.fillText("◐", instBoxX + 225, exY);

      // Checkmark
      ctx.beginPath();
      ctx.ellipse(instBoxX + 265, exY - 4, 14, 8, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#dc2626";
      ctx.stroke();
      ctx.fillStyle = "#dc2626";
      ctx.fillText("✓", instBoxX + 265, exY);

      // 6. MAIN LOWER BODY: 1-Р ХЭСЭГ (Questions 1 to 50 or 60 in 2 columns) & 2-Р ХЭСЭГ
      const mainY = 415;
      const halfCount = sheetQuestionCount === 60 ? 30 : 25;
      const qRowH = sheetQuestionCount === 60 ? 39 : 46.8;

      // Section 1 Header Banner
      const sec1W = 710;
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(contentLeft, mainY, sec1W, 28);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`1 - Р   Х Э С Э Г   (СОНГОХ ДААЛГАВАРУУД  1 - ${sheetQuestionCount})`, contentLeft + sec1W / 2, mainY + 19);

      // Questions (Left sub-column: 1 to halfCount) and (Right sub-column: halfCount+1 to sheetQuestionCount)
      const qCols = [
        { start: 1, end: halfCount, x: contentLeft },
        { start: halfCount + 1, end: sheetQuestionCount, x: contentLeft + 355 },
      ];

      const qTableY = mainY + 36;
      const options = ["A", "B", "C", "D", "E"];

      qCols.forEach((col) => {
        for (let q = col.start; q <= col.end; q++) {
          const rowY = qTableY + (q - col.start) * qRowH;

          // Striped row
          if (q % 2 === 0) {
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(col.x, rowY - 14, 340, qRowH - 2);
          }

          // Question Number
          ctx.fillStyle = "#0f172a";
          ctx.font = "900 12px monospace";
          ctx.textAlign = "right";
          ctx.fillText(String(q).padStart(2, "0"), col.x + 28, rowY);

          // Horizontal Oval Bubbles for A, B, C, D, E (Spacious 14x9.5 standard optical size)
          options.forEach((opt, optIdx) => {
            const ovalX = col.x + 65 + optIdx * 54;
            const ovalY = rowY - 4;
            const rX = 14;   // Horizontal Oval Radius X
            const rY = 9.5;  // Horizontal Oval Radius Y

            ctx.beginPath();
            ctx.ellipse(ovalX, ovalY, rX, rY, 0, 0, Math.PI * 2);
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 1.4;
            ctx.stroke();

            ctx.fillStyle = "#0f172a";
            ctx.font = "900 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(opt, ovalX, ovalY + 4);
          });

          // Horizontal divider line every 5 questions for clear optical grouping
          if (q % 5 === 0 && q !== col.end) {
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(col.x, rowY + (qRowH / 2) - 4);
            ctx.lineTo(col.x + 340, rowY + (qRowH / 2) - 4);
            ctx.stroke();
          }
        }
      });

      // Section 2 Header Banner (Right Column - 2-р хэсэг өөрчлөхгүй)
      const sec2X = contentLeft + sec1W + 20;
      const sec2W = contentRight - sec2X;
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(sec2X, mainY, sec2W, 28);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("2 - Р   Х Э С Э Г   (ЗАДГАЙ ДААЛГАВАР)", sec2X + sec2W / 2, mainY + 19);

      // Section 2 Sub-blocks: 2.1, 2.2, 2.3, 2.4 (Distributed generously over full A4 height)
      const sec2Items = ["2.1", "2.2", "2.3", "2.4"];
      const blockH2 = 278;
      const gap2 = 14;
      sec2Items.forEach((sName, sIdx) => {
        const sy = mainY + 36 + sIdx * (blockH2 + gap2);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.3;
        ctx.strokeRect(sec2X, sy, sec2W, blockH2);

        // Header
        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(sec2X, sy, sec2W, 26);
        ctx.fillStyle = "#0f172a";
        ctx.font = "900 12px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`Даалгавар ${sName}:`, sec2X + 10, sy + 18);

        // Digits header: 0 to 9
        ctx.font = "bold 10px monospace";
        for (let d = 0; d < 10; d++) {
          ctx.fillStyle = "#475569";
          ctx.textAlign = "center";
          ctx.fillText(String(d), sec2X + 45 + d * 29, sy + 44);
        }

        // Rows a, b, c, d
        const subRows = ["a", "b", "c", "d"];
        subRows.forEach((rLetter, rIdx) => {
          const ry = sy + 70 + rIdx * 50;
          ctx.fillStyle = "#0f172a";
          ctx.font = "900 12px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(rLetter, sec2X + 16, ry + 3);

          for (let d = 0; d < 10; d++) {
            const ox = sec2X + 45 + d * 29;
            ctx.beginPath();
            ctx.ellipse(ox, ry, 11, 7.5, 0, 0, Math.PI * 2);
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 9px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(String(d), ox, ry + 3);
          }
        });
      });

      // 7. FOOTER: Professional SmartESH standard note (Positioned at bottom edge)
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(contentLeft, height - 75);
      ctx.lineTo(contentRight, height - 75);
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.font = "900 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`SmartESH Оптик үнэлгээний стандарт хуудас • 1-р хэсэг (${sheetQuestionCount} тест) • 2-р хэсэг (Задгай)`, contentLeft, height - 54);

      ctx.fillStyle = "#64748b";
      ctx.font = "10px sans-serif";
      ctx.fillText("Энэхүү хуудсыг SmartESH систем болон гар утасны камераар өндөр нарийвчлалтай автоматаар засна.", contentLeft, height - 38);

      ctx.textAlign = "right";
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 12px monospace";
      ctx.fillText(`ХУВИЛБАР [ ${selectedVariant} ]`, contentRight, height - 54);

      // Convert to downloadable PNG file
      const dataUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = `SmartESH_OMR_Sheet_${selectedVariant}_2026.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("Download failed:", err);
      window.print();
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn("Direct window.print() failed", err);
    }
    setPrintNotice(
      "Хэрэв хэвлэх цонх автоматаар нээгдэхгүй бол 'Хариултын хуудас татах (PNG/Зураг)' товчоор А4 бүрэн эхийг шууд татаж аваад хэвлээрэй."
    );
    setTimeout(() => setPrintNotice(null), 8000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Action Bar (Hidden on print) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs print:hidden space-y-4">
        {printNotice && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{printNotice}</span>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-600/30">
              S
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold mb-1">
                <Sparkles className="w-3 h-3" />
                <span>SmartESH Албан ёсны OMR хуудас • Хэвтээ зууван нүдтэй</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Шалгалтын Хариултын Хуудас (OMR Answer Sheet)
              </h3>
              <p className="text-xs text-slate-500">
                А4 хуудсыг бүрэн эзлэх хэмжээтэй, хэвтээ зууван нүдтэй, зөвхөн сурагчийн хувийн кодоор бөглөгдөх мэргэжлийн стандарт хуудас.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Direct High-Resolution Download Button */}
            <button
              id="btn-download-omr-image"
              onClick={handleDownloadImage}
              disabled={isGeneratingDownload}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isGeneratingDownload ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Татаж байна...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Амжилттай татагдлаа!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Хариултын хуудас татах (PNG/Зураг)</span>
                </>
              )}
            </button>

            {/* Print / Save as PDF Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4 Хэвлэх (Print)</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Хаах
              </button>
            )}
          </div>
        </div>

        {/* Quick Customization Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Шалгалтын хувилбар:</label>
            <div className="grid grid-cols-4 gap-1">
              {(["A", "B", "C", "D"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                    selectedVariant === v
                      ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Даалгаврын тоо (Хуудасны хэмжээ):</label>
            <div className="grid grid-cols-2 gap-1">
              {[
                { count: 60, label: "60 даалгавар (Стандарт А4)" },
                { count: 50, label: "50 даалгавар" },
              ].map((item) => (
                <button
                  key={item.count}
                  type="button"
                  onClick={() => setSheetQuestionCount(item.count as 50 | 60)}
                  className={`py-1.5 px-1 rounded-lg font-bold border transition-colors text-center cursor-pointer ${
                    sheetQuestionCount === item.count
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Сурагчийн код (7 оронтой тоо):</label>
            <input
              type="text"
              maxLength={7}
              value={codeDigits}
              onChange={(e) => setCodeDigits(e.target.value.replace(/\D/g, "").slice(0, 7))}
              className="w-full px-3 py-1.5 font-bold font-mono border border-slate-200 rounded-lg bg-slate-50 text-slate-900"
              placeholder="1048290"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setCodeDigits("")}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Хоосон хуудас болгох</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE OFFICIAL SMARTESH OMR SHEET (FULL A4 LAYOUT WITH HORIZONTAL OVALS) */}
      {/* ========================================================================= */}
      <div
        ref={sheetRef}
        className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-300 shadow-xl max-w-4xl mx-auto text-slate-900 select-none print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:rounded-none relative font-sans"
        style={{ minHeight: "1160px" }}
      >
        {/* 4 Optical Corner Fiducial Registration Markers */}
        <div className="absolute left-3 top-3 w-5 h-5 bg-black pointer-events-none" />
        <div className="absolute right-3 top-3 w-5 h-5 bg-black pointer-events-none" />
        <div className="absolute left-3 bottom-3 w-5 h-5 bg-black pointer-events-none" />
        <div className="absolute right-3 bottom-3 w-5 h-5 bg-black pointer-events-none" />

        {/* Left Timing Block Bar */}
        <div className="absolute left-3.5 top-12 bottom-12 flex flex-col justify-between items-center w-3.5 pointer-events-none">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="w-3.5 h-2 bg-black shrink-0" />
          ))}
        </div>

        {/* Right Barcode / Optical Scan Area */}
        <div className="absolute right-3.5 top-56 bottom-20 w-8 bg-slate-900 rounded-xs flex flex-col items-center justify-center text-white font-black text-[10px] shadow-xs pointer-events-none py-4">
          <span className="text-xs">▲</span>
          <div
            className="flex-1 flex items-center justify-center whitespace-nowrap tracking-wider font-extrabold uppercase text-[9px]"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            SMARTESH OPTICAL MARK SCAN CONTROL
          </div>
          <span className="text-xs">▼</span>
        </div>

        {/* Main Content Margin (Indented for timing bar and right marker) */}
        <div className="pl-6 pr-10 space-y-4">
          {/* HEADER: SmartESH Logo & Title */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 gap-3">
            {/* Left: SmartESH Emblem */}
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                S
              </div>
              <div className="leading-tight">
                <div className="font-black text-xl tracking-tight text-blue-950">SmartESH</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  ЭЕШ-ЫН ЦАХИМ СИСТЕМ
                </div>
              </div>
            </div>

            {/* Center: Title */}
            <div className="text-center flex-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-widest text-slate-900 uppercase">
                Х А Р И У Л Т Ы Н   Х У У Д А С
              </h1>
              <p className="text-[10px] text-slate-600 font-bold tracking-tight">
                МОНГОЛ УЛСЫН ЭЕШ СТАНДАРТ OMR ХУУДАС (ОПТИК УНШИГЧИД ЗОРИУЛСАН)
              </p>
            </div>

            {/* Right: QR / Scan ID Box */}
            <div className="border border-slate-300 rounded-lg p-1.5 text-center shrink-0 w-28 bg-slate-50">
              <div className="text-[9px] font-mono font-bold text-slate-800">SMARTESH-OMR</div>
              <div className="text-[8px] font-mono text-blue-700 font-bold">2026-{selectedVariant}</div>
              <div className="text-[7px] text-slate-500">Optical Form</div>
            </div>
          </div>

          {/* TOP SECTION: Student Code (Left) & Variant & Instructions (Right) */}
          <div className="grid grid-cols-12 gap-4 text-xs pt-1">
            {/* Left 6 Cols: СУРАГЧИЙН КОД */}
            <div className="col-span-12 sm:col-span-6 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-900 uppercase">
                  СУРАГЧИЙН ХУВИЙН КОД:
                </label>
                <span className="text-[9px] text-slate-500 font-semibold">7 оронтой тоо</span>
              </div>

              {/* Top Write-in Boxes */}
              <div className="flex gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-8 border-2 border-slate-900 font-black font-mono text-base flex items-center justify-center bg-slate-50 text-slate-900"
                  >
                    {codeDigits[i] || ""}
                  </div>
                ))}
              </div>

              {/* Horizontal Oval Bubble Columns for Digits 0 to 9 */}
              <div className="flex gap-1.5 pt-1">
                {Array.from({ length: 7 }).map((_, colIdx) => {
                  const targetDigit = parseInt(codeDigits[colIdx], 10);
                  const isStriped = colIdx % 2 === 1;

                  return (
                    <div
                      key={colIdx}
                      className={`w-7 py-1 rounded-sm flex flex-col items-center gap-1 ${
                        isStriped ? "bg-slate-100" : "bg-white"
                      }`}
                    >
                      {Array.from({ length: 10 }).map((_, d) => {
                        const isFilled = !isNaN(targetDigit) && targetDigit === d;
                        return (
                          <div
                            key={d}
                            className={`w-6 h-3.5 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                              isFilled
                                ? "bg-slate-900 border-slate-900 text-white"
                                : "border-slate-700 bg-white text-slate-800"
                            }`}
                            style={{ borderRadius: "9999px" }}
                          >
                            {d}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 6 Cols: Variant Selection & Instructions */}
            <div className="col-span-12 sm:col-span-6 space-y-3">
              {/* Variant Selection */}
              <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="text-[11px] font-black text-slate-900 uppercase">
                  ШАЛГАЛТЫН ХУВИЛБАР:
                </div>
                <div className="flex items-center gap-4">
                  {(["A", "B", "C", "D"] as const).map((v) => {
                    const isSelected = selectedVariant === v;
                    return (
                      <div key={v} className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">{v}</span>
                        {/* Horizontal Oval Bubble */}
                        <div
                          className={`w-7 h-4 rounded-full border text-[10px] font-black flex items-center justify-center ${
                            isSelected
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "border-slate-700 bg-white text-slate-800"
                          }`}
                        >
                          {v}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions Box */}
              <div className="border border-slate-300 rounded-xl p-3 text-[10px] text-slate-700 space-y-1.5 bg-white">
                <div className="font-black text-slate-900 uppercase text-[10.5px]">
                  ЗӨВ БУДАХ ЗААВАР:
                </div>
                <p>1. Зөвхөн 2B зөөлөн балын харандаагаар зууван нүдийг бүрэн дүүргэж будна.</p>
                <p>2. Зууван нүднээс гаргахгүй, тод, жигд будалт хийнэ үү.</p>

                {/* Visual Examples */}
                <div className="flex items-center gap-4 pt-1 text-[9px] font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-900">Зөв:</span>
                    <div className="w-6 h-3.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px]">
                      ●
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-700">Буруу:</span>
                    <div className="w-6 h-3.5 rounded-full border border-rose-600 text-rose-700 flex items-center justify-center text-[8px]">
                      ✕
                    </div>
                    <div className="w-6 h-3.5 rounded-full border border-rose-600 text-rose-700 flex items-center justify-center text-[8px]">
                      ◐
                    </div>
                    <div className="w-6 h-3.5 rounded-full border border-rose-600 text-rose-700 flex items-center justify-center text-[8px]">
                      ✓
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MAIN LOWER BODY: 1-Р ХЭСЭГ (Questions 1-50 or 1-60) & 2-Р ХЭСЭГ (Задгай) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-12 gap-4 pt-2">
            {/* 1-Р ХЭСЭГ: Questions 1 to 50 or 60 */}
            <div className="col-span-12 md:col-span-8 space-y-2">
              <div className="bg-blue-900 text-white font-black text-center text-xs py-2 rounded-lg tracking-wider uppercase shadow-xs">
                1 - Р   Х Э С Э Г   (ТЕСТ 1 - {sheetQuestionCount})
              </div>

              {/* Two Sub-Columns (1 to halfCount) and (halfCount+1 to sheetQuestionCount) */}
              {(() => {
                const halfCount = sheetQuestionCount === 60 ? 30 : 25;
                const col1Questions = Array.from({ length: halfCount }, (_, i) => i + 1);
                const col2Questions = Array.from({ length: halfCount }, (_, i) => i + halfCount + 1);

                return (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-[10px]">
                    {/* Column 1: Questions 1 to halfCount */}
                    <div className="space-y-0.5">
                      {col1Questions.map((qNum) => {
                        const isEven = qNum % 2 === 0;
                        const isGroupEnd = qNum % 5 === 0 && qNum !== halfCount;
                        return (
                          <div
                            key={qNum}
                            className={`flex items-center justify-between py-1 px-1.5 rounded-sm transition-colors ${
                              isEven ? "bg-slate-100/80" : "bg-white"
                            } ${isGroupEnd ? "border-b border-slate-300 pb-1.5 mb-1" : ""}`}
                          >
                            <span className="font-black text-slate-900 w-5 text-right font-mono pr-1 text-xs">
                              {qNum}
                            </span>
                            <div className="flex gap-1.5 font-bold">
                              {["A", "B", "C", "D", "E"].map((opt) => (
                                <div
                                  key={opt}
                                  className="w-6 h-4 sm:w-6.5 sm:h-4.5 rounded-full border border-slate-700 text-slate-900 text-[9px] font-black flex items-center justify-center bg-white shadow-2xs hover:bg-slate-200 transition-colors cursor-pointer"
                                  style={{ borderRadius: "9999px" }}
                                >
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Column 2: Questions halfCount+1 to sheetQuestionCount */}
                    <div className="space-y-0.5">
                      {col2Questions.map((qNum) => {
                        const isEven = qNum % 2 === 0;
                        const isGroupEnd = qNum % 5 === 0 && qNum !== sheetQuestionCount;
                        return (
                          <div
                            key={qNum}
                            className={`flex items-center justify-between py-1 px-1.5 rounded-sm transition-colors ${
                              isEven ? "bg-slate-100/80" : "bg-white"
                            } ${isGroupEnd ? "border-b border-slate-300 pb-1.5 mb-1" : ""}`}
                          >
                            <span className="font-black text-slate-900 w-5 text-right font-mono pr-1 text-xs">
                              {qNum}
                            </span>
                            <div className="flex gap-1.5 font-bold">
                              {["A", "B", "C", "D", "E"].map((opt) => (
                                <div
                                  key={opt}
                                  className="w-6 h-4 sm:w-6.5 sm:h-4.5 rounded-full border border-slate-700 text-slate-900 text-[9px] font-black flex items-center justify-center bg-white shadow-2xs hover:bg-slate-200 transition-colors cursor-pointer"
                                  style={{ borderRadius: "9999px" }}
                                >
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 2-Р ХЭСЭГ: Sub-tasks 2.1, 2.2, 2.3, 2.4 (2-р хэсэг өөрчлөхгүй) */}
            <div className="col-span-12 md:col-span-4 space-y-2">
              <div className="bg-blue-900 text-white font-black text-center text-xs py-2 rounded-lg tracking-wider uppercase shadow-xs">
                2 - Р   Х Э С Э Г   (ЗАДГАЙ ДААЛГАВАР)
              </div>

              <div className="space-y-3">
                {[
                  { id: "2.1", label: "2.1 Задгай даалгавар" },
                  { id: "2.2", label: "2.2 Задгай даалгавар" },
                  { id: "2.3", label: "2.3 Задгай даалгавар" },
                  { id: "2.4", label: "2.4 Задгай даалгавар" },
                ].map((sec) => (
                  <div key={sec.id} className="border border-slate-300 rounded-xl p-2.5 bg-white space-y-1.5 shadow-2xs">
                    <div className="text-[11px] font-black text-slate-900 flex items-center justify-between pb-1 border-b border-slate-100">
                      <span>{sec.label}:</span>
                      <span className="text-[9px] font-mono font-bold text-slate-500">0 - 9</span>
                    </div>

                    {/* Columns 0 to 9 headers & horizontal oval rows */}
                    <div className="space-y-1">
                      {/* Digits Header */}
                      <div className="flex pl-4.5 gap-1">
                        {Array.from({ length: 10 }).map((_, d) => (
                          <div key={d} className="w-4.5 text-center text-[8.5px] font-black text-slate-600">
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* Rows a, b, c, d */}
                      {["a", "b", "c", "d"].map((row) => (
                        <div key={row} className="flex items-center gap-1 py-0.5">
                          <span className="w-3.5 text-right font-black text-[10px] text-slate-900">
                            {row}
                          </span>
                          {Array.from({ length: 10 }).map((_, d) => (
                            <div
                              key={d}
                              className="w-4.5 h-3.5 rounded-full border border-slate-600 text-[8px] font-black flex items-center justify-center text-slate-700 bg-white hover:bg-slate-200 transition-colors cursor-pointer"
                              style={{ borderRadius: "9999px" }}
                            >
                              {d}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER: Standard SmartESH Notice */}
          <div className="pt-3 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[9.5px] text-slate-600 gap-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-blue-950">SmartESH Academic OMR Standard</span>
              <span>•</span>
              <span>2B харандаагаар дүүргэнэ</span>
              <span>•</span>
              <span>Камераар болон сканнераар автоматаар уншигдана</span>
            </div>
            <div className="font-mono text-slate-700 font-bold">
              Хувилбар: {selectedVariant} • A4-Official
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
