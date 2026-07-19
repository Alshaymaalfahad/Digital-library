// Tracks how many seconds a child has used the site TODAY, entirely in
// localStorage (so the lock check is instant and works offline-ish). The key
// resets naturally every day since it's namespaced by date.

function todayKey(childId) {
  return `rawaa_screentime_${childId}_${new Date().toISOString().slice(0, 10)}`;
}

export function getTodaySeconds(childId) {
  if (!childId) return 0;
  return Number(localStorage.getItem(todayKey(childId)) || 0);
}

export function addTodaySeconds(childId, delta) {
  if (!childId) return 0;
  const next = getTodaySeconds(childId) + delta;
  localStorage.setItem(todayKey(childId), String(next));
  return next;
}
