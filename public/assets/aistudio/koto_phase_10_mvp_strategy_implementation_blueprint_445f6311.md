# KOTO (言登) — Phase 10: MVP Product Strategy & Implementation Blueprint

**Authors**: Principal Product Manager, EdTech Product Architect, Technical Product Strategist, Principal UX Architect & MVP Planning Specialist  
**Product**: KOTO Japanese Learning Ecosystem (JLPT N5 → N1 Scale)  
**Status**: APPROVED & CODIFIED INTO PRODUCTION LAUNCH ROADMAP  

---

## Executive Summary & Strategic Charter

KOTO represents an academically rigorous, aesthetically refined Japanese language academy built on the design ethos of **Japanese Editorial Minimalism**. Following the Phase 09 UX Audit & Design Governance baseline, Phase 10 transitions KOTO from a high-fidelity architectural prototype into an **implementation-ready, commercially viable Minimum Viable Product (MVP)**.

The objective of the KOTO MVP is not to build a superficial all-in-one clone of existing apps, nor to immediately support all levels (N5 through N1). **The objective is to deliver the smallest complete, high-quality learning system that demonstrably validates KOTO's core pedagogical loop and retention model for N5 learners.**

---

## 1. Product Definition & Value Proposition

### 1.1 Core Foundations
- **Primary User**: Serious Japanese self-learners (collegiate students, digital professionals, expats, and JLPT candidates) who are dissatisfied with gamified, cartoonish flashcard apps and overwhelmed by unorganized traditional textbooks.
- **Primary Problem**: Fragmented learning workflows. Learners currently toggle between Anki (SRS), Genki/Tae Kim (grammar textbooks), Wanikani (kanji mnemonics), YouTube (listening), and ChatGPT (unstructured Q&A), leading to cognitive fatigue, high drop-off rates, and zero pedagogical continuity.
- **Product Solution**: An integrated Japanese learning intelligence platform connecting **Curriculum → Orthography (Kanji) → Lexicon (Vocab) → Morpho-Syntax (Grammar) → Shadowing (Listening) → Socratic Practice (AI) → Spaced Repetition (SRS)** within a unified editorial environment.
- **Core Differentiation**:
  1. *Academically Grounded Editorial UX*: Zero juvenile gamification, distraction-free typography, and authentic cultural context.
  2. *Tri-Directional Knowledge Graph*: Every vocabulary word connects directly to its constituent Kanji roots, spatial grammatical collocations, and acoustic pitch accent.
  3. *Pedagogical Socratic Scaffolding*: Active cognitive assembly and distractor disambiguation rather than rote binary swiping.

### 1.2 North Star Metric & Key Performance Indicators (KPIs)

```
                            [ NORTH STAR METRIC ]
                 Weekly Meaningful Learning Mastery (WMLM)
     The number of active learners who complete ≥ 3 interactive lessons, 
        maintain ≥ 85% SRS retention stability, and complete ≥ 1 active 
                  syntactic production challenge each week.
```

#### Supporting Metric Framework:
| Metric Category | Metric Name | Target Benchmark (MVP) | Pedagogical Rationale |
| :--- | :--- | :--- | :--- |
| **Learning Outcome** | 30-Day Ebbinghaus Retention Stability | ≥ 88% | Measures true neurological retention vs. short-term recognition. |
| **Learning Outcome** | Particle Discrimination Accuracy | ≥ 80% (N5 benchmark) | Validates mastery over the single greatest barrier in early Japanese (`に` vs `で` vs `を`). |
| **Product Engagement** | 7-Day & 28-Day Cohort Retention | 55% (D7) / 38% (D28) | Outperforms standard EdTech industry benchmarks (D28 avg: 15–20%). |
| **Friction & Usability** | First-Time Lesson Completion Rate | ≥ 92% | Ensures onboarding scaffolding eliminates cognitive dead-ends. |
| **Curricular Velocity** | N5 Syllabus Progression Speed | 1 Unit per 10–14 days | Realistic, sustainable mastery cadence (Total N5: ~60–75 hours). |

---

## 2. MVP Scope & MoSCoW Prioritization Matrix

To ensure execution speed, zero technical debt, and maximum pedagogical integrity, features are strictly classified across four tiers:

