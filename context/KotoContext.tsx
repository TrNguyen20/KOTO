'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import {
  JlptLevel,
  KotoRoute,
  SRS_REVIEW_CARDS,
} from '@/lib/koto-data';
import { MinnaVocabEntry } from '@/lib/minna-types';

const STORAGE_KEY = 'koto_state_v1';

export interface StudyTask {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeTone: 'error' | 'neutral';
  minutes: number;
  done: boolean;
  targetRoute: KotoRoute;
}

interface PersistedKotoState {
  activeJlpt: JlptLevel;
  activeLessonNumber: number;
  completedLessons: number[];
  showFurigana: boolean;
  showRomaji: boolean;
  audioEnabled: boolean;
  speechRate: number;
  srsQueue: typeof SRS_REVIEW_CARDS;
  dueOffset: number;
  studyTasks: StudyTask[];
  bookmarkedKanji: string[];
  lessonDraft: Record<string, (string | null)[]>;
}

interface KotoContextValue {
  route: KotoRoute;
  setRoute: (route: KotoRoute) => void;
  activeJlpt: JlptLevel;
  setActiveJlpt: (level: JlptLevel) => void;
  activeLessonNumber: number;
  setActiveLessonNumber: (lessonNumber: number) => void;
  openMinnaLesson: (lessonNumber: number, targetRoute?: KotoRoute) => void;
  completedLessons: number[];
  toggleLessonComplete: (lessonNumber: number) => void;
  markLessonComplete: (lessonNumber: number) => void;
  showFurigana: boolean;
  toggleFurigana: () => void;
  showRomaji: boolean;
  toggleRomaji: () => void;
  audioEnabled: boolean;
  toggleAudioEnabled: () => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  speakingText: string | null;
  lastAudioText: string;
  speakJapanese: (text: string, customRate?: number, audioUrl?: string) => void;
  selectedVocabId: string;
  openVocab: (id: string) => void;
  selectedKanjiChar: string;
  openKanji: (char: string) => void;
  selectedGrammarId: string;
  openGrammar: (id: string) => void;
  srsQueue: typeof SRS_REVIEW_CARDS;
  completeSrsCard: (id: string, grade: 'again' | 'hard' | 'good' | 'easy') => void;
  addSrsCard: (card: {
    front: string;
    reading: string;
    meaning: string;
    jlpt?: JlptLevel;
    context?: string;
  }) => void;
  queueLessonVocabToSrs: (lessonNumber: number, vocabItems: MinnaVocabEntry[]) => void;
  dueCount: number;
  studyTasks: StudyTask[];
  toggleStudyTask: (id: string) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  bookmarkedKanji: string[];
  toggleBookmarkKanji: (char: string) => void;
  lessonDraft: Record<string, (string | null)[]>;
  updateLessonDraft: (challengeId: string, tileIds: (string | null)[]) => void;
  isOnline: boolean;
  resetLocalProgress: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const INITIAL_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    title: 'SRS Daily Review Queue',
    subtitle: '14 vocabulary items waiting',
    badge: 'Pending',
    badgeTone: 'error',
    minutes: 7,
    done: false,
    targetRoute: 'review-center',
  },
  {
    id: 'task-2',
    title: 'Unit 3: Particles In Motion',
    subtitle: 'Grammar Studio syntax lecture',
    badge: 'Up Next',
    badgeTone: 'neutral',
    minutes: 13,
    done: false,
    targetRoute: 'grammar-studio',
  },
  {
    id: 'task-3',
    title: 'Shadowing: Cafe Dialogue',
    subtitle: 'Pronunciation & natural cadence',
    badge: 'Planned',
    badgeTone: 'neutral',
    minutes: 5,
    done: false,
    targetRoute: 'listening-and-shadowing',
  },
];

const INITIAL_BOOKMARKS = ['時', '食'];

