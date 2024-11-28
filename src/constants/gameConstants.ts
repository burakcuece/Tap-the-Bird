export const BIRD_HEIGHT = 28; // Reduced from 32
export const BIRD_WIDTH = 28; // Reduced from 32
export const PIPE_WIDTH = 60;
export const PIPE_GAP = 180;
export const GRAVITY = 0.4;
export const JUMP_FORCE = -7;
export const PIPE_SPEED = 2.5;
export const BIRD_X = 50;

// Added hitbox offset constants for more precise collision
export const HITBOX_OFFSET = {
  X: 4,
  Y: 4,
};

export const PIPE_CONFIG = {
  MIN_HEIGHT: 50,
  MAX_HEIGHT: 250,
  SPAWN_X: 400,
  SPAWN_DISTANCE: 220,
};