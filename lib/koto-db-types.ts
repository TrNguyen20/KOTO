import { JlptLevel, SRS_REVIEW_CARDS } from '@/lib/koto-data';

export type UserRole = 'admin' | 'student';
export type UserAccessStatus = 'pending' | 'active' | 'suspended';

export const BOOTSTRAP_ADMIN_EMAIL = 'trung.persie96@gmail.com';

export interface StudyTaskItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeTone: 'error' | 'neutral';
  minutes: number;
  done: boolean;
  targetRoute:
    | 'review-center'
    | 'grammar-studio'
    | 'listening-and-shadowing'
    | 'lesson'
    | 'vocabulary-lab';
}

export interface UserAccountRecord {
  uid: string;
  displayName: string;
  role: UserRole;
  status: UserAccessStatus;
  activeLessonNumber: number;
  completedLessonsCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
}

export interface UserPrivateRecord {
  uid: string;
  email: string;
  photoURL: string;
  updatedAt?: unknown;
}

export interface UserProgressPayload {
  uid: string;
  activeJlpt: JlptLevel;
  activeLessonNumber: number;
  completedLessons: number[];
  srsQueue: typeof SRS_REVIEW_CARDS;
  srsReviewedCount: number;
  srsMasteredCount: number;
  studyTasks: StudyTaskItem[];
  bookmarkedKanji: string[];
  lessonDraft: Record<string, (string | null)[]>;
  weeklyMinutes: number[];
  streakDays: number;
  lastStudyDate: string;
  examBestScore: number;
  showFurigana: boolean;
  showRomaji: boolean;
  audioEnabled: boolean;
  speechRate: number;
  updatedAt?: unknown;
}

export interface WorkspaceSheetConfigRecord {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  lastPushAt: string;
  lastPullAt: string;
  lastSyncSummary: string;
  updatedByUid: string;
  updatedAt?: unknown;
}

export interface AdminUserRow {
  account: UserAccountRecord;
  email: string;
  photoURL: string;
  progress?: UserProgressPayload;
}

export function createZeroStudyTasks(): StudyTaskItem[] {
  return [
    {
      id: 'task-1',
      title: 'Lesson 01: Self-Introduction',
      subtitle: 'Start Minna no Nihongo I foundations',
      badge: 'Ready',
      badgeTone: 'neutral',
      minutes: 10,
      done: false,
      targetRoute: 'lesson',
    },
    {
      id: 'task-2',
      title: 'Queue Lesson 01 Vocabulary',
      subtitle: 'Add core words into SRS review deck',
      badge: 'Ready',
      badgeTone: 'neutral',
      minutes: 8,
      done: false,
      targetRoute: 'vocabulary-lab',
    },
    {
      id: 'task-3',
      title: 'Listening & Shadowing Check',
      subtitle: 'Practice ja-JP seminar greetings',
      badge: 'Ready',
      badgeTone: 'neutral',
      minutes: 7,
      done: false,
      targetRoute: 'listening-and-shadowing',
    },
  ];
}

export function createZeroProgressPayload(uid: string): Omit<UserProgressPayload, 'updatedAt'> {
  return {
    uid,
    activeJlpt: 'N5',
    activeLessonNumber: 1,
    completedLessons: [],
    srsQueue: [],
    srsReviewedCount: 0,
    srsMasteredCount: 0,
    studyTasks: createZeroStudyTasks(),
    bookmarkedKanji: [],
    lessonDraft: {},
    weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
    streakDays: 0,
    lastStudyDate: '',
    examBestScore: 0,
    showFurigana: true,
    showRomaji: true,
    audioEnabled: true,
    speechRate: 1.0,
  };
}
