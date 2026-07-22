import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Field, Input, Button } from "../components/Field";
import { useApp } from "../context/AppContext";

export default function AdminLogin() {
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
      navigate("/admin");
    } catch (err) {
      setError(err.message || "تعذر تسجيل الدخول، تحقق من البيانات.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      accent="navy"
      title="إدارة منصة رُواء"
      subtitle="تحكّم كامل بالمحتوى والمستخدمين من مكان واحد"
    >
      <Link to="/login" className="text-sm text-rawaa-grayDark hover:text-rawaa-ink mb-4 inline-block">
        ‹ رجوع لاختيار الحساب
      </Link>
      <h1 className="text-2xl font-bold mb-1">تسجيل دخول الإدمن</h1>
      <p className="text-sm text-rawaa-grayDark mb-6">للمشرفين المخوّلين فقط</p>

      <form onSubmit={handleSubmit}>
        <Field label="البريد الإلكتروني">
          <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </Field>
        <Field label="كلمة المرور">
          <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <Button type="submit" disabled={submitting} className="!bg-rawaa-navy hover:!bg-rawaa-navy/90">
          {submitting ? "جارِ الدخول..." : "تسجيل الدخول ←"}
        </Button>
      </form>
    </AuthLayout>
  );
}
