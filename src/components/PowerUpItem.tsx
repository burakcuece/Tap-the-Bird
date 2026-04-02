import React from 'react';
import { PowerUpType } from '../types/gameTypes';

interface PowerUpItemProps {
  type: PowerUpType;
  x: number;
  y: number;
}

const POWER_UP_VISUALS: Record<PowerUpType, { emoji: string; bg: string; glow: string }> = {
  magnet:  { emoji: '🧲', bg: '#7c3aed', glow: '#a78bfa' },
  shield:  { emoji: '🛡️', bg: '#0369a1', glow: '#38bdf8' },
  shrink:  { emoji: '🍄', bg: '#15803d', glow: '#4ade80' },
};

export const PowerUpItem: React.FC<PowerUpItemProps> = ({ type, x, y }) => {
  const v = POWER_UP_VISUALS[type];
  return (
    <div
      className="absolute flex items-center justify-center rounded-full"
      style={{
        left: x,
        top: y,
        width: 28,
        height: 28,
        backgroundColor: v.bg,
        boxShadow: `0 0 8px ${v.glow}, 0 0 18px ${v.glow}55`,
        fontSize: 14,
        zIndex: 10,
        border: `2px solid ${v.glow}`,
      }}
    >
      {v.emoji}
    </div>
  );
};
