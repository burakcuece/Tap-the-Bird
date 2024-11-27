import React from 'react';
import { GameState } from '../types/gameTypes';

interface ScoreDisplayProps extends GameState {
  gameOver: boolean;
  gameStarted: boolean;
  onRestart: () => void;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  highScore,
  isNewHighScore,
  gameOver,
  gameStarted,
  onRestart,
}) => {
  return (
    <>
      <div className="absolute top-4 left-0 right-0 text-center">
        <div className="text-4xl font-bold text-white shadow-text">{score}</div>
        <div className="text-sm text-white shadow-text">High Score: {highScore}</div>
      </div>

      {(!gameStarted || gameOver) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              {gameOver ? (isNewHighScore ? 'New High Score!' : 'Game Over!') : 'Tap the Bird'}
            </h1>
            <p className="text-xl text-white mb-2">Score: {score}</p>
            <p className="text-xl text-white mb-4">High Score: {highScore}</p>
            <p className="text-white text-lg">
              {gameOver ? 'Tap to play again' : 'Tap to start'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};