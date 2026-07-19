// supabase/functions/tts/index.ts
//
// Generates narration audio for a story page and caches it forever in
// Supabase Storage — the ElevenLabs API key never touches the browser, and
// each page is only ever synthesized ONCE (every child after that reuses the
// same cached audio file, no matter how many times it's played).
//
// Deploy with:
//   supabase functions deploy tts
//
// Requires two secrets (set once):
//   supabase secrets set ELEVENLABS_API_KEY=your_key_here
//   supabase secrets set ELEVENLABS_VOICE_ID=your_chosen_voice_id
//
// To switch to Gemini TTS (or any other provider) later, only the
// `synthesizeSpeech()` function below needs to change — nothing in the
// frontend or database needs to be touched.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY")!;
const ELEVENLABS_VOICE_ID = Deno.env.get("ELEVENLABS_VOICE_ID")!;
const BUCKET = "story-audio";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function synthesizeSpeech(text: string): Promise<Uint8Array> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs error (${res.status}): ${errText}`);
  }

  return new Uint8Array(await res.arrayBuffer());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

    // Any signed-in user can request narration — just confirms they have a
    // valid session (prevents random unauthenticated API abuse).
    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await callerClient.auth.getUser();
    if (!user) return json({ error: "Invalid session" }, 401);

    const { storyId, pageNumber } = await req.json();
    if (!storyId || !pageNumber) return json({ error: "storyId and pageNumber are required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: page, error: pageError } = await admin
      .from("story_pages")
      .select("id, text, audio_url")
      .eq("story_id", storyId)
      .eq("page_number", pageNumber)
      .maybeSingle();

    if (pageError || !page) return json({ error: "Page not found" }, 404);

    // Already generated — return the cached URL, no API call needed.
    if (page.audio_url) return json({ audio_url: page.audio_url, cached: true });

    const audioBytes = await synthesizeSpeech(page.text);
    const path = `${storyId}/page-${pageNumber}.mp3`;

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, audioBytes, { contentType: "audio/mpeg", upsert: true });
    if (uploadError) return json({ error: uploadError.message }, 500);

    const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path);
    const audioUrl = publicUrlData.publicUrl;

    await admin.from("story_pages").update({ audio_url: audioUrl }).eq("id", page.id);

    return json({ audio_url: audioUrl, cached: false });
  } catch (err) {
    return json({ error: err.message || "Unexpected error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
