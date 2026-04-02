export type PowerUpType = 'magnet' | 'shield' | 'shrink';

export interface Pipe {
  x: number;
  height: number;
  passed: boolean;
  hasCoin: boolean;
  powerUp?: PowerUpType;  // optional power-up instead of coin
}

export interface ActivePowerUp {
  type: PowerUpType;
  framesLeft: number; // in game-loop ticks
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