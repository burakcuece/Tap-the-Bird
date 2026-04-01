const LEADERBOARD_KEY = 'tapthebird_leaderboard';
const LEGACY_KEY = 'tapthebird_highscore';
const MAX_ENTRIES = 5;

export const getLeaderboard = (): number[] => {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (stored) return JSON.parse(stored) as number[];
    // Migrate legacy single high score
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