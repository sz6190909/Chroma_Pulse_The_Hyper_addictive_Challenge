import React from 'react';
import { Trophy, Calendar, X, Play } from 'lucide-react';
import { LeaderboardEntry } from '../utils/storage';
import { sound } from '../utils/audio';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  dailyBestScore: number;
  onStartDaily: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  dailyBestScore,
  onStartDaily,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel-glow rounded-3xl p-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-black font-['Space_Grotesk'] text-white">RECORDS & RANKINGS</h2>
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

        {/* Daily Challenge Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-cyan-950/40 border border-cyan-500/30 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Today's Global Run</div>
              <div className="text-[10px] text-gray-400">
                {dailyBestScore > 0 ? `Today's Best: ${dailyBestScore.toLocaleString()} pts` : 'Same seed for all players today!'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onStartDaily();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs flex items-center gap-1 arcade-btn"
          >
            <Play className="w-3 h-3 fill-black" />
            PLAY
          </button>
        </div>

        {/* Scores List */}
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hall of Fame</div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">No records yet. Play a game to make history!</div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-center font-black text-sm ${
                      index === 0
                        ? 'text-yellow-400 font-extrabold'
                        : index === 1
                        ? 'text-gray-300'
                        : index === 2
                        ? 'text-amber-600'
                        : 'text-gray-500'
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{entry.name}</span>
                      {entry.mode === 'daily' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-500/30">
                          DAILY
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400">{entry.maxCombo}x streak • {entry.date}</div>
                  </div>
                </div>

                <div className="text-sm font-black text-cyan-400 font-['Space_Grotesk']">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
