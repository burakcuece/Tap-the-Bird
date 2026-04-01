export interface Pipe {
  x: number;
  height: number;
  passed: boolean;
  hasCoin: boolean;      // NEW: A pipe might have a coin centered in its gap
}

export interface GameState {
  score: number;
  leaderboard: number[];
  isNewHighScore: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  type: 'feather' | 'explosion';
}

export interface CoinEntity {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface PopupText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}