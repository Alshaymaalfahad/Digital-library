// Small seeded PRNG so the same child always shows the same demo numbers
// (instead of random numbers that jump around on every render).
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function childStats(childId) {
  const seed = hashString(childId || "demo");
  const r = (i) => seededRandom(seed + i);

  const weekDays = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  const weeklyActivity = weekDays.map((label, i) => ({
    label,
    minutes: Math.round(5 + r(i) * 35),
    words: Math.round(3 + r(i + 10) * 18),
  }));

  return {
    progress: Math.round(35 + r(1) * 60),
    avgSession: Math.round(8 + r(2) * 20),
    favoriteType: ["مغامرات خيالية", "قصص أخلاقية", "قصص تاريخية"][Math.floor(r(3) * 3)],
    vocabWords: Math.round(60 + r(4) * 120),
    vocabDelta: Math.round(4 + r(5) * 14),
    friendshipLevel: Math.round(50 + r(6) * 45),
    weeklyActivity,
  };
}
