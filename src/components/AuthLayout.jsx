const ACCENTS = {
  red: { bg: "bg-rawaa-red" },
  navy: { bg: "bg-rawaa-navy" },
};

export default function AuthLayout({ title, subtitle, children, accent = "red" }) {
  const a = ACCENTS[accent] || ACCENTS.red;
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-rawaa-cream">
      <div className="flex flex-col justify-center px-6 py-10 md:px-16 order-2 md:order-1">
        <div className="mb-10 flex justify-end md:justify-start">
          <span className="font-arabic font-bold text-3xl text-rawaa-red">رواة</span>
        </div>
        <div className="w-full max-w-sm mx-auto">{children}</div>
      </div>
      <div className={`relative flex flex-col items-center justify-center ${a.bg} text-white p-10 md:p-12 overflow-hidden order-1 md:order-2 min-h-[280px] md:min-h-screen`}>
        <div className="relative z-10 text-center max-w-md">
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug">{title}</h2>
          {subtitle && <p className="mt-3 text-white/85">{subtitle}</p>}
          <img
            src="/images/brand/auth-illustration.png"
            alt="طفل يشير لأعلى برفقة جمل ونمر، أمام كتاب مفتوح"
            className="w-4/5 h-auto mt-8 rounded-2xl mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
