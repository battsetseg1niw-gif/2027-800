import React from "react";
import { GraduationCap, ArrowLeft, BookOpen, Sparkles, PlayCircle, BookmarkCheck, BrainCircuit, BarChart3, Users, ScanLine } from "lucide-react";

type Props={section:string; onBack:()=>void; onAuth:()=>void};
const data:any={
 archive:{title:"ЭЕШ Сан 2006–2026",desc:"Өмнөх жилүүдийн Англи хэлний ЭЕШ материалтай танилцаж, систем хэрхэн ажиллахыг хараарай.",items:["2006–2026 оны шалгалтын архив","Он, хувилбараар ангилсан сан","Хариулт ба гүйцэтгэлийн шинжилгээ"],Icon:BookOpen},
 mock:{title:"7 хоногийн Mock",desc:"Бодит шалгалтын орчинд тогтмол сорьж, ахицаа хэмжих хэсэг.",items:["Хугацаатай Mock шалгалт","Автомат оноо","Сэдэв тус бүрийн гүйцэтгэл"],Icon:Sparkles},
 practice:{title:"Дасгал даалгавар",desc:"ЭЕШ-ийн үндсэн чадваруудаар сэдэвчилсэн дасгал ажиллана.",items:["Grammar","Vocabulary","Communication","Reading"],Icon:PlayCircle},
 mistakes:{title:"Алдааны дэвтэр",desc:"Алдсан асуултууд автоматаар цугларч, дахин давтах боломжтой.",items:["Сул сэдвээ харах","Алдсан асуултаа дахин хийх","Ахицын өөрчлөлтөө хянах"],Icon:BookmarkCheck},
 learning:{title:"Learning Center",desc:"Дүрэм, үгийн сан, тайлбар болон Smart Practice-аар давтана.",items:["Дүрмийн тайлбар","Үгийн сан","Smart Practice"],Icon:GraduationCap},
 ai:{title:"AI Smart Feedback",desc:"Шалгалтын гүйцэтгэл дээр үндэслэсэн тайлбар, давтах зөвлөмж.",items:["Сул сэдвийн шинжилгээ","Хувийн давтлагын зөвлөмж","Дараагийн алхам"],Icon:BrainCircuit},
 teacher:{title:"Багшид зориулсан боломж",desc:"Анги, даалгавар, шалгалт болон сурагчдын ахицыг нэг дор удирдана.",items:["Анги үүсгэх ба сурагч холбох","Тест, даалгавар өгөх","OMR хуудас ба сканнер","Ангийн analytics"],Icon:Users},
 pricing:{title:"Эрхийн нөхцөл",desc:"SmartESH-ийн ашиглах эрх болон боломжуудын мэдээлэл.",items:["Нийтийн танилцуулга хэсгийг бүртгэлгүй үзнэ","Бүртгүүлээд хувийн dashboard үүсгэнэ","Эрх идэвхжүүлэх нөхцөлийг бүртгэлээсээ харна"],Icon:BarChart3}
};
export function PublicExplore({section,onBack,onAuth}:Props){
 const d=data[section]||data.practice; const Icon=d.Icon;
 return <div className="min-h-screen bg-slate-50">
  <header className="bg-white border-b"><div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between"><button onClick={onBack} className="font-bold text-slate-700 flex gap-2 items-center"><ArrowLeft className="w-4 h-4"/>Нүүр</button><div className="font-extrabold text-xl">Smart<span className="text-blue-600">ESH</span></div><button onClick={onAuth} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Нэвтрэх / Бүртгүүлэх</button></div></header>
  <main className="max-w-5xl mx-auto p-5 sm:p-8">
   <section className="bg-white border rounded-3xl p-7 sm:p-10"><Icon className="w-10 h-10 text-blue-600"/><h1 className="text-3xl font-black mt-4">{d.title}</h1><p className="text-slate-600 mt-3 max-w-2xl">{d.desc}</p>
    <div className="grid sm:grid-cols-2 gap-3 mt-7">{d.items.map((x:string)=><div key={x} className="border rounded-2xl p-5 font-bold bg-slate-50">{x}</div>)}</div>
    <div className="mt-8 p-5 rounded-2xl bg-blue-50 border border-blue-100"><div className="font-extrabold">Танилцах горим</div><p className="text-sm text-slate-600 mt-1">Энэ мэдээллийг бүртгэлгүй үзэж болно. Шалгалт ажиллах, үр дүн хадгалах болон хувийн шинжилгээ авах үед бүртгэл шаардлагатай.</p></div>
   </section>
  </main>
 </div>
}