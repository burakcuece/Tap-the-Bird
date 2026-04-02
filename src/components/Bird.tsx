import React from 'react';
import { BIRD_HEIGHT, BIRD_WIDTH, BIRD_X } from '../constants/gameConstants';
import { BirdSkin } from '../constants/skinConstants';
import { ActivePowerUp } from '../types/gameTypes';

interface BirdProps {
  position: number;
  velocity: number;
  skin: BirdSkin;
  opacity: number;
  activePowerUp?: ActivePowerUp | null;
  shrinkScale: number;
}

export const Bird: React.FC<BirdProps> = ({ position, velocity, skin, opacity, activePowerUp, shrinkScale }) => {
  const hasShield = activePowerUp?.type === 'shield';
  const hasMagnet = activePowerUp?.type === 'magnet';

  return (
    <div
      className="absolute"
      style={{
        top: position,
        left: BIRD_X,
        width: BIRD_WIDTH,
        height: BIRD_HEIGHT,
        opacity,
        transform: `rotate(${Math.min(Math.max(velocity * 4, -30), 90)}deg) scale(${shrinkScale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Shield bubble */}
      {hasShield && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -10,
            border: '2.5px solid #38bdf8',
            backgroundColor: '#38bdf822',
            boxShadow: '0 0 12px #38bdf8, 0 0 24px #38bdf855',
            animation: 'pulse 1s ease-in-out infinite',
          }}
        />
      )}

      {/* Magnet field ring */}
      {hasMagnet && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -14,
            border: '2px dashed #a78bfa',
            opacity: 0.7,
            animation: 'spin 2s linear infinite',
          }}
        />
      )}

      {/* Bird body */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: skin.body,
          boxShadow: `inset -3px -2px 0 ${skin.bodyDark}`,
        }}
      >
        {/* Eye white */}
        <div className="absolute w-3 h-3 bg-white rounded-full top-1 left-1" />
        {/* Pupil */}
        <div className="absolute w-2 h-2 bg-gray-900 rounded-full top-1.5 left-1.5" />
        {/* Beak */}
        <div
          className="absolute w-4 h-2 -right-1 top-3 rounded-r-full"
          style={{ backgroundColor: skin.beak }}
        />
      </div>
    </div>
  );
};
