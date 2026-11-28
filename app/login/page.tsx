'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KotoProvider, useKoto } from '@/context/KotoContext';
import { LoginGateView } from '@/components/views/LoginGateView';

function LoginPageContent() {
  const router = useRouter();
  const { firebaseUser, userAccount, authLoading } = useKoto();

  useEffect(() => {
    if (!authLoading && firebaseUser && userAccount?.status === 'active') {
      router.replace('/');
    }
  }, [authLoading, firebaseUser, userAccount?.status, router]);

  return <LoginGateView />;
}

export default function LoginPage() {
  return (
    <KotoProvider>
      <LoginPageContent />
    </KotoProvider>
  );
}
