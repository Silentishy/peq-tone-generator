export type Language = 'en' | 'zh';

export interface Translations {
  // Header & Controls
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
  shortcutsTooltip: string;
  profileLabel: string;
  headroomLabel: string;
  headroomOk: string;

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
  toneModeSine: string;
  toneModeNoise: string;
  toneModeSineDesc: string;
  toneModeNoiseDesc: string;
  equalLoudnessToggle: string;
  equalLoudnessOn: string;
  equalLoudnessOff: string;
  equalLoudnessTooltip: string;
  pinnaGainNotice: string;

  // 3-Point Q Finder (Step 1 - eqbyear method)
  qFinderTitle: string;
  qFinderSubtitle: string;
  qFinderStart: string;
  qFinderTop: string;
  qFinderEnd: string;
  qFinderReset: string;
  qFinderApply: string;
  qFinderSpan: string;

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
  exactQLabel: string;
  qNoticeShelf: string;
  qNoticeBell: string;
  widthNarrowTitle: string;
  widthNarrowDesc: string;
  widthNormalTitle: string;
  widthNormalDesc: string;
  widthWideTitle: string;
  widthWideDesc: string;
  filterShapeLabel: string;
  shapeBell: string;
  shapeShelf: string;
  addHarmanShelfBtn: string;
  bassShelfBadge: string;
  bassShelfDesc: string;
  liveFeedback: string;
  deleteFix: string;

  // Music Audition (Step 3)
  musicAuditionTitle: string;
  musicAuditionSubtitle: string;
  uploadMusicBtn: string;
  uploadMusicDesc: string;
  changeMusic: string;
  removeMusicTooltip: string;
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
  benchmarkTracksTitle: string;
  benchmarkTrackVocal: string;
  benchmarkTrackBass: string;
  benchmarkTrackPink: string;

  // Visualizer (Step 4)
  step3Title: string;
  step3Subtitle: string;
  visualPreview: string;
  flatReference: string;
  afterEqCurveLabel: string;
  netPreampCurveLabel: string;
  bypassedLabel: string;
  dragHint: string;
  zoomIn: string;
  zoomOut: string;
  zoomReset: string;
  dbScaleLabel: string;
  toggleCurveEq: string;
  toggleCurveNet: string;
  toggleCurveBaseline: string;
  toggleCurveRta: string;
  toggleCurveNodes: string;
  freqFocusSliderLabel: string;
  freqFocusCenter: string;
  freqFocusVisible: string;
  zoomLevelLabel: string;
  focusActiveBtn: string;

  // Fixes List (Step 5)
  step4Title: string;
  clearAll: string;
  undoBtn: string;
  undoTooltip: string;
  confirmClear: string;
  noFixesYet: string;
  peakCut: string;
  dipBoost: string;
  listenTooltip: string;
  deleteTooltip: string;

  // Profiles Manager
  profileDefault: string;
  profileIEM: string;
  profileOverEar: string;
  profileSpeakers: string;
  addProfile: string;
  renameProfile: string;
  deleteProfile: string;
  promptProfileName: string;

  // Workflow Stepper & Responsive Guide
  stepperTitle: string;
  stepperStep1: string;
  stepperStep2: string;
  stepperStep3: string;
  stepperStep4: string;
  toggleLandmarksShow: string;
  toggleLandmarksHide: string;
  step4SectionTitle: string;
  step5SectionTitle: string;

  // Export & Import Modal
  exportModalTitle: string;
  tabWindows: string;
  tabAndroid: string;
  tabUniversal: string;
  tabImport: string;
  apoTitle: string;
  apoDesc: string;
  waveletTitle: string;
  waveletDesc: string;
  tableTitle: string;
  tableDesc: string;
  downloadFile: string;
  copyClipboard: string;
  copiedSuccess: string;
  preampSetting: string;
  autoPreampLabel: string;
  importTitle: string;
  importDesc: string;
  importDropzone: string;
  importDropzoneFormats: string;
  importOrPasteSnippet: string;
  importPlaceholder: string;
  importBtn: string;
  importSuccess: string;
  importError: string;
  importFileSummary: string;

