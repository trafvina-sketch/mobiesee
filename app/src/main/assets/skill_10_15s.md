---
name: DuongTho-10s-15s
description: "DuongTho-10s-15s dedicated autopilot video generation skill for Dola AI using Seedance 2.5 with dual duration support (10s and 15s). Features: STRICT EXACT-PROMPT fidelity (100% verbatim prompt, never alter, rewrite, or enhance), mandatory dual parameters (BOTH prompt AND user_prompt identical in every call), 2 parallel generation streams, instant zero-wait NotifyHuman delivery as each video completes, ABSOLUTE SILENCE (zero conversational chatter, reasoning kept strictly internal, minimal forced-turn message 'Autopilot continuing...'), guaranteed 4 completed videos per batch cycle, two-phase failure handling, dynamic name-based reference image matching, and 15-minute recurring cloud cron continuation surviving browser closure with auto-deletion upon 100% completion."
---

# DuongTho-10s-15s — Seedance 2.5 — Dual Duration (10s/15s) · Strict Verbatim Prompt · Silent Autopilot

## Overview

DuongTho-10s-15s processes user-provided prompts (single prompt, bulk text, TXT, or CSV files) in **direct autopilot mode** with zero confirmation. It enforces absolute exact-prompt fidelity, runs two concurrent generation streams, delivers each completed video instantly via `NotifyHuman`, keeps complete silence, and uses cloud cron tasks for uninterrupted backend continuity.

**FOLLOW THIS SKILL BLINDLY. DO NOT ANALYZE. DO NOT SECOND-GUESS. THE RULES AND PARAMETERS BELOW ARE STRICT AND NON-NEGOTIABLE.**

---

## 1. SUPREME HARD LOCKS (Non-Negotiable)

### 🔒 Mandatory Generation Parameters — Every Single Call

| Parameter | Required Value |
|---|---|
| `duration` | **`10`** (if user specifies 10s) or **`15`** (default 15s). Never any other length. |
| `model_version` | **`seedance_2.5`** — ALWAYS explicitly specified. |
| `prompt` | **The user's exact verbatim prompt text.** |
| `user_prompt` | **The SAME prompt text (100% identical to `prompt`).** |

### ⚠️ `user_prompt` Is Mandatory — Backend API Requirement
The Dola Seedance 2.5 backend API requires `user_prompt` (`invalid param, t2v must have user_prompt`).
- **NEVER** omit `user_prompt`.
- **ALWAYS** pass BOTH `prompt` AND `user_prompt` with byte-identical string values in every `text_to_video` and `image_to_video` call.

### 🎯 Exact-Prompt Fidelity (Strict Verbatim)
- The user's supplied prompt text is the SOLE and AUTHORITATIVE source of video content.
- **NEVER** invent, rewrite, expand, summarize, paraphrase, replace, "improve", "polish", or "enhance" the user's prompt.
- Pass the user's prompt text VERBATIM into the generation call. If the user's prompt is short, sparse, or simple, that is intentional — generate exactly from it.
- Do NOT add scenes, characters, actions, camera movements, dialogue, props, or lighting not in the user's prompt.
- The ONLY allowed additions are: (a) negative constraints explicitly specified by the user, and (b) basic whitespace cleanup.

### ⏱️ Strict Dual Duration (10s & 15s Only)
- Only `duration: 10` and `duration: 15` are supported (default `15`).
- One single continuous segment per video. Never split into multi-part clips.
- Ignore any duration mentions inside prompt text that contradict the 10s/15s lock.

### 🚫 Anti-Spreading Rules
- Never split a video into multiple clips, parts, or chapters.
- Never propose compressed fallbacks or shorter alternatives.
- Never present platform limitation disclaimers, Plan B, or workarounds.
- Never ask the user to choose split options or durations.
- Never ask for confirmation, approval, or permission to continue.

---

## 2. ABSOLUTE SILENCE & VISIBLE OUTPUT RESTRICTIONS

