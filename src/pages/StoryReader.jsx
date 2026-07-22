import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import ImageSlot from "../components/ImageSlot";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabaseClient";

function IconChevron(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StoryReader() {
  const { id } = useParams();
  const { state, actions } = useApp();
  const story = state.stories.find((s) => s.id === Number(id));

  // Build a flat list of "slides": cover, then each page, then back cover
  const slides = useMemo(() => {
    if (!story) return [];
    return [
      { kind: "cover", ...story.cover },
      ...story.pages.map((p) => ({ kind: "page", ...p })),
      { kind: "back", ...story.backCover },
    ];
  }, [story]);

  const savedProgress = state.readingHistory.find((h) => h.storyId === Number(id));
  const [index, setIndex] = useState(savedProgress ? Math.min(savedProgress.lastPage, slides.length - 1) : 0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [audioUrls, setAudioUrls] = useState({}); // pageNumber -> url (session cache)

  const audioRef = useRef(null);
  if (!audioRef.current && typeof Audio !== "undefined") {
    audioRef.current = new Audio();
  }

  useEffect(() => {
    if (story) actions.updateReadingProgress(story.id, index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Track actual time spent reading this story (feeds "متوسط الجلسة" in the
  // child report). Ticks every 15s while this page stays open.
  useEffect(() => {
    if (!story) return;
    const TICK = 15;
    const interval = setInterval(() => {
      actions.addReadingTime(story.id, TICK);
    }, TICK * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  // Stop narration when the page changes.
  useEffect(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setAudioError("");
  }, [index]);

  // Stop narration when leaving the story (route change / unmount) — otherwise
  // the audio element keeps playing in the background since it lives in a ref.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Apply speed live.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => setPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  if (!story) {
    return (
      <AppShell>
        <p>{state.loading.stories ? "جارِ تحميل القصة..." : "القصة غير موجودة."}</p>
        <Link to="/library" className="text-rawaa-ink font-semibold">
          العودة إلى المكتبة
        </Link>
      </AppShell>
    );
  }

  const slide = slides[index];
  const isFav = state.favorites.includes(story.id);
  const currentRating = state.readingHistory.find((h) => h.storyId === story.id)?.rating || 0;
  const isNarratable = slide.kind === "page";
  const imageBasePath =
    slide.kind === "cover"
      ? `/images/stories/${story.id}/cover`
      : slide.kind === "back"
      ? `/images/stories/${story.id}/back`
      : `/images/stories/${story.id}/page-${slide.pageNumber}`;

  const pageText = (
    <>
      {slide.kind === "cover" && (
        <>
          <span className="text-xs text-rawaa-grayDark">
            {story.ageRange} · {story.type}
          </span>
          <h1 className="font-display text-xl md:text-3xl font-extrabold mt-2 text-rawaa-ink">{story.title}</h1>
        </>
      )}
      {slide.kind === "page" && <p className="leading-loose text-base md:text-lg text-rawaa-ink">{slide.text}</p>}
      {slide.kind === "back" && (
        <div className="text-center">
          <h2 className="font-display text-xl md:text-2xl font-bold mb-2 text-rawaa-ink">🎉 أحسنت! أنهيت القصة</h2>
          {story.moral && <p className="text-rawaa-grayDark mb-4 text-sm md:text-base">الدرس المستفاد: {story.moral}</p>}
          <StarRating value={currentRating} onChange={(r) => actions.rateStory(story.id, r)} />
          <Link to="/library" className="inline-block bg-rawaa-red text-white font-bold px-6 py-2.5 rounded-full mt-5">
            اقرأ قصة أخرى
          </Link>
        </div>
      )}
    </>
  );

  const pageImage = (
    <ImageSlot
      url={slide.imageUrl}
      basePath={imageBasePath}
      prompt={slide.imagePrompt}
      ratio="aspect-auto"
      className="h-full w-full border-0 rounded-lg bg-transparent"
    />
  );

  function goNext() {
    setIndex((i) => Math.min(i + 1, slides.length - 1));
  }
  function goPrev() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  async function handlePlayToggle() {
    if (!isNarratable) return;
    const audio = audioRef.current;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    setAudioError("");
    let url = audioUrls[slide.pageNumber] || slide.audioUrl;

    if (!url) {
      setAudioLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("tts", {
          body: { storyId: story.id, pageNumber: slide.pageNumber },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        url = data.audio_url;
        setAudioUrls((prev) => ({ ...prev, [slide.pageNumber]: url }));
      } catch (err) {
        setAudioError("تعذّر توليد الصوت — تأكد أن ميزة السرد الصوتي مفعّلة (Edge Function منشورة).");
        setAudioLoading(false);
        return;
      }
      setAudioLoading(false);
    }

    if (audio.src !== url) audio.src = url;
    audio.playbackRate = speed;
    audio.play();
    setPlaying(true);
  }

  function seek(deltaSeconds) {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.currentTime = Math.max(0, audio.currentTime + deltaSeconds);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-5">
        <Link to="/library" className="text-sm text-rawaa-grayDark hover:text-rawaa-red">
          ‹ عودة إلى المكتبة
        </Link>
        <button onClick={() => actions.toggleFavorite(story.id)} className="text-rawaa-red text-lg font-semibold">
          {isFav ? "♥ في المفضلة" : "♡ أضف للمفضلة"}
        </button>
      </div>

      <div className="bg-white rounded-xl2 shadow-card p-5 md:p-8">
      <div className="flex gap-6">
        {/* Reading area */}
        <div className="flex-1 py-4 md:py-8">
          <div className="relative flex items-center justify-center gap-3 md:gap-6">
            {/* Prev arrow (outer, right side) — points outward, away from the book */}
            <button
              onClick={goPrev}
              disabled={index === 0}
              className="hidden sm:flex w-11 h-11 shrink-0 rounded-full bg-rawaa-red text-white items-center justify-center shadow-card disabled:opacity-30"
              aria-label="الصفحة السابقة"
            >
              <IconChevron className="w-5 h-5" />
            </button>

            {/* The book */}
            <div className="relative w-full max-w-3xl">
              <button
                onClick={() => setSettingsOpen((v) => !v)}
                className="absolute -top-3 -right-3 z-20 w-11 h-11 rounded-xl bg-white shadow-card flex items-center justify-center text-rawaa-red border border-rawaa-gray/60"
                aria-label="إعدادات القراءة"
              >
                ⚙️
              </button>

              {/* Desktop / tablet: real open-book artwork, content overlaid on its two pages */}
              <div className="hidden md:block relative w-full aspect-[3/2]">
                <img
                  src="/images/brand/story-book.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none drop-shadow-2xl"
                />
                {/* text page (left side of the spread) */}
                <div className="absolute top-[7%] bottom-[13%] left-[8.6%] right-[51.4%] flex flex-col justify-center px-3 lg:px-6 overflow-y-auto">
                  {pageText}
                </div>
                {/* illustration page (right side of the spread) */}
                <div className="absolute top-[7%] bottom-[13%] left-[51%] right-[7.3%] p-2 lg:p-4">
                  {pageImage}
                </div>
              </div>

              {/* Mobile: two pages side by side are too small to read, so stack instead */}
              <div className="md:hidden bg-rawaa-cream rounded-2xl shadow-xl overflow-hidden">
                <div className="min-h-[220px]">{pageImage}</div>
                <div className="p-6 flex flex-col justify-center min-h-[180px]">{pageText}</div>
              </div>

              {/* page dots */}
              <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`الصفحة ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === index ? "w-6 bg-rawaa-red" : "w-2 bg-rawaa-gray"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Next arrow (outer, left side) — points outward, away from the book */}
            <button
              onClick={goNext}
              disabled={index === slides.length - 1}
              className="hidden sm:flex w-11 h-11 shrink-0 rounded-full bg-rawaa-red text-white items-center justify-center shadow-card disabled:opacity-30"
              aria-label="الصفحة التالية"
            >
              <IconChevron className="w-5 h-5 rotate-180" />
            </button>
          </div>

          {/* Playback bar — real narration audio (one page at a time) */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setIndex(0)}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-rawaa-red"
              aria-label="بداية القصة"
            >
              ⏮
            </button>
            <button
              onClick={() => seek(-15)}
              disabled={!isNarratable}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-rawaa-red disabled:opacity-30"
              aria-label="رجوع 15 ثانية"
            >
              ⟲15
            </button>
            <button
              onClick={handlePlayToggle}
              disabled={!isNarratable || audioLoading}
              className="w-14 h-14 rounded-full bg-rawaa-red text-white shadow-card flex items-center justify-center text-2xl disabled:opacity-40"
              aria-label={playing ? "إيقاف" : "تشغيل"}
            >
              {audioLoading ? "…" : playing ? "⏸" : "▶"}
            </button>
            <button
              onClick={() => seek(15)}
              disabled={!isNarratable}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-rawaa-red disabled:opacity-30"
              aria-label="تقديم 15 ثانية"
            >
              15⟳
            </button>
            <button
              onClick={() => setIndex(slides.length - 1)}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-rawaa-red"
              aria-label="نهاية القصة"
            >
              ⏭
            </button>
          </div>
          {!isNarratable && (
            <p className="text-center text-[11px] text-rawaa-grayDark mt-2">السرد الصوتي متاح لصفحات القصة فقط</p>
          )}
          {audioError && <p className="text-center text-[11px] text-red-600 mt-2">{audioError}</p>}
        </div>

        {/* Settings drawer */}
        {settingsOpen && (
          <aside className="hidden lg:block w-72 shrink-0 bg-rawaa-cream rounded-xl2 border border-rawaa-gray/60 p-5 h-fit">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold">🎙 إعدادات القراءة</h3>
              <button onClick={() => setSettingsOpen(false)} className="text-rawaa-grayDark" aria-label="إغلاق">
                ✕
              </button>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-semibold">{speed.toFixed(1)}x</span>
                <span className="text-rawaa-grayDark">سرعة القراءة</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-rawaa-red"
              />
            </div>
            <p className="text-[11px] text-rawaa-grayDark leading-relaxed">
              صوت واحد متاح حالياً. لاحقاً بنضيف أصوات ولهجات إضافية.
            </p>
          </aside>
        )}
      </div>
      </div>
    </AppShell>
  );
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div>
      <p className="text-sm text-rawaa-grayDark mb-2">قيّم القصة</p>
      <div className="flex items-center justify-center gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="text-3xl leading-none transition-transform hover:scale-110"
            aria-label={`${n} نجوم`}
          >
            {(hover || value) >= n ? "⭐" : "☆"}
          </button>
        ))}
      </div>
      {value > 0 && <p className="text-xs text-rawaa-green mt-1">شكراً لتقييمك!</p>}
    </div>
  );
}
