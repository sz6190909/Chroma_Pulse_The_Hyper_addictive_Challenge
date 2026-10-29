import { Achievement, ColorTheme, PlayerStats } from '../types/game';

const STATS_KEY = 'chroma_pulse_stats';
const THEME_KEY = 'chroma_pulse_theme';
const ACHIEVEMENTS_KEY = 'chroma_pulse_achievements';
const LEADERBOARD_KEY = 'chroma_pulse_leaderboard';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  maxCombo: number;
  date: string;
  mode: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    unlocked: true,
    accent: '#00f0ff',
    secondary: '#ff2d75',
    hazard: '#ff003c',
    needle: '#ffffff',
    bgRings: 'rgba(0, 240, 255, 0.15)',
    background: '#090a0f',
  },
  {
    id: 'synthwave',
    name: 'Synthwave 84',
    unlocked: false,
    reqScore: 300,
    accent: '#ff2d75',
    secondary: '#b026ff',
    hazard: '#ffaa00',
    needle: '#00f0ff',
    bgRings: 'rgba(255, 45, 117, 0.15)',
    background: '#0d0914',
  },
  {
    id: 'solareclipse',
    name: 'Solar Flare',
    unlocked: false,
    reqScore: 600,
    accent: '#ffe600',
    secondary: '#ff5e00',
    hazard: '#9900ff',
    needle: '#ffffff',
    bgRings: 'rgba(255, 230, 0, 0.15)',
    background: '#120d04',
  },
  {
    id: 'matrix',
    name: 'Emerald Matrix',
    unlocked: false,
    reqScore: 1000,
    accent: '#00ff66',
    secondary: '#00e1ff',
    hazard: '#ff1493',
    needle: '#ffffff',
    bgRings: 'rgba(0, 255, 102, 0.15)',
    background: '#041009',
  },
  {
    id: 'starlight',
    name: 'Starlight Void',
    unlocked: false,
    reqScore: 1500,
    accent: '#e0aaff',
    secondary: '#7b2cbf',
    hazard: '#ff0055',
    needle: '#ffffff',
    bgRings: 'rgba(224, 170, 255, 0.2)',
    background: '#080512',
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_hit',
    title: 'First Spark',
    description: 'Hit your very first pulse target.',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'combo_5',
    title: 'Flow State',
    description: 'Reach a 5x combo streak.',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'combo_15',
    title: 'Pulse Master',
    description: 'Reach an insane 15x combo streak.',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'bullseye_streak',
    title: 'Deadly Precision',
    description: 'Score 3 Bullseyes in a single run.',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'fever_mode',
    title: 'Overdrive',
    description: 'Trigger Fever Mode.',
    icon: '🌟',
    unlocked: false,
  },
  {
    id: 'score_500',
    title: 'High Roller',
    description: 'Score 500 points in one session.',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'score_1000',
    title: 'Cyber Legend',
    description: 'Score 1,000 points in one session.',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'daily_done',
    title: 'Daily Challenger',
    description: 'Complete a Daily Seed Challenge.',
    icon: '📅',
    unlocked: false,
  },
];

const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  highScore: 0,
  maxCombo: 0,
  totalHits: 0,
  bullseyeHits: 0,
  totalPoints: 0,
  feverCount: 0,
  dailyStreak: 0,
  lastDailyDate: '',
  dailyBestScore: 0,
};

export class StorageManager {
  static getStats(): PlayerStats {
    try {
      const data = localStorage.getItem(STATS_KEY);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  }

  static saveStats(stats: PlayerStats) {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save stats to localStorage', e);
    }
  }

  static getActiveThemeId(): string {
    return localStorage.getItem(THEME_KEY) || 'cyberpunk';
  }

  static setActiveThemeId(themeId: string) {
    localStorage.setItem(THEME_KEY, themeId);
  }

  static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (!data) return INITIAL_ACHIEVEMENTS;
      const parsed: Achievement[] = JSON.parse(data);
      // Merge with INITIAL_ACHIEVEMENTS to handle newly added achievements
      return INITIAL_ACHIEVEMENTS.map((init) => {
        const found = parsed.find((p) => p.id === init.id);
        return found ? { ...init, ...found } : init;
      });
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  }

  static saveAchievements(achievements: Achievement[]) {
    try {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch (e) {
      console.warn('Failed to save achievements', e);
    }
  }

  static getLeaderboard(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(LEADERBOARD_KEY);
      if (!data) {
        // Return starter challenge records
        return [
          { id: '1', name: 'CyberGhost', score: 1450, maxCombo: 18, date: 'Today', mode: 'standard' },
          { id: '2', name: 'NeonBlade', score: 980, maxCombo: 12, date: 'Yesterday', mode: 'standard' },
          { id: '3', name: 'Vortex_X', score: 720, maxCombo: 9, date: '2d ago', mode: 'daily' },
        ];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static addLeaderboardScore(entry: Omit<LeaderboardEntry, 'id'>): LeaderboardEntry[] {
    const list = this.getLeaderboard();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
    };
    const updated = [...list, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save leaderboard', e);
    }
    return updated;
  }
}