function subscribeOnlineStatus(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function getOnlineServerSnapshot() {
  return true;
}

const KotoContext = createContext<KotoContextValue | null>(null);

export function KotoProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<KotoRoute>('dashboard');
  const [activeJlpt, setActiveJlpt] = useState<JlptLevel>('N5');
  const [activeLessonNumber, setActiveLessonNumberState] = useState<number>(1);
  const [completedLessons, setCompletedLessons] = useState<number[]>([1]);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [lastAudioText, setLastAudioText] = useState('喫茶店');

  const [selectedVocabId, setSelectedVocabId] = useState('kissaten');
  const [selectedKanjiChar, setSelectedKanjiChar] = useState('時');
  const [selectedGrammarId, setSelectedGrammarId] = useState('ni-vs-de');

  const [srsQueue, setSrsQueue] = useState(SRS_REVIEW_CARDS);
  const [dueOffset, setDueOffset] = useState(8);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>(INITIAL_TASKS);
  const [commandOpen, setCommandOpen] = useState(false);
  const [bookmarkedKanji, setBookmarkedKanji] = useState<string[]>(INITIAL_BOOKMARKS);
  const [lessonDraft, setLessonDraft] = useState<Record<string, (string | null)[]>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isOnline = useSyncExternalStore(
    subscribeOnlineStatus,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  );

  const hydratedRef = useRef(false);
  const srsSeqRef = useRef(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAudioUrlRef = useRef<string | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Hydrate persisted offline state safely after mount without synchronous setState in effect body
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PersistedKotoState>;
          if (parsed.activeJlpt) setActiveJlpt(parsed.activeJlpt);
          if (
            typeof parsed.activeLessonNumber === 'number' &&
            parsed.activeLessonNumber >= 1 &&
            parsed.activeLessonNumber <= 50
          ) {
            setActiveLessonNumberState(parsed.activeLessonNumber);
          }
          if (Array.isArray(parsed.completedLessons)) {
            setCompletedLessons(parsed.completedLessons);
          }
          if (typeof parsed.showFurigana === 'boolean') setShowFurigana(parsed.showFurigana);
          if (typeof parsed.showRomaji === 'boolean') setShowRomaji(parsed.showRomaji);
          if (typeof parsed.audioEnabled === 'boolean') setAudioEnabled(parsed.audioEnabled);
          if (typeof parsed.speechRate === 'number') setSpeechRate(parsed.speechRate);
          if (Array.isArray(parsed.srsQueue)) setSrsQueue(parsed.srsQueue);
          if (typeof parsed.dueOffset === 'number') setDueOffset(parsed.dueOffset);
          if (Array.isArray(parsed.studyTasks)) setStudyTasks(parsed.studyTasks);
          if (Array.isArray(parsed.bookmarkedKanji)) setBookmarkedKanji(parsed.bookmarkedKanji);
          if (parsed.lessonDraft && typeof parsed.lessonDraft === 'object') {
            setLessonDraft(parsed.lessonDraft);
          }
        }
      } catch {
        // Ignore malformed localStorage payload
      } finally {
        hydratedRef.current = true;
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !hydratedRef.current) return;
    try {
      const payload: PersistedKotoState = {
        activeJlpt,
        activeLessonNumber,
        completedLessons,
        showFurigana,
        showRomaji,
        audioEnabled,
        speechRate,
        srsQueue,
        dueOffset,
        studyTasks,
        bookmarkedKanji,
        lessonDraft,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    activeJlpt,
    activeLessonNumber,
    completedLessons,
    showFurigana,
    showRomaji,
    audioEnabled,
    speechRate,
    srsQueue,
    dueOffset,
    studyTasks,
    bookmarkedKanji,
    lessonDraft,
  ]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const speakWithWebSpeech = useCallback(
    (text: string, rate: number) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'ja-JP';
          utterance.rate = rate;
          const voices = window.speechSynthesis.getVoices();
          const jaVoice = voices.find((v) => v.lang.startsWith('ja'));
          if (jaVoice) utterance.voice = jaVoice;
          utterance.onend = () => setSpeakingText(null);
          utterance.onerror = () => setSpeakingText(null);
          window.speechSynthesis.speak(utterance);
          setTimeout(() => setSpeakingText((curr) => (curr === text ? null : curr)), 4500);
        } catch {
          setTimeout(() => setSpeakingText(null), 1500);
        }
      } else {
        setTimeout(() => setSpeakingText(null), 1500);
      }
    },
    []
  );

  const speakJapanese = useCallback(
    (text: string, customRate?: number, audioUrl?: string) => {
      setLastAudioText(text);
      lastAudioUrlRef.current = audioUrl;
      if (!audioEnabled) {
        showToast('Audio output is muted in top bar.');
        return;
      }

      const rate = customRate ?? speechRate;
      setSpeakingText(text);

      // Stop any active HTMLAudioElement or SpeechSynthesis before starting new playback
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {
          // Ignore audio reset errors
        }
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore cancel error
        }
      }

      // Dual-engine: prefer MP3 audioUrl when provided, fall back seamlessly to ja-JP Web Speech
      if (audioUrl && typeof window !== 'undefined') {
        try {
          const audio = new Audio(audioUrl);
          audio.playbackRate = rate;
          audioRef.current = audio;
          audio.onended = () => setSpeakingText((curr) => (curr === text ? null : curr));
          audio.onerror = () => {
            audioRef.current = null;
            speakWithWebSpeech(text, rate);
          };
          const playPromise = audio.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              audioRef.current = null;
              speakWithWebSpeech(text, rate);
            });
          }
          return;
        } catch {
          speakWithWebSpeech(text, rate);
          return;
        }
      }

      speakWithWebSpeech(text, rate);
    },
    [audioEnabled, speechRate, showToast, speakWithWebSpeech]
  );

  // Global keyboard accelerators: ⌘K / Ctrl+K, Escape, Space audio replay (outside inputs & review-center)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
        return;
      }
      if (e.key === 'Escape' && commandOpen) {
        e.preventDefault();
        setCommandOpen(false);
        return;
      }
      if (e.code === 'Space' && !commandOpen && route !== 'review-center') {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        if (
          tag === 'input' ||
          tag === 'textarea' ||
          tag === 'select' ||
          tag === 'button' ||
          tag === 'a' ||
          target?.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        speakJapanese(lastAudioText, undefined, lastAudioUrlRef.current);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commandOpen, route, lastAudioText, speakJapanese]);

  const openVocab = useCallback((id: string) => {
    setSelectedVocabId(id);
    setRoute('vocabulary-lab');
  }, []);

  const openKanji = useCallback((char: string) => {
    setSelectedKanjiChar(char);
    setRoute('kanji-studio');
  }, []);

  const openGrammar = useCallback((id: string) => {
    setSelectedGrammarId(id);
    setRoute('grammar-studio');
  }, []);

  const completeSrsCard = useCallback(
    (id: string, grade: 'again' | 'hard' | 'good' | 'easy') => {
      if (grade === 'again') {
        setSrsQueue((prev) => {
          const item = prev.find((c) => c.id === id);
          if (!item) return prev;
          return [...prev.filter((c) => c.id !== id), item];
        });
        showToast('Re-queued card for immediate reinforcement.');
      } else {
        setSrsQueue((prev) => prev.filter((c) => c.id !== id));
        showToast(
          grade === 'easy'
            ? 'Interval extended +14 days (Hanko Verified).'
            : 'Memory stability updated in Ebbinghaus schedule.'
        );
      }
    },
    [showToast]
  );

  const addSrsCard = useCallback(
    (card: {
      front: string;
      reading: string;
      meaning: string;
      jlpt?: JlptLevel;
      context?: string;
    }) => {
      const seq = srsSeqRef.current++;
      setSrsQueue((prev) => {
        if (prev.some((c) => c.front === card.front)) return prev;
        return [
          {
            id: `srs-custom-${seq}`,
            front: card.front,
            reading: card.reading,
            meaning: card.meaning,
            jlpt: card.jlpt ?? 'N5',
            context: card.context ?? '',
          },
          ...prev,
        ];
      });
      setDueOffset((d) => d + 1);
      showToast(`Added「${card.front}」to SRS Review Queue.`);
    },
    [showToast]
  );

  const setActiveLessonNumber = useCallback((lessonNumber: number) => {
    const clamped = Math.max(1, Math.min(50, lessonNumber));
    setActiveLessonNumberState(clamped);
    setActiveJlpt(clamped <= 25 ? 'N5' : 'N4');
  }, []);

  const openMinnaLesson = useCallback(
    (lessonNumber: number, targetRoute: KotoRoute = 'lesson') => {
      setActiveLessonNumber(lessonNumber);
      setRoute(targetRoute);
    },
    [setActiveLessonNumber]
  );

  const toggleLessonComplete = useCallback(
    (lessonNumber: number) => {
      setCompletedLessons((prev) => {
        const exists = prev.includes(lessonNumber);
        showToast(
          exists
            ? `Unmarked Lesson ${lessonNumber} completion.`
            : `Lesson ${lessonNumber} marked complete (Hanko Verified).`
        );
        return exists
          ? prev.filter((n) => n !== lessonNumber)
          : [...prev, lessonNumber].sort((a, b) => a - b);
      });
    },
    [showToast]
  );

  const markLessonComplete = useCallback(
    (lessonNumber: number) => {
      setCompletedLessons((prev) => {
        if (prev.includes(lessonNumber)) return prev;
        showToast(`Lesson ${lessonNumber} completed!`);
        return [...prev, lessonNumber].sort((a, b) => a - b);
      });
    },
    [showToast]
  );

  const queueLessonVocabToSrs = useCallback(
    (lessonNumber: number, vocabItems: MinnaVocabEntry[]) => {
      let addedCount = 0;
      setSrsQueue((prev) => {
        const existingFronts = new Set(prev.map((c) => c.front));
        const additions = vocabItems
          .filter((v) => !existingFronts.has(v.word))
          .map((v) => {
            const seq = srsSeqRef.current++;
            addedCount += 1;
            return {
              id: `srs-l${lessonNumber}-${seq}`,
              front: v.word,
              reading: v.reading,
              meaning: `${v.meaningEn} · ${v.meaningVi}`,
              jlpt: (lessonNumber <= 25 ? 'N5' : 'N4') as JlptLevel,
              context: v.example.romaji,
            };
          });
        return additions.length > 0 ? [...additions, ...prev] : prev;
      });
      if (addedCount > 0) {
        setDueOffset((d) => d + addedCount);
        showToast(`Queued ${addedCount} words from Lesson ${lessonNumber} into SRS.`);
      } else {
        showToast(`All Lesson ${lessonNumber} words are already in your SRS queue.`);
      }
    },
    [showToast]
  );

  const toggleStudyTask = useCallback((id: string) => {
    setStudyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const toggleBookmarkKanji = useCallback(
    (char: string) => {
      setBookmarkedKanji((prev) => {
        const exists = prev.includes(char);
        showToast(exists ? `Removed ${char} from bookmarks.` : `Bookmarked ${char} in Kanji Studio.`);
        return exists ? prev.filter((c) => c !== char) : [...prev, char];
      });
    },
    [showToast]
  );

  const updateLessonDraft = useCallback(
    (challengeId: string, tileIds: (string | null)[]) => {
      setLessonDraft((prev) => ({
        ...prev,
        [challengeId]: tileIds,
      }));
    },
    []
  );

  const resetLocalProgress = useCallback(() => {
    setActiveJlpt('N5');
    setActiveLessonNumberState(1);
    setCompletedLessons([1]);
    setShowFurigana(true);
    setShowRomaji(true);
    setAudioEnabled(true);
    setSpeechRate(1.0);
    setSrsQueue(SRS_REVIEW_CARDS);
    setDueOffset(8);
    setStudyTasks(INITIAL_TASKS);
    setBookmarkedKanji(INITIAL_BOOKMARKS);
    setLessonDraft({});
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
    showToast('Local study progress and preferences reset to defaults.');
  }, [showToast]);

  const dueCount = Math.max(0, srsQueue.length + dueOffset);

  return (
    <KotoContext.Provider
      value={{
        route,
        setRoute,
        activeJlpt,
        setActiveJlpt,
        activeLessonNumber,
        setActiveLessonNumber,
        openMinnaLesson,
        completedLessons,
        toggleLessonComplete,
        markLessonComplete,
        showFurigana,
        toggleFurigana: () => setShowFurigana((v) => !v),
        showRomaji,
        toggleRomaji: () => setShowRomaji((v) => !v),
        audioEnabled,
        toggleAudioEnabled: () => setAudioEnabled((v) => !v),
        speechRate,
        setSpeechRate,
        speakingText,
        lastAudioText,
        speakJapanese,
        selectedVocabId,
        openVocab,
        selectedKanjiChar,
        openKanji,
        selectedGrammarId,
        openGrammar,
        srsQueue,
        completeSrsCard,
        addSrsCard,
        queueLessonVocabToSrs,
        dueCount,
        studyTasks,
        toggleStudyTask,
        commandOpen,
        setCommandOpen,
        bookmarkedKanji,
        toggleBookmarkKanji,
        lessonDraft,
        updateLessonDraft,
        isOnline,
        resetLocalProgress,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </KotoContext.Provider>
  );
}

export function useKoto() {
  const ctx = useContext(KotoContext);
  if (!ctx) {
    throw new Error('useKoto must be used inside KotoProvider');
  }
  return ctx;
}
