import React from 'react';
import { Award, X, CheckCircle, Circle } from 'lucide-react';
import { Achievement } from '../types/game';
import { sound } from '../utils/audio';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel-glow rounded-3xl p-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-black font-['Space_Grotesk'] text-white">ACHIEVEMENTS</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress summary */}
        <div className="text-xs text-gray-400 mb-4 flex items-center justify-between">
          <span>Unlocked {unlockedCount} of {achievements.length}</span>
          <span className="font-bold text-cyan-400">{Math.round((unlockedCount / achievements.length) * 100)}%</span>
        </div>

        {/* Achievements list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                ach.unlocked
                  ? 'bg-cyan-950/40 border-cyan-500/30'
                  : 'bg-white/5 border-white/5 opacity-55'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                    ach.unlocked ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-black/40'
                  }`}
                >
                  {ach.icon}
                </div>
                <div>
                  <div className={`text-xs font-bold ${ach.unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {ach.title}
                  </div>
                  <div className="text-[10px] text-gray-400">{ach.description}</div>
                </div>
              </div>

              <div>
                {ach.unlocked ? (
                  <CheckCircle className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
