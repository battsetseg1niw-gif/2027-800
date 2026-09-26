import { DailyVocabularySet, WeeklyTopStudent } from "../types";

// Clean initial store: Vocabulary sets are generated live via Gemini AI or fetched from Supabase database
export const INITIAL_DAILY_VOCABULARY_SETS: DailyVocabularySet[] = [];

// Clean initial store: Weekly top students are computed from actual student exam submissions
export const INITIAL_WEEKLY_TOP_STUDENTS: WeeklyTopStudent[] = [];
