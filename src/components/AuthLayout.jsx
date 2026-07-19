export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-rawaa-cream">
      <div className="flex flex-col justify-center px-6 py-10 md:px-16 order-2 md:order-1">
        <div className="mb-10 flex justify-end md:justify-start">
          <img src="/images/brand/medad-logo.png" alt="مداد" className="h-9 w-auto" />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
      <div className="relative flex flex-col items-center justify-center bg-rawaa-red text-white p-10 md:p-12 overflow-hidden order-1 md:order-2 min-h-[280px] md:min-h-screen">
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-rawaa-redDark/30" />
        <div className="absolute -bottom-24 -left-10 w-80 h-80 rounded-full bg-rawaa-redDark/25" />
        <div className="relative z-10 text-center max-w-md">
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug">{title}</h2>
          {subtitle && <p className="mt-3 text-white/85">{subtitle}</p>}
          <img
            src="/images/brand/auth-illustration.png"
            alt="طفل يشير لأعلى برفقة جمل ونمر، أمام كتاب مفتوح"
            className="w-full h-auto mt-8 rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
}
