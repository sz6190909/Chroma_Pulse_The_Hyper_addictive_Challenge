import { ColorTheme } from '../types/game';
import { GameEngine } from './engine';
import { calculateGameRingRadius } from './constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private theme: ColorTheme;
  private breathPhase: number = 0;
  private width: number = typeof window !== 'undefined' ? window.innerWidth : 800;
  private height: number = typeof window !== 'undefined' ? window.innerHeight : 600;
  private dpr: number = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  constructor(canvas: HTMLCanvasElement, theme: ColorTheme) {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get canvas 2D context');
    this.ctx = context;
    this.theme = theme;
    this.updateDimensions();
  }

  public updateDimensions() {
    this.dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    this.width = typeof window !== 'undefined' ? window.innerWidth : 800;
    this.height = typeof window !== 'undefined' ? window.innerHeight : 600;
  }

  public setDimensions(width: number, height: number, dpr: number) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
  }

  public setTheme(theme: ColorTheme) {
    this.theme = theme;
  }

  /**
   * Main render pass
   */
  public render(engine: GameEngine) {
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    const cx = width / 2;
    const cy = height / 2;
    const ringRadius = calculateGameRingRadius(width, height);

    this.breathPhase += 0.02;

    ctx.save();
    // Scale drawings cleanly by DPR
    ctx.scale(this.dpr, this.dpr);

    // Apply Screen Shake
    if (engine.screenShake > 0) {
      const shakeMagnitude = engine.screenShake * 1.5;
      const sx = (Math.random() - 0.5) * shakeMagnitude;
      const sy = (Math.random() - 0.5) * shakeMagnitude;
      ctx.translate(sx, sy);
    }

    // 1. Draw Deep Cyber Background
    this.drawBackground(width, height, cx, cy, engine.isFeverActive);

    // 2. Draw Concentric Neon Track Rings
    this.drawTrackRings(cx, cy, ringRadius, engine.isFeverActive);

    // 3. Draw Active Targets (Hazard, Normal, Bullseye)
    if (engine.status === 'playing') {
      if (engine.hazardTarget && !engine.isFeverActive) {
        this.drawHazardSector(cx, cy, ringRadius, engine.hazardTarget.angle, engine.hazardTarget.arcWidth);
      }
      if (engine.currentTarget) {
        this.drawTargetSector(
          cx,
          cy,
          ringRadius,
          engine.currentTarget.angle,
          engine.currentTarget.arcWidth,
          engine.currentTarget.type,
          engine.currentTarget.color,
          engine.currentTarget.glowColor
        );
      }
    }

    // 4. Draw Center Energy Core
    this.drawCenterCore(cx, cy, ringRadius, engine.isFeverActive, engine.combo);

    // 5. Draw Orbiting Needle / Player Orb
    this.drawNeedle(cx, cy, ringRadius, engine.needleAngle, engine.isFeverActive);

    // 6. Draw Particle Bursts
    this.drawParticles(engine);

    // 7. Draw Floating Score & Combo Popups
    this.drawFloatingTexts(engine);

    ctx.restore();
  }

  private drawBackground(width: number, height: number, cx: number, cy: number, isFever: boolean) {
    const ctx = this.ctx;

    // Base background gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(width, height) * 0.7);
    if (isFever) {
      bgGrad.addColorStop(0, '#2d0922');
      bgGrad.addColorStop(0.5, '#17061a');
      bgGrad.addColorStop(1, '#09030c');
    } else {
      bgGrad.addColorStop(0, '#111728');
      bgGrad.addColorStop(0.6, '#0a0d17');
      bgGrad.addColorStop(1, this.theme.background);
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient background breathing halo
    const haloRadius = Math.min(width, height) * (0.35 + Math.sin(this.breathPhase) * 0.02);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
    ctx.fillStyle = isFever ? 'rgba(255, 45, 117, 0.08)' : 'rgba(0, 240, 255, 0.05)';
    ctx.fill();
    ctx.restore();
  }

  private drawTrackRings(cx: number, cy: number, ringRadius: number, isFever: boolean) {
    const ctx = this.ctx;
    ctx.save();

    // Outer subtle guide ring
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius + 30, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner subtle guide ring
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius - 30, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Main Orbit Track
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isFever ? 'rgba(255, 45, 117, 0.35)' : 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 3;
    ctx.shadowColor = isFever ? '#ff2d75' : '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.stroke();

    // Radial Tick Marks
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    const ticks = 24;
    for (let i = 0; i < ticks; i++) {
      const angle = (i * Math.PI * 2) / ticks;
      const r1 = ringRadius - 6;
      const r2 = ringRadius + 6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawTargetSector(
    cx: number,
    cy: number,
    ringRadius: number,
    angle: number,
    arcWidth: number,
    type: string,
    color: string,
    glowColor: string
  ) {
    const ctx = this.ctx;
    const startAngle = angle - arcWidth / 2;
    const endAngle = angle + arcWidth / 2;
    const bandWidth = 44;

    ctx.save();

    // Outer Glow Arc Band
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, startAngle, endAngle);
    ctx.lineWidth = bandWidth;
    ctx.strokeStyle = type === 'glitch' ? 'rgba(255, 45, 117, 0.35)' : 'rgba(0, 240, 255, 0.35)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Crisp inner track highlight
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, startAngle, endAngle);
    ctx.lineWidth = 7;
    ctx.strokeStyle = color;
    ctx.stroke();

    // Golden Bullseye Sweet Spot in exact center (±0.085 rad)
    const bullseyeWidth = 0.17;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, angle - bullseyeWidth / 2, angle + bullseyeWidth / 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffe600';
    ctx.shadowColor = '#ffe600';
    ctx.shadowBlur = 18;
    ctx.stroke();

    // Sweet Spot Center Jewel Marker
    const jewelX = cx + Math.cos(angle) * ringRadius;
    const jewelY = cy + Math.sin(angle) * ringRadius;
    ctx.beginPath();
    ctx.arc(jewelX, jewelY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fill();

    ctx.restore();
  }

  private drawHazardSector(cx: number, cy: number, ringRadius: number, angle: number, arcWidth: number) {
    const ctx = this.ctx;
    const startAngle = angle - arcWidth / 2;
    const endAngle = angle + arcWidth / 2;

    ctx.save();
    ctx.shadowColor = '#ff003c';
    ctx.shadowBlur = 16;

    // Red striped hazard arc
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, startAngle, endAngle);
    ctx.lineWidth = 36;
    ctx.strokeStyle = 'rgba(255, 0, 60, 0.35)';
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, startAngle, endAngle);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ff003c';
    ctx.stroke();

    // Hazard Marker
    const markX = cx + Math.cos(angle) * ringRadius;
    const markY = cy + Math.sin(angle) * ringRadius;
    ctx.fillStyle = '#ff003c';
    ctx.beginPath();
    ctx.arc(markX, markY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawCenterCore(cx: number, cy: number, ringRadius: number, isFever: boolean, combo: number) {
    const ctx = this.ctx;
    ctx.save();

    const coreRadius = Math.max(18, Math.min(ringRadius * 0.26, 38)) + Math.min(5, combo * 0.4);

    // Glowing core gradient
    const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, coreRadius);
    if (isFever) {
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#ff2d75');
      coreGrad.addColorStop(1, '#59062b');
      ctx.shadowColor = '#ff2d75';
    } else {
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, this.theme.accent);
      coreGrad.addColorStop(1, '#092135');
      ctx.shadowColor = this.theme.accent;
    }

    ctx.shadowBlur = isFever ? 30 : 15;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Pulse core ring
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.stroke();

    ctx.restore();
  }

  private drawNeedle(cx: number, cy: number, ringRadius: number, angle: number, isFever: boolean) {
    const ctx = this.ctx;
    const orbX = cx + Math.cos(angle) * ringRadius;
    const orbY = cy + Math.sin(angle) * ringRadius;

    ctx.save();

    // Laser ray connecting center to orbiting orb
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(orbX, orbY);
    ctx.lineWidth = isFever ? 3 : 2;
    ctx.strokeStyle = isFever ? 'rgba(255, 45, 117, 0.75)' : 'rgba(0, 240, 255, 0.55)';
    ctx.shadowColor = isFever ? '#ff2d75' : '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Radiant Player Orb
    ctx.beginPath();
    ctx.arc(orbX, orbY, isFever ? 12 : 9, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = isFever ? '#ff2d75' : '#00f0ff';
    ctx.shadowBlur = 24;
    ctx.fill();

    // Outer Aura Ring around player orb
    ctx.beginPath();
    ctx.arc(orbX, orbY, isFever ? 20 : 15, 0, Math.PI * 2);
    ctx.strokeStyle = isFever ? '#ffe600' : '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  private drawParticles(engine: GameEngine) {
    const ctx = this.ctx;
    ctx.save();

    for (const p of engine.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      if (p.shape === 'star') {
        ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2);
      } else if (p.shape === 'ring') {
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = p.color;
        ctx.stroke();
        continue;
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    ctx.restore();
  }

  private drawFloatingTexts(engine: GameEngine) {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const ft of engine.floatingTexts) {
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 12;

      const fontSize = Math.floor(22 * ft.scale);
      ctx.font = `800 ${fontSize}px "Space Grotesk", sans-serif`;
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();
  }
}
