// Root /admin layout — deliberately a passthrough.
//
// Auth gating lives in src/app/admin/(protected)/layout.tsx so that
// /admin/login can render without a protected parent (otherwise the
// auth-redirect would target /admin/login recursively and cause
// ERR_TOO_MANY_REDIRECTS).
export const dynamic = 'force-dynamic';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
