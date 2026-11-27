# KOTO (言登) — Phase 11: Japanese Content Engine & Curriculum Quality Assurance (QA) Blueprint

**Authors**: Japanese Curriculum Architect, Linguistic Content Designer, Educational QA Specialist & Learning Data Architect  
**Product**: KOTO Japanese Learning Ecosystem (JLPT N5 → N1 Knowledge Graph)  
**Status**: APPROVED & CODIFIED INTO PRODUCTION CONTENT PIPELINE  

---

## Executive Summary & Linguistic Charter

To transition KOTO from an architectural blueprint into a scalable, linguistically authoritative Japanese academy, **Phase 11 introduces the Japanese Content Engine (JCE)**. The fundamental thesis of JCE is that Japanese cannot be effectively taught through isolated, flat flashcard databases or ad-hoc LLM prompting. Japanese language mastery requires a **multidimensional relational knowledge graph** where orthography (Kanji), lexicon (Vocabulary), morpho-syntax (Grammar), acoustic prosody (Audio/Pitch Accent), and situational pragmatics (Register/Sociolinguistics) are linked as single canonical entities and validated against strict pedagogical governance.

---

## 1. Relational Content Entity Architecture

Every learning asset in KOTO is modeled as an immutable, globally addressable canonical entity with rich metadata, semantic bidirectional relations, and strict verification states.

```
                             ┌────────────────────────┐
                             │      KANJI ENTITY      │
                             │  ID: `KNJ-N5-0042`     │
                             │  Glyph: 「店」         │
                             └───────────┬────────────┘
                                         │ Constituent Root (1:N)
                                         ▼
┌────────────────────────┐   Constituent ┌────────────────────────┐   Grammatical Collocation ┌────────────────────────┐
│   AUDIO & ACOUSTIC     │◄──────────────┤   VOCABULARY ENTITY    ├──────────────────────────►│    GRAMMAR PATTERN     │
│   ID: `AUD-VOC-0184`   │   Waveform    │   ID: `VOC-N5-0184`    │      Spatial Frame        │   ID: `GMR-N5-0012`    │
│   File: `kissaten.flac`│   Metadata    │   Lexeme: 「喫茶店」   │   「喫茶店 [で] 飲む」    │   Pattern: 「〜で」   │
│   Pitch: Heiban [0]    │               │   Meaning: Retro Cafe  │   「喫茶店 [に] 入る」    │   Rule: Venue of Action│
└────────────────────────┘               └───────────┬────────────┘                           └───────────┬────────────┘
                                                     │ Referenced in (1:N)                                │
                                                     ▼                                                    │
                                         ┌────────────────────────┐                                       │
                                         │    SENTENCE ENTITY     │◄──────────────────────────────────────┘
                                         │   ID: `SNT-N5-0492`    │
                                         │   「静かな喫茶店で本を │
                                         │     読むのが好きです」 │
                                         └───────────┬────────────┘
                                                     │ Assembled into
                                                     ▼
                                         ┌────────────────────────┐
                                         │   LEARNING ACTIVITY    │
                                         │   ID: `ACT-L3.2-STG3`  │
                                         │   Interactive Syntax   │
                                         │   Slot-Drag Assembly   │
                                         └────────────────────────┘
```

### 1.1 Standardized Entity Schemas

#### A. VOCABULARY Schema (`VOC-[LEVEL]-[ID]`)
```yaml
id: "VOC-N5-0184"
canonical_japanese: "喫茶店"
kana_reading: "きっさてん"
romaji: "kissaten"
pitch_accent:
  pattern: "Atamadaka [1] / Heiban [0] variant"
  downstep_mora: 1
  contour_svg_ref: "SVG-PITCH-0184"
lexical_class: "Noun (名詞)"
jlpt_level: "N5"
frequency_tier: "A (Top 500 Core)"
semantic_domains: ["Daily Life", "Dining & Food", "Urban Spaces"]
definitions:
  en: "Traditional Japanese tearoom / retro cafe"
  vi: "Quán cà phê / phòng trà truyền thống phong cách hoài cổ"
  fr: "Salon de thé traditionnel / café rétro"
kanji_breakdown:
  - kanji_id: "KNJ-N3-0102" # 喫 (consume/smoke)
  - kanji_id: "KNJ-N5-0028" # 茶 (tea)
  - kanji_id: "KNJ-N5-0042" # 店 (shop/store)
syntactic_collocations:
  - grammar_id: "GMR-N5-0012" # で (action venue)
    phrase: "喫茶店でコーヒーを飲む"
    translation_en: "To drink coffee at a retro cafe"
  - grammar_id: "GMR-N5-0008" # に (arrival destination)
    phrase: "喫茶店に入る"
    translation_en: "To enter a retro cafe"
audio_asset:
  studio_id: "AUD-TOKYO-F04-0184"
  speaker: "Native Tokyo Female Artist (Age 28)"
  format: "24-bit 48kHz FLAC / WebM compressed"
review_status: "VERIFIED_GOLD_STANDARD"
```

