import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useSFX } from '../hooks/useSFX';

interface BootScreenProps {
  onBootComplete: () => void;
  backendUrl: string;
}

export default function BootScreen({ onBootComplete, backendUrl }: BootScreenProps) {
  const { playBootSound } = useSFX();
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Conectando ao Moby Engine...");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let interval: any;
    let isMounted = true;

    const startBootProcess = async () => {
      // Step 1: Animate progress bar simulating console BIOS initialization
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 5;
        });
      }, 70);

      // Step 2: Ping backend health endpoint
      try {
        const res = await fetch(`${backendUrl}/health`, { signal: AbortSignal.timeout(3500) });
        if (res.ok && isMounted) {
          setStatusMsg("Motor Pronto! Licensed by BRUH LTDA.");
        } else if (isMounted) {
          setStatusMsg("Servidor em repouso. Ativando Modo Demo...");
        }
      } catch {
        if (isMounted) {
          setStatusMsg("Modo de alta performance ativo.");
        }
      }

      // Step 3: Complete progress bar, play Y2K boot chime & unlock main UI
      setTimeout(() => {
        if (isMounted) {
          setProgress(100);
          setReady(true);
          playBootSound();
          setTimeout(() => {
            onBootComplete();
          }, 800);
        }
      }, 1400);
    };

    startBootProcess();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [backendUrl, onBootComplete]);

  const handleScreenClick = () => {
    playBootSound();
  };

  return (
    <div 
      onClick={handleScreenClick}
      className="fixed inset-0 z-50 bg-[#0e1b38] text-white flex flex-col items-center justify-between p-6 select-none font-sans overflow-hidden cursor-pointer"
    >

      {/* Background Pixel Stars */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-12 left-1/4 text-yellow-300 animate-pulse text-xs">✦</div>
        <div className="absolute top-24 right-1/3 text-cyan-300 animate-bounce text-sm">★</div>
        <div className="absolute top-1/2 left-12 text-yellow-200 animate-pulse text-xs">✦</div>
        <div className="absolute bottom-20 right-16 text-cyan-200 animate-ping text-xs">★</div>
      </div>

      {/* Top Publisher Brand */}
      <div className="w-full max-w-xl text-center space-y-1 pt-4">
        <div className="inline-flex items-center gap-2 bg-black/40 border border-cyan-500/40 px-4 py-1 rounded-full text-xs font-pixel text-cyan-300 tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber animate-spin" />
          <span>LICENSED BY BRUH LTDA</span>
        </div>
      </div>

      {/* Center Mascot & Logo */}
      <div className="flex flex-col items-center justify-center space-y-6 max-w-md my-auto text-center">

        {/* Animated Floating Whale */}
        <div className="relative group">
          <div className="w-32 h-32 bg-chrome-indigo/80 rounded-2xl bevel-card flex items-center justify-center relative shadow-[0_0_30px_rgba(139,161,212,0.4)] animate-bounce">
            {/* Water Spray */}
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-pulse">💦</span>
            <div className="text-7xl transform -scale-x-100 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              🐋
            </div>
          </div>
          {/* Platform Glow */}
          <div className="w-28 h-4 bg-cyan-500/20 rounded-full blur-md mx-auto mt-2 animate-pulse"></div>
        </div>

        {/* Console Box-Art Title */}
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black tracking-tighter text-white text-retro-hero italic">
            moby<span className="text-primary italic">P3</span>
          </h1>
          <p className="text-xs font-pixel text-amber tracking-widest uppercase">
            Navegando Pela Internet
          </p>
        </div>

        {/* LED Segmented Progress Bar */}
        <div className="w-full space-y-2 bg-black/50 p-4 rounded-lg border-2 border-chrome-indigo shadow-inner">
          <div className="flex justify-between items-center text-[10px] font-pixel text-gray-300">
            <span className="text-cyan-400">BOOTING SYSTEM...</span>
            <span className="text-amber font-bold">{progress}%</span>
          </div>

          {/* LED Blocks Container */}
          <div className="w-full h-5 bg-carbon rounded p-0.5 border border-gray-700 flex gap-0.5 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => {
              const isFilled = (i + 1) * 5 <= progress;
              return (
                <div
                  key={i}
                  className={`flex-1 h-full rounded-xs transition-colors duration-150 ${isFilled
                      ? i > 14
                        ? 'bg-signal shadow-[0_0_8px_#f68d1f]'
                        : 'bg-amber shadow-[0_0_6px_#ecab37]'
                      : 'bg-gray-800'
                    }`}
                />
              );
            })}
          </div>

          <div className="text-xs font-medium text-gray-300 flex items-center justify-center gap-1.5 pt-1">
            {ready ? (
              <span className="text-green-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> ENGINE PRONTO! ENTRANDO...
              </span>
            ) : (
              <span className="animate-pulse">{statusMsg}</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="w-full text-center border-t border-cyan-900/50 pt-3 text-[10px] text-gray-400 font-mono space-y-0.5">
        <p className="text-cyan-400/80 font-bold tracking-wider uppercase">
          LICENSED BY BRUH LTDA
        </p>
        <p>© 2001-2026 BRUH ENTERTAINMENT CO. ALL RIGHTS RESERVED.</p>
      </div>

    </div>
  );
}
