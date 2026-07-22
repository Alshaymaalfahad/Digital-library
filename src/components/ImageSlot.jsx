// Shows a story illustration from (in priority order):
//   1. `url`      — a full URL, e.g. a Supabase Storage public URL
//   2. `basePath` — a local path WITHOUT an extension (e.g. "/images/stories/1/cover");
//                   tries .jpg / .png / .webp / .jpeg in order
//   3. `src`      — a full local path WITH an extension (legacy/back-compat)
// Falls back to a "coming soon" placeholder if nothing loads.
import { useState } from "react";

const EXTENSIONS = ["jpg", "png", "webp", "jpeg"];

export default function ImageSlot({ url, basePath, src, prompt, className = "", ratio = "aspect-[4/3]" }) {
  const [attempt, setAttempt] = useState(0);

  const candidates = url
    ? [url]
    : basePath
    ? EXTENSIONS.map((ext) => `${basePath}.${ext}`)
    : src
    ? [src]
    : [];

  const currentSrc = candidates[attempt];
  // A caller-supplied width class (e.g. "w-14") must win over the default
  // w-full — but Tailwind classes don't override by string order, only by
  // which one is later in the generated stylesheet, so "w-full" would
  // otherwise clobber "w-14" regardless of where it sits in the string.
  const widthClass = /(^|\s)w-/.test(className) ? "" : "w-full";

  if (currentSrc) {
    return (
      <img
        src={currentSrc}
        alt={prompt || "رسمة توضيحية"}
        className={`${ratio} ${widthClass} object-cover ${className}`}
        onError={() => setAttempt((a) => a + 1)}
      />
    );
  }

  return (
    <div className={`image-slot ${ratio} ${widthClass} ${className}`} title={prompt}>
      <div>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mx-auto mb-1 opacity-60">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8.5" cy="9" r="1.5" fill="currentColor" />
          <path d="M21 15l-5-5-9 9" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>سيتم إضافة الرسمة هنا</span>
      </div>
    </div>
  );
}
