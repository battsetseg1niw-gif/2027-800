import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  GraduationCap,
  UserCheck,
  Building,
  School,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Role } from "../types";
import {
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignInWithGoogle,
  isSupabaseConfigured,
} from "../lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: "signin" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "signin",
}) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("12-р анги");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error(
          "Supabase систем хараахан тохируулагдаагүй байна. .env файлын тохиргоог шалгана уу."
        );
      }

      if (mode === "signin") {
        if (!email.trim() || !password) {
          throw new Error("Цахим шуудан болон нууц үгээ бүрэн оруулна уу.");
        }
        const res = await supabaseSignIn(email, password);
        if (res.user) {
          setSuccessMsg("Амжилттай нэвтэрлээ!");
          setTimeout(() => {
            onSuccess(res.user);
            onClose();
          }, 600);
        }
      } else {
        if (!name.trim()) throw new Error("Та өөрийн бүтэн нэрийг оруулна уу.");
        if (!email.trim()) throw new Error("Цахим шуудангийн хаягаа оруулна уу.");
        if (password.length < 6)
          throw new Error("Нууц үг хамгийн багадаа 6 тэмдэгттэй байх ёстой.");

        const res = await supabaseSignUp({
          email,
          password,
          name,
          role,
          school,
          grade,
        });

        if (res.user) {
          setSuccessMsg("Бүртгэл амжилттай үүслээ! Та системд нэвтэрч байна...");
          setTimeout(() => {
            onSuccess(res.user);
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = err.message || "Үйлдэл амжилтгүй боллоо. Дахин оролдоно уу.";
      if (msg.includes("Invalid login credentials")) {
        msg = "Имэйл эсвэл нууц үг буруу байна.";
      } else if (msg.includes("User already registered")) {
        msg = "Энэ имэйл хаягаар хэрэглэгч бүртгэгдсэн байна. Нэвтрэх хэсгээр орно уу.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await supabaseSignInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || "Google нэвтрэлт амжилтгүй боллоо.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Хаах"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">SmartESH</h3>
              <p className="text-xs text-blue-100 font-medium">
                Англи хэлний ЭЕШ Бэлтгэлийн Нэгдсэн Платформ
              </p>
            </div>
          </div>
          <div className="mt-4 flex bg-black/20 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Нэвтрэх
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Шинээр бүртгүүлэх
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Овог нэр
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Жишээ: Болд Э."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Цахим шуудан (И-мэйл)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="таны-хаяг@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Нууц үг
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {mode === "signup" && (
            <>
              {/* Role Selector for Real User Account */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Таны үүрэг (Role)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      role === "student"
                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">ЭЕШ Сурагч</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                        Тест ажиллах
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("teacher")}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      role === "teacher"
                        ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">Багш</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                        Анги удирдлага
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* School and Grade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Сургууль
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Жишээ: 1-р сургууль"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Анги / Түвшин
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="12-р анги"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === "signin"
                    ? "Supabase-ээр Нэвтрэх"
                    : "Бүртгэл Үүсгэж Нэвтрэх"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">
                Эсвэл
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2.5 transition-all shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google хаягаар нэвтрэх</span>
          </button>

          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
            Та нэвтэрснээр систем таны даалгаврын оноо, алдааны дэвтэр, ахиц
            дэвшлийг Supabase дээр найдвартай хадгална.
          </p>
        </form>
      </div>
    </div>
  );
};
