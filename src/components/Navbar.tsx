import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Shield,
  UserCheck,
  Bell,
  Crown,
  Database,
  FileSpreadsheet,
  ScanLine,
  BookmarkCheck,
  LogOut,
  ChevronDown,
  Sparkles,
  PlusCircle,
  Layers,
  CreditCard,
  Sun,
  Moon,
  Sliders,
  Languages,
} from "lucide-react";
import { Role, UserProfile, NotificationItem } from "../types";
import { Language, getTranslation } from "../lib/i18n";

interface NavbarProps {
  currentUser: UserProfile | null;
  activeRole: Role;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenPremium: () => void;
  onOpenSqlModal: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  language?: Language;
  onToggleLanguage?: () => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  badgeCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRole,
  activeTab,
  onTabChange,
  onOpenPremium,
  onOpenSqlModal,
  notifications,
  onMarkNotificationRead,
  theme = "light",
  onToggleTheme,
  language = "mn",
  onToggleLanguage,
  onOpenAuthModal,
  onSignOut,
  badgeCount = 0,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);

  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, (language || "mn") as Language);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onTabChange("dashboard")}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                    Smart<span className="text-blue-600 dark:text-blue-400">ESH</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                    2006–2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-400 font-medium leading-none">
                  {t("brandTagline")}
                </p>
              </div>
            </button>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-1">
              {/* ADMIN ONLY: Visible Admin Panel Button */}
              {currentUser?.role === "admin" && (
                <button
                  id="nav-admin-panel-btn"
                  onClick={() => onTabChange("admin")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    activeTab === "admin"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500 ring-2 ring-purple-400/40"
                      : "bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-300 dark:border-purple-700 shadow-2xs"
                  }`}
                  title="Админ удирдлагын нэгдсэн систем (/admin)"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
                  <span>Админ Панел</span>
                </button>
              )}

              {/* Common: Role Dashboard */}
              <button
                onClick={() => onTabChange("dashboard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "dashboard"
                    ? activeRole === "admin"
                      ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 shadow-xs"
                      : activeRole === "teacher"
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 shadow-xs"
                      : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900"
                    : "text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {activeRole === "admin" && <Shield className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />}
                {activeRole === "teacher" && <UserCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />}
                <span>
                  {activeRole === "admin"
                    ? t("adminDashboard")
                    : activeRole === "teacher"
                    ? t("teacherDashboard")
                    : t("dashboard")}
                </span>
              </button>

              {/* TEACHER & ADMIN ONLY: Unified Question Bank Studio */}
              {activeRole !== "student" && (
                <button
                  onClick={() => onTabChange("question-bank")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === "question-bank"
                      ? activeRole === "admin"
                        ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 shadow-xs"
                        : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 shadow-xs"
                      : "text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <PlusCircle className={`w-3.5 h-3.5 ${activeRole === "admin" ? "text-purple-600 dark:text-purple-400" : "text-emerald-600 dark:text-emerald-400"}`} />
                  <span>{t("questionBank")}</span>
                </button>
              )}

              {/* ADMIN ONLY: Pricing, Rates & Features Settings */}
              {activeRole === "admin" && (
                <button
                  id="nav-admin-pricing-btn"
                  onClick={() => onTabChange("pricing-settings")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === "pricing-settings"
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 shadow-xs"
                      : "text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200/80 dark:border-amber-800/60"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>{t("pricingSettings")}</span>
                </button>
              )}

              {/* ESH Archive Papers & Unified Mock / Practice Center */}
              <button
                onClick={() => onTabChange("archive")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  ["archive", "weekly-mock", "practice-test", "custom-builder"].includes(activeTab)
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900"
                    : "text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{activeRole === "student" ? t("archive") : t("archiveTeacher")}</span>
              </button>

              {/* TEACHER & ADMIN ONLY: OMR Scanner Hub */}
              {activeRole !== "student" && (
                <button
                  onClick={() => onTabChange("omr-scanner")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === "omr-scanner"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900"
                      : "text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <ScanLine className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t("omrScanner")}</span>
                </button>
              )}

              {/* STUDENT ONLY: Mistakes Notebook */}
              {activeRole === "student" && (
                <button
                  onClick={() => onTabChange("mistakes")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === "mistakes"
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800"
                      : "text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>{t("mistakes")}</span>
                </button>
              )}

              {/* Common: Learning Center */}
              <button
                onClick={() => onTabChange("learning-center")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "learning-center"
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900"
                    : "text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t("learningCenter")}</span>
              </button>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Premium Button / Status */}
            {currentUser?.isPremium ? (
              <button
                onClick={onOpenPremium}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-300 text-amber-800 text-xs font-bold"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="hidden sm:inline">Premium 365</span>
              </button>
            ) : (
              <button
                id="btn-upgrade-premium"
                onClick={onOpenPremium}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Идэвхжүүлэх</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Мэдэгдэл"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Мэдэгдлийн сан</h4>
                    <span className="text-[11px] text-slate-700 dark:text-slate-400">{notifications.length} мэдэгдэл</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-700 dark:text-slate-400">Мэдэгдэл байхгүй байна.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                            !n.read ? "bg-blue-50/40 dark:bg-blue-950/30" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</h5>
                            <span className="text-[10px] text-slate-700 dark:text-slate-400 whitespace-nowrap">{n.createdAt}</span>
                          </div>
                          <p className="text-[11px] text-slate-800 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher Toggle Button */}
            <button
              id="btn-lang-toggle"
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              title={language === "mn" ? "Switch to English" : "Монгол хэл рүү шилжих"}
              aria-label={t("languageToggle")}
            >
              <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs">{language === "mn" ? "🇲🇳 MN" : "🇬🇧 EN"}</span>
            </button>

            {/* Global Dark Mode Theme Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={theme === "dark" ? t("lightMode") : t("darkMode")}
              title={theme === "dark" ? t("lightMode") : t("darkMode")}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* User Authenticated vs Guest State */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Verified Database Role Badge (Read directly from Supabase DB) */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs select-none ${
                    currentUser.role === "admin"
                      ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      : currentUser.role === "teacher"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  }`}
                  title="Энэ эрх нь Supabase өгөгдлийн сангаас баталгаажсан бодит эрх юм"
                >
                  {currentUser.role === "admin" && (
                    <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  )}
                  {currentUser.role === "teacher" && (
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {currentUser.role === "student" && (
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                  <span>
                    {currentUser.role === "admin"
                      ? "Админ"
                      : currentUser.role === "teacher"
                      ? "Багш"
                      : "Сурагч"}
                  </span>
                </div>

                {/* User Avatar & Info */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {currentUser.name}
                      </span>
                      {currentUser.isPremium && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                          PRO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none truncate max-w-[130px]">
                      {currentUser.email}
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  {onSignOut && (
                    <button
                      onClick={onSignOut}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
                      title="Системээс гарах (Supabase Sign Out)"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Unauthenticated Guest State -> Real Supabase Auth Trigger */
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all shadow-xs"
                >
                  Нэвтрэх
                </button>
                <button
                  onClick={onOpenAuthModal}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20"
                >
                  Бүртгүүлэх
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 px-3 py-2 overflow-x-auto flex items-center gap-1.5">
        {/* Mobile Language Switcher */}
        <button
          id="btn-lang-toggle-mobile"
          onClick={onToggleLanguage}
          className="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-2xs"
          title={language === "mn" ? "Switch to English" : "Монгол хэл рүү шилжих"}
        >
          <Languages className="w-3 h-3" />
          <span>{language === "mn" ? "🇲🇳 MN" : "🇬🇧 EN"}</span>
        </button>

        {/* Mobile Theme Toggle */}
        <button
          id="btn-theme-toggle-mobile"
          onClick={onToggleTheme}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          aria-label={theme === "dark" ? t("lightMode") : t("darkMode")}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3 h-3 text-slate-600" />
              <span>Dark</span>
            </>
          )}
        </button>

        {currentUser?.role === "admin" && (
          <button
            id="mobile-nav-admin-panel-btn"
            onClick={() => onTabChange("admin")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
              activeTab === "admin"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
            }`}
          >
            <Shield className="w-3 h-3 text-purple-700 dark:text-purple-300" />
            <span>Админ Панел</span>
          </button>
        )}

        <button
          onClick={() => onTabChange("dashboard")}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
            activeTab === "dashboard"
              ? activeRole === "admin"
                ? "bg-purple-600 text-white shadow-xs"
                : activeRole === "teacher"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-blue-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          }`}
        >
          {activeRole === "admin" && <Shield className="w-3 h-3" />}
          <span>
            {activeRole === "admin"
              ? t("admin")
              : activeRole === "teacher"
              ? t("teacher")
              : t("dashboard")}
          </span>
        </button>

        {activeRole !== "student" && (
          <button
            onClick={() => onTabChange("question-bank")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
              activeTab === "question-bank"
                ? activeRole === "admin"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <PlusCircle className="w-3 h-3" />
            <span>{t("questionBank")}</span>
          </button>
        )}

        {activeRole === "admin" && (
          <button
            onClick={() => onTabChange("pricing-settings")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
              activeTab === "pricing-settings"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            }`}
          >
            <CreditCard className="w-3 h-3" />
            <span>{t("pricingSettings")}</span>
          </button>
        )}

        <button
          onClick={() => onTabChange("archive")}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
            ["archive", "weekly-mock", "practice-test", "custom-builder"].includes(activeTab)
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <BookOpen className="w-3 h-3" />
          <span>{activeRole === "student" ? t("archive") : t("archiveTeacher")}</span>
        </button>

        {activeRole !== "student" && (
          <button
            onClick={() => onTabChange("omr-scanner")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
              activeTab === "omr-scanner"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <ScanLine className="w-3 h-3" />
            <span>{t("omrScanner")}</span>
          </button>
        )}

        {activeRole === "student" && (
          <button
            onClick={() => onTabChange("mistakes")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
              activeTab === "mistakes"
                ? "bg-amber-600 text-white font-bold shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <BookmarkCheck className="w-3 h-3" />
            <span>{t("mistakes")}</span>
          </button>
        )}

        <button
          onClick={() => onTabChange("learning-center")}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
            activeTab === "learning-center"
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          }`}
        >
          {t("learningCenter")}
        </button>
      </div>
    </header>
  );
};
