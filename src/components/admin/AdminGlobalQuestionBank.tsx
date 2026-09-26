import React, { useState, useMemo } from "react";
import {
  Database,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  CheckSquare,
  Square,
  Eye,
  Calendar,
  Clock,
} from "lucide-react";
import { Question, Exam, QuestionCategory } from "../../types";

interface AdminGlobalQuestionBankProps {
  questions: Question[];
  exams: Exam[];
  onDeleteQuestion?: (questionId: string) => Promise<boolean> | void;
  onUpdateQuestion?: (question: Question) => Promise<boolean> | void;
  onCreateOfficialMockExam?: (exam: Exam) => Promise<boolean> | void;
}

export const AdminGlobalQuestionBank: React.FC<AdminGlobalQuestionBankProps> = ({
  questions,
  exams,
  onDeleteQuestion,
  onUpdateQuestion,
  onCreateOfficialMockExam,
}) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Edit question modal state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState<QuestionCategory>("Grammar");
  const [editTopic, setEditTopic] = useState("");
  const [editCorrectAnswer, setEditCorrectAnswer] = useState<"A" | "B" | "C" | "D" | "E">("A");
  const [editExplanation, setEditExplanation] = useState("");
  const [editOptions, setEditOptions] = useState<{ id: "A" | "B" | "C" | "D" | "E"; text: string }[]>([]);
  const [editDifficulty, setEditDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Create official mock exam modal state
  const [showCreateMockModal, setShowCreateMockModal] = useState(false);
  const [mockTitle, setMockTitle] = useState("2026 оны ЭЕШ Улсын Нэгдсэн Жишиг Шалгалт #1");
  const [mockDuration, setMockDuration] = useState(80);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combine standalone questions with questions inside all exams
  const allBankQuestions = useMemo(() => {
    const list: Question[] = [...questions];
    const seen = new Set(list.map((q) => q.id));

    exams.forEach((ex) => {
      (ex.questions || []).forEach((q) => {
        if (!seen.has(q.id)) {
          seen.add(q.id);
          list.push(q);
        }
      });
    });

    return list;
  }, [questions, exams]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return allBankQuestions.filter((q) => {
      if (categoryFilter !== "all" && q.category !== categoryFilter) return false;
      if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchText = q.text?.toLowerCase().includes(query);
        const matchTopic = q.topic?.toLowerCase().includes(query);
        const matchExpl = q.explanation?.toLowerCase().includes(query);
        if (!matchText && !matchTopic && !matchExpl) return false;
      }
      return true;
    });
  }, [allBankQuestions, categoryFilter, difficultyFilter, search]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectFifty = () => {
    const sampleFifty = filteredQuestions.slice(0, 50).map((q) => q.id);
    setSelectedIds(new Set(sampleFifty));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setEditText(q.text || "");
    setEditCategory(q.category || "Grammar");
    setEditTopic(q.topic || "General");
    setEditCorrectAnswer((q.correctAnswer as any) || "A");
    setEditExplanation(q.explanation || "");
    setEditDifficulty(q.difficulty || "Medium");
    setEditOptions(
      q.options && q.options.length > 0
        ? q.options.map((opt) => ({ id: opt.id as any, text: opt.text }))
        : [
            { id: "A", text: "Сонголт A" },
            { id: "B", text: "Сонголт B" },
            { id: "C", text: "Сонголт C" },
            { id: "D", text: "Сонголт D" },
          ]
    );
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion || !onUpdateQuestion) return;
    const updated: Question = {
      ...editingQuestion,
      text: editText.trim(),
      category: editCategory,
      topic: editTopic.trim() || "General",
      correctAnswer: editCorrectAnswer,
      explanation: editExplanation.trim(),
      difficulty: editDifficulty,
      options: editOptions,
    };
    await onUpdateQuestion(updated);
    setEditingQuestion(null);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Энэ асуултыг асуултын сангаас бүрмөсөн устгах уу?")) return;
    if (onDeleteQuestion) {
      await onDeleteQuestion(questionId);
    }
  };

  const handleCreateMockExamSubmit = async () => {
    if (!onCreateOfficialMockExam) return;
    const selectedQuestions = allBankQuestions.filter((q) => selectedIds.has(q.id));
    if (selectedQuestions.length === 0) {
      alert("Шалгалт үүсгэхийн тулд ядаж 1 асуулт сонгоно уу!");
      return;
    }

    setIsSubmitting(true);
    try {
      const newExam: Exam = {
        id: `mock-official-2026-${Date.now()}`,
        title: mockTitle.trim(),
        year: 2026,
        variant: "Mock",
        type: "mock",
        totalQuestions: selectedQuestions.length,
        durationMinutes: mockDuration,
        questions: selectedQuestions.map((q, idx) => ({ ...q, questionNumber: idx + 1 })),
        status: "published",
        createdBy: "admin",
        createdByName: "SmartESH Админ Зөвлөл",
        createdAt: new Date().toISOString().slice(0, 10),
      };

      await onCreateOfficialMockExam(newExam);
      setShowCreateMockModal(false);
      setSelectedIds(new Set());
      alert(`"${newExam.title}" албан ёсны Жишиг Шалгалт нийтлэгдэж, бүх сурагчдад нээлттэй боллоо!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Асуултын нэгдсэн сан</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Багш нарын оруулсан, PDF-ээс задалсан болон 2006–2026 архивын нийт {allBankQuestions.length} асуултын сан
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowCreateMockModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              <span>Жишиг Шалгалт Үүсгэх ({selectedIds.size})</span>
            </button>
          )}

          <button
            onClick={handleSelectFifty}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            50 асуулт сонгох
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={handleClearSelection}
              className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold"
            >
              Цэвэрлэх
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Асуултын текст, сэдвээр хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
        >
          <option value="all">Бүх бүлэг (4 чадвар)</option>
          <option value="Grammar">Grammar (Хэлзүй)</option>
          <option value="Vocabulary">Vocabulary (Үгийн сан)</option>
          <option value="Communication">Communication (Харилцан яриа)</option>
          <option value="Reading">Reading (Эх уншиж ойлгох)</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
        >
          <option value="all">Бүх түвшин (Difficulty)</option>
          <option value="Easy">Easy (Хялбар - A2)</option>
          <option value="Medium">Medium (Дундаж - B1)</option>
          <option value="Hard">Hard (Ахисан - B2)</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            Асуулт олдсонгүй. Шүүлтүүрийг шалгана уу.
          </div>
        ) : (
          filteredQuestions.slice(0, 100).map((q, idx) => {
            const isSelected = selectedIds.has(q.id);
            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "border-purple-500 bg-purple-50/40 ring-1 ring-purple-300"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleSelect(q.id)}
                      className="mt-0.5 text-slate-400 hover:text-purple-600 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-purple-600 fill-purple-100" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="font-bold text-xs text-slate-900">#{idx + 1}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                          {q.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          Сэдэв: {q.topic}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Зөв: {q.correctAnswer}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">{q.text}</p>

                      {/* Options */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        {q.options?.map((opt) => (
                          <div
                            key={opt.id}
                            className={`p-1.5 px-2.5 rounded-lg text-xs border ${
                              opt.id === q.correctAnswer
                                ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}
                          >
                            <span className="font-bold mr-1">{opt.id}.</span> {opt.text}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                          <span className="font-bold text-slate-700">Тайлбар: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors"
                      title="Асуулт засах"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors"
                      title="Устгах"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Асуулт засах</h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Асуултын текст</label>
                <textarea
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Бүлэг</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  >
                    <option value="Grammar">Grammar</option>
                    <option value="Vocabulary">Vocabulary</option>
                    <option value="Communication">Communication</option>
                    <option value="Reading">Reading</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Сэдэв</label>
                  <input
                    type="text"
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Хариултын сонголтууд</label>
                <div className="space-y-1.5">
                  {editOptions.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="font-bold w-4 text-center">{opt.id}</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditOptions((prev) =>
                            prev.map((o, i) => (i === idx ? { ...o, text: val } : o))
                          );
                        }}
                        className="flex-1 p-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={editCorrectAnswer === opt.id}
                        onChange={() => setEditCorrectAnswer(opt.id)}
                        title="Зөв хариултаар тохируулах"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Монгол тайлбар</label>
                <textarea
                  rows={2}
                  value={editExplanation}
                  onChange={(e) => setEditExplanation(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
              >
                Болих
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Official Mock Exam Modal */}
      {showCreateMockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>ЭЕШ Албан ёсны Жишиг Шалгалт үүсгэх</span>
              </h3>
              <button onClick={() => setShowCreateMockModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Сонгосон {selectedIds.size} асуултаар улсын хэмжээний албан ёсны Жишиг Шалгалт үүсгэж, бүх сурагчдад
              нээлттэй болгоно.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Шалгалтын нэр</label>
                <input
                  type="text"
                  value={mockTitle}
                  onChange={(e) => setMockTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Хугацаа (минут)</label>
                <input
                  type="number"
                  value={mockDuration}
                  onChange={(e) => setMockDuration(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px] leading-relaxed">
                ✅ Энэхүү шалгалт нийтлэгдмэгц бүх сурагчдын самбарт <strong>"ЭЕШ Жишиг Шалгалт"</strong> хэсэгт автоматаар гарч ирэх бөгөөд бүх хэрэглэгчдэд мэдэгдэл илгээгдэнэ.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowCreateMockModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
              >
                Болих
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleCreateMockExamSubmit}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? "Үүсгэж байна..." : "Нийтлэх (Publish)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
