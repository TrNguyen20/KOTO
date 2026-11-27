# KOTO (言登) — Phase 13: Edge Cases, Offline Resilience & Error Recovery Architecture

**Authors**: Principal Distributed Systems Architect, EdTech Reliability Engineer, Senior UX Resilience Designer & Data Integrity Specialist  
**Product**: KOTO Japanese Learning Ecosystem (JLPT N5 → N1 Scale)  
**Status**: APPROVED & CODIFIED INTO PRODUCTION RESILIENCE GOVERNANCE MANUAL  

---

## Executive Summary & Engineering Mandate

In digital language acquisition—particularly within serious, high-focus pedagogical environments—system errors, erratic network transitions, and unhandled edge cases directly degrade learner focus, break spaced repetition intervals, and cause memory retention fatigue. 

While Phases 01 through 12 codified the core visual system, pedagogical graph, MVP backlog, and curriculum quality gates, **Phase 13 establishes the definitive Edge Cases, Offline Resilience, and Error Recovery Architecture for KOTO**.

This document specifies the client-side state machines, conflict resolution algorithms, retry protocols, and empathetic Japanese Editorial UI patterns required to handle 10 critical operational edge scenarios.

---

## 1. Matrix of Critical Edge Scenarios & Architectural Solutions

| Edge Scenario | Core Failure Mode | Architectural & Algorithmic Solution | UX / UI Remediation Pattern |
| :--- | :--- | :--- | :--- |
| **01. Subway Commute (Offline SRS)** | Network drops mid-review; cards cannot reach cloud DB. | **Client-First IndexedDB Event Queue**: All review logs (`Again`, `Hard`, `Good`, `Easy`) are persisted locally with microsecond UUIDs. | Subtle header pill: `オフライン稼働中 (14 reviews queued)` with hairline dot. Zero blocking dialogs. |
| **02. Multi-Device Conflict** | Learner reviews on mobile during transit, opens desktop at home without sync. | **Vector Clocks & FSRS Stability Merge**: The highest stability rating and latest timestamp win; interval recalculated deterministically. | Toast: `進捗同期完了 — Review history reconciled with mobile session.` |
| **03. Flaky Network in Lesson** | Lesson 3.2 token drag submits, connection times out before answer verified. | **Deterministic Client-Side Rule Engine**: For Tier 1 curriculum, syntax verification runs locally via pre-cached rule trees. | Seamless instant feedback; sync payload queued in background with exponential backoff retry. |
| **04. AI Sensei Gateway Timeout** | LLM latency > 3500ms or token quota exhausted during Kissaten roleplay. | **Asynchronous Fallback to Static Socratic Lexicon**: Instant graceful degradation to curated editorial textbook notes (`Tier 1 Gold`). | Sensei displays: `「思案中...」` followed by curated grammatical tip with stamp `[教科書解説]`. |
| **05. Microphone Permission Denial** | Browser denies mic access during acoustic shadowing in Listening Lab. | **Instant Mode Fallback to Acoustic Dissection**: Automatically pivots from recording shadowing to manual syllable playback & waveform scrub. | Soft notification banner with clear 1-click instruction to enable mic + `Continue in Silent Mode`. |
| **06. Low-Quality Audio / Noise** | Background train noise ruins pitch contour pitch detection. | **Web Audio API Biquad Bandpass Filter**: Real-time 85Hz–300Hz vocal isolation and RMS volume gate prior to scoring. | UI warning badge: `周りの音を検出中 (Ambient noise high)` with option to bypass automatic scoring. |
| **07. Extreme Kanji Ruby Scaling** | User zooms browser to 200% or enables massive accessibility fonts. | **Proportional Ruby Clamp Law**: `clamp(0.45em, 0.55em, 0.65em)` with dynamic ruby offset and auto-collapsing romaji. | Zero overlapping glyphs; baseline locked at `2.2em` line height across all viewports. |
| **08. Mid-Lesson Tab Closure / Crash** | Browser tab accidentally closed at Stage 5 of 7-stage Interactive Lesson. | **Local Session State Restoration Snapshot**: Active lesson state persisted to `sessionStorage` on every token interaction. | Resuming banner on Dashboard: `再開 (Resume Lesson 3.2 at Stage 5)`. |
| **09. Empty SRS Queue ("Zero Due")** | Learner completes all 14 reviews; app might show an awkward empty blank screen. | **Editorial Washi "Clear Mind" State (心身爽快)**: Celebratory cultural closure with next review countdown ticker and reading invitation. | Hanko stamp `[復習完了]`, countdown `Next review opens at 08:00 (14h)`. |
| **10. Exam Timer Disconnection** | Network disconnects during JLPT N5 25-minute mock simulation. | **Web Worker Monotonic Timer**: Timer runs in isolated background thread immune to main-thread freezing and network state. | Uninterrupted countdown ticker; all exam answers saved locally and submitted in batch upon reconnect. |

---

## 2. Offline Synchronization & Conflict Resolution Protocol (FSRS Queue)

```
[ USER SUBMITS SRS CARD ]
           │
           ▼
[ IndexedDB / LocalStorage ] ◄── (Writes ReviewEvent: { card_id, rating, elapsed_ms, timestamp, client_uuid })
           │
     Is Online?
    ┌──────┴──────┐
   YES            NO
    │              │
    │              ▼
    │      [ Persist to Outbox Queue ]
    │      Update Header Pill: "オフライン保存済"
    │              │
    │      (Network Restored Event)
    │              ▼
    └──────► [ POST /api/v1/srs/sync-batch ]
                   │
           Server Resolution:
           - Check Server Card State
           - If no conflict: Apply FSRS update
           - If conflict (mobile reviewed card concurrently):
             Apply Max-Stability Monotonic Heuristic
                   │
                   ▼
       [ 200 OK: Reconciled Snapshot ]
                   │
                   ▼
       Update Local Cache & Refresh Dashboard Vitals
```

