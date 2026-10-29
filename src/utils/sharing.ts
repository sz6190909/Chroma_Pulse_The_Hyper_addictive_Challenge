import { ChallengeData } from '../types/game';

export class ViralSharing {
  /**
   * Parse challenge parameters from current window URL
   */
  static parseChallengeFromUrl(): ChallengeData {
    if (typeof window === 'undefined') {
      return { isChallenge: false, challengerName: '', targetScore: 0, seed: 0 };
    }

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const challenger = params.get('challenger');
    const score = parseInt(params.get('score') || '0', 10);
    const seed = parseInt(params.get('seed') || '0', 10);

    if (mode === 'challenge' && score > 0 && seed > 0) {
      return {
        isChallenge: true,
        challengerName: challenger ? decodeURIComponent(challenger) : 'A Rival',
        targetScore: score,
        seed: seed,
      };
    }

    return { isChallenge: false, challengerName: '', targetScore: 0, seed: 0 };
  }

  /**
   * Create a challenge link for friends with matching seed & target score
   */
  static createChallengeUrl(score: number, seed: number, challengerName: string = 'Champion'): string {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('mode', 'challenge');
    url.searchParams.set('score', score.toString());
    url.searchParams.set('seed', seed.toString());
    url.searchParams.set('challenger', encodeURIComponent(challengerName.trim() || 'A Friend'));
    return url.toString();
  }

  /**
   * Share challenge or score using native Web Share API or Clipboard copy
   */
  static async shareScore(
    score: number,
    seed: number,
    challengerName: string = 'Player'
  ): Promise<{ success: boolean; copiedToClipboard: boolean; message: string }> {
    const challengeUrl = this.createChallengeUrl(score, seed, challengerName);
    const shareText = `⚡ I just dropped ${score.toLocaleString()} points in CHROMA PULSE! Think your reflexes can beat mine? Tap to accept the challenge:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CHROMA PULSE Challenge',
          text: shareText,
          url: challengeUrl,
        });
        return { success: true, copiedToClipboard: false, message: 'Challenge shared!' };
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          return { success: false, copiedToClipboard: false, message: 'Share canceled' };
        }
        // Fallback to clipboard on error
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(`${shareText}\n${challengeUrl}`);
      return {
        success: true,
        copiedToClipboard: true,
        message: 'Challenge link copied to clipboard! Paste it to a friend.',
      };
    } catch {
      return {
        success: false,
        copiedToClipboard: false,
        message: 'Could not copy link automatically. URL: ' + challengeUrl,
      };
    }
  }

  /**
   * Determine Rank Tier based on score
   */
  static getRankTitle(score: number): { rank: string; badge: string; color: string } {
    if (score >= 1500) return { rank: 'OVERDRIVE GOD', badge: '👑', color: '#ffd700' };
    if (score >= 1000) return { rank: 'CYBER TITAN', badge: '💎', color: '#00f0ff' };
    if (score >= 600) return { rank: 'HYPER PHANTOM', badge: '⚡', color: '#ff2d75' };
    if (score >= 300) return { rank: 'REFLEX PILOT', badge: '🔥', color: '#00ff66' };
    if (score >= 100) return { rank: 'APPRENTICE', badge: '🎯', color: '#ffe600' };
    return { rank: 'INITIATE', badge: '🌱', color: '#94a3b8' };
  }
}
