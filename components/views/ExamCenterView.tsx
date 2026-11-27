'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  Timer,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { MOCK_EXAM_QUESTIONS, SPRINT_QUESTIONS } from '@/lib/koto-data';

type ExamTab = 'arena' | 'telemetry' | 'weakness' | 'history';

const SKILL_SPECTRUM = [
  { label: 'Vocabulary (語彙)', pct: 86, color: 'bg-tertiary' },
  { label: 'Kanji Recognition (漢字)', pct: 84, color: 'bg-tertiary' },
  { label: 'Particle Accuracy (助詞)', pct: 74, color: 'bg-primary' },
  { label: 'Verb Conjugation (活用)', pct: 81, color: 'bg-secondary' },
  { label: 'Reading Comp (読解)', pct: 79, color: 'bg-secondary' },
  { label: 'Listening Speed (聴解)', pct: 76, color: 'bg-primary' },
];

export function ExamCenterView() {
  const { addSrsCard, openGrammar, setRoute, showToast } = useKoto();

  const [tab, setTab] = useState<ExamTab>('arena');
  const [activeQNum, setActiveQNum] = useState(18);

  // Playable Timed Sprint Runner (monotonic performance.now deadline)
  const [sprintActive, setSprintActive] = useState(false);
  const [sprintIdx, setSprintIdx] = useState(0);
  const [sprintAnswers, setSprintAnswers] = useState<Record<string, number>>({});
  const [sprintSeconds, setSprintSeconds] = useState(180);
  const [sprintDone, setSprintDone] = useState(false);
  const endTimeMsRef = useRef<number | null>(null);
  const sprintSubmittingRef = useRef(false);

  useEffect(() => {
    if (!sprintActive || sprintDone) return;
    const t = setInterval(() => {
      if (endTimeMsRef.current === null) return;
      const remaining = Math.max(
        0,
        Math.ceil((endTimeMsRef.current - performance.now()) / 1000)
      );
      setSprintSeconds(remaining);
      if (remaining <= 0) {
        setSprintDone(true);
        setSprintActive(false);
        endTimeMsRef.current = null;
        showToast('Time expired — Sprint automatically graded!');
      }
    }, 250);
    return () => clearInterval(t);
  }, [sprintActive, sprintDone, showToast]);

  const activeQuestion =
    MOCK_EXAM_QUESTIONS.find((q) => q.num === activeQNum) ?? MOCK_EXAM_QUESTIONS[17];

  const startSprint = () => {
    sprintSubmittingRef.current = false;
    endTimeMsRef.current = performance.now() + 180 * 1000;
    setSprintActive(true);
    setSprintDone(false);
    setSprintIdx(0);
    setSprintAnswers({});
    setSprintSeconds(180);
  };

  const handleSubmitSprint = () => {
    if (sprintSubmittingRef.current || sprintDone || !sprintActive) return;
    sprintSubmittingRef.current = true;
    if (endTimeMsRef.current !== null) {
      const remaining = Math.max(
        0,
        Math.ceil((endTimeMsRef.current - performance.now()) / 1000)
      );
      setSprintSeconds(remaining);
      endTimeMsRef.current = null;
    }
    setSprintDone(true);
    setSprintActive(false);
    showToast('Timed Sprint graded!');
  };

  const sprintScore = SPRINT_QUESTIONS.reduce(
    (acc, q) => acc + (sprintAnswers[q.id] === q.correct ? 1 : 0),
    0
  );

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Workspace Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
            模擬試験センター · Benchmark &amp; Weakness Analytics
          </div>
          <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
            JLPT Exam Center &amp; Analytics
          </h1>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-md bg-surface-container border border-on-surface/10">
          {[
            { id: 'arena' as const, label: 'Mock Arena' },
            { id: 'telemetry' as const, label: 'Readiness Telemetry' },
            { id: 'weakness' as const, label: 'Weakness Matrix' },
            { id: 'history' as const, label: 'Historical Exams' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer border ${
                tab === t.id
                  ? 'bg-surface-container-lowest text-primary border-on-surface/15'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Readiness Banner + 3 KPI Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              JLPT N5 Pass Projection
            </div>
            <div className="font-serif text-3xl font-bold text-on-surface tabular-nums">
              148 <span className="text-base font-normal text-outline">/ 180 pts</span>
            </div>
            <p className="text-xs text-tertiary font-semibold">
              +68 pts above official 80-pt passing threshold · High Confidence
            </p>
          </div>
          <div className="w-16 h-16 rounded-xs border-2 border-primary/80 flex flex-col items-center justify-center font-serif text-primary rotate-[-4deg] bg-primary-fixed/15 shrink-0">
            <span className="text-base font-bold">合格</span>
            <span className="text-[10px] font-mono">82%</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5">
          <div className="text-[10px] font-mono uppercase text-outline">Mock #03 Score</div>
          <div className="font-mono text-2xl font-bold text-on-surface mt-1 tabular-nums">
            31 / 35
          </div>
          <div className="text-xs text-tertiary mt-1">88.6% Accuracy</div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5">
          <div className="text-[10px] font-mono uppercase text-outline">Avg Pace</div>
          <div className="font-mono text-2xl font-bold text-on-surface mt-1 tabular-nums">
            41s
          </div>
          <div className="text-xs text-secondary mt-1">Per question item</div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5">
          <div className="text-[10px] font-mono uppercase text-outline">Trap Items</div>
          <div className="font-mono text-2xl font-bold text-primary mt-1 tabular-nums">
            4 Errors
          </div>
          <div className="text-xs text-outline mt-1">Particles &amp; Counters</div>
        </div>
      </section>

      {tab === 'telemetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4">
            <h2 className="font-serif text-lg font-bold text-on-surface">
              Six-Core Skill Spectrum
            </h2>
            <div className="space-y-3">
              {SKILL_SPECTRUM.map((sk) => (
                <div key={sk.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-on-surface">{sk.label}</span>
                    <span className="font-mono font-bold text-on-surface tabular-nums">
                      {sk.pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className={`h-full ${sk.color}`} style={{ width: `${sk.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-on-surface">
                Retention Velocity Curve
              </h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary">
                <TrendingUp className="w-3.5 h-3.5" /> +18% over 4 mocks
              </span>
            </div>
            <div className="p-4 rounded-md bg-surface-container-low">
              <svg viewBox="0 0 360 120" className="w-full h-28">
                <path
                  d="M 20 96 C 90 88, 140 66, 195 54 C 250 42, 300 28, 340 20"
                  fill="none"
                  stroke="#485f84"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {[20, 125, 230, 340].map((cx, i) => (
                  <circle
                    key={cx}
                    cx={cx}
                    cy={[96, 70, 44, 20][i]}
                    r="5"
                    fill="#ae1d14"
                  />
                ))}
              </svg>
              <div className="flex justify-between text-[11px] font-mono text-outline mt-1">
                <span>Diagnostic (64%)</span>
                <span>Mock #01 (74%)</span>
                <span>Mock #02 (81%)</span>
                <span>Mock #03 (89%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'weakness' && (
        <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-4">
          <h2 className="font-serif text-xl font-bold text-on-surface">
            Targeted Weakness Prescription
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-md bg-primary-fixed/20 border border-primary/25 space-y-2">
              <div className="text-xs font-mono font-bold text-primary">
                PRIORITY 1 · TRANSIT ALIGHTING (電車を降りる)
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Confused に vs を when exiting vehicles. Pair station venues with で and departed vehicles with を.
              </p>
              <button
                type="button"
                onClick={() => openGrammar('ni-vs-de')}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold cursor-pointer"
              >
                Open Particle Studio
              </button>
            </div>
            <div className="p-4 rounded-md bg-secondary-fixed/25 border border-secondary/25 space-y-2">
              <div className="text-xs font-mono font-bold text-secondary">
                PRIORITY 2 · IRREGULAR PEOPLE COUNTERS
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                1人 (ひとり) and 2人 (ふたり) follow native Yamato readings before switching to -にん at 3人.
              </p>
              <button
                type="button"
                onClick={() => setRoute('ai-sensei-tutor')}
                className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-semibold cursor-pointer"
              >
                Run Counter Micro-Drill
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-3">
          <h2 className="font-serif text-xl font-bold text-on-surface">
            Historical Exam Archive
          </h2>
          {[
            { name: 'JLPT N5 Full Simulation #03', date: '2 days ago', score: '148 / 180', pass: true },
            { name: 'JLPT N5 Grammar & Reading Mock #02', date: '9 days ago', score: '134 / 180', pass: true },
            { name: 'JLPT N5 Baseline Diagnostic', date: '18 days ago', score: '108 / 180', pass: true },
          ].map((h) => (
            <div
              key={h.name}
              className="p-4 rounded-md bg-surface-container-low border border-outline-variant/15 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-on-surface">{h.name}</div>
                <div className="text-xs text-outline">{h.date}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-bold text-primary tabular-nums">
                  {h.score}
                </div>
                <div className="text-[10px] font-mono text-tertiary uppercase">Passed</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'arena' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 4 Cols: Timed Sprint Runner + 35 Question Grid */}
          <div className="lg:col-span-5 space-y-5">
            {/* Playable 3-Min Sprint Arena */}
            <div className="bg-surface-container-lowest rounded-lg border border-primary/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <h2 className="font-serif text-base font-bold text-on-surface">
                    Timed Grammar Sprint (5 Items)
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary tabular-nums">
                  <Timer className="w-3.5 h-3.5" />
                  {formatTimer(sprintSeconds)}
                </span>
              </div>

              {!sprintActive && !sprintDone && (
                <div className="space-y-3">
                  <p className="text-xs text-on-surface-variant">
                    Launch a 3-minute N5 spatial particle &amp; counter timed simulation under exam pressure.
                  </p>
                  <button
                    type="button"
                    onClick={startSprint}
                    className="w-full py-2.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Timed Sprint</span>
                  </button>
                </div>
              )}

              {sprintActive && !sprintDone && (
                <div className="space-y-3">
                  <div className="text-[11px] font-mono text-outline">
                    Item {sprintIdx + 1} of {SPRINT_QUESTIONS.length}
                  </div>
                  <div className="font-serif text-base font-bold text-on-surface">
                    {SPRINT_QUESTIONS[sprintIdx].prompt}
                  </div>
                  <div className="text-xs text-outline">
                    {SPRINT_QUESTIONS[sprintIdx].en}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SPRINT_QUESTIONS[sprintIdx].options.map((opt, oIdx) => {
                      const picked = sprintAnswers[SPRINT_QUESTIONS[sprintIdx].id] === oIdx;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setSprintAnswers((prev) => ({
                              ...prev,
                              [SPRINT_QUESTIONS[sprintIdx].id]: oIdx,
                            }))
                          }
                          className={`py-2 px-3 rounded-md border font-serif text-sm font-bold cursor-pointer ${
                            picked
                              ? 'bg-primary text-on-primary border-primary'
                              : 'bg-surface-container-low border-on-surface/10 text-on-surface'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between pt-1">
                    <button
                      type="button"
                      disabled={sprintIdx === 0}
                      onClick={() => setSprintIdx((i) => Math.max(0, i - 1))}
                      className="text-xs text-outline disabled:opacity-40 cursor-pointer"
                    >
                      ← Prev
                    </button>
                    {sprintIdx + 1 < SPRINT_QUESTIONS.length ? (
                      <button
                        type="button"
                        onClick={() => setSprintIdx((i) => i + 1)}
                        className="px-3 py-1 rounded-sm bg-secondary text-on-secondary text-xs font-semibold cursor-pointer"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitSprint}
                        className="px-3 py-1 rounded-sm bg-tertiary text-on-tertiary text-xs font-semibold cursor-pointer"
                      >
                        Submit Sprint
                      </button>
                    )}
                  </div>
                </div>
              )}

              {sprintDone && (
                <div className="space-y-3">
                  <div className="p-3 rounded-md bg-tertiary-fixed/35 border border-tertiary/25 text-xs">
                    <strong className="text-tertiary font-mono tabular-nums">
                      Sprint Score: {sprintScore} / {SPRINT_QUESTIONS.length}
                    </strong>
                    <div className="text-on-surface-variant mt-1">
                      Time remaining: {formatTimer(sprintSeconds)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={startSprint}
                    className="w-full py-2 rounded-md bg-surface-container-low text-xs font-semibold text-on-surface cursor-pointer"
                  >
                    Retake Timed Sprint
                  </button>
                </div>
              )}
            </div>

            {/* 35 Question Chip Grid */}
            <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-on-surface">
                  Mock Exam #03 Item Map
                </h3>
                <span className="text-[11px] font-mono text-outline">35 Items</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {MOCK_EXAM_QUESTIONS.map((q) => {
                  const selected = q.num === activeQNum;
                  const statusSymbol =
                    q.status === 'error' ? '✕' : q.status === 'flagged' ? '⚑' : '✓';
                  return (
                    <button
                      key={q.num}
                      type="button"
                      onClick={() => setActiveQNum(q.num)}
                      aria-label={`Question ${q.num}, ${q.status}`}
                      className={`h-8 px-1 rounded-sm font-mono text-[11px] font-bold transition-all cursor-pointer tabular-nums flex items-center justify-center gap-0.5 border ${
                        selected
                          ? 'ring-2 ring-on-surface ring-offset-1 '
                          : ''
                      }${
                        q.status === 'error'
                          ? 'bg-error-container border-error/30 text-on-error-container'
                          : q.status === 'flagged'
                            ? 'bg-secondary-fixed border-secondary/30 text-secondary'
                            : 'bg-tertiary-fixed/60 border-tertiary/25 text-tertiary'
                      }`}
                    >
                      <span>{q.num}</span>
                      <span className="text-[9px] opacity-80" aria-hidden="true">
                        {statusSymbol}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Deep Dissection Inspector */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-lg border border-on-surface/10 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-outline-variant/15">
              <div>
                <div className="text-[11px] font-mono text-outline">
                  {activeQuestion.section}
                </div>
                <h2 className="font-serif text-xl font-bold text-on-surface mt-0.5 tabular-nums">
                  Question #{activeQuestion.num} Dissection
                </h2>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold tabular-nums ${
                  activeQuestion.status === 'error'
                    ? 'bg-error-container text-on-error-container'
                    : activeQuestion.status === 'flagged'
                      ? 'bg-secondary-fixed text-secondary'
                      : 'bg-tertiary-fixed text-tertiary'
                }`}
              >
                {activeQuestion.status.toUpperCase()} · {activeQuestion.timeSpent}s
              </span>
            </div>

            <div className="p-4 rounded-md bg-surface-container-low border border-outline-variant/20 space-y-1.5">
              <div className="font-serif text-xl font-bold text-on-surface">
                {activeQuestion.sentenceBefore}
                <span className="inline-block px-3 py-0.5 mx-1.5 rounded bg-primary-fixed text-primary font-mono text-base">
                  [ {activeQuestion.correctChoice} ]
                </span>
                {activeQuestion.sentenceAfter}
              </div>
              <div className="text-xs text-on-surface-variant">
                {activeQuestion.english}
              </div>
            </div>

            <div className="space-y-2.5">
              {activeQuestion.options.map((opt) => {
                const isUser = opt.code === activeQuestion.userChoice;
                const isCorrect = opt.code === activeQuestion.correctChoice;
                return (
                  <div
                    key={opt.code}
                    className={`p-3.5 rounded-md border space-y-1 ${
                      isCorrect
                        ? 'bg-tertiary-fixed/30 border-tertiary/35'
                        : isUser
                          ? 'bg-error-container/35 border-error/35'
                          : 'bg-surface-container-low/60 border-outline-variant/15'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="font-serif text-sm text-on-surface">
                        {opt.label}
                      </span>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-tertiary">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : isUser ? (
                        <span className="inline-flex items-center gap-1 text-error">
                          <XCircle className="w-3.5 h-3.5" /> Your Pick
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {opt.note}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-md bg-secondary-fixed/25 border border-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2 text-xs text-on-surface">
                <AlertCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>{activeQuestion.senseiNote}</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  addSrsCard({
                    front: `${activeQuestion.sentenceBefore} [${activeQuestion.correctChoice}] ${activeQuestion.sentenceAfter}`,
                    reading: activeQuestion.options.find(
                      (o) => o.code === activeQuestion.correctChoice
                    )?.label ?? '',
                    meaning: activeQuestion.english,
                    jlpt: 'N5',
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold shrink-0 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Add Pair to SRS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
