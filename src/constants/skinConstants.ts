export interface BirdSkin {
  id: string;
  name: string;
  price: number;
  body: string;
  bodyDark: string;
  beak: string;
}

export const BIRD_SKINS: BirdSkin[] = [
  { id: 'yellow', name: 'Classic',  price: 0,   body: '#fbbf24', bodyDark: '#f59e0b', beak: '#ea580c' },
  { id: 'red',    name: 'Firebird', price: 50,  body: '#f87171', bodyDark: '#ef4444', beak: '#b45309' },
  { id: 'blue',   name: 'Sky',      price: 150, body: '#60a5fa', bodyDark: '#3b82f6', beak: '#f97316' },
  { id: 'green',  name: 'Forest',   price: 300, body: '#4ade80', bodyDark: '#22c55e', beak: '#f97316' },
  { id: 'purple', name: 'Royal',    price: 600, body: '#c084fc', bodyDark: '#a855f7', beak: '#f97316' },
];
