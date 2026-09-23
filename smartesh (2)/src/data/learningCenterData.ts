import { Lesson } from "../types";

export const LEARNING_CENTER_LESSONS: Lesson[] = [
  // ==========================================
  // TRACK 1: GRAMMAR (БҮХ АНГЛИ ХЭЛНИЙ ДҮРЭМ)
  // ==========================================
  {
    id: "les-g-1",
    track: "Grammar",
    category: "Grammar",
    order: 1,
    title: "1. Цагуудын Нэгдсэн Систем: Бүх 12 Цагийн Хэлбэр, Хэрэглээ & Түлхүүр Үгс",
    description: "Англи хэлний 12 цагийг өнгөрсөн, одоо, ирээдүйгээр нь системчлэн харьцуулах ба ЭЕШ-ийн түлхүүр үгс",
    isFree: true,
    durationMinutes: 35,
    summaryRule: "Past Simple тодорхой дууссан хугацааг (yesterday, in 2020, ago), Present Perfect одоотой холбоотой үр дүн эсвэл туршлагыг (ever, never, just, already, yet, since, for) заана.",
    detailedContent: `Англи хэлний ЭЕШ-д цагтай холбоотой 8-12 асуулт жил бүр ирдэг. 12 цагийг 4 үндсэн бүлэгт (Simple, Continuous, Perfect, Perfect Continuous) хуваан судалдаг.

1. PRESENT SIMPLE (Энгийн одоо цаг):
- Хэлбэр: S + V1 (s/es) | S + do/does not + V1 | Do/Does + S + V1?
- Хэрэглээ: Үргэлж үнэн баримт, дадал зуршил, хуваарийн дагуу болох үйл явдал (цагийн хуваарь).
- Түлхүүр үгс: always, usually, often, sometimes, rarely, never, every day/week, on Mondays.
- Жишээ: The sun rises in the east. She works at a hospital. The train leaves at 8:00 AM.

2. PRESENT CONTINUOUS (Одоо үргэлжилж буй цаг):
- Хэлбэр: S + am/is/are + V-ing | S + am/is/are not + V-ing | Am/Is/Are + S + V-ing?
- Хэрэглээ: Яг одоо ярьж буй агшинд болж буй үйл явдал, түр зуурын нөхцөл байдал, ирээдүйд төлөвлөсөн тодорхой уулзалт.
- Түлхүүр үгс: now, at the moment, currently, right now, Look!, Listen!, this week.
- Шалгалтын Tip: 'State verbs' (know, believe, understand, love, belong, see, hear) нь Continuous цаг дээр бараг хэрэглэгддэггүй!
- Жишээ: Look! The bus is coming. She is currently preparing for the state entrance exam.

3. PRESENT PERFECT (Одоо төгссөн цаг):
- Хэлбэр: S + have/has + V3 | S + have/has not + V3 | Have/Has + S + V3?
- Хэрэглээ: Өнгөрсөнд эхлээд одоо хүртэл үргэлжилж буй үйл явдал, эсвэл цаг хугацаа нь тодорхойгүй туршлага, одоо харагдаж буй үр дүн.
- Түлхүүр үгс: already, just, yet (сөрөг ба асуултад), ever, never, so far, recently, since + эхлэлийн цэг, for + хугацааны урт.
- Жишээ: She has already submitted her application. I have lived in Ulaanbaatar since 2015.

4. PRESENT PERFECT CONTINUOUS (Одоо төгсөн үргэлжилж буй цаг):
- Хэлбэр: S + have/has been + V-ing
- Хэрэглээ: Өнгөрсөнд эхлээд яг одоо ч гэсэн тасралтгүй үргэлжилж буй үйлдлийн үргэлжлэх хугацааг онцлоход.
- Түлхүүр үгс: How long...?, for 3 hours, all morning, all day.
- Жишээ: He has been studying English for four hours without a break.

5. PAST SIMPLE (Энгийн өнгөрсөн цаг):
- Хэлбэр: S + V2 (ed / irregular) | S + did not + V1 | Did + S + V1?
- Хэрэглээ: Өнгөрсөнд тодорхой цаг хугацаанд эхлээд бүрэн дууссан үйлдэл.
- Түлхүүр үгс: yesterday, last week, ago, in 1995, when I was a child, the other day.
- Жишээ: Chinggis Khaan founded the Great Mongol Empire in 1206.

6. PAST CONTINUOUS (Өнгөрсөнд үргэлжилж байсан цаг):
- Хэлбэр: S + was/were + V-ing
- Хэрэглээ: Өнгөрсөн тодорхой мөчид үргэлжилж байсан үйлдэл; урт үйл явдлын дундуур богино үйл явдал (Past Simple) орж ирэхэд.
- Түлхүүр үгс: at 5 PM yesterday, while, when, as.
- Жишээ: While I was studying in the library, the fire alarm rang.

7. PAST PERFECT (Өнгөрсөнд төгссөн цаг - Өмнөх өнгөрсөн цаг):
- Хэлбэр: S + had + V3 | S + had not + V3
- Хэрэглээ: Өнгөрсөнд болсон хоёр үйлдлийн хамгийн эхэнд болсныг заахад.
- Түлхүүр үгс: by the time + Past Simple, before, after, already, when.
- Жишээ: By the time the doctor arrived, the patient had already recovered.

8. PAST PERFECT CONTINUOUS:
- Хэлбэр: S + had been + V-ing
- Жишээ: She had been waiting for two hours before the bus finally arrived.

9. FUTURE FORMS (Ирээдүй цагууд):
- Will + V1: Шуурхай шийдвэр (instant decision), таамаглал (I think it will rain), амлалт.
- Be going to + V1: Урьдчилан төлөвлөсөн зүйл, одоогийн бодит баримтад үндэслэсэн гарцаагүй таамаглал (Look at those dark clouds! It is going to rain).
- Future Continuous: S + will be + V-ing (Маргааш энэ цагт хийж байх үйлдэл).
- Future Perfect: S + will have + V3 (By tomorrow / by 2030 гэхэд бүрэн дууссан байх үйлдэл).`,
    tables: [
      {
        title: "12 Цагийн Нэгдсэн Хүснэгт & Шалгалтын Түлхүүр Үгс",
        headers: ["Цагийн Нэр", "Бүтэц (Form)", "Түлхүүр Үгс (Key Signal Words)", "Шалгалтын Жишээ Өгүүлбэр"],
        rows: [
          ["Present Simple", "V1 / V-s/es", "always, often, every year", "Water boils at 100 degrees Celsius."],
          ["Present Continuous", "am/is/are + V-ing", "now, at present, Look!", "The population of the city is increasing."],
          ["Present Perfect", "have/has + V3", "already, yet, since, for", "She has lived here since she was born."],
          ["Present Perfect Cont.", "have/has been + V-ing", "for 3 hours, all day", "He has been painting the wall all morning."],
          ["Past Simple", "V2 / did not + V1", "yesterday, in 2018, ago", "They discovered oil here 50 years ago."],
          ["Past Continuous", "was/were + V-ing", "while, at 9 PM last night", "I was sleeping when the phone rang."],
          ["Past Perfect", "had + V3", "by the time, before, after", "The train had left before we arrived."],
          ["Future Simple", "will + V1", "tomorrow, next week, probably", "I believe prices will drop next year."],
          ["Be going to", "am/is/are going to + V1", "look at those..., planned", "She is going to study law next semester."],
          ["Future Perfect", "will have + V3", "by 2030, by the end of this year", "By June, I will have finished my high school."],
        ],
      },
    ],
    tips: [
      "Шалгалтын гол түлхүүр: 'By the time + Past Simple' харвал нөгөө талд заавал 'had + V3' (Past Perfect) сонгоно.",
      "'Since'-ийн араас шууд Past Simple өгүүлбэр орж, гол өгүүлбэр нь Present Perfect (have/has + V3) байна: I have known him since we entered school.",
      "'While'-ийн ард ихэвчлэн үргэлжлэх цаг (Past Continuous) ордог: While he was driving, he saw an accident.",
    ],
    examTrapAlerts: [
      "Занга: 'Yesterday', 'last night', 'in 2021' гэсэн тодорхой хугацаа байхад хэзээ ч Present Perfect (have seen) хэрэглэж болохгүй! Зөвхөн Past Simple (saw) сонгоно.",
      "Занга: 'Never', 'ever' байсан ч цаг хугацаа нь тодорхой өнгөрсөн үе байвал (when I was a child) Past Simple авна.",
    ],
    quizQuestions: [
      {
        question: "By the time the firefighter squad reached the scene, the fire ________ by the local residents.",
        options: [
          { id: "A", text: "was already extinguished" },
          { id: "B", text: "had already been extinguished" },
          { id: "C", text: "has already extinguished" },
          { id: "D", text: "is extinguishing" },
          { id: "E", text: "extinguished" },
        ],
        correctAnswer: "B",
        explanation: "'By the time + Past Simple' бүтэцтэй тул урд талын үйлдэл бүрэн дууссан (Past Perfect) бөгөөд гал өөрөө унтраагдсан тул Passive хэлбэртэй 'had been extinguished' зөв.",
      },
      {
        question: "Look at those dark grey storm clouds! It ________ rain any minute now.",
        options: [
          { id: "A", text: "will" },
          { id: "B", text: "is going to" },
          { id: "C", text: "is raining" },
          { id: "D", text: "shall" },
          { id: "E", text: "rains" },
        ],
        correctAnswer: "B",
        explanation: "Нүдэнд харагдаж буй бодит баримтад (dark storm clouds) тулгуурласан гарцаагүй ирээдүйн таамаглалд 'be going to' хэрэглэнэ.",
      },
      {
        question: "Batu ________ in Darkhan since his family moved there ten years ago.",
        options: [
          { id: "A", text: "lives" },
          { id: "B", text: "lived" },
          { id: "C", text: "has lived" },
          { id: "D", text: "was living" },
          { id: "E", text: "is living" },
        ],
        correctAnswer: "C",
        explanation: "'Since + Past Simple' (moved) өгүүлбэртэй хоршиж өнгөрснөөс эхлээд одоо хүртэл үргэлжилж буй үйл явдлыг Present Perfect (has lived) илэрхийлнэ.",
      },
      {
        question: "While the students ________ the grammar test, the electricity suddenly went out.",
        options: [
          { id: "A", text: "took" },
          { id: "B", text: "were taking" },
          { id: "C", text: "had taken" },
          { id: "D", text: "have been taking" },
          { id: "E", text: "are taking" },
        ],
        correctAnswer: "B",
        explanation: "'While'-ийн ард өнгөрсөнд үргэлжилж байсан урт үйл явц Past Continuous (were taking), түүний дундуур тасалсан богино үйлдэл Past Simple (went out) байна.",
      },
      {
        question: "I ________ this famous novel twice already, but I still enjoy reading it.",
        options: [
          { id: "A", text: "have read" },
          { id: "B", text: "read" },
          { id: "C", text: "am reading" },
          { id: "D", text: "had read" },
          { id: "E", text: "will read" },
        ],
        correctAnswer: "A",
        explanation: "'Twice already' түлхүүр үг нь одоо хүртэлх туршлагыг зааж байгаа тул Present Perfect (have read) тохирно.",
      },
      {
        question: "By the end of next month, our engineering team ________ the new suspension bridge.",
        options: [
          { id: "A", text: "will complete" },
          { id: "B", text: "will have completed" },
          { id: "C", text: "completes" },
          { id: "D", text: "is completing" },
          { id: "E", text: "has completed" },
        ],
        correctAnswer: "B",
        explanation: "'By + ирээдүйн хугацаа' (by the end of next month) нь Future Perfect буюу 'will have completed' бүтцийг шаарддаг.",
      },
      {
        question: "My grandfather ________ in a coal mining corporation for 35 years before he retired in 2019.",
        options: [
          { id: "A", text: "has worked" },
          { id: "B", text: "works" },
          { id: "C", text: "had worked" },
          { id: "D", text: "is working" },
          { id: "E", text: "has been working" },
        ],
        correctAnswer: "C",
        explanation: "Тэтгэвэртээ гарахаас (retired in 2019) өмнө 35 жил ажиллаж дууссан тул өнгөрсний өмнөх үйл явдал буюу Past Perfect (had worked) болно.",
      },
      {
        question: "Listen! The school choir ________ the national anthem in the auditorium.",
        options: [
          { id: "A", text: "sings" },
          { id: "B", text: "is singing" },
          { id: "C", text: "sang" },
          { id: "D", text: "has sung" },
          { id: "E", text: "will sing" },
        ],
        correctAnswer: "B",
        explanation: "'Listen!' анхааруулах үг нь яг одоо сонсогдож буй үйлдэл тул Present Continuous (is singing) шаардана.",
      },
      {
        question: "Archaeologists ________ ancient pottery in this valley three years ago.",
        options: [
          { id: "A", text: "have discovered" },
          { id: "B", text: "discovered" },
          { id: "C", text: "had discovered" },
          { id: "D", text: "discover" },
          { id: "E", text: "were discovered" },
        ],
        correctAnswer: "B",
        explanation: "'Three years ago' гэсэн тодорхой өнгөрсөн цаг заасан тул Present Perfect биш Past Simple (discovered) зөв.",
      },
      {
        question: "At 8 PM tomorrow evening, we ________ the final match of the World Cup.",
        options: [
          { id: "A", text: "will watch" },
          { id: "B", text: "will be watching" },
          { id: "C", text: "watch" },
          { id: "D", text: "have watched" },
          { id: "E", text: "are watched" },
        ],
        correctAnswer: "B",
        explanation: "Ирээдүйн тодорхой цаг мөчид (At 8 PM tomorrow) үргэлжилж байх үйл явдалд Future Continuous (will be watching) хэрэглэнэ.",
      },
    ],
  },

  // LESSON 2: CONDITIONALS & WISH CLAUSES
  {
    id: "les-g-2",
    track: "Grammar",
    category: "Grammar",
    order: 2,
    title: "2. Нөхцөлт Өгүүлбэрүүд (Conditionals Type 0, 1, 2, 3 & Mixed) & Wish Clauses",
    description: "If clauses, unless, as long as, provided that, and wish clauses-ийн бүрэн тайлбар, шалгалтын занганууд",
    isFree: true,
    durationMinutes: 40,
    summaryRule: "Type 0: Үнэн баримт (Present + Present). Type 1: Бодит ирээдүй (If Present, will V1). Type 2: Бодит бус одоо (If Past, would V1). Type 3: Бодит бус өнгөрсөн (If had V3, would have V3).",
    detailedContent: `Conditionals нь ЭЕШ-д жил бүр хамгийн багадаа 2-4 асуулт ирдэг маш чухал дүрэм юм.

1. ZERO CONDITIONAL (Байгалийн хууль, ерөнхий үнэн):
- Бүтэц: If / When + Present Simple, Present Simple
- Жишээ: If you heat ice, it melts. When water reaches 100°C, it boils.

2. FIRST CONDITIONAL (Бодит боломжтой ирээдүй):
- Бүтэц: If + Present Simple, will / can / may / should + V1
- Жишээ: If she studies diligently, she will pass the entrance exam with a high score.
- Анхаар: 'If'-тэй хэсэгт хэзээ ч 'will' ордоггүй! (If it will rain биш, If it rains).

3. SECOND CONDITIONAL (Одоо үеийн бодит бус төсөөлөл):
- Бүтэц: If + Past Simple (verb-ed/V2), would / could / might + V1
- Тэмдэглэл: 'Be' үйл үг бүх биен дээр 'were' болдог: "If I were you, I would take that opportunity."
- Жишээ: If I had enough money, I would buy that electric car today. (Гэвч одоо надад мөнгө алга).

4. THIRD CONDITIONAL (Өнгөрсөнд өнгөрсөн бодит бус нөхцөл, харамсал):
- Бүтэц: If + had + V3 (Past Perfect), would / could / might + have + V3
- Жишээ: If we had caught the 7:00 express train, we wouldn't have missed the interview. (Гэвч бид амжаагүй, ярилцлагаасаа хоцорсон).

5. UNLESS (= IF NOT):
- 'Unless' нь өөрөө сөрөг утгатай тул түүний дараах өгүүлбэрт дахин 'not' ордоггүй!
- Жишээ: You won't enter the examination hall unless you show your official registration card. (= If you do not show...).

6. WISH CLAUSES (Хүсэл, харамсал илэрхийлэх):
- Одоо үед өөр байхыг хүсэх: I wish + Past Simple (I wish I knew the answer).
- Өнгөрсөнд болсон зүйлд харамсах: I wish + Past Perfect (I wish I had studied harder for yesterday's exam).
- Ирээдүйд бухимдал, өөрчлөлт хүсэх: I wish + would + V1 (I wish the rain would stop).`,
    tables: [
      {
        title: "Нөхцөлт Өгүүлбэрийн 4 Төрлийн Харьцуулсан Хүснэгт",
        headers: ["Төрөл", "Нөхцөл (If clause)", "Үр дүн (Main clause)", "Утга санаа (Meaning)"],
        rows: [
          ["Type 0", "If + Present Simple", "Present Simple", "Байгалийн хууль, байнга үнэн баримт"],
          ["Type 1", "If + Present Simple", "will / won't + V1", "Ирээдүйд болох бодит магадлал"],
          ["Type 2", "If + Past Simple (were)", "would / could + V1", "Одоо үеийн бодит бус төсөөлөл, мөрөөдөл"],
          ["Type 3", "If + had + V3", "would have + V3", "Өнгөрсөнд өнгөрсөн харамсал, өөрчлөх боломжгүй"],
        ],
      },
    ],
    tips: [
      "Шалгалтын Tip: Main clause-д 'would have + V3' харвал If clause-д заавал 'had + V3' сонгоно.",
      "If I WERE you гэдэг зөвлөгөө нь Type 2-ын хамгийн олон давтагддаг занга тест юм.",
      "Unless-ийн араас шууд эерэг үйл үг ордог (Unless you study, NOT unless you don't study).",
    ],
    quizQuestions: [
      {
        question: "If the government ________ more investments in public schools, literacy rates would improve significantly.",
        options: [
          { id: "A", text: "makes" },
          { id: "B", text: "made" },
          { id: "C", text: "had made" },
          { id: "D", text: "will make" },
          { id: "E", text: "has made" },
        ],
        correctAnswer: "B",
        explanation: "Үр дүнгийн өгүүлбэрт 'would improve' (would + V1) байгаа тул энэ нь Second Conditional бөгөөд If-тэй хэсэгт Past Simple (made) орно.",
      },
      {
        question: "If we had reserved our airline tickets two months ago, we ________ so much money on the trip.",
        options: [
          { id: "A", text: "wouldn't spend" },
          { id: "B", text: "wouldn't have spent" },
          { id: "C", text: "hadn't spent" },
          { id: "D", text: "won't spend" },
          { id: "E", text: "didn't spend" },
        ],
        correctAnswer: "B",
        explanation: "If хэсэгт 'had reserved' (had + V3) байгаа тул Third Conditional-ийн бүтэц ёсоор нөгөө талд 'would have + V3' буюу 'wouldn't have spent' орно.",
      },
      {
        question: "You cannot enter the laboratory ________ you are wearing protective goggles and a lab coat.",
        options: [
          { id: "A", text: "if" },
          { id: "B", text: "unless" },
          { id: "C", text: "provided" },
          { id: "D", text: "as long as" },
          { id: "E", text: "supposing" },
        ],
        correctAnswer: "B",
        explanation: "'Unless' нь 'if not' буюу 'хамгаалалтын шил өмсөөгүй л бол орж болохгүй' гэсэн утга илэрхийлж байна.",
      },
      {
        question: "If I ________ in your position, I would consult with the academic advisor before dropping the course.",
        options: [
          { id: "A", text: "am" },
          { id: "B", text: "was" },
          { id: "C", text: "were" },
          { id: "D", text: "have been" },
          { id: "E", text: "had been" },
        ],
        correctAnswer: "C",
        explanation: "Second Conditional-д 'If I were you / If I were in your position' гэж 'were' хэлбэрийг албан дүрмээр хэрэглэдэг.",
      },
      {
        question: "I wish I ________ more attention to the teacher's explanation during yesterday's physics lecture.",
        options: [
          { id: "A", text: "paid" },
          { id: "B", text: "had paid" },
          { id: "C", text: "would pay" },
          { id: "D", text: "have paid" },
          { id: "E", text: "pay" },
        ],
        correctAnswer: "B",
        explanation: "Өнгөрсөнд болсон үйл явдалд (yesterday's lecture) харамсаж хүсэхэд 'wish + had + V3' буюу Past Perfect хэрэглэнэ.",
      },
      {
        question: "If you mix blue and yellow paint, you ________ green.",
        options: [
          { id: "A", text: "get" },
          { id: "B", text: "got" },
          { id: "C", text: "would get" },
          { id: "D", text: "had got" },
          { id: "E", text: "would have got" },
        ],
        correctAnswer: "A",
        explanation: "Байгалийн хууль, үнэн баримтыг зааж буй Zero Conditional тул хоёр тал хоёулаа Present Simple (mix -> get) байна.",
      },
      {
        question: "Provided that the weather ________ pleasant tomorrow, we will organize an outdoor picnic.",
        options: [
          { id: "A", text: "is" },
          { id: "B", text: "will be" },
          { id: "C", text: "was" },
          { id: "D", text: "were" },
          { id: "E", text: "had been" },
        ],
        correctAnswer: "A",
        explanation: "'Provided that' нь 'if'-тэй адил нөхцөл заах холбоос бөгөөд First Conditional-д Present Simple (is) авна.",
      },
      {
        question: "She ________ the national scholarship if she hadn't made that simple arithmetic error in the final round.",
        options: [
          { id: "A", text: "would win" },
          { id: "B", text: "would have won" },
          { id: "C", text: "will win" },
          { id: "D", text: "wins" },
          { id: "E", text: "had won" },
        ],
        correctAnswer: "B",
        explanation: "Өнгөрсөн үйл явдлын харамсал тул Third Conditional: would have won.",
      },
      {
        question: "If it ________ heavily tomorrow morning, the sports tournament will be postponed.",
        options: [
          { id: "A", text: "rains" },
          { id: "B", text: "will rain" },
          { id: "C", text: "rained" },
          { id: "D", text: "would rain" },
          { id: "E", text: "had rained" },
        ],
        correctAnswer: "A",
        explanation: "First conditional-д if-тэй өгүүлбэрт will ордоггүй, Present Simple (rains) хэрэглэнэ.",
      },
      {
        question: "I wish our apartment ________ closer to the city center; it takes me an hour to commute every morning.",
        options: [
          { id: "A", text: "is" },
          { id: "B", text: "were" },
          { id: "C", text: "had been" },
          { id: "D", text: "will be" },
          { id: "E", text: "has been" },
        ],
        correctAnswer: "B",
        explanation: "Одоогийн бодит бус байдлыг хүсэхэд wish + Past Simple (were) хэрэглэнэ.",
      },
    ],
  },

  // LESSON 3: PASSIVE VOICE & CAUSATIVE
  {
    id: "les-g-3",
    track: "Grammar",
    category: "Grammar",
    order: 3,
    title: "3. Идэвхгүй Хэв (Passive Voice) & Causative Verbs (Have/Get done)",
    description: "Бүх 12 цагийн Passive хувиргал, Modal Passive, байцаагч төлөөний үгс ба Causative дүрэм",
    isFree: true,
    durationMinutes: 35,
    summaryRule: "Passive Voice = Be + Past Participle (V3). Causative: have/get + object + V3 (өөрийн гараар биш бусдаар хийлгэх).",
    detailedContent: `Идэвхгүй хэв (Passive Voice) нь үйлдэл хийгчээс илүү тухайн үйлдэл өөрөө чухал, эсвэл үйлдэгч тодорхойгүй үед хэрэглэгддэг.

1. БҮХ ЦАГИЙН PASSIVE ХУВИРГАЛЫН ТОЛЬ:
- Present Simple: am/is/are + V3 (English is spoken worldwide)
- Present Continuous: am/is/are + being + V3 (The road is being paved right now)
- Present Perfect: have/has + been + V3 (The new policy has been approved)
- Past Simple: was/were + V3 (The monument was built in 1911)
- Past Continuous: was/were + being + V3 (The car was being washed when it started raining)
- Past Perfect: had + been + V3 (The problem had been solved before the meeting)
- Future Simple: will be + V3 (The results will be announced tomorrow)
- Modal Verbs: modal (can/must/should) + be + V3 (Rules must be obeyed)

2. CAUSATIVE VERBS (Бусдаар үйлдэл хийлгэх):
- have + object + V3: "I had my hair cut." (Би үсээ засуулсан - өөрөө хайчлаагүй).
- get + object + V3: "She got her car repaired." (Тэр машинаа засуулсан).
- have + person + V1: "The teacher had the students write an essay." (Багш сурагчдаар эссэ бичүүлсэн).
- get + person + to V1: "She got her brother to clean the garage." (Тэр ахыгаа ятгаж гарааш цэвэрлүүлсэн).`,
    tables: [
      {
        title: "Идэвхгүй Хэвийн Гол Цагуудын Бүтэц",
        headers: ["Цагийн нэр", "Идэвхтэй (Active)", "Идэвхгүй (Passive)", "Жишээ өгүүлбэр"],
        rows: [
          ["Present Simple", "makes / make", "is/are made", "This cheese is made in Switzerland."],
          ["Present Cont.", "is making", "is being made", "A new bridge is being constructed now."],
          ["Past Simple", "painted", "was/were painted", "The Mona Lisa was painted by Da Vinci."],
          ["Present Perfect", "has cleaned", "has been cleaned", "The room has just been cleaned."],
          ["Past Perfect", "had destroyed", "had been destroyed", "The city had been destroyed before relief came."],
          ["Modal Verbs", "must clean", "must be cleaned", "All documents must be signed."],
        ],
      },
    ],
    tips: [
      "Continuous Passive-ийн ялгах гол тэмдэг бол 'BEING' үг юм (is being built).",
      "Perfect Passive-ийн ялгах гол тэмдэг бол 'BEEN' үг юм (has been built).",
      "Шалгалтад 'had his car stolen' (машинаа хулгайд алдсан) гэх мэт causative бүтэц байнга ирдэг.",
    ],
    quizQuestions: [
      {
        question: "The historic manuscript ________ by international researchers in the national library last month.",
        options: [
          { id: "A", text: "was examined" },
          { id: "B", text: "is examined" },
          { id: "C", text: "examined" },
          { id: "D", text: "has been examined" },
          { id: "E", text: "was examining" },
        ],
        correctAnswer: "A",
        explanation: "'Last month' гэсэн өнгөрсөн цаг заасан бөгөөд гар бичмэл судлагдсан (Passive) тул 'was examined' болно.",
      },
      {
        question: "A state-of-the-art sports complex ________ in the southern district right now.",
        options: [
          { id: "A", text: "is built" },
          { id: "B", text: "is being built" },
          { id: "C", text: "has built" },
          { id: "D", text: "was built" },
          { id: "E", text: "builds" },
        ],
        correctAnswer: "B",
        explanation: "'Right now' тул Present Continuous бөгөөд цогцолбор баригдаж байгаа тул 'is being built' тохирно.",
      },
      {
        question: "Mrs. Sarah had her wedding dress ________ by a renowned local fashion designer.",
        options: [
          { id: "A", text: "design" },
          { id: "B", text: "designed" },
          { id: "C", text: "designing" },
          { id: "D", text: "to design" },
          { id: "E", text: "designs" },
        ],
        correctAnswer: "B",
        explanation: "Causative бүтэц: have + object (wedding dress) + V3 (designed) буюу бусдаар оёулсан гэсэн утга.",
      },
      {
        question: "All mobile phones and smart watches must ________ before entering the exam room.",
        options: [
          { id: "A", text: "turn off" },
          { id: "B", text: "be turned off" },
          { id: "C", text: "turned off" },
          { id: "D", text: "being turned off" },
          { id: "E", text: "been turned off" },
        ],
        correctAnswer: "B",
        explanation: "Modal passive: must + be + V3 (must be turned off).",
      },
      {
        question: "The damaged bridge ________ before the winter snowstorms began.",
        options: [
          { id: "A", text: "had been repaired" },
          { id: "B", text: "was repairing" },
          { id: "C", text: "repaired" },
          { id: "D", text: "has been repaired" },
          { id: "E", text: "is repaired" },
        ],
        correctAnswer: "A",
        explanation: "Цасан шуурга эхлэхээс (began) өмнө гүүр засагдсан тул Past Perfect Passive (had been repaired) зөв.",
      },
      {
        question: "Millions of greeting cards ________ around the world every holiday season.",
        options: [
          { id: "A", text: "are sent" },
          { id: "B", text: "send" },
          { id: "C", text: "are sending" },
          { id: "D", text: "were sent" },
          { id: "E", text: "have sent" },
        ],
        correctAnswer: "A",
        explanation: "Байнга давтагддаг үйлдэл (every holiday season) тул Present Simple Passive (are sent).",
      },
      {
        question: "He got his younger brother ________ the lawn this Saturday morning.",
        options: [
          { id: "A", text: "mow" },
          { id: "B", text: "to mow" },
          { id: "C", text: "mowed" },
          { id: "D", text: "mowing" },
          { id: "E", text: "mows" },
        ],
        correctAnswer: "B",
        explanation: "Causative 'get + person + to V1' дүрэм: got his brother to mow.",
      },
      {
        question: "The stolen jewelry ________ by the detectives yesterday evening.",
        options: [
          { id: "A", text: "was found" },
          { id: "B", text: "found" },
          { id: "C", text: "has been found" },
          { id: "D", text: "is found" },
          { id: "E", text: "was finding" },
        ],
        correctAnswer: "A",
        explanation: "Өнгөрсөн цаг 'yesterday evening' ба эд зүйл олдсон тул was found.",
      },
      {
        question: "The official conference agenda ________ to all participants next Monday.",
        options: [
          { id: "A", text: "will be distributed" },
          { id: "B", text: "will distribute" },
          { id: "C", text: "is distributing" },
          { id: "D", text: "distributes" },
          { id: "E", text: "was distributed" },
        ],
        correctAnswer: "A",
        explanation: "Future Simple Passive: will be + V3 (will be distributed).",
      },
      {
        question: "The candidate's resume ________ by the committee yet.",
        options: [
          { id: "A", text: "hasn't been reviewed" },
          { id: "B", text: "wasn't reviewed" },
          { id: "C", text: "isn't reviewing" },
          { id: "D", text: "hadn't reviewed" },
          { id: "E", text: "won't review" },
        ],
        correctAnswer: "A",
        explanation: "'Yet' түлхүүр үг нь Present Perfect сөрөг хэлбэрийг шаарддаг: hasn't been reviewed.",
      },
    ],
  },

  // LESSON 4: REPORTED SPEECH
  {
    id: "les-g-4",
    track: "Grammar",
    category: "Grammar",
    order: 4,
    title: "4. Шууд Бус Яриа (Reported Speech) & Цаг Ухрах Дүрэм",
    description: "Хүүрнэх, асуух (if/whether), тушаах өгүүлбэрийн хувиргал, цаг болон байршлын үгс өөрчлөгдөх зүй тогтол",
    isFree: false,
    durationMinutes: 30,
    summaryRule: "Дамжуулах үйл үг өнгөрсөнд (said, told) байвал: Present -> Past, Past Simple -> Past Perfect, will -> would, can -> could.",
    detailedContent: `Reported Speech буюу шууд бус яриа нь хэн нэгний хэлсэн үгийг гуравдагч этгээдэд дамжуулах дүрэм юм.

1. ЦАГ НЭГ ШАТ УХРАХ ДҮРЭМ (Backshift):
- Present Simple -> Past Simple (work -> worked)
- Present Continuous -> Past Continuous (is working -> was working)
- Present Perfect / Past Simple -> Past Perfect (has worked / worked -> had worked)
- will -> would | can -> could | may -> might | must -> had to

2. ЦАГ ХУГАЦАА, БАЙРШЛЫН ҮГСИЙН ӨӨРЧЛӨЛТ:
- now -> then | today -> that day | yesterday -> the day before (the previous day)
- tomorrow -> the next day (the following day) | last week -> the week before
- here -> there | this -> that | these -> those | ago -> before

3. АСУУХ ӨГҮҮЛБЭРИЙН ХУВИРГАЛ:
- Yes/No questions: if / whether + Subject + Verb (хүүрнэх дараалалтай болдог!).
- Wh-questions: wh-word + Subject + Verb (Where did you go? -> She asked where I had gone).

4. ТУШААХ, ГУЙХ ӨГҮҮЛБЭР (Commands / Requests):
- told / ordered / asked + object + to V1 (эсвэл not to V1).
- "Don't touch that!" -> The guard warned us not to touch that.`,
    tables: [
      {
        title: "Шууд ба Шууд Бус Ярианы Түлхүүр Үгсийн Толь",
        headers: ["Шууд яриа (Direct)", "Шууд бус яриа (Reported)", "Жишээ хувиргал"],
        rows: [
          ["now", "then / at that time", "'I am busy now' -> He said he was busy then."],
          ["today", "that day", "'I will come today' -> She said she would come that day."],
          ["yesterday", "the day before / previous day", "'I saw him yesterday' -> He said he had seen him the day before."],
          ["tomorrow", "the next / following day", "'I will travel tomorrow' -> She said she would travel the next day."],
          ["here", "there", "'Wait here' -> He told me to wait there."],
        ],
      },
    ],
    tips: [
      "Шалгалтын гол занга: Шууд бус асуултад асуух үгийн дараалал (Did you go биш) хүүрнэх дараалал (I had gone) болж өөрчлөгддөг!",
      "Say to me биш TOLD ME хэрэглэнэ (told-ийн араас шууд хүн ордог).",
    ],
    quizQuestions: [
      {
        question: "“Where did you buy this beautiful sweater?” Nora asked me.\nNora asked me where ________ that beautiful sweater.",
        options: [
          { id: "A", text: "did I buy" },
          { id: "B", text: "I had bought" },
          { id: "C", text: "had I bought" },
          { id: "D", text: "I bought" },
          { id: "E", text: "have I bought" },
        ],
        correctAnswer: "B",
        explanation: "Шууд бус асуултад хүүрнэх дараалал (where + I) болж, Past Simple нь Past Perfect (had bought) болж ухарна.",
      },
      {
        question: "“I will call you tomorrow morning,” James promised.\nJames promised that he ________ me the following morning.",
        options: [
          { id: "A", text: "will call" },
          { id: "B", text: "would call" },
          { id: "C", text: "called" },
          { id: "D", text: "calls" },
          { id: "E", text: "had called" },
        ],
        correctAnswer: "B",
        explanation: "Шууд ярианы 'will' нь дамжуулахад 'would' болж хувирна.",
      },
      {
        question: "“Don't open the window because of the blizzard,” the teacher said to us.\nThe teacher told us ________ the window because of the blizzard.",
        options: [
          { id: "A", text: "to not open" },
          { id: "B", text: "not to open" },
          { id: "C", text: "didn't open" },
          { id: "D", text: "don't open" },
          { id: "E", text: "not opening" },
        ],
        correctAnswer: "B",
        explanation: "Сөрөг тушаал гуйлтыг 'not to + V1' (not to open) гэж хувиргадаг.",
      },
      {
        question: "“Have you ever been to Altai Tavan Bogd?” asked the tour guide.\nThe tour guide inquired ________ to Altai Tavan Bogd.",
        options: [
          { id: "A", text: "if I had ever been" },
          { id: "B", text: "had I ever been" },
          { id: "C", text: "if have I ever been" },
          { id: "D", text: "that I was" },
          { id: "E", text: "whether did I go" },
        ],
        correctAnswer: "A",
        explanation: "Yes/No асуултад 'if / whether' + эзэн бие (I) + had ever been бүтэцтэй болно.",
      },
      {
        question: "“I am working on my bachelor thesis now,” Bolor stated.\nBolor stated that she ________ on her bachelor thesis then.",
        options: [
          { id: "A", text: "is working" },
          { id: "B", text: "was working" },
          { id: "C", text: "worked" },
          { id: "D", text: "had worked" },
          { id: "E", text: "has been working" },
        ],
        correctAnswer: "B",
        explanation: "Present Continuous (am working) нь Past Continuous (was working) болж ухарна.",
      },
      {
        question: "“I haven't completed the report yet,” said the accountant.\nThe accountant explained that he ________ the report yet.",
        options: [
          { id: "A", text: "hadn't completed" },
          { id: "B", text: "hasn't completed" },
          { id: "C", text: "didn't complete" },
          { id: "D", text: "doesn't complete" },
          { id: "E", text: "wouldn't complete" },
        ],
        correctAnswer: "A",
        explanation: "Present Perfect нь Past Perfect (hadn't completed) болж ухарна.",
      },
      {
        question: "He said to me, “Can you lend me your dictionary?”\nHe asked me if I ________ him my dictionary.",
        options: [
          { id: "A", text: "can lend" },
          { id: "B", text: "could lend" },
          { id: "C", text: "lent" },
          { id: "D", text: "will lend" },
          { id: "E", text: "am lending" },
        ],
        correctAnswer: "B",
        explanation: "'Can' нь ухарч 'could lend' болно.",
      },
      {
        question: "The police officer said to the driver, “Show me your driving license.”\nThe police officer ordered the driver ________ his driving license.",
        options: [
          { id: "A", text: "showed" },
          { id: "B", text: "to show" },
          { id: "C", text: "showing" },
          { id: "D", text: "that he show" },
          { id: "E", text: "to showing" },
        ],
        correctAnswer: "B",
        explanation: "Тушаалд 'ordered someone to V1' (to show) хэрэглэнэ.",
      },
      {
        question: "“We visited this national museum last month,” they told us.\nThey told us that they had visited that national museum ________.",
        options: [
          { id: "A", text: "last month" },
          { id: "B", text: "the month before" },
          { id: "C", text: "next month" },
          { id: "D", text: "the following month" },
          { id: "E", text: "a month ago" },
        ],
        correctAnswer: "B",
        explanation: "'Last month' нь шууд бус ярианд 'the month before' эсвэл 'the previous month' болж өөрчлөгддөг.",
      },
      {
        question: "“I must leave early,” she whispered.\nShe whispered that she ________ early.",
        options: [
          { id: "A", text: "must" },
          { id: "B", text: "had to leave" },
          { id: "C", text: "has to leave" },
          { id: "D", text: "will leave" },
          { id: "E", text: "would leave" },
        ],
        correctAnswer: "B",
        explanation: "Шууд ярианы 'must' нь өнгөрсөнд дамжуулагдахдаа 'had to' болж хувирдаг.",
      },
    ],
  },

  // LESSON 5: MODAL VERBS & PAST MODALS
  {
    id: "les-g-5",
    track: "Grammar",
    category: "Grammar",
    order: 5,
    title: "5. Модаль Үйл Үгс (Modal Verbs) & Past Modals (Must have, Should have, Could have)",
    description: "Боломж, үүрэг, таамаглал илэрхийлэх болон өнгөрсөн цагийн модаль бүтцүүдийн шалгалтын нарийн ялгаа",
    isFree: false,
    durationMinutes: 30,
    summaryRule: "Must have V3 = 99% гарцаагүй тэгсэн байх. Can't have V3 = огт тэгсэн байх боломжгүй. Should have V3 = тэгэх ёстой байсан боловч тэгээгүй (харамсал).",
    detailedContent: `Модаль үйл үгс нь яригчийн хандлага, магадлал, үүрэг хариуцлага, чадварыг илэрхийлдэг.

1. ОДОО БА ИРЭЭДҮЙН МОДАЛЬ:
- must: 100% заавал хийх үүрэг, эсвэл 95% баттай таамаглал (He must be at home; the lights are on).
- mustn't: Хатуу хориглосон утга (You mustn't smoke here).
- don't have to: Үүрэг шаардлагагүй, албагүй (You don't have to come if you are tired).
- should / ought to: Зөвлөгөө, ёс зүйн зөв үйлдэл.
- can / could: Чадвар ба зөвшөөрөл.

2. ӨНГӨРСӨН ЦАГИЙН МОДАЛЬ (PAST MODALS - ЭЕШ-ИЙН ГОЛ АСУУЛТ):
- must have + V3: Өнгөрсөнд гарцаагүй тийм зүйл болсон гэдэгт 99% итгэлтэй байх.
  Жишээ: The ground is wet. It must have rained last night.
- can't have / couldn't have + V3: Өнгөрсөнд тийм зүйл болсон байх ямар ч боломжгүй.
  Жишээ: He can't have stolen the money; he was with me all evening.
- should have + V3: Хийх ёстой байсан боловч хийгээгүй (харамсал, зэмлэл).
  Жишээ: You should have studied harder for the test.
- shouldn't have + V3: Хийх хэрэггүй байсан боловч хийчихсэн.
  Жишээ: You shouldn't have eaten so much junk food.
- could have + V3: Хийх боломж байсан ч хийгээгүй.
  Жишээ: I could have won the race, but I tripped near the finish line.`,
    tips: [
      "Mustn't (хориотой) болон Don't have to (хэрэггүй, албагүй)-ийн ялгаа дээр олон сурагч алддаг!",
      "Шалгалтын Tip: 'The door was locked from inside' гэсэн баримт байвал 'He couldn't have left through the door' сонгоно.",
    ],
    quizQuestions: [
      {
        question: "Look at the wet streets and puddles everywhere! It ________ heavily during the night.",
        options: [
          { id: "A", text: "must have rained" },
          { id: "B", text: "can't have rained" },
          { id: "C", text: "should have rained" },
          { id: "D", text: "must rain" },
          { id: "E", text: "should rain" },
        ],
        correctAnswer: "A",
        explanation: "Гудамж шалбаагтай байгаа нь шөнө бороо орсныг баттай гэрчилж байгаа тул 'must have rained' (өнгөрсөн баттай таамаг) зөв.",
      },
      {
        question: "You ________ so loud in the hospital corridor; patients are resting in their wards.",
        options: [
          { id: "A", text: "mustn't speak" },
          { id: "B", text: "don't have to speak" },
          { id: "C", text: "might not speak" },
          { id: "D", text: "needn't to speak" },
          { id: "E", text: "couldn't speak" },
        ],
        correctAnswer: "A",
        explanation: "Эмнэлэгт чанга ярихыг хатуу хориглох утга тул 'mustn't' тохирно.",
      },
      {
        question: "I ________ my warm winter jacket; the weather forecast was completely wrong and it's freezing today!",
        options: [
          { id: "A", text: "should have brought" },
          { id: "B", text: "must have brought" },
          { id: "C", text: "can't have brought" },
          { id: "D", text: "might bring" },
          { id: "E", text: "had to bring" },
        ],
        correctAnswer: "A",
        explanation: "Авчрах ёстой байсан боловч аваагүйдээ харамсаж буй тул 'should have brought'.",
      },
      {
        question: "Alex ________ the final examination; he only studied for half an hour yesterday!",
        options: [
          { id: "A", text: "can't have passed" },
          { id: "B", text: "must have passed" },
          { id: "C", text: "should pass" },
          { id: "D", text: "might pass" },
          { id: "E", text: "had passed" },
        ],
        correctAnswer: "A",
        explanation: "Хагасхан цаг бэлдсэн тул тэнцсэн байх ямар ч боломжгүй гэсэн утгаар 'can't have passed'.",
      },
      {
        question: "Tomorrow is a national holiday, so we ________ wake up early for school.",
        options: [
          { id: "A", text: "don't have to" },
          { id: "B", text: "mustn't" },
          { id: "C", text: "can't" },
          { id: "D", text: "shouldn't have" },
          { id: "E", text: "couldn't" },
        ],
        correctAnswer: "A",
        explanation: "Амралтын өдөр тул эрт босох шаардлагагүй (албагүй) гэсэн утгаар 'don't have to'.",
      },
      {
        question: "You ________ that confidential email to the whole department! Now everyone knows the secret.",
        options: [
          { id: "A", text: "shouldn't have forwarded" },
          { id: "B", text: "mustn't forward" },
          { id: "C", text: "couldn't forward" },
          { id: "D", text: "needn't forward" },
          { id: "E", text: "can't have forwarded" },
        ],
        correctAnswer: "A",
        explanation: "Илгээх хэрэггүй байсан боловч илгээчихсэн үйлдэлд зэмлэл илэрхийлэхэд 'shouldn't have forwarded'.",
      },
      {
        question: "He is wearing a physician's coat and a stethoscope. He ________ a doctor.",
        options: [
          { id: "A", text: "must be" },
          { id: "B", text: "can't be" },
          { id: "C", text: "should have been" },
          { id: "D", text: "could have been" },
          { id: "E", text: "need to be" },
        ],
        correctAnswer: "A",
        explanation: "Харагдаж буй шинж тэмдгээс үндэслэн одоо үед 95% итгэлтэй таамаглахад 'must be'.",
      },
      {
        question: "She ________ anywhere abroad yesterday because her passport was expired and locked in the safe.",
        options: [
          { id: "A", text: "couldn't have traveled" },
          { id: "B", text: "must have traveled" },
          { id: "C", text: "should have traveled" },
          { id: "D", text: "might travel" },
          { id: "E", text: "can travel" },
        ],
        correctAnswer: "A",
        explanation: "Паспорт нь хугацаа нь дууссан байсан тул ниссэн байх ямар ч боломжгүй: couldn't have traveled.",
      },
      {
        question: "You ________ take an umbrella with you; the sky is completely clear and sunny.",
        options: [
          { id: "A", text: "needn't" },
          { id: "B", text: "mustn't" },
          { id: "C", text: "can't" },
          { id: "D", text: "couldn't" },
          { id: "E", text: "should have" },
        ],
        correctAnswer: "A",
        explanation: "Нартай байгаа тул шүхэр авах шаардлагагүй (needn't + V1).",
      },
      {
        question: "I ________ you a lift to the airport if you had only told me you needed a ride.",
        options: [
          { id: "A", text: "could have given" },
          { id: "B", text: "must have given" },
          { id: "C", text: "should give" },
          { id: "D", text: "can give" },
          { id: "E", text: "give" },
        ],
        correctAnswer: "A",
        explanation: "Хэлсэн бол хүргээд өгөх боломж байсан (could have given).",
      },
    ],
  },

  // LESSON 6: INVERSION & ADVANCED GRAMMAR
  {
    id: "les-g-6",
    track: "Grammar",
    category: "Grammar",
    order: 6,
    title: "6. Хөмөрсөн Өгүүлбэр (Inversion), Холбоо үгс & Gerund vs Infinitive",
    description: "Never, Seldom, Hardly... when, Not only... but also хөмөрсөн бүтэц болон V-ing / to V1 сонголтууд",
    isFree: false,
    durationMinutes: 35,
    summaryRule: "Сөрөг үг өгүүлбэрийн эхэнд орвол үгийн дараалал асуух хэлбэрт шилждэг (Negative word + Auxiliary verb + Subject + Main verb).",
    detailedContent: `Энэ дүрэм нь ЭЕШ-ийн 750-800 онооны өндөр түвшний ялгагч асуултуудад байнга ирдэг.

1. INVERSION (ХӨМӨРСӨН ӨГҮҮЛБЭР):
Өгүүлбэрийг илүү утга төгөлдөр, онцлохын тулд сөрөг утгатай дайвар үгсийг өгүүлбэрийн эхэнд тавихад туслах үйл үг нь эзэн биеийнхээ урд гардаг.
- Seldom / Rarely / Never + auxiliary + S + V:
  "Never have I seen such a breathtaking view." (I have never seen... биш).
- Hardly / Scarcely + had + S + V3... WHEN + Past Simple:
  "Hardly had we arrived at the station when the train pulled away."
- No sooner + had + S + V3... THAN + Past Simple:
  "No sooner had the teacher entered the classroom than the students stopped talking."
- Not only + auxiliary + S + V... but also:
  "Not only did she win the gold medal, but she also broke the national record."
- Under no circumstances / On no account:
  "Under no circumstances should you share your password."

2. GERUND VS INFINITIVE:
- Үргэлж Gerund (-ing) авах үйл үгс: enjoy, avoid, consider, admit, deny, suggest, practice, look forward to, can't help, feel like.
- Үргэлж Infinitive (to V1) авах үйл үгс: decide, agree, plan, offer, refuse, manage, afford, hope, promise.
- Утга нь өөрчлөгддөг үйл үгс:
  - remember to do (хийхээ санах - үүрэг) vs remember doing (хийснээ санах - дурсамж).
  - stop to do (хийхийн тулд зогсох) vs stop doing (хийхээ бүрмөсөн болих).`,
    tips: [
      "Түлхүүр хослол: 'Hardly... WHEN' болон 'No sooner... THAN'. Шалгалтад than-ийг when-тэй сольж занга тавьдаг!",
      "Look forward to, be used to, object to-ийн 'to' нь угтвар үг тул араас нь заавал V-ing авна.",
    ],
    quizQuestions: [
      {
        question: "Seldom ________ such an inspiring and eloquent graduation speech.",
        options: [
          { id: "A", text: "have I heard" },
          { id: "B", text: "I have heard" },
          { id: "C", text: "I heard" },
          { id: "D", text: "did I heard" },
          { id: "E", text: "I had heard" },
        ],
        correctAnswer: "A",
        explanation: "Seldom өгүүлбэрийн эхэнд орсон тул Inversion: туслах үйл үг (have) + эзэн бие (I) + V3 (heard).",
      },
      {
        question: "No sooner had the lecture finished ________ the students rushed out to the cafeteria.",
        options: [
          { id: "A", text: "than" },
          { id: "B", text: "when" },
          { id: "C", text: "then" },
          { id: "D", text: "that" },
          { id: "E", text: "as" },
        ],
        correctAnswer: "A",
        explanation: "'No sooner... THAN' нь албан ёсны тогтсон хослол юм.",
      },
      {
        question: "Not only ________ the national championship, but he also broke the longstanding state record.",
        options: [
          { id: "A", text: "did he win" },
          { id: "B", text: "he won" },
          { id: "C", text: "he did win" },
          { id: "D", text: "won he" },
          { id: "E", text: "has he won" },
        ],
        correctAnswer: "A",
        explanation: "'Not only' эхэнд орсон тул Past Simple inversion: did + he + win.",
      },
      {
        question: "Under no circumstances ________ leave young children unattended near the swimming pool.",
        options: [
          { id: "A", text: "should you" },
          { id: "B", text: "you should" },
          { id: "C", text: "you must" },
          { id: "D", text: "ought you" },
          { id: "E", text: "you can" },
        ],
        correctAnswer: "A",
        explanation: "'Under no circumstances' нь сөрөг эхлэл тул 'should you' гэж хөмөрнө.",
      },
      {
        question: "The young suspect finally admitted ________ the bicycle from the school yard.",
        options: [
          { id: "A", text: "stealing" },
          { id: "B", text: "to steal" },
          { id: "C", text: "steal" },
          { id: "D", text: "stole" },
          { id: "E", text: "to stealing" },
        ],
        correctAnswer: "A",
        explanation: "'Admit' үйл үгийн араас заавал Gerund (stealing) ордог.",
      },
      {
        question: "We can't afford ________ on vacation abroad this summer due to inflation.",
        options: [
          { id: "A", text: "to go" },
          { id: "B", text: "going" },
          { id: "C", text: "go" },
          { id: "D", text: "gone" },
          { id: "E", text: "to going" },
        ],
        correctAnswer: "A",
        explanation: "'Afford' үйл үгийн араас Infinitive 'to go' заавал ордог.",
      },
      {
        question: "Please remember ________ the front door before you leave for school.",
        options: [
          { id: "A", text: "to lock" },
          { id: "B", text: "locking" },
          { id: "C", text: "lock" },
          { id: "D", text: "locked" },
          { id: "E", text: "to locking" },
        ],
        correctAnswer: "A",
        explanation: "Ирээдүйд хийх үүргийг сануулахад 'remember to do' (to lock) хэрэглэнэ.",
      },
      {
        question: "Hardly had I stepped outside the building ________ it began pouring with rain.",
        options: [
          { id: "A", text: "when" },
          { id: "B", text: "than" },
          { id: "C", text: "then" },
          { id: "D", text: "as" },
          { id: "E", text: "while" },
        ],
        correctAnswer: "A",
        explanation: "'Hardly had... WHEN' хослол нь 'дөнгөж ...магц' гэсэн утга илэрхийлдэг.",
      },
      {
        question: "I am really looking forward to ________ my grandparents in the countryside next week.",
        options: [
          { id: "A", text: "visiting" },
          { id: "B", text: "visit" },
          { id: "C", text: "visited" },
          { id: "D", text: "to visit" },
          { id: "E", text: "be visited" },
        ],
        correctAnswer: "A",
        explanation: "'Look forward to'-ийн араас үргэлж V-ing (visiting) ордог.",
      },
      {
        question: "The doctor advised my uncle to stop ________ cigarettes immediately.",
        options: [
          { id: "A", text: "smoking" },
          { id: "B", text: "to smoke" },
          { id: "C", text: "smoke" },
          { id: "D", text: "smoked" },
          { id: "E", text: "to smoking" },
        ],
        correctAnswer: "A",
        explanation: "Ямар нэгэн зуршлыг бүрмөсөн хаях утгаар 'stop + V-ing' (stop smoking) хэрэглэнэ.",
      },
    ],
  },

  // ==========================================
  // TRACK 2: VOCABULARY (ТӨРӨЛЖСӨН ҮГИЙН САН)
  // ==========================================
  {
    id: "les-v-1",
    track: "Vocabulary",
    category: "Vocabulary",
    order: 1,
    title: "1. Эрүүл Мэнд & Анагаах Ухаан (Health & Medicine Vocabulary)",
    description: "ЭЕШ-д ирдэг эмнэлэг, эрүүл амьдралын хэв маяг, өвчин, эмчилгээний түлхүүр үгс, синоним, антоним",
    isFree: true,
    durationMinutes: 30,
    summaryRule: "Эрүүл мэндийн сэдвээр өвчний шинж тэмдэг (symptoms), урьдчилан сэргийлэх (prevent), эмчилгээ (cure/remedy), тэнцвэртэй хооллолт (balanced diet) зэрэг холбоо үгсийг хамтад нь цээжилнэ.",
    detailedContent: `Эрүүл мэнд ба амьдралын хэв маягийн сэдэв нь ЭЕШ-ийн эх бичвэр (Reading) болон Vocabulary хэсэгт тогтмол ордог.

ГОЛ ҮГС БА ТАЙЛБАР:
1. Symptom (шинж тэмдэг) - a physical sign of illness (fever, cough).
2. Prescription (эмийн жор) - an official note written by a doctor for medicine.
3. Epidemic / Pandemic (халдварт өвчний дэгдэлт / цар тахал).
4. Balanced diet (тэнцвэртэй шим тэжээлтэй хооллолт).
5. Sedentary lifestyle (хөдөлгөөнгүй суугаа амьдралын хэв маяг).
6. Immune system (дархлааны тогтолцоо).
7. Infectious / Contagious (халдвартай).
8. Diagnose (оношлох) - diagnosis (онош).
9. Deteriorate (муудах, доройтох) vs Improve (сайжрах).
10. Chronic (архаг хууч) vs Acute (хурц, гэнэтийн).`,
    tables: [
      {
        title: "Эрүүл Мэндийн Сэдвийн Үгс, Синоним & Антоним Хүснэгт",
        headers: ["Үг (Word)", "Монгол утга", "Ойролцоо үг (Synonym)", "Эсрэг үг (Antonym)", "Холбоо үг (Collocation)"],
        rows: [
          ["Prescribe", "эмийн жор бичих", "order, authorize", "prohibit", "prescribe antibiotics"],
          ["Infectious", "халдвартай", "contagious, transmissible", "non-communicable", "infectious disease"],
          ["Sedentary", "суугаа, хөдөлгөөнгүй", "inactive, stationary", "active, dynamic", "sedentary lifestyle"],
          ["Deteriorate", "биеийн байдал муудах", "worsen, decline", "improve, recover", "health deteriorated"],
          ["Remedy", "эмчилгээ, арга хэрэгсэл", "cure, treatment", "toxin, poison", "natural remedy"],
          ["Chronic", "архаг хууч өвчин", "persistent, long-term", "acute, temporary", "chronic illness"],
        ],
      },
    ],
    tips: [
      "'Catch a cold' (ханиад хүрэх), 'run a fever' (халуурах), 'take medication' (эм уух) гэсэн хоршоо үгсийг асуултад шууд асуудаг.",
    ],
    quizQuestions: [
      {
        question: "Leading a ________ lifestyle without regular physical activity significantly increases the risk of heart disease.",
        options: [
          { id: "A", text: "sedentary" },
          { id: "B", text: "vigorous" },
          { id: "C", text: "nutritious" },
          { id: "D", text: "contagious" },
          { id: "E", text: "temporary" },
        ],
        correctAnswer: "A",
        explanation: "'Sedentary lifestyle' гэдэг нь суугаа, хөдөлгөөнгүй амьдралын хэв маягийг илэрхийлдэг академик нэр томьёо юм.",
      },
      {
        question: "What is the SYNONYM of the underlined word in: 'The patient's condition began to DETERIORATE overnight'?",
        options: [
          { id: "A", text: "worsen" },
          { id: "B", text: "improve" },
          { id: "C", text: "stabilize" },
          { id: "D", text: "recover" },
          { id: "E", text: "strengthen" },
        ],
        correctAnswer: "A",
        explanation: "'Deteriorate' нь муудах, доройтох гэсэн утгатай бөгөөд 'worsen'-тэй синоним болно.",
      },
      {
        question: "You cannot purchase these potent antibiotics without an official ________ signed by a certified physician.",
        options: [
          { id: "A", text: "prescription" },
          { id: "B", text: "subscription" },
          { id: "C", text: "description" },
          { id: "D", text: "inscription" },
          { id: "E", text: "receipt" },
        ],
        correctAnswer: "A",
        explanation: "Эмчийн бичиж өгдөг эмийн жорыг 'prescription' гэнэ.",
      },
      {
        question: "What is the ANTONYM of 'CHRONIC' in medical terminology?",
        options: [
          { id: "A", text: "Acute" },
          { id: "B", text: "Severe" },
          { id: "C", text: "Persistent" },
          { id: "D", text: "Incurable" },
          { id: "E", text: "Painful" },
        ],
        correctAnswer: "A",
        explanation: "'Chronic' (архаг, удаан үргэлжилсэн)-ийн эсрэг үг нь 'Acute' (хурц, богино хугацааны) юм.",
      },
      {
        question: "Drinking herbal tea with honey is a popular traditional ________ for a sore throat.",
        options: [
          { id: "A", text: "remedy" },
          { id: "B", text: "damage" },
          { id: "C", text: "illness" },
          { id: "D", text: "poison" },
          { id: "E", text: "allergy" },
        ],
        correctAnswer: "A",
        explanation: "'Natural remedy' гэдэг нь уламжлалт эмчилгээний арга, засал гэсэн утгатай.",
      },
      {
        question: "Regular exercise and fresh fruits help boost the human ________ to fight off seasonal viruses.",
        options: [
          { id: "A", text: "immune system" },
          { id: "B", text: "digestive organ" },
          { id: "C", text: "blood pressure" },
          { id: "D", text: "bone density" },
          { id: "E", text: "mental fatigue" },
        ],
        correctAnswer: "A",
        explanation: "Вирусээс хамгаалах бие махбодын дархлааг 'immune system' гэнэ.",
      },
      {
        question: "Measles and influenza are highly ________ diseases transmitted through air droplets.",
        options: [
          { id: "A", text: "contagious" },
          { id: "B", text: "curable" },
          { id: "C", text: "beneficial" },
          { id: "D", text: "harmless" },
          { id: "E", text: "sterile" },
        ],
        correctAnswer: "A",
        explanation: "Агаар дуслын замаар халдварладаг өвчнийг 'contagious' (халдвартай) гэнэ.",
      },
      {
        question: "The doctor spent thirty minutes conducting tests before she could ________ the exact illness.",
        options: [
          { id: "A", text: "diagnose" },
          { id: "B", text: "prescribe" },
          { id: "C", text: "infect" },
          { id: "D", text: "injure" },
          { id: "E", text: "vaccinate" },
        ],
        correctAnswer: "A",
        explanation: "Өвчнийг шинжилж тогтоох, оношлохыг 'diagnose' гэнэ.",
      },
      {
        question: "Nutritionists emphasize the vital importance of maintaining a ________ diet rich in proteins and vitamins.",
        options: [
          { id: "A", text: "balanced" },
          { id: "B", text: "heavy" },
          { id: "C", text: "sour" },
          { id: "D", text: "bitter" },
          { id: "E", text: "salty" },
        ],
        correctAnswer: "A",
        explanation: "Тэнцвэртэй хооллолтыг 'balanced diet' гэж нэрлэдэг.",
      },
      {
        question: "He had a high fever and felt shivers, which are common ________ of the seasonal flu.",
        options: [
          { id: "A", text: "symptoms" },
          { id: "B", text: "medicines" },
          { id: "C", text: "benefits" },
          { id: "D", text: "remedies" },
          { id: "E", text: "habits" },
        ],
        correctAnswer: "A",
        explanation: "Өвчний илрэх шинж тэмдгийг 'symptoms' гэнэ.",
      },
    ],
  },

  // LESSON 8: ENVIRONMENT & ECOLOGY
  {
    id: "les-v-2",
    track: "Vocabulary",
    category: "Vocabulary",
    order: 2,
    title: "2. Байгаль Орчин & Экологи (Environment & Climate Change)",
    description: "Уур амьсгалын өөрчлөлт, сэргээгдэх эрчим хүч, ховордсон амьтад, хог хаягдал ба байгаль хамгаалал",
    isFree: true,
    durationMinutes: 30,
    summaryRule: "ЭЕШ-ийн эх бичвэрүүдийн 40%-д байгаль орчны сэдэв ордог: Deforestation, Renewable energy, Endangered species, Carbon footprint.",
    detailedContent: `Байгаль орчны үгс нь ЭЕШ-ийн хамгийн түгээмэл үгсийн сан юм.

ГОЛ НЭР ТОМЬЁО:
1. Renewable energy (сэргээгдэх эрчим хүч - нар, салхи).
2. Fossil fuels (чулуужсан түлш - нүүрс, нефть).
3. Deforestation (ой модыг огтлох, устгах).
4. Endangered species (мөхөх аюулд орсон нэн ховордсон амьтан, ургамал).
5. Greenhouse effect & Global warming (хүлэмжийн хийн нөлөө ба дэлхийн дулаарал).
6. Carbon footprint (нүүрстөрөгчийн ул мөр).
7. Biodiversity (биологийн олон янз байдал).
8. Conservation (байгаль хамгаалал).
9. Contaminate / Pollute (бохирдуулах) - Pollutant (бохирдуулагч бодис).
10. Drought (ган гачиг) vs Flood (үер).`,
    tables: [
      {
        title: "Байгаль Орчны Сэдвийн Толь & Холбоо Үгс",
        headers: ["Үг (Word)", "Монгол тайлбар", "Синоним (Synonym)", "Эсрэг үг (Antonym)", "Жишээ холбоос"],
        rows: [
          ["Contaminate", "бохирдуулах", "pollute, taint", "purify, clean", "contaminate groundwater"],
          ["Endangered", "мөхөх аюулд орсон", "threatened, at risk", "abundant, thriving", "endangered species"],
          ["Renewable", "сэргээгдэх", "sustainable, inexhaustible", "finite, non-renewable", "renewable energy sources"],
          ["Preserve", "хадгалан хамгаалах", "conserve, protect", "destroy, neglect", "preserve wildlife habitats"],
          ["Drought", "ган гачиг", "arid spell, dry season", "flood, deluge", "suffer from severe drought"],
        ],
      },
    ],
    tips: [
      "'Fossil fuels' (нүүрс, газрын тос) болон 'Renewable energy' (нар, салхи)-ийн ялгааг асуусан контекст байнга ирдэг.",
    ],
    quizQuestions: [
      {
        question: "Solar and wind power are prominent examples of ________ energy that do not deplete natural resources.",
        options: [
          { id: "A", text: "renewable" },
          { id: "B", text: "exhaustible" },
          { id: "C", text: "harmful" },
          { id: "D", text: "fossil" },
          { id: "E", text: "artificial" },
        ],
        correctAnswer: "A",
        explanation: "Байгалийн нөөцийг шавхдаггүй цэвэр энергийг 'renewable energy' (сэргээгдэх эрчим хүч) гэнэ.",
      },
      {
        question: "Massive ________ in tropical rainforests destroys natural habitats and accelerates global warming.",
        options: [
          { id: "A", text: "deforestation" },
          { id: "B", text: "afforestation" },
          { id: "C", text: "cultivation" },
          { id: "D", text: "irrigation" },
          { id: "E", text: "conservation" },
        ],
        correctAnswer: "A",
        explanation: "Ой модыг их хэмжээгээр огтолж устгахыг 'deforestation' гэнэ.",
      },
      {
        question: "The snow leopard and the Gobi bear (Mazaalai) are classified as critically ________ species in Mongolia.",
        options: [
          { id: "A", text: "endangered" },
          { id: "B", text: "plentiful" },
          { id: "C", text: "domestic" },
          { id: "D", text: "abundant" },
          { id: "E", text: "ordinary" },
        ],
        correctAnswer: "A",
        explanation: "Нэн ховордож мөхөх аюулд орсон амьтдыг 'endangered species' гэж нэрлэдэг.",
      },
      {
        question: "Industrial factories were fined heavily for ________ toxic chemical waste into the river.",
        options: [
          { id: "A", text: "discharging" },
          { id: "B", text: "filtering" },
          { id: "C", text: "drinking" },
          { id: "D", text: "purifying" },
          { id: "E", text: "collecting" },
        ],
        correctAnswer: "A",
        explanation: "Хог хаягдлыг гол мөрөн рүү асгах, гадагшлуулахыг 'discharge' гэнэ.",
      },
      {
        question: "What is the ANTONYM of the word 'CONTAMINATE'?",
        options: [
          { id: "A", text: "Purify" },
          { id: "B", text: "Pollute" },
          { id: "C", text: "Poison" },
          { id: "D", text: "Spoil" },
          { id: "E", text: "Damage" },
        ],
        correctAnswer: "A",
        explanation: "'Contaminate' (бохирдуулах)-ийн эсрэг үг нь 'Purify' (цэвэршүүлэх, ариутгах) юм.",
      },
      {
        question: "Prolonged ________ has devastated agricultural crops and caused severe water shortages across the region.",
        options: [
          { id: "A", text: "drought" },
          { id: "B", text: "flood" },
          { id: "C", text: "tsunami" },
          { id: "D", text: "earthquake" },
          { id: "E", text: "avalanche" },
        ],
        correctAnswer: "A",
        explanation: "Удаан хугацааны хур тунадасгүй ган гачгийг 'drought' гэнэ.",
      },
      {
        question: "Individual citizens can reduce their ________ by using public bicycles instead of driving cars.",
        options: [
          { id: "A", text: "carbon footprint" },
          { id: "B", text: "social status" },
          { id: "C", text: "academic score" },
          { id: "D", text: "body weight" },
          { id: "E", text: "electric bill" },
        ],
        correctAnswer: "A",
        explanation: "Хүний үйл ажиллагаанаас үүдэлтэй нүүрстөрөгчийн ялгарлыг 'carbon footprint' гэнэ.",
      },
      {
        question: "The national park was established in 1975 to ________ the pristine natural beauty of the lake.",
        options: [
          { id: "A", text: "preserve" },
          { id: "B", text: "pollute" },
          { id: "C", text: "destroy" },
          { id: "D", text: "consume" },
          { id: "E", text: "neglect" },
        ],
        correctAnswer: "A",
        explanation: "Байгалийг онгон дагшин хэвээр нь хадгалан хамгаалахыг 'preserve' гэнэ.",
      },
      {
        question: "Burning ________ such as coal, oil, and gas releases tremendous amounts of CO2 into the atmosphere.",
        options: [
          { id: "A", text: "fossil fuels" },
          { id: "B", text: "solar cells" },
          { id: "C", text: "recycled plastic" },
          { id: "D", text: "organic compost" },
          { id: "E", text: "wind turbines" },
        ],
        correctAnswer: "A",
        explanation: "Нүүрс, газрын тос зэрэг чулуужсан түлшийг 'fossil fuels' гэж нэрлэдэг.",
      },
      {
        question: "The rich ________ of the Amazon river basin includes thousands of unique fish, insect, and bird species.",
        options: [
          { id: "A", text: "biodiversity" },
          { id: "B", text: "urbanization" },
          { id: "C", text: "degradation" },
          { id: "D", text: "depletion" },
          { id: "E", text: "pollution" },
        ],
        correctAnswer: "A",
        explanation: "Амьд байгалийн төрөл зүйлийн олон янз байдлыг 'biodiversity' гэнэ.",
      },
    ],
  },

  // LESSON 9: PHRASAL VERBS MASTERY
  {
    id: "les-pv-1",
    track: "Phrasal Verbs",
    category: "Phrasal Verbs",
    order: 1,
    title: "1. ЭЕШ-ийн Top 30 Хэллэг Үйл Үгс (Look, Take, Turn, Put, Give, Run)",
    description: "Look after, look up to, turn down, take off, put off, give up, run out of зэрэг хамгийн олон ирдэг хэллэгүүд",
    isFree: true,
    durationMinutes: 30,
    summaryRule: "Phrasal Verbs нь үйл үг + угтвар үг нийлж анхны утгаасаа огт өөр шилжсэн утга илэрхийлдэг тул бүхлээр нь контекстоор тогтооно.",
    detailedContent: `ЭЕШ-ийн шалгалтад хэллэг үйл үгсээс доод тал нь 3-5 асуулт заавал ирдэг.

ХАМГИЙН ЧУХАЛ ХЭЛЛЭГҮҮД:
1. TURN:
- turn down: татгалзах (refuse an offer); дууг нь намсгах.
- turn up: гэнэт гарч ирэх (arrive unexpectedly); дууг чангалах.
- turn into: болж хувирах (transform).
- turn off / on: унтраах / асаах.

2. LOOK:
- look after: асрах, халамжлах (take care of).
- look forward to (+ V-ing): тэсэн ядан хүлээх.
- look up to: хүндлэх, үлгэр дуурайл авах (admire, respect).
- look down on: басамжлах, дорд үзэх.
- look into: судлах, шалгах (investigate).

3. TAKE:
- take off: хувцас/гутал тайлах; онгоц хөөрөх; ажил амжилттай огцом өсөх.
- take after: удамших, дуурайх (resemble a parent).
- take up: шинэ хобби, спорт эхлүүлэх; зай эзлэх.
- take over: эрх мэдлийг гартаа авах (assume control).

4. PUT:
- put off: хойшлуулах (postpone).
- put up with: тэвчих, тэсэх (tolerate).
- put out: гал унтраах (extinguish a fire).
- put on: хувцас өмсөх; жин нэмэх.

5. RUN & GIVE:
- run out of: дуусах, барагдах (have none left).
- run into / come across: санамсаргүй таарах (meet by chance).
- give up: бууж өгөх, муу зуршлаа орхих (quit).
- give in: буулт хийх (surrender, yield).`,
    tables: [
      {
        title: "ЭЕШ-ийн Хамгийн Түгээмэл 10 Хэллэг Үйл Үг",
        headers: ["Хэллэг (Phrasal Verb)", "Англи синоним", "Монгол утга", "Шалгалтын жишээ"],
        rows: [
          ["Put off", "postpone, delay", "хойшлуулах", "Never put off until tomorrow what you can do today."],
          ["Put up with", "tolerate, bear", "тэвчих, тэсэх", "I cannot put up with this unbearable noise."],
          ["Look after", "take care of", "асрах, халамжлах", "She looks after her sick grandmother."],
          ["Look up to", "admire, respect", "хүндлэх, бишрэх", "Young athletes look up to Olympic champions."],
          ["Turn down", "reject, refuse", "татгалзах", "He turned down the generous scholarship offer."],
          ["Take after", "resemble, inherit", "эцэг эхээ дуурайх", "David takes after his father in musical talent."],
          ["Run out of", "exhaust supply", "дуусах, барагдах", "Our car ran out of fuel in the countryside."],
          ["Come across", "find by chance", "санамсаргүй таарах", "I came across an ancient coin while digging."],
          ["Take off", "depart, ascend", "онгоц хөөрөх, тайлах", "The airplane took off on schedule."],
          ["Give up", "quit, surrender", "орхих, бууж өгөх", "Never give up on your academic dreams."],
        ],
      },
    ],
    tips: [
      "'Put off' нь шалгалтын тестийн 'postpone' гэдэг үгтэй 100% синоним болж ирдэг.",
      "'Put out' бол гал унтраах (extinguish). Turn off бол гэрэл унтраах. Энэ хоёрыг бүү андуураарай!",
    ],
    quizQuestions: [
      {
        question: "Due to heavy rain and thunderstorm, the football match was ________ until next Saturday.",
        options: [
          { id: "A", text: "put off" },
          { id: "B", text: "put out" },
          { id: "C", text: "put up" },
          { id: "D", text: "put on" },
          { id: "E", text: "put through" },
        ],
        correctAnswer: "A",
        explanation: "'Put off' нь хойшлуулах (postpone) гэсэн утгатай.",
      },
      {
        question: "The brave firefighters worked for six hours to ________ the blaze in the commercial warehouse.",
        options: [
          { id: "A", text: "put out" },
          { id: "B", text: "put off" },
          { id: "C", text: "put down" },
          { id: "D", text: "put away" },
          { id: "E", text: "put in" },
        ],
        correctAnswer: "A",
        explanation: "Галыг унтраахад 'put out' (extinguish) хэрэглэнэ.",
      },
      {
        question: "I cannot ________ his rude and disrespectful comments during our class discussions anymore.",
        options: [
          { id: "A", text: "put up with" },
          { id: "B", text: "put out of" },
          { id: "C", text: "put off" },
          { id: "D", text: "put into" },
          { id: "E", text: "put forward" },
        ],
        correctAnswer: "A",
        explanation: "'Put up with' нь тэвчих, тэсэх (tolerate) гэсэн утгатай.",
      },
      {
        question: "Tim has blue eyes and blonde hair; he really ________ his mother's side of the family.",
        options: [
          { id: "A", text: "takes after" },
          { id: "B", text: "takes off" },
          { id: "C", text: "takes up" },
          { id: "D", text: "takes over" },
          { id: "E", text: "takes in" },
        ],
        correctAnswer: "A",
        explanation: "Эцэг эхээ царай төрх, зан аашаар дуурайх, удамшихыг 'take after' гэнэ.",
      },
      {
        question: "The international airplane ________ exactly at 10:30 AM without any delay.",
        options: [
          { id: "A", text: "took off" },
          { id: "B", text: "took down" },
          { id: "C", text: "took in" },
          { id: "D", text: "took up" },
          { id: "E", text: "took out" },
        ],
        correctAnswer: "A",
        explanation: "Онгоц газар дээрээс хөөрөхийг 'take off' гэнэ.",
      },
      {
        question: "She had to ________ the job offer because it required moving to another continent.",
        options: [
          { id: "A", text: "turn down" },
          { id: "B", text: "turn up" },
          { id: "C", text: "turn into" },
          { id: "D", text: "turn over" },
          { id: "E", text: "turn off" },
        ],
        correctAnswer: "A",
        explanation: "Саналаас эелдэгээр татгалзахыг 'turn down' (refuse) гэнэ.",
      },
      {
        question: "We were in the middle of preparing dinner when we discovered that we had ________ salt and oil.",
        options: [
          { id: "A", text: "run out of" },
          { id: "B", text: "run into" },
          { id: "C", text: "run away" },
          { id: "D", text: "run down" },
          { id: "E", text: "run over" },
        ],
        correctAnswer: "A",
        explanation: "Нөөц дуусах, барагдахыг 'run out of' гэнэ.",
      },
      {
        question: "All the pupils in our school ________ our chemistry teacher because of her fairness and vast knowledge.",
        options: [
          { id: "A", text: "look up to" },
          { id: "B", text: "look down on" },
          { id: "C", text: "look forward to" },
          { id: "D", text: "look into" },
          { id: "E", text: "look out" },
        ],
        correctAnswer: "A",
        explanation: "Хүндлэх, бишрэх, үлгэр жишээ авахыг 'look up to' (admire) гэнэ.",
      },
      {
        question: "While cleaning the old family attic, she ________ some black-and-white photographs from the 1940s.",
        options: [
          { id: "A", text: "came across" },
          { id: "B", text: "came out" },
          { id: "C", text: "came by" },
          { id: "D", text: "came along" },
          { id: "E", text: "came off" },
        ],
        correctAnswer: "A",
        explanation: "Санамсаргүй байдлаар таарах, олж харахыг 'come across' гэнэ.",
      },
      {
        question: "No matter how steep the mountain is, you should never ________ until you reach the summit.",
        options: [
          { id: "A", text: "give up" },
          { id: "B", text: "give away" },
          { id: "C", text: "give back" },
          { id: "D", text: "give off" },
          { id: "E", text: "give out" },
        ],
        correctAnswer: "A",
        explanation: "Бууж өгөх, зорилгоосоо няцахыг 'give up' гэнэ.",
      },
    ],
  },

  // ==========================================
  // TRACK 3: COMMUNICATION (ХАРИЛЦАН ЯРИА)
  // ==========================================
  {
    id: "les-c-1",
    track: "Communication",
    category: "Communication",
    order: 1,
    title: "1. ЭЕШ-ийн Харилцан Ярианы Ажиллах Аргачлал & Түгээмэл Хэллэгүүд",
    description: "Эелдэг гуйлт, санал тавих/татгалзах, гомдол гаргах, санал нийлэх, талархах ёсны занга даалгаврууд",
    isFree: true,
    durationMinutes: 30,
    summaryRule: "'Would you mind + V-ing?' асуултад зөвшөөрөхдөө 'Not at all / Of course not' гэж хариулдаг. Монгол хэлээр 'Цааргалах зүйлгүй ээ' гэсэн утга.",
    detailedContent: `ЭЕШ-ийн 40-45 дахь асуултууд нь өдөр тутмын болон албан харилцан яриа (Everyday & Functional English)-наас бүрддэг.

1. ЭЕЛДЭГ ГУЙЛТ БА ХАРИУЛТ:
- "Would you mind closing the door?" (Та хаалга хаавал цааргалахгүй биз?)
  -> Зөвшөөрөх: "Not at all, here let me do it." / "Sure, no problem."
  -> Татгалзах: "I'm sorry, but it's quite stuffy in here."
- "Could you give me a hand?" (Надад туслаач?)
  -> "Sure, what do you need?" / "Certainly!"

2. САНАЛ ТАВИХ БА ХАРИУЛАХ:
- "Why don't we go to the museum?" / "How about going to the museum?"
  -> Зөвшөөрөх: "That sounds like a wonderful idea!" / "I'd love to!"
  -> Татгалзах: "I'd love to, but I have to study for an exam."

3. ГОМДОЛ ГАРГАХ & ЭЕЛДЭГ ХАРИУ:
- "I am afraid there is a hair in my soup."
  -> Зөв хариу: "I am terribly sorry, sir. Let me bring you a fresh one right away."
  -> Буруу хариу: "It's not my fault" (хэзээ ч бүдүүлэг хувилбар сонгож болохгүй!).

4. САНАЛ НИЙЛЭХ БА ҮЛ НИЙЛЭХ:
- "I think public transport should be free."
  -> Бүрэн нийлэх: "I completely agree with you." / "I couldn't agree more!" (Би үүнээс илүү санал нийлж чадахгүй буюу 100% зөвшөөрч байна).
  -> Эелдэгээр зөрөх: "I see your point, but who will pay for it?"`,
    tables: [
      {
        title: "ЭЕШ Харилцан Ярианы Загвар Хүснэгт",
        headers: ["Нөхцөл байдал", "Асуулт / Санал", "Зөв хариулт (Correct response)", "Шалгалтын төөрөгдүүлэгч занга"],
        rows: [
          ["Эелдэг гуйлт", "Would you mind helping me?", "Not at all, I'd be glad to.", "Yes, I mind."],
          ["Санал", "Shall we take a taxi?", "Good idea, it's starting to rain.", "No, we shan't."],
          ["Баяр хүргэх", "I passed my state exam!", "Congratulations, you earned it!", "Never mind."],
          ["Уучлал хүсэх", "I'm sorry for stepping on your foot.", "Don't worry about it.", "You are welcome."],
          ["Талархал", "Thank you for the wonderful dinner.", "It was my pleasure!", "Please do."],
        ],
      },
    ],
    tips: [
      "'I couldn't agree more' гэдэг нь 'би огт нийлэхгүй байна' биш, харин 'би 100% бүрэн нийлж байна' гэсэн утгатай!",
    ],
    quizQuestions: [
      {
        question: "Colleague: “Would you mind sending me the updated spreadsheet before noon?”\nYou: “________. I will email it to you right away.”",
        options: [
          { id: "A", text: "Not at all" },
          { id: "B", text: "Yes, I would" },
          { id: "C", text: "Never you mind" },
          { id: "D", text: "I don't think so" },
          { id: "E", text: "You're welcome" },
        ],
        correctAnswer: "A",
        explanation: "'Would you mind...?' асуултад эелдэгээр зөвшөөрч туслахдаа 'Not at all' (Цааргалах зүйлгүй ээ) гэж хариулдаг.",
      },
      {
        question: "Friend: “Why don't we grab a cup of coffee and review our biology notes?”\nYou: “________! I really need some caffeine.”",
        options: [
          { id: "A", text: "That sounds like a splendid idea" },
          { id: "B", text: "Because I am busy" },
          { id: "C", text: "No, we don't grab" },
          { id: "D", text: "It's not your business" },
          { id: "E", text: "I don't coffee" },
        ],
        correctAnswer: "A",
        explanation: "Найзын саналд эерэгээр зөвшөөрөхөд 'That sounds like a splendid idea!' тохиромжтой.",
      },
      {
        question: "Guest: “I'm afraid the air conditioner in my room is making a loud buzzing noise.”\nHotel Receptionist: “________. I will send an engineer to inspect it right away.”",
        options: [
          { id: "A", text: "I am terribly sorry about the inconvenience, sir" },
          { id: "B", text: "That is none of our problem" },
          { id: "C", text: "Why don't you turn it off yourself" },
          { id: "D", text: "You should have known earlier" },
          { id: "E", text: "Congratulations on the room" },
        ],
        correctAnswer: "A",
        explanation: "Үйлчилгээний соёлд үйлчлүүлэгчийн гомдолд уучлал хүсэж шийдвэрлэх хариуг сонгоно.",
      },
      {
        question: "Speaker A: “In my opinion, learning a foreign language broadens one's cultural horizon.”\nSpeaker B: “________! It truly opens doors to different perspectives.”",
        options: [
          { id: "A", text: "I couldn't agree more" },
          { id: "B", text: "I couldn't agree less" },
          { id: "C", text: "I don't think so" },
          { id: "D", text: "I am afraid not" },
          { id: "E", text: "Never mind" },
        ],
        correctAnswer: "A",
        explanation: "'I couldn't agree more' нь 100% санал бүрэн нийлж буйг илэрхийлдэг хэллэг.",
      },
      {
        question: "Neighbor: “Thank you very much for watering my indoor plants while I was on vacation.”\nYou: “________! It was no trouble at all.”",
        options: [
          { id: "A", text: "My pleasure" },
          { id: "B", text: "Please yourself" },
          { id: "C", text: "Thanks too" },
          { id: "D", text: "Same to you" },
          { id: "E", text: "Nothing to do" },
        ],
        correctAnswer: "A",
        explanation: "Талархалд эелдэгээр хариулахад 'My pleasure' / 'You're very welcome' хэрэглэнэ.",
      },
      {
        question: "Passenger: “Excuse me, could you tell me which platform the train to Darkhan departs from?”\nStation Guard: “________. It's platform number 3 on your left.”",
        options: [
          { id: "A", text: "Certainly, sir" },
          { id: "B", text: "Yes, I could tell" },
          { id: "C", text: "No, you couldn't" },
          { id: "D", text: "Why do you ask" },
          { id: "E", text: "Don't mention it" },
        ],
        correctAnswer: "A",
        explanation: "Мэдээлэл лавлахад 'Certainly, sir' гэж эелдэгээр тусална.",
      },
      {
        question: "Student: “I just received an acceptance letter from the National University with a full scholarship!”\nTeacher: “________! Your hard work has truly paid off.”",
        options: [
          { id: "A", text: "Heartfelt congratulations" },
          { id: "B", text: "Better luck next time" },
          { id: "C", text: "Never mind that" },
          { id: "D", text: "Pardon me" },
          { id: "E", text: "Excuse yourself" },
        ],
        correctAnswer: "A",
        explanation: "Амжилтад баяр хүргэх соёл: 'Heartfelt congratulations!'.",
      },
      {
        question: "Host: “Would you like another slice of homemade apple pie?”\nGuest: “________. It's delicious, but I am completely full.”",
        options: [
          { id: "A", text: "No, thank you" },
          { id: "B", text: "Yes, I don't want" },
          { id: "C", text: "I hate it" },
          { id: "D", text: "Of course not" },
          { id: "E", text: "Never mind" },
        ],
        correctAnswer: "A",
        explanation: "Хоол цайнаас эелдэгээр татгалзахдаа 'No, thank you' гэж хэлнэ.",
      },
      {
        question: "A: “I am so clumsy! I accidentally spilled some tea on your notes.”\nB: “________. The handwriting is still perfectly legible.”",
        options: [
          { id: "A", text: "Don't worry about it" },
          { id: "B", text: "You must be sorry" },
          { id: "C", text: "Pay for it" },
          { id: "D", text: "My condolences" },
          { id: "E", text: "Excuse you" },
        ],
        correctAnswer: "A",
        explanation: "Уучлал хүсэхэд тайвшруулах үг: 'Don't worry about it' (Зүгээр дээ, санаа зоволтгүй).",
      },
      {
        question: "A: “How about having a quick Zoom meeting at 4 PM to finalize the project?”\nB: “________. I will send out the invitation link.”",
        options: [
          { id: "A", text: "That works perfectly for me" },
          { id: "B", text: "About 4 hours" },
          { id: "C", text: "I don't think Zoom" },
          { id: "D", text: "No, we don't have" },
          { id: "E", text: "Why 4 PM" },
        ],
        correctAnswer: "A",
        explanation: "Цаг товлоход зөвшөөрөх хариу: 'That works perfectly for me' (Энэ цаг надад яг таарна).",
      },
    ],
  },

  // ==========================================
  // TRACK 4: READING (УНШИЖ ОЙЛГОХ УР ЧАДВАР)
  // ==========================================
  {
    id: "les-r-1",
    track: "Reading",
    category: "Reading",
    order: 1,
    title: "1. ЭЕШ-ийн Унших Эх (Reading Comprehension) Дээр Ажиллах Мастер Хичээл",
    description: "Skimming, Scanning, асуултын 5 төрөл, төөрөгдүүлэгч занга, жинхэнэ эх бичвэр ба монгол дэлгэрэнгүй задлал",
    isFree: true,
    durationMinutes: 40,
    summaryRule: "Эхлээд эхийг биш асуултуудаа уншиж түлхүүр үгээ тогтооно. Параграф бүрийн эхний Topic sentence-ийг уншиж гол санааг олно (Skimming). Тоо, он сар, тусгай нэрсийг хурдан гүйлгэж хайна (Scanning).",
    detailedContent: `ЭЕШ-ийн 80 минутын хугацаанд 2 урт эх бичвэр дээр нийт 10-14 асуулт ирдэг. Энд нийт онооны бараг 25-30% төвлөрдөг.

1. УНШИХЫН АЛТАН ДҮРЭМ (3 АЛХАМ):
- Алхам 1: Эх бичвэрийг БҮХЭЛД НЬ шууд битгий унш! Эхлээд өгөгдсөн 5-6 асуултыг гүйлгэн уншиж, юу хайхаа (гол санаа, он сар, нэр үг, шалтгаан) мэдэж ав.
- Алхам 2: Догол мөр (paragraph) бүрийн ЭХНИЙ болон СҮҮЛЧИЙН өгүүлбэрийг гүйлгэн унш. Энэ нь тухайн параграфын гол санаа (Topic sentence)-г шууд хэлж өгнө.
- Алхам 3: Тодорхой баримт, он сар асуусан бол Scanning аргаар нүдээрээ гүйлгэн эх дээрээс харгалзах мөрийг нь олж доогуур нь зур.

2. АСУУЛТЫН ТӨРЛҮҮД БА АЖИЛЛАХ АРГА:
- Төрөл 1: Main Idea (Гол санаа) - Эхийн бүхэл бүтэн агуулгыг хамарсан хамгийн ерөнхий хувилбарыг сонгоно (Хэт нарийн нэг жижиг баримт сонгож болохгүй).
- Төрөл 2: Detail / Factual (Тодорхой баримт) - Эх дээрх үгийг шууд хайж олж харьцуулна.
- Төрөл 3: Negative / EXCEPT / NOT True - Эхэд байгаа 3 үнэн өгөгдлийг хасаж, дурдагдаагүй эсвэл худлыг сонгоно.
- Төрөл 4: Vocabulary in Context - "In line 8, the word 'X' is closest in meaning to...". Толь бичгийн ерөнхий утга биш, тухайн өгүүлбэрт орлуулан уншихад хамгийн их утга нийцэж буй үгийг сонгоно.
- Төрөл 5: Reference Pronoun - "The word 'they' in line 14 refers to...". Төлөөний үгийн яг өмнөх өгүүлбэр дэх олон тооны нэр үгийг олж шалгана.
- Төрөл 6: Inference (Далд утга, логик дүгнэлт) - Эхэд шууд бичээгүй ч өгөгдсөн баримтаас гарцаагүй үүсэх логик үнэнийг сонгоно.`,
    samplePassage: {
      title: "Sample ESH Reading Passage: The Mystery of Honeybee Communication",
      text: `[Line 1] For centuries, naturalists were baffled by how honeybees, possessing tiny brains, could coordinate complex foraging activities across vast distances. In the mid-20th century, Austrian biologist Karl von Frisch deciphered their unique language. He discovered that a successful foraging bee performs what is known as the "waggle dance" inside the dark hive to transmit crucial geographical information to her nestmates.

[Line 6] The dance consists of a figure-eight pattern. The orientation of the central waggle run in relation to the vertical honeycomb indicates the direction of the nectar source relative to the sun. Furthermore, the duration of the waggle phase communicates the precise distance: a longer dance signifies a more distant feeding site. By interpreting these intricate choreography signals, fellow bees can fly straight to food sources located several kilometers away without prior visual scouting.

[Line 12] However, modern researchers have discovered that environmental contaminants pose a grave threat to this communication system. Specifically, widely used agricultural pesticides impair the neurological faculties of worker bees, causing them to perform erratic dances or misunderstand distance signals. Consequently, hives suffer severe nutrient deficits as colonies fail to gather adequate nectar reserves for the winter months.`,
      translation: `Монгол орчуулга ба задлал: Зөгийнүүд өчүүхэн тархитай боловч хоол тэжээлийн байршлыг 'найгах бүжиг' (waggle dance)-ээр дамжуулан нарнаас хамаарсан чиглэл, зайг тодорхой мэдээлдэг тухай. Харин химийн пестицидүүд зөгийнүүдийн мэдрэлийг гэмтээж, бүжгийн занга дохиог замхруулж буй тухай тайлбарласан байна.`,
      passageAnalysis: `Параграф 1: Зөгийн бүжгийн нээлт (Karl von Frisch). Параграф 2: Бүжгийн чиглэл, зайг хэрхэн заадаг механизм. Параграф 3: Пестицид хэрхэн зөгийн харилцааг алдагдуулж буй аюул.`,
    },
    tips: [
      "80 минутаас 2 урт эхэд нийт 20-25 минут зарцуулна (нэг эхэд 10-12 минут).",
      "Хэрвээ нэг үгийг мэдэхгүй бол сандрах хэрэггүй, өмнөх болон дараах үгсийн утгаар баримжаална.",
    ],
    quizQuestions: [
      {
        question: "What is the primary topic of the second paragraph (Lines 6–11)?",
        options: [
          { id: "A", text: "The precise mechanism of how the waggle dance communicates direction and distance" },
          { id: "B", text: "The chemical composition of floral nectar" },
          { id: "C", text: "The historical biography of Karl von Frisch" },
          { id: "D", text: "The harmful effects of agricultural chemicals on honeybees" },
          { id: "E", text: "How honeybees construct hexagonal honeycomb cells" },
        ],
        correctAnswer: "A",
        explanation: "2-р параграф нь бүжгийн чиглэл, зайг нартай харьцуулан хэрхэн заадгийг (mechanism) нарийвчлан тайлбарласан байна.",
      },
      {
        question: "According to the passage, the DURATION of the waggle phase indicates:",
        options: [
          { id: "A", text: "How far away the food source is located" },
          { id: "B", text: "The exact sweetness of the flower nectar" },
          { id: "C", text: "The presence of dangerous predators near the hive" },
          { id: "D", text: "The current temperature inside the beehive" },
          { id: "E", text: "The age of the foraging worker bee" },
        ],
        correctAnswer: "A",
        explanation: "Эх бичвэрийн 8-р мөрөнд: 'the duration of the waggle phase communicates the precise distance' гэж тодорхой бичсэн байна.",
      },
      {
        question: "In line 13, the word 'IMPAIR' is closest in meaning to:",
        options: [
          { id: "A", text: "damage or weaken" },
          { id: "B", text: "improve or strengthen" },
          { id: "C", text: "observe or study" },
          { id: "D", text: "create or invent" },
          { id: "E", text: "protect or save" },
        ],
        correctAnswer: "A",
        explanation: "'Impair' нь гэмтээх, доройтуулах гэсэн утгатай үг бөгөөд 'damage or weaken'-тэй синоним болно.",
      },
      {
        question: "It can be INFERRED from the passage that if honeybees cannot communicate through their dance:",
        options: [
          { id: "A", text: "The entire colony may struggle to survive the winter due to food shortage" },
          { id: "B", text: "They will instantly switch to verbal human speech" },
          { id: "C", text: "Pesticides will automatically disappear from farmland" },
          { id: "D", text: "They will stop producing worker bees completely" },
          { id: "E", text: "They will fly exclusively at night" },
        ],
        correctAnswer: "A",
        explanation: "Сүүлийн өгүүлбэрт 'colonies fail to gather adequate nectar reserves for the winter months' гэсэн тул хоол тэжээлийн дутагдлаар өвөл амьд үлдэхэд хүндрэлтэй болно гэж логикоор дүгнэнэ.",
      },
      {
        question: "Which of the following is NOT mentioned in the passage about the waggle dance?",
        options: [
          { id: "A", text: "It relies on electromagnetic radio waves emitted by the queen bee" },
          { id: "B", text: "It consists of a figure-eight choreography pattern" },
          { id: "C", text: "It was deciphered by biologist Karl von Frisch" },
          { id: "D", text: "It takes place inside the dark hive on vertical honeycomb" },
          { id: "E", text: "It indicates direction relative to the position of the sun" },
        ],
        correctAnswer: "A",
        explanation: "Эх бичвэрт радио долгионы тухай огт дурдагдаагүй тул NOT mentioned сонголт нь A болно.",
      },
      {
        question: "In line 4, what does the pronoun 'HER' refer to?",
        options: [
          { id: "A", text: "A successful foraging bee" },
          { id: "B", text: "The sun" },
          { id: "C", text: "The queen bee exclusively" },
          { id: "D", text: "The flower petal" },
          { id: "E", text: "Karl von Frisch" },
        ],
        correctAnswer: "A",
        explanation: "4-р мөрний 'a successful foraging bee performs what is known as the waggle dance... to transmit information to her nestmates' өгүүлбэрт 'her' нь хоол олсон эмэгчин ажилчин зөгийг зааж байна.",
      },
      {
        question: "What is the author's primary tone in this passage?",
        options: [
          { id: "A", text: "Informative and scientific" },
          { id: "B", text: "Sarcastic and humorous" },
          { id: "C", text: "Furious and aggressive" },
          { id: "D", text: "Fictional and romantic" },
          { id: "E", text: "Pessimistic and hopeless" },
        ],
        correctAnswer: "A",
        explanation: "Бодит баримт, эрдэм шинжилгээний судалгаанд үндэслэсэн тул 'Informative and scientific' (шинжлэх ухаанч, мэдээлэл өгөх өнгө аяс) байна.",
      },
      {
        question: "According to the first paragraph, what baffled naturalists for centuries?",
        options: [
          { id: "A", text: "How bees with small brains could coordinate complex foraging across long distances" },
          { id: "B", text: "Why bees make hexagonal honeycombs" },
          { id: "C", text: "Why bees sting intruders" },
          { id: "D", text: "How honey tastes sweet" },
          { id: "E", text: "Where the queen bee sleeps" },
        ],
        correctAnswer: "A",
        explanation: "1-2-р мөрөнд бичсэнээр байгаль судлаачдын гайхлыг төрүүлж байсан зүйл бол жижиг тархитай атлаа холын зайд харилцаж чаддаг явдал байв.",
      },
      {
        question: "The word 'ERRATIC' in line 15 is closest in meaning to:",
        options: [
          { id: "A", text: "Unpredictable and irregular" },
          { id: "B", text: "Graceful and elegant" },
          { id: "C", text: "Rapid and fast" },
          { id: "D", text: "Silent and calm" },
          { id: "E", text: "Accurate and sharp" },
        ],
        correctAnswer: "A",
        explanation: "'Erratic' гэдэг нь тогтворгүй, замбараагүй, төлөвлөгөөгүй (unpredictable/irregular) гэсэн утгатай үг.",
      },
      {
        question: "What is the main purpose of Skimming when approaching an exam reading passage?",
        options: [
          { id: "A", text: "To gain an overall understanding of the text's structure and main ideas quickly" },
          { id: "B", text: "To count the number of words in each paragraph" },
          { id: "C", text: "To memorize every comma and period" },
          { id: "D", text: "To translate every adjective into Mongolian" },
          { id: "E", text: "To read the text out loud" },
        ],
        correctAnswer: "A",
        explanation: "Skimming-ийн гол зорилго нь эхийн ерөнхий бүтцийг ойлгож, гол санааг хамгийн богино хугацаанд тогтоох явдал юм.",
      },
    ],
  },
];

// Helper export for components
export const initialLessons: Lesson[] = LEARNING_CENTER_LESSONS.map((l) => ({
  ...l,
  category: l.track,
  content: l.detailedContent,
  isLocked: !l.isFree,
}));
