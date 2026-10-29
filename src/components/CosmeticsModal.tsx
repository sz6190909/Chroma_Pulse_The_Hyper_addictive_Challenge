import React from 'react';
import { Sparkles, X, Lock, Check } from 'lucide-react';
import { ColorTheme } from '../types/game';
import { COLOR_THEMES } from '../utils/storage';
import { sound } from '../utils/audio';

interface CosmeticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: string;
  highScore: number;
  onSelectTheme: (theme: ColorTheme) => void;
}

export const CosmeticsModal: React.FC<CosmeticsModalProps> = ({
  isOpen,
  onClose,
  activeThemeId,
  highScore,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel-glow rounded-3xl p-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h2 className="text-xl font-black font-['Space_Grotesk'] text-white">THEMES & SKINS</h2>
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

        <p className="text-gray-400 text-xs mb-4">
          Score higher in any run to unlock legendary visual themes!
        </p>

        {/* Themes List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {COLOR_THEMES.map((theme) => {
            const isUnlocked = !theme.reqScore || highScore >= theme.reqScore;
            const isSelected = activeThemeId === theme.id;

            return (
              <div
                key={theme.id}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playClick();
                    onSelectTheme(theme);
                  }
                }}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : isUnlocked
                    ? 'bg-white/5 border-white/10 hover:border-white/30 cursor-pointer'
                    : 'bg-black/40 border-white/5 opacity-55'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Theme Color Palette Preview Dots */}
                  <div className="flex items-center -space-x-1">
                    <span
                      className="w-5 h-5 rounded-full border border-black/50"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-black/50"
                      style={{ backgroundColor: theme.secondary }}
                    />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{theme.name}</span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {isUnlocked
                        ? 'Unlocked & ready'
                        : `Unlock at ${theme.reqScore?.toLocaleString()} pts (Best: ${highScore})`}
                    </div>
                  </div>
                </div>

                {/* Right Status */}
                <div>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-black">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : isUnlocked ? (
                    <button className="text-[11px] font-bold text-gray-300 hover:text-white px-2 py-1 rounded-lg bg-white/5">
                      Equip
                    </button>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
