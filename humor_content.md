# Humor Content & Art Direction
### Companion to `plan.md` — all copy and visual specs for the result cards

**Handoff note:** This is the content layer. `plan.md` is the build layer. Question numbers (Q1–Q78) refer to `v3_questionnaire_reference.md`.

⚠️ **Bangla copy below is a first draft written by an AI, not a native speaker.** The English lines carry the intended tone; the Bangla is a starting point, not a final. Humor is the single hardest thing to get right across languages — have a Bangla-speaking team member rewrite freely rather than translate literally. If a line doesn't land, throw it out and write a new one that does. Do not ship the Bangla unreviewed.

---

## Part 1 — In-survey encouragement lines

**Rules for these (from the design principle in `plan.md` §1):**
- Shown to **everyone** at a fixed point, never triggered by what someone just answered. A line that reacts to an answer tells the respondent they're being judged mid-survey, which is exactly what suppresses honesty on the money questions.
- Never reference amounts, income, or class.
- Short. One line. These are speed bumps, not content.

| Position | English | Bangla (draft — needs native rewrite) |
|---|---|---|
| After Section A (University) | "Okay, formalities done. Now the fun part." | "আনুষ্ঠানিকতা শেষ। এবার আসল খেলা।" |
| After Section B (About You) | "Halfway to knowing yourself better than your bank statement does." | "নিজেকে চেনার পথে অর্ধেক এগিয়ে গেছেন।" |
| After Section D (Cost of Studying) | "Deep breath. The next bit is just numbers, and nobody's checking." | "একটু দম নিন। সামনেরটা শুধু সংখ্যা, কেউ যাচাই করছে না।" |
| After Section E (Household Income) | "Money talk, survived. No judgement here — we mean that." | "টাকার আলাপ পার হয়ে গেল। কেউ বিচার করছে না, সত্যি।" |
| After Section G (Money Going Out) | "Your wallet has been through a lot in the last two minutes." | "গত দুই মিনিটে আপনার মানিব্যাগের উপর দিয়ে অনেক কিছু গেছে।" |
| Before Section I (Buying Online) | "Confession time. How bad is the Daraz situation, really?" | "সত্যি বলার সময়। দারাজের অবস্থা আসলে কতটা খারাপ?" |
| Before Section K (last stretch) | "Last stretch. Your result is loading. (Not really. But almost.)" | "শেষ ধাপ। রেজাল্ট আসছে। (আসলে না। তবে প্রায়।)" |

**Placement note:** Tally shows these as text blocks between pages. Don't put one after every section — seven lines across a 78-item survey is about right. More than that and they stop being a break and start being noise.

---

## Part 2 — The six result cards

Four from the 2×2 grid, plus two required by the edge cases in `plan.md` §2.1a–2.1b. **All six need art.** The two edge-case cards are not optional; skipping them means crashes for real respondents.

---

### 1. THE Hishabi — হিসাবী
**Trigger:** Budgeting ≥ threshold, Impulse < threshold

> **Tagline:** "Every taka has a job before it even arrives."
>
> **Blurb:** You budget, you track, and a countdown timer has never once rattled you. Certified হিসাবী — the friend who always knows exactly what's left before month-end, and is quietly judging everyone who doesn't.

**Share line:** "I'm The Hishabi 🧮"

---

### 2. PLAN-THEN-PANIC
**Trigger:** Budgeting ≥ threshold, Impulse ≥ threshold

> **Tagline:** "Made a budget. Broke it by day three. Still proud of the spreadsheet."
>
> **Blurb:** The intention is genuine. The planning is real. And then a notification arrives at the exact wrong moment and the spreadsheet becomes a historical document.

**Share line:** "I'm Plan-Then-Panic 📊💥"

---

### 3. THE 2AM CHECKOUT WARRIOR
**Trigger:** Budgeting < threshold, Impulse ≥ threshold

> **Tagline:** "The Daraz notification hits harder than your alarm."
>
> **Blurb:** No budget, no tracking, no regrets — until the delivery actually arrives. You buy on pure vibes and settle up with your future self, who is frankly tired of this.

**Share line:** "I'm The 2AM Checkout Warrior 🌙🛒"

---

### 4. THE GHOST SPENDER
**Trigger:** Budgeting < threshold, Impulse < threshold

> **Tagline:** "Money leaves. Nobody, including you, knows how."
>
> **Blurb:** You're not impulsive. You don't chase sales. And yet somehow it's gone by the 20th. The money simply evaporates, and you have made peace with the mystery.

**Share line:** "I'm The Ghost Spender 👻"

---

