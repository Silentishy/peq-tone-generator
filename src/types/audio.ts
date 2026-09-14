export type FilterWidth = 'narrow' | 'normal' | 'wide';

export interface EQFix {
  id: string;
  frequency: number;   // In Hz (e.g. 6200)
  gain: number;        // In dB (e.g. -4.5 or +3.0)
  width: FilterWidth;  // 'narrow' (Q=4.5), 'normal' (Q=1.41), 'wide' (Q=0.71)
  q: number;
  label?: string;      // Friendly description like "Harsh Treble Peak"
  enabled: boolean;
}

export interface FrequencyZone {
  name: string;
  minFreq: number;
  maxFreq: number;
  description: string;
  commonProblems: string;
  typicalFix: string;
  color: string;
}

export interface FrequencyLandmark {
  name: string;
  exactFreq: number; // Exact frequency in Hz (e.g. 5800)
  category: 'all' | 'bass' | 'mids' | 'treble' | 'air';
  desc: string;
  color: string;
}
