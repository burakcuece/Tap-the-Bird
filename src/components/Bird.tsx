import React from 'react';
import { BIRD_HEIGHT, BIRD_WIDTH, BIRD_X } from '../constants/gameConstants';
import { BirdSkin } from '../constants/skinConstants';

interface BirdProps {
  position: number;
  velocity: number;
  skin: BirdSkin;
  opacity: number;
}

export const Bird: React.FC<BirdProps> = ({ position, velocity, skin, opacity }) => {
  return (
    <div
      className="absolute rounded-full"
      style={{
        top: position,
        left: BIRD_X,
        width: BIRD_WIDTH,
        height: BIRD_HEIGHT,
        backgroundColor: skin.body,
        transform: `rotate(${Math.min(Math.max(velocity * 4, -30), 90)}deg)`,
        opacity,
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
  );
};
