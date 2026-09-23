import { StudentBadge, StudentMilestoneSummary } from "../types/badge";
import { ExamSubmission, MistakeItem, UserProfile } from "../types";

export interface BadgeDefinition {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  category: "exams" | "score" | "mistakes" | "streak" | "subject";
  tier: "bronze" | "silver" | "gold" | "diamond";
  icon: string;
  targetValue: number;
  unit: string;
  rewardXp: number;
  calculateProgress: (stats: StudentStats) => { current: number; isUnlocked: boolean };
}

export interface StudentStats {
  totalExamsCompleted: number;
  topScaledScore: number;
  topPercentage: number;
  mistakesCorrected: number;
  streakDays: number;
  hasPerfectScore: boolean;
  topGrammarRate: number;
  topReadingRate: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Exams Milestones
  {
    id: "first_exam",
    title: "Анхны Алхам",
    titleEn: "First Step Taken",
    description: "Англи хэлний анхны албан ёсны эсвэл загвар шалгалтаа амжилттай өгч дуусгах.",
    category: "exams",
    tier: "bronze",
    icon: "Target",
    targetValue: 1,
    unit: "шалгалт",
    rewardXp: 50,
    calculateProgress: (s) => ({
      current: s.totalExamsCompleted,
      isUnlocked: s.totalExamsCompleted >= 1,
    }),
  },
  {
    id: "exams_5",
    title: "Туршлагажиж Буй Шалгуулагч",
    titleEn: "5 Exams Completed",
    description: "Нийт 5 шалгалт (дижитал болон цаасан OMR) ажиллаж туршлага хуримтлуулах.",
    category: "exams",
    tier: "silver",
    icon: "BookOpen",
    targetValue: 5,
    unit: "шалгалт",
    rewardXp: 150,
    calculateProgress: (s) => ({
      current: s.totalExamsCompleted,
      isUnlocked: s.totalExamsCompleted >= 5,
    }),
  },
  {
    id: "exams_10",
    title: "10 Шалгалтын Баатар",
    titleEn: "10 Exams Completed",
    description: "Нийт 10 шалгалт гүйцэтгэж, ЭЕШ-ийн бодит форматад бүрэн дадлагажих.",
    category: "exams",
    tier: "gold",
    icon: "Award",
    targetValue: 10,
    unit: "шалгалт",
    rewardXp: 300,
    calculateProgress: (s) => ({
      current: s.totalExamsCompleted,
      isUnlocked: s.totalExamsCompleted >= 10,
    }),
  },
  {
    id: "exams_25",
    title: "ЭЕШ-ийн Домог",
    titleEn: "25 Exams Completed",
    description: "25 бодит болон холимог тест өгсөн хамгийн шаргуу шалгуулагч болох.",
    category: "exams",
    tier: "diamond",
    icon: "Crown",
    targetValue: 25,
    unit: "шалгалт",
    rewardXp: 600,
    calculateProgress: (s) => ({
      current: s.totalExamsCompleted,
      isUnlocked: s.totalExamsCompleted >= 25,
    }),
  },

  // Score Milestones
  {
    id: "top_5_percent",
    title: "Шилдэг 5% ЭЕШ Оноо",
    titleEn: "Top 5% Score",
    description: "Шалгалтад 750+ хуваарьт оноо (эсвэл 92%+ гүйцэтгэл) авч улсын шилдэг 5%-д багтах.",
    category: "score",
    tier: "gold",
    icon: "Sparkles",
    targetValue: 750,
    unit: "оноо",
    rewardXp: 400,
    calculateProgress: (s) => ({
      current: s.topScaledScore,
      isUnlocked: s.topScaledScore >= 750 || s.topPercentage >= 92,
    }),
  },
  {
    id: "top_1_percent",
    title: "Тэргүүн Эгнээ (Top 1%)",
    titleEn: "Top 1% Elite Score",
    description: "Шалгалтад 780+ хуваарьт оноо авч Монгол Улсын шилдэг 1% элит шалгуулагч болох.",
    category: "score",
    tier: "diamond",
    icon: "Crown",
    targetValue: 780,
    unit: "оноо",
    rewardXp: 800,
    calculateProgress: (s) => ({
      current: s.topScaledScore,
      isUnlocked: s.topScaledScore >= 780,
    }),
  },
  {
    id: "perfect_score",
    title: "100% Төгс Гүйцэтгэл",
    titleEn: "Perfect Score (50/50)",
    description: "Аль нэг бүтэн шалгалтын бүх даалгаврыг 100% алдаагүй зөв бөглөж 50/50 авах.",
    category: "score",
    tier: "diamond",
    icon: "Zap",
    targetValue: 100,
    unit: "%",
    rewardXp: 500,
    calculateProgress: (s) => ({
      current: s.hasPerfectScore ? 100 : Math.round(s.topPercentage),
      isUnlocked: s.hasPerfectScore,
    }),
  },

