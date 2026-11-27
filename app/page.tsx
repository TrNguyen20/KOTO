'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { KotoProvider, useKoto } from '@/context/KotoContext';
import { KotoShell } from '@/components/KotoShell';
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

export default function HomePage() {
  return (
    <KotoProvider>
      <KotoShell>
        <KotoRouteViewport />
      </KotoShell>
    </KotoProvider>
  );
}
