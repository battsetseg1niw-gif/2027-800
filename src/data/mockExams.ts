import { Exam, Question } from "../types";

// Standard Question Bank
export const SAMPLE_QUESTIONS: Question[] = [
  // GRAMMAR
  {
    id: "q-g-1",
    questionNumber: 1,
    text: "By the time the headmaster entered the classroom, the students ________ all the tasks on the blackboard.",
    category: "Grammar",
    topic: "Tenses & Aspect",
    subtopic: "Past Perfect with By the time",
    difficulty: "Medium",
    options: [
      { id: "A", text: "have finished" },
      { id: "B", text: "had finished" },
      { id: "C", text: "were finishing" },
      { id: "D", text: "will finish" },
      { id: "E", text: "are finished" },
    ],
    correctAnswer: "B",
    explanation: "'By the time + Past Simple' илэрхийлэл нь нөгөө үйл явдал түүнээс өмнө бүрэн болж дууссан болохыг заадаг учир Past Perfect (had + V3) сонгоно.",
  },
  {
    id: "q-g-2",
    questionNumber: 2,
    text: "If she ________ enough time yesterday, she would have joined the international debate competition.",
    category: "Grammar",
    topic: "Conditionals",
    subtopic: "Third Conditional",
    difficulty: "Hard",
    options: [
      { id: "A", text: "had had" },
      { id: "B", text: "has had" },
      { id: "C", text: "would have" },
      { id: "D", text: "had" },
      { id: "E", text: "has" },
    ],
    correctAnswer: "A",
    explanation: "Өнгөрсөнд болоогүй нөхцөл буюу 3-р төрлийн нөхцөлт өгүүлбэр: 'If + had + V3, would have + V3'. 'Have' үйл үгийн Past Perfect хэлбэр нь 'had had' байна.",
  },
  {
    id: "q-g-3",
    questionNumber: 3,
    text: "The new bridge ________ by modern international engineers before the winter begins.",
    category: "Grammar",
    topic: "Passive Voice",
    subtopic: "Future Passive",
    difficulty: "Medium",
    options: [
      { id: "A", text: "will be completed" },
      { id: "B", text: "was completing" },
      { id: "C", text: "is completed" },
      { id: "D", text: "has completed" },
      { id: "E", text: "completed" },
    ],
    correctAnswer: "A",
    explanation: "Өгүүлбэрийн тусагдахуун нь гүүр (The new bridge) тул үйлдэл өөрөө хийхгүй, ирээдүй цагт гүйцэтгэгдэх тул Future Passive 'will be completed' зөв.",
  },
  {
    id: "q-g-4",
    questionNumber: 4,
    text: "Neither the teacher nor the students ________ able to solve that extremely complicated math puzzle.",
    category: "Grammar",
    topic: "Subject-Verb Agreement",
    subtopic: "Neither...nor rule",
    difficulty: "Medium",
    options: [
      { id: "A", text: "was" },
      { id: "B", text: "were" },
      { id: "C", text: "is" },
      { id: "D", text: "are" },
      { id: "E", text: "has been" },
    ],
    correctAnswer: "B",
    explanation: "'Neither... nor...' холбоосонд үйл үг нь өөртөө хамгийн ойр байгаа нэр үгтэйгээ (the students - олон тоо) тохирдог. Өнгөрсөн цагт 'were' зөв.",
  },
  {
    id: "q-g-5",
    questionNumber: 5,
    text: "I wish I ________ more vocabulary words before sitting for the state entrance examination.",
    category: "Grammar",
    topic: "Subjunctive & Wishes",
    subtopic: "Wish + Past Perfect",
    difficulty: "Hard",
    options: [
      { id: "A", text: "memorized" },
      { id: "B", text: "had memorized" },
      { id: "C", text: "have memorized" },
      { id: "D", text: "would memorize" },
      { id: "E", text: "memorize" },
    ],
    correctAnswer: "B",
    explanation: "Өнгөрсөнд хийж чадаагүй зүйлдээ харамсаж 'wish' ашиглах үед Past Perfect (had + V3) ашигладаг.",
  },

  // VOCABULARY
  {
    id: "q-v-1",
    questionNumber: 6,
    text: "The professor asked the students to ________ the main ideas of the article in their own words.",
    category: "Vocabulary",
    topic: "Academic Vocabulary",
    subtopic: "Synonyms & Paraphrasing",
    difficulty: "Easy",
    options: [
      { id: "A", text: "summarize" },
      { id: "B", text: "memorize" },
      { id: "C", text: "scrutinize" },
      { id: "D", text: "complain" },
      { id: "E", text: "refuse" },
    ],
    correctAnswer: "A",
    explanation: "'Summarize' нь 'товчлох, дүгнэх' гэсэн утгатай. Өгүүллийн гол санааг өөрийн үгээр хураангуйлан бичихийг хүссэн байна.",
  },
  {
    id: "q-v-2",
    questionNumber: 7,
    text: "After discussing for two hours, they finally ________ an agreement on the new contract terms.",
    category: "Vocabulary",
    topic: "Collocations",
    subtopic: "Verb-Noun Collocations",
    difficulty: "Medium",
    options: [
      { id: "A", text: "reached" },
      { id: "B", text: "arrived" },
      { id: "C", text: "gained" },
      { id: "D", text: "accomplished" },
      { id: "E", text: "touched" },
    ],
    correctAnswer: "A",
    explanation: "Англи хэлний түгээмэл холбоо үг: 'reach an agreement' (тохиролцоонд хүрэх) гэж хэрэглэгддэг.",
  },
  {
    id: "q-v-3",
    questionNumber: 8,
    text: "The company had to ________ the launch of their new smartphone due to unexpected technical errors.",
    category: "Vocabulary",
    topic: "Phrasal Verbs",
    subtopic: "Phrasal Verbs with Put",
    difficulty: "Medium",
    options: [
      { id: "A", text: "put off" },
      { id: "B", text: "put out" },
      { id: "C", text: "put on" },
      { id: "D", text: "put up with" },
      { id: "E", text: "put through" },
    ],
    correctAnswer: "A",
    explanation: "'Put off' гэдэг хэллэг үйл үг нь 'хойшлуулах (postpone)' гэсэн утгатай.",
  },
  {
    id: "q-v-4",
    questionNumber: 9,
    text: "Her dedication to animal welfare is truly ________; everyone admires her tireless volunteer work.",
    category: "Vocabulary",
    topic: "Word Choice & Connotation",
    subtopic: "Positive Adjectives",
    difficulty: "Hard",
    options: [
      { id: "A", text: "negligible" },
      { id: "B", text: "commendable" },
      { id: "C", text: "tedious" },
      { id: "D", text: "hostile" },
      { id: "E", text: "arrogant" },
    ],
    correctAnswer: "B",
    explanation: "'Commendable' нь 'сайшаалтай, бахархмаар' гэсэн эерэг утгатай үг бөгөөд 'everyone admires her' гэсэн баталгаатай яв цав нийцнэ.",
  },
  {
    id: "q-v-5",
    questionNumber: 10,
    text: "It was a complete accident. I didn't break the antique vase ________.",
    category: "Vocabulary",
    topic: "Idiomatic Prepositional Phrases",
    subtopic: "Intention phrases",
    difficulty: "Easy",
    options: [
      { id: "A", text: "by purpose" },
      { id: "B", text: "on purpose" },
      { id: "C", text: "with purpose" },
      { id: "D", text: "for purpose" },
      { id: "E", text: "in purpose" },
    ],
    correctAnswer: "B",
    explanation: "'Санаатайгаар, зориуд' гэхийг англи хэлэнд 'on purpose' гэсэн хэлцээр илэрхийлдэг.",
  },

  // COMMUNICATION
  {
    id: "q-c-1",
    questionNumber: 11,
    text: "Customer: 'Could you tell me where the fitting rooms are?'\nShop Assistant: '________.'",
    category: "Communication",
    topic: "Everyday Situations",
    subtopic: "Customer Service & Directions",
    difficulty: "Easy",
    options: [
      { id: "A", text: "They are right over there next to the cashier." },
      { id: "B", text: "I wear size medium." },
      { id: "C", text: "No, you cannot try them." },
      { id: "D", text: "I bought it yesterday." },
      { id: "E", text: "It costs twenty thousand tugriks." },
    ],
    correctAnswer: "A",
    explanation: "Хувцас солих өрөө хаана байгааг лавласан тул байршлыг заасан 'They are right over there next to the cashier' хамгийн зөв хариулт.",
  },
  {
    id: "q-c-2",
    questionNumber: 12,
    text: "Colleague A: 'I just passed my IELTS exam with an overall band of 8.0!'\nColleague B: '________!'",
    category: "Communication",
    topic: "Social Expressions",
    subtopic: "Congratulating & Rejoicing",
    difficulty: "Easy",
    options: [
      { id: "A", text: "Better luck next time!" },
      { id: "B", text: "What fantastic news! Congratulations!" },
      { id: "C", text: "Don't mention it." },
      { id: "D", text: "You must be very sorry." },
      { id: "E", text: "Mind your own business." },
    ],
    correctAnswer: "B",
    explanation: "Амжилтад баяр хүргэж урам хайрлах харилцан ярианы стандарт соёл нь 'What fantastic news! Congratulations!' юм.",
  },
  {
    id: "q-c-3",
    questionNumber: 13,
    text: "Student: 'I am so sorry for submitting my project late, teacher.'\nTeacher: '________, but please make sure it doesn't happen again.'",
    category: "Communication",
    topic: "Apologies & Acceptance",
    subtopic: "Accepting Apologies Gracefully",
    difficulty: "Medium",
    options: [
      { id: "A", text: "That is unforgivable" },
      { id: "B", text: "I accept it with pleasure" },
      { id: "C", text: "That is all right for this time" },
      { id: "D", text: "You are welcome" },
      { id: "E", text: "My pleasure" },
    ],
    correctAnswer: "C",
    explanation: "Уучлал хүссэнд 'Энэ удаад зүгээр ээ, гэхдээ дахин давтахгүй байхыг анхаараарай' гэж хариулах нь тохиромжтой.",
  },

  // READING
  {
    id: "q-r-1",
    questionNumber: 14,
    text: "Read the excerpt: 'Renewable energy sources such as solar and wind power are no longer niche technologies. Over the past decade, technological innovations have drastically slashed the cost of manufacturing solar panels and wind turbines, making green electricity cheaper than coal in many parts of the globe.'\n\nWhat is the primary message of this passage?",
    category: "Reading",
    topic: "Reading Comprehension",
    subtopic: "Main Idea & Synthesis",
    difficulty: "Medium",
    options: [
      { id: "A", text: "Solar power has become completely unaffordable." },
      { id: "B", text: "Renewable energy has become highly cost-effective and mainstream." },
      { id: "C", text: "Coal remains the cheapest source of global energy." },
      { id: "D", text: "Wind turbines are too complicated to manufacture." },
      { id: "E", text: "Governments have banned fossil fuels entirely." },
    ],
    correctAnswer: "B",
    explanation: "Эх бичвэрт нар, салхины сэргээгдэх эрчим хүчний зардал эрс буурч, нүүрснээс хямд өртөгтэй болон түгээмэл болсныг гол санаа болгосон.",
    readingPassage: "Renewable energy sources such as solar and wind power are no longer niche technologies. Over the past decade, technological innovations have drastically slashed the cost of manufacturing solar panels and wind turbines, making green electricity cheaper than coal in many parts of the globe.",
  },
  {
    id: "q-r-2",
    questionNumber: 15,
    text: "According to the passage, what caused the dramatic price drop in renewable energy?",
    category: "Reading",
    topic: "Reading Comprehension",
    subtopic: "Detail Scanning & Cause-Effect",
    difficulty: "Medium",
    options: [
      { id: "A", text: "A global shortage of steel." },
      { id: "B", text: "Technological innovations in manufacturing." },
      { id: "C", text: "A sudden rise in coal prices." },
      { id: "D", text: "International trade bans." },
      { id: "E", text: "Decreased public demand for electricity." },
    ],
    correctAnswer: "B",
    explanation: "Эхийн 2 дахь өгүүлбэрт 'technological innovations have drastically slashed the cost of manufacturing' гэж тодорхой заасан.",
    readingPassage: "Renewable energy sources such as solar and wind power are no longer niche technologies. Over the past decade, technological innovations have drastically slashed the cost of manufacturing solar panels and wind turbines, making green electricity cheaper than coal in many parts of the globe.",
  },

  // 16. MATCHING TASK (Хослуулах даалгавар: Үгийн утгыг холбох)
  {
    id: "q-m-1",
    questionNumber: 16,
    type: "matching",
    text: "Match each English vocabulary word in Column A with its correct definition or synonym in Column B.",
    category: "Vocabulary",
    topic: "Academic Matching & Collocations",
    subtopic: "Synonym Matching",
    difficulty: "Medium",
    options: [
      { id: "A", text: "1-B, 2-C, 3-A, 4-D" },
      { id: "B", text: "1-A, 2-B, 3-C, 4-D" },
      { id: "C", text: "1-C, 2-A, 3-D, 4-B" },
      { id: "D", text: "1-D, 2-B, 3-A, 4-C" },
      { id: "E", text: "1-B, 2-A, 3-D, 4-C" },
    ],
    correctAnswer: "A",
    matchingPairs: [
      { id: "pair-1", left: "1. Abundant", right: "B. Existing or available in large quantities; plentiful" },
      { id: "pair-2", left: "2. Deteriorate", right: "C. Become progressively worse in quality or condition" },
      { id: "pair-3", left: "3. Feasible", right: "A. Possible to do easily or conveniently; practical" },
      { id: "pair-4", left: "4. Inevitable", right: "D. Certain to happen; unavoidable" },
    ],
    explanation: "Үгсийн утга: Abundant = элбэг дэлбэг (B), Deteriorate = доройтох (C), Feasible = хэрэгжих боломжтой (A), Inevitable = гарцаагүй (D). Зөв хослол: 1-B, 2-C, 3-A, 4-D.",
  },

  // 17. COMPLETING / FILL IN THE BLANK (Нөхөх даалгавар)
  {
    id: "q-fb-1",
    questionNumber: 17,
    type: "fill_blank",
    text: "Complete the paragraph by filling in the missing grammatical prepositions and verbs in the brackets [1], [2], [3].",
    category: "Grammar",
    topic: "Prepositions & Verb Complementation",
    subtopic: "Cloze Completion",
    difficulty: "Medium",
    options: [
      { id: "A", text: "[1] in, [2] to achieve, [3] on" },
      { id: "B", text: "[1] on, [2] achieving, [3] in" },
      { id: "C", text: "[1] at, [2] achieved, [3] of" },
      { id: "D", text: "[1] of, [2] achieve, [3] for" },
      { id: "E", text: "[1] with, [2] to achieve, [3] about" },
    ],
    correctAnswer: "A",
    blanks: [
      { id: "b-1", blankIndex: 1, correctAnswer: "in", placeholder: "interested [1] ...", options: ["in", "on", "at", "with"] },
      { id: "b-2", blankIndex: 2, correctAnswer: "to achieve", placeholder: "aims [2] ...", options: ["to achieve", "achieving", "achieve"] },
      { id: "b-3", blankIndex: 3, correctAnswer: "on", placeholder: "depends [3] ...", options: ["on", "in", "for", "with"] },
    ],
    explanation: "'Interested in' (сонирхох), 'aim to achieve' (зорих), 'depends on' (хамаарах) гэсэн удирдах угтвар үг ба инфинитив хэлбэрүүд нийцнэ.",
  },

  // 18. DRAGGING / DRAG & DROP (Чирч байрлуулах даалгавар)
  {
    id: "q-dd-1",
    questionNumber: 18,
    type: "drag_drop",
    text: "Drag and place the transition connectors into the correct sentence functional category slots below.",
    category: "Reading",
    topic: "Discourse Markers & Transitions",
    subtopic: "Logical Connectors",
    difficulty: "Hard",
    options: [
      { id: "A", text: "Contrast: However, On the contrary | Cause/Result: Consequently, Therefore" },
      { id: "B", text: "Contrast: Therefore | Cause/Result: However" },
      { id: "C", text: "Contrast: Consequently | Cause/Result: In addition" },
      { id: "D", text: "Contrast: Furthermore | Cause/Result: Although" },
      { id: "E", text: "Contrast: Besides | Cause/Result: Despite" },
    ],
    correctAnswer: "A",
    dragItems: [
      { id: "item-1", text: "However" },
      { id: "item-2", text: "Consequently" },
      { id: "item-3", text: "On the contrary" },
      { id: "item-4", text: "Therefore" },
    ],
    dropZones: [
      { id: "zone-1", label: "Эсрэгцүүлсэн холбоос (Contrast)", correctItemIds: ["item-1", "item-3"] },
      { id: "zone-2", label: "Үр дагаврын холбоос (Cause & Result)", correctItemIds: ["item-2", "item-4"] },
    ],
    explanation: "'However' болон 'On the contrary' нь эсрэгцүүлсэн холбоос, 'Consequently' болон 'Therefore' нь үр дагаврын холбоосууд юм.",
  },

  // 19. PICTURE / GRAPHIC TASK (Зурагт тест)
  {
    id: "q-pic-1",
    questionNumber: 19,
    type: "multiple_choice",
    text: "Look at the scientific diagram illustrating the global hydrologic (water) cycle. Which process is indicated at stage 3 where water vapor cools and forms clouds?",
    category: "Reading",
    topic: "Scientific Infographics & Vocabulary",
    subtopic: "Visual Data Reading",
    difficulty: "Medium",
    imageUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&auto=format&fit=crop&q=80",
    attachmentName: "water_cycle_diagram.jpg",
    attachmentType: "image",
    options: [
      { id: "A", text: "Evaporation" },
      { id: "B", text: "Condensation" },
      { id: "C", text: "Precipitation" },
      { id: "D", text: "Transpiration" },
      { id: "E", text: "Infiltration" },
    ],
    correctAnswer: "B",
    explanation: "Усны уур хөрч үүл болж хувирах физик үзэгдлийг англи хэлээр 'Condensation' (конденсаци, шингэрэл) гэдэг.",
  },
];

