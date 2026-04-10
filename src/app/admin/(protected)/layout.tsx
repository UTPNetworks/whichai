import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getAdminIdentity } from '@/lib/admin';
import AdminSidebar from './_components/AdminSidebar';
import AdminSessionProvider from './_components/AdminSessionProvider';

export const dynamic = 'force-dynamic';

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminIdentity();
  if (!admin) {
    redirect('/admin/login');
  }

  // Read cookies once — we use two: admin_stepup for per-action step-up
  // verification, and admin_mfa_ok as a medium-lived "this session passed
  // MFA" marker that survives Supabase access-token refreshes (which
  // silently downgrade aal2 → aal1 and would otherwise bounce the admin
  // back to the MFA gate every ~hour).
  const cookieStore = await cookies();
  const stepUpRaw = cookieStore.get('admin_stepup')?.value;
  const stepUpExpiresAt = stepUpRaw ? parseInt(stepUpRaw, 10) || 0 : 0;
  const mfaOkRaw = cookieStore.get('admin_mfa_ok')?.value;
  const mfaOkExpiresAt = mfaOkRaw ? parseInt(mfaOkRaw, 10) || 0 : 0;
  const mfaOkValid = mfaOkExpiresAt > Date.now();

  // Enforce MFA for every admin page. Either the live session claim is
  // already aal2, OR we have a valid admin_mfa_ok cookie stamped from a
  // recent successful TOTP verify. If neither, bounce through the MFA
  // gate (if a factor exists) or force enrollment.
  if (admin.aal !== 'aal2' && !mfaOkValid) {
    if (admin.hasMfaFactor) {
      redirect('/auth/mfa-verify?next=/admin');
    }
    redirect('/admin/setup-mfa');
  }

  return (
    <AdminSessionProvider initialStepUpExpiresAt={stepUpExpiresAt}>
      <div className="min-h-screen flex bg-[#0a0a14] text-slate-200">
        <AdminSidebar adminEmail={admin.email} adminRole={admin.role} />
        <main className="flex-1 ml-64 min-h-screen">
          {/* Impersonation banner hook — if `admin_impersonating` cookie set */}
          <ImpersonationBanner />
          <div className="p-8 max-w-7xl">{children}</div>
        </main>
      </div>
    </AdminSessionProvider>
  );
}

async function ImpersonationBanner() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const target = cookieStore.get('admin_impersonating')?.value;
  if (!target) return null;

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white text-center text-sm font-bold py-2 px-4 flex items-center justify-center gap-3 shadow-lg">
      <span className="animate-pulse">🚨</span>
      ADMIN IMPERSONATION ACTIVE — viewing as <code className="bg-red-900/40 px-2 py-0.5 rounded">{target}</code>
      <Link
        href="/api/admin/impersonate/stop"
        className="ml-4 px-3 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-xs"
      >
        Exit
      </Link>
    </div>
  );
}
