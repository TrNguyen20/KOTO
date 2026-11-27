export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type KotoRoute =
  | 'dashboard'
  | 'learning-path'
  | 'review-center'
  | 'vocabulary-lab'
  | 'kanji-studio'
  | 'grammar-studio'
  | 'listening-and-shadowing'
  | 'speaking-and-dialogue'
  | 'reading-and-library'
  | 'writing-and-composition'
  | 'jlpt-exam-center'
  | 'ai-sensei-tutor'
  | 'culture-and-keigo'
  | 'lesson'
  | 'settings';

export interface RubySegment {
  text: string;
  rt?: string;
}

export interface VocabItem {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  jlpt: JlptLevel;
  pos: string;
  topic: 'Daily Life' | 'Dining & Food' | 'Transit' | 'Work' | 'Keigo';
  meaningEn: string;
  meaningVi: string;
  pitchType: string;
  pitchMarker: string;
  pitchDisplay: string;
  stability: number;
  dueLabel: string;
  status: 'Mastered' | 'Strong' | 'Learning' | 'Due';
  nuanceTitle: string;
  nuanceBody: string;
  kanjiRoots: {
    char: string;
    jlpt: JlptLevel;
    reading: string;
    meaning: string;
    radical: string;
    strokes: number;
  }[];
  collocations: {
    label: string;
    lessonRef: string;
    jpBefore: string;
    particle: string;
    jpAfter: string;
    en: string;
    vi: string;
  }[];
  examples: {
    segments: RubySegment[];
    particleHighlight?: string;
    romaji: string;
    en: string;
    vi: string;
  }[];
}

export interface KanjiItem {
  char: string;
  meaning: string;
  jlpt: JlptLevel;
  grade: string;
  strokes: number;
  radical: string;
  radicalReading: string;
  radicalMeaning: string;
  radicalNumber: number;
  recall: number;
  status: 'Mastered' | 'In Review' | 'Consolidating' | 'Learning';
  oracleChar: string;
  sealChar: string;
  lineageNote: string;
  mnemonicHeadline: string;
  mnemonicBody: string;
  components: {
    glyph: string;
    badge: string;
    reading: string;
    note: string;
    accent: 'primary' | 'secondary';
  }[];
  onyomi: {
    kana: string;
    romaji: string;
    note: string;
    compounds: string[];
  };
  kunyomi: {
    kana: string;
    romaji: string;
    note: string;
    compounds: string[];
  };
  compounds: {
    word: string;
    reading: string;
    romaji: string;
    meaning: string;
    jlpt: JlptLevel;
    breakdown: string;
    status: string;
  }[];
  strokeSteps: {
    step: number;
    symbol: string;
    preview: string;
    label: string;
  }[];
  balanceCritique: string;
  stabilityDays: number;
  nextEvalDays: number;
  consecutiveCorrect: number;
}

export interface GrammarPattern {
  id: string;
  title: string;
  shortLabel: string;
  jlpt: JlptLevel;
  category: string;
  retention: number;
  thesis: string;
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
  cognitiveDeepDive: {
    primaryTerm: string;
    primaryDesc: string;
    secondaryTerm: string;
    secondaryDesc: string;
    mnemonic: string;
  };
  audioExamples: {
    id: string;
    badge: string;
    context: string;
    accent: 'primary' | 'secondary';
    segments: RubySegment[];
    highlightParticle: string;
    romaji: string;
    en: string;
    plainText: string;
  }[];
  trap: {
    wrongSentence: string;
    wrongExplanation: string;
    rightLine1: string;
    rightLine2: string;
    rightExplanation: string;
  };
  etymologyNote: string;
  comparisonMatrix: {
    pattern: string;
    role: string;
    verbs: string;
    focus: string;
    accent: 'primary' | 'secondary' | 'neutral';
  }[];
  quizQuestions: {
    id: string;
    promptBefore: string;
    promptAfter: string;
    en: string;
    correctKey: string;
    options: { key: string; label: string; sub: string }[];
    explanation: string;
  }[];
}

export interface LessonTile {
  id: string;
  word: string;
  kana: string;
  role: string;
  accent?: 'primary' | 'secondary' | 'neutral';
}

export interface LessonChallenge {
  id: string;
  code: string;
  category: string;
  venue: string;
  promptTitle: string;
  promptDesc: string;
  slots: {
    role: string;
    expectedWord: string;
    accent?: 'primary' | 'secondary' | 'neutral';
  }[];
  tiles: LessonTile[];
  literalTranslation: string;
  fullJapanese: string;
  pitchMoras: string[];
}

export interface MockQuestionDetail {
  num: number;
  status: 'correct' | 'error' | 'flagged';
  section: string;
  timeSpent: number;
  sentenceBefore: string;
  sentenceAfter: string;
  english: string;
  userChoice: string;
  correctChoice: string;
  options: {
    code: 'A' | 'B' | 'C' | 'D';
    label: string;
    note: string;
  }[];
  senseiNote: string;
}

export interface SenseiScenario {
  id: string;
  title: string;
  japaneseTitle: string;
  kanjiBadge: string;
  persona: string;
  setting: string;
  ambientLabel: string;
  image: string;
  goals: { id: string; jp: string; en: string; done: boolean }[];
  initialTurns: {
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
  }[];
  suggestedReplies: { jp: string; en: string }[];
}