// Generate a full 50-question mock exam programmatically
export function generateFullExamQuestions(seedPrefix: string): Question[] {
  const categories: Question["category"][] = [
    "Grammar", "Grammar", "Grammar", "Grammar",
    "Vocabulary", "Vocabulary", "Vocabulary",
    "Communication",
    "Reading", "Reading",
  ];

  const grammarTopics = [
    { topic: "Tenses & Aspect", sub: "Present Perfect vs Past Simple", rule: "Past simple нь өнгөрсөнд болсон тодорхой цаг заана." },
    { topic: "Conditionals", sub: "Second Conditional", rule: "If + past simple, would + base verb бүтэцтэй байна." },
    { topic: "Modal Verbs", sub: "Deduction in Past (must have / can't have)", rule: "Must have + V3 нь өнгөрсөнд гарцаагүй болсон таамаглал." },
    { topic: "Passive Voice", sub: "Present Continuous Passive", rule: "Is/are being + V3 хэлбэрийг одоо өрнөж буй идэвхгүй үйлдлийг заана." },
    { topic: "Relative Clauses", sub: "Defining vs Non-defining", rule: "Хүн заахад who, амьтан/зүйл заахад which/that хэрэглэнэ." },
    { topic: "Reported Speech", sub: "Backshift of tenses", rule: "Present Simple нь шууд бус ярианд Past Simple болж хувирна." },
    { topic: "Articles", sub: "Definite Article 'The'", rule: "Цор ганц зүйлс болон тодорхой нэр үгсийн өмнө 'the' авна." },
  ];

  const vocabTopics = [
    { topic: "Phrasal Verbs", sub: "Phrasal Verbs with Look", rule: "Look forward to + V-ing нь тэсэн ядан хүлээх гэсэн утгатай." },
    { topic: "Word Formation", sub: "Suffixes & Prefixes", rule: "Нэр үгээс тэмдэг нэр үүсгэхэд -ful, -less залгавар авна." },
    { topic: "Synonyms & Antonyms", sub: "Formal Academic Words", rule: "Substantial нь томоохон, үлэмж гэсэн утгатай." },
    { topic: "Prepositions", sub: "Dependent Prepositions", rule: "Interested in, capable of, fond of хэлбэрээр хэрэглэгдэнэ." },
    { topic: "Idioms", sub: "Common Everyday Idioms", rule: "Piece of cake нь тун хялбар зүйлийг илэрхийлдэг хэлц." },
  ];

  const questions: Question[] = [];

  for (let i = 1; i <= 50; i++) {
    const cat = categories[(i - 1) % categories.length];
    let topicObj = { topic: "General Skill", sub: "Standard Exam Question", rule: "Зөв хариултыг сонгоно уу." };

    if (cat === "Grammar") {
      topicObj = grammarTopics[(i - 1) % grammarTopics.length];
    } else if (cat === "Vocabulary") {
      topicObj = vocabTopics[(i - 1) % vocabTopics.length];
    } else if (cat === "Communication") {
      topicObj = { topic: "Everyday Dialogues", sub: "Situational Response", rule: "Англи хэлний харилцан ярианы эелдэг хэв маягийг сонгоно." };
    } else {
      topicObj = { topic: "Reading Comprehension", sub: "Contextual Deduction", rule: "Эх бичвэрийн агуулгатай нягт нийцэх хувилбарыг олно." };
    }

    const optionsList = [
      { id: "A" as const, text: `Option A for Q${i}` },
      { id: "B" as const, text: `Option B for Q${i}` },
      { id: "C" as const, text: `Option C for Q${i}` },
      { id: "D" as const, text: `Option D for Q${i}` },
      { id: "E" as const, text: `Option E for Q${i}` },
    ];

    const correct = (["A", "B", "C", "D", "E"] as const)[(i * 3) % 5];

    // Give real, authentic question texts for early questions
    if (i <= SAMPLE_QUESTIONS.length) {
      questions.push({
        ...SAMPLE_QUESTIONS[i - 1],
        id: `${seedPrefix}-q-${i}`,
        questionNumber: i,
      });
    } else {
      questions.push({
        id: `${seedPrefix}-q-${i}`,
        questionNumber: i,
        text: `Question ${i}: Select the grammatically and contextually correct English completion for the Mongolian ESH standard test (${topicObj.topic}).`,
        category: cat,
        topic: topicObj.topic,
        subtopic: topicObj.sub,
        difficulty: i % 3 === 0 ? "Hard" : i % 2 === 0 ? "Medium" : "Easy",
        options: optionsList,
        correctAnswer: correct,
        explanation: topicObj.rule,
        readingPassage: cat === "Reading" ? "Modern scientific research emphasizes the irreplaceable cognitive advantages of reading foreign literature daily." : undefined,
      });
    }
  }

  return questions;
}

