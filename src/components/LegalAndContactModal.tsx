import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  FileText,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  MessageSquare,
  Globe,
  Award,
} from "lucide-react";
import { db } from "../lib/supabase";

export type LegalModalTab = "terms" | "privacy" | "contact";

interface LegalAndContactModalProps {
  isOpen: boolean;
  initialTab?: LegalModalTab;
  onClose: () => void;
}

export const LegalAndContactModal: React.FC<LegalAndContactModalProps> = ({
  isOpen,
  initialTab = "terms",
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalModalTab>(initialTab);

  if (!isOpen) return null;

  const settings = db.getPlatformSettings();
  const { contactInfo } = settings;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
              ESH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {settings.platformName || "SmartESH"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                  {settings.examYear} Албан ёсны
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Хууль эрх зүй, нууцлал ба харилцагчийн дэмжлэг үзүүлэх төв
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === "terms"
                ? "bg-white border-indigo-600 text-indigo-600 shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Үйлчилгээний нөхцөл</span>
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === "privacy"
                ? "bg-white border-purple-600 text-purple-600 shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Нууцлалын бодлого</span>
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === "contact"
                ? "bg-white border-emerald-600 text-emerald-600 shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Холбоо барих</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs text-slate-700 leading-relaxed">
          {/* TERMS */}
          {activeTab === "terms" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  Платформ ашиглах үйлчилгээний ерөнхий нөхцөл
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  Сүүлд шинэчилсэн: {settings.updatedAt}
                </span>
              </div>
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 whitespace-pre-line font-sans space-y-2 text-slate-800 leading-6">
                {settings.termsOfService}
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  Хувийн мэдээлэл болон сурагчийн дүнг хамгаалах нууцлалын бодлого
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  Сүүлд шинэчилсэн: {settings.updatedAt}
                </span>
              </div>
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 whitespace-pre-line font-sans space-y-2 text-slate-800 leading-6">
                {settings.privacyPolicy}
              </div>
            </div>
          )}

          {/* CONTACT */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="pb-2 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  Харилцагчийн дэмжлэг үзүүлэх албан ёсны сувгууд
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  ЭЕШ шалгалтын системтэй холбоотой лавлагаа, багшийн эрх авах, OMR шалгалтын асуулгад туслалцаа үзүүлнэ.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold">
                    <PhoneCall className="w-4 h-4" />
                    <span>Утасны лавлах:</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 font-mono">
                    {contactInfo.phone}
                  </div>
                  {contactInfo.phone2 && (
                    <div className="text-xs text-slate-700 font-mono">
                      Нэмэлт: {contactInfo.phone2}
                    </div>
                  )}
                  {contactInfo.hotline && (
                    <div className="text-[11px] text-indigo-800 font-bold">
                      Шуурхай дуудлага: {contactInfo.hotline}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Mail className="w-4 h-4" />
                    <span>Цахим шуудан:</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {contactInfo.email}
                  </div>
                  <div className="text-xs text-slate-600">
                    Дэмжлэг: {contactInfo.supportEmail}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold">
                    <MapPin className="w-4 h-4" />
                    <span>Байршлын албан хаяг:</span>
                  </div>
                  <div className="text-xs text-slate-800 leading-relaxed font-medium">
                    {contactInfo.address}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-amber-200/60">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Ажиллах цаг: {contactInfo.workingHours}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-bold">
                    <Globe className="w-4 h-4" />
                    <span>Facebook хуудас:</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {contactInfo.facebook}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                  <div className="flex items-center gap-2 text-sky-700 font-bold">
                    <MessageSquare className="w-4 h-4" />
                    <span>Telegram суваг:</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {contactInfo.telegram}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            © {settings.examYear} {settings.platformName}. Бүх эрх хуулиар хамгаалагдсан.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
};
