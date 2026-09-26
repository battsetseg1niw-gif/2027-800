import { UserProfile, ExamSubmission } from "../types";

export interface RegionInfo {
  aimag: string;
  sums: string[];
}

export const MONGOLIAN_REGIONS: RegionInfo[] = [
  {
    aimag: "Улаанбаатар",
    sums: ["Баянзүрх", "Хан-Уул", "Сүхбаатар", "Чингэлтэй", "Баянгол", "Сонгинохайрхан", "Налайх", "Багануур", "Багахангай"],
  },
  {
    aimag: "Дархан-Уул",
    sums: ["Дархан сум", "Шарын гол", "Хонгор", "Орхон сум"],
  },
  {
    aimag: "Орхон",
    sums: ["Баян-Өндөр", "Жаргалант"],
  },
  {
    aimag: "Хөвсгөл",
    sums: ["Мөрөн", "Хатгал", "Рэнчинлхүмбэ", "Тариалан", "Тосонцэнгэл", "Цагааннуур"],
  },
  {
    aimag: "Сэлэнгэ",
    sums: ["Сүхбаатар сум", "Сайхан", "Мандал", "Баянгол", "Ерөө"],
  },
  {
    aimag: "Өвөрхангай",
    sums: ["Арвайхээр", "Хархорин", "Хужирт", "Бат-Өлзий"],
  },
  {
    aimag: "Архангай",
    sums: ["Эрдэнэбулган", "Ихтамир", "Цэцэрлэг", "Тариат"],
  },
  {
    aimag: "Ховд",
    sums: ["Жаргалант", "Манхан", "Булган", "Мөнххайрхан"],
  },
  {
    aimag: "Баян-Өлгий",
    sums: ["Өлгий", "Цэнгэл", "Толбо", "Дэлүүн"],
  },
  {
    aimag: "Дорнод",
    sums: ["Хэрлэн (Чойбалсан)", "Баян-Уул", "Халхгол"],
  },
  {
    aimag: "Өмнөговь",
    sums: ["Даланзадгад", "Цогтцэций", "Ханбогд"],
  },
  {
    aimag: "Төв",
    sums: ["Зуунмод", "Заамар", "Баянчандмань", "Борнуур"],
  },
];

// All user data and student exam submissions are fetched live from Supabase database tables.
export const INITIAL_REGIONAL_USERS: UserProfile[] = [];

export const INITIAL_REGIONAL_SUBMISSIONS: ExamSubmission[] = [];
