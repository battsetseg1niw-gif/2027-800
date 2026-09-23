import React, { useState } from "react";
import {
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Flame,
  Target,
  BookOpen,
  Crown,
  Zap,
  Shield,
  Layers,
  ChevronRight,
  TrendingUp,
  X,
  ExternalLink,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";
import { StudentBadge, BadgeTier, BadgeCategory } from "../types/badge";
import { getMilestoneSummary } from "../lib/badgeEngine";

interface StudentMilestoneBadgesProps {
  badges: StudentBadge[];
  onOpenExamList?: () => void;
  onOpenMistakes?: () => void;
  onOpenLearningCenter?: () => void;
}

export const StudentMilestoneBadges: React.FC<StudentMilestoneBadgesProps> = ({
  badges,
  onOpenExamList,
  onOpenMistakes,
  onOpenLearningCenter,
}) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "unlocked" | BadgeCategory>("all");
  const [selectedBadge, setSelectedBadge] = useState<StudentBadge | null>(null);

  const summary = getMilestoneSummary(badges);

  const filteredBadges = badges.filter((badge) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unlocked") return badge.isUnlocked;
    return badge.category === activeFilter;
  });

  const triggerCelebration = (badge: StudentBadge) => {
    setSelectedBadge(badge);
    if (badge.isUnlocked) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
      });
    }
  };

  const getTierStyles = (tier: BadgeTier, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        cardBg: "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80",
        badgeBg: "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
        glow: "",
        tag: "Түгжигдсэн",
      };
    }
    switch (tier) {
      case "diamond":
        return {
          cardBg: "bg-gradient-to-br from-indigo-950/40 via-purple-900/20 to-slate-900/60 border-purple-400/50 shadow-md shadow-purple-500/10",
          badgeBg: "bg-gradient-to-tr from-cyan-400 to-purple-500 text-slate-950 font-black",
          glow: "ring-2 ring-purple-400/30",
          tag: "Diamond Элит",
        };
      case "gold":
        return {
          cardBg: "bg-gradient-to-br from-amber-950/30 via-yellow-900/20 to-slate-900/60 border-amber-400/40 shadow-md shadow-amber-500/10",
          badgeBg: "bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black",
          glow: "ring-2 ring-amber-400/30",
          tag: "Gold Алт",
        };
      case "silver":
        return {
          cardBg: "bg-gradient-to-br from-slate-800/40 via-blue-900/20 to-slate-900/60 border-blue-400/30 shadow-sm",
          badgeBg: "bg-gradient-to-tr from-slate-200 to-blue-300 text-slate-900 font-bold",
          glow: "ring-1 ring-blue-400/20",
          tag: "Silver Мөнгө",
        };
      case "bronze":
      default:
        return {
          cardBg: "bg-gradient-to-br from-orange-950/20 via-amber-900/10 to-slate-900/60 border-orange-400/30 shadow-sm",
          badgeBg: "bg-gradient-to-tr from-amber-600 to-orange-500 text-white font-bold",
          glow: "ring-1 ring-orange-400/20",
          tag: "Bronze Хүрэл",
        };
    }
  };

  const renderIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case "Award":
        return <Award className={className} />;
      case "Crown":
        return <Crown className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Flame":
        return <Flame className={className} />;
      case "Shield":
        return <Shield className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "CheckCircle2":
        return <CheckCircle2 className={className} />;
      case "Layers":
        return <Layers className={className} />;
      case "Target":
      default:
        return <Target className={className} />;
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Top Header & Milestone Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Суралцагчийн Амжилтын Зорилтууд (Milestones)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Амжилтын Тэмдэгтүүд & Цол Зэрэг
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed">
            10 шалгалт дуусгах, алдаагаа засах, улсын шилдэг 5%-д багтах зэрэг шалгууруудыг хангаж тэмдэгтүүдээ цуглуулан ЭЕШ-д бэлтгэгээрэй.
          </p>
        </div>

        {/* Milestone Badge Counters */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-700 dark:text-slate-400 font-medium">Нээгдсэн</div>
            <div className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400">
              {summary.unlockedCount} <span className="text-xs text-slate-700 dark:text-slate-400 font-normal">/ {summary.totalBadges}</span>
            </div>
          </div>
          <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-700 dark:text-slate-400 font-medium">Нийт XP</div>
            <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
              +{summary.totalXp}
            </div>
          </div>
          <div className="text-center px-2 flex items-center gap-1.5 text-xs font-bold">
            <span className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60" title="Gold badges">
              🥇 {summary.tierCounts.gold}
            </span>
            <span className="px-2 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/60" title="Diamond badges">
              💎 {summary.tierCounts.diamond}
            </span>
          </div>
        </div>
      </div>

      {/* Nearest Milestone Next Target Banner */}
      {summary.nearestBadge && (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl p-4 sm:p-5 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              {renderIcon(summary.nearestBadge.icon, "w-6 h-6")}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Дараагийн ойрхон зорилт
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {summary.nearestBadge.progressPercent}% биелсэн
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {summary.nearestBadge.title} ({summary.nearestBadge.titleEn})
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-400">
                {summary.nearestBadge.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:shrink-0">
            <div className="w-32 sm:w-40 space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-700 dark:text-slate-400">{summary.nearestBadge.currentValue} / {summary.nearestBadge.targetValue} {summary.nearestBadge.unit}</span>
                <span className="text-blue-600 dark:text-blue-400">{summary.nearestBadge.progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${summary.nearestBadge.progressPercent}%` }}
                />
              </div>
            </div>

            {summary.nearestBadge.category === "exams" && onOpenExamList && (
              <button
                onClick={onOpenExamList}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shrink-0 shadow-sm"
              >
                Шалгалт өгөх
              </button>
            )}
            {summary.nearestBadge.category === "mistakes" && onOpenMistakes && (
              <button
                onClick={onOpenMistakes}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shrink-0 shadow-sm"
              >
                Алдаа засах
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
            activeFilter === "all"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Бүх тэмдэгтүүд ({badges.length})
        </button>

        <button
          onClick={() => setActiveFilter("unlocked")}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === "unlocked"
              ? "bg-amber-500 text-slate-950 font-black shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Нээгдсэн ({summary.unlockedCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter("exams")}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
            activeFilter === "exams"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Шалгалтын тоо (Exams)
        </button>

        <button
          onClick={() => setActiveFilter("score")}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
            activeFilter === "score"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Өндөр оноо (Top Scores)
        </button>

        <button
          onClick={() => setActiveFilter("mistakes")}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
            activeFilter === "mistakes"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Алдааны дэвтэр (Mistakes)
        </button>

        <button
          onClick={() => setActiveFilter("streak")}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
            activeFilter === "streak"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Тууштай дараалал (Streak)
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const tierStyle = getTierStyles(badge.tier, badge.isUnlocked);
          return (
            <div
              key={badge.id}
              onClick={() => triggerCelebration(badge)}
              className={`relative rounded-2xl p-5 border transition-all cursor-pointer hover:scale-[1.02] ${tierStyle.cardBg} ${tierStyle.glow} flex flex-col justify-between space-y-4`}
            >
              {/* Card Header with Icon & Tier pill */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform ${
                    badge.isUnlocked
                      ? tierStyle.badgeBg
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-400"
                  }`}
                >
                  {renderIcon(badge.icon, "w-6 h-6")}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      badge.isUnlocked
                        ? "bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white border-white/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {tierStyle.tag}
                  </span>
                  {badge.rewardXp && (
                    <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400">
                      +{badge.rewardXp} XP
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  {badge.title}
                </h4>
                <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 line-clamp-1">
                  {badge.titleEn}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-400 leading-snug line-clamp-2 pt-0.5">
                  {badge.description}
                </p>
              </div>

              {/* Progress or Unlocked status */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                {badge.isUnlocked ? (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Нээгдсэн!</span>
                    </div>
                    {badge.unlockedAt && (
                      <span className="text-[10px] text-slate-700 dark:text-slate-400">
                        {badge.unlockedAt}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 dark:text-slate-400 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{badge.currentValue} / {badge.targetValue} {badge.unit}</span>
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {badge.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${badge.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Icon & Tier */}
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${
                  selectedBadge.isUnlocked
                    ? getTierStyles(selectedBadge.tier, true).badgeBg
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                }`}
              >
                {renderIcon(selectedBadge.icon, "w-8 h-8")}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    {selectedBadge.tier.toUpperCase()} TIER
                  </span>
                  {selectedBadge.isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      Амжилттай авсан
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      Түгжигдсэн
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedBadge.title}
                </h3>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {selectedBadge.titleEn}
                </div>
              </div>
            </div>

            {/* Description & Pedagogical context */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white">
                {selectedBadge.description}
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/80 pt-2">
                💡 <strong>ЭЕШ бэлтгэлийн ач холбогдол:</strong> Энэхүү зорилтыг биелүүлснээр таны шалгалтын хурд, алдаагүй ажиллах нарийвчлал болон сэтгэл зүйн бэлтгэл өндөр түвшинд хүрнэ.
              </p>
            </div>

            {/* Progress status */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-400">Явцын биелэлт:</span>
                <span className="text-slate-900 dark:text-white font-mono">
                  {selectedBadge.currentValue} / {selectedBadge.targetValue} {selectedBadge.unit} ({selectedBadge.progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedBadge.isUnlocked
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600"
                  }`}
                  style={{ width: `${selectedBadge.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              {selectedBadge.category === "exams" && onOpenExamList && (
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    onOpenExamList();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Шалгалтууд руу очих</span>
                </button>
              )}
              {selectedBadge.category === "mistakes" && onOpenMistakes && (
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    onOpenMistakes();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span>Алдааны дэвтэр нээх</span>
                </button>
              )}
              {selectedBadge.category === "subject" && onOpenLearningCenter && (
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    onOpenLearningCenter();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Layers className="w-4 h-4" />
                  <span>Learning Center орох</span>
                </button>
              )}
              <button
                onClick={() => setSelectedBadge(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
