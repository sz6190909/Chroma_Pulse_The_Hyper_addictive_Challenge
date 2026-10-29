import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Share2, Download, Trophy, Flame, Target, Swords, Check } from 'lucide-react';
import { ChallengeData } from '../types/game';
import { ViralSharing } from '../utils/sharing';
import { ShareCardGenerator } from '../utils/shareCard';
import { sound } from '../utils/audio';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  maxCombo: number;
  bullseyes: number;
  seed: number;
  isNewHigh: boolean;
  challengeData: ChallengeData;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  highScore,
  maxCombo,
  bullseyes,
  seed,
  isNewHigh,
  challengeData,
  onRestart,
}) => {
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [challengerNameInput, setChallengerNameInput] = useState('Player');

  const rankInfo = ViralSharing.getRankTitle(score);
  const beatChallenger = challengeData.isChallenge && score > challengeData.targetScore;

  useEffect(() => {
    if (isOpen) {
      if (isNewHigh || beatChallenger) {
        // Fire celebration confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00f0ff', '#ff2d75', '#ffe600', '#00ff66'],
          });
        } catch (e) {
          console.warn('Confetti error', e);
        }
      }
    }
  }, [isOpen, isNewHigh, beatChallenger]);

  if (!isOpen) return null;

  const handleShareChallenge = async () => {
    sound.playClick();
    const result = await ViralSharing.shareScore(score, seed, challengerNameInput);
    if (result.copiedToClipboard || result.success) {
      setCopiedToast(result.message);
      setTimeout(() => setCopiedToast(null), 3500);
    }
  };

  const handleDownloadCard = async () => {
    sound.playClick();
    setIsGeneratingCard(true);
    try {
      const dataUrl = await ShareCardGenerator.generateCard(score, maxCombo, bullseyes, challengerNameInput);
      if (dataUrl) {
        ShareCardGenerator.downloadCard(dataUrl, `chroma-pulse-${score}.png`);
        setCopiedToast('Score card image downloaded!');
        setTimeout(() => setCopiedToast(null), 3000);
      }
    } finally {
      setIsGeneratingCard(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md glass-panel-glow rounded-3xl p-6 text-center flex flex-col items-center my-auto">
        {/* Challenge Victory or Status Banner */}
        {challengeData.isChallenge && (
          <div
            className={`w-full py-2 px-3 rounded-2xl mb-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider ${
              beatChallenger
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                : 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300'
            }`}
          >
            <Swords className="w-4 h-4" />
            {beatChallenger
              ? `🔥 YOU CRUSHED ${challengeData.challengerName.toUpperCase()}'S SCORE!`
              : `RIVAL SCORE: ${challengeData.targetScore.toLocaleString()} (Gap: ${(challengeData.targetScore - score).toLocaleString()})`}
          </div>
        )}

        {/* New Record Banner */}
        {isNewHigh && !challengeData.isChallenge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-black tracking-wider uppercase mb-2 animate-bounce">
            <Trophy className="w-3.5 h-3.5" /> NEW PERSONAL BEST!
          </div>
        )}

        {/* Score Title & Big Number */}
        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">FINAL SCORE</div>
        <div className="text-6xl font-black font-['Space_Grotesk'] text-white tracking-tight mb-2 drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]">
          {score.toLocaleString()}
        </div>

        {/* Rank Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-5"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${rankInfo.color}`,
            color: rankInfo.color,
          }}
        >
          <span>{rankInfo.badge}</span>
          <span>RANK: {rankInfo.rank}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 w-full mb-5">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
            <Flame className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] text-gray-400 uppercase font-bold">Max Combo</span>
            <span className="text-lg font-black text-white font-['Space_Grotesk']">{maxCombo}x</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
            <Target className="w-4 h-4 text-yellow-400 mb-1" />
            <span className="text-[10px] text-gray-400 uppercase font-bold">Bullseyes</span>
            <span className="text-lg font-black text-white font-['Space_Grotesk']">{bullseyes}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
            <Trophy className="w-4 h-4 text-pink-400 mb-1" />
            <span className="text-[10px] text-gray-400 uppercase font-bold">Best Score</span>
            <span className="text-lg font-black text-white font-['Space_Grotesk']">
              {Math.max(score, highScore).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action 1: Instant Restart Button */}
        <button
          onClick={() => {
            sound.playClick();
            onRestart();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-black text-white text-base tracking-wide flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(0,240,255,0.4)] arcade-btn mb-3"
        >
          <RotateCcw className="w-5 h-5" />
          <span>PLAY AGAIN</span>
          <span className="text-[11px] font-normal text-cyan-200 opacity-80">(or press Space)</span>
        </button>

        {/* Action 2: Challenge a Friend Section */}
        <div className="w-full p-3.5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-pink-950/30 border border-purple-500/30 flex flex-col gap-2.5 mb-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-300">
            <span className="flex items-center gap-1.5 text-pink-400">
              <Swords className="w-4 h-4" /> Challenge a Friend
            </span>
            <input
              type="text"
              value={challengerNameInput}
              onChange={(e) => setChallengerNameInput(e.target.value.slice(0, 15))}
              placeholder="Your Name"
              className="bg-black/50 border border-white/10 rounded-lg px-2 py-0.5 text-xs text-white text-right focus:outline-none focus:border-pink-500 w-28"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareChallenge}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-bold text-white text-xs flex items-center justify-center gap-1.5 arcade-btn shadow-[0_0_15px_rgba(255,45,117,0.3)]"
            >
              <Share2 className="w-4 h-4" />
              <span>SEND CHALLENGE</span>
            </button>

            <button
              onClick={handleDownloadCard}
              disabled={isGeneratingCard}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-gray-200 text-xs flex items-center justify-center gap-1.5 arcade-btn border border-white/10"
              title="Download Share Card Image"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>CARD</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {copiedToast && (
          <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 bg-emerald-950/80 border border-emerald-500/40 py-1.5 px-3 rounded-full animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>{copiedToast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
