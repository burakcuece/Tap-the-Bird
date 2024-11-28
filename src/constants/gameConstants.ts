export const BIRD_HEIGHT = 28;
export const BIRD_WIDTH = 28;
export const PIPE_WIDTH = 60;
export const PIPE_GAP = 180;
export const GRAVITY = 0.25; // Reduced from 0.4 for gentler falling
export const JUMP_FORCE = -6; // Adjusted for smoother jumps
export const PIPE_SPEED = 2.5;
export const BIRD_X = 50;

export const INITIAL_BIRD_POSITION = 250;
export const INITIAL_BIRD_VELOCITY = 0;

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