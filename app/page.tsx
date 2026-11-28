'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { KotoProvider, useKoto } from '@/context/KotoContext';
import { KotoShell } from '@/components/KotoShell';
import { LoginGateView } from '@/components/views/LoginGateView';
import { AdminSheetsView } from '@/components/views/AdminSheetsView';
import { DashboardView } from '@/components/views/DashboardView';
import { LearningPathView } from '@/components/views/LearningPathView';
import { InteractiveLessonView } from '@/components/views/InteractiveLessonView';
import { VocabularyLabView } from '@/components/views/VocabularyLabView';
import { KanjiStudioView } from '@/components/views/KanjiStudioView';
import { GrammarStudioView } from '@/components/views/GrammarStudioView';
import { ListeningLabView } from '@/components/views/ListeningLabView';
import { ExamCenterView } from '@/components/views/ExamCenterView';
import { AiSenseiTutorView } from '@/components/views/AiSenseiTutorView';
import {
  CultureKeigoView,
  ReadingLibraryView,
  ReviewCenterView,
  SettingsView,
  SpeakingDialogueView,
  WritingCompositionView,
} from '@/components/views/SecondaryPillarsView';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class KotoErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected application error.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface-container-lowest rounded-lg border border-error/30 p-6 space-y-3">
            <h1 className="font-serif text-xl font-bold text-primary">
              KOTO Workspace Error
            </h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Something interrupted the current session. Reload the page to restore your synced state.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold cursor-pointer"
            >
              Reload Workspace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function KotoRouteViewport() {
  const { route } = useKoto();

  const renderView = () => {
    switch (route) {
      case 'dashboard':
        return <DashboardView />;
      case 'learning-path':
        return <LearningPathView />;
      case 'lesson':
        return <InteractiveLessonView />;
      case 'vocabulary-lab':
        return <VocabularyLabView />;
      case 'kanji-studio':
        return <KanjiStudioView />;
      case 'grammar-studio':
        return <GrammarStudioView />;
      case 'listening-and-shadowing':
        return <ListeningLabView />;
      case 'jlpt-exam-center':
        return <ExamCenterView />;
      case 'ai-sensei-tutor':
        return <AiSenseiTutorView />;
      case 'review-center':
        return <ReviewCenterView />;
      case 'speaking-and-dialogue':
        return <SpeakingDialogueView />;
      case 'reading-and-library':
        return <ReadingLibraryView />;
      case 'writing-and-composition':
        return <WritingCompositionView />;
      case 'culture-and-keigo':
        return <CultureKeigoView />;
      case 'settings':
        return <SettingsView />;
      case 'admin-database':
        return <AdminSheetsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={route}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
}

function AuthenticatedWorkspace() {
  const { firebaseUser, userAccount } = useKoto();

  if (!firebaseUser || userAccount?.status !== 'active') {
    return <LoginGateView />;
  }

  return (
    <KotoShell>
      <KotoRouteViewport />
    </KotoShell>
  );
}

export default function HomePage() {
  return (
    <KotoErrorBoundary>
      <KotoProvider>
        <AuthenticatedWorkspace />
      </KotoProvider>
    </KotoErrorBoundary>
  );
}
