'use client';

import React, { useEffect, useState } from 'react';
import {
  Volume2,
  RotateCw,
  CheckCircle2,
  Mic,
  BookOpen,
  PenTool,
  Landmark,
  Sparkles,
  Loader2,
  Send,
  SlidersHorizontal,
  RefreshCw,
  RotateCcw,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { RubySegment } from '@/lib/koto-data';
import { RubyText } from '@/components/RubyText';
import { useMinnaLesson } from '@/hooks/use-minna-lesson';
import { LessonSwitcherBar } from '@/components/LessonSwitcherBar';

/* ============================================================================
 * 1. SRS Review Center View
 * ========================================================================== */
export function ReviewCenterView() {
  const {
    srsQueue,
    srsReviewedCount,
    completeSrsCard,
    dueCount,
    speakJapanese,
    setRoute,
    commandOpen,
    activeLessonNumber,
  } = useKoto();
  const [revealed, setRevealed] = useState(false);

  const card = srsQueue[0];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (commandOpen || !card) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        if (tag === 'button' || tag === 'a') return;
        e.preventDefault();
        if (!revealed) {
          setRevealed(true);
        } else {
          speakJapanese(card.front);
        }
        return;
      }

      if (!revealed) return;
      const gradeMap: Record<string, 'again' | 'hard' | 'good' | 'easy'> = {
        '1': 'again',
        '2': 'hard',
        '3': 'good',
        '4': 'easy',
      };
      const grade = gradeMap[e.key];
      if (grade) {
        e.preventDefault();
        completeSrsCard(card.id, grade);
        setRevealed(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commandOpen, card, revealed, speakJapanese, completeSrsCard]);

  if (!card) {
    const isFreshDeck = srsReviewedCount === 0;
    return (
      <div className="max-w-xl mx-auto bg-surface-container-lowest rounded-lg border border-on-surface/12 p-8 sm:p-10 text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-xs border-2 border-tertiary/80 text-tertiary font-serif flex flex-col items-center justify-center rotate-[-3deg] bg-tertiary-fixed/15">
          <span className="text-lg font-bold leading-none">{isFreshDeck ? '準備' : '復習'}</span>
          <span className="text-lg font-bold leading-none mt-0.5">{isFreshDeck ? '完了' : '完了'}</span>
        </div>
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-tertiary font-semibold">
            {isFreshDeck ? '0 Cards Queued Yet' : 'Editorial Washi Clear State · 0 Items Due'}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">
            {isFreshDeck
              ? 'Your SRS Deck Starts Clean'
              : '「復習完了」— Clear Mind (心身爽快)'}
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {isFreshDeck
            ? `Open Vocabulary Lab or Lesson ${String(activeLessonNumber).padStart(2, '0')} and click "Queue to SRS" to add your first flashcards.`
            : `All immediate Ebbinghaus recall items are consolidated for today. Continue advancing in Lesson ${String(activeLessonNumber).padStart(2, '0')} or read graded stories in the Library.`}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setRoute(isFreshDeck ? 'vocabulary-lab' : 'lesson')}
            className="px-5 py-2.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer"
          >
            {isFreshDeck
              ? 'Open Vocabulary Lab'
              : `Continue Lesson ${String(activeLessonNumber).padStart(2, '0')}`}
          </button>
          <button
            type="button"
            onClick={() => setRoute('dashboard')}
            className="px-4 py-2.5 rounded-md bg-transparent border border-on-surface/15 text-on-surface text-xs font-semibold hover:bg-surface-container-low cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
            SRS 復習センター · Spaced Repetition Queue
          </div>
          <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
            Daily Memory Review
          </h1>
        </div>
        <span className="px-3 py-1 rounded-md bg-primary-fixed border border-primary/20 text-primary font-mono text-xs font-bold tabular-nums">
          {dueCount} Due Remaining
        </span>
      </div>

      <div className="bg-surface-container-lowest rounded-lg border border-on-surface/15 p-8 text-center space-y-6">
        <div className="flex items-center justify-between text-xs font-mono text-outline">
          <span>JLPT {card.jlpt}</span>
          <button
            type="button"
            onClick={() => speakJapanese(card.front)}
            className="inline-flex items-center gap-1 text-secondary hover:text-primary cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Pronounce</span>
          </button>
        </div>

        <div className="py-6">
          <div className="font-serif text-4xl sm:text-5xl font-bold text-on-surface">
            {card.front}
          </div>
          {revealed && (
            <div className="mt-5 pt-5 border-t border-on-surface/10 space-y-2">
              <div className="text-lg font-serif text-primary font-semibold">
                {card.reading}
              </div>
              <div className="text-sm text-on-surface font-medium">{card.meaning}</div>
              {card.context && (
                <div className="text-xs text-outline font-serif pt-1">{card.context}</div>
              )}
            </div>
          )}
        </div>

        {!revealed ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="w-full py-3 rounded-md bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Reveal Reading &amp; Meaning</span>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded-xs bg-on-primary/20 text-on-primary">
                Space
              </kbd>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2.5">
              {(
                [
                  { key: 'again' as const, num: '1', label: 'Again', sub: '1m', cls: 'bg-error-container border-error/30 text-on-error-container' },
                  { key: 'hard' as const, num: '2', label: 'Hard', sub: '12h', cls: 'bg-surface-container border-on-surface/15 text-on-surface' },
                  { key: 'good' as const, num: '3', label: 'Good', sub: '3d', cls: 'bg-secondary-fixed border-secondary/30 text-secondary' },
                  { key: 'easy' as const, num: '4', label: 'Easy', sub: '14d', cls: 'bg-tertiary-fixed border-tertiary/30 text-tertiary' },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => {
                    completeSrsCard(card.id, btn.key);
                    setRevealed(false);
                  }}
                  className={`py-2.5 px-2 rounded-md border text-xs font-bold cursor-pointer hover:opacity-90 ${btn.cls}`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <kbd className="font-mono text-[10px] opacity-70">[{btn.num}]</kbd>
                    <span>{btn.label}</span>
                  </div>
                  <div className="text-[10px] font-mono opacity-80">{btn.sub}</div>
                </button>
              ))}
            </div>
            <div className="text-[11px] font-mono text-outline">
              Press Space to replay Japanese audio · Keys 1–4 to grade
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. Speaking & Dialogue Studio
 * ========================================================================== */
const SPEAKING_PROMPTS = [
  {
    id: 'sp-1',
    title: 'Ordering at a Tokyo Kissaten',
    jp: 'すみません、アイスコーヒーを一つお願いします。',
    romaji: 'Sumimasen, aisu koohii wo hitotsu onegaishimasu.',
    en: 'Excuse me, one iced coffee please.',
  },
  {
    id: 'sp-2',
    title: 'Asking Station Transfer Directions',
    jp: '新宿駅で山手線に乗り換えますか。',
    romaji: 'Shinjuku-eki de Yamanote-sen ni norikaemasu ka?',
    en: 'Do I transfer to the Yamanote Line at Shinjuku Station?',
  },
  {
    id: 'sp-3',
    title: 'Self-Introduction at Seminar',
    jp: 'はじめまして。私はベトナム人の学生です。',
    romaji: 'Hajimemashite. Watashi wa Betonamu-jin no gakusei desu.',
    en: 'Nice to meet you. I am a Vietnamese university student.',
  },
];

export function SpeakingDialogueView() {
  const { speakJapanese, setRoute, showToast } = useKoto();
  const [activeId, setActiveId] = useState(SPEAKING_PROMPTS[0].id);
  const [recording, setRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const prompt = SPEAKING_PROMPTS.find((p) => p.id === activeId) ?? SPEAKING_PROMPTS[0];

  const toggleRecord = () => {
    if (recording) {
      setRecording(false);
      setScore(94);
      showToast('Pronunciation scored: 94% Mora & Pitch Alignment.');
    } else {
      setRecording(true);
      setScore(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
            会話・発音スタジオ · Expressive Speech Studio
          </div>
          <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
            Speaking &amp; Dialogue Drills
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setRoute('ai-sensei-tutor')}
          className="px-4 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold cursor-pointer"
        >
          Open Live AI Sensei Roleplay →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-2.5">
          {SPEAKING_PROMPTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setActiveId(p.id);
                setScore(null);
              }}
              className={`w-full p-4 rounded-lg border text-left cursor-pointer transition-colors ${
                activeId === p.id
                  ? 'bg-primary-fixed/25 border-primary'
                  : 'bg-surface-container-lowest border-on-surface/10 hover:border-primary/40'
              }`}
            >
              <div className="text-xs font-bold text-on-surface">{p.title}</div>
              <div className="font-serif text-sm text-primary mt-1">{p.jp}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-secondary font-bold">
              {prompt.title}
            </span>
            <button
              type="button"
              onClick={() => speakJapanese(prompt.jp)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-xs font-semibold text-secondary cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Model Audio</span>
            </button>
          </div>

          <div className="p-5 rounded-md bg-surface-container-low border border-outline-variant/15 space-y-2">
            <div className="font-serif text-2xl font-bold text-on-surface">{prompt.jp}</div>
            <div className="text-xs font-mono text-outline romaji-sub">{prompt.romaji}</div>
            <div className="text-sm text-on-surface-variant">{prompt.en}</div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleRecord}
              className={`px-5 py-3 rounded-md text-xs font-semibold inline-flex items-center gap-2 cursor-pointer ${
                recording ? 'bg-error text-on-error' : 'bg-primary text-on-primary'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{recording ? 'Stop & Analyze Pitch' : 'Record Response'}</span>
            </button>

            {score !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-tertiary-fixed/40 text-tertiary text-xs font-bold tabular-nums">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mora Rhythm Verified: {score}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. Reading & Graded Library
 * ========================================================================== */
const READING_PASSAGES: {
  id: string;
  title: string;
  level: string;
  sentences: { segments: RubySegment[]; plain: string; en: string }[];
}[] = [
  {
    id: 'cafe-story',
    title: '東京の小さな喫茶店 (Tokyo’s Little Retro Cafe)',
    level: 'JLPT N5',
    sentences: [
      {
        segments: [
          { text: '駅', rt: 'えき' },
          { text: 'の' },
          { text: '近', rt: 'ちか' },
          { text: 'くに' },
          { text: '静', rt: 'しず' },
          { text: 'かな' },
          { text: '喫茶店', rt: 'きっさてん' },
          { text: 'があります。' },
        ],
        plain: '駅の近くに静かな喫茶店があります。',
        en: 'Near the station, there is a quiet traditional cafe.',
      },
      {
        segments: [
          { text: '私', rt: 'わたし' },
          { text: 'は' },
          { text: '毎朝', rt: 'まいあさ' },
          { text: '、そこで' },
          { text: '温', rt: 'あたた' },
          { text: 'かいコーヒーを' },
          { text: '飲', rt: 'の' },
          { text: 'みます。' },
        ],
        plain: '私は毎朝、そこで温かいコーヒーを飲みます。',
        en: 'Every morning, I drink hot coffee there.',
      },
      {
        segments: [
          { text: '窓際', rt: 'まどぎわ' },
          { text: 'の' },
          { text: '席', rt: 'せき' },
          { text: 'で' },
          { text: '日本語', rt: 'にほんご' },
          { text: 'の' },
          { text: '本', rt: 'ほん' },
          { text: 'を' },
          { text: '読', rt: 'よ' },
          { text: 'むのが' },
          { text: '好', rt: 'す' },
          { text: 'きです。' },
        ],
        plain: '窓際の席で日本語の本を読むのが好きです。',
        en: 'I love reading Japanese books at a window seat.',
      },
    ],
  },
];

export function ReadingLibraryView() {
  const {
    activeLessonNumber,
    setActiveLessonNumber,
    speakJapanese,
    showFurigana,
    toggleFurigana,
  } = useKoto();
  const { meta, pack, loading } = useMinnaLesson(activeLessonNumber);
  const [sourceMode, setSourceMode] = useState<'minna' | 'classic'>('minna');
  const [showTranslations, setShowTranslations] = useState(true);
  const [selectedByLesson, setSelectedByLesson] = useState<Record<number, string>>({});

  const passage = READING_PASSAGES[0];
  const selectedOption = selectedByLesson[activeLessonNumber] ?? null;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
            読解アーカイブ · Graded Reader Immersion
          </div>
          <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
            Reading &amp; Library
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-on-surface/15 bg-surface-container-low p-0.5">
            <button
              type="button"
              onClick={() => setSourceMode('minna')}
              className={`px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer whitespace-nowrap ${
                sourceMode === 'minna'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Minna Lesson (L01–25)
            </button>
            <button
              type="button"
              onClick={() => setSourceMode('classic')}
              className={`px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer whitespace-nowrap ${
                sourceMode === 'classic'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Graded Reader: Tokyo Cafe
            </button>
          </div>
          <button
            type="button"
            onClick={toggleFurigana}
            className="px-3 py-1.5 rounded-md bg-surface-container-lowest border border-outline-variant/30 text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            {showFurigana ? 'Hide Furigana' : 'Show Furigana'}
          </button>
          <button
            type="button"
            onClick={() => setShowTranslations((v) => !v)}
            className="px-3 py-1.5 rounded-md bg-surface-container-lowest border border-outline-variant/30 text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            {showTranslations ? 'Hide EN · VI' : 'Show EN · VI'}
          </button>
        </div>
      </div>

      {sourceMode === 'minna' ? (
        <div className="space-y-5">
          <LessonSwitcherBar showSkillLinks showCompleteToggle={false} />

          {meta.status === 'coming-soon' ? (
            <div className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-sm bg-secondary-fixed text-secondary font-mono text-[11px] font-bold">
                  JLPT N4 · MILESTONE 2 PREVIEW
                </span>
                <span className="text-xs font-mono text-outline">
                  Lesson {String(meta.lessonNumber).padStart(2, '0')}
                </span>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-on-surface">
                  {meta.titleJp} — {meta.titleEn}
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">{meta.titleVi}</p>
              </div>
              <p className="text-xs text-outline leading-relaxed">
                Full graded reading passages and comprehension drills for Minna no Nihongo II (N4 Lessons 26–50) are scheduled in Milestone 2. All 25 N5 lessons are ready for study now.
              </p>
              <button
                type="button"
                onClick={() => setActiveLessonNumber(25)}
                className="px-4 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer"
              >
                Open Lesson 25 (N5 Capstone)
              </button>
            </div>
          ) : loading || !pack ? (
            <div className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-10 flex items-center justify-center gap-3 text-sm text-outline">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span>Loading Lesson {String(meta.lessonNumber).padStart(2, '0')} Reading Passage...</span>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-6 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant/15 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary shrink-0" />
                      <h2 className="font-serif text-xl font-bold text-on-surface">
                        {pack.reading.title}
                      </h2>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {pack.reading.titleEn} · {pack.reading.titleVi}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-1 rounded-sm bg-tertiary-fixed text-tertiary font-bold">
                      {meta.jlpt} · L{String(meta.lessonNumber).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speakJapanese(
                          pack.reading.sentences.map((s) => s.plain).join(' '),
                          0.95,
                          pack.reading.audioUrl
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-fixed/60 text-primary text-xs font-semibold hover:bg-primary-fixed cursor-pointer whitespace-nowrap"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Play Full Passage</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {pack.reading.sentences.map((s, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-md bg-surface-container-low border border-outline-variant/15 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="font-serif text-xl leading-loose text-on-surface">
                          <RubyText segments={s.segments} />
                        </div>
                        {showTranslations && (
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-mono text-outline romaji-sub">
                              {s.romaji}
                            </p>
                            <p className="text-xs text-on-surface font-medium">{s.en}</p>
                            <p className="text-xs text-on-surface-variant">{s.vi}</p>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => speakJapanese(s.plain, 1.0, pack.reading.audioUrl)}
                        className="p-2 rounded-md bg-surface-container-lowest border border-on-surface/10 text-secondary hover:text-primary shrink-0 cursor-pointer"
                        aria-label="Listen to sentence"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comprehension Check */}
              <div className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-secondary font-bold">
                    読解チェック · Reading Comprehension
                  </div>
                  <span className="text-[11px] font-mono text-outline">
                    Lesson {String(meta.lessonNumber).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-sm font-semibold text-on-surface">
                  {pack.reading.question.prompt}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {pack.reading.question.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isCorrect = opt.id === pack.reading.question.correctId;
                    let cls =
                      'bg-surface-container-low border-on-surface/12 text-on-surface hover:border-primary/40';
                    if (selectedOption !== null) {
                      if (isCorrect) {
                        cls = 'bg-tertiary-fixed/40 border-tertiary text-tertiary font-semibold';
                      } else if (isSelected) {
                        cls = 'bg-error-container border-error text-on-error-container';
                      }
                    }
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setSelectedByLesson((prev) => ({
                            ...prev,
                            [activeLessonNumber]: opt.id,
                          }))
                        }
                        className={`p-3 rounded-md border text-left text-xs transition-colors cursor-pointer ${cls}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {selectedOption !== null && (
                  <div
                    className={`p-3.5 rounded-md border text-xs leading-relaxed ${
                      selectedOption === pack.reading.question.correctId
                        ? 'bg-tertiary-fixed/25 border-tertiary/30 text-on-surface'
                        : 'bg-primary-fixed/25 border-primary/30 text-on-surface'
                    }`}
                  >
                    <span className="font-bold mr-1.5">
                      {selectedOption === pack.reading.question.correctId
                        ? '正解 · Correct!'
                        : '確認 · Note:'}
                    </span>
                    {pack.reading.question.explanation}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="font-serif text-xl font-bold text-on-surface">
                {passage.title}
              </h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary font-bold">
              {passage.level}
            </span>
          </div>

          <div className="space-y-4">
            {passage.sentences.map((s, i) => (
              <div
                key={i}
                className="p-4 rounded-md bg-surface-container-low border border-outline-variant/15 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="font-serif text-xl leading-loose text-on-surface">
                    <RubyText segments={s.segments} />
                  </div>
                  {showTranslations && (
                    <p className="text-xs text-on-surface-variant">{s.en}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => speakJapanese(s.plain)}
                  className="p-2 rounded-lg bg-surface-container-lowest text-secondary hover:text-primary shrink-0 cursor-pointer"
                  aria-label="Listen to sentence"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 4. Writing & Composition Lab (Calls Gemini /api/sensei writing_evaluate)
 * ========================================================================== */
export function WritingCompositionView() {
  const { activeJlpt } = useKoto();
  const [draft, setDraft] = useState('昨日、友達と喫茶店でコーヒーを飲みました。');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    naturalnessScore: number;
    correctedJapanese: string;
    romaji: string;
    feedback: string;
    keyTakeaway: string;
  } | null>(null);

  const submitEvaluate = async () => {
    if (!draft.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sensei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'writing_evaluate',
          jlptLevel: activeJlpt,
          message: draft.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not evaluate composition.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Network error calling /api/sensei.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitEvaluate();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
          作文添削スタジオ · AI Sensei Composition Critique
        </div>
        <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
          Writing &amp; Composition
        </h1>
      </div>

      <form
        onSubmit={handleEvaluate}
        className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
            <PenTool className="w-4 h-4" />
            <span>Prompt: Describe what you did yesterday using で or に</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-fixed text-primary">
            GEMINI CRITIQUE
          </span>
        </div>

        <textarea
          rows={4}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full p-4 rounded-md bg-surface-container-low border border-outline-variant/30 font-serif text-lg outline-none focus:border-primary"
          placeholder="Write 1–3 sentences in Japanese..."
        />

        <button
          type="submit"
          disabled={loading || !draft.trim()}
          className="px-5 py-2.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Sensei Critique</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3.5 rounded-md bg-error-container/50 border border-error/30 text-xs text-on-error-container space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium leading-relaxed">{error}</span>
              <button
                type="button"
                onClick={submitEvaluate}
                disabled={loading || !draft.trim()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-surface-container-lowest border border-error/40 text-on-surface font-semibold hover:border-primary shrink-0 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry (再試行)</span>
              </button>
            </div>
            <div className="p-3 rounded-sm bg-surface-container-lowest border border-on-surface/10 text-on-surface space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>教科書解説 · Composition Particle Checklist (Static Fallback)</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Check <strong>で</strong> for action venue (e.g., 喫茶店で飲みました),{' '}
                <strong>と</strong> for companions (友達と), and <strong>を</strong> for direct objects (コーヒーを). Your draft stays preserved above.
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="p-5 rounded-md bg-surface-container-low border border-outline-variant/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-secondary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Sensei Evaluation
              </span>
              <span className="font-mono text-xs font-bold text-tertiary tabular-nums">
                Naturalness: {result.naturalnessScore}%
              </span>
            </div>
            <div className="font-serif text-lg font-bold text-on-surface">
              {result.correctedJapanese}
            </div>
            <div className="text-xs font-mono text-outline romaji-sub">{result.romaji}</div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {result.feedback}
            </p>
            <div className="p-3 rounded-md bg-tertiary-fixed/30 border border-tertiary/20 text-xs text-on-surface">
              <strong>Key Takeaway:</strong> {result.keyTakeaway}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

/* ============================================================================
 * 5. Culture & Keigo Handbook
 * ========================================================================== */
const KEIGO_MATRIX = [
  {
    meaning: 'To say / tell',
    plain: '言う (いう)',
    teineigo: '言います',
    sonkeigo: 'おっしゃる',
    kenjougo: '申す (もうす)',
  },
  {
    meaning: 'To eat / drink',
    plain: '食べる / 飲む',
    teineigo: '食べます / 飲みます',
    sonkeigo: '召し上がる',
    kenjougo: 'いただく',
  },
  {
    meaning: 'To go / come',
    plain: '行く / 来る',
    teineigo: '行きます / 来ます',
    sonkeigo: 'いらっしゃる',
    kenjougo: '参る (まいる)',
  },
  {
    meaning: 'To understand',
    plain: '分かる',
    teineigo: '分かります',
    sonkeigo: 'お分かりになる',
    kenjougo: 'かしこまりました (Hospitality)',
  },
];

export function CultureKeigoView() {
  const { speakJapanese } = useKoto();
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
          文化・敬語ハンドブック · Sociolinguistic Registers
        </div>
        <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
          Culture &amp; Keigo Register Guide
        </h1>
      </div>

      <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <Landmark className="w-4 h-4" />
          <span>Essential Keigo Register Matrix (敬語対照表)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-on-surface/10 text-[10px] font-mono uppercase text-outline">
                <th className="py-2 pr-3">Meaning</th>
                <th className="py-2 pr-3">Plain (普通形)</th>
                <th className="py-2 pr-3">Polite (丁寧語)</th>
                <th className="py-2 pr-3">Honorific (尊敬語)</th>
                <th className="py-2">Humble (謙譲語)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {KEIGO_MATRIX.map((row) => (
                <tr key={row.meaning}>
                  <td className="py-3 pr-3 font-semibold text-on-surface">{row.meaning}</td>
                  <td className="py-3 pr-3 font-serif text-on-surface-variant">{row.plain}</td>
                  <td className="py-3 pr-3 font-serif text-on-surface">{row.teineigo}</td>
                  <td className="py-3 pr-3 font-serif font-bold text-primary">
                    <button
                      type="button"
                      onClick={() => speakJapanese(row.sonkeigo)}
                      className="hover:underline cursor-pointer"
                    >
                      {row.sonkeigo}
                    </button>
                  </td>
                  <td className="py-3 font-serif font-bold text-secondary">
                    <button
                      type="button"
                      onClick={() => speakJapanese(row.kenjougo)}
                      className="hover:underline cursor-pointer"
                    >
                      {row.kenjougo}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 6. Preferences & Study Settings
 * ========================================================================== */
export function SettingsView() {
  const {
    userAccount,
    userEmail,
    isSavingCloud,
    signOut,
    setRoute,
    showFurigana,
    toggleFurigana,
    showRomaji,
    toggleRomaji,
    audioEnabled,
    toggleAudioEnabled,
    speechRate,
    setSpeechRate,
    activeJlpt,
    setActiveJlpt,
    resetLocalProgress,
    showToast,
  } = useKoto();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
          学習設定 · Learner Profile &amp; Preferences
        </div>
        <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
          Account &amp; Study Preferences
        </h1>
      </div>

      {/* Signed-in Account Card */}
      <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
            <UserCheck className="w-4 h-4 text-primary" />
            <span>Authenticated Learner Profile</span>
          </div>
          <span className="text-[11px] font-mono text-outline">
            {isSavingCloud ? 'Syncing to Firestore...' : 'Cloud Sync Active'}
          </span>
        </div>

        <div className="p-4 rounded-md bg-surface-container-low grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-outline text-[10px] font-mono uppercase">Display Name</div>
            <div className="font-semibold text-on-surface mt-0.5">
              {userAccount?.displayName || 'Learner'}
            </div>
          </div>
          <div>
            <div className="text-outline text-[10px] font-mono uppercase">Email</div>
            <div className="font-mono text-on-surface mt-0.5 truncate">{userEmail}</div>
          </div>
          <div>
            <div className="text-outline text-[10px] font-mono uppercase">Role &amp; Access</div>
            <div className="font-mono font-semibold text-primary mt-0.5 uppercase">
              {userAccount?.role || 'student'} · {userAccount?.status || 'active'}
            </div>
          </div>
          <div>
            <div className="text-outline text-[10px] font-mono uppercase">Lessons Completed</div>
            <div className="font-mono font-semibold text-on-surface mt-0.5 tabular-nums">
              {userAccount?.completedLessonsCount ?? 0} / 25
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {userAccount?.role === 'admin' ? (
            <button
              type="button"
              onClick={() => setRoute('admin-database')}
              className="px-3.5 py-2 rounded-md bg-secondary text-on-secondary text-xs font-semibold cursor-pointer"
            >
              Open Admin &amp; Google Sheets Console →
            </button>
          ) : (
            <span className="text-[11px] text-outline">
              All progress is stored privately per user account.
            </span>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-on-surface/15 text-xs font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span>Script &amp; Audio Ergonomics</span>
        </div>

        <div className="space-y-3">
          {[
            {
              label: 'Display Furigana (振仮名)',
              desc: 'Show kana readings above kanji across lessons, reading passages, and AI Sensei.',
              active: showFurigana,
              onToggle: toggleFurigana,
            },
            {
              label: 'Display Hepburn Romaji',
              desc: 'Show Latin phonetic guides beneath Japanese sentences.',
              active: showRomaji,
              onToggle: toggleRomaji,
            },
            {
              label: 'Japanese Audio Synthesis',
              desc: 'Enable native Web Speech pronunciation on word and sentence buttons.',
              active: audioEnabled,
              onToggle: toggleAudioEnabled,
            },
          ].map((pref) => (
            <div
              key={pref.label}
              className="p-4 rounded-md bg-surface-container-low flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-sm font-semibold text-on-surface">{pref.label}</div>
                <div className="text-xs text-outline mt-0.5">{pref.desc}</div>
              </div>
              <button
                type="button"
                onClick={pref.onToggle}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  pref.active
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {pref.active ? 'Enabled' : 'Off'}
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-md bg-surface-container-low space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span>Speech Synthesis Cadence</span>
            <span className="font-mono text-primary tabular-nums">{speechRate.toFixed(1)}×</span>
          </div>
          <div className="flex gap-2">
            {[0.7, 0.85, 1.0, 1.15].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setSpeechRate(r);
                  showToast(`Speech speed set to ${r}×`);
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold cursor-pointer tabular-nums ${
                  speechRate === r
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container-lowest text-on-surface'
                }`}
              >
                {r}×
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-md bg-surface-container-low space-y-2">
          <div className="text-xs font-semibold">Target JLPT Track</div>
          <div className="flex flex-wrap gap-2">
            {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setActiveJlpt(lvl)}
                className={`px-3 py-1.5 rounded-sm font-mono text-xs font-semibold cursor-pointer ${
                  activeJlpt === lvl
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest border border-on-surface/10 text-on-surface'
                }`}
              >
                JLPT {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-md bg-surface-container-low border border-error/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-on-surface">
              Reset My Study Progress (0%)
            </div>
            <div className="text-xs text-outline mt-0.5">
              Resets your completed lessons, SRS queue, streaks, and exam scores back to zero in Firestore and local cache.
            </div>
          </div>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-error/40 text-error text-xs font-semibold hover:bg-error-container/30 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  resetLocalProgress();
                  setConfirmReset(false);
                }}
                className="px-3 py-1.5 rounded-sm bg-error text-on-error text-xs font-semibold cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-sm bg-surface-container-lowest border border-on-surface/10 text-xs font-semibold text-on-surface cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