export const VOCAB_ITEMS: VocabItem[] = [
  {
    id: 'kissaten',
    word: '喫茶店',
    reading: 'きっさてん',
    romaji: 'kissaten',
    jlpt: 'N5',
    pos: '名詞 · Noun',
    topic: 'Dining & Food',
    meaningEn:
      'Traditional Japanese tearoom; retro cafe or coffeehouse serving pour-over coffee, toasts, and parfaits in a quiet atmosphere.',
    meaningVi:
      'Quán cà phê / phòng trà truyền thống phong cách hoài cổ của Nhật Bản; nơi yên tĩnh phục vụ cà phê pha phin và bánh ngọt.',
    pitchType: '頭高型 (Atamadaka)',
    pitchMarker: '①',
    pitchDisplay: 'き＼っさてん',
    stability: 94,
    dueLabel: '94% Mastered',
    status: 'Mastered',
    nuanceTitle: 'Lexical Nuance · カフェ vs. 純喫茶',
    nuanceBody:
      'While modern カフェ (kafe) refers to trendy Western-style coffee shops with espresso machines, a 喫茶店 (kissaten) or 純喫茶 (junkissaten) evokes Showa-era nostalgia, siphon brewing, plush velvet booths, and classic jazz background music.',
    kanjiRoots: [
      { char: '喫', jlpt: 'N3', reading: 'キツ (kitsu)', meaning: 'Consume, smoke, drink', radical: '口 (Mouth)', strokes: 12 },
      { char: '茶', jlpt: 'N5', reading: 'チャ · サ (cha, sa)', meaning: 'Tea, tea ceremony', radical: '艸 (Grass)', strokes: 9 },
      { char: '店', jlpt: 'N5', reading: 'テン · みせ (ten, mise)', meaning: 'Shop, store, vendor', radical: '广 (Cliff)', strokes: 8 },
    ],
    collocations: [
      {
        label: 'Action Venue Pattern',
        lessonRef: 'Grammar L3.2',
        jpBefore: '喫茶店',
        particle: 'で',
        jpAfter: 'コーヒーを飲む',
        en: 'To drink coffee at a coffeehouse (Particle で denotes venue of intentional action).',
        vi: 'Uống cà phê tại quán',
      },
      {
        label: 'Direction / Entrance',
        lessonRef: 'Grammar L2.4',
        jpBefore: '喫茶店',
        particle: 'に',
        jpAfter: '入る',
        en: 'To enter into a cafe (Particle に specifies target point of arrival).',
        vi: 'Bước vào quán cà phê',
      },
    ],
    examples: [
      {
        segments: [
          { text: '静', rt: 'しず' },
          { text: 'かな' },
          { text: '喫茶店', rt: 'きっさてん' },
          { text: 'で' },
          { text: '本', rt: 'ほん' },
          { text: 'を' },
          { text: '読', rt: 'よ' },
          { text: 'むのが' },
          { text: '好', rt: 'す' },
          { text: 'きです。' },
        ],
        particleHighlight: 'で',
        romaji: 'Shizuka na kissaten de hon wo yomu no ga suki desu.',
        en: 'I like reading books at a quiet traditional cafe.',
        vi: 'Tôi thích đọc sách tại một quán cà phê cổ yên tĩnh.',
      },
      {
        segments: [
          { text: '駅', rt: 'えき' },
          { text: 'の' },
          { text: '近', rt: 'ちか' },
          { text: 'くに' },
          { text: '古', rt: 'ふる' },
          { text: 'い' },
          { text: '喫茶店', rt: 'きっさてん' },
          { text: 'があります。' },
        ],
        particleHighlight: 'に',
        romaji: 'Eki no chikaku ni furui kissaten ga arimasu.',
        en: 'There is an old coffeehouse near the station.',
        vi: 'Có một quán cà phê lâu đời ở gần nhà ga.',
      },
    ],
  },
  {
    id: 'eki',
    word: '駅',
    reading: 'えき',
    romaji: 'eki',
    jlpt: 'N5',
    pos: '名詞 · Noun',
    topic: 'Transit',
    meaningEn: 'Train station or railway depot; central transit hub in Japanese urban geography.',
    meaningVi: 'Nhà ga tàu điện; điểm trung chuyển đường sắt.',
    pitchType: '頭高型 (Atamadaka)',
    pitchMarker: '①',
    pitchDisplay: 'え＼き',
    stability: 62,
    dueLabel: 'Due in 4h',
    status: 'Due',
    nuanceTitle: 'Lexical Nuance · 駅 vs. バス停',
    nuanceBody:
      '駅 (eki) strictly denotes railway or subway stations. For bus stops, use バス停 (basutei) or 停留所 (teiryuujo). Note how 駅 pairs with に for arrival (駅に着く) and を for exiting/getting off (駅を出る).',
    kanjiRoots: [
      { char: '駅', jlpt: 'N5', reading: 'エキ (eki)', meaning: 'Station, post town', radical: '馬 (Horse)', strokes: 14 },
    ],
    collocations: [
      {
        label: 'Transfer Locus',
        lessonRef: 'Grammar L3.2',
        jpBefore: '新宿駅',
        particle: 'で',
        jpAfter: '乗り換える',
        en: 'To transfer trains at Shinjuku Station.',
        vi: 'Đổi tàu tại ga Shinjuku',
      },
      {
        label: 'Arrival Target',
        lessonRef: 'Grammar L3.1',
        jpBefore: '東京駅',
        particle: 'に',
        jpAfter: '着く',
        en: 'To arrive at Tokyo Station.',
        vi: 'Đến ga Tokyo',
      },
    ],
    examples: [
      {
        segments: [
          { text: '毎朝', rt: 'まいあさ' },
          { text: '、' },
          { text: '新宿駅', rt: 'しんじゅくえき' },
          { text: 'で' },
          { text: '山手線', rt: 'やまのてせん' },
          { text: 'に' },
          { text: '乗', rt: 'の' },
          { text: 'り' },
          { text: '換', rt: 'か' },
          { text: 'えます。' },
        ],
        romaji: 'Maiasa, Shinjuku-eki de Yamanote-sen ni norikaemasu.',
        en: 'Every morning, I transfer to the Yamanote Line at Shinjuku Station.',
        vi: 'Mỗi sáng tôi đổi sang tuyến Yamanote tại ga Shinjuku.',
      },
    ],
  },
  {
    id: 'taberu',
    word: '食べる',
    reading: 'たべる',
    romaji: 'taberu',
    jlpt: 'N5',
    pos: '一段動詞 · Ichidan Verb',
    topic: 'Dining & Food',
    meaningEn: 'To eat; to consume a meal or food item (transitive Ichidan verb taking を).',
    meaningVi: 'Ăn, dùng bữa (động từ nhóm II đi với trợ từ を).',
    pitchType: '中高型 (Nakadaka)',
    pitchMarker: '②',
    pitchDisplay: 'たべ＼る',
    stability: 88,
    dueLabel: '88% Strong',
    status: 'Strong',
    nuanceTitle: 'Register Nuance · 食べる vs. 召し上がる / いただく',
    nuanceBody:
      '食べる is standard neutral/polite (食べます). When speaking humbly about eating (or receiving food), use いただきます; when honoring a guest or superior eating, use 召し上がります (meshiagarimasu).',
    kanjiRoots: [
      { char: '食', jlpt: 'N5', reading: 'ショク · た(べる)', meaning: 'Eat, meal, provisions', radical: '食 (Food)', strokes: 9 },
    ],
    collocations: [
      {
        label: 'Direct Object',
        lessonRef: 'Grammar L3.1',
        jpBefore: '朝ご飯',
        particle: 'を',
        jpAfter: '食べる',
        en: 'To eat breakfast.',
        vi: 'Ăn bữa sáng',
      },
    ],
    examples: [
      {
        segments: [
          { text: 'レストランで' },
          { text: 'お昼ご飯', rt: 'おひるごはん' },
          { text: 'を' },
          { text: '食', rt: 'た' },
          { text: 'べました。' },
        ],
        romaji: 'Resutoran de ohirugohan wo tabemashita.',
        en: 'I ate lunch at a restaurant.',
        vi: 'Tôi đã ăn trưa ở nhà hàng.',
      },
    ],
  },
  {
    id: 'maiasa',
    word: '毎朝',
    reading: 'まいあさ',
    romaji: 'maiasa',
    jlpt: 'N5',
    pos: '時間名詞 · Temporal Noun',
    topic: 'Daily Life',
    meaningEn: 'Every morning; daily routine anchor that does not take the time particle に.',
    meaningVi: 'Mỗi sáng, hằng sáng (không dùng trợ từ に phía sau).',
    pitchType: '平板型 (Heiban)',
    pitchMarker: '⓪',
    pitchDisplay: 'まいあさ',
    stability: 98,
    dueLabel: '98% Mastered',
    status: 'Mastered',
    nuanceTitle: 'Grammar Rule · Relative Time Words Omit に',
    nuanceBody:
      'Unlike exact clock times (七時に) or days of the week (月曜日に), relative frequency nouns like 毎朝 (every morning), 毎日 (every day), 今日 (today), and 明日 (tomorrow) never take the particle に.',
    kanjiRoots: [
      { char: '毎', jlpt: 'N5', reading: 'マイ (mai)', meaning: 'Every, each', radical: '毋 (Do not)', strokes: 6 },
      { char: '朝', jlpt: 'N4', reading: 'チョウ · あさ (asa)', meaning: 'Morning, dynasty', radical: '月 (Moon)', strokes: 12 },
    ],
    collocations: [
      {
        label: 'Habitual Time Anchor',
        lessonRef: 'Grammar L3.3',
        jpBefore: '毎朝',
        particle: '、',
        jpAfter: 'コーヒーを淹れる',
        en: 'Every morning, brew coffee.',
        vi: 'Mỗi sáng pha cà phê',
      },
    ],
    examples: [
      {
        segments: [
          { text: '毎朝', rt: 'まいあさ' },
          { text: '、' },
          { text: '七時', rt: 'しちじ' },
          { text: 'に' },
          { text: '起', rt: 'お' },
          { text: 'きます。' },
        ],
        romaji: 'Maiasa, shichiji ni okimasu.',
        en: 'Every morning, I wake up at 7 o’clock.',
        vi: 'Mỗi sáng tôi thức dậy lúc 7 giờ.',
      },
    ],
  },
  {
    id: 'iku',
    word: '行く',
    reading: 'いく',
    romaji: 'iku',
    jlpt: 'N5',
    pos: '五段動詞 · Godan Verb',
    topic: 'Transit',
    meaningEn: 'To go; directional movement away from the speaker toward a destination.',
    meaningVi: 'Đi (hướng di chuyển rời xa vị trí người nói).',
    pitchType: '平板型 (Heiban)',
    pitchMarker: '⓪',
    pitchDisplay: 'いく',
    stability: 74,
    dueLabel: 'Due Tomorrow',
    status: 'Learning',
    nuanceTitle: 'Irregular て-Form · 行って (itte)',
    nuanceBody:
      'Although く verbs normally conjugate to 〜いて (書く → 書いて), 行く is the sole major exception in Japanese: its て-form is 行って (itte) and past plain form is 行った (itta).',
    kanjiRoots: [
      { char: '行', jlpt: 'N5', reading: 'コウ · い(く)', meaning: 'Go, conduct, line', radical: '彳 (Step)', strokes: 6 },
    ],
    collocations: [
      {
        label: 'Target Endpoint',
        lessonRef: 'Grammar L3.2',
        jpBefore: '図書館',
        particle: 'に',
        jpAfter: '行く',
        en: 'To go to the library.',
        vi: 'Đi đến thư viện',
      },
    ],
    examples: [
      {
        segments: [
          { text: '明日', rt: 'あした' },
          { text: '、' },
          { text: '東京', rt: 'とうきょう' },
          { text: 'に' },
          { text: '行', rt: 'い' },
          { text: 'きます。' },
        ],
        romaji: 'Ashita, Toukyou ni ikimasu.',
        en: 'Tomorrow, I will go to Tokyo.',
        vi: 'Ngày mai tôi sẽ đi Tokyo.',
      },
    ],
  },
  {
    id: 'shinkansen',
    word: '新幹線',
    reading: 'しんかんせん',
    romaji: 'shinkansen',
    jlpt: 'N4',
    pos: '名詞 · Noun',
    topic: 'Transit',
    meaningEn: 'Shinkansen high-speed bullet train network connecting Japanese metropolises.',
    meaningVi: 'Tàu cao tốc Shinkansen của Nhật Bản.',
    pitchType: '中高型 (Nakadaka)',
    pitchMarker: '③',
    pitchDisplay: 'しんか＼んせん',
    stability: 81,
    dueLabel: '81% Strong',
    status: 'Strong',
    nuanceTitle: 'Transit Usage · 新幹線で行く',
    nuanceBody:
      'When specifying the Shinkansen as your mode of transport, use particle で (新幹線で大阪に行く). When boarding, use に (新幹線に乗る).',
    kanjiRoots: [
      { char: '新', jlpt: 'N4', reading: 'シン · あたら(しい)', meaning: 'New', radical: '斤 (Axe)', strokes: 13 },
      { char: '線', jlpt: 'N3', reading: 'セン', meaning: 'Line, track', radical: '糸 (Thread)', strokes: 15 },
    ],
    collocations: [
      {
        label: 'Means of Transit',
        lessonRef: 'Grammar L4.1',
        jpBefore: '新幹線',
        particle: 'で',
        jpAfter: '京都へ行く',
        en: 'To travel to Kyoto by Shinkansen.',
        vi: 'Đi Kyoto bằng tàu Shinkansen',
      },
    ],
    examples: [
      {
        segments: [
          { text: '新幹線', rt: 'しんかんせん' },
          { text: 'で' },
          { text: '京都', rt: 'きょうと' },
          { text: 'に' },
          { text: '行', rt: 'い' },
          { text: 'きました。' },
        ],
        romaji: 'Shinkansen de Kyouto ni ikimashita.',
        en: 'I went to Kyoto by Shinkansen.',
        vi: 'Tôi đã đi Kyoto bằng tàu Shinkansen.',
      },
    ],
  },
  {
    id: 'omeshiagari',
    word: '召し上がる',
    reading: 'めしあがる',
    romaji: 'meshiagaru',
    jlpt: 'N4',
    pos: '尊敬語 · Honorific Verb',
    topic: 'Keigo',
    meaningEn: 'Honorific (Sonkeigo) verb for to eat or to drink; used by hosts for guests and superiors.',
    meaningVi: 'Dùng bữa, thưởng thức (kính ngữ tôn kính của 食べる・飲む).',
    pitchType: '中高型 (Nakadaka)',
    pitchMarker: '④',
    pitchDisplay: 'めしあが＼る',
    stability: 70,
    dueLabel: 'Learning',
    status: 'Learning',
    nuanceTitle: 'Hospitality Register · お召し上がりになりますか',
    nuanceBody:
      'In cafes and restaurants, staff routinely ask 店内でお召し上がりですか (Will you be dining in?) versus お持ち帰りですか (Or takeout?).',
    kanjiRoots: [
      { char: '召', jlpt: 'N2', reading: 'ショウ · め(す)', meaning: 'Summon, partake', radical: '口 (Mouth)', strokes: 5 },
      { char: '上', jlpt: 'N5', reading: 'ジョウ · あ(がる)', meaning: 'Up, rise', radical: '一 (One)', strokes: 3 },
    ],
    collocations: [
      {
        label: 'Cafe Hospitality',
        lessonRef: 'Keigo Module',
        jpBefore: '店内',
        particle: 'で',
        jpAfter: 'お召し上がりですか',
        en: 'Are you dining inside the shop?',
        vi: 'Quý khách dùng tại quán ạ?',
      },
    ],
    examples: [
      {
        segments: [
          { text: 'どうぞ' },
          { text: '温', rt: 'あたた' },
          { text: 'かいうちに' },
          { text: 'お' },
          { text: '召', rt: 'め' },
          { text: 'し' },
          { text: '上', rt: 'あ' },
          { text: 'がりください。' },
        ],
        romaji: 'Douzo atatakai uchi ni omeshiagari kudasai.',
        en: 'Please enjoy it while it is warm.',
        vi: 'Xin mời quý khách dùng khi còn nóng.',
      },
    ],
  },
];

