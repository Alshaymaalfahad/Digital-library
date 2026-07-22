import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CharacterAvatar from "./CharacterAvatar";
import { useApp } from "../context/AppContext";
import { childStats } from "../utils/mockStats";
import { buildNotifications } from "../utils/notifications";
import { getTodaySeconds } from "../utils/screenTime";

const LEVEL_LABELS = {
  beginner: "القارئ المبتدئ",
  intermediate: "المستوى: المستمر النشط",
  advanced: "القارئ المكتشف",
};

export default function ChildrenManagementPanel() {
  const { state, actions } = useApp();
  const navigate = useNavigate();

  const activeChild = state.children.find((c) => c.id === state.activeChildId) || state.children[0];

  // NOTE: notifications and reading history are only fully fetched for the
  // currently-active child (see AppContext) — with multiple children,
  // switching the active child refreshes this feed for that child too.
  const notifications = buildNotifications({
    child: activeChild,
    stories: state.stories,
    readingHistory: state.readingHistory,
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">ملفات الأطفال</h1>
          <p className="text-rawaa-grayDark text-sm">تابع تقدّم أطفالك، وحدّد وقت استخدامهم للموقع.</p>
        </div>
        <div className="flex items-center gap-2.5">
          {state.children.length > 0 && (
            <Link
              to="/choose-child"
              className="inline-flex items-center gap-2 border border-rawaa-red text-rawaa-red text-sm font-semibold rounded-full px-5 py-2.5 hover:bg-rawaa-redTint transition w-fit"
            >
              تبديل الطفل
            </Link>
          )}
          <Link
            to="/onboarding/child"
            className="inline-flex items-center gap-2 bg-rawaa-red text-white text-sm font-semibold rounded-full px-5 py-2.5 hover:bg-rawaa-redDark transition w-fit"
          >
            + إضافة طفل جديد
          </Link>
        </div>
      </div>

      {/* Children profiles */}
      <section className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6 mb-6">
        <h2 className="font-display font-bold text-lg mb-4">ملفات الأطفال</h2>
        {state.children.length === 0 ? (
          <p className="text-sm text-rawaa-grayDark">لم تُضِف أي طفل بعد.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {state.children.map((c) => {
              const stats = childStats(c.id);
              return (
                <div key={c.id} className="flex items-center gap-4 bg-rawaa-cream rounded-xl p-4">
                  <button
                    onClick={() => navigate(`/child-reports/${c.id}`)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-rawaa-grayDark hover:text-rawaa-red hover:bg-white transition shrink-0 order-2"
                    aria-label="إعدادات الطفل"
                  >
                    ⚙️
                  </button>
                  <CharacterAvatar characterId={c.characterId} gender={c.gender} size="md" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-rawaa-grayDark mb-1.5">
                      {LEVEL_LABELS[c.readingLevel] || "المستوى: مبتدئ"}
                    </div>
                    <div className="h-1.5 rounded-full bg-rawaa-gray overflow-hidden">
                      <div className="h-full bg-rawaa-red" style={{ width: `${stats.progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Notifications */}
        <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-5">
          <h3 className="font-display font-bold mb-4">🔔 تنبيهات حديثة</h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-rawaa-grayDark">لا توجد تنبيهات جديدة الآن.</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((n, i) => (
                <div key={i} className="flex gap-2.5">
                  <span>{n.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-rawaa-grayDark">{n.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Screen time settings */}
        <ScreenTimeSettings child={activeChild} onSave={actions.updateChildSettings} />
      </div>

      {/* Premium promo — marked as an upcoming AI feature */}
      <section className="relative overflow-hidden rounded-xl2 bg-rawaa-navy text-white p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <span className="inline-block text-[11px] font-semibold bg-white/15 rounded-full px-3 py-1 mb-3">
            ميزة الوالدين المميزة · قريباً
          </span>
          <h3 className="font-display text-xl font-bold mb-2">حلّل أداء طفلك بذكاء مع تقاريرنا المتطورة</h3>
          <p className="text-white/80 text-sm max-w-md">
            سنستخدم خوارزميات ذكية لتحديد مجالات اهتمام طفلك ومستوى مفرداته، ونقترح توصيات مخصصة لكل طفل بناءً على
            وتيرة تعلّمه الخاصة.
          </p>
        </div>
        <button
          disabled
          className="bg-white/20 text-white text-sm font-semibold rounded-full px-5 py-2.5 opacity-70 cursor-not-allowed whitespace-nowrap"
        >
          تحليل الذكاء العاطفي
        </button>
      </section>
    </div>
  );
}

function ScreenTimeSettings({ child, onSave }) {
  const [hours, setHours] = useState(Math.floor((child?.dailyScreenTimeMinutes || 0) / 60));
  const [minutes, setMinutes] = useState((child?.dailyScreenTimeMinutes || 0) % 60);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const usedSeconds = child ? getTodaySeconds(child.id) : 0;
  const usedMinutes = Math.floor(usedSeconds / 60);
  const limitMinutes = child?.dailyScreenTimeMinutes;

  async function handleSave() {
    if (!child) return;
    setSaving(true);
    setSaved(false);
    const total = Number(hours) * 60 + Number(minutes);
    try {
      await onSave(child.id, { dailyScreenTimeMinutes: total > 0 ? total : null });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-5">
      <h3 className="font-display font-bold mb-1">⏱ الوقت المسموح بالموقع</h3>
      <p className="text-xs text-rawaa-grayDark mb-4">
        حدد وقت الاستخدام اليومي المسموح به{child ? ` لـ ${child.name}` : ""} — عند انتهائه يُغلق الموقع تلقائياً
        ويُطلب من الطفل تسليم الجهاز.
      </p>

      {!child ? (
        <p className="text-sm text-rawaa-grayDark">أضف طفلاً أولاً لتفعيل هذي الميزة.</p>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <label className="text-xs text-rawaa-grayDark block mb-1">الساعات</label>
              <input
                type="number"
                min={0}
                max={12}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full rounded-lg border border-rawaa-gray px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-rawaa-grayDark block mb-1">الدقائق</label>
              <input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full rounded-lg border border-rawaa-gray px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-5 bg-rawaa-red text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
            >
              {saving ? "..." : "حفظ"}
            </button>
          </div>
          {saved && <p className="text-xs text-rawaa-green font-semibold mb-2">تم الحفظ ✓</p>}
          <div className="text-xs text-rawaa-grayDark">
            {limitMinutes ? (
              <>
                استخدام اليوم: <span className="font-semibold text-rawaa-ink">{usedMinutes}</span> من{" "}
                <span className="font-semibold text-rawaa-ink">{limitMinutes}</span> دقيقة
              </>
            ) : (
              "لا يوجد حد حالياً (استخدام غير محدود)."
            )}
          </div>
        </>
      )}
    </div>
  );
}
