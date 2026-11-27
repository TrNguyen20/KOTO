'use client';

import React, { useMemo, useState } from 'react';
import {
  Volume2,
  Search,
  ArrowUpRight,
  GitBranch,
  Layers,
  Headphones,
  Sparkles,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { JlptLevel, VOCAB_ITEMS } from '@/lib/koto-data';
import { RubyText } from '@/components/RubyText';
import { useMinnaLesson } from '@/hooks/use-minna-lesson';
import { LessonSwitcherBar } from '@/components/LessonSwitcherBar';

type VocabScope = 'minna' | 'core';
type VocabMode = 'inspector' | 'srs' | 'audio' | 'graph';
const TOPICS = ['All Topics', 'Dining & Food', 'Transit', 'Daily Life', 'Keigo'] as const;

export function VocabularyLabView() {
  const {
    activeLessonNumber,
    selectedVocabId,
    openVocab,
    openKanji,
    openGrammar,
    speakJapanese,
    addSrsCard,
    queueLessonVocabToSrs,
    showToast,
  } = useKoto();

  const { meta, pack, loading } = useMinnaLesson(activeLessonNumber);

  const [scope, setScope] = useState<VocabScope>('minna');
  const [selectedMinnaVocabId, setSelectedMinnaVocabId] = useState<string>('');
  const [jlptFilter, setJlptFilter] = useState<'ALL' | JlptLevel>('ALL');
  const [topicFilter, setTopicFilter] = useState<(typeof TOPICS)[number]>('All Topics');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<VocabMode>('inspector');
  const [audioQuizAnswer, setAudioQuizAnswer] = useState<string | null>(null);

  const filteredMinnaVocab = useMemo(() => {
    const list = pack?.vocab ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.reading.toLowerCase().includes(q) ||
        v.romaji.toLowerCase().includes(q) ||
        v.meaningEn.toLowerCase().includes(q) ||
        v.meaningVi.toLowerCase().includes(q)
    );
  }, [pack, search]);

  const activeMinnaWord =
    filteredMinnaVocab.find((v) => v.id === selectedMinnaVocabId) ??
    filteredMinnaVocab[0] ??
    null;

  const filteredDeck = useMemo(() => {
    const q = search.trim().toLowerCase();
    return VOCAB_ITEMS.filter((v) => {
      if (jlptFilter !== 'ALL' && v.jlpt !== jlptFilter) return false;
      if (topicFilter !== 'All Topics' && v.topic !== topicFilter) return false;
      if (
        q &&
        !v.word.toLowerCase().includes(q) &&
        !v.reading.toLowerCase().includes(q) &&
        !v.romaji.toLowerCase().includes(q) &&
        !v.meaningEn.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [jlptFilter, topicFilter, search]);

  const activeItem =
    VOCAB_ITEMS.find((v) => v.id === selectedVocabId) ?? filteredDeck[0] ?? VOCAB_ITEMS[0];

  return (
    <div className="space-y-6">
      {/* Header & Scope/Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
            Lexical Graph &amp; Semantic Roots · 語彙エンジン
          </div>
          <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
            Vocabulary Intelligence Studio
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
              Core Lexical Graph
            </button>
          </div>

          {scope === 'core' && (
            <div className="flex flex-wrap gap-1 p-1 rounded-md bg-surface-container border border-on-surface/10">
              {[
                { id: 'inspector' as const, label: 'Inspector' },
                { id: 'srs' as const, label: 'SRS Matrix' },
                { id: 'audio' as const, label: 'Audio Recall' },
                { id: 'graph' as const, label: 'Family Graph' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`px-2.5 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer border ${
                    mode === m.id
                      ? 'bg-surface-container-lowest text-primary border-on-surface/15'
                      : 'text-on-surface-variant hover:text-on-surface border-transparent'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Minna Lesson Vocabulary Mode */}
      {scope === 'minna' ? (
        <div className="space-y-5">
          <LessonSwitcherBar showSkillLinks showCompleteToggle={false} />

          {/* Search & Bulk Queue Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-lg border border-on-surface/10">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Filter Lesson ${meta.lessonNumber} words, EN or VI...`}
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface-container-low border border-on-surface/10 text-xs outline-none focus:border-primary"
              />
            </div>

            {pack && (
              <button
                type="button"
                onClick={() => queueLessonVocabToSrs(meta.lessonNumber, pack.vocab)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Queue Lesson {meta.lessonNumber} Vocab to SRS ({pack.vocab.length})</span>
              </button>
            )}
          </div>

          {meta.status === 'coming-soon' ? (
            <div className="bg-surface-container-lowest rounded-lg border border-secondary/30 p-8 text-center space-y-2">
              <div className="text-xs font-mono uppercase text-secondary font-bold">
                Milestone 2 N4 Syllabus
              </div>
              <p className="text-sm text-on-surface-variant">
                Full N4 vocabulary packs for Lesson {meta.lessonNumber} ({meta.titleJp}) are queued for Milestone 2. Switch to N5 Lessons 01–25 above to study live vocabulary packs.
              </p>
            </div>
          ) : loading ? (
            <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-12 flex items-center justify-center gap-2 text-sm text-outline">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading Lesson {activeLessonNumber} vocabulary...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 4 Cols: Lesson Deck */}
              <div className="lg:col-span-4 bg-surface-container-lowest rounded-lg border border-on-surface/10 p-3 space-y-2">
                <div className="px-2 py-1 flex items-center justify-between text-[11px] font-mono text-outline uppercase">
                  <span>Lesson {String(meta.lessonNumber).padStart(2, '0')} Deck</span>
                  <span className="tabular-nums">{filteredMinnaVocab.length} Words</span>
                </div>
                <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                  {filteredMinnaVocab.map((v) => {
                    const selected = activeMinnaWord?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedMinnaVocabId(v.id)}
                        className={`w-full p-3 rounded-md border text-left transition-all cursor-pointer ${
                          selected
                            ? 'bg-primary-fixed/25 border-primary/50'
                            : 'bg-surface-container-low/70 border-outline-variant/15 hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-serif text-base font-bold text-on-surface">
                            {v.word}
                          </span>
                          <span className="text-[10px] font-mono text-outline">{v.pos}</span>
                        </div>
                        <div className="text-xs text-outline mt-0.5">
                          {v.reading} · {v.romaji}
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1 truncate">
                          {v.meaningVi}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 8 Cols: Selected Minna Word Inspector */}
              <div className="lg:col-span-8 space-y-5">
                {activeMinnaWord ? (
                  <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 sm:p-7 space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-outline mb-2">
                          <span className="px-2 py-0.5 rounded-xs bg-secondary-fixed text-secondary font-bold">
                            {meta.jlpt} · L{String(meta.lessonNumber).padStart(2, '0')}
                          </span>
                          <span>{activeMinnaWord.pos}</span>
                        </div>
                        <div className="flex flex-wrap items-baseline gap-3">
                          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-on-surface">
                            {activeMinnaWord.word}
                          </h2>
                          <span className="text-lg font-serif text-on-surface-variant">
                            {activeMinnaWord.reading}
                          </span>
                          <span className="text-sm font-mono text-outline romaji-sub">
                            /{activeMinnaWord.romaji}/
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            speakJapanese(
                              activeMinnaWord.word,
                              1.0,
                              activeMinnaWord.audioUrl
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Play 1.0×</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            speakJapanese(
                              activeMinnaWord.word,
                              0.75,
                              activeMinnaWord.audioUrl
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container-low border border-on-surface/10 text-on-surface text-xs font-mono hover:bg-surface-container cursor-pointer"
                        >
                          <span>0.8×</span>
                        </button>
                      </div>
                    </div>

                    {/* Pitch Accent Strip */}
                    <div className="p-3.5 rounded-md bg-surface-container-low border border-outline-variant/15 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="font-mono font-bold px-2 py-0.5 rounded-xs bg-surface-container-lowest border border-on-surface/10 text-primary">
                          {activeMinnaWord.pitchMarker}
                        </span>
                        <span className="font-semibold text-on-surface">
                          {activeMinnaWord.pitchType}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          addSrsCard({
                            front: activeMinnaWord.word,
                            reading: activeMinnaWord.reading,
                            meaning: `${activeMinnaWord.meaningEn} · ${activeMinnaWord.meaningVi}`,
                            jlpt: meta.jlpt,
                            context: activeMinnaWord.example.romaji,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container-lowest border border-on-surface/15 text-xs font-semibold text-on-surface hover:border-primary/40 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        <span>Pin to SRS Queue</span>
                      </button>
                    </div>

                    {/* EN & VI Definitions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-md bg-surface-container-low/70 border border-outline-variant/15">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-outline mb-1">
                          English Definition
                        </div>
                        <p className="text-sm text-on-surface leading-relaxed">
                          {activeMinnaWord.meaningEn}
                        </p>
                      </div>
                      <div className="p-4 rounded-md bg-surface-container-low/70 border border-outline-variant/15">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-outline mb-1">
                          Vietnamese Gloss (Tiếng Việt)
                        </div>
                        <p className="text-sm text-on-surface leading-relaxed">
                          {activeMinnaWord.meaningVi}
                        </p>
                      </div>
                    </div>

                    {/* Contextual Sentence Example */}
                    <div className="p-4 rounded-md bg-surface-container-low border border-outline-variant/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-secondary font-bold">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Lesson {meta.lessonNumber} Contextual Sentence</span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            speakJapanese(
                              activeMinnaWord.example.segments.map((s) => s.text).join(''),
                              1.0,
                              activeMinnaWord.audioUrl
                            )
                          }
                          className="p-1.5 rounded-md bg-surface-container-lowest border border-on-surface/10 text-secondary hover:text-primary cursor-pointer"
                          aria-label="Speak example sentence"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="font-serif text-lg font-bold text-on-surface leading-relaxed">
                        <RubyText segments={activeMinnaWord.example.segments} />
                      </div>
                      <div className="text-[11px] font-mono text-outline romaji-sub">
                        {activeMinnaWord.example.romaji}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {activeMinnaWord.example.en} · {activeMinnaWord.example.vi}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-8 text-center text-xs text-outline">
                    No vocabulary matched your filter.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Original Core Lexical Graph Workspace */}
          {/* Filters Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-lg border border-on-surface/10">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['ALL', 'N5', 'N4', 'N3'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setJlptFilter(lvl)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold cursor-pointer ${
                    jlptFilter === lvl
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {lvl === 'ALL' ? 'All JLPT' : lvl}
                </button>
              ))}
              <span className="mx-1 text-outline-variant">|</span>
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopicFilter(t)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                    topicFilter === t
                      ? 'bg-secondary-fixed text-secondary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter kana, kanji, or meaning..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface-container-low border border-on-surface/10 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          {mode === 'audio' && (
            <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 max-w-2xl mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary">
                  <Headphones className="w-4 h-4" />
                  BLIND AUDIO RECALL DRILL
                </span>
                <span className="text-xs text-outline font-mono">{activeItem.jlpt} Target</span>
              </div>
              <div className="p-6 rounded-lg bg-surface-container-low text-center space-y-4">
                <p className="text-xs text-on-surface-variant">
                  Listen to the native pronunciation and identify the matching Japanese entry:
                </p>
                <button
                  type="button"
                  onClick={() => speakJapanese(activeItem.word)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Play Spoken Word</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VOCAB_ITEMS.slice(0, 4).map((opt) => {
                  const picked = audioQuizAnswer === opt.id;
                  const isCorrect = opt.id === activeItem.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAudioQuizAnswer(opt.id);
                        if (isCorrect) {
                          showToast(`Correct! ${opt.word} (${opt.reading})`);
                        }
                      }}
                      className={`p-4 rounded-md border text-left transition-colors cursor-pointer ${
                        picked
                          ? isCorrect
                            ? 'bg-tertiary-fixed/40 border-tertiary'
                            : 'bg-error-container/50 border-error'
                          : 'bg-surface-container-low border-on-surface/10 hover:border-primary/40'
                      }`}
                    >
                      <div className="font-serif text-lg font-bold text-on-surface">{opt.word}</div>
                      <div className="text-xs text-outline mt-0.5">{opt.meaningEn.split(';')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mode === 'srs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDeck.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono font-bold text-secondary">{item.jlpt}</span>
                      <span
                        className={`px-2 py-0.5 rounded-xs font-mono text-[10px] font-semibold ${
                          item.status === 'Mastered'
                            ? 'bg-tertiary-fixed text-tertiary'
                            : item.status === 'Due'
                              ? 'bg-primary-fixed text-primary'
                              : 'bg-secondary-fixed text-secondary'
                        }`}
                      >
                        {item.dueLabel}
                      </span>
                    </div>
                    <div className="font-serif text-2xl font-bold text-on-surface">{item.word}</div>
                    <div className="text-xs text-outline mt-0.5">
                      {item.reading} · {item.romaji}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">
                      {item.meaningEn}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className="h-full bg-tertiary rounded-full"
                        style={{ width: `${item.stability}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => speakJapanese(item.word)}
                        className="text-xs text-secondary font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Listen
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          openVocab(item.id);
                          setMode('inspector');
                        }}
                        className="text-xs text-primary font-semibold cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mode === 'graph' && (
            <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-on-surface">
                    Lexical &amp; Kanji Derivational Graph: {activeItem.word}
                  </h2>
                  <p className="text-xs text-outline">
                    Click any morphological root node to pivot into Kanji Intelligence Studio
                  </p>
                </div>
                <GitBranch className="w-5 h-5 text-primary" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeItem.kanjiRoots.map((root) => (
                  <button
                    key={root.char}
                    type="button"
                    onClick={() => openKanji(root.char)}
                    className="p-5 rounded-lg bg-surface-container-low border border-on-surface/10 hover:border-primary/50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-serif text-4xl font-bold text-primary">
                        {root.char}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-outline group-hover:text-primary" />
                    </div>
                    <div className="text-sm font-semibold text-on-surface">{root.meaning}</div>
                    <div className="text-xs text-outline mt-1">{root.reading}</div>
                    <div className="text-[11px] font-mono text-secondary mt-2">
                      {root.radical} · {root.strokes} strokes · {root.jlpt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'inspector' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4 bg-surface-container-lowest rounded-lg border border-on-surface/10 p-3 space-y-2">
                <div className="px-2 py-1 flex items-center justify-between text-[11px] font-mono text-outline uppercase">
                  <span>Collection Deck</span>
                  <span className="tabular-nums">{filteredDeck.length} Entries</span>
                </div>
                <div className="space-y-1.5 max-h-[680px] overflow-y-auto pr-1">
                  {filteredDeck.map((item) => {
                    const selected = item.id === activeItem.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openVocab(item.id)}
                        className={`w-full p-3.5 rounded-md border text-left transition-all cursor-pointer ${
                          selected
                            ? 'bg-primary-fixed/25 border-primary/50'
                            : 'bg-surface-container-low/70 border-outline-variant/15 hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-serif text-lg font-bold text-on-surface">
                            {item.word}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs font-semibold tabular-nums ${
                              item.status === 'Mastered'
                                ? 'bg-tertiary-fixed text-tertiary'
                                : item.status === 'Due'
                                  ? 'bg-primary-fixed text-primary'
                                  : 'bg-secondary-fixed text-secondary'
                            }`}
                          >
                            {item.dueLabel}
                          </span>
                        </div>
                        <div className="text-xs text-outline mt-0.5">
                          {item.reading} · {item.jlpt}
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1 truncate">
                          {item.meaningEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-5">
                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 sm:p-7 space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-outline mb-2">
                        <span className="px-2 py-0.5 rounded-xs bg-secondary-fixed text-secondary font-bold">
                          {activeItem.jlpt}
                        </span>
                        <span>{activeItem.pos}</span>
                        <span>·</span>
                        <span>{activeItem.topic}</span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <h2 className="font-serif text-4xl sm:text-5xl font-bold text-on-surface">
                          {activeItem.word}
                        </h2>
                        <span className="text-lg font-serif text-on-surface-variant">
                          {activeItem.reading}
                        </span>
                        <span className="text-sm font-mono text-outline romaji-sub">
                          /{activeItem.romaji}/
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xs border-2 border-primary/80 text-primary font-serif flex flex-col items-center justify-center rotate-[-5deg] bg-primary-fixed/15">
                        <span className="text-xs font-bold leading-none">習得</span>
                        <span className="text-[9px] font-mono tabular-nums mt-0.5">
                          {activeItem.stability}%
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => speakJapanese(activeItem.word, 1.0)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Play 1.0×</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => speakJapanese(activeItem.word, 0.75)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-container-low text-on-surface text-[11px] font-mono hover:bg-surface-container cursor-pointer"
                        >
                          <span>Slow 0.8×</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-md bg-surface-container-low border border-outline-variant/15 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="font-mono font-bold px-2 py-0.5 rounded-xs bg-surface-container-lowest border border-on-surface/10 text-primary">
                        {activeItem.pitchMarker}
                      </span>
                      <span className="font-semibold text-on-surface">{activeItem.pitchType}</span>
                      <span className="font-serif text-base text-primary font-bold">
                        {activeItem.pitchDisplay}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addSrsCard({
                          front: activeItem.word,
                          reading: activeItem.reading,
                          meaning: activeItem.meaningEn.split(';')[0],
                          jlpt: activeItem.jlpt,
                          context: activeItem.examples[0]?.romaji,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container-lowest border border-outline-variant/30 text-xs font-semibold text-on-surface hover:border-primary/40 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      <span>Pin to SRS Queue</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-md bg-surface-container-low/70 border border-outline-variant/15">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-outline mb-1">
                        English Definition
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed">
                        {activeItem.meaningEn}
                      </p>
                    </div>
                    <div className="p-4 rounded-md bg-surface-container-low/70 border border-outline-variant/15">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-outline mb-1">
                        Vietnamese Gloss (Tiếng Việt)
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed">
                        {activeItem.meaningVi}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-md bg-secondary-fixed/25 border border-secondary/20 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-secondary">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{activeItem.nuanceTitle}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {activeItem.nuanceBody}
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-on-surface">
                      Kanji Morphological Roots
                    </h3>
                    <span className="text-xs text-outline">Click character to dissect</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeItem.kanjiRoots.map((root) => (
                      <button
                        key={root.char}
                        type="button"
                        onClick={() => openKanji(root.char)}
                        className="p-4 rounded-md bg-surface-container-low border border-outline-variant/20 hover:border-primary/45 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif text-3xl font-bold text-primary">
                            {root.char}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-surface-container-lowest text-outline">
                            {root.jlpt}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-on-surface">{root.meaning}</div>
                        <div className="text-[11px] text-outline mt-0.5">{root.reading}</div>
                        <div className="text-[10px] font-mono text-secondary mt-2 flex items-center justify-between">
                          <span>{root.radical}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
                    <h3 className="font-serif text-base font-bold text-on-surface">
                      High-Yield Collocations
                    </h3>
                    {activeItem.collocations.map((col, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-md bg-surface-container-low border border-outline-variant/15 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-outline uppercase">{col.label}</span>
                          <button
                            type="button"
                            onClick={() => openGrammar('ni-vs-de')}
                            className="text-primary font-semibold hover:underline cursor-pointer"
                          >
                            Drill Pattern ({col.lessonRef}) →
                          </button>
                        </div>
                        <div className="font-serif text-base font-bold text-on-surface">
                          {col.jpBefore}
                          <span className="text-primary mx-0.5">{col.particle}</span>
                          {col.jpAfter}
                        </div>
                        <p className="text-xs text-on-surface-variant">{col.en}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
                    <h3 className="font-serif text-base font-bold text-on-surface">
                      Contextual Usage Examples
                    </h3>
                    {activeItem.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-md bg-surface-container-low border border-outline-variant/15 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-serif text-base font-bold text-on-surface leading-relaxed">
                            <RubyText
                              segments={ex.segments}
                              highlightParticle={ex.particleHighlight}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              speakJapanese(ex.segments.map((s) => s.text).join(''))
                            }
                            className="p-1.5 rounded-md bg-surface-container-lowest text-secondary hover:text-primary shrink-0 cursor-pointer"
                            aria-label="Play example audio"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] font-mono text-outline romaji-sub">{ex.romaji}</div>
                        <div className="text-xs text-on-surface-variant">{ex.en}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
