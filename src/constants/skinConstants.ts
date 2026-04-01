export interface BirdSkin {
  id: string;
  name: string;
  unlock: number;
  body: string;
  bodyDark: string;
  beak: string;
}

export const BIRD_SKINS: BirdSkin[] = [
  { id: 'yellow', name: 'Classic',  unlock: 0,   body: '#fbbf24', bodyDark: '#f59e0b', beak: '#ea580c' },
  { id: 'red',    name: 'Firebird', unlock: 10,  body: '#f87171', bodyDark: '#ef4444', beak: '#b45309' },
  { id: 'blue',   name: 'Sky',      unlock: 25,  body: '#60a5fa', bodyDark: '#3b82f6', beak: '#f97316' },
  { id: 'green',  name: 'Forest',   unlock: 50,  body: '#4ade80', bodyDark: '#22c55e', beak: '#f97316' },
  { id: 'purple', name: 'Royal',    unlock: 100, body: '#c084fc', bodyDark: '#a855f7', beak: '#f97316' },
];
