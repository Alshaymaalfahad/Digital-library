import { Fragment } from "react";
import { Link } from "react-router-dom";

function IconBook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 5.5c2.2-1 5-1.2 8-.2v13c-3-1-5.8-.8-8 .2v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 5.5c-2.2-1-5-1.2-8-.2v13c3-1 5.8-.8 8 .2v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrophy(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M7 4h10v3.5a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path
        d="M7 5H4.5a1 1 0 0 0-1 1.2c.35 1.7 1.4 3.15 3.5 3.6M17 5h2.5a1 1 0 0 1 1 1.2c-.35 1.7-1.4 3.15-3.5 3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M12 12.5V16M9 19.5h6M9.5 19.5c0-1.8.7-2.7 2.5-3 1.8.3 2.5 1.2 2.5 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFamily(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="8.5" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 19c.6-2.9 2.6-4.5 5-4.5s4.4 1.6 5 4.5M14 19c.4-2.1 1.8-3.3 3.8-3.3 1.6 0 2.9.9 3.5 2.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12.5" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v4.8l3.2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconStar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 4.5l2.2 4.5 4.9.7-3.6 3.5.9 4.9-4.4-2.3-4.4 2.3.9-4.9-3.6-3.5 4.9-.7L12 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMic(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="9.25" y="3.5" width="5.5" height="10" rx="2.75" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3M9.5 20.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3.5 5 6v5.2c0 4.3 2.9 7.9 7 9.3 4.1-1.4 7-5 7-9.3V6l-7-2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12.2l2 2 4-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: IconBook,
    title: "مكتبة قصص عربية أصيلة",
    desc: "عشرات القصص المولّدة بالذكاء الاصطناعي والمصممة خصيصاً لتنمية القيم واللغة لدى الأطفال.",
  },
  {
    icon: IconTrophy,
    title: "إنجازات تحفّز القراءة",
    desc: "شارات وتحديات تشجّع طفلك على إكمال قصص جديدة كل أسبوع.",
  },
  {
    icon: IconFamily,
    title: "لوحة تحكم لولي الأمر",
    desc: "تابع تقدّم كل طفل، القصص المفضلة، والوقت المُستهلك بكل سهولة.",
  },
  {
    icon: IconClock,
    title: "تحكّم بوقت الشاشة",
    desc: "حدّد وقتاً يومياً مناسباً، والموقع يُذكّر طفلك تلقائياً عند انتهائه.",
  },
  {
    icon: IconStar,
    title: "تقييم القصص",
    desc: "يقيّم طفلك كل قصة بعد قراءتها، وتصلك ملاحظاته مباشرة.",
  },
  {
    icon: IconMic,
    title: "السرد الصوتي",
    desc: "استماع للقصص بصوت عربي واضح ومناسب للأطفال.",
    soon: true,
  },
];

const TRUST_BADGES = ["القصص تتبع نهج الدين الإسلامي والقيم العربية", "خصوصية تامة لبيانات طفلك", "محتوى مصمم حسب الفئة العمرية"];

