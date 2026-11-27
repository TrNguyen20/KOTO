'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Volume2,
  RotateCcw,
  Sparkles,
  Play,
  ArrowRight,
  Loader2,
  Lock,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { LESSON_CHALLENGES, LessonTile } from '@/lib/koto-data';
import { useMinnaLesson } from '@/hooks/use-minna-lesson';
import { LessonSwitcherBar } from '@/components/LessonSwitcherBar';

export function InteractiveLessonView() {
  const {
    setRoute,
    activeLessonNumber,
    setActiveLessonNumber,
    markLessonComplete,
    speakJapanese,
    showToast,
    lessonDraft,
    updateLessonDraft,
  } = useKoto();

  const { meta, pack, loading } = useMinnaLesson(activeLessonNumber);

  const [challengeIdx, setChallengeIdx] = useState(0);
  const [checkState, setCheckState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [shadowSpeed, setShadowSpeed] = useState<number>(1.0);
  const [drillAnswers, setDrillAnswers] = useState<Record<string, number>>({});

  const challenges = pack?.exercises.challenges ?? LESSON_CHALLENGES;
  const safeIdx = Math.min(challengeIdx, Math.max(0, challenges.length - 1));
  const challenge = challenges[safeIdx] ?? LESSON_CHALLENGES[0];

  const savedTileIds = lessonDraft[challenge.id];
  const placedTiles: (LessonTile | null)[] = challenge.slots.map((_, idx) => {
    const tileId = savedTileIds?.[idx];
    return tileId ? challenge.tiles.find((t) => t.id === tileId) ?? null : null;
  });

  const commitPlaced = (nextTiles: (LessonTile | null)[]) => {
    updateLessonDraft(
      challenge.id,
      nextTiles.map((t) => t?.id ?? null)
    );
  };

  const switchChallenge = (idx: number) => {
    setChallengeIdx(idx);
    setCheckState('idle');
  };

  const handleTileClick = (tile: LessonTile) => {
    const alreadyPlacedIdx = placedTiles.findIndex((t) => t?.id === tile.id);
    if (alreadyPlacedIdx !== -1) {
      const next = [...placedTiles];
      next[alreadyPlacedIdx] = null;
      commitPlaced(next);
      setCheckState('idle');
      return;
    }
    const emptyIdx = placedTiles.findIndex((t) => t === null);
    if (emptyIdx === -1) return;
    const next = [...placedTiles];
    next[emptyIdx] = tile;
    commitPlaced(next);
    setCheckState('idle');
  };

  const handleRemoveSlot = (slotIdx: number) => {
    const next = [...placedTiles];
    next[slotIdx] = null;
    commitPlaced(next);
    setCheckState('idle');
  };

  const handleReset = () => {
    commitPlaced(challenge.slots.map(() => null));
    setCheckState('idle');
  };

  const handleAutoAssemble = () => {
    const solution = challenge.slots.map(
      (s) => challenge.tiles.find((t) => t.word === s.expectedWord) ?? null
    );
    commitPlaced(solution);
    setCheckState('correct');
    speakJapanese(challenge.fullJapanese, shadowSpeed);
    showToast('Syntactic alignment verified and synthesized.');
  };

  const handleCheck = () => {
    const allFilled = placedTiles.every((t) => t !== null);
    if (!allFilled) {
      showToast('Fill all syntactic slots before checking.');
      return;
    }
    const isMatch = challenge.slots.every(
      (slot, idx) => placedTiles[idx]?.word === slot.expectedWord
    );
    setCheckState(isMatch ? 'correct' : 'incorrect');
    if (isMatch) {
      speakJapanese(challenge.fullJapanese, shadowSpeed);
      showToast('Exact syntactic assembly! +25 XP');
    } else {
      showToast('Review particle order or tense inflection and try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRoute('learning-path')}
            className="p-2 rounded-md bg-surface-container-low border border-on-surface/10 hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
            aria-label="Back to Learning Path"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-outline">
              JLPT {meta.jlpt} · Unit {String(meta.unitNumber).padStart(2, '0')} · Minna Lesson {meta.lessonNumber}
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-on-surface">
              {meta.titleJp} — {meta.titleEn}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            markLessonComplete(activeLessonNumber);
            if (activeLessonNumber < 25) {
              setActiveLessonNumber(activeLessonNumber + 1);
              setChallengeIdx(0);
              setCheckState('idle');
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-tertiary text-on-tertiary text-xs font-semibold hover:opacity-95 cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {activeLessonNumber < 25
              ? `Complete & Next (L${String(activeLessonNumber + 1).padStart(2, '0')})`
              : 'Complete Lesson 25'}
          </span>
        </button>
      </div>

      {/* Shared 50-Lesson Switcher + 6-Skill Links */}
      <LessonSwitcherBar showSkillLinks showCompleteToggle />

      {/* N4 Milestone 2 Preview State */}
      {meta.status === 'coming-soon' ? (
        <div className="bg-surface-container-lowest rounded-lg border border-secondary/30 p-8 space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-secondary uppercase">
            <Lock className="w-4 h-4" />
            <span>Milestone 2 Syllabus Preview · Minna no Nihongo II (N4)</span>
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl font-bold text-on-surface">
              Lesson {meta.lessonNumber}: {meta.titleJp} ({meta.titleEn})
            </h2>
            <p className="text-sm text-on-surface-variant">{meta.titleVi}</p>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase text-outline">
              Target Grammar Blueprints
            </div>
            <div className="flex flex-wrap gap-2">
              {meta.grammarSummary.map((g, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-sm bg-surface-container-low border border-on-surface/10 font-serif text-sm font-semibold text-on-surface"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-outline leading-relaxed max-w-2xl">
            Full 6-skill N4 study packs (Lessons 26–50) will be loaded in Milestone 2. All 25 N5 lessons (Minna I) are live and ready right now.
          </p>
          <button
            type="button"
            onClick={() => setActiveLessonNumber(1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold cursor-pointer"
          >
            <span>Return to N5 Lesson 01</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : loading ? (
        <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-12 flex items-center justify-center gap-2 text-sm text-outline">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading Lesson {activeLessonNumber} study pack...</span>
        </div>
      ) : (
        <>
          {/* Challenge Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {challenges.map((ch, i) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => switchChallenge(i)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                    safeIdx === i
                      ? 'bg-secondary text-on-secondary border-secondary'
                      : 'bg-surface-container-low text-on-surface-variant border-on-surface/10 hover:bg-surface-container'
                  }`}
                >
                  {ch.code}
                </button>
              ))}
            </div>
            <span className="text-xs font-mono text-outline">
              Venue: {challenge.venue}
            </span>
          </div>

          {/* Main 12-Column Interactive Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Syntactic Assembly & Acoustic Shadowing & Multiple Choice Drills */}
            <div className="lg:col-span-8 space-y-5">
              {/* Prompt & Slots Card */}
              <div className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-6 space-y-5">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold">
                    {challenge.category}
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-on-surface mt-1">
                    {challenge.promptTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                    {challenge.promptDesc}
                  </p>
                </div>

                {/* Syntactic Assembly Track */}
                <div className="p-4 sm:p-5 rounded-md bg-surface-container-low border border-on-surface/10 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-outline">
                    <span>Syntactic Assembly Track</span>
                    <span>Click tiles below to populate slots (auto-saved)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {challenge.slots.map((slot, idx) => {
                      const tile = placedTiles[idx];
                      const isExpected = tile && tile.word === slot.expectedWord;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => tile && handleRemoveSlot(idx)}
                          className={`min-h-[76px] p-2.5 rounded-md border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                            tile
                              ? checkState === 'correct'
                                ? 'bg-tertiary-fixed/35 border-tertiary text-on-surface'
                                : checkState === 'incorrect' && !isExpected
                                  ? 'bg-error-container/50 border-error text-on-error-container'
                                  : 'bg-surface-container-lowest border-primary/60 text-on-surface'
                              : 'bg-surface/70 border-dashed border-outline-variant text-outline'
                          }`}
                        >
                          <span className="text-[9.5px] font-mono uppercase tracking-wider text-outline mb-1">
                            {slot.role}
                          </span>
                          {tile ? (
                            <>
                              <span className="font-serif text-lg font-bold leading-tight">
                                {tile.word}
                              </span>
                              <span className="text-[10px] text-outline mt-0.5">
                                {tile.kana}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-mono opacity-60">[ empty ]</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Word Bank */}
                  <div className="pt-3 border-t border-on-surface/10">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-outline mb-2">
                      Lexical &amp; Particle Tile Bank
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {challenge.tiles.map((tile) => {
                        const isUsed = placedTiles.some((p) => p?.id === tile.id);
                        return (
                          <button
                            key={tile.id}
                            type="button"
                            onClick={() => handleTileClick(tile)}
                            className={`px-3 py-2 rounded-md border text-left transition-all cursor-pointer ${
                              isUsed
                                ? 'bg-surface-container border-on-surface/10 opacity-45'
                                : tile.accent === 'primary'
                                  ? 'bg-primary-fixed/30 border-primary/35 hover:bg-primary-fixed/60'
                                  : tile.accent === 'secondary'
                                    ? 'bg-secondary-fixed/35 border-secondary/35 hover:bg-secondary-fixed/60'
                                    : 'bg-surface-container-lowest border-on-surface/12 hover:border-primary/40'
                            }`}
                          >
                            <div className="font-serif text-sm font-bold text-on-surface">
                              {tile.word}
                            </div>
                            <div className="text-[10px] text-outline">
                              {tile.kana} · {tile.role}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Bar & Result Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-surface-container-low border border-on-surface/10 hover:bg-surface-container text-xs font-semibold text-on-surface-variant cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAutoAssemble}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-surface-container-low border border-on-surface/10 hover:bg-surface-container text-xs font-semibold text-secondary cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Reveal Solution</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheck}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Check &amp; Synthesize</span>
                  </button>
                </div>

                {checkState !== 'idle' && (
                  <div
                    className={`p-4 rounded-md border text-xs space-y-1 ${
                      checkState === 'correct'
                        ? 'bg-tertiary-fixed/30 border-tertiary/35 text-on-surface'
                        : 'bg-error-container/40 border-error/35 text-on-error-container'
                    }`}
                  >
                    <div className="font-bold">
                      {checkState === 'correct'
                        ? '✓ Verified: Syntactic Alignment & Politeness Register Match'
                        : '✕ Particle or Tense Mismatch — Inspect red slots above'}
                    </div>
                    <div className="font-serif text-base font-bold text-on-surface">
                      {challenge.fullJapanese}
                    </div>
                    <div className="text-on-surface-variant">{challenge.literalTranslation}</div>
                  </div>
                )}
              </div>

              {/* Acoustic Shadowing Pitch Trace */}
              <div className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-on-surface">
                      Acoustic Shadowing &amp; Pitch Contour
                    </h3>
                    <p className="text-xs text-outline">
                      Listen to native mora rhythm and shadow aloud at normal or slow cadence
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {[0.8, 1.0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setShadowSpeed(rate)}
                        className={`px-2.5 py-1 rounded-sm text-xs font-mono font-semibold cursor-pointer tabular-nums border ${
                          shadowSpeed === rate
                            ? 'bg-secondary text-on-secondary border-secondary'
                            : 'bg-surface-container-low text-on-surface-variant border-on-surface/10'
                        }`}
                      >
                        {rate.toFixed(1)}×
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => speakJapanese(challenge.fullJapanese, shadowSpeed)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Play Native</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-md bg-surface-container-low border border-on-surface/10">
                  <svg viewBox="0 0 600 90" className="w-full h-20">
                    <line x1="20" y1="62" x2="580" y2="62" stroke="#e3beb9" strokeDasharray="4 4" />
                    <path
                      d="M 30 62 L 105 26 L 210 26 L 285 52 L 385 26 L 470 26 L 560 66"
                      fill="none"
                      stroke="#ae1d14"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {[30, 105, 210, 285, 385, 470, 560].map((cx, i) => {
                      const cy = [62, 26, 26, 52, 26, 26, 66][i];
                      return <circle key={cx} cx={cx} cy={cy} r="5" fill="#ae1d14" />;
                    })}
                  </svg>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs font-serif text-on-surface-variant">
                    {challenge.pitchMoras.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-xs bg-surface-container-lowest border border-on-surface/10"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lesson Practice Drills (Multiple-Choice Check) */}
              {pack && pack.exercises.drills.length > 0 && (
                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-secondary font-bold">
                      Lesson {meta.lessonNumber} Checkpoint · 練習問題
                    </span>
                    <h3 className="font-serif text-lg font-bold text-on-surface mt-0.5">
                      Quick Grammar &amp; Particle Drills ({pack.exercises.drills.length})
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {pack.exercises.drills.map((q, qi) => {
                      const picked = drillAnswers[q.id];
                      const answered = typeof picked === 'number';
                      const isRight = picked === q.correctIdx;

                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-md bg-surface-container-low border border-on-surface/10 space-y-3"
                        >
                          <div className="text-xs font-mono text-outline">
                            Drill {qi + 1} of {pack.exercises.drills.length}
                          </div>
                          <div className="font-serif text-base font-bold text-on-surface">
                            {q.prompt}
                          </div>
                          <div className="text-xs text-on-surface-variant">{q.en}</div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {q.options.map((opt, oi) => {
                              const isPicked = picked === oi;
                              return (
                                <button
                                  key={oi}
                                  type="button"
                                  onClick={() =>
                                    setDrillAnswers((prev) => ({ ...prev, [q.id]: oi }))
                                  }
                                  className={`p-2.5 rounded-md border text-left text-xs font-serif font-semibold cursor-pointer transition-colors ${
                                    isPicked
                                      ? oi === q.correctIdx
                                        ? 'bg-tertiary-fixed/45 border-tertiary text-tertiary'
                                        : 'bg-error-container/50 border-error text-on-error-container'
                                      : 'bg-surface-container-lowest border-on-surface/10 hover:border-primary/40'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {answered && (
                            <div
                              className={`p-3 rounded-sm text-xs flex items-start gap-2 ${
                                isRight
                                  ? 'bg-tertiary-fixed/35 text-on-surface'
                                  : 'bg-error-container/40 text-on-error-container'
                              }`}
                            >
                              {isRight ? (
                                <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                              )}
                              <span>{q.explanation}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Lesson Summary & Grammar Context */}
            <aside className="lg:col-span-4 space-y-5">
              <div className="bg-surface-container-lowest rounded-lg border border-on-surface/12 overflow-hidden">
                <div className="relative h-40 w-full bg-surface-container">
                  <Image
                    src="/images/tokyo_university_seminar.jpg"
                    alt="Tokyo Academic Seminar"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-secondary font-semibold">
                    {meta.topicTag}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-on-surface">
                    {meta.titleVi}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {meta.grammarSummary.map((g, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-serif px-2 py-0.5 rounded-xs bg-surface-container-low border border-on-surface/10 text-on-surface"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {pack && pack.grammar[0] && (
                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-5 space-y-3">
                  <h3 className="font-serif text-base font-bold text-on-surface">
                    Key Pattern Highlight
                  </h3>
                  <div className="p-3 rounded-md bg-primary-fixed/20 border border-primary/20 text-xs space-y-1">
                    <div className="font-semibold text-primary">
                      {pack.grammar[0].patternFormula}
                    </div>
                    <p className="text-on-surface-variant leading-relaxed">
                      {pack.grammar[0].summaryVi}
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-surface-container-low border border-on-surface/10 text-xs text-on-surface-variant">
                    <strong className="text-on-surface">Mnemonic:</strong> {pack.grammar[0].mnemonic}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setRoute('ai-sensei-tutor')}
                className="w-full py-2.5 rounded-md bg-secondary text-on-secondary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Practice Lesson {meta.lessonNumber} with AI Sensei</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
