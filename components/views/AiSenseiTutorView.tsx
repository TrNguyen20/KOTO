'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Volume2,
  Send,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  ShieldCheck,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { RubySegment, SENSEI_SCENARIOS, SenseiScenario } from '@/lib/koto-data';
import { RubyText } from '@/components/RubyText';

interface ChatTurn {
  id: string;
  role: 'sensei' | 'user';
  senderName: string;
  time: string;
  japanese: string;
  segments: RubySegment[];
  romaji: string;
  english: string;
  hint?: string;
  cultureMemo?: string;
  naturalnessScore?: number;
  pitchNote?: string;
  verifiedTag?: string;
}

interface MorphToken {
  surface: string;
  reading: string;
  partOfSpeech: string;
  explanation: string;
}

const DEFAULT_MORPH_TOKENS: MorphToken[] = [
  {
    surface: '一人',
    reading: 'ひとり',
    partOfSpeech: 'Irregular Counter',
    explanation: 'Native Yamato counter for 1 person (never いちにん).',
  },
  {
    surface: 'で',
    reading: 'de',
    partOfSpeech: 'Scope Particle',
    explanation: 'Marks group size / condition ("as one person").',
  },
  {
    surface: '窓際',
    reading: 'まどぎわ',
    partOfSpeech: 'Compound Noun',
    explanation: 'By the window / window-side seating.',
  },
  {
    surface: 'かしこまりました',
    reading: 'kashikomarimashita',
    partOfSpeech: 'Sonkeigo / Teineigo',
    explanation: 'Elevated hospitality confirmation ("Certainly, right away").',
  },
];

const COUNTER_DRILL = [
  { count: '1人', reading: 'ひとり', romaji: 'hitori', note: 'Irregular Yamato' },
  { count: '2人', reading: 'ふたり', romaji: 'futari', note: 'Irregular Yamato' },
  { count: '3人', reading: 'さんにん', romaji: 'sannin', note: 'Regular -nin' },
  { count: '4人', reading: 'よにん', romaji: 'yonin', note: 'Shortened yo-' },
];

const SCENARIO_FALLBACK_TIPS: Record<
  string,
  { pattern: string; romaji: string; note: string }
> = {
  'cafe-ordering': {
    pattern: '「一人でお願いします」 / 「アイスコーヒーを一つください」',
    romaji: 'Hitori de onegaishimasu / Aisu koohii wo hitotsu kudasai',
    note: 'Use で after irregular person counters (一人・二人) to state party size, and を + native counter (一つ) when ordering items.',
  },
  'station-transfer': {
    pattern: '「新宿駅で山手線に乗り換えますか」',
    romaji: 'Shinjuku-eki de Yamanote-sen ni norikaemasu ka',
    note: 'Use で to mark the station venue where the transfer action happens, and に to mark the target line you board.',
  },
  'university-seminar': {
    pattern: '「田中と申します。言語学を専攻しています」',
    romaji: 'Tanaka to moushimasu. Gengogaku wo senkou shite imasu',
    note: 'Use 謙譲語 (申す) when stating your own name to professors or senior peers in an academic seminar.',
  },
};

