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
import { User } from 'firebase/auth';
import {
  JlptLevel,
  KotoRoute,
  SRS_REVIEW_CARDS,
} from '@/lib/koto-data';
import { MinnaVocabEntry } from '@/lib/minna-types';
import {
  getAccessToken,
  googleSignIn,
  initAuth,
  signOutUser,
} from '@/lib/firebase';
import {
  ensureUserProvisioned,
  refreshUserAccount,
  saveUserProgressToFirestore,
} from '@/lib/firestore-service';
import {
  createZeroProgressPayload,
  createZeroStudyTasks,
  StudyTaskItem,
  UserAccountRecord,
  UserProgressPayload,
} from '@/lib/koto-db-types';

export type StudyTask = StudyTaskItem;

interface KotoContextValue {
  // Auth & User Access Control
  authLoading: boolean;
  firebaseUser: User | null;
  userAccount: UserAccountRecord | null;
  userEmail: string;
  userPhotoUrl: string;
  hasOAuthToken: boolean;
  authError: string | null;
  isSavingCloud: boolean;
  signInWithGoogle: (forceConsent?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccountStatus: () => Promise<void>;

  // Navigation & Curriculum
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

  // Ergonomics & Audio
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

  // Selected Entity Deep Links
  selectedVocabId: string;
  openVocab: (id: string) => void;
  selectedKanjiChar: string;
  openKanji: (char: string) => void;
  selectedGrammarId: string;
  openGrammar: (id: string) => void;

  // Progress & Telemetry (Zero-Initialized per User)
  srsQueue: typeof SRS_REVIEW_CARDS;
  srsReviewedCount: number;
  srsMasteredCount: number;
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
  weeklyMinutes: number[];
  streakDays: number;
  lastStudyDate: string;
  examBestScore: number;
  recordExamScore: (scoreOutOf180: number) => void;

  // Offline & Sync
  isOnline: boolean;
  resetLocalProgress: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayKey(): string {
  const dt = new Date();
  dt.setDate(dt.getDate() - 1);
  return getLocalDateKey(dt);
}

function getMonBasedDayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

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
  // Auth & User Profile State
  const [authLoading, setAuthLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccountRecord | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userPhotoUrl, setUserPhotoUrl] = useState('');
  const [hasOAuthToken, setHasOAuthToken] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);

