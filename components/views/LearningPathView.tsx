'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Play,
  Lock,
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
  Layers,
  Headphones,
  FileText,
  Search,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { LEARNING_LEVELS, N5_UNITS } from '@/lib/koto-data';
import { MINNA_LESSONS_META, MINNA_UNITS_META, getLessonMeta } from '@/lib/minna-index';

export function LearningPathView() {
  const {
    activeJlpt,
    setActiveJlpt,
    activeLessonNumber,
    openMinnaLesson,
    completedLessons,
    toggleLessonComplete,
    setRoute,
    showToast,
  } = useKoto();

  const [selectedUnit, setSelectedUnit] = useState<'ALL' | number>('ALL');
  const [search, setSearch] = useState('');

  const completedN5Count = useMemo(
    () => completedLessons.filter((n) => n >= 1 && n <= 25).length,
    [completedLessons]
  );
  const completedN4Count = useMemo(
    () => completedLessons.filter((n) => n >= 26 && n <= 50).length,
    [completedLessons]
  );
  const n5ProgressPct = Math.round((completedN5Count / 25) * 100);
  const n4ProgressPct = Math.round((completedN4Count / 25) * 100);

  const selectedLevel =
    LEARNING_LEVELS.find((l) => l.id === activeJlpt) ?? LEARNING_LEVELS[0];

  const isMinnaTrack = activeJlpt === 'N5' || activeJlpt === 'N4';

  const unitsForLevel = useMemo(() => {
    if (!isMinnaTrack) return [];
    const q = search.trim().toLowerCase();
    return MINNA_UNITS_META.filter((u) => u.jlpt === activeJlpt)
      .filter((u) => selectedUnit === 'ALL' || u.unitNumber === selectedUnit)
      .map((unit) => {
        const lessons = MINNA_LESSONS_META.filter(
          (l) => l.unitNumber === unit.unitNumber
        ).filter((l) => {
          if (!q) return true;
          return (
            l.titleJp.toLowerCase().includes(q) ||
            l.titleEn.toLowerCase().includes(q) ||
            l.titleVi.toLowerCase().includes(q) ||
            l.topicTag.toLowerCase().includes(q) ||
            l.grammarSummary.some((g) => g.toLowerCase().includes(q)) ||
            String(l.lessonNumber).includes(q)
          );
        });
        return { unit, lessons };
      })
      .filter((group) => group.lessons.length > 0);
  }, [isMinnaTrack, activeJlpt, selectedUnit, search]);

  const activeMeta = getLessonMeta(activeLessonNumber);

  return (
    <div className="space-y-8">
      {/* Level Horizon Switcher */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
              Minna no Nihongo I &amp; II · 50-Lesson Curriculum
            </div>
            <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
              Structured Mastery Path
            </h1>
          </div>
          <span className="text-xs text-outline font-mono tabular-nums">
            N5 Complete (L01–25) · N4 Roadmap (L26–50)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {LEARNING_LEVELS.map((lvl) => {
            const isSelected = activeJlpt === lvl.id;
            const progressVal =
              lvl.id === 'N5' ? n5ProgressPct : lvl.id === 'N4' ? n4ProgressPct : lvl.progress;
            const modulesDoneText =
              lvl.id === 'N5'
                ? `${completedN5Count} / 25 Lessons`
                : lvl.id === 'N4'
                  ? `${completedN4Count} / 25 Mapped`
                  : lvl.modulesDone;
            const remainingText =
              lvl.id === 'N5'
                ? `${25 - completedN5Count} remaining`
                : lvl.id === 'N4'
                  ? 'Milestone 2 Packs'
                  : lvl.remaining;

            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => {
                  setActiveJlpt(lvl.id);
                  setSelectedUnit('ALL');
                }}
                className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-surface-container-lowest border-primary'
                    : lvl.status === 'locked' && lvl.id !== 'N4'
                      ? 'bg-surface-container-low/70 border-outline-variant/20 opacity-80 hover:opacity-100'
                      : 'bg-surface-container-lowest border-on-surface/10 hover:border-secondary/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-serif text-lg font-bold ${
                      isSelected ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    {lvl.id} · {lvl.kanjiNum}
                  </span>
                  {lvl.status === 'locked' && lvl.id !== 'N4' ? (
                    <Lock className="w-3.5 h-3.5 text-outline" />
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-primary-fixed text-primary tabular-nums">
                      {progressVal}%
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-on-surface">{lvl.title}</div>
                <div className="text-[11px] font-serif text-outline">{lvl.jpSub}</div>
                <div className="mt-3 w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isSelected ? 'bg-primary' : 'bg-secondary'
                    }`}
                    style={{ width: `${progressVal}%` }}
                  />
                </div>
                <div className="mt-1.5 text-[10px] font-mono text-outline tabular-nums">
                  {modulesDoneText} · {remainingText}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Level Overview Banner & Stats */}
      <section className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary font-semibold">
              <span>{selectedLevel.id} CURRICULUM OVERVIEW</span>
              <span>·</span>
              <span>
                {activeJlpt === 'N5'
                  ? 'Minna no Nihongo I (L01–25)'
                  : activeJlpt === 'N4'
                    ? 'Minna no Nihongo II (L26–50)'
                    : selectedLevel.jpSub}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-on-surface">
              JLPT {selectedLevel.id}: {selectedLevel.title} Architecture
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {activeJlpt === 'N5'
                ? 'Full 6-skill coverage across all 25 lessons of Minna no Nihongo I: vocabulary, contrastive grammar, kanji, listening & shadowing, graded reading, and interactive drills.'
                : activeJlpt === 'N4'
                  ? 'Complete 25-lesson syllabus index (Lessons 26–50) for Minna no Nihongo II covering potential, volitional, passive, causative, and keigo registers.'
                  : selectedLevel.description}
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-5 gap-2 text-center">
            {[
              { label: 'Units', val: isMinnaTrack ? '5' : selectedLevel.unitsCount },
              { label: 'Lessons', val: isMinnaTrack ? '25' : selectedLevel.lessonsCount },
              { label: 'Vocab', val: selectedLevel.vocabCount },
              { label: 'Kanji', val: selectedLevel.kanjiCount },
              { label: 'Patterns', val: selectedLevel.patternsCount },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-2.5 rounded-md bg-surface-container-low border border-outline-variant/15"
              >
                <div className="font-mono text-base font-bold text-on-surface tabular-nums">
                  {stat.val}
                </div>
                <div className="text-[10px] text-outline uppercase mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unit Filter Tabs + Search (for N5 / N4 Minna Tracks) */}
      {isMinnaTrack && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedUnit('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                selectedUnit === 'ALL'
                  ? 'bg-primary text-on-primary border-primary font-semibold'
                  : 'bg-surface-container-low text-on-surface-variant border-on-surface/10 hover:bg-surface-container'
              }`}
            >
              All 25 Lessons
            </button>
            {MINNA_UNITS_META.filter((u) => u.jlpt === activeJlpt).map((u) => (
              <button
                key={u.unitNumber}
                type="button"
                onClick={() => setSelectedUnit(u.unitNumber)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border tabular-nums ${
                  selectedUnit === u.unitNumber
                    ? 'bg-primary text-on-primary border-primary font-semibold'
                    : 'bg-surface-container-low text-on-surface-variant border-on-surface/10 hover:bg-surface-container'
                }`}
              >
                {`Unit ${String(u.unitNumber).padStart(2, '0')} (L${u.lessonRange[0]}–${u.lessonRange[1]})`}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lesson, grammar, or topic..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface-container-lowest border border-on-surface/15 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* Main Content + Curriculum Blueprint Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-5">
          {isMinnaTrack ? (
            <>
              {activeJlpt === 'N4' && (
                <div className="p-4 rounded-lg bg-secondary-fixed/25 border border-secondary/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono font-bold text-secondary uppercase">
                      Milestone 2 Syllabus Index · Lessons 26–50
                    </div>
                    <p className="text-xs text-on-surface mt-1 leading-relaxed">
                      All 25 N4 lessons from Minna no Nihongo II are mapped below. Full N5 Lessons 01–25 are active now with complete 6-skill study packs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveJlpt('N5');
                      setSelectedUnit('ALL');
                    }}
                    className="px-3.5 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    Switch to N5 (L01–25)
                  </button>
                </div>
              )}

              {unitsForLevel.length === 0 && (
                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 text-center text-xs text-outline">
                  No lessons matched your filter. Try clearing the search box.
                </div>
              )}

              {unitsForLevel.map(({ unit, lessons }) => {
                const unitDone = lessons.filter((l) =>
                  completedLessons.includes(l.lessonNumber)
                ).length;

                return (
                  <div
                    key={unit.unitNumber}
                    className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 pb-4 border-b border-outline-variant/15">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="px-2 py-0.5 rounded-xs bg-primary text-on-primary font-semibold tabular-nums">
                            UNIT {String(unit.unitNumber).padStart(2, '0')}
                          </span>
                          <span className="font-serif text-base font-bold text-on-surface">
                            {unit.titleJp}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-on-surface mt-1">
                          {unit.titleEn}
                        </h3>
                        <p className="text-xs text-outline mt-0.5">{unit.titleVi}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-semibold text-on-surface tabular-nums">
                          {unit.jlpt === 'N5'
                            ? `${unitDone} / ${lessons.length} Done`
                            : `L${unit.lessonRange[0]}–${unit.lessonRange[1]}`}
                        </div>
                        <div className="text-[11px] text-outline">
                          {unit.jlpt === 'N5' ? '6 Skills Active' : 'Syllabus Mapped'}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {unit.description}
                    </p>

                    <div className="space-y-3">
                      {lessons.map((lesson) => {
                        const isDone = completedLessons.includes(lesson.lessonNumber);
                        const isCurrent = activeLessonNumber === lesson.lessonNumber;
                        const isAvailable = lesson.status === 'available';

                        return (
                          <div
                            key={lesson.lessonNumber}
                            className={`p-4 rounded-md border transition-colors space-y-3 ${
                              isCurrent
                                ? 'bg-primary-fixed/20 border-primary/50'
                                : 'bg-surface-container-low border-outline-variant/20'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                {isAvailable ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleLessonComplete(lesson.lessonNumber)}
                                    title={isDone ? 'Unmark complete' : 'Mark complete'}
                                    className="mt-0.5 shrink-0 cursor-pointer"
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="w-4 h-4 text-tertiary" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-outline hover:text-primary" />
                                    )}
                                  </button>
                                ) : (
                                  <Lock className="w-4 h-4 text-outline mt-0.5 shrink-0" />
                                )}

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-[11px] font-bold text-primary tabular-nums">
                                      L{String(lesson.lessonNumber).padStart(2, '0')}
                                    </span>
                                    <span className="font-serif text-base font-bold text-on-surface">
                                      {lesson.titleJp}
                                    </span>
                                    <span className="text-xs text-outline">·</span>
                                    <span className="text-xs font-semibold text-on-surface">
                                      {lesson.titleEn}
                                    </span>
                                  </div>
                                  <div className="text-xs text-on-surface-variant mt-0.5">
                                    {lesson.titleVi}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                    {lesson.grammarSummary.map((g, gi) => (
                                      <span
                                        key={gi}
                                        className="text-[11px] font-serif px-2 py-0.5 rounded-xs bg-surface-container-lowest border border-on-surface/10 text-on-surface-variant"
                                      >
                                        {g}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                                <button
                                  type="button"
                                  onClick={() => openMinnaLesson(lesson.lessonNumber, 'lesson')}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                                    isAvailable
                                      ? 'bg-primary text-on-primary hover:bg-primary-container'
                                      : 'bg-surface-container text-on-surface-variant border border-on-surface/15'
                                  }`}
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>{isAvailable ? 'Open Lesson' : 'Preview'}</span>
                                </button>
                              </div>
                            </div>

                            {isAvailable && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-on-surface/8">
                                <span className="text-[10px] font-mono uppercase text-outline mr-1">
                                  6-Skill Jump:
                                </span>
                                {[
                                  { r: 'vocabulary-lab' as const, label: 'Vocab', icon: BookOpen },
                                  { r: 'grammar-studio' as const, label: 'Grammar', icon: Layers },
                                  { r: 'kanji-studio' as const, label: 'Kanji', icon: Sparkles },
                                  { r: 'listening-and-shadowing' as const, label: 'Listening', icon: Headphones },
                                  { r: 'reading-and-library' as const, label: 'Reading', icon: FileText },
                                ].map((sk) => {
                                  const Icon = sk.icon;
                                  return (
                                    <button
                                      key={sk.r}
                                      type="button"
                                      onClick={() => openMinnaLesson(lesson.lessonNumber, sk.r)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-xs bg-surface-container-lowest border border-on-surface/10 hover:border-primary/40 text-[11px] font-medium text-on-surface-variant hover:text-primary cursor-pointer"
                                    >
                                      <Icon className="w-3 h-3" />
                                      <span>{sk.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div className="p-5 rounded-lg bg-secondary-fixed/25 border border-secondary/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono font-bold text-secondary uppercase">
                    Preview Mode · {selectedLevel.remaining}
                  </div>
                  <p className="text-sm text-on-surface mt-1">
                    You are previewing the {selectedLevel.id} syllabus roadmap. Take a diagnostic placement check or master N5 Lessons 01–25 first.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRoute('jlpt-exam-center')}
                  className="px-4 py-2 rounded-md bg-secondary text-on-secondary text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Placement Check
                </button>
              </div>

              {N5_UNITS.map((unit) => (
                <div
                  key={unit.unitNum}
                  className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 sm:p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-on-surface">
                      {unit.unitNum} · {unit.titleEn}
                    </h3>
                    <button
                      type="button"
                      onClick={() => showToast(`Switch to N5 or N4 to explore active Minna modules.`)}
                      className="text-xs font-semibold text-primary cursor-pointer"
                    >
                      Syllabus Reference
                    </button>
                  </div>
                  <p className="text-xs text-outline">{unit.description}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Sticky Curriculum Blueprint Sidebar */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-on-surface">
                Minna N5 Progress
              </h3>
              <Award className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Active lesson:{' '}
              <strong className="text-on-surface">
                L{String(activeMeta.lessonNumber).padStart(2, '0')} · {activeMeta.titleJp}
              </strong>
              . Complete all 25 N5 lessons to build full Minna I mastery before N4.
            </p>
            <div className="p-3 rounded-md bg-surface-container-low space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-outline">N5 Lessons Completed</span>
                <span className="font-mono font-bold text-primary tabular-nums">
                  {completedN5Count} / 25 ({n5ProgressPct}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${n5ProgressPct}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => openMinnaLesson(activeLessonNumber, 'lesson')}
              className="w-full py-2.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Resume Lesson {String(activeLessonNumber).padStart(2, '0')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
              <Layers className="w-4 h-4" />
              <span>Active Lesson Pillars (L{String(activeLessonNumber).padStart(2, '0')})</span>
            </div>
            <button
              type="button"
              onClick={() => setRoute('grammar-studio')}
              className="w-full p-3 rounded-md bg-surface-container-low hover:bg-surface-container text-left flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-semibold text-on-surface">Grammar Studio</div>
                <div className="text-[11px] text-outline truncate max-w-[220px]">
                  {activeMeta.grammarSummary[0]}
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-outline" />
            </button>
            <button
              type="button"
              onClick={() => setRoute('vocabulary-lab')}
              className="w-full p-3 rounded-md bg-surface-container-low hover:bg-surface-container text-left flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-semibold text-on-surface">Vocabulary Deck</div>
                <div className="text-[11px] text-outline">{activeMeta.topicTag}</div>
              </div>
              <BookOpen className="w-3.5 h-3.5 text-outline" />
            </button>
            <button
              type="button"
              onClick={() => setRoute('ai-sensei-tutor')}
              className="w-full p-3 rounded-md bg-primary-fixed/30 hover:bg-primary-fixed/50 text-left flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-semibold text-primary">AI Sensei Practice</div>
                <div className="text-[11px] text-on-surface-variant">
                  Apply Lesson {activeLessonNumber} live
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
