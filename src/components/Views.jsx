import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Leaf,
  PauseCircle,
  RotateCcw,
  Square,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  getOptionState,
  ResultCard,
  ScorePill,
  TopStatCard,
} from "./ui";

export function AuthGateView({ isFirebaseReady, isLoadingSession, isSigningIn, signInError, onSignIn }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-xl rounded-[2rem] border border-forest-200/80 bg-white/95 p-6 shadow-[0_24px_90px_rgba(20,60,37,0.16)] backdrop-blur-sm sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50 px-4 py-2 text-sm text-forest-700">
          <Leaf className="h-4 w-4 text-forest-600" />
          Forest Management Hub
        </div>
        <h1 className="mt-5 font-display text-3xl leading-tight text-forest-900 sm:text-4xl">
          Sign in to continue your quiz workspace.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          Use Google to unlock the dashboard, keep your weekly best scores synced across devices, and preserve your study progress.
        </p>

        {!isFirebaseReady && (
          <div className="mt-6 rounded-xl border border-bark-200 bg-bark-50 p-4 text-sm text-bark-800">
            Firebase is not fully configured yet. Add your Firebase environment variables to enable Google sign-in and cloud sync.
          </div>
        )}

        {signInError && (
          <div className="mt-6 rounded-xl border border-bark-200 bg-bark-50 p-4 text-sm text-bark-800">
            {signInError}
          </div>
        )}

        <button
          type="button"
          onClick={onSignIn}
          disabled={!isFirebaseReady || isSigningIn || isLoadingSession}
          className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-forest-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-500 disabled:cursor-not-allowed disabled:bg-forest-300"
        >
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold">G</span>
          {isLoadingSession ? "Checking session..." : isSigningIn ? "Signing in..." : "Sign in with Google"}
        </button>
      </section>
    </div>
  );
}

export function HomeView({
  selectedDashboardWeek,
  selectedWeekStats,
  bestScores,
  onStartWeekQuiz,
  onStartMarathon,
}) {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-2xl border border-forest-200/80 p-4 shadow-ambient sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-forest-200 bg-forest-50 px-3 py-2 text-[11px] leading-5 text-forest-700 sm:px-4 sm:text-sm">
              NPTEL Forests & Their Management Practice Hub
            </div>
            <h1 className="mt-4 max-w-xl font-display text-[1.55rem] leading-tight text-forest-900 sm:max-w-2xl sm:text-3xl">
              Practice forest management questions in a quiz-focused dashboard.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:leading-7">
              Use the sidebar to move between weeks, keep track of your best scores, and switch to marathon mode for a mixed exam-style session.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TopStatCard label="Selected Week" value={`W${selectedDashboardWeek}`} />
            <TopStatCard label="Questions" value={String(selectedWeekStats?.count ?? 0)} />
            <TopStatCard
              label="Best Score"
              value={
                bestScores[selectedDashboardWeek]
                  ? `${bestScores[selectedDashboardWeek].score}/${bestScores[selectedDashboardWeek].total}`
                  : "--"
              }
            />
            <TopStatCard label="Mode" value="Week" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <article className="glass-panel rounded-2xl border border-forest-200/80 p-4 shadow-ambient sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-forest-700">Dashboard</p>
          <h2 className="mt-3 font-display text-2xl text-forest-900 sm:text-3xl">Week {selectedDashboardWeek}</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600 sm:leading-7">
            Open the selected assignment from the sidebar and start a focused quiz session with shuffled choices, instant feedback, and automatic best-score tracking.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="rounded-xl border border-forest-200 bg-forest-50/70 p-4 sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-forest-700">Assignment</p>
              <p className="mt-2 font-display text-2xl text-forest-900 sm:text-3xl">Assignment {selectedDashboardWeek}</p>
              <p className="mt-3 text-sm text-slate-600">{selectedWeekStats?.count ?? 0} questions are available in this weekly set.</p>
            </div>
            <div className="rounded-xl border border-forest-200 bg-white p-4 sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-forest-700">Best Performance</p>
              <p className="mt-2 font-display text-2xl text-forest-900 sm:text-3xl">
                {bestScores[selectedDashboardWeek]
                  ? `${bestScores[selectedDashboardWeek].score}/${bestScores[selectedDashboardWeek].total}`
                  : "No score"}
              </p>
              <p className="mt-3 text-sm text-slate-600">
                {bestScores[selectedDashboardWeek]
                  ? "Your highest score for this week is so far."
                  : "Complete the week once to save your best score here."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartWeekQuiz}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-600 sm:w-auto"
          >
            Start Week {selectedDashboardWeek} Quiz
            <ArrowRight className="h-4 w-4" />
          </button>
        </article>

        <article className="rounded-2xl border border-bark-200 bg-gradient-to-r from-bark-50 to-white p-4 shadow-ambient sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-bark-600">Marathon Mode</p>
          <h2 className="mt-3 font-display text-2xl text-forest-900 sm:text-3xl">All Weeks Mixed</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600 sm:leading-7">
            Attempt a combined quiz with questions from every week in shuffled order and treat it like a long-form exam revision sprint.
          </p>
          <div className="mt-6 rounded-xl border border-bark-200 bg-white/80 p-4 sm:p-5">
            <p className="text-sm text-slate-600">
              Marathon mode randomizes question order, shuffles answer choices, keeps a running score, and lets you stop or rest mid-session.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartMarathon}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-bark-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-bark-500 sm:w-auto"
          >
            Start Marathon
            <ArrowRight className="h-4 w-4" />
          </button>
        </article>
      </section>
    </div>
  );
}

