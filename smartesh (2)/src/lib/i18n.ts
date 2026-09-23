export type Language = "mn" | "en";

export const translations = {
  mn: {
    // Brand & Header
    brandTagline: "Монголын Англи хэлний ЭЕШ систем",
    systemYears: "2006–2026",
    footerText: "Монголын Англи хэлний ЭЕШ-д бэлтгэх цахим систем (2006–2026)",
    footerPricing: "Багш 40,000₮ / Сурагч 20,000₮ (365 хоног)",

    // Navigation Tabs
    dashboard: "Хянах самбар",
    adminDashboard: "Админ самбар",
    teacherDashboard: "Багшийн самбар",
    questionBank: "Тест оруулах & Сан",
    pricingSettings: "💰 Үнэ тариф & Тохиргоо",
    archive: "Шалгалтын төв & Mock",
    archiveTeacher: "Шалгалтын сан & Архив",
    weeklyMock: "7 хоногийн Mock",
    practiceTest: "Дасгал даалгавар",
    customBuilder: "Холимог тест үүсгэгч",
    omrScanner: "OMR Хуудас & Сканнер",
    mistakes: "Алдааны дэвтэр",
    learningCenter: "Learning Center",

    // Roles
    student: "Сурагч",
    teacher: "Багш",
    admin: "Админ",
    switchRole: "Эрх солих (3 Role)",

    // Actions & Buttons
    activatePremium: "Идэвхжүүлэх",
    premiumActive: "Premium 365",
    notifications: "Мэдэгдлийн сан",
    noNotifications: "Мэдэгдэл байхгүй байна.",
    lightMode: "Гэрэлтэй горимд шилжих",
    darkMode: "Харанхуй горимд шилжих",
    languageToggle: "Хэл солих (English)",
    startExam: "Шалгалт эхлүүлэх",
    startMock: "Mock Test (80 мин)",
    startPractice: "Дасгал ажиллах",
    createMixedTest: "Холимог тест үүсгэх",
    editLesson: "Хичээл засах",
    addLesson: "Шинэ хичээл нэмэх",
    delete: "Устгах",
    save: "Хадгалах",
    cancel: "Болих",
    search: "Хайх...",
    filter: "Шүүлтүүр",
    allYears: "Бүх он (2006–2026)",
    allVariants: "Бүх хувилбар",
    allCategories: "Бүх ангилал",

    // Custom Builder UI
    customBuilderTitle: "Ухаалаг Даалгавар & Холимог Тест Үүсгэгч",
    customBuilderSubtitle: "2006–2026 онуудын өмнөх шалгалтын материалуудыг өөртөө тохируулан хольж, сонгосон сэдвүүдээрээ хувийн тестээ үүсгэн ажиллаарай.",
    selectYears: "1. Он сонгох (2006–2026 оноос холих)",
    selectAllYears: "Бүх 21 жил",
    selectLast5Years: "Сүүлийн 5 жил",
    selectLast10Years: "Сүүлийн 10 жил",
    clearYears: "Цэвэрлэх",
    selectTopics: "2. Дүрэм & Үгийн сангийн сэдэв сонгох",
    selectAllTopics: "Бүх сэдвийг сонгох",
    questionCount: "3. Асуултын тоо",
    difficulty: "4. Түвшин",
    customTitlePlaceholder: "Тестийн нэр (ж нь: 2020-2025 Оны Дүрэм + Хэлц үгийн сорил)...",
    launchExamMock: "Mock горимоор эхлэх (Цагтай шалгалт)",
    launchExamPractice: "Дасгал горимоор эхлэх (Шууд хариу шалгах)",
    totalMatchingQuestions: "Тохирох асуултын сан",

    // Learning Center
    learningCenterTitle: "ЭЕШ Англи хэлний сургалтын төв",
    learningCenterSubtitle: "Дүрэм, үгийн сан, хэлц үйл үг, эх унших чадварын цогц систем",
    adminAddLessonBtn: "➕ Шинэ хичээл нэмэх (Админ)",
    adminEditLessonBtn: "✏️ Хичээл засах",
    lessonSavedSuccess: "Хичээл амжилттай хадгалагдлаа!",
    lessonDeletedSuccess: "Хичээл устгагдлаа.",
  },

  en: {
    // Brand & Header
    brandTagline: "Mongolia's English ESH Exam Prep System",
    systemYears: "2006–2026",
    footerText: "Mongolia's Digital English ESH Exam Preparation Platform (2006–2026)",
    footerPricing: "Teacher 40,000₮ / Student 20,000₮ (365 Days)",

    // Navigation Tabs
    dashboard: "Dashboard",
    adminDashboard: "Admin Board",
    teacherDashboard: "Teacher Board",
    questionBank: "Question Bank & Import",
    pricingSettings: "💰 Pricing & Settings",
    archive: "Exam Center & Mock",
    archiveTeacher: "ESH Past Papers & Archive",
    weeklyMock: "Weekly Mock",
    practiceTest: "Practice Drills",
    customBuilder: "Custom Test Builder",
    omrScanner: "OMR Sheet & Scanner",
    mistakes: "Mistake Notebook",
    learningCenter: "Learning Center",

    // Roles
    student: "Student",
    teacher: "Teacher",
    admin: "Admin",
    switchRole: "Switch Role (3 Roles)",

    // Actions & Buttons
    activatePremium: "Activate Premium",
    premiumActive: "Premium 365",
    notifications: "Notifications",
    noNotifications: "No notifications available.",
    lightMode: "Switch to Light Mode",
    darkMode: "Switch to Dark Mode",
    languageToggle: "Switch Language (Монгол)",
    startExam: "Start Exam",
    startMock: "Mock Test (80 min)",
    startPractice: "Practice Drill",
    createMixedTest: "Create Mixed Test",
    editLesson: "Edit Lesson",
    addLesson: "Add New Lesson",
    delete: "Delete",
    save: "Save Changes",
    cancel: "Cancel",
    search: "Search...",
    filter: "Filter",
    allYears: "All Years (2006–2026)",
    allVariants: "All Variants",
    allCategories: "All Categories",

    // Custom Builder UI
    customBuilderTitle: "Smart Mixed Test & Assignment Builder",
    customBuilderSubtitle: "Mix past exam materials from 2006–2026, customize topics and question counts, and generate tailored exams instantly.",
    selectYears: "1. Select Past Years (Mix from 2006–2026)",
    selectAllYears: "All 21 Years",
    selectLast5Years: "Last 5 Years",
    selectLast10Years: "Last 10 Years",
    clearYears: "Clear",
    selectTopics: "2. Select Grammar & Vocabulary Topics",
    selectAllTopics: "Select All Topics",
    questionCount: "3. Question Count",
    difficulty: "4. Difficulty Level",
    customTitlePlaceholder: "Test Title (e.g., 2020-2025 Grammar & Phrasal Verbs Mixed Exam)...",
    launchExamMock: "Start Mock Mode (Timed 80 min)",
    launchExamPractice: "Start Practice Mode (Instant feedback)",
    totalMatchingQuestions: "Available Matching Questions",

    // Learning Center
    learningCenterTitle: "ESH English Learning Center",
    learningCenterSubtitle: "Comprehensive curriculum covering Grammar, Vocabulary, Phrasal Verbs & Reading",
    adminAddLessonBtn: "➕ Add New Lesson (Admin)",
    adminEditLessonBtn: "✏️ Edit Lesson",
    lessonSavedSuccess: "Lesson successfully saved!",
    lessonDeletedSuccess: "Lesson deleted.",
  },
};

export function getTranslation(key: keyof typeof translations.mn, lang: Language = "mn"): string {
  const table = translations[lang] || translations.mn;
  return table[key] || translations.mn[key] || (key as string);
}
