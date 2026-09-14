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
3. **Compare in 1 Click**: Hit **A/B Compare** to instantly audition your fixes versus the original sound.
4. **1-Click Export**: Export your corrections ready to paste into **Equalizer APO / Peace GUI** (Windows), **Wavelet / Poweramp** (Android), or **SoundSource / eqMac** (macOS).

---

## 🔍 Features
- **Pure Tone Generator**: Web Audio API oscillator with anti-pop ramped gain changes to protect ears and hardware.
- **Auto-Scan Glider**: Hands-free frequency walking with *Slow*, *Normal*, and *Fast* speeds so you can close your eyes and listen for peaks.
- **54 Exact Frequency Landmarks**: Quick-jump cards covering:
  - **Bass (< 250 Hz)**: Sub rumble, deep bass, kick thump (30 Hz, 50 Hz, 80 Hz, 125 Hz, 200 Hz).
  - **Mids (250 Hz – 2 kHz)**: Muddiness, cardboard boxiness, vocal warmth, nasal tones (300 Hz, 450 Hz, 650 Hz, 850 Hz, 1 kHz, 1.5 kHz, 2 kHz).
  - **Every 0.5 kHz from 1.0 kHz to 20.0 kHz**: Granular targeting for ear canal gain, pinna peak, vocal clarity, harshness, and sibilance spikes.
- **Real-Time 60 FPS Visual EQ Curve**: Visual display showing all your active cuts and boosts.
- **Ear Protection Limiter**: Built-in dynamics safety compressor (`DynamicsCompressorNode`) prevents accidental volume blasts.
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

---

## 📄 License
MIT License.
