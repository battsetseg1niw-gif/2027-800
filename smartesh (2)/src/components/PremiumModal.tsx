import React, { useState } from "react";
import {
  Crown,
  Sparkles,
  CheckCircle2,
  X,
  Key,
  QrCode,
  AlertCircle,
  MessageCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Users,
  Printer,
  FileSpreadsheet,
  GraduationCap,
  Calendar,
  Layers,
  HelpCircle,
  FileCheck,
  Check,
} from "lucide-react";
import { UserProfile } from "../types";
import { db } from "../lib/supabase";

interface PremiumModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onRedeemCode: (code: string) => boolean;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onRedeemCode,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"student" | "teacher">(
    currentUser.role === "teacher" ? "teacher" : "student"
  );
  const [activationCode, setActivationCode] = useState("");
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"plans" | "code" | "facebook" | "qpay" | "terms">("plans");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (!isOpen) return null;

  const settings = db.getPlatformSettings();
  const pricing = settings.pricing;
  const studentPriceStr = `${pricing.studentYearlyPrice.toLocaleString()}₮`;
  const teacherPriceStr = `${pricing.teacherYearlyPrice.toLocaleString()}₮`;
  const planAmount = selectedPlan === "teacher" ? teacherPriceStr : studentPriceStr;
  const planName = selectedPlan === "teacher" ? pricing.teacherPlanName : pricing.studentPlanName;

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError(null);

    const ok = onRedeemCode(activationCode.trim().toUpperCase());
    if (ok) {
      setRedeemSuccess(true);
      setTimeout(() => {
        onClose();
        setRedeemSuccess(false);
      }, 2000);
    } else {
      setRedeemError("Идэвхжүүлэх код буруу эсвэл өмнө нь ашиглагдсан байна.");
    }
  };

  const facebookMessageTemplate = `Сайн байна уу? SmartESH системд Premium эрх авах гэсэн юм.
• Хэрэглэгчийн нэр: ${currentUser.name}
• Бүртгэлтэй имэйл: ${currentUser.email}
• Сонгосон багц: ${selectedPlan === "teacher" ? `${pricing.teacherPlanName} (${teacherPriceStr} / ${pricing.durationDays} хоног)` : `${pricing.studentPlanName} (${studentPriceStr} / ${pricing.durationDays} хоног)`}
• Хугацаа: ${pricing.durationDays} хоног (1 бүтэн жил)
Идэвхжүүлэх кодоо авъя.`;

  const handleCopyFacebookMessage = () => {
    navigator.clipboard.writeText(facebookMessageTemplate);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(pricing.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const openFacebookPage = () => {
    window.open(pricing.facebookUrl || "https://facebook.com/SmartESH.Mongolia", "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Top Decorative Ambient Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shadow-inner">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">SmartESH Premium</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                  {pricing.durationDays} ХОНОГ (БҮТЭН ЖИЛ)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                2006–{settings.examYear} ЭЕШ-ийн бүрэн архив, 7 хоногийн Mock, OMR сканнер, Багшийн удирдлага
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Selector Cards (Сурагч / Багш) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Plan 1: Student */}
          <div
            onClick={() => setSelectedPlan("student")}
            className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
              selectedPlan === "student"
                ? "border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-400/30"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            {selectedPlan === "student" && (
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                Сонгогдсон
              </span>
            )}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>{pricing.studentPlanName}</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {pricing.durationDays} хоног
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-2xl font-black text-slate-900">{studentPriceStr}</span>
              <span className="text-xs font-bold text-slate-600">/ жилээр</span>
            </div>

            <p className="text-[11px] text-slate-700 font-medium line-clamp-2 mb-2.5">
              {pricing.studentPlanDescription}
            </p>

            <ul className="space-y-1 text-[11px] text-slate-800 font-medium border-t border-amber-200/60 pt-2">
              {pricing.features
                .filter((f) => f.studentIncluded)
                .slice(0, 4)
                .map((f) => (
                  <li key={f.id} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{f.name}</span>
                  </li>
                ))}
            </ul>
          </div>

          {/* Plan 2: Teacher */}
          <div
            onClick={() => setSelectedPlan("teacher")}
            className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
              selectedPlan === "teacher"
                ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/30"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            {selectedPlan === "teacher" && (
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
                Сонгогдсон
              </span>
            )}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{pricing.teacherPlanName}</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {pricing.durationDays} хоног
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-2xl font-black text-slate-900">{teacherPriceStr}</span>
              <span className="text-xs font-bold text-slate-600">/ жилээр</span>
            </div>

            <p className="text-[11px] text-slate-700 font-medium line-clamp-2 mb-2.5">
              {pricing.teacherPlanDescription}
            </p>

            <ul className="space-y-1 text-[11px] text-slate-800 font-medium border-t border-emerald-200/60 pt-2">
              {pricing.features
                .filter((f) => f.teacherIncluded)
                .slice(0, 4)
                .map((f) => (
                  <li key={f.id} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{f.name}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("plans")}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "plans"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Боломжийн харьцуулалт</span>
          </button>

          <button
            onClick={() => setActiveTab("qpay")}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "qpay"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Банк / QPay шилжүүлэг ({planAmount})</span>
          </button>

          <button
            onClick={() => setActiveTab("facebook")}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "facebook"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Facebook чатаар код авах</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "code"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Key className="w-3.5 h-3.5 text-purple-600" />
            <span>Код оруулах (Redeem)</span>
          </button>

          <button
            onClick={() => setActiveTab("terms")}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "terms"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Төлбөрийн нөхцөл</span>
          </button>
        </div>

        {/* TAB 1: DETAILED FEATURE COMPARISON */}
        {activeTab === "plans" && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Боломж & Үйлчилгээ</th>
                    <th className="py-2.5 px-3 text-center bg-amber-50/70 text-amber-900">
                      🎓 Сурагч ({studentPriceStr}/жил)
                    </th>
                    <th className="py-2.5 px-3 text-center bg-emerald-50/70 text-emerald-900">
                      👨‍🏫 Багш ({teacherPriceStr}/жил)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {pricing.features.map((f) => (
                    <tr
                      key={f.id}
                      className={`hover:bg-slate-50/70 ${
                        f.isHighlight ? "bg-amber-50/20" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 font-medium">
                        <span className="text-slate-900 font-medium">{f.name}</span>
                        {f.isHighlight && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                            Онцлох
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {f.studentIncluded ? (
                          <span className="text-amber-700 font-bold">
                            {f.studentBadge || "✓ Нээлттэй"}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {f.teacherIncluded ? (
                          <span className="text-emerald-700 font-bold">
                            {f.teacherBadge || "✓ Нээлттэй"}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-600 text-center sm:text-left">
                Одоогоор сонгогдсон: <strong className="text-slate-900">{planName} ({planAmount})</strong>
              </div>
              <button
                onClick={() => setActiveTab("qpay")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Төлбөр төлөх рүү шилжих ({planAmount})
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: QPAY / BANK TRANSFER */}
        {activeTab === "qpay" && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Visual QR Code Matrix */}
                <div className="w-32 h-32 bg-white p-2.5 rounded-2xl border border-slate-300 shadow-xs flex flex-col items-center justify-center shrink-0">
                  <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="grid grid-cols-6 gap-0.5 w-24 h-24 p-1 bg-white rounded">
                      <div className="col-span-2 row-span-2 bg-slate-900 rounded-xs" />
                      <div className="col-span-2 bg-slate-900" />
                      <div className="col-span-2 row-span-2 bg-slate-900 rounded-xs" />
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="col-span-2 row-span-2 bg-amber-500 rounded-xs flex items-center justify-center text-[8px] font-black text-white">
                        ESH
                      </div>
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="col-span-2 row-span-2 bg-slate-900 rounded-xs" />
                      <div className="col-span-2 bg-slate-900" />
                      <div className="col-span-2 row-span-2 bg-slate-900 rounded-xs" />
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-wider">
                    SmartESH QPay
                  </span>
                </div>

                {/* Bank details */}
                <div className="space-y-2 w-full text-left">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Багцын нэр:</span>
                    <span className="font-bold text-slate-900">{planName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800">
                    <span className="text-slate-500 font-medium">Банк:</span>
                    <span className="font-bold">{pricing.bankName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800">
                    <span className="text-slate-500 font-medium">Дансны дугаар:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 text-sm">{pricing.accountNumber}</span>
                      <button
                        onClick={handleCopyAccount}
                        title="Данс хуулах"
                        className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
                      >
                        {copiedAccount ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-slate-800">
                    <span className="text-slate-500 font-medium">Хүлээн авагч:</span>
                    <span className="font-bold">{pricing.accountHolder}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800">
                    <span className="text-slate-500 font-medium">Төлөх дүн:</span>
                    <span className="font-black text-base text-emerald-700">{planAmount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 bg-blue-50 p-2 rounded-xl border border-blue-200">
                    <span className="text-blue-800 font-bold">Гүйлгээний утга:</span>
                    <span className="font-mono text-blue-900 font-black text-xs">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Төлбөр шилжүүлсний дараа <strong>Facebook хуудсаар баримтаа илгээснээр</strong> админ 1–5 минутад 16 оронтой Идэвхжүүлэх кодыг (Activation Code) шууд илгээнэ.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setActiveTab("facebook")}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Facebook чатаар холбогдох</span>
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Код авсан тул идэвхжүүлэх</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FACEBOOK CONTACT */}
        {activeTab === "facebook" && (
          <div className="space-y-4 text-xs">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  f
                </div>
                <span>Facebook Хуудсаар шууд холбогдож код авах</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Манай албан ёсны фэйсбүүк хуудсаар холбогдон шилжүүлгийн баримтаа явуулснаар админ 1–3 минутад шалгаж таны <strong>16 оронтой Идэвхжүүлэх Код</strong>-ыг шууд илгээнэ.
              </p>

              {/* Message preview box */}
              <div className="bg-white rounded-xl p-3 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Бэлэн мессежний текст:</span>
                  <button
                    onClick={handleCopyFacebookMessage}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    {copiedMessage ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Хуулагдлаа!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Текст хуулах</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-mono text-[11px] whitespace-pre-line border border-slate-200">
                  {facebookMessageTemplate}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={openFacebookPage}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Facebook хуудас нээх ({pricing.facebookUrl.replace("https://", "")})</span>
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Идэвхжүүлэх код оруулах</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REDEEM CODE FORM */}
        {activeTab === "code" && (
          <form onSubmit={handleRedeemSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-700 block">
                16 оронтой идэвхжүүлэх код оруулна уу:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="input-activation-code"
                  type="text"
                  placeholder="Жишээ: ESH-STU-8821 эсвэл ESH-TEA-9912"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-wider text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Та төлбөрөө төлсний дараа админаас авсан кодыг энд оруулан 1 жилийн эрхээ шууд нээнэ.
              </p>
            </div>

            {redeemError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{redeemError}</span>
              </div>
            )}

            {redeemSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Баяр хүргэе! 365 хоногийн Премиум эрх амжилттай идэвхжлээ.</span>
              </div>
            )}

            <button
              id="btn-redeem-code-submit"
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              Код шалгаж эрх идэвхжүүлэх ({pricing.durationDays} хоног)
            </button>
          </form>
        )}

        {/* TAB 5: TERMS & CONDITIONS */}
        {activeTab === "terms" && (
          <div className="space-y-3.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed max-h-80 overflow-y-auto">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-600" />
              <span>SmartESH Төлбөрийн нөхцөл & Журам</span>
            </h4>

            <div className="space-y-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">1. Хугацаа ба Үнэ:</h5>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>
                    <strong>{pricing.studentPlanName}:</strong> {studentPriceStr} / {pricing.durationDays} хоног (бүтэн 1 жил).
                  </li>
                  <li>
                    <strong>{pricing.teacherPlanName}:</strong> {teacherPriceStr} / {pricing.durationDays} хоног (бүтэн 1 жил).
                  </li>
                  <li>Эрх нь идэвхжүүлсэн өдрөөс эхлэн {pricing.durationDays} хоногийн турш тасралтгүй хүчинтэй байна.</li>
                </ul>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">2. Боломж & Үйлчилгээний хамрах хүрээ:</h5>
                <div className="space-y-1 text-slate-600">
                  <div>
                    <strong>Сурагч:</strong> 2006–{settings.examYear} оны ЭЕШ-ийн архив, 7 хоногийн Mock сорилтууд, сэдэвчилсэн дасгалууд, хувийн алдааны дэвтэр, видео хичээлүүд.
                  </div>
                  <div>
                    <strong>Багш:</strong> Сурагчийн бүх боломж + Хязгааргүй анги танхим үүсгэх, сорилт даалгавар өгөх, тест оруулах сан, сэдвээр тест холих, 6 оронтой OMR хуудас хэвлэх, камераар автоматаар засах, Excel экспорт.
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">3. Баталгаажилт ба Нууцлал:</h5>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Төлбөр төлөгдсөнөөс хойш 1-5 минутад Facebook хуудсаар 16 оронтой activation код олгогдоно.</li>
                  <li>Нэг хэрэглэгчийн эрхийг бусдад шилжүүлэх, олон хүн нэгэн зэрэг нэвтэрч ашиглахыг хориглоно.</li>
                  <li>Цахим бүтээгдэхүүн идэвхэжсэнээс хойш төлбөр буцаах боломжгүй.</li>
                </ul>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-line text-[11px] text-slate-600 max-h-40 overflow-y-auto">
                <div className="font-bold text-slate-800 mb-1">Бүтэн үйлчилгээний нөхцөлөөс:</div>
                {settings.termsOfService}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
