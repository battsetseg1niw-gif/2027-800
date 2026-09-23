export type BadgeCategory = "exams" | "score" | "mistakes" | "streak" | "subject";
export type BadgeTier = "bronze" | "silver" | "gold" | "diamond";

export interface StudentBadge {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: string; // Lucide icon identifier
  targetValue: number;
  currentValue: number;
  unit: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
  rewardXp?: number;
}

export interface StudentMilestoneSummary {
  totalBadges: number;
  unlockedCount: number;
  lockedCount: number;
  totalXp: number;
  tierCounts: {
    bronze: number;
    silver: number;
    gold: number;
    diamond: number;
  };
  nearestBadge?: StudentBadge;
}