### 5. THE UNTOUCHABLE
**Trigger:** `Q57 = "Never"` — checked *before* any impulse scoring (see `plan.md` §2.1b)

> **Tagline:** "Daraz has never won. Not once. Not even at 2AM."
>
> **Blurb:** Flash sales bounce off you. Countdown timers mean nothing. In an entire economy engineered around impulse, you simply declined to participate.

**Share line:** "I'm The Untouchable 🗿"

**Optional sub-line** (only if their Budgeting Score is valid and high): "…and your budgeting is strong too, which frankly feels unfair."

---

### 6. THE ENIGMA
**Trigger:** Fallback — too many Likert items skipped for a valid score (see `plan.md` §2.1a)

> **Tagline:** "You skipped the questions. Respect. We know nothing."
>
> **Blurb:** You gave us just enough to say thank you and absolutely nothing more. Genuinely, that is a personality type, and honestly it might be the smartest one here.

**Share line:** "I'm The Enigma ❓"

🚨 **This card must never look like an error.** Same art quality, same layout, same share button as the other five. A respondent who used the skip option you explicitly promised them should not be punished with a broken-looking screen. If The Enigma feels like a consolation prize, the whole "skip anything you like" promise reads as a lie.

---

## Part 3 — Art direction

**Style: hand-drawn stickman / doodle.** This is the right call for three reasons, not just taste:
1. It reads as *self-deprecating* rather than *judgmental*. A polished corporate illustration of "The Ghost Spender" feels like a bank telling you off; a wobbly stick figure feels like a friend teasing you. Given the whole design principle here is "laugh with, never laugh at," the visual style is doing real work.
2. It's fast to produce — six characters plus three badges is one afternoon with a tablet, or paper and a phone camera.
3. It scales down cleanly. These get viewed as thumbnails on Facebook and WhatsApp.

**Specs:**
- Black ink on transparent background, single accent colour per card
- Deliberately imperfect lines — wobble is the aesthetic, don't clean it up
- Roughly 400×400px within the 1080×1080 card, centred above the archetype name
- Export as PNG with transparency so the card background colour shows through
- **Original art only.** No existing memes, no recognisable cartoon characters, no traced templates. Beyond the copyright issue, borrowed art immediately makes the card look like a forward rather than something your team made.

**Character sketches:**

| Card | Drawing | Accent |
|---|---|---|
| The Hishabi | Stick figure with an oversized notebook, tiny satisfied smile, neat coin stacks beside them | Green |
| Plan-Then-Panic | Stick figure holding a chart that's on fire, expression cheerful, has not noticed the fire | Orange |
| 2AM Checkout Warrior | Stick figure in bed, face lit from below by a phone, eyes enormous, tiny delivery box already at the door | Purple |
| The Ghost Spender | Stick figure shrugging, coins visibly floating away as tiny ghosts | Grey-blue |
| The Untouchable | Stick figure standing perfectly still, arms crossed, sale banners and "70% OFF" tags flying past without touching them | Deep red |
| The Enigma | Stick figure that's just a question mark with legs | Black / neutral |

**Badges** (small, ~120×120, sit in a row under the archetype name — see `plan.md` §2.3 for trigger conditions):
- 🛡️ **Family's Safety Net** — tiny stick figure holding an umbrella over two smaller figures
- 🤫 **Low-Key Secret Shopper** — stick figure hiding a parcel behind their back
- 💳 **EMI Enthusiast** — stick figure sawing a coin into three equal slices

---

## Part 4 — Card layout (1080×1080)

```
┌─────────────────────────────┐
│  [small header: MY MONEY    │
│   PERSONALITY]              │
│                             │
│      [ stickman art ]       │
│         400×400             │
│                             │
│    THE 2AM CHECKOUT         │  ← large, bold
│         WARRIOR             │
│                             │
│  "The Daraz notification    │  ← tagline, italic
│   hits harder than your     │
│   alarm."                   │
│                             │
│  [blurb, 2 lines max]       │
│                             │
│  🛡️  🤫        (badges)     │
│                             │
│  ─────────────────────────  │
│  A demography study ·       │  ← footer, small
│  [short link]               │
└─────────────────────────────┘
```

**Footer must include the survey link** — the card *is* the recruitment channel. A shared card that doesn't tell people where to take it themselves wastes the entire feature.

**Also in the footer, small but present:** "just for fun — not our research findings." Protects the methodology and stops anyone screenshotting the card as though it were a result.

**Text length discipline:** the blurbs above are written to fit two lines at card width. If art or badges push the layout, cut the blurb rather than shrinking the type below readable-at-thumbnail size.
