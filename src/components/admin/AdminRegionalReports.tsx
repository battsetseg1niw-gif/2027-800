import React, { useState, useMemo } from "react";
import {
  MapPin,
  Building2,
  Download,
  TrendingUp,
  Award,
  Users,
  Search,
  Filter,
  BarChart3,
  CheckCircle2,
  PieChart,
} from "lucide-react";
import { UserProfile, ExamSubmission } from "../../types";
import { MONGOLIAN_REGIONS } from "../../data/regionalData";

interface AdminRegionalReportsProps {
  users: UserProfile[];
  submissions: ExamSubmission[];
}

export const AdminRegionalReports: React.FC<AdminRegionalReportsProps> = ({ users, submissions }) => {
  const [activeSubTab, setActiveSubTab] = useState<"aimag" | "sum" | "school">("aimag");
  const [search, setSearch] = useState("");
  const [selectedAimag, setSelectedAimag] = useState<string>("all");

  const students = useMemo(() => users.filter((u) => u.role === "student"), [users]);

  // Regional breakdown by Aimag
  const aimagStats = useMemo(() => {
    return MONGOLIAN_REGIONS.map((region) => {
      const regionStudents = students.filter(
        (s) => s.aimag === region.aimag || (!s.aimag && region.aimag === "Улаанбаатар")
      );
      const studentIds = new Set(regionStudents.map((s) => s.id));
      const regionSubs = submissions.filter((sub) => studentIds.has(sub.userId));

      const totalExams = regionSubs.length;
      const avgScore =
        totalExams > 0 ? Math.round(regionSubs.reduce((a, b) => a + b.scaledScore, 0) / totalExams) : 0;
      const maxScore = totalExams > 0 ? Math.max(...regionSubs.map((s) => s.scaledScore)) : 0;

      // 4 skills averages
      let gC = 0, gT = 0, vC = 0, vT = 0, cC = 0, cT = 0, rC = 0, rT = 0;
      regionSubs.forEach((s) => {
        if (s.categoryScores?.Grammar) {
          gC += s.categoryScores.Grammar.correct;
          gT += s.categoryScores.Grammar.total;
        }
        if (s.categoryScores?.Vocabulary) {
          vC += s.categoryScores.Vocabulary.correct;
          vT += s.categoryScores.Vocabulary.total;
        }
        if (s.categoryScores?.Communication) {
          cC += s.categoryScores.Communication.correct;
          cT += s.categoryScores.Communication.total;
        }
        if (s.categoryScores?.Reading) {
          rC += s.categoryScores.Reading.correct;
          rT += s.categoryScores.Reading.total;
        }
      });

      return {
        aimag: region.aimag,
        studentCount: regionStudents.length,
        examsTaken: totalExams,
        avgScore,
        maxScore,
        grammarPct: gT > 0 ? Math.round((gC / gT) * 100) : 0,
        vocabPct: vT > 0 ? Math.round((vC / vT) * 100) : 0,
        commPct: cT > 0 ? Math.round((cC / cT) * 100) : 0,
        readingPct: rT > 0 ? Math.round((rC / rT) * 100) : 0,
      };
    }).sort((a, b) => b.studentCount - a.studentCount || b.avgScore - a.avgScore);
  }, [students, submissions]);

  // Breakdown by School
  const schoolStats = useMemo(() => {
    const map = new Map<
      string,
      {
        school: string;
        aimag: string;
        studentCount: number;
        examsTaken: number;
        avgScore: number;
        maxScore: number;
        premiumCount: number;
      }
    >();

    students.forEach((s) => {
      const sch = s.school || "Тодорхойгүй сургууль";
      if (!map.has(sch)) {
        map.set(sch, {
          school: sch,
          aimag: s.aimag || "Улаанбаатар",
          studentCount: 0,
          examsTaken: 0,
          avgScore: 0,
          maxScore: 0,
          premiumCount: 0,
        });
      }
      const entry = map.get(sch)!;
      entry.studentCount++;
      if (s.isPremium) entry.premiumCount++;
    });

    // Compute scores for schools
    map.forEach((entry, sch) => {
      const schoolStudents = new Set(students.filter((s) => (s.school || "Тодорхойгүй сургууль") === sch).map((s) => s.id));
      const schoolSubs = submissions.filter((sub) => schoolStudents.has(sub.userId));
      entry.examsTaken = schoolSubs.length;
      entry.avgScore =
        schoolSubs.length > 0 ? Math.round(schoolSubs.reduce((a, b) => a + b.scaledScore, 0) / schoolSubs.length) : 0;
      entry.maxScore = schoolSubs.length > 0 ? Math.max(...schoolSubs.map((s) => s.scaledScore)) : 0;
    });

    return Array.from(map.values()).sort((a, b) => b.studentCount - a.studentCount || b.avgScore - a.avgScore);
  }, [students, submissions]);

  // Sum breakdown
  const sumStats = useMemo(() => {
    const list: {
      aimag: string;
      sum: string;
      studentCount: number;
      examsTaken: number;
      avgScore: number;
    }[] = [];

    MONGOLIAN_REGIONS.forEach((r) => {
      r.sums.forEach((s) => {
        const sumStudents = students.filter(
          (u) => (u.aimag === r.aimag || (!u.aimag && r.aimag === "Улаанбаатар")) && u.sum === s
        );
        const sIds = new Set(sumStudents.map((u) => u.id));
        const sSubs = submissions.filter((sub) => sIds.has(sub.userId));
        const avg = sSubs.length > 0 ? Math.round(sSubs.reduce((a, b) => a + b.scaledScore, 0) / sSubs.length) : 0;

        if (sumStudents.length > 0 || sSubs.length > 0) {
          list.push({
            aimag: r.aimag,
            sum: s,
            studentCount: sumStudents.length,
            examsTaken: sSubs.length,
            avgScore: avg,
          });
        }
      });
    });

    return list.sort((a, b) => b.studentCount - a.studentCount || b.avgScore - a.avgScore);
  }, [students, submissions]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Аймаг/Хот",
      "Сургууль",
      "Сурагчийн тоо",
      "Гүйцэтгэсэн шалгалт",
      "Дундаж ЭЕШ оноо (800)",
      "Дээд оноо",
      "Premium сурагч",
    ];

    const rows = schoolStats.map((s) => [
      `"${s.aimag}"`,
      `"${s.school}"`,
      s.studentCount,
      s.examsTaken,
      s.avgScore,
      s.maxScore,
      s.premiumCount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SmartESH_Busiin_Tailan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Бүсийн тайлан & Аналитик</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Сурагчдын тоо, шалгалтын дундаж үзүүлэлтийг Аймаг / Сум / Сургуулиар ангилсан нэгдсэн тайлан
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Бүсийн тайлан татах (Excel / CSV)</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold text-slate-500 block">Хамрагдсан Аймаг / Хот</span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">
            {aimagStats.filter((a) => a.studentCount > 0).length} / 22
          </span>
          <span className="text-[10px] text-slate-400">Монгол улсын бүх бүс</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold text-slate-500 block">Холбогдсон Сургуулиуд</span>
          <span className="text-2xl font-black text-indigo-600 mt-0.5 block">{schoolStats.length}</span>
          <span className="text-[10px] text-slate-400">Ерөнхий боловсролын</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold text-slate-500 block">Тэргүүлэгч Бүс Нутаг</span>
          <span className="text-xl font-black text-emerald-600 mt-0.5 block truncate">
            {aimagStats.find((a) => a.studentCount > 0)?.aimag || "Бүртгэгдээгүй"}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">
            {aimagStats.find((a) => a.studentCount > 0)
              ? `Дундаж: ${aimagStats.find((a) => a.studentCount > 0)?.avgScore} оноо`
              : "Мэдээлэл гараагүй"}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold text-slate-500 block">Нийт хамрагдсан сурагчид</span>
          <span className="text-2xl font-black text-purple-600 mt-0.5 block">{students.length}</span>
          <span className="text-[10px] text-purple-700 font-semibold">{submissions.length} гүйцэтгэл</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab("aimag")}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === "aimag"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Аймгийн тайлан (21 Аймаг + Нийслэл)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("school")}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === "school"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Сургуулийн чансаа & үзүүлэлт ({schoolStats.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("sum")}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === "sum"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Сум / Дүүргийн задаргаа</span>
        </button>
      </div>

      {/* TAB 1: AIMAG BREAKDOWN */}
      {activeSubTab === "aimag" && (
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Аймаг / Хот</th>
                <th className="py-3 px-3">Сурагч</th>
                <th className="py-3 px-3">Шалгалт</th>
                <th className="py-3 px-3">Дундаж ЭЕШ (800)</th>
                <th className="py-3 px-3">Дээд оноо</th>
                <th className="py-3 px-3">4 чадварын гүйцэтгэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {aimagStats.map((item) => (
                <tr key={item.aimag} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{item.aimag}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-semibold">{item.studentCount} сурагч</td>
                  <td className="py-3 px-3 text-slate-600">{item.examsTaken} удаа</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-indigo-600 text-sm">{item.avgScore}</span>
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, (item.avgScore / 800) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-600">{item.maxScore || "—"}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Grammar: {item.grammarPct}%</span>
                      <span>Vocab: {item.vocabPct}%</span>
                      <span>Reading: {item.readingPct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: SCHOOL RANKINGS */}
      {activeSubTab === "school" && (
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center">#</th>
                <th className="py-3 px-4">Сургуулийн нэр</th>
                <th className="py-3 px-3">Аймаг</th>
                <th className="py-3 px-3">Сурагч</th>
                <th className="py-3 px-3">Шалгалт</th>
                <th className="py-3 px-3">Дундаж оноо</th>
                <th className="py-3 px-3">Дээд амжилт</th>
                <th className="py-3 px-3">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schoolStats.map((sch, idx) => (
                <tr key={sch.school} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{sch.school}</td>
                  <td className="py-3 px-3 text-slate-600">{sch.aimag}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{sch.studentCount}</td>
                  <td className="py-3 px-3 text-slate-600">{sch.examsTaken}</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-600">{sch.avgScore} / 800</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{sch.maxScore || "—"}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
                      {sch.premiumCount} PRO
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SUM / DISTRICT BREAKDOWN */}
      {activeSubTab === "sum" && (
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Аймаг</th>
                <th className="py-3 px-4">Сум / Дүүрэг</th>
                <th className="py-3 px-3">Сурагчийн тоо</th>
                <th className="py-3 px-3">Гүйцэтгэсэн шалгалт</th>
                <th className="py-3 px-3">Дундаж оноо</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sumStats.map((item, idx) => (
                <tr key={`${item.aimag}-${item.sum}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.aimag}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">{item.sum}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{item.studentCount}</td>
                  <td className="py-3 px-3 text-slate-600">{item.examsTaken}</td>
                  <td className="py-3 px-3 font-bold text-indigo-600">{item.avgScore} / 800</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
