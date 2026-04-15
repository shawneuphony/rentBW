'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectProfile() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/landlord/profile');
  }, [router]);
  return null;
}