import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import StoryCard from "../components/StoryCard";
import ImageSlot from "../components/ImageSlot";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabaseClient";

const TABS = [
  { id: "info", label: "معلوماتي الشخصية", icon: "👤" },
  { id: "history", label: "سجل القراءة", icon: "🕘" },
  { id: "favorites", label: "القصص المفضلة", icon: "♡" },
  { id: "notifications", label: "الإشعارات", icon: "🔔" },
  { id: "privacy", label: "الخصوصية والأمان", icon: "🛡️" },
  { id: "support", label: "الدعم والملاحظات", icon: "💬" },
];

export default function Profile() {
  const { state, actions } = useApp();
  const [tab, setTab] = useState("info");
  const [dailyReminders, setDailyReminders] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [language, setLanguage] = useState("العربية (الافتراضية)");

  const favoriteStories = state.stories.filter((s) => state.favorites.includes(s.id));
  const history = [...state.readingHistory]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((h) => ({ ...h, story: state.stories.find((s) => s.id === h.storyId) }))
    .filter((h) => h.story);

  const continueReading = history[0];

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold mb-6">الملف الشخصي والإعدادات</h1>

      <div className="grid md:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <div>
          <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card overflow-hidden mb-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-right border-r-2 transition ${
                  tab === t.id
                    ? "bg-rawaa-redTint text-rawaa-red border-rawaa-red font-semibold"
                    : "border-transparent text-rawaa-ink/80 hover:bg-rawaa-gray/40"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-rawaa-navy text-white flex items-center justify-center text-xl font-bold mb-3">
              {state.guardian?.name?.[0] || "و"}
            </div>
            <div className="font-bold">{state.guardian?.name || "ولي الأمر"}</div>
            <div className="text-xs text-rawaa-grayDark mt-1">
              عضو منذ {state.guardian?.joinedAt ? new Date(state.guardian.joinedAt).getFullYear() : new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {tab === "info" && (
            <>
              <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-lg">المعلومات الأساسية</h2>
                  <button className="text-sm text-rawaa-ink font-semibold">تعديل ✎</button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <InfoField label="الاسم الكامل" value={state.guardian?.name || "—"} />
                  <InfoField label="البريد الإلكتروني" value={state.guardian?.email || "—"} />
                  <InfoField label="رقم الجوال" value={state.guardian?.phone || "+966 5X XXX XXXX"} />
                  <InfoField label="تاريخ الانضمام" value={new Date().toLocaleDateString("ar-SA")} />
                </div>
              </div>

              <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-lg">واصل القراءة</h2>
                  <button onClick={() => setTab("history")} className="text-sm text-rawaa-ink font-semibold">
                    عرض السجل الكامل
                  </button>
                </div>
                <div className="grid md:grid-cols-[1fr_1.3fr] gap-4">
                  <div className="space-y-3">
                    {history.slice(0, 2).map((h) => (
                      <Link
                        key={h.storyId}
                        to={`/story/${h.storyId}`}
                        className="flex items-center gap-3 bg-rawaa-cream rounded-xl p-2.5 hover:bg-rawaa-gray/40 transition"
                      >
                        <ImageSlot
                          url={h.story.cover?.imageUrl}
                          basePath={`/images/stories/${h.story.id}/cover`}
                          prompt={h.story.cover?.imagePrompt}
                          ratio="aspect-square"
                          className="w-12 rounded-lg"
                        />
                        <div>
                          <div className="text-sm font-semibold">{h.story.title}</div>
                          <div className="text-xs text-rawaa-grayDark">آخر قراءة قبل قليل</div>
                        </div>
                      </Link>
                    ))}
                    {history.length === 0 && (
                      <p className="text-sm text-rawaa-grayDark">لم تبدأ القراءة بعد — جرّب قصة من المكتبة!</p>
                    )}
                  </div>
                  {continueReading && (
                    <Link
                      to={`/story/${continueReading.storyId}`}
                      className="relative rounded-xl2 overflow-hidden bg-rawaa-red text-white flex items-end p-5 min-h-[160px]"
                    >
                      <ImageSlot
                        url={continueReading.story.cover?.imageUrl}
                        basePath={`/images/stories/${continueReading.story.id}/cover`}
                        prompt={continueReading.story.cover?.imagePrompt}
                        ratio="aspect-auto"
                        className="absolute inset-0 h-full opacity-40 border-0 rounded-none"
                      />
                      <div className="relative z-10 w-full">
                        <span className="text-[11px] bg-white/20 rounded-full px-2 py-0.5">آخر قراءة</span>
                        <h3 className="font-display font-bold mt-2 mb-2">{continueReading.story.title}</h3>
                        <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
                          <div
                            className="h-full bg-white"
                            style={{
                              width: `${Math.min(100, (continueReading.lastPage / (continueReading.story.pages.length || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-lg">القصص المفضلة</h2>
                  <button onClick={() => setTab("favorites")} className="text-sm text-rawaa-ink font-semibold">
                    عرض الكل
                  </button>
                </div>
                {favoriteStories.length === 0 ? (
                  <p className="text-sm text-rawaa-grayDark">لا توجد قصص مفضلة بعد.</p>
                ) : (
                  <div className="grid sm:grid-cols-3 gap-4">
                    {favoriteStories.slice(0, 3).map((s) => (
                      <StoryCard key={s.id} story={s} />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6">
                <h2 className="font-display font-bold text-lg mb-5">تفضيلات الحساب</h2>
                <ToggleRow
                  label="إشعارات القراءة اليومية"
                  hint="تلقّي تنبيهات لتحفيز الأطفال على القراءة"
                  checked={dailyReminders}
                  onChange={() => setDailyReminders((v) => !v)}
                />
                <ToggleRow
                  label="الوضع الليلي التلقائي"
                  hint="تغيير واجهة التطبيق تلقائياً عند حلول المساء"
                  checked={nightMode}
                  onChange={() => setNightMode((v) => !v)}
                />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">لغة واجهة المستخدم</div>
                    <div className="text-xs text-rawaa-grayDark">اختر اللغة المفضلة لتصفح التطبيق</div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-sm rounded-full border border-rawaa-gray px-3 py-1.5"
                  >
                    <option>العربية (الافتراضية)</option>
                    <option>English</option>
                  </select>
                </div>
                <button onClick={actions.logout} className="mt-4 text-rawaa-ink text-sm font-semibold underline">
                  ← تسجيل الخروج
                </button>
              </div>
            </>
          )}

          {tab === "history" && (
            <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6">
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
          )}

          {tab === "favorites" && (
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
          )}

          {tab === "notifications" && (
            <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6">
              <h2 className="font-display font-bold text-lg mb-5">الإشعارات</h2>
              <ToggleRow label="بريد إلكتروني" hint="ملخص أسبوعي وتحديثات مهمة" checked onChange={() => {}} />
              <ToggleRow label="رسائل SMS" hint="تنبيهات فورية للأحداث المهمة" checked={false} onChange={() => {}} />
              <ToggleRow label="داخل التطبيق" hint="مركز الإشعارات داخل رُواء" checked onChange={() => {}} />
            </div>
          )}

          {tab === "privacy" && (
            <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6">
              <h2 className="font-display font-bold text-lg mb-3">الخصوصية والأمان</h2>
              <p className="text-sm text-rawaa-grayDark leading-relaxed mb-4">
                نلتزم بحماية بيانات طفلك وفق نظام حماية البيانات الشخصية السعودي (PDPL). لا نجمع صوراً أو موقعاً
                جغرافياً أو بيانات تواصل خاصة بالطفل.
              </p>
              <button className="text-sm text-rawaa-ink font-semibold underline">تنزيل نسخة من بياناتي</button>
              <br />
              <button className="text-sm text-red-600 font-semibold mt-2">حذف الحساب وكل البيانات المرتبطة</button>
            </div>
          )}

          {tab === "support" && <SupportTab />}
        </div>
      </div>
    </AppShell>
  );
}

function SupportTab() {
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const CATEGORIES = [
    { id: "general", label: "استفسار عام" },
    { id: "bug", label: "مشكلة تقنية" },
    { id: "suggestion", label: "اقتراح" },
    { id: "complaint", label: "شكوى" },
  ];
  const STATUS_LABEL = { open: "قيد الانتظار", in_progress: "قيد المعالجة", resolved: "تم الحل" };

  async function loadHistory() {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("feedback")
      .select("id,category,message,status,created_at")
      .order("created_at", { ascending: false });
    setHistory(data || []);
    setLoadingHistory(false);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("feedback")
        .insert({ guardian_id: user.id, category, message });
      if (error) throw error;
      setMessage("");
      setSuccess(true);
      loadHistory();
    } catch (err) {
      setError(err.message || "تعذر إرسال الرسالة، حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6">
        <h2 className="font-display font-bold text-lg mb-1">الدعم والملاحظات</h2>
        <p className="text-sm text-rawaa-grayDark mb-5">
          واجهتك مشكلة أو عندك اقتراح؟ راسلنا وفريقنا بيتواصل معك.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold border ${
                  category === c.id ? "border-rawaa-red bg-rawaa-redTint text-rawaa-red" : "border-rawaa-gray text-rawaa-grayDark"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            rows={4}
            className="w-full rounded-xl border border-rawaa-gray bg-white px-4 py-2.5 text-sm focus:border-rawaa-red focus:ring-1 focus:ring-rawaa-red outline-none mb-4"
          />
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {success && <p className="text-sm text-rawaa-green mb-3">تم إرسال رسالتك، شكراً لتواصلك معنا!</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-rawaa-red text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50"
          >
            {submitting ? "جارِ الإرسال..." : "إرسال"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6">
        <h3 className="font-display font-bold mb-4">رسائلي السابقة</h3>
        {loadingHistory ? (
          <p className="text-sm text-rawaa-grayDark">جارِ التحميل...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-rawaa-grayDark">ما رسلتي أي رسالة بعد.</p>
        ) : (
          <div className="space-y-3">
            {history.map((f) => (
              <div key={f.id} className="border border-rawaa-gray/60 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-rawaa-grayDark">
                    {new Date(f.created_at).toLocaleDateString("ar-SA")}
                  </span>
                  <span className="text-[11px] bg-rawaa-gray/60 rounded-full px-2 py-0.5">
                    {STATUS_LABEL[f.status]}
                  </span>
                </div>
                <p className="text-sm">{f.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <div className="text-xs text-rawaa-grayDark mb-1">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-rawaa-gray/60 last:border-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-rawaa-grayDark">{hint}</div>
      </div>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full relative transition shrink-0 ${checked ? "bg-rawaa-red" : "bg-rawaa-gray"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${checked ? "right-0.5" : "right-5"}`} />
      </button>
    </div>
  );
}
