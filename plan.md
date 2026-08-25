# Implementation Plan: Humor Layer + Shareable Result Card
### Demography course project — "Living Conditions, Background, and Financial Behavior" survey

**Handoff note:** This doc is written so a different agent or dev, with none of the prior conversation, can pick it up and build. Everything decided is marked **DECIDED**. Everything still open is marked **VERIFY FIRST** or **OPEN DECISION** — resolve those before or during build, don't assume.

---

## 0. What this project is

A 78-item survey (`BD_University_Living_Arrangement_Spending_Questionnaire_v3_MERGED.md`, already drafted, in the outputs folder from earlier in this conversation) studying how living arrangement and family background relate to financial habits, budgeting discipline, and online impulse buying among university students in Bangladesh. Five-person team, second-year demography course.

**This plan covers only the add-on layer**: hosting the survey on Tally.so, adding light humor during the survey, and generating a shareable "result card" image at the end — a personality-quiz-style output computed from the respondent's real answers. The underlying survey content/questions are already finalized; don't redesign them here.

---

## 1. Design principle — read before writing any copy (DECIDED, don't relitigate)

The result card must be based on **behavior, not wealth**. Earlier drafts of this idea used wealth-shaming lines ("tui to gorib," "1 tkr o hishab rakha lagbe"). That was deliberately dropped for a specific methodological reason: household income/SES is the study's core independent variable, and a result that labels respondents by wealth risks (a) lower-income respondents dropping out or answering defensively, which biases the exact subgroup the study most needs honest data from, and (b) people answering to get a funnier result rather than an accurate one.

The fix that was landed on: **archetypes derived from spending behavior (budgeting discipline + impulse-buying scores), never from income or class.** Same humor, same shareability, none of the bias risk. Do not reintroduce wealth-based labels or copy. If asked to add a "how gorib are you" style result, push back and point here.

---

## 2. Humor layer content (DECIDED — implement as-is; wording can be polished but the structure/logic should not change without checking with Shafin)

### 2.1 Scoring system

Two scores computed from the respondent's Likert answers, each on a 1–5 scale, both from the v3 questionnaire:

**Budgeting Score** — mean of:
`Q45, Q46, Q47, Q48, Q49, Q50, Q51, Q52, Q53` (all straight-scored, 1=disagree...5=agree)
`Q54` is **reverse-scored**: use `(6 - Q54)` before averaging in ("I usually run out of money before the month ends" — agreeing means *worse* budgeting).
Final Budgeting Score = mean of those 10 values (9 straight + 1 reversed).

**Impulse Score** — mean of:
`Q59, Q60, Q61, Q62, Q63, Q64` (all straight-scored; higher = more impulsive).