  // Keyboard Shortcuts Modal
  shortcutsTitle: string;
  shortcutSpaceDesc: string;
  shortcutArrowsLRDesc: string;
  shortcutArrowsShiftLRDesc: string;
  shortcutArrowsUDSDesc: string;
  shortcutBDesc: string;
  shortcutSDesc: string;
  shortcutUndoDesc: string;
  shortcutRedoDesc: string;
  shortcut1Desc: string;
  shortcut2Desc: string;
  shortcut3Desc: string;
  shortcutCloseBtn: string;

  // Feedback Toast
  toastUndo: string;
  toastRedo: string;
  toastMarkedStart: string;
  toastMarkedTop: string;
  toastMarkedEnd: string;
  toastAppliedQ: string;

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
    // Header & Controls
    appTitle: 'Headphone & Speaker EQ Fixer',
    appSubtitle: 'Find harsh peaks or quiet dips, level the dB, and audition with your music.',
    playTone: 'PLAY TONE',
    stopTone: 'STOP TONE',
    volume: 'Volume',
    safeLimit: 'SAFE',
    safeTooltip: 'Hardware ear safety limiter is active to protect against accidental loud volume',
    bypassOff: 'EQ Fixes ON',
    bypassOn: 'Original (Bypass)',
    bypassTooltip: 'Toggle to compare with original sound without fixes (Shortcut: B)',
    exportFixes: 'Export & Import',
    github: 'GitHub',
    helpTooltip: 'How to use this app',
    shortcutsTooltip: 'Keyboard Shortcuts (Space, Arrows, B, S)',
    profileLabel: 'Device Profile:',
    headroomLabel: 'Preamp:',
    headroomOk: 'Safe Headroom',

    // Scanner
    step1Title: 'Step 1: Scan Frequencies & Listen',
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
    toneModeSine: 'Pure Sine Wave',
    toneModeNoise: 'Narrowband Noise',
    toneModeSineDesc: 'Pure single frequency (Best for Headphones)',
    toneModeNoiseDesc: 'Filtered noise burst (Best for Room Speakers - avoids standing waves)',
    equalLoudnessToggle: 'ISO 226 Loudness Compensation',
    equalLoudnessOn: 'Loudness Comp ON',
    equalLoudnessOff: 'Loudness Comp OFF',
    equalLoudnessTooltip: 'Fletcher-Munson Equal-Loudness Normalization: Normalizes human ear sensitivity so tone sweep feels subjectively even in loudness',
    pinnaGainNotice: 'Note: Human ear canals naturally amplify 2.5k–4.5kHz by 6–10 dB. Only cut if it sounds screeching or noticeably louder than adjacent frequencies.',

    // 3-Point Q Finder (Step 1 - eqbyear method)
    qFinderTitle: '3-Point Q Finder (eqbyear method)',
    qFinderSubtitle: 'Mark 1 (Start), 2 (Peak), 3 (End) to calculate exact Q',
    qFinderStart: 'Start',
    qFinderTop: 'Peak / Center',
    qFinderEnd: 'End',
    qFinderReset: 'Clear Marks',
    qFinderApply: 'Use in Step 2',
    qFinderSpan: 'Span',

    // Fixer
    step2Title: 'Step 2: Fix This Frequency',
    step2Subtitle: 'How does this frequency sound compared to the rest?',
    fixActive: 'Fix Active',
    tooLoudBtn: 'TOO LOUD (CUT PEAK)',
    tooQuietBtn: 'TOO QUIET (BOOST DIP)',
    soundsNormalBtn: 'SOUNDS NORMAL (NO FIX)',
    gainLabel: 'Loudness Adjustment (dB):',
    quickPresets: 'Quick:',
    widthLabel: 'Filter Width & Q Factor:',
    exactQLabel: 'Exact Q Value:',
    qNoticeShelf: 'Low Shelf slope: Q=0.71 is the standard smooth Butterworth slope (no overshoot). Higher Q values steepen the transition with slight resonance.',
    qNoticeBell: 'Higher Q values narrow the filter to surgically pinpoint a sharp peak. Lower Q values widen the filter for broad tonal balance.',
    widthNarrowTitle: 'Narrow (Q: 4.5)',
    widthNarrowDesc: 'Target a sharp, ringing peak or notch',
    widthNormalTitle: 'Normal (Q: 1.41)',
    widthNormalDesc: 'Standard balance for most peaks & dips',
    widthWideTitle: 'Wide (Q: 0.71)',
    widthWideDesc: 'Gentle warmth, brightness, or broad dip',
    filterShapeLabel: 'Filter Shape:',
    shapeBell: '🎯 Bell / Peak',
    shapeShelf: '🌊 Bass Shelf (Low Shelf)',
    addHarmanShelfBtn: '+ Harman Bass Shelf (+4.5 dB @ 105 Hz)',
    bassShelfBadge: 'Bass Shelf',
    bassShelfDesc: 'Low Shelf filter smoothly boosts or cuts all sub-bass below this frequency.',
    liveFeedback: 'Live sound updated! Listen through your headphones.',
    deleteFix: 'Delete Fix',