export const KANJI_ITEMS: KanjiItem[] = [
  {
    char: '時',
    meaning: 'Time / Hour',
    jlpt: 'N5',
    grade: 'Kyōiku Grade 1',
    strokes: 10,
    radical: '日',
    radicalReading: 'ひ・ひへん',
    radicalMeaning: 'Sun',
    radicalNumber: 72,
    recall: 96,
    status: 'Mastered',
    oracleChar: '𡇙',
    sealChar: '𪚥',
    lineageNote:
      'The early graph combined the solar sign with a foot marking forward motion, later harmonized with the temple radical.',
    mnemonicHeadline: '"The Sun over the Temple Marks Time."',
    mnemonicBody:
      'A visual assembly of two balanced elements: On the left, 日 (the Sun, daylight cycle). On the right, 寺 (temple or steady measure, itself made of ground 土 and sun-dial inch 寸). As shadows traverse the ancient temple stone, hours pass into memory.',
    components: [
      { glyph: '日', badge: 'Radical #72', reading: 'ひ・にち (Sun / Day)', note: 'Positional: left-side (へん)', accent: 'primary' },
      { glyph: '寺', badge: 'Phonetic Primitive', reading: 'てら (Temple / Sanctuary)', note: 'Imparts the historical sound "JI"', accent: 'secondary' },
    ],
    onyomi: {
      kana: 'ジ',
      romaji: '[ji] · Primary reading in compounds',
      note: 'High Frequency (頻出)',
      compounds: ['何時 (nan-ji)', '時代 (ji-dai)', '時間 (ji-kan)'],
    },
    kunyomi: {
      kana: 'とき',
      romaji: '[toki], -どき [-doki] (Rendaku)',
      note: 'Everyday Vernacular',
      compounds: ['その時 (sono toki)', '時々 (tokidoki)', '潮時 (shiodoki)'],
    },
    compounds: [
      { word: '時間', reading: 'じかん', romaji: 'jikan', meaning: 'Time / Period / Hours', jlpt: 'N5', breakdown: '時 [time] + 間 [interval]', status: 'Active Vocab' },
      { word: '時計', reading: 'とけい', romaji: 'tokei', meaning: 'Clock / Wristwatch', jlpt: 'N5', breakdown: '時 [time] + 計 [measure]', status: 'Active Vocab' },
      { word: '時々', reading: 'ときどき', romaji: 'tokidoki', meaning: 'Sometimes / At intervals', jlpt: 'N5', breakdown: '時 [time] + 々 [iteration mark]', status: 'Scheduled Today' },
      { word: '何時', reading: 'なんじ', romaji: 'nanji', meaning: 'What time?', jlpt: 'N5', breakdown: '何 [what] + 時 [o’clock]', status: 'Active Vocab' },
    ],
    strokeSteps: [
      { step: 1, symbol: '丨', preview: '丨', label: 'Down' },
      { step: 2, symbol: '𠃍', preview: '冂', label: 'Fold' },
      { step: 3, symbol: '一', preview: '日', label: 'Mid bar' },
      { step: 4, symbol: '一', preview: '日', label: 'Seal base' },
      { step: 5, symbol: '一', preview: '日土', label: 'Temple top' },
      { step: 6, symbol: '丨', preview: '日土', label: 'Spine' },
      { step: 7, symbol: '一', preview: '日土', label: 'Long base' },
      { step: 8, symbol: '一', preview: '日寺', label: 'Inch bar' },
      { step: 9, symbol: '亅', preview: '日寺', label: 'Hook' },
      { step: 10, symbol: '丶', preview: '時', label: 'Final dot' },
    ],
    balanceCritique:
      'Maintain the 1:2 width ratio between the left radical 日 and right compound 寺. The final dot (stroke 10) must center beneath the horizontal line of 寸 to preserve central equilibrium.',
    stabilityDays: 21,
    nextEvalDays: 18,
    consecutiveCorrect: 8,
  },
  {
    char: '駅',
    meaning: 'Station',
    jlpt: 'N5',
    grade: 'Kyōiku Grade 3',
    strokes: 14,
    radical: '馬',
    radicalReading: 'うま・うまへん',
    radicalMeaning: 'Horse',
    radicalNumber: 187,
    recall: 76,
    status: 'In Review',
    oracleChar: '馬',
    sealChar: '驛',
    lineageNote:
      'Historically denoted post-horse relay stations along imperial roads (宿駅), later modernized to railway stations.',
    mnemonicHeadline: '"Fresh Horses Waiting in Measure at the Relay."',
    mnemonicBody:
      'On the left stands 馬 (horse, the courier animal of Edo post towns). On the right is 尺 (a standard unit of measure), reminding us that relay stations were spaced at exact measured intervals.',
    components: [
      { glyph: '馬', badge: 'Radical #187', reading: 'うま (Horse)', note: 'Positional: left-side (へん)', accent: 'primary' },
      { glyph: '尺', badge: 'Measure Primitive', reading: 'しゃく (Foot / Measure)', note: 'Modern simplified form of 睪', accent: 'secondary' },
    ],
    onyomi: {
      kana: 'エキ',
      romaji: '[eki] · Standard station reading',
      note: 'High Frequency',
      compounds: ['駅前 (eki-mae)', '東京駅 (Toukyou-eki)', '駅員 (eki-in)'],
    },
    kunyomi: {
      kana: '—',
      romaji: 'No common kun-yomi',
      note: 'On-yomi Dominant',
      compounds: ['各駅停車 (kakueki teisha)', '終着駅 (shuuchaku-eki)'],
    },
    compounds: [
      { word: '駅前', reading: 'えきまえ', romaji: 'ekimae', meaning: 'In front of the station', jlpt: 'N5', breakdown: '駅 [station] + 前 [front]', status: 'Active Vocab' },
      { word: '駅員', reading: 'えきいん', romaji: 'ekiin', meaning: 'Station attendant', jlpt: 'N4', breakdown: '駅 [station] + 員 [staff]', status: 'In Review' },
    ],
    strokeSteps: [
      { step: 1, symbol: '一', preview: '一', label: 'Top' },
      { step: 2, symbol: '丨', preview: '丨', label: 'Spine' },
      { step: 3, symbol: '一', preview: '一', label: 'Cross 1' },
      { step: 4, symbol: '一', preview: '一', label: 'Cross 2' },
      { step: 5, symbol: '丨', preview: '馬', label: 'Mane' },
      { step: 6, symbol: '㇆', preview: '馬', label: 'Back hook' },
      { step: 7, symbol: '丶', preview: '馬', label: 'Hooves 1–4' },
      { step: 8, symbol: '𠃍', preview: '駅', label: 'Right top' },
      { step: 9, symbol: '一', preview: '駅', label: 'Mid bar' },
      { step: 10, symbol: 'ノ', preview: '駅', label: 'Left sweep' },
      { step: 11, symbol: '㇏', preview: '駅', label: 'Right sweep' },
    ],
    balanceCritique:
      'Keep the four dots of 馬 aligned horizontally and slightly compact so 尺 on the right has room for a sweeping diagonal leg.',
    stabilityDays: 9,
    nextEvalDays: 4,
    consecutiveCorrect: 4,
  },
  {
    char: '食',
    meaning: 'Eat / Meal',
    jlpt: 'N5',
    grade: 'Kyōiku Grade 2',
    strokes: 9,
    radical: '食',
    radicalReading: 'しょく・しょくへん',
    radicalMeaning: 'Food',
    radicalNumber: 184,
    recall: 94,
    status: 'Mastered',
    oracleChar: '𠊊',
    sealChar: '食',
    lineageNote:
      'Depicts a covered vessel brimming with grain: a roof-like lid over a bowl (良) of steamed rice.',
    mnemonicHeadline: '"A Roof Covering a Bowl of Good Grain."',
    mnemonicBody:
      'The top sweeping roof 人 covers the phonetic element 良 (good). Together they form the quintessential symbol for nourishment and shared meals.',
    components: [
      { glyph: '𠆢', badge: 'Lid Component', reading: 'ひとやね (Cover)', note: 'Sweeping top roof strokes', accent: 'primary' },
      { glyph: '良', badge: 'Core Vessel', reading: 'りょう (Good)', note: 'Bowl of grain beneath the lid', accent: 'secondary' },
    ],
    onyomi: {
      kana: 'ショク',
      romaji: '[shoku] · Meal compounds',
      note: 'High Frequency',
      compounds: ['食事 (shoku-ji)', '食堂 (shoku-dou)', '和食 (wa-shoku)'],
    },
    kunyomi: {
      kana: 'た(べる)',
      romaji: '[taberu] · To eat',
      note: 'Core N5 Verb',
      compounds: ['食べる (taberu)', '食べ物 (tabemono)'],
    },
    compounds: [
      { word: '食事', reading: 'しょくじ', romaji: 'shokuji', meaning: 'Meal / Dining', jlpt: 'N4', breakdown: '食 [eat] + 事 [affair]', status: 'Active Vocab' },
      { word: '食堂', reading: 'しょくどう', romaji: 'shokudou', meaning: 'Cafeteria / Dining Hall', jlpt: 'N5', breakdown: '食 [eat] + 堂 [hall]', status: 'Active Vocab' },
    ],
    strokeSteps: [
      { step: 1, symbol: 'ノ', preview: 'ノ', label: 'Left roof' },
      { step: 2, symbol: '㇏', preview: '𠆢', label: 'Right roof' },
      { step: 3, symbol: '丶', preview: '丶', label: 'Lid dot' },
      { step: 4, symbol: '𠃍', preview: '𠃍', label: 'Bowl top' },
      { step: 5, symbol: '一', preview: '日', label: 'Mid bar' },
      { step: 6, symbol: '一', preview: '日', label: 'Lower bar' },
      { step: 7, symbol: '㇙', preview: '食', label: 'Vertical hook' },
      { step: 8, symbol: 'ノ', preview: '食', label: 'Short flick' },
      { step: 9, symbol: '㇏', preview: '食', label: 'Base sweep' },
    ],
    balanceCritique:
      'Make the top roof 人 wide enough to shelter the inner strokes symmetrically, and anchor the final diagonal leg firmly.',
    stabilityDays: 28,
    nextEvalDays: 24,
    consecutiveCorrect: 11,
  },
  {
    char: '店',
    meaning: 'Shop / Store',
    jlpt: 'N5',
    grade: 'Kyōiku Grade 2',
    strokes: 8,
    radical: '广',
    radicalReading: 'まだれ',
    radicalMeaning: 'Dotted Cliff / Shelter',
    radicalNumber: 53,
    recall: 91,
    status: 'Mastered',
    oracleChar: '广',
    sealChar: '店',
    lineageNote:
      'Combines the building shelter radical 广 with 占 (occupy/stand), representing a permanent market stall under eaves.',
    mnemonicHeadline: '"A Merchant Stall Sheltered Under Eaves."',
    mnemonicBody:
      'Under the broad roof eaves of 广 (building/shelter), a vendor stands 占 displaying goods for passersby.',
    components: [
      { glyph: '广', badge: 'Radical #53', reading: 'まだれ (Building Shelter)', note: 'Enclosing top-left frame', accent: 'primary' },
      { glyph: '占', badge: 'Phonetic Root', reading: 'セン (Occupy / Stand)', note: 'Imparts sound and upright form', accent: 'secondary' },
    ],
    onyomi: {
      kana: 'テン',
      romaji: '[ten] · Shop compounds',
      note: 'High Frequency',
      compounds: ['喫茶店 (kissaten)', '店員 (ten-in)', '書店 (sho-ten)'],
    },
    kunyomi: {
      kana: 'みせ',
      romaji: '[mise] · Shop, store',
      note: 'Everyday Vernacular',
      compounds: ['お店 (omise)', '店先 (misesaki)'],
    },
    compounds: [
      { word: '喫茶店', reading: 'きっさてん', romaji: 'kissaten', meaning: 'Traditional Cafe', jlpt: 'N5', breakdown: '喫茶 [tea] + 店 [shop]', status: 'Mastered' },
      { word: '店員', reading: 'てんいん', romaji: 'tenin', meaning: 'Shop clerk', jlpt: 'N5', breakdown: '店 [shop] + 員 [member]', status: 'Active Vocab' },
    ],
    strokeSteps: [
      { step: 1, symbol: '丶', preview: '丶', label: 'Roof dot' },
      { step: 2, symbol: '一', preview: '一', label: 'Eave bar' },
      { step: 3, symbol: 'ノ', preview: '广', label: 'Left sweep' },
      { step: 4, symbol: '丨', preview: '丨', label: 'Pillar' },
      { step: 5, symbol: '一', preview: '占', label: 'Arm' },
      { step: 6, symbol: '丨', preview: '口', label: 'Box left' },
      { step: 7, symbol: '𠃍', preview: '口', label: 'Box turn' },
      { step: 8, symbol: '一', preview: '店', label: 'Box seal' },
    ],
    balanceCritique:
      'Keep the まだれ (广) left sweep generous so 占 sits comfortably tucked inside the architectural shelter.',
    stabilityDays: 19,
    nextEvalDays: 14,
    consecutiveCorrect: 7,
  },
  {
    char: '行',
    meaning: 'Go / Conduct',
    jlpt: 'N5',
    grade: 'Kyōiku Grade 2',
    strokes: 6,
    radical: '行',
    radicalReading: 'ぎょう・ゆき',
    radicalMeaning: 'Crossroads / Go',
    radicalNumber: 144,
    recall: 83,
    status: 'Consolidating',
    oracleChar: '𠈌',
    sealChar: '行',
    lineageNote:
      'Derived from an ancient pictogram of a four-way crossroads where roads intersect.',
    mnemonicHeadline: '"A Crossroads Inviting Motion Forward."',
    mnemonicBody:
      'Look at the left and right halves facing each other like two sides of a Tokyo street intersection—where every journey begins.',
    components: [
      { glyph: '彳', badge: 'Left Path', reading: 'ぎょうにんべん (Step)', note: 'Double person / slow walk', accent: 'primary' },
      { glyph: '亍', badge: 'Right Path', reading: 'Stop / Right step', note: 'Completes the crossroads', accent: 'secondary' },
    ],
    onyomi: {
      kana: 'コウ・ギョウ',
      romaji: '[kou / gyou]',
      note: 'High Frequency',
      compounds: ['旅行 (ryo-kou)', '銀行 (gin-kou)', '急行 (kyuu-kou)'],
    },
    kunyomi: {
      kana: 'い(く)・おこな(う)',
      romaji: '[iku / okonau]',
      note: 'Core N5 Verb',
      compounds: ['行く (iku)', '行きます (ikimasu)'],
    },
    compounds: [
      { word: '銀行', reading: 'ぎんこう', romaji: 'ginkou', meaning: 'Bank', jlpt: 'N5', breakdown: '銀 [silver] + 行 [house]', status: 'Active Vocab' },
      { word: '旅行', reading: 'りょこう', romaji: 'ryokou', meaning: 'Travel / Trip', jlpt: 'N5', breakdown: '旅 [journey] + 行 [go]', status: 'Active Vocab' },
    ],
    strokeSteps: [
      { step: 1, symbol: 'ノ', preview: 'ノ', label: 'Top slant' },
      { step: 2, symbol: 'ノ', preview: '彡', label: 'Mid slant' },
      { step: 3, symbol: '丨', preview: '彳', label: 'Left stem' },
      { step: 4, symbol: '一', preview: '彳一', label: 'Top bar' },
      { step: 5, symbol: '一', preview: '彳二', label: 'Main bar' },
      { step: 6, symbol: '亅', preview: '行', label: 'Hooked stem' },
    ],
    balanceCritique:
      'Ensure the right side begins slightly lower than the top of the left 彳 radical and closes with a crisp vertical hook.',
    stabilityDays: 12,
    nextEvalDays: 6,
    consecutiveCorrect: 5,
  },
  {
    char: '会',
    meaning: 'Meet / Society',
    jlpt: 'N5',
    grade: 'Kyōiku Grade 2',
    strokes: 6,
    radical: '人',
    radicalReading: 'ひとやね',
    radicalMeaning: 'Person / Roof',
    radicalNumber: 9,
    recall: 68,
    status: 'Learning',
    oracleChar: '亼',
    sealChar: '會',
    lineageNote:
      'People gathering beneath a shared roof—used for meetings, companies (会社), and conversation (会話).',
    mnemonicHeadline: '"People Gathering Under One Shared Roof."',
    mnemonicBody:
      'The wide person-roof 人 shelters cloud/gathering strokes 云 below, evoking friends meeting at a station or colleagues in a guild.',
    components: [
      { glyph: '人', badge: 'Radical #9', reading: 'ひとやね (Gathering Roof)', note: 'Broad umbrella strokes', accent: 'primary' },
      { glyph: '云', badge: 'Inner Assembly', reading: 'うん (Say / Gather)', note: 'Two horizontal bars + fold dot', accent: 'secondary' },
    ],
    onyomi: {
      kana: 'カイ',
      romaji: '[kai] · Meeting / Association',
      note: 'High Frequency',
      compounds: ['会社 (kai-sha)', '会話 (kai-wa)', '会議 (kai-gi)'],
    },
    kunyomi: {
      kana: 'あ(う)',
      romaji: '[au] · To meet (with に)',
      note: 'Core N5 Verb',
      compounds: ['会う (au)', '友達に会う (tomodachi ni au)'],
    },
    compounds: [
      { word: '会社', reading: 'かいしゃ', romaji: 'kaisha', meaning: 'Company / Firm', jlpt: 'N5', breakdown: '会 [meet] + 社 [shrine/firm]', status: 'Active Vocab' },
      { word: '会話', reading: 'かいわ', romaji: 'kaiwa', meaning: 'Conversation', jlpt: 'N4', breakdown: '会 [meet] + 話 [speak]', status: 'In Review' },
    ],
    strokeSteps: [
      { step: 1, symbol: 'ノ', preview: 'ノ', label: 'Left roof' },
      { step: 2, symbol: '㇏', preview: '人', label: 'Right roof' },
      { step: 3, symbol: '一', preview: '一', label: 'Short bar' },
      { step: 4, symbol: '一', preview: '二', label: 'Long bar' },
      { step: 5, symbol: 'ㄥ', preview: 'ム', label: 'Fold sweep' },
      { step: 6, symbol: '丶', preview: '会', label: 'Closing dot' },
    ],
    balanceCritique:
      'Let the roof 人 flare wider than the base 云 so the character feels grounded and welcoming.',
    stabilityDays: 5,
    nextEvalDays: 2,
    consecutiveCorrect: 2,
  },
];

