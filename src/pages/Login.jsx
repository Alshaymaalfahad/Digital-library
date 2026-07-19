import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Field, Input, Button } from "../components/Field";
import { useApp } from "../context/AppContext";

export default function Login() {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await actions.login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "تعذر تسجيل الدخول، تحقق من البيانات.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="عالم من القصص ينتظر طفلك"
      subtitle="سجّل دخولك وتابع رحلة القراءة العائلية"
    >
      <h1 className="text-2xl font-bold mb-1">تسجيل الدخول</h1>
      <p className="text-sm text-rawaa-grayDark mb-6">مرحباً بعودتك</p>

      <form onSubmit={handleSubmit}>
        <Field label="البريد الإلكتروني">
          <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </Field>
        <Field label="كلمة المرور">
          <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        <div className="flex justify-between text-xs text-rawaa-grayDark mb-6">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="accent-rawaa-red" /> تذكرني
          </label>
          <button type="button" className="text-rawaa-ink font-semibold">نسيت كلمة المرور؟</button>
        </div>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "جارِ الدخول..." : "تسجيل الدخول ←"}
        </Button>
      </form>

      <p className="text-sm text-center text-rawaa-grayDark mt-6">
        ليس لديك حساب؟{" "}
        <Link to="/register" className="text-rawaa-ink font-semibold underline">
          إنشاء حساب
        </Link>
      </p>
    </AuthLayout>
  );
}