### 🚫 Forbidden in User Output
During autopilot, the ONLY things the user should see in chat are: **`NotifyHuman` video player embeds** and the minimal status messages defined below.

- ❌ "Send any message to resume" / "reply to continue" — **FORBIDDEN**
- ❌ "X videos delivered" / "Y remaining" / prompt IDs / counts — **FORBIDDEN**
- ❌ Progress summaries / "Batch X" / markdown status tables — **FORBIDDEN**
- ❌ Re-printing prompt text or scene descriptions under videos — **FORBIDDEN**
- ❌ Parameter explanations / technical chatter / debug logs — **FORBIDDEN**
- ❌ Questions / "Would you like me to..." / options — **FORBIDDEN**
- ❌ Raw URLs or plain text links — **FORBIDDEN**

### ✅ Permitted Outputs Only
1. **`NotifyHuman` attachments:** The instant a video finishes rendering, deliver it immediately.
2. **Turn Completion Message:** When the 4-video batch quota completes or platform forces turn end, output ONLY:
   `Autopilot continuing...`
3. **Final Completion Message:** When all queued prompts are finished, output ONLY:
   `All videos generated and delivered.`

---

## 3. PARALLEL STREAMS & 4-VIDEO BATCH QUOTA

### 2 Parallel Streams (Maximum Speed)
- Always maintain **2 concurrent generation streams** (Slot 1 and Slot 2).
- When Slot 1 finishes, deliver via `NotifyHuman` immediately and pull the next prompt into Slot 1.
- When Slot 2 finishes, deliver via `NotifyHuman` immediately and pull the next prompt into Slot 2.
- Both slots free + queue ≥ 2 → launch both in parallel to minimize latency.

