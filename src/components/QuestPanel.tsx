import React from 'react';
import { QUESTS } from '../types/questTypes';
import { QuestProgress, claimQuestReward } from '../utils/storage';

interface QuestPanelProps {
  quests: QuestProgress[];
  onQuestsUpdate: (quests: QuestProgress[]) => void;
  onCoinsEarned: (amount: number) => void;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({ quests, onQuestsUpdate, onCoinsEarned }) => {
  const handleClaim = (e: React.MouseEvent, id: import('../types/questTypes').QuestId) => {
    e.stopPropagation();
    const coins = claimQuestReward(id);
    onCoinsEarned(coins);
    // reload from storage so rewarded flag is reflected
    onQuestsUpdate(quests.map(q => q.id === id ? { ...q, rewarded: true } : q));
  };

  return (
    <div className="w-full px-3">
      <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest mb-2 text-center">
        Tägliche Missionen
      </p>
      <div className="flex flex-col gap-1.5">
        {QUESTS.map(quest => {
          const qp = quests.find(q => q.id === quest.id) ?? { id: quest.id, progress: 0, completed: false, rewarded: false };
          const pct = Math.min(100, Math.round((qp.progress / quest.goal) * 100));
          const canClaim = qp.completed && !qp.rewarded;

          return (
            <div
              key={quest.id}
              className={`rounded-lg px-3 py-1.5 text-left ${qp.rewarded ? 'bg-white bg-opacity-5 opacity-50' : 'bg-black bg-opacity-40'}`}
            >
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-white text-xs font-bold">{quest.label}</span>
                <span className="text-yellow-400 text-xs font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                  +{quest.reward}
                </span>
              </div>
              <p className="text-white text-[10px] opacity-60 mb-1">{quest.description}</p>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-white bg-opacity-20 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    background: qp.completed ? '#4ade80' : '#facc15',
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-[10px] text-white opacity-50">{qp.progress}/{quest.goal}</span>
                {canClaim && (
                  <button
                    className="text-[10px] bg-yellow-400 text-black font-bold rounded px-2 py-0.5 pointer-events-auto"
                    onClick={e => handleClaim(e, quest.id)}
                  >
                    Abholen!
                  </button>
                )}
                {qp.rewarded && (
                  <span className="text-[10px] text-green-400 font-bold">✓ Erhalten</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
