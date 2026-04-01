import React from 'react';
import { GROUND_HEIGHT } from '../constants/gameConstants';

interface BackgroundProps {
  scrollOffset: number;
  score: number;
}

// ── Color helpers ────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}
function lerpColor(a: string, b: string, t: number): string {
  const [r1,g1,b1] = hexToRgb(a);
  const [r2,g2,b2] = hexToRgb(b);
  const s = Math.max(0, Math.min(1, t));
  return `rgb(${Math.round(r1+(r2-r1)*s)},${Math.round(g1+(g2-g1)*s)},${Math.round(b1+(b2-b1)*s)})`;
}

// ── Sky color states ─────────────────────────────────────────────────────────
const DAY   = { top: '#1e90c8', mid: '#5bbcf0', bot: '#b0dff8' };
const DUSK  = { top: '#9b2335', mid: '#e8621a', bot: '#f9a825' };
const NIGHT = { top: '#020817', mid: '#0f1f45', bot: '#1a2f5a' };

function getSkyColors(score: number) {
  if (score < 20) return DAY;
  if (score < 30) {
    const t = (score - 20) / 10;
    return { top: lerpColor(DAY.top, DUSK.top, t), mid: lerpColor(DAY.mid, DUSK.mid, t), bot: lerpColor(DAY.bot, DUSK.bot, t) };
  }
  if (score < 40) {
    const t = (score - 30) / 10;
    return { top: lerpColor(DUSK.top, NIGHT.top, t), mid: lerpColor(DUSK.mid, NIGHT.mid, t), bot: lerpColor(DUSK.bot, NIGHT.bot, t) };
  }
  return NIGHT;
}

// ── Scene data ───────────────────────────────────────────────────────────────
const BACK_MOUNTAINS = [
  { x: 0,   h: 150, w: 210 },
  { x: 180, h: 105, w: 160 },
  { x: 320, h: 195, w: 250 },
  { x: 550, h: 135, w: 175 },
  { x: 705, h: 85,  w: 125 },
  { x: 810, h: 165, w: 195 },
];
const MTN_LOOP = 950;

const FRONT_HILLS = [
  { x: 0,   h: 68,  w: 145 },
  { x: 120, h: 48,  w: 100 },
  { x: 200, h: 82,  w: 155 },
  { x: 345, h: 58,  w: 110 },
  { x: 435, h: 88,  w: 165 },
  { x: 590, h: 52,  w: 115 },
  { x: 685, h: 72,  w: 135 },
  { x: 810, h: 48,  w: 100 },
];
const HILL_LOOP = 900;

const CLOUDS = [
  { x: 30,  y: 55,  width: 90,  height: 38 },
  { x: 180, y: 90,  width: 65,  height: 28 },
  { x: 310, y: 45,  width: 110, height: 42 },
  { x: 500, y: 75,  width: 75,  height: 32 },
  { x: 650, y: 105, width: 95,  height: 36 },
  { x: 820, y: 58,  width: 80,  height: 30 },
];
const CLOUD_LOOP = 900;

// Deterministic star positions spread across the sky
const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (i * 137 + i * i * 31) % 392 + 4,
  y: (i * 79  + i * 43) % 220 + 6,
  size: (i % 3) + 1,
  phase: i * 0.71,
}));

// Fireflies float in the mid-play area
const FIREFLIES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: (i * 53 + 20) % 370 + 15,
  y: (i * 89 + 180) % 160 + 190,
  phase: i * 0.85,
}));

const GRASS_TILE = 40;
const DIRT_TILE  = 60;

