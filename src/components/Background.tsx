import React from 'react';
import { GROUND_HEIGHT } from '../constants/gameConstants';

interface BackgroundProps {
  scrollOffset: number;
}

const CLOUDS = [
  { x: 30,  y: 55,  width: 90,  height: 38 },
  { x: 180, y: 90,  width: 65,  height: 28 },
  { x: 310, y: 45,  width: 110, height: 42 },
  { x: 500, y: 75,  width: 75,  height: 32 },
  { x: 650, y: 105, width: 95,  height: 36 },
  { x: 820, y: 58,  width: 80,  height: 30 },
];

const CLOUD_LOOP = 900;
const GRASS_TILE = 40;
const DIRT_TILE = 60;

export const Background: React.FC<BackgroundProps> = ({ scrollOffset }) => {
  const cloudOffset = scrollOffset * 0.4;

  return (
    <>
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #38bdf8 0%, #7dd3fc 55%, #bae6fd 100%)',
        }}
      />

      {/* Scrolling clouds */}
      {CLOUDS.map((cloud, i) => {
        const x = ((cloud.x - (cloudOffset % CLOUD_LOOP)) % CLOUD_LOOP + CLOUD_LOOP) % CLOUD_LOOP;
        if (x > 420) return null;
        return (
          <div key={i} className="absolute" style={{ left: x, top: cloud.y, width: cloud.width, height: cloud.height }}>
            <div className="absolute inset-0 bg-white rounded-full opacity-90" />
            <div
              className="absolute bg-white rounded-full opacity-90"
              style={{
                width: cloud.width * 0.6,
                height: cloud.height * 1.4,
                top: -(cloud.height * 0.35),
                left: cloud.width * 0.2,
              }}
            />
          </div>
        );
      })}

      {/* Scrolling ground */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: GROUND_HEIGHT }}>

        {/* Dirt body */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{
            top: 18,
            backgroundImage: 'repeating-linear-gradient(90deg, #e8c98a 0px, #e8c98a 30px, #dbb870 30px, #dbb870 60px)',
            backgroundPositionX: `${-(scrollOffset % DIRT_TILE)}px`,
          }}
        />

        {/* Dirt depth lines for 3D feel */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: 30,
            height: 4,
            backgroundImage: 'repeating-linear-gradient(90deg, #c9a45a 0px, #c9a45a 30px, #ba9348 30px, #ba9348 60px)',
            backgroundPositionX: `${-(scrollOffset % DIRT_TILE)}px`,
            opacity: 0.5,
          }}
        />
        <div
          className="absolute left-0 right-0"
          style={{
            top: 50,
            height: 3,
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
          }}
        />

        {/* Grass highlight (top edge shimmer) */}
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
