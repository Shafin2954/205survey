# Hidden Types & Character Art Briefs
### Companion to `plan.md` and `humor_content.md`

Question numbers refer to `v3_questionnaire_reference.md`.

---

## Part 0 — Read this before implementing hidden types

**Hidden types override the base six.** The result logic becomes two-stage:

```
1. Check Q57 = "Never"        → The Untouchable (hard gate, always wins)
2. Check score validity        → The Enigma if invalid
3. Walk the hidden-type list in priority order → first match wins, stop
4. No hidden match             → fall through to the base 2×2 archetype
```

**Three rules that matter:**

- **Priority order must be fixed and deterministic.** Several hidden types can match one person at once. Walk the list top to bottom and stop at the first hit. If the order is arbitrary, two identical respondents can get different cards depending on code ordering, and someone will notice.
- **Every hidden trigger must tolerate missing answers.** All the questions below are skippable. A missing answer means "condition not met," never a crash, never a match.
- **Cost check: each type is one drawing.** Six base + twelve hidden = eighteen characters. That's a real commitment for one artist. If time is short, the ⭐ types below are the six with the best rarity-to-effort ratio — build those first, add the rest later. The system works fine with 6 base + 6 hidden.

**Why hidden types are worth the effort:** rarity is what drives sharing. "I got the rare one" is a much stronger impulse to post than "I got one of four." And every one of these is computed from answers you're already collecting — no extra questions, no added survey length, no new bias risk.

---

## Part 1 — The hidden types

Ordered by priority. Contradiction types come first because they're the most specific and the most fun; lifestyle types come after.

---

### TIER 1 — Contradiction types (rarest, funniest, highest priority)

These fire when someone's *self-image* contradicts their *reported behaviour*. Methodologically these are the most interesting things in your whole dataset — a real gap between perceived and actual financial discipline. They also make the best cards, because being gently caught out is inherently funny.

---

**1. ⭐ THE DELUSIONAL CFO**
**Trigger:** `Q53 ≥ 4` (confident managing money) AND `Q54 ≥ 4` (usually runs out before month-end)

> **Tagline:** "Supreme confidence. Zero evidence."
>
> **Blurb:** You feel completely in control of your money, and you also run out of it every single month. Both things are true at once. We're not going to be the ones to tell you.

**Share line:** "I'm The Delusional CFO 💼"

---

**2. ⭐ THE HUMBLE MENACE**
**Trigger:** `Q73 = "Less than most"` AND Impulse Score ≥ 4.0

> **Tagline:** "Thinks they spend less than everyone. Statistically, no."
>
> **Blurb:** You're convinced you're the careful one in your friend group. Your actual answers suggest you might be the reason your friend group has a group chat about spending.

**Share line:** "I'm The Humble Menace 😇"

---

**3. THE THEORIST**
**Trigger:** `Q45 ≥ 4` (sets a budget) AND `Q46 ≤ 2` (doesn't stick to it) AND `Q48 ≤ 2` (doesn't track)

> **Tagline:** "Beautiful budget. Purely decorative."
>
> **Blurb:** You make the plan. You do not consult the plan. The plan exists as an art object, admired occasionally, followed never.

**Share line:** "I'm The Theorist 📐"

---

### TIER 2 — Lifestyle types

---

**4. ⭐ THE FAMILY PILLAR**
**Trigger:** `Q31 = "Yes"` (supports family) AND `Q34` in the bottom two brackets (below ৳5,000/month available)

> **Tagline:** "Carrying more than the budget shows."
>
> **Blurb:** You're sending money home on one of the tightest personal budgets in this survey. Every taka you manage is doing double duty. Quietly, this is the hardest mode in the game.

**Share line:** "I'm The Family Pillar 🛡️"

🚨 **Tone note — this one is the exception to the joke rule.** Do not make this card funny. Everywhere else the humour works because nobody's actually being hurt. Here the respondent is genuinely under strain, and a punchline would land as mockery of exactly the person your study should treat most carefully. Keep it warm and straight. It should read as recognition, not a gag. If the artist's instinct is to make it cute, override it — dignified, not adorable.

---

**5. ⭐ THE HUSTLER**
**Trigger:** `Q33` includes **three or more** income sources

> **Tagline:** "Three income streams and a 9AM class."
>
> **Blurb:** Tuition in the morning, freelancing at night, and something else on the side that you'd rather not explain. You don't have a budget, you have a portfolio.

**Share line:** "I'm The Hustler ⚡"

---

**6. ⭐ THE BANK OF FRIENDS**
**Trigger:** `Q43 = "Yes, frequently, and I don't always track who owes whom"`

> **Tagline:** "Everyone owes you. You've lost the list."
>
> **Blurb:** You lend without records and somehow never chase anyone. Your friends love you. Your money does not.