    // Music Audition
    musicAuditionTitle: 'Step 3: Audition on Music (A/B Test)',
    musicAuditionSubtitle: 'Test with your own songs or built-in audio benchmarks',
    uploadMusicBtn: 'Upload Audio File',
    uploadMusicDesc: 'Supports MP3, WAV, FLAC, AAC, M4A, OGG',
    changeMusic: 'Change Song',
    removeMusicTooltip: 'Remove this uploaded song and free its memory',
    playMusic: 'PLAY MUSIC',
    pauseMusic: 'PAUSE',
    loopTooltip: 'Loop playback',
    rewind5s: '-5s',
    forward5s: '+5s',
    abCompareTitle: 'Instant A/B Compare:',
    abCompareDesc: 'Toggle back and forth while music plays to hear before & after',
    musicEqOn: 'EQ Applied (Clean & Smooth)',
    musicBypass: 'Original Audio (Uncorrected)',
    noMusicLoaded: 'No music loaded yet. Select a built-in benchmark track or upload your favorite song.',
    benchmarkTracksTitle: 'Built-in Test Tracks (No Upload Needed):',
    benchmarkTrackVocal: '🎤 Vocal & Sibilance',
    benchmarkTrackBass: '🥁 Bass & Kick Punch',
    benchmarkTrackPink: '🌊 Full Pink Noise',

    // Visualizer
    step3Title: 'Live Frequency Response Curve',
    step3Subtitle: 'Drag nodes directly on the graph or click to jump',
    visualPreview: 'Visual Preview • 20 Hz – 20 kHz',
    flatReference: '0 dB (Flat Reference)',
    afterEqCurveLabel: 'Frequency Response After EQ',
    netPreampCurveLabel: 'Net Output (with Preamp)',
    bypassedLabel: 'BYPASS (Original 0 dB)',
    dragHint: 'Drag nodes: horizontal = Freq, vertical = Gain. Scroll wheel = Width. Click +/- or drag background to zoom & pan.',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    zoomReset: 'Reset Zoom',
    dbScaleLabel: 'Scale:',
    toggleCurveEq: 'EQ Curve',
    toggleCurveNet: 'Net Preamp',
    toggleCurveBaseline: '0 dB Line',
    toggleCurveRta: 'RTA Glow',
    toggleCurveNodes: 'Nodes',
    freqFocusSliderLabel: 'Frequency Focus Slider:',
    freqFocusCenter: 'Center:',
    freqFocusVisible: 'Visible Window:',
    zoomLevelLabel: 'Zoom:',
    focusActiveBtn: '🎯 Focus Active',

    // Fixes List
    step4Title: 'My EQ Fixes',
    clearAll: 'Clear All',
    undoBtn: 'Undo',
    undoTooltip: 'Undo the last change (Ctrl/Cmd+Z)',
    confirmClear: 'Clear all applied EQ fixes in this profile and start fresh?',
    noFixesYet: 'No fixes created yet! Use Step 1 to scan through frequencies. When a spot sounds noticeably piercing or quiet, stop and adjust it in Step 2.',
    peakCut: 'Peak Cut',
    dipBoost: 'Dip Boost',
    listenTooltip: 'Jump to frequency and listen',
    deleteTooltip: 'Delete this fix',

