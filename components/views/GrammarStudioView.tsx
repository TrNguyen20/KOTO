'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Volume2,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  Send,
  AlertTriangle,
  Columns2,
  Loader2,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { GRAMMAR_PATTERNS } from '@/lib/koto-data';
import { RubyText } from '@/components/RubyText';
import { useMinnaLesson } from '@/hooks/use-minna-lesson';
import { LessonSwitcherBar } from '@/components/LessonSwitcherBar';

type GrammarScope = 'minna' | 'core';

export function GrammarStudioView() {
  const {
    activeLessonNumber,
    selectedGrammarId,
    openGrammar,
    speakJapanese,
  } = useKoto();

  const { meta, pack, loading } = useMinnaLesson(activeLessonNumber);

  const [scope, setScope] = useState<GrammarScope>('minna');
  const [minnaGrammarIdx, setMinnaGrammarIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [sideBySide, setSideBySide] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [tutorLoading, setTutorLoading] = useState(false);

  const minnaPatterns = pack?.grammar ?? [];
  const safeMinnaIdx = Math.min(minnaGrammarIdx, Math.max(0, minnaPatterns.length - 1));
  const minnaPattern = minnaPatterns[safeMinnaIdx] ?? null;

  const filteredPatterns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GRAMMAR_PATTERNS.filter(
      (g) =>
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.shortLabel.toLowerCase().includes(q) ||
        g.thesis.toLowerCase().includes(q)
    );
  }, [search]);

  const pattern =
    GRAMMAR_PATTERNS.find((g) => g.id === selectedGrammarId) ?? GRAMMAR_PATTERNS[0];

  const activeTopicTitle =
    scope === 'minna' && minnaPattern ? minnaPattern.title : pattern.title;
  const activeJlptTag = scope === 'minna' ? meta.jlpt : pattern.jlpt;

  const submitTutorQuestion = async () => {
    if (!tutorQuestion.trim() || tutorLoading) return;
    setTutorLoading(true);
    setTutorError(null);
    try {
      const res = await fetch('/api/sensei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grammar_ask',
          jlptLevel: activeJlptTag,
          message: `Pattern: ${activeTopicTitle}. Question: ${tutorQuestion.trim()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTutorError(data.error || 'Unable to reach AI Sensei right now.');
      } else {
        setTutorResponse(data.answer);
      }
    } catch {
      setTutorError('Network error communicating with /api/sensei.');
    } finally {
      setTutorLoading(false);
    }
  };

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitTutorQuestion();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Scope/Comparison Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
            文法スタジオ · Syntactic Blueprint &amp; Disambiguation
          </div>
          <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
            Grammar Studio
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex gap-1 p-1 rounded-md bg-surface-container border border-on-surface/10">
            <button
              type="button"
              onClick={() => setScope('minna')}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer border whitespace-nowrap ${
                scope === 'minna'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'text-on-surface-variant border-transparent'
              }`}
            >
              Minna Lesson (L01–25)
            </button>
            <button
              type="button"
              onClick={() => setScope('core')}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer border whitespace-nowrap ${
                scope === 'core'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'text-on-surface-variant border-transparent'
              }`}
            >
              Core Blueprints
            </button>
          </div>

          {scope === 'core' && (
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pattern..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface-container-lowest border border-outline-variant/30 text-xs outline-none focus:border-primary"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => setSideBySide((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer transition-colors ${
              sideBySide
                ? 'bg-secondary text-on-secondary border-secondary'
                : 'bg-surface-container-lowest text-on-surface border-outline-variant/30'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Minna Lesson Mode */}
      {scope === 'minna' ? (
        <div className="space-y-5">
          <LessonSwitcherBar showSkillLinks showCompleteToggle={false} />

          {meta.status === 'coming-soon' ? (
            <div className="bg-surface-container-lowest rounded-lg border border-secondary/30 p-8 text-center space-y-2">
              <div className="text-xs font-mono uppercase text-secondary font-bold">
                Milestone 2 N4 Syllabus
              </div>
              <p className="text-sm text-on-surface-variant">
                Full grammar packs for Lesson {meta.lessonNumber} ({meta.titleJp}) are queued for Milestone 2. Target formulas: {meta.grammarSummary.join(' · ')}.
              </p>
            </div>
          ) : loading ? (
            <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-12 flex items-center justify-center gap-2 text-sm text-outline">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading Lesson {activeLessonNumber} grammar...</span>
            </div>
          ) : minnaPattern ? (
            <>
              <div className="flex flex-wrap gap-2">
                {minnaPatterns.map((mp, idx) => (
                  <button
                    key={mp.id}
                    type="button"
                    onClick={() => {
                      setMinnaGrammarIdx(idx);
                      setTutorResponse(null);
                      setTutorError(null);
                    }}
                    className={`px-4 py-2 rounded-md border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                      safeMinnaIdx === idx
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container-lowest text-on-surface border-on-surface/10 hover:border-primary/40'
                    }`}
                  >
                    <span className="font-serif text-sm">{mp.shortLabel}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      L{String(meta.lessonNumber).padStart(2, '0')}.{idx + 1}
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-5">
                  <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-5">
                    <div>
                      <div className="text-xs font-mono text-primary font-semibold">
                        JLPT {meta.jlpt} · LESSON {String(meta.lessonNumber).padStart(2, '0')} · {minnaPattern.patternFormula}
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface mt-1">
                        {minnaPattern.title}
                      </h2>
                    </div>

                    <div className="space-y-1.5 text-sm leading-relaxed">
                      <p className="text-on-surface">{minnaPattern.summaryEn}</p>
                      <p className="text-on-surface-variant text-xs">{minnaPattern.summaryVi}</p>
                    </div>

                    <div
                      className={`grid gap-4 ${
                        sideBySide ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                      }`}
                    >
                      <div className="p-4 rounded-md bg-primary-fixed/20 border border-primary/25 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                          <span className="text-primary font-bold">{minnaPattern.ruleAlpha.tag}</span>
                          <span className="text-outline">{minnaPattern.ruleAlpha.jpLabel}</span>
                        </div>
                        <div className="font-serif text-base font-bold text-on-surface">
                          {minnaPattern.ruleAlpha.lhs}{' '}
                          <span className="text-primary mx-1">{minnaPattern.ruleAlpha.particle}</span>{' '}
                          {minnaPattern.ruleAlpha.rhs}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {minnaPattern.ruleAlpha.examples}
                        </div>
                      </div>

                      <div className="p-4 rounded-md bg-secondary-fixed/25 border border-secondary/25 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                          <span className="text-secondary font-bold">{minnaPattern.ruleBeta.tag}</span>
                          <span className="text-outline">{minnaPattern.ruleBeta.jpLabel}</span>
                        </div>
                        <div className="font-serif text-base font-bold text-on-surface">
                          {minnaPattern.ruleBeta.lhs}{' '}
                          <span className="text-secondary mx-1">{minnaPattern.ruleBeta.particle}</span>{' '}
                          {minnaPattern.ruleBeta.rhs}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {minnaPattern.ruleBeta.examples}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-md bg-surface-container-low border border-outline-variant/15 text-xs text-on-surface font-medium">
                      Mnemonic: {minnaPattern.mnemonic}
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4">
                    <h3 className="font-serif text-lg font-bold text-on-surface">
                      Annotated Pattern Examples
                    </h3>
                    <div className="space-y-3">
                      {minnaPattern.examples.map((ex, ei) => (
                        <div
                          key={ei}
                          className="p-4 rounded-md bg-surface-container-low border border-outline-variant/15 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="font-serif text-lg font-bold text-on-surface">
                              <RubyText segments={ex.segments} />
                            </div>
                            <div className="text-xs font-mono text-outline romaji-sub">
                              {ex.romaji}
                            </div>
                            <div className="text-xs text-on-surface-variant">
                              {ex.en} · {ex.vi}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => speakJapanese(ex.plainText, 1.0, ex.audioUrl)}
                            className="p-2.5 rounded-md bg-surface-container-lowest border border-on-surface/10 text-secondary hover:text-primary cursor-pointer shrink-0"
                            aria-label="Play example sentence"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quiz */}
                  {minnaPattern.quiz.length > 0 && (
                    <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                        Pattern Check
                      </span>
                      {minnaPattern.quiz.map((q) => {
                        const chosen = selectedAnswers[q.id];
                        const isCorrect = chosen === q.correctKey;
                        return (
                          <div
                            key={q.id}
                            className="p-4 rounded-md bg-surface-container-low border border-outline-variant/20 space-y-3"
                          >
                            <div className="font-serif text-lg font-bold text-on-surface">
                              {q.promptBefore}
                              {q.promptAfter}
                            </div>
                            <div className="text-xs text-on-surface-variant">{q.en}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt) => {
                                const isPicked = chosen === opt.key;
                                return (
                                  <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() =>
                                      setSelectedAnswers((prev) => ({
                                        ...prev,
                                        [q.id]: opt.key,
                                      }))
                                    }
                                    className={`p-2.5 rounded-md border text-left transition-colors cursor-pointer ${
                                      isPicked
                                        ? opt.key === q.correctKey
                                          ? 'bg-tertiary-fixed/50 border-tertiary'
                                          : 'bg-error-container/50 border-error'
                                        : 'bg-surface-container-lowest border-on-surface/10 hover:border-primary/40'
                                    }`}
                                  >
                                    <div className="font-serif text-sm font-bold text-on-surface">
                                      {opt.label}
                                    </div>
                                    <div className="text-[10px] text-outline">{opt.sub}</div>
                                  </button>
                                );
                              })}
                            </div>
                            {chosen && (
                              <div
                                className={`p-3 rounded-sm text-xs flex items-start gap-2 ${
                                  isCorrect
                                    ? 'bg-tertiary-fixed/35 text-on-surface'
                                    : 'bg-error-container/40 text-on-error-container'
                                }`}
                              >
                                {isCorrect ? (
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
                  )}
                </div>

                {/* Right 4 Cols: Common Trap + AI Sensei */}
                <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
                  <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-error">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Common Learner Trap</span>
                    </div>
                    <div className="p-3 rounded-md bg-error-container/30 border border-error/20">
                      <div className="font-serif text-sm font-bold text-on-error-container line-through">
                        ✕ {minnaPattern.trap.wrong}
                      </div>
                    </div>
                    <div className="p-3 rounded-md bg-tertiary-fixed/30 border border-tertiary/20 space-y-1">
                      <div className="font-serif text-sm font-bold text-tertiary">
                        ✓ {minnaPattern.trap.right}
                      </div>
                      <p className="text-[11px] text-on-surface-variant pt-1">
                        {minnaPattern.trap.note}
                      </p>
                    </div>
                  </div>

                  {/* AI Sensei Morpho-Tutor */}
                  <div className="bg-surface-container-lowest rounded-lg border border-primary/30 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Sensei Morpho-Tutor</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-primary-fixed text-primary">
                        GEMINI
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Ask a question about <strong className="font-serif">{minnaPattern.shortLabel}</strong>.
                    </p>
                    <form onSubmit={handleAskTutor} className="space-y-2">
                      <textarea
                        rows={2}
                        value={tutorQuestion}
                        onChange={(e) => setTutorQuestion(e.target.value)}
                        placeholder={`Ask about ${minnaPattern.shortLabel}...`}
                        className="w-full p-2.5 rounded-md bg-surface-container-low border border-outline-variant/30 text-xs outline-none focus:border-primary resize-none"
                      />
                      <button
                        type="submit"
                        disabled={tutorLoading || !tutorQuestion.trim()}
                        className="w-full py-2 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {tutorLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Consulting Sensei...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Ask Sensei</span>
                          </>
                        )}
                      </button>
                    </form>
                    {tutorError && (
                      <div className="p-3 rounded-md bg-error-container/40 border border-error/30 text-xs text-on-error-container space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span>{tutorError}</span>
                          <button
                            type="button"
                            onClick={submitTutorQuestion}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-xs bg-surface-container-lowest border border-error/40 text-on-surface font-semibold shrink-0 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        </div>
                        <div className="p-2.5 rounded-xs bg-surface-container-lowest border border-on-surface/10 text-on-surface text-[11px]">
                          <strong>Static Reference:</strong> {minnaPattern.mnemonic}
                        </div>
                      </div>
                    )}
                    {tutorResponse && (
                      <div className="p-3.5 rounded-md bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface leading-relaxed whitespace-pre-line">
                        {tutorResponse}
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <>
          {/* Original Core Disambiguation Blueprints */}
          <div className="flex flex-wrap gap-2">
            {filteredPatterns.map((p) => {
              const active = p.id === pattern.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    openGrammar(p.id);
                    setTutorResponse(null);
                    setTutorError(null);
                  }}
                  className={`px-4 py-2 rounded-md border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                    active
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-lowest text-on-surface border-on-surface/10 hover:border-primary/40'
                  }`}
                >
                  <span className="font-serif text-sm">{p.shortLabel}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs tabular-nums ${
                      active ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-outline'
                    }`}
                  >
                    {p.retention}%
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono text-primary font-semibold">
                      {pattern.jlpt} · {pattern.category}
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface mt-1">
                      {pattern.title}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-md bg-tertiary-fixed/50 text-tertiary font-mono text-xs font-bold tabular-nums">
                    Retention: {pattern.retention}%
                  </span>
                </div>

                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {pattern.thesis}
                </p>

                <div
                  className={`grid gap-4 ${
                    sideBySide ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  <div className="p-4 rounded-md bg-primary-fixed/20 border border-primary/25 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                      <span className="text-primary font-bold">{pattern.ruleAlpha.tag}</span>
                      <span className="text-outline">{pattern.ruleAlpha.jpLabel}</span>
                    </div>
                    <div className="font-serif text-base font-bold text-on-surface">
                      {pattern.ruleAlpha.lhs}{' '}
                      <span className="text-primary mx-1">{pattern.ruleAlpha.particle}</span>{' '}
                      {pattern.ruleAlpha.rhs}
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {pattern.ruleAlpha.examples}
                    </div>
                  </div>

                  <div className="p-4 rounded-md bg-secondary-fixed/25 border border-secondary/25 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                      <span className="text-secondary font-bold">{pattern.ruleBeta.tag}</span>
                      <span className="text-outline">{pattern.ruleBeta.jpLabel}</span>
                    </div>
                    <div className="font-serif text-base font-bold text-on-surface">
                      {pattern.ruleBeta.lhs}{' '}
                      <span className="text-secondary mx-1">{pattern.ruleBeta.particle}</span>{' '}
                      {pattern.ruleBeta.rhs}
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {pattern.ruleBeta.examples}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-md bg-surface-container-low border border-outline-variant/15 space-y-2 text-xs leading-relaxed">
                  <div>
                    <span className="font-serif font-bold text-primary text-sm mr-1">
                      {pattern.cognitiveDeepDive.primaryTerm}
                    </span>
                    <span className="text-on-surface-variant">
                      {pattern.cognitiveDeepDive.primaryDesc}
                    </span>
                  </div>
                  <div>
                    <span className="font-serif font-bold text-secondary text-sm mr-1">
                      {pattern.cognitiveDeepDive.secondaryTerm}
                    </span>
                    <span className="text-on-surface-variant">
                      {pattern.cognitiveDeepDive.secondaryDesc}
                    </span>
                  </div>
                  <div className="pt-1 text-on-surface font-medium">
                    Mnemonic: {pattern.cognitiveDeepDive.mnemonic}
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4">
                <h3 className="font-serif text-lg font-bold text-on-surface">
                  Curated Native Audio Examples
                </h3>
                <div className="space-y-3">
                  {pattern.audioExamples.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-4 rounded-md bg-surface-container-low border border-outline-variant/15 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-xs font-bold ${
                              ex.accent === 'primary'
                                ? 'bg-primary-fixed text-primary'
                                : 'bg-secondary-fixed text-secondary'
                            }`}
                          >
                            {ex.badge}
                          </span>
                          <span className="text-outline">{ex.context}</span>
                        </div>
                        <div className="font-serif text-lg font-bold text-on-surface pt-1">
                          <RubyText
                            segments={ex.segments}
                            highlightParticle={ex.highlightParticle}
                          />
                        </div>
                        <div className="text-xs font-mono text-outline romaji-sub">{ex.romaji}</div>
                        <div className="text-xs text-on-surface-variant">{ex.en}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakJapanese(ex.plainText)}
                        className="p-2.5 rounded-md bg-surface-container-lowest border border-on-surface/10 text-secondary hover:text-primary cursor-pointer shrink-0"
                        aria-label="Play example sentence"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-3">
                <h3 className="font-serif text-lg font-bold text-on-surface">
                  Syntactic Comparison Matrix
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-on-surface/10 text-[10px] font-mono uppercase text-outline">
                        <th className="py-2 pr-3">Marker</th>
                        <th className="py-2 pr-3">Core Role</th>
                        <th className="py-2 pr-3">Anchor Verbs</th>
                        <th className="py-2">Cognitive Focus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/15">
                      {pattern.comparisonMatrix.map((row) => (
                        <tr key={row.pattern}>
                          <td
                            className={`py-2.5 pr-3 font-serif font-bold text-sm ${
                              row.accent === 'primary'
                                ? 'text-primary'
                                : row.accent === 'secondary'
                                  ? 'text-secondary'
                                  : 'text-on-surface'
                            }`}
                          >
                            {row.pattern}
                          </td>
                          <td className="py-2.5 pr-3 font-semibold text-on-surface">
                            {row.role}
                          </td>
                          <td className="py-2.5 pr-3 font-serif text-on-surface-variant">
                            {row.verbs}
                          </td>
                          <td className="py-2.5 text-on-surface-variant">{row.focus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    Active Diagnostic Check
                  </span>
                  <h3 className="font-serif text-lg font-bold text-on-surface mt-0.5">
                    Verify Syntactic Precision
                  </h3>
                </div>

                <div className="space-y-5">
                  {pattern.quizQuestions.map((q, idx) => {
                    const chosen = selectedAnswers[q.id];
                    const isCorrect = chosen === q.correctKey;
                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-md bg-surface-container-low border border-outline-variant/20 space-y-3"
                      >
                        <div className="text-xs font-mono text-outline">
                          Question {idx + 1} of {pattern.quizQuestions.length}
                        </div>
                        <div className="font-serif text-lg font-bold text-on-surface">
                          {q.promptBefore}
                          <span className="text-primary underline mx-1">
                            {chosen
                              ? q.options.find((o) => o.key === chosen)?.label.split(' ')[0]
                              : '　'}
                          </span>
                          {q.promptAfter}
                        </div>
                        <div className="text-xs text-on-surface-variant">{q.en}</div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {q.options.map((opt) => {
                            const isPicked = chosen === opt.key;
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() =>
                                  setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.key }))
                                }
                                className={`p-2.5 rounded-md border text-left transition-colors cursor-pointer ${
                                  isPicked
                                    ? opt.key === q.correctKey
                                      ? 'bg-tertiary-fixed/50 border-tertiary'
                                      : 'bg-error-container/50 border-error'
                                    : 'bg-surface-container-lowest border-on-surface/10 hover:border-primary/40'
                                }`}
                              >
                                <div className="font-serif text-sm font-bold text-on-surface">
                                  {opt.label}
                                </div>
                                <div className="text-[10px] text-outline">{opt.sub}</div>
                              </button>
                            );
                          })}
                        </div>

                        {chosen && (
                          <div
                            className={`p-3 rounded-md text-xs flex items-start gap-2 ${
                              isCorrect
                                ? 'bg-tertiary-fixed/35 text-on-surface'
                                : 'bg-error-container/40 text-on-error-container'
                            }`}
                          >
                            {isCorrect ? (
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
            </div>

            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-error">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Common Learner Trap</span>
                </div>
                <div className="p-3 rounded-md bg-error-container/30 border border-error/20 space-y-1">
                  <div className="font-serif text-sm font-bold text-on-error-container line-through">
                    ✕ {pattern.trap.wrongSentence}
                  </div>
                  <p className="text-[11px] text-on-error-container/90">
                    {pattern.trap.wrongExplanation}
                  </p>
                </div>
                <div className="p-3 rounded-md bg-tertiary-fixed/30 border border-tertiary/20 space-y-1">
                  <div className="font-serif text-sm font-bold text-tertiary">
                    ✓ {pattern.trap.rightLine1}
                  </div>
                  <div className="font-serif text-sm font-bold text-tertiary">
                    ✓ {pattern.trap.rightLine2}
                  </div>
                  <p className="text-[11px] text-on-surface-variant pt-1">
                    {pattern.trap.rightExplanation}
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 overflow-hidden">
                <div className="relative h-36 w-full bg-surface-container">
                  <Image
                    src="/images/tokyo_calligraphy_inkstone.jpg"
                    alt="Traditional Japanese calligraphy inkstone"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-outline">
                    Historical Etymology Note
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {pattern.etymologyNote}
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-lg border border-primary/30 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Sensei Morpho-Tutor</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-primary-fixed text-primary">
                    GEMINI
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Ask a nuanced question about <strong className="font-serif">{pattern.title}</strong> or test your own example sentence.
                </p>
                <form onSubmit={handleAskTutor} className="space-y-2">
                  <textarea
                    rows={2}
                    value={tutorQuestion}
                    onChange={(e) => setTutorQuestion(e.target.value)}
                    placeholder="e.g. Why does 電車を降りる use を while 新宿駅で uses で?"
                    className="w-full p-2.5 rounded-md bg-surface-container-low border border-outline-variant/30 text-xs outline-none focus:border-primary resize-none"
                  />
                  <button
                    type="submit"
                    disabled={tutorLoading || !tutorQuestion.trim()}
                    className="w-full py-2 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {tutorLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Consulting Sensei...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Ask Sensei</span>
                      </>
                    )}
                  </button>
                </form>

                {tutorError && (
                  <div className="p-3.5 rounded-md bg-error-container/40 border border-error/30 text-xs text-on-error-container space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium leading-relaxed">{tutorError}</span>
                      <button
                        type="button"
                        onClick={submitTutorQuestion}
                        disabled={tutorLoading || !tutorQuestion.trim()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-surface-container-lowest border border-error/40 text-on-surface font-semibold hover:border-primary shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry (再試行)</span>
                      </button>
                    </div>
                    <div className="p-3 rounded-sm bg-surface-container-lowest border border-on-surface/10 text-on-surface space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>教科書解説 · Static Textbook Reference</span>
                      </div>
                      <div className="text-[11px] font-semibold">
                        {pattern.ruleAlpha.tag}: {pattern.ruleAlpha.lhs}{' '}
                        <span className="text-primary">{pattern.ruleAlpha.particle}</span>{' '}
                        {pattern.ruleAlpha.rhs}
                      </div>
                      <div className="text-[11px] font-semibold">
                        {pattern.ruleBeta.tag}: {pattern.ruleBeta.lhs}{' '}
                        <span className="text-secondary">{pattern.ruleBeta.particle}</span>{' '}
                        {pattern.ruleBeta.rhs}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        {pattern.cognitiveDeepDive.mnemonic}
                      </div>
                    </div>
                  </div>
                )}
                {tutorResponse && (
                  <div className="p-3.5 rounded-md bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface leading-relaxed whitespace-pre-line">
                    {tutorResponse}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
