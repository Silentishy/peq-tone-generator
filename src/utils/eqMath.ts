import { EQFix, FilterWidth, FrequencyZone, FrequencyLandmark } from '../types/audio';

export const MIN_FREQ = 20;
export const MAX_FREQ = 20000;
export const MIN_GAIN = -15; // Realistic fixing range for headphones/speakers
export const MAX_GAIN = 15;

export const WIDTH_MAP: Record<FilterWidth, { q: number; label: string; desc: string }> = {
  narrow: { q: 4.5, label: 'Narrow', desc: 'Target a sharp, ringing peak or notch' },
  normal: { q: 1.41, label: 'Normal', desc: 'Standard balance for most peaks & dips' },
  wide: { q: 0.71, label: 'Wide', desc: 'Gentle warmth, brightness, or broad dip' },
};

export const FREQUENCY_LANDMARKS: FrequencyLandmark[] = [
  // --- Bass (< 250 Hz) ---
  { name: 'Sub Rumble', exactFreq: 30, category: 'bass', desc: 'Lowest sub-bass rumble & driver rattle', color: '#ef4444' },
  { name: 'Deep Sub', exactFreq: 50, category: 'bass', desc: 'Electronic 808s & deep sub weight', color: '#ef4444' },
  { name: 'Bass Punch', exactFreq: 80, category: 'bass', desc: 'Kick drum thump & punch', color: '#f97316' },
  { name: 'Mid Bass', exactFreq: 100, category: 'bass', desc: 'Bass warmth & groove', color: '#f97316' },
  { name: 'Upper Bass', exactFreq: 125, category: 'bass', desc: 'Bass guitar body & male voice fullness', color: '#f97316' },
  { name: 'Bass Body', exactFreq: 160, category: 'bass', desc: 'Low-end fullness', color: '#f59e0b' },
  { name: 'Warmth / Bloom', exactFreq: 200, category: 'bass', desc: 'Warmth boundary & room boom', color: '#f59e0b' },

  // --- Mids (250 Hz - 1 kHz) ---
  { name: 'Low Mids', exactFreq: 250, category: 'mids', desc: 'Lower vocal & snare fullness', color: '#eab308' },
  { name: 'Muddiness', exactFreq: 300, category: 'mids', desc: 'Common mud; muddles clarity', color: '#eab308' },
  { name: 'Mud / Box', exactFreq: 400, category: 'mids', desc: 'Hollow cardboard boxiness', color: '#eab308' },
  { name: 'Boxiness', exactFreq: 450, category: 'mids', desc: 'Hollow box resonance', color: '#84cc16' },
  { name: 'Lower Vocal', exactFreq: 500, category: 'mids', desc: 'Vocal warmth boundary', color: '#84cc16' },
  { name: 'Nasal Tone', exactFreq: 650, category: 'mids', desc: 'Honky, nasal horn resonance', color: '#10b981' },
  { name: 'Vocal Body', exactFreq: 800, category: 'mids', desc: 'Chest resonance of vocals', color: '#10b981' },
  { name: 'Vocal Chest', exactFreq: 900, category: 'mids', desc: 'Fundamental speech body', color: '#10b981' },

  // --- Every 0.5 kHz from 1.0 kHz to 20.0 kHz ---
  { name: '1.0k Reference', exactFreq: 1000, category: 'mids', desc: 'Standard 1 kHz acoustic reference', color: '#10b981' },
  { name: 'Upper Mids', exactFreq: 1500, category: 'mids', desc: 'Vocal projection & telephone tone', color: '#14b8a6' },
  { name: 'Presence Rise', exactFreq: 2000, category: 'mids', desc: 'Ear canal sensitivity rise', color: '#06b6d4' },
  { name: 'Ear Canal Gain', exactFreq: 2500, category: 'treble', desc: 'Concha acoustic resonance', color: '#06b6d4' },
  { name: 'Pinna Peak', exactFreq: 3000, category: 'treble', desc: 'Human ear pinna peak', color: '#0284c7' },
  { name: 'Vocal Clarity', exactFreq: 3500, category: 'treble', desc: 'Speech intelligibility & definition', color: '#0284c7' },
  { name: 'Attack & Bite', exactFreq: 4000, category: 'treble', desc: 'Guitar bite & drum attack', color: '#6366f1' },
  { name: 'Harshness', exactFreq: 4500, category: 'treble', desc: 'Crunchy tone; causes ear fatigue', color: '#6366f1' },
  { name: 'Upper Harsh', exactFreq: 5000, category: 'treble', desc: 'Treble bite & vocal sharpness', color: '#8b5cf6' },
  { name: 'Low Sibilance', exactFreq: 5500, category: 'treble', desc: 'Harsh "sh" & "ch" sounds', color: '#8b5cf6' },
  { name: 'Sibilance Peak', exactFreq: 6000, category: 'treble', desc: 'Frequent piercing headphone peak', color: '#8b5cf6' },
  { name: 'Piercing Peak', exactFreq: 6500, category: 'treble', desc: 'Piercing treble resonance', color: '#a855f7' },
  { name: 'Piercing Treble', exactFreq: 7000, category: 'treble', desc: 'Sharp "s" & "t" sibilance', color: '#a855f7' },
  { name: 'Cymbal Sizzle', exactFreq: 7500, category: 'treble', desc: 'Cymbal splash & metallic edge', color: '#a855f7' },
  { name: 'Treble Spike', exactFreq: 8000, category: 'treble', desc: 'Headphone driver resonance spike', color: '#d946ef' },
  { name: 'Driver Peak', exactFreq: 8500, category: 'treble', desc: 'Bright monitoring peak', color: '#d946ef' },
  { name: 'High Treble', exactFreq: 9000, category: 'treble', desc: 'Treble crispness & snare top', color: '#d946ef' },
  { name: 'Treble Edge', exactFreq: 9500, category: 'treble', desc: 'Upper cymbal detail', color: '#ec4899' },
  { name: 'Brilliance', exactFreq: 10000, category: 'treble', desc: 'Clean metallic shimmer', color: '#ec4899' },
  { name: 'Metallic Edge', exactFreq: 10500, category: 'air', desc: 'Hi-hat edges & crisp air', color: '#ec4899' },
  { name: 'Top Air Rise', exactFreq: 11000, category: 'air', desc: 'Acoustic air boundary', color: '#ec4899' },
  { name: 'Shimmer', exactFreq: 11500, category: 'air', desc: 'Delicate acoustic shimmer', color: '#f43f5e' },
  { name: 'Air Detail', exactFreq: 12000, category: 'air', desc: 'Vocal air & recording space', color: '#f43f5e' },
  { name: 'Top Sparkle', exactFreq: 12500, category: 'air', desc: 'Acoustic sparkle & micro-detail', color: '#f43f5e' },
  { name: 'Ultra Shimmer', exactFreq: 13000, category: 'air', desc: 'Airy cymbal overtone', color: '#f43f5e' },
  { name: 'Micro Detail', exactFreq: 13500, category: 'air', desc: 'Subtle soundstage nuances', color: '#fb7185' },
  { name: 'High Air', exactFreq: 14000, category: 'air', desc: 'High acoustic air', color: '#fb7185' },
  { name: 'Air Extension', exactFreq: 14500, category: 'air', desc: 'Soundstage extension', color: '#fb7185' },
  { name: 'Soundstage Air', exactFreq: 15000, category: 'air', desc: 'Spaciousness & breathing room', color: '#fb7185' },
  { name: 'Ambience', exactFreq: 15500, category: 'air', desc: 'Recording room ambience', color: '#fb7185' },
  { name: 'Top Air', exactFreq: 16000, category: 'air', desc: 'Highest audible air', color: '#fb7185' },
  { name: 'Ultra High', exactFreq: 16500, category: 'air', desc: 'Upper frequency extension', color: '#fda4af' },
  { name: 'Upper Air', exactFreq: 17000, category: 'air', desc: 'Airy sheen', color: '#fda4af' },
  { name: 'Extreme High', exactFreq: 17500, category: 'air', desc: 'Near ultrasonic boundary', color: '#fda4af' },
  { name: 'Near Ultrasonic', exactFreq: 18000, category: 'air', desc: 'Adult human hearing limit', color: '#fda4af' },
  { name: 'Hearing Limit', exactFreq: 18500, category: 'air', desc: 'Ultra-high ceiling', color: '#fda4af' },
  { name: 'Upper Limit', exactFreq: 19000, category: 'air', desc: 'Top edge of audible sound', color: '#fda4af' },
  { name: 'Threshold', exactFreq: 19500, category: 'air', desc: 'Acoustic threshold', color: '#fda4af' },
  { name: '20 kHz Ceiling', exactFreq: 20000, category: 'air', desc: 'Standard 20 kHz ceiling', color: '#fda4af' },
];

