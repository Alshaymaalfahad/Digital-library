import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import StoryCard from "../components/StoryCard";
import { useApp } from "../context/AppContext";
import { computeAchievements } from "../utils/achievements";

export default function Home() {
  const { state } = useApp();
  const navigate = useNavigate();
  const activeChild = state.children.find((c) => c.id === state.activeChildId) || state.children[0];
  const suggested = state.stories.slice(0, 6);

  const achievements = computeAchievements({
    stories: state.stories,
    readingHistory: state.readingHistory,
  });

  return (
    <AppShell>
      {/* Hero: illustration as a full background, text overlaid on top of it */}
      <section className="relative overflow-hidden rounded-xl2 bg-rawaa-red text-white mb-10 min-h-[800px] md:min-h-[500px] flex items-start">
        <img
          src="/images/brand/hero-illustration.png"
          alt="طفل يشير لأعلى برفقة جمل ونمر، أمام كتاب مفتوح"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 text-center px-1 pt-16 pb-10 w-full">
          <h1 className="font-display text-2xl md:text-4xl font-extrabold mb-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
            رُواء .. كل طفل راوٍ لحكايته
          </h1>
          <p className="text-white/95 mb-6 max-w-xl mx-auto text-sm md:text-base drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]">
            أنشئ، استمتع، وانطلق في عالم خيالك من خلال قصص تفاعلية تجعل من
            {activeChild ? ` "${activeChild.name}"` : " طفلك"} بطلاً لمغامراته الخاصة.
          </p>
          <Link
            to="/library"
            className="inline-block bg-white/90 text-rawaa-red font-bold px-6 py-2.5 rounded-full hover:bg-white transition"
          >
            اقرأ قصتك الآن !
          </Link>
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">إنجازات القراء الصغار</h2>
          <button
            onClick={() => navigate(activeChild ? `/child-reports/${activeChild.id}` : "/parent-dashboard")}
            className="text-sm text-rawaa-ink font-semibold shrink-0"
          >
            عرض الكل ›
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`bg-white rounded-xl2 border p-4 text-center shadow-card relative shrink-0 w-40 ${
                a.achieved ? "border-rawaa-gold" : "border-rawaa-gray/60"
              }`}
              title={a.locked ? a.lockedReason : a.desc}
            >
              <div className={`text-3xl mb-2 ${a.achieved ? "" : "grayscale opacity-40"}`}>{a.icon}</div>
              <div className="font-semibold text-sm mb-1">{a.label}</div>
              {a.locked ? (
                <div className="text-[11px] text-rawaa-grayDark">قريباً</div>
              ) : a.achieved ? (
                <div className="text-[11px] text-rawaa-green font-semibold">تم الإنجاز ✓</div>
              ) : (
                <div className="text-[11px] text-rawaa-grayDark">
                  {a.progress}/{a.target}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">قصص مقترحة لك</h2>
          <Link to="/library" className="text-sm text-rawaa-ink font-semibold">
            المزيد ›
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {state.loading.stories && suggested.length === 0 && (
            <p className="text-sm text-rawaa-grayDark col-span-full">جارِ تحميل القصص...</p>
          )}
          {suggested.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
