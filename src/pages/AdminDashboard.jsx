import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { supabase } from "../lib/supabaseClient";

const TABS = [
  { id: "overview", label: "نظرة عامة والحسابات" },
  { id: "ratings", label: "تقييمات القصص" },
  { id: "stories", label: "مراجعة القصص المولدة" },
  { id: "feedback", label: "الشكاوى والملاحظات" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-medad-900 mb-1">لوحة تحكم الأدمن</h1>
        <p className="text-medad-gray500 text-sm">نظرة عامة على حسابات المنصة ومحتواها</p>
      </div>

      <div className="flex items-center gap-2 mb-8 border-b border-medad-gray200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
              tab === t.id ? "border-medad-500 text-medad-700" : "border-transparent text-medad-gray500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "ratings" && <RatingsTab />}
      {tab === "stories" && <StoriesReviewTab />}
      {tab === "feedback" && <FeedbackTab />}
    </AdminShell>
  );
}

// ---------------------------------------------------------------------------
function OverviewTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ guardians: 0, children: 0, stories: 0 });
  const [accounts, setAccounts] = useState([]);
  const [impersonating, setImpersonating] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const [profilesRes, childrenRes, storiesRes] = await Promise.all([
        supabase.from("profiles").select("id,name,email,is_admin,created_at"),
        supabase.from("children").select("id,guardian_id,name"),
        supabase.from("stories").select("id", { count: "exact", head: true }),
      ]);

      if (profilesRes.error || childrenRes.error || storiesRes.error) {
        setError(
          (profilesRes.error || childrenRes.error || storiesRes.error).message ||
            "تعذر تحميل بيانات لوحة التحكم — تأكد أن حسابك عليه صلاحية أدمن (is_admin) وأن migration الأدمن اشتغلت."
        );
        setLoading(false);
        return;
      }

      const profiles = profilesRes.data || [];
      const childrenRows = childrenRes.data || [];
      const childrenCountByGuardian = {};
      for (const c of childrenRows) {
        childrenCountByGuardian[c.guardian_id] = (childrenCountByGuardian[c.guardian_id] || 0) + 1;
      }

      setStats({ guardians: profiles.length, children: childrenRows.length, stories: storiesRes.count || 0 });
      setAccounts(
        profiles
          .map((p) => ({ ...p, childrenCount: childrenCountByGuardian[p.id] || 0 }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
      setLoading(false);
    }
    load();
  }, []);

  async function handleImpersonate(userId, email) {
    setImpersonating(userId);
    try {
      const { data, error } = await supabase.functions.invoke("impersonate", {
        body: { target_user_id: userId },
      });
      if (error) throw error;
      if (data?.action_link) {
        window.open(data.action_link, "_blank");
      } else {
        alert(data?.error || "تعذر توليد رابط الدخول.");
      }
    } catch (err) {
      alert(
        "تعذر تنفيذ الدخول بالنيابة. تأكد أن الـ Edge Function 'impersonate' منشورة (supabase functions deploy impersonate).\n\n" +
          (err.message || "")
      );
    } finally {
      setImpersonating(null);
    }
  }

  return (
    <>
      {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-4 mb-6">{error}</div>}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon="👪" label="أولياء الأمور" value={stats.guardians} />
        <StatCard icon="🧒" label="الأطفال المسجّلون" value={stats.children} />
        <StatCard icon="📚" label="القصص بالمكتبة" value={stats.stories} />
      </div>

      <div className="bg-white rounded-xl border border-medad-gray200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-medad-gray200">
          <h2 className="font-display font-bold text-medad-900">الحسابات</h2>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-medad-gray500">جارِ التحميل...</p>
        ) : accounts.length === 0 ? (
          <p className="p-6 text-sm text-medad-gray500">لا توجد حسابات بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-medad-gray500 border-b border-medad-gray200">
                  <th className="py-3 px-5 font-medium">الاسم</th>
                  <th className="py-3 px-5 font-medium">البريد الإلكتروني</th>
                  <th className="py-3 px-5 font-medium">عدد الأطفال</th>
                  <th className="py-3 px-5 font-medium">الدور</th>
                  <th className="py-3 px-5 font-medium">تاريخ التسجيل</th>
                  <th className="py-3 px-5 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-b border-medad-gray100 last:border-0">
                    <td className="py-3 px-5 font-medium text-medad-900">{a.name || "—"}</td>
                    <td className="py-3 px-5 text-medad-gray500">{a.email}</td>
                    <td className="py-3 px-5">{a.childrenCount}</td>
                    <td className="py-3 px-5">
                      {a.is_admin ? (
                        <span className="text-[11px] font-semibold bg-medad-100 text-medad-700 rounded-full px-2.5 py-1">
                          أدمن
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold bg-medad-gray100 text-medad-gray700 rounded-full px-2.5 py-1">
                          ولي أمر
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-medad-gray500">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString("ar-SA") : "—"}
                    </td>
                    <td className="py-3 px-5">
                      {!a.is_admin && (
                        <button
                          onClick={() => handleImpersonate(a.id, a.email)}
                          disabled={impersonating === a.id}
                          className="text-xs font-semibold text-medad-600 hover:text-medad-800 disabled:opacity-50"
                        >
                          {impersonating === a.id ? "جارِ التوليد..." : "تسجيل دخول كهذا الحساب ↗"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
function RatingsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      const [storiesRes, ratingsRes] = await Promise.all([
        supabase.from("stories").select("id,title,type"),
        supabase.from("reading_progress").select("story_id,rating").not("rating", "is", null),
      ]);
      if (storiesRes.error || ratingsRes.error) {
        setError((storiesRes.error || ratingsRes.error).message);
        setLoading(false);
        return;
      }

      const byStory = {};
      for (const r of ratingsRes.data || []) {
        if (!byStory[r.story_id]) byStory[r.story_id] = [];
        byStory[r.story_id].push(r.rating);
      }

      const combined = (storiesRes.data || [])
        .map((s) => {
          const ratings = byStory[s.id] || [];
          const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
          return { ...s, avg, count: ratings.length };
        })
        .sort((a, b) => (b.avg || 0) - (a.avg || 0));

      setRows(combined);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-medad-gray200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-medad-gray200">
        <h2 className="font-display font-bold text-medad-900">متوسط تقييم كل قصة (من ٥)</h2>
        <p className="text-xs text-medad-gray500 mt-1">مبني على تقييمات الأطفال الفعلية بعد إنهاء كل قصة</p>
      </div>
      {error && <div className="p-4 text-sm text-red-700 bg-red-50">{error}</div>}
      {loading ? (
        <p className="p-6 text-sm text-medad-gray500">جارِ التحميل...</p>
      ) : rows.length === 0 ? (
        <p className="p-6 text-sm text-medad-gray500">لا توجد قصص بعد.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-medad-gray500 border-b border-medad-gray200">
                <th className="py-3 px-5 font-medium">القصة</th>
                <th className="py-3 px-5 font-medium">النوع</th>
                <th className="py-3 px-5 font-medium">متوسط التقييم</th>
                <th className="py-3 px-5 font-medium">عدد التقييمات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-medad-gray100 last:border-0">
                  <td className="py-3 px-5 font-medium text-medad-900">{r.title}</td>
                  <td className="py-3 px-5 text-medad-gray500">{r.type}</td>
                  <td className="py-3 px-5">
                    {r.avg ? (
                      <span className="font-semibold text-medad-700">⭐ {r.avg.toFixed(1)}</span>
                    ) : (
                      <span className="text-medad-gray500">لا يوجد تقييم بعد</span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-medad-gray500">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function StoriesReviewTab() {
  return (
    <div className="bg-white rounded-xl border border-medad-gray200 shadow-sm p-10 text-center">
      <div className="text-4xl mb-3">📝</div>
      <h2 className="font-display font-bold text-medad-900 mb-2">مراجعة القصص المولدة بالذكاء الاصطناعي</h2>
      <p className="text-sm text-medad-gray500 max-w-md mx-auto">
        هذه الخانة جاهزة كواجهة، وسيتم تفعيلها وربطها بمحرك توليد القصص عندما تُبنى تلك الميزة — حالياً لا توجد قصص
        مولدة تحتاج مراجعة لأن الميزة نفسها لسا معطّلة.
      </p>
      <span className="inline-block mt-4 text-[11px] font-semibold bg-medad-50 text-medad-700 rounded-full px-3 py-1.5">
        🚧 قريباً — نطوّر زيادة
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
function FeedbackTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("feedback")
        .select("id,category,message,status,created_at,guardian_id,profiles(name,email)")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id, status) {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, status } : i)));
    await supabase.from("feedback").update({ status }).eq("id", id);
  }

  const CATEGORY_LABEL = { bug: "مشكلة تقنية", suggestion: "اقتراح", complaint: "شكوى", general: "عام" };
  const STATUS_LABEL = { open: "جديد", in_progress: "قيد المعالجة", resolved: "تم الحل" };

  return (
    <div className="bg-white rounded-xl border border-medad-gray200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-medad-gray200">
        <h2 className="font-display font-bold text-medad-900">الشكاوى والملاحظات الواردة من أولياء الأمور</h2>
      </div>
      {error && <div className="p-4 text-sm text-red-700 bg-red-50">{error}</div>}
      {loading ? (
        <p className="p-6 text-sm text-medad-gray500">جارِ التحميل...</p>
      ) : items.length === 0 ? (
        <p className="p-6 text-sm text-medad-gray500">لا توجد رسائل بعد.</p>
      ) : (
        <div className="divide-y divide-medad-gray100">
          {items.map((f) => (
            <div key={f.id} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-medad-900">
                    {f.profiles?.name || f.profiles?.email || "مستخدم"}
                  </span>
                  <span className="text-[11px] bg-medad-50 text-medad-700 rounded-full px-2 py-0.5">
                    {CATEGORY_LABEL[f.category] || f.category}
                  </span>
                </div>
                <span className="text-xs text-medad-gray500">
                  {new Date(f.created_at).toLocaleDateString("ar-SA")}
                </span>
              </div>
              <p className="text-sm text-medad-gray700 mb-3">{f.message}</p>
              <div className="flex items-center gap-2">
                {Object.entries(STATUS_LABEL).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => updateStatus(f.id, key)}
                    className={`text-[11px] font-semibold rounded-full px-3 py-1 border transition ${
                      f.status === key
                        ? "bg-medad-600 text-white border-medad-600"
                        : "border-medad-gray200 text-medad-gray500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-medad-gray200 shadow-sm p-5 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-display font-bold text-2xl text-medad-900">{value}</div>
      <div className="text-xs text-medad-gray500">{label}</div>
    </div>
  );
}
