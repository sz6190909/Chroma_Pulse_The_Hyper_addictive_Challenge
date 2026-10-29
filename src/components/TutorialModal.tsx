import React from 'react';
import { Target, Zap, AlertTriangle, Play } from 'lucide-react';
import { sound } from '../utils/audio';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel-glow rounded-3xl p-6 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-3 tracking-wider uppercase">
          <Zap className="w-3.5 h-3.5" /> 5-Second Guide
        </div>

        <h2 className="text-3xl font-black font-['Space_Grotesk'] text-white tracking-tight mb-2">
          HOW TO PLAY
        </h2>
        <p className="text-gray-400 text-xs mb-6">
          Simple timing, insane speed. Master the rhythm.
        </p>

        {/* 3 Step Cards */}
        <div className="w-full flex flex-col gap-3 mb-6 text-left">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">1. Tap When Aligned</div>
              <div className="text-xs text-gray-400">Tap screen or press Space as the orb passes through the glowing zone.</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">2. Hit Golden Bullseye</div>
              <div className="text-xs text-gray-400">Aim for the center gem for 3x score and instant Fever charges.</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">3. Avoid Red Hazards</div>
              <div className="text-xs text-gray-400">Don't tap inside red zones or miss. You have 3 lives!</div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-black text-white text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] arcade-btn"
        >
          <Play className="w-5 h-5 fill-white" />
          GOT IT, LET'S PLAY!
        </button>
      </div>
    </div>
  );
};
