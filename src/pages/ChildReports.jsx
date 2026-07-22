import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import ImageSlot from "../components/ImageSlot";
import StoryCard from "../components/StoryCard";
import SimpleBarChart from "../components/SimpleBarChart";
import { useApp } from "../context/AppContext";
import { childStats } from "../utils/mockStats";
import { computeAchievements } from "../utils/achievements";
import { computeChildReportStats } from "../utils/childReportStats";

export default function ChildReports() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();

  const child = state.children.find((c) => c.id === childId) || state.children[0];
  // "مستوى الصداقة" / character blurb still uses mock data — there's no real
  // signal for it yet (would need a proper "favourite character" concept).
  const mockExtras = childStats(child?.id || "demo");
  const favoriteStory =
    state.stories.length > 0 ? state.stories[(child?.id?.length || 3) % state.stories.length] : null;

  const achievements = computeAchievements({
    stories: state.stories,
    readingHistory: state.readingHistory,
  });

  const realStats = computeChildReportStats({
    readingHistory: state.readingHistory,
    stories: state.stories,
  });

  // NOTE: readingHistory/favorites in AppContext are already scoped to the
  // currently active child (see refreshChildData) — this report reflects
  // that child's data specifically, not the guardian's overall account.
  const favoriteStories = state.stories.filter((s) => state.favorites.includes(s.id));
  const history = [...state.readingHistory]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((h) => ({ ...h, story: state.stories.find((s) => s.id === h.storyId) }))
    .filter((h) => h.story);

  if (!favoriteStory) {
    return (
      <AppShell>
        <p className="text-rawaa-grayDark text-sm">جارِ تحميل بيانات التقرير...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">
            تقارير {child ? child.name : "الطفل"}
          </h1>
          <p className="text-rawaa-grayDark text-sm">تتبع نمو مهارات طفلك القرائية واللغوية</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-sm text-rawaa-ink font-semibold">
          ‹ رجوع
        </button>
      </div>

      <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6 mb-6">
        <h2 className="font-display font-bold mb-1">إنجازات {child ? child.name : "الطفل"}</h2>
        <p className="text-xs text-rawaa-grayDark mb-5">كل الشارات ومعايير الحصول عليها بالتفصيل</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`flex items-start gap-3 rounded-xl2 border p-4 ${
                a.achieved ? "border-rawaa-gold bg-rawaa-gold/5" : "border-rawaa-gray/60"
              }`}
            >
              <div className={`text-3xl shrink-0 ${a.achieved ? "" : "grayscale opacity-40"}`}>{a.icon}</div>
              <div>
                <div className="font-semibold text-sm mb-0.5">{a.label}</div>
                <div className="text-xs text-rawaa-grayDark mb-1.5">{a.desc}</div>
                {a.locked ? (
                  <span className="text-[11px] font-semibold text-rawaa-grayDark">🚧 {a.lockedReason}</span>
                ) : a.achieved ? (
                  <span className="text-[11px] font-semibold text-rawaa-green">تم الإنجاز ✓</span>
                ) : (
                  <span className="text-[11px] font-semibold text-rawaa-grayDark">
                    التقدم: {a.progress}/{a.target}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        {/* Favorite character card */}
        <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-4 h-fit">
          <div className="relative mb-3">
            <ImageSlot
              url={favoriteStory.cover?.imageUrl}
              basePath={`/images/stories/${favoriteStory.id}/cover`}
              prompt={favoriteStory.cover?.imagePrompt}
              ratio="aspect-[4/3]"
            />
            <span className="absolute top-2 right-2 bg-rawaa-redTint text-rawaa-red text-[11px] font-semibold rounded-full px-2.5 py-1">
              الشخصية المفضلة
            </span>
          </div>
          <h3 className="font-display font-bold mb-2">"{favoriteStory.title}"</h3>
          <p className="text-xs text-rawaa-grayDark leading-relaxed mb-4">
            يحب {child ? child.name : "طفلك"} متابعة مغامرات هذه القصة، وكرر قراءتها عدة مرات هذا الأسبوع، مما ساعده
            على تعلم كلمات مرتبطة بالبيئة والشجاعة.
          </p>
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold">{mockExtras.friendshipLevel}%</span>
              <span className="text-rawaa-grayDark">مستوى الصداقة</span>
            </div>
            <div className="h-2 rounded-full bg-rawaa-gray overflow-hidden">
              <div className="h-full bg-rawaa-red" style={{ width: `${mockExtras.friendshipLevel}%` }} />
            </div>
          </div>
          <button className="w-full rounded-xl bg-rawaa-redDark text-white text-sm font-semibold py-2.5">
            🖼 عرض ألبوم الصور
          </button>
        </div>

        {/* Stats + chart */}
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard
              icon="⏱"
              label="متوسط الجلسة"
              value={realStats.avgSessionMinutes > 0 ? `${realStats.avgSessionMinutes} دقيقة` : "لا توجد بيانات بعد"}
            />
            <StatCard icon="🧭" label="النوع المفضل" value={realStats.favoriteType} />
            <StatCard icon="📗" label="مفردات مكتسبة" value={realStats.vocabWords} />
          </div>

          <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold">نشاط القراءة الأسبوعي</h3>
              <span className="text-xs text-rawaa-grayDark">عدد مرات القراءة لكل يوم</span>
            </div>
            <SimpleBarChart data={realStats.weeklyActivity} valueKey="count" color="#1EA7DD" unit=" مرة" />
          </div>

          <div className="rounded-xl2 bg-rawaa-gray/30 p-6 flex flex-col justify-center">
            <p className="text-sm font-medium mb-3">
              هل تريد تعزيز مهارة الاستماع؟ بناءً على نشاط طفلك، نقترح سلسلة "رحلات الفضاء" المسموعة لزيادة التركيز.
            </p>
            <button className="self-start rounded-full bg-rawaa-red text-white text-sm font-semibold px-4 py-2">
              ابدأ التجربة الآن
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6 mb-6">
        <h2 className="font-display font-bold text-lg mb-5">سجل القراءة</h2>
        {history.length === 0 ? (
          <p className="text-sm text-rawaa-grayDark">لا يوجد سجل قراءة بعد.</p>
        ) : (
          <div className="space-y-3">
            {history.map((h) => (
              <Link
                key={h.storyId}
                to={`/story/${h.storyId}`}
                className="flex items-center gap-3 bg-rawaa-cream rounded-xl p-3 hover:bg-rawaa-gray/40 transition"
              >
                <ImageSlot
                  url={h.story.cover?.imageUrl}
                  basePath={`/images/stories/${h.story.id}/cover`}
                  prompt={h.story.cover?.imagePrompt}
                  ratio="aspect-square"
                  className="w-14 rounded-lg"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{h.story.title}</div>
                  <div className="text-xs text-rawaa-grayDark">
                    الصفحة {h.lastPage + 1} من {h.story.pages.length + 2}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6">
        <h2 className="font-display font-bold text-lg mb-5">القصص المفضلة</h2>
        {favoriteStories.length === 0 ? (
          <p className="text-sm text-rawaa-grayDark">لا توجد قصص مفضلة بعد.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteStories.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
      </div>
      <div className="font-display font-bold text-lg">{value}</div>
      <div className="text-xs text-rawaa-grayDark">{label}</div>
    </div>
  );
}