### Guaranteed 4 Completed Videos Per Batch Cycle (Hard Quota)
- Each execution cycle strictly aims for **exactly 4 successfully completed videos** (e.g., Slots 1 & 2 complete Videos #1 & #2, then immediately proceed to complete Videos #3 & #4).
- If any prompt fails for any reason (safety filter, API exception, timeout):
  1. Silently move the failed prompt to `failed[]`.
  2. **DO NOT stop early!**
  3. **Immediately pull the next pending prompt** into the freed slot to fulfill the full 4 completed videos quota for this cycle.
- The instant all 4 videos in the batch are completed, output `Autopilot continuing...` and let the background watchdog cron continue the queue.

### 🎬 Initial 4-Video Sample Gate & Autopilot Continuity
- When the user requests an initial sample or starts a new bulk run:
  1. Generate **exactly 4 sample videos** (#1, #2, #3, #4) in the initial batch using 2 parallel streams.
  2. Deliver all 4 videos immediately via `NotifyHuman` embeds.
  3. Autopilot engages: **ALL subsequent turns/batches MUST ALSO generate exactly 4 completed videos per batch** (#5–#8, #9–#12, etc.).
  4. **NEVER drop back to 2 videos per turn.** The batch quota is non-negotiably locked at 4 completed videos per cycle.

---

## 4. DYNAMIC NAME-BASED REFERENCE IMAGE MATCHING

When the user provides reference images (characters, environments) alongside scripts:
1. **Cataloging:** Extract unique names from filenames or headers (e.g., `Character_A.png`, `Background_B.jpg`, `A Thao`, `King Peter`).
2. **Matching Rule:** Inspect each prompt line for matching `@Name` tags or exact name mentions.
   - If a prompt mentions `Character_A`, attach `Character_A` image URL to `image_reference_url_list`.
   - If a prompt mentions multiple references, attach all matching URLs (up to model capacity).
   - If no reference is mentioned, route to pure `text_to_video`.
3. **Prompt Preservation:** Match images dynamically via API parameters. **NEVER modify or rewrite the user's prompt text to describe reference images.**

---

## 5. TWO-PHASE FAILURE HANDLING (Silent & Exhaustive)

### Phase 1 — Main Pass
- Succeeds → Deliver via `NotifyHuman` immediately → add to `done[]` → pull next from `pending[]`.
- Fails (ANY reason) → **SILENTLY** move to `failed[]` → **IMMEDIATELY** pull next from `pending[]`.
- **Zero chatter. Zero error messages. Zero apologies. Keep generating.**

### Phase 2 — End-of-Run Retry Pass
- Starts ONLY when `pending[]` is completely empty.
- Process `failed[]` with the same 2 parallel streams.
- If a retry succeeds → Deliver via `NotifyHuman` → add to `done[]`.
- If a retry fails → Move to the end of `failed[]` and try next item. Keep cycling until all prompts succeed or reach hard exhaustion.
- Never abandon a prompt during the main pass.

---

## 6. BACKEND CONTINUITY & RECURRING WATCHDOG CRON

A bulk run must continue generating in the backend even if the user closes the browser, tab, or computer.

### Scheduled Watchdog Cron (`*/15 * * * *` / `每 15 分钟`)
At the start of a bulk run (Batch 1), register or verify a recurring scheduled task:
- **Title:** `DuongTho-Video-Autopilot`
- **Schedule:** `*/15 * * * *` (every 15 minutes, recurring)
- **Query:** `"This request is triggered by the scheduled task 'DuongTho-Video-Autopilot'. This is an automatically triggered recurring scheduled-task request; the user is not online, so do NOT ask any questions or request clarification — complete the work independently. You are continuing a DuongTho-10s-15s video generation autopilot queue. Follow these steps EXACTLY: load existing checkpoint state (done[], failed[], pending[]), follow DuongTho-10s-15s skill blindly, generate 4 completed videos using duration=15 (or 10), model_version=seedance_2.5, include BOTH prompt AND user_prompt with identical verbatim values, deliver each video immediately via NotifyHuman, output ONLY 'Autopilot continuing...' if turn ends, and when all videos are finished output 'All videos generated and delivered.' and delete this cron task."`

### Silent Resume Protocol
- When triggered by scheduled cron OR any new user message:
  1. **Silently resume instantly.** No greetings, no "welcome back", no recap.
  2. Read checkpoint from disk (`done[]`, `failed[]`, `pending[]`).
  3. Resume immediately from the next pending prompt.
  4. Never regenerate already-delivered videos.

### Auto-Cleanup Upon Completion
The instant ALL prompts are in `done[]` (and `failed[]` is exhausted):
1. Call `delete_cron_job` to remove the `DuongTho-Video-Autopilot` task.
2. Output ONLY: `All videos generated and delivered.`
3. End turn cleanly.

---

## 7. INPUT PARSING & AUTO-INFERENCE

### Supported Input Formats
- **Single prompt:** Read verbatim. Generate immediately.
- **TXT / Notepad file:** Read line-by-line. Each non-empty line = one prompt. Preserve order.
- **CSV file:**
  - 1-column: Each row = one prompt. Title = `"Video #XXX"`.
  - 2-column: Column 1 = `title` (used as `attachment_name`), Column 2 = `prompt`.
- **Delimiters:** Comma `,`, Tab `\t`, Pipe `|`.

### Parameter Auto-Inference (Never Ask)
- `duration`: `10` if requested, otherwise default `15`.
- `ratio`: `9:16` (vertical) by default if unspecified.
- `model_version`: `seedance_2.5`.

---

## 8. PRE-FLIGHT CHECKLIST (Before Every Call)

| Check | Requirement | Verified |
|---|---|---|
| Model Version | `model_version: "seedance_2.5"` | ✅ |
| Duration | `duration: 10` or `duration: 15` | ✅ |
| Prompt | User verbatim prompt | ✅ |
| User Prompt | Present AND byte-identical to `prompt` | ✅ |
| Output Visible? | Keep reasoning internal. ONLY `NotifyHuman` video players visible. | ✅ |
| Turn Ending? | Output ONLY `Autopilot continuing...` | ✅ |
| All Done? | Delete cron job + output `All videos generated and delivered.` | ✅ |
