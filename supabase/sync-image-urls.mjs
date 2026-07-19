// Scans the "story-images" bucket in Supabase Storage and writes the public
// URL of every matching file into stories.cover_image_url / back_image_url
// and story_pages.image_url — so you can just drag-and-drop images into the
// bucket from the Supabase dashboard (no code, no redeploy) and run this
// script whenever you add/replace images.
//
// Expected file layout inside the bucket (same convention as the local
// public/images/stories folder):
//   {story_id}/cover.<ext>
//   {story_id}/page-{page_number}.<ext>
//   {story_id}/back.<ext>
// <ext> can be jpg, jpeg, png, or webp — whichever you uploaded.
//
// Usage:
//   node --env-file=.env supabase/sync-image-urls.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.STORY_IMAGES_BUCKET || "story-images";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "   Create a .env file (see .env.example) and run:\n" +
      "   node --env-file=.env supabase/sync-image-urls.mjs"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function publicUrl(path) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function main() {
  const { data: storyFolders, error: listError } = await supabase.storage.from(BUCKET).list("", { limit: 1000 });
  if (listError) {
    console.error(`❌ Could not list bucket "${BUCKET}":`, listError.message);
    console.error(`   Make sure you created a bucket named "${BUCKET}" in Supabase Storage first.`);
    process.exit(1);
  }

  let updated = 0;

  for (const folder of storyFolders) {
    if (!folder.name || !/^\d+$/.test(folder.name)) continue; // only numeric story-id folders
    const storyId = Number(folder.name);

    const { data: files, error: filesError } = await supabase.storage.from(BUCKET).list(folder.name, { limit: 1000 });
    if (filesError) {
      console.error(`✗ story ${storyId}: ${filesError.message}`);
      continue;
    }

    const coverFile = files.find((f) => /^cover\.(jpg|jpeg|png|webp)$/i.test(f.name));
    const backFile = files.find((f) => /^back\.(jpg|jpeg|png|webp)$/i.test(f.name));
    const pageFiles = files.filter((f) => /^page-\d+\.(jpg|jpeg|png|webp)$/i.test(f.name));

    if (coverFile) {
      const url = publicUrl(`${folder.name}/${coverFile.name}`);
      const { error } = await supabase.from("stories").update({ cover_image_url: url }).eq("id", storyId);
      if (error) console.error(`  ✗ cover ${storyId}:`, error.message);
      else updated++;
    }

    if (backFile) {
      const url = publicUrl(`${folder.name}/${backFile.name}`);
      const { error } = await supabase.from("stories").update({ back_image_url: url }).eq("id", storyId);
      if (error) console.error(`  ✗ back ${storyId}:`, error.message);
      else updated++;
    }

    for (const pf of pageFiles) {
      const pageNumber = Number(pf.name.match(/^page-(\d+)\./)[1]);
      const url = publicUrl(`${folder.name}/${pf.name}`);
      const { error } = await supabase
        .from("story_pages")
        .update({ image_url: url })
        .eq("story_id", storyId)
        .eq("page_number", pageNumber);
      if (error) console.error(`  ✗ page ${storyId}/${pageNumber}:`, error.message);
      else updated++;
    }

    console.log(
      `✓ story ${storyId}: ${coverFile ? "cover " : ""}${backFile ? "back " : ""}${pageFiles.length} page(s)`
    );
  }

  console.log(`\nDone — ${updated} image URL(s) written.`);
}

main();
