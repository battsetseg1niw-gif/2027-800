// Curated standard diagrams and charts for English ESH Matriculation Exams
// These SVG Data URLs render crisply, load instantly, and work 100% offline.

export interface DiagramPreset {
  id: string;
  title: string;
  category: "Grammar" | "Vocabulary" | "Communication" | "Reading";
  description: string;
  dataUrl: string;
}

export const EXAM_DIAGRAM_PRESETS: DiagramPreset[] = [
  {
    id: "preset-tenses-timeline",
    title: "Цагуудын дарааллын шулуун (Tense Sequence Timeline)",
    category: "Grammar",
    description: "Past Perfect, Past Simple, Present Simple болон Future цагуудын логик дараалал",
    dataUrl:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 240" width="100%" height="100%">
  <rect width="700" height="240" fill="#f8fafc" rx="16" stroke="#cbd5e1" stroke-width="2"/>
  <text x="350" y="36" font-family="sans-serif" font-size="16" font-weight="900" fill="#0f172a" text-anchor="middle">ENGLISH VERB TENSE TIMELINE (ЦАГУУДЫН ДАРААЛАЛ)</text>
  
  <!-- Main Axis Line -->
  <line x1="60" y1="120" x2="640" y2="120" stroke="#1e3a8a" stroke-width="4" stroke-linecap="round"/>
  <polygon points="640,113 656,120 640,127" fill="#1e3a8a"/>

  <!-- Past Perfect Event -->
  <circle cx="140" cy="120" r="10" fill="#7c3aed"/>
  <rect x="70" y="60" width="140" height="42" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="140" y="78" font-family="sans-serif" font-size="11" font-weight="900" fill="#6d28d9" text-anchor="middle">1. PAST PERFECT</text>
  <text x="140" y="93" font-family="sans-serif" font-size="9" font-weight="600" fill="#5b21b6" text-anchor="middle">had + V3 (finished)</text>
  <line x1="140" y1="102" x2="140" y2="120" stroke="#7c3aed" stroke-width="2" stroke-dasharray="3,3"/>

  <!-- Past Simple Event -->
  <circle cx="280" cy="120" r="10" fill="#2563eb"/>
  <rect x="210" y="145" width="140" height="42" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="280" y="163" font-family="sans-serif" font-size="11" font-weight="900" fill="#1d4ed8" text-anchor="middle">2. PAST SIMPLE</text>
  <text x="280" y="178" font-family="sans-serif" font-size="9" font-weight="600" fill="#1e40af" text-anchor="middle">V2 (arrived / saw)</text>
  <line x1="280" y1="120" x2="280" y2="145" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3"/>

  <!-- NOW / PRESENT Marker -->
  <line x1="420" y1="80" x2="420" y2="160" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
  <rect x="375" y="55" width="90" height="26" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="420" y="72" font-family="sans-serif" font-size="11" font-weight="900" fill="#b91c1c" text-anchor="middle">NOW (Одоо)</text>

  <!-- Future Simple / Continuous Event -->
  <circle cx="560" cy="120" r="10" fill="#059669"/>
  <rect x="490" y="145" width="140" height="42" rx="8" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
  <text x="560" y="163" font-family="sans-serif" font-size="11" font-weight="900" fill="#047857" text-anchor="middle">3. FUTURE SIMPLE</text>
  <text x="560" y="178" font-family="sans-serif" font-size="9" font-weight="600" fill="#065f46" text-anchor="middle">will + V1 (will pass)</text>
  <line x1="560" y1="120" x2="560" y2="145" stroke="#059669" stroke-width="2" stroke-dasharray="3,3"/>

  <!-- Rule summary banner at bottom -->
  <text x="350" y="215" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#475569" text-anchor="middle">Дүрэм: Өнгөрсөнд болсон 2 үйлдлийн эхэнд болсон нь Past Perfect, дараа нь болсон нь Past Simple байна.</text>
</svg>
`),
  },
  {
    id: "preset-prepositions-map",
    title: "Орон зайн угтвар үгсийн схем (Prepositions of Place)",
    category: "Vocabulary",
    description: "In, On, Under, Above, Next to, Between, Behind, In front of байрлалын зураглал",
    dataUrl:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 240" width="100%" height="100%">
  <rect width="700" height="240" fill="#f0fdf4" rx="16" stroke="#bbf7d0" stroke-width="2"/>
  <text x="350" y="32" font-family="sans-serif" font-size="15" font-weight="900" fill="#14532d" text-anchor="middle">PREPOSITIONS OF PLACE & DIRECTION (БАЙРЛАЛЫН УГТВАР ҮГС)</text>

  <!-- 1. IN -->
  <g transform="translate(60, 60)">
    <rect x="0" y="20" width="70" height="70" fill="#ffffff" stroke="#16a34a" stroke-width="2" rx="8"/>
    <circle cx="35" cy="55" r="14" fill="#15803d"/>
    <text x="35" y="110" font-family="sans-serif" font-size="12" font-weight="900" fill="#166534" text-anchor="middle">IN</text>
    <text x="35" y="125" font-family="sans-serif" font-size="9" fill="#15803d" text-anchor="middle">(дотор)</text>
  </g>

  <!-- 2. ON -->
  <g transform="translate(180, 60)">
    <rect x="0" y="45" width="70" height="45" fill="#ffffff" stroke="#16a34a" stroke-width="2" rx="4"/>
    <circle cx="35" cy="30" r="14" fill="#15803d"/>
    <text x="35" y="110" font-family="sans-serif" font-size="12" font-weight="900" fill="#166534" text-anchor="middle">ON</text>
    <text x="35" y="125" font-family="sans-serif" font-size="9" fill="#15803d" text-anchor="middle">(дээр)</text>
  </g>

  <!-- 3. UNDER -->
  <g transform="translate(300, 60)">
    <rect x="0" y="20" width="70" height="45" fill="#ffffff" stroke="#16a34a" stroke-width="2" rx="4"/>
    <circle cx="35" cy="80" r="14" fill="#15803d"/>
    <text x="35" y="110" font-family="sans-serif" font-size="12" font-weight="900" fill="#166534" text-anchor="middle">UNDER</text>
    <text x="35" y="125" font-family="sans-serif" font-size="9" fill="#15803d" text-anchor="middle">(доор)</text>
  </g>

  <!-- 4. BETWEEN -->
  <g transform="translate(420, 60)">
    <rect x="0" y="20" width="30" height="70" fill="#ffffff" stroke="#16a34a" stroke-width="2" rx="4"/>
    <circle cx="45" cy="55" r="12" fill="#dc2626"/>
    <rect x="60" y="20" width="30" height="70" fill="#ffffff" stroke="#16a34a" stroke-width="2" rx="4"/>
    <text x="45" y="110" font-family="sans-serif" font-size="12" font-weight="900" fill="#166534" text-anchor="middle">BETWEEN</text>
    <text x="45" y="125" font-family="sans-serif" font-size="9" fill="#15803d" text-anchor="middle">(хооронд)</text>
  </g>

  <!-- 5. IN FRONT OF / BEHIND -->
  <g transform="translate(550, 60)">
    <rect x="20" y="20" width="50" height="50" fill="#dcfce7" stroke="#16a34a" stroke-width="2" rx="6"/>
    <circle cx="20" cy="65" r="14" fill="#2563eb"/>
    <text x="45" y="110" font-family="sans-serif" font-size="12" font-weight="900" fill="#166534" text-anchor="middle">IN FRONT OF</text>
    <text x="45" y="125" font-family="sans-serif" font-size="9" fill="#15803d" text-anchor="middle">(урд талд)</text>
  </g>

  <!-- Bottom Hint -->
  <text x="350" y="220" font-family="sans-serif" font-size="11" font-weight="700" fill="#14532d" text-anchor="middle">Жишээ: The cat is hiding UNDER the table, while the book is ON the shelf.</text>
</svg>
`),
  },
  {
    id: "preset-reading-barchart",
    title: "Уншиж ойлгох дасгалын статистик диаграм (Reading Bar Chart)",
    category: "Reading",
    description: "Хэл суралцагчдын тоо ба түвшинг харьцуулсан өгөгдлийн график (Reading Comprehension)",
    dataUrl:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 250" width="100%" height="100%">
  <rect width="700" height="250" fill="#f8fafc" rx="16" stroke="#cbd5e1" stroke-width="2"/>
  <text x="350" y="30" font-family="sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="middle">CHART 1: ENGLISH PROFICIENCY TEST RESULTS BY SKILL (2020-2025)</text>

  <!-- Y-Axis -->
  <line x1="80" y1="50" x2="80" y2="190" stroke="#64748b" stroke-width="1.5"/>
  <text x="68" y="55" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b" text-anchor="end">100%</text>
  <text x="68" y="90" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b" text-anchor="end">75%</text>
  <text x="68" y="125" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b" text-anchor="end">50%</text>
  <text x="68" y="160" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b" text-anchor="end">25%</text>
  <text x="68" y="195" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b" text-anchor="end">0%</text>

  <!-- Horizontal Gridlines -->
  <line x1="80" y1="50" x2="650" y2="50" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="80" y1="85" x2="650" y2="85" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="80" y1="120" x2="650" y2="120" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="80" y1="155" x2="650" y2="155" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="80" y1="190" x2="650" y2="190" stroke="#64748b" stroke-width="1.5"/>

  <!-- Bars Group 1: Grammar -->
  <rect x="130" y="80" width="45" height="110" fill="#2563eb" rx="4"/>
  <text x="152" y="74" font-family="sans-serif" font-size="10" font-weight="900" fill="#1d4ed8" text-anchor="middle">78%</text>
  <text x="152" y="208" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">Grammar</text>

  <!-- Bars Group 2: Vocabulary -->
  <rect x="250" y="95" width="45" height="95" fill="#10b981" rx="4"/>
  <text x="272" y="89" font-family="sans-serif" font-size="10" font-weight="900" fill="#047857" text-anchor="middle">68%</text>
  <text x="272" y="208" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">Vocabulary</text>

  <!-- Bars Group 3: Communication -->
  <rect x="370" y="65" width="45" height="125" fill="#f59e0b" rx="4"/>
  <text x="392" y="59" font-family="sans-serif" font-size="10" font-weight="900" fill="#b45309" text-anchor="middle">89%</text>
  <text x="392" y="208" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">Communication</text>

  <!-- Bars Group 4: Reading -->
  <rect x="490" y="75" width="45" height="115" fill="#8b5cf6" rx="4"/>
  <text x="512" y="69" font-family="sans-serif" font-size="10" font-weight="900" fill="#6d28d9" text-anchor="middle">82%</text>
  <text x="512" y="208" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">Reading</text>

  <!-- Bottom Legend / Note -->
  <text x="350" y="235" font-family="sans-serif" font-size="10" font-weight="600" fill="#64748b" text-anchor="middle">Source: National Assessment Center Survey of 12th-grade applicants.</text>
</svg>
`),
  },
  {
    id: "preset-conditionals-flowchart",
    title: "Нөхцөлт өгүүлбэрийн логик схем (Conditionals Flowchart)",
    category: "Grammar",
    description: "Zero, First, Second, Third Conditionals-ийн бүтэц ба үр дагаврын зураглал",
    dataUrl:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 240" width="100%" height="100%">
  <rect width="700" height="240" fill="#fffbeb" rx="16" stroke="#fde68a" stroke-width="2"/>
  <text x="350" y="30" font-family="sans-serif" font-size="15" font-weight="900" fill="#78350f" text-anchor="middle">CONDITIONALS DECISION TREE (НӨХЦӨЛТ ӨГҮҮЛБЭРИЙН СХЕМ)</text>

  <!-- 1. Zero -->
  <rect x="40" y="55" width="135" height="120" rx="10" fill="#ffffff" stroke="#d97706" stroke-width="1.5"/>
  <text x="107" y="75" font-family="sans-serif" font-size="11" font-weight="900" fill="#92400e" text-anchor="middle">TYPE 0 (Үнэн баримт)</text>
  <text x="107" y="100" font-family="sans-serif" font-size="9" font-weight="bold" fill="#b45309" text-anchor="middle">If + Present Simple,</text>
  <text x="107" y="118" font-family="sans-serif" font-size="9" font-weight="bold" fill="#b45309" text-anchor="middle">Present Simple</text>
  <text x="107" y="145" font-family="sans-serif" font-size="8" fill="#78350f" text-anchor="middle">If ice melts, it becomes water.</text>

  <!-- 2. First -->
  <rect x="195" y="55" width="135" height="120" rx="10" fill="#ffffff" stroke="#2563eb" stroke-width="1.5"/>
  <text x="262" y="75" font-family="sans-serif" font-size="11" font-weight="900" fill="#1d4ed8" text-anchor="middle">TYPE 1 (Бодит ирээдүй)</text>
  <text x="262" y="100" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1e40af" text-anchor="middle">If + Present Simple,</text>
  <text x="262" y="118" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1e40af" text-anchor="middle">WILL + V1</text>
  <text x="262" y="145" font-family="sans-serif" font-size="8" fill="#1e3a8a" text-anchor="middle">If it rains, I will stay.</text>

  <!-- 3. Second -->
  <rect x="350" y="55" width="135" height="120" rx="10" fill="#ffffff" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="417" y="75" font-family="sans-serif" font-size="11" font-weight="900" fill="#6d28d9" text-anchor="middle">TYPE 2 (Бодит бус одоо)</text>
  <text x="417" y="100" font-family="sans-serif" font-size="9" font-weight="bold" fill="#5b21b6" text-anchor="middle">If + Past Simple,</text>
  <text x="417" y="118" font-family="sans-serif" font-size="9" font-weight="bold" fill="#5b21b6" text-anchor="middle">WOULD + V1</text>
  <text x="417" y="145" font-family="sans-serif" font-size="8" fill="#4c1d95" text-anchor="middle">If I had time, I would call.</text>

  <!-- 4. Third -->
  <rect x="505" y="55" width="155" height="120" rx="10" fill="#ffffff" stroke="#dc2626" stroke-width="1.5"/>
  <text x="582" y="75" font-family="sans-serif" font-size="11" font-weight="900" fill="#b91c1c" text-anchor="middle">TYPE 3 (Харамсал / Өнгөрсөн)</text>
  <text x="582" y="100" font-family="sans-serif" font-size="9" font-weight="bold" fill="#991b1b" text-anchor="middle">If + Past Perfect (had V3),</text>
  <text x="582" y="118" font-family="sans-serif" font-size="9" font-weight="bold" fill="#991b1b" text-anchor="middle">WOULD HAVE + V3</text>
  <text x="582" y="145" font-family="sans-serif" font-size="8" fill="#7f1d1d" text-anchor="middle">If she had studied, she would have passed.</text>

  <!-- Bottom rule -->
  <text x="350" y="210" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#78350f" text-anchor="middle">ЭЕШ-д ихэвчлэн Type 2 ба Type 3-ын бүтцийн ялгаагаар шалгадаг.</text>
</svg>
`),
  },
  {
    id: "preset-communication-dialogue",
    title: "Харилцан ярианы сүлжээний зураг (Communication Dialogue Map)",
    category: "Communication",
    description: "Асуулт, хариултын албан болон энгийн хэллэгийн диаграмм",
    dataUrl:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 240" width="100%" height="100%">
  <rect width="700" height="240" fill="#fdf4ff" rx="16" stroke="#f0abfc" stroke-width="2"/>
  <text x="350" y="32" font-family="sans-serif" font-size="15" font-weight="900" fill="#701a75" text-anchor="middle">FORMAL VS INFORMAL COMMUNICATION PATTERNS</text>

  <!-- Formal Box -->
  <rect x="60" y="60" width="260" height="120" rx="12" fill="#ffffff" stroke="#c026d3" stroke-width="2"/>
  <text x="190" y="85" font-family="sans-serif" font-size="13" font-weight="900" fill="#a21caf" text-anchor="middle">FORMAL (Албан яриа)</text>
  <text x="80" y="110" font-family="sans-serif" font-size="10" font-weight="bold" fill="#374151">• "Could you please clarify...?"</text>
  <text x="80" y="130" font-family="sans-serif" font-size="10" font-weight="bold" fill="#374151">• "I would appreciate it if you could..."</text>
  <text x="80" y="150" font-family="sans-serif" font-size="10" font-weight="bold" fill="#374151">• "Sincerely yours / Best regards"</text>

  <!-- Informal Box -->
  <rect x="380" y="60" width="260" height="120" rx="12" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
  <text x="510" y="85" font-family="sans-serif" font-size="13" font-weight="900" fill="#1d4ed8" text-anchor="middle">INFORMAL (Энгийн яриа)</text>
  <text x="400" y="110" font-family="sans-serif" font-size="10" font-weight="bold" fill="#374151">• "What do you mean?"</text>
  <text x="400" y="130" font-family="sans-serif" font-size="10" font-weight="bold" fill="#374151">• "Can you help me out?"</text>
  <text x="400" y="150" font-family="sans-serif" font-size="10" font-weight="bold" fill="#374151">• "Catch you later / Cheers!"</text>

  <text x="350" y="210" font-family="sans-serif" font-size="11" font-weight="700" fill="#86198f" text-anchor="middle">Context determines the register: Academic & Business = Formal | Friends = Informal</text>
</svg>
`),
  },
];
