import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  FileText,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Globe,
  Plus,
  Trash2,
  Crown,
  CreditCard,
  Building2,
  Sparkles,
  Users,
  GraduationCap,
  Shield,
  Tag,
  Check,
  RotateCcw,
} from "lucide-react";
import { PlatformSettings, ContactInfo, PricingSettings, PlanFeatureItem } from "../types";
import { db } from "../lib/supabase";
import { DEFAULT_PLATFORM_SETTINGS } from "../data/platformSettingsData";

interface AdminSettingsViewProps {
  onNotify?: (title: string, message: string) => void;
  defaultSubTab?: "pricing" | "general" | "terms" | "privacy" | "contact" | "preview";
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  onNotify,
  defaultSubTab = "pricing",
}) => {
  const [settings, setSettings] = useState<PlatformSettings>(() => db.getPlatformSettings());
  const [activeSubTab, setActiveSubTab] = useState<"pricing" | "general" | "terms" | "privacy" | "contact" | "preview">(
    defaultSubTab
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Form states
  const [platformName, setPlatformName] = useState(settings.platformName);
  const [examYear, setExamYear] = useState(settings.examYear);
  const [announcement, setAnnouncement] = useState(settings.announcement || "");
  const [termsOfService, setTermsOfService] = useState(settings.termsOfService);
  const [privacyPolicy, setPrivacyPolicy] = useState(settings.privacyPolicy);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(settings.contactInfo);
  const [pricing, setPricing] = useState<PricingSettings>(settings.pricing);

  // New feature form state
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureStudent, setNewFeatureStudent] = useState(true);
  const [newFeatureTeacher, setNewFeatureTeacher] = useState(true);
  const [newFeatureHighlight, setNewFeatureHighlight] = useState(false);

  useEffect(() => {
    const current = db.getPlatformSettings();
    setSettings(current);
    setPlatformName(current.platformName);
    setExamYear(current.examYear);
    setAnnouncement(current.announcement || "");
    setTermsOfService(current.termsOfService);
    setPrivacyPolicy(current.privacyPolicy);
    setContactInfo(current.contactInfo);
    setPricing(current.pricing);
  }, []);

  const handleSaveAll = () => {
    const updated: PlatformSettings = {
      platformName,
      examYear: Number(examYear) || 2026,
      announcement,
      termsOfService,
      privacyPolicy,
      contactInfo,
      pricing,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    db.savePlatformSettings(updated);
    setSettings(updated);
    setSavedSuccess(true);
    if (onNotify) {
      onNotify("Амжилттай хадгалагдлаа", "Үнэ тариф, боломжууд болон платформын тохиргоо шинэчлэгдлээ.");
    }
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleResetToDefault = () => {
    db.savePlatformSettings(DEFAULT_PLATFORM_SETTINGS);
    setSettings(DEFAULT_PLATFORM_SETTINGS);
    setPlatformName(DEFAULT_PLATFORM_SETTINGS.platformName);
    setExamYear(DEFAULT_PLATFORM_SETTINGS.examYear);
    setAnnouncement(DEFAULT_PLATFORM_SETTINGS.announcement || "");
    setTermsOfService(DEFAULT_PLATFORM_SETTINGS.termsOfService);
    setPrivacyPolicy(DEFAULT_PLATFORM_SETTINGS.privacyPolicy);
    setContactInfo(DEFAULT_PLATFORM_SETTINGS.contactInfo);
    setPricing(DEFAULT_PLATFORM_SETTINGS.pricing);
    setIsResetConfirmOpen(false);
    setSavedSuccess(true);
    if (onNotify) {
      onNotify("Анхны төлөвт оруулав", "Системийн анхны тохиргоонууд сэргээгдлээ.");
    }
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  // Feature Matrix management
  const handleToggleFeatureStudent = (featId: string) => {
    setPricing((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === featId
          ? {
              ...f,
              studentIncluded: !f.studentIncluded,
              studentBadge: !f.studentIncluded ? "✓ Нээлттэй" : "—",
            }
          : f
      ),
    }));
  };

  const handleToggleFeatureTeacher = (featId: string) => {
    setPricing((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === featId
          ? {
              ...f,
              teacherIncluded: !f.teacherIncluded,
              teacherBadge: !f.teacherIncluded ? "✓ Нээлттэй" : "—",
            }
          : f
      ),
    }));
  };

  const handleToggleFeatureHighlight = (featId: string) => {
    setPricing((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === featId ? { ...f, isHighlight: !f.isHighlight } : f
      ),
    }));
  };

  const handleDeleteFeature = (featId: string) => {
    setPricing((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== featId),
    }));
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;
    const newFeat: PlanFeatureItem = {
      id: `feat-${Date.now()}`,
      name: newFeatureName.trim(),
      studentIncluded: newFeatureStudent,
      teacherIncluded: newFeatureTeacher,
      studentBadge: newFeatureStudent ? "✓ Нээлттэй" : "—",
      teacherBadge: newFeatureTeacher ? "✓ Нээлттэй" : "—",
      isHighlight: newFeatureHighlight,
    };
    setPricing((prev) => ({
      ...prev,
      features: [...prev.features, newFeat],
    }));
    setNewFeatureName("");
    setNewFeatureStudent(true);
    setNewFeatureTeacher(true);
    setNewFeatureHighlight(false);
  };

  // Sync Terms Section 4 with current pricing
  const handleSyncTermsWithPricing = () => {
    const section4Regex = /4\. ТӨЛБӨРТ ҮЙЛЧИЛГЭЭ БА ЭРХ СУНГАХ ЖУРАМ[\s\S]*?(?=\n\n5\.|\n\n$|$)/;
    const newSection4 = `4. ТӨЛБӨРТ ҮЙЛЧИЛГЭЭ БА ЭРХ СУНГАХ ЖУРАМ
4.1. Сурагчийн бүтэн жилийн (${pricing.durationDays} хоног) багцын төлбөр ${pricing.studentYearlyPrice.toLocaleString()} төгрөг, Багшийн бүтэн жилийн (${pricing.durationDays} хоног) багцын төлбөр ${pricing.teacherYearlyPrice.toLocaleString()} төгрөг байна.
4.2. Сурагчийн эрхэд: 2006–${examYear} оны бүх ЭЕШ архив, 7 хоногийн Mock жишиг сорилтууд, сэдэвчилсэн дасгал ажил, цахим алдааны дэвтэр, зөвлөмж тайлбар, 18+ видео хичээлүүд бүрэн багтана.
4.3. Багшийн эрхэд: Сурагчийн бүх боломж дээр нэмэгдэн хязгааргүй анги танхим үүсгэх, онлайн даалгавар өгөх, тест оруулах сан (Question Bank Studio), сэдвээр тест холих, 6 оронтой OMR хариултын хуудас хэвлэх, камераар автоматаар засах, Excel экспорт багтана.
4.4. Төлбөрийг ${pricing.bankName} ${pricing.accountNumber} (${pricing.accountHolder}) дансанд шилжүүлж, Facebook хуудсаар баталгаажуулснаар ${pricing.durationDays} хоногийн идэвхжүүлэх код (Activation Code) шууд олгогдоно.
4.5. Цахим бүтээгдэхүүн идэвхэжсэнээс хойш төлбөр буцаах боломжгүй тул үнэгүй туршилтын шалгалтыг урьдчилан өгч танилцахыг зөвлөж байна.`;

    if (section4Regex.test(termsOfService)) {
      setTermsOfService(termsOfService.replace(section4Regex, newSection4));
    } else {
      setTermsOfService(termsOfService + "\n\n" + newSection4);
    }
    if (onNotify) {
      onNotify("Синхрончлогдлоо", "Үйлчилгээний нөхцөлийн 4-р заалт одоогийн үнэ тарифтай нийцүүлэн шинэчлэгдлээ.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
              <Crown className="w-3.5 h-3.5" />
              <span>СИСТЕМИЙН ЭЗЭМШИГЧ & АДМИН УДИРДЛАГА</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <span>Үнэ Тариф, Боломж & Системийн Тохиргоо</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Та бол системийн цорын ганц ерөнхий админ (battsetsegb615@gmail.com). Эндээс сурагч, багшийн төлбөр (20,000₮ / 40,000₮), багцын боломжууд, банкны данс, үйлчилгээний нөхцөлийг бүрэн хянаж өөрчилнө.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="btn-save-settings"
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Хадгалагдлаа!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Өөрчлөлтийг хадгалах</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-white/20 text-slate-200 hover:bg-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Анхны стандарт загвараар сэргээх"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сэргээх</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success alert */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Өөрчлөлтүүд амжилттай хадгалагдлаа. Хэрэглэгчдийн Premium цонх болон activation кодууд шинэ тохиргоогоор шууд ажиллана. Сүүлийн шинэчлэл: {settings.updatedAt}</span>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Анхны төлөвт оруулах уу?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Үнэ тариф (Сурагч 20,000₮ / Багш 40,000₮), багцын боломжууд, Үйлчилгээний нөхцөл болон Банкны мэдээллийг анхны стандарт эх загвараар солихдоо итгэлтэй байна уу?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Болих
              </button>
              <button
                onClick={handleResetToDefault}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer"
              >
                Тийм, сэргээх
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSubTab("pricing")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "pricing"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>💰 Төлбөр, Үнэ тариф & Боломжууд</span>
        </button>

        <button
          onClick={() => setActiveSubTab("general")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "general"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Ерөнхий тохиргоо</span>
        </button>

        <button
          onClick={() => setActiveSubTab("terms")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "terms"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Үйлчилгээний нөхцөл & Журам</span>
        </button>

        <button
          onClick={() => setActiveSubTab("privacy")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "privacy"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Нууцлалын бодлого</span>
        </button>

        <button
          onClick={() => setActiveSubTab("contact")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "contact"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Холбоо барих & Данс</span>
        </button>

        <button
          onClick={() => setActiveSubTab("preview")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "preview"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Хэрэглэгчид харагдах байдал (Live Preview)</span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* 1. PRICING & PLAN STUDIO TAB                                      */}
      {/* ================================================================= */}
      {activeSubTab === "pricing" && (
        <div className="space-y-6">
          {/* Top Info Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-extrabold">Админы онцгой эрх:</span> Та энд өөрчилсөн бүх үнэ, багцын боломж, банкны дугаарыг нэг товшилтоор хадгалахад систем даяар автоматаар шууд шинэчлэгдэнэ.
              </div>
            </div>
            <button
              onClick={handleSyncTermsWithPricing}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Үйлчилгээний нөхцөлтэй синк хийх</span>
            </button>
          </div>

          {/* Rate & Plan Cards Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Plan Config */}
            <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Сурагчийн Багц (Student Plan)</h3>
                    <span className="text-[10px] text-amber-700 font-semibold">10, 11, 12-р ангийн сурагчид</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                  ЭЕШ 800 ОНОО
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Сурагчийн жилийн үнэ (₮ төгрөгөөр):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={1000}
                      value={pricing.studentYearlyPrice}
                      onChange={(e) =>
                        setPricing({ ...pricing, studentYearlyPrice: Number(e.target.value) || 0 })
                      }
                      className="w-full pl-3.5 pr-12 py-2.5 text-sm font-black text-slate-900 border border-amber-300 rounded-xl bg-amber-50/20 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">₮ / жил</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Одоогийн тохиргоо: {pricing.studentYearlyPrice.toLocaleString()}₮</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Багцын нэр:</label>
                  <input
                    type="text"
                    value={pricing.studentPlanName}
                    onChange={(e) => setPricing({ ...pricing, studentPlanName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Тайлбар бичвэр:</label>
                  <textarea
                    rows={2}
                    value={pricing.studentPlanDescription}
                    onChange={(e) => setPricing({ ...pricing, studentPlanDescription: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Teacher Plan Config */}
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Багшийн Багц (Teacher Plan)</h3>
                    <span className="text-[10px] text-emerald-700 font-semibold">Багш, сургалтын төв, репетитор</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  PRO УДИРДЛАГА
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Багшийн жилийн үнэ (₮ төгрөгөөр):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={1000}
                      value={pricing.teacherYearlyPrice}
                      onChange={(e) =>
                        setPricing({ ...pricing, teacherYearlyPrice: Number(e.target.value) || 0 })
                      }
                      className="w-full pl-3.5 pr-12 py-2.5 text-sm font-black text-slate-900 border border-emerald-300 rounded-xl bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">₮ / жил</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Одоогийн тохиргоо: {pricing.teacherYearlyPrice.toLocaleString()}₮</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Багцын нэр:</label>
                  <input
                    type="text"
                    value={pricing.teacherPlanName}
                    onChange={(e) => setPricing({ ...pricing, teacherPlanName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Тайлбар бичвэр:</label>
                  <textarea
                    rows={2}
                    value={pricing.teacherPlanDescription}
                    onChange={(e) => setPricing({ ...pricing, teacherPlanDescription: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Duration & Banking Credentials */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Хугацаа, Данс & Төлбөрийн нөхцөл</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Хэрэглэгчдийн төлбөрийн цонхонд шууд гарна</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Үйлчлэх хугацаа (хоногоор):</span>
                </label>
                <input
                  type="number"
                  value={pricing.durationDays}
                  onChange={(e) => setPricing({ ...pricing, durationDays: Number(e.target.value) || 365 })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Банкны нэр:</span>
                </label>
                <input
                  type="text"
                  value={pricing.bankName}
                  onChange={(e) => setPricing({ ...pricing, bankName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Дансны дугаар:</span>
                </label>
                <input
                  type="text"
                  value={pricing.accountNumber}
                  onChange={(e) => setPricing({ ...pricing, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Хүлээн авагчийн нэр:</span>
                </label>
                <input
                  type="text"
                  value={pricing.accountHolder}
                  onChange={(e) => setPricing({ ...pricing, accountHolder: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Facebook холбоос (Код олгох хуудас):</span>
                </label>
                <input
                  type="text"
                  value={pricing.facebookUrl}
                  onChange={(e) => setPricing({ ...pricing, facebookUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Гүйлгээний утгын зааварчилгаа:</span>
                </label>
                <input
                  type="text"
                  value={pricing.paymentInstructions}
                  onChange={(e) => setPricing({ ...pricing, paymentInstructions: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Plan Features Matrix Studio */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  <span>Багцуудын Боломж & Онцлогуудын Тохиргоо ({pricing.features.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Сурагч болон Багшийн эрхэд ямар ямар боломж багтахыг checkbox-оор шууд удирдаж тохируулна.
                </p>
              </div>

              <button
                onClick={() =>
                  setPricing((prev) => ({
                    ...prev,
                    features: DEFAULT_PLATFORM_SETTINGS.pricing.features,
                  }))
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Анхны боломжуудыг сэргээх</span>
              </button>
            </div>

            {/* Interactive Feature Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Боломж / Үйлчилгээний нэр</th>
                    <th className="py-3 px-4 text-center bg-amber-50/70 text-amber-900">
                      🎓 Сурагчийн эрхэд багтах ({pricing.studentYearlyPrice.toLocaleString()}₮)
                    </th>
                    <th className="py-3 px-4 text-center bg-emerald-50/70 text-emerald-900">
                      👨‍🏫 Багшийн эрхэд багтах ({pricing.teacherYearlyPrice.toLocaleString()}₮)
                    </th>
                    <th className="py-3 px-4 text-center">Онцлох (Highlight)</th>
                    <th className="py-3 px-4 text-right">Устгах</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {pricing.features.map((feat) => (
                    <tr key={feat.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{feat.name}</div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                          <span>Сурагч: {feat.studentBadge || "—"}</span>
                          <span>•</span>
                          <span>Багш: {feat.teacherBadge || "—"}</span>
                        </div>
                      </td>

                      {/* Student Toggle */}
                      <td className="py-3 px-4 text-center bg-amber-50/30">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={feat.studentIncluded}
                            onChange={() => handleToggleFeatureStudent(feat.id)}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                          />
                          <span
                            className={`text-[11px] font-bold ${
                              feat.studentIncluded ? "text-amber-800" : "text-slate-400"
                            }`}
                          >
                            {feat.studentIncluded ? "Багтана" : "Багтахгүй"}
                          </span>
                        </label>
                      </td>

                      {/* Teacher Toggle */}
                      <td className="py-3 px-4 text-center bg-emerald-50/30">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={feat.teacherIncluded}
                            onChange={() => handleToggleFeatureTeacher(feat.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span
                            className={`text-[11px] font-bold ${
                              feat.teacherIncluded ? "text-emerald-800" : "text-slate-400"
                            }`}
                          >
                            {feat.teacherIncluded ? "Багтана" : "Багтахгүй"}
                          </span>
                        </label>
                      </td>

                      {/* Highlight Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatureHighlight(feat.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                            feat.isHighlight
                              ? "bg-purple-100 text-purple-800 border border-purple-300"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {feat.isHighlight ? "★ Онцолсон" : "Энгийн"}
                        </button>
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteFeature(feat.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Боломж устгах"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Custom Feature Form */}
            <form
              onSubmit={handleAddFeature}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3"
            >
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Шинэ боломж / онцлог нэмэх</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  placeholder="Жишээ: 1-р ангийн түвшний сэдэвчилсэн тест, AI зөвлөгч..."
                  className="w-full sm:flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />

                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-bold shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFeatureStudent}
                    onChange={(e) => setNewFeatureStudent(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <span>Сурагчид өгөх</span>
                </label>

                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-bold shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFeatureTeacher}
                    onChange={(e) => setNewFeatureTeacher(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>Багшид өгөх</span>
                </label>

                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-bold shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFeatureHighlight}
                    onChange={(e) => setNewFeatureHighlight(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                  <span>Онцлох</span>
                </label>

                <button
                  type="submit"
                  disabled={!newFeatureName.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Жагсаалтад нэмэх</span>
                </button>
              </div>
            </form>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Өөрчлөлтийг баталгаажуулахын тулд "Өөрчлөлтийг хадгалах" товчийг дарна уу.
              </div>
              <button
                onClick={handleSaveAll}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Бүх үнэ & боломжийг хадгалах</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. GENERAL SETTINGS TAB                                           */}
      {/* ================================================================= */}
      {activeSubTab === "general" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Системийн үндсэн мэдээлэл</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              ЭЕШ бэлтгэлийн платформын нэр, одоогийн шалгалтын жил болон нийт хэрэглэгчдэд харагдах нийтийн зарлал.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Платформын нэр (Platform Name):</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Жишээ: SmartESH — Англи хэлний ЭЕШ Бэлтгэлийн Систем"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ЭЕШ Шалгалтын жил (Exam Year):</label>
              <input
                type="number"
                value={examYear}
                onChange={(e) => setExamYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="2026"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Нийтийн зарлал / Анхааруулга баннер (Announcement):
              </label>
              <textarea
                rows={3}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Сурагч, багш нарт харагдах зарлалын бичвэр..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Ерөнхий тохиргоог хадгалах</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. TERMS OF SERVICE TAB                                           */}
      {/* ================================================================= */}
      {activeSubTab === "terms" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Үйлчилгээний нөхцөл & Төлбөрийн журам</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Сурагч, багш нарын эрх үүрэг, төлбөрийн нөхцөл (20,000₮ / 40,000₮), OMR стандарт ба хариуцлагын заалтууд.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncTermsWithPricing}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Одоогийн үнэ тарифтай автоматаар уялдуулах"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Үнээр 4-р заалтыг шинэчлэх</span>
              </button>
              <span className="text-[11px] text-slate-500 font-mono">
                Сүүлд шинэчилсэн: {settings.updatedAt}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Нөхцөлийн агуулга (Текст / Заалтууд):</label>
            <textarea
              rows={18}
              value={termsOfService}
              onChange={(e) => setTermsOfService(e.target.value)}
              className="w-full px-4 py-3 text-xs leading-relaxed font-mono border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
              placeholder="Үйлчилгээний нөхцөлийн заалтууд..."
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              Энэхүү текст нь системийн footer дээрх "Үйлчилгээний нөхцөл" болон төлбөрийн цонхонд шууд нээгдэнэ.
            </p>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Үйлчилгээний нөхцөлийг хадгалах</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. PRIVACY POLICY TAB                                             */}
      {/* ================================================================= */}
      {activeSubTab === "privacy" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Нууцлалын бодлого (Privacy Policy)</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Сурагчдын 6 оронтой OMR код, шалгалтын үр дүн, бүртгэлийн мэдээллийн аюулгүй байдал ба нууцлалын хамгаалалт.
              </p>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Сүүлд шинэчилсэн: {settings.updatedAt}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Нууцлалын бодлогын агуулга (Текст / Заалтууд):</label>
            <textarea
              rows={18}
              value={privacyPolicy}
              onChange={(e) => setPrivacyPolicy(e.target.value)}
              className="w-full px-4 py-3 text-xs leading-relaxed font-mono border border-slate-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50/50"
              placeholder="Нууцлалын бодлогын заалтууд..."
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              Энэхүү текст нь footer дээрх "Нууцлалын бодлого" товчийг дарахад хэрэглэгчдэд нээгдэнэ.
            </p>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Нууцлалын бодлогыг хадгалах</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. CONTACT INFORMATION & BANK TAB                                 */}
      {/* ================================================================= */}
      {activeSubTab === "contact" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Холбоо барих & Албан ёсны мэдээлэл</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Сурагч, багш, эцэг эхчүүдэд тусламж дэмжлэг үзүүлэх утас, цахим шуудан, хаяг болон сошиал сувгууд.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Үндсэн лавлах утас (Phone 1):</span>
              </label>
              <input
                type="text"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="+976 7711-2026"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Нэмэлт / Яаралтай утас (Phone 2):</span>
              </label>
              <input
                type="text"
                value={contactInfo.phone2 || ""}
                onChange={(e) => setContactInfo({ ...contactInfo, phone2: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="+976 9911-5428"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ерөнхий цахим шуудан (General Email):</span>
              </label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="info@smartesh.mn"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>Техникийн дэмжлэг (Support Email):</span>
              </label>
              <input
                type="email"
                value={contactInfo.supportEmail}
                onChange={(e) => setContactInfo({ ...contactInfo, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="support@smartesh.mn"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Байршлын албан ёсны хаяг (Office Address):</span>
              </label>
              <input
                type="text"
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                placeholder="Улаанбаатар хот, Сүхбаатар дүүрэг..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Ажиллах цагийн хуваарь (Working Hours):</span>
              </label>
              <input
                type="text"
                value={contactInfo.workingHours}
                onChange={(e) => setContactInfo({ ...contactInfo, workingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                placeholder="Даваа – Баасан: 09:00 – 19:00"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span>ЭЕШ Лавлах шуурхай дугаар (Hotline):</span>
              </label>
              <input
                type="text"
                value={contactInfo.hotline}
                onChange={(e) => setContactInfo({ ...contactInfo, hotline: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="1900-2026"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Facebook хуудас холбоос:</span>
              </label>
              <input
                type="text"
                value={contactInfo.facebook}
                onChange={(e) => setContactInfo({ ...contactInfo, facebook: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="facebook.com/SmartESH.Mongolia"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-500" />
                <span>Telegram суваг / групп:</span>
              </label>
              <input
                type="text"
                value={contactInfo.telegram}
                onChange={(e) => setContactInfo({ ...contactInfo, telegram: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="t.me/SmartESH_Mongolia"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Холбоо барих мэдээллийг хадгалах</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 6. LIVE PREVIEW TAB                                               */}
      {/* ================================================================= */}
      {activeSubTab === "preview" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Шууд урьдчилан харах</span>
                <h3 className="text-base font-black text-slate-900">Хэрэглэгчдийн Premium цонх & Багцын харагдац</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Шууд холбогдсон
              </span>
            </div>

            {/* Preview of the 2 Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student Plan Card Preview */}
              <div className="p-5 rounded-2xl border-2 border-amber-500 bg-amber-50/40 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-amber-800 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-amber-600" />
                    <span>{pricing.studentPlanName}</span>
                  </span>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-amber-200 text-amber-800">
                    {pricing.durationDays} хоног
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{pricing.studentYearlyPrice.toLocaleString()}₮</span>
                  <span className="text-xs text-slate-600 font-bold">/ жилээр</span>
                </div>

                <p className="text-xs text-slate-600">{pricing.studentPlanDescription}</p>

                <div className="border-t border-amber-200/70 pt-2 space-y-1 text-xs text-slate-800">
                  {pricing.features
                    .filter((f) => f.studentIncluded)
                    .slice(0, 4)
                    .map((f) => (
                      <div key={f.id} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{f.name}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Teacher Plan Card Preview */}
              <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>{pricing.teacherPlanName}</span>
                  </span>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">
                    {pricing.durationDays} хоног
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{pricing.teacherYearlyPrice.toLocaleString()}₮</span>
                  <span className="text-xs text-slate-600 font-bold">/ жилээр</span>
                </div>

                <p className="text-xs text-slate-600">{pricing.teacherPlanDescription}</p>

                <div className="border-t border-emerald-200/70 pt-2 space-y-1 text-xs text-slate-800">
                  {pricing.features
                    .filter((f) => f.teacherIncluded)
                    .slice(0, 4)
                    .map((f) => (
                      <div key={f.id} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Bank Info Box Preview */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Шилжүүлэг хүлээн авах банкны мэдээлэл:</span>
                </span>
                <span className="font-mono text-amber-300">{pricing.bankName}</span>
              </div>
              <div className="flex items-center justify-between bg-white/10 p-2.5 rounded-xl">
                <span className="text-slate-300">Дансны дугаар:</span>
                <span className="font-mono font-bold text-base text-white tracking-wider">{pricing.accountNumber}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Хүлээн авагч:</span>
                <span className="font-bold text-white">{pricing.accountHolder}</span>
              </div>
            </div>

            {/* Comparison Table Preview */}
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="bg-slate-50 px-4 py-2.5 font-bold text-xs text-slate-800 border-b border-slate-200">
                Боломжуудын харьцуулалт (Хэрэглэгчдэд харагдах бүтэн хүснэгт)
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Боломж</th>
                    <th className="py-2.5 px-3 text-center bg-amber-50 text-amber-900">Сурагч ({pricing.studentYearlyPrice.toLocaleString()}₮)</th>
                    <th className="py-2.5 px-3 text-center bg-emerald-50 text-emerald-900">Багш ({pricing.teacherYearlyPrice.toLocaleString()}₮)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pricing.features.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900">{f.name}</td>
                      <td className="py-2 px-3 text-center">
                        {f.studentIncluded ? (
                          <span className="text-amber-700 font-bold">{f.studentBadge || "✓"}</span>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {f.teacherIncluded ? (
                          <span className="text-emerald-700 font-bold">{f.teacherBadge || "✓"}</span>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