export const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    id: 'ni-vs-de',
    title: '〜に versus 〜で',
    shortLabel: 'に vs で',
    jlpt: 'N5',
    category: 'Particle (助詞)',
    retention: 78,
    thesis: 'Targeting vs Staging: Defining physical destination points versus the interactive realm of action.',
    ruleAlpha: {
      tag: 'Rule Alpha',
      jpLabel: '帰着点 (Endpoint)',
      lhs: 'Noun (Place)',
      particle: '＋ に ＋',
      rhs: 'Motion Verb',
      examples: 'Examples: 行く (go), 来る (come), 帰る (return)',
    },
    ruleBeta: {
      tag: 'Rule Beta',
      jpLabel: '動作の場所 (Location)',
      lhs: 'Noun (Place)',
      particle: '＋ で ＋',
      rhs: 'Action Verb',
      examples: 'Examples: 食べる (eat), 勉強する (study), 買う (buy)',
    },
    cognitiveDeepDive: {
      primaryTerm: '〜に',
      primaryDesc:
        'marks the needle drop: a final target or point in spacetime where motion terminates, or where an entity passively exists (ある / いる).',
      secondaryTerm: '〜で',
      secondaryDesc:
        'marks the stage: the physical sandbox or boundary envelope inside which dynamic energy and human events unfold.',
      mnemonic:
        'Remember: 図書館で本を読みます (Reading transpires inside the library envelope) vs 図書館に行きます (The library is solely the target destination coordinate).',
    },
    audioExamples: [
      {
        id: 'sample1',
        badge: 'に · Target',
        context: 'Tokyo Transit Context',
        accent: 'primary',
        segments: [
          { text: '明日', rt: 'あした' },
          { text: '、' },
          { text: '東京', rt: 'とうきょう' },
          { text: 'に' },
          { text: '行', rt: 'い' },
          { text: 'きます。' },
        ],
        highlightParticle: 'に',
        romaji: 'Ashita, Toukyou ni ikimasu.',
        en: 'Tomorrow, I will go to Tokyo.',
        plainText: '明日、東京に行きます。',
      },
      {
        id: 'sample2',
        badge: 'で · Action Stage',
        context: 'Dining Activity',
        accent: 'secondary',
        segments: [
          { text: 'レストランで' },
          { text: 'お' },
          { text: '昼', rt: 'ひる' },
          { text: 'ご' },
          { text: '飯', rt: 'はん' },
          { text: 'を' },
          { text: '食', rt: 'た' },
          { text: 'べました。' },
        ],
        highlightParticle: 'で',
        romaji: 'Resutoran de ohirugohan wo tabemashita.',
        en: 'I ate lunch at a restaurant.',
        plainText: 'レストランでお昼ご飯を食べました。',
      },
      {
        id: 'sample3',
        badge: 'に · Specific Point of Time',
        context: 'Chronological Anchor',
        accent: 'primary',
        segments: [
          { text: '毎朝', rt: 'まいあさ' },
          { text: '、' },
          { text: '七時', rt: 'しちじ' },
          { text: 'に' },
          { text: '起', rt: 'お' },
          { text: 'きます。' },
        ],
        highlightParticle: 'に',
        romaji: 'Maiasa, shichiji ni okimasu.',
        en: 'Every morning, I wake up at 7 o’clock.',
        plainText: '毎朝、七時に起きます。',
      },
    ],
    trap: {
      wrongSentence: '学校に行くで勉強します。',
      wrongExplanation:
        'Cannot append で directly to a verb motion phrase without nominalization, nor concatenate motion destination and activity redundantly.',
      rightLine1: '学校に行って勉強します。',
      rightLine2: '学校で勉強します。',
      rightExplanation:
        'Either chain the motion verb with 〜て sequence, or collapse the space purely into the scene of study with で.',
    },
    etymologyNote:
      'In classical Japanese grammar, 「に」 evolved from pointing indicators denoting absolute convergence. Modern learners visualize it as a vector arrow hitting a bullseye, while 「で」 acts as a circle outlining the event perimeter.',
    comparisonMatrix: [
      { pattern: '〜に', role: 'Destination / Presence', verbs: '行く, 来る, いる, ある, 入る', focus: 'Pinpoints the terminal landing site.', accent: 'primary' },
      { pattern: '〜で', role: 'Dynamic Action Arena', verbs: '読む, 働く, 走る, 食べる', focus: 'Bounds the perimeter of event execution.', accent: 'secondary' },
      { pattern: '〜へ (え)', role: 'Orientation / Heading', verbs: '向かう, 旅立つ, 出発する', focus: 'Emphasizes trajectory rather than the final hit.', accent: 'neutral' },
      { pattern: '〜を (Motion Pass)', role: 'Space Traversed', verbs: '渡る, 飛ぶ, 通る, 歩く', focus: 'The actual terrain being passed through or left behind.', accent: 'neutral' },
    ],
    quizQuestions: [
      {
        id: 'q1',
        promptBefore: '昨日、喫茶店［',
        promptAfter: '］コーヒーを飲みました。',
        en: 'Yesterday, I drank coffee at a cafe.',
        correctKey: 'de',
        options: [
          { key: 'ni', label: 'に (ni)', sub: 'Destination' },
          { key: 'de', label: 'で (de)', sub: 'Action Realm' },
          { key: 'he', label: 'へ (he)', sub: 'Direction' },
          { key: 'wo', label: 'を (wo)', sub: 'Traverse' },
        ],
        explanation: '飲みました (drank) is an active event taking place inside the café perimeter, so で is required.',
      },
      {
        id: 'q2',
        promptBefore: '駅の前［',
        promptAfter: '］古い喫茶店があります。',
        en: 'There is an old coffeehouse in front of the station.',
        correctKey: 'ni',
        options: [
          { key: 'ni', label: 'に (ni)', sub: 'Static Existence' },
          { key: 'de', label: 'で (de)', sub: 'Action Realm' },
          { key: 'he', label: 'へ (he)', sub: 'Direction' },
          { key: 'wo', label: 'を (wo)', sub: 'Traverse' },
        ],
        explanation: 'Existence verbs あります / います pinpoint a static location, requiring に.',
      },
      {
        id: 'q3',
        promptBefore: '田中さんは新宿駅［',
        promptAfter: '］電車を降ります。',
        en: 'Mr. Tanaka gets off the train at Shinjuku Station.',
        correctKey: 'de',
        options: [
          { key: 'ni', label: 'に (ni)', sub: 'Destination' },
          { key: 'de', label: 'で (de)', sub: 'Station Venue' },
          { key: 'he', label: 'へ (he)', sub: 'Direction' },
          { key: 'wo', label: 'を (wo)', sub: 'Already used on 電車' },
        ],
        explanation: 'Since 電車を marks the train being alighted, 新宿駅で specifies the station where that action happens.',
      },
    ],
  },
  {
    id: 'wa-vs-ga',
    title: '〜は versus 〜が',
    shortLabel: '〜は vs 〜が',
    jlpt: 'N5',
    category: 'Topic vs Subject (主題・主格)',
    retention: 84,
    thesis: 'Known Framework vs Spotlight Focus: Framing the conversational topic versus introducing new grammatical subjects.',
    ruleAlpha: {
      tag: 'Topic Marker',
      jpLabel: '主題 (Known Context)',
      lhs: 'Known Topic',
      particle: '＋ は ＋',
      rhs: 'Commentary / Predicate',
      examples: 'Examples: 私は学生です, 東京は大きいです',
    },
    ruleBeta: {
      tag: 'Subject Marker',
      jpLabel: '主格 (New Spotlight)',
      lhs: 'Focused Subject',
      particle: '＋ が ＋',
      rhs: 'State / Existence / Discovery',
      examples: 'Examples: 誰が来ますか, コーヒーが好きです',
    },
    cognitiveDeepDive: {
      primaryTerm: '〜は',
      primaryDesc: 'sets the stage curtain: "Speaking of X, here is what I want to tell you about it."',
      secondaryTerm: '〜が',
      secondaryDesc: 'shines a spotlight on X itself: answering "WHO?" or "WHAT?" and pairing with adjectives like 好き, 上手, and ある.',
      mnemonic:
        'Wh-question words (だれ, なに, どれ) can NEVER take は in the question—they always take が (誰が来ましたか？).',
    },
    audioExamples: [
      {
        id: 'wg1',
        badge: 'は · Contrastive Topic',
        context: 'Self Introduction',
        accent: 'primary',
        segments: [
          { text: '私', rt: 'わたし' },
          { text: 'は' },
          { text: 'ベトナム' },
          { text: '人', rt: 'じん' },
          { text: 'です。' },
        ],
        highlightParticle: 'は',
        romaji: 'Watashi wa Betonamu-jin desu.',
        en: 'As for me, I am Vietnamese.',
        plainText: '私はベトナム人です。',
      },
      {
        id: 'wg2',
        badge: 'が · Preference & Existence',
        context: 'Cafe Conversation',
        accent: 'secondary',
        segments: [
          { text: '静', rt: 'しず' },
          { text: 'かな' },
          { text: '喫茶店', rt: 'きっさてん' },
          { text: 'が' },
          { text: '好', rt: 'す' },
          { text: 'きです。' },
        ],
        highlightParticle: 'が',
        romaji: 'Shizuka na kissaten ga suki desu.',
        en: 'I like quiet coffeehouses.',
        plainText: '静かな喫茶店が好きです。',
      },
    ],
    trap: {
      wrongSentence: '誰は来ますか。',
      wrongExplanation: 'Interrogative pronouns (誰, 何, どれ) introduce unknown information and cannot serve as a known topic with は.',
      rightLine1: '誰が来ますか。',
      rightLine2: '田中さんが来ます。',
      rightExplanation: 'Both the interrogative question and its direct answer spotlight the subject with が.',
    },
    etymologyNote:
      'は preserves historical kana orthography (/pa/ → /fa/ → /wa/) to visibly anchor the grammatical boundary between topic and comment.',
    comparisonMatrix: [
      { pattern: '〜は', role: 'Topic Frame', verbs: 'です, 一般述語', focus: 'Shifts attention to what follows は.', accent: 'primary' },
      { pattern: '〜が', role: 'Subject Spotlight', verbs: 'ある, いる, 好き, 分かる', focus: 'Identifies the exact entity before が.', accent: 'secondary' },
    ],
    quizQuestions: [
      {
        id: 'wgq1',
        promptBefore: '［',
        promptAfter: '］が一番美味しいですか。',
        en: 'Which one is the most delicious?',
        correctKey: 'dorega',
        options: [
          { key: 'dorewa', label: 'どれは', sub: 'Invalid topic' },
          { key: 'dorega', label: 'どれが', sub: 'Interrogative subject' },
          { key: 'doreni', label: 'どれに', sub: 'Target' },
          { key: 'dorewo', label: 'どれを', sub: 'Object' },
        ],
        explanation: 'Question words like どれ always pair with が.',
      },
    ],
  },
  {
    id: 'tekara',
    title: '〜てから',
    shortLabel: '〜てから',
    jlpt: 'N5',
    category: 'Temporal Sequence (継起)',
    retention: 86,
    thesis: 'Strict Chronological Prerequisite: Action B commences only after Action A reaches completion.',
    ruleAlpha: {
      tag: 'Primary Action',
      jpLabel: '先行動作 (Prerequisite)',
      lhs: 'Verb (て-form)',
      particle: '＋ から ＋',
      rhs: 'Subsequent Action',
      examples: 'Examples: 食べてから, 帰ってから, 聞いてから',
    },
    ruleBeta: {
      tag: 'Nuance Limit',
      jpLabel: '単発順序 (Single Chain)',
      lhs: 'Single Pair Only',
      particle: '≠',
      rhs: 'Multiple 〜て〜て',
      examples: 'Only one 〜てから per sentence is natural.',
    },
    cognitiveDeepDive: {
      primaryTerm: '〜てから',
      primaryDesc: 'emphasizes dependency: "After doing A (and not before), I do B."',
      secondaryTerm: '〜て、〜',
      secondaryDesc: 'simply lists actions in chronological order without stressing prerequisite completion.',
      mnemonic: 'Think of から as "from that completion point onward."',
    },
    audioExamples: [
      {
        id: 'tk1',
        badge: 'てから · Sequence',
        context: 'Evening Study',
        accent: 'primary',
        segments: [
          { text: '仕事', rt: 'しごと' },
          { text: 'が' },
          { text: '終', rt: 'お' },
          { text: 'わってから、' },
          { text: '日本語', rt: 'にほんご' },
          { text: 'を' },
          { text: '勉強', rt: 'べんきょう' },
          { text: 'します。' },
        ],
        highlightParticle: 'てから',
        romaji: 'Shigoto ga owatte kara, Nihongo wo benkyou shimasu.',
        en: 'After finishing work, I study Japanese.',
        plainText: '仕事が終わってから、日本語を勉強します。',
      },
    ],
    trap: {
      wrongSentence: '朝起きてから、顔を洗ってから、出かけます。',
      wrongExplanation: 'Repeating 〜てから multiple times in one sentence sounds overly rigid and unnatural.',
      rightLine1: '朝起きて、顔を洗ってから出かけます。',
      rightLine2: '朝起きてから出かけます。',
      rightExplanation: 'Use simple 〜て for routine links and reserve 〜てから for the decisive transition.',
    },
    etymologyNote:
      'Combines the conjunctive て-form with the ablative particle から (from), literally meaning "starting from the completion of X."',
    comparisonMatrix: [
      { pattern: 'Vてから', role: 'Strict Prerequisite', verbs: 'All Action Verbs', focus: 'Action 1 must complete before Action 2.', accent: 'primary' },
      { pattern: 'Nの後で', role: 'After Event Noun', verbs: 'Noun + の後で', focus: 'Used with nouns like 食事の後で.', accent: 'secondary' },
    ],
    quizQuestions: [
      {
        id: 'tkq1',
        promptBefore: '手を［',
        promptAfter: '］、ご飯を食べましょう。',
        en: 'After washing your hands, let’s eat.',
        correctKey: 'aratte',
        options: [
          { key: 'arau', label: '洗うから', sub: 'Reason' },
          { key: 'aratte', label: '洗ってから', sub: 'After doing' },
          { key: 'araitai', label: '洗いたいから', sub: 'Desire' },
          { key: 'arawanai', label: '洗わないで', sub: 'Without' },
        ],
        explanation: 'Verb て-form + から expresses "after washing."',
      },
    ],
  },
  {
    id: 'temoii-tewaikenai',
    title: '〜てもいい vs 〜てはいけません',
    shortLabel: '〜てもいい / てはいけません',
    jlpt: 'N5',
    category: 'Modality (許可・禁止)',
    retention: 79,
    thesis: 'Social Permission & Boundary Prohibition: Asking politely for clearance versus stating rules firmly.',
    ruleAlpha: {
      tag: 'Permission',
      jpLabel: '許可 (May I / You may)',
      lhs: 'Verb (て-form)',
      particle: '＋ もいいですか',
      rhs: 'Polite Inquiry',
      examples: '写真を撮ってもいいですか (May I take a photo?)',
    },
    ruleBeta: {
      tag: 'Prohibition',
      jpLabel: '禁止 (Must not)',
      lhs: 'Verb (て-form)',
      particle: '＋ はいけません',
      rhs: 'Rule / Boundary',
      examples: 'ここで食べてはいけません (You must not eat here)',
    },
    cognitiveDeepDive: {
      primaryTerm: '〜てもいい',
      primaryDesc: 'literally means "even if you do X, it is good," creating a soft permission frame.',
      secondaryTerm: '〜てはいけません',
      secondaryDesc: 'means "as for doing X, it will not go (いけません)." Used in public signage, museums, and classrooms.',
      mnemonic: 'In casual conversation, 〜てはいけません softens to 〜ちゃだめ (must not).',
    },
    audioExamples: [
      {
        id: 'tm1',
        badge: 'てもいい · Permission',
        context: 'Museum / Cafe',
        accent: 'secondary',
        segments: [
          { text: 'ここ' },
          { text: 'に' },
          { text: '座', rt: 'すわ' },
          { text: 'ってもいいですか。' },
        ],
        highlightParticle: 'てもいい',
        romaji: 'Koko ni suwatte mo ii desu ka?',
        en: 'May I sit here?',
        plainText: 'ここに座ってもいいですか。',
      },
    ],
    trap: {
      wrongSentence: '美術館で写真を撮るはいけません。',
      wrongExplanation: 'You must convert the verb to the て-form before attaching はいけません.',
      rightLine1: '美術館で写真を撮ってはいけません。',
      rightLine2: '美術館で写真を撮らないでください。',
      rightExplanation: '撮ってはいけません states a strict rule; 撮らないでください is a polite request not to.',
    },
    etymologyNote:
      'いけません derives from 行く (to go well), meaning "that route does not work / is not permitted."',
    comparisonMatrix: [
      { pattern: '〜てもいいです', role: 'Permission Granted', verbs: 'All Verbs (て-form)', focus: 'Grants clearance softly.', accent: 'secondary' },
      { pattern: '〜てはいけません', role: 'Prohibition', verbs: 'All Verbs (て-form)', focus: 'States an institutional or social boundary.', accent: 'primary' },
    ],
    quizQuestions: [
      {
        id: 'tmq1',
        promptBefore: '図書館で大きな声で［',
        promptAfter: '］。',
        en: 'You must not speak loudly in the library.',
        correctKey: 'hanashitewa',
        options: [
          { key: 'hanashitemo', label: '話してもいいです', sub: 'Permission' },
          { key: 'hanashitewa', label: '話してはいけません', sub: 'Prohibition' },
          { key: 'hanashimasu', label: '話します', sub: 'Neutral' },
          { key: 'hanashikara', label: '話してから', sub: 'Sequence' },
        ],
        explanation: 'Prohibitions in public spaces use 〜てはいけません.',
      },
    ],
  },
];