    // Profiles Manager
    profileDefault: 'Default Profile',
    profileIEM: 'AirPods / In-Ear',
    profileOverEar: 'Over-Ear Headphones',
    profileSpeakers: 'Desktop Speakers',
    addProfile: '+ New Device Profile',
    renameProfile: 'Rename Profile',
    deleteProfile: 'Delete Profile',
    promptProfileName: 'Enter a name for this EQ profile (e.g., Sennheiser HD600, AirPods Pro):',

    // Workflow Stepper & Responsive Guide
    stepperTitle: 'Guided 4-Step Tuning Workflow:',
    stepperStep1: '1. Scan & Spot',
    stepperStep2: '2. Level dB',
    stepperStep3: '3. Audition Music',
    stepperStep4: '4. Curve & Export',
    toggleLandmarksShow: 'Show All 54 Landmark Frequencies',
    toggleLandmarksHide: 'Collapse Landmark Frequencies',
    step4SectionTitle: 'Step 4: Live EQ Response Curve',
    step5SectionTitle: 'Step 5: Active Fixes Ledger',

    // Export & Import Modal
    exportModalTitle: 'Export & Import EQ Configuration',
    tabWindows: 'Windows (Peace / APO)',
    tabAndroid: 'Android (Wavelet)',
    tabUniversal: 'Mac & Hardware Table',
    tabImport: 'Direct File Import & Text',
    apoTitle: 'Equalizer APO & Peace GUI (Windows)',
    apoDesc: 'Open Peace GUI or Equalizer APO. Paste these lines into your config file or type them into the Peace parametric sliders.',
    waveletTitle: 'Wavelet & Poweramp (Android)',
    waveletDesc: 'Import this file into Wavelet (AutoEq import) or Poweramp Equalizer to apply these corrections system-wide on your phone.',
    tableTitle: 'Universal Table (SoundSource, eqMac, Qudelix-5K, MiniDSP)',
    tableDesc: 'Enter these exact Frequency, Gain, and Q numbers into SoundSource, eqMac, Apple Music EQ, or your DAC/Amp hardware.',
    downloadFile: 'Download File',
    copyClipboard: 'Copy to Clipboard',
    copiedSuccess: 'Copied to Clipboard!',
    preampSetting: 'Digital Headroom / Preamp:',
    autoPreampLabel: 'Auto Headroom Protection (Prevents Digital Clipping)',
    importTitle: 'Import EQ Configuration File or Snippet:',
    importDesc: 'Select an existing configuration file or drag & drop it below to instantly parse and apply:',
    importDropzone: 'Click to choose file or drag & drop EQ config file here',
    importDropzoneFormats: 'Supported: .txt (Equalizer APO / Peace / Wavelet / REW), .json, .csv, .req',
    importOrPasteSnippet: 'Or paste text snippet directly:',
    importPlaceholder: 'e.g.\nPreamp: -3.5 dB\nFilter 1: ON PK Fc 120 Hz Gain 3.0 dB Q 1.41\nFilter 2: ON PK Fc 6200 Hz Gain -4.0 dB Q 4.5',
    importBtn: 'Apply to Current Profile',
    importSuccess: 'Successfully parsed and applied EQ filters!',
    importError: 'Could not find valid filter lines in file. Please check file format.',
    importFileSummary: 'File Detected:',

    // Keyboard Shortcuts Modal
    shortcutsTitle: 'Keyboard Shortcuts Cheat Sheet',
    shortcutSpaceDesc: 'Play / Pause pure tone or music audition',
    shortcutArrowsLRDesc: 'Nudge frequency down / up (±10 Hz)',
    shortcutArrowsShiftLRDesc: 'Jump frequency down / up (±100 Hz)',
    shortcutArrowsUDSDesc: 'Adjust gain for active frequency (±0.5 dB)',
    shortcutBDesc: 'Instant A/B Compare (Toggle EQ / Bypass)',
    shortcutSDesc: 'Toggle Auto-Scan frequency walker',
    shortcutUndoDesc: 'Undo the last EQ change (add, edit, delete, clear, or import)',
    shortcutRedoDesc: 'Redo the last undone EQ change',
    shortcut1Desc: 'Mark peak/dip start frequency [1] for Q calculation',
    shortcut2Desc: 'Mark peak/dip center frequency [2] for Q calculation',
    shortcut3Desc: 'Mark peak/dip end frequency [3] for Q calculation',
    shortcutCloseBtn: 'Close',

