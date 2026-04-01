import React from 'react';

interface CoinProps {
  x: number;
  y: number;
}

export const Coin: React.FC<CoinProps> = ({ x, y }) => {
  return (
    <div
      className="absolute w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-600 shadow-[0_0_10px_rgba(250,204,21,0.5)] flex items-center justify-center animate-pulse"
      style={{
        left: x,
        top: y,
      }}
    >
      <div className="w-3 h-4 border-2 border-yellow-600 rounded-sm opacity-50" />
    </div>
  );
};