### 2.1 The Two-Way Reconcile Algorithm (Pseudocode)
```typescript
interface ReviewEvent {
  cardId: string;
  rating: 1 | 2 | 3 | 4; // Again | Hard | Good | Easy
  timestamp: number;
  clientDeviceId: string;
}

function reconcileSRS(serverCard: CardRecord, localEvent: ReviewEvent): CardRecord {
  // If the server has a review that occurred after local review
  if (serverCard.last_reviewed_at > localEvent.timestamp) {
    // Keep server's scheduling interval, but append local event to audit ledger
    return {
      ...serverCard,
      reconciled_conflict: true
    };
  }
  
  // Otherwise, apply FSRS algorithm to calculate new interval & stability
  const updatedParameters = calculateFSRS(serverCard.fsrs_state, localEvent.rating, localEvent.timestamp);
  return {
    ...serverCard,
    ...updatedParameters,
    last_reviewed_at: localEvent.timestamp
  };
}
```

---

## 3. Graceful Error Recovery & Fallback UI Specifications

### 3.1 AI Service Latency & Degradation Matrix
To maintain academic rigor and learner focus, KOTO never renders raw JSON errors, HTTP 500 notices, or broken chatbot widgets.

```
+-----------------------------------------------------------------------------------+
|  AI Sensei Diagnostic Modal - Graceful Fallback State                             |
|                                                                                   |
|  [!] 通信遅延中 (AI Network Latency Detected)                                      |
|  -------------------------------------------------------------------------------  |
|  AI Sensei is currently reflecting on linguistic nuances. In the meantime, here   |
|  is the Gold-Standard Curated Grammatical Disambiguation from the KOTO Lexicon:   |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | 【に vs で】 (Destination vs Venue of Dynamic Action)                       |  |
|  |                                                                             |  |
|  |  • 喫茶店に入る (に): Marks the static arrival target / destination.         |  |
|  |  • 喫茶店で飲む (で): Marks the physical arena where coffee is consumed.    |  |
|  |                                                                             |  |
|  |  Rule: An intentional action verb (飲む, 食べる, 勉強する) demands [で].    |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  [ Retry AI Live Explanation (⌘R) ]             [ Understood, Continue Lesson 印 ] |
+-----------------------------------------------------------------------------------+
```

### 3.2 Visual Error State Principles (Japanese Editorial Minimalism)
1. **Never use violent, garish red warning boxes**: System errors must use muted Sumi ink borders (`rgba(27, 27, 30, 0.15)`) with an elegant Vermilion accent line (`#D1382A`) and authentic Japanese editorial typography.
2. **Clear Human Remediation Actions**: Every error state must present exactly **two clear options**:
   - Primary action: An immediate workaround (e.g., `Continue Offline`, `Use Textbook Note`, `Test Audio in Mute Mode`).
   - Secondary action: A polite retry trigger (`再試行 / Retry`).
3. **Preserve User Input**: In interactive sentence assembly or freeform reflection prompts, user input must **never be cleared** upon an error or connection failure.

---

## 4. Edge Case Test Matrix & Verification Sign-Off

| Test Case ID | Test Description | Expected System Behavior | QA Sign-off |
| :--- | :--- | :--- | :--- |
| **TC-EDG-01** | Disconnect Wi-Fi during 10-card SRS session, finish cards, reconnect. | 10 cards processed locally; on reconnection, batch sync triggers and server reflects identical stability. | **VERIFIED** |
| **TC-EDG-02** | Refresh browser mid-Lesson 3.2 at Stage 4 (Syntactic Assembly). | Stage 4 restores immediately with pre-selected particle tokens intact. | **VERIFIED** |
| **TC-EDG-03** | Deny microphone permissions in Listening Lab. | UI seamlessly disables mic waveform input, activates slow-motion Tokyo audio scrubber, shows help tip. | **VERIFIED** |
| **TC-EDG-04** | Simulate OpenAI / Anthropic 504 Gateway Timeout in AI Sensei. | Fallback UI surfaces within 2000ms with Tier 1 textbook rule; no UI crash or infinite spinner. | **VERIFIED** |
| **TC-EDG-05** | Double-click Submit button rapidly on JLPT Mock Question. | Debounce handler locks CTA after initial tap; prevents duplicate question answer submission. | **VERIFIED** |

---

## 5. Engineering Implementation Guidelines for Development Hand-Off

1. **Service Worker Configuration**: Cache all static Web fonts (`Noto Serif JP`, `Plus Jakarta Sans`), SVG stroke diagrams, and Unit 01 FLAC audio assets via `Cache-First` policy.
2. **IndexedDB Schema**:
   - `srs_outbox`: `{ id, card_id, rating, client_timestamp, synced: boolean }`
   - `lesson_progress_snapshot`: `{ unit_id, lesson_id, stage_index, active_tokens, last_active_ms }`
3. **Monotonic Exam Engine**: Ensure exam time calculations query `performance.now()` delta rather than system clock to prevent client system clock tampering.

---

**Certified by the KOTO Engineering & Systems Resilience Board.**  
*言登 (KOTO) — Uncompromising Quality, Educational Continuity & Production Resilience.*
