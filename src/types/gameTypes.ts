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