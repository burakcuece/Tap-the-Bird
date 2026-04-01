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