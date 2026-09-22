import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { StudentDashboard } from "./components/StudentDashboard";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { AuthScreen } from "./components/AuthScreen";
import { ExamArchiveView } from "./components/ExamArchiveView";
import { ExamRunner } from "./components/ExamRunner";
import { OMRScannerView } from "./components/OMRScannerView";
import { MistakeNotebookView } from "./components/MistakeNotebookView";
import { LearningCenterView } from "./components/LearningCenterView";
import { TeacherQuestionBankManager } from "./components/TeacherQuestionBankManager";
import { PremiumModal } from "./components/PremiumModal";
import { SqlSchemaModal } from "./components/SqlSchemaModal";
import { db } from "./lib/supabase";
import {
  Role,
  UserProfile,
  Exam,
  Assignment,
  ExamSubmission,
  MistakeItem,
  ClassRoom,
  OMRScanRecord,
  ActivationCode,
  NotificationItem,
  SupportTicket,
} from "./types";

export default function App() {
  // Global Database State
  const [activeRole, setActiveRole] = useState<Role>(() => {
    try {
      const saved = localStorage.getItem("smartesh_active_role") as Role;
      if (saved === "admin" || saved === "teacher" || saved === "student") {
        return saved;
      }
    } catch {}
    return "student";
  });
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [omrScans, setOmrScans] = useState<OMRScanRecord[]>([]);
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [authReady, setAuthReady] = useState(false);

  // Modals & Active Exam Session
  const [activeExamSession, setActiveExamSession] = useState<{
    exam: Exam;
    mode: "mock" | "practice" | "diagnostic";
  } | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Production authentication: never auto-login as a demo/local user.
  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      setCurrentUser(null);
      return;
    }

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        setCurrentUser(null);
        setAuthReady(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.session.user.id)
        .single();

      if (profile) {
        const user: UserProfile = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          school: profile.school || "",
          grade: profile.grade || "",
          isPremium: Boolean(profile.is_premium),
          premiumExpiresAt: profile.premium_expires_at || undefined,
          joinedAt: profile.created_at || new Date().toISOString(),
          targetEshScore: profile.target_esh_score || 650,
        };
        setActiveRole(user.role);
        setCurrentUser(user);
        refreshData(user);
      }
      setAuthReady(true);
    };

    loadSession();
    const { data: listener } = supabase.auth.onAuthStateChange(() => loadSession());
    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshData = (authenticatedUser?: UserProfile) => {
    const allUsers = db.getUsers();
    setUsers(allUsers);
    setExams(db.getExams());
    setClasses(db.getClasses());
    setAssignments(db.getAssignments());
    setSubmissions(db.getSubmissions());
    setMistakes(db.getMistakes());
    setOmrScans(db.getOMRScans());
    setActivationCodes(db.getActivationCodes());
    setNotifications(db.getNotifications());
    setSupportTickets(db.getSupportTickets());

    if (authenticatedUser) setCurrentUser(authenticatedUser);
  };
    }
    setCurrentUser(matched || allUsers[0]);
  };

  // Handle role switch
  const handleRoleChange = (newRole: Role) => {
    setActiveRole(newRole);
    try {
      localStorage.setItem("smartesh_active_role", newRole);
    } catch {}

    const allUsers = db.getUsers();
    let matched = allUsers.find((u) => u.role === newRole);
    if (!matched && newRole === "admin") {
      matched = {
        id: "usr-admin-1",
        email: "admin@smartesh.mn",
        name: "SmartESH Админ",
        role: "admin",
        school: "SmartESH Төв",
        grade: "Системийн Ерөнхий Админ",
        isPremium: true,
        premiumExpiresAt: "2030-12-31",
        joinedAt: "2025-01-01",
      };
      allUsers.push(matched);
      db.saveUsers(allUsers);
      setUsers(allUsers);
    }
    if (matched) {
      setCurrentUser(matched);
    }
    setActiveTab("dashboard");
    setActiveExamSession(null);
  };

  // Student: Start exam
  const handleStartExam = (exam: Exam, mode: "mock" | "practice" | "diagnostic" = "mock") => {
    setActiveExamSession({ exam, mode });
  };

  // Student: Finish exam
  const handleFinishExam = (submission: ExamSubmission) => {
    db.saveSubmission(submission);
    setSubmissions(db.getSubmissions());

    // Record mistakes for questions that were wrong and mark clean correct questions as mastered
    const targetExam =
      exams.find((e) => e.id === submission.examId) || activeExamSession?.exam;
    if (targetExam) {
      targetExam.questions.forEach((q) => {
        const userAns = submission.answers[q.questionNumber];
        if (userAns) {
          if (userAns === q.correctAnswer) {
            // Mastered with zero mistakes!
            db.markQuestionMastered(submission.userId, q.id);
          } else {
            // Unmark if previously mastered and record to mistake notebook
            db.unmarkQuestionMastered(submission.userId, q.id);
            db.recordMistake({
              userId: submission.userId,
              examId: targetExam.id,
              question: q,
              userLastAnswer: userAns,
              smartFeedback: q.explanation || "ЭЕШ-ийн зөв хариултын дүрэм ба тайлбар.",
            });
          }
        }
      });
      setMistakes(db.getMistakes());
    }
  };

  // Student: Join class by code
  const handleJoinClass = (code: string) => {
    if (!currentUser) return false;
    const ok = db.enrollStudentInClass(code, currentUser.id);
    if (ok) {
      setClasses(db.getClasses());
    }
    return ok;
  };

  // Student: Weak topic practice
  const handleStartWeakTopicPractice = (topicName: string) => {
    // Generate a mini exam of 10 questions filtered by this topic or general grammar
    const matchedQuestions = exams
      .flatMap((e) => e.questions)
      .filter((q) => q.topic?.toLowerCase().includes(topicName.toLowerCase()) || q.category === "Grammar")
      .slice(0, 10);

    const practiceExam: Exam = {
      id: `weak-topic-${Date.now()}`,
      title: `Smart Practice: ${topicName}`,
      year: 2026,
      variant: "Mock",
      type: "practice",
      totalQuestions: matchedQuestions.length || 5,
      durationMinutes: 20,
      questions:
        matchedQuestions.length > 0
          ? matchedQuestions
          : exams[0].questions.slice(0, 5),
      status: "published",
      createdBy: "smart-esh-ai",
      createdByName: "SmartESH AI Practice",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setActiveExamSession({ exam: practiceExam, mode: "practice" });
  };

  // Student: Retest mistakes
  const handleStartRetest = (selectedMistakes: MistakeItem[]) => {
    const retestExam: Exam = {
      id: `retest-${Date.now()}`,
      title: `Алдааны Дэвтэр Сорилт (${selectedMistakes.length} асуулт)`,
      year: 2026,
      variant: "Mock",
      type: "practice",
      totalQuestions: selectedMistakes.length,
      durationMinutes: Math.max(15, selectedMistakes.length * 2),
      questions: selectedMistakes.map((m) => m.question),
      status: "published",
      createdBy: currentUser?.id || "student",
      createdByName: currentUser?.name || "Сурагч",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setActiveExamSession({ exam: retestExam, mode: "practice" });
  };

  // Teacher: Create class
  const handleCreateClass = (name: string, description: string) => {
    const newClass = db.createClass({
      name,
      teacherId: currentUser?.id || "usr-teacher-1",
      teacherName: currentUser?.name || "Багш",
      description,
    });
    setClasses(db.getClasses());
    return newClass;
  };

  // Teacher: Create assignment
  const handleCreateAssignment = (
    title: string,
    classId: string,
    examId: string,
    dueDate: string,
    timeLimitMinutes: number
  ) => {
    const cls = classes.find((c) => c.id === classId);
    const ex = exams.find((e) => e.id === examId);

    const asg = db.createAssignment({
      title,
      classId,
      className: cls?.name || "Анги",
      examId,
      examTitle: ex?.title || "Шалгалт",
      assignedBy: currentUser?.id || "usr-teacher-1",
      assignedByName: currentUser?.name || "Багш",
      dueDate,
      timeLimitMinutes,
    });
    setAssignments(db.getAssignments());
    return asg;
  };

  // Teacher: Create custom test
  const handleCreateCustomTest = (title: string, questionsCount: number) => {
    const sampleQuestions = exams.flatMap((e) => e.questions).slice(0, questionsCount);
    const newExam: Exam = {
      id: `custom-test-${Date.now()}`,
      title,
      year: 2026,
      variant: "Mock",
      type: "mock",
      totalQuestions: questionsCount,
      durationMinutes: questionsCount <= 15 ? 25 : 80,
      questions: sampleQuestions,
      status: "published",
      createdBy: currentUser?.id || "usr-teacher-1",
      createdByName: currentUser?.name || "Багш",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    db.addExam(newExam);
    setExams(db.getExams());
    alert("Таны шинэ тест амжилттай үүсэж, шалгалтын санд нэмэгдлээ!");
    return newExam;
  };

  // Teacher: Verify OMR Scan
  const handleVerifyOMRScan = (scanId: string, verifiedAnswers: Record<number, string>) => {
    db.verifyOMRScan(scanId, verifiedAnswers);
    setOmrScans(db.getOMRScans());
    alert("Эргэлзээтэй хариулт амжилттай баталгаажлаа!");
  };

  // Teacher: Export Excel / CSV
  const handleExportExcel = (classId: string) => {
    const classSubs =
      classId === "all"
        ? submissions
        : submissions.filter((s) => {
            const cls = classes.find((c) => c.id === classId);
            return cls ? cls.studentIds.includes(s.userId) : true;
          });

    const headers = [
      "Сурагчийн нэр",
      "Регистр",
      "Шалгалт",
      "Төрөл",
      "Түүхий оноо",
      "Хувь",
      "ЭЕШ Хуваарьт оноо (800)",
      "Grammar",
      "Vocabulary",
      "Communication",
      "Reading",
      "Хугацаа (мин)",
      "Огноо",
    ];

    const rows = classSubs.map((s) => [
      `"${s.userName}"`,
      `"${s.studentRegNo || "—"}"`,
      `"${s.examTitle}"`,
      `"${s.source === "omr_paper" ? "Цаасан OMR" : "Дижитал"}"`,
      s.rawScore,
      `${s.percentage}%`,
      s.scaledScore,
      `${s.categoryScores.Grammar.correct}/${s.categoryScores.Grammar.total}`,
      `${s.categoryScores.Vocabulary.correct}/${s.categoryScores.Vocabulary.total}`,
      `${s.categoryScores.Communication.correct}/${s.categoryScores.Communication.total}`,
      `${s.categoryScores.Reading.correct}/${s.categoryScores.Reading.total}`,
      Math.round(s.timeSpentSeconds / 60),
      `"${s.submittedAt.slice(0, 10)}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SmartESH_Angiin_Tailan_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Admin: Publish exam
  const handlePublishExam = (newExam: Exam) => {
    db.addExam(newExam);
    setExams(db.getExams());
  };

  // Admin: Generate code
  const handleGenerateActivationCode = (targetRole: "student" | "teacher") => {
    const code = db.generateActivationCode(targetRole);
    setActivationCodes(db.getActivationCodes());
    return code;
  };

  // Admin: Send broadcast
  const handleSendNotification = (
    title: string,
    message: string,
    targetRole: "all" | "student" | "teacher"
  ) => {
    db.broadcastNotification(title, message, targetRole);
    setNotifications(db.getNotifications());
  };

  // Admin: Reply support ticket
  const handleReplySupportTicket = (ticketId: string, replyText: string) => {
    db.replySupportTicket(ticketId, replyText);
    setSupportTickets(db.getSupportTickets());
  };

  // Admin: Toggle user premium
  const handleToggleUserPremium = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (u) {
      db.updateUserPremium(userId, !u.isPremium);
      setUsers(db.getUsers());
      if (currentUser?.id === userId) {
        setCurrentUser({ ...currentUser, isPremium: !u.isPremium });
      }
    }
  };

  // Redeem code
  const handleRedeemCode = (code: string) => {
    if (!currentUser) return false;
    const ok = db.redeemActivationCode(code, currentUser.id, currentUser.name);
    if (ok) {
      setUsers(db.getUsers());
      setActivationCodes(db.getActivationCodes());
      setCurrentUser({ ...currentUser, isPremium: true });
      return true;
    }
    return false;
  };

  // Mark notification read
  const handleMarkNotificationRead = (id: string) => {
    db.markNotificationAsRead(id);
    setNotifications(db.getNotifications());
  };

  // Mistake Notebook Actions
  const handleRemoveMistake = (id: string) => {
    db.removeMistake(id);
    setMistakes(db.getMistakes());
  };

  const handleUpdateMastery = (id: string, level: "learning" | "mastered") => {
    db.updateMistakeMastery(id, level);
    setMistakes(db.getMistakes());
  };

  if (!authReady) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold">Уншиж байна...</div>;
  }
  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setActiveExamSession(null);
        }}
        onOpenPremium={() => setShowPremiumModal(true)}
        onOpenSqlModal={() => setShowSqlModal(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeExamSession ? (
          <ExamRunner
            exam={activeExamSession.exam}
            mode={activeExamSession.mode}
            userId={currentUser.id}
            userName={currentUser.name}
            onFinish={handleFinishExam}
            onExit={() => setActiveExamSession(null)}
          />
        ) : activeTab === "dashboard" ? (
          activeRole === "student" ? (
            <StudentDashboard
              currentUser={currentUser}
              exams={exams}
              assignments={assignments}
              submissions={submissions}
              mistakes={mistakes}
              classes={classes}
              onStartExam={handleStartExam}
              onOpenMistakes={() => setActiveTab("mistakes")}
              onJoinClass={handleJoinClass}
              onStartWeakTopicPractice={handleStartWeakTopicPractice}
              onOpenLearningCenter={() => setActiveTab("learning-center")}
              onOpenArchive={() => setActiveTab("archive")}
            />
          ) : activeRole === "teacher" ? (
            <TeacherDashboard
              currentUser={currentUser}
              classes={classes}
              assignments={assignments}
              exams={exams}
              submissions={submissions}
              omrScans={omrScans}
              onCreateClass={handleCreateClass}
              onCreateAssignment={handleCreateAssignment}
              onCreateCustomTest={handleCreateCustomTest}
              onVerifyOMRScan={handleVerifyOMRScan}
              onExportExcel={handleExportExcel}
              onOpenOMR={() => setActiveTab("omr-scanner")}
              onOpenQuestionBank={() => setActiveTab("question-bank")}
            />
          ) : (
            <AdminDashboard
              exams={exams}
              users={users}
              activationCodes={activationCodes}
              notifications={notifications}
              supportTickets={supportTickets}
              submissions={submissions}
              classes={classes}
              onPublishExam={handlePublishExam}
              onDeleteExam={(examId) => {
                db.deleteExam(examId);
                setExams(db.getExams());
              }}
              onStartExam={handleStartExam}
              onGenerateActivationCode={handleGenerateActivationCode}
              onSendNotification={handleSendNotification}
              onReplySupportTicket={handleReplySupportTicket}
              onToggleUserPremium={handleToggleUserPremium}
            />
          )
        ) : activeTab === "question-bank" ? (
          <TeacherQuestionBankManager
            exams={exams}
            currentUser={currentUser}
            classes={classes}
            onUpdateExams={() => setExams(db.getExams())}
            onSwitchToStudentView={() => setActiveTab("practice-test")}
            onStartExam={handleStartExam}
            onAssignToClass={(assignmentData) => {
              db.addExam(assignmentData.exam);
              setExams(db.getExams());
              handleCreateAssignment(
                assignmentData.title,
                assignmentData.classId,
                assignmentData.exam.id,
                assignmentData.dueDate,
                assignmentData.timeLimitMinutes
              );
              setActiveTab("dashboard");
            }}
            onPrintOMR={() => {
              setActiveTab("omr-scanner");
            }}
          />
        ) : activeTab === "archive" || activeTab === "weekly-mock" || activeTab === "practice-test" ? (
          <ExamArchiveView
            exams={exams}
            currentUser={currentUser}
            classes={classes}
            dedicatedView={
              activeTab === "weekly-mock"
                ? "weekly-mock"
                : activeTab === "practice-test"
                ? "practice-test"
                : "past-papers"
            }
            onStartExam={handleStartExam}
            onOpenLearningCenter={() => setActiveTab("learning-center")}
            onUpdateExams={() => setExams(db.getExams())}
            onAssignToClass={(assignmentData) => {
              db.addExam(assignmentData.exam);
              setExams(db.getExams());
              handleCreateAssignment(
                assignmentData.title,
                assignmentData.classId,
                assignmentData.exam.id,
                assignmentData.dueDate,
                assignmentData.timeLimitMinutes
              );
              setActiveTab("dashboard");
            }}
            onPrintOMR={() => {
              setActiveTab("omr-scanner");
            }}
          />
        ) : activeTab === "learning-center" ? (
          <LearningCenterView
            currentUser={currentUser}
            onOpenPremium={() => setShowPremiumModal(true)}
          />
        ) : activeTab === "omr-scanner" ? (
          <OMRScannerView
            exams={exams}
            currentUser={currentUser}
            classes={classes}
            users={users}
            onNewSubmission={(sub) => {
              db.saveSubmission(sub);
              setSubmissions(db.getSubmissions());
            }}
            onNewOMRScan={(scan) => {
              setOmrScans(db.getOMRScans());
            }}
            onCreateExam={(newExam) => {
              db.addExam(newExam);
              setExams(db.getExams());
            }}
          />
        ) : activeTab === "mistakes" ? (
          <MistakeNotebookView
            mistakes={mistakes}
            onRemoveMistake={handleRemoveMistake}
            onUpdateMastery={handleUpdateMastery}
            onStartRetest={handleStartRetest}
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">SmartESH</span>
            <span>— Монголын Англи хэлний ЭЕШ-д бэлтгэх цахим систем (2006–2026)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPremiumModal(true)}
              className="hover:text-amber-800 font-semibold"
            >
              Багш 40,000₮ / Сурагч 20,000₮ (365 хоног)
            </button>
          </div>
        </div>
      </footer>

      {/* Premium Modal */}
      <PremiumModal
        currentUser={currentUser}
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onRedeemCode={handleRedeemCode}
      />

      {/* Supabase Schema Modal */}
      <SqlSchemaModal
        isOpen={showSqlModal}
        onClose={() => setShowSqlModal(false)}
      />
    </div>
  );
}
