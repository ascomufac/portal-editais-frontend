'use client';

import dynamic from 'next/dynamic';

const AdminRouter = dynamic(() => import('@/admin/AdminRouter'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
      Carregando administração…
    </div>
  ),
});

export default function AdminCatchAllPage() {
  return <AdminRouter />;
}