export function formatFreq(freq: number): string {
  if (freq >= 1000) {
    const val = freq / 1000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} kHz`;
  }
  return `${Math.round(freq)} Hz`;
}

export const FREQUENCY_ZONES: FrequencyZone[] = [
  {
    name: 'Sub-Bass',
    minFreq: 20,
    maxFreq: 60,
    description: 'Deep physical rumble and sub vibrations',
    commonProblems: 'Can cause headphones to rattle or sound hollow if missing.',
    typicalFix: 'Boost slightly for movie/gaming rumble; cut if rattling.',
    color: '#ef4444',
  },
  {
    name: 'Punchy Bass',
    minFreq: 60,
    maxFreq: 250,
    description: 'Kick drums, basslines, and musical warmth',
    commonProblems: 'Too much causes boominess and bleeds into voices.',
    typicalFix: 'Boost 80Hz for thump; cut 150-200Hz if boomy.',
    color: '#f97316',
  },
  {
    name: 'Muddiness / Box',
    minFreq: 250,
    maxFreq: 500,
    description: 'Lower midrange; where sound gets "cardboard" or muddy',
    commonProblems: 'Many headphones have an annoying muffled boxy tone here.',
    typicalFix: 'Cut 2 to 4 dB around 300-400Hz to clarify vocals.',
    color: '#eab308',
  },
  {
    name: 'Vocal Midrange',
    minFreq: 500,
    maxFreq: 2000,
    description: 'Human voices, piano body, and acoustic instruments',
    commonProblems: 'Can sound hollow, nasal, or like a cheap megaphone.',
    typicalFix: 'Gentle 1-2 dB boost brings vocals forward.',
    color: '#10b981',
  },
  {
    name: 'Clarity & Presence',
    minFreq: 2000,
    maxFreq: 5000,
    description: 'Definition, guitar attack, and vocal presence',
    commonProblems: 'Too much sounds crunchy, shouty, and causes ear fatigue.',
    typicalFix: 'Cut 2-3 dB if the headphone hurts your ears at high volume.',
    color: '#06b6d4',
  },
  {
    name: 'Piercing Treble',
    minFreq: 5000,
    maxFreq: 9000,
    description: 'The #1 problem area: harsh "S", "T" sibilance & cymbals',
    commonProblems: 'Sharp piercing peaks here make listening painful.',
    typicalFix: 'Find the ringing frequency (often 5.8k-8k) and cut 3 to 6 dB!',
    color: '#a855f7',
  },
  {
    name: 'Air & Sparkle',
    minFreq: 9000,
    maxFreq: 20000,
    description: 'Ultra-high frequencies, breathing room, and soundstage air',
    commonProblems: 'Too quiet makes audio feel closed-in; too loud sounds hissy.',
    typicalFix: 'Gentle wide boost (+2 dB) adds airy shimmer and detail.',
    color: '#ec4899',
  },
];

/**
 * Get the current frequency zone for human-readable feedback
 */
export function getFrequencyZone(freq: number): FrequencyZone {
  for (const zone of FREQUENCY_ZONES) {
    if (freq >= zone.minFreq && freq <= zone.maxFreq) {
      return zone;
    }
  }
  return FREQUENCY_ZONES[FREQUENCY_ZONES.length - 1];
}

/**
 * Coordinate helpers for log canvas
 */
export function freqToX(freq: number, width: number): number {
  const clamped = Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq));
  const logMin = Math.log10(MIN_FREQ);
  const logMax = Math.log10(MAX_FREQ);
  const logCurrent = Math.log10(clamped);
  return ((logCurrent - logMin) / (logMax - logMin)) * width;
}

export function xToFreq(x: number, width: number): number {
  const clampedX = Math.max(0, Math.min(width, x));
  const ratio = clampedX / width;
  const logMin = Math.log10(MIN_FREQ);
  const logMax = Math.log10(MAX_FREQ);
  return Math.pow(10, logMin + ratio * (logMax - logMin));
}

export function gainToY(gain: number, height: number, minGain = -15, maxGain = 15): number {
  const clamped = Math.max(minGain, Math.min(maxGain, gain));
  const ratio = (clamped - minGain) / (maxGain - minGain);
  return height - ratio * height;
}

/**
 * Export formats
 */
export function exportToEqualizerAPO(fixes: EQFix[]): string {
  if (fixes.length === 0) return '# No EQ fixes applied yet.';

  const lines = [
    '# Parametric EQ Settings - Headphone/Speaker Fixer',
    '# Paste these lines into your Equalizer APO config.txt or Peace GUI',
    'Preamp: 0 dB',
  ];

  fixes.forEach((fix, index) => {
    const gainStr = fix.gain >= 0 ? `+${fix.gain.toFixed(1)}` : fix.gain.toFixed(1);
    lines.push(
      `Filter ${index + 1}: ON PK Fc ${Math.round(fix.frequency)} Hz Gain ${gainStr} dB Q ${fix.q.toFixed(2)}`
    );
  });

  return lines.join('\n');
}

export function exportToWavelet(fixes: EQFix[]): string {
  if (fixes.length === 0) return '# No EQ fixes applied.';

  // Standard AutoEq format used by Wavelet & Poweramp
  const lines = [
    '# Wavelet / Poweramp Parametric EQ Configuration',
  ];

  fixes.forEach((fix) => {
    const gainStr = fix.gain >= 0 ? `+${fix.gain.toFixed(1)}` : fix.gain.toFixed(1);
    lines.push(`Filter: PK Fc ${Math.round(fix.frequency)} Gain ${gainStr} Q ${fix.q.toFixed(2)}`);
  });

  return lines.join('\n');
}

export function exportToTable(fixes: EQFix[]): string {
  if (fixes.length === 0) return 'No fixes created yet.';

  let out = 'Frequency (Hz) | Gain (dB) | Q Factor | Type\n';
  out += '---------------|-----------|----------|------\n';
  fixes.forEach((fix) => {
    const fStr = `${Math.round(fix.frequency)} Hz`.padEnd(14, ' ');
    const gStr = `${fix.gain >= 0 ? '+' : ''}${fix.gain.toFixed(1)} dB`.padEnd(9, ' ');
    const qStr = `${fix.q.toFixed(2)} (${fix.width})`.padEnd(8, ' ');
    out += `${fStr} | ${gStr} | ${qStr} | Peaking\n`;
  });

  return out;
}
