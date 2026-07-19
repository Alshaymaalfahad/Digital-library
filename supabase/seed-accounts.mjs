// Creates test accounts directly via the Supabase Admin API — bypasses the
// email confirmation flow entirely (accounts are created pre-confirmed), so
// this works even before you set up SMTP.
//
// Usage:
//   node --env-file=.env supabase/seed-accounts.mjs
//
// Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env (see .env.example).
// Run `npm run seed` first so story ids 1-40 exist (used for favorites/progress).

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "   Create a .env file (see .env.example) and run:\n" +
      "   node --env-file=.env supabase/seed-accounts.mjs"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAccount({ email, password, name, isAdmin, children = [] }) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip the confirmation email entirely
    user_metadata: { name },
  });

  if (error) {
    console.error(`✗ ${email}:`, error.message);
    return null;
  }

  const userId = data.user.id;

  // The `on_auth_user_created` trigger (from schema.sql) already inserted a
  // basic profiles row — fill in the rest (this also marks onboarding as done
  // since ProtectedRoute checks profiles.region to know guardian setup is complete).
  await supabase
    .from("profiles")
    .update({
      is_admin: isAdmin,
      region: "توقيت الرياض (GMT+3)",
      language: "ar",
      notifications: true,
    })
    .eq("id", userId);

  const childIds = [];
  for (const child of children) {
    const { data: childRow, error: childError } = await supabase
      .from("children")
      .insert({ guardian_id: userId, ...child })
      .select()
      .single();
    if (childError) {
      console.error(`  ✗ child ${child.name}:`, childError.message);
      continue;
    }
    childIds.push(childRow.id);
  }

  console.log(`✓ ${isAdmin ? "[admin]" : "[guardian]"} ${email} — ${children.length} children`);
  return { userId, childIds };
}

async function seedActivity(childIds) {
  if (!childIds.length) return;
  const { data: stories } = await supabase.from("stories").select("id").limit(10);
  if (!stories || stories.length === 0) {
    console.warn("⚠️ No stories found — run `npm run seed` first for realistic favorites/progress.");
    return;
  }

  const [child1, child2] = childIds;
  const sample = stories.map((s) => s.id);

  if (child1) {
    await supabase.from("favorites").insert([
      { child_id: child1, story_id: sample[0] },
      { child_id: child1, story_id: sample[1] },
    ]);
    await supabase.from("reading_progress").insert([
      { child_id: child1, story_id: sample[0], last_page: 3 },
      { child_id: child1, story_id: sample[2], last_page: 1 },
    ]);
  }
  if (child2) {
    await supabase.from("favorites").insert([{ child_id: child2, story_id: sample[3] }]);
    await supabase.from("reading_progress").insert([{ child_id: child2, story_id: sample[3], last_page: 5 }]);
  }
  console.log("✓ seeded sample favorites + reading progress");
}

async function main() {
  await createAccount({
    email: process.env.ADMIN_EMAIL || "admin@rawaa.app",
    password: process.env.ADMIN_PASSWORD || "Admin123456!",
    name: "مدير رُواء",
    isAdmin: true,
  });

  const guardian = await createAccount({
    email: process.env.TEST_GUARDIAN_EMAIL || "guardian@rawaa.app",
    password: process.env.TEST_GUARDIAN_PASSWORD || "Guardian123456!",
    name: "ولي أمر تجريبي",
    isAdmin: false,
    children: [
      { name: "سارة", age: 7, gender: "girl", reading_level: "intermediate", interests: ["الحيوانات", "المغامرات"] },
      { name: "غيث", age: 9, gender: "boy", reading_level: "advanced", interests: ["العلوم", "التاريخ"] },
      { name: "نايف", age: 5, gender: "boy", reading_level: "beginner", interests: ["الفضول"] },
    ],
  });

  if (guardian) await seedActivity(guardian.childIds);

  console.log("\nDone. Test credentials:");
  console.log("  Admin:    ", process.env.ADMIN_EMAIL || "admin@rawaa.app", "/", process.env.ADMIN_PASSWORD || "Admin123456!");
  console.log("  Guardian: ", process.env.TEST_GUARDIAN_EMAIL || "guardian@rawaa.app", "/", process.env.TEST_GUARDIAN_PASSWORD || "Guardian123456!");
}

main();