export const LESSON_STAGES = [
  { num: '01', label: 'ORIENT', status: 'done' as const },
  { num: '02', label: 'INPUT', status: 'done' as const },
  { num: '03', label: 'SYNTAX', status: 'done' as const },
  { num: '04', label: 'PRACTICE', status: 'active' as const },
  { num: '05', label: 'APPLICATION', status: 'locked' as const },
  { num: '06', label: 'DIAGNOSIS', status: 'locked' as const },
  { num: '07', label: 'RETENTION', status: 'locked' as const },
];

export const LESSON_CHALLENGES: LessonChallenge[] = [
  {
    id: 'ch-1',
    code: 'Prompt 4.2 · Production',
    category: 'Self-Identification & Status',
    venue: 'Tokyo Academic Seminar',
    promptTitle:
      'Construct a formal Japanese self-introduction stating you are a Vietnamese university student.',
    promptDesc:
      'Establish an authentic, polite sociolinguistic identity frame using the standard copula structure 〜は〜です. Include your origin attribute via the genitive linkage particle.',
    slots: [
      { role: 'Topic Subj', expectedWord: '私' },
      { role: 'Particle (wa)', expectedWord: 'は', accent: 'primary' },
      { role: 'Origin Attribute', expectedWord: 'ベトナム人' },
      { role: 'Genitive Link', expectedWord: 'の', accent: 'secondary' },
      { role: 'Identity Noun', expectedWord: '学生' },
      { role: 'Polite Copula', expectedWord: 'です', accent: 'primary' },
    ],
    tiles: [
      { id: 't1', word: '私', kana: 'わたし', role: 'Pronoun' },
      { id: 't2', word: 'は', kana: 'wa', role: 'Topic', accent: 'primary' },
      { id: 't3', word: 'ベトナム人', kana: 'ベトナムじん', role: 'Origin' },
      { id: 't4', word: 'の', kana: 'no', role: 'Genitive', accent: 'secondary' },
      { id: 't5', word: '学生', kana: 'がくせい', role: 'Noun' },
      { id: 't6', word: 'です', kana: 'desu', role: 'Copula', accent: 'primary' },
      { id: 't7', word: '日本人', kana: 'にほんじん', role: 'Distractor' },
      { id: 't8', word: '会社員', kana: 'かいしゃいん', role: 'Distractor' },
      { id: 't9', word: 'を', kana: 'wo', role: 'Distractor' },
      { id: 't10', word: 'ではありません', kana: 'dewa arimasen', role: 'Distractor' },
    ],
    literalTranslation: 'Literal: “As for me, [I am a] Vietnamese university student.”',
    fullJapanese: '私はベトナム人の学生です。',
    pitchMoras: ['わ・た・し・は', 'ベ・ト・ナ・ム・人・の', '学・生・で・す'],
  },
  {
    id: 'ch-2',
    code: 'Prompt 4.3 · Spatial Action',
    category: 'Spatial Particle Disambiguation',
    venue: 'Ginza Café Rengetsu',
    promptTitle: 'Assemble a sentence saying you drank coffee at a traditional cafe yesterday.',
    promptDesc:
      'Use the action venue particle で rather than destination particle に, and finish with the polite past tense of 飲む (飲みました).',
    slots: [
      { role: 'Time Anchor', expectedWord: '昨日' },
      { role: 'Location', expectedWord: '喫茶店' },
      { role: 'Venue Marker', expectedWord: 'で', accent: 'secondary' },
      { role: 'Object', expectedWord: 'コーヒー' },
      { role: 'Direct Obj', expectedWord: 'を', accent: 'primary' },
      { role: 'Past Verb', expectedWord: '飲みました', accent: 'primary' },
    ],
    tiles: [
      { id: 'c1', word: '昨日', kana: 'きのう', role: 'Time' },
      { id: 'c2', word: '喫茶店', kana: 'きっさてん', role: 'Place' },
      { id: 'c3', word: 'で', kana: 'de', role: 'Venue', accent: 'secondary' },
      { id: 'c4', word: 'コーヒー', kana: 'koohii', role: 'Object' },
      { id: 'c5', word: 'を', kana: 'wo', role: 'Particle', accent: 'primary' },
      { id: 'c6', word: '飲みました', kana: 'のみました', role: 'Verb', accent: 'primary' },
      { id: 'c7', word: 'に', kana: 'ni', role: 'Distractor' },
      { id: 'c8', word: '明日', kana: 'あした', role: 'Distractor' },
      { id: 'c9', word: '飲みます', kana: 'のみます', role: 'Distractor' },
    ],
    literalTranslation: 'Literal: “Yesterday, at the coffeehouse, [I] drank coffee.”',
    fullJapanese: '昨日、喫茶店でコーヒーを飲みました。',
    pitchMoras: ['き・の・う', 'きっ・さ・て・ん・で', 'コー・ヒー・を・の・み・ま・し・た'],
  },
];

