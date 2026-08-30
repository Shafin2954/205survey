'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Archetype, Badge } from '@/lib/types';

interface ResultCardCanvasProps {
  archetype: Archetype;
  badges: Badge[];
  surveyUrl?: string;
}

// ---------------------------------------------------------------------------
// Font specs used by the canvas below. Declared once here and referenced by
// both `ensureFonts` (to explicitly request each face, by name+weight+style
// AND the real text it will render) and the `ctx.font = ...` assignments in
// `drawCard`, so the two can never drift out of sync.
// ---------------------------------------------------------------------------
const FONT_HEADER = '600 18px "Inter", sans-serif';
const FONT_IMG_FALLBACK = '400 32px "DM Serif Display", Georgia, serif';
const FONT_NAME = '400 58px "DM Serif Display", Georgia, serif';
const FONT_BANGLA = '600 32px "Hind Siliguri", sans-serif';
const FONT_TAGLINE = 'italic 400 26px "DM Serif Display", Georgia, serif';
const FONT_BLURB = '400 22px "Inter", sans-serif';
const FONT_BADGE = '500 18px "Inter", sans-serif';
const FONT_FOOTER = '600 20px "Inter", sans-serif';
const FONT_FOOTER_SUB = '400 15px "Inter", sans-serif';

/**
 * `document.fonts.ready` alone isn't enough here: it only resolves once
 * fonts that were ALREADY requested finish loading, and nothing in this
 * app's DOM ever renders italic "DM Serif Display" or weight-600 "Hind
 * Siliguri" — only the canvas asks for those exact faces, so `.ready` can
 * resolve before they've ever been triggered.
 *
 * Worse, `FontFaceSet.load(spec)` defaults its match-text to a single space.
 * For a font served as Unicode-range subsets (Google Fonts splits "Hind
 * Siliguri" into bengali/latin/latin-ext files), a space only matches the
 * Latin subset — so a bare `.load(spec)` call can "succeed" having loaded
 * zero Bangla glyphs. Passing the real text each font will render is what
 * actually guarantees the right subset is fetched before we measure/draw
 * with it (which is what was producing mismatched word-wrap/positioning
 * between draws — see the effect below for the other half of that bug).
 */
async function ensureFonts(pairs: Array<[spec: string, text: string]>): Promise<void> {
  try {
    await Promise.allSettled(pairs.map(([spec, text]) => document.fonts.load(spec, text || ' ')));
    await document.fonts.ready; // safety net for anything the DOM itself already triggered
  } catch {
    // Draw with whatever the browser has rather than fail the whole card.
  }
}

/** Loads an image without ever touching the canvas from inside the event
 * handlers — resolves `null` on error or cancellation instead of rejecting,
 * so the caller can draw a fallback without a try/catch, and so an aborted
 * draw can never leave `drawCard` permanently suspended. */
function loadImage(src: string, signal: AbortSignal): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    signal.addEventListener('abort', () => resolve(null), { once: true });
    img.src = src; // set after the handlers are attached
  });
}

/** Greedy word-wrap. Draws each line as it's completed and returns the Y
 * position just below the last line (including one trailing lineHeight of
 * gap), so callers can chain `curY = wrapText(...)`. */
function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (context.measureText(test).width > maxWidth && i > 0) {
      context.fillText(line.trim(), x, cy);
      line = words[i] + ' ';
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  context.fillText(line.trim(), x, cy);
  return cy + lineHeight;
}

