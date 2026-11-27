'use client';

import React, { useState } from 'react';
import {
  Play,
  ArrowRight,
  Volume2,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  Grid2x2,
  GitBranch,
  Headphones,
  MessageSquare,
  Library,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { getLessonMeta } from '@/lib/minna-index';

type CadenceMode = 'sprint' | 'standard' | 'deep';

const CADENCE_META: Record<CadenceMode, { label: string; minutes: number; desc: string }> = {
  sprint: { label: '10-min Sprint', minutes: 10, desc: 'Quick SRS + 1 Particle Drill' },
  standard: { label: '25-min Standard', minutes: 25, desc: 'Balanced Review + Grammar + Shadowing' },
  deep: { label: '50-min Deep Immersion', minutes: 50, desc: 'Full Unit + Mock Section + AI Sensei' },
};

const WEEKLY_BARS = [
  { day: 'Mon', mins: 25, heightPct: 56, active: false },
  { day: 'Tue', mins: 32, heightPct: 72, active: false },
  { day: 'Wed', mins: 18, heightPct: 40, active: false },
  { day: 'Thu', mins: 45, heightPct: 100, active: false },
  { day: 'Fri', mins: 30, heightPct: 68, active: false },
  { day: 'Sat', mins: 28, heightPct: 62, active: false },
  { day: 'Sun', mins: 25, heightPct: 56, active: true },
];

export function DashboardView() {
  const {
    setRoute,
    activeJlpt,
    dueCount,
    studyTasks,
    toggleStudyTask,
    speakJapanese,
    openVocab,
    openKanji,
    openGrammar,
    lessonDraft,
    activeLessonNumber,
    completedLessons,
    openMinnaLesson,
  } = useKoto();

  const [cadence, setCadence] = useState<CadenceMode>('standard');

  const activeMeta = getLessonMeta(activeLessonNumber);
  const lessonCode = String(activeLessonNumber).padStart(2, '0');
  const completedN5Count = completedLessons.filter((n) => n >= 1 && n <= 25).length;
  const n5MasteryPct = Math.round((completedN5Count / 25) * 100);
  const doneCount = studyTasks.filter((t) => t.done).length;
  const hasSavedLessonDraft = Object.values(lessonDraft).some((arr) =>
    arr.some((tileId) => tileId !== null)
  );

  return (
    <div className="space-y-8">
      {/* Greeting Header & Cadence Selector */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-outline mb-2">
            <span>{activeMeta.jlpt} Track</span>
            <span>·</span>
            <span>Unit {String(activeMeta.unitNumber).padStart(2, '0')} · L{lessonCode}</span>
            <span>·</span>
            <span className="text-primary font-semibold">Day 18 Streak</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
            お帰りなさい、Ren
          </h1>
          <p className="text-sm text-on-surface-variant mt-1.5 max-w-2xl">
            {dueCount} items are ripe for memory consolidation today, and Minna Lesson {lessonCode} ({activeMeta.titleEn}) is queued across all 6 skills.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-md bg-surface-container border border-on-surface/10 self-start lg:self-auto">
          {(Object.keys(CADENCE_META) as CadenceMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setCadence(mode)}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                cadence === mode
                  ? 'bg-surface-container-lowest text-on-surface font-semibold border border-on-surface/10'
                  : 'text-on-surface-variant hover:text-on-surface border border-transparent'
              }`}
            >
              {CADENCE_META[mode].label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Dispatch Banner */}
      <section className="relative overflow-hidden rounded-lg bg-surface-container-lowest border border-on-surface/12 p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="px-2.5 py-0.5 rounded-sm bg-primary-fixed text-primary font-semibold font-mono border border-primary/20">
                ACTIVE MODULE · MINNA {activeMeta.jlpt === 'N5' ? 'I' : 'II'} · UNIT {String(activeMeta.unitNumber).padStart(2, '0')}
              </span>
              {hasSavedLessonDraft && (
                <span className="px-2 py-0.5 rounded-sm bg-secondary-fixed/50 text-secondary font-semibold font-mono border border-secondary/20">
                  再開 · Draft Saved
                </span>
              )}
              <span className="text-outline font-mono tabular-nums">
                {CADENCE_META[cadence].desc}
              </span>
            </div>

            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">
                Lesson {lessonCode}: {activeMeta.titleJp} — {activeMeta.titleEn}
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed max-w-2xl">
                {activeMeta.titleVi} · Core patterns:{' '}
                <span className="font-serif font-semibold text-primary">
                  {activeMeta.grammarSummary.join(' / ')}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => openMinnaLesson(activeLessonNumber, 'lesson')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{hasSavedLessonDraft ? `Resume Lesson ${lessonCode}` : `Open Lesson ${lessonCode}`}</span>
              </button>
              <button
                type="button"
                onClick={() => setRoute('review-center')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-transparent text-on-surface text-sm font-medium border border-on-surface/15 hover:bg-surface-container-low transition-colors cursor-pointer tabular-nums"
              >
                <span>Clear Review Queue ({dueCount})</span>
                <ArrowRight className="w-4 h-4 text-outline" />
              </button>
            </div>
          </div>

          {/* Right Hanko Stamp & Progress Ring */}
          <div className="lg:col-span-4 flex lg:justify-end">
            <div className="w-full max-w-[260px] rounded-lg bg-surface-container-low p-5 border border-on-surface/10 flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-outline">
                  N5 Syllabus Mastery
                </div>
                <div className="font-serif text-3xl font-bold text-on-surface mt-1 tabular-nums">
                  {n5MasteryPct}%
                </div>
                <div className="text-xs text-tertiary font-medium mt-1 tabular-nums">
                  {completedN5Count} of 25 N5 lessons done
                </div>
              </div>
              <div className="w-16 h-16 rounded-xs border-2 border-primary/80 flex flex-col items-center justify-center text-primary font-serif rotate-[-4deg] bg-surface-container-lowest shrink-0">
                <span className="text-lg font-bold leading-none">基礎</span>
                <span className="text-lg font-bold leading-none mt-0.5">初級</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Column Action Matrix */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Today's Study Plan */}
        <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-on-surface">
                  Today’s Study Plan
                </h3>
                <p className="text-xs text-outline">
                  {doneCount} of {studyTasks.length} checkpoints verified
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                {CADENCE_META[cadence].minutes}m Target
              </span>
            </div>

            <div className="space-y-2.5">
              {studyTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-md border transition-colors flex items-start justify-between gap-3 ${
                    task.done
                      ? 'bg-tertiary-fixed/20 border-tertiary/25'
                      : 'bg-surface-container-low border-outline-variant/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleStudyTask(task.id)}
                    className="mt-0.5 text-primary shrink-0 cursor-pointer"
                    aria-label={`Mark ${task.title} complete`}
                  >
                    {task.done ? (
                      <CheckCircle2 className="w-4 h-4 text-tertiary" />
                    ) : (
                      <Circle className="w-4 h-4 text-outline" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoute(task.targetRoute)}
                    className="flex-1 text-left cursor-pointer min-w-0"
                  >
                    <div
                      className={`text-xs font-semibold truncate ${
                        task.done ? 'line-through text-outline' : 'text-on-surface'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-[11px] text-outline mt-0.5 truncate">
                      {task.subtitle}
                    </div>
                  </button>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 tabular-nums ${
                      task.done
                        ? 'bg-tertiary-fixed text-tertiary font-semibold'
                        : task.badgeTone === 'error'
                          ? 'bg-primary-fixed text-primary font-semibold'
                          : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {task.done ? 'Done' : `${task.minutes}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRoute('learning-path')}
            className="mt-4 w-full py-2 rounded-md bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors cursor-pointer"
          >
            Open Full Curriculum Blueprint →
          </button>
        </div>

        {/* Card 2: SRS Retention Health */}
        <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-on-surface">
                  SRS Retention Health
                </h3>
                <p className="text-xs text-outline">Ebbinghaus decay curve · 7 days</p>
              </div>
              <span className="text-xs font-mono font-bold text-tertiary tabular-nums">
                91.4% Recall
              </span>
            </div>

            {/* Retention Sparkline SVG */}
            <div className="rounded-md bg-surface-container-low p-3 border border-outline-variant/15 mb-4">
              <svg viewBox="0 0 280 76" className="w-full h-16 overflow-visible">
                <defs>
                  <linearGradient id="srsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#35633e" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#35633e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 8 52 C 48 44, 72 34, 112 36 C 148 38, 178 22, 214 18 C 238 15, 256 12, 272 10 L 272 70 L 8 70 Z"
                  fill="url(#srsFill)"
                />
                <path
                  d="M 8 52 C 48 44, 72 34, 112 36 C 148 38, 178 22, 214 18 C 238 15, 256 12, 272 10"
                  fill="none"
                  stroke="#35633e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="272" cy="10" r="4" fill="#35633e" />
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-md bg-surface-container-low">
                <div className="font-mono text-base font-bold text-primary tabular-nums">
                  {dueCount}
                </div>
                <div className="text-[10px] text-outline uppercase">Due Now</div>
              </div>
              <div className="p-2.5 rounded-md bg-surface-container-low">
                <div className="font-mono text-base font-bold text-secondary tabular-nums">
                  142
                </div>
                <div className="text-[10px] text-outline uppercase">Learning</div>
              </div>
              <div className="p-2.5 rounded-md bg-surface-container-low">
                <div className="font-mono text-base font-bold text-tertiary tabular-nums">
                  476
                </div>
                <div className="text-[10px] text-outline uppercase">Mastered</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRoute('review-center')}
            className="mt-4 w-full py-2 rounded-md bg-primary-fixed/60 hover:bg-primary-fixed text-xs font-semibold text-primary transition-colors cursor-pointer"
          >
            Launch Flashcard Session ({dueCount} Due)
          </button>
        </div>

        {/* Card 3: AI Sensei Diagnostic */}
        <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-serif text-lg font-bold text-on-surface">
                  AI Sensei Diagnostic
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-primary-fixed text-primary">
                ACTIVE FOCUS
              </span>
            </div>

            <div className="p-3.5 rounded-md bg-surface-container-low border border-outline-variant/20 space-y-2">
              <div className="text-xs font-semibold text-on-surface">
                Location Particle Drift: <span className="font-serif text-primary">に</span> vs.{' '}
                <span className="font-serif text-secondary">で</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Recent mock items show 22% hesitation when pairing transit stations with alighting verbs (電車を降りる vs. 新宿駅で).
              </p>
            </div>

            <div className="mt-3 p-3 rounded-md bg-secondary-fixed/30 border border-secondary/20 text-xs text-on-secondary-fixed">
              <span className="font-semibold">Prescription:</span> Complete the 3-minute contrastive particle drill or practice ordering at Ginza Café Rengetsu.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openGrammar('ni-vs-de')}
              className="py-2 px-3 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
            >
              3-min Particle Drill
            </button>
            <button
              type="button"
              onClick={() => setRoute('ai-sensei-tutor')}
              className="py-2 px-3 rounded-md bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface border border-on-surface/10 transition-colors cursor-pointer"
            >
              Open Sensei AI
            </button>
          </div>
        </div>
      </section>

      {/* Core Pillars Bento Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-on-surface">
              Six Core Mastery Pillars
            </h2>
            <p className="text-xs text-outline">
              Direct entry into specialized studios synced to your {activeJlpt} curriculum
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRoute('jlpt-exam-center')}
            className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View JLPT Telemetry</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Vocabulary Lab */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 hover:border-primary/35 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary">
                  <BookOpen className="w-4 h-4" />
                  Vocabulary Lab
                </span>
                <span className="text-[11px] font-mono text-outline tabular-nums">476 / 800 語</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-serif text-2xl font-bold text-on-surface">
                  喫茶店 <span className="text-xs font-sans font-normal text-outline">きっさてん</span>
                </div>
                <button
                  type="button"
                  onClick={() => speakJapanese('喫茶店')}
                  className="p-1.5 rounded-lg bg-surface-container-low hover:bg-primary-fixed/40 text-secondary cursor-pointer"
                  aria-label="Play pronunciation"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Traditional Japanese retro tearoom &amp; pour-over coffeehouse.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openVocab('kissaten')}
              className="mt-4 text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Lexical Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Kanji Studio */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 hover:border-primary/35 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Grid2x2 className="w-4 h-4" />
                  Kanji Intelligence
                </span>
                <span className="text-[11px] font-mono text-outline tabular-nums">82 / 103 字</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-surface-container-low border border-outline-variant/30 flex items-center justify-center font-serif text-3xl font-bold text-primary">
                  時
                </div>
                <div>
                  <div className="text-sm font-semibold text-on-surface">Time / Hour</div>
                  <div className="text-xs text-outline">Radical #72 日 · 10 Strokes</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openKanji('時')}
              className="mt-4 text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Dissect Strokes &amp; Calligraphy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grammar Studio */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 hover:border-primary/35 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-tertiary">
                  <GitBranch className="w-4 h-4" />
                  Grammar Studio
                </span>
                <span className="text-[11px] font-mono text-outline tabular-nums">78% Retention</span>
              </div>
              <div className="font-serif text-xl font-bold text-on-surface">
                〜に vs. 〜で
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Destination coordinate vs. active staging venue in motion clauses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openGrammar('ni-vs-de')}
              className="mt-4 text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Compare &amp; Drill Pattern</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Listening & Shadowing */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 hover:border-primary/35 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary">
                  <Headphones className="w-4 h-4" />
                  Listening &amp; Shadowing
                </span>
                <span className="text-[11px] font-mono text-outline">01:45 Track</span>
              </div>
              <div className="text-sm font-semibold text-on-surface">
                Commuter Morning: Shinjuku Station
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Tokenized native cadence with pitch contour visualization &amp; dictation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRoute('listening-and-shadowing')}
              className="mt-4 text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Enter Acoustic Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Sensei Roleplay */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 hover:border-primary/35 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <MessageSquare className="w-4 h-4" />
                  AI Sensei Roleplay
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary-fixed text-primary font-bold">
                  LIVE GEMINI
                </span>
              </div>
              <div className="text-sm font-semibold text-on-surface">
                Ginza Retro Kissaten Rengetsu
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Converse in natural polite Japanese with real-time morphology &amp; Keigo coaching.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRoute('ai-sensei-tutor')}
              className="mt-4 text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Start Dialogue Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reading & Library */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 hover:border-primary/35 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-tertiary">
                  <Library className="w-4 h-4" />
                  Reading &amp; Library
                </span>
                <span className="text-[11px] font-mono text-outline">Graded Readers</span>
              </div>
              <div className="text-sm font-semibold text-on-surface">
                東京の小さな喫茶店 (Tokyo’s Little Cafe)
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Toggleable furigana immersion passages with click-to-pronounce sentences.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRoute('reading-and-library')}
              className="mt-4 text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Reading Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Row: Weekly Cadence + JLPT N5 Readiness */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif text-lg font-bold text-on-surface">
                Weekly Study Cadence
              </h3>
              <p className="text-xs text-outline">203 active minutes logged this week</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary">
              <TrendingUp className="w-3.5 h-3.5" />
              +14% vs last week
            </span>
          </div>

          <div className="grid grid-cols-7 gap-3 items-end h-36 pt-4">
            {WEEKLY_BARS.map((bar) => (
              <div key={bar.day} className="flex flex-col items-center h-full justify-end gap-2">
                <span className="text-[10px] font-mono text-outline tabular-nums">
                  {bar.mins}m
                </span>
                <div className="w-full max-w-[34px] h-24 bg-surface-container-low rounded-lg flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      bar.active ? 'bg-primary' : 'bg-secondary/75'
                    }`}
                    style={{ height: `${bar.heightPct}%` }}
                  />
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    bar.active ? 'text-primary font-bold' : 'text-outline'
                  }`}
                >
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
                Official Benchmark Projection
              </span>
              <h3 className="font-serif text-xl font-bold text-on-surface mt-1">
                JLPT N5 Readiness
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Projected exam score <strong className="text-on-surface tabular-nums">148 / 180</strong> (Pass threshold: 80)
              </p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="33"
                  fill="none"
                  stroke="#f0edef"
                  strokeWidth="7"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="33"
                  fill="none"
                  stroke="#ae1d14"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={207.3}
                  strokeDashoffset={207.3 * (1 - 0.82)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-primary tabular-nums">
                82%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 my-4 text-xs">
            <div className="p-2.5 rounded-md bg-surface-container-low">
              <div className="text-outline text-[10px]">Vocab / Kanji</div>
              <div className="font-mono font-bold text-on-surface mt-0.5 tabular-nums">52 / 60</div>
            </div>
            <div className="p-2.5 rounded-md bg-surface-container-low">
              <div className="text-outline text-[10px]">Grammar / Read</div>
              <div className="font-mono font-bold text-on-surface mt-0.5 tabular-nums">49 / 60</div>
            </div>
            <div className="p-2.5 rounded-md bg-surface-container-low">
              <div className="text-outline text-[10px]">Listening</div>
              <div className="font-mono font-bold text-on-surface mt-0.5 tabular-nums">47 / 60</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRoute('jlpt-exam-center')}
            className="w-full py-2.5 rounded-md bg-secondary text-on-secondary text-xs font-semibold hover:opacity-95 transition-opacity cursor-pointer"
          >
            Enter JLPT Exam &amp; Analytics Arena →
          </button>
        </div>
      </section>
    </div>
  );
}