export const LEARNING_LEVELS = [
  {
    id: 'N5' as JlptLevel,
    kanjiNum: '五',
    title: 'Foundation',
    jpSub: '言霊の基礎',
    progress: 68,
    modulesDone: '34/50',
    remaining: '16 Remaining',
    status: 'active' as const,
    unitsCount: 8,
    lessonsCount: 48,
    vocabCount: 800,
    kanjiCount: 103,
    patternsCount: 34,
    description:
      'Establishing the grammar syntax, functional copulas, foundational particles, and immediate conversational agency in genuine everyday contexts.',
  },
  {
    id: 'N4' as JlptLevel,
    kanjiNum: '四',
    title: 'Elementary',
    jpSub: '日常の深化',
    progress: 12,
    modulesDone: '6/52',
    remaining: 'Conditional Access',
    status: 'unlocked' as const,
    unitsCount: 10,
    lessonsCount: 52,
    vocabCount: 1500,
    kanjiCount: 181,
    patternsCount: 64,
    description:
      'Transitioning into plain forms, potential/passive voice, transitive vs. intransitive verb pairs, and respectful everyday keigo.',
  },
  {
    id: 'N3' as JlptLevel,
    kanjiNum: '三',
    title: 'Intermediate',
    jpSub: '実用と応用',
    progress: 0,
    modulesDone: '0/60',
    remaining: 'Unlocks at N4 Pass',
    status: 'locked' as const,
    unitsCount: 12,
    lessonsCount: 60,
    vocabCount: 3750,
    kanjiCount: 361,
    patternsCount: 110,
    description:
      'Bridging everyday conversation to authentic newspapers, workplace correspondence, and nuanced causal/conditional clauses.',
  },
  {
    id: 'N2' as JlptLevel,
    kanjiNum: '二',
    title: 'Advanced',
    jpSub: '抽象と言説',
    progress: 0,
    modulesDone: '0/68',
    remaining: 'Requires 1,000 Kanji',
    status: 'locked' as const,
    unitsCount: 14,
    lessonsCount: 68,
    vocabCount: 6000,
    kanjiCount: 415,
    patternsCount: 165,
    description:
      'Mastering formal journalism, abstract essays, literary register shifts, and rapid-fire business Japanese.',
  },
  {
    id: 'N1' as JlptLevel,
    kanjiNum: '一',
    title: 'Mastery',
    jpSub: '言登極意',
    progress: 0,
    modulesDone: '0/80',
    remaining: 'Native Fluency Apex',
    status: 'locked' as const,
    unitsCount: 16,
    lessonsCount: 80,
    vocabCount: 10000,
    kanjiCount: 1076,
    patternsCount: 220,
    description:
      'Complete Jōyō kanji command, classical idioms, subtle rhetorical cadence, and native-grade comprehension across literature and debate.',
  },
];

