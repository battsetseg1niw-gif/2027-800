import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Volume2,
  CheckCircle2,
  Bookmark,
  RefreshCw,
  BookOpen,
  ChevronRight,
  Lightbulb,
  Layers,
  Flame,
  Award,
  Calendar,
  Check,
  Plus,
} from "lucide-react";
import { DailyVocabularyItem, DailyVocabularySet, UserProfile } from "../types";
import { db } from "../lib/supabase";

interface DailyVocabularyWidgetProps {
  currentUser?: UserProfile;
  onOpenLearningCenter?: () => void;
}

export const DailyVocabularyWidget: React.FC<DailyVocabularyWidgetProps> = ({
  currentUser,
  onOpenLearningCenter,
}) => {
  const [vocabSet, setVocabSet] = useState<DailyVocabularySet>(() => db.getTodayVocabSet());
  const [memorizedIds, setMemorizedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`smartesh_memorized_words_${currentUser?.id || "guest"}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [speechActiveId, setSpeechActiveId] = useState<string | null>(null);
  const [aiSuccessToast, setAiSuccessToast] = useState<string | null>(null);

  const words = vocabSet.words || [];
  const currentWord = words[activeWordIdx] || words[0];
  const memorizedCount = words.filter((w) => memorizedIds.includes(w.id)).length;
  const progressPercent = words.length > 0 ? Math.round((memorizedCount / words.length) * 100) : 0;

  const handleToggleMemorized = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = memorizedIds.includes(id)
      ? memorizedIds.filter((item) => item !== id)
      : [...memorizedIds, id];
    setMemorizedIds(updated);
    try {
      localStorage.setItem(`smartesh_memorized_words_${currentUser?.id || "guest"}`, JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSpeak = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.88;
      setSpeechActiveId(id);
      utterance.onend = () => setSpeechActiveId(null);
      utterance.onerror = () => setSpeechActiveId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // AI Generator for brand new 10 vocabulary set
  const handleGenerateNewAiWords = async () => {
    setIsGeneratingAi(true);
    try {
      const themes = [
        "ЭЕШ-д тогтмол ирдэг академик 10 үг",
        "Шалгалтын эссэ ба эх бичвэрийн түлхүүр 10 үг",
        "Түгээмэл хэллэг үйл үгс (Phrasal Verbs)",
        "ЭЕШ төөрөгдүүлэгч ижил утгат үгс (Synonyms)",
      ];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];

      const res = await fetch("/api/ai/generate-daily-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: randomTheme, level: "High Frequency", count: 10 }),
      });

      const data = await res.json();
      if (data.success && data.words && data.words.length > 0) {
        const newSet: DailyVocabularySet = {
          id: `vocab-ai-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          theme: randomTheme,
          words: data.words,
          source: "ai",
          createdByName: "SmartESH AI",
          createdAt: new Date().toISOString(),
        };
        db.saveDailyVocabSet(newSet);
        setVocabSet(newSet);
        setActiveWordIdx(0);
        setAiSuccessToast("Хиймэл оюунаар өнөөдрийн шинэ 10 үг амжилттай үүслээ!");
        setTimeout(() => setAiSuccessToast(null), 4000);
      }
    } catch (err) {
      console.warn("AI vocab generation failed:", err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
      {/* Header: Title, Progress & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">Өнөөдрийн 10 Үг</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {vocabSet.source === "ai" ? "✨ AI сонгосон" : "Багшийн сануулга"}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5 line-clamp-1">
              {vocabSet.theme || "ЭЕШ-д өндөр давтамжтай үгсийн өдөр тутмын цээжлэлт"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsFlashcardMode(!isFlashcardMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isFlashcardMode
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            title="Картаар цээжлэх горим"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>{isFlashcardMode ? "Жагсаалт руу шилжих" : "Флаш карт"}</span>
          </button>

          <button
            disabled={isGeneratingAi}
            onClick={handleGenerateNewAiWords}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            title="Хиймэл оюунаар өөр 10 үг үүсгэх"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? "animate-spin" : ""}`} />
            <span>{isGeneratingAi ? "Үүсгэж байна..." : "AI Шинэ 10 үг"}</span>
          </button>
        </div>
      </div>

      {aiSuccessToast && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{aiSuccessToast}</span>
        </div>
      )}

      {/* Progress Bar & Counter */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-900 text-sm shadow-xs">
            {memorizedCount}/{words.length}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Цээжилсэн байдал: <span className="text-amber-600">{progressPercent}%</span>
            </div>
            <div className="text-[11px] text-slate-700">
              Өдөрт 10 үг цээжлэх нь сард 300 үгийн нөөц бүрдүүлнэ
            </div>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* FLASHCARD MODE */}
      {isFlashcardMode && currentWord ? (
        <div className="space-y-4">
          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="cursor-pointer min-h-[260px] bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 rounded-3xl p-8 border-2 border-amber-200/80 shadow-md flex flex-col items-center justify-center text-center relative transition-transform duration-300 hover:scale-[1.01]"
          >
            <div className="absolute top-4 left-4 text-xs font-bold text-slate-700">
              {activeWordIdx + 1} / {words.length}
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={(e) => handleToggleMemorized(currentWord.id, e)}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                  memorizedIds.includes(currentWord.id)
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{memorizedIds.includes(currentWord.id) ? "Цээжилсэн" : "Цээжлэх"}</span>
              </button>
            </div>

            {!isCardFlipped ? (
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  {currentWord.partOfSpeech}
                </span>
                <h4 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {currentWord.word}
                </h4>
                {currentWord.phonetic && (
                  <p className="text-sm font-mono text-slate-700">{currentWord.phonetic}</p>
                )}
                <div className="pt-4">
                  <button
                    onClick={(e) => handleSpeak(currentWord.word, currentWord.id, e)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 mx-auto transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Дуудлага сонсох</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-700 pt-2 font-medium">
                  (Картыг товшиж монгол орчуулга ба жишээг харна уу)
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Монгол утга ба жишээ
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-amber-900">
                  {currentWord.definitionMn}
                </h4>
                <p className="text-xs text-slate-700 max-w-md mx-auto">
                  {currentWord.definitionEn}
                </p>

                <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/60 max-w-lg mx-auto text-left space-y-1.5">
                  <p className="text-xs font-semibold text-slate-900">
                    "{currentWord.exampleSentence}"
                  </p>
                  <p className="text-[11px] text-slate-700">
                    "{currentWord.exampleTranslation}"
                  </p>
                </div>

                {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-700 font-semibold">Ижил утга:</span>
                    {currentWord.synonyms.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Flashcard Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              disabled={activeWordIdx === 0}
              onClick={() => {
                setActiveWordIdx((prev) => Math.max(0, prev - 1));
                setIsCardFlipped(false);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              ← Өмнөх үг
            </button>
            <span className="text-xs font-bold text-slate-700">
              {activeWordIdx + 1} / {words.length}
            </span>
            <button
              disabled={activeWordIdx === words.length - 1}
              onClick={() => {
                setActiveWordIdx((prev) => Math.min(words.length - 1, prev + 1));
                setIsCardFlipped(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-40 transition-colors"
            >
              Дараах үг →
            </button>
          </div>
        </div>
      ) : (
        /* LIST VIEW OF 10 WORDS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {words.map((item, idx) => {
            const isDone = memorizedIds.includes(item.id);
            return (
              <div
                key={item.id || idx}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isDone
                    ? "bg-emerald-50/40 border-emerald-200/80"
                    : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-extrabold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-base font-black text-slate-900">{item.word}</h4>
                      {item.phonetic && (
                        <span className="text-xs font-mono text-slate-700">{item.phonetic}</span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.partOfSpeech}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSpeak(item.word, item.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          speechActiveId === item.id
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "text-slate-700 hover:text-slate-800 border-slate-200 hover:bg-slate-50"
                        }`}
                        title="Дуудлага сонсох"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                      </button>

                      <button
                        onClick={() => handleToggleMemorized(item.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isDone
                            ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                            : "text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                        title={isDone ? "Цээжилсэн жагсаалтаас хасах" : "Цээжилснээр тэмдэглэх"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-bold text-amber-950">{item.definitionMn}</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{item.definitionEn}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1 bg-slate-50/60 p-2.5 rounded-xl">
                  <p className="font-semibold text-slate-800 italic">"{item.exampleSentence}"</p>
                  <p className="text-[11px] text-slate-700">"{item.exampleTranslation}"</p>
                </div>

                {item.synonyms && item.synonyms.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-700 font-bold uppercase">Ижил утга:</span>
                    {item.synonyms.map((syn) => (
                      <span
                        key={syn}
                        className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-semibold border border-amber-200/60"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
