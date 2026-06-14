'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ZoomRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/santri/virtual-class');
  }, [router]);

  return (
    <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tosca-600 mx-auto"></div>
        <p className="text-sm font-semibold text-tosca-900">Mengalihkan ke Kelas Virtual...</p>
      </div>
  );
}