export const N5_UNITS = [
  {
    unitNum: 'Unit 01',
    titleJp: 'はじめまして',
    titleEn: 'Foundations & Greetings',
    status: 'completed' as const,
    progressText: '100% Completed',
    archivedText: '4/4 Modules Archived',
    category: 'Kana & Orthography',
    lessons: [
      { id: '1.1', title: '1.1 Hiragana Essentials & Phonetics', desc: 'Clear vowels, dakuten, and contracted sounds (拗音)', tag: 'Kana', category: 'Kana & Orthography', done: true },
      { id: '1.2', title: '1.2 Self-Introduction: The Copula (〜は〜です)', desc: 'Identity statements, question marker か, negation ではありません', tag: 'Grammar', category: 'Grammar Patterns (文型)', done: true },
      { id: '1.3', title: '1.3 Cardinal Numbers, Counters & Expressing Time', desc: '1–10,000, 〜時 (hours), 〜分 (minutes), and basic currency 円', tag: 'Lexicon', category: 'Vocabulary & Kanji', done: true },
      { id: '1.4', title: '1.4 Comprehensive Unit Review & Dictation', desc: 'Scored: 98% · Distinction in Listening Accuracy', tag: '100 / 100', category: 'Milestone Assessments', done: true, verified: true },
    ],
  },
  {
    unitNum: 'Unit 02',
    titleJp: '日常の物と場所',
    titleEn: 'Objects, Places & Demonstratives',
    status: 'completed' as const,
    progressText: '100% Completed',
    archivedText: '4/4 Modules Archived',
    category: 'Grammar Patterns (文型)',
    lessons: [
      { id: '2.1', title: '2.1 The Ko-So-A-Do System I: これ / それ / あれ / どれ', desc: 'Proximity indexing of physical artifacts in the immediate space', tag: 'Syntax', category: 'Grammar Patterns (文型)', done: true },
      { id: '2.2', title: '2.2 The Ko-So-A-Do System II: ここ / そこ / あそこ / どこ', desc: 'Locational inquiry, polite variants (こちら/そちら), department markers', tag: 'Syntax', category: 'Grammar Patterns (文型)', done: true },
      { id: '2.3', title: '2.3 Katakana in Daily Life & Modern Loanwords', desc: 'Menu navigation, office items, foreign geography transliteration', tag: 'Orthography', category: 'Kana & Orthography', done: true },
      { id: '2.4', title: '2.4 Unit Assessment: Navigating the Convenience Store', desc: 'Interactive situational scenario (Audio simulation pass 94%)', tag: '94 / 100', category: 'Milestone Assessments', done: true, verified: true },
    ],
  },
  {
    unitNum: 'Unit 03',
    titleJp: '日々の行動',
    titleEn: 'Daily Routines & Particles',
    status: 'active' as const,
    progressText: '65% Mastered (3 of 5 In Flight)',
    archivedText: 'Active Session Unit',
    category: 'Grammar Patterns (文型)',
    description:
      'The gateway into Japanese verbal architecture. Mastering motion verbs and the disambiguation of spatial particles.',
    lessons: [
      { id: '3.1', title: '3.1 Everyday Action Verbs (ます Form Foundations)', desc: 'Conjugation mechanics: 食べます, 飲みます, 読みます', tag: 'Conjugation', category: 'Grammar Patterns (文型)', done: true },
      {
        id: '3.2',
        title: '3.2 Spatial Particles: に vs で vs へ Disambiguation',
        desc: 'Definitive rules separating static location (に), action venue (で), and directional orientation (へ).',
        tag: 'Grammar Focus',
        category: 'Grammar Patterns (文型)',
        done: false,
        active: true,
        meta: ['Grammar Focus', '3 Drills', '1 Production Test'],
      },
      { id: '3.3', title: '3.3 Time Expressions & Frequency Adverbs', desc: '午前 / 午後, 毎日 (every day), ときどき (sometimes)', tag: 'Lexicon', category: 'Vocabulary & Kanji', done: false, next: true },
      { id: '3.4', title: '3.4 Listening Drill: Tokyo Commuter Morning', desc: 'Blind comprehension & shadowing around Shinjuku station', tag: 'Audio', category: 'Listening & Shadowing', done: false, locked: true },
    ],
  },
  {
    unitNum: 'Unit 04',
    titleJp: '街と交際',
    titleEn: 'City Navigation, Invitations & Existence',
    status: 'upcoming' as const,
    progressText: 'Unlocks after Unit 03',
    archivedText: '0/4 Modules',
    category: 'Listening & Shadowing',
    lessons: [
      { id: '4.1', title: '4.1 Animate vs Inanimate Existence (います / あります)', desc: 'Distinguishing living beings from static objects and events', tag: 'Syntax', category: 'Grammar Patterns (文型)', done: false, locked: true },
      { id: '4.2', title: '4.2 Polite Invitations (〜ませんか / 〜ましょう)', desc: 'Natural social invitations for coffee, dinner, and weekend plans', tag: 'Dialogue', category: 'Listening & Shadowing', done: false, locked: true },
    ],
  },
];

export const SENSEI_SCENARIOS: SenseiScenario[] = [
  {
    id: 'kissaten',
    title: 'Retro Kissaten Rengetsu',
    japaneseTitle: '純喫茶 蓮月',
    kanjiBadge: '蓮',
    persona: 'マスター・田中 (Master Tanaka, 62) · 丁寧語 (Teineigo) with Keigo Hospitality',
    setting: 'Ginza Café Rengetsu (喫茶 蓮月) · 14:45 · Ambient Low Jazz',
    ambientLabel: 'Time: 14:45 · Ambient Sound: Low Jazz',
    image: '/images/kissaten_interior_vignette.jpg',
    goals: [
      { id: 'g1', jp: '人数を伝える (1名)', en: 'Party size: ひとり', done: true },
      { id: 'g2', jp: '窓際の席を希望する', en: 'Polite seat request', done: true },
      { id: 'g3', jp: 'おすすめを尋ね注文', en: 'Inquire recommend & coffee', done: false },
    ],
    initialTurns: [
      {
        id: 't1',
        role: 'sensei',
        senderName: 'マスター・田中',
        time: '14:02 PM',
        japanese: 'いらっしゃいませ！何名様ですか？',
        segments: [
          { text: 'いらっしゃいませ！' },
          { text: '何名様', rt: 'なんめいさま' },
          { text: 'ですか？' },
        ],
        romaji: 'Irasshaimase! Nan-mei-sama desu ka?',
        english: 'Welcome! How many people in your party?',
        hint: 'Formulation hint: Use counter ひとり (1 person) or ふたり (2 people) with でお願いします.',
      },
      {
        id: 't2',
        role: 'user',
        senderName: '客 · T. Tanaka',
        time: '14:03 PM',
        japanese: '一人でお願いします。窓の席は空いていますか？',
        segments: [
          { text: '一人', rt: 'ひとり' },
          { text: 'でお' },
          { text: '願', rt: 'ねが' },
          { text: 'いします。' },
          { text: '窓', rt: 'まど' },
          { text: 'の' },
          { text: '席', rt: 'せき' },
          { text: 'は' },
          { text: '空', rt: 'あ' },
          { text: 'いていますか？' },
        ],
        romaji: 'Hitori de onegaishimasu. Mado no seki wa aite imasu ka?',
        english: 'Just one person, please. Is a window seat available?',
        naturalnessScore: 96,
        pitchNote: 'Pitch: Flat Heiban [平板] ✓',
        verifiedTag: 'Particle 「で」 Verified',
      },
      {
        id: 't3',
        role: 'sensei',
        senderName: 'マスター・田中',
        time: '14:03 PM',
        japanese: 'かしこまりました。窓際の席へどうぞ。ご注文が決まりましたらお呼びください。',
        segments: [
          { text: 'かしこまりました。' },
          { text: '窓際', rt: 'まどぎわ' },
          { text: 'の' },
          { text: '席', rt: 'せき' },
          { text: 'へどうぞ。ご' },
          { text: '注文', rt: 'ちゅうもん' },
          { text: 'が' },
          { text: '決', rt: 'き' },
          { text: 'まりましたらお' },
          { text: '呼', rt: 'よ' },
          { text: 'びください。' },
        ],
        romaji: 'Kashikomarimashita. Madogiwa no seki e douzo. Go-chuumon ga kimarimashitara oyobi kudasai.',
        english: 'Certainly. Please take this window seat. Call me whenever you are ready to place your order.',
        cultureMemo:
          'The master says 「かしこまりました」 instead of 「わかりました」 to honor the patron in traditional hospitality etiquette (おもてなし).',
      },
    ],
    suggestedReplies: [
      { jp: 'おすすめは何ですか？アイスコーヒーをお願いします。', en: 'What do you recommend? One iced coffee please.' },
      { jp: '本日のブレンドは何ですか？', en: 'What is today’s house blend?' },
      { jp: 'アイスコーヒーをひとつください。', en: 'One iced coffee, please.' },
    ],
  },
  {
    id: 'shinjuku',
    title: 'Shinjuku Station Ticket Gate',
    japaneseTitle: '新宿駅 改札口',
    kanjiBadge: '駅',
    persona: '駅員・佐藤 (Station Staff Sato, 34) · Crisp Standard Service Teineigo',
    setting: 'JR Shinjuku South Exit · 08:25 · Morning Rush',
    ambientLabel: 'Time: 08:25 · Yamanote Line Chimes',
    image: '/images/shinjuku_morning_commute.jpg',
    goals: [
      { id: 's1', jp: '乗り換えホームを尋ねる', en: 'Ask transfer platform', done: false },
      { id: 's2', jp: 'Suicaのチャージ場所を確認', en: 'Confirm IC card recharge', done: false },
      { id: 's3', jp: 'お礼を述べる', en: 'Express polite thanks', done: false },
    ],
    initialTurns: [
      {
        id: 'st1',
        role: 'sensei',
        senderName: '駅員・佐藤',
        time: '08:25 AM',
        japanese: 'おはようございます。どちらまで行かれますか？',
        segments: [
          { text: 'おはようございます。どちらまで' },
          { text: '行', rt: 'い' },
          { text: 'かれますか？' },
        ],
        romaji: 'Ohayou gozaimasu. Dochira made ikaremasu ka?',
        english: 'Good morning. Where are you headed today?',
        hint: 'Use 「〜に行きたいのですが」(I would like to go to...) or 「〜番線はどこですか？」.',
      },
    ],
    suggestedReplies: [
      { jp: '渋谷駅に行きたいのですが、何番線ですか？', en: 'I want to go to Shibuya—which platform is it?' },
      { jp: '山手線のホームはどこにありますか？', en: 'Where is the Yamanote Line platform?' },
    ],
  },
  {
    id: 'seminar',
    title: 'Tokyo Academic Seminar',
    japaneseTitle: '東京大学ゼミ室',
    kanjiBadge: '学',
    persona: '先輩・高橋 (Senior Fellow Takahashi, 24) · Polite Peer Academic Register',
    setting: 'Hongo Seminar Room · 10:00 · Morning Study',
    ambientLabel: 'Time: 10:00 · Quiet Academic Room',
    image: '/images/tokyo_university_seminar.jpg',
    goals: [
      { id: 'u1', jp: '自己紹介をする', en: 'Introduce name & university', done: false },
      { id: 'u2', jp: '研究分野を説明する', en: 'State field of study', done: false },
    ],
    initialTurns: [
      {
        id: 'ut1',
        role: 'sensei',
        senderName: '先輩・高橋',
        time: '10:00 AM',
        japanese: 'はじめまして！高橋と申します。ご専攻は何ですか？',
        segments: [
          { text: 'はじめまして！' },
          { text: '高橋', rt: 'たかはし' },
          { text: 'と' },
          { text: '申', rt: 'もう' },
          { text: 'します。ご' },
          { text: '専攻', rt: 'せんこう' },
          { text: 'は' },
          { text: '何', rt: 'なん' },
          { text: 'ですか？' },
        ],
        romaji: 'Hajimemashite! Takahashi to moushimasu. Go-senkou wa nan desu ka?',
        english: 'Nice to meet you! My name is Takahashi. What is your major?',
        hint: 'Reply using 「私は〜の学生です。専門は〜です。」',
      },
    ],
    suggestedReplies: [
      { jp: 'はじめまして。私はベトナム人の学生です。', en: 'Nice to meet you. I am a Vietnamese student.' },
      { jp: '専門は日本語と情報工学です。よろしくお願いします。', en: 'My major is Japanese and computer engineering.' },
    ],
  },
];