  // Mistakes Milestones
  {
    id: "mistakes_10",
    title: "Алдаагаа Засагч",
    titleEn: "10 Mistakes Corrected",
    description: "Алдааны дэвтрээсээ 10 буруу хариулсан асуултыг тайлбараар нь дахин судалж засах.",
    category: "mistakes",
    tier: "bronze",
    icon: "CheckCircle2",
    targetValue: 10,
    unit: "алдаа",
    rewardXp: 100,
    calculateProgress: (s) => ({
      current: s.mistakesCorrected,
      isUnlocked: s.mistakesCorrected >= 10,
    }),
  },
  {
    id: "mistakes_50",
    title: "Алдаагүй Боловсрогч",
    titleEn: "50 Mistakes Corrected",
    description: "Алдааны дэвтрийн 50 асуудлыг дүрмийн дагуу гүйцэт засварлаж бүрэн эзэмших.",
    category: "mistakes",
    tier: "silver",
    icon: "CheckCircle2",
    targetValue: 50,
    unit: "алдаа",
    rewardXp: 250,
    calculateProgress: (s) => ({
      current: s.mistakesCorrected,
      isUnlocked: s.mistakesCorrected >= 50,
    }),
  },
  {
    id: "mistakes_100",
    title: "100 Алдаа Зассан Мастер",
    titleEn: "100 Mistakes Corrected",
    description: "100 алдаатай асуултаа бүрэн засварлаж, сул талуудаа давуу тал болгон хувиргах.",
    category: "mistakes",
    tier: "gold",
    icon: "Shield",
    targetValue: 100,
    unit: "алдаа",
    rewardXp: 500,
    calculateProgress: (s) => ({
      current: s.mistakesCorrected,
      isUnlocked: s.mistakesCorrected >= 100,
    }),
  },

  // Study Streak Milestones
  {
    id: "streak_3",
    title: "3 Өдрийн Дараалал",
    titleEn: "3-Day Study Streak",
    description: "3 өдөр дараалан тасралтгүй шалгалт, үг цээжлэлт эсвэл дасгал ажиллах.",
    category: "streak",
    tier: "bronze",
    icon: "Flame",
    targetValue: 3,
    unit: "өдөр",
    rewardXp: 80,
    calculateProgress: (s) => ({
      current: s.streakDays,
      isUnlocked: s.streakDays >= 3,
    }),
  },
  {
    id: "streak_7",
    title: "7 Өдрийн Тууштай Баатар",
    titleEn: "7-Day Study Streak",
    description: "Бүтэн 7 хоногийн турш өдөр бүр идэвхтэй бэлтгэл хийж суралцах дадал төлөвшүүлэх.",
    category: "streak",
    tier: "silver",
    icon: "Flame",
    targetValue: 7,
    unit: "өдөр",
    rewardXp: 200,
    calculateProgress: (s) => ({
      current: s.streakDays,
      isUnlocked: s.streakDays >= 7,
    }),
  },

  // Category Subject Milestones
  {
    id: "grammar_ace",
    title: "Дүрмийн Мэргэжилтэн",
    titleEn: "Grammar Ace",
    description: "Аливаа шалгалтын Grammar хэсэгт 90%+ нарийвчлалтай хариулж дүрмээ бататгах.",
    category: "subject",
    tier: "silver",
    icon: "BookOpen",
    targetValue: 90,
    unit: "%",
    rewardXp: 200,
    calculateProgress: (s) => ({
      current: s.topGrammarRate,
      isUnlocked: s.topGrammarRate >= 90,
    }),
  },
  {
    id: "reading_master",
    title: "Эх Уншлагын Мастер",
    titleEn: "Reading Comprehension Master",
    description: "Reading хэсгийн даалгавруудад 90%+ зөв хариулж уншиж ойлгох чадвараа нотлох.",
    category: "subject",
    tier: "gold",
    icon: "Layers",
    targetValue: 90,
    unit: "%",
    rewardXp: 300,
    calculateProgress: (s) => ({
      current: s.topReadingRate,
      isUnlocked: s.topReadingRate >= 90,
    }),
  },
];

/**
 * Computes actual stats for a student from their submissions and mistake notebook items
 */
