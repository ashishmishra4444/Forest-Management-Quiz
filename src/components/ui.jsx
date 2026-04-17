import { LogOut, Radio } from "lucide-react";

export function getOptionState(option, selectedAnswer, correctAnswer, submittedAnswer) {
  if (!selectedAnswer) {
    return "border-forest-200 bg-white text-slate-800 hover:border-forest-400 hover:bg-forest-50";
  }

  if (!submittedAnswer) {
    if (option === selectedAnswer) {
      return "border-forest-500 bg-forest-50 text-forest-900 shadow-sm";
    }

    return "border-forest-200 bg-white text-slate-800 hover:border-forest-400 hover:bg-forest-50";
  }

  if (option === correctAnswer) {
    return "border-forest-700 bg-forest-600 text-white";
  }

  if (option === submittedAnswer && submittedAnswer !== correctAnswer) {
    return "border-bark-700 bg-bark-600 text-white";
  }

  return "border-slate-200 bg-slate-50 text-slate-500";
}

export function TopStatCard({ label, value, className = "" }) {
  return (
    <div className={`min-w-0 rounded-xl border border-forest-200 bg-white/90 px-3 py-2 shadow-sm sm:px-4 sm:py-2.5 ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.28em] text-forest-700">{label}</p>
      <p className="mt-1 truncate font-display text-lg text-forest-900 sm:text-2xl">{value}</p>
    </div>
  );
}

export function LiveCountChip({ count, label, icon, live = false, compactMobile = false, className = "" }) {
  return (
    <div
      className={`inline-flex h-9 min-w-0 flex-row items-center justify-center gap-2 rounded-full border border-forest-200 bg-forest-50/50 px-3 text-slate-800 ${className}`}
    >
      {live ? (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          <span className="live-dot-pulse h-3 w-3 rounded-full bg-forest-600" />
        </span>
      ) : (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-bark-500">{icon}</span>
      )}
      {live && <Radio className="h-4 w-4 shrink-0 text-forest-600" />}
      <span className="whitespace-nowrap text-sm font-medium text-slate-900">
        <span className={compactMobile ? "hidden sm:inline" : ""}>{label}: </span>
        <span className="font-bold">{count}</span>
      </span>
    </div>
  );
}

export function ScorePill({ label, value }) {
  return (
    <div className="w-full rounded-full border border-forest-200 bg-white px-4 py-2 text-center text-sm text-slate-700 shadow-sm sm:w-auto">
      <span className="text-forest-700">{label}: </span>
      <span className="font-semibold text-forest-900">{value}</span>
    </div>
  );
}

export function ResultCard({ label, value, tone }) {
  const toneStyles = {
    forest: "border-forest-200 bg-forest-50 text-forest-900",
    bark: "border-bark-200 bg-bark-50 text-bark-900",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
  };

  return (
    <div className={`rounded-xl border p-4 shadow-sm sm:p-5 ${toneStyles[tone]}`}>
      <p className="text-sm uppercase tracking-[0.25em]">{label}</p>
      <p className="mt-3 font-display text-3xl sm:text-4xl">{value}</p>
    </div>
  );
}

export function SidebarItem({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
        active
          ? "bg-bark-500 text-white shadow-sm"
          : "bg-forest-800/70 text-forest-50 hover:bg-forest-700"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function WeekItem({ active, label, bestScore, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border px-4 py-3 text-left text-sm transition ${
        active
          ? "rounded-l-xl rounded-r-none border-bark-400 bg-bark-500 text-white shadow-sm"
          : "rounded-xl border-forest-700 bg-forest-800/55 text-forest-50 hover:bg-forest-700"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate">{label}</span>
        <span className={`shrink-0 text-xs ${active ? "text-bark-50" : "text-forest-200"}`}>
          Best: {bestScore?.score ?? 0}/{bestScore?.total ?? 0}
        </span>
      </div>
    </button>
  );
}

export function DeveloperCard() {
  return (
    <div className="rounded-xl border border-bark-700/40 bg-forest-900 p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.28em] text-bark-300">Developer</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bark-100 text-sm font-semibold text-bark-700">
          AM
        </div>
        <div>
          <p className="font-semibold text-bark-400">Ashish Mishra</p>
          <p className="text-xs text-forest-100/75">Crafted for NPTEL exam practice</p>
        </div>
      </div>
    </div>
  );
}

export function NavbarUserChip({ user, onLogout }) {
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <img
        src={user.photoURL}
        alt={user.displayName}
        className="h-9 w-9 shrink-0 rounded-full border border-forest-200 object-cover"
        referrerPolicy="no-referrer"
      />
      <p className="hidden max-w-[180px] truncate text-sm font-medium text-forest-900 md:block">
        {user.displayName}
      </p>
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest-200 bg-white text-forest-700 transition hover:border-bark-200 hover:bg-bark-50 hover:text-bark-600"
        aria-label="Logout"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