export const LISTENING_SEGMENTS = [
  {
    id: 'seg-1',
    timeRange: '00:00 - 00:18',
    durationLabel: '00:12 / 01:45',
    progressPct: 18,
    plain: 'おはようございます。今は朝の七時半です。',
    romaji: 'Ohayou gozaimasu. Ima wa asa no shichiji-han desu.',
    en: 'Good morning. It is now 7:30 in the morning.',
    tokens: [
      { surface: 'おはようございます', reading: 'おはようございます', pos: 'Greeting', gloss: 'Good morning (polite)', particle: false },
      { surface: '今', reading: 'いま', pos: 'Noun', gloss: 'Now / current moment', particle: false },
      { surface: 'は', reading: 'wa', pos: 'Topic Particle', gloss: 'Marks current time as topic', particle: true },
      { surface: '朝', reading: 'あさ', pos: 'Noun', gloss: 'Morning', particle: false },
      { surface: 'の', reading: 'no', pos: 'Genitive', gloss: 'Possessive link ("of")', particle: true },
      { surface: '七時半', reading: 'しちじはん', pos: 'Time', gloss: '7:30 (half past seven)', particle: false },
      { surface: 'です', reading: 'desu', pos: 'Copula', gloss: 'Polite copula', particle: false },
    ],
  },
  {
    id: 'seg-2',
    timeRange: '00:18 - 00:32',
    durationLabel: '00:24 / 01:45',
    progressPct: 45,
    plain: '毎朝、新宿駅で山手線に乗り換えます。',
    romaji: 'Maiasa, Shinjuku-eki de Yamanote-sen ni norikaemasu.',
    en: 'Every morning, I transfer to the Yamanote Line at Shinjuku Station.',
    tokens: [
      { surface: '毎朝', reading: 'まいあさ', pos: 'Temporal Noun', gloss: 'Every morning (no に needed)', particle: false },
      { surface: '新宿駅', reading: 'しんじゅくえき', pos: 'Proper Noun', gloss: 'Shinjuku Station (Tokyo hub)', particle: false },
      { surface: 'で', reading: '格助詞', pos: 'Action Venue', gloss: 'Marks station where transfer action occurs', particle: true, accent: 'tertiary' as const },
      { surface: '山手線', reading: 'やまのてせん', pos: 'Proper Noun', gloss: 'JR Yamanote Loop Line', particle: false },
      { surface: 'に', reading: '帰着点', pos: 'Target Particle', gloss: 'Marks target train boarded', particle: true, accent: 'secondary' as const },
      { surface: '乗り換えます', reading: 'のりかえます', pos: 'Compound Verb', gloss: 'To transfer / change trains', particle: false },
    ],
  },
  {
    id: 'seg-3',
    timeRange: '00:32 - 00:54',
    durationLabel: '00:44 / 01:45',
    progressPct: 68,
    plain: '駅前の喫茶店で熱いコーヒーを飲みます。',
    romaji: 'Ekimae no kissaten de atsui koohii wo nomimasu.',
    en: 'I drink hot coffee at the coffeehouse in front of the station.',
    tokens: [
      { surface: '駅前', reading: 'えきまえ', pos: 'Noun', gloss: 'In front of the station', particle: false },
      { surface: 'の', reading: 'no', pos: 'Genitive', gloss: 'Location modifier', particle: true },
      { surface: '喫茶店', reading: 'きっさてん', pos: 'Noun', gloss: 'Traditional retro cafe', particle: false },
      { surface: 'で', reading: '格助詞', pos: 'Action Venue', gloss: 'Venue where drinking occurs', particle: true, accent: 'tertiary' as const },
      { surface: '熱い', reading: 'あつい', pos: 'i-Adjective', gloss: 'Hot (to the touch / temperature)', particle: false },
      { surface: 'コーヒー', reading: 'こーひー', pos: 'Loanword', gloss: 'Coffee', particle: false },
      { surface: 'を', reading: 'wo', pos: 'Object Marker', gloss: 'Direct object of 飲みます', particle: true },
      { surface: '飲みます', reading: 'のみます', pos: 'Verb', gloss: 'Drink (polite)', particle: false },
    ],
  },
];

export const MOCK_EXAM_QUESTIONS: MockQuestionDetail[] = Array.from({ length: 35 }, (_, idx) => {
  const num = idx + 1;
  const errors = new Set([4, 12, 18, 24]);
  const flagged = new Set([7, 17, 31]);
  const status: 'correct' | 'error' | 'flagged' = errors.has(num)
    ? 'error'
    : flagged.has(num)
      ? 'flagged'
      : 'correct';

  if (num === 18) {
    return {
      num: 18,
      status: 'error',
      section: 'Section II: Grammar & Sentence Patterns (文法・文の組み立て)',
      timeSpent: 58,
      sentenceBefore: '田中さんは 毎朝、新宿駅',
      sentenceAfter: '電車を 降ります。',
      english: 'Mr. Tanaka gets off the train at Shinjuku Station every morning.',
      userChoice: 'A',
      correctChoice: 'C',
      options: [
        {
          code: 'A',
          label: '[A] に (ni)',
          note: 'Common False Friend: Learners frequently associate stations with に, confusing the destination of boarding (電車に乗る) with the locus of detachment.',
        },
        {
          code: 'B',
          label: '[B] で (de)',
          note: 'で marks an action realm, but here the train 電車 takes を as point of origin when alighting (電車を降りる).',
        },
        {
          code: 'C',
          label: '[C] を (wo)',
          note: 'Crucial Rule: Verbs of detachment and egress (降りる, 出る, 離れる) require を to mark the vehicle or space departed.',
        },
        {
          code: 'D',
          label: '[D] へ (he)',
          note: 'Directional vector particle. Cannot govern point-of-origin motion.',
        },
      ],
      senseiNote:
        'Recall Grammar Unit 03 · Lesson 3.2: Contrast 電車に乗る (Board with に) against 電車を降りる (Alight with を). This pair is a classic JLPT N5 trap item appearing in 68% of past test cycles.',
    };
  }

  if (num === 24) {
    return {
      num: 24,
      status: 'error',
      section: 'Section II: Grammar & Sentence Patterns (文法・文の組み立て)',
      timeSpent: 49,
      sentenceBefore: 'パーティーに 学生が',
      sentenceAfter: '来ました。',
      english: 'Two students came to the party.',
      userChoice: 'B',
      correctChoice: 'A',
      options: [
        { code: 'A', label: '[A] 二人 (ふたり)', note: 'Correct irregular Japanese counter for two people (futari).' },
        { code: 'B', label: '[B] 二にん (ににん)', note: 'False regularization: 1人 (ひとり) and 2人 (ふたり) never use -にん.' },
        { code: 'C', label: '[C] 二つ (ふたつ)', note: 'Used for general inanimate objects, not people.' },
        { code: 'D', label: '[D] 二枚 (にまい)', note: 'Used for flat thin objects like paper or tickets.' },
      ],
      senseiNote:
        '1人 (hitori) and 2人 (futari) are native Yamato readings. From 3人 (sannin) onward, Sino-Japanese -nin takes over.',
    };
  }

  if (num === 4 || num === 12) {
    return {
      num,
      status: 'error',
      section: 'Section I: Language Knowledge (文字・語彙)',
      timeSpent: 51,
      sentenceBefore: '昨日、図書館',
      sentenceAfter: '日本の歴史を勉強しました。',
      english: 'Yesterday, I studied Japanese history at the library.',
      userChoice: 'A',
      correctChoice: 'B',
      options: [
        { code: 'A', label: '[A] に (ni)', note: 'Marks static existence or destination—cannot stage an active verb like 勉強する.' },
        { code: 'B', label: '[B] で (de)', note: 'Correct action stage particle bounding where studying happens.' },
        { code: 'C', label: '[C] へ (he)', note: 'Directional orientation only.' },
        { code: 'D', label: '[D] と (to)', note: 'Accompaniment or quotation particle.' },
      ],
      senseiNote:
        'Whenever an activity takes place inside a building (library, cafe, office), use で.',
    };
  }

  return {
    num,
    status,
    section:
      num <= 12
        ? 'Section I: Language Knowledge (文字・語彙)'
        : num <= 28
          ? 'Section II: Grammar & Sentence Patterns (文法・文の組み立て)'
          : 'Section III: Reading Comprehension (読解)',
    timeSpent: 34 + (num % 15),
    sentenceBefore: '毎日 朝 七時',
    sentenceAfter: '起きて、新聞を読みます。',
    english: 'Every day I wake up at 7 a.m. and read the newspaper.',
    userChoice: 'B',
    correctChoice: 'B',
    options: [
      { code: 'A', label: '[A] で (de)', note: 'Used for locations of action or means, not exact clock time.' },
      { code: 'B', label: '[B] に (ni)', note: 'Correct chronological pinpoint marker for exact clock times (七時に).' },
      { code: 'C', label: '[C] を (wo)', note: 'Marks direct object or traversed space.' },
      { code: 'D', label: '[D] が (ga)', note: 'Subject identifier particle.' },
    ],
    senseiNote:
      'Exact clock hours (七時に), days of the week (月曜日に), and calendar dates take に, whereas relative times (毎日, 今日) do not.',
  };
});

export const SPRINT_QUESTIONS = [
  {
    id: 'sp1',
    prompt: '昨日、友だちと喫茶店［　］コーヒーを飲みました。',
    en: 'Yesterday, I drank coffee with a friend at a cafe.',
    options: ['に', 'で', 'へ', 'を'],
    correct: 1,
    explanation: 'Action venue takes で (飲みました occurs inside the cafe).',
  },
  {
    id: 'sp2',
    prompt: '毎朝、新宿駅［　］電車を降ります。',
    en: 'Every morning, I get off the train at Shinjuku Station.',
    options: ['を', 'で', 'に', 'から'],
    correct: 1,
    explanation: '電車 already takes を; the station where you perform the alighting action takes で.',
  },
  {
    id: 'sp3',
    prompt: '来月、東京［　］行く予定です。',
    en: 'Next month, I plan to go to Tokyo.',
    options: ['で', 'を', 'に', 'が'],
    correct: 2,
    explanation: 'Motion destination with 行く takes に (or へ).',
  },
  {
    id: 'sp4',
    prompt: 'すみません、窓の席［　］座ってもいいですか。',
    en: 'Excuse me, may I sit at the window seat?',
    options: ['に', 'で', 'を', 'は'],
    correct: 0,
    explanation: 'The target spot where one settles/sits (座る) takes に.',
  },
  {
    id: 'sp5',
    prompt: '部屋に学生が［　］います。',
    en: 'There are two students in the room.',
    options: ['ににん', 'ふたり', 'ふたつ', 'ひとり'],
    correct: 1,
    explanation: 'Two people is read irregularly as ふたり (二人).',
  },
];

export const SRS_REVIEW_CARDS = [
  { id: 'srs1', front: '喫茶店', reading: 'きっさてん', meaning: 'Traditional Japanese retro cafe', jlpt: 'N5' as JlptLevel, context: '静かな喫茶店で本を読む。' },
  { id: 'srs2', front: '新宿駅で乗り換える', reading: 'しんじゅくえきでのりかえる', meaning: 'To transfer trains at Shinjuku Station', jlpt: 'N5' as JlptLevel, context: '毎朝、新宿駅で山手線に乗り換えます。' },
  { id: 'srs3', front: '時', reading: 'じ / とき', meaning: 'Time / Hour (10 strokes, radical 日)', jlpt: 'N5' as JlptLevel, context: '今、何時ですか。' },
  { id: 'srs4', front: 'かしこまりました', reading: 'kashikomarimashita', meaning: 'Certainly / Right away (Hospitality Keigo)', jlpt: 'N4' as JlptLevel, context: 'かしこまりました。窓際の席へどうぞ。' },
  { id: 'srs5', front: '一人 / 二人', reading: 'ひとり / ふたり', meaning: 'One person / Two people (Irregular counter)', jlpt: 'N5' as JlptLevel, context: '一人でお願いします。' },
  { id: 'srs6', front: '電車を降りる', reading: 'でんしゃをおりる', meaning: 'To get off the train (uses を)', jlpt: 'N5' as JlptLevel, context: '次の駅で電車を降ります。' },
];
