export type Language = 'en' | 'zh';

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;
  playTone: string;
  stopTone: string;
  volume: string;
  safeLimit: string;
  safeTooltip: string;
  bypassOff: string;
  bypassOn: string;
  bypassTooltip: string;
  exportFixes: string;
  github: string;
  helpTooltip: string;

  // Scanner (Step 1)
  step1Title: string;
  step1Subtitle: string;
  autoScanStart: string;
  autoScanPause: string;
  scanSpeedSlow: string;
  scanSpeedNormal: string;
  scanSpeedFast: string;
  fineTune: string;
  jumpTitle: string;
  jumpSubtitle: string;
  catAll: string;
  catBass: string;
  catMids: string;
  catTreble: string;
  catAir: string;

  // Fixer (Step 2)
  step2Title: string;
  step2Subtitle: string;
  fixActive: string;
  tooLoudBtn: string;
  tooQuietBtn: string;
  soundsNormalBtn: string;
  gainLabel: string;
  quickPresets: string;
  widthLabel: string;
  widthNarrowTitle: string;
  widthNarrowDesc: string;
  widthNormalTitle: string;
  widthNormalDesc: string;
  widthWideTitle: string;
  widthWideDesc: string;
  liveFeedback: string;
  deleteFix: string;

  // Music Audition
  musicAuditionTitle: string;
  musicAuditionSubtitle: string;
  uploadMusicBtn: string;
  uploadMusicDesc: string;
  changeMusic: string;
  playMusic: string;
  pauseMusic: string;
  loopTooltip: string;
  rewind5s: string;
  forward5s: string;
  abCompareTitle: string;
  abCompareDesc: string;
  musicEqOn: string;
  musicBypass: string;
  noMusicLoaded: string;

  // Visualizer (Step 3)
  step3Title: string;
  step3Subtitle: string;
  visualPreview: string;
  flatReference: string;

  // Fixes List (Step 4)
  step4Title: string;
  clearAll: string;
  confirmClear: string;
  noFixesYet: string;
  peakCut: string;
  dipBoost: string;
  listenTooltip: string;
  deleteTooltip: string;

  // Export Modal
  exportModalTitle: string;
  tabWindows: string;
  tabAndroid: string;
  tabUniversal: string;
  apoTitle: string;
  apoDesc: string;
  waveletTitle: string;
  waveletDesc: string;
  tableTitle: string;
  tableDesc: string;
  downloadFile: string;
  copyClipboard: string;
  copiedSuccess: string;

  // Help Modal
  helpModalTitle: string;
  helpStep1Title: string;
  helpStep1Desc: string;
  helpStep2Title: string;
  helpStep2Desc: string;
  helpStep3Title: string;
  helpStep3Desc: string;
  helpStep4Title: string;
  helpStep4Desc: string;
  helpCloseBtn: string;

  // Footer
  footerText: string;
  githubRepo: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    // Header
    appTitle: 'Headphone & Speaker EQ Fixer',
    appSubtitle: 'Find harsh peaks or quiet dips, level the dB, and export to your EQ app.',
    playTone: 'PLAY TONE',
    stopTone: 'STOP TONE',
    volume: 'Volume',
    safeLimit: 'SAFE',
    safeTooltip: 'Hardware ear safety limiter is active to protect against accidental loud volume',
    bypassOff: 'EQ Fixes ON',
    bypassOn: 'Original (Bypass)',
    bypassTooltip: 'Toggle to compare with original sound without fixes',
    exportFixes: 'Export Fixes',
    github: 'GitHub',
    helpTooltip: 'How to use this app',

    // Scanner
    step1Title: 'Scan Frequencies & Listen',
    step1Subtitle: 'Drag slider or click any frequency card below',
    autoScanStart: 'AUTO-SCAN FREQUENCIES',
    autoScanPause: 'PAUSE SCAN (STOP HERE)',
    scanSpeedSlow: 'Slow',
    scanSpeedNormal: 'Normal',
    scanSpeedFast: 'Fast',
    fineTune: 'Fine Tune:',
    jumpTitle: 'Jump Directly to Frequency:',
    jumpSubtitle: '(every 0.5 kHz after 1k)',
    catAll: 'All',
    catBass: 'Bass (<250Hz)',
    catMids: 'Mids (250-2k)',
    catTreble: 'Treble (2.5k-10k)',
    catAir: 'Air (>10k)',

    // Fixer
    step2Title: 'Fix This Frequency',
    step2Subtitle: 'How does this frequency sound compared to the rest?',
    fixActive: 'Fix Active',
    tooLoudBtn: 'TOO LOUD (CUT PEAK)',
    tooQuietBtn: 'TOO QUIET (BOOST DIP)',
    soundsNormalBtn: 'SOUNDS NORMAL (NO FIX)',
    gainLabel: 'Loudness Adjustment (dB):',
    quickPresets: 'Quick:',
    widthLabel: 'Filter Width:',
    widthNarrowTitle: 'Narrow',
    widthNarrowDesc: 'Target a sharp, ringing peak or notch',
    widthNormalTitle: 'Normal',
    widthNormalDesc: 'Standard balance for most peaks & dips',
    widthWideTitle: 'Wide',
    widthWideDesc: 'Gentle warmth, brightness, or broad dip',
    liveFeedback: 'Live sound updated! Listen through your headphones.',
    deleteFix: 'Delete Fix',

    // Music Audition
    musicAuditionTitle: 'Audition on Your Music (A/B Test)',
    musicAuditionSubtitle: 'Upload a favorite song to hear how your EQ fixes improve real music',
    uploadMusicBtn: 'Upload Audio File',
    uploadMusicDesc: 'Supports MP3, WAV, FLAC, AAC, M4A, OGG',
    changeMusic: 'Change Song',
    playMusic: 'PLAY MUSIC',
    pauseMusic: 'PAUSE',
    loopTooltip: 'Loop playback',
    rewind5s: '-5s',
    forward5s: '+5s',
    abCompareTitle: 'Instant A/B Compare:',
    abCompareDesc: 'Toggle back and forth while your music plays to hear before & after',
    musicEqOn: 'EQ Applied (Clean & Smooth)',
    musicBypass: 'Original Audio (Uncorrected)',
    noMusicLoaded: 'No music loaded yet. Upload your favorite song to compare how your EQ fixes sound on real tracks.',

    // Visualizer
    step3Title: 'Live Frequency Response Curve',
    step3Subtitle: 'Click anywhere on curve to jump',
    visualPreview: 'Visual Preview • 20 Hz – 20 kHz',
    flatReference: '0 dB (Flat)',

    // Fixes List
    step4Title: 'My EQ Fixes',
    clearAll: 'Clear All',
    confirmClear: 'Clear all applied EQ fixes and start fresh?',
    noFixesYet: 'No fixes created yet! Use Step 1 to scan through frequencies. When a spot sounds noticeably piercing or quiet, stop and adjust it in Step 2.',
    peakCut: 'Peak Cut',
    dipBoost: 'Dip Boost',
    listenTooltip: 'Jump to frequency and listen',
    deleteTooltip: 'Delete this fix',

    // Export Modal
    exportModalTitle: 'Export Your EQ Fixes',
    tabWindows: 'Windows (Peace / APO)',
    tabAndroid: 'Android (Wavelet)',
    tabUniversal: 'Mac & Hardware Table',
    apoTitle: 'Equalizer APO & Peace GUI (Windows)',
    apoDesc: 'Open Peace GUI or Equalizer APO. Paste these lines into your config file or type them into the Peace parametric sliders.',
    waveletTitle: 'Wavelet & Poweramp (Android)',
    waveletDesc: 'Import this file into Wavelet (AutoEq import) or Poweramp Equalizer to apply these corrections system-wide on your phone.',
    tableTitle: 'Universal Table (SoundSource, eqMac, Qudelix-5K, MiniDSP)',
    tableDesc: 'Enter these exact Frequency, Gain, and Q numbers into SoundSource, eqMac, Apple Music EQ, or your DAC/Amp hardware.',
    downloadFile: 'Download File',
    copyClipboard: 'Copy to Clipboard',
    copiedSuccess: 'Copied to Clipboard!',

    // Help Modal
    helpModalTitle: 'How to Fix Headphone & Speaker Sound',
    helpStep1Title: 'Put On Your Headphones & Hit "Play Tone"',
    helpStep1Desc: 'Ensure volume is at a moderate, comfortable level. You\'ll hear a smooth, continuous pure tone.',
    helpStep2Title: 'Scan Frequencies to Find Peaks or Dips',
    helpStep2Desc: 'Slowly drag the slider from 20 Hz to 20,000 Hz, or click Auto-Scan. Listen carefully: does any frequency suddenly sound shriekingly loud (a harsh treble peak) or barely audible (a recessed dip)?',
    helpStep3Title: 'Adjust dB On The Spot',
    helpStep3Desc: 'Hit pause at that frequency! Click "Too Loud (Cut Peak)" and adjust the dB slider down until that pitch sounds equal in volume to the frequencies around it.',
    helpStep4Title: 'Compare & Export',
    helpStep4Desc: 'Use the A/B Compare button to hear the difference between your fixes and original sound. When happy, click Export Fixes and paste into Equalizer APO, Peace, or Wavelet!',
    helpCloseBtn: 'Got It, Let\'s Start Listening!',

    // Footer
    footerText: 'Headphone & Speaker EQ Fixer • Equalizer APO, Wavelet, & Poweramp Ready',
    githubRepo: 'GitHub Repository',
  },

  zh: {
    // Header
    appTitle: '耳机 / 音箱 EQ 频响调音器',
    appSubtitle: '轻松找出刺耳尖峰或下陷凹坑，实时调整分贝，一键导出到各大均衡器。',
    playTone: '播放纯音',
    stopTone: '停止播放',
    volume: '音量',
    safeLimit: '安全限幅',
    safeTooltip: '硬件级安全限幅器已启用，防止过大音量保护听力',
    bypassOff: 'EQ 修正开启',
    bypassOn: '原始声音 (直通对比)',
    bypassTooltip: '点击切换原声与调音效果进行 A/B 对比',
    exportFixes: '导出调音设置',
    github: 'GitHub',
    helpTooltip: '使用指南与教程',

    // Scanner
    step1Title: '步骤 1：扫描频段并仔细聆听',
    step1Subtitle: '拖动滑块或点击下方卡片，监听响度不均衡的频点',
    autoScanStart: '自动扫频试听',
    autoScanPause: '暂停扫频 (停在此频点)',
    scanSpeedSlow: '慢速',
    scanSpeedNormal: '正常',
    scanSpeedFast: '快速',
    fineTune: '微调频率：',
    jumpTitle: '常用与关键频点跳转：',
    jumpSubtitle: '(1k 以上每 0.5 kHz 步进)',
    catAll: '全部',
    catBass: '低频 (<250Hz)',
    catMids: '中频 (250-2k)',
    catTreble: '高频 (2.5k-10k)',
    catAir: '极高频 (>10k)',

    // Fixer
    step2Title: '步骤 2：针对当前频点进行微调',
    step2Subtitle: '与周围频段相比，当前声音听起来如何？',
    fixActive: '已生效修正',
    tooLoudBtn: '太响 / 刺耳 (削减尖峰)',
    tooQuietBtn: '太小声 / 凹陷 (提升凹坑)',
    soundsNormalBtn: '声音均衡 (无需修正)',
    gainLabel: '响度增益微调 (dB)：',
    quickPresets: '快速分贝：',
    widthLabel: '滤波器带宽 (宽度)：',
    widthNarrowTitle: '窄频 (Q: 4.5)',
    widthNarrowDesc: '精准消除刺耳共振尖峰或狭窄陷波',
    widthNormalTitle: '标准 (Q: 1.41)',
    widthNormalDesc: '适用于大多数常见耳机的峰谷调节',
    widthWideTitle: '宽频 (Q: 0.71)',
    widthWideDesc: '大范围整体提亮、增温或平缓微调',
    liveFeedback: '声音已实时更新！戴上耳机立即感受变化。',
    deleteFix: '删除此项修正',

    // Music Audition
    musicAuditionTitle: '音乐试听与 A/B 盲听对比',
    musicAuditionSubtitle: '上传您常听的歌曲，试听 EQ 修正对真实音乐的音质改善效果',
    uploadMusicBtn: '上传音频文件',
    uploadMusicDesc: '支持 MP3, WAV, FLAC, AAC, M4A, OGG 等格式',
    changeMusic: '更换歌曲',
    playMusic: '播放音乐',
    pauseMusic: '暂停播放',
    loopTooltip: '单曲循环',
    rewind5s: '-5秒',
    forward5s: '+5秒',
    abCompareTitle: '一键 A/B 切换对比：',
    abCompareDesc: '播放音乐时反复点击切换，直观感受调音前后的音质对比',
    musicEqOn: 'EQ 修正已生效 (声音更平滑自然)',
    musicBypass: '原始音频 (未修正直通原声)',
    noMusicLoaded: '尚未加载歌曲。请点击上方按钮从电脑中选择您熟悉的试音曲目。',

    // Visualizer
    step3Title: '步骤 3：实时频响修正曲线',
    step3Subtitle: '点击曲线上任意位置即可跳转试听',
    visualPreview: '可视化频响 • 20 Hz – 20 kHz',
    flatReference: '0 dB (基准参考线)',

    // Fixes List
    step4Title: '步骤 4：已应用的 EQ 修正清单',
    clearAll: '清空全部',
    confirmClear: '确定要清空所有已应用的调音修正吗？',
    noFixesYet: '尚未添加任何修正。请在步骤 1 中扫描频段，如果发现刺耳或凹陷频点，暂停并在步骤 2 中进行调节。',
    peakCut: '削减尖峰',
    dipBoost: '提升凹陷',
    listenTooltip: '跳转至此频点并试听',
    deleteTooltip: '删除该项修正',

    // Export Modal
    exportModalTitle: '导出您的 Parametric EQ 调音配置',
    tabWindows: 'Windows (Peace / APO)',
    tabAndroid: 'Android (Wavelet / Poweramp)',
    tabUniversal: 'Mac / 硬件参数表格',
    apoTitle: 'Equalizer APO & Peace GUI (Windows 平台)',
    apoDesc: '打开 Peace GUI 或 Equalizer APO，将下方配置复制粘贴到 config.txt 或导入到 Peace 参数均衡器中。',
    waveletTitle: 'Wavelet & Poweramp 均衡器 (安卓平台)',
    waveletDesc: '可将此文件导入 Wavelet (AutoEq 导入) 或 Poweramp 均衡器中，实现手机全局调音修正。',
    tableTitle: '通用参数表 (SoundSource, eqMac, Qudelix-5K, MiniDSP)',
    tableDesc: '直接将以下频率(Hz)、增益(dB)、Q值填入 Mac 版 SoundSource、eqMac 或蓝牙解码耳放(Qudelix, BTR)等硬件中。',
    downloadFile: '下载配置文件',
    copyClipboard: '复制到剪贴板',
    copiedSuccess: '已成功复制到剪贴板！',

    // Help Modal
    helpModalTitle: '耳机与音箱 EQ 调音入门指南',
    helpStep1Title: '1. 戴上耳机，点击“播放纯音”',
    helpStep1Desc: '请先将音量调至适中且舒适的水平。此时您将听到纯净且连贯的正弦单音频信号。',
    helpStep2Title: '2. 移动滑块扫频，寻找刺耳峰或凹陷点',
    helpStep2Desc: '缓慢拖动滑块从 20 Hz 扫向 20,000 Hz，或直接开启“自动扫频”。请仔细感受：是否有某个频段突然异常刺耳啸叫（高频毛刺峰），或是突然沉寂听不清（频响下陷）？',
    helpStep3Title: '3. 发现异常频点，当场调整分贝',
    helpStep3Desc: '在刺耳处暂停，点击“太响/刺耳”，向下拉动 dB 滑块，直至这个音高的响度与周围频段听起来一样平滑均衡。',
    helpStep4Title: '4. 对比效果并一键导出',
    helpStep4Desc: '点击顶部的“原始声音(直通)”按钮，快速对比调音前后的音质差别。满意后点击“导出调音设置”，即可应用到各类专业 EQ 软件中！',
    helpCloseBtn: '了解，开始调音！',

    // Footer
    footerText: '耳机与音箱 EQ 频响调音器 • 支持 Equalizer APO、Wavelet 及专业参数均衡器',
    githubRepo: 'GitHub 开源项目',
  },
};
