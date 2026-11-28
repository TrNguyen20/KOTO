import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '@/lib/firebase';
import {
  AdminUserRow,
  BOOTSTRAP_ADMIN_EMAIL,
  createZeroProgressPayload,
  UserAccessStatus,
  UserAccountRecord,
  UserPrivateRecord,
  UserProgressPayload,
  UserRole,
  WorkspaceSheetConfigRecord,
} from '@/lib/koto-db-types';

export interface ProvisionedSessionData {
  account: UserAccountRecord;
  privateProfile: UserPrivateRecord;
  progress: Omit<UserProgressPayload, 'updatedAt'>;
}

function sanitizeDisplayName(user: User): string {
  const raw = (user.displayName || user.email?.split('@')[0] || 'KOTO Learner').trim();
  return raw.slice(0, 120) || 'KOTO Learner';
}

function sanitizeEmail(user: User): string {
  return (user.email || `${user.uid}@koto.local`).trim().slice(0, 180);
}

function sanitizePhotoUrl(user: User): string {
  return (user.photoURL || '').trim().slice(0, 500);
}

export async function ensureUserProvisioned(user: User): Promise<ProvisionedSessionData> {
  await testFirestoreConnection();

  const uid = user.uid;
  const email = sanitizeEmail(user);
  const displayName = sanitizeDisplayName(user);
  const photoURL = sanitizePhotoUrl(user);
  const isBootstrapAdmin = email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  const userRef = doc(db, 'users', uid);
  const privateRef = doc(db, 'users', uid, 'private', 'info');
  const progressRef = doc(db, 'users', uid, 'progress', 'main');

  let accountSnap;
  try {
    accountSnap = await getDoc(userRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }

  let account: UserAccountRecord;

  if (!accountSnap.exists()) {
    const newAccount: UserAccountRecord = {
      uid,
      displayName,
      role: isBootstrapAdmin ? 'admin' : 'student',
      status: isBootstrapAdmin ? 'active' : 'pending',
      activeLessonNumber: 1,
      completedLessonsCount: 0,
    };
    try {
      await setDoc(userRef, {
        ...newAccount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
    }
    account = newAccount;
  } else {
    const existing = accountSnap.data() as UserAccountRecord;
    account = {
      uid: existing.uid || uid,
      displayName: existing.displayName || displayName,
      role: existing.role || (isBootstrapAdmin ? 'admin' : 'student'),
      status: existing.status || (isBootstrapAdmin ? 'active' : 'pending'),
      activeLessonNumber:
        typeof existing.activeLessonNumber === 'number' ? existing.activeLessonNumber : 1,
      completedLessonsCount:
        typeof existing.completedLessonsCount === 'number' ? existing.completedLessonsCount : 0,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
      lastLoginAt: existing.lastLoginAt,
    };
    try {
      await updateDoc(userRef, {
        displayName,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      account.displayName = displayName;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  }

  // Private profile (email + photoURL)
  let privateSnap;
  try {
    privateSnap = await getDoc(privateRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}/private/info`);
  }

  const privateProfile: UserPrivateRecord = {
    uid,
    email,
    photoURL,
  };

  if (!privateSnap.exists()) {
    try {
      await setDoc(privateRef, {
        ...privateProfile,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${uid}/private/info`);
    }
  } else {
    try {
      await updateDoc(privateRef, {
        email,
        photoURL,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/private/info`);
    }
  }

  // Progress document (strictly zero-initialized for every new user, including Admin)
  let progressSnap;
  try {
    progressSnap = await getDoc(progressRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}/progress/main`);
  }

  let progress: Omit<UserProgressPayload, 'updatedAt'>;
  if (!progressSnap.exists()) {
    progress = createZeroProgressPayload(uid);
    try {
      await setDoc(progressRef, {
        ...progress,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${uid}/progress/main`);
    }
  } else {
    const raw = progressSnap.data() as Partial<UserProgressPayload>;
    const zero = createZeroProgressPayload(uid);
    progress = {
      ...zero,
      ...raw,
      uid,
      weeklyMinutes:
        Array.isArray(raw.weeklyMinutes) && raw.weeklyMinutes.length === 7
          ? raw.weeklyMinutes
          : zero.weeklyMinutes,
      completedLessons: Array.isArray(raw.completedLessons) ? raw.completedLessons : [],
      srsQueue: Array.isArray(raw.srsQueue) ? raw.srsQueue : [],
      studyTasks:
        Array.isArray(raw.studyTasks) && raw.studyTasks.length > 0
          ? raw.studyTasks
          : zero.studyTasks,
      bookmarkedKanji: Array.isArray(raw.bookmarkedKanji) ? raw.bookmarkedKanji : [],
      lessonDraft:
        raw.lessonDraft && typeof raw.lessonDraft === 'object' ? raw.lessonDraft : {},
    };
  }

  return { account, privateProfile, progress };
}

export async function refreshUserAccount(uid: string): Promise<UserAccountRecord | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserAccountRecord;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }
}

export async function saveUserProgressToFirestore(
  uid: string,
  progress: Omit<UserProgressPayload, 'updatedAt'>,
  displayName: string
): Promise<void> {
  const progressRef = doc(db, 'users', uid, 'progress', 'main');
  const userRef = doc(db, 'users', uid);

  const sanitizedWeekly =
    Array.isArray(progress.weeklyMinutes) && progress.weeklyMinutes.length === 7
      ? progress.weeklyMinutes.map((m) => (typeof m === 'number' && m >= 0 ? m : 0))
      : [0, 0, 0, 0, 0, 0, 0];

  const payload: Omit<UserProgressPayload, 'updatedAt'> = {
    uid,
    activeJlpt: progress.activeJlpt,
    activeLessonNumber: Math.max(1, Math.min(50, progress.activeLessonNumber)),
    completedLessons: progress.completedLessons.slice(0, 50),
    srsQueue: progress.srsQueue.slice(0, 500),
    srsReviewedCount: Math.max(0, Math.min(100000, progress.srsReviewedCount)),
    srsMasteredCount: Math.max(0, Math.min(100000, progress.srsMasteredCount)),
    studyTasks: progress.studyTasks.slice(0, 20),
    bookmarkedKanji: progress.bookmarkedKanji.slice(0, 500),
    lessonDraft: progress.lessonDraft ?? {},
    weeklyMinutes: sanitizedWeekly,
    streakDays: Math.max(0, Math.min(36500, progress.streakDays)),
    lastStudyDate: (progress.lastStudyDate || '').slice(0, 32),
    examBestScore: Math.max(0, Math.min(180, progress.examBestScore)),
    showFurigana: Boolean(progress.showFurigana),
    showRomaji: Boolean(progress.showRomaji),
    audioEnabled: Boolean(progress.audioEnabled),
    speechRate: Math.max(0.5, Math.min(2.0, progress.speechRate)),
  };

  try {
    await updateDoc(progressRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/progress/main`);
  }

  try {
    await updateDoc(userRef, {
      displayName: (displayName || 'KOTO Learner').slice(0, 120),
      activeLessonNumber: payload.activeLessonNumber,
      completedLessonsCount: payload.completedLessons.length,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function fetchAllUsersForAdmin(): Promise<AdminUserRow[]> {
  let usersSnap;
  try {
    usersSnap = await getDocs(collection(db, 'users'));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'users');
  }

  const rows = await Promise.all(
    usersSnap.docs.map(async (userDoc) => {
      const account = userDoc.data() as UserAccountRecord;
      const uid = account.uid || userDoc.id;

      let email = '';
      let photoURL = '';
      try {
        const privSnap = await getDoc(doc(db, 'users', uid, 'private', 'info'));
        if (privSnap.exists()) {
          const priv = privSnap.data() as UserPrivateRecord;
          email = priv.email || '';
          photoURL = priv.photoURL || '';
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${uid}/private/info`);
      }

      let progress: UserProgressPayload | undefined;
      try {
        const progSnap = await getDoc(doc(db, 'users', uid, 'progress', 'main'));
        if (progSnap.exists()) {
          progress = progSnap.data() as UserProgressPayload;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${uid}/progress/main`);
      }

      return {
        account: { ...account, uid },
        email,
        photoURL,
        progress,
      } satisfies AdminUserRow;
    })
  );

  return rows.sort((a, b) => {
    if (a.account.status === 'pending' && b.account.status !== 'pending') return -1;
    if (b.account.status === 'pending' && a.account.status !== 'pending') return 1;
    if (a.account.role === 'admin' && b.account.role !== 'admin') return -1;
    if (b.account.role === 'admin' && a.account.role !== 'admin') return 1;
    return a.account.displayName.localeCompare(b.account.displayName);
  });
}

export async function updateUserAccessControl(
  targetUid: string,
  updates: { status?: UserAccessStatus; role?: UserRole; displayName?: string }
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (updates.status) payload.status = updates.status;
  if (updates.role) payload.role = updates.role;
  if (updates.displayName) payload.displayName = updates.displayName.slice(0, 120);

  try {
    await updateDoc(doc(db, 'users', targetUid), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}

export async function fetchAdminSheetConfig(): Promise<WorkspaceSheetConfigRecord | null> {
  try {
    const snap = await getDoc(doc(db, 'adminConfig', 'sheets'));
    if (!snap.exists()) return null;
    return snap.data() as WorkspaceSheetConfigRecord;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'adminConfig/sheets');
  }
}

export async function saveAdminSheetConfig(
  config: Omit<WorkspaceSheetConfigRecord, 'updatedAt'>
): Promise<void> {
  const ref = doc(db, 'adminConfig', 'sheets');
  const payload = {
    spreadsheetId: config.spreadsheetId.slice(0, 128),
    spreadsheetUrl: config.spreadsheetUrl.slice(0, 500),
    spreadsheetTitle: config.spreadsheetTitle.slice(0, 200),
    lastPushAt: config.lastPushAt.slice(0, 64),
    lastPullAt: config.lastPullAt.slice(0, 64),
    lastSyncSummary: config.lastSyncSummary.slice(0, 300),
    updatedByUid: config.updatedByUid.slice(0, 128),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(ref, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'adminConfig/sheets');
  }
}
