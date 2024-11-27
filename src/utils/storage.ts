export const STORAGE_KEYS = {
  HIGH_SCORE: 'tapthebird_highscore',
} as const;

export const getStoredHighScore = (): number => {
  const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
  return stored ? parseInt(stored, 10) : 0;
};

export const setStoredHighScore = (score: number): void => {
  localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
};