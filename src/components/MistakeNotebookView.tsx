import React, { useState } from "react";
import {
  BookmarkCheck,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Sparkles,
  BookOpen,
  Filter,
  ArrowRight,
  Flame,
  Award,
} from "lucide-react";
import { MistakeItem, QuestionCategory } from "../types";

interface MistakeNotebookViewProps {
  mistakes: MistakeItem[];
  onRemoveMistake: (id: string) => void;
  onUpdateMastery: (id: string, masteryLevel: "learning" | "mastered") => void;
  onStartRetest: (selectedMistakes: MistakeItem[]) => void;
}

export const MistakeNotebookView: React.FC<MistakeNotebookViewProps> = ({
  mistakes,
  onRemoveMistake,
  onUpdateMastery,
  onStartRetest,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterMastery, setFilterMastery] = useState<string>("all");

  const filteredMistakes = mistakes.filter((m) => {
    if (selectedCategory !== "all" && m.question.category !== selectedCategory) return false;
    if (filterMastery !== "all" && m.masteryLevel !== filterMastery) return false;
    return true;
  });

  const masteredCount = mistakes.filter((m) => m.masteryLevel === "mastered").length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Хувийн Алдааны Дэвтэр & Бататгал</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Алдааны Дэвтэр & Smart Рефлекс
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Тестүүд дээр буруу хариулсан бүх асуултууд энд автоматаар бүртгэгдэнэ. Та алдсан асуултуудаараа дахин сорилт хийж, алдаагаа бүрэн засаарай.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {filteredMistakes.length > 0 && (
              <button
                id="btn-retest-mistakes"
                onClick={() => onStartRetest(filteredMistakes)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Алдаануудаараа Сорилт Өгөх ({filteredMistakes.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Нийт алдсан асуулт</div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">{mistakes.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">Бүх шалгалтуудаас</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Бүрэн эзэмшсэн</div>
            <div className="text-2xl font-extrabold text-emerald-300 mt-1">{masteredCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">Давтан зөв хариулсан</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Сэргээх шаардлагатай</div>
            <div className="text-2xl font-extrabold text-rose-300 mt-1">
              {mistakes.length - masteredCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Бататгах хэрэгтэй сэдвүүд</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>Ангилал:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Бүх ангилал</option>
            <option value="Grammar">Grammar (Дүрэм)</option>
            <option value="Vocabulary">Vocabulary (Үгийн сан)</option>
            <option value="Communication">Communication (Харилцан яриа)</option>
            <option value="Reading">Reading (Эх уншиж ойлгох)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMastery("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterMastery === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Бүгд ({mistakes.length})
          </button>
          <button
            onClick={() => setFilterMastery("learning")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterMastery === "learning" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Суралцаж байгаа
          </button>
          <button
            onClick={() => setFilterMastery("mastered")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterMastery === "mastered" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Эзэмшсэн ({masteredCount})
          </button>
        </div>
      </div>

      {/* Mistake Items List */}
      {filteredMistakes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {mistakes.length === 0 ? "Алдааны дэвтэр одоогоор хоосон байна" : "Шүүлтүүрт тохирох алдаа олдсонгүй"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {mistakes.length === 0
              ? "Та одоогоор ямар нэгэн сорилд алдаа гаргаагүй байна. Шалгалт ажиллах үед буруу хариулсан бодит асуултууд Supabase датабаазад автоматаар хадгалагдаж энд харагдана."
              : "Сонгосон ангилал эсвэл түвшинд хамаарах алдаа олдсонгүй."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-amber-300 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {item.question?.category || "Grammar"}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Сэдэв: {item.question?.topic || "Ерөнхий дүрэм"}
                  </span>
                  {item.question?.subtopic && (
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      {item.question.subtopic}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-700">Алдааны давтамж:</span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    {item.mistakeCount || 1} удаа алдсан
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                {item.question?.text || "Асуулт"}
              </p>

              {/* Options */}
              {item.question?.options && item.question.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {item.question.options.map((opt) => {
                    const isCorrect = opt.id === item.question?.correctAnswer;
                    const isUserWrong = opt.id === (item.userLastAnswer || item.userAnswer) && !isCorrect;

                    let style = "border-slate-200 bg-slate-50 text-slate-700";
                    if (isCorrect) {
                      style = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                    } else if (isUserWrong) {
                      style = "border-rose-400 bg-rose-50 text-rose-950 line-through";
                    }

                    return (
                      <div key={opt.id} className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${style}`}>
                        <span className="font-bold">{opt.id}.</span>
                        <span>{opt.text}</span>
                        {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Smart Feedback */}
              <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 text-xs text-amber-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Smart Дүрмийн тайлбар & Засавч:</span>
                </div>
                <p className="leading-relaxed">
                  {item.smartFeedback || item.question.explanation || "ЭЕШ-ийн зөв хариулт ба дүрмийн тайлбар."}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onUpdateMastery(
                        item.id,
                        item.masteryLevel === "mastered" ? "learning" : "mastered"
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      item.masteryLevel === "mastered"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {item.masteryLevel === "mastered" ? "Эзэмшсэн гэж тэмдэглэсэн" : "Эзэмшсэн болгох"}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => onRemoveMistake(item.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Дэвтрээс хасах</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