    // Feedback Toast
    toastUndo: 'Undid EQ change',
    toastRedo: 'Redid EQ change',
    toastMarkedStart: 'Marked Start at',
    toastMarkedTop: 'Marked Peak at',
    toastMarkedEnd: 'Marked End at',
    toastAppliedQ: 'Applied to Step 2',

    // Help Modal
    helpModalTitle: 'How to Fix Headphone & Speaker Sound',
    helpStep1Title: '1. Put On Your Headphones & Hit "Play Tone"',
    helpStep1Desc: 'Ensure volume is at a moderate, comfortable level. You\'ll hear a smooth, continuous pure tone.',
    helpStep2Title: '2. Scan Frequencies to Find Peaks or Dips',
    helpStep2Desc: 'Slowly drag the slider from 20 Hz to 20,000 Hz, or click Auto-Scan. Listen carefully: does any frequency suddenly sound shriekingly loud (a harsh treble peak) or barely audible (a recessed dip)?',
    helpStep3Title: '3. Adjust dB On The Spot',
    helpStep3Desc: 'Hit pause at that frequency! Click "Too Loud (Cut Peak)" and adjust the dB slider down until that pitch sounds equal in volume to the frequencies around it.',
    helpStep4Title: '4. Compare with Music & Export',
    helpStep4Desc: 'Upload a song or play a built-in benchmark track. Toggle A/B Compare to hear the difference on real music. When happy, export into Equalizer APO, Peace, or Wavelet!',
    helpCloseBtn: 'Got It, Let\'s Start Listening!',

