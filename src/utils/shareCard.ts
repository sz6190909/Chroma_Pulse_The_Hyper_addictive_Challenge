import { ViralSharing } from './sharing';

export class ShareCardGenerator {
  /**
   * Generates a high-resolution 1200x630 share card canvas image
   */
  static generateCard(
    score: number,
    maxCombo: number,
    bullseyes: number,
    playerName: string = 'Reflex God'
  ): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      // Background Dark Cyber Gradient
      const bgGrad = ctx.createRadialGradient(600, 315, 50, 600, 315, 700);
      bgGrad.addColorStop(0, '#151b2e');
      bgGrad.addColorStop(0.6, '#0b0e17');
      bgGrad.addColorStop(1, '#05070a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 630);

      // Decorative Neon Grid & Rings
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      for (let r = 80; r <= 500; r += 70) {
        ctx.beginPath();
        ctx.arc(600, 315, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Glowing Outer Border
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 1140, 570);

      ctx.strokeStyle = 'rgba(255, 45, 117, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(38, 38, 1124, 554);

      // Header: Game Title
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Brand Glow
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 25;
      ctx.fillStyle = '#00f0ff';
      ctx.font = '900 42px "Space Grotesk", sans-serif';
      ctx.fillText('⚡ CHROMA PULSE ⚡', 600, 95);

      // Tagline
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 20px "Outfit", sans-serif';
      ctx.fillText('THE HYPER-REFLEX VIRAL ARCADE', 600, 138);

      // Score Value (Huge Neon)
      ctx.shadowColor = '#ff2d75';
      ctx.shadowBlur = 40;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 115px "Space Grotesk", sans-serif';
      ctx.fillText(score.toLocaleString(), 600, 260);

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ff2d75';
      ctx.font = '800 22px "Outfit", sans-serif';
      ctx.fillText('POINTS SCORED', 600, 325);

      // Rank Badge
      const rankInfo = ViralSharing.getRankTitle(score);
      ctx.fillStyle = 'rgba(18, 22, 36, 0.9)';
      ctx.strokeStyle = rankInfo.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(430, 360, 340, 50, 25);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = rankInfo.color;
      ctx.font = '800 22px "Outfit", sans-serif';
      ctx.fillText(`${rankInfo.badge} RANK: ${rankInfo.rank}`, 600, 385);

      // Stats Columns: Max Combo & Bullseyes
      // Left Stat Box: Max Combo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(220, 440, 340, 75, 12);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 18px "Outfit", sans-serif';
      ctx.fillText('MAX COMBO', 390, 465);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '800 32px "Space Grotesk", sans-serif';
      ctx.fillText(`${maxCombo}x`, 390, 495);

      // Right Stat Box: Bullseyes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(640, 440, 340, 75, 12);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 18px "Outfit", sans-serif';
      ctx.fillText('BULLSEYES HIT', 810, 465);

      ctx.fillStyle = '#ffe600';
      ctx.font = '800 32px "Space Grotesk", sans-serif';
      ctx.fillText(`${bullseyes}`, 810, 495);

      // Footer Challenge Call to Action
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 24px "Outfit", sans-serif';
      ctx.fillText(`⚔️ ${playerName} challenges you: "Can you beat my score?"`, 600, 560);

      resolve(canvas.toDataURL('image/png'));
    });
  }

  /**
   * Triggers download of the generated share card
   */
  static downloadCard(dataUrl: string, filename: string = 'chroma-pulse-score.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }
}
