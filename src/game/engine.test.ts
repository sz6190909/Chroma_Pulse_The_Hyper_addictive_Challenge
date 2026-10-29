import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PRNG } from '../utils/prng';
import { GameEngine } from './engine';
import { ViralSharing } from '../utils/sharing';

describe('PRNG (Mulberry32)', () => {
  it('should generate deterministic sequence with same seed', () => {
    const prng1 = new PRNG(424242);
    const prng2 = new PRNG(424242);

    for (let i = 0; i < 20; i++) {
      assert.strictEqual(prng1.next(), prng2.next());
    }
  });

  it('should generate values within bounded ranges', () => {
    const prng = new PRNG(999);
    for (let i = 0; i < 50; i++) {
      const val = prng.range(1.5, 4.5);
      assert.ok(val >= 1.5 && val < 4.5, `Value ${val} out of bounds`);
    }
  });

  it('should generate consistent daily seed for a date', () => {
    const seed1 = PRNG.getDailySeed('2026-10-29');
    const seed2 = PRNG.getDailySeed('2026-10-29');
    assert.strictEqual(seed1, seed2);
    assert.ok(seed1 > 0);
  });
});

describe('GameEngine Angular Math & Physics', () => {
  const dummyEvents = {
    onScoreUpdate: () => {},
    onLivesUpdate: () => {},
    onGameOver: () => {},
    onFeverToggle: () => {},
    onAchievementCheck: () => {},
  };

  it('calculates angular distance correctly across circle boundaries', () => {
    const engine = new GameEngine(dummyEvents, 12345, 'standard');

    // Identical angles
    assert.strictEqual(engine.getAngularDistance(1.0, 1.0), 0);

    // Delta of 0.5 rad
    assert.ok(Math.abs(engine.getAngularDistance(1.0, 1.5) - 0.5) < 0.0001);

    // Wrap around 0 and 2*PI boundary
    const nearZero = 0.05;
    const nearTwoPi = Math.PI * 2 - 0.05;
    const wrappedDistance = engine.getAngularDistance(nearZero, nearTwoPi);
    assert.ok(Math.abs(wrappedDistance - 0.1) < 0.0001, `Distance was ${wrappedDistance}`);
  });

  it('initializes with 3 lives and 0 score in standard mode', () => {
    const engine = new GameEngine(dummyEvents, 55555, 'standard');
    engine.start();
    assert.strictEqual(engine.lives, 3);
    assert.strictEqual(engine.score, 0);
    assert.strictEqual(engine.combo, 1);
    assert.strictEqual(engine.status, 'playing');
    assert.ok(engine.currentTarget !== null);
    engine.stop();
  });
});

describe('Viral Sharing Logic', () => {
  it('correctly maps score tiers to ranks', () => {
    assert.strictEqual(ViralSharing.getRankTitle(1600).rank, 'OVERDRIVE GOD');
    assert.strictEqual(ViralSharing.getRankTitle(1100).rank, 'CYBER TITAN');
    assert.strictEqual(ViralSharing.getRankTitle(700).rank, 'HYPER PHANTOM');
    assert.strictEqual(ViralSharing.getRankTitle(350).rank, 'REFLEX PILOT');
    assert.strictEqual(ViralSharing.getRankTitle(120).rank, 'APPRENTICE');
    assert.strictEqual(ViralSharing.getRankTitle(20).rank, 'INITIATE');
  });
});