    // Footer
    footerText: 'Headphone & Speaker EQ Fixer • Equalizer APO, Wavelet, & Poweramp Ready',
    githubRepo: 'GitHub Repository',
  },

  zh: {
    // Header & Controls
    appTitle: '耳机 / 音箱 EQ 频响调音器',
    appSubtitle: '轻松找出刺耳尖峰或下陷凹坑，实时调整分贝，并用真实音乐即时试听。',
    playTone: '播放纯音',
    stopTone: '停止播放',
    volume: '音量',
    safeLimit: '安全限幅',
    safeTooltip: '硬件级安全限幅器已启用，防止过大音量保护听力',
    bypassOff: 'EQ 修正开启',
    bypassOn: '原始声音 (直通对比)',
    bypassTooltip: '点击切换原声与调音效果进行 A/B 对比 (快捷键: B)',
    exportFixes: '导出 / 导入配置',
    github: 'GitHub',
    helpTooltip: '使用指南与教程',
    shortcutsTooltip: '键盘快捷键 (空格, 方向键, B, S)',
    profileLabel: '当前设备配置：',
    headroomLabel: '前级增益：',
    headroomOk: '数字动态安全',

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
    toneModeSine: '正弦纯音波',
    toneModeNoise: '窄带粉红噪声',
    toneModeSineDesc: '纯正单频正弦波 (最适合耳机 / 耳塞)',
    toneModeNoiseDesc: '窄带滤波噪声 (最适合音箱桌面测试，避免房间驻波突兀啸叫)',
    equalLoudnessToggle: 'ISO 226 等响度听觉补偿',
    equalLoudnessOn: '等响度补偿：开启',
    equalLoudnessOff: '等响度补偿：关闭',
    equalLoudnessTooltip: '等响度曲线补偿：人耳对 3-4kHz 极敏感，对低频和极高频迟钝。开启后动态加权纯音响度，让扫频听感平直，真实硬件峰值更易暴露',
    pinnaGainNotice: '提示：人耳耳道天生会对 2.5k–4.5kHz 放大 6–10 dB (耳廓增益)。只有该处明显炸耳、比临近频段突兀刺痛时才需削减。',

    // 3-Point Q Finder (Step 1 - eqbyear method)
    qFinderTitle: '三点式 Q 值测算 (eqbyear 算法)',
    qFinderSubtitle: '分别标记 1 (起)、2 (峰)、3 (止) 精准测算 Q 值',
    qFinderStart: '起始点',
    qFinderTop: '最高尖峰',
    qFinderEnd: '结束点',
    qFinderReset: '清空标记',
    qFinderApply: '载入步骤 2',
    qFinderSpan: '频宽',

    // Fixer
    step2Title: '步骤 2：针对当前频点进行微调',
    step2Subtitle: '与周围频段相比，当前声音听起来如何？',
    fixActive: '已生效修正',
    tooLoudBtn: '太响 / 刺耳 (削减尖峰)',
    tooQuietBtn: '太小声 / 凹陷 (提升凹坑)',
    soundsNormalBtn: '声音均衡 (无需修正)',
    gainLabel: '响度增益微调 (dB)：',
    quickPresets: '快速分贝：',
    widthLabel: '滤波器带宽与 Q 值控制：',
    exactQLabel: '精确 Q 值 (品质因子 / 斜率)：',
    qNoticeShelf: '低音搁架斜率：Q=0.71 为标准平滑巴特沃斯斜率（无隆起超调），数值越大过渡越陡峭并带有微弱共振。',
    qNoticeBell: 'Q值越大带宽越窄，适合手术刀般精准切除狭窄刺耳峰；Q值越小带宽越宽，适合大范围平缓调音。',
    widthNarrowTitle: '窄频 (Q: 4.5)',
    widthNarrowDesc: '精准消除刺耳共振尖峰或狭窄陷波',
    widthNormalTitle: '标准 (Q: 1.41)',
    widthNormalDesc: '适用于大多数常见耳机的峰谷调节',
    widthWideTitle: '宽频 (Q: 0.71)',
    widthWideDesc: '大范围整体提亮、增温或平缓微调',
    filterShapeLabel: '滤波器形状 (类型)：',
    shapeBell: '🎯 峰值滤波 (Bell / Peak)',
    shapeShelf: '🌊 低音搁架滤波 (Bass Shelf)',
    addHarmanShelfBtn: '+ 添加哈曼低音搁架 (+4.5 dB @ 105 Hz)',
    bassShelfBadge: '低音搁架',
    bassShelfDesc: '低音搁架滤波：平滑提升或削减该截止频率以下的所有超低频。',
    liveFeedback: '声音已实时更新！戴上耳机立即感受变化。',
    deleteFix: '删除此项修正',

    // Music Audition
    musicAuditionTitle: '步骤 3：音乐试听与 A/B 盲听对比',
    musicAuditionSubtitle: '使用内置基准测试曲目或上传您常听的歌曲，验证 EQ 改善效果',
    uploadMusicBtn: '上传本地音频',
    uploadMusicDesc: '支持 MP3, WAV, FLAC, AAC, M4A, OGG 等格式',
    changeMusic: '更换本地歌曲',
    removeMusicTooltip: '移除已上传的歌曲并释放内存',
    playMusic: '播放音乐',
    pauseMusic: '暂停播放',
    loopTooltip: '单曲循环',
    rewind5s: '-5秒',
    forward5s: '+5秒',
    abCompareTitle: '一键 A/B 切换对比：',
    abCompareDesc: '播放音乐时反复点击切换，直观感受调音前后的音质对比',
    musicEqOn: 'EQ 修正已生效 (声音更平滑自然)',
    musicBypass: '原始音频 (未修正直通原声)',
    noMusicLoaded: '尚未加载歌曲。请直接点击下方内置基准测试曲，或上传本地音乐。',
    benchmarkTracksTitle: '免上传！内置高保真试音片段：',
    benchmarkTrackVocal: '🎤 人声咬字与齿音测试',
    benchmarkTrackBass: '🥁 极低频与底鼓打击感',
    benchmarkTrackPink: '🌊 全频段校准粉红噪声',

    // Visualizer
    step3Title: '实时频响修正曲线',
    step3Subtitle: '可直接在曲线上拖动节点微调，或点击空白处跳转试听',
    visualPreview: '可视化频响 • 20 Hz – 20 kHz',
    flatReference: '0 dB (基准参考线)',
    afterEqCurveLabel: 'EQ 修正后频响曲线',
    netPreampCurveLabel: '净输出 (含前级增益)',
    bypassedLabel: '直通原声 (0 dB)',
    dragHint: '直接拖拽节点：水平调节频率，垂直调节增益。滚轮调节宽度，拖拽空白背景可平移聚焦。',
    zoomIn: '放大视图',
    zoomOut: '缩小视图',
    zoomReset: '重置缩放',
    dbScaleLabel: '刻度：',
    toggleCurveEq: 'EQ 曲线',
    toggleCurveNet: '净输出',
    toggleCurveBaseline: '0 dB 基准线',
    toggleCurveRta: '实时光谱',
    toggleCurveNodes: '调节节点',
    freqFocusSliderLabel: '频段聚焦滑块：',
    freqFocusCenter: '中心：',
    freqFocusVisible: '显示范围：',
    zoomLevelLabel: '缩放：',
    focusActiveBtn: '🎯 聚焦当前点',

    // Fixes List
    step4Title: '已应用的 EQ 修正清单',
    clearAll: '清空当前配置',
    undoBtn: '撤销',
    undoTooltip: '撤销上一次修改 (Ctrl/Cmd+Z)',
    confirmClear: '确定要清空当前设备配置下的所有已应用的调音修正吗？',
    noFixesYet: '当前配置尚未添加任何修正。请在步骤 1 中扫描频段，如果发现刺耳或凹陷频点，暂停并在步骤 2 中进行调节。',
    peakCut: '削减尖峰',
    dipBoost: '提升凹陷',
    listenTooltip: '跳转至此频点并试听',
    deleteTooltip: '删除该项修正',

    // Profiles Manager
    profileDefault: '默认配置',
    profileIEM: '入耳式耳机 / AirPods',
    profileOverEar: '头戴式大耳机',
    profileSpeakers: '桌面音箱',
    addProfile: '+ 新建设备配置',
    renameProfile: '重命名当前配置',
    deleteProfile: '删除当前配置',
    promptProfileName: '请输入新设备配置名称 (例如：森海 HD600、AirPods Pro、桌面音箱)：',

    // Workflow Stepper & Responsive Guide
    stepperTitle: '新手 4 步调音向导：',
    stepperStep1: '1. 扫频找峰',
    stepperStep2: '2. 修正分贝',
    stepperStep3: '3. 音乐试听',
    stepperStep4: '4. 曲线与导出',
    toggleLandmarksShow: '展开全部 54 个声学关键频点',
    toggleLandmarksHide: '折叠声学关键频点 (精简视图)',
    step4SectionTitle: '步骤 4：实时频响修正曲线',
    step5SectionTitle: '步骤 5：已生效修正清单',

    // Export & Import Modal
    exportModalTitle: '导出与反向导入 EQ 调音配置',
    tabWindows: 'Windows (Peace / APO)',
    tabAndroid: 'Android (Wavelet / Poweramp)',
    tabUniversal: 'Mac / 硬件参数表格',
    tabImport: '文件直传导入 / 粘贴',
    apoTitle: 'Equalizer APO & Peace GUI (Windows 平台)',
    apoDesc: '打开 Peace GUI 或 Equalizer APO，将下方配置复制粘贴到 config.txt 或导入到 Peace 参数均衡器中。',
    waveletTitle: 'Wavelet & Poweramp 均衡器 (安卓平台)',
    waveletDesc: '可将此文件导入 Wavelet (AutoEq 导入) 或 Poweramp 均衡器中，实现手机全局调音修正。',
    tableTitle: '通用参数表 (SoundSource, eqMac, Qudelix-5K, MiniDSP)',
    tableDesc: '直接将以下频率(Hz)、增益(dB)、Q值填入 Mac 版 SoundSource、eqMac 或蓝牙解码耳放(Qudelix, BTR)等硬件中。',
    downloadFile: '下载配置文件',
    copyClipboard: '复制到剪贴板',
    copiedSuccess: '已成功复制到剪贴板！',
    preampSetting: '数字动态余量 / 前级负增益 (Preamp)：',
    autoPreampLabel: '自动防削波动态余量保护 (当有频点提升时，自动设置负 Preamp 防止爆音破音)',
    importTitle: '导入已有 EQ 配置文件或代码：',
    importDesc: '可直接拖入已有 EQ 配置文件进行秒级解析，或直接粘贴代码行导入当前设备配置中：',
    importDropzone: '点击选择文件，或直接拖拽 EQ 配置文件到此处',
    importDropzoneFormats: '支持格式：.txt (Equalizer APO / Peace / Wavelet / REW), .json, .csv, .req',
    importOrPasteSnippet: '或者直接在此处粘贴文本代码片段：',
    importPlaceholder: '例如：\nPreamp: -3.5 dB\nFilter 1: ON PK Fc 120 Hz Gain 3.0 dB Q 1.41\nFilter 2: ON PK Fc 6200 Hz Gain -4.0 dB Q 4.5',
    importBtn: '解析并应用到当前设备配置',
    importSuccess: '成功解析并导入 EQ 配置！',
    importError: '未能在文件中找到有效的 Filter 参数行，请检查文件格式。',
    importFileSummary: '已成功读取文件：',

    // Keyboard Shortcuts Modal
    shortcutsTitle: '调音键盘快捷键秘籍 (闭眼盲听必备)',
    shortcutSpaceDesc: '播放 / 暂停纯音扫频或音乐试听',
    shortcutArrowsLRDesc: '左 / 右方向键微调频率 (±10 Hz)',
    shortcutArrowsShiftLRDesc: 'Shift + 左 / 右方向键快速跳转频率 (±100 Hz)',
    shortcutArrowsUDSDesc: '上 / 下方向键调节当前频点的增益分贝 (±0.5 dB)',
    shortcutBDesc: '一键 A/B 对比切换 (切换 EQ 修正 / 原声直通)',
    shortcutSDesc: '开启 / 暂停自动频段扫描',
    shortcutUndoDesc: '撤销上一次 EQ 修改（新增、调整、删除、清空或导入）',
    shortcutRedoDesc: '重做上一次已撤销的 EQ 修改',
    shortcut1Desc: '标记尖峰/凹陷的起始频率 [1] (用于测算 Q 值)',
    shortcut2Desc: '标记尖峰/凹陷的最高中心点 [2] (用于测算 Q 值)',
    shortcut3Desc: '标记尖峰/凹陷的结束恢复点 [3] (用于测算 Q 值)',
    shortcutCloseBtn: '我知道了',

    // Feedback Toast
    toastUndo: '已撤销 EQ 修改',
    toastRedo: '已重做 EQ 修改',
    toastMarkedStart: '已标记起始点：',
    toastMarkedTop: '已标记尖峰点：',
    toastMarkedEnd: '已标记结束点：',
    toastAppliedQ: '已载入步骤 2：',

    // Help Modal
    helpModalTitle: '耳机与音箱 EQ 调音入门指南',
    helpStep1Title: '1. 戴上耳机，点击“播放纯音”',
    helpStep1Desc: '请先将音量调至适中且舒适的水平。此时您将听到纯净且连贯的正弦单音频信号。',
    helpStep2Title: '2. 移动滑块扫频，寻找刺耳峰或凹陷点',
    helpStep2Desc: '缓慢拖动滑块从 20 Hz 扫向 20,000 Hz，或直接开启“自动扫频”。请仔细感受：是否有某个频段突然异常刺耳啸叫（高频毛刺峰），或是突然沉寂听不清（频响下陷）？',
    helpStep3Title: '3. 发现异常频点，当场调整分贝',
    helpStep3Desc: '在刺耳处暂停，点击“太响/刺耳”，向下拉动 dB 滑块，直至这个音高的响度与周围频段听起来一样平滑均衡。',
    helpStep4Title: '4. 用真实音乐验证并一键导出',
    helpStep4Desc: '点击步骤 3 的试音曲目或上传您自己的歌曲，边听边按“A/B对比”感受音质提升。满意后点击“导出”，即可应用到各类专业 EQ 软件中！',
    helpCloseBtn: '了解，开始调音！',

    // Footer
    footerText: '耳机与音箱 EQ 频响调音器 • 支持 Equalizer APO、Wavelet 及专业参数均衡器',
    githubRepo: 'GitHub 开源项目',
  },
};
