// Computes the "إنجازات القراء الصغار" badges from real data — no mock numbers.
//
// A story counts as COMPLETED when the child's reading progress reached the
// back-cover slide (index = pages.length + 1, since slides = [cover, ...pages, back]).
//
// Two badges depend on the not-yet-built AI story-generation feature
// ("مبدع", "صانع الحكايات") — they're always shown locked until that ships.
// "سفير رواة" requires ALL badges including those two, so it's locked too.

const CORE_VALUES = [
  { id: "honesty", label: "الصدق", keywords: ["صدق", "صادق"] },
  { id: "trust", label: "الأمانة", keywords: ["أمانة", "أمين"] },
  { id: "cooperation", label: "التعاون", keywords: ["تعاون", "تعاضد"] },
  { id: "mercy", label: "الرحمة", keywords: ["رحمة", "رحيم", "رأفة"] },
  { id: "courage", label: "الشجاعة", keywords: ["شجاعة", "شجاع", "جرأة"] },
];

// Approximate: classifies a story under ONE of the 5 core values by scanning
// its `moral` text for keywords. This is a heuristic, not an authoritative
// tag — stories that don't match any keyword are simply not counted toward
// "جامع القيم". A cleaner solution would be a manually-curated `core_value`
// column on the stories table.
function classifyCoreValue(story) {
  const text = `${story.moral || ""} ${story.title || ""}`;
  for (const v of CORE_VALUES) {
    if (v.keywords.some((kw) => text.includes(kw))) return v.id;
  }
  return null;
}

function isCompleted(story, historyEntry) {
  if (!historyEntry) return false;
  const backIndex = story.pages.length + 1;
  return historyEntry.lastPage >= backIndex;
}

function longestStreak(dates) {
  if (dates.length === 0) return 0;
  const days = [...new Set(dates.map((d) => new Date(d).toDateString()))]
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);

  let longest = 1;
  let current = 1;
  const ONE_DAY = 86400000;
  for (let i = 1; i < days.length; i++) {
    if (days[i] - days[i - 1] === ONE_DAY) {
      current++;
      longest = Math.max(longest, current);
    } else if (days[i] - days[i - 1] > ONE_DAY) {
      current = 1;
    }
  }
  return longest;
}

export function computeAchievements({ stories, readingHistory }) {
  const historyByStory = Object.fromEntries(readingHistory.map((h) => [h.storyId, h]));
  const completedStories = stories.filter((s) => isCompleted(s, historyByStory[s.id]));
  const completedCount = completedStories.length;

  const distinctTypes = new Set(completedStories.map((s) => s.type).filter(Boolean));
  const streak = longestStreak(readingHistory.map((h) => h.updatedAt));

  const achievedValueIds = new Set(
    completedStories.map(classifyCoreValue).filter(Boolean)
  );
  const collectedAllValues = CORE_VALUES.every((v) => achievedValueIds.has(v.id));

  const badges = [
    {
      id: "beginner",
      icon: "🏆",
      label: "قارئ مبتدئ",
      desc: "أكمل قراءة 3 قصص",
      achieved: completedCount >= 3,
      progress: Math.min(completedCount, 3),
      target: 3,
    },
    {
      id: "explorer",
      icon: "🧭",
      label: "مستكشف",
      desc: "قرأ 5 قصص من 5 تصنيفات مختلفة",
      achieved: distinctTypes.size >= 5,
      progress: Math.min(distinctTypes.size, 5),
      target: 5,
    },
    {
      id: "active",
      icon: "📚",
      label: "قارئ نشيط",
      desc: "قرأ 10 قصص",
      achieved: completedCount >= 10,
      progress: Math.min(completedCount, 10),
      target: 10,
    },
    {
      id: "creative",
      icon: "🎨",
      label: "مبدع",
      desc: "أنشأ 3 قصص بالذكاء الاصطناعي",
      achieved: false,
      locked: true,
      lockedReason: "يتطلب ميزة إنشاء القصص بالذكاء الاصطناعي (قريباً)",
    },
    {
      id: "storyteller",
      icon: "✍️",
      label: "صانع الحكايات",
      desc: "أنشأ 10 قصص بالذكاء الاصطناعي",
      achieved: false,
      locked: true,
      lockedReason: "يتطلب ميزة إنشاء القصص بالذكاء الاصطناعي (قريباً)",
    },
    {
      id: "streak",
      icon: "⭐",
      label: "نجم القراءة",
      desc: "قرأ لمدة 7 أيام متتالية",
      achieved: streak >= 7,
      progress: Math.min(streak, 7),
      target: 7,
    },
    {
      id: "legend",
      icon: "👑",
      label: "أسطورة القراءة",
      desc: "أكمل 50 قصة",
      achieved: completedCount >= 50,
      progress: Math.min(completedCount, 50),
      target: 50,
    },
    {
      id: "values",
      icon: "💎",
      label: "جامع القيم",
      desc: "قرأ قصة واحدة على الأقل لكل قيمة (الصدق، الأمانة، التعاون، الرحمة، الشجاعة)",
      achieved: collectedAllValues,
      progress: achievedValueIds.size,
      target: CORE_VALUES.length,
    },
  ];

  const ambassador = {
    id: "ambassador",
    icon: "🦋",
    label: "سفير رواة",
    desc: "اجمع جميع الإنجازات الأساسية",
    achieved: false,
    locked: true,
    lockedReason: "يتطلب إكمال كل الإنجازات، بما فيها إنجازات الذكاء الاصطناعي (قريباً)",
  };

  return [...badges, ambassador];
}