// ── Component ────────────────────────────────────────────────────────────────
export const Background: React.FC<BackgroundProps> = ({ scrollOffset, score }) => {
  const duskProgress  = Math.max(0, Math.min(1, (score - 20) / 10));
  const nightProgress = Math.max(0, Math.min(1, (score - 30) / 10));

  const sky = getSkyColors(score);

  const cloudOffset   = scrollOffset * 0.40;
  const mountainOffset = scrollOffset * 0.35;
  const hillOffset    = scrollOffset * 0.60;

  // Mountain / hill colours evolve with the sky
  const backMtnColor = nightProgress > 0
    ? lerpColor(lerpColor('#4a6741', '#6b2d2d', duskProgress), '#1a2040', nightProgress)
    : duskProgress > 0
      ? lerpColor('#4a6741', '#6b2d2d', duskProgress)
      : '#4a6741';

  const frontHillColor = nightProgress > 0
    ? lerpColor(lerpColor('#3a8c35', '#5a2020', duskProgress), '#0d1a35', nightProgress)
    : duskProgress > 0
      ? lerpColor('#3a8c35', '#5a2020', duskProgress)
      : '#3a8c35';

  const cloudOpacity    = Math.max(0, 1 - nightProgress * 0.85);
  const starOpacity     = nightProgress;
  const fireflyOpacity  = Math.max(0, (nightProgress - 0.3) / 0.7);
  const moonOpacity     = nightProgress;

  return (
    <>
      {/* ── Sky gradient ────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, ${sky.top} 0%, ${sky.mid} 55%, ${sky.bot} 100%)` }}
      />

      {/* ── Moon ─────────────────────────────────────────────────────────── */}
      {moonOpacity > 0 && (
        <div
          className="absolute rounded-full"
          style={{
            top: 28, right: 55,
            width: 38, height: 38,
            backgroundColor: '#f0f0e8',
            opacity: moonOpacity,
            boxShadow: `0 0 22px rgba(240,240,220,${moonOpacity * 0.55}), 0 0 48px rgba(180,210,255,${moonOpacity * 0.25})`,
          }}
        />
      )}

      {/* ── Stars ────────────────────────────────────────────────────────── */}
      {starOpacity > 0 && STARS.map(s => {
        const twinkle = 0.55 + 0.45 * Math.sin(scrollOffset * 0.025 + s.phase);
        return (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ left: s.x, top: s.y, width: s.size, height: s.size, opacity: starOpacity * twinkle }}
          />
        );
      })}

      {/* ── Back mountains (slowest parallax layer) ───────────────────────── */}
      {BACK_MOUNTAINS.map((m, i) => {
        const x = ((m.x - (mountainOffset % MTN_LOOP)) % MTN_LOOP + MTN_LOOP) % MTN_LOOP;
        if (x > 420) return null;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: x,
              bottom: GROUND_HEIGHT - 2,
              width: m.w,
              height: m.h,
              backgroundColor: backMtnColor,
              clipPath: 'polygon(0% 100%, 48% 0%, 100% 100%)',
            }}
          />
        );
      })}

      {/* ── Front hills (medium parallax layer) ──────────────────────────── */}
      {FRONT_HILLS.map((h, i) => {
        const x = ((h.x - (hillOffset % HILL_LOOP)) % HILL_LOOP + HILL_LOOP) % HILL_LOOP;
        if (x > 420) return null;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: x,
              bottom: GROUND_HEIGHT - 2,
              width: h.w,
              height: h.h,
              backgroundColor: frontHillColor,
              clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)',
              opacity: 0.92,
            }}
          />
        );
      })}

      {/* ── Clouds (fast parallax, fade to night) ────────────────────────── */}
      {cloudOpacity > 0.05 && CLOUDS.map((cloud, i) => {
        const x = ((cloud.x - (cloudOffset % CLOUD_LOOP)) % CLOUD_LOOP + CLOUD_LOOP) % CLOUD_LOOP;
        if (x > 420) return null;
        return (
          <div key={i} className="absolute" style={{ left: x, top: cloud.y, width: cloud.width, height: cloud.height, opacity: cloudOpacity }}>
            <div className="absolute inset-0 bg-white rounded-full opacity-90" />
            <div
              className="absolute bg-white rounded-full opacity-90"
              style={{ width: cloud.width * 0.6, height: cloud.height * 1.4, top: -(cloud.height * 0.35), left: cloud.width * 0.2 }}
            />
          </div>
        );
      })}

      {/* ── Fireflies ────────────────────────────────────────────────────── */}
      {fireflyOpacity > 0 && FIREFLIES.map(f => {
        const bobY  = Math.sin(scrollOffset * 0.04 + f.phase) * 7;
        const glow  = 4 + Math.sin(scrollOffset * 0.06 + f.phase * 1.4) * 2;
        const alpha = fireflyOpacity * (0.4 + 0.6 * Math.abs(Math.sin(scrollOffset * 0.05 + f.phase)));
        return (
          <div
            key={f.id}
            className="absolute rounded-full"
            style={{
              left: f.x,
              top: f.y + bobY,
              width: 4,
              height: 4,
              backgroundColor: '#d9f99d',
              boxShadow: `0 0 ${glow}px #86efac, 0 0 ${glow * 2}px #4ade80`,
              opacity: alpha,
            }}
          />
        );
      })}

      {/* ── Scrolling ground ─────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: GROUND_HEIGHT }}>

        {/* Dirt body */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{
            top: 18,
            backgroundImage: 'repeating-linear-gradient(90deg, #e8c98a 0px, #e8c98a 30px, #dbb870 30px, #dbb870 60px)',
            backgroundPositionX: `${-(scrollOffset % DIRT_TILE)}px`,
            filter: nightProgress > 0 ? `brightness(${1 - nightProgress * 0.5})` : undefined,
          }}
        />

        {/* Dirt depth line 1 */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: 30, height: 4,
            backgroundImage: 'repeating-linear-gradient(90deg, #c9a45a 0px, #c9a45a 30px, #ba9348 30px, #ba9348 60px)',
            backgroundPositionX: `${-(scrollOffset % DIRT_TILE)}px`,
            opacity: 0.5,
          }}
        />

        {/* Dirt depth line 2 */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: 50, height: 3,
            backgroundImage: 'repeating-linear-gradient(90deg, #c9a45a 0px, #c9a45a 30px, #ba9348 30px, #ba9348 60px)',
            backgroundPositionX: `${-(scrollOffset % DIRT_TILE + 15)}px`,
            opacity: 0.35,
          }}
        />

        {/* Grass cap */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 20,
            backgroundImage: 'repeating-linear-gradient(90deg, #72c442 0px, #72c442 20px, #5fb030 20px, #5fb030 40px)',
            backgroundPositionX: `${-(scrollOffset % GRASS_TILE)}px`,
            filter: nightProgress > 0 ? `brightness(${1 - nightProgress * 0.6}) saturate(${1 - nightProgress * 0.45})` : undefined,
          }}
        />

        {/* Grass highlight */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 5,
            backgroundImage: 'repeating-linear-gradient(90deg, #8ed45a 0px, #8ed45a 20px, #72c442 20px, #72c442 40px)',
            backgroundPositionX: `${-(scrollOffset % GRASS_TILE)}px`,
            opacity: 0.7,
          }}
        />

        {/* Grass→dirt shadow line */}
        <div
          className="absolute left-0 right-0"
          style={{ top: 19, height: 3, backgroundColor: '#3d7a1a', opacity: 0.4 }}
        />
      </div>
    </>
  );
};
