import React from 'react';
import { X, Headphones, Search, Sliders, CheckCircle2, ArrowRight } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="bg-studio-panel border border-studio-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-studio-border bg-studio-surface">
          <div className="flex items-center space-x-2">
            <Headphones className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              How to Fix Headphone & Speaker Sound
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/40">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm mb-0.5">
                Put On Your Headphones & Hit "Play Tone"
              </h4>
              <p className="text-slate-400">
                Ensure volume is at a moderate, comfortable level. You'll hear a smooth, continuous pure tone.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/40">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm mb-0.5">
                Scan Frequencies to Find Peaks or Dips
              </h4>
              <p className="text-slate-400">
                Slowly drag the slider from 20 Hz to 20,000 Hz, or click <strong>Auto-Scan</strong>. Listen carefully: does any frequency suddenly sound <em>shriekingly loud</em> (a harsh treble peak) or <em>barely audible</em> (a recessed dip)?
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/40">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm mb-0.5">
                Adjust dB On The Spot
              </h4>
              <p className="text-slate-400">
                Hit pause at that frequency! Click <strong>"Too Loud (Cut Peak)"</strong> and adjust the dB slider down until that pitch sounds equal in volume to the frequencies around it.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/40">
              4
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm mb-0.5">
                Compare & Export
              </h4>
              <p className="text-slate-400">
                Use the <strong>A/B Compare</strong> button to hear the difference between your fixes and original sound. When happy, click <strong>Export Fixes</strong> and paste into Equalizer APO, Peace, or Wavelet!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-2 w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            Got It, Let's Start Listening!
          </button>
        </div>
      </div>
    </div>
  );
};
