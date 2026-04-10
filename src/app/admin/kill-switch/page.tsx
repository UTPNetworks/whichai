import { createAdminClient, getAdminIdentity } from '@/lib/admin';
import { redirect } from 'next/navigation';
import KillSwitchClient from './_components/KillSwitchClient';

export const dynamic = 'force-dynamic';

async function fetchFlags() {
  const client = createAdminClient();
  const { data } = await client.from('system_flags').select('*').eq('id', 1).single();
  return data;
}

export default async function KillSwitchPage() {
  const identity = await getAdminIdentity();
  if (!identity) redirect('/admin/login');
  const flags = await fetchFlags();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1 text-red-400">⚠ Kill Switch &amp; Feature Flags</h1>
        <p className="text-sm text-slate-500">
          Instantly cut traffic, pause writes, or disable specific features. Every change is logged and alerts fire to your webhook.
        </p>
      </div>

      <KillSwitchClient flags={flags as any} role={identity.role} />
    </div>
  );
}
