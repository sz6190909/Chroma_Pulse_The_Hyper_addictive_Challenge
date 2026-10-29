import React from 'react';
import { Volume2, VolumeX, Trophy, Sparkles, Award, Shield } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  score: number;
  combo: number;
  lives: number;
  highScore: number;
  isFeverActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLeaderboard: () => void;
  onOpenThemes: () => void;
  onOpenAchievements: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  combo,
  lives,
  highScore,
  isFeverActive,
  isMuted,
  onToggleMute,
  onOpenLeaderboard,
  onOpenThemes,
  onOpenAchievements,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex flex-col p-4 pointer-events-none">
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto pointer-events-auto">
        {/* Left: High Score & Stats shortcut */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel arcade-btn text-xs font-bold text-gray-300 hover:text-cyan-400"
            title="Leaderboard & Best Scores"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>BEST: {highScore.toLocaleString()}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenAchievements();
            }}
            className="p-2 rounded-full glass-panel arcade-btn text-gray-300 hover:text-cyan-400"
            title="Achievements"
          >
            <Award className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenThemes();
            }}
            className="p-2 rounded-full glass-panel arcade-btn text-gray-300 hover:text-purple-400"
            title="Themes & Skins"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
          </button>
        </div>

        {/* Right: Sound & Lives */}
        <div className="flex items-center gap-3">
          {/* Lives Counter */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full glass-panel">
            {Array.from({ length: 3 }).map((_, i) => (
              <Shield
                key={i}
                className={`w-4 h-4 transition-all duration-300 ${
                  i < lives
                    ? 'text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]'
                    : 'text-gray-600 fill-transparent scale-75'
                }`}
              />
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-full glass-panel arcade-btn text-gray-300 hover:text-white"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Center Dynamic HUD: Score & Combo Multiplier */}
      <div className="flex flex-col items-center justify-center mt-2">
        <div className="text-center">
          <div
            className={`font-black tracking-tight text-5xl md:text-6xl font-['Space_Grotesk'] transition-transform duration-100 ${
              isFeverActive ? 'text-pink-400 scale-110 drop-shadow-[0_0_20px_rgba(255,45,117,0.8)]' : 'text-white'
            }`}
          >
            {score.toLocaleString()}
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            {combo > 1 && (
              <span
                className={`text-xs md:text-sm font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider animate-pulse ${
                  isFeverActive
                    ? 'bg-pink-600/40 text-pink-300 border border-pink-500/50'
                    : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {combo}x STREAK
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
