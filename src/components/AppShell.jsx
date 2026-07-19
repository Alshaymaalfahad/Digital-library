import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { addTodaySeconds, getTodaySeconds } from "../utils/screenTime";

const NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/library", label: "المكتبة" },
  { to: "/parent-dashboard", label: "ملفات الأطفال" },
  { to: "/create-story", label: "إنشاء قصة", badge: "قريباً" },
];

const TICK_SECONDS = 15;

export default function AppShell({ children }) {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const activeChild = state.children.find((c) => c.id === state.activeChildId) || state.children[0];
  const limitMinutes = activeChild?.dailyScreenTimeMinutes;
  const [locked, setLocked] = useState(false);

  // Tick the child's daily usage while the app is open, and lock once the
  // guardian-configured limit is reached.
  useEffect(() => {
    if (!activeChild?.id || !limitMinutes) {
      setLocked(false);
      return;
    }
    const limitSeconds = limitMinutes * 60;
    setLocked(getTodaySeconds(activeChild.id) >= limitSeconds);

    const interval = setInterval(() => {
      const total = addTodaySeconds(activeChild.id, TICK_SECONDS);
      if (total >= limitSeconds) setLocked(true);
    }, TICK_SECONDS * 1000);

    return () => clearInterval(interval);
  }, [activeChild?.id, limitMinutes]);

  if (locked) {
    return (
      <div className="min-h-screen bg-rawaa-red text-white flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">⏰</div>
        <h1 className="font-display text-2xl font-bold mb-2">انتهى وقتك المسموح لهذا اليوم!</h1>
        <p className="text-white/85 max-w-sm mb-8">
          أحسنت بالقراءة اليوم يا {activeChild?.name}! سلّم الجهاز الآن لولي أمرك. الوقت يتجدد غداً 🌙
        </p>
        <button
          onClick={async () => {
            await actions.logout();
            navigate("/login");
          }}
          className="bg-white text-rawaa-red font-bold px-6 py-2.5 rounded-full"
        >
          تسجيل الخروج
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rawaa-cream">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-rawaa-gray">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <img src="/images/brand/medad-logo.png" alt="مداد" className="h-8 w-auto" />
          <nav className="hidden sm:flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-full text-sm font-semibold transition ${
                    isActive ? "bg-rawaa-redTint text-rawaa-red" : "text-rawaa-ink/70 hover:bg-rawaa-gray/60"
                  }`
                }
              >
                {item.label}
                {item.badge && (
                  <span className="absolute -top-2 -left-2 bg-rawaa-gold text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            {activeChild && (
              <div className="flex items-center gap-1.5 bg-rawaa-gray/40 rounded-full pl-1.5 pr-1 py-1">
                {state.children.length > 1 ? (
                  <select
                    value={activeChild?.id}
                    onChange={(e) => actions.setActiveChild(e.target.value)}
                    className="text-xs bg-transparent outline-none max-w-[80px] truncate"
                  >
                    {state.children.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-rawaa-ink/80 max-w-[80px] truncate">{activeChild.name}</span>
                )}
                <span
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-base shrink-0"
                  title={activeChild.name}
                  aria-label={activeChild.gender === "girl" ? "شخصية بنت" : "شخصية ولد"}
                >
                  {activeChild.gender === "girl" ? "👧" : "👦"}
                </span>
              </div>
            )}
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full bg-rawaa-red text-white flex items-center justify-center text-sm font-bold shrink-0"
              aria-label="الملف الشخصي لولي الأمر"
              title={state.guardian?.name}
            >
              {state.guardian?.name?.[0] || "و"}
            </Link>
            <button
              onClick={async () => {
                await actions.logout();
                navigate("/login");
              }}
              className="text-xs text-rawaa-grayDark hover:text-rawaa-red"
            >
              خروج
            </button>
          </div>
        </div>
        <nav className="sm:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                  isActive ? "bg-rawaa-redTint text-rawaa-red" : "text-rawaa-ink/70"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
