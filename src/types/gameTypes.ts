export interface Pipe {
  x: number;
  height: number;
  passed: boolean;
}

export interface GameState {
  score: number;
  highScore: number;
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