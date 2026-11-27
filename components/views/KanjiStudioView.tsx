'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Volume2,
  Play,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  Layers,
  PenTool,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { KANJI_ITEMS } from '@/lib/koto-data';
import { useMinnaLesson } from '@/hooks/use-minna-lesson';
import { LessonSwitcherBar } from '@/components/LessonSwitcherBar';

type KanjiTab = 'minna' | 'dissection' | 'strokes' | 'lexicon' | 'matrix';

const RADICALS = [
  { glyph: '日', label: 'Sun / Day', kanjiChar: '時' },
  { glyph: '馬', label: 'Horse', kanjiChar: '駅' },
  { glyph: '食', label: 'Food / Eat', kanjiChar: '食' },
  { glyph: '广', label: 'Shelter', kanjiChar: '店' },
  { glyph: '行', label: 'Crossroads', kanjiChar: '行' },
  { glyph: '人', label: 'Person', kanjiChar: '会' },
];

export function KanjiStudioView() {
  const {
    activeLessonNumber,
    selectedKanjiChar,
    openKanji,
    speakJapanese,
    bookmarkedKanji,
    toggleBookmarkKanji,
    addSrsCard,
    showToast,
  } = useKoto();

  const { meta, pack, loading } = useMinnaLesson(activeLessonNumber);

  const [activeTab, setActiveTab] = useState<KanjiTab>('minna');
  const [selectedMinnaChar, setSelectedMinnaChar] = useState<string>('');
  const [strokeState, setStrokeState] = useState<{
    char: string;
    step: number | null;
    playing: boolean;
  }>({ char: '時', step: null, playing: false });
  const [showStencil, setShowStencil] = useState(true);
  const [hasInk, setHasInk] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const minnaKanjiList = pack?.kanji ?? [];
  const activeMinnaKanji =
    minnaKanjiList.find((k) => k.char === selectedMinnaChar) ??
    minnaKanjiList[0] ??
    null;

  const kanji =
    KANJI_ITEMS.find((k) => k.char === selectedKanjiChar) ?? KANJI_ITEMS[0];

  const strokeStepIdx =
    strokeState.char === kanji.char && strokeState.step !== null
      ? Math.min(strokeState.step, kanji.strokeSteps.length - 1)
      : kanji.strokeSteps.length - 1;
  const isPlayingStrokes = strokeState.char === kanji.char && strokeState.playing;

  useEffect(() => {
    if (!isPlayingStrokes) return;
    const timer = setInterval(() => {
      setStrokeState((prev) => {
        const currStep = prev.step ?? 0;
        if (currStep + 1 >= kanji.strokeSteps.length) {
          return { ...prev, playing: false };
        }
        return { ...prev, step: currStep + 1 };
      });
    }, 650);
    return () => clearInterval(timer);
  }, [isPlayingStrokes, kanji.strokeSteps.length]);

  const startStrokeAnimation = () => {
    setStrokeState({ char: kanji.char, step: 0, playing: true });
  };

  // HTML5 Canvas Freehand Calligraphy Handlers
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getCanvasPoint(e);
    ctx.strokeStyle = '#1b1b1d';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingRef.current = true;
    setHasInk(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  const isBookmarked = bookmarkedKanji.includes(kanji.char);

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
            漢字インテリジェンス · Radical Dissection &amp; Calligraphy
          </div>
          <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
            Kanji Intelligence Studio
          </h1>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-md bg-surface-container border border-on-surface/10">
          {[
            { id: 'minna' as const, label: 'Minna Lesson (L01–25)' },
            { id: 'dissection' as const, label: 'Dissection' },
            { id: 'strokes' as const, label: 'Stroke Sandbox' },
            { id: 'lexicon' as const, label: 'Compounds' },
            { id: 'matrix' as const, label: 'Core Matrix' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-surface-container-lowest text-primary border-on-surface/15'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Minna Lesson Kanji Mode */}
      {activeTab === 'minna' ? (
        <div className="space-y-5">
          <LessonSwitcherBar showSkillLinks showCompleteToggle={false} />

          {meta.status === 'coming-soon' ? (
            <div className="bg-surface-container-lowest rounded-lg border border-secondary/30 p-8 text-center space-y-2">
              <div className="text-xs font-mono uppercase text-secondary font-bold">
                Milestone 2 N4 Syllabus
              </div>
              <p className="text-sm text-on-surface-variant">
                N4 Kanji decks for Lesson {meta.lessonNumber} will be loaded in Milestone 2. Switch to N5 Lessons 01–25 to study active lesson Kanji.
              </p>
            </div>
          ) : loading ? (
            <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-12 flex items-center justify-center gap-2 text-sm text-outline">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading Lesson {activeLessonNumber} Kanji...</span>
            </div>
          ) : activeMinnaKanji ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 4 Cols: 5 Lesson Kanji */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-4 space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-outline">
                    Lesson {String(meta.lessonNumber).padStart(2, '0')} Kanji ({minnaKanjiList.length})
                  </div>
                  <div className="space-y-2">
                    {minnaKanjiList.map((k) => {
                      const selected = k.char === activeMinnaKanji.char;
                      return (
                        <button
                          key={k.char}
                          type="button"
                          onClick={() => setSelectedMinnaChar(k.char)}
                          className={`w-full p-3 rounded-md border flex items-center gap-3 text-left transition-all cursor-pointer ${
                            selected
                              ? 'bg-primary-fixed/30 border-primary text-on-surface'
                              : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/40'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xs bg-surface-container-lowest border border-on-surface/12 flex items-center justify-center font-serif text-2xl font-bold text-primary shrink-0">
                            {k.char}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-on-surface truncate">
                              {k.meaning}
                            </div>
                            <div className="text-[11px] text-on-surface-variant truncate">
                              {k.meaningVi}
                            </div>
                            <div className="text-[10px] font-mono text-outline mt-0.5">
                              {k.strokes} strokes · {k.jlpt}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right 8 Cols: Active Lesson Kanji Detail + Compounds */}
              <div className="lg:col-span-8 space-y-5">
                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div className="relative w-24 h-24 rounded-xs bg-surface-container-low border-2 border-outline-variant/55 flex items-center justify-center shrink-0 overflow-hidden">
                        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-outline-variant/50" />
                        <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-outline-variant/50" />
                        <span className="relative font-serif text-5xl font-bold text-on-surface">
                          {activeMinnaKanji.char}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-outline">
                          <span className="px-2 py-0.5 rounded-xs bg-primary-fixed text-primary font-bold">
                            {activeMinnaKanji.jlpt} · L{String(meta.lessonNumber).padStart(2, '0')}
                          </span>
                          <span className="tabular-nums">{activeMinnaKanji.strokes} Strokes</span>
                          <span>·</span>
                          <span>{activeMinnaKanji.radical}</span>
                        </div>
                        <h2 className="font-serif text-2xl font-bold text-on-surface mt-1">
                          {activeMinnaKanji.meaning}
                        </h2>
                        <div className="text-xs text-secondary font-medium mt-0.5">
                          {activeMinnaKanji.meaningVi}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          speakJapanese(
                            activeMinnaKanji.compounds[0]?.word ?? activeMinnaKanji.char
                          )
                        }
                        className="p-2.5 rounded-md bg-surface-container-low hover:bg-surface-container text-secondary cursor-pointer"
                        title="Speak reading"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBookmarkKanji(activeMinnaKanji.char)}
                        className={`p-2.5 rounded-md border transition-colors cursor-pointer ${
                          bookmarkedKanji.includes(activeMinnaKanji.char)
                            ? 'bg-primary-fixed/40 border-primary text-primary'
                            : 'bg-surface-container-low border-on-surface/10 text-outline'
                        }`}
                        title="Bookmark Kanji"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            bookmarkedKanji.includes(activeMinnaKanji.char) ? 'fill-current' : ''
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          addSrsCard({
                            front: activeMinnaKanji.char,
                            reading: `${activeMinnaKanji.onyomi} / ${activeMinnaKanji.kunyomi}`,
                            meaning: `${activeMinnaKanji.meaning} · ${activeMinnaKanji.meaningVi}`,
                            jlpt: activeMinnaKanji.jlpt,
                            context: activeMinnaKanji.mnemonic,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Add to SRS</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-md bg-primary-fixed/15 border border-primary/20 space-y-1">
                      <div className="text-[10px] font-mono uppercase text-primary font-bold">
                        On-yomi (音読み)
                      </div>
                      <div className="font-serif text-xl font-bold text-on-surface">
                        {activeMinnaKanji.onyomi}
                      </div>
                    </div>
                    <div className="p-4 rounded-md bg-secondary-fixed/20 border border-secondary/20 space-y-1">
                      <div className="text-[10px] font-mono uppercase text-secondary font-bold">
                        Kun-yomi (訓読み)
                      </div>
                      <div className="font-serif text-xl font-bold text-on-surface">
                        {activeMinnaKanji.kunyomi}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-md bg-surface-container-low border border-outline-variant/15 text-xs text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">Mnemonic:</strong>{' '}
                    {activeMinnaKanji.mnemonic}
                  </div>
                </div>

                {/* Lesson Kanji Compounds */}
                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-bold text-on-surface">
                      Compounds (熟語)
                    </h3>
                    <Sparkles className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeMinnaKanji.compounds.map((comp) => (
                      <div
                        key={comp.word}
                        className="p-3.5 rounded-md bg-surface-container-low border border-outline-variant/15 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif text-lg font-bold text-on-surface">
                              {comp.word}
                            </span>
                            <span className="text-xs text-outline">{comp.reading}</span>
                          </div>
                          <div className="text-xs text-on-surface-variant">
                            {comp.meaning} · {comp.meaningVi}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakJapanese(comp.word)}
                          className="p-2 rounded-md bg-surface-container-lowest text-secondary hover:text-primary cursor-pointer shrink-0"
                          aria-label={`Listen to ${comp.word}`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          {/* Primary Radicals Ribbon */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-3.5 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-outline mr-2">
              Primary Radicals:
            </span>
            {RADICALS.map((rad) => {
              const active = kanji.char === rad.kanjiChar;
              return (
                <button
                  key={rad.glyph}
                  type="button"
                  onClick={() => openKanji(rad.kanjiChar)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border transition-colors cursor-pointer ${
                    active
                      ? 'bg-primary-fixed/40 border-primary/40 text-primary font-semibold'
                      : 'bg-surface-container-low border-outline-variant/20 text-on-surface hover:border-primary/30'
                  }`}
                >
                  <span className="font-serif text-base font-bold">{rad.glyph}</span>
                  <span className="text-[11px] text-outline">{rad.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'matrix' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {KANJI_ITEMS.map((k) => (
                <button
                  key={k.char}
                  type="button"
                  onClick={() => {
                    openKanji(k.char);
                    setActiveTab('dissection');
                  }}
                  className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 text-left hover:border-primary/45 transition-colors cursor-pointer flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-lg bg-surface-container-low border border-on-surface/10 flex items-center justify-center font-serif text-4xl font-bold text-primary shrink-0">
                    {k.char}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-on-surface">{k.meaning}</span>
                      <span className="text-[11px] font-mono font-bold text-tertiary tabular-nums">
                        {k.recall}%
                      </span>
                    </div>
                    <div className="text-xs text-outline mt-0.5">
                      On: {k.onyomi.kana} · Kun: {k.kunyomi.kana}
                    </div>
                    <div className="text-[11px] font-mono text-secondary mt-1">
                      {k.strokes} strokes · {k.radical} ({k.radicalMeaning})
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <aside className="lg:col-span-4 space-y-4">
                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-4 space-y-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-outline px-1">
                    Active Kanji Roster ({KANJI_ITEMS.length})
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {KANJI_ITEMS.map((k) => {
                      const selected = k.char === kanji.char;
                      return (
                        <button
                          key={k.char}
                          type="button"
                          onClick={() => openKanji(k.char)}
                          className={`p-3 rounded-md border text-center transition-all cursor-pointer ${
                            selected
                              ? 'bg-primary-fixed/35 border-primary text-primary'
                              : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/35'
                          }`}
                        >
                          <div className="font-serif text-2xl font-bold">{k.char}</div>
                          <div className="text-[10px] text-outline truncate mt-0.5">
                            {k.meaning.split('/')[0]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-outline">
                    Script Evolutionary Lineage
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-md bg-surface-container-low">
                      <div className="font-serif text-2xl text-outline">{kanji.oracleChar}</div>
                      <div className="text-[10px] text-outline mt-1">Oracle</div>
                    </div>
                    <div className="p-3 rounded-md bg-surface-container-low">
                      <div className="font-serif text-2xl text-secondary">{kanji.sealChar}</div>
                      <div className="text-[10px] text-outline mt-1">Seal Script</div>
                    </div>
                    <div className="p-3 rounded-md bg-primary-fixed/30 border border-primary/25">
                      <div className="font-serif text-2xl font-bold text-primary">{kanji.char}</div>
                      <div className="text-[10px] text-primary font-semibold mt-1">Shinjitai</div>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {kanji.lineageNote}
                  </p>
                </div>

                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-on-surface">Memory Stability</span>
                    <span className="font-mono font-bold text-tertiary tabular-nums">
                      {kanji.stabilityDays} Days
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-md bg-surface-container-low">
                      <div className="text-[10px] text-outline">Recall Rate</div>
                      <div className="font-mono font-bold text-on-surface tabular-nums">
                        {kanji.recall}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-md bg-surface-container-low">
                      <div className="text-[10px] text-outline">Next Eval</div>
                      <div className="font-mono font-bold text-on-surface tabular-nums">
                        In {kanji.nextEvalDays}d
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      addSrsCard({
                        front: kanji.char,
                        reading: `${kanji.onyomi.kana} / ${kanji.kunyomi.kana}`,
                        meaning: kanji.meaning,
                        jlpt: kanji.jlpt,
                        context: kanji.mnemonicHeadline,
                      })
                    }
                    className="w-full py-2 rounded-md bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Queue Kanji in SRS</span>
                  </button>
                </div>
              </aside>

              <div className="lg:col-span-8 space-y-5">
                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div className="relative w-28 h-28 rounded-xs bg-surface-container-low border-2 border-outline-variant/55 flex items-center justify-center shrink-0 overflow-hidden">
                        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-outline-variant/50" />
                        <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-outline-variant/50" />
                        <span className="relative font-serif text-6xl font-bold text-on-surface">
                          {kanji.char}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-outline">
                          <span className="px-2 py-0.5 rounded-xs bg-primary-fixed text-primary font-bold">
                            {kanji.jlpt}
                          </span>
                          <span>{kanji.grade}</span>
                          <span>·</span>
                          <span className="tabular-nums">{kanji.strokes} Strokes</span>
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface mt-1">
                          {kanji.meaning}
                        </h2>
                        <div className="text-xs text-on-surface-variant mt-1">
                          Radical #{kanji.radicalNumber}:{' '}
                          <span className="font-serif font-bold text-primary">{kanji.radical}</span>{' '}
                          ({kanji.radicalReading} · {kanji.radicalMeaning})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speakJapanese(kanji.compounds[0]?.word ?? kanji.char)}
                        className="p-2.5 rounded-md bg-surface-container-low hover:bg-surface-container text-secondary cursor-pointer"
                        title="Speak reading"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBookmarkKanji(kanji.char)}
                        className={`p-2.5 rounded-md border transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'bg-primary-fixed/40 border-primary text-primary'
                            : 'bg-surface-container-low border-on-surface/10 text-outline'
                        }`}
                        title="Bookmark Kanji"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-md bg-surface-container-low border border-outline-variant/15 space-y-3">
                    <div className="text-sm font-serif font-bold text-primary">
                      {kanji.mnemonicHeadline}
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {kanji.mnemonicBody}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {kanji.components.map((comp) => (
                        <div
                          key={comp.glyph}
                          className="p-3 rounded-md bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-3"
                        >
                          <span
                            className={`font-serif text-2xl font-bold w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              comp.accent === 'primary'
                                ? 'bg-primary-fixed/40 text-primary'
                                : 'bg-secondary-fixed/40 text-secondary'
                            }`}
                          >
                            {comp.glyph}
                          </span>
                          <div>
                            <div className="text-[10px] font-mono text-outline uppercase">
                              {comp.badge}
                            </div>
                            <div className="text-xs font-semibold text-on-surface">
                              {comp.reading}
                            </div>
                            <div className="text-[11px] text-outline">{comp.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-md bg-primary-fixed/20 border border-primary/20 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                        <span className="text-primary font-bold">On-yomi (音読み)</span>
                        <span className="text-outline">{kanji.onyomi.note}</span>
                      </div>
                      <div className="font-serif text-2xl font-bold text-on-surface">
                        {kanji.onyomi.kana}
                      </div>
                      <div className="text-xs text-on-surface-variant">{kanji.onyomi.romaji}</div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {kanji.onyomi.compounds.map((c) => (
                          <span
                            key={c}
                            className="text-[11px] px-2 py-0.5 rounded-xs bg-surface-container-lowest border border-outline-variant/20 font-serif"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-md bg-secondary-fixed/25 border border-secondary/20 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                        <span className="text-secondary font-bold">Kun-yomi (訓読み)</span>
                        <span className="text-outline">{kanji.kunyomi.note}</span>
                      </div>
                      <div className="font-serif text-2xl font-bold text-on-surface">
                        {kanji.kunyomi.kana}
                      </div>
                      <div className="text-xs text-on-surface-variant">{kanji.kunyomi.romaji}</div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {kanji.kunyomi.compounds.map((c) => (
                          <span
                            key={c}
                            className="text-[11px] px-2 py-0.5 rounded-xs bg-surface-container-lowest border border-outline-variant/20 font-serif"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-base font-bold text-on-surface">
                          Stroke Sequence ({kanji.strokeSteps.length})
                        </h3>
                        <p className="text-[11px] text-outline">
                          Step {strokeStepIdx + 1} of {kanji.strokeSteps.length}:{' '}
                          {kanji.strokeSteps[strokeStepIdx]?.label}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={startStrokeAnimation}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Animate</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {kanji.strokeSteps.map((st, idx) => (
                        <button
                          key={st.step}
                          type="button"
                          onClick={() =>
                            setStrokeState({ char: kanji.char, step: idx, playing: false })
                          }
                          className={`p-2 rounded-md border text-center cursor-pointer transition-colors ${
                            idx <= strokeStepIdx
                              ? 'bg-primary-fixed/30 border-primary/40 text-on-surface'
                              : 'bg-surface-container-low border-outline-variant/15 text-outline'
                          }`}
                        >
                          <div className="text-[9px] font-mono text-outline">#{st.step}</div>
                          <div className="font-serif text-base font-bold">{st.symbol}</div>
                        </button>
                      ))}
                    </div>

                    <div className="p-3 rounded-md bg-surface-container-low text-xs text-on-surface-variant leading-relaxed">
                      <strong className="text-on-surface">Equilibrium Critique:</strong>{' '}
                      {kanji.balanceCritique}
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PenTool className="w-4 h-4 text-primary" />
                        <h3 className="font-serif text-base font-bold text-on-surface">
                          Calligraphy Sandbox
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowStencil((s) => !s)}
                          className="p-1.5 rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface-variant cursor-pointer"
                          title={showStencil ? 'Hide stencil' : 'Show stencil'}
                        >
                          {showStencil ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="p-1.5 rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface-variant cursor-pointer"
                          title="Clear ink"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="relative w-full aspect-square max-h-[220px] mx-auto rounded-xs bg-surface-container-low border-2 border-outline-variant/45 overflow-hidden touch-none">
                      <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-outline-variant/50" />
                      <div className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-outline-variant/50" />
                      {showStencil && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-[130px] text-outline/15 select-none">
                          {kanji.char}
                        </div>
                      )}
                      <canvas
                        ref={canvasRef}
                        width={260}
                        height={260}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        className="relative w-full h-full cursor-crosshair"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-outline">
                        {hasInk ? 'Sumi ink active — trace strokes 1 to ' + kanji.strokes : 'Draw inside grid with mouse or touch'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!hasInk) {
                            showToast('Trace the character in the sandbox before verifying.');
                            return;
                          }
                          showToast(`Balance verified for 「${kanji.char}」! Hanko stamp 良 awarded.`);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-tertiary text-on-tertiary text-xs font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify Brush</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-bold text-on-surface">
                      Essential Compounds (熟語)
                    </h3>
                    <Sparkles className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {kanji.compounds.map((comp) => (
                      <div
                        key={comp.word}
                        className="p-3.5 rounded-md bg-surface-container-low border border-outline-variant/15 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif text-lg font-bold text-on-surface">
                              {comp.word}
                            </span>
                            <span className="text-xs text-outline">{comp.reading}</span>
                          </div>
                          <div className="text-xs text-on-surface-variant">{comp.meaning}</div>
                          <div className="text-[10px] font-mono text-secondary mt-0.5">
                            {comp.breakdown}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakJapanese(comp.word)}
                          className="p-2 rounded-md bg-surface-container-lowest text-secondary hover:text-primary cursor-pointer shrink-0"
                          aria-label={`Listen to ${comp.word}`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
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
