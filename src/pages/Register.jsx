import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Field, Input, Button } from "../components/Field";
import { useApp } from "../context/AppContext";

export default function Register() {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await actions.register(form);
      navigate(needsEmailConfirmation ? "/verify-email" : "/onboarding/guardian", {
        state: { email: form.email },
      });
    } catch (err) {
      setError(err.message || "تعذر إنشاء الحساب، حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="مرحباً بك في عالم المعرفة السحري"
      subtitle="انضم إلى رُواء وابدأ رحلة القراءة مع طفلك"
    >
      <h1 className="text-2xl font-bold mb-1">إنشاء حساب جديد</h1>
      <p className="text-sm text-rawaa-grayDark mb-6">ابدأ رحلتك اليوم</p>

      <form onSubmit={handleSubmit}>
        <Field label="الاسم الكامل">
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="اسمك الكامل"
          />
        </Field>
        <Field label="البريد الإلكتروني">
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@example.com"
          />
        </Field>
        <Field label="كلمة المرور">
          <Input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </Field>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <p className="text-xs text-rawaa-grayDark mb-5">
          بإنشائك الحساب فإنك توافق على <span className="text-rawaa-ink font-semibold">شروط الاستخدام</span> و
          <span className="text-rawaa-ink font-semibold"> سياسة الخصوصية</span>
        </p>
        <Button type="submit" disabled={submitting}>
          {submitting ? "جارِ الإنشاء..." : "إنشاء الحساب ←"}
        </Button>
      </form>

      <p className="text-sm text-center text-rawaa-grayDark mt-6">
        لديك حساب بالفعل؟{" "}
        <Link to="/login/parent" className="text-rawaa-ink font-semibold underline">
          تسجيل الدخول
        </Link>
      </p>
    </AuthLayout>
  );
}
