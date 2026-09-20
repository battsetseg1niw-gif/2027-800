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
} from "lucide-react";
import { Role, UserProfile, NotificationItem } from "../types";

interface NavbarProps {
  currentUser: UserProfile;
  activeRole: Role;
  onRoleChange: (role: Role) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenPremium: () => void;
  onOpenSqlModal: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onOpenPremium,
  onOpenSqlModal,
  notifications,
  onMarkNotificationRead,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
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
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    Smart<span className="text-blue-600">ESH</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    2006–2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 font-medium leading-none">
                  Монголын Англи хэлний ЭЕШ систем
                </p>
              </div>
            </button>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-1">
              {/* Common: Role Dashboard */}
              <button
                onClick={() => onTabChange("dashboard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "dashboard"
                    ? activeRole === "admin"
                      ? "bg-purple-100 text-purple-800 font-bold border border-purple-200 shadow-xs"
                      : activeRole === "teacher"
                      ? "bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shadow-xs"
                      : "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-800 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {activeRole === "admin" && <Shield className="w-3.5 h-3.5 text-purple-700" />}
                {activeRole === "teacher" && <UserCheck className="w-3.5 h-3.5 text-emerald-700" />}
                <span>
                  {activeRole === "admin"
                    ? "Админ самбар"
                    : activeRole === "teacher"
                    ? "Багшийн самбар"
                    : "Хянах самбар"}
                </span>
              </button>

              {/* TEACHER & ADMIN ONLY: Unified Question Bank Studio */}
              {activeRole !== "student" && (
                <button
                  onClick={() => onTabChange("question-bank")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === "question-bank"
                      ? activeRole === "admin"
                        ? "bg-purple-100 text-purple-800 font-bold border border-purple-200 shadow-xs"
                        : "bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shadow-xs"
                      : "text-slate-800 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <PlusCircle className={`w-3.5 h-3.5 ${activeRole === "admin" ? "text-purple-600" : "text-emerald-600"}`} />
                  <span>Тест оруулах & Сан</span>
                </button>
              )}

              {/* ADMIN ONLY: Pricing, Rates & Features Settings */}
              {activeRole === "admin" && (
                <button
                  id="nav-admin-pricing-btn"
                  onClick={() => onTabChange("pricing-settings")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === "pricing-settings"
                      ? "bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-xs"
                      : "text-amber-800 hover:text-amber-900 bg-amber-50/70 hover:bg-amber-100 border border-amber-200/80"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                  <span>💰 Үнэ тариф & Тохиргоо</span>
                </button>
              )}

              {/* ESH Archive Papers */}
              <button
                onClick={() => onTabChange("archive")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "archive"
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-800 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>{activeRole === "student" ? "ЭЕШ Сан (2006–2026)" : "ЭЕШ Сан & Архив"}</span>
              </button>

              {/* STUDENT ONLY: Weekly Mock Exams */}
              {activeRole === "student" && (
                <button
                  onClick={() => onTabChange("weekly-mock")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === "weekly-mock"
                      ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-xs"
                      : "text-slate-800 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>7 хоногийн Mock</span>
                </button>
              )}

              {/* STUDENT ONLY: Practice Test (Student-facing self-practice) */}
              {activeRole === "student" && (
                <button
                  onClick={() => onTabChange("practice-test")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === "practice-test"
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-800 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Дасгал даалгавар</span>
                </button>
              )}

              {/* TEACHER & ADMIN ONLY: OMR Scanner Hub */}
              {activeRole !== "student" && (
                <button
                  onClick={() => onTabChange("omr-scanner")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === "omr-scanner"
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-800 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <ScanLine className="w-3.5 h-3.5 text-blue-600" />
                  <span>OMR Хуудас & Сканнер</span>
                </button>
              )}

              {/* STUDENT ONLY: Mistakes Notebook */}
              {activeRole === "student" && (
                <button
                  onClick={() => onTabChange("mistakes")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === "mistakes"
                      ? "bg-amber-50 text-amber-800 font-bold"
                      : "text-slate-800 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Алдааны дэвтэр</span>
                </button>
              )}

              {/* Common: Learning Center */}
              <button
                onClick={() => onTabChange("learning-center")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "learning-center"
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-800 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Learning Center</span>
              </button>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Premium Button / Status */}
            {currentUser.isPremium ? (
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
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
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
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">Мэдэгдлийн сан</h4>
                    <span className="text-[11px] text-slate-700">{notifications.length} мэдэгдэл</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-700">Мэдэгдэл байхгүй байна.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.read ? "bg-blue-50/40" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-xs font-semibold text-slate-900">{n.title}</h5>
                            <span className="text-[10px] text-slate-700 whitespace-nowrap">{n.createdAt}</span>
                          </div>
                          <p className="text-[11px] text-slate-800 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Switcher */}
            <div className="relative">
              <button
                id="btn-role-selector"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  activeRole === "admin"
                    ? "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
                    : activeRole === "teacher"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                }`}
              >
                {activeRole === "admin" && <Shield className="w-3.5 h-3.5 text-purple-700" />}
                {activeRole === "teacher" && <UserCheck className="w-3.5 h-3.5 text-emerald-700" />}
                {activeRole === "student" && <GraduationCap className="w-3.5 h-3.5 text-blue-700" />}
                <span>
                  {activeRole === "admin"
                    ? "Админ"
                    : activeRole === "teacher"
                    ? "Багш"
                    : "Сурагч"}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-700 border-b border-slate-100">
                    Эрх солих (3 Role)
                  </div>
                  <button
                    onClick={() => {
                      onRoleChange("student");
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      activeRole === "student" ? "font-bold text-blue-600 bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span>Сурагч (Student)</span>
                    </div>
                    {activeRole === "student" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => {
                      onRoleChange("teacher");
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      activeRole === "teacher" ? "font-bold text-emerald-600 bg-emerald-50/50" : "text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Багш (Teacher)</span>
                    </div>
                    {activeRole === "teacher" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      onRoleChange("admin");
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      activeRole === "admin" ? "font-bold text-purple-600 bg-purple-50/50" : "text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Админ (Admin)</span>
                    </div>
                    {activeRole === "admin" && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-semibold text-xs flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-700 leading-none">{currentUser.school || "SmartESH"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="md:hidden border-t border-slate-200 bg-slate-50/95 px-3 py-2 overflow-x-auto flex items-center gap-1.5">
        <button
          onClick={() => onTabChange("dashboard")}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
            activeTab === "dashboard"
              ? activeRole === "admin"
                ? "bg-purple-600 text-white shadow-xs"
                : activeRole === "teacher"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200"
          }`}
        >
          {activeRole === "admin" && <Shield className="w-3 h-3" />}
          <span>
            {activeRole === "admin"
              ? "Админ"
              : activeRole === "teacher"
              ? "Багш"
              : "Самбар"}
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
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <PlusCircle className="w-3 h-3" />
            <span>Тест оруулах</span>
          </button>
        )}

        {activeRole === "admin" && (
          <button
            onClick={() => onTabChange("pricing-settings")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
              activeTab === "pricing-settings"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            <CreditCard className="w-3 h-3" />
            <span>Үнэ тариф</span>
          </button>
        )}

        <button
          onClick={() => onTabChange("archive")}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
            activeTab === "archive"
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "bg-white text-slate-700 border border-slate-200"
          }`}
        >
          {activeRole === "student" ? "ЭЕШ Сан" : "Архив"}
        </button>

        {activeRole === "student" && (
          <button
            onClick={() => onTabChange("weekly-mock")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
              activeTab === "weekly-mock"
                ? "bg-indigo-600 text-white font-bold shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Mock</span>
          </button>
        )}

        {activeRole === "student" && (
          <button
            onClick={() => onTabChange("practice-test")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              activeTab === "practice-test"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            Дасгал
          </button>
        )}

        {activeRole !== "student" && (
          <button
            onClick={() => onTabChange("omr-scanner")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
              activeTab === "omr-scanner"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <ScanLine className="w-3 h-3" />
            <span>OMR</span>
          </button>
        )}

        {activeRole === "student" && (
          <button
            onClick={() => onTabChange("mistakes")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
              activeTab === "mistakes"
                ? "bg-amber-600 text-white font-bold shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <BookmarkCheck className="w-3 h-3" />
            <span>Алдаа</span>
          </button>
        )}

        <button
          onClick={() => onTabChange("learning-center")}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
            activeTab === "learning-center"
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "bg-white text-slate-700 border border-slate-200"
          }`}
        >
          Learning Center
        </button>
      </div>
    </header>
  );
};
