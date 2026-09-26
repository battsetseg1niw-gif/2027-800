import { Exam, Question } from "../types";

// Standard Question Categories & Options for English Matriculation Exam
export const ALL_ESH_YEARS = Array.from({ length: 21 }, (_, i) => 2026 - i);
export const ALL_ESH_VARIANTS: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];

// Empty initial exams array - all exam materials and questions must be loaded from Supabase tables
export const INITIAL_EXAMS: Exam[] = [];

// Empty sample questions array - questions are fetched from database tables
export const SAMPLE_QUESTIONS: Question[] = [];
