'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Map,
  Layers,
  BookOpen,
  Grid2x2,
  GitBranch,
  Headphones,
  Mic,
  Library,
  PenTool,
  Award,
  Sparkles,
  Landmark,
  Search,
  Flame,
  Inbox,
  Timer,
  Volume2,
  VolumeX,
  Settings,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Check,
  Languages,
  WifiOff,
  Database,
  LogOut,
} from 'lucide-react';
import { useKoto } from '@/context/KotoContext';
import {
  GRAMMAR_PATTERNS,
  JlptLevel,
  KANJI_ITEMS,
  KotoRoute,
  VOCAB_ITEMS,
} from '@/lib/koto-data';

interface NavItem {
  id: KotoRoute;
  label: string;
  jpLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  dotAccent?: 'primary' | 'tertiary';
}

const ECOSYSTEM_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', jpLabel: 'ホーム', icon: LayoutDashboard },
  { id: 'learning-path', label: 'Learning Path', jpLabel: 'N5–N1', icon: Map },
  { id: 'review-center', label: 'Review Center', jpLabel: 'SRS', icon: Layers },
];

const PILLARS_NAV: NavItem[] = [
  { id: 'vocabulary-lab', label: 'Vocabulary Lab', jpLabel: '語彙', icon: BookOpen },
  { id: 'kanji-studio', label: 'Kanji Studio', jpLabel: '漢字', icon: Grid2x2 },
  { id: 'grammar-studio', label: 'Grammar Studio', jpLabel: '文法', icon: GitBranch },
  { id: 'listening-and-shadowing', label: 'Listening & Shadowing', jpLabel: '聴解', icon: Headphones },
  { id: 'speaking-and-dialogue', label: 'Speaking & Dialogue', jpLabel: '会話', icon: Mic },
  { id: 'reading-and-library', label: 'Reading & Library', jpLabel: '読解', icon: Library },
  { id: 'writing-and-composition', label: 'Writing & Composition', jpLabel: '作文', icon: PenTool },
];

const MASTERY_NAV: NavItem[] = [
  { id: 'jlpt-exam-center', label: 'JLPT Exam Center', jpLabel: '模擬試験', icon: Award },
  { id: 'ai-sensei-tutor', label: 'AI Sensei Tutor', jpLabel: '先生AI', icon: Sparkles, badge: 'AI' },
  { id: 'culture-and-keigo', label: 'Culture & Keigo', jpLabel: '文化・敬語', icon: Landmark },
];

const ADMIN_NAV: NavItem[] = [
  { id: 'admin-database', label: 'Database & Users', jpLabel: '管理', icon: Database },
];

const ROUTE_BREADCRUMBS: Record<KotoRoute, { realm: string; module: string; jp: string }> = {
  dashboard: { realm: 'ECOSYSTEM (基盤)', module: 'Command Center', jp: '台' },
  'learning-path': { realm: 'LEARN (学習)', module: 'Mastery Path', jp: '道' },
  lesson: { realm: 'LEARN (学習)', module: 'Lesson Workspace', jp: '課' },
  'review-center': { realm: 'EVALUATE (評価)', module: 'SRS Review Center', jp: '復' },
  'vocabulary-lab': { realm: 'LANG LABS (言語)', module: 'Vocabulary Lab', jp: '語彙' },
  'kanji-studio': { realm: 'LANG LABS (言語)', module: 'Kanji Studio', jp: '漢字' },
  'grammar-studio': { realm: 'LANG LABS (言語)', module: 'Grammar Studio', jp: '文法' },
  'listening-and-shadowing': { realm: 'LANG LABS (言語)', module: 'Listening Lab', jp: '聴解' },
  'speaking-and-dialogue': { realm: 'LANG LABS (言語)', module: 'Speaking Studio', jp: '会話' },
  'reading-and-library': { realm: 'LANG LABS (言語)', module: 'Reading Archive', jp: '読解' },
  'writing-and-composition': { realm: 'LANG LABS (言語)', module: 'Writing Critique', jp: '作文' },
  'jlpt-exam-center': { realm: 'EVALUATE (評価)', module: 'JLPT Exam Center', jp: '試験' },
  'ai-sensei-tutor': { realm: 'LANG LABS (言語)', module: 'AI Sensei Tutor', jp: '先生' },
  'culture-and-keigo': { realm: 'LANG LABS (言語)', module: 'Culture & Keigo', jp: '敬語' },
  settings: { realm: 'ECOSYSTEM (基盤)', module: 'Preferences', jp: '設定' },
  'admin-database': { realm: 'ADMIN (管理)', module: 'Sheets & Users', jp: '管理' },
};