export function MarathonSetupView({ totalQuestions, onStartQuiz, onBackHome }) {
  return (
    <section className="glass-panel rounded-2xl border border-bark-200/80 p-4 shadow-ambient sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.28em] text-bark-600">Marathon Mode</p>
      <h2 className="mt-3 font-display text-2xl text-forest-900 sm:text-4xl">All Weeks Mixed</h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        Review the marathon format first, then start the quiz when you are ready. This mode pulls questions from every week in shuffled order.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
        <TopStatCard label="Mode" value="Marathon" />
        <TopStatCard label="Weeks" value="12" />
        <TopStatCard label="Questions" value={String(totalQuestions)} />
      </div>

      <div className="mt-6 rounded-xl border border-bark-200 bg-white/85 p-4 sm:p-5">
        <p className="text-sm leading-7 text-slate-600">
          Click Start Quiz to begin. You can stop midway, rest between questions, and review your final score at the end.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onStartQuiz}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-bark-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-bark-500 sm:w-auto"
        >
          Start Quiz
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-forest-200 bg-white px-6 py-3 text-sm font-semibold text-forest-900 shadow-sm transition hover:bg-forest-50 sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>
    </section>
  );
}

export function QuizView({
  quizMode,
  selectedWeek,
  questionIndex,
  questions,
  score,
  correctCount,
  isResting,
  setIsResting,
  onStop,
  progressPercent,
  currentQuestion,
  shuffledOptions,
  selectedAnswer,
  submittedAnswer,
  onAnswer,
  onSubmitAnswer,
  onNext,
}) {
  if (!currentQuestion) {
    return null;
  }

  return (
    <section className="glass-panel rounded-2xl border border-forest-200/80 p-4 shadow-ambient sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-forest-700">
            {quizMode === "marathon" ? "Marathon Mode" : `Week ${selectedWeek}`}
          </p>
          <h2 className="mt-2 font-display text-2xl text-forest-900 sm:text-3xl">
            Question {questionIndex + 1} of {questions.length}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:flex">
          <ScorePill label="Score" value={String(score)} />
          <ScorePill label="Correct" value={String(correctCount)} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={() => setIsResting(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-forest-200 bg-forest-50 px-4 py-2 text-sm font-semibold text-forest-800 shadow-sm transition hover:bg-forest-100 sm:w-auto"
        >
          <PauseCircle className="h-4 w-4" />
          Rest
        </button>
        <button
          type="button"
          onClick={onStop}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-bark-200 bg-bark-50 px-4 py-2 text-sm font-semibold text-bark-700 shadow-sm transition hover:bg-bark-100 sm:w-auto"
        >
          <Square className="h-4 w-4" />
          Stop
        </button>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-forest-100">
        <div
          className="h-full rounded-full bg-forest-700 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <article className="mt-6 rounded-2xl border border-forest-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-3 inline-flex rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-forest-700">
          Week {currentQuestion.week}
        </div>
        <h3 className="text-lg leading-7 text-forest-900 sm:text-2xl sm:leading-8">{currentQuestion.question}</h3>

        <div className="mt-6 grid gap-3">
          {shuffledOptions.map((option) => (
            <button
              key={option}
              type="button"
              disabled={Boolean(submittedAnswer)}
              onClick={() => onAnswer(option)}
              className={`rounded-xl border px-4 py-3 text-left text-sm leading-6 shadow-sm transition sm:px-5 sm:py-4 sm:text-base sm:leading-7 ${getOptionState(
                option,
                selectedAnswer,
                currentQuestion.correctAnswer,
                submittedAnswer,
              )}`}
            >
              {option}
            </button>
          ))}
        </div>

        {!submittedAnswer && selectedAnswer && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onSubmitAnswer}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-600 sm:w-auto"
            >
              Check Answer
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {submittedAnswer && (
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-forest-200 bg-forest-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {submittedAnswer === currentQuestion.correctAnswer ? (
                <CheckCircle2 className="h-6 w-6 text-forest-700" />
              ) : (
                <XCircle className="h-6 w-6 text-bark-600" />
              )}
              <p className="text-sm text-slate-700 sm:text-base">
                {submittedAnswer === currentQuestion.correctAnswer
                  ? "Correct answer. Keep your streak moving."
                  : `Incorrect. Correct answer: ${currentQuestion.correctAnswer}`}
              </p>
            </div>

            <button
              type="button"
              onClick={onNext}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-600 sm:w-auto"
            >
              {questionIndex === questions.length - 1 ? "Finish Quiz" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </article>
    </section>
  );
}

export function ResultView({
  finalPercentage,
  quizMode,
  selectedWeek,
  correctCount,
  incorrectCount,
  score,
  totalQuestions,
  missedQuestions,
  onReview,
  onRetake,
  onBackHome,
}) {
  return (
    <section className="glass-panel rounded-2xl border border-forest-200/80 p-4 text-center shadow-ambient sm:p-8">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-forest-800 shadow-sm">
        <Trophy className="h-10 w-10 text-white" />
      </div>
      <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-forest-700">Quiz Complete</p>
      <h2 className="mt-3 font-display text-3xl text-forest-900 sm:text-5xl">{finalPercentage}%</h2>
      <p className="mt-3 text-slate-600">
        {quizMode === "marathon"
          ? "Your marathon session is complete."
          : `Week ${selectedWeek} practice session is complete.`}
      </p>

      <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
        <ResultCard label="Correct" value={String(correctCount)} tone="forest" />
        <ResultCard label="Incorrect" value={String(incorrectCount)} tone="bark" />
        <ResultCard label="Total Score" value={`${score}/${totalQuestions}`} tone="slate" />
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {missedQuestions.length > 0 && (
          <button
            type="button"
            onClick={onReview}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-bark-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-bark-500 sm:w-auto"
          >
            Review Missed Questions
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-forest-600 sm:w-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Retake Quiz
        </button>
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-forest-200 bg-white px-6 py-3 font-semibold text-forest-900 shadow-sm transition hover:bg-forest-50 sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>
    </section>
  );
}

export function ReviewView({ missedQuestions, onBack }) {
  return (
    <section className="glass-panel rounded-2xl border border-forest-200/80 p-4 shadow-ambient sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-bark-600">Review Mode</p>
          <h2 className="mt-2 font-display text-2xl text-forest-900 sm:text-3xl">Missed Questions</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Review only the questions you answered incorrectly, along with the accepted answer for each one.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-forest-200 bg-white px-5 py-3 font-semibold text-forest-900 shadow-sm transition hover:bg-forest-50 sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {missedQuestions.map((item, index) => (
          <article key={`${item.week}-${index}`} className="rounded-xl border border-bark-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="inline-flex rounded-full border border-bark-200 bg-bark-50 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-bark-700">
              Week {item.week}
            </div>
            <h3 className="mt-4 text-lg leading-7 text-forest-900 sm:leading-8">{item.question}</h3>
            <p className="mt-4 text-sm text-slate-600">Your answer: {item.selectedAnswer}</p>
            <p className="mt-2 text-sm font-semibold text-forest-800">Correct answer: {item.correctAnswer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RestModal({ onResume, onStop }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-forest-200 bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.28)] sm:p-7">
        <h3 className="font-display text-xl text-forest-900 sm:text-2xl">Take a short rest</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Your current progress is saved on this screen. Resume whenever you are ready, or stop the quiz and keep the score up to this point.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex items-center justify-center rounded-full bg-forest-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-600"
          >
            Resume Quiz
          </button>
          <button
            type="button"
            onClick={onStop}
            className="inline-flex items-center justify-center rounded-full border border-bark-200 bg-bark-50 px-5 py-3 text-sm font-semibold text-bark-700 shadow-sm transition hover:bg-bark-100"
          >
            Stop Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
