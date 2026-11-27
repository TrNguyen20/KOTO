'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  BookOpen,
  Layers,
  Headphones,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { MINNA_LESSONS_META, getLessonMeta } from '@/lib/minna-index';

interface LessonSwitcherBarProps {
  showSkillLinks?: boolean;
  showCompleteToggle?: boolean;
}

export function LessonSwitcherBar({
  showSkillLinks = false,
  showCompleteToggle = true,
}: LessonSwitcherBarProps) {
  const {
    activeLessonNumber,
    setActiveLessonNumber,
    completedLessons,
    toggleLessonComplete,
    route,
    setRoute,
  } = useKoto();

  const meta = getLessonMeta(activeLessonNumber);
  const isCompleted = completedLessons.includes(activeLessonNumber);
  const levelLessons = MINNA_LESSONS_META.filter((l) => l.jlpt === meta.jlpt);

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-3.5 sm:p-4 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Level Switcher + Prev/Next + Lesson Select */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-sm border border-on-surface/12 bg-surface-container-low p-0.5">
            <button
              type="button"
              onClick={() => {
                if (activeLessonNumber > 25) setActiveLessonNumber(1);
              }}
              className={`px-2.5 py-1 rounded-xs text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap ${
                meta.jlpt === 'N5'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              N5 (L01–25)
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeLessonNumber <= 25) setActiveLessonNumber(26);
              }}
              className={`px-2.5 py-1 rounded-xs text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap ${
                meta.jlpt === 'N4'
                  ? 'bg-secondary text-on-secondary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              N4 (L26–50)
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveLessonNumber(Math.max(1, activeLessonNumber - 1))}
              disabled={activeLessonNumber <= 1}
              aria-label="Previous Lesson"
              className="p-1.5 rounded-md border border-on-surface/12 bg-surface-container-low hover:bg-surface-container disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              aria-label="Select Minna no Nihongo Lesson"
              value={activeLessonNumber}
              onChange={(e) => setActiveLessonNumber(Number(e.target.value))}
              className="px-3 py-1.5 rounded-md border border-on-surface/15 bg-surface-container-low text-xs font-medium text-on-surface focus:outline-none focus:border-primary cursor-pointer max-w-[260px] sm:max-w-[340px]"
            >
              {levelLessons.map((l) => (
                <option key={l.lessonNumber} value={l.lessonNumber}>
                  {`L${String(l.lessonNumber).padStart(2, '0')} · ${l.titleJp} (${l.titleEn})${
                    l.status === 'coming-soon' ? ' [Preview]' : ''
                  }`}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setActiveLessonNumber(Math.min(50, activeLessonNumber + 1))}
              disabled={activeLessonNumber >= 50}
              aria-label="Next Lesson"
              className="p-1.5 rounded-md border border-on-surface/12 bg-surface-container-low hover:bg-surface-container disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lesson Status & Complete Toggle */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5">
          <div className="text-xs text-outline font-mono tabular-nums">
            Minna {meta.jlpt === 'N5' ? 'I' : 'II'} · Unit {String(meta.unitNumber).padStart(2, '0')} ·{' '}
            <span className="text-on-surface font-semibold">{completedLessons.length}/25 N5</span>
          </div>

          {showCompleteToggle && meta.status === 'available' && (
            <button
              type="button"
              onClick={() => toggleLessonComplete(activeLessonNumber)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                isCompleted
                  ? 'bg-tertiary-fixed/40 text-tertiary border-tertiary/35'
                  : 'bg-surface-container-low text-on-surface-variant border-on-surface/15 hover:border-primary/40'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
              <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Title & Optional 6-Skill Quick Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-on-surface/10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono font-bold text-primary">
              LESSON {String(meta.lessonNumber).padStart(2, '0')}
            </span>
            <span className="text-outline">·</span>
            <span className="font-serif font-bold text-on-surface">{meta.titleJp}</span>
            <span className="text-outline hidden sm:inline">·</span>
            <span className="text-on-surface-variant truncate">{meta.titleVi}</span>
          </div>
        </div>

        {showSkillLinks && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {[
              { r: 'lesson' as const, label: 'Exercises', icon: Sparkles },
              { r: 'vocabulary-lab' as const, label: 'Vocab', icon: BookOpen },
              { r: 'grammar-studio' as const, label: 'Grammar', icon: Layers },
              { r: 'listening-and-shadowing' as const, label: 'Listening', icon: Headphones },
              { r: 'reading-and-library' as const, label: 'Reading', icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = route === item.r;
              return (
                <button
                  key={item.r}
                  type="button"
                  onClick={() => setRoute(item.r)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-medium whitespace-nowrap border cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low text-on-surface-variant border-on-surface/10 hover:bg-surface-container'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
