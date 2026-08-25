# ৳ BD University Student Money Personality Survey & Gamification App

A Next.js gamified survey web application for the university demography research study: **"Living Conditions, Background, and Financial Behavior of University Students in Bangladesh"**.

---

## 🎯 Features

1. **Tally.so Survey Integration**:
   - Seamlessly embeds the 78-question research questionnaire using Next.js Script and dynamic height.
   - Listens for `Tally.FormSubmitted` postMessage events to seamlessly transition respondents to their personality card.
2. **Behavioral Personality Scoring Engine (`lib/scoring.ts`)**:
   - **Budgeting Discipline Scale**: Computes mean of straight items ($Q45-Q53$) and reverse item ($Q54$).
   - **Impulse Buying Scale**: Computes mean of straight online impulse items ($Q59-Q64$).
   - **$Q57$ Gate**: Automatically detects non-online shoppers (`Q57 = "Never"`) and routes to **The Untouchable**.
   - **Missing Data Safe**: Checks item count thresholds ($\ge 6$ budgeting, $\ge 4$ impulse), routing incomplete respondents to **The Enigma**.
   - **12+ Hidden Types**: Contradiction types (Delusional CFO, Humble Menace, Theorist) and Lifestyle types (Family Pillar, Hustler, Bank of Friends, Window Shopper, Cart Monk, Payday Phenomenon, Copycat, Cash Purist, Survivor, Cash Hoarder, Son of King).
   - **Stackable Badges**: Family's Safety Net 🛡️, Low-Key Secret Shopper 🤫, EMI Enthusiast 💳.
3. **1080×1080 High-Resolution Social Card Generator (`components/ResultCardCanvas.tsx`)**:
   - Client-side Canvas generator combining character illustrations, dual English & Bengali typography, accent glow gradients, badges, and study attribution.
   - 1-click **Download PNG**, **Copy Image to Clipboard**, and **Native Web Share / WhatsApp Share**.
4. **Interactive Simulator (`components/SimulatorModal.tsx`)**:
   - Full testing sandbox to test all 19 archetypes and all badge combinations in real-time.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## ⚙️ Environment Variables (Optional)

Create a `.env.local` file:
```env
NEXT_PUBLIC_TALLY_FORM_ID=your_tally_form_id_here
```

---

## 📊 Calibrating Thresholds from Pilot Data

In `lib/scoring.ts`, the default scale midpoint threshold is `3.0`. Once your first 50 pilot responses arrive in Tally / Google Sheets:
1. Compute the empirical sample medians for Budgeting Score and Impulse Score.
2. Update the `budgetThreshold` and `impulseThreshold` constants in `lib/scoring.ts` to reflect the actual sample distribution!
