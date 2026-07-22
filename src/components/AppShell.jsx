import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { addTodaySeconds, getTodaySeconds } from "../utils/screenTime";

const NAV = [
  { to: "/home", label: "الرئيسية" },
  { to: "/library", label: "المكتبة" },
  { to: "/create-story", label: "إنشاء قصة", badge: "قريباً" },
];

const TICK_SECONDS = 15;

export default function AppShell({ children, hero }) {
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
            navigate("/");
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
      <header className={`z-30 ${hero ? "fixed inset-x-0 top-0" : "sticky top-0 bg-rawaa-cream"}`}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <img src="/images/brand/medad-logo.png" alt="مداد" className="h-8 w-auto" />
          <nav className="hidden sm:flex items-center">
            {NAV.map((item, i) => (
              <span key={item.to} className="flex items-center">
                {i > 0 && <span className="w-px h-4 bg-rawaa-ink/15 mx-1" />}
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-full text-sm font-semibold transition ${
                      isActive ? "bg-white text-rawaa-red shadow-sm" : "text-rawaa-ink/70 hover:text-rawaa-ink"
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
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              to="/profile"
              className="text-rawaa-ink/70 hover:text-rawaa-red transition shrink-0"
              aria-label="الملف الشخصي لولي الأمر"
              title={state.guardian?.name}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                <circle cx="12" cy="8.5" r="3.25" stroke="currentColor" strokeWidth="1.6" />
                <path d="M5 19c1.1-3.6 3.9-5.5 7-5.5s5.9 1.9 7 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>
        <nav className="sm:hidden flex items-center px-4 pb-2 overflow-x-auto">
          {NAV.map((item, i) => (
            <span key={item.to} className="flex items-center shrink-0">
              {i > 0 && <span className="w-px h-3.5 bg-rawaa-ink/15 mx-1" />}
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    isActive ? "bg-white text-rawaa-red shadow-sm" : "text-rawaa-ink/70"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </span>
          ))}
        </nav>
      </header>
      {hero}
      <main className="max-w-6xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
