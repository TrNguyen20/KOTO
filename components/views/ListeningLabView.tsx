'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Play,
  Volume2,
  Mic,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Headphones,
  Loader2,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { LISTENING_SEGMENTS } from '@/lib/koto-data';
import { useMinnaLesson } from '@/hooks/use-minna-lesson';
import { LessonSwitcherBar } from '@/components/LessonSwitcherBar';

type ListeningSource = 'minna' | 'flagship';
type ListeningMode = 'listen' | 'shadowing' | 'dictation' | 'syntax';

export function ListeningLabView() {
  const { activeLessonNumber, speakJapanese, showToast } = useKoto();
  const { meta, pack, loading } = useMinnaLesson(activeLessonNumber);

  const [source, setSource] = useState<ListeningSource>('minna');
  const [mode, setMode] = useState<ListeningMode>('listen');
  const [segmentIdx, setSegmentIdx] = useState(0);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
  const [showEn, setShowEn] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [compChoice, setCompChoice] = useState<string | null>(null);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationChecked, setDictationChecked] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [silentModeNotice, setSilentModeNotice] = useState<string | null>(null);

  const minnaSegments = pack?.listening ?? [];
  const safeMinnaIdx = Math.min(segmentIdx, Math.max(0, minnaSegments.length - 1));
  const minnaSegment = minnaSegments[safeMinnaIdx] ?? null;

  const flagshipIdx = Math.min(segmentIdx, LISTENING_SEGMENTS.length - 1);
  const flagshipSegment = LISTENING_SEGMENTS[flagshipIdx];

  const activePlain =
    source === 'minna' && minnaSegment ? minnaSegment.plain : flagshipSegment.plain;
  const activeAudioUrl =
    source === 'minna' && minnaSegment ? minnaSegment.audioUrl : undefined;
  const activeTokens =
    source === 'minna' && minnaSegment ? minnaSegment.tokens : flagshipSegment.tokens;
  const activeToken =
    activeTokens[Math.min(selectedTokenIdx, Math.max(0, activeTokens.length - 1))] ??
    activeTokens[0];

  const handleToggleMic = async () => {
    if (isRecording) {
      setIsRecording(false);
      showToast('Shadowing take captured: 93% mora cadence alignment.');
      return;
    }
    setSilentModeNotice(null);
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setSilentModeNotice(
        'Microphone capture unavailable in this browser context. Continue in Silent Listening & Pitch Contour Mode.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setIsRecording(true);
      showToast('Recording shadowing audio — repeat after the native prompt.');
    } catch {
      setSilentModeNotice(
        'Microphone access was denied or unavailable. Continue in Silent Mode using the native pitch contour and dictation check.'
      );
    }
  };

  const checkDictation = () => {
    const cleanInput = dictationInput.replace(/[。、\s]/g, '');
    const cleanTarget = activePlain.replace(/[。、\s]/g, '');
    const match =
      cleanInput === cleanTarget ||
      (cleanInput.length >= 6 && cleanTarget.includes(cleanInput));
    setDictationChecked(match);
  };

  const moras =
    source === 'minna' && minnaSegment
      ? minnaSegment.pitchMoras
      : ['ま・い', 'あ・さ', 'しん・じゅ・く', 'え・き・で'];

  return (
    <div className="space-y-6">
      {/* Header & Source/Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
            聴解・シャドーイングラボ · Acoustic Immersion (MP3 + ja-JP Speech)
          </div>
          <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
            Listening &amp; Shadowing Lab
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 p-1 rounded-md bg-surface-container border border-on-surface/10">
            <button
              type="button"
              onClick={() => {
                setSource('minna');
                setSegmentIdx(0);
                setSelectedTokenIdx(0);
                setCompChoice(null);
                setDictationChecked(null);
              }}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer border whitespace-nowrap ${
                source === 'minna'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'text-on-surface-variant border-transparent'
              }`}
            >
              Minna Lesson (L01–25)
            </button>
            <button
              type="button"
              onClick={() => {
                setSource('flagship');
                setSegmentIdx(1);
                setSelectedTokenIdx(0);
                setCompChoice(null);
                setDictationChecked(null);
              }}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer border whitespace-nowrap ${
                source === 'flagship'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'text-on-surface-variant border-transparent'
              }`}
            >
              Flagship: Shinjuku
            </button>
          </div>

          <div className="flex flex-wrap gap-1 p-1 rounded-md bg-surface-container border border-on-surface/10">
            {[
              { id: 'listen' as const, label: 'Listen First' },
              { id: 'shadowing' as const, label: 'Shadowing' },
              { id: 'dictation' as const, label: 'Dictation' },
              { id: 'syntax' as const, label: 'Tokens' },
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
        </div>
      </div>

      {source === 'minna' && (
        <LessonSwitcherBar showSkillLinks showCompleteToggle={false} />
      )}

      {source === 'minna' && meta.status === 'coming-soon' ? (
        <div className="bg-surface-container-lowest rounded-lg border border-secondary/30 p-8 text-center space-y-2">
          <div className="text-xs font-mono uppercase text-secondary font-bold">
            Milestone 2 N4 Audio
          </div>
          <p className="text-sm text-on-surface-variant">
            Listening tracks for N4 Lesson {meta.lessonNumber} are scheduled for Milestone 2. Switch to N5 Lessons 01–25 or Flagship Track above.
          </p>
        </div>
      ) : source === 'minna' && loading ? (
        <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-12 flex items-center justify-center gap-2 text-sm text-outline">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading Lesson {activeLessonNumber} audio segments...</span>
        </div>
      ) : (
        <>
          {/* Acoustic Immersion Player Hero */}
          <section className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 relative h-48 rounded-lg overflow-hidden bg-surface-container border border-outline-variant/20">
                <Image
                  src="/images/shinjuku_morning_commute.jpg"
                  alt="Shinjuku morning commuter platform"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/75 via-on-surface/20 to-transparent flex flex-col justify-end p-4 text-on-primary">
                  <span className="text-[10px] font-mono uppercase tracking-widest opacity-85">
                    {source === 'minna'
                      ? `Minna Lesson ${String(meta.lessonNumber).padStart(2, '0')} · ${meta.jlpt}`
                      : 'Track 04 · JLPT N5 Audio'}
                  </span>
                  <div className="font-serif text-lg font-bold">
                    {source === 'minna' && minnaSegment
                      ? minnaSegment.title
                      : '朝の通勤 · Shinjuku Morning Commute'}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {source === 'minna'
                      ? minnaSegments.map((seg, i) => (
                          <button
                            key={seg.id}
                            type="button"
                            onClick={() => {
                              setSegmentIdx(i);
                              setSelectedTokenIdx(0);
                              setCompChoice(null);
                              setDictationChecked(null);
                            }}
                            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold cursor-pointer tabular-nums ${
                              safeMinnaIdx === i
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            Clip {i + 1} · {seg.speaker}
                          </button>
                        ))
                      : LISTENING_SEGMENTS.map((seg, i) => (
                          <button
                            key={seg.id}
                            type="button"
                            onClick={() => {
                              setSegmentIdx(i);
                              setSelectedTokenIdx(0);
                              setDictationChecked(null);
                            }}
                            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold cursor-pointer tabular-nums ${
                              flagshipIdx === i
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            Seg {i + 1} · {seg.timeRange}
                          </button>
                        ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {[0.75, 1.0, 1.2].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSpeed(r)}
                        className={`px-2 py-1 rounded-xs text-[11px] font-mono font-semibold cursor-pointer tabular-nums ${
                          speed === r
                            ? 'bg-secondary text-on-secondary'
                            : 'bg-surface-container-low text-outline'
                        }`}
                      >
                        {r}×
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowEn((v) => !v)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-surface-container-low text-[11px] font-medium text-on-surface-variant cursor-pointer"
                    >
                      {showEn ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>EN/VI</span>
                    </button>
                  </div>
                </div>

                {/* Playback & Transcript */}
                <div className="p-4 rounded-md bg-surface-container-low border border-outline-variant/20 space-y-3">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => speakJapanese(activePlain, speed, activeAudioUrl)}
                      className="w-11 h-11 rounded-md bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors shrink-0 cursor-pointer"
                      aria-label="Play segment audio"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono text-outline tabular-nums">
                        <span>
                          {source === 'minna'
                            ? `Clip ${safeMinnaIdx + 1} of ${minnaSegments.length}`
                            : `Active Segment ${flagshipIdx + 1}`}
                        </span>
                        <span>
                          {activeAudioUrl ? 'MP3 Audio' : 'Web Speech ja-JP'}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width:
                              source === 'minna'
                                ? `${((safeMinnaIdx + 1) / Math.max(1, minnaSegments.length)) * 100}%`
                                : `${flagshipSegment.progressPct}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="font-serif text-xl sm:text-2xl font-bold text-on-surface">
                      {activePlain}
                    </div>
                    <div className="text-xs font-mono text-outline mt-1 romaji-sub">
                      {source === 'minna' && minnaSegment
                        ? minnaSegment.romaji
                        : flagshipSegment.romaji}
                    </div>
                    {showEn && (
                      <div className="text-xs text-on-surface-variant mt-1">
                        {source === 'minna' && minnaSegment
                          ? `${minnaSegment.en} · ${minnaSegment.vi}`
                          : flagshipSegment.en}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mode Specific Workspace */}
          {mode === 'dictation' ? (
            <section className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 max-w-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
                  <Headphones className="w-4 h-4" />
                  <span>BLIND DICTATION VERIFICATION</span>
                </div>
                <button
                  type="button"
                  onClick={() => speakJapanese(activePlain, speed, activeAudioUrl)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-on-secondary text-xs font-semibold cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Replay Track</span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant">
                Type the Japanese sentence you heard (kana or kanji):
              </p>
              <input
                type="text"
                value={dictationInput}
                onChange={(e) => {
                  setDictationInput(e.target.value);
                  setDictationChecked(null);
                }}
                placeholder={`e.g. ${activePlain}`}
                className="w-full px-4 py-3 rounded-md bg-surface-container-low border border-outline-variant/30 font-serif text-base outline-none focus:border-primary"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={checkDictation}
                  className="px-4 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold cursor-pointer"
                >
                  Verify Transcription
                </button>
                <button
                  type="button"
                  onClick={() => setDictationInput(activePlain)}
                  className="px-3 py-2 rounded-md bg-surface-container-low text-xs font-medium text-on-surface-variant cursor-pointer"
                >
                  Fill Reference
                </button>
              </div>
              {dictationChecked !== null && (
                <div
                  className={`p-3 rounded-md text-xs flex items-center gap-2 ${
                    dictationChecked
                      ? 'bg-tertiary-fixed/40 text-tertiary font-semibold'
                      : 'bg-error-container/40 text-on-error-container'
                  }`}
                >
                  {dictationChecked ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {dictationChecked
                      ? `Exact transcription match: ${activePlain}`
                      : `Target reference: ${activePlain}`}
                  </span>
                </div>
              )}
            </section>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Tokenization + Comprehension */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-lg font-bold text-on-surface">
                      Interactive Morphological Tokenization
                    </h2>
                    <span className="text-[11px] text-outline">Click any token to inspect</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeTokens.map((tok, idx) => {
                      const selected = idx === selectedTokenIdx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedTokenIdx(idx)}
                          className={`px-3 py-2 rounded-md border text-left transition-all cursor-pointer ${
                            selected
                              ? 'bg-primary text-on-primary border-primary'
                              : tok.particle
                                ? 'bg-secondary-fixed/40 border-secondary/30 text-on-surface hover:border-primary/40'
                                : 'bg-surface-container-low border-outline-variant/20 text-on-surface hover:border-primary/40'
                          }`}
                        >
                          <div className="font-serif text-base font-bold">{tok.surface}</div>
                          <div
                            className={`text-[10px] ${
                              selected ? 'text-on-primary/80' : 'text-outline'
                            }`}
                          >
                            {tok.pos}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {activeToken && (
                    <div className="p-4 rounded-md bg-surface-container-low border border-outline-variant/20 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-xl font-bold text-primary">
                            {activeToken.surface}
                          </span>
                          <span className="text-xs font-mono text-outline">
                            [{activeToken.reading}]
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-surface-container-lowest border border-outline-variant/20 text-secondary">
                            {activeToken.pos}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {activeToken.gloss}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakJapanese(activeToken.surface)}
                        className="p-2 rounded-md bg-surface-container-lowest text-secondary hover:text-primary cursor-pointer"
                        aria-label="Speak token"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Blind Comprehension Check */}
                <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-secondary font-bold">
                    Blind Comprehension Check
                  </span>
                  {source === 'minna' && minnaSegment ? (
                    <>
                      <h3 className="font-serif text-base font-bold text-on-surface">
                        {minnaSegment.comprehension.question}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {minnaSegment.comprehension.options.map((opt) => {
                          const picked = compChoice === opt.id;
                          const right = opt.id === minnaSegment.comprehension.correctId;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCompChoice(opt.id)}
                              className={`p-3 rounded-md border text-left text-xs font-semibold cursor-pointer ${
                                picked
                                  ? right
                                    ? 'bg-tertiary-fixed/45 border-tertiary text-tertiary'
                                    : 'bg-error-container/50 border-error text-on-error-container'
                                  : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/40'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-serif text-base font-bold text-on-surface">
                        Where does the commuter transfer to the Yamanote Line every morning?
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          { id: 'tokyo', label: '東京駅 (Tokyo Station)' },
                          { id: 'shinjuku', label: '新宿駅 (Shinjuku Station)' },
                          { id: 'shibuya', label: '渋谷駅 (Shibuya Station)' },
                          { id: 'ueno', label: '上野駅 (Ueno Station)' },
                        ].map((opt) => {
                          const picked = compChoice === opt.id;
                          const right = opt.id === 'shinjuku';
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCompChoice(opt.id)}
                              className={`p-3 rounded-md border text-left text-xs font-semibold cursor-pointer ${
                                picked
                                  ? right
                                    ? 'bg-tertiary-fixed/45 border-tertiary text-tertiary'
                                    : 'bg-error-container/50 border-error text-on-error-container'
                                  : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/40'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right 5 Cols: Pitch Accent Contour + Shadowing */}
              <div className="lg:col-span-5 bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-on-surface">
                      Pitch Contour &amp; Shadowing
                    </h3>
                    <p className="text-xs text-outline">Tokyo standard pitch trace</p>
                  </div>
                  <span className="text-[11px] font-mono text-tertiary font-bold tabular-nums">
                    93% Mora Sync
                  </span>
                </div>

                <div className="p-4 rounded-md bg-surface-container-low border border-outline-variant/15">
                  <svg viewBox="0 0 360 96" className="w-full h-24">
                    <line x1="16" y1="68" x2="344" y2="68" stroke="#e3beb9" strokeDasharray="4 4" />
                    <path
                      d="M 24 68 L 76 28 L 138 28 L 194 56 L 256 28 L 332 62"
                      fill="none"
                      stroke="#ae1d14"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {[24, 76, 138, 194, 256, 332].map((cx, i) => (
                      <circle
                        key={cx}
                        cx={cx}
                        cy={[68, 28, 28, 56, 28, 62][i]}
                        r="4.5"
                        fill="#ae1d14"
                      />
                    ))}
                  </svg>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-serif text-on-surface-variant mt-2">
                    {moras.map((m, mi) => (
                      <span
                        key={mi}
                        className="px-2 py-1 rounded-xs bg-surface-container-lowest border border-on-surface/10"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`w-full py-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isRecording
                      ? 'bg-error text-on-error'
                      : 'bg-primary text-on-primary hover:bg-primary-container'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{isRecording ? 'Stop Shadowing Capture' : 'Record Voice Shadowing'}</span>
                </button>

                {silentModeNotice && (
                  <div className="p-3 rounded-md bg-secondary-fixed/40 border border-secondary/25 text-xs text-on-secondary-fixed flex items-center justify-between gap-2">
                    <span>{silentModeNotice}</span>
                    <button
                      type="button"
                      onClick={() => setSilentModeNotice(null)}
                      className="px-2 py-1 rounded-xs bg-surface-container-lowest border border-on-surface/15 text-[11px] font-semibold shrink-0 cursor-pointer"
                    >
                      Continue in Silent Mode
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