**Share line:** "I'm The Bank of Friends 🏦"

---

**7. THE WINDOW SHOPPER**
**Trigger:** `Q67` = "Yes, daily" or "Yes, occasionally" (follows deal pages) AND `Q68 = "0"` (zero unplanned purchases)

> **Tagline:** "Watches every sale. Buys nothing. Legend."
>
> **Blurb:** You follow the deal groups religiously and purchase nothing. You're studying the enemy. Total surveillance, zero engagement.

**Share line:** "I'm The Window Shopper 🔭"

---

**8. THE CART MONK**
**Trigger:** `Q66 = "Yes, and it usually stops me from buying"`

> **Tagline:** "Adds to cart. Waits. Wins."
>
> **Blurb:** You've weaponised the waiting period. Things go in the cart and simply die there. The discipline is genuinely upsetting to the rest of us.

**Share line:** "I'm The Cart Monk 🧘"

---

**9. ⭐ THE PAYDAY PHENOMENON**
**Trigger:** `Q37 = "Significantly more"` (spends more right after receiving money) AND `Q54 ≥ 4` (runs out before month-end)

> **Tagline:** "Rich for four days. Then the long silence."
>
> **Blurb:** The money arrives and there is a brief golden era of treats and confidence. Then it's the 12th, and you're negotiating with yourself over transport fare.

**Share line:** "I'm The Payday Phenomenon 📉"

---

**10. THE COPYCAT**
**Trigger:** `Q72 = "Seeing someone I know has it"` AND `Q40 ≥ 4` (often/very often want what friends bought)

> **Tagline:** "Your friend's purchase is your shopping list."
>
> **Blurb:** Ads don't move you at all. But the moment a classmate shows up with something, the countdown starts. You're not influenced by marketing — you're influenced by people, which is arguably worse.

**Share line:** "I'm The Copycat 👀"

---

**11. THE CASH PURIST**
**Trigger:** `Q40` = cash only (no bKash/Nagad, no card, no bank transfer selected)

> **Tagline:** "If it's not in the pocket, it doesn't exist."
>
> **Blurb:** No apps, no cards, no digital trail. You operate exclusively in physical notes, and your spending awareness is either perfect or nonexistent, with no middle ground.

**Share line:** "I'm The Cash Purist 💵"

---

**12. THE SURVIVOR**
**Trigger:** `Q28 = "Yes, it disrupted my budget significantly"` (session jam / exam delay) AND `Q27 ≥ 4` (education cost a strain)

> **Tagline:** "The session jam took the budget with it."
>
> **Blurb:** Your financial planning has been repeatedly rearranged by forces entirely outside your control. You've adapted more times than any budget should have to.

**Share line:** "I'm The Survivor 🧗"

**Tone note:** like The Family Pillar, dial the joke back. Real hardship, played straight-ish.

---

## Part 2 — Character art briefs

### Universal style rules (apply to all 18)

- **Black ink stickman, deliberately wobbly.** Imperfection is the aesthetic — do not clean up the lines, do not use a shape tool for circles. A perfect circle head kills the whole effect.
- **One accent colour per character**, used sparingly — one prop or one highlight, never a full colour fill.
- **Transparent background PNG**, roughly 400×400 within the 1080×1080 card.
- **Readable at thumbnail size.** Squint test: at 100px, the pose should still read. If the joke depends on a small detail, the joke is lost — rebuild it into the silhouette.
- **Faces: dots and a line.** Full expressions get muddy when scaled down. Eyebrow angle and mouth curve carry everything.
- **Original work only.** No traced memes, no recognisable characters, no borrowed templates.
- **Consistent head-to-body ratio across all characters** — this is the single thing that makes eighteen separate drawings feel like one set rather than eighteen doodles.

---

### Base six

**THE Hishabi** — *green*
Standing straight, oversized notebook held open in both hands, small satisfied closed-mouth smile. Three neat coin stacks on the ground beside them, evenly spaced. Posture upright, slightly smug. The notebook should be almost comically large — bigger than the torso.

**PLAN-THEN-PANIC** — *orange*
Holding up a chart or graph, arm extended, big cheerful open smile, looking straight at the viewer. The chart's top corner is on fire with small orange flames. Critically: the character has **not noticed the fire**. Eyes on viewer, never on the chart. The gap between their expression and the fire is the entire joke.

**THE 2AM CHECKOUT WARRIOR** — *purple*
Lying in bed, blanket up to chest, phone held above face. Purple glow lighting the face from below (a few radiating lines). Eyes enormous — much larger than any other character's. Small delivery box already sitting by the bed, implying it arrived faster than sleep did.

