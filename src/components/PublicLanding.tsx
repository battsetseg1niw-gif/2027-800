import React, { useState } from "react";
import { GraduationCap, BookOpen, Sparkles, BookmarkCheck, BrainCircuit, BarChart3, PlayCircle, LogIn, UserPlus } from "lucide-react";
import { AuthScreen } from "./AuthScreen";

export function PublicLanding() {
  const [authOpen, setAuthOpen] = useState(false);
  if (authOpen) return <AuthScreen />;

  const requireAccount = () => setAuthOpen(true);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center"><GraduationCap /></div>
            <div><div className="font-extrabold text-xl">Smart<span className="text-blue-600">ESH</span></div><div className="text-[10px] text-slate-500">Англи хэлний ЭЕШ бэлтгэл</div></div>
          </div>
          <div className="flex gap-2">
            <button onClick={requireAccount} className="px-4 py-2 text-sm font-bold text-blue-700 flex items-center gap-1"><LogIn className="w-4 h-4"/>Нэвтрэх</button>
            <button onClick={requireAccount} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center gap-1"><UserPlus className="w-4 h-4"/>Бүртгүүлэх</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-blue-800 to-blue-600 text-white p-7 sm:p-10 shadow-xl">
          <div className="text-xs font-bold opacity-80 mb-3">ЭЕШ 2006–2026 • MOCK • SMART PRACTICE</div>
          <h1 className="text-3xl sm:text-4xl font-black max-w-2xl">Англи хэлний ЭЕШ-д ухаалгаар бэлд.</h1>
          <p className="mt-3 max-w-2xl text-blue-100">Өмнөх оны шалгалт, түвшин тогтоох сорил, дасгал, алдааны дэвтэр болон AI Smart Feedback-ийг нэг дор ашиглаарай.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={requireAccount} className="bg-white text-blue-700 px-5 py-3 rounded-xl font-bold">Үнэгүй эхлэх</button>
            <button onClick={() => document.getElementById("features")?.scrollIntoView({behavior:"smooth"})} className="bg-blue-700/60 border border-blue-400 px-5 py-3 rounded-xl font-bold">Боломжуудтай танилцах</button>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ["Дундаж оноо","— / 800","Шалгалт өгсний дараа"],
            ["Зорилтот оноо","—","Өөрийн зорилгоо тохируулна"],
            ["Шалгалт өгсөн","0 удаа","Таны түүх энд харагдана"],
            ["Алдааны тэмдэглэл","0 асуулт","Алдаагаа автоматаар цуглуулна"],
          ].map(([a,b,c]) => <div key={a} className="bg-white rounded-2xl border border-slate-200 p-5"><div className="text-xs text-slate-500 font-bold">{a}</div><div className="text-2xl font-black mt-1">{b}</div><div className="text-xs text-slate-500 mt-1">{c}</div></div>)}
        </section>

        <section id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            [BookOpen,"ЭЕШ Сан 2006–2026","Өмнөх жилүүдийн бодит шалгалтын сан."],
            [Sparkles,"7 хоногийн Mock","Шалгалтын орчинд тогтмол сорьж ахицаа харна."],
            [PlayCircle,"Дасгал даалгавар","Grammar, Vocabulary, Communication, Reading-аар давтана."],
            [BookmarkCheck,"Алдааны дэвтэр","Алдсан асуултаа дахин давтаж сул сэдвээ нөхнө."],
            [BrainCircuit,"AI Smart Feedback","Гүйцэтгэл дээр тулгуурласан тайлбар, зөвлөмж авна."],
            [BarChart3,"Ахиц ба шинжилгээ","Оноо, сэдэв, ахицын мэдээллээ нэг дор харна."],
          ].map(([Icon,title,desc]: any) => <button key={title} onClick={requireAccount} className="text-left bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow"><Icon className="w-7 h-7 text-blue-600"/><div className="font-extrabold mt-4">{title}</div><div className="text-sm text-slate-600 mt-1">{desc}</div><div className="text-xs font-bold text-blue-600 mt-4">Нээж үзэх →</div></button>)}
        </section>

        <section className="rounded-3xl bg-white border border-slate-200 p-7 text-center">
          <h2 className="text-2xl font-black">Өөрийн SmartESH dashboard-аа үүсгээрэй</h2>
          <p className="text-slate-600 mt-2">Бүртгүүлсний дараа таны оноо, шалгалтын түүх, алдаа болон ахиц зөвхөн таны бүртгэлд хадгалагдана.</p>
          <button onClick={requireAccount} className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Бүртгүүлэх</button>
        </section>
      </main>
    </div>
  );
}