export function KotoShell({ children }: { children: React.ReactNode }) {
  const {
    userAccount,
    userPhotoUrl,
    signOut,
    route,
    setRoute,
    activeJlpt,
    setActiveJlpt,
    activeLessonNumber,
    completedLessons,
    streakDays,
    weeklyMinutes,
    showFurigana,
    toggleFurigana,
    showRomaji,
    audioEnabled,
    toggleAudioEnabled,
    dueCount,
    commandOpen,
    setCommandOpen,
    openVocab,
    openKanji,
    openGrammar,
    speakJapanese,
    isOnline,
    toastMessage,
  } = useKoto();

  const baseBreadcrumb = ROUTE_BREADCRUMBS[route] ?? ROUTE_BREADCRUMBS.dashboard;
  const breadcrumb =
    route === 'lesson'
      ? {
          ...baseBreadcrumb,
          module: `Lesson ${String(activeLessonNumber).padStart(2, '0')}`,
        }
      : baseBreadcrumb;

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [jlptMenuOpen, setJlptMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const completedN5Count = useMemo(
    () => completedLessons.filter((n) => n >= 1 && n <= 25).length,
    [completedLessons]
  );
  const completedN4Count = useMemo(
    () => completedLessons.filter((n) => n >= 26 && n <= 50).length,
    [completedLessons]
  );
  const n5Pct = Math.round((completedN5Count / 25) * 100);
  const n4Pct = Math.round((completedN4Count / 25) * 100);
  const activeLevelDoneCount = activeJlpt === 'N4' ? completedN4Count : completedN5Count;
  const activeMasteryPct = activeJlpt === 'N4' ? n4Pct : activeJlpt === 'N5' ? n5Pct : 0;

  const jlptLevels = useMemo(
    () => [
      { level: 'N5' as JlptLevel, label: 'JLPT N5', desc: `Foundation · ${n5Pct}%` },
      { level: 'N4' as JlptLevel, label: 'JLPT N4', desc: `Elementary · ${n4Pct}%` },
      { level: 'N3' as JlptLevel, label: 'JLPT N3', desc: 'Intermediate' },
      { level: 'N2' as JlptLevel, label: 'JLPT N2', desc: 'Advanced' },
      { level: 'N1' as JlptLevel, label: 'JLPT N1', desc: 'Mastery' },
    ],
    [n5Pct, n4Pct]
  );

  const completedMinutes = useMemo(() => {
    const todayIdx = (new Date().getDay() + 6) % 7;
    return weeklyMinutes[todayIdx] ?? 0;
  }, [weeklyMinutes]);

  const displayName = userAccount?.displayName || 'Learner';
  const shortName = displayName.split(' ')[0] || displayName;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'K';

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const vocabMatches = VOCAB_ITEMS.filter(
      (v) =>
        !q ||
        v.word.toLowerCase().includes(q) ||
        v.reading.toLowerCase().includes(q) ||
        v.romaji.toLowerCase().includes(q) ||
        v.meaningEn.toLowerCase().includes(q)
    ).slice(0, 4);
    const kanjiMatches = KANJI_ITEMS.filter(
      (k) =>
        !q ||
        k.char.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.onyomi.kana.includes(q) ||
        k.kunyomi.kana.includes(q)
    ).slice(0, 4);
    const grammarMatches = GRAMMAR_PATTERNS.filter(
      (g) =>
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.shortLabel.toLowerCase().includes(q) ||
        g.thesis.toLowerCase().includes(q)
    ).slice(0, 3);
    return { vocabMatches, kanjiMatches, grammarMatches };
  }, [searchQuery]);

  const handleNavClick = (id: KotoRoute) => {
    setRoute(id);
    setMobileNavOpen(false);
  };

  const renderNavSection = (title: string, items: NavItem[]) => (
    <div className="mb-4">
      <div className="px-4 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-outline/75">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            route === item.id ||
            (item.id === 'learning-path' && route === 'lesson');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2 text-[13px] transition-colors text-left cursor-pointer ${
                isActive
                  ? 'bg-surface-container-lowest text-primary font-semibold border-r-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-primary' : 'text-outline'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>
              {item.id === 'review-center' ? (
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-primary-fixed text-primary tabular-nums">
                  {dueCount}
                </span>
              ) : item.badge ? (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary text-on-primary">
                  {item.badge}
                </span>
              ) : (
                <span className="text-[10px] font-serif text-outline/70 shrink-0">
                  {item.jpLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface-container-low border-r border-outline-variant/25">
      {/* Brand Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-outline-variant/15">
        <button
          type="button"
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xs overflow-hidden shrink-0 border border-on-surface/15 bg-surface-container-lowest">
            <Image
              src="/images/koto_brand_emblem.jpg"
              alt="KOTO Hanko Emblem"
              fill
              sizes="40px"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-serif text-lg font-bold tracking-tight text-primary leading-none flex items-center gap-1.5">
              <span>KOTO</span>
              <span className="text-sm font-normal text-outline">言登</span>
            </div>
            <div className="text-[9.5px] uppercase tracking-[0.16em] text-outline mt-1 font-semibold">
              Japanese Mastery
            </div>
          </div>
        </button>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
        {renderNavSection('Ecosystem', ECOSYSTEM_NAV)}
        {renderNavSection('Core Pillars', PILLARS_NAV)}
        {renderNavSection('Mastery & Tools', MASTERY_NAV)}
        {userAccount?.role === 'admin' && renderNavSection('Admin & Sheets', ADMIN_NAV)}
      </nav>

      {/* Bottom Mastery Card & Footer Links */}
      <div className="p-3.5 border-t border-outline-variant/25 bg-surface-container-low space-y-2.5">
        <button
          type="button"
          onClick={() => handleNavClick('learning-path')}
          className="w-full text-left bg-surface-container-lowest rounded-md p-3 border border-on-surface/10 hover:border-primary/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-on-surface">{activeJlpt} Mastery</span>
            <span className="font-mono font-bold text-primary tabular-nums">
              {activeMasteryPct}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-xs overflow-hidden">
            <div
              className="h-full bg-primary rounded-xs transition-all"
              style={{ width: `${activeMasteryPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-outline tabular-nums">
            <span>{activeLevelDoneCount} / 25 Lessons</span>
            <span className="text-secondary font-medium">View Path →</span>
          </div>
        </button>

        <div className="flex items-center justify-between px-1 pt-0.5 text-xs text-on-surface-variant">
          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            className={`flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ${
              route === 'settings' ? 'text-primary font-semibold' : ''
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer font-serif"
              title="Open Dictionary & Quick Search (⌘K)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>辞書</span>
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex items-center gap-1 hover:text-error transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-surface text-on-surface ${
        showFurigana ? '' : 'furigana-hidden'
      } ${showRomaji ? '' : 'romaji-hidden'}`}
    >
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[260px] z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-on-surface/35 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-[270px] max-w-[85vw] h-full z-10">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-3 p-1.5 rounded-lg bg-surface-container text-on-surface z-20"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Top Sticky Header */}
      <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-16 bg-surface/95 backdrop-blur-md border-b border-on-surface/10 z-30 px-4 md:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-md bg-surface-container-low border border-on-surface/10 text-on-surface hover:bg-surface-container"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Canonical 2-Tier Breadcrumb (Phase 09) */}
          <div className="hidden xl:flex items-center gap-1.5 pr-2.5 mr-0.5 border-r border-on-surface/10 text-[11px] font-mono shrink-0">
            <span className="text-outline tracking-wider">{breadcrumb.realm}</span>
            <span className="text-outline-variant">/</span>
            <span className="font-semibold text-on-surface">{breadcrumb.module}</span>
            <span className="text-primary font-serif font-bold">({breadcrumb.jp})</span>
          </div>

          {/* JLPT Level Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setJlptMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-surface-container-lowest border border-on-surface/15 text-xs font-semibold text-on-surface hover:border-primary/50 transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-xs bg-primary" />
              <span>JLPT {activeJlpt}</span>
              <ChevronDown className="w-3.5 h-3.5 text-outline" />
            </button>
            {jlptMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setJlptMenuOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-52 bg-surface-container-lowest rounded-md border border-on-surface/15 shadow-sm py-1.5 z-20">
                  {jlptLevels.map((item) => (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => {
                        setActiveJlpt(item.level);
                        setJlptMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-container-low cursor-pointer ${
                        activeJlpt === item.level
                          ? 'text-primary font-semibold bg-primary-fixed/25'
                          : 'text-on-surface'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[11px] text-outline">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Search Bar Trigger (⌘K) */}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="hidden sm:flex items-center justify-between gap-3 w-48 md:w-64 px-3 py-1.5 rounded-md bg-surface-container-low border border-on-surface/10 text-xs text-outline hover:border-on-surface/25 hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Search Kanji, Grammar, Vocab...</span>
            </span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded-xs bg-surface-container-lowest border border-on-surface/15 text-on-surface-variant shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Utility Cluster */}
        <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
          {!isOnline && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary-fixed/50 border border-secondary/30 text-[11px] font-mono font-semibold text-secondary"
              title="Browser is offline — local progress saved in storage"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Offline Saved (オフライン保存済)</span>
              <span className="md:hidden">Offline</span>
            </div>
          )}

          {/* Streak */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-low border border-on-surface/10 text-xs font-semibold text-on-surface tabular-nums"
            title="Active daily study streak"
          >
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span>{streakDays} {streakDays === 1 ? 'day' : 'days'}</span>
          </div>

          {/* Due Counter */}
          <button
            type="button"
            onClick={() => setRoute('review-center')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-fixed/60 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary-fixed transition-colors cursor-pointer tabular-nums"
            title="Open SRS Review Queue"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>{dueCount} Due</span>
          </button>

          {/* Daily Goal */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-low border border-on-surface/10 text-xs text-on-surface-variant tabular-nums">
            <Timer className="w-3.5 h-3.5 text-tertiary" />
            <span>
              <strong className="text-on-surface">{completedMinutes}</strong>/30m
            </span>
          </div>

          {/* Audio Toggle */}
          <button
            type="button"
            onClick={toggleAudioEnabled}
            className={`p-2 rounded-md border transition-colors cursor-pointer ${
              audioEnabled
                ? 'bg-surface-container-lowest border-on-surface/15 text-on-surface hover:border-primary/40'
                : 'bg-surface-container border-on-surface/10 text-outline'
            }`}
            title={audioEnabled ? 'Audio Synthesis Enabled' : 'Audio Muted'}
            aria-label="Toggle Japanese audio"
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-secondary" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Furigana Toggle */}
          <button
            type="button"
            onClick={toggleFurigana}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              showFurigana
                ? 'bg-primary-fixed/40 border-primary/35 text-primary font-semibold'
                : 'bg-surface-container-lowest border-on-surface/15 text-outline'
            }`}
            title="Toggle Furigana Readings Globally"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="font-serif">振仮名</span>
          </button>

          {/* Learner Profile */}
          <button
            type="button"
            onClick={() => setRoute('settings')}
            className="flex items-center gap-2 pl-2 border-l border-on-surface/10 cursor-pointer group"
            title="Learner Profile & Preferences"
          >
            <div className="relative w-8 h-8 rounded-sm overflow-hidden border border-on-surface/15 bg-primary-fixed/40 flex items-center justify-center text-xs font-serif font-bold text-primary">
              {userPhotoUrl ? (
                <Image
                  src={userPhotoUrl}
                  alt={displayName}
                  fill
                  sizes="32px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">
                {shortName}
              </div>
              <div className="text-[10px] text-outline">
                {userAccount?.role === 'admin' ? 'Admin' : `${activeJlpt} Track`}
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="lg:pl-[260px] pt-16 min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* ⌘K Global Dictionary & Command Modal */}
      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs"
            onClick={() => setCommandOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-lg border border-on-surface/20 shadow-lg overflow-hidden z-10">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-on-surface/10">
              <Search className="w-4 h-4 text-primary shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Japanese vocabulary (e.g. kissaten, 駅), Kanji (時, 食), or grammar (に vs で)..."
                className="w-full text-sm bg-transparent outline-none text-on-surface placeholder:text-outline"
              />
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="text-xs font-mono px-2 py-1 rounded-xs bg-surface-container border border-on-surface/10 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto p-4 space-y-5">
              {/* Vocab matches */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
                  Vocabulary Lexicon
                </div>
                <div className="space-y-1">
                  {searchResults.vocabMatches.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface-container-low transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          openVocab(v.id);
                          setCommandOpen(false);
                        }}
                        className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                      >
                        <span className="font-serif text-base font-bold text-on-surface">
                          {v.word}
                        </span>
                        <span className="text-xs text-outline">{v.reading}</span>
                        <span className="text-xs text-on-surface-variant truncate max-w-[260px]">
                          {v.meaningEn}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => speakJapanese(v.word)}
                        className="p-1.5 rounded-sm text-secondary hover:bg-secondary-fixed/40 cursor-pointer"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {searchResults.vocabMatches.length === 0 && (
                    <div className="text-xs text-outline px-3 py-1">No matching vocabulary.</div>
                  )}
                </div>
              </div>

              {/* Kanji matches */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
                  Kanji Characters
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResults.kanjiMatches.map((k) => (
                    <button
                      key={k.char}
                      type="button"
                      onClick={() => {
                        openKanji(k.char);
                        setCommandOpen(false);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-md bg-surface-container-low hover:bg-primary-fixed/30 border border-on-surface/10 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-2xl font-bold text-primary w-9 text-center">
                          {k.char}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-on-surface">{k.meaning}</div>
                          <div className="text-[11px] text-outline">
                            {k.onyomi.kana} · {k.kunyomi.kana}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-outline" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Grammar matches */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
                  Grammar Patterns
                </div>
                <div className="space-y-1">
                  {searchResults.grammarMatches.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        openGrammar(g.id);
                        setCommandOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-serif text-sm font-bold text-on-surface mr-2">
                          {g.title}
                        </span>
                        <span className="text-xs text-outline">{g.category}</span>
                      </div>
                      <span className="text-[11px] font-mono text-secondary">{g.jlpt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transient Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-md bg-inverse-surface text-inverse-on-surface text-xs font-medium shadow-md border border-on-surface/20">
          <Check className="w-3.5 h-3.5 text-tertiary-fixed" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
