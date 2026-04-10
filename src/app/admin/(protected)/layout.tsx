import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminIdentity } from '@/lib/admin';
import AdminSidebar from './_components/AdminSidebar';

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

  return (
    <div className="min-h-screen flex bg-[#0a0a14] text-slate-200">
      <AdminSidebar adminEmail={admin.email} adminRole={admin.role} />
      <main className="flex-1 ml-64 min-h-screen">
        {/* Impersonation banner hook — if an `admin_impersonating` cookie is set */}
        <ImpersonationBanner />
        <div className="p-8 max-w-7xl">{children}</div>
      </main>
    </div>
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