// Helper to get all available years from 2006 to 2026
export const ALL_ESH_YEARS = Array.from({ length: 21 }, (_, i) => 2026 - i);
export const ALL_ESH_VARIANTS: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];

// Complete 2006-2026 past exams across all 4 variants (A, B, C, D) = 84 official past papers
export const ALL_PAST_PAPERS: Exam[] = ALL_ESH_YEARS.flatMap((y) =>
  ALL_ESH_VARIANTS.map((v) => ({
    id: `esh-${y}-${v.toLowerCase()}`,
    title: `${y} оны ЭЕШ - Англи хэл (Хувилбар ${v})`,
    year: y,
    variant: v,
    type: "past_paper" as const,
    totalQuestions: 50,
    durationMinutes: 80,
    questions: generateFullExamQuestions(`esh-${y}-${v.toLowerCase()}`),
    readingPassage: `Official Examination Paper of the Educational Evaluation Center (EEC) of Mongolia - Year ${y}, Variant ${v}.\n\nThe ecological diversity of the Mongolian plateau presents exceptional biological resilience. Recent field observations across the Altai-Sayan ecoregion demonstrate how endemic wildlife species adapt to fluctuating seasonal temperatures and arid steppes. International researchers and local conservationists collaborate to preserve these critical habitats for future generations.`,
    status: "published" as const,
    createdBy: "usr-admin-1",
    createdByName: "Боловсролын Үнэлгээний Төв (БҮТ)",
    createdAt: `${y}-06-25`,
  }))
);

