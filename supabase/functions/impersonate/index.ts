// supabase/functions/impersonate/index.ts
//
// Called by the admin dashboard's "تسجيل دخول كهذا الحساب" button.
// Verifies the CALLER is an admin, then mints a one-time magic-link for the
// TARGET account using the service-role key (which only ever lives here,
// inside the Edge Function runtime — never in the frontend bundle).
//
// Deploy with:
//   supabase functions deploy impersonate
//
// Supabase automatically injects SUPABASE_URL, SUPABASE_ANON_KEY, and
// SUPABASE_SERVICE_ROLE_KEY into every Edge Function — no manual secrets needed.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    // Client bound to the CALLER's JWT — used only to find out who's calling.
    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !caller) return json({ error: "Invalid session" }, 401);

    // Admin client (service role) — used for privileged reads/writes below.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: callerProfile } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("id", caller.id)
      .maybeSingle();

    if (!callerProfile?.is_admin) {
      return json({ error: "Forbidden — admin only" }, 403);
    }

    const { target_user_id } = await req.json();
    if (!target_user_id) return json({ error: "target_user_id is required" }, 400);

    const { data: targetUser, error: targetError } = await admin.auth.admin.getUserById(target_user_id);
    if (targetError || !targetUser?.user?.email) return json({ error: "Target user not found" }, 404);

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: targetUser.user.email,
    });

    if (linkError) return json({ error: linkError.message }, 500);

    return json({ action_link: linkData.properties.action_link });
  } catch (err) {
    return json({ error: err.message || "Unexpected error" }, 500);
  }
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
