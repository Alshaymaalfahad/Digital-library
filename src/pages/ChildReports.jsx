import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import ImageSlot from "../components/ImageSlot";
import SimpleBarChart from "../components/SimpleBarChart";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabaseClient";
import { computeAchievements } from "../utils/achievements";
import { computeChildReportStats } from "../utils/childReportStats";

export default function ChildReports() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();

  const child = state.children.find((c) => c.id === childId) || state.children[0];

  // This report must reflect ONLY the child being viewed here — never
  // whichever child happens to be "active" elsewhere in the app (e.g. in the
  // child picker). state.readingHistory in AppContext is scoped to that
  // globally active child, so it's the wrong source here; fetch this child's
  // own reading_progress rows directly instead.
  const [readingHistory, setReadingHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!child?.id) return;
    setLoadingHistory(true);
    supabase
      .from("reading_progress")
      .select("story_id,last_page,updated_at,time_spent_seconds,rating")
      .eq("child_id", child.id)
      .then(({ data, error }) => {
        setLoadingHistory(false);
        if (error) return console.error(error);
        setReadingHistory(
          (data || []).map((p) => ({
            storyId: p.story_id,
            lastPage: p.last_page,
            updatedAt: p.updated_at,
            timeSpentSeconds: p.time_spent_seconds || 0,
            rating: p.rating || null,
          }))
        );
      });
  }, [child?.id]);

  const achievements = computeAchievements({
    stories: state.stories,
    readingHistory,
  });

  const realStats = computeChildReportStats({
    readingHistory,
    stories: state.stories,
  });

  const history = [...readingHistory]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((h) => ({ ...h, story: state.stories.find((s) => s.id === h.storyId) }))
    .filter((h) => h.story);

  if (state.stories.length === 0 || loadingHistory) {
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

      <div className="space-y-6 mb-6">
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

      <div className="rounded-xl2 bg-rawaa-gray/30 p-6 flex flex-col justify-center mb-6">
        <p className="text-sm font-medium mb-3">
          هل تريد تعزيز مهارة الاستماع؟ بناءً على نشاط طفلك، نقترح سلسلة "رحلات الفضاء" المسموعة لزيادة التركيز.
        </p>
        <button className="self-start rounded-full bg-rawaa-red text-white text-sm font-semibold px-4 py-2">
          ابدأ التجربة الآن
        </button>
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
