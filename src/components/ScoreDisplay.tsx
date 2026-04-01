import React from 'react';
import { GameState } from '../types/gameTypes';
import { BIRD_SKINS } from '../constants/skinConstants';

interface ScoreDisplayProps extends GameState {
  gameOver: boolean;
  gameStarted: boolean;
  scoreFlash: boolean;
  selectedSkinId: string;
  onSelectSkin: (id: string) => void;
}

const MEDALS = [
  { threshold: 50, label: 'GOLD',   outer: '#ffd700', inner: '#ffaa00', shine: '#fff176', text: '#7a5200' },
  { threshold: 25, label: 'SILBER', outer: '#d4d4d4', inner: '#a8a8a8', shine: '#ffffff', text: '#444444' },
  { threshold: 10, label: 'BRONZE', outer: '#cd7f32', inner: '#a0522d', shine: '#f0a868', text: '#5c2a00' },
];

const Medal: React.FC<{ score: number }> = ({ score }) => {
  const medal = MEDALS.find(m => score >= m.threshold);
  if (!medal) return null;

  return (
    <div className="flex flex-col items-center mb-3">
      {/* Ribbon */}
      <div className="flex gap-0.5 mb-0.5">
        <div className="w-4 h-4" style={{ backgroundColor: medal.outer, clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        <div className="w-4 h-4" style={{ backgroundColor: medal.inner, clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
      </div>
      {/* Coin */}
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 56, height: 56,
          background: `radial-gradient(circle at 35% 35%, ${medal.shine}, ${medal.outer} 45%, ${medal.inner})`,
          boxShadow: `0 3px 8px rgba(0,0,0,0.5), inset 0 1px 2px ${medal.shine}`,
        }}
      >
        {/* Inner ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 44, height: 44,
            border: `2px solid ${medal.inner}`,
            opacity: 0.6,
          }}
        />
        <span className="text-xs font-black tracking-tight" style={{ color: medal.text, fontSize: 10 }}>
          {medal.label}
        </span>
      </div>
    </div>
  );
};

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  leaderboard,
  isNewHighScore,
  gameOver,
  gameStarted,
  scoreFlash,
  selectedSkinId,
  onSelectSkin,
}) => {
  const bestScore = leaderboard[0] ?? 0;

  return (
    <>
      <div className="absolute top-4 left-0 right-0 text-center">
        <div
          className="text-4xl font-bold text-white shadow-text transition-transform duration-150"
          style={{ transform: scoreFlash ? 'scale(1.4)' : 'scale(1)' }}
        >{score}</div>
        <div className="text-sm text-white shadow-text">Best: {bestScore}</div>
      </div>

      {(!gameStarted || gameOver) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              {gameOver ? (isNewHighScore ? 'New High Score!' : 'Game Over!') : 'Tap the Bird'}
            </h1>

            {gameOver && (
              <>
                <Medal score={score} />
                <p className="text-lg text-white mb-2">Score: {score}</p>

                {leaderboard.length > 0 && (
                  <div className="mx-auto mb-3 w-36">
                    <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest mb-1">
                      Top Scores
                    </p>
                    <div className="bg-black bg-opacity-40 rounded-lg overflow-hidden">
                      {leaderboard.map((s, i) => {
                        const isCurrentRun = gameOver && s === score && i === leaderboard.indexOf(score);
                        return (
                          <div
                            key={i}
                            className={`flex justify-between px-3 py-0.5 text-sm ${
                              isCurrentRun
                                ? 'bg-yellow-400 bg-opacity-30 text-yellow-200 font-bold'
                                : 'text-white'
                            }`}
                          >
                            <span className="opacity-60">#{i + 1}</span>
                            <span>{s}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {!gameOver && (
              <div className="mt-3 mb-2">
                <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest mb-2">
                  Bird auswählen
                </p>
                <div className="flex gap-2 justify-center">
                  {BIRD_SKINS.map(skin => {
                    const unlocked = bestScore >= skin.unlock;
                    const selected = selectedSkinId === skin.id;
                    return (
                      <div
                        key={skin.id}
                        className="flex flex-col items-center gap-0.5 cursor-pointer"
                        onClick={e => { e.stopPropagation(); if (unlocked) onSelectSkin(skin.id); }}
                      >
                        <div
                          className="w-8 h-8 rounded-full transition-transform"
                          style={{
                            backgroundColor: unlocked ? skin.body : '#6b7280',
                            boxShadow: selected ? `0 0 0 2px white, 0 0 0 4px ${skin.body}` : undefined,
                            transform: selected ? 'scale(1.2)' : 'scale(1)',
                            filter: unlocked ? undefined : 'grayscale(1)',
                            opacity: unlocked ? 1 : 0.5,
                          }}
                        />
                        <span className="text-white opacity-60" style={{ fontSize: 8 }}>
                          {unlocked ? skin.name : `${skin.unlock}+`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-white text-lg mt-1">
              {gameOver ? 'Tap to play again' : 'Tap to start'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};