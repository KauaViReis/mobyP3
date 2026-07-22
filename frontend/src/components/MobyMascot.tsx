import React from 'react';
import { Sparkles } from 'lucide-react';

export type MobyState = 'sleeping' | 'searching' | 'ready' | 'error';

interface MobyMascotProps {
  state: MobyState;
  customMsg?: string;
}

export default function MobyMascot({ state, customMsg }: MobyMascotProps) {
  const getMascotDetails = () => {
    switch (state) {
      case 'sleeping':
        return {
          badge: '💤 REPOUSO',
          badgeColor: 'bg-amber text-carbon',
          accessory: '💤',
          speech: customMsg || 'Acordando os motores no servidor... Aguarde só um instante!',
          anim: 'animate-pulse'
        };
      case 'searching':
        return {
          badge: '🕶️ ESCANEANDO',
          badgeColor: 'bg-blue-600 text-white',
          accessory: '🕶️',
          speech: customMsg || 'Escaneando a plataforma de vídeo e extraindo os formatos em alta qualidade...',
          anim: 'animate-bounce'
        };
      case 'ready':
        return {
          badge: '🎧 PRONTO',
          badgeColor: 'bg-green-600 text-white',
          accessory: '🎧',
          speech: customMsg || 'Música/Vídeo pronto para extração! Escolha a qualidade abaixo.',
          anim: 'hover:scale-110 transition-transform'
        };
      case 'error':
        return {
          badge: '❓ ERRO',
          badgeColor: 'bg-primary text-white',
          accessory: '❓',
          speech: customMsg || 'Ops! Acho que essa URL está incorreta ou o vídeo é privado.',
          anim: 'animate-wiggle'
        };
      default:
        return {
          badge: '🐋 MOBY',
          badgeColor: 'bg-chrome-indigo text-white',
          accessory: '✨',
          speech: 'Bem-vindo ao mobyP3! Baixe sem vírus!',
          anim: ''
        };
    }
  };

  const info = getMascotDetails();

  return (
    <div className="flex items-center gap-3">
      {/* Mascot Card Icon */}
      <div className="relative">
        <div className={`w-14 h-14 bg-chrome-indigo rounded-lg bevel-card flex items-center justify-center shadow-hard-drop relative group ${info.anim}`}>
          <div className="text-3xl transform -scale-x-100 relative">
            🐋
          </div>
          {/* Overlay Accessory */}
          <span className="absolute -top-2 -right-1 text-sm bg-carbon/80 rounded-full px-1 border border-white/40">
            {info.accessory}
          </span>
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="bg-surface text-carbon px-3 py-2 rounded-lg bevel-card relative text-xs max-w-[440px] shadow-sm">
        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-surface border-b-[6px] border-b-transparent"></div>
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="font-bold text-chrome-indigo flex items-center gap-1">
            <span>Moby Dick</span>
            <Sparkles className="w-3 h-3 text-amber fill-amber inline" />
          </p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-pixel ${info.badgeColor}`}>
            {info.badge}
          </span>
        </div>
        <p className="text-[11px] text-gray-800 leading-tight">
          {info.speech}
        </p>
      </div>
    </div>
  );
}
