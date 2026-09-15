import { describe, it, expect } from 'vitest';
import {
  MIN_FREQ,
  MAX_FREQ,
  MIN_GAIN,
  MAX_GAIN,
  WIDTH_MAP,
  FREQUENCY_LANDMARKS,
  FREQUENCY_ZONES,
  formatFreq,
  getFrequencyZone,
  calculateEqualLoudnessGain,
  calculateHeadroom,
  freqToX,
  xToFreq,
  gainToY,
  yToGain,
  getBiquadFilterCoeffs,
  calculateCombinedFilterResponse,
  exportToEqualizerAPO,
  exportToWavelet,
  exportToTable,
  importFromEqualizerAPO,
} from '../eqMath';
import { EQFix } from '../../types/audio';

const makeFix = (overrides: Partial<EQFix> = {}): EQFix => ({
  id: 'fix-test',
  frequency: 1000,
  gain: -3,
  width: 'normal',
  q: 1.41,
  filterType: 'peaking',
  enabled: true,
  ...overrides,
});

const shelfFix = (): EQFix =>
  makeFix({
    id: 'fix-shelf',
    frequency: 105,
    gain: 4.5,
    q: 0.71,
    width: 'wide',
    filterType: 'lowshelf',
    label: 'Harman Bass Shelf',
  });

/** Evaluate a biquad's magnitude response (in dB) at one frequency. */
function responseAtDb(fix: EQFix, freq: number, sampleRate = 48000): number {
  const points = new Float32Array([freq]);
  const [db] = calculateCombinedFilterResponse([fix], points, sampleRate);
  return db;
}

// ---------------------------------------------------------------------------
// Constants & static data
// ---------------------------------------------------------------------------

describe('constants', () => {
  it('defines a sane audible range and gain range', () => {
    expect(MIN_FREQ).toBe(20);
    expect(MAX_FREQ).toBe(20000);
    expect(MIN_GAIN).toBeLessThan(0);
    expect(MAX_GAIN).toBeGreaterThan(0);
    expect(MIN_GAIN).toBe(-MAX_GAIN);
  });

  it('maps each filter width to a distinct Q in ascending order', () => {
    expect(WIDTH_MAP.wide.q).toBeLessThan(WIDTH_MAP.normal.q);
    expect(WIDTH_MAP.normal.q).toBeLessThan(WIDTH_MAP.narrow.q);
  });
});

describe('FREQUENCY_LANDMARKS', () => {
  it('contains only in-range frequencies', () => {
    for (const lm of FREQUENCY_LANDMARKS) {
      expect(lm.exactFreq).toBeGreaterThanOrEqual(MIN_FREQ);
      expect(lm.exactFreq).toBeLessThanOrEqual(MAX_FREQ);
    }
  });

  it('has bilingual names and descriptions', () => {
    for (const lm of FREQUENCY_LANDMARKS) {
      expect(lm.name.length).toBeGreaterThan(0);
      expect((lm.nameZh ?? '').length).toBeGreaterThan(0);
      expect(lm.desc.length).toBeGreaterThan(0);
      expect((lm.descZh ?? '').length).toBeGreaterThan(0);
    }
  });
});

describe('FREQUENCY_ZONES', () => {
  it('covers the full audible range without gaps', () => {
    expect(FREQUENCY_ZONES[0].minFreq).toBe(MIN_FREQ);
    expect(FREQUENCY_ZONES[FREQUENCY_ZONES.length - 1].maxFreq).toBe(MAX_FREQ);
    for (let i = 1; i < FREQUENCY_ZONES.length; i++) {
      expect(FREQUENCY_ZONES[i].minFreq).toBe(FREQUENCY_ZONES[i - 1].maxFreq);
    }
  });
});

// ---------------------------------------------------------------------------
// Formatting & zone lookup helpers
// ---------------------------------------------------------------------------

describe('formatFreq', () => {
  it('formats sub-kHz frequencies in Hz', () => {
    expect(formatFreq(105)).toBe('105 Hz');
    expect(formatFreq(999)).toBe('999 Hz');
  });

  it('formats kHz values compactly', () => {
    expect(formatFreq(1000)).toBe('1 kHz');
    expect(formatFreq(6200)).toBe('6.2 kHz');
  });
});

