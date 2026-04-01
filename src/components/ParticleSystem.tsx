import React from 'react';
import { Particle } from '../types/gameTypes';

interface ParticleSystemProps {
  particles: Particle[];
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ particles }) => {
  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.type === 'feather' ? p.size * 2.2 : p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '50%',
            opacity: p.life,
            transform: p.type === 'feather'
              ? `rotate(${Math.atan2(p.vy, p.vx) * (180 / Math.PI)}deg)`
              : undefined,
          }}
        />
      ))}
    </>
  );
};
