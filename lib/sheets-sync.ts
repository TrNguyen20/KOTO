import {
  AdminUserRow,
  UserAccessStatus,
  UserRole,
} from '@/lib/koto-db-types';
import { MINNA_LESSONS_META } from '@/lib/minna-index';
import { loadMinnaLessonPack } from '@/lib/minna/loader';

export const KOTO_SHEET_TABS = [
  'Users',
  'Progress',
  'Curriculum_Index',
  'Vocab_Bank',
  'Grammar_Bank',
  'Kanji_Bank',
  'SRS_Snapshot',
  'Sync_Logs',
] as const;

export interface SheetMetadataResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheetTitles: string[];
  missingTabs: string[];
}

export interface SheetUserPullDiff {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserAccessStatus;
}

export function extractSpreadsheetId(rawInput: string): string | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]{10,128})/);
  if (urlMatch?.[1]) return urlMatch[1];
  if (/^[a-zA-Z0-9_-]{10,128}$/.test(trimmed)) return trimmed;
  return null;
}

export async function listDriveSpreadsheets(
  accessToken: string
): Promise<{ id: string; name: string; webViewLink?: string; modifiedTime?: string }[]> {
  const res = await fetch('/api/drive', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to list Google Drive spreadsheets.');
  }
  return Array.isArray(data.files) ? data.files : [];
}

