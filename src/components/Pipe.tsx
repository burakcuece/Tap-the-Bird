import React from 'react';
import { PIPE_GAP, PIPE_WIDTH } from '../constants/gameConstants';

interface PipeProps {
  x: number;
  height: number;
}

export const Pipe: React.FC<PipeProps> = ({ x, height }) => {
  return (
    <React.Fragment>
      {/* Top pipe */}
      <div
        className="absolute w-[60px] bg-green-500 rounded-b-lg shadow-lg"
        style={{
          left: x,
          height: height,
          top: 0,
          width: PIPE_WIDTH,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-green-600 rounded-b-lg" />
      </div>
      {/* Bottom pipe */}
      <div
        className="absolute w-[60px] bg-green-500 rounded-t-lg shadow-lg"
        style={{
          left: x,
          top: height + PIPE_GAP,
          bottom: 0,
          width: PIPE_WIDTH,
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-4 bg-green-600 rounded-t-lg" />
      </div>
    </React.Fragment>
  );
};