#### B. KANJI Schema (`KNJ-[LEVEL]-[ID]`)
```yaml
id: "KNJ-N5-0042"
glyph: "店"
stroke_count: 8
radical:
  radical_glyph: "广"
  radical_name_jp: "まだれ (Madare)"
  meaning: "Slanting roof / cliff shelter"
readings:
  onyomi: ["テン (ten)"]
  kunyomi: ["みせ (mise)"]
stroke_order:
  animated_svg: "SVG-STROKE-0042"
  key_points:
    - stroke_1: "Top dot on centerline"
    - stroke_2: "Horizontal overhang"
    - stroke_3: "Left sweeping diagonal"
    - stroke_4_8: "Inner enclosure: 占 (fortune/occupy)"
mnemonics:
  kaisho_story: "A shelter (广) where someone occupies (占) space to sell goods: a shop (店)."
jlpt_level: "N5"
joyo_grade: 2
compounds:
  - vocab_id: "VOC-N5-0042" # 店 (mise - store)
  - vocab_id: "VOC-N5-0184" # 喫茶店 (kissaten - cafe)
  - vocab_id: "VOC-N5-0219" # 店員 (ten'in - clerk)
review_status: "VERIFIED_GOLD_STANDARD"
```

#### C. GRAMMAR PATTERN Schema (`GMR-[LEVEL]-[ID]`)
```yaml
id: "GMR-N5-0012"
pattern: "Noun (Place) + で"
name_jp: "動作の場所 (Venue of Intentional Action)"
jlpt_level: "N5"
formation_rules:
  - slot_1: "Noun [Physical Location / Venue]"
  - slot_2: "Particle: で (de)"
  - slot_3: "Action Verb (飲む, 食べる, 勉強する, 買う)"
semantic_nuance: |
  Marks the bounded arena or perimeter within which an intentional, dynamic event transpires.
  CONTRAST RULE:
  Must NOT be confused with に (static presence with います/あります, or terminal landing point with 行く/来る/入る).
common_traps:
  - error_form: "学校に行って勉強します。" (Unnatural redundant chain)
    remediation: "学校で勉強します。" (Clean action venue)
  - error_form: "新宿駅に乗ります。" (Boarding destination error)
    remediation: "新宿駅で乗ります。" (If boarding transpires at Shinjuku station perimeter)
mastery_drills:
  - activity_id: "ACT-L3.2-STG3"
  - activity_id: "ACT-GMR-CONTRAST-02"
review_status: "VERIFIED_GOLD_STANDARD"
```

---

## 2. Nine-Stage Content Creation & QA Pipeline

To ensure zero linguistic hallucination, all KOTO curricular data must pass through a strict, multi-stage gatekeeping process before reaching end-user devices:

```
[ 1. Curriculum Planning ] ──► [ 2. Drafting & Synthesis ] ──► [ 3. Morpho-Tokenizer Validation ]
  - CEFR/JLPT Syllabus Match     - Verified Human Author        - MeCab / Kuromoji Tokenizer
  - Pragmatic Goal Definition    - or AI Sandboxed Drafter      - Furigana & Mora Count Check
                                                                             │
                                                                             ▼
[ 6. Native Studio Audio ] ◄── [ 5. Pedagogical QA Gate ]  ◄── [ 4. Native Linguistic Audit ]
  - Tokyo Accent Recording       - Distractor Plausibility      - Sociolinguistic Humility
  - Pitch Curve Verification     - Cognitive Load & Flow        - Register & Keigo Nuance
         │
         ▼
[ 7. Knowledge Graph Ingestion ] ──► [ 8. Production Canary ] ──► [ 9. Telemetry & Continuous Rev ]
  - Relational Foreign Keys           - 5% Staging Cohort           - Item Discriminability Index
  - Tri-Directional Mappings          - Zero Client Exceptions      - Spaced Decay Recalibration
```

### Gate Classification Table:
| Gate | Verification Target | Threshold Requirement | Rejection Protocol |
| :--- | :--- | :--- | :--- |
| **G1: Orthography & Reading** | Kanji Joyo status, Kun/On readings, Furigana accuracy. | 100% Deterministic match with Daijisen / Kōjien. | Hard rejection back to authoring. |
| **G2: Syntactic Integrity** | Particle governance, predicate inflection, copula agreement. | Zero ungrammatical collocations. | Rerouted to Chief Linguist. |
| **G3: Sociolinguistic Register** | Appropriate politeness level (Teineigo / Sonkeigo / Kenjougo). | Level N5 must strictly adhere to desu/masu baseline without premature slang. | Tagged for register adjustment. |
| **G4: Acoustic Prosody** | Pitch accent contour (Heiban, Atamadaka, Nakadaka, Odaka). | Native speaker audio verification + waveform frequency validation. | Audio re-recording scheduled. |
| **G5: Distractor Plausibility** | Multiple-choice quiz alternatives in JLPT simulations. | Distractors must represent real cognitive traps, not absurd non-words. | Pedagogical review reject. |

---

## 3. Scalable Content Governance & Trust Tiering

