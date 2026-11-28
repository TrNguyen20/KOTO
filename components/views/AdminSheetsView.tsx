'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Database,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Plus,
  Search,
  CheckCircle2,
  Ban,
  Shield,
  FolderOpen,
  AlertTriangle,
  Loader2,
  KeyRound,
  Link2,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import { getAccessToken } from '@/lib/firebase';
import {
  fetchAdminSheetConfig,
  fetchAllUsersForAdmin,
  saveAdminSheetConfig,
  updateUserAccessControl,
} from '@/lib/firestore-service';
import {
  AdminUserRow,
  BOOTSTRAP_ADMIN_EMAIL,
  UserAccessStatus,
  UserRole,
  WorkspaceSheetConfigRecord,
} from '@/lib/koto-db-types';
import {
  buildFullSheetPayload,
  createMasterSpreadsheet,
  ensureKotoTabs,
  extractSpreadsheetId,
  inspectSpreadsheet,
  KOTO_SHEET_TABS,
  listDriveSpreadsheets,
  pullUsersFromGoogleSheets,
  pushAllToGoogleSheets,
  SheetUserPullDiff,
} from '@/lib/sheets-sync';

type ConfirmModalState =
  | {
      type: 'create-sheet';
      title: string;
    }
  | {
      type: 'ensure-tabs';
      spreadsheetId: string;
      spreadsheetUrl: string;
      spreadsheetTitle: string;
      missingTabs: string[];
    }
  | {
      type: 'push-sheets';
      spreadsheetId: string;
      spreadsheetTitle: string;
      counts: {
        users: number;
        curriculum: number;
        vocab: number;
        grammar: number;
        kanji: number;
        srs: number;
      };
    }
  | {
      type: 'pull-users';
      spreadsheetId: string;
      diffs: SheetUserPullDiff[];
    }
  | {
      type: 'user-mutation';
      targetUid: string;
      email: string;
      displayName: string;
      updates: { status?: UserAccessStatus; role?: UserRole };
      actionLabel: string;
    }
  | null;

