import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Calendar, HelpCircle, Swords, Zap } from 'lucide-react';
import { GameEngine } from './game/engine';
import { GameCanvas } from './components/GameCanvas';
import { Header } from './components/Header';
import { FeverBar } from './components/FeverBar';
import { TutorialModal } from './components/TutorialModal';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CosmeticsModal } from './components/CosmeticsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { Achievement, ChallengeData, ColorTheme, GameMode, PlayerStats } from './types/game';
import { COLOR_THEMES, StorageManager, LeaderboardEntry } from './utils/storage';
import { ViralSharing } from './utils/sharing';
import { sound } from './utils/audio';
import { PRNG } from './utils/prng';

export function App() {
  // Game State
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [feverPercent, setFeverPercent] = useState<number>(0);
  const [isFeverActive, setIsFeverActive] = useState<boolean>(false);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [finalBullseyes, setFinalBullseyes] = useState<number>(0);
  const [finalMaxCombo, setFinalMaxCombo] = useState<number>(1);
  const [currentSeed, setCurrentSeed] = useState<number>(12345);

  // Persistence & Customization
  const [stats, setStats] = useState<PlayerStats>(StorageManager.getStats());
  const [activeTheme, setActiveTheme] = useState<ColorTheme>(() => {
    const savedId = StorageManager.getActiveThemeId();
    return COLOR_THEMES.find((t) => t.id === savedId) || COLOR_THEMES[0];
  });
  const [achievements, setAchievements] = useState<Achievement[]>(StorageManager.getAchievements());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(StorageManager.getLeaderboard());
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // Modals
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showThemes, setShowThemes] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);

  // Viral Challenge Detection
  const [challengeData, setChallengeData] = useState<ChallengeData>({
    isChallenge: false,
    challengerName: '',
    targetScore: 0,
    seed: 0,
  });

  const engineRef = useRef<GameEngine | null>(null);

  // Achievement unlock helper
  const unlockAchievement = useCallback((id: string) => {
    setAchievements((prev) => {
      const idx = prev.findIndex((a) => a.id === id);
      if (idx !== -1 && !prev[idx].unlocked) {
        const next = [...prev];
        next[idx] = { ...next[idx], unlocked: true, unlockedAt: new Date().toISOString() };
        StorageManager.saveAchievements(next);
        return next;
      }
      return prev;
    });
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback(
    (finalScore: number, maxComboReached: number, bullseyesReached: number) => {
      setGameState('gameover');
      setFinalBullseyes(bullseyesReached);
      setFinalMaxCombo(maxComboReached);

      const isNew = finalScore > stats.highScore;
      setIsNewHigh(isNew);

      // Update player statistics
      const updatedStats: PlayerStats = {
        ...stats,
        gamesPlayed: stats.gamesPlayed + 1,
        highScore: Math.max(stats.highScore, finalScore),
        maxCombo: Math.max(stats.maxCombo, maxComboReached),
        totalHits: stats.totalHits + bullseyesReached,
        bullseyeHits: stats.bullseyeHits + bullseyesReached,
        totalPoints: stats.totalPoints + finalScore,
      };

      if (gameMode === 'daily') {
        const todayStr = new Date().toISOString().split('T')[0];
        updatedStats.lastDailyDate = todayStr;
        updatedStats.dailyBestScore = Math.max(stats.dailyBestScore || 0, finalScore);
        unlockAchievement('daily_done');
      }

      setStats(updatedStats);
      StorageManager.saveStats(updatedStats);

      // Save to local leaderboard if decent score
      if (finalScore >= 50) {
        const updatedLeaderboard = StorageManager.addLeaderboardScore({
          name: challengeData.isChallenge ? 'You (Challenger)' : 'You',
          score: finalScore,
          maxCombo: maxComboReached,
          date: 'Just now',
          mode: gameMode,
        });
        setLeaderboard(updatedLeaderboard);
      }

      // Check final score achievements
      if (finalScore >= 500) unlockAchievement('score_500');
      if (finalScore >= 1000) unlockAchievement('score_1000');
    },
    [stats, gameMode, challengeData, unlockAchievement]
  );

  // Check achievements during game
  const handleAchievementCheck = useCallback(
    (action: string, data: Record<string, unknown>) => {
      if (action === 'hit') {
        unlockAchievement('first_hit');
        const c = Number(data.combo || 1);
        const b = Number(data.bullseyes || 0);
        if (c >= 5) unlockAchievement('combo_5');
        if (c >= 15) unlockAchievement('combo_15');
        if (b >= 3) unlockAchievement('bullseye_streak');
      } else if (action === 'fever') {
        unlockAchievement('fever_mode');
      }
    },
    [unlockAchievement]
  );

  // Initialize GameEngine once
  useEffect(() => {
    const parsedChallenge = ViralSharing.parseChallengeFromUrl();
    if (parsedChallenge.isChallenge) {
      setChallengeData(parsedChallenge);
      setGameMode('challenge');
      setCurrentSeed(parsedChallenge.seed);
    }

    const engine = new GameEngine(
      {
        onScoreUpdate: (newScore, newCombo, newFever) => {
          setScore(newScore);
          setCombo(newCombo);
          setFeverPercent(newFever);
        },
        onLivesUpdate: (newLives) => {
          setLives(newLives);
        },
        onGameOver: handleGameOver,
        onFeverToggle: (active) => {
          setIsFeverActive(active);
        },
        onAchievementCheck: handleAchievementCheck,
      },
      parsedChallenge.isChallenge ? parsedChallenge.seed : undefined,
      parsedChallenge.isChallenge ? 'challenge' : 'standard'
    );

    engineRef.current = engine;

    // First visit tutorial check
    const hasSeenTutorial = localStorage.getItem('chroma_pulse_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('chroma_pulse_tutorial_seen', 'true');
    }

    return () => {
      engine.stop();
    };
  }, [handleGameOver, handleAchievementCheck]);

  // Start a new game session
  const startGame = useCallback(
    (modeToStart: GameMode = gameMode, specificSeed?: number) => {
      if (!engineRef.current) return;

      setGameMode(modeToStart);
      engineRef.current.mode = modeToStart;

      let seed = specificSeed;
      if (seed === undefined) {
        if (modeToStart === 'daily') {
          seed = PRNG.getDailySeed();
        } else if (modeToStart === 'challenge' && challengeData.isChallenge) {
          seed = challengeData.seed;
        } else {
          seed = Math.floor(Math.random() * 1000000);
        }
      }

      setCurrentSeed(seed);
      setGameState('playing');
      setScore(0);
      setCombo(1);
      setLives(modeToStart === 'zen' ? 999 : 3);
      setFeverPercent(0);
      setIsFeverActive(false);
      setIsNewHigh(false);

      sound.playClick();
      engineRef.current.start(seed);
    },
    [gameMode, challengeData]
  );

  // Primary Input Handler (Canvas click or Space key)
  const handlePrimaryAction = useCallback(() => {
    if (showTutorial || showLeaderboard || showThemes || showAchievements) return;

    if (gameState === 'playing' && engineRef.current) {
      engineRef.current.handleAction(window.innerWidth, window.innerHeight);
    } else if (gameState === 'idle' || gameState === 'gameover') {
      startGame();
    }
  }, [gameState, showTutorial, showLeaderboard, showThemes, showAchievements, startGame]);

  // Spacebar and keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePrimaryAction();
      } else if (e.code === 'KeyM') {
        const muted = sound.toggleMute();
        setIsMuted(muted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrimaryAction]);

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleSelectTheme = (theme: ColorTheme) => {
    setActiveTheme(theme);
    StorageManager.setActiveThemeId(theme.id);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#08090d] select-none text-white font-game">
      {/* Dynamic Visual Canvas */}
      <GameCanvas
        engine={engineRef.current}
        theme={activeTheme}
        onCanvasClick={handlePrimaryAction}
      />

      {/* Top HUD Header */}
      <Header
        score={score}
        combo={combo}
        lives={lives}
        highScore={stats.highScore}
        isFeverActive={isFeverActive}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenThemes={() => setShowThemes(true)}
        onOpenAchievements={() => setShowAchievements(true)}
      />

      {/* Bottom Fever Progress Bar */}
      {gameState === 'playing' && (
        <FeverBar percent={feverPercent} isFeverActive={isFeverActive} />
      )}

      {/* Start / Idle Screen Menu */}
      {gameState === 'idle' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] pointer-events-auto overflow-y-auto">
          {/* Active Rival Challenge Banner */}
          {challengeData.isChallenge && (
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-pink-950/80 to-purple-950/80 border border-pink-500/50 shadow-[0_0_25px_rgba(255,45,117,0.4)] flex items-center gap-3 animate-pulse">
              <Swords className="w-6 h-6 text-pink-400 shrink-0" />
              <div className="text-left">
                <div className="text-xs font-bold uppercase text-pink-300">⚔️ RIVAL CHALLENGE</div>
                <div className="text-sm font-black text-white">
                  {challengeData.challengerName} challenged you to beat{' '}
                  <span className="text-yellow-400">{challengeData.targetScore.toLocaleString()}</span> pts!
                </div>
              </div>
            </div>
          )}

          {/* Title Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-black tracking-widest uppercase mb-2">
              <Zap className="w-3.5 h-3.5" /> 30-Second Arcade Sensation
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-['Space_Grotesk'] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 drop-shadow-[0_0_30px_rgba(0,240,255,0.4)]">
              CHROMA PULSE
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
              Tap the exact millisecond the orb aligns with the glowing sector.
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => startGame('standard')}
            className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-black text-white text-lg tracking-wider flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,240,255,0.45)] arcade-btn mb-3"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>PLAY NOW</span>
          </button>
          <div className="text-[11px] text-gray-500 mb-6 font-semibold">
            Tap screen or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300">SPACE</kbd>
          </div>

          {/* Secondary Game Modes */}
          <div className="flex items-center gap-2.5 w-full max-w-xs">
            <button
              onClick={() => startGame('daily')}
              className="flex-1 py-2.5 rounded-xl glass-panel arcade-btn flex items-center justify-center gap-1.5 text-xs font-bold text-gray-300 hover:text-cyan-400"
            >
              <Calendar className="w-3.5 h-3.5 text-yellow-400" />
              <span>Daily Run</span>
            </button>

            <button
              onClick={() => setShowTutorial(true)}
              className="px-4 py-2.5 rounded-xl glass-panel arcade-btn flex items-center justify-center gap-1.5 text-xs font-bold text-gray-300 hover:text-cyan-400"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>How To Play</span>
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={gameState === 'gameover'}
        score={score}
        highScore={stats.highScore}
        maxCombo={finalMaxCombo}
        bullseyes={finalBullseyes}
        seed={currentSeed}
        isNewHigh={isNewHigh}
        challengeData={challengeData}
        onRestart={() => startGame(gameMode)}
      />

      {/* Modals */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        entries={leaderboard}
        dailyBestScore={stats.dailyBestScore || 0}
        onStartDaily={() => startGame('daily')}
      />

      <CosmeticsModal
        isOpen={showThemes}
        onClose={() => setShowThemes(false)}
        activeThemeId={activeTheme.id}
        highScore={stats.highScore}
        onSelectTheme={handleSelectTheme}
      />

      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={achievements}
      />
    </div>
  );
}

export default App;
