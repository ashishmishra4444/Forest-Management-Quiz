import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  UserRoundCheck,
} from "lucide-react";
import { questionBank } from "./data/questions";
import {
  getFriendlyAuthError,
  incrementTestTakers,
  isFirebaseEnabled,
  isRealtimeEnabled,
  resolveRedirectSignIn,
  signInWithGoogle,
  signOutUser,
  startPresenceTracking,
  subscribeToAuth,
  subscribeToActiveUsers,
  subscribeToTestTakers,
} from "./lib/firebase";
import { syncUserSession } from "./lib/scoreApi";
import { MobileSidebarOverlay, Sidebar } from "./components/Sidebar";
import {
  AuthGateView,
  HomeView,
  MarathonSetupView,
  QuizView,
  ResultView,
  RestModal,
  ReviewView,
} from "./components/Views";
import { LiveCountChip, NavbarUserChip } from "./components/ui";

const WEEK_COUNT = 12;
const BEST_SCORES_KEY = "forest_quiz_best_scores";

function shuffleArray(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function buildQuizQuestions(mode, week) {
  const selectedQuestions =
    mode === "marathon"
      ? questionBank
      : questionBank.filter((item) => item.week === week);

  const orderedQuestions = mode === "marathon" ? shuffleArray(selectedQuestions) : [...selectedQuestions];

  return orderedQuestions.map((item, index) => ({
    ...item,
    id: `${mode}-${week ?? "all"}-${index}-${item.week}`,
  }));
}

function getBestScoresStorageKey(userId) {
  return userId ? `${BEST_SCORES_KEY}_${userId}` : BEST_SCORES_KEY;
}

function getStoredBestScores(userId = "") {
  try {
    const rawValue = window.localStorage.getItem(getBestScoresStorageKey(userId));
    return rawValue ? JSON.parse(rawValue) : {};
  } catch {
    return {};
  }
}

function App() {
  const [screen, setScreen] = useState("home");
  const [quizMode, setQuizMode] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submittedAnswer, setSubmittedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [answerLog, setAnswerLog] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [testTakers, setTestTakers] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [selectedDashboardWeek, setSelectedDashboardWeek] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWeeksOpen, setIsWeeksOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [bestScores, setBestScores] = useState({});

  const weeklyStats = useMemo(
    () =>
      Array.from({ length: WEEK_COUNT }, (_, week) => ({
        week,
        count: questionBank.filter((item) => item.week === week).length,
      })),
    [],
  );

  const currentQuestion = questions[questionIndex];
  const selectedWeekStats = weeklyStats.find((item) => item.week === selectedDashboardWeek);
  const progressPercent = questions.length ? ((questionIndex + 1) / questions.length) * 100 : 0;
  const finalPercentage = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const missedQuestions = answerLog.filter((item) => !item.isCorrect);

  useEffect(() => {
    if (!isRealtimeEnabled()) {
      return () => {};
    }

    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const stopPresence = startPresenceTracking(sessionId);
    const unsubscribeActiveUsers = subscribeToActiveUsers(setActiveUsers);
    const unsubscribeTestTakers = subscribeToTestTakers(setTestTakers);

    return () => {
      unsubscribeActiveUsers();
      unsubscribeTestTakers();
      stopPresence();
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function finishRedirectSignIn() {
      try {
        await resolveRedirectSignIn();
      } catch (error) {
        if (!isActive) {
          return;
        }

        setSignInError(error?.message ?? "Unable to finish Google sign-in.");
      }
    }

    finishRedirectSignIn();

    const unsubscribe = subscribeToAuth((nextUser) => {
      if (!isActive) {
        return;
      }

      setUser(nextUser);
      setIsAuthLoading(false);
      setSignInError("");
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentQuestion) {
      return;
    }

    setShuffledOptions(shuffleArray(currentQuestion.options));
    setSelectedAnswer(null);
    setSubmittedAnswer(null);
  }, [currentQuestion]);

  useEffect(() => {
    if (!isResting && !isSidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isResting, isSidebarOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(getBestScoresStorageKey(user?.uid), JSON.stringify(bestScores));
  }, [bestScores, user]);

  useEffect(() => {
    setBestScores(getStoredBestScores(user?.uid ?? ""));

    if (!user) {
      return () => {};
    }

    let isActive = true;

    async function registerSession() {
      try {
        await syncUserSession();
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.warn("User session could not be registered in MongoDB.", error);
      }
    }

    registerSession();

    return () => {
      isActive = false;
    };
  }, [user]);

  const startQuiz = (mode, week = null) => {
    const nextQuestions = buildQuizQuestions(mode, week);

    if (isRealtimeEnabled()) {
      incrementTestTakers();
    }

    setQuizMode(mode);
    setSelectedWeek(week);
    setQuestions(nextQuestions);
    setQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setAnswerLog([]);
    setSubmittedAnswer(null);
    setIsResting(false);
    setScreen("quiz");
    setIsSidebarOpen(false);
  };

  const updateBestScore = () => {
    if (quizMode !== "week" || selectedWeek === null) {
      return;
    }

    const total = questions.length;
    const nextBestScore = { score, total };

    setBestScores((currentScores) => {
      const previous = currentScores[selectedWeek];

      if (!previous || score > previous.score) {
        return { ...currentScores, [selectedWeek]: nextBestScore };
      }

      return currentScores;
    });

  };

  const handleAnswer = (option) => {
    if (!currentQuestion || submittedAnswer) {
      return;
    }

    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !selectedAnswer || submittedAnswer) {
      return;
    }

    const option = selectedAnswer;
    const isCorrect = option === currentQuestion.correctAnswer;
    setSubmittedAnswer(option);
    setAnswerLog((currentLog) => [
      ...currentLog,
      {
        week: currentQuestion.week,
        question: currentQuestion.question,
        correctAnswer: currentQuestion.correctAnswer,
        selectedAnswer: option,
        isCorrect,
      },
    ]);

    if (isCorrect) {
      setScore((value) => value + 1);
      setCorrectCount((value) => value + 1);
      return;
    }

    setIncorrectCount((value) => value + 1);
  };

  const handleNext = () => {
    if (questionIndex === questions.length - 1) {
      updateBestScore();
      setScreen("result");
      return;
    }

    setQuestionIndex((value) => value + 1);
  };

  const handleStopQuiz = () => {
    updateBestScore();
    setScreen("result");
  };

  const handleRetake = () => {
    startQuiz(quizMode, selectedWeek);
  };

  const handleBackHome = () => {
    setScreen("home");
    setQuizMode(null);
    setSelectedWeek(null);
    setQuestions([]);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setSubmittedAnswer(null);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setAnswerLog([]);
    setIsResting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError("");

    try {
      await signInWithGoogle();
    } catch (error) {
      setSignInError(getFriendlyAuthError(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    setIsSidebarOpen(false);
    setIsResting(false);

    try {
      await signOutUser();
    } catch (error) {
      setSignInError(error?.message ?? "Unable to log out right now.");
    }
  };

  if (!user) {
    return (
      <AuthGateView
        isFirebaseReady={isFirebaseEnabled()}
        isLoadingSession={isAuthLoading}
        isSigningIn={isSigningIn}
        signInError={signInError}
        onSignIn={handleGoogleSignIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-800 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-0 px-0 lg:h-screen">
        <aside className="hidden h-full w-[310px] shrink-0 overflow-hidden border-r border-forest-700 bg-forest-900 shadow-ambient lg:block">
          <div className="h-full p-5">
            <Sidebar
              screen={screen}
              isWeeksOpen={isWeeksOpen}
              setIsWeeksOpen={setIsWeeksOpen}
              selectedDashboardWeek={selectedDashboardWeek}
              weeklyStats={weeklyStats}
              bestScores={bestScores}
              onClose={() => setIsSidebarOpen(false)}
              onGoHome={() => setScreen("home")}
              onStartMarathon={() => {
                setScreen("marathon-setup");
                setIsSidebarOpen(false);
              }}
              onSelectWeek={(week) => {
                setSelectedDashboardWeek(week);
                setScreen("home");
              }}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-20 border-b border-forest-200 bg-forest-50/95 px-3 py-3 shadow-[0_10px_28px_rgba(20,60,37,0.10)] backdrop-blur-xl sm:px-6 sm:py-0">
            <div className="flex flex-col gap-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="inline-flex shrink-0 items-center justify-center rounded-full border border-forest-200 bg-white p-2.5 text-forest-800 shadow-sm lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-forest-700 sm:text-[11px] sm:tracking-[0.28em]">
                      {screen === "home"
                        ? "Dashboard"
                        : screen === "review"
                          ? "Review"
                          : screen === "marathon-setup"
                            ? "Marathon Setup"
                            : "Quiz Workspace"}
                    </p>
                    <h1 className="mt-0.5 break-words font-display text-base leading-tight text-forest-900 sm:truncate sm:text-2xl">
                      {screen === "home"
                        ? "Forest Management Dashboard"
                        : screen === "marathon-setup"
                          ? "Marathon Quiz Setup"
                        : screen === "quiz"
                          ? quizMode === "marathon"
                            ? "Marathon Session"
                            : `Week ${selectedWeek} Quiz`
                          : screen === "review"
                            ? "Missed Question Review"
                            : "Quiz Summary"}
                    </h1>
                  </div>
                </div>

                <div className="shrink-0 sm:hidden">
                  <NavbarUserChip user={user} onLogout={handleLogout} />
                </div>
              </div>

              <div className="flex min-w-0 items-center justify-between gap-3 sm:shrink-0 sm:justify-end sm:gap-4">
                <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 sm:overflow-visible sm:pb-0">
                  <LiveCountChip
                    count={activeUsers}
                    label="Active Users"
                    live
                    className="shrink-0"
                  />
                  <LiveCountChip
                    count={testTakers}
                    label="Total attempts"
                    icon={<UserRoundCheck className="h-[18px] w-[18px]" />}
                    compactMobile
                    className="shrink-0"
                  />
                </div>

                <div className="hidden h-6 w-[1px] bg-slate-200 sm:block" />

                <div className="hidden shrink-0 sm:block">
                  <NavbarUserChip user={user} onLogout={handleLogout} />
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4">
            {screen === "home" && (
              <HomeView
                selectedDashboardWeek={selectedDashboardWeek}
                selectedWeekStats={selectedWeekStats}
                bestScores={bestScores}
                onStartWeekQuiz={() => startQuiz("week", selectedDashboardWeek)}
                onStartMarathon={() => setScreen("marathon-setup")}
              />
            )}

            {screen === "marathon-setup" && (
              <MarathonSetupView
                totalQuestions={questionBank.length}
                onStartQuiz={() => startQuiz("marathon")}
                onBackHome={handleBackHome}
              />
            )}

            {screen === "quiz" && (
              <QuizView
                quizMode={quizMode}
                selectedWeek={selectedWeek}
                questionIndex={questionIndex}
                questions={questions}
                score={score}
                correctCount={correctCount}
                isResting={isResting}
                setIsResting={setIsResting}
                onStop={handleStopQuiz}
                progressPercent={progressPercent}
                currentQuestion={currentQuestion}
                shuffledOptions={shuffledOptions}
                selectedAnswer={selectedAnswer}
                submittedAnswer={submittedAnswer}
                onAnswer={handleAnswer}
                onSubmitAnswer={handleSubmitAnswer}
                onNext={handleNext}
              />
            )}

            {screen === "result" && (
              <ResultView
                finalPercentage={finalPercentage}
                quizMode={quizMode}
                selectedWeek={selectedWeek}
                correctCount={correctCount}
                incorrectCount={incorrectCount}
                score={score}
                totalQuestions={questions.length}
                missedQuestions={missedQuestions}
                onReview={() => setScreen("review")}
                onRetake={handleRetake}
                onBackHome={handleBackHome}
              />
            )}

            {screen === "review" && (
              <ReviewView missedQuestions={missedQuestions} onBack={() => setScreen("result")} />
            )}
          </main>
        </div>

        <MobileSidebarOverlay open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
          <Sidebar
            screen={screen}
            isMobile
            isWeeksOpen={isWeeksOpen}
            setIsWeeksOpen={setIsWeeksOpen}
            selectedDashboardWeek={selectedDashboardWeek}
            weeklyStats={weeklyStats}
            bestScores={bestScores}
            onClose={() => setIsSidebarOpen(false)}
            onGoHome={() => {
              setScreen("home");
              setIsSidebarOpen(false);
            }}
            onStartMarathon={() => {
              setScreen("marathon-setup");
              setIsSidebarOpen(false);
            }}
            onSelectWeek={(week) => {
              setSelectedDashboardWeek(week);
              setScreen("home");
              setIsSidebarOpen(false);
            }}
          />
        </MobileSidebarOverlay>

        {isResting && screen === "quiz" && (
          <RestModal
            onResume={() => setIsResting(false)}
            onStop={() => {
              setIsResting(false);
              handleStopQuiz();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
