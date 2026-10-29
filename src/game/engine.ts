import { FloatingText, GameMode, GameStateStatus, Particle, TargetSector, TargetType } from '../types/game';
import { PRNG } from '../utils/prng';
import { sound } from '../utils/audio';
import { calculateGameRingRadius } from './constants';

export interface GameEngineEvents {
  onScoreUpdate: (score: number, combo: number, feverPercent: number) => void;
  onLivesUpdate: (lives: number) => void;
  onGameOver: (finalScore: number, maxCombo: number, bullseyes: number) => void;
  onFeverToggle: (isActive: boolean) => void;
  onAchievementCheck: (action: string, data: Record<string, unknown>) => void;
}

export class GameEngine {
  // Game states
  public status: GameStateStatus = 'idle';
  public mode: GameMode = 'standard';
  public score: number = 0;
  public combo: number = 1;
  public maxCombo: number = 1;
  public bullseyeCount: number = 0;
  public totalHits: number = 0;
  public lives: number = 3;
  public feverMeter: number = 0;
  public isFeverActive: boolean = false;
  public feverTimeRemaining: number = 0;

  // Needle Physics
  public needleAngle: number = 0;
  public needleSpeed: number = 2.4; // radians per second
  public needleDirection: number = 1; // 1: CW, -1: CCW
  public baseSpeed: number = 2.4;

  // Active targets
  public currentTarget: TargetSector | null = null;
  public hazardTarget: TargetSector | null = null;

  // Juice & Visual feedback
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public screenShake: number = 0;

  // Seeded Random
  public prng: PRNG;
  public currentSeed: number;

  private events: GameEngineEvents;
  private lastTimestamp: number = 0;
  private animFrameId: number | null = null;

  constructor(events: GameEngineEvents, seed?: number, mode: GameMode = 'standard') {
    this.events = events;
    this.mode = mode;
    this.currentSeed = seed ?? (mode === 'daily' ? PRNG.getDailySeed() : Math.floor(Math.random() * 1000000));
    this.prng = new PRNG(this.currentSeed);
  }