export async function inspectSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<SheetMetadataResult> {
  const res = await fetch(
    `/api/sheets?action=metadata&spreadsheetId=${encodeURIComponent(spreadsheetId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to inspect Google Sheet.');
  }
  const sheetTitles: string[] = Array.isArray(data.sheets)
    ? data.sheets
        .map((s: { properties?: { title?: string } }) => s.properties?.title || '')
        .filter(Boolean)
    : [];
  const missingTabs = KOTO_SHEET_TABS.filter((tab) => !sheetTitles.includes(tab));

  return {
    spreadsheetId: data.spreadsheetId || spreadsheetId,
    spreadsheetUrl:
      data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    title: data.properties?.title || 'KOTO Master Spreadsheet',
    sheetTitles,
    missingTabs,
  };
}

export async function createMasterSpreadsheet(
  accessToken: string,
  title = 'KOTO — Minna Database & Learner Ledger'
): Promise<SheetMetadataResult> {
  const res = await fetch('/api/sheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'create',
      title,
      tabTitles: [...KOTO_SHEET_TABS],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to create Google Sheet.');
  }
  const spreadsheetId = data.spreadsheetId as string;
  return {
    spreadsheetId,
    spreadsheetUrl:
      data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    title: data.properties?.title || title,
    sheetTitles: [...KOTO_SHEET_TABS],
    missingTabs: [],
  };
}

export async function ensureKotoTabs(
  accessToken: string,
  spreadsheetId: string,
  missingTabs: string[]
): Promise<void> {
  if (missingTabs.length === 0) return;
  const res = await fetch('/api/sheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'addTabs',
      spreadsheetId,
      tabTitles: missingTabs,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to create missing KOTO sheet tabs.');
  }
}

export async function buildFullSheetPayload(
  users: AdminUserRow[],
  actorEmail: string
): Promise<{
  valueRanges: { range: string; values: (string | number | boolean)[][] }[];
  counts: {
    users: number;
    curriculum: number;
    vocab: number;
    grammar: number;
    kanji: number;
    srs: number;
  };
}> {
  const nowIso = new Date().toISOString();

  const usersRows: (string | number | boolean)[][] = [
    [
      'uid',
      'email',
      'displayName',
      'role',
      'status',
      'activeLessonNumber',
      'completedLessonsCount',
      'updatedAt',
    ],
    ...users.map((u) => [
      u.account.uid,
      u.email,
      u.account.displayName,
      u.account.role,
      u.account.status,
      u.account.activeLessonNumber,
      u.account.completedLessonsCount,
      nowIso,
    ]),
  ];

  const progressRows: (string | number | boolean)[][] = [
    [
      'uid',
      'email',
      'activeJlpt',
      'activeLessonNumber',
      'completedLessons',
      'srsDueCount',
      'srsReviewedCount',
      'srsMasteredCount',
      'streakDays',
      'examBestScore',
      'bookmarkedKanji',
      'weeklyMinutes',
      'updatedAt',
    ],
    ...users.map((u) => {
      const p = u.progress;
      return [
        u.account.uid,
        u.email,
        p?.activeJlpt ?? 'N5',
        p?.activeLessonNumber ?? u.account.activeLessonNumber,
        (p?.completedLessons ?? []).join(','),
        p?.srsQueue?.length ?? 0,
        p?.srsReviewedCount ?? 0,
        p?.srsMasteredCount ?? 0,
        p?.streakDays ?? 0,
        p?.examBestScore ?? 0,
        (p?.bookmarkedKanji ?? []).join(','),
        (p?.weeklyMinutes ?? [0, 0, 0, 0, 0, 0, 0]).join(','),
        nowIso,
      ];
    }),
  ];

  const curriculumRows: (string | number | boolean)[][] = [
    [
      'lessonNumber',
      'jlpt',
      'unitNumber',
      'titleJp',
      'titleEn',
      'titleVi',
      'topicTag',
      'grammarSummary',
      'status',
    ],
    ...MINNA_LESSONS_META.map((m) => [
      m.lessonNumber,
      m.jlpt,
      m.unitNumber,
      m.titleJp,
      m.titleEn,
      m.titleVi,
      m.topicTag,
      m.grammarSummary.join(' | '),
      m.status,
    ]),
  ];

  const vocabRows: (string | number | boolean)[][] = [
    ['id', 'lesson', 'word', 'reading', 'romaji', 'pos', 'meaningEn', 'meaningVi', 'pitchType', 'audioUrl'],
  ];
  const grammarRows: (string | number | boolean)[][] = [
    ['id', 'lesson', 'shortLabel', 'title', 'patternFormula', 'summaryEn', 'summaryVi'],
  ];
  const kanjiRows: (string | number | boolean)[][] = [
    ['lesson', 'char', 'jlpt', 'strokes', 'radical', 'onyomi', 'kunyomi', 'meaning', 'meaningVi', 'mnemonic'],
  ];

  for (let lesson = 1; lesson <= 25; lesson += 1) {
    const pack = await loadMinnaLessonPack(lesson);
    if (!pack) continue;
    for (const v of pack.vocab) {
      vocabRows.push([
        v.id,
        v.lesson,
        v.word,
        v.reading,
        v.romaji,
        v.pos,
        v.meaningEn,
        v.meaningVi,
        v.pitchType,
        v.audioUrl ?? '',
      ]);
    }
    for (const g of pack.grammar) {
      grammarRows.push([
        g.id,
        g.lesson,
        g.shortLabel,
        g.title,
        g.patternFormula,
        g.summaryEn,
        g.summaryVi,
      ]);
    }
    for (const k of pack.kanji) {
      kanjiRows.push([
        k.lesson,
        k.char,
        k.jlpt,
        k.strokes,
        k.radical,
        k.onyomi,
        k.kunyomi,
        k.meaning,
        k.meaningVi,
        k.mnemonic,
      ]);
    }
  }

  const srsRows: (string | number | boolean)[][] = [
    ['uid', 'email', 'cardId', 'front', 'reading', 'meaning', 'jlpt', 'context'],
  ];
  for (const u of users) {
    for (const c of u.progress?.srsQueue ?? []) {
      srsRows.push([u.account.uid, u.email, c.id, c.front, c.reading, c.meaning, c.jlpt, c.context ?? '']);
    }
  }

  const syncLogHeader: (string | number | boolean)[][] = [
    ['timestamp', 'actorEmail', 'direction', 'summary'],
    [
      nowIso,
      actorEmail,
      'PUSH',
      `Users: ${users.length}, Lessons: ${MINNA_LESSONS_META.length}, Vocab: ${vocabRows.length - 1}, Grammar: ${grammarRows.length - 1}, Kanji: ${kanjiRows.length - 1}`,
    ],
  ];

  return {
    valueRanges: [
      { range: 'Users!A1', values: usersRows },
      { range: 'Progress!A1', values: progressRows },
      { range: 'Curriculum_Index!A1', values: curriculumRows },
      { range: 'Vocab_Bank!A1', values: vocabRows },
      { range: 'Grammar_Bank!A1', values: grammarRows },
      { range: 'Kanji_Bank!A1', values: kanjiRows },
      { range: 'SRS_Snapshot!A1', values: srsRows },
      { range: 'Sync_Logs!A1', values: syncLogHeader },
    ],
    counts: {
      users: users.length,
      curriculum: MINNA_LESSONS_META.length,
      vocab: vocabRows.length - 1,
      grammar: grammarRows.length - 1,
      kanji: kanjiRows.length - 1,
      srs: srsRows.length - 1,
    },
  };
}

export async function pushAllToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  users: AdminUserRow[],
  actorEmail: string
) {
  const meta = await inspectSpreadsheet(accessToken, spreadsheetId);
  if (meta.missingTabs.length > 0) {
    await ensureKotoTabs(accessToken, spreadsheetId, meta.missingTabs);
  }

  const clearRanges = KOTO_SHEET_TABS.filter((t) => t !== 'Sync_Logs').map((t) => `${t}!A1:Z5000`);
  const clearRes = await fetch('/api/sheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'batchClear',
      spreadsheetId,
      ranges: clearRanges,
    }),
  });
  if (!clearRes.ok) {
    const err = await clearRes.json();
    throw new Error(err.error || 'Failed to clear existing Google Sheet tabs.');
  }

  const { valueRanges, counts } = await buildFullSheetPayload(users, actorEmail);
  const writeData = valueRanges.filter((vr) => vr.range !== 'Sync_Logs!A1');
  const writeRes = await fetch('/api/sheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'batchWrite',
      spreadsheetId,
      valueRanges: writeData,
    }),
  });
  const writeJson = await writeRes.json();
  if (!writeRes.ok) {
    throw new Error(writeJson.error || 'Failed to push rows to Google Sheets.');
  }

  const logEntry = valueRanges.find((vr) => vr.range === 'Sync_Logs!A1')?.values?.[1] ?? [
    new Date().toISOString(),
    actorEmail,
    'PUSH',
    `Exported ${counts.users} users & ${counts.vocab} vocab rows`,
  ];

  await fetch('/api/sheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'appendLog',
      spreadsheetId,
      values: [logEntry],
    }),
  });

  return { meta, counts };
}

export async function pullUsersFromGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  currentUsers: AdminUserRow[]
): Promise<SheetUserPullDiff[]> {
  const params = new URLSearchParams({
    action: 'batchGet',
    spreadsheetId,
  });
  params.append('ranges', 'Users!A1:H500');

  const res = await fetch(`/api/sheets?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to read Users tab from Google Sheets.');
  }

  const rows: string[][] = data?.valueRanges?.[0]?.values ?? [];
  if (rows.length <= 1) return [];

  const header = rows[0].map((h) => String(h).trim());
  const uidIdx = header.indexOf('uid');
  const emailIdx = header.indexOf('email');
  const nameIdx = header.indexOf('displayName');
  const roleIdx = header.indexOf('role');
  const statusIdx = header.indexOf('status');
  if (uidIdx === -1 || roleIdx === -1 || statusIdx === -1) {
    throw new Error('Users tab is missing required columns (uid, role, status).');
  }

  const currentMap = new Map(currentUsers.map((u) => [u.account.uid, u]));
  const diffs: SheetUserPullDiff[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const uid = String(row[uidIdx] ?? '').trim();
    const roleRaw = String(row[roleIdx] ?? '').trim().toLowerCase();
    const statusRaw = String(row[statusIdx] ?? '').trim().toLowerCase();
    if (!uid || !currentMap.has(uid)) continue;
    if (roleRaw !== 'admin' && roleRaw !== 'student') continue;
    if (statusRaw !== 'pending' && statusRaw !== 'active' && statusRaw !== 'suspended') continue;

    const existing = currentMap.get(uid)!;
    const displayName =
      nameIdx !== -1 && row[nameIdx]
        ? String(row[nameIdx]).trim().slice(0, 120)
        : existing.account.displayName;
    if (
      existing.account.role !== roleRaw ||
      existing.account.status !== statusRaw ||
      existing.account.displayName !== displayName
    ) {
      diffs.push({
        uid,
        email: emailIdx !== -1 ? String(row[emailIdx] ?? existing.email) : existing.email,
        displayName,
        role: roleRaw as UserRole,
        status: statusRaw as UserAccessStatus,
      });
    }
  }

  return diffs;
}
