'use client';

import React from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  Clock,
  Ban,
  RefreshCw,
  LogOut,
  BookOpen,
  Database,
  Layers,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';

export function LoginGateView() {
  const {
    authLoading,
    firebaseUser,
    userAccount,
    userEmail,
    authError,
    signInWithGoogle,
    signOut,
    refreshAccountStatus,
  } = useKoto();

  const isPending = Boolean(firebaseUser && userAccount?.status === 'pending');
  const isSuspended = Boolean(firebaseUser && userAccount?.status === 'suspended');

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded-lg border border-on-surface/15 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Editorial Curriculum Column */}
        <div className="lg:col-span-6 p-7 sm:p-9 bg-surface-container-low border-b lg:border-b-0 lg:border-r border-on-surface/10 flex flex-col justify-between space-y-8">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-xs overflow-hidden border border-on-surface/15 bg-surface-container-lowest shrink-0">
                <Image
                  src="/images/koto_brand_emblem.jpg"
                  alt="KOTO Hanko Emblem"
                  fill
                  sizes="44px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-serif text-xl font-bold tracking-tight text-primary leading-none flex items-center gap-2">
                  <span>KOTO</span>
                  <span className="text-base font-normal text-outline">言登</span>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-outline mt-1 font-semibold">
                  Minna no Nihongo I &amp; II · N5–N4
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface leading-tight">
                Structured Japanese Mastery Workspace
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Complete 50-lesson curriculum index across Vocabulary, Grammar, Kanji, Listening &amp; Shadowing, Reading, and Interactive Drills.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {[
                {
                  icon: BookOpen,
                  title: 'Zero-Base Personal Ledger',
                  desc: 'Every newly registered learner — including the system admin — starts cleanly at 0% progress from Lesson 01.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Admin Access Governance',
                  desc: 'Google Sign-In with explicit role and active/pending/suspended approval control.',
                },
                {
                  icon: Database,
                  title: 'Firestore + Google Sheets Backend',
                  desc: 'Real-time per-user cloud persistence paired with two-way Google Sheets synchronization.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-3 rounded-md bg-surface-container-lowest border border-on-surface/10 flex items-start gap-3"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-on-surface">{item.title}</div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-on-surface/10 text-[11px] font-mono text-outline">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-secondary" />
              50 Lessons · 6 Core Skills
            </span>
            <span>JLPT N5 / N4</span>
          </div>
        </div>

        {/* Right Auth / Approval Gate Column */}
        <div className="lg:col-span-6 p-7 sm:p-9 flex flex-col justify-center space-y-6">
          {authLoading && !firebaseUser ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <div className="text-sm font-semibold text-on-surface">
                Verifying KOTO Workspace Session...
              </div>
              <div className="text-xs text-outline font-mono">
                Connecting to Firebase Auth &amp; Firestore
              </div>
            </div>
          ) : isPending ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-secondary-fixed text-secondary text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  PENDING APPROVAL
                </span>
                <div className="w-12 h-12 rounded-xs border-2 border-secondary/70 flex flex-col items-center justify-center font-serif text-secondary rotate-[-3deg]">
                  <span className="text-xs font-bold leading-none">承認</span>
                  <span className="text-xs font-bold leading-none mt-0.5">待ち</span>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold text-on-surface">
                  Account Registered — Awaiting Admin Approval
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Your account (<strong className="text-on-surface font-mono">{userEmail}</strong>) has been provisioned with{' '}
                  <strong className="text-on-surface">0% initial progress</strong>. An administrator must approve access before entering the study workspace.
                </p>
              </div>

              <div className="p-3.5 rounded-md bg-surface-container-low border border-on-surface/10 text-xs text-on-surface-variant space-y-1">
                <div className="font-mono text-[11px] text-outline uppercase">Account Snapshot</div>
                <div className="flex justify-between">
                  <span>Role</span>
                  <span className="font-mono font-semibold text-on-surface">
                    {userAccount?.role ?? 'student'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-mono font-semibold text-secondary">
                    {userAccount?.status ?? 'pending'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => void refreshAccountStatus()}
                  disabled={authLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${authLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Approval Status</span>
                </button>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md border border-on-surface/15 text-xs font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : isSuspended ? (
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-error-container text-on-error-container text-xs font-mono font-bold">
                <Ban className="w-3.5 h-3.5" />
                ACCESS SUSPENDED
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-on-surface">
                  Workspace Access Paused
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Access for <strong className="font-mono text-on-surface">{userEmail}</strong> is currently suspended. Contact your system administrator to restore access.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-on-surface/15 text-xs font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out &amp; Switch Account</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-primary font-semibold">
                  ログイン · Learner Authentication
                </div>
                <h2 className="font-serif text-2xl font-bold text-on-surface mt-1">
                  Sign In to Start Learning
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                  Sign in with your Google account. Every new learner profile starts with zero progress and syncs privately across sessions.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-md bg-error-container/60 border border-error/30 text-xs text-on-error-container flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => void signInWithGoogle(false)}
                disabled={authLoading}
                className="w-full py-3 px-4 rounded-md bg-surface-container-lowest border border-on-surface/20 hover:border-primary/60 hover:bg-surface-container-low transition-colors flex items-center justify-center gap-3 text-sm font-semibold text-on-surface cursor-pointer disabled:opacity-60"
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                    />
                  </svg>
                )}
                <span>{authLoading ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>

              <div className="p-3.5 rounded-md bg-surface-container-low border border-on-surface/10 text-[11px] text-outline leading-relaxed">
                New student registrations enter <strong className="text-on-surface">Pending</strong> status until approved by the workspace administrator. Progress begins at <strong className="text-on-surface font-mono">0%</strong> for all accounts.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