| Tier | Module / Capability | Functional Scope | Technical Complexity | MVP Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **MUST HAVE (P0)** | **Unified Application Shell** | Desktop & responsive layout, global persistent navigation, JLPT level indicator, Learner vitals ticker. | Low | Foundational architecture for navigation and visual continuity. |
| **MUST HAVE (P0)** | **N5 Curricular Engine** | Complete 6-Unit N5 syllabus (Units 01–06), 36 structured lessons, milestone unlocks. | Medium | The pedagogical spine of the MVP. |
| **MUST HAVE (P0)** | **Interactive Lesson Player** | 7-stage lesson cycle: Concept Intro → Word/Kanji Anatomy → Syntactic Assembly → Audio/Pitch → Production Quiz. | High | Delivers the core active learning loop. |
| **MUST HAVE (P0)** | **Unified SRS Review Queue** | FSRS-based or SuperMemo-2 algorithm scheduling Kanji, Vocab, and Grammar in a single queue. | Medium | Ensures long-term retention and daily return habits. |
| **MUST HAVE (P0)** | **Foundational Pillars** | Dedicated Vocabulary Lab (N5 700 words), Kanji Studio (N5 103 kanji), and Grammar Studio (N5 34 patterns). | Medium | Provides depth and reference lookups outside sequential lessons. |
| **SHOULD HAVE (P1)**| **High-Fidelity Native Audio** | Native Tokyo speech recordings for all core vocabulary and exemplar dialogue sentences. | Medium | Acoustic accuracy is vital; prevents mispronunciation and pitch errors. |
| **SHOULD HAVE (P1)**| **Furigana Scaffolding Toggle** | Global & item-level Ruby text toggle (`ON/OFF/Hover`), Romaji emergency crutch. | Low | Empowers progressive independence from phonetic aids. |
| **SHOULD HAVE (P1)**| **Today's Structured Study Plan** | Dynamic 3-task daily queue on Dashboard (e.g., 1 Review + 1 New Lesson + 1 Speed Sprint). | Low-Medium | Eliminates decision paralysis upon app launch. |
| **COULD HAVE (P2)** | **AI Sensei Socratic Explanations** | Fallback LLM-powered "Explain Why" button for exercise mistakes and nuanced questions. | High | High educational value, but core learning must function without AI uptime. |
| **COULD HAVE (P2)** | **Sectional Speed Sprints** | 15-minute, 20-item rapid-fire recall drills with countdown timers. | Medium | Prepares learners for JLPT pacing and automatic retrieval. |
| **LATER (P3 / Post-MVP)**| **Full N4–N1 Curricula** | Progressive expansion to intermediate and advanced levels. | High | Phased rollout post-N5 MVP validation. |
| **LATER (P3 / Post-MVP)**| **Live Voice Roleplay & Speech Recognition** | Real-time conversational dialogue with AI Sensei and acoustic mora verification. | Very High | High latency/cost; reserved for Phase E & G. |
| **LATER (P3 / Post-MVP)**| **Full Standardized 105-min Mock Exam** | Automated full-length exam simulations with certified score generation. | High | Post-MVP exam season feature. |

---

## 3. Product Roadmap (Phases A → G)

```
[Phase A: Foundations] ──► [Phase B: N5 Learning Core] ──► [Phase C: Retention Engine]
     (Weeks 1-3)                     (Weeks 4-7)                      (Weeks 8-9)
                                                                           │
                                                                           ▼
[Phase F: Exam Arena]  ◄── [Phase E: Intelligence]    ◄── [Phase D: Skill Labs]
    (Weeks 14-16)                   (Weeks 12-13)                    (Weeks 10-11)
         │
         ▼
[Phase G: Scaling N4-N1] (Post-MVP Launch)
```

### Detailed Phase Milestones:
- **Phase A — System Foundations (Weeks 1–3)**: Codify design system tokens, implement responsive app shell, user auth/profile schema, and database relational models.
- **Phase B — N5 Learning Core (Weeks 4–7)**: Author and ingest 6 Units of N5 curriculum, build 7-stage interactive lesson engine, assemble Kanji/Vocab/Grammar inspection panels.
- **Phase C — Retention & Review Engine (Weeks 8–9)**: Implement Spaced Repetition System (SRS) algorithm, 4-state rating UI (`Again`, `Hard`, `Good`, `Easy`), and daily study planner.
- **Phase D — Integrated Skill Development (Weeks 10–11)**: Deploy native audio player, blind listening immersion mode, pitch accent visualizer, and stroke order kinetic canvas.
- **Phase E — Contextual AI Scaffolding (Weeks 12–13)**: Integrate sandboxed AI diagnostic engine for real-time sentence breakdown and mistake "Why" explanations.
- **Phase F — MVP JLPT Readiness Check (Weeks 14–16)**: Deploy diagnostic readiness telemetry, sectional sprint tests, and full end-to-end beta user onboarding.
- **Phase G — Scaling & Expansion (Post-Launch)**: N4 curriculum rollout, advanced conversational roleplay, and community Keigo workshops.

---

## 4. End-to-End MVP User Journeys

