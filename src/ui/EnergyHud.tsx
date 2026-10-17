import React, { useRef, useEffect } from 'react';
import { useSimulationStore } from '../core/useSimulationStore';
import { useSceneStore } from '../core/useSceneStore';
import { Activity, Flame, ShieldAlert, Sparkles } from 'lucide-react';

export const EnergyHud: React.FC = () => {
  const showEnergyHud = useSimulationStore((state) => state.showEnergyHud);
  const telemetry = useSimulationStore((state) => state.telemetry);
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId);
  const objects = useSceneStore((state) => state.objects);

  // Pick target object (either selected or first dynamic object)
  const targetId = selectedObjectId || objects.find((o) => !o.isStatic)?.id || objects[0]?.id;
  const currentTelemetry = targetId ? telemetry[targetId] : null;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<{ ke: number; pe: number; total: number }[]>([]);

  const ke = currentTelemetry?.kineticEnergy || 0;
  const pe = currentTelemetry?.potentialEnergy || 0;
  const total = ke + pe;

  const kePercent = total > 0 ? Math.min(100, Math.max(0, (ke / total) * 100)) : 0;
  const pePercent = total > 0 ? Math.min(100, Math.max(0, (pe / total) * 100)) : 0;

  // Record history for sparkline
  useEffect(() => {
    historyRef.current.push({ ke, pe, total });
    if (historyRef.current.length > 70) {
      historyRef.current.shift();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Subtle baseline
    ctx.strokeStyle = 'rgba(240, 230, 216, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 1);
    ctx.lineTo(width, height - 1);
    ctx.stroke();

    const maxVal = Math.max(15, ...historyRef.current.map((h) => Math.max(h.total, h.ke, h.pe)));

    // Draw Potential Energy curve (Rosewood #7D4047)
    ctx.strokeStyle = '#7D4047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    historyRef.current.forEach((pt, i) => {
      const x = (i / 70) * width;
      const y = height - (pt.pe / maxVal) * (height - 6) - 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Kinetic Energy curve (Olive #6F7F5F)
    ctx.strokeStyle = '#6F7F5F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    historyRef.current.forEach((pt, i) => {
      const x = (i / 70) * width;
      const y = height - (pt.ke / maxVal) * (height - 6) - 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Total Energy dashed line
    ctx.strokeStyle = 'rgba(240, 230, 216, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    historyRef.current.forEach((pt, i) => {
      const x = (i / 70) * width;
      const y = height - (pt.total / maxVal) * (height - 6) - 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }, [ke, pe, total]);

  if (!showEnergyHud) return null;

  return (
    <div className="absolute top-16 left-6 w-80 glass-panel rounded-xl p-4 shadow-glass border border-greige-border pointer-events-auto transition-all animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#19E3F5]" />
          <span className="text-xs uppercase tracking-wider font-mono font-semibold text-limestone">
            Energy Spectrum
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-limestone-muted border border-white/5">
          {targetId ? objects.find((o) => o.id === targetId)?.name : 'System'}
        </span>
      </div>

      {/* Numerical Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-black/30 rounded-lg p-2 border border-olive/30">
          <div className="text-[10px] font-mono text-olive uppercase tracking-tight">Kinetic (KE)</div>
          <div className="text-sm font-mono font-bold text-limestone mt-0.5">
            {ke.toFixed(1)} <span className="text-[10px] font-normal text-limestone-muted">J</span>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-2 border border-rosewood/30">
          <div className="text-[10px] font-mono text-rosewood uppercase tracking-tight">Potential (PE)</div>
          <div className="text-sm font-mono font-bold text-limestone mt-0.5">
            {pe.toFixed(1)} <span className="text-[10px] font-normal text-limestone-muted">J</span>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-2 border border-white/10">
          <div className="text-[10px] font-mono text-limestone-muted uppercase tracking-tight">Total (E)</div>
          <div className="text-sm font-mono font-bold text-limestone mt-0.5">
            {total.toFixed(1)} <span className="text-[10px] font-normal text-limestone-muted">J</span>
          </div>
        </div>
      </div>

      {/* Dynamic Split Ratio Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] font-mono mb-1 text-limestone-muted">
          <span className="text-olive flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-olive inline-block"></span>
            KE: {kePercent.toFixed(0)}%
          </span>
          <span className="text-rosewood flex items-center gap-1">
            PE: {pePercent.toFixed(0)}%
            <span className="w-2 h-2 rounded-full bg-rosewood inline-block"></span>
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden flex border border-white/10 p-0.5">
          <div
            className="h-full bg-olive transition-all duration-150 rounded-l-full shadow-olive-glow"
            style={{ width: `${kePercent}%` }}
          />
          <div
            className="h-full bg-rosewood transition-all duration-150 rounded-r-full shadow-rosewood-glow"
            style={{ width: `${pePercent}%` }}
          />
        </div>
      </div>

      {/* Real-time Sparkline Graph */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono text-limestone-muted mb-1">
          <span>Real-time Waveform</span>
          <div className="flex items-center gap-2">
            <span className="text-olive text-[9px]">• KE</span>
            <span className="text-rosewood text-[9px]">• PE</span>
            <span className="text-limestone/50 text-[9px]">• Total</span>
          </div>
        </div>
        <div className="bg-black/40 rounded-lg p-1 border border-white/5 overflow-hidden">
          <canvas ref={canvasRef} width={280} height={52} className="w-full h-12 block" />
        </div>
      </div>
    </div>
  );
};
