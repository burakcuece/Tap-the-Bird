import React, { useState, useEffect } from 'react';
import { BIRD_SKINS } from '../constants/skinConstants';
import { QuestPanel } from './QuestPanel';
import { QuestProgress } from '../types/questTypes';
import { getUnlockedSkins, unlockSkin, getCoins, subtractCoins } from '../utils/storage';
import { useGameSounds } from '../hooks/useGameSounds';

interface PauseMenuProps {
  onResume: () => void;
  onMainMenu: () => void;
  selectedSkinId: string;
  onSelectSkin: (id: string) => void;
  questProgress: QuestProgress[];
  onQuestsUpdate: (quests: QuestProgress[]) => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onMainMenu,
  selectedSkinId,
  onSelectSkin,
  questProgress,
  onQuestsUpdate,
}) => {
  const [tab, setTab] = useState<'shop' | 'quests'>('shop');
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const { playBuy } = useGameSounds();

  useEffect(() => {
    setUnlockedSkins(getUnlockedSkins());
    setTotalCoins(getCoins());
  }, []);

  const handleSkinClick = (e: React.MouseEvent, skinId: string, price: number) => {
    e.stopPropagation();
    if (unlockedSkins.includes(skinId)) {
      onSelectSkin(skinId);
    } else if (subtractCoins(price)) {
      unlockSkin(skinId);
      setUnlockedSkins(getUnlockedSkins());
      setTotalCoins(getCoins());
      onSelectSkin(skinId);
      playBuy();
    }
  };

  const handleCoinsEarned = (amount: number) => {
    setTotalCoins(prev => prev + amount);
  };

  const hasClaimable = questProgress.some(q => q.completed && !q.rewarded);

  return (
    <div
      className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-start z-50 overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      <div className="w-full px-4 pt-4 pb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="flex items-center gap-1.5 bg-white bg-opacity-15 hover:bg-opacity-25 text-white text-sm font-bold px-3 py-1.5 rounded-full transition-colors"
            onClick={e => { e.stopPropagation(); onMainMenu(); }}
          >
            ← Menü
          </button>
          <span className="text-white font-bold text-lg">Pause</span>
          <button
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold px-3 py-1.5 rounded-full transition-colors"
            onClick={e => { e.stopPropagation(); onResume(); }}
          >
            Weiter ▶
          </button>
        </div>

        {/* Coin display */}
        <div className="flex justify-center mb-3">
          <div className="flex bg-black bg-opacity-40 rounded-full px-4 py-1.5 items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-600" />
            <span className="text-white font-bold text-sm">{totalCoins} Münzen</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex justify-center gap-2 mb-3">
          <button
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              tab === 'shop' ? 'bg-yellow-400 text-black' : 'bg-white bg-opacity-20 text-white'
            }`}
            onClick={e => { e.stopPropagation(); setTab('shop'); }}
          >
            🛒 Shop
          </button>
          <button
            className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              tab === 'quests' ? 'bg-yellow-400 text-black' : 'bg-white bg-opacity-20 text-white'
            }`}
            onClick={e => { e.stopPropagation(); setTab('quests'); }}
          >
            📋 Missionen
            {hasClaimable && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Shop tab */}
        {tab === 'shop' && (
          <div>
            <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest mb-2 text-center">
              Skin Shop
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {BIRD_SKINS.map(skin => {
                const unlocked = unlockedSkins.includes(skin.id);
                const selected = selectedSkinId === skin.id;
                const canAfford = totalCoins >= skin.price;
                return (
                  <div
                    key={skin.id}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors cursor-pointer ${
                      selected ? 'bg-white bg-opacity-20' : 'bg-black bg-opacity-40 hover:bg-opacity-60'
                    }`}
                    onClick={e => handleSkinClick(e, skin.id, skin.price)}
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
                        <p className="text-[10px] text-green-400">
                          {selected ? '✓ Aktiv' : 'Entsperrt'}
                        </p>
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

        {/* Quests tab */}
        {tab === 'quests' && (
          <QuestPanel
            quests={questProgress}
            onQuestsUpdate={onQuestsUpdate}
            onCoinsEarned={handleCoinsEarned}
          />
        )}
      </div>
    </div>
  );
};
