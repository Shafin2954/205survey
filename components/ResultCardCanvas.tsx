'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Archetype, Badge } from '@/lib/types';

interface ResultCardCanvasProps {
  archetype: Archetype;
  badges: Badge[];
  surveyUrl?: string;
}

export const ResultCardCanvas: React.FC<ResultCardCanvasProps> = ({
  archetype,
  badges,
  surveyUrl = 'stat205-survey.vercel.app',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  const drawCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed canvas dimensions for high-res crisp export
    const W = 1408;
    const H = 1420;
    canvas.width = W;
    canvas.height = H;

    // Ensure all custom fonts (including Bengali & serif) are loaded
    await document.fonts.ready;

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
    ctx.font = '600 18px "Inter", sans-serif';
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

    // ---- character illustration (native 1408x768 aspect ratio preserved) ----
    const imgMargin = 64;
    const imgW = W - imgMargin * 2; // 1280px
    const imgH = (imgW * 768) / 1408; // exactly 698.18px, perfect 1408x768 aspect ratio

    const charImg = new Image();
    charImg.crossOrigin = 'anonymous';
    charImg.src = archetype.imagePath;

    await new Promise<void>((resolve) => {
      charImg.onload = () => {
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

        resolve();
      };
      charImg.onerror = () => {
        ctx.fillStyle = '#F0EBE3';
        ctx.fillRect(imgMargin, curY, imgW, imgH);
        ctx.fillStyle = '#8E8E8E';
        ctx.font = '400 32px "DM Serif Display", Georgia, serif';
        ctx.fillText(archetype.name, W / 2, curY + imgH / 2 - 16);
        resolve();
      };
    });

    curY += imgH + 42;

    // ---- archetype name (English) ----
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '400 58px "DM Serif Display", Georgia, serif';
    ctx.letterSpacing = '-0.5px';
    ctx.fillText(archetype.name, W / 2, curY);
    curY += 66; // 58px font + 8px gap

    // ---- bangla subtitle (with generous height clearance) ----
    ctx.fillStyle = '#4A4A4A';
    ctx.font = '600 32px "Hind Siliguri", sans-serif';
    ctx.letterSpacing = '0px';
    ctx.fillText(archetype.banglaName, W / 2, curY);
    curY += 52; // font height

    // Increased gap after Bangla text before tagline
    curY += 32;

    // ---- tagline (italic serif - wrapped if long) ----
    ctx.fillStyle = '#555555';
    ctx.font = 'italic 400 26px "DM Serif Display", Georgia, serif';
    curY = wrapText(ctx, `“${archetype.tagline}”`, W / 2, curY, W - 240, 36);

    // Gap before blurb
    curY += 18;

    // ---- blurb (word-wrapped body) ----
    ctx.fillStyle = '#444444';
    ctx.font = '400 22px "Inter", sans-serif';
    curY = wrapText(ctx, archetype.blurb, W / 2, curY, W - 260, 34);

    // Gap before badges
    curY += 24;

    // ---- badges (dynamically measured to eliminate any text overlap) ----
    if (badges.length > 0) {
      ctx.font = '500 18px "Inter", sans-serif';
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
        ctx.font = '500 18px "Inter", sans-serif';
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
    ctx.font = '600 20px "Inter", sans-serif';
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
    ctx.font = '400 15px "Inter", sans-serif';
    ctx.fillText('Living Conditions & Financial Behavior Study · Demography Research 2026', W / 2, dividerY + 16);

    setReady(true);
  };

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

  useEffect(() => {
    drawCard();
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
        <button onClick={handleDownload} className="btn btn--primary">
          Download High-Res Card
        </button>
        <button onClick={handleCopy} className="btn btn--outline">
          Copy Image
        </button>
        <button onClick={handleShare} className="btn btn--outline">
          Share
        </button>
      </div>
    </div>
  );
};
