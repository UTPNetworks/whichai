export const dynamic = 'force-dynamic';

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const isSignupPaused = params.reason === 'signups_disabled';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-white px-4">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-pink-500 mb-6 shadow-[0_0_80px_rgba(251,191,36,0.4)]">
          <span className="text-4xl">🛠️</span>
        </div>
        <h1 className="text-3xl font-black mb-3">
          {isSignupPaused ? 'New signups paused' : "We'll be right back"}
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          {isSignupPaused
            ? "We've temporarily paused new registrations while we tune things up. Existing users can still sign in."
            : "WhichAi is down for a quick tune-up. We'll be back online shortly. Thanks for your patience."}
        </p>
        <p className="text-xs text-slate-600 mt-8">
          Status updates → <a href="https://status.whichai.cloud" className="text-purple-400 hover:underline">status.whichai.cloud</a>
        </p>
      </div>
    </div>
  );
}
