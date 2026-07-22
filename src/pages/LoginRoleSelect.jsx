import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const ROLES = [
  {
    to: "/login/parent",
    label: "ولي الأمر",
    desc: "الدخول ومتابعة الطفل",
    iconBg: "bg-rawaa-redTint text-rawaa-red",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path
          d="M12 12.5c2.07 0 3.75-1.68 3.75-3.75S14.07 5 12 5 8.25 6.68 8.25 8.75 9.93 12.5 12 12.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M4.5 19.25c.9-3.2 3.7-5.25 7.5-5.25s6.6 2.05 7.5 5.25"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: "/login/admin",
    label: "الإدمن",
    desc: "التحكم بالمنصة",
    iconBg: "bg-rawaa-navy/10 text-rawaa-navy",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path
          d="M12 3.5 5 6v5.2c0 4.3 2.9 7.9 7 9.3 4.1-1.4 7-5 7-9.3V6l-7-2.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9 12.2l2 2 4-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function LoginRoleSelect() {
  return (
    <AuthLayout
      title="عالم من القصص ينتظر طفلك"
      subtitle="سجّل دخولك وتابع رحلة القراءة العائلية"
    >
      <div className="flex flex-col items-center text-center">
        <div className="text-rawaa-red flex items-center justify-center mb-5">
          <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
            <path
              d="M4 5.5c2.2-1 5-1.2 8-.2v13c-3-1-5.8-.8-8 .2v-13Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M20 5.5c-2.2-1-5-1.2-8-.2v13c3-1 5.8-.8 8 .2v-13Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold mb-1">مرحباً بك في رُواء!</h1>
        <p className="text-sm text-rawaa-grayDark mb-8"></p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ROLES.map((role) => (
          <Link
            key={role.to}
            to={role.to}
            className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-5 flex flex-col items-center gap-3 hover:border-rawaa-red hover:shadow-lg transition"
          >
            <span className={`w-14 h-14 rounded-full flex items-center justify-center ${role.iconBg}`}>{role.icon}</span>
            <span className="font-display font-bold text-sm">{role.label}</span>
            <span className="text-xs text-rawaa-grayDark -mt-2">{role.desc}</span>
          </Link>
        ))}
      </div>

      <p className="text-sm text-center text-rawaa-grayDark mt-8">
        ليس لديك حساب؟{" "}
        <Link to="/register" className="text-rawaa-ink font-semibold underline">
          إنشاء حساب
        </Link>
      </p>
    </AuthLayout>
  );
}
