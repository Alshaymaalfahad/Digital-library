// Seeds public.stories + public.story_pages from src/data/stories.json.
// Uses the SERVICE ROLE key (bypasses RLS) — never expose this key in the frontend.
//
// Usage:
//   1. Create a `.env` file at the project root (see .env.example) with:
//        SUPABASE_URL=https://xxxx.supabase.co
//        SUPABASE_SERVICE_ROLE_KEY=eyJ....   (Project Settings → API → service_role)
//   2. npm install
//   3. node --env-file=.env supabase/seed.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "   Create a .env file (see .env.example) and run:\n" +
      "   node --env-file=.env supabase/seed.mjs"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const stories = JSON.parse(readFileSync(join(__dirname, "../src/data/stories.json"), "utf-8"));

  console.log(`Seeding ${stories.length} stories...`);

  for (const s of stories) {
    const { error: storyError } = await supabase.from("stories").upsert({
      id: s.id,
      title: s.title,
      type: s.type,
      age_range: s.ageRange,
      moral: s.moral,
      cover_image_prompt: s.cover?.imagePrompt || null,
      back_image_prompt: s.backCover?.imagePrompt || null,
    });

    if (storyError) {
      console.error(`✗ story ${s.id} (${s.title}):`, storyError.message);
      continue;
    }

    // Upsert keeps any previously-synced Storage image_url intact for pages
    // that still exist. We separately remove pages beyond the new page
    // count, in case this story got SHORTER in this update (upsert alone
    // never deletes, so those would otherwise linger as stale orphans).
    const pageRows = s.pages.map((p) => ({
      story_id: s.id,
      page_number: p.pageNumber,
      text: p.text,
      image_prompt: p.imagePrompt || null,
    }));

    const { error: pagesError } = await supabase
      .from("story_pages")
      .upsert(pageRows, { onConflict: "story_id,page_number" });

    if (!pagesError) {
      const maxPage = Math.max(0, ...s.pages.map((p) => p.pageNumber));
      await supabase.from("story_pages").delete().eq("story_id", s.id).gt("page_number", maxPage);
    }

    if (pagesError) {
      console.error(`✗ pages for story ${s.id}:`, pagesError.message);
      continue;
    }

    console.log(`✓ story ${s.id} — ${s.title} (${s.pages.length} pages)`);
  }

  console.log("Done.");
}

main();
