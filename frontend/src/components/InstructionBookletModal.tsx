import React from 'react';
import { X, HelpCircle, ShieldCheck, Zap, Music, Video, ListMusic, Scissors, HardDrive, CheckCircle2 } from 'lucide-react';

interface InstructionBookletModalProps {
  onClose: () => void;
  playClick?: () => void;
}

export default function InstructionBookletModal({ onClose, playClick }: InstructionBookletModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 selection:bg-signal selection:text-white animate-fade-in font-sans">
      
      {/* Retro Game Instruction Booklet Window */}
      <div className="bg-periwinkle max-w-2xl w-full rounded-md bevel-chassis shadow-2xl overflow-hidden text-carbon max-h-[90vh] flex flex-col">
        
        {/* Carbon Header */}
        <div className="bg-halftone text-surface p-3 flex items-center justify-between border-b-2 border-chrome-indigo flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber text-carbon font-pixel flex items-center justify-center font-bold text-sm shadow-md animate-pulse">
              !
            </div>
            <span className="text-xs font-bold text-amber uppercase font-pixel tracking-wider">
              📜 MANUAL DE INSTRUÇÕES & GUIA DO SISTEMA
            </span>
          </div>

          <button
            onClick={() => { playClick?.(); onClose(); }}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-3 py-1 rounded-sm bevel-card flex items-center gap-1 shadow-bevel-btn"
          >
            <X className="w-4 h-4" />
            <span>[ X ] FECHAR</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Section 1: Como Funciona */}
          <div className="bg-surface p-4 rounded-sm bevel-inset space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-300 pb-2">
              <Zap className="w-5 h-5 text-signal" />
              <h3 className="text-sm font-bold text-carbon uppercase font-pixel">
                1. COMO FUNCIONA O MOBYP3?
              </h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              O **mobyP3** é um utilitário de alta performance livre de vírus, anúncios ou pop-ups. 
              Ele utiliza uma arquitetura descentralizada com o motor <strong>FastAPI + yt-dlp + FFmpeg</strong> para extrair áudios e vídeos diretamente das plataformas sem redirecionamentos externos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <div className="bg-platinum p-2 rounded text-[11px] font-bold space-y-1">
                <span className="text-signal font-pixel">PASSO 1:</span>
                <p className="font-normal text-gray-800">Cole a URL do vídeo/música ou clique no botão Amber <i>"Colar Link"</i>.</p>
              </div>
              <div className="bg-platinum p-2 rounded text-[11px] font-bold space-y-1">
                <span className="text-signal font-pixel">PASSO 2:</span>
                <p className="font-normal text-gray-800">A Moby Engine analisa os formatos e disponibiliza as faixas de MP3 e vídeos em 1080p/4K.</p>
              </div>
              <div className="bg-platinum p-2 rounded text-[11px] font-bold space-y-1">
                <span className="text-signal font-pixel">PASSO 3:</span>
                <p className="font-normal text-gray-800">Assista à previsualização em 360p ou baixe o arquivo completo via Blob Fetch direto.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Sites e Plataformas Suportadas */}
          <div className="bg-surface p-4 rounded-sm bevel-inset space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-300 pb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-bold text-carbon uppercase font-pixel">
                2. SITES & PLATAFORMAS ACEITAS (+1000)
              </h3>
            </div>
            <p className="text-xs text-gray-700">
              O sistema detecta automaticamente o domínio colado e aplica os melhores seletores de qualidade:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold font-pixel">
              <div className="bg-red-100 text-red-700 p-2 rounded border border-red-300 flex items-center gap-1">
                <span>🔴 YOUTUBE</span>
              </div>
              <div className="bg-black text-cyan-400 p-2 rounded border border-cyan-400 flex items-center gap-1">
                <span>🎵 TIKTOK</span>
              </div>
              <div className="bg-orange-100 text-orange-700 p-2 rounded border border-orange-300 flex items-center gap-1">
                <span>🟧 SOUNDCLOUD</span>
              </div>
              <div className="bg-pink-100 text-pink-700 p-2 rounded border border-pink-300 flex items-center gap-1">
                <span>📷 INSTAGRAM</span>
              </div>
              <div className="bg-blue-100 text-blue-700 p-2 rounded border border-blue-300 flex items-center gap-1">
                <span>🔵 VIMEO</span>
              </div>
              <div className="bg-purple-100 text-purple-700 p-2 rounded border border-purple-300 flex items-center gap-1">
                <span>💜 TWITCH</span>
              </div>
              <div className="bg-gray-100 text-gray-800 p-2 rounded border border-gray-300 flex items-center gap-1">
                <span>🐦 TWITTER / X</span>
              </div>
              <div className="bg-amber/20 text-carbon p-2 rounded border border-amber flex items-center gap-1">
                <span>🌐 +1000 OUTROS</span>
              </div>
            </div>
          </div>

          {/* Section 3: Recursos Especiais de Console */}
          <div className="bg-surface p-4 rounded-sm bevel-inset space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-300 pb-2">
              <HardDrive className="w-5 h-5 text-amber" />
              <h3 className="text-sm font-bold text-carbon uppercase font-pixel">
                3. RECURSOS ESPECIAIS & HARDWARE 8-BIT
              </h3>
            </div>

            <ul className="space-y-2 text-xs text-gray-800">
              <li className="flex items-start gap-2">
                <span className="text-signal font-bold">•</span>
                <div>
                  <strong className="text-chrome-indigo">Memory Card PS1/GameCube:</strong> Salva automaticamente os últimos 15 links buscados no seu navegador sem enviar dados a servidores externos.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-signal font-bold">•</span>
                <div>
                  <strong className="text-chrome-indigo">Sintetizador 8-Bit (useSFX):</strong> Efeitos sonoros sintetizados nativamente via Web Audio API (botão de ligar/desligar no topo).
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-signal font-bold">•</span>
                <div>
                  <strong className="text-chrome-indigo">Mini Editor de Corte (Trimming):</strong> Na modal de preview, altere os tempos de início/fim para cortar um snippet em MP3 ou MP4.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-signal font-bold">•</span>
                <div>
                  <strong className="text-chrome-indigo">Capas 4K & Legendas (.srt):</strong> Baixe a imagem do vídeo na resolução máxima e arquivos de legenda sincronizada.
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-halftone p-3 text-center text-[10px] text-gray-400 font-pixel border-t border-chrome-indigo flex-shrink-0 flex items-center justify-between">
          <span>LICENSED BY BRUH LTDA</span>
          <button
            onClick={() => { playClick?.(); onClose(); }}
            className="bg-amber text-carbon px-4 py-1.5 rounded font-bold uppercase hover:bg-amber/90"
          >
            Entendido! [ FECHAR ]
          </button>
        </div>

      </div>
    </div>
  );
}