**THE GHOST SPENDER** — *grey-blue*
Shrugging — both palms up, shoulders raised, flat neutral mouth. Coins floating upward and away, each with a tiny wavy ghost tail. Expression is complete acceptance, not distress. They've made peace with it.

**THE UNTOUCHABLE** — *deep red*
Standing perfectly still, arms crossed, eyes closed, feet planted. Sale banners, "70% OFF" tags and notification bubbles flying past on both sides in motion lines — none of them touching the figure. Everything around them is chaos; the figure is the only still thing in the frame.

**THE ENIGMA** — *black / neutral*
Literally a large question mark with two stick legs and small shoes. No head, no arms, no face. Should look intentional and confident, not incomplete — it's a real result, not a placeholder. Maybe one leg slightly forward, mid-stride.

---

### Hidden twelve

**THE DELUSIONAL CFO** — *navy*
Stick figure in a tie (just a small triangle at the neck), one hand raised in a confident presentation gesture, huge self-assured grin. Behind them, unnoticed, a downward-trending arrow. The tie and the grin do the work — this is someone giving a boardroom presentation about a company that is on fire.

**THE HUMBLE MENACE** — *pink*
Halo above the head, hands clasped innocently in front, eyes closed in serene virtue. Behind their back, hidden from their own view, a mountain of shopping bags. The halo should be slightly crooked.

**THE THEORIST** — *teal*
Standing beside a large framed document mounted on a wall like museum art, one hand gesturing toward it appreciatively. A small velvet rope in front of the frame. The character is admiring the budget, not using it. Museum-visitor posture.

**THE FAMILY PILLAR** — *warm gold*
🚨 **Draw this one straight. No gag, no exaggeration.** Standing figure holding an umbrella extended over two smaller figures, tilted so the smaller ones are fully covered and the main figure is not. Posture steady and calm, not strained or sad. Warm gold accent on the umbrella. This should feel dignified — the kind of drawing someone would be glad to be given, not one they'd laugh at. If it reads as cute or pitiable, redo it.

**THE HUSTLER** — *electric yellow*
Mid-stride, clearly moving fast, motion lines behind. Juggling three items at once: a laptop, a book, and a phone. Bag slung across the body. Expression alert and slightly frantic but capable. Should look like someone late to something and handling it.

**THE BANK OF FRIENDS** — *mint green*
Standing with arms open in a generous shrug, coins flying outward in several directions toward small offscreen hands reaching in from the frame edges. A dropped notebook on the ground near their feet, pages scattered — the lost ledger. Expression cheerful, entirely unbothered.

**THE WINDOW SHOPPER** — *sky blue*
Peering through binoculars or a telescope at a distant "SALE" sign. Crouched slightly, surveillance posture, hidden behind something small (a bush or a box). Hands empty. No bags anywhere in frame — the absence of purchases is the point.

**THE CART MONK** — *stone grey*
Seated cross-legged, meditating, eyes closed, serene. A shopping cart icon floating above the head like a thought bubble, with visible dust or cobwebs on it. Total stillness. The contrast between the meditation pose and the cart is the joke.

**THE PAYDAY PHENOMENON** — *coral*
Split composition, one character shown twice in the same frame. Left: arms up, celebrating, coins raining down. Right: same figure slumped, pockets turned inside out, small "12th" written above. A thin dividing line between the two halves. Same character, four days apart.

**THE COPYCAT** — *lavender*
Two stick figures. The front one holds a new item, oblivious. The second peers over their shoulder from behind, eyes wide and locked onto the item, one hand already reaching toward a phone. Slightly hunched, conspiratorial posture.

**THE CASH PURIST** — *forest green*
Holding a fan of physical notes with visible satisfaction. Standing beside a phone lying face-down on the ground, screen off, clearly abandoned. Maybe a small "no signal" or crossed-out card symbol nearby. Old-school stance, feet planted.

**THE SURVIVOR** — *earth brown*
Climbing — mid-motion up a jagged line that resembles both a mountain and an erratic chart line. Rope over the shoulder. Determined expression, not defeated. Small flag planted at a point already passed, showing this isn't the first climb. Play it mostly straight; the humour is in the exhaustion, not in mockery.

---

## Part 3 — Build order for the artist

If everything can't be drawn at once, this is the order that keeps the system shippable at every stage:

1. **The base six** — required, nothing works without them
2. **The ⭐ hidden six** (Delusional CFO, Humble Menace, Family Pillar, Hustler, Bank of Friends, Payday Phenomenon) — best rarity-to-effort ratio, and the system is fully launchable at twelve
3. **The remaining six** — add whenever ready; new types can ship after launch without breaking anything

Testing note: every added type is another path to verify. Before launch, force a submission for each implemented type and confirm the right card renders — see the checklist in `plan.md` §8.