**Thresholds:** Use the scale midpoint, **3.0**, as the High/Low cutoff for both scores initially.
⚠️ **OPEN DECISION:** once pilot data (or the first ~50 real responses) comes in, recalculate using the actual sample median instead of the fixed 3.0 — this gives a more meaningful "compared to your peers" result. Ship with 3.0 first so the tool works from day one; swap in the computed median later (it's a one-line constant change). Expect the 3.0 midpoint to bunch most respondents into one or two quadrants; do this recalculation at pilot, not "someday," or most people will get the same card and the sharing value collapses.

### 2.1a Missing data — MUST be implemented, not optional

Only Q1 and the consent item are Required in Tally (§5.3, a deliberate hesitation-reduction choice — do **not** make the Likert items required to make the scoring easier). So skipped items are guaranteed in live data.

**Rules:**
- Compute each mean over **answered items only**, not over the full item count.
- Budgeting Score needs **at least 6 of 10** items answered to be valid. Impulse Score needs **at least 4 of 6**.
- If either score is invalid → do not guess, show the **fallback card** (§2.2a, "The Enigma").
- Never divide by a hardcoded 10 or 6. Count the answered items at runtime.

### 2.1b The Q57 gate — a real hole in the original logic, must be handled

Q57 asks how often the respondent buys online. If the answer is **"Never," the questionnaire skips them past Q59–Q64 straight to Q74.** Those six items *are* the entire Impulse Score. This means a "Never" respondent has **no impulse data at all** and cannot be placed on the 2×2 grid — naive code will produce NaN or crash here.

**Rule:** If `Q57 = "Never"`, bypass impulse scoring entirely and assign the dedicated fifth archetype **"The Untouchable"** (§2.2a). Do not treat missing impulse answers as zero or as low-impulse — check the Q57 gate explicitly *before* attempting to compute an impulse mean.

Note this also means **Q65 is skipped** for these respondents, so the EMI Enthusiast badge check must tolerate a missing Q65 (§2.3).

### 2.2 Primary archetypes (2×2 grid of Budgeting × Impulse)

| | Low Impulse | High Impulse |
|---|---|---|
| **High Budgeting** | **The Hishabi** (হিসাবী) | **Plan-Then-Panic** |
| **Low Budgeting** | **The Ghost Spender** | **The 2AM Checkout Warrior** |

**The Hishabi** (High Budget, Low Impulse)
*"Every taka has a job before it's even earned."*
Card blurb: You budget, you track, you don't flinch at a discount timer. Certified Hishabi — the friend who always knows exactly how much is left before month-end.

**Plan-Then-Panic** (High Budget, High Impulse)
*"Made a budget. Broke it by day 3. Still proud of the spreadsheet."*
Card blurb: The intention is real. The spreadsheet is beautiful. And then Daraz sends a notification.

**The 2AM Checkout Warrior** (Low Budget, High Impulse)
*"Daraz notification hits harder than your alarm clock."*
Card blurb: No budget, no regrets (until the delivery arrives). You buy on vibes and pay the price later — literally.

**The Ghost Spender** (Low Budget, Low Impulse)
*"Money leaves. Nobody, including you, knows how."*
Card blurb: You're not impulsive — you just genuinely don't track where it goes. A mystery even to yourself.

### 2.2a Two non-grid archetypes (required by §2.1a and §2.1b — not optional flavor)

**The Untouchable** — assigned when `Q57 = "Never"` (doesn't shop online at all)
*"Daraz has never once won. Not even at 2AM."*
Card blurb: Flash sales bounce off you. Countdown timers mean nothing. In an economy built on impulse, you simply do not participate.
→ Show this instead of the 2×2 result. Their Budgeting Score is still valid and can be mentioned in a sub-line if you want ("...and your budgeting game is strong, too") — but the archetype itself is the Untouchable.

**The Enigma** — fallback when scores are invalid (too many skipped items, per §2.1a)
*"You skipped the questions. Respect. We know nothing."*
Card blurb: You gave us just enough to say thank you and absolutely nothing else. Genuinely, that's a personality type too.
→ This card must never look like an error message. It's a real, deliberately funny result. A respondent who skips half the survey should still get something worth screenshotting — that's what keeps them from feeling punished for exercising the skip option you promised them.

### 2.3 Optional badges (shown alongside the primary archetype, stackable — a respondent can get 0–3)

| Condition (from v3 questionnaire) | Badge |
|---|---|
| `Q31` = "Yes" (supports family financially) | 🛡️ **Family's Safety Net** |
| `Q23` = "Regularly" or "Occasionally" (hides purchases from family) | 🤫 **Low-Key Secret Shopper** |
| `Q65` = "Yes, I use it more than planned" (BNPL/installment) | 💳 **EMI Enthusiast** |

Badges are additive flavor text under the main archetype on the card — they don't change which archetype is shown.

⚠️ **All three badge checks must tolerate a missing answer** — Q23, Q31, and Q65 are all skippable, and Q65 is *always* missing for `Q57 = "Never"` respondents (§2.1b). Missing → badge simply not awarded. Never treat missing as a match, and never crash on undefined.

### 2.4 In-survey encouragement lines (place between sections, not attached to any answer)

Keep these light, never about money amounts, never about the respondent's specific answers (they're shown to everyone regardless of what was just answered — this matters, see §1).

- After Section A (Your University) → *"Great, the boring part's done. Now the interesting stuff."*
- After Section B (About You/Family) → *"Halfway to knowing yourself better than your bank statement does."*
- After Section E (Household Income) → *"Money talk, handled. Nobody's judging — we promise, and we mean it."*
- After Section G (Money Going Out) → *"Your wallet has been through a lot answering these. Almost done."*
- Before Section I (Buying Online) → *"Confession time: how bad is the Daraz addiction, really?"*
- Before final section → *"Last stretch. Your result is being calculated as we speak (kidding — it's after you hit submit)."*

⚠️ **OPEN DECISION:** Bengali versions of these — draft in English here for the logic, get a native speaker on the team to write/adjust the Bangla so the tone lands right. Don't machine-translate the jokes; humor doesn't survive that.

### 2.5 Visual assets

Each of the 4 archetypes needs a simple icon/illustration for the result card. **Do not use existing meme characters, cartoon mascots, or any copyrighted art** — draw original simple icons (flat-style line art works well and is fast to produce) or commission/AI-generate originals. Budget: one small icon per archetype, one badge icon per badge (3 more), ~7 small assets total. This is the one part of this plan that needs actual design time — flag it early so it's not the last-minute bottleneck.

---

## 3. Site features — what needs to get built

1. Tally.so form hosting the full v3 questionnaire (78 items, with the two conditional/branching questions: Q16 hall-attachment, Q32 family-support-amount, Q42 savings-share)
2. On submission, score computed from answers (Budgeting Score, Impulse Score → archetype; badge conditions)
3. A generated, downloadable **PNG image** result card showing: archetype name, tagline, blurb, icon, badges — this is the "exported image" for social sharing
4. A results page the respondent lands on after submitting, showing the card and a download/share button
5. (Separate, lower priority) Raw response data still needs to land somewhere the team can analyze — Tally's native export or a connected Google Sheet, independent of the image-generation flow. Don't let the fun feature block or complicate this.

---

## 4. Technical architecture

### 4.1 First thing to verify — this determines which of the two plans below to build

⚠️ **VERIFY FIRST, before writing any code:** Open Tally.so's form settings → look at redirect-on-submission / "Thank you" page options. Check specifically whether Tally can append individual question answers (or a submission ID) as URL query parameters on the post-submit redirect. This is a common feature across form builders but hasn't been confirmed for Tally's current UI in this doc — confirm it directly in the product before committing to Plan A.

### 4.2 Plan A — Stateless (use this if Tally can pass answers as URL params on redirect)

```
Respondent fills Tally form
        │
        ▼
Tally redirects to: yoursite.netlify.app/result?q45=4&q46=5&...&q31=yes&q23=occasionally&q65=no
        │
        ▼
Results page (static HTML/JS) reads query params, computes scores client-side
        │
        ▼
Page requests: /.netlify/functions/generate-image?archetype=Hishabi&badges=safety-net
        │
        ▼
Netlify Function renders the card (see §4.4) and returns image bytes directly
        │
        ▼
Browser displays image inline + "Download" button (just an <a download> pointing at the same function URL)
```

No database. No storage. Every request is self-contained.

🚨 **Privacy problem with Plan A — read before choosing it.** This puts the respondent's raw answers in the URL bar. That includes **Q23** (whether they hide purchases from their family) and **Q31** (whether they financially support their family). Consequences: the answers land in browser history, they travel in the Referer header to any third party, and if the respondent shares the *link* rather than the image, whoever opens it sees their answers in plain text. The consent screen promises anonymity — this quietly undercuts it.

**Mitigations if you must use Plan A:** pass only the two computed scores and an archetype key (e.g. `?b=3.4&i=4.1&badges=1,3`) rather than individual answers, and use `<meta name="referrer" content="no-referrer">` on the results page. This requires Tally to support *calculated* values in the redirect, not just raw answers — **VERIFY** whether it does.

**Recommendation: prefer Plan B unless the verification in §4.1 shows Tally can pass computed scores rather than raw answers.** Plan B is slightly more work but keeps every answer server-side, which is what you told respondents you'd do.

### 4.3 Plan B — Fallback (use this only if Tally can't pass full answers via URL, e.g. only a submission ID)

```
Respondent fills Tally form
        │
        ├──► Tally webhook fires → /.netlify/functions/save-submission
        │         stores {submissionId: {q45: 4, q46: 5, ...}} in Netlify Blobs (simple key-value store)
        │
        └──► Tally redirects to: yoursite.netlify.app/result?id=abc123
                        │
                        ▼
        Results page calls /.netlify/functions/generate-image?id=abc123
                        │
                        ▼
        Function looks up abc123 in Netlify Blobs, computes score, renders, returns image
```

More moving parts (webhook + storage), but works regardless of what Tally's redirect supports. Netlify Blobs needs no separate setup — it's built into Netlify, no external DB required.

### 4.4 Image rendering — how the function actually produces a PNG

Recommend **`satori`** (JSX/HTML-like layout → SVG) + **`@resvg/resvg-js`** (SVG → PNG), both run fine inside a Netlify Function without needing headless Chrome. This is the same approach behind most "og-image" generators. Avoid Puppeteer/Playwright for this — too heavy and slow for a serverless function on a free tier.

```
npm install satori @resvg/resvg-js
```

Function skeleton (`generate-image.js`):
1. Parse query params / look up stored answers
2. Compute Budgeting Score, Impulse Score → pick archetype from §2.2
3. Check badge conditions → pick 0–3 badges from §2.3
4. Build a simple layout object (satori takes JSX-like objects, not real JSX unless you add a build step — plain objects work fine for a fixed template)
5. `satori(layoutObject, {width: 1080, height: 1080, fonts: [...]})` → SVG string
6. `new Resvg(svgString).render().asPng()` → PNG buffer
7. Return with `Content-Type: image/png`, and for the download button, `Content-Disposition: attachment; filename="my-money-type.png"` when a `?download=1` param is present

🚨 **Bengali font — this will silently break if ignored.** The card copy contains Bangla script (archetype names like হিসাবী, and the Bangla encouragement/tagline variants). **Satori embeds only the font files you hand it and cannot fall back to a system font.** Give it a Latin font *and* a Bengali font, or every Bangla glyph renders as a tofu box (□□□□) — and it will do this without throwing an error, so it passes CI and fails in production.

```js
fonts: [
  { name: 'Inter', data: interBuffer, weight: 700, style: 'normal' },
  { name: 'NotoSansBengali', data: notoBengaliBuffer, weight: 700, style: 'normal' }
]
```
Use **Noto Sans Bengali** (SIL Open Font License, free to embed and redistribute). Commit the `.ttf` to `assets/fonts/`. In the satori layout, set `fontFamily: 'Inter, NotoSansBengali'` so it falls through per-glyph. **Test with an actual Bangla string before wiring anything else up** — this is a two-minute check that saves a full rebuild.

Card should be **square (1080×1080)** — that's the safest aspect ratio across Instagram, Facebook, and WhatsApp status.

### 4.5 Suggested repo structure

```
/
├── plan.md                      (this file)
├── survey/
│   └── v3_questionnaire.md      (copy of the finalized survey, for reference)
├── site/
│   ├── index.html or /result    (results page)
│   ├── assets/
│   │   ├── icons/                (the 4 archetype + 3 badge icons from §2.5)
│   │   └── fonts/                 (a font satori can embed — e.g. a Google Font .ttf, must self-host, satori can't fetch fonts live)
│   └── style.css
├── netlify/
│   └── functions/
│       ├── generate-image.js
│       └── save-submission.js    (only needed for Plan B)
└── netlify.toml
```

---

## 5. Tally.so setup guide

1. Create the form, add all 78 questions from `v3_questionnaire.md` — question type mapping: single-select → Tally's "Multiple Choice" (single answer), multi-select → "Checkboxes," open text → "Short/Long Answer," Likert grids (Q45–Q54, Q59–Q64) → Tally doesn't have a native Likert-grid block as far as should be assumed here; **VERIFY** whether to use Tally's "Rating"/"Linear Scale" block per statement (10 separate rating questions for Q45–Q54, 6 for Q59–Q64) or a matrix-style block if one exists. Confirm in-product before building all 78 fields.
2. Set up conditional logic (Tally calls this "Logic" in the form builder) for:
   - Q16 (hall attachment) — show only if Q2 is one of the public/technical institution types
   - Q32 (family support amount) — show only if Q31 = "Yes"
   - Q42 (savings share) — show only if Q41 = "Yes, every month" or "Yes, when I can"
   - Q57 gate — skip Section I entirely if Q57 = "Never"
3. Force-answer (Tally: "Required") only on Q1 and the consent checkbox. Leave everything else, especially money questions, skippable — this was a deliberate hesitation-reduction design choice from the questionnaire draft, don't override it. (Yes, this makes scoring harder. §2.1a handles it. Do not "fix" it by making the Likert blocks required.)

3a. 🚨 **Update the consent text — currently it doesn't cover the result card.** The v3 consent says responses are used for academic research and reported in aggregate. It says nothing about generating a personalised shareable result, which is a different use of their answers than what they agreed to. Add a line before launch, e.g.:

> *At the end you'll get a light-hearted "money personality" card based on your answers, which you can share if you want to. It's just for fun and is not part of our research findings. Your answers stay anonymous either way.*

This also does double duty methodologically — it's the disclaimer that stops anyone mistaking the card for the study's actual results.
4. Set the "On Submission" behavior to redirect to your Netlify results page URL (see §4.1–4.3 for which plan this determines).
5. Separately, connect Tally's native export or Google Sheets integration so raw response data lands somewhere for the team's actual research analysis — this should work regardless of which image-generation plan you build.
6. Randomize option order where the questionnaire notes it (Q38, Q58) if Tally supports per-question randomization.

---

## 6. Netlify setup guide

1. `netlify init` in the repo, connect to a GitHub repo for the team
2. Functions live in `netlify/functions/` (auto-detected by Netlify — confirm `netlify.toml` points there)
3. If using Plan B: enable Netlify Blobs (no extra account/service needed, it's part of the Netlify platform) and note the store name used in `save-submission.js` and `generate-image.js` must match
4. Test functions locally with `netlify dev` before deploying — lets you hit `localhost:8888/.netlify/functions/generate-image?...` directly and check the image renders before wiring up Tally
5. Deploy, get the live URL, plug it into Tally's redirect setting (§5.4)
6. Font licensing note: satori needs a font file it can embed directly (no live Google Fonts fetching at render time) — download a `.ttf`/`.otf` for whatever font you pick and commit it to `assets/fonts/`

---

## 7. Open decisions to resolve before/during build (collected from above, so nothing gets missed)

- [ ] **VERIFY:** Can Tally's redirect pass full answers or only a submission ID as URL params? → determines Plan A vs. Plan B (§4.1)
- [ ] **VERIFY:** Does Tally have a native Likert-matrix block, or do the 16 Likert items need to be built as individual rating questions? (§5, step 1)
- [ ] **DECIDE:** Bengali wording for the 6 encouragement lines (§2.4) — needs a native speaker's pass, not machine translation
- [ ] **DECIDE:** Who's producing the 7 icon assets (§2.5) and by when — likely the critical-path bottleneck, start this early
- [ ] **DEFER:** Swap the 3.0 fixed threshold for a real sample-median threshold once pilot/early response data exists (§2.1)

---

## 8. Testing checklist before going live

- [ ] Submit the form once for each of the 4 archetype combinations (manually pick answers that should land in each quadrant) and confirm the correct card renders
- [ ] **Submit with `Q57 = "Never"`** and confirm you get The Untouchable, not a crash or NaN (§2.1b)
- [ ] **Submit skipping all of Q45–Q54** and confirm you get The Enigma fallback, not an error page (§2.1a)
- [ ] **Submit skipping just 3 of the 10 budgeting items** and confirm a normal archetype still computes from the remaining 7
- [ ] **Render a card containing Bangla text and confirm no tofu boxes (□□□□)** — do this first, before anything else (§4.4)
- [ ] Submit with each badge condition individually true, and with 0 and all 3 true, confirm badge stacking looks right on the card
- [ ] Submit with Q23/Q31/Q65 all skipped and confirm no badges awarded and no crash
- [ ] Confirm the downloaded PNG is actually square and renders correctly when posted to Instagram/Facebook/WhatsApp (test on an actual phone, not just desktop preview)
- [ ] Confirm all conditional/branching questions (Q16, Q32, Q42, Q57-gate) skip correctly
- [ ] Confirm raw response data is landing in the export/Sheet correctly, independent of whether the image generation succeeds — a failed image render should never lose survey data
- [ ] Pilot with 5–10 people outside the team, on their own phones, before wide distribution

---

## 9. Reference

Full survey content: `BD_University_Living_Arrangement_Spending_Questionnaire_v3_MERGED.md` (already created earlier — copy it into `survey/` in the repo so this plan is self-contained). Question numbers referenced throughout this doc (Q1–Q78) match that file exactly.
