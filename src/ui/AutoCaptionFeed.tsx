import React from 'react';
import { useSimulationStore } from '../core/useSimulationStore';
import { MessageSquareText, Sparkles, X } from 'lucide-react';
import { KaTeXBlock } from './KaTeXBlock';

export const AutoCaptionFeed: React.FC = () => {
  const showCaptions = useSimulationStore((state) => state.showCaptions);
  const captions = useSimulationStore((state) => state.captions);
  const clearCaptions = useSimulationStore((state) => state.clearCaptions);
  const toggleCaptions = useSimulationStore((state) => state.toggleCaptions);

  if (!showCaptions || captions.length === 0) return null;

  return (
    <div className="absolute bottom-28 left-6 max-w-md w-full glass-panel rounded-xl p-3 shadow-glass border border-greige-border pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-limestone">
          <Sparkles className="w-3.5 h-3.5 text-[#19E3F5]" />
          <span>Physics Explanation Stream</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearCaptions}
            className="text-[10px] text-limestone-muted hover:text-limestone transition-colors font-mono"
          >
            Clear
          </button>
          <button
            onClick={toggleCaptions}
            className="text-limestone-muted hover:text-limestone transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Caption list */}
      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
        {captions.map((cap) => (
          <div
            key={cap.id}
            className={`text-xs p-2 rounded-lg border leading-relaxed ${
              cap.severity === 'highlight'
                ? 'bg-racing-red/10 border-racing-red/30 text-limestone'
                : 'bg-black/25 border-white/5 text-limestone-muted'
            }`}
          >
            <div className="flex items-start gap-1.5">
              <span className="text-[#19E3F5] text-[10px] font-mono mt-0.5">•</span>
              <div>
                <p className="text-limestone">{cap.text}</p>
                {cap.latex && (
                  <div className="mt-1 pt-1 border-t border-white/5">
                    <KaTeXBlock math={cap.latex} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
