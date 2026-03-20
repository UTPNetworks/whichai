import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const next = searchParams.get('next') ?? '/marketplace';

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    // Forward to the client-side confirm page so the session is properly
    // persisted in the browser (server-side exchange does not set cookies).
    const confirmUrl = new URL(`${origin}/auth/confirm`);
    confirmUrl.searchParams.set('code', code);
    confirmUrl.searchParams.set('next', next);
    return NextResponse.redirect(confirmUrl.toString());
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
