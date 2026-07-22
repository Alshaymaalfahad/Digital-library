import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import StoryCard from "../components/StoryCard";
import CharacterAvatar from "../components/CharacterAvatar";
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

  const hero = (
    <section className="relative min-h-[700px] md:min-h-[960px] flex items-start justify-center overflow-hidden">
      <img
        src="/images/brand/hero-illustration.png"
        alt="طفل يشير لأعلى برفقة جمل ونمر، أمام قلعة صحراوية"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          maskImage: "radial-gradient(ellipse 78% 80% at 50% 45%, black 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 78% 80% at 50% 45%, black 55%, transparent 100%)",
        }}
      />
      <div className="relative z-10 text-center px-4 pt-[100px] md:pt-[160px] pb-10 w-full max-w-2xl mx-auto">
        {activeChild && (
          <div className="inline-flex items-center gap-3 mb-6">
            <CharacterAvatar characterId={activeChild.characterId} gender={activeChild.gender} size="xl" bg="" />
            <div>
              <div className="font-display font-bold text-white text-lg drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] leading-none">
                {activeChild.name}
              </div>
              <div className="text-sm text-white/85 mt-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">{activeChild.age} سنوات</div>
            </div>
          </div>
        )}
        <h1 className="font-display text-2xl md:text-4xl font-extrabold mb-3 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          رواة .. كل طفل راوٍ لحكايته
        </h1>
        <p className="text-white/95 mb-6 max-w-xl mx-auto text-sm md:text-base drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
          أنشئ، استمتع، وانطلق في عالم خيالك من خلال قصص تفاعلية مولّدة بالذكاء الاصطناعي.
        </p>
        <Link
          to="/library"
          className="inline-block bg-rawaa-red text-white font-bold px-6 py-2.5 rounded-full hover:bg-rawaa-redDark transition shadow-card"
        >
          اقرأ قصتك الآن !
        </Link>
      </div>
    </section>
  );

  return (
    <AppShell hero={hero}>
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">إنجازات القراء الصغار</h2>
          <button
            onClick={() => navigate(activeChild ? `/child-reports/${activeChild.id}` : "/profile?tab=children")}
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
