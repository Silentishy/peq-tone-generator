# 🎧 Headphone & Speaker EQ Fixer (PEQ Tone Lab)

[English](README.md) | [简体中文](README_zh.md)

> A simple, beginner-friendly tone generator and parametric EQ assistant designed to detect and fix harsh peaks or quiet recesses in headphones, earphones, and speakers.

---

## 🚀 Live Demo
**[Launch App on GitHub Pages](https://silentishy.github.io/peq-tone-generator/)**

---

## ✨ Why This App?
Most acoustic analysis tools (REW, DAWs, VST plugins) are filled with complex DSP jargon, octave equations, and confusing interfaces. 

This app is designed specifically for **regular listeners** who just want their headphones to sound great:
1. **Scan & Listen**: Glide smoothly across frequencies (20 Hz to 20,000 Hz) using a pure, click-free sine wave or the **Auto-Scan** glider.
2. **Fix On The Spot**: When a frequency sounds piercingly loud (a harsh treble peak) or too quiet (a recessed dip), stop and adjust the dB right there until it sounds balanced with the surrounding frequencies.
3. **Audition on Your Music**: Upload your favorite audio tracks (MP3, WAV, FLAC, etc.) and play them directly through the EQ filter bank with scrub control and looping.
4. **Compare in 1 Click**: Hit **A/B Compare** while your music plays to instantly audition your fixes versus the original uncorrected sound.
5. **1-Click Export**: Export your corrections ready to paste into **Equalizer APO / Peace GUI** (Windows), **Wavelet / Poweramp** (Android), or **SoundSource / eqMac** (macOS).

---

## 🔍 Features
- **Own Music Upload & Audition**: Drag-and-drop or select your own songs to hear how your EQ profile sounds on real music with instantaneous A/B bypass comparison.
- **Pure Tone Generator**: Web Audio API oscillator with anti-pop ramped gain changes to protect ears and hardware.
- **Auto-Scan Glider**: Hands-free frequency walking with *Slow*, *Normal*, and *Fast* speeds so you can close your eyes and listen for peaks.
- **54 Exact Frequency Landmarks**: Quick-jump cards covering:
  - **Bass (< 250 Hz)**: Sub rumble, deep bass, kick thump (30 Hz, 50 Hz, 80 Hz, 125 Hz, 200 Hz).
  - **Mids (250 Hz – 2 kHz)**: Muddiness, cardboard boxiness, vocal warmth, nasal tones (300 Hz, 450 Hz, 650 Hz, 850 Hz, 1 kHz, 1.5 kHz, 2 kHz).
  - **Every 0.5 kHz from 1.0 kHz to 20.0 kHz**: Granular targeting for ear canal gain, pinna peak, vocal clarity, harshness, and sibilance spikes.
- **3-Point Q Finder (eqbyear method)**: Mark Start `[1]`, Peak/Center `[2]`, and End `[3]` directly while sweeping frequencies to calculate exact filter bandwidth and Q value ($Q = f_c / \Delta f$), complete with visual slider indicators, curve overlay pins, and 1-click apply to Step 2.
- **Click-Free Tone Engine & Pre-Filter Preamp**: 15 ms linear anti-pop gain ramps eliminate DC stop/play clicks; preamp is applied prior to biquad filters to guarantee zero internal digital clipping.
- **Transparent Brickwall Safety Ceiling**: High-precision `WaveShaperNode` ceiling curve (-0.5 dBFS) protects hearing and hardware without dynamic compressor pumping.
- **Bilingual Interface**: Seamless 1-click language dropdown between English and 简体中文.
- **Export Formats**:
  - Equalizer APO / Peace GUI (`config.txt`)
  - Wavelet AutoEq & Poweramp Equalizer
  - Universal Markdown / Text Table for SoundSource, eqMac, and hardware DACs (Qudelix-5K, MiniDSP).

---

## 🛠️ Local Development
```bash
git clone https://github.com/Silentishy/peq-tone-generator.git
cd peq-tone-generator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build
```bash
npm run build
npm run preview
```

### Tests
```bash
npm test          # run the unit test suite once (Vitest)
npm run test:watch  # re-run on file changes
```

The suite covers the parametric EQ core in `src/utils/eqMath.ts`: the Equalizer APO / Wavelet / Universal Table export formats, the reverse import parser (including bass-shelf round-trips), RBJ biquad coefficient math and stability, the analytical frequency-response evaluator, headroom/preamp calculation, and the canvas coordinate helpers. CI runs type-check, build, and tests on every push and pull request.

---

## 📄 License
MIT License.