  // Navigation & Selected Entities
  const [route, setRoute] = useState<KotoRoute>('dashboard');
  const [selectedVocabId, setSelectedVocabId] = useState('kissaten');
  const [selectedKanjiChar, setSelectedKanjiChar] = useState('時');
  const [selectedGrammarId, setSelectedGrammarId] = useState('ni-vs-de');
  const [commandOpen, setCommandOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Zero-initialized Learning Progress State
  const [activeJlpt, setActiveJlpt] = useState<JlptLevel>('N5');
  const [activeLessonNumber, setActiveLessonNumberState] = useState<number>(1);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [lastAudioText, setLastAudioText] = useState('喫茶店');

  const [srsQueue, setSrsQueue] = useState<typeof SRS_REVIEW_CARDS>([]);
  const [srsReviewedCount, setSrsReviewedCount] = useState(0);
  const [srsMasteredCount, setSrsMasteredCount] = useState(0);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>(() => createZeroStudyTasks());
  const [bookmarkedKanji, setBookmarkedKanji] = useState<string[]>([]);
  const [lessonDraft, setLessonDraft] = useState<Record<string, (string | null)[]>>({});
  const [weeklyMinutes, setWeeklyMinutes] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [streakDays, setStreakDays] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState('');
  const [examBestScore, setExamBestScore] = useState(0);

  const isOnline = useSyncExternalStore(
    subscribeOnlineStatus,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  );

  const hydratedUidRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const srsSeqRef = useRef(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAudioUrlRef = useRef<string | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const applyProgressState = useCallback(
    (progress: Omit<UserProgressPayload, 'updatedAt'>) => {
      setActiveJlpt(progress.activeJlpt);
      setActiveLessonNumberState(progress.activeLessonNumber);
      setCompletedLessons(progress.completedLessons);
      setSrsQueue(progress.srsQueue);
      setSrsReviewedCount(progress.srsReviewedCount);
      setSrsMasteredCount(progress.srsMasteredCount);
      setStudyTasks(progress.studyTasks);
      setBookmarkedKanji(progress.bookmarkedKanji);
      setLessonDraft(progress.lessonDraft);
      setWeeklyMinutes(progress.weeklyMinutes);
      setStreakDays(progress.streakDays);
      setLastStudyDate(progress.lastStudyDate);
      setExamBestScore(progress.examBestScore);
      setShowFurigana(progress.showFurigana);
      setShowRomaji(progress.showRomaji);
      setAudioEnabled(progress.audioEnabled);
      setSpeechRate(progress.speechRate);
    },
    []
  );

  const hydrateFromUser = useCallback(
    async (user: User, accessToken: string | null) => {
      setAuthError(null);
      try {
        const { account, privateProfile, progress } = await ensureUserProvisioned(user);
        setFirebaseUser(user);
        setUserAccount(account);
        setUserEmail(privateProfile.email);
        setUserPhotoUrl(privateProfile.photoURL);
        setHasOAuthToken(Boolean(accessToken || getAccessToken()));
        applyProgressState(progress);
        hydratedUidRef.current = user.uid;
      } catch (err) {
        console.error('Failed to provision/hydrate user:', err);
        setAuthError(
          err instanceof Error
            ? 'Unable to sync your KOTO learner account with Firestore. Please verify connection and retry.'
            : 'Authentication sync failed.'
        );
      } finally {
        setAuthLoading(false);
      }
    },
    [applyProgressState]
  );

  // Subscribe to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, accessToken) => {
        void hydrateFromUser(user, accessToken);
      },
      () => {
        hydratedUidRef.current = null;
        setFirebaseUser(null);
        setUserAccount(null);
        setUserEmail('');
        setUserPhotoUrl('');
        setHasOAuthToken(false);
        setRoute('dashboard');
        applyProgressState(createZeroProgressPayload(''));
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, [hydrateFromUser, applyProgressState]);

  const signInWithGoogle = useCallback(
    async (forceConsent = false) => {
      setAuthError(null);
      setAuthLoading(true);
      try {
        const { user, accessToken } = await googleSignIn(forceConsent);
        await hydrateFromUser(user, accessToken);
        setHasOAuthToken(Boolean(accessToken || getAccessToken()));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled.';
        setAuthError(msg);
        setAuthLoading(false);
      }
    },
    [hydrateFromUser]
  );

  const signOut = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    hydratedUidRef.current = null;
    await signOutUser();
    setFirebaseUser(null);
    setUserAccount(null);
    setUserEmail('');
    setUserPhotoUrl('');
    setHasOAuthToken(false);
    setRoute('dashboard');
    applyProgressState(createZeroProgressPayload(''));
    showToast('Signed out of KOTO.');
  }, [applyProgressState, showToast]);

  const refreshAccountStatus = useCallback(async () => {
    if (!firebaseUser) return;
    setAuthLoading(true);
    try {
      const fresh = await refreshUserAccount(firebaseUser.uid);
      if (fresh) {
        setUserAccount(fresh);
        showToast(`Account status: ${fresh.status.toUpperCase()}`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to refresh status.');
    } finally {
      setAuthLoading(false);
    }
  }, [firebaseUser, showToast]);

  // Debounced per-user persistence to localStorage cache + Firestore
  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid || hydratedUidRef.current !== uid) return;

    const payload: Omit<UserProgressPayload, 'updatedAt'> = {
      uid,
      activeJlpt,
      activeLessonNumber,
      completedLessons,
      srsQueue,
      srsReviewedCount,
      srsMasteredCount,
      studyTasks,
      bookmarkedKanji,
      lessonDraft,
      weeklyMinutes,
      streakDays,
      lastStudyDate,
      examBestScore,
      showFurigana,
      showRomaji,
      audioEnabled,
      speechRate,
    };

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(`koto_state_v2_${uid}`, JSON.stringify(payload));
      } catch {
        // Ignore storage quota issues
      }
    }

    if (!isOnline || userAccount?.status !== 'active') return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const displayName = userAccount.displayName || firebaseUser.displayName || 'KOTO Learner';
    saveTimerRef.current = setTimeout(() => {
      setIsSavingCloud(true);
      void saveUserProgressToFirestore(uid, payload, displayName)
        .catch((err) => {
          console.error('Background progress save failed:', err);
        })
        .finally(() => {
          setIsSavingCloud(false);
        });
    }, 800);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [
    firebaseUser,
    userAccount,
    isOnline,
    activeJlpt,
    activeLessonNumber,
    completedLessons,
    srsQueue,
    srsReviewedCount,
    srsMasteredCount,
    studyTasks,
    bookmarkedKanji,
    lessonDraft,
    weeklyMinutes,
    streakDays,
    lastStudyDate,
    examBestScore,
    showFurigana,
    showRomaji,
    audioEnabled,
    speechRate,
  ]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const recordStudyActivity = useCallback(
    (minutesToAdd: number) => {
      const todayKey = getLocalDateKey();
      const yesterdayKey = getYesterdayKey();
      const dayIdx = getMonBasedDayIndex();

      setWeeklyMinutes((prev) => {
        const next = prev.length === 7 ? [...prev] : [0, 0, 0, 0, 0, 0, 0];
        next[dayIdx] = Math.min(600, (next[dayIdx] || 0) + minutesToAdd);
        return next;
      });

      setStreakDays((prev) => {
        if (lastStudyDate === todayKey) return Math.max(1, prev);
        if (lastStudyDate === yesterdayKey) return prev + 1;
        return 1;
      });
      setLastStudyDate(todayKey);
    },
    [lastStudyDate]
  );

  const speakWithWebSpeech = useCallback((text: string, rate: number) => {
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
  }, []);

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

      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {
          // Ignore reset errors
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

  // Global keyboard accelerators: ⌘K / Ctrl+K, Escape, Space audio replay
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
      if (
        e.code === 'Space' &&
        !commandOpen &&
        route !== 'review-center' &&
        userAccount?.status === 'active'
      ) {
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
  }, [commandOpen, route, lastAudioText, speakJapanese, userAccount?.status]);

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
      setSrsReviewedCount((c) => c + 1);
      recordStudyActivity(1);
      if (grade === 'again') {
        setSrsQueue((prev) => {
          const item = prev.find((c) => c.id === id);
          if (!item) return prev;
          return [...prev.filter((c) => c.id !== id), item];
        });
        showToast('Re-queued card for immediate reinforcement.');
      } else {
        setSrsMasteredCount((c) => c + 1);
        setSrsQueue((prev) => prev.filter((c) => c.id !== id));
        showToast(
          grade === 'easy'
            ? 'Interval extended +14 days (Hanko Verified).'
            : 'Memory stability updated in Ebbinghaus schedule.'
        );
      }
    },
    [recordStudyActivity, showToast]
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
        if (!exists) {
          recordStudyActivity(10);
        }
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
    [recordStudyActivity, showToast]
  );

  const markLessonComplete = useCallback(
    (lessonNumber: number) => {
      setCompletedLessons((prev) => {
        if (prev.includes(lessonNumber)) return prev;
        recordStudyActivity(10);
        showToast(`Lesson ${lessonNumber} completed!`);
        return [...prev, lessonNumber].sort((a, b) => a - b);
      });
    },
    [recordStudyActivity, showToast]
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
        showToast(`Queued ${addedCount} words from Lesson ${lessonNumber} into SRS.`);
      } else {
        showToast(`All Lesson ${lessonNumber} words are already in your SRS queue.`);
      }
    },
    [showToast]
  );

  const toggleStudyTask = useCallback(
    (id: string) => {
      setStudyTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const nextDone = !t.done;
          if (nextDone) {
            recordStudyActivity(t.minutes);
          }
          return { ...t, done: nextDone };
        })
      );
    },
    [recordStudyActivity]
  );

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

  const updateLessonDraft = useCallback((challengeId: string, tileIds: (string | null)[]) => {
    setLessonDraft((prev) => ({
      ...prev,
      [challengeId]: tileIds,
    }));
  }, []);

  const recordExamScore = useCallback(
    (scoreOutOf180: number) => {
      const clamped = Math.max(0, Math.min(180, Math.round(scoreOutOf180)));
      setExamBestScore((prev) => Math.max(prev, clamped));
      recordStudyActivity(5);
    },
    [recordStudyActivity]
  );

  const resetLocalProgress = useCallback(() => {
    const uid = firebaseUser?.uid || '';
    const zero = createZeroProgressPayload(uid);
    applyProgressState(zero);
    if (typeof window !== 'undefined' && uid) {
      try {
        window.localStorage.removeItem(`koto_state_v2_${uid}`);
      } catch {
        // Ignore
      }
    }
    if (uid && isOnline && userAccount?.status === 'active') {
      void saveUserProgressToFirestore(
        uid,
        zero,
        userAccount.displayName || firebaseUser?.displayName || 'KOTO Learner'
      ).catch((err) => console.error('Reset cloud sync error:', err));
    }
    showToast('All study progress reset to 0%.');
  }, [firebaseUser, userAccount, isOnline, applyProgressState, showToast]);

  const dueCount = srsQueue.length;

  return (
    <KotoContext.Provider
      value={{
        authLoading,
        firebaseUser,
        userAccount,
        userEmail,
        userPhotoUrl,
        hasOAuthToken,
        authError,
        isSavingCloud,
        signInWithGoogle,
        signOut,
        refreshAccountStatus,
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
        srsReviewedCount,
        srsMasteredCount,
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
        weeklyMinutes,
        streakDays,
        lastStudyDate,
        examBestScore,
        recordExamScore,
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
