import React from 'react';
import { Viewport3D } from './components/Viewport3D';
import { TopNavigation } from './ui/TopNavigation';
import { TimelineBar } from './ui/TimelineBar';
import { EnergyHud } from './ui/EnergyHud';
import { LiveMathOverlay } from './ui/LiveMathOverlay';
import { AutoCaptionFeed } from './ui/AutoCaptionFeed';
import { PropertiesInspector } from './ui/PropertiesInspector';
import { Info } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#121212] font-sans">
      {/* 3D Interactive WebGL Physics Viewport */}
      <Viewport3D />

      {/* Floating Glassmorphism UI Hierarchy */}
      <TopNavigation />
      <EnergyHud />
      <LiveMathOverlay />
      <AutoCaptionFeed />
      <PropertiesInspector />
      <TimelineBar />

      {/* Subtle Bottom-Right Shortcut Hint */}
      <div className="absolute bottom-6 right-6 hidden xl:flex items-center gap-3 text-[11px] font-mono text-limestone-muted/70 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 pointer-events-none">
        <Info className="w-3.5 h-3.5 text-[#19E3F5]/70" />
        <span>[Space] Play/Pause</span>
        <span>•</span>
        <span>[R] Reset</span>
        <span>•</span>
        <span>[Click] Select</span>
        <span>•</span>
        <span>[Drag] Orbit Camera</span>
      </div>
    </div>
  );
};

export default App;
