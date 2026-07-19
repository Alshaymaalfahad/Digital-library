const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
// JS Date#getDay(): 0=Sunday..6=Saturday. Arabic week display order starts Saturday.
const DISPLAY_ORDER = [6, 0, 1, 2, 3, 4, 5]; // السبت, الأحد, ..., الجمعة

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function computeChildReportStats({ readingHistory, stories }) {
  const storyById = Object.fromEntries(stories.map((s) => [s.id, s]));
  const touchedEntries = readingHistory.filter((h) => storyById[h.storyId]);

  // Favorite type: most frequent `type` among stories the child has read.
  const typeCounts = {};
  for (const h of touchedEntries) {
    const t = storyById[h.storyId]?.type;
    if (t) typeCounts[t] = (typeCounts[t] || 0) + 1;
  }
  const favoriteType =
    Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "لم يبدأ القراءة بعد";

  // Vocabulary encountered: distinct words across all pages of stories touched.
  const wordSet = new Set();
  for (const h of touchedEntries) {
    const story = storyById[h.storyId];
    for (const p of story?.pages || []) {
      for (const w of (p.text || "").split(/\s+/)) {
        const clean = w.replace(/[^\u0621-\u064A]/g, "");
        if (clean) wordSet.add(clean);
      }
    }
  }
  const vocabWords = wordSet.size;

  // Average session length, from actual tracked reading time.
  const withTime = touchedEntries.filter((h) => h.timeSpentSeconds > 0);
  const avgSessionMinutes = withTime.length
    ? Math.round(withTime.reduce((sum, h) => sum + h.timeSpentSeconds, 0) / withTime.length / 60)
    : 0;

  // Weekly activity: how many reading-progress updates landed on each weekday.
  const countsByDay = Array(7).fill(0);
  for (const h of touchedEntries) {
    if (!h.updatedAt) continue;
    countsByDay[new Date(h.updatedAt).getDay()]++;
  }
  const weeklyActivity = DISPLAY_ORDER.map((dayIndex) => ({
    label: WEEKDAYS_AR[dayIndex],
    count: countsByDay[dayIndex],
  }));

  return { favoriteType, vocabWords, avgSessionMinutes, weeklyActivity };
}