// 2006 to 2026 Archive Exams List
export const INITIAL_EXAMS: Exam[] = [
  {
    id: "esh-2026-mock-1",
    title: "2026 оны ЭЕШ - Албан ёсны загвар тест #1 (Mock Test)",
    year: 2026,
    variant: "Mock",
    type: "mock",
    totalQuestions: 50,
    durationMinutes: 80,
    questions: generateFullExamQuestions("esh-2026-m1"),
    status: "published",
    createdBy: "usr-admin-1",
    createdByName: "SmartESH Админ",
    createdAt: "2026-03-01",
  },
  {
    id: "esh-2026-mock-2",
    title: "2026 оны ЭЕШ - Жишиг сорилт #2 (Weekly Mock)",
    year: 2026,
    variant: "Mock",
    type: "mock",
    totalQuestions: 50,
    durationMinutes: 80,
    questions: generateFullExamQuestions("esh-2026-m2"),
    status: "published",
    createdBy: "usr-admin-1",
    createdByName: "SmartESH Админ",
    createdAt: "2026-03-08",
  },
  {
    id: "esh-2025-mock-a",
    title: "2025 оны ЭЕШ - Загвар сорилт (Хувилбар A)",
    year: 2025,
    variant: "A",
    type: "mock",
    totalQuestions: 50,
    durationMinutes: 80,
    questions: generateFullExamQuestions("esh-2025-mock-a"),
    status: "published",
    createdBy: "usr-admin-1",
    createdByName: "SmartESH Админ",
    createdAt: "2025-11-20",
  },
  // All 84 Past Papers: 2006 to 2026 (Variants A, B, C, D)
  ...ALL_PAST_PAPERS,
  // Diagnostic Test (25 questions)
  {
    id: "esh-diagnostic-test",
    title: "SmartESH Түвшин Тогтоох Сорилт (Diagnostic Test)",
    year: 2026,
    variant: "Diagnostic",
    type: "diagnostic",
    totalQuestions: 25,
    durationMinutes: 45,
    questions: generateFullExamQuestions("esh-diag").slice(0, 25),
    status: "published",
    createdBy: "usr-admin-1",
    createdByName: "SmartESH Академи",
    createdAt: "2026-01-10",
  },
  // Teacher Custom Exam
  {
    id: "esh-teacher-exam-1",
    title: "12-р ангийн 3-р улирлын сорилт (Оюунцэцэг багш)",
    year: 2026,
    variant: "A",
    type: "teacher_custom",
    totalQuestions: 20,
    durationMinutes: 35,
    questions: generateFullExamQuestions("esh-tch-custom").slice(0, 20),
    status: "published",
    createdBy: "usr-teacher-1",
    createdByName: "Оюунцэцэг Багш",
    createdAt: "2026-02-28",
  },
];

