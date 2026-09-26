import React, { useState, useMemo } from "react";
import { Users, Search, Filter, Edit, Check, Shield, UserCheck, GraduationCap, Sparkles, Building2, MapPin } from "lucide-react";
import { UserProfile, Role } from "../../types";
import { MONGOLIAN_REGIONS } from "../../data/regionalData";

interface AdminUserManagementProps {
  users: UserProfile[];
  onToggleUserPremium: (userId: string) => void;
  onUpdateUserProfile: (userId: string, updates: Partial<UserProfile>) => Promise<boolean> | void;
  onViewUserProgress: (user: UserProfile) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  users,
  onToggleUserPremium,
  onUpdateUserProfile,
  onViewUserProgress,
}) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [aimagFilter, setAimagFilter] = useState<string>("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");

  // Edit user modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<Role>("student");
  const [editSchool, setEditSchool] = useState("");
  const [editAimag, setEditAimag] = useState("Улаанбаатар");
  const [editSum, setEditSum] = useState("Сүхбаатар");
  const [editGrade, setEditGrade] = useState("12-р анги");
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic school list
  const allSchools = useMemo(() => {
    const list = Array.from(new Set(users.map((u) => u.school).filter(Boolean))) as string[];
    return list.sort();
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (aimagFilter !== "all" && u.aimag !== aimagFilter) return false;
      if (schoolFilter !== "all" && u.school !== schoolFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchSchool = u.school?.toLowerCase().includes(q);
        const matchAimag = u.aimag?.toLowerCase().includes(q);
        const matchCode = u.studentCode?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchSchool && !matchAimag && !matchCode) return false;
      }
      return true;
    });
  }, [users, roleFilter, aimagFilter, schoolFilter, search]);

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditSchool(user.school || "");
    setEditAimag(user.aimag || "Улаанбаатар");
    setEditSum(user.sum || "Сүхбаатар");
    setEditGrade(user.grade || "12-р анги");
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await onUpdateUserProfile(editingUser.id, {
        role: editRole,
        school: editSchool.trim(),
        aimag: editAimag,
        sum: editSum,
        grade: editGrade.trim(),
      });
      setEditingUser(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickRoleChange = async (userId: string, newRole: Role) => {
    await onUpdateUserProfile(userId, { role: newRole });
  };

  const currentSums = useMemo(() => {
    const r = MONGOLIAN_REGIONS.find((reg) => reg.aimag === editAimag);
    return r ? r.sums : ["Төв"];
  }, [editAimag]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Хэрэглэгчийн удирдлага</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Нийт {users.length} хэрэглэгчийн эрх солих, аймаг, сургуулийн мэдээлэл шинэчлэх, премиум тохируулах
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
            {users.filter((u) => u.role === "student").length} Сурагч
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
            {users.filter((u) => u.role === "teacher").length} Багш
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700">
            {users.filter((u) => u.role === "admin").length} Админ
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Нэр, и-мэйл, сургууль, кодоор хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
        >
          <option value="all">Бүх эрх (Хэрэглэгч)</option>
          <option value="student">🎓 Сурагч</option>
          <option value="teacher">👨‍🏫 Багш</option>
          <option value="admin">🛡️ Админ</option>
        </select>

        <select
          value={aimagFilter}
          onChange={(e) => setAimagFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
        >
          <option value="all">Бүх Аймаг / Хот</option>
          {MONGOLIAN_REGIONS.map((r) => (
            <option key={r.aimag} value={r.aimag}>
              {r.aimag}
            </option>
          ))}
        </select>

        <select
          value={schoolFilter}
          onChange={(e) => setSchoolFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
        >
          <option value="all">Бүх Сургууль</option>
          {allSchools.map((sch) => (
            <option key={sch} value={sch}>
              {sch}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Хэрэглэгч</th>
              <th className="py-3 px-3">Эрх (Role)</th>
              <th className="py-3 px-3">Бүс нутаг / Аймаг</th>
              <th className="py-3 px-3">Сургууль, Анги</th>
              <th className="py-3 px-3">Статус</th>
              <th className="py-3 px-3 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Хайлтын шалгуурт тохирох хэрэглэгч олдсонгүй.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{u.name}</span>
                      {u.studentCode && (
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 rounded">
                          #{u.studentCode}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal">{u.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleQuickRoleChange(u.id, e.target.value as Role)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none transition-colors ${
                        u.role === "admin"
                          ? "bg-purple-50 text-purple-800 border-purple-200"
                          : u.role === "teacher"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-blue-50 text-blue-800 border-blue-200"
                      }`}
                    >
                      <option value="student">🎓 Сурагч</option>
                      <option value="teacher">👨‍🏫 Багш</option>
                      <option value="admin">🛡️ Админ</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-medium">{u.aimag || "Тодорхойгүй"}</div>
                    <div className="text-[10px] text-slate-400">{u.sum || "Сум/Дүүрэг байхгүй"}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-medium truncate max-w-[170px]">{u.school || "—"}</div>
                    <div className="text-[10px] text-slate-400">{u.grade || "Анги байхгүй"}</div>
                  </td>
                  <td className="py-3 px-3">
                    {u.isPremium ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                        <Sparkles className="w-3 h-3 text-amber-600" /> Premium
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        Үнэгүй
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-300 transition-colors"
                        title="Мэдээлэл засах"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onViewUserProgress(u)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                      >
                        Явц
                      </button>
                      <button
                        onClick={() => onToggleUserPremium(u.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          u.isPremium
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                        }`}
                      >
                        {u.isPremium ? "Эрх хасах" : "PRO өгөх"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit className="w-4 h-4 text-purple-600" />
                <span>Хэрэглэгчийн мэдээлэл шинэчлэх</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Хэрэглэгчийн нэр & И-мэйл</label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold">
                  {editingUser.name} ({editingUser.email})
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Системийн эрх (Role)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["student", "teacher", "admin"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditRole(r)}
                      className={`p-2 rounded-xl border text-center font-bold capitalize transition-all ${
                        editRole === r
                          ? "border-purple-600 bg-purple-50 text-purple-800 ring-2 ring-purple-400/30"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {r === "student" ? "🎓 Сурагч" : r === "teacher" ? "👨‍🏫 Багш" : "🛡️ Админ"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Аймаг / Хот</label>
                  <select
                    value={editAimag}
                    onChange={(e) => {
                      setEditAimag(e.target.value);
                      const reg = MONGOLIAN_REGIONS.find((r) => r.aimag === e.target.value);
                      if (reg && reg.sums.length > 0) setEditSum(reg.sums[0]);
                    }}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  >
                    {MONGOLIAN_REGIONS.map((r) => (
                      <option key={r.aimag} value={r.aimag}>
                        {r.aimag}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Сум / Дүүрэг</label>
                  <select
                    value={editSum}
                    onChange={(e) => setEditSum(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  >
                    {currentSums.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Сургуулийн нэр</label>
                <input
                  type="text"
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  placeholder="ж нь: Улаанбаатар 1-р сургууль"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Анги / Түвшин</label>
                <input
                  type="text"
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  placeholder="ж нь: 12-р анги, Ахлах багш"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
              >
                Болих
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSaving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
