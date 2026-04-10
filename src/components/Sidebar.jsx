import {
  BarChart3,
  ChevronDown,
  Home,
  Leaf,
  X,
} from "lucide-react";
import { DeveloperCard, SidebarItem, WeekItem } from "./ui";

export function Sidebar({
  screen,
  isWeeksOpen,
  setIsWeeksOpen,
  selectedDashboardWeek,
  weeklyStats,
  bestScores,
  onClose,
  onGoHome,
  onStartMarathon,
  onSelectWeek,
}) {
  return (
    <div className="flex h-full flex-col pb-5">
      <div className="mb-5 flex items-center justify-between lg:hidden">
        <p className="text-sm font-semibold text-forest-50">Navigation</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full border border-forest-700 bg-forest-800 p-2 text-forest-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-xl border border-forest-700 bg-forest-800/60 p-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-forest-700 bg-forest-900/70 px-4 py-2 text-sm text-forest-50">
          <Leaf className="h-4 w-4 text-bark-300" />
          Forest Management Hub
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <SidebarItem
          active={screen === "home"}
          icon={<Home className="h-4 w-4" />}
          label="Dashboard"
          onClick={onGoHome}
        />
        <SidebarItem
          active={false}
          icon={<BarChart3 className="h-4 w-4" />}
          label="Marathon Mode"
          onClick={onStartMarathon}
        />
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setIsWeeksOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-xl border border-forest-700 bg-forest-800/60 px-4 py-3 text-left text-sm font-medium text-forest-50 transition hover:bg-forest-700"
        >
          <span>Weeks 0-11</span>
          <ChevronDown className={`h-4 w-4 transition ${isWeeksOpen ? "rotate-180" : ""}`} />
        </button>

        {isWeeksOpen && (
          <div className="mt-3 space-y-2">
            {weeklyStats.map((item) => (
              <WeekItem
                key={item.week}
                active={selectedDashboardWeek === item.week}
                label={`Week ${item.week}`}
                bestScore={bestScores[item.week]}
                onClick={() => onSelectWeek(item.week)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 pb-6">
        <DeveloperCard />
      </div>
    </div>
  );
}

export function MobileSidebarOverlay({ open, children, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <aside
        className={`sidebar-scroll h-full w-[305px] overflow-y-auto border-r border-forest-700 bg-forest-900 p-5 shadow-ambient transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </aside>
    </div>
  );
}
