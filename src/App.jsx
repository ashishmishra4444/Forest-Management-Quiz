import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Leaf,
  PauseCircle,
  Radio,
  RotateCcw,
  Square,
  Trophy,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { questionBank } from "./data/questions";
import {
  incrementTestTakers,
  isRealtimeEnabled,
  startPresenceTracking,
  subscribeToActiveUsers,
  subscribeToTestTakers,
} from "./lib/firebase";

const WEEK_COUNT = 12;
const TEST_TAKER_FLAG = "forest_quiz_test_taker_counted";

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

function getOptionState(option, selectedAnswer, correctAnswer) {
  if (!selectedAnswer) {
    return "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50";
  }

  if (option === correctAnswer) {
    return "border-emerald-500 bg-emerald-50 text-emerald-900";
  }

  if (option === selectedAnswer && selectedAnswer !== correctAnswer) {
    return "border-rose-500 bg-rose-50 text-rose-900";
  }

  return "border-slate-200 bg-slate-50 text-slate-500";
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl text-slate-950">{value}</p>
    </div>
  );
}

function Pill({ label, value }) {
  return (
    <div className="rounded-full border border-slate-300/80 bg-slate-50 px-4 py-2 text-sm text-slate-700 shadow-sm">
      <span className="text-slate-500">{label}: </span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function ResultCard({ label, value, tone }) {
  const toneStyles = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <div className={`rounded-[1.5rem] border p-5 shadow-sm ${toneStyles[tone]}`}>
      <p className="text-sm uppercase tracking-[0.25em]">{label}</p>
      <p className="mt-3 font-display text-4xl">{value}</p>
    </div>
  );
}

function LiveCountChip({ count, label, icon, live = false }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-300/80 bg-white pl-3 pr-5 py-2 text-slate-800 shadow-sm">
      {live && (
        <span className="flex h-5 w-5 items-center justify-center shrink-0">
          <span className="live-dot-pulse h-3.5 w-3.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {!live && (
        <span className="flex h-5 w-5 items-center justify-center text-slate-600 shrink-0">{icon}</span>
      )}
      {live && <Radio className="h-[18px] w-[18px] text-slate-400 shrink-0" />}
      <span className="whitespace-nowrap pr-1 text-[15px] font-medium text-slate-900 leading-none">
        {label}: {count}
      </span>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState("home");
  const [quizMode, setQuizMode] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [testTakers, setTestTakers] = useState(0);
  const [isResting, setIsResting] = useState(false);

  const weeklyStats = useMemo(
    () =>
      Array.from({ length: WEEK_COUNT }, (_, week) => ({
        week,
        count: questionBank.filter((item) => item.week === week).length,
      })),
    [],
  );

  const currentQuestion = questions[questionIndex];
  const progressPercent = questions.length ? ((questionIndex + 1) / questions.length) * 100 : 0;
  const finalPercentage = questions.length ? Math.round((score / questions.length) * 100) : 0;

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
    if (!currentQuestion) {
      return;
    }

    setShuffledOptions(shuffleArray(currentQuestion.options));
    setSelectedAnswer(null);
  }, [currentQuestion]);

  useEffect(() => {
    if (!isResting) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isResting]);

  const startQuiz = (mode, week = null) => {
    const nextQuestions = buildQuizQuestions(mode, week);

    if (isRealtimeEnabled() && !window.localStorage.getItem(TEST_TAKER_FLAG)) {
      window.localStorage.setItem(TEST_TAKER_FLAG, "true");
      incrementTestTakers();
    }

    setQuizMode(mode);
    setSelectedWeek(week);
    setQuestions(nextQuestions);
    setQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsResting(false);
    setScreen("quiz");
  };

  const handleAnswer = (option) => {
    if (!currentQuestion || selectedAnswer) {
      return;
    }

    setSelectedAnswer(option);

    if (option === currentQuestion.correctAnswer) {
      setScore((value) => value + 1);
      setCorrectCount((value) => value + 1);
      return;
    }

    setIncorrectCount((value) => value + 1);
  };

  const handleNext = () => {
    if (questionIndex === questions.length - 1) {
      setScreen("result");
      return;
    }

    setQuestionIndex((value) => value + 1);
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
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsResting(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-[2rem] border border-slate-300/70 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:p-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
                <Leaf className="h-4 w-4 text-slate-600" />
                NPTEL Forests & Their Management Practice Hub
              </div>
              <h1 className="max-w-3xl font-display text-4xl leading-tight text-slate-950 sm:text-5xl">
                Practice forest management questions in a focused, professional quiz workspace.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Practice week by week or launch a full marathon of all 120 questions with shuffled options, instant feedback,
                live scoring, and mobile-friendly navigation.
              </p>
            </div>

            <div className="glass-panel rounded-[1.75rem] border border-slate-300/70 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm uppercase tracking-[0.25em] text-slate-500">Question Bank</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <StatCard label="Weeks" value="12" />
                <StatCard label="Questions" value={String(questionBank.length)} />
                <StatCard label="Modes" value="2" />
                <StatCard label="Focus" value="NPTEL" />
              </div>
            </div>
          </div>
        </header>

        {screen === "home" && (
          <main className="flex-1">
            <section className="glass-panel rounded-[2rem] border border-slate-300/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
              <button
                type="button"
                onClick={() => startQuiz("marathon")}
                className="group flex w-full flex-col items-start justify-between gap-4 rounded-[1.75rem] border border-slate-300/80 bg-gradient-to-r from-slate-100 to-slate-50 p-6 text-left shadow-sm transition hover:border-slate-500 hover:shadow-md sm:flex-row sm:items-center sm:p-7"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Challenge Mode</p>
                  <h2 className="mt-2 font-display text-3xl text-slate-950 sm:text-4xl">Marathon Mode</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    Attempt a combined quiz with questions from every week in shuffled order.
                  </p>
                </div>
                <div className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm">
                  Start Marathon
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </div>
              </button>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {weeklyStats.map((item) => (
                  <button
                    key={item.week}
                    type="button"
                    onClick={() => startQuiz("week", item.week)}
                    className="group rounded-[1.5rem] border border-slate-300/70 bg-white/92 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-500 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Week {item.week}</p>
                        <h3 className="mt-2 font-display text-2xl text-slate-950">Assignment {item.week}</h3>
                      </div>
                      <Leaf className="h-5 w-5 text-slate-500 transition group-hover:rotate-12" />
                    </div>
                    <p className="mt-4 text-sm text-slate-600">{item.count} questions ready for practice.</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      Open Quiz
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </main>
        )}

        {screen === "quiz" && currentQuestion && (
          <main className="flex-1">
            <section className="glass-panel rounded-[2rem] border border-slate-300/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                    {quizMode === "marathon" ? "Marathon Mode" : `Week ${selectedWeek}`}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-slate-950">
                    Question {questionIndex + 1} of {questions.length}
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:flex">
                  <Pill label="Score" value={String(score)} />
                  <Pill label="Correct" value={String(correctCount)} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsResting(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  <PauseCircle className="h-4 w-4" />
                  Rest
                </button>
                <button
                  type="button"
                  onClick={() => setScreen("result")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-800 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <article className="mt-6 rounded-[1.75rem] border border-slate-300/70 bg-white/96 p-5 shadow-sm sm:p-6">
                <div className="mb-3 inline-flex rounded-full border border-slate-300/70 bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  Week {currentQuestion.week}
                </div>
                <h3 className="text-xl leading-8 text-slate-950 sm:text-2xl">{currentQuestion.question}</h3>

                <div className="mt-6 grid gap-3">
                  {shuffledOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={Boolean(selectedAnswer)}
                      onClick={() => handleAnswer(option)}
                      className={`rounded-2xl border px-4 py-4 text-left text-sm leading-7 shadow-sm transition sm:px-5 sm:text-base ${getOptionState(
                        option,
                        selectedAnswer,
                        currentQuestion.correctAnswer,
                      )}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {selectedAnswer && (
                  <div className="mt-6 flex flex-col gap-4 rounded-[1.5rem] border border-slate-300/70 bg-slate-50/85 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      {selectedAnswer === currentQuestion.correctAnswer ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-rose-600" />
                      )}
                      <p className="text-sm text-slate-700 sm:text-base">
                        {selectedAnswer === currentQuestion.correctAnswer
                          ? "Correct answer. Keep your streak moving."
                          : `Incorrect. Correct answer: ${currentQuestion.correctAnswer}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                    >
                      {questionIndex === questions.length - 1 ? "Finish Quiz" : "Next"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </article>
            </section>
          </main>
        )}

        {screen === "result" && (
          <main className="flex-1">
            <section className="glass-panel rounded-[2rem] border border-slate-300/70 p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 shadow-sm">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-slate-500">Quiz Complete</p>
              <h2 className="mt-3 font-display text-4xl text-slate-950 sm:text-5xl">{finalPercentage}%</h2>
              <p className="mt-3 text-slate-600">
                {quizMode === "marathon"
                  ? "Your marathon session is complete."
                  : `Week ${selectedWeek} practice session is complete.`}
              </p>

              <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
                <ResultCard label="Correct" value={String(correctCount)} tone="emerald" />
                <ResultCard label="Incorrect" value={String(incorrectCount)} tone="rose" />
                <ResultCard label="Total Score" value={`${score}/${questions.length}`} tone="amber" />
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </button>
                <button
                  type="button"
                  onClick={handleBackHome}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/80 bg-slate-50 px-6 py-3 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Back to Home
                </button>
              </div>
            </section>
          </main>
        )}

        <footer className="mt-6">
          <div className="glass-panel flex flex-col gap-4 rounded-[1.5rem] border border-slate-300/70 px-5 py-4 text-sm text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-950">Live Stats</p>
              <p className="text-slate-500">
                {isRealtimeEnabled()
                  ? "Live presence and total test-participant tracking are enabled."
                  : "Add Firebase env values to enable real-time user monitoring."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <LiveCountChip count={activeUsers} label="Active users" live />
              <LiveCountChip
                count={testTakers}
                label="Tests taken so far"
                icon={<UserRoundCheck className="h-[18px] w-[18px]" />}
              />
            </div>
          </div>
        </footer>

        {isResting && screen === "quiz" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[1.5rem] border border-slate-300 bg-white p-7 shadow-[0_28px_90px_rgba(15,23,42,0.28)]">
              <h3 className="font-display text-2xl text-slate-950">Take a short rest</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Your current progress is saved on this screen. Resume whenever you are ready, or stop the quiz and keep the score up to this point.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsResting(false)}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                >
                  Resume Quiz
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsResting(false);
                    setScreen("result");
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
                >
                  Stop Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