  public start(seed?: number) {
    if (seed !== undefined) {
      this.currentSeed = seed;
    } else if (this.mode === 'daily') {
      this.currentSeed = PRNG.getDailySeed();
    } else {
      this.currentSeed = Math.floor(Math.random() * 1000000);
    }
    this.prng = new PRNG(this.currentSeed);

    this.score = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.bullseyeCount = 0;
    this.totalHits = 0;
    this.lives = this.mode === 'zen' ? 999 : 3;
    this.feverMeter = 0;
    this.isFeverActive = false;
    this.feverTimeRemaining = 0;
    this.needleAngle = 0;
    this.needleDirection = 1;
    this.needleSpeed = this.baseSpeed;
    this.particles = [];
    this.floatingTexts = [];
    this.screenShake = 0;
    this.status = 'playing';

    // Spawn first target ahead of needle
    this.spawnNextTarget();

    this.events.onScoreUpdate(this.score, this.combo, 0);
    this.events.onLivesUpdate(this.lives);
    this.events.onFeverToggle(false);

    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  public restart() {
    this.stop();
    this.start();
  }

  public stop() {
    this.status = 'idle';
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * Main game physics tick
   */
  public update(dt: number) {
    if (this.status !== 'playing') return;

    // Advance needle rotation
    this.needleAngle += this.needleDirection * this.needleSpeed * dt;
    this.needleAngle = ((this.needleAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // Dynamic speed ramp based on score
    const targetSpeed = Math.min(6.5, this.baseSpeed + this.score * 0.0035 + (this.isFeverActive ? 0.8 : 0));
    this.needleSpeed += (targetSpeed - this.needleSpeed) * 0.05;

    // Decay screen shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Fever timer handling
    if (this.isFeverActive) {
      this.feverTimeRemaining -= dt;
      this.feverMeter = Math.max(0, (this.feverTimeRemaining / 8.0) * 100);
      if (this.feverTimeRemaining <= 0) {
        this.isFeverActive = false;
        this.feverMeter = 0;
        this.events.onFeverToggle(false);
      }
      this.events.onScoreUpdate(this.score, this.combo, this.feverMeter);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life += dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= dt * 45;
      ft.scale = Math.min(1.2, ft.scale + dt * 0.5);
      ft.life += dt;
      ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /**
   * Primary Player Action: Tap, Click, or Spacebar
   */
  public handleAction(canvasWidth: number, canvasHeight: number) {
    if (this.status !== 'playing') {
      if (this.status === 'idle' || this.status === 'gameover') {
        this.start();
      }
      return;
    }

    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const radius = calculateGameRingRadius(canvasWidth, canvasHeight);

    // Check hazard collision first
    if (this.hazardTarget && !this.isFeverActive) {
      const hazardDelta = this.getAngularDistance(this.needleAngle, this.hazardTarget.angle);
      if (hazardDelta <= this.hazardTarget.arcWidth / 2) {
        // Hit Hazard!
        this.triggerMiss(cx, cy, 'HAZARD HIT!', radius);
        return;
      }
    }

    // Check current target collision
    if (!this.currentTarget) return;

    const delta = this.getAngularDistance(this.needleAngle, this.currentTarget.angle);
    const targetHalfArc = this.currentTarget.arcWidth / 2;

    if (delta <= targetHalfArc) {
      // Successful hit!
      const isBullseye = delta <= 0.085; // Sweet spot in center
      const hitX = cx + Math.cos(this.needleAngle) * radius;
      const hitY = cy + Math.sin(this.needleAngle) * radius;

      this.triggerHit(isBullseye, hitX, hitY);
    } else {
      // Empty Miss!
      this.triggerMiss(cx, cy, 'MISS!', radius);
    }
  }

  private triggerHit(isBullseye: boolean, x: number, y: number) {
    this.totalHits++;
    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    const multiplier = this.isFeverActive ? 3 : Math.min(8, Math.floor(1 + this.combo / 4));
    let points = isBullseye ? 30 : 10;
    if (this.currentTarget?.type === 'glitch') points += 15;
    points *= multiplier;

    this.score += points;

    if (isBullseye) {
      this.bullseyeCount++;
      sound.playPerfect(this.combo);
      this.screenShake = 6;
      this.addFloatingText(`+${points} PERFECT!`, x, y - 20, '#ffe600', 1.2);
      this.spawnExplosion(x, y, '#ffe600', 28, 'star');
      this.feverMeter = Math.min(100, this.feverMeter + 25);
    } else {
      sound.playHit(this.combo);
      this.screenShake = 3;
      this.addFloatingText(`+${points}`, x, y - 15, '#00f0ff', 1.0);
      this.spawnExplosion(x, y, '#00f0ff', 16, 'spark');
      this.feverMeter = Math.min(100, this.feverMeter + 10);
    }

    // Reverse spin mechanic for glitch targets
    if (this.currentTarget?.type === 'glitch') {
      this.needleDirection *= -1;
      sound.playGlitch();
      this.addFloatingText('REVERSE!', x, y - 40, '#ff2d75', 1.1);
      this.spawnExplosion(x, y, '#ff2d75', 20, 'ring');
    }

    // Fever Activation Check
    if (this.feverMeter >= 100 && !this.isFeverActive) {
      this.isFeverActive = true;
      this.feverTimeRemaining = 8.0;
      sound.playFever();
      this.screenShake = 12;
      this.addFloatingText('🔥 FEVER OVERDRIVE! 🔥', x, y - 60, '#ff007f', 1.4);
      this.events.onFeverToggle(true);
      this.events.onAchievementCheck('fever', {});
    }

    // Notify state listeners
    this.events.onScoreUpdate(this.score, this.combo, this.feverMeter);
    this.events.onAchievementCheck('hit', {
      hits: this.totalHits,
      combo: this.combo,
      bullseyes: this.bullseyeCount,
      score: this.score,
    });

    // Spawn next target
    this.spawnNextTarget();
  }

  private triggerMiss(cx: number, cy: number, reason: string, radius: number) {
    sound.playMiss();
    this.screenShake = 14;
    this.combo = 1;
    this.feverMeter = Math.max(0, this.feverMeter - 20);

    const needleX = cx + Math.cos(this.needleAngle) * radius;
    const needleY = cy + Math.sin(this.needleAngle) * radius;

    this.addFloatingText(reason, needleX, needleY - 20, '#ff003c', 1.2);
    this.spawnExplosion(needleX, needleY, '#ff003c', 25, 'spark');

    if (this.mode !== 'zen') {
      this.lives--;
      this.events.onLivesUpdate(this.lives);

      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
    }

    this.events.onScoreUpdate(this.score, this.combo, this.feverMeter);
  }

  private gameOver() {
    this.status = 'gameover';
    sound.playGameOver();
    this.events.onGameOver(this.score, this.maxCombo, this.bullseyeCount);
  }

  /**
   * Spawns next target ahead in the needle's travel trajectory
   */
  private spawnNextTarget() {
    // Determine target arc size (gradually tighter as score scales, but never impossibly tiny)
    const arcWidth = Math.max(0.38, 0.65 - this.score * 0.00035);

    // Random distance ahead: 1.0 to 2.3 radians in direction of travel
    const forwardDistance = this.prng.range(1.0, 2.3);
    let nextAngle = this.needleAngle + this.needleDirection * forwardDistance;
    nextAngle = ((nextAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // Determine target type
    let type: TargetType = 'normal';
    let color = '#00f0ff';
    let glowColor = 'rgba(0, 240, 255, 0.8)';

    if (this.prng.chance(0.22)) {
      type = 'glitch';
      color = '#ff2d75';
      glowColor = 'rgba(255, 45, 117, 0.85)';
    }

    this.currentTarget = {
      id: Math.random().toString(36).substring(2, 9),
      angle: nextAngle,
      arcWidth: arcWidth,
      type: type,
      color: color,
      glowColor: glowColor,
      scoreBonus: 10,
    };

    // Chance to spawn a hazard zone (only if score > 150 and not in fever mode)
    if (this.score > 150 && !this.isFeverActive && this.prng.chance(0.4)) {
      // Place hazard halfway between or opposite
      const hazardAngle = (nextAngle + Math.PI * (this.prng.chance(0.5) ? 0.7 : 1.3)) % (Math.PI * 2);
      this.hazardTarget = {
        id: 'hazard_' + Math.random().toString(36).substring(2, 9),
        angle: hazardAngle,
        arcWidth: 0.35,
        type: 'hazard',
        color: '#ff003c',
        glowColor: 'rgba(255, 0, 60, 0.8)',
        scoreBonus: 0,
      };
    } else {
      this.hazardTarget = null;
    }
  }

  /**
   * Calculates shortest angular distance between two angles on a circle [0, PI]
   */
  public getAngularDistance(a1: number, a2: number): number {
    let diff = Math.abs(a1 - a2) % (Math.PI * 2);
    if (diff > Math.PI) {
      diff = Math.PI * 2 - diff;
    }
    return diff;
  }

  private spawnExplosion(
    x: number,
    y: number,
    color: string,
    count: number,
    shape: 'circle' | 'spark' | 'ring' | 'star' = 'spark'
  ) {
    for (let i = 0; i < count; i++) {
      const speed = Math.random() * 5 + 2;
      const angle = Math.random() * Math.PI * 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 0.4 + 0.3,
        shape: shape,
      });
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string, scale: number = 1.0) {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text: text,
      x: x,
      y: y,
      color: color,
      alpha: 1,
      scale: scale,
      life: 0,
      maxLife: 0.7,
    });
  }

  private loop = (timestamp: number) => {
    const dt = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
    this.lastTimestamp = timestamp;

    this.update(dt);

    if (this.status === 'playing' || this.particles.length > 0 || this.floatingTexts.length > 0) {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  };
}
