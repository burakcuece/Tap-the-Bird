export type QuestId =
  | 'play_5_rounds'
  | 'collect_20_coins'
  | 'combo_3'
  | 'score_10'
  | 'use_powerup';

export interface Quest {
  id: QuestId;
  label: string;
  description: string;
  goal: number;
  reward: number; // coins awarded on completion
}

export interface QuestProgress {
  id: QuestId;
  progress: number;
  completed: boolean;
  rewarded: boolean;
}

export const QUESTS: Quest[] = [
  { id: 'play_5_rounds',    label: 'Frequent Flyer',  description: 'Spiele 5 Runden',            goal: 5,  reward: 30 },
  { id: 'collect_20_coins', label: 'Münzsammler',     description: 'Sammle 20 Münzen',           goal: 20, reward: 50 },
  { id: 'combo_3',          label: 'Combo-König',     description: 'Erreiche eine 3er Combo',    goal: 3,  reward: 40 },
  { id: 'score_10',         label: 'Anfänger-Ass',    description: 'Erreiche Score 10',          goal: 10, reward: 25 },
  { id: 'use_powerup',      label: 'Power-Held',      description: 'Nutze 3 Power-Ups',          goal: 3,  reward: 60 },
];