### Journey 1: The New Learner Onboarding Flow (First 15 Minutes)
```
Landing Page
   │  ("Master Japanese through Editorial Craft & Cognitive Science")
   ▼
Account Creation & Goal Selection
   │  (Goal: Pass JLPT N5 / Target Date: July Intake / Daily Commitment: 20 min)
   ▼
Diagnostic Baseline Check (Optional 3-min calibration or Start at Zero)
   ▼
Orientation to the Learning Path
   │  (Reveals Unit 01: はじめまして — Introduces Hiragana/Katakana + Core Particles)
   ▼
Launch First Interactive Lesson (Lesson 1.1: The Identity Copula だ / です)
   │  (7-stage flow: Concept → Vocabulary → Syntactic Assembly → Audio → Check)
   ▼
Celebration & Immediate SRS Queue Population (+5 words, +1 grammar pattern)
   ▼
First Day Hanko Seal of Completion (習得)
```

### Journey 2: The Returning Daily Active Learner Flow (Daily 25-Minute Loop)
```
Dashboard Command Center
   │  (Vitals: 18-day streak 🔥 / 14 SRS items due ⏰ / Daily Goal: 25m)
   ▼
Zero-Decision Primary CTA: "Launch Daily Study Plan"
   ├── Step 1: SRS Morning Clearance (14 cards: 6 Vocab, 5 Kanji, 3 Grammar — 7 mins)
   ├── Step 2: Primary Lesson Continuity (Continue Unit 03 Lesson 3.2: に vs で — 13 mins)
   └── Step 3: Targeted Acoustic Sprint (Shadowing 3 audio sentences — 5 mins)
   ▼
Automated Analytics Sync & Retention Stability Update (+0.4% stability)
   ▼
Summary & Logout with Clear Next-Day Prescription
```

---

## 5. Scalable Content Architecture & Data Model

To prevent redundant, siloed content and ensure high maintainability, KOTO adopts a **relational graph content architecture**. An individual vocabulary item exists as a single canonical record and is referenced dynamically across lessons, kanji breakdowns, grammar collocations, and SRS reviews.

```
                    ┌─────────────────────────┐
                    │       JLPT LEVEL        │
                    │         (e.g., N5)      │
                    └────────────┬────────────┘
                                 │ 1:N
                    ┌────────────▼────────────┐
                    │         COURSE          │
                    │   (Comprehensive N5)    │
                    └────────────┬────────────┘
                                 │ 1:N
                    ┌────────────▼────────────┐
                    │          UNIT           │
                    │ (Unit 03: 日々の行動)   │
                    └────────────┬────────────┘
                                 │ 1:N
                    ┌────────────▼────────────┐
                    │         LESSON          │
                    │  (Lesson 3.2: に vs で) │
                    └────────────┬────────────┘
                                 │ 1:N
                    ┌────────────▼────────────┐
                    │     LEARNING STAGE      │
                    │  (Stage 3: Assembly)    │
                    └────────────┬────────────┘
                                 │ References
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ KANJI ENTITY    │     │ VOCABULARY ITEM │     │ GRAMMAR PATTERN │
│ e.g., 「店」    │◄────┤ e.g., 「喫茶店」│────►│ e.g., 「〜で」  │
│ Onyomi/Kunyomi  │     │ Pitch Accent    │     │ Syntactic Rule  │
│ Radical/Strokes │     │ Native Audio    │     │ Collocations    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 6. Technology-Neutral System Architecture

The technical stack is engineered around four core decoupled subsystems:

```
[ Client Application Layer ]
  - Responsive Web Client (Desktop-First, Tablet/Mobile Adaptive)
  - State Management: Local offline cache (IndexedDB) for seamless SRS review offline
  - Audio Engine: Web Audio API with pitch accent waveform visualizer

[ Application & API Gateway ]
  - REST / GraphQL Endpoint routing
  - Authentication & Session Governance (OAuth2 / Passkeys)
  - Rate limiting & edge caching

[ Core Domain Services ]
  ├── 1. Curriculum & Content Service (Headless CMS for structured lessons)
  ├── 2. SRS & Retention Engine (FSRS scheduling algorithm calculation)
  ├── 3. User Progress & Analytics Service (Telemetry, streaks, and cognitive latencies)
  └── 4. AI Gateway & Safety Sandboxing (Structured prompt orchestrator with fallback)

[ Persistence Layer ]
  ├── Relational DB (PostgreSQL): User profiles, relational curriculum, lesson progress
  ├── Graph / Document Store: Lexical knowledge graph & collocation mappings
  └── Object Storage (CDN): Lossless native audio FLAC/MP3 files, stroke SVG animations
