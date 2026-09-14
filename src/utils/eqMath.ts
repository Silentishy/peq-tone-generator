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
  { name: 'Sub Rumble', nameZh: '极低频震感', exactFreq: 30, category: 'bass', desc: 'Lowest sub-bass rumble & driver rattle', descZh: '超低频震感与耳机振膜杂音测试', color: '#ef4444' },
  { name: 'Deep Sub', nameZh: '重低音下潜', exactFreq: 50, category: 'bass', desc: 'Electronic 808s & deep sub weight', descZh: '电子乐808与低音厚重度', color: '#ef4444' },
  { name: 'Bass Punch', nameZh: '底鼓打击感', exactFreq: 80, category: 'bass', desc: 'Kick drum thump & punch', descZh: '底鼓力量感与下潜力度', color: '#f97316' },
  { name: 'Mid Bass', nameZh: '中低音律动', exactFreq: 100, category: 'bass', desc: 'Bass warmth & groove', descZh: '贝斯旋律温暖感与节奏感', color: '#f97316' },
  { name: 'Upper Bass', nameZh: '高阶低音', exactFreq: 125, category: 'bass', desc: 'Bass guitar body & male voice fullness', descZh: '男声胸腔共鸣与贝斯形体感', color: '#f97316' },
  { name: 'Bass Body', nameZh: '低频饱满度', exactFreq: 160, category: 'bass', desc: 'Low-end fullness', descZh: '低音轮廓与饱满度', color: '#f59e0b' },
  { name: 'Warmth / Bloom', nameZh: '温暖 / 轰鸣', exactFreq: 200, category: 'bass', desc: 'Warmth boundary & room boom', descZh: '低频温润分界点，易产生轰头感', color: '#f59e0b' },

  // --- Mids (250 Hz - 1 kHz) ---
  { name: 'Low Mids', nameZh: '中低频饱满', exactFreq: 250, category: 'mids', desc: 'Lower vocal & snare fullness', descZh: '军鼓下段与人声厚度', color: '#eab308' },
  { name: 'Muddiness', nameZh: '浑浊混响区', exactFreq: 300, category: 'mids', desc: 'Common mud; muddles clarity', descZh: '易发闷发糊区域，衰减可提亮人声', color: '#eab308' },
  { name: 'Mud / Box', nameZh: '桶音纸盒感', exactFreq: 400, category: 'mids', desc: 'Hollow cardboard boxiness', descZh: '封闭式耳机常见纸盒空洞音', color: '#eab308' },
  { name: 'Boxiness', nameZh: '箱体共振', exactFreq: 450, category: 'mids', desc: 'Hollow box resonance', descZh: '空腔中段共鸣感', color: '#84cc16' },
  { name: 'Lower Vocal', nameZh: '人声基频', exactFreq: 500, category: 'mids', desc: 'Vocal warmth boundary', descZh: '人声核心基准厚度', color: '#84cc16' },
  { name: 'Nasal Tone', nameZh: '鼻音共鸣', exactFreq: 650, category: 'mids', desc: 'Honky, nasal horn resonance', descZh: '大喇叭声与鼻音过重频点', color: '#10b981' },
  { name: 'Vocal Body', nameZh: '人声主体', exactFreq: 800, category: 'mids', desc: 'Chest resonance of vocals', descZh: '人声质感与轮廓核心', color: '#10b981' },
  { name: 'Vocal Chest', nameZh: '胸腔质感', exactFreq: 900, category: 'mids', desc: 'Fundamental speech body', descZh: '自然言语真实感', color: '#10b981' },

  // --- Every 0.5 kHz from 1.0 kHz to 20.0 kHz ---
  { name: '1.0k Reference', nameZh: '1kHz 基准音', exactFreq: 1000, category: 'mids', desc: 'Standard 1 kHz acoustic reference', descZh: '声学标准 1000 Hz 基准参考频点', color: '#10b981' },
  { name: 'Upper Mids', nameZh: '中高频过渡', exactFreq: 1500, category: 'mids', desc: 'Vocal projection & telephone tone', descZh: '人声穿透力与电话音分界', color: '#14b8a6' },
  { name: 'Presence Rise', nameZh: '耳道增益起跑', exactFreq: 2000, category: 'mids', desc: 'Ear canal sensitivity rise', descZh: '人耳耳道敏感度自然上升起点', color: '#06b6d4' },
  { name: 'Ear Canal Gain', nameZh: '耳道敏感区', exactFreq: 2500, category: 'treble', desc: 'Concha acoustic resonance', descZh: '人耳耳甲腔声学共振区域', color: '#06b6d4' },
  { name: 'Pinna Peak', nameZh: '耳廓主增益峰', exactFreq: 3000, category: 'treble', desc: 'Human ear pinna peak', descZh: '人耳耳廓增益核心区 (HRTF)', color: '#0284c7' },
  { name: 'Vocal Clarity', nameZh: '人声清晰度', exactFreq: 3500, category: 'treble', desc: 'Speech intelligibility & definition', descZh: '咬字辨识度与歌声临场感', color: '#0284c7' },
  { name: 'Attack & Bite', nameZh: '打击感与清脆', exactFreq: 4000, category: 'treble', desc: 'Guitar bite & drum attack', descZh: '吉他拨弦与鼓皮击打瞬态', color: '#6366f1' },
  { name: 'Harshness', nameZh: '刺耳毛刺区', exactFreq: 4500, category: 'treble', desc: 'Crunchy tone; causes ear fatigue', descZh: '毛刺生硬感，过量导致听觉疲劳', color: '#6366f1' },
  { name: 'Upper Harsh', nameZh: '强齿音前锋', exactFreq: 5000, category: 'treble', desc: 'Treble bite & vocal sharpness', descZh: '人声边缘锐度与刺耳分界', color: '#8b5cf6' },
  { name: 'Low Sibilance', nameZh: '低端齿音峰', exactFreq: 5500, category: 'treble', desc: 'Harsh "sh" & "ch" sounds', descZh: '粗糙“嗤嗤”齿音发作频段', color: '#8b5cf6' },
  { name: 'Sibilance Peak', nameZh: '刺耳齿音尖峰', exactFreq: 6000, category: 'treble', desc: 'Frequent piercing headphone peak', descZh: '绝大多数耳机最常见刺耳尖峰', color: '#8b5cf6' },
  { name: 'Piercing Peak', nameZh: '尖锐啸叫点', exactFreq: 6500, category: 'treble', desc: 'Piercing treble resonance', descZh: '尖锐共振峰，常需精准小幅削减', color: '#a855f7' },
  { name: 'Piercing Treble', nameZh: '极高齿音频', exactFreq: 7000, category: 'treble', desc: 'Sharp "s" & "t" sibilance', descZh: '清脆“嘶嘶”尖刺音', color: '#a855f7' },
  { name: 'Cymbal Sizzle', nameZh: '镲片金属啸鸣', exactFreq: 7500, category: 'treble', desc: 'Cymbal splash & metallic edge', descZh: '镲片金属飞溅与尖啸区', color: '#a855f7' },
  { name: 'Treble Spike', nameZh: '动圈/动铁毛刺峰', exactFreq: 8000, category: 'treble', desc: 'Headphone driver resonance spike', descZh: '很多监听耳机经典的 8k 谐振峰', color: '#d946ef' },
  { name: 'Driver Peak', nameZh: '单元谐振区', exactFreq: 8500, category: 'treble', desc: 'Bright monitoring peak', descZh: '亮声耳机的明亮尖锐峰值', color: '#d946ef' },
  { name: 'High Treble', nameZh: '高频清脆度', exactFreq: 9000, category: 'treble', desc: 'Treble crispness & snare top', descZh: '高频脆感与军鼓砂带明亮度', color: '#d946ef' },
  { name: 'Treble Edge', nameZh: '高频泛音边缘', exactFreq: 9500, category: 'treble', desc: 'Upper cymbal detail', descZh: '镲片延伸细节', color: '#ec4899' },
  { name: 'Brilliance', nameZh: '辉煌明亮感', exactFreq: 10000, category: 'treble', desc: 'Clean metallic shimmer', descZh: '金属光泽感与纯净明亮度', color: '#ec4899' },
  { name: 'Metallic Edge', nameZh: '金属质感', exactFreq: 10500, category: 'air', desc: 'Hi-hat edges & crisp air', descZh: '踩镲边沿与通透质感', color: '#ec4899' },
  { name: 'Top Air Rise', nameZh: '极高频空气感', exactFreq: 11000, category: 'air', desc: 'Acoustic air boundary', descZh: '超高频通透空气感起点', color: '#ec4899' },
  { name: 'Shimmer', nameZh: '微光泛音', exactFreq: 11500, category: 'air', desc: 'Delicate acoustic shimmer', descZh: '细腻空灵的泛音延展', color: '#f43f5e' },
  { name: 'Air Detail', nameZh: '空气微细节', exactFreq: 12000, category: 'air', desc: 'Vocal air & recording space', descZh: '录音室空间残响与空气微细节', color: '#f43f5e' },
  { name: 'Top Sparkle', nameZh: '通透火花感', exactFreq: 12500, category: 'air', desc: 'Acoustic sparkle & micro-detail', descZh: '高频开阔度与灵动细节', color: '#f43f5e' },
  { name: 'Ultra Shimmer', nameZh: '超高微光', exactFreq: 13000, category: 'air', desc: 'Airy cymbal overtone', descZh: '镲片空灵微弱泛音', color: '#f43f5e' },
  { name: 'Micro Detail', nameZh: '微弱空间感', exactFreq: 13500, category: 'air', desc: 'Subtle soundstage nuances', descZh: '声场微弱信息与纵深感知', color: '#fb7185' },
  { name: 'High Air', nameZh: '高空气感', exactFreq: 14000, category: 'air', desc: 'High acoustic air', descZh: '声场开阔通透度', color: '#fb7185' },
  { name: 'Air Extension', nameZh: '空气延展', exactFreq: 14500, category: 'air', desc: 'Soundstage extension', descZh: '空间感向外扩散延展', color: '#fb7185' },
  { name: 'Soundstage Air', nameZh: '声场宽广度', exactFreq: 15000, category: 'air', desc: 'Spaciousness & breathing room', descZh: '听感呼吸感与脱箱感', color: '#fb7185' },
  { name: 'Ambience', nameZh: '现场氛围残响', exactFreq: 15500, category: 'air', desc: 'Recording room ambience', descZh: '录音现场环境声与堂音', color: '#fb7185' },
  { name: 'Top Air', nameZh: '极限极高频', exactFreq: 16000, category: 'air', desc: 'Highest audible air', descZh: '人耳可闻极高频顶部', color: '#fb7185' },
  { name: 'Ultra High', nameZh: '超极限频段', exactFreq: 16500, category: 'air', desc: 'Upper frequency extension', descZh: '超高频延伸', color: '#fda4af' },
  { name: 'Upper Air', nameZh: '超高声学泛音', exactFreq: 17000, category: 'air', desc: 'Airy sheen', descZh: '超高频光泽感', color: '#fda4af' },
  { name: 'Extreme High', nameZh: '极高听阈边缘', exactFreq: 17500, category: 'air', desc: 'Near ultrasonic boundary', descZh: '接近超声波边缘', color: '#fda4af' },
  { name: 'Near Ultrasonic', nameZh: '接近超声波', exactFreq: 18000, category: 'air', desc: 'Adult human hearing limit', descZh: '多数成年人听觉极限', color: '#fda4af' },
  { name: 'Hearing Limit', nameZh: '听力天花板', exactFreq: 18500, category: 'air', desc: 'Ultra-high ceiling', descZh: '极高频听力门槛', color: '#fda4af' },
  { name: 'Upper Limit', nameZh: '最高可听上限', exactFreq: 19000, category: 'air', desc: 'Top edge of audible sound', descZh: '可闻声极顶边缘', color: '#fda4af' },
  { name: 'Threshold', nameZh: '极限临界点', exactFreq: 19500, category: 'air', desc: 'Acoustic threshold', descZh: '人耳声学上限临界点', color: '#fda4af' },
  { name: '20 kHz Ceiling', nameZh: '20kHz 终点线', exactFreq: 20000, category: 'air', desc: 'Standard 20 kHz ceiling', descZh: '标准 20 kHz 声频天花板', color: '#fda4af' },
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
    nameZh: '极低频 (Sub-Bass)',
    minFreq: 20,
    maxFreq: 60,
    description: 'Deep physical rumble and sub vibrations',
    descriptionZh: '深沉的物理震动与超低音下潜感',
    commonProblems: 'Can cause headphones to rattle or sound hollow if missing.',
    commonProblemsZh: '过强会导致耳机振膜杂音破音，缺失则声音空洞无力。',
    typicalFix: 'Boost slightly for movie/gaming rumble; cut if rattling.',
    typicalFixZh: '看电影或游戏可微幅提升；若耳机振膜破音请适当削减。',
    color: '#ef4444',
  },
  {
    name: 'Punchy Bass',
    nameZh: '中低音打击感 (Bass)',
    minFreq: 60,
    maxFreq: 250,
    description: 'Kick drums, basslines, and musical warmth',
    descriptionZh: '底鼓力度、贝斯节奏与音乐厚重感',
    commonProblems: 'Too much causes boominess and bleeds into voices.',
    commonProblemsZh: '过量会导致严重轰头，浑浊的声音会掩盖人声细节。',
    typicalFix: 'Boost 80Hz for thump; cut 150-200Hz if boomy.',
    typicalFixZh: '提升 80Hz 增加打击感；若感到轰头可削减 150-200Hz。',
    color: '#f97316',
  },
  {
    name: 'Muddiness / Box',
    nameZh: '浑浊 / 纸盒桶音 (Low-Mids)',
    minFreq: 250,
    maxFreq: 500,
    description: 'Lower midrange; where sound gets "cardboard" or muddy',
    descriptionZh: '中低频过渡区，声音易发闷或呈现纸盒空洞感',
    commonProblems: 'Many headphones have an annoying muffled boxy tone here.',
    commonProblemsZh: '很多耳机在此区域堆积，导致声音听起来像蒙在桶里。',
    typicalFix: 'Cut 2 to 4 dB around 300-400Hz to clarify vocals.',
    typicalFixZh: '在 300-400Hz 削减 2 到 4 dB 可令人声瞬间清晰通透。',
    color: '#eab308',
  },
  {
    name: 'Vocal Midrange',
    nameZh: '人声核心中频 (Midrange)',
    minFreq: 500,
    maxFreq: 2000,
    description: 'Human voices, piano body, and acoustic instruments',
    descriptionZh: '人声主干、钢琴与各类原声乐器的基音区',
    commonProblems: 'Can sound hollow, nasal, or like a cheap megaphone.',
    commonProblemsZh: '不平整会导致声音空洞、浓重鼻音或像廉价大喇叭广播。',
    typicalFix: 'Gentle 1-2 dB boost brings vocals forward.',
    typicalFixZh: '温和提升 1-2 dB 可让人声更加贴耳靠前。',
    color: '#10b981',
  },
  {
    name: 'Clarity & Presence',
    nameZh: '清晰度与临场感 (Presence)',
    minFreq: 2000,
    maxFreq: 5000,
    description: 'Definition, guitar attack, and vocal presence',
    descriptionZh: '咬字清晰度、吉他拨弦与歌声临场感',
    commonProblems: 'Too much sounds crunchy, shouty, and causes ear fatigue.',
    commonProblemsZh: '过量会导致声音极度刺耳、发冲发硬，迅速引发听觉疲劳。',
    typicalFix: 'Cut 2-3 dB if the headphone hurts your ears at high volume.',
    typicalFixZh: '如果大音量下耳机刺痛耳朵，建议在此频段削减 2-3 dB。',
    color: '#06b6d4',
  },
  {
    name: 'Piercing Treble',
    nameZh: '刺耳齿音尖峰区 (Treble)',
    minFreq: 5000,
    maxFreq: 9000,
    description: 'The #1 problem area: harsh "S", "T" sibilance & cymbals',
    descriptionZh: '耳机最常见翻车重灾区：尖锐齿音与镲片金属啸叫',
    commonProblems: 'Sharp piercing peaks here make listening painful.',
    commonProblemsZh: '强烈的频响毛刺峰会带来针扎般的尖叫与强齿音。',
    typicalFix: 'Find the ringing frequency (often 5.8k-8k) and cut 3 to 6 dB!',
    typicalFixZh: '找出具体刺耳频点 (多为 5.8k-8k)，精准削减 3 到 6 dB！',
    color: '#a855f7',
  },
  {
    name: 'Air & Sparkle',
    nameZh: '极高频空气感 (Air)',
    minFreq: 9000,
    maxFreq: 20000,
    description: 'Ultra-high frequencies, breathing room, and soundstage air',
    descriptionZh: '超高频延展、声场开阔通透度与空间残响',
    commonProblems: 'Too quiet makes audio feel closed-in; too loud sounds hissy.',
    commonProblemsZh: '缺失会令声场闭塞发暗；过强则会带来恼人的高频沙沙底噪。',
    typicalFix: 'Gentle wide boost (+2 dB) adds airy shimmer and detail.',
    typicalFixZh: '平缓宽频提升 (+2 dB) 可增添空灵开阔的声场细节。',
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
