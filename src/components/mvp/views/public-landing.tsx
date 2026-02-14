'use client';

import { useRouter } from 'next/navigation';
import { LandingView } from '@/components/mvp/views/landing';

export const PublicLanding = () => {
  const router = useRouter();

  return (
    <LandingView
      onStart={() => {
        router.push('/workspace');
      }}
    />
  );
};
