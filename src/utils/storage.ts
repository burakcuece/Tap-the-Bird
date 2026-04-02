const LEADERBOARD_KEY = 'tapthebird_leaderboard';
const LEGACY_KEY = 'tapthebird_highscore';
const COINS_KEY = 'tapthebird_coins';
const UNLOCKED_SKINS_KEY = 'tapthebird_unlocked_skins';
const MAX_ENTRIES = 5;

export const getLeaderboard = (): number[] => {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (stored) return JSON.parse(stored) as number[];
    const legacy = localStorage.getItem(LEGACY_KEY);
    return legacy ? [parseInt(legacy, 10)] : [];
  } catch {
    return [];
  }
};

export const getSelectedSkinId = (): string =>
  localStorage.getItem('tapthebird_skin') ?? 'yellow';

export const setSelectedSkinId = (id: string): void =>
  localStorage.setItem('tapthebird_skin', id);

export const addLeaderboardEntry = (score: number): number[] => {
  const updated = [...getLeaderboard(), score]
    .sort((a, b) => b - a)
    .slice(0, MAX_ENTRIES);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  return updated;
};

export const getCoins = (): number => {
  const stored = localStorage.getItem(COINS_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

export const addCoins = (amount: number): number => {
  const current = getCoins();
  const updated = current + amount;
  localStorage.setItem(COINS_KEY, updated.toString());
  return updated;
};

export const subtractCoins = (amount: number): boolean => {
  const current = getCoins();
  if (current >= amount) {
    localStorage.setItem(COINS_KEY, (current - amount).toString());
    return true;
  }
  return false;
};

export const getUnlockedSkins = (): string[] => {
  try {
    const stored = localStorage.getItem(UNLOCKED_SKINS_KEY);
    return stored ? JSON.parse(stored) as string[] : ['yellow'];
  } catch {
    return ['yellow'];
  }
};

export const unlockSkin = (id: string): void => {
  const current = getUnlockedSkins();
  if (!current.includes(id)) {
    localStorage.setItem(UNLOCKED_SKINS_KEY, JSON.stringify([...current, id]));
  }
};

// ── Quest persistence ────────────────────────────────────────────────────────
import type { QuestId, QuestProgress } from '../types/questTypes';
import { QUESTS } from '../types/questTypes';

const QUEST_KEY = 'tapthebird_quests';

export const getQuestProgress = (): QuestProgress[] => {
  try {
    const stored = localStorage.getItem(QUEST_KEY);
    if (stored) return JSON.parse(stored) as QuestProgress[];
  } catch { /* ignore */ }
  return QUESTS.map(q => ({ id: q.id, progress: 0, completed: false, rewarded: false }));
};

const saveQuestProgress = (quests: QuestProgress[]): void => {
  localStorage.setItem(QUEST_KEY, JSON.stringify(quests));
};

/** Increment progress for one quest. Returns updated list + coins to award (if newly rewarded). */
export const incrementQuest = (id: QuestId, amount = 1): { quests: QuestProgress[]; coinsEarned: number } => {
  const quest = QUESTS.find(q => q.id === id)!;
  const quests = getQuestProgress().map(qp => {
    if (qp.id !== id || qp.completed) return qp;
    const newProgress = Math.min(qp.progress + amount, quest.goal);
    return { ...qp, progress: newProgress, completed: newProgress >= quest.goal };
  });
  saveQuestProgress(quests);
  return { quests, coinsEarned: 0 };
};

/** Claim reward for a completed, un-rewarded quest. Returns coins awarded. */
export const claimQuestReward = (id: QuestId): number => {
  const quest = QUESTS.find(q => q.id === id)!;
  const quests = getQuestProgress().map(qp => {
    if (qp.id === id && qp.completed && !qp.rewarded) return { ...qp, rewarded: true };
    return qp;
  });
  saveQuestProgress(quests);
  addCoins(quest.reward);
  return quest.reward;
};