```

---

## 7. AI Implementation Strategy & Architectural Guardrails

To prevent pedagogical hallucination and guarantee uncompromised system stability, AI is integrated strictly as an **asynchronous cognitive accelerator**, never as an unconstrained, unpredictable chatbot.

| AI Capability | Implementation Pattern | Safety & Fallback Mechanism | API Cost Profile |
| :--- | :--- | :--- | :--- |
| **Stage 1: Contextual Explanations** | Pre-templated Socratic prompts querying isolated grammar rules and user input diffs. | If AI fails/times out, display human-curated editorial textbook note from database. | Low (Triggered on demand) |
| **Stage 2: Live Morphological Tokenizer** | Deterministic tokenization engine (e.g., Kuromoji/MeCab) paired with LLM for nuance synthesis. | Grammatical parts of speech are verified by deterministic rules before displaying to learner. | Very Low |
| **Stage 3: Socratic Dialogue Roleplay** | Constrained scenario state machines (e.g., *Kissaten Rengetsu* with fixed communicative goals). | Strict system prompts preventing off-topic drift; fallback to scripted dialogue branches. | Moderate (Capped per day) |

---

## 8. Prioritized Implementation Backlog (Sprint Planning)

```
[EPIC 01: CORE ARCHITECTURE & SHELL]
├── P0-01: Implement canonical 3-tier desktop sidebar and responsive app header.
├── P0-02: Integrate Japanese Editorial Minimalist design tokens and typography engine.
└── P0-03: Implement user authentication and persistent progress state store.

[EPIC 02: CURRICULUM & LESSON ENGINE]
├── P0-04: Author and structure complete Unit 01 through Unit 06 N5 curriculum modules.
├── P0-05: Build 7-stage interactive lesson player with token slot-drag and ruby text.
└── P0-06: Implement active distractor quiz engine with instant cognitive feedback.

[EPIC 03: SPACED REPETITION RETENTION SYSTEM]
├── P0-07: Integrate FSRS algorithm for unified Kanji, Vocab, and Grammar review items.
├── P0-08: Build 4-state review card interface with keyboard accelerators (`1-4`, `Space`).
└── P0-09: Implement daily study plan queue generator on Dashboard.

[EPIC 04: CORE LEARNING PILLARS]
├── P1-01: Build Vocabulary Lab lexical graph browser with pitch accent curves.
├── P1-02: Implement Kanji Intelligence Studio with animated stroke order canvas.
└── P1-03: Deploy Grammar Studio side-by-side particle disambiguation view.

[EPIC 05: QUALITY ASSURANCE & TELEMETRY]
├── P1-04: Audit and verify WCAG 2.1 AA dual-coding compliance across all components.
└── P1-05: Wire longitudinal retention velocity curves and JLPT readiness projection.
```

---

## 9. Comprehensive Risk Assessment & Mitigation Strategies

| Risk Factor | Severity | Probability | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Curricular Inaccuracy or Erroneous Japanese** | High | Low | All N5/N4 pedagogical content must be authored and reviewed by certified Japanese language educators (JLPT specialists) prior to CMS ingestion. |
| **AI Linguistic Hallucination** | High | Medium | Never allow generative models to invent grammar rules freely; ground all AI queries in verified pedagogical knowledge bases via Retrieval-Augmented Generation (RAG). |
| **Cognitive Fatigue & Early Dropout** | Medium | Medium | Strict adherence to the Single-Primary-CTA rule; cap daily active study plans to 20–30 minutes with clear milestone completions. |
| **Audio Asset Licensing & Quality Drift** | Medium | Low | Record in-house native Tokyo voice artists for all primary lexical assets; avoid synthetic text-to-speech for core pedagogical exemplars. |
| **Over-reliance on Gamification** | High | Low | Enforce KOTO's core design principle: reward learners through authentic mastery, deep understanding, and elegant Hanko seals, not cartoon confetti or casino mechanics. |

---

## 10. MVP Launch Acceptance Criteria & Readiness Verdict

Before KOTO MVP is approved for public beta deployment, the following empirical conditions must be verified:

1. **End-to-End Pedagogical Loop**: A newly registered user can complete onboarding, study Unit 01, complete Lesson 3.2, review items in the SRS queue, and observe accurate updates in their analytics dashboard without encountering any dead-end states.
2. **Design System & Visual Consistency**: 100% adherence to the Japanese Editorial Minimalism token baseline; zero arbitrary hex values or unaligned borders across all active screens.
3. **Accessibility Verification**: Full WCAG 2.1 AA compliance verified across color contrast (minimum 4.5:1), keyboard navigability (`Tab`, `Space`, `⌘K`), and dual-coded status indicators.
4. **Data Integrity & Offline Resilience**: In-flight lesson progress and SRS review evaluations are persisted locally and synchronized seamlessly to the cloud database upon connection.

**Readiness Verdict**: The KOTO Japanese Learning Ecosystem is architecturally complete, pedagogically sound, and primed for execution. The blueprint is approved for implementation.
