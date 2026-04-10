import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminIdentity } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  // If already signed in as admin, bounce to dashboard
  const admin = await getAdminIdentity();
  if (admin) redirect('/admin');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a14] text-white px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 mb-4 shadow-[0_0_60px_rgba(239,68,68,0.3)]">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-black mb-1">WhichAi Admin</h1>
          <p className="text-sm text-slate-400">Restricted access — admins only</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            Admin access uses your existing WhichAi account. Sign in on the main site with MFA enabled, then return here.
          </p>
          <Link
            href="/auth/login?next=/admin"
            className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 font-semibold text-sm hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all"
          >
            Sign in on main site →
          </Link>
          <p className="text-[11px] text-slate-500 text-center mt-4 leading-relaxed">
            If you&apos;re not in the admins table, you&apos;ll be shown a 404 on any admin page. All admin actions are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
