import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Button, Field, Input } from "../components/Field";
import { useApp } from "../context/AppContext";

export default function VerifyEmail() {
  const { actions } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Email arrives via router state right after registration. If the page was
  // refreshed and we lost it, fall back to asking for it again.
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef([]);

  function handleChange(i, val) {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 3) inputs.current[i + 1]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await actions.confirmEmailOtp(email, code.join(""));
      navigate("/onboarding/guardian");
    } catch (err) {
      setError(err.message || "الرمز غير صحيح، تأكد وحاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    try {
      await actions.resendVerification(email);
      setInfo("تم إرسال رمز جديد إلى بريدك.");
    } catch (err) {
      setError(err.message || "تعذر إعادة الإرسال.");
    }
  }

  return (
    <AuthLayout
      title="تحقق من بريدك"
      subtitle="أرسلنا كود التحقق إلى بريدك الإلكتروني"
    >
      <h1 className="text-2xl font-bold mb-1">تحقق من بريدك</h1>
      <p className="text-sm text-rawaa-grayDark mb-6">
        أدخل رمز التحقق المكون من 4 أرقام الذي أرسلناه إلى بريدك الإلكتروني.
      </p>

      {!location.state?.email && (
        <Field label="البريد الإلكتروني">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
        </Field>
      )}
      {location.state?.email && (
        <p className="text-sm font-semibold text-rawaa-ink mb-6">{email}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 justify-center mb-6" dir="ltr">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={c}
              onChange={(e) => handleChange(i, e.target.value)}
              maxLength={1}
              inputMode="numeric"
              className="w-14 h-14 text-center text-xl font-bold rounded-xl border border-rawaa-gray focus:border-rawaa-red focus:ring-1 focus:ring-rawaa-red outline-none"
            />
          ))}
        </div>
        {error && <p className="text-sm text-red-600 mb-4 text-center">{error}</p>}
        {info && <p className="text-sm text-rawaa-green mb-4 text-center">{info}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "جارِ التحقق..." : "متابعة ←"}
        </Button>
      </form>

      <p className="text-sm text-center text-rawaa-grayDark mt-6">
        لم يصلك الكود؟{" "}
        <button onClick={handleResend} className="text-rawaa-ink font-semibold underline">
          إعادة إرسال
        </button>
      </p>
    </AuthLayout>
  );
}
