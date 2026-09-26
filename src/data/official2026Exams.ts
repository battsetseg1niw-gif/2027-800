import { Exam } from "../types";

// Official 2026 exams are loaded dynamically from Supabase or uploaded via PDF Ingestion / Teacher Editor
export const OFFICIAL_2026_EXAMS: Record<"A" | "B" | "C" | "D", Exam | null> = {
  A: null,
  B: null,
  C: null,
  D: null,
};