const STATS = [
  { icon: IconBook, value: "١٠٠+", label: "قصة مولّدة بالذكاء الاصطناعي" },
  { icon: IconShield, value: "١٠٠٪", label: "أمان للأطفال" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-rawaa-cream font-arabic" dir="rtl">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-rawaa-gray">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <img src="/images/brand/medad-logo.png" alt="مداد" className="h-8 w-auto" />
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-rawaa-ink hover:text-rawaa-red transition">
              تسجيل الدخول
            </Link>
            <Link
              to="/register"
              className="bg-rawaa-red text-white text-sm font-semibold rounded-full px-5 py-2.5 hover:bg-rawaa-redDark transition"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[700px] md:min-h-[960px] flex items-start justify-center overflow-hidden">
        <img
          src="/images/brand/hero-illustration.png"
          alt="طفل يشير لأعلى برفقة جمل ونمر، أمام قلعة صحراوية"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            maskImage: "radial-gradient(ellipse 78% 80% at 50% 45%, black 55%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 78% 80% at 50% 45%, black 55%, transparent 100%)",
          }}
        />
        <div className="relative z-10 text-center px-4 pt-16 pb-10 w-full max-w-2xl mx-auto">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            رُواء .. كل طفل راوٍ لحكايته
          </h1>
          <p className="text-white/95 mb-8 text-base md:text-lg drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
            مكتبة رقمية عربية تجعل من طفلك بطل قصته الخاصة — قصص مولّدة بالذكاء الاصطناعي،
            قيم أصيلة، ومتابعة كاملة لولي الأمر.
          </p>
        </div>

        {/* Stat badges */}
        <div className="absolute bottom-8 md:bottom-14 inset-x-0 z-20 px-4">
          <div className="flex items-center justify-center gap-5 md:gap-10">
            {STATS.map((s, i) => (
              <Fragment key={s.label}>
                {i > 0 && <div className="w-px h-12 md:h-14 bg-white/30 self-center" />}
                <div className="flex flex-col items-center text-center">
                  <s.icon className="w-6 h-6 md:w-7 md:h-7 text-rawaa-gold mb-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]" />
                  <div className="font-display font-bold text-white text-lg md:text-2xl leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                    {s.value}
                  </div>
                  <div className="text-xs md:text-sm text-white/90 mt-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">{s.label}</div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold bg-rawaa-redTint text-rawaa-red rounded-full px-3 py-1 mb-3">
            المزايا
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">كل ما يحتاجه طفلك بمكان واحد</h2>
          <p className="text-rawaa-grayDark max-w-xl mx-auto">
            من اختيار القصة إلى متابعة التقدّم، صمّمنا كل تفصيلة لتناسب الأطفال وتطمئن الأهل.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-6 relative"
            >
              {f.soon && (
                <span className="absolute top-4 left-4 text-[11px] font-semibold bg-rawaa-gold/15 text-rawaa-gold rounded-full px-2.5 py-1">
                  قريباً
                </span>
              )}
              <div className="w-12 h-12 rounded-full bg-rawaa-redTint text-rawaa-red flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold mb-1.5">{f.title}</h3>
              <p className="text-sm text-rawaa-grayDark leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Library brief */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <div className="w-16 h-16 rounded-full bg-rawaa-redTint text-rawaa-red flex items-center justify-center mx-auto mb-4">
            <IconBook className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">مكتبة رُواء</h2>
          <p className="text-rawaa-grayDark leading-loose max-w-2xl mx-auto mb-8">
            مجموعة متنامية من القصص العربية الأصيلة، مكتوبة خصيصاً للأطفال من سن ٤ إلى ١٢ سنة،
            وتغطّي قيماً تربوية متنوعة كالصدق والأمانة والتعاون والشجاعة، إلى جانب قصص المغامرات
            والتراث والاكتشاف.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap text-sm">
            <span className="bg-rawaa-cream rounded-full px-4 py-2 font-semibold">٤ – ١٢ سنة</span>
            <span className="bg-rawaa-cream rounded-full px-4 py-2 font-semibold">قيم تربوية أصيلة</span>
            <span className="bg-rawaa-cream rounded-full px-4 py-2 font-semibold">مغامرات وتراث واكتشاف</span>
          </div>
        </div>
      </section>

      {/* Trust & safety for parents */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="relative overflow-hidden rounded-xl2 bg-rawaa-navy text-white p-8 md:p-12 text-center">
          <span className="inline-block text-xs font-semibold bg-white/15 rounded-full px-3 py-1 mb-4">
            لولي الأمر
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">مصمم بثقة الأهل أولاً</h2>
          <p className="text-white/85 leading-loose max-w-2xl mx-auto mb-6">
            نلتزم في اختيار القيم وتصميم القصص والرسومات بما ينسجم مع قيمنا الإسلامية وعاداتنا
            وتقاليدنا الأصيلة. كما نستخدم أدوات الذكاء الاصطناعي بشفافية للمساعدة في إنتاج محتوى
            المكتبة، لنضمن محتوى آمناً ومناسباً لكل مرحلة عمرية.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {TRUST_BADGES.map((b) => (
              <div key={b} className="bg-white/10 rounded-full px-4 py-2.5 text-sm font-medium">
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-5 pb-20 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">هل أنتم مستعدون لبدء رحلة القراءة؟</h2>
        <Link
          to="/register"
          className="inline-block bg-rawaa-red text-white font-bold px-8 py-3.5 rounded-full hover:bg-rawaa-redDark transition shadow-card"
        >
          ابدأ الآن مجاناً
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-rawaa-gray py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-rawaa-grayDark">
          <span>© {new Date().getFullYear()} رُواء. جميع الحقوق محفوظة.</span>
          <div className="flex items-center gap-4">
            <span>سياسة الخصوصية</span>
            <span>شروط الاستخدام</span>
            <span>تواصل معنا</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
