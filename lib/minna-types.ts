import { JlptLevel, LessonChallenge, RubySegment } from '@/lib/koto-data';

export type MinnaLessonStatus = 'available' | 'coming-soon';

export interface MinnaUnitMeta {
  unitNumber: number;
  jlpt: 'N5' | 'N4';
  titleJp: string;
  titleEn: string;
  titleVi: string;
  lessonRange: [number, number];
  description: string;
}

export interface MinnaLessonMeta {
  lessonNumber: number;
  jlpt: 'N5' | 'N4';
  unitNumber: number;
  titleJp: string;
  titleEn: string;
  titleVi: string;
  topicTag: string;
  grammarSummary: string[];
  status: MinnaLessonStatus;
}

export interface MinnaVocabEntry {
  id: string;
  lesson: number;
  word: string;
  reading: string;
  romaji: string;
  pos: string;
  meaningEn: string;
  meaningVi: string;
  pitchType: string;
  pitchMarker: string;
  audioUrl?: string;
  example: {
    segments: RubySegment[];
    romaji: string;
    en: string;
    vi: string;
  };
}

export interface MinnaGrammarEntry {
  id: string;
  lesson: number;
  title: string;
  shortLabel: string;
  patternFormula: string;
  summaryEn: string;
  summaryVi: string;
  ruleAlpha: {
    tag: string;
    jpLabel: string;
    lhs: string;
    particle: string;
    rhs: string;
    examples: string;
  };
  ruleBeta: {
    tag: string;
    jpLabel: string;
    lhs: string;
    particle: string;
    rhs: string;
    examples: string;
  };
  mnemonic: string;
  examples: {
    segments: RubySegment[];
    plainText: string;
    romaji: string;
    en: string;
    vi: string;
    audioUrl?: string;
  }[];
  trap: {
    wrong: string;
    right: string;
    note: string;
  };
  quiz: {
    id: string;
    promptBefore: string;
    promptAfter: string;
    en: string;
    correctKey: string;
    options: { key: string; label: string; sub: string }[];
    explanation: string;
  }[];
}

export interface MinnaKanjiEntry {
  char: string;
  lesson: number;
  jlpt: JlptLevel;
  meaning: string;
  meaningVi: string;
  strokes: number;
  radical: string;
  onyomi: string;
  kunyomi: string;
  compounds: {
    word: string;
    reading: string;
    romaji: string;
    meaning: string;
    meaningVi: string;
  }[];
  mnemonic: string;
}

export interface MinnaListeningToken {
  surface: string;
  reading: string;
  pos: string;
  gloss: string;
  particle?: boolean;
}

export interface MinnaListeningSegment {
  id: string;
  lesson: number;
  title: string;
  speaker: string;
  plain: string;
  romaji: string;
  en: string;
  vi: string;
  audioUrl?: string;
  tokens: MinnaListeningToken[];
  comprehension: {
    question: string;
    options: { id: string; label: string }[];
    correctId: string;
  };
  pitchMoras: string[];
}

export interface MinnaReadingPassage {
  lesson: number;
  title: string;
  titleEn: string;
  titleVi: string;
  audioUrl?: string;
  sentences: {
    segments: RubySegment[];
    plain: string;
    romaji: string;
    en: string;
    vi: string;
  }[];
  question: {
    prompt: string;
    options: { id: string; label: string }[];
    correctId: string;
    explanation: string;
  };
}

export interface MinnaDrillQuestion {
  id: string;
  prompt: string;
  en: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export interface MinnaLessonPack {
  lessonNumber: number;
  vocab: MinnaVocabEntry[];
  grammar: MinnaGrammarEntry[];
  kanji: MinnaKanjiEntry[];
  listening: MinnaListeningSegment[];
  reading: MinnaReadingPassage;
  exercises: {
    challenges: LessonChallenge[];
    drills: MinnaDrillQuestion[];
  };
}
