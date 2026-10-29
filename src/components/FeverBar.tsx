import React from 'react';
import { Flame } from 'lucide-react';

interface FeverBarProps {
  percent: number;
  isFeverActive: boolean;
}

export const FeverBar: React.FC<FeverBarProps> = ({ percent, isFeverActive }) => {
  return (
    <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center pointer-events-none px-6">
      <div className="w-full max-w-xs flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-between w-full text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
          <div className="flex items-center gap-1">
            <Flame
              className={`w-3.5 h-3.5 ${
                isFeverActive ? 'text-pink-400 animate-bounce' : percent > 50 ? 'text-yellow-400' : 'text-gray-500'
              }`}
            />
            <span className={isFeverActive ? 'text-pink-400 font-black' : ''}>
              {isFeverActive ? 'FEVER OVERDRIVE (3X)' : 'FEVER METER'}
            </span>
          </div>
          <span>{Math.round(percent)}%</span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-2.5 bg-gray-900/80 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              isFeverActive
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 shadow-[0_0_15px_rgba(255,45,117,0.8)]'
                : 'bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-[0_0_10px_rgba(0,240,255,0.5)]'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Hint text */}
        <div className="text-[10px] text-gray-500 tracking-wider">
          {isFeverActive ? 'TRI-PULSE POINTS ACTIVE!' : 'HIT BULLSEYES TO FILL FEVER'}
        </div>
      </div>
    </div>
  );
};
