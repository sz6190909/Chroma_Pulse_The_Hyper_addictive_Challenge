export type GameStateStatus = 'idle' | 'tutorial' | 'playing' | 'gameover' | 'paused';

export type GameMode = 'standard' | 'daily' | 'challenge' | 'zen';

export type TargetType = 'normal' | 'bullseye' | 'glitch' | 'hazard' | 'fever';

export interface TargetSector {
  id: string;
  angle: number; // in radians, 0 to 2*PI
  arcWidth: number; // angular width in radians
  type: TargetType;
  color: string;
  glowColor: string;
  isHit?: boolean;
  scoreBonus: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  shape?: 'circle' | 'spark' | 'ring' | 'star';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  life: number;
  maxLife: number;
}

export interface ColorTheme {
  id: string;
  name: string;
  unlocked: boolean;
  reqScore?: number;
  accent: string;
  secondary: string;
  hazard: string;
  needle: string;
  bgRings: string;
  background: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  highScore: number;
  maxCombo: number;
  totalHits: number;
  bullseyeHits: number;
  totalPoints: number;
  feverCount: number;
  dailyStreak: number;
  lastDailyDate: string;
  dailyBestScore: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface ChallengeData {
  isChallenge: boolean;
  challengerName: string;
  targetScore: number;
  seed: number;
}
