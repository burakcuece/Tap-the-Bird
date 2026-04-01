import React, { useState, useEffect } from 'react';
import { GameState } from '../types/gameTypes';
import { BIRD_SKINS } from '../constants/skinConstants';
import { getUnlockedSkins, unlockSkin, getCoins, subtractCoins } from '../utils/storage';
import { useGameSounds } from '../hooks/useGameSounds';

interface ScoreDisplayProps extends GameState {
  gameOver: boolean;
  gameStarted: boolean;
  scoreFlash: boolean;
  selectedSkinId: string;
  onSelectSkin: (id: string) => void;
  coinsGathered: number;
  combo: number;
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
  coinsGathered,
}) => {
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const { playBuy } = useGameSounds();

  useEffect(() => {
    if (!gameStarted || gameOver) {
      setUnlockedSkins(getUnlockedSkins());
      setTotalCoins(getCoins());
    }
  }, [gameStarted, gameOver]);

  const handleSkinClick = (skinId: string, price: number) => {
    if (unlockedSkins.includes(skinId)) {
      onSelectSkin(skinId);
    } else {
      if (subtractCoins(price)) {
        unlockSkin(skinId);
        setUnlockedSkins(getUnlockedSkins());
        setTotalCoins(getCoins());
        onSelectSkin(skinId);
        playBuy();
      }
    }
  };

  return (
    <>
      <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-start pointer-events-none">
        <div className="text-center w-full absolute left-0 right-0 top-0">
          <div
            className="text-4xl font-bold text-white shadow-text transition-transform duration-150 inline-block"
            style={{ transform: scoreFlash ? 'scale(1.4)' : 'scale(1)' }}
          >{score}</div>
        </div>
        <div className="flex bg-black bg-opacity-40 rounded-full px-3 py-1 items-center gap-1.5 ml-auto relative z-10">
          <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-600" />
          <span className="text-white font-bold text-sm">{totalCoins}</span>
        </div>
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
                <div className="flex gap-4 justify-center mb-4">
                  <div className="bg-black bg-opacity-40 rounded-xl px-4 py-2">
                    <p className="text-xs text-white opacity-70">SCORE</p>
                    <p className="text-xl font-bold text-white">{score}</p>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-xl px-4 py-2">
                    <p className="text-xs text-white opacity-70">COINS</p>
                    <p className="text-xl font-bold text-yellow-400">+{coinsGathered}</p>
                  </div>
                </div>

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
                  Skin Shop
                </p>
                <div className="flex gap-3 justify-center px-4 overflow-x-auto">
                  {BIRD_SKINS.map(skin => {
                    const unlocked = unlockedSkins.includes(skin.id);
                    const selected = selectedSkinId === skin.id;
                    const canAfford = totalCoins >= skin.price;
                    
                    return (
                      <div
                        key={skin.id}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors z-10 cursor-pointer ${
                          selected ? 'bg-white bg-opacity-20' : 'bg-black bg-opacity-40 hover:bg-opacity-60'
                        }`}
                        onClick={e => { e.stopPropagation(); handleSkinClick(skin.id, skin.price); }}
                      >
                        <div
                          className="w-10 h-10 rounded-full transition-transform mx-auto"
                          style={{
                            backgroundColor: skin.body,
                            boxShadow: selected ? `0 0 0 2px white, 0 0 0 4px ${skin.body}` : undefined,
                            transform: selected ? 'scale(1.1)' : 'scale(1)',
                            filter: !unlocked ? 'brightness(0.4)' : undefined,
                          }}
                        />
                        <div className="text-center mt-1">
                          <p className="text-white text-xs font-bold w-16 truncate">{skin.name}</p>
                          {unlocked ? (
                            <p className="text-[10px] text-green-400">Unlocked</p>
                          ) : (
                            <p className={`text-[10px] font-bold flex items-center justify-center gap-1 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                              {skin.price}
                            </p>
                          )}
                        </div>
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