export function computeStudentStats(
  studentId: string,
  submissions: ExamSubmission[],
  mistakes: MistakeItem[],
  _user?: UserProfile
): StudentStats {
  const userSubmissions = submissions.filter((s) => s.userId === studentId);
  const userMistakes = mistakes.filter((m) => m.userId === studentId);

  const totalExamsCompleted = userSubmissions.length;
  let topScaledScore = 0;
  let topPercentage = 0;
  let hasPerfectScore = false;
  let topGrammarRate = 0;
  let topReadingRate = 0;

  userSubmissions.forEach((sub) => {
    if (sub.scaledScore > topScaledScore) {
      topScaledScore = sub.scaledScore;
    }
    if (sub.percentage > topPercentage) {
      topPercentage = sub.percentage;
    }
    if (sub.rawScore >= 50 || sub.percentage >= 100) {
      hasPerfectScore = true;
    }
    if (sub.categoryScores?.Grammar?.total > 0) {
      const gRate = Math.round((sub.categoryScores.Grammar.correct / sub.categoryScores.Grammar.total) * 100);
      if (gRate > topGrammarRate) topGrammarRate = gRate;
    }
    if (sub.categoryScores?.Reading?.total > 0) {
      const rRate = Math.round((sub.categoryScores.Reading.correct / sub.categoryScores.Reading.total) * 100);
      if (rRate > topReadingRate) topReadingRate = rRate;
    }
  });

  // Calculate resolved mistakes: count resolved items + mistake resolution counters
  const mistakesCorrected = userMistakes.reduce((count, m) => {
    if (m.resolved || m.masteryLevel === "mastered") {
      return count + (m.mistakeCount && m.mistakeCount > 1 ? m.mistakeCount : 1);
    }
    return count;
  }, 0);

  // Compute active streak (based on unique submission dates and daily engagement)
  const submissionDates = Array.from(
    new Set(userSubmissions.map((s) => s.submittedAt?.slice(0, 10)).filter(Boolean))
  ).sort();

  let streakDays = submissionDates.length > 0 ? 1 : 0;
  if (submissionDates.length > 1) {
    // Check consecutive days
    let currentStreak = 1;
    for (let i = submissionDates.length - 1; i > 0; i--) {
      const d1 = new Date(submissionDates[i]);
      const d2 = new Date(submissionDates[i - 1]);
      const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        break;
      }
    }
    streakDays = Math.max(streakDays, currentStreak);
  }

  return {
    totalExamsCompleted,
    topScaledScore,
    topPercentage,
    mistakesCorrected,
    streakDays,
    hasPerfectScore,
    topGrammarRate,
    topReadingRate,
  };
}

/**
 * Returns full list of StudentBadge objects evaluated against the student's real performance
 */
export function calculateStudentBadges(
  studentId: string,
  submissions: ExamSubmission[],
  mistakes: MistakeItem[],
  user?: UserProfile,
  savedUnlockedDates?: Record<string, string>
): StudentBadge[] {
  const stats = computeStudentStats(studentId, submissions, mistakes, user);

  return BADGE_DEFINITIONS.map((badgeDef) => {
    const { current, isUnlocked } = badgeDef.calculateProgress(stats);
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round((current / badgeDef.targetValue) * 100))
    );

    let unlockedAt: string | undefined = undefined;
    if (isUnlocked) {
      unlockedAt = savedUnlockedDates?.[badgeDef.id] || new Date().toISOString().slice(0, 10);
    }

    return {
      id: badgeDef.id,
      title: badgeDef.title,
      titleEn: badgeDef.titleEn,
      description: badgeDef.description,
      category: badgeDef.category,
      tier: badgeDef.tier,
      icon: badgeDef.icon,
      targetValue: badgeDef.targetValue,
      currentValue: Math.min(current, badgeDef.targetValue),
      unit: badgeDef.unit,
      isUnlocked,
      unlockedAt,
      progressPercent: isUnlocked ? 100 : progressPercent,
      rewardXp: badgeDef.rewardXp,
    };
  });
}

/**
 * Computes high-level summary metrics across all student badges
 */
export function getMilestoneSummary(badges: StudentBadge[]): StudentMilestoneSummary {
  const totalBadges = badges.length;
  const unlockedBadges = badges.filter((b) => b.isUnlocked);
  const unlockedCount = unlockedBadges.length;
  const lockedCount = totalBadges - unlockedCount;

  const totalXp = unlockedBadges.reduce((sum, b) => sum + (b.rewardXp || 0), 0);

  const tierCounts = {
    bronze: unlockedBadges.filter((b) => b.tier === "bronze").length,
    silver: unlockedBadges.filter((b) => b.tier === "silver").length,
    gold: unlockedBadges.filter((b) => b.tier === "gold").length,
    diamond: unlockedBadges.filter((b) => b.tier === "diamond").length,
  };

  // Find nearest locked badge to completion
  const lockedBadges = badges
    .filter((b) => !b.isUnlocked)
    .sort((a, b) => b.progressPercent - a.progressPercent);

  const nearestBadge = lockedBadges[0];

  return {
    totalBadges,
    unlockedCount,
    lockedCount,
    totalXp,
    tierCounts,
    nearestBadge,
  };
}
