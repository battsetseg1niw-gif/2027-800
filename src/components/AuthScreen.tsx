import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setMessage("Supabase тохиргоо олдсонгүй. Vercel Environment Variables-ийг шалгана уу.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            email,
            name: name.trim() || email.split("@")[0],
            role,
            school: "",
            grade: "",
            is_premium: false,
            target_esh_score: 650,
          });
          if (profileError) throw profileError;
        }
        setMessage("Бүртгэл үүслээ. Имэйл баталгаажуулах тохиргоотой бол имэйлээ шалгана уу.");
      }
    } catch (err: any) {
      setMessage(err?.message || "Алдаа гарлаа.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-7">
        <div className="mb-6">
          <div className="text-2xl font-black text-blue-700">SmartESH</div>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            {mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">Англи хэлний ЭЕШ бэлтгэлийн платформ</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="Нэр"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRole("student")}
                  className={`py-2.5 rounded-xl text-sm font-bold border ${role === "student" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300"}`}>Сурагч</button>
                <button type="button" onClick={() => setRole("teacher")}
                  className={`py-2.5 rounded-xl text-sm font-bold border ${role === "teacher" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300"}`}>Багш</button>
              </div>
            </>
          )}
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Имэйл"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
          <input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Нууц үг"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm" />
          {message && <div className="text-xs p-3 rounded-xl bg-slate-100 text-slate-700">{message}</div>}
          <button disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 font-bold">
            {busy ? "Түр хүлээнэ үү..." : mode === "login" ? "Нэвтрэх" : "Бүртгэл үүсгэх"}
          </button>
        </form>
        <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}
          className="w-full mt-4 text-sm font-semibold text-blue-700">
          {mode === "login" ? "Шинэ хэрэглэгч үү? Бүртгүүлэх" : "Бүртгэлтэй юу? Нэвтрэх"}
        </button>
      </div>
    </div>
  );
}