export function AdminSheetsView() {
  const {
    firebaseUser,
    userAccount,
    userEmail,
    hasOAuthToken,
    signInWithGoogle,
    setRoute,
    showToast,
  } = useKoto();

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [sheetConfig, setSheetConfig] = useState<WorkspaceSheetConfigRecord | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Sheet Link / Drive Picker State
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [driveFiles, setDriveFiles] = useState<
    { id: string; name: string; webViewLink?: string; modifiedTime?: string }[]
  >([]);
  const [showDrivePicker, setShowDrivePicker] = useState(false);

  // User Table Filters
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserAccessStatus>('all');

  // Explicit In-App Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(null);

  const isAdmin = userAccount?.role === 'admin' && userAccount?.status === 'active';
  const token = getAccessToken();
  const hasToken = Boolean(token || hasOAuthToken);

  const loadConsoleData = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingData(true);
    setErrorBanner(null);
    try {
      const [userRows, config] = await Promise.all([
        fetchAllUsersForAdmin(),
        fetchAdminSheetConfig(),
      ]);
      setUsers(userRows);
      setSheetConfig(config);
      if (config?.spreadsheetUrl) {
        setSheetUrlInput(config.spreadsheetUrl);
      }
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to load admin console.');
    } finally {
      setLoadingData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const t = setTimeout(() => {
      void loadConsoleData();
    }, 0);
    return () => clearTimeout(t);
  }, [isAdmin, loadConsoleData]);

  const requireToken = useCallback((): string | null => {
    const t = getAccessToken();
    if (!t) {
      setErrorBanner(
        'Google Drive & Sheets session token is not active in memory. Click "Re-authorize Google Sheets Session" first.'
      );
      return null;
    }
    return t;
  }, []);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter !== 'all' && u.account.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.account.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.account.role.toLowerCase().includes(q)
      );
    });
  }, [users, userSearch, statusFilter]);

  const pendingCount = useMemo(
    () => users.filter((u) => u.account.status === 'pending').length,
    [users]
  );

  const handleBrowseDrive = async () => {
    const t = requireToken();
    if (!t) return;
    setBusyAction('drive-list');
    setErrorBanner(null);
    try {
      const files = await listDriveSpreadsheets(t);
      setDriveFiles(files);
      setShowDrivePicker(true);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to list Google Drive files.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleInspectAndBindSheet = async (rawInput: string) => {
    const t = requireToken();
    if (!t || !firebaseUser) return;
    const spreadsheetId = extractSpreadsheetId(rawInput);
    if (!spreadsheetId) {
      setErrorBanner('Invalid Google Sheets URL or Spreadsheet ID.');
      return;
    }
    setBusyAction('inspect-sheet');
    setErrorBanner(null);
    try {
      const meta = await inspectSpreadsheet(t, spreadsheetId);
      if (meta.missingTabs.length > 0) {
        setConfirmModal({
          type: 'ensure-tabs',
          spreadsheetId: meta.spreadsheetId,
          spreadsheetUrl: meta.spreadsheetUrl,
          spreadsheetTitle: meta.title,
          missingTabs: meta.missingTabs,
        });
      } else {
        const nextConfig: Omit<WorkspaceSheetConfigRecord, 'updatedAt'> = {
          spreadsheetId: meta.spreadsheetId,
          spreadsheetUrl: meta.spreadsheetUrl,
          spreadsheetTitle: meta.title,
          lastPushAt: sheetConfig?.lastPushAt || '',
          lastPullAt: sheetConfig?.lastPullAt || '',
          lastSyncSummary: `Connected to "${meta.title}" (${meta.sheetTitles.length} tabs verified)`,
          updatedByUid: firebaseUser.uid,
        };
        await saveAdminSheetConfig(nextConfig);
        setSheetConfig(nextConfig);
        setSheetUrlInput(meta.spreadsheetUrl);
        setShowDrivePicker(false);
        showToast(`Connected Google Sheet: ${meta.title}`);
      }
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to inspect Google Sheet.');
    } finally {
      setBusyAction(null);
    }
  };

  const handlePreparePush = async () => {
    const t = requireToken();
    if (!t || !sheetConfig?.spreadsheetId) return;
    setBusyAction('prepare-push');
    setErrorBanner(null);
    try {
      const preview = await buildFullSheetPayload(users, userEmail);
      setConfirmModal({
        type: 'push-sheets',
        spreadsheetId: sheetConfig.spreadsheetId,
        spreadsheetTitle: sheetConfig.spreadsheetTitle,
        counts: preview.counts,
      });
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to prepare export payload.');
    } finally {
      setBusyAction(null);
    }
  };

  const handlePreparePull = async () => {
    const t = requireToken();
    if (!t || !sheetConfig?.spreadsheetId) return;
    setBusyAction('prepare-pull');
    setErrorBanner(null);
    try {
      const diffs = await pullUsersFromGoogleSheets(t, sheetConfig.spreadsheetId, users);
      if (diffs.length === 0) {
        showToast('Users tab in Google Sheets already matches Firestore.');
      } else {
        setConfirmModal({
          type: 'pull-users',
          spreadsheetId: sheetConfig.spreadsheetId,
          diffs,
        });
      }
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to inspect Users tab.');
    } finally {
      setBusyAction(null);
    }
  };

  const executeConfirmedAction = async () => {
    if (!confirmModal || !firebaseUser) return;

    if (confirmModal.type === 'user-mutation') {
      setBusyAction('user-mutation');
      setErrorBanner(null);
      try {
        await updateUserAccessControl(confirmModal.targetUid, confirmModal.updates);
        setConfirmModal(null);
        await loadConsoleData();
        showToast(`Updated ${confirmModal.displayName}: ${confirmModal.actionLabel}`);
      } catch (err) {
        setErrorBanner(err instanceof Error ? err.message : 'Failed to update user access.');
      } finally {
        setBusyAction(null);
      }
      return;
    }

    const t = requireToken();
    if (!t) {
      setConfirmModal(null);
      return;
    }

    if (confirmModal.type === 'create-sheet') {
      setBusyAction('create-sheet');
      setErrorBanner(null);
      try {
        const created = await createMasterSpreadsheet(t, confirmModal.title);
        const nextConfig: Omit<WorkspaceSheetConfigRecord, 'updatedAt'> = {
          spreadsheetId: created.spreadsheetId,
          spreadsheetUrl: created.spreadsheetUrl,
          spreadsheetTitle: created.title,
          lastPushAt: '',
          lastPullAt: '',
          lastSyncSummary: 'Created master Google Sheet with 8 KOTO tabs',
          updatedByUid: firebaseUser.uid,
        };
        await saveAdminSheetConfig(nextConfig);
        setSheetConfig(nextConfig);
        setSheetUrlInput(created.spreadsheetUrl);
        setConfirmModal(null);
        showToast('Created master Google Sheet!');
      } catch (err) {
        setErrorBanner(err instanceof Error ? err.message : 'Failed to create Google Sheet.');
      } finally {
        setBusyAction(null);
      }
      return;
    }

    if (confirmModal.type === 'ensure-tabs') {
      setBusyAction('ensure-tabs');
      setErrorBanner(null);
      try {
        await ensureKotoTabs(t, confirmModal.spreadsheetId, confirmModal.missingTabs);
        const nextConfig: Omit<WorkspaceSheetConfigRecord, 'updatedAt'> = {
          spreadsheetId: confirmModal.spreadsheetId,
          spreadsheetUrl: confirmModal.spreadsheetUrl,
          spreadsheetTitle: confirmModal.spreadsheetTitle,
          lastPushAt: sheetConfig?.lastPushAt || '',
          lastPullAt: sheetConfig?.lastPullAt || '',
          lastSyncSummary: `Connected & added ${confirmModal.missingTabs.length} missing tabs`,
          updatedByUid: firebaseUser.uid,
        };
        await saveAdminSheetConfig(nextConfig);
        setSheetConfig(nextConfig);
        setSheetUrlInput(confirmModal.spreadsheetUrl);
        setShowDrivePicker(false);
        setConfirmModal(null);
        showToast(`Connected "${confirmModal.spreadsheetTitle}" with all 8 tabs.`);
      } catch (err) {
        setErrorBanner(err instanceof Error ? err.message : 'Failed to add missing tabs.');
      } finally {
        setBusyAction(null);
      }
      return;
    }

    if (confirmModal.type === 'push-sheets') {
      setBusyAction('push-sheets');
      setErrorBanner(null);
      try {
        const result = await pushAllToGoogleSheets(
          t,
          confirmModal.spreadsheetId,
          users,
          userEmail
        );
        const nowIso = new Date().toISOString();
        const summary = `Pushed ${result.counts.users} users, ${result.counts.curriculum} lessons, ${result.counts.vocab} vocab, ${result.counts.grammar} grammar, ${result.counts.kanji} kanji`;
        const nextConfig: Omit<WorkspaceSheetConfigRecord, 'updatedAt'> = {
          spreadsheetId: result.meta.spreadsheetId,
          spreadsheetUrl: result.meta.spreadsheetUrl,
          spreadsheetTitle: result.meta.title,
          lastPushAt: nowIso,
          lastPullAt: sheetConfig?.lastPullAt || '',
          lastSyncSummary: summary,
          updatedByUid: firebaseUser.uid,
        };
        await saveAdminSheetConfig(nextConfig);
        setSheetConfig(nextConfig);
        setConfirmModal(null);
        showToast('Database pushed to Google Sheets!');
      } catch (err) {
        setErrorBanner(err instanceof Error ? err.message : 'Failed to push database to Sheets.');
      } finally {
        setBusyAction(null);
      }
      return;
    }

    if (confirmModal.type === 'pull-users') {
      setBusyAction('pull-users');
      setErrorBanner(null);
      try {
        for (const diff of confirmModal.diffs) {
          await updateUserAccessControl(diff.uid, {
            role: diff.role,
            status: diff.status,
            displayName: diff.displayName,
          });
        }
        const nowIso = new Date().toISOString();
        if (sheetConfig) {
          const nextConfig: Omit<WorkspaceSheetConfigRecord, 'updatedAt'> = {
            ...sheetConfig,
            lastPullAt: nowIso,
            lastSyncSummary: `Pulled ${confirmModal.diffs.length} user governance updates from Sheets`,
            updatedByUid: firebaseUser.uid,
          };
          await saveAdminSheetConfig(nextConfig);
          setSheetConfig(nextConfig);
        }
        setConfirmModal(null);
        await loadConsoleData();
        showToast(`Applied ${confirmModal.diffs.length} user changes from Google Sheets.`);
      } catch (err) {
        setErrorBanner(err instanceof Error ? err.message : 'Failed to apply user changes.');
      } finally {
        setBusyAction(null);
      }
    }
  };

  const handleQuickApprove = async (row: AdminUserRow) => {
    setBusyAction(`approve-${row.account.uid}`);
    setErrorBanner(null);
    try {
      await updateUserAccessControl(row.account.uid, { status: 'active' });
      await loadConsoleData();
      showToast(`Approved ${row.account.displayName}`);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to approve user.');
    } finally {
      setBusyAction(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto bg-surface-container-lowest rounded-lg border border-on-surface/15 p-8 text-center space-y-4">
        <Shield className="w-8 h-8 text-primary mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-on-surface">
          Administrator Access Required
        </h1>
        <p className="text-xs text-on-surface-variant">
          Only active system administrators can manage registered learners and Google Sheets backend synchronization.
        </p>
        <button
          type="button"
          onClick={() => setRoute('dashboard')}
          className="px-4 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
            ADMIN &amp; SHEETS BACKEND · 管理者コンソール
          </div>
          <h1 className="font-serif text-3xl font-bold text-on-surface mt-1">
            Database &amp; Learner Access Control
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Manage Google Sign-In approvals in Firestore and synchronize all 8 relational tabs with Google Sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadConsoleData()}
            disabled={loadingData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-surface-container-lowest border border-on-surface/15 text-xs font-semibold text-on-surface hover:border-primary/40 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <button
            type="button"
            onClick={() => void signInWithGoogle(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold cursor-pointer border ${
              hasToken
                ? 'bg-tertiary-fixed/40 border-tertiary/30 text-tertiary'
                : 'bg-primary text-on-primary border-primary'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>
              {hasToken ? 'Sheets OAuth Active' : 'Re-authorize Google Sheets Session'}
            </span>
          </button>
        </div>
      </div>

      {errorBanner && (
        <div className="p-3.5 rounded-md bg-error-container/60 border border-error/30 text-xs text-on-error-container flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="font-mono text-[11px] underline shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Google Sheets Backend Connection Panel */}
      <section className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-on-surface/10">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface">
                Google Sheets Backend Connection
              </h2>
              <p className="text-xs text-outline">
                8 tabs: {KOTO_SHEET_TABS.join(' · ')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setConfirmModal({
                  type: 'create-sheet',
                  title: 'KOTO — Minna Database & Learner Ledger',
                })
              }
              disabled={!hasToken || busyAction !== null}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Master Google Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => void handleBrowseDrive()}
              disabled={!hasToken || busyAction !== null}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-surface-container-low border border-on-surface/15 text-xs font-semibold text-on-surface hover:border-primary/40 cursor-pointer disabled:opacity-50"
            >
              <FolderOpen className="w-3.5 h-3.5 text-secondary" />
              <span>Browse Drive Sheets</span>
            </button>
          </div>
        </div>

        {/* Paste Existing Sheet URL / ID */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Link2 className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={sheetUrlInput}
              onChange={(e) => setSheetUrlInput(e.target.value)}
              placeholder="Paste existing Google Sheet URL or Spreadsheet ID..."
              className="w-full pl-8 pr-3 py-2 rounded-md bg-surface-container-low border border-on-surface/15 text-xs font-mono text-on-surface outline-none focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleInspectAndBindSheet(sheetUrlInput)}
            disabled={!hasToken || !sheetUrlInput.trim() || busyAction !== null}
            className="px-4 py-2 rounded-md bg-secondary text-on-secondary text-xs font-semibold cursor-pointer disabled:opacity-50 shrink-0"
          >
            {busyAction === 'inspect-sheet' ? 'Inspecting...' : 'Inspect & Connect Sheet'}
          </button>
        </div>

        {/* Drive Picker Drawer */}
        {showDrivePicker && (
          <div className="p-4 rounded-md bg-surface-container-low border border-on-surface/15 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Your Google Drive Spreadsheets</span>
              <button
                type="button"
                onClick={() => setShowDrivePicker(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                Close
              </button>
            </div>
            {driveFiles.length === 0 ? (
              <div className="text-xs text-outline">No spreadsheets found in your Google Drive.</div>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-on-surface/10">
                {driveFiles.map((f) => (
                  <div
                    key={f.id}
                    className="py-2 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-on-surface truncate">{f.name}</div>
                      <div className="text-[10px] font-mono text-outline truncate">{f.id}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleInspectAndBindSheet(f.id)}
                      className="px-2.5 py-1 rounded-sm bg-primary text-on-primary text-[11px] font-semibold shrink-0 cursor-pointer"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Sheet Status & 2-Way Sync Buttons */}
        {sheetConfig ? (
          <div className="p-4 rounded-md bg-surface-container-low border border-on-surface/12 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-tertiary-fixed text-tertiary">
                  BOUND SHEET
                </span>
                <a
                  href={sheetConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-base font-bold text-primary hover:underline inline-flex items-center gap-1 truncate"
                >
                  <span className="truncate">{sheetConfig.spreadsheetTitle}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
              <div className="text-xs text-on-surface-variant">
                {sheetConfig.lastSyncSummary || 'Connected to Google Sheets.'}
              </div>
              <div className="text-[11px] font-mono text-outline flex flex-wrap gap-4 tabular-nums">
                <span>
                  Last Push: {sheetConfig.lastPushAt ? new Date(sheetConfig.lastPushAt).toLocaleString() : 'Never'}
                </span>
                <span>
                  Last Pull: {sheetConfig.lastPullAt ? new Date(sheetConfig.lastPullAt).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => void handlePreparePush()}
                disabled={!hasToken || busyAction !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer disabled:opacity-50"
              >
                {busyAction === 'prepare-push' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5" />
                )}
                <span>Push All DB → Sheets</span>
              </button>
              <button
                type="button"
                onClick={() => void handlePreparePull()}
                disabled={!hasToken || busyAction !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-surface-container-lowest border border-on-surface/20 text-xs font-semibold text-on-surface hover:border-secondary cursor-pointer disabled:opacity-50"
              >
                {busyAction === 'prepare-pull' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <DownloadCloud className="w-3.5 h-3.5 text-secondary" />
                )}
                <span>Pull Users ← Sheets</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-md bg-surface-container-low border border-dashed border-on-surface/20 text-xs text-outline">
            No Google Sheet connected yet. Click <strong>Create Master Google Sheet</strong> or paste an existing Spreadsheet URL above.
          </div>
        )}
      </section>

      {/* Registered Users & Access Control Ledger */}
      <section className="bg-surface-container-lowest rounded-lg border border-on-surface/12 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-on-surface">
              Registered Learners &amp; Access Control
            </h2>
            <p className="text-xs text-outline tabular-nums">
              {users.length} total accounts · {pendingCount} pending approval
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-md bg-surface-container border border-on-surface/10 text-xs">
              {(['all', 'pending', 'active', 'suspended'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-xs capitalize font-medium cursor-pointer ${
                    statusFilter === st
                      ? 'bg-surface-container-lowest text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-outline absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Filter by name or email..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface-container-low border border-on-surface/15 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-on-surface/15 text-[10px] font-mono uppercase tracking-wider text-outline">
                <th className="py-2.5 pr-3">Learner</th>
                <th className="py-2.5 pr-3">Role</th>
                <th className="py-2.5 pr-3">Status</th>
                <th className="py-2.5 pr-3 text-right">Lessons Done</th>
                <th className="py-2.5 pr-3 text-right">Active</th>
                <th className="py-2.5 pr-3 text-right">SRS Mastered</th>
                <th className="py-2.5 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/8">
              {filteredUsers.map((row) => {
                const isBootstrap =
                  row.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
                const isSelf = row.account.uid === firebaseUser?.uid;
                const statusBadge =
                  row.account.status === 'active'
                    ? 'bg-tertiary-fixed text-tertiary'
                    : row.account.status === 'pending'
                      ? 'bg-secondary-fixed text-secondary'
                      : 'bg-error-container text-on-error-container';

                return (
                  <tr key={row.account.uid} className="hover:bg-surface-container-low/60">
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold text-on-surface">
                        {row.account.displayName}
                      </div>
                      <div className="text-[11px] font-mono text-outline">{row.email}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold uppercase ${
                          row.account.role === 'admin'
                            ? 'bg-primary-fixed text-primary'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {row.account.role}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold uppercase ${statusBadge}`}
                      >
                        {row.account.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                      {row.account.completedLessonsCount} / 25
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                      L{String(row.account.activeLessonNumber).padStart(2, '0')}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                      {row.progress?.srsMasteredCount ?? 0}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {row.account.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => void handleQuickApprove(row)}
                            disabled={busyAction !== null}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-tertiary text-on-tertiary text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        )}
                        {row.account.status === 'suspended' && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                type: 'user-mutation',
                                targetUid: row.account.uid,
                                email: row.email,
                                displayName: row.account.displayName,
                                updates: { status: 'active' },
                                actionLabel: 'Reactivate workspace access',
                              })
                            }
                            className="px-2.5 py-1 rounded-xs bg-tertiary-fixed text-tertiary text-[11px] font-semibold cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}
                        {row.account.status === 'active' && !isBootstrap && !isSelf && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                type: 'user-mutation',
                                targetUid: row.account.uid,
                                email: row.email,
                                displayName: row.account.displayName,
                                updates: { status: 'suspended' },
                                actionLabel: 'Suspend workspace access',
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs border border-error/30 text-error text-[11px] font-semibold hover:bg-error-container/30 cursor-pointer"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Suspend</span>
                          </button>
                        )}
                        {!isBootstrap && !isSelf && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                type: 'user-mutation',
                                targetUid: row.account.uid,
                                email: row.email,
                                displayName: row.account.displayName,
                                updates: {
                                  role: row.account.role === 'admin' ? 'student' : 'admin',
                                },
                                actionLabel:
                                  row.account.role === 'admin'
                                    ? 'Demote role to student'
                                    : 'Promote role to admin',
                              })
                            }
                            className="px-2.5 py-1 rounded-xs bg-surface-container-low border border-on-surface/15 text-[11px] font-medium text-on-surface hover:border-primary/40 cursor-pointer"
                          >
                            {row.account.role === 'admin' ? 'Set Student' : 'Make Admin'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loadingData && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-outline">
                    No user accounts matched the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Explicit Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-on-surface/45 backdrop-blur-xs"
            onClick={() => busyAction === null && setConfirmModal(null)}
          />
          <div className="relative z-10 w-full max-w-lg bg-surface-container-lowest rounded-lg border border-on-surface/20 p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-primary font-serif text-lg font-bold">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                {confirmModal.type === 'create-sheet' && 'Create Master Google Sheet'}
                {confirmModal.type === 'ensure-tabs' && 'Add Missing KOTO Tabs to Sheet'}
                {confirmModal.type === 'push-sheets' && 'Confirm Database Push to Google Sheets'}
                {confirmModal.type === 'pull-users' && 'Confirm Pulling User Changes from Sheets'}
                {confirmModal.type === 'user-mutation' && 'Confirm Learner Access Change'}
              </span>
            </div>

            <div className="text-xs text-on-surface-variant leading-relaxed space-y-2">
              {confirmModal.type === 'create-sheet' && (
                <p>
                  This will create a new Google Spreadsheet titled{' '}
                  <strong className="text-on-surface">{confirmModal.title}</strong> in your Google Drive with 8 structured tabs ({KOTO_SHEET_TABS.join(', ')}).
                </p>
              )}
              {confirmModal.type === 'ensure-tabs' && (
                <p>
                  The spreadsheet <strong className="text-on-surface">{confirmModal.spreadsheetTitle}</strong> is missing {confirmModal.missingTabs.length} required KOTO tabs:{' '}
                  <strong className="font-mono text-on-surface">{confirmModal.missingTabs.join(', ')}</strong>. Add these tabs now?
                </p>
              )}
              {confirmModal.type === 'push-sheets' && (
                <>
                  <p>
                    This will overwrite tabs in <strong className="text-on-surface">{confirmModal.spreadsheetTitle}</strong> and append an entry to <strong className="font-mono">Sync_Logs</strong>:
                  </p>
                  <div className="p-3 rounded-md bg-surface-container-low border border-on-surface/10 font-mono text-[11px] grid grid-cols-2 gap-1.5 tabular-nums">
                    <span>Users: {confirmModal.counts.users} rows</span>
                    <span>Curriculum_Index: {confirmModal.counts.curriculum} lessons</span>
                    <span>Vocab_Bank: {confirmModal.counts.vocab} words</span>
                    <span>Grammar_Bank: {confirmModal.counts.grammar} patterns</span>
                    <span>Kanji_Bank: {confirmModal.counts.kanji} kanji</span>
                    <span>SRS_Snapshot: {confirmModal.counts.srs} cards</span>
                  </div>
                </>
              )}
              {confirmModal.type === 'pull-users' && (
                <>
                  <p>
                    Apply the following {confirmModal.diffs.length} updates from the Google Sheets <strong className="font-mono">Users</strong> tab into Firestore?
                  </p>
                  <div className="max-h-40 overflow-y-auto p-3 rounded-md bg-surface-container-low border border-on-surface/10 space-y-1.5 font-mono text-[11px]">
                    {confirmModal.diffs.map((d) => (
                      <div key={d.uid} className="flex justify-between gap-2">
                        <span className="truncate text-on-surface">{d.email || d.uid}</span>
                        <span className="text-primary shrink-0">
                          {d.role} · {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {confirmModal.type === 'user-mutation' && (
                <p>
                  Apply action <strong className="text-on-surface">{confirmModal.actionLabel}</strong> for{' '}
                  <strong className="text-on-surface">{confirmModal.displayName}</strong> ({confirmModal.email})?
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-md border border-on-surface/15 text-xs font-semibold text-on-surface cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void executeConfirmedAction()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container cursor-pointer disabled:opacity-50"
              >
                {busyAction !== null && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm &amp; Execute</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
