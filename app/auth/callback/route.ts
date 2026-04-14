import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase-server";

/**
 * Auth Callback Route Handler — handles the PKCE code exchange.
 *
 * After a user signs in with Google (or email link), Supabase redirects
 * them to /auth/callback?code=<code>. This route exchanges the code for
 * a session and sets the auth cookies, then redirects to /dashboard.
 *
 * ─── IMPORTANT: Redirect URLs ───
 *
 * 1. In Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client:
 *    Authorized redirect URI:
 *      https://rxpsoihjtedjghknjfbr.supabase.co/auth/v1/callback
 *
 * 2. In Supabase Dashboard → Authentication → URL Configuration:
 *    Site URL:
 *      http://localhost:3000  (for dev)
 *    Redirect URLs (add both):
 *      http://localhost:3000/auth/callback
 *      https://YOUR-PROD-DOMAIN.com/auth/callback
 *
 * 3. In Supabase Dashboard → Authentication → Providers → Google:
 *    Enable Google, paste your Client ID and Client Secret from Google Cloud.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Auth callback error:", error.message);
  }

  // If code exchange failed, redirect to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
