import React from 'react';
import { BIRD_HEIGHT, BIRD_WIDTH, BIRD_X } from '../constants/gameConstants';

interface BirdProps {
  position: number;
  velocity: number;
}

export const Bird: React.FC<BirdProps> = ({ position, velocity }) => {
  return (
    <div
      className="absolute w-7 h-7 bg-yellow-400 rounded-full transition-transform"
      style={{
        top: position,
        left: BIRD_X,
        transform: `rotate(${velocity * 4}deg)`,
        width: BIRD_WIDTH,
        height: BIRD_HEIGHT,
      }}
    >
      <div className="absolute w-3 h-3 bg-white rounded-full top-1 left-1" />
      <div className="absolute w-2 h-2 bg-black rounded-full top-1.5 left-1.5" />
      <div className="absolute w-4 h-2 bg-orange-600 -right-1 top-3 rounded-r-full" />
    </div>
  );
};