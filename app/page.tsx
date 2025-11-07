'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  
  // Redirect to landing page
  useEffect(() => {
    router.push('/landing');
  }, [router]);
  
  return null;
}
