import { computeAchievements } from "./achievements";

// Builds a notification feed from real signals:
//  - badges the active child has actually earned
//  - stories added to the library recently
// There's no persisted "seen/unseen" state yet, so this simply surfaces the
// current facts each time (a real inbox with read/unread status would need
// a notifications table — noted as a natural next step).
export function buildNotifications({ child, stories, readingHistory }) {
  const notifications = [];

  if (child) {
    const achievements = computeAchievements({ stories, readingHistory });
    for (const a of achievements) {
      if (a.achieved) {
        notifications.push({
          icon: "🏅",
          title: `${child.name} حصل على وسام "${a.label}"!`,
          desc: a.desc,
          date: null,
        });
      }
    }
  }

  const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentStories = stories.filter((s) => s.createdAt && new Date(s.createdAt).getTime() >= recentCutoff);
  if (recentStories.length > 0) {
    notifications.push({
      icon: "📚",
      title: "تحديث جديد للمحتوى",
      desc: `تمت إضافة ${recentStories.length} ${recentStories.length === 1 ? "قصة جديدة" : "قصص جديدة"} للمكتبة.`,
      date: recentStories[0].createdAt,
    });
  }

  return notifications;
}