describe('getFrequencyZone', () => {
  it('returns the zone containing the frequency', () => {
    expect(getFrequencyZone(30).name).toBe('Sub-Bass');
    expect(getFrequencyZone(100).name).toBe('Punchy Bass');
    expect(getFrequencyZone(7000).name).toBe('Piercing Treble');
    expect(getFrequencyZone(15000).name).toBe('Air & Sparkle');
  });

  it('handles boundary frequencies inclusively', () => {
    expect(getFrequencyZone(60).name).toBe('Sub-Bass');
    expect(getFrequencyZone(60.1).name).toBe('Punchy Bass');
  });
});

describe('calculateEqualLoudnessGain', () => {
  it('is roughly neutral at the 1 kHz reference', () => {
    expect(Math.abs(calculateEqualLoudnessGain(1000))).toBeLessThan(3);
  });

  it('boosts deep bass and cuts the pinna resonance region', () => {
    expect(calculateEqualLoudnessGain(30)).toBeGreaterThan(3);
    expect(calculateEqualLoudnessGain(3000)).toBeLessThan(0);
  });

  it('returns 0 for non-positive frequencies', () => {
    expect(calculateEqualLoudnessGain(0)).toBe(0);
    expect(calculateEqualLoudnessGain(-100)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Headroom / preamp protection
// ---------------------------------------------------------------------------

describe('calculateHeadroom', () => {
  it('suggests zero preamp when there are no boosts', () => {
    expect(calculateHeadroom([])).toEqual({ maxBoost: 0, suggestedPreamp: 0 });
    expect(calculateHeadroom([makeFix({ gain: -6 })])).toEqual({ maxBoost: 0, suggestedPreamp: 0 });
  });

  it('recommends a negative preamp matching the largest boost', () => {
    const { maxBoost, suggestedPreamp } = calculateHeadroom([
      makeFix({ gain: 2.5 }),
      makeFix({ gain: 4.4, filterType: 'lowshelf' }),
    ]);
    expect(maxBoost).toBeCloseTo(4.4, 5);
    expect(suggestedPreamp).toBeCloseTo(-4.4, 5);
  });

  it('ignores disabled fixes', () => {
    const { maxBoost } = calculateHeadroom([makeFix({ gain: 9, enabled: false })]);
    expect(maxBoost).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Canvas coordinate helpers
// ---------------------------------------------------------------------------

describe('freqToX / xToFreq', () => {
  const width = 1000;

  it('maps range endpoints to canvas edges', () => {
    expect(freqToX(MIN_FREQ, width)).toBeCloseTo(0);
    expect(freqToX(MAX_FREQ, width)).toBeCloseTo(width);
  });

  it('round-trips a mid-scale frequency', () => {
    const freq = 1234;
    expect(xToFreq(freqToX(freq, width), width)).toBeCloseTo(freq, 0);
  });

  it('clamps out-of-range frequencies', () => {
    expect(freqToX(1, width)).toBeCloseTo(0);
    expect(freqToX(999999, width)).toBeCloseTo(width);
  });

  it('is monotonic across the scale', () => {
    let last = -Infinity;
    for (let i = 0; i <= 20; i++) {
      const x = freqToX(MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, i / 20), width);
      expect(x).toBeGreaterThanOrEqual(last);
      last = x;
    }
  });
});

describe('gainToY / yToGain', () => {
  const height = 400;

  it('maps max gain to the top edge and min gain to the bottom edge', () => {
    expect(gainToY(MAX_GAIN, height)).toBeCloseTo(0);
    expect(gainToY(MIN_GAIN, height)).toBeCloseTo(height);
  });

  it('round-trips a mid-range gain', () => {
    expect(yToGain(gainToY(-2.5, height), height)).toBeCloseTo(-2.5, 5);
  });

  it('clamps out-of-range values', () => {
    expect(gainToY(99, height)).toBeCloseTo(0);
    // y above the canvas top clamps to max gain; below the bottom to min gain
    expect(yToGain(-50, height)).toBeCloseTo(MAX_GAIN);
    expect(yToGain(height + 50, height)).toBeCloseTo(MIN_GAIN);
  });
});

// ---------------------------------------------------------------------------
// Biquad coefficient generation (RBJ Audio EQ Cookbook)
// ---------------------------------------------------------------------------

describe('getBiquadFilterCoeffs', () => {
  it('normalizes a0 so that feedback[0] is 1', () => {
    for (const fix of [makeFix(), shelfFix(), makeFix({ gain: 12, q: 6 })]) {
      const { feedforward, feedback } = getBiquadFilterCoeffs(fix, 48000);
      expect(feedback[0]).toBe(1);
      expect(feedforward).toHaveLength(3);
      expect(feedback).toHaveLength(3);
    }
  });

  it('produces stable filters (poles inside the unit circle)', () => {
    for (const fix of [
      makeFix(),
      shelfFix(),
      makeFix({ frequency: 20, q: 8, gain: -12 }),
      makeFix({ frequency: 19000, q: 8, gain: 12 }),
    ]) {
      const { feedback } = getBiquadFilterCoeffs(fix, 48000);
      const [a1, a2] = [feedback[1], feedback[2]];
      // Stability triangle for a 2nd-order section: |a2| < 1 and |a1| < 1 + a2
      expect(Math.abs(a2)).toBeLessThan(1);
      expect(Math.abs(a1)).toBeLessThan(1 + a2);
    }
  });

  it('clamps Q to a safe minimum', () => {
    const { feedforward, feedback } = getBiquadFilterCoeffs(makeFix({ q: 0 }), 48000);
    expect(Number.isFinite(feedforward[0])).toBe(true);
    expect(Number.isFinite(feedback[1])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Combined frequency response (analytical biquad evaluation)
// ---------------------------------------------------------------------------

describe('calculateCombinedFilterResponse', () => {
  it('returns zero response for no fixes', () => {
    const resp = calculateCombinedFilterResponse([], new Float32Array([100, 1000, 10000]));
    expect(Array.from(resp)).toEqual([0, 0, 0]);
  });

  it('ignores disabled and zero-gain fixes', () => {
    const resp = calculateCombinedFilterResponse(
      [makeFix({ enabled: false, gain: 10 }), makeFix({ gain: 0 })],
      new Float32Array([1000])
    );
    expect(resp[0]).toBe(0);
  });

  it('peaks at the full gain at a peaking filter\'s center frequency', () => {
    expect(responseAtDb(makeFix({ frequency: 1000, gain: -4, q: 4.5 }), 1000)).toBeCloseTo(-4, 2);
  });

  it('returns ~0 dB at DC and Nyquist for a peaking filter', () => {
    const fix = makeFix({ frequency: 1000, gain: 8, q: 1.41 });
    expect(responseAtDb(fix, 20)).toBeCloseTo(0, 2);
    expect(responseAtDb(fix, 19000)).toBeCloseTo(0, 2);
  });

  it('reaches the full shelf gain at DC and ~0 dB at Nyquist for a low shelf', () => {
    const fix = shelfFix(); // +4.5 dB @ 105 Hz
    expect(responseAtDb(fix, 20)).toBeCloseTo(4.5, 2);
    expect(responseAtDb(fix, 19000)).toBeCloseTo(0, 2);
  });

  it('hits half the shelf gain at the corner frequency (shelf signature)', () => {
    // The regression guard: an imported low shelf must behave as a shelf,
    // not as a peaking bell (which would show full gain at Fc).
    expect(responseAtDb(shelfFix(), 105)).toBeCloseTo(4.5 / 2, 1);
  });

  it('sums multiple filters in dB', () => {
    const resp = calculateCombinedFilterResponse(
      [makeFix({ frequency: 200, gain: 3 }), makeFix({ frequency: 3000, gain: -2 })],
      new Float32Array([200, 3000])
    );
    expect(resp[0]).toBeCloseTo(3, 1);
    expect(resp[1]).toBeCloseTo(-2, 1);
  });
});

// ---------------------------------------------------------------------------
// Export formats
// ---------------------------------------------------------------------------

describe('exportToEqualizerAPO', () => {
  it('writes APO config lines with preamp, LSC and PK types', () => {
    const text = exportToEqualizerAPO([shelfFix(), makeFix({ frequency: 6200, gain: -3.5, q: 4.5 })], -4.5);
    const lines = text.split('\n');
    expect(lines.some((l) => l === 'Preamp: -4.5 dB')).toBe(true);
    expect(lines.some((l) => /Filter 1: ON LSC Fc 105 Hz Gain \+4\.5 dB Q 0\.71/.test(l))).toBe(true);
    expect(lines.some((l) => /Filter 2: ON PK Fc 6200 Hz Gain -3\.5 dB Q 4\.50/.test(l))).toBe(true);
  });

  it('formats positive preamp with an explicit sign', () => {
    expect(exportToEqualizerAPO([makeFix()], 1.5)).toContain('Preamp: +1.5 dB');
  });

  it('returns a comment placeholder when empty', () => {
    expect(exportToEqualizerAPO([])).toMatch(/^#/);
  });
});

describe('exportToWavelet', () => {
  it('writes Wavelet filter lines with LS and PK types', () => {
    const text = exportToWavelet([shelfFix(), makeFix({ frequency: 6200, gain: -3.5, q: 4.5 })], -4.5);
    expect(text).toContain('Filter: LS Fc 105 Gain +4.5 Q 0.71');
    expect(text).toContain('Filter: PK Fc 6200 Gain -3.5 Q 4.50');
  });
});

describe('exportToTable', () => {
  it('writes a pipe-separated table including shape and preamp offset', () => {
    const text = exportToTable([shelfFix()], -4.5);
    expect(text).toContain('Preamp Offset: -4.5 dB');
    expect(text).toMatch(/105 Hz\s*\|\s*\+4\.5 dB\s*\|\s*0\.71\s*\|\s*Low Shelf/);
  });

  it('marks peaking fixes as Peaking', () => {
    expect(exportToTable([makeFix()])).toContain('Peaking');
  });
});

// ---------------------------------------------------------------------------
// Reverse import parser
// ---------------------------------------------------------------------------

describe('importFromEqualizerAPO', () => {
  describe('JSON input', () => {
    it('parses a bare fixes array', () => {
      const { fixes } = importFromEqualizerAPO(JSON.stringify([shelfFix()]));
      expect(fixes).toHaveLength(1);
      expect(fixes[0].filterType).toBe('lowshelf');
    });

    it('parses an object with fixes and preamp', () => {
      const { fixes, preamp } = importFromEqualizerAPO(
        JSON.stringify({ fixes: [makeFix()], preamp: -3 })
      );
      expect(fixes).toHaveLength(1);
      expect(preamp).toBe(-3);
    });
  });

  describe('Equalizer APO / Peace lines', () => {
    it('parses PK filters with all parameters', () => {
      const { fixes } = importFromEqualizerAPO(
        'Filter 1: ON PK Fc 6200 Hz Gain -4.0 dB Q 4.5'
      );
      expect(fixes[0]).toMatchObject({
        frequency: 6200,
        gain: -4,
        q: 4.5,
        filterType: 'peaking',
        enabled: true,
      });
    });

    it('parses LSC bass shelves and preserves the shelf shape', () => {
      const { fixes } = importFromEqualizerAPO(
        'Filter 1: ON LSC Fc 105 Hz Gain +4.5 dB Q 0.71'
      );
      expect(fixes[0].filterType).toBe('lowshelf');
      expect(fixes[0].q).toBe(0.71);
      expect(fixes[0].frequency).toBe(105);
      expect(fixes[0].gain).toBe(4.5);
    });

    it('recognizes alternative low-shelf spellings (LS, LOWSHELF)', () => {
      for (const type of ['LS', 'LOWSHELF', 'LowShelf']) {
        const { fixes } = importFromEqualizerAPO(
          `Filter 1: ON ${type} Fc 105 Hz Gain +4.5 dB Q 0.71`
        );
        expect(fixes[0].filterType, `type ${type}`).toBe('lowshelf');
      }
    });

    it('parses OFF filters as disabled', () => {
      const { fixes } = importFromEqualizerAPO('Filter 1: OFF PK Fc 1000 Hz Gain 2.0 dB Q 1.41');
      expect(fixes[0].enabled).toBe(false);
    });

    it('defaults missing Q to shape-appropriate values', () => {
      const { fixes } = importFromEqualizerAPO('Filter 1: ON LSC Fc 105 Hz Gain 4.5 dB');
      expect(fixes[0].filterType).toBe('lowshelf');
      expect(fixes[0].q).toBeCloseTo(0.71, 2);
    });

    it('reads the Preamp line', () => {
      const { preamp } = importFromEqualizerAPO('Preamp: -4.5 dB');
      expect(preamp).toBe(-4.5);
    });

    it('ignores comments and blank lines', () => {
      const { fixes } = importFromEqualizerAPO(
        '# comment\n\nFilter 1: ON PK Fc 1000 Hz Gain 1.0 dB Q 1.41'
      );
      expect(fixes).toHaveLength(1);
    });
  });

  describe('Wavelet lines', () => {
    it('parses Wavelet format without Hz/dB units', () => {
      const { fixes } = importFromEqualizerAPO('Filter: LS Fc 105 Gain +4.5 Q 0.71');
      expect(fixes[0]).toMatchObject({ filterType: 'lowshelf', frequency: 105, gain: 4.5, q: 0.71 });
    });
  });

  describe('Universal Table format', () => {
    it('parses pipe-separated rows including Low Shelf shape', () => {
      const text = [
        'Preamp Offset: -4.5 dB',
        '',
        'Frequency (Hz) | Gain (dB) | Q Factor | Shape      | Width',
        '---------------|-----------|----------|------------|--------',
        '105 Hz         | +4.5 dB   | 0.71     | Low Shelf  | wide  ',
        '6200 Hz        | -3.5 dB   | 4.50     | Peaking    | narrow',
      ].join('\n');
      const { fixes, preamp } = importFromEqualizerAPO(text);
      expect(preamp).toBe(-4.5);
      expect(fixes).toHaveLength(2);
      expect(fixes[0]).toMatchObject({ filterType: 'lowshelf', frequency: 105, q: 0.71 });
      expect(fixes[1]).toMatchObject({ filterType: 'peaking', frequency: 6200, q: 4.5 });
    });
  });

  describe('clamping and validation', () => {
    it('clamps frequencies and gains into the supported range', () => {
      const { fixes } = importFromEqualizerAPO('Filter 1: ON PK Fc 5 Hz Gain 99 dB Q 1');
      expect(fixes[0].frequency).toBe(MIN_FREQ);
      expect(fixes[0].gain).toBe(MAX_GAIN);
    });

    it('rejects lines without parseable numbers', () => {
      const { fixes } = importFromEqualizerAPO('hello world\nnothing to parse here');
      expect(fixes).toHaveLength(0);
    });
  });

  describe('full round-trips (export -> import -> export)', () => {
    const fixes: EQFix[] = [shelfFix(), makeFix({ frequency: 6200, gain: -3.5, q: 4.5 })];

    it('preserves shelf shape and parameters through the APO format', () => {
      const parsed = importFromEqualizerAPO(exportToEqualizerAPO(fixes, -4.5));
      expect(parsed.preamp).toBe(-4.5);
      expect(parsed.fixes[0]).toMatchObject({
        frequency: 105,
        gain: 4.5,
        q: 0.71,
        filterType: 'lowshelf',
      });
      expect(parsed.fixes[1]).toMatchObject({ frequency: 6200, gain: -3.5, q: 4.5 });
      // Re-export must still emit LSC, proving the shape survived the trip.
      expect(exportToEqualizerAPO(fixes)).toContain('LSC Fc 105');
    });

    it('preserves shelf shape and parameters through the Wavelet format', () => {
      const parsed = importFromEqualizerAPO(exportToWavelet(fixes, -4.5));
      expect(parsed.fixes[0]).toMatchObject({ filterType: 'lowshelf', q: 0.71 });
      expect(parsed.fixes[1]).toMatchObject({ filterType: 'peaking', q: 4.5 });
    });

    it('preserves shelf shape and parameters through the Universal Table format', () => {
      const parsed = importFromEqualizerAPO(exportToTable(fixes, -4.5));
      expect(parsed.fixes[0]).toMatchObject({ filterType: 'lowshelf', q: 0.71 });
      expect(parsed.fixes[1]).toMatchObject({ filterType: 'peaking', q: 4.5 });
    });
  });
});