KOTO strictly segregates learning content into four explicit trust states to prevent AI unreliability:

1. **Tier 1 — `GOLD_CURATED` (100% Production Ready)**:
   - Authored and double-blind audited by certified JLPT Japanese language educators.
   - Used for all core N5 curriculum units, canonical grammar rules, and official mock exams.
2. **Tier 2 — `AI_SOCIOCRATIC_SCAFFOLDED` (Supervised Production)**:
   - Generated dynamically by sandboxed LLM engines following deterministic grammar templates (e.g., custom sentence explanations for user mistakes).
   - Constrained by Retrieval-Augmented Generation (RAG) querying only verified Tier 1 records.
3. **Tier 3 — `INCUBATING_DRAFT` (Internal Staging Only)**:
   - New N4–N1 modules undergoing linguistic check or audio studio cueing. Inaccessible to public learners.
4. **Tier 4 — `RETIRED_ARCHIVE`**:
   - Outdated questions or ambiguous phrases flagged by learner cognitive latency telemetry.

---

## 4. Complete N5 Pilot Dataset: Unit 01 (はじめまして)

To prove relational knowledge graph reusability, Unit 01 anchors all learning around Japanese self-introduction, personal identity, and core copula syntax without duplicating lexical entries.

### Relational Entity Graph:
```
[Unit 01: はじめまして — First Meetings & Identity]
 ├── Core Vocabulary:
 │    ├── 「私」(わたし - VOC-N5-0001) ──► Kanji: 「私」(KNJ-N5-0012)
 │    ├── 「学生」(がくせい - VOC-N5-0005) ──► Kanji: 「学」(KNJ-N5-0008), 「生」(KNJ-N5-0009)
 │    ├── 「先生」(せんせい - VOC-N5-0006) ──► Kanji: 「先」(KNJ-N5-0007), 「生」(KNJ-N5-0009)
 │    ├── 「日本」(にほん - VOC-N5-0014) ──► Kanji: 「日」(KNJ-N5-0001), 「本」(KNJ-N5-0002)
 │    └── 「〜人」(じん - VOC-N5-0015) ──► Kanji: 「人」(KNJ-N5-0003)
 ├── Core Grammar Patterns:
 │    ├── 「[Noun A] は [Noun B] です」(Topic & Identity Copula - GMR-N5-0001)
 │    ├── 「[Noun A] は [Noun B] ではありません」(Polite Negative Copula - GMR-N5-0002)
 │    └── 「[Noun A] の [Noun B]」(Genitive / Entity Linkage - GMR-N5-0003)
 └── Integrated Practice Scenarios:
      ├── Lesson 1.1: The Identity Copula (Concept → Syntax Slot-Drag)
      ├── Lesson 1.2: Country & Nationality (`ベトナム人`, `日本人`)
      ├── Lesson 1.3: University Affiliation (`ベトナム人の学生`)
      └── Milestone Dialogue: First Meeting with Tanaka Sensei at Tokyo Academy
```

---

## 5. Automated Content Scalability Matrix (N5 → N1 Scale)

The KOTO Content Architecture scales systematically without code refactoring or schema alterations:

| Proficiency Level | Target Vocabulary Entities | Target Kanji Entities | Target Grammar Patterns | Native Audio Exemplars | Dialogue Scenario Sets |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **JLPT N5 (MVP Core)** | 700 entities | 103 characters | 34 patterns | 2,100 studio clips | 12 interactive scenarios |
| **JLPT N4 (Elementary)** | 1,500 entities | 181 characters | 78 patterns | 4,500 studio clips | 24 interactive scenarios |
| **JLPT N3 (Intermediate)**| 3,750 entities | 361 characters | 142 patterns | 9,800 studio clips | 40 interactive scenarios |
| **JLPT N2 (Advanced)** | 6,000 entities | 415 characters | 210 patterns | 16,000 studio clips | 60 interactive scenarios |
| **JLPT N1 (Mastery)** | 10,000+ entities | 1,076 characters | 320 patterns | 28,000 studio clips | 90 interactive scenarios |
| **TOTAL ECOSYSTEM** | **21,950+ Lexical Nodes**| **2,136 Jōyō Kanji**| **784 Grammar Nodes** | **60,400+ Lossless Audios** | **226 Scenarios** |

---

## 6. Curricular Acceptance & Quality Verification Checklist

Before any curriculum module is flagged `PUBLISHED`:
1. **Zero Isolated Nodes**: Every vocabulary item must be referenced by at least 1 lesson, 1 kanji root breakdown, and 1 grammar collocation.
2. **Deterministic Furigana Mapping**: 100% of Kanji words possess precise ruby markup with verified kana readings.
3. **Audio-Orthography Parity**: Every native audio recording has been verified by waveform mora timing against the written transcript.
4. **Dual-Language Semantic Accuracy**: English, Vietnamese, and French glosses have been reviewed by native educators in each respective target language.

**Governance Verdict**: The KOTO Japanese Content Engine establishes an uncompromised gold standard for academic integrity, cognitive reusability, and production-grade scalability.