export const ResultCardCanvas: React.FC<ResultCardCanvasProps> = ({
  archetype,
  badges,
  surveyUrl = 'money-personality-survey.netlify.app',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  const drawCard = async (signal: AbortSignal) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed canvas dimensions for high-res crisp export
    const W = 1408;
    const H = 1420;

    // ---- character illustration (native 1408x768 aspect ratio preserved) ----
    const imgMargin = 64;
    const imgW = W - imgMargin * 2; // 1280px
    const imgH = (imgW * 768) / 1408; // exactly 698.18px, perfect 1408x768 aspect ratio

    // Load the character image and every font face this draw will need in
    // parallel. Neither touches the canvas yet — that's deliberate: it's
    // what lets a superseded call bail out cleanly below instead of leaving
    // partial work for the next call to paint over.
    const imgPromise = loadImage(archetype.imagePath, signal);
    const fontsPromise = ensureFonts([
      [FONT_HEADER, 'YOUR MONEY PERSONALITY'],
      [FONT_IMG_FALLBACK, archetype.name],
      [FONT_NAME, archetype.name],
      [FONT_BANGLA, archetype.banglaName],
      [FONT_TAGLINE, `“${archetype.tagline}”`],
      [FONT_BLURB, archetype.blurb],
      [FONT_BADGE, badges.map((b) => b.name).join(' ') || ' '],
      [FONT_FOOTER, `Take the survey → ${surveyUrl}`],
      [FONT_FOOTER_SUB, 'Living Conditions & Financial Behavior Study · Demography Research 2026'],
    ]);
    const [charImg] = await Promise.all([imgPromise, fontsPromise]);

    // Bail if this draw was superseded (new props, or the component
    // unmounted) while we were loading fonts/image. This is the ONLY guard
    // needed: everything below is synchronous, so once we're past it, no
    // other in-flight call can interleave its own drawing with ours — JS is
    // single-threaded, and we never await again until the next effect run.
    if (signal.aborted || canvasRef.current !== canvas) return;

    // ---- synchronous drawing burst starts here ----

    // Setting width/height (even to the same value) resets the bitmap, so
    // this doubles as our clear. Doing it here instead of at the top of the
    // function means the previous card stays on screen for the full
    // font/image loading wait instead of flashing blank on every redraw.
    canvas.width = W;
    canvas.height = H;

    // ---- background: warm paper ----
    ctx.fillStyle = '#FAF7F0';
    ctx.fillRect(0, 0, W, H);

    // thin border inset
    ctx.strokeStyle = '#D9D2C7';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, W - 96, H - 96);

    // Use 'top' textBaseline everywhere for exact, predictable bounding boxes with zero overlap
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';

    let curY = 85;

    // ---- header label ----
    ctx.fillStyle = '#8E8E8E';
    ctx.font = FONT_HEADER;
    ctx.letterSpacing = '4px';
    ctx.fillText('YOUR MONEY PERSONALITY', W / 2, curY);

    curY += 32;
    // thin rule under header
    ctx.strokeStyle = '#C4BAA8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 160, curY);
    ctx.lineTo(W / 2 + 160, curY);
    ctx.stroke();

    curY += 28;

    // ---- character illustration ----
    if (charImg) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgMargin, curY, imgW, imgH, 8);
      ctx.clip();
      ctx.fillStyle = '#F0EBE3';
      ctx.fillRect(imgMargin, curY, imgW, imgH);
      ctx.drawImage(charImg, imgMargin, curY, imgW, imgH);
      ctx.restore();

      // subtle border frame
      ctx.strokeStyle = '#D9D2C7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(imgMargin, curY, imgW, imgH, 8);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#F0EBE3';
      ctx.fillRect(imgMargin, curY, imgW, imgH);
      ctx.fillStyle = '#8E8E8E';
      ctx.font = FONT_IMG_FALLBACK;
      ctx.letterSpacing = '0px'; // reset — otherwise inherits '4px' from the header label above
      ctx.fillText(archetype.name, W / 2, curY + imgH / 2 - 16);
    }

    curY += imgH + 42;

    // ---- archetype name (English) ----
    ctx.fillStyle = '#1A1A1A';
    ctx.font = FONT_NAME;
    ctx.letterSpacing = '-0.5px';
    ctx.fillText(archetype.name, W / 2, curY);
    curY += 66; // 58px font + 8px gap

    // ---- bangla subtitle (with generous height clearance) ----
    ctx.fillStyle = '#4A4A4A';
    ctx.font = FONT_BANGLA;
    ctx.letterSpacing = '0px';
    ctx.fillText(archetype.banglaName, W / 2, curY);
    curY += 52; // font height

    // Increased gap after Bangla text before tagline
    curY += 32;

    // ---- tagline (italic serif - wrapped if long) ----
    ctx.fillStyle = '#555555';
    ctx.font = FONT_TAGLINE;
    curY = wrapText(ctx, `“${archetype.tagline}”`, W / 2, curY, W - 240, 36);

    // Gap before blurb
    curY += 18;

    // ---- blurb (word-wrapped body) ----
    ctx.fillStyle = '#444444';
    ctx.font = FONT_BLURB;
    curY = wrapText(ctx, archetype.blurb, W / 2, curY, W - 260, 34);

    // Gap before badges
    curY += 24;

    // ---- badges (dynamically measured to eliminate any text overlap) ----
    if (badges.length > 0) {
      ctx.font = FONT_BADGE;
      const badgePads = 24;
      const badgeMetrics = badges.map((b) => {
        const label = `${b.icon}  ${b.name}`;
        const textW = ctx.measureText(label).width;
        const w = textW + badgePads * 2;
        return { label, w, h: 42 };
      });
      const gap = 16;
      const totalW = badgeMetrics.reduce((acc, b) => acc + b.w, 0) + (badges.length - 1) * gap;
      let startX = (W - totalW) / 2;

      badgeMetrics.forEach((b) => {
        ctx.fillStyle = '#EFEAE1';
        ctx.beginPath();
        ctx.roundRect(startX, curY, b.w, b.h, 4);
        ctx.fill();

        ctx.strokeStyle = '#D4CDC0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(startX, curY, b.w, b.h, 4);
        ctx.stroke();

        ctx.fillStyle = '#1A1A1A';
        ctx.font = FONT_BADGE;
        // Center text inside badge box
        ctx.fillText(b.label, startX + b.w / 2, curY + 11);

        startX += b.w + gap;
      });

      // Spacing after badges
      curY += 42 + 16;
    }

    // ---- footer section: text -> line -> subtext ----
    const footerStartY = H - 48 - 95;

    // 1. Take the survey text
    ctx.fillStyle = '#1A1A1A';
    ctx.font = FONT_FOOTER;
    ctx.fillText(`Take the survey → ${surveyUrl}`, W / 2, footerStartY);

    // 2. Horizontal divider line between the two texts
    const dividerY = footerStartY + 32;
    ctx.strokeStyle = '#C4BAA8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(140, dividerY);
    ctx.lineTo(W - 140, dividerY);
    ctx.stroke();

    // 3. Academic study attribution text below divider
    ctx.fillStyle = '#7E7E7E';
    ctx.font = FONT_FOOTER_SUB;
    ctx.fillText('Living Conditions & Financial Behavior Study · Demography Research 2026', W / 2, dividerY + 16);

    setReady(true);
  };

  useEffect(() => {
    // Hide the (now stale) download/copy/share actions until the new draw
    // finishes, so a click mid-redraw can't grab a blank or half-drawn card.
    setReady(false);

    const controller = new AbortController();
    void drawCard(controller.signal);

    // Cancels this run if `archetype`/`badges` change again before it
    // finishes (React always runs this before the next effect's body), and
    // on unmount. Without this, overlapping draws could race on the same
    // canvas — which is what caused the Bangla/italic text to sometimes
    // render doubled and overlapping.
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archetype, badges]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `money-personality-${archetype.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        }
      });
    } catch {
      // silent
    }
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (navigator.share) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `money-personality-${archetype.id}.png`, { type: 'image/png' });
          try {
            await navigator.share({
              title: `My Money Personality: ${archetype.name}`,
              text: `${archetype.shareLine} — Take the survey: https://${surveyUrl}`,
              files: [file],
            });
          } catch { /* cancelled */ }
        }
      });
    } else {
      const text = encodeURIComponent(`${archetype.shareLine} — Take the survey: https://${surveyUrl}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Big, centered, crisp canvas card preview */}
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#FAF7F0',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
      </div>

      {/* Prominent Save Notice outside the card */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.75rem 1.25rem',
          background: '#ECE5DB',
          border: '1px solid #D8CFC2',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: '#3A3A3A',
          textAlign: 'center',
          maxWidth: '680px',
          lineHeight: '1.5',
        }}
      >
        ⚠️ <strong>Save or download your card now!</strong> Because responses are anonymous, your result is not saved on this site and cannot be reloaded once you leave.
      </div>

      {/* Action buttons */}
      <div className="actions-row" style={{ marginTop: '1.25rem', justifyContent: 'center' }}>
        <button onClick={handleDownload} disabled={!ready} className="btn btn--primary">
          Download High-Res Card
        </button>
        <button onClick={handleCopy} disabled={!ready} className="btn btn--outline">
          Copy Image
        </button>
        <button onClick={handleShare} disabled={!ready} className="btn btn--outline">
          Share
        </button>
      </div>
    </div>
  );
};
