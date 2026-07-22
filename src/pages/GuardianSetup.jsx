import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Field, Input, Button } from "../components/Field";
import { useApp } from "../context/AppContext";

export default function GuardianSetup() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("ar");
  const [notifications, setNotifications] = useState(true);
  const [region, setRegion] = useState("توقيت الرياض (GMT+3)");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await actions.updateGuardian({ language, notifications, region });
      navigate(state.children.length > 0 ? "/home" : "/onboarding/child");
    } catch (err) {
      setError(err.message || "تعذر حفظ البيانات، حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="نص متسامح ولي الأمر"
      subtitle="نحتاج لبعض المعلومات لتخصيص تجربة القصص المناسبة لعائلتك"
    >
      <h1 className="text-2xl font-bold mb-1">إعداد حساب ولي الأمر</h1>
      <p className="text-sm text-rawaa-grayDark mb-6">مرحباً {state.guardian?.name || ""} 👋</p>

      <form onSubmit={handleSubmit}>
        <Field label="اختر اللغة">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setLanguage("ar")}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
                language === "ar" ? "border-rawaa-red bg-rawaa-redTint text-rawaa-red" : "border-rawaa-gray"
              }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
                language === "en" ? "border-rawaa-red bg-rawaa-redTint text-rawaa-red" : "border-rawaa-gray"
              }`}
            >
              English
            </button>
          </div>
        </Field>

        <Field label="المنطقة الزمنية">
          <Input value={region} onChange={(e) => setRegion(e.target.value)} />
        </Field>

        <label className="flex items-center justify-between mb-6 py-2">
          <span className="text-sm text-rawaa-ink/80">تفعيل الإشعارات — أرسل لي تنبيهات حول نشاط طفلي</span>
          <button
            type="button"
            onClick={() => setNotifications((v) => !v)}
            className={`w-11 h-6 rounded-full relative transition ${notifications ? "bg-rawaa-red" : "bg-rawaa-gray"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
                notifications ? "right-0.5" : "right-5"
              }`}
            />
          </button>
        </label>

        <Button type="submit" disabled={submitting}>
          {submitting ? "جارِ الحفظ..." : "متابعة ←"}
        </Button>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </form>
    </AuthLayout>
  );
}
