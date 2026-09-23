import React, { useState } from "react";
import {
  Award,
  TrendingUp,
  Flame,
  CheckCircle2,
  Sparkles,
  Calendar,
  ChevronRight,
  Star,
  Users,
  Target,
  Trophy,
} from "lucide-react";
import { WeeklyTopStudent, UserProfile } from "../types";
import { db } from "../lib/supabase";

interface WeeklyTopStudentsWidgetProps {
  currentUser?: UserProfile;
}

export const WeeklyTopStudentsWidget: React.FC<WeeklyTopStudentsWidgetProps> = ({ currentUser }) => {
  const [topStudents, setTopStudents] = useState<WeeklyTopStudent[]>(() => db.getWeeklyTopStudents());
  const [selectedStudent, setSelectedStudent] = useState<WeeklyTopStudent | null>(null);

  const topThree = topStudents.slice(0, 3);
  const others = topStudents.slice(3);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                7 Хоногийн Шилдэг & Идэвхтэй Өсөлттэй Сурагчид
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Weekly Leaderboard
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5">
              Хамгийн өндөр онооны ахиц гаргасан ба хамгийн олон сорилт гүйцэтгэсэн сурагчдын жагсаалт
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Шинэчлэгдсэн: Энэ 7 хоног</span>
        </div>
      </div>

      {/* TOP 3 PODIUM CARDS OR EMPTY STATE */}
      {topStudents.length === 0 ? (
        <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-slate-100 space-y-2">
          <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">Одоогоор 7 хоногийн шилдэг өсөлттэй сурагчдын мэдээлэл гараагүй байна</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Сурагчид ЭЕШ сорилт гүйцэтгэж, онооны ахиц гаргаснаар энэхүү самбарт бодит оноогоороо жагсана.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {topThree.map((st, idx) => {
            const podiumStyles = [
              {
                border: "border-amber-300 bg-gradient-to-b from-amber-50/60 to-white",
                badge: "bg-amber-100 text-amber-900 border-amber-300",
                rank: "🥇 1-р байр",
                accent: "text-amber-600",
              },
              {
                border: "border-slate-300 bg-gradient-to-b from-slate-50 to-white",
                badge: "bg-slate-200 text-slate-800 border-slate-300",
                rank: "🥈 2-р байр",
                accent: "text-blue-600",
              },
              {
                border: "border-amber-200 bg-gradient-to-b from-orange-50/40 to-white",
                badge: "bg-orange-100 text-orange-900 border-orange-200",
                rank: "🥉 3-р байр",
                accent: "text-orange-600",
              },
            ][idx] || {
              border: "border-slate-200 bg-white",
              badge: "bg-slate-100 text-slate-700",
              rank: `#${idx + 1}`,
              accent: "text-slate-900",
            };

            return (
              <div
                key={st.id}
                className={`rounded-2xl p-5 border-2 ${podiumStyles.border} shadow-xs relative flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${podiumStyles.badge}`}>
                    {podiumStyles.rank}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{st.scoreGain} оноо</span>
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{st.name}</h4>
                  <p className="text-xs text-slate-700">{st.school} • {st.grade}</p>
                  <div className="mt-2 text-[11px] font-bold text-indigo-700 bg-indigo-50/70 px-2.5 py-1 rounded-lg border border-indigo-100">
                    {st.highlightTag}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-700 block font-medium">Оноо</span>
                    <span className="text-sm font-black text-slate-900">{st.currentScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-700 block font-medium">Сорилтууд</span>
                    <span className="text-sm font-black text-slate-900">{st.testsCompletedThisWeek} тест</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-700 block font-medium">Нарийвчлал</span>
                    <span className="text-sm font-black text-emerald-600">{st.accuracyRate}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OTHER NOTABLE MOVERS & ACTIVE RUNNERS */}
      {others.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Бусад өндөр идэвхтэй сурагчид
          </h4>
          <div className="space-y-2">
            {others.map((st, i) => (
              <div
                key={st.id}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center">
                    {i + 4}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{st.name}</span>
                      <span className="text-xs text-slate-700">({st.school})</span>
                    </div>
                    <span className="text-[11px] text-indigo-600 font-semibold">
                      {st.highlightTag}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 font-bold text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{st.scoreGain} оноо</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    <span>{st.testsCompletedThisWeek} тест өгсөн</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{st.streakDays} өдөр</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOTIVATIONAL BANNER */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-950 font-medium leading-relaxed">
            Та ч бас өдөр бүр сорил ажиллаж, <strong>Алдааны дэвтрээ</strong> зассанаар энэ 7 хоногийн шилдэг өсөлттэй сурагчдын самбарт гарах боломжтой!
          </p>
        </div>
      </div>
    </div>
  );
};