export function AiSenseiTutorView() {
  const { activeJlpt, speakJapanese, openGrammar, setRoute, showToast } = useKoto();

  const [scenarioId, setScenarioId] = useState(SENSEI_SCENARIOS[0].id);
  const activeScenario: SenseiScenario =
    SENSEI_SCENARIOS.find((s) => s.id === scenarioId) ?? SENSEI_SCENARIOS[0];

  const [registerPolicy, setRegisterPolicy] = useState<
    'Strict Grammar (厳格文法)' | 'Tokyo Casual Polite (東京日常会話)'
  >('Tokyo Casual Polite (東京日常会話)');

  const [turnsByScenario, setTurnsByScenario] = useState<Record<string, ChatTurn[]>>(() => {
    const map: Record<string, ChatTurn[]> = {};
    for (const sc of SENSEI_SCENARIOS) {
      map[sc.id] = sc.initialTurns;
    }
    return map;
  });

  const [suggestionsByScenario, setSuggestionsByScenario] = useState<
    Record<string, { jp: string; en: string }[]>
  >(() => {
    const map: Record<string, { jp: string; en: string }[]> = {};
    for (const sc of SENSEI_SCENARIOS) {
      map[sc.id] = sc.suggestedReplies;
    }
    return map;
  });

  const [morphTokens, setMorphTokens] = useState<MorphToken[]>(DEFAULT_MORPH_TOKENS);
  const [cultureNote, setCultureNote] = useState<string>(
    'In Japanese service settings (喫茶店 / 駅), staff elevate the guest using 丁寧語・尊敬語 while guests respond in clean ます-form politeness.'
  );
  const [betterAlternative, setBetterAlternative] = useState<string>(
    '「一人でお願いします」 sounds crisp, natural, and idiomatic at any Tokyo cafe or restaurant.'
  );

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [counterQuizIdx, setCounterQuizIdx] = useState<number | null>(null);
  const turnSeqRef = useRef(1);

  const turns = turnsByScenario[activeScenario.id] ?? activeScenario.initialTurns;
  const suggestions =
    suggestionsByScenario[activeScenario.id] ?? activeScenario.suggestedReplies;
  const fallbackTip =
    SCENARIO_FALLBACK_TIPS[activeScenario.id] ?? SCENARIO_FALLBACK_TIPS['cafe-ordering'];

  const sendMessage = async (textToSend: string, isRetry = false) => {
    const clean = textToSend.trim();
    if (!clean || loading) return;

    setApiError(null);
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    let targetUserTurnId = '';
    const currentHistory = turns.map((t) => ({
      role: t.role,
      text: t.japanese,
    }));

    if (!isRetry) {
      const userSeq = turnSeqRef.current++;
      targetUserTurnId = `user-${userSeq}`;
      const userTurn: ChatTurn = {
        id: targetUserTurnId,
        role: 'user',
        senderName: '客 · Ren',
        time: nowTime,
        japanese: clean,
        segments: [{ text: clean }],
        romaji: '',
        english: '',
      };

      setTurnsByScenario((prev) => ({
        ...prev,
        [activeScenario.id]: [...(prev[activeScenario.id] ?? []), userTurn],
      }));
      setInput('');
    } else {
      const lastUser = [...turns].reverse().find((t) => t.role === 'user');
      targetUserTurnId = lastUser?.id ?? '';
    }

    setLastFailedMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/sensei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'roleplay',
          message: clean,
          jlptLevel: activeJlpt,
          registerPolicy,
          scenario: {
            title: activeScenario.title,
            japaneseTitle: activeScenario.japaneseTitle,
            persona: activeScenario.persona,
            setting: activeScenario.setting,
          },
          history: currentHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || 'AI Sensei could not process that turn.');
        setLastFailedMessage(clean);
        return;
      }

      const senseiSeq = turnSeqRef.current++;
      const senseiTurn: ChatTurn = {
        id: `sensei-${senseiSeq}`,
        role: 'sensei',
        senderName: activeScenario.persona.split('(')[0].trim(),
        time: nowTime,
        japanese: data.replyJapanese,
        segments: [{ text: data.replyJapanese }],
        romaji: data.replyRomaji,
        english: data.replyEnglish,
        hint: data.pedagogicalHint,
        cultureMemo: data.cultureNote,
      };

      setTurnsByScenario((prev) => ({
        ...prev,
        [activeScenario.id]: [
          ...(prev[activeScenario.id] ?? []).map((t) =>
            t.id === targetUserTurnId
              ? {
                  ...t,
                  naturalnessScore: data.naturalnessScore,
                  pitchNote: data.pitchAssessment,
                }
              : t
          ),
          senseiTurn,
        ],
      }));

      if (Array.isArray(data.morphologyTokens) && data.morphologyTokens.length > 0) {
        setMorphTokens(data.morphologyTokens);
      }
      if (data.cultureNote) setCultureNote(data.cultureNote);
      if (data.betterAlternative) setBetterAlternative(data.betterAlternative);
      if (Array.isArray(data.suggestedReplies) && data.suggestedReplies.length > 0) {
        setSuggestionsByScenario((prev) => ({
          ...prev,
          [activeScenario.id]: data.suggestedReplies,
        }));
      }
    } catch {
      setApiError('Network error communicating with AI Sensei backend.');
      setLastFailedMessage(clean);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Studio Header & Scenario Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
            AI 先生スタジオ · Adaptive Intelligence &amp; Live Roleplay
          </div>
          <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
            AI Sensei Tutor Studio
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {SENSEI_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => {
                setScenarioId(sc.id);
                setApiError(null);
              }}
              className={`px-3.5 py-2 rounded-md border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                scenarioId === sc.id
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-lowest text-on-surface border-on-surface/10 hover:border-primary/40'
              }`}
            >
              <span className="font-serif text-sm font-bold">{sc.kanjiBadge}</span>
              <span>{sc.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Adaptive Intelligence Studio */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Panel (3 Cols): Cognitive Index, Weakness Alerts, Register Policy */}
        <aside className="xl:col-span-3 space-y-4">
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
                Cognitive Index
              </span>
              <span className="font-mono text-sm font-bold text-primary tabular-nums">
                88 / 100
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-primary w-[88%]" />
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Polite conversational fluency is strong. Focus interventions on spatial particle disambiguation and irregular counters.
            </p>
          </div>

          {/* Weakness Alerts & Interventions */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Adaptive Interventions</span>
            </div>
            <button
              type="button"
              onClick={() => openGrammar('ni-vs-de')}
              className="w-full p-3 rounded-md bg-surface-container-low hover:bg-primary-fixed/25 border border-outline-variant/20 text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-semibold text-on-surface flex items-center justify-between">
                <span>Particle Drift: に vs で</span>
                <ArrowRight className="w-3 h-3 text-primary" />
              </div>
              <div className="text-[11px] text-outline mt-0.5">
                22% hesitation on station alighting
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRoute('review-center')}
              className="w-full p-3 rounded-md bg-surface-container-low hover:bg-secondary-fixed/30 border border-outline-variant/20 text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-semibold text-on-surface flex items-center justify-between">
                <span>People Counters (1人・2人)</span>
                <ArrowRight className="w-3 h-3 text-secondary" />
              </div>
              <div className="text-[11px] text-outline mt-0.5">
                Practice irregular Yamato readings
              </div>
            </button>
          </div>

          {/* Register Policy Toggle */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-2.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">
              Register Correction Policy
            </div>
            {(
              [
                'Tokyo Casual Polite (東京日常会話)',
                'Strict Grammar (厳格文法)',
              ] as const
            ).map((pol) => (
              <button
                key={pol}
                type="button"
                onClick={() => setRegisterPolicy(pol)}
                className={`w-full px-3 py-2 rounded-md border text-left text-xs font-semibold cursor-pointer transition-colors ${
                  registerPolicy === pol
                    ? 'bg-secondary text-on-secondary border-secondary'
                    : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant'
                }`}
              >
                {pol}
              </button>
            ))}
          </div>
        </aside>

        {/* Center Panel (6 Cols): Scenario Banner, Goals, Dialogue Stream & Input */}
        <section className="xl:col-span-6 bg-surface-container-lowest rounded-lg border border-on-surface/10 overflow-hidden flex flex-col">
          {/* Scenario Banner */}
          <div className="relative h-40 w-full bg-surface-container">
            <Image
              src={activeScenario.image}
              alt={activeScenario.title}
              fill
              sizes="(max-width: 1280px) 100vw, 50vw"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/85 via-on-surface/35 to-transparent p-5 flex flex-col justify-end text-on-primary">
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-85">
                {activeScenario.ambientLabel}
              </div>
              <div className="font-serif text-xl font-bold mt-0.5">
                {activeScenario.japaneseTitle} · {activeScenario.title}
              </div>
              <div className="text-xs opacity-90 truncate">{activeScenario.persona}</div>
            </div>
          </div>

          {/* Communicative Goals Bar */}
          <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant/20 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-mono uppercase text-outline font-bold">
              Goals:
            </span>
            {activeScenario.goals.map((g) => (
              <span
                key={g.id}
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border ${
                  g.done
                    ? 'bg-tertiary-fixed/40 border-tertiary/30 text-tertiary font-semibold'
                    : 'bg-surface-container-lowest border-on-surface/10 text-on-surface-variant'
                }`}
              >
                {g.done ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Circle className="w-3 h-3 text-outline" />
                )}
                <span>{g.jp}</span>
              </span>
            ))}
          </div>

          {/* Dialogue Stream */}
          <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
            {turns.map((turn) => {
              const isUser = turn.role === 'user';
              return (
                <div
                  key={turn.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 text-[10px] font-mono text-outline mb-1">
                    <span>{turn.senderName}</span>
                    <span>·</span>
                    <span>{turn.time}</span>
                  </div>

                  <div
                    className={`max-w-[90%] rounded-lg p-4 space-y-2 border ${
                      isUser
                        ? 'bg-primary-fixed/25 border-primary/30 text-on-surface'
                        : 'bg-surface-container-low border-outline-variant/20 text-on-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-serif text-base font-bold leading-relaxed">
                        <RubyText segments={turn.segments} />
                      </div>
                      <button
                        type="button"
                        onClick={() => speakJapanese(turn.japanese)}
                        className="p-1.5 rounded-lg bg-surface-container-lowest text-secondary hover:text-primary shrink-0 cursor-pointer"
                        aria-label="Play turn audio"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {turn.romaji && (
                      <div className="text-[11px] font-mono text-outline romaji-sub">{turn.romaji}</div>
                    )}
                    {turn.english && (
                      <div className="text-xs text-on-surface-variant">{turn.english}</div>
                    )}

                    {(turn.naturalnessScore !== undefined || turn.pitchNote || turn.verifiedTag) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
                        {turn.naturalnessScore !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary font-bold tabular-nums">
                            Naturalness {turn.naturalnessScore}%
                          </span>
                        )}
                        {turn.pitchNote && (
                          <span className="px-2 py-0.5 rounded bg-surface-container-lowest border border-on-surface/10 text-secondary">
                            {turn.pitchNote}
                          </span>
                        )}
                        {turn.verifiedTag && (
                          <span className="px-2 py-0.5 rounded bg-surface-container-lowest border border-on-surface/10 text-primary">
                            {turn.verifiedTag}
                          </span>
                        )}
                      </div>
                    )}

                    {turn.hint && (
                      <div className="p-2.5 rounded-md bg-surface-container-lowest border border-outline-variant/20 text-[11px] text-secondary">
                        💡 {turn.hint}
                      </div>
                    )}

                    {turn.cultureMemo && (
                      <div className="p-2.5 rounded-md bg-secondary-fixed/30 text-[11px] text-on-secondary-fixed">
                        🏮 {turn.cultureMemo}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-outline font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>AI Sensei is composing reply &amp; morphological trace...</span>
              </div>
            )}
          </div>

          {/* Suggested Replies & Live Input */}
          <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/60 space-y-3">
            {apiError && (
              <div className="p-3.5 rounded-md bg-error-container/50 border border-error/30 text-xs text-on-error-container space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium leading-relaxed">{apiError}</span>
                  {lastFailedMessage && (
                    <button
                      type="button"
                      onClick={() => sendMessage(lastFailedMessage, true)}
                      disabled={loading}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-surface-container-lowest border border-error/40 text-on-surface font-semibold hover:border-primary shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry (再試行)</span>
                    </button>
                  )}
                </div>
                <div className="p-3 rounded-sm bg-surface-container-lowest border border-on-surface/10 text-on-surface space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>教科書解説 · Scenario Grammar Reference (Static Fallback)</span>
                  </div>
                  <div className="font-serif text-sm font-bold text-on-surface">
                    {fallbackTip.pattern}
                  </div>
                  <div className="text-[11px] font-mono text-outline romaji-sub">
                    {fallbackTip.romaji}
                  </div>
                  <p className="text-[11px] text-on-surface-variant">{fallbackTip.note}</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(sug.jp)}
                  className="px-3 py-1.5 rounded-md bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/50 text-left transition-colors cursor-pointer"
                >
                  <div className="font-serif text-xs font-bold text-on-surface">
                    {sug.jp}
                  </div>
                  <div className="text-[10px] text-outline">{sug.en}</div>
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Reply in Japanese (kana, kanji, or romaji)..."
                className="flex-1 px-4 py-2.5 rounded-md bg-surface-container-lowest border border-outline-variant/30 text-sm font-serif outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </section>

        {/* Right Panel (3 Cols): Live Morphology, Culture & Counter Micro-Drill */}
        <aside className="xl:col-span-3 space-y-4">
          {/* Morphological Dissection */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Morphological Dissection</span>
              </div>
              <span className="text-[10px] font-mono text-outline">Live Parse</span>
            </div>

            <div className="space-y-2">
              {morphTokens.map((tok, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-md bg-surface-container-low border border-outline-variant/15 space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-primary">
                      {tok.surface}{' '}
                      <span className="text-[11px] font-normal text-outline">
                        ({tok.reading})
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-secondary">
                      {tok.partOfSpeech}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">{tok.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Culture & Keigo Comparison */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-secondary">
              <ShieldCheck className="w-4 h-4" />
              <span>Etiquette &amp; Nuance</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">{cultureNote}</p>
            <div className="p-3 rounded-md bg-tertiary-fixed/25 border border-tertiary/20 text-[11px] text-on-surface">
              <strong>Native Phrasing:</strong> {betterAlternative}
            </div>
          </div>

          {/* Irregular People Counter Micro-Drill */}
          <div className="bg-surface-container-lowest rounded-lg border border-on-surface/10 p-5 space-y-3">
            <div className="text-xs font-bold text-on-surface">
              People Counter Micro-Drill (〜人)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {COUNTER_DRILL.map((c, idx) => (
                <button
                  key={c.count}
                  type="button"
                  onClick={() => {
                    setCounterQuizIdx(idx);
                    speakJapanese(c.reading);
                    showToast(`${c.count} → ${c.reading} (${c.note})`);
                  }}
                  className={`p-2.5 rounded-md border text-left transition-colors cursor-pointer ${
                    counterQuizIdx === idx
                      ? 'bg-primary-fixed/35 border-primary'
                      : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/40'
                  }`}
                >
                  <div className="font-serif text-base font-bold text-on-surface">
                    {c.count}
                  </div>
                  <div className="text-xs font-semibold text-primary">{c.reading}</div>
                  <div className="text-[10px] text-outline">{c.